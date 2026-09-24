window.userPermissions = [];

// Global references for location confirmation
let draggingMarker = null;
let lastMarkerPos = null;

// Funsi untuk membuat icon actor
function createActorIcon(iconUrl) {
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25]
  });
}

// Helper untuk mendapatkan ikon Aktor Usaha berdasarkan NotesType (Kampanye / Lowongan)
window.getUsahaIconUrl = function (actorData) {
  if (actorData) {
    const isDisabled = !!actorData["NotesDisabled"];
    const notesEnd = actorData["NotesEndDate"] || actorData["notesEndDate"] || "";
    let isExpired = false;
    if (notesEnd) {
      const endDate = new Date(notesEnd);
      if (!isNaN(endDate.getTime()) && endDate < new Date()) {
        isExpired = true;
      }
    }

    if (isDisabled || isExpired) {
      return "/static/image/actor/usaha.svg";
    }

    const noteType = actorData["NotesType"] || actorData["notesType"] || "";
    if (noteType === "kampanye") {
      return "/static/image/actor/usaha-campaign.svg";
    }
    if (noteType === "lowongan") {
      return "/static/image/actor/usaha-job-portal.svg";
    }
  }
  return "/static/image/actor/usaha.svg";
};

// Toggle mutually exclusive checklist (Kampanye & Lowongan) untuk Aktor Usaha
window.onUsahaNoteTypeChange = function (type) {
  const checkKampanye = document.getElementById("checkUsahaKampanye");
  const checkLowongan = document.getElementById("checkUsahaLowongan");
  const cardKampanye = document.getElementById("cardUsahaKampanye");
  const cardLowongan = document.getElementById("cardUsahaLowongan");

  if (type === 'kampanye') {
    if (checkKampanye && checkKampanye.checked) {
      if (checkLowongan) checkLowongan.checked = false;
    }
  } else if (type === 'lowongan') {
    if (checkLowongan && checkLowongan.checked) {
      if (checkKampanye) checkKampanye.checked = false;
    }
  }

  if (cardKampanye) {
    if (checkKampanye && checkKampanye.checked) cardKampanye.classList.add('active');
    else cardKampanye.classList.remove('active');
  }
  if (cardLowongan) {
    if (checkLowongan && checkLowongan.checked) cardLowongan.classList.add('active');
    else cardLowongan.classList.remove('active');
  }
};

// Toggle mutually exclusive CTA (WhatsApp, Halaman Promosi, Link URL) untuk Aktor Usaha
window.onUsahaCtaChange = function (type) {
  const checkWa = document.getElementById("checkUsahaCtaWa");
  const checkPromo = document.getElementById("checkUsahaCtaPromo");
  const checkUrl = document.getElementById("checkUsahaCtaUrl");

  const cardWa = document.getElementById("cardUsahaCtaWa");
  const cardPromo = document.getElementById("cardUsahaCtaPromo");
  const cardUrl = document.getElementById("cardUsahaCtaUrl");

  const boxWa = document.getElementById("containerUsahaCtaWa");
  const boxUrl = document.getElementById("containerUsahaCtaUrl");

  if (type === 'wa' && checkWa && checkWa.checked) {
    if (checkPromo) checkPromo.checked = false;
    if (checkUrl) checkUrl.checked = false;
  } else if (type === 'promo' && checkPromo && checkPromo.checked) {
    if (checkWa) checkWa.checked = false;
    if (checkUrl) checkUrl.checked = false;
  } else if (type === 'url' && checkUrl && checkUrl.checked) {
    if (checkWa) checkWa.checked = false;
    if (checkPromo) checkPromo.checked = false;
  }

  if (cardWa) cardWa.classList.toggle('active', !!(checkWa && checkWa.checked));
  if (cardPromo) cardPromo.classList.toggle('active', !!(checkPromo && checkPromo.checked));
  if (cardUrl) cardUrl.classList.toggle('active', !!(checkUrl && checkUrl.checked));

  if (boxWa) boxWa.classList.toggle('hidden', !(checkWa && checkWa.checked));
  if (boxUrl) boxUrl.classList.toggle('hidden', !(checkUrl && checkUrl.checked));
};

// Activity Management Handlers (Standalone Overlay Modal View)
window.onAddUsahaActivityClick = function () {
  const overlay = document.getElementById("editUsahaActivityOverlay");
  const mainOverlay = document.getElementById("editUsahaOverlay");
  if (!overlay) return;

  // Clear inputs for new activity
  const checkKampanye = document.getElementById("checkUsahaKampanye");
  const checkLowongan = document.getElementById("checkUsahaLowongan");
  if (checkKampanye) checkKampanye.checked = false;
  if (checkLowongan) checkLowongan.checked = false;
  if (typeof window.onUsahaNoteTypeChange === 'function') window.onUsahaNoteTypeChange('');

  const nameEl = document.getElementById("inputUsahaNotesName");
  if (nameEl) nameEl.value = "";

  const notesTextEl = document.getElementById("inputUsahaNotesText");
  if (notesTextEl) notesTextEl.value = "";

  const startEl = document.getElementById("inputUsahaNotesStart");
  if (startEl) startEl.value = "";

  const endEl = document.getElementById("inputUsahaNotesEnd");
  if (endEl) endEl.value = "";

  const previewNotesDiv = document.getElementById("previewUsahaNotesImg");
  const previewNotesImg = previewNotesDiv?.querySelector("img");
  if (previewNotesDiv && previewNotesImg) {
    previewNotesImg.src = "";
    previewNotesDiv.style.display = "none";
  }

  const checkWa = document.getElementById("checkUsahaCtaWa");
  const checkPromo = document.getElementById("checkUsahaCtaPromo");
  const checkUrl = document.getElementById("checkUsahaCtaUrl");
  if (checkWa) checkWa.checked = false;
  if (checkPromo) checkPromo.checked = false;
  if (checkUrl) checkUrl.checked = false;

  const inputWa = document.getElementById("inputUsahaCtaWa");
  if (inputWa) inputWa.value = "";

  const inputUrl = document.getElementById("inputUsahaCtaUrl");
  if (inputUrl) inputUrl.value = "";

  if (typeof window.onUsahaCtaChange === 'function') window.onUsahaCtaChange('');

  if (mainOverlay) mainOverlay.classList.remove("active");
  overlay.classList.add("active");
};

window.onCancelUsahaActivityForm = function () {
  const overlay = document.getElementById("editUsahaActivityOverlay");
  const mainOverlay = document.getElementById("editUsahaOverlay");
  if (overlay) overlay.classList.remove("active");
  if (mainOverlay) mainOverlay.classList.add("active");
};

window.onEditUsahaActivity = function () {
  const overlay = document.getElementById("editUsahaActivityOverlay");
  const mainOverlay = document.getElementById("editUsahaOverlay");
  if (!overlay) return;

  if (window.editingMarker && window.editingMarker.actorData) {
    const data = window.editingMarker.actorData;

    const notesNameEl = document.getElementById("inputUsahaNotesName");
    if (notesNameEl) notesNameEl.value = data["NotesName"] || data["Notes"] || data["Catatan"] || '';

    const noteType = data["NotesType"] || data["notesType"] || '';
    const checkKampanye = document.getElementById("checkUsahaKampanye");
    const checkLowongan = document.getElementById("checkUsahaLowongan");
    if (checkKampanye) checkKampanye.checked = (noteType === 'kampanye');
    if (checkLowongan) checkLowongan.checked = (noteType === 'lowongan');
    if (typeof window.onUsahaNoteTypeChange === 'function') {
      window.onUsahaNoteTypeChange(noteType);
    }

    const notesTextEl = document.getElementById("inputUsahaNotesText");
    if (notesTextEl) notesTextEl.value = data["Notes"] || data["Catatan"] || '';

    const startEl = document.getElementById("inputUsahaNotesStart");
    if (startEl) startEl.value = data["NotesStartDate"] || '';

    const endEl = document.getElementById("inputUsahaNotesEnd");
    if (endEl) endEl.value = data["NotesEndDate"] || '';

    const previewNotesDiv = document.getElementById("previewUsahaNotesImg");
    const previewNotesImg = previewNotesDiv?.querySelector("img");
    if (previewNotesDiv && previewNotesImg) {
      if (data["NotesImage"]) {
        previewNotesImg.src = data["NotesImage"];
        previewNotesDiv.style.display = "block";
      } else {
        previewNotesImg.src = "";
        previewNotesDiv.style.display = "none";
      }
    }

    // Hydrate CTA options
    const ctaType = data["CtaType"] || data["ctaType"] || '';
    const checkWa = document.getElementById("checkUsahaCtaWa");
    const checkPromo = document.getElementById("checkUsahaCtaPromo");
    const checkUrl = document.getElementById("checkUsahaCtaUrl");
    if (checkWa) checkWa.checked = (ctaType === 'wa');
    if (checkPromo) checkPromo.checked = (ctaType === 'promo');
    if (checkUrl) checkUrl.checked = (ctaType === 'url');

    const inputWa = document.getElementById("inputUsahaCtaWa");
    if (inputWa) inputWa.value = data["CtaWa"] || '';

    const inputUrl = document.getElementById("inputUsahaCtaUrl");
    if (inputUrl) inputUrl.value = data["CtaUrl"] || '';

    if (typeof window.onUsahaCtaChange === 'function') {
      window.onUsahaCtaChange(ctaType);
    }
  }

  if (mainOverlay) mainOverlay.classList.remove("active");
  overlay.classList.add("active");
};

