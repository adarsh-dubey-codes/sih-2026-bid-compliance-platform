import React, { useState } from 'react';
import { INITIAL_ASSETS, INITIAL_AUDIT_EVENTS } from '../../data/mockData';

interface CryptographicAuditLedgerProps {
  onShowToast: (msg: string) => void;
}

export const CryptographicAuditLedger: React.FC<CryptographicAuditLedgerProps> = ({ onShowToast }) => {
  const [assets] = useState(INITIAL_ASSETS);
  const [auditEvents] = useState(INITIAL_AUDIT_EVENTS);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isRehashing, setIsRehashing] = useState<boolean>(false);
  const [showRehashBanner, setShowRehashBanner] = useState<boolean>(false);
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
  const [showVigilanceModal, setShowVigilanceModal] = useState<boolean>(false);

  const filteredEvents = auditEvents.filter(evt => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'ruleset') return evt.category === 'RULESET_COMMITTED';
    if (selectedFilter === 'bidder') return evt.category === 'BID_SUBMISSION_SEAL';
    if (selectedFilter === 'eval') return evt.category === 'ENGINE_DISCREPANCY' || evt.category === 'REGISTRY_VERIFICATION';
    return true;
  });

  const handleExecuteRehash = () => {
    setIsRehashing(true);
    setShowRehashBanner(true);
    setTimeout(() => {
      setIsRehashing(false);
      setShowRehashBanner(false);
      onShowToast('Off-Chain SHA-256 Check Completed: 3 Valid, 1 Discrepancy Verified.');
    }, 2000);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f8f9ff]">
      {/* Top Command & Statutory Authority Bar */}
      <div className="w-full bg-white px-8 py-5 shadow-xs border-b border-[#c8c4d5]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-[#4b41e1] text-[11px] font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">security</span>
              <span>Statutory Provenance Verification Protocol • Sec 65B IT Act 2000 Certifiable</span>
            </div>
            <h1 className="text-[24px] text-[#0d1c2e] font-bold mt-1 tracking-tight">
              Cryptographic Audit Trail & Evidence Provenance Ledger
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#464553] mt-1.5">
              <span className="flex items-center gap-1 font-semibold text-[#0d1c2e]">
                <span className="w-2 h-2 rounded-full bg-[#4b41e1]"></span>
                CVC Vigilance Procurement Manual 2026
              </span>
              <span className="opacity-40">•</span>
              <span>ISO/IEC 27001 Cryptographic Non-Repudiation</span>
              <span className="opacity-40">•</span>
              <span>Tender: <strong className="font-mono text-[#0d1c2e]">MoPNG/GAIL/2026/TND-001</strong></span>
              <span className="opacity-40">•</span>
              <span>Entity: <strong className="text-[#3730a3] font-bold">Apex InfraTech & Global Pipeline Solutions</strong></span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 self-start xl:self-auto flex-wrap">
            <button
              onClick={() => setShowBlockModal(true)}
              className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-[#e6eeff] text-[#3730a3] font-semibold text-[12px] hover:bg-[#dce9ff] transition-all"
            >
              <span className="material-symbols-outlined text-[17px]">hub</span>
              <span>Verify Raw Block Header</span>
            </button>
            <button
              onClick={() => setShowVigilanceModal(true)}
              className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-white border border-[#c8c4d5] text-[#0d1c2e] font-semibold text-[12px] hover:bg-[#eff4ff] transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[17px] text-[#1f108e]">print</span>
              <span>Print Statutory Vigilance Certificate</span>
            </button>
            <button
              onClick={() => onShowToast('Packaging Notarized Archive (SHA256 Manifest + DSC Cert)... Download Initiated.')}
              className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-[#3730a3] text-white font-bold text-[12px] hover:bg-[#1f108e] transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[17px]">verified</span>
              <span>Export Notarized Audit Package (ZIP + DSC)</span>
            </button>
          </div>
        </div>

        {/* Distributed Ledger Status Deck */}
        <div className="mt-6 p-4 rounded-2xl bg-[#eff4ff] border border-[#c8c4d5] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#c8c4d5]">
            <div className="w-10 h-10 rounded-xl bg-[#3730a3] flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-[22px]">account_tree</span>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-[#777584] uppercase font-semibold">Ledger Channel</div>
              <div className="font-mono text-[13px] text-[#0d1c2e] font-bold truncate">mopng-procure-ledger</div>
              <div className="text-[11px] text-[#4b41e1] font-semibold mt-0.5">Fabric v2.5.4 LTS Active</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#c8c4d5]">
            <div className="w-10 h-10 rounded-xl bg-[#4b41e1] flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-[22px]">view_in_ar</span>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-[#777584] uppercase font-semibold">Current Height / State</div>
              <div className="font-mono text-[13px] text-[#0d1c2e] font-bold flex items-center gap-1">
                <span>Block #419,284</span>
                <span className="px-1.5 py-0.2 rounded bg-[#e6eeff] text-[10px] text-[#4b41e1] font-bold">FINALIZED</span>
              </div>
              <div className="font-mono text-[11px] text-[#464553] truncate">Root: 8c34f9a0...3d81b9e2</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#c8c4d5]">
            <div className="w-10 h-10 rounded-xl bg-[#3a388b] flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-[22px]">groups</span>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-[#777584] uppercase font-semibold">Consensus Mechanism</div>
              <div className="text-[13px] text-[#0d1c2e] font-bold truncate">Raft 2.5 Multi-Peer (4/4)</div>
              <div className="text-[11px] text-[#464553] flex items-center gap-1 mt-0.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4b41e1]"></span>
                <span>NIC • MoPNG • GeM • CVC Nodes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#c8c4d5]">
            <div className="w-10 h-10 rounded-xl bg-[#e6eeff] flex items-center justify-center text-[#3730a3] shrink-0">
              <span className="material-symbols-outlined text-[22px]">history_toggle_off</span>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-[#777584] uppercase font-semibold">Network Epoch Latency</div>
              <div className="font-mono text-[13px] text-[#0d1c2e] font-bold">14ms NTP (NPL-India Sync)</div>
              <div className="text-[11px] text-[#4b41e1] font-semibold flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[13px]">verified_user</span>
                <span>Zero Ledger Fork Drift</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Audit Operations Body */}
      <div className="px-8 py-8 flex flex-col gap-8">
        {/* Section 1: Live Cryptographic Evidence Integrity Testbed */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1f108e]">
                <span className="material-symbols-outlined text-[16px]">find_replace</span>
                <span>Deterministic Evidence Validation Subsystem</span>
              </div>
              <h2 className="text-[20px] text-[#0d1c2e] font-bold">
                Interactive Off-Chain Document Tamper Testbed
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                disabled={isRehashing}
                onClick={handleExecuteRehash}
                className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-[#4b41e1] text-white font-semibold text-[12px] hover:bg-[#3730a3] transition-all shadow-xs"
              >
                <span className={`material-symbols-outlined text-[16px] ${isRehashing ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>{isRehashing ? 'Hashing in Progress...' : 'Execute Live SHA-256 Re-Hash'}</span>
              </button>
            </div>
          </div>

          {/* Policy Callout */}
          <div className="p-4 rounded-xl bg-white border border-[#c8c4d5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#e6eeff] flex items-center justify-center text-[#3730a3] shrink-0">
              <span className="material-symbols-outlined text-[22px]">policy</span>
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-[#0d1c2e]">Evidence Inviolability & Statutory Non-Repudiation Policy</div>
              <p className="text-[12px] text-[#464553] mt-0.5 leading-relaxed">
                The Hyperledger Fabric node network guarantees immutable evidence provenance and non-repudiation under GFR 2017 & CVC statutory directives. Deterministic algorithms evaluate technical compliance while the distributed ledger mathematically enforces zero byte alteration post-submission window.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#eff4ff] font-mono text-[12px] text-[#3730a3] font-bold self-stretch sm:self-auto flex items-center justify-center border border-[#c8c4d5]">
              Consensus: 100% Validated
            </div>
          </div>

          {/* Rehash Animation Banner */}
          {showRehashBanner && (
            <div className="px-4 py-3 bg-[#e6eeff] border border-[#4b41e1] rounded-xl flex items-center justify-between text-[12px] transition-all">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4b41e1] animate-spin text-[18px]">autorenew</span>
                <span className="font-mono text-[#0d1c2e]">
                  Running NIC-CCA cryptographic verification against distributed blocks... [Nodes 01-04 Responded]
                </span>
              </div>
              <span className="font-semibold text-[#4b41e1]">Consensus Latency: 9ms</span>
            </div>
          )}

          {/* Evidence Verification Table */}
          <div className="bg-white rounded-xl shadow-xs border border-[#c8c4d5] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff] border-b border-[#c8c4d5] text-[11px] text-[#464553] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Evidence Asset Name & Context</th>
                    <th className="py-3 px-4">Immutable Block Hash (Anchored at Bid Time)</th>
                    <th className="py-3 px-4">Off-Chain Storage Recomputed Hash</th>
                    <th className="py-3 px-4">Node Peer Consensus</th>
                    <th className="py-3 px-4 text-right">Statutory Audit Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c8c4d5] text-[13px]">
                  {assets.map(asset => (
                    <tr
                      key={asset.id}
                      className={`transition-colors ${
                        asset.status === 'tampered' ? 'bg-[#ffdad6]/20' : 'hover:bg-[#eff4ff]'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              asset.status === 'tampered'
                                ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                : 'bg-[#e6eeff] text-[#3730a3]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {asset.status === 'tampered' ? 'priority_high' : 'description'}
                            </span>
                          </div>
                          <div>
                            <div className={`font-semibold ${asset.status === 'tampered' ? 'text-[#ba1a1a]' : 'text-[#0d1c2e]'}`}>
                              {asset.name}
                            </div>
                            <div className={`font-mono text-[11px] ${asset.status === 'tampered' ? 'text-[#ba1a1a]' : 'text-[#777584]'}`}>
                              {asset.context}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] text-[#0d1c2e]">
                          <span className="px-1.5 py-0.5 rounded bg-[#e6eeff] select-all">
                            {asset.immutableHash.slice(0, 32)}...
                          </span>
                        </div>
                        <div className="text-[11px] text-[#777584] mt-0.5">
                          {asset.blockRef} @ {asset.timestamp}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px]">
                          <span
                            className={`px-1.5 py-0.5 rounded select-all ${
                              asset.status === 'tampered'
                                ? 'bg-[#ffdad6] text-[#ba1a1a] font-bold'
                                : 'bg-[#eff4ff] text-[#0d1c2e]'
                            }`}
                          >
                            {asset.recomputedHash.slice(0, 32)}...
                          </span>
                        </div>
                        <div
                          className={`text-[11px] font-semibold mt-0.5 flex items-center gap-1 ${
                            asset.status === 'tampered' ? 'text-[#ba1a1a]' : 'text-[#4b41e1]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {asset.status === 'tampered' ? 'error' : 'done_all'}
                          </span>
                          <span>
                            {asset.byteDiff > 0
                              ? `${asset.byteDiff} byte drift intercepted`
                              : '0 byte differential'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div
                          className={`text-[12px] font-semibold flex items-center gap-1 ${
                            asset.status === 'tampered' ? 'text-[#ba1a1a]' : 'text-[#0d1c2e]'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              asset.status === 'tampered' ? 'bg-[#ba1a1a]' : 'bg-[#4b41e1]'
                            }`}
                          ></span>
                          <span>{asset.consensusCount} / 4 Nodes Match</span>
                        </div>
                        <div className="font-mono text-[10px] text-[#777584] mt-0.5">
                          {asset.consensusNodes}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] shadow-xs ${
                            asset.status === 'tampered'
                              ? 'bg-[#ba1a1a] text-white'
                              : 'bg-[#e6eeff] text-[#3730a3]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {asset.status === 'tampered' ? 'production_quantity_limits' : 'verified'}
                          </span>
                          <span>{asset.status === 'tampered' ? 'TAMPERING INTERCEPTED' : 'INTEGRITY VERIFIED'}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 2: Chronological Event Stream */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1f108e]">
                <span className="material-symbols-outlined text-[16px]">lock_clock</span>
                <span>Unbroken Chain of Custody (Statutory Audit Trail)</span>
              </div>
              <h2 className="text-[20px] text-[#0d1c2e] font-bold">
                Cryptographic Event Stream & Block Transcripts
              </h2>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-[#c8c4d5] rounded-lg px-2 py-1 shadow-xs">
                <span className="material-symbols-outlined text-[#777584] text-[16px]">filter_list</span>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="bg-transparent text-[12px] font-semibold text-[#0d1c2e] focus:outline-none pl-1 pr-2 cursor-pointer"
                >
                  <option value="all">All 5 Events (Complete Provenance)</option>
                  <option value="ruleset">Procurement Ruleset Only</option>
                  <option value="bidder">Bidder Submissions</option>
                  <option value="eval">Deterministic Engine Events</option>
                </select>
              </div>
            </div>
          </div>

          {/* Event Stream Table */}
          <div className="bg-white rounded-xl shadow-xs border border-[#c8c4d5] overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff] border-b border-[#c8c4d5] text-[11px] text-[#464553] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4 w-36">Timestamp (IST)</th>
                    <th className="py-3 px-4 w-28">Block Ref</th>
                    <th className="py-3 px-4 w-48">Event Category</th>
                    <th className="py-3 px-4 w-52">Actor / Certificate Fingerprint</th>
                    <th className="py-3 px-4">Action & Statutory Outcome Details</th>
                    <th className="py-3 px-4 text-right w-44">SHA-256 Event Root</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c8c4d5] text-[13px]">
                  {filteredEvents.map((evt, idx) => (
                    <tr key={idx} className="hover:bg-[#eff4ff]/60 transition-colors">
                      <td className="py-3 px-4 align-top font-mono text-[12px]">
                        <div className="font-semibold text-[#0d1c2e]">{evt.timestamp}</div>
                        <div className="text-[#777584] text-[11px]">{evt.timeDetail}</div>
                      </td>

                      <td className="py-3 px-4 align-top">
                        <span className="px-2 py-0.5 rounded bg-[#e6eeff] font-mono text-[11px] text-[#3730a3] font-bold">
                          {evt.blockRef}
                        </span>
                      </td>

                      <td className="py-3 px-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                            evt.statusType === 'error'
                              ? 'bg-[#ffdad6] text-[#ba1a1a]'
                              : 'bg-[#e6eeff] text-[#3730a3]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {evt.category === 'RULESET_COMMITTED'
                              ? 'gavel'
                              : evt.category === 'BID_SUBMISSION_SEAL'
                              ? 'cloud_upload'
                              : evt.category === 'ENGINE_DISCREPANCY'
                              ? 'warning'
                              : 'verified'}
                          </span>
                          <span>{evt.category}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 align-top">
                        <div className="font-bold text-[#0d1c2e] text-[12px]">{evt.actorName}</div>
                        <div className="text-[11px] text-[#464553]">{evt.actorTitle}</div>
                        <div className="font-mono text-[10px] text-[#777584] mt-0.5 truncate max-w-[180px]">
                          {evt.actorFingerprint}
                        </div>
                      </td>

                      <td className="py-3 px-4 align-top">
                        <div className={`font-semibold ${evt.statusType === 'error' ? 'text-[#ba1a1a]' : 'text-[#0d1c2e]'}`}>
                          {evt.actionTitle}
                        </div>
                        <div className="text-[#464553] text-[12px] mt-0.5 leading-snug">
                          {evt.actionDetails}
                        </div>
                      </td>

                      <td className="py-3 px-4 align-top text-right">
                        <div className="font-mono text-[11px] text-[#3730a3] bg-[#eff4ff] px-1.5 py-0.5 rounded select-all inline-block">
                          {evt.sha256Root}
                        </div>
                        <div
                          className={`text-[10px] mt-1 font-semibold ${
                            evt.statusType === 'error' ? 'text-[#ba1a1a]' : 'text-[#4b41e1]'
                          }`}
                        >
                          {evt.statusBadge}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 3: Statutory Certification & Quorum Topology Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#c8c4d5] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-[#4b41e1] uppercase tracking-wider font-bold">
                  Statutory Evidence Certificate Specification
                </div>
                <div className="font-mono text-[12px] text-[#777584]">
                  Section 65B(4) IT Act 2000
                </div>
              </div>

              <h3 className="text-[18px] text-[#0d1c2e] font-bold mt-1">
                Certificate of Cryptographic Integrity & Chain-of-Custody
              </h3>
              <p className="text-[13px] text-[#464553] mt-2 leading-relaxed">
                This digital record constitutes conclusive legal evidence under the Information Technology Act 2000 (Section 65B) and the Indian Evidence Act. The cryptographic hashes enumerated in Block <strong>#419,284</strong> are cryptographically sealed across 4 sovereign nodes. Neither bidder nor department personnel can execute retroactive alteration without immediate consensus invalidation.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#c8c4d5]">
                  <div className="text-[11px] text-[#777584] uppercase font-semibold">Merkle Root of Tender Enclave</div>
                  <div className="font-mono text-[11px] text-[#0d1c2e] font-bold mt-1 break-all">
                    2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#c8c4d5]">
                  <div className="text-[11px] text-[#777584] uppercase font-semibold">NIC Time-Stamp Authority (TSA) Token</div>
                  <div className="font-mono text-[11px] text-[#0d1c2e] font-bold mt-1 break-all">
                    TSA-NIC-IND-2026-03-14T18:11:02.109Z-CLASS3-SHA256
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#c8c4d5] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#4b41e1] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#0d1c2e]">Vigilance Seal Applied</div>
                  <div className="text-[11px] text-[#464553]">Ready for statutory submission to Central Vigilance Commission</div>
                </div>
              </div>

              <button
                onClick={() => onShowToast('All 4 Nodes validated: NIC, MoPNG, GeM, CVC (Consensus Weight: 1.000)')}
                className="px-4 h-8 rounded-lg bg-[#e6eeff] text-[#3730a3] text-[12px] font-semibold hover:bg-[#dce9ff] transition-all"
              >
                Inspect Node Signatures (4/4)
              </button>
            </div>
          </div>

          {/* Node Quorum Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#c8c4d5] shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-[11px] text-[#777584] uppercase font-semibold">Node Quorum Status</div>
              <h3 className="text-[18px] text-[#0d1c2e] font-bold mt-1">Multi-Peer Consensus</h3>
              <div className="mt-4 flex flex-col gap-2.5">
                {/* Node 1 */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#eff4ff] border border-[#c8c4d5]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#4b41e1]"></span>
                    <div>
                      <div className="text-[12px] font-bold text-[#0d1c2e]">NIC Delhi Node 01</div>
                      <div className="font-mono text-[10px] text-[#777584]">IP: 10.144.20.11 • Port: 7051</div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[#4b41e1] font-bold">SYNCHRONIZED</span>
                </div>
                {/* Node 2 */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#eff4ff] border border-[#c8c4d5]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#4b41e1]"></span>
                    <div>
                      <div className="text-[12px] font-bold text-[#0d1c2e]">MoPNG Shastri Bhawan Node 02</div>
                      <div className="font-mono text-[10px] text-[#777584]">IP: 10.144.22.04 • Port: 7051</div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[#4b41e1] font-bold">SYNCHRONIZED</span>
                </div>
                {/* Node 3 */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#eff4ff] border border-[#c8c4d5]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#4b41e1]"></span>
                    <div>
                      <div className="text-[12px] font-bold text-[#0d1c2e]">GeM Head Office Node 03</div>
                      <div className="font-mono text-[10px] text-[#777584]">IP: 10.160.10.89 • Port: 7051</div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[#4b41e1] font-bold">SYNCHRONIZED</span>
                </div>
                {/* Node 4 */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#eff4ff] border border-[#c8c4d5]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#4b41e1]"></span>
                    <div>
                      <div className="text-[12px] font-bold text-[#0d1c2e]">CVC Statutory Node 04</div>
                      <div className="font-mono text-[10px] text-[#777584]">IP: 10.192.05.02 • Port: 7051</div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[#4b41e1] font-bold">SYNCHRONIZED</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#c8c4d5] text-[11px] text-[#777584] flex items-center justify-between">
              <span>Consensus Round #18,924</span>
              <span className="text-[#0d1c2e] font-bold">Zero Desync Events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Raw Block Header Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 bg-[#0d1c2e]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-[#c8c4d5]">
            <div className="flex items-center justify-between border-b border-[#c8c4d5] pb-3">
              <div className="flex items-center gap-2 text-[#3730a3]">
                <span className="material-symbols-outlined text-[24px]">view_in_ar</span>
                <h4 className="text-[18px] font-bold text-[#0d1c2e]">Ledger Block #419,284 Header Envelope</h4>
              </div>
              <button onClick={() => setShowBlockModal(false)} className="text-[#777584] hover:text-[#0d1c2e]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-[#eff4ff] p-4 rounded-xl font-mono text-[12px] text-[#0d1c2e] space-y-1.5 select-all overflow-x-auto border border-[#c8c4d5]">
              <div className="text-[#777584]">// Hyperledger Fabric Genesis & Current Block Envelope</div>
              <div><span className="text-[#3730a3] font-bold">channel_id:</span> "mopng-procure-ledger"</div>
              <div><span className="text-[#3730a3] font-bold">number:</span> 419284</div>
              <div><span className="text-[#3730a3] font-bold">previous_hash:</span> "7d21bb0934ef00192a8bca0194857dfa4e01928374a"</div>
              <div><span className="text-[#3730a3] font-bold">data_hash:</span> "8c34f9a03d81b9e248910ae821fba01945829104fa2"</div>
              <div><span className="text-[#3730a3] font-bold">metadata_signature:</span> "MEYCIQC4g/9e8x...[VALID_ECDSA_DER]"</div>
              <div><span className="text-[#3730a3] font-bold">timestamp:</span> 1741999262109 // 2026-03-14T18:11:02.109Z</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(`{"channel_id": "mopng-procure-ledger", "number": 419284, "data_hash": "8c34f9a03d81b9e248910ae821fba01945829104fa2"}`);
                  onShowToast('Block header copied to clipboard!');
                }}
                className="px-4 py-2 bg-[#e6eeff] text-[#3730a3] rounded-lg text-[12px] font-semibold hover:bg-[#dce9ff]"
              >
                Copy Raw JSON
              </button>
              <button
                onClick={() => setShowBlockModal(false)}
                className="px-4 py-2 bg-[#1f108e] text-white rounded-lg text-[12px] font-bold hover:bg-[#4b41e1]"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statutory Vigilance Certificate Modal */}
      {showVigilanceModal && (
        <div className="fixed inset-0 z-50 bg-[#0d1c2e]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-[#c8c4d5]">
            <div className="flex items-center justify-between border-b border-[#c8c4d5] pb-3">
              <div className="flex items-center gap-2 text-[#1f108e]">
                <span className="material-symbols-outlined text-[24px]">gavel</span>
                <h4 className="text-[18px] font-bold text-[#0d1c2e]">Section 65B Statutory Vigilance Certificate</h4>
              </div>
              <button onClick={() => setShowVigilanceModal(false)} className="text-[#777584] hover:text-[#0d1c2e]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-4 bg-[#eff4ff] border border-[#c8c4d5] rounded-xl text-[12px] space-y-2 text-[#0d1c2e]">
              <div className="font-bold text-[14px]">CERTIFICATE UNDER SECTION 65B OF INDIAN EVIDENCE ACT 1872</div>
              <p>I, Rajeshwar Rao, IAS, Procurement Director, MoPNG, hereby certify that the electronic record for Tender <strong>MoPNG/GAIL/2026/TND-001</strong> stored on Hyperledger Block #419,284 is genuine, un-altered, and cryptographically verified.</p>
              <div className="font-mono text-[11px] text-[#4b41e1]">SHA-256 Digest: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowVigilanceModal(false)}
                className="px-4 py-2 bg-[#eff4ff] text-[#0d1c2e] rounded-lg text-[12px] font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowVigilanceModal(false);
                  onShowToast('Printing Vigilance Certificate Form 65B...');
                }}
                className="px-5 py-2 bg-[#1f108e] text-white rounded-lg text-[12px] font-bold hover:bg-[#4b41e1] flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
