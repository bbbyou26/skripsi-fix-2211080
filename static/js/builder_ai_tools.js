/* ==========================================
   PROMOTION PAGE BUILDER - AI TOOLS & IMAGE PROCESSORS (REMBG, CROP, COPYWRITER, AUTO-GENERATE)
   ========================================== */

// 1. BACKGROUND REMOVER (rembg) WITH ERASURE / RESTORE BRUSH
let rembgImgOriginal = null;
let rembgImgRemoved = null;
let rembgCanvas = null;
let rembgCtx = null;
let rembgMaskCanvas = null;
let rembgMaskCtx = null;
let rembgTool = 'erase';
let rembgIsDrawing = false;
let rembgLastX = 0;
let rembgLastY = 0;
let rembgHistory = [];
let rembgRedoHistory = [];

function triggerImageRembg() {
  if (!selectedElementId) return;
  const data = elements.find(el => el.id === selectedElementId);
  if (!data || data.type !== 'image') return;
  const imgUrl = data.imageSrc;
  if (!imgUrl) {
    if (typeof showToast === "function") showToast("Silakan upload gambar atau masukkan URL gambar terlebih dahulu.", "error");
    return;
  }

  const modal = document.getElementById("rembgModal");
  if (modal) modal.classList.remove("hidden");

  const loadingState = document.getElementById("rembgLoadingState");
  if (loadingState) loadingState.classList.remove("hidden");
  const editorState = document.getElementById("rembgEditorState");
  if (editorState) editorState.classList.add("hidden");

  fetch('/api/ai/remove_bg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imgUrl })
  })
    .then(res => res.json())
    .then(resData => {
      if (resData.success && resData.image) {
        initRembgEditor(imgUrl, resData.image);
      } else {
        if (typeof showToast === "function") showToast("Gagal: " + (resData.error || "Error tidak diketahui"), "error");
        closeRembgModal();
      }
    })
    .catch(err => {
      console.error(err);
      if (typeof showToast === "function") showToast("Gagal menghubungi server untuk memproses.", "error");
      closeRembgModal();
    });
}

function initRembgEditor(originalSrc, removedSrc) {
  const loadingState = document.getElementById("rembgLoadingState");
  if (loadingState) loadingState.classList.add("hidden");
  const editorState = document.getElementById("rembgEditorState");
  if (editorState) editorState.classList.remove("hidden");

  rembgImgOriginal = new Image();
  rembgImgRemoved = new Image();

  let loadedCount = 0;
  function onImgLoaded() {
    loadedCount++;
    if (loadedCount === 2) {
      setupRembgCanvas();
    }
  }

  rembgImgOriginal.onload = onImgLoaded;
  rembgImgRemoved.onload = onImgLoaded;

  if (!originalSrc.startsWith("data:")) rembgImgOriginal.crossOrigin = "Anonymous";
  if (!removedSrc.startsWith("data:")) rembgImgRemoved.crossOrigin = "Anonymous";

  rembgImgOriginal.src = originalSrc;
  rembgImgRemoved.src = removedSrc;
}

function setupRembgCanvas() {
  rembgCanvas = document.getElementById("rembgCanvas");
  if (!rembgCanvas) return;
  rembgCtx = rembgCanvas.getContext("2d");

  const maxW = 380;
  const aspect = rembgImgOriginal.height / rembgImgOriginal.width;
  rembgCanvas.width = rembgImgOriginal.width > maxW ? maxW : rembgImgOriginal.width;
  rembgCanvas.height = rembgCanvas.width * aspect;

  rembgMaskCanvas = document.createElement("canvas");
  rembgMaskCanvas.width = rembgCanvas.width;
  rembgMaskCanvas.height = rembgCanvas.height;
  rembgMaskCtx = rembgMaskCanvas.getContext("2d");

  rembgMaskCtx.drawImage(rembgImgRemoved, 0, 0, rembgCanvas.width, rembgCanvas.height);

  rembgCanvas.onmousedown = startRembgDraw;
  rembgCanvas.onmousemove = drawRembgStroke;
  window.addEventListener("mouseup", stopRembgDraw);

  rembgCanvas.ontouchstart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    rembgCanvas.dispatchEvent(mouseEvent);
  };
  rembgCanvas.ontouchmove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    rembgCanvas.dispatchEvent(mouseEvent);
  };
  rembgCanvas.ontouchend = (e) => {
    const mouseEvent = new MouseEvent("mouseup", {});
    window.dispatchEvent(mouseEvent);
  };

  rembgHistory = [];
  rembgRedoHistory = [];
  saveRembgState();
  redrawRembg();
}

function setRembgTool(tool) {
  rembgTool = tool;
  const btnErase = document.getElementById("btnRembgErase");
  if (btnErase) btnErase.classList.toggle("active", tool === 'erase');
  const btnRestore = document.getElementById("btnRembgRestore");
  if (btnRestore) btnRestore.classList.toggle("active", tool === 'restore');
}

function startRembgDraw(e) {
  rembgIsDrawing = true;
  const rect = rembgCanvas.getBoundingClientRect();
  rembgLastX = (e.clientX - rect.left) * (rembgCanvas.width / rect.width);
  rembgLastY = (e.clientY - rect.top) * (rembgCanvas.height / rect.height);
}

