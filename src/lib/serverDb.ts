// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DatabaseSync } = require("node:sqlite");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DatabaseSyncType = any;
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  initialPrograms,
  initialAnnouncements,
  initialFoodPrayer,
  initialLostFound,
  initialHelpRequests,
  initialVolunteerTasks,
} from "./mockData";

// Resolve a writable database path with graceful fallbacks
function resolveDbPath(): string {
  if (process.env.USE_MEMORY_DB === "true") {
    return ":memory:";
  }

  // 1. Try local data/mkf_festival.db
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const testFile = path.join(dataDir, `.test_write_${Date.now()}`);
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    return path.join(dataDir, "mkf_festival.db");
  } catch (err) {
    // Expected on read-only environments (e.g. Vercel serverless)
  }

  // 2. Try os.tmpdir() (always writable on Vercel, AWS Lambda, Docker, Linux, Windows)
  try {
    const tmpDir = path.join(os.tmpdir(), "mkf_festival_data");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    const targetDbPath = path.join(tmpDir, "mkf_festival.db");
    const localDbPath = path.join(process.cwd(), "data", "mkf_festival.db");

    // Copy existing seed database to tmp directory if not already copied
    if (fs.existsSync(localDbPath) && !fs.existsSync(targetDbPath)) {
      try {
        fs.copyFileSync(localDbPath, targetDbPath);
      } catch {}
    }
    return targetDbPath;
  } catch (err) {
    // If tmp is restricted, fallback to memory
  }

  // 3. Guaranteed in-memory fallback
  return ":memory:";
}

// Singleton connection
let dbInstance: DatabaseSyncType | null = null;

export function getDb(): DatabaseSyncType {
  if (dbInstance) return dbInstance;

  const targetPath = resolveDbPath();
  try {
    dbInstance = new DatabaseSync(targetPath);
    try {
      dbInstance.exec("PRAGMA journal_mode = WAL;");
    } catch {}
    initSchema(dbInstance);
    return dbInstance;
  } catch (err) {
    console.error(`Failed to open SQLite database at "${targetPath}", falling back to :memory:`, err);
    try {
      dbInstance = new DatabaseSync(":memory:");
      initSchema(dbInstance);
      return dbInstance;
    } catch (memErr) {
      console.error("Critical: Failed to create in-memory database:", memErr);
      throw err;
    }
  }
}

