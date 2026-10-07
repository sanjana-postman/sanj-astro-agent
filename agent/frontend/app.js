const state = {
  threadId: null,
  selectedCaseId: null,
  statusFilter: '',
  messages: [],
};

const els = {
  caseList: document.getElementById('caseList'),
  filterPills: document.getElementById('filterPills'),
  messageList: document.getElementById('messageList'),
  composerInput: document.getElementById('composerInput'),
  sendBtn: document.getElementById('sendBtn'),
  caseFileEmpty: document.getElementById('caseFileEmpty'),
  caseFileDetail: document.getElementById('caseFileDetail'),
  sessionIndicator: document.getElementById('sessionIndicator'),
  newSessionBtn: document.getElementById('newSessionBtn'),
};

function initSession() {
  let threadId = localStorage.getItem('pa-thread-id');
  if (!threadId) {
    threadId = crypto.randomUUID();
    localStorage.setItem('pa-thread-id', threadId);
  }
  state.threadId = threadId;
  state.selectedCaseId = localStorage.getItem('pa-selected-case') || null;
  els.sessionIndicator.textContent = `Reviewer session: ${threadId.slice(0, 8)}`;
}

function statusBadge(status) {
  return `<span class="status-badge ${status}">${status}</span>`;
}

async function loadCases() {
  const qs = state.statusFilter ? `?status=${state.statusFilter}` : '';
  const res = await fetch(`/api/cases${qs}`);
  const data = await res.json();
  renderCaseList(data.cases || []);
}

function renderCaseList(cases) {
  els.caseList.innerHTML = '';
  for (const c of cases) {
    const row = document.createElement('div');
    row.className = 'case-row' + (c.referenceId === state.selectedCaseId ? ' selected' : '');
    row.innerHTML = `
      <div class="case-row-top">
        <span class="case-row-ref">${c.referenceId}</span>
        ${statusBadge(c.status)}
      </div>
      <div class="case-row-drug">${c.drug}</div>
      <div class="case-row-patient">${c.patientIdMasked}</div>
    `;
    row.addEventListener('click', () => selectCase(c.referenceId));
    els.caseList.appendChild(row);
  }
}

function selectCase(referenceId) {
  state.selectedCaseId = referenceId;
  localStorage.setItem('pa-selected-case', referenceId);
  loadCases();
  loadCaseDetail(referenceId);
  submitMessage(`Let's review case ${referenceId}.`);
}

async function loadCaseDetail(referenceId) {
  if (!referenceId) {
    els.caseFileEmpty.hidden = false;
    els.caseFileDetail.hidden = true;
    return;
  }
  const res = await fetch(`/api/cases/${referenceId}`);
  if (!res.ok) {
    els.caseFileEmpty.hidden = false;
    els.caseFileDetail.hidden = true;
    return;
  }
  const c = await res.json();
  renderCaseDetail(c);
}

