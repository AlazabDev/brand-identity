import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  HardHat,
  LayoutDashboard,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type StatItem = {
  value: string;
  label: string;
};

type FeatureItem = {
  title: string;
  description: string;
  image: string;
  icon: LucideIcon;
};

type ProcessItem = {
  step: string;
  title: string;
  description: string;
  image: string;
  icon: LucideIcon;
  badge?: string;
};

const GALLERY_IMAGES = [
  '/upload/abuauf_10.jpg',
  '/upload/abuauf_11.jpg',
  '/upload/abuauf_12.jpg',
  '/upload/abuauf_13.jpg',
  '/upload/abuauf_14.jpg',
  '/upload/abuauf_15.jpg',
  '/upload/abuauf_16.jpg',
  '/upload/abuauf_17.jpg',
] as const;

const HERO_STATS: StatItem[] = [
  { value: '20+', label: 'سنة خبرة' },
  { value: '100%', label: 'متابعة شفافة' },
  { value: '24/7', label: 'دعم وتشغيل' },
];

const FREE_SERVICES: FeatureItem[] = [
  {
    title: 'معاينة ورفع المقاسات',
    description:
      'نزور الموقع، نرفع المقاسات بدقة، ونحوّل المساحة إلى بيانات تنفيذية واضحة تسبق أي قرار.',
    image: GALLERY_IMAGES[1],
    icon: Ruler,
  },
  {
    title: 'التصميم الأولي',
    description:
      'نقدم تصورًا بصريًا أوليًا يوضّح الاتجاه العام، الخامات، والألوان قبل بدء التنفيذ.',
    image: GALLERY_IMAGES[2],
    icon: Sparkles,
  },
  {
    title: 'عرض سعر تفصيلي',
    description:
      'عرض سعر منظم وواضح يشرح البنود الفعلية بدون ضبابية أو مفاجآت لاحقة.',
    image: GALLERY_IMAGES[3],
    icon: CreditCard,
  },
];

const PROCESS_STEPS: ProcessItem[] = [
  {
    step: '01',
    title: 'التصميم ثلاثي الأبعاد',
    description:
      'نحوّل الفكرة إلى نموذج بصري واضح يساعدك على اتخاذ القرار قبل التنفيذ.',
    image: GALLERY_IMAGES[4],
    icon: LayoutDashboard,
    badge: 'اعتماد كامل قبل التنفيذ',
  },
  {
    step: '02',
    title: 'المتابعة الإلكترونية',
    description:
      'تقارير مصورة، متابعة مراحل، ووضوح يومي في حركة التنفيذ والخامات.',
    image: GALLERY_IMAGES[5],
    icon: Smartphone,
    badge: 'تقارير يومية مصورة',
  },
  {
    step: '03',
    title: 'التنفيذ المتكامل',
    description:
      'تنفيذ وتشطيب وتصنيع وحدات حسب المقاسات الفعلية لضمان دقة النتيجة النهائية.',
    image: GALLERY_IMAGES[6],
    icon: HardHat,
  },
  {
    step: '04',
    title: 'التشغيل والحماية',
    description:
      'تشغيل الموقع بأنظمة الكاشير والمراقبة والحماية ليكون جاهزًا للعمل الفوري.',
    image: GALLERY_IMAGES[7],
    icon: Shield,
    badge: 'جاهز للتشغيل',
  },
];

const TRUST_POINTS = [
  'خبرة ممتدة في التجهيزات التجارية والمعمارية',
  'متابعة تنفيذية واضحة من البداية للتسليم',
  'ضمان على الأعمال وخدمة ما بعد التسليم',
];

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = true,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <Badge
        variant="outline"
        className="mb-4 border-amber-500/30 bg-amber-500/5 text-amber-600"
      >
        {eyebrow}
      </Badge>
      <h2 className="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-8 text-slate-600 md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function StatCard({ value, label }: StatItem) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
      <div className="text-2xl font-bold text-white md:text-3xl">{value}</div>
      <div className="mt-1 text-sm text-white/70">{label}</div>
    </div>
  );
}

function FeatureCard({ item }: { item: FeatureItem }) {
  return (
    <Card className="group h-full overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-56 overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
      </div>

      <CardContent className="p-6">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
          <item.icon className="h-7 w-7" />
        </div>

        <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
        <p className="mt-3 leading-8 text-slate-600">{item.description}</p>
      </CardContent>
    </Card>
  );
}

