// ============================================================
//  TMBCorp Pre-Approval System — JavaScript
// ============================================================

const ADMIN_EMAIL = 'jennyrosedoreza1709@gmail.com';
const ADMIN_PASS  = '110907';

let submissions = JSON.parse(localStorage.getItem('tmb_submissions') || '[]');

// ------------------------------------------------------------
// TOAST NOTIFICATION
// ------------------------------------------------------------
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ------------------------------------------------------------
// SCREEN NAVIGATION
// ------------------------------------------------------------
function goScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id + '-screen') || document.getElementById(id);
  if (target) target.classList.add('active');
  // welcome has no "-screen" suffix
  if (id === 'welcome') document.getElementById('welcome').classList.add('active');
}

function startClientForm() {
  goScreen('form');
  goPage(1);
}

// ------------------------------------------------------------
// ADMIN LOGIN
// ------------------------------------------------------------
function adminLogin() {
  const email = document.getElementById('admin-email').value.trim();
  const pass  = document.getElementById('admin-pass').value;
  if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
    renderAdmin();
    goScreen('admin');
  } else {
    showToast('Invalid credentials. Please try again.');
  }
}

// ------------------------------------------------------------
// MULTI-STEP FORM NAVIGATION
// ------------------------------------------------------------
function goPage(n) {
  for (let i = 1; i <= 5; i++) {
    document.getElementById('page-' + i).style.display = (i === n) ? '' : 'none';
    const dot = document.getElementById('dot-' + i);
    dot.className = 'step-dot' +
      (i < n ? ' done' : i === n ? ' active' : '');
  }

  const labels = [
    'Unit Information',
    'Borrower Personal Info',
    'Borrower Employment & Financial',
    'Co-Borrower Personal Info',
    'Co-Borrower Employment & Financial'
  ];
  document.getElementById('step-label').textContent =
    `Step ${n} of 5 — ${labels[n - 1]}`;

  window.scrollTo(0, 0);
}

function goNext(n) {
  goPage(n + 1);
}

// ------------------------------------------------------------
// FORM DATA COLLECTION
// ------------------------------------------------------------
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function collectData() {
  return {
    ts: new Date().toISOString(),
    unit: {
      unit:  getVal('f_unit'),
      color: getVal('f_color'),
      year:  getVal('f_year'),
      dp:    getVal('f_dp'),
      term:  getVal('f_term')
    },
    borrower: {
      last:    getVal('b_last'),
      first:   getVal('b_first'),
      mid:     getVal('b_mid'),
      age:     getVal('b_age'),
      bday:    getVal('b_bday'),
      status:  getVal('b_status'),
      address: getVal('b_address'),
      los:     getVal('b_los'),
      own:     getVal('b_own'),
      land:    getVal('b_land'),
      mobile:  getVal('b_mobile'),
      citizen: getVal('b_citizen'),
      dep:     getVal('b_dep'),
      pob:     getVal('b_pob'),
      mom:     getVal('b_mom'),
      tin:     getVal('b_tin'),
      sss:     getVal('b_sss'),
      email:   getVal('b_email')
    },
    borrowerEmp: {
      company:  getVal('be_company'),
      offaddr:  getVal('be_offaddr'),
      pos:      getVal('be_pos'),
      offnum:   getVal('be_offnum'),
      los:      getVal('be_los'),
      industry: getVal('be_industry'),
      prev:     getVal('be_prev'),
      income:   getVal('be_income'),
      other:    getVal('be_other'),
      bank:     getVal('be_bank'),
      accttype: getVal('be_accttype'),
      acctnum:  getVal('be_acctnum'),
      branch:   getVal('be_branch'),
      call:     getVal('be_call')
    },
    coborrower: {
      last:    getVal('c_last'),
      first:   getVal('c_first'),
      mid:     getVal('c_mid'),
      age:     getVal('c_age'),
      bday:    getVal('c_bday'),
      status:  getVal('c_status'),
      address: getVal('c_address'),
      los:     getVal('c_los'),
      own:     getVal('c_own'),
      land:    getVal('c_land'),
      mobile:  getVal('c_mobile'),
      citizen: getVal('c_citizen'),
      dep:     getVal('c_dep'),
      pob:     getVal('c_pob'),
      mom:     getVal('c_mom'),
      tin:     getVal('c_tin'),
      sss:     getVal('c_sss'),
      email:   getVal('c_email')
    },
    coborrowerEmp: {
      company:  getVal('ce_company'),
      offaddr:  getVal('ce_offaddr'),
      pos:      getVal('ce_pos'),
      offnum:   getVal('ce_offnum'),
      los:      getVal('ce_los'),
      industry: getVal('ce_industry'),
      prev:     getVal('ce_prev'),
      income:   getVal('ce_income'),
      other:    getVal('ce_other'),
      bank:     getVal('ce_bank'),
      accttype: getVal('ce_accttype'),
      acctnum:  getVal('ce_acctnum'),
      branch:   getVal('ce_branch')
    }
  };
}

