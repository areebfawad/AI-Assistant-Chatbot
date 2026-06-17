import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

// Types for Speech Recognition browser API
const SpeechRecognitionAPI =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeech = (onTranscriptChange?: (text: string) => void) => {
  // Speech Recognition (STT) states
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Speech Synthesis (TTS) states
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speakingCharIndex, setSpeakingCharIndex] = useState<number>(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);

  // Load available system voices (filtered to English)
  const loadVoices = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const allVoices = window.speechSynthesis.getVoices();
      const englishVoices = allVoices.filter((v) => v.lang.toLowerCase().startsWith('en'));
      setVoices(englishVoices);

      // Default select the first English voice or System default if available
      if (englishVoices.length > 0 && !selectedVoiceName) {
        const defaultVoice = englishVoices.find((v) => v.default) || englishVoices[0];
        setSelectedVoiceName(defaultVoice.name);
      }
    }
  }, [selectedVoiceName]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, [loadVoices]);

  // Silence timer handler to auto-stop recording after 5 seconds of silence
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    silenceTimerRef.current = setTimeout(() => {
      if (isRecording) {
        stopRecording();
        toast('Stopped recording due to 5s of silence', { icon: '🤫' });
      }
    }, 5000);
  }, [isRecording]);

  // Start Speech-to-Text Recording
  const startRecording = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      toast.error('Voice input (Speech Recognition) is not supported in this browser.');
      return;
    }

    // Cancel active TTS speaking before listening
    stopSpeaking();

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setTranscript('');
        resetSilenceTimer();
      };

      recognition.onresult = (event: any) => {
        resetSilenceTimer();
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => {
            const nextVal = prev + (prev ? ' ' : '') + finalTranscript;
            if (onTranscriptChange) {
              onTranscriptChange(nextVal);
            }
            return nextVal;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error('[SpeechRecognition Error]:', event);
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission denied.');
        } else if (event.error === 'no-speech' || event.error === 'aborted') {
          // Suppress harmless 'no-speech' or 'aborted' background errors to prevent UI spam
        } else {
          toast.error(`Voice input error: ${event.error}`);
        }
        stopRecording();
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('[SpeechRecognition Start Error]:', err);
      toast.error('Failed to start microphone input.');
      setIsRecording(false);
    }
  }, [onTranscriptChange, resetSilenceTimer]);

  // Stop Speech-to-Text Recording
  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    setIsRecording(false);
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
  };

  // Text-to-Speech (AI Voice synthesis read-aloud)
  const speak = useCallback(
    (messageId: string, text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        toast.error('Text-to-speech (Speech Synthesis) is not supported in this browser.');
        return;
      }

      // If already speaking this specific message, toggle stop
      if (speakingMessageId === messageId) {
        stopSpeaking();
        return;
      }

      // Stop any current reading
      window.speechSynthesis.cancel();

      // Clean text from markdown notations to read it aloud clearly
      const cleanText = text
        .replace(/```[\s\S]*?```/g, '[Code block]') // Skip long code code blocks or read helper tag
        .replace(/[*#_`~]/g, '')
        .trim();

      if (!cleanText) {
        toast.error('No readable text in response.');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.9; // Slightly slower reading speed

      // Assign selected system voice
      if (selectedVoiceName) {
        const matchingVoice = voices.find((v) => v.name === selectedVoiceName);
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onstart = () => {
        setSpeakingMessageId(messageId);
        setSpeakingCharIndex(0);
      };

      // Expose char boundary indexes in real time to render word overlays
      utterance.onboundary = (event: any) => {
        if (event.name === 'word') {
          setSpeakingCharIndex(event.charIndex);
        }
      };

      utterance.onend = () => {
        setSpeakingMessageId(null);
        setSpeakingCharIndex(0);
      };

      utterance.onerror = (event: any) => {
        console.error('[SpeechSynthesis Utterance Error]:', event);
        setSpeakingMessageId(null);
        setSpeakingCharIndex(0);
      };

      window.speechSynthesis.speak(utterance);
    },
    [speakingMessageId, voices, selectedVoiceName]
  );

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setSpeakingCharIndex(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    speakingMessageId,
    speakingCharIndex,
    voices,
    selectedVoiceName,
    setSelectedVoiceName,
    speak,
    stopSpeaking
  };
};