function drawRembgStroke(e) {
  if (!rembgIsDrawing) return;
  const rect = rembgCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (rembgCanvas.width / rect.width);
  const y = (e.clientY - rect.top) * (rembgCanvas.height / rect.height);

  const brushInput = document.getElementById("rembgBrushSize");
  const size = parseInt(brushInput ? brushInput.value : 20) || 20;

  rembgMaskCtx.save();
  rembgMaskCtx.lineJoin = "round";
  rembgMaskCtx.lineCap = "round";
  rembgMaskCtx.lineWidth = size;

  if (rembgTool === 'erase') {
    rembgMaskCtx.globalCompositeOperation = 'destination-out';
    rembgMaskCtx.beginPath();
    rembgMaskCtx.moveTo(rembgLastX, rembgLastY);
    rembgMaskCtx.lineTo(x, y);
    rembgMaskCtx.stroke();
  } else {
    rembgMaskCtx.globalCompositeOperation = 'source-over';
    rembgMaskCtx.strokeStyle = "#ffffff";
    rembgMaskCtx.beginPath();
    rembgMaskCtx.moveTo(rembgLastX, rembgLastY);
    rembgMaskCtx.lineTo(x, y);
    rembgMaskCtx.stroke();
  }
  rembgMaskCtx.restore();

  rembgLastX = x;
  rembgLastY = y;
  redrawRembg();
}

function stopRembgDraw() {
  if (rembgIsDrawing) {
    rembgIsDrawing = false;
    saveRembgState();
  }
}

function saveRembgState() {
  if (!rembgMaskCtx) return;
  const state = rembgMaskCtx.getImageData(0, 0, rembgMaskCanvas.width, rembgMaskCanvas.height);
  rembgHistory.push(state);
  if (rembgHistory.length > 30) rembgHistory.shift();
  rembgRedoHistory = [];
}

function undoRembgBrush() {
  if (rembgHistory.length > 1) {
    const currentState = rembgHistory.pop();
    rembgRedoHistory.push(currentState);
    const previousState = rembgHistory[rembgHistory.length - 1];
    rembgMaskCtx.putImageData(previousState, 0, 0);
    redrawRembg();
  }
}

function redoRembgBrush() {
  if (rembgRedoHistory.length > 0) {
    const nextState = rembgRedoHistory.pop();
    rembgHistory.push(nextState);
    rembgMaskCtx.putImageData(nextState, 0, 0);
    redrawRembg();
  }
}

function resetRembgBrush() {
  if (!rembgMaskCtx) return;
  rembgMaskCtx.clearRect(0, 0, rembgMaskCanvas.width, rembgMaskCanvas.height);
  rembgMaskCtx.drawImage(rembgImgRemoved, 0, 0, rembgCanvas.width, rembgCanvas.height);
  saveRembgState();
  redrawRembg();
}

function redrawRembg() {
  if (!rembgCanvas) return;
  rembgCtx.clearRect(0, 0, rembgCanvas.width, rembgCanvas.height);

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = rembgCanvas.width;
  tempCanvas.height = rembgCanvas.height;
  const tempCtx = tempCanvas.getContext("2d");

  tempCtx.drawImage(rembgImgOriginal, 0, 0, tempCanvas.width, tempCanvas.height);
  tempCtx.globalCompositeOperation = 'destination-in';
  tempCtx.drawImage(rembgMaskCanvas, 0, 0, tempCanvas.width, tempCanvas.height);

  rembgCtx.drawImage(tempCanvas, 0, 0);
}

function applyRembgResult() {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = rembgImgOriginal.naturalWidth;
  exportCanvas.height = rembgImgOriginal.naturalHeight;
  const exportCtx = exportCanvas.getContext("2d");

  exportCtx.drawImage(rembgImgOriginal, 0, 0);
  exportCtx.globalCompositeOperation = 'destination-in';
  exportCtx.drawImage(rembgMaskCanvas, 0, 0, exportCanvas.width, exportCanvas.height);

  const transparentBase64 = exportCanvas.toDataURL("image/png");
  if (typeof updateSelectedElementImageSrc === "function") updateSelectedElementImageSrc(transparentBase64);
  const urlInput = document.getElementById("propImageUrl");
  if (urlInput) urlInput.value = transparentBase64;

  closeRembgModal();
}

function closeRembgModal() {
  const modal = document.getElementById("rembgModal");
  if (modal) modal.classList.add("hidden");
  rembgCanvas = null;
  rembgCtx = null;
  rembgMaskCanvas = null;
  rembgMaskCtx = null;
  window.removeEventListener("mouseup", stopRembgDraw);
}

// 2. BACKGROUND RESIZE, OPACITY & CROP BOX CONTROLS
let bgCropImg = null;
let bgCropCanvas = null;
let bgCropCtx = null;
let bgCropRect = { x: 50, y: 50, w: 200, h: 200 };
let bgCropActiveHandle = null;
let bgCropDragOffset = { x: 0, y: 0 };
const BG_CROP_HANDLE_SIZE = 12;

function uploadBgImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    updateBgImageSrc(e.target.result);
    const urlInput = document.getElementById("bgImageUrl");
    if (urlInput) urlInput.value = e.target.result;
  };
  reader.readAsDataURL(file);
}

function updateBgImageSrc(src) {
  const bgTypeSelect = document.getElementById("bgType");
  if (!bgTypeSelect || bgTypeSelect.value !== 'image') return;

  window.bgImageSrc = src;

  if (src) {
    const tempImg = new Image();
    tempImg.onload = function () {
      window.bgImageWidth = tempImg.width;
      window.bgImageHeight = tempImg.height;

      if (typeof setCanvasHeightToFitImage === "function") setCanvasHeightToFitImage();
    };
    tempImg.src = src;
  }

  const cropBtn = document.getElementById("bgCropBtnRow");
  if (cropBtn) cropBtn.style.display = src ? "block" : "none";

  if (typeof updateBgStyle === "function") updateBgStyle();
  if (typeof pushHistory === "function") pushHistory();
}

function updateBgImageOpacity(val) {
  const lbl = document.getElementById("bgOpacityVal");
  if (lbl) lbl.innerText = val;
  window.bgImageOpacity = val / 100;
  if (typeof updateBgStyle === "function") updateBgStyle();
}

