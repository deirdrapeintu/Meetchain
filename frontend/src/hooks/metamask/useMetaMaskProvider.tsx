"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

type State = {
  provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  accounts: string[] | undefined;
  isConnected: boolean;
  error: Error | undefined;
  connect: () => void;
};

const Ctx = createContext<State | undefined>(undefined);

export function MetaMaskProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.Eip1193Provider | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [accounts, setAccounts] = useState<string[] | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const anyWindow = window as unknown as { ethereum?: ethers.Eip1193Provider };
    if (anyWindow.ethereum) {
      setProvider(anyWindow.ethereum);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!provider) return;
    try {
      const hex = await provider.request({ method: "eth_chainId" });
      setChainId(parseInt(hex as string, 16));
      const accs = (await provider.request({ method: "eth_accounts" })) as string[];
      setAccounts(accs);
      setError(undefined);
    } catch (e) {
      setError(e as Error);
    }
  }, [provider]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const connect = useCallback(async () => {
    if (!provider) return;
    try {
      const accs = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      setAccounts(accs);
      await refresh();
    } catch (e) {
      setError(e as Error);
    }
  }, [provider, refresh]);

  const isConnected = useMemo(() => (accounts?.length ?? 0) > 0, [accounts]);

  return (
    <Ctx.Provider value={{ provider, chainId, accounts, isConnected, error, connect }}>
      {children}
    </Ctx.Provider>
  );
}

export function useMetaMask() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMetaMask must be used within MetaMaskProvider");
  return ctx;
}


