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

interface AuditLogRecord {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  entity: string;
  metadata?: Record<string, unknown>;
  sha256_root: string;
}

export const LedgerPage: React.FC = () => {
  const { showToast } = useOutletContext<OutletContextType>();
  const [assets] = useState(INITIAL_ASSETS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(INITIAL_AUDIT_EVENTS);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
  const [showVigilanceModal, setShowVigilanceModal] = useState<boolean>(false);

  useEffect(() => {
    fetchAuditLogs().then((logs: AuditLogRecord[] | null) => {
      if (logs && Array.isArray(logs) && logs.length > 0) {
        const formatted: AuditEvent[] = logs.map((log: AuditLogRecord) => ({
          timestamp: new Date(log.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          timeDetail: new Date(log.timestamp).toLocaleTimeString('en-GB'),
          blockRef: `#BLK-${log.id.slice(0, 6)}`,
          category: (log.action as AuditEvent['category']) || 'REGISTRY_VERIFICATION',
          actorName: log.actor || 'System Engine',
          actorTitle: 'Compliance Verification Node',
          actorFingerprint: `SHA256: ${log.sha256_root.slice(0, 16)}`,
          actionTitle: `${log.action} on ${log.entity}`,
          actionDetails: JSON.stringify(log.metadata || {}),
          sha256Root: log.sha256_root.slice(0, 16) + '...',
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
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#17152B] tracking-tight">
            Verification Ledger
          </h1>
          <p className="text-[14px] text-[#66627A] mt-1">
            Every verification action is traceable under Section 65B of the Indian Evidence Act.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBlockModal(true)}
            className="px-3.5 py-2 bg-white border border-[#E5E2EC] text-[#17152B] font-medium text-[13px] rounded-lg hover:bg-[#F8F9FC] transition-colors"
          >
            Verify Block Header
          </button>
          <button
            onClick={() => setShowVigilanceModal(true)}
            className="px-3.5 py-2 bg-white border border-[#E5E2EC] text-[#17152B] font-medium text-[13px] rounded-lg hover:bg-[#F8F9FC] transition-colors"
          >
            Vigilance Certificate
          </button>
          <button
            onClick={() => showToast('Exporting Notarized Package (ZIP + DSC)...')}
            className="px-4 py-2 bg-[#4527A0] text-white font-medium text-[13px] rounded-lg hover:bg-[#5E35B1] transition-colors"
          >
            Export Archive
          </button>
        </div>
      </div>

      {/* 5-Step Traceability Bar */}
      <div className="bg-white border border-[#E5E2EC] rounded-xl p-5 space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#66627A]">
          End-to-End Traceability Pipeline
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[12px]">
          <div className="p-2.5 rounded-lg bg-[#F8F9FC] border border-[#E5E2EC] text-center">
            <div className="text-[10px] text-[#66627A] font-semibold">1. Requirement</div>
            <div className="font-medium text-[#17152B] mt-0.5">GFR-144 Clause</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#F8F9FC] border border-[#E5E2EC] text-center">
            <div className="text-[10px] text-[#66627A] font-semibold">2. Evidence</div>
            <div className="font-medium text-[#17152B] mt-0.5">Submitted PDF</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#F8F9FC] border border-[#E5E2EC] text-center">
            <div className="text-[10px] text-[#66627A] font-semibold">3. Registry</div>
            <div className="font-medium text-[#17152B] mt-0.5">GSTN / ROC Sync</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#F8F9FC] border border-[#E5E2EC] text-center">
            <div className="text-[10px] text-[#66627A] font-semibold">4. Rule Decision</div>
            <div className="font-medium text-[#17152B] mt-0.5">OCR Evaluation</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-center">
            <div className="text-[10px] text-[#059669] font-semibold">5. Ledger Hash</div>
            <div className="font-medium text-[#059669] mt-0.5 font-data">SHA-256 Sealed</div>
          </div>
        </div>
      </div>

      {/* Off-Chain Asset Integrity Table */}
      <div className="bg-white border border-[#E5E2EC] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E2EC]">
          <h2 className="text-[16px] font-semibold text-[#17152B]">Off-Chain Document Tamper Testbed</h2>
          <p className="text-[12px] text-[#66627A] mt-0.5">Cryptographic verification comparing immutable hashes against live storage</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#F8F9FC] border-b border-[#E5E2EC] text-[11px] font-semibold text-[#66627A] uppercase tracking-wider">
                <th className="py-3 px-4">Evidence Asset Name</th>
                <th className="py-3 px-4">Immutable Block Hash</th>
                <th className="py-3 px-4">Recomputed Hash</th>
                <th className="py-3 px-4">Consensus</th>
                <th className="py-3 px-4 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2EC]">
              {assets.map((a) => (
                <tr key={a.id} className={a.status === 'tampered' ? 'bg-[#FEF2F2]' : 'hover:bg-[#F8F9FC] transition-colors'}>
                  <td className="py-3 px-4 font-medium text-[#17152B]">{a.name}</td>
                  <td className="py-3 px-4 font-data text-[12px] text-[#66627A]">{a.immutableHash.slice(0, 24)}...</td>
                  <td className="py-3 px-4 font-data text-[12px] text-[#66627A]">{a.recomputedHash.slice(0, 24)}...</td>
                  <td className="py-3 px-4 text-[12px] text-[#17152B]">{a.consensusCount}/4 Nodes Match</td>
                  <td className="py-3 px-4 text-right">
                    <StatusBadge
                      status={a.status === 'tampered' ? 'error' : 'compliant'}
                      label={a.status === 'tampered' ? 'Tamper Alert' : 'Verified'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chronological Audit Event Stream */}
      <div className="bg-white border border-[#E5E2EC] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E2EC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-semibold text-[#17152B]">Chronological Audit Event Stream</h2>
            <p className="text-[12px] text-[#66627A] mt-0.5">Immutable transcript of all verification transactions</p>
          </div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="text-[12px] font-medium border border-[#E5E2EC] rounded-lg px-2.5 py-1.5 bg-white text-[#17152B] focus:outline-none focus:border-[#4527A0]"
          >
            <option value="all">All Events</option>
            <option value="ruleset">Ruleset Events</option>
            <option value="bidder">Bidder Submissions</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#F8F9FC] border-b border-[#E5E2EC] text-[11px] font-semibold text-[#66627A] uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Block Ref</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">SHA-256 Digest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2EC]">
              {filteredEvents.map((evt, idx) => (
                <tr key={idx} className="hover:bg-[#F8F9FC] transition-colors">
                  <td className="py-3 px-4 text-[12px] text-[#66627A]">{evt.timestamp}</td>
                  <td className="py-3 px-4 font-data text-[12px] font-medium text-[#4527A0]">{evt.blockRef}</td>
                  <td className="py-3 px-4 font-medium text-[#17152B]">{evt.category}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-[#17152B]">{evt.actorName}</div>
                    <div className="text-[10px] text-[#66627A] font-data">{evt.actorFingerprint.slice(0, 16)}...</div>
                  </td>
                  <td className="py-3 px-4 text-[12px] text-[#66627A] max-w-xs truncate">{evt.actionTitle}</td>
                  <td className="py-3 px-4 text-right font-data text-[12px] text-[#17152B]">{evt.sha256Root}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Block Header Modal */}
      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        title="Raw Block Header Envelope"
        icon="hub"
        authorityBadge="HYPERLEDGER FABRIC & SUPABASE"
      >
        <pre className="font-data text-[12px] bg-[#F8F9FC] text-[#17152B] p-4 rounded-lg border border-[#E5E2EC] overflow-x-auto">
{`{
  "channel_id": "mopng-procure-ledger",
  "block_height": 419284,
  "previous_hash": "7d21bb0934ef00192a8bca0194857dfa4e01928374a",
  "data_hash": "8c34f9a03d81b9e248910ae821fba01945829104fa2",
  "consensus": "Raft 2.5 (4/4 Sovereign Nodes Verified)",
  "timestamp": "2026-03-14T18:11:02.109Z"
}`}
        </pre>
      </Modal>

      {/* Vigilance Certificate Modal */}
      <Modal
        isOpen={showVigilanceModal}
        onClose={() => setShowVigilanceModal(false)}
        title="Section 65B Statutory Vigilance Certificate"
        icon="verified"
        authorityBadge="INDIAN EVIDENCE ACT SECTION 65B"
      >
        <div className="space-y-3 text-[13px] text-[#17152B]">
          <div className="font-semibold">CERTIFICATE UNDER SECTION 65B OF INDIAN EVIDENCE ACT 1872</div>
          <p className="text-[#66627A] leading-relaxed">
            I, Rajeshwar Rao, IAS, Procurement Director, MoPNG, hereby certify that the electronic record for Tender <strong>MoPNG/GAIL/2026/TND-001</strong> stored on PostgreSQL & Hyperledger Fabric is authentic, un-altered, and cryptographically verified.
          </p>
          <div className="p-3 bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg font-data text-[11px] text-[#4527A0]">
            SHA-256 Digest: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
          </div>
        </div>
      </Modal>
    </div>
  );
};
