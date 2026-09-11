import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Download,
  FileText,
  FileImage,
  FileArchive,
  File as FileIcon,
} from "lucide-react";
import { fetchFiles, formatFileSize, formatDate, type StoredFile } from "@/lib/portal";
import { SectionCard, EmptyState, NotConfigured, TabSkeleton } from "@/components/portal/PortalUI";

const CATEGORY_LABELS: Record<string, string> = {
  contracts: "العقود",
  quotations: "عروض الأسعار",
  drawings: "المخططات",
  "site-photos": "صور الموقع",
  "site_photos": "صور الموقع",
  photos: "الصور",
  reports: "التقارير",
  approvals: "الاعتمادات",
  invoices: "الفواتير",
  deliverables: "ملفات التسليم",
  other: "أخرى",
};

function categorize(file: StoredFile, prefix: string): string {
  const rel = file.key.replace(prefix.replace(/^\//, ""), "").replace(/^\//, "");
  const segment = rel.includes("/") ? rel.split("/")[0].toLowerCase() : "other";
  return CATEGORY_LABELS[segment] ?? "أخرى";
}

function iconFor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return FileImage;
  if (["zip", "rar", "7z", "dwg", "rvt"].includes(ext)) return FileArchive;
  if (["pdf", "doc", "docx", "txt"].includes(ext)) return FileText;
  return FileIcon;
}

export default function FilesTab({
  projectId,
  minioPrefix,
}: {
  projectId: string;
  minioPrefix: string | null;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portal-files", projectId],
    queryFn: () => fetchFiles(projectId),
    staleTime: 60_000,
  });

  const grouped = useMemo(() => {
    const map = new Map<string, StoredFile[]>();
    (data?.files ?? []).forEach((file) => {
      const cat = categorize(file, minioPrefix ?? "");
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(file);
    });
    return Array.from(map.entries());
  }, [data?.files, minioPrefix]);

  if (isLoading) return <SectionCard title="ملفات المشروع"><TabSkeleton /></SectionCard>;

  if (isError) {
    return (
      <SectionCard title="ملفات المشروع">
        <EmptyState
          icon={AlertCircle}
          title="تعذّر تحميل الملفات"
          description="خدمة التخزين (MinIO) غير متاحة حاليًا. يظل باقي محتوى المشروع متاحًا."
        />
      </SectionCard>
    );
  }

  if (!data?.configured || data.linked === false) {
    return <SectionCard title="ملفات المشروع"><NotConfigured system="مخزن الملفات" /></SectionCard>;
  }

  if (data.files.length === 0) {
    return (
      <SectionCard title="ملفات المشروع">
        <EmptyState icon={FileIcon} title="لا توجد ملفات مرفوعة بعد" />
      </SectionCard>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([category, files]) => (
        <SectionCard key={category} title={category} description={`${files.length} ملف`}>
          <ul className="divide-y divide-border/60">
            {files.map((file) => {
              const Icon = iconFor(file.name);
              return (
                <li key={file.key} className="flex items-center gap-3 py-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} · {formatDate(file.lastModified)}
                    </p>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-secondary"
                  >
                    <Download className="h-4 w-4" />
                    تنزيل
                  </a>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      ))}
    </div>
  );
}
