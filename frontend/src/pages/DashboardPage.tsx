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
            bidder: b.bidder_details?.legal_name || 'Apex InfraTech Solutions',
            gstin: b.bidder_details?.gstin || '07AAAAC1234D1Z5',
            bidId: `#${b.bid_id}`,
            category: b.tender_details?.category || 'Works / Critical Infrastructure',
            score: b.precheck_score || 66.7,
            status: b.status === 'APPROVE' ? 'Compliant' : b.status === 'REJECT' ? 'Non-Compliant' : 'Pending',
            riskLevel: b.risk_findings?.some((r: any) => r.risk_level === 'HIGH') ? 'high' : 'low',
            discrepanciesCount: b.risk_findings?.length || 2,
            flaggedClauses: b.risk_findings?.map((r: any) => r.affected_requirement) || ['Clause 4.1 (Name Mismatch)'],
            submissionTime: new Date(b.submission_time).toLocaleDateString('en-GB'),
            deadline: '15-Mar-2026'
          }));
          setTenders(formatted);
        }
      }
    }).catch(() => {});
  }, []);

  // Compute status metrics for 4 KPI Cards
  const totalBidsCount = stats?.submitted_bids || tenders.length || 12;
  const compliantCount = stats?.active_tenders || 7;
  const pendingCount = 3;
  const nonCompliantCount = stats?.high_risk_bids || 2;

  // Format recent bids table list
  const recentBidsList = tenders.slice(0, 5).map(t => {
    let displayStatus: 'verified' | 'warning' | 'error' = 'warning';
    let statusLabel = 'Pending';
    if (t.status === 'Compliant' || t.status === 'Ready for Approval' || t.score === 100) {
      displayStatus = 'verified';
      statusLabel = 'Compliant';
    } else if (t.status === 'Non-Compliant' || t.status === 'Rejected' || t.riskLevel === 'high') {
      displayStatus = 'error';
      statusLabel = 'Non-Compliant';
    }
    return {
      bidId: t.bidId || t.ref,
      organization: t.bidder,
      status: displayStatus,
      statusLabel: statusLabel,
      updatedOn: t.submissionTime || '04-Sep-2026',
    };
  });

  return (
    <div className="space-y-8">
      {/* Page Header Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#17152B] tracking-tight">Welcome back, Officer</h1>
          <p className="text-[14px] text-[#66627A] mt-0.5">Overview of bid compliance verification.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast('Exporting Compliance Summary PDF...')}
            className="px-4 py-2 bg-white border border-[#E5E2EC] text-[#17152B] text-[13px] font-medium rounded-lg hover:bg-[#F8F9FC] transition-colors"
          >
            Export Report
          </button>
          <button
            onClick={() => navigate('/inspector')}
            className="px-4 py-2 bg-[#4527A0] text-white text-[13px] font-medium rounded-lg hover:bg-[#5E35B1] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            <span>Start Review</span>
          </button>
        </div>
      </div>

      {/* 4 Clean KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card
          title="Total Bids"
          value={totalBidsCount}
          icon="folder"
          subtitle="All submitted bids"
          footer={<span className="text-[#66627A]">Updated today</span>}
        />
        <Card
          title="Compliant"
          value={compliantCount}
          icon="check_circle"
          valueClassName="text-[#047857]"
          subtitle="100% Passed verification"
          footer={<span className="text-[#047857] font-medium">Ready for award</span>}
        />
        <Card
          title="Pending Review"
          value={pendingCount}
          icon="hourglass_empty"
          valueClassName="text-[#B45309]"
          subtitle="Awaiting officer decision"
          footer={<span className="text-[#B45309] font-medium">Requires attention</span>}
        />
        <Card
          title="Non-Compliant"
          value={nonCompliantCount}
          icon="cancel"
          valueClassName="text-[#B91C1C]"
          subtitle="Discrepancies flagged"
          footer={<span className="text-[#B91C1C] font-medium">Disqualified</span>}
        />
      </div>

      {/* Balanced Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT (2 Cols): Recent Bids Table */}
        <div className="lg:col-span-2 bg-white border border-[#E5E2EC] rounded-[12px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-bold text-[#17152B]">Recent Bids</h2>
              <p className="text-[12px] text-[#66627A]">Latest bid submissions across active tenders</p>
            </div>
            <button
              onClick={() => navigate('/inspector')}
              className="text-[13px] text-[#4527A0] font-medium hover:underline"
            >
              View all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#E5E2EC] text-[#66627A] font-medium">
                  <th className="py-3 px-3">Bid ID</th>
                  <th className="py-3 px-3">Organization</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Updated On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2EC]">
                {recentBidsList.map((row, idx) => (
                  <tr
                    key={idx}
                    onClick={() => navigate('/inspector')}
                    className="hover:bg-[#F8F9FC] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-3 font-mono font-medium text-[#17152B]">{row.bidId}</td>
                    <td className="py-3.5 px-3 font-medium text-[#17152B]">{row.organization}</td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={row.status} label={row.statusLabel} />
                    </td>
                    <td className="py-3.5 px-3 text-right text-[#66627A]">{row.updatedOn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT (1 Col): Compliance Summary */}
        <div className="bg-white border border-[#E5E2EC] rounded-[12px] p-6 space-y-5 flex flex-col justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-[#17152B]">Compliance Summary</h2>
            <p className="text-[12px] text-[#66627A]">Distribution of bid compliance status</p>
          </div>

          {/* Clean Donut Pie Visualization */}
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#FEF2F2]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Compliant segment */}
                <path
                  className="text-[#047857]"
                  strokeDasharray="58, 100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Pending segment */}
                <path
                  className="text-[#B45309]"
                  strokeDasharray="25, 100"
                  strokeDashoffset="-58"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Non-compliant segment */}
                <path
                  className="text-[#B91C1C]"
                  strokeDasharray="17, 100"
                  strokeDashoffset="-83"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[22px] font-bold text-[#17152B] leading-none">{totalBidsCount}</span>
                <span className="text-[10px] text-[#66627A] uppercase font-medium mt-0.5">Total Bids</span>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full space-y-2 text-[12px] pt-2 border-t border-[#E5E2EC]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#047857]" />
                  <span className="text-[#17152B]">Compliant</span>
                </div>
                <span className="font-semibold text-[#17152B]">{compliantCount} (58%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]" />
                  <span className="text-[#17152B]">Pending</span>
                </div>
                <span className="font-semibold text-[#17152B]">{pendingCount} (25%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B91C1C]" />
                  <span className="text-[#17152B]">Non-Compliant</span>
                </div>
                <span className="font-semibold text-[#17152B]">{nonCompliantCount} (17%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="space-y-3">
        <h2 className="text-[16px] font-bold text-[#17152B]">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <button
            onClick={() => showToast('Opening New Bid Creation Portal...')}
            className="bg-white border border-[#E5E2EC] hover:border-[#4527A0] p-4 rounded-[12px] flex items-center gap-3 transition-colors group text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F8F9FC] group-hover:bg-[#F3E8FF] flex items-center justify-center text-[#4527A0] shrink-0">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#17152B]">New Bid</div>
              <div className="text-[11px] text-[#66627A]">Create entry</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/checklist')}
            className="bg-white border border-[#E5E2EC] hover:border-[#4527A0] p-4 rounded-[12px] flex items-center gap-3 transition-colors group text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F8F9FC] group-hover:bg-[#F3E8FF] flex items-center justify-center text-[#4527A0] shrink-0">
              <span className="material-symbols-outlined text-[20px]">fact_check</span>
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#17152B]">Checklist</div>
              <div className="text-[11px] text-[#66627A]">Verify rules</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/inspector')}
            className="bg-white border border-[#E5E2EC] hover:border-[#4527A0] p-4 rounded-[12px] flex items-center gap-3 transition-colors group text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F8F9FC] group-hover:bg-[#F3E8FF] flex items-center justify-center text-[#4527A0] shrink-0">
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#17152B]">Upload Evidence</div>
              <div className="text-[11px] text-[#66627A]">Inspect docs</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/inspector')}
            className="bg-white border border-[#E5E2EC] hover:border-[#4527A0] p-4 rounded-[12px] flex items-center gap-3 transition-colors group text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F8F9FC] group-hover:bg-[#F3E8FF] flex items-center justify-center text-[#4527A0] shrink-0">
              <span className="material-symbols-outlined text-[20px]">gavel</span>
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#17152B]">Officer Review</div>
              <div className="text-[11px] text-[#66627A]">Pending items</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/ledger')}
            className="bg-white border border-[#E5E2EC] hover:border-[#4527A0] p-4 rounded-[12px] flex items-center gap-3 transition-colors group text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F8F9FC] group-hover:bg-[#F3E8FF] flex items-center justify-center text-[#4527A0] shrink-0">
              <span className="material-symbols-outlined text-[20px]">assessment</span>
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#17152B]">Generate Report</div>
              <div className="text-[11px] text-[#66627A]">Audit log</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

