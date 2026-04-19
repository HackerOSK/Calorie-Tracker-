export interface Vitamin {
  id: string;
  name: string;
  dosage: string;
  frequency: "daily" | "weekly" | "as-needed";
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  notes?: string;
  color: string;
  icon: string;
}

export interface VitaminLog {
  vitaminId: string;
  date: string; // YYYY-MM-DD
  taken: boolean;
  timestamp?: string;
}

export interface VitaminWithStatus extends Vitamin {
  takenToday: boolean;
}

export const DEFAULT_VITAMINS: Omit<Vitamin, "id">[] = [
  {
    name: "Vitamin D3",
    dosage: "1000 IU",
    frequency: "daily",
    timeOfDay: "morning",
    color: "#F59E0B",
    icon: "☀️",
  },
  {
    name: "Vitamin B12",
    dosage: "1000 mcg",
    frequency: "daily",
    timeOfDay: "morning",
    color: "#EF4444",
    icon: "🔴",
  },
  {
    name: "Omega-3 Fish Oil",
    dosage: "1000 mg",
    frequency: "daily",
    timeOfDay: "morning",
    color: "#3B82F6",
    icon: "🐟",
  },
  {
    name: "Multivitamin",
    dosage: "1 tablet",
    frequency: "daily",
    timeOfDay: "morning",
    color: "#10B981",
    icon: "💊",
  },
  {
    name: "Calcium + Magnesium",
    dosage: "500 mg",
    frequency: "daily",
    timeOfDay: "night",
    color: "#8B5CF6",
    icon: "🦴",
  },
  {
    name: "Iron",
    dosage: "65 mg",
    frequency: "daily",
    timeOfDay: "morning",
    color: "#6B7280",
    icon: "⚙️",
  },
  {
    name: "Zinc",
    dosage: "15 mg",
    frequency: "daily",
    timeOfDay: "evening",
    color: "#14B8A6",
    icon: "🛡️",
  },
  {
    name: "Ashwagandha",
    dosage: "600 mg",
    frequency: "daily",
    timeOfDay: "evening",
    color: "#A78BFA",
    icon: "🌿",
  },
];
