const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export async function fetchDashboardStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats/`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return await res.json();
  } catch (err) {
    console.warn('Backend connection fallback for dashboard stats', err);
    return null;
  }
}

export async function fetchTenders() {
  const res = await fetch(`${API_BASE_URL}/tenders/`);
  if (!res.ok) throw new Error('Failed to fetch tenders');
  return await res.json();
}

export async function fetchTenderDetail(id: string) {
  const res = await fetch(`${API_BASE_URL}/tenders/${id}/`);
  if (!res.ok) throw new Error('Failed to fetch tender details');
  return await res.json();
}

export async function extractTenderRequirements(tenderId: string) {
  const res = await fetch(`${API_BASE_URL}/tenders/${tenderId}/extract-requirements/`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to extract requirements');
  return await res.json();
}

export async function fetchBids() {
  const res = await fetch(`${API_BASE_URL}/bids/`);
  if (!res.ok) throw new Error('Failed to fetch bids');
  return await res.json();
}

export async function fetchBidDetail(id: string) {
  const res = await fetch(`${API_BASE_URL}/bids/${id}/`);
  if (!res.ok) throw new Error('Failed to fetch bid detail');
  return await res.json();
}

export async function uploadDocument(bidId: string, file: File, docType: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bid_id', bidId);
  formData.append('document_type', docType);

  const res = await fetch(`${API_BASE_URL}/documents/upload/`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload document');
  return await res.json();
}

export async function triggerVerification(bidId: string) {
  const res = await fetch(`${API_BASE_URL}/verification/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bid_id: bidId })
  });
  if (!res.ok) throw new Error('Failed to trigger verification');
  return await res.json();
}

export async function evaluateCompliance(bidId: string) {
  const res = await fetch(`${API_BASE_URL}/compliance/evaluate/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bid_id: bidId })
  });
  if (!res.ok) throw new Error('Failed to evaluate compliance');
  return await res.json();
}

export async function calculateRisk(bidId: string) {
  const res = await fetch(`${API_BASE_URL}/risk/calculate/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bid_id: bidId })
  });
  if (!res.ok) throw new Error('Failed to calculate risk');
  return await res.json();
}

export async function generateRecommendation(bidId: string) {
  const res = await fetch(`${API_BASE_URL}/bids/${bidId}/recommendation/`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to generate recommendation');
  return await res.json();
}

export async function recordDecision(bidId: string, decision: string, reason: string, dscPin?: string) {
  const res = await fetch(`${API_BASE_URL}/bids/${bidId}/decision/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision, reason, dsc_pin: dscPin })
  });
  if (!res.ok) throw new Error('Failed to record decision');
  return await res.json();
}

export async function fetchAuditLogs(bidId?: string) {
  const url = bidId ? `${API_BASE_URL}/bids/${bidId}/audit/` : `${API_BASE_URL}/bids/default/audit/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return await res.json();
}
