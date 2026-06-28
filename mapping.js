// ===== GPS Mapping Page Logic =====

let map;
let fieldLayers = [];
let heatmapVisible = false;
let drawingMode = false;
let drawPoints = [];

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  animateMapStats();
  populateFieldList();
  populateTreatmentHistory();
  Animate.staggerIn(document.querySelector('.stats-grid'), '.stat-card');
});

// --- Initialize Leaflet Map ---
function initMap() {
  map = L.map('fieldMap', {
    center: [28.6500, 76.9800],
    zoom: 13,
    zoomControl: false
  });

  // Add satellite-style tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 20
  }).addTo(map);

  L.control.zoom({ position: 'topright' }).addTo(map);

  map.on('mousemove', (e) => {
    document.getElementById('coordLat').textContent = e.latlng.lat.toFixed(6);
    document.getElementById('coordLng').textContent = e.latlng.lng.toFixed(6);
  });

  map.on('zoomend', () => {
    document.getElementById('coordZoom').textContent = map.getZoom();
  });

  addSimulatedFields();
}

// --- Delhi Farm Fields ---
function addSimulatedFields() {
  const fields = [
    {
      name: 'Najafgarh Farm Field',
      crop: 'Wheat',
      area: 42.5,
      center: [28.6118, 76.9797],
      bounds: [
        [28.615, 76.973], [28.615, 76.987],
        [28.608, 76.987], [28.608, 76.973]
      ],
      color: '#22c55e',
      weedZones: generateFieldWeedZones([28.6118, 76.9797], 10)
    },
    {
      name: 'Narela Agricultural Zone',
      crop: 'Rice',
      area: 38.2,
      center: [28.8527, 77.0928],
      bounds: [
        [28.856, 77.087], [28.856, 77.099],
        [28.849, 77.099], [28.849, 77.087]
      ],
      color: '#0ea5e9',
      weedZones: generateFieldWeedZones([28.8527, 77.0928], 8)
    },
    {
      name: 'Alipur Farmland',
      crop: 'Mustard',
      area: 31.0,
      center: [28.7950, 77.1340],
      bounds: [
        [28.798, 77.130], [28.798, 77.138],
        [28.792, 77.138], [28.792, 77.130]
      ],
      color: '#f59e0b',
      weedZones: generateFieldWeedZones([28.7950, 77.1340], 6)
    }
  ];

  fields.forEach(field => {
    const polygon = L.polygon(field.bounds, {
      color: field.color,
      fillColor: field.color,
      fillOpacity: 0.1,
      weight: 2,
      dashArray: '5, 5'
    }).addTo(map);

    polygon.bindPopup(`
      <div style="font-family:Inter;min-width:200px;">
        <h4 style="margin:0 0 8px;font-family:Outfit;color:#166534;">${field.name}</h4>
        <p style="margin:2px 0;color:#333;"><strong>Crop:</strong> ${field.crop}</p>
        <p style="margin:2px 0;color:#333;"><strong>Area:</strong> ${field.area} ha</p>
        <p style="margin:2px 0;color:#333;"><strong>Location:</strong> Delhi NCR</p>
        <p style="margin:2px 0;color:#333;"><strong>Status:</strong> <span style="color:#16a34a;">Active</span></p>
      </div>
    `);

    fieldLayers.push({ polygon, field });

    L.circleMarker(field.center, {
      radius: 6, fillColor: field.color, fillOpacity: 0.9,
      color: 'white', weight: 2
    }).addTo(map).bindTooltip(field.name, {
      permanent: false, direction: 'top',
      className: 'field-tooltip'
    });

    field.weedZones.forEach(wz => {
      const circle = L.circle(wz.latlng, {
        radius: wz.radius,
        color: wz.color,
        fillColor: wz.color,
        fillOpacity: 0.35,
        weight: 1,
        className: 'weed-zone-marker'
      });
      circle._isWeedZone = true;
      circle._visible = false;
      wz.layer = circle;
    });

    field._weedZoneLayers = field.weedZones.map(wz => wz.layer);
  });

  const allBounds = fields.flatMap(f => f.bounds);
  map.fitBounds(allBounds, { padding: [40, 40] });
}

