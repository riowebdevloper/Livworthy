import { getDictionary, SupportedLocale, TIER_1_LOCALES } from '../src/lib/i18n';
import { SUPPORTED_LOCALES } from '../src/lib/i18n/config';
import { LONG_FORM_LOCALES } from '../src/lib/i18n/long-form';
import { getLocalizedCityDisplayName, getLocalizedCountryDisplayName } from '../src/lib/i18n/locations';
import { renderCalculatorEducationalHtml } from '../src/data/calculator-educational-content';

export interface ToolSeoPage {
  relativePath: string;
  canonicalUrl: string;
  title: string;
  description: string;
  robots: 'index, follow' | 'noindex, follow';
  bodyContent: string;
  structuredData: any;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: number;
  lang?: string;
  dir?: 'ltr' | 'rtl';
}

export type CoreToolSlug =
  | 'salary-worth'
  | 'salary-needed'
  | 'salary-after-tax'
  | 'cost-of-living'
  | 'compare'
  | 'job-offers';

export const CORE_TOOL_SLUGS: CoreToolSlug[] = [
  'salary-worth',
  'salary-needed',
  'salary-after-tax',
  'cost-of-living',
  'compare',
  'job-offers',
];

interface ToolMetadataEntry {
  title: string;
  description: string;
  h1: string;
  lead: string;
  passage: string;
}

