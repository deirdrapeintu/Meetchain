"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { EventManagerABI } from "@/src/abi/EventManagerABI";
import { EventManagerAddresses } from "@/src/abi/EventManagerAddresses";

export type Claimable = { id: number; canClaim: boolean; hasSigned: boolean; claimed: boolean; };

export function useBadges(parameters: { chainId: number | undefined; signer: ethers.JsonRpcSigner | undefined; readonlyProvider: ethers.ContractRunner | undefined; }) {
  const { chainId, signer, readonlyProvider } = parameters;
  const [items, setItems] = useState<Claimable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const emAddress = useMemo(() => {
    if (!chainId) return undefined;
    const entry = EventManagerAddresses[chainId.toString() as keyof typeof EventManagerAddresses];
    return entry?.address && entry.address !== ethers.ZeroAddress ? entry.address : undefined;
  }, [chainId]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!emAddress || !readonlyProvider || !signer) return;
      setLoading(true); setError(undefined); setItems([]);
      try {
        const c = new ethers.Contract(emAddress, EventManagerABI.abi, readonlyProvider);
        const addr = await signer.getAddress();
        const nextId = Number(await c.nextEventId());
        const list: Claimable[] = [];
        for (let id = 1; id < nextId; id++) {
          try {
            const canClaim: boolean = await c.canClaim(id, addr);
            const hasSigned: boolean = await c.hasSigned(id, addr);
            let claimed = false;
            if (hasSigned && !canClaim) claimed = true; // heuristic
            list.push({ id, canClaim, hasSigned, claimed });
          } catch {}
        }
        if (!cancelled) setItems(list);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [emAddress, readonlyProvider, signer]);

  async function claim(eventId: number) {
    if (!emAddress || !signer) throw new Error("no signer");
    const c = new ethers.Contract(emAddress, EventManagerABI.abi, signer);
    const tx = await c.claimBadge(eventId);
    await tx.wait();
  }

  return { items, loading, error, claim };
}