function openBgCropModal() {
  if (!window.bgImageSrc) return;

  const modal = document.getElementById("bgCropModal");
  if (modal) modal.classList.remove("hidden");

  bgCropCanvas = document.getElementById("bgCropCanvas");
  if (!bgCropCanvas) return;
  bgCropCtx = bgCropCanvas.getContext("2d");

  bgCropImg = new Image();
  bgCropImg.onload = function () {
    const maxW = 380;
    const aspect = bgCropImg.height / bgCropImg.width;
    bgCropCanvas.width = bgCropImg.width > maxW ? maxW : bgCropImg.width;
    bgCropCanvas.height = bgCropCanvas.width * aspect;

    const w = bgCropCanvas.width * 0.7;
    const h = bgCropCanvas.height * 0.7;
    bgCropRect = {
      x: (bgCropCanvas.width - w) / 2,
      y: (bgCropCanvas.height - h) / 2,
      w: w,
      h: h
    };

    bgCropCanvas.onmousedown = handleBgCropMouseDown;
    bgCropCanvas.onmousemove = handleBgCropMouseMove;
    window.addEventListener("mouseup", handleBgCropMouseUp);

    bgCropCanvas.ontouchstart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      bgCropCanvas.dispatchEvent(mouseEvent);
    };
    bgCropCanvas.ontouchmove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      bgCropCanvas.dispatchEvent(mouseEvent);
    };
    bgCropCanvas.ontouchend = (e) => {
      const mouseEvent = new MouseEvent("mouseup", {});
      window.dispatchEvent(mouseEvent);
    };

    drawBgCrop();
  };
  bgCropImg.src = window.bgImageSrc;
}

function drawBgCrop() {
  if (!bgCropCanvas) return;

  bgCropCtx.clearRect(0, 0, bgCropCanvas.width, bgCropCanvas.height);
  bgCropCtx.drawImage(bgCropImg, 0, 0, bgCropCanvas.width, bgCropCanvas.height);

  bgCropCtx.fillStyle = "rgba(0, 0, 0, 0.6)";
  bgCropCtx.fillRect(0, 0, bgCropCanvas.width, bgCropCanvas.height);

  bgCropCtx.save();
  bgCropCtx.beginPath();
  bgCropCtx.rect(bgCropRect.x, bgCropRect.y, bgCropRect.w, bgCropRect.h);
  bgCropCtx.clip();
  bgCropCtx.drawImage(bgCropImg, 0, 0, bgCropCanvas.width, bgCropCanvas.height);
  bgCropCtx.restore();

  bgCropCtx.strokeStyle = "#38a0c4";
  bgCropCtx.lineWidth = 2;
  bgCropCtx.strokeRect(bgCropRect.x, bgCropRect.y, bgCropRect.w, bgCropRect.h);

  bgCropCtx.fillStyle = "#38a0c4";
  const corners = [
    { x: bgCropRect.x, y: bgCropRect.y },
    { x: bgCropRect.x + bgCropRect.w, y: bgCropRect.y },
    { x: bgCropRect.x, y: bgCropRect.y + bgCropRect.h },
    { x: bgCropRect.x + bgCropRect.w, y: bgCropRect.y + bgCropRect.h }
  ];

  corners.forEach(c => {
    bgCropCtx.beginPath();
    bgCropCtx.arc(c.x, c.y, BG_CROP_HANDLE_SIZE / 2, 0, Math.PI * 2);
    bgCropCtx.fill();
    bgCropCtx.strokeStyle = "#ffffff";
    bgCropCtx.lineWidth = 1.5;
    bgCropCtx.stroke();
  });
}

function handleBgCropMouseDown(e) {
  const rect = bgCropCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (bgCropCanvas.width / rect.width);
  const y = (e.clientY - rect.top) * (bgCropCanvas.height / rect.height);

  const halfSz = BG_CROP_HANDLE_SIZE / 2;
  const isNear = (hx, hy) => Math.sqrt((x - hx) ** 2 + (y - hy) ** 2) < halfSz + 10;

  if (isNear(bgCropRect.x, bgCropRect.y)) {
    bgCropActiveHandle = 'TL';
  } else if (isNear(bgCropRect.x + bgCropRect.w, bgCropRect.y)) {
    bgCropActiveHandle = 'TR';
  } else if (isNear(bgCropRect.x, bgCropRect.y + bgCropRect.h)) {
    bgCropActiveHandle = 'BL';
  } else if (isNear(bgCropRect.x + bgCropRect.w, bgCropRect.y + bgCropRect.h)) {
    bgCropActiveHandle = 'BR';
  } else if (x > bgCropRect.x && x < bgCropRect.x + bgCropRect.w && y > bgCropRect.y && y < bgCropRect.y + bgCropRect.h) {
    bgCropActiveHandle = 'move';
    bgCropDragOffset = { x: x - bgCropRect.x, y: y - bgCropRect.y };
  } else {
    bgCropActiveHandle = null;
  }
}