window.onSaveUsahaActivityModal = function () {
  if (!window.editingMarker || !window.editingMarker.actorData) return;

  const checkKampanye = document.getElementById("checkUsahaKampanye");
  const checkLowongan = document.getElementById("checkUsahaLowongan");
  let notesType = "";
  if (checkKampanye && checkKampanye.checked) notesType = "kampanye";
  else if (checkLowongan && checkLowongan.checked) notesType = "lowongan";

  const notesName = document.getElementById("inputUsahaNotesName")?.value.trim() || "";
  const notesStart = document.getElementById("inputUsahaNotesStart")?.value || "";
  const notesEnd = document.getElementById("inputUsahaNotesEnd")?.value || "";

  const checkCtaWa = document.getElementById("checkUsahaCtaWa");
  const checkCtaPromo = document.getElementById("checkUsahaCtaPromo");
  const checkCtaUrl = document.getElementById("checkUsahaCtaUrl");
  let ctaType = "";
  if (checkCtaWa && checkCtaWa.checked) ctaType = "wa";
  else if (checkCtaPromo && checkCtaPromo.checked) ctaType = "promo";
  else if (checkCtaUrl && checkCtaUrl.checked) ctaType = "url";

  const ctaWaVal = document.getElementById("inputUsahaCtaWa")?.value.trim() || "";
  const ctaUrlVal = document.getElementById("inputUsahaCtaUrl")?.value.trim() || "";

  // Validation for required fields (excluding image & description)
  const missingFields = [];
  if (!notesType) missingFields.push("Jenis Aktivitas");
  if (!notesName) missingFields.push("Nama Aktivitas");
  if (!notesStart || !notesEnd) missingFields.push("Batas Waktu");
  if (!ctaType) {
    missingFields.push("Tombol CTA");
  } else if (ctaType === "wa" && !ctaWaVal) {
    missingFields.push("Nomor WhatsApp CTA");
  } else if (ctaType === "url" && !ctaUrlVal) {
    missingFields.push("Link URL CTA");
  }

  if (missingFields.length > 0) {
    if (typeof showToast === 'function') {
      showToast("Silakan mengisi bagian wajib: " + missingFields.join(", ") + ".", "error");
    } else {
      alert("Silakan mengisi bagian wajib: " + missingFields.join(", ") + ".");
    }
    return;
  }

  const actorData = window.editingMarker.actorData;
  const notesText = document.getElementById("inputUsahaNotesText")?.value || "";

  const previewNotesDiv = document.getElementById("previewUsahaNotesImg");
  const previewNotesImg = previewNotesDiv?.querySelector("img");
  let notesImg = "";
  if (previewNotesImg && previewNotesImg.src && previewNotesImg.src !== window.location.href) {
    notesImg = previewNotesImg.src;
  }

  actorData["NotesName"] = notesName;
  actorData["NotesType"] = notesType;
  actorData["Notes"] = notesText;
  actorData["Catatan"] = notesText;
  actorData["NotesStartDate"] = notesStart;
  actorData["NotesEndDate"] = notesEnd;
  if (notesImg) actorData["NotesImage"] = notesImg;
  else delete actorData["NotesImage"];

  actorData["CtaType"] = ctaType;
  actorData["CtaWa"] = ctaWaVal;
  actorData["CtaUrl"] = ctaUrlVal;

  // Update marker icon
  if (typeof window.getUsahaIconUrl === 'function' && typeof createActorIcon === 'function') {
    const newIconUrl = window.getUsahaIconUrl(actorData);
    window.editingMarker.setIcon(createActorIcon(newIconUrl));
  }

  // Render list inside main edit modal & save to Neo4j
  if (typeof window.renderUsahaActivityList === 'function') {
    window.renderUsahaActivityList(actorData);
  }
  if (typeof window.saveToNeo4j === 'function') {
    window.saveToNeo4j(window.editingMarker);
  }

  // Update Popup content if open
  const popup = window.editingMarker.getPopup();
  if (popup) {
    window.editingMarker.setPopupContent(getPopupContent(actorData, window.editingMarker.actorType || "aktorUsaha", window.editingMarker.uniqueId));
  }

  if (typeof showToast === 'function') {
    showToast("Aktivitas berhasil disimpan!", "info");
  }

  window.onCancelUsahaActivityForm();
};

window.onDeleteUsahaActivity = function () {
  if (!window.editingMarker || !window.editingMarker.actorData) return;
  const overlay = document.getElementById("deleteActivityConfirmOverlay");
  if (overlay) {
    const title = overlay.querySelector(".delete-confirm-title");
    const desc = overlay.querySelector(".delete-confirm-desc");
    if (title) title.innerText = "Hapus Aktivitas?";
    if (desc) desc.innerText = "Aktivitas ini akan dihapus secara permanen dari daftar aktivitas usaha.";
    overlay.classList.remove("hidden");
  }
};

window.cancelDeleteUsahaActivity = function () {
  const overlay = document.getElementById("deleteActivityConfirmOverlay");
  if (overlay) overlay.classList.add("hidden");
};

window.confirmDeleteUsahaActivity = function () {
  if (window.editingMarker && window.editingMarker.actorData) {
    const actorType = window.editingMarker.actorType || window.editingMarker.actorData.type;

    if (actorType === "aktorLokasi") {
      let list = window.getLokasiNotesList(window.editingMarker.actorData);
      const delIdx = window.deletingLokasiActivityIndex ?? 0;
      if (delIdx >= 0 && delIdx < list.length) {
        list.splice(delIdx, 1);
      }
      window.editingMarker.actorData["lokasiNotesList"] = list;
      window.editingMarker.actorData["NotesList"] = list;

      if (list.length > 0) {
        const latest = list[list.length - 1];
        window.editingMarker.actorData["NotesName"] = latest.name;
        window.editingMarker.actorData["Notes"] = latest.text;
        window.editingMarker.actorData["Catatan"] = latest.text;
        if (latest.image) window.editingMarker.actorData["NotesImage"] = latest.image;
        else delete window.editingMarker.actorData["NotesImage"];
      } else {
        delete window.editingMarker.actorData["NotesName"];
        delete window.editingMarker.actorData["Notes"];
        delete window.editingMarker.actorData["Catatan"];
        delete window.editingMarker.actorData["NotesImage"];
      }

      if (typeof window.renderLokasiActivityList === 'function') {
        window.renderLokasiActivityList(window.editingMarker.actorData);
      }
    } else {
      delete window.editingMarker.actorData["NotesName"];
      delete window.editingMarker.actorData["NotesType"];
      delete window.editingMarker.actorData["Notes"];
      delete window.editingMarker.actorData["Catatan"];
      delete window.editingMarker.actorData["NotesStartDate"];
      delete window.editingMarker.actorData["NotesEndDate"];
      delete window.editingMarker.actorData["NotesImage"];
      delete window.editingMarker.actorData["CtaType"];
      delete window.editingMarker.actorData["CtaWa"];
      delete window.editingMarker.actorData["CtaUrl"];
      delete window.editingMarker.actorData["NotesDisabled"];

      if (typeof window.renderUsahaActivityList === 'function') {
        window.renderUsahaActivityList(window.editingMarker.actorData);
      }
    }

    if (typeof window.saveToNeo4j === 'function') {
      window.saveToNeo4j(window.editingMarker);
    }

    // Update Popup Content
    const popup = window.editingMarker.getPopup();
    if (popup) {
      window.editingMarker.setPopupContent(getPopupContent(window.editingMarker.actorData, window.editingMarker.actorType || "aktorLokasi", window.editingMarker.uniqueId));
    }
  }

  window.cancelDeleteUsahaActivity();
};

window.onToggleDisableUsahaActivity = function () {
  if (!window.editingMarker || !window.editingMarker.actorData) return;
  const actorData = window.editingMarker.actorData;
  const isDisabled = !!actorData["NotesDisabled"];

  if (isDisabled) {
    // If attempting to re-enable, check if timeframe is expired
    let isExpired = false;
    if (actorData["NotesEndDate"]) {
      const endDate = new Date(actorData["NotesEndDate"]);
      if (!isNaN(endDate.getTime()) && endDate < new Date()) {
        isExpired = true;
      }
    }

    if (isExpired) {
      alert("Batas waktu aktivitas sudah berakhir. Silakan klik Edit untuk memperbarui tanggal 'Sampai dengan' sebelum mengaktifkan kembali.");
      window.onEditUsahaActivity();
      return;
    }
    actorData["NotesDisabled"] = false;
  } else {
    actorData["NotesDisabled"] = true;
  }

  // Update marker icon
  if (typeof window.getUsahaIconUrl === 'function' && typeof createActorIcon === 'function') {
    const newIconUrl = window.getUsahaIconUrl(actorData);
    window.editingMarker.setIcon(createActorIcon(newIconUrl));
  }

  // Update Popup content if open
  const popup = window.editingMarker.getPopup();
  if (popup) {
    window.editingMarker.setPopupContent(getPopupContent(actorData, window.editingMarker.actorType || "aktorUsaha", window.editingMarker.uniqueId));
  }

  window.renderUsahaActivityList(actorData);
};

window.renderUsahaActivityList = function (actorData) {
  const container = document.getElementById("usahaActivityListContainer");
  if (!container) return;
  container.innerHTML = "";

  if (!actorData) return;

  const name = actorData["NotesName"] || actorData["Notes"] || actorData["Catatan"] || "";
  const notesStart = actorData["NotesStartDate"] || "";
  const notesEnd = actorData["NotesEndDate"] || "";
  const notesImg = actorData["NotesImage"] || "";
  const views = actorData["Views"] || 0;
  const clicks = actorData["Clicks"] || 0;
  const ctaConversions = actorData["CtaConversions"] || 0;

  // Format datetime display
  const formatTime = (dtStr) => {
    if (!dtStr) return "-";
    return dtStr.replace('T', ' ');
  };

  // Check if expired
  let isExpired = false;
  if (notesEnd) {
    const endDate = new Date(notesEnd);
    if (!isNaN(endDate.getTime()) && endDate < new Date()) {
      isExpired = true;
    }
  }

  const timeframeText = `Dari: ${formatTime(notesStart)} s/d ${formatTime(notesEnd)}`;

  if (name || notesStart || notesEnd || notesImg) {
    const cardHtml = `
      <div style="border: 1.5px solid ${isExpired ? '#cbd5e1' : '#38a0c4'}; border-radius: 10px; padding: 10px 12px; background: transparent; box-shadow: 0 1px 3px rgba(0,0,0,0.03); font-size: 12px; ${isExpired ? 'opacity: 0.6;' : ''}">
        <!-- Tombol Aktivitas Utama -->
        <button type="button" onclick="window.onEditUsahaActivity()" style="width: 100%; text-align: left; background: transparent; border: none; padding: 0; cursor: pointer; color: inherit; font-family: inherit;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div style="flex: 1;">
              <div style="font-weight: 700; color: ${isExpired ? '#64748b' : '#2c5d6b'}; font-size: 13px; margin-bottom: 2px;">Aktivitas</div>
              <div style="font-size: 12px; font-weight: 600; color: ${isExpired ? '#64748b' : '#334155'}; margin-bottom: 4px;">${name}</div>
              <div style="font-size: 11px; color: ${isExpired ? '#94a3b8' : '#64748b'}; margin-bottom: 6px;">${timeframeText}</div>
            </div>
            ${notesImg ? `<div style="width: 48px; height: 48px; flex-shrink: 0; border-radius: 8px; overflow: hidden; border: 1px solid #cbd5e1;"><img src="${notesImg}" style="width: 100%; height: 100%; object-fit: cover;" /></div>` : ''}
          </div>
        </button>

        <!-- Stats Section (Tanpa Background Warna, Menggunakan Stroke Dasar) -->
        <div style="display: flex; gap: 10px; font-size: 11px; color: ${isExpired ? '#64748b' : '#475569'}; border: 1px solid #e2e8f0; background: transparent; padding: 5px 8px; border-radius: 6px; font-weight: 600; margin-top: 6px; margin-bottom: 8px; flex-wrap: wrap;">
          <span>Dilihat : <strong style="color: ${isExpired ? '#64748b' : '#0284c7'};">${views}</strong></span>
          <span>Diklik : <strong style="color: ${isExpired ? '#64748b' : '#0284c7'};">${clicks}</strong></span>
          <span>CTA Konversi : <strong style="color: ${isExpired ? '#64748b' : '#10b981'};">${ctaConversions}</strong></span>
        </div>

        <!-- Action Buttons: Edit & Delete (Tombol Stroke Sesua Warna Icon) -->
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
          <button type="button" onclick="window.onEditUsahaActivity()" title="Edit Aktivitas" style="background: transparent; border: 1px solid #3b82f6; border-radius: 6px; padding: 4px 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: #3b82f6; font-weight: 600;">
            <img src="/static/image/icon/edit.svg" style="width: 14px; height: 14px;" alt="Edit" /> Edit
          </button>
          <button type="button" onclick="window.onDeleteUsahaActivity()" title="Hapus Aktivitas" style="background: transparent; border: 1px solid #ff6b6b; border-radius: 6px; padding: 4px 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: #ff6b6b; font-weight: 600;">
            <img src="/static/image/icon/delete.svg" style="width: 14px; height: 14px;" alt="Hapus" /> Hapus
          </button>
        </div>
      </div>
    `;
    container.innerHTML = cardHtml;
  }
};

