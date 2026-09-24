/* ==========================================
   PROMOTION PAGE BUILDER - LAYER MANAGER & SAVE/EXPORT ACTIONS
   ========================================== */

// LAYER SYSTEM PANEL LOGIC
// LAYER SYSTEM & PUBLISH MODE LOGIC
window.isPublishMode = false;
window.selectedPublishElementIds = new Set();
window.availablePublishTags = ["Hero", "Katalog", "Form", "Fitur", "Testimonial", "Box Interaktif", "Kontak", "Footer", "Umum"];
window.selectedPublishTag = "Hero";

function toggleLayersPanel() {
  const panel = document.getElementById("layersPanel");
  if (!panel) return;
  panel.classList.toggle("hidden");

  if (!panel.classList.contains("hidden")) {
    renderLayersPanelContent();
  } else {
    exitPublishMode();
  }
}

function togglePublishMode() {
  window.isPublishMode = !window.isPublishMode;
  const btn = document.getElementById("btnTogglePublishMode");
  const footer = document.getElementById("layersPublishFooter");

  if (window.isPublishMode) {
    if (btn) btn.classList.add("active");
    if (footer) footer.classList.remove("hidden");
    // Preselect current element if selected
    if (selectedElementId) {
      togglePublishCheckboxRecursive(selectedElementId, true);
    }
  } else {
    exitPublishMode();
    return;
  }
  updatePublishFooterState();
  renderLayersPanelContent();
}

function exitPublishMode() {
  window.isPublishMode = false;
  window.selectedPublishElementIds.clear();
  const btn = document.getElementById("btnTogglePublishMode");
  const footer = document.getElementById("layersPublishFooter");
  if (btn) btn.classList.remove("active");
  if (footer) footer.classList.add("hidden");
  renderLayersPanelContent();
}

function togglePublishCheckboxRecursive(elementId, isChecked) {
  if (isChecked) {
    window.selectedPublishElementIds.add(elementId);
  } else {
    window.selectedPublishElementIds.delete(elementId);
  }

  // Also select all children recursively
  function checkChildren(parentId) {
    elements.forEach(el => {
      if (el.parentId === parentId || (el.parentId && (el.parentId.startsWith(parentId + "_slide_") || el.parentId === parentId + "_content" || el.parentId.startsWith(parentId + "_")))) {
        if (isChecked) window.selectedPublishElementIds.add(el.id);
        else window.selectedPublishElementIds.delete(el.id);
        checkChildren(el.id);
      }
    });
  }
  checkChildren(elementId);
  updatePublishFooterState();
}

function updatePublishFooterState() {
  const countEl = document.getElementById("publishSelectedCount");
  const submitBtn = document.getElementById("btnOpenPublishModal");
  const count = window.selectedPublishElementIds.size;
  if (countEl) countEl.innerText = count;
  if (submitBtn) {
    submitBtn.disabled = count === 0;
  }
}

