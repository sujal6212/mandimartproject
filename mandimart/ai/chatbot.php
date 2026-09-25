<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <!-- Card Container -->
      <div class="card border-0 shadow-lg rounded-4 overflow-hidden d-flex flex-column" style="height: 650px;">
        <!-- Chatbot Header -->
        <div class="card-header bg-success text-white py-3 px-4 d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-2">
            <div class="p-2 bg-white rounded-circle text-success fs-5">🤖</div>
            <div>
              <h5 class="fw-bold mb-0">MandiMart AI Agricultural Assistant</h5>
              <small class="text-white-50">Online · Instant Mandi, Crop & Auction Guidance</small>
            </div>
          </div>
          <!-- Language Toggle -->
          <div class="btn-group btn-group-sm" role="group">
            <input type="radio" class="btn-check" name="chatLang" id="langEn" value="en" checked onchange="setLang('en')">
            <label class="btn btn-outline-light" for="langEn">English</label>

            <input type="radio" class="btn-check" name="chatLang" id="langHi" value="hi" onchange="setLang('hi')">
            <label class="btn btn-outline-light" for="langHi">हिन्दी</label>
          </div>
        </div>

        <!-- Chat Message Area -->
        <div class="card-body p-4 overflow-y-auto flex-grow-1 bg-light" id="chatArea">
          <!-- Initial Assistant Message -->
          <div class="d-flex gap-2 mb-3">
            <div class="p-2 bg-success text-white rounded-circle align-self-start" style="width: 38px; height: 38px; text-align: center;">🌾</div>
            <div class="p-3 bg-white rounded-4 shadow-sm border text-dark" style="max-width: 80%;">
              <p class="mb-1" id="greetingMsg">
                Namaste! I am your <strong>MandiMart AI Assistant</strong>. Ask me anything about today's mandi prices, listing crops, placing auction bids, or vegetable quality analysis!
              </p>
              <small class="text-muted" style="font-size: 11px;">MandiMart Intelligence</small>
            </div>
          </div>
        </div>

        <!-- Quick Chips Bar -->
        <div class="px-3 py-2 bg-white border-top border-bottom d-flex gap-2 overflow-x-auto" style="white-space: nowrap;">
          <button type="button" class="btn btn-sm btn-outline-success rounded-pill" onclick="sendChip('What is today\'s Tomato price in Azadpur?')">
            🍅 Tomato Price
          </button>
          <button type="button" class="btn btn-sm btn-outline-success rounded-pill" onclick="sendChip('How to list my crop on MandiMart?')">
            🌱 How to Sell Crop
          </button>
          <button type="button" class="btn btn-sm btn-outline-success rounded-pill" onclick="sendChip('How do live auctions and bidding work?')">
            🔨 Auction Rules
          </button>
          <button type="button" class="btn btn-sm btn-outline-success rounded-pill" onclick="sendChip('How does the AI vegetable quality score work?')">
            🔍 AI Quality Check
          </button>
        </div>

        <!-- Input Box -->
        <div class="card-footer bg-white p-3 border-0">
          <form id="chatForm" class="d-flex gap-2">
            <input type="text" id="userInput" class="form-control rounded-pill px-4" placeholder="Type your agricultural question here..." autocomplete="off" required>
            <button type="submit" class="btn btn-success rounded-pill px-4 fw-bold">
              <i class="fa-solid fa-paper-plane me-1"></i> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
let currentLang = 'en';

function setLang(lang) {
  currentLang = lang;
  const greeting = document.getElementById('greetingMsg');
  if (lang === 'hi') {
    greeting.innerHTML = "नमस्ते किसान भाई! मैं <strong>MandiMart AI सहायक</strong> हूँ। आप मुझसे आज के मंडी भाव, फसल लिस्टिंग, नीलामी (ऑक्शन) नियम, या सब्जी गुणवत्ता जांच के बारे में पूछ सकते हैं।";
  } else {
    greeting.innerHTML = "Namaste! I am your <strong>MandiMart AI Assistant</strong>. Ask me anything about today's mandi prices, listing crops, placing auction bids, or vegetable quality analysis!";
  }
}

function sendChip(text) {
  document.getElementById('userInput').value = text;
  document.getElementById('chatForm').dispatchEvent(new Event('submit'));
}

document.getElementById('chatForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const input = document.getElementById('userInput');
  const message = input.value.trim();
  if (!message) return;

  appendMessage('user', message);
  input.value = '';

  // Show typing loader
  const loaderId = appendLoader();

  try {
    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, language: currentLang })
    });
    const data = await res.json();
    removeLoader(loaderId);

    if (data.success) {
      appendMessage('assistant', data.reply);
    } else {
      appendMessage('assistant', 'Sorry, I could not process your query right now. Please try again.');
    }
  } catch (err) {
    removeLoader(loaderId);
    appendMessage('assistant', 'Connection error. Please check your internet or retry.');
  }
});

function appendMessage(sender, text) {
  const chatArea = document.getElementById('chatArea');
  const isUser = sender === 'user';

  const row = document.createElement('div');
  row.className = `d-flex gap-2 mb-3 ${isUser ? 'justify-content-end' : ''}`;

  if (!isUser) {
    row.innerHTML = `
      <div class="p-2 bg-success text-white rounded-circle align-self-start" style="width: 38px; height: 38px; text-align: center;">🌾</div>
      <div class="p-3 bg-white rounded-4 shadow-sm border text-dark" style="max-width: 80%; white-space: pre-line;">
        <p class="mb-1">${escapeHtml(text)}</p>
        <small class="text-muted" style="font-size: 11px;">MandiMart Assistant</small>
      </div>
    `;
  } else {
    row.innerHTML = `
      <div class="p-3 bg-success text-white rounded-4 shadow-sm" style="max-width: 80%; white-space: pre-line;">
        <p class="mb-0">${escapeHtml(text)}</p>
      </div>
      <div class="p-2 bg-secondary text-white rounded-circle align-self-start" style="width: 38px; height: 38px; text-align: center;">👤</div>
    `;
  }

  chatArea.appendChild(row);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function appendLoader() {
  const chatArea = document.getElementById('chatArea');
  const id = 'loader_' + Date.now();
  const row = document.createElement('div');
  row.id = id;
  row.className = 'd-flex gap-2 mb-3';
  row.innerHTML = `
    <div class="p-2 bg-success text-white rounded-circle" style="width: 38px; height: 38px; text-align: center;">🌾</div>
    <div class="p-3 bg-white rounded-4 shadow-sm border text-muted small">
      <i class="fa-solid fa-spinner fa-spin me-1 text-success"></i> Thinking...
    </div>
  `;
  chatArea.appendChild(row);
  chatArea.scrollTop = chatArea.scrollHeight;
  return id;
}

function removeLoader(id) {
  const elem = document.getElementById(id);
  if (elem) elem.remove();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