function handleBgCropMouseMove(e) {
  if (!bgCropActiveHandle) return;

  const rect = bgCropCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (bgCropCanvas.width / rect.width);
  const y = (e.clientY - rect.top) * (bgCropCanvas.height / rect.height);

  const minSz = 30;

  if (bgCropActiveHandle === 'move') {
    bgCropRect.x = Math.max(0, Math.min(bgCropCanvas.width - bgCropRect.w, x - bgCropDragOffset.x));
    bgCropRect.y = Math.max(0, Math.min(bgCropCanvas.height - bgCropRect.h, y - bgCropDragOffset.y));
  } else if (bgCropActiveHandle === 'TL') {
    const newW = bgCropRect.x + bgCropRect.w - x;
    const newH = bgCropRect.y + bgCropRect.h - y;
    if (newW > minSz) {
      bgCropRect.w = newW;
      bgCropRect.x = x;
    }
    if (newH > minSz) {
      bgCropRect.h = newH;
      bgCropRect.y = y;
    }
  } else if (bgCropActiveHandle === 'TR') {
    const newW = x - bgCropRect.x;
    const newH = bgCropRect.y + bgCropRect.h - y;
    if (newW > minSz) bgCropRect.w = newW;
    if (newH > minSz) {
      bgCropRect.h = newH;
      bgCropRect.y = y;
    }
  } else if (bgCropActiveHandle === 'BL') {
    const newW = bgCropRect.x + bgCropRect.w - x;
    const newH = y - bgCropRect.y;
    if (newW > minSz) {
      bgCropRect.w = newW;
      bgCropRect.x = x;
    }
    if (newH > minSz) bgCropRect.h = newH;
  } else if (bgCropActiveHandle === 'BR') {
    const newW = x - bgCropRect.x;
    const newH = y - bgCropRect.y;
    if (newW > minSz) bgCropRect.w = newW;
    if (newH > minSz) bgCropRect.h = newH;
  }

  drawBgCrop();
}

function handleBgCropMouseUp() {
  bgCropActiveHandle = null;
}

function applyBgCrop() {
  const scale = bgCropImg.naturalWidth / bgCropCanvas.width;

  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = bgCropRect.w * scale;
  exportCanvas.height = bgCropRect.h * scale;
  const exportCtx = exportCanvas.getContext("2d");

  exportCtx.drawImage(
    bgCropImg,
    bgCropRect.x * scale,
    bgCropRect.y * scale,
    bgCropRect.w * scale,
    bgCropRect.h * scale,
    0,
    0,
    exportCanvas.width,
    exportCanvas.height
  );

  const croppedBase64 = exportCanvas.toDataURL("image/png");
  updateBgImageSrc(croppedBase64);

  const urlInput = document.getElementById("bgImageUrl");
  if (urlInput) urlInput.value = croppedBase64;

  closeBgCropModal();
}

function closeBgCropModal() {
  const modal = document.getElementById("bgCropModal");
  if (modal) modal.classList.add("hidden");
  bgCropCanvas = null;
  bgCropCtx = null;
  window.removeEventListener("mouseup", handleBgCropMouseUp);
}

// ==========================================
// 3. IMAGE ELEMENT CROP & RESIZE MODAL
// ==========================================
let elemCropImg = null;
let elemCropCanvas = null;
let elemCropCtx = null;
let elemCropRect = { x: 50, y: 50, w: 200, h: 200 };
let elemCropActiveHandle = null;
let elemCropDragOffset = { x: 0, y: 0 };
let elemCropCurrentRatio = 'free'; // 'free', '1:1', '4:3', '16:9', '9:16'
const ELEM_CROP_HANDLE_SIZE = 12;

function openElementImageCropModal() {
  const data = typeof elements !== "undefined" ? elements.find(item => item.id === selectedElementId) : null;
  if (!data || data.type !== "image" || !data.imageSrc) {
    if (typeof showToast === "function") showToast("Silakan upload gambar terlebih dahulu sebelum meng-crop.", "warning");
    else alert("Silakan upload gambar terlebih dahulu sebelum meng-crop.");
    return;
  }

  const modal = document.getElementById("elementImageCropModal");
  if (modal) modal.classList.remove("hidden");

  elemCropCanvas = document.getElementById("elemImageCropCanvas");
  if (!elemCropCanvas) return;
  elemCropCtx = elemCropCanvas.getContext("2d");

  // Reset preset ratio to 'free'
  elemCropCurrentRatio = 'free';
  document.querySelectorAll("#elemCropRatioGroup .elem-crop-ratio-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-ratio") === "free");
  });

  elemCropImg = new Image();
  elemCropImg.onload = function () {
    const maxW = 330;
    const maxH = 330;
    let canvasW = elemCropImg.width;
    let canvasH = elemCropImg.height;

    // Scale canvas to fit viewport nicely
    const ratio = Math.min(maxW / canvasW, maxH / canvasH, 1);
    canvasW = canvasW * ratio;
    canvasH = canvasH * ratio;

    elemCropCanvas.width = canvasW;
    elemCropCanvas.height = canvasH;

    const w = canvasW * 0.8;
    const h = canvasH * 0.8;
    elemCropRect = {
      x: (canvasW - w) / 2,
      y: (canvasH - h) / 2,
      w: w,
      h: h
    };

    elemCropCanvas.onmousedown = handleElemCropMouseDown;
    elemCropCanvas.onmousemove = handleElemCropMouseMove;
    window.addEventListener("mouseup", handleElemCropMouseUp);

    // Touch events for mobile/tablet
    elemCropCanvas.ontouchstart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousedown", { clientX: touch.clientX, clientY: touch.clientY });
      elemCropCanvas.dispatchEvent(mouseEvent);
    };
    elemCropCanvas.ontouchmove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousemove", { clientX: touch.clientX, clientY: touch.clientY });
      elemCropCanvas.dispatchEvent(mouseEvent);
    };
    elemCropCanvas.ontouchend = () => {
      window.dispatchEvent(new MouseEvent("mouseup", {}));
    };

    drawElemImageCrop();
  };
  elemCropImg.src = data.imageSrc;
}

