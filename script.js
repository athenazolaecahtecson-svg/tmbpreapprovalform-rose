
// ============================================================
// Toyota Manila Bay — Pre-Approval System (STABLE VERSION)
// ============================================================

// ------------------------------------------------------------
// FIREBASE
// ------------------------------------------------------------
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
const COLLECTION = "tmb_submissions";

// ------------------------------------------------------------
// ADMIN
// ------------------------------------------------------------
const ADMIN_EMAIL = "jennyrosedoreza1709@gmail.com";
const ADMIN_PASS = "110907";

// ------------------------------------------------------------
// SCREEN NAVIGATION
// ------------------------------------------------------------
function goScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));

  const el = document.getElementById(id + "-screen") || document.getElementById(id);
  if (el) el.classList.add("active");

  if (id === "welcome") {
    document.getElementById("welcome").classList.add("active");
  }
}

function startClientForm() {
  goScreen("form");
  goPage(1);
}

// ------------------------------------------------------------
// LOADING (SAFE - NO FREEZE)
// ------------------------------------------------------------
let loadingTimer;

function showLoading(msg = "Please wait...") {
  let el = document.getElementById("loading-overlay");

  if (!el) {
    el = document.createElement("div");
    el.id = "loading-overlay";
    el.className = "overlay";
    document.body.appendChild(el);
  }

  el.innerHTML = `<div class="spinner"></div><span>${msg}</span>`;
  el.style.display = "flex";

  clearTimeout(loadingTimer);
  loadingTimer = setTimeout(() => {
    hideLoading();
    showToast("Request timed out. Please try again.");
  }, 20000);
}

function hideLoading() {
  const el = document.getElementById("loading-overlay");
  if (el) el.style.display = "none";

  clearTimeout(loadingTimer);
}

// ------------------------------------------------------------
// TOAST
// ------------------------------------------------------------
function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;

  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

// ------------------------------------------------------------
// FORM NAVIGATION
// ------------------------------------------------------------
function goPage(n) {
  for (let i = 1; i <= 5; i++) {
    const page = document.getElementById("page-" + i);
    if (page) page.style.display = (i === n ? "" : "none");
  }
}

// ------------------------------------------------------------
// VALIDATION (SAFE - DOES NOT BLOCK WRONGFULLY)
// ------------------------------------------------------------
function validatePage(n) {
  const fields = PAGE_FIELDS?.[n] || [];
  let firstError = null;

  for (const f of fields) {
    const el = document.getElementById(f.id);
    if (!el) continue;

    const value = (el.value || "").trim();

    if (value === "") {
      el.style.borderColor = "#CC0000";
      if (!firstError) firstError = el;
    } else {
      el.style.borderColor = "";
    }
  }

  if (firstError) {
    showToast("Please complete required fields");
    firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }

  return true;
}

// ------------------------------------------------------------
// NEXT BUTTON
// ------------------------------------------------------------
function goNext(n) {
  if (!validatePage(n)) return;
  goPage(n + 1);
}

// ------------------------------------------------------------
// FORM DATA
// ------------------------------------------------------------
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function collectData() {
  return {
    ts: new Date().toISOString(),
    borrower: {
      first: getVal("b_first"),
      last: getVal("b_last"),
      mid: getVal("b_mid"),
      mobile: getVal("b_mobile"),
      email: getVal("b_email")
    },
    unit: {
      unit: getVal("f_unit"),
      color: getVal("f_color"),
      year: getVal("f_year"),
      dp: getVal("f_dp"),
      term: getVal("f_term")
    }
  };
}

// ------------------------------------------------------------
// SUBMIT (NO FREEZE VERSION)
// ------------------------------------------------------------
async function submitForm() {
  if (!validatePage(5)) return;

  const data = collectData();

  const btn = document.querySelector('[onclick="submitForm()"]');
  if (btn) btn.disabled = true;

  showLoading("Submitting application...");

  try {
    const docRef = await db.collection(COLLECTION).add(data);

    data.firestoreId = docRef.id;

    document.getElementById("printable-doc").innerHTML = buildDoc(data);

    hideLoading();
    goScreen("output");
    showToast("Submitted successfully!");

  } catch (err) {
    console.error(err);
    hideLoading();
    showToast("Submission failed");

  } finally {
    if (btn) btn.disabled = false;
  }
}

// ------------------------------------------------------------
// PLACEHOLDER (IF YOU DIDN'T INCLUDE IT ELSEWHERE)
// ------------------------------------------------------------
function buildDoc(data) {
  return `
    <h2>Toyota Manila Bay Submission</h2>
    <p>Name: ${data.borrower.first || ""} ${data.borrower.last || ""}</p>
    <p>Unit: ${data.unit.unit || ""}</p>
  `;
}
