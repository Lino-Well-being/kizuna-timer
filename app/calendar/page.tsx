'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import {
  calculateStreak,
  getCompletedDatesInMonth,
  getTotalCompletedDays,
  getNextMilestone,
  getRecordByDate,
} from '@/lib/storage';
import { getWordById } from '@/lib/words';

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [nextMilestone, setNextMilestone] = useState({ days: 7, label: '1週間' });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<{ english: string; japanese: string } | null>(null);

  useEffect(() => {
    // データを読み込む
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const dates = getCompletedDatesInMonth(year, month);
    setCompletedDates(dates);

    const currentStreak = calculateStreak();
    setStreak(currentStreak);

    const total = getTotalCompletedDays();
    setTotalDays(total);

    const milestone = getNextMilestone();
    setNextMilestone(milestone);
  }, [currentDate]);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    const record = getRecordByDate(date);
    if (record && record.completed) {
      const word = getWordById(record.wordId);
      if (word) {
        setSelectedWord({ english: word.english, japanese: word.japanese });
      }
    } else {
      setSelectedWord(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-pink-50">
      {/* ヘッダー */}
      <header className="flex items-center justify-between p-6">
        <button
          onClick={() => router.push('/')}
          className="rounded-full bg-white px-6 py-2 text-gray-700 shadow-md transition-all hover:bg-gray-50"
        >
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-800">カレンダー</h1>
        <div className="w-24" /> {/* スペーサー */}
      </header>

      {/* メインコンテンツ */}
      <main className="flex flex-1 flex-col items-center p-8">
        {/* 統計情報 */}
        <div className="mb-6 w-full max-w-md space-y-4">
          {/* 連続記録 */}
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <div className="text-center">
              <div className="mb-2 text-gray-600">現在の記録</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl">⭐</span>
                <span className="text-5xl font-bold text-yellow-600">{streak}</span>
                <span className="text-2xl text-gray-700">日連続</span>
              </div>
              {streak > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  次の目標：{nextMilestone.label}（あと{nextMilestone.days - streak}日）
                </div>
              )}
            </div>
          </div>

          {/* 累計実施日数 */}
          <div className="rounded-3xl bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white shadow-lg">
            <div className="text-center">
              <div className="mb-2 text-blue-100">累計実施日数</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-bold">{totalDays}</span>
                <span className="text-2xl">日</span>
              </div>
            </div>
          </div>
        </div>

        {/* カレンダー */}
        <Calendar completedDates={completedDates} onDateClick={handleDateClick} />

        {/* 選択した日の詳細 */}
        {selectedDate && selectedWord && (
          <div className="mt-6 w-full max-w-md rounded-3xl bg-white p-6 shadow-lg">
            <div className="text-center">
              <div className="mb-2 text-gray-600">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="text-3xl font-bold text-gray-800">{selectedWord.english}</div>
              <div className="text-xl text-gray-600">{selectedWord.japanese}</div>
            </div>
          </div>
        )}

        {/* メッセージ */}
        {streak === 0 && totalDays === 0 && (
          <div className="mt-6 text-center text-gray-600">
            <p>まだ記録がありません。</p>
            <p className="mt-2">今日から始めてみましょう！ 🚀</p>
          </div>
        )}
      </main>
    </div>
  );
}
