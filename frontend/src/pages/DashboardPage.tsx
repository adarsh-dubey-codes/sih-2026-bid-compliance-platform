import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { OFFICER_REVIEW_TENDERS } from '../services/mockData';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card } from '../components/common/Card';
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
      {/* Top Page Header Banner */}
      <div className="bg-white border border-slate-300 rounded-lg p-5 lg:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 font-data">
              <span className="material-symbols-outlined text-[16px] text-amber-600">gavel</span>
              <span>MINISTRY OF PETROLEUM & NATURAL GAS • STATUTORY AUDIT CELL</span>
            </div>
            <h1 className="text-[22px] lg:text-[26px] font-display text-slate-900 font-bold mt-1 tracking-tight">
              Institutional Bid Review Queue & Triage Command Center
            </h1>
            <div className="text-[12px] text-slate-600 font-sans mt-0.5">
              Automated AI Pre-Screening & Deterministic Audit Queue under GFR Rule 144(xi) & CVC Directives
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
            <button
              onClick={() => showToast('Exporting Officer Triage Summary Report (PDF + Cryptographic Hash)...')}
              className="flex items-center gap-1.5 px-3.5 h-9 rounded-md bg-white border border-slate-300 text-slate-800 font-semibold text-[12px] hover:bg-slate-50 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-600">download</span>
              <span>Export Triage Manifest</span>
            </button>
            <button
              onClick={() => showToast('Triggering batch AI re-triage across all open tender envelopes...')}
              className="flex items-center gap-1.5 px-4 h-9 rounded-md bg-[#0A2540] text-white font-bold text-[12px] hover:bg-[#1E3A5F] transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-400">auto_mode</span>
              <span>Re-Run AI Auto-Triage</span>
            </button>
          </div>
        </div>

        {/* Mission Control Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <Card
            title="Total Bids Evaluated"
            value={stats ? `${stats.submitted_bids || 12} Bids` : "12 Bids"}
            subtitle="MoPNG & GAIL Active Enclaves"
            titleClassName="text-slate-600 font-semibold"
            valueClassName="text-slate-900 font-data"
            className="bg-slate-50 border-slate-300"
            footer={<span className="text-emerald-700 font-bold">✓ 100% Deterministic Coverage</span>}
          />
          <Card
            title="Risk Exposure / Discrepancies"
            value={stats ? `${String(stats.high_risk_bids || 3).padStart(2, '0')} Flagged` : "03 Flagged"}
            subtitle="Requires Officer Determination"
            titleClassName="text-red-800 font-semibold"
            valueClassName="text-red-900 font-data"
            className="bg-red-50/50 border-red-200"
            footer={<span className="text-red-800 font-bold">! Critical Disqualifications Flagged</span>}
          />
          <Card
            title="Auto-Triaged Compliant"
            value={stats ? `${String(stats.active_tenders || 9).padStart(2, '0')} Verified` : "09 Verified"}
            subtitle="100% Pre-Check Passed"
            titleClassName="text-emerald-800 font-semibold"
            valueClassName="text-emerald-900 font-data"
            className="bg-emerald-50/40 border-emerald-200"
            footer={<span className="text-emerald-800 font-bold">✓ Ready for Financial Opening</span>}
          />
          <Card
            title="SLA Target Window"
            value="48.0 Hours"
            subtitle="GeM Clause 18.3 Clarification"
            titleClassName="text-slate-700 font-semibold"
            valueClassName="text-slate-900 font-data"
            className="bg-slate-50 border-slate-300"
            footer={<span className="text-amber-800 font-bold">⏱ Window Closes 17-Mar 06:00 IST</span>}
          />
        </div>
      </div>

      {/* Institutional Table & Triage Section */}
      <div className="bg-white border border-slate-300 rounded-lg p-5 lg:p-6 shadow-xs space-y-4">
        {/* Table Search & Risk Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Tender Ref, Title, or Bidder Name..."
              className="w-full h-9 pl-9 pr-3 text-[12px] font-data bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider font-data">Risk Filter:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-300">
              {['all', 'high', 'medium', 'low', 'critical'].map(risk => (
                <button
                  key={risk}
                  onClick={() => setRiskFilter(risk)}
                  className={`px-3 py-1 text-[11px] font-bold capitalize transition-colors rounded ${
                    riskFilter === risk
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {risk}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Institutional Review Table */}
        <div className="overflow-x-auto rounded-md border border-slate-300">
          <table className="w-full text-left border-collapse font-sans text-[12px]">
            <thead>
              <tr className="bg-[#0B192C] text-white font-data text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                <th className="py-3 px-4">Tender Reference & Category</th>
                <th className="py-3 px-4">Bidder Entity & ID</th>
                <th className="py-3 px-4">AI Score</th>
                <th className="py-3 px-4">Flagged Clauses</th>
                <th className="py-3 px-4">Deadline & Status</th>
                <th className="py-3 px-4 text-right">Officer Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredTenders.map((tender, idx) => (
                <tr
                  key={tender.id}
                  className={`transition-colors hover:bg-slate-100/80 ${
                    idx % 2 === 1 ? 'bg-slate-50/50' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 align-top">
                    <div className="font-data text-[12px] font-bold text-slate-900">
                      {tender.ref}
                    </div>
                    <div className="font-display font-semibold text-slate-800 text-[13px] mt-0.5 max-w-md">
                      {tender.title}
                    </div>
                    <div className="text-[10px] font-data text-slate-500 uppercase tracking-wider mt-0.5">
                      {tender.category}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 align-top">
                    <div className="font-bold text-slate-900 text-[13px]">{tender.bidder}</div>
                    <div className="font-data text-[11px] text-slate-600">GSTIN: {tender.gstin}</div>
                    <div className="font-data text-[10px] text-slate-500 mt-0.5">{tender.bidId}</div>
                  </td>

                  <td className="py-3.5 px-4 align-top">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[16px] font-bold font-data ${
                          tender.score === 100
                            ? 'text-emerald-800'
                            : tender.score >= 75
                            ? 'text-slate-800'
                            : 'text-red-800'
                        }`}
                      >
                        {tender.score}%
                      </span>
                      <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                        <div
                          style={{ width: `${tender.score}%` }}
                          className={`h-full ${
                            tender.score === 100
                              ? 'bg-emerald-700'
                              : tender.score >= 75
                              ? 'bg-slate-700'
                              : 'bg-red-700'
                          }`}
                        ></div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 font-data mt-1">
                      {tender.discrepanciesCount > 0
                        ? `${tender.discrepanciesCount} Flaw(s) Intercepted`
                        : '0 Discrepancies'}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 align-top">
                    {tender.flaggedClauses.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {tender.flaggedClauses.map((c: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-red-950/10 border border-red-700/40 text-red-900 font-data text-[10px] font-bold"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <StatusBadge status="verified" label="All Clauses Cleared" />
                    )}
                  </td>

                  <td className="py-3.5 px-4 align-top">
                    <div className="text-[11px] font-data font-bold text-red-800 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">timer</span>
                      <span>{tender.deadline}</span>
                    </div>
                    <StatusBadge
                      status={tender.riskLevel === 'high' || tender.riskLevel === 'critical' ? 'error' : 'notice'}
                      label={tender.status}
                      className="mt-1"
                    />
                  </td>

                  <td className="py-3.5 px-4 align-top text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      <button
                        onClick={() => navigate('/inspector')}
                        className="px-3 py-1.5 bg-[#0B192C] text-white rounded text-[11px] font-bold hover:bg-[#1E3A5F] flex items-center gap-1 shadow-xs"
                      >
                        <span>Inspect Evidence</span>
                        <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                      </button>
                      <button
                        onClick={() => navigate('/ledger')}
                        className="text-slate-700 hover:underline text-[11px] font-bold font-data"
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
  );
};
