import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PageMeta from "@/components/PageMeta";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Linkedin, Mail } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "م. أحمد العزب",
    role: "المدير التنفيذي",
    bio: "أكثر من 15 عامًا من الخبرة في إدارة مشاريع تجهيز المحلات التجارية في كبرى المولات",
    initials: "أع",
  },
  {
    name: "م. محمد سالم",
    role: "مدير المشاريع",
    bio: "مهندس متخصص في التنسيق بين فرق العمل وضمان تسليم المشاريع في الوقت المحدد",
    initials: "مس",
  },
  {
    name: "م. سارة الحسيني",
    role: "مديرة التصميم الداخلي",
    bio: "مصممة داخلية مبدعة تجمع بين الجمال والوظيفة في كل تصميم",
    initials: "سح",
  },
  {
    name: "م. خالد ناصر",
    role: "مدير الإنتاج",
    bio: "خبرة واسعة في تصنيع وتجميع وحدات العرض والتخزين بأعلى معايير الجودة",
    initials: "خن",
  },
  {
    name: "م. ياسمين فؤاد",
    role: "مسؤولة علاقات العملاء",
    bio: "تضمن تجربة سلسة للعميل من أول تواصل وحتى تسليم المشروع",
    initials: "يف",
  },
  {
    name: "م. عمر مصطفى",
    role: "مهندس موقع",
    bio: "يشرف على التنفيذ الميداني ويضمن مطابقة العمل للتصميمات المعتمدة",
    initials: "عم",
  },
];

const TeamPage = () => {
  return (
    <PageTransition>
      <PageMeta
        title="فريق العمل"
        description="تعرف على فريق Brand Identity من المهندسين والمصممين المتخصصين في تجهيز المحلات التجارية."
        canonical="https://brand-identity.alazab.com/team"
      />
      <div className="min-h-screen">
        <Header />
        <main id="main-content" className="pt-20">
          {/* Hero */}
          <section className="section-padding bg-primary text-primary-foreground">
            <div className="container-custom text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display font-bold text-4xl md:text-5xl mb-4"
              >
                فريق العمل
              </motion.h1>
              <p className="text-primary-foreground/70 font-body text-lg max-w-2xl mx-auto">
                نخبة من المهندسين والمصممين والفنيين يعملون معًا لتحويل رؤيتك إلى واقع
              </p>
            </div>
          </section>

          {/* Team Grid */}
          <section className="section-padding bg-background">
            <div className="container-custom">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamMembers.map((member, i) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="card-elevated group overflow-hidden"
                  >
                    {/* Avatar placeholder */}
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <span className="text-5xl font-display font-bold text-primary/30 group-hover:text-accent/50 transition-colors">
                        {member.initials}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-display font-bold text-lg text-foreground mb-1">
                        {member.name}
                      </h3>
                      <p className="text-accent font-body text-sm font-medium mb-3">
                        {member.role}
                      </p>
                      <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
                        {member.bio}
                      </p>
                      <div className="flex gap-2">
                        <a
                          href="#"
                          className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          aria-label="LinkedIn"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                        <a
                          href="#"
                          className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          aria-label="Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="section-padding bg-muted/50">
            <div className="container-custom text-center">
              <h2 className="font-display font-bold text-3xl text-foreground mb-4">
                هل تريد الانضمام لفريقنا؟
              </h2>
              <p className="text-muted-foreground font-body mb-6 max-w-xl mx-auto">
                نبحث دائمًا عن مواهب جديدة. تصفح الوظائف المتاحة وانضم إلى عائلة Brand Identity
              </p>
              <a
                href="/careers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-display font-bold text-sm hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                تصفح الوظائف
              </a>
            </div>
          </section>
        </main>
        <Footer />
        <FloatingButtons />
      </div>
    </PageTransition>
  );
};

export default TeamPage;
