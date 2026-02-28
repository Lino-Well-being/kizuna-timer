/**
 * 効果音を生成・再生するユーティリティ
 * Web Audio APIを使用
 */

/**
 * ファンファーレ音を再生
 */
export function playFanfare(): void {
  console.log('🎵 ファンファーレを再生します');

  if (typeof window === 'undefined') {
    console.warn('⚠️ Window is undefined');
    return;
  }

  if (!window.AudioContext) {
    console.warn('⚠️ Web Audio API is not supported');
    return;
  }

  try {
    const audioContext = new AudioContext();
    console.log('✅ AudioContext created');

    // ファンファーレのメロディー（ド-ミ-ソ-ド）
    const notes = [
      { frequency: 523.25, duration: 0.2 }, // ド（C5）
      { frequency: 659.25, duration: 0.2 }, // ミ（E5）
      { frequency: 783.99, duration: 0.2 }, // ソ（G5）
      { frequency: 1046.5, duration: 0.4 }, // ド（C6）
    ];

    let startTime = audioContext.currentTime;

    notes.forEach((note, index) => {
      // オシレーター（音を生成）
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

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

  if (typeof window === 'undefined' || !window.AudioContext) return;

  try {
    const audioContext = new AudioContext();

    // 高い音のアルペジオ
    const frequencies = [1046.5, 1318.5, 1568.0]; // ド-ミ-ソ（高音）

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const startTime = audioContext.currentTime + index * 0.05;
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
  if (typeof window === 'undefined' || !window.AudioContext) {
    console.warn('Web Audio API is not supported');
    return;
  }

  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'sine';
  oscillator.frequency.value = 880; // A5

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

/**
 * カウントダウン音を再生（タイマーの最後の3秒）
 */
export function playTick(): void {
  console.log('⏰ チクタク音を再生');

  if (typeof window === 'undefined' || !window.AudioContext) return;

  try {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'square';
    oscillator.frequency.value = 880; // A5（少し高めの音）

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.error('❌ Failed to play tick:', error);
  }
}
