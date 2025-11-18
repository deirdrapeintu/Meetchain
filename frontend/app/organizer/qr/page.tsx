"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Navbar } from "@/src/components/Navbar";
import Link from "next/link";

function QRPageInner() {
  const sp = useSearchParams();
  const id = sp.get("id") || "";
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/event?id=${id}` : "";

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, { 
      width: 400, 
      margin: 2, 
      color: { 
        dark: "#6C4FF7", 
        light: "#ffffff" 
      } 
    });
  }, [url]);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold mb-2">📱 签到二维码</h2>
          <p className="text-white/60">Event #{id}</p>
        </div>

        <div className="card text-center space-y-6 max-w-2xl mx-auto">
          <div className="inline-block p-8 bg-white rounded-2xl shadow-2xl animate-float">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>

          <div className="space-y-3">
            <p className="text-white/60 text-sm">扫描二维码或访问链接进入签到页面</p>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <input 
                type="text" 
                value={url} 
                readOnly 
                className="flex-1 bg-transparent outline-none text-sm font-mono"
              />
              <button 
                onClick={copyLink}
                className="btn-primary py-2 px-4 text-sm"
              >
                {copied ? "✅ 已复制" : "📋 复制"}
              </button>
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <Link href={`/event?id=${id}`} className="btn-gradient">
              📋 查看活动详情
            </Link>
            <Link href="/organizer" className="btn-primary">
              ← 返回后台
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function QRPage() {
  return (
    <Suspense fallback={<div className="min-h-screen"><Navbar /><main className="mx-auto max-w-4xl px-6 py-12"><div className="card text-center">Loading...</div></main></div>}>
      <QRPageInner />
    </Suspense>
  );
}


