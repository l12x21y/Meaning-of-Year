export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind background class or hex
}

export interface DayMeaning {
  id: string;
  date: string; // MM-DD format
  year: number; // The specific year this memory happened
  title: string;
  description: string;
  categoryId: string;
  imageUrl?: string; // Base64 string
  generated: boolean;
}

export interface CalendarDay {
  day: number;
  dateKey: string; // MM-DD
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_birthday', name: 'Birthday', color: 'bg-rose-400' },
  { id: 'cat_performance', name: 'Performance', color: 'bg-purple-500' },
  { id: 'cat_work', name: 'Work', color: 'bg-blue-500' },
  { id: 'cat_travel', name: 'Travel', color: 'bg-emerald-500' },
  { id: 'cat_chill', name: 'Relax', color: 'bg-slate-400' },
];

export const AVAILABLE_COLORS = [
  'bg-rose-400',
  'bg-orange-400',
  'bg-amber-400',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-slate-500',
  'bg-stone-500',
];