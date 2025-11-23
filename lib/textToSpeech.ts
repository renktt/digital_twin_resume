/**
 * Text-to-Speech Utility
 * Handles speech synthesis with queue management
 */

export class TextToSpeech {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private queue: string[] = [];
  private isSpeaking: boolean = false;
  private onStart: (() => void) | null = null;
  private onEnd: (() => void) | null = null;
  private onError: ((error: Error) => void) | null = null;

  // Voice settings
  private rate: number = 0.9;
  private pitch: number = 1.0;
  private volume: number = 1.0;
  private voiceName: string | null = null;

  constructor(options: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voiceName?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: Error) => void;
  } = {}) {
    this.synthesis = window.speechSynthesis;
    this.rate = options.rate || 0.9;
    this.pitch = options.pitch || 1.0;
    this.volume = options.volume || 1.0;
    this.voiceName = options.voiceName || null;
    this.onStart = options.onStart || null;
    this.onEnd = options.onEnd || null;
    this.onError = options.onError || null;
  }

  /**
   * Speak text with configured settings
   */
  speak(text: string): void {
    if (!text || text.trim().length === 0) return;

    // Cancel any ongoing speech
    this.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;

    // Set voice if specified
    if (this.voiceName) {
      const voices = this.synthesis.getVoices();
      const voice = voices.find(v => v.name === this.voiceName);
      if (voice) {
        utterance.voice = voice;
      }
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onStart) this.onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.onEnd) this.onEnd();
      
      // Process queue if there are pending items
      this.processQueue();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.onError) {
        this.onError(new Error(event.error));
      }
      
      // Continue with queue even on error
      this.processQueue();
    };

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
  }

  /**
   * Queue text for speaking (will speak after current utterance finishes)
   */
  enqueue(text: string): void {
    this.queue.push(text);
    if (!this.isSpeaking) {
      this.processQueue();
    }
  }

  /**
   * Process queued speech
   */
  private processQueue(): void {
    if (this.queue.length > 0 && !this.isSpeaking) {
      const nextText = this.queue.shift();
      if (nextText) {
        this.speak(nextText);
      }
    }
  }

  /**
   * Cancel current speech and clear queue
   */
  cancel(): void {
    this.synthesis.cancel();
    this.queue = [];
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (this.isSpeaking) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  /**
   * Check if currently speaking
   */
  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  /**
   * Set voice by name
   */
  setVoice(voiceName: string): void {
    this.voiceName = voiceName;
  }

  /**
   * Update speech settings
   */
  updateSettings(settings: {
    rate?: number;
    pitch?: number;
    volume?: number;
  }): void {
    if (settings.rate !== undefined) this.rate = settings.rate;
    if (settings.pitch !== undefined) this.pitch = settings.pitch;
    if (settings.volume !== undefined) this.volume = settings.volume;
  }
}
