// ===== AI Agricultural Platform — Shared Utilities =====

// --- Simulated Data Generators ---
const SimData = {
  // Weed species database — simple English names
  weedSpecies: [
    { name: 'Wild Pigweed', severity: 'high', herbicide: 'Glufosinate', color: '#f43f5e' },
    { name: 'Water Weed', severity: 'high', herbicide: 'Fomesafen', color: '#e11d48' },
    { name: 'Ragweed', severity: 'medium', herbicide: 'Atrazine', color: '#f97316' },
    { name: 'Bathua (Goosefoot)', severity: 'medium', herbicide: '2,4-D Amine', color: '#f59e0b' },
    { name: 'Motha (Nutsedge)', severity: 'low', herbicide: 'Dicamba', color: '#eab308' },
    { name: 'Foxtail Grass', severity: 'low', herbicide: 'Clethodim', color: '#84cc16' },
    { name: 'Jungle Grass', severity: 'medium', herbicide: 'Quizalofop', color: '#f97316' },
    { name: 'Wild Sorghum', severity: 'high', herbicide: 'Nicosulfuron', color: '#f43f5e' },
    { name: 'Makoy (Black Nightshade)', severity: 'medium', herbicide: 'Metribuzin', color: '#f59e0b' },
    { name: 'Doob Grass (Bermuda)', severity: 'low', herbicide: 'Pendimethalin', color: '#84cc16' }
  ],

  // Generate random detections
  generateDetections(count = 6) {
    const detections = [];
    for (let i = 0; i < count; i++) {
      const species = this.weedSpecies[Math.floor(Math.random() * this.weedSpecies.length)];
      detections.push({
        id: `DET-${Date.now()}-${i}`,
        species: species.name,
        confidence: (0.75 + Math.random() * 0.24).toFixed(2),
        severity: species.severity,
        herbicide: species.herbicide,
        color: species.color,
        x: 0.1 + Math.random() * 0.7,
        y: 0.1 + Math.random() * 0.7,
        w: 0.05 + Math.random() * 0.12,
        h: 0.05 + Math.random() * 0.12,
        timestamp: new Date()
      });
    }
    return detections;
  },

  // Generate treatment zones
  generateZones(rows = 4, cols = 6) {
    const zones = [];
    const severities = ['clean', 'low', 'medium', 'high'];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rand = Math.random();
        let severity;
        if (rand < 0.4) severity = 'clean';
        else if (rand < 0.65) severity = 'low';
        else if (rand < 0.85) severity = 'medium';
        else severity = 'high';

        zones.push({
          row: r, col: c,
          severity,
          weedDensity: severity === 'clean' ? 0 : severity === 'low' ? Math.random() * 15 : severity === 'medium' ? 15 + Math.random() * 25 : 40 + Math.random() * 40,
          recommendedDosage: severity === 'clean' ? 0 : severity === 'low' ? 0.5 : severity === 'medium' ? 1.2 : 2.0,
          status: 'pending'
        });
      }
    }
    return zones;
  },

  // Generate cost data
  generateCostData(months = 12) {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].slice(0, months);
    const traditional = labels.map(() => 800 + Math.random() * 600);
    const precision = traditional.map(v => v * (0.25 + Math.random() * 0.25));
    return { labels, traditional, precision };
  },

  // Generate field coordinates
  generateFieldCoords() {
    const baseLat = 28.6139 + (Math.random() - 0.5) * 0.5;
    const baseLng = 77.2090 + (Math.random() - 0.5) * 0.5;
    return {
      center: [baseLat, baseLng],
      bounds: [
        [baseLat - 0.005, baseLng - 0.008],
        [baseLat + 0.005, baseLng + 0.008]
      ]
    };
  },

  // Generate edge device data
  generateDevices() {
    return [
      { id: 'EDGE-001', name: 'Field Scanner Alpha', status: 'online', cpu: 45 + Math.random() * 30, gpu: 60 + Math.random() * 30, memory: 40 + Math.random() * 35, fps: 24 + Math.floor(Math.random() * 8), temp: 55 + Math.random() * 20, detections: Math.floor(Math.random() * 500), uptime: '4d 12h 33m' },
      { id: 'EDGE-002', name: 'Drone Unit Beta', status: 'online', cpu: 50 + Math.random() * 25, gpu: 55 + Math.random() * 35, memory: 50 + Math.random() * 25, fps: 20 + Math.floor(Math.random() * 10), detections: Math.floor(Math.random() * 300), uptime: '2d 8h 17m' },
      { id: 'EDGE-003', name: 'Sprayer Module Gamma', status: Math.random() > 0.3 ? 'online' : 'offline', cpu: 30 + Math.random() * 40, gpu: 40 + Math.random() * 30, memory: 35 + Math.random() * 30, fps: 28 + Math.floor(Math.random() * 5), detections: Math.floor(Math.random() * 200), uptime: '1d 3h 45m' },
      { id: 'EDGE-004', name: 'Perimeter Watch Delta', status: 'online', cpu: 20 + Math.random() * 30, gpu: 25 + Math.random() * 25, memory: 30 + Math.random() * 20, fps: 30 + Math.floor(Math.random() * 3), detections: Math.floor(Math.random() * 100), uptime: '6d 22h 11m' }
    ];
  },

  // Accuracy trend data
  generateAccuracyTrend(weeks = 24) {
    const data = [];
    let accuracy = 78;
    for (let i = 0; i < weeks; i++) {
      accuracy += (Math.random() * 2 - 0.3);
      if (accuracy > 98) accuracy = 97 + Math.random();
      if (accuracy < 75) accuracy = 76 + Math.random() * 2;
      data.push(parseFloat(accuracy.toFixed(1)));
    }
    return data;
  },

  // Environmental metrics
  getEnvironmentalMetrics() {
    return {
      chemicalReduction: 62 + Math.floor(Math.random() * 10),
      soilHealthIndex: 78 + Math.floor(Math.random() * 15),
      biodiversityScore: 85 + Math.floor(Math.random() * 10),
      waterContamRisk: 12 - Math.floor(Math.random() * 8),
      carbonFootprint: 34 + Math.floor(Math.random() * 10),
      pollinatorSafety: 91 + Math.floor(Math.random() * 8)
    };
  }
};

