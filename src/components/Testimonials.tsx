import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronRight, ChevronLeft, Quote } from "lucide-react";

const testimonials = [
  {
    name: "أحمد العلي",
    role: "صاحب بوتيك أزياء",
    text: "فريق محترف ودقيق، تعاملوا مع تعقيدات المول بكل سهولة وسلموني المحل قبل الموسم.. أنصح بالتعامل معهم",
    rating: 5,
  },
  {
    name: "سارة الخالدي",
    role: "مديرة مطعم",
    text: "من أفضل الشركات اللي تعاملت معها. الالتزام بالمواعيد والجودة في التنفيذ كانت ممتازة. المحل طلع أحلى من التصميم!",
    rating: 5,
  },
  {
    name: "محمد الراشد",
    role: "مستثمر عقاري",
    text: "جهّزنا معاهم 5 محلات في 3 مولات مختلفة. دائماً يفاجئونك بحلول إبداعية للمساحات الصعبة. شركاء حقيقيين مش مجرد مقاولين",
    rating: 5,
  },
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            ماذا يقول عملاؤنا
          </h2>
          <div className="gold-line" />
        </motion.div>

        <div className="max-w-3xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="card-elevated p-8 md:p-12 text-center"
            >
              <Quote className="w-10 h-10 text-accent/30 mx-auto mb-6" />
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground text-lg md:text-xl font-body leading-relaxed mb-6">
                "{testimonials[current].text}"
              </p>
              <div>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="font-display font-bold text-xl text-primary">
                    {testimonials[current].name.charAt(0)}
                  </span>
                </div>
                <p className="font-display font-bold text-foreground">{testimonials[current].name}</p>
                <p className="text-muted-foreground text-sm font-body">{testimonials[current].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full bg-card flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="w-12 h-12 rounded-full bg-card flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
