import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  RefreshCw, Activity, Webhook, MessageCircle, Globe, Shield,
  CheckCircle2, XCircle, Clock, ExternalLink, Copy, Eye, ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface WebhookLog {
  id: string;
  endpoint: string;
  platform: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: string;
  created_at: string;
}

interface PlatformConnection {
  platform: string;
  status: string;
  metadata: Record<string, unknown>;
  updated_at: string;
}

interface WhatsAppMessage {
  id: string;
  message_id: string | null;
  from_number: string | null;
  from_name: string | null;
  to_number: string | null;
  message_type: string;
  content: string | null;
  direction: string;
  status: string;
  created_at: string;
}

const ENDPOINTS = [
  {
    name: "Auth Callback",
    url: "https://brand-identity.alazab.com/auth/v1/callback",
    edgeFn: "auth-callback",
    icon: Shield,
    description: "نقطة استقبال تحقق OAuth لجميع المنصات",
  },
  {
    name: "API Handler",
    url: "https://brand-identity.alazab.com/api/v1/",
    edgeFn: "api-handler",
    icon: Globe,
    description: "واجهة API للمشاريع والمقالات والاتصالات",
  },
  {
    name: "WhatsApp Webhook",
    url: "https://brand-identity.alazab.com/api/webhook",
    edgeFn: "whatsapp-webhook",
    icon: MessageCircle,
    description: "استقبال رسائل وتحديثات واتساب",
  },
];

const PLATFORMS = [
  { id: "whatsapp", name: "واتساب", color: "bg-green-500" },
  { id: "facebook", name: "فيسبوك", color: "bg-blue-600" },
  { id: "instagram", name: "انستجرام", color: "bg-pink-500" },
  { id: "google", name: "جوجل", color: "bg-red-500" },
  { id: "tiktok", name: "تيك توك", color: "bg-foreground" },
];

const statusColors: Record<string, string> = {
  success: "text-green-500",
  received: "text-blue-500",
  error: "text-red-500",
  active: "text-green-500",
  inactive: "text-muted-foreground",
};

const WebhookDashboardPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return false;
    }
    const { data } = await supabase.rpc("has_role", {
      _user_id: session.user.id,
      _role: "admin",
    });
    if (!data) {
      navigate("/");
      toast.error("غير مصرح لك بالوصول");
      return false;
    }
    return true;
  }, [navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [logsRes, connRes, msgRes] = await Promise.all([
      supabase
        .from("webhook_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("platform_connections")
        .select("platform, status, metadata, updated_at")
        .order("updated_at", { ascending: false }),
      supabase
        .from("whatsapp_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (logsRes.data) setLogs(logsRes.data as unknown as WebhookLog[]);
    if (connRes.data) setConnections(connRes.data as unknown as PlatformConnection[]);
    if (msgRes.data) setMessages(msgRes.data as unknown as WhatsAppMessage[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth().then((ok) => {
      if (ok) fetchData();
    });
  }, [checkAuth, fetchData]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("ar-EG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    total: logs.length,
    success: logs.filter((l) => l.status === "success").length,
    errors: logs.filter((l) => l.status === "error").length,
    today: logs.filter(
      (l) => new Date(l.created_at).toDateString() === new Date().toDateString()
    ).length,
  };

  return (
    <PageTransition>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16" dir="rtl">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">لوحة الويب هوك</h1>
              <p className="text-muted-foreground mt-1">مراقبة وإدارة نقاط الاتصال والمنصات</p>
            </div>
            <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 ml-2 ${loading ? "animate-spin" : ""}`} />
              تحديث
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "إجمالي الطلبات", value: stats.total, icon: Activity, color: "text-primary" },
              { label: "ناجح", value: stats.success, icon: CheckCircle2, color: "text-green-500" },
              { label: "أخطاء", value: stats.errors, icon: XCircle, color: "text-red-500" },
              { label: "اليوم", value: stats.today, icon: Clock, color: "text-blue-500" },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="endpoints" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="endpoints">نقاط الاتصال</TabsTrigger>
              <TabsTrigger value="logs">السجلات</TabsTrigger>
              <TabsTrigger value="platforms">المنصات</TabsTrigger>
              <TabsTrigger value="whatsapp">واتساب</TabsTrigger>
            </TabsList>

            {/* Endpoints Tab */}
            <TabsContent value="endpoints">
              <div className="grid gap-4">
                {ENDPOINTS.map((ep) => (
                  <Card key={ep.edgeFn}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <ep.icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{ep.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{ep.description}</p>
                            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
                              <code className="text-xs text-foreground flex-1 break-all">{ep.url}</code>
                              <button
                                onClick={() => copyToClipboard(ep.url)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-500 border-green-500">
                          <CheckCircle2 className="w-3 h-3 ml-1" />
                          نشط
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">سجل الأحداث</CardTitle>
                </CardHeader>
                <CardContent>
                  {logs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">لا توجد سجلات بعد</p>
                  ) : (
                    <div className="space-y-2">
                      {logs.map((log) => (
                        <motion.div
                          key={log.id}
                          layout
                          className="border border-border rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() =>
                              setExpandedLog(expandedLog === log.id ? null : log.id)
                            }
                            className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-right"
                          >
                            <div className={`w-2 h-2 rounded-full ${log.status === "success" ? "bg-green-500" : log.status === "error" ? "bg-red-500" : "bg-blue-500"}`} />
                            <span className="text-sm font-medium flex-1">{log.event_type}</span>
                            <Badge variant="secondary" className="text-xs">{log.platform}</Badge>
                            <span className="text-xs text-muted-foreground">{formatDate(log.created_at)}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedLog === log.id ? "rotate-180" : ""}`} />
                          </button>
                          {expandedLog === log.id && (
                            <div className="px-3 pb-3 border-t border-border">
                              <pre className="text-xs bg-muted rounded-lg p-3 overflow-x-auto mt-2 text-left" dir="ltr">
                                {JSON.stringify(log.payload, null, 2)}
                              </pre>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Platforms Tab */}
            <TabsContent value="platforms">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {PLATFORMS.map((platform) => {
                  const conn = connections.find((c) => c.platform === platform.id);
                  return (
                    <Card key={platform.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 ${platform.color} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                            {platform.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold">{platform.name}</h3>
                            <span className={`text-xs ${statusColors[conn?.status || "inactive"]}`}>
                              {conn?.status === "active" ? "متصل" : "غير متصل"}
                            </span>
                          </div>
                        </div>
                        {conn ? (
                          <div className="text-xs text-muted-foreground">
                            آخر تحديث: {formatDate(conn.updated_at)}
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" className="w-full" disabled>
                            <ExternalLink className="w-3.5 h-3.5 ml-2" />
                            ربط المنصة
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* WhatsApp Tab */}
            <TabsContent value="whatsapp">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageCircle className="w-5 h-5 text-green-500" />
                    رسائل واتساب
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {messages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">لا توجد رسائل بعد</p>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.direction === "incoming" ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                              msg.direction === "incoming"
                                ? "bg-muted text-foreground rounded-br-sm"
                                : "bg-green-600 text-white rounded-bl-sm"
                            }`}
                          >
                            {msg.from_name && (
                              <p className="text-xs font-bold mb-1 opacity-80">
                                {msg.from_name} ({msg.from_number})
                              </p>
                            )}
                            <p>{msg.content}</p>
                            <div className="flex items-center justify-between mt-1 gap-2">
                              <Badge variant="secondary" className="text-[10px]">{msg.message_type}</Badge>
                              <span className="text-[10px] opacity-60">{formatDate(msg.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* WhatsApp Webhook Config */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">إعدادات Webhook واتساب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Webhook URL</label>
                    <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 mt-1">
                      <code className="text-xs flex-1 break-all" dir="ltr">
                        {`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-webhook`}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-webhook`
                          )
                        }
                      >
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Verify Token</label>
                    <p className="text-xs text-muted-foreground mt-1">
                      قم بتعيين <code>WHATSAPP_VERIFY_TOKEN</code> في الإعدادات ثم استخدمه في Meta Developer Console
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">الحقول المطلوبة (Subscribed Fields)</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {["messages", "message_deliveries", "message_reads", "messaging_postbacks"].map(
                        (field) => (
                          <Badge key={field} variant="outline">{field}</Badge>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default WebhookDashboardPage;