function setElemCropRatio(ratio, btnEl) {
  elemCropCurrentRatio = ratio;
  document.querySelectorAll("#elemCropRatioGroup .elem-crop-ratio-btn").forEach(btn => {
    btn.classList.toggle("active", btn === btnEl);
  });

  if (!elemCropCanvas || !elemCropImg) return;

  if (ratio === 'free') {
    drawElemImageCrop();
    return;
  }

  let r = 1;
  if (ratio === '1:1') r = 1;
  else if (ratio === '4:3') r = 4 / 3;
  else if (ratio === '16:9') r = 16 / 9;
  else if (ratio === '9:16') r = 9 / 16;

  let newW = elemCropRect.w;
  let newH = newW / r;

  if (newH > elemCropCanvas.height * 0.9) {
    newH = elemCropCanvas.height * 0.9;
    newW = newH * r;
  }
  if (newW > elemCropCanvas.width * 0.9) {
    newW = elemCropCanvas.width * 0.9;
    newH = newW / r;
  }

  elemCropRect = {
    x: Math.max(0, (elemCropCanvas.width - newW) / 2),
    y: Math.max(0, (elemCropCanvas.height - newH) / 2),
    w: newW,
    h: newH
  };

  drawElemImageCrop();
}

function drawElemImageCrop() {
  if (!elemCropCanvas || !elemCropCtx || !elemCropImg) return;

  elemCropCtx.clearRect(0, 0, elemCropCanvas.width, elemCropCanvas.height);
  elemCropCtx.drawImage(elemCropImg, 0, 0, elemCropCanvas.width, elemCropCanvas.height);

  // Dark overlay
  elemCropCtx.fillStyle = "rgba(0, 0, 0, 0.55)";
  elemCropCtx.fillRect(0, 0, elemCropCanvas.width, elemCropCanvas.height);

  // Clear cropped view area
  elemCropCtx.save();
  elemCropCtx.beginPath();
  elemCropCtx.rect(elemCropRect.x, elemCropRect.y, elemCropRect.w, elemCropRect.h);
  elemCropCtx.clip();
  elemCropCtx.drawImage(elemCropImg, 0, 0, elemCropCanvas.width, elemCropCanvas.height);
  elemCropCtx.restore();

  // Border outline
  elemCropCtx.strokeStyle = "#38a0c4";
  elemCropCtx.lineWidth = 2;
  elemCropCtx.strokeRect(elemCropRect.x, elemCropRect.y, elemCropRect.w, elemCropRect.h);

  // Rule of thirds grid lines (Photoshop/Canva style)
  elemCropCtx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  elemCropCtx.lineWidth = 1;
  elemCropCtx.setLineDash([3, 3]);

  // Vertical grid lines
  elemCropCtx.beginPath();
  elemCropCtx.moveTo(elemCropRect.x + elemCropRect.w / 3, elemCropRect.y);
  elemCropCtx.lineTo(elemCropRect.x + elemCropRect.w / 3, elemCropRect.y + elemCropRect.h);
  elemCropCtx.moveTo(elemCropRect.x + (elemCropRect.w * 2) / 3, elemCropRect.y);
  elemCropCtx.lineTo(elemCropRect.x + (elemCropRect.w * 2) / 3, elemCropRect.y + elemCropRect.h);
  // Horizontal grid lines
  elemCropCtx.moveTo(elemCropRect.x, elemCropRect.y + elemCropRect.h / 3);
  elemCropCtx.lineTo(elemCropRect.x + elemCropRect.w, elemCropRect.y + elemCropRect.h / 3);
  elemCropCtx.moveTo(elemCropRect.x, elemCropRect.y + (elemCropRect.h * 2) / 3);
  elemCropCtx.lineTo(elemCropRect.x + elemCropRect.w, elemCropRect.y + (elemCropRect.h * 2) / 3);
  elemCropCtx.stroke();
  elemCropCtx.setLineDash([]);

  // Handles (4 corners + 4 midpoints)
  const handles = [
    { x: elemCropRect.x, y: elemCropRect.y }, // TL
    { x: elemCropRect.x + elemCropRect.w, y: elemCropRect.y }, // TR
    { x: elemCropRect.x, y: elemCropRect.y + elemCropRect.h }, // BL
    { x: elemCropRect.x + elemCropRect.w, y: elemCropRect.y + elemCropRect.h }, // BR
    { x: elemCropRect.x + elemCropRect.w / 2, y: elemCropRect.y }, // T
    { x: elemCropRect.x + elemCropRect.w / 2, y: elemCropRect.y + elemCropRect.h }, // B
    { x: elemCropRect.x, y: elemCropRect.y + elemCropRect.h / 2 }, // L
    { x: elemCropRect.x + elemCropRect.w, y: elemCropRect.y + elemCropRect.h / 2 } // R
  ];

  elemCropCtx.fillStyle = "#38a0c4";
  handles.forEach(h => {
    elemCropCtx.beginPath();
    elemCropCtx.arc(h.x, h.y, ELEM_CROP_HANDLE_SIZE / 2, 0, Math.PI * 2);
    elemCropCtx.fill();
    elemCropCtx.strokeStyle = "#ffffff";
    elemCropCtx.lineWidth = 1.5;
    elemCropCtx.stroke();
  });
}

