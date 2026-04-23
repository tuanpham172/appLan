/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type DayStatus = 'OFF' | 'WORK' | 'CHILL';

export interface AttendanceRecord {
  date: string; // ISO format YYYY-MM-DD
  status: DayStatus;
}

export interface MonthlyConfig {
  dailyRate: number;
}

export interface AppState {
  records: Record<string, DayStatus>; // Key: YYYY-MM-DD
  dailyRate: number;
}
