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
          actorTitle: 'Sovereign Compliance Node',
          actorFingerprint: `SHA256: ${log.sha256_root.slice(0, 16)}`,
          actionTitle: `${log.action} on ${log.entity}`,
          actionDetails: JSON.stringify(log.metadata || {}),
          sha256Root: log.sha256_root.slice(0, 12) + '...',
          statusBadge: 'Verified Database Record',
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
    <div className="flex flex-col w-full min-h-screen bg-slate-100 p-4 lg:p-8 space-y-6">
      {/* Top Banner (Level 1 Title) */}
      <div className="bg-white border border-slate-300 rounded-lg p-5 lg:p-6 shadow-xs space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-data font-bold uppercase text-slate-500 tracking-wider">
              SECTION 65B IT ACT 2000 CERTIFIABLE NON-REPUDIATION AUDIT TRAIL
            </div>
            <h1 className="text-[22px] lg:text-[26px] font-display text-slate-900 font-bold mt-1 tracking-tight">
              Cryptographic Audit Ledger & Integrity Testbed
            </h1>
            <div className="text-[12px] text-slate-600 font-sans mt-0.5">
              Distributed Provenance for NIT MoPNG/GAIL/2026/TND-001
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start xl:self-auto flex-wrap">
            <button
              onClick={() => setShowBlockModal(true)}
              className="px-3.5 h-8 bg-slate-100 border border-slate-300 text-slate-900 font-data text-[11px] font-bold rounded-md hover:bg-slate-200"
            >
              Verify Block Header
            </button>
            <button
              onClick={() => setShowVigilanceModal(true)}
              className="px-3.5 h-8 bg-white border border-slate-300 text-slate-900 font-data text-[11px] font-bold rounded-md hover:bg-slate-50"
            >
              Print Vigilance Cert
            </button>
            <button
              onClick={() => showToast('Exporting Notarized Package (SHA256 Manifest + DSC Cert)...')}
              className="px-4 h-8 bg-[#0B192C] text-white font-data text-[11px] font-bold rounded-md hover:bg-[#1E3A5F]"
            >
              Export Package (ZIP + DSC)
            </button>
          </div>
        </div>

        {/* Traceability Pipeline Flow */}
        <div className="p-3.5 bg-[#0B192C] text-white rounded-md border border-slate-800 space-y-1.5">
          <div className="text-[10px] font-data font-bold text-amber-400 uppercase tracking-widest">
            END-TO-END CRYPTOGRAPHIC TRACEABILITY PIPELINE
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-data pt-1 border-t border-slate-800">
            <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-700">1. Requirement</span>
            <span className="text-slate-500">→</span>
            <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-700">2. Submitted Evidence</span>
            <span className="text-slate-500">→</span>
            <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-700">3. Registry Verification</span>
            <span className="text-slate-500">→</span>
            <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-700">4. Rule Decision</span>
            <span className="text-slate-500">→</span>
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded border border-amber-500/40 font-bold">
              5. Sealed Audit Record (SHA-256)
            </span>
          </div>
        </div>
      </div>

      {/* Main Operations Grid */}
      <div className="space-y-6">
        {/* Off-Chain Asset Verification Table */}
        <div className="bg-white rounded-lg border border-slate-300 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-100 border-b border-slate-300 font-display font-bold text-[#0B192C] text-[15px]">
            Off-Chain Document Tamper Testbed & SHA-256 Hashing Subsystem
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-[12px]">
              <thead>
                <tr className="bg-[#0B192C] text-white font-data text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                  <th className="p-3">Evidence Asset Name</th>
                  <th className="p-3">Immutable Block Hash</th>
                  <th className="p-3">Recomputed Off-Chain Hash</th>
                  <th className="p-3">Quorum Consensus</th>
                  <th className="p-3 text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {assets.map(a => (
                  <tr key={a.id} className={a.status === 'tampered' ? 'bg-red-50/40' : 'hover:bg-slate-50'}>
                    <td className="p-3 font-bold text-slate-900">{a.name}</td>
                    <td className="p-3 font-data text-[11px] text-slate-700">{a.immutableHash.slice(0, 26)}...</td>
                    <td className="p-3 font-data text-[11px] text-slate-700">{a.recomputedHash.slice(0, 26)}...</td>
                    <td className="p-3 font-data font-bold text-slate-900">{a.consensusCount}/4 Nodes Match</td>
                    <td className="p-3 text-right">
                      <StatusBadge
                        status={a.status === 'tampered' ? 'error' : 'verified'}
                        label={a.status === 'tampered' ? 'TAMPERING INTERCEPTED' : 'INTEGRITY VERIFIED'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Event Stream Table */}
        <div className="bg-white rounded-lg border border-slate-300 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-100 border-b border-slate-300 flex justify-between items-center">
            <span className="font-display font-bold text-[#0B192C] text-[15px]">
              Chronological Audit Event Stream & Block Transcripts
            </span>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="text-[11px] font-data border border-slate-300 rounded px-2.5 py-1 bg-white font-bold"
            >
              <option value="all">All Audit Events</option>
              <option value="ruleset">Ruleset Committed</option>
              <option value="bidder">Bidder Submissions</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-[12px]">
              <thead>
                <tr className="bg-[#0B192C] text-white font-data text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                  <th className="p-3">Timestamp (IST)</th>
                  <th className="p-3">Block Ref</th>
                  <th className="p-3">Event Category</th>
                  <th className="p-3">Actor & Fingerprint</th>
                  <th className="p-3">Action Details</th>
                  <th className="p-3 text-right">SHA-256 Root</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white font-sans">
                {filteredEvents.map((evt, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-data text-[11px] text-slate-800">{evt.timestamp}</td>
                    <td className="p-3 font-data font-bold text-slate-900">{evt.blockRef}</td>
                    <td className="p-3 font-bold uppercase text-[11px] text-slate-800">{evt.category}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{evt.actorName}</div>
                      <div className="font-data text-[10px] text-slate-500">{evt.actorFingerprint}</div>
                    </td>
                    <td className="p-3 text-slate-800">{evt.actionTitle}</td>
                    <td className="p-3 text-right font-data text-[11px] text-slate-900 font-bold">{evt.sha256Root}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Raw Block Header Modal */}
      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        title="Ledger Block Envelope"
        icon="view_in_ar"
      >
        <pre className="font-data text-[11px] bg-slate-900 text-slate-200 p-3.5 rounded border border-slate-700 overflow-x-auto">
{`{
  "channel_id": "mopng-procure-ledger",
  "database": "Supabase PostgreSQL",
  "previous_hash": "7d21bb0934ef00192a8bca0194857dfa4e01928374a",
  "data_hash": "8c34f9a03d81b9e248910ae821fba01945829104fa2",
  "consensus": "Raft 2.5 (4/4 Sovereign Nodes Verified)",
  "timestamp": ${Date.now()}
}`}
        </pre>
      </Modal>

      {/* Vigilance Certificate Modal */}
      <Modal
        isOpen={showVigilanceModal}
        onClose={() => setShowVigilanceModal(false)}
        title="Section 65B Statutory Vigilance Certificate"
        icon="gavel"
      >
        <div className="space-y-2 text-[12px]">
          <div className="font-bold text-slate-900 font-display">CERTIFICATE UNDER SECTION 65B OF INDIAN EVIDENCE ACT 1872</div>
          <p className="text-slate-700 font-sans">
            I, Rajeshwar Rao, IAS, Procurement Director, MoPNG, hereby certify that the electronic record for Tender <strong>MoPNG/GAIL/2026/TND-001</strong> stored on PostgreSQL & Hyperledger Fabric is genuine, un-altered, and cryptographically verified.
          </p>
          <div className="font-data text-[11px] text-[#0B192C] font-bold pt-1">
            SHA-256 Digest: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
          </div>
        </div>
      </Modal>
    </div>
  );
};
