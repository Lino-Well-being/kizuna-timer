'use client';

import { useState, useEffect } from 'react';
import { playFanfare, playTick } from '@/lib/sound';

interface TimerProps {
  onComplete?: () => void;
  minutes?: number; // タイマーの分数（デフォルト10分）
}

export default function Timer({ onComplete, minutes = 10 }: TimerProps) {
  const TOTAL_SECONDS = minutes * 60;
  const [seconds, setSeconds] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isRunning || isCompleted) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        // 最後の3秒でカウントダウン音を再生
        if (prev <= 3 && prev > 1) {
          playTick();
        }

        if (prev <= 1) {
          setIsRunning(false);
          setIsCompleted(true);
          // ファンファーレを再生
          playFanfare();
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isCompleted, onComplete]);

  const displayMinutes = Math.floor(seconds / 60);
  const displaySeconds = seconds % 60;

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setSeconds(TOTAL_SECONDS);
  };

  // キャラクターの状態を決定
  const getCharacterEmoji = () => {
    if (isCompleted) return '🎉'; // 完了時
    if (!isRunning) return '😊'; // 停止中
    if (seconds <= 60) return '😤'; // ラスト1分
    return '🐶'; // 通常
  };

  const getCharacterMessage = () => {
    if (isCompleted) return 'やったね！';
    if (!isRunning) return 'いつでもOK！';
    if (seconds <= 60) return 'もうちょっと！';
    if (seconds <= 180) return 'がんばって！';
    return 'いっしょにがんばろう！';
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* キャラクター */}
      <div className="text-center">
        <div className={`text-6xl transition-all duration-300 ${isRunning ? 'animate-bounce' : ''}`}>
          {getCharacterEmoji()}
        </div>
        <div className="mt-2 text-sm font-medium text-gray-700">
          {getCharacterMessage()}
        </div>
      </div>

      {/* タイマー表示 */}
      <div className="relative">
        {/* 円形プログレスバー */}
        <svg className="h-64 w-64 -rotate-90 transform">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 120}`}
            strokeDashoffset={`${
              2 * Math.PI * 120 * (1 - seconds / TOTAL_SECONDS)
            }`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        {/* 時間表示 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-800">
              {String(displayMinutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {isCompleted ? '完了！' : isRunning ? '残り時間' : '一時停止中'}
            </div>
          </div>
        </div>
      </div>

      {/* 完了メッセージ */}
      {isCompleted && (
        <div className="animate-bounce text-center">
          <div className="text-4xl">🎉</div>
          <div className="mt-2 text-2xl font-bold text-purple-600">
            よくできました！
          </div>
          <div className="mt-1 text-gray-600">
            10分間、がんばりましたね！
          </div>
        </div>
      )}

      {/* コントロールボタン */}
      <div className="flex gap-4">
        {!isRunning && !isCompleted && (
          <button
            onClick={handleStart}
            className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            {seconds === TOTAL_SECONDS ? 'スタート' : '再開'}
          </button>
        )}

        {isRunning && (
          <button
            onClick={handlePause}
            className="rounded-full bg-gray-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            一時停止
          </button>
        )}

        {(isRunning || seconds < TOTAL_SECONDS) && !isCompleted && (
          <button
            onClick={handleReset}
            className="rounded-full border-2 border-gray-300 bg-white px-8 py-4 text-xl font-bold text-gray-700 shadow-lg transition-all hover:scale-105 hover:border-gray-400"
          >
            リセット
          </button>
        )}

        {isCompleted && (
          <button
            onClick={handleReset}
            className="rounded-full bg-gradient-to-r from-green-500 to-blue-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            もう一度
          </button>
        )}
      </div>
    </div>
  );
}
