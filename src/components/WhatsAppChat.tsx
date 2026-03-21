import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Paperclip, Image, FileText, Loader2, MessageCircle,
  Mic, Wrench, Search, ArrowRight, Bell, CheckCheck, Phone
} from "lucide-react";
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

type ChatMode = "main" | "maintenance-menu" | "create-request" | "query-request";

interface MaintenanceForm {
  client_name: string;
  client_phone: string;
  service_type: string;
  description: string;
  priority: string;
}

const BUSINESS_PHONE = "+201004006620";
const BUSINESS_NAME = "العزب للمقاولات";

const SERVICE_TYPES = [
  { value: "plumbing", label: "سباكة", icon: "🔧" },
  { value: "electrical", label: "كهرباء", icon: "⚡" },
  { value: "ac", label: "تكييف", icon: "❄️" },
  { value: "painting", label: "دهانات", icon: "🎨" },
  { value: "carpentry", label: "نجارة", icon: "🪚" },
  { value: "general", label: "عامة", icon: "🏗️" },
];

const STATUS_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  new: { label: "جديد", emoji: "🆕", color: "bg-blue-100 text-blue-700" },
  accepted: { label: "مقبول", emoji: "✅", color: "bg-green-100 text-green-700" },
  in_progress: { label: "قيد التنفيذ", emoji: "🔄", color: "bg-amber-100 text-amber-700" },
  completed: { label: "مكتمل", emoji: "🎉", color: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "مرفوض", emoji: "❌", color: "bg-red-100 text-red-700" },
};

const PRIORITY_OPTIONS = [
  { value: "low", label: "منخفضة", color: "bg-slate-100 text-slate-600 border-slate-200" },
  { value: "medium", label: "متوسطة", color: "bg-amber-50 text-amber-600 border-amber-200" },
  { value: "high", label: "عالية", color: "bg-red-50 text-red-600 border-red-200" },
];

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// ── Push Notification Helper ──
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const perm = await Notification.requestPermission();
  return perm === "granted";
};

