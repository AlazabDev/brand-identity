import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calculator, ArrowLeft, Sparkles } from "lucide-react";

type Finish = "standard" | "premium" | "luxury";

const finishMultiplier: Record<Finish, { label: string; factor: number; desc: string }> = {
  standard: { label: "اقتصادي", factor: 1, desc: "خامات جيدة وتشطيب نظيف" },
  premium: { label: "متميز", factor: 1.55, desc: "خامات مستوردة وإضاءة LED مدمجة" },
  luxury: { label: "فاخر", factor: 2.2, desc: "خامات فاخرة وتفاصيل حسب هوية الماركة" },
};

const BASE_PRICE_PER_M2 = 6500; // EGP

const formatEGP = (n: number) =>
  new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(n);

const CostEstimator = () => {
  const [area, setArea] = useState(60);
  const [finish, setFinish] = useState<Finish>("premium");
  const [includeFacade, setIncludeFacade] = useState(true);
  const [includeStorage, setIncludeStorage] = useState(true);

  const total = useMemo(() => {
    let base = area * BASE_PRICE_PER_M2 * finishMultiplier[finish].factor;
    if (includeFacade) base *= 1.12;
    if (includeStorage) base *= 1.08;
    return Math.round(base / 500) * 500;
  }, [area, finish, includeFacade, includeStorage]);

  const range = { min: Math.round(total * 0.9), max: Math.round(total * 1.15) };

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Decorative blobs */}
      <div aria-hidden className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
      <div aria-hidden className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="container-custom relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-display font-bold mb-4">
            <Sparkles className="w-4 h-4" />
            جديد - تفاعلي
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            احسب تكلفة تجهيز محلك في دقيقة
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            تقدير مبدئي لمساعدتك على التخطيط. لعرض سعر دقيق نرسل مهندس معاينة مجاناً.
          </p>
          <div className="gold-line" />
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6 items-stretch">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 card-elevated p-6 md:p-8 space-y-8"
          >
            {/* Area slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="area" className="font-display font-bold text-foreground">
                  مساحة المحل
                </label>
                <span className="font-display font-bold text-accent text-lg">
                  {area} م²
                </span>
              </div>
              <input
                id="area"
                type="range"
                min={20}
                max={300}
                step={5}
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
                dir="ltr"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>20 م²</span>
                <span>300 م²</span>
              </div>
            </div>

            {/* Finish */}
            <div>
              <p className="font-display font-bold text-foreground mb-3">مستوى التشطيب</p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(finishMultiplier) as Finish[]).map((key) => {
                  const active = finish === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFinish(key)}
                      className={`p-3 rounded-xl border-2 text-right transition-all ${
                        active
                          ? "border-accent bg-accent/10 shadow-sm"
                          : "border-border bg-card hover:border-accent/40"
                      }`}
                    >
                      <div className="font-display font-bold text-sm text-foreground">
                        {finishMultiplier[key].label}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
                        {finishMultiplier[key].desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Extras */}
            <div>
              <p className="font-display font-bold text-foreground mb-3">إضافات</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {[
                  { checked: includeFacade, set: setIncludeFacade, label: "واجهة ولافتة مضيئة" },
                  { checked: includeStorage, set: setIncludeStorage, label: "وحدات تخزين خلفية" },
                ].map((opt) => (
                  <label
                    key={opt.label}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      opt.checked
                        ? "border-accent bg-accent/10"
                        : "border-border bg-card hover:border-accent/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={opt.checked}
                      onChange={(e) => opt.set(e.target.checked)}
                      className="w-4 h-4 accent-accent"
                    />
                    <span className="text-sm text-foreground font-body">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Result */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 rounded-2xl bg-primary text-primary-foreground p-6 md:p-8 flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex items-center gap-2 text-accent mb-4">
                <Calculator className="w-5 h-5" />
                <span className="font-display font-bold text-sm">التقدير المبدئي</span>
              </div>
              <p className="text-primary-foreground/60 text-sm mb-2">تكلفة تقديرية</p>
              <motion.div
                key={total}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="font-display font-bold text-4xl md:text-5xl text-accent leading-none"
                dir="ltr"
              >
                {formatEGP(total)}
                <span className="text-lg text-accent/80 mr-2">جنيه</span>
              </motion.div>
              <p className="text-primary-foreground/70 text-sm mt-3" dir="ltr">
                نطاق: {formatEGP(range.min)} - {formatEGP(range.max)} EGP
              </p>
              <p className="text-primary-foreground/50 text-xs mt-4 leading-relaxed">
                * التقدير مبني على متوسط أسعار السوق ولا يشمل رسوم المول أو التصاريح.
                للحصول على عرض دقيق اطلب معاينة مجانية.
              </p>
            </div>

            <Link
              to="/quote"
              className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-accent text-accent-foreground font-display font-bold hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              اطلب عرض سعر تفصيلي
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export { CostEstimator };
