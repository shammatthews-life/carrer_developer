import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { Mic, MicOff, Video, VideoOff, Send, CheckCircle2, AlertCircle, Sparkles, Timer, BarChart3, Eye, ArrowRight, RefreshCcw } from 'lucide-react';
import { InterviewConfig, TranscriptEntry, InterviewFeedback } from '../types';
import { generateInterviewQuestions, analyzeInterviewAnswer, generateFinalFeedback } from '../services/aiService';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const renderWithMistakes = (original: string, corrected: string, negatives: string[] = [], grammarHint: string = '') => {
  if (!corrected) return <span>{original}</span>;

  const origWords = original.split(' ');
  const corrString = corrected.toLowerCase();

  return origWords.map((word, i) => {
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
    const isFiller = negatives.some(n => n.toLowerCase() === cleanWord);
    const isMissing = cleanWord.length > 0 && !corrString.includes(cleanWord);

    if (isFiller || isMissing) {
      return (
        <React.Fragment key={i}>
          <span
            className="underline decoration-red-500 decoration-wavy decoration-2 underline-offset-4 cursor-help transition-all hover:bg-red-500/10"
            title={isFiller ? "Filler word detected" : grammarHint || "Grammar mistake / expected phrasing issue"}
          >
            {word}
          </span>
          {i < origWords.length - 1 ? ' ' : ''}
        </React.Fragment>
      );
    }
    return <React.Fragment key={i}>{word}{i < origWords.length - 1 ? ' ' : ''}</React.Fragment>;
  });
};

interface InterviewSessionProps {
  config: InterviewConfig;
  onEnd: (feedback: InterviewFeedback) => void;
}

