'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Settings, Loader2, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import { AudioRecorder } from '@/lib/audioRecorder';
import { TextToSpeech } from '@/lib/textToSpeech';

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface VoiceChatDigitalTwinProps {
  sessionId?: string;
  onConversationUpdate?: (messages: ConversationMessage[]) => void;
}

export default function VoiceChatDigitalTwin({ 
  sessionId = `session-${Date.now()}`,
  onConversationUpdate 
}: VoiceChatDigitalTwinProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isActive, setIsActive] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [volume, setVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [textInput, setTextInput] = useState('');

  // Settings - Improved defaults for better detection
  const [silenceThreshold, setSilenceThreshold] = useState(20); // Lower = more sensitive (20 works better)
  const [silenceDuration, setSilenceDuration] = useState(1500); // 1.5 second pause for reliability
  const [ttsRate, setTtsRate] = useState(0.9);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const ttsRef = useRef<TextToSpeech | null>(null);
  const isProcessingRef = useRef(false);
  const listeningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasDetectedSpeechRef = useRef(false);
  const maxListeningTime = 15000; // Force stop after 15 seconds of listening

  // Initialize TTS - IMPROVED
  useEffect(() => {
    ttsRef.current = new TextToSpeech({
      rate: ttsRate,
      onStart: () => {
        console.log('🔊 TTS started speaking');
        setVoiceState('speaking');
      },
      onEnd: () => {
        console.log('✅ TTS finished speaking');
        isProcessingRef.current = false; // Reset processing flag
        
        // Only restart listening if still active
        if (isActive) {
          console.log('🔄 Restarting listening after speech...');
          setTimeout(() => {
            setVoiceState('listening');
            startListening();
          }, 500); // Small delay for smooth transition
        } else {
          setVoiceState('idle');
        }
      },
      onError: (error) => {
        console.error('❌ TTS Error:', error);
        toast.error('Speech synthesis error');
        isProcessingRef.current = false;
        setVoiceState('idle');
      },
    });

    return () => {
      ttsRef.current?.cancel();
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
    };
  }, [ttsRate, isActive]);

  // Update TTS settings
  useEffect(() => {
    ttsRef.current?.updateSettings({ rate: ttsRate });
  }, [ttsRate]);

  // Handle silence detection - SIMPLIFIED for reliability
  const handleSilenceDetected = useCallback(async () => {
    console.log('🔇 Silence detected callback triggered');
    
    // Prevent multiple simultaneous processing
    if (isProcessingRef.current) {
      console.log('⚠️ Already processing, ignoring');
      return;
    }
    
    // Get audio before stopping
    const audioBlob = audioRecorderRef.current?.getCurrentAudioBlob();
    console.log('📦 Audio blob size:', audioBlob?.size || 0, 'bytes');
    
    if (!audioBlob || audioBlob.size < 2000) {
      console.log('⚠️ Audio too small, ignoring');
      return;
    }

    console.log('✅ Processing audio now...');
    
    // IMMEDIATELY set processing flag and state
    isProcessingRef.current = true;
    hasDetectedSpeechRef.current = false; // Reset for next listening session
    setVoiceState('processing');
    
    // Clear any listening timeouts
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }

    try {
      // FORCE stop recording to prevent continuous listening
      audioRecorderRef.current?.stopRecording();
      console.log('🛑 Recording stopped');

      // Convert speech to text
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const sttResponse = await fetch('/api/voice/stt', {
        method: 'POST',
        body: formData,
      });

      const sttData = await sttResponse.json();
      
      if (!sttData.success || !sttData.text) {
        throw new Error('Transcription failed');
      }

      const userMessage = sttData.text.trim();
      setCurrentTranscript(userMessage);
      setTextInput(userMessage); // Show transcription in text box

      // Check for stop commands
      if (userMessage.toLowerCase().match(/\b(stop|exit|quit|end|goodbye)\b/)) {
        handleStop();
        return;
      }

      // Add user message to conversation
      const userMsg: ConversationMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      };

      setConversation(prev => {
        const updated = [...prev, userMsg];
        onConversationUpdate?.(updated);
        return updated;
      });

      // Get AI response with RAG
      const llmResponse = await fetch('/api/voice/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          conversationHistory: conversation,
        }),
      });

      const llmData = await llmResponse.json();

      if (!llmData.success || !llmData.response) {
        throw new Error('Failed to generate response');
      }

      const assistantMessage = llmData.response;

      // Add assistant message to conversation
      const assistantMsg: ConversationMessage = {
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date().toISOString(),
      };

      setConversation(prev => {
        const updated = [...prev, assistantMsg];
        onConversationUpdate?.(updated);
        return updated;
      });

      // Speak response if TTS is enabled
      if (ttsEnabled && !isMuted) {
        console.log('🔊 Speaking response...');
        ttsRef.current?.speak(assistantMessage);
        // TTS onEnd callback will restart listening
      } else {
        // If TTS is disabled, restart listening after short delay
        console.log('🔄 Restarting listening (TTS disabled)...');
        setTimeout(() => {
          if (isActive) {
            setVoiceState('listening');
            startListening();
          } else {
            setVoiceState('idle');
          }
          isProcessingRef.current = false;
        }, 500);
      }

      setCurrentTranscript('');
      setTextInput(''); // Clear text input after processing
    } catch (error) {
      console.error('❌ Error processing speech:', error);
      toast.error('Failed to process your message');
      
      // Reset state on error
      setVoiceState('idle');
      isProcessingRef.current = false;
      
      // Try to restart listening if still active
      if (isActive) {
        setTimeout(() => {
          setVoiceState('listening');
          startListening();
        }, 1000);
      }
    }
  }, [voiceState, conversation, sessionId, isActive, ttsEnabled, isMuted, onConversationUpdate]);

  // Start continuous listening - IMPROVED
  const startListening = useCallback(() => {
    // Don't start if already recording or processing
    if (audioRecorderRef.current?.isCurrentlyRecording()) {
      console.log('⚠️ Already recording, skipping startListening');
      return;
    }
    
    if (isProcessingRef.current) {
      console.log('⚠️ Currently processing, skipping startListening');
      return;
    }

    console.log('🎤 Starting new listening session...');

    // Reset speech detection flag
    hasDetectedSpeechRef.current = false;

    // Create new recorder instance with speech detection callback
    audioRecorderRef.current = new AudioRecorder({
      silenceThreshold,
      silenceDuration,
      onSilenceDetected: handleSilenceDetected,
      onVolumeChange: (vol) => {
        setVolume(vol);
        // Track when we detect actual speech (volume above threshold)
        if (vol > silenceThreshold + 5) {
          if (!hasDetectedSpeechRef.current) {
            console.log('🎙️ Speech detected! Volume:', vol.toFixed(1));
            hasDetectedSpeechRef.current = true;
          }
        }
      },
    });

    // Start recording
    audioRecorderRef.current.startRecording().catch(error => {
      console.error('❌ Error starting recording:', error);
      toast.error('Failed to access microphone');
      setVoiceState('idle');
      setIsActive(false);
    });
    
    // Safety timeout: Force stop after max listening time
    listeningTimeoutRef.current = setTimeout(() => {
      console.log('⏱️ Max listening time reached, forcing process...');
      if (voiceState === 'listening' && !isProcessingRef.current) {
        handleSilenceDetected();
      }
    }, maxListeningTime);
  }, [silenceThreshold, silenceDuration, handleSilenceDetected, voiceState]);

  // Start voice chat
  const handleStart = useCallback(() => {
    setIsActive(true);
    setVoiceState('listening');
    toast.success('🎤 Voice chat active - Speak & pause to auto-send');
    startListening();
  }, [startListening]);

  // Stop voice chat - IMPROVED
  const handleStop = useCallback(() => {
    console.log('🛑 Stopping voice chat...');
    
    setIsActive(false);
    setVoiceState('idle');
    isProcessingRef.current = false;
    
    // Clear any timeouts
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }
    
    // Stop all audio
    audioRecorderRef.current?.stopRecording();
    ttsRef.current?.cancel();
    
    toast.success('Voice chat stopped');
  }, []);

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      ttsRef.current?.cancel();
    }
  };

  // Clear conversation
  const clearConversation = () => {
    setConversation([]);
    toast.success('Conversation cleared');
  };

  // Handle text input submission
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!textInput.trim() || isProcessingRef.current) return;

    const userMessage = textInput.trim();
    setTextInput('');
    setCurrentTranscript(userMessage);
    
    // Set processing state
    isProcessingRef.current = true;
    setVoiceState('processing');

    try {
      // Add user message to conversation
      const userMsg: ConversationMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      };

      setConversation(prev => {
        const updated = [...prev, userMsg];
        onConversationUpdate?.(updated);
        return updated;
      });

      // Get AI response with RAG
      const llmResponse = await fetch('/api/voice/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          conversationHistory: conversation,
        }),
      });

      const llmData = await llmResponse.json();

      if (!llmData.success || !llmData.response) {
        throw new Error('Failed to generate response');
      }

      const assistantMessage = llmData.response;

      // Add assistant message to conversation
      const assistantMsg: ConversationMessage = {
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date().toISOString(),
      };

      setConversation(prev => {
        const updated = [...prev, assistantMsg];
        onConversationUpdate?.(updated);
        return updated;
      });

      // Speak response if TTS is enabled
      if (ttsEnabled && !isMuted) {
        ttsRef.current?.speak(assistantMessage);
      } else {
        setVoiceState('idle');
        isProcessingRef.current = false;
      }

      setCurrentTranscript('');
    } catch (error) {
      console.error('❌ Error processing text:', error);
      toast.error('Failed to process your message');
      setVoiceState('idle');
      isProcessingRef.current = false;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-highlight to-secondary dark:from-dark-highlight dark:to-secondary bg-clip-text text-transparent">
          Voice Chat Digital Twin
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Continuous voice conversation with AI-powered RAG system
        </p>
      </div>

      {/* Main Control Panel */}
      <div className="bg-white dark:bg-dark-accent rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-dark-secondary">
        {/* Status Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className={`relative w-32 h-32 rounded-full flex items-center justify-center ${
            voiceState === 'listening' ? 'bg-green-100 dark:bg-green-900/30' :
            voiceState === 'processing' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
            voiceState === 'speaking' ? 'bg-blue-100 dark:bg-blue-900/30' :
            'bg-gray-100 dark:bg-gray-800'
          }`}>
            {/* Pulsing animation when listening */}
            {voiceState === 'listening' && (
              <motion.div
                className="absolute inset-0 rounded-full bg-green-400 dark:bg-green-500"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}

            {/* Icon */}
            <div className="relative z-10">
              {voiceState === 'listening' && (
                <Mic className="w-16 h-16 text-green-600 dark:text-green-400" />
              )}
              {voiceState === 'processing' && (
                <Loader2 className="w-16 h-16 text-yellow-600 dark:text-yellow-400 animate-spin" />
              )}
              {voiceState === 'speaking' && (
                <Volume2 className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-pulse" />
              )}
              {voiceState === 'idle' && (
                <MicOff className="w-16 h-16 text-gray-400 dark:text-gray-600" />
              )}
            </div>
          </div>
        </div>

        {/* State Label */}
        <div className="text-center mb-6">
          <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            {voiceState === 'idle' && 'Ready to Start'}
            {voiceState === 'listening' && (
              <span>
                Listening... {volume > silenceThreshold + 5 && <span className="text-green-500">🎙️ Speaking detected!</span>}
              </span>
            )}
            {voiceState === 'processing' && 'Processing...'}
            {voiceState === 'speaking' && 'Speaking...'}
          </p>
          {currentTranscript && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              "{currentTranscript}"
            </p>
          )}
          {voiceState === 'listening' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {volume > silenceThreshold + 5 
                ? '✅ Speech detected - pause for 1.5s to auto-process' 
                : '⏺️ Speak naturally - auto-processes when you pause'}
            </p>
          )}
        </div>

        {/* Volume Indicator */}
        {voiceState === 'listening' && (
          <div className="mb-6 flex items-center justify-center space-x-2">
            <span className="text-xs text-gray-500">Volume:</span>
            <div className="w-64 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-green-600"
                animate={{ width: `${Math.min(volume, 100)}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <span className="text-xs text-gray-500">{volume.toFixed(0)}</span>
          </div>
        )}

        {/* Text Input Box */}
        <form onSubmit={handleTextSubmit} className="mb-6">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={voiceState === 'listening' ? 'Listening to your voice...' : 'Type your message or use voice...'}
              disabled={isProcessingRef.current || voiceState === 'speaking'}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-secondary text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-highlight dark:focus:ring-dark-highlight disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isProcessingRef.current || voiceState === 'speaking'}
              className="px-6 py-3 bg-gradient-to-r from-highlight to-secondary dark:from-dark-highlight dark:to-secondary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {voiceState === 'listening' ? '🎤 Voice auto-processes after 1.5s pause - transcription appears here' : 'Type to send text or use voice (auto-sends after speaking)'}
          </p>
        </form>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-highlight to-secondary dark:from-dark-highlight dark:to-secondary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg"
            >
              <Power className="w-5 h-5" />
              <span>Start Voice Chat</span>
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex items-center space-x-2 px-8 py-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-lg"
            >
              <Power className="w-5 h-5" />
              <span>Stop</span>
            </button>
          )}

          <button
            onClick={toggleMute}
            className={`p-4 rounded-xl font-semibold transition-colors shadow-lg ${
              isMuted 
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-lg"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-6 bg-gray-50 dark:bg-dark-background rounded-xl space-y-4"
            >
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Silence Threshold: {silenceThreshold}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={silenceThreshold}
                    onChange={(e) => setSilenceThreshold(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Silence Duration: {silenceDuration}ms
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    step="500"
                    value={silenceDuration}
                    onChange={(e) => setSilenceDuration(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Speech Rate: {ttsRate.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={ttsRate}
                    onChange={(e) => setTtsRate(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ttsEnabled"
                    checked={ttsEnabled}
                    onChange={(e) => setTtsEnabled(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="ttsEnabled" className="text-sm text-gray-700 dark:text-gray-300">
                    Enable Text-to-Speech
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Conversation History */}
      {conversation.length > 0 && (
        <div className="bg-white dark:bg-dark-accent rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-dark-secondary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Conversation History
            </h3>
            <button
              onClick={clearConversation}
              className="text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conversation.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-highlight dark:bg-dark-highlight text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-dark-background text-gray-800 dark:text-gray-200 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
