/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DayStatus } from '../types';

const STORAGE_KEY = 'greendays_attendance';
const RATE_KEY = 'greendays_daily_rate';
const LOCKED_DATA_KEY = 'greendays_locked_data';

export interface LockedMonthData {
  monthStr: string;
  count: number;
  offDays: number;
  salary: number;
  label: string;
}

export interface UseAttendanceReturn {
  records: Record<string, DayStatus>;
  toggleDay: (dateStr: string, status: DayStatus) => void;
  removeDay: (dateStr: string) => void;
  dailyRate: number;
  setDailyRate: (rate: number) => void;
  lockedMonths: string[];
  lockedData: Record<string, LockedMonthData>;
  lockMonth: (data: LockedMonthData) => void;
  resetMonth: (monthDate: Date) => void;
  resetAll: () => void;
}

export function useAttendance(): UseAttendanceReturn {
  const [records, setRecords] = useState<Record<string, DayStatus>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const [dailyRate, setDailyRate] = useState<number>(() => {
    const saved = localStorage.getItem(RATE_KEY);
    return saved ? Number(saved) : 500000;
  });

  const [lockedData, setLockedData] = useState<Record<string, LockedMonthData>>(() => {
    const saved = localStorage.getItem(LOCKED_DATA_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(RATE_KEY, dailyRate.toString());
  }, [dailyRate]);

  useEffect(() => {
    localStorage.setItem(LOCKED_DATA_KEY, JSON.stringify(lockedData));
  }, [lockedData]);

  const toggleDay = (dateStr: string, status: DayStatus) => {
    setRecords(prev => {
      const next = { ...prev };
      if (next[dateStr] === status) {
        delete next[dateStr];
      } else {
        next[dateStr] = status;
      }
      return next;
    });
  };

  const removeDay = (dateStr: string) => {
    setRecords(prev => {
      const next = { ...prev };
      delete next[dateStr];
      return next;
    });
  };

  const lockMonth = (data: LockedMonthData) => {
    setLockedData(prev => ({
      ...prev,
      [data.monthStr]: data
    }));
  };

  const resetMonth = (monthDate: Date) => {
    const monthStr = format(monthDate, 'yyyy-MM');
    setRecords(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (key.startsWith(monthStr)) {
          delete next[key];
        }
      });
      return next;
    });
  };

  const resetAll = () => {
    setRecords({});
    setLockedData({});
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LOCKED_DATA_KEY);
  };

  return {
    records,
    toggleDay,
    removeDay,
    dailyRate,
    setDailyRate,
    lockedMonths: Object.keys(lockedData),
    lockedData,
    lockMonth,
    resetMonth,
    resetAll
  };
}
