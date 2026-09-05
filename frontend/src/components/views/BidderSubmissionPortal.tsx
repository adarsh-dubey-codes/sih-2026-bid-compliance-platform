import React, { useState } from 'react';
import type { NavigationPath } from '../../types';
import { INITIAL_EVIDENCE_ITEMS } from '../../data/mockData';
import { StatusBadge } from '../common/StatusBadge';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';

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

  const totalItems = evidenceItems.length;
  const verifiedItems = evidenceItems.filter(item => item.validationStatus === 'verified').length;
  const blockingCount = evidenceItems.filter(
    item => item.validationStatus === 'warning' || item.validationStatus === 'error'
  ).length;
  const preCheckScore = Math.round((verifiedItems / totalItems) * 1000) / 10;

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

  const handleExecuteSigning = () => {
    if (!dscPin || dscPin.length < 4) {
      onShowToast('Please enter your valid 6-digit DSC Hardware PIN');
      return;
    }
    setShowDscModal(false);
    setIsSigningCompleted(true);
    onShowToast('DSC Digital Signature affixed! Bid Package sealed.');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#17152B] tracking-tight">
            Bidder Submission Checklist
          </h1>
          <p className="text-[14px] text-[#66627A] mt-1">
            Verify bidder eligibility and statutory compliance before digital token sealing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onShowToast('Progress draft saved.')}
            className="px-3.5 py-2 bg-white border border-[#E5E2EC] text-[#17152B] font-medium text-[13px] rounded-lg hover:bg-[#F8F9FC] transition-colors"
          >
            Save Draft
          </button>
          <button
            disabled={blockingCount > 0 || isSigningCompleted}
            onClick={() => setShowDscModal(true)}
            className="px-4 py-2 bg-[#4527A0] text-white font-medium text-[13px] rounded-lg hover:bg-[#5E35B1] transition-colors flex items-center gap-1.5 disabled:bg-[#C4BFD3]"
          >
            <span className="material-symbols-outlined text-[17px]">
              {isSigningCompleted ? 'check_circle' : 'key'}
            </span>
            <span>{isSigningCompleted ? 'Signed & Sealed' : 'Affix Class 3 DSC'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Total Requirements"
          value={totalItems}
          subtitle="Mandatory GFR clauses"
          icon="format_list_numbered"
          iconColor="text-[#4527A0]"
        />

        <Card
          title="Compliant Items"
          value={verifiedItems}
          subtitle="Registry verified"
          icon="check_circle"
          iconColor="text-[#059669]"
          titleClassName="text-[#059669]"
          valueClassName="text-[#059669]"
        />

        <Card
          title="Action Required"
          value={blockingCount}
          subtitle="Pending discrepancies"
          icon="warning"
          iconColor="text-[#D97706]"
          titleClassName="text-[#D97706]"
          valueClassName="text-[#D97706]"
        />

        <Card
          title="Pre-Check Score"
          value={`${preCheckScore}%`}
          subtitle="Readiness threshold: 100%"
          icon="speed"
          iconColor="text-[#4527A0]"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Table Column (8 cols) */}
        <div className="xl:col-span-8 bg-white border border-[#E5E2EC] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E2EC] flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-[#17152B]">Evidence Schedule</h2>
              <p className="text-[12px] text-[#66627A] mt-0.5">Statutory items per tender schedule</p>
            </div>
            <span className="text-[12px] font-medium text-[#4527A0]">Score: {preCheckScore}%</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#F8F9FC] border-b border-[#E5E2EC] text-[11px] font-semibold text-[#66627A] uppercase tracking-wider">
                  <th className="py-3 px-4 w-24">Clause</th>
                  <th className="py-3 px-4">Requirement</th>
                  <th className="py-3 px-4">Submitted Artifact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2EC]">
                {evidenceItems.map(item => (
                  <tr key={item.id} className="hover:bg-[#F8F9FC] transition-colors">
                    <td className="py-3.5 px-4 font-data text-[12px] font-bold text-[#17152B] align-top">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-[#17152B]">{item.requirement}</div>
                      <div className="text-[12px] text-[#66627A] mt-0.5">{item.requirementDetail}</div>
                    </td>
                    <td className="py-3.5 px-4 align-top font-data text-[12px]">
                      <div className="font-medium text-[#17152B] truncate max-w-[150px]">{item.artifactName}</div>
                      <div className="text-[10px] text-[#66627A] truncate max-w-[150px]">SHA: {item.shaHash.slice(0, 12)}...</div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <StatusBadge status={item.validationStatus} label={item.validationBadge} />
                      <div className="text-[11px] text-[#66627A] mt-1 font-data">{item.validationDetail}</div>
                    </td>
                    <td className="py-3.5 px-4 align-top text-right">
                      {item.actionType === 'inspect' && (
                        <button
                          onClick={() => onNavigate('split-screen-evidence-inspector', item.docKey)}
                          className="px-2.5 py-1 text-[12px] font-medium text-[#4527A0] bg-[#F1EFF7] hover:bg-[#E5E2EC] rounded-md transition-colors"
                        >
                          Inspect
                        </button>
                      )}
                      {item.actionType === 'resolve' && (
                        <button
                          onClick={handleResolveEntity}
                          className="px-2.5 py-1 text-[12px] font-medium text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A] hover:bg-[#FEF3C7] rounded-md transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                      {item.actionType === 'upload' && (
                        <button
                          onClick={() => handleOemUpload()}
                          className="px-2.5 py-1 text-[12px] font-medium text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-md transition-colors"
                        >
                          Upload
                        </button>
                      )}
                      {item.actionType === 'renew' && (
                        <button
                          onClick={() => setShowEmdModal(true)}
                          className="px-2.5 py-1 text-[12px] font-medium text-[#4527A0] bg-[#F1EFF7] hover:bg-[#E5E2EC] rounded-md transition-colors"
                        >
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

        {/* Resolution Column (4 cols) */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white border border-[#E5E2EC] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase text-[#66627A]">Clause 4.2</span>
              <StatusBadge status={isOemUploaded ? 'compliant' : 'error'} label={isOemUploaded ? 'Uploaded' : 'Missing'} />
            </div>
            <h3 className="text-[15px] font-semibold text-[#17152B]">OEM Valve Authorization (Form 8-B)</h3>
            <p className="text-[12px] text-[#66627A]">Manufacturer authorization form is required for Envelope B.</p>
            {!isOemUploaded ? (
              <button
                onClick={() => handleOemUpload()}
                className="w-full py-2 bg-[#4527A0] text-white rounded-lg text-[12px] font-medium hover:bg-[#5E35B1] transition-colors"
              >
                Upload Form 8-B
              </button>
            ) : (
              <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-[12px] text-[#059669] font-medium">
                ✓ Form 8-B Uploaded & Verified
              </div>
            )}
          </div>

          <div className="bg-white border border-[#E5E2EC] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase text-[#66627A]">Clause 4.1</span>
              <StatusBadge status={isEntityResolved ? 'compliant' : 'warning'} label={isEntityResolved ? 'Resolved' : 'Discrepancy'} />
            </div>
            <h3 className="text-[15px] font-semibold text-[#17152B]">Entity Name Mismatch</h3>
            <p className="text-[12px] text-[#66627A]">Technical certificate name mismatch resolution deed.</p>
            {!isEntityResolved ? (
              <div className="space-y-3">
                <div className="space-y-2 text-[12px] bg-[#F8F9FC] p-3 rounded-lg border border-[#E5E2EC]">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="entity_res"
                      checked={entityResolutionType === 'subsidiary'}
                      onChange={() => setEntityResolutionType('subsidiary')}
                      className="mt-0.5 text-[#4527A0]"
                    />
                    <span className="text-[#17152B]">Wholly owned subsidiary (INC-22)</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="entity_res"
                      checked={entityResolutionType === 'consortium'}
                      onChange={() => setEntityResolutionType('consortium')}
                      className="mt-0.5 text-[#4527A0]"
                    />
                    <span className="text-[#17152B]">Consortium Agreement (Annexure-IV)</span>
                  </label>
                </div>
                <button
                  onClick={handleResolveEntity}
                  className="w-full py-2 bg-white border border-[#4527A0] text-[#4527A0] rounded-lg text-[12px] font-medium hover:bg-[#F1EFF7] transition-colors"
                >
                  Attach Statutory Resolution
                </button>
              </div>
            ) : (
              <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-[12px] text-[#059669] font-medium">
                ✓ Statutory Legal Deed Linked
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DSC Modal */}
      <Modal
        isOpen={showDscModal}
        onClose={() => setShowDscModal(false)}
        title="Affix Hardware DSC Token"
        icon="key"
        authorityBadge="NIC HARDWARE TOKEN"
      >
        <div className="space-y-3">
          <p className="text-[13px] text-[#66627A]">Enter your 6-digit USB Hardware Token PIN to sign.</p>
          <input
            type="password"
            maxLength={6}
            value={dscPin}
            onChange={(e) => setDscPin(e.target.value)}
            placeholder="••••••"
            className="w-full h-10 px-3 border border-[#E5E2EC] rounded-lg text-center font-data text-lg bg-[#F8F9FC] focus:outline-none focus:border-[#4527A0]"
          />
          <button
            onClick={handleExecuteSigning}
            className="w-full py-2.5 bg-[#4527A0] text-white rounded-lg text-[13px] font-medium hover:bg-[#5E35B1] transition-colors"
          >
            Sign & Seal Package
          </button>
        </div>
      </Modal>

      {/* EMD Modal */}
      <Modal
        isOpen={showEmdModal}
        onClose={() => setShowEmdModal(false)}
        title="Confirm EMD Deposit"
        icon="account_balance"
        authorityBadge="GeM ESCROW GATEWAY"
      >
        <div className="space-y-3">
          <p className="text-[13px] text-[#66627A]">Confirm deposit of ₹5,00,000 into GAIL Escrow Account.</p>
          <button
            onClick={handlePayEmd}
            className="w-full py-2.5 bg-[#059669] text-white rounded-lg text-[13px] font-medium hover:bg-[#047857] transition-colors"
          >
            Confirm ₹5,00,000 Payment
          </button>
        </div>
      </Modal>
    </div>
  );
};
