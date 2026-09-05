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

  const pendingCount = tenders.filter(t => t.riskLevel === 'high' || t.riskLevel === 'medium').length;
  const highRiskCount = tenders.filter(t => t.riskLevel === 'high').length;
  const approvedCount = 9;
  const rejectedCount = 2;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#17152B] tracking-tight">Officer Review Desk</h1>
          <p className="text-[14px] text-[#66627A] mt-0.5">Review and decide on bids requiring officer attention.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onShowToast('Exporting Officer Review Summary...')}
            className="px-4 py-2 bg-white border border-[#E5E2EC] text-[#17152B] text-[13px] font-medium rounded-lg hover:bg-[#F8F9FC] transition-colors"
          >
            Export Summary
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards as per Section 8 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card title="Pending Reviews" value={pendingCount} icon="hourglass_empty" valueClassName="text-[#B45309]" subtitle="Awaiting decision" />
        <Card title="High Risk" value={highRiskCount} icon="warning" valueClassName="text-[#B91C1C]" subtitle="Severe discrepancies" />
        <Card title="Approved" value={approvedCount} icon="check_circle" valueClassName="text-[#047857]" subtitle="Verified compliant" />
        <Card title="Rejected" value={rejectedCount} icon="cancel" valueClassName="text-[#B91C1C]" subtitle="Disqualified bids" />
      </div>

      {/* Main Review Table Section */}
      <div className="bg-white border border-[#E5E2EC] rounded-[12px] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#66627A] text-[18px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Tender ID or Bidder..."
              className="w-full h-9 pl-9 pr-3 text-[13px] bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg focus:outline-none focus:border-[#4527A0]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#66627A] font-medium">Risk Filter:</span>
            <div className="flex items-center bg-[#F8F9FC] p-0.5 rounded-lg border border-[#E5E2EC] text-[12px]">
              {['all', 'high', 'medium', 'low'].map(r => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-3 py-1 rounded-md font-medium capitalize ${
                    riskFilter === r ? 'bg-[#4527A0] text-white' : 'text-[#66627A] hover:text-[#17152B]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#E5E2EC] text-[#66627A] font-medium">
                <th className="py-3 px-3">Bid ID</th>
                <th className="py-3 px-3">Bidder</th>
                <th className="py-3 px-3">Compliance Score</th>
                <th className="py-3 px-3">Issues</th>
                <th className="py-3 px-3">Risk</th>
                <th className="py-3 px-3">Submitted</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2EC]">
              {filteredTenders.map(t => (
                <tr key={t.id} className="hover:bg-[#F8F9FC] transition-colors">
                  <td className="py-3.5 px-3 font-mono font-medium text-[#17152B]">{t.bidId}</td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-[#17152B]">{t.bidder}</div>
                    <div className="text-[12px] text-[#66627A] font-mono">{t.ref}</div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-[#17152B]">{t.score}%</td>
                  <td className="py-3.5 px-3">
                    {t.flaggedClauses.length > 0 ? (
                      <span className="text-[#B91C1C] font-medium text-[12px]">
                        {t.flaggedClauses.length} Discrepancies
                      </span>
                    ) : (
                      <span className="text-[#047857] font-medium text-[12px]">0 Issues</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge
                      status={t.riskLevel === 'high' ? 'error' : t.riskLevel === 'medium' ? 'warning' : 'verified'}
                      label={t.riskLevel}
                    />
                  </td>
                  <td className="py-3.5 px-3 text-[#66627A]">{t.submissionTime || '04-Sep-2026'}</td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onNavigate('split-screen-evidence-inspector', 'Experience_Cert_GAIL_P2.pdf')}
                        className="px-3 py-1.5 bg-[#4527A0] text-white rounded-lg text-[12px] font-medium hover:bg-[#5E35B1]"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => onShowToast('Approved Bid')}
                        className="px-3 py-1.5 bg-white border border-[#047857] text-[#047857] rounded-lg text-[12px] font-medium hover:bg-[#ECFDF5]"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onShowToast('Rejected Bid')}
                        className="px-3 py-1.5 bg-white border border-[#B91C1C] text-[#B91C1C] rounded-lg text-[12px] font-medium hover:bg-[#FEF2F2]"
                      >
                        Reject
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

