// ===== Field Analysis Page Logic — Backend-Connected =====

let currentAnalysis = null;
let currentTreatmentPlan = null;
let currentImageFile = null;

document.addEventListener('DOMContentLoaded', () => {
  initUploadZone();
  loadScanHistory();
  Animate.staggerIn(document.querySelector('.stats-grid'), '.stat-card');
});

// --- Upload Zone Setup ---
function initUploadZone() {
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');

  uploadArea.addEventListener('click', (e) => {
    if (!e.target.closest('button')) fileInput.click();
  });

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageSelected(file);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleImageSelected(e.target.files[0]);
  });
}

// --- Handle Image Selection ---
function handleImageSelected(file) {
  currentImageFile = file;

  const uploadArea = document.getElementById('uploadArea');
  const uploadDefault = document.getElementById('uploadDefault');
  const imagePreview = document.getElementById('imagePreview');
  const previewImg = document.getElementById('previewImg');
  const previewFileName = document.getElementById('previewFileName');
  const previewFileSize = document.getElementById('previewFileSize');
  const btnClear = document.getElementById('btnClearImage');

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    previewFileName.textContent = file.name;
    previewFileSize.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    uploadDefault.style.display = 'none';
    imagePreview.style.display = 'block';
    uploadArea.classList.add('has-image');
    btnClear.style.display = 'inline-flex';

    // Update step indicator
    setStep(1, 'completed');
  };
  reader.readAsDataURL(file);
}

function clearUpload() {
  currentImageFile = null;
  currentAnalysis = null;
  const uploadArea = document.getElementById('uploadArea');
  document.getElementById('uploadDefault').style.display = '';
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('btnClearImage').style.display = 'none';
  uploadArea.classList.remove('has-image');
  document.getElementById('fileInput').value = '';

  document.getElementById('resultsSection').classList.add('hidden');
  document.getElementById('treatmentSection').classList.add('hidden');

  resetSteps();
}

// --- Step Indicator ---
function setStep(step, state) {
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`step${i}`);
    el.classList.remove('active', 'completed');
    if (i < step || (i === step && state === 'completed')) el.classList.add('completed');
    else if (i === step) el.classList.add('active');
  }
  if (step >= 2) document.getElementById('line1').style.width = '100%';
  if (step >= 3) document.getElementById('line2').style.width = '100%';
}

function resetSteps() {
  document.getElementById('step1').className = 'step active';
  document.getElementById('step2').className = 'step';
  document.getElementById('step3').className = 'step';
  document.getElementById('line1').style.width = '0%';
  document.getElementById('line2').style.width = '0%';
}

