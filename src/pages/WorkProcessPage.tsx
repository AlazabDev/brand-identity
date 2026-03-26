import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import {
  ArrowRight, Camera, CheckCircle, ClipboardCheck, CreditCard, HardHat,
  LayoutDashboard, PaintRoller, Ruler, Shield, Smartphone, Sparkles, Video, Zap,
  ChevronLeft, ChevronRight, Star, Phone, Mail, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Image imports (using public folder path)
const images = [
  '/upload/abuauf_10.jpg',
  '/upload/abuauf_11.jpg',
  '/upload/abuauf_12.jpg',
  '/upload/abuauf_13.jpg',
  '/upload/abuauf_14.jpg',
  '/upload/abuauf_15.jpg',
  '/upload/abuauf_16.jpg',
  '/upload/abuauf_17.jpg',
];

export default function WorkProcessPage() {
  const [activeImage, setActiveImage] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const nextImage = () => setActiveImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + images.length) % images.length);
  const nextGallery = () => setGalleryIndex((prev) => (prev + 1) % images.length);
  const prevGallery = () => setGalleryIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden" dir="rtl">
      <Header />
      <main className="flex-grow">
        {/* Hero Section with Background Image */}
        <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={images[0]}
              alt="Hero background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
          </div>
          <div className="relative z-10 container mx-auto px-4 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="secondary" className="mb-4 bg-amber-500/20 text-amber-500 border-amber-500/300 backdrop-blur-sm">
                هوايه · العلامة التجارية لشركة العزب
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                حيث تتحول فكرة محلك <br />
                إلى واقع احترافي بتقنية متكاملة
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                من أول معاينة الخامات حتى لحظة تشغيل كاميرات المراقبة وكاشير البيع، نرافقك في رحلة شفافة وممنهجة.
                خبراء العزب للخدمات المعمارية يصممون وينفذون حلمك بإدارة إلكترونية متطورة.
              </p>
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 shadow-lg">
                احصل على استشارة مجانية ومعاينة أولية
                <ArrowRight className="mr-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-2 bg-white rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </section>

        {/* Free Services Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.div variants={fadeInUp}>
                <Badge variant="outline" className="mb-2">نبدأ معاً بدون أي التزامات مالية</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800">خدماتنا التمهيدية المجانية</h2>
                <p className="text-gray-600 mt-2">كل ما تحتاجه لتبدأ مشوارك بثقة</p>
              </motion.div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Ruler,
                  title: "معاينة ورفع المقاسات",
                  desc: "نزور موقعك بدقة متناهية، نرفع القياسات باستخدام أدوات احترافية وندرجها في النظام.",
                  img: images[1]
                },
                {
                  icon: Sparkles,
                  title: "التصميم الأولي (Mood Board)",
                  desc: "نقدم لك تصوراً مبدئياً يعكس هوية محلك، ونحدد الخامات والألوان المقترحة.",
                  img: images[2]
                },
                {
                  icon: CreditCard,
                  title: "عرض السعر الشامل",
                  desc: "نرسل لك عرض سعر تفصيلي (BOQ) واضح، يوضح كل بند من بنود العمل دون أي رسوم إضافية.",
                  img: images[3]
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden">
                    <div className="h-48 overflow-hidden">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <CardHeader className="text-center pt-6">
                      <div className="mx-auto bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors duration-300">
                        <item.icon className="h-8 w-8 text-amber-600 group-hover:text-white" />
                      </div>
                      <CardTitle className="text-xl text-slate-800">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center text-gray-600">{item.desc}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Journey Timeline */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge variant="outline" className="mb-2">رحلة العمل</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800">من الفكرة إلى التسليم .. رحلة عمل بشفافية 100%</h2>
            </motion.div>

            <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  step: "1",
                  icon: LayoutDashboard,
                  title: "التصميم ثلاثي الأبعاد",
                  desc: "نبدأ في تصميم نموذج 3D دقيق للمساحة. جلسات افتراضية للتعديل والإضافة حتى ترى التفاصيل قبل التنفيذ.",
                  badge: "لن نبدأ التنفيذ إلا بعد موافقتك",
                  img: images[4]
                },
                {
                  step: "2",
                  icon: Smartphone,
                  title: "نظام العزب للمتابعة",
                  desc: "حساب خاص بك داخل نظامنا الإلكتروني. تقارير يومية مصورة، متابعة الخامات الداخلة والخارجة، وتقييم فوري للمراحل.",
                  badge: "تقرير يومي مصور • شفافية الخامات",
                  img: images[5]
                },
                {
                  step: "3",
                  icon: HardHat,
                  title: "التنفيذ المتكامل",
                  desc: "التأسيس، التشطيب، وتصنيع الوحدات حسب المقاسات المطلوبة في ورشنا الخاصة لضمان الجودة العالية.",
                  img: images[6]
                },
                {
                  step: "4",
                  icon: Shield,
                  title: "التشغيل والحماية",
                  desc: "تركيب كاميرات مراقبة، كاشير متطور، وأنظمة إنذار وإطفاء حريق وفق متطلبات الدفاع المدني.",
                  badge: "نظام جاهز للتشغيل الفوري",
                  img: images[7]
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="h-48 overflow-hidden">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
                      {item.step}
                    </div>
                    <CardHeader className="pt-8">
                      <div className="flex justify-center mb-3">
                        <div className="bg-amber-100 p-3 rounded-full">
                          <item.icon className="h-6 w-6 text-amber-600" />
                        </div>
                      </div>
                      <CardTitle className="text-center text-xl">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600 mb-3">{item.desc}</p>
                      {item.badge && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section with Carousel */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge variant="outline" className="mb-2">معرض الأعمال</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800">نفخر بما نقدمه لعملائنا</h2>
              <p className="text-gray-600 mt-2">نماذج حقيقية من مشاريعنا المنفذة بأعلى معايير الجودة</p>
            </motion.div>

            <div className="relative max-w-5xl mx-auto">
              <div className="overflow-hidden rounded-2xl shadow-2xl">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer">
                      <img
                        src={images[galleryIndex]}
                        alt={`Project ${galleryIndex + 1}`}
                        className="w-full h-[500px] object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 bg-black/90">
                    <img src={images[galleryIndex]} alt="Full size" className="w-full h-auto max-h-[80vh] object-contain" />
                  </DialogContent>
                </Dialog>
              </div>
              <button
                onClick={prevGallery}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextGallery}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setGalleryIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === galleryIndex ? 'bg-amber-500 w-6' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Branding Section with Tabs for More Detail */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex-1"
              >
                <Badge variant="outline" className="mb-2">من نحن</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">العزب للخدمات المعمارية .. إرث من التميز</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  "هوايه" ليست مجرد علامة تجارية، بل هي الفرع المتخصص لتجهيز المحلات التجارية الحديثة ضمن مجموعة شركة العزب للخدمات المعمارية.
                  نحن ندمج خبراتنا الهندسية العريقة مع أحدث أنظمة إدارة المشاريع التكنولوجية (Proptech) لنقدم لك تجربة إنشاء متكاملة، خالية من التعقيدات، وبنهاية مضمونة.
                </p>
                <Tabs defaultValue="quality" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-200">
                    <TabsTrigger value="quality">الجودة</TabsTrigger>
                    <TabsTrigger value="tech">التكنولوجيا</TabsTrigger>
                    <TabsTrigger value="support">الدعم</TabsTrigger>
                  </TabsList>
                  <TabsContent value="quality" className="mt-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">أعلى معايير الجودة</h4>
                        <p className="text-gray-600 text-sm">نستخدم أفضل الخامات ونطبق معايير صارمة لضمان نتيجة تدوم طويلاً.</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="tech" className="mt-4">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-amber-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">إدارة إلكترونية متكاملة</h4>
                        <p className="text-gray-600 text-sm">نظام متابعة لحظي وتقارير مصورة تضعك في قلب المشروع.</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="support" className="mt-4">
                    <div className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-amber-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">دعم ما بعد التسليم</h4>
                        <p className="text-gray-600 text-sm">ضمان على جميع الأعمال وخدمة ما بعد البناء.</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <div className="flex flex-wrap gap-4 mt-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>خبرة تمتد لأكثر من 20 عامًا</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>فريق متكامل من المهندسين والفنيين</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>ضمان على جميع الأعمال</span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex-1"
              >
                <img
                  src={images[2]} // using one of the images
                  alt="Team working"
                  className="rounded-xl shadow-xl w-full object-cover h-[400px]"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img src={images[0]} alt="Background" className="w-full h-full object-cover" />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">جاهز تحول محلك لأحدث المحلات في المنطقة؟</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                تواصل مع خبراء هوايه (العلامة التجارية لشركة العزب للخدمات المعمارية) الآن.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8">
                  اطلب معاينة مجانية
                  <ArrowRight className="mr-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900">
                  اتصل بنا الآن
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+201004006620</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>support@alazab.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>القاهرة، مصر</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