function renderLayersPanelContent() {
  const container = document.getElementById("layersListContainer") || document.getElementById("layersContent");
  if (!container) return;
  container.innerHTML = "";

  if (!elements || elements.length === 0) {
    container.innerHTML = `<div class="empty-layers-msg">Belum ada elemen di canvas</div>`;
    return;
  }

  const childrenMap = {};
  elements.forEach(item => {
    if (item.parentId) {
      if (!childrenMap[item.parentId]) childrenMap[item.parentId] = [];
      childrenMap[item.parentId].push(item);
    }
  });

  const rootElements = elements.filter(item => {
    if (!item.parentId) return true;
    const hasParent = elements.some(p => p.id === item.parentId || (p.type === "carousel" && item.parentId.startsWith(p.id + "_slide_")) || (p.type === "genui_chatbot" && item.parentId === p.id + "_content") || (["box-interaktif", "box_interaktif"].includes(p.type) && item.parentId.startsWith(p.id + "_")));
    return !hasParent;
  });

  const visitedLayerIds = new Set();
  function createLayerItem(item, depth = 0) {
    if (!item || !item.id || visitedLayerIds.has(item.id)) return;
    visitedLayerIds.add(item.id);

    const div = document.createElement("div");
    div.className = `layer-item ${selectedElementId === item.id ? "active" : ""}`;
    div.style.paddingLeft = `${depth * 16 + 10}px`;

    let typeName = item.type.toUpperCase();
    if (item.type === "title") typeName = item.headingTag ? item.headingTag.toUpperCase() : "Judul";
    else if (item.type === "text") typeName = item.listMode === "bullet" ? "List Poin" : (item.listMode === "numbered" ? "List Angka" : "Paragraf");
    else if (item.type === "shape") typeName = "Box";
    else if (item.type === "container") typeName = "Kontainer";
    else if (item.type === "column") typeName = "Kolom";
    else if (item.type === "row") typeName = "Baris";
    else if (item.type === "carousel") typeName = "Carousel";
    else if (item.type === "button") typeName = "Tombol";
    else if (item.type === "image") typeName = "Gambar";
    else if (item.type === "genui_chatbot") typeName = "AI Chatbot";
    else if (item.type === "box-interaktif" || item.type === "box_interaktif") typeName = "Box Interaktif";

    let labelText = `<strong>[${typeName}]</strong>`;
    if (item.content && item.type !== "column" && item.type !== "row" && item.type !== "container") {
      const truncated = item.content.length > 15 ? item.content.substr(0, 12) + "..." : item.content;
      labelText += ` - "${truncated}"`;
    } else {
      labelText += ` (${item.id.substr(3, 4)})`;
    }

    const info = document.createElement("span");
    info.className = "layer-info";
    info.innerHTML = labelText;
    div.appendChild(info);

    div.addEventListener("mouseenter", () => {
      const el = document.getElementById(item.id);
      if (el) el.classList.add("highlight-element");
    });
    div.addEventListener("mouseleave", () => {
      const el = document.getElementById(item.id);
      if (el) el.classList.remove("highlight-element");
    });

    div.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.isPublishMode) {
        const isChecked = !window.selectedPublishElementIds.has(item.id);
        togglePublishCheckboxRecursive(item.id, isChecked);
        renderLayersPanelContent();
      } else {
        if (typeof selectElement === "function") selectElement(item.id);
      }
    });

    if (window.isPublishMode) {
      // CHECKBOX FOR PUBLISH MODE
      const chkWrap = document.createElement("div");
      chkWrap.className = "layer-checkbox-wrap";

      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.className = "custom-checkbox layer-item-checkbox";
      chk.checked = window.selectedPublishElementIds.has(item.id);
      chk.title = "Pilih untuk Publish ke UI Kit";

      chk.addEventListener("click", (e) => {
        e.stopPropagation();
      });
      chk.addEventListener("change", (e) => {
        e.stopPropagation();
        togglePublishCheckboxRecursive(item.id, e.target.checked);
        renderLayersPanelContent();
      });

      chkWrap.appendChild(chk);
      div.appendChild(chkWrap);
    } else {
      // NORMAL EDIT ACTIONS
      const actions = document.createElement("div");
      actions.className = "layer-actions-row";

      const selectParent = document.createElement("select");
      selectParent.className = "layer-parent-select";
      selectParent.title = "Pindah Parent";

      const optNone = document.createElement("option");
      optNone.value = "";
      optNone.text = "Canvas Utama";
      if (!item.parentId) optNone.selected = true;
      selectParent.appendChild(optNone);

      elements.forEach(other => {
        if (other.id !== item.id && ["shape", "container", "row", "column", "carousel", "genui_chatbot", "box-interaktif", "box_interaktif"].includes(other.type)) {
          let isDescendant = false;
          let checkParent = other.parentId;
          while (checkParent) {
            if (checkParent === item.id) {
              isDescendant = true;
              break;
            }
            const pEl = elements.find(x => x.id === checkParent || (x.type === "carousel" && checkParent.startsWith(x.id + "_slide_")) || (x.type === "genui_chatbot" && checkParent === x.id + "_content") || (["box-interaktif", "box_interaktif"].includes(x.type) && checkParent.startsWith(x.id + "_")));
            checkParent = pEl ? pEl.parentId : null;
          }

          if (!isDescendant) {
            if (other.type === "carousel") {
              const numSlides = other.slidesCount || 3;
              for (let idx = 0; idx < numSlides; idx++) {
                const slideId = `${other.id}_slide_${idx}`;
                const opt = document.createElement("option");
                opt.value = slideId;
                opt.text = `Carousel (${other.id.substr(3, 4)}) - Slide ${idx + 1}`;
                if (item.parentId === slideId || (item.parentId === other.id && item.slideIndex === idx)) opt.selected = true;
                selectParent.appendChild(opt);
              }
            } else if (other.type === "genui_chatbot") {
              const cfg = other.chatbotConfig || {};
              if (cfg.enableCustomContent) {
                const slotId = `${other.id}_content`;
                const opt = document.createElement("option");
                opt.value = slotId;
                opt.text = `AI Chatbot (${other.id.substr(3, 4)}) - Konten Kustom`;
                if (item.parentId === slotId || item.parentId === other.id) opt.selected = true;
                selectParent.appendChild(opt);
              }
            } else {
              const opt = document.createElement("option");
              opt.value = other.id;
              let otherType = other.type.toUpperCase();
              if (other.type === "shape") otherType = "Box";
              else if (other.type === "container") otherType = "Kontainer";
              else if (other.type === "column") otherType = "Kolom";
              else if (other.type === "row") otherType = "Baris";
              else if (other.type === "box-interaktif" || other.type === "box_interaktif") otherType = "Box Interaktif";
              opt.text = `${otherType} (${other.id.substr(3, 4)})`;
              if (item.parentId === other.id) opt.selected = true;
              selectParent.appendChild(opt);
            }
          }
        }
      });

      selectParent.addEventListener("change", (e) => {
        e.stopPropagation();
        const newParentId = e.target.value || null;
        changeElementParent(item.id, newParentId);
      });
      actions.appendChild(selectParent);

      const delBtn = document.createElement("button");
      delBtn.className = "layer-del-btn";
      delBtn.innerHTML = `<img src="/static/image/icon/delete.svg" style="width: 16px; height: 16px;" alt="Hapus">`;
      delBtn.title = "Hapus";
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteElementById(item.id);
      });
      actions.appendChild(delBtn);

      div.appendChild(actions);
    }

    container.appendChild(div);

    const children = childrenMap[item.id] || [];
    children.forEach(child => {
      createLayerItem(child, depth + 1);
    });
  }

  rootElements.forEach(item => {
    createLayerItem(item, 0);
  });
}
window.renderLayers = renderLayersPanelContent;
window.renderLayersPanelContent = renderLayersPanelContent;

