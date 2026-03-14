import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Paperclip, Image, FileText, Loader2, MessageCircle, Mic, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  type: "text" | "image" | "document" | "audio";
  fileName?: string;
  audioDuration?: number;
}

const BUSINESS_PHONE = "+201004006620";
const BUSINESS_NAME = "العزب للمقاولات";

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const WhatsAppChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      text: "مرحباً بك في العزب للمقاولات والتوريدات! 👋\nكيف يمكننا مساعدتك اليوم؟",
      sender: "bot",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const { data, error } = await supabase.functions.invoke("whatsapp", {
        body: { action: "send", to: BUSINESS_PHONE, message: text },
      });

      if (error) throw error;

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        text: "تم إرسال رسالتك بنجاح ✅\nسيتم الرد عليك عبر واتساب الأعمال مباشرة.",
        sender: "bot",
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Send error:", err);
      const waText = encodeURIComponent(text);
      window.open(`https://wa.me/201004006620?text=${waText}`, "_blank");

      const fallbackMsg: ChatMessage = {
        id: crypto.randomUUID(),
        text: "تم فتح واتساب لإرسال رسالتك مباشرة 📱",
        sender: "bot",
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setSending(false);
    }
  };

  const uploadFile = async (file: File | Blob, fileName: string, mediaType: string) => {
    setSending(true);

    const label =
      mediaType === "image" ? "📷 صورة" :
      mediaType === "audio" ? `🎤 رسالة صوتية` :
      `📎 ${fileName}`;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      text: label,
      sender: "user",
      timestamp: new Date(),
      type: mediaType as ChatMessage["type"],
      fileName,
      audioDuration: mediaType === "audio" ? recordingTime : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const formData = new FormData();
      formData.append("file", file, fileName);
      formData.append("to", BUSINESS_PHONE);
      formData.append("mediaType", mediaType);
      formData.append("fileName", fileName);

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/whatsapp`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Upload failed [${res.status}]`);
      }

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        text: mediaType === "audio"
          ? "تم إرسال الرسالة الصوتية بنجاح ✅"
          : "تم إرسال الملف بنجاح ✅\nتم حفظ نسخة في التخزين السحابي.",
        sender: "bot",
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("File upload error:", err);
      toast.error("حدث خطأ في إرسال الملف. جاري فتح واتساب...");
      window.open(`https://wa.me/201004006620`, "_blank");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "document" | "image") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowAttachMenu(false);
    await uploadFile(file, file.name, type);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioBlob.size > 0) {
          const fileName = `voice_${Date.now()}.webm`;
          await uploadFile(audioBlob, fileName, "audio");
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone error:", err);
      toast.error("لا يمكن الوصول إلى الميكروفون. يرجى السماح بالإذن.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = () => {
        mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current.stop();
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  return (
    <>
      {/* WhatsApp FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="فتح محادثة واتساب"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <MessageCircle className="w-7 h-7 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 left-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl overflow-hidden shadow-2xl border border-border"
          >
            {/* Header */}
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-display font-bold text-sm">{BUSINESS_NAME}</h3>
                <p className="text-white/70 text-xs font-body">متصل الآن • الرد فوري بالذكاء الاصطناعي</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div
              className="h-[320px] overflow-y-auto p-4 space-y-3"
              style={{ background: "linear-gradient(135deg, #ECE5DD 0%, #d5cec7 100%)" }}
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm font-body shadow-sm ${
                      msg.sender === "user"
                        ? "bg-[#DCF8C6] text-gray-900 rounded-br-sm"
                        : "bg-white text-gray-900 rounded-bl-sm"
                    }`}
                  >
                    {msg.type === "audio" ? (
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-[#25D366]" />
                        <span>🎤 رسالة صوتية</span>
                        {msg.audioDuration && (
                          <span className="text-xs text-gray-500">{formatDuration(msg.audioDuration)}</span>
                        )}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    )}
                    <span className="text-[10px] text-gray-500 mt-1 block text-left" dir="ltr">
                      {msg.timestamp.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Attach Menu */}
            <AnimatePresence>
              {showAttachMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-background border-t border-border px-4 py-3 flex gap-4 justify-center"
                >
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="flex flex-col items-center gap-1 text-xs font-body text-muted-foreground hover:text-accent transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0795DC] flex items-center justify-center">
                      <Image className="w-5 h-5 text-white" />
                    </div>
                    صورة
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-1 text-xs font-body text-muted-foreground hover:text-accent transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#5157AE] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    ملف
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input / Recording */}
            <div className="bg-background border-t border-border px-3 py-2 flex items-center gap-2">
              {isRecording ? (
                <>
                  {/* Cancel */}
                  <button
                    onClick={cancelRecording}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  {/* Recording indicator */}
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="w-3 h-3 rounded-full bg-red-500"
                    />
                    <span className="text-sm font-body text-foreground font-medium" dir="ltr">
                      {formatDuration(recordingTime)}
                    </span>
                  </div>
                  {/* Stop & send */}
                  <button
                    onClick={stopRecording}
                    className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:bg-[#20BD5A] transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="اكتب رسالتك..."
                    className="flex-1 bg-muted rounded-full px-4 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#25D366]/50"
                    disabled={sending}
                  />
                  {input.trim() ? (
                    <button
                      onClick={sendMessage}
                      disabled={sending}
                      className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:bg-[#20BD5A] transition-colors disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      disabled={sending}
                      className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:bg-[#20BD5A] transition-colors disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Hidden file inputs */}
            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip" onChange={(e) => handleFileUpload(e, "document")} />
            <input ref={imageInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "image")} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WhatsAppChat;