function handleElemCropMouseDown(e) {
  const rect = elemCropCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (elemCropCanvas.width / rect.width);
  const y = (e.clientY - rect.top) * (elemCropCanvas.height / rect.height);

  const halfSz = ELEM_CROP_HANDLE_SIZE / 2;
  const isNear = (hx, hy) => Math.sqrt((x - hx) ** 2 + (y - hy) ** 2) < halfSz + 10;

  if (isNear(elemCropRect.x, elemCropRect.y)) elemCropActiveHandle = 'TL';
  else if (isNear(elemCropRect.x + elemCropRect.w, elemCropRect.y)) elemCropActiveHandle = 'TR';
  else if (isNear(elemCropRect.x, elemCropRect.y + elemCropRect.h)) elemCropActiveHandle = 'BL';
  else if (isNear(elemCropRect.x + elemCropRect.w, elemCropRect.y + elemCropRect.h)) elemCropActiveHandle = 'BR';
  else if (isNear(elemCropRect.x + elemCropRect.w / 2, elemCropRect.y)) elemCropActiveHandle = 'T';
  else if (isNear(elemCropRect.x + elemCropRect.w / 2, elemCropRect.y + elemCropRect.h)) elemCropActiveHandle = 'B';
  else if (isNear(elemCropRect.x, elemCropRect.y + elemCropRect.h / 2)) elemCropActiveHandle = 'L';
  else if (isNear(elemCropRect.x + elemCropRect.w, elemCropRect.y + elemCropRect.h / 2)) elemCropActiveHandle = 'R';
  else if (x > elemCropRect.x && x < elemCropRect.x + elemCropRect.w && y > elemCropRect.y && y < elemCropRect.y + elemCropRect.h) {
    elemCropActiveHandle = 'move';
    elemCropDragOffset = { x: x - elemCropRect.x, y: y - elemCropRect.y };
  } else {
    elemCropActiveHandle = null;
  }
}

function handleElemCropMouseMove(e) {
  if (!elemCropActiveHandle) return;

  const rect = elemCropCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (elemCropCanvas.width / rect.width);
  const y = (e.clientY - rect.top) * (elemCropCanvas.height / rect.height);

  const minSz = 25;

  let r = null;
  if (elemCropCurrentRatio === '1:1') r = 1;
  else if (elemCropCurrentRatio === '4:3') r = 4 / 3;
  else if (elemCropCurrentRatio === '16:9') r = 16 / 9;
  else if (elemCropCurrentRatio === '9:16') r = 9 / 16;

  if (elemCropActiveHandle === 'move') {
    elemCropRect.x = Math.max(0, Math.min(elemCropCanvas.width - elemCropRect.w, x - elemCropDragOffset.x));
    elemCropRect.y = Math.max(0, Math.min(elemCropCanvas.height - elemCropRect.h, y - elemCropDragOffset.y));
  } else if (elemCropActiveHandle === 'BR') {
    let newW = Math.max(minSz, Math.min(elemCropCanvas.width - elemCropRect.x, x - elemCropRect.x));
    let newH = r ? newW / r : Math.max(minSz, Math.min(elemCropCanvas.height - elemCropRect.y, y - elemCropRect.y));
    if (r && elemCropRect.y + newH > elemCropCanvas.height) {
      newH = elemCropCanvas.height - elemCropRect.y;
      newW = newH * r;
    }
    elemCropRect.w = newW;
    elemCropRect.h = newH;
  } else if (elemCropActiveHandle === 'TL') {
    let newW = Math.max(minSz, elemCropRect.x + elemCropRect.w - Math.max(0, x));
    let newH = r ? newW / r : Math.max(minSz, elemCropRect.y + elemCropRect.h - Math.max(0, y));
    elemCropRect.x = elemCropRect.x + elemCropRect.w - newW;
    elemCropRect.y = elemCropRect.y + elemCropRect.h - newH;
    elemCropRect.w = newW;
    elemCropRect.h = newH;
  } else if (elemCropActiveHandle === 'TR') {
    let newW = Math.max(minSz, Math.min(elemCropCanvas.width - elemCropRect.x, x - elemCropRect.x));
    let newH = r ? newW / r : Math.max(minSz, elemCropRect.y + elemCropRect.h - Math.max(0, y));
    elemCropRect.y = elemCropRect.y + elemCropRect.h - newH;
    elemCropRect.w = newW;
    elemCropRect.h = newH;
  } else if (elemCropActiveHandle === 'BL') {
    let newW = Math.max(minSz, elemCropRect.x + elemCropRect.w - Math.max(0, x));
    let newH = r ? newW / r : Math.max(minSz, Math.min(elemCropCanvas.height - elemCropRect.y, y - elemCropRect.y));
    elemCropRect.x = elemCropRect.x + elemCropRect.w - newW;
    elemCropRect.w = newW;
    elemCropRect.h = newH;
  } else if (elemCropActiveHandle === 'R') {
    elemCropRect.w = Math.max(minSz, Math.min(elemCropCanvas.width - elemCropRect.x, x - elemCropRect.x));
    if (r) elemCropRect.h = elemCropRect.w / r;
  } else if (elemCropActiveHandle === 'B') {
    elemCropRect.h = Math.max(minSz, Math.min(elemCropCanvas.height - elemCropRect.y, y - elemCropRect.y));
    if (r) elemCropRect.w = elemCropRect.h * r;
  } else if (elemCropActiveHandle === 'L') {
    const newW = Math.max(minSz, elemCropRect.x + elemCropRect.w - Math.max(0, x));
    elemCropRect.x = elemCropRect.x + elemCropRect.w - newW;
    elemCropRect.w = newW;
    if (r) elemCropRect.h = elemCropRect.w / r;
  } else if (elemCropActiveHandle === 'T') {
    const newH = Math.max(minSz, elemCropRect.y + elemCropRect.h - Math.max(0, y));
    elemCropRect.y = elemCropRect.y + elemCropRect.h - newH;
    elemCropRect.h = newH;
    if (r) elemCropRect.w = elemCropRect.h * r;
  }

  drawElemImageCrop();
}

function handleElemCropMouseUp() {
  elemCropActiveHandle = null;
}