window.getLokasiNotesList = function (actorData) {
  if (!actorData) return [];
  if (Array.isArray(actorData["lokasiNotesList"])) {
    return actorData["lokasiNotesList"];
  }
  if (Array.isArray(actorData["NotesList"])) {
    return actorData["NotesList"];
  }
  const notesName = actorData["NotesName"] || "";
  const notesText = actorData["Notes"] || actorData["Catatan"] || "";
  const notesImg = actorData["NotesImage"] || "";
  if (notesName || notesText || notesImg) {
    return [{
      id: "legacy_1",
      name: notesName || "Catatan Lokasi",
      text: notesText,
      image: notesImg
    }];
  }
  return [];
};

// Lokasi Activity Management Handlers (Admin View)
window.onAddLokasiActivityClick = function () {
  window.editingLokasiActivityIndex = -1;
  const overlay = document.getElementById("editLokasiActivityOverlay");
  const mainOverlay = document.getElementById("editLokasiOverlay");
  if (!overlay) return;

  const nameEl = document.getElementById("inputLokasiNotesName");
  if (nameEl) nameEl.value = "";

  const notesTextEl = document.getElementById("inputLokasiNotesText");
  if (notesTextEl) notesTextEl.value = "";

  const previewNotesDiv = document.getElementById("previewLokasiNotesImg");
  const previewNotesImg = previewNotesDiv?.querySelector("img");
  if (previewNotesDiv && previewNotesImg) {
    previewNotesImg.src = "";
    previewNotesDiv.style.display = "none";
  }

  if (mainOverlay) mainOverlay.classList.remove("active");
  overlay.classList.add("active");
};

window.onCancelLokasiActivityForm = function () {
  const overlay = document.getElementById("editLokasiActivityOverlay");
  const mainOverlay = document.getElementById("editLokasiOverlay");
  if (overlay) overlay.classList.remove("active");
  if (mainOverlay) mainOverlay.classList.add("active");
};

window.onEditLokasiActivity = function (index = 0) {
  const overlay = document.getElementById("editLokasiActivityOverlay");
  const mainOverlay = document.getElementById("editLokasiOverlay");
  if (!overlay) return;

  const idx = typeof index === 'number' ? index : 0;
  window.editingLokasiActivityIndex = idx;

  if (window.editingMarker && window.editingMarker.actorData) {
    const data = window.editingMarker.actorData;
    const list = window.getLokasiNotesList(data);
    const item = list[idx] || {};

    const notesNameEl = document.getElementById("inputLokasiNotesName");
    if (notesNameEl) notesNameEl.value = item.name || '';

    const notesTextEl = document.getElementById("inputLokasiNotesText");
    if (notesTextEl) notesTextEl.value = item.text || '';

    const previewNotesDiv = document.getElementById("previewLokasiNotesImg");
    const previewNotesImg = previewNotesDiv?.querySelector("img");
    if (previewNotesDiv && previewNotesImg) {
      if (item.image) {
        previewNotesImg.src = item.image;
        previewNotesDiv.style.display = "block";
      } else {
        previewNotesImg.src = "";
        previewNotesDiv.style.display = "none";
      }
    }
  }

  if (mainOverlay) mainOverlay.classList.remove("active");
  overlay.classList.add("active");
};

window.onSaveLokasiActivityModal = function () {
  if (!window.editingMarker || !window.editingMarker.actorData) return;

  const actorData = window.editingMarker.actorData;
  const notesName = document.getElementById("inputLokasiNotesName")?.value || "";
  const notesText = document.getElementById("inputLokasiNotesText")?.value || "";

  const previewNotesDiv = document.getElementById("previewLokasiNotesImg");
  const previewNotesImg = previewNotesDiv?.querySelector("img");
  let notesImg = "";
  if (previewNotesImg && previewNotesImg.src && previewNotesImg.src !== window.location.href) {
    notesImg = previewNotesImg.src;
  }

  let list = window.getLokasiNotesList(actorData);
  const targetIdx = window.editingLokasiActivityIndex;

  if (typeof targetIdx === 'number' && targetIdx >= 0 && targetIdx < list.length) {
    list[targetIdx] = {
      ...list[targetIdx],
      name: notesName || "Catatan Lokasi",
      text: notesText,
      image: notesImg
    };
  } else {
    list.push({
      id: "note_" + Date.now(),
      name: notesName || "Catatan Lokasi",
      text: notesText,
      image: notesImg,
      date: new Date().toLocaleString()
    });
  }

  actorData["lokasiNotesList"] = list;
  actorData["NotesList"] = list;

  if (list.length > 0) {
    const latest = list[list.length - 1];
    actorData["NotesName"] = latest.name;
    actorData["Notes"] = latest.text;
    actorData["Catatan"] = latest.text;
    if (latest.image) actorData["NotesImage"] = latest.image;
    else delete actorData["NotesImage"];
  }

  if (typeof window.renderLokasiActivityList === 'function') {
    window.renderLokasiActivityList(actorData);
  }
  if (typeof window.saveToNeo4j === 'function') {
    window.saveToNeo4j(window.editingMarker);
  }

  // Update Popup Content
  const popup = window.editingMarker.getPopup();
  if (popup) {
    window.editingMarker.setPopupContent(getPopupContent(actorData, window.editingMarker.actorType || "aktorLokasi", window.editingMarker.uniqueId));
  }

  window.onCancelLokasiActivityForm();
};

window.onDeleteLokasiActivity = function (index = 0) {
  if (!window.editingMarker || !window.editingMarker.actorData) return;
  const idx = typeof index === 'number' ? index : 0;
  window.deletingLokasiActivityIndex = idx;

  const overlay = document.getElementById("deleteActivityConfirmOverlay");
  if (overlay) {
    const title = overlay.querySelector(".delete-confirm-title");
    const desc = overlay.querySelector(".delete-confirm-desc");
    if (title) title.innerText = "Hapus Catatan?";
    if (desc) desc.innerText = "Catatan ini akan dihapus secara permanen dari daftar catatan lokasi.";
    overlay.classList.remove("hidden");
  }
};

