// ============================================================
//  TMB Pre-Approval System — script.js
//  Uses Firebase Firestore (compat SDK) so all data is stored
//  in the cloud — visible from ANY device, any browser.
//
//  HOW TO SET UP FIREBASE (free, one-time, ~5 minutes):
//  1. Go to https://console.firebase.google.com
//  2. Click "Add project" → name it → Continue
//  3. Click the </> Web icon → register app → copy the config
//  4. Paste your values into the FIREBASE CONFIG section below
//  5. In Firebase Console → Firestore Database → Create database
//     → Start in test mode → Done
// ============================================================

// ============================================================
//  FIREBASE CONFIG — replace ALL values with yours
// ============================================================
var firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var submissionsCol = db.collection('tmb_submissions');

// ============================================================
//  ADMIN CREDENTIALS
// ============================================================
var ADMIN_EMAIL = 'jennyrosedoreza1709@gmail.com';
var ADMIN_PASS  = '110907';

// In-memory cache for the admin view (populated fresh from Firestore each login)
var cachedSubmissions = [];

// ============================================================
//  TOAST
// ============================================================
function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2500);
}

// ============================================================
//  SCREEN NAVIGATION
// ============================================================
function goScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active');
  });
  // Screens have id like "welcome", "form-screen", "output-screen", "admin-screen"
  var target = document.getElementById(id + '-screen') || document.getElementById(id);
  if (target) target.classList.add('active');
  // 'welcome' has no -screen suffix
  if (id === 'welcome') {
    document.getElementById('welcome').classList.add('active');
  }
  window.scrollTo(0, 0);
}

function startClientForm() {
  goScreen('form');
  goPage(1);
}

// ============================================================
//  ADMIN LOGIN
// ============================================================
function adminLogin() {
  var email = document.getElementById('admin-email').value.trim();
  var pass  = document.getElementById('admin-pass').value;
  if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
    renderAdmin();
    goScreen('admin');
  } else {
    showToast('Invalid credentials. Please try again.');
  }
}

