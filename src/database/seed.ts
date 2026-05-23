import { fileURLToPath } from "node:url";
import bcrypt from "bcrypt";
import { pool } from "./index.js";
import { env } from "../config/index.js";

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
}

const SEED_USERS: SeedUser[] = [
  {
    name: "Alice Maintainer",
    email: "alice@devpulse.com",
    password: "AlicePass123",
    role: "maintainer",
  },
  {
    name: "Bob Contributor",
    email: "bob@devpulse.com",
    password: "BobPass123",
    role: "contributor",
  },
];

interface SeedIssue {
  title: string;
  description: string;
  type: "bug" | "feature_request";
  reporterEmail: string;
}

const SEED_ISSUES: SeedIssue[] = [
  {
    title: "Database connection timeout under load",
    description:
      "Pool exhausts after 50+ concurrent queries, causing 500 errors on /api/issues endpoints.",
    type: "bug",
    reporterEmail: "bob@devpulse.com",
  },
  {
    title: "Add dark mode toggle",
    description:
      "Users have requested a dark theme option in the dashboard. Persist preference per account.",
    type: "feature_request",
    reporterEmail: "alice@devpulse.com",
  },
];

const seed = async (): Promise<void> => {
  for (const user of SEED_USERS) {
    const hash = await bcrypt.hash(user.password, env.BCRYPT_ROUNDS);
    await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [user.name, user.email, hash, user.role]
    );
  }

  for (const issue of SEED_ISSUES) {
    const reporter = await pool.query<{ id: number }>(
      `SELECT id FROM users WHERE email = $1`,
      [issue.reporterEmail]
    );
    const reporterId = reporter.rows[0]?.id;
    if (!reporterId) {
      console.warn(`Skipping issue — reporter not found: ${issue.reporterEmail}`);
      continue;
    }
    await pool.query(
      `INSERT INTO issues (title, description, type, reporter_id)
       VALUES ($1, $2, $3, $4)`,
      [issue.title, issue.description, issue.type, reporterId]
    );
  }
};

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    await seed();
    console.log("Seed completed.");
  } catch (err) {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
