// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import {
  initialPrograms,
  initialAnnouncements,
  initialFoodPrayer,
  initialLostFound,
  initialHelpRequests,
  initialVolunteerTasks,
} from "./mockData";

// Path to SQLite database file
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_PATH = path.join(DATA_DIR, "mkf_festival.db");

// Singleton connection
let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  // 1. Settings (Admin & Volunteer passwords, system state)
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Default passwords in database
  const getSetting = db.prepare("SELECT value FROM settings WHERE key = ?");
  const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");

  if (!getSetting.get("admin_password")) {
    insertSetting.run("admin_password", process.env.ADMIN_PASSWORD || "admin123");
  }
  if (!getSetting.get("volunteer_passcode")) {
    insertSetting.run("volunteer_passcode", process.env.VOLUNTEER_PASSWORD || "mkf2026");
  }
  if (!getSetting.get("festival_name")) {
    insertSetting.run("festival_name", "MIC Knowledge Festival 2026");
  }

  // 2. Programs
  db.exec(`
    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      speaker TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      venue TEXT NOT NULL,
      category TEXT,
      status TEXT NOT NULL DEFAULT 'upcoming',
      created_at TEXT NOT NULL
    );
  `);

  // 3. Announcements
  db.exec(`
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      target TEXT NOT NULL DEFAULT 'all',
      priority TEXT NOT NULL DEFAULT 'normal',
      author TEXT DEFAULT 'Admin Control',
      created_at TEXT NOT NULL
    );
  `);

  // 4. Food & Prayer
  db.exec(`
    CREATE TABLE IF NOT EXISTS food_prayer (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'upcoming',
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 5. Lost & Found
  db.exec(`
    CREATE TABLE IF NOT EXISTS lost_found (
      id TEXT PRIMARY KEY,
      item_name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'reported',
      contact_name TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      contact_email TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 6. Help Requests
  db.exec(`
    CREATE TABLE IF NOT EXISTS help_requests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      contact TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      assigned_to TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 7. Volunteer Tasks
  db.exec(`
    CREATE TABLE IF NOT EXISTS volunteer_tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      instructions TEXT NOT NULL,
      location TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'normal',
      status TEXT NOT NULL DEFAULT 'pending',
      assigned_to TEXT NOT NULL DEFAULT 'all',
      team TEXT,
      created_at TEXT NOT NULL,
      accepted_at TEXT,
      completed_at TEXT
    );
  `);

  // 8. Active Volunteers Registry
  db.exec(`
    CREATE TABLE IF NOT EXISTS volunteers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      team TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'volunteer',
      avatar TEXT,
      last_active TEXT NOT NULL
    );
  `);

  // 9. Attendees / Google Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      avatar TEXT,
      role TEXT NOT NULL DEFAULT 'audience',
      created_at TEXT NOT NULL
    );
  `);

  // 10. Voice Messages & Help Audio Notes
  db.exec(`
    CREATE TABLE IF NOT EXISTS voice_messages (
      id TEXT PRIMARY KEY,
      user_name TEXT NOT NULL,
      user_email TEXT,
      user_role TEXT DEFAULT 'delegate',
      audio_url TEXT,
      duration INTEGER DEFAULT 0,
      transcript TEXT,
      response_text TEXT,
      status TEXT NOT NULL DEFAULT 'processed',
      created_at TEXT NOT NULL
    );
  `);

  // Seed default data if empty
  seedInitialData(db);
}