// ============================================================
//  VALIDATION — required fields per page
// ============================================================
var PAGE_FIELDS = {
  1: [
    { id: 'f_unit',  label: 'Unit / Model' },
    { id: 'f_color', label: 'Color' },
    { id: 'f_year',  label: 'Year Model' },
    { id: 'f_dp',    label: 'Downpayment' },
    { id: 'f_term',  label: 'Preferred Term' }
  ],
  2: [
    { id: 'b_last',    label: 'Last Name' },
    { id: 'b_first',   label: 'First Name' },
    { id: 'b_mid',     label: 'Middle Name' },
    { id: 'b_age',     label: 'Age' },
    { id: 'b_bday',    label: 'Birthdate' },
    { id: 'b_status',  label: 'Civil Status' },
    { id: 'b_address', label: 'Address' },
    { id: 'b_los',     label: 'Length of Stay' },
    { id: 'b_own',     label: 'Ownership' },
    { id: 'b_mobile',  label: 'Mobile No.' },
    { id: 'b_citizen', label: 'Citizenship' },
    { id: 'b_dep',     label: 'No. of Dependents' },
    { id: 'b_pob',     label: 'Place of Birth' },
    { id: 'b_mom',     label: "Mother's Full Maiden Name" },
    { id: 'b_tin',     label: 'TIN' },
    { id: 'b_sss',     label: 'SSS / GSIS No.' },
    { id: 'b_email',   label: 'Email Address' }
  ],
  3: [
    { id: 'be_company',  label: 'Name of Company' },
    { id: 'be_offaddr',  label: 'Office Address' },
    { id: 'be_pos',      label: 'Position' },
    { id: 'be_offnum',   label: 'Office Number' },
    { id: 'be_los',      label: 'Length of Service' },
    { id: 'be_industry', label: 'Nature of Industry' },
    { id: 'be_income',   label: 'Monthly Income' },
    { id: 'be_bank',     label: 'Bank' },
    { id: 'be_accttype', label: 'Account Type' },
    { id: 'be_acctnum',  label: 'Account Number' },
    { id: 'be_branch',   label: 'Branch' },
    { id: 'be_call',     label: 'Best Time to Call' }
  ],
  4: [
    { id: 'c_last',    label: 'Last Name' },
    { id: 'c_first',   label: 'First Name' },
    { id: 'c_mid',     label: 'Middle Name' },
    { id: 'c_age',     label: 'Age' },
    { id: 'c_bday',    label: 'Birthdate' },
    { id: 'c_status',  label: 'Civil Status' },
    { id: 'c_address', label: 'Address' },
    { id: 'c_los',     label: 'Length of Stay' },
    { id: 'c_own',     label: 'Ownership' },
    { id: 'c_mobile',  label: 'Mobile No.' },
    { id: 'c_citizen', label: 'Citizenship' },
    { id: 'c_dep',     label: 'No. of Dependents' },
    { id: 'c_pob',     label: 'Place of Birth' },
    { id: 'c_mom',     label: "Mother's Full Maiden Name" },
    { id: 'c_tin',     label: 'TIN' },
    { id: 'c_sss',     label: 'SSS / GSIS No.' },
    { id: 'c_email',   label: 'Email Address' }
  ],
  5: [
    { id: 'ce_company',  label: 'Name of Company' },
    { id: 'ce_offaddr',  label: 'Office Address' },
    { id: 'ce_pos',      label: 'Position' },
    { id: 'ce_offnum',   label: 'Office Number' },
    { id: 'ce_los',      label: 'Length of Service' },
    { id: 'ce_industry', label: 'Nature of Industry' },
    { id: 'ce_income',   label: 'Monthly Income' },
    { id: 'ce_bank',     label: 'Bank' },
    { id: 'ce_accttype', label: 'Account Type' },
    { id: 'ce_acctnum',  label: 'Account Number' },
    { id: 'ce_branch',   label: 'Branch' }
  ]
};

function validatePage(n) {
  var fields = PAGE_FIELDS[n] || [];
  var firstError = null;

  // Clear previous error highlights
  fields.forEach(function(f) {
    var el = document.getElementById(f.id);
    if (el) el.style.borderColor = '';
  });

  var missing = [];
  fields.forEach(function(f) {
    var el = document.getElementById(f.id);
    if (!el) return;
    if (!el.value.trim()) {
      el.style.borderColor = '#CC0000';
      missing.push(f.label);
      if (!firstError) firstError = el;
    } else {
      el.style.borderColor = '';
    }
  });

  if (missing.length > 0) {
    showToast('Please fill in: ' + missing.slice(0, 3).join(', ') + (missing.length > 3 ? '...' : ''));
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }
  return true;
}

// ============================================================
//  MULTI-STEP NAVIGATION
// ============================================================
function goPage(n) {
  for (var i = 1; i <= 5; i++) {
    document.getElementById('page-' + i).style.display = (i === n) ? '' : 'none';
    var dot = document.getElementById('dot-' + i);
    dot.className = 'step-dot' +
      (i < n ? ' done' : i === n ? ' active' : '');
  }

  var labels = [
    'Unit Information',
    'Borrower Personal Info',
    'Borrower Employment & Financial',
    'Co-Borrower Personal Info',
    'Co-Borrower Employment & Financial'
  ];
  document.getElementById('step-label').textContent =
    'Step ' + n + ' of 5 — ' + labels[n - 1];

  window.scrollTo(0, 0);
}

function goNext(n) {
  if (!validatePage(n)) return;
  goPage(n + 1);
}

