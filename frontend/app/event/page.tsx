"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useMetaMaskEthersSigner } from "@/src/hooks/metamask/useMetaMaskEthersSigner";
import { useFhevm } from "@/src/fhevm/useFhevm";
import { useEffect, useState } from "react";
import { useEventManager } from "@/src/hooks/useEventManager";
import { Navbar } from "@/src/components/Navbar";
import { buildIpfsGatewayUrl } from "@/src/utils/ipfs";
import { FhevmDecryptionSignature } from "@/src/fhevm/FhevmDecryptionSignature";
import { GenericStringInMemoryStorage } from "@/src/fhevm/GenericStringStorage";

function EventDetailPageInner() {
  const sp = useSearchParams();
  const idParam = sp.get("id") || "0";
  const eventId = Number(idParam);
  const { provider, chainId, ethersSigner, ethersReadonlyProvider, initialMockChains, isConnected } = useMetaMaskEthersSigner();
  const { instance } = useFhevm({ provider: provider!, chainId, enabled: true, initialMockChains });
  const em = useEventManager({ instance, chainId, ethersSigner, ethersReadonlyProvider });
  const [now, setNow] = useState<number>(Math.floor(Date.now()/1000));
  const [metaOpen, setMetaOpen] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | undefined>(undefined);
  const [meta, setMeta] = useState<{ title?: string; location?: string; description?: string } | undefined>(undefined);
  const [hasDecryptAuth, setHasDecryptAuth] = useState(false);

  useEffect(() => { 
    if (Number.isFinite(eventId) && eventId > 0) em.loadEvent(eventId); 
    const t = setInterval(()=>setNow(Math.floor(Date.now()/1000)), 1000); 
    return ()=>clearInterval(t); 
  }, [em.loadEvent, eventId]);

  const started = em.event ? Number(em.event.startTime) <= now : false;
  const ended = em.event ? now > Number(em.event.endTime) : false;
  const canSignIn = started && !ended && isConnected;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">📋 活动详情 #{eventId}</h2>
        </div>

        {em.event ? (
          <div className="space-y-6">
            <div className="card space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">活动信息</h3>
                  <div className="space-y-2 text-white/80">
                    <p><span className="text-white/60">📦 IPFS CID:</span> {em.event.metadataCID}</p>
                    <p><span className="text-white/60">👤 组织者:</span> {em.event.organizer.slice(0,6)}...{em.event.organizer.slice(-4)}</p>
                    <p><span className="text-white/60">⏰ 开始时间:</span> {new Date(Number(em.event.startTime)*1000).toLocaleString()}</p>
                    <p><span className="text-white/60">⏰ 结束时间:</span> {new Date(Number(em.event.endTime)*1000).toLocaleString()}</p>
                    <p><span className="text-white/60">🎨 POAP NFT:</span> {em.event.mintPOAP ? "✅ 启用" : "❌ 未启用"}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-3">
                  <button
                    className="btn-primary"
                    onClick={async () => {
                      if (metaOpen) { setMetaOpen(false); return; }
                      if (!hasDecryptAuth) {
                        try {
                          if (!instance || !ethersSigner || !em.contractAddress) throw new Error("no instance/signer");
                          const storage = new GenericStringInMemoryStorage();
                          const sig = await FhevmDecryptionSignature.loadOrSign(
                            instance,
                            [em.contractAddress],
                            ethersSigner,
                            storage
                          );
                          if (!sig) throw new Error("no signature");
                          setHasDecryptAuth(true);
                        } catch {
                          setMetaError("需要解密授权（请先签到或使用组织者钱包）");
                          setMetaOpen(true);
                          return;
                        }
                      }

                      setMetaOpen(true);
                      if (meta) return;
                      try {
                        setMetaLoading(true); setMetaError(undefined);
                        const current = em.event;
                        if (!current) throw new Error("event not loaded");
                        const url = buildIpfsGatewayUrl(current.metadataCID);
                        const res = await fetch(url);
                        if (!res.ok) throw new Error(`IPFS ${res.status}`);
                        const j = await res.json();
                        setMeta({ title: j.title, location: j.location, description: j.description });
                      } catch (e: any) {
                        setMetaError("读取 IPFS 详情失败");
                      } finally {
                        setMetaLoading(false);
                      }
                    }}
                  >
                    {metaOpen ? "收起详情" : (!hasDecryptAuth ? "🔐 授权后查看详情" : "查看详情")}
                  </button>
                  {ended ? (
                    <span className="badge bg-gray-500/20 text-gray-300">已结束</span>
                  ) : started ? (
                    <span className="badge-success animate-pulse">进行中</span>
                  ) : (
                    <span className="badge-warning">未开始</span>
                  )}
                </div>
              </div>

              {metaOpen && (
                <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  {metaLoading ? (
                    <p className="text-white/70">🔄 正在从 IPFS 读取详情...</p>
                  ) : metaError ? (
                    <p className="text-red-300">{metaError}</p>
                  ) : meta ? (
                    <div className="space-y-2">
                      {meta.title && (<p><span className="text-white/60">📝 标题:</span> {meta.title}</p>)}
                      {meta.location && (<p><span className="text-white/60">📍 地点:</span> {meta.location}</p>)}
                      {meta.description && (
                        <div>
                          <p className="text-white/60">📄 简介:</p>
                          <p className="whitespace-pre-wrap">{meta.description}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-white/70">未找到可展示的详情字段</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-bold mb-4">🔐 加密统计</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-sm text-white/60 mb-1">加密计数句柄</p>
                    <p className="font-mono text-xs break-all">{em.countHandle || "加载中..."}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-sm text-white/60 mb-1">明文参与人数</p>
                    <p className="text-2xl font-bold">{em.clearCount !== undefined ? String(em.clearCount) : "🔒 未解密"}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-4">⚡ 操作面板</h3>
                <div className="space-y-3">
                  <button 
                    onClick={()=>em.signIn(eventId)} 
                    disabled={!canSignIn || em.isSigningIn}
                    className="btn-gradient w-full disabled:opacity-50"
                  >
                    {em.isSigningIn ? "🔄 签到中..." : canSignIn ? "✍️ 立即签到" : ended ? "❌ 活动已结束" : !started ? "⏰ 活动未开始" : "🔗 请先连接钱包"}
                  </button>
                  
                  <button 
                    onClick={em.decryptCount} 
                    disabled={!em.countHandle || !instance || !ethersSigner}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    🔓 解密参与人数
                  </button>
                </div>
              </div>
            </div>

            {em.message && (
              <div className={`card ${em.message.includes('成功') ? 'bg-green-500/10 border-green-400/30' : em.message.includes('失败') ? 'bg-red-500/10 border-red-400/30' : 'bg-blue-500/10 border-blue-400/30'}`}>
                <p className="font-medium">{em.message}</p>
              </div>
            )}

            <div className="card bg-blue-500/10 border-blue-400/20">
              <h4 className="font-bold mb-2">💡 提示</h4>
              <ul className="text-sm text-white/70 space-y-1 list-disc list-inside">
                <li>签到时前端会用 FHE 加密输入，链上验证并累加密文计数</li>
                <li>解密操作需要生成 EIP-712 签名授权，仅授权用户可解密</li>
                <li>如果启用 POAP NFT，签到成功后将自动铸造纪念 NFT 到你的钱包</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-white/60">{em.message || "加载活动信息中..."}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function EventDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen"><Navbar /><main className="mx-auto max-w-4xl px-6 py-12"><div className="card text-center">Loading...</div></main></div>}>
      <EventDetailPageInner />
    </Suspense>
  );
}


