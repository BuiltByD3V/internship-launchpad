export type ApplicationStatus =
  | 'applied'
  | 'interviewing'
  | 'offer'
  | 'rejected'
  | 'accepted';

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

// Shape returned by POST /api/ai/analyze (mirrors the server's json_schema).
export interface SkillGap {
  skill: string;
  importance: 'high' | 'medium' | 'low';
  howToLearn: string;
}

export interface InterviewQuestion {
  question: string;
  category: 'technical' | 'behavioral' | 'role-specific';
}

export interface JobAnalysis {
  skillGaps: SkillGap[];
  interviewQuestions: InterviewQuestion[];
}

export type ExperienceLevel = 'none' | 'some' | 'experienced';

export interface Profile {
  user_id: string;
  school: string | null;
  major: string | null;
  grad_year: number | null;
  skills: string[];
  target_role: string | null;
  experience_level: ExperienceLevel | null;
  experience_summary: string | null;
  interests: string[];
  github_url: string | null;
  portfolio_url: string | null;
  location: string | null;
  work_auth: string | null;
  preferred_industries: string[];
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

// Fields the form submits (server owns user_id/onboarded/timestamps).
export interface ProfileInput {
  school: string | null;
  major: string | null;
  grad_year: number | null;
  skills: string[];
  target_role: string | null;
  experience_level: ExperienceLevel | null;
  experience_summary: string | null;
  interests: string[];
  github_url: string | null;
  portfolio_url: string | null;
  location: string | null;
  work_auth: string | null;
  preferred_industries: string[];
}
