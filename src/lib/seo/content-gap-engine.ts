/**
 * LivWorthy Multilingual Content Gap & Competitor Intelligence Engine
 *
 * Implements Sections 31, 32, 33, and 34 of the Master Execution Prompt:
 * - Language-specific real competitors directory (not generic English sites)
 * - Identifies missing subtopics, missing tools, and missing comparison corridors
 * - Top-20 Quick Wins prioritization for positions 4-20
 * - CTR testing and metadata recommendations
 */

import { MULTILINGUAL_KEYWORD_DATABASE, MultilingualKeywordItem } from './multilingual-keywords';

export interface CompetitorProfile {
  id: string;
  locale: string;
  domain: string;
  name: string;
  category:
    | 'salary-calculator'
    | 'tax-tool'
    | 'cost-of-living'
    | 'relocation-expat'
    | 'finance-publisher'
    | 'career-site';
  targetQueries: string[];
  strengths: string[];
  weaknesses: string[];
  livworthyAdvantage: string;
}

export const LOCALIZED_COMPETITORS: CompetitorProfile[] = [
  // English (US / UK / Global)
  {
    id: 'us_smartasset',
    locale: 'en',
    domain: 'smartasset.com',
    name: 'SmartAsset',
    category: 'salary-calculator',
    targetQueries: ['NYC paycheck calculator', 'salary after tax new york'],
    strengths: ['High domain rating', 'Direct paycheck calculators'],
    weaknesses: ['Static tax estimates without real HUD housing subtraction', 'No inverse salary needed solver'],
    livworthyAdvantage: 'Deterministic multi-tier tax engine + HUD FMR shelter integration + uncommitted savings.',
  },
  {
    id: 'en_numbeo',
    locale: 'en',
    domain: 'numbeo.com',
    name: 'Numbeo',
    category: 'cost-of-living',
    targetQueries: ['cost of living New York', 'cost of living London vs Dubai'],
    strengths: ['Massive crowd-sourced price database', 'High global brand recognition'],
    weaknesses: ['Unverified user-submitted crowd data', 'No statutory tax brackets or net take-home calculation'],
    livworthyAdvantage: 'Tier-1 verified government statistical citations (BLS, Eurostat, ONS) and zero-AI math.',
  },
  {
    id: 'uk_moneysavingexpert',
    locale: 'en',
    domain: 'moneysavingexpert.com',
    name: 'MoneySavingExpert',
    category: 'finance-publisher',
    targetQueries: ['London salary after tax', 'income tax calculator uk'],
    strengths: ['Exceptional consumer trust in UK', 'Detailed PAYE breakdowns'],
    weaknesses: ['Limited to UK domestic market', 'No cross-border relocation modeling'],
    livworthyAdvantage: 'Bilateral cross-border corridor modeling (London to Dubai, London to NYC) with FX snapshots.',
  },

  // Spanish (Spain / US / LATAM)
  {
    id: 'es_cincodias',
    locale: 'es',
    domain: 'cincodias.elpais.com',
    name: 'Cinco Días / Calculadora IRPF',
    category: 'finance-publisher',
    targetQueries: ['calcular sueldo neto espana', 'tramos irpf sueldo neto'],
    strengths: ['Strong editorial authority in Spain', 'Timely tax law updates'],
    weaknesses: ['Limited interactive customization', 'No international cost of living context'],
    livworthyAdvantage: 'Calculadora interactiva en español con deducción simultánea de vivienda y coste de vida.',
  },
  {
    id: 'es_bankinter',
    locale: 'es',
    domain: 'bankinter.com',
    name: 'Bankinter Finanzas',
    category: 'salary-calculator',
    targetQueries: ['sueldo neto espana simulador'],
    strengths: ['High institutional banking trust'],
    weaknesses: ['Commercial bias towards mortgage leads', 'No overseas expat relocation modeling'],
    livworthyAdvantage: 'Total independencia comercial sin publicidad sesgada ni captación crediticia.',
  },

  // Arabic (UAE / Saudi / Gulf)
  {
    id: 'ar_bayut',
    locale: 'ar',
    domain: 'bayut.com',
    name: 'بيوت (Bayut UAE)',
    category: 'relocation-expat',
    targetQueries: ['تكلفة المعيشة في دبي', 'اسعار الايجارات في دبي'],
    strengths: ['Accurate Dubai rental listings and community data'],
    weaknesses: ['Real estate sales bias', 'No income tax comparison or salary calculator'],
    livworthyAdvantage: 'أرقام رسمية موثقة من مركز دبي للإحصاء مع حساب دقيق لصافي الادخار العائلي.',
  },

  // German (DACH)
  {
    id: 'de_brutto_netto',
    locale: 'de',
    domain: 'brutto-netto-rechner.info',
    name: 'Brutto-Netto-Rechner',
    category: 'salary-calculator',
    targetQueries: ['gehalt nach steuern berechnen netto rechner', 'netto lohn rechner'],
    strengths: ['Standard German domestic tool for Steuerklasse I-VI'],
    weaknesses: ['Outdated UI/UX', 'No cost-of-living or housing subtraction'],
    livworthyAdvantage: 'Moderne, werbefreie Benutzeroberfläche inklusive Mietspiegel- und Realeinkommensanalyse.',
  },

  // Portuguese (Brazil & Portugal)
  {
    id: 'pt_mobills',
    locale: 'pt',
    domain: 'mobills.com.br',
    name: 'Mobills Calculadoras',
    category: 'salary-calculator',
    targetQueries: ['calculadora de salário líquido após impostos', 'salario liquido clt'],
    strengths: ['Popular personal budgeting brand in Brazil'],
    weaknesses: ['Restricted to domestic Brazilian deductions', 'No bilateral expat currency modeling'],
    livworthyAdvantage: 'Comparação de poder de compra internacional e custo de vida nas capitais globais.',
  },

  // Hindi (India / Expats)
  {
    id: 'hi_ambitionbox',
    locale: 'hi',
    domain: 'ambitionbox.com',
    name: 'AmbitionBox',
    category: 'career-site',
    targetQueries: ['Dubai me rehne ke liye kitni salary chahiye', 'in hand salary calculator'],
    strengths: ['Large database of reported Indian tech salaries'],
    weaknesses: ['Crowdsourced self-reported numbers', 'Weak cross-border tax progression modeling'],
    livworthyAdvantage: 'Mathematical verification against official statutory rules and 0% tax Gulf advantages.',
  },

  // Japanese (Japan)
  {
    id: 'ja_doda',
    locale: 'ja',
    domain: 'doda.jp',
    name: 'doda 手取り給与シミュレーター',
    category: 'career-site',
    targetQueries: ['年収 手取り 計算 税引後給与', '手取り額 早見表'],
    strengths: ['Established Japanese career recruiting authority'],
    weaknesses: ['Domestic focus only', 'No overseas relocation or metro purchasing power index'],
    livworthyAdvantage: '国際都市比較（東京 vs ロンドン vs ドバイ）と実質可処分所得の多言語表示。',
  },
];