function ProcessCard({ item }: { item: ProcessItem }) {
  return (
    <Card className="group relative h-full overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-52 overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-sm font-bold text-black shadow-lg">
        {item.step}
      </div>

      <CardContent className="p-6">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <item.icon className="h-6 w-6" />
        </div>

        <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
        <p className="mt-3 leading-8 text-slate-600">{item.description}</p>

        {item.badge ? (
          <Badge className="mt-5 bg-amber-500/10 text-amber-700 hover:bg-amber-500/10">
            {item.badge}
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function WorkProcessPage() {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const currentImage = GALLERY_IMAGES[galleryIndex];

  const nextSlide = () => {
    setGalleryIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
  };

  const prevSlide = () => {
    setGalleryIndex((prev) => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  };

  const goToSlide = (index: number) => {
    setGalleryIndex(index);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900" dir="rtl">
      <Header />

      <main>
        <section className="relative isolate overflow-hidden bg-slate-950">
          <div className="absolute inset-0">
            <img
              src={GALLERY_IMAGES[0]}
              alt="مشهد من أعمال العزب"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,191,35,0.18),transparent_35%)]" />
          </div>

          <div className="relative mx-auto flex min-h-[92vh] max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8">
            <div className="grid w-full items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.7 }}
                className="max-w-3xl"
              >
                <Badge className="mb-6 bg-amber-500/15 text-amber-400 hover:bg-amber-500/15">
                  هوايه · العلامة التجارية لشركة العزب
                </Badge>

                <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
                  تجهيز معماري راقٍ
                  <span className="block text-amber-400">بمنهج تنفيذي واضح</span>
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80 md:text-xl">
                  من المعاينة والتصميم وحتى التشغيل النهائي، نبني لك تجربة احترافية
                  منظمة، بصريًا وتنفيذيًا، مع متابعة حقيقية وليست شكلية.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    className="h-12 rounded-2xl bg-amber-500 px-7 text-base font-semibold text-black hover:bg-amber-600"
                    asChild
                  >
                    <a href="/contact">
                      اطلب معاينة مجانية
                      <ArrowRight className="mr-2 h-5 w-5" />
                    </a>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-2xl border-white/20 bg-white/5 px-7 text-base text-white hover:bg-white hover:text-slate-900"
                    asChild
                  >
                    <a href="tel:+201004006620">اتصل بنا الآن</a>
                  </Button>
                </div>

                <div className="mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
                  {HERO_STATS.map((item) => (
                    <StatCard key={item.label} {...item} />
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.7, delay: shouldReduceMotion ? 0 : 0.1 }}
                className="hidden lg:block"
              >
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-sm">
                  <div className="overflow-hidden rounded-[1.5rem]">
                    <img
                      src={GALLERY_IMAGES[2]}
                      alt="نموذج من أعمال التجهيز التجاري"
                      className="h-[520px] w-full object-cover"
                    />
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/5 p-4">
                      <div className="mb-2 flex items-center gap-2 text-amber-400">
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="font-semibold">إدارة منظمة</span>
                      </div>
                      <p className="text-sm leading-7 text-white/75">
                        تقارير واضحة، تسلسل منطقي، ومراحل تنفيذ قابلة للمتابعة.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/5 p-4">
                      <div className="mb-2 flex items-center gap-2 text-amber-400">
                        <Zap className="h-5 w-5" />
                        <span className="font-semibold">تنفيذ فعلي</span>
                      </div>
                      <p className="text-sm leading-7 text-white/75">
                        النتيجة ليست عرضًا بصريًا فقط، بل تشغيل حقيقي جاهز للعمل.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="البداية الصحيحة"
              title="خدمات تمهيدية مجانية تضع المشروع على أرض واضحة"
              description="هذه المرحلة ليست تجميلًا بصريًا. هذه هي المرحلة التي تمنع التشتت وتضبط القرار من أول خطوة."
            />

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {FREE_SERVICES.map((item) => (
                <FeatureCard key={item.title} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="رحلة العمل"
              title="من الفكرة إلى التسليم بمنهجية ثابتة"
              description="كل مرحلة لها وظيفة واضحة، وكل قرار فيها يخدم جودة التنفيذ والسرعة والانضباط."
            />

            <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
              {PROCESS_STEPS.map((item) => (
                <ProcessCard key={item.step} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="معرض الأعمال"
              title="أعمال حقيقية بصياغة عرض تليق بالمستوى"
              description="واجهة المعرض هنا أصبحت أنظف، أوضح، وأسهل في الاستخدام على الموبايل والديسكتوب."
            />

            <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="block w-full text-right"
                      aria-label="فتح الصورة بالحجم الكامل"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={currentImage}
                            src={currentImage}
                            alt={`صورة مشروع رقم ${galleryIndex + 1}`}
                            className="h-full w-full object-cover"
                            initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.03 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.99 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
                          />
                        </AnimatePresence>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                      </div>
                    </button>
                  </DialogTrigger>

                  <DialogContent className="max-w-6xl border-none bg-black/95 p-0">
                    <img
                      src={currentImage}
                      alt={`صورة مشروع رقم ${galleryIndex + 1}`}
                      className="max-h-[85vh] w-full object-contain"
                    />
                  </DialogContent>
                </Dialog>

                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="الصورة السابقة"
                  className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-900 shadow-lg transition hover:bg-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="الصورة التالية"
                  className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-900 shadow-lg transition hover:bg-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
                  <h3 className="text-2xl font-bold text-slate-900">تفاصيل العرض</h3>
                  <p className="mt-3 leading-8 text-slate-600">
                    تم تنظيم المعرض ليكون أقرب لصفحة إنتاجية فعلية: صورة رئيسية قوية،
                    تحكم مباشر، وصور مصغرة واضحة للاختيار السريع.
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {GALLERY_IMAGES.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => goToSlide(index)}
                      aria-label={`عرض الصورة رقم ${index + 1}`}
                      className={`overflow-hidden rounded-2xl border transition ${
                        galleryIndex === index
                          ? 'border-amber-500 ring-2 ring-amber-500/30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`معاينة رقم ${index + 1}`}
                        className="h-20 w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <SectionHeading
                  eyebrow="من نحن"
                  title="العزب للخدمات المعمارية"
                  description="ليست الفكرة عندنا مجرد تنفيذ بنود، بل بناء تجربة عميل مريحة، واضحة، وراقية من أول اتصال وحتى التشغيل."
                  centered={false}
                />

                <Tabs defaultValue="quality" className="mt-8">
                  <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-white">
                    <TabsTrigger value="quality" className="rounded-2xl">
                      الجودة
                    </TabsTrigger>
                    <TabsTrigger value="tech" className="rounded-2xl">
                      التكنولوجيا
                    </TabsTrigger>
                    <TabsTrigger value="support" className="rounded-2xl">
                      الدعم
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="quality" className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 text-emerald-500" />
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">معيار جودة واضح</h3>
                        <p className="mt-2 leading-8 text-slate-600">
                          خامات مناسبة، تنفيذ مضبوط، ومخرجات نهائية تحترم الشكل والعمر التشغيلي.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tech" className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                      <Zap className="mt-1 h-5 w-5 text-amber-500" />
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">متابعة إلكترونية حقيقية</h3>
                        <p className="mt-2 leading-8 text-slate-600">
                          وضوح في المراحل والتقارير والصور، بدل المتابعة العشوائية أو الانطباعية.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="support" className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                      <Star className="mt-1 h-5 w-5 text-amber-500" />
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">استمرارية بعد التسليم</h3>
                        <p className="mt-2 leading-8 text-slate-600">
                          لأن التسليم ليس نهاية العلاقة، بل بداية تشغيل مستقر ومرتب.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-8 space-y-3">
                  {TRUST_POINTS.map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 text-emerald-500" />
                      <span className="leading-8 text-slate-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
                <img
                  src={GALLERY_IMAGES[2]}
                  alt="فريق العمل"
                  className="h-[520px] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
          <div className="absolute inset-0 opacity-15">
            <img
              src={GALLERY_IMAGES[0]}
              alt="خلفية قسم التواصل"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,191,35,0.18),transparent_35%)]" />

          <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold leading-tight md:text-5xl">
              جاهز نحول فكرتك إلى مشروع منفذ باحتراف؟
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/75">
              تواصل الآن مع فريق العزب، وابدأ بخطوة واضحة بدل الدوران بين الوعود.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="h-12 rounded-2xl bg-amber-500 px-7 text-base font-semibold text-black hover:bg-amber-600"
                asChild
              >
                <a href="/contact">
                  اطلب معاينة مجانية
                  <ArrowRight className="mr-2 h-5 w-5" />
                </a>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-2xl border-white/20 bg-white/5 px-7 text-base text-white hover:bg-white hover:text-slate-900"
                asChild
              >
                <a href="tel:+201004006620">اتصل الآن</a>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/75">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-amber-400" />
                <span>+201004006620</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-400" />
                <span>support@alazab.com</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-400" />
                <span>القاهرة، مصر</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
