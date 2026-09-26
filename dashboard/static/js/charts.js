/**
 * FinReAct Dashboard - Interactive Chart.js Engine
 * Renders high-resolution financial trajectory & cash flow conversion charts.
 */

let trajectoryChart = null;
let cashFlowChart = null;
let lastChartData = null;

// Chart.js Global Dark Theme Defaults
if (typeof Chart !== 'undefined') {
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.95)';
  Chart.defaults.plugins.tooltip.titleColor = '#f8fafc';
  Chart.defaults.plugins.tooltip.bodyColor = '#94a3b8';
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.1)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 6;
}

function initOrUpdateCharts(chartData) {
  if (!chartData || !chartData.labels) return;
  lastChartData = chartData;

  const labels = chartData.labels;

  // -------------------------------------------------------------------------
  // 1. Financial Trajectory (Revenue & Operating Profit)
  // -------------------------------------------------------------------------
  const ctxTraj = document.getElementById('financialTrajectoryChart');
  if (ctxTraj) {
    if (trajectoryChart) {
      trajectoryChart.destroy();
    }

    const opLabel = (typeof t === 'function') ? t('chartDatasetOperatingProfit') : '営業利益 (Operating Profit)';
    const npLabel = (typeof t === 'function') ? t('chartDatasetNetProfit') : '当期純利益 (Net Profit)';
    const revLabel = (typeof t === 'function') ? t('chartDatasetRevenue') : '売上高 (Revenue)';

    trajectoryChart = new Chart(ctxTraj, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            type: 'line',
            label: opLabel,
            data: chartData.operating_profit,
            borderColor: '#00f2fe',
            backgroundColor: 'rgba(0, 242, 254, 0.15)',
            borderWidth: 2.5,
            pointBackgroundColor: '#00f2fe',
            pointRadius: 4,
            tension: 0.3,
            yAxisID: 'y1'
          },
          {
            type: 'line',
            label: npLabel,
            data: chartData.net_profit,
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            borderWidth: 2,
            borderDash: [4, 4],
            pointBackgroundColor: '#a855f7',
            pointRadius: 3,
            tension: 0.3,
            yAxisID: 'y1'
          },
          {
            type: 'bar',
            label: revLabel,
            data: chartData.revenue,
            backgroundColor: 'rgba(79, 172, 254, 0.35)',
            borderColor: 'rgba(79, 172, 254, 0.8)',
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            title: {
              display: true,
              text: 'Revenue'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            title: {
              display: true,
              text: 'Profits'
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12, padding: 12 }
          }
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // 2. Cash Flow Quality (OCF vs Capex vs FCF)
  // -------------------------------------------------------------------------
  const ctxCF = document.getElementById('cashFlowChart');
  if (ctxCF) {
    if (cashFlowChart) {
      cashFlowChart.destroy();
    }

    const fcfLabel = (typeof t === 'function') ? t('chartDatasetFCF') : 'フリーCF (FCF)';
    const ocfLabel = (typeof t === 'function') ? t('chartDatasetOperatingCF') : '営業CF (OCF)';

    cashFlowChart = new Chart(ctxCF, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            type: 'line',
            label: fcfLabel,
            data: chartData.fcf,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderWidth: 2.5,
            pointBackgroundColor: '#10b981',
            pointRadius: 4,
            tension: 0.3
          },
          {
            type: 'bar',
            label: ocfLabel,
            data: chartData.operating_cf,
            backgroundColor: 'rgba(16, 185, 129, 0.45)',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            title: {
              display: true,
              text: 'Cash Flow'
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12, padding: 12 }
          }
        }
      }
    });
  }
}

// Re-render charts when language changes
if (typeof window !== 'undefined') {
  window.addEventListener('languageChanged', () => {
    if (lastChartData) {
      initOrUpdateCharts(lastChartData);
    }
  });
}
