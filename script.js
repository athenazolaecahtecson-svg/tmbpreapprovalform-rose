
// ============================================================
// Toyota Manila Bay — Pre-Approval System (FIXED VERSION)
// ============================================================

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const COLLECTION = 'tmb_submissions';

// ------------------------------------------------------------
// ADMIN
// ------------------------------------------------------------
const ADMIN_EMAIL = 'jennyrosedoreza1709@gmail.com';
const ADMIN_PASS  = '110907';

// ------------------------------------------------------------
// LOADING (FIXED - NO INFINITE STUCK)
// ------------------------------------------------------------
let loadingTimeout;

function showLoading(msg = 'Please wait...') {
  let el = document.getElementById('loading-overlay');

  if (!el) {
    el = document.createElement('div');
    el.id = 'loading-overlay';
    el.className = 'overlay';
    document.body.appendChild(el);
  }

  el.innerHTML = `<div class="spinner"></div><span>${msg}</span>`;
  el.style.display = 'flex';

  clearTimeout(loadingTimeout);
  loadingTimeout = setTimeout(() => {
    hideLoading();
    showToast('Request timed out. Please try again.');
  }, 20000);
}

function hideLoading() {
  const el = document.getElementById('loading-overlay');
  if (el) el.style.display = 'none';

  clearTimeout(loadingTimeout);
}

// ------------------------------------------------------------
// TOAST
// ------------------------------------------------------------
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ------------------------------------------------------------
// SCREEN NAVIGATION
// ------------------------------------------------------------
function goScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id + '-screen') || document.getElementById(id);
  if (target) target.classList.add('active');
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
    goScreen('admin');
    loadSubmissions();
  } else {
    showToast('Invalid credentials');
  }
}

// ------------------------------------------------------------
// SAFE VALIDATION (FIXED NEXT BUTTON ISSUE)
// ------------------------------------------------------------
function validatePage(n) {
  const fields = PAGE_FIELDS[n] || [];
  let firstError = null;

  let missing = [];

  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (!el) return;

    el.style.borderColor = '';

    const value = (el.value || '').trim();

    // ONLY validate visible inputs
    if (el.offsetParent !== null && value === '') {
      el.style.borderColor = '#CC0000';
      missing.push(f.label);
      if (!firstError) firstError = el;
    }
  });

  if (missing.length > 0) {
    showToast('Please complete required fields');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return false;
  }

  return true;
}

// ------------------------------------------------------------
// NAVIGATION STEPS
// ------------------------------------------------------------
function goPage(n) {
  for (let i = 1; i <= 5; i++) {
    document.getElementById('page-' + i).style.display = (i === n) ? '' : 'none';
  }
}

function goNext(n) {
  if (!validatePage(n)) return;
  goPage(n + 1);
}

// ------------------------------------------------------------
// DATA COLLECTION
// ------------------------------------------------------------
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function collectData() {
  return {
    ts: new Date().toISOString(),
    unit: {
      unit: getVal('f_unit'),
      color: getVal('f_color'),
      year: getVal('f_year'),
      dp: getVal('f_dp'),
      term: getVal('f_term')
    },
    borrower: {
      last: getVal('b_last'),
      first: getVal('b_first'),
      mid: getVal('b_mid'),
      age: getVal('b_age'),
      bday: getVal('b_bday'),
      status: getVal('b_status'),
      address: getVal('b_address'),
      los: getVal('b_los'),
      own: getVal('b_own'),
      mobile: getVal('b_mobile'),
      citizen: getVal('b_citizen'),
      dep: getVal('b_dep'),
      pob: getVal('b_pob'),
      mom: getVal('b_mom'),
      tin: getVal('b_tin'),
      sss: getVal('b_sss'),
      email: getVal('b_email')
    }
  };
}

// ------------------------------------------------------------
// SUBMIT (FIXED - NO FREEZE)
// ------------------------------------------------------------
async function submitForm() {
  if (!validatePage(5)) return;

  const data = collectData();

  const btn = document.querySelector('[onclick="submitForm()"]');
  if (btn) btn.disabled = true;

  showLoading('Submitting application...');

  try {
    const docRef = await db.collection(COLLECTION).add(data);

    data.firestoreId = docRef.id;

    document.getElementById('printable-doc').innerHTML = buildDoc(data);

    hideLoading();
    goScreen('output');
    showToast('Submitted successfully!');

  } catch (err) {
    console.error(err);
    hideLoading();
    showToast('Submission failed');

  } finally {
    if (btn) btn.disabled = false;
  }
}