const TIER1_TOOL_METADATA: Record<string, Record<CoreToolSlug, ToolMetadataEntry>> = {
  en: {
    'salary-worth': {
      title: 'Is My Salary Enough? Living Worth Calculator | LivWorthy',
      description: 'Evaluate what your salary is truly worth after statutory taxes, fair market rent, and living essentials across 65 cities.',
      h1: 'Is My Salary Enough? Living Worth Calculator',
      lead: 'Direct Answer',
      passage: 'A salary is only as valuable as the disposable cash left after mandatory taxes and fair market housing.',
    },
    'salary-needed': {
      title: 'Salary Needed Calculator — Required Income for Living Costs | LivWorthy',
      description: 'Calculate the exact gross salary required to comfortably afford living expenses, fair market rent, and target savings.',
      h1: 'How Much Salary Do You Need?',
      lead: 'Income Requirement Solver',
      passage: 'Inverse mathematical solver computing the gross income required to cover median housing, living costs, and meet healthy savings targets.',
    },
    'salary-after-tax': {
      title: 'Take Home Pay Calculator | Salary After Tax & Paycheck Calculator | LivWorthy',
      description: 'Free take home pay and salary after tax calculator. Calculate exact paycheck withholdings, federal, state, and local income taxes across official tax brackets.',
      h1: 'Take Home Pay & Salary After Tax Calculator',
      lead: 'Statutory Payroll Engine',
      passage: 'Statutory take-home pay and paycheck calculator computing personal income tax, national insurance, FICA, and local withholdings to show your exact net cash earnings.',
    },
    'cost-of-living': {
      title: 'Cost of Living Calculator & City Benchmarks | LivWorthy',
      description: 'Comprehensive breakdown of housing, food, transportation, healthcare, and essential living costs across 65 cities.',
      h1: 'Cost of Living Calculator & City Benchmarks',
      lead: 'Living Cost Intelligence',
      passage: 'Empirical cost of living intelligence evaluating housing, grocery, transit, and healthcare budgets with official benchmarks.',
    },
    compare: {
      title: 'Compare Cities — Cost of Living & Salary Equivalent | LivWorthy',
      description: 'Compare salary purchasing power, tax burdens, and living costs side-by-side between two world cities.',
      h1: 'Compare Cities: Cost of Living & Salary Equivalent',
      lead: 'Bilateral City Comparison',
      passage: 'Direct side-by-side comparison of statutory tax retention, rental costs, and purchasing power between two destinations.',
    },
    'job-offers': {
      title: 'Job Offer Comparison Calculator | LivWorthy',
      description: 'Compare competing job offers factoring in base salary, bonuses, local taxes, relocation costs, and cost of living.',
      h1: 'Compare Job Offers Across Locations',
      lead: 'Total Compensation Evaluator',
      passage: 'Comprehensive compensation analysis evaluating gross pay against statutory tax retention and localized living expenses.',
    },
  },
  es: {
    'salary-worth': {
      title: '¿Alcanza Mi Salario? Calculadora de Valor del Sueldo | LivWorthy',
      description: 'Descubre cuánto rinde tu sueldo en 65 ciudades del mundo tras impuestos oficiales, alquiler HUD y gastos reales.',
      h1: '¿Es Suficiente Mi Salario? Calculadora de Poder Adquisitivo',
      lead: 'Respuesta Directa',
      passage: 'El valor real de un salario no se mide en bruto, sino en el dinero disponible tras impuestos y alquiler.',
    },
    'salary-needed': {
      title: 'Calculadora de Salario Necesario Para Vivir | LivWorthy',
      description: 'Calcula el sueldo bruto necesario para cubrir alquiler, gastos de vida y objetivos de ahorro en cualquier ciudad.',
      h1: '¿Cuánto Salario Necesitas Para Vivir?',
      lead: 'Cálculo de Ingreso Requerido',
      passage: 'Calcula el salario bruto necesario para financiar vivienda, manutención y mantener una tasa saludable de ahorro.',
    },
    'salary-after-tax': {
      title: 'Calculadora de Salario Neto Tras Impuestos | LivWorthy',
      description: 'Calcula con precisión tu salario neto tras retenciones fiscales federales, estatales y seguridad social.',
      h1: 'Calculadora de Salario Neto Tras Impuestos',
      lead: 'Cálculo Fiscal Directo',
      passage: 'Calcula las deducciones de impuestos sobre la renta y seguridad social para determinar tu sueldo neto real.',
    },
    'cost-of-living': {
      title: 'Calculadora de Costo de Vida y Presupuesto Mensual | LivWorthy',
      description: 'Desglose detallado de vivienda, alimentación, transporte y gastos esenciales en 65 ciudades.',
      h1: 'Calculadora de Costo de Vida y Presupuesto',
      lead: 'Costos de Vida Reales',
      passage: 'Datos empíricos de alquiler oficial y precios de consumo para calcular tu presupuesto mensual en cada ciudad.',
    },
    compare: {
      title: 'Comparador de Ciudades: Salario y Costo de Vida | LivWorthy',
      description: 'Compara el poder adquisitivo, carga fiscal y gastos de vida entre dos ciudades internacionales.',
      h1: 'Comparar Ciudades: Salario Equivalente y Costo de Vida',
      lead: 'Comparativa Bilateral',
      passage: 'Comparación directa de retenciones fiscales, alquileres y poder de compra entre dos ciudades.',
    },
    'job-offers': {
      title: 'Comparador de Ofertas de Trabajo y Sueldo Real | LivWorthy',
      description: 'Compara ofertas laborales considerando sueldo base, bonos, impuestos locales y costo de vida.',
      h1: 'Comparar Ofertas de Empleo y Salario',
      lead: 'Evaluador de Compensación Total',
      passage: 'Pondera ofertas brutas frente a retenciones impositivas y costo de vida para calcular el beneficio neto real.',
    },
  },
  fr: {
    'salary-worth': {
      title: 'Mon Salaire est-il Suffisant ? Valeur du Salaire | LivWorthy',
      description: 'Évaluez la valeur réelle de votre salaire net après impôts, loyer et dépenses essentielles dans 65 métropoles.',
      h1: 'Mon Salaire est-il Suffisant ?',
      lead: 'Réponse Directe',
      passage: 'La valeur d’une rémunération dépend de ce qu’il reste après l’impôt sur le revenu et le loyer médian.',
    },
    'salary-needed': {
      title: 'Calculateur de Salaire Nécessaire pour Vivre | LivWorthy',
      description: 'Calculez le salaire brut requis pour financer votre loyer, vos dépenses essentielles et vos objectifs d’épargne.',
      h1: 'Quel Salaire Pour Bien Vivre ?',
      lead: 'Revenu Requis',
      passage: 'Détermine le revenu brut indispensable pour couvrir le logement médian et les charges courantes sans déficit.',
    },
    'salary-after-tax': {
      title: 'Calculateur de Salaire Net Après Impôts | LivWorthy',
      description: 'Calculez votre salaire net exact après prélèvement à la source, cotisations sociales et tranches fiscales.',
      h1: 'Calculateur de Salaire Net Après Impôts',
      lead: 'Calcul Fiscal Direct',
      passage: 'Simule l’impôt sur le revenu et les charges sociales obligatoires pour obtenir votre revenu net disponible.',
    },
    'cost-of-living': {
      title: 'Calculateur du Coût de la Vie & Budget Mensuel | LivWorthy',
      description: 'Analyse détaillée des loyers, de l’alimentation, des transports et de la santé dans 65 métropoles.',
      h1: 'Calculateur du Coût de la Vie',
      lead: 'Indice du Coût de la Vie',
      passage: 'Repères chiffrés sur le logement et les dépenses courantes pour anticiper votre budget réel par ville.',
    },
    compare: {
      title: 'Comparateur de Villes : Salaires et Coût de la Vie | LivWorthy',
      description: 'Comparez le pouvoir d’achat, la fiscalité et le coût de la vie entre deux métropoles mondiales.',
      h1: 'Comparateur de Villes : Coût de la Vie & Pouvoir d’Achat',
      lead: 'Comparaison Bilatérale',
      passage: 'Mise en miroir des prélèvements fiscaux, du logement et du reste à vivre entre deux métropoles.',
    },
    'job-offers': {
      title: 'Comparateur d’Offres d’Emploi & Rémunération | LivWorthy',
      description: 'Comparez deux offres d’embauche en intégrant salaire brut, primes, fiscalité locale et coût de la vie.',
      h1: 'Comparateur d’Offres d’Emploi',
      lead: 'Évaluation Globale de la Rémunération',
      passage: 'Analyse la rémunération brute face aux cotisations et aux dépenses locales pour révéler l’offre la plus avantageuse.',
    },
  },
  ar: {
    'salary-worth': {
      title: 'هل راتبي كافٍ؟ حاسبة القيمة الحقيقية للراتب | ليف ورثي',
      description: 'احسب القيمة الحقيقية لراتبك بعد خصم الضرائب والإيجار والمصاريف في 65 مدينة عالمية.',
      h1: 'هل راتبي كافٍ للعيش في المدينة؟',
      lead: 'إجابة مباشرة',
      passage: 'لا تُقاس قيمة الراتب بالرقم الإجمالي، بل بما يتبقى بعد خصم الضرائب الإلزامية وإيجار السكن العادل.',
    },
    'salary-needed': {
      title: 'حاسبة الراتب المطلوب لتغطية تكاليف المعيشة | ليف ورثي',
      description: 'احسب الراتب الإجمالي المطلوب لتغطية نفقات السكن والمعيشة وتحقيق نسبة ادخار آمنة في مدينتك.',
      h1: 'كم راتب تحتاج للعيش بارتياح؟',
      lead: 'تقدير الدخل المطلوب',
      passage: 'معادلة حسابية عكسية تحدد الراتب الإجمالي اللازم لتحمل تكاليف السكن المعتدل والاحتياجات الأساسية مع الادخار.',
    },
    'salary-after-tax': {
      title: 'حاسبة الراتب الصافي بعد خصم الضرائب | ليف ورثي',
      description: 'احسب راتبك الصافي بدقة بعد استقطاعات ضريبة الدخل والتأمينات الاجتماعية عبر الأنظمة القانونية الرسمية.',
      h1: 'حاسبة الراتب الصافي بعد الضرائب',
      lead: 'حساب ضريبي مباشر',
      passage: 'تحسب ضريبة الدخل النظامية واشتراكات التأمين الاجتماعي لتحديد صافي الدخل الحقيقي بدقة.',
    },
    'cost-of-living': {
      title: 'حاسبة تكلفة المعيشة والمصاريف الشهرية | ليف ورثي',
      description: 'تفصيل شامل لتكاليف الإيجار والغذاء والمواصلات والرعاية الصحية في 65 مدينة عالمية.',
      h1: 'حاسبة تكلفة المعيشة وميزانية المدينة',
      lead: 'مؤشرات المعيشة',
      passage: 'بيانات معيشية حقيقية تقيس تكاليف السكن والسلع الأساسية والمواصلات لتقييم القدرة الشرائية في كل مدينة.',
    },
    compare: {
      title: 'مقارنة المدن: تكلفة المعيشة والراتب المكافئ | ليف ورثي',
      description: 'قارن القدرة الشرائية للرواتب والعبء الضريبي ونفقات المعيشة جنباً إلى جنب بين مدينتين عالميتين.',
      h1: 'مقارنة المدن: تكلفة المعيشة والراتب المكافئ',
      lead: 'مقارنة ثنائية للمدن',
      passage: 'مقارنة مباشرة بين الأنظمة الضريبية وأسعار الإيجارات والقدرة الشرائية بين وجهتين مختلفتين.',
    },
    'job-offers': {
      title: 'مقارنة عروض العمل والتعويضات الحقيقية | ليف ورثي',
      description: 'قارن بين عروض التوظيف المتنافسة مع احتساب الراتب الأساسي والمكافآت والضرائب وتكاليف المعيشة.',
      h1: 'مقارنة عروض العمل والرواتب',
      lead: 'تقييم الحزمة المالية الإجمالية',
      passage: 'يحلل العروض الوظيفية مقابل الأنظمة الضريبية ونفقات السكن لكشف العرض الأفضل فعلياً.',
    },
  },
  de: {
    'salary-worth': {
      title: 'Reicht mein Gehalt? Lebenswert-Rechner | LivWorthy',
      description: 'Berechnen Sie, was Ihr Gehalt nach Steuern, Miete und Lebenshaltungskosten in 65 Städten wirklich wert ist.',
      h1: 'Reicht mein Gehalt zum Leben?',
      lead: 'Direkte Antwort',
      passage: 'Der reale Wert eines Gehalts bemisst sich an der verbleibenden Kaufkraft nach Steuern und Miete.',
    },
    'salary-needed': {
      title: 'Benötigtes Gehalt Berechnen — Einkommensrechner | LivWorthy',
      description: 'Ermitteln Sie das erforderliche Bruttogehalt zur Deckung von Mietkosten, Lebenshaltung und gewünschter Sparrate.',
      h1: 'Wie viel Gehalt brauchen Sie zum Leben?',
      lead: 'Einkommensbedarf',
      passage: 'Inverser Rechner zur Ermittlung des notwendigen Bruttoeinkommens für Miete, Lebenshaltung und nachhaltiges Sparen.',
    },
    'salary-after-tax': {
      title: 'Nettolohn-Rechner nach Steuern & Sozialabgaben | LivWorthy',
      description: 'Berechnen Sie Ihr exaktes Nettogehalt nach Lohnsteuer, Solidaritätszuschlag und Sozialversicherungsbeiträgen.',
      h1: 'Nettolohn-Rechner nach Steuern',
      lead: 'Direkte Steuerberechnung',
      passage: 'Berechnet gesetzliche Einkommensteuertarife und Sozialabgaben zur Ermittlung des tatsächlichen Nettoeinkommens.',
    },
    'cost-of-living': {
      title: 'Lebenshaltungskosten-Rechner & Städte-Vergleich | LivWorthy',
      description: 'Detaillierte Aufschlüsselung von Miete, Lebensmitteln, Mobilität und Gesundheitskosten in 65 Städten.',
      h1: 'Lebenshaltungskosten-Rechner',
      lead: 'Lebenshaltungskosten',
      passage: 'Fundierte Kostendaten zu Wohnungsmieten und Lebenshaltung zur realistischen Einschätzung Ihres Monatsbudgets.',
    },
    compare: {
      title: 'Städtevergleich: Gehalt & Lebenshaltungskosten | LivWorthy',
      description: 'Vergleichen Sie Kaufkraft, Steuerlast und Mietpreise zweier Städte direkt miteinander.',
      h1: 'Städte vergleichen: Gehaltsäquivalent & Lebenshaltung',
      lead: 'Bilateraler Städtevergleich',
      passage: 'Direkter Vergleich von Nettogehalt, Miete und realer Kaufkraft zwischen zwei Zielorten.',
    },
    'job-offers': {
      title: 'Jobangebot-Vergleich & Reale Gesamtvergütung | LivWorthy',
      description: 'Vergleichen Sie konkurrierende Jobangebote unter Berücksichtigung von Grundgehalt, Boni, Steuern und Wohnkosten.',
      h1: 'Jobangebote vergleichen',
      lead: 'Gesamtvergütungsvergleich',
      passage: 'Bewertet Bruttoangebote gegenüber gesetzlichen Abzügen und lokalen Lebenshaltungskosten.',
    },
  },
  pt: {
    'salary-worth': {
      title: 'Meu Salário é Suficiente? Calculadora de Poder de Compra | LivWorthy',
      description: 'Calcule o poder de compra real do seu salário após impostos, aluguel e despesas essenciais em 65 cidades.',
      h1: 'Meu Salário é Suficiente Para Viver Bem?',
      lead: 'Resposta Direta',
      passage: 'O poder de compra de um salário é determinado pelo saldo disponível após descontos obrigatórios e moradia.',
    },
    'salary-needed': {
      title: 'Calculadora de Salário Necessário Para Viver | LivWorthy',
      description: 'Calcule a renda bruta necessária para cobrir aluguel, despesas essenciais e metas de poupança na sua cidade.',
      h1: 'Quanto Salário Você Precisa Para Viver?',
      lead: 'Renda Necessária',
      passage: 'Modelo inverso que calcula o salário bruto exigido para moradia digna, alimentação e reserva financeira.',
    },
    'salary-after-tax': {
      title: 'Calculadora de Salário Líquido Após Impostos | LivWorthy',
      description: 'Calcule seu salário líquido exato após deduções do IRPF, seguridade social e contribuições oficiais.',
      h1: 'Calculadora de Salário Líquido Após Impostos',
      lead: 'Cálculo Fiscal Direto',
      passage: 'Dedução progressiva de imposto de renda e encargos sociais para calcular o rendimento líquido real.',
    },
    'cost-of-living': {
      title: 'Calculadora de Custo de Vida e Despesas Mensais | LivWorthy',
      description: 'Detalhamento completo de moradia, alimentação, transporte e saúde em 65 cidades pelo mundo.',
      h1: 'Calculadora de Custo de Vida',
      lead: 'Orçamento e Custo de Vida',
      passage: 'Métricas oficiais de aluguel e despesas recorrentes para planejamento orçamentário transparente.',
    },
    compare: {
      title: 'Comparador de Cidades: Salário e Custo de Vida | LivWorthy',
      description: 'Compare o poder de compra, impostos e despesas de moradia entre duas cidades do mundo.',
      h1: 'Comparar Cidades: Salário Equivalente e Custo de Vida',
      lead: 'Comparativo Bilateral',
      passage: 'Análise lado a lado de retenção tributária, moradia e poder de compra real.',
    },
    'job-offers': {
      title: 'Comparador de Propostas de Emprego e Salário Real | LivWorthy',
      description: 'Compare propostas de emprego considerando salário base, bônus, tributação e custo de vida no destino.',
      h1: 'Comparar Propostas de Emprego',
      lead: 'Avaliador de Remuneração Total',
      passage: 'Analisa o pacote salarial frente a impostos e despesas essenciais para revelar a proposta mais vantajosa.',
    },
  },
  hi: {
    'salary-worth': {
      title: 'क्या मेरी सैलरी पर्याप्त है? क्रय शक्ति कैलकुलेटर | लिववर्दी',
      description: 'जानिए आधिकारिक टैक्स, किराया और आवश्यक खर्चों के बाद 65 वैश्विक शहरों में आपकी सैलरी की वास्तविक बचत क्या है।',
      h1: 'क्या मेरा वेतन पर्याप्त है?',
      lead: 'सीधा उत्तर',
      passage: 'सैलरी का वास्तविक महत्व केवल ग्रॉस पैकेज में नहीं, बल्कि टैक्स और मकान किराए के बाद बचने वाले इन-हैंड कैश में होता है।',
    },
    'salary-needed': {
      title: 'रहने के लिए कितनी सैलरी चाहिए — आवश्यकता कैलकुलेटर | लिववर्दी',
      description: 'जानिए अपने शहर में किराया, घरेलू खर्च और सुरक्षित बचत के लिए आपको कितने ग्रॉस वेतन की आवश्यकता है।',
      h1: 'रहने के लिए कितनी सैलरी चाहिए?',
      lead: 'आवश्यक आय का हिसाब',
      passage: 'मकान किराए और आवश्यक पारिवारिक खर्चों को कवर करने के लिए जरूरी सकल आय का सटीक निर्धारण।',
    },
    'salary-after-tax': {
      title: 'टैक्स के बाद इन-हैंड सैलरी कैलकुलेटर | लिववर्दी',
      description: 'आधिकारिक इनकम टैक्स और सामाजिक सुरक्षा कटौती के बाद अपनी सटीक इन-हैंड नेट सैलरी की गणना करें।',
      h1: 'टैक्स के बाद सैलरी कैलकुलेटर',
      lead: 'सीधा टैक्स हिसाब',
      passage: 'आधिकारिक टैक्स स्लैब और कटौतियों के आधार पर वास्तविक इन-हैंड मासिक और वार्षिक वेतन की गणना करता है।',
    },
    'cost-of-living': {
      title: 'रहने का खर्च कैलकुलेटर और शहरों की लागत | लिववर्दी',
      description: '65 शहरों में किराए, भोजन, परिवहन और दैनिक जीवन के खर्चों का संपूर्ण और प्रामाणिक विवरण।',
      h1: 'रहने का खर्च कैलकुलेटर',
      lead: 'मासिक जीवन यापन लागत',
      passage: 'आधिकारिक किराया मानकों और आवश्यक वस्तुओं की कीमतों के आधार पर वास्तविक जीवन यापन लागत का विश्लेषण।',
    },
    compare: {
      title: 'दो शहरों की तुलना: वेतन और रहने का खर्च | लिववर्दी',
      description: 'दो वैश्विक शहरों के बीच टैक्स, किराए और वास्तविक क्रय शक्ति की आमने-सामने तुलना करें।',
      h1: 'शहरों की तुलना: समान वेतन और रहने का खर्च',
      lead: 'दोहरा शहर तुलनात्मक विश्लेषण',
      passage: 'टैक्स कटौती, किराया स्तर और बचत क्षमता के आधार पर दो शहरों के बीच सीधा वित्तीय तुलनात्मक विश्लेषण।',
    },
    'job-offers': {
      title: 'जॉब ऑफर तुलना कैलकुलेटर और वास्तविक बचत | लिववर्दी',
      description: 'अलग-अलग शहरों के जॉब ऑफर्स की तुलना करें — टैक्स, किराया, बोनस और वास्तविक बचत क्षमता के साथ।',
      h1: 'जॉब ऑफर तुलना कैलकुलेटर',
      lead: 'कुल पैकेज और इन-हैंड तुलना',
      passage: 'सकल वेतन, टैक्स देनदारी और स्थानीय जीवन लागत को ध्यान में रखकर सर्वश्रेष्ठ करियर ऑफर का विश्लेषण।',
    },
  },
  ur: {
    'salary-worth': {
      title: 'کیا میری تنخواہ کافی ہے؟ حقیقی قدر کیلکولیٹر | لِو ورتھی',
      description: 'جانئے ٹیکس کٹوتیوں، کرایہ اور لازمی اخراجات کے بعد 65 عالمی شہروں میں آپ کی تنخواہ کی حقیقی بچت کتنی ہے۔',
      h1: 'کیا میری تنخواہ کافی ہے؟',
      lead: 'براہ راست جواب',
      passage: 'کسی بھی تنخواہ کی اصل قدر اس رقم سے ناپی جاتی ہے جو لازمی انکم ٹیکس اور رہائشی کرایہ ادا کرنے کے بعد ہاتھ میں بچتی ہے۔',
    },
    'salary-needed': {
      title: 'باعزت گزارے کے لیے درکار تنخواہ کیلکولیٹر | لِو ورتھی',
      description: 'معلوم کریں کہ رہائشی کرایہ، اخراجات اور بچت کے لیے آپ کو کتنی مجموعی تنخواہ درکار ہے۔',
      h1: 'رہائش کے لیے کتنی تنخواہ درکار ہے؟',
      lead: 'لازمی آمدنی کا تعین',
      passage: 'گھر کے کرائے اور روزمرہ نفقات کو پورا کرنے کے لیے درکار مجموعی تنخواہ کا درست حسابی تعین۔',
    },
    'salary-after-tax': {
      title: 'ٹیکس کٹوتی کے بعد خالص تنخواہ کیلکولیٹر | لِو ورتھی',
      description: 'سرکاری انکم ٹیکس سلیبس اور سوشل سیکورٹی کٹوتیوں کے بعد اپنی درست خالص تنخواہ معلوم کریں۔',
      h1: 'ٹیکس کے بعد خالص تنخواہ کیلکولیٹر',
      lead: 'براہ راست ٹیکس تخمینہ',
      passage: 'سرکاری انکم ٹیکس قوانین اور کٹوتیوں کو لاگو کر کے درست ان ہینڈ تنخواہ کا حساب لگاتا ہے۔',
    },
    'cost-of-living': {
      title: 'رہائشی اخراجات کیلکولیٹر اور ماہانہ بجٹ | لِو ورتھی',
      description: '65 عالمی شہروں میں کرایہ، خوراک، ٹرانسپورٹ اور بنیادی اخراجات کا جامع و مستند تجزیہ۔',
      h1: 'رہائشی اخراجات اور ماہانہ بجٹ کیلکولیٹر',
      lead: 'ماہانہ رہائشی اخراجات',
      passage: 'شہر کے مستند کرایوں اور بنیادی اشیاء کی بنیاد پر ماہانہ اخراجات کا حقیقت پسندانہ تخمینہ۔',
    },
    compare: {
      title: 'دو شہروں کا موازنہ: تنخواہ اور رہائشی اخراجات | لِو ورتھی',
      description: 'دو شہروں کے درمیان ٹیکس بوجھ، کرایہ اور قوت خرید کا براہ راست اور مستند موازنہ کریں۔',
      h1: 'شہروں کا موازنہ: متبادل تنخواہ اور رہائشی لاگت',
      lead: 'دو طرفہ شہری موازنہ',
      passage: 'دو مقامات کے مابین ٹیکس، مکان کے کرایوں اور قوت خرید کا واضح اور تقابلی جائزہ۔',
    },
    'job-offers': {
      title: 'ملازمت کی پیشکشوں کا تقابلی جائزہ | لِو ورتھی',
      description: 'مختلف ملازمتوں کی پیشکشوں کا تقابل کریں بشمول بنیادی تنخواہ، بونس، مقامی ٹیکس اور اخراجات۔',
      h1: 'جاب آفر موازنہ کیلکولیٹر',
      lead: 'مجموعی معاوضے کا تجزیہ',
      passage: 'تنخواہ کی پیشکشوں کو ٹیکس اور رہائشی اخراجات کے پس منظر میں پرکھ کر حقیقی مالی فائدے کا تعین۔',
    },
  },
  zh: {
    'salary-worth': {
      title: '我的薪水够用吗？实际购买力测算 | LivWorthy',
      description: '计算扣除法定税费、公允租金和必要生活开支后，全球65座核心城市的真实可支配薪资与储蓄。',
      h1: '我的薪水够用吗？薪资价值评估',
      lead: '核心摘要',
      passage: '薪资的真实购买力取决于扣除所得税、社保以及中位数房租后的实际结余。',
    },
    'salary-needed': {
      title: '舒适生活所需薪资计算器 | LivWorthy',
      description: '计算在目标城市覆盖公允中位数租金、必要开支并保持合理储蓄所需的税前薪资。',
      h1: '在城市生活需要多少薪资？',
      lead: '薪资门槛计算',
      passage: '逆向测算覆盖房租、生活成本并达到健康储蓄率所需的税前年薪与月薪基准。',
    },
    'salary-after-tax': {
      title: '法定税后净收入与个税计算器 | LivWorthy',
      description: '精确计算扣除法定个人所得税、社会保障金及各项扣除后的实际到手税后工资。',
      h1: '税后净收入计算器',
      lead: '法定个税直算',
      passage: '基于官方阶梯税率与法定社保标准，精确计算每月及每年实际可支配到手薪资。',
    },
    'cost-of-living': {
      title: '生活成本计算器与城市物价指数 | LivWorthy',
      description: '详细拆解全球65座核心城市的公允住房、餐饮食品、公共交通及医疗等必要开销。',
      h1: '城市生活成本与开支计算器',
      lead: '生活成本实测',
      passage: '基于官方租金与城市消费价格模型，全景呈现各城市的单人与家庭每月实际开支。',
    },
    compare: {
      title: '双城对比：生活成本与等效薪资测算 | LivWorthy',
      description: '横向对比两座国际都市的法定税负、住房租金及实际购买力平价。',
      h1: '城市对比：生活成本与对等薪资',
      lead: '城市双向对比',
      passage: '直接对比两座城市的税后薪酬保留率、房租负担以及维持同等生活品质所需的薪酬。',
    },
    'job-offers': {
      title: '求职录用薪酬对比计算器 | LivWorthy',
      description: '横向对比不同城市的多份工作录取信，综合考量基本薪资、奖金、法定个税及居住成本。',
      h1: '录取薪酬对比：真实所得评估',
      lead: '全面薪酬评估',
      passage: '综合评估基本工资、绩效奖金与当地法定税率及房租，揭示哪份工作能带来更高的实际可支配储蓄。',
    },
  },
  ja: {
    'salary-worth': {
      title: '今の給料で足りる？給与の真の価値シミュレーター | LivWorthy',
      description: '法定税金・適正家賃・生活費を差し引いた後、世界65都市での実質的な手取り給与と貯蓄余力をシミュレーション。',
      h1: '今の給与で生活できますか？',
      lead: '要約・回答',
      passage: '給与の真の価値は、法定税金・社会保険料および住居費を控除した後に残る可処分所得によって決まります。',
    },
    'salary-needed': {
      title: '必要年収シミュレーター・生活に必要な給与水準 | LivWorthy',
      description: '希望都市での適正家賃、生活必需費、目標貯蓄を賄うために必要な総支給額（年収・月収）を試算します。',
      h1: '生活に必要な給与はいくらですか？',
      lead: '必要年収の試算',
      passage: '標準的な家賃水準と生活必需費を安定して維持するために必要な額面年収を逆算します。',
    },
    'salary-after-tax': {
      title: '手取り給与・税金社会保険料計算シミュレーター | LivWorthy',
      description: '所得税・住民税および社会保険料の法定控除後の実質手取り額を正確に試算します。',
      h1: '税引後手取り給与シミュレーター',
      lead: '法定控除後の手取り計算',
      passage: '所得税・住民税・社会保険料を控除した後の実質的な手取り給与と可処分所得を正確に算出します。',
    },
    'cost-of-living': {
      title: '生活費シミュレーター・世界各都市の物価水準 | LivWorthy',
      description: '世界65都市における家賃、食費、交通費、医療費など主要な生活費の内訳をシミュレーション。',
      h1: '生活費シミュレーターと都市別物価指数',
      lead: '生活費の内訳分析',
      passage: '公的データに基づく家賃と基礎生活必需費を体系化し、都市ごとの実質的な生活費を算出します。',
    },
    compare: {
      title: '都市間比較シミュレーター・給与と生活費の対比 | LivWorthy',
      description: '2つの世界主要都市間で税負担、家賃、実質的な購買力を並列比較します。',
      h1: '都市比較：生活費と必要等価給与',
      lead: '2都市の対比検証',
      passage: '都市間の税率差、家賃水準、可処分所得を直接比較し、同等の生活水準を維持する等価給与を算出します。',
    },
    'job-offers': {
      title: '内定・求人オファー比較シミュレーター | LivWorthy',
      description: '基本給、賞与、現地税制、生活費を総合的に加味し、競合するオファーの実質的な価値を比較します。',
      h1: '求人オファー比較シミュレーター',
      lead: '総合報酬・実質手取りの評価',
      passage: '総支給額のみにとらわれず、各都市の税負担と生活費を控除した真の可処分所得を対比します。',
    },
  },
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createLocalizedToolPages(baseUrl: string): ToolSeoPage[] {
  const pages: ToolSeoPage[] = [];
  const tier1Set = new Set(TIER_1_LOCALES);

  for (const loc of LONG_FORM_LOCALES) {
    const cfg = SUPPORTED_LOCALES[loc];
    if (!cfg) continue;
    const isTier1 = tier1Set.has(loc as any);
    const isRtl = cfg.dir === 'rtl';
    const dict = getDictionary(loc);
    const robotsDirective: 'index, follow' | 'noindex, follow' = isTier1
      ? 'index, follow'
      : 'noindex, follow';

    for (const tool of CORE_TOOL_SLUGS) {
      // Resolve localized metadata
      const meta =
        TIER1_TOOL_METADATA[loc]?.[tool] ||
        (loc === 'en'
          ? TIER1_TOOL_METADATA.en[tool]
          : {
              title: `${dict.nav[getTabNavKey(tool)]} | LivWorthy`,
              description: `${dict.calculator.heroSubheadline} — ${dict.calculator.heroSupporting}`,
              h1: dict.nav[getTabNavKey(tool)],
              lead: dict.common.evidence,
              passage: `${dict.calculator.heroSubheadline} ${dict.calculator.heroSupporting}`,
            });

      const structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            '@id': `${baseUrl}/${loc}/${tool}#webpage`,
            url: `${baseUrl}/${loc}/${tool}`,
            name: meta.title,
            description: meta.description,
            inLanguage: cfg.intlLocale || loc,
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${baseUrl}/#website`,
              name: 'LivWorthy',
              url: baseUrl,
            },
          },
          {
            '@type': 'WebApplication',
            '@id': `${baseUrl}/${loc}/${tool}#app`,
            name: meta.h1,
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'All Modern Web Browsers',
            inLanguage: cfg.intlLocale || loc,
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          },
        ],
      };

      const bodyContent = `
        <div class="min-h-screen flex flex-col bg-[#F7F8F5]" ${isRtl ? 'dir="rtl"' : ''}>
          <header id="livworthy-header" class="bg-[#FFFFFF] border-b border-[#DCE3E0] sticky top-0 z-40">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex items-center justify-between h-16">
                <a href="/${loc}" id="header-logo-link" class="flex items-center space-x-3 group py-1" aria-label="LivWorthy">
                  <picture>
                    <source type="image/webp" srcset="/logo-300.webp 1x, /logo-600.webp 2x" />
                    <img src="/logo-300.png" srcset="/logo-300.png 1x, /logo-600.png 2x" alt="LivWorthy" width="108" height="36" class="h-9 w-auto object-contain" />
                  </picture>
                  <span class="text-xs font-semibold uppercase tracking-wider text-[#167D75] border-l border-[#DCE3E0] pl-3 hidden sm:inline">${escapeHtml(dict.common.livingIntelligence)}</span>
                </a>
                <nav aria-label="Site navigation" class="flex items-center space-x-2 sm:space-x-3">
                  <a href="/methodology" class="inline-flex items-center text-xs sm:text-sm font-medium text-[#334D4A] hover:text-[#102A2E] px-2.5 py-1.5 rounded border border-[#DCE3E0] hover:bg-[#F7F8F5]">
                    <span>${escapeHtml(dict.nav.howItWorks)}</span>
                  </a>
                  <a href="/sources" class="inline-flex items-center text-xs sm:text-sm font-medium text-[#334D4A] hover:text-[#102A2E] px-2.5 py-1.5 rounded border border-[#DCE3E0] hover:bg-[#F7F8F5]">
                    <span>${escapeHtml(dict.nav.sources)}</span>
                  </a>
                  <a href="/coverage" class="hidden sm:inline-flex items-center text-xs sm:text-sm font-medium text-[#334D4A] hover:text-[#102A2E] px-2.5 py-1.5 rounded border border-[#DCE3E0] hover:bg-[#F7F8F5]">
                    <span>${escapeHtml(dict.nav.coverage)}</span>
                  </a>
                </nav>
              </div>
              <nav aria-label="Calculator tabs" class="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-[#F7F8F5] bg-white">
                <a href="/${loc}" id="tab-salary-worth" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap ${tool === 'salary-worth' ? 'bg-[#102A2E] text-white shadow-sm' : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'}">
                  <span>${escapeHtml(dict.nav.tabSalaryWorth)}</span>
                </a>
                <a href="/${loc}/salary-needed" id="tab-salary-needed" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap ${tool === 'salary-needed' ? 'bg-[#102A2E] text-white shadow-sm' : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'}">
                  <span>${escapeHtml(dict.nav.tabSalaryNeeded)}</span>
                </a>
                <a href="/${loc}/salary-after-tax" id="tab-salary-after-tax" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap ${tool === 'salary-after-tax' ? 'bg-[#102A2E] text-white shadow-sm' : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'}">
                  <span>${escapeHtml(dict.nav.tabSalaryAfterTax)}</span>
                </a>
                <a href="/${loc}/cost-of-living" id="tab-cost-of-living" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap ${tool === 'cost-of-living' ? 'bg-[#102A2E] text-white shadow-sm' : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'}">
                  <span>${escapeHtml(dict.nav.tabCostOfLiving)}</span>
                </a>
                <a href="/${loc}/compare" id="tab-compare" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap ${tool === 'compare' ? 'bg-[#102A2E] text-white shadow-sm' : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'}">
                  <span>${escapeHtml(dict.nav.tabCompare)}</span>
                </a>
                <a href="/${loc}/job-offers" id="tab-job-offers" class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap ${tool === 'job-offers' ? 'bg-[#102A2E] text-white shadow-sm' : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'}">
                  <span>${escapeHtml(dict.nav.tabJobOffers)}</span>
                </a>
              </nav>
            </div>
          </header>

          <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="space-y-8">
              <!-- Direct Answer Block -->
              <div class="direct-answer bg-[#E8F3F1] border border-[#BCE1DC] rounded-2xl p-5 sm:p-6 shadow-xs">
                <p class="text-xs sm:text-sm text-[#102A2E] leading-relaxed">
                  <strong class="font-bold text-[#167D75]">${escapeHtml(meta.lead)}:</strong> ${escapeHtml(meta.passage)}
                </p>
              </div>

              <!-- Hero Section -->
              <div class="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs relative">
                <div class="max-w-2xl">
                  <span class="text-xs font-bold tracking-wider text-[#167D75]">
                    ${escapeHtml(dict.common.livingIntelligence)}
                  </span>
                  <h1 class="text-3xl sm:text-4xl font-extrabold text-[#102A2E] mt-1 tracking-tight">
                    ${escapeHtml(meta.h1)}
                  </h1>
                  <p class="text-sm sm:text-base text-[#60706D] mt-2 leading-relaxed">
                    ${escapeHtml(meta.description)}
                  </p>
                </div>

                <!-- Scenario Badges -->
                <div class="mt-5 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                  <span class="text-xs font-semibold text-[#60706D] whitespace-nowrap">
                    ${escapeHtml(dict.calculator.popularScenarios)}:
                  </span>
                  <div class="flex items-center space-x-1.5">
                    <a href="/cities/nyc" class="text-xs px-2.5 py-1 rounded-full border bg-[#102A2E] text-white border-[#102A2E] hover:opacity-90">
                      ${escapeHtml(getLocalizedCityDisplayName('nyc', loc))} ($100k)
                    </a>
                    <a href="/cities/london" class="text-xs px-2.5 py-1 rounded-full border bg-[#F7F8F5] text-[#102A2E] border-[#DCE3E0] hover:bg-[#EAEFEA]">
                      ${escapeHtml(getLocalizedCityDisplayName('london', loc))} (£60k)
                    </a>
                    <a href="/cities/dubai" class="text-xs px-2.5 py-1 rounded-full border bg-[#F7F8F5] text-[#102A2E] border-[#DCE3E0] hover:bg-[#EAEFEA]">
                      ${escapeHtml(getLocalizedCityDisplayName('dubai', loc))} (300k AED)
                    </a>
                    <a href="/cities/toronto" class="text-xs px-2.5 py-1 rounded-full border bg-[#F7F8F5] text-[#102A2E] border-[#DCE3E0] hover:bg-[#EAEFEA]">
                      ${escapeHtml(getLocalizedCityDisplayName('toronto', loc))} (CA$90k)
                    </a>
                  </div>
                </div>
              </div>

              <!-- Interactive Application Mounting Point -->
              <div id="root" class="min-h-[400px]">
                <div class="bg-white rounded-2xl border border-[#DCE3E0] p-8 text-center text-[#60706D]">
                  <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E8F3F1] text-[#167D75] mb-4">
                    <svg class="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <h2 class="text-lg font-bold text-[#102A2E] mb-2">${escapeHtml(meta.h1)}</h2>
                  <p class="text-sm max-w-md mx-auto leading-relaxed">${escapeHtml(dict.common.calculating)}</p>
                </div>
              </div>

              <!-- Supporting Educational and Trust Section -->
              <section class="bg-white rounded-2xl border border-[#DCE3E0] p-6 sm:p-8">
                <h2 class="text-xl font-bold text-[#102A2E] mb-3">
                  ${escapeHtml(dict.common.verifiedTaxBaseline)}
                </h2>
                <p class="text-sm text-[#60706D] leading-relaxed mb-4">
                  ${escapeHtml(dict.common.disclaimer)}
                </p>

                ${loc === 'en' ? renderCalculatorEducationalHtml(tool) : ''}

                <div class="mt-8 pt-6 border-t border-[#DCE3E0] flex flex-wrap gap-2 text-xs">
                  <a href="/methodology" class="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#DCE3E0] hover:bg-[#F7F8F5] text-[#102A2E] font-medium">
                    ${escapeHtml(dict.common.methodology)} →
                  </a>
                  <a href="/sources" class="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#DCE3E0] hover:bg-[#F7F8F5] text-[#102A2E] font-medium">
                    ${escapeHtml(dict.common.evidence)} →
                  </a>
                  <a href="/countries" class="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#DCE3E0] hover:bg-[#F7F8F5] text-[#102A2E] font-medium">
                    ${escapeHtml(dict.footer.countriesDirectory)} →
                  </a>
                  <a href="/cities" class="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#DCE3E0] hover:bg-[#F7F8F5] text-[#102A2E] font-medium">
                    ${escapeHtml(dict.footer.citiesDirectory)} →
                  </a>
                </div>
              </section>
            </div>
          </main>

          <footer class="bg-white border-t border-[#DCE3E0] py-8 mt-12">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#60706D]">
              <p>© ${new Date().getFullYear()} ${escapeHtml(dict.footer.copyright)}</p>
              <div class="flex flex-wrap justify-center gap-4">
                <a href="/about" class="hover:underline">${escapeHtml(dict.footer.aboutLivworthy)}</a>
                <a href="/methodology" class="hover:underline">${escapeHtml(dict.common.methodology)}</a>
                <a href="/sources" class="hover:underline">${escapeHtml(dict.common.evidence)}</a>
                <a href="/privacy" class="hover:underline">Privacy Policy</a>
                <a href="/terms" class="hover:underline">Terms & Disclaimer</a>
              </div>
            </div>
          </footer>
        </div>
      `;

      // Standard localized route: /es/salary-after-tax/index.html
      // Standard localized route: /es/salary-after-tax/index.html
      // For English, root /<tool> is canonical and indexable; duplicate /en/<tool> must be noindex
      pages.push({
        relativePath: `${loc}/${tool}/index.html`,
        canonicalUrl: `${baseUrl}/${loc}/${tool}`,
        title: meta.title,
        description: meta.description,
        robots: loc === 'en' ? 'noindex, follow' : robotsDirective,
        bodyContent,
        structuredData,
        changefreq: 'weekly',
        priority: 0.9,
        lang: loc,
        dir: cfg.dir,
      });

      // For English, emit also root route: /salary-after-tax/index.html
      if (loc === 'en') {
        pages.push({
          relativePath: `${tool}/index.html`,
          canonicalUrl: `${baseUrl}/${tool}`,
          title: meta.title,
          description: meta.description,
          robots: 'index, follow',
          bodyContent,
          structuredData,
          changefreq: 'weekly',
          priority: 0.95,
          lang: 'en',
          dir: 'ltr',
        });
      }
    }
  }

  return pages;
}

function getTabNavKey(tool: CoreToolSlug): keyof import('../src/lib/i18n').I18nNavTranslations {
  switch (tool) {
    case 'salary-worth':
      return 'tabSalaryWorth';
    case 'salary-needed':
      return 'tabSalaryNeeded';
    case 'salary-after-tax':
      return 'tabSalaryAfterTax';
    case 'cost-of-living':
      return 'tabCostOfLiving';
    case 'compare':
      return 'tabCompare';
    case 'job-offers':
      return 'tabJobOffers';
  }
}

function getToolEducationalHtml(tool: CoreToolSlug): string {
  return renderCalculatorEducationalHtml(tool);
}

