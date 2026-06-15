import { motion } from 'motion/react';
import { ChevronRight, Share, PlusSquare, LayoutDashboard, Search, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function Landing() {
  const navigate = useNavigate();
  const [activeInstallTab, setActiveInstallTab] = useState<'ios' | 'android'>('ios');

  return (
    <div className="min-h-screen bg-white selection:bg-[#4F46E5] selection:text-white overflow-x-hidden font-[Inter,system-ui,sans-serif]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="w-full max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/pwa-192x192.png" alt="PaperStack Logo" className="w-9 h-9 object-contain" />
            <span className="text-xl font-bold text-[#0A2540] tracking-tight">PaperStack</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/welcome')}
              className="text-[#0A2540] font-semibold hover:text-[#4F46E5] transition-colors hidden sm:block"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/welcome')}
              className="bg-[#0A2540] text-white px-5 py-2.5 rounded-full font-semibold hover:bg-[#4F46E5] transition-all shadow-md active:scale-95 flex items-center gap-1"
            >
              Get Started <ChevronRight className="w-4 h-4 hidden sm:block" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 flex flex-col items-center text-center">
        {/* Background Image with Frosted Glass */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-[center_top_20%] bg-no-repeat before:content-[''] before:absolute before:inset-0 before:bg-[rgba(255,255,255,0.65)] before:backdrop-blur-[2px] before:brightness-105"
          style={{ backgroundImage: 'url(https://res.cloudinary.com/dpwx4djzx/image/upload/v1772657123/background-image_yiva8m.jpg)' }}
        />
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/40 text-[#4F46E5] font-semibold text-sm mb-8 shadow-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4F46E5] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4F46E5]"></span>
            </span>
            Used by students like you — 100% free
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black text-[#0A2540] tracking-tight leading-[1.1] mb-6 drop-shadow-sm"
          >
            Your next exam is closer than you think. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] to-[#F59E0B]">Are you ready?</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg lg:text-xl text-[#0A2540]/80 max-w-2xl leading-relaxed mb-10 font-medium bg-white/40 rounded-2xl p-4 backdrop-blur-sm"
          >
            Every past question your department has — organized by course, year, and semester. No more begging seniors, no blurry photocopies, no "I'll send it later." Just open and read.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
          >
            <button
              onClick={() => navigate('/welcome')}
              className="w-full sm:w-auto px-8 py-4 bg-[#0A2540] text-white rounded-2xl font-bold text-lg hover:bg-[#4F46E5] transition-all shadow-xl hover:shadow-[#4F46E5]/20 active:scale-95 flex items-center justify-center gap-2"
            >
              Start Reading Past Questions
            </button>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm text-[#0A2540]/50 mt-4 font-medium"
          >
            Opens in your browser — no download, no app store, no storage space.
          </motion.p>
          <motion.a
            href="#install"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] text-sm font-semibold hover:bg-[#4F46E5]/20 transition-colors"
          >
            Want it on your home screen? ↓
          </motion.a>
        </div>
      </section>

      {/* About Us / Branding Section */}
      <section className="py-24 px-6 bg-[#0A2540] text-white relative overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#4F46E5] rounded-full mix-blend-multiply filter blur-[128px] opacity-40 translate-x-[-50%] translate-y-[-50%] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F59E0B] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 translate-x-[50%] translate-y-[50%] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">You know the struggle.</h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
            Exam is next week and you're still hunting for past questions on WhatsApp. Someone sends a blurry photo. Half the pages are missing. Sound familiar? PaperStack fixes that — every past question, neatly organized, ready when you are.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {[
            {
              icon: Search,
              title: "Find it in seconds",
              desc: "Type your course code. Pick your level. That's it — no scrolling through 500 files in a WhatsApp group."
            },
            {
              icon: Shield,
              title: "Complete papers, not fragments",
              desc: "Full question papers — not a photo of page 2 with someone's thumb covering the corner."
            },
            {
              icon: LayoutDashboard,
              title: "See what keeps repeating",
              desc: "Some lecturers recycle questions. We track which ones come back every year so you study what actually matters."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 bg-[#4F46E5] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#4F46E5]/20">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-white/60 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PWA Installation Guide Section */}
      <section id="install" className="py-24 px-6 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0A2540] mb-6">Want faster access?</h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              You don't <em>need</em> to do this — PaperStack already works in your browser. But if you want it to feel like a real app on your phone (with its own icon and everything), here's how:
            </p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-4 lg:p-8 shadow-xl border border-gray-100 flex flex-col">
            {/* Custom Tab Switcher */}
            <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full max-w-md mx-auto mb-10">
              <button
                onClick={() => setActiveInstallTab('ios')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                  activeInstallTab === 'ios' ? 'bg-white text-[#0A2540] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                iOS (iPhone)
              </button>
              <button
                onClick={() => setActiveInstallTab('android')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                  activeInstallTab === 'android' ? 'bg-white text-[#0A2540] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Android
              </button>
            </div>

            {/* iOS Guide */}
            {activeInstallTab === 'ios' && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col lg:flex-row gap-12 items-center">
                <div className="flex-1 space-y-8 w-full">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#0A2540] text-white font-bold flex items-center justify-center flex-shrink-0 mt-1">1</div>
                    <div>
                      <h4 className="text-xl font-bold text-[#0A2540] mb-2">Open Safari</h4>
                      <p className="text-[#64748B] leading-relaxed">Open <span className="text-[#4F46E5] font-semibold">papers-stack.vercel.app</span> in your Safari browser.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#0A2540] text-white font-bold flex items-center justify-center flex-shrink-0 mt-1">2</div>
                    <div>
                      <h4 className="text-xl font-bold text-[#0A2540] mb-2">Tap Share</h4>
                      <p className="text-[#64748B] leading-relaxed flex items-center flex-wrap gap-1">Tap the <Share className="w-4 h-4 text-[#4F46E5]" /> <strong>Share</strong> button at the bottom of the screen.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#0A2540] text-white font-bold flex items-center justify-center flex-shrink-0 mt-1">3</div>
                    <div>
                      <h4 className="text-xl font-bold text-[#0A2540] mb-2">Add to Home Screen</h4>
                      <p className="text-[#64748B] leading-relaxed flex items-center flex-wrap gap-1">Scroll down the menu and tap <PlusSquare className="w-4 h-4 rounded-sm border-2 border-current text-[#4F46E5]" /> <strong>Add to Home Screen</strong>.</p>
                    </div>
                  </div>
                </div>
                {/* Image Placeholder */}
                <div className="flex-1 w-full flex justify-center">
                  <div className="w-full max-w-[400px] bg-white border border-gray-100 rounded-[2rem] p-4 relative overflow-hidden flex items-center justify-center shadow-lg">
                    <img src="/ios-guide.png" alt="iOS Installation Guide" className="w-full h-auto rounded-xl object-contain shadow-sm border border-gray-100/50" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Android Guide */}
            {activeInstallTab === 'android' && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col lg:flex-row gap-12 items-center">
                <div className="flex-1 space-y-8 w-full">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#0A2540] text-white font-bold flex items-center justify-center flex-shrink-0 mt-1">1</div>
                    <div>
                      <h4 className="text-xl font-bold text-[#0A2540] mb-2">Open Chrome</h4>
                      <p className="text-[#64748B] leading-relaxed">Open <span className="text-[#4F46E5] font-semibold">papers-stack.vercel.app</span> in Chrome or Edge.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#0A2540] text-white font-bold flex items-center justify-center flex-shrink-0 mt-1">2</div>
                    <div>
                      <h4 className="text-xl font-bold text-[#0A2540] mb-2">Open Menu</h4>
                      <p className="text-[#64748B] leading-relaxed flex items-center flex-wrap gap-1">Tap the <strong>Three Dots ⋮</strong> menu at the top right.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#0A2540] text-white font-bold flex items-center justify-center flex-shrink-0 mt-1">3</div>
                    <div>
                      <h4 className="text-xl font-bold text-[#0A2540] mb-2">Install App</h4>
                      <p className="text-[#64748B] leading-relaxed">Tap <strong>Install App</strong> or <strong>Add to Home screen</strong>.</p>
                    </div>
                  </div>
                </div>
                {/* Image Placeholder */}
                <div className="flex-1 w-full flex justify-center">
                  <div className="w-full max-w-[400px] bg-white border border-gray-100 rounded-[2rem] p-4 relative overflow-hidden flex items-center justify-center shadow-lg">
                    <img src="/android-guide.png" alt="Android Installation Guide" className="w-full h-auto rounded-xl object-contain shadow-sm border border-gray-100/50" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A2540] text-white py-12 px-6 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/pwa-192x192.png" alt="PaperStack Logo" className="w-7 h-7 object-contain rounded-md" />
            <span className="text-xl font-bold tracking-tight">PaperStack</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-white/70">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/tos" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="mailto:babalolagreatnation@gmail.com" className="hover:text-white transition-colors">Email Support</a>
            <a href="https://wa.me/2349151782993" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">WhatsApp Us</a>
          </div>
          
          <div className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} PaperStack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
