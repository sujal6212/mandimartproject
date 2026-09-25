<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
  <!-- Title & Info -->
  <div class="text-center mb-4">
    <span class="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold">
      <i class="fa-solid fa-brain me-1"></i> Computer Vision Powered Inspection
    </span>
    <h1 class="fw-bold mt-2">AI Vegetable Quality Comparison</h1>
    <p class="text-muted col-lg-7 mx-auto">
      Upload two images of the same vegetable (e.g. Tomato vs Tomato) to evaluate freshness, color consistency, size uniformity, and defect anomalies using computer vision.
    </p>
  </div>

  <!-- Mandatory Quality Assessment Disclaimer -->
  <div class="alert alert-warning border-warning d-flex align-items-center gap-3 rounded-4 p-3 mb-4 shadow-sm">
    <i class="fa-solid fa-triangle-exclamation text-warning fs-3"></i>
    <div class="small">
      <strong>Quality Assessment Disclaimer:</strong> AI visual assessment is based strictly on visible chromatic and topological characteristics in the uploaded photos. Results are indicative and should not be considered a laboratory-grade food safety, chemical residue, or disease diagnosis.
    </div>
  </div>

  <!-- Demo Quick-Fill Bar -->
  <div class="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-light text-center">
    <div class="d-flex flex-wrap align-items-center justify-content-center gap-3">
      <span class="small fw-bold text-muted">QUICK DEMO PRESETS:</span>
      <button type="button" class="btn btn-sm btn-outline-success rounded-pill px-3" onclick="loadSampleDemo('tomato')">
        <i class="fa-solid fa-apple-whole me-1"></i> Fresh Tomato vs Blemished Field Tomato
      </button>
      <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3" onclick="resetForm()">
        <i class="fa-solid fa-rotate-left me-1"></i> Reset Images
      </button>
    </div>
  </div>

  <!-- Dual Upload Interface -->
  <form id="compareForm" enctype="multipart/form-data">
    <div class="row g-4 mb-4">
      <!-- Sample 1 -->
      <div class="col-md-6">
        <div class="card h-100 border shadow-sm rounded-4 p-4 text-center upload-box" id="drop1">
          <h5 class="fw-bold text-dark mb-1">Vegetable Sample #1</h5>
          <p class="text-muted small mb-3">Upload first image (e.g. Lot A or Sample 1)</p>

          <div class="preview-area border border-2 border-dashed rounded-4 p-3 d-flex flex-column align-items-center justify-content-center bg-light position-relative" style="min-height: 220px;">
            <img id="imgPreview1" src="" alt="Preview 1" class="img-fluid rounded-3 d-none" style="max-height: 200px; object-fit: contain;">
            <div id="placeholder1" class="text-muted">
              <i class="fa-solid fa-cloud-arrow-up fs-1 text-success mb-2"></i>
              <div class="fw-bold small">Click or Drag & Drop Image Here</div>
              <small class="text-secondary">JPG, PNG, WEBP (Max 5MB)</small>
            </div>
            <input type="file" name="file1" id="file1" class="opacity-0 position-absolute top-0 start-0 w-100 h-100 cursor-pointer" accept="image/jpeg,image/png,image/webp" required onchange="handleFileSelect(this, 1)">
          </div>
        </div>
      </div>

      <!-- Sample 2 -->
      <div class="col-md-6">
        <div class="card h-100 border shadow-sm rounded-4 p-4 text-center upload-box" id="drop2">
          <h5 class="fw-bold text-dark mb-1">Vegetable Sample #2</h5>
          <p class="text-muted small mb-3">Upload second image (e.g. Lot B or Sample 2)</p>

          <div class="preview-area border border-2 border-dashed rounded-4 p-3 d-flex flex-column align-items-center justify-content-center bg-light position-relative" style="min-height: 220px;">
            <img id="imgPreview2" src="" alt="Preview 2" class="img-fluid rounded-3 d-none" style="max-height: 200px; object-fit: contain;">
            <div id="placeholder2" class="text-muted">
              <i class="fa-solid fa-cloud-arrow-up fs-1 text-success mb-2"></i>
              <div class="fw-bold small">Click or Drag & Drop Image Here</div>
              <small class="text-secondary">JPG, PNG, WEBP (Max 5MB)</small>
            </div>
            <input type="file" name="file2" id="file2" class="opacity-0 position-absolute top-0 start-0 w-100 h-100 cursor-pointer" accept="image/jpeg,image/png,image/webp" required onchange="handleFileSelect(this, 2)">
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Action Button -->
    <div class="text-center mb-5">
      <button type="submit" id="submitBtn" class="btn btn-success btn-lg px-5 py-3 rounded-pill fw-bold shadow">
        <i class="fa-solid fa-wand-magic-sparkles me-2"></i> Compare Quality with AI
      </button>
    </div>
  </form>

  <!-- Loading State -->
  <div id="loadingBox" class="text-center py-5 d-none">
    <div class="spinner-border text-success" style="width: 3rem; height: 3rem;" role="status"></div>
    <h5 class="fw-bold mt-3">Analyzing Produce Characteristics...</h5>
    <p class="text-muted small">Extracting chromatic matrices, computing hydration index, and scanning for blemish defects.</p>
  </div>

  <!-- Error Alert -->
  <div id="errorAlert" class="alert alert-danger d-none rounded-4 p-3 mb-4"></div>

  <!-- Results Section -->
  <div id="resultsSection" class="d-none">
    <!-- Winner Card -->
    <div id="winnerCard" class="card border-0 shadow rounded-4 p-4 mb-4 text-white text-center" style="background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);">
      <span class="fs-1">🏆</span>
      <h3 class="fw-bold mb-1" id="winnerTitle">Comparison Result</h3>
      <p class="lead mb-0 text-light small" id="winnerReason">Details about recommendation.</p>
    </div>

    <div class="row g-4 mb-4">
      <!-- Sample 1 Metrics -->
      <div class="col-md-6">
        <div class="card h-100 border shadow-sm rounded-4 p-4" id="cardResult1">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0">Sample #1 Analysis</h5>
            <span class="badge fs-6 px-3 py-1 rounded-pill" id="gradeBadge1">Grade A+</span>
          </div>

          <div class="display-4 fw-bold text-success mb-2"><span id="score1">0</span> <span class="fs-5 text-muted font-normal">/ 100</span></div>

          <div class="d-flex flex-column gap-3 mb-4">
            <div>
              <div class="d-flex justify-content-between small fw-bold mb-1">
                <span>Freshness Index (40%)</span>
                <span id="fresh1">0%</span>
              </div>
              <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-success rounded-pill" id="freshBar1" style="width: 0%"></div>
              </div>
            </div>

            <div>
              <div class="d-flex justify-content-between small fw-bold mb-1">
                <span>Color Consistency (20%)</span>
                <span id="color1">0%</span>
              </div>
              <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-info rounded-pill" id="colorBar1" style="width: 0%"></div>
              </div>
            </div>

            <div>
              <div class="d-flex justify-content-between small fw-bold mb-1">
                <span>Size & Shape Uniformity (20%)</span>
                <span id="shape1">0%</span>
              </div>
              <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-primary rounded-pill" id="shapeBar1" style="width: 0%"></div>
              </div>
            </div>

            <div>
              <div class="d-flex justify-content-between small fw-bold mb-1">
                <span>Defect-Free Score (20%)</span>
                <span id="defect1">0%</span>
              </div>
              <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-warning rounded-pill" id="defectBar1" style="width: 0%"></div>
              </div>
            </div>
          </div>

          <h6 class="fw-bold small text-dark mb-2">Detected Characteristics & Defects:</h6>
          <ul class="small text-muted mb-0 ps-3" id="defectsList1"></ul>
        </div>
      </div>

      <!-- Sample 2 Metrics -->
      <div class="col-md-6">
        <div class="card h-100 border shadow-sm rounded-4 p-4" id="cardResult2">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0">Sample #2 Analysis</h5>
            <span class="badge fs-6 px-3 py-1 rounded-pill" id="gradeBadge2">Grade B</span>
          </div>

          <div class="display-4 fw-bold text-success mb-2"><span id="score2">0</span> <span class="fs-5 text-muted font-normal">/ 100</span></div>

          <div class="d-flex flex-column gap-3 mb-4">
            <div>
              <div class="d-flex justify-content-between small fw-bold mb-1">
                <span>Freshness Index (40%)</span>
                <span id="fresh2">0%</span>
              </div>
              <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-success rounded-pill" id="freshBar2" style="width: 0%"></div>
              </div>
            </div>

            <div>
              <div class="d-flex justify-content-between small fw-bold mb-1">
                <span>Color Consistency (20%)</span>
                <span id="color2">0%</span>
              </div>
              <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-info rounded-pill" id="colorBar2" style="width: 0%"></div>
              </div>
            </div>

            <div>
              <div class="d-flex justify-content-between small fw-bold mb-1">
                <span>Size & Shape Uniformity (20%)</span>
                <span id="shape2">0%</span>
              </div>
              <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-primary rounded-pill" id="shapeBar2" style="width: 0%"></div>
              </div>
            </div>

            <div>
              <div class="d-flex justify-content-between small fw-bold mb-1">
                <span>Defect-Free Score (20%)</span>
                <span id="defect2">0%</span>
              </div>
              <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-warning rounded-pill" id="defectBar2" style="width: 0%"></div>
              </div>
            </div>
          </div>

          <h6 class="fw-bold small text-dark mb-2">Detected Characteristics & Defects:</h6>
          <ul class="small text-muted mb-0 ps-3" id="defectsList2"></ul>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
