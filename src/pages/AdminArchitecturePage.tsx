import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Plus, Edit, Trash2, ArrowLeft, RotateCcw, Search, ExternalLink, MapPin, Ruler,
} from "lucide-react";
import {
  getAllProjects, upsertProject, deleteProject as removeProject,
  resetToSeed, slugify,
} from "@/lib/architectureStore";
import type { ArchitectureProject } from "@/data/architectureProjects";

const emptyProject = (): ArchitectureProject => ({
  id: "",
  title: "",
  titleEn: "",
  client: "",
  district: "",
  city: "القاهرة",
  fullAddress: "",
  areaM2: 0,
  year: new Date().getFullYear(),
  type: "",
  summary: "",
  description: "",
  materials: [],
  capacity: "",
  nearby: [],
  coverImage: "",
  gallery: [],
  modelEmbedUrl: "",
});

const splitLines = (s: string) =>
  s.split("\n").map((l) => l.trim()).filter(Boolean);

export const AdminArchitecturePage = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [projects, setProjects] = useState<ArchitectureProject[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ArchitectureProject>(emptyProject());
  const [isNew, setIsNew] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [materialsText, setMaterialsText] = useState("");
  const [nearbyText, setNearbyText] = useState("");
  const [galleryText, setGalleryText] = useState("");

  useEffect(() => {
    const verify = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }
      const { data: roles } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", session.user.id).eq("role", "admin");
      if (!roles || roles.length === 0) { navigate("/admin/login"); return; }
      setAuthChecked(true);
      setProjects(getAllProjects());
    };
    verify();
  }, [navigate]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      [p.title, p.titleEn, p.client, p.district, p.city, p.type]
        .join(" ").toLowerCase().includes(q),
    );
  }, [projects, search]);

  const openNew = () => {
    setEditing(emptyProject());
    setMaterialsText("");
    setNearbyText("");
    setGalleryText("");
    setIsNew(true);
    setDialogOpen(true);
  };

  const openEdit = (p: ArchitectureProject) => {
    setEditing({ ...p });
    setMaterialsText(p.materials.join("\n"));
    setNearbyText(p.nearby.join("\n"));
    setGalleryText(p.gallery.map((g) => `${g.src} | ${g.caption}`).join("\n"));
    setIsNew(false);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editing.title.trim()) {
      toast.error("عنوان المشروع مطلوب");
      return;
    }
    const id = editing.id || slugify(editing.titleEn || editing.title);
    const gallery = splitLines(galleryText).map((line) => {
      const [src, caption = ""] = line.split("|").map((s) => s.trim());
      return { src, caption };
    }).filter((g) => g.src);

    const final: ArchitectureProject = {
      ...editing,
      id,
      areaM2: Number(editing.areaM2) || 0,
      year: Number(editing.year) || new Date().getFullYear(),
      materials: splitLines(materialsText),
      nearby: splitLines(nearbyText),
      gallery,
    };

    setProjects(upsertProject(final));
    setDialogOpen(false);
    toast.success(isNew ? "تمت إضافة المشروع" : "تم تحديث المشروع");
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setProjects(removeProject(deleteId));
    setDeleteId(null);
    toast.success("تم حذف المشروع");
  };

  const handleReset = () => {
    setProjects(resetToSeed());
    toast.success("تم استعادة المشاريع الافتراضية");
  };

  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحقق...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container-custom flex items-center justify-between gap-4 py-4 px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-4 h-4 ml-2" /> لوحة التحكم
            </Button>
            <div>
              <h1 className="text-lg md:text-xl font-display font-bold text-primary">
                إدارة المشاريع المعمارية
              </h1>
              <p className="text-xs text-muted-foreground">
                {projects.length} مشروع • محفوظة محلياً في المتصفح
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 ml-1" /> استعادة
            </Button>
            <Button size="sm" onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 ml-1" /> مشروع جديد
            </Button>
          </div>
        </div>
      </header>

      <main className="container-custom py-8 px-4 lg:px-8">
        <div className="relative mb-6 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث بالاسم أو العميل أو الحي..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="overflow-hidden flex flex-col">
              {p.coverImage && (
                <div className="aspect-video bg-muted overflow-hidden">
                  <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-display">{p.title}</CardTitle>
                  <Badge variant="secondary" className="shrink-0">{p.year}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{p.client}</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3 pt-0">
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{p.district}, {p.city}</span>
                  <span className="inline-flex items-center gap-1"><Ruler className="w-3 h-3" />{p.areaM2} م²</span>
                </div>
                <p className="text-sm line-clamp-2">{p.summary}</p>
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)} className="flex-1">
                    <Edit className="w-3 h-3 ml-1" /> تعديل
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/architecture/${p.id}`} target="_blank">
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDeleteId(p.id)}
                    className="text-destructive hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              لا توجد مشاريع مطابقة.
            </div>
          )}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {isNew ? "مشروع معماري جديد" : "تعديل المشروع"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <Label>العنوان (عربي) *</Label>
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>العنوان (إنجليزي)</Label>
              <Input value={editing.titleEn} onChange={(e) => setEditing({ ...editing, titleEn: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>اسم العميل</Label>
              <Input value={editing.client} onChange={(e) => setEditing({ ...editing, client: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>نوع المشروع</Label>
              <Input value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>الحي / المنطقة</Label>
              <Input value={editing.district} onChange={(e) => setEditing({ ...editing, district: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>المدينة</Label>
              <select
                value={editing.city}
                onChange={(e) => setEditing({ ...editing, city: e.target.value as "القاهرة" | "الجيزة" })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="القاهرة">القاهرة</option>
                <option value="الجيزة">الجيزة</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>العنوان الكامل</Label>
              <Input value={editing.fullAddress} onChange={(e) => setEditing({ ...editing, fullAddress: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>المساحة (م²)</Label>
              <Input type="number" value={editing.areaM2}
                onChange={(e) => setEditing({ ...editing, areaM2: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label>سنة الإنجاز</Label>
              <Input type="number" value={editing.year}
                onChange={(e) => setEditing({ ...editing, year: Number(e.target.value) })} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>الطاقة الاستيعابية / الإنتاجية</Label>
              <Input value={editing.capacity}
                onChange={(e) => setEditing({ ...editing, capacity: e.target.value })} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>صورة الغلاف (URL)</Label>
              <Input value={editing.coverImage}
                onChange={(e) => setEditing({ ...editing, coverImage: e.target.value })} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>رابط النموذج ثلاثي الأبعاد (iframe URL)</Label>
              <Input value={editing.modelEmbedUrl}
                onChange={(e) => setEditing({ ...editing, modelEmbedUrl: e.target.value })} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>الملخص القصير</Label>
              <Textarea rows={2} value={editing.summary}
                onChange={(e) => setEditing({ ...editing, summary: e.target.value })} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>الوصف المعماري التفصيلي</Label>
              <Textarea rows={5} value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>مواد البناء (سطر لكل مادة)</Label>
              <Textarea rows={3} value={materialsText} onChange={(e) => setMaterialsText(e.target.value)} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>المحاور القريبة (سطر لكل محور)</Label>
              <Textarea rows={3} value={nearbyText} onChange={(e) => setNearbyText(e.target.value)} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>الألبوم (سطر لكل صورة بصيغة: URL | التعليق)</Label>
              <Textarea rows={4} value={galleryText} onChange={(e) => setGalleryText(e.target.value)}
                placeholder="https://...jpg | الواجهة الرئيسية" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isNew ? "إضافة المشروع" : "حفظ التعديلات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المشروع نهائياً من سجلك المحلي. لا يمكن التراجع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminArchitecturePage;
