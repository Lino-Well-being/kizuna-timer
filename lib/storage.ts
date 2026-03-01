/**
 * 実施記録を管理するユーティリティ
 * ローカルストレージを使用（将来的にSupabaseに移行）
 */

export interface SessionRecord {
  id: string; // ユニークID（日付+タイムスタンプ）
  date: string; // YYYY-MM-DD形式
  wordIds: number[]; // 学習した単語IDの配列（最大3つ）
  completed: boolean;
  completedAt?: string; // ISO 8601形式
  notes?: {
    books?: string; // 読んだ絵本
    materials?: string; // 使った教材
    other?: string; // その他メモ
  };
}

const STORAGE_KEY = 'kizuna-timer-records';

/**
 * ローカル時刻でYYYY-MM-DD形式の日付文字列を取得
 */
function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 古いデータ形式を新しい形式に変換
 */
function migrateOldRecord(record: any): SessionRecord {
  // 古い形式の場合は変換
  if ('wordId' in record && !('wordIds' in record)) {
    return {
      id: record.id || `${record.date}_${record.completedAt || new Date().toISOString()}`,
      date: record.date,
      wordIds: [record.wordId], // 単一IDを配列に変換
      completed: record.completed,
      completedAt: record.completedAt,
      notes: record.notes,
    };
  }

  // idがない場合は追加
  if (!record.id) {
    return {
      ...record,
      id: `${record.date}_${record.completedAt || new Date().toISOString()}`,
    };
  }

  return record;
}

/**
 * すべての実施記録を取得（自動的に古いデータを変換）
 */
export function getAllRecords(): SessionRecord[] {
  if (typeof window === 'undefined') return [];

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  try {
    const rawRecords = JSON.parse(data);
    const migratedRecords = rawRecords.map(migrateOldRecord);

    // 変換が必要だった場合は保存し直す
    const needsMigration = rawRecords.some((r: any, i: number) =>
      JSON.stringify(r) !== JSON.stringify(migratedRecords[i])
    );

    if (needsMigration) {
      console.log('📝 古いデータ形式を新しい形式に変換しました');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedRecords));
    }

    return migratedRecords;
  } catch (error) {
    console.error('Failed to parse records:', error);
    return [];
  }
}

/**
 * 今日の記録を取得（最新のセッション）
 */
export function getTodayRecord(): SessionRecord | null {
  const today = getLocalDateString();
  const records = getAllRecords();
  const todayRecords = records
    .filter((r) => r.date === today)
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  return todayRecords[0] || null;
}

/**
 * 今日の全セッションを取得
 */
export function getTodayRecords(): SessionRecord[] {
  const today = getLocalDateString();
  const records = getAllRecords();
  return records
    .filter((r) => r.date === today)
    .sort((a, b) => (a.completedAt || '').localeCompare(b.completedAt || ''));
}

/**
 * 指定日の記録を取得
 */
export function getRecordByDate(date: string): SessionRecord | null {
  const records = getAllRecords();
  return records.find((r) => r.date === date) || null;
}

/**
 * 実施記録を保存（IDで識別）
 */
export function saveRecord(record: SessionRecord): void {
  if (typeof window === 'undefined') return;

  const records = getAllRecords();
  const existingIndex = records.findIndex((r) => r.id === record.id);

  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/**
 * 今日の記録を保存（新しいセッションとして追加）
 */
export function saveTodayRecord(wordIds: number[], completed: boolean): void {
  const today = getLocalDateString();
  const timestamp = new Date().toISOString();
  const sessionId = `${today}_${timestamp}`; // ユニークなID

  const record: SessionRecord = {
    id: sessionId,
    date: today,
    wordIds,
    completed,
    completedAt: completed ? timestamp : undefined,
  };
  saveRecord(record);
}

/**
 * セッションにメモを追加（最新のセッション）
 */
export function updateSessionNotes(
  sessionId: string,
  notes: {
    books?: string;
    materials?: string;
    other?: string;
  }
): void {
  const records = getAllRecords();
  const existingRecord = records.find((r) => r.id === sessionId);

  if (existingRecord) {
    // 既存の記録を更新
    const record: SessionRecord = {
      ...existingRecord,
      notes: {
        ...existingRecord.notes,
        ...notes,
      },
    };
    saveRecord(record);
  }
}

/**
 * 今日の最新セッションにメモを追加
 */
export function updateTodayNotes(notes: {
  books?: string;
  materials?: string;
  other?: string;
}): void {
  const latestSession = getTodayRecord();
  if (latestSession) {
    updateSessionNotes(latestSession.id, notes);
  }
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
    // YYYY-MM-DD文字列からローカル時刻のDateオブジェクトを作成
    const [year, month, day] = records[i].date.split('-').map(Number);
    const recordDate = new Date(year, month - 1, day);
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