export interface ContentGapResult {
  locale: string;
  missingSubtopics: string[];
  missingTools: string[];
  missingComparisons: string[];
  highDemandQuestions: string[];
  recommendations: string[];
}

export interface QuickWinKeyword {
  keyword: MultilingualKeywordItem;
  observedPosition: number | null;
  opportunityClassification: 'QUICK_WIN' | 'POTENTIAL_OPPORTUNITY';
  targetPosition: string;
  improvementActions: string[];
  expectedImpact: 'HIGH' | 'MEDIUM';
}

export class MultilingualContentGapEngine {
  /**
   * Evaluates content gaps for a specific locale against competitors.
   */
  public static analyzeLocaleGaps(locale: string): ContentGapResult {
    const localeKeywords = MULTILINGUAL_KEYWORD_DATABASE.filter((k) => k.locale === locale);
    const competitor = LOCALIZED_COMPETITORS.find((c) => c.locale === locale);

    const missingSubtopics: string[] = [];
    const missingTools: string[] = [];
    const missingComparisons: string[] = [];
    const highDemandQuestions: string[] = [];

    if (locale === 'es') {
      missingSubtopics.push('Fiscalidad para expatriados españoles en Dubái');
      missingSubtopics.push('Comparativa de alquiler en Madrid frente a Miami');
      missingTools.push('Calculador de deducciones autonómicas IRPF');
      highDemandQuestions.push('¿Cuánto es un buen sueldo en Estados Unidos para un español?');
      highDemandQuestions.push('¿Cómo calcular el salario neto si cobro en dólares?');
    } else if (locale === 'ar') {
      missingSubtopics.push('تكاليف المدارس الخاصة للمغتربين في دبي وأبوظبي');
      missingSubtopics.push('الفروق الضريبية بين عقود العمل في الرياض ودبي');
      missingTools.push('حاسبة ميزانية السكن مقابل الراتب في الخليج');
      highDemandQuestions.push('كم يحتاج العازب للعيش في دبي شهرياً؟');
      highDemandQuestions.push('هل الراتب المعروض في الإمارات شامل السكن أم بدونه؟');
    } else if (locale === 'de') {
      missingSubtopics.push('Wegzugsbesteuerung und Gehaltsvergleich Deutschland vs VAE');
      missingSubtopics.push('Reale Kaufkraft: Zürich vs Berlin vs Wien');
      missingTools.push('Pendlerpauschale & Homeoffice Abzugsrechner');
      highDemandQuestions.push('Welches Gehalt braucht man in der Schweiz zum Auswandern?');
      highDemandQuestions.push('Wie viel bleibt von 100.000 Euro Gehalt nach Steuern?');
    } else if (locale === 'hi') {
      missingSubtopics.push('NRI Tax equivalence and remittance purchasing power');
      missingSubtopics.push('Dubai vs Canada salary comparison for Indian tech professionals');
      missingTools.push('INR to AED/USD monthly living expense converter');
      highDemandQuestions.push('Kya Dubai me 15000 AED family ke liye kaafi hai?');
      highDemandQuestions.push('USA me H1B salary after tax kitni aati hai?');
    } else {
      missingSubtopics.push(`Localized expat compensation analysis for ${locale}`);
      missingComparisons.push(`Bilateral corridor analysis from ${locale} origin markets`);
      highDemandQuestions.push(`What is an above-average professional salary in target metros?`);
    }

    return {
      locale,
      missingSubtopics,
      missingTools,
      missingComparisons,
      highDemandQuestions,
      recommendations: [
        `Ensure ${locale} metadata answers the primary search intent directly within the top 150 words.`,
        `Reinforce internal linking to /${locale}/salary-worth and relevant regional research assets.`,
        `Maintain zero English leakage across titles, descriptions, and interactive elements.`,
      ],
    };
  }

  /**
   * Identifies Quick Win opportunities where verified ranking evidence exists (positions 4-20)
   * or marks as POTENTIAL_OPPORTUNITY awaiting Search Console / provider ranking data.
   */
  public static getQuickWins(): QuickWinKeyword[] {
    return MULTILINGUAL_KEYWORD_DATABASE.map((kw) => {
      // True quick win logic: Classified as QUICK_WIN ONLY when observed position exists between 4 and 20
      const isObservedQuickWin =
        kw.currentRank !== null && kw.currentRank >= 4 && kw.currentRank <= 20;

      return {
        keyword: kw,
        observedPosition: kw.currentRank,
        opportunityClassification: isObservedQuickWin
          ? 'QUICK_WIN'
          : 'POTENTIAL_OPPORTUNITY',
        targetPosition: kw.targetRank,
        improvementActions: [
          'Verify answer-first direct definition in first paragraph',
          'Optimize title tag for CTR with current year (2026)',
          'Add internal links from regional research reports',
          'Audit and ensure valid schema markup (SoftwareApplication / Dataset)',
        ],
        expectedImpact: (kw.searchVolume ?? 0) > 8000 ? 'HIGH' : 'MEDIUM',
      };
    });
  }
}