function generateFieldWeedZones(center, count) {
  const zones = [];
  for (let i = 0; i < count; i++) {
    const lat = center[0] + (Math.random() - 0.5) * 0.005;
    const lng = center[1] + (Math.random() - 0.5) * 0.008;
    const severity = Math.random();
    let color, radius;
    if (severity > 0.7) { color = '#f43f5e'; radius = 20 + Math.random() * 30; }
    else if (severity > 0.4) { color = '#f97316'; radius = 15 + Math.random() * 20; }
    else { color = '#fbbf24'; radius = 10 + Math.random() * 15; }
    zones.push({ latlng: [lat, lng], color, radius, severity });
  }
  return zones;
}

// --- Heatmap Toggle ---
function toggleHeatmap() {
  heatmapVisible = !heatmapVisible;
  const btn = document.getElementById('btnToggleHeatmap');
  
  fieldLayers.forEach(({ field }) => {
    if (field._weedZoneLayers) {
      field._weedZoneLayers.forEach(layer => {
        if (heatmapVisible) {
          layer.addTo(map);
        } else {
          map.removeLayer(layer);
        }
      });
    }
  });

  if (heatmapVisible) {
    btn.classList.add('active');
    btn.style.background = 'rgba(34, 197, 94, 0.2)';
    Toast.show('Weed density heatmap overlay enabled', 'success');
  } else {
    btn.classList.remove('active');
    btn.style.background = '';
    Toast.show('Heatmap overlay disabled', 'info');
  }
}

// --- Draw Field Mode ---
function startDrawField() {
  drawingMode = !drawingMode;
  const btn = document.getElementById('btnAddField');
  
  if (drawingMode) {
    drawPoints = [];
    btn.innerHTML = '<i data-lucide="check" style="width:14px;height:14px;"></i> Finish Drawing';
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-primary');
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    map.getContainer().style.cursor = 'crosshair';
    map.on('click', onDrawClick);
    Toast.show('Click on map to draw field boundary points. Click "Finish Drawing" when done.', 'info', 5000);
  } else {
    finishDrawing();
  }
}

let drawMarkers = [];
let drawPolyline = null;

function onDrawClick(e) {
  drawPoints.push([e.latlng.lat, e.latlng.lng]);
  
  const marker = L.circleMarker(e.latlng, {
    radius: 5, fillColor: '#22c55e', fillOpacity: 1,
    color: 'white', weight: 2
  }).addTo(map);
  drawMarkers.push(marker);

  if (drawPolyline) map.removeLayer(drawPolyline);
  if (drawPoints.length > 1) {
    drawPolyline = L.polyline(drawPoints, {
      color: '#22c55e', weight: 2, dashArray: '8, 4'
    }).addTo(map);
  }
}

function finishDrawing() {
  drawingMode = false;
  map.getContainer().style.cursor = '';
  map.off('click', onDrawClick);
  
  const btn = document.getElementById('btnAddField');
  btn.innerHTML = '<i data-lucide="pencil" style="width:14px;height:14px;"></i> Draw Field';
  btn.classList.remove('btn-primary');
  btn.classList.add('btn-secondary');
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Clean up markers and polyline
  drawMarkers.forEach(m => map.removeLayer(m));
  drawMarkers = [];
  if (drawPolyline) map.removeLayer(drawPolyline);
  drawPolyline = null;

  if (drawPoints.length >= 3) {
    // Create polygon
    const polygon = L.polygon(drawPoints, {
      color: '#a855f7', fillColor: '#a855f7',
      fillOpacity: 0.15, weight: 2
    }).addTo(map);

    polygon.bindPopup(`
      <div style="font-family:Inter;">
        <h4 style="margin:0 0 8px;font-family:Outfit;color:#7c3aed;">New Custom Field</h4>
        <p style="margin:2px 0;color:#333;"><strong>Points:</strong> ${drawPoints.length}</p>
        <p style="margin:2px 0;color:#333;"><strong>Status:</strong> Pending scan</p>
      </div>
    `);
    
    Toast.show(`New field boundary created with ${drawPoints.length} points`, 'success');
  } else if (drawPoints.length > 0) {
    Toast.show('Need at least 3 points to create a field boundary', 'warning');
  }

  drawPoints = [];
}

