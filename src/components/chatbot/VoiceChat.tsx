import { useState, useCallback, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2, Square, Trash2, Volume2 } from "lucide-react";
import { speechToText, textToSpeech } from "./chat-service";
import { VoiceVisualizer } from "./voice-visualizer";
import { ChatMessage } from "./types";

interface VoiceChatProps {
  onTranscriptMessage: (text: string) => void;
  messages: ChatMessage[];
  isLoading: boolean;
}

export const VoiceChat = ({ onTranscriptMessage, messages, isLoading }: VoiceChatProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const [lastTranscript, setLastTranscript] = useState("");
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-play TTS for the latest assistant message
  const lastAssistantMsg = messages.filter((m) => m.role === "assistant").pop();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const pickMimeType = (): string | undefined => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ];
    if (typeof MediaRecorder === "undefined") return undefined;
    return candidates.find((type) => MediaRecorder.isTypeSupported(type));
  };

  const startRecording = useCallback(async () => {
    setError("");
    setLastTranscript("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("متصفحك لا يدعم تسجيل الصوت. جرّب متصفحاً حديثاً أو استخدم المحادثة النصية.");
      return;
    }
    if (!window.isSecureContext) {
      setError("تسجيل الصوت يتطلب اتصالاً آمناً (HTTPS).");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      setMicStream(stream);

      const mimeType = pickMimeType();
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setMicStream(null);
        if (timerRef.current) clearInterval(timerRef.current);

        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" });
        if (blob.size < 1000) {
          setError("التسجيل قصير جداً، حاول التحدث لثانية على الأقل.");
          setDuration(0);
          return;
        }

        setIsProcessing(true);
        try {
          const text = await speechToText(blob);
          if (text) {
            setLastTranscript(text);
            onTranscriptMessage(text);
          } else {
            setError("لم يتم التعرف على كلام، حاول مرة أخرى.");
          }
        } catch {
          setError("فشل تحويل الصوت لنص، حاول مرة أخرى.");
        } finally {
          setIsProcessing(false);
          setDuration(0);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((prev) => prev + 1), 1000);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setError("تم رفض إذن الميكروفون. فعّل الإذن من إعدادات المتصفح ثم أعد المحاولة.");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setError("لم يتم العثور على ميكروفون متصل بالجهاز.");
      } else if (name === "NotReadableError") {
        setError("الميكروفون مستخدم من تطبيق آخر. أغلقه ثم أعد المحاولة.");
      } else {
        setError("تعذّر الوصول للميكروفون، حاول مرة أخرى.");
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setMicStream(null);
      setIsRecording(false);
    }
  }, [onTranscriptMessage]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setMicStream(null);
      };
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
      chunksRef.current = [];
    }
  }, [isRecording]);

  const playLastResponse = useCallback(async () => {
    if (!lastAssistantMsg || isPlayingTTS) return;
    setIsPlayingTTS(true);
    try {
      const audioUrl = await textToSpeech(lastAssistantMsg.content);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        setIsPlayingTTS(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsPlayingTTS(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      await audio.play();
    } catch {
      setIsPlayingTTS(false);
      setError("تعذّر تشغيل الرد صوتياً، حاول مرة أخرى.");
    }
  }, [lastAssistantMsg, isPlayingTTS]);

  const stopTTS = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingTTS(false);
    }
  }, []);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Text status announced to screen readers
  const statusText = isProcessing
    ? "جاري تحويل الصوت إلى نص"
    : isRecording
      ? `جاري التسجيل، المدة ${formatDuration(duration)}`
      : isLoading
        ? "عزبوت يفكر في الرد"
        : isPlayingTTS
          ? "عزبوت يتحدث الآن"
          : "جاهز للتسجيل، اضغط زر بدء التسجيل أو استخدم مفتاح المسافة";

  // Keyboard shortcut: Space toggles recording, Escape cancels
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.tagName === "BUTTON");
      if (isTyping) return;

      if (e.code === "Space") {
        e.preventDefault();
        if (isRecording) stopRecording();
        else if (!isProcessing && !isLoading) startRecording();
      } else if (e.key === "Escape" && isRecording) {
        e.preventDefault();
        cancelRecording();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isRecording, isProcessing, isLoading, startRecording, stopRecording, cancelRecording]);

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center p-6 space-y-6"
      dir="rtl"
      role="region"
      aria-label="المحادثة الصوتية مع عزبوت"
    >
      {/* Screen reader status */}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {statusText}
      </p>

      {/* Status */}
      <div className="text-center space-y-2">
        {isProcessing ? (
          <>
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <VoiceVisualizer simulated size={128} className="absolute inset-0" />
              <Loader2 className="w-8 h-8 text-primary animate-spin relative" />
            </div>
            <p className="text-sm text-muted-foreground">جاري تحويل الصوت لنص...</p>
          </>
        ) : isRecording ? (
          <>
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <VoiceVisualizer
                stream={micStream}
                size={128}
                color="hsl(var(--destructive))"
                className="absolute inset-0"
              />
              <Mic className="w-8 h-8 text-destructive relative" />
            </div>
            <p className="text-lg font-bold text-foreground font-display">{formatDuration(duration)}</p>
            <p className="text-sm text-muted-foreground">جاري التسجيل... تحدث الآن</p>
          </>
        ) : isLoading ? (
          <>
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <VoiceVisualizer simulated size={128} className="absolute inset-0" />
              <Loader2 className="w-8 h-8 text-primary animate-spin relative" />
            </div>
            <p className="text-sm text-muted-foreground">عزبوت يفكر...</p>
          </>
        ) : (
          <>
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              {isPlayingTTS && <VoiceVisualizer simulated size={128} className="absolute inset-0" />}
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center relative">
                <Mic className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {isPlayingTTS ? "عزبوت يتحدث..." : "اضغط للتحدث مع عزبوت"}
            </p>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="text-xs text-destructive bg-destructive/10 rounded-lg px-4 py-2 text-center max-w-xs"
        >
          {error}
        </div>
      )}

      {/* Last transcript */}
      {lastTranscript && !isRecording && !isProcessing && (
        <div className="w-full bg-muted rounded-xl p-3 text-sm text-foreground text-center">
          <p className="text-[10px] text-muted-foreground mb-1">ما قلته:</p>
          <p>"{lastTranscript}"</p>
        </div>
      )}

      {/* Last assistant response */}
      {lastAssistantMsg && !isRecording && !isProcessing && !isLoading && (
        <div className="w-full bg-primary/5 border border-primary/20 rounded-xl p-3 text-sm text-foreground text-center max-h-32 overflow-y-auto">
          <p className="text-[10px] text-primary mb-1">رد عزبوت:</p>
          <p className="line-clamp-4">{lastAssistantMsg.content}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        {isRecording ? (
          <>
            <button
              onClick={cancelRecording}
              className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="إلغاء التسجيل"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-lg"
              aria-label="إيقاف التسجيل"
            >
              <Square className="w-6 h-6 fill-current" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={startRecording}
              disabled={isProcessing || isLoading}
              className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg"
              aria-label="بدء التسجيل"
            >
              <Mic className="w-7 h-7" />
            </button>
            {lastAssistantMsg && (
              <button
                onClick={isPlayingTTS ? stopTTS : playLastResponse}
                disabled={isLoading || isProcessing}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isPlayingTTS
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                } disabled:opacity-50`}
                aria-label={isPlayingTTS ? "إيقاف الصوت" : "تشغيل الرد صوتياً"}
              >
                {isPlayingTTS ? (
                  <Square className="w-4 h-4 fill-current" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            )}
          </>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        مدعوم بالذكاء الاصطناعي - قد يخطئ أحياناً
      </p>
    </div>
  );
};
