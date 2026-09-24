/* ==========================================
   PROMOTION PAGE BUILDER - STATE & INITIALIZATION
   ========================================== */

const actorId = window.unique_id || "{{ unique_id }}";
let rawData = window.promotion_page_data || `{{ promotion_page_data|safe }}`;

// Fallback if data is empty
if (rawData === "None" || rawData.trim() === "" || rawData.trim() === "[]") {
  rawData = "[]";
}

let isEditMode = false;
let elements = [];
let selectedElementId = null;
let originalScrollTop = null;

// Undo/Redo History Stacks
let undoStack = [];
let redoStack = [];
const MAX_HISTORY_LIMIT = 50;

const defaultCarouselImages = [];
let carouselIntervals = {};

// Drag status
let isDragging = false;
let dragStartX, dragStartY;
let dragStartLeft, dragStartTop;
let dragEl = null;

// Resize status
let isResizing = false;
let resizeStartX, resizeStartY;
let resizeStartWidth, resizeStartHeight;
let resizeEl = null;

const canvas = document.getElementById("canvas");

// Parse data awal
try {
  if (rawData !== "[]") {
    const parsed = JSON.parse(rawData);
    if (parsed.elements) {
      elements = parsed.elements;
    } else if (Array.isArray(parsed)) {
      elements = parsed;
    }

    // Restore Background Style jika ada
    if (parsed.background) {
      const bgTypeSelect = document.getElementById("bgType");
      if (bgTypeSelect) {
        const bgType = (parsed.background.type === "gradient") ? "color" : (parsed.background.type || "color");
        bgTypeSelect.value = bgType;

        // Restore custom height if present
        if (parsed.background.canvasHeight) {
          window.canvasHeight = parsed.background.canvasHeight;
          const heightInput = document.getElementById("canvasHeightInput");
          if (heightInput) heightInput.value = window.canvasHeight;
        }

        if (parsed.background.fillData) {
          window.pageBgFillData = parsed.background.fillData;
        } else {
          let initColor = parsed.background.color || "#f2f7f9";
          let initType = "solid";
          if (parsed.background.style && parsed.background.style.includes("gradient")) {
            initType = parsed.background.style.includes("radial") ? "radial" : "linear";
          }
          window.pageBgFillData = {
            enabled: true,
            type: initType,
            color: initColor,
            opacity: 100,
            gradient: {
              angle: 135,
              stops: [
                { position: 0, color: "#dfecf1", opacity: 100 },
                { position: 100, color: "#ffffff", opacity: 100 }
              ]
            }
          };
        }

        if (bgType === "color") {
          if (parsed.background.style) {
            canvas.style.background = parsed.background.style;
          }
          if (typeof updateBgStyle === "function") updateBgStyle();
          if (typeof adjustCanvasHeight === "function") adjustCanvasHeight();
        } else if (bgType === "image") {
          window.bgImageSrc = parsed.background.imageSrc || "";
          window.bgImageOpacity = parsed.background.opacity !== undefined ? parsed.background.opacity : 1.0;

          if (window.bgImageSrc) {
            const tempImg = new Image();
            tempImg.onload = function () {
              window.bgImageWidth = tempImg.width;
              window.bgImageHeight = tempImg.height;
              if (typeof adjustCanvasHeight === "function") adjustCanvasHeight();
            };
            tempImg.src = window.bgImageSrc;
          } else {
            if (typeof adjustCanvasHeight === "function") adjustCanvasHeight();
          }
          if (typeof updateBgStyle === "function") updateBgStyle();
        }
      }
    }
  } else {
    canvas.style.background = "#f2f7f9";
  }
} catch (e) {
  console.error("Gagal meload data awal:", e);
  canvas.style.background = "#f2f7f9";
}