// ============================================================
//  FORM DATA COLLECTION
// ============================================================
function getVal(id) {
  var el = document.getElementById(id);
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

// ============================================================
//  DATE / TIME HELPERS
// ============================================================
function formatDate(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  return (d.getMonth() + 1).toString().padStart(2, '0') + '/' +
         d.getDate().toString().padStart(2, '0') + '/' +
         d.getFullYear();
}

function formatTime(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  var h = d.getHours(), m = d.getMinutes();
  var ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + m.toString().padStart(2, '0') + ' ' + ampm;
}

function nowStamp(iso) {
  return 'Date: ' + formatDate(iso) + ' | Time: ' + formatTime(iso);
}

// ============================================================
//  PRINTABLE DOCUMENT BUILDER
// ============================================================
function infoRow(label, val) {
  return '<div class="info-row">' +
         '<span class="info-label">' + label + ':</span>' +
         '<span class="info-val">' + (val || '—') + '</span>' +
         '</div>';
}

function buildDoc(data) {
  var ts = data.ts;
  var b  = data.borrower;
  var be = data.borrowerEmp;
  var c  = data.coborrower;
  var ce = data.coborrowerEmp;
  var u  = data.unit;

  var bName = [b.first, b.mid, b.last].filter(Boolean).join(' ') || '—';
  var refId = 'TMB-' + (ts || '').replace(/[^0-9]/g, '').slice(2, 12);

  return '' +
    '<div class="print-header">' +
      '<div class="print-logo-area">' +
        '<div class="print-brand"><h1>Toyota Manila Bay</h1></div>' +
      '</div>' +
      '<div class="print-title">' +
        '<h2>PRE-APPROVAL APPLICATION</h2>' +
        '<p>' + nowStamp(ts) + '</p>' +
        '<p>Ref: ' + refId + '</p>' +
      '</div>' +
    '</div>' +

    '<div class="print-meta">' +
      '<div class="print-meta-item"><strong>Applicant:</strong> ' + bName + '</div>' +
      '<div class="print-meta-item"><strong>Unit:</strong> ' + (u.unit || '—') + ' (' + (u.year || '—') + ')</div>' +
      '<div class="print-meta-item"><strong>Color:</strong> ' + (u.color || '—') + '</div>' +
      '<div class="print-meta-item"><strong>DP:</strong> ' + (u.dp || '—') + '</div>' +
      '<div class="print-meta-item"><strong>Term:</strong> ' + (u.term || '—') + '</div>' +
    '</div>' +

    '<div class="section-title">A — Borrower Personal Information</div>' +
    '<div class="info-grid">' +
      infoRow('Last Name', b.last) +
      infoRow('First Name', b.first) +
      infoRow('Middle Name', b.mid) +
      infoRow('Age', b.age) +
      infoRow('Birthdate', b.bday) +
      infoRow('Civil Status', b.status) +
      infoRow('Citizenship', b.citizen) +
      infoRow('No. of Dependents', b.dep) +
      infoRow('Place of Birth', b.pob) +
      infoRow('TIN', b.tin) +
      infoRow('SSS / GSIS No.', b.sss) +
      infoRow('Mobile No.', b.mobile) +
      infoRow('Landline', b.land) +
      infoRow('Email Address', b.email) +
    '</div>' +
    '<div class="info-grid" style="margin-bottom:1.2rem">' +
      infoRow('Home Address', b.address) +
      infoRow('Length of Stay', b.los) +
      infoRow('Ownership', b.own) +
      infoRow("Mother's Maiden Name", b.mom) +
    '</div>' +

    '<div class="section-title">B — Borrower Employment & Financial Information</div>' +
    '<div class="info-grid">' +
      infoRow('Company Name', be.company) +
      infoRow('Office Address', be.offaddr) +
      infoRow('Position', be.pos) +
      infoRow('Office Number', be.offnum) +
      infoRow('Length of Service', be.los) +
      infoRow('Nature of Industry', be.industry) +
      infoRow('Previous Employer', be.prev) +
      infoRow('Monthly Income', be.income ? '₱' + Number(be.income).toLocaleString() : '') +
      infoRow('Other Income Sources', be.other) +
      infoRow('Bank', be.bank) +
      infoRow('Account Type', be.accttype) +
      infoRow('Account Number', be.acctnum) +
      infoRow('Branch', be.branch) +
      infoRow('Best Time to Call', be.call) +
    '</div>' +

    '<div class="section-title">C — Co-Borrower Personal Information</div>' +
    '<div class="info-grid">' +
      infoRow('Last Name', c.last) +
      infoRow('First Name', c.first) +
      infoRow('Middle Name', c.mid) +
      infoRow('Age', c.age) +
      infoRow('Birthdate', c.bday) +
      infoRow('Civil Status', c.status) +
      infoRow('Citizenship', c.citizen) +
      infoRow('No. of Dependents', c.dep) +
      infoRow('Place of Birth', c.pob) +
      infoRow('TIN', c.tin) +
      infoRow('SSS / GSIS No.', c.sss) +
      infoRow('Mobile No.', c.mobile) +
      infoRow('Landline', c.land) +
      infoRow('Email Address', c.email) +
    '</div>' +
    '<div class="info-grid" style="margin-bottom:1.2rem">' +
      infoRow('Home Address', c.address) +
      infoRow('Length of Stay', c.los) +
      infoRow('Ownership', c.own) +
      infoRow("Mother's Maiden Name", c.mom) +
    '</div>' +

    '<div class="section-title">D — Co-Borrower Employment & Financial Information</div>' +
    '<div class="info-grid">' +
      infoRow('Company Name', ce.company) +
      infoRow('Office Address', ce.offaddr) +
      infoRow('Position', ce.pos) +
      infoRow('Office Number', ce.offnum) +
      infoRow('Length of Service', ce.los) +
      infoRow('Nature of Industry', ce.industry) +
      infoRow('Previous Employer', ce.prev) +
      infoRow('Monthly Income', ce.income ? '₱' + Number(ce.income).toLocaleString() : '') +
      infoRow('Other Income Sources', ce.other) +
      infoRow('Bank', ce.bank) +
      infoRow('Account Type', ce.accttype) +
      infoRow('Account Number', ce.acctnum) +
      infoRow('Branch', ce.branch) +
    '</div>' +

    '<div class="sig-row">' +
      '<div class="sig-box">' +
        '<div class="sig-line"></div>' +
        '<div class="sig-label">Borrower\'s Signature over Printed Name</div>' +
        '<div class="sig-label" style="margin-top:0.3rem;color:#CC0000;">' + nowStamp(ts) + '</div>' +
      '</div>' +
      '<div class="sig-box">' +
        '<div class="sig-line"></div>' +
        '<div class="sig-label">Co-Borrower\'s Signature over Printed Name</div>' +
        '<div class="sig-label" style="margin-top:0.3rem;color:#CC0000;">' + nowStamp(ts) + '</div>' +
      '</div>' +
      '<div class="sig-box">' +
        '<div class="sig-line"></div>' +
        '<div class="sig-label">Sales Agent\'s Signature</div>' +
        '<div class="sig-label" style="margin-top:0.3rem;color:#CC0000;">' + nowStamp(ts) + '</div>' +
      '</div>' +
    '</div>' +

    '<div class="print-footer">' +
      '<p>Toyota Manila Bay | This document is confidential and for authorized use only.</p>' +
      '<div class="timestamp-area">' +
        '<span>Generated by TMB Online Pre-Approval System</span>' +
        '<span style="color:#CC0000;font-weight:700;">' + nowStamp(ts) + '</span>' +
      '</div>' +
    '</div>';
}

// ============================================================
//  FORM SUBMISSION — saves to Firestore (cloud, any device)
// ============================================================
function submitForm() {
  if (!validatePage(5)) return;

  var data = collectData();

  // Disable button to prevent double-submit
  var submitBtn = document.querySelector('#page-5 .btn-next');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
  }

  submissionsCol.add(data)
    .then(function(docRef) {
      // Save Firestore doc ID so we can delete it later
      data.firestoreId = docRef.id;
      document.getElementById('printable-doc').innerHTML = buildDoc(data);
      goScreen('output');
      showToast('Application submitted successfully!');
    })
    .catch(function(err) {
      console.error('Firestore error:', err);
      showToast('Submission failed — check your internet connection.');
    })
    .finally(function() {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application →';
      }
    });
}

