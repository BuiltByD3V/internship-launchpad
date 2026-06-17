export type ApplicationStatus =
  | 'applied'
  | 'interviewing'
  | 'offer'
  | 'rejected'
  | 'accepted';

// Mirrors the applications table (server/db/schema.sql).
export interface Application {
  id: string;
  user_id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  deadline: string | null;
  notes: string | null;
  job_description: string | null;
  created_at: string;
}

export interface SkillGap {
  skill: string;
  importance: 'high' | 'medium' | 'low';
  howToLearn: string;
}

export interface InterviewQuestion {
  question: string;
  category: 'technical' | 'behavioral' | 'role-specific';
}

export interface JobAnalysisResult {
  skillGaps: SkillGap[];
  interviewQuestions: InterviewQuestion[];
}