function applyElementImageCrop() {
  if (!elemCropImg || !elemCropCanvas) return;

  const scale = elemCropImg.naturalWidth / elemCropCanvas.width;

  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = Math.round(elemCropRect.w * scale);
  exportCanvas.height = Math.round(elemCropRect.h * scale);
  const exportCtx = exportCanvas.getContext("2d");

  exportCtx.drawImage(
    elemCropImg,
    elemCropRect.x * scale,
    elemCropRect.y * scale,
    elemCropRect.w * scale,
    elemCropRect.h * scale,
    0,
    0,
    exportCanvas.width,
    exportCanvas.height
  );

  const croppedBase64 = exportCanvas.toDataURL("image/png");
  if (typeof updateSelectedElementImageSrc === "function") {
    updateSelectedElementImageSrc(croppedBase64);
  }

  if (typeof renderCanvas === "function") renderCanvas();
  if (typeof pushHistory === "function") pushHistory();
  if (typeof showToast === "function") showToast("Gambar berhasil di-crop!", "success");

  closeElementImageCropModal();
}

function closeElementImageCropModal() {
  const modal = document.getElementById("elementImageCropModal");
  if (modal) modal.classList.add("hidden");
  elemCropCanvas = null;
  elemCropCtx = null;
  window.removeEventListener("mouseup", handleElemCropMouseUp);
}

window.openElementImageCropModal = openElementImageCropModal;
window.closeElementImageCropModal = closeElementImageCropModal;
window.setElemCropRatio = setElemCropRatio;
window.applyElementImageCrop = applyElementImageCrop;

// CANVAS HEIGHT MANAGEMENT
window.canvasHeight = "";
window.bgImageWidth = null;
window.bgImageHeight = null;

function changeCanvasHeight(val) {
  const v = parseInt(val, 10);
  if (isNaN(v) || v < 100) {
    window.canvasHeight = "";
  } else {
    window.canvasHeight = v;
  }
  adjustCanvasHeight();
}

function setCanvasHeightToFitImage() {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;

  if (window.bgImageSrc && window.bgImageWidth && window.bgImageHeight) {
    const ratio = window.bgImageHeight / window.bgImageWidth;
    const currentWidth = canvas.clientWidth || 450;
    const fitHeight = Math.round(currentWidth * ratio);
    window.canvasHeight = fitHeight;

    const heightInput = document.getElementById("canvasHeightInput");
    if (heightInput) heightInput.value = fitHeight;

    adjustCanvasHeight();
    if (typeof pushHistory === "function") pushHistory();
  }
}

function resetCanvasHeightToDefault() {
  window.canvasHeight = "";
  const heightInput = document.getElementById("canvasHeightInput");
  if (heightInput) heightInput.value = "";
  adjustCanvasHeight();
  if (typeof pushHistory === "function") pushHistory();
}

function adjustCanvasHeight() {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;

  const isEdit = canvas.classList.contains("editing-active");
  let maxBottom = isEdit ? 600 : 0;
  const domElements = canvas.querySelectorAll(".builder-element");
  domElements.forEach(el => {
    if (el.parentNode !== canvas) return;
    const bottom = el.offsetTop + el.offsetHeight;
    if (bottom > maxBottom) {
      maxBottom = bottom;
    }
  });

  const finalHeight = maxBottom;

  let targetMinHeight = isEdit ? 600 : 0;
  if (window.canvasHeight && window.canvasHeight !== "") {
    const heightNum = parseInt(window.canvasHeight);
    targetMinHeight = Math.max(heightNum, finalHeight);
  } else {
    let baseHeight = isEdit ? 600 : 0;
    if (window.bgImageSrc && window.bgImageWidth && window.bgImageHeight) {
      const ratio = window.bgImageHeight / window.bgImageWidth;
      const currentWidth = canvas.clientWidth || 450;
      baseHeight = Math.round(currentWidth * ratio);
    }
    targetMinHeight = Math.max(baseHeight, finalHeight);
  }

  if (targetMinHeight > 0) {
    canvas.style.minHeight = targetMinHeight + "px";
  } else {
    canvas.style.minHeight = "auto";
  }
  canvas.style.height = "auto";

  const heightInput = document.getElementById("canvasHeightInput");
  if (heightInput) heightInput.value = targetMinHeight > 0 ? targetMinHeight : "";
}

// 3. AI MARKETING ASSISTANT
let lastSelectedAiText = "";
let focusedRegenerateText = "";

document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    const suggestionsDiv = document.getElementById("aiSuggestionsContent");
    if (suggestionsDiv && (suggestionsDiv.contains(selection.anchorNode) || suggestionsDiv === selection.anchorNode)) {
      lastSelectedAiText = selection.toString().trim();
    }
  }
});

function openAIAssistModal() {
  const modal = document.getElementById("aiAssistModal");
  if (modal) modal.classList.remove("hidden");
}

function closeAIAssistModal() {
  const modal = document.getElementById("aiAssistModal");
  if (modal) modal.classList.add("hidden");
  clearAiRegenerateFocus();
}

