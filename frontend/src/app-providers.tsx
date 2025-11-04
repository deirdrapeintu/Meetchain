"use client";

import { MetaMaskProvider } from "@/src/hooks/metamask/useMetaMaskProvider";
import { MetaMaskEthersSignerProvider } from "@/src/hooks/metamask/useMetaMaskEthersSigner";
import React from "react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MetaMaskProvider>
      <MetaMaskEthersSignerProvider initialMockChains={{ 31337: "http://localhost:8545" }}>
        {children}
      </MetaMaskEthersSignerProvider>
    </MetaMaskProvider>
  );
}


