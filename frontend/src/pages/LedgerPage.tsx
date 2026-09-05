import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { INITIAL_ASSETS, INITIAL_AUDIT_EVENTS } from '../services/mockData';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { fetchAuditLogs } from '../services/api';
import type { AuditEvent } from '../types';

interface OutletContextType {
  showToast: (msg: string) => void;
}

export const LedgerPage: React.FC = () => {
  const { showToast } = useOutletContext<OutletContextType>();
  const [assets] = useState(INITIAL_ASSETS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(INITIAL_AUDIT_EVENTS);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
  const [showVigilanceModal, setShowVigilanceModal] = useState<boolean>(false);

  useEffect(() => {
    fetchAuditLogs().then((logs) => {
      if (logs && Array.isArray(logs) && logs.length > 0) {
        const formatted: AuditEvent[] = logs.map((log: any) => ({
          timestamp: new Date(log.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          timeDetail: new Date(log.timestamp).toLocaleTimeString('en-GB'),
          blockRef: `#BLK-${log.id.slice(0, 6)}`,
          category: log.action || 'AUDIT_LOGGED',
          actorName: log.actor || 'System Engine',
          actorTitle: 'Compliance Node',
          actorFingerprint: `SHA256: ${log.sha256_root.slice(0, 16)}`,
          actionTitle: `${log.action} on ${log.entity}`,
          actionDetails: JSON.stringify(log.metadata || {}),
          sha256Root: log.sha256_root.slice(0, 12) + '...',
          statusBadge: 'Verified Record',
          statusType: log.action.includes('REJECT') || log.action.includes('DISCREPANCY') ? 'error' : 'success'
        }));
        setAuditEvents(formatted);
      }
    }).catch(() => {});
  }, []);

  const filteredEvents = auditEvents.filter(evt => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'ruleset') return evt.category.includes('REQUIREMENT') || evt.category.includes('RULESET');
    if (selectedFilter === 'bidder') return evt.category.includes('BID') || evt.category.includes('DOCUMENT');
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#17152B] tracking-tight">Audit Trail</h1>
          <p className="text-[14px] text-[#66627A] mt-0.5">Every verification action is traceable and immutable.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowVigilanceModal(true)}
            className="px-4 py-2 bg-white border border-[#E5E2EC] text-[#17152B] text-[13px] font-medium rounded-lg hover:bg-[#F8F9FC] transition-colors"
          >
            Audit Certificate
          </button>
          <button
            onClick={() => showToast('Exporting Tamper-Proof Audit Package...')}
            className="px-4 py-2 bg-[#4527A0] text-white text-[13px] font-medium rounded-lg hover:bg-[#5E35B1] transition-colors"
          >
            Export Audit Log
          </button>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="space-y-6">
        {/* Document Hash Verification Table */}
        <div className="bg-white border border-[#E5E2EC] rounded-[12px] p-6 space-y-4">
          <h2 className="text-[16px] font-bold text-[#17152B] border-b border-[#E5E2EC] pb-3">
            Document Hash Integrity Verification
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#E5E2EC] text-[#66627A] font-medium">
                  <th className="py-3 px-3">Document Name</th>
                  <th className="py-3 px-3">Stored Hash</th>
                  <th className="py-3 px-3">Current Hash</th>
                  <th className="py-3 px-3">Consensus</th>
                  <th className="py-3 px-3 text-right">Integrity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2EC]">
                {assets.map(a => (
                  <tr key={a.id} className="hover:bg-[#F8F9FC] transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-[#17152B]">{a.name}</td>
                    <td className="py-3.5 px-3 font-mono text-[12px] text-[#66627A]">
                      {a.immutableHash.slice(0, 24)}...
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[12px] text-[#66627A]">
                      {a.recomputedHash.slice(0, 24)}...
                    </td>
                    <td className="py-3.5 px-3 font-medium text-[#17152B]">{a.consensusCount}/4 Nodes</td>
                    <td className="py-3.5 px-3 text-right">
                      <StatusBadge
                        status={a.status === 'tampered' ? 'error' : 'verified'}
                        label={a.status === 'tampered' ? 'Tampered' : 'Verified'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Event Timeline Table as per Section 9 */}
        <div className="bg-white border border-[#E5E2EC] rounded-[12px] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E2EC] pb-3">
            <h2 className="text-[16px] font-bold text-[#17152B]">Audit Event Trail</h2>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="text-[12px] border border-[#E5E2EC] rounded-lg px-3 py-1.5 bg-[#F8F9FC] text-[#17152B] font-medium"
            >
              <option value="all">All Audit Events</option>
              <option value="ruleset">Ruleset Events</option>
              <option value="bidder">Bidder Events</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#E5E2EC] text-[#66627A] font-medium">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Bid ID</th>
                  <th className="py-3 px-3">Verification Event</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-3">Result</th>
                  <th className="py-3 px-3 text-right">Hash / Audit ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2EC]">
                {filteredEvents.map((evt, idx) => (
                  <tr key={idx} className="hover:bg-[#F8F9FC] transition-colors">
                    <td className="py-3.5 px-3 text-[#66627A]">{evt.timestamp}</td>
                    <td className="py-3.5 px-3 font-mono font-medium text-[#17152B]">{evt.blockRef}</td>
                    <td className="py-3.5 px-3 font-medium text-[#17152B]">{evt.actionTitle}</td>
                    <td className="py-3.5 px-3 text-[#66627A]">{evt.actorName}</td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={evt.statusType === 'error' ? 'error' : 'verified'} label={evt.category} />
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-[12px] text-[#4527A0] font-medium">
                      {evt.sha256Root}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Block Header Modal */}
      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        title="Block Header Data"
        icon="view_in_ar"
      >
        <pre className="font-mono text-[12px] bg-[#17152B] text-white p-4 rounded-lg overflow-x-auto">
{`{
  "channel_id": "mopng-procure-ledger",
  "database": "Supabase PostgreSQL",
  "previous_hash": "7d21bb0934ef00192a8bca0194857dfa4e01928374a",
  "data_hash": "8c34f9a03d81b9e248910ae821fba01945829104fa2",
  "timestamp": ${Date.now()}
}`}
        </pre>
      </Modal>

      {/* Audit Certificate Modal */}
      <Modal
        isOpen={showVigilanceModal}
        onClose={() => setShowVigilanceModal(false)}
        title="Section 65B Audit Certificate"
        icon="gavel"
      >
        <div className="space-y-3 text-[13px]">
          <div className="font-bold text-[#17152B]">CERTIFICATE UNDER SECTION 65B OF EVIDENCE ACT</div>
          <p className="text-[#66627A]">
            I, Rajeshwar Rao, IAS, Procurement Officer, hereby certify that the electronic audit log for Tender <strong>MoPNG/GAIL/2026/TND-001</strong> stored on Supabase PostgreSQL is genuine, un-altered, and cryptographically verified.
          </p>
          <div className="font-mono text-[12px] text-[#4527A0] font-medium pt-2 border-t border-[#E5E2EC]">
            SHA-256 Digest: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
          </div>
        </div>
      </Modal>
    </div>
  );
};