function handleFileSelect(input, index) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById(`imgPreview${index}`).src = e.target.result;
      document.getElementById(`imgPreview${index}`).classList.remove('d-none');
      document.getElementById(`placeholder${index}`).classList.add('d-none');
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function resetForm() {
  document.getElementById('compareForm').reset();
  [1, 2].forEach(i => {
    document.getElementById(`imgPreview${i}`).src = '';
    document.getElementById(`imgPreview${i}`).classList.add('d-none');
    document.getElementById(`placeholder${i}`).classList.remove('d-none');
  });
  document.getElementById('resultsSection').classList.add('d-none');
  document.getElementById('errorAlert').classList.add('d-none');
}

async function loadSampleDemo(type) {
  try {
    const res1 = await fetch('/assets/images/sample_tomato.svg');
    const blob1 = await res1.blob();
    const file1 = new File([blob1], 'fresh_tomato.png', { type: 'image/png' });

    const res2 = await fetch('/assets/images/sample_tomato_blemished.svg');
    const blob2 = await res2.blob();
    const file2 = new File([blob2], 'blemished_tomato.png', { type: 'image/png' });

    const dt1 = new DataTransfer();
    dt1.items.add(file1);
    document.getElementById('file1').files = dt1.files;
    handleFileSelect(document.getElementById('file1'), 1);

    const dt2 = new DataTransfer();
    dt2.items.add(file2);
    document.getElementById('file2').files = dt2.files;
    handleFileSelect(document.getElementById('file2'), 2);
  } catch (err) {
    console.error('Failed to load sample SVGs:', err);
  }
}

