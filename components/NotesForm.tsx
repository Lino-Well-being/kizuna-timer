'use client';

import { useState, useEffect } from 'react';
import { getTodayRecord, updateTodayNotes } from '@/lib/storage';

export default function NotesForm() {
  const [books, setBooks] = useState('');
  const [materials, setMaterials] = useState('');
  const [other, setOther] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // 既存のメモがあれば読み込む
    const record = getTodayRecord();
    if (record?.notes) {
      setBooks(record.notes.books || '');
      setMaterials(record.notes.materials || '');
      setOther(record.notes.other || '');
    }
  }, []);

  const handleSave = () => {
    updateTodayNotes({
      books: books.trim() || undefined,
      materials: materials.trim() || undefined,
      other: other.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-gray-800">今日の記録</h2>
        <p className="mt-1 text-sm text-gray-600">
          やったことを記録しておこう！
        </p>
      </div>

      <div className="space-y-4">
        {/* 絵本 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            📚 読んだ絵本
          </label>
          <textarea
            value={books}
            onChange={(e) => setBooks(e.target.value)}
            placeholder="例: The Very Hungry Caterpillar"
            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            rows={2}
          />
        </div>

        {/* 教材 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            ✏️ 使った教材
          </label>
          <textarea
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            placeholder="例: フォニックスカード、YouTube動画など"
            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            rows={2}
          />
        </div>

        {/* その他 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            💭 その他メモ
          </label>
          <textarea
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder="例: 子どもの反応、気づいたことなど"
            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            rows={3}
          />
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          className={`w-full rounded-full px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 ${
            saved
              ? 'bg-green-500'
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          }`}
        >
          {saved ? '✓ 保存しました！' : '保存する'}
        </button>
      </div>
    </div>
  );
}
