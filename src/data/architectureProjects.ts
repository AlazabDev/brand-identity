export type ArchitectureProject = {
  id: string;
  title: string;
  titleEn: string;
  client: string;
  district: string;
  city: "القاهرة" | "الجيزة";
  fullAddress: string;
  areaM2: number;
  year: number;
  type: string;
  summary: string;
  description: string;
  materials: string[];
  capacity: string;
  nearby: string[];
  coverImage: string;
  gallery: { src: string; caption: string }[];
  modelEmbedUrl: string;
};

const cover = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=1200&q=70`;

export const architectureProjects: ArchitectureProject[] = [
  {
    id: "green-plate-tagamoa",
    title: 'فرع "Green Plate"',
    titleEn: "Green Plate Branch",
    client: "Green Plate Organic",
    district: "التجمع الخامس",
    city: "القاهرة",
    fullAddress: "شارع التسعين الشمالي، التجمع الخامس، القاهرة الجديدة",
    areaM2: 420,
    year: 2024,
    type: "مطعم أغذية صحية",
    summary: "مطعم أغذية صحية بتصميم معماري مفتوح يعتمد على الإضاءة الطبيعية.",
    description:
      "صُمم فرع Green Plate في التجمع الخامس ليعكس فلسفة الأكل الصحي من خلال معمار شفاف ومفتوح. تم توظيف الواجهات الزجاجية المزدوجة للحد من اكتساب حرارة صيف القاهرة مع السماح بدخول أقصى قدر من الإضاءة الطبيعية. الأسقف العالية والمداخن الهوائية تضمن تهوية طبيعية مستمرة تقلل الاعتماد على التكييف بنسبة 35%. استخدمنا الخشب المعالج والحجر الجيري المصري في التشطيبات الداخلية لخلق بيئة دافئة تتناغم مع هوية العلامة التجارية.",
    materials: ["حجر جيري مصري", "خشب سنديان معالج", "زجاج مزدوج Low-E", "حديد مطلي بالنحاس"],
    capacity: "120 مقعد + مطبخ مفتوح 80 م²",
    nearby: ["محور محمد نجيب", "الطريق الدائري الأوسطي", "ميدان التسعين"],
    coverImage: cover("1517248135467-4c7edcad34c4"),
    gallery: [
      { src: cover("1517248135467-4c7edcad34c4"), caption: "الواجهة الرئيسية ليلاً" },
      { src: cover("1600585154340-be6161a56a0c"), caption: "صالة الطعام الداخلية" },
      { src: cover("1600566753376-12c8ab7fb75b"), caption: "المطبخ المفتوح" },
      { src: cover("1600607687939-ce8a6c25118c"), caption: "التراس الخارجي" },
    ],
    modelEmbedUrl:
      "https://3d.magicplan.app/#embed/?key=ZTg1MWFhYWNiMTgxZDc1NzcyZDA1NDY0YWFiYzlkOGVjYzRiZTFjZWVhNjQ3N2NjMDA1NDBkNjM1YWZmODNiNH9LRX2bE%2BCMtkLYe%2B%2Fmb5NJjybLd%2B9klWq7FVq%2BjoC9DkU5cWpDioAKK0E0%2FXPwFg%3D%3D",
  },
  {
    id: "natures-store-obour",
    title: 'مستودع تبريد "Nature\'s Store"',
    titleEn: "Nature's Store Cold Storage",
    client: "Nature's Store Logistics",
    district: "العبور",
    city: "القاهرة",
    fullAddress: "المنطقة الصناعية الأولى، مدينة العبور، القليوبية الكبرى",
    areaM2: 2800,
    year: 2023,
    type: "مستودع تبريد لوجستي",
    summary: "مستودع تبريد متعدد المناطق الحرارية للأغذية العضوية الطازجة.",
    description:
      "مستودع تبريد متطور بمساحة 2800 م² مقسم إلى أربع مناطق حرارية من +4°C إلى -25°C. تم تصميم الغلاف الحراري بطبقات عزل بولي يوريثين بسماكة 150 مم لتقليل استهلاك الطاقة بنسبة 40%. النظام الشمسي على السطح يوفر 30% من احتياجات التشغيل. تم اختيار موقع العبور لقربه من الطريق الدائري ومطار القاهرة لتسريع التوزيع للأسواق والفنادق.",
    materials: ["ساندويتش بانل عازل", "خرسانة مسلحة عالية الكثافة", "ستيل مجلفن", "أرضيات إيبوكسي"],
    capacity: "3500 طن تخزين مبرد + 40 باليت/ساعة",
    nearby: ["الطريق الدائري الأوسطي", "طريق القاهرة-الإسماعيلية", "مطار القاهرة الدولي"],
    coverImage: cover("1586528116311-ad8dd3c8310d"),
    gallery: [
      { src: cover("1586528116311-ad8dd3c8310d"), caption: "الواجهة الخارجية" },
      { src: cover("1553413077-190dd305871c"), caption: "منطقة التحميل" },
      { src: cover("1601599561213-832382fd07ba"), caption: "داخل غرف التبريد" },
      { src: cover("1581092918056-0c4c3acd3789"), caption: "غرفة التحكم" },
    ],
    modelEmbedUrl:
      "https://3d.magicplan.app/#embed/?key=ZTg1MWFhYWNiMTgxZDc1NzcyZDA1NDY0YWFiYzlkOGVjYzRiZTFjZWVhNjQ3N2NjMDA1NDBkNjM1YWZmODNiNH9LRX2bE%2BCMtkLYe%2B%2Fmb5NJjybLd%2B9klWq7FVq%2BjoC9DkU5cWpDioAKK0E0%2FXPwFg%3D%3D",
  },
  {
    id: "purefood-badr",
    title: 'مصنع "PureFood" للأغذية العضوية',
    titleEn: "PureFood Organic Factory",
    client: "PureFood Industries",
    district: "مدينة بدر",
    city: "القاهرة",
    fullAddress: "المنطقة الصناعية الثالثة، مدينة بدر، القاهرة الكبرى",
    areaM2: 5400,
    year: 2024,
    type: "مصنع تصنيع غذائي",
    summary: "مصنع أغذية عضوية بشهادات ISO 22000 وHACCP وتصميم يحقق كفاءة الطاقة.",
    description:
      "مصنع متكامل بمساحة 5400 م² صُمم وفق معايير HACCP وISO 22000. تم تقسيم المبنى إلى مناطق نظافة متدرجة مع أنظمة هواء إيجابي/سلبي لمنع التلوث المتبادل. الواجهات الخضراء العمودية تقلل الحرارة الداخلية بـ 5°C. نظام معالجة المياه يعيد تدوير 70% من المياه الصناعية، ومحطة الطاقة الشمسية بقدرة 500 kWp تغطي ثلث استهلاك المصنع.",
    materials: ["ستانلس ستيل 316", "ألواح HPL مضادة للبكتيريا", "خرسانة مقاومة للأحماض", "ألمنيوم معماري"],
    capacity: "12 طن/يوم منتجات معبأة",
    nearby: ["طريق السويس", "الطريق الإقليمي", "مدينة الشروق"],
    coverImage: cover("1581091226825-a6a2a5aee158"),
    gallery: [
      { src: cover("1581091226825-a6a2a5aee158"), caption: "البوابة الرئيسية" },
      { src: cover("1565793298595-6a879b1d9492"), caption: "خط الإنتاج" },
      { src: cover("1504917595217-d4dc5ebe6122"), caption: "منطقة التعبئة" },
      { src: cover("1497366216548-37526070297c"), caption: "المكاتب الإدارية" },
    ],
    modelEmbedUrl:
      "https://3d.magicplan.app/#embed/?key=ZTg1MWFhYWNiMTgxZDc1NzcyZDA1NDY0YWFiYzlkOGVjYzRiZTFjZWVhNjQ3N2NjMDA1NDBkNjM1YWZmODNiNH9LRX2bE%2BCMtkLYe%2B%2Fmb5NJjybLd%2B9klWq7FVq%2BjoC9DkU5cWpDioAKK0E0%2FXPwFg%3D%3D",
  },
  {
    id: "vitamarket-zayed",
    title: 'متجر "VitaMarket"',
    titleEn: "VitaMarket Store",
    client: "VitaMarket Retail",
    district: "الشيخ زايد",
    city: "الجيزة",
    fullAddress: "المحور المركزي، الحي السابع، الشيخ زايد",
    areaM2: 680,
    year: 2024,
    type: "سوبر ماركت صحي",
    summary: "متجر أغذية صحية بتجربة شراء مفتوحة وإضاءة طبيعية مدروسة.",
    description:
      "متجر VitaMarket في الشيخ زايد يعيد تعريف تجربة السوبر ماركت الصحي. المبنى يعتمد على قبة زجاجية مركزية تضيء الصالة طبيعياً طوال النهار، مع نظام تظليل ذكي يتحرك آلياً مع الشمس. الأرفف مصنوعة من خشب الباولونيا المستدام، والأرضيات من الحجر الجيري المصري. منطقة المنتجات الطازجة مزودة بنظام رذاذ بارد موفر للطاقة.",
    materials: ["خشب باولونيا مستدام", "حجر جيري مصري", "زجاج ذكي", "نحاس مؤكسد"],
    capacity: "4500 صنف + 6 كاشير",
    nearby: ["محور 26 يوليو", "الطريق الدائري الأوسطي", "ميدان الحصري"],
    coverImage: cover("1604719312566-8912e9227c6a"),
    gallery: [
      { src: cover("1604719312566-8912e9227c6a"), caption: "المدخل الرئيسي" },
      { src: cover("1578916171728-46686eac8d58"), caption: "منطقة الخضروات" },
      { src: cover("1534723452862-4c874018d66d"), caption: "ممرات العرض" },
      { src: cover("1542838132-92c53300491e"), caption: "منطقة الكاشير" },
    ],
    modelEmbedUrl:
      "https://3d.magicplan.app/#embed/?key=ZTg1MWFhYWNiMTgxZDc1NzcyZDA1NDY0YWFiYzlkOGVjYzRiZTFjZWVhNjQ3N2NjMDA1NDBkNjM1YWZmODNiNH9LRX2bE%2BCMtkLYe%2B%2Fmb5NJjybLd%2B9klWq7FVq%2BjoC9DkU5cWpDioAKK0E0%2FXPwFg%3D%3D",
  },
  {
    id: "wellness-hub-october",
    title: 'صالة عرض "Wellness Hub"',
    titleEn: "Wellness Hub Showroom",
    client: "Wellness Hub Group",
    district: "6 أكتوبر",
    city: "الجيزة",
    fullAddress: "المحور المركزي، الحي المتميز، 6 أكتوبر",
    areaM2: 950,
    year: 2023,
    type: "صالة عرض ومركز صحي",
    summary: "مساحة تجارية هجينة تجمع بين العرض والاستشارات الغذائية.",
    description:
      "مساحة هجينة بمساحة 950 م² تجمع صالة عرض مع مركز استشارات تغذية. التصميم المعماري يعتمد على مفهوم الدوائر المتداخلة التي ترمز للتوازن. الواجهة الرئيسية من الألمنيوم المثقب بأنماط عربية حديثة تحمي من شمس أكتوبر وتخلق ظلالاً متحركة داخلياً. الحدائق الداخلية الثلاث توفر تهوية طبيعية وتقلل استهلاك التكييف.",
    materials: ["ألمنيوم مثقب", "خرسانة مكشوفة", "رخام سيلفيا مصري", "نحاس مطروق يدوياً"],
    capacity: "صالة 600 م² + 4 عيادات استشارية",
    nearby: ["محور 26 يوليو", "طريق الواحات", "ميدان الحصري"],
    coverImage: cover("1497366754035-f200968a6e72"),
    gallery: [
      { src: cover("1497366754035-f200968a6e72"), caption: "الواجهة الخارجية" },
      { src: cover("1497366811353-6870744d04b2"), caption: "الصالة المركزية" },
      { src: cover("1600585154526-990dced4db0d"), caption: "الحديقة الداخلية" },
      { src: cover("1600573472550-8090b5e0745e"), caption: "العيادات" },
    ],
    modelEmbedUrl:
      "https://3d.magicplan.app/#embed/?key=ZTg1MWFhYWNiMTgxZDc1NzcyZDA1NDY0YWFiYzlkOGVjYzRiZTFjZWVhNjQ3N2NjMDA1NDBkNjM1YWZmODNiNH9LRX2bE%2BCMtkLYe%2B%2Fmb5NJjybLd%2B9klWq7FVq%2BjoC9DkU5cWpDioAKK0E0%2FXPwFg%3D%3D",
  },
  {
    id: "ecologix-newcapital",
    title: 'مركز توزيع "EcoLogix"',
    titleEn: "EcoLogix Distribution Center",
    client: "EcoLogix Distribution",
    district: "العاصمة الإدارية الجديدة",
    city: "القاهرة",
    fullAddress: "المنطقة اللوجستية، الحي R7، العاصمة الإدارية الجديدة",
    areaM2: 7200,
    year: 2025,
    type: "مركز توزيع لوجستي",
    summary: "مركز توزيع ذكي بتصنيف LEED Gold لمنتجات الأغذية العضوية.",
    description:
      "مركز توزيع بمساحة 7200 م² حاصل على تصنيف LEED Gold. الغلاف الخارجي من ألواح ساندويتش عازلة بمعامل U=0.25، والسقف مغطى بألواح شمسية بقدرة 1.2 MW. نظام إدارة المبنى الذكي يتحكم آلياً في الإضاءة والتكييف والتهوية. منطقة التحميل تستوعب 24 شاحنة في وقت واحد، ونظام AGV الآلي ينقل البضائع داخلياً.",
    materials: ["ساندويتش بانل بعزل 200 مم", "ستيل إنشائي مجلفن", "خرسانة منخفضة الكربون", "زجاج شمسي"],
    capacity: "8000 باليت + 24 رصيف تحميل",
    nearby: ["المحور الأوسطي", "طريق السويس", "المونوريل"],
    coverImage: cover("1565043666747-69f6646db940"),
    gallery: [
      { src: cover("1565043666747-69f6646db940"), caption: "الواجهة الجنوبية" },
      { src: cover("1586528116493-ac0ae06f5e86"), caption: "أرصفة التحميل" },
      { src: cover("1553413077-190dd305871c"), caption: "صالة التخزين" },
      { src: cover("1581092160607-ee22621dd758"), caption: "غرفة التحكم" },
    ],
    modelEmbedUrl:
      "https://3d.magicplan.app/#embed/?key=ZTg1MWFhYWNiMTgxZDc1NzcyZDA1NDY0YWFiYzlkOGVjYzRiZTFjZWVhNjQ3N2NjMDA1NDBkNjM1YWZmODNiNH9LRX2bE%2BCMtkLYe%2B%2Fmb5NJjybLd%2B9klWq7FVq%2BjoC9DkU5cWpDioAKK0E0%2FXPwFg%3D%3D",
  },
];

export const getArchitectureProject = (id: string) =>
  architectureProjects.find((p) => p.id === id);