const showNotification = (title: string, body: string, icon?: string) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: icon || "/placeholder.svg",
      badge: "/placeholder.svg",
      dir: "rtl",
      lang: "ar",
      tag: "maintenance-update",
    });
  }
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
  const [chatMode, setChatMode] = useState<ChatMode>("main");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState<MaintenanceForm>({
    client_name: "",
    client_phone: "",
    service_type: "",
    description: "",
    priority: "medium",
  });
  const [queryInput, setQueryInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  const addBotMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text,
        sender: "bot",
        timestamp: new Date(),
        type: "text",
      },
    ]);
    if (!isOpen) setUnreadCount((c) => c + 1);
  }, [isOpen]);

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text,
        sender: "user",
        timestamp: new Date(),
        type: "text",
      },
    ]);
  };

  const handleToggleNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      toast.success("تم تفعيل الإشعارات بنجاح");
      showNotification("العزب للمقاولات", "سيتم إعلامك بأي تحديثات على طلبات الصيانة ✅");
    } else {
      toast.error("يرجى السماح بالإشعارات من إعدادات المتصفح");
    }
  };

  // ── Maintenance: Create Request ──
  const handleCreateRequest = async () => {
    const { client_name, client_phone, service_type, description, priority } = maintenanceForm;
    if (!client_name || !client_phone || !service_type || !description) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setSending(true);
    const serviceLabel = SERVICE_TYPES.find((s) => s.value === service_type);
    addUserMessage(`📝 طلب صيانة جديد\nالاسم: ${client_name}\nالهاتف: ${client_phone}\nالخدمة: ${serviceLabel?.icon} ${serviceLabel?.label}\nالوصف: ${description}`);

    try {
      const { data, error } = await supabase.functions.invoke("maintenance-proxy", {
        body: { action: "create", client_name, client_phone, service_type, description, priority },
      });

      if (error) throw error;

      const reqNum = data?.data?.request_number || data?.request_number || "—";
      addBotMessage(`تم إنشاء طلب الصيانة بنجاح ✅\n\n📋 رقم الطلب: ${reqNum}\n\nاحتفظ بهذا الرقم لمتابعة حالة طلبك.`);

      if (notificationsEnabled) {
        showNotification("طلب صيانة جديد", `تم إنشاء الطلب رقم ${reqNum} بنجاح`);
      }

      setMaintenanceForm({ client_name: "", client_phone: "", service_type: "", description: "", priority: "medium" });
      setChatMode("main");
    } catch (err) {
      console.error("Create request error:", err);
      addBotMessage("حدث خطأ في إنشاء الطلب ❌\nيرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.");
    } finally {
      setSending(false);
    }
  };

  // ── Maintenance: Query Status ──
  const handleQueryRequest = async () => {
    if (!queryInput.trim()) {
      toast.error("يرجى إدخال رقم الطلب أو رقم الهاتف");
      return;
    }

    setSending(true);
    const isRequestNum = /^MR-/i.test(queryInput.trim());

    addUserMessage(`🔍 استعلام: ${queryInput}`);

    try {
      const body = isRequestNum
        ? { action: "query", request_number: queryInput.trim() }
        : { action: "query", client_phone: queryInput.trim() };

      const { data, error } = await supabase.functions.invoke("maintenance-proxy", { body });

      if (error) throw error;

      const requests = data?.data?.requests || data?.data || data?.requests || [];

      if (Array.isArray(requests) && requests.length > 0) {
        const lines = requests.map((r: any) => {
          const status = STATUS_MAP[r.status] || { label: r.status, emoji: "❓", color: "" };
          return `📋 ${r.request_number}\n${status.emoji} الحالة: ${status.label}\n🔧 الخدمة: ${r.service_type || "—"}\n📅 التاريخ: ${r.created_at ? new Date(r.created_at).toLocaleDateString("ar-EG") : "—"}`;
        });
        addBotMessage(`نتائج البحث (${requests.length}):\n\n${lines.join("\n\n─────────\n\n")}`);

        if (notificationsEnabled) {
          showNotification("نتائج البحث", `تم العثور على ${requests.length} طلب(ات) صيانة`);
        }
      } else if (typeof requests === "object" && requests.request_number) {
        const r = requests;
        const status = STATUS_MAP[r.status] || { label: r.status, emoji: "❓", color: "" };
        addBotMessage(`📋 طلب: ${r.request_number}\n${status.emoji} الحالة: ${status.label}\n🔧 الخدمة: ${r.service_type || "—"}\n📝 الوصف: ${r.description || "—"}\n📅 التاريخ: ${r.created_at ? new Date(r.created_at).toLocaleDateString("ar-EG") : "—"}`);
      } else {
        addBotMessage("لم يتم العثور على طلبات بهذه البيانات 🔍\nتأكد من رقم الطلب أو رقم الهاتف.");
      }

      setQueryInput("");
      setChatMode("main");
    } catch (err) {
      console.error("Query error:", err);
      addBotMessage("حدث خطأ في الاستعلام ❌\nيرجى المحاولة مرة أخرى.");
    } finally {
      setSending(false);
    }
  };

  // ── Send regular message ──
  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    addUserMessage(text);

    try {
      const { error } = await supabase.functions.invoke("whatsapp", {
        body: { action: "send", to: BUSINESS_PHONE, message: text },
      });
      if (error) throw error;
      addBotMessage("تم إرسال رسالتك بنجاح ✅\nسيتم الرد عليك عبر واتساب الأعمال مباشرة.");
    } catch {
      const waText = encodeURIComponent(text);
      window.open(`https://wa.me/201004006620?text=${waText}`, "_blank");
      addBotMessage("تم فتح واتساب لإرسال رسالتك مباشرة 📱");
    } finally {
      setSending(false);
    }
  };

  // ── File upload ──
  const uploadFile = async (file: File | Blob, fileName: string, mediaType: string) => {
    setSending(true);
    const label = mediaType === "image" ? "📷 صورة" : mediaType === "audio" ? "🎤 رسالة صوتية" : `📎 ${fileName}`;
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: label,
        sender: "user",
        timestamp: new Date(),
        type: mediaType as ChatMessage["type"],
        fileName,
        audioDuration: mediaType === "audio" ? recordingTime : undefined,
      },
    ]);

    try {
      const formData = new FormData();
      formData.append("file", file, fileName);
      formData.append("to", BUSINESS_PHONE);
      formData.append("mediaType", mediaType);
      formData.append("fileName", fileName);

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/whatsapp`, {
        method: "POST",
        headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey },
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed [${res.status}]`);
      addBotMessage(mediaType === "audio" ? "تم إرسال الرسالة الصوتية بنجاح ✅" : "تم إرسال الملف بنجاح ✅");
    } catch {
      toast.error("حدث خطأ في إرسال الملف. جاري فتح واتساب...");
      window.open("https://wa.me/201004006620", "_blank");
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

  // ── Recording ──
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
        if (audioBlob.size > 0) await uploadFile(audioBlob, `voice_${Date.now()}.webm`, "audio");
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      recordingIntervalRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } catch {
      toast.error("لا يمكن الوصول إلى الميكروفون. يرجى السماح بالإذن.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop();
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

  const handleOpenChat = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  // ─────────── RENDER ───────────

  const renderMaintenanceForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-3 bg-white/95 backdrop-blur-sm border-t border-gray-100 overflow-y-auto max-h-[320px]"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold font-display text-gray-800 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-xs">📝</span>
          طلب صيانة جديد
        </h4>
        <button onClick={() => setChatMode("main")} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2.5">
        <input
          type="text"
          placeholder="الاسم الكامل *"
          value={maintenanceForm.client_name}
          onChange={(e) => setMaintenanceForm((f) => ({ ...f, client_name: e.target.value }))}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
        />
        <input
          type="tel"
          placeholder="رقم الهاتف * (01xxxxxxxxx)"
          value={maintenanceForm.client_phone}
          onChange={(e) => setMaintenanceForm((f) => ({ ...f, client_phone: e.target.value }))}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          dir="ltr"
        />

        {/* Service Type Grid */}
        <div>
          <p className="text-xs font-body text-gray-500 mb-1.5">نوع الخدمة *</p>
          <div className="grid grid-cols-3 gap-1.5">
            {SERVICE_TYPES.map((s) => (
              <button
                key={s.value}
                onClick={() => setMaintenanceForm((f) => ({ ...f, service_type: s.value }))}
                className={`rounded-lg py-2 px-1 text-xs font-body text-center transition-all border ${
                  maintenanceForm.service_type === s.value
                    ? "bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="block text-base mb-0.5">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Chips */}
        <div>
          <p className="text-xs font-body text-gray-500 mb-1.5">الأولوية</p>
          <div className="flex gap-2">
            {PRIORITY_OPTIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => setMaintenanceForm((f) => ({ ...f, priority: p.value }))}
                className={`flex-1 rounded-lg py-1.5 text-xs font-body text-center transition-all border ${
                  maintenanceForm.priority === p.value
                    ? p.color + " shadow-sm ring-1 ring-current/20"
                    : "bg-gray-50 border-gray-200 text-gray-500"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          placeholder="وصف المشكلة *"
          value={maintenanceForm.description}
          onChange={(e) => setMaintenanceForm((f) => ({ ...f, description: e.target.value }))}
          rows={2}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none"
        />

        <button
          onClick={handleCreateRequest}
          disabled={sending}
          className="w-full py-3 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-600 text-white font-bold text-sm font-display hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          إرسال الطلب
        </button>
      </div>
    </motion.div>
  );

  const renderQueryForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-3 bg-white/95 backdrop-blur-sm border-t border-gray-100"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold font-display text-gray-800 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white text-xs">🔍</span>
          متابعة طلب صيانة
        </h4>
        <button onClick={() => setChatMode("main")} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <input
        type="text"
        placeholder="رقم الطلب (MR-25-XXXXX) أو رقم الهاتف"
        value={queryInput}
        onChange={(e) => setQueryInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleQueryRequest()}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
        dir="ltr"
      />
      <button
        onClick={handleQueryRequest}
        disabled={sending || !queryInput.trim()}
        className="w-full py-3 rounded-xl bg-gradient-to-l from-teal-600 to-teal-700 text-white font-bold text-sm font-display hover:from-teal-700 hover:to-teal-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        بحث عن الطلب
      </button>
    </motion.div>
  );

  const renderMaintenanceMenu = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-3 bg-white/95 backdrop-blur-sm border-t border-gray-100"
    >
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-bold font-display text-gray-800 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white text-xs">🔧</span>
          خدمات الصيانة
        </h4>
        <button onClick={() => setChatMode("main")} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <button
        onClick={() => setChatMode("create-request")}
        className="w-full py-3.5 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-600 text-white font-bold text-sm font-display hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20"
      >
        <Wrench className="w-4 h-4" />
        طلب صيانة جديد
      </button>
      <button
        onClick={() => setChatMode("query-request")}
        className="w-full py-3.5 rounded-xl bg-gradient-to-l from-teal-600 to-teal-700 text-white font-bold text-sm font-display hover:from-teal-700 hover:to-teal-800 transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-teal-600/20"
      >
        <Search className="w-4 h-4" />
        متابعة حالة طلب
      </button>
    </motion.div>
  );

  return (
    <>
      {/* WhatsApp FAB */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpenChat}
        className="fixed bottom-6 left-6 z-50 group"
        aria-label="فتح محادثة واتساب"
      >
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30"
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
          </motion.div>

          {/* Unread Badge */}
          <AnimatePresence>
            {unreadCount > 0 && !isOpen && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md"
              >
                {unreadCount}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Pulse ring */}
          {!isOpen && (
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-emerald-400"
            />
          )}
        </div>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 left-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden shadow-2xl shadow-black/20 flex flex-col bg-white"
            style={{ maxHeight: "min(550px, calc(100vh - 8rem))" }}
          >
            {/* Header */}
            <div className="relative overflow-hidden shrink-0">
              <div className="bg-gradient-to-l from-teal-700 via-teal-600 to-emerald-600 px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-teal-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-display font-bold text-sm truncate">{BUSINESS_NAME}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-emerald-200 text-[11px] font-body">متصل الآن</span>
                      <span className="text-white/40">•</span>
                      <span className="text-white/60 text-[11px] font-body">الرد فوري بالذكاء الاصطناعي</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleToggleNotifications}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        notificationsEnabled
                          ? "bg-white/20 text-emerald-200"
                          : "text-white/50 hover:text-white hover:bg-white/10"
                      }`}
                      title={notificationsEnabled ? "الإشعارات مفعلة" : "تفعيل الإشعارات"}
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                    <a
                      href={`tel:${BUSINESS_PHONE}`}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                      title="اتصال مباشر"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[180px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d5d0c8' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundColor: "#ECE5DD",
              }}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] px-3.5 py-2 text-[13px] font-body leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-emerald-100 text-gray-800 rounded-2xl rounded-br-md"
                        : "bg-white text-gray-800 rounded-2xl rounded-bl-md"
                    }`}
                  >
                    {msg.type === "audio" ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                          <Mic className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex gap-0.5 items-center h-4">
                            {[...Array(20)].map((_, i) => (
                              <div key={i} className="w-0.5 bg-emerald-400 rounded-full" style={{ height: `${Math.random() * 14 + 4}px` }} />
                            ))}
                          </div>
                        </div>
                        {msg.audioDuration && (
                          <span className="text-[10px] text-gray-500 shrink-0">{formatDuration(msg.audioDuration)}</span>
                        )}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] text-gray-400" dir="ltr">
                        {msg.timestamp.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {msg.sender === "user" && <CheckCheck className="w-3 h-3 text-blue-400" />}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Maintenance sections */}
            {chatMode === "maintenance-menu" && renderMaintenanceMenu()}
            {chatMode === "create-request" && renderMaintenanceForm()}
            {chatMode === "query-request" && renderQueryForm()}

            {/* Attach Menu */}
            <AnimatePresence>
              {showAttachMenu && chatMode === "main" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-white border-t border-gray-100 px-4 py-3 flex gap-6 justify-center shrink-0"
                >
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="flex flex-col items-center gap-1.5 text-xs font-body text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl bg-sky-500 flex items-center justify-center shadow-md shadow-sky-500/20">
                      <Image className="w-5 h-5 text-white" />
                    </div>
                    صورة
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-1.5 text-xs font-body text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl bg-violet-500 flex items-center justify-center shadow-md shadow-violet-500/20">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    ملف
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input / Recording */}
            {chatMode === "main" && (
              <div className="bg-white border-t border-gray-100 px-3 py-2.5 flex items-center gap-2 shrink-0">
                {isRecording ? (
                  <>
                    <button onClick={cancelRecording} className="w-9 h-9 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                    <div className="flex-1 flex items-center justify-center gap-2 bg-red-50 rounded-full px-3 py-1.5">
                      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="text-sm font-body text-red-600 font-medium tabular-nums" dir="ltr">
                        {formatDuration(recordingTime)}
                      </span>
                    </div>
                    <button onClick={stopRecording} className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/25">
                      <Send className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowAttachMenu(!showAttachMenu)}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => { setChatMode("maintenance-menu"); setShowAttachMenu(false); }}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      title="خدمات الصيانة"
                    >
                      <Wrench className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="اكتب رسالتك..."
                      className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm font-body text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white transition-all"
                      disabled={sending}
                    />
                    {input.trim() ? (
                      <button
                        onClick={sendMessage}
                        disabled={sending}
                        className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-md shadow-emerald-500/25"
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    ) : (
                      <button
                        onClick={startRecording}
                        disabled={sending}
                        className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-md shadow-emerald-500/25"
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

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
