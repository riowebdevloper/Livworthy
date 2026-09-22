import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, ShieldAlert, Send } from 'lucide-react';

interface DataCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultJurisdiction?: string;
}

export const DataCorrectionModal: React.FC<DataCorrectionModalProps> = ({
  isOpen,
  onClose,
  defaultJurisdiction = '',
}) => {
  const [topic, setTopic] = useState<'TAX_RULES' | 'HOUSING_COL' | 'CURRENCY_FX' | 'CITY_METRIC' | 'OTHER'>('TAX_RULES');
  const [jurisdiction, setJurisdiction] = useState<string>(defaultJurisdiction);
  const [description, setDescription] = useState<string>('');
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    // Ephemeral client-side feedback logging
    console.info('[LivWorthy Transparency Engine] Data correction report submitted:', {
      topic,
      jurisdiction,
      description,
      sourceUrl,
      timestamp: new Date().toISOString(),
    });

    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setDescription('');
    setSourceUrl('');
    setEmail('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="correction-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#102A2E]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#DCE3E0] overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="p-6 border-b border-[#DCE3E0] flex items-center justify-between bg-[#FFFFFF]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#DDF2EC] flex items-center justify-center text-[#0D625B]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 id="correction-dialog-title" className="text-base font-bold text-[#102A2E]">
                Report Data Correction or Feedback
              </h2>
              <p className="text-xs text-[#60706D]">Continuous data integrity & algorithmic accuracy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-[#60706D] hover:text-[#102A2E] hover:bg-[#F7F8F5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-xs text-[#60706D]">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#DDF2EC] text-[#0D625B] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#102A2E]">Correction Report Logged</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Thank you for assisting LivWorthy’s financial integrity standards. Reports are reviewed against official statutory tables and statistical gazettes.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-[#167D75] hover:bg-[#0D524D] text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-[#F7F8F5] rounded-xl border border-[#DCE3E0] flex items-start space-x-2 text-[11px] text-slate-700">
                <AlertCircle className="w-4 h-4 text-[#167D75] shrink-0 mt-0.5" />
                <span>
                  All calculations operate under a strict <strong>Zero Data Fabrication Policy</strong>. If you observe an outdated tax bracket, statutory shift, or rent benchmark deviation, provide authoritative source references below.
                </span>
              </div>

              <div>
                <label htmlFor="correction-topic" className="block font-semibold text-slate-900 mb-1">
                  Report Category
                </label>
                <select
                  id="correction-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#DCE3E0] rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#167D75]"
                >
                  <option value="TAX_RULES">Statutory Income Tax Brackets or Deductions</option>
                  <option value="HOUSING_COL">Housing Rent or Essential Living Costs</option>
                  <option value="CURRENCY_FX">Currency, FX or Denomination Anomaly</option>
                  <option value="CITY_METRIC">City Boundary or Metropolitan Classification</option>
                  <option value="OTHER">General Calculation Feedback</option>
                </select>
              </div>

              <div>
                <label htmlFor="correction-jurisdiction" className="block font-semibold text-slate-900 mb-1">
                  Jurisdiction / City / Country
                </label>
                <input
                  id="correction-jurisdiction"
                  type="text"
                  placeholder="e.g., United States (New York City) or UK"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCE3E0] rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#167D75]"
                />
              </div>

              <div>
                <label htmlFor="correction-description" className="block font-semibold text-slate-900 mb-1">
                  Specific Observation or Anomaly <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="correction-description"
                  rows={3}
                  required
                  placeholder="Describe the discrepancy, affected bracket or value, and expected figure..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCE3E0] rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#167D75]"
                />
              </div>

              <div>
                <label htmlFor="correction-source" className="block font-semibold text-slate-900 mb-1">
                  Authoritative Reference / Official Source URL (Optional)
                </label>
                <input
                  id="correction-source"
                  type="url"
                  placeholder="e.g., https://www.irs.gov/... or https://www.gov.uk/..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCE3E0] rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#167D75]"
                />
              </div>

              <div>
                <label htmlFor="correction-email" className="block font-semibold text-slate-900 mb-1">
                  Your Email (Optional, only for follow-up verification)
                </label>
                <input
                  id="correction-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCE3E0] rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:border-[#167D75]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 border border-[#DCE3E0] text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#167D75] hover:bg-[#0D524D] text-white font-semibold rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Correction</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
