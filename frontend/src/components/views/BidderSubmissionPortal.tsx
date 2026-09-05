import React, { useState } from 'react';
import type { NavigationPath } from '../../types';
import { INITIAL_EVIDENCE_ITEMS } from '../../data/mockData';

interface BidderSubmissionPortalProps {
  onNavigate: (path: NavigationPath, docKey?: string) => void;
  onShowToast: (msg: string) => void;
}

export const BidderSubmissionPortal: React.FC<BidderSubmissionPortalProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [evidenceItems, setEvidenceItems] = useState(INITIAL_EVIDENCE_ITEMS);
  const [entityResolutionType, setEntityResolutionType] = useState<'subsidiary' | 'consortium'>('subsidiary');
  const [isEntityResolved, setIsEntityResolved] = useState(false);
  const [isOemUploaded, setIsOemUploaded] = useState(false);
  const [showDscModal, setShowDscModal] = useState(false);
  const [dscPin, setDscPin] = useState('');
  const [showEmdModal, setShowEmdModal] = useState(false);
  const [isSigningCompleted, setIsSigningCompleted] = useState(false);

  // Compute live pre-check stats
  const totalItems = evidenceItems.length;
  const verifiedItems = evidenceItems.filter(item => item.validationStatus === 'verified').length;
  const blockingCount = evidenceItems.filter(
    item => item.validationStatus === 'warning' || item.validationStatus === 'error'
  ).length;
  const preCheckScore = Math.round((verifiedItems / totalItems) * 1000) / 10;

  // Handle OEM File Upload
  const handleOemUpload = (fileName?: string) => {
    const uploadedName = fileName || 'OEM_Valve_Authorization_API6D_2026.pdf';
    setEvidenceItems(prev =>
      prev.map(item => {
        if (item.id === 'R-05') {
          return {
            ...item,
            artifactName: uploadedName,
            shaHash: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
            fileSize: '2.4 MB',
            uploadTime: 'Just Now',
            validationStatus: 'verified',
            validationBadge: 'Verified via OEM Registry',
            validationDetail: 'API-6D Certificate Match (Valid to 2028)',
            actionType: 'inspect'
          };
        }
        return item;
      })
    );
    setIsOemUploaded(true);
    onShowToast(`Uploaded ${uploadedName}. Clause R-05 verified!`);
  };

  // Handle Entity Mismatch Resolution
  const handleResolveEntity = () => {
    const deedTypeStr =
      entityResolutionType === 'subsidiary'
        ? 'RoC Form INC-22 (Wholly Owned Subsidiary)'
        : 'Annexure-IV Consortium Deed';
    setEvidenceItems(prev =>
      prev.map(item => {
        if (item.id === 'R-04') {
          return {
            ...item,
            artifactName: `Resolved_${deedTypeStr.replace(/\s+/g, '_')}.pdf`,
            shaHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
            validationStatus: 'verified',
            validationBadge: 'Resolution Approved',
            validationDetail: `Statutory Legal Linkage: ${deedTypeStr} Verified`,
            actionType: 'inspect'
          };
        }
        return item;
      })
    );
    setIsEntityResolved(true);
    onShowToast(`Attached ${deedTypeStr}. Entity discrepancy resolved!`);
  };

  // Handle EMD Payment
  const handlePayEmd = () => {
    setShowEmdModal(false);
    setEvidenceItems(prev =>
      prev.map(item => {
        if (item.id === 'R-06') {
          return {
            ...item,
            validationStatus: 'verified',
            validationBadge: 'EMD Online Paid',
            validationDetail: 'Receipt #EMD-2026-90812 (₹5,00,000 Verified)',
            actionType: 'inspect'
          };
        }
        return item;
      })
    );
    onShowToast('EMD Payment of ₹5,00,000 successful! Exemption requirement fulfilled.');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-[#1f108e]');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-[#1f108e]');
      }, 2000);
    }
  };

  const handleExecuteSigning = () => {
    if (!dscPin || dscPin.length < 4) {
      onShowToast('Please enter your valid 6-digit DSC Hardware PIN');
      return;
    }
    setShowDscModal(false);
    setIsSigningCompleted(true);
    onShowToast('DSC Digital Signature affixed! Bid Package sealed & broadcast to Hyperledger Fabric.');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f8f9ff]">
      {/* Top Statutory Tender Metadata Banner */}
      <div className="bg-[#eff4ff] px-8 py-4 border-b border-[#c8c4d5]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[12px] px-2 py-0.5 bg-[#1f108e] text-white rounded font-bold tracking-wider">
                NIT: MoPNG/GAIL/2026/TND-001
              </span>
              <span className="text-[11px] px-2 py-0.5 bg-[#d5e3fc] text-[#464553] rounded font-semibold">
                GeM Tender Category: Works / Critical Infrastructure
              </span>
              <span className="font-mono text-[12px] text-[#777584]">
                BID ID: #BID-2026-B-99824
              </span>
            </div>
            <h1 className="text-[22px] text-[#0d1c2e] font-bold tracking-tight">
              Supply, Execution & Pipeline Infrastructure Integrity Verification Services • GAIL HVJ Trunkline
            </h1>
            <div className="flex items-center gap-4 text-[#464553] text-[13px] flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#1f108e]">domain</span>
                <span className="font-semibold text-[#0d1c2e]">Apex InfraTech & Global Pipeline Solutions</span>
                <span className="font-mono text-[11px] text-[#777584]">(GSTIN: 07AAAAC1234D1Z5)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#ba1a1a] font-semibold">
                <span className="material-symbols-outlined text-[16px]">timer</span>
                <span>Submission Deadline: <strong>15-Mar-2026 17:30 IST</strong> (T-0 Hours 42 Mins Remaining)</span>
              </div>
            </div>
          </div>

          {/* Document Digest Badge */}
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#c8c4d5] shrink-0 shadow-xs">
            <div className="p-2 bg-[#e6eeff] rounded-lg text-[#1f108e]">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div className="text-[11px] pr-2">
              <div className="text-[#777584] uppercase font-semibold">Integrity Pipeline</div>
              <div className="font-bold text-[#0d1c2e]">NIC e-Proc Engine v4.2</div>
              <div className="font-mono text-[10px] text-[#4b41e1]">DSC Class 3 SHA-256</div>
            </div>
          </div>
        </div>

        {/* Stepper Navigation Bar */}
        <div className="mt-4 pt-3 border-t border-[#c8c4d5]">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-[12px]">
            {/* Step 1 */}
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#c8c4d5]">
              <div className="w-5 h-5 rounded-full bg-[#4b41e1] text-white flex items-center justify-center text-[10px] font-bold">
                <span className="material-symbols-outlined text-[14px]">check</span>
              </div>
              <div className="truncate">
                <div className="text-[#777584] uppercase text-[10px]">Step 1</div>
                <span className="font-semibold text-[#0d1c2e]">Org Profile & KYC</span>
              </div>
            </div>
            {/* Step 2 */}
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#c8c4d5]">
              <div className="w-5 h-5 rounded-full bg-[#4b41e1] text-white flex items-center justify-center text-[10px] font-bold">
                <span className="material-symbols-outlined text-[14px]">check</span>
              </div>
              <div className="truncate">
                <div className="text-[#777584] uppercase text-[10px]">Step 2</div>
                <span className="font-semibold text-[#0d1c2e]">Technical Criteria</span>
              </div>
            </div>
            {/* Step 3 Active */}
            <div className="flex items-center gap-2 p-2 bg-[#3730a3] text-white rounded-lg shadow-sm">
              <div className="w-5 h-5 rounded-full bg-white text-[#3730a3] flex items-center justify-center text-[11px] font-bold">
                3
              </div>
              <div className="truncate">
                <div className="text-[#a9a7ff] uppercase text-[10px]">Active Stage</div>
                <span className="font-bold">Evidence Checklist ({verifiedItems}/{totalItems})</span>
              </div>
            </div>
            {/* Step 4 Warning */}
            <div
              onClick={() => scrollToSection('issue-oem-upload')}
              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                blockingCount > 0
                  ? 'bg-[#ffdad6]/30 border-[#ba1a1a]'
                  : 'bg-white border-[#c8c4d5]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  blockingCount > 0 ? 'bg-[#ba1a1a] text-white' : 'bg-[#4b41e1] text-white'
                }`}
              >
                {blockingCount > 0 ? '!' : '✓'}
              </div>
              <div className="truncate">
                <div className={`${blockingCount > 0 ? 'text-[#ba1a1a] font-bold' : 'text-[#777584]'} uppercase text-[10px]`}>
                  {blockingCount > 0 ? 'Action Required' : 'Completed'}
                </div>
                <span className="font-semibold text-[#0d1c2e]">Resolution Drawer</span>
              </div>
            </div>
            {/* Step 5 Locked */}
            <div
              className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                preCheckScore === 100
                  ? 'bg-[#e6eeff] border-[#4b41e1] cursor-pointer'
                  : 'bg-[#eff4ff] border-[#c8c4d5] opacity-60'
              }`}
              onClick={() => {
                if (preCheckScore === 100) setShowDscModal(true);
              }}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  preCheckScore === 100 ? 'bg-[#1f108e] text-white' : 'bg-[#c8c4d5] text-[#464553]'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {preCheckScore === 100 ? 'key' : 'lock'}
                </span>
              </div>
              <div className="truncate">
                <div className="text-[#777584] uppercase text-[10px]">
                  {preCheckScore === 100 ? 'Ready To Sign' : 'Pending Approval'}
                </div>
                <span className="font-semibold text-[#0d1c2e]">DSC e-Sign & Token</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Working Canvas */}
      <div className="p-8 space-y-6">
        {/* Pre-Flight Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white border border-[#c8c4d5] p-4 rounded-xl flex flex-col justify-between shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] text-[#777584] uppercase tracking-wider font-semibold">
                  Total Mandatory Items
                </div>
                <div className="text-[30px] text-[#0d1c2e] font-bold mt-1">0{totalItems}</div>
              </div>
              <span className="material-symbols-outlined text-[#777584] text-[28px]">format_list_numbered</span>
            </div>
            <div className="font-mono text-[11px] text-[#464553] pt-2 border-t border-[#c8c4d5] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">policy</span>
              <span>Per GeM GTC Schedule IV</span>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-white border border-[#c8c4d5] p-4 rounded-xl flex flex-col justify-between shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] text-[#777584] uppercase tracking-wider font-semibold">
                  Verified & Compliant
                </div>
                <div className="text-[30px] text-[#4b41e1] font-bold mt-1">0{verifiedItems}</div>
              </div>
              <span className="material-symbols-outlined text-[#4b41e1] text-[28px]">verified</span>
            </div>
            <div className="font-mono text-[11px] text-[#4b41e1] pt-2 border-t border-[#c8c4d5] flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">done_all</span>
              <span>API Handshakes Completed</span>
            </div>
          </div>
          {/* Card 3 */}
          <div
            className={`border p-4 rounded-xl flex flex-col justify-between shadow-xs transition-colors ${
              blockingCount > 0
                ? 'bg-[#ffdad6]/20 border-[#ba1a1a]/40'
                : 'bg-[#e6eeff]/40 border-[#4b41e1]/40'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className={`text-[11px] uppercase tracking-wider font-bold ${blockingCount > 0 ? 'text-[#ba1a1a]' : 'text-[#4b41e1]'}`}>
                  Blocking Discrepancies
                </div>
                <div className={`text-[30px] font-bold mt-1 ${blockingCount > 0 ? 'text-[#ba1a1a]' : 'text-[#4b41e1]'}`}>
                  0{blockingCount}
                </div>
              </div>
              <span className={`material-symbols-outlined text-[28px] ${blockingCount > 0 ? 'text-[#ba1a1a]' : 'text-[#4b41e1]'}`}>
                {blockingCount > 0 ? 'warning' : 'check_circle'}
              </span>
            </div>
            <div className={`font-mono text-[11px] pt-2 border-t flex items-center gap-1 font-semibold ${
              blockingCount > 0 ? 'text-[#ba1a1a] border-[#ffdad6]' : 'text-[#4b41e1] border-[#c8c4d5]'
            }`}>
              <span className="material-symbols-outlined text-[14px]">
                {blockingCount > 0 ? 'block' : 'task_alt'}
              </span>
              <span>
                {blockingCount > 0
                  ? `${!isOemUploaded ? '1 Missing Doc • ' : ''}${!isEntityResolved ? '1 Name Mismatch' : ''}`
                  : 'All Mandatory Items Cleared'}
              </span>
            </div>
          </div>
          {/* Card 4 */}
          <div className="bg-white border border-[#c8c4d5] p-4 rounded-xl flex flex-col justify-between shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] text-[#777584] uppercase tracking-wider font-semibold">
                  NIC Pre-Check Score
                </div>
                <div className="text-[30px] text-[#1f108e] font-bold mt-1">{preCheckScore}%</div>
              </div>
              <span className="material-symbols-outlined text-[#1f108e] text-[28px]">speed</span>
            </div>
            <div className="font-mono text-[11px] text-[#777584] pt-2 border-t border-[#c8c4d5] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">lock_reset</span>
              <span>{preCheckScore === 100 ? '100% Valid - Ready to Sign' : 'Signing Threshold: 100% Valid'}</span>
            </div>
          </div>
        </div>

        {/* Layout Grid: Left Table (70%) & Right Resolution Drawer (30%) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Core Table Section */}
          <div className="xl:col-span-8 bg-white border border-[#c8c4d5] rounded-xl overflow-hidden shadow-xs flex flex-col">
            <div className="p-4 border-b border-[#c8c4d5] bg-[#eff4ff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-[16px] text-[#0d1c2e] font-bold">Mandatory Statutory Evidence Schedule</div>
                <div className="text-[13px] text-[#464553]">
                  Clause-wise compliance ledger verified against Central Tax & Technical Registries
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onShowToast('Re-running hash sync with Central NIC HSM repository...')}
                  className="h-8 px-3 rounded-lg text-[12px] bg-white border border-[#c8c4d5] text-[#0d1c2e] hover:bg-[#e6eeff] flex items-center gap-1.5 transition-colors font-medium"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  <span>Re-run Hash Sync</span>
                </button>
                <button
                  onClick={() => onShowToast('Downloading Audit Manifest (PDF + SHA256 Manifest)...')}
                  className="h-8 px-3 rounded-lg text-[12px] bg-[#1f108e] text-white hover:bg-[#4b41e1] flex items-center gap-1.5 transition-colors font-semibold shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  <span>Audit Manifest</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="h-9 bg-[#e6eeff] border-b border-[#c8c4d5] text-[11px] text-[#464553] uppercase tracking-wider font-semibold">
                    <th className="px-4 w-24">Clause Ref</th>
                    <th className="px-4">Statutory Requirement</th>
                    <th className="px-4">Submitted Artifact & Hash</th>
                    <th className="px-4">Institutional Validation</th>
                    <th className="px-4 text-right w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c8c4d5] text-[13px] text-[#0d1c2e]">
                  {evidenceItems.map(item => (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        item.validationStatus === 'error'
                          ? 'bg-[#ffdad6]/20 border-l-4 border-l-[#ba1a1a]'
                          : item.validationStatus === 'warning'
                          ? 'bg-[#FFFBEB]/50 border-l-4 border-l-amber-500'
                          : 'hover:bg-[#eff4ff]'
                      }`}
                    >
                      <td className="px-4 py-3 align-top font-mono text-[12px]">
                        <div className="font-bold text-[#1f108e]">{item.id}</div>
                        <span className="text-[#777584]">{item.clauseRef}</span>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-[#0d1c2e]">{item.requirement}</div>
                        <div className="text-[#464553] text-[12px] mt-0.5">{item.requirementDetail}</div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              item.validationStatus === 'error' ? 'text-[#ba1a1a]' : 'text-[#1f108e]'
                            }`}
                          >
                            {item.validationStatus === 'error' ? 'cancel' : 'description'}
                          </span>
                          <span className="font-medium truncate max-w-[160px]">{item.artifactName}</span>
                        </div>
                        <div className="font-mono text-[11px] text-[#777584] mt-1 truncate max-w-[180px]">
                          SHA: {item.shaHash}
                        </div>
                        <div className="text-[10px] text-[#777584]">
                          {item.fileSize} • {item.uploadTime}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            item.validationStatus === 'verified'
                              ? 'bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D]'
                              : item.validationStatus === 'warning'
                              ? 'bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309]'
                              : item.validationStatus === 'error'
                              ? 'bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C]'
                              : 'bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {item.validationStatus === 'verified'
                              ? 'check_circle'
                              : item.validationStatus === 'warning'
                              ? 'warning'
                              : item.validationStatus === 'error'
                              ? 'dangerous'
                              : 'history'}
                          </span>
                          <span>{item.validationBadge}</span>
                        </div>
                        <div className="text-[11px] text-[#464553] mt-1 font-medium">{item.validationDetail}</div>
                      </td>

                      <td className="px-4 py-3 align-top text-right">
                        {item.actionType === 'inspect' && (
                          <button
                            onClick={() => onNavigate('split-screen-evidence-inspector', item.docKey)}
                            className="text-[#1f108e] hover:underline text-[12px] font-semibold inline-flex items-center gap-0.5"
                          >
                            <span>Inspect</span>
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          </button>
                        )}

                        {item.actionType === 'resolve' && (
                          <button
                            onClick={() => scrollToSection('issue-entity-mismatch')}
                            className="px-2.5 py-1 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] hover:bg-amber-200 text-[11px] font-bold transition-colors shadow-xs"
                          >
                            Resolve
                          </button>
                        )}

                        {item.actionType === 'upload' && (
                          <button
                            onClick={() => scrollToSection('issue-oem-upload')}
                            className="px-2.5 py-1 rounded bg-[#ba1a1a] text-white hover:bg-red-700 text-[11px] font-bold transition-colors shadow-xs"
                          >
                            Upload
                          </button>
                        )}

                        {item.actionType === 'renew' && (
                          <button
                            onClick={() => setShowEmdModal(true)}
                            className="text-[#4b41e1] hover:underline text-[12px] font-semibold"
                          >
                            Renew / Pay EMD
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-white border-t border-[#c8c4d5] flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-[#464553]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1f108e] text-[18px]">security</span>
                <span>All uploads are processed through ISO/IEC 27001 certified tamper-evident SHA-256 HSM instances.</span>
              </div>
              <div className="font-mono text-[#777584]">NIC Server Timestamp Verification: OK</div>
            </div>
          </div>

          {/* Actionable Resolution Drawer (Right 30%) */}
          <div className="xl:col-span-4 space-y-4">
            {/* Blocker Banner */}
            {blockingCount > 0 ? (
              <div className="bg-white border-2 border-[#ba1a1a]/60 rounded-xl p-4 shadow-xs">
                <div className="flex items-start gap-3 text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-[24px] shrink-0 mt-0.5">error</span>
                  <div>
                    <div className="text-[16px] font-bold text-[#ba1a1a] leading-tight">
                      {blockingCount} Critical Blocker {blockingCount > 1 ? 'Issues' : 'Issue'}
                    </div>
                    <div className="text-[13px] text-[#464553] mt-1 leading-snug">
                      Under GeM GTC clause 11.2, your bid submission cannot proceed to DSC signing until these discrepancies are resolved.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#F0FDF4] border-2 border-[#BBF7D0] rounded-xl p-4 shadow-xs">
                <div className="flex items-start gap-3 text-[#15803D]">
                  <span className="material-symbols-outlined text-[24px] shrink-0 mt-0.5">check_circle</span>
                  <div>
                    <div className="text-[16px] font-bold text-[#15803D] leading-tight">
                      100% Statutory Compliance Achieved!
                    </div>
                    <div className="text-[13px] text-[#15803D] mt-1 leading-snug">
                      All evidence requirements are verified. You are now cleared to affix your Class 3 Digital Signature Token.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Issue 1: OEM Valve Authorization */}
            <div
              id="issue-oem-upload"
              className={`bg-white border rounded-xl p-4 shadow-xs space-y-3 transition-all duration-300 ${
                isOemUploaded ? 'border-[#BBF7D0] bg-[#F0FDF4]/30' : 'border-[#c8c4d5]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    isOemUploaded
                      ? 'bg-[#F0FDF4] text-[#15803D]'
                      : 'bg-[#ffdad6] text-[#ba1a1a]'
                  }`}
                >
                  {isOemUploaded ? 'Verified & Attached' : 'Critical Missing Doc'}
                </span>
                <span className="font-mono text-[12px] text-[#777584]">Clause 4.2</span>
              </div>

              <div className="text-[16px] text-[#0d1c2e] font-semibold">
                OEM Valve Authorization (Form 8-B)
              </div>
              <p className="text-[13px] text-[#464553]">
                A valid Manufacturer Authorization Form on the official letterhead of an approved API-6D valve producer is mandatory for Envelope B.
              </p>

              {/* Upload Box */}
              {!isOemUploaded ? (
                <div className="border-2 border-dashed border-[#c8c4d5] hover:border-[#3730a3] rounded-xl p-4 text-center bg-[#eff4ff] cursor-pointer transition-colors group">
                  <span className="material-symbols-outlined text-[32px] text-[#777584] group-hover:text-[#1f108e] transition-colors">
                    cloud_upload
                  </span>
                  <div className="text-[13px] text-[#0d1c2e] font-semibold mt-1">
                    Select or Drop Form 8-B Letter
                  </div>
                  <div className="font-mono text-[11px] text-[#777584] mt-0.5">
                    PDF format only • Max 15MB • DSC signed
                  </div>
                  <button
                    onClick={() => handleOemUpload()}
                    className="mt-3 px-3 py-1.5 bg-[#1f108e] text-white rounded-lg text-[12px] font-semibold hover:bg-[#4b41e1] transition-colors inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    <span>Upload Manufacturer Form</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#15803D] text-[18px]">verified</span>
                    <span className="font-semibold text-[#15803D]">Form 8-B Hashed & Verified</span>
                  </div>
                  <button
                    onClick={() => handleOemUpload('OEM_Valve_Authorization_API6D_Updated.pdf')}
                    className="text-[#15803D] underline font-semibold text-[11px]"
                  >
                    Replace
                  </button>
                </div>
              )}
            </div>

            {/* Issue 2: Entity Name Mismatch Resolution */}
            <div
              id="issue-entity-mismatch"
              className={`bg-white border rounded-xl p-4 shadow-xs space-y-3 transition-all duration-300 ${
                isEntityResolved ? 'border-[#BBF7D0] bg-[#F0FDF4]/30' : 'border-[#c8c4d5]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    isEntityResolved
                      ? 'bg-[#F0FDF4] text-[#15803D]'
                      : 'bg-[#FFFBEB] text-[#B45309]'
                  }`}
                >
                  {isEntityResolved ? 'Resolution Recorded' : 'Discrepancy Resolution'}
                </span>
                <span className="font-mono text-[12px] text-[#777584]">Clause 4.1</span>
              </div>

              <div className="text-[16px] text-[#0d1c2e] font-semibold">
                Technical Credential Name Mismatch
              </div>
              <p className="text-[13px] text-[#464553]">
                IOCL Completion Certificate states <strong>'Apex Pipeline LLC'</strong>. If this entity is a 100% subsidiary or Joint Venture partner, attach statutory resolution.
              </p>

              {!isEntityResolved ? (
                <>
                  <div className="bg-[#eff4ff] p-3 rounded-lg border border-[#c8c4d5] space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="entity_type"
                        checked={entityResolutionType === 'subsidiary'}
                        onChange={() => setEntityResolutionType('subsidiary')}
                        className="mt-1 text-[#1f108e]"
                      />
                      <span className="text-[12px] text-[#0d1c2e]">
                        Wholly owned foreign/domestic subsidiary (Attach RoC Form INC-22 & Board Res)
                      </span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="entity_type"
                        checked={entityResolutionType === 'consortium'}
                        onChange={() => setEntityResolutionType('consortium')}
                        className="mt-1 text-[#1f108e]"
                      />
                      <span className="text-[12px] text-[#0d1c2e]">
                        Consortium / Joint Venture Agreement (Annexure-IV deed on ₹500 Stamp)
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={handleResolveEntity}
                    className="w-full py-2 bg-white border border-[#1f108e] text-[#1f108e] hover:bg-[#e6eeff] rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">post_add</span>
                    <span>Attach Consortium Deed / Board Resolution</span>
                  </button>
                </>
              ) : (
                <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#15803D] text-[18px]">gavel</span>
                    <span className="font-semibold text-[#15803D]">Statutory Deed Linked</span>
                  </div>
                  <span className="text-[11px] text-[#15803D] font-mono">INC-22 / Board Res</span>
                </div>
              )}
            </div>

            {/* Statutory Guidelines Reminder */}
            <div className="bg-[#eff4ff] border border-[#c8c4d5] rounded-xl p-4">
              <div className="text-[12px] text-[#0d1c2e] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#1f108e] text-[18px]">verified</span>
                <span>NIC Submission Guidelines Reminder</span>
              </div>
              <ul className="text-[12px] text-[#464553] mt-2 space-y-1 list-disc pl-4">
                <li>Files must not be password-protected or encrypted with proprietary locks.</li>
                <li>DSC signature must match registered director on MCA registry.</li>
                <li>Corrupt SHA hashes automatically reject bid envelopes at bid opening IST.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Execution Footer */}
      <div className="sticky bottom-0 z-30 bg-white border-t-2 border-[#c8c4d5] shadow-lg px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                blockingCount > 0 ? 'bg-[#ba1a1a] animate-ping' : 'bg-[#15803D]'
              }`}
            ></div>
            <div>
              <div className="text-[13px] text-[#0d1c2e] font-semibold flex items-center gap-1.5">
                <span>
                  {blockingCount > 0
                    ? `Pre-Check Status: ${blockingCount} Discrepancy Flaws Detected`
                    : 'Pre-Check Status: 100% Compliant'}
                </span>
                <span className="text-[#777584] text-[12px] font-normal">
                  • {blockingCount > 0 ? 'DSC Signing Disabled' : 'DSC Signing Ready'}
                </span>
              </div>
              <div className="font-mono text-[11px] text-[#464553]">
                Last automated schema validation: {new Date().toLocaleTimeString()} IST
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => onShowToast('Draft progress saved to encrypted browser workspace.')}
              className="px-4 py-2 rounded-lg bg-[#e6eeff] border border-[#c8c4d5] text-[12px] text-[#0d1c2e] font-medium hover:bg-[#dce9ff] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Save Draft Progress</span>
            </button>

            <button
              onClick={() => onShowToast('Re-verifying SHA-256 hashes against Central NIC Repository... 100% match.')}
              className="px-4 py-2 rounded-lg bg-white border border-[#1f108e] text-[#1f108e] hover:bg-[#e6eeff] text-[12px] font-semibold transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">troubleshoot</span>
              <span>Re-verify Checks</span>
            </button>

            <button
              disabled={blockingCount > 0 || isSigningCompleted}
              onClick={() => setShowDscModal(true)}
              className={`px-5 py-2 rounded-lg text-[12px] font-bold flex items-center gap-2 transition-all shadow-sm ${
                isSigningCompleted
                  ? 'bg-[#15803D] text-white'
                  : blockingCount > 0
                  ? 'bg-[#c8c4d5]/60 text-[#777584] cursor-not-allowed'
                  : 'bg-[#1f108e] text-white hover:bg-[#4b41e1]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSigningCompleted ? 'check_circle' : blockingCount > 0 ? 'lock' : 'key'}
              </span>
              <span>
                {isSigningCompleted
                  ? 'Signed & Sealed'
                  : blockingCount > 0
                  ? 'Proceed to DSC Signing'
                  : 'Affix Class 3 DSC Token'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* DSC PIN Modal */}
      {showDscModal && (
        <div className="fixed inset-0 z-50 bg-[#0d1c2e]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#c8c4d5]">
            <div className="flex items-center justify-between border-b border-[#c8c4d5] pb-3">
              <div className="flex items-center gap-2 text-[#1f108e]">
                <span className="material-symbols-outlined text-[24px]">key</span>
                <h3 className="text-[18px] font-bold text-[#0d1c2e]">Affix Hardware DSC Token</h3>
              </div>
              <button onClick={() => setShowDscModal(false)} className="text-[#777584] hover:text-[#0d1c2e]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-[13px] text-[#464553]">
              <div className="p-3 bg-[#eff4ff] rounded-xl border border-[#c8c4d5] space-y-1">
                <div className="font-semibold text-[#0d1c2e]">Signer: S. K. Nambiar</div>
                <div className="font-mono text-[11px]">Issuer: eMudhra Sub-CA Class 3</div>
                <div className="font-mono text-[10px] text-[#1f108e]">Token Serial: #4A7F-90E1-2026</div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0d1c2e] mb-1">
                  Enter 6-Digit USB Hardware Token PIN:
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={dscPin}
                  onChange={(e) => setDscPin(e.target.value)}
                  placeholder="******"
                  className="w-full h-10 px-3 font-mono text-[16px] bg-[#eff4ff] border border-[#c8c4d5] rounded-lg focus:outline-none focus:border-[#1f108e] text-center tracking-widest"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDscModal(false)}
                className="px-4 py-2 bg-[#eff4ff] text-[#0d1c2e] rounded-lg text-[12px] font-semibold hover:bg-[#dce9ff]"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteSigning}
                className="px-5 py-2 bg-[#1f108e] text-white rounded-lg text-[12px] font-bold hover:bg-[#4b41e1] flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">draw</span>
                <span>Sign & Seal Bid Package</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMD Payment Modal */}
      {showEmdModal && (
        <div className="fixed inset-0 z-50 bg-[#0d1c2e]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#c8c4d5]">
            <div className="flex items-center justify-between border-b border-[#c8c4d5] pb-3">
              <div className="flex items-center gap-2 text-[#1f108e]">
                <span className="material-symbols-outlined text-[24px]">account_balance</span>
                <h3 className="text-[18px] font-bold text-[#0d1c2e]">Pay EMD Fee Online (GeM e-Payment)</h3>
              </div>
              <button onClick={() => setShowEmdModal(false)} className="text-[#777584] hover:text-[#0d1c2e]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-[13px] text-[#464553]">
              <p>Since your MSME Udyam Exemption certificate expired on 31-Dec-2025, statutory EMD of <strong>₹5,00,000</strong> must be deposited into GAIL SBI Escrow Account.</p>
              <div className="p-3 bg-[#eff4ff] rounded-xl border border-[#c8c4d5] text-[12px]">
                <div>Beneficiary: GAIL (India) Limited Tender Escrow</div>
                <div className="font-mono text-[11px] text-[#1f108e]">SBI A/c: 39018249018 (IFSC: SBIN0000691)</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowEmdModal(false)}
                className="px-4 py-2 bg-[#eff4ff] text-[#0d1c2e] rounded-lg text-[12px] font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handlePayEmd}
                className="px-5 py-2 bg-[#15803D] text-white rounded-lg text-[12px] font-bold hover:bg-green-700 flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">payment</span>
                <span>Confirm ₹5,00,000 Payment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