function seedInitialData(db: DatabaseSync) {
  // Programs
  const progCount = db.prepare("SELECT COUNT(*) as count FROM programs").get() as { count: number };
  if (progCount.count === 0) {
    const insertProg = db.prepare(`
      INSERT INTO programs (id, title, description, speaker, start_time, end_time, venue, category, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of initialPrograms) {
      insertProg.run(
        p.id,
        p.title,
        p.description || "",
        p.speaker || "",
        p.start_time,
        p.end_time,
        p.venue,
        p.category || "",
        p.status,
        new Date().toISOString()
      );
    }
  }

  // Announcements
  const annCount = db.prepare("SELECT COUNT(*) as count FROM announcements").get() as { count: number };
  if (annCount.count === 0) {
    const insertAnn = db.prepare(`
      INSERT INTO announcements (id, title, message, target, priority, author, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const a of initialAnnouncements) {
      insertAnn.run(a.id, a.title, a.message, a.target, a.priority, a.author || "Admin Control", a.created_at);
    }
  }

  // Food & Prayer
  const fpCount = db.prepare("SELECT COUNT(*) as count FROM food_prayer").get() as { count: number };
  if (fpCount.count === 0) {
    const insertFP = db.prepare(`
      INSERT INTO food_prayer (id, type, title, time, location, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const fp of initialFoodPrayer) {
      insertFP.run(fp.id, fp.type, fp.title, fp.time, fp.location, fp.status, fp.notes || "", new Date().toISOString());
    }
  }

  // Lost & Found
  const lfCount = db.prepare("SELECT COUNT(*) as count FROM lost_found").get() as { count: number };
  if (lfCount.count === 0) {
    const insertLF = db.prepare(`
      INSERT INTO lost_found (id, item_name, description, category, location, image_url, status, contact_name, contact_phone, contact_email, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const lf of initialLostFound) {
      insertLF.run(
        lf.id,
        lf.item_name,
        lf.description,
        lf.category,
        lf.location,
        lf.image_url || "",
        lf.status,
        lf.contact_name,
        lf.contact_phone,
        lf.contact_email || "",
        lf.created_at
      );
    }
  }

  // Help Requests
  const hrCount = db.prepare("SELECT COUNT(*) as count FROM help_requests").get() as { count: number };
  if (hrCount.count === 0) {
    const insertHR = db.prepare(`
      INSERT INTO help_requests (id, name, category, description, location, contact, status, assigned_to, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const hr of initialHelpRequests) {
      insertHR.run(
        hr.id,
        hr.name,
        hr.category,
        hr.description,
        hr.location,
        hr.contact || "",
        hr.status,
        hr.assigned_to || "",
        hr.created_at
      );
    }
  }

  // Volunteer Tasks
  const taskCount = db.prepare("SELECT COUNT(*) as count FROM volunteer_tasks").get() as { count: number };
  if (taskCount.count === 0) {
    const insertTask = db.prepare(`
      INSERT INTO volunteer_tasks (id, title, instructions, location, priority, status, assigned_to, team, created_at, accepted_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const t of initialVolunteerTasks) {
      insertTask.run(
        t.id,
        t.title,
        t.instructions,
        t.location,
        t.priority,
        t.status,
        t.assigned_to,
        t.team || "General Support",
        t.created_at,
        t.accepted_at || null,
        t.completed_at || null
      );
    }
  }
}

// ============================================================================
// Database Service Interface
// ============================================================================

export const ServerDb = {
  // Settings & Passwords
  getSetting(key: string, fallback = ""): string {
    const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
    return row ? row.value : fallback;
  },

  setSetting(key: string, value: string) {
    getDb().prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
  },

  verifyAdminPassword(password: string): boolean {
    const current = this.getSetting("admin_password", "admin123");
    return password === current;
  },

  setAdminPassword(newPassword: string) {
    this.setSetting("admin_password", newPassword);
  },

  verifyVolunteerPasscode(passcode: string): boolean {
    const current = this.getSetting("volunteer_passcode", "mkf2026");
    return passcode === current;
  },

  setVolunteerPasscode(newPasscode: string) {
    this.setSetting("volunteer_passcode", newPasscode);
  },

  // Volunteers Registry
  registerVolunteer(volunteer: { id: string; name: string; team: string; avatar?: string }) {
    const db = getDb();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT OR REPLACE INTO volunteers (id, name, team, role, avatar, last_active)
      VALUES (?, ?, ?, 'volunteer', ?, ?)
    `).run(volunteer.id, volunteer.name, volunteer.team, volunteer.avatar || "", now);
  },

  getVolunteers() {
    return getDb().prepare("SELECT * FROM volunteers ORDER BY last_active DESC").all();
  },

  // Users / Google Attendees
  saveUser(user: { id: string; name: string; email?: string; avatar?: string; role?: string }) {
    const db = getDb();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT OR REPLACE INTO users (id, name, email, avatar, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(user.id, user.name, user.email || "", user.avatar || "", user.role || "audience", now);
  },

  getUsers() {
    return getDb().prepare("SELECT * FROM users ORDER BY created_at DESC").all();
  },

  // Voice Messages & Audio Help Notes
  addVoiceMessage(msg: {
    userName: string;
    userEmail?: string;
    userRole?: string;
    audioUrl?: string;
    duration?: number;
    transcript: string;
    responseText?: string;
    status?: string;
  }) {
    const id = `voice-${Date.now()}`;
    const now = new Date().toISOString();
    getDb().prepare(`
      INSERT INTO voice_messages (id, user_name, user_email, user_role, audio_url, duration, transcript, response_text, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      msg.userName,
      msg.userEmail || "",
      msg.userRole || "delegate",
      msg.audioUrl || "",
      msg.duration || 0,
      msg.transcript,
      msg.responseText || "",
      msg.status || "processed",
      now
    );
    return { id, ...msg, created_at: now };
  },

  getVoiceMessages() {
    return getDb().prepare("SELECT * FROM voice_messages ORDER BY created_at DESC").all();
  },

  // Programs CRUD
  getPrograms() {
    return getDb().prepare("SELECT * FROM programs ORDER BY start_time ASC").all();
  },

  addProgram(p: any) {
    const id = `prog-${Date.now()}`;
    const now = new Date().toISOString();
    getDb().prepare(`
      INSERT INTO programs (id, title, description, speaker, start_time, end_time, venue, category, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, p.title, p.description || "", p.speaker || "", p.start_time, p.end_time, p.venue, p.category || "", p.status || "upcoming", now);
    return { id, ...p, created_at: now };
  },

  updateProgram(id: string, updates: any) {
    const existing = getDb().prepare("SELECT * FROM programs WHERE id = ?").get(id) as any;
    if (!existing) return null;
    const merged = { ...existing, ...updates };
    getDb().prepare(`
      UPDATE programs
      SET title = ?, description = ?, speaker = ?, start_time = ?, end_time = ?, venue = ?, category = ?, status = ?
      WHERE id = ?
    `).run(merged.title, merged.description, merged.speaker, merged.start_time, merged.end_time, merged.venue, merged.category, merged.status, id);
    return merged;
  },

  deleteProgram(id: string) {
    getDb().prepare("DELETE FROM programs WHERE id = ?").run(id);
  },

  // Announcements CRUD
  getAnnouncements() {
    return getDb().prepare("SELECT * FROM announcements ORDER BY created_at DESC").all();
  },

  addAnnouncement(a: any) {
    const id = `ann-${Date.now()}`;
    const now = new Date().toISOString();
    getDb().prepare(`
      INSERT INTO announcements (id, title, message, target, priority, author, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, a.title, a.message, a.target || "all", a.priority || "normal", a.author || "Admin Control", now);
    return { id, ...a, created_at: now };
  },

  deleteAnnouncement(id: string) {
    getDb().prepare("DELETE FROM announcements WHERE id = ?").run(id);
  },

  // Food & Prayer CRUD
  getFoodPrayer() {
    return getDb().prepare("SELECT * FROM food_prayer ORDER BY time ASC").all();
  },

  addFoodPrayer(fp: any) {
    const id = `fp-${Date.now()}`;
    const now = new Date().toISOString();
    getDb().prepare(`
      INSERT INTO food_prayer (id, type, title, time, location, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, fp.type, fp.title, fp.time, fp.location, fp.status || "upcoming", fp.notes || "", now);
    return { id, ...fp, created_at: now };
  },

  updateFoodPrayer(id: string, updates: any) {
    const existing = getDb().prepare("SELECT * FROM food_prayer WHERE id = ?").get(id) as any;
    if (!existing) return null;
    const merged = { ...existing, ...updates };
    getDb().prepare(`
      UPDATE food_prayer
      SET type = ?, title = ?, time = ?, location = ?, status = ?, notes = ?
      WHERE id = ?
    `).run(merged.type, merged.title, merged.time, merged.location, merged.status, merged.notes, id);
    return merged;
  },

  deleteFoodPrayer(id: string) {
    getDb().prepare("DELETE FROM food_prayer WHERE id = ?").run(id);
  },

  // Lost & Found CRUD
  getLostFound() {
    return getDb().prepare("SELECT * FROM lost_found ORDER BY created_at DESC").all();
  },

  addLostFound(lf: any) {
    const id = `lf-${Date.now()}`;
    const now = new Date().toISOString();
    getDb().prepare(`
      INSERT INTO lost_found (id, item_name, description, category, location, image_url, status, contact_name, contact_phone, contact_email, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, lf.item_name, lf.description, lf.category, lf.location, lf.image_url || "", lf.status || "reported", lf.contact_name, lf.contact_phone, lf.contact_email || "", now);
    return { id, ...lf, created_at: now };
  },

  updateLostFound(id: string, updates: any) {
    const existing = getDb().prepare("SELECT * FROM lost_found WHERE id = ?").get(id) as any;
    if (!existing) return null;
    const merged = { ...existing, ...updates };
    getDb().prepare(`
      UPDATE lost_found
      SET item_name = ?, description = ?, category = ?, location = ?, image_url = ?, status = ?, contact_name = ?, contact_phone = ?, contact_email = ?
      WHERE id = ?
    `).run(merged.item_name, merged.description, merged.category, merged.location, merged.image_url, merged.status, merged.contact_name, merged.contact_phone, merged.contact_email, id);
    return merged;
  },

  deleteLostFound(id: string) {
    getDb().prepare("DELETE FROM lost_found WHERE id = ?").run(id);
  },

  // Help Requests CRUD
  getHelpRequests() {
    return getDb().prepare("SELECT * FROM help_requests ORDER BY created_at DESC").all();
  },

  addHelpRequest(hr: any) {
    const id = `help-${Date.now()}`;
    const now = new Date().toISOString();
    getDb().prepare(`
      INSERT INTO help_requests (id, name, category, description, location, contact, status, assigned_to, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, hr.name, hr.category, hr.description, hr.location, hr.contact || "", hr.status || "open", hr.assigned_to || "", now);
    return { id, ...hr, created_at: now };
  },

  updateHelpRequest(id: string, updates: any) {
    const existing = getDb().prepare("SELECT * FROM help_requests WHERE id = ?").get(id) as any;
    if (!existing) return null;
    const merged = { ...existing, ...updates };
    getDb().prepare(`
      UPDATE help_requests
      SET name = ?, category = ?, description = ?, location = ?, contact = ?, status = ?, assigned_to = ?
      WHERE id = ?
    `).run(merged.name, merged.category, merged.description, merged.location, merged.contact, merged.status, merged.assigned_to, id);
    return merged;
  },

  deleteHelpRequest(id: string) {
    getDb().prepare("DELETE FROM help_requests WHERE id = ?").run(id);
  },

  // Volunteer Tasks CRUD
  getTasks() {
    return getDb().prepare("SELECT * FROM volunteer_tasks ORDER BY created_at DESC").all();
  },

  addTask(t: any) {
    const id = `task-${Date.now()}`;
    const now = new Date().toISOString();
    getDb().prepare(`
      INSERT INTO volunteer_tasks (id, title, instructions, location, priority, status, assigned_to, team, created_at, accepted_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, t.title, t.instructions, t.location, t.priority || "normal", t.status || "pending", t.assigned_to || "all", t.team || "General Support", now, null, null);
    return { id, ...t, created_at: now };
  },

  updateTask(id: string, updates: any) {
    const existing = getDb().prepare("SELECT * FROM volunteer_tasks WHERE id = ?").get(id) as any;
    if (!existing) return null;
    const merged = { ...existing, ...updates };
    getDb().prepare(`
      UPDATE volunteer_tasks
      SET title = ?, instructions = ?, location = ?, priority = ?, status = ?, assigned_to = ?, team = ?, accepted_at = ?, completed_at = ?
      WHERE id = ?
    `).run(merged.title, merged.instructions, merged.location, merged.priority, merged.status, merged.assigned_to, merged.team, merged.accepted_at || null, merged.completed_at || null, id);
    return merged;
  },

  deleteTask(id: string) {
    getDb().prepare("DELETE FROM volunteer_tasks WHERE id = ?").run(id);
  },

  // Full Database Snapshot for Real-Time Client Synchronization
  getFullSnapshot() {
    return {
      timestamp: Date.now(),
      adminPasswordChanged: this.getSetting("admin_password"),
      volunteerPasscodeChanged: this.getSetting("volunteer_passcode"),
      programs: this.getPrograms(),
      announcements: this.getAnnouncements(),
      foodPrayer: this.getFoodPrayer(),
      lostFound: this.getLostFound(),
      helpRequests: this.getHelpRequests(),
      tasks: this.getTasks(),
      volunteers: this.getVolunteers(),
      voiceMessages: this.getVoiceMessages(),
    };
  },

  // Reset database back to default initial state
  resetAll() {
    const db = getDb();
    db.exec(`
      DELETE FROM programs;
      DELETE FROM announcements;
      DELETE FROM food_prayer;
      DELETE FROM lost_found;
      DELETE FROM help_requests;
      DELETE FROM volunteer_tasks;
      DELETE FROM voice_messages;
    `);
    this.setSetting("admin_password", "admin123");
    this.setSetting("volunteer_passcode", "mkf2026");
    seedInitialData(db);
  },
};
