"use client";

import Link from "next/link";
import { useMetaMaskEthersSigner } from "@/src/hooks/metamask/useMetaMaskEthersSigner";

export function Navbar() {
  const { isConnected, connect, accounts, chainId } = useMetaMaskEthersSigner();
  const addr = accounts?.[0];
  const short = addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
  
  return (
    <header className="w-full glass-dark sticky top-0 z-50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-techblue flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
            M
          </div>
          <span className="font-bold text-2xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            MeetChain
          </span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link 
            href="/organizer" 
            className="text-white/80 hover:text-white transition-colors font-medium"
          >
            Organizer
          </Link>
          <Link 
            href="/explore" 
            className="text-white/80 hover:text-white transition-colors font-medium"
          >
            Explore
          </Link>
          <Link 
            href="/badges" 
            className="text-white/80 hover:text-white transition-colors font-medium"
          >
            My Badges
          </Link>
          
          {isConnected ? (
            <div className="flex items-center gap-3">
              <span className="badge badge-success">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                {short}
              </span>
              <span className="badge badge-info">
                Chain {chainId}
              </span>
            </div>
          ) : (
            <button className="btn-gradient" onClick={connect}>
              🔗 Connect Wallet
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}