// --- Start Analysis (Backend API) ---
function startAnalysis() {
  if (!currentImageFile) {
    Toast.show('Please upload an image first', 'warning');
    return;
  }

  setStep(2, 'active');
  const processingCard = document.getElementById('processingCard');
  const processingBody = document.getElementById('processingBody');
  const processingStatus = document.getElementById('processingStatus');

  processingCard.style.display = '';
  processingStatus.innerHTML = '<span class="spinner" style="width:10px;height:10px;"></span> Running...';
  processingStatus.className = 'tag tag-amber';

  processingBody.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div class="flex-between"><span style="font-size:0.82rem;color:var(--text-secondary);">Uploading image...</span><span class="spinner" style="width:14px;height:14px;"></span></div>
      <div class="progress-bar"><div class="progress-fill" id="uploadProgress" style="width:0%;transition:width 0.3s;"></div></div>
      <div style="font-size:0.75rem;color:var(--text-muted);">Model: ResNet-50 v2.4 · Running inference on server</div>
    </div>
  `;

  // Animate upload progress
  let prog = 0;
  const progBar = document.getElementById('uploadProgress');
  const progInterval = setInterval(() => {
    prog += Math.random() * 12;
    if (prog > 90) prog = 90;
    progBar.style.width = prog + '%';
  }, 200);

  // Upload to backend
  const formData = new FormData();
  formData.append('image', currentImageFile);

  fetch('/api/analyze', { method: 'POST', body: formData })
    .then(res => {
      if (!res.ok) return res.text().then(t => { throw new Error(t || 'Server error ' + res.status); });
      return res.json();
    })
    .then(data => {
      clearInterval(progInterval);
      progBar.style.width = '100%';

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setTimeout(() => {
        currentAnalysis = data.analysis;
        currentTreatmentPlan = data.treatmentPlan;

        // Update processing card
        processingStatus.innerHTML = '● Complete';
        processingStatus.className = 'tag tag-green';
        processingBody.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:6px;">
            <div class="flex-between"><span style="font-size:0.82rem;color:var(--text-muted);">Scan ID</span><span style="font-weight:600;font-family:monospace;font-size:0.8rem;">${data.analysis.scanId}</span></div>
            <div class="flex-between"><span style="font-size:0.82rem;color:var(--text-muted);">Inference Time</span><span style="font-weight:600;color:var(--green-400);">${data.analysis.inferenceTime}</span></div>
            <div class="flex-between"><span style="font-size:0.82rem;color:var(--text-muted);">Detections</span><span style="font-weight:700;font-size:1.1rem;">${data.analysis.summary.totalDetections}</span></div>
            <div class="flex-between"><span style="font-size:0.82rem;color:var(--text-muted);">Severity</span><span class="tag tag-${data.analysis.summary.overallSeverity === 'high' ? 'rose' : data.analysis.summary.overallSeverity === 'medium' ? 'amber' : 'green'}">${data.analysis.summary.overallSeverity.toUpperCase()}</span></div>
          </div>
        `;

        // Show results
        setStep(2, 'completed');
        showDetectionResults(data.analysis);
        drawDetectionOverlay(data.imagePath, data.analysis.detections);
        document.getElementById('resultsSection').classList.remove('hidden');

        // Update total scans counter
        const scanEl = document.getElementById('totalScans');
        if (scanEl) scanEl.textContent = parseInt(scanEl.textContent || 0) + 1;

        loadScanHistory();
        Toast.show(`Detected ${data.analysis.summary.totalDetections} weed instances — ${data.analysis.summary.uniqueSpecies} species identified`, 'success');
      }, 500);
    })
    .catch(err => {
      clearInterval(progInterval);
      processingStatus.innerHTML = '● Error';
      processingStatus.className = 'tag tag-rose';
      processingBody.innerHTML = `<p style="color:var(--rose-400);font-size:0.85rem;">${err.message}</p>`;
      Toast.show('Analysis failed: ' + err.message, 'error');
    });
}

// --- Show Detection Results Panel ---
function showDetectionResults(analysis) {
  const resultsBody = document.getElementById('resultsBody');
  const { summary, speciesSummary, detections } = analysis;

  resultsBody.innerHTML = `
    <div class="analysis-summary-grid">
      <div class="summary-stat"><div class="val text-green">${summary.totalDetections}</div><div class="lbl">Detections</div></div>
      <div class="summary-stat"><div class="val text-sky">${(summary.avgConfidence * 100).toFixed(1)}%</div><div class="lbl">Avg Confidence</div></div>
      <div class="summary-stat"><div class="val text-amber">${summary.weedCoverage}%</div><div class="lbl">Weed Coverage</div></div>
    </div>

    <div style="font-size:0.78rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Severity Breakdown</div>

    <div class="flex-between mb-1"><span class="tag tag-rose">High Risk</span><span style="font-weight:700;">${summary.severityBreakdown.high}</span></div>
    <div class="progress-bar mb-2"><div class="progress-fill rose" style="width:${(summary.severityBreakdown.high / summary.totalDetections * 100)}%;"></div></div>

    <div class="flex-between mb-1"><span class="tag tag-amber">Medium Risk</span><span style="font-weight:700;">${summary.severityBreakdown.medium}</span></div>
    <div class="progress-bar mb-2"><div class="progress-fill amber" style="width:${(summary.severityBreakdown.medium / summary.totalDetections * 100)}%;"></div></div>

    <div class="flex-between mb-1"><span class="tag tag-green">Low Risk</span><span style="font-weight:700;">${summary.severityBreakdown.low}</span></div>
    <div class="progress-bar mb-2"><div class="progress-fill" style="width:${(summary.severityBreakdown.low / summary.totalDetections * 100)}%;"></div></div>

    <div style="border-top:1px solid var(--border-color);margin:12px 0;"></div>
    <div style="font-size:0.78rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Species Detected (${summary.uniqueSpecies})</div>

    <div class="detection-list">
      ${speciesSummary.map(sp => `
        <div class="detection-item">
          <div class="det-color" style="background:${sp.color};"></div>
          <div class="det-info">
            <div class="det-name">${sp.name}</div>
            <div class="det-meta">${sp.family} · ${sp.count} instance${sp.count > 1 ? 's' : ''} · ${sp.herbicide}</div>
          </div>
          <div class="det-conf" style="color:${sp.color};">${(sp.avgConfidence * 100).toFixed(0)}%</div>
        </div>
      `).join('')}
    </div>

    <div style="border-top:1px solid var(--border-color);margin:12px 0;"></div>
    <div style="font-size:0.75rem;color:var(--text-muted);">
      <strong>Model:</strong> ${analysis.model} · <strong>Scan:</strong> ${analysis.scanId} · <strong>Time:</strong> ${analysis.inferenceTime}
    </div>
  `;

  document.getElementById('resultStatus').innerHTML = '● Complete';
}

