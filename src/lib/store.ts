"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Program,
  Announcement,
  FoodPrayerItem,
  LostFoundItem,
  HelpRequest,
  VolunteerTask,
} from "@/types";
import {
  initialPrograms,
  initialAnnouncements,
  initialFoodPrayer,
  initialLostFound,
  initialHelpRequests,
  initialVolunteerTasks,
} from "./mockData";
import { playAlertSound } from "./audioAlert";

const STORAGE_KEYS = {
  PROGRAMS: "mkf_programs",
  ANNOUNCEMENTS: "mkf_announcements",
  FOOD_PRAYER: "mkf_food_prayer",
  LOST_FOUND: "mkf_lost_found",
  HELP_REQUESTS: "mkf_help_requests",
  TASKS: "mkf_volunteer_tasks",
};

// Event bus for component reactivity
type StoreListener = () => void;
const listeners = new Set<StoreListener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error("Store listener error:", e);
    }
  });
}

function loadLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return fallback;
  }
}

function saveLocal<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifyListeners();
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

// Global store with optimistic updates and backend API sync
export const EventStore = {
  // Programs
  getPrograms(): Program[] {
    return loadLocal<Program[]>(STORAGE_KEYS.PROGRAMS, initialPrograms);
  },
  savePrograms(programs: Program[]) {
    saveLocal(STORAGE_KEYS.PROGRAMS, programs);
  },
  addProgram(program: Omit<Program, "id">): Program {
    const current = this.getPrograms();
    const newProg: Program = {
      ...program,
      id: `prog-${Date.now()}`,
    };
    const updated = [newProg, ...current];
    this.savePrograms(updated);

    // Sync with backend API
    fetch("/api/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProg),
    }).catch(console.error);

    return newProg;
  },
  updateProgram(id: string, updates: Partial<Program>) {
    const current = this.getPrograms();
    const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
    this.savePrograms(updated);

    fetch("/api/programs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    }).catch(console.error);
  },
  deleteProgram(id: string) {
    const current = this.getPrograms();
    const updated = current.filter((p) => p.id !== id);
    this.savePrograms(updated);

    fetch(`/api/programs?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch(console.error);
  },

  // Announcements
  getAnnouncements(): Announcement[] {
    return loadLocal<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, initialAnnouncements);
  },
  saveAnnouncements(list: Announcement[]) {
    saveLocal(STORAGE_KEYS.ANNOUNCEMENTS, list);
  },
  addAnnouncement(announcement: Omit<Announcement, "id" | "created_at">): Announcement {
    const current = this.getAnnouncements();
    const newAnn: Announcement = {
      ...announcement,
      id: `ann-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newAnn, ...current];
    this.saveAnnouncements(updated);

    // Play chime sound
    if (newAnn.priority === "urgent") {
      playAlertSound("urgent");
    } else {
      playAlertSound("notice");
    }

    fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAnn),
    }).catch(console.error);

    return newAnn;
  },
  deleteAnnouncement(id: string) {
    const current = this.getAnnouncements();
    const updated = current.filter((a) => a.id !== id);
    this.saveAnnouncements(updated);

    fetch(`/api/announcements?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch(console.error);
  },

  // Food & Prayer
  getFoodPrayer(): FoodPrayerItem[] {
    return loadLocal<FoodPrayerItem[]>(STORAGE_KEYS.FOOD_PRAYER, initialFoodPrayer);
  },
  saveFoodPrayer(items: FoodPrayerItem[]) {
    saveLocal(STORAGE_KEYS.FOOD_PRAYER, items);
  },
  updateFoodPrayer(id: string, updates: Partial<FoodPrayerItem>) {
    const current = this.getFoodPrayer();
    const updated = current.map((item) => (item.id === id ? { ...item, ...updates } : item));
    this.saveFoodPrayer(updated);

    fetch("/api/food-prayer", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    }).catch(console.error);
  },
  addFoodPrayer(item: Omit<FoodPrayerItem, "id">): FoodPrayerItem {
    const current = this.getFoodPrayer();
    const newItem: FoodPrayerItem = {
      ...item,
      id: `fp-${Date.now()}`,
    };
    const updated = [...current, newItem];
    this.saveFoodPrayer(updated);

    fetch("/api/food-prayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    }).catch(console.error);

    return newItem;
  },
  deleteFoodPrayer(id: string) {
    const current = this.getFoodPrayer();
    const updated = current.filter((i) => i.id !== id);
    this.saveFoodPrayer(updated);

    fetch(`/api/food-prayer?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch(console.error);
  },

  // Lost & Found
  getLostFound(): LostFoundItem[] {
    return loadLocal<LostFoundItem[]>(STORAGE_KEYS.LOST_FOUND, initialLostFound);
  },
  saveLostFound(items: LostFoundItem[]) {
    saveLocal(STORAGE_KEYS.LOST_FOUND, items);
  },
  addLostFound(item: Omit<LostFoundItem, "id" | "created_at">): LostFoundItem {
    const current = this.getLostFound();
    const newItem: LostFoundItem = {
      ...item,
      id: `lf-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...current];
    this.saveLostFound(updated);

    fetch("/api/lost-found", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    }).catch(console.error);

    return newItem;
  },
  updateLostFound(id: string, updates: Partial<LostFoundItem>) {
    const current = this.getLostFound();
    const updated = current.map((i) => (i.id === id ? { ...i, ...updates } : i));
    this.saveLostFound(updated);

    fetch("/api/lost-found", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    }).catch(console.error);
  },
  deleteLostFound(id: string) {
    const current = this.getLostFound();
    const updated = current.filter((i) => i.id !== id);
    this.saveLostFound(updated);

    fetch(`/api/lost-found?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch(console.error);
  },

  // Help Requests
  getHelpRequests(): HelpRequest[] {
    return loadLocal<HelpRequest[]>(STORAGE_KEYS.HELP_REQUESTS, initialHelpRequests);
  },
  saveHelpRequests(requests: HelpRequest[]) {
    saveLocal(STORAGE_KEYS.HELP_REQUESTS, requests);
  },
  addHelpRequest(req: Omit<HelpRequest, "id" | "created_at">): HelpRequest {
    const current = this.getHelpRequests();
    const newReq: HelpRequest = {
      ...req,
      id: `help-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newReq, ...current];
    this.saveHelpRequests(updated);

    fetch("/api/help-desk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReq),
    }).catch(console.error);

    return newReq;
  },
  updateHelpRequest(id: string, updates: Partial<HelpRequest>) {
    const current = this.getHelpRequests();
    const updated = current.map((r) => (r.id === id ? { ...r, ...updates } : r));
    this.saveHelpRequests(updated);

    fetch("/api/help-desk", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    }).catch(console.error);
  },
  deleteHelpRequest(id: string) {
    const current = this.getHelpRequests();
    const updated = current.filter((r) => r.id !== id);
    this.saveHelpRequests(updated);

    fetch(`/api/help-desk?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch(console.error);
  },

  // Volunteer Tasks
  getTasks(): VolunteerTask[] {
    return loadLocal<VolunteerTask[]>(STORAGE_KEYS.TASKS, initialVolunteerTasks);
  },
  saveTasks(tasks: VolunteerTask[]) {
    saveLocal(STORAGE_KEYS.TASKS, tasks);
  },
  addTask(task: Omit<VolunteerTask, "id" | "created_at">): VolunteerTask {
    const current = this.getTasks();
    const newTask: VolunteerTask = {
      ...task,
      id: `task-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newTask, ...current];
    this.saveTasks(updated);

    // Audio chime for task creation
    if (newTask.priority === "urgent") {
      playAlertSound("urgent");
    } else {
      playAlertSound("notice");
    }

    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    }).catch(console.error);

    return newTask;
  },
  updateTask(id: string, updates: Partial<VolunteerTask>) {
    const current = this.getTasks();
    const updated = current.map((t) => (t.id === id ? { ...t, ...updates } : t));
    this.saveTasks(updated);

    if (updates.status === "completed") {
      playAlertSound("success");
    }

    fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    }).catch(console.error);
  },
  deleteTask(id: string) {
    const current = this.getTasks();
    const updated = current.filter((t) => t.id !== id);
    this.saveTasks(updated);

    fetch(`/api/tasks?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch(console.error);
  },

  // Reset database back to default initial state
  async resetToDefaults() {
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_festival", currentAdminPassword: "admin123" }),
      });
    } catch (e) {
      console.error(e);
    }
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(initialPrograms));
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(initialAnnouncements));
    localStorage.setItem(STORAGE_KEYS.FOOD_PRAYER, JSON.stringify(initialFoodPrayer));
    localStorage.setItem(STORAGE_KEYS.LOST_FOUND, JSON.stringify(initialLostFound));
    localStorage.setItem(STORAGE_KEYS.HELP_REQUESTS, JSON.stringify(initialHelpRequests));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(initialVolunteerTasks));
    notifyListeners();
  },
};

