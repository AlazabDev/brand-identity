import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  FileText,
  Box,
  Sheet,
  Video,
  Layers,
  Download,
  ExternalLink,
  Files,
} from "lucide-react";
import type { ProjectFile, ProjectFileType } from "@/data/architectureProjects";

type Props = {
  files: ProjectFile[];
};

const TYPE_META: Record<
  ProjectFileType,
  { label: string; icon: typeof ImageIcon; color: string }
> = {
  image: { label: "صور", icon: ImageIcon, color: "text-blue-600" },
  pdf: { label: "PDF", icon: FileText, color: "text-red-600" },
  cad: { label: "CAD", icon: Layers, color: "text-amber-600" },
  model3d: { label: "ثلاثي الأبعاد", icon: Box, color: "text-purple-600" },
  xlsx: { label: "جداول", icon: Sheet, color: "text-emerald-600" },
  video: { label: "فيديو", icon: Video, color: "text-pink-600" },
};

const officeViewerUrl = (url: string) =>
  `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

const FilePreview = ({ file }: { file: ProjectFile }) => {
  if (file.type === "image") {
    return (
      <img
        src={file.url}
        alt={file.name}
        loading="lazy"
        className="w-full h-full object-cover"
      />
    );
  }
  if (file.type === "pdf") {
    return (
      <iframe
        title={file.name}
        src={`${file.url}#toolbar=1&view=FitH`}
        className="w-full h-full bg-white"
      />
    );
  }
  if (file.type === "model3d") {
    return (
      <iframe
        title={file.name}
        src={file.url}
        allowFullScreen
        className="w-full h-full bg-black"
      />
    );
  }
  if (file.type === "xlsx") {
    return (
      <iframe
        title={file.name}
        src={officeViewerUrl(file.url)}
        className="w-full h-full bg-white"
      />
    );
  }
  if (file.type === "video") {
    return (
      <video
        src={file.url}
        controls
        className="w-full h-full bg-black object-contain"
      />
    );
  }
  // CAD or unknown — show download / open card
  const meta = TYPE_META[file.type];
  const Icon = meta.icon;
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-muted gap-4 p-6 text-center">
      <Icon className={`w-16 h-16 ${meta.color}`} />
      <div>
        <p className="font-display font-bold text-foreground">{file.name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          ملفات CAD لا تُعرض داخل المتصفح مباشرة. حمّل الملف لفتحه في AutoCAD أو ما يكافئه.
        </p>
      </div>
      <Button asChild>
        <a href={file.url} download target="_blank" rel="noreferrer">
          <Download className="w-4 h-4 ml-1" /> تحميل الملف
        </a>
      </Button>
    </div>
  );
};

export const ProjectFilesViewer = ({ files }: Props) => {
  const grouped = useMemo(() => {
    const map = new Map<ProjectFileType, ProjectFile[]>();
    files.forEach((f) => {
      const arr = map.get(f.type) ?? [];
      arr.push(f);
      map.set(f.type, arr);
    });
    return map;
  }, [files]);

  const orderedTypes = (
    ["model3d", "image", "pdf", "cad", "xlsx", "video"] as ProjectFileType[]
  ).filter((t) => grouped.has(t));

  const defaultTab = orderedTypes[0] ?? "image";
  const [activeFile, setActiveFile] = useState<Record<string, string>>({});

  if (orderedTypes.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          <Files className="w-10 h-10 mx-auto mb-3 opacity-50" />
          لم تُرفع ملفات لهذا المشروع بعد.
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue={defaultTab} className="w-full" dir="rtl">
      <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/60 p-1">
        {orderedTypes.map((t) => {
          const meta = TYPE_META[t];
          const Icon = meta.icon;
          const count = grouped.get(t)?.length ?? 0;
          return (
            <TabsTrigger
              key={t}
              value={t}
              className="data-[state=active]:bg-background data-[state=active]:shadow gap-2"
            >
              <Icon className={`w-4 h-4 ${meta.color}`} />
              <span>{meta.label}</span>
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {count}
              </Badge>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {orderedTypes.map((t) => {
        const list = grouped.get(t) ?? [];
        const selectedId = activeFile[t] ?? list[0]?.id;
        const current = list.find((f) => f.id === selectedId) ?? list[0];
        return (
          <TabsContent key={t} value={t} className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
              <div className="relative w-full aspect-[4/3] md:aspect-[16/10] bg-muted rounded-xl overflow-hidden border border-border">
                {current && <FilePreview file={current} />}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-body">
                  {list.length} ملف
                </p>
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {list.map((f) => {
                    const isActive = current?.id === f.id;
                    const Icon = TYPE_META[f.type].icon;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setActiveFile((s) => ({ ...s, [t]: f.id }))}
                        className={`w-full text-right p-3 rounded-lg border transition-colors flex items-start gap-3 ${
                          isActive
                            ? "border-accent bg-accent/10"
                            : "border-border bg-card hover:bg-muted"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${TYPE_META[f.type].color}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-body text-foreground truncate">
                            {f.name}
                          </p>
                          {f.size && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {f.size}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {current && current.type !== "model3d" && current.url !== "#" && (
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={current.url} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-3.5 h-3.5 ml-1" /> فتح في نافذة جديدة
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};