// ══════════════════════════════════════════════════════════════
// PUBLISH MODAL & SUBMIT TO UI KIT
// ══════════════════════════════════════════════════════════════
async function openPublishModal() {
  if (window.selectedPublishElementIds.size === 0) {
    if (typeof showToast === "function") showToast("Pilih minimal 1 elemen untuk dipublish.", "error");
    return;
  }

  const modal = document.getElementById("publishConfirmModal");
  if (!modal) return;

  const selectedList = elements.filter(el => window.selectedPublishElementIds.has(el.id));
  const rootEl = selectedList.find(el => !el.parentId || !window.selectedPublishElementIds.has(el.parentId)) || selectedList[0];

  const inputName = document.getElementById("inputPublishName");
  if (inputName) {
    inputName.value = (rootEl && rootEl.content) ? rootEl.content.substr(0, 24) : (rootEl ? `Template ${rootEl.type.toUpperCase()}` : "Template Blok Baru");
  }

  // Pre-capture screenshot of the root parent element directly from canvas before overlay covers screen
  window.pendingPublishThumbnail = "";
  try {
    const domEl = document.getElementById(rootEl.id);
    if (typeof html2canvas === "function" && domEl) {
      const wasSelected = domEl.classList.contains("selected");
      domEl.classList.remove("selected", "highlight-element");
      document.querySelectorAll(".highlight-element").forEach(e => e.classList.remove("highlight-element"));

      const cv = await html2canvas(domEl, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      window.pendingPublishThumbnail = cv.toDataURL("image/webp", 0.85);

      if (wasSelected) domEl.classList.add("selected");
    }
  } catch (err) {
    console.warn("[openPublishModal] Snapshot capture warning:", err);
  }

  renderPublishTagChips();
  modal.classList.remove("hidden");
}

function closePublishModal() {
  const modal = document.getElementById("publishConfirmModal");
  if (modal) modal.classList.add("hidden");
}

function renderPublishTagChips() {
  const container = document.getElementById("publishTagChips");
  if (!container) return;
  container.innerHTML = "";

  window.availablePublishTags.forEach(tag => {
    const chip = document.createElement("div");
    chip.className = `publish-tag-chip ${window.selectedPublishTag === tag ? "active" : ""}`;
    chip.innerText = tag;
    chip.onclick = () => {
      window.selectedPublishTag = tag;
      renderPublishTagChips();
    };
    container.appendChild(chip);
  });
}

function addCustomPublishTag() {
  const input = document.getElementById("inputPublishCustomTag");
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;

  if (!window.availablePublishTags.includes(val)) {
    window.availablePublishTags.push(val);
  }
  window.selectedPublishTag = val;
  input.value = "";
  renderPublishTagChips();
}

async function submitPublishTemplate() {
  const inputName = document.getElementById("inputPublishName");
  const name = (inputName ? inputName.value.trim() : "") || "Template Blok";
  const tag = window.selectedPublishTag || "Umum";
  const submitBtn = document.getElementById("btnSubmitPublish");

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "Memproses...";
  }

  // 1. Ambil semua elemen terpilih
  const selectedList = elements.filter(el => window.selectedPublishElementIds.has(el.id));
  if (selectedList.length === 0) {
    if (typeof showToast === "function") showToast("Tidak ada elemen yang dipilih.", "error");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = "Publish";
    }
    return;
  }

  // 2. Clone deep agar mandiri
  const cloned = JSON.parse(JSON.stringify(selectedList));

  // 3. Ambil thumbnail snapshot dari parent element
  let thumbnailData = window.pendingPublishThumbnail || "";
  if (!thumbnailData) {
    try {
      const rootEl = selectedList.find(el => !el.parentId || !window.selectedPublishElementIds.has(el.parentId)) || selectedList[0];
      const domEl = document.getElementById(rootEl.id) || document.getElementById("canvas");
      if (typeof html2canvas === "function" && domEl) {
        const cv = await html2canvas(domEl, {
          backgroundColor: null,
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true
        });
        thumbnailData = cv.toDataURL("image/webp", 0.85);
      }
    } catch (err) {
      console.warn("[submitPublishTemplate] html2canvas error, fallback used:", err);
    }
  }

  // 4. Send to backend
  const payload = {
    name: name,
    tag: tag,
    thumbnail: thumbnailData,
    elements: cloned
  };

  fetch("/api/uikit/template/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        if (typeof showToast === "function") {
          showToast(`Template "${name}" berhasil dipublish ke UI Kit!`, "success");
        }
        closePublishModal();
        exitPublishMode();
        if (typeof loadUIKitTemplates === "function") {
          loadUIKitTemplates();
        }
      } else {
        if (typeof showToast === "function") {
          showToast("Gagal mempublish: " + (data.error || "Kesalahan server"), "error");
        }
      }
    })
    .catch(err => {
      console.error(err);
      if (typeof showToast === "function") {
        showToast("Koneksi bermasalah saat mempublish template.", "error");
      }
    })
    .finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Publish";
      }
    });
}


