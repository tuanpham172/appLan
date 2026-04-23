/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  startOfWeek, 
  endOfWeek,
  isToday,
  parseISO
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Coffee, Laptop, X, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAttendance } from './hooks/useAttendance';
import { cn, DayStatus } from './types';

// Components
interface CalendarHeaderProps {
  currentMonth: Date;
  onPrev: () => void;
  onNext: () => void;
  onOpenSettings: () => void;
}

const CalendarHeader = ({ currentMonth, onPrev, onNext, onOpenSettings }: CalendarHeaderProps) => (
  <header className="flex justify-between items-center mb-10">
    <div>
      <h1 className="text-4xl font-black tracking-tighter text-emerald-700">Lan Nguyễn</h1>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex items-center bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">
        <button onClick={onPrev} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronLeft size={20} className="text-slate-600" /></button>
        <span className="px-6 font-bold text-lg min-w-[160px] text-center text-slate-800 capitalize">{format(currentMonth, 'MMMM yyyy', { locale: vi })}</span>
        <button onClick={onNext} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronRight size={20} className="text-slate-600" /></button>
      </div>
      <button 
        onClick={onOpenSettings}
        className="p-3 bg-white text-slate-600 rounded-2xl border border-slate-200 shadow-sm hover:rotate-90 transition-transform duration-500 hover:bg-slate-50"
      >
        <SettingsIcon size={20} />
      </button>
    </div>
  </header>
);

interface DayCellProps {
  date: Date;
  status: DayStatus | undefined;
  isCurrentMonth: boolean;
  isLocked: boolean;
  onSelect: (date: Date) => void;
}

