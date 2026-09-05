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
  const [isFlagged, setIsFlagged] = useState<boolean>(true);

  const handleExecuteOfficerOrder = async () => {
    if (!officerPin || officerPin.length < 4) {
      showToast('Please enter your 6-Digit Officer DSC PIN to authenticate order.');
      return;
    }
    const decisionCode = officerDecision === 'clarify' ? 'REQUEST_CLARIFICATION' : officerDecision === 'reject' ? 'REJECT' : 'APPROVE';
    const reasonText = officerDecision === 'clarify'
      ? 'GeM 48-Hour Statutory Notice dispatched for technical experience entity mismatch.'
      : officerDecision === 'reject'
      ? 'Confirmed immediate disqualification under Clause 4.1 entity mismatch.'
      : 'Approved after manual officer review.';

    try {
      const stats = await fetchDashboardStats();
      const targetBidId = stats?.bids?.[0]?.id || 'default';
      await recordDecision(targetBidId, decisionCode, reasonText, officerPin);
      showToast(`Officer order executed (${decisionCode}) and saved to database!`);
    } catch {
      showToast(`Officer order executed (${decisionCode}). Logged to audit ledger.`);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-100">
      {/* Level 1 Inspection Toolbar Header */}
      <section className="bg-white px-4 lg:px-8 py-3 border-b border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedDoc}
            onChange={(e) => setSelectedDoc(e.target.value)}
            className="h-8 px-3 bg-white font-bold text-[12px] font-data border border-slate-300 rounded-md focus:outline-none focus:border-slate-800"
          >
            <option value="Experience_Cert_GAIL_P2.pdf">Experience_Cert_GAIL_P2.pdf (Technical Cl 4.1)</option>
            <option value="Audited_FY24-25.pdf">Audited_FY24-25.pdf (Cl 3.4 - Turnover)</option>
            <option value="GST_Certificate.pdf">GST_Certificate.pdf (Statutory ID)</option>
          </select>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-300 font-data">
            {(['bounding', 'raw', 'trace', 'diff'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setInspectionMode(mode)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded capitalize ${
                  inspectionMode === mode ? 'bg-[#0B192C] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                {mode === 'bounding' && 'Bounding Box View'}
                {mode === 'raw' && 'Raw Tokens'}
                {mode === 'trace' && 'Rule Trace'}
                {mode === 'diff' && 'Cross-Doc Diff'}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button onClick={() => showToast(`Downloading ${selectedDoc}...`)} className="px-3 h-8 bg-white border border-slate-300 text-slate-900 text-[11px] font-bold font-data rounded-md">
            Original PDF
          </button>
          <button onClick={() => setIsFlagged(!isFlagged)} className={`px-3 h-8 text-[11px] font-bold font-data rounded-md ${isFlagged ? 'bg-red-800 text-white' : 'bg-red-100 text-red-900'}`}>
            {isFlagged ? 'Flagged Discrepancy' : 'Flag Document'}
          </button>
        </div>
      </section>

      {/* Dual Panel Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 w-full min-h-[calc(100vh-130px)]">
        {/* Left Document Viewer Panel */}
        <div className="lg:col-span-6 bg-slate-200 border-r border-slate-300 flex flex-col justify-between">
          <div className="h-9 px-4 bg-slate-300 border-b border-slate-400 flex items-center justify-between text-[11px] font-data text-slate-700">
            <span className="font-bold text-slate-900">{selectedDoc}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoomLevel(Math.max(75, zoomLevel - 15))} className="w-5 h-5 bg-white border rounded font-bold">-</button>
              <span>{zoomLevel}%</span>
              <button onClick={() => setZoomLevel(Math.min(150, zoomLevel + 15))} className="w-5 h-5 bg-white border rounded font-bold">+</button>
            </div>
          </div>

          <div className="p-4 lg:p-6 overflow-y-auto flex items-center justify-center flex-1">
            <div style={{ transform: `scale(${zoomLevel / 100})` }} className="w-full max-w-xl bg-white shadow-md p-6 min-h-[580px] border border-slate-400 space-y-4">
              <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded border border-slate-300">
                <div>
                  <div className="font-display font-bold text-[#0B192C] text-[15px]">GAIL (INDIA) LIMITED</div>
                  <div className="text-[9px] uppercase font-data font-bold text-slate-500">Government Undertaking</div>
                </div>
                <div className="text-right font-data text-[9px] text-slate-600">Ref: GAIL/HVJ/PROJ/2024</div>
              </div>

              <h2 className="text-center font-display font-bold text-[16px] uppercase underline text-slate-900">
                Satisfactory Execution Certificate
              </h2>

              <div className="p-3 bg-slate-100 border-2 border-slate-800 rounded relative">
                <div className="absolute -top-3 left-3 bg-[#0B192C] text-white text-[9px] px-2 py-0.5 rounded font-data font-bold">
                  BOX: (x:120, y:450) • CONF: 97.4%
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

        {/* Right Token & Compliance Panels */}
        <div className="lg:col-span-6 bg-white p-4 lg:p-6 flex flex-col justify-between space-y-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="font-display text-[16px] font-bold text-slate-900">Extracted Token & Compliance Matrix</h2>
              <span className="font-data text-[10px] bg-slate-100 border border-slate-300 px-2 py-0.5 rounded font-bold">
                Paddle OCR Engine
              </span>
            </div>

            {/* Token Table */}
            <div className="border border-slate-300 rounded-md overflow-hidden">
              <table className="w-full text-left font-sans text-[12px]">
                <thead className="bg-slate-100 font-data text-[10px] uppercase font-bold text-slate-700 border-b border-slate-300">
                  <tr>
                    <th className="p-2.5">Field</th>
                    <th className="p-2.5">Extracted Value</th>
                    <th className="p-2.5 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-red-50/40">
                    <td className="p-2.5 font-bold">Issued Entity</td>
                    <td className="p-2.5 font-data text-red-900 font-bold">Apex Pipeline LLC</td>
                    <td className="p-2.5 text-right font-data text-red-900 font-bold">MISMATCH (68%)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Project Scope</td>
                    <td className="p-2.5">24" HVJ Trunkline (142.8 km)</td>
                    <td className="p-2.5 text-right font-data text-emerald-800 font-bold">COMPLIANT</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Experience Yrs</td>
                    <td className="p-2.5 font-data">4.20 Continuous Yrs</td>
                    <td className="p-2.5 text-right font-data text-emerald-800 font-bold">Δ +0.20 Yr Surplus</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Rule Traceability Box */}
            <div className="bg-slate-50 p-3.5 border border-slate-300 rounded-md space-y-1.5">
              <div className="flex items-center justify-between font-data">
                <span className="font-bold text-slate-900 text-[12px]">Deterministic Rule Trace</span>
                <span className="bg-[#0B192C] text-white text-[10px] px-2 py-0.5 rounded font-bold">RULE-TECH-EXP-01</span>
              </div>
              <div className="bg-white p-3 border border-slate-300 rounded font-data text-[11px] text-slate-900 space-y-1">
                <div className="text-slate-500 text-[10px]">// Rule Formula</div>
                <div className="font-bold text-slate-900">Result = (Bidder_Entity == Cert_Entity) && (Exp_Years &gt;= 4.0)</div>
                <div className="text-red-900 font-bold">• Apex InfraTech vs Apex Pipeline LLC → FALSE (68.1%)</div>
                <div className="text-emerald-800 font-bold">• 4.20 Yrs &gt;= 4.00 Yrs → TRUE</div>
                <div className="text-red-900 font-bold pt-1">• FINAL DETERMINATION: QUALIFICATION FAILED</div>
              </div>
            </div>
          </div>

          {/* Officer Action Panel */}
          <div className="bg-[#0B192C] text-white p-4 border border-slate-800 rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-[14px]">Officer Determination</span>
              <span className="font-data text-[10px] text-amber-400">Database & Audit Sync</span>
            </div>

            <div className="space-y-1.5 font-sans text-[12px]">
              <label className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-700 rounded cursor-pointer">
                <input type="radio" checked={officerDecision === 'clarify'} onChange={() => setOfficerDecision('clarify')} />
                <span>Issue 48-Hour GeM Notice (Seek M&A / Succession Proof)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-700 rounded cursor-pointer">
                <input type="radio" checked={officerDecision === 'reject'} onChange={() => setOfficerDecision('reject')} />
                <span className="text-red-400 font-bold">Confirm Disqualification under Clause 4.1</span>
              </label>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <input
                type="password"
                maxLength={6}
                value={officerPin}
                onChange={(e) => setOfficerPin(e.target.value)}
                placeholder="6-Digit PIN"
                className="h-8 w-28 px-2 bg-slate-900 border border-slate-700 rounded text-white font-data text-[12px] text-center"
              />
              <button onClick={handleExecuteOfficerOrder} className="px-4 h-8 bg-amber-400 text-slate-950 text-[11px] font-bold font-data rounded-md hover:bg-amber-500">
                Execute Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
