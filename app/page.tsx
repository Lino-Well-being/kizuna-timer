'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { calculateStreak } from '@/lib/storage';

export default function Home() {
  const [streak, setStreak] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(10);

  useEffect(() => {
    const currentStreak = calculateStreak();
    setStreak(currentStreak);
  }, []);

  const timeOptions = [
    { minutes: 5, label: '5分' },
    { minutes: 10, label: '10分' },
    { minutes: 15, label: '15分' },
    { minutes: 30, label: '30分' },
  ];

  // テスト用：10秒モード（開発中のみ）
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    timeOptions.unshift({ minutes: 0.17, label: '10秒' }); // 10秒 = 0.17分
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-pink-50">
      <main className="flex w-full max-w-md flex-col items-center gap-8 p-8">
        {/* アプリタイトル */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            キズナタイマー
          </h1>
          <p className="mt-2 text-gray-600">
            毎日の親子時間を習慣化しよう
          </p>
        </div>

        {/* キャラクター */}
        <div className="text-center">
          <div className="text-8xl animate-bounce">🐶</div>
          <div className="mt-2 text-lg font-medium text-gray-700">
            わんこと一緒にがんばろう！
          </div>
        </div>

        {/* 連続記録バッジ */}
        <div className="flex items-center gap-2 rounded-full bg-yellow-100 px-6 py-3">
          <span className="text-2xl">⭐</span>
          <span className="text-xl font-bold text-yellow-700">
            {streak}日連続
          </span>
          <span className="text-2xl">⭐</span>
        </div>

        {/* タイマー時間選択 */}
        <div className="w-full">
          <div className="mb-3 text-center text-sm font-medium text-gray-700">
            時間を選んでね
          </div>
          <div className="grid grid-cols-4 gap-2">
            {timeOptions.map((option) => (
              <button
                key={option.minutes}
                onClick={() => setSelectedMinutes(option.minutes)}
                className={`rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                  selectedMinutes === option.minutes
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 shadow-md hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* スタートボタン */}
        <Link
          href={`/timer?minutes=${selectedMinutes}`}
          className="w-full rounded-3xl bg-gradient-to-r from-blue-500 to-purple-500 px-12 py-6 text-center text-2xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          スタート
        </Link>

        {/* ナビゲーション */}
        <div className="flex w-full gap-4">
          <Link
            href="/calendar"
            className="flex-1 rounded-2xl bg-white px-6 py-4 text-center font-medium text-gray-700 shadow-md transition-all hover:bg-gray-50"
          >
            📅 カレンダー
          </Link>
          <Link
            href="/recordings"
            className="flex-1 rounded-2xl bg-white px-6 py-4 text-center font-medium text-gray-700 shadow-md transition-all hover:bg-gray-50"
          >
            🎤 録音リスト
          </Link>
        </div>

        {/* フッター */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>おうち英語キズナClub</p>
        </div>
      </main>
    </div>
  );
}
