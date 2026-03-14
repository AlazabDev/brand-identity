import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Paperclip, Image, FileText, Loader2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  type: "text" | "image" | "document";
  fileName?: string;
}

const BUSINESS_PHONE = "+201004006620";
const BUSINESS_NAME = "العزب للمقاولات";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      // Show auto-reply since WhatsApp Business has AI
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
      // Fallback to wa.me
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "document" | "image") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowAttachMenu(false);
    setSending(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      text: type === "image" ? "📷 صورة" : `📎 ${file.name}`,
      sender: "user",
      timestamp: new Date(),
      type,
      fileName: file.name,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // Upload to storage first, then send via WhatsApp
      const filePath = `whatsapp/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("chat-files").getPublicUrl(filePath);

      const { error } = await supabase.functions.invoke("whatsapp", {
        body: {
          action: "send_media",
          to: BUSINESS_PHONE,
          mediaUrl: urlData.publicUrl,
          mediaType: type,
          fileName: file.name,
        },
      });

      if (error) throw error;

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        text: "تم إرسال الملف بنجاح ✅",
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
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

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
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
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

            {/* Input */}
            <div className="bg-background border-t border-border px-3 py-2 flex items-center gap-2">
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
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:bg-[#20BD5A] transition-colors disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
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
