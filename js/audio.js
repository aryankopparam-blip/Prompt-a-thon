// ====================================
// 🪔 DIWALI RUNNER — Audio System
// ====================================
class AudioSystem {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.musicGain = null;
        this.sfxGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.15;
            this.musicGain.connect(this.ctx.destination);
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.3;
            this.sfxGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) { console.warn('Audio not available'); }
    }

    playTone(freq, dur, type = 'square', vol = 0.3, dest = null) {
        if (!this.initialized || this.muted) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.setValueAtTime(vol, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
        o.connect(g);
        g.connect(dest || this.sfxGain);
        o.start();
        o.stop(this.ctx.currentTime + dur);
    }

    jump() {
        if (!this.initialized || this.muted) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(250, t);
        o.frequency.exponentialRampToValueAtTime(600, t + 0.1);
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        o.connect(g); g.connect(this.sfxGain);
        o.start(t); o.stop(t + 0.12);
    }

    doubleJump() {
        if (!this.initialized || this.muted) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(400, t);
        o.frequency.exponentialRampToValueAtTime(900, t + 0.12);
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        o.connect(g); g.connect(this.sfxGain);
        o.start(t); o.stop(t + 0.15);
    }

    collect() {
        if (!this.initialized || this.muted) return;
        const t = this.ctx.currentTime;
        this.playTone(523, 0.08, 'square', 0.2);
        setTimeout(() => this.playTone(659, 0.08, 'square', 0.2), 60);
        setTimeout(() => this.playTone(784, 0.12, 'square', 0.15), 120);
    }

    bonusCollect() {
        if (!this.initialized || this.muted) return;
        [523, 659, 784, 1047].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 0.12, 'square', 0.18), i * 70);
        });
    }

    explosion() {
        if (!this.initialized || this.muted) return;
        const t = this.ctx.currentTime;
        const bufSize = this.ctx.sampleRate * 0.4;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(1200, t);
        filt.frequency.exponentialRampToValueAtTime(100, t + 0.3);
        src.connect(filt); filt.connect(g); g.connect(this.sfxGain);
        src.start(t);
    }

    hit() {
        if (!this.initialized || this.muted) return;
        this.playTone(200, 0.15, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(120, 0.2, 'sawtooth', 0.15), 80);
    }

    levelComplete() {
        if (!this.initialized || this.muted) return;
        const notes = [523, 659, 784, 1047, 784, 1047, 1318];
        notes.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 0.18, 'square', 0.15), i * 100);
        });
    }

    startMusic() {
        if (!this.initialized || this.muted || this._musicPlaying) return;
        this._musicPlaying = true;
        this._playMusicLoop();
    }

    _playMusicLoop() {
        if (!this._musicPlaying || !this.initialized) return;
        const melody = [
            392, 0, 440, 0, 523, 0, 440, 0,
            392, 0, 349, 0, 330, 0, 349, 392,
            440, 0, 523, 0, 659, 0, 523, 0,
            440, 0, 392, 0, 349, 330, 294, 0,
        ];
        const beatDur = 0.14;
        const t = this.ctx.currentTime;
        melody.forEach((note, i) => {
            if (note === 0) return;
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.type = 'triangle';
            o.frequency.value = note;
            g.gain.setValueAtTime(0.08, t + i * beatDur);
            g.gain.exponentialRampToValueAtTime(0.001, t + i * beatDur + beatDur * 0.9);
            o.connect(g); g.connect(this.musicGain);
            o.start(t + i * beatDur);
            o.stop(t + i * beatDur + beatDur);
        });
        this._musicTimeout = setTimeout(() => this._playMusicLoop(), melody.length * beatDur * 1000);
    }

    stopMusic() {
        this._musicPlaying = false;
        if (this._musicTimeout) clearTimeout(this._musicTimeout);
    }

    toggle() {
        this.muted = !this.muted;
        if (this.muted) this.stopMusic();
        return this.muted;
    }
}

const audio = new AudioSystem();
