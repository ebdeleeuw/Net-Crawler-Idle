let audioCtx: AudioContext | null = null;

export function playBeep(freq = 440, type: OscillatorType = 'square', duration = 0.1, volume = 0.05) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Ignore audio errors
  }
}

export function playBurstSound() {
  playBeep(880, 'square', 0.05, 0.02);
}

export function playUpgradeSound() {
  playBeep(440, 'sine', 0.1, 0.05);
  setTimeout(() => playBeep(660, 'sine', 0.1, 0.05), 100);
  setTimeout(() => playBeep(880, 'sine', 0.2, 0.05), 200);
}

export function playJobStartSound() {
  playBeep(220, 'sawtooth', 0.2, 0.05);
}

export function playJobCompleteSound() {
  playBeep(880, 'square', 0.1, 0.05);
  setTimeout(() => playBeep(1760, 'square', 0.2, 0.05), 100);
}

export function playTypeSound() {
  playBeep(Math.random() * 200 + 400, 'square', 0.02, 0.01);
}
