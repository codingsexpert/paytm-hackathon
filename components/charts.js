// Dynamic SVG Charting Component for Agentic Devs Collective Platform
// Creates fully responsive, beautifully styled charts using vanilla SVG elements.

export function renderLineChart(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const width = container.clientWidth || 500;
  const height = 240;
  const padding = 40;

  const maxVal = Math.max(...data.map(d => d.members)) * 1.15;
  const minVal = 0;

  // Compute points
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.members - minVal) / (maxVal - minVal)) * (height - padding * 2);
    return { x, y, label: d.month, val: d.members };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // Create gradient path for area fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  let svgHtml = `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="var(--purple)" />
          <stop offset="100%" stop-color="var(--cyan)" />
        </linearGradient>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--cyan)" stop-opacity="0.25" />
          <stop offset="100%" stop-color="var(--cyan)" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      
      <!-- Grid lines -->
      ${[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = padding + pct * (height - padding * 2);
        const val = Math.round(maxVal - pct * (maxVal - minVal));
        return `
          <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="var(--border-glass)" stroke-dasharray="4" />
          <text x="${padding - 10}" y="${y + 4}" fill="var(--text-muted)" font-size="10" font-family="Outfit, sans-serif" text-anchor="end">${val}</text>
        `;
      }).join("")}

      <!-- Axis Labels -->
      ${points.map(p => `
        <text x="${p.x}" y="${height - padding + 20}" fill="var(--text-muted)" font-size="11" font-family="Outfit, sans-serif" text-anchor="middle">${p.label}</text>
      `).join("")}

      <!-- Area under line -->
      <path d="${areaD}" fill="url(#areaGrad)" />

      <!-- The Line -->
      <path d="${pathD}" fill="none" stroke="url(#lineGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Dots & Tooltips -->
      ${points.map(p => `
        <g class="chart-point-group">
          <circle cx="${p.x}" cy="${p.y}" r="5" fill="var(--cyan)" stroke="var(--bg-darker)" stroke-width="2" style="cursor: pointer; transition: r 0.2s;" />
          <circle cx="${p.x}" cy="${p.y}" r="12" fill="var(--cyan)" fill-opacity="0.15" style="opacity: 0; transition: opacity 0.2s;" class="hover-glow" />
          <text x="${p.x}" y="${p.y - 12}" fill="var(--text-main)" font-size="11" font-weight="bold" font-family="Outfit, sans-serif" text-anchor="middle" class="chart-tooltip" style="opacity: 0; transition: opacity 0.2s; pointer-events: none; background: var(--bg-card); padding: 2px;">
            ${p.val}
          </text>
        </g>
      `).join("")}
    </svg>
  `;

  container.innerHTML = svgHtml;
}

export function renderDonutChart(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const width = container.clientWidth || 300;
  const height = 240;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 70;
  const strokeWidth = 14;

  const total = data.reduce((acc, d) => acc + d.percentage, 0);
  let accumulatedAngle = -Math.PI / 2; // Start from top

  const colors = ["var(--cyan)", "var(--purple)", "var(--pink)", "#eab308"];

  let slices = [];
  data.forEach((d, idx) => {
    const angle = (d.percentage / total) * Math.PI * 2;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle = endAngle;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const pathD = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
    `;

    slices.push({
      pathD,
      color: colors[idx % colors.length],
      label: d.name,
      percentage: d.percentage
    });
  });

  let svgHtml = `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
      <!-- Center text -->
      <text x="${cx}" y="${cy - 4}" fill="var(--text-muted)" font-size="11" font-family="Outfit, sans-serif" text-anchor="middle">Agent Ecosystem</text>
      <text x="${cx}" y="${cy + 16}" fill="var(--text-main)" font-size="18" font-weight="bold" font-family="Outfit, sans-serif" text-anchor="middle">Share</text>

      ${slices.map((slice, idx) => `
        <g class="donut-slice-group" style="cursor: pointer;">
          <path d="${slice.pathD}" fill="none" stroke="${slice.color}" stroke-width="${strokeWidth}" stroke-linecap="round" style="transition: stroke-width 0.2s;" />
          <!-- Info display -->
        </g>
      `).join("")}
    </svg>
    <div class="donut-legend" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: -10px;">
      ${slices.map(slice => `
        <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted);">
          <span style="width: 10px; height: 10px; border-radius: 50%; background: ${slice.color}; display: inline-block;"></span>
          <span>${slice.label} (${slice.percentage}%)</span>
        </div>
      `).join("")}
    </div>
  `;

  container.innerHTML = svgHtml;
}

export function renderBarChart(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const width = container.clientWidth || 500;
  const height = 240;
  const padding = 45;
  const bottomPadding = 40;

  const maxVal = Math.max(...data.map(d => d.registrations)) * 1.1;

  const barCount = data.length;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding - bottomPadding;
  const barWidth = Math.min(45, (graphWidth / barCount) * 0.5);
  const gap = (graphWidth - barWidth * barCount) / (barCount + 1);

  const bars = data.map((d, i) => {
    const x = padding + gap + i * (barWidth + gap);
    const valHeight = (d.registrations / maxVal) * graphHeight;
    const y = height - bottomPadding - valHeight;
    return {
      x,
      y,
      w: barWidth,
      h: valHeight,
      label: d.chapter,
      val: d.registrations
    };
  });

  let svgHtml = `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--purple)" />
          <stop offset="100%" stop-color="var(--cyan)" />
        </linearGradient>
      </defs>

      <!-- Y Grid Lines -->
      ${[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = padding + pct * graphHeight;
        const val = Math.round(maxVal - pct * maxVal);
        return `
          <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="var(--border-glass)" stroke-dasharray="4" />
          <text x="${padding - 10}" y="${y + 4}" fill="var(--text-muted)" font-size="10" font-family="Outfit, sans-serif" text-anchor="end">${val}</text>
        `;
      }).join("")}

      <!-- Bars -->
      ${bars.map(bar => `
        <g class="bar-group">
          <!-- Glow background -->
          <rect x="${bar.x}" y="${bar.y}" width="${bar.w}" height="${bar.h}" fill="url(#barGrad)" rx="4" style="transition: opacity 0.2s;" opacity="0.9" />
          <!-- Text Value -->
          <text x="${bar.x + bar.w / 2}" y="${bar.y - 8}" fill="var(--text-main)" font-size="10" font-weight="bold" font-family="Outfit, sans-serif" text-anchor="middle" class="bar-val">${bar.val}</text>
          <!-- Label -->
          <text x="${bar.x + bar.w / 2}" y="${height - bottomPadding + 20}" fill="var(--text-muted)" font-size="11" font-family="Outfit, sans-serif" text-anchor="middle">${bar.label}</text>
        </g>
      `).join("")}
    </svg>
  `;

  container.innerHTML = svgHtml;
}
