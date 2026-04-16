import { motion } from "framer-motion";

const malls = [
  "مول مصر",
  "كايرو فيستيفال سيتي",
  "سيتي ستارز",
  "مول العرب",
  "داون تاون مول",
  "ذا جيت مول",
  "الدلتا مول",
  "بوينت 90 مول",
  "أركان مول",
  "أوبن آير مول",
  "المعادي سيتي سنتر",
  "فاميلي مول",
];

const SCROLL_DURATION = 30;

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  const items = [...malls, ...malls];
  return (
    <div className="flex gap-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        className="flex gap-6 shrink-0"
        animate={{ x: reverse ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration: SCROLL_DURATION, repeat: Infinity, ease: "linear" }}
      >
        {items.map((mall, i) => (
          <div
            key={`${mall}-${i}`}
            className="shrink-0 px-8 py-4 rounded-xl bg-card border border-border/50 flex items-center justify-center min-w-[180px]"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <span className="font-display font-bold text-sm text-foreground whitespace-nowrap">
              {mall}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export const ClientLogos = () => {
  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="container-custom mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center"
        >
          <p className="text-muted-foreground font-body text-sm mb-2">نعمل مع أكبر المولات في مصر</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground">
            شراكات في أهم المراكز التجارية
          </h2>
          <div className="gold-line" />
        </motion.div>
      </div>
      <div className="flex flex-col gap-4">
        <MarqueeRow />
        <MarqueeRow reverse />
      </div>
    </section>
  );
};
