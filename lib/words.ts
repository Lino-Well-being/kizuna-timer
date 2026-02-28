import wordsData from '@/data/words.json';

export interface Word {
  id: number;
  english: string;
  japanese: string;
  category: string;
  emoji: string;
  sentences: {
    pattern: string;
    english: string;
    japanese: string;
  }[];
}

export interface Category {
  japanese: string;
  emoji: string;
  count: number;
  weekday: string;
}

// 曜日から英語名を取得
const WEEKDAY_MAP: { [key: number]: string } = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

// 曜日からカテゴリーを取得
const WEEKDAY_TO_CATEGORY: { [key: string]: string } = {
  monday: 'animals',
  tuesday: 'food',
  wednesday: 'things',
  thursday: 'family',
  friday: 'nature',
  saturday: 'colors',
  sunday: 'home',
};

/**
 * 今日の曜日に応じたカテゴリーを取得
 */
export function getTodayCategory(): string {
  const today = new Date().getDay();
  const weekdayName = WEEKDAY_MAP[today];
  return WEEKDAY_TO_CATEGORY[weekdayName];
}

/**
 * カテゴリー情報を取得
 */
export function getCategoryInfo(categoryName: string): Category | null {
  const categories = wordsData.categories as { [key: string]: Category };
  return categories[categoryName] || null;
}

/**
 * 指定カテゴリーの全単語を取得
 */
export function getWordsByCategory(category: string): Word[] {
  return wordsData.words.filter((word) => word.category === category) as Word[];
}

/**
 * 指定カテゴリーからランダムに1単語を取得
 */
export function getRandomWordFromCategory(category: string): Word | null {
  const words = getWordsByCategory(category);
  if (words.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

/**
 * 指定カテゴリーからランダムに複数の単語を取得（重複なし）
 */
export function getRandomWordsFromCategory(category: string, count: number): Word[] {
  const words = getWordsByCategory(category);
  if (words.length === 0) return [];

  // シャッフルして必要な数だけ取得
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, words.length));
}

/**
 * 今日の単語を取得（曜日に応じたカテゴリーからランダム選択）
 */
export function getTodayWord(): Word | null {
  const category = getTodayCategory();
  return getRandomWordFromCategory(category);
}

/**
 * 今日の単語を複数取得（曜日に応じたカテゴリーからランダム選択）
 */
export function getTodayWords(count: number = 3): Word[] {
  const category = getTodayCategory();
  return getRandomWordsFromCategory(category, count);
}

/**
 * 単語IDで単語を取得
 */
export function getWordById(id: number): Word | null {
  const word = wordsData.words.find((w) => w.id === id);
  return word as Word | null;
}

/**
 * テキストを音声で読み上げる（Web Speech API）
 */
export function speakText(text: string, lang: string = 'en-US'): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech Synthesis API is not supported in this browser.');
    return;
  }

  // 既存の音声を停止
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // 少しゆっくり
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
}

/**
 * 日本語テキストを読み上げる
 */
export function speakJapanese(text: string): void {
  speakText(text, 'ja-JP');
}

/**
 * 英語テキストを読み上げる
 */
export function speakEnglish(text: string): void {
  speakText(text, 'en-US');
}
