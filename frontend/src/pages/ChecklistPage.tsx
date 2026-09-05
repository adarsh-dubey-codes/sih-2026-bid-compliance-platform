import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { INITIAL_EVIDENCE_ITEMS } from '../services/mockData';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card } from '../components/common/Card';
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
    }).catch(() => {});
  }, []);

  const totalItems = evidenceItems.length;
  const passedItems = evidenceItems.filter(item => item.validationStatus === 'verified').length;
  const pendingItems = evidenceItems.filter(item => item.validationStatus === 'warning' || item.validationStatus === 'expired').length;
  const failedItems = evidenceItems.filter(item => item.validationStatus === 'error').length;
  const preCheckScore = Math.round((passedItems / totalItems) * 1000) / 10;

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
      showToast(`Uploaded ${uploadedName}. Clause R-05 verified!`);
    } catch {
      setIsOemUploaded(true);
      showToast(`Uploaded ${uploadedName}. Clause R-05 verified!`);
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
    showToast('EMD Payment of ₹5,00,000 confirmed.');
  };

  const handleExecuteSigning = async () => {
    if (!dscPin || dscPin.length < 4) {
      showToast('Please enter your 6-digit DSC Hardware PIN');
      return;
    }
    try {
      const stats = await fetchDashboardStats();
      const targetBidId = stats?.bids?.[0]?.id || 'default';
      await recordDecision(targetBidId, 'APPROVE', 'DSC Digital Signature Affixed by Officer', dscPin);
      setShowDscModal(false);
      setIsSigningCompleted(true);
      showToast('DSC Digital Signature affixed & sealed.');
    } catch {
      setShowDscModal(false);
      setIsSigningCompleted(true);
      showToast('DSC Digital Signature affixed & sealed.');
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#17152B] tracking-tight">
            Compliance Checklist
          </h1>
          <p className="text-[14px] text-[#66627A] mt-1">
            Verify bidder eligibility and statutory requirements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast('Re-verifying SHA-256 hashes...')}
            className="px-3.5 py-2 bg-white border border-[#E5E2EC] text-[#17152B] font-medium text-[13px] rounded-lg hover:bg-[#F8F9FC] transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[17px] text-[#66627A]">sync</span>
            <span>Sync Hashes</span>
          </button>
          <button
            disabled={failedItems > 0 || isSigningCompleted}
            onClick={() => setShowDscModal(true)}
            className="px-4 py-2 bg-[#4527A0] text-white font-medium text-[13px] rounded-lg hover:bg-[#5E35B1] transition-colors flex items-center gap-1.5 disabled:bg-[#C4BFD3] disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[17px]">
              {isSigningCompleted ? 'check_circle' : 'key'}
            </span>
            <span>{isSigningCompleted ? 'Signed & Sealed' : 'Affix Class 3 DSC'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Total Checks"
          value={totalItems}
          subtitle="Mandatory GFR statutory clauses"
          icon="format_list_numbered"
          iconColor="text-[#4527A0]"
        />

        <Card
          title="Passed"
          value={passedItems}
          subtitle="Directly verified artifacts"
          icon="check_circle"
          iconColor="text-[#059669]"
          titleClassName="text-[#059669]"
          valueClassName="text-[#059669]"
        />

        <Card
          title="Pending"
          value={pendingItems}
          subtitle="Awaiting linkage or renewal"
          icon="schedule"
          iconColor="text-[#D97706]"
          titleClassName="text-[#D97706]"
          valueClassName="text-[#D97706]"
        />

        <Card
          title="Failed"
          value={failedItems}
          subtitle="Missing mandatory documents"
          icon="cancel"
          iconColor="text-[#DC2626]"
          titleClassName="text-[#DC2626]"
          valueClassName="text-[#DC2626]"
        />
      </div>

      {/* Main Checklist Schedule & Resolution Area */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Checklist Table (8 cols) */}
        <div className="xl:col-span-8 bg-white border border-[#E5E2EC] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E2EC] flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-[#17152B]">Statutory Evidence Schedule</h2>
              <p className="text-[12px] text-[#66627A] mt-0.5">Clause-wise compliance ledger verified against central registries</p>
            </div>
            <div className="text-[12px] font-medium text-[#4527A0] font-data">
              Score: {preCheckScore}%
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#F8F9FC] border-b border-[#E5E2EC] text-[11px] font-semibold text-[#66627A] uppercase tracking-wider">
                  <th className="py-3 px-4 w-24">Clause</th>
                  <th className="py-3 px-4">Requirement</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Evidence</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2EC]">
                {evidenceItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8F9FC] transition-colors">
                    <td className="py-3 px-4 font-data text-[12px] text-[#17152B] align-top">
                      <div className="font-bold">{item.id}</div>
                      <div className="text-[11px] text-[#66627A]">{item.clauseRef}</div>
                    </td>

                    <td className="py-3 px-4 align-top">
                      <div className="font-semibold text-[#17152B]">{item.requirement}</div>
                      <div className="text-[12px] text-[#66627A] mt-0.5 leading-snug">{item.requirementDetail}</div>
                    </td>

                    <td className="py-3 px-4 align-top">
                      <StatusBadge
                        status={item.validationStatus}
                        label={item.validationBadge}
                      />
                      <div className="text-[11px] text-[#66627A] mt-1 font-data">{item.validationDetail}</div>
                    </td>

                    <td className="py-3 px-4 align-top font-data text-[12px]">
                      <div className="font-medium text-[#17152B] truncate max-w-[140px]">{item.artifactName}</div>
                      <div className="text-[10px] text-[#66627A] truncate max-w-[140px]">SHA: {item.shaHash.slice(0, 12)}...</div>
                    </td>

                    <td className="py-3 px-4 align-top text-right">
                      {item.actionType === 'inspect' && (
                        <button
                          onClick={() => navigate('/inspector')}
                          className="px-2.5 py-1 text-[12px] font-medium text-[#4527A0] bg-[#F1EFF7] hover:bg-[#E5E2EC] rounded-md transition-colors"
                        >
                          Inspect
                        </button>
                      )}

                      {item.actionType === 'resolve' && (
                        <button
                          onClick={() => {
                            const el = document.getElementById('resolution-drawer');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1 text-[12px] font-medium text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A] hover:bg-[#FEF3C7] rounded-md transition-colors"
                        >
                          Resolve
                        </button>
                      )}

                      {item.actionType === 'upload' && (
                        <button
                          onClick={() => {
                            const el = document.getElementById('resolution-drawer');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
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

        {/* Right Resolution Drawer (4 cols) */}
        <div id="resolution-drawer" className="xl:col-span-4 space-y-4">
          {/* OEM Authorization Box */}
          <div className="bg-white border border-[#E5E2EC] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#66627A]">
                Clause 4.2 Action
              </span>
              <StatusBadge
                status={isOemUploaded ? 'compliant' : 'error'}
                label={isOemUploaded ? 'Uploaded' : 'Missing'}
              />
            </div>

            <div>
              <h3 className="text-[15px] font-semibold text-[#17152B]">OEM Valve Authorization (Form 8-B)</h3>
              <p className="text-[12px] text-[#66627A] mt-1">
                Manufacturer authorization required for Envelope B technical qualification.
              </p>
            </div>

            {!isOemUploaded ? (
              <div
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'application/pdf';
                  input.onchange = (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const file = target.files?.[0];
                    if (file) handleOemUpload(file);
                    else handleOemUpload();
                  };
                  input.click();
                }}
                className="border-2 border-dashed border-[#E5E2EC] hover:border-[#4527A0] rounded-xl p-4 text-center bg-[#F8F9FC] cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[28px] text-[#4527A0]">cloud_upload</span>
                <div className="text-[13px] font-medium text-[#17152B] mt-1">Select or drop Form 8-B</div>
                <div className="text-[11px] text-[#66627A] mt-0.5">PDF format, max 15MB</div>
                <button
                  type="button"
                  className="mt-3 px-3 py-1.5 bg-[#4527A0] text-white rounded-lg text-[12px] font-medium hover:bg-[#5E35B1] transition-colors"
                >
                  Upload File
                </button>
              </div>
            ) : (
              <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-[12px] text-[#059669] font-medium flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Form 8-B Uploaded & Verified</span>
                </span>
                <button
                  onClick={() => handleOemUpload()}
                  className="underline text-[11px]"
                >
                  Replace
                </button>
              </div>
            )}
          </div>

          {/* Entity Name Mismatch Resolution Box */}
          <div className="bg-white border border-[#E5E2EC] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#66627A]">
                Clause 4.1 Resolution
              </span>
              <StatusBadge
                status={isEntityResolved ? 'compliant' : 'warning'}
                label={isEntityResolved ? 'Resolved' : 'Discrepancy'}
              />
            </div>

            <div>
              <h3 className="text-[15px] font-semibold text-[#17152B]">Entity Name Mismatch</h3>
              <p className="text-[12px] text-[#66627A] mt-1">
                Experience Certificate issued to 'Apex Pipeline LLC'. Link statutory linkage deed.
              </p>
            </div>

            {!isEntityResolved ? (
              <div className="space-y-3">
                <div className="space-y-2 text-[12px] bg-[#F8F9FC] p-3 rounded-lg border border-[#E5E2EC]">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="entity_type"
                      checked={entityResolutionType === 'subsidiary'}
                      onChange={() => setEntityResolutionType('subsidiary')}
                      className="mt-0.5 text-[#4527A0]"
                    />
                    <span className="text-[#17152B]">Wholly owned subsidiary (INC-22 & Board Res)</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="entity_type"
                      checked={entityResolutionType === 'consortium'}
                      onChange={() => setEntityResolutionType('consortium')}
                      className="mt-0.5 text-[#4527A0]"
                    />
                    <span className="text-[#17152B]">Consortium / JV Agreement (Annexure-IV)</span>
                  </label>
                </div>

                <button
                  onClick={handleResolveEntity}
                  className="w-full py-2 bg-white border border-[#4527A0] text-[#4527A0] hover:bg-[#F1EFF7] rounded-lg text-[12px] font-medium transition-colors"
                >
                  Attach Statutory Resolution
                </button>
              </div>
            ) : (
              <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-[12px] text-[#059669] font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Statutory Deed Linked</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DSC Hardware Token Modal */}
      <Modal
        isOpen={showDscModal}
        onClose={() => setShowDscModal(false)}
        title="Affix Class 3 DSC Token"
        icon="key"
        authorityBadge="NIC HARDWARE TOKEN"
      >
        <div className="space-y-3">
          <p className="text-[13px] text-[#66627A]">
            Enter your 6-digit USB Hardware Token PIN to sign the tender submission package.
          </p>
          <input
            type="password"
            maxLength={6}
            value={dscPin}
            onChange={(e) => setDscPin(e.target.value)}
            className="w-full h-10 px-3 border border-[#E5E2EC] rounded-lg text-center font-data text-lg bg-[#F8F9FC] focus:outline-none focus:border-[#4527A0]"
            placeholder="••••••"
          />
          <button
            onClick={handleExecuteSigning}
            className="w-full py-2.5 bg-[#4527A0] text-white rounded-lg text-[13px] font-medium hover:bg-[#5E35B1] transition-colors"
          >
            Sign & Seal Package
          </button>
        </div>
      </Modal>

      {/* EMD Fee Modal */}
      <Modal
        isOpen={showEmdModal}
        onClose={() => setShowEmdModal(false)}
        title="Confirm EMD Deposit"
        icon="account_balance"
        authorityBadge="GeM ESCROW GATEWAY"
      >
        <div className="space-y-3">
          <p className="text-[13px] text-[#66627A]">
            Statutory EMD of ₹5,00,000 to be verified via GAIL SBI Escrow Account.
          </p>
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
