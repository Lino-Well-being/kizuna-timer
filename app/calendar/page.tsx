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
  getAllRecords,
  type SessionRecord,
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
  const [monthRecords, setMonthRecords] = useState<SessionRecord[]>([]);

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

    // 月間記録を取得
    const allRecords = getAllRecords();
    const monthStr = String(month).padStart(2, '0');
    const records = allRecords
      .filter((r) => r.date.startsWith(`${year}-${monthStr}`))
      .sort((a, b) => a.date.localeCompare(b.date)); // 日付順にソート
    setMonthRecords(records);
  }, [currentDate]);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    const record = getRecordByDate(date);
    if (record && record.completed) {
      const words = (record.wordIds || [])
        .map((id) => getWordById(id))
        .filter(Boolean);
      if (words.length > 0) {
        setSelectedWord({
          english: words.map((w) => w!.english).join(', '),
          japanese: words.map((w) => w!.japanese).join(', '),
        });
      }
    } else {
      setSelectedWord(null);
    }
  };

  // CSVダウンロード
  const handleDownloadCSV = () => {
    if (monthRecords.length === 0) {
      alert('記録がありません');
      return;
    }

    // CSVヘッダー
    const headers = ['日付', '時間帯', '単語', '絵本', '教材', 'メモ'];

    // CSVデータ
    const rows = monthRecords.map((record) => {
      const date = new Date(record.date + 'T00:00:00');
      const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

      // 時間帯
      let timeLabel = '';
      if (record.completedAt) {
        const time = new Date(record.completedAt);
        const hour = time.getHours();
        if (hour < 12) timeLabel = '朝';
        else if (hour < 18) timeLabel = '昼';
        else timeLabel = '夜';
      }

      // 単語
      const words = (record.wordIds || [])
        .map((id) => {
          const word = getWordById(id);
          return word ? word.english : null;
        })
        .filter(Boolean)
        .join(', ');

      return [
        dateStr,
        timeLabel,
        words || '',
        record.notes?.books || '',
        record.notes?.materials || '',
        record.notes?.other || '',
      ];
    });

    // CSV文字列を生成
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    // BOM付きUTF-8でダウンロード
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const filename = `キズナタイマー_${year}年${month}月.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <Calendar
          completedDates={completedDates}
          onDateClick={handleDateClick}
          currentDate={currentDate}
          onMonthChange={setCurrentDate}
        />

        {/* 月間記録テーブル */}
        <div className="mt-8 w-full max-w-4xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex-1" />
            <h2 className="text-xl font-bold text-gray-800">
              {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月の記録
            </h2>
            <div className="flex-1 text-right">
              {monthRecords.length > 0 && (
                <button
                  onClick={handleDownloadCSV}
                  className="rounded-full bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-green-600 hover:shadow-lg"
                >
                  📥 CSVダウンロード
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto rounded-3xl bg-white shadow-lg">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold">日付</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">📖 単語</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">📚 絵本</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">✏️ 教材</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">💭 メモ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {monthRecords.length > 0 ? (
                  monthRecords.map((record, index) => {
                    const date = new Date(record.date + 'T00:00:00');
                    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

                    // 完了時刻から時間帯を取得
                    let timeLabel = '';
                    if (record.completedAt) {
                      const time = new Date(record.completedAt);
                      const hour = time.getHours();
                      if (hour < 12) timeLabel = '朝';
                      else if (hour < 18) timeLabel = '昼';
                      else timeLabel = '夜';
                    }

                    // 単語を取得（undefinedチェック）
                    const words = (record.wordIds || [])
                      .map((id) => {
                        const word = getWordById(id);
                        return word ? word.english : null;
                      })
                      .filter(Boolean)
                      .join(', ');

                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                          {dateStr}
                          {timeLabel && <span className="ml-1 text-xs text-gray-500">({timeLabel})</span>}
                          {record.completed && <span className="ml-2">⭐</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {words || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {record.notes?.books || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {record.notes?.materials || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {record.notes?.other || '-'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      この月の記録はまだありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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
