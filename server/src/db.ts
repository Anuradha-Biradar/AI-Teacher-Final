import { Database } from "bun:sqlite";

const db = new Database("ai-teacher.db", { create: true });

// Enable WAL mode for better concurrent reads
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    quiz TEXT,
    is_completed INTEGER DEFAULT 0,
    quiz_score REAL,
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`);

export interface CourseRow {
  id: string;
  topic: string;
  title: string;
  description: string;
  created_at: number;
}

export interface ModuleRow {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string | null;
  quiz: string | null;
  is_completed: number;
  quiz_score: number | null;
  sort_order: number;
}

export function getAllCourses(): CourseRow[] {
  return db.query("SELECT * FROM courses ORDER BY created_at DESC").all() as CourseRow[];
}

export function getCourseById(id: string): CourseRow | null {
  return db.query("SELECT * FROM courses WHERE id = ?").get(id) as CourseRow | null;
}

export function getModulesByCourseId(courseId: string): ModuleRow[] {
  return db.query("SELECT * FROM modules WHERE course_id = ? ORDER BY sort_order").all(courseId) as ModuleRow[];
}

export function insertCourse(course: CourseRow): void {
  db.query("INSERT INTO courses (id, topic, title, description, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(course.id, course.topic, course.title, course.description, course.created_at);
}

export function insertModule(mod: Omit<ModuleRow, "is_completed" | "quiz_score">): void {
  db.query("INSERT INTO modules (id, course_id, title, description, sort_order) VALUES (?, ?, ?, ?, ?)")
    .run(mod.id, mod.course_id, mod.title, mod.description, mod.sort_order);
}

export function updateModuleContent(id: string, content: string, quiz: string): void {
  db.query("UPDATE modules SET content = ?, quiz = ? WHERE id = ?")
    .run(content, quiz, id);
}

export function updateModuleQuizScore(id: string, score: number, isCompleted: boolean): void {
  db.query("UPDATE modules SET quiz_score = ?, is_completed = ? WHERE id = ?")
    .run(score, isCompleted ? 1 : 0, id);
}

export function deleteCourse(id: string): void {
  db.query("DELETE FROM courses WHERE id = ?").run(id);
}

export default db;
