// ===== Analytics & Insights Page Logic =====

let costChart = null;

document.addEventListener('DOMContentLoaded', () => {
  animateAnalyticsStats();
  initCostAnalysisChart();
  initSavingsBreakdown();
  renderEnvironmentalMetrics();
  initAccuracyTrendChart();
  initSeasonalChart();
  initSpeciesChart();
  Animate.staggerIn(document.querySelector('.stats-grid'), '.stat-card');
});

// --- Stat Animations ---
function animateAnalyticsStats() {
  const metrics = SimData.getEnvironmentalMetrics();
  
  Animate.decimalCounter(document.getElementById('statChemReduction'), metrics.chemicalReduction, 2000, '%');
  
  const savingsEl = document.getElementById('statSavings');
  const savingsTarget = 18420;
  const startTime = performance.now();
  function updateSavings(now) {
    const p = Math.min((now - startTime) / 2000, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    savingsEl.textContent = '₹' + Math.floor(savingsTarget * eased).toLocaleString();
    if (p < 1) requestAnimationFrame(updateSavings);
  }
  requestAnimationFrame(updateSavings);
  
  Animate.counter(document.getElementById('statBiodiversity'), metrics.biodiversityScore);
  Animate.decimalCounter(document.getElementById('statModelAcc'), 94.7, 2000, '%');
}

// --- Cost Savings Analysis Chart ---
function initCostAnalysisChart() {
  const ctx = document.getElementById('costAnalysisChart').getContext('2d');
  const data = SimData.generateCostData(12);
  
  costChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Traditional Spraying',
          data: data.traditional,
          backgroundColor: 'rgba(244, 63, 94, 0.6)',
          borderColor: '#f43f5e',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.7
        },
        {
          label: 'Precision (AgroVision)',
          data: data.precision,
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: '#22c55e',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.7
        }
      ]
    },
    options: {
      ...ChartHelper.baseOptions,
      scales: {
        ...ChartHelper.baseOptions.scales,
        y: {
          ...ChartHelper.baseOptions.scales.y,
          ticks: {
            ...ChartHelper.baseOptions.scales.y.ticks,
            callback: v => '₹' + v
          }
        }
      }
    }
  });
}

function switchCostView(view, btn) {
  // Update active tab
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  
  if (view === 'seasonal') {
    costChart.data.labels = ['Spring', 'Summer', 'Fall', 'Winter'];
    costChart.data.datasets[0].data = [3200, 4800, 2900, 1200];
    costChart.data.datasets[1].data = [1100, 1600, 950, 420];
  } else {
    const data = SimData.generateCostData(12);
    costChart.data.labels = data.labels;
    costChart.data.datasets[0].data = data.traditional;
    costChart.data.datasets[1].data = data.precision;
  }
  costChart.update();
}

// --- Savings Breakdown Doughnut ---
function initSavingsBreakdown() {
  const ctx = document.getElementById('savingsBreakdownChart').getContext('2d');
  ChartHelper.createDoughnut(ctx,
    ['Herbicide Reduction', 'Labor Optimization', 'Fuel Savings'],
    [12840, 4200, 1380],
    ['#22c55e', '#0ea5e9', '#f59e0b']
  );
}

// --- Environmental Impact Metrics Cards ---
function renderEnvironmentalMetrics() {
  const container = document.getElementById('envMetrics');
  const metrics = SimData.getEnvironmentalMetrics();
  
  const cards = [
    {
      icon: 'droplets',
      label: 'Chemical Reduction',
      value: metrics.chemicalReduction + '%',
      desc: 'Less herbicide applied vs conventional methods',
      color: 'green',
      progress: metrics.chemicalReduction
    },
    {
      icon: 'heart-pulse',
      label: 'Soil Health Index',
      value: metrics.soilHealthIndex + '/100',
      desc: 'Improved soil microbiome diversity',
      color: 'sky',
      progress: metrics.soilHealthIndex
    },
    {
      icon: 'trees',
      label: 'Biodiversity Score',
      value: metrics.biodiversityScore + '/100',
      desc: 'Non-target species preservation rate',
      color: 'amber',
      progress: metrics.biodiversityScore
    },
    {
      icon: 'shield-check',
      label: 'Water Contamination Risk',
      value: metrics.waterContamRisk + '%',
      desc: 'Groundwater contamination probability',
      color: 'green',
      progress: 100 - metrics.waterContamRisk,
      invertColor: true
    },
    {
      icon: 'cloud',
      label: 'Carbon Footprint',
      value: '-' + metrics.carbonFootprint + '%',
      desc: 'CO₂ reduction from optimized operations',
      color: 'sky',
      progress: metrics.carbonFootprint
    },
    {
      icon: 'flower-2',
      label: 'Pollinator Safety',
      value: metrics.pollinatorSafety + '%',
      desc: 'Pollinator population preservation rate',
      color: 'amber',
      progress: metrics.pollinatorSafety
    }
  ];

  container.innerHTML = cards.map(card => `
    <div class="card" style="padding:20px;">
      <div class="flex-between mb-2">
        <div class="stat-icon ${card.color}" style="width:36px;height:36px;">
          <i data-lucide="${card.icon}" style="width:18px;height:18px;"></i>
        </div>
        <span style="font-family:Outfit;font-size:1.5rem;font-weight:800;">${card.value}</span>
      </div>
      <h4 style="font-size:0.85rem;font-weight:600;margin-bottom:4px;">${card.label}</h4>
      <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:10px;">${card.desc}</p>
      <div class="progress-bar">
        <div class="progress-fill ${card.color === 'sky' ? 'sky' : card.color === 'amber' ? 'amber' : ''}" style="width:${card.progress}%;"></div>
      </div>
    </div>
  `).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
  Animate.staggerIn(container, '.card', 100);
}

