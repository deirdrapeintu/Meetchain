"use client";

import Link from "next/link";
import { Navbar } from "@/src/components/Navbar";

export default function Page() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center space-y-6 mb-16 animate-float">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              MeetChain
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
            🚀 Web3 聚会签到上链
          </p>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            去中心化不可篡改的参会凭证，支持 FHE 加密计数与纪念 NFT
          </p>
          
          <div className="flex gap-4 justify-center pt-6">
            <Link href="/organizer/create" className="btn-gradient text-lg px-8 py-4">
              ✨ 创建活动
            </Link>
            <Link href="/organizer" className="btn-primary text-lg px-8 py-4">
              📊 Organizer 后台
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="card group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔒</div>
            <h3 className="text-xl font-bold mb-2">隐私保护</h3>
            <p className="text-white/70">
              使用 FHEVM 全同态加密技术，参与人数在链上加密存储，仅授权方可解密
            </p>
          </div>

          <div className="card group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⛓️</div>
            <h3 className="text-xl font-bold mb-2">链上存证</h3>
            <p className="text-white/70">
              所有签到记录永久上链，不可篡改，提供可验证的出席证明
            </p>
          </div>

          <div className="card group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎨</div>
            <h3 className="text-xl font-bold mb-2">纪念 NFT</h3>
            <p className="text-white/70">
              可选发放 POAP 风格 NFT，让参与者永久珍藏活动记忆
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            💡 如何使用
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">创建活动</h3>
                  <p className="text-white/70">
                    填写活动信息（标题、时间、地点），选择是否发放纪念 NFT，上传到 IPFS 并上链
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-techblue flex items-center justify-center font-bold text-xl flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">展示二维码</h3>
                  <p className="text-white/70">
                    组织者在活动现场展示签到二维码，参与者扫码进入签到页面
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-techblue to-blue-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">链上签到</h3>
                  <p className="text-white/70">
                    参与者连接钱包点击签到，FHE 加密写入链上，自动铸造纪念 NFT
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">解密统计</h3>
                  <p className="text-white/70">
                    活动组织者或参与者可随时解密查看当前参与人数（演示功能）
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center card animate-pulse-glow">
          <h2 className="text-3xl font-bold mb-4">准备好了吗？</h2>
          <p className="text-white/70 mb-6">立即创建你的第一个 Web3 活动</p>
          <Link href="/organizer/create" className="btn-gradient text-lg px-8 py-4 inline-block">
            🚀 开始创建
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 text-center text-white/50 text-sm">
          <p>Powered by FHEVM · Built with ❤️ for Web3 Community</p>
        </div>
      </footer>
    </div>
  );
}


