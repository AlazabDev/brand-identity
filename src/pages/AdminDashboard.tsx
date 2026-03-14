import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard, FolderOpen, FileText, MessageSquare, FileQuestion,
  LogOut, Plus, Trash2, Eye, EyeOff, Edit, Star, Search, X
} from "lucide-react";
import brandLogo from "@/assets/brand-identity.png";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ projects: 0, posts: 0, contacts: 0, quotes: 0 });
  const [activeTab, setActiveTab] = useState("overview");

  // Projects state
  const [projects, setProjects] = useState<any[]>([]);
  const [projectForm, setProjectForm] = useState({ title: "", category: "", mall: "", area: "", description: "", client_name: "", featured: false, images: "" });
  const [editingProject, setEditingProject] = useState<string | null>(null);

  // Blog state
  const [posts, setPosts] = useState<any[]>([]);
  const [postForm, setPostForm] = useState({ title: "", slug: "", excerpt: "", content: "", cover_image: "", category: "", published: false });
  const [editingPost, setEditingPost] = useState<string | null>(null);

  // Messages state
  const [contacts, setContacts] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/admin/login"); return; }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) { navigate("/admin/login"); return; }
    setLoading(false);
    loadData();
  };

  const loadData = async () => {
    const [p, b, c, q] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("quote_requests").select("*").order("created_at", { ascending: false }),
    ]);
    setProjects(p.data || []);
    setPosts(b.data || []);
    setContacts(c.data || []);
    setQuotes(q.data || []);
    setStats({
      projects: p.data?.length || 0,
      posts: b.data?.length || 0,
      contacts: c.data?.length || 0,
      quotes: q.data?.length || 0,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  // --- Projects CRUD ---
  const saveProject = async () => {
    const payload = {
      ...projectForm,
      images: projectForm.images.split("\n").map(s => s.trim()).filter(Boolean),
    };
    if (editingProject) {
      await supabase.from("projects").update(payload).eq("id", editingProject);
    } else {
      await supabase.from("projects").insert(payload);
    }
    setProjectForm({ title: "", category: "", mall: "", area: "", description: "", client_name: "", featured: false, images: "" });
    setEditingProject(null);
    loadData();
  };

  const editProject = (p: any) => {
    setEditingProject(p.id);
    setProjectForm({
      title: p.title, category: p.category, mall: p.mall || "", area: p.area || "",
      description: p.description || "", client_name: p.client_name || "", featured: p.featured,
      images: (p.images || []).join("\n"),
    });
  };

  const deleteProject = async (id: string) => {
    if (confirm("هل أنت متأكد من الحذف؟")) {
      await supabase.from("projects").delete().eq("id", id);
      loadData();
    }
  };

  // --- Blog CRUD ---
  const savePost = async () => {
    if (editingPost) {
      await supabase.from("blog_posts").update(postForm).eq("id", editingPost);
    } else {
      await supabase.from("blog_posts").insert(postForm);
    }
    setPostForm({ title: "", slug: "", excerpt: "", content: "", cover_image: "", category: "", published: false });
    setEditingPost(null);
    loadData();
  };

  const editPost = (p: any) => {
    setEditingPost(p.id);
    setPostForm({
      title: p.title, slug: p.slug, excerpt: p.excerpt || "", content: p.content || "",
      cover_image: p.cover_image || "", category: p.category || "", published: p.published,
    });
  };

  const deletePost = async (id: string) => {
    if (confirm("هل أنت متأكد من الحذف؟")) {
      await supabase.from("blog_posts").delete().eq("id", id);
      loadData();
    }
  };

  // --- Messages ---
  const markRead = async (table: string, id: string, read: boolean) => {
    await supabase.from(table).update({ read: !read }).eq("id", id);
    loadData();
  };

  const deleteMessage = async (table: string, id: string) => {
    if (confirm("هل أنت متأكد من الحذف؟")) {
      await supabase.from(table).delete().eq("id", id);
      loadData();
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Top Bar */}
      <header className="bg-primary text-primary-foreground px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src={brandLogo} alt="Brand Identity" className="h-8" />
          <h1 className="font-display font-bold text-lg">لوحة الإدارة</h1>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/10">
          <LogOut className="w-4 h-4 ml-2" />
          خروج
        </Button>
      </header>

      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full mb-6 bg-card">
            <TabsTrigger value="overview" className="font-display text-xs md:text-sm"><LayoutDashboard className="w-4 h-4 ml-1" />نظرة عامة</TabsTrigger>
            <TabsTrigger value="projects" className="font-display text-xs md:text-sm"><FolderOpen className="w-4 h-4 ml-1" />المشاريع</TabsTrigger>
            <TabsTrigger value="blog" className="font-display text-xs md:text-sm"><FileText className="w-4 h-4 ml-1" />المدونة</TabsTrigger>
            <TabsTrigger value="contacts" className="font-display text-xs md:text-sm"><MessageSquare className="w-4 h-4 ml-1" />الرسائل</TabsTrigger>
            <TabsTrigger value="quotes" className="font-display text-xs md:text-sm"><FileQuestion className="w-4 h-4 ml-1" />العروض</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "المشاريع", value: stats.projects, icon: FolderOpen, color: "bg-primary" },
                { label: "المقالات", value: stats.posts, icon: FileText, color: "bg-accent" },
                { label: "الرسائل", value: stats.contacts, icon: MessageSquare, color: "bg-green-600" },
                { label: "طلبات العروض", value: stats.quotes, icon: FileQuestion, color: "bg-blue-600" },
              ].map((s) => (
                <Card key={s.label} className="border-none shadow-md">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center`}>
                      <s.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground font-body">{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent unread */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="font-display text-lg">أحدث الرسائل</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {contacts.slice(0, 5).map((c) => (
                    <div key={c.id} className={`p-3 rounded-lg text-sm font-body ${c.read ? "bg-muted/30" : "bg-accent/10 border border-accent/20"}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("ar")}</span>
                      </div>
                      <p className="text-muted-foreground truncate">{c.message || c.phone}</p>
                    </div>
                  ))}
                  {contacts.length === 0 && <p className="text-muted-foreground text-sm font-body">لا توجد رسائل بعد</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="font-display text-lg">أحدث طلبات العروض</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {quotes.slice(0, 5).map((q) => (
                    <div key={q.id} className={`p-3 rounded-lg text-sm font-body ${q.read ? "bg-muted/30" : "bg-accent/10 border border-accent/20"}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{q.client_name}</span>
                        <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString("ar")}</span>
                      </div>
                      <p className="text-muted-foreground truncate">{q.mall} - {q.business_type}</p>
                    </div>
                  ))}
                  {quotes.length === 0 && <p className="text-muted-foreground text-sm font-body">لا توجد طلبات بعد</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects */}
          <TabsContent value="projects">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {editingProject ? "تعديل مشروع" : "إضافة مشروع جديد"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input placeholder="اسم المشروع" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} />
                  <Input placeholder="التصنيف (مثال: محلات، مطاعم)" value={projectForm.category} onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })} />
                  <Input placeholder="اسم العميل" value={projectForm.client_name} onChange={(e) => setProjectForm({ ...projectForm, client_name: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input placeholder="المول" value={projectForm.mall} onChange={(e) => setProjectForm({ ...projectForm, mall: e.target.value })} />
                  <Input placeholder="المساحة" value={projectForm.area} onChange={(e) => setProjectForm({ ...projectForm, area: e.target.value })} />
                </div>
                <textarea
                  placeholder="وصف المشروع"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body min-h-[80px]"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                />
                <textarea
                  placeholder="روابط الصور (رابط في كل سطر)"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body min-h-[100px] font-mono text-xs"
                  value={projectForm.images}
                  onChange={(e) => setProjectForm({ ...projectForm, images: e.target.value })}
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm font-body cursor-pointer">
                    <input type="checkbox" checked={projectForm.featured} onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })} className="rounded" />
                    <Star className="w-4 h-4 text-accent" />
                    مشروع مميز
                  </label>
                  <Button onClick={saveProject} className="bg-accent text-accent-foreground font-display font-bold">
                    {editingProject ? "حفظ التعديلات" : "إضافة المشروع"}
                  </Button>
                  {editingProject && (
                    <Button variant="ghost" onClick={() => { setEditingProject(null); setProjectForm({ title: "", category: "", mall: "", area: "", description: "", client_name: "", featured: false, images: "" }); }}>
                      <X className="w-4 h-4" /> إلغاء
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {projects.map((p) => (
                <Card key={p.id} className="border-none shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] && <img src={p.images[0]} className="w-14 h-14 rounded-lg object-cover" alt="" />}
                      <div>
                        <h4 className="font-display font-bold text-foreground flex items-center gap-1">
                          {p.featured && <Star className="w-4 h-4 text-accent fill-accent" />}
                          {p.title}
                        </h4>
                        <p className="text-xs text-muted-foreground font-body">{p.category} • {p.mall} • {(p.images || []).length} صورة</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => editProject(p)}><Edit className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteProject(p.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {projects.length === 0 && <p className="text-center text-muted-foreground font-body py-8">لا توجد مشاريع بعد</p>}
            </div>
          </TabsContent>

          {/* Blog */}
          <TabsContent value="blog">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {editingPost ? "تعديل مقال" : "إضافة مقال جديد"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input placeholder="عنوان المقال" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} />
                  <Input placeholder="الرابط (slug)" value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input placeholder="التصنيف" value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value })} />
                  <Input placeholder="رابط صورة الغلاف" value={postForm.cover_image} onChange={(e) => setPostForm({ ...postForm, cover_image: e.target.value })} />
                </div>
                <Input placeholder="مقتطف المقال" value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} />
                <textarea
                  placeholder="محتوى المقال"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body min-h-[200px]"
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm font-body cursor-pointer">
                    <input type="checkbox" checked={postForm.published} onChange={(e) => setPostForm({ ...postForm, published: e.target.checked })} className="rounded" />
                    منشور
                  </label>
                  <Button onClick={savePost} className="bg-accent text-accent-foreground font-display font-bold">
                    {editingPost ? "حفظ التعديلات" : "نشر المقال"}
                  </Button>
                  {editingPost && (
                    <Button variant="ghost" onClick={() => { setEditingPost(null); setPostForm({ title: "", slug: "", excerpt: "", content: "", cover_image: "", category: "", published: false }); }}>
                      <X className="w-4 h-4" /> إلغاء
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {posts.map((p) => (
                <Card key={p.id} className="border-none shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-foreground flex items-center gap-2">
                        {p.published ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                        {p.title}
                      </h4>
                      <p className="text-xs text-muted-foreground font-body">{p.category} • {new Date(p.created_at).toLocaleDateString("ar")}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => editPost(p)}><Edit className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deletePost(p.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {posts.length === 0 && <p className="text-center text-muted-foreground font-body py-8">لا توجد مقالات بعد</p>}
            </div>
          </TabsContent>

          {/* Contacts */}
          <TabsContent value="contacts">
            <div className="space-y-2">
              {contacts.map((c) => (
                <Card key={c.id} className={`border-none shadow-sm ${!c.read ? "ring-1 ring-accent/30" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-display font-bold text-foreground">{c.name}</h4>
                        <div className="text-xs text-muted-foreground font-body mt-1 space-y-0.5">
                          {c.email && <p>📧 {c.email}</p>}
                          {c.phone && <p>📱 {c.phone}</p>}
                          {c.business_type && <p>🏪 {c.business_type}</p>}
                          {c.mall && <p>🏬 {c.mall}</p>}
                        </div>
                        {c.message && <p className="text-sm font-body mt-2 text-foreground bg-muted/50 rounded-lg p-3">{c.message}</p>}
                        <p className="text-xs text-muted-foreground mt-2">{new Date(c.created_at).toLocaleString("ar")}</p>
                      </div>
                      <div className="flex gap-1 mr-4">
                        <Button size="icon" variant="ghost" onClick={() => markRead("contact_messages", c.id, c.read)}>
                          {c.read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-accent" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMessage("contact_messages", c.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {contacts.length === 0 && <p className="text-center text-muted-foreground font-body py-8">لا توجد رسائل بعد</p>}
            </div>
          </TabsContent>

          {/* Quotes */}
          <TabsContent value="quotes">
            <div className="space-y-2">
              {quotes.map((q) => (
                <Card key={q.id} className={`border-none shadow-sm ${!q.read ? "ring-1 ring-accent/30" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-display font-bold text-foreground">{q.client_name} {q.shop_name && `- ${q.shop_name}`}</h4>
                        <div className="text-xs text-muted-foreground font-body mt-1 grid grid-cols-2 gap-1">
                          {q.business_type && <p>🏪 النشاط: {q.business_type}</p>}
                          {q.mall && <p>🏬 المول: {q.mall}</p>}
                          {q.shop_number && <p>🔢 رقم المحل: {q.shop_number}</p>}
                          {q.area && <p>📐 المساحة: {q.area}</p>}
                          {q.budget && <p>💰 الميزانية: {q.budget}</p>}
                          {q.opening_date && <p>📅 الافتتاح: {q.opening_date}</p>}
                          {q.phone && <p>📱 {q.phone}</p>}
                          {q.email && <p>📧 {q.email}</p>}
                        </div>
                        {q.services?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {q.services.map((s: string, i: number) => (
                              <span key={i} className="text-xs bg-accent/10 text-accent-foreground px-2 py-0.5 rounded-full font-body">{s}</span>
                            ))}
                          </div>
                        )}
                        {q.notes && <p className="text-sm font-body mt-2 text-foreground bg-muted/50 rounded-lg p-3">{q.notes}</p>}
                        <p className="text-xs text-muted-foreground mt-2">{new Date(q.created_at).toLocaleString("ar")}</p>
                      </div>
                      <div className="flex gap-1 mr-4">
                        <Button size="icon" variant="ghost" onClick={() => markRead("quote_requests", q.id, q.read)}>
                          {q.read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-accent" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMessage("quote_requests", q.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {quotes.length === 0 && <p className="text-center text-muted-foreground font-body py-8">لا توجد طلبات بعد</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
