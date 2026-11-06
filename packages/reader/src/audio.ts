export interface PaperTurnSoundOptions {
  volume?: number;
  disabled?: boolean;
}

let sharedContext: AudioContext | null = null;
let lastAudioContextClass: unknown = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioCtx) {
    sharedContext = null;
    lastAudioContextClass = null;
    return null;
  }

  if (!sharedContext || sharedContext.state === "closed" || lastAudioContextClass !== AudioCtx) {
    try {
      sharedContext = new AudioCtx();
      lastAudioContextClass = AudioCtx;
    } catch {
      return null;
    }
  }

  return sharedContext;
}

export function resetAudioContextForTesting(): void {
  sharedContext = null;
  lastAudioContextClass = null;
}

/**
 * Procedurally synthesizes a gentle, crisp paper page-turn rustle using the Web Audio API.
 * Uses 0 kB audio assets, zero latency, 100% offline.
 */
export function playPaperTurnSound(options?: PaperTurnSoundOptions): void {
  if (options?.disabled) {
    return;
  }

  if (options?.volume !== undefined && options.volume <= 0) {
    return;
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) {
      return;
    }

    if (ctx.state === "suspended") {
      void ctx.resume().catch(() => {});
    }

    const sampleRate = ctx.sampleRate || 44100;
    const duration = 0.1; // ~100ms noise burst
    const frameCount = Math.max(1, Math.floor(sampleRate * duration));
    const buffer = ctx.createBuffer(1, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
      channelData[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Organic realism: bandpass filter ~1600Hz with ±250Hz jitter
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    const jitter = (Math.random() * 2 - 1) * 250;
    filter.frequency.setValueAtTime(1600 + jitter, ctx.currentTime);
    filter.Q.setValueAtTime(1.2, ctx.currentTime);

    // Exponential gain envelope: 15ms attack, 85ms decay (total 100ms)
    const gainNode = ctx.createGain();
    const userVolume = options?.volume ?? 1;
    const peakVolume = Math.max(0.0001, userVolume * 0.35);
    const now = ctx.currentTime;
    const attackDuration = 0.015;
    const totalDuration = 0.1;

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(peakVolume, now + attackDuration);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + totalDuration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(now);
    source.stop(now + totalDuration);
  } catch {
    // Graceful fallback: SSR safe and non-throwing in restrictive browsers
  }
}
