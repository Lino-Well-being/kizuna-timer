'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Timer from '@/components/Timer';
import AudioRecorder from '@/components/AudioRecorder';
import { getTodayWords, getTodayCategory, getCategoryInfo, speakEnglish, type Word } from '@/lib/words';
import { saveTodayRecord } from '@/lib/storage';

export default function TimerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [todayWords, setTodayWords] = useState<Word[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<{ japanese: string; emoji: string } | null>(null);
  const [minutes, setMinutes] = useState(10);

  useEffect(() => {
    // URLパラメータから時間を取得
    const minutesParam = searchParams.get('minutes');
    if (minutesParam) {
      setMinutes(parseFloat(minutesParam));
    }

    // 今日の単語を3つ取得
    const words = getTodayWords(3);
    setTodayWords(words);

    // カテゴリー情報を取得
    const category = getTodayCategory();
    const info = getCategoryInfo(category);
    if (info) {
      setCategoryInfo({
        japanese: info.japanese,
        emoji: info.emoji,
      });
    }
  }, [searchParams]);

  const handleComplete = () => {
    // タイマー完了時の処理：記録を保存
    if (todayWords.length > 0) {
      // 最初の単語のIDを保存（または3つ全部保存する方法も検討）
      saveTodayRecord(todayWords[0].id, true);
      console.log('タイマー完了！記録を保存しました。');
    }
  };

  const handleSpeakWord = (word: string) => {
    speakEnglish(word);
  };

  const handleSpeakSentence = (text: string) => {
    speakEnglish(text);
  };

  if (todayWords.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-pink-50">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </div>
    );
  }

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
        <div className="text-center">
          <div className="text-3xl">🐶</div>
          <h1 className="text-xl font-bold text-gray-800">
            {minutes}分タイマー
          </h1>
        </div>
        <div className="w-24" /> {/* スペーサー */}
      </header>

      {/* メインコンテンツ */}
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        {/* タイマー */}
        <Timer minutes={minutes} onComplete={handleComplete} />

        {/* カテゴリー情報 */}
        <div className="mb-4 mt-8 text-center">
          <div className="text-xl font-bold text-gray-700">
            今日の単語 {categoryInfo?.emoji || '📚'}
          </div>
          {categoryInfo && (
            <div className="mt-1 text-sm text-gray-500">
              カテゴリー: {categoryInfo.japanese}
            </div>
          )}
        </div>

        {/* 今日の単語3つ */}
        <div className="mb-8 w-full max-w-md space-y-4">
          {todayWords.map((word, wordIndex) => (
            <div
              key={word.id}
              className="rounded-3xl bg-white p-6 shadow-lg"
            >
              {/* 単語番号 */}
              <div className="mb-3 text-center">
                <span className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1 text-sm font-bold text-white">
                  単語 {wordIndex + 1}/3
                </span>
              </div>

              {/* 単語 */}
              <div className="mb-4 text-center">
                <div className="mb-2 flex items-center justify-center gap-3">
                  <span className="text-4xl">{word.emoji}</span>
                  <div>
                    <div className="text-4xl font-bold text-gray-800">
                      {word.english}
                    </div>
                    <div className="text-lg text-gray-600">{word.japanese}</div>
                  </div>
                </div>
              </div>

              {/* 短文 */}
              <div className="space-y-2">
                {word.sentences.map((sentence, index) => (
                  <button
                    key={index}
                    onClick={() => handleSpeakSentence(sentence.english)}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-3 text-left transition-all hover:scale-102 hover:shadow-md"
                  >
                    <div className="text-sm font-medium text-blue-900">
                      {sentence.english}
                    </div>
                    <div className="text-xs text-blue-700">{sentence.japanese}</div>
                  </button>
                ))}
              </div>

              {/* 音声再生ボタン */}
              <div className="mt-3">
                <button
                  onClick={() => handleSpeakWord(word.english)}
                  className="w-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-md"
                >
                  🔊 単語を聞く
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 録音セクション */}
        <div className="mt-8 w-full max-w-md rounded-3xl bg-white p-6 shadow-lg">
          <div className="mb-4 text-center text-xl font-bold text-gray-700">
            🎤 発音を録音しよう
          </div>
          <p className="mb-4 text-center text-sm text-gray-600">
            どの単語でも録音できます
          </p>
          <AudioRecorder
            wordId={todayWords[0].id}
            onRecordingComplete={(id) => {
              console.log('録音完了:', id);
            }}
          />
        </div>
      </main>
    </div>
  );
}
