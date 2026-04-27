import React, { useState } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion'; 
import { Search, Map, Clock, Sparkles, RefreshCcw, Youtube, BookOpen } from 'lucide-react'; 
import { generateSkillPath } from '../services/aiService'; 
import { SkillPathData } from '../types'; 

export default function SkillPath() { 
  const [role, setRole] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [path, setPath] = useState<SkillPathData | null>(null); 

  const handleGenerate = async (targetRole?: string) => { 
    const roleToGen = targetRole || role;
    if (!roleToGen.trim()) return; 
    setLoading(true); 
    try { 
      const data = await generateSkillPath(roleToGen); 
      setPath(data); 
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  return ( 
    <div className="max-w-6xl mx-auto px-4 py-12"> 
      <div className="text-center mb-16 space-y-4"> 
        <h1 className="text-6xl font-black tracking-tighter mb-4 text-white">Skill Path Roadmap</h1> 
        <p className="text-xl opacity-50 max-w-2xl mx-auto font-medium leading-relaxed text-white"> 
          Enter a role you want to achieve, and we'll generate a personalized learning 
          roadmap with 6 essential topics per week. 
        </p> 
      </div> 

      <div className="max-w-3xl mx-auto mb-20"> 
        <div className="relative group mb-8"> 
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity text-white" size={24} /> 
          <input 
            placeholder="e.g. Data Scientist, UX Designer, Cloud Architect..." 
            className="w-full pl-16 pr-40 py-6 rounded-[2rem] bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold shadow-2xl backdrop-blur-sm text-white" 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()} 
          /> 
          <button 
            onClick={() => handleGenerate()} 
            disabled={loading || !role.trim()} 
            className="absolute right-3 top-3 bottom-3 px-8 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/20" 
          > 
            {loading ? ( 
              <RefreshCcw className="w-5 h-5 animate-spin" /> 
            ) : ( 
              <Sparkles size={18} /> 
            )} 
            Generate 
          </button> 
        </div> 

        <div className="space-y-6"> 
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 text-center text-white">Quick Suggestions</p> 
          <div className="flex flex-wrap justify-center gap-3"> 
            {[ 
              "Data Analyst", "Web Developer", "Software Engineer", 
              "UI/UX Designer", "DevOps Engineer", "Cloud Architect"
            ].map((suggestedRole) => ( 
              <button 
                key={suggestedRole} 
                onClick={() => { 
                  setRole(suggestedRole); 
                  handleGenerate(suggestedRole);
                }} 
                className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[11px] font-black text-white hover:bg-white hover:text-black transition-all shadow-sm hover:scale-105" 
              > 
                {suggestedRole} 
              </button> 
            ))} 
          </div> 
        </div> 
      </div> 

      <AnimatePresence mode="wait"> 
        {loading ? ( 
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="flex flex-col items-center justify-center py-32 space-y-6" 
          > 
            <RefreshCcw className="w-16 h-16 text-blue-500 animate-spin" /> 
            <p className="text-lg font-black uppercase tracking-[0.2em] opacity-30 animate-pulse text-white">Building your roadmap...</p> 
          </motion.div> 
        ) : path && path.roadmap ? ( 
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-12" 
          > 
            <div className="flex items-center gap-6 mb-12 bg-white/5 p-8 rounded-[2.5rem] border border-white/10"> 
              <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/20"> 
                <Map size={32} /> 
              </div> 
              <div> 
                <h2 className="text-4xl font-black tracking-tight uppercase text-blue-500">{path.role}</h2> 
                <p className="text-lg font-medium opacity-50 text-white">Personalized Learning Journey</p> 
              </div> 
            </div> 

            <div className="space-y-16"> 
              {path.roadmap.map((step, idx) => ( 
                <div key={idx} className="bg-white/5 p-10 rounded-[3rem] border border-white/10 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 text-white">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-blue-500 uppercase tracking-widest">{step.duration}</span>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-xs font-black opacity-40 uppercase tracking-widest text-white">Module {idx + 1}</span>
                      </div>
                      <h3 className="text-3xl font-black tracking-tight text-white">{step.topic}</h3>
                    </div>
                    <div className="flex gap-3">
                        <a href={step.resources.website} target="_blank" rel="noreferrer" className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-blue-500">
                            <BookOpen size={20} />
                        </a>
                        <a href={step.resources.youtube} target="_blank" rel="noreferrer" className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-red-500">
                            <Youtube size={20} />
                        </a>
                    </div>
                  </div>

                  <p className="text-lg opacity-60 font-medium leading-relaxed max-w-3xl text-white">
                    {step.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> 
                    {step.subtopics.map((sub, i) => ( 
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 text-white">
                        <div className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-500 flex items-center justify-center text-[10px] font-black border border-blue-500/20">
                            {i + 1}
                        </div>
                        <span className="font-bold text-sm text-white">{sub}</span>
                      </div>
                    ))} 
                  </div> 
                </div>
              ))} 
            </div> 
          </motion.div> 
        ) : ( 
          <div className="text-center py-32 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/5"> 
            <Map className="mx-auto opacity-10 mb-6 text-white" size={80} /> 
            <p className="text-xl font-medium opacity-30 text-white">Enter a role above to see your path to success</p> 
          </div> 
        )} 
      </AnimatePresence> 
    </div> 
  ); 
} 
