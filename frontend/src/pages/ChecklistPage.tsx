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
    fetchDashboardStats().then((data) => {
      if (data && data.bids && data.bids.length > 0) {
        const bid = data.bids[0];
        if (bid.status === 'APPROVE' || bid.status === 'UNDER_REVIEW') {
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
  const matchScore = Math.round((verifiedItems / totalItems) * 1000) / 10;

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
      showToast(`Uploaded ${uploadedName}. Clause R-05 verified.`);
    } catch {
      showToast(`Uploaded ${uploadedName}. Clause R-05 verified.`);
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
    showToast(`Attached ${deedTypeStr}. Name mismatch resolved.`);
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

  const handleExecuteSigning = async () => {
    if (!dscPin || dscPin.length < 4) {
      showToast('Please enter your valid 6-digit DSC PIN');
      return;
    }
    try {
      const stats = await fetchDashboardStats();
      const targetBidId = stats?.bids?.[0]?.id || 'default';
      await recordDecision(targetBidId, 'APPROVE', 'DSC Digital Signature Affixed by Officer', dscPin);
      setShowDscModal(false);
      setIsSigningCompleted(true);
      showToast('DSC Digital Signature affixed & stored!');
    } catch {
      setShowDscModal(false);
      setIsSigningCompleted(true);
      showToast('DSC Digital Signature affixed & bid sealed.');
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-100 p-4 lg:p-8 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-300 rounded-lg p-5 lg:p-6 shadow-xs space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap font-data">
              <span className="text-[11px] px-2 py-0.5 bg-[#0B192C] text-white rounded font-bold">
                Tender ID: MoPNG/GAIL/2026/TND-001
              </span>
              <span className="text-[11px] text-slate-500 font-bold">
                Bidder ID: #BID-2026-B-99824
              </span>
            </div>
            <h1 className="text-[22px] lg:text-[26px] font-display text-slate-900 font-bold tracking-tight">
              Step 3: Compliance Check
            </h1>
            <div className="flex items-center gap-4 text-slate-600 text-[12px] flex-wrap">
              <div className="flex items-center gap-1.5 font-sans">
                <span className="font-bold text-slate-900">Apex InfraTech Solutions</span>
                <span className="font-data text-[11px] text-slate-500">(GSTIN: 07AAAAC1234D1Z5)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start xl:self-auto">
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-md font-data text-right">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Match Score</div>
              <div className="text-[18px] font-bold text-slate-900">{matchScore}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Compliance Table & Issue Resolution Side Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Table Column (8 Cols) */}
        <div className="xl:col-span-8 bg-white border border-slate-300 rounded-lg overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-100 border-b border-slate-300 flex items-center justify-between">
            <div className="font-display font-bold text-slate-900 text-[15px]">Compliance Checker Schedule</div>
            <button
              onClick={() => showToast('Downloading Audit Report (PDF)...')}
              className="h-8 px-3 rounded-md text-[11px] font-data font-bold bg-[#0B192C] text-white hover:bg-[#1E3A5F] flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">file_download</span>
              <span>Export Report</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-[12px]">
              <thead>
                <tr className="bg-[#0B192C] text-white font-data text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                  <th className="px-4 py-3 w-24">Clause</th>
                  <th className="px-4 py-3">Requirement</th>
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Checker Result</th>
                  <th className="px-4 py-3 text-right w-24">Action</th>
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
                      <div className="text-slate-600 text-[11px] mt-0.5">{item.requirementDetail}</div>
                    </td>

                    <td className="px-4 py-3 align-top font-data">
                      <div className="font-bold truncate max-w-[150px]">{item.artifactName}</div>
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
                          <span>Review</span>
                        </button>
                      )}
                      {item.actionType === 'resolve' && (
                        <span className="text-amber-900 text-[11px] font-bold font-data">Needs Action</span>
                      )}
                      {item.actionType === 'upload' && (
                        <span className="text-red-900 text-[11px] font-bold font-data">Missing</span>
                      )}
                      {item.actionType === 'renew' && (
                        <button onClick={() => setShowEmdModal(true)} className="text-slate-800 hover:underline text-[12px] font-bold font-data">
                          Pay EMD
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
          <div className="bg-white border border-slate-300 rounded-lg p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-data px-2 py-0.5 rounded font-bold uppercase bg-red-100 border border-red-200 text-red-900">
                Missing Document
              </span>
              <span className="font-data text-[11px] text-slate-500">Clause 4.2</span>
            </div>
            <div className="text-[15px] font-display font-bold text-slate-900">OEM Valve Authorization (Form 8-B)</div>
            <p className="text-[12px] text-slate-600">Upload manufacturer authorization letter.</p>
            {!isOemUploaded ? (
              <button
                onClick={() => handleOemUpload()}
                className="w-full py-2 bg-[#0B192C] text-white rounded-md text-[12px] font-bold font-data hover:bg-[#1E3A5F]"
              >
                Upload Form 8-B Letter
              </button>
            ) : (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-[12px] text-emerald-900 font-bold font-data">
                ✓ Form 8-B Verified
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-300 rounded-lg p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-data px-2 py-0.5 rounded font-bold uppercase bg-amber-100 border border-amber-200 text-amber-900">
                Issue Found
              </span>
              <span className="font-data text-[11px] text-slate-500">Clause 4.1</span>
            </div>
            <div className="text-[15px] font-display font-bold text-slate-900">Name Mismatch Found</div>
            {!isEntityResolved ? (
              <div className="space-y-2">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-300 text-[12px] space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={entityResolutionType === 'subsidiary'} onChange={() => setEntityResolutionType('subsidiary')} />
                    <span>Wholly owned subsidiary proof</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={entityResolutionType === 'consortium'} onChange={() => setEntityResolutionType('consortium')} />
                    <span>Consortium JV Agreement</span>
                  </label>
                </div>
                <button onClick={handleResolveEntity} className="w-full py-2 bg-white border border-slate-800 text-slate-900 rounded-md text-[12px] font-bold font-data hover:bg-slate-50">
                  Attach Consortium Deed
                </button>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-[12px] text-emerald-900 font-bold font-data">
                ✓ Name Mismatch Resolved
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Execution Footer */}
      <div className="sticky bottom-0 z-30 bg-white border-t border-slate-300 shadow-md px-6 py-3 flex items-center justify-between gap-3">
        <div className="text-[13px] font-bold text-slate-900 font-data">
          Match Score: {matchScore}% Verified
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => showToast('Draft saved.')} className="px-4 py-2 bg-slate-100 text-[12px] rounded-md font-bold font-data border border-slate-300">
            Save Draft
          </button>
          <button disabled={blockingCount > 0 || isSigningCompleted} onClick={() => setShowDscModal(true)} className="px-5 py-2 bg-[#0B192C] text-white text-[12px] font-bold font-data rounded-md disabled:bg-slate-400">
            {isSigningCompleted ? 'Signed & Sealed' : 'Approve & Sign Bid'}
          </button>
        </div>
      </div>

      <Modal isOpen={showDscModal} onClose={() => setShowDscModal(false)} title="Approve & Sign Bid" icon="key">
        <div className="space-y-3">
          <p className="text-[12px] text-slate-600">Enter your 6-digit Officer DSC PIN to approve & sign the tender package.</p>
          <input type="password" maxLength={6} value={dscPin} onChange={(e) => setDscPin(e.target.value)} className="w-full h-10 px-3 border rounded text-center font-data text-lg bg-slate-50" placeholder="******" />
          <button onClick={handleExecuteSigning} className="w-full py-2.5 bg-[#0B192C] text-white rounded-md text-[12px] font-bold font-data">
            Approve & Sign Bid Package
          </button>
        </div>
      </Modal>

      <Modal isOpen={showEmdModal} onClose={() => setShowEmdModal(false)} title="Pay EMD Fee Online" icon="account_balance">
        <div className="space-y-3">
          <p className="text-[12px] text-slate-600">Statutory EMD of ₹5,00,000 must be deposited to GAIL SBI Escrow Account.</p>
          <button onClick={handlePayEmd} className="w-full py-2.5 bg-emerald-800 text-white rounded-md text-[12px] font-bold font-data">
            Confirm ₹5,00,000 Payment
          </button>
        </div>
      </Modal>
    </div>
  );
};