document.getElementById('compareForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const file1 = document.getElementById('file1').files[0];
  const file2 = document.getElementById('file2').files[0];

  if (!file1 || !file2) {
    alert('Please upload both images to perform comparison.');
    return;
  }

  const formData = new FormData();
  formData.append('file1', file1);
  formData.append('file2', file2);

  const loading = document.getElementById('loadingBox');
  const results = document.getElementById('resultsSection');
  const errorAlert = document.getElementById('errorAlert');

  loading.classList.remove('d-none');
  results.classList.add('d-none');
  errorAlert.classList.add('d-none');

  try {
    // Try node backend proxy or python flask backend
    let response = await fetch('/api/compare-vegetables', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    loading.classList.add('d-none');

    if (!data.success) {
      errorAlert.innerText = data.error || 'Failed to compare images.';
      errorAlert.classList.remove('d-none');
      return;
    }

    renderResults(data);
  } catch (err) {
    loading.classList.add('d-none');
    errorAlert.innerText = 'Service error while communicating with AI vision processor: ' + err.message;
    errorAlert.classList.remove('d-none');
  }
});

function renderResults(data) {
  const r1 = data.image1;
  const r2 = data.image2;
  const cmp = data.comparison;

  // Render Sample 1
  document.getElementById('score1').innerText = r1.overall_score;
  document.getElementById('fresh1').innerText = `${r1.freshness}%`;
  document.getElementById('freshBar1').style.width = `${r1.freshness}%`;
  document.getElementById('color1').innerText = `${r1.color_consistency}%`;
  document.getElementById('colorBar1').style.width = `${r1.color_consistency}%`;
  document.getElementById('shape1').innerText = `${r1.size_shape}%`;
  document.getElementById('shapeBar1').style.width = `${r1.size_shape}%`;
  document.getElementById('defect1').innerText = `${r1.defect_free}%`;
  document.getElementById('defectBar1').style.width = `${r1.defect_free}%`;
  document.getElementById('gradeBadge1').innerText = `Grade ${r1.grade}`;
  document.getElementById('gradeBadge1').className = `badge fs-6 px-3 py-1 rounded-pill ${getGradeBadgeClass(r1.grade)}`;
  document.getElementById('defectsList1').innerHTML = r1.defects.map(d => `<li>${d}</li>`).join('');

  // Render Sample 2
  document.getElementById('score2').innerText = r2.overall_score;
  document.getElementById('fresh2').innerText = `${r2.freshness}%`;
  document.getElementById('freshBar2').style.width = `${r2.freshness}%`;
  document.getElementById('color2').innerText = `${r2.color_consistency}%`;
  document.getElementById('colorBar2').style.width = `${r2.color_consistency}%`;
  document.getElementById('shape2').innerText = `${r2.size_shape}%`;
  document.getElementById('shapeBar2').style.width = `${r2.size_shape}%`;
  document.getElementById('defect2').innerText = `${r2.defect_free}%`;
  document.getElementById('defectBar2').style.width = `${r2.defect_free}%`;
  document.getElementById('gradeBadge2').innerText = `Grade ${r2.grade}`;
  document.getElementById('gradeBadge2').className = `badge fs-6 px-3 py-1 rounded-pill ${getGradeBadgeClass(r2.grade)}`;
  document.getElementById('defectsList2').innerHTML = r2.defects.map(d => `<li>${d}</li>`).join('');

  // Winner
  if (cmp.winner === 'image1') {
    document.getElementById('winnerTitle').innerText = `Sample #1 Recommended (Winner)`;
  } else if (cmp.winner === 'image2') {
    document.getElementById('winnerTitle').innerText = `Sample #2 Recommended (Winner)`;
  } else {
    document.getElementById('winnerTitle').innerText = `Equal Quality Assessment (Tie)`;
  }
  document.getElementById('winnerReason').innerText = cmp.reason;

  document.getElementById('resultsSection').classList.remove('d-none');
  document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function getGradeBadgeClass(grade) {
  if (grade === 'A+' || grade === 'A') return 'bg-success';
  if (grade === 'B') return 'bg-warning text-dark';
  return 'bg-danger';
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