// React Hook for live subscribing & backend polling synchronization
export function useEventData() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [foodPrayer, setFoodPrayer] = useState<FoodPrayerItem[]>([]);
  const [lostFound, setLostFound] = useState<LostFoundItem[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Track previous counts to play sounds on new urgent items
  const prevUrgentTaskCount = useRef(0);
  const prevUrgentAnnCount = useRef(0);

  const refreshFromLocal = useCallback(() => {
    setPrograms(EventStore.getPrograms());
    setAnnouncements(EventStore.getAnnouncements());
    setFoodPrayer(EventStore.getFoodPrayer());
    setLostFound(EventStore.getLostFound());
    setHelpRequests(EventStore.getHelpRequests());
    setTasks(EventStore.getTasks());
  }, []);

  // Poll backend /api/sync
  const syncWithBackend = useCallback(async () => {
    try {
      const res = await fetch("/api/sync");
      if (!res.ok) return;
      const json = await res.json();
      if (!json.success || !json.data) return;

      const d = json.data;

      // Update state
      if (Array.isArray(d.programs)) {
        setPrograms(d.programs);
        saveLocal(STORAGE_KEYS.PROGRAMS, d.programs);
      }
      if (Array.isArray(d.announcements)) {
        // Check for new urgent announcement
        const urgentCount = d.announcements.filter((a: any) => a.priority === "urgent").length;
        if (urgentCount > prevUrgentAnnCount.current && prevUrgentAnnCount.current > 0) {
          playAlertSound("urgent");
        }
        prevUrgentAnnCount.current = urgentCount;

        setAnnouncements(d.announcements);
        saveLocal(STORAGE_KEYS.ANNOUNCEMENTS, d.announcements);
      }
      if (Array.isArray(d.foodPrayer)) {
        setFoodPrayer(d.foodPrayer);
        saveLocal(STORAGE_KEYS.FOOD_PRAYER, d.foodPrayer);
      }
      if (Array.isArray(d.lostFound)) {
        setLostFound(d.lostFound);
        saveLocal(STORAGE_KEYS.LOST_FOUND, d.lostFound);
      }
      if (Array.isArray(d.helpRequests)) {
        setHelpRequests(d.helpRequests);
        saveLocal(STORAGE_KEYS.HELP_REQUESTS, d.helpRequests);
      }
      if (Array.isArray(d.tasks)) {
        // Check for new urgent task
        const urgentTasks = d.tasks.filter((t: any) => t.priority === "urgent" && t.status !== "completed").length;
        if (urgentTasks > prevUrgentTaskCount.current && prevUrgentTaskCount.current > 0) {
          playAlertSound("urgent");
        }
        prevUrgentTaskCount.current = urgentTasks;

        setTasks(d.tasks);
        saveLocal(STORAGE_KEYS.TASKS, d.tasks);
      }

      setIsLoaded(true);
    } catch (e) {
      // Fallback to local
      refreshFromLocal();
      setIsLoaded(true);
    }
  }, [refreshFromLocal]);

  useEffect(() => {
    // 1. Initial quick load from cache
    refreshFromLocal();

    // 2. Fetch latest from database
    syncWithBackend();

    // 3. Register memory subscriber
    listeners.add(refreshFromLocal);

    // 4. Background polling sync every 6s for real-time synchronization across devices
    const interval = setInterval(syncWithBackend, 6000);

    // 5. Cross-tab storage listener
    const handleStorage = (e: StorageEvent) => {
      if (Object.values(STORAGE_KEYS).includes(e.key || "")) {
        refreshFromLocal();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      listeners.delete(refreshFromLocal);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshFromLocal, syncWithBackend]);

  return {
    isLoaded,
    programs,
    announcements,
    foodPrayer,
    lostFound,
    helpRequests,
    tasks,
    refresh: syncWithBackend,
  };
}
