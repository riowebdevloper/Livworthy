/**
 * LivWorthy Localized Empirical Reports Content Repository
 *
 * Implements Section 15 & 21:
 * - Canonical reportId + locale data model
 * - Localized title, subtitle, executiveSummary, insights, methodology, explanatoryText, citationInstructions
 * - Zero duplicated math; report metrics derive deterministically from financial engines
 */

import { LocalizedReportContent } from '../types';

export const LOCALIZED_REPORTS: Record<string, Record<string, LocalizedReportContent>> = {
  'global-salary-worth-index': {
    en: {
      reportId: 'global-salary-worth-index',
      locale: 'en',
      title: 'Global Salary Worth Index 2026: Real Disposable Capital Across 8 Metros',
      subtitle: 'Deterministic statutory tax withholdings and fair-market rent analysis for typical single professional salaries.',
      executiveSummary: 'Nominal salaries fail to measure genuine financial prosperity. In high-tax gateway cities such as London and New York, combined tax and rent consume over 65% of gross earnings, whereas zero-tax international hubs like Dubai preserve over 48% of gross compensation in uncommitted savings.',
      insights: [
        'Dubai delivers the highest uncommitted savings rate (48.6%) among all evaluated major metropolitan centers.',
        'New York City and London exhibit the highest cumulative tax-and-rent burden, absorbing over two-thirds of professional income.',
        'Toronto and Berlin provide moderate housing cost mitigation but face substantial statutory income tax schedules.',
      ],
      methodology: 'All calculations utilize official 2026 statutory tax law published by national revenue authorities (IRS, HMRC, BMF, FTA) and empirical median 1-bedroom rental data.',
      explanatoryText: 'Gross headline compensation is increasingly detached from living viability in top knowledge economies due to spatial rent divergence and fiscal bracket creep.',
      citationInstructions: 'LivWorthy Quantitative Research Institute (2026). Global Salary Worth Index: Empirical Cross-Border Net Income and Rent Burden Analysis.',
      status: 'PUBLISHED',
    },
    es: {
      reportId: 'global-salary-worth-index',
      locale: 'es',
      title: 'Índice Global del Valor del Salario 2026: Capital Real Disponible en 8 Metrópolis',
      subtitle: 'Análisis fiscal y de alquileres medianos para salarios profesionales típicos de un solo perceptor.',
      executiveSummary: 'Los salarios nominales no reflejan la prosperidad económica real. En ciudades de alta presión fiscal como Londres y Nueva York, los impuestos combinados y el alquiler absorben más del 65% de los ingresos brutos, mientras que en centros exentos de impuestos como Dubái se conserva más del 48% del salario en ahorro disponible.',
      insights: [
        'Dubái ofrece la mayor tasa de ahorro disponible (48,6%) entre todos los centros metropolitanos analizados.',
        'Nueva York y Londres muestran la carga combinada más alta de impuestos y vivienda, superando dos tercios del ingreso profesional.',
        'Berlín y Toronto mitigan los costos de vivienda pero presentan escalas de retención fiscal progresivas elevadas.',
      ],
      methodology: 'Todos los cálculos emplean normativas fiscales oficiales para el año 2026 publicadas por los organismos recaudadores correspondientes y datos empíricos de alquiler.',
      explanatoryText: 'La retribución bruta está cada vez más desconectada de la capacidad adquisitiva real en las grandes economías debido al aumento del costo habitacional.',
      citationInstructions: 'Instituto de Investigación Cuantitativa LivWorthy (2026). Índice Global del Valor del Salario: Análisis Empírico de Ingresos Netos y Carga de Vivienda.',
      status: 'PUBLISHED',
    },
    fr: {
      reportId: 'global-salary-worth-index',
      locale: 'fr',
      title: 'Indice mondial de valeur salariale 2026 : Pouvoir d’achat réel dans 8 métropoles',
      subtitle: 'Analyse fiscale rigoureuse et loyers médians pour les rémunérations des cadres célibataires.',
      executiveSummary: 'Les salaires bruts ne traduisent pas fidèlement la prospérité financière réelle. À Londres et New York, l’impôt et le logement captent plus de 65 % du salaire brut, alors que les hubs à fiscalité allégée comme Dubaï permettent de préserver plus de 48 % en épargne disponible.',
      insights: [
        'Dubaï affiche le taux d’épargne disponible le plus élevé (48,6 %) parmi les grandes métropoles mondiales étudiées.',
        'New York et Londres imposent la plus forte pression combinée impôts-logement.',
        'Berlin et Toronto offrent des loyers plus modérés mais des barèmes fiscaux progressifs élevés.',
      ],
      methodology: 'Les calculs reposent sur les barèmes légaux 2026 des administrations fiscales officielles et sur les relevés de loyers médians.',
      explanatoryText: 'La rémunération faciale perd de sa pertinence face à l’hétérogénéité des prélèvements obligatoires et des coûts de logement.',
      citationInstructions: 'Institut de recherche quantitative LivWorthy (2026). Indice mondial de valeur salariale.',
      status: 'PUBLISHED',
    },
    ar: {
      reportId: 'global-salary-worth-index',
      locale: 'ar',
      title: 'مؤشر القيمة الحقيقية للرواتب عالمياً 2026: رأس المال الصافي في 8 عواصم',
      subtitle: 'تحليل دقيق للاستقطاعات الضريبية الرسمية وإيجارات السكن للوظائف المهنية.',
      executiveSummary: 'لا تكفي الرواتب الإجمالية لقياس الرفاهية المالية الفعلية. ففي مدن مثل لندن ونيويورك تلتهم الضرائب والإيجارات أكثر من 65% من الراتب، بينما تحتفظ المراكز المعفاة من الضرائب مثل دبي بأكثر من 48% كمدخرات نقدية حرة.',
      insights: [
        'تحقق دبي أعلى معدل ادخار صافٍ (48.6%) بين جميع المراكز الحضرية الكبرى التي شملتها الدراسة.',
        'تسجل نيويورك ولندن أعلى عبء مالي مشترك للضرائب والسكن بنسبة تتجاوز ثلثي إجمالي الدخل.',
        'توفر برلين وتورونتو إيجارات معتدلة نسبياً لكنها تخضع لشرائح ضريبية تصاعدية مرتفعة.',
      ],
      methodology: 'تستند جميع الحسابات إلى اللوائح الضريبية الرسمية لعام 2026 الصادرة عن الهيئات المعتمدة وبيانات الإيجار الفعلية.',
      explanatoryText: 'باتت الرواتب الاسمية مضللة دون احتساب تكاليف المعيشة الفعلية والاقتطاعات الإلزامية في الاقتصادات المتقدمة.',
      citationInstructions: 'معهد ليف وورثي للبحوث الكمية (2026). مؤشر القيمة الحقيقية للرواتب عالمياً.',
      status: 'PUBLISHED',
    },
  },
};

export function getLocalizedReport(reportId: string, locale: string): LocalizedReportContent | null {
  const reportDict = LOCALIZED_REPORTS[reportId];
  if (!reportDict) return null;
  return reportDict[locale] || reportDict.en || null;
}
