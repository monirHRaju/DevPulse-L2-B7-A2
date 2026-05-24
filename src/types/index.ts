export type Role = "contributor" | "maintainer";

export type IssueType = "bug" | "feature_request";

export type IssueStatus = "open" | "in_progress" | "resolved";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  created_at: Date;
  updated_at: Date;
}

export type PublicUser = Omit<User, "password">;

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ReporterSummary {
  id: number;
  name: string;
  role: Role;
}

export interface JwtPayload {
  id: number;
  name: string;
  role: Role;
}

export interface SignupBody {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface CreateIssueBody {
  title: string;
  description: string;
  type: IssueType;
}

export interface UpdateIssueBody {
  title?: string;
  description?: string;
  type?: IssueType;
}

export interface ListIssuesQuery {
  sort?: "newest" | "oldest";
  type?: IssueType;
  status?: IssueStatus;
}

export interface IssueWithReporter
  extends Omit<Issue, "reporter_id"> {
  reporter: ReporterSummary;
}
