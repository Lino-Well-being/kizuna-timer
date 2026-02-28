/**
 * 実施記録を管理するユーティリティ
 * ローカルストレージを使用（将来的にSupabaseに移行）
 */

export interface SessionRecord {
  date: string; // YYYY-MM-DD形式
  wordId: number;
  completed: boolean;
  completedAt?: string; // ISO 8601形式
}

const STORAGE_KEY = 'kizuna-timer-records';

/**
 * すべての実施記録を取得
 */
export function getAllRecords(): SessionRecord[] {
  if (typeof window === 'undefined') return [];

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse records:', error);
    return [];
  }
}

/**
 * 今日の記録を取得
 */
export function getTodayRecord(): SessionRecord | null {
  const today = new Date().toISOString().split('T')[0];
  const records = getAllRecords();
  return records.find((r) => r.date === today) || null;
}

/**
 * 指定日の記録を取得
 */
export function getRecordByDate(date: string): SessionRecord | null {
  const records = getAllRecords();
  return records.find((r) => r.date === date) || null;
}

/**
 * 実施記録を保存
 */
export function saveRecord(record: SessionRecord): void {
  if (typeof window === 'undefined') return;

  const records = getAllRecords();
  const existingIndex = records.findIndex((r) => r.date === record.date);

  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/**
 * 今日の記録を保存
 */
export function saveTodayRecord(wordId: number, completed: boolean): void {
  const today = new Date().toISOString().split('T')[0];
  const record: SessionRecord = {
    date: today,
    wordId,
    completed,
    completedAt: completed ? new Date().toISOString() : undefined,
  };
  saveRecord(record);
}

/**
 * 連続日数を計算
 */
export function calculateStreak(): number {
  const records = getAllRecords()
    .filter((r) => r.completed)
    .sort((a, b) => b.date.localeCompare(a.date)); // 新しい順

  if (records.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < records.length; i++) {
    const recordDate = new Date(records[i].date);
    recordDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - streak);

    if (recordDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * 指定月の実施日リストを取得
 */
export function getCompletedDatesInMonth(year: number, month: number): string[] {
  const records = getAllRecords().filter((r) => r.completed);
  const monthStr = String(month).padStart(2, '0');

  return records
    .filter((r) => r.date.startsWith(`${year}-${monthStr}`))
    .map((r) => r.date);
}

/**
 * 実施日数を取得（全期間）
 */
export function getTotalCompletedDays(): number {
  return getAllRecords().filter((r) => r.completed).length;
}

/**
 * 次のマイルストーン（目標）を取得
 */
export function getNextMilestone(): { days: number; label: string } {
  const streak = calculateStreak();

  const milestones = [
    { days: 7, label: '1週間' },
    { days: 14, label: '2週間' },
    { days: 30, label: '1ヶ月' },
    { days: 60, label: '2ヶ月' },
    { days: 100, label: '100日' },
    { days: 365, label: '1年' },
  ];

  for (const milestone of milestones) {
    if (streak < milestone.days) {
      return milestone;
    }
  }

  return { days: streak + 100, label: `${streak + 100}日` };
}
