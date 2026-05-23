import { fileURLToPath } from "node:url";
import { pool } from "./index.js";

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20)  NOT NULL DEFAULT 'contributor'
              CHECK (role IN ('contributor', 'maintainer')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issues (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(150) NOT NULL,
  description  TEXT         NOT NULL CHECK (char_length(description) >= 20),
  type         VARCHAR(20)  NOT NULL CHECK (type IN ('bug', 'feature_request')),
  status       VARCHAR(20)  NOT NULL DEFAULT 'open'
               CHECK (status IN ('open', 'in_progress', 'resolved')),
  reporter_id  INTEGER      NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS issues_set_updated_at ON issues;
CREATE TRIGGER issues_set_updated_at
BEFORE UPDATE ON issues
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
`;

export const applySchema = async (): Promise<void> => {
  await pool.query(SCHEMA_SQL);
};

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    await applySchema();
    console.log("Schema applied successfully.");
  } catch (err) {
    console.error("Schema apply failed:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