function renderCaseDetail(c) {
  els.caseFileEmpty.hidden = true;
  els.caseFileDetail.hidden = false;

  const proposed = c.proposedDetermination
    ? `<div class="cf-row"><span class="cf-label">Decision:</span> ${c.proposedDetermination.decision}</div>
       <div class="cf-row">${c.proposedDetermination.rationale}</div>`
    : `<div class="cf-row">No proposal yet.</div>`;

  const final = c.finalDetermination
    ? `<div class="cf-row"><span class="cf-label">Decision:</span> ${c.finalDetermination.decision}</div>
       <div class="cf-row">${c.finalDetermination.rationale}</div>`
    : `<div class="cf-row">Not yet finalized.</div>`;

  const notified = c.patientNotifiedAt
    ? `<div class="cf-row">Patient notified at ${c.patientNotifiedAt}</div>`
    : '';

  els.caseFileDetail.innerHTML = `
    <div class="cf-header">
      ${statusBadge(c.status)}
      <span class="cf-ref">${c.referenceId}</span>
    </div>

    <div class="cf-section">
      <h3>Patient</h3>
      <div class="cf-row"><span class="cf-label">Patient ID:</span> ${c.patientIdMasked}</div>
      <div class="cf-row"><span class="cf-label">Date of birth:</span> ${c.patientDateOfBirthMasked}</div>
    </div>

    <div class="cf-section">
      <h3>Medication</h3>
      <div class="cf-row"><span class="cf-label">Drug:</span> ${c.drug}</div>
      <div class="cf-row"><span class="cf-label">Dosage:</span> ${c.dosage}</div>
      <div class="cf-row"><span class="cf-label">Quantity:</span> ${c.quantity}</div>
      <div class="cf-row"><span class="cf-label">Days supply:</span> ${c.daysSupply}</div>
      <div class="cf-row"><span class="cf-label">Diagnosis code:</span> ${c.diagnosisCode}</div>
      <div class="cf-row"><span class="cf-label">Prior therapies tried:</span> ${c.priorTherapiesTried}</div>
    </div>

    <div class="cf-section">
      <h3>Prescriber</h3>
      <div class="cf-row"><span class="cf-label">Name:</span> ${c.prescriberName}</div>
      <div class="cf-row"><span class="cf-label">NPI:</span> ${c.prescriberNpi}</div>
      <div class="cf-row"><span class="cf-label">Contact:</span> ${c.prescriberContact}</div>
      <div class="cf-row"><span class="cf-label">Pharmacy/Facility:</span> ${c.pharmacyOrFacility}</div>
    </div>

    <div class="cf-section">
      <h3>Agent-Proposed Determination</h3>
      ${proposed}
    </div>

    <div class="cf-section">
      <h3>Final Determination</h3>
      ${final}
      ${notified}
    </div>

    <div class="cf-footer">
      Patient identifiers are masked. Closing a case always requires the reviewer's explicit final decision.
    </div>
  `;
}

function renderMessages() {
  els.messageList.innerHTML = '';
  for (const m of state.messages) {
    const bubble = document.createElement('div');
    bubble.className = `message-bubble message-${m.role}`;
    bubble.textContent = m.text;
    els.messageList.appendChild(bubble);
  }
  els.messageList.scrollTop = els.messageList.scrollHeight;
}

async function submitMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  state.messages.push({ role: 'user', text: trimmed });
  const pendingMsg = { role: 'assistant', text: 'Thinking…' };
  state.messages.push(pendingMsg);
  renderMessages();

  els.sendBtn.disabled = true;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: trimmed, threadId: state.threadId }),
    });

    if (!res.ok) {
      state.messages = state.messages.filter((m) => m !== pendingMsg);
      const body = await res.json().catch(() => ({ error: 'Request failed.' }));
      state.messages.push({ role: 'error', text: body.error || 'Request failed.' });
      renderMessages();
      return;
    }

    pendingMsg.text = '';
    let gotAnyText = false;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        gotAnyText = true;
        pendingMsg.text += chunk;
        renderMessages();
      }
    }

    if (!gotAnyText) {
      throw new Error('No response received from the assistant.');
    }
  } catch (err) {
    state.messages = state.messages.filter((m) => m !== pendingMsg);
    state.messages.push({ role: 'error', text: err.message || 'Something went wrong.' });
    renderMessages();
  } finally {
    els.sendBtn.disabled = false;
    if (state.selectedCaseId) {
      loadCaseDetail(state.selectedCaseId);
    }
  }
}

function newSession() {
  localStorage.removeItem('pa-thread-id');
  localStorage.removeItem('pa-selected-case');
  state.messages = [];
  initSession();
  state.selectedCaseId = null;
  renderMessages();
  loadCaseDetail(null);
  loadCases();
}

els.filterPills.addEventListener('click', (e) => {
  const btn = e.target.closest('.pill');
  if (!btn) return;
  state.statusFilter = btn.dataset.status;
  for (const p of els.filterPills.querySelectorAll('.pill')) {
    p.classList.toggle('active', p === btn);
  }
  loadCases();
});

els.sendBtn.addEventListener('click', () => {
  const text = els.composerInput.value;
  els.composerInput.value = '';
  submitMessage(text);
});

els.composerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    els.sendBtn.click();
  }
});

els.newSessionBtn.addEventListener('click', newSession);

initSession();
renderMessages();
loadCases();
loadCaseDetail(state.selectedCaseId);
