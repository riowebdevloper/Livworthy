/**
 * LivWorthy Localized City Content Repository
 *
 * Implements Section 15 & 21:
 * - Canonical cityId + locale data model
 * - Localized city name, intro, salary context, housing context, tax context, and SEO metadata
 * - Zero duplicated mathematical logic; canonical IDs map to financial engine benchmarks
 */

import { LocalizedCityContent } from '../types';

export const LOCALIZED_CITIES: Record<string, Record<string, LocalizedCityContent>> = {
  nyc: {
    en: {
      cityId: 'nyc',
      locale: 'en',
      name: 'New York City',
      intro: 'New York City is the primary global financial capital with intense spatial cost variance between Manhattan, Brooklyn, and Queens.',
      salaryContext: 'High nominal salaries ($100k-$150k) are offset by high progressive state and city personal income tax rates.',
      housingContext: 'Landlords strictly enforce a 40x annual income requirement for un-guaranteed residential lease approvals.',
      taxContext: 'Three-tiered statutory income tax: US Federal IRS tax + New York State (NYS) tax + NYC City Resident tax.',
      seoTitle: 'New York City Salary, Tax & Cost of Living Intelligence | LivWorthy',
      seoDescription: 'Accurate statutory tax breakdown, rent burden, and take-home pay benchmarks for living in New York City.',
      status: 'PUBLISHED',
    },
    es: {
      cityId: 'nyc',
      locale: 'es',
      name: 'Nueva York',
      intro: 'La ciudad de Nueva York es la capital financiera mundial con una gran disparidad de costos entre Manhattan, Brooklyn y Queens.',
      salaryContext: 'Los altos salarios nominales se ven contrarrestados por las tasas impositivas combinadas del estado y la ciudad.',
      housingContext: 'Los propietarios exigen ingresos anuales equivalentes a 40 veces el alquiler mensual para aprobar contratos.',
      taxContext: 'Estructura fiscal de tres niveles: impuesto federal de EE.UU., impuesto estatal de Nueva York e impuesto municipal de NYC.',
      seoTitle: 'Nueva York: Salarios, Impuestos y Costo de Vida 2026 | LivWorthy',
      seoDescription: 'Análisis detallado de impuestos reales, costo de vivienda y sueldo neto en Nueva York.',
      status: 'PUBLISHED',
    },
    fr: {
      cityId: 'nyc',
      locale: 'fr',
      name: 'New York',
      intro: 'New York est la capitale financière mondiale, caractérisée par une forte disparité de coût de la vie selon les arrondissements.',
      salaryContext: 'Les salaires bruts élevés sont tempérés par la fiscalité combinée de l’État de New York et de la ville.',
      housingContext: 'Les propriétaires appliquent rigoureusement la règle des 40 fois le loyer mensuel en revenu annuel brut.',
      taxContext: 'Fiscalité à trois niveaux : impôt fédéral américain, impôt de l’État de New York et impôt municipal de NYC.',
      seoTitle: 'New York : Salaire net, impôts et coût de la vie | LivWorthy',
      seoDescription: 'Estimation du salaire net après impôts et dépenses réelles de logement à New York.',
      status: 'PUBLISHED',
    },
    ar: {
      cityId: 'nyc',
      locale: 'ar',
      name: 'نيويورك',
      intro: 'تعد مدينة نيويورك المركز المالي العالمي الرائد مع تباين كبير في تكاليف المعيشة بين مانهاتن وبروكلين.',
      salaryContext: 'تقابل الرواتب الاسمية المرتفعة ضرائب دخل تصاعدية على مستوى الولاية والمدينة.',
      housingContext: 'يشترط مؤجرو العقارات دخلاً سنوياً يعادل 40 ضعف الإيجار الشهري للموافقة على عقود الإيجار.',
      taxContext: 'نظام ضريبي ثلاثي: الضريبة الفيدرالية الأمريكية وضريبة ولاية نيويورك وضريبة مدينة نيويورك.',
      seoTitle: 'رواتب وضرائب وتكلفة المعيشة في نيويورك 2026 | ليف وورثي',
      seoDescription: 'تحليل دقيق للراتب الصافي والضرائب وتكاليف السكن الحقيقية في مدينة نيويورك.',
      status: 'PUBLISHED',
    },
    de: {
      cityId: 'nyc',
      locale: 'de',
      name: 'New York City',
      intro: 'New York City ist das globale Finanzzentrum mit stark variierenden Lebenshaltungskosten zwischen den Stadtteilen.',
      salaryContext: 'Hohe Bruttogehälter werden durch progressive Bundes-, Bundesstaats- und Stadtsteuern relativiert.',
      housingContext: 'Vermieter verlangen üblicherweise das 40-fache der Monatsmiete als jährliches Mindesteinkommen.',
      taxContext: 'Dreistufige Einkommensteuer: US-Bundessteuer, Bundesstaatssteuer New York und städtische NYC-Steuer.',
      seoTitle: 'New York City: Gehalt, Steuern und Lebenshaltungskosten | LivWorthy',
      seoDescription: 'Nettogehalt, Steuerabzüge und Mietkosten in New York City im empirischen Vergleich.',
      status: 'PUBLISHED',
    },
  },
  london: {
    en: {
      cityId: 'london',
      locale: 'en',
      name: 'London',
      intro: 'London is Europe’s primary financial and corporate center, spanning 33 boroughs with steep public transit zones.',
      salaryContext: 'Salaries are subject to HMRC PAYE income tax brackets plus employee Class 1 National Insurance.',
      housingContext: 'Deposits are capped at 5 weeks of rent under the Tenant Fees Act, with strict affordability vetting.',
      taxContext: 'UK statutory brackets: 20% basic, 40% higher, 45% additional, plus the 60% marginal taper band above £100k.',
      seoTitle: 'London Salary After Tax, Rent & Cost of Living | LivWorthy',
      seoDescription: 'Official UK HMRC PAYE breakdown, Council Tax bands, and purchasing power benchmarks for London.',
      status: 'PUBLISHED',
    },
    es: {
      cityId: 'london',
      locale: 'es',
      name: 'Londres',
      intro: 'Londres es el centro financiero de Europa, compuesto por 33 distritos con marcadas zonas de transporte.',
      salaryContext: 'Los sueldos están sujetos a las escalas fiscales de HMRC PAYE y contribuciones de Seguridad Social.',
      housingContext: 'Los depósitos de alquiler están limitados por ley a 5 semanas de renta.',
      taxContext: 'Tramos del Reino Unido: 20% básico, 40% superior y 45% adicional, con reducción de desgravación sobre £100k.',
      seoTitle: 'Londres: Salario Neto, Impuestos y Costo de Vida 2026 | LivWorthy',
      seoDescription: 'Calculadora oficial de sueldo neto tras impuestos HMRC y gastos de vida en Londres.',
      status: 'PUBLISHED',
    },
    ar: {
      cityId: 'london',
      locale: 'ar',
      name: 'لندن',
      intro: 'لندن هي المركز المالي الرائد في أوروبا، وتضم 33 بلدية ذات تكاليف نقل وسكن متفاوتة.',
      salaryContext: 'تخضع الرواتب لشرائح ضريبة الدخل البريطانية واشتراكات التأمين الوطني.',
      housingContext: 'الحد الأقصى للضمان المالي للإيجار هو 5 أسابيع بموجب القانون البريطاني.',
      taxContext: 'شرائح الضرائب البريطانية: 20%، 40%، و45% مع تخفيض الإعفاء الشخصي لما فوق 100 ألف جنيه إسترليني.',
      seoTitle: 'حاسبة الراتب الصافي وتكلفة المعيشة في لندن 2026 | ليف وورثي',
      seoDescription: 'تفاصيل الضرائب البريطانية وتكلفة السكن والقوة الشرائية الحقيقية في لندن.',
      status: 'PUBLISHED',
    },
  },
  dubai: {
    en: {
      cityId: 'dubai',
      locale: 'en',
      name: 'Dubai',
      intro: 'Dubai is the Arabian Gulf’s premier global commerce gateway, renowned for zero statutory personal income taxation.',
      salaryContext: '100% of gross earnings are retained by expatriate employees with zero personal income tax deductions.',
      housingContext: 'Rental payments are traditionally tendered via post-dated checks (1 to 4 checks annually).',
      taxContext: 'Statutory 0% personal tax; 5% VAT applies on general consumption and non-basic services.',
      seoTitle: 'Dubai Salary, Housing & Real Disposable Income | LivWorthy',
      seoDescription: 'Calculate net cash flow, housing upfront deposit burdens, and living costs in Dubai with 0% personal income tax.',
      status: 'PUBLISHED',
    },
    ar: {
      cityId: 'dubai',
      locale: 'ar',
      name: 'دبي',
      intro: 'دبي هي بوابة التجارة العالمية في الخليج العربي، وتتميز بعدم وجود ضريبة دخل شخصية.',
      salaryContext: 'يحتفظ الموظفون بنسبة 100% من إجمالي الراتب دون أي استقطاعات ضريبية شخصية.',
      housingContext: 'يتم سداد عقود الإيجار تقليدياً عبر شيكات مؤجلة الدفع (من 1 إلى 4 شيكات سنوياً).',
      taxContext: 'ضريبة دخل شخصية 0%؛ وتطبق ضريبة القيمة المضافة بنسبة 5% على المشتريات العامة.',
      seoTitle: 'الرواتب والإيجارات وتكلفة المعيشة في دبي 2026 | ليف وورثي',
      seoDescription: 'تحليل القوة الشرائية وتكلفة السكن والدخل المتاح الحقيقي في إمارة دبي بدون ضرائب.',
      status: 'PUBLISHED',
    },
  },
};

export function getLocalizedCityContent(cityId: string, locale: string): LocalizedCityContent | null {
  const cityGroup = LOCALIZED_CITIES[cityId];
  if (!cityGroup) return null;
  return cityGroup[locale] || cityGroup.en || null;
}

export const getLocalizedCity = getLocalizedCityContent;