// Update name and photo automatically from business actor data if not customized
if (elements && elements.length > 0) {
  if (window.actorName) {
    const titleEl = elements.find(el => el.type === "title" && (!el.headingTag || el.headingTag === "h1" || el.headingTag === "h2"));
    if (titleEl && (!titleEl.content || titleEl.content === "{{ name }}")) {
      titleEl.content = window.actorName;
    }
  }
  if (window.actorFoto && window.actorFoto.trim() !== "" && window.actorFoto !== "{{ foto_visual }}") {
    const imgEl = elements.find(el => el.type === "image");
    if (imgEl && (!imgEl.imageSrc || (!imgEl.imageSrc.startsWith("data:") && !imgEl.imageSrc.includes("no-image.svg") && !imgEl.imageSrc.includes("img-temp.svg")))) {
      imgEl.imageSrc = window.actorFoto;
    }
  }
}

// Jika kosong, masukkan template awal yang indah agar tidak kosong
if (elements.length === 0) {
  const boxId = "el-" + Math.random().toString(36).substr(2, 9);
  const defaultImageSrc = (window.actorFoto && window.actorFoto.trim() !== "" && window.actorFoto !== "{{ foto_visual }}")
    ? window.actorFoto
    : "/static/image/icon/img-temp.svg";

  elements = [
    {
      id: boxId,
      type: "shape",
      style: {
        width: "90%",
        height: "auto",
        minHeight: "440px",
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        borderStyle: "solid",
        borderColor: "#bddce7",
        borderWidth: "1.5px",
        boxShadow: "0 8px 24px rgba(44, 93, 107, 0.08)",
        padding: "24px 16px",
        margin: "24px auto",
        zIndex: "1",
      },
    },
    {
      id: "el-" + Math.random().toString(36).substr(2, 9),
      parentId: boxId,
      type: "image",
      imageSrc: defaultImageSrc,
      style: {
        width: "100%",
        height: "220px",
        borderRadius: "12px",
        objectFit: "contain",
        backgroundColor: "transparent",
        zIndex: "1",
      },
    },
    {
      id: "el-" + Math.random().toString(36).substr(2, 9),
      parentId: boxId,
      type: "title",
      headingTag: "h2",
      content: window.actorName || "{{ name }}",
      style: {
        width: "100%",
        height: "auto",
        color: "#2c5d6b",
        fontSize: "24px",
        fontWeight: "800",
        textAlign: "center",
        margin: "12px 0 2px 0",
        zIndex: "2",
      },
    },
    {
      id: "el-" + Math.random().toString(36).substr(2, 9),
      parentId: boxId,
      type: "title",
      headingTag: "h3",
      content: "Belum Ada Desain Halaman",
      style: {
        width: "100%",
        height: "auto",
        color: "#38a0c4",
        fontSize: "16px",
        fontWeight: "700",
        textAlign: "center",
        margin: "2px 0 8px 0",
        zIndex: "2",
      },
    },
    {
      id: "el-" + Math.random().toString(36).substr(2, 9),
      parentId: boxId,
      type: "text",
      content:
        "Maaf, Anda belum memiliki desain halaman promosi untuk aktor ini. Silakan mulai berkreasi dan buat tata letak halaman promosi Anda menggunakan panel builder yang tersedia.",
      style: {
        width: "100%",
        height: "auto",
        color: "#7a8a94",
        fontSize: "13px",
        fontWeight: "400",
        lineHeight: "1.6",
        textAlign: "center",
        margin: "0 0 8px 0",
        zIndex: "2",
      },
    },
  ];
}

function convertPercentagesToPixels() {
  const canvasH = 800; // default height
  elements.forEach(item => {
    if (!item.parentId && item.style && item.style.top && typeof item.style.top === "string" && item.style.top.endsWith('%')) {
      const pct = parseFloat(item.style.top);
      if (!isNaN(pct)) {
        item.style.top = `${Math.round((pct / 100) * canvasH)}px`;
      }
    }
  });
}

// Convert percentages of top coordinate to pixel values
convertPercentagesToPixels();
