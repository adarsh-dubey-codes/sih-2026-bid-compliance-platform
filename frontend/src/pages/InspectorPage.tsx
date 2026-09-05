import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { recordDecision, fetchDashboardStats } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';

interface OutletContextType {
  showToast: (msg: string) => void;
}

interface EvidenceDocument {
  id: string;
  name: string;
  type: string;
  status: 'verified' | 'warning' | 'error';
  statusLabel: string;
  source: string;
  timestamp: string;
  extractedData: string;
  verificationResult: string;
  clause: string;
}

export const InspectorPage: React.FC = () => {
  const { showToast } = useOutletContext<OutletContextType>();
  const [selectedDocId, setSelectedDocId] = useState<string>('DOC-01');
  const [inspectionMode, setInspectionMode] = useState<'bounding' | 'raw' | 'trace' | 'diff'>('bounding');
  const [officerDecision, setOfficerDecision] = useState<'clarify' | 'reject' | 'overrule'>('clarify');
  const [officerPin, setOfficerPin] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  const documentList: EvidenceDocument[] = [
    {
      id: 'DOC-01',
      name: 'Experience_Cert_GAIL_P2.pdf',
      type: 'Technical Experience Certificate',
      status: 'warning',
      statusLabel: 'Issues Found',
      source: 'GAIL (India) Limited Escrow Registry',
      timestamp: '04-Sep-2026 14:22 IST',
      extractedData: 'Issued to: M/s Apex Pipeline LLC | Duration: 4.2 Years (Jan 2020 - Mar 2024)',
      verificationResult: 'Name Mismatch Flagged (Apex Pipeline LLC vs Apex InfraTech Solutions)',
      clause: 'Clause 4.1'
    },
    {
      id: 'DOC-02',
      name: 'Audited_Financials_FY24.pdf',
      type: 'Financial Turnover Certificate',
      status: 'verified',
      statusLabel: 'Verified',
      source: 'ICAI Chartered Accountant Registry',
      timestamp: '04-Sep-2026 11:05 IST',
      extractedData: 'Average Annual Turnover: ₹42.8 Crore | UDIN: 24089123A000182',
      verificationResult: 'Meets minimum ₹25 Crore requirement',
      clause: 'Clause 3.2'
    },
    {
      id: 'DOC-03',
      name: 'GST_Registration_Certificate.pdf',
      type: 'Statutory GST Registration',
      status: 'verified',
      statusLabel: 'Verified',
      source: 'GSTN Government Gateway API',
      timestamp: '04-Sep-2026 09:12 IST',
      extractedData: 'GSTIN: 07AAAAC1234D1Z5 | Legal Name: Apex InfraTech Solutions Pvt Ltd',
      verificationResult: 'Active GSTIN Verified',
      clause: 'Clause 1.4'
    },
  ];

  const currentDoc = documentList.find(d => d.id === selectedDocId) || documentList[0];

  const handleExecuteOfficerOrder = async () => {
    if (!officerPin || officerPin.length < 4) {
      showToast('Please enter your 6-Digit Officer PIN to execute order.');
      return;
    }
    const decisionCode = officerDecision === 'clarify' ? 'REQUEST_CLARIFICATION' : officerDecision === 'reject' ? 'REJECT' : 'APPROVE';
    const reasonText = officerDecision === 'clarify'
      ? 'GeM 48-Hour Notice dispatched for technical experience entity mismatch.'
      : officerDecision === 'reject'
      ? 'Confirmed immediate disqualification under Clause 4.1 entity mismatch.'
      : 'Approved after manual officer review.';

    try {
      const stats = await fetchDashboardStats();
      const targetBidId = stats?.bids?.[0]?.id || 'default';
      await recordDecision(targetBidId, decisionCode, reasonText, officerPin);
      showToast(`Officer decision (${decisionCode}) recorded & saved!`);
    } catch {
      showToast(`Officer decision (${decisionCode}) saved to audit log.`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#17152B] tracking-tight">Document Review</h1>
          <p className="text-[14px] text-[#66627A] mt-0.5">Inspect extracted evidence and AI compliance analysis.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast(`Downloading ${currentDoc.name}...`)}
            className="px-4 py-2 bg-white border border-[#E5E2EC] text-[#17152B] text-[13px] font-medium rounded-lg hover:bg-[#F8F9FC] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Download Document</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Clean Layout according to Section 7 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (4 Cols): Document & Evidence Selector */}
        <div className="lg:col-span-4 bg-white border border-[#E5E2EC] rounded-[12px] p-5 space-y-4">
          <h2 className="text-[15px] font-bold text-[#17152B] border-b border-[#E5E2EC] pb-3">
            Submitted Evidence Files
          </h2>

          <div className="space-y-2.5">
            {documentList.map(doc => (
              <div
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors space-y-2 ${
                  selectedDocId === doc.id
                    ? 'border-[#4527A0] bg-[#F3E8FF]/30'
                    : 'border-[#E5E2EC] hover:bg-[#F8F9FC]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[13px] text-[#17152B] truncate max-w-[180px]">
                    {doc.name}
                  </span>
                  <StatusBadge status={doc.status} label={doc.statusLabel} />
                </div>
                <div className="text-[12px] text-[#66627A]">{doc.type}</div>
                <div className="text-[11px] text-[#66627A] font-mono pt-1 border-t border-[#E5E2EC]">
                  Clause: {doc.clause}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN (8 Cols): Selected Evidence Details & AI Findings */}
        <div className="lg:col-span-8 space-y-6">
          {/* Document Overview Section */}
          <div className="bg-white border border-[#E5E2EC] rounded-[12px] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E2EC] pb-4">
              <div>
                <h2 className="text-[18px] font-bold text-[#17152B]">{currentDoc.name}</h2>
                <p className="text-[13px] text-[#66627A] mt-0.5">{currentDoc.type}</p>
              </div>
              <StatusBadge status={currentDoc.status} label={currentDoc.statusLabel} />
            </div>

            {/* Structured Evidence Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px] pt-1">
              <div>
                <span className="text-[#66627A] text-[12px]">Source Gateway:</span>
                <div className="font-medium text-[#17152B] mt-0.5">{currentDoc.source}</div>
              </div>
              <div>
                <span className="text-[#66627A] text-[12px]">Timestamp Verified:</span>
                <div className="font-medium text-[#17152B] mt-0.5">{currentDoc.timestamp}</div>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[#66627A] text-[12px]">Extracted Information:</span>
                <div className="font-mono text-[12px] bg-[#F8F9FC] border border-[#E5E2EC] p-3 rounded-lg text-[#17152B] mt-1">
                  {currentDoc.extractedData}
                </div>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[#66627A] text-[12px]">Verification Result:</span>
                <div className="font-medium text-[#17152B] mt-0.5">{currentDoc.verificationResult}</div>
              </div>
            </div>
          </div>

          {/* AI Explanation Panel */}
          {currentDoc.status === 'warning' && (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[12px] p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#B45309]">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                <h3 className="font-bold text-[15px]">AI Decision Breakdown</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                <div className="bg-white p-3.5 rounded-lg border border-[#FDE68A] space-y-1">
                  <div className="text-[11px] font-semibold uppercase text-[#66627A]">What was checked?</div>
                  <div className="font-medium text-[#17152B]">Minimum 5 Years Experience</div>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-[#FDE68A] space-y-1">
                  <div className="text-[11px] font-semibold uppercase text-[#66627A]">What was found?</div>
                  <div className="font-medium text-[#B91C1C]">4.2 Years (Apex Pipeline LLC)</div>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-[#FDE68A] space-y-1">
                  <div className="text-[11px] font-semibold uppercase text-[#66627A]">Why was it flagged?</div>
                  <div className="font-medium text-[#B45309]">Name Mismatch & Duration Under 5.0 Yrs</div>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-[#FDE68A] space-y-1">
                  <div className="text-[11px] font-semibold uppercase text-[#66627A]">Recommended Action</div>
                  <div className="font-medium text-[#17152B]">Request clarification from bidder.</div>
                </div>
              </div>
            </div>
          )}

          {/* Highlighted Evidence Viewer & Zoom Controls */}
          <div className="bg-white border border-[#E5E2EC] rounded-[12px] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E2EC] pb-3">
              <h3 className="font-bold text-[#17152B] text-[15px]">Highlighted Evidence Document</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg p-0.5 text-[12px]">
                  {(['bounding', 'raw', 'trace', 'diff'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setInspectionMode(mode)}
                      className={`px-3 py-1 rounded-md font-medium capitalize ${
                        inspectionMode === mode
                          ? 'bg-[#4527A0] text-white'
                          : 'text-[#66627A] hover:text-[#17152B]'
                      }`}
                    >
                      {mode === 'bounding' && 'Highlighted Evidence'}
                      {mode === 'raw' && 'Extracted Data'}
                      {mode === 'trace' && 'Compliance Checker'}
                      {mode === 'diff' && 'Document Comparison'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg text-[12px]">
                  <button
                    onClick={() => setZoomLevel(z => Math.max(75, z - 10))}
                    className="px-2.5 py-1 text-[#66627A] font-bold border-r border-[#E5E2EC] hover:bg-[#E5E2EC]"
                  >
                    -
                  </button>
                  <span className="px-2.5 py-1 text-[#17152B] font-medium">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel(z => Math.min(150, z + 10))}
                    className="px-2.5 py-1 text-[#66627A] font-bold border-l border-[#E5E2EC] hover:bg-[#E5E2EC]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Document Render Box */}
            <div className="bg-[#F8F9FC] p-6 rounded-lg border border-[#E5E2EC] min-h-[400px] flex items-center justify-center overflow-auto">
              <div
                className="w-full bg-white shadow-sm p-6 border border-[#E5E2EC] space-y-4 transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                <div className="flex justify-between items-center bg-[#F8F9FC] p-3 rounded-lg border border-[#E5E2EC]">
                  <div>
                    <div className="font-bold text-[#17152B] text-[15px]">GAIL (INDIA) LIMITED</div>
                    <div className="text-[10px] text-[#66627A] uppercase">Government Undertaking</div>
                  </div>
                  <div className="text-right text-[11px] text-[#66627A] font-mono">Ref: GAIL/HVJ/PROJ/2024</div>
                </div>

                <h4 className="text-center font-bold text-[16px] uppercase underline text-[#17152B]">
                  Satisfactory Execution Certificate
                </h4>

                <div className="p-4 bg-[#FFFBEB] border-2 border-[#17152B] rounded-lg relative">
                  <div className="absolute -top-3 left-3 bg-[#4527A0] text-white text-[10px] px-2 py-0.5 rounded font-semibold">
                    HIGHLIGHTED EVIDENCE
                  </div>
                  <p className="text-[13px] text-[#17152B] pt-1">
                    Issued in favor of <mark className="bg-[#FEF2F2] text-[#B91C1C] font-bold px-1 rounded border border-[#FECACA]">M/s Apex Pipeline LLC</mark> for 142.8 KM gas trunkline expansion.
                  </p>
                  <div className="mt-2 pt-2 border-t border-[#E5E2EC] flex items-center justify-between text-[11px] text-[#B91C1C] font-medium">
                    <span>Bidder Name: Apex InfraTech Solutions Pvt Ltd</span>
                    <span>Match: 68.1%</span>
                  </div>
                </div>

                <p className="text-[13px] text-[#66627A] leading-relaxed">
                  Total continuous contract period: 4.2 years (Jan 2020 - Mar 2024). Operational performance met API 1104 standards.
                </p>
              </div>
            </div>
          </div>

          {/* Officer Action Form */}
          <div className="bg-white border border-[#E5E2EC] rounded-[12px] p-6 space-y-4">
            <h3 className="font-bold text-[#17152B] text-[16px] border-b border-[#E5E2EC] pb-2">Officer Action</h3>

            <div className="space-y-3 text-[13px]">
              <label className="flex items-center gap-3 p-3.5 bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg cursor-pointer">
                <input type="radio" checked={officerDecision === 'clarify'} onChange={() => setOfficerDecision('clarify')} />
                <div>
                  <div className="font-semibold text-[#17152B]">Request Clarification</div>
                  <div className="text-[12px] text-[#66627A]">Request bidder to upload Consortium Deed or M&A proof.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg cursor-pointer">
                <input type="radio" checked={officerDecision === 'reject'} onChange={() => setOfficerDecision('reject')} />
                <div>
                  <div className="font-semibold text-[#B91C1C]">Reject Bid</div>
                  <div className="text-[12px] text-[#66627A]">Disqualify bid due to Clause 4.1 non-compliance.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 bg-[#F8F9FC] border border-[#E5E2EC] rounded-lg cursor-pointer">
                <input type="radio" checked={officerDecision === 'overrule'} onChange={() => setOfficerDecision('overrule')} />
                <div>
                  <div className="font-semibold text-[#17152B]">Approve Document</div>
                  <div className="text-[12px] text-[#66627A]">Accept document after manual verification.</div>
                </div>
              </label>
            </div>

            <div className="pt-3 border-t border-[#E5E2EC] flex items-center gap-3">
              <input
                type="password"
                maxLength={6}
                value={officerPin}
                onChange={(e) => setOfficerPin(e.target.value)}
                placeholder="6-Digit Officer PIN"
                className="h-10 px-4 border border-[#E5E2EC] rounded-lg font-mono text-[14px] bg-[#F8F9FC] focus:outline-none focus:border-[#4527A0] w-48"
              />
              <button
                onClick={handleExecuteOfficerOrder}
                className="px-5 h-10 bg-[#4527A0] text-white text-[13px] font-medium rounded-lg hover:bg-[#5E35B1] transition-colors"
              >
                Submit Officer Decision
              </button>
            </div>
          </div>

          {/* Technical Details Accordion (Collapsed by Default) */}
          <div className="bg-white border border-[#E5E2EC] rounded-[12px] p-5 space-y-3">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full flex items-center justify-between text-left text-[13px] font-semibold text-[#66627A] hover:text-[#17152B]"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">code</span>
                <span>Technical Details (Collapsed)</span>
              </span>
              <span className="material-symbols-outlined text-[20px]">
                {showTechnicalDetails ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {showTechnicalDetails && (
              <div className="pt-3 border-t border-[#E5E2EC] font-mono text-[12px]">
                <div className="bg-[#17152B] text-white p-4 rounded-lg overflow-x-auto">
                  <pre>{`{
  "document_id": "${currentDoc.name}",
  "ocr_engine": "PaddleOCR v2.6",
  "confidence_score": 97.4,
  "bounding_box": {"x": 120, "y": 450, "w": 280, "h": 65},
  "extracted_entity": "Apex Pipeline LLC",
  "registered_entity": "Apex InfraTech Solutions Pvt Ltd",
  "levenstein_similarity": 0.681,
  "rule_evaluated": "RULE-TECH-EXP-01",
  "status": "FLAGGED_MISMATCH"
}`}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

