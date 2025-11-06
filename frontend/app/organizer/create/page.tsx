"use client";

import { useMetaMaskEthersSigner } from "@/src/hooks/metamask/useMetaMaskEthersSigner";
import { useFhevm } from "@/src/fhevm/useFhevm";
import { useState } from "react";
import { ethers } from "ethers";
import { EventManagerABI } from "@/src/abi/EventManagerABI";
import { EventManagerAddresses } from "@/src/abi/EventManagerAddresses";
import Link from "next/link";
import { Navbar } from "@/src/components/Navbar";

async function uploadToPinata(json: unknown): Promise<string> {
  const token = process.env.NEXT_PUBLIC_PINATA_JWT as string | undefined;
  if (!token) throw new Error("缺少 NEXT_PUBLIC_PINATA_JWT");
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ pinataContent: json })
  });
  if (!res.ok) throw new Error("Pinata 上传失败");
  const data = await res.json();
  return data.IpfsHash as string;
}

export default function CreateEventPage() {
  const { provider, chainId, isConnected, ethersSigner, initialMockChains } = useMetaMaskEthersSigner();
  const { instance } = useFhevm({ provider: provider!, chainId, enabled: true, initialMockChains });
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [mintPOAP, setMintPOAP] = useState(true);
  const [creating, setCreating] = useState(false);
  const [eventId, setEventId] = useState<number | undefined>(undefined);
  const [message, setMessage] = useState("");

  const emEntry = chainId ? EventManagerAddresses[chainId.toString() as keyof typeof EventManagerAddresses] : undefined;
  const emAddress = emEntry?.address && emEntry.address !== ethers.ZeroAddress ? emEntry.address : undefined;

  const onCreate = async () => {
    if (!isConnected || !ethersSigner || !emAddress) { setMessage("⚠️ 请先连接钱包或部署合约"); return; }
    if (!title || !location || !start || !end) { setMessage("⚠️ 请填写完整信息"); return; }
    
    try {
      setCreating(true); 
      setMessage("📤 正在上传到 IPFS...");
      const metadata = { title, location, description };
      const cid = await uploadToPinata(metadata);
      
      const c = new ethers.Contract(emAddress, EventManagerABI.abi, ethersSigner);
      setMessage("⛓️ 正在创建链上活动...");
      const tx = await c.createEvent(cid, Math.floor(new Date(start).getTime()/1000), Math.floor(new Date(end).getTime()/1000), mintPOAP);
      
      setMessage("⏳ 等待交易确认...");
      await tx.wait();
      
      const eid = Number(await c.nextEventId()) - 1;
      setEventId(eid);
      setMessage("✅ 创建成功！");
    } catch (e: any) {
      setMessage(`❌ 创建失败: ${e.message || "未知错误"}`);
    } finally { 
      setCreating(false); 
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">✨ 创建活动</h2>
          <p className="text-white/60">填写活动信息并上链存证</p>
        </div>

        {eventId !== undefined ? (
          // Success State
          <div className="card text-center space-y-6 animate-float">
            <div className="text-6xl">🎉</div>
            <h3 className="text-3xl font-bold">活动创建成功！</h3>
            <p className="text-white/70">Event ID: #{eventId}</p>
            <div className="flex gap-4 justify-center">
              <Link href={`/event/${eventId}`} className="btn-gradient">
                📋 查看活动详情
              </Link>
              <Link href={`/organizer/qr/${eventId}`} className="btn-primary">
                📱 生成签到二维码
              </Link>
            </div>
            <button onClick={() => { setEventId(undefined); setTitle(""); setLocation(""); setDescription(""); setStart(""); setEnd(""); setMessage(""); }} className="btn-primary">
              ➕ 继续创建
            </button>
          </div>
        ) : (
          // Form
          <div className="card space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">活动标题 *</label>
              <input 
                className="input-field" 
                placeholder="例如：Web3 开发者聚会" 
                value={title} 
                onChange={e=>setTitle(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">活动地点 *</label>
              <input 
                className="input-field" 
                placeholder="例如：上海市浦东新区科技园" 
                value={location} 
                onChange={e=>setLocation(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">活动简介</label>
              <textarea 
                className="input-field resize-none" 
                rows={3}
                placeholder="简单介绍一下活动内容..." 
                value={description} 
                onChange={e=>setDescription(e.target.value)} 
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">开始时间 *</label>
                <input 
                  type="datetime-local" 
                  className="input-field" 
                  value={start} 
                  onChange={e=>setStart(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">结束时间 *</label>
                <input 
                  type="datetime-local" 
                  className="input-field" 
                  value={end} 
                  onChange={e=>setEnd(e.target.value)} 
                />
              </div>
            </div>

            <div className="card bg-white/5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={mintPOAP} 
                  onChange={e=>setMintPOAP(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 checked:bg-primary"
                />
                <div>
                  <div className="font-medium flex items-center gap-2">
                    🎨 启用纪念 NFT (POAP)
                  </div>
                  <p className="text-sm text-white/60 mt-1">
                    签到成功后自动为参与者铸造独一无二的纪念 NFT
                  </p>
                </div>
              </label>
            </div>

            {message && (
              <div className={`p-4 rounded-xl ${message.includes('✅') ? 'bg-green-500/20 border border-green-400/30' : message.includes('❌') ? 'bg-red-500/20 border border-red-400/30' : 'bg-blue-500/20 border border-blue-400/30'}`}>
                <p className="text-sm">{message}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button 
                disabled={creating || !isConnected} 
                onClick={onCreate} 
                className="btn-gradient flex-1 disabled:opacity-50"
              >
                {creating ? "🔄 创建中..." : "🚀 创建活动"}
              </button>
              <Link href="/organizer" className="btn-primary">
                取消
              </Link>
            </div>

            {!isConnected && (
              <div className="text-center text-yellow-300 text-sm">
                ⚠️ 请先连接钱包
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}


