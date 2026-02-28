'use client';

import { useState, useEffect } from 'react';
import { AudioRecorder as Recorder, saveRecording, formatDuration } from '@/lib/audio';

interface AudioRecorderProps {
  onRecordingComplete?: (recordingId: string) => void;
  wordId?: number;
}

export default function AudioRecorder({ onRecordingComplete, wordId }: AudioRecorderProps) {
  const [recorder] = useState(() => new Recorder());
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const handleStart = async () => {
    try {
      setError(null);
      await recorder.start();
      setIsRecording(true);
      setDuration(0);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。');
    }
  };

  const handleStop = async () => {
    try {
      const recording = await recorder.stop();

      // wordIdを追加
      if (wordId) {
        recording.wordId = wordId;
      }

      // 録音を保存
      saveRecording(recording);

      setIsRecording(false);
      setDuration(0);

      // コールバックを呼び出し
      if (onRecordingComplete) {
        onRecordingComplete(recording.id);
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setError('録音の保存に失敗しました。');
    }
  };

  const handleCancel = () => {
    recorder.cancel();
    setIsRecording(false);
    setDuration(0);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* エラーメッセージ */}
      {error && (
        <div className="w-full rounded-2xl bg-red-50 p-4 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 録音状態 */}
      {isRecording && (
        <div className="flex flex-col items-center gap-2">
          {/* 録音中アニメーション */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
            <span className="text-lg font-medium text-gray-700">録音中...</span>
          </div>

          {/* 経過時間 */}
          <div className="text-3xl font-bold text-gray-800">
            {formatDuration(duration)}
          </div>

          {/* 波形アニメーション（簡易版） */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 animate-pulse rounded-full bg-blue-500"
                style={{
                  height: `${20 + Math.random() * 30}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* コントロールボタン */}
      <div className="flex gap-2">
        {!isRecording ? (
          <button
            onClick={handleStart}
            className="rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            🎤 録音開始
          </button>
        ) : (
          <>
            <button
              onClick={handleStop}
              className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              ⏹️ 停止
            </button>
            <button
              onClick={handleCancel}
              className="rounded-full border-2 border-gray-300 bg-white px-8 py-4 font-bold text-gray-700 shadow-lg transition-all hover:scale-105 hover:border-gray-400"
            >
              ✕ キャンセル
            </button>
          </>
        )}
      </div>
    </div>
  );
}
