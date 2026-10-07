/**
 * LivWorthy Localized Relocation Content Repository
 *
 * Implements Section 15 & 21:
 * - Canonical corridorSlug + locale data model
 * - Localized headline, context, salaryEquivalenceExplanation, taxExplanation, housingExplanation, conclusion, and SEO metadata
 * - Linked with bilateral relocation corridor data
 */

import { LocalizedRelocationContent } from '../types';

export const LOCALIZED_RELOCATIONS: Record<string, Record<string, LocalizedRelocationContent>> = {
  'new-york-to-london': {
    en: {
      corridorSlug: 'new-york-to-london',
      locale: 'en',
      headline: 'Relocating from New York City to London: Comprehensive Financial Comparison',
      context: 'Transitioning between the two largest Anglo-American financial powerhouses involves moving from a triple-tax US jurisdiction to the centralized UK HMRC regime.',
      salaryEquivalenceExplanation: 'A $150,000 New York compensation package translates to approximately £85,000–£95,000 in London for equivalent discretionary living standards.',
      taxExplanation: 'While NYC subjects earners to federal, NY state, and city income taxes (marginal ~35%), London triggers a 40% higher rate above £50,270 and a 60% effective marginal rate between £100k and £125k.',
      housingExplanation: 'London private rental accommodations in Zones 1 and 2 are approximately 20-25% cheaper than equivalent Manhattan or prime Brooklyn rentals in constant USD.',
      conclusion: 'Expect slightly lower gross cash earnings in London, offset by lower baseline healthcare costs and robust European travel proximity.',
      seoTitle: 'New York to London Relocation: Salary, Tax & Living Cost Guide (2026)',
      seoDescription: 'Accurate financial comparison for moving from NYC to London: HMRC taxes vs IRS, rent comparisons, and net purchasing power.',
      status: 'PUBLISHED',
    },
    es: {
      corridorSlug: 'new-york-to-london',
      locale: 'es',
      headline: 'Mudarse de Nueva York a Londres: Comparativa Financiera y Fiscal',
      context: 'El traslado entre las dos capitales financieras anglosajonas implica pasar del sistema fiscal triple de EE. UU. al régimen centralizado de HMRC en el Reino Unido.',
      salaryEquivalenceExplanation: 'Un paquete salarial de $150.000 en Nueva York equivale aproximadamente a £85.000–£95.000 en Londres para mantener un poder adquisitivo similar.',
      taxExplanation: 'En NYC se tributa a nivel federal, estatal y municipal. En el Reino Unido, el tramo superior del 40% se aplica a partir de £50.270.',
      housingExplanation: 'El alquiler en las Zonas 1 y 2 de Londres resulta entre un 20% y un 25% más accesible que en Manhattan o Brooklyn.',
      conclusion: 'Los salarios brutos suelen ser más moderados en Londres, pero se compensan con menores costos en salud privada y conexiones de transporte.',
      seoTitle: 'Mudarse de Nueva York a Londres: Salarios, Impuestos y Alquiler 2026',
      seoDescription: 'Guía financiera para mudarse de NYC a Londres: comparativa de sueldos netos, impuestos HMRC vs IRS y alquileres.',
      status: 'PUBLISHED',
    },
    fr: {
      corridorSlug: 'new-york-to-london',
      locale: 'fr',
      headline: 'Déménager de New York à Londres : Comparatif financier et fiscal',
      context: 'La transition entre New York et Londres nécessite d’adapter son budget entre la fiscalité américaine et le barème britannique HMRC.',
      salaryEquivalenceExplanation: 'Un salaire de 150 000 $ à New York équivaut environ à 85 000 – 95 000 £ à Londres pour un niveau de vie comparable.',
      taxExplanation: 'New York cumule impôts fédéral, étatique et local, tandis que Londres applique les tranches HMRC avec un taux marginal supérieur dès 50 270 £.',
      housingExplanation: 'Les loyers en zones 1 et 2 à Londres sont 20 à 25 % inférieurs à ceux de Manhattan à taux de change constant.',
      conclusion: 'Londres offre une rémunération brute souvent moindre mais des dépenses de santé et de transport mieux maîtrisées.',
      seoTitle: 'Expatriation New York vers Londres : Salaires, Impôts et Logement',
      seoDescription: 'Guide financier complet pour s’installer à Londres depuis New York : salaires nets, fiscalité HMRC et loyers comparés.',
      status: 'PUBLISHED',
    },
    ar: {
      corridorSlug: 'new-york-to-london',
      locale: 'ar',
      headline: 'الانتقال من نيويورك إلى لندن: مقارنة شاملة للرواتب والضرائب',
      context: 'يمثل الانتقال بين أكبر مركزين ماليين تحولاً من النظام الضريبي الأمريكي الثلاثي إلى نظام الضرائب البريطاني HMRC.',
      salaryEquivalenceExplanation: 'يعادل راتب 150,000 دولار في نيويورك ما يقارب 85,000 إلى 95,000 جنيه إسترليني في لندن للحفاظ على نمط معيشي متقارب.',
      taxExplanation: 'تفرض نيويورك ضرائب فيدرالية ومحلية مجمعة، بينما تبدأ الشريحة العليا في بريطانيا (40%) عند 50,270 جنيهاً إسترلينياً.',
      housingExplanation: 'تعد تكاليف الإيجار في المنطقتين 1 و2 في لندن أقل بنحو 20-25% مقارنة بمثيلاتها في مانهاتن.',
      conclusion: 'قد تكون الأجور الاسمية أقل في لندن، لكنها تقابل بتكاليف رعاية صحية أقل وتغطية مواصلات واسعة.',
      seoTitle: 'الانتقال من نيويورك إلى لندن: دليل الرواتب والضرائب وتكاليف المعيشة',
      seoDescription: 'مقارنة مالية دقيقة للانتقال من نيويورك إلى لندن: الرواتب الصافية، الضرائب والإيجارات 2026.',
      status: 'PUBLISHED',
    },
  },
  'london-to-dubai': {
    en: {
      corridorSlug: 'london-to-dubai',
      locale: 'en',
      headline: 'Relocating from London to Dubai: The 0% Tax Arbitrage Guide',
      context: 'Relocating from London to Dubai represents the most dramatic disposable cash flow upgrade available to UK professionals.',
      salaryEquivalenceExplanation: 'A £100,000 gross London salary (£66,600 net) matches the take-home cash of just AED 320,000 in Dubai due to 0% income tax.',
      taxExplanation: 'UK earners escape the 40%-45% HMRC income tax brackets and 2% National Insurance completely upon establishing non-UK tax residency under the Statutory Residence Test (SRT).',
      housingExplanation: 'Dubai residential properties offer newer amenities and swimming pools included, though annual rent is commonly negotiated in upfront cheques.',
      conclusion: 'Dubai delivers an immediate 35-50% surge in monthly disposable savings, provided lifestyle inflation and luxury spending are actively managed.',
      seoTitle: 'London to Dubai Relocation: Salary, 0% Tax & Rent Comparison (2026)',
      seoDescription: 'Discover the exact net salary gains when moving from London to Dubai: 0% tax savings, UK SRT residency rules, and rent comparisons.',
      status: 'PUBLISHED',
    },
    es: {
      corridorSlug: 'london-to-dubai',
      locale: 'es',
      headline: 'Mudarse de Londres a Dubái: Guía del Arbitraje Fiscal del 0%',
      context: 'El traslado de Londres a Dubái supone una de las mayores optimizaciones de flujo de caja neto para profesionales residentes en el Reino Unido.',
      salaryEquivalenceExplanation: 'Un sueldo de £100.000 en Londres genera el mismo neto que unos 320.000 AED en Dubái gracias a la ausencia total de impuestos sobre el salario.',
      taxExplanation: 'Al trasladar la residencia fiscal fuera del Reino Unido, el trabajador queda exento de los tramos del 40%-45% de HMRC y de la seguridad social británica.',
      housingExplanation: 'Las viviendas en Dubái suelen incluir servicios modernos y piscina, pagándose mediante cheques anuales o trimestrales.',
      conclusion: 'Dubái permite un incremento del ahorro mensual de entre un 35% y un 50%, siempre que se controle el gasto discrecional.',
      seoTitle: 'Mudarse de Londres a Dubái: Salario Neto, 0% Impuestos y Vivienda 2026',
      seoDescription: 'Calcula tu incremento de ahorro al mudarte de Londres a Dubái: comparativa fiscal y costo de vida real.',
      status: 'PUBLISHED',
    },
    ar: {
      corridorSlug: 'london-to-dubai',
      locale: 'ar',
      headline: 'الانتقال من لندن إلى دبي: دليل الرواتب والإعفاء الضريبي الكامل',
      context: 'يمثل الانتقال من لندن إلى دبي نقلة نوعية في صافي الدخل الفعلي بفضل ميزة الإعفاء الكامل من ضريبة الدخل في الإمارات.',
      salaryEquivalenceExplanation: 'يوفر راتب 100 ألف جنيه في لندن (صافي 66.6 ألف) نفس العائد الصافي الذي يحققه راتب 320 ألف درهم في دبي بدون ضرائب.',
      taxExplanation: 'يتخلص الموظف المنتقل إلى دبي من شرائح الضرائب البريطانية (40%-45%) والتأمين الوطني بموجب قواعد الإقامة الضريبية البريطانية.',
      housingExplanation: 'تتميز عقارات دبي السكنية بمرافق عصرية ومسابح وصالات رياضية متكاملة، وتسدد الإيجارات غالباً عبر شيكات مؤجلة.',
      conclusion: 'يمنح الانتقال إلى دبي فرصة لمضاعفة نسبة الادخار الشهري بنسبة تتراوح بين 35% و50%.',
      seoTitle: 'الانتقال من لندن إلى دبي: مقارنة الرواتب والإعفاء الضريبي والإيجارات',
      seoDescription: 'دليل مالي شامل للانتقال من لندن إلى دبي: وفر ضرائب HMRC واستفد من 0% ضريبة دخل.',
      status: 'PUBLISHED',
    },
  },
};

export function getLocalizedRelocation(corridorSlug: string, locale: string): LocalizedRelocationContent | null {
  const corridorDict = LOCALIZED_RELOCATIONS[corridorSlug];
  if (!corridorDict) return null;
  return corridorDict[locale] || corridorDict.en || null;
}