// --- Draw Detection Overlay on Canvas ---
function drawDetectionOverlay(imageSrc, detections) {
  const canvas = document.getElementById('detectionCanvas');
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    const displayW = canvas.offsetWidth;
    const displayH = (img.height / img.width) * displayW;
    canvas.style.height = displayH + 'px';

    ctx.drawImage(img, 0, 0, img.width, img.height);

    detections.forEach((det, i) => {
      const box = det.bbox;
      const x = box.x * img.width;
      const y = box.y * img.height;
      const w = box.w * img.width;
      const h = box.h * img.height;

      setTimeout(() => {
        ctx.fillStyle = det.color + '25';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = det.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        const cornerLen = Math.min(w, h) * 0.25;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x, y + cornerLen); ctx.lineTo(x, y); ctx.lineTo(x + cornerLen, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w - cornerLen, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cornerLen); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + h - cornerLen); ctx.lineTo(x, y + h); ctx.lineTo(x + cornerLen, y + h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w - cornerLen, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cornerLen); ctx.stroke();

        const label = `${det.species} ${(det.confidence * 100).toFixed(0)}%`;
        ctx.font = 'bold 11px Inter';
        const textW = ctx.measureText(label).width + 12;
        ctx.fillStyle = det.color + 'dd';
        ctx.beginPath();
        ctx.roundRect(x, y - 22, textW, 20, 4);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.fillText(label, x + 6, y - 8);
      }, i * 180);
    });

    setTimeout(() => {
      const infoW = 220;
      ctx.fillStyle = 'rgba(10, 15, 13, 0.85)';
      ctx.beginPath();
      ctx.roundRect(img.width - infoW - 10, img.height - 40, infoW, 30, 6);
      ctx.fill();
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`${detections.length} detections · ${currentAnalysis.model}`, img.width - infoW / 2 - 10, img.height - 20);
    }, detections.length * 180 + 200);
  };
  img.src = imageSrc;
}

function toggleDetectionBoxes() {
  Toast.show('Toggle detection boxes — re-analyze to refresh overlay', 'info');
}

function rerunAnalysis() {
  if (currentImageFile) startAnalysis();
  else Toast.show('Upload an image first', 'warning');
}

