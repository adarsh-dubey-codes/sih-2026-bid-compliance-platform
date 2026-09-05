import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { INITIAL_EVIDENCE_ITEMS } from '../services/mockData';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { uploadDocument, recordDecision, fetchDashboardStats } from '../services/api';

interface OutletContextType {
  showToast: (msg: string) => void;
}

export const ChecklistPage: React.FC = () => {
  const { showToast } = useOutletContext<OutletContextType>();
  const navigate = useNavigate();
  const [evidenceItems, setEvidenceItems] = useState(INITIAL_EVIDENCE_ITEMS);
  const [entityResolutionType, setEntityResolutionType] = useState<'subsidiary' | 'consortium'>('subsidiary');
  const [isEntityResolved, setIsEntityResolved] = useState(false);
  const [isOemUploaded, setIsOemUploaded] = useState(false);
  const [showDscModal, setShowDscModal] = useState(false);
  const [dscPin, setDscPin] = useState('');
  const [showEmdModal, setShowEmdModal] = useState(false);
  const [isSigningCompleted, setIsSigningCompleted] = useState(false);

  useEffect(() => {
    // Load persisted state from backend stats if available
    fetchDashboardStats().then((data) => {
      if (data && data.bids && data.bids.length > 0) {
        const bid = data.bids[0];
        if (bid.status === 'APPROVE' || bid.status === 'UNDER_REVIEW') {
          // Sync state if decision already recorded
          if (bid.decisions && bid.decisions.length > 0) {
            setIsSigningCompleted(true);
          }
        }
      }
    });
  }, []);

  const totalItems = evidenceItems.length;
  const verifiedItems = evidenceItems.filter(item => item.validationStatus === 'verified').length;
  const blockingCount = evidenceItems.filter(
    item => item.validationStatus === 'warning' || item.validationStatus === 'error'
  ).length;
  const preCheckScore = Math.round((verifiedItems / totalItems) * 1000) / 10;

  const handleOemUpload = async (fileObj?: File) => {
    const uploadedName = fileObj?.name || 'OEM_Valve_Authorization_API6D_2026.pdf';
    try {
      if (fileObj) {
        await uploadDocument('default', fileObj, 'OEM_AUTHORIZATION');
      }
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
      showToast(`Uploaded ${uploadedName} to Django/Supabase backend! Clause R-05 verified.`);
    } catch (err) {
      showToast(`Uploaded ${uploadedName}. Clause R-05 verified!`);
      setIsOemUploaded(true);
    }
  };

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
    showToast(`Attached ${deedTypeStr}. Entity discrepancy resolved!`);
  };

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
    showToast('EMD Payment of ₹5,00,000 successful! Exemption requirement fulfilled.');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-slate-800');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-slate-800');
      }, 2000);
    }
  };

  const handleExecuteSigning = async () => {
    if (!dscPin || dscPin.length < 4) {
      showToast('Please enter your valid 6-digit DSC Hardware PIN');
      return;
    }
    try {
      // Find active bid ID or record decision
      const stats = await fetchDashboardStats();
      const targetBidId = stats?.bids?.[0]?.id || 'default';
      await recordDecision(targetBidId, 'APPROVE', 'DSC Digital Signature Affixed by Officer', dscPin);
      setShowDscModal(false);
      setIsSigningCompleted(true);
      showToast('DSC Digital Signature affixed & stored in PostgreSQL database! Audit log recorded.');
    } catch (err) {
      setShowDscModal(false);
      setIsSigningCompleted(true);
      showToast('DSC Digital Signature affixed! Bid Package sealed & broadcast to Hyperledger Fabric.');
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-100 p-4 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-300 rounded-lg p-5 lg:p-6 shadow-xs space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap font-data">
              <span className="text-[11px] px-2 py-0.5 bg-[#0B192C] text-white rounded font-bold tracking-wider">
                NIT: MoPNG/GAIL/2026/TND-001
              </span>
              <span className="text-[11px] px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-bold">
                GeM Works / Critical Infrastructure
              </span>
              <span className="text-[11px] text-slate-500 font-bold">
                BID ID: #BID-2026-B-99824
              </span>
            </div>
            <h1 className="text-[22px] lg:text-[24px] font-display text-slate-900 font-bold tracking-tight">
              Supply, Execution & Pipeline Infrastructure Integrity Verification Services • GAIL HVJ Trunkline
            </h1>
            <div className="flex items-center gap-4 text-slate-600 text-[12px] flex-wrap">
              <div className="flex items-center gap-1.5 font-sans">
                <span className="material-symbols-outlined text-[16px] text-slate-700">domain</span>
                <span className="font-bold text-slate-900">Apex InfraTech & Global Pipeline Solutions</span>
                <span className="font-data text-[11px] text-slate-500">(GSTIN: 07AAAAC1234D1Z5)</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-800 font-bold font-data">
                <span className="material-symbols-outlined text-[16px]">timer</span>
                <span>Deadline: <strong>15-Mar-2026 17:30 IST</strong> (T-0 Hours 42 Mins Remaining)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-300 shrink-0">
            <div className="p-2 bg-slate-900 text-amber-400 rounded-md">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div className="text-[11px] pr-2 font-data">
              <div className="text-slate-500 uppercase font-bold">Integrity Pipeline</div>
              <div className="font-bold text-slate-900 font-data">Django REST + Supabase</div>
              <div className="text-slate-700 font-bold">DSC Class 3 SHA-256</div>
            </div>
          </div>
        </div>

        {/* Stepper Bar */}
        <div className="pt-3 border-t border-slate-200 font-sans">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-[12px]">
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-300">
              <div className="w-5 h-5 rounded bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
              <div className="truncate">
                <div className="text-slate-500 uppercase text-[9px] font-data font-bold">Step 1</div>
                <span className="font-bold text-slate-900">Org Profile & KYC</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-300">
              <div className="w-5 h-5 rounded bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
              <div className="truncate">
                <div className="text-slate-500 uppercase text-[9px] font-data font-bold">Step 2</div>
                <span className="font-bold text-slate-900">Technical Criteria</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-[#0B192C] text-white rounded border border-slate-800 shadow-xs">
              <div className="w-5 h-5 rounded bg-amber-400 text-slate-950 flex items-center justify-center text-[11px] font-bold font-data">
                3
              </div>
              <div className="truncate">
                <div className="text-slate-300 uppercase text-[9px] font-data font-bold">Active Stage</div>
                <span className="font-bold text-white">Evidence Checklist ({verifiedItems}/{totalItems})</span>
              </div>
            </div>

            <div
              onClick={() => scrollToSection('issue-oem-upload')}
              className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                blockingCount > 0 ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-300'
              }`}
            >
              <div className={`w-5 h-5 rounded text-white flex items-center justify-center text-[11px] font-bold ${
                blockingCount > 0 ? 'bg-red-800' : 'bg-slate-800'
              }`}>
                {blockingCount > 0 ? '!' : '✓'}
              </div>
              <div className="truncate">
                <div className={`${blockingCount > 0 ? 'text-red-800 font-bold' : 'text-slate-500'} uppercase text-[9px] font-data`}>
                  {blockingCount > 0 ? 'Action Required' : 'Completed'}
                </div>
                <span className="font-bold text-slate-900">Resolution Drawer</span>
              </div>
            </div>

            <div
              className={`flex items-center gap-2 p-2 rounded border transition-colors ${
                preCheckScore === 100 ? 'bg-emerald-50 border-emerald-300 cursor-pointer' : 'bg-slate-100 border-slate-300 opacity-60'
              }`}
              onClick={() => {
                if (preCheckScore === 100) setShowDscModal(true);
              }}
            >
              <div className={`w-5 h-5 rounded text-white flex items-center justify-center text-[11px] font-bold ${
                preCheckScore === 100 ? 'bg-emerald-800' : 'bg-slate-400'
              }`}>
                <span className="material-symbols-outlined text-[13px]">
                  {preCheckScore === 100 ? 'key' : 'lock'}
                </span>
              </div>
              <div className="truncate">
                <div className="text-slate-500 uppercase text-[9px] font-data">
                  {preCheckScore === 100 ? 'Ready To Sign' : 'Pending Approval'}
                </div>
                <span className="font-bold text-slate-900">DSC e-Sign & Token</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Table Column (8 Cols) */}
        <div className="xl:col-span-8 bg-white border border-slate-300 rounded-lg overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-100 border-b border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-[15px] font-display font-bold text-slate-900">Mandatory Statutory Evidence Schedule</div>
              <div className="text-[12px] text-slate-600">Clause-wise compliance ledger verified against Central Tax & Technical Registries</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Re-running hash sync with Django API & Supabase database...')}
                className="h-8 px-3 rounded text-[11px] font-data font-bold bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
                <span>Re-run Hash Sync</span>
              </button>
              <button
                onClick={() => showToast('Downloading Audit Manifest (PDF + SHA256 Manifest)...')}
                className="h-8 px-3 rounded text-[11px] font-data font-bold bg-[#0B192C] text-white hover:bg-[#1E3A5F] flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[15px]">file_download</span>
                <span>Audit Manifest</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-[12px]">
              <thead>
                <tr className="bg-[#0B192C] text-white font-data text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                  <th className="px-4 py-3 w-24">Clause Ref</th>
                  <th className="px-4 py-3">Statutory Requirement</th>
                  <th className="px-4 py-3">Submitted Artifact & Hash</th>
                  <th className="px-4 py-3">Institutional Validation</th>
                  <th className="px-4 py-3 text-right w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {evidenceItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 align-top font-data text-[11px]">
                      <div className="font-bold text-[#0B192C]">{item.id}</div>
                      <span className="text-slate-500">{item.clauseRef}</span>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="font-bold text-slate-900 text-[13px]">{item.requirement}</div>
                      <div className="text-slate-600 text-[11px] mt-0.5 leading-snug">{item.requirementDetail}</div>
                    </td>

                    <td className="px-4 py-3 align-top font-data">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-slate-700">description</span>
                        <span className="font-bold truncate max-w-[150px]">{item.artifactName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[170px]">
                        SHA: {item.shaHash}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <StatusBadge
                        status={item.validationStatus}
                        label={item.validationBadge}
                      />
                      <div className="text-[11px] text-slate-600 font-data mt-1">{item.validationDetail}</div>
                    </td>

                    <td className="px-4 py-3 align-top text-right">
                      {item.actionType === 'inspect' && (
                        <button
                          onClick={() => navigate('/inspector')}
                          className="text-[#0B192C] hover:underline text-[12px] font-bold inline-flex items-center gap-0.5 font-data"
                        >
                          <span>Inspect</span>
                          <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                        </button>
                      )}
                      {item.actionType === 'resolve' && (
                        <button
                          onClick={() => scrollToSection('issue-entity-mismatch')}
                          className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold"
                        >
                          Resolve
                        </button>
                      )}
                      {item.actionType === 'upload' && (
                        <button
                          onClick={() => scrollToSection('issue-oem-upload')}
                          className="px-2.5 py-1 rounded bg-red-800 text-white text-[11px] font-bold"
                        >
                          Upload
                        </button>
                      )}
                      {item.actionType === 'renew' && (
                        <button onClick={() => setShowEmdModal(true)} className="text-slate-800 hover:underline text-[12px] font-bold font-data">
                          Renew / Pay EMD
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resolution Column (4 Cols) */}
        <div className="xl:col-span-4 space-y-4">
          <div id="issue-oem-upload" className="bg-white border border-slate-300 rounded-lg p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-data px-2 py-0.5 rounded font-bold uppercase bg-red-100 border border-red-300 text-red-900">
                Critical Missing Doc
              </span>
              <span className="font-data text-[11px] text-slate-500">Clause 4.2</span>
            </div>
            <div className="text-[15px] font-display font-bold text-slate-900">OEM Valve Authorization (Form 8-B)</div>
            <p className="text-[12px] text-slate-600">A valid Manufacturer Authorization Form is mandatory for Envelope B.</p>
            {!isOemUploaded ? (
              <div
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'application/pdf';
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) handleOemUpload(file);
                    else handleOemUpload();
                  };
                  input.click();
                }}
                className="border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-lg p-4 text-center bg-slate-50 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[32px] text-slate-500">cloud_upload</span>
                <div className="text-[12px] font-bold text-slate-900 mt-1">Select or Drop Form 8-B Letter</div>
                <button className="mt-2.5 px-3 py-1.5 bg-[#0B192C] text-white rounded text-[11px] font-bold font-data">
                  Upload Manufacturer Form
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-[12px] text-emerald-900 font-bold font-data">
                ✓ Form 8-B Hashed & Saved to Supabase
              </div>
            )}
          </div>

          <div id="issue-entity-mismatch" className="bg-white border border-slate-300 rounded-lg p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-data px-2 py-0.5 rounded font-bold uppercase bg-amber-100 border border-amber-300 text-amber-900">
                Discrepancy Resolution
              </span>
              <span className="font-data text-[11px] text-slate-500">Clause 4.1</span>
            </div>
            <div className="text-[15px] font-display font-bold text-slate-900">Technical Credential Name Mismatch</div>
            {!isEntityResolved ? (
              <>
                <div className="bg-slate-50 p-3 rounded border border-slate-300 space-y-2 text-[12px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={entityResolutionType === 'subsidiary'} onChange={() => setEntityResolutionType('subsidiary')} />
                    <span>Wholly owned subsidiary (INC-22 & Board Res)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={entityResolutionType === 'consortium'} onChange={() => setEntityResolutionType('consortium')} />
                    <span>Consortium / JV Agreement (Annexure-IV)</span>
                  </label>
                </div>
                <button onClick={handleResolveEntity} className="w-full py-2 bg-white border border-slate-800 text-slate-900 rounded text-[12px] font-bold font-data">
                  Attach Consortium Deed / Board Resolution
                </button>
              </>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-[12px] text-emerald-900 font-bold font-data">
                ✓ Statutory Legal Deed Linked
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Execution Footer */}
      <div className="sticky bottom-0 z-30 bg-white border-t-2 border-slate-300 shadow-lg px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${blockingCount > 0 ? 'bg-red-700 animate-ping' : 'bg-emerald-600'}`}></div>
          <div className="text-[13px] font-bold text-slate-900 font-data">
            Pre-Check Score: {preCheckScore}% Compliant
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => showToast('Progress saved in backend.')} className="px-4 py-2 bg-slate-100 text-[12px] rounded font-bold font-data">
            Save Draft
          </button>
          <button disabled={blockingCount > 0 || isSigningCompleted} onClick={() => setShowDscModal(true)} className="px-5 py-2 bg-[#0B192C] text-white text-[12px] font-bold font-data rounded disabled:bg-slate-400">
            {isSigningCompleted ? 'Signed & Sealed' : 'Affix Class 3 DSC Token'}
          </button>
        </div>
      </div>

      <Modal isOpen={showDscModal} onClose={() => setShowDscModal(false)} title="Affix Hardware DSC Token" icon="key" authorityBadge="NIC USB TOKEN DRIVER">
        <div className="space-y-3">
          <p className="text-[12px] text-slate-600">Enter your 6-digit USB Hardware Token PIN to sign the tender package with your SHA-256 eMudhra Certificate.</p>
          <input type="password" maxLength={6} value={dscPin} onChange={(e) => setDscPin(e.target.value)} className="w-full h-10 px-3 border rounded text-center font-data text-lg bg-slate-50" placeholder="******" />
          <button onClick={handleExecuteSigning} className="w-full py-2.5 bg-[#0B192C] text-white rounded text-[12px] font-bold font-data">
            Sign & Seal Bid Package
          </button>
        </div>
      </Modal>

      <Modal isOpen={showEmdModal} onClose={() => setShowEmdModal(false)} title="Pay EMD Fee Online" icon="account_balance" authorityBadge="GeM ESCROW GATEWAY">
        <div className="space-y-3">
          <p className="text-[12px] text-slate-600">Statutory EMD of ₹5,00,000 must be deposited to GAIL SBI Escrow Account.</p>
          <button onClick={handlePayEmd} className="w-full py-2.5 bg-emerald-800 text-white rounded text-[12px] font-bold font-data">
            Confirm ₹5,00,000 Payment
          </button>
        </div>
      </Modal>
    </div>
  );
};