window.renderLokasiActivityList = function (actorData) {
  const container = document.getElementById("lokasiActivityListContainer");
  if (!container) return;
  container.innerHTML = "";

  if (!actorData) return;

  const list = window.getLokasiNotesList(actorData);
  if (!list || list.length === 0) return;

  list.forEach((item, idx) => {
    const notesName = item.name || "Catatan Lokasi";
    const notesText = item.text || "";
    const notesImg = item.image || "";

    const cardHtml = `
      <div style="border: 1.5px solid #38a0c4; border-radius: 10px; padding: 10px 12px; background: transparent; box-shadow: 0 1px 3px rgba(0,0,0,0.03); font-size: 12px;">
        <!-- Tombol Catatan Utama -->
        <button type="button" onclick="window.onEditLokasiActivity(${idx})" style="width: 100%; text-align: left; background: transparent; border: none; padding: 0; cursor: pointer; color: inherit; font-family: inherit;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div style="flex: 1;">
              <div style="font-weight: 700; color: #2c5d6b; font-size: 13px; margin-bottom: 2px;">${notesName}</div>
              ${notesText ? `<div style="font-size: 12px; font-weight: 500; color: #334155; margin-bottom: 4px;">${notesText}</div>` : ''}
            </div>
            ${notesImg ? `<div style="width: 48px; height: 48px; flex-shrink: 0; border-radius: 8px; overflow: hidden; border: 1px solid #cbd5e1;"><img src="${notesImg}" style="width: 100%; height: 100%; object-fit: cover;" /></div>` : ''}
          </div>
        </button>

        <!-- Action Buttons: Edit & Delete -->
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
          <button type="button" onclick="window.onEditLokasiActivity(${idx})" title="Edit Catatan" style="background: transparent; border: 1px solid #3b82f6; border-radius: 6px; padding: 4px 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: #3b82f6; font-weight: 600;">
            <img src="/static/image/icon/edit.svg" style="width: 14px; height: 14px;" alt="Edit" /> Edit
          </button>
          <button type="button" onclick="window.onDeleteLokasiActivity(${idx})" title="Hapus Catatan" style="background: transparent; border: 1px solid #ff6b6b; border-radius: 6px; padding: 4px 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: #ff6b6b; font-weight: 600;">
            <img src="/static/image/icon/delete.svg" style="width: 14px; height: 14px;" alt="Hapus" /> Hapus
          </button>
        </div>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", cardHtml);
  });
};

// Simpan semua marker yang aktif di map
window.actorMarkers = []; // global so it can be filtered

window.updateActorCreationUI = function () {
  if (window.isAdmin) return;
  const userCreatedCount = (window.actorMarkers || []).filter(m => (m.createdBy === window.currentUser || m.actorData?.createdBy === window.currentUser)).length;
  const actorDivs = document.querySelectorAll(".actor-main");
  if (userCreatedCount >= (window.userCreationQuota || 1)) {
    actorDivs.forEach(div => div.classList.add("quota-reached"));
  } else {
    actorDivs.forEach(div => div.classList.remove("quota-reached"));
  }
};

// Ambil semua gambar actor
const actorImages = document.querySelectorAll(".actor-main img");

actorImages.forEach((img) => {
  img.addEventListener("click", (e) => {
    const actorDiv = img.closest(".actor-main");
    const actorId = actorDiv.id;

    // Biarkan aktorLokasi diproses oleh draw_lokasi.js
    if (actorId === "aktorLokasi") return;

    e.stopPropagation();

    let iconUrl = "";
    if (actorId === "aktorUsaha") iconUrl = window.getUsahaIconUrl();

    if (!iconUrl) return;

    if (!window.isAdmin) {
      window.userCreationQuota = window.userCreationQuota || 1;
      const userCreatedCount = (window.actorMarkers || []).filter(m => (m.createdBy === window.currentUser || m.actorData?.createdBy === window.currentUser)).length;

      if (userCreatedCount >= window.userCreationQuota) {
        window.creationSpamCount = (window.creationSpamCount || 0) + 1;
        const remainingClicks = 4 - window.creationSpamCount;

        if (remainingClicks > 0) {
          if (typeof showToast === 'function') {
            showToast(`Batas pembuat aktor usaha adalah ${window.userCreationQuota} marker. Klik ${remainingClicks}x lagi untuk diajukan permohonan ke admin.`, "info");
          }
          return;
        } else {
          window.creationSpamCount = 0;
          const quotaModal = document.getElementById("requestCreationQuotaConfirmOverlay");
          if (quotaModal) {
            quotaModal.classList.remove("hidden");
          }
          return;
        }
      }
    }

    const uniqueId = Math.random().toString(36).substr(2, 6).toUpperCase();
    const marker = L.marker(map.getCenter(), {
      icon: createActorIcon(iconUrl),
      draggable: true,
    }).addTo(map);

    marker.actorType = actorId;
    marker.uniqueId = uniqueId;
    marker.isUserCreated = true;
    marker.createdBy = window.currentUser;
    marker.actorData = { createdBy: window.currentUser, isUserCreated: true };
    window.actorMarkers.push(marker);

    // Initial content
    const actorName = actorDiv.querySelector("span").innerText.replace(/[\n\r]/g, ' ').trim();
    marker.actorData = {
      "Nama Usaha": actorName,
      "Nama": actorName,
      "Notes": "",
      "Catatan": "",
      "Deskripsi": ""
    };

    marker.bindPopup(() => getPopupContent(marker.actorData, marker.actorType, marker.uniqueId));
    window.saveToNeo4j(marker); // REAL TIME SAVE ON CREATION
    if (typeof window.updateActorCreationUI === 'function') {
      window.updateActorCreationUI();
    }

    // Drag events
    marker.on('dragstart', function (e) {
      const pos = marker.getLatLng();
      lastMarkerPos = pos;
      window.lastMarkerPos = pos;
    });

    marker.on('dragend', function (e) {
      draggingMarker = marker;
      window.draggingMarker = marker;
      document.getElementById('locationOverlay').classList.remove('hidden');
      updateMarkerCoords(marker);
    });

    // Update coords when popup opens
    marker.on('popupopen', () => updateMarkerCoords(marker));

    updateMarkerCoords(marker);
  });
});

window.getPopupContent = function (data, actorId, uniqueId = '') {
  const actorName = data["Nama"] || data["Nama Usaha"] || data["nama"] || "Aktor Tanpa Nama";
  const photo = data["Foto Visual Path"] || '';
  const notes = data["Notes"] || data["Catatan"] || data["catatan"] || '';
  const description = data["Deskripsi"] || data["deskripsi"] || '';
  const showTestBtn = (actorId === "aktorUsaha");

  const notesType = data["NotesType"] || data["notesType"] || '';
  const notesStart = data["NotesStartDate"] || data["notesStartDate"] || '';
  const notesEnd = data["NotesEndDate"] || data["notesEndDate"] || '';
  const notesImg = data["NotesImage"] || data["notesImage"] || '';

  const activityName = data["NotesName"] || data["notesName"] || '';

  // Notes badge with larger icon and dynamic activity name
  let notesBadgeHtml = '';
  let sideNotesBadgeHtml = '';

  if (notes || activityName || notesImg || notesType) {
    if (actorId === 'aktorLokasi') {
      const badgeLabel = activityName || 'Catatan';
      notesBadgeHtml = `<div class="notes-type-badge lokasi" onclick="window.toggleNotesSideCard(this, event)"><img src="/static/image/icon/pin-map.svg" class="notes-badge-icon" style="width: 28px; height: 28px;"> ${badgeLabel}</div>`;
      sideNotesBadgeHtml = `<div class="notes-type-badge lokasi"><img src="/static/image/icon/pin-map.svg" class="notes-badge-icon" style="width: 28px; height: 28px;"> ${badgeLabel}</div>`;
    } else if (notesType === 'kampanye') {
      notesBadgeHtml = `<div class="notes-type-badge kampanye" onclick="window.toggleNotesSideCard(this, event)"><img src="/static/image/icon/campaign.svg" class="notes-badge-icon" style="width: 28px; height: 28px;"> ${activityName || 'Kampanye'}</div>`;
      sideNotesBadgeHtml = `<div class="notes-type-badge kampanye"><img src="/static/image/icon/campaign.svg" class="notes-badge-icon" style="width: 28px; height: 28px;"> ${activityName || 'Kampanye'}</div>`;
    } else if (notesType === 'lowongan') {
      notesBadgeHtml = `<div class="notes-type-badge lowongan" onclick="window.toggleNotesSideCard(this, event)"><img src="/static/image/icon/job-portal.svg" class="notes-badge-icon" style="width: 28px; height: 28px;"> ${activityName || 'Lowongan'}</div>`;
      sideNotesBadgeHtml = `<div class="notes-type-badge lowongan"><img src="/static/image/icon/job-portal.svg" class="notes-badge-icon" style="width: 28px; height: 28px;"> ${activityName || 'Lowongan'}</div>`;
    } else if (activityName) {
      notesBadgeHtml = `<div class="notes-type-badge kampanye" onclick="window.toggleNotesSideCard(this, event)"><img src="/static/image/icon/campaign.svg" class="notes-badge-icon" style="width: 28px; height: 28px;"> ${activityName}</div>`;
      sideNotesBadgeHtml = `<div class="notes-type-badge kampanye"><img src="/static/image/icon/campaign.svg" class="notes-badge-icon" style="width: 28px; height: 28px;"> ${activityName}</div>`;
    }
  }

  let notesImageHtml = '';
  if (notesImg) {
    notesImageHtml = `<div class="notes-img-container" onclick="event.stopPropagation(); window.openPhotoModal('${notesImg}')"><img src="${notesImg}" class="notes-overview-photo" /></div>`;
  }

  const ctaType = data["CtaType"] || data["ctaType"] || '';
  const ctaWa = data["CtaWa"] || data["ctaWa"] || '';
  const ctaUrl = data["CtaUrl"] || data["ctaUrl"] || '';

  let notesCtaHtml = '';
  if (ctaType === 'wa') {
    let cleanPhone = ctaWa.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
    const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : '#';
    notesCtaHtml = `
      <a href="${waLink}" target="_blank" class="notes-side-cta-btn wa" onclick="event.stopPropagation()">
        <img src="/static/image/icon/phone.svg" class="notes-cta-icon"> Hubungi via WhatsApp
      </a>`;
  } else if (ctaType === 'promo') {
    notesCtaHtml = `
      <a href="/promotion_page_builder?actor_id=${uniqueId}" class="notes-side-cta-btn promo" onclick="event.stopPropagation()">
        <img src="/static/image/icon/view.svg" class="notes-cta-icon"> Lihat Halaman Promosi
      </a>`;
  } else if (ctaType === 'url') {
    let targetUrl = ctaUrl;
    if (targetUrl && !targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }
    notesCtaHtml = `
      <a href="${targetUrl || '#'}" target="_blank" class="notes-side-cta-btn url" onclick="event.stopPropagation()">
        <img src="/static/image/icon/browser.svg" class="notes-cta-icon"> Buka Website / Link
      </a>`;
  }

  const photoHtml = photo ? `
    <div class="actor-photo-container" onclick="window.openPhotoModal(this.querySelector('img').src)" style="cursor: pointer;">
       <img src="${photo}" class="actor-overview-photo" alt="Photo" />
    </div>` : '';

  const lokasiNotesList = (typeof window.getLokasiNotesList === 'function') ? window.getLokasiNotesList(data) : [];
  const hasLokasiNotes = lokasiNotesList.length > 0 || !!(notes || notesImg || activityName);

  let notesHtml = '';
  if (actorId === 'aktorLokasi') {
    if (hasLokasiNotes) {
      const attachedBtnHtml = `
        <button type="button" class="lokasi-attached-notes-btn" onclick="window.toggleNotesSideCard(this, event)" title="Lihat Catatan Lokasi">
          <img src="/static/image/icon/pin-map.svg" class="attached-btn-icon" alt="Notes" />
        </button>
      `;

      const activeNote = (lokasiNotesList.length > 0) ? lokasiNotesList[0] : { name: activityName || 'Catatan', text: notes, image: notesImg };
      const activeName = activeNote.name || 'Catatan Lokasi';
      const activeText = activeNote.text || activeNote.Notes || activeNote.Catatan || '';
      const activeImg = activeNote.image || activeNote.NotesImage || '';

      const activeViewHtml = `
        <div class="lokasi-active-note-view">
          <div class="notes-type-badge lokasi active-note-title" style="margin-bottom: 6px; pointer-events: none;">
            <img src="/static/image/icon/pin-map.svg" class="notes-badge-icon" style="width: 22px; height: 22px;"> ${activeName}
          </div>
          <div class="notes-side-text active-note-text" style="font-size: 12px; color: #334155; margin-bottom: 6px; ${activeText ? '' : 'display: none;'}">${activeText}</div>
          <div class="notes-img-container active-note-img-wrap" onclick="event.stopPropagation(); window.openPhotoModal(this.querySelector('img').src)" style="${activeImg ? 'cursor: pointer;' : 'display: none;'}">
            <img src="${activeImg}" class="notes-overview-photo active-note-img" />
          </div>
        </div>
      `;

      let gridItemsHtml = '';
      if (lokasiNotesList.length > 0) {
        gridItemsHtml = `
          <div class="lokasi-notes-grid-title" style="font-size: 10px; font-weight: 700; color: #64748b; margin-top: 10px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Daftar Catatan (${lokasiNotesList.length}):</div>
          <div class="lokasi-notes-grid">
            ${lokasiNotesList.map((item, idx) => {
              const isAct = idx === 0 ? 'active' : '';
              if (item.image) {
                return `<div class="lokasi-grid-item ${isAct}" onclick="window.selectLokasiSideNote(this, ${idx})" data-idx="${idx}" title="${item.name || 'Catatan'}"><img src="${item.image}" alt="${item.name || 'Catatan'}" /></div>`;
              } else {
                return `<div class="lokasi-grid-item no-img ${isAct}" onclick="window.selectLokasiSideNote(this, ${idx})" data-idx="${idx}" title="${item.name || 'Catatan'}"><img src="/static/image/icon/pin-map.svg" class="grid-placeholder-icon" /><span>${item.name || 'Catatan'}</span></div>`;
              }
            }).join('')}
          </div>
        `;
      }

      const encodedData = JSON.stringify(lokasiNotesList.length > 0 ? lokasiNotesList : [activeNote]).replace(/'/g, "&#39;");

       notesHtml = `
        ${attachedBtnHtml}
        <div class="actor-notes-side-card" onclick="event.stopPropagation()" data-notes='${encodedData}'>
           <div class="notes-side-header">
             <span class="notes-side-title">Rincian Catatan Lokasi</span>
             <span class="notes-side-close" onclick="window.closeNotesSideCard(event)" title="Tutup">
               <img src="/static/image/icon/close.svg" alt="Tutup" style="width: 14px; height: 14px; filter: brightness(0) invert(1);" />
             </span>
           </div>
           <div class="notes-side-body" style="max-height: 280px; overflow-y: auto;">
             ${activeViewHtml}
             ${gridItemsHtml}
           </div>
        </div>
      `;
    }
  } else {
    const hasUsahaNotes = !!(notes || notesImg || activityName || notesType);
    let isExpired = false;
    if (notesEnd) {
      const endDate = new Date(notesEnd);
      if (!isNaN(endDate.getTime()) && endDate < new Date()) {
        isExpired = true;
      }
    }
    const isDisabled = !!data["NotesDisabled"] || isExpired;

    if (hasUsahaNotes && !isDisabled) {
      let usahaIconUrl = '/static/image/icon/campaign.svg';
      if (notesType === 'lowongan') {
        usahaIconUrl = '/static/image/icon/job-portal.svg';
      } else if (notesType === 'kampanye') {
        usahaIconUrl = '/static/image/icon/campaign.svg';
      }

      const formatTime = (dtStr) => {
        if (!dtStr) return "";
        return dtStr.replace('T', ' ');
      };
      let timeframeText = '';
      if (notesStart || notesEnd) {
        timeframeText = `Periode: ${formatTime(notesStart)} s/d ${formatTime(notesEnd)}`;
      }

      const attachedBtnHtml = `
        <button type="button" class="usaha-attached-notes-btn" onclick="window.toggleNotesSideCard(this, event)" title="${activityName || 'Aktivitas Usaha'}">
          <img src="${usahaIconUrl}" class="attached-btn-icon" alt="Activity" />
        </button>
      `;

      notesHtml = `
        ${attachedBtnHtml}
        <div class="actor-notes-side-card" onclick="event.stopPropagation()">
           <div class="notes-side-header">
             <span class="notes-side-title">Rincian Aktivitas</span>
             <span class="notes-side-close" onclick="window.closeNotesSideCard(event)" title="Tutup">
               <img src="/static/image/icon/close.svg" alt="Tutup" style="width: 14px; height: 14px; filter: brightness(0) invert(1);" />
             </span>
           </div>
           <div class="notes-side-body">
             ${sideNotesBadgeHtml || notesBadgeHtml}
             ${notes ? `<div class="notes-side-text">${notes}</div>` : ''}
             ${notesImageHtml}
             ${notesCtaHtml}
           </div>
        </div>
      `;
    }
  }

  const targetMarker = (window.actorMarkers || []).find(m => m.uniqueId === uniqueId);
  const isOwner = targetMarker && (targetMarker.createdBy === window.currentUser || targetMarker.actorData?.createdBy === window.currentUser);
  const canEdit = window.isAdmin || isOwner || (window.userPermissions && window.userPermissions.includes(uniqueId));
  const canDelete = window.isAdmin || isOwner;
  const isIzinkanAksesChecked = localStorage.getItem('izinkanAksesChecked') === 'true';

  // Pastikan deskripsi umum tidak duplikat dengan isi Notes
  const renderDesc = (description && description !== notes) ? `<div class="actor-popup-content">${description}</div>` : '';

  return `
    <div class="actor-popup" data-actor-id="${actorId}" data-unique-id="${uniqueId}">
      <div class="actor-popup-header">
        ${actorName}
      </div>
      <div class="actor-popup-body">
        ${renderDesc}
        ${photoHtml}
        ${notesHtml}

        <div class="actor-location-wrapper-minimal">
          <div class="loc-row">
            <span class="actor-coord">Menghubungkan...</span>
          </div>
          <div class="loc-row address-row">
            <span class="actor-address">Mencari alamat...</span>
          </div>
        </div>
      </div>
      <div class="actor-popup-actions">
        ${actorId !== 'aktorLokasi' ? `
        <button class="actor-btn view-actor" onclick="window.location.href='/promotion_page_builder?actor_id=${uniqueId}'"><img src="/static/image/icon/view.svg" class="emoji-img" title="Lihat Halaman Promosi"></button>
        ` : ''}
        ${(isIzinkanAksesChecked && !window.isAdmin && !isOwner && (!window.userPermissions || !window.userPermissions.includes(uniqueId))) ? `
        <button class="actor-btn request-permission" onclick="window.requestPermission('${uniqueId}', '${actorName.replace(/'/g, "\\'")}', event)"><img src="/static/image/icon/access.svg" class="emoji-img" title="Minta Akses"></button>
        ` : ''}
        ${(canEdit || actorId === 'aktorLokasi') ? `
        <button class="actor-btn edit-actor" onclick="openEditOverlay('${actorId}', '${uniqueId}')"><img src="/static/image/icon/edit.svg" class="emoji-img"></button>
        ` : ''}
        ${canDelete ? `
        <button class="actor-btn delete-actor" onclick="window.deleteMarker(this)"><img src="/static/image/icon/delete.svg" class="emoji-img"></button>
        ` : ''}
      </div>
    </div>
    `;
}

window.toggleNotes = function (card, event) {
  if (event && event.target && event.target.classList.contains('notes-side-trigger')) {
    return;
  }
  card.classList.toggle('collapsed');
};

window.toggleNotesSideCard = function (el, event) {
  if (event) event.stopPropagation();
  const popup = el.closest('.actor-popup');
  if (!popup) return;

  const sideCard = popup.querySelector('.actor-notes-side-card');
  if (!sideCard) return;

  const isActive = sideCard.classList.contains('active');
  if (isActive) {
    sideCard.classList.remove('active');
  } else {
    const popupRect = popup.getBoundingClientRect();
    if (popupRect.right + 240 > window.innerWidth) {
      sideCard.style.left = 'auto';
      sideCard.style.right = 'calc(100% + 10px)';
    } else {
      sideCard.style.left = 'calc(100% + 10px)';
      sideCard.style.right = 'auto';
    }
    sideCard.classList.add('active');
  }
};

window.closeNotesSideCard = function (event) {
  if (event) event.stopPropagation();
  const btn = event ? (event.target || event.srcElement) : null;
  const sideCard = btn ? btn.closest('.actor-notes-side-card') : null;
  if (sideCard) sideCard.classList.remove('active');
};

window.selectLokasiSideNote = function (el, index) {
  if (window.event) window.event.stopPropagation();
  const sideCard = el.closest('.actor-notes-side-card');
  if (!sideCard) return;

  sideCard.querySelectorAll('.lokasi-grid-item').forEach(item => item.classList.remove('active'));
  el.classList.add('active');

  const notesAttr = sideCard.getAttribute('data-notes');
  if (!notesAttr) return;

  try {
    const list = JSON.parse(notesAttr);
    const item = list[index];
    if (!item) return;

    const titleEl = sideCard.querySelector('.active-note-title');
    if (titleEl) {
      titleEl.innerHTML = `<img src="/static/image/icon/pin-map.svg" class="notes-badge-icon" style="width: 22px; height: 22px;"> ${item.name || 'Catatan'}`;
    }

    const textEl = sideCard.querySelector('.active-note-text');
    if (textEl) {
      const textVal = item.text || item.Notes || item.Catatan || '';
      if (textVal) {
        textEl.innerText = textVal;
        textEl.style.display = 'block';
      } else {
        textEl.innerText = '';
        textEl.style.display = 'none';
      }
    }

    const imgWrap = sideCard.querySelector('.active-note-img-wrap');
    if (imgWrap) {
      const img = imgWrap.querySelector('img');
      const imgVal = item.image || item.NotesImage || '';
      if (imgVal) {
        if (img) img.src = imgVal;
        imgWrap.style.display = 'block';
        imgWrap.onclick = function(e) {
          e.stopPropagation();
          if (typeof window.openPhotoModal === 'function') {
            window.openPhotoModal(imgVal);
          }
        };
      } else {
        if (img) img.src = '';
        imgWrap.style.display = 'none';
      }
    }
  } catch (err) {
    console.error("Error selecting lokasi side note:", err);
  }
};

window.toggleMainNotesBadge = function (btn, event) {
  if (event) event.stopPropagation();
  const notesCard = btn ? btn.closest('.actor-notes-card') : null;
  if (!notesCard) return;

  const wrapper = notesCard.querySelector('.main-notes-badge-wrapper');
  const arrow = btn.querySelector('.main-arrow-icon');

  if (wrapper) {
    const isHidden = wrapper.classList.contains('hidden');
    if (isHidden) {
      wrapper.classList.remove('hidden');
      if (arrow) arrow.innerText = '▲';
    } else {
      wrapper.classList.add('hidden');
      if (arrow) arrow.innerText = '▼';
    }
  }
};

let pendingPermissionActorId = null;
let pendingPermissionActorName = "";

window.requestPermission = function (actorId, actorName, e) {
  if (e) {
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
    if (typeof e.preventDefault === 'function') e.preventDefault();
  }
  pendingPermissionActorId = actorId;
  pendingPermissionActorName = actorName;

  const descEl = document.getElementById("requestPermissionDesc");
  if (descEl) {
    descEl.innerText = `Tuliskan alasan permintaan akses untuk "${actorName}".`;
  }
  const inputEl = document.getElementById("requestPermissionReasonInput");
  if (inputEl) {
    inputEl.value = "";
  }

  const modal = document.getElementById("requestPermissionConfirmOverlay");
  if (modal) {
    modal.classList.remove("hidden");
  }
};

window.closeRequestPermissionModal = function () {
  const modal = document.getElementById("requestPermissionConfirmOverlay");
  if (modal) {
    modal.classList.add("hidden");
  }
  pendingPermissionActorId = null;
  pendingPermissionActorName = "";
};

window.submitRequestPermission = function () {
  if (!pendingPermissionActorId) return;

  const reasonInput = document.getElementById("requestPermissionReasonInput");
  const alasan = reasonInput ? reasonInput.value.trim() : "";
  const actorId = pendingPermissionActorId;
  const actorName = pendingPermissionActorName;

  const submitBtn = document.getElementById("btnSubmitRequestPermission");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "Mengirim...";
  }

  fetch('/api/permission/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actor_id: actorId, actor_name: actorName, alasan: alasan })
  })
    .then(res => res.json())
    .then(data => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Kirim";
      }
      window.closeRequestPermissionModal();
      if (data.success) {
        if (typeof showToast === 'function') {
          showToast("admin akan menyetujui permintaan anda", "info");
        } else {
          alert("admin akan menyetujui permintaan anda");
        }
      } else {
        if (typeof showToast === 'function') {
          showToast("Gagal meminta akses: " + (data.error || "error"), "error");
        }
      }
    })
    .catch(err => {
      console.error(err);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Kirim";
      }
      window.closeRequestPermissionModal();
      if (typeof showToast === 'function') {
        showToast("Gagal meminta akses.", "error");
      }
    });
};

window.closeRequestCreationQuotaModal = function () {
  const modal = document.getElementById("requestCreationQuotaConfirmOverlay");
  if (modal) {
    modal.classList.add("hidden");
  }
};

window.submitRequestCreationQuota = function () {
  const amountInput = document.getElementById("requestQuotaAmountInput");
  const reasonInput = document.getElementById("requestQuotaReasonInput");
  const jumlah = amountInput ? parseInt(amountInput.value) || 1 : 1;
  const alasan = reasonInput ? reasonInput.value.trim() : "";

  const submitBtn = document.getElementById("btnSubmitQuotaRequest");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "Mengirim...";
  }

  fetch('/api/permission/request_creation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jumlah: jumlah, alasan: alasan })
  })
    .then(res => res.json())
    .then(data => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Kirim Permohonan";
      }
      window.closeRequestCreationQuotaModal();
      if (data.success) {
        if (typeof showToast === 'function') {
          showToast("Permohonan kuota marker dikirim ke Admin!", "success");
        } else {
          alert("Permohonan kuota marker dikirim ke Admin!");
        }
      } else {
        if (typeof showToast === 'function') {
          showToast("Gagal mengirim permohonan: " + (data.error || "error"), "error");
        }
      }
    })
    .catch(err => {
      console.error(err);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Kirim Permohonan";
      }
      window.closeRequestCreationQuotaModal();
      if (typeof showToast === 'function') {
        showToast("Terjadi kesalahan jaringan.", "error");
      }
    });
};

window.toggleNotes = function (card) {
  card.classList.toggle('collapsed');
};

window.openPhotoModal = function (src) {
  const overlay = document.getElementById('photoOverlay');
  const img = document.getElementById('fullPhoto');
  if (overlay && img && src) {
    img.src = src;
    overlay.classList.remove('hidden');
  }
};

window.updateMarkerCoords = async function (marker) {
  const ll = marker.getLatLng ? marker.getLatLng() : (marker.getBounds ? marker.getBounds().getCenter() : null);
  if (!ll) return;
  const popup = marker.getPopup();
  if (!popup) return;

  const updateUI = (coords, address) => {
    const el = popup.getElement();
    if (el) {
      if (coords) {
        const coordDiv = el.querySelector('.actor-coord');
        if (coordDiv) coordDiv.innerText = coords;
      }
      if (address) {
        const addressDiv = el.querySelector('.actor-address');
        if (addressDiv) addressDiv.innerText = address;
      }
    }
  };

  updateUI(`${ll.lat.toFixed(6)}, ${ll.lng.toFixed(6)}`, null);

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${ll.lat}&lon=${ll.lng}`);
    const data = await res.json();
    const address = data.display_name || "Alamat tidak ditemukan";
    if (marker.actorData) marker.actorData.address = address;
    updateUI(null, address);
  } catch (e) {
    console.error("Geocoding failed:", e);
  }
};

