import { useRef, useState } from "react";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { type PortalProject } from "@/lib/portal";
import { SectionCard } from "@/components/portal/PortalUI";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "ما آخر تطورات المشروع؟",
  "المشروع وصل لكام في المئة؟",
  "ما المستحقات الحالية؟",
  "ما المطلوب اعتماده مني؟",
];

export default function AssistantTab({ project }: { project: PortalProject }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  };

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || sending) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setSending(true);
    scrollToEnd();

    try {
      const { data, error } = await supabase.functions.invoke("portal-agent", {
        body: {
          projectId: project.id,
          message,
          conversationId,
        },
      });
      if (error) throw error;

      if (data?.conversationId) setConversationId(data.conversationId);
      const reply =
        typeof data?.reply === "string" && data.reply.trim()
          ? data.reply
          : "لم أستلم ردًا واضحًا من وكيل المشروعات. حاول مرة أخرى.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "مساعد المشروع قيد الربط مع وكيل المشروعات في Microsoft Foundry. بمجرد تفعيل الاتصال، ستتمكن من طرح أسئلتك عن مشروعك مباشرةً هنا.",
        },
      ]);
    } finally {
      setSending(false);
      scrollToEnd();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return;
      e.preventDefault();
      send(input);
    }
  };

  return (
    <SectionCard
      title="مساعد المشروع"
      description="اسأل وكيل المشروعات باللغة الطبيعية عن أي تفصيل يخص مشروعك"
    >
      <div className="flex h-[28rem] flex-col overflow-hidden rounded-xl border border-border">
        <div ref={scrollRef} className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-accent-foreground">
                <Sparkles className="h-7 w-7" />
              </div>
              <div>
                <p className="font-display font-bold text-foreground">مساعد المشروع الذكي</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  إجابات مبنية على بيانات مشروعك الحقيقية وضمن صلاحياتك فقط.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-sm text-foreground transition-colors hover:border-accent hover:bg-accent/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent/15 text-accent-foreground"
                }`}
              >
                {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-tr-sm bg-primary text-primary-foreground"
                    : "rounded-tl-sm bg-secondary text-foreground"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-secondary px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="اكتب سؤالك عن المشروع..."
              className="custom-scrollbar max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            <Button
              type="button"
              onClick={() => send(input)}
              disabled={sending || !input.trim()}
              className="h-11 w-11 shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
              aria-label="إرسال"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
