/* ============================================================
   ADMIN STATISTICS – Chart.js Dashboard
   ============================================================ */

// Shared Chart.js defaults
const PINK_GRADIENT = (ctx) => {
  const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
  g.addColorStop(0, 'rgba(244, 114, 182, 0.35)');
  g.addColorStop(1, 'rgba(244, 114, 182, 0.02)');
  return g;
};

const BLUE_GRADIENT = (ctx) => {
  const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
  g.addColorStop(0, 'rgba(96, 165, 250, 0.35)');
  g.addColorStop(1, 'rgba(96, 165, 250, 0.02)');
  return g;
};

const GREEN_GRADIENT = (ctx) => {
  const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
  g.addColorStop(0, 'rgba(52, 211, 153, 0.35)');
  g.addColorStop(1, 'rgba(52, 211, 153, 0.02)');
  return g;
};

const LEVEL_COLORS = {
  N5: { bg: 'rgba(52, 211, 153, 0.75)', border: '#34d399' },
  N4: { bg: 'rgba(96, 165, 250, 0.75)', border: '#60a5fa' },
  N3: { bg: 'rgba(251, 191, 36, 0.75)', border: '#fbbf24' },
  N2: { bg: 'rgba(244, 114, 182, 0.75)', border: '#f472b6' },
  N1: { bg: 'rgba(167, 139, 250, 0.75)', border: '#a78bfa' },
};

const CHART_FONT = {
  family: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  size: 12,
  weight: 600,
};

// Chart instances (for destroy on re-render)
let chartStudents = null;
let chartEnrollments = null;
let chartRevenue = null;
let chartLevel = null;

function formatVND(value) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace(/\.0$/, '') + ' tr';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(0) + 'k';
  }
  return String(value);
}

function formatVNDFull(value) {
  return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';
}

function formatMonthLabel(ym) {
  // ym = "2025-06"
  const parts = ym.split('-');
  return 'T' + parseInt(parts[1], 10) + '/' + parts[0];
}

// ===================== FETCH DATA =====================
async function fetchStatistics(fromDate, toDate) {
  const tokens = typeof getAuthTokens === 'function' ? getAuthTokens() : null;
  if (!tokens || !tokens.access) {
    alert('Cần đăng nhập admin để xem thống kê.');
    return null;
  }

  const params = new URLSearchParams();
  if (fromDate) params.set('from_date', fromDate);
  if (toDate) params.set('to_date', toDate);

  const qs = params.toString();
  const url = `${API_BASE_URL}/admin/statistics/${qs ? '?' + qs : ''}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${tokens.access}` }
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Stats API error:', err);
      return null;
    }
    return await response.json();
  } catch (e) {
    console.error('Fetch stats error:', e);
    return null;
  }
}

// ===================== RENDER OVERVIEW =====================
function renderOverview(overview) {
  const el = (id, val) => {
    const node = document.getElementById(id);
    if (node) node.textContent = val;
  };
  el('statTotalStudents', overview.total_students.toLocaleString('vi-VN'));
  el('statTotalCourses', overview.total_courses.toLocaleString('vi-VN'));
  el('statTotalEnrollments', overview.total_enrollments.toLocaleString('vi-VN'));
  el('statTotalRevenue', formatVNDFull(overview.total_revenue));
  el('statRangeRevenue', formatVNDFull(overview.revenue_in_range));
}

// ===================== RENDER CHARTS =====================
function createLineChart(canvasId, labels, data, color, gradientFn, label) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  return new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label,
        data,
        borderColor: color,
        backgroundColor: gradientFn,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#fff',
        pointBorderColor: color,
        pointBorderWidth: 2.5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: color,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.88)',
          titleFont: CHART_FONT,
          bodyFont: CHART_FONT,
          padding: 12,
          cornerRadius: 12,
          displayColors: false,
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: CHART_FONT, color: '#9d174d' }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(244,114,182,0.08)' },
          ticks: { font: CHART_FONT, color: '#9d174d' }
        }
      }
    }
  });
}

function renderStudentsChart(data) {
  if (chartStudents) chartStudents.destroy();
  const labels = data.map(d => formatMonthLabel(d.month));
  const values = data.map(d => d.count);
  chartStudents = createLineChart('chartStudents', labels, values, '#f472b6', PINK_GRADIENT, 'Học viên mới');
}

function renderEnrollmentsChart(data) {
  if (chartEnrollments) chartEnrollments.destroy();
  const labels = data.map(d => formatMonthLabel(d.month));
  const values = data.map(d => d.count);
  chartEnrollments = createLineChart('chartEnrollments', labels, values, '#60a5fa', BLUE_GRADIENT, 'Lượt đăng ký');
}

