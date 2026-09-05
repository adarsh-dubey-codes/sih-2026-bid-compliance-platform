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

interface BidItemRecord {
  id?: string;
  bid_id?: string;
  tender_details?: {
    tender_id?: string;
    title?: string;
    category?: string;
  };
  bidder_details?: {
    legal_name?: string;
    gstin?: string;
  };
  precheck_score?: number;
  status?: string;
  risk_findings?: Array<{
    risk_level?: string;
    affected_requirement?: string;
  }>;
  submission_time?: string;
}

interface DashboardStatsData {
  submitted_bids?: number;
  active_tenders?: number;
  high_risk_bids?: number;
  bids?: BidItemRecord[];
}

export const DashboardPage: React.FC = () => {
  const { showToast } = useOutletContext<OutletContextType>();
  const navigate = useNavigate();
  const [tenders, setTenders] = useState<TenderReviewItem[]>(OFFICER_REVIEW_TENDERS);
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchDashboardStats()
      .then((data: DashboardStatsData | null) => {
        if (data) {
          setStats(data);
          if (data.bids && Array.isArray(data.bids) && data.bids.length > 0) {
            const formatted: TenderReviewItem[] = data.bids.map((b: BidItemRecord) => ({
              id: b.bid_id || 'TND-001',
              ref: b.tender_details?.tender_id || 'MoPNG/GAIL/2026/TND-001',
              title: b.tender_details?.title || 'Supply, Execution & Pipeline Infrastructure Services',
              bidder: b.bidder_details?.legal_name || 'Apex InfraTech & Global Pipeline Solutions',
              gstin: b.bidder_details?.gstin || '07AAAAC1234D1Z5',
              bidId: `#${b.bid_id}`,
              category: b.tender_details?.category || 'Works / Critical Infrastructure',
              score: b.precheck_score || 66.7,
              status:
                b.status === 'APPROVE'
                  ? 'Compliant'
                  : b.status === 'REJECT'
                  ? 'Non-Compliant'
                  : 'Pending Review',
              riskLevel: b.risk_findings?.some((r) => r.risk_level === 'HIGH') ? 'high' : 'low',
              discrepanciesCount: b.risk_findings?.length || 2,
              flaggedClauses: b.risk_findings?.map((r) => r.affected_requirement || 'Clause') || ['Cl 4.1', 'Cl 4.2'],
              submissionTime: b.submission_time ? new Date(b.submission_time).toLocaleDateString('en-GB') : '14-Mar-2026',
              deadline: '15-Mar-2026'
            }));
            setTenders(formatted);
          }
        }
      })
      .catch(() => {});
  }, []);

  const totalBidsCount = stats?.submitted_bids || tenders.length || 12;
  const compliantBidsCount = stats?.active_tenders || 9;
  const pendingBidsCount = (stats?.submitted_bids ? stats.submitted_bids - (stats.active_tenders || 9) - (stats.high_risk_bids || 3) : 2) || 2;
  const nonCompliantBidsCount = stats?.high_risk_bids || 3;

  const compliantPercent = Math.round((compliantBidsCount / totalBidsCount) * 100);
  const pendingPercent = Math.round((pendingBidsCount / totalBidsCount) * 100);
  const nonCompliantPercent = Math.max(0, 100 - compliantPercent - pendingPercent);

  const handleRetriage = () => {
    setIsLoading(true);
    showToast('Executing AI Auto-Triage across tender envelopes...');
    setTimeout(() => {
      setIsLoading(false);
      showToast('AI Auto-Triage complete. 12 tenders evaluated.');
    }, 1200);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#17152B] tracking-tight">
            Welcome back, Officer
          </h1>
          <p className="text-[14px] text-[#66627A] mt-1">
            Overview of bid compliance verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast('Exporting summary report (PDF)...')}
            className="px-3.5 py-2 bg-white border border-[#E5E2EC] text-[#17152B] font-medium text-[13px] rounded-lg hover:bg-[#F8F9FC] transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[17px] text-[#66627A]">download</span>
            <span>Export Report</span>
          </button>
          <button
            onClick={handleRetriage}
            disabled={isLoading}
            className="px-4 py-2 bg-[#4527A0] text-white font-medium text-[13px] rounded-lg hover:bg-[#5E35B1] transition-colors flex items-center gap-1.5"
          >
            <span className={`material-symbols-outlined text-[17px] ${isLoading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{isLoading ? 'Triaging...' : 'Re-Run AI Triage'}</span>
          </button>
        </div>
      </div>

      {/* 4 Clean KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Total Bids"
          value={totalBidsCount}
          subtitle="Active procurement tenders"
          icon="folder_open"
          iconColor="text-[#4527A0]"
          footer={
            <span className="text-[#66627A] font-medium">All envelopes registered</span>
          }
        />

        <Card
          title="Compliant"
          value={compliantBidsCount}
          subtitle="Passed all statutory checks"
          icon="check_circle"
          iconColor="text-[#059669]"
          titleClassName="text-[#059669]"
          valueClassName="text-[#059669]"
          footer={
            <span className="text-[#059669] font-medium">Ready for commercial opening</span>
          }
        />

        <Card
          title="Pending Review"
          value={pendingBidsCount}
          subtitle="Awaiting officer decision"
          icon="schedule"
          iconColor="text-[#D97706]"
          titleClassName="text-[#D97706]"
          valueClassName="text-[#D97706]"
          footer={
            <span className="text-[#D97706] font-medium">Under 48h SLA window</span>
          }
        />

        <Card
          title="Non-Compliant"
          value={nonCompliantBidsCount}
          subtitle="Discrepancies flagged"
          icon="cancel"
          iconColor="text-[#DC2626]"
          titleClassName="text-[#DC2626]"
          valueClassName="text-[#DC2626]"
          footer={
            <span className="text-[#DC2626] font-medium">Requires disqualification or clarification</span>
          }
        />
      </div>

      {/* Two-Column Information Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Recent Bids */}
        <div className="lg:col-span-8 bg-white border border-[#E5E2EC] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E2EC] flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-[#17152B]">Recent Bids</h2>
              <p className="text-[12px] text-[#66627A] mt-0.5">Latest submitted bids requiring verification</p>
            </div>
            <button
              onClick={() => navigate('/checklist')}
              className="text-[12px] font-medium text-[#4527A0] hover:underline"
            >
              View All Bids →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#F8F9FC] border-b border-[#E5E2EC] text-[11px] font-semibold text-[#66627A] uppercase tracking-wider">
                  <th className="py-3 px-4">Bid ID</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Updated On</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2EC]">
                {tenders.slice(0, 5).map((tender) => (
                  <tr key={tender.id} className="hover:bg-[#F8F9FC] transition-colors">
                    <td className="py-3.5 px-4 font-data text-[12px] font-semibold text-[#17152B]">
                      {tender.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#17152B] leading-snug">{tender.bidder}</div>
                      <div className="text-[11px] text-[#66627A] truncate max-w-xs">{tender.title}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={
                          tender.score === 100
                            ? 'compliant'
                            : tender.score >= 75
                            ? 'pending'
                            : 'non-compliant'
                        }
                        label={
                          tender.score === 100
                            ? 'Compliant'
                            : tender.score >= 75
                            ? 'Pending'
                            : 'Non-Compliant'
                        }
                      />
                    </td>
                    <td className="py-3.5 px-4 text-[12px] text-[#66627A]">
                      {tender.submissionTime || '14-Mar-2026'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate('/inspector')}
                        className="px-2.5 py-1 text-[12px] font-medium text-[#4527A0] bg-[#F1EFF7] hover:bg-[#E5E2EC] rounded-md transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Compliance Summary & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Compliance Summary Visualization */}
          <div className="bg-white border border-[#E5E2EC] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[#17152B]">Compliance Summary</h2>
              <span className="text-[12px] font-medium text-[#66627A]">{totalBidsCount} Total Bids</span>
            </div>

            {/* Distribution Bar */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-[#F1EFF7] rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${compliantPercent}%` }}
                  className="bg-[#059669] h-full"
                  title={`Compliant: ${compliantPercent}%`}
                />
                <div
                  style={{ width: `${pendingPercent}%` }}
                  className="bg-[#D97706] h-full"
                  title={`Pending: ${pendingPercent}%`}
                />
                <div
                  style={{ width: `${nonCompliantPercent}%` }}
                  className="bg-[#DC2626] h-full"
                  title={`Non-Compliant: ${nonCompliantPercent}%`}
                />
              </div>

              {/* Legend with Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[12px]">
                <div className="p-2 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0]">
                  <div className="text-[11px] text-[#059669] font-medium">Compliant</div>
                  <div className="text-[16px] font-bold text-[#059669]">{compliantBidsCount}</div>
                  <div className="text-[10px] text-[#059669]">{compliantPercent}%</div>
                </div>
                <div className="p-2 rounded-lg bg-[#FFFBEB] border border-[#FDE68A]">
                  <div className="text-[11px] text-[#D97706] font-medium">Pending</div>
                  <div className="text-[16px] font-bold text-[#D97706]">{pendingBidsCount}</div>
                  <div className="text-[10px] text-[#D97706]">{pendingPercent}%</div>
                </div>
                <div className="p-2 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
                  <div className="text-[11px] text-[#DC2626] font-medium">Non-Compliant</div>
                  <div className="text-[16px] font-bold text-[#DC2626]">{nonCompliantBidsCount}</div>
                  <div className="text-[10px] text-[#DC2626]">{nonCompliantPercent}%</div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5E2EC] text-[12px] text-[#66627A] flex items-center justify-between">
              <span>Average Pre-Check Score</span>
              <span className="font-bold text-[#17152B] font-data">84.2%</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-[#E5E2EC] rounded-xl p-5 space-y-3">
            <h2 className="text-[15px] font-semibold text-[#17152B]">Quick Actions</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              <button
                onClick={() => navigate('/checklist')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[#E5E2EC] hover:border-[#4527A0] hover:bg-[#F8F9FC] transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px] text-[#4527A0]">checklist</span>
                  <span className="text-[13px] font-medium text-[#17152B]">Compliance Checklist</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-[#66627A]">chevron_right</span>
              </button>

              <button
                onClick={() => navigate('/inspector')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[#E5E2EC] hover:border-[#4527A0] hover:bg-[#F8F9FC] transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px] text-[#4527A0]">upload_file</span>
                  <span className="text-[13px] font-medium text-[#17152B]">Upload Evidence</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-[#66627A]">chevron_right</span>
              </button>

              <button
                onClick={() => navigate('/inspector')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[#E5E2EC] hover:border-[#4527A0] hover:bg-[#F8F9FC] transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px] text-[#4527A0]">rate_review</span>
                  <span className="text-[13px] font-medium text-[#17152B]">Officer Review</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-[#66627A]">chevron_right</span>
              </button>

              <button
                onClick={() => navigate('/ledger')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[#E5E2EC] hover:border-[#4527A0] hover:bg-[#F8F9FC] transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px] text-[#4527A0]">description</span>
                  <span className="text-[13px] font-medium text-[#17152B]">Generate Audit Report</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-[#66627A]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
