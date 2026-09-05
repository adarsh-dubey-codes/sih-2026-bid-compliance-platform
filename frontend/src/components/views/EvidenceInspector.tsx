import React, { useState } from 'react';
import type { NavigationPath } from '../../types';

interface EvidenceInspectorProps {
  initialDocKey?: string;
  onNavigate: (path: NavigationPath) => void;
  onShowToast: (msg: string) => void;
}

export const EvidenceInspector: React.FC<EvidenceInspectorProps> = ({
  initialDocKey = 'Experience_Cert_GAIL_P2.pdf',
  onShowToast,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<string>(initialDocKey);
  const [inspectionMode, setInspectionMode] = useState<'bounding' | 'raw' | 'trace' | 'diff'>('bounding');
  const [officerDecision, setOfficerDecision] = useState<'clarify' | 'reject' | 'overrule'>('clarify');
  const [officerPin, setOfficerPin] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFlagged, setIsFlagged] = useState<boolean>(true);
  const [showAnnotationDrawer, setShowAnnotationDrawer] = useState<boolean>(false);
  const [annotationText, setAnnotationText] = useState<string>('');

  const handleExecuteOfficerOrder = () => {
    if (!officerPin || officerPin.length < 4) {
      onShowToast('Please enter your 6-Digit Officer DSC PIN to authenticate order.');
      return;
    }

    let msg = '';
    if (officerDecision === 'clarify') {
      msg = 'Dispatched 48-Hour GeM Statutory Clarification Notice to Bidder. Window closes in 48h.';
    } else if (officerDecision === 'reject') {
      msg = 'Technical Disqualification Order recorded for Clause 4.1. Audit ledger updated.';
    } else {
      msg = 'Officer Overrule recorded with mandatory justification note. Sealed on Block #419,291.';
    }

    onShowToast(msg);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f8f9ff]">
      {/* Sub-Header / Breadcrumb & Inspection Bar */}
      <section className="bg-white px-8 py-3 flex flex-col gap-3 border-b border-[#c8c4d5] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-[11px] text-[#464553] tracking-wider uppercase font-medium">
            <span className="hover:text-[#1f108e] cursor-pointer">Tenders</span>
            <span className="opacity-40">/</span>
            <span className="font-mono text-[#0d1c2e]">MoPNG/GAIL/2026/TND-001</span>
            <span className="opacity-40">/</span>
            <span className="hover:text-[#1f108e] cursor-pointer">Bid Reviews</span>
            <span className="opacity-40">/</span>
            <span className="text-[#1f108e] font-bold">Apex InfraTech & Global Pipeline</span>
            <span className="opacity-40">/</span>
            <span className="bg-[#3730a3] text-white px-2 py-0.5 rounded text-[10px] font-bold">
              AI Doc Inspector
            </span>
          </nav>

          {/* Institutional Badges */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-[#eff4ff] px-2.5 py-1 rounded text-[#464553] font-mono text-[11px] border border-[#c8c4d5]">
              <span className="material-symbols-outlined text-[15px] text-[#1f108e]">fingerprint</span>
              <span>SHA-256: 8f4e2...90c4</span>
              <span className="bg-[#d5e3fc] text-[#0d1c2e] font-bold text-[10px] px-1.5 py-0.2 rounded uppercase">
                Valid
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#ba1a1a] font-semibold">
              <span className="material-symbols-outlined text-[15px]">gavel</span>
              <span>CVC Rigor Level: Tier-1</span>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-[#c8c4d5]">
          <div className="flex flex-wrap items-center gap-3">
            {/* Document Select Dropdown */}
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-[18px] text-[#1f108e]">
                description
              </span>
              <select
                value={selectedDoc}
                onChange={(e) => setSelectedDoc(e.target.value)}
                className="pl-8 pr-8 h-9 bg-white text-[#0d1c2e] font-semibold text-[13px] border border-[#c8c4d5] rounded-lg cursor-pointer focus:outline-none focus:border-[#3730a3]"
              >
                <option value="Experience_Cert_GAIL_P2.pdf">
                  Experience_Cert_GAIL_P2.pdf (Technical Criteria Cl 4.1)
                </option>
                <option value="Audited_FY24-25.pdf">
                  Audited_FY24-25.pdf (Cl 3.4 - Turnover Threshold)
                </option>
                <option value="GST_Certificate_27AAACA0918L1ZV.pdf">
                  GST_Certificate_27AAACA0918L1ZV.pdf (Statutory Identity)
                </option>
                <option value="PAN_Corporate_Card.pdf">
                  PAN_Corporate_Card.pdf (CBDT Authentication)
                </option>
              </select>
            </div>

            {/* Mode Switcher Pills */}
            <div className="flex items-center bg-[#eff4ff] p-0.5 rounded-lg border border-[#c8c4d5]">
              {(['bounding', 'raw', 'trace', 'diff'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setInspectionMode(mode)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${
                    inspectionMode === mode
                      ? 'bg-[#1f108e] text-white shadow-xs'
                      : 'text-[#464553] hover:text-[#0d1c2e] hover:bg-[#dce9ff]'
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
            <button
              onClick={() => onShowToast(`Downloading original source file ${selectedDoc}...`)}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white border border-[#c8c4d5] text-[#1f108e] font-semibold text-[11px] hover:bg-[#eff4ff] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Original PDF</span>
            </button>
            <button
              onClick={() => {
                setIsFlagged(!isFlagged);
                onShowToast(isFlagged ? 'Flag removed from document.' : 'Flagged discrepancy on document.');
              }}
              className={`flex items-center gap-1.5 px-3 h-8 rounded-lg font-semibold text-[11px] transition-colors ${
                isFlagged ? 'bg-[#ba1a1a] text-white' : 'bg-[#ffdad6] text-[#ba1a1a]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">flag</span>
              <span>{isFlagged ? 'Flagged Discrepancy' : 'Flag Document'}</span>
            </button>
            <button
              onClick={() => setShowAnnotationDrawer(!showAnnotationDrawer)}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-[#1f108e] text-white font-semibold text-[11px] hover:bg-[#4b41e1] transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
              <span>Officer Annotation</span>
            </button>
          </div>
        </div>
      </section>

      {/* 55% / 45% Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-0 w-full min-h-[calc(100vh-140px)]">
        {/* LEFT PANEL (55% -> 6 of 10 cols): Document Viewer */}
        <div className="lg:col-span-6 bg-[#eff4ff] border-r border-[#c8c4d5] flex flex-col justify-between">
          {/* PDF Controls Header */}
          <div className="h-10 px-4 bg-[#e6eeff] border-b border-[#c8c4d5] flex items-center justify-between text-[12px] text-[#464553]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[16px] text-[#1f108e]">picture_as_pdf</span>
              <span className="font-mono font-bold text-[#0d1c2e]">{selectedDoc}</span>
              <span className="opacity-30">|</span>
              <span className="bg-white px-1.5 py-0.5 rounded text-[10px] border border-[#c8c4d5]">DPI: 300</span>
              <span className="bg-white px-1.5 py-0.5 rounded text-[10px] border border-[#c8c4d5]">OCR: Paddle-v2.6</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel(Math.max(75, zoomLevel - 15))}
                className="w-6 h-6 rounded flex items-center justify-center bg-white border border-[#c8c4d5] hover:bg-[#eff4ff]"
              >
                <span className="material-symbols-outlined text-[15px]">zoom_out</span>
              </button>
              <span className="font-mono text-[11px] text-[#0d1c2e]">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(150, zoomLevel + 15))}
                className="w-6 h-6 rounded flex items-center justify-center bg-white border border-[#c8c4d5] hover:bg-[#eff4ff]"
              >
                <span className="material-symbols-outlined text-[15px]">zoom_in</span>
              </button>
              <span className="opacity-30">|</span>
              <span className="font-mono text-[11px] text-[#0d1c2e]">Pg 2 / 4</span>
            </div>
          </div>

          {/* Document Canvas Container */}
          <div className="p-6 overflow-y-auto flex items-center justify-center flex-1">
            {/* A4 Sheet View */}
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="relative w-full max-w-2xl bg-white shadow-xl p-8 min-h-[720px] flex flex-col justify-between select-none border border-[#c8c4d5] transition-transform duration-200"
            >
              {/* Document Letterhead */}
              <div>
                <div className="flex items-start justify-between pb-4 mb-4 bg-[#eff4ff] p-3 rounded-xl border border-[#c8c4d5]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#3730a3] text-white flex items-center justify-center font-bold text-[18px] rounded-lg">
                      GAIL
                    </div>
                    <div>
                      <div className="text-[16px] text-[#1f108e] font-extrabold tracking-tight leading-none">
                        GAIL (INDIA) LIMITED
                      </div>
                      <div className="text-[10px] text-[#464553] uppercase tracking-wider font-semibold mt-1">
                        A Government of India Maharatna Undertaking
                      </div>
                      <div className="font-mono text-[10px] text-[#777584] mt-0.5">
                        Ref: GAIL/HVJ/PROJ/EXP/2024/908831 | Dated: 12-04-2024
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-block bg-[#1f108e] text-white font-mono text-[9px] px-2 py-0.5 rounded tracking-widest uppercase font-bold">
                      OFFICIAL COPY
                    </div>
                    <div className="font-mono text-[9px] text-[#777584] mt-1">Registry: Hazira Terminal</div>
                  </div>
                </div>

                {/* Certificate Title */}
                <div className="text-center my-4">
                  <h2 className="text-[18px] text-[#0d1c2e] font-extrabold uppercase tracking-wide underline underline-offset-4 decoration-[#1f108e]">
                    Satisfactory Execution Certificate
                  </h2>
                  <div className="font-mono text-[11px] text-[#464553] mt-1">
                    Form GFR-Rule 144 Annexure VII (Technical Track Record)
                  </div>
                </div>

                {/* Paragraphs */}
                <div className="flex flex-col gap-4 text-[#0d1c2e] text-[13px] leading-relaxed text-justify">
                  <p>
                    This is to certify that pursuant to Work Order Reference Number{' '}
                    <span className="font-mono bg-[#eff4ff] px-1 py-0.5 rounded text-[#0d1c2e] font-semibold border border-[#c8c4d5]">
                      WO-GAIL-PKG4-908831
                    </span>{' '}
                    awarded on 15th January 2020, the specialized turnkey package for high-pressure gas pipeline infrastructure has been executed and commissioned as per technical schedules.
                  </p>

                  {/* OCR HIGHLIGHT & BOUNDING BOX */}
                  <div className="relative bg-[#dce9ff]/70 rounded-xl p-3 border-2 border-[#4b41e1] shadow-xs">
                    {/* Bounding Box Annotation Tag */}
                    <div className="absolute -top-3 left-3 bg-[#3730a3] text-white font-mono text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs font-semibold">
                      <span className="material-symbols-outlined text-[12px]">crop_free</span>
                      <span>BOX: (x:120, y:450, w:280, h:65) • CONF: 97.42%</span>
                    </div>

                    {/* Discrepancy Flag Tag */}
                    <div className="absolute -right-2 -top-4 bg-[#ba1a1a] text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      <span>ENTITY NAME MISMATCH DETECTED</span>
                    </div>

                    <div className="pt-2 text-[#0d1c2e]">
                      This completion memorandum is hereby formally issued in favor of{' '}
                      <mark className="bg-[#ffdad6] text-[#ba1a1a] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-1 border border-[#ba1a1a]">
                        <span>M/s Apex Pipeline LLC</span>
                        <span className="material-symbols-outlined text-[13px]">warning</span>
                      </mark>{' '}
                      for the complete engineering, procurement, laying, testing, and pre-commissioning of the{' '}
                      <mark className="bg-[#d5e3fc] text-[#0d1c2e] font-semibold px-1 py-0.5 rounded">
                        GAIL 24-inch HVJ Trunkline Expansion Project (Sector 3B)
                      </mark>
                      , spanning a continuous length of 142.8 kilometers traversing Madhya Pradesh and Gujarat jurisdictions.
                    </div>

                    {/* Inline Comparison Box */}
                    <div className="mt-2.5 pt-2 bg-white p-2 rounded-lg border border-[#c8c4d5] flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-[#464553]">
                        <span className="material-symbols-outlined text-[14px] text-[#ba1a1a]">compare_arrows</span>
                        <span>Tender Bidder of Record: <strong className="text-[#0d1c2e]">Apex InfraTech Solutions Pvt Ltd</strong></span>
                      </div>
                      <div className="font-mono text-[#ba1a1a] font-bold">Levenstein Match: 68.1%</div>
                    </div>
                  </div>

                  <p>
                    The total period of active construction and commissioning under the engineering contract covered <strong>4.2 Continuous Years</strong> commencing from 20th January 2020 through commercial throughput acceptance on 31st March 2024. The operational performance metrics across all test segments met API 1104 standards.
                  </p>
                </div>
              </div>

              {/* Stamp & Officer Sign */}
              <div className="pt-6 mt-6 flex items-end justify-between border-t border-[#c8c4d5]">
                <div className="w-28 h-28 rounded-full bg-[#dce9ff]/60 border-2 border-dashed border-[#1f108e] flex flex-col items-center justify-center text-center p-2 transform -rotate-6">
                  <span className="material-symbols-outlined text-[#1f108e] text-[22px]">verified</span>
                  <span className="text-[8px] font-bold text-[#1f108e] leading-tight uppercase mt-0.5">
                    PROJECT ENGG CELL<br />GAIL (INDIA) LTD<br />HAZIRA
                  </span>
                  <span className="font-mono text-[8px] text-[#464553]">12 APR 2024</span>
                </div>

                <div className="text-right">
                  <div className="text-[11px] italic text-[#777584] font-serif select-none mb-1">
                    [Digital Sign Digest verified via NIC e-Sign]
                  </div>
                  <div className="text-[14px] text-[#0d1c2e] font-bold">Dr. S. K. Bhattacharya</div>
                  <div className="text-[11px] text-[#464553]">General Manager (Projects & Infrastructure)</div>
                  <div className="font-mono text-[10px] text-[#1f108e]">SAP Verified ID: GAIL-EMP-88201</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Viewport Status */}
          <div className="h-8 px-4 bg-white border-t border-[#c8c4d5] flex items-center justify-between font-mono text-[11px] text-[#777584]">
            <div className="flex items-center gap-3">
              <span>Target Clause: GeM Cl 4.1.2 (Pipeline Track Record)</span>
              <span className="opacity-30">|</span>
              <span>Bounding Boxes Found: 14</span>
            </div>
            <div className="flex items-center gap-1 text-[#1f108e]">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>Read-Only Judicial View (WORM Storage)</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (45% -> 4 of 10 cols): Rule Audit Engine */}
        <div className="lg:col-span-4 bg-white flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-4 bg-[#eff4ff] border-b border-[#c8c4d5]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1f108e] text-[20px]">smart_toy</span>
                <h1 className="text-[16px] text-[#3730a3] font-bold">Automated OCR & Rule Audit Engine</h1>
              </div>
              <span className="bg-[#d5e3fc] text-[#0d1c2e] font-mono text-[11px] px-2 py-0.5 rounded font-bold">
                Paddle v2.6 / GFR-144
              </span>
            </div>
            <p className="text-[12px] text-[#464553] mt-1 leading-snug">
              Extracted tokens mapped deterministically against Tender NIT MoPNG/GAIL/2026/TND-001 clause matrices.
            </p>
          </div>

          {/* Body Content */}
          <div className="p-4 flex flex-col gap-4 flex-1">
            {/* Token Matrix */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] uppercase tracking-wider text-[#777584] font-bold">
                  Document Token Mapping Matrix
                </div>
                <span className="font-mono text-[11px] text-[#464553]">4 Fields Processed</span>
              </div>
              <div className="bg-white rounded-xl border border-[#c8c4d5] overflow-hidden">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-[#eff4ff] text-[11px] text-[#0d1c2e] uppercase font-bold border-b border-[#c8c4d5]">
                    <tr>
                      <th className="px-3 py-2">Statutory Field</th>
                      <th className="px-3 py-2">Extracted Value</th>
                      <th className="px-3 py-2 text-right">Rule Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c8c4d5]">
                    <tr className="bg-[#ffdad6]/30">
                      <td className="px-3 py-2.5 align-top">
                        <div className="font-bold text-[#0d1c2e]">Issued Entity Name</div>
                        <div className="font-mono text-[10px] text-[#777584]">Target: Bidder Legal Name</div>
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <div className="font-mono font-bold text-[#ba1a1a]">Apex Pipeline LLC</div>
                        <div className="text-[10px] text-[#464553]">Reg: Apex InfraTech & Global</div>
                      </td>
                      <td className="px-3 py-2.5 align-top text-right">
                        <span className="inline-flex items-center gap-1 bg-[#ba1a1a] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[12px]">cancel</span>
                          MISMATCH (68%)
                        </span>
                        <div className="font-mono text-[10px] text-[#ba1a1a] font-bold mt-0.5">CRITICAL FLAG</div>
                      </td>
                    </tr>

                    <tr>
                      <td className="px-3 py-2.5 align-top">
                        <div className="font-semibold text-[#0d1c2e]">Project Scope</div>
                        <div className="font-mono text-[10px] text-[#777584]">Tender Cl 4.1 (Scope)</div>
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <div className="text-[#0d1c2e]">24-inch HVJ Trunkline (142.8 km)</div>
                        <div className="text-[10px] text-[#464553]">High-Pressure Hydrocarbon</div>
                      </td>
                      <td className="px-3 py-2.5 align-top text-right">
                        <span className="inline-flex items-center gap-1 bg-[#dce9ff] text-[#1f108e] px-2 py-0.5 rounded text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          COMPLIANT
                        </span>
                        <div className="font-mono text-[10px] text-[#1f108e] mt-0.5">Clause 4.1 Met</div>
                      </td>
                    </tr>

                    <tr>
                      <td className="px-3 py-2.5 align-top">
                        <div className="font-semibold text-[#0d1c2e]">Experience Duration</div>
                        <div className="font-mono text-[10px] text-[#777584]">Min Threshold: ≥ 4.0 Yrs</div>
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <div className="font-mono text-[#0d1c2e]">4.20 Continuous Years</div>
                        <div className="text-[10px] text-[#464553]">2020 to 2024 active</div>
                      </td>
                      <td className="px-3 py-2.5 align-top text-right">
                        <span className="inline-flex items-center gap-1 bg-[#dce9ff] text-[#1f108e] px-2 py-0.5 rounded text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          COMPLIANT
                        </span>
                        <div className="font-mono text-[10px] text-[#1f108e] mt-0.5">Δ +0.20 Yr Surplus</div>
                      </td>
                    </tr>

                    <tr>
                      <td className="px-3 py-2.5 align-top">
                        <div className="font-semibold text-[#0d1c2e]">Issuing Authority</div>
                        <div className="font-mono text-[10px] text-[#777584]">GAIL Internal Cross-Check</div>
                      </td>
                      <td className="px-3 py-2.5 align-top">
                        <div className="text-[#0d1c2e]">GM (Projects), GAIL Hazira</div>
                        <div className="font-mono text-[10px] text-[#464553]">Emp #88201 • WO #908831</div>
                      </td>
                      <td className="px-3 py-2.5 align-top text-right">
                        <span className="inline-flex items-center gap-1 bg-[#d5e3fc] text-[#0d1c2e] px-2 py-0.5 rounded text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[12px]">verified</span>
                          SAP RECORD FOUND
                        </span>
                        <div className="font-mono text-[10px] text-[#464553] mt-0.5">Authenticity Valid</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deterministic Rule Trace */}
            <div className="bg-[#eff4ff] p-4 rounded-xl border border-[#c8c4d5] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#1f108e] text-[14px] font-bold">
                  <span className="material-symbols-outlined text-[18px]">account_tree</span>
                  <span>Deterministic Rule Trace</span>
                </div>
                <span className="font-mono text-[10px] bg-[#3730a3] text-white px-2 py-0.5 rounded font-bold">
                  RULE-TECH-EXP-01
                </span>
              </div>
              <p className="text-[12px] text-[#464553]">
                Evaluation under General Financial Rules (GFR-2017) Rule 144(xi) and GeM General Terms Clause 4.1:
              </p>

              {/* Mathematical Formulation */}
              <div className="bg-white p-3 rounded-lg border border-[#c8c4d5] font-mono text-[12px] text-[#0d1c2e] space-y-1">
                <div className="text-[#777584] text-[10px]">// Mathematical Evaluation Formula</div>
                <div className="text-[#1f108e] font-bold">
                  Result = (Bidder_Entity == Cert_Entity) && (Exp_Years &gt;= 4.0)
                </div>
                <div className="text-[#464553] text-[10px] pt-1">// Parameter Substitution</div>
                <div>• (Apex InfraTech Solutions Pvt Ltd == Apex Pipeline LLC) → <span className="text-[#ba1a1a] font-bold">FALSE (0.681 &lt; 0.950)</span></div>
                <div>• (4.20 &gt;= 4.00) → <span className="text-[#1f108e] font-bold">TRUE</span></div>
                <div className="pt-1 font-bold text-[#ba1a1a]">• Compound Logic: FALSE && TRUE → EXECUTION FAILED</div>
              </div>

              {/* Ramification Notice */}
              <div className="p-3 bg-[#ffdad6] text-[#93000a] rounded-lg flex items-start gap-2 border border-[#ffdad6]">
                <span className="material-symbols-outlined text-[18px] text-[#ba1a1a] mt-0.5">report</span>
                <div className="text-[12px]">
                  <span className="font-bold">Statutory Legal Ramification:</span> The experience certificate was issued to a separate corporate entity (LLC vs Pvt Ltd). No registered Consortium / JV Deed or demerger scheme has been provided in Annexure IV. Tenderer is in breach of Clause 4.1 mandatory qualification.
                </div>
              </div>
            </div>

            {/* Officer Annotation Drawer */}
            {showAnnotationDrawer && (
              <div className="p-3 bg-[#e6eeff] border border-[#4b41e1] rounded-xl space-y-2">
                <div className="text-[12px] font-bold text-[#1f108e] flex items-center justify-between">
                  <span>Officer Statutory Annotation Note</span>
                  <span className="text-[10px] text-[#464553]">Sealed to Ledger</span>
                </div>
                <textarea
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  placeholder="Enter formal officer audit note regarding entity mismatch or technical clarification..."
                  className="w-full h-20 p-2 text-[12px] bg-white border border-[#c8c4d5] rounded-lg focus:outline-none focus:border-[#1f108e]"
                ></textarea>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      onShowToast('Annotation saved & sealed with Officer DSC.');
                      setShowAnnotationDrawer(false);
                    }}
                    className="px-3 py-1 bg-[#1f108e] text-white rounded text-[11px] font-bold"
                  >
                    Save Annotation
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Officer Action Drawer (Pinned Bottom) */}
          <div className="p-4 bg-[#eff4ff] border-t border-[#c8c4d5] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-[14px] text-[#1f108e] font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                <span>Procurement Officer Determination</span>
              </div>
              <span className="text-[11px] text-[#777584]">Log to Immutable Audit Ledger</span>
            </div>

            {/* Radio Options */}
            <div className="grid grid-cols-1 gap-1.5 text-[12px]">
              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#c8c4d5] cursor-pointer hover:bg-[#e6eeff] transition-colors">
                <input
                  type="radio"
                  name="officer_decision"
                  value="clarify"
                  checked={officerDecision === 'clarify'}
                  onChange={() => setOfficerDecision('clarify')}
                  className="text-[#1f108e]"
                />
                <span className="font-semibold text-[#0d1c2e]">
                  Issue Formal 48-Hour GeM Notice (Seek M&A / Succession Proof)
                </span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#c8c4d5] cursor-pointer hover:bg-[#e6eeff] transition-colors">
                <input
                  type="radio"
                  name="officer_decision"
                  value="reject"
                  checked={officerDecision === 'reject'}
                  onChange={() => setOfficerDecision('reject')}
                  className="text-[#ba1a1a]"
                />
                <span className="font-semibold text-[#ba1a1a]">
                  Confirm Immediate Disqualification under Clause 4.1
                </span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#c8c4d5] cursor-pointer hover:bg-[#e6eeff] transition-colors">
                <input
                  type="radio"
                  name="officer_decision"
                  value="overrule"
                  checked={officerDecision === 'overrule'}
                  onChange={() => setOfficerDecision('overrule')}
                  className="text-[#464553]"
                />
                <span className="text-[#0d1c2e]">
                  Overrule System Mismatch (Mandatory Written Justification Required)
                </span>
              </label>
            </div>

            {/* Action Execution Footer */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#c8c4d5]">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2 text-[16px] text-[#1f108e]">
                    pin
                  </span>
                  <input
                    type="password"
                    maxLength={6}
                    value={officerPin}
                    onChange={(e) => setOfficerPin(e.target.value)}
                    placeholder="DSC PIN"
                    className="h-9 w-32 pl-7 pr-2 font-mono text-[12px] bg-white border border-[#c8c4d5] rounded-lg focus:outline-none focus:border-[#1f108e]"
                  />
                </div>
                <span className="text-[11px] text-[#464553]">NIC Class 3 Token</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onShowToast('Officer determination draft saved.')}
                  className="h-9 px-3 bg-white text-[#1f108e] border border-[#c8c4d5] text-[12px] font-semibold rounded-lg hover:bg-[#eff4ff]"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleExecuteOfficerOrder}
                  className="h-9 px-4 bg-[#1f108e] text-white text-[12px] font-bold rounded-lg hover:bg-[#4b41e1] flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>Execute Statutory Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