// --- Animation Utilities ---
const Animate = {
  // Counter animation
  counter(element, target, duration = 2000, suffix = '') {
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.floor(start + (target - start) * eased);
      element.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  },

  // Decimal counter
  decimalCounter(element, target, duration = 2000, suffix = '') {
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = (start + (target - start) * eased).toFixed(1);
      element.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  },

  // Stagger children fade-in
  staggerIn(parent, selector, delay = 80) {
    const items = parent.querySelectorAll(selector);
    items.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(16px)';
      item.style.transition = `opacity 0.4s ease ${i * delay}ms, transform 0.4s ease ${i * delay}ms`;
      requestAnimationFrame(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      });
    });
  }
};

// --- Chart Helpers (Chart.js wrappers) ---
const ChartHelper = {
  defaultColors: {
    green: { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e' },
    sky: { bg: 'rgba(14, 165, 233, 0.15)', border: '#0ea5e9' },
    amber: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b' },
    rose: { bg: 'rgba(244, 63, 94, 0.15)', border: '#f43f5e' },
    purple: { bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7' }
  },

  baseOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#a3c4b5', font: { family: 'Inter', size: 12 }, padding: 16, usePointStyle: true, pointStyleWidth: 10 }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 26, 22, 0.95)',
        titleColor: '#f0fdf4',
        bodyColor: '#a3c4b5',
        borderColor: 'rgba(34, 197, 94, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: { family: 'Outfit', weight: 600 },
        bodyFont: { family: 'Inter' }
      }
    },
    scales: {
      x: {
        ticks: { color: '#5e7e6d', font: { family: 'Inter', size: 11 } },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { color: 'rgba(255,255,255,0.06)' }
      },
      y: {
        ticks: { color: '#5e7e6d', font: { family: 'Inter', size: 11 } },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { color: 'rgba(255,255,255,0.06)' }
      }
    }
  },

  createLine(ctx, labels, datasets, options = {}) {
    return new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: { ...this.baseOptions, ...options }
    });
  },

  createBar(ctx, labels, datasets, options = {}) {
    return new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: { ...this.baseOptions, ...options }
    });
  },

  createDoughnut(ctx, labels, data, colors, options = {}) {
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { ...this.baseOptions.plugins.legend, position: 'bottom' },
          tooltip: this.baseOptions.plugins.tooltip
        },
        ...options
      }
    });
  }
};