function renderRevenueChart(data) {
  if (chartRevenue) chartRevenue.destroy();
  const canvas = document.getElementById('chartRevenue');
  if (!canvas) return;

  const labels = data.map(d => formatMonthLabel(d.month));
  const values = data.map(d => d.total);

  chartRevenue = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Doanh thu',
        data: values,
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, ctx.chart.height, 0, 0);
          g.addColorStop(0, 'rgba(52, 211, 153, 0.25)');
          g.addColorStop(1, 'rgba(52, 211, 153, 0.85)');
          return g;
        },
        borderColor: '#34d399',
        borderWidth: 2,
        borderRadius: 10,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(52, 211, 153, 0.95)',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.88)',
          titleFont: CHART_FONT,
          bodyFont: CHART_FONT,
          padding: 12,
          cornerRadius: 12,
          displayColors: false,
          callbacks: {
            label: (ctx) => formatVNDFull(ctx.parsed.y)
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: CHART_FONT, color: '#9d174d' }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(244,114,182,0.08)' },
          ticks: {
            font: CHART_FONT,
            color: '#9d174d',
            callback: (v) => formatVND(v)
          }
        }
      }
    }
  });
}

function renderLevelChart(data) {
  if (chartLevel) chartLevel.destroy();
  const canvas = document.getElementById('chartLevel');
  if (!canvas) return;

  const labels = data.map(d => d.level);
  const values = data.map(d => d.count);
  const bgColors = labels.map(l => (LEVEL_COLORS[l] || { bg: 'rgba(107,114,128,0.5)' }).bg);
  const borderColors = labels.map(l => (LEVEL_COLORS[l] || { border: '#6b7280' }).border);

  chartLevel = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 2,
        hoverOffset: 14,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: CHART_FONT,
            color: '#9d174d',
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 12,
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.88)',
          titleFont: CHART_FONT,
          bodyFont: CHART_FONT,
          padding: 12,
          cornerRadius: 12,
          callbacks: {
            label: (ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
              return `${ctx.label}: ${ctx.parsed} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

// ===================== RENDER TABLE =====================
function renderCourseRevenueTable(courseRevenue) {
  const tbody = document.getElementById('courseRevenueBody');
  if (!tbody) return;

  if (!courseRevenue || courseRevenue.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-loading">Chưa có dữ liệu doanh thu khóa học.</td></tr>';
    return;
  }

  const totalRevenue = courseRevenue.reduce((sum, c) => sum + c.total_revenue, 0);

  tbody.innerHTML = courseRevenue.map((course, i) => {
    const pct = totalRevenue > 0 ? ((course.total_revenue / totalRevenue) * 100).toFixed(1) : 0;
    const levelClass = `level-${(course.level || '').toLowerCase()}`;
    return `
      <tr>
        <td class="td-index">${i + 1}</td>
        <td class="td-title">${escapeHtml(course.title)}</td>
        <td><span class="level-badge ${levelClass}">${course.level}</span></td>
        <td class="td-count">${course.enrollment_count}</td>
        <td class="td-revenue">${formatVNDFull(course.total_revenue)}</td>
        <td>
          <div class="pct-bar-wrapper">
            <div class="pct-bar" style="width: ${pct}%"></div>
            <span class="pct-text">${pct}%</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ===================== MAIN =====================
document.addEventListener('DOMContentLoaded', () => {
  initAdminShell();

  const dateFrom = document.getElementById('dateFrom');
  const dateTo = document.getElementById('dateTo');
  const btnApply = document.getElementById('btnApplyFilter');

  // Set default date range: 12 months ago to today
  const now = new Date();
  const yearAgo = new Date(now);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  if (dateFrom) dateFrom.value = yearAgo.toISOString().slice(0, 10);
  if (dateTo) dateTo.value = now.toISOString().slice(0, 10);

  async function loadStats() {
    const fromVal = dateFrom?.value || '';
    const toVal = dateTo?.value || '';

    // Show loading state on cards
    document.querySelectorAll('.ov-value').forEach(el => {
      el.textContent = '...';
      el.classList.add('loading');
    });

    const data = await fetchStatistics(fromVal, toVal);

    document.querySelectorAll('.ov-value').forEach(el => {
      el.classList.remove('loading');
    });

    if (!data) {
      document.getElementById('noDataState')?.removeAttribute('hidden');
      return;
    }

    document.getElementById('noDataState')?.setAttribute('hidden', '');

    // Overview
    renderOverview(data.overview);

    // Charts
    renderStudentsChart(data.students_chart || []);
    renderEnrollmentsChart(data.enrollment_chart || []);
    renderRevenueChart(data.revenue_chart || []);
    renderLevelChart(data.level_chart || []);

    // Table
    renderCourseRevenueTable(data.course_revenue || []);
  }

  btnApply?.addEventListener('click', loadStats);

  // Initial load
  loadStats();
});
