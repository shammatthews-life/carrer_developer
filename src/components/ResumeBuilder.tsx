import React, { useState, useRef, useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion'; 
import { Plus, Trash2, Download, Sparkles, User, Briefcase, GraduationCap, Code, FileText, Globe, Award, X, CheckCircle2, Copy } from 'lucide-react'; 
import { ResumeData } from '../types'; 
import { parseResumeText, enhanceResumeSection } from '../services/aiService'; 
import { jsPDF } from 'jspdf'; 
import html2canvas from 'html2canvas'; 
import { auth } from '../firebase';
import { dataService } from '../services/dataService';

const SAMPLE_PROMPT = `SEBASTIAN BENNETT

Professional Accountant

📞 +123-456-7890 | ✉️ hello@reallygreatsite.com | 📍 123 Anywhere St., Any City

ABOUT ME

Detail-oriented and reliable accounting professional with strong expertise in financial reporting, auditing, and financial analysis. Proven ability to maintain accurate financial records, ensure compliance with regulations, and support business decision-making. Committed to delivering high-quality work and improving financial efficiency within organizations.

EDUCATION

Borcelle University (2026–2030)
Senior Accountant

Specialized in advanced accounting principles, taxation, and financial management

Developed strong analytical and reporting skills through academic projects

Borcelle University (2023–2026)
Senior Accountant

Built a solid foundation in accounting, auditing, and financial analysis

Completed coursework in bookkeeping, financial statements, and business finance

WORK EXPERIENCE

Salford & Co. (2033–2035)
Senior Accountant

Managed financial reporting processes and ensured compliance with accounting standards

Conducted internal audits and identified areas for cost reduction and efficiency improvement

Supervised junior accountants and reviewed financial statements for accuracy

Salford & Co. (2030–2033)
Financial Accountant

Prepared monthly and annual financial statements

Maintained accurate financial records and assisted with audits

Supported budgeting, forecasting, and financial planning activities

SKILLS

Auditing

Financial Accounting

Financial Reporting

Budgeting & Forecasting

Data Analysis

LANGUAGES

English (Fluent)

Tamil (Native)

competitions

Participated in inter-college accounting symposium at KIT College

Presented a paper on financial analysis and reporting techniques

Took part in business quiz and finance-related competitions`;

type ResumeStyle = 'classic' | 'modern' | 'creative' | 'executive' | 'tech';

export default function ResumeBuilder() { 
  const [resume, setResume] = useState<ResumeData>({ 
    personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' }, 
    experience: [], 
    internships: [],
    education: [], 
    skills: [], 
    projects: [],
    additionalSections: []
  }); 
  const [isParsing, setIsParsing] = useState(false); 
  const [rawText, setRawText] = useState(''); 
  const resumeRef = useRef<HTMLDivElement>(null); 
  const [showSample, setShowSample] = useState(false);
  const [resumeStyle, setResumeStyle] = useState<ResumeStyle>('classic');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showSample) {
      timer = setTimeout(() => {
        setShowSample(false);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [showSample]);

  const handleCopySample = () => {
    navigator.clipboard.writeText(SAMPLE_PROMPT);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowSample(false);
    }, 1000);
  };

  const handleParse = async () => { 
    if (!rawText.trim()) return; 
    setIsParsing(true); 
    try { 
      const data = await parseResumeText(rawText); 
      setResume({ 
        personalInfo: data.personalInfo || { fullName: '', email: '', phone: '', location: '', summary: '' }, 
        experience: data.experience || [], 
        education: data.education || [], 
        skills: data.skills || [], 
        projects: data.projects || [],
        additionalSections: data.additionalSections || []
      }); 
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsParsing(false); 
    } 
  }; 

  const handleEnhance = async (section: string, content: string, path: string) => { 
    try { 
      const enhanced = await enhanceResumeSection(section, content); 
      if (path === 'summary') { 
        setResume(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, summary: enhanced } })); 
      } 
    } catch (error) { 
      console.error(error); 
    } 
  }; 

  const downloadPDF = async () => { 
    if (!resumeRef.current) return; 
    
    try {
      // Ensure the canvas fully captures the document without missing regions
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: resumeRef.current.scrollWidth,
        height: resumeRef.current.scrollHeight,
        windowWidth: resumeRef.current.scrollWidth,
        windowHeight: resumeRef.current.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png'); 
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      }); 
      
      const pdfWidth = pdf.internal.pageSize.getWidth(); 
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Calculate ratios to fit it on A4, shrinking if it exceeds page dimensions
      const widthRatio = pdfWidth / canvasWidth;
      const heightRatio = pdfHeight / canvasHeight;
      const ratio = Math.min(widthRatio, heightRatio);

      const finalImgWidth = canvasWidth * ratio;
      const finalImgHeight = canvasHeight * ratio;
      
      // Center horizontally, align top
      const xOffset = (pdfWidth - finalImgWidth) / 2;
      
      pdf.addImage(imgData, 'PNG', xOffset, 0, finalImgWidth, finalImgHeight); 
      pdf.save(`${resume.personalInfo.fullName || 'resume'}.pdf`); 
      
      // Update the user's dashboard activity log
      if (auth.currentUser?.email) {
        dataService.addResume(auth.currentUser.email).catch(err => console.error("Could not sync resume creation:", err));
      }
    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("Failed to export PDF. Please try again.");
    }
  }; 

  const theme = {
    classic: { primary: '#141414', secondary: '#666666', border: '#141414', accent: '#2563eb', uppercaseTitle: true },
    modern: { primary: '#1e293b', secondary: '#64748b', border: '#e2e8f0', accent: '#3b82f6', uppercaseTitle: false },
    creative: { primary: '#111827', secondary: '#4b5563', border: '#10b981', accent: '#10b981', uppercaseTitle: true },
    executive: { primary: '#0f172a', secondary: '#475569', border: '#334155', accent: '#0f172a', uppercaseTitle: true },
    tech: { primary: '#1f2937', secondary: '#6b7280', border: '#8b5cf6', accent: '#8b5cf6', uppercaseTitle: false },
  }[resumeStyle];

  return ( 
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto p-6"> 
      <AnimatePresence>
        {showSample && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#11141a] p-8 rounded-[2rem] border border-[#141414]/10 dark:border-white/10 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar relative"
            >
              <button 
                onClick={() => setShowSample(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all text-gray-500"
              >
                <X size={20} />
              </button>
              
              <div className="flex justify-between items-center mb-6 pr-12">
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Sample Resume Data</h2>
                <button 
                  onClick={handleCopySample}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Sample'}
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-black/40 rounded-xl p-6 border border-black/5 dark:border-white/5">
                <pre className="text-xs font-mono whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                  {SAMPLE_PROMPT}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Side */} 
      <div className="space-y-6"> 
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-[#141414]/10 dark:border-white/10 shadow-xl backdrop-blur-sm"
        > 
          <h2 className="text-xl font-black tracking-tight uppercase flex items-center gap-3 mb-6"> 
            <Sparkles size={24} className="text-blue-500" /> 
            AI Import 
          </h2> 
          <textarea 
            placeholder="Paste your raw experience, skills, or old resume text here..." 
            className="w-full h-48 p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-[#141414]/10 dark:border-white/5 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono transition-all" 
            value={rawText} 
            onChange={(e) => setRawText(e.target.value)} 
          /> 
          <button 
            onClick={handleParse} 
            disabled={isParsing} 
            className="mt-6 w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 shadow-xl shadow-blue-500/20" 
          > 
            {isParsing ? 'Processing...' : 'Generate Structured Resume'} 
          </button> 
        </motion.section> 

        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-[#141414]/10 dark:border-white/10 shadow-xl space-y-6 backdrop-blur-sm"
        > 
          <h2 className="text-xl font-black tracking-tight uppercase flex items-center gap-3">
            <User size={24} className="text-blue-500" />
            Personal Details
          </h2> 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Full Name</label>
              <input 
                placeholder="Sebastian Bennett" 
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                value={resume.personalInfo.fullName} 
                onChange={(e) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, fullName: e.target.value } })} 
              /> 
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Email Address</label>
              <input 
                placeholder="hello@reallygreatsite.com" 
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                value={resume.personalInfo.email} 
                onChange={(e) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, email: e.target.value } })} 
              /> 
            </div>
          </div> 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Phone Number</label>
              <input 
                placeholder="+123-456-7890" 
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                value={resume.personalInfo.phone} 
                onChange={(e) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, phone: e.target.value } })} 
              /> 
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Location</label>
              <input 
                placeholder="123 Anywhere St., Any City" 
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                value={resume.personalInfo.location} 
                onChange={(e) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, location: e.target.value } })} 
              /> 
            </div>
          </div> 
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Professional Summary</label>
              <button 
                onClick={() => handleEnhance('Professional Summary', resume.personalInfo.summary, 'summary')} 
                className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 hover:underline" 
              > 
                <Sparkles size={12} /> Enhance with AI 
              </button> 
            </div>
            <textarea 
              placeholder="Briefly describe your career goals and key achievements..." 
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32" 
              value={resume.personalInfo.summary} 
              onChange={(e) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, summary: e.target.value } })} 
            /> 
          </div>
        </motion.section> 

        {/* Experience Section */} 
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-[#141414]/10 dark:border-white/10 shadow-xl space-y-6 backdrop-blur-sm"
        > 
          <div className="flex justify-between items-center border-b border-[#141414]/5 dark:border-white/5 pb-4"> 
            <h2 className="text-xl font-black tracking-tight uppercase flex items-center gap-3">
              <Briefcase size={24} className="text-blue-500" />
              Work Experience
            </h2> 
            <button 
              onClick={() => setResume({ ...resume, experience: [...(resume.experience || []), { company: '', role: '', startDate: '', endDate: '', description: '' }] })} 
              className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all border border-blue-500/20" 
            > 
              <Plus size={20} /> 
            </button> 
          </div> 
          <div className="space-y-8">
            {(resume.experience || []).map((exp, idx) => ( 
              <div key={idx} className="p-6 bg-slate-50 dark:bg-black/20 rounded-3xl border border-[#141414]/5 dark:border-white/5 space-y-4 relative group"> 
                <button 
                  onClick={() => setResume({ ...resume, experience: (resume.experience || []).filter((_, i) => i !== idx) })} 
                  className="absolute top-4 right-4 text-red-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100" 
                > 
                  <Trash2 size={16} /> 
                </button> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                  <input placeholder="Job Role" className="p-3 rounded-xl bg-white dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={exp.role} onChange={(e) => { 
                    const newExp = [...(resume.experience || [])]; 
                    newExp[idx].role = e.target.value; 
                    setResume({ ...resume, experience: newExp }); 
                  }} /> 
                  <input placeholder="Company Name" className="p-3 rounded-xl bg-white dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={exp.company} onChange={(e) => { 
                    const newExp = [...(resume.experience || [])]; 
                    newExp[idx].company = e.target.value; 
                    setResume({ ...resume, experience: newExp }); 
                  }} /> 
                </div> 
                <div className="grid grid-cols-2 gap-4"> 
                  <input placeholder="Start Date" className="p-3 rounded-xl bg-white dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={exp.startDate} onChange={(e) => { 
                    const newExp = [...(resume.experience || [])]; 
                    newExp[idx].startDate = e.target.value; 
                    setResume({ ...resume, experience: newExp }); 
                  }} /> 
                  <input placeholder="End Date" className="p-3 rounded-xl bg-white dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={exp.endDate} onChange={(e) => { 
                    const newExp = [...(resume.experience || [])]; 
                    newExp[idx].endDate = e.target.value; 
                    setResume({ ...resume, experience: newExp }); 
                  }} /> 
                </div> 
                <textarea placeholder="Description (STAR Method recommended)" className="w-full p-3 rounded-xl bg-white dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none h-24" value={exp.description} onChange={(e) => { 
                  const newExp = [...(resume.experience || [])]; 
                  newExp[idx].description = e.target.value; 
                  setResume({ ...resume, experience: newExp }); 
                }} /> 
              </div> 
            ))}
          </div>
        </motion.section> 

        {/* Internships Section */} 
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-[#141414]/10 dark:border-white/10 shadow-xl space-y-6 backdrop-blur-sm"
        > 
          <div className="flex justify-between items-center border-b border-[#141414]/5 dark:border-white/5 pb-4"> 
            <h2 className="text-xl font-black tracking-tight uppercase flex items-center gap-3">
              <Briefcase size={24} className="text-blue-500" />
              Internships
            </h2> 
            <button 
              onClick={() => setResume({ ...resume, internships: [...(resume.internships || []), { company: '', role: '', startDate: '', endDate: '', description: '' }] })} 
              className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all border border-blue-500/20" 
            > 
              <Plus size={20} /> 
            </button> 
          </div> 
          <div className="space-y-8">
            {(resume.internships || []).map((exp, idx) => ( 
              <div key={idx} className="p-6 bg-slate-50 dark:bg-black/20 rounded-3xl border border-[#141414]/5 dark:border-white/5 space-y-4 relative group"> 
                <button 
                  onClick={() => setResume({ ...resume, internships: (resume.internships || []).filter((_, i) => i !== idx) })} 
                  className="absolute top-4 right-4 text-red-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100" 
                > 
                  <Trash2 size={16} /> 
                </button> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                  <input placeholder="Internship Role" className="p-3 rounded-xl bg-white dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={exp.role} onChange={(e) => { 
                    const newExp = [...(resume.internships || [])]; 
                    newExp[idx].role = e.target.value; 
                    setResume({ ...resume, internships: newExp }); 
                  }} /> 
                  <input placeholder="Company Name" className="p-3 rounded-xl bg-white dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={exp.company} onChange={(e) => { 
                    const newExp = [...(resume.internships || [])]; 
                    newExp[idx].company = e.target.value; 
                    setResume({ ...resume, internships: newExp }); 
                  }} /> 
                </div> 
                <div className="grid grid-cols-2 gap-4"> 
                  <input placeholder="Start Date" className="p-3 rounded-xl bg-white dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={exp.startDate} onChange={(e) => { 
                    const newExp = [...(resume.internships || [])]; 
                    newExp[idx].startDate = e.target.value; 
                    setResume({ ...resume, internships: newExp }); 
                  }} /> 
                  <input placeholder="End Date" className="p-3 rounded-xl bg-white dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={exp.endDate} onChange={(e) => { 
                    const newExp = [...(resume.internships || [])]; 
                    newExp[idx].endDate = e.target.value; 
                    setResume({ ...resume, internships: newExp }); 
                  }} /> 
                </div> 
                <textarea placeholder="Description (STAR Method recommended)" className="w-full p-3 rounded-xl bg-white dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none h-24" value={exp.description} onChange={(e) => { 
                  const newExp = [...(resume.internships || [])]; 
                  newExp[idx].description = e.target.value; 
                  setResume({ ...resume, internships: newExp }); 
                }} /> 
              </div> 
            ))}
          </div>
        </motion.section> 

        {/* Education Section */} 
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-[#141414]/10 dark:border-white/10 shadow-xl space-y-6 backdrop-blur-sm"
        > 
          <div className="flex justify-between items-center border-b border-[#141414]/5 dark:border-white/5 pb-4"> 
            <h2 className="text-xl font-black tracking-tight uppercase flex items-center gap-3">
              <GraduationCap size={24} className="text-blue-500" />
              Education
            </h2> 
            <button 
              onClick={() => setResume({ ...resume, education: [...(resume.education || []), { school: '', degree: '', graduationDate: '' }] })} 
              className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all border border-blue-500/20" 
            > 
              <Plus size={20} /> 
            </button> 
          </div> 
          <div className="space-y-6">
            {(resume.education || []).map((edu, idx) => ( 
              <div key={idx} className="p-6 bg-slate-50 dark:bg-black/20 rounded-3xl border border-[#141414]/5 dark:border-white/5 space-y-4 relative group"> 
                <button 
                  onClick={() => setResume({ ...resume, education: (resume.education || []).filter((_, i) => i !== idx) })} 
                  className="absolute top-4 right-4 text-red-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100" 
                > 
                  <Trash2 size={16} /> 
                </button> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                  <input placeholder="School/University" className="p-3 rounded-xl bg-white dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={edu.school} onChange={(e) => { 
                    const newEdu = [...(resume.education || [])]; 
                    newEdu[idx].school = e.target.value; 
                    setResume({ ...resume, education: newEdu }); 
                  }} /> 
                  <input placeholder="Degree" className="p-3 rounded-xl bg-white dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={edu.degree} onChange={(e) => { 
                    const newEdu = [...(resume.education || [])]; 
                    newEdu[idx].degree = e.target.value; 
                    setResume({ ...resume, education: newEdu }); 
                  }} /> 
                </div> 
                <input placeholder="Graduation Date" className="w-full p-3 rounded-xl bg-white dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={edu.graduationDate} onChange={(e) => { 
                    const newEdu = [...(resume.education || [])]; 
                    newEdu[idx].graduationDate = e.target.value; 
                    setResume({ ...resume, education: newEdu }); 
                }} /> 
              </div> 
            ))} 
          </div>
        </motion.section> 

        {/* Skills Section */} 
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-[#141414]/10 dark:border-white/10 shadow-xl space-y-6 backdrop-blur-sm"
        > 
          <h2 className="text-xl font-black tracking-tight uppercase flex items-center gap-3">
            <Code size={24} className="text-blue-500" />
            Core Skills
          </h2> 
          <input 
            placeholder="Add skill (press Enter)" 
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            onKeyDown={(e) => { 
              if (e.key === 'Enter') { 
                const val = e.currentTarget.value.trim(); 
                if (val && !resume.skills?.includes(val)) { 
                  setResume({ ...resume, skills: [...(resume.skills || []), val] }); 
                  e.currentTarget.value = ''; 
                } 
              } 
            }} 
          /> 
          <div className="flex flex-wrap gap-3"> 
            {(resume.skills || []).map((skill, idx) => ( 
              <span key={idx} className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-black uppercase tracking-widest group transition-all hover:bg-blue-500/20"> 
                {skill} 
                <button onClick={() => setResume({ ...resume, skills: (resume.skills || []).filter((_, i) => i !== idx) })}> 
                  <Trash2 size={12} className="opacity-40 group-hover:opacity-100 group-hover:text-red-400 transition-all" /> 
                </button> 
              </span> 
            ))} 
          </div> 
        </motion.section>

        {/* Additional Sections */} 
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-[#141414]/10 dark:border-white/10 shadow-xl space-y-6 backdrop-blur-sm"
        > 
          <div className="flex justify-between items-center border-b border-[#141414]/5 dark:border-white/5 pb-4"> 
            <h2 className="text-xl font-black tracking-tight uppercase flex items-center gap-3">
              <Globe size={24} className="text-blue-500" />
              Additional Sections
            </h2> 
            <button 
              onClick={() => setResume({ ...resume, additionalSections: [...(resume.additionalSections || []), { title: '', content: '' }] })} 
              className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all border border-blue-500/20" 
            > 
              <Plus size={20} /> 
            </button> 
          </div> 
          <div className="space-y-6">
            {(resume.additionalSections || []).map((sec, idx) => ( 
              <div key={idx} className="p-6 bg-slate-50 dark:bg-black/20 rounded-3xl border border-[#141414]/5 dark:border-white/5 space-y-4 relative group"> 
                <button 
                  onClick={() => setResume({ ...resume, additionalSections: (resume.additionalSections || []).filter((_, i) => i !== idx) })} 
                  className="absolute top-4 right-4 text-red-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100" 
                > 
                  <Trash2 size={16} /> 
                </button> 
                <input placeholder="Section Title (e.g. LANGUAGES)" className="w-full p-3 rounded-xl bg-white dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-500 outline-none" value={sec.title} onChange={(e) => { 
                  const newSec = [...(resume.additionalSections || [])]; 
                  newSec[idx].title = e.target.value; 
                  setResume({ ...resume, additionalSections: newSec }); 
                }} /> 
                <textarea placeholder="Content" className="w-full p-3 rounded-xl bg-white dark:bg-black/20 border border-[#141414]/5 dark:border-white/5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none h-32" value={sec.content} onChange={(e) => { 
                  const newSec = [...(resume.additionalSections || [])]; 
                  newSec[idx].content = e.target.value; 
                  setResume({ ...resume, additionalSections: newSec }); 
                }} /> 
              </div> 
            ))} 
          </div>
        </motion.section> 
      </div> 

      {/* Preview Side */} 
      <div className="sticky top-24 h-fit pb-12"> 
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"> 
          <button 
            onClick={() => setShowSample(true)}
            className="text-sm font-black uppercase tracking-[0.3em] opacity-30 hover:opacity-100 transition-opacity italic flex items-center gap-3 cursor-pointer group"
          >
            <FileText size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
            Sample Prompt
          </button>
          <div className="flex flex-wrap gap-2 justify-end"> 
            <button onClick={downloadPDF} className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 group"> 
              <Download size={20} className="group-hover:scale-110 transition-transform" /> Export High-Res PDF 
            </button> 
          </div> 
        </div> 
        
        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
          <div 
            ref={resumeRef} 
            className={`bg-white p-[20mm] shadow-2xl rounded-sm overflow-hidden mx-auto transition-colors duration-300 ${
              resumeStyle === 'classic' ? 'font-serif text-[#141414]' : 
              resumeStyle === 'modern' ? 'font-sans text-slate-800' :
              resumeStyle === 'creative' ? 'font-sans text-gray-900' :
              resumeStyle === 'executive' ? 'font-serif text-slate-900' :
              'font-mono text-gray-800'
            }`} 
            style={{ width: '210mm', minHeight: '297mm', backgroundColor: '#ffffff', flexShrink: 0 }} 
          > 
            <header className={`text-center pb-10 mb-10 ${resumeStyle === 'creative' ? 'bg-emerald-50 -mt-[20mm] -mx-[20mm] p-[20mm] pt-[30mm]' : ''}`} style={{ borderBottom: `2px solid ${theme.border}` }}> 
            <h1 className={`text-5xl font-black tracking-tighter mb-4 leading-none ${theme.uppercaseTitle ? 'uppercase' : 'capitalize'}`} style={{ color: theme.primary }}>{resume.personalInfo.fullName || 'YOUR NAME'}</h1> 
            <div className={`font-bold uppercase tracking-widest flex items-center justify-center gap-x-3 whitespace-nowrap ${
              ((resume.personalInfo.email?.length || 0) + (resume.personalInfo.phone?.length || 0) + (resume.personalInfo.location?.length || 0)) > 60 
                ? 'text-[9px]' 
                : ((resume.personalInfo.email?.length || 0) + (resume.personalInfo.phone?.length || 0) + (resume.personalInfo.location?.length || 0)) > 45 
                  ? 'text-[10px]' 
                  : 'text-xs'
            }`} style={{ color: theme.secondary }}> 
              <span>{resume.personalInfo.email || 'email@example.com'}</span> 
              <span>•</span> 
              <span>{resume.personalInfo.phone || 'Phone'}</span> 
              <span>•</span> 
              <span className="truncate">{resume.personalInfo.location || 'Location'}</span> 
            </div> 
          </header> 

          {resume.personalInfo.summary && ( 
            <section className="mb-10"> 
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 pb-2" style={{ borderBottom: `1px solid ${resumeStyle === 'classic' ? '#e5e5e5' : theme.border}`, color: theme.primary }}>Professional Summary</h3> 
              <p className={`text-sm leading-relaxed ${resumeStyle === 'classic' ? 'italic' : ''}`} style={{ color: theme.primary, opacity: 0.9 }}>{resume.personalInfo.summary}</p> 
            </section> 
          )} 

          {resume.experience && resume.experience.length > 0 && (
            <section className="mb-10"> 
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 pb-2" style={{ borderBottom: `1px solid ${resumeStyle === 'classic' ? '#e5e5e5' : theme.border}`, color: theme.primary }}>Work Experience</h3> 
              <div className="space-y-8"> 
                {resume.experience.map((exp, idx) => ( 
                  <div key={idx} className="space-y-2 break-inside-avoid"> 
                    <div className="flex justify-between items-baseline gap-4 flex-wrap sm:flex-nowrap"> 
                      <h4 className="font-black text-base tracking-tight break-words flex-1" style={{ color: theme.primary, textTransform: theme.uppercaseTitle ? 'uppercase' : 'capitalize' }}>{exp.role}</h4> 
                      <span className="text-[10px] font-black font-mono uppercase tracking-widest shrink-0" style={{ color: theme.secondary }}>{exp.startDate} {exp.startDate && exp.endDate && '—'} {exp.endDate}</span> 
                    </div> 
                    <p className="text-xs font-black uppercase tracking-widest" style={{ color: theme.accent }}>{exp.company}</p> 
                    <p className="text-sm leading-relaxed" style={{ color: theme.primary, opacity: 0.8 }}>{exp.description}</p> 
                  </div> 
                ))} 
              </div> 
            </section> 
          )}

          {resume.internships && resume.internships.length > 0 && (
            <section className="mb-10"> 
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 pb-2" style={{ borderBottom: `1px solid ${resumeStyle === 'classic' ? '#e5e5e5' : theme.border}`, color: theme.primary }}>Internships</h3> 
              <div className="space-y-8"> 
                {resume.internships.map((exp, idx) => ( 
                  <div key={idx} className="space-y-2 break-inside-avoid"> 
                    <div className="flex justify-between items-baseline gap-4 flex-wrap sm:flex-nowrap"> 
                      <h4 className="font-black text-base tracking-tight break-words flex-1" style={{ color: theme.primary, textTransform: theme.uppercaseTitle ? 'uppercase' : 'capitalize' }}>{exp.role}</h4> 
                      <span className="text-[10px] font-black font-mono uppercase tracking-widest shrink-0" style={{ color: theme.secondary }}>{exp.startDate} {exp.startDate && exp.endDate && '—'} {exp.endDate}</span> 
                    </div> 
                    <p className="text-xs font-black uppercase tracking-widest" style={{ color: theme.accent }}>{exp.company}</p> 
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: theme.primary, opacity: 0.8 }}>{exp.description}</p> 
                  </div> 
                ))} 
              </div> 
            </section> 
          )}

          {resume.education && resume.education.length > 0 && (
            <section className="mb-10"> 
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 pb-2" style={{ borderBottom: `1px solid ${resumeStyle === 'classic' ? '#e5e5e5' : theme.border}`, color: theme.primary }}>Academic Background</h3> 
              <div className="space-y-6"> 
                {resume.education.map((edu, idx) => ( 
                  <div key={idx} className="space-y-1 break-inside-avoid"> 
                    <div className="flex justify-between items-baseline gap-4 flex-wrap sm:flex-nowrap"> 
                      <h4 className="font-black text-base tracking-tight break-words flex-1" style={{ color: theme.primary, textTransform: theme.uppercaseTitle ? 'uppercase' : 'capitalize' }}>{edu.degree}</h4> 
                      <span className="text-[10px] font-black font-mono uppercase tracking-widest shrink-0" style={{ color: theme.secondary }}>{edu.graduationDate}</span> 
                    </div> 
                    <p className="text-xs font-black uppercase tracking-widest" style={{ color: theme.accent }}>{edu.school}</p> 
                  </div>
                ))} 
              </div> 
            </section> 
          )}

          {resume.skills && resume.skills.length > 0 && (
            <section className="mb-10">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 pb-2" style={{ borderBottom: `1px solid ${resumeStyle === 'classic' ? '#e5e5e5' : theme.border}`, color: theme.primary }}>Core Competencies</h3>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {resume.skills.map((skill, idx) => (
                  <span key={idx} className={`text-xs font-bold uppercase tracking-widest ${resumeStyle === 'tech' ? 'bg-gray-100 px-2 py-1 rounded' : ''}`} style={{ color: theme.secondary }}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {resume.additionalSections?.map((sec, idx) => ( 
             <section key={idx} className="mb-10"> 
               <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 pb-2" style={{ borderBottom: `1px solid ${resumeStyle === 'classic' ? '#e5e5e5' : theme.border}`, color: theme.primary }}>{sec.title}</h3> 
               <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: theme.primary, opacity: 0.9 }}>{sec.content}</p> 
             </section> 
           ))}
          </div> 
        </div> 

        {/* Style Selector at Bottom */}
        <div className="mt-8 bg-white dark:bg-white/5 p-6 rounded-3xl border border-[#141414]/10 dark:border-white/10 shadow-xl backdrop-blur-sm">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-center opacity-50">Select Resume Style</h3>
          <div className="flex flex-wrap gap-3 justify-center"> 
            {(['classic', 'modern', 'creative', 'executive', 'tech'] as ResumeStyle[]).map(style => (
              <button 
                key={style}
                onClick={() => setResumeStyle(style)} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  resumeStyle === style 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105' 
                    : 'bg-blue-600/10 text-blue-500 hover:bg-blue-600/20'
                }`}
              > 
                <Sparkles size={14} className={resumeStyle === style ? 'text-white' : 'text-blue-400'} /> {style}
              </button> 
            ))}
          </div>
        </div>
      </div> 
    </div> 
  ); 
}
