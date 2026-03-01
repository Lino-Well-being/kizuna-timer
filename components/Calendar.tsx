'use client';

import { useState } from 'react';

interface CalendarProps {
  completedDates: string[]; // YYYY-MM-DD形式の配列
  onDateClick?: (date: string) => void;
}

export default function Calendar({ completedDates, onDateClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 月の最初の日と最後の日
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // カレンダーの開始日（月曜日始まり）
  const startDate = new Date(firstDay);
  const dayOfWeek = firstDay.getDay();
  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 月曜日を0とする
  startDate.setDate(firstDay.getDate() - offset);

  // カレンダーの日付配列を生成（6週間分）
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }

  // 日付が完了済みかチェック（ローカル時刻で比較）
  const isCompleted = (date: Date): boolean => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return completedDates.includes(dateStr);
  };

  // 今日かチェック
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // 当月かチェック
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === month;
  };

  // 前月へ
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // 次月へ
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 日付クリック（ローカル時刻で変換）
  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      onDateClick(dateStr);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg">
      {/* ヘッダー */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="rounded-full p-2 transition-all hover:bg-gray-100"
        >
          ←
        </button>
        <div className="text-xl font-bold text-gray-800">
          {year}年{month + 1}月
        </div>
        <button
          onClick={handleNextMonth}
          className="rounded-full p-2 transition-all hover:bg-gray-100"
        >
          →
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {['月', '火', '水', '木', '金', '土', '日'].map((day, index) => (
          <div
            key={day}
            className={`text-center text-sm font-medium ${
              index === 5 ? 'text-blue-600' : index === 6 ? 'text-red-600' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダー本体 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const completed = isCompleted(day);
          const today = isToday(day);
          const currentMonth = isCurrentMonth(day);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              className={`
                relative aspect-square rounded-lg p-2 text-sm transition-all
                ${!currentMonth && 'text-gray-300'}
                ${currentMonth && !completed && 'hover:bg-gray-100'}
                ${today && 'ring-2 ring-purple-500'}
                ${completed && 'bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold'}
              `}
            >
              <div className="flex h-full flex-col items-center justify-center">
                <div>{day.getDate()}</div>
                {completed && <div className="text-xs">⭐</div>}
              </div>
            </button>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="mt-4 flex justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-gradient-to-br from-blue-500 to-purple-500"></div>
          <span>実施済み</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded ring-2 ring-purple-500"></div>
          <span>今日</span>
        </div>
      </div>
    </div>
  );
}
