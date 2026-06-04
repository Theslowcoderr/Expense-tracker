/* ═══════════════════════════════════════════════
   EXPENSE TRACKER — script.js (Glass Edition)
   Flow: user action → update data → saveData() → updateUI()
   ═══════════════════════════════════════════════ */

/* ── GRAB ELEMENTS ─────────────────────────── */
Notification.requestPermission();
const limitInput      = document.getElementById('limitInput');
const setLimitBtn     = document.getElementById('setLimitBtn');
const limitDisplay    = document.getElementById('limitDisplay');
const limitDisplayText= document.getElementById('limitDisplayText');

const expenseAmount   = document.getElementById('expenseAmount');
const expenseNote     = document.getElementById('expenseNote');
const expenseCategory = document.getElementById('expenseCategory');
const addExpenseBtn   = document.getElementById('addExpenseBtn');

const totalSpentEl    = document.getElementById('totalSpent');
const remainingEl     = document.getElementById('remaining');

const progressWrap    = document.getElementById('progressWrap');
const progressFill    = document.getElementById('progressFill');
const progressPct     = document.getElementById('progressPct');
const progSpent       = document.getElementById('progSpent');
const progRemaining   = document.getElementById('progRemaining');

const warningBanner   = document.getElementById('warningBanner');
const warningPct      = document.getElementById('warningPct');

const expenseList     = document.getElementById('expenseList');
const listSection     = document.getElementById('listSection');
const clearBtn        = document.getElementById('clearBtn');
const headerDate      = document.getElementById('headerDate');

/* ── STATE ─────────────────────────────────── */
let limit    = 0;
let expenses = [];
let alertedAt100 = false;   // prevents the 100% alert from firing repeatedly

/* ── SET LIVE DATE IN HEADER ───────────────── */
headerDate.textContent = new Date().toLocaleDateString('en-IN', {
  weekday: 'short', day: 'numeric', month: 'short'
});

/* ── LOCALSTORAGE ──────────────────────────── */
function loadData() {
  const sl = localStorage.getItem('et_limit');
  const se = localStorage.getItem('et_expenses');
  const sa = localStorage.getItem('et_alerted');
  if (sl) limit    = parseFloat(sl);
  if (se) expenses = JSON.parse(se);
  if (sa) alertedAt100 = sa === 'true';
}

function saveData() {
  localStorage.setItem('et_limit',    limit);
  localStorage.setItem('et_expenses', JSON.stringify(expenses));
  localStorage.setItem('et_alerted',  alertedAt100);
}

function clearData() {
  localStorage.removeItem('et_limit');
  localStorage.removeItem('et_expenses');
  localStorage.removeItem('et_alerted');
}

/* ── HELPERS ───────────────────────────────── */
function fmt(n) {
  return '₹' + Math.abs(n).toLocaleString('en-IN');
}

