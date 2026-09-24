/* ==========================================
   PROMOTION PAGE BUILDER - DRAG & DROP & RESIZE HANDLERS
   ========================================== */

// Get all root elements' bottom edges in px (excluding the dragged element)
function getSnapEdges(excludeId) {
  const canvasRect = canvas.getBoundingClientRect();
  const scrollTop = getCanvasScrollable().scrollTop || 0;
  const edges = [];
  elements.forEach(item => {
    if (item.id === excludeId || item.parentId) return;
    const el = document.getElementById(item.id);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const bottomPx = r.bottom - canvasRect.top + scrollTop;
    const topPx = r.top - canvasRect.top + scrollTop;
    edges.push({ id: item.id, top: topPx, bottom: bottomPx });
  });
  return edges;
}

// DRAGGING & RESIZING EVENTS ON DOCUMENT
document.addEventListener("mousemove", (e) => {
  if (isDragging && dragEl) {
    const canvasRect = canvas.getBoundingClientRect();
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    let rawTopPx = dragStartTop + dy;
    let rawLeftPx = dragStartLeft + dx;

    let snapped = false;
    const edges = getSnapEdges(dragEl.id);
    const gapBottom = parseInt((elements.find(i => i.id === dragEl.id) || {}).style?.gapBottom) || 0;
    for (const edge of edges) {
      const targetTopPx = edge.bottom + gapBottom;
      if (Math.abs(rawTopPx - targetTopPx) <= SNAP_THRESHOLD) {
        rawTopPx = targetTopPx;
        snapped = true;
        showSnapGuide(edge.bottom);
        break;
      }
      if (Math.abs(rawTopPx - edge.top) <= SNAP_THRESHOLD) {
        rawTopPx = edge.top;
        snapped = true;
        showSnapGuide(edge.top);
        break;
      }
    }
    if (!snapped) hideSnapGuide();

    const newLeftPercent = Math.max(0, Math.min(100, (rawLeftPx / canvasRect.width) * 100));

    dragEl.style.left = `${newLeftPercent.toFixed(2)}%`;
    dragEl.style.top = `${rawTopPx.toFixed(0)}px`;

    const data = elements.find((item) => item.id === dragEl.id);
    if (data) {
      data.style.left = dragEl.style.left;
      data.style.top = dragEl.style.top;
    }

    const topPxInput = document.getElementById("propTopPx");
    if (topPxInput && selectedElementId === dragEl.id) {
      topPxInput.value = Math.round(rawTopPx);
    }

    if (typeof adjustCanvasHeight === "function") adjustCanvasHeight();
  } else if (isResizing && resizeEl) {
    const rect = canvas.getBoundingClientRect();
    const dx = e.clientX - resizeStartX;
    const dy = e.clientY - resizeStartY;

    const newWidthPx = resizeStartWidth + dx;
    const newHeightPx = resizeStartHeight + dy;

    const newWidthPercent = (newWidthPx / rect.width) * 100;

    const clampedWidth = Math.max(5, Math.min(100, newWidthPercent));
    resizeEl.style.width = `${clampedWidth.toFixed(2)}%`;
    resizeEl.style.height = `${Math.max(15, newHeightPx)}px`;

    const data = elements.find((item) => item.id === resizeEl.id);
    if (data) {
      data.style.width = resizeEl.style.width;
      data.style.height = resizeEl.style.height;
    }

    if (selectedElementId === resizeEl.id) {
      const propWidth = document.getElementById("propWidth");
      if (propWidth) propWidth.value = parseInt(clampedWidth);
      const widthVal = document.getElementById("widthVal");
      if (widthVal) widthVal.innerText = parseInt(clampedWidth);
      const propHeight = document.getElementById("propHeight");
      if (propHeight) propHeight.value = Math.max(15, newHeightPx);
    }
  }
});

document.addEventListener("mouseup", () => {
  if (isDragging || isResizing) {
    if (typeof pushHistory === "function") pushHistory();
  }
  isDragging = false;
  isResizing = false;
  dragEl = null;
  resizeEl = null;
  hideSnapGuide();
});

// HTML5 DRAG AND DROP FROM TOOLBOX
document.querySelectorAll('.toolbox-chip[draggable="true"]').forEach((item) => {
  item.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/type", item.dataset.type);
  });
});

canvas.addEventListener("dragover", (e) => {
  e.preventDefault();
});

canvas.addEventListener("drop", (e) => {
  e.preventDefault();
  if (!isEditMode) return;

  const type = e.dataTransfer.getData("text/type");
  if (!type) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const left = (x / rect.width) * 100;
  const top = y;

  createNewElement(type, left, top);
});