function setAiRegenerateFocus() {
  const activeSelection = window.getSelection() ? window.getSelection().toString().trim() : "";
  const txt = activeSelection || lastSelectedAiText;

  if (!txt) {
    if (typeof showToast === "function") {
      showToast("Silakan seleksi/blok bagian teks yang ingin di-generate ulang terlebih dahulu.", "info");
    }
    return;
  }

  focusedRegenerateText = txt;
  const badge = document.getElementById("aiRegenerateBadge");
  const preview = document.getElementById("aiRegeneratePreviewText");

  if (preview) preview.innerText = `"${txt}"`;
  if (badge) badge.classList.remove("hidden");

  const promptInput = document.getElementById("modalPropAiPrompt");
  if (promptInput) {
    promptInput.value = "";
    promptInput.placeholder = "Tulis instruksi revisi untuk teks di atas... (contoh: buat lebih singkat, ganti kata, dll)";
    promptInput.focus();
    promptInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (typeof showToast === "function") {
    showToast("Teks target diset! Tuliskan instruksi revisi yang diinginkan lalu klik tombol Hasilkan Teks Promosi.", "info");
  }
}

function clearAiRegenerateFocus() {
  focusedRegenerateText = "";
  const badge = document.getElementById("aiRegenerateBadge");
  if (badge) badge.classList.add("hidden");
  const promptInput = document.getElementById("modalPropAiPrompt");
  if (promptInput) {
    promptInput.placeholder = "Masukkan data usaha seadanya... (contoh: Ibu Jumliah jualan sayur bayam Rp 3.000, kangkung, tempe, tahu. Buka jam 6 pagi, segar dipetik subuh, depan gang melati)";
  }
}

function askAICopywriter() {
  const data = elements.find(item => item.id === selectedElementId);

  const promptInput = document.getElementById("modalPropAiPrompt");
  const prompt = promptInput ? promptInput.value.trim() : "";

  if (!prompt && !focusedRegenerateText) {
    if (typeof showToast === "function") showToast("Silakan masukkan data usaha atau instruksi promosi.", "info");
    return;
  }

  const spinner = document.getElementById("aiAssistSpinner");
  const btnText = document.getElementById("aiAssistBtnText");
  const suggestionsArea = document.getElementById("aiSuggestionsArea");
  const suggestionsContent = document.getElementById("aiSuggestionsContent");

  if (spinner) spinner.classList.remove("hidden");
  if (btnText) btnText.innerText = focusedRegenerateText ? "Menyusun Ulang Teks..." : "Memproses...";

  const targetToReplace = focusedRegenerateText;

  const payload = {
    prompt: prompt,
    refine_target: targetToReplace,
    type: data ? data.type : "text",
    current_content: data ? (data.content || "") : ""
  };

  fetch('/api/ai/copywriter_assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(resData => {
      if (spinner) spinner.classList.add("hidden");
      if (btnText) btnText.innerText = "Hasilkan Teks Promosi";

      if (resData.success && resData.response) {
        if (suggestionsArea && suggestionsContent) {
          if (targetToReplace && (suggestionsContent.innerHTML.includes(targetToReplace) || suggestionsContent.innerText.includes(targetToReplace))) {
            // In-place replacement: Hanya mengganti teks yang diseleksi, teks lain tetap utuh!
            let newText = resData.response.trim();
            newText = newText.replace(/^[\s]*[-*_]{3,}[\s]*$/gm, '');
            newText = newText.replace(/---/g, '');
            newText = newText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            newText = newText.replace(/^["'“](.*)["'”]$/s, '$1').trim();

            if (suggestionsContent.innerHTML.includes(targetToReplace)) {
              suggestionsContent.innerHTML = suggestionsContent.innerHTML.replace(targetToReplace, newText);
            } else {
              suggestionsContent.innerText = suggestionsContent.innerText.replace(targetToReplace, newText);
            }

            if (typeof showToast === "function") showToast("Teks terpilih berhasil diperbarui!", "success");
            clearAiRegenerateFocus();
          } else {
            // Full generation awal
            let formatted = resData.response;
            formatted = formatted.replace(/^[\s]*[-*_]{3,}[\s]*$/gm, '');
            formatted = formatted.replace(/---/g, '');
            formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            formatted = formatted.replace(/### (.*?)\n/g, '<h4 style="color:#206f8a;margin:12px 0 4px 0;font-size:13px;">$1</h4>');
            formatted = formatted.replace(/## (.*?)\n/g, '<h3 style="color:#2c5d6b;margin:14px 0 6px 0;font-size:14px;">$1</h3>');
            formatted = formatted.replace(/# (.*?)\n/g, '<h2 style="color:#2c5d6b;margin:16px 0 8px 0;font-size:15px;">$1</h2>');

            suggestionsContent.innerHTML = formatted;
            clearAiRegenerateFocus();
          }

          suggestionsArea.classList.remove("hidden");
          lastSelectedAiText = "";
        }
      } else {
        if (typeof showToast === "function") showToast("Gagal: " + (resData.error || "Terjadi kesalahan."), "error");
      }
    })
    .catch(err => {
      if (spinner) spinner.classList.add("hidden");
      if (btnText) btnText.innerText = "Hasilkan Teks Promosi";
      console.error(err);
      if (typeof showToast === "function") showToast("Gagal menghubungi asisten AI.", "error");
    });
}

function applyAiSuggestion() {
  const data = elements.find(item => item.id === selectedElementId);

  const contentDiv = document.getElementById("aiSuggestionsContent");
  if (!contentDiv) return;

  let txt = "";
  const activeSelection = window.getSelection() ? window.getSelection().toString().trim() : "";
  if (activeSelection) {
    txt = activeSelection;
  } else if (lastSelectedAiText) {
    txt = lastSelectedAiText;
  } else {
    txt = contentDiv.innerText.trim();
  }

  if (!txt) return;

  if (data) {
    data.content = txt;
    const textInput = document.getElementById("propTextContent");
    if (textInput) textInput.value = txt;
    if (typeof updateSelectedElementContent === "function") updateSelectedElementContent();
    if (typeof renderCanvas === "function") renderCanvas();
    const isPartial = (activeSelection || lastSelectedAiText) && txt !== contentDiv.innerText.trim();
    if (typeof showToast === "function") showToast(isPartial ? "Teks yang diseleksi berhasil diterapkan!" : "Teks AI berhasil diterapkan!", "success");
    lastSelectedAiText = "";
    closeAIAssistModal();
  } else {
    if (typeof showToast === "function") showToast("Teks AI disalin ke clipboard! Pilih elemen canvas terlebih dahulu untuk menempelkan.", "info");
    navigator.clipboard.writeText(txt);
    lastSelectedAiText = "";
    closeAIAssistModal();
  }
}

