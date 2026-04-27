export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  school: string;
  degree: string;
  graduationDate: string;
}

export interface Project {
  name: string;
  description: string;
  link?: string;
}

export interface AdditionalSection {
  title: string;
  content: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  internships: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  additionalSections?: AdditionalSection[];
}

export interface InterviewConfig {
  jobTitle: string;
  company: string;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Executive';
  yearsOfExperience: number;
  resumeText?: string;
}

export interface TranscriptEntry {
  role: 'interviewer' | 'user';
  text: string;
  timestamp: number;
  feedback?: {
    grammar?: string;
    negativeWords?: string[];
    betterAlternative?: string;
  };
}

export interface Feedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  grammarErrors: string[];
  fillerWords: Record<string, number>;
  improvedAnswers: string[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
}

export interface InterviewFeedback extends Feedback {
  eyeContactScore: number;
  confidenceScore: number;
  overallPerformance: string;
  grade?: string;
  points?: number;
  wordsSpoken?: number;
  timeTaken?: string;
}
export interface ResumeActivity {
  id: string;
  timestamp: string;
}

export interface UserActivity {
  role: string;
  checkboxes: Record<string, boolean>;
  timestamp: string;
}

export interface UserData {
  email: string;
  displayName?: string;
  photoURL?: string;
  default_role: string;
  activity: Record<string, UserActivity>; // date string "YYYY-MM-DD" -> activity
  resumes: ResumeActivity[];
}

export interface AppData {
  users: UserData[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  resumesCreated: number;
  selectedRole?: string;
  progress: Record<string, boolean>; // e.g., { "week1-task1": true }
}

export interface SkillStep {
  topic: string;
  duration: string;
  description: string;
  subtopics: string[];
  resources: {
    website: string;
    youtube: string;
  };
}

export interface SkillPathData {
  role: string;
  roadmap: SkillStep[];
}