// --- Adaptive Learning Accuracy Trend ---
function initAccuracyTrendChart() {
  const ctx = document.getElementById('accuracyTrendChart').getContext('2d');
  const data = SimData.generateAccuracyTrend(24);
  const labels = Array.from({ length: 24 }, (_, i) => `W${i + 1}`);

  ChartHelper.createLine(ctx, labels, [
    {
      label: 'Model Accuracy (%)',
      data: data,
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
      tension: 0.3,
      borderWidth: 2.5,
      pointRadius: 3,
      pointBackgroundColor: '#22c55e',
      pointBorderColor: '#0a0f0d',
      pointBorderWidth: 2
    },
    {
      label: 'Target (95%)',
      data: new Array(24).fill(95),
      borderColor: 'rgba(245, 158, 11, 0.5)',
      borderWidth: 1.5,
      borderDash: [6, 4],
      pointRadius: 0,
      fill: false
    }
  ], {
    scales: {
      ...ChartHelper.baseOptions.scales,
      y: {
        ...ChartHelper.baseOptions.scales.y,
        min: 70,
        max: 100,
        ticks: {
          ...ChartHelper.baseOptions.scales.y.ticks,
          callback: v => v + '%'
        }
      }
    }
  });
}

// --- Seasonal Comparison ---
function initSeasonalChart() {
  const ctx = document.getElementById('seasonalChart').getContext('2d');

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Chemical Usage', 'Cost Efficiency', 'Detection Accuracy', 'Coverage Area', 'Response Time', 'Yield Impact'],
      datasets: [
        {
          label: 'Current Season',
          data: [85, 88, 94, 82, 91, 87],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          borderWidth: 2,
          pointBackgroundColor: '#22c55e',
          pointRadius: 4
        },
        {
          label: 'Last Season',
          data: [62, 71, 86, 68, 75, 79],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#f59e0b',
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { color: '#5e7e6d', backdropColor: 'transparent', stepSize: 20, font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.06)' },
          angleLines: { color: 'rgba(255,255,255,0.06)' },
          pointLabels: { color: '#a3c4b5', font: { family: 'Inter', size: 11 } }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#a3c4b5', font: { family: 'Inter', size: 12 }, padding: 16, usePointStyle: true }
        },
        tooltip: ChartHelper.baseOptions.plugins.tooltip
      }
    }
  });
}

// --- Species Detection Performance ---
function initSpeciesChart() {
  const ctx = document.getElementById('speciesChart').getContext('2d');
  const species = SimData.weedSpecies.slice(0, 8);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: species.map(s => s.name),
      datasets: [
        {
          label: 'Precision (%)',
          data: species.map(() => 85 + Math.random() * 14),
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: '#22c55e',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'Recall (%)',
          data: species.map(() => 80 + Math.random() * 18),
          backgroundColor: 'rgba(14, 165, 233, 0.6)',
          borderColor: '#0ea5e9',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'F1-Score (%)',
          data: species.map(() => 82 + Math.random() * 16),
          backgroundColor: 'rgba(168, 85, 247, 0.6)',
          borderColor: '#a855f7',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    },
    options: {
      ...ChartHelper.baseOptions,
      indexAxis: 'y',
      scales: {
        x: {
          ...ChartHelper.baseOptions.scales.x,
          max: 100,
          ticks: { ...ChartHelper.baseOptions.scales.x.ticks, callback: v => v + '%' }
        },
        y: {
          ...ChartHelper.baseOptions.scales.y,
          ticks: { ...ChartHelper.baseOptions.scales.y.ticks, font: { family: 'Inter', size: 10 } }
        }
      }
    }
  });
}

function refreshAnalytics() {
  // Re-animate stats
  animateAnalyticsStats();
  renderEnvironmentalMetrics();
  Toast.show('Analytics data refreshed', 'success');
}
