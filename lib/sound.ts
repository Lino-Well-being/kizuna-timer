/**
 * 効果音を生成・再生するユーティリティ
 * Web Audio APIを使用
 */

// 共有AudioContext（ブラウザの制限により1つのインスタンスを再利用）
let audioContext: AudioContext | null = null;

/**
 * AudioContextを取得（必要に応じて作成・再開）
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    console.warn('⚠️ Window is undefined');
    return null;
  }

  if (!window.AudioContext) {
    console.warn('⚠️ Web Audio API is not supported');
    return null;
  }

  try {
    // AudioContextがなければ作成
    if (!audioContext) {
      audioContext = new AudioContext();
      console.log('✅ AudioContext created');
    }

    // サスペンド状態なら再開
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        console.log('✅ AudioContext resumed');
      });
    }

    return audioContext;
  } catch (error) {
    console.error('❌ Failed to get AudioContext:', error);
    return null;
  }
}

/**
 * AudioContextを初期化（ユーザー操作時に呼び出す）
 * ブラウザの自動再生ポリシーに対応するため、ボタンクリック等で呼び出す
 */
export function initAudio(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().then(() => {
      console.log('✅ Audio initialized by user interaction');
    });
  }
}

/**
 * ファンファーレ音を再生
 */
export function playFanfare(): void {
  console.log('🎵 ファンファーレを再生します');

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // ファンファーレのメロディー（ド-ミ-ソ-ド）
    const notes = [
      { frequency: 523.25, duration: 0.2 }, // ド（C5）
      { frequency: 659.25, duration: 0.2 }, // ミ（E5）
      { frequency: 783.99, duration: 0.2 }, // ソ（G5）
      { frequency: 1046.5, duration: 0.4 }, // ド（C6）
    ];

    let startTime = ctx.currentTime;

    notes.forEach((note, index) => {
      // オシレーター（音を生成）
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // 音色を設定（sine = 正弦波、柔らかい音）
      oscillator.type = 'sine';
      oscillator.frequency.value = note.frequency;

      // 音量を大きく設定
      gainNode.gain.setValueAtTime(0.5, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);

      // 音を再生
      oscillator.start(startTime);
      oscillator.stop(startTime + note.duration);

      startTime += note.duration;

      console.log(`♪ Note ${index + 1} scheduled at ${startTime}s`);
    });

    // 最後にキラキラ音を追加
    setTimeout(() => {
      playSparkle();
    }, 800);
  } catch (error) {
    console.error('❌ Failed to play fanfare:', error);
  }
}

/**
 * キラキラ音を再生（ファンファーレの後の装飾音）
 */
function playSparkle(): void {
  console.log('✨ キラキラ音を再生');

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // 高い音のアルペジオ
    const frequencies = [1046.5, 1318.5, 1568.0]; // ド-ミ-ソ（高音）

    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const startTime = ctx.currentTime + index * 0.05;
      gainNode.gain.setValueAtTime(0.4, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  } catch (error) {
    console.error('❌ Failed to play sparkle:', error);
  }
}

/**
 * 成功音を再生（シンプル版）
 */
export function playSuccess(): void {
  const ctx = getAudioContext();
  if (!ctx) {
    console.warn('Web Audio API is not supported');
    return;
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.value = 880; // A5

  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.5);
}

/**
 * カウントダウン音を再生（タイマーの最後の3秒）
 */
export function playTick(): void {
  console.log('⏰ チクタク音を再生');

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.value = 880; // A5（少し高めの音）

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  } catch (error) {
    console.error('❌ Failed to play tick:', error);
  }
}
