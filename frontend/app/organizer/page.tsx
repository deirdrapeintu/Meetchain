"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/src/components/Navbar";

export default function OrganizerPage() {
  const [id, setId] = useState("");
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">📊 Organizer 后台</h2>
          <p className="text-white/60">管理你的活动</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Event Card */}
          <Link href="/organizer/create" className="card group cursor-pointer hover:scale-105">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">✨</div>
            <h3 className="text-2xl font-bold mb-2">创建活动</h3>
            <p className="text-white/70">
              创建新的 Web3 聚会活动，上传信息到 IPFS 并上链存证
            </p>
          </Link>

          {/* Quick Access Card */}
          <div className="card space-y-4">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">快速访问</h3>
            <p className="text-white/70 mb-4">输入活动 ID 快速跳转</p>
            
            <div className="space-y-3">
              <input 
                className="input-field" 
                placeholder="输入 Event ID" 
                value={id} 
                onChange={e=>setId(e.target.value)}
                type="number"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  href={id ? `/event/${id}` : "#"} 
                  className={`btn-gradient text-center ${!id && 'opacity-50 pointer-events-none'}`}
                >
                  📋 活动详情
                </Link>
                <Link 
                  href={id ? `/organizer/qr/${id}` : "#"} 
                  className={`btn-primary text-center ${!id && 'opacity-50 pointer-events-none'}`}
                >
                  📱 签到二维码
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="text-3xl mb-3">⛓️</div>
            <h4 className="font-bold mb-2">链上存证</h4>
            <p className="text-sm text-white/70">所有活动记录永久上链，不可篡改</p>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl mb-3">🔐</div>
            <h4 className="font-bold mb-2">隐私保护</h4>
            <p className="text-sm text-white/70">FHE 加密计数，仅授权方可解密</p>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl mb-3">🎨</div>
            <h4 className="font-bold mb-2">NFT 徽章</h4>
            <p className="text-sm text-white/70">可选发放 POAP 纪念 NFT</p>
          </div>
        </div>

        {/* How to Use */}
        <div className="mt-12 card bg-gradient-to-br from-primary/20 to-techblue/20">
          <h3 className="text-2xl font-bold mb-4">📖 使用指南</h3>
          <div className="space-y-3 text-white/80">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <p>点击"创建活动"，填写活动信息并上链</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <p>创建成功后，点击"生成签到二维码"或在上方输入 Event ID 跳转</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <p>在活动现场展示二维码，参与者扫码签到</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">4️⃣</span>
              <p>活动详情页可随时解密查看参与人数（需授权）</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
