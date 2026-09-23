/**
 * Web Audio API Sound Synthesizer for Break Alarms
 * Provides pure synthesizer tones without external audio file dependencies.
 */

class BreakAlarmAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.volume = 0.8;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  setMuted(muted) {
    this.isMuted = muted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Play Pleasant 3-Tone Break Chime (e.g. Lunch / Evening Tea)
   */
  playChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(0, now + idx * 0.15);
        gain.gain.linearRampToValueAtTime(this.volume * 0.35, now + idx * 0.15 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.65);
      });
    } catch (e) {
      console.warn("Audio alarm playback blocked or unsupported", e);
    }
  }

  /**
   * Play Bell / Gong Alarm (e.g. Dinner Break / Morning Tea)
   */
  playBell() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const harmonics = [440, 880, 1320, 1760]; // A4 harmonics

      harmonics.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, now);

        const amp = (this.volume * 0.3) / (idx + 1);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(amp, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.25);
      });
    } catch (e) {
      console.warn("Audio alarm playback error", e);
    }
  }

  /**
   * Play Digital Soft Pulse Alert (e.g. Night shift)
   */
  playDigital() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      [0, 0.2, 0.4, 0.6].forEach((timeOffset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now + timeOffset);

        gain.gain.setValueAtTime(0, now + timeOffset);
        gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + timeOffset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.15);
      });
    } catch (e) {
      console.warn("Audio alarm playback error", e);
    }
  }

  /**
   * Play Overstay Alert Warning
   */
  playOverstayAlert() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      [0, 0.25, 0.5].forEach((timeOffset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(440, now + timeOffset);

        gain.gain.setValueAtTime(0, now + timeOffset);
        gain.gain.linearRampToValueAtTime(this.volume * 0.2, now + timeOffset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.2);
      });
    } catch (e) {
      console.warn("Audio alert error", e);
    }
  }

  /**
   * Main dispatch by sound type
   */
  playSound(soundType = "chime") {
    switch (soundType) {
      case "bell":
        this.playBell();
        break;
      case "digital":
        this.playDigital();
        break;
      case "overstay":
        this.playOverstayAlert();
        break;
      case "chime":
      default:
        this.playChime();
        break;
    }
  }
}

export const breakAlarmAudio = new BreakAlarmAudioEngine();
