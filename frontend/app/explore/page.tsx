"use client";

import { Navbar } from "@/src/components/Navbar";
import Link from "next/link";
import { useMetaMaskEthersSigner } from "@/src/hooks/metamask/useMetaMaskEthersSigner";
import { useEventsIndex } from "@/src/hooks/useEventsIndex";

export default function ExplorePage() {
  const { chainId, ethersReadonlyProvider } = useMetaMaskEthersSigner();
  const { events, ongoing, upcoming, ended, loading, error } = useEventsIndex({ chainId, readonlyProvider: ethersReadonlyProvider });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-2">🔍 探索活动</h2>
            <p className="text-white/60">发现更多 Web3 聚会</p>
          </div>
          <Link href="/organizer/create" className="btn-gradient">✨ 创建活动</Link>
        </div>

        {loading && (
          <div className="card text-center py-10">正在加载链上活动...</div>
        )}
        {error && (
          <div className="card text-center py-10 text-red-300">加载失败：{error}</div>
        )}

        {!loading && !error && (
          <div className="space-y-10">
            <Section title="进行中" items={ongoing} emptyHint="当前没有正在进行的活动" />
            <Section title="即将开始" items={upcoming} emptyHint="暂时没有新的活动" />
            <Section title="已结束" items={ended} emptyHint="这里会显示历史活动" />
          </div>
        )}
      </main>
    </div>
  );
}

function Section({ title, items, emptyHint }: { title: string; items: any[]; emptyHint: string }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-2xl font-bold">{title}</h3>
        <span className="text-white/60 text-sm">共 {items.length} 场</span>
      </div>
      {items.length === 0 ? (
        <div className="card text-center py-8 text-white/60">{emptyHint}</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((e) => <EventCard key={e.id} e={e} />)}
        </div>
      )}
    </section>
  );
}

function EventCard({ e }: { e: any }) {
  return (
    <Link href={`/event/${e.id}`} className="card group">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xl font-bold truncate max-w-[70%]">{e.title || `Event #${e.id}`}</h4>
        <span className="text-white/60 text-sm">#{e.id}</span>
      </div>
      <div className="space-y-1 text-white/80">
        {e.location && <p>📍 {e.location}</p>}
        <p>⏰ {new Date(e.startTime * 1000).toLocaleString()} ~ {new Date(e.endTime * 1000).toLocaleString()}</p>
        <p className="text-white/60 text-sm break-all">CID: {e.metadataCID}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="badge {e.mintPOAP ? 'badge-success' : ''}">{e.mintPOAP ? '🎨 POAP' : '—'}</span>
        <span className="btn-primary">查看详情 →</span>
      </div>
    </Link>
  );
}