// --- Animate Stats ---
function animateMapStats() {
  Animate.counter(document.getElementById('totalFields'), 24);
  
  const areaEl = document.getElementById('totalArea');
  const areaTarget = 342;
  const startTime = performance.now();
  function updateArea(now) {
    const p = Math.min((now - startTime) / 2000, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    areaEl.textContent = Math.floor(areaTarget * eased) + ' ha';
    if (p < 1) requestAnimationFrame(updateArea);
  }
  requestAnimationFrame(updateArea);

  Animate.counter(document.getElementById('activeZones'), 156);
}

// --- Field List ---
function populateFieldList() {
  const container = document.getElementById('fieldList');
  const fields = [
    { name: 'Najafgarh Farm Field', crop: 'Wheat', area: '42.5 ha', status: 'active', weed: '18.4%' },
    { name: 'Narela Agricultural Zone', crop: 'Rice', area: '38.2 ha', status: 'active', weed: '12.1%' },
    { name: 'Alipur Farmland', crop: 'Mustard', area: '31.0 ha', status: 'active', weed: '24.7%' },
    { name: 'Dwarka Crop Field', crop: 'Vegetables', area: '22.8 ha', status: 'pending', weed: '—' },
    { name: 'Mehrauli Green Zone', crop: 'Wheat', area: '18.5 ha', status: 'active', weed: '9.3%' }
  ];

  container.innerHTML = fields.map(f => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.03);cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='rgba(34,197,94,0.04)'" onmouseout="this.style.background='transparent'">
      <div style="width:8px;height:8px;border-radius:50%;background:${f.status === 'active' ? 'var(--green-400)' : 'var(--amber-400)'};flex-shrink:0;"></div>
      <div style="flex:1;">
        <div style="font-size:0.85rem;font-weight:600;color:var(--text-primary);">${f.name}</div>
        <div style="font-size:0.72rem;color:var(--text-muted);">${f.crop} · ${f.area}</div>
      </div>
      <span style="font-size:0.78rem;color:${f.weed !== '—' && parseFloat(f.weed) > 15 ? 'var(--rose-400)' : 'var(--green-400)'};font-weight:600;">${f.weed}</span>
    </div>
  `).join('');
}

// --- Treatment History ---
function populateTreatmentHistory() {
  const container = document.getElementById('treatmentHistory');
  const history = [
    { date: 'Mar 26, 2026', field: 'Najafgarh Farm Field', action: 'Spot spray applied on weed patches', zones: 8, chemical: '2.4L Glufosinate' },
    { date: 'Mar 24, 2026', field: 'Narela Agricultural Zone', action: 'Targeted weed treatment done', zones: 5, chemical: '1.8L Atrazine' },
    { date: 'Mar 22, 2026', field: 'Alipur Farmland', action: 'Full field scan and treatment', zones: 12, chemical: '3.1L Fomesafen' },
    { date: 'Mar 20, 2026', field: 'Najafgarh Farm Field', action: 'Preventive spray applied', zones: 3, chemical: '0.9L 2,4-D' }
  ];

  container.innerHTML = history.map(h => `
    <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.03);">
      <div class="flex-between">
        <span style="font-size:0.82rem;font-weight:600;color:var(--text-primary);">${h.field}</span>
        <span style="font-size:0.7rem;color:var(--text-muted);">${h.date}</span>
      </div>
      <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px;">${h.action}</div>
      <div class="flex gap-1 mt-1">
        <span class="tag tag-sky">${h.zones} zones</span>
        <span class="tag tag-green">${h.chemical}</span>
      </div>
    </div>
  `).join('');
}
