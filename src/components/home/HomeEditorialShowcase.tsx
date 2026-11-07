import React from 'react';
import { FileText, BookOpen, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

export const HomeEditorialShowcase: React.FC = () => {
  const { dict } = useI18n();

  return (
    <div className="space-y-12 mt-12 pt-8 border-t border-[#DCE3E0]">
      {/* Featured Empirical Research & Benchmark Studies (AdSense E-E-A-T Quality Centerpiece) */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#167D75]">
              Original Research & Economics
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102A2E] mt-1 tracking-tight">
              Featured Empirical Benchmark Reports
            </h2>
          </div>
          <a
            href="/reports"
            className="text-xs sm:text-sm font-semibold text-[#167D75] hover:text-[#0D524D] hover:underline flex items-center space-x-1"
          >
            <span>Explore all 5 empirical research datasets & methodology</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Report A */}
          <article className="bg-white rounded-2xl border border-[#DCE3E0] p-6 shadow-xs flex flex-col justify-between hover:border-[#167D75] transition-all">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#60706D] mb-3">
                <span className="bg-[#DDF2EC] text-[#0D625B] px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                  Empirical Index
                </span>
                <time dateTime="2026-10-15">Updated Q4 2026</time>
              </div>
              <h3 className="text-lg font-bold text-[#102A2E] leading-snug">
                <a href="/reports/global-salary-worth-index" className="hover:text-[#167D75]">
                  2026 Global Salary Worth Index: 39-Market Purchasing Power Analysis
                </a>
              </h3>
              <p className="text-xs sm:text-sm text-[#60706D] mt-3 leading-relaxed">
                Empirical benchmark analyzing net retained disposable cash across 65 metropolitan economies. Evaluates statutory tax drag, fair-market housing burden, and discretionary purchasing power using official 2026 tax schedules.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F7F8F5] flex items-center justify-between">
              <span className="text-xs font-medium text-[#102A2E]">65 Global Metros Audited</span>
              <a
                href="/reports/global-salary-worth-index"
                className="text-xs font-bold text-[#167D75] hover:underline flex items-center space-x-1"
              >
                <span>Read Study</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </article>

          {/* Report B */}
          <article className="bg-white rounded-2xl border border-[#DCE3E0] p-6 shadow-xs flex flex-col justify-between hover:border-[#167D75] transition-all">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#60706D] mb-3">
                <span className="bg-[#DDF2EC] text-[#0D625B] px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                  Equivalency Study
                </span>
                <time dateTime="2026-10-18">Updated Q4 2026</time>
              </div>
              <h3 className="text-lg font-bold text-[#102A2E] leading-snug">
                <a href="/reports/purchasing-power-comparison" className="hover:text-[#167D75]">
                  Cross-Border Living Cost & Purchasing Power Parity (PPP) Report
                </a>
              </h3>
              <p className="text-xs sm:text-sm text-[#60706D] mt-3 leading-relaxed">
                Bilateral economic equivalency modeling standard of living across North America, Europe, Asia-Pacific, and the Middle East. Compares actual lifestyle equivalence versus headline FX exchange rates.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F7F8F5] flex items-center justify-between">
              <span className="text-xs font-medium text-[#102A2E]">Deterministic PPP Model</span>
              <a
                href="/reports/purchasing-power-comparison"
                className="text-xs font-bold text-[#167D75] hover:underline flex items-center space-x-1"
              >
                <span>Read Study</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </article>

          {/* Report C */}
          <article className="bg-white rounded-2xl border border-[#DCE3E0] p-6 shadow-xs flex flex-col justify-between hover:border-[#167D75] transition-all">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#60706D] mb-3">
                <span className="bg-[#DDF2EC] text-[#0D625B] px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                  Housing Benchmark
                </span>
                <time dateTime="2026-10-22">Updated Q4 2026</time>
              </div>
              <h3 className="text-lg font-bold text-[#102A2E] leading-snug">
                <a href="/reports/salary-to-rent-index" className="hover:text-[#167D75]">
                  The 2026 Global Metropolitan Salary-to-Rent Ratio Index
                </a>
              </h3>
              <p className="text-xs sm:text-sm text-[#60706D] mt-3 leading-relaxed">
                Empirical housing affordability audit measuring single-earner and dual-earner rent-to-gross percentages. Evaluates median local wages against HUD Fair Market Rents and international tenancy data.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F7F8F5] flex items-center justify-between">
              <span className="text-xs font-medium text-[#102A2E]">Rental Burden Audit</span>
              <a
                href="/reports/salary-to-rent-index"
                className="text-xs font-bold text-[#167D75] hover:underline flex items-center space-x-1"
              >
                <span>Read Study</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </article>
        </div>
      </section>

      {/* Featured Flagship City Salary & Living Analysis Guides */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#167D75]">
              Editorial Guides & City Benchmarks
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102A2E] mt-1 tracking-tight">
              Flagship Metropolitan Salary Guides
            </h2>
          </div>
          <a
            href="/guides"
            className="text-xs sm:text-sm font-semibold text-[#167D75] hover:text-[#0D524D] hover:underline flex items-center space-x-1"
          >
            <span>Browse all 32 comprehensive city salary guides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <article className="bg-white rounded-xl border border-[#DCE3E0] p-5 shadow-xs hover:border-[#167D75] transition-all">
            <span className="text-[11px] font-bold text-[#167D75] uppercase tracking-wider">New York City · US</span>
            <h3 className="text-base font-bold text-[#102A2E] mt-1">
              <a href="/guides/nyc-100k" className="hover:text-[#167D75]">Is $100,000 a Good Salary in New York City?</a>
            </h3>
            <p className="text-xs text-[#60706D] mt-2 leading-relaxed">
              Full tax withholding breakdown across IRS federal, NY state, and NYC resident taxes, combined with five-borough median rent and monthly savings margins.
            </p>
            <div className="mt-4 pt-3 border-t border-[#F7F8F5] flex items-center justify-between text-xs font-medium text-[#102A2E]">
              <span>29.1% Total Tax Drag</span>
              <a href="/guides/nyc-100k" className="font-bold text-[#167D75] hover:underline">Read Guide →</a>
            </div>
          </article>

          <article className="bg-white rounded-xl border border-[#DCE3E0] p-5 shadow-xs hover:border-[#167D75] transition-all">
            <span className="text-[11px] font-bold text-[#167D75] uppercase tracking-wider">London · United Kingdom</span>
            <h3 className="text-base font-bold text-[#102A2E] mt-1">
              <a href="/guides/london-75k" className="hover:text-[#167D75]">Is £75,000 a Good Salary in London?</a>
            </h3>
            <p className="text-xs text-[#60706D] mt-2 leading-relaxed">
              HMRC PAYE brackets, National Insurance contributions, TfL Zone 1-4 commuting passes, council tax bands, and outer-borough flat rental benchmarks.
            </p>
            <div className="mt-4 pt-3 border-t border-[#F7F8F5] flex items-center justify-between text-xs font-medium text-[#102A2E]">
              <span>£4,480 Net Monthly</span>
              <a href="/guides/london-75k" className="font-bold text-[#167D75] hover:underline">Read Guide →</a>
            </div>
          </article>

          <article className="bg-white rounded-xl border border-[#DCE3E0] p-5 shadow-xs hover:border-[#167D75] transition-all">
            <span className="text-[11px] font-bold text-[#167D75] uppercase tracking-wider">Berlin · Germany</span>
            <h3 className="text-base font-bold text-[#102A2E] mt-1">
              <a href="/guides/berlin-80k" className="hover:text-[#167D75]">Is €80,000 a Good Salary in Berlin?</a>
            </h3>
            <p className="text-xs text-[#60706D] mt-2 leading-relaxed">
              Steuerklasse 1 progressive rates, Solidaritätszuschlag, statutory public health insurance (GKV), warm vs cold rent differences, and BVG transit costs.
            </p>
            <div className="mt-4 pt-3 border-t border-[#F7F8F5] flex items-center justify-between text-xs font-medium text-[#102A2E]">
              <span>€3,920 Net Monthly</span>
              <a href="/guides/berlin-80k" className="font-bold text-[#167D75] hover:underline">Read Guide →</a>
            </div>
          </article>

          <article className="bg-white rounded-xl border border-[#DCE3E0] p-5 shadow-xs hover:border-[#167D75] transition-all">
            <span className="text-[11px] font-bold text-[#167D75] uppercase tracking-wider">Dubai · United Arab Emirates</span>
            <h3 className="text-base font-bold text-[#102A2E] mt-1">
              <a href="/guides/dubai-300k" className="hover:text-[#167D75]">Is 300,000 AED a Good Salary in Dubai?</a>
            </h3>
            <p className="text-xs text-[#60706D] mt-2 leading-relaxed">
              Analyzing zero personal income tax reality alongside 5% Dubai municipality housing fees, DEWA cooling tariffs, and international healthcare premiums.
            </p>
            <div className="mt-4 pt-3 border-t border-[#F7F8F5] flex items-center justify-between text-xs font-medium text-[#102A2E]">
              <span>25,000 AED / Month</span>
              <a href="/guides/dubai-300k" className="font-bold text-[#167D75] hover:underline">Read Guide →</a>
            </div>
          </article>

          <article className="bg-white rounded-xl border border-[#DCE3E0] p-5 shadow-xs hover:border-[#167D75] transition-all">
            <span className="text-[11px] font-bold text-[#167D75] uppercase tracking-wider">Toronto · Canada</span>
            <h3 className="text-base font-bold text-[#102A2E] mt-1">
              <a href="/guides/toronto-100k" className="hover:text-[#167D75]">Is CA$100,000 a Good Salary in Toronto?</a>
            </h3>
            <p className="text-xs text-[#60706D] mt-2 leading-relaxed">
              Federal CRA brackets, Ontario provincial surtax, CPP and Employment Insurance annual maximums, and Greater Toronto Area 1-bedroom rental pressure.
            </p>
            <div className="mt-4 pt-3 border-t border-[#F7F8F5] flex items-center justify-between text-xs font-medium text-[#102A2E]">
              <span>CA$6,020 Net Monthly</span>
              <a href="/guides/toronto-100k" className="font-bold text-[#167D75] hover:underline">Read Guide →</a>
            </div>
          </article>

          <article className="bg-white rounded-xl border border-[#DCE3E0] p-5 shadow-xs hover:border-[#167D75] transition-all">
            <span className="text-[11px] font-bold text-[#167D75] uppercase tracking-wider">Sydney · Australia</span>
            <h3 className="text-base font-bold text-[#102A2E] mt-1">
              <a href="/guides/sydney-120k" className="hover:text-[#167D75]">Is A$120,000 a Good Salary in Sydney?</a>
            </h3>
            <p className="text-xs text-[#60706D] mt-2 leading-relaxed">
              Australian Taxation Office (ATO) progressive brackets, 2% Medicare levy, mandatory employer Superannuation, and eastern suburbs median rental rates.
            </p>
            <div className="mt-4 pt-3 border-t border-[#F7F8F5] flex items-center justify-between text-xs font-medium text-[#102A2E]">
              <span>A$7,240 Net Monthly</span>
              <a href="/guides/sydney-120k" className="font-bold text-[#167D75] hover:underline">Read Guide →</a>
            </div>
          </article>
        </div>
      </section>

      {/* Algorithmic & Data Integrity Charter */}
      <section className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-[#102A2E] mb-2">Algorithmic & Data Integrity Charter</h2>
        <p className="text-sm text-slate-700 leading-relaxed mb-4">
          All financial outputs across LivWorthy are computed deterministically from verified statutory schedules (IRS, HMRC, CRA, ATO, Destatis) and official consumer price indices. We maintain a strict Zero-AI Math Policy: machine learning is never used to guess, estimate, or hallucinate tax liabilities or cost calculations.
        </p>
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-teal-800">
          <a href="/about" className="hover:underline">About LivWorthy →</a>
          <a href="/methodology" className="hover:underline">Calculation Methodology →</a>
          <a href="/sources" className="hover:underline">Verified Sources Registry →</a>
          <a href="/editorial-policy" className="hover:underline">Editorial Policy →</a>
          <a href="/data-policy" className="hover:underline">Data Policy →</a>
          <a href="/corrections" className="hover:underline">Corrections & Feedback →</a>
        </div>
      </section>
    </div>
  );
};
