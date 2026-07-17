'use client';
import dynamic from 'next/dynamic';

const WorldChatClient = dynamic(() => import('./WorldChatClient'), {
  loading: () => (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 pb-16 px-5 flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex flex-col flex-1">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] bg-clip-text text-transparent mb-6 text-center">World Chat</h1>
        <div className="glass flex-1 rounded-xl p-4 mb-4 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#7777aa]">Loading chat...</p>
          </div>
        </div>
      </div>
    </div>
  ),
  ssr: false,
});

export default function WorldChatPage() {
  return <WorldChatClient />;
}