function createNewElementAtIndex(type, index, parentId = null) {
  const id = "el-" + Math.random().toString(36).substr(2, 9);
  const isTitle = type === "title";
  const isBtn = type === "button";
  const defaultWidth = parentId ? "100%" : (isTitle ? "90%" : (isBtn ? "76%" : "85%"));

  let newElement = {
    id: id,
    type: type,
    parentId: parentId,
    alignmentPreset: "center",
    content:
      type === "button"
        ? "Hubungi WhatsApp"
        : type === "title"
          ? "Judul Baru"
          : "Masukkan penjelasan di sini...",
    style: {
      width: defaultWidth,
      height: "auto",
      alignSelf: "center",
      textAlign: "center",
      zIndex: "1",
      borderRadius: "8px",
    },
  };

  if (type === "title") {
    newElement.style.color = "#2c5d6b";
    newElement.style.fontSize = "24px";
    newElement.style.fontWeight = "700";
    newElement.style.textAlign = "center";
  } else if (type === "text") {
    newElement.style.color = "#7a8a94";
    newElement.style.fontSize = "14px";
    newElement.style.fontWeight = "400";
    newElement.style.textAlign = "center";
  } else if (type === "image") {
    newElement.imageSrc = "";
    newElement.style.height = "150px";
    newElement.style.objectFit = "cover";
  } else if (type === "shape") {
    newElement.style.backgroundColor = "rgba(56, 160, 196, 0.1)";
    newElement.style.height = "auto";
    newElement.style.padding = "0px";
    newElement.style.borderStyle = "solid";
    newElement.style.borderColor = "rgba(56, 160, 196, 0.2)";
    newElement.style.borderWidth = "1px";
  } else if (type === "container") {
    newElement.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    newElement.style.height = "auto";
    newElement.style.borderStyle = "dashed";
    newElement.style.borderColor = "rgba(56, 160, 196, 0.3)";
    newElement.style.borderWidth = "2px";
    newElement.style.padding = "0px";
  } else if (type === "column") {
    newElement.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
    newElement.style.height = "auto";
    newElement.style.padding = "0px";
    newElement.style.borderStyle = "solid";
    newElement.style.borderColor = "rgba(56, 160, 196, 0.1)";
    newElement.style.borderWidth = "1px";
  } else if (type === "row") {
    newElement.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
    newElement.style.height = "auto";
    newElement.style.padding = "0px";
    newElement.style.borderStyle = "solid";
    newElement.style.borderColor = "rgba(56, 160, 196, 0.1)";
    newElement.style.borderWidth = "1px";
  } else if (type === "box-interaktif" || type === "box_interaktif") {
    newElement.type = "box-interaktif";
    newElement.boxConfig = {
      mode: "expand_collapse",
      items: [
        { title: "Judul Panel 1" },
        { title: "Judul Panel 2" },
        { title: "Judul Panel 3" }
      ],
      tabs: [
        { title: "Tab 1" },
        { title: "Tab 2" },
        { title: "Tab 3" }
      ],
      activeItemIndex: 0,
      activeTabIndex: 0,
      isFlipped: false,
      sendDataToButton: true,
      messageText: "Pilihan Saya: {pilihan}",
      bgColor: "#ffffff",
      itemBgColor: "#ffffff",
      headerColor: "#2c5d6b",
      textColor: "#5a6a74",
      accentColor: "#38a0c4"
    };
    newElement.style.height = "auto";
    newElement.style.borderRadius = "14px";


  } else if (type === "carousel") {
    newElement.slidesCount = 3;
    newElement.carouselActiveIndex = 0;
    newElement.carouselSpeed = 3;
    newElement.arrowBgColor = "rgba(0, 0, 0, 0.45)";
    newElement.arrowColor = "#ffffff";
    newElement.arrowHoverBgColor = "#38a0c4";
    newElement.arrowShape = "50%";
    newElement.style.backgroundColor = "#eef6f9";
    newElement.style.height = "250px";
    newElement.style.minHeight = "200px";
    newElement.style.borderRadius = "14px";
  } else if (type === "button") {
    newElement.btnDesignType = "simple_button";
    newElement.btnLinkType = "whatsapp";
    newElement.url = "https://wa.me/";
    newElement.style.backgroundColor = "#38a0c4";
    newElement.style.color = "#ffffff";
    newElement.style.height = "45px";
    newElement.style.textAlign = "center";
  } else if (type === "media_embed") {
    newElement.url = "";
    newElement.cardBg = "transparent";
    newElement.style.backgroundColor = "transparent";
    newElement.style.background = "transparent";
    newElement.style.height = "250px";
    newElement.style.borderRadius = "12px";
  } else if (type === "genui_chatbot") {
    newElement.chatbotConfig = {
      botName: "AI Assistant",
      headerAlign: "left",
      welcomeMsg: "Halo! Ada yang bisa saya bantu?",
      showHeader: true,
      headerBg: "#38a0c4",
      headerTextColor: "#ffffff",
      cardBg: "#fafcfd",
      bgImageUrl: "",
      showBubbleAvatars: false,
      avatarUrl: "",
      userAvatarUrl: "",
      botBg: "#38a0c4",
      botTextColor: "#ffffff",
      userBg: "#0F4C75",
      userTextColor: "#ffffff",
      fontSize: "13px",
      chipsPosition: "inside",
      chipBg: "#ffffff",
      chipTextColor: "#0F4C75",
      chipBorderColor: "#bddce7",
      chipRadius: "16px",
      inputContainerBgEnabled: false,
      inputContainerBg: "transparent",
      inputBg: "#ffffff",
      inputBorderColor: "#bddce7",
      inputTextColor: "#2c5d6b",
      inputBorderRadius: "12px",
      placeholderText: "Ketik pertanyaan RAG...",
      sendBtnMode: "icon_text",
      sendBtnText: "Kirim",
      sendBtnBg: "#38a0c4",
      sendBtnTextColor: "#ffffff"
    };
    newElement.style.height = "320px";
    newElement.style.borderRadius = "14px";
  }

  if (index >= 0 && index <= elements.length) {
    elements.splice(index, 0, newElement);
  } else {
    elements.push(newElement);
  }

  renderCanvas();
  selectElement(id);
  if (typeof pushHistory === "function") pushHistory();
}

function createNewElement(type, left = 10, top = 30, parentId = null) {
  createNewElementAtIndex(type, elements.length, parentId);
}
