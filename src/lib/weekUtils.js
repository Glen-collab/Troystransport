import { startOfWeek, addWeeks, subWeeks, format } from 'date-fns';

export function getWeekStart(date = new Date()) {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

export function getPrevWeek(date) {
  return subWeeks(date, 1);
}

export function getNextWeek(date) {
  return addWeeks(date, 1);
}

export function toDateString(date) {
  return format(date, 'yyyy-MM-dd');
}

export function getWeekDays(weekStart) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}
