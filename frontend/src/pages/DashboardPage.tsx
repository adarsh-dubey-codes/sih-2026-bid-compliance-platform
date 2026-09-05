import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { OFFICER_REVIEW_TENDERS } from '../services/mockData';
import { StatusBadge } from '../components/common/StatusBadge';
import { fetchDashboardStats } from '../services/api';
import type { TenderReviewItem } from '../types';

interface OutletContextType {
  showToast: (msg: string) => void;
}

export const DashboardPage: React.FC = () => {
  const { showToast } = useOutletContext<OutletContextType>();
  const navigate = useNavigate();
  const [tenders, setTenders] = useState<TenderReviewItem[]>(OFFICER_REVIEW_TENDERS);
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchDashboardStats().then((data) => {
      if (data) {
        setStats(data);
        if (data.bids && Array.isArray(data.bids) && data.bids.length > 0) {
          const formatted: TenderReviewItem[] = data.bids.map((b: any) => ({
            id: b.bid_id || 'TND-001',
            ref: b.tender_details?.tender_id || 'MoPNG/GAIL/2026/TND-001',
            title: b.tender_details?.title || 'Supply, Execution & Pipeline Infrastructure Integrity Services',
            bidder: b.bidder_details?.legal_name || 'Apex InfraTech & Global Pipeline Solutions',
            gstin: b.bidder_details?.gstin || '07AAAAC1234D1Z5',
            bidId: `#${b.bid_id}`,
            category: b.tender_details?.category || 'Works / Critical Infrastructure',
            score: b.precheck_score || 66.7,
            status: b.status === 'APPROVE' ? 'Verified Compliant' : b.status === 'REJECT' ? 'Critical Disqualification' : 'Action Required',
            riskLevel: b.risk_findings?.some((r: any) => r.risk_level === 'HIGH') ? 'high' : 'low',
            discrepanciesCount: b.risk_findings?.length || 2,
            flaggedClauses: b.risk_findings?.map((r: any) => r.affected_requirement) || ['Cl 4.1 (Entity Mismatch)', 'Cl 4.2 (OEM Auth Missing)'],
            submissionTime: new Date(b.submission_time).toLocaleDateString('en-GB'),
            deadline: '15-Mar-2026 17:30 IST'
          }));
          setTenders(formatted);
        }
      }
    }).catch(() => {});
  }, []);

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
    <div className="flex flex-col w-full min-h-screen bg-slate-100 p-4 lg:p-8 space-y-6">
      {/* Level 1: Page Header & Primary Actions */}
      <div className="bg-white border border-slate-300 rounded-lg p-5 lg:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-data">
              MINISTRY OF PETROLEUM & NATURAL GAS • STATUTORY TRIAGE CELL
            </div>
            <h1 className="text-[24px] lg:text-[28px] font-display text-slate-900 font-bold mt-1 tracking-tight">
              Tender Review & Triage Command Center
            </h1>
            <div className="text-[12px] text-slate-600 font-sans mt-0.5">
              Automated AI Pre-Screening & Deterministic Audit Queue under GFR Rule 144(xi)
            </div>
          </div>

          {/* 2 Primary Secondary Action Buttons */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto">
            <button
              onClick={() => showToast('Exporting Officer Triage Summary Report (PDF + Cryptographic Hash)...')}
              className="flex items-center gap-1.5 px-3.5 h-9 rounded-md bg-white border border-slate-300 text-slate-800 font-semibold text-[12px] hover:bg-slate-50 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-600">download</span>
              <span>Export Manifest</span>
            </button>
            <button
              onClick={() => showToast('Triggering batch AI re-triage across all open tender envelopes...')}
              className="flex items-center gap-1.5 px-4 h-9 rounded-md bg-[#0B192C] text-white font-bold text-[12px] hover:bg-[#1E3A5F] transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-400">auto_mode</span>
              <span>Re-Run AI Triage</span>
            </button>
          </div>
        </div>

        {/* Simplified Level 3 Metric Cards (3 Cards Maximum) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-300 rounded-md">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-data">
              Total Bids Evaluated
            </div>
            <div className="text-[22px] font-bold font-data text-slate-900 mt-1">
              {stats ? `${stats.submitted_bids || 12}` : "12"} <span className="text-[12px] font-normal text-slate-600">Active Bids</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-1 font-data">100% Deterministic Coverage</div>
          </div>

          <div className="p-4 bg-red-50/40 border border-red-200 rounded-md">
            <div className="text-[11px] font-semibold text-red-900 uppercase tracking-wider font-data">
              Action Required / Flagged
            </div>
            <div className="text-[22px] font-bold font-data text-red-950 mt-1">
              {stats ? `${String(stats.high_risk_bids || 3).padStart(2, '0')}` : "03"} <span className="text-[12px] font-normal text-red-800">Flagged Flaws</span>
            </div>
            <div className="text-[11px] text-red-800 mt-1 font-data">Requires Officer Determination</div>
          </div>

          <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-md">
            <div className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider font-data">
              Auto-Triaged Verified
            </div>
            <div className="text-[22px] font-bold font-data text-emerald-950 mt-1">
              {stats ? `${String(stats.active_tenders || 9).padStart(2, '0')}` : "09"} <span className="text-[12px] font-normal text-emerald-800">Passed</span>
            </div>
            <div className="text-[11px] text-emerald-800 mt-1 font-data">Ready for Financial Opening</div>
          </div>
        </div>
      </div>

      {/* Level 2: Primary Focus — Operational Tenders Table */}
      <div className="bg-white border border-slate-300 rounded-lg p-5 lg:p-6 shadow-xs space-y-4">
        {/* Table Search & Risk Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Ref, Title, or Bidder Name..."
              className="w-full h-8 pl-9 pr-3 text-[12px] font-data bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider font-data">Filter:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-300">
              {['all', 'high', 'medium', 'low'].map(risk => (
                <button
                  key={risk}
                  onClick={() => setRiskFilter(risk)}
                  className={`px-2.5 py-1 text-[11px] font-bold capitalize transition-colors rounded ${
                    riskFilter === risk
                      ? 'bg-[#0B192C] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {risk}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Review Table */}
        <div className="overflow-x-auto rounded-md border border-slate-300">
          <table className="w-full text-left border-collapse font-sans text-[12px]">
            <thead>
              <tr className="bg-[#0B192C] text-white font-data text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                <th className="py-3 px-4">Tender Reference</th>
                <th className="py-3 px-4">Bidder Entity</th>
                <th className="py-3 px-4">AI Score</th>
                <th className="py-3 px-4">Flagged Clauses</th>
                <th className="py-3 px-4">Deadline & Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredTenders.map((tender, idx) => (
                <tr
                  key={tender.id}
                  onClick={() => navigate('/inspector')}
                  className={`transition-colors hover:bg-slate-100 cursor-pointer ${
                    idx % 2 === 1 ? 'bg-slate-50/40' : ''
                  }`}
                  title="Click to open Evidence Analysis for this tender"
                >
                  <td className="py-3 px-4 align-top">
                    <div className="font-data text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{tender.ref}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-700 px-1 border rounded">STAGE 02</span>
                    </div>
                    <div className="font-display font-semibold text-slate-900 text-[13px] mt-0.5 max-w-md">
                      {tender.title}
                    </div>
                  </td>

                  <td className="py-3 px-4 align-top">
                    <div className="font-bold text-slate-900 text-[13px]">{tender.bidder}</div>
                    <div className="font-data text-[11px] text-slate-500">GSTIN: {tender.gstin}</div>
                  </td>

                  <td className="py-3 px-4 align-top">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[15px] font-bold font-data ${
                          tender.score === 100
                            ? 'text-emerald-800'
                            : tender.score >= 75
                            ? 'text-slate-900'
                            : 'text-red-800'
                        }`}
                      >
                        {tender.score}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 align-top">
                    {tender.flaggedClauses.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {tender.flaggedClauses.map((c: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-900 font-data text-[10px] font-bold"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <StatusBadge status="verified" label="All Clauses Cleared" />
                    )}
                  </td>

                  <td className="py-3 px-4 align-top">
                    <div className="text-[11px] font-data font-bold text-red-800">
                      {tender.deadline}
                    </div>
                    <StatusBadge
                      status={tender.riskLevel === 'high' || tender.riskLevel === 'critical' ? 'error' : 'notice'}
                      label={tender.status}
                      className="mt-1"
                    />
                  </td>

                  <td className="py-3 px-4 align-top text-right">
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/inspector');
                        }}
                        className="px-3 py-1 bg-[#0B192C] text-white rounded-md text-[11px] font-bold hover:bg-[#1E3A5F] flex items-center gap-1"
                      >
                        <span>Analyze Evidence</span>
                        <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
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
  );
};