// --- Toast Notification System ---
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'success', duration = 4000) {
    this.init();
    const icons = { success: 'check-circle', warning: 'alert-triangle', error: 'x-circle', info: 'info' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i data-lucide="${icons[type]}" style="width:18px;height:18px;"></i><span>${message}</span>`;
    this.container.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons({ attrs: { class: '' } });
    
    // Push to persistent notifications for important messages
    if (type === 'success' || type === 'warning' || type === 'error') {
      if (typeof AppState !== 'undefined') {
        AppState.addNotification(message, type);
      }
    }

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// --- Shared App State (sessionStorage) ---
const AppState = {
  get(key, defaultVal = null) {
    try {
      const val = sessionStorage.getItem('agrovision_' + key);
      return val ? JSON.parse(val) : defaultVal;
    } catch { return defaultVal; }
  },
  set(key, value) {
    try {
      sessionStorage.setItem('agrovision_' + key, JSON.stringify(value));
    } catch { /* quota exceeded */ }
  },
  addNotification(msg, type = 'info') {
    const notes = this.get('notifications', []);
    notes.unshift({ msg, type, time: new Date().toISOString(), read: false });
    if (notes.length > 30) notes.pop();
    this.set('notifications', notes);
    updateNotificationBadge();
  },
  getNotifications() { return this.get('notifications', []); },
  markAllRead() {
    const notes = this.get('notifications', []);
    notes.forEach(n => n.read = true);
    this.set('notifications', notes);
    updateNotificationBadge();
  }
};

function updateNotificationBadge() {
  const dots = document.querySelectorAll('.notification-dot');
  const notes = AppState.getNotifications();
  const unread = notes.filter(n => !n.read).length;
  dots.forEach(dot => {
    dot.style.display = unread > 0 ? 'block' : 'none';
  });
}

// --- Notification Panel ---
function toggleNotificationPanel() {
  let panel = document.getElementById('notifPanel');
  if (panel) {
    panel.remove();
    return;
  }
  const notes = AppState.getNotifications();
  panel = document.createElement('div');
  panel.id = 'notifPanel';
  panel.style.cssText = 'position:fixed;top:60px;right:20px;width:360px;max-height:480px;background:rgba(17,26,22,0.97);border:1px solid rgba(34,197,94,0.15);border-radius:12px;z-index:200;box-shadow:0 8px 32px rgba(0,0,0,0.5);overflow:hidden;backdrop-filter:blur(16px);';
  
  panel.innerHTML = `
    <div style="padding:14px 18px;border-bottom:1px solid rgba(34,197,94,0.1);display:flex;justify-content:space-between;align-items:center;">
      <h4 style="font-family:Outfit;font-size:0.95rem;font-weight:700;">Notifications</h4>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-sm btn-ghost" onclick="AppState.markAllRead();toggleNotificationPanel();toggleNotificationPanel();">Mark read</button>
        <button class="btn btn-sm btn-ghost" onclick="document.getElementById('notifPanel').remove();">✕</button>
      </div>
    </div>
    <div style="max-height:400px;overflow-y:auto;padding:8px;">
      ${notes.length === 0 ? '<p style="text-align:center;padding:30px;color:var(--text-muted);font-size:0.82rem;">No notifications yet</p>' :
        notes.map(n => {
          const icons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };
          const time = new Date(n.time);
          const ago = getTimeAgo(time);
          return `<div style="padding:10px 12px;border-radius:8px;margin-bottom:4px;font-size:0.82rem;color:var(--text-secondary);background:${n.read ? 'transparent' : 'rgba(34,197,94,0.04)'};border-left:3px solid ${n.read ? 'transparent' : n.type === 'success' ? 'var(--green-500)' : n.type === 'warning' ? 'var(--amber-500)' : n.type === 'error' ? 'var(--rose-500)' : 'var(--sky-500)'};">
            <div style="display:flex;align-items:flex-start;gap:8px;">
              <span>${icons[n.type] || 'ℹ️'}</span>
              <div style="flex:1;">${n.msg}</div>
            </div>
            <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;padding-left:26px;">${ago}</div>
          </div>`;
        }).join('')
      }
    </div>
  `;
  document.body.appendChild(panel);
  
  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', function closePanel(e) {
      if (!panel.contains(e.target) && !e.target.closest('.header-btn')) {
        panel.remove();
        document.removeEventListener('click', closePanel);
      }
    });
  }, 100);
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  return Math.floor(seconds / 86400) + 'd ago';
}

// --- Sidebar Navigation ---
function initSidebar() {
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:99;display:none;';
  document.body.appendChild(overlay);

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
    });
  }
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.style.display = 'none';
  });

  // Wire up notification buttons
  document.querySelectorAll('.header-btn').forEach(btn => {
    if (btn.querySelector('[data-lucide="bell"]') || btn.title === 'Notifications') {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNotificationPanel();
      });
    }
  });
}

// --- Page Init ---
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  if (typeof lucide !== 'undefined') lucide.createIcons();
  updateNotificationBadge();
});

// --- Format helpers ---
function formatNumber(n) { return n.toLocaleString(); }
function formatCurrency(n) { return '₹' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
function formatPercent(n) { return n.toFixed(1) + '%'; }