// ============================================================
//  PRINT / PDF
// ============================================================
function printDoc() {
  window.print();
}

function savePDF() {
  showToast('Preparing PDF — use "Save as PDF" in the print dialog.');
  setTimeout(function() { window.print(); }, 300);
}

// ============================================================
//  ADMIN DASHBOARD — loads ALL submissions from Firestore
// ============================================================
function renderAdmin() {
  var body = document.getElementById('admin-body');
  body.innerHTML = '<div class="empty-state">Loading submissions…</div>';

  submissionsCol
    .orderBy('ts', 'desc')
    .get()
    .then(function(snapshot) {
      cachedSubmissions = [];
      snapshot.forEach(function(doc) {
        var d = doc.data();
        d.firestoreId = doc.id;
        cachedSubmissions.push(d);
      });

      if (!cachedSubmissions.length) {
        body.innerHTML = '<div class="empty-state">No submissions yet. Client forms will appear here.</div>';
        return;
      }

      body.innerHTML = cachedSubmissions.map(function(s, i) {
        var b       = s.borrower || {};
        var name    = [b.first, b.last].filter(Boolean).join(' ') || 'Unknown Applicant';
        var unit    = (s.unit && s.unit.unit) || 'No unit specified';
        var dateStr = formatDate(s.ts) + ' ' + formatTime(s.ts);
        var refId   = 'TMB-' + (s.ts || '').replace(/[^0-9]/g, '').slice(2, 12);

        return '<div class="admin-card">' +
          '<div class="admin-card-info">' +
            '<h4>' + name + ' <span class="badge">Submitted</span></h4>' +
            '<p>' + unit + ' | ' + ((s.unit && s.unit.dp) || '—') + ' DP | ' +
                   ((s.unit && s.unit.term) || '—') + ' | Submitted: ' + dateStr + '</p>' +
            '<p style="font-size:0.78rem;color:#aaa;">Ref: ' + refId + '</p>' +
          '</div>' +
          '<div class="admin-card-actions">' +
            '<button class="btn-view" onclick="viewSubmission(' + i + ')">View / Print</button>' +
            '<button class="btn-delete" onclick="deleteSubmission(' + i + ',\'' + s.firestoreId + '\')">🗑 Delete</button>' +
          '</div>' +
        '</div>';
      }).join('');
    })
    .catch(function(err) {
      console.error('Firestore fetch error:', err);
      body.innerHTML = '<div class="empty-state" style="color:#CC0000;">Could not load submissions.<br>Check Firebase config in script.js and make sure Firestore is enabled.</div>';
    });
}

function viewSubmission(i) {
  var data = cachedSubmissions[i];
  document.getElementById('printable-doc').innerHTML = buildDoc(data);
  goScreen('output');
}

function deleteSubmission(i, firestoreId) {
  var s    = cachedSubmissions[i];
  var name = [(s.borrower || {}).first, (s.borrower || {}).last].filter(Boolean).join(' ') || 'this client';
  if (!confirm('Are you sure you want to delete the record for ' + name + '? This cannot be undone.')) return;

  db.collection('tmb_submissions').doc(firestoreId).delete()
    .then(function() {
      showToast('Record for ' + name + ' has been deleted.');
      renderAdmin(); // Refresh the list
    })
    .catch(function(err) {
      console.error('Delete error:', err);
      showToast('Delete failed — please try again.');
    });
}
