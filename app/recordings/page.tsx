'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getAllRecordings, deleteRecording, playAudio, formatDuration, type AudioRecording } from '@/lib/audio';
import { getWordById } from '@/lib/words';

export default function RecordingsPage() {
  const router = useRouter();
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = () => {
    const allRecordings = getAllRecordings();
    // 新しい順に並べる
    const sorted = allRecordings.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    setRecordings(sorted);
  };

  const handlePlay = (recording: AudioRecording) => {
    const audio = playAudio(recording.audioUrl);
    setPlayingId(recording.id);

    audio.onended = () => {
      setPlayingId(null);
    };
  };

  const handleDelete = (id: string) => {
    if (confirm('この録音を削除しますか？')) {
      deleteRecording(id);
      loadRecordings();
    }
  };

  const getWordInfo = (wordId?: number) => {
    if (!wordId) return null;
    const word = getWordById(wordId);
    return word ? { english: word.english, japanese: word.japanese, emoji: word.emoji } : null;
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
        <h1 className="text-2xl font-bold text-gray-800">録音リスト</h1>
        <div className="w-24" /> {/* スペーサー */}
      </header>

      {/* メインコンテンツ */}
      <main className="flex flex-1 flex-col items-center p-8">
        <div className="w-full max-w-md space-y-4">
          {/* 統計情報 */}
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <div className="text-center">
              <div className="mb-2 text-gray-600">録音数</div>
              <div className="text-5xl font-bold text-purple-600">{recordings.length}</div>
              <div className="mt-2 text-sm text-gray-600">件</div>
            </div>
          </div>

          {/* 録音リスト */}
          {recordings.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
              <div className="mb-4 text-4xl">🎤</div>
              <div className="text-gray-600">まだ録音がありません</div>
              <div className="mt-2 text-sm text-gray-500">
                タイマー画面で発音を録音してみましょう！
              </div>
            </div>
          ) : (
            recordings.map((recording) => {
              const word = getWordInfo(recording.wordId);
              const date = new Date(recording.timestamp);

              return (
                <div
                  key={recording.id}
                  className="rounded-3xl bg-white p-6 shadow-lg transition-all hover:shadow-xl"
                >
                  {/* 日時 */}
                  <div className="mb-3 text-sm text-gray-500">
                    {date.toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                    {date.toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>

                  {/* 単語情報 */}
                  {word && (
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-3xl">{word.emoji}</span>
                      <div>
                        <div className="font-bold text-gray-800">{word.english}</div>
                        <div className="text-sm text-gray-600">{word.japanese}</div>
                      </div>
                    </div>
                  )}

                  {/* 録音時間 */}
                  <div className="mb-3 text-sm text-gray-600">
                    時間: {formatDuration(recording.duration)}
                  </div>

                  {/* コントロールボタン */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePlay(recording)}
                      disabled={playingId === recording.id}
                      className={`flex-1 rounded-full px-6 py-3 font-medium text-white shadow-md transition-all ${
                        playingId === recording.id
                          ? 'bg-gray-400'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 hover:shadow-lg'
                      }`}
                    >
                      {playingId === recording.id ? '⏸️ 再生中' : '▶️ 再生'}
                    </button>
                    <button
                      onClick={() => handleDelete(recording.id)}
                      className="rounded-full border-2 border-red-300 bg-white px-6 py-3 font-medium text-red-600 transition-all hover:scale-105 hover:border-red-400 hover:bg-red-50"
                    >
                      🗑️ 削除
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
