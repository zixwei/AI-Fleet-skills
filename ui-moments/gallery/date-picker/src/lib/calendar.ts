export interface CalendarDate { year: number; month: number; day: number }

export function asDate(date: CalendarDate): Date {
  const value = new Date(0);
  value.setFullYear(date.year, date.month, date.day);
  value.setHours(12, 0, 0, 0);
  return value;
}

export function fromDate(date: Date): CalendarDate {
  return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };
}

export const dateKey = (date: CalendarDate) => `${date.year}-${String(date.month + 1).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
export const sameMonth = (a: CalendarDate, b: CalendarDate) => a.year === b.year && a.month === b.month;
export const sameDate = (a: CalendarDate, b: CalendarDate) => sameMonth(a, b) && a.day === b.day;

export function moveDays(date: CalendarDate, days: number): CalendarDate {
  const value = asDate(date);
  value.setDate(value.getDate() + days);
  return fromDate(value);
}

export function moveMonth(date: CalendarDate, months: number): CalendarDate {
  const value = asDate({ ...date, day: 1 });
  value.setMonth(value.getMonth() + months);
  const last = asDate({ year: value.getFullYear(), month: value.getMonth() + 1, day: 0 }).getDate();
  value.setDate(Math.min(date.day, last));
  return fromDate(value);
}

/** 六行完整周，包含可点击的相邻月份日期。 */
export function monthCells(view: CalendarDate): CalendarDate[] {
  const first = { ...view, day: 1 };
  const offset = (asDate(first).getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => moveDays(first, i - offset));
}