function newScan() {
  clearUpload();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Treatment Plan ---
function generateTreatmentPlan() {
  if (!currentTreatmentPlan) {
    Toast.show('Run analysis first', 'warning');
    return;
  }

  setStep(3, 'active');
  const plan = currentTreatmentPlan;

  const treatmentSection = document.getElementById('treatmentSection');
  treatmentSection.classList.remove('hidden');

  // Summary
  document.getElementById('treatmentSummary').innerHTML = `
    <div class="analysis-summary-grid" style="grid-template-columns:repeat(4,1fr);">
      <div class="summary-stat"><div class="val text-green">${plan.summary.treatedZones}</div><div class="lbl">Treated Zones</div></div>
      <div class="summary-stat"><div class="val text-sky">${plan.summary.cleanZones}</div><div class="lbl">Clean Zones</div></div>
      <div class="summary-stat"><div class="val text-amber">${plan.summary.totalHerbicideVolume}L</div><div class="lbl">Herbicide Volume</div></div>
      <div class="summary-stat"><div class="val text-rose">${plan.summary.reductionPercent}%</div><div class="lbl">Reduction vs Conv.</div></div>
    </div>
    <div class="flex-between mt-1" style="padding:8px 0;">
      <span style="font-size:0.82rem;color:var(--text-secondary);">Estimated Cost (Precision)</span>
      <span style="font-weight:700;color:var(--green-400);font-size:1.1rem;">₹${plan.summary.estimatedCost}</span>
    </div>
    <div class="flex-between" style="padding:4px 0;">
      <span style="font-size:0.82rem;color:var(--text-secondary);">Conventional Cost</span>
      <span style="font-weight:700;color:var(--rose-400);font-size:1.1rem;text-decoration:line-through;">₹${plan.summary.conventionalCost}</span>
    </div>
  `;

  drawTreatmentZones(plan);
  populateHerbicideTable(plan);

  setStep(3, 'completed');
  Toast.show('Treatment plan generated with zone-specific recommendations', 'success');
  treatmentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function drawTreatmentZones(plan) {
  const canvas = document.getElementById('treatmentZoneCanvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.scale(dpr, dpr);

  const w = canvas.offsetWidth, h = canvas.offsetHeight;
  const { rows, cols } = plan.gridSize;
  const padding = 12, gap = 4;
  const cellW = (w - padding * 2) / cols;
  const cellH = (h - padding * 2) / rows;

  ctx.fillStyle = 'rgba(10, 15, 13, 0.6)';
  ctx.fillRect(0, 0, w, h);

  const colors = {
    clean: { fill: 'rgba(34,197,94,0.3)', stroke: 'rgba(34,197,94,0.6)', text: '#4ade80' },
    low: { fill: 'rgba(251,191,36,0.3)', stroke: 'rgba(251,191,36,0.6)', text: '#fbbf24' },
    medium: { fill: 'rgba(249,115,22,0.35)', stroke: 'rgba(249,115,22,0.6)', text: '#f97316' },
    high: { fill: 'rgba(244,63,94,0.4)', stroke: 'rgba(244,63,94,0.7)', text: '#fb7185' }
  };

  plan.zones.forEach(zone => {
    const x = padding + zone.col * cellW + gap;
    const y = padding + zone.row * cellH + gap;
    const cw = cellW - gap * 2, ch = cellH - gap * 2;
    const color = colors[zone.severity];

    ctx.fillStyle = color.fill;
    ctx.strokeStyle = color.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 8); ctx.fill(); ctx.stroke();

    ctx.fillStyle = color.text;
    ctx.font = 'bold 12px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText(zone.zoneId, x + cw / 2, y + ch / 2 - 6);

    ctx.fillStyle = 'rgba(240,253,244,0.5)';
    ctx.font = '500 9px Inter';
    ctx.fillText(zone.recommendedDosage > 0 ? `${zone.recommendedDosage} L/ha` : 'No spray', x + cw / 2, y + ch / 2 + 10);
  });
}

function populateHerbicideTable(plan) {
  const tbody = document.getElementById('herbicideBody');
  const treated = plan.zones.filter(z => z.severity !== 'clean');

  tbody.innerHTML = treated.map(zone => {
    const sevClass = zone.severity === 'high' ? 'tag-rose' : zone.severity === 'medium' ? 'tag-amber' : 'tag-green';
    return `
      <tr>
        <td style="font-weight:600;">${zone.zoneId}</td>
        <td><span class="tag ${sevClass}">${zone.severity.charAt(0).toUpperCase() + zone.severity.slice(1)}</span></td>
        <td>${zone.herbicide}</td>
        <td style="font-weight:600;">${zone.recommendedDosage.toFixed(1)}</td>
        <td><span style="font-size:0.78rem;color:var(--text-muted);">${zone.action}</span></td>
      </tr>
    `;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// --- Scan History (from backend) ---
function loadScanHistory() {
  fetch('/api/history?limit=10')
    .then(r => r.json())
    .then(data => {
      if (!data.success) return;
      const container = document.getElementById('scanHistoryBody');
      const countEl = document.getElementById('scanCount');

      countEl.textContent = `${data.total} scans`;

      if (data.scans.length === 0) {
        container.innerHTML = '<div class="text-center" style="padding:20px;"><p class="text-muted" style="font-size:0.82rem;">No scans yet. Upload an image to get started.</p></div>';
        return;
      }

      container.innerHTML = data.scans.map(s => {
        const sevClass = s.overallSeverity === 'high' ? 'tag-rose' : s.overallSeverity === 'medium' ? 'tag-amber' : 'tag-green';
        const time = new Date(s.timestamp).toLocaleString();
        return `
          <div class="scan-history-item">
            <div style="width:56px;height:42px;border-radius:6px;background:var(--bg-input);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i data-lucide="image" style="width:20px;height:20px;color:var(--text-muted);"></i>
            </div>
            <div class="scan-info">
              <h5>${s.fileName}</h5>
              <p>${s.totalDetections} detections · ${time}</p>
            </div>
            <span class="tag ${sevClass}" style="flex-shrink:0;">${s.overallSeverity}</span>
          </div>
        `;
      }).join('');

      if (typeof lucide !== 'undefined') lucide.createIcons();
    })
    .catch(() => { /* Server not running yet, silently fail */ });
}
