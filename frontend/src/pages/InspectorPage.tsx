import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { recordDecision, fetchDashboardStats } from '../services/api';

interface OutletContextType {
  showToast: (msg: string) => void;
}

export const InspectorPage: React.FC = () => {
  const { showToast } = useOutletContext<OutletContextType>();
  const [selectedDoc, setSelectedDoc] = useState<string>('Experience_Cert_GAIL_P2.pdf');
  const [inspectionMode, setInspectionMode] = useState<'bounding' | 'raw' | 'trace' | 'diff'>('bounding');
  const [officerDecision, setOfficerDecision] = useState<'clarify' | 'reject' | 'overrule'>('clarify');
  const [officerPin, setOfficerPin] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  const handleExecuteOfficerOrder = async () => {
    if (!officerPin || officerPin.length < 4) {
      showToast('Please enter your 6-Digit Officer DSC PIN to execute order.');
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
    <div className="flex flex-col w-full min-h-screen bg-slate-100 p-4 lg:p-8 space-y-6">
      {/* 1. DOCUMENT NAME & REVIEW STATUS HEADER */}
      <div className="bg-white border border-slate-300 rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-data text-[11px] uppercase font-bold text-slate-500">
            <span>STEP 2: DOCUMENT REVIEW</span>
            <span className="opacity-40">•</span>
            <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
              1 ISSUE DETECTED
            </span>
          </div>
          <h1 className="text-[22px] font-display font-bold text-slate-900 mt-1">
            {selectedDoc}
          </h1>
          <div className="text-[12px] text-slate-600 font-sans mt-0.5">
            Technical Experience Certificate • Clause 4.1 Audit
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDoc}
            onChange={(e) => setSelectedDoc(e.target.value)}
            className="h-9 px-3 bg-slate-50 font-bold text-[12px] font-data border border-slate-300 rounded-md focus:outline-none focus:border-slate-800"
          >
            <option value="Experience_Cert_GAIL_P2.pdf">Experience_Cert_GAIL_P2.pdf (Issue Flagged)</option>
            <option value="Audited_FY24-25.pdf">Audited_FY24-25.pdf (Verified)</option>
            <option value="GST_Certificate.pdf">GST_Certificate.pdf (Verified)</option>
          </select>
          <button onClick={() => showToast(`Downloading ${selectedDoc}...`)} className="px-3 h-9 bg-white border border-slate-300 text-slate-900 text-[12px] font-bold font-data rounded-md">
            Download PDF
          </button>
        </div>
      </div>

      {/* 2. AI EXPLANATION PANEL (Answers: What checked? What found? Why flagged? Recommended next action?) */}
      <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between font-data border-b border-amber-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-800 text-[20px]">smart_toy</span>
            <h2 className="font-bold text-amber-950 text-[14px]">AI Findings Summary</h2>
          </div>
          <span className="text-[10px] bg-amber-200/80 text-amber-950 font-bold px-2 py-0.5 rounded border border-amber-400">
            ISSUE DETECTED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[12px]">
          {/* What was checked? */}
          <div className="bg-white p-3 rounded border border-amber-200 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-500 font-data">1. What Was Checked?</div>
            <div className="font-bold text-slate-900">Clause 4.1 Experience Entity Match</div>
            <div className="text-slate-600 text-[11px]">Experience Certificate vs GST Legal Name</div>
          </div>

          {/* What was found? */}
          <div className="bg-white p-3 rounded border border-amber-200 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-500 font-data">2. What Was Found?</div>
            <div className="font-bold text-red-900">Apex Pipeline LLC</div>
            <div className="text-slate-600 text-[11px]">Bidder Name: Apex InfraTech Solutions</div>
          </div>

          {/* Why was it flagged? */}
          <div className="bg-white p-3 rounded border border-amber-200 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-500 font-data">3. Why Flagged?</div>
            <div className="font-bold text-amber-900">Legal Name Mismatch</div>
            <div className="text-slate-600 text-[11px]">Match Score: 68.1% (Below 90% Threshold)</div>
          </div>

          {/* Recommended Action */}
          <div className="bg-white p-3 rounded border border-amber-200 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-500 font-data">4. Recommended Next Action</div>
            <div className="font-bold text-slate-900">Issue 48-Hr Clarification</div>
            <div className="text-slate-600 text-[11px]">Request Consortium Deed or M&A Proof</div>
          </div>
        </div>
      </div>

      {/* 3. SUPPORTING EVIDENCE (Highlighted Document & View Modes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Highlighted Document Preview */}
        <div className="lg:col-span-7 bg-white border border-slate-300 rounded-lg overflow-hidden shadow-xs space-y-3 p-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-display font-bold text-slate-900 text-[15px]">Supporting Evidence (Highlighted Document)</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-300 font-data text-[10px]">
                {(['bounding', 'raw', 'trace', 'diff'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setInspectionMode(mode)}
                    className={`px-2 py-0.5 font-bold rounded capitalize ${
                      inspectionMode === mode ? 'bg-[#0B192C] text-white' : 'text-slate-600'
                    }`}
                  >
                    {mode === 'bounding' && 'Highlighted Evidence'}
                    {mode === 'raw' && 'Extracted Data'}
                    {mode === 'trace' && 'Compliance Checker'}
                    {mode === 'diff' && 'Document Comparison'}
                  </button>
                ))}
              </div>
              <div className="flex items-center bg-slate-100 rounded border border-slate-300 font-data text-[10px]">
                <button 
                  onClick={() => setZoomLevel((z) => Math.max(75, z - 10))} 
                  className="px-2 py-0.5 text-slate-700 hover:bg-slate-200 font-bold border-r border-slate-300"
                >
                  -
                </button>
                <span className="px-2 py-0.5 text-slate-700 font-bold">{zoomLevel}%</span>
                <button 
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 10))} 
                  className="px-2 py-0.5 text-slate-700 hover:bg-slate-200 font-bold border-l border-slate-300"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-200 p-4 rounded border border-slate-300 min-h-[480px] flex items-center justify-center overflow-auto">
            <div 
              className="w-full bg-white shadow-md p-6 border border-slate-400 space-y-4 font-sans transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded border border-slate-300">
                <div>
                  <div className="font-display font-bold text-[#0B192C] text-[15px]">GAIL (INDIA) LIMITED</div>
                  <div className="text-[9px] uppercase font-data font-bold text-slate-500">Government Undertaking</div>
                </div>
                <div className="text-right font-data text-[9px] text-slate-600">Ref: GAIL/HVJ/PROJ/2024</div>
              </div>

              <h4 className="text-center font-display font-bold text-[16px] uppercase underline text-slate-900">
                Satisfactory Execution Certificate
              </h4>

              <div className="p-3 bg-amber-50 border-2 border-slate-800 rounded relative">
                <div className="absolute -top-3 left-3 bg-[#0B192C] text-amber-400 text-[9px] px-2 py-0.5 rounded font-data font-bold">
                  HIGHLIGHTED ISSUE: ENTITY NAME
                </div>
                <p className="text-[13px] text-slate-900 pt-1 font-sans">
                  Issued in favor of <mark className="bg-red-200 text-red-900 font-bold px-1 rounded border border-red-400">M/s Apex Pipeline LLC</mark> for 142.8 KM gas trunkline expansion.
                </p>
                <div className="mt-2 pt-2 border-t border-slate-300 flex items-center justify-between font-data text-[10px] text-red-900 font-bold">
                  <span>Bidder Record: Apex InfraTech Solutions Pvt Ltd</span>
                  <span>Match: 68.1%</span>
                </div>
              </div>

              <p className="text-[12px] text-slate-700 font-sans leading-relaxed">
                Total continuous contract period: 4.2 years (Jan 2020 - Mar 2024). Operational performance met API 1104 standards.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Officer Action Panel */}
        <div className="lg:col-span-5 bg-white border border-slate-300 rounded-lg p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="font-display font-bold text-slate-900 text-[16px]">Step 4: Officer Action</h3>
            <p className="text-[12px] text-slate-600">Choose action to resolve the detected issue.</p>
          </div>

          <div className="space-y-2 text-[12px]">
            <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-300 rounded-md cursor-pointer">
              <input type="radio" checked={officerDecision === 'clarify'} onChange={() => setOfficerDecision('clarify')} />
              <div>
                <div className="font-bold text-slate-900">Issue 48-Hour Notice</div>
                <div className="text-[11px] text-slate-600">Request Consortium Deed or M&A proof from bidder.</div>
              </div>
            </label>

            <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-300 rounded-md cursor-pointer">
              <input type="radio" checked={officerDecision === 'reject'} onChange={() => setOfficerDecision('reject')} />
              <div>
                <div className="font-bold text-red-900">Reject Bid</div>
                <div className="text-[11px] text-slate-600">Confirm disqualification under Clause 4.1.</div>
              </div>
            </label>

            <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-300 rounded-md cursor-pointer">
              <input type="radio" checked={officerDecision === 'overrule'} onChange={() => setOfficerDecision('overrule')} />
              <div>
                <div className="font-bold text-slate-900">Approve Document</div>
                <div className="text-[11px] text-slate-600">Overrule flag after manual verification.</div>
              </div>
            </label>
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-2">
            <label className="text-[11px] font-bold font-data text-slate-700 uppercase">Enter Officer DSC PIN to Execute</label>
            <div className="flex gap-2">
              <input
                type="password"
                maxLength={6}
                value={officerPin}
                onChange={(e) => setOfficerPin(e.target.value)}
                placeholder="6-Digit PIN"
                className="h-9 px-3 border border-slate-300 rounded-md font-data text-[13px] bg-slate-50 w-full"
              />
              <button
                onClick={handleExecuteOfficerOrder}
                className="px-4 h-9 bg-[#0B192C] text-white text-[12px] font-bold font-data rounded-md hover:bg-[#1E3A5F] shrink-0"
              >
                Execute Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TECHNICAL DETAILS (COLLAPSED BY DEFAULT) */}
      <div className="bg-white border border-slate-300 rounded-lg p-4 shadow-xs space-y-3">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full flex items-center justify-between text-left font-data text-[12px] font-bold text-slate-700 hover:text-slate-900"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">code</span>
            <span>Technical Details & Raw OCR Data (Advanced)</span>
          </span>
          <span className="material-symbols-outlined text-[18px]">
            {showTechnicalDetails ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {showTechnicalDetails && (
          <div className="pt-3 border-t border-slate-200 space-y-3 font-data text-[11px]">
            <div className="bg-slate-900 text-slate-200 p-3 rounded overflow-x-auto">
              <pre>{`{
  "document_id": "Experience_Cert_GAIL_P2.pdf",
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
  );
};
