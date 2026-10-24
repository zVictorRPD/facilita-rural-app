import { DAY_KEYS, DAY_LABELS, SLOT_KEYS, TURN_KEYS, type ColorToken, type Timetable } from "@/domain/timetable";

const TURN_START = { m: 7, t: 12, n: 17 } as const;

export function hourLabel(hour: number) {
  return `${String(Math.floor(hour)).padStart(2, "0")}:00`;
}

export type ClassBlock = {
  id: string;
  color: ColorToken;
  start: number;
  end: number;
  day: string;
};

export function dayGroups(timetable: Timetable | null | undefined, day: string): ClassBlock[] {
  if (!timetable) return [];
  const out: ClassBlock[] = [];
  let current: ClassBlock | null = null;
  for (const turn of TURN_KEYS) {
    for (const slot of SLOT_KEYS) {
      const cell = timetable[day]?.[turn]?.[slot];
      const hour = TURN_START[turn] + Number(slot) - 1;
      const occupied = cell && typeof cell === "object" ? cell : null;
      if (occupied && current && current.id === occupied.id && current.end === hour) {
        current.end = hour + 1;
        continue;
      }
      if (current) out.push(current);
      current = occupied ? { id: occupied.id, color: occupied.bgColor, start: hour, end: hour + 1, day } : null;
    }
  }
  if (current) out.push(current);
  return out;
}

export function weekdayKey(date: Date) {
  const key = String(date.getDay() + 1);
  return (DAY_KEYS as readonly string[]).includes(key) ? key : null;
}

export function weekdayLabel(key: string) {
  const index = DAY_KEYS.indexOf(key as (typeof DAY_KEYS)[number]);
  return index >= 0 ? DAY_LABELS[index] : "";
}

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const WEEK = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

export function headingDate(date = new Date()) {
  const name = WEEK[date.getDay()];
  const titled = name.charAt(0).toUpperCase() + name.slice(1);
  return `${titled}, ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}

export function shortDate(date: Date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function relativeDay(date: Date, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = Math.round((target - start) / 86400000);
  if (days === 0) return "hoje";
  if (days === 1) return "amanhã";
  if (days === -1) return "ontem";
  if (days > 0) return `em ${days} dias`;
  return `há ${-days} dias`;
}

export function minutesUntil(startHour: number, now = new Date()) {
  const mins = Math.round((startHour - (now.getHours() + now.getMinutes() / 60)) * 60);
  if (mins < 60) return `em ${Math.max(mins, 0)} min`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest ? `em ${hours} h ${rest} min` : `em ${hours} h`;
}
