export type UserRole = 'audience' | 'volunteer' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  team?: string;
}

export type ProgramStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Program {
  id: string;
  title: string;
  description: string;
  speaker?: string;
  start_time: string; // ISO or formatted HH:mm
  end_time: string;
  venue: string;
  status: ProgramStatus;
  category?: string;
}

export type PriorityLevel = 'normal' | 'high' | 'urgent';
export type TargetAudience = 'all' | 'audience' | 'volunteers';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  target: TargetAudience;
  priority: PriorityLevel;
  created_at: string;
  author?: string;
}

export type FoodPrayerType = 'food' | 'prayer';
export type FoodPrayerStatus = 'upcoming' | 'active' | 'completed';

export interface FoodPrayerItem {
  id: string;
  type: FoodPrayerType;
  title: string;
  time: string;
  location: string;
  status: FoodPrayerStatus;
  notes?: string;
}

export type LostFoundStatus = 'reported' | 'found' | 'returned';

export interface LostFoundItem {
  id: string;
  item_name: string;
  description: string;
  category: 'Electronics' | 'Wallet & ID' | 'Bag & Accessories' | 'Clothing' | 'Keys' | 'Other';
  location: string;
  image_url?: string;
  status: LostFoundStatus;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  created_at: string;
}

export type HelpRequestStatus = 'open' | 'assigned' | 'in_progress' | 'resolved';

export interface HelpRequest {
  id: string;
  name: string;
  category: 'General enquiry' | 'Accommodation' | 'Food' | 'Medical assistance' | 'Venue information' | 'Technical issue' | 'Other';
  description: string;
  location: string;
  contact?: string;
  status: HelpRequestStatus;
  assigned_to?: string;
  created_at: string;
}

export type TaskStatus = 'pending' | 'accepted' | 'completed';

export interface VolunteerTask {
  id: string;
  title: string;
  instructions: string;
  location: string;
  priority: PriorityLevel;
  status: TaskStatus;
  assigned_to: string; // 'all' or volunteer name or specific volunteer ID
  team?: string;
  created_at: string;
  accepted_at?: string;
  completed_at?: string;
}