// ------------------------------------------------------------
// DATE / TIME HELPERS
// ------------------------------------------------------------
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  let h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

function nowStamp(iso) {
  return `Date: ${formatDate(iso)} | Time: ${formatTime(iso)}`;
}

// ------------------------------------------------------------
// PRINTABLE DOCUMENT BUILDER
// ------------------------------------------------------------
function infoRow(label, val) {
  return `
    <div class="info-row">
      <div class="info-label">${label}</div>
      <div class="info-val">${val || '—'}</div>
    </div>`;
}

function buildDoc(data) {
  const ts = data.ts;
  const b  = data.borrower;
  const be = data.borrowerEmp;
  const c  = data.coborrower;
  const ce = data.coborrowerEmp;
  const u  = data.unit;

  const bName = [b.first, b.mid, b.last].filter(Boolean).join(' ') || '—';

  return `
    <div class="print-header">
      <div class="print-logo-area">
        <div class="print-brand">
          <h1>Toyota Manila Bay</h1>
        </div>
      </div>
      <div class="print-title">
        <h2>PRE-APPROVAL APPLICATION</h2>
        <p>${nowStamp(ts)}</p>
        <p>Ref: TMB-${ts.replace(/[^0-9]/g, '').slice(2, 12)}</p>
      </div>
    </div>

    <div class="print-meta">
      <div class="print-meta-item"><strong>Applicant:</strong> ${bName}</div>
      <div class="print-meta-item"><strong>Unit:</strong> ${u.unit || '—'} (${u.year || '—'})</div>
      <div class="print-meta-item"><strong>Color:</strong> ${u.color || '—'}</div>
      <div class="print-meta-item"><strong>DP:</strong> ${u.dp || '—'}</div>
      <div class="print-meta-item"><strong>Term:</strong> ${u.term || '—'}</div>
    </div>

    <div class="section-title">A — Borrower Personal Information</div>
    <div class="info-grid">
      ${infoRow('Last Name', b.last)}
      ${infoRow('First Name', b.first)}
      ${infoRow('Middle Name', b.mid)}
      ${infoRow('Age', b.age)}
      ${infoRow('Birthdate', b.bday)}
      ${infoRow('Civil Status', b.status)}
      ${infoRow('Citizenship', b.citizen)}
      ${infoRow('No. of Dependents', b.dep)}
      ${infoRow('Place of Birth', b.pob)}
      ${infoRow('TIN', b.tin)}
      ${infoRow('SSS / GSIS No.', b.sss)}
      ${infoRow('Mobile No.', b.mobile)}
      ${infoRow('Landline', b.land)}
      ${infoRow('Email Address', b.email)}
    </div>
    <div class="info-grid" style="margin-bottom:1.2rem">
      ${infoRow('Home Address', b.address)}
      ${infoRow('Length of Stay', b.los)}
      ${infoRow('Ownership', b.own)}
      ${infoRow("Mother's Maiden Name", b.mom)}
    </div>

    <div class="section-title">B — Borrower Employment & Financial Information</div>
    <div class="info-grid">
      ${infoRow('Company Name', be.company)}
      ${infoRow('Office Address', be.offaddr)}
      ${infoRow('Position', be.pos)}
      ${infoRow('Office Number', be.offnum)}
      ${infoRow('Length of Service', be.los)}
      ${infoRow('Nature of Industry', be.industry)}
      ${infoRow('Previous Employer', be.prev)}
      ${infoRow('Monthly Income', be.income ? '₱' + Number(be.income).toLocaleString() : '')}
      ${infoRow('Other Income Sources', be.other)}
      ${infoRow('Bank', be.bank)}
      ${infoRow('Account Type', be.accttype)}
      ${infoRow('Account Number', be.acctnum)}
      ${infoRow('Branch', be.branch)}
      ${infoRow('Best Time to Call', be.call)}
    </div>

    <div class="section-title">C — Co-Borrower Personal Information</div>
    <div class="info-grid">
      ${infoRow('Last Name', c.last)}
      ${infoRow('First Name', c.first)}
      ${infoRow('Middle Name', c.mid)}
      ${infoRow('Age', c.age)}
      ${infoRow('Birthdate', c.bday)}
      ${infoRow('Civil Status', c.status)}
      ${infoRow('Citizenship', c.citizen)}
      ${infoRow('No. of Dependents', c.dep)}
      ${infoRow('Place of Birth', c.pob)}
      ${infoRow('TIN', c.tin)}
      ${infoRow('SSS / GSIS No.', c.sss)}
      ${infoRow('Mobile No.', c.mobile)}
      ${infoRow('Landline', c.land)}
      ${infoRow('Email Address', c.email)}
    </div>
    <div class="info-grid" style="margin-bottom:1.2rem">
      ${infoRow('Home Address', c.address)}
      ${infoRow('Length of Stay', c.los)}
      ${infoRow('Ownership', c.own)}
      ${infoRow("Mother's Maiden Name", c.mom)}
    </div>

    <div class="section-title">D — Co-Borrower Employment & Financial Information</div>
    <div class="info-grid">
      ${infoRow('Company Name', ce.company)}
      ${infoRow('Office Address', ce.offaddr)}
      ${infoRow('Position', ce.pos)}
      ${infoRow('Office Number', ce.offnum)}
      ${infoRow('Length of Service', ce.los)}
      ${infoRow('Nature of Industry', ce.industry)}
      ${infoRow('Previous Employer', ce.prev)}
      ${infoRow('Monthly Income', ce.income ? '₱' + Number(ce.income).toLocaleString() : '')}
      ${infoRow('Other Income Sources', ce.other)}
      ${infoRow('Bank', ce.bank)}
      ${infoRow('Account Type', ce.accttype)}
      ${infoRow('Account Number', ce.acctnum)}
      ${infoRow('Branch', ce.branch)}
    </div>

    <div class="sig-row">
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-label">Borrower's Signature over Printed Name</div>
        <div class="sig-label" style="margin-top:0.3rem;color:#CC0000;">${nowStamp(ts)}</div>
      </div>
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-label">Co-Borrower's Signature over Printed Name</div>
        <div class="sig-label" style="margin-top:0.3rem;color:#CC0000;">${nowStamp(ts)}</div>
      </div>
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-label">Sales Agent's Signature</div>
        <div class="sig-label" style="margin-top:0.3rem;color:#CC0000;">${nowStamp(ts)}</div>
      </div>
    </div>

    <div class="print-footer">
      <p>Toyota Manila Bay | This document is confidential and for authorized use only.</p>
      <div class="timestamp-area">
        <span>Generated by TMB Online Pre-Approval System</span>
        <span style="color:#CC0000;font-weight:700;">${nowStamp(ts)}</span>
      </div>
    </div>
  `;
}

