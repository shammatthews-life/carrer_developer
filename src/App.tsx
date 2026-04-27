import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Mic, Map, Sparkles, ChevronRight, Layout, Zap, Users, ShieldCheck, Sun, Moon, ArrowRight, Play, CheckCircle2, Award, Briefcase, LogOut, User as UserIcon, RefreshCcw } from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import ResumeBuilder from './components/ResumeBuilder';
import InterviewTrainer from './components/InterviewTrainer';
import SkillPath from './components/SkillPath';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import SignIn from './components/SignIn';

type View = 'home' | 'resume' | 'interview' | 'roadmap' | 'dashboard' | 'signin';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        setView('dashboard');
      } else {
        setView('home');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLogin = async () => {
    setIsAuthLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        // Just ignore
      } else {
        alert(`Login failed: ${error.message}`);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView('home');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };


  const tools = [
    {
      id: 'resume' as View,
      title: 'AI Resume Builder',
      description: 'Paste your raw resume text and let AI parse it into a clean, structured document instantly.',
      icon: <FileText size={24} />,
      color: 'bg-indigo-500/10 text-indigo-500',
      tagline: 'High Impact'
    },
    {
      id: 'interview' as View,
      title: 'Mock Interview',
      description: 'Realistic AI-generated interview questions tailored to your job title, company, and experience level.',
      icon: <Mic size={24} />,
      color: 'bg-emerald-500/10 text-emerald-500',
      tagline: 'Live Feedback'
    },
    {
      id: 'roadmap' as View,
      title: 'Real-time Analysis',
      description: 'Live eye contact tracking, filler word detection, grammar scoring, and answer quality feedback.',
      icon: <Layout size={24} />,
      color: 'bg-amber-500/10 text-amber-500',
      tagline: 'Precision Path'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0a0c10] text-white' : 'bg-[#f8fafc] text-[#141414]'} font-sans selection:bg-indigo-500 selection:text-white`}>
      {/* Navigation Header */}
      <nav className={`sticky top-0 z-50 ${theme === 'dark' ? 'bg-[#0a0c10]/80 border-white/5' : 'bg-white/80 border-[#141414]/5'} backdrop-blur-xl border-b px-8 py-4`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView('home')}
          >
            <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-white text-black' : 'bg-[#141414] text-white'} rounded-xl flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform`}>
              C
            </div>
            <h1 className="text-xl font-black tracking-tighter">CareerTrainer</h1>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              {['DASHBOARD', 'RESUME', 'INTERVIEW', 'ROADMAP'].map((label) => (
                <button
                  key={label}
                  onClick={() => setView(label.toLowerCase() as View)}
                  className={`text-xs font-black uppercase tracking-widest transition-all ${
                    view === label.toLowerCase() ? 'text-blue-500' : `${theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-[#141414]/40 hover:text-[#141414]'}`
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-white/5 text-amber-400 hover:bg-white/10' : 'bg-black/5 text-indigo-600 hover:bg-black/10'}`}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              
              <Auth onUserChange={setUser} />
            </div>
          </div>
        </div>
      </nav>

      <main className="py-0">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-0"
            >
              {/* Hero Section - Image 1 */}
              <section className="relative min-h-[90vh] flex items-center px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8 z-10">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-full text-xs font-black border border-indigo-500/20"
                    >
                      <Sparkles size={14} /> AI-Powered Career Preparation
                    </motion.div>
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95]"
                    >
                      Land Your <span className="text-blue-500">Dream Job</span> <br /> 
                      with <span className="text-cyan-400 italic font-serif">AI-Powered</span> <br />
                      Preparation
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className={`text-lg md:text-xl ${theme === 'dark' ? 'text-white/40' : 'text-[#141414]/50'} max-w-xl font-medium leading-relaxed`}
                    >
                      Build a polished, ATS-optimized resume with AI and sharpen your interview skills with real-time coaching — eye contact tracking, filler word detection, and instant answer feedback.
                    </motion.p>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-wrap gap-4"
                    >
                      {!user ? (
                        <button 
                          onClick={() => setView('signin')}
                          disabled={isAuthLoading}
                          className="bg-white text-black px-8 py-4 rounded-xl font-black text-lg flex items-center gap-3 hover:bg-gray-200 transition-all shadow-xl shadow-white/10 disabled:opacity-50"
                        >
                          {isAuthLoading ? <RefreshCcw size={20} className="animate-spin" /> : <UserIcon size={20} />}
                          {isAuthLoading ? 'Connecting...' : 'Sign in to Start'}
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => setView('dashboard')}
                            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-lg flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 group"
                          >
                            <Layout size={20} /> My Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                          <button 
                            onClick={() => setView('resume')}
                            className={`px-8 py-4 rounded-xl font-black text-lg flex items-center gap-3 transition-all ${theme === 'dark' ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-black/5 border border-black/10 hover:bg-black/10'}`}
                          >
                            <FileText size={20} /> Build Resume
                          </button>
                        </>
                      )}
                    </motion.div>
                  </div>

                  {/* Floating Cards - Image 1 Right Side */}
                  <div className="relative hidden lg:block">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8, x: 50 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className={`absolute top-0 right-0 w-80 p-6 rounded-3xl border ${theme === 'dark' ? 'bg-[#11141a] border-white/5 shadow-2xl shadow-black/50' : 'bg-white border-black/5 shadow-xl'} space-y-4`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500">
                            <Layout size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Interview Score</p>
                            <p className="text-xs font-bold">Live Session</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-4xl font-black text-emerald-500">87/100</p>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Above average — keep it up</p>
                      </div>
                      <div className="w-full h-1.5 bg-emerald-500/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '87%' }}
                          transition={{ duration: 1, delay: 0.6 }}
                          className="h-full bg-emerald-500" 
                        />
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8, x: 50, y: 100 }}
                      animate={{ opacity: 1, scale: 1, x: 0, y: 100 }}
                      transition={{ delay: 0.5 }}
                      className={`absolute top-40 right-10 w-80 p-6 rounded-3xl border ${theme === 'dark' ? 'bg-[#11141a] border-white/5 shadow-2xl shadow-black/50' : 'bg-white border-black/5 shadow-xl'} space-y-4`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-500">
                          <Sparkles size={16} />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest opacity-40">AI Enhanced</p>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-medium opacity-30 italic line-through">"Helped with customer issues"</p>
                        <p className="text-sm font-bold leading-relaxed">
                          "Resolved 94% of support tickets within SLA, reducing escalations by 40%"
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Grid Background Effect */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: `radial-gradient(${theme === 'dark' ? 'white' : 'black'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} 
                />
              </section>

              {/* Toolkit Section - Image 2 */}
              <section className={`py-32 px-8 ${theme === 'dark' ? 'bg-black/20' : 'bg-slate-50/50'}`}>
                <div className="max-w-7xl mx-auto space-y-16">
                  <div className="space-y-4">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">EVERYTHING YOU NEED</p>
                    <h2 className="text-5xl font-black tracking-tight">
                      The complete career preparation <br />
                      <span className="text-blue-500 italic">toolkit</span>
                    </h2>
                    <p className={`text-xl ${theme === 'dark' ? 'text-white/40' : 'text-[#141414]/50'} font-medium`}>
                      From resume writing to interview mastery — all in one AI-powered platform.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tools.concat({
                      id: 'enhancement' as View,
                      title: 'AI Enhancement',
                      description: 'Get before/after AI rewrites that strengthen bullet points and use ATS-friendly language.',
                      icon: <Sparkles size={24} />,
                      color: 'bg-blue-500/10 text-blue-500',
                      tagline: 'Quantify Impact'
                    }).map((tool, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -10 }}
                        className={`p-8 rounded-3xl border ${theme === 'dark' ? 'bg-[#11141a] border-white/5' : 'bg-white border-black/5 shadow-sm'} space-y-6 transition-all group`}
                      >
                        <div className={`w-12 h-12 ${tool.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          {tool.icon}
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-xl font-black">{tool.title}</h3>
                          <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-white/40' : 'text-[#141414]/50'} font-medium`}>
                            {tool.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Three Steps Section - Image 3 */}
              <section className="py-32 px-8">
                <div className="max-w-7xl mx-auto space-y-16">
                  <div className="space-y-4">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">HOW IT WORKS</p>
                    <h2 className="text-5xl font-black tracking-tight">
                      Three steps to your <br />
                      <span className="text-blue-500 italic">next offer</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                      { step: '01', title: 'Build Your Resume', desc: 'Paste your existing resume or build from scratch. AI parses it into a professional structured document.', icon: <FileText size={24} /> },
                      { step: '02', title: 'Set Up Your Interview', desc: 'Enter your target job title, company, and experience level. We generate tailored interview questions.', icon: <Briefcase size={24} /> },
                      { step: '03', title: 'Practice & Improve', desc: 'Answer questions with live feedback on confidence, eye contact, and communication quality.', icon: <Zap size={24} /> }
                    ].map((item, i) => (
                      <div key={i} className="space-y-6 relative group">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-black opacity-20 group-hover:opacity-100 transition-opacity">{item.step}</span>
                          <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} border rounded-xl flex items-center justify-center group-hover:border-blue-500 transition-colors`}>
                            {item.icon}
                          </div>
                          {i < 2 && (
                            <div className="hidden md:block flex-grow h-[1px] bg-white/10 ml-4" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-black">{item.title}</h3>
                          <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-white/40' : 'text-[#141414]/50'} font-medium`}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Ready Section - Image 4 */}
              <section className="py-32 px-8">
                <motion.div 
                  whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
                  className={`max-w-5xl mx-auto p-16 rounded-[3rem] ${theme === 'dark' ? 'bg-[#11141a] border border-white/5 shadow-2xl' : 'bg-[#141414] text-white shadow-2xl shadow-black/30'} text-center space-y-8 relative overflow-hidden`}
                >
                  <div className="relative z-10 space-y-8">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-3xl flex items-center justify-center text-blue-500 animate-pulse">
                        <Sparkles size={32} />
                      </div>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
                      Ready to land your <br />
                      <span className="text-blue-500">dream role?</span>
                    </h2>
                    <p className={`text-xl ${theme === 'dark' ? 'text-white/40' : 'text-white/60'} max-w-xl mx-auto font-medium`}>
                      Start with your resume, practice with AI, and walk into every interview with confidence.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <button 
                        onClick={() => setView('resume')}
                        className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-lg flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                      >
                        <FileText size={20} /> Start with Resume
                      </button>
                      <button 
                        onClick={() => setView('interview')}
                        className={`px-8 py-4 rounded-xl font-black text-lg flex items-center gap-3 transition-all ${theme === 'dark' ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white/10 border border-white/20 hover:bg-white/20 text-white'}`}
                      >
                        <Mic size={20} /> Jump to Interview
                      </button>
                    </div>
                  </div>
                  {/* Background Glow */}
                  <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full" />
                  <div className="absolute -top-48 -right-48 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full" />
                </motion.div>
              </section>

              {/* Minimal Footer */}
              <footer className="max-w-7xl mx-auto py-12 px-8 flex flex-col md:row justify-between items-center gap-8 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'} rounded-lg flex items-center justify-center font-black text-sm`}>C</div>
                  <h1 className="text-sm font-black tracking-tighter uppercase">JobTrainer AI</h1>
                </div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white/20' : 'text-black/20'}`}>
                  AI-powered career preparation
                </p>
              </footer>
            </motion.div>
          )}

          {view === 'resume' && (
            <motion.div
              key="resume"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-12"
            >
              <ResumeBuilder />
            </motion.div>
          )}

          {view === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-12"
            >
              <InterviewTrainer />
            </motion.div>
          )}

          {view === 'roadmap' && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-12"
            >
              <SkillPath />
            </motion.div>
          )}

          {view === 'dashboard' && user && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-12"
            >
              <Dashboard user={user} theme={theme} />
            </motion.div>
          )}

          {view === 'signin' && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-12"
            >
              <SignIn theme={theme} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