// Global functions for moderator.html
window.confirmLocation = function () {
  const m = window.draggingMarker || draggingMarker;
  document.getElementById('locationOverlay').classList.add('hidden');
  if (m) {
    updateMarkerCoords(m);
    if (window.saveToNeo4j) window.saveToNeo4j(m);
  }
  window.draggingMarker = null;
  window.lastMarkerPos = null;
  draggingMarker = null;
  lastMarkerPos = null;
};

window.closeLocation = function () {
  const m = window.draggingMarker || draggingMarker;
  const pos = window.lastMarkerPos || lastMarkerPos;
  if (m && pos) {
    if (m.setLatLng) {
      m.setLatLng(pos);
    }
    if (typeof updateMarkerCoords === 'function') {
      updateMarkerCoords(m);
    }
  }
  document.getElementById('locationOverlay').classList.add('hidden');
  window.draggingMarker = null;
  window.lastMarkerPos = null;
  draggingMarker = null;
  lastMarkerPos = null;
};

window.pendingDeleteBtn = null; // Changed to global window object

window.deleteMarker = function (btn) {
  window.pendingDeleteBtn = btn;
  document.getElementById('deleteConfirmOverlay').classList.remove('hidden');
};

window.confirmDeleteMarker = function () {
  if (window.pendingDeleteBtn) {
    const actorPopup = window.pendingDeleteBtn.closest('.actor-popup');
    const uniqueId = actorPopup ? actorPopup.dataset.uniqueId : null;

    if (uniqueId) {
      // Find marker associated with this popup
      const marker = window.actorMarkers.find(m => m.uniqueId === uniqueId);

      if (marker) {
        map.removeLayer(marker);
        window.actorMarkers = window.actorMarkers.filter(m => m !== marker);

        // Request 4 Delete Permanen Neo4j
        fetch('/api/actor/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: uniqueId })
        }).then(res => res.json()).then(data => {
          showToast("Aktor berhasil dihapus dari Neo4j.", "info");
        }).catch(err => {
          console.error(err);
          showToast("Gagal hapus di Neo4j.", "error");
        });
      }
    }
    if (typeof window.updateActorCreationUI === 'function') {
      window.updateActorCreationUI();
    }
    window.pendingDeleteBtn = null;
  }
  document.getElementById('deleteConfirmOverlay').classList.add('hidden');
};