const DayCell: React.FC<DayCellProps> = ({ 
  date, 
  status, 
  isCurrentMonth, 
  isLocked,
  onSelect 
}) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const isNow = isToday(date);

  if (!isCurrentMonth) {
    return <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 aspect-square" />;
  }

  return (
    <motion.div
      whileHover={!isLocked ? { scale: 0.98, y: -2 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      onClick={() => !isLocked && onSelect(date)}
      className={cn(
        "calendar-day relative flex flex-col items-center justify-center rounded-2xl transition-all duration-300 group shadow-sm",
        isLocked ? "cursor-default" : "cursor-pointer",
        status === 'WORK' && "bg-emerald-500 text-white shadow-emerald-100 shadow-lg",
        status === 'CHILL' && "bg-emerald-600 text-white ring-4 ring-emerald-50/50 shadow-lg",
        !status && "bg-rose-500 text-white shadow-rose-100/50 shadow-md"
      )}
    >
      <span className="text-2xl font-black">{format(date, 'd')}</span>
      
      {status === 'CHILL' && (
        <span className="absolute top-2 right-2 text-sm drop-shadow-sm">☕</span>
      )}
      
      <span className="text-[10px] opacity-80 uppercase font-black tracking-wider mt-1">
        {status === 'CHILL' ? 'Đi làm chill chill' : 'Nghỉ'}
      </span>

      {isLocked && status && (
        <div className="absolute top-1 left-2 opacity-40">
          <X className="rotate-45" size={10} strokeWidth={4} />
        </div>
      )}
      
      {isNow && !status && (
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-white animate-ping" />
      )}
    </motion.div>
  );
};

interface StatusModalProps {
  date: Date | null;
  currentStatus: DayStatus | undefined;
  onClose: () => void;
  onStatusChange: (status: DayStatus | null) => void;
}

const StatusModal = ({ 
  date, 
  currentStatus, 
  onClose, 
  onStatusChange 
}: StatusModalProps) => {
  if (!date) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-black/5"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-10">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 capitalize">{format(date, 'EEEE', { locale: vi })}</p>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight capitalize">{format(date, 'dd MMMM', { locale: vi })}</h2>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => onStatusChange('CHILL')}
            className={cn(
              "w-full py-5 flex items-center justify-center gap-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all",
              currentStatus === 'CHILL' 
                ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20" 
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
            )}
          >
            <Coffee size={20} strokeWidth={3} />
            <span>Đi làm chill chill</span>
          </button>

          {currentStatus && (
            <button 
              onClick={() => onStatusChange(null)}
              className="w-full py-4 flex items-center justify-center gap-3 rounded-2xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all font-medium mt-4"
            >
              <X size={18} />
              <span>Hủy công hôm nay</span>
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

interface SettingsModalProps {
  currentRate: number;
  onClose: () => void;
  onSave: (rate: number) => void;
  onReset: () => void;
}

const SettingsModal = ({ 
  currentRate, 
  onClose, 
  onSave,
  onReset
}: SettingsModalProps) => {
  const [rate, setRate] = useState(currentRate);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-black/5"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Cấu hình hệ thống</h2>
        
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Đơn giá (VND/ngày)</label>
            <input 
              type="number" 
              value={rate}
              onChange={e => setRate(Number(e.target.value))}
              placeholder="500000"
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-black text-xl text-slate-800"
            />
          </div>
          
          <button 
            onClick={() => {
              onSave(rate);
              onClose();
            }}
            className="w-full py-5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-600/20"
          >
            Lưu thay đổi
          </button>

          <button 
            onClick={() => {
              if (confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu?')) {
                onReset();
                onClose();
              }
            }}
            className="w-full py-3 text-[10px] text-rose-500 font-black uppercase tracking-[0.3em] hover:bg-rose-50 rounded-xl transition-all"
          >
            Xóa toàn bộ dữ liệu
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'report'>('calendar');
  const { 
    records, 
    toggleDay, 
    removeDay, 
    dailyRate, 
    setDailyRate,
    lockedMonths,
    lockedData,
    lockMonth,
    resetAll
  } = useAttendance();

  const currentMonthStr = format(currentMonth, 'yyyy-MM');
  const isMonthLocked = lockedMonths.includes(currentMonthStr);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const handleStatusChange = (status: DayStatus | null) => {
    if (selectedDate && !isMonthLocked) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      if (status === null) {
        removeDay(dateStr);
      } else {
        toggleDay(dateStr, status);
      }
      setSelectedDate(null);
    }
  };

  const handleLock = () => {
    if (confirm(`Xác nhận bạn đã nhận lương tháng ${format(currentMonth, 'MM/yyyy')}? Sau khi xác nhận sẽ không thể chỉnh sửa.`)) {
      lockMonth({
        monthStr: currentMonthStr,
        count: workedDays,
        salary: totalSalary,
        label: format(currentMonth, 'MMMM yyyy', { locale: vi })
      });
    }
  };

  // Stats for current month
  const workedDays = calendarDays.filter(day => {
    if (!isSameMonth(day, currentMonth)) return false;
    const dateStr = format(day, 'yyyy-MM-dd');
    return records[dateStr] === 'CHILL';
  }).length;

  const totalDaysInMonth = calendarDays.filter(day => isSameMonth(day, currentMonth)).length;
  const offDays = totalDaysInMonth - workedDays;

  const totalWorked = workedDays;
  const totalSalary = totalWorked * dailyRate;

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  if (activeTab === 'report') {
    const history = Object.values(lockedData).sort((a, b) => b.monthStr.localeCompare(a.monthStr));
    const totalReceivedSum = history.reduce((sum, d) => sum + d.salary, 0);

    return (
      <div className="min-h-screen p-8 flex flex-col max-w-[1240px] mx-auto animate-in space-y-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-emerald-700">Lịch sử nhận lương</h1>
            <p className="text-slate-500 text-sm font-medium">Lan Nguyễn • Tổng thu nhập đã nhận</p>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 bg-white text-slate-600 rounded-2xl border border-slate-200 shadow-sm hover:rotate-90 transition-transform duration-500"
          >
            <SettingsIcon size={20} />
          </button>
        </header>

        {/* Summary Card */}
        <div className="bg-emerald-900 text-white rounded-3xl p-10 shadow-2xl shadow-emerald-900/40 relative overflow-hidden group transition-transform hover:scale-[1.01]">
          <div className="relative z-10">
            <p className="text-emerald-300 text-[10px] uppercase tracking-[0.4em] font-black mb-2 opacity-80">Tổng thu nhập đã nhận</p>
            <div className="text-6xl font-black tabular-nums tracking-tighter">
              {totalReceivedSum.toLocaleString()} <span className="text-2xl text-emerald-400">đ</span>
            </div>
          </div>
          <div className="absolute top-1/2 -right-12 -translate-y-1/2 opacity-10 rotate-12 transition-transform group-hover:scale-110">
            <svg width="240" height="240" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.length > 0 ? history.map((data) => (
            <motion.div 
              key={data.monthStr}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl">
                ĐÃ NHẬN
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-6 capitalize tracking-tight">{data.label}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold tracking-tight">Số ngày làm</span>
                  <span className="font-black text-emerald-600 text-lg tabular-nums">{data.count} ngày</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-4">
                  <span className="text-slate-500 font-bold tracking-tight">Thực nhận</span>
                  <span className="font-black text-slate-900 text-lg tabular-nums">{data.salary.toLocaleString()} đ</span>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <div className="text-4xl mb-4">📝</div>
              <p className="font-black uppercase tracking-widest text-[10px]">Chưa có dữ liệu nhận lương</p>
            </div>
          )}
        </div>

        <footer className="mt-auto flex justify-center pt-8">
          <div className="bg-white rounded-full px-8 py-4 shadow-2xl border border-slate-200 flex space-x-16">
            <div onClick={() => setActiveTab('calendar')} className="flex flex-col items-center text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors">
              <div className="w-6 h-6 mb-1 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Lịch công</span>
            </div>
            <div className="flex flex-col items-center text-emerald-600 cursor-pointer transition-colors">
              <div className="w-6 h-6 mb-1 flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Báo cáo</span>
            </div>
          </div>
        </footer>

        <AnimatePresence>
          {isSettingsOpen && (
            <SettingsModal 
              currentRate={dailyRate}
              onClose={() => setIsSettingsOpen(false)}
              onSave={setDailyRate}
              onReset={resetAll}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 flex flex-col max-w-[1240px] mx-auto animate-in">
      <CalendarHeader 
        currentMonth={currentMonth} 
        onPrev={handlePrevMonth} 
        onNext={handleNextMonth} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex flex-1 gap-8 flex-col lg:flex-row">
        {/* Calendar Section */}
        <div className="flex-[2] bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <div className="grid grid-cols-7 gap-4 text-center mb-6">
            {weekDays.map((day, i) => (
              <div key={i} className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {day === 'S' && i === 5 ? 'Thứ 7' : day === 'S' && i === 6 ? 'Chủ Nhật' : `Thứ ${i + 2}`}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-4">
            {calendarDays.map((day) => (
              <DayCell 
                key={day.toISOString()} 
                date={day}
                isCurrentMonth={isSameMonth(day, currentMonth)}
                isLocked={isMonthLocked}
                status={records[format(day, 'yyyy-MM-dd')]}
                onSelect={setSelectedDate}
              />
            ))}
          </div>
        </div>

        {/* Sidebar Report */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
            {isMonthLocked && (
              <div className="absolute top-0 right-0 bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl shadow-lg">
                Đã nhận
              </div>
            )}
            <h2 className="text-xl font-black mb-8 flex items-center text-slate-800 tracking-tight">
              <span className="mr-3 text-2xl">📊</span> Thống kê tháng này
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-500 text-xs font-black uppercase tracking-wider">Ngày làm việc</span>
                <span className="text-xl font-black text-emerald-600 tabular-nums">{workedDays}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-500 text-xs font-black uppercase tracking-wider">Ngày không làm</span>
                <span className="text-xl font-black text-rose-500 tabular-nums">{offDays}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-500 text-xs font-black uppercase tracking-wider">Đơn giá / ngày</span>
                <span className="text-sm font-black tabular-nums">{dailyRate.toLocaleString()} đ</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-900 text-white rounded-3xl p-8 shadow-2xl shadow-emerald-900/40 relative group transition-transform hover:scale-[1.02]">
            <p className="text-emerald-300 text-[10px] uppercase tracking-[0.3em] font-black mb-1">Tổng lương dự kiến</p>
            <div className="text-4xl font-black tabular-nums">{totalSalary.toLocaleString()} đ</div>
          </div>

          <div className="mt-auto space-y-4">
            <button 
              disabled={isMonthLocked}
              onClick={handleLock}
              className={cn(
                "w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all",
                isMonthLocked 
                  ? "bg-emerald-700 text-white shadow-none cursor-default" 
                  : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 active:scale-95"
              )}
            >
              Đã nhận lương
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative Bottom Nav */}
      <footer className="mt-12 flex justify-center">
        <div className="bg-white rounded-full px-8 py-4 shadow-2xl border border-slate-200 flex space-x-16">
          <div className={cn(
            "flex flex-col items-center cursor-pointer transition-colors",
            activeTab === 'calendar' ? "text-emerald-600" : "text-slate-400 hover:text-emerald-600"
          )} onClick={() => setActiveTab('calendar')}>
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Lịch công</span>
          </div>
          <div className={cn(
            "flex flex-col items-center cursor-pointer transition-colors",
            activeTab === 'report' ? "text-emerald-600" : "text-slate-400 hover:text-emerald-600"
          )} onClick={() => setActiveTab('report')}>
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Báo cáo</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {selectedDate && (
          <StatusModal 
            date={selectedDate}
            currentStatus={records[format(selectedDate, 'yyyy-MM-dd')]}
            onClose={() => setSelectedDate(null)}
            onStatusChange={handleStatusChange}
          />
        )}
        {isSettingsOpen && (
          <SettingsModal 
            currentRate={dailyRate}
            onClose={() => setIsSettingsOpen(false)}
            onSave={setDailyRate}
            onReset={resetAll}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