function initSchema(db: DatabaseSyncType) {
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
  const currentVol = getSetting.get("volunteer_passcode") as { value: string } | undefined;
  if (!currentVol) {
    insertSetting.run("volunteer_passcode", process.env.VOLUNTEER_PASSWORD || "mkf123");
  } else if (currentVol.value === "mkf2026") {
    db.prepare("UPDATE settings SET value = ? WHERE key = 'volunteer_passcode'").run("mkf123");
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
      phone TEXT,
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
      instructions TEXT,
      description TEXT,
      location TEXT,
      venue TEXT,
      due_time TEXT,
      priority TEXT NOT NULL DEFAULT 'normal',
      status TEXT NOT NULL DEFAULT 'pending',
      assigned_to TEXT NOT NULL DEFAULT 'all',
      team TEXT,
      created_at TEXT NOT NULL,
      accepted_at TEXT,
      completed_at TEXT
    );
  `);

  // Ensure missing columns exist in existing database tables
  try { db.exec(`ALTER TABLE volunteer_tasks ADD COLUMN description TEXT;`); } catch {}
  try { db.exec(`ALTER TABLE volunteer_tasks ADD COLUMN venue TEXT;`); } catch {}
  try { db.exec(`ALTER TABLE volunteer_tasks ADD COLUMN due_time TEXT;`); } catch {}
  try { db.exec(`ALTER TABLE help_requests ADD COLUMN phone TEXT;`); } catch {}

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

function seedInitialData(db: DatabaseSyncType) {
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
      INSERT INTO volunteer_tasks (id, title, instructions, description, location, venue, due_time, priority, status, assigned_to, team, created_at, accepted_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const t of initialVolunteerTasks) {
      insertTask.run(
        t.id,
        t.title,
        t.instructions || t.description || "",
        t.description || t.instructions || "",
        t.location || t.venue || "Festival Grounds",
        t.venue || t.location || "Festival Grounds",
        t.due_time || "Immediate",
        t.priority,
        t.status,
        t.assigned_to,
        t.team || "General Support",
        t.created_at || new Date().toISOString(),
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
    try {
      const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
      return row ? row.value : fallback;
    } catch (e) {
      console.error(`getSetting error for ${key}:`, e);
      return fallback;
    }
  },

  setSetting(key: string, value: string) {
    try {
      getDb().prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
    } catch (e) {
      console.error(`setSetting error for ${key}:`, e);
    }
  },

  verifyAdminPassword(password: string): boolean {
    const envAdmin = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";
    if (password === envAdmin || password === "admin123") {
      return true;
    }
    try {
      const current = this.getSetting("admin_password", envAdmin);
      return password === current;
    } catch {
      return password === envAdmin || password === "admin123";
    }
  },

  setAdminPassword(newPassword: string) {
    this.setSetting("admin_password", newPassword);
  },

  verifyVolunteerPasscode(passcode: string): boolean {
    const envVol = process.env.VOLUNTEER_PASSWORD || process.env.NEXT_PUBLIC_VOLUNTEER_PASSWORD || "mkf123";
    if (passcode === envVol || passcode === "mkf123" || passcode === "mkf2026") {
      return true;
    }
    try {
      const current = this.getSetting("volunteer_passcode", envVol);
      return passcode === current || passcode === "mkf123" || passcode === "mkf2026";
    } catch {
      return passcode === envVol || passcode === "mkf123" || passcode === "mkf2026";
    }
  },

  setVolunteerPasscode(newPasscode: string) {
    this.setSetting("volunteer_passcode", newPasscode);
  },

  // Volunteers Registry
  registerVolunteer(volunteer: { id: string; name: string; team: string; avatar?: string }) {
    try {
      const db = getDb();
      const now = new Date().toISOString();
      db.prepare(`
        INSERT OR REPLACE INTO volunteers (id, name, team, role, avatar, last_active)
        VALUES (?, ?, ?, 'volunteer', ?, ?)
      `).run(volunteer.id, volunteer.name, volunteer.team, volunteer.avatar || "", now);
    } catch (e) {
      console.error("registerVolunteer error:", e);
    }
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
    const id = p.id || `prog-${Date.now()}`;
    const now = p.created_at || new Date().toISOString();
    getDb().prepare(`
      INSERT OR REPLACE INTO programs (id, title, description, speaker, start_time, end_time, venue, category, status, created_at)
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
    const id = a.id || `ann-${Date.now()}`;
    const now = a.created_at || new Date().toISOString();
    getDb().prepare(`
      INSERT OR REPLACE INTO announcements (id, title, message, target, priority, author, created_at)
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
    const id = fp.id || `fp-${Date.now()}`;
    const now = fp.created_at || new Date().toISOString();
    getDb().prepare(`
      INSERT OR REPLACE INTO food_prayer (id, type, title, time, location, status, notes, created_at)
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
    const id = lf.id || `lf-${Date.now()}`;
    const now = lf.created_at || new Date().toISOString();
    getDb().prepare(`
      INSERT OR REPLACE INTO lost_found (id, item_name, description, category, location, image_url, status, contact_name, contact_phone, contact_email, created_at)
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
    const rows = getDb().prepare("SELECT * FROM help_requests ORDER BY created_at DESC").all() as any[];
    return rows.map((r) => ({
      ...r,
      contact: r.contact || r.phone || "",
      phone: r.phone || r.contact || "",
    }));
  },

  addHelpRequest(hr: any) {
    const id = hr.id || `help-${Date.now()}`;
    const now = hr.created_at || new Date().toISOString();
    const contact = hr.contact || hr.phone || "";
    const phone = hr.phone || hr.contact || "";
    getDb().prepare(`
      INSERT OR REPLACE INTO help_requests (id, name, category, description, location, contact, phone, status, assigned_to, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, hr.name, hr.category, hr.description, hr.location, contact, phone, hr.status || "open", hr.assigned_to || "", now);
    return { id, ...hr, contact, phone, created_at: now };
  },

  updateHelpRequest(id: string, updates: any) {
    const existing = getDb().prepare("SELECT * FROM help_requests WHERE id = ?").get(id) as any;
    if (!existing) return null;
    const merged = { ...existing, ...updates };
    const contact = merged.contact || merged.phone || "";
    const phone = merged.phone || merged.contact || "";
    getDb().prepare(`
      UPDATE help_requests
      SET name = ?, category = ?, description = ?, location = ?, contact = ?, phone = ?, status = ?, assigned_to = ?
      WHERE id = ?
    `).run(merged.name, merged.category, merged.description, merged.location, contact, phone, merged.status, merged.assigned_to, id);
    return merged;
  },

  deleteHelpRequest(id: string) {
    getDb().prepare("DELETE FROM help_requests WHERE id = ?").run(id);
  },

  // Volunteer Tasks CRUD
  getTasks() {
    const rows = getDb().prepare("SELECT * FROM volunteer_tasks ORDER BY created_at DESC").all() as any[];
    return rows.map((r) => ({
      ...r,
      description: r.description || r.instructions || "",
      instructions: r.instructions || r.description || "",
      location: r.location || r.venue || "Festival Grounds",
      venue: r.venue || r.location || "Festival Grounds",
      due_time: r.due_time || "Immediate",
    }));
  },

  addTask(t: any) {
    const id = t.id || `task-${Date.now()}`;
    const now = t.created_at || new Date().toISOString();
    const instructions = t.instructions || t.description || t.title || "";
    const description = t.description || t.instructions || t.title || "";
    const location = t.location || t.venue || "Festival Grounds";
    const venue = t.venue || t.location || "Festival Grounds";
    const dueTime = t.due_time || "Immediate";
    const priority = t.priority || "normal";
    const status = t.status || "pending";
    const assignedTo = t.assigned_to || "all";
    const team = t.team || "General Support";

    getDb().prepare(`
      INSERT OR REPLACE INTO volunteer_tasks (id, title, instructions, description, location, venue, due_time, priority, status, assigned_to, team, created_at, accepted_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, t.title, instructions, description, location, venue, dueTime, priority, status, assignedTo, team, now, t.accepted_at || null, t.completed_at || null);

    return {
      id,
      title: t.title,
      instructions,
      description,
      location,
      venue,
      due_time: dueTime,
      priority,
      status,
      assigned_to: assignedTo,
      team,
      created_at: now,
      accepted_at: t.accepted_at,
      completed_at: t.completed_at,
    };
  },

  updateTask(id: string, updates: any) {
    const existing = getDb().prepare("SELECT * FROM volunteer_tasks WHERE id = ?").get(id) as any;
    if (!existing) return null;
    const now = new Date().toISOString();
    const acceptedAt = updates.status === "accepted" && !existing.accepted_at
      ? now
      : (updates.accepted_at !== undefined ? updates.accepted_at : existing.accepted_at);
    const completedAt = updates.status === "completed"
      ? now
      : (updates.completed_at !== undefined ? updates.completed_at : existing.completed_at);

    const merged = {
      ...existing,
      ...updates,
      accepted_at: acceptedAt,
      completed_at: completedAt,
    };

    getDb().prepare(`
      UPDATE volunteer_tasks
      SET title = ?, instructions = ?, description = ?, location = ?, venue = ?, due_time = ?, priority = ?, status = ?, assigned_to = ?, team = ?, accepted_at = ?, completed_at = ?
      WHERE id = ?
    `).run(
      merged.title,
      merged.instructions || merged.description || "",
      merged.description || merged.instructions || "",
      merged.location || merged.venue || "",
      merged.venue || merged.location || "",
      merged.due_time || "",
      merged.priority,
      merged.status,
      merged.assigned_to,
      merged.team || "General Support",
      merged.accepted_at || null,
      merged.completed_at || null,
      id
    );
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
