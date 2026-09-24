/* ==========================================
   PROMOTION PAGE BUILDER - TEXT ANIMATION MODAL TOOL
   ========================================== */

let selectedTextAnimation = "anim-none";
let currentAnimationSpeed = 3; // In seconds

const TEXT_ANIMATION_PRESETS = [
  { id: "anim-none", name: "Tanpa Animasi", desc: "Tampilan teks biasa tanpa animasi", class: "" },
  { id: "anim-marquee", name: "Marquee Running Text", desc: "Teks berjalan horizontal secara terus-menerus", class: "anim-marquee" },
  { id: "anim-typewriter", name: "Typewriter Text", desc: "Efek teks mengetik otomatis satu per satu", class: "anim-typewriter" },
  { id: "anim-gradient-shift", name: "Rainbow Gradient Shift", desc: "Gradasi warna teks bergerak dinamis", class: "anim-gradient-shift" }
];

function openTextAnimationModal() {
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

  const modal = document.getElementById("textAnimationModal");
  if (!modal) return;

  modal.classList.remove("hidden");
  modal.style.display = "flex";

  // Load existing animation
  selectedTextAnimation = (data && data.textAnimation) || "anim-none";
  currentAnimationSpeed = (data && data.textAnimationDuration) ? parseFloat(data.textAnimationDuration) : 3;

  // Set sample text for preview
  const previewText = (data && data.content && data.content.trim()) ? data.content : "Contoh Teks Animasi Promo";
  const previewBox = document.getElementById("textAnimPreviewContent");
  if (previewBox) {
    previewBox.innerText = previewText;
    if (data && data.style) {
      previewBox.style.fontSize = data.style.fontSize || "18px";
      previewBox.style.fontWeight = data.style.fontWeight || "700";
      previewBox.style.color = data.style.color || "#2c5d6b";
      previewBox.style.textAlign = data.style.textAlign || "center";
    }
  }

  const speedSlider = document.getElementById("textAnimSpeedSlider");
  const speedVal = document.getElementById("textAnimSpeedVal");
  if (speedSlider) speedSlider.value = currentAnimationSpeed;
  if (speedVal) speedVal.innerText = `${currentAnimationSpeed}s`;

  renderTextAnimPresetGrid();
  previewTextAnimation(selectedTextAnimation);
}

function closeTextAnimationModal() {
  const modal = document.getElementById("textAnimationModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
  }
}

function renderTextAnimPresetGrid() {
  const grid = document.getElementById("textAnimPresetGrid");
  if (!grid) return;

  grid.innerHTML = "";
  TEXT_ANIMATION_PRESETS.forEach(preset => {
    const btn = document.createElement("div");
    btn.className = `shape-preset-card ${selectedTextAnimation === preset.class ? "active" : ""}`;
    btn.style.display = "flex";
    btn.style.flexDirection = "column";
    btn.style.alignItems = "flex-start";
    btn.style.padding = "10px 12px";
    btn.style.borderRadius = "12px";
    btn.style.border = selectedTextAnimation === preset.class ? "2px solid #38a0c4" : "1px solid #bddce7";
    btn.style.background = selectedTextAnimation === preset.class ? "#f0f9fc" : "#ffffff";
    btn.style.cursor = "pointer";
    btn.style.transition = "all 0.2s";

    btn.onclick = () => {
      selectedTextAnimation = preset.class;
      renderTextAnimPresetGrid();
      previewTextAnimation(selectedTextAnimation);
    };

    btn.innerHTML = `
      <div style="display: flex; align-items: center; width: 100%;">
        <span style="font-weight: 700; font-size: 13px; color: #2c5d6b;">${preset.name}</span>
      </div>
      <span style="font-size: 11px; color: #7a8a94; margin-top: 4px; line-height: 1.3;">${preset.desc}</span>
    `;

    grid.appendChild(btn);
  });
}

function previewTextAnimation(animClass) {
  const previewBox = document.getElementById("textAnimPreviewContent");
  if (!previewBox) return;

  // Clear previous animation classes
  TEXT_ANIMATION_PRESETS.forEach(p => {
    if (p.class) previewBox.classList.remove(p.class);
  });

  if (animClass) {
    previewBox.classList.add(animClass);
    previewBox.style.animationDuration = `${currentAnimationSpeed}s`;
  }
}

function changeTextAnimSpeed(val) {
  currentAnimationSpeed = parseFloat(val) || 3;
  const speedVal = document.getElementById("textAnimSpeedVal");
  if (speedVal) speedVal.innerText = `${currentAnimationSpeed}s`;

  const previewBox = document.getElementById("textAnimPreviewContent");
  if (previewBox) {
    previewBox.style.animationDuration = `${currentAnimationSpeed}s`;
  }
}

function applyTextAnimation() {
  if (!selectedElementId) return;
  const el = elements.find(item => item.id === selectedElementId);
  if (!el) return;

  el.textAnimation = selectedTextAnimation;
  el.textAnimationDuration = currentAnimationSpeed;

  renderCanvas();
  if (typeof pushHistory === "function") pushHistory();
  closeTextAnimationModal();
}

window.openTextAnimationModal = openTextAnimationModal;
window.closeTextAnimationModal = closeTextAnimationModal;
window.changeTextAnimSpeed = changeTextAnimSpeed;
window.applyTextAnimation = applyTextAnimation;
