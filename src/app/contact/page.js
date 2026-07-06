export default function ContactPage() {
  return (
    <div className="px-5 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold mb-2">Contact Us</h1>
        <p className="text-[#7777aa]">Get in touch via WhatsApp or email</p>
      </div>
      <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-8 text-center transition-all hover:border-[rgba(0,212,255,0.15)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,transparent,#00d4ff,transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-4xl mb-3">💬</div>
          <h3 className="text-lg font-bold mb-2">WhatsApp Support</h3>
          <p className="text-sm text-[#7777aa] mb-4">Chat with our support team for bookings and queries.</p>
          <a href="https://wa.me/923XXXXXXXXX" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-[linear-gradient(135deg,#25d366,#1da851)] shadow-[0_0_16px_rgba(37,211,102,0.2)] transition-all hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:-translate-y-0.5 active:scale-95">
            Chat on WhatsApp
          </a>
        </div>
        <div className="bg-[#111122] border border-[rgba(255,255,255,0.06)] rounded-xl p-8 text-center transition-all hover:border-[rgba(0,212,255,0.15)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,transparent,#8b5cf6,transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-4xl mb-3">📧</div>
          <h3 className="text-lg font-bold mb-2">Email Support</h3>
          <p className="text-sm text-[#7777aa] mb-4">Send us an email and we&apos;ll respond within 24 hours.</p>
          <a href="mailto:support@grimzone.pk" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] shadow-[0_0_16px_rgba(139,92,246,0.2)] transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 active:scale-95">
            Email Us
          </a>
        </div>
      </div>
    </div>
  );
}
