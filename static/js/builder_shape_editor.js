/* ==========================================
   PROMOTION PAGE BUILDER - SHAPE & CURVE EDITOR MODAL
   ========================================== */

let currentShapeType = "preset"; // "preset" | "draw"
let currentShapeValue = "none";  // CSS clip-path or preset identifier
let drawPoints = [];
let drawHistory = [];
let drawRedo = [];
let isSmoothMode = true;
let activePointIndex = -1;
let isDraggingPoint = false;

// List Preset Shape Siap Pakai
const SHAPE_PRESETS = [
  { id: "none", name: "Solid Persegi", icon: "square", clipPath: "none" },
  { id: "circle", name: "Bulat Sempurna", icon: "circle", clipPath: "circle(50% at 50% 50%)" },
  { id: "ellipse", name: "Oval / Elips", icon: "ellipse", clipPath: "ellipse(50% 38% at 50% 50%)" },
  { id: "pill", name: "Pill / Kapsul", icon: "pill", clipPath: "inset(0% round 9999px)" },
  { id: "rounded_xl", name: "Sudut Ekstra Melengkung", icon: "rounded", clipPath: "inset(0% round 24px)" },
  { id: "blob1", name: "Blob Melengkung 1", icon: "blob", clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" },
  { id: "blob2", name: "Blob Gelombang", icon: "wave", clipPath: "polygon(50% 0%, 80% 10%, 100% 35%, 90% 70%, 65% 100%, 35% 95%, 5% 75%, 0% 40%, 15% 10%)" },
  { id: "star", name: "Bintang 5 Sudut", icon: "star", clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" },
  { id: "hexagon", name: "Hexagon", icon: "hexagon", clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" },
  { id: "diamond", name: "Belah Ketupat", icon: "diamond", clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" },
  { id: "shield", name: "Perisai (Shield)", icon: "shield", clipPath: "polygon(50% 0%, 100% 15%, 100% 65%, 50% 100%, 0% 65%, 0% 15%)" },
  { id: "arch", name: "Kubah / Arch", icon: "arch", clipPath: "polygon(0% 100%, 0% 40%, 15% 15%, 35% 3%, 50% 0%, 65% 3%, 85% 15%, 100% 40%, 100% 100%)" }
];

function openShapeEditorModal() {
  let data = elements.find(item => item.id === selectedElementId);
  if (!data && elements.length > 0) {
    const activeEl = document.querySelector(".builder-element.active-element");
    if (activeEl) {
      selectedElementId = activeEl.id;
      data = elements.find(item => item.id === selectedElementId);
    } else {
      data = elements[0];
      selectedElementId = data.id;
    }
  }

  const modal = document.getElementById("shapeEditorModal");
  if (!modal) return;

  modal.classList.remove("hidden");
  modal.style.display = "flex";

  // Load existing clipPath if present
  currentShapeValue = (data && data.style && data.style.clipPath) || "none";

  // Check if current value matches a preset
  const matchedPreset = SHAPE_PRESETS.find(p => p.clipPath === currentShapeValue || p.id === currentShapeValue);
  if (matchedPreset) {
    currentShapeType = "preset";
    selectShapeTab("preset");
    renderPresetGrid(matchedPreset.id);
  } else if (currentShapeValue.startsWith("polygon(") || currentShapeValue.startsWith("path(")) {
    currentShapeType = "draw";
    selectShapeTab("draw");
    parseClipPathToPoints(currentShapeValue);
  } else {
    currentShapeType = "preset";
    selectShapeTab("preset");
    renderPresetGrid("none");
  }

  updateShapePreview();
}

function closeShapeEditorModal() {
  const modal = document.getElementById("shapeEditorModal");
  if (modal) modal.classList.add("hidden");
}

function selectShapeTab(tabName) {
  currentShapeType = tabName;
  const tabPreset = document.getElementById("shapeTabPreset");
  const tabDraw = document.getElementById("shapeTabDraw");
  const bodyPreset = document.getElementById("shapeBodyPreset");
  const bodyDraw = document.getElementById("shapeBodyDraw");

  if (tabPreset && tabDraw && bodyPreset && bodyDraw) {
    if (tabName === "preset") {
      tabPreset.classList.add("active");
      tabDraw.classList.remove("active");
      bodyPreset.classList.remove("hidden");
      bodyDraw.classList.add("hidden");
    } else {
      tabDraw.classList.add("active");
      tabPreset.classList.remove("active");
      bodyDraw.classList.remove("hidden");
      bodyPreset.classList.add("hidden");
      initDrawCanvas();
    }
  }
}

function getElementFillBackground(data) {
  if (!data) return "linear-gradient(135deg, #38a0c4, #8d98e0)";
  if (data.type === "image") {
    if (data.imageSrc) {
      return `url("${data.imageSrc}") center/cover no-repeat`;
    }
    return "linear-gradient(135deg, #38a0c4, #8d98e0)";
  }
  if (data.style) {
    if (data.style.background && data.style.background !== 'none' && data.style.background !== 'transparent') {
      return data.style.background;
    }
    if (data.style.backgroundColor && data.style.backgroundColor !== 'transparent') {
      return data.style.backgroundColor;
    }
  }
  return "linear-gradient(135deg, #38a0c4, #8d98e0)";
}

function renderPresetGrid(selectedId) {
  const container = document.getElementById("shapePresetGrid");
  if (!container) return;

  const data = elements.find(item => item.id === selectedElementId);
  const fillBg = getElementFillBackground(data);

  container.innerHTML = "";
  SHAPE_PRESETS.forEach(preset => {
    const card = document.createElement("div");
    card.className = `shape-preset-card ${preset.id === selectedId ? "selected" : ""}`;
    card.onclick = () => selectPresetCard(preset);

    const iconDiv = document.createElement("div");
    iconDiv.className = "shape-preset-thumb";
    iconDiv.style.clipPath = preset.clipPath;
    iconDiv.style.webkitClipPath = preset.clipPath;
    iconDiv.style.background = fillBg;

    const label = document.createElement("span");
    label.className = "shape-preset-name";
    label.innerText = preset.name;

    card.appendChild(iconDiv);
    card.appendChild(label);
    container.appendChild(card);
  });
}

function selectPresetCard(preset) {
  currentShapeValue = preset.clipPath;
  document.querySelectorAll(".shape-preset-card").forEach(c => c.classList.remove("selected"));
  renderPresetGrid(preset.id);
  updateShapePreview();
}

/* ==========================================
   INTERACTIVE VECTOR & SMOOTH CURVE DRAWING ENGINE
   ========================================== */

function initDrawCanvas() {
  const drawCanvas = document.getElementById("shapeDrawCanvas");
  if (!drawCanvas) return;

  if (!drawPoints || drawPoints.length < 3) {
    // Default smooth quad shape if empty
    drawPoints = [
      { x: 20, y: 15 },
      { x: 80, y: 15 },
      { x: 85, y: 80 },
      { x: 15, y: 80 }
    ];
  }

  drawHistory = [];
  drawRedo = [];
  setupCanvasListeners(drawCanvas);
  renderDrawCanvas();
}

function setupCanvasListeners(canvas) {
  if (canvas.dataset.hasListeners) return;
  canvas.dataset.hasListeners = "true";

  let isDown = false;

  const getCanvasCoords = (e) => {
    const rect = canvas.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const yPct = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    return { x: xPct, y: yPct };
  };

  canvas.addEventListener("mousedown", (e) => {
    const coords = getCanvasCoords(e);
    const rect = canvas.getBoundingClientRect();

    // Check if clicked near an existing point
    let foundIndex = -1;
    drawPoints.forEach((pt, i) => {
      const pxX = (pt.x / 100) * rect.width;
      const pxY = (pt.y / 100) * rect.height;
      const mousePxX = (coords.x / 100) * rect.width;
      const mousePxY = (coords.y / 100) * rect.height;
      const dist = Math.hypot(mousePxX - pxX, mousePxY - pxY);
      if (dist < 14) foundIndex = i;
    });

    if (foundIndex !== -1) {
      activePointIndex = foundIndex;
      isDraggingPoint = true;
      pushDrawHistory();
    } else {
      // Add new point
      pushDrawHistory();
      drawPoints.push(coords);
      activePointIndex = drawPoints.length - 1;
      isDraggingPoint = true;
    }

    renderDrawCanvas();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDraggingPoint || activePointIndex === -1) return;
    const coords = getCanvasCoords(e);
    drawPoints[activePointIndex] = coords;
    renderDrawCanvas();
  });

  window.addEventListener("mouseup", () => {
    isDraggingPoint = false;
  });
}

function pushDrawHistory() {
  drawHistory.push(JSON.stringify(drawPoints));
  if (drawHistory.length > 30) drawHistory.shift();
  drawRedo = [];
}

function undoDrawPoint() {
  if (drawHistory.length > 0) {
    drawRedo.push(JSON.stringify(drawPoints));
    drawPoints = JSON.parse(drawHistory.pop());
    renderDrawCanvas();
  }
}

function redoDrawPoint() {
  if (drawRedo.length > 0) {
    drawHistory.push(JSON.stringify(drawPoints));
    drawPoints = JSON.parse(drawRedo.pop());
    renderDrawCanvas();
  }
}

function resetDrawPoints() {
  pushDrawHistory();
  drawPoints = [
    { x: 15, y: 15 },
    { x: 85, y: 15 },
    { x: 85, y: 85 },
    { x: 15, y: 85 }
  ];
  activePointIndex = -1;
  renderDrawCanvas();
}

function toggleSmoothCurveMode() {
  isSmoothMode = !isSmoothMode;
  const btn = document.getElementById("btnToggleSmoothCurve");
  if (btn) btn.classList.toggle("active", isSmoothMode);
  renderDrawCanvas();
}

// Generate Smooth Catmull-Rom / Bézier Curve points
function getInterpolatedCurvePoints(points, samplesPerSegment = 12) {
  if (points.length < 3) return points;
  if (!isSmoothMode) return points;

  const result = [];
  const len = points.length;

  for (let i = 0; i < len; i++) {
    const p0 = points[(i - 1 + len) % len];
    const p1 = points[i];
    const p2 = points[(i + 1) % len];
    const p3 = points[(i + 2) % len];

    for (let t = 0; t < 1; t += 1 / samplesPerSegment) {
      const t2 = t * t;
      const t3 = t2 * t;

      const x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
      );

      const y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
      );

      result.push({
        x: Math.max(0, Math.min(100, Math.round(x * 10) / 10)),
        y: Math.max(0, Math.min(100, Math.round(y * 10) / 10))
      });
    }
  }

  return result;
}

function generateClipPathFromPoints() {
  if (!drawPoints || drawPoints.length < 3) return "none";
  const finalPts = getInterpolatedCurvePoints(drawPoints);
  const coordsStr = finalPts.map(p => `${p.x}% ${p.y}%`).join(", ");
  return `polygon(${coordsStr})`;
}

function parseClipPathToPoints(clipStr) {
  if (!clipStr || !clipStr.startsWith("polygon(")) return;
  const rawStr = clipStr.replace("polygon(", "").replace(")", "").trim();
  const pairs = rawStr.split(",");

  const pts = [];
  pairs.forEach(pair => {
    const parts = pair.trim().split(/\s+/);
    if (parts.length >= 2) {
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      if (!isNaN(x) && !isNaN(y)) pts.push({ x, y });
    }
  });

  if (pts.length >= 3) {
    // Subsample if too many interpolated points
    if (pts.length > 12) {
      const step = Math.ceil(pts.length / 8);
      drawPoints = pts.filter((_, idx) => idx % step === 0);
    } else {
      drawPoints = pts;
    }
  }
}

function renderDrawCanvas() {
  const canvas = document.getElementById("shapeDrawCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const w = canvas.width = canvas.clientWidth || 300;
  const h = canvas.height = canvas.clientHeight || 260;

  ctx.clearRect(0, 0, w, h);

  // Draw grid background
  ctx.strokeStyle = "#e2edf0";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 20) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  if (drawPoints.length < 2) return;

  const interpolated = getInterpolatedCurvePoints(drawPoints);

  // Render Polygon Fill & Stroke
  ctx.beginPath();
  interpolated.forEach((pt, idx) => {
    const pxX = (pt.x / 100) * w;
    const pxY = (pt.y / 100) * h;
    if (idx === 0) ctx.moveTo(pxX, pxY);
    else ctx.lineTo(pxX, pxY);
  });
  ctx.closePath();

  ctx.fillStyle = "rgba(56, 160, 196, 0.25)";
  ctx.fill();
  ctx.strokeStyle = "#38a0c4";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Render Control Points (Vector Nodes)
  drawPoints.forEach((pt, idx) => {
    const pxX = (pt.x / 100) * w;
    const pxY = (pt.y / 100) * h;

    ctx.beginPath();
    ctx.arc(pxX, pxY, idx === activePointIndex ? 7 : 5, 0, Math.PI * 2);
    ctx.fillStyle = idx === activePointIndex ? "#8d98e0" : "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#38a0c4";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  currentShapeValue = generateClipPathFromPoints();
  updateShapePreview();
}

function updateShapePreview() {
  const previewBox = document.getElementById("shapeLivePreview");
  if (!previewBox) return;

  const data = elements.find(item => item.id === selectedElementId);
  const fillBg = getElementFillBackground(data);

  previewBox.style.clipPath = currentShapeValue;
  previewBox.style.webkitClipPath = currentShapeValue;
  previewBox.style.background = fillBg;
}

function applySelectedShape() {
  const data = elements.find(item => item.id === selectedElementId);
  if (!data) return;

  if (!data.style) data.style = {};

  if (currentShapeValue === "none") {
    delete data.style.clipPath;
    delete data.style.webkitClipPath;
  } else {
    data.style.clipPath = currentShapeValue;
    data.style.webkitClipPath = currentShapeValue;
  }

  const div = document.getElementById(selectedElementId);
  if (div) {
    if (currentShapeValue === "none") {
      div.style.clipPath = "none";
      div.style.webkitClipPath = "none";
    } else {
      div.style.clipPath = currentShapeValue;
      div.style.webkitClipPath = currentShapeValue;
    }
  }

  closeShapeEditorModal();

  if (typeof renderCanvas === "function") renderCanvas();
  if (typeof pushHistoryDebounced === "function") pushHistoryDebounced();
}

window.openShapeEditorModal = openShapeEditorModal;
window.closeShapeEditorModal = closeShapeEditorModal;
window.selectShapeTab = selectShapeTab;
window.selectPresetCard = selectPresetCard;
window.undoDrawPoint = undoDrawPoint;
window.redoDrawPoint = redoDrawPoint;
window.resetDrawPoints = resetDrawPoints;
window.toggleSmoothCurveMode = toggleSmoothCurveMode;
window.applySelectedShape = applySelectedShape;
