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
