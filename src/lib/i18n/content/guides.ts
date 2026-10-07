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
      intro: 'In New York City, six-figure earnings are widely considered the benchmark for financial independence. However, the triple-tier tax system and high rental costs require disciplined budget management.',
      breakdownNarrative: 'A gross salary of $100,000 faces an effective tax rate of approximately 29.6% ($2,467/month in combined withholdings). Housing absorbs approximately 40% of net take-home pay for an independent renter in Brooklyn or Queens.',
      recommendation: 'Target an apartment under $2,400/month or consider living with a flatmate in prime Manhattan to maximize your annual savings rate above 20%.',
      faq: [
        {
          question: 'What is the net monthly take-home pay for $100k in NYC?',
          answer: 'Approximately $5,862 per month for a single filer claiming standard deductions under 2026 statutory tax law.',
        },
        {
          question: 'Can you live alone on $100k in Manhattan?',
          answer: 'Yes, in neighborhoods like Upper East Side, Inwood, or Washington Heights, though inventory under the 40x rent rule ($2,500/mo) is competitive.',
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
      directAnswer: 'Sí, $100.000 es un salario viable y moderado para una persona soltera en NYC. Tras impuestos federales, estatales y municipales, el ingreso neto mensual ronda los $5.862, dejando unos $1.540 al mes para ahorro tras cubrir alquiler y gastos básicos.',
      intro: 'En Nueva York, superar las seis cifras es la meta tradicional para la independencia financiera. Sin embargo, la triple retención fiscal y los altos alquileres exigen un presupuesto riguroso.',
      breakdownNarrative: 'Un sueldo bruto de $100.000 enfrenta una tasa impositiva efectiva de casi el 29,6%. La vivienda absorbe cerca del 40% del salario neto para quienes alquilan en Brooklyn o Queens.',
      recommendation: 'Busque opciones de alquiler por debajo de $2.400 al mes o comparta apartamento en Manhattan para mantener una tasa de ahorro superior al 20%.',
      faq: [
        {
          question: '¿Cuánto queda en mano al mes con $100k en Nueva York?',
          answer: 'Aproximadamente $5.862 al mes para un contribuyente soltero con deducción estándar en 2026.',
        },
        {
          question: '¿Se puede vivir solo en Manhattan con $100k?',
          answer: 'Sí, en zonas como el Upper East Side o Washington Heights, cumpliendo la regla del 40x de ingresos sobre el alquiler ($2.500/mes).',
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
      directAnswer: 'Oui, 100 000 $ est un salaire convenable pour un célibataire à New York. Après déduction des impôts fédéral, de l’État et de la ville, le salaire net mensuel est d’environ 5 862 $, permettant d’épargner 1 540 $ après loyer médian.',
      intro: 'À New York, atteindre six chiffres est souvent perçu comme le seuil d’autonomie financière. La triple imposition locale et les loyers élevés réduisent toutefois la marge de manœuvre.',
      breakdownNarrative: 'Le taux effectif d’imposition atteint environ 29,6 %. Le logement absorbe environ 40 % du revenu net pour un appartement d’une chambre à Brooklyn ou Queens.',
      recommendation: 'Visez un loyer inférieur à 2 400 $ ou la colocation à Manhattan pour préserver une capacité d’épargne saine.',
      faq: [
        {
          question: 'Quel est le salaire net mensuel pour 100k $ à NYC ?',
          answer: 'Environ 5 862 $ par mois pour un célibataire avec déduction forfaitaire en 2026.',
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
      directAnswer: 'نعم، 100,000 دولار هو راتب جيد ومعتدل لشخص بمفرده. يبلغ صافي الدخل الشهري حوالي 5,862 دولاراً بعد الضرائب، مع فائض ادخاري يقارب 1,540 دولاراً بعد دفع الإيجار والمصاريف الأساسية.',
      intro: 'في مدينة نيويورك، يعتبر الوصول لراتب من ست خانات معياراً للاستقرار المالي، إلا أن الضرائب الثلاثية والإيجارات المرتفعة تتطلب إدارة مالية دقيقة.',
      breakdownNarrative: 'يصل معدل الضريبة الفعلي إلى حوالي 29.6%. ويستحوذ السكن على نحو 40% من صافي الدخل في بروكلين وكوينز.',
      recommendation: 'اختر سكناً بإيجار شهري لا يتجاوز 2,400 دولار للحفاظ على نسبة ادخار تفوق 20%.',
      faq: [
        {
          question: 'كم يبلغ صافي الراتب الشهري لـ 100 ألف دولار في نيويورك؟',
          answer: 'حوالي 5,862 دولاراً شهرياً للشخص الأعزب في عام 2026.',
        },
      ],
      seoTitle: 'هل 100 ألف دولار كافية في نيويورك؟ الراتب الصافي والإيجار 2026',
      seoDescription: 'تعرف على القيمة الحقيقية لراتب 100 ألف دولار في نيويورك بعد الضرائب والإيجار.',
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
