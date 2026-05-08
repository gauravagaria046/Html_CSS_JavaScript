const CONFIG = {
  minTemp: 32,
  maxTemp: 104,
  defaultTemp: 68,
  gradientColors: [
    "#00eaff",
    "#0099ff",
    "#00ff73",
    "#ffdd00",
    "#ff8800",
    "#ff0044"
  ],
  gradientStops: [0, 0.25, 0.5, 0.7, 0.85, 1],
  labelTemps: [32, 44, 60, 76, 92, 104] // labels to show below ticks
};

const els = {
  track: document.getElementById("track"),
  mercury: document.getElementById("mercury"),
  knob: document.getElementById("knob"),
  scaleContainer: document.getElementById("scaleContainer"),
  root: document.documentElement,
  blurCircle: document.getElementById("blurCircle")
};

let currentTemp = CONFIG.defaultTemp;
let trackWidth = 0;
let knobBounds = { minX: 0, maxX: 0 };
let scaleItems = [];
let colorMap;

const lerp = (a, b, t) => a + (b - a) * t;

function mixColorInactiveActive(factor) {
  const c0 = { r: 0x64, g: 0x64, b: 0x64 };
  const c1 = { r: 0xff, g: 0xff, b: 0xff };
  const r = Math.round(lerp(c0.r, c1.r, factor));
  const g = Math.round(lerp(c0.g, c1.g, factor));
  const b = Math.round(lerp(c0.b, c1.b, factor));
  return `rgb(${r},${g},${b})`;
}

function createColorMap() {
  const stops = CONFIG.gradientStops;
  const colors = CONFIG.gradientColors.map((c) => gsap.utils.splitColor(c));
  return (t) => {
    t = Math.max(0, Math.min(1, t));
    for (let i = 0; i < stops.length - 1; i++) {
      const s0 = stops[i],
        s1 = stops[i + 1];
      if (t >= s0 && t <= s1) {
        const n = (t - s0) / (s1 - s0);
        const c0 = colors[i],
          c1 = colors[i + 1];
        return `rgb(${Math.round(lerp(c0[0], c1[0], n))},${Math.round(
          lerp(c0[1], c1[1], n)
        )},${Math.round(lerp(c0[2], c1[2], n))})`;
      }
    }
  };
}

function buildScale() {
  els.scaleContainer.innerHTML = "";
  scaleItems = [];

  for (let t = CONFIG.minTemp; t <= CONFIG.maxTemp; t++) {
    const mark = document.createElement("div");
    mark.className = "scale-mark";

    const tick = document.createElement("div");
    tick.className = "tick";
    mark.appendChild(tick);

    const value = document.createElement("div");
    value.className = "value";
    value.textContent = "";
    mark.appendChild(value);

    // if this temp is one of the 6 label temps, add a small label below
    if (CONFIG.labelTemps.includes(t)) {
      const labelBelow = document.createElement("div");
      labelBelow.className = "label-below";
      labelBelow.textContent = t + "°F";
      mark.appendChild(labelBelow);
    }

    mark.dataset.temp = t;
    els.scaleContainer.appendChild(mark);
    scaleItems.push(mark);
  }
}

/* keep label-below color matched with its mark tick color */
function syncBelowLabelColors() {
  scaleItems.forEach((mark) => {
    const label = mark.querySelector(".label-below");
    if (!label) return;
    const tick = mark.querySelector(".tick");
    const color = getComputedStyle(tick).backgroundColor;
    label.style.color = color;
  });
}

function applyColorTheme(color) {
  els.root.style.setProperty("--glow-color", color);
  els.mercury.style.boxShadow = `0 0 45px ${color}, 0 0 90px ${color}`;
  els.blurCircle.style.background = color;
}

