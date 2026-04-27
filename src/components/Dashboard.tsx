import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout, 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Calendar, 
  Target, 
  ChevronRight, 
  RefreshCcw,
  BarChart3,
  PieChart as PieChartIcon,
  Search,
  Plus,
  Trash2,
  User as UserIcon,
  Settings,
  Camera,
  Briefcase,
  LogOut,
  X,
  AlertCircle,
  Check,
  Edit2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { User as FirebaseUser, updateProfile } from 'firebase/auth';
import { dataService } from '../services/dataService';
import { generateSkillPath } from '../services/aiService';
import { SkillPathData, UserData } from '../types';

interface DashboardProps {
  user: FirebaseUser;
  theme: 'light' | 'dark';
}

export default function Dashboard({ user, theme }: DashboardProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentPath, setCurrentPath] = useState<SkillPathData | null>(null);
  const [loading, setLoading] = useState(false);
  const [todayProgress, setTodayProgress] = useState<Record<string, boolean>>({});
  
  // Modals & Popups
  const [showRoleConfirm, setShowRoleConfirm] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  
  // Profile Form
  const [newName, setNewName] = useState(user.displayName || '');
  const [newPhoto, setNewPhoto] = useState(user.photoURL || '');

  useEffect(() => {
    if (user.email) {
      refreshData();
    }
  }, [user.email]);

  useEffect(() => {
    if (userData?.default_role) {
      loadRoadmap(userData.default_role);
    }
  }, [userData?.default_role, currentPath?.role]);

  const refreshData = async () => {
    const data = await dataService.getUserData(user.email!);
    if (data) {
      setUserData(data);
      const today = new Date().toISOString().split('T')[0];
      if (data.activity && data.activity[today]) {
        setTodayProgress(data.activity[today].checkboxes || {});
      } else {
        setTodayProgress({});
      }
    }
  };

  const loadRoadmap = async (role: string) => {
    if (currentPath?.role === role) return;
    setLoading(true);
    try {
      const path = await generateSkillPath(role);
      setCurrentPath(path);
    } catch (error) {
      console.error("Failed to load roadmap:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChangeRequest = (role: string) => {
    if (role === userData?.default_role) return;
    setShowRoleConfirm(role);
  };

  const confirmRoleChange = async () => {
    if (!showRoleConfirm) return;
    const roleToSet = showRoleConfirm;
    setShowRoleConfirm(null);
    setLoading(true);
    
    try {
      await dataService.setDefaultRole(user.email!, roleToSet);
      await refreshData();
      setAlertMessage(`Success! Your path has been updated to ${roleToSet}.`);
    } catch (error) {
      console.error("Failed to change role:", error);
      setAlertMessage("Failed to change career path. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxToggle = async (taskId: string) => {
    if (loading) return;
    const isCurrentlyChecked = todayProgress[taskId];
    const anyCheckedToday = Object.values(todayProgress).some(v => v);

    if (!isCurrentlyChecked && anyCheckedToday) {
      setAlertMessage("You can only complete one task per day to ensure consistent learning!");
      return;
    }

    setLoading(true);
    try {
      const newProgress = {
        ...todayProgress,
        [taskId]: !isCurrentlyChecked
      };

      setTodayProgress(newProgress);
      await dataService.updateUserActivity(user.email!, currentPath?.role || userData?.default_role || '', newProgress);
      await refreshData();
    } catch (error) {
      console.error("Failed to update activity:", error);
      setAlertMessage("Failed to update progress. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(user, {
        displayName: newName,
        photoURL: newPhoto
      });
      await dataService.updateProfile(user.email!, { displayName: newName, photoURL: newPhoto });
      setShowProfileEdit(false);
      setAlertMessage("Profile updated successfully!");
    } catch (error: any) {
      setAlertMessage(`Failed to update profile: ${error.message}`);
    }
  };

  const overallProgress = useMemo(() => {
    if (!currentPath || !userData) return 0;
    const completedTasks = new Set();
    if (userData.activity) {
      Object.values(userData.activity).forEach(day => {
          if (day.role === currentPath.role) {
              Object.entries(day.checkboxes).forEach(([id, val]) => {
                  if (val) completedTasks.add(id);
              });
          }
      });
    }
    const totalTasks = 4 * 6; // 6 tasks per week
    return Math.round((completedTasks.size / totalTasks) * 100);
  }, [currentPath, userData]);

  const resumeChartData = useMemo(() => {
    if (!userData?.resumes) return [];
    const counts: Record<string, number> = {};
    userData.resumes.forEach(r => {
      const date = r.timestamp.split('T')[0];
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [userData]);

  const getWeekProgress = (weekNum: number) => {
    if (!currentPath || !userData) return { completed: 0, percentage: 0 };
    const module = currentPath.roadmap[weekNum - 1];
    if (!module) return { completed: 0, percentage: 0 };
    
    let completed = 0;
    const total = module.subtopics?.length || 6;
    
    module.subtopics?.forEach((_, idx) => {
        const taskId = `module-${weekNum - 1}-${idx}`;
        const isDone = userData.activity && Object.values(userData.activity).some(day => 
            day.role === currentPath.role && day.checkboxes[taskId]
        );
        if (isDone) completed++;
    });
    
    return {
      completed,
      percentage: Math.round((completed / total) * 100)
    };
  };

  const allRoles = [
    "DATA ANALYST", "WEB DEVELOPER", "SOFTWARE ENGINEER", 
    "CHIEF AI OFFICER", "AI ETHICS MANAGER", "PRODUCT MANAGER",
    "UX DESIGNER", "CHIEF SUSTAINABILITY OFFICER", "DIGITAL TRANSFORMATION MANAGER",
    "CEO", "CFO", "CMO", "CHRO"
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-12">
      {/* ALERTS & MODALS */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md"
          >
            <div className="bg-[#1a1d23] border border-blue-500/50 rounded-2xl p-6 shadow-2xl flex items-center gap-4">
              <AlertCircle className="text-blue-500 shrink-0" size={24} />
              <p className="text-sm font-bold flex-grow">{alertMessage}</p>
              <button onClick={() => setAlertMessage(null)}><X size={18} /></button>
            </div>
          </motion.div>
        )}

        {showRoleConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#1a1d23] border border-white/10 rounded-[3rem] p-10 max-w-md w-full text-center space-y-8"
            >
              <div className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-3xl flex items-center justify-center mx-auto">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black">Change Career Path?</h3>
                <p className="text-sm opacity-50">Switching to <span className="text-blue-500 font-bold">{showRoleConfirm}</span> will update your roadmap. Your progress on other paths will be preserved.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowRoleConfirm(null)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 font-black uppercase text-xs tracking-widest hover:bg-white/10"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRoleChange}
                  className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Profile & Target Role */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-[#1a1d23] rounded-[2.5rem] p-8 border border-white/5 space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-3xl flex items-center justify-center overflow-hidden border-2 border-white/5">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-emerald-500 text-4xl font-black">{user.displayName?.[0] || 'U'}</span>
                  )}
                </div>
                <button 
                  onClick={() => setShowProfileEdit(true)}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg border-4 border-[#1a1d23] hover:scale-110 transition-transform"
                >
                  <Camera size={14} />
                </button>
              </div>
              
              {showProfileEdit ? (
                <div className="w-full space-y-3">
                  <input 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Display Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <input 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Photo URL"
                    value={newPhoto}
                    onChange={(e) => setNewPhoto(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowProfileEdit(false)} className="flex-1 p-2 rounded-lg bg-white/5 text-[10px] font-black uppercase">Cancel</button>
                    <button onClick={handleUpdateProfile} className="flex-1 p-2 rounded-lg bg-blue-600 text-[10px] font-black uppercase">Save</button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-black tracking-tight flex items-center justify-center gap-2 text-white">
                    {user.displayName} <Edit2 size={14} className="opacity-20 cursor-pointer hover:opacity-100" onClick={() => setShowProfileEdit(true)} />
                  </h2>
                  <p className="text-xs font-medium opacity-40 text-white">{user.email}</p>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-white">Total Resumes</p>
                <p className="text-sm font-black text-white">{userData?.resumes?.length || 0}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-white">Active Path</p>
                <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest max-w-[120px] truncate text-right">
                  {userData?.default_role || 'NONE'}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-white">Path Progress</p>
                <p className="text-sm font-black text-emerald-500">{overallProgress}%</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1d23] rounded-[2.5rem] p-8 border border-white/5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
                <Target size={18} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Target Role</h3>
            </div>
            <div className="relative">
                <select 
                className={`w-full appearance-none border border-white/10 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest outline-none transition-all cursor-pointer ${
                    theme === 'dark' ? 'bg-black/40 text-white' : 'bg-white text-black shadow-sm'
                } focus:ring-2 focus:ring-blue-500`}
                value={userData?.default_role || ''}
                onChange={(e) => handleRoleChangeRequest(e.target.value)}
                >
                <option value="" disabled>Select Role</option>
                {allRoles.sort().map(role => (
                    <option key={role} value={role}>{role}</option>
                ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 opacity-40 pointer-events-none text-white" size={16} />
            </div>
          </div>
        </div>

        {/* MIDDLE/RIGHT COLUMNS */}
        <div className="lg:col-span-9 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Resume Activity Card - Line Graph */}
            <div className="bg-[#1a1d23] rounded-[3rem] p-10 border border-white/5 min-h-[400px] flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-500">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-xl font-black tracking-tight text-white">Resume Activity</h3>
              </div>
              <div className="flex-grow w-full">
                {resumeChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={resumeChartData}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="date" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1d23', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-10">
                    <BarChart3 size={64} className="text-white" />
                    <p className="text-xs font-black uppercase tracking-widest text-white">No Resumes Created</p>
                  </div>
                )}
              </div>
              
              {/* Weekly Pie Charts Row */}
              <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
                {[1, 2, 3, 4].map((num) => {
                    const prog = getWeekProgress(num);
                    return (
                        <div key={num} className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { value: prog.completed },
                                                { value: 6 - prog.completed }
                                            ]}
                                            innerRadius={15}
                                            outerRadius={22}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            <Cell fill="#3b82f6" />
                                            <Cell fill="rgba(255,255,255,0.05)" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-blue-500">
                                    {prog.percentage}%
                                </div>
                            </div>
                            <p className="text-[8px] font-black uppercase opacity-40 text-white">Week {num}</p>
                        </div>
                    );
                })}
              </div>
            </div>

            {/* Overall Readiness Card */}
            <div className="bg-[#1a1d23] rounded-[3rem] p-10 border border-white/5 min-h-[400px] flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
                  <RefreshCcw size={20} />
                </div>
                <h3 className="text-xl font-black tracking-tight text-white">Overall Readiness</h3>
              </div>
              <div className="flex-grow flex items-center justify-center relative">
                <div className="w-48 h-48 rounded-full border-[12px] border-white/5 flex items-center justify-center">
                  <div className="text-4xl font-black text-emerald-500">{overallProgress}%</div>
                  <svg className="absolute w-48 h-48 -rotate-90 pointer-events-none">
                    <circle
                      cx="96" cy="96" r="84" fill="transparent" stroke="currentColor" strokeWidth="12"
                      strokeDasharray={2 * Math.PI * 84}
                      strokeDashoffset={2 * Math.PI * 84 * (1 - overallProgress / 100)}
                      className="text-emerald-500 transition-all duration-1000 ease-out"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ROADMAP SECTION - ALL WEEKS VISIBLE */}
          <div className="bg-[#1a1d23] rounded-[3rem] p-10 border border-white/5 space-y-12">
            <div className="flex items-center gap-4 border-b border-white/5 pb-8">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase text-white">Learning Roadmap</h2>
                <p className="text-xs font-medium opacity-40 uppercase tracking-widest text-white">{userData?.default_role}</p>
              </div>
            </div>

            <div className="space-y-20 min-h-[400px] relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-[#1a1d23]/50 backdrop-blur-sm rounded-[3rem] z-10">
                  <RefreshCcw className="w-12 h-12 text-blue-500 animate-spin" />
                  <p className="text-sm font-black uppercase tracking-widest opacity-40">Loading your roadmap...</p>
                </div>
              ) : currentPath?.roadmap.map((module, mIdx) => (
                <div key={mIdx} className="space-y-8 bg-black/10 p-8 rounded-[2.5rem] border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600/20 text-blue-500 rounded-xl flex items-center justify-center font-black text-xs border border-blue-500/20">
                      {mIdx + 1}
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-lg font-black uppercase tracking-tight text-white">{module.topic}</h3>
                        <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest text-white">{module.duration}</p>
                    </div>
                    <div className="flex-grow h-[1px] bg-white/5" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {module.subtopics?.map((sub, sIdx) => {
                      const taskId = `module-${mIdx}-${sIdx}`;
                      const isCompleted = userData?.activity && Object.values(userData.activity).some(day => 
                        day.role === currentPath.role && day.checkboxes[taskId]
                      );
                      
                      return (
                        <button
                          key={sIdx}
                          onClick={() => handleCheckboxToggle(taskId)}
                          className={`flex items-center justify-between p-6 rounded-3xl border transition-all text-left group ${
                            isCompleted 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                              : 'bg-[#1a1d23] border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-white/10'}`}>
                              {isCompleted && <Check size={14} className="text-white" />}
                            </div>
                            <span className="text-sm font-bold leading-tight text-white">{sub}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
