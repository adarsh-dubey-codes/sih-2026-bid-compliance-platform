import React, { useState } from 'react';
import type { NavigationPath } from '../../types';
import { OFFICER_REVIEW_TENDERS } from '../../data/mockData';

interface OfficerReviewQueueProps {
  onNavigate: (path: NavigationPath, docKey?: string) => void;
  onShowToast: (msg: string) => void;
}

export const OfficerReviewQueue: React.FC<OfficerReviewQueueProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [tenders] = useState(OFFICER_REVIEW_TENDERS);
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTenders = tenders.filter(t => {
    if (riskFilter !== 'all' && t.riskLevel !== riskFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.ref.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.bidder.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f8f9ff]">
      {/* Top Banner */}
      <div className="bg-white px-8 py-5 border-b border-[#c8c4d5] shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#1f108e]">
              <span className="material-symbols-outlined text-[16px]">gavel</span>
              <span>Central Procurement Triage & Officer Review Desk</span>
            </div>
            <h1 className="text-[24px] text-[#0d1c2e] font-bold mt-1 tracking-tight">
              Institutional Bid Review Queue & Triage Desk
            </h1>
            <div className="text-[13px] text-[#464553] mt-1">
              Deterministic AI Pre-Screening & Statutory Audit Queue under GFR Rule 144(xi)
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onShowToast('Exporting Officer Triage Summary Report...')}
              className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-white border border-[#c8c4d5] text-[#0d1c2e] font-semibold text-[12px] hover:bg-[#eff4ff] transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px] text-[#1f108e]">download</span>
              <span>Export Triage Summary</span>
            </button>
            <button
              onClick={() => onShowToast('Triggering batch AI re-triage across all open tender envelopes...')}
              className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-[#3730a3] text-white font-bold text-[12px] hover:bg-[#1f108e] transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">auto_mode</span>
              <span>Re-Run AI Auto-Triage</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#c8c4d5] shadow-xs">
            <div className="text-[11px] text-[#777584] uppercase font-bold">Pending Tenders</div>
            <div className="text-[28px] font-bold text-[#0d1c2e] mt-1">12 Bids</div>
            <div className="text-[11px] text-[#464553] mt-1">MoPNG & Public Enterprise Enclaves</div>
          </div>
          <div className="p-4 rounded-xl bg-[#ffdad6]/40 border border-[#ffdad6] shadow-xs">
            <div className="text-[11px] text-[#ba1a1a] uppercase font-bold">High Risk Discrepancies</div>
            <div className="text-[28px] font-bold text-[#ba1a1a] mt-1">03 Flagged</div>
            <div className="text-[11px] text-[#ba1a1a] font-semibold mt-1">Requires Officer Determination</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-[#c8c4d5] shadow-xs">
            <div className="text-[11px] text-[#777584] uppercase font-bold">Auto-Triaged Clear</div>
            <div className="text-[28px] font-bold text-[#15803D] mt-1">09 Verified</div>
            <div className="text-[11px] text-[#15803D] font-semibold mt-1">100% Score Cleared</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-[#c8c4d5] shadow-xs">
            <div className="text-[11px] text-[#777584] uppercase font-bold">Target SLA Window</div>
            <div className="text-[28px] font-bold text-[#1f108e] mt-1">48.0 Hours</div>
            <div className="text-[11px] text-[#464553] mt-1">Statutory Clarification Cl 18.3</div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="p-8 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#777584] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Tender Ref, Title, or Bidder Name..."
              className="w-full h-10 pl-9 pr-3 text-[13px] bg-white border border-[#c8c4d5] rounded-xl focus:outline-none focus:border-[#1f108e]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#777584] font-semibold">Filter by Risk:</span>
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#c8c4d5]">
              {['all', 'high', 'medium', 'low', 'critical'].map(risk => (
                <button
                  key={risk}
                  onClick={() => setRiskFilter(risk)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md capitalize transition-colors ${
                    riskFilter === risk
                      ? 'bg-[#1f108e] text-white shadow-xs'
                      : 'text-[#464553] hover:bg-[#eff4ff]'
                  }`}
                >
                  {risk}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-white rounded-xl border border-[#c8c4d5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#eff4ff] border-b border-[#c8c4d5] text-[11px] text-[#464553] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Tender Reference & Category</th>
                  <th className="py-3 px-4">Bidder Entity & ID</th>
                  <th className="py-3 px-4">AI Compliance Score</th>
                  <th className="py-3 px-4">Flagged Discrepancy Clauses</th>
                  <th className="py-3 px-4">Deadline & Status</th>
                  <th className="py-3 px-4 text-right">Officer Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c8c4d5] text-[13px]">
                {filteredTenders.map(tender => (
                  <tr key={tender.id} className="hover:bg-[#eff4ff] transition-colors">
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-mono text-[12px] font-bold text-[#1f108e]">
                        {tender.ref}
                      </span>
                      <div className="font-semibold text-[#0d1c2e] mt-0.5 max-w-md">
                        {tender.title}
                      </div>
                      <div className="text-[11px] text-[#777584] mt-0.5">{tender.category}</div>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-[#0d1c2e]">{tender.bidder}</div>
                      <div className="font-mono text-[11px] text-[#777584]">GSTIN: {tender.gstin}</div>
                      <div className="font-mono text-[10px] text-[#3730a3] mt-0.5">{tender.bidId}</div>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[16px] font-extrabold font-mono ${
                            tender.score === 100
                              ? 'text-[#15803D]'
                              : tender.score >= 75
                              ? 'text-[#3730a3]'
                              : 'text-[#ba1a1a]'
                          }`}
                        >
                          {tender.score}%
                        </span>
                        <div className="w-16 h-2 rounded-full bg-[#eff4ff] overflow-hidden border border-[#c8c4d5]">
                          <div
                            style={{ width: `${tender.score}%` }}
                            className={`h-full ${
                              tender.score === 100
                                ? 'bg-[#15803D]'
                                : tender.score >= 75
                                ? 'bg-[#3730a3]'
                                : 'bg-[#ba1a1a]'
                            }`}
                          ></div>
                        </div>
                      </div>
                      <div className="text-[11px] text-[#464553] mt-1 font-medium">
                        {tender.discrepanciesCount > 0
                          ? `${tender.discrepanciesCount} Flaw(s) Intercepted`
                          : 'Zero Discrepancies'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      {tender.flaggedClauses.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {tender.flaggedClauses.map((c, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] font-mono text-[11px] font-bold"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] text-[11px] font-bold">
                          All Clauses Passed
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <div className="text-[12px] font-semibold text-[#ba1a1a] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">timer</span>
                        <span>{tender.deadline}</span>
                      </div>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          tender.riskLevel === 'high' || tender.riskLevel === 'critical'
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : 'bg-[#e6eeff] text-[#3730a3]'
                        }`}
                      >
                        {tender.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <button
                          onClick={() => onNavigate('split-screen-evidence-inspector', 'Experience_Cert_GAIL_P2.pdf')}
                          className="px-3 py-1 bg-[#1f108e] text-white rounded-lg text-[11px] font-bold hover:bg-[#4b41e1] flex items-center gap-1 shadow-xs"
                        >
                          <span>Inspect Evidence</span>
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </button>
                        <button
                          onClick={() => onNavigate('cryptographic-audit-ledger')}
                          className="text-[#3730a3] hover:underline text-[11px] font-semibold"
                        >
                          Audit Ledger
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
