import React, { useState } from 'react'; 
import { motion } from 'framer-motion'; 
import { Briefcase, Building2, Clock, FileText, Play, Upload, CheckCircle2, X, Trophy, Sparkles, User, Award, ArrowRight, AlertCircle, BarChart3, Eye } from 'lucide-react'; 
import { InterviewConfig, InterviewFeedback } from '../types'; 
import InterviewSession from './InterviewSession';

export default function InterviewTrainer() { 
  const [config, setConfig] = useState<InterviewConfig>({ 
    jobTitle: '', 
    company: '', 
    experienceLevel: 'Entry', 
    yearsOfExperience: 0, 
    resumeText: '' 
  }); 
  const [isUploading, setIsUploading ] = useState(false); 
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [finalFeedback, setFinalFeedback] = useState<InterviewFeedback | null>(null);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => { 
    const file = e.target.files?.[0]; 
    if (!file) return; 
    
    setIsUploading(true); 
    const reader = new FileReader(); 
    reader.onload = (event) => { 
      const text = event.target?.result as string; 
      setConfig(prev => ({ 
        ...prev, 
        resumeText: text,
        jobTitle: "Senior Product Designer", // Mocked extraction
        company: "Google", 
        experienceLevel: "Senior",
        yearsOfExperience: 5
      })); 
      setIsUploading(false); 
    }; 
    reader.readAsText(file); 
  }; 

  const canStart = (config.jobTitle && config.company) || config.resumeText; 

  if (isInterviewing) {
    return (
      <InterviewSession 
        config={config} 
        onEnd={(feedback) => {
          setFinalFeedback(feedback);
          setIsInterviewing(false);
        }} 
      />
    );
  }

  if (finalFeedback) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-12">
        <section className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-sm font-black border border-emerald-500/20 mb-4"
          >
            <Trophy size={16} /> Session Completed Successfully
          </motion.div>
          <h1 className="text-6xl font-black tracking-tighter leading-tight">
            YOUR PERFORMANCE <br />
            <span className="text-blue-500 uppercase tracking-widest italic">Report Card.</span>
          </h1>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-4 text-center">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Confidence Score</div>
            <div className="text-7xl font-black text-blue-500 tracking-tighter">{finalFeedback.confidenceScore}%</div>
            <p className="text-[10px] font-bold opacity-40 leading-relaxed uppercase tracking-widest italic">Steady posture & tone</p>
          </div>
          <div className="bg-blue-600 p-10 rounded-[2.5rem] shadow-2xl space-y-4 text-center">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Overall Mastery</div>
            <div className="text-7xl font-black text-white tracking-tighter">{finalFeedback.score}%</div>
            <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase tracking-widest italic">Industry Standards Match</p>
          </div>
          <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-4 text-center">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Eye Contact</div>
            <div className="text-7xl font-black text-emerald-400 tracking-tighter">{finalFeedback.eyeContactScore}%</div>
            <p className="text-[10px] font-bold opacity-40 leading-relaxed uppercase tracking-widest italic">Strong focus duration</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/20 p-6 rounded-3xl border border-white/5 text-center">
             <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Final Grade</div>
             <div className="text-4xl font-black text-blue-400">{finalFeedback.grade || 'N/A'}</div>
          </div>
          <div className="bg-black/20 p-6 rounded-3xl border border-white/5 text-center">
             <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Points Earned</div>
             <div className="text-4xl font-black text-emerald-400">{finalFeedback.points || '0'}</div>
          </div>
          <div className="bg-black/20 p-6 rounded-3xl border border-white/5 text-center">
             <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Time Taken</div>
             <div className="text-4xl font-black text-white">{finalFeedback.timeTaken || '0:00'}</div>
          </div>
          <div className="bg-black/20 p-6 rounded-3xl border border-white/5 text-center">
             <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Words Spoken</div>
             <div className="text-4xl font-black text-white">{finalFeedback.wordsSpoken || 0}</div>
          </div>
        </div>

        <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10 shadow-2xl space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                <Sparkles size={24} className="text-blue-500" /> Key Strengths
              </h3>
              <ul className="space-y-4">
                {finalFeedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-4 p-5 bg-blue-500/5 rounded-3xl border border-blue-500/10 font-bold text-blue-100 leading-relaxed">
                    <CheckCircle2 size={24} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                <X size={24} className="text-red-500" /> Growth Areas
              </h3>
              <ul className="space-y-4">
                {finalFeedback.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-4 p-5 bg-red-500/5 rounded-3xl border border-red-500/10 font-bold text-red-100 leading-relaxed">
                    <AlertCircle size={24} className="text-red-500 mt-0.5 flex-shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 space-y-6">
             <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 italic">
               <Award size={24} className="text-amber-500" /> Expert Summary
             </h3>
             <p className="text-2xl font-bold leading-tight italic opacity-80">
               "{finalFeedback.overallPerformance}"
             </p>
          </div>
        </div>

        <button 
          onClick={() => {
            setFinalFeedback(null);
            setConfig({ jobTitle: '', company: '', experienceLevel: 'Entry', yearsOfExperience: 0, resumeText: '' });
          }}
          className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-4 group"
        >
          Start New Practice Session <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    );
  }

  return ( 
    <div className="max-w-5xl mx-auto p-6"> 
      <div className="text-center mb-16 space-y-4"> 
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-xs font-black border border-blue-500/20 mb-4"
        >
          <Sparkles size={16} /> Advanced AI Simulation Hub
        </motion.div>
        <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9]">
          MOCK INTERVIEW <br /> 
          <span className="text-blue-500 italic uppercase tracking-widest">Trainer.</span>
        </h1> 
        <p className="text-xl opacity-50 max-w-2xl mx-auto font-medium leading-relaxed"> 
          Practice with our high-fidelity AI interviewer. Master your body language, 
          tone, and technical accuracy with real-time feedback. 
        </p> 
      </div> 

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 bg-white/5 p-12 rounded-[3rem] border border-white/10 shadow-2xl space-y-10 backdrop-blur-sm"> 
          <div className="space-y-8"> 
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 italic flex items-center gap-2 border-b border-white/5 pb-4">
              <User size={16} /> Session Configuration
            </h2> 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> 
              <div className="space-y-3"> 
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Job Title</label> 
                <div className="relative group"> 
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-blue-500 transition-colors" size={18} /> 
                  <input 
                    placeholder="e.g. Software Engineer" 
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none text-base font-bold transition-all" 
                    value={config.jobTitle} 
                    onChange={(e) => setConfig({ ...config, jobTitle: e.target.value })} 
                  /> 
                </div> 
              </div> 

              <div className="space-y-3"> 
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Company</label> 
                <div className="relative group"> 
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-blue-500 transition-colors" size={18} /> 
                  <input 
                    placeholder="e.g. Google" 
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none text-base font-bold transition-all" 
                    value={config.company} 
                    onChange={(e) => setConfig({ ...config, company: e.target.value })} 
                  /> 
                </div> 
              </div> 

              <div className="space-y-3"> 
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Experience Level</label> 
                <select 
                  className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none text-base font-bold appearance-none cursor-pointer" 
                  value={config.experienceLevel} 
                  onChange={(e) => setConfig({ ...config, experienceLevel: e.target.value as any })} 
                > 
                  <option value="Entry">Entry Level</option> 
                  <option value="Mid">Mid-Level</option> 
                  <option value="Senior">Senior Professional</option> 
                  <option value="Executive">Executive Leadership</option>
                </select> 
              </div> 
              <div className="space-y-3"> 
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Years of Practice</label> 
                <div className="relative group">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="number" 
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none text-base font-bold transition-all" 
                    value={config.yearsOfExperience} 
                    onChange={(e) => setConfig({ ...config, yearsOfExperience: parseInt(e.target.value) || 0 })} 
                  /> 
                </div>
              </div> 
            </div> 
          </div> 

          <button 
            onClick={() => setIsInterviewing(true)} 
            disabled={!canStart} 
            className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-4 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-2xl shadow-blue-500/20 group" 
          > 
            <Play size={24} fill="currentColor" className="group-hover:scale-110 transition-transform" /> 
            Launch Interview Session 
          </button> 
        </div> 

        <div className="lg:col-span-5 space-y-6"> 
          <div className="bg-[#11141a] p-10 rounded-[3rem] border border-white/10 shadow-2xl text-white space-y-6 relative overflow-hidden group"> 
            <div className="relative z-10 space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 italic flex items-center gap-2">
                <Upload size={16} /> Resume Integration
              </h2> 
              <label className={`block border-2 border-dashed rounded-[2rem] p-10 transition-all cursor-pointer text-center space-y-4 ${config.resumeText ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}> 
                <input type="file" className="hidden" accept=".txt,.pdf,.docx" onChange={handleResumeUpload} /> 
                {config.resumeText ? ( 
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-4"> 
                    <CheckCircle2 className="text-emerald-500 mx-auto" size={48} /> 
                    <div>
                      <p className="text-lg font-black text-emerald-400 uppercase tracking-widest">Resume Extracted</p> 
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">Smart context enabled</p>
                    </div>
                    <button 
                      onClick={(e) => { e.preventDefault(); setConfig({ ...config, resumeText: '' }); }} 
                      className="text-xs text-red-400 font-black uppercase tracking-widest hover:text-red-300 flex items-center gap-2 mx-auto pt-4" 
                    > 
                      <X size={14} /> Remove Data
                    </button> 
                  </motion.div> 
                ) : ( 
                  <div className="space-y-4"> 
                    <Upload className="opacity-20 mx-auto text-blue-500" size={48} /> 
                    <div>
                      <p className="text-lg font-black opacity-60 uppercase tracking-widest">Drag & Drop Resume</p> 
                      <p className="text-[10px] opacity-30 font-bold uppercase tracking-[0.2em] mt-1 italic">Personalize questions automatically</p> 
                    </div>
                  </div> 
                )} 
              </label> 
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/5 rounded-full group-hover:bg-blue-500/10 transition-colors" />
          </div> 

        </div>
      </div> 

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"> 
        {[ 
          { title: 'Eye Contact', desc: 'Real-time gaze tracking and attention analysis.', icon: <Eye size={32} className="text-blue-500" /> }, 
          { title: 'Body Language', desc: 'Confidence scoring based on posture and tone.', icon: <BarChart3 size={32} className="text-emerald-500" /> }, 
          { title: 'Semantic Feedback', desc: 'AI-driven phrasing suggestions and grammar check.', icon: <Sparkles size={32} className="text-amber-500" /> } 
        ].map((feature, i) => ( 
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }}
            className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-xl flex flex-col items-center text-center gap-6 backdrop-blur-sm"
          > 
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-inner">
              {feature.icon}
            </div>
            <div>
              <h3 className="font-black text-base uppercase tracking-widest mb-3">{feature.title}</h3> 
              <p className="text-[11px] opacity-50 font-bold leading-relaxed italic uppercase tracking-widest">{feature.desc}</p> 
            </div>
          </motion.div> 
        ))} 
      </div> 
    </div> 
  ); 
} 