export default function InterviewSession({ config, onEnd }: InterviewSessionProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [eyeContact, setEyeContact] = useState(100);
  const [attentionScore, setAttentionScore] = useState(100);
  const [isDistracted, setIsDistracted] = useState(false);
  const [confidence, setConfidence] = useState(85);
  const [isFinished, setIsFinished] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [mistakes, setMistakes] = useState<{ type: string, timestamp: number, duration?: number }[]>([]);
  const [lastSpeechTime, setLastSpeechTime] = useState(Date.now());
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const webcamRef = useRef<Webcam>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const wpmIntervalRef = useRef<any>(null);
  const lastMistakeTime = useRef<number>(0);
  const hasBlurredMap = useRef<boolean>(false);
  const requestPermissions = async () => {
    try {
      setPermissionError(null);
      // Request both camera and audio
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // If successful, we can stop the tracks immediately and set state
      stream.getTracks().forEach(track => track.stop());
      setHasPermissions(true);
      initInterview();
    } catch (err: any) {
      console.error("Permission request failed:", err);
      if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setPermissionError("Camera or Microphone is already in use by another application. Please close other apps using your camera and try again.");
      } else {
        setPermissionError(err.message || "Could not access camera or microphone.");
      }
    }
  };

  const initInterview = async () => {
    setIsGeneratingQuestions(true);
    try {
      // Pre-warm the local Whisper and Grammar offline models
      const { getWhisperPipeline, getGrammarPipeline } = await import('../services/aiService');
      await getWhisperPipeline();
      await getGrammarPipeline();

      const qs = await generateInterviewQuestions(config);
      setQuestions(qs);
      setTranscript([{ role: 'interviewer', text: qs[0], timestamp: Date.now() }]);

      // We start local local audio streaming after models generate
      setIsRecording(true);
    } catch (error) {
      console.error("Initialization failed:", error);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const setupFaceLandmarker = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
        if (mounted) faceLandmarkerRef.current = landmarker;
      } catch (err) { }
    };
    setupFaceLandmarker();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!hasPermissions || !isRecording) return;

    // Use native webkitSpeechRecognition for 0-latency live transcript
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        setInterimText(currentInterim);

        if (finalTrans) {
          const cleanText = finalTrans.trim();
          setTranscript(prev => [...prev, { role: 'user', text: cleanText, timestamp: Date.now() }]);

          const textLower = cleanText.toLowerCase();
          if (textLower.includes('ah ') || textLower.includes('uh ') || textLower.includes('um ') || textLower.includes('like ')) {
            setMistakes(prev => [...prev, { type: 'Filler Word Used', timestamp: Date.now() }]);
          }

          analyzeAnswer(cleanText);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.error("Speech Recognition Error:", event.error);
        }
      };

      recognition.onend = () => {
        if (isRecording) {
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [hasPermissions, isRecording]);

  useEffect(() => {
    if (!hasPermissions) return;

    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    wpmIntervalRef.current = setInterval(() => {
      setTranscript(prevTr => {
        const wordsSpoken = prevTr.filter(t => t.role === 'user').reduce((acc, t) => acc + t.text.split(' ').length, 0);
        setTimer(currentTimer => {
          if (currentTimer > 10) {
            const minutes = currentTimer / 60;
            const wpm = wordsSpoken / minutes;
            let computedConfidence = 100;
            if (wpm < 50) computedConfidence = Math.max(50, wpm * 2);
            if (wpm > 180) computedConfidence = Math.max(60, 100 - (wpm - 180));
            setConfidence(Math.round(computedConfidence));
          }
          return currentTimer;
        });
        return prevTr;
      });
    }, 3000);

    const handleBlur = () => {
      setIsDistracted(true);
      if (!hasBlurredMap.current) {
        setMistakes(prev => [...prev, { type: 'Cheating Attempt: Window Blur', timestamp: Date.now() }]);
        hasBlurredMap.current = true;
      }
    };
    const handleFocus = () => setIsDistracted(false);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    let animationFrameId: number;
    let lastVideoTime = -1;

    const analyzeFrame = () => {
      if (isRecording && webcamRef.current?.video && faceLandmarkerRef.current) {
        const video = webcamRef.current.video;
        if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          try {
            const result = faceLandmarkerRef.current.detectForVideo(video, performance.now());
            if (result.facialTransformationMatrixes && result.facialTransformationMatrixes.length > 0) {
              const matrix = result.facialTransformationMatrixes[0].data;
              const pitch = Math.atan2(matrix[6], matrix[10]) * (180 / Math.PI);
              const yaw = Math.atan2(-matrix[2], Math.sqrt(matrix[6] * matrix[6] + matrix[10] * matrix[10])) * (180 / Math.PI);

              const isSlouching = pitch > 15 || pitch < -15;
              const headTurned = yaw > 30 || yaw < -30;
              const now = Date.now();

              if (headTurned) {
                if (now - lastMistakeTime.current > 3000) {
                  setMistakes(prev => [...prev, { type: 'Head Turned Completely Right/Left', timestamp: now }]);
                  lastMistakeTime.current = now;
                }
                setAttentionScore(prev => Math.max(0, prev - 3));
              } else if (isSlouching) {
                if (now - lastMistakeTime.current > 3000) {
                  setMistakes(prev => [...prev, { type: 'Slouching / Not Sitting Straight', timestamp: now }]);
                  lastMistakeTime.current = now;
                }
                setEyeContact(prev => Math.max(0, prev - 3));
              } else {
                setAttentionScore(prev => Math.min(100, prev + 1));
                setEyeContact(prev => Math.min(100, prev + 1));
              }
            } else {
              // No face
              setAttentionScore(prev => Math.max(0, prev - 5));
              setEyeContact(prev => Math.max(0, prev - 5));
            }
          } catch (err) { }
        }
      }
      animationFrameId = requestAnimationFrame(analyzeFrame);
    };

    if (isRecording) {
      analyzeFrame();
    }

    return () => {
      clearInterval(timerRef.current);
      clearInterval(wpmIntervalRef.current);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [hasPermissions, isRecording, lastSpeechTime, isFinished]);

  const analyzeAnswer = async (text: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeInterviewAnswer(questions[currentQuestionIdx], text);
      setTranscript(prev => {
        const last = prev[prev.length - 1];
        if (last.role === 'user') {
          return [...prev.slice(0, -1), { ...last, feedback: result }];
        }
        return prev;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      setTranscript(prev => [...prev, { role: 'interviewer', text: questions[nextIdx], timestamp: Date.now() }]);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    setIsFinished(true);
    const feedback = await generateFinalFeedback(transcript);
    onEnd({
      ...feedback,
      eyeContactScore: eyeContact,
      confidenceScore: confidence,
      overallPerformance: feedback.overallPerformance || "Great job!"
    } as InterviewFeedback);
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setLastSpeechTime(Date.now());
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!hasPermissions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-8 p-12 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-sm">
        <div className="w-24 h-24 bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-blue-500 mb-4 animate-pulse">
          <Video size={48} />
        </div>
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-4xl font-black tracking-tighter uppercase">Permissions Required</h2>
          <p className="text-lg font-medium opacity-50 leading-relaxed">
            To start your high-fidelity mock interview, we need access to your camera and microphone for real-time analysis.
          </p>
        </div>

        {permissionError && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold">
            <AlertCircle size={20} />
            {permissionError}
          </div>
        )}

        <button
          onClick={requestPermissions}
          className="bg-blue-600 text-white px-12 py-5 rounded-3xl font-black text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20 flex items-center gap-4 group"
        >
          Enable Camera & Mic <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
        </button>

        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 italic">
          Your data is processed in real-time and never stored.
        </p>
      </div>
    );
  }

  if (isGeneratingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <RefreshCcw className="animate-spin text-blue-500" size={64} />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black">Initializing Interview Session</h2>
          <p className="opacity-50">Preparing role-specific questions and AI monitors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Camera Feed */}
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-xl space-y-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <Video className="opacity-40" size={20} />
            <h2 className="text-xl font-black tracking-tight uppercase">Camera Feed</h2>
          </div>

          <div className="relative aspect-video bg-[#0a0c10] rounded-3xl overflow-hidden shadow-2xl border border-white/5 group">
            {cameraOn ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <VideoOff size={48} className="opacity-20" />
              </div>
            )}

            {isDistracted && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border border-red-400/50 z-30 flex items-center gap-2">
                <AlertCircle size={14} className="text-white" />
                <p className="text-white font-black text-[10px] uppercase tracking-widest">
                  Looking Away Detected
                </p>
              </div>
            )}

            {/* Overlays */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
              <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2">
                  <Timer size={16} className="text-blue-400" />
                  <span className="text-lg font-mono font-black">{formatTime(timer)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-center transition-all ${cameraOn ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            Camera Status: {cameraOn ? 'Active' : 'Disabled'}
          </div>

          <div className="flex gap-4">
            {/* Control only in Camera feed column */}
          </div>
        </div>

        {/* Right: Your Speech */}
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-xl space-y-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <Mic className="opacity-40" size={20} />
            <h2 className="text-xl font-black tracking-tight uppercase">Live Transcript</h2>
          </div>

          <div className="relative h-64 bg-black/20 rounded-3xl border border-white/5 p-6 overflow-y-auto shadow-inner custom-scrollbar">
            <div className="space-y-4">
              {transcript.filter(t => t.role === 'user').map((t, i) => (
                <p key={i} className="text-base font-medium opacity-80 leading-relaxed">
                  {t.feedback ? renderWithMistakes(t.text, t.feedback.betterAlternative || '', t.feedback.negativeWords || [], t.feedback.grammar) : t.text}
                </p>
              ))}
              {interimText && (
                <p className="text-base font-bold text-blue-400 animate-pulse">{interimText}...</p>
              )}
              {!interimText && transcript.filter(t => t.role === 'user').length === 0 && (
                <p className="text-base opacity-20 italic">Speak clearly to begin transcription...</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={finishInterview}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
            >
              {isAnalyzing ? 'Analyzing Final Results...' : 'Stop & Analyze'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: Analysis & Mistakes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 p-10 rounded-[3rem] border border-white/10 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div className="flex items-center gap-3">
              <Sparkles className="text-blue-500" size={28} />
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase leading-none mb-1">Real-time Analysis</h2>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest animate-pulse">Current Question: {currentQuestionIdx + 1}/{questions.length}</p>
              </div>
            </div>
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex-grow max-w-xl">
              <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1 italic">Interviewer says:</p>
              <p className="text-sm font-black text-blue-100 leading-relaxed italic">"{questions[currentQuestionIdx]}"</p>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Confidence</p>
                <p className="text-2xl font-black text-blue-500">{Math.round(confidence)}%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Attention</p>
                <p className="text-2xl font-black text-emerald-400">{Math.round(attentionScore)}%</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {transcript.filter(t => t.role === 'user' && t.feedback).slice(-2).map((entry, i) => (
              <div key={i} className="p-8 bg-white/5 rounded-[2rem] border border-white/5 space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Corrected Transcript
                  </p>
                  <p className="text-lg font-bold text-emerald-100 leading-relaxed italic">
                    "{entry.feedback?.betterAlternative}"
                  </p>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Notes</p>
                  <p className="text-sm font-medium opacity-70 leading-relaxed">{entry.feedback?.grammar}</p>
                </div>
              </div>
            ))}
            {transcript.filter(t => t.role === 'user' && t.feedback).length === 0 && (
              <div className="text-center py-20 opacity-20 italic font-medium border border-dashed border-white/10 rounded-3xl">
                AI is standing by for your first response...
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#11141a] p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-10 relative z-10">
            <BarChart3 className="text-blue-500" size={28} />
            <h2 className="text-2xl font-black tracking-tight uppercase">Mistake Monitor</h2>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
            {mistakes.length > 0 ? (
              mistakes.slice().reverse().map((mistake, i) => (
                <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center group hover:bg-white/10 transition-all">
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{mistake.type}</p>
                    <p className="text-[10px] opacity-30 font-bold">{new Date(mistake.timestamp).toLocaleTimeString()}</p>
                  </div>
                  {mistake.duration && (
                    <div className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-[10px] font-black border border-blue-600/30">
                      {mistake.duration}s
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-20 opacity-20 italic text-sm font-medium">
                Monitoring for fillers and head movement...
              </div>
            )}
          </div>

          <div className="mt-10 pt-10 border-t border-white/5 relative z-10">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Total Alerts</p>
                <p className="text-4xl font-black text-blue-500">{mistakes.length}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Filler Count</p>
                <p className="text-4xl font-black text-white">{mistakes.filter(m => m.type === 'Filler Word Used').length}</p>
              </div>
            </div>
          </div>

          {/* Background Glow */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full" />
        </div>
      </div>
    </div>
  );
} 
