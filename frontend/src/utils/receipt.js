const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

export const formatINR = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const safeFileName = (value) =>
  String(value || 'yatrago-receipt')
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/-+/g, '-')
    .slice(0, 64);

const formatIssuedAt = (issuedAt) => {
  const date = issuedAt ? new Date(issuedAt) : new Date();
  const dateText = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeText = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return `${dateText} • ${timeText}`;
};

export function renderReceiptHtml(model) {
  const {
    reference = 'RC-000000',
    issuedAt,
    rideId = '—',
    route = {},
    vehicle = '—',
    driverName = '—',
    fare = 0,
    promo = 0,
    tip = 0,
    netTotal = 0,
    collected = 0,
    outstanding = 0,
    riders = [],
    focusRiderName = null
  } = model || {};

  const focused = focusRiderName
    ? riders.filter((rider) => rider.name === focusRiderName)
    : riders;

  const rows = focused
    .map((rider) => {
      const paid = rider.status === 'Paid';
      return `
        <tr>
          <td>
            <span class="name">${escapeHtml(rider.name)}</span>
            ${rider.percentage != null ? `<span class="muted">${escapeHtml(rider.percentage)}% share</span>` : ''}
          </td>
          <td class="amount">${escapeHtml(formatINR(rider.share))}</td>
          <td>
            <span class="badge ${paid ? 'paid' : 'due'}">${paid ? 'Paid' : 'Due'}</span>
            ${rider.method ? `<span class="muted">${escapeHtml(rider.method)}</span>` : ''}
            ${rider.txnId ? `<span class="muted mono">${escapeHtml(rider.txnId)}</span>` : ''}
          </td>
        </tr>`;
    })
    .join('');

  const isSettled = outstanding <= 0.009;
  const title = focusRiderName ? 'Rider Payment Receipt' : 'Fare Settlement Receipt';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>YatraGo • ${escapeHtml(title)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 32px 16px;
    background: #030712;
    color: #e2e8f0;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .sheet {
    max-width: 640px;
    margin: 0 auto;
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 24px;
    padding: 32px;
    box-shadow: 0 24px 60px rgba(2, 6, 23, 0.6);
  }
  .brand { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .wordmark {
    font-size: 22px; font-weight: 800; letter-spacing: -0.5px;
    background: linear-gradient(90deg, #22d3ee, #3b82f6);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .status {
    font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 999px;
    border: 1px solid ${isSettled ? 'rgba(16,185,129,.45)' : 'rgba(245,158,11,.45)'};
    background: ${isSettled ? 'rgba(16,185,129,.15)' : 'rgba(245,158,11,.15)'};
    color: ${isSettled ? '#34d399' : '#fbbf24'};
  }
  h1 { font-size: 18px; margin: 24px 0 4px; color: #fff; }
  .sub { margin: 0 0 24px; font-size: 12px; color: #94a3b8; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; margin-bottom: 24px; }
  .meta div { font-size: 12px; }
  .label {
    display: block; font-size: 9px; letter-spacing: .9px; text-transform: uppercase;
    color: #64748b; font-weight: 700; margin-bottom: 3px;
  }
  .value { color: #f1f5f9; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; }
  thead th {
    font-size: 9px; letter-spacing: .9px; text-transform: uppercase; color: #64748b;
    text-align: left; padding: 0 0 8px; border-bottom: 1px solid #1e293b;
  }
  thead th.amount { text-align: right; }
  tbody td { padding: 12px 0; border-bottom: 1px solid #16233a; font-size: 12px; vertical-align: top; }
  td.amount { text-align: right; font-variant-numeric: tabular-nums; font-weight: 800; color: #fff; white-space: nowrap; }
  .name { display: block; color: #fff; font-weight: 700; }
  .muted { display: block; color: #64748b; font-size: 10px; margin-top: 2px; }
  .mono { font-family: ui-monospace, Consolas, monospace; }
  .badge {
    font-size: 9px; font-weight: 800; padding: 3px 8px; border-radius: 999px;
    text-transform: uppercase; letter-spacing: .5px;
  }
  .badge.paid { background: rgba(16,185,129,.16); color: #34d399; border: 1px solid rgba(16,185,129,.4); }
  .badge.due { background: rgba(245,158,11,.16); color: #fbbf24; border: 1px solid rgba(245,158,11,.4); }
  .totals { margin-top: 24px; padding: 16px; border-radius: 16px; background: #0b1220; border: 1px solid #1e293b; }
  .line { display: flex; justify-content: space-between; font-size: 12px; padding: 5px 0; color: #cbd5e1; }
  .line.grand { border-top: 1px solid #1e293b; margin-top: 6px; padding-top: 12px; font-size: 15px; font-weight: 800; color: #fff; }
  .line.grand span:last-child { color: #22d3ee; }
  .line .pos { color: #34d399; }
  .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
  .chip { border-radius: 12px; padding: 10px 12px; background: #0b1220; border: 1px solid #1e293b; }
  .chip b { display: block; font-size: 15px; color: #fff; margin-top: 2px; }
  footer { margin-top: 24px; font-size: 10px; color: #64748b; line-height: 1.7; }
  .rule { height: 1px; background: linear-gradient(90deg, transparent, #1e293b, transparent); margin: 20px 0; }
  @media print {
    body { background: #fff; color: #0f172a; padding: 0; }
    .sheet { box-shadow: none; border-color: #e2e8f0; background: #fff; }
    .wordmark { color: #0284c7; background: none; -webkit-text-fill-color: #0284c7; }
    h1, .value, .name, .line.grand, .chip b { color: #0f172a; }
    .line.grand span:last-child { color: #0284c7; }
    .totals, .chip { background: #f8fafc; border-color: #e2e8f0; }
    tbody td, thead th { border-color: #e2e8f0; }
    .sub, .muted, footer, .label { color: #64748b; }
  }
</style>
</head>
<body>
  <div class="sheet">
    <div class="brand">
      <span class="wordmark">YatraGo</span>
      <span class="status">${isSettled ? 'Fully Settled' : 'Partially Settled'}</span>
    </div>

    <h1>${escapeHtml(title)}</h1>
    <p class="sub">Digitally generated settlement record • ${escapeHtml(formatIssuedAt(issuedAt))}</p>

    <div class="meta">
      <div><span class="label">Receipt No.</span><span class="value mono">${escapeHtml(reference)}</span></div>
      <div><span class="label">Ride ID</span><span class="value mono">${escapeHtml(rideId)}</span></div>
      <div><span class="label">Pickup</span><span class="value">${escapeHtml(route.from || '—')}</span></div>
      <div><span class="label">Drop-off</span><span class="value">${escapeHtml(route.to || '—')}</span></div>
      <div><span class="label">Vehicle</span><span class="value">${escapeHtml(vehicle)}</span></div>
      <div><span class="label">Driver</span><span class="value">${escapeHtml(driverName)}</span></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Passenger</th>
          <th class="amount">Share</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="3" class="muted">No passengers recorded.</td></tr>'}</tbody>
    </table>

    <div class="totals">
      <div class="line"><span>Ride fare</span><span>${escapeHtml(formatINR(fare))}</span></div>
      ${promo > 0 ? `<div class="line"><span>Promo discount</span><span class="pos">−${escapeHtml(formatINR(promo))}</span></div>` : ''}
      ${tip > 0 ? `<div class="line"><span>Driver tip</span><span>+${escapeHtml(formatINR(tip))}</span></div>` : ''}
      <div class="line grand"><span>Net payable</span><span>${escapeHtml(formatINR(netTotal))}</span></div>
    </div>

    <div class="summary">
      <div class="chip"><span class="label">Collected</span><b>${escapeHtml(formatINR(collected))}</b></div>
      <div class="chip"><span class="label">Outstanding</span><b>${escapeHtml(formatINR(outstanding))}</b></div>
    </div>

    <div class="rule"></div>
    <footer>
      This receipt is generated automatically by the YatraGo fare-splitting ledger.
      Amounts are recorded in INR (₹). Retain this document for your records.
    </footer>
  </div>
</body>
</html>`;
}

export function receiptTextSummary(model) {
  const {
    reference = 'RC-000000',
    netTotal = 0,
    collected = 0,
    outstanding = 0,
    route = {},
    riders = []
  } = model || {};

  const lines = [
    'YatraGo — Fare Settlement Receipt',
    `Receipt: ${reference}`,
    `Route: ${route.from || '—'} → ${route.to || '—'}`,
    `Net payable: ${formatINR(netTotal)}`,
    `Collected: ${formatINR(collected)}`,
    `Outstanding: ${formatINR(outstanding)}`,
    '',
    'Passengers:'
  ];

  riders.forEach((rider) => {
    lines.push(`• ${rider.name} — ${formatINR(rider.share)} (${rider.status})`);
  });

  return lines.join('\n');
}

export function downloadReceipt(model) {
  const html = renderReceiptHtml(model);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${safeFileName(`yatrago-receipt-${model?.reference || ''}`)}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function printReceipt(model) {
  const html = renderReceiptHtml(model);
  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.right = '0';
  frame.style.bottom = '0';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  frame.setAttribute('title', 'YatraGo receipt');
  document.body.appendChild(frame);

  frame.onload = () => {
    try {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    } catch (error) {
      console.warn('Receipt print failed:', error);
    }
  };

  frame.srcdoc = html;

  setTimeout(() => {
    if (frame.parentNode) frame.parentNode.removeChild(frame);
  }, 60000);
}

export async function shareReceipt(model) {
  const html = renderReceiptHtml(model);
  const summary = receiptTextSummary(model);
  const fileName = `${safeFileName(`yatrago-receipt-${model?.reference || ''}`)}.html`;

  try {
    if (typeof navigator !== 'undefined' && navigator.canShare && typeof window !== 'undefined') {
      const file = new File([html], fileName, { type: 'text/html' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'YatraGo Fare Settlement Receipt',
          text: `Settlement ${model?.reference || ''}`,
          files: [file]
        });
        return { ok: true, message: 'Receipt shared.' };
      }

      if (navigator.share) {
        await navigator.share({ title: 'YatraGo Fare Settlement Receipt', text: summary });
        return { ok: true, message: 'Receipt shared.' };
      }
    }

    await navigator.clipboard.writeText(summary);
    return { ok: true, message: 'Receipt summary copied to clipboard.' };
  } catch (error) {
    if (error?.name === 'AbortError') return { ok: false, message: 'Share cancelled.' };
    try {
      await navigator.clipboard.writeText(summary);
      return { ok: true, message: 'Receipt summary copied to clipboard.' };
    } catch (clipboardError) {
      return { ok: false, message: 'Sharing is not available on this device.' };
    }
  }
}