function setActiveAndNeighbors(temp) {
  const baseHeight =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--tick-base-height"
      )
    ) || 10;

  // reset
  scaleItems.forEach((m) => {
    const tick = m.querySelector(".tick");
    const value = m.querySelector(".value");
    m.classList.remove("active");
    tick.style.height = baseHeight + "px";
    tick.style.transform = "translateY(0)";
    tick.style.background = "var(--tick-inactive-color)";
    tick.style.boxShadow = "none";
    value.textContent = "";
    value.style.opacity = "0";
  });

  // closest mark
  let closest = null;
  let closestDiff = Infinity;
  scaleItems.forEach((m) => {
    const t = parseInt(m.dataset.temp, 10);
    const diff = Math.abs(t - temp);
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = m;
    }
  });
  if (!closest) return;

  const activeIndex = scaleItems.indexOf(closest);
  const activeTick = closest.querySelector(".tick");
  const activeValue = closest.querySelector(".value");

  // Active: 5.5× height, lowered by 4px, solid white
  activeTick.style.height = baseHeight * 5.5 + "px";
  activeTick.style.transform = "translateY(4px)";
  activeTick.style.background = "var(--tick-active-color)";
  activeTick.style.boxShadow = "0 0 12px var(--tick-active-color)";
  closest.classList.add("active");
  activeValue.textContent = `${parseInt(closest.dataset.temp, 10)}°F`;
  activeValue.style.opacity = "1";

  // neighbors: 1: 2.2×,3px; 2: 1.6×,2px; 3: 1.3×,1px
  const neighborConfig = [
    { distance: 1, factor: 2.2, offset: 3 },
    { distance: 2, factor: 1.8, offset: 2 },
    { distance: 3, factor: 1.4, offset: 1 }
  ];

  neighborConfig.forEach((cfg, idx) => {
    const d = cfg.distance;
    const hFactor = cfg.factor;
    const offset = cfg.offset;
    const colorFactor =
      (neighborConfig.length - idx) / (neighborConfig.length + 1);

    [activeIndex - d, activeIndex + d].forEach((i) => {
      if (i < 0 || i >= scaleItems.length) return;
      const m = scaleItems[i];
      const tk = m.querySelector(".tick");
      tk.style.height = baseHeight * hFactor + "px";
      tk.style.transform = `translateY(${offset}px)`;
      tk.style.background = mixColorInactiveActive(colorFactor);
    });
  });

  syncBelowLabelColors();
}

function updateSystemFromX(xPos) {
  xPos = Math.max(knobBounds.minX, Math.min(knobBounds.maxX, xPos));
  const pct = xPos / trackWidth;
  const temp = CONFIG.minTemp + pct * (CONFIG.maxTemp - CONFIG.minTemp);
  currentTemp = Math.round(temp);

  const norm =
    (currentTemp - CONFIG.minTemp) / (CONFIG.maxTemp - CONFIG.minTemp);
  const color = colorMap(norm);

  els.mercury.style.width = pct * 100 + "%";
  applyColorTheme(color);
  setActiveAndNeighbors(currentTemp);
}

function initLayout() {
  const rect = els.track.getBoundingClientRect();
  trackWidth = rect.width;
  knobBounds = { minX: 0, maxX: trackWidth };

  buildScale();

  const norm =
    (CONFIG.defaultTemp - CONFIG.minTemp) / (CONFIG.maxTemp - CONFIG.minTemp);
  const startX = trackWidth * norm;

  gsap.set(els.knob, { x: startX });
  updateSystemFromX(startX);
}

function initDrag() {
  Draggable.create(els.knob, {
    type: "x",
    bounds: { minX: knobBounds.minX, maxX: knobBounds.maxX },
    inertia: true,
    onDrag() {
      updateSystemFromX(this.x);
    },
    onThrowUpdate() {
      updateSystemFromX(this.x);
    }
  });
}

window.addEventListener("load", () => {
  colorMap = createColorMap();
  initLayout();
  initDrag();
});
window.addEventListener("resize", () => {
  initLayout();
});