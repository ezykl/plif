import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { playPaperTurnSound, resetAudioContextForTesting } from "./audio";

class MockAudioBuffer {
  length: number;
  sampleRate: number;
  channelData: Float32Array;

  constructor(numberOfChannels: number, length: number, sampleRate: number) {
    this.length = length;
    this.sampleRate = sampleRate;
    this.channelData = new Float32Array(length);
  }

  getChannelData() {
    return this.channelData;
  }
}

class MockAudioParam {
  value: number;
  setValueAtTime = vi.fn((val: number) => {
    this.value = val;
  });
  exponentialRampToValueAtTime = vi.fn((val: number) => {
    this.value = val;
  });

  constructor(defaultValue = 1) {
    this.value = defaultValue;
  }
}

class MockAudioNode {
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockAudioBufferSourceNode extends MockAudioNode {
  buffer: MockAudioBuffer | null = null;
  start = vi.fn();
  stop = vi.fn();
}

class MockBiquadFilterNode extends MockAudioNode {
  type: string = "bandpass";
  frequency = new MockAudioParam(350);
  Q = new MockAudioParam(1);
}

class MockGainNode extends MockAudioNode {
  gain = new MockAudioParam(1);
}

class MockAudioContext {
  state: AudioContextState = "running";
  sampleRate = 44100;
  currentTime = 1;
  destination = new MockAudioNode();
  resume = vi.fn().mockResolvedValue(undefined);

  lastSource?: MockAudioBufferSourceNode;
  lastFilter?: MockBiquadFilterNode;
  lastGain?: MockGainNode;

  createBuffer = vi.fn((channels: number, length: number, sampleRate: number) => {
    return new MockAudioBuffer(channels, length, sampleRate);
  });

  createBufferSource = vi.fn(() => {
    const node = new MockAudioBufferSourceNode();
    this.lastSource = node;
    return node;
  });

  createBiquadFilter = vi.fn(() => {
    const node = new MockBiquadFilterNode();
    this.lastFilter = node;
    return node;
  });

  createGain = vi.fn(() => {
    const node = new MockGainNode();
    this.lastGain = node;
    return node;
  });
}

describe("playPaperTurnSound", () => {
  const originalAudioContext = window.AudioContext;
  let mockCtx: MockAudioContext;

  beforeEach(() => {
    resetAudioContextForTesting();
    mockCtx = new MockAudioContext();
    window.AudioContext = vi
      .fn()
      .mockImplementation(() => mockCtx) as unknown as typeof AudioContext;
  });

  afterEach(() => {
    window.AudioContext = originalAudioContext;
    resetAudioContextForTesting();
    vi.restoreAllMocks();
  });

  it("safely handles environments where AudioContext is undefined", () => {
    delete (window as unknown as { AudioContext?: unknown }).AudioContext;
    delete (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext;
    resetAudioContextForTesting();

    expect(() => {
      playPaperTurnSound();
    }).not.toThrow();
  });

  it("constructs an audio graph and synthesizes paper turn sound", () => {
    playPaperTurnSound();

    expect(window.AudioContext).toHaveBeenCalledTimes(1);
    expect(mockCtx.createBuffer).toHaveBeenCalledWith(1, expect.any(Number), 44100);
    expect(mockCtx.createBufferSource).toHaveBeenCalledTimes(1);
    expect(mockCtx.createBiquadFilter).toHaveBeenCalledTimes(1);
    expect(mockCtx.createGain).toHaveBeenCalledTimes(1);

    const source = mockCtx.lastSource!;
    const filter = mockCtx.lastFilter!;
    const gain = mockCtx.lastGain!;

    // Buffer filled with noise samples
    expect(source.buffer).toBeDefined();
    const channelData = source.buffer!.getChannelData();
    expect(channelData.length).toBeGreaterThan(0);
    const hasNonZero = Array.from(channelData).some((val) => val !== 0);
    expect(hasNonZero).toBe(true);

    // Filter configuration: bandpass or lowpass ~1600Hz with ±250Hz jitter
    expect(["bandpass", "lowpass"]).toContain(filter.type);
    expect(filter.frequency.setValueAtTime).toHaveBeenCalled();
    const filterFreqCall = filter.frequency.setValueAtTime.mock.calls[0];
    expect(filterFreqCall).toBeDefined();
    const freq = filterFreqCall![0] as number;
    expect(freq).toBeGreaterThanOrEqual(1350);
    expect(freq).toBeLessThanOrEqual(1850);

    // Audio graph wiring: source -> filter -> gain -> destination
    expect(source.connect).toHaveBeenCalledWith(filter);
    expect(filter.connect).toHaveBeenCalledWith(gain);
    expect(gain.connect).toHaveBeenCalledWith(mockCtx.destination);

    // Gain envelope: 15ms attack, 85ms decay (total 100ms)
    expect(gain.gain.setValueAtTime).toHaveBeenCalledWith(expect.any(Number), mockCtx.currentTime);
    expect(gain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
      expect.any(Number),
      mockCtx.currentTime + 0.015,
    );
    expect(gain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
      expect.any(Number),
      mockCtx.currentTime + 0.1,
    );

    // Playback timing
    expect(source.start).toHaveBeenCalledWith(mockCtx.currentTime);
    expect(source.stop).toHaveBeenCalledWith(mockCtx.currentTime + 0.1);
  });

  it("bypasses playback when disabled: true is passed", () => {
    playPaperTurnSound({ disabled: true });
    expect(mockCtx.createBufferSource).not.toHaveBeenCalled();
    expect(mockCtx.createGain).not.toHaveBeenCalled();
  });

  it("bypasses playback when volume is 0 or negative", () => {
    playPaperTurnSound({ volume: 0 });
    expect(mockCtx.createBufferSource).not.toHaveBeenCalled();

    playPaperTurnSound({ volume: -0.5 });
    expect(mockCtx.createBufferSource).not.toHaveBeenCalled();
  });

  it("resumes context if in suspended state", () => {
    mockCtx.state = "suspended";
    playPaperTurnSound();
    expect(mockCtx.resume).toHaveBeenCalledTimes(1);
  });

  it("gracefully catches errors when AudioContext throws", () => {
    window.AudioContext = vi.fn().mockImplementation(() => {
      throw new Error("AudioContext creation failed");
    }) as unknown as typeof AudioContext;
    resetAudioContextForTesting();

    expect(() => {
      playPaperTurnSound();
    }).not.toThrow();
  });
});