function changeElementParent(elementId, newParentId) {
  const data = elements.find(item => item.id === elementId);
  if (!data) return;

  data.parentId = newParentId;

  if (!newParentId) {
    data.style.position = "absolute";
    data.style.left = "10%";
    data.style.top = "120px";
    data.style.width = "80%";
    data.style.height = "auto";
  } else {
    data.style.position = "relative";
    data.style.left = "auto";
    data.style.top = "auto";
    data.style.width = "100%";
    data.style.height = "auto";
  }

  if (typeof renderCanvas === "function") renderCanvas();
  if (typeof pushHistory === "function") pushHistory();
}

function deleteElementById(elementId) {
  if (typeof requestDeleteElement === "function") requestDeleteElement(elementId);
  else performDeleteElementById(elementId);
}

function performDeleteElementById(elementId) {
  elements = elements.filter(item => item.id !== elementId);
  elements.forEach(item => {
    if (item.parentId === elementId) {
      item.parentId = null;
      item.style.position = "absolute";
      item.style.left = "10%";
      item.style.top = "120px";
      item.style.width = "80%";
      item.style.height = "auto";
    }
  });

  if (selectedElementId === elementId) {
    if (typeof deselectAll === "function") deselectAll();
    if (typeof renderCanvas === "function") renderCanvas();
  } else {
    if (typeof renderCanvas === "function") renderCanvas();
  }
  if (typeof pushHistory === "function") pushHistory();
}

// SAVE TO SERVER NEO4J
function savePromotionPage() {
  const bgTypeSelect = document.getElementById("bgType");
  const type = bgTypeSelect ? bgTypeSelect.value : "color";
  let bgStyle = canvas ? canvas.style.background : "#f2f7f9";

  const payload = {
    elements: elements,
    background: {
      type: type,
      color: window.pageBgFillData ? window.pageBgFillData.color : "#f2f7f9",
      fillData: window.pageBgFillData || null,
      style: bgStyle,
      imageSrc: type === "image" ? window.bgImageSrc : "",
      opacity: type === "image" ? window.bgImageOpacity : 1.0,
      canvasHeight: window.canvasHeight || ""
    },
  };

  fetch(`/api/actor/${actorId}/promotion/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ promotion_page_data: JSON.stringify(payload) }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        if (typeof showToast === "function") {
          showToast("Data promotion page berhasil disimpan!", "success");
        } else if (typeof showToastNotification === "function") {
          showToastNotification("Data promotion page berhasil disimpan!", "success");
        }
      } else {
        if (typeof showToast === "function") {
          showToast("Gagal menyimpan data: " + (data.error || "Terjadi kesalahan"), "error");
        }
      }
    })
    .catch((err) => {
      console.error(err);
      if (typeof showToast === "function") {
        showToast("Gagal menyimpan data promotion page.", "error");
      } else {
        alert("Gagal menyimpan desain.");
      }
    });
}
