import { StatusCodes } from "http-status-codes";
import { pool } from "../../database/index.js";
import { AppError } from "../../utility/AppError.js";
import type {
  CreateIssueBody,
  UpdateIssueBody,
  ListIssuesQuery,
  Issue,
  IssueWithReporter,
  ReporterSummary,
  JwtPayload,
} from "../../types/index.js";

const fetchReportersByIds = async (
  ids: number[]
): Promise<Map<number, ReporterSummary>> => {
  const map = new Map<number, ReporterSummary>();
  if (ids.length === 0) return map;

  const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
  const result = await pool.query<ReporterSummary>(
    `SELECT id, name, role FROM users WHERE id IN (${placeholders})`,
    ids
  );

  for (const row of result.rows) {
    map.set(row.id, row);
  }
  return map;
};

const attachReporter = (
  issue: Issue,
  reporter: ReporterSummary
): IssueWithReporter => ({
  id: issue.id,
  title: issue.title,
  description: issue.description,
  type: issue.type,
  status: issue.status,
  reporter,
  created_at: issue.created_at,
  updated_at: issue.updated_at,
});

export const createIssue = async (
  body: CreateIssueBody,
  reporterId: number
): Promise<Issue> => {
  const { title, description, type } = body;

  const result = await pool.query<Issue>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, reporterId]
  );

  return result.rows[0]!;
};

export const listIssues = async (
  query: ListIssuesQuery
): Promise<IssueWithReporter[]> => {
  const { sort = "newest", type, status } = query;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (type) {
    params.push(type);
    conditions.push(`type = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderClause =
    sort === "oldest" ? "ORDER BY created_at ASC" : "ORDER BY created_at DESC";

  const issuesResult = await pool.query<Issue>(
    `SELECT * FROM issues ${whereClause} ${orderClause}`,
    params
  );

  const issues = issuesResult.rows;
  if (issues.length === 0) return [];

  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];
  const reporters = await fetchReportersByIds(reporterIds);

  return issues.map((issue) => {
    const reporter = reporters.get(issue.reporter_id) ?? {
      id: issue.reporter_id,
      name: "Unknown",
      role: "contributor" as const,
    };
    return attachReporter(issue, reporter);
  });
};

export const getIssueById = async (id: number): Promise<IssueWithReporter> => {
  const issueResult = await pool.query<Issue>(
    "SELECT * FROM issues WHERE id = $1",
    [id]
  );

  const issue = issueResult.rows[0];
  if (!issue) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  const reporterResult = await pool.query<ReporterSummary>(
    "SELECT id, name, role FROM users WHERE id = $1",
    [issue.reporter_id]
  );

  const reporter = reporterResult.rows[0] ?? {
    id: issue.reporter_id,
    name: "Unknown",
    role: "contributor" as const,
  };

  return attachReporter(issue, reporter);
};

export const updateIssue = async (
  id: number,
  body: UpdateIssueBody,
  currentUser: JwtPayload
): Promise<Issue> => {
  const existingResult = await pool.query<Issue>(
    "SELECT * FROM issues WHERE id = $1",
    [id]
  );
  const existing = existingResult.rows[0];
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  if (currentUser.role !== "maintainer") {
    if (existing.reporter_id !== currentUser.id) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "You can only update your own issues"
      );
    }
    if (existing.status !== "open") {
      throw new AppError(
        StatusCodes.CONFLICT,
        "You can only update issues while they are still open"
      );
    }
  }

  const updates: string[] = [];
  const params: (string | number)[] = [];

  if (body.title !== undefined) {
    params.push(body.title);
    updates.push(`title = $${params.length}`);
  }
  if (body.description !== undefined) {
    params.push(body.description);
    updates.push(`description = $${params.length}`);
  }
  if (body.type !== undefined) {
    params.push(body.type);
    updates.push(`type = $${params.length}`);
  }

  if (updates.length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "At least one field must be provided to update"
    );
  }

  params.push(id);
  const result = await pool.query<Issue>(
    `UPDATE issues SET ${updates.join(", ")}
     WHERE id = $${params.length}
     RETURNING *`,
    params
  );

  return result.rows[0]!;
};

export const deleteIssue = async (id: number): Promise<void> => {
  const result = await pool.query("DELETE FROM issues WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }
};