window.cancelDeleteMarker = function () {
  pendingDeleteBtn = null;
  document.getElementById('deleteConfirmOverlay').classList.add('hidden');
};

// EDIT OVERLAYS LOGIC
window.openEditOverlay = function (type, uniqueId = '') {
  const targetMarker = (window.actorMarkers || []).find(m => m.uniqueId === uniqueId);
  const isOwner = targetMarker && (targetMarker.createdBy === window.currentUser || targetMarker.actorData?.createdBy === window.currentUser);
  const canEdit = window.isAdmin || isOwner || (window.userPermissions && window.userPermissions.includes(uniqueId));
  if (!canEdit && type !== "aktorLokasi") {
    showToast("Hanya Admin atau Pemilik yang bisa mengedit aktor.", "error");
    return;
  }
  let overlayId = "";
  if (type === "aktorUsaha") overlayId = "editUsahaOverlay";
  if (type === "aktorLokasi") overlayId = "editLokasiOverlay";

  const overlay = document.getElementById(overlayId);
  if (overlay) {
    overlay.classList.add("active");

    // Store the marker being edited
    let targetMarker = null;
    if (uniqueId) {
      targetMarker = window.actorMarkers.find(m => m.uniqueId === uniqueId);
    } else {
      const openPopup = map._popup;
      if (openPopup && openPopup._source && (openPopup._source.actorType === type || type === "aktorLokasi")) {
        targetMarker = openPopup._source;
      }
    }

    if (targetMarker) {
      window.editingMarker = targetMarker;

      const card = overlay.querySelector(".edit-card");
      card.querySelectorAll("input:not([type='file']), textarea, select").forEach(i => { if (i.type !== 'color') i.value = ""; });
      const preview = card.querySelector(".preview img");
      if (preview) {
        preview.src = "";
        preview.parentElement.style.display = "none";
      }

      // Populate fields from actorData if exists
      if (window.editingMarker.actorData) {
        const data = window.editingMarker.actorData;
        const card = overlay.querySelector(".edit-card");
        const inputs = card.querySelectorAll("input:not([type='file']), textarea, select");
        inputs.forEach((input) => {
          if (
            input.closest('.notes-section-usaha') ||
            input.closest('.user-notes-section') ||
            input.closest('.admin-activity-section') ||
            input.closest('#editLokasiActivityOverlay') ||
            input.closest('#editUsahaActivityOverlay') ||
            (input.id && (input.id.startsWith('inputLokasiNotes') || input.id.startsWith('inputUsahaNotes')))
          ) return;

          const label =
            input.previousElementSibling?.innerText ||
            input.placeholder ||
            input.id;
          if (data[label] !== undefined) {
            input.value = data[label];
            // Trigger change for selects (like Jenis)
            if (input.tagName === 'SELECT') {
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        });

        // Populate preview image if exists
        const preview = card.querySelector(".preview img");
        if (preview && data["Foto Visual Path"]) {
          preview.src = data["Foto Visual Path"];
          preview.parentElement.style.display = "block";
        }

        // Special Notes field hydration for Aktor Usaha
        if (type === "aktorUsaha") {
          const notesNameEl = document.getElementById("inputUsahaNotesName");
          if (notesNameEl) notesNameEl.value = data["NotesName"] || data["Notes"] || data["Catatan"] || '';

          const noteType = data["NotesType"] || data["notesType"] || '';
          const checkKampanye = document.getElementById("checkUsahaKampanye");
          const checkLowongan = document.getElementById("checkUsahaLowongan");
          if (checkKampanye) checkKampanye.checked = (noteType === 'kampanye');
          if (checkLowongan) checkLowongan.checked = (noteType === 'lowongan');
          if (typeof window.onUsahaNoteTypeChange === 'function') {
            window.onUsahaNoteTypeChange(noteType);
          }

          const notesTextEl = document.getElementById("inputUsahaNotesText");
          if (notesTextEl) notesTextEl.value = data["Notes"] || data["Catatan"] || '';

          const startEl = document.getElementById("inputUsahaNotesStart");
          if (startEl) startEl.value = data["NotesStartDate"] || '';

          const endEl = document.getElementById("inputUsahaNotesEnd");
          if (endEl) endEl.value = data["NotesEndDate"] || '';

          const previewNotesDiv = document.getElementById("previewUsahaNotesImg");
          const previewNotesImg = previewNotesDiv?.querySelector("img");
          if (previewNotesDiv && previewNotesImg) {
            if (data["NotesImage"]) {
              previewNotesImg.src = data["NotesImage"];
              previewNotesDiv.style.display = "block";
            } else {
              previewNotesImg.src = "";
              previewNotesDiv.style.display = "none";
            }
          }

          // Hydrate CTA options
          const ctaType = data["CtaType"] || data["ctaType"] || '';
          const checkWa = document.getElementById("checkUsahaCtaWa");
          const checkPromo = document.getElementById("checkUsahaCtaPromo");
          const checkUrl = document.getElementById("checkUsahaCtaUrl");
          if (checkWa) checkWa.checked = (ctaType === 'wa');
          if (checkPromo) checkPromo.checked = (ctaType === 'promo');
          if (checkUrl) checkUrl.checked = (ctaType === 'url');

          const inputWa = document.getElementById("inputUsahaCtaWa");
          if (inputWa) inputWa.value = data["CtaWa"] || '';

          const inputUrl = document.getElementById("inputUsahaCtaUrl");
          if (inputUrl) inputUrl.value = data["CtaUrl"] || '';

          if (typeof window.onUsahaCtaChange === 'function') {
            window.onUsahaCtaChange(ctaType);
          }

          // Hide input form by default & Render active activity list card
          const form = document.getElementById("viewUsahaActivityForm");
          if (form) form.style.display = "none";

          if (typeof window.renderUsahaActivityList === 'function') {
            window.renderUsahaActivityList(data);
          }
        }
      }

      // Special handling for Lokasi
      if (type === "aktorLokasi") {
        const adminFields = overlay.querySelectorAll(".admin-only-field");
        const userNotesSection = overlay.querySelector(".user-notes-section");
        const editTitle = overlay.querySelector(".edit-title");

        if (canEdit) {
          adminFields.forEach(el => el.style.display = "");
          if (userNotesSection) userNotesSection.style.display = "none";
          if (editTitle) editTitle.innerText = "Lokasi";

          if (typeof window.renderLokasiActivityList === 'function' && window.editingMarker.actorData) {
            window.renderLokasiActivityList(window.editingMarker.actorData);
          }
        } else {
          adminFields.forEach(el => el.style.display = "none");
          if (userNotesSection) userNotesSection.style.display = "block";
          if (editTitle) editTitle.innerText = "Edit Catatan Lokasi";

          // Hydrate User Notes fields
          const notesNameUser = document.getElementById("inputLokasiNotesNameUser");
          if (notesNameUser && window.editingMarker.actorData) {
            notesNameUser.value = window.editingMarker.actorData["NotesName"] || '';
          }

          const notesTextUser = document.getElementById("inputLokasiNotesTextUser");
          if (notesTextUser && window.editingMarker.actorData) {
            notesTextUser.value = window.editingMarker.actorData["Notes"] || window.editingMarker.actorData["Catatan"] || '';
          }

          const previewUserDiv = document.getElementById("previewLokasiNotesUser");
          const previewUserImg = previewUserDiv?.querySelector("img");
          if (previewUserDiv && previewUserImg) {
            if (window.editingMarker.actorData && window.editingMarker.actorData["NotesImage"]) {
              previewUserImg.src = window.editingMarker.actorData["NotesImage"];
              previewUserDiv.style.display = "block";
            } else {
              previewUserImg.src = "";
              previewUserDiv.style.display = "none";
            }
          }
        }

        let initColor = "#38a0c4";
        let initOpacity = 100;
        if (window.editingMarker.actorData && window.editingMarker.actorData["Warna"]) {
          initColor = window.editingMarker.actorData["Warna"];
        } else if (window.editingMarker.options.color) {
          initColor = window.editingMarker.options.color;
        }
        if (window.editingMarker.actorData && window.editingMarker.actorData["Opacity"] !== undefined) {
          initOpacity = window.editingMarker.actorData["Opacity"];
        }
        if (typeof window.setLokasiColorValue === 'function') {
          window.setLokasiColorValue(initColor, initOpacity, false);
        }

        // Show Coordinate Container if admin
        const coordsContainer = document.getElementById('polygonCoordsContainer');
        if (coordsContainer) {
          if (canEdit) {
            coordsContainer.classList.remove('hidden');
            updatePolygonCoordsUI(window.editingMarker);
          } else {
            coordsContainer.classList.add('hidden');
          }
        }
      }

      // Real-time Name sync to Popup (Requirement: "kalo NAMA DIGANTI MAKA OTOMATIS TERGANTI SEPERTI MILIK AKTOR LOKASI")
      const nameInput = [...overlay.querySelectorAll("textarea, input")].find(i =>
        (i.previousElementSibling?.innerText || i.placeholder || "").includes("Nama")
      );
      if (nameInput) {
        const targetMarkerRef = window.editingMarker; // FIX: Capture specific marker to avoid cross-contamination
        nameInput.oninput = (e) => {
          const newName = e.target.value;
          if (targetMarkerRef && targetMarkerRef.actorData) {
            // Update all potential name variants so getPopupContent stays fresh
            targetMarkerRef.actorData["Nama"] = newName;
            targetMarkerRef.actorData["Nama Usaha"] = newName;
            targetMarkerRef.actorData["Nama Lokasi"] = newName;
          }
          const popup = targetMarkerRef.getPopup();
          if (popup) {
            targetMarkerRef.setPopupContent(getPopupContent(targetMarkerRef.actorData, targetMarkerRef.actorType, targetMarkerRef.uniqueId));
          }
        };
      }
    }

    // Custom UI initialization has been moved above to ensure fields exist before hydration.
  }
};

window.updatePolygonCoordsUI = function (polygon) {
  const coordsList = document.getElementById('coordsList');
  if (!coordsList || !(polygon instanceof L.Polygon)) return;

  const latlngs = polygon.getLatLngs()[0];
  coordsList.innerHTML = latlngs.map((ll, idx) => `
    <div class="coord-item">
      <span>${idx + 1}.</span>
      <input type="text" value="${ll.lat.toFixed(6)}" readonly>
      <input type="text" value="${ll.lng.toFixed(6)}" readonly>
    </div>
  `).join('');
};

window.closeEditOverlay = function (el) {
  if (typeof window.closeLokasiColorPopover === 'function') {
    window.closeLokasiColorPopover();
  }
  el.closest('.edit-overlay').classList.remove('active');
  window.editingMarker = null;

  // Also hide polygon coords container if it was shown
  const coordsContainer = document.getElementById('polygonCoordsContainer');
  if (coordsContainer) coordsContainer.classList.add('hidden');
};

/* ===== LOKASI SOLID COLOR POPOVER HANDLERS ===== */
window.toggleLokasiColorPopover = function (event) {
  if (event) event.stopPropagation();
  const popover = document.getElementById('lokasiColorPopoverBox');
  if (!popover) return;
  if (popover.classList.contains('hidden') || popover.style.display === 'none') {
    popover.classList.remove('hidden');
    popover.style.display = 'block';
  } else {
    popover.classList.add('hidden');
    popover.style.display = 'none';
  }
};

window.closeLokasiColorPopover = function () {
  const popover = document.getElementById('lokasiColorPopoverBox');
  if (popover) {
    popover.classList.add('hidden');
    popover.style.display = 'none';
  }
};

window.setLokasiColorValue = function (newColor, opacityNum, shouldSave) {
  if (!newColor) newColor = '#38a0c4';
  if (!newColor.startsWith('#')) newColor = '#' + newColor;
  if (typeof opacityNum === 'undefined' || opacityNum === null) opacityNum = 100;
  opacityNum = Math.max(1, Math.min(100, parseInt(opacityNum) || 100));

  // Update Trigger Pill
  const triggerSwatch = document.getElementById('lokasiColorSwatch');
  const triggerHex = document.getElementById('lokasiColorHex');
  const triggerOpacity = document.getElementById('lokasiColorOpacity');
  const hiddenColorInput = document.getElementById('lokasiColorInput');

  if (triggerSwatch) triggerSwatch.style.background = newColor;
  if (triggerHex) triggerHex.innerText = newColor.toUpperCase();
  if (triggerOpacity) triggerOpacity.innerText = `${opacityNum}%`;
  if (hiddenColorInput) hiddenColorInput.value = newColor;

  // Update Popover Controls
  const popColorInput = document.getElementById('lokasiFillColorInput');
  const popHexInput = document.getElementById('lokasiFillHexInput');
  const popOpacityInput = document.getElementById('lokasiFillOpacityInput');
  const popOpacitySlider = document.getElementById('lokasiFillOpacitySlider');

  if (popColorInput && popColorInput.value.toLowerCase() !== newColor.toLowerCase()) {
    if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
      popColorInput.value = newColor;
    }
  }
  if (popHexInput && popHexInput !== document.activeElement) {
    popHexInput.value = newColor.toUpperCase();
  }
  if (popOpacityInput && popOpacityInput !== document.activeElement) {
    popOpacityInput.value = opacityNum;
  }
  if (popOpacitySlider && popOpacitySlider !== document.activeElement) {
    popOpacitySlider.value = opacityNum;
  }

  // Live update Leaflet map polygon / circle (mentok 40% transparansi pada 100% UI)
  const fillOp = (opacityNum / 100) * 0.40;
  if (window.editingMarker && window.editingMarker.setStyle) {
    window.editingMarker.setStyle({ color: newColor, fillColor: newColor, fillOpacity: fillOp });
    window.editingMarker.options.color = newColor;
    if (window.editingMarker.options.fillOpacity !== undefined) {
      window.editingMarker.options.fillOpacity = fillOp;
    }
  }

  if (shouldSave && window.editingMarker) {
    if (!window.editingMarker.actorData) window.editingMarker.actorData = {};
    window.editingMarker.actorData["Warna"] = newColor;
    window.editingMarker.actorData["Opacity"] = opacityNum;
    window.saveToNeo4j(window.editingMarker);
  }
};

window.onLokasiColorPickerInput = function (val) {
  const op = parseInt(document.getElementById('lokasiFillOpacityInput')?.value) || 100;
  window.setLokasiColorValue(val, op, true);
};

window.onLokasiColorHexInput = function (val) {
  let hex = val.trim();
  if (!hex.startsWith('#')) hex = '#' + hex;
  const op = parseInt(document.getElementById('lokasiFillOpacityInput')?.value) || 100;
  if (/^#[0-9A-Fa-f]{3,6}$/.test(hex)) {
    window.setLokasiColorValue(hex, op, true);
  }
};

window.onLokasiColorOpacityInput = function (val) {
  let op = Math.max(1, Math.min(100, parseInt(val) || 1));
  const hex = document.getElementById('lokasiFillHexInput')?.value || '#38a0c4';
  window.setLokasiColorValue(hex, op, true);
};

window.onLokasiColorOpacitySlider = function (val) {
  let op = Math.max(1, Math.min(100, parseInt(val) || 1));
  const hex = document.getElementById('lokasiFillHexInput')?.value || '#38a0c4';
  window.setLokasiColorValue(hex, op, true);
};


// Global click-outside listener to dismiss popover
document.addEventListener('click', function (e) {
  const popover = document.getElementById('lokasiColorPopoverBox');
  const trigger = document.getElementById('lokasiColorTrigger');
  if (popover && !popover.classList.contains('hidden') && popover.style.display !== 'none') {
    if (!popover.contains(e.target) && (!trigger || !trigger.contains(e.target))) {
      window.closeLokasiColorPopover();
    }
  }
});

window.saveToNeo4j = function (marker) {
  if (!marker || !marker.actorData) return;
  const latlng = marker.getLatLng ? marker.getLatLng() : (marker.getBounds ? marker.getBounds().getCenter() : { lat: 0, lng: 0 });
  const rawCoords = marker.getLatLngs ? marker.getLatLngs()[0].map(ll => ({ lat: ll.lat, lng: ll.lng })) : null;

  marker.actorData["rawCoords"] = rawCoords;
  if (marker.isUserCreated || (marker.actorData && marker.actorData.isUserCreated)) {
    marker.actorData["isUserCreated"] = true;
  }
  if (marker.createdBy || (marker.actorData && marker.actorData.createdBy)) {
    marker.actorData["createdBy"] = marker.createdBy || marker.actorData.createdBy;
  } else if (window.currentUser) {
    marker.actorData["createdBy"] = window.currentUser;
  }

  const payload = {
    ...marker.actorData,
    id: marker.uniqueId,
    type: marker.actorType || "aktorLokasi",
    name: marker.actorData["Nama"] || marker.actorData["Nama Usaha"] || marker.actorData["Nama Lokasi"] || "Unknown",
    lat: latlng.lat,
    lng: latlng.lng,
    isUserCreated: marker.isUserCreated || marker.actorData["isUserCreated"] || false,
    createdBy: marker.createdBy || marker.actorData["createdBy"] || window.currentUser
  };

  fetch('/api/actor/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => console.log("Real-time Neo4j sync successful"))
    .catch(err => console.error("Real-time Neo4j sync failed:", err));
};

// COMPREHENSIVE SAVE LOGIC (Requirement 5)
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-save')) {
    if (!window.editingMarker) return;

    const overlay = e.target.closest('.edit-overlay');
    if (!overlay) return;

    // Ignore standalone activity form overlays as they have dedicated modal save handlers
    if (overlay.id === 'editUsahaActivityOverlay' || overlay.id === 'editLokasiActivityOverlay') {
      return;
    }

    // Save common data
    const card = overlay.querySelector('.edit-card');
    const actorData = {
      ...(window.editingMarker.actorData || {}),
      timestamp: new Date().toISOString()
    };

    // Extract all inputs for the specific type
    const inputs = card.querySelectorAll('input:not([type="file"]), textarea, select');
    // Clear list arrays logic
    card.querySelectorAll('.list-container').forEach(lc => {
      const secLabel = lc.previousElementSibling?.innerText;
      if (secLabel) actorData[secLabel] = [];
    });

    inputs.forEach(input => {
      // Ignore inputs inside Notes/Activity sections so generic loop doesn't pollute actorData!
      if (
        input.closest('.notes-section-usaha') ||
        input.closest('.user-notes-section') ||
        input.closest('.admin-activity-section') ||
        input.closest('#editLokasiActivityOverlay') ||
        input.closest('#editUsahaActivityOverlay') ||
        (input.id && (input.id.startsWith('inputLokasiNotes') || input.id.startsWith('inputUsahaNotes')))
      ) return;

      let label = input.classList.contains('color-input') ? "Warna" : (input.closest('.form-group')?.querySelector('.label')?.innerText || input.previousElementSibling?.innerText || input.placeholder || input.id);
      if (!label) return;
      label = label.trim();

      const inList = input.closest('.list-container');
      if (inList) {
        const secLabel = inList.previousElementSibling?.innerText;
        if (secLabel && input.value.trim()) {
          if (!actorData[secLabel]) actorData[secLabel] = [];
          actorData[secLabel].push(input.value.trim());
        }
      } else {
        actorData[label] = input.value;
      }
    });

    // Handle Primary Photo Visual khusus (Target specific primary preview IDs so notes photo does not pollute Foto Visual Path)
    const primaryPreviewDiv = card.querySelector('#previewUsaha, #previewLokasi');
    const previewImg = primaryPreviewDiv?.querySelector('img');
    if (previewImg && previewImg.src && previewImg.src.startsWith('data:image')) {
      actorData["Foto Visual Path"] = previewImg.src;
    }

    // Handle Notes khusus Aktor Usaha
    if (window.editingMarker.actorType === "aktorUsaha") {
      const checkKampanye = document.getElementById("checkUsahaKampanye");
      const checkLowongan = document.getElementById("checkUsahaLowongan");
      let notesType = "";
      if (checkKampanye && checkKampanye.checked) notesType = "kampanye";
      else if (checkLowongan && checkLowongan.checked) notesType = "lowongan";

      const notesName = document.getElementById("inputUsahaNotesName")?.value || "";
      const notesText = document.getElementById("inputUsahaNotesText")?.value || "";
      const notesStart = document.getElementById("inputUsahaNotesStart")?.value || "";
      const notesEnd = document.getElementById("inputUsahaNotesEnd")?.value || "";

      const previewNotesDiv = document.getElementById("previewUsahaNotesImg");
      const previewNotesImg = previewNotesDiv?.querySelector("img");
      let notesImg = "";
      if (previewNotesImg && previewNotesImg.src && previewNotesImg.src !== window.location.href) {
        notesImg = previewNotesImg.src;
      }

      actorData["NotesName"] = notesName;
      actorData["NotesType"] = notesType;
      actorData["Notes"] = notesText;
      actorData["Catatan"] = notesText;
      actorData["NotesStartDate"] = notesStart;
      actorData["NotesEndDate"] = notesEnd;
      if (notesImg) actorData["NotesImage"] = notesImg;
      else delete actorData["NotesImage"];

      // Handle CTA options
      const checkCtaWa = document.getElementById("checkUsahaCtaWa");
      const checkCtaPromo = document.getElementById("checkUsahaCtaPromo");
      const checkCtaUrl = document.getElementById("checkUsahaCtaUrl");
      let ctaType = "";
      if (checkCtaWa && checkCtaWa.checked) ctaType = "wa";
      else if (checkCtaPromo && checkCtaPromo.checked) ctaType = "promo";
      else if (checkCtaUrl && checkCtaUrl.checked) ctaType = "url";

      const ctaWaVal = document.getElementById("inputUsahaCtaWa")?.value || "";
      const ctaUrlVal = document.getElementById("inputUsahaCtaUrl")?.value || "";

      actorData["CtaType"] = ctaType;
      actorData["CtaWa"] = ctaWaVal;
      actorData["CtaUrl"] = ctaUrlVal;

      // Clean up corrupt Deskripsi if it matches Notes
      if (actorData["Deskripsi"] === notesText) {
        delete actorData["Deskripsi"];
      }

      // Update marker icon dynamically pada peta!
      const newIconUrl = window.getUsahaIconUrl(actorData);
      window.editingMarker.setIcon(createActorIcon(newIconUrl));

      if (typeof window.renderUsahaActivityList === 'function') {
        window.renderUsahaActivityList(actorData);
      }
    }

    // Handle Notes khusus Aktor Lokasi
    if (window.editingMarker.actorType === "aktorLokasi" || overlay.id === "editLokasiOverlay") {
      const isUserSectionVisible = document.querySelector(".user-notes-section")?.style.display !== "none";
      if (isUserSectionVisible) {
        const notesNameUser = document.getElementById("inputLokasiNotesNameUser")?.value || "";
        const notesTextUser = document.getElementById("inputLokasiNotesTextUser")?.value || "";

        const previewUserDiv = document.getElementById("previewLokasiNotesUser");
        const previewUserImg = previewUserDiv?.querySelector("img");
        let notesImgUser = "";
        if (previewUserImg && previewUserImg.src && previewUserImg.src !== window.location.href) {
          notesImgUser = previewUserImg.src;
        }

        if (notesNameUser || notesTextUser || notesImgUser) {
          actorData["NotesName"] = notesNameUser;
          actorData["Notes"] = notesTextUser;
          actorData["Catatan"] = notesTextUser;
          if (notesImgUser) actorData["NotesImage"] = notesImgUser;
          else delete actorData["NotesImage"];
        }
      }

      if (typeof window.renderLokasiActivityList === 'function') {
        window.renderLokasiActivityList(actorData);
      }
    }

    // Save to the marker object
    window.editingMarker.actorData = actorData;

    // Apply color and scaled opacity if it's a polygon or circle (Aktor Lokasi)
    if (actorData["Warna"] && window.editingMarker.setStyle) {
      const opNum = actorData["Opacity"] !== undefined ? actorData["Opacity"] : 100;
      const fillOp = (opNum / 100) * 0.40;
      window.editingMarker.setStyle({ color: actorData["Warna"], fillColor: actorData["Warna"], fillOpacity: fillOp });
      window.editingMarker.options.color = actorData["Warna"];
      if (window.editingMarker.options.fillOpacity !== undefined) {
        window.editingMarker.options.fillOpacity = fillOp;
      }
    }

    // Update Popup Content (Full Refresh to match new structure)
    const popup = window.editingMarker.getPopup();
    if (popup) {
      window.editingMarker.setPopupContent(getPopupContent(actorData, window.editingMarker.actorType || "aktorLokasi", window.editingMarker.uniqueId));
      updateMarkerCoords(window.editingMarker);
    }

    // Panggil helper yang sudah terabstraksi!
    window.saveToNeo4j(window.editingMarker);
    showToast("Tersimpan permanen ke Knowledge Graph Neo4j", "info");

    if (typeof window.closeLokasiColorPopover === 'function') {
      window.closeLokasiColorPopover();
    }
    overlay.classList.remove('active');
    window.editingMarker = null;
  }
});

window.previewImageEdit = function (event, previewId) {
  const reader = new FileReader();
  const previewDiv = document.getElementById(previewId);
  const img = previewDiv.querySelector('img');

  reader.onload = function (e) {
    img.src = e.target.result;
    previewDiv.style.display = "block";
  };
  reader.readAsDataURL(event.target.files[0]);
};




// Format Populasi
document.addEventListener('blur', (e) => {
  if (e.target.classList.contains('input-populasi')) {
    let val = e.target.value.replace(/\D/g, "");
    if (val) e.target.value = val + " orang";
  }
}, true);

document.addEventListener('focus', (e) => {
  if (e.target.classList.contains('input-populasi')) {
    e.target.value = e.target.value.replace(" orang", "");
  }
}, true);

// ACTOR SWITCH FILTERING (Requirement 4)
document.querySelectorAll(".actor-switch img").forEach(icon => {
  icon.addEventListener("click", () => {
    const targetType = icon.getAttribute("data-target");

    // Request 4: "hanya akan menampilkan data masing-masing marker ikon"
    // This means when we switch to "aktorUsaha", only "Usaha" markers should be visible.

    window.actorMarkers.forEach(marker => {
      if (marker.actorType === targetType) {
        if (!map.hasLayer(marker)) marker.addTo(map);
      } else {
        if (map.hasLayer(marker)) map.removeLayer(marker);
      }
    });

    // Also update the UI as before (if needed, but main HTML already has partial logic)
    // The main HTML already handles showing/hiding the large actor buttons.
  });
});


function showToast(msg, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    const appEl = document.querySelector(".app") || document.body;
    appEl.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.innerHTML = "<span>" + msg + "</span>";
  container.appendChild(toast);
  setTimeout(() => toast.classList.add("active"), 10);
  setTimeout(() => {
    toast.classList.remove("active");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

window.addEventListener('load', () => {
  // Load user permissions first
  fetch('/api/user/permissions')
    .then(res => res.json())
    .then(data => {
      window.userPermissions = data.permissions || [];
    })
    .catch(err => {
      console.error("Gagal memuat izin user:", err);
      window.userPermissions = [];
    })
    .finally(() => {
      // Tunggu sejenak memastikan Leaflet 'map' sudah diinisialisasi di app.js
      setTimeout(() => {
        fetch('/api/actors')
          .then(res => res.json())
          .then(data => {
            if (!data.actors) return;
            data.actors.forEach(rec => {
              const type = rec.type;
              const aData = rec.raw_data || {};

              if (type === 'aktorLokasi' && aData.rawCoords) {
                // Restore Polygon
                const latlngs = aData.rawCoords.map(c => [c.lat, c.lng]);
                const warna = aData["Warna"] || '#8d98e0';
                const opacityVal = aData["Opacity"] !== undefined ? aData["Opacity"] : 100;
                const fillOp = (opacityVal / 100) * 0.40;
                const polygon = L.polygon(latlngs, {
                  color: warna,
                  fillColor: warna,
                  fillOpacity: fillOp
                });

                polygon.actorType = 'aktorLokasi';
                polygon.uniqueId = rec.id;
                polygon.actorData = aData;

                if (typeof setupPolygonInteractions === 'function') {
                  setupPolygonInteractions(polygon, true);
                } else {
                  polygon.bindPopup(() => getPopupContent(polygon.actorData, polygon.actorType, polygon.uniqueId));
                  polygon.on('popupopen', () => updateMarkerCoords ? updateMarkerCoords(polygon) : null);
                }
                window.actorMarkers.push(polygon);

                // Pada load awal, tampilkan polygon hanya jika switch aktif adalah aktorLokasi
                const activeSwitch = document.querySelector('.actor-main.active');
                if (activeSwitch && activeSwitch.id === 'aktorLokasi') {
                  polygon.addTo(map);
                }

              } else {
                // Restore Tipe Titik Marker Biasa
                let iconUrl = "";
                if (type === "aktorUsaha" || type === "usaha") iconUrl = window.getUsahaIconUrl(aData);

                if (iconUrl) {
                  const isOwner = aData && (aData.createdBy === window.currentUser || (aData.isUserCreated && aData.createdBy === window.currentUser));
                  const canEdit = window.isAdmin || isOwner || (window.userPermissions && window.userPermissions.includes(rec.id));
                  const marker = L.marker([rec.lat, rec.lng], {
                    icon: createActorIcon(iconUrl),
                    draggable: canEdit,
                  });

                  marker.actorType = 'aktorUsaha';
                  marker.uniqueId = rec.id;
                  marker.actorData = aData;

                  marker.bindPopup(() => getPopupContent(marker.actorData, marker.actorType, marker.uniqueId));

                  let dragStartPos = null;
                  marker.on('dragstart', function (e) {
                    dragStartPos = e.target.getLatLng();
                    lastMarkerPos = dragStartPos;
                    window.lastMarkerPos = dragStartPos;
                  });

                  marker.on('dragend', function (e) {
                    if (map.latLngToContainerPoint(dragStartPos).distanceTo(map.latLngToContainerPoint(e.target.getLatLng())) > 5) {
                      const overlay = document.getElementById('locationOverlay');
                      if (overlay) overlay.classList.remove('hidden');
                      draggingMarker = marker;
                      window.draggingMarker = marker;
                      window.lastMarkerPos = dragStartPos;
                      lastMarkerPos = dragStartPos;
                    }
                    if (typeof updateMarkerCoords === 'function') updateMarkerCoords(marker);
                  });

                  if (aData) {
                    if (aData.isUserCreated) marker.isUserCreated = true;
                    if (aData.createdBy) marker.createdBy = aData.createdBy;
                  }
                  marker.on('popupopen', () => typeof updateMarkerCoords === 'function' ? updateMarkerCoords(marker) : null);
                  window.actorMarkers.push(marker);

                  // Pada load awal, default tampilkan marker Aktor Usaha
                  const activeSwitch = document.querySelector('.actor-main.active');
                  if (!activeSwitch || activeSwitch.id === 'aktorUsaha') {
                    marker.addTo(map);
                  }
                }
              }
            });
            if (typeof window.updateActorCreationUI === 'function') {
              window.updateActorCreationUI();
            }
          })
          .catch(e => console.error("Gagal meload aktor dari Neo4j:", e));
      }, 1000);
    });
});

window.jumpToActor = function (id) {
  const marker = (window.actorMarkers || []).find(m => m.uniqueId === id);
  if (marker) {
    // Jika marker tidak ada di map (masih tersembunyi karena switch), paksa tampilkan
    if (!map.hasLayer(marker)) {
      const targetSwitch = marker.actorType;
      const switchImg = document.querySelector(`.actor-switch img[data-target="${targetSwitch}"]`);
      if (switchImg) switchImg.click();
    }

    const pos = marker.getLatLng ? marker.getLatLng() : marker.getBounds().getCenter();
    map.flyTo(pos, 18);
    setTimeout(() => marker.openPopup(), 500);
  }
};
