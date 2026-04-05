import { CalendarDay } from '../types';

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Using 29 for Feb to accommodate leap year memories in a perpetual calendar
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const formatDateKey = (monthIndex: number, day: number): string => {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${m}-${d}`;
};

export const generateCalendarGrid = (monthIndex: number): CalendarDay[] => {
  const daysCount = DAYS_IN_MONTH[monthIndex];
  const grid: CalendarDay[] = [];

  for (let i = 1; i <= daysCount; i++) {
    grid.push({
      day: i,
      dateKey: formatDateKey(monthIndex, i),
    });
  }

  return grid;
};