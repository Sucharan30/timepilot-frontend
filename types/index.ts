export interface User {
  id: number;
  phone_number: string;
  full_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  event_type: "meeting" | "appointment" | "class" | "task" | "reminder" | "deadline";
  start_datetime: string;
  end_datetime: string | null;
  status: "scheduled" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  user_id: number;
  amount: number;
  category: string;
  description: string | null;
  expense_date: string;
  created_at: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category: string;
  monthly_limit: number;
  created_at: string;
}

export interface BudgetAlert {
  category: string;
  monthly_limit: number;
  spent: number;
  percentage: number;
  status: "warning" | "exceeded";
}

export interface Analytics {
  period: "daily" | "weekly" | "monthly";
  total_study_minutes: number;
  total_meeting_minutes: number;
  total_personal_minutes: number;
  total_expenses: number;
  most_active_category: string | null;
  productivity_score: number;
  event_count: number;
  expense_count: number;
}

export interface Recommendation {
  id: number;
  user_id: number;
  recommendation_text: string;
  created_at: string;
}

export interface AIInsight {
  id: number;
  user_id: number;
  insight_text: string;
  created_at: string;
}

export interface Streak {
  id: number;
  streak_type: string;
  current_count: number;
  longest_count: number;
  updated_at: string;
}

export interface Overview {
  today_events: Event[];
  tasks_due: Event[];
  upcoming_notifications: any[];
}
