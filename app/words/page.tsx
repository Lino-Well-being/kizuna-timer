'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAllRecords } from '@/lib/storage';
import { speakEnglish } from '@/lib/words';
import wordsData from '@/data/words.json';

interface Word {
  id: number;
  english: string;
  japanese: string;
  category: string;
  emoji: string;
}

export default function WordsPage() {
  const [completedWordIds, setCompletedWordIds] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // 完了した単語IDのセットを作成
    const records = getAllRecords();
    const completedIds = new Set(
      records
        .filter((r) => r.completed)
        .map((r) => r.wordId)
    );
    setCompletedWordIds(completedIds);
  }, []);

  const allWords = wordsData.words as Word[];

  // カテゴリー別にグループ化
  const categories = [
    { value: 'all', label: 'すべて', emoji: '📚' },
    { value: 'animals', label: '動物', emoji: '🐾' },
    { value: 'food', label: '食べ物', emoji: '🍎' },
    { value: 'things', label: '身の回りのもの', emoji: '🎁' },
    { value: 'family', label: '家族', emoji: '👨‍👩‍👧‍👦' },
    { value: 'nature', label: '自然', emoji: '🌳' },
    { value: 'colors', label: '色', emoji: '🎨' },
    { value: 'home', label: 'おうち', emoji: '🏠' },
    { value: 'numbers', label: '数字', emoji: '🔢' },
    { value: 'weather', label: '天気', emoji: '☀️' },
  ];

  // フィルタリング
  const filteredWords =
    selectedCategory === 'all'
      ? allWords
      : allWords.filter((w) => w.category === selectedCategory);

  // 進捗計算
  const totalWords = allWords.length;
  const completedCount = allWords.filter((w) => completedWordIds.has(w.id)).length;
  const progress = Math.round((completedCount / totalWords) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-pink-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white shadow-md">
        <div className="flex items-center justify-between p-4">
          <Link
            href="/"
            className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-all hover:bg-gray-200"
          >
            ← 戻る
          </Link>
          <h1 className="text-xl font-bold text-gray-800">単語リスト</h1>
          <div className="w-16" /> {/* スペーサー */}
        </div>

        {/* 進捗バー */}
        <div className="px-4 pb-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">
              進捗: {completedCount}/{totalWords}単語
            </span>
            <span className="font-bold text-purple-600">{progress}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* カテゴリーフィルター */}
        <div className="overflow-x-auto px-4 pb-4">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 単語リスト */}
      <main className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWords.map((word) => {
            const isCompleted = completedWordIds.has(word.id);
            return (
              <button
                key={word.id}
                onClick={() => speakEnglish(word.english)}
                className={`rounded-2xl p-4 shadow-md transition-all hover:scale-105 hover:shadow-lg text-left ${
                  isCompleted
                    ? 'bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-3xl">{word.emoji}</span>
                  {isCompleted && (
                    <span className="text-xl">✅</span>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {word.english}
                </div>
                <div className="text-sm text-gray-600">{word.japanese}</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-gray-500">#{word.id}</div>
                  <div className="text-sm text-gray-400">🔊</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 空状態 */}
        {filteredWords.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-4xl">📚</div>
            <p className="mt-2 text-gray-600">このカテゴリーに単語がありません</p>
          </div>
        )}
      </main>
    </div>
  );
}
