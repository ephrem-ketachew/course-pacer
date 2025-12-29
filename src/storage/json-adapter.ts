import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { appDataDir } from './paths.js';
import type { Database } from '../models/config.js';
import type { Course } from '../models/course.js';
import { CourseSchema } from '../models/course.js';
import { safeParse } from '../utils/validators.js';
const DB_FILE = 'database.json';
const DB_VERSION = '1.0';
export async function initializeDatabase(): Promise<Low<Database>> {
  const dbDir = appDataDir();
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = join(dbDir, DB_FILE);
  const adapter = new JSONFile<Database>(dbPath);
  const db = new Low(adapter, {
    version: DB_VERSION,
    courses: {},
    globalConfig: {
      playbackSpeed: 1.5,
      defaultPracticeMultiplier: 1.0,
      folderMultipliers: {},
      notifications: true,
    },
    analytics: {},
  });
  await db.read();
  if (!db.data.version) {
    db.data.version = DB_VERSION;
  }
  if (!db.data.courses) {
    db.data.courses = {};
  }
  if (!db.data.globalConfig) {
    db.data.globalConfig = {
      playbackSpeed: 1.5,
      defaultPracticeMultiplier: 1.0,
      folderMultipliers: {},
      notifications: true,
    };
  }
  await db.write();
  return db;
}
let dbInstance: Low<Database> | null = null;
export async function getDatabase(): Promise<Low<Database>> {
  if (!dbInstance) {
    dbInstance = await initializeDatabase();
  }
  return dbInstance;
}
export async function saveCourse(course: Course): Promise<void> {
  const db = await getDatabase();
  db.data.courses[course.id] = { ...course, progress: course.progress || {} };
  await db.write();
}
export async function getCourse(courseId: string): Promise<Course | null> {
  const db = await getDatabase();
  const courseData = db.data.courses[courseId];
  if (!courseData) {
    return null;
  }
  const courseWithProgress = { ...courseData, progress: courseData.progress || {} };
  const result = safeParse(CourseSchema, courseWithProgress);
  if (!result.success) {
    throw new Error(`Invalid course data: ${result.error}`);
  }
  return result.data;
}
export async function getCourseByPath(rootPath: string): Promise<Course | null> {
  const db = await getDatabase();
  const normalizedPath = rootPath.replace(/\\/g, '/').toLowerCase();
  for (const course of Object.values(db.data.courses)) {
    const coursePath = course.rootPath.replace(/\\/g, '/').toLowerCase();
    if (coursePath === normalizedPath) {
      const courseWithProgress = { ...course, progress: course.progress || {} };
      const result = safeParse(CourseSchema, courseWithProgress);
      if (result.success) {
        return result.data;
      }
    }
  }
  return null;
}
export async function listCourses(): Promise<Course[]> {
  const db = await getDatabase();
  const courses: Course[] = [];
  for (const courseData of Object.values(db.data.courses)) {
    const courseWithProgress = { ...courseData, progress: courseData.progress || {} };
    const result = safeParse(CourseSchema, courseWithProgress);
    if (result.success) {
      courses.push(result.data);
    }
  }
  return courses;
}
export async function deleteCourse(courseId: string): Promise<boolean> {
  const db = await getDatabase();
  if (db.data.courses[courseId]) {
    delete db.data.courses[courseId];
    await db.write();
    return true;
  }
  return false;
}
export async function updateGlobalConfig(
  updates: Partial<Database['globalConfig']>
): Promise<void> {
  const db = await getDatabase();
  db.data.globalConfig = { ...db.data.globalConfig, ...updates };
  await db.write();
}
export async function getGlobalConfig(): Promise<Database['globalConfig']> {
  const db = await getDatabase();
  return db.data.globalConfig;
}
