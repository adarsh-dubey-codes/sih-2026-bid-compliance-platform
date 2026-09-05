import React, { useState } from 'react';
import type { NavigationPath } from '../../types';
import { OFFICER_REVIEW_TENDERS } from '../../data/mockData';
import { StatusBadge } from '../common/StatusBadge';
import { Card } from '../common/Card';

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
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#17152B] tracking-tight">
            Officer Review Queue
          </h1>
          <p className="text-[14px] text-[#66627A] mt-1">
            Review flagged bids and execute statutory qualification determinations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onShowToast('Exporting Officer Triage Manifest...')}
            className="px-3.5 py-2 bg-white border border-[#E5E2EC] text-[#17152B] font-medium text-[13px] rounded-lg hover:bg-[#F8F9FC] transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[17px] text-[#66627A]">download</span>
            <span>Export Manifest</span>
          </button>
          <button
            onClick={() => onShowToast('Re-running AI pre-screening triage...')}
            className="px-4 py-2 bg-[#4527A0] text-white font-medium text-[13px] rounded-lg hover:bg-[#5E35B1] transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[17px]">refresh</span>
            <span>Re-Run Triage</span>
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Pending Reviews"
          value="12 Bids"
          subtitle="Tenders awaiting officer triage"
          icon="schedule"
          iconColor="text-[#4527A0]"
        />

        <Card
          title="High Risk"
          value="03 Flagged"
          subtitle="Critical discrepancies detected"
          icon="warning"
          iconColor="text-[#DC2626]"
          titleClassName="text-[#DC2626]"
          valueClassName="text-[#DC2626]"
        />

        <Card
          title="Approved"
          value="09 Verified"
          subtitle="100% Pre-check compliance"
          icon="check_circle"
          iconColor="text-[#059669]"
          titleClassName="text-[#059669]"
          valueClassName="text-[#059669]"
        />

        <Card
          title="SLA Window"
          value="48.0 Hours"
          subtitle="GeM Clause 18.3 clarification"
          icon="timer"
          iconColor="text-[#D97706]"
          titleClassName="text-[#D97706]"
          valueClassName="text-[#D97706]"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white border border-[#E5E2EC] rounded-xl overflow-hidden space-y-0">
        {/* Filters */}
        <div className="p-4 border-b border-[#E5E2EC] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#66627A] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Ref, Bidder, or Title..."
              className="w-full h-9 pl-9 pr-3 text-[13px] bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg text-[#17152B] focus:bg-white focus:outline-none focus:border-[#4527A0]"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[12px] font-medium text-[#66627A]">Risk Filter:</span>
            <div className="flex items-center bg-[#F1EFF7] p-0.5 rounded-lg border border-[#E5E2EC]">
              {['all', 'high', 'medium', 'low'].map((risk) => (
                <button
                  key={risk}
                  onClick={() => setRiskFilter(risk)}
                  className={`px-3 py-1 text-[11px] font-medium rounded-md capitalize transition-colors ${
                    riskFilter === risk
                      ? 'bg-[#4527A0] text-white'
                      : 'text-[#66627A] hover:text-[#17152B]'
                  }`}
                >
                  {risk}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#F8F9FC] border-b border-[#E5E2EC] text-[11px] font-semibold text-[#66627A] uppercase tracking-wider">
                <th className="py-3 px-4">Tender Reference</th>
                <th className="py-3 px-4">Bidder Entity</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Issues</th>
                <th className="py-3 px-4">Risk & Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2EC]">
              {filteredTenders.map((tender) => (
                <tr key={tender.id} className="hover:bg-[#F8F9FC] transition-colors">
                  <td className="py-3.5 px-4 align-top">
                    <div className="font-data text-[12px] font-bold text-[#17152B]">{tender.ref}</div>
                    <div className="text-[12px] text-[#66627A] mt-0.5 line-clamp-1">{tender.title}</div>
                  </td>

                  <td className="py-3.5 px-4 align-top">
                    <div className="font-medium text-[#17152B]">{tender.bidder}</div>
                    <div className="text-[11px] font-data text-[#66627A]">GSTIN: {tender.gstin}</div>
                  </td>

                  <td className="py-3.5 px-4 align-top font-data text-[13px] font-bold">
                    <span
                      className={
                        tender.score === 100
                          ? 'text-[#059669]'
                          : tender.score >= 75
                          ? 'text-[#D97706]'
                          : 'text-[#DC2626]'
                      }
                    >
                      {tender.score}%
                    </span>
                  </td>

                  <td className="py-3.5 px-4 align-top">
                    {tender.flaggedClauses.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {tender.flaggedClauses.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] font-data text-[10px] font-bold"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#059669] font-medium">All Clauses Passed</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 align-top">
                    <StatusBadge
                      status={tender.riskLevel === 'high' || tender.riskLevel === 'critical' ? 'error' : 'compliant'}
                      label={tender.status}
                    />
                  </td>

                  <td className="py-3.5 px-4 align-top text-right">
                    <button
                      onClick={() => onNavigate('split-screen-evidence-inspector', 'Experience_Cert_GAIL_P2.pdf')}
                      className="px-2.5 py-1 text-[12px] font-medium text-[#4527A0] bg-[#F1EFF7] hover:bg-[#E5E2EC] rounded-md transition-colors"
                    >
                      Review
                    </button>
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
