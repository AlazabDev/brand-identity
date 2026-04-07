import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Bot, Sparkles, Menu } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChatMessage, SUGGESTED_QUESTIONS } from "./chatbot/types";
import { streamChat } from "./chatbot/chat-service";
import { VoiceRecorder } from "./chatbot/VoiceRecorder";
import { TTSButton } from "./chatbot/TTSButton";
import { FileUpload } from "./chatbot/FileUpload";
import { ChatNavMenu } from "./chatbot/ChatNavMenu";

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string, imageUrl?: string) => {
    const trimmed = text.trim();
    if (!trimmed && !imageUrl) return;
    if (isLoading) return;
    setInput("");
    const userMsg: ChatMessage = {
      role: "user",
      content: imageUrl ? `${trimmed}\n[صورة مرفقة](${imageUrl})` : trimmed,
      imageUrl,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let accumulated = "";
    const allMessages = [...messages, userMsg].map(({ role, content }) => ({ role, content }));

    const upsert = (chunk: string) => {
      accumulated += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: accumulated } : m));
        }
        return [...prev, { role: "assistant", content: accumulated }];
      });
    };

    try {
      await streamChat({
        messages: allMessages,
        onDelta: upsert,
        onDone: () => setIsLoading(false),
        onError: (msg) => {
          setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
          setIsLoading(false);
        },
      });
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "حدث خطأ، يرجى المحاولة لاحقاً." }]);
      setIsLoading(false);
    }
  }, [isLoading, messages]);

  const handleSend = useCallback(() => {
    sendMessage(input);
  }, [input, sendMessage]);

  const handleFileUploaded = useCallback((url: string) => {
    sendMessage(input || "أرسلت لك ملف", url);
  }, [input, sendMessage]);

  const handleVoiceTranscript = useCallback((text: string) => {
    sendMessage(text);
  }, [sendMessage]);

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
            aria-label="Open AI chat"
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-4rem)] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="relative flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground rounded-t-2xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNavOpen(!navOpen)}
                  className="hover:bg-primary-foreground/20 rounded-full p-1 transition-colors"
                  aria-label="Navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <Bot className="w-5 h-5" />
                <div>
                  <p className="text-sm font-bold">مساعد Brand Identity</p>
                  <p className="text-xs opacity-80">مدعوم بالذكاء الاصطناعي</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-primary-foreground/20 rounded-full p-1 transition-colors">
                <X className="w-5 h-5" />
              </button>
              <ChatNavMenu isOpen={navOpen} onClose={() => setNavOpen(false)} onCloseChat={() => setIsOpen(false)} />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" dir="rtl">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8 space-y-3">
                  <Sparkles className="w-10 h-10 mx-auto text-primary opacity-50" />
                  <p className="font-semibold">مرحباً! كيف يمكنني مساعدتك؟</p>
                  <div className="space-y-2">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="block w-full text-right px-3 py-2 rounded-lg bg-muted hover:bg-accent/10 text-sm transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="Attached file"
                        className="rounded-lg max-w-full max-h-40 mb-2"
                        loading="lazy"
                      />
                    )}
                    {msg.role === "assistant" ? (
                      <>
                        <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:m-0 [&_ul]:my-1 [&_li]:my-0">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        <div className="mt-1 flex justify-start">
                          <TTSButton text={msg.content} />
                        </div>
                      </>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-end">
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="relative p-3 border-t border-border">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-1.5"
                dir="rtl"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  disabled={isLoading}
                />
                <FileUpload onFileUploaded={handleFileUploaded} disabled={isLoading} />
                <VoiceRecorder onTranscript={handleVoiceTranscript} disabled={isLoading} />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export { AIChatbot };