function getTimeStamp() {
  return new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

function shake(el) {
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

/* ── UPDATE UI ─────────────────────────────── */
function updateUI() {
  /* Total spent */
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  totalSpentEl.textContent = fmt(total);

  if (limit > 0) {
    const left    = limit - total;
    const usedPct = Math.min((total / limit) * 100, 100);

    /* Remaining box */
    remainingEl.textContent = left >= 0 ? fmt(left) : '−' + fmt(Math.abs(left));
    remainingEl.style.color = left < 0
      ? 'var(--accent-red)'
      : 'var(--accent-green)';

    /* ── Progress bar fills 0 → 100% ────────
       Three colour stages:
       0–69%  → blue-green gradient (safe)
       70–89% → orange gradient     (caution)
       90%+   → red gradient        (danger)
    ─────────────────────────────────────────── */
    progressFill.style.width = usedPct + '%';
    progressPct.textContent  = Math.round(usedPct) + '%';

    progressFill.classList.remove('warning', 'danger');
    if (usedPct >= 90) {
      progressFill.classList.add('danger');
    } else if (usedPct >= 70) {
      progressFill.classList.add('warning');
    }

    /* Bottom bar labels */
    progSpent.textContent     = fmt(total);
    progRemaining.textContent = left >= 0 ? fmt(left) : '₹0';

    progressWrap.style.display = 'flex';

    
    /* Warning banner at 50% */
    if (usedPct >= 50 && usedPct < 90) {
      warningPct.textContent = Math.round(usedPct) + '%';
      warningBanner.style.display = 'flex';
      alert("🚨 50% of budget used");
    }
    
    /* Warning banner at 90% */
    if (usedPct >= 90) {
      warningPct.textContent     = Math.round(usedPct) + '%';
      warningBanner.style.display = 'flex';
      alert("🚨 90% of budget used");
    } 

    /* 100% alert — fires only once per budget session */
    if (total >= limit && !alertedAt100) {
      alertedAt100 = true;
      saveData();
      setTimeout(() => {
        alert('🚨 Budget exhausted! You have used 100% of your limit.');
      }, 500);
    }

    /* Reset alert flag if spending drops below limit (after clear) */
    if (total < limit) alertedAt100 = false;

  } else {
    remainingEl.textContent     = '—';
    progressWrap.style.display  = 'none';
    warningBanner.style.display = 'none';
  }

  /* ── Render transaction list ──────────────
     Clear and rebuild from the expenses array.
     Newest first via [...expenses].reverse()
  ─────────────────────────────────────────── */
  expenseList.innerHTML = '';

  if (expenses.length > 0) {
    listSection.style.display = 'flex';

    [...expenses].reverse().forEach(e => {
      const li = document.createElement('li');
      li.className = 'expense-item';
      li.innerHTML = `
        <div class="item-left">
          <span class="item-note">${e.note}</span>
          <span class="item-category cat-${e.category}">${e.category}</span>
          <span class="item-time">${e.time}</span>
        </div>
        <span class="item-amount">−${fmt(e.amount)}</span>
      `;
      expenseList.appendChild(li);
    });
  } else {
    listSection.style.display = 'none';
  }
}

/* ── EVENT LISTENERS ───────────────────────── */

/* Set limit */
setLimitBtn.addEventListener('click', () => {
  const val = parseFloat(limitInput.value);
  if (!val || val <= 0) { shake(limitInput); return; }

  limit = val;
  limitInput.value = '';
  alertedAt100 = false;

  limitDisplayText.textContent = `Limit: ${fmt(limit)}`;
  limitDisplay.style.display   = 'inline-flex';

  saveData();
  updateUI();
});

/* Add expense */
addExpenseBtn.addEventListener('click', () => {

    const amount = parseFloat(expenseAmount.value);
    const note = expenseNote.value.trim();

    if (!amount || amount <= 0) {
        shake(expenseAmount);
        return;
    }

    expenses.push({
        amount,
        note: note || 'Expense',
        category: expenseCategory.value,
        time: getTimeStamp()
    });

   

    // SEND DATA TO BACKEND
    fetch("http://localhost:5000/add-Expense", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            title: note || 'Expense',
            amount: amount,
            category: expenseCategory.value
        })

    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
    });

    expenseAmount.value = '';
    expenseNote.value = '';

    saveData();
    updateUI();

});

/* Clear all */
clearBtn.addEventListener('click', () => {
  if (!confirm('Clear all expenses and the spending limit?')) return;
  expenses     = [];
  limit        = 0;
  alertedAt100 = false;
  limitDisplay.style.display = 'none';
  clearData();
  updateUI();
});

/* Enter key shortcuts */
[expenseAmount, expenseNote].forEach(el =>
  el.addEventListener('keydown', e => { if (e.key === 'Enter') addExpenseBtn.click(); })
);
limitInput.addEventListener('keydown', e => { if (e.key === 'Enter') setLimitBtn.click(); });

/* ── INIT ──────────────────────────────────── */
loadData();

if (limit > 0) {
  limitDisplayText.textContent = `Limit: ${fmt(limit)}`;
  limitDisplay.style.display   = 'inline-flex';
}

updateUI();

async function loadExpenses() {

    const response = await fetch("http://localhost:5000/expenses");

    const data = await response.json();

    console.log(data);

}

loadExpenses();

module.exports = mongoose.model("Expense", expenseSchema);

function showNotification(message) {

    if (Notification.permission === "granted") {

        new Notification("Limitly Alert", {
            body: message
        });

    }

}