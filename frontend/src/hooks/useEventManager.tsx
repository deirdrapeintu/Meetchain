"use client";

import { ethers } from "ethers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FhevmInstance } from "@/src/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/src/fhevm/FhevmDecryptionSignature";
import { GenericStringInMemoryStorage } from "@/src/fhevm/GenericStringStorage";
import { EventManagerABI } from "@/src/abi/EventManagerABI";
import { EventManagerAddresses } from "@/src/abi/EventManagerAddresses";

type EventInfo = {
  id: bigint;
  organizer: string;
  metadataCID: string;
  startTime: bigint;
  endTime: bigint;
  mintPOAP: boolean;
};

export function useEventManager(parameters: {
  instance: FhevmInstance | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
}) {
  const { instance, chainId, ethersSigner, ethersReadonlyProvider } = parameters;
  const [message, setMessage] = useState("");
  const [event, setEvent] = useState<EventInfo | undefined>(undefined);
  const [countHandle, setCountHandle] = useState<string | undefined>(undefined);
  const [clearCount, setClearCount] = useState<bigint | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const storage = useRef(new GenericStringInMemoryStorage());

  const em = useMemo(() => {
    const entry = chainId ? EventManagerAddresses[chainId.toString() as keyof typeof EventManagerAddresses] : undefined;
    const address = entry?.address && entry.address !== ethers.ZeroAddress ? entry.address : undefined;
    return { abi: EventManagerABI.abi, address } as { abi: typeof EventManagerABI.abi; address?: `0x${string}` };
  }, [chainId]);

  const loadEvent = useCallback(async (eventId: number) => {
    if (!em.address || !ethersReadonlyProvider) return;
    setIsRefreshing(true);
    try {
      const c = new ethers.Contract(em.address, em.abi, ethersReadonlyProvider);
      let e: any;
      try {
        // Prefer header-only view to avoid euint decoding issues
        const header = await c.getEventHeader(eventId);
        e = header;
      } catch {
        e = await (c as any)["getEvent"](eventId);
      }
      setEvent({ id: e.id, organizer: e.organizer, metadataCID: e.metadataCID, startTime: e.startTime, endTime: e.endTime, mintPOAP: e.mintPOAP });
      const handle = await (c as any)["getEncryptedCount"](eventId);
      setCountHandle(handle);
      setMessage("");
    } catch (err) {
      setEvent(undefined);
      setCountHandle(undefined);
      setMessage("未找到该活动或读取失败。请确认 EventId 是否存在。");
    } finally { setIsRefreshing(false); }
  }, [em.address, em.abi, ethersReadonlyProvider]);

  const decryptCount = useCallback(async (): Promise<boolean> => {
    if (!em.address || !instance || !ethersSigner || !countHandle) { return false; }
    try {
      setMessage("解密中...");
      const sig = await FhevmDecryptionSignature.loadOrSign(instance, [em.address], ethersSigner, storage.current);
      if (!sig) { setMessage("无法生成解密签名"); return false; }
      const res = await instance.userDecrypt(
        [{ handle: countHandle, contractAddress: em.address }],
        sig.privateKey, sig.publicKey, sig.signature,
        sig.contractAddresses, sig.userAddress, sig.startTimestamp, sig.durationDays
      );
      const v = (res as any)[countHandle];
      const toBigInt = typeof v === "bigint" ? v : (typeof v === "number" ? BigInt(v) : BigInt(String(v)));
      setClearCount(toBigInt);
      setMessage("已解密");
      return true;
    } catch {
      setMessage("解密失败");
      return false;
    }
  }, [em.address, instance, ethersSigner, countHandle]);

  const signIn = useCallback(async (eventId: number) => {
    if (!em.address || !instance || !ethersSigner) return;
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      const c = new ethers.Contract(em.address, em.abi, ethersSigner);
      const userAddress = await ethersSigner.getAddress();
      const input = instance.createEncryptedInput(em.address, userAddress);
      input.add32(1);
      const enc = await input.encrypt();
      const tx = await c.signIn(eventId, enc.handles[0], enc.inputProof);
      await tx.wait();
      setMessage("签到成功");
      await loadEvent(eventId);
    } catch { setMessage("签到失败"); }
    finally { setIsSigningIn(false); }
  }, [em.address, em.abi, instance, ethersSigner, isSigningIn, loadEvent]);

  return { contractAddress: em.address, message, event, countHandle, clearCount, isRefreshing, isSigningIn, loadEvent, decryptCount, signIn };
}


