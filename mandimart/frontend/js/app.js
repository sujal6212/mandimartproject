// ============================================================
// MANDIMART - INTERACTIVE JAVASCRIPT (Frontend Features)
// Handles Live Filter, Search, Inquiry Modal, & Price Calculator
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  console.log('MandiMart Frontend JS initialized.');

  // Live Crop Search & Filter
  const searchInput = document.getElementById('cropSearch');
  const cropCards = document.querySelectorAll('.crop-item');

  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      const term = e.target.value.toLowerCase();
      cropCards.forEach(card => {
        const title = card.getAttribute('data-name')?.toLowerCase() || '';
        const loc = card.getAttribute('data-location')?.toLowerCase() || '';
        if (title.includes(term) || loc.includes(term)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // Quick Price Calculator
  const qtyInput = document.getElementById('calcQty');
  const rateInput = document.getElementById('calcRate');
  const totalDisplay = document.getElementById('calcTotal');

  function updateTotal() {
    if (qtyInput && rateInput && totalDisplay) {
      const q = parseFloat(qtyInput.value) || 0;
      const r = parseFloat(rateInput.value) || 0;
      totalDisplay.textContent = '₹' + (q * r).toLocaleString('en-IN');
    }
  }

  if (qtyInput && rateInput) {
    qtyInput.addEventListener('input', updateTotal);
    rateInput.addEventListener('input', updateTotal);
  }
});
