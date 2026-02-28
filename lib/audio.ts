/**
 * 音声録音機能のユーティリティ
 * Web Audio APIとMediaRecorderを使用
 */

export interface AudioRecording {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO 8601
  audioUrl: string; // Blob URL or Data URL
  duration: number; // 秒
  wordId?: number;
}

const STORAGE_KEY = 'kizuna-timer-recordings';

/**
 * すべての録音を取得
 */
export function getAllRecordings(): AudioRecording[] {
  if (typeof window === 'undefined') return [];

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse recordings:', error);
    return [];
  }
}

/**
 * 録音を保存
 */
export function saveRecording(recording: AudioRecording): void {
  if (typeof window === 'undefined') return;

  const recordings = getAllRecordings();
  recordings.push(recording);

  // 最新100件のみ保持
  const limitedRecordings = recordings.slice(-100);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedRecordings));
}

/**
 * 録音を削除
 */
export function deleteRecording(id: string): void {
  if (typeof window === 'undefined') return;

  const recordings = getAllRecordings();
  const filtered = recordings.filter((r) => r.id !== id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * 今日の録音を取得
 */
export function getTodayRecordings(): AudioRecording[] {
  const today = new Date().toISOString().split('T')[0];
  return getAllRecordings().filter((r) => r.date === today);
}

/**
 * 指定日の録音を取得
 */
export function getRecordingsByDate(date: string): AudioRecording[] {
  return getAllRecordings().filter((r) => r.date === date);
}

/**
 * 録音クラス
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;

  /**
 * 録音を開始
   */
  async start(): Promise<void> {
    try {
      // マイクへのアクセスを要求
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // MediaRecorderを作成
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm',
      });

      this.audioChunks = [];
      this.startTime = Date.now();

      // データが利用可能になったときのハンドラ
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // 録音を開始
      this.mediaRecorder.start();
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * 録音を停止して保存
   */
  async stop(): Promise<AudioRecording> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder is not initialized'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          // Blobを作成
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

          // Data URLに変換（ローカルストレージに保存するため）
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);

          reader.onloadend = () => {
            const audioUrl = reader.result as string;
            const duration = (Date.now() - this.startTime) / 1000;

            const recording: AudioRecording = {
              id: Date.now().toString(),
              date: new Date().toISOString().split('T')[0],
              timestamp: new Date().toISOString(),
              audioUrl,
              duration,
            };

            // ストリームを停止
            if (this.stream) {
              this.stream.getTracks().forEach((track) => track.stop());
            }

            resolve(recording);
          };

          reader.onerror = () => {
            reject(new Error('Failed to convert audio to data URL'));
          };
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * 録音をキャンセル
   */
  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }

    this.audioChunks = [];
  }

  /**
   * 録音中かどうか
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

/**
 * 音声を再生
 */
export function playAudio(audioUrl: string): HTMLAudioElement {
  const audio = new Audio(audioUrl);
  audio.play();
  return audio;
}

/**
 * 録音時間をフォーマット
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
