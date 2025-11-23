/**
 * Audio Recording Utility with Silence Detection
 * Handles continuous voice recording with automatic pause detection
 */

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private silenceTimeout: NodeJS.Timeout | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private silenceThreshold: number = 20; // Lower = more sensitive (default 20)
  private silenceDuration: number = 1500; // ms of silence before stopping (default 1.5s)
  private onSilenceDetected: (() => void) | null = null;
  private onAudioData: ((blob: Blob) => void) | null = null;
  private onVolumeChange: ((volume: number) => void) | null = null;
  private isRecording: boolean = false;
  private volumeCheckInterval: NodeJS.Timeout | null = null;
  private hasSoundDetected: boolean = false; // Track if we've detected any sound
  private silenceTriggered: boolean = false; // Prevent multiple silence triggers

  constructor(options: {
    silenceThreshold?: number;
    silenceDuration?: number;
    onSilenceDetected?: () => void;
    onAudioData?: (blob: Blob) => void;
    onVolumeChange?: (volume: number) => void;
  } = {}) {
    this.silenceThreshold = options.silenceThreshold || 20;
    this.silenceDuration = options.silenceDuration || 1500;
    this.onSilenceDetected = options.onSilenceDetected || null;
    this.onAudioData = options.onAudioData || null;
    this.onVolumeChange = options.onVolumeChange || null;
    this.hasSoundDetected = false;
    this.silenceTriggered = false;
  }

  /**
   * Start recording audio with silence detection
   */
  async startRecording(): Promise<void> {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      // Setup audio context for volume analysis
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      source.connect(this.analyser);

      // Setup MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      this.audioChunks = [];
      this.isRecording = true;
      this.hasSoundDetected = false;
      this.silenceTriggered = false;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        if (this.onAudioData && audioBlob.size > 0) {
          this.onAudioData(audioBlob);
        }
        this.audioChunks = [];
      };

      this.mediaRecorder.start(100); // Collect data every 100ms

      // Start volume monitoring and silence detection
      this.startVolumeMonitoring();
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to access microphone');
    }
  }

  /**
   * Stop recording
   */
  stopRecording(): void {
    this.isRecording = false;

    if (this.volumeCheckInterval) {
      clearInterval(this.volumeCheckInterval);
      this.volumeCheckInterval = null;
    }

    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
  }

  /**
   * Get current audio volume level
   */
  private getVolume(): number {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    const sum = dataArray.reduce((a, b) => a + b, 0);
    const average = sum / dataArray.length;

    return average;
  }

  /**
   * Start monitoring volume and detecting silence - IMPROVED with better reliability
   */
  private startVolumeMonitoring(): void {
    let consecutiveSilenceChecks = 0;
    let maxVolumeDetected = 0;
    const checkInterval = 100; // Check every 100ms
    const silenceChecksNeeded = Math.ceil(this.silenceDuration / checkInterval);
    const soundThreshold = this.silenceThreshold + 5; // Threshold for clear sound detection (25 total)

    console.log(`🎧 Volume monitoring started - Silence threshold: ${this.silenceThreshold}, Duration: ${this.silenceDuration}ms`);

    this.volumeCheckInterval = setInterval(() => {
      if (!this.isRecording) return;

      const volume = this.getVolume();
      
      // Track maximum volume for debugging
      if (volume > maxVolumeDetected) {
        maxVolumeDetected = volume;
      }
      
      // Notify volume change
      if (this.onVolumeChange) {
        this.onVolumeChange(volume);
      }

      // Track if we've detected any sound (prevents triggering on initial silence)
      if (volume >= soundThreshold) {
        if (!this.hasSoundDetected) {
          console.log(`🎙️ Sound detected! Volume: ${volume.toFixed(1)} (threshold: ${soundThreshold})`);
          this.hasSoundDetected = true;
        }
        consecutiveSilenceChecks = 0; // Reset silence counter when sound detected
      }

      // Only start checking for silence AFTER we've detected sound
      if (!this.hasSoundDetected) {
        return; // Don't trigger silence detection before any sound
      }

      // Check for silence AFTER sound was detected
      if (volume < this.silenceThreshold) {
        consecutiveSilenceChecks++;
        
        // Log progress every 5 checks
        if (consecutiveSilenceChecks % 5 === 0) {
          console.log(`⏳ Silence progress: ${consecutiveSilenceChecks}/${silenceChecksNeeded} checks, current volume: ${volume.toFixed(1)}`);
        }
        
        // Silence detected for long enough AND we haven't triggered yet
        if (consecutiveSilenceChecks >= silenceChecksNeeded && !this.silenceTriggered) {
          console.log(`🔇 Silence confirmed! Checks: ${consecutiveSilenceChecks}/${silenceChecksNeeded}, Max volume was: ${maxVolumeDetected.toFixed(1)}, Audio chunks: ${this.audioChunks.length}`);
          
          if (this.onSilenceDetected && this.audioChunks.length > 0) {
            this.silenceTriggered = true; // Prevent multiple triggers
            this.onSilenceDetected();
          } else if (this.audioChunks.length === 0) {
            console.log('⚠️ No audio chunks collected yet');
          }
          consecutiveSilenceChecks = 0;
        }
      } else {
        // Volume above threshold, reset counter
        if (consecutiveSilenceChecks > 0) {
          console.log(`🔊 Sound resumed after ${consecutiveSilenceChecks} silence checks, volume: ${volume.toFixed(1)}`);
          consecutiveSilenceChecks = 0;
        }
      }
    }, checkInterval);
  }

  /**
   * Check if currently recording
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get current audio blob without stopping
   */
  getCurrentAudioBlob(): Blob | null {
    if (this.audioChunks.length === 0) return null;
    return new Blob(this.audioChunks, { type: 'audio/webm' });
  }
}
