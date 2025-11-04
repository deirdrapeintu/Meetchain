"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { EventManagerABI } from "@/src/abi/EventManagerABI";
import { EventManagerAddresses } from "@/src/abi/EventManagerAddresses";
import { buildIpfsGatewayUrl } from "@/src/utils/ipfs";

export type IndexedEvent = {
  id: number;
  organizer: string;
  metadataCID: string;
  startTime: number;
  endTime: number;
  mintPOAP: boolean;
  title?: string;
  location?: string;
  description?: string;
};

export function useEventsIndex(parameters: {
  chainId: number | undefined;
  readonlyProvider: ethers.ContractRunner | undefined;
}) {
  const { chainId, readonlyProvider } = parameters;

  const [events, setEvents] = useState<IndexedEvent[]>([]);
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
      if (!emAddress || !readonlyProvider) return;
      setLoading(true); setError(undefined); setEvents([]);
      try {
        const c = new ethers.Contract(emAddress, EventManagerABI.abi, readonlyProvider);
        // nextEventId might not exist in ABI? We do have it.
        const nextId = Number(await c.nextEventId());
        const list: IndexedEvent[] = [];
        for (let id = 1; id < nextId; id++) {
          try {
            const h = await c.getEventHeader(id);
            const e = {
              id,
              organizer: h.organizer as string,
              metadataCID: h.metadataCID as string,
              startTime: Number(h.startTime),
              endTime: Number(h.endTime),
              mintPOAP: Boolean(h.mintPOAP),
            } as IndexedEvent;
            // fetch IPFS metadata (best-effort)
            try {
              const res = await fetch(buildIpfsGatewayUrl(e.metadataCID));
              if (res.ok) {
                const j = await res.json();
                e.title = j.title; e.location = j.location; e.description = j.description;
              }
            } catch {}
            list.push(e);
          } catch {}
        }
        if (!cancelled) setEvents(list);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [emAddress, readonlyProvider]);

  const now = Date.now() / 1000;
  const ongoing = useMemo(() => events.filter(e => e.startTime <= now && now <= e.endTime), [events, now]);
  const upcoming = useMemo(() => events.filter(e => now < e.startTime), [events, now]);
  const ended = useMemo(() => events.filter(e => e.endTime < now), [events, now]);

  return { events, ongoing, upcoming, ended, loading, error };
}