// ------------------------------------------------------------
// FORM SUBMISSION
// ------------------------------------------------------------
function submitForm() {
  const data = collectData();
  submissions.push(data);
  localStorage.setItem('tmb_submissions', JSON.stringify(submissions));
  document.getElementById('printable-doc').innerHTML = buildDoc(data);
  goScreen('output');
  showToast('Application submitted successfully!');
}

// ------------------------------------------------------------
// PRINT / PDF
// ------------------------------------------------------------
function printDoc() {
  window.print();
}

function savePDF() {
  showToast('Preparing PDF...');
  setTimeout(() => { window.print(); }, 300);
}

// ------------------------------------------------------------
// ADMIN DASHBOARD
// ------------------------------------------------------------
function renderAdmin() {
  const body = document.getElementById('admin-body');

  if (!submissions.length) {
    body.innerHTML = '<div class="empty-state">No submissions yet. Client forms will appear here.</div>';
    return;
  }

  body.innerHTML = submissions.map((s, i) => {
    const b       = s.borrower;
    const name    = [b.first, b.last].filter(Boolean).join(' ') || 'Unknown Applicant';
    const unit    = s.unit.unit || 'No unit specified';
    const dateStr = formatDate(s.ts) + ' ' + formatTime(s.ts);

    return `
      <div class="admin-card">
        <div class="admin-card-info">
          <h4>${name} <span class="badge">Submitted</span></h4>
          <p>${unit} | ${s.unit.dp || '—'} DP | ${s.unit.term || '—'} | Submitted: ${dateStr}</p>
          <p style="font-size:0.78rem;color:#aaa;">
            Ref: TMB-${s.ts.replace(/[^0-9]/g, '').slice(2, 12)}
          </p>
        </div>
        <div class="admin-card-actions">
          <button class="btn-view" onclick="viewSubmission(${i})">View / Print</button>
        </div>
      </div>`;
  }).join('');
}

function viewSubmission(i) {
  const data = submissions[i];
  document.getElementById('printable-doc').innerHTML = buildDoc(data);
  goScreen('output');
}
