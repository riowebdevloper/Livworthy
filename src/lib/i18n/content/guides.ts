/**
 * LivWorthy Localized Salary Guide Content Repository
 *
 * Implements Section 15 & 21:
 * - Canonical guideSlug + locale data model
 * - Localized title, h1, directAnswer, intro, breakdownNarrative, recommendation, FAQ, and SEO metadata
 * - Structured for Tier-1 languages without duplicated calculation logic
 */

import { LocalizedGuideContent } from '../types';

export const LOCALIZED_GUIDES: Record<string, Record<string, LocalizedGuideContent>> = {
  'nyc-100k': {
    en: {
      guideSlug: 'nyc-100k',
      locale: 'en',
      title: 'Is $100K a Good Salary in New York City? (2026 Reality Check)',
      h1: 'Is $100K a Good Salary in New York City?',
      directAnswer: 'Yes, $100,000 is a viable, moderate salary for a single adult in NYC. After federal, NY state, and NYC resident income taxes, take-home pay is roughly $5,862/month, leaving ~$1,540/month in discretionary savings after a median 1-bedroom apartment.',
      intro: 'In New York City, six-figure earnings are widely considered the benchmark for financial independence. However, the triple-tier tax system and high rental costs require disciplined budget management to build long-term wealth.',
      breakdownNarrative: 'A gross salary of $100,000 faces an effective combined tax rate of approximately 29.6% ($2,467/month in withholdings across IRS, NYS, and NYC resident taxes, plus FICA). Housing absorbs approximately 40% of net take-home pay for an independent renter in Brooklyn or Queens. Basic utilities with ConEdison and high-speed broadband cost ~$220/month, while the 30-day MTA unlimited MetroCard costs $132/month, providing 24/7 transit access across all five boroughs without the financial burden of auto ownership.',
      recommendation: 'Target an apartment under $2,400/month in neighborhoods like Astoria, Crown Heights, or Sunnyside, or consider living with a flatmate in prime Manhattan to maximize your annual savings rate above 20%.',
      faq: [
        {
          question: 'What is the net monthly take-home pay for $100k in NYC?',
          answer: 'Approximately $5,862 per month ($70,340/year) for a single filer claiming standard deductions under 2026 statutory tax law.',
        },
        {
          question: 'Can you live alone on $100k in Manhattan?',
          answer: 'Yes, in neighborhoods like Upper East Side, Inwood, or Washington Heights, where inventory under the landlord 40x rent rule ($2,500/month maximum) can be found.',
        },
      ],
      seoTitle: 'Is $100K a Good Salary in NYC? Net Pay & Rent Breakdown (2026)',
      seoDescription: 'Find out if $100,000 is enough to live comfortably in New York City after IRS, NY State, and NYC city taxes, plus rent.',
      status: 'PUBLISHED',
    },
    es: {
      guideSlug: 'nyc-100k',
      locale: 'es',
      title: '¿Es $100.000 un buen salario en Nueva York? (Análisis 2026)',
      h1: '¿Es $100.000 un buen salario en la ciudad de Nueva York?',
      directAnswer: 'Sí, $100.000 es un salario viable y moderado para una persona soltera en NYC. Tras impuestos federales, estatales y municipales de Nueva York, el ingreso neto mensual ronda los $5.862 ($70.340 anuales), dejando unos $1.540 al mes para ahorro tras cubrir un alquiler mediano de $2.350 y gastos básicos.',
      intro: 'En Nueva York, superar las seis cifras es la meta tradicional para la independencia financiera. Sin embargo, la triple retención fiscal acumulativa y los altos alquileres exigen un presupuesto riguroso para mantener liquidez.',
      breakdownNarrative: 'Un sueldo bruto de $100.000 enfrenta una tasa impositiva efectiva combinada del 29,6% ($2.467 al mes en retenciones del IRS, Estado de NY, Ciudad de NYC y FICA). La vivienda absorbe cerca del 40% del salario neto para quienes alquilan en Brooklyn o Queens. Los suministros con ConEdison e internet suman unos $220 al mes, y el pase de metro MTA de $132 resuelve el transporte integral.',
      recommendation: 'Busque opciones de alquiler por debajo de $2.400 al mes en zonas como Astoria o Crown Heights, o comparta apartamento en Manhattan para mantener una tasa de ahorro superior al 20%.',
      faq: [
        {
          question: '¿Cuánto queda en mano al mes con $100k en Nueva York?',
          answer: 'Aproximadamente $5.862 al mes para un contribuyente soltero con deducción estándar en el año fiscal 2026.',
        },
        {
          question: '¿Se puede vivir solo en Manhattan con $100k?',
          answer: 'Sí, en zonas como el Upper East Side o Washington Heights, cumpliendo la regla del 40x de ingresos sobre el alquiler ($2.500/mes de tope).',
        },
      ],
      seoTitle: '¿Es $100K un buen sueldo en Nueva York? Sueldo neto y alquiler 2026',
      seoDescription: 'Descubre si $100.000 alcanzan para vivir bien en Nueva York tras impuestos federales, estatales y de la ciudad.',
      status: 'PUBLISHED',
    },
    fr: {
      guideSlug: 'nyc-100k',
      locale: 'fr',
      title: '100 000 $ est-il un bon salaire à New York ? (Réalité 2026)',
      h1: '100 000 $ est-il un bon salaire à New York ?',
      directAnswer: 'Oui, 100 000 $ est un salaire convenable pour un célibataire à New York. Après déduction des impôts fédéral américain, de l’État de New York et de la ville de NYC, le salaire net mensuel est d’environ 5 862 $ (70 340 $ par an), permettant d’épargner environ 1 540 $ par mois après le loyer médian d’un appartement d’une chambre.',
      intro: 'À New York, atteindre six chiffres est souvent perçu comme le seuil d’autonomie financière. La triple imposition locale et les loyers élevés réduisent toutefois la marge de manœuvre sans une gestion budgétaire rigoureuse.',
      breakdownNarrative: 'Le taux effectif combiné d’imposition atteint environ 29,6 %, soit 2 467 $ par mois prélevés à la source (IRS, État, Ville et cotisations FICA). Le logement absorbe environ 40 % du revenu net pour un appartement d’une chambre à Brooklyn ou Queens. L’électricité avec ConEdison et internet coûtent environ 220 $ par mois, tandis que le pass métro illimité MTA à 132 $ permet d’éviter toute dépense automobile.',
      recommendation: 'Visez un loyer inférieur à 2 400 $ dans des quartiers comme Astoria ou Bushwick, ou privilégiez la colocation à Manhattan pour préserver une capacité d’épargne saine supérieure à 20 % de vos revenus nets.',
      faq: [
        {
          question: 'Quel est le salaire net mensuel pour 100k $ à NYC ?',
          answer: 'Environ 5 862 $ par mois pour un célibataire déclarant avec la déduction forfaitaire légale en 2026.',
        },
        {
          question: 'Peut-on vivre seul à Manhattan avec 100k $ ?',
          answer: 'Oui, dans des secteurs comme l\'Upper East Side ou Washington Heights, où les exigences des propriétaires (règle des 40x le loyer) permettent de viser des baux jusqu\'à 2 500 $/mois.',
        },
      ],
      seoTitle: '100k $ à New York : Salaire net et coût de la vie en 2026',
      seoDescription: 'Découvrez ce que vaut un salaire de 100 000 $ à New York après impôts et dépenses réelles de logement.',
      status: 'PUBLISHED',
    },
    ar: {
      guideSlug: 'nyc-100k',
      locale: 'ar',
      title: 'هل راتب 100 ألف دولار كافٍ في نيويورك؟ (دليل 2026)',
      h1: 'هل 100,000 دولار راتب جيد للعيش في نيويورك؟',
      directAnswer: 'نعم، يُعتبر راتب 100,000 دولار سنوياً دخلاً جيداً ومعتدلاً للمهنيين غير المتزوجين في مدينة نيويورك. بعد استقطاع الضرائب الفيدرالية وضريبة ولاية نيويورك وضريبة إقامة المدينة ورسوم الضمان الاجتماعي FICA، يبلغ صافي الراتب الشهري نحو 5,862 دولاراً (70,340 دولاراً سنوياً). يتيح هذا الدخل استئجار شقة بغرفة نوم واحدة بمتوسط 2,350 دولاراً مع ادخار ما يقارب 1,540 دولاراً شهرياً.',
      intro: 'يمثل تحقيق دخل سنوي مكون من ست خانات في نيويورك هدفاً تقليدياً لبلوغ الاستقلال المالي. ومع ذلك، تؤدي الضرائب الثلاثية المتراكمة وتكاليف الإيجار المرتفعة إلى تآكل جزء كبير من الراتب، مما يستلزم إدارة دقيقة وميزانية مدروسة للمصاريف الشهرية.',
      breakdownNarrative: 'يواجه الراتب الإجمالي البالغ 100,000 دولار معدل ضريبة فعلي يبلغ نحو 29.6%، أي ما يعادل استقطاعاً شهرياً قدره 2,471 دولاراً لصالح مصلحة الضرائب والولاية والمدينة. ويستحوذ السكن على نحو 40% من صافي الدخل لمن يستأجر في بروكلين أو كوينز، بينما تكلف فواتير الكهرباء والإنترنت نحو 220 دولاراً وبطاقة المترو 132 دولاراً شهرياً.',
      recommendation: 'يُنصح باختيار شقة لا يتجاوز إيجارها 2,400 دولار شهرياً في أحياء مثل أستوريا أو كراون هايتس، أو مشاركة سكن في مانهاتن لضمان الحفاظ على معدل ادخار شهري يتجاوز 20% من صافي الراتب.',
      faq: [
        {
          question: 'كم يبلغ صافي الراتب الشهري لمبلغ 100 ألف دولار في نيويورك؟',
          answer: 'يبلغ صافي الدخل المستلم فعلياً حوالي 5,862 دولاراً شهرياً بعد خصم جميع الضرائب القانونية لموظف أعزب لعام 2026.',
        },
        {
          question: 'هل تكفي 100 ألف دولار للعيش بمفردك واستئجار شقة في مانهاتن؟',
          answer: 'نعم، ولكن في أحياء مثل آبر إيست سايد أو إنوود، حيث يتيح شرط الملاك (40 ضعف الإيجار) استئجار شقة بحد أقصى 2,500 دولار شهرياً.',
        },
      ],
      seoTitle: 'هل 100 ألف دولار كافية في نيويورك؟ الراتب الصافي والإيجار 2026',
      seoDescription: 'تعرف على القيمة الحقيقية لراتب 100 ألف دولار في نيويورك بعد الضرائب والإيجار.',
      status: 'PUBLISHED',
    },
    de: {
      guideSlug: 'nyc-100k',
      locale: 'de',
      title: 'Sind 100.000 $ ein gutes Gehalt in New York City? (2026 Analyse)',
      h1: 'Sind 100.000 $ ein gutes Gehalt in New York City?',
      directAnswer: 'Ja, 100.000 USD brutto im Jahr ist ein solides, überdurchschnittliches Gehalt für Alleinstehende in New York City. Nach Abzug der US-Bundessteuer, der Steuer des Bundesstaates New York, der städtischen NYC-Wohnsitzsteuer und FICA-Sozialabgaben verbleibt ein monatliches Nettoeinkommen von ca. 5.862 USD (70.340 USD jährlich). Nach Abzug einer ortsüblichen Einzimmerwohnung von ca. 2.350 USD verbleiben rund 1.540 USD monatlich für freie Ersparnisse.',
      intro: 'In New York gilt ein sechsstelliges Jahreseinkommen seit langem als Meilenstein für finanzielle Unabhängigkeit. Dennoch sorgt die kumulative dreistufige Steuerprogression in Verbindung mit hohen gewerblichen und privaten Mieten dafür, dass eine disziplinierte Ausgabenplanung zwingend erforderlich ist.',
      breakdownNarrative: 'Vom Bruttogehalt in Höhe von 100.000 USD gehen monatlich rund 2.471 USD an Steuern und gesetzliche Abgaben ab (effektiver Steuersatz rund 29,6%). Die Miete in Stadtteilen wie Astoria (Queens) oder Bushwick (Brooklyn) absorbiert rund 40% des monatlichen Nettogehalts. Hinzu kommen 132 USD für die unbegrenzte 30-Tage-MetroCard sowie ca. 220 USD für Strom und Internet.',
      recommendation: 'Achten Sie darauf, dass Ihre Warmmiete 2.400 USD monatlich nicht übersteigt, oder ziehen Sie in Betracht, in Manhattan eine Wohngemeinschaft zu nutzen, um eine langfristige Netto-Sparquote von über 20% zu realisieren.',
      faq: [
        {
          question: 'Wie hoch ist das monatliche Nettogehalt bei 100.000 USD in NYC?',
          answer: 'Exakt rund 5.862 USD pro Monat für einen alleinstehenden Steuerzahler mit Standardabzug im Steuerjahr 2026.',
        },
        {
          question: 'Kann man mit 100k USD alleine in Manhattan wohnen?',
          answer: 'Ja, insbesondere in Vierteln wie der Upper East Side oder Washington Heights, da die 40-fache Mietregel der Vermieter Wohnungen bis maximal 2.500 USD Monatsmiete erlaubt.',
        },
      ],
      seoTitle: 'Sind 100.000 $ genug in New York? Nettogehalt & Miete 2026',
      seoDescription: 'Erfahren Sie, wie viel von 100.000 $ in New York City nach Steuern und Miete zum Leben bleibt.',
      status: 'PUBLISHED',
    },
    pt: {
      guideSlug: 'nyc-100k',
      locale: 'pt',
      title: 'US$ 100 mil é um bom salário em Nova York? (Realidade 2026)',
      h1: 'US$ 100.000 é um bom salário em Nova York?',
      directAnswer: 'Sim, US$ 100.000 anuais é um salário sólido e acima da média para um profissional solteiro em Nova York. Após as retenções tributárias do IRS federal, do estado de Nova York, da taxa municipal de NYC e dos encargos previdenciários do FICA, o salário líquido real é de cerca de US$ 5.862 por mês (US$ 70.340 por ano). Esse montante permite alugar um apartamento de um quarto pela média de US$ 2.350 e ainda poupar aproximadamente US$ 1.540 mensais.',
      intro: 'Na cidade de Nova York, atingir remuneração de seis dígitos é amplamente considerado o marco da autonomia financeira. No entanto, o sistema fiscal tripartite e os elevados aluguéis exigem planejamento financeiro disciplinado para manter liquidez positiva.',
      breakdownNarrative: 'O salário bruto de US$ 100.000 sofre tributação efetiva de 29,6%, totalizando US$ 2.471 ao mês em deduções na fonte. Os custos habitacionais absorvem cerca de 40% da renda líquida no Brooklyn ou Queens. Custos fixos adicionais incluem o passe mensal ilimitado de metrô MTA por US$ 132 e serviços essenciais (energia ConEdison e internet) em torno de US$ 220 mensais.',
      recommendation: 'Mantenha o valor do aluguel abaixo de US$ 2.400 mensais ou considere dividir um apartamento em Manhattan para assegurar uma taxa de poupança superior a 20% da sua renda líquida.',
      faq: [
        {
          question: 'Qual é o salário líquido mensal com US$ 100k em Nova York?',
          answer: 'Aproximadamente US$ 5.862 por mês para declarante individual solteiro com deduções padrão em 2026.',
        },
        {
          question: 'É possível morar sozinho em Manhattan ganhando US$ 100k?',
          answer: 'Sim, em bairros como Upper East Side ou Inwood, respeitando a regra dos proprietários de 40 vezes o aluguel anual (limite de US$ 2.500/mês).',
        },
      ],
      seoTitle: 'US$ 100K em Nova York: Salário Líquido e Custo de Aluguel 2026',
      seoDescription: 'Descubra quanto sobra de US$ 100.000 em Nova York após descontos de impostos e despesas de moradia.',
      status: 'PUBLISHED',
    },
    hi: {
      guideSlug: 'nyc-100k',
      locale: 'hi',
      title: 'क्या न्यूयॉर्क में $100K का वेतन अच्छा है? (2026 विश्लेषण)',
      h1: 'क्या न्यूयॉर्क शहर में $100,000 एक अच्छा वेतन है?',
      directAnswer: 'हाँ, न्यूयॉर्क शहर में एक अकेले कामकाजी व्यक्ति के लिए $100,000 वार्षिक वेतन एक सम्मानजनक और व्यावहारिक आय है। अमेरिकी संघीय कर, न्यूयॉर्क राज्य कर, शहर के निवासी कर और FICA कटौतियों के बाद शुद्ध मासिक हाथ में आने वाला वेतन लगभग $5,862 (वार्षिक $70,340) होता है। यह आय $2,350 के औसत एक बेडरूम अपार्टमेंट का किराया चुकाने के बाद लगभग $1,540 प्रति माह की शुद्ध बचत करने में सक्षम बनाती है।',
      intro: 'न्यूयॉर्क शहर में छह अंकों का वार्षिक वेतन वित्तीय स्वतंत्रता का मानक माना जाता है। फिर भी, त्रि-स्तरीय कर प्रणाली और महंगे आवासीय बाजार के कारण अपनी वित्तीय स्थिति मजबूत बनाए रखने के लिए संतुलित मासिक बजट आवश्यक है।',
      breakdownNarrative: '$100,000 के सकल वेतन पर प्रभावी संयुक्त कर दर लगभग 29.6% ($2,471 प्रति माह) होती है। ब्रुकलिन या क्वींस में स्वतंत्र रूप से रहने पर किराया शुद्ध वेतन का लगभग 40% हिस्सा लेता है। इसके अलावा $132 का मासिक एमटीए मेट्रोकार्ड और लगभग $220 बिजली व इंटरनेट का खर्च होता है।',
      recommendation: 'अपनी बचत दर को 20% से अधिक रखने के लिए $2,400 प्रति माह से कम किराये का आवास चुनें, या मैनहट्टन में किसी साथी के साथ फ्लैट साझा करने पर विचार करें।',
      faq: [
        {
          question: 'न्यूयॉर्क में $100,000 वार्षिक वेतन पर शुद्ध मासिक वेतन कितना मिलता है?',
          answer: 'वर्ष 2026 के वैधानिक कर नियमों के अनुसार अकेले करदाता को लगभग $5,862 प्रति माह शुद्ध प्राप्त होते हैं।',
        },
        {
          question: 'क्या $100k वेतन पर मैनहट्टन में अकेले रहना संभव है?',
          answer: 'हाँ, अपर ईस्ट साइड या वाशिंगटन हाइट्स में, जहाँ 40 गुना आय नियम के तहत अधिकतम $2,500 प्रति माह तक का किराया स्वीकृत होता है।',
        },
      ],
      seoTitle: 'न्यूयॉर्क में $100K वेतन: शुद्ध आय और किराये का विश्लेषण 2026',
      seoDescription: 'जानें कि अमेरिकी करों और आवास व्यय के बाद न्यूयॉर्क में $100,000 का वेतन कितना पर्याप्त है।',
      status: 'PUBLISHED',
    },
    ur: {
      guideSlug: 'nyc-100k',
      locale: 'ur',
      title: 'کیا نیویارک میں $100K کی تنخواہ کافی ہے؟ (2026 جائزہ)',
      h1: 'کیا نیویارک سٹی میں $100,000 اچھی تنخواہ ہے؟',
      directAnswer: 'جی ہاں، نیویارک سٹی میں اکیلے ملازمت پیشہ فرد کے لیے سالانہ 100,000 ڈالر ایک معقول اور مستحکم آمدنی سمجھی جاتی ہے۔ امریکی وفاقی، ریاستی، نیویارک سٹی ریذیڈنٹ ٹیکس اور FICA سوشل سیکیورٹی کٹوتیوں کے بعد خالص ماہانہ آمدنی تقریباً 5,862 ڈالر (سالانہ 70,340 ڈالر) حاصل ہوتی ہے۔ اس رقم میں سے 2,350 ڈالر ماہانہ کا اوسط ایک بیڈ روم کرایہ ادا کرنے کے بعد تقریباً 1,540 ڈالر ماہانہ بچت ممکن ہے۔',
      intro: 'نیویارک میں ایک لاکھ ڈالر کی سالانہ آمدنی خودمختار طرز زندگی کے لیے اہم سنگ میل سمجھی جاتی ہے۔ تاہم تین سطحی ٹیکسوں اور بھاری کرایوں کی وجہ سے اپنے مالی معاملات کو مستحکم رکھنے کے لیے منظم بجٹ ناگزیر ہے۔',
      breakdownNarrative: 'ایک لاکھ ڈالر تنخواہ پر مؤثر ٹیکس کی شرح تقریباً 29.6 فیصد ہے، جس کے تحت ماہانہ 2,471 ڈالر ٹیکس کٹوتیوں میں جاتے ہیں۔ بروک لین یا کوئنز میں کرایہ خالص آمدنی کا 40 فیصد حصہ لیتا ہے، جبکہ 132 ڈالر کا ایم ٹی اے میٹرو کارڈ اور 220 ڈالر بجلی و انٹرنیٹ کے اخراجات میں شامل ہوتے ہیں۔',
      recommendation: 'اپنی ماہانہ بچت کی شرح کو 20 فیصد سے زائد رکھنے کے لیے 2,400 ڈالر سے کم کرائے کا انتخاب کریں یا مین ہیٹن میں رہائش کے لیے فلیٹ شیئرنگ کریں۔',
      faq: [
        {
          question: 'نیویارک میں ایک لاکھ ڈالر کمانے والے کو ماہانہ کتنی خالص رقم ملتی ہے؟',
          answer: 'سال 2026 کے باقاعدہ ٹیکس شیڈول کے مطابق اکیلے فرد کو تقریباً 5,862 ڈالر ماہانہ خالص آمدنی حاصل ہوتی ہے۔',
        },
        {
          question: 'کیا ایک لاکھ ڈالر تنخواہ پر مین ہیٹن میں اکیلے رہنا ممکن ہے؟',
          answer: 'جی ہاں، اپر ایسٹ سائیڈ یا واشنگٹن ہائٹس جیسے علاقوں میں، جہاں مکان مالکان کے 40 گنا آمدنی کی شرط کے تحت 2,500 ڈالر تک کا کرایہ مل سکتا ہے۔',
        },
      ],
      seoTitle: 'نیویارک میں $100K تنخواہ: ٹیکس اور کرائے کی تفصیل 2026',
      seoDescription: 'نیویارک میں ایک لاکھ ڈالر تنخواہ پر ٹیکس کٹوتیوں اور رہائشی اخراجات کا مستند تجزیہ۔',
      status: 'PUBLISHED',
    },
    zh: {
      guideSlug: 'nyc-100k',
      locale: 'zh',
      title: '在纽约年薪10万美元够用吗？（2026年到手收入与房租测算）',
      h1: '在纽约市年薪10万美元算好薪水吗？',
      directAnswer: '是的，对于在纽约市生活的单身职场人士而言，10万美元（100k）是一份稳健且处于中上水平的体面年薪。在扣除美国联邦所得税、纽约州个人所得税、纽约市本地居民税以及FICA社保医保后，实际每月净到手收入约为5,862美元（折合年净收入约70,340美元）。在支付全市中位数约2,350美元的一居室房租后，每月仍可保留约1,540美元的可支配储蓄与应急储备。',
      intro: '在纽约市，年薪跨入六位数门槛向来被视为实现经济自立与舒适生活的关键指标。然而，纽约市独特的联邦、州、市三级重叠税制以及全美领先的租赁市场成本，意味着高薪群体同样需要保持高度自律的预算规划与现金流管控。',
      breakdownNarrative: '年薪10万美元的综合有效税率约为29.6%，相当于每月有2,471美元的工资直接在发薪日前被扣缴。在布鲁克林或皇后区独立租房时，租金支出约占税后净收入的40%。固定开支方面，每月132美元的MTA地铁无限次通票完全解决了全城通勤需求，加上ConEdison电费与宽带费约220美元，基础硬性开支控制在2,700美元左右。',
      recommendation: '建议将月租金严格控制在2,400美元以内（例如选择皇后区Astoria或布鲁克林外围成熟社区），或在曼哈顿核心区域考虑与室友合租两居室，以确保将净收入储蓄率稳定在20%以上。',
      faq: [
        {
          question: '在纽约市年薪10万美元每月税后实际到手多少？',
          answer: '按照2026年最新法定税率，单身标准扣除申报人每月税后实发到手约5,862美元。',
        },
        {
          question: '年薪10万美元能在曼哈顿独立租房居住吗？',
          answer: '可以，尤其是在上东区（Upper East Side）或因伍德（Inwood）等社区，房东严格执行的40倍月租年薪审核规则允许承租最高2,500美元/月的房源。',
        },
      ],
      seoTitle: '在纽约年薪10万美元生活指南：税后收入与房租分析 2026',
      seoDescription: '详细测算纽约年薪10万美元扣税后实际所得、住房开销与每月生活结余。',
      status: 'PUBLISHED',
    },
    ja: {
      guideSlug: 'nyc-100k',
      locale: 'ja',
      title: 'ニューヨークで年収10万ドルは十分か？（2026年手取りと家賃の現実）',
      h1: 'ニューヨーク市で年収10万ドルは良い給与ですか？',
      directAnswer: 'はい、ニューヨーク市で暮らす単身者にとって、年収10万ドル（100k）は堅実で安定した生活を送るための十分な給与水準です。米国連邦税、ニューヨーク州税、ニューヨーク市居住者税、およびFICA社会保障税を差し引いた後の実質手取り額は月額約5,862ドル（年間約70,340ドル）となります。市内の中央値である月額約2,350ドルの1ベッドルーム家賃を支払った後でも、毎月約1,540ドルの貯蓄余力および自由裁量資金を確保できます。',
      intro: 'ニューヨーク市において6桁（10万ドル以上）の年収は、経済的自立と都市生活の安定を象徴する重要なマイルストーンです。しかし、連邦・州・市の3層にわたる重層的な税負担と全米屈指の家賃水準のため、資産形成には綿密な生活設計と支出管理が不可欠です。',
      breakdownNarrative: '年収10万ドルの実効税率は約29.6%で、毎月約2,471ドルが源泉徴収されます。ブルックリンやクイーンズでの単身生活では、家賃が手取り月収の約40%を占めます。月額132ドルのMTA地下鉄乗り放題パスによってマイカー維持費が不要となり、光熱費・通信費約220ドルを含めた基礎固定費は約2,700ドルに収まります。',
      recommendation: '健全な家計管理のためには家賃を月額2,400ドル以内に抑えるか、マンハッタン中心部ではルームシェアを選択することで、手取り収入の20%以上を貯蓄・投資に回す体制を構築することを推奨します。',
      faq: [
        {
          question: 'ニューヨーク市で年収10万ドルの実質手取り月額はいくらですか？',
          answer: '2026年の現行税制に基づき、単身・標準控除適用の場合で毎月約5,862ドルとなります。',
        },
        {
          question: '年収10万ドルでマンハッタンに一人暮らしすることは可能ですか？',
          answer: '可能です。アッパーイーストサイドやワシントンハイツ等であれば、家主の「年収は家賃の40倍」審査基準に基づき最大月額2,500ドルまでの物件が賃貸可能です。',
        },
      ],
      seoTitle: 'ニューヨーク年収10万ドルの手取り給与と生活費検証 2026',
      seoDescription: 'ニューヨークで年収10万ドル稼いだ場合の実質手取り額、家賃負担、生活費の現実的な検証。',
      status: 'PUBLISHED',
    },
  },
  'london-100k': {
    en: {
      guideSlug: 'london-100k',
      locale: 'en',
      title: 'Is £100K a Good Salary in London? (HMRC Tax & Rent Reality)',
      h1: 'Is £100,000 a Good Salary in London?',
      directAnswer: 'Yes, £100,000 places you in the top 3% of UK income earners. Take-home pay is roughly £5,550/month after HMRC tax and National Insurance, leaving approximately £2,500/month after central London rent and bills.',
      intro: 'Earning £100,000 in London unlocks a comfortable, affluent lifestyle, although it triggers the HMRC personal allowance taper (£1 lost for every £2 earned above £100k).',
      breakdownNarrative: 'At exactly £100,000, you retain the full £12,570 personal allowance. Total tax and NIC withholdings equal £33,400/year, providing £66,600 annual net pay.',
      recommendation: 'Utilize pension salary sacrifice schemes to lower your taxable earnings below £100,000 and avoid the effective 60% marginal tax trap.',
      faq: [
        {
          question: 'What is the take-home pay on £100k in London?',
          answer: 'Approximately £5,550 per month after statutory 2026 HMRC income tax and employee National Insurance.',
        },
      ],
      seoTitle: 'Is £100K a Good Salary in London? Net Pay & Tax Guide 2026',
      seoDescription: 'Comprehensive guide to earning £100,000 in London: take-home pay, HMRC brackets, and disposable cash.',
      status: 'PUBLISHED',
    },
    es: {
      guideSlug: 'london-100k',
      locale: 'es',
      title: '¿Es £100.000 un buen salario en Londres? (Análisis Fiscal 2026)',
      h1: '¿Es £100.000 un buen salario en Londres?',
      directAnswer: 'Sí, £100.000 sitúa al profesional en el 3% superior de ingresos en el Reino Unido. El sueldo neto ronda las £5.550 al mes tras HMRC y National Insurance, dejando unas £2.500 tras alquiler y servicios.',
      intro: 'Ganar £100.000 en Londres permite un estilo de vida desahogado, aunque marca el inicio de la reducción progresiva del mínimo exento en el sistema británico.',
      breakdownNarrative: 'Con £100.000 brutos, las retenciones totales suman £33.400 anuales, dejando un ingreso disponible neto de £66.600.',
      recommendation: 'Considere aportar a planes de pensión para reducir la base imponible y evitar el tramo marginal efectivo del 60%.',
      faq: [
        {
          question: '¿Cuánto se cobra neto al mes con £100k en Londres?',
          answer: 'Aproximadamente £5.550 al mes en 2026 tras impuestos y seguridad social.',
        },
      ],
      seoTitle: '¿Es £100k un buen salario en Londres? Sueldo neto y gastos 2026',
      seoDescription: 'Descubre cuánto rinde un sueldo de £100.000 en Londres tras impuestos de HMRC y costo de vida.',
      status: 'PUBLISHED',
    },
  },
  'dubai-300k': {
    en: {
      guideSlug: 'dubai-300k',
      locale: 'en',
      title: 'Is AED 300,000 a Good Salary in Dubai? (0% Tax Analysis)',
      h1: 'Is AED 300,000 a Good Salary in Dubai?',
      directAnswer: 'Yes, AED 300,000 (AED 25,000/month) is an excellent upper-middle salary in Dubai. With 0% income tax, you retain 100% of your earnings, allowing savings of AED 10,000-14,000/month after rent in popular areas like Marina or Downtown.',
      intro: 'Dubai’s tax-free status turns AED 300,000 into pure disposable cash flow, unburdened by statutory payroll tax deductions.',
      breakdownNarrative: 'With zero tax withholding, all AED 25,000 arrives in your bank account monthly. Typical 1-bedroom rents range between AED 6,500 and 8,500/month with utilities and housing fees adding ~AED 1,200.',
      recommendation: 'Negotiate corporate housing allowances or upfront lease support to optimize cash liquidity against annual cheque payments.',
      faq: [
        {
          question: 'Do you pay income tax on AED 300k in Dubai?',
          answer: 'No. The UAE charges 0% personal income tax and 0% employee social security on foreign professionals.',
        },
      ],
      seoTitle: 'Is AED 300k a Good Salary in Dubai? (0% Tax Guide 2026)',
      seoDescription: 'See what AED 300,000 buys in Dubai: 0% tax take-home pay, Marina/Downtown rent, and realistic monthly savings.',
      status: 'PUBLISHED',
    },
    ar: {
      guideSlug: 'dubai-300k',
      locale: 'ar',
      title: 'هل راتب 300 ألف درهم ممتاز في دبي؟ (تحليل الإعفاء الضريبي)',
      h1: 'هل 300,000 درهم سنوياً راتب جيد في دبي؟',
      directAnswer: 'نعم، 300,000 درهم سنوياً (25,000 درهم شهرياً) هو راتب ممتاز يتيح مستوى معيشة راقياً في دبي. مع 0% ضريبة دخل، تحتفظ بكامل الراتب ويمكنك ادخار ما بين 10,000 و14,000 درهم شهرياً.',
      intro: 'تمنحك ميزة الإعفاء الضريبي في دبي قوة مالية استثنائية، حيث لا توجد أي استقطاعات ضريبية على الرواتب.',
      breakdownNarrative: 'يستلم الموظف كامل الـ 25,000 درهم شهرياً في حسابه البنكي. وتتراوح إيجارات الشقق المكونة من غرفة وصالة بين 6,500 و8,500 درهم شهرياً في المناطق الحيوية.',
      recommendation: 'احرص على تنظيم دفعات الإيجار السنوية وإيداع المدخرات الشهرية في أدوات استثمارية آمنة.',
      faq: [
        {
          question: 'هل توجد ضرائب على راتب 300 ألف درهم في دبي؟',
          answer: 'لا، تفرض الإمارات 0% ضريبة على دخل الأفراد الوافدين.',
        },
      ],
      seoTitle: 'هل 300 ألف درهم راتب جيد في دبي؟ دليل الراتب والسكن 2026',
      seoDescription: 'تحليل الراتب والإيجار والادخار لراتب 300 ألف درهم سنوياً في دبي مع 0% ضريبة.',
      status: 'PUBLISHED',
    },
  },
};

export function getLocalizedGuide(guideSlug: string, locale: string): LocalizedGuideContent | null {
  const guideDict = LOCALIZED_GUIDES[guideSlug];
  if (!guideDict) return null;
  return guideDict[locale] || guideDict.en || null;
}
