/**
 * ==========================================================================
 * 2211080 — 3D SMARTPHONE & SPATIAL GIS CONTROLLER (phone-3d.js)
 * Clean Leaflet OpenStreetMap Tiles, Authentic Actor Popups & 3D Rotation
 * ==========================================================================
 */

(function () {
  'use strict';

  let leafletMap = null;
  let streetTile = null;
  let satelliteTile = null;
  let isSatellite = false;

  // 1. Initialize 3D Smartphone Card Rotation for All Phones
  function init3DPhoneRotation() {
    const wrappers = document.querySelectorAll('.phone-3d-wrapper');
    if (!wrappers.length) return;

    wrappers.forEach((wrapper) => {
      const card = wrapper.querySelector('.phone-3d-card');
      if (!card) return;

      let rotX = 0;
      let rotY = 0;
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let startRotX = 0;
      let startRotY = 0;

      function updateTransform(isSmooth = false) {
        if (isSmooth) {
          card.classList.add('animating');
        } else {
          card.classList.remove('animating');
        }
        card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }

      const onDragStart = (e) => {
        const target = e.target;
        // Don't drag only if interacting inside textareas or inputs in promotion page builder
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.closest('.builder-canvas') ||
          target.closest('.toolbox-row') ||
          target.closest('.properties-drawer')
        ) {
          return;
        }

        isDragging = true;
        wrapper.classList.add('grabbing');
        card.classList.remove('animating');

        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

        startX = clientX;
        startY = clientY;
        startRotX = rotX;
        startRotY = rotY;
      };

      const onDragMove = (e) => {
        if (!isDragging) return;

        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        rotY = startRotY + deltaX * 0.75;
        rotX = Math.max(-60, Math.min(60, startRotX - deltaY * 0.5));

        updateTransform(false);
      };

      const onDragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        wrapper.classList.remove('grabbing');
      };

      wrapper.addEventListener('mousedown', onDragStart);
      window.addEventListener('mousemove', onDragMove);
      window.addEventListener('mouseup', onDragEnd);

      wrapper.addEventListener('touchstart', onDragStart, { passive: true });
      window.addEventListener('touchmove', onDragMove, { passive: true });
      window.addEventListener('touchend', onDragEnd);
      window.addEventListener('touchcancel', onDragEnd);

      updateTransform(true);
    });
  }

  // 2. Initialize Leaflet Map and Spatial GIS Features
  function initSpatialGIS() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof L === 'undefined') return;

    // Center coordinates (Balikpapan City Urban Land Area)
    const initialCoords = [-1.242, 116.860];
    const initialZoom = 13;

    leafletMap = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView(initialCoords, initialZoom);

    // Clean Free OpenStreetMap Tiles (No watermark / No API key required)
    streetTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    });

    // Satellite Tile Layer (Esri World Imagery)
    satelliteTile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    });

    streetTile.addTo(leafletMap);

    // Global Handlers for Side Notes Card (1:1 with actor_popup.js)
    window.toggleNotesSideCard = function (btn, event) {
      if (event) event.stopPropagation();
      const popup = btn.closest('.actor-popup');
      if (!popup) return;
      const sideCard = popup.querySelector('.actor-notes-side-card');
      if (sideCard) {
        sideCard.classList.toggle('active');
      }
    };

    window.closeNotesSideCard = function (event) {
      if (event) event.stopPropagation();
      const closeBtn = event.target.closest('.notes-side-close');
      if (!closeBtn) return;
      const sideCard = closeBtn.closest('.actor-notes-side-card');
      if (sideCard) {
        sideCard.classList.remove('active');
      }
    };

    // Authentic Actor Marker Icon Generator (Matching actor_popup.js)
    function createActorIcon(iconUrl) {
      return L.icon({
        iconUrl: iconUrl,
        iconSize: [46, 46],
        iconAnchor: [23, 23],
        popupAnchor: [0, -23]
      });
    }

    // Template Function for Authentic Actor Popup (Including Attached Side Popover)
    function createActorPopupHTML(actor) {
      let visualHtml = '';
      if (actor.hasPhoto !== false) {
        const photoSrc = actor.photoUrl || 'img/siomay.svg';
        visualHtml = `
          <div class="actor-popup-visual-wrapper">
            <img src="${photoSrc}" class="actor-popup-visual" alt="Foto Visual" />
          </div>
        `;
      }

      let sideCardHtml = '';
      if (actor.hasSideNotes) {
        const sideIcon = actor.noteType === 'lowongan' ? '../static/image/icon/job-portal.svg' : '../static/image/icon/campaign.svg';
        const badgeClass = actor.noteType === 'lowongan' ? 'lowongan' : 'kampanye';
        const badgeTitle = actor.noteType === 'lowongan' ? 'Lowongan Kerja' : 'Promo & Kampanye';

        sideCardHtml = `
          <button type="button" class="usaha-attached-notes-btn" onclick="window.toggleNotesSideCard(this, event)" title="Buka ${badgeTitle}">
            <img src="${sideIcon}" class="attached-btn-icon" alt="Side" />
          </button>
          <div class="actor-notes-side-card active" onclick="event.stopPropagation()">
            <div class="notes-side-header">
              <span class="notes-side-title">Rincian Aktivitas</span>
              <span class="notes-side-close" onclick="window.closeNotesSideCard(event)" title="Tutup">
                <img src="../static/image/icon/close.svg" alt="Tutup" style="width: 12px; height: 12px;" />
              </span>
            </div>
            <div class="notes-side-body">
              <div class="notes-type-badge ${badgeClass}">
                <img src="${sideIcon}" class="notes-badge-icon" alt="" />
                <span>${actor.activityTitle || badgeTitle}</span>
              </div>
              <div class="notes-side-text">${actor.activityDesc || 'Informasi ketersediaan lowongan kerja dan penempatan staff aktif.'}</div>
              <a href="https://wa.me/628123456789" target="_blank" class="notes-side-cta-btn wa" onclick="event.stopPropagation()">
                <img src="../static/image/icon/phone.svg" class="notes-cta-icon" alt="" /> Hubungi via WhatsApp
              </a>
            </div>
          </div>
        `;
      }

      return `
        <div class="actor-popup">
          <div class="actor-popup-header">
            ${actor.name}
          </div>
          <div class="actor-popup-content">
            ${visualHtml}
            <div class="actor-location-wrapper">
              <div class="actor-address">${actor.address}</div>
              <div class="actor-coord">${actor.lat.toFixed(5)}, ${actor.lng.toFixed(5)}</div>
            </div>
          </div>
          <div class="actor-popup-actions">
            <button class="actor-btn view-actor" onclick="window.openPromotionBuilder('${actor.name.replace(/'/g, "\\'")}')" title="Lihat Halaman Promosi">
              <img src="../static/image/icon/view.svg" class="emoji-img" alt="Lihat" />
            </button>
            <button class="actor-btn edit-actor" onclick="document.getElementById('editUsahaOverlay').classList.remove('hidden')" title="Edit">
              <img src="../static/image/icon/edit.svg" class="emoji-img" alt="Edit" />
            </button>
            <button class="actor-btn delete-actor" onclick="alert('Hapus aktor ${actor.name}?')" title="Hapus">
              <img src="../static/image/icon/delete.svg" class="emoji-img" alt="Hapus" />
            </button>
          </div>
          ${sideCardHtml}
        </div>
      `;
    }

    // Add Demo Spatial Actor Markers (1 Marker with Photo & Lowongan Side Popover, 1 Marker without Photo)
    const actorsList = [
      {
        name: 'Sentra Retail & Karir 2211080',
        type: 'Usaha',
        iconUrl: '../static/image/actor/usaha-job-portal.svg',
        address: 'Jl. MT Haryono No. 88, Damai',
        lat: -1.238,
        lng: 116.855,
        hasPhoto: true,
        photoUrl: 'img/siomay.svg',
        hasSideNotes: true,
        noteType: 'lowongan',
        activityTitle: 'Lowongan Kasir & Staff GIS',
        activityDesc: 'Dibutuhkan segera 3 orang tenaga kerja untuk operasional harian dan analis pemetaan.'
      },
      {
        name: 'PT Sentra Spatial Hub',
        type: 'Usaha',
        iconUrl: '../static/image/actor/usaha.svg',
        address: 'Jl. Jenderal Sudirman No. 45, Klandasan',
        lat: -1.245,
        lng: 116.868,
        hasPhoto: false, // Tanpa foto profil / visual
        hasSideNotes: false
      }
    ];

    const markerMap = {};
    actorsList.forEach(actor => {
      const marker = L.marker([actor.lat, actor.lng], { icon: createActorIcon(actor.iconUrl) }).addTo(leafletMap);
      marker.bindPopup(createActorPopupHTML(actor), {
        maxWidth: 450,
        className: 'custom-actor-leaflet-popup'
      });
      markerMap[actor.name] = marker;
    });

    // Zoom Buttons
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    if (zoomInBtn) zoomInBtn.addEventListener('click', (e) => { e.stopPropagation(); leafletMap.zoomIn(); });
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', (e) => { e.stopPropagation(); leafletMap.zoomOut(); });

    // Satellite Tile Toggle
    const toggleMapBtn = document.getElementById('toggleMap');
    if (toggleMapBtn) {
      toggleMapBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isSatellite) {
          leafletMap.removeLayer(satelliteTile);
          streetTile.addTo(leafletMap);
          toggleMapBtn.querySelector('span').textContent = 'Satelit';
          toggleMapBtn.classList.remove('active');
          isSatellite = false;
        } else {
          leafletMap.removeLayer(streetTile);
          satelliteTile.addTo(leafletMap);
          toggleMapBtn.querySelector('span').textContent = 'Peta';
          toggleMapBtn.classList.add('active');
          isSatellite = true;
        }
      });
    }

    // Topbar Search
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searching');
    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const query = searchInput.value.trim();
        if (query) {
          leafletMap.setView(initialCoords, 15);
        }
      });
    }

    // Profile Dropdown Toggle
    const profileBtn = document.getElementById('profile');
    const profileWrapper = document.getElementById('profileWrapper');
    if (profileBtn && profileWrapper) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileWrapper.classList.toggle('active');
      });
      document.addEventListener('click', (e) => {
        if (!profileWrapper.contains(e.target) && e.target !== profileBtn) {
          profileWrapper.classList.remove('active');
        }
      });
    }

    // Cluster Level Dropdown
    const clusterTool = document.getElementById('clusterTool');
    const clusterMain = document.getElementById('clusterMain');
    const clusterOptions = document.getElementById('clusterOptions');
    const clusterText = document.getElementById('clusterText');

    const zoomLevels = {
      'RT / RW': 18,
      'Kelurahan': 15,
      'Kecamatan': 13,
      'Kabupaten / Kota': 11
    };

    if (clusterTool && clusterOptions) {
      const toggleCluster = (e) => {
        e.stopPropagation();
        clusterOptions.style.display = clusterOptions.style.display === 'flex' ? 'none' : 'flex';
      };
      clusterTool.addEventListener('click', toggleCluster);
      clusterMain.addEventListener('click', toggleCluster);

      document.querySelectorAll('.cluster-option').forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          const selected = option.textContent.trim();
          if (clusterText) clusterText.textContent = selected;
          clusterOptions.style.display = 'none';
          if (zoomLevels[selected]) {
            leafletMap.setZoom(zoomLevels[selected]);
          }
        });
      });
    }

    // Actor Switcher (Aktor Usaha vs Draw Lokasi)
    const switchIcons = document.querySelectorAll('.actor-switch img');
    const actorUsaha = document.getElementById('aktorUsaha');
    const actorLokasi = document.getElementById('aktorLokasi');

    switchIcons.forEach(icon => {
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = icon.getAttribute('data-target');
        switchIcons.forEach(i => i.classList.remove('active'));
        icon.classList.add('active');

        if (targetId === 'aktorUsaha') {
          if (actorUsaha) actorUsaha.classList.remove('hidden');
          if (actorLokasi) actorLokasi.classList.add('hidden');
        } else {
          if (actorLokasi) actorLokasi.classList.remove('hidden');
          if (actorUsaha) actorUsaha.classList.add('hidden');
        }
      });
    });

    // Form Edit Overlays (Usaha & Lokasi)
    const editUsahaOverlay = document.getElementById('editUsahaOverlay');
    const editLokasiOverlay = document.getElementById('editLokasiOverlay');
    const closeUsahaEdit = document.getElementById('closeUsahaEdit');
    const closeLokasiEdit = document.getElementById('closeLokasiEdit');
    const btnSaveUsaha = document.getElementById('btnSaveUsaha');
    const btnSaveLokasi = document.getElementById('btnSaveLokasi');

    if (actorUsaha && editUsahaOverlay) {
      actorUsaha.addEventListener('click', (e) => {
        e.stopPropagation();
        editUsahaOverlay.classList.remove('hidden');
      });
    }

    if (actorLokasi && editLokasiOverlay) {
      actorLokasi.addEventListener('click', (e) => {
        e.stopPropagation();
        editLokasiOverlay.classList.remove('hidden');
      });
    }

    if (closeUsahaEdit && editUsahaOverlay) {
      closeUsahaEdit.addEventListener('click', (e) => {
        e.stopPropagation();
        editUsahaOverlay.classList.add('hidden');
      });
    }

    if (closeLokasiEdit && editLokasiOverlay) {
      closeLokasiEdit.addEventListener('click', (e) => {
        e.stopPropagation();
        editLokasiOverlay.classList.add('hidden');
      });
    }

    if (btnSaveUsaha && editUsahaOverlay) {
      btnSaveUsaha.addEventListener('click', (e) => {
        e.stopPropagation();
        editUsahaOverlay.classList.add('hidden');
      });
    }

    if (btnSaveLokasi && editLokasiOverlay) {
      btnSaveLokasi.addEventListener('click', (e) => {
        e.stopPropagation();
        editLokasiOverlay.classList.add('hidden');
      });
    }

    // ==========================================================================
    // AUTOPLAY SIMULATION LOOP CONTROLLER FOR AKTOR USAHA
    // "buat aktor -> tentukan lokasi -> isi edit card (Siomay Batagor mang ujang + img-temp.svg) -> simpan -> klik aktor icon -> muncul popup info -> looping"
    // ==========================================================================
    function initAktorUsahaAutoplayLoop() {
      const appRoot = document.getElementById('appRoot');
      const pointer = document.getElementById('simulatedPointer');
      const editOverlay = document.getElementById('editUsahaOverlay');
      const namaInput = document.getElementById('inputUsahaNama');
      const fokusInput = document.getElementById('inputUsahaFokus');
      const uploadWrapper = document.getElementById('uploadWrapperUsaha');
      const previewBox = document.getElementById('previewUsaha');
      const saveBtn = document.getElementById('btnSaveUsaha');
      const aktorUsahaBtn = document.getElementById('aktorUsaha');

      if (!appRoot || !pointer || !leafletMap) return;

      let isAutoplayRunning = true;
      let customSiomayMarker = null;

      const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      function movePointerTo(targetX, targetY, duration = 800) {
        return new Promise(resolve => {
          pointer.style.transition = `top ${duration}ms cubic-bezier(0.25, 1, 0.5, 1), left ${duration}ms cubic-bezier(0.25, 1, 0.5, 1), transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)`;
          pointer.style.left = `${targetX}px`;
          pointer.style.top = `${targetY}px`;
          setTimeout(resolve, duration);
        });
      }

      function movePointerToElement(el, duration = 800) {
        if (!el) return Promise.resolve();
        const appRect = appRoot.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const targetX = elRect.left - appRect.left + (elRect.width / 2);
        const targetY = elRect.top - appRect.top + (elRect.height / 2);
        return movePointerTo(targetX, targetY, duration);
      }

      function movePointerToLatLng(latLng, duration = 800) {
        const point = leafletMap.latLngToContainerPoint(latLng);
        const mapEl = document.getElementById('map');
        const appRect = appRoot.getBoundingClientRect();
        const mapRect = mapEl.getBoundingClientRect();
        const targetX = (mapRect.left - appRect.left) + point.x;
        const targetY = (mapRect.top - appRect.top) + point.y;
        return movePointerTo(targetX, targetY, duration);
      }

      async function simulateClick(holdMs = 250) {
        pointer.classList.add('clicking');
        await wait(holdMs);
        pointer.classList.remove('clicking');
        await wait(100);
      }

      async function simulateType(inputEl, text, speed = 35) {
        if (!inputEl) return;
        inputEl.value = '';
        for (let i = 0; i < text.length; i++) {
          inputEl.value += text[i];
          await wait(speed);
        }
      }

      async function runSimulationCycle() {
        while (isAutoplayRunning) {
          // 0. RESET STATE
          if (customSiomayMarker) {
            leafletMap.removeLayer(customSiomayMarker);
            customSiomayMarker = null;
          }
          leafletMap.closePopup();
          if (editOverlay) {
            editOverlay.classList.remove('active');
            editOverlay.style.display = 'none';
          }
          if (namaInput) namaInput.value = '';
          if (fokusInput) fokusInput.value = '';
          if (uploadWrapper) uploadWrapper.classList.remove('highlight');
          if (previewBox) {
            previewBox.style.display = 'none';
            const img = previewBox.querySelector('img');
            if (img) img.src = '';
          }
          if (saveBtn) saveBtn.classList.remove('active-click');

          const centerCoord = [-1.242, 116.860];
          leafletMap.setView(centerCoord, 14, { animate: false });

          // Position pointer at center initial
          await movePointerTo(165, 300, 400);
          await wait(800);

          // 1. BUAT AKTOR (Klik Tombol Aktor Usaha)
          if (aktorUsahaBtn) {
            await movePointerToElement(aktorUsahaBtn, 850);
            await simulateClick();
            aktorUsahaBtn.classList.add('active');
          }
          await wait(600);

          // 2. TENTUKAN LOKASI (Pilih Titik di Peta Balikpapan)
          const targetLatLng = L.latLng(-1.2438, 116.8625);
          leafletMap.panTo(targetLatLng, { animate: true, duration: 0.8 });
          await wait(800);

          await movePointerToLatLng(targetLatLng, 700);
          await simulateClick(300);

          // Flash pulse on map
          const tempPulse = L.circleMarker(targetLatLng, {
            radius: 12,
            color: '#38a0c4',
            fillColor: '#8d98e0',
            fillOpacity: 0.6,
            weight: 3
          }).addTo(leafletMap);

          await wait(600);
          leafletMap.removeLayer(tempPulse);

          // 3. ISI EDIT CARD (Nama: Siomay Batagor mang ujang, Foto: siomay.svg, Fokus: Kuliner Khas)
          if (editOverlay) {
            editOverlay.classList.add('active');
            editOverlay.style.display = 'flex';
          }
          await wait(400);

          // Isi Nama Usaha: Siomay Batagor mang ujang
          if (namaInput) {
            await movePointerToElement(namaInput, 500);
            await simulateClick(150);
            await simulateType(namaInput, 'Siomay Batagor mang ujang', 35);
          }
          await wait(300);

          // Upload Foto Visual (siomay.svg) -> Reveal Preview Image Box
          if (uploadWrapper) {
            await movePointerToElement(uploadWrapper, 600);
            await simulateClick();
            uploadWrapper.classList.add('highlight');
            if (previewBox) {
              const img = previewBox.querySelector('img');
              if (img) img.src = 'img/siomay.svg';
              previewBox.style.display = 'block';
            }
          }
          await wait(600);

          // Isi Fokus Usaha
          if (fokusInput) {
            await movePointerToElement(fokusInput, 500);
            await simulateClick(150);
            await simulateType(fokusInput, 'Kuliner Khas Tradisional & Siomay Batagor', 25);
          }
          await wait(400);

          // 4. SIMPAN AKTOR
          if (saveBtn) {
            await movePointerToElement(saveBtn, 600);
            await simulateClick();
            saveBtn.classList.add('active-click');
          }
          await wait(400);

          if (editOverlay) {
            editOverlay.classList.remove('active');
            editOverlay.style.display = 'none';
          }
          if (saveBtn) saveBtn.classList.remove('active-click');

          // Create Authentic Actor Marker on Map
          const actorData = {
            name: 'Siomay Batagor mang ujang',
            type: 'Usaha',
            iconUrl: '../static/image/actor/usaha.svg',
            address: 'Jl. MT Haryono No. 42, Damai',
            lat: -1.2438,
            lng: 116.8625,
            hasPhoto: true,
            photoUrl: 'img/siomay.svg',
            hasSideNotes: false
          };

          customSiomayMarker = L.marker([actorData.lat, actorData.lng], {
            icon: createActorIcon(actorData.iconUrl)
          }).addTo(leafletMap);

          customSiomayMarker.bindPopup(createActorPopupHTML(actorData), {
            maxWidth: 450,
            className: 'custom-actor-leaflet-popup'
          });

          await wait(600);

          // 5. KLIK AKTOR ICON
          await movePointerToLatLng(targetLatLng, 750);
          await simulateClick();

          // 6. MUNCUL POPUP INFORMASI
          customSiomayMarker.openPopup();

          // Hold popup open for full inspection
          await wait(4500);

          // 7. LOOPING
          await wait(1000);
        }
      }

      // Start autoplay cycle automatically
      setTimeout(() => {
        runSimulationCycle();
      }, 700);
    }

    // Initialize Autoplay loop
    initAktorUsahaAutoplayLoop();
    let isTargetingMode = false;
    window.targetPin = null;
    window.targetCircle = null;
    window.currentRadius = 500;
    window.lastPinnedLocationName = "Area Target MT Haryono";
    window.currentChatMode = "default";
    window.currentChatMedia = null;

    window.toggleChatbot = function () {
      const overlay = document.getElementById('chatbotOverlay');
      if (overlay) overlay.classList.toggle('hidden');
    };

    window.toggleJobCreationMenu = function () {
      const subMenu = document.getElementById('jobCreationSubMenu');
      const toggleBtn = document.getElementById('mainJcToggle');
      if (subMenu) {
        subMenu.classList.toggle('hidden');
        if (!subMenu.classList.contains('hidden')) {
          if (toggleBtn) toggleBtn.classList.add('active');
        } else {
          if (toggleBtn) toggleBtn.classList.remove('active');
        }
      }
    };

    window.setChatMode = function (mode, element) {
      window.currentChatMode = mode;
      document.querySelectorAll('.jc-chip').forEach(chip => chip.classList.remove('active'));

      if (element && mode !== 'default') {
        element.classList.add('active');
      }

      if (mode !== 'sumber-daya' && window.removeChatImage) {
        window.removeChatImage();
      }

      const input = document.getElementById('chatInput');
      if (input) {
        if (mode === 'sumber-daya') input.placeholder = "Sebutkan produk/aset lokal ATAU skill & modal yang dimiliki...";
        else if (mode === 'celah-masalah') input.placeholder = "Tanya celah masalah & kebutuhan lokal di radius...";
        else if (mode === 'analisis') input.placeholder = "Minta alur operasional & analisis teknis...";
        else if (mode === 'simulasi-modal') input.placeholder = "Tanya simulasi modal awal & kelayakan bisnis...";
        else if (mode === 'simulasi-lapangan-kerja') input.placeholder = "Simulasi penyerapan tenaga kerja lokal...";
        else input.placeholder = "Tanyakan sesuatu...";
      }

      // Auto trigger rich demo response for active mode
      const modeNames = {
        'sumber-daya': 'Skill & Sumber Daya',
        'celah-masalah': 'Celah Masalah & Kebutuhan',
        'analisis': 'Analisis Teknis & Rantai Pasok',
        'simulasi-modal': 'Simulasi Modal & Kelayakan',
        'simulasi-lapangan-kerja': 'Simulasi Penyerapan Lapangan Kerja'
      };

      if (mode !== 'default' && modeNames[mode]) {
        appendChatMessage('user', `Mode: <strong>${modeNames[mode]}</strong>`);
        showTypingIndicator();
        setTimeout(() => {
          removeTypingIndicator();
          generateSpatialResponse(mode);
        }, 600);
      }
    };

    window.handleChatImageUpload = function (event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        window.currentChatMedia = e.target.result;
        const preview = document.getElementById('chatPreviewImg');
        if (preview) preview.src = window.currentChatMedia;
        const box = document.getElementById('chatImagePreview');
        if (box) box.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    };

    window.removeChatImage = function () {
      window.currentChatMedia = null;
      const input = document.getElementById('chatImgInput');
      if (input) input.value = '';
      const box = document.getElementById('chatImagePreview');
      if (box) box.classList.add('hidden');
      const preview = document.getElementById('chatPreviewImg');
      if (preview) preview.src = '';
    };

    window.removeLocationTarget = function () {
      if (window.targetPin) leafletMap.removeLayer(window.targetPin);
      if (window.targetCircle) leafletMap.removeLayer(window.targetCircle);
      window.targetPin = null;
      window.targetCircle = null;
      const badge = document.getElementById('locationTargetBadge');
      if (badge) badge.classList.add('hidden');
      appendChatMessage('bot', 'Target lokasi telah dihapus. Pencarian kembali ke seluruh wilayah peta.');
    };

    window.startTargetingMode = function () {
      window.toggleChatbot();
      isTargetingMode = true;
      leafletMap.getContainer().style.cursor = 'crosshair';

      // Drop radius pin at center
      const center = leafletMap.getCenter();
      placeTargetPin(center);

      setTimeout(() => {
        isTargetingMode = false;
        leafletMap.getContainer().style.cursor = '';
        const badge = document.getElementById('locationTargetBadge');
        if (badge) badge.classList.remove('hidden');
        window.toggleChatbot();
        appendChatMessage('bot', `Target Lokasi Terkunci: <strong>${window.currentRadius} meter</strong>.<br/><em>${window.lastPinnedLocationName} (${center.lat.toFixed(4)}, ${center.lng.toFixed(4)})</em>`);
      }, 500);
    };

    function placeTargetPin(latlng) {
      if (window.targetPin) leafletMap.removeLayer(window.targetPin);
      if (window.targetCircle) leafletMap.removeLayer(window.targetCircle);

      const pinIcon = L.icon({
        iconUrl: '../static/image/icon/ai-pin.svg',
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      window.targetPin = L.marker(latlng, { icon: pinIcon, draggable: true }).addTo(leafletMap);
      window.targetCircle = L.circle(latlng, { radius: window.currentRadius, color: '#38a0c4', fillColor: '#38a0c4', fillOpacity: 0.2 }).addTo(leafletMap);
      window.targetPin.on('drag', (ev) => {
        window.targetCircle.setLatLng(ev.latlng);
      });
    }

    function showTypingIndicator() {
      const chatMessages = document.getElementById('chatMessages');
      if (!chatMessages) return;
      const typingEl = document.createElement('div');
      typingEl.className = 'message bot typing-indicator';
      typingEl.innerHTML = `<div class="bubble"><em>AI sedang memetakan data radius...</em></div>`;
      chatMessages.appendChild(typingEl);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
      document.querySelectorAll('.typing-indicator').forEach(el => el.remove());
    }

    function appendChatMessage(sender, htmlContent, hasEval = true) {
      const chatMessages = document.getElementById('chatMessages');
      if (!chatMessages) return;

      const msgDiv = document.createElement('div');
      msgDiv.className = `message ${sender}`;

      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.innerHTML = htmlContent;
      msgDiv.appendChild(bubble);

      if (sender === 'bot' && hasEval) {
        const evalContainer = document.createElement('div');
        evalContainer.className = 'eval-trigger-container';
        evalContainer.innerHTML = `
          <button type="button" class="btn-eval-trigger" onclick="window.toggleEvalCard(this)">
            <img src="../static/image/icon/ai-pin.svg" alt="" />
            <span>Evaluasi RAGAS</span>
            <span class="overall-badge level-excellent" style="margin-left: 4px;">97.1%</span>
          </button>
          <div class="eval-results-card hidden">
            <div class="eval-header">
              <span class="eval-title">Metrik Evaluasi RAGAS</span>
              <span class="overall-badge level-excellent">EXCELLENT</span>
            </div>
            <div class="score-grid">
              <div class="score-item">
                <div class="score-label">Context Precision</div>
                <div class="score-value text-excellent">96.4%</div>
                <div class="score-desc">Relevansi data spasial tinggi</div>
              </div>
              <div class="score-item">
                <div class="score-label">Faithfulness</div>
                <div class="score-value text-excellent">98.2%</div>
                <div class="score-desc">Faktual sesuai data GIS</div>
              </div>
              <div class="score-item">
                <div class="score-label">Answer Relevance</div>
                <div class="score-value text-excellent">97.5%</div>
                <div class="score-desc">Akurat menjawab kebutuhan</div>
              </div>
              <div class="score-item">
                <div class="score-label">Context Recall</div>
                <div class="score-value text-good">95.0%</div>
                <div class="score-desc">Cakupan entitas komprehensif</div>
              </div>
            </div>
          </div>
        `;
        msgDiv.appendChild(evalContainer);
      }

      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    window.toggleEvalCard = function (btn) {
      const card = btn.nextElementSibling;
      if (card) {
        card.classList.toggle('hidden');
      }
    };

    function generateSpatialResponse(mode) {
      let responseHtml = '';
      if (mode === 'sumber-daya') {
        responseHtml = `
          <h3>Potensi Skill & Sumber Daya Lokal</h3>
          <p>Berdasarkan analisis klaster radius <strong>500m</strong> di sekitar <strong>Sentra Retail & Karir 2211080</strong>:</p>
          <div class="chat-carousel-wrapper">
            <div class="chat-carousel-card">
              <h3>Keahlian & SDM</h3>
              <ul>
                <li><input type="checkbox" checked /> 65% Tenaga Ahli Ritel & Logistik</li>
                <li><input type="checkbox" checked /> 25% Analis Pemetaan Spasial</li>
                <li><input type="checkbox" /> 10% Sertifikasi GIS Tingkat Madya</li>
              </ul>
            </div>
            <div class="chat-carousel-card">
              <h3>Rantai Pasok</h3>
              <ul>
                <li><input type="checkbox" checked /> Akses jalan arteri utama (MT Haryono)</li>
                <li><input type="checkbox" checked /> Konektivitas pergudangan & pelabuhan</li>
              </ul>
            </div>
          </div>
        `;
      } else if (mode === 'simulasi-modal') {
        responseHtml = `
          <h3>Simulasi Kelayakan Finansial & Modal</h3>
          <table>
            <thead>
              <tr><th>Komponen</th><th>Estimasi</th><th>Alokasi</th></tr>
            </thead>
            <tbody>
              <tr><td>Infrastruktur & Alat</td><td>Rp 450 Jt</td><td>35%</td></tr>
              <tr><td>Operasional & Gaji</td><td>Rp 320 Jt</td><td>25%</td></tr>
              <tr><td>Pengadaan Stok</td><td>Rp 510 Jt</td><td>40%</td></tr>
            </tbody>
          </table>
          <p><strong>Proyeksi ROI:</strong> Titik impas (BEP) tercapai dalam <strong>12 - 14 bulan</strong> dengan tingkat pengembalian internal (IRR) sebesar <strong>28.4%</strong>.</p>
        `;
      } else if (mode === 'simulasi-lapangan-kerja') {
        responseHtml = `
          <h3>Simulasi Penyerapan Lapangan Kerja</h3>
          <p>Terdeteksi aktor usaha aktif <span class="actor-link" onclick="leafletMap.setView([-1.238, 116.855], 18)"><strong>Sentra Retail & Karir 2211080</strong></span> dengan lowongan terbuka:</p>
          <div class="chat-carousel-wrapper">
            <div class="chat-carousel-card">
              <h3>Lowongan Aktif</h3>
              <p>Dibutuhkan <strong>3 Staff GIS & Kasir</strong>.</p>
              <a href="https://wa.me/628123456789" target="_blank" class="notes-side-cta-btn wa" style="margin-top: 6px;">
                <img src="../static/image/icon/phone.svg" class="notes-cta-icon" alt="" /> Kontak WhatsApp
              </a>
            </div>
            <div class="chat-carousel-card">
              <h3>Estimasi Penyerapan</h3>
              <p>Potensi serapan <strong>45+ pekerja baru</strong> dalam pengembangan tahap II.</p>
            </div>
          </div>
        `;
      } else {
        responseHtml = `
          <h3>Analisis Spasial Komprehensif</h3>
          <p>Wilayah terfokus pada kawasan urban terpadu dengan densitas kegiatan ekonomi tinggi. Aktor terdaftar: <strong>2 Usaha</strong>, <strong>1 Titik Karir</strong>.</p>
        `;
      }
      appendChatMessage('bot', responseHtml, true);
    }

    function handleChatSend() {
      const chatInput = document.getElementById('chatInput');
      if (!chatInput) return;
      const text = chatInput.value.trim();
      if (!text && !window.currentChatMedia) return;

      let msgContent = text;
      if (window.currentChatMedia) {
        msgContent = `<img src="${window.currentChatMedia}" style="max-width: 100%; border-radius: 8px; margin-bottom: 6px;" /><br/>` + text;
      }

      appendChatMessage('user', msgContent, false);
      chatInput.value = '';
      window.removeChatImage();

      showTypingIndicator();
      setTimeout(() => {
        removeTypingIndicator();
        generateSpatialResponse(window.currentChatMode);
      }, 700);
    }

    // Attach Chatbot Event Listeners
    const chatbotBtn = document.getElementById('chatbotBtn');
    const btnAiPin = document.getElementById('btnAiPin');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const chatInput = document.getElementById('chatInput');

    if (chatbotBtn) {
      chatbotBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.toggleChatbot();
      });
    }

    if (btnAiPin) {
      btnAiPin.addEventListener('click', (e) => {
        e.stopPropagation();
        window.startTargetingMode();
      });
    }

    if (sendChatBtn) {
      sendChatBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleChatSend();
      });
    }

    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleChatSend();
        }
      });
    }

    // ==========================================================================
    // 7. PROMOTION PAGE BUILDER CONTROLLER (DRAG & DROP CANVAS & EDITING)
    // ==========================================================================
    const promotionBuilderContainer = document.getElementById('promotionBuilderContainer');
    const builderAppTitle = document.getElementById('builderAppTitle');
    const btnBackToMap = document.getElementById('btnBackToMap');
    const btnToggleLayers = document.getElementById('btnToggleLayers');
    const btnPalette = document.getElementById('btnPalette');
    const paletteHeaderContainer = document.getElementById('paletteHeaderContainer');
    const paletteHeaderSwatches = document.getElementById('paletteHeaderSwatches');
    const btnUIKit = document.getElementById('btnUIKit');
    const btnUndo = document.getElementById('btnUndo');
    const btnRedo = document.getElementById('btnRedo');
    const btnToggleMode = document.getElementById('btnToggleMode');
    const modeIcon = document.getElementById('modeIcon');
    const btnSaveBuilder = document.getElementById('btnSaveBuilder');
    const builderCanvas = document.getElementById('builderCanvas');
    const propertiesDrawer = document.getElementById('propertiesDrawer');
    const closePropertiesDrawer = document.getElementById('closePropertiesDrawer');
    const propContentRow = document.getElementById('propContentRow');
    const propTextInput = document.getElementById('propTextInput');
    const propFontSize = document.getElementById('propFontSize');
    const propFontSizeVal = document.getElementById('propFontSizeVal');
    const propFontWeight = document.getElementById('propFontWeight');
    const propTextAlign = document.getElementById('propTextAlign');
    const propTextColor = document.getElementById('propTextColor');
    const propBgColor = document.getElementById('propBgColor');
    const propBorderRadius = document.getElementById('propBorderRadius');
    const propBorderRadiusVal = document.getElementById('propBorderRadiusVal');
    const propOpacity = document.getElementById('propOpacity');
    const propOpacityVal = document.getElementById('propOpacityVal');
    const propCanvasHeight = document.getElementById('propCanvasHeight');
    const btnDeleteElement = document.getElementById('btnDeleteElement');

    let isEditMode = true;
    let selectedElement = null;
    let isDragging = false;
    let isResizing = false;
    let startX, startY, origLeft, origTop, origWidth, origHeight;
    let draggedElement = null;

    // Palette Swatches Setup
    const paletteColors = ['#38a0c4', '#0F4C75', '#1B262C', '#3282B8', '#BBE1FA', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    if (paletteHeaderSwatches) {
      paletteHeaderSwatches.innerHTML = '';
      paletteColors.forEach(hex => {
        const swatch = document.createElement('div');
        swatch.className = 'palette-swatch-item';
        swatch.style.background = hex;
        swatch.setAttribute('title', hex);
        swatch.addEventListener('click', (e) => {
          e.stopPropagation();
          if (selectedElement) {
            const target = selectedElement.querySelector('button, .element-shape-content, .element-card-content, .element-inner, .genui-bot-header') || selectedElement;
            target.style.background = hex;
            if (propBgColor) propBgColor.value = hex;
          } else if (builderCanvas) {
            builderCanvas.style.backgroundColor = hex;
          }
          if (paletteHeaderContainer) paletteHeaderContainer.classList.add('hidden');
        });
        paletteHeaderSwatches.appendChild(swatch);
      });
    }

    // Open Promotion Builder for Actor
    window.openPromotionBuilder = function (actorName) {
      if (typeof leafletMap !== 'undefined' && leafletMap) {
        leafletMap.closePopup();
      }
      const appRoot = document.getElementById('appRoot');
      if (appRoot) {
        appRoot.classList.add('hidden');
      }
      if (promotionBuilderContainer) {
        promotionBuilderContainer.classList.remove('hidden');
        if (builderAppTitle) {
          builderAppTitle.textContent = actorName || 'Halaman Promosi';
        }
        initPromotionCanvas(actorName);
      }
    };

    // Header Back to Map
    if (btnBackToMap) {
      btnBackToMap.addEventListener('click', (e) => {
        e.stopPropagation();
        if (promotionBuilderContainer) {
          promotionBuilderContainer.classList.add('hidden');
        }
        const appRoot = document.getElementById('appRoot');
        if (appRoot) {
          appRoot.classList.remove('hidden');
        }
        if (propertiesDrawer) {
          propertiesDrawer.classList.add('hidden');
        }
        deselectBuilderElement();
        setTimeout(() => {
          if (typeof leafletMap !== 'undefined' && leafletMap) {
            leafletMap.invalidateSize();
          }
        }, 60);
      });
    }

    // Header Toggle Mode (Edit vs Preview)
    if (btnToggleMode) {
      btnToggleMode.addEventListener('click', (e) => {
        e.stopPropagation();
        isEditMode = !isEditMode;
        if (isEditMode) {
          builderCanvas.classList.add('editing-active');
          if (modeIcon) modeIcon.src = '../static/image/icon/view.svg';
          document.getElementById('toolboxRow')?.classList.remove('hidden');
        } else {
          builderCanvas.classList.remove('editing-active');
          if (modeIcon) modeIcon.src = '../static/image/icon/edit_builder.svg';
          deselectBuilderElement();
          if (propertiesDrawer) propertiesDrawer.classList.add('hidden');
          document.getElementById('toolboxRow')?.classList.add('hidden');
        }
      });
    }

    // Header Palette Button
    if (btnPalette && paletteHeaderContainer) {
      btnPalette.addEventListener('click', (e) => {
        e.stopPropagation();
        paletteHeaderContainer.classList.toggle('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!paletteHeaderContainer.contains(e.target) && e.target !== btnPalette) {
          paletteHeaderContainer.classList.add('hidden');
        }
      });
    }

    // Header Layers Button
    if (btnToggleLayers) {
      btnToggleLayers.addEventListener('click', (e) => {
        e.stopPropagation();
        const totalElements = builderCanvas ? builderCanvas.querySelectorAll('.builder-element').length : 0;
        alert(`📂 Sistem Layer: Memuat ${totalElements} elemen visual pada canvas promosi.`);
      });
    }

    // Header UI Kit Button
    if (btnUIKit) {
      btnUIKit.addEventListener('click', (e) => {
        e.stopPropagation();
        const count = builderCanvas.querySelectorAll('.builder-element').length;
        const newTop = Math.min(60 + (count * 20), 400);
        createCanvasElement({
          type: 'card',
          text: '⭐ Paket Promo Spesial Mingguan',
          top: newTop,
          left: 16,
          width: 320,
          height: 90,
          bgColor: '#ffffff',
          color: '#0F4C75'
        });
      });
    }

    // Header Undo & Redo
    if (btnUndo) {
      btnUndo.addEventListener('click', (e) => {
        e.stopPropagation();
        const allElements = builderCanvas.querySelectorAll('.builder-element');
        if (allElements.length > 0) {
          allElements[allElements.length - 1].remove();
          deselectBuilderElement();
        }
      });
    }

    if (btnRedo) {
      btnRedo.addEventListener('click', (e) => {
        e.stopPropagation();
        createCanvasElement({
          type: 'text',
          text: 'Elemen dipulihkan kembali.',
          top: 150,
          left: 20,
          width: 280,
          height: 36
        });
      });
    }

    // Header Save Button
    if (btnSaveBuilder) {
      btnSaveBuilder.addEventListener('click', (e) => {
        e.stopPropagation();
        alert('✨ Desain Halaman Promosi & GenUI Chatbot berhasil disimpan ke cloud spasial!');
      });
    }

    // Initialize Canvas Starter Elements
    function initPromotionCanvas(actorName) {
      if (!builderCanvas) return;
      builderCanvas.innerHTML = '';

      // Starter Hero Title
      createCanvasElement({
        type: 'title',
        text: actorName || 'Sentra Retail & Karir 2211080',
        top: 20,
        left: 16,
        width: 320,
        height: 44,
        color: '#1e3a8a'
      });

      // Starter Subtitle / Description
      createCanvasElement({
        type: 'text',
        text: 'Pusat layanan karir, pemetaan spasial, dan distribusi ritel modern Balikpapan.',
        top: 70,
        left: 16,
        width: 320,
        height: 38,
        color: '#475569'
      });

      // Starter GenUI Chatbot Card
      createCanvasElement({
        type: 'genui_chatbot',
        top: 120,
        left: 16,
        width: 320,
        height: 220
      });

      // Starter CTA Button
      createCanvasElement({
        type: 'button',
        text: 'Hubungi Kami via WhatsApp',
        top: 360,
        left: 16,
        width: 320,
        height: 44,
        bgColor: '#25d366',
        color: '#ffffff'
      });
    }

    // Create New Element on Canvas
    function createCanvasElement(opts = {}) {
      if (!builderCanvas) return;
      const el = document.createElement('div');
      el.className = 'builder-element';
      el.style.top = (opts.top || 40) + 'px';
      el.style.left = (opts.left || 20) + 'px';
      el.style.width = (opts.width || 300) + 'px';
      el.style.height = (opts.height || 44) + 'px';
      el.dataset.type = opts.type || 'text';

      let innerHtml = '';
      if (opts.type === 'title') {
        innerHtml = `<div class="element-inner"><h2 class="element-title-content" style="color: ${opts.color || '#1e3a8a'}">${opts.text || 'Judul Baru'}</h2></div>`;
      } else if (opts.type === 'image') {
        innerHtml = `<div class="element-inner"><img src="${opts.imgUrl || '../static/image/icon/img-temp.svg'}" class="element-image-content" alt="Gambar Promosi" /></div>`;
      } else if (opts.type === 'button') {
        innerHtml = `<div class="element-inner"><button type="button" class="element-button-content" style="background: ${opts.bgColor || '#38a0c4'}; color: ${opts.color || '#ffffff'}">${opts.text || 'Klik Disini'}</button></div>`;
      } else if (opts.type === 'shape') {
        innerHtml = `<div class="element-inner"><div class="element-shape-content" style="background: ${opts.bgColor || '#e0f2fe'}"></div></div>`;
      } else if (opts.type === 'card') {
        innerHtml = `<div class="element-inner"><div class="element-card-content" style="background: ${opts.bgColor || '#ffffff'}; color: ${opts.color || '#334155'}"><strong>${opts.text || 'Card Konten'}</strong><p style="font-size: 11px; margin: 0; color: #64748b;">Rincian layanan dan penawaran aktif.</p></div></div>`;
      } else if (opts.type === 'container') {
        innerHtml = `<div class="element-inner"><div class="element-container-content">📦 Kontainer Elemen Visual</div></div>`;
      } else if (opts.type === 'column') {
        innerHtml = `<div class="element-inner"><div class="element-column-content"><div class="element-column-box">Kolom Kiri</div><div class="element-column-box">Kolom Kanan</div></div></div>`;
      } else if (opts.type === 'row') {
        innerHtml = `<div class="element-inner"><div class="element-column-content" style="grid-template-columns: 1fr 1fr 1fr;"><div class="element-column-box">Baris 1</div><div class="element-column-box">Baris 2</div><div class="element-column-box">Baris 3</div></div></div>`;
      } else if (opts.type === 'carousel') {
        innerHtml = `<div class="element-inner"><div class="element-carousel-content"><span style="font-size: 11px; font-weight: 700; color: #475569;">🎠 Image Carousel Slider</span></div></div>`;
      } else if (opts.type === 'media_embed') {
        innerHtml = `<div class="element-inner"><div class="element-card-content" style="background: #1e293b; color: #ffffff; justify-content: center; align-items: center;"><span style="font-size: 12px; font-weight: 700;">▶ Media Embed Player</span></div></div>`;
      } else if (opts.type === 'box-interaktif') {
        innerHtml = `<div class="element-inner"><div class="element-card-content" style="border: 1.5px solid #38a0c4;"><span style="font-size: 12px; font-weight: 700; color: #0369a1;">✨ Box Interaktif</span><p style="font-size: 10px; color: #64748b; margin: 0;">Komponen responsif dengan trigger aksi.</p></div></div>`;
      } else if (opts.type === 'genui_chatbot') {
        // Authentic GenUI Chatbot Card Widget
        innerHtml = `
          <div class="element-inner">
            <div class="element-genui-chatbot-card">
              <div class="genui-bot-header">
                <div class="genui-bot-info">
                  <div class="genui-bot-avatar">
                    <img src="../static/image/icon/elemen-genui-chatbot.svg" alt="Bot" style="width: 16px; height: 16px;" />
                  </div>
                  <div>
                    <div class="genui-bot-title-text">GenUI Assistant RAG</div>
                    <div class="genui-bot-status"><span class="genui-status-dot"></span> Online</div>
                  </div>
                </div>
              </div>
              <div class="genui-bot-body" id="genuiBody_${Date.now()}">
                <div class="genui-bubble genui-bubble-ai">
                  Halo! Ada yang bisa saya bantu terkait produk, promo, atau profil usaha ini?
                </div>
                <div class="genui-quick-chips">
                  <button type="button" class="genui-quick-chip" onclick="this.closest('.element-genui-chatbot-card').querySelector('.genui-input-field').value = this.innerText">Katalog Produk</button>
                  <button type="button" class="genui-quick-chip" onclick="this.closest('.element-genui-chatbot-card').querySelector('.genui-input-field').value = this.innerText">Promo Spesial</button>
                  <button type="button" class="genui-quick-chip" onclick="this.closest('.element-genui-chatbot-card').querySelector('.genui-input-field').value = this.innerText">Kontak Kami</button>
                </div>
              </div>
              <div class="genui-input-bar">
                <input type="text" class="genui-input-field" placeholder="Ketik pertanyaan RAG..." />
                <button type="button" class="genui-send-btn" title="Kirim Pesan">
                  <img src="../static/image/icon/send.svg" alt="Send" style="width: 12px; height: 12px;" />
                </button>
              </div>
            </div>
          </div>
        `;
      } else {
        innerHtml = `<div class="element-inner"><p class="element-text-content" style="color: ${opts.color || '#475569'}">${opts.text || 'Ketik paragraf atau deskripsi disini...'}</p></div>`;
      }

      el.innerHTML = innerHtml + '<div class="resize-handle"></div>';
      builderCanvas.appendChild(el);

      // Attach GenUI Chatbot Send behavior if present
      if (opts.type === 'genui_chatbot') {
        const sendBtn = el.querySelector('.genui-send-btn');
        const inputField = el.querySelector('.genui-input-field');
        const chatBody = el.querySelector('.genui-bot-body');
        if (sendBtn && inputField && chatBody) {
          const handleSend = () => {
            const val = inputField.value.trim();
            if (!val) return;
            // Append User Msg
            const uMsg = document.createElement('div');
            uMsg.className = 'genui-bubble genui-bubble-user';
            uMsg.textContent = val;
            chatBody.appendChild(uMsg);
            inputField.value = '';

            // Simulated AI Response
            setTimeout(() => {
              const bMsg = document.createElement('div');
              bMsg.className = 'genui-bubble genui-bubble-ai';
              bMsg.textContent = `Jawaban AI untuk: "${val}". Kami menyediakan solusi promosi terpadu di kawasan MT Haryono.`;
              chatBody.appendChild(bMsg);
              chatBody.scrollTop = chatBody.scrollHeight;
            }, 600);
          };

          sendBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleSend();
          });
          inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.stopPropagation();
              handleSend();
            }
          });
        }
      }

      attachElementEvents(el);
      selectBuilderElement(el);
      return el;
    }

    // Add Element via Global Function (from Toolbox chips)
    window.addBuilderElement = function (type, left = 20, top = 280) {
      if (!isEditMode) return;
      if (type === 'bg_settings') {
        // Open Canvas Background & Height settings
        deselectBuilderElement();
        if (propertiesDrawer) {
          propertiesDrawer.classList.remove('hidden');
          const title = document.getElementById('drawerTitle');
          if (title) title.textContent = 'Pengaturan Canvas / Latar';
          if (propContentRow) propContentRow.style.display = 'none';
        }
        return;
      }

      const count = builderCanvas.querySelectorAll('.builder-element').length;
      const newTop = Math.min(top + (count * 15), 450);
      let defaultWidth = 320;
      let defaultHeight = 44;

      if (type === 'genui_chatbot') {
        defaultWidth = 320;
        defaultHeight = 220;
      } else if (type === 'shape' || type === 'image' || type === 'carousel') {
        defaultWidth = 320;
        defaultHeight = 120;
      } else if (type === 'container' || type === 'column' || type === 'row' || type === 'card' || type === 'box-interaktif') {
        defaultWidth = 320;
        defaultHeight = 70;
      }

      createCanvasElement({
        type: type,
        top: newTop,
        left: left,
        width: defaultWidth,
        height: defaultHeight
      });
    };

    // Attach Drag and Drop & Resize listeners to an element
    function attachElementEvents(el) {
      el.addEventListener('mousedown', (e) => {
        if (!isEditMode) return;
        if (e.target.closest('.genui-input-bar') || e.target.closest('.genui-quick-chip')) {
          return; // Allow interacting with chatbot UI
        }

        if (e.target.classList.contains('resize-handle')) {
          // Start Resize
          isResizing = true;
          draggedElement = el;
          startX = e.clientX;
          startY = e.clientY;
          origWidth = parseInt(document.defaultView.getComputedStyle(el).width, 10);
          origHeight = parseInt(document.defaultView.getComputedStyle(el).height, 10);
          e.stopPropagation();
          return;
        }

        // Start Drag
        isDragging = true;
        draggedElement = el;
        selectBuilderElement(el);

        startX = e.clientX;
        startY = e.clientY;
        origLeft = parseInt(el.style.left, 10) || el.offsetLeft;
        origTop = parseInt(el.style.top, 10) || el.offsetTop;
        e.stopPropagation();
      });

      // Touch events for smartphone screen touch support
      el.addEventListener('touchstart', (e) => {
        if (!isEditMode) return;
        if (e.target.closest('.genui-input-bar') || e.target.closest('.genui-quick-chip')) {
          return;
        }
        const touch = e.touches[0];
        if (e.target.classList.contains('resize-handle')) {
          isResizing = true;
          draggedElement = el;
          startX = touch.clientX;
          startY = touch.clientY;
          origWidth = parseInt(document.defaultView.getComputedStyle(el).width, 10);
          origHeight = parseInt(document.defaultView.getComputedStyle(el).height, 10);
          e.stopPropagation();
          return;
        }

        isDragging = true;
        draggedElement = el;
        selectBuilderElement(el);
        startX = touch.clientX;
        startY = touch.clientY;
        origLeft = parseInt(el.style.left, 10) || el.offsetLeft;
        origTop = parseInt(el.style.top, 10) || el.offsetTop;
        e.stopPropagation();
      }, { passive: false });
    }

    // Global Canvas MouseMove & MouseUp
    document.addEventListener('mousemove', (e) => {
      if (isDragging && draggedElement) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const newLeft = Math.max(0, Math.min(origLeft + dx, 330));
        const newTop = Math.max(0, origTop + dy);
        draggedElement.style.left = newLeft + 'px';
        draggedElement.style.top = newTop + 'px';
      } else if (isResizing && draggedElement) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const newW = Math.max(60, origWidth + dx);
        const newH = Math.max(24, origHeight + dy);
        draggedElement.style.width = newW + 'px';
        draggedElement.style.height = newH + 'px';
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      isResizing = false;
      draggedElement = null;
    });

    document.addEventListener('touchmove', (e) => {
      if ((isDragging || isResizing) && draggedElement) {
        const touch = e.touches[0];
        if (isDragging) {
          const dx = touch.clientX - startX;
          const dy = touch.clientY - startY;
          draggedElement.style.left = Math.max(0, Math.min(origLeft + dx, 330)) + 'px';
          draggedElement.style.top = Math.max(0, origTop + dy) + 'px';
        } else if (isResizing) {
          const dx = touch.clientX - startX;
          const dy = touch.clientY - startY;
          draggedElement.style.width = Math.max(60, origWidth + dx) + 'px';
          draggedElement.style.height = Math.max(24, origHeight + dy) + 'px';
        }
        e.preventDefault();
      }
    }, { passive: false });

    document.addEventListener('touchend', () => {
      isDragging = false;
      isResizing = false;
      draggedElement = null;
    });

    // Select Element & Sync with Properties Drawer
    function selectBuilderElement(el) {
      deselectBuilderElement();
      selectedElement = el;
      el.classList.add('active-element');

      if (propertiesDrawer) {
        propertiesDrawer.classList.remove('hidden');
        const title = document.getElementById('drawerTitle');
        if (title) title.textContent = 'Pengaturan: ' + (el.dataset.type || 'Elemen').toUpperCase();
        if (propContentRow) propContentRow.style.display = 'flex';

        const textNode = el.querySelector('h2, p, button, strong');
        if (propTextInput && textNode) {
          propTextInput.value = textNode.textContent.trim();
        }

        // Sync font size
        if (textNode && propFontSize && propFontSizeVal) {
          const currentFs = parseInt(window.getComputedStyle(textNode).fontSize, 10) || 14;
          propFontSize.value = currentFs;
          propFontSizeVal.textContent = currentFs;
        }

        // Sync text color
        if (textNode && propTextColor) {
          const rgb = window.getComputedStyle(textNode).color;
          propTextColor.value = rgbToHex(rgb) || '#1e293b';
        }

        // Sync bg color
        const targetNode = el.querySelector('button, .element-shape-content, .element-card-content, .genui-bot-header') || el;
        if (targetNode && propBgColor) {
          const rgb = window.getComputedStyle(targetNode).backgroundColor;
          propBgColor.value = rgbToHex(rgb) || '#38a0c4';
        }
      }
    }

    function deselectBuilderElement() {
      if (selectedElement) {
        selectedElement.classList.remove('active-element');
        selectedElement = null;
      }
    }

    function rgbToHex(rgb) {
      if (!rgb || rgb === 'transparent') return '#ffffff';
      const m = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      if (!m) return '#1e293b';
      return '#' + ('0' + parseInt(m[1], 10).toString(16)).slice(-2) +
        ('0' + parseInt(m[2], 10).toString(16)).slice(-2) +
        ('0' + parseInt(m[3], 10).toString(16)).slice(-2);
    }

    // Toolbox Drag & Drop Support
    document.querySelectorAll('.toolbox-chip').forEach(chip => {
      chip.addEventListener('dragstart', (e) => {
        const type = chip.getAttribute('data-type');
        e.dataTransfer.setData('text/plain', type);
      });

      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = chip.getAttribute('data-type');
        window.addBuilderElement(type);
      });
    });

    if (builderCanvas) {
      builderCanvas.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      builderCanvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('text/plain');
        if (type) {
          const rect = builderCanvas.getBoundingClientRect();
          const dropX = Math.max(10, e.clientX - rect.left - 40);
          const dropY = Math.max(10, e.clientY - rect.top - 20);
          window.addBuilderElement(type, dropX, dropY);
        }
      });

      builderCanvas.addEventListener('click', (e) => {
        if (e.target === builderCanvas) {
          deselectBuilderElement();
          if (propertiesDrawer) {
            const title = document.getElementById('drawerTitle');
            if (title) title.textContent = 'Pengaturan Latar Belakang (Canvas)';
            if (propContentRow) propContentRow.style.display = 'none';
          }
        }
      });
    }

    // Properties Drawer Event Listeners
    if (closePropertiesDrawer) {
      closePropertiesDrawer.addEventListener('click', (e) => {
        e.stopPropagation();
        if (propertiesDrawer) propertiesDrawer.classList.add('hidden');
        deselectBuilderElement();
      });
    }

    if (propTextInput) {
      propTextInput.addEventListener('input', (e) => {
        if (!selectedElement) return;
        const textNode = selectedElement.querySelector('h2, p, button, strong');
        if (textNode) textNode.textContent = e.target.value;
      });
    }

    if (propFontSize) {
      propFontSize.addEventListener('input', (e) => {
        if (propFontSizeVal) propFontSizeVal.textContent = e.target.value;
        if (!selectedElement) return;
        const textNode = selectedElement.querySelector('h2, p, button, strong');
        if (textNode) textNode.style.fontSize = e.target.value + 'px';
      });
    }

    if (propFontWeight) {
      propFontWeight.addEventListener('change', (e) => {
        if (!selectedElement) return;
        const textNode = selectedElement.querySelector('h2, p, button, strong');
        if (textNode) textNode.style.fontWeight = e.target.value;
      });
    }

    if (propTextAlign) {
      propTextAlign.addEventListener('change', (e) => {
        if (!selectedElement) return;
        const textNode = selectedElement.querySelector('h2, p, button, strong') || selectedElement;
        textNode.style.textAlign = e.target.value;
      });
    }

    if (propTextColor) {
      propTextColor.addEventListener('input', (e) => {
        if (!selectedElement) return;
        const textNode = selectedElement.querySelector('h2, p, button, strong');
        if (textNode) textNode.style.color = e.target.value;
      });
    }

    if (propBgColor) {
      propBgColor.addEventListener('input', (e) => {
        if (selectedElement) {
          const targetNode = selectedElement.querySelector('button, .element-shape-content, .element-card-content, .genui-bot-header') || selectedElement;
          targetNode.style.background = e.target.value;
        } else if (builderCanvas) {
          builderCanvas.style.backgroundColor = e.target.value;
        }
      });
    }

    if (propBorderRadius) {
      propBorderRadius.addEventListener('input', (e) => {
        if (propBorderRadiusVal) propBorderRadiusVal.textContent = e.target.value;
        if (!selectedElement) return;
        const targetNode = selectedElement.querySelector('button, .element-shape-content, .element-card-content, .element-genui-chatbot-card') || selectedElement;
        targetNode.style.borderRadius = e.target.value + 'px';
      });
    }

    if (propOpacity) {
      propOpacity.addEventListener('input', (e) => {
        if (propOpacityVal) propOpacityVal.textContent = e.target.value;
        if (!selectedElement) return;
        selectedElement.style.opacity = e.target.value / 100;
      });
    }

    if (propCanvasHeight) {
      propCanvasHeight.addEventListener('input', (e) => {
        if (builderCanvas && e.target.value) {
          builderCanvas.style.minHeight = e.target.value + 'px';
        }
      });
    }

    if (btnDeleteElement) {
      btnDeleteElement.addEventListener('click', (e) => {
        e.stopPropagation();
        if (selectedElement) {
          selectedElement.remove();
          deselectBuilderElement();
          if (propertiesDrawer) propertiesDrawer.classList.add('hidden');
        }
      });
    }

    // ==========================================================================
    // 8. COLLAPSIBLE 3D PHONE CONTROLLER & 9 FEATURE TRIGGER HANDLER
    // ==========================================================================
    window.openPhoneWithFeature = function (featureKey, clickedEl) {
      const cardMap = {
        'usaha': 'card-usaha',
        'lokasi': 'card-lokasi',
        'campaign': 'card-campaign',
        'job_portal': 'card-job-portal',
        'chatbot': 'card-usaha',
        'ai_pin': 'card-ai-pin',
        'job_mode': 'card-job-mode',
        'view': 'card-view',
        'genui': 'card-genui'
      };

      const targetCardId = cardMap[featureKey];
      if (targetCardId) {
        const targetEl = document.getElementById(targetCardId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      // Handle Promotion Builder & GenUI Chatbot activation
      if (featureKey === 'campaign' || featureKey === 'view' || featureKey === 'genui') {
        window.openPromotionBuilder('Sentra Retail & Karir 2211080');
        if (featureKey === 'genui') {
          setTimeout(() => {
            const genuiEl = document.querySelector('.builder-element[data-type="genui_chatbot"]');
            if (genuiEl) {
              selectBuilderElement(genuiEl);
              genuiEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 150);
        }
        return;
      }

      // For GIS Features: Ensure Map Container (appRoot) is active
      if (promotionBuilderContainer) {
        promotionBuilderContainer.classList.add('hidden');
      }
      const appRoot = document.getElementById('appRoot');
      if (appRoot) {
        appRoot.classList.remove('hidden');
      }

      setTimeout(() => {
        if (leafletMap) {
          leafletMap.invalidateSize();
        }
      }, 100);

      if (featureKey === 'usaha') {
        if (switchIcons && switchIcons.length > 0) {
          switchIcons.forEach(i => i.classList.remove('active'));
          switchIcons[0].classList.add('active');
        }
        if (actorUsaha) actorUsaha.classList.remove('hidden');
        if (actorLokasi) actorLokasi.classList.add('hidden');
        const overlay = document.getElementById('chatbotOverlay');
        if (overlay) overlay.classList.add('hidden');

        const hubMarker = markerMap['PT Sentra Spatial Hub'] || markerMap['Sentra Retail & Karir 2211080'];
        if (hubMarker && leafletMap) {
          leafletMap.setView(hubMarker.getLatLng(), 15);
          hubMarker.openPopup();
        }
      } else if (featureKey === 'lokasi') {
        if (switchIcons && switchIcons.length > 1) {
          switchIcons.forEach(i => i.classList.remove('active'));
          switchIcons[1].classList.add('active');
        }
        if (actorLokasi) actorLokasi.classList.remove('hidden');
        if (actorUsaha) actorUsaha.classList.add('hidden');
        const overlay = document.getElementById('chatbotOverlay');
        if (overlay) overlay.classList.add('hidden');
        if (editLokasiOverlay) editLokasiOverlay.classList.remove('hidden');
      } else if (featureKey === 'job_portal') {
        const overlay = document.getElementById('chatbotOverlay');
        if (overlay) overlay.classList.add('hidden');
        const retailMarker = markerMap['Sentra Retail & Karir 2211080'];
        if (retailMarker && leafletMap) {
          leafletMap.setView(retailMarker.getLatLng(), 15);
          retailMarker.openPopup();
        }
      } else if (featureKey === 'chatbot') {
        const overlay = document.getElementById('chatbotOverlay');
        if (overlay) overlay.classList.remove('hidden');
        const subMenu = document.getElementById('jobCreationSubMenu');
        if (subMenu) subMenu.classList.add('hidden');
      } else if (featureKey === 'ai_pin') {
        window.startTargetingMode();
      } else if (featureKey === 'job_mode') {
        const overlay = document.getElementById('chatbotOverlay');
        if (overlay) overlay.classList.remove('hidden');
        const subMenu = document.getElementById('jobCreationSubMenu');
        const toggleBtn = document.getElementById('mainJcToggle');
        if (subMenu) subMenu.classList.remove('hidden');
        if (toggleBtn) toggleBtn.classList.add('active');
      } else if (featureKey === 'view') {
        const overlay = document.getElementById('chatbotOverlay');
        if (overlay) overlay.classList.add('hidden');
        if (leafletMap) {
          leafletMap.closePopup();
          leafletMap.setView([-1.242, 116.860], 13);
        }
      }
    };

    window.closePhoneSimulator = function () {
      const phoneSection = document.getElementById('phoneShowcaseSection');
      if (phoneSection) {
        phoneSection.classList.add('hidden');
      }
      document.querySelectorAll('.feature-wide-card').forEach(item => {
        item.classList.remove('active');
        const pill = item.querySelector('.toggle-text');
        if (pill) pill.textContent = 'Buka di HP';
      });
      const fiturSection = document.getElementById('fitur');
      if (fiturSection) {
        fiturSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
  }

  // 3. Initialize Draw Lokasi Spatial GIS & Autoplay Simulation Loop
  function initDrawLokasiSpatialGIS() {
    const mapContainer = document.getElementById('mapLokasi');
    if (!mapContainer || typeof L === 'undefined') return;

    const initialCoords = [-1.243, 116.862];
    const initialZoom = 14;

    const leafletMapLokasi = L.map('mapLokasi', {
      zoomControl: false,
      attributionControl: false
    }).setView(initialCoords, initialZoom);

    const streetTileLokasi = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(leafletMapLokasi);

    const zoomInLokasi = document.getElementById('zoomInLokasi');
    const zoomOutLokasi = document.getElementById('zoomOutLokasi');
    if (zoomInLokasi) zoomInLokasi.addEventListener('click', (e) => { e.stopPropagation(); leafletMapLokasi.zoomIn(); });
    if (zoomOutLokasi) zoomOutLokasi.addEventListener('click', (e) => { e.stopPropagation(); leafletMapLokasi.zoomOut(); });

    // 2 Polygons on Map:
    // Polygon 1: "Poligon RT 48"
    const coordsRT48 = [
      [-1.2415, 116.8580],
      [-1.2385, 116.8635],
      [-1.2440, 116.8680],
      [-1.2475, 116.8615]
    ];

    // Polygon 2: "Kawasan Industri Terpadu"
    const coordsKawasan = [
      [-1.2320, 116.8640],
      [-1.2290, 116.8705],
      [-1.2350, 116.8745],
      [-1.2380, 116.8675]
    ];

    const polyKawasan = L.polygon(coordsKawasan, {
      color: '#10B981',
      fillColor: '#10B981',
      fillOpacity: 0.35,
      weight: 2.5
    }).addTo(leafletMapLokasi);

    polyKawasan.bindPopup(`
      <div class="actor-popup">
        <div class="actor-popup-header">Lokasi</div>
        <div class="actor-popup-content">
          <div class="actor-popup-visual-wrapper">
            <img src="../static/image/icon/img-temp.svg" class="actor-popup-visual" alt="Foto Visual" />
          </div>
          <div class="actor-popup-name">Kawasan Industri Terpadu</div>
          <div class="actor-location-wrapper">
            <div class="actor-address">Zonasi Pergudangan & Industri Logistik</div>
            <div class="actor-coord">-1.23350, 116.86900</div>
          </div>
        </div>
      </div>
    `, { maxWidth: 420, className: 'custom-actor-leaflet-popup' });

    function buildRT48PopupHTML(hasAttachedNotes = false) {
      let sideHtml = '';
      if (hasAttachedNotes) {
        sideHtml = `
          <button type="button" class="lokasi-attached-notes-btn" id="btnLokasiAttachedNotes2" onclick="window.toggleNotesSideCard(this, event)" title="Lihat Catatan Rumah Pak Bayu">
            <img src="../static/image/icon/pin-map.svg" class="attached-btn-icon" alt="Notes" />
          </button>
          <div class="actor-notes-side-card" id="actorNotesSideCardLokasi2" onclick="event.stopPropagation()">
            <div class="notes-side-header">
              <span class="notes-side-title">Rincian Catatan Lokasi</span>
              <span class="notes-side-close" onclick="window.closeNotesSideCard(event)" title="Tutup">
                <img src="../static/image/icon/close.svg" alt="Tutup" style="width: 12px; height: 12px;" />
              </span>
            </div>
            <div class="notes-side-body">
              <div class="notes-type-badge lokasi active-note-title" style="margin-bottom: 6px; font-weight: 700; color: #0f4c75; display: flex; align-items: center; gap: 6px;">
                <img src="../static/image/icon/pin-map.svg" class="notes-badge-icon" style="width: 18px; height: 18px;" alt="" /> Rumah Pak Bayu
              </div>
              <div class="notes-side-text active-note-text" style="font-size: 11.5px; color: #334155; margin-bottom: 8px; line-height: 1.4;">
                Verifikasi Lokasi & Data Hunian Rumah Pak Bayu RT 48
              </div>
              <div class="notes-img-container active-note-img-wrap">
                <img src="img/rumah-bayu.svg" class="notes-overview-photo active-note-img" style="width: 100%; border-radius: 8px; border: 1px solid #cbd5e1; display: block;" alt="Rumah Pak Bayu" />
              </div>
            </div>
          </div>
        `;
      }

      return `
        <div class="actor-popup" id="actorPopupRT48">
          <div class="actor-popup-header">Poligon RT 48</div>
          <div class="actor-popup-content">
            <div class="actor-popup-visual-wrapper">
              <img src="img/tempat.svg" class="actor-popup-visual" alt="Foto Profil Lokasi" />
            </div>
            <div class="actor-location-wrapper">
              <div class="actor-address">Kawasan Pemukiman & Tata Ruang Warga RT 48</div>
              <div class="actor-coord">-1.24350, 116.86300</div>
            </div>
          </div>
          <div class="actor-popup-actions">
            <button class="actor-btn edit-actor" id="btnEditLokasiPopup2" title="Edit">
              <img src="../static/image/icon/edit.svg" class="emoji-img" alt="Edit" />
            </button>
          </div>
          ${sideHtml}
        </div>
      `;
    }

    const polyRT48 = L.polygon(coordsRT48, {
      color: '#38a0c4',
      fillColor: '#38a0c4',
      fillOpacity: 0.35,
      weight: 2.5
    }).addTo(leafletMapLokasi);

    polyRT48.bindPopup(buildRT48PopupHTML(false), {
      maxWidth: 420,
      className: 'custom-actor-leaflet-popup'
    });

    const chatbotBtnLokasi = document.getElementById('chatbotBtnLokasi');
    const chatbotOverlayLokasi = document.getElementById('chatbotOverlayLokasi');
    const closeChatbotBtnLokasi = document.getElementById('closeChatbotBtnLokasi');

    if (chatbotBtnLokasi && chatbotOverlayLokasi) {
      chatbotBtnLokasi.addEventListener('click', (e) => {
        e.stopPropagation();
        chatbotOverlayLokasi.classList.toggle('hidden');
      });
    }

    if (closeChatbotBtnLokasi && chatbotOverlayLokasi) {
      closeChatbotBtnLokasi.addEventListener('click', (e) => {
        e.stopPropagation();
        chatbotOverlayLokasi.classList.add('hidden');
      });
    }

    // ==========================================================================
    // AUTOPLAY SIMULATION LOOP CONTROLLER FOR DRAW LOKASI
    // "klik switch actor lokasi -> disitu ada 2 poligon -> klik salah satunya (Poligon RT 48) -> popup informasi profil tempat.svg -> klik edit card -> isi nama catatan 'Rumah Pak Bayu', foto rumah-bayu.svg, catatan -> simpan -> klik lagi popup -> klik side popup -> lihat gambar berhasil ditambahkan -> looping"
    // ==========================================================================
    function initDrawLokasiAutoplayLoop() {
      const appRoot = document.getElementById('appRootLokasi');
      const pointer = document.getElementById('simulatedPointerLokasi');
      const switchLokasi = appRoot ? appRoot.querySelector('.actor-switch img[data-target="aktorLokasi2"]') : null;
      const switchUsaha = appRoot ? appRoot.querySelector('.actor-switch img[data-target="aktorUsaha2"]') : null;
      const aktorUsahaBtn = document.getElementById('aktorUsaha2');
      const aktorLokasiBtn = document.getElementById('aktorLokasi2');

      const editOverlay = document.getElementById('editLokasiOverlay2');
      const nameInput = document.getElementById('inputLokasiNotesNameUser2');
      const uploadWrapper = document.getElementById('uploadWrapperLokasi2');
      const previewBox = document.getElementById('previewLokasi2');
      const textInput = document.getElementById('inputLokasiNotesTextUser2');
      const saveBtn = document.getElementById('btnSaveLokasi2');

      if (!appRoot || !pointer || !leafletMapLokasi) return;

      let isAutoplayRunning = true;
      const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      function movePointerTo(targetX, targetY, duration = 800) {
        return new Promise(resolve => {
          pointer.style.transition = `top ${duration}ms cubic-bezier(0.25, 1, 0.5, 1), left ${duration}ms cubic-bezier(0.25, 1, 0.5, 1), transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)`;
          pointer.style.left = `${targetX}px`;
          pointer.style.top = `${targetY}px`;
          setTimeout(resolve, duration);
        });
      }

      function movePointerToElement(el, duration = 800) {
        if (!el) return Promise.resolve();
        const appRect = appRoot.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const targetX = elRect.left - appRect.left + (elRect.width / 2);
        const targetY = elRect.top - appRect.top + (elRect.height / 2);
        return movePointerTo(targetX, targetY, duration);
      }

      function movePointerToLatLng(latLng, duration = 800) {
        const point = leafletMapLokasi.latLngToContainerPoint(latLng);
        const mapEl = document.getElementById('mapLokasi');
        const appRect = appRoot.getBoundingClientRect();
        const mapRect = mapEl.getBoundingClientRect();
        const targetX = (mapRect.left - appRect.left) + point.x;
        const targetY = (mapRect.top - appRect.top) + point.y;
        return movePointerTo(targetX, targetY, duration);
      }

      async function simulateClick(holdMs = 250) {
        pointer.classList.add('clicking');
        await wait(holdMs);
        pointer.classList.remove('clicking');
        await wait(100);
      }

      async function simulateType(inputEl, text, speed = 35) {
        if (!inputEl) return;
        inputEl.value = '';
        for (let i = 0; i < text.length; i++) {
          inputEl.value += text[i];
          await wait(speed);
        }
      }

      async function runSimulationCycle() {
        while (isAutoplayRunning) {
          // 0. RESET STATE
          leafletMapLokasi.closePopup();
          if (editOverlay) {
            editOverlay.classList.remove('active');
            editOverlay.style.display = 'none';
          }
          if (nameInput) nameInput.value = '';
          if (textInput) textInput.value = '';
          if (uploadWrapper) uploadWrapper.classList.remove('highlight');
          if (previewBox) {
            previewBox.style.display = 'none';
            const img = previewBox.querySelector('img');
            if (img) img.src = '';
          }
          if (saveBtn) saveBtn.classList.remove('active-click');

          // Reset switch to usaha initially
          if (switchUsaha && switchLokasi) {
            switchLokasi.classList.remove('active');
            switchUsaha.classList.add('active');
          }
          if (aktorUsahaBtn && aktorLokasiBtn) {
            aktorUsahaBtn.classList.remove('hidden');
            aktorLokasiBtn.classList.add('hidden');
          }

          // Reset polygon popup to initial without attached notes
          polyRT48.setPopupContent(buildRT48PopupHTML(false));

          leafletMapLokasi.setView(initialCoords, initialZoom, { animate: false });

          // Start pointer at center
          await movePointerTo(165, 300, 400);
          await wait(800);

          // 1. KLIK SWITCH ACTOR LOKASI (ico-show-lokasi.svg)
          if (switchLokasi) {
            await movePointerToElement(switchLokasi, 850);
            await simulateClick();
            if (switchUsaha) switchUsaha.classList.remove('active');
            switchLokasi.classList.add('active');
            if (aktorUsahaBtn) aktorUsahaBtn.classList.add('hidden');
            if (aktorLokasiBtn) {
              aktorLokasiBtn.classList.remove('hidden');
              aktorLokasiBtn.classList.add('active');
            }
          }
          await wait(800);

          // 2. DISITU ADA 2 POLIGON (Poligon RT 48 & Kawasan Industri) -> KLIK POLIGON RT 48
          const targetPolyCenter = L.latLng(-1.2435, 116.8630);
          leafletMapLokasi.panTo(targetPolyCenter, { animate: true, duration: 0.8 });
          await wait(800);

          await movePointerToLatLng(targetPolyCenter, 750);
          await simulateClick();

          // 3. MUNCUL POPUP INFORMASI DENGAN PROFIL PAKE tempat.svg
          polyRT48.openPopup();
          await wait(1200);

          // 4. KLIK EDIT CARD DARI POPUP
          const editBtnOnPopup = document.getElementById('btnEditLokasiPopup2') || document.querySelector('#mapLokasi .edit-actor');
          if (editBtnOnPopup) {
            await movePointerToElement(editBtnOnPopup, 700);
            await simulateClick();
          }

          // 5. BUKA EDIT CARD UNTUK MENAMBAHKAN CATATAN DAN FOTO
          leafletMapLokasi.closePopup();
          if (editOverlay) {
            editOverlay.classList.add('active');
            editOverlay.style.display = 'flex';
          }
          await wait(400);

          // Isi Nama Catatan: "Rumah Pak Bayu"
          if (nameInput) {
            await movePointerToElement(nameInput, 500);
            await simulateClick(150);
            await simulateType(nameInput, 'Rumah Pak Bayu', 35);
          }
          await wait(300);

          // Upload Foto Visual (rumah-bayu.svg) -> Reveal Preview
          if (uploadWrapper) {
            await movePointerToElement(uploadWrapper, 600);
            await simulateClick();
            uploadWrapper.classList.add('highlight');
            if (previewBox) {
              const img = previewBox.querySelector('img');
              if (img) img.src = 'img/rumah-bayu.svg';
              previewBox.style.display = 'block';
            }
          }
          await wait(600);

          // Isi Deskripsi / Catatan Tambahan
          if (textInput) {
            await movePointerToElement(textInput, 500);
            await simulateClick(150);
            await simulateType(textInput, 'Verifikasi Lokasi & Data Hunian Rumah Pak Bayu RT 48', 25);
          }
          await wait(400);

          // 6. SIMPAN DATA EDIT CARD
          if (saveBtn) {
            await movePointerToElement(saveBtn, 600);
            await simulateClick();
            saveBtn.classList.add('active-click');
          }
          await wait(400);

          if (editOverlay) {
            editOverlay.classList.remove('active');
            editOverlay.style.display = 'none';
          }
          if (saveBtn) saveBtn.classList.remove('active-click');

          // Update popup content with attached side notes button
          polyRT48.setPopupContent(buildRT48PopupHTML(true));
          await wait(500);

          // 7. KLIK LAGI POPUP POLIGON RT 48
          await movePointerToLatLng(targetPolyCenter, 700);
          await simulateClick();
          polyRT48.openPopup();
          await wait(900);

          // 8. KLIK SIDE POPUP BUTTON (lokasi-attached-notes-btn)
          const sideBtn = document.getElementById('btnLokasiAttachedNotes2') || document.querySelector('#mapLokasi .lokasi-attached-notes-btn');
          if (sideBtn) {
            await movePointerToElement(sideBtn, 700);
            await simulateClick();
          }

          // Open the side card
          const sideCard = document.getElementById('actorNotesSideCardLokasi2') || document.querySelector('#mapLokasi .actor-notes-side-card');
          if (sideCard) {
            sideCard.classList.add('active');
            sideCard.style.display = 'block';
          }
          await wait(500);

          // 9. SIMULASI GESTUR GESER PETA (DRAG / SWIPE PAN) UNTUK MELIHAT SIDE POPUP SECARA JELAS
          await movePointerTo(230, 260, 450);
          pointer.classList.add('clicking');
          await wait(150);

          // Geser peta Leaflet ke kiri agar side popup card berada di tengah layar
          leafletMapLokasi.panBy([130, 0], { animate: true, duration: 0.8 });
          await movePointerTo(85, 260, 800);
          pointer.classList.remove('clicking');
          await wait(350);

          // 10. POINTER MENUNJUKKAN GAMBAR DAN DATA YANG BERHASIL DITAMBAHKAN PADA SIDE CARD
          if (sideCard) {
            await movePointerToElement(sideCard, 650);
          } else {
            await movePointerTo(180, 220, 600);
          }

          // 11. LIHAT GAMBAR DAN DATA YANG BERHASIL DITAMBAHKAN (Hold for 6s)
          await wait(6000);

          // 12. CLEAN RESET & LOOP
          if (sideCard) {
            sideCard.classList.remove('active');
            sideCard.style.display = 'none';
          }
          await wait(1000);
        }
      }

      // Start autoplay cycle automatically
      setTimeout(() => {
        runSimulationCycle();
      }, 900);
    }

    initDrawLokasiAutoplayLoop();
  }

  // 4. Initialize Campaign Spatial GIS & Autoplay Simulation Loop
  function initCampaignSpatialGIS() {
    const mapContainer = document.getElementById('mapCampaign');
    if (!mapContainer || typeof L === 'undefined') return;

    const initialCoords = [-1.242, 116.860];
    const initialZoom = 14;

    const leafletMapCampaign = L.map('mapCampaign', {
      zoomControl: false,
      attributionControl: false
    }).setView(initialCoords, initialZoom);

    const streetTileCampaign = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(leafletMapCampaign);

    const zoomInCampaign = document.getElementById('zoomInCampaign');
    const zoomOutCampaign = document.getElementById('zoomOutCampaign');
    if (zoomInCampaign) zoomInCampaign.addEventListener('click', (e) => { e.stopPropagation(); leafletMapCampaign.zoomIn(); });
    if (zoomOutCampaign) zoomOutCampaign.addEventListener('click', (e) => { e.stopPropagation(); leafletMapCampaign.zoomOut(); });

    function createActorIcon(iconUrl) {
      return L.icon({
        iconUrl: iconUrl,
        iconSize: [46, 46],
        iconAnchor: [23, 23],
        popupAnchor: [0, -23]
      });
    }

    // Showroom Nusantara Motor Sport Balikpapan (Featured Actor with Campaign Side Card)
    const motorData = {
      name: 'Showroom Nusantara Motor Sport',
      type: 'Usaha',
      iconUrl: '../static/image/actor/usaha.svg',
      address: 'Jl. MT Haryono No. 12, Damai Baru',
      lat: -1.2405,
      lng: 116.8580
    };

    const motorPopupHTML = `
      <div class="actor-popup" id="actorPopupMotor">
        <div class="actor-popup-header">Showroom Nusantara Motor Sport</div>
        <div class="actor-popup-content">
          <div class="actor-popup-visual-wrapper">
            <img src="img/showroom.svg" class="actor-popup-visual" alt="Showroom Nusantara Motor" />
          </div>
          <div class="actor-location-wrapper">
            <div class="actor-address">Jl. MT Haryono No. 12, Damai Baru</div>
            <div class="actor-coord">-1.24050, 116.85800</div>
          </div>
        </div>
        <div class="actor-popup-actions">
          <button class="actor-btn view-actor" id="btnViewActorMotor" title="Lihat Halaman Promosi">
            <img src="../static/image/icon/view.svg" class="emoji-img" alt="Lihat" />
          </button>
        </div>
        <button type="button" class="usaha-attached-notes-btn" id="btnMotorAttachedCampaign" onclick="window.toggleNotesSideCard(this, event)" title="Buka Promo & Kampanye">
          <img src="../static/image/icon/campaign.svg" class="attached-btn-icon" alt="Side" />
        </button>
        <div class="actor-notes-side-card" id="actorNotesSideCardCampaign" onclick="event.stopPropagation()">
          <div class="notes-side-header">
            <span class="notes-side-title">Rincian Aktivitas</span>
            <span class="notes-side-close" onclick="window.closeNotesSideCard(event)" title="Tutup">
              <img src="../static/image/icon/close.svg" alt="Tutup" style="width: 12px; height: 12px;" />
            </span>
          </div>
          <div class="notes-side-body">
            <div class="notes-type-badge kampanye" style="display: flex; align-items: center; gap: 6px; font-weight: 700;">
              <img src="../static/image/icon/campaign.svg" class="notes-badge-icon" style="width: 16px; height: 16px;" alt="" />
              <span>Promo & Kampanye</span>
            </div>
            <div class="notes-side-text" style="font-size: 11.5px; color: #1e293b; margin-top: 4px; line-height: 1.4;">
              <strong>Spesial Seri Yamaha Jupiter MX & Jupiter Z</strong>
              <div style="color: #64748b; font-size: 10.5px; margin-top: 2px;">Unit ready Jupiter MX King 150, MX 135, Jupiter Z1, & Z Burhan. DP mulai 300rb + gratis servis oli 1 tahun.</div>
            </div>
            <button type="button" class="notes-side-cta-btn promo" id="btnCtaPromoCampaign" style="margin-top: 6px;">
              <img src="../static/image/icon/view.svg" class="notes-cta-icon" alt="" /> Lihat Halaman Promosi
            </button>
          </div>
        </div>
      </div>
    `;

    const motorMarker = L.marker([motorData.lat, motorData.lng], {
      icon: createActorIcon(motorData.iconUrl)
    }).addTo(leafletMapCampaign);

    motorMarker.bindPopup(motorPopupHTML, {
      maxWidth: 420,
      className: 'custom-actor-leaflet-popup'
    });

    // Background Actor: Sentra Motor & Sparepart
    const bouquetMarker = L.marker([-1.2465, 116.8650], {
      icon: createActorIcon('../static/image/actor/usaha.svg')
    }).addTo(leafletMapCampaign);

    bouquetMarker.bindPopup(`
      <div class="actor-popup">
        <div class="actor-popup-header">Usaha</div>
        <div class="actor-popup-content">
          <div class="actor-popup-visual-wrapper">
            <img src="img/sentra.svg" class="actor-popup-visual" alt="Sentra Motor" />
          </div>
          <div class="actor-popup-name">Sentra Aksesoris & Servis Motor</div>
          <div class="actor-location-wrapper">
            <div class="actor-address">Jl. MT Haryono No. 88</div>
            <div class="actor-coord">-1.24650, 116.86500</div>
          </div>
        </div>
      </div>
    `, { maxWidth: 420, className: 'custom-actor-leaflet-popup' });

    // Actor Switcher in Campaign Card
    const appRootCampaignEl = document.getElementById('appRootCampaign');
    const switchIconsCampaign = appRootCampaignEl ? appRootCampaignEl.querySelectorAll('.actor-switch img') : [];
    const actorUsaha3 = document.getElementById('aktorUsaha3');
    const actorLokasi3 = document.getElementById('aktorLokasi3');

    switchIconsCampaign.forEach(icon => {
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = icon.getAttribute('data-target');
        switchIconsCampaign.forEach(i => i.classList.remove('active'));
        icon.classList.add('active');

        if (targetId === 'aktorUsaha3') {
          if (actorUsaha3) actorUsaha3.classList.remove('hidden');
          if (actorLokasi3) actorLokasi3.classList.add('hidden');
        } else {
          if (actorLokasi3) actorLokasi3.classList.remove('hidden');
          if (actorUsaha3) actorUsaha3.classList.add('hidden');
        }
      });
    });

    const chatbotBtnEl = document.getElementById('chatbotBtnCampaign');
    const chatbotOverlayEl = document.getElementById('chatbotOverlayCampaign');
    const closeChatbotBtnEl = document.getElementById('closeChatbotBtnCampaign');

    if (chatbotBtnEl && chatbotOverlayEl) {
      chatbotBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        chatbotOverlayEl.classList.toggle('hidden');
      });
    }

    if (closeChatbotBtnEl && chatbotOverlayEl) {
      closeChatbotBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        chatbotOverlayEl.classList.add('hidden');
      });
    }

    // ==========================================================================
    // AUTOPLAY SIMULATION LOOP CONTROLLER FOR CAMPAIGN (YAMAHA JUPITER MX & JUPITER Z)
    // "buka spasial chatbot -> ketik 'Cari motor bebek Yamaha Jupiter MX atau Jupiter Z bekas surat lengkap murah' -> output ai softselling aeo -> klik menuju kepopupnya -> klik side popup untuk cta menuju halaman promosi -> dihalaman promosi ada informasi diskon motor jupiter mx & z dll -> looping"
    // ==========================================================================
    function initCampaignAutoplayLoop() {
      const appRoot = document.getElementById('appRootCampaign');
      const pointer = document.getElementById('simulatedPointerCampaign');
      const chatbotBtn = document.getElementById('chatbotBtnCampaign');
      const chatbotOverlay = document.getElementById('chatbotOverlayCampaign');
      const chatMessages = document.getElementById('chatMessagesCampaign');
      const chatInput = document.getElementById('chatInputCampaign');
      const sendChatBtn = document.getElementById('sendChatBtnCampaign');
      const promoPageContainer = document.getElementById('promotionBuilderContainerCampaign');
      const btnBackToMap = document.getElementById('btnBackToMapCampaign');

      if (!appRoot || !pointer || !leafletMapCampaign) return;

      if (btnBackToMap && promoPageContainer) {
        btnBackToMap.addEventListener('click', () => {
          promoPageContainer.classList.add('hidden');
        });
      }

      let isAutoplayRunning = true;
      const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      function movePointerTo(targetX, targetY, duration = 800) {
        return new Promise(resolve => {
          pointer.style.transition = `top ${duration}ms cubic-bezier(0.25, 1, 0.5, 1), left ${duration}ms cubic-bezier(0.25, 1, 0.5, 1), transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)`;
          pointer.style.left = `${targetX}px`;
          pointer.style.top = `${targetY}px`;
          setTimeout(resolve, duration);
        });
      }

      function movePointerToElement(el, duration = 800) {
        if (!el) return Promise.resolve();
        const appRect = appRoot.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const targetX = elRect.left - appRect.left + (elRect.width / 2);
        const targetY = elRect.top - appRect.top + (elRect.height / 2);
        return movePointerTo(targetX, targetY, duration);
      }

      function movePointerToLatLng(latLng, duration = 800) {
        const point = leafletMapCampaign.latLngToContainerPoint(latLng);
        const mapEl = document.getElementById('mapCampaign');
        const appRect = appRoot.getBoundingClientRect();
        const mapRect = mapEl.getBoundingClientRect();
        const targetX = (mapRect.left - appRect.left) + point.x;
        const targetY = (mapRect.top - appRect.top) + point.y;
        return movePointerTo(targetX, targetY, duration);
      }

      async function simulateClick(holdMs = 250) {
        pointer.classList.add('clicking');
        await wait(holdMs);
        pointer.classList.remove('clicking');
        await wait(100);
      }

      async function simulateType(inputEl, text, speed = 35) {
        if (!inputEl) return;
        inputEl.value = '';
        for (let i = 0; i < text.length; i++) {
          inputEl.value += text[i];
          await wait(speed);
        }
      }

      async function runSimulationCycle() {
        while (isAutoplayRunning) {
          // 0. RESET STATE
          leafletMapCampaign.closePopup();
          if (chatbotOverlay) chatbotOverlay.classList.add('hidden');
          if (promoPageContainer) promoPageContainer.classList.add('hidden');
          if (chatInput) chatInput.value = '';
          if (chatMessages) {
            chatMessages.innerHTML = `
              <div class="message bot">
                <div class="bubble">Halo! Sedang mencari Yamaha Jupiter MX, Jupiter Z, atau promo cuci gudang motor bebek di Balikpapan?</div>
              </div>
            `;
          }

          leafletMapCampaign.setView(initialCoords, initialZoom, { animate: false });

          // Start pointer at center
          await movePointerTo(165, 300, 400);
          await wait(800);

          // 1. BUKA SPASIAL CHATBOT (Klik icon Chatbot di peta)
          if (chatbotBtn) {
            await movePointerToElement(chatbotBtn, 800);
            await simulateClick();
            if (chatbotOverlay) chatbotOverlay.classList.remove('hidden');
          }
          await wait(600);

          // 2. KETIK PROMPT: "Cari motor bebek Yamaha Jupiter MX atau Jupiter Z bekas surat lengkap murah"
          if (chatInput) {
            await movePointerToElement(chatInput, 600);
            await simulateClick(150);
            await simulateType(chatInput, 'Cari motor bebek Yamaha Jupiter MX atau Jupiter Z bekas surat lengkap murah', 28);
          }
          await wait(300);

          // Klik Tombol Kirim Chat
          if (sendChatBtn) {
            await movePointerToElement(sendChatBtn, 500);
            await simulateClick();
          }

          // 3. TAMBAHKAN PESAN USER & OUTPUT AI DENGAN SOFTELLING AEO BERDASARKAN PROMO YAMAHA JUPITER SERIES
          if (chatMessages) {
            const userMsg = document.createElement('div');
            userMsg.className = 'message user';
            userMsg.innerHTML = '<div class="bubble">Cari motor bebek Yamaha Jupiter MX atau Jupiter Z bekas surat lengkap murah</div>';
            chatMessages.appendChild(userMsg);
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;

            await wait(700);

            const botMsg = document.createElement('div');
            botMsg.className = 'message bot';
            botMsg.innerHTML = `
              <div class="bubble">
                Tentu! Berdasarkan database unit motor dan promo aktif di Balikpapan, Anda dapat mengunjungi <span class="actor-link" id="btnGotoMotorCampaign"><strong>Showroom Nusantara Motor Sport</strong></span> yang saat ini sedang mengadakan <strong>Promo Spesial Seri Yamaha Jupiter MX & Jupiter Z</strong> dengan DP mulai 300rb, surat BPKB/STNK lengkap, & garansi mesin 1 tahun.
              </div>
            `;
            chatMessages.appendChild(botMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            botMsg.querySelector('#btnGotoMotorCampaign')?.addEventListener('click', () => {
              if (chatbotOverlay) chatbotOverlay.classList.add('hidden');
              leafletMapCampaign.setView([-1.2405, 116.8580], 15);
              motorMarker.openPopup();
            });
          }
          await wait(900);

          // 4. KLIK TEKS LINK AEO MENUJU KE POPUP MARKER
          const gotoBtn = document.getElementById('btnGotoMotorCampaign');
          if (gotoBtn) {
            await movePointerToElement(gotoBtn, 700);
            await simulateClick();
          }
          if (chatbotOverlay) chatbotOverlay.classList.add('hidden');
          await wait(400);

          // 5. MAP BERGESER KE TITIK NUSANTARA MOTOR & POPUP TERBUKA
          const motorCoord = L.latLng(-1.2405, 116.8580);
          leafletMapCampaign.panTo(motorCoord, { animate: true, duration: 0.8 });
          await wait(800);

          await movePointerToLatLng(motorCoord, 600);
          await simulateClick();
          motorMarker.openPopup();
          await wait(1000);

          // 6. KLIK TOMBOL SIDE POPUP (campaign.svg)
          const sideBtn = document.getElementById('btnMotorAttachedCampaign') || document.querySelector('#mapCampaign .usaha-attached-notes-btn');
          if (sideBtn) {
            await movePointerToElement(sideBtn, 700);
            await simulateClick();
          }

          // Buka Side Card Rincian Aktivitas
          const sideCard = document.getElementById('actorNotesSideCardCampaign') || document.querySelector('#mapCampaign .actor-notes-side-card');
          if (sideCard) {
            sideCard.classList.add('active');
            sideCard.style.display = 'block';
          }
          await wait(500);

          // Gestur Geser Peta untuk Menampakkan Side Card secara Sempurna
          await movePointerTo(220, 260, 400);
          pointer.classList.add('clicking');
          await wait(150);
          leafletMapCampaign.panBy([130, 0], { animate: true, duration: 0.8 });
          await movePointerTo(85, 260, 800);
          pointer.classList.remove('clicking');
          await wait(400);

          // 7. KLIK CTA "Lihat Halaman Promosi" PADA SIDE POPUP
          const ctaPromoBtn = document.getElementById('btnCtaPromoCampaign') || (sideCard ? sideCard.querySelector('.notes-side-cta-btn.promo') : null);
          if (ctaPromoBtn) {
            await movePointerToElement(ctaPromoBtn, 700);
            await simulateClick();
          } else {
            await movePointerTo(200, 310, 600);
            await simulateClick();
          }
          await wait(400);

          // 8. HALAMAN PROMOSI DIBUKA (Menampilkan Informasi Diskon Motor, Unit Pilihan, & Garansi)
          if (promoPageContainer) {
            promoPageContainer.classList.remove('hidden');
          }
          await wait(700);

          // Pointer scroll / move over the promotion content to showcase motor catalog and vouchers
          const promoContent = document.getElementById('promoPageContentCampaign');
          if (promoContent) {
            await movePointerTo(180, 220, 600);
            await wait(1000);
            promoContent.scrollTo({ top: 140, behavior: 'smooth' });
            await movePointerTo(180, 300, 800);
          }

          // 9. INSPEKSI LENGKAP HALAMAN PROMOSI (Hold for 6s)
          await wait(6000);

          // 10. CLEAN RESET & LOOP
          if (promoPageContainer) promoPageContainer.classList.add('hidden');
          if (sideCard) {
            sideCard.classList.remove('active');
            sideCard.style.display = 'none';
          }
          await wait(1000);
        }
      }

      setTimeout(() => {
        runSimulationCycle();
      }, 1000);
    }

    initCampaignAutoplayLoop();
  }

  // 5. Initialize Job Portal (Peluang Karir & Lowongan) Spatial GIS & Autoplay Simulation Loop
  function initJobPortalSpatialGIS() {
    const mapContainer = document.getElementById('mapJobs');
    if (!mapContainer || typeof L === 'undefined') return;

    const initialCoords = [-1.242, 116.861];
    const initialZoom = 14;

    const leafletMapJobs = L.map('mapJobs', {
      zoomControl: false,
      attributionControl: false
    }).setView(initialCoords, initialZoom);

    const streetTileJobs = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(leafletMapJobs);

    let isSatelliteJobs = false;
    let satTileJobs = null;

    const toggleMapJobs = document.getElementById('toggleMapJobs');
    if (toggleMapJobs) {
      toggleMapJobs.addEventListener('click', (e) => {
        e.stopPropagation();
        isSatelliteJobs = !isSatelliteJobs;
        if (isSatelliteJobs) {
          leafletMapJobs.removeLayer(streetTileJobs);
          satTileJobs = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19
          }).addTo(leafletMapJobs);
          toggleMapJobs.classList.add('active');
          toggleMapJobs.querySelector('span').textContent = 'Peta';
        } else {
          if (satTileJobs) leafletMapJobs.removeLayer(satTileJobs);
          streetTileJobs.addTo(leafletMapJobs);
          toggleMapJobs.classList.remove('active');
          toggleMapJobs.querySelector('span').textContent = 'Satelit';
        }
      });
    }

    const zoomInJobs = document.getElementById('zoomInJobs');
    const zoomOutJobs = document.getElementById('zoomOutJobs');
    if (zoomInJobs) zoomInJobs.addEventListener('click', (e) => { e.stopPropagation(); leafletMapJobs.zoomIn(); });
    if (zoomOutJobs) zoomOutJobs.addEventListener('click', (e) => { e.stopPropagation(); leafletMapJobs.zoomOut(); });

    function createActorIcon(iconUrl) {
      return L.divIcon({
        className: 'custom-actor-map-marker',
        html: `<div class="actor-marker-pin"><img src="${iconUrl}" alt="Actor Marker" /></div>`,
        iconSize: [36, 46],
        iconAnchor: [18, 44],
        popupAnchor: [0, -40]
      });
    }

    // Main Actor: Sentra Lounge & Mocktail Bar (Lowongan Bartender)
    const loungeData = {
      name: 'Sentra Lounge & Mocktail Bar',
      type: 'Usaha',
      iconUrl: '../static/image/actor/usaha.svg',
      address: 'Jl. MT Haryono No. 56, Damai',
      lat: -1.2420,
      lng: 116.8610
    };

    const loungePopupHTML = `
      <div class="actor-popup">
        <div class="actor-popup-header">${loungeData.name}</div>
        <div class="actor-popup-content">
          <div class="actor-popup-visual-wrapper">
            <img src="img/sentra.svg" class="actor-popup-visual" alt="Sentra Lounge" />
          </div>
          <div class="actor-location-wrapper">
            <div class="actor-address">${loungeData.address}</div>
            <div class="actor-coord">${loungeData.lat.toFixed(5)}, ${loungeData.lng.toFixed(5)}</div>
          </div>
          <div class="actor-fokus-box" style="margin-top: 6px; font-size: 11px; color: #475569; background: #f1f5f9; padding: 4px 8px; border-radius: 6px;">
            <strong>Fokus:</strong> Cafe, Mocktail & Hospitality
          </div>
        </div>
        <div class="actor-popup-actions">
          <button class="actor-btn view-actor" id="btnViewActorJobs" title="Lihat Halaman Promosi">
            <img src="../static/image/icon/view.svg" class="emoji-img" alt="Lihat" />
          </button>

        </div>
        <button type="button" class="usaha-attached-notes-btn job-notes-btn" id="btnJobAttachedJobs" title="Buka Rincian Lowongan Kerja">
          <img src="../static/image/icon/job-portal.svg" alt="Lowongan" />
        </button>
        <div class="actor-notes-side-card" id="actorNotesSideCardJobs">
          <div class="notes-side-header" style="background: linear-gradient(135deg, #0f4c75, #38a0c4); padding: 5px 8px; border-radius: 8px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div class="notes-side-title" style="color: white; font-weight: 700; font-size: 11px; display: flex; align-items: center; gap: 5px;">
              <img src="../static/image/icon/job-portal.svg" style="width: 13px; height: 13px; filter: brightness(0) invert(1);" /> Lowongan Terbuka
            </div>
            <span class="notes-side-close" id="closeSideNotesJobs" style="width: 16px; height: 16px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: #ff6b6b; color: white;">✕</span>
          </div>
          <div class="notes-side-body" style="display: flex; flex-direction: column; gap: 4px;">
            <div style="font-size: 12px; font-weight: 800; color: #0f172a; line-height: 1.2;">Bartender</div>
            <div style="font-size: 10px; color: #0284c7; font-weight: 700;">Full-Time • Shift Malam</div>
            <div style="font-size: 10px; font-weight: 800; color: #059669; background: #ecfdf5; padding: 3px 6px; border-radius: 6px; border: 1px solid #a7f3d0;">
              Gaji: Rp 3.8jt - Rp 4.5jt / bln
            </div>
            <div style="font-size: 9.5px; color: #334155; line-height: 1.35; background: #f8fafc; padding: 4px 6px; border-radius: 6px; border: 1px solid #e2e8f0;">
              • Min pengalaman barista 6 bln<br />
              • Menguasai mocktail mixing
            </div>
            <a href="https://wa.me/628123456789" target="_blank" class="notes-side-cta-btn wa" id="btnCtaWaJobs" style="background: #25D366; color: #ffffff !important; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 7px 8px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 11px; box-shadow: 0 3px 10px rgba(37,211,102,0.45); margin-top: 2px; border: none;">
              <img src="../static/image/icon/phone.svg" class="notes-cta-icon" alt="" style="width: 13px; height: 13px; filter: brightness(0) invert(1);" /> Lamar via WhatsApp
            </a>
          </div>
        </div>
      </div>
    `;

    const loungeMarker = L.marker([loungeData.lat, loungeData.lng], {
      icon: createActorIcon(loungeData.iconUrl)
    }).addTo(leafletMapJobs);

    loungeMarker.bindPopup(loungePopupHTML, {
      maxWidth: 420,
      className: 'custom-actor-leaflet-popup'
    });

    // Background Actor: PT Sentra Spatial Hub
    const hubMarker = L.marker([-1.2465, 116.8650], {
      icon: createActorIcon('../static/image/actor/usaha.svg')
    }).addTo(leafletMapJobs);

    hubMarker.bindPopup(`
      <div class="actor-popup">
        <div class="actor-popup-header">PT Sentra Spatial Hub</div>
        <div class="actor-popup-content">
          <div class="actor-popup-visual-wrapper">
            <img src="img/sentra.svg" class="actor-popup-visual" alt="Sentra Spatial" />
          </div>
          <div class="actor-location-wrapper">
            <div class="actor-address">Jl. MT Haryono No. 88</div>
            <div class="actor-coord">-1.24650, 116.86500</div>
          </div>
        </div>
      </div>
    `, { maxWidth: 420, className: 'custom-actor-leaflet-popup' });

    // Actor Switcher in Job Portal Card
    const appRootJobsEl = document.getElementById('appRootJobs');
    const switchIconsJobs = appRootJobsEl ? appRootJobsEl.querySelectorAll('.actor-switch img') : [];
    const actorUsaha4 = document.getElementById('aktorUsaha4');
    const actorLokasi4 = document.getElementById('aktorLokasi4');

    switchIconsJobs.forEach(icon => {
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = icon.getAttribute('data-target');
        switchIconsJobs.forEach(i => i.classList.remove('active'));
        icon.classList.add('active');

        if (targetId === 'aktorUsaha4') {
          if (actorUsaha4) actorUsaha4.classList.remove('hidden');
          if (actorLokasi4) actorLokasi4.classList.add('hidden');
        } else {
          if (actorLokasi4) actorLokasi4.classList.remove('hidden');
          if (actorUsaha4) actorUsaha4.classList.add('hidden');
        }
      });
    });

    const chatbotBtnEl = document.getElementById('chatbotBtnJobs');
    const chatbotOverlayEl = document.getElementById('chatbotOverlayJobs');
    const closeChatbotBtnEl = document.getElementById('closeChatbotBtnJobs');

    if (chatbotBtnEl && chatbotOverlayEl) {
      chatbotBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        chatbotOverlayEl.classList.toggle('hidden');
      });
    }

    if (closeChatbotBtnEl && chatbotOverlayEl) {
      closeChatbotBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        chatbotOverlayEl.classList.add('hidden');
      });
    }

    // ==========================================================================
    // AUTOPLAY SIMULATION LOOP CONTROLLER FOR JOB PORTAL
    // "chat dengan chatbot tentang topik tertentu -> output ai softselling aeo untuk lowongan kerjaan bartender -> klik itu menuju aktor usaha -> klik popup -> lihat informasi side popup dan cta ke whatsapp -> looping"
    // ==========================================================================
    function initJobPortalAutoplayLoop() {
      const appRoot = document.getElementById('appRootJobs');
      const pointer = document.getElementById('simulatedPointerJobs');
      const chatbotBtn = document.getElementById('chatbotBtnJobs');
      const chatbotOverlay = document.getElementById('chatbotOverlayJobs');
      const chatMessages = document.getElementById('chatMessagesJobs');
      const chatInput = document.getElementById('chatInputJobs');
      const sendChatBtn = document.getElementById('sendChatBtnJobs');

      if (!appRoot || !pointer || !leafletMapJobs) return;

      let isAutoplayRunning = true;
      const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      function movePointerTo(targetX, targetY, duration = 800) {
        return new Promise(resolve => {
          pointer.style.transition = `top ${duration}ms cubic-bezier(0.25, 1, 0.5, 1), left ${duration}ms cubic-bezier(0.25, 1, 0.5, 1), transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)`;
          pointer.style.left = `${targetX}px`;
          pointer.style.top = `${targetY}px`;
          setTimeout(resolve, duration);
        });
      }

      function movePointerToElement(el, duration = 800) {
        if (!el) return Promise.resolve();
        const appRect = appRoot.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const targetX = elRect.left - appRect.left + (elRect.width / 2);
        const targetY = elRect.top - appRect.top + (elRect.height / 2);
        return movePointerTo(targetX, targetY, duration);
      }

      function movePointerToLatLng(latLng, duration = 800) {
        const point = leafletMapJobs.latLngToContainerPoint(latLng);
        const mapEl = document.getElementById('mapJobs');
        const appRect = appRoot.getBoundingClientRect();
        const mapRect = mapEl.getBoundingClientRect();
        const targetX = (mapRect.left - appRect.left) + point.x;
        const targetY = (mapRect.top - appRect.top) + point.y;
        return movePointerTo(targetX, targetY, duration);
      }

      async function simulateClick(holdMs = 250) {
        pointer.classList.add('clicking');
        await wait(holdMs);
        pointer.classList.remove('clicking');
        await wait(100);
      }

      async function simulateType(inputEl, text, speed = 30) {
        if (!inputEl) return;
        inputEl.value = '';
        for (let i = 0; i < text.length; i++) {
          inputEl.value += text[i];
          await wait(speed);
        }
      }

      async function runSimulationCycle() {
        while (isAutoplayRunning) {
          // 0. RESET STATE
          leafletMapJobs.closePopup();
          if (chatbotOverlay) chatbotOverlay.classList.add('hidden');
          if (chatInput) chatInput.value = '';
          if (chatMessages) {
            chatMessages.innerHTML = `
              <div class="message bot">
                <div class="bubble">Halo! Sedang mencari informasi peluang kerja atau analisa industri di Balikpapan?</div>
              </div>
            `;
          }

          leafletMapJobs.setView(initialCoords, initialZoom, { animate: false });

          // Start pointer at center
          await movePointerTo(165, 300, 400);
          await wait(800);

          // 1. BUKA SPASIAL CHATBOT (Klik icon Chatbot di peta)
          if (chatbotBtn) {
            await movePointerToElement(chatbotBtn, 800);
            await simulateClick();
            if (chatbotOverlay) chatbotOverlay.classList.remove('hidden');
          }
          await wait(600);

          // 2. KETIK PROMPT: "Lagi cari info F&B dan lowongan kerja di Balikpapan"
          if (chatInput) {
            await movePointerToElement(chatInput, 600);
            await simulateClick(150);
            await simulateType(chatInput, 'Lagi cari info F&B dan lowongan kerja di Balikpapan', 28);
          }
          await wait(300);

          // Klik Tombol Kirim Chat
          if (sendChatBtn) {
            await movePointerToElement(sendChatBtn, 500);
            await simulateClick();
          }

          // 3. TAMBAHKAN PESAN USER & OUTPUT AI SOFTELLING AEO UNTUK LOWONGAN BARTENDER
          if (chatMessages) {
            const userMsg = document.createElement('div');
            userMsg.className = 'message user';
            userMsg.innerHTML = '<div class="bubble">Lagi cari info F&B dan lowongan kerja di Balikpapan</div>';
            chatMessages.appendChild(userMsg);
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;

            await wait(700);

            const botMsg = document.createElement('div');
            botMsg.className = 'message bot';
            botMsg.innerHTML = `
              <div class="bubble">
                Tentu! Industri cafe dan hospitality di Balikpapan sedang berkembang pesat. Saat ini <span class="actor-link" id="btnGotoLoungeJobs"><strong>Sentra Lounge & Mocktail Bar</strong></span> di kawasan MT Haryono sedang membuka <strong>Lowongan Kerja: Bartender</strong> dengan fasilitas insentif menarik.
              </div>
            `;
            chatMessages.appendChild(botMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            botMsg.querySelector('#btnGotoLoungeJobs')?.addEventListener('click', () => {
              if (chatbotOverlay) chatbotOverlay.classList.add('hidden');
              leafletMapJobs.setView([-1.2420, 116.8610], 15);
              loungeMarker.openPopup();
            });
          }
          await wait(900);

          // 4. KLIK TEKS LINK AEO MENUJU KE AKTOR USAHA
          const gotoBtn = document.getElementById('btnGotoLoungeJobs');
          if (gotoBtn) {
            await movePointerToElement(gotoBtn, 700);
            await simulateClick();
          }
          if (chatbotOverlay) chatbotOverlay.classList.add('hidden');
          await wait(400);

          // 5. MAP BERGESER KE TITIK SENTRA LOUNGE & POPUP TERBUKA
          const loungeCoord = L.latLng(-1.2420, 116.8610);
          leafletMapJobs.panTo(loungeCoord, { animate: true, duration: 0.8 });
          await wait(800);

          await movePointerToLatLng(loungeCoord, 600);
          await simulateClick();
          loungeMarker.openPopup();
          await wait(1000);

          // 6. KLIK TOMBOL SIDE POPUP (job-portal.svg)
          const sideBtn = document.getElementById('btnJobAttachedJobs') || document.querySelector('#mapJobs .usaha-attached-notes-btn');
          if (sideBtn) {
            await movePointerToElement(sideBtn, 700);
            await simulateClick();
          }

          // Buka Side Card Rincian Lowongan
          const sideCard = document.getElementById('actorNotesSideCardJobs') || document.querySelector('#mapJobs .actor-notes-side-card');
          if (sideCard) {
            sideCard.classList.add('active');
            sideCard.style.display = 'block';
          }
          await wait(500);

          // Gestur Geser Peta untuk Menampakkan Side Card secara Sempurna
          await movePointerTo(220, 260, 400);
          pointer.classList.add('clicking');
          await wait(150);
          leafletMapJobs.panBy([130, 0], { animate: true, duration: 0.8 });
          await movePointerTo(85, 260, 800);
          pointer.classList.remove('clicking');
          await wait(400);

          // 7. KLIK CTA "Lamar via WhatsApp" PADA SIDE POPUP
          const ctaWaBtn = document.getElementById('btnCtaWaJobs') || (sideCard ? sideCard.querySelector('#btnCtaWaJobs') : null);
          if (ctaWaBtn) {
            await movePointerToElement(ctaWaBtn, 700);
            await simulateClick();
          } else {
            await movePointerTo(200, 310, 600);
            await simulateClick();
          }
          await wait(600);

          // 8. INSPEKSI DETAIL LOWONGAN & CTA (Hold for 6s)
          await wait(6000);

          // 9. CLEAN RESET & LOOP
          if (sideCard) {
            sideCard.classList.remove('active');
            sideCard.style.display = 'none';
          }
          await wait(1000);
        }
      }

      setTimeout(() => {
        runSimulationCycle();
      }, 1000);
    }

    initJobPortalAutoplayLoop();
  }

  // 6. Initialize AI Pin (Targeting Spasial & Analisis Radius) Spatial GIS & Autoplay Simulation Loop
  function initAiPinSpatialGIS() {
    const mapContainer = document.getElementById('mapAiPin');
    if (!mapContainer || typeof L === 'undefined') return;

    const initialCoords = [-1.2425, 116.8620];
    const initialZoom = 14;

    const leafletMapAiPin = L.map('mapAiPin', {
      zoomControl: false,
      attributionControl: false
    }).setView(initialCoords, initialZoom);

    const streetTileAiPin = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(leafletMapAiPin);

    let isSatelliteAiPin = false;
    let satTileAiPin = null;

    const toggleMapAiPin = document.getElementById('toggleMapAiPin');
    if (toggleMapAiPin) {
      toggleMapAiPin.addEventListener('click', (e) => {
        e.stopPropagation();
        isSatelliteAiPin = !isSatelliteAiPin;
        if (isSatelliteAiPin) {
          leafletMapAiPin.removeLayer(streetTileAiPin);
          satTileAiPin = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19
          }).addTo(leafletMapAiPin);
          toggleMapAiPin.classList.add('active');
          toggleMapAiPin.querySelector('span').textContent = 'Peta';
        } else {
          if (satTileAiPin) leafletMapAiPin.removeLayer(satTileAiPin);
          streetTileAiPin.addTo(leafletMapAiPin);
          toggleMapAiPin.classList.remove('active');
          toggleMapAiPin.querySelector('span').textContent = 'Satelit';
        }
      });
    }

    const zoomInAiPin = document.getElementById('zoomInAiPin');
    const zoomOutAiPin = document.getElementById('zoomOutAiPin');
    if (zoomInAiPin) zoomInAiPin.addEventListener('click', (e) => { e.stopPropagation(); leafletMapAiPin.zoomIn(); });
    if (zoomOutAiPin) zoomOutAiPin.addEventListener('click', (e) => { e.stopPropagation(); leafletMapAiPin.zoomOut(); });

    function createActorIcon(iconUrl) {
      return L.divIcon({
        className: 'custom-actor-map-marker',
        html: `<div class="actor-marker-pin"><img src="${iconUrl}" alt="Actor Marker" /></div>`,
        iconSize: [36, 46],
        iconAnchor: [18, 44],
        popupAnchor: [0, -40]
      });
    }

    function createPinIcon() {
      return L.icon({
        iconUrl: '../static/image/icon/ai-pin.svg',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22]
      });
    }

    // 22+ Realistic Business Actors in Balikpapan
    const businessActors = [
      {
        id: 'pijat-maryono',
        name: 'Pijat Tradisional & Refleksi Pak Maryono',
        type: 'Usaha',
        category: 'Kesehatan & Pijat Tradisional',
        address: 'Jl. MT Haryono No. 34, RT 22 Damai',
        lat: -1.2430,
        lng: 116.8615,
        isHero: true,
        promoBtn: true
      },
      { id: 'sentra-lounge', name: 'Sentra Lounge & Mocktail Bar', type: 'Usaha', category: 'F&B Cafe & Bar', address: 'Jl. MT Haryono No. 56', lat: -1.2420, lng: 116.8610 },
      { id: 'florist-bloom', name: 'Florist Bloom & Gift', type: 'Usaha', category: 'Florist & Gift Craft', address: 'Jl. MT Haryono No. 12', lat: -1.2405, lng: 116.8580 },
      { id: 'siomay-batagor', name: 'Siomay Batagor Mang Ujang', type: 'Usaha', category: 'Kuliner Khas Tradisional', address: 'Jl. MT Haryono No. 42', lat: -1.2438, lng: 116.8625 },
      { id: 'warung-gami', name: 'Warung Sambal Gami Bu Siti', type: 'Usaha', category: 'Kuliner Nusantara', address: 'Jl. MT Haryono No. 78', lat: -1.2445, lng: 116.8590 },
      { id: 'kopitiam-damai', name: 'Kopi Tiam Balikpapan Damai', type: 'Usaha', category: 'Kedai Kopi & Sarapan', address: 'Jl. MT Haryono No. 88', lat: -1.2415, lng: 116.8635 },
      { id: 'bengkel-berkah', name: 'Bengkel Motor Berkah Jaya', type: 'Usaha', category: 'Otomotif & Servis', address: 'Jl. MT Haryono No. 102', lat: -1.2450, lng: 116.8660 },
      { id: 'apotek-sehat', name: 'Apotek Sehat Farma MT Haryono', type: 'Usaha', category: 'Farmasi & Medis', address: 'Jl. MT Haryono No. 19', lat: -1.2400, lng: 116.8605 },
      { id: 'laundry-bahagia', name: 'Laundry Express Damai Bahagia', type: 'Usaha', category: 'Jasa Cuci & Kiloan', address: 'Jl. MT Haryono Gang Damai 3', lat: -1.2470, lng: 116.8610 },
      { id: 'kelontong-abadi', name: 'Toko Kelontong Berkah Abadi', type: 'Usaha', category: 'Kebutuhan Harian & Sembako', address: 'Jl. MT Haryono RT 18', lat: -1.2480, lng: 116.8640 },
      { id: 'barbershop-joko', name: 'Barbershop Mas Joko Premium', type: 'Usaha', category: 'Pangkas Rambut & Grooming', address: 'Jl. MT Haryono No. 64', lat: -1.2390, lng: 116.8570 },
      { id: 'bakery-delights', name: 'Damai Bakery & Pastry', type: 'Usaha', category: 'Toko Roti & Kue Segar', address: 'Jl. MT Haryono No. 27', lat: -1.2385, lng: 116.8620 },
      { id: 'sate-romli', name: 'Warung Sate Madura H. Romli', type: 'Usaha', category: 'Kuliner Sate & Gule', address: 'Jl. MT Haryono No. 91', lat: -1.2455, lng: 116.8575 },
      { id: 'salon-cantika', name: 'Salon Muslimah & Spa Cantika', type: 'Usaha', category: 'Perawatan Tubuh & Rambut', address: 'Jl. MT Haryono No. 15', lat: -1.2410, lng: 116.8655 },
      { id: 'buah-barakah', name: 'Toko Buah Segar Al-Barakah', type: 'Usaha', category: 'Buah Lokal & Impor', address: 'Jl. MT Haryono No. 49', lat: -1.2435, lng: 116.8670 },
      { id: 'percetakan-cepat', name: 'Percetakan & Fotocopy Cepat', type: 'Usaha', category: 'Digital Printing & ATK', address: 'Jl. MT Haryono No. 82', lat: -1.2460, lng: 116.8595 },
      { id: 'counter-pulsa', name: 'Damai Cell & Aksesoris HP', type: 'Usaha', category: 'Telekomunikasi & Gadget', address: 'Jl. MT Haryono No. 51', lat: -1.2425, lng: 116.8565 },
      { id: 'padang-sederhana', name: 'Rumah Makan Padang Saiyo', type: 'Usaha', category: 'Kuliner Minang', address: 'Jl. MT Haryono No. 23', lat: -1.2395, lng: 116.8645 },
      { id: 'klinik-sehati', name: 'Klinik Fisioterapi & Bekam Sehati', type: 'Usaha', category: 'Fisioterapi & Terapi Otot', address: 'Jl. MT Haryono No. 110', lat: -1.2475, lng: 116.8585 },
      { id: 'bahan-kue', name: 'Toko Bahan Kue Damai Sentosa', type: 'Usaha', category: 'Bahan Masak & Baking', address: 'Jl. MT Haryono No. 37', lat: -1.2408, lng: 116.8630 },
      { id: 'pet-shop', name: 'Damai Pet Shop & Care', type: 'Usaha', category: 'Pakan Hewan & Grooming', address: 'Jl. MT Haryono No. 95', lat: -1.2440, lng: 116.8680 },
      { id: 'sentra-hub', name: 'PT Sentra Spatial Hub Balikpapan', type: 'Usaha', category: 'Pusat Riset Geospasial', address: 'Jl. MT Haryono No. 1', lat: -1.2465, lng: 116.8650 }
    ];

    const actorMarkersMap = {};

    businessActors.forEach(actor => {
      const marker = L.marker([actor.lat, actor.lng], {
        icon: createActorIcon('../static/image/actor/usaha.svg')
      }).addTo(leafletMapAiPin);

      let popupContent = `
        <div class="actor-popup">
          <div class="actor-popup-header">${actor.name}</div>
          <div class="actor-popup-content">
            <div class="actor-popup-visual-wrapper">
              <img src="img/pijat.svg" class="actor-popup-visual" alt="${actor.name}" />
            </div>
            <div class="actor-location-wrapper">
              <div class="actor-address">${actor.address}</div>
              <div class="actor-coord">${actor.lat.toFixed(5)}, ${actor.lng.toFixed(5)}</div>
            </div>
            <div class="actor-fokus-box" style="margin-top: 6px; font-size: 11px; color: #475569; background: #f1f5f9; padding: 4px 8px; border-radius: 6px;">
              <strong>Kategori:</strong> ${actor.category}
            </div>
          </div>
          <div class="actor-popup-actions">
            <button class="actor-btn view-actor" ${actor.isHero ? 'id="btnViewActorAiPin"' : ''} title="Lihat Halaman Promosi">
              <img src="../static/image/icon/view.svg" class="emoji-img" alt="Lihat" />
            </button>
          </div>
      `;

      if (actor.isHero) {
        popupContent += `
          <button type="button" class="usaha-attached-notes-btn promo" id="btnPromoPijatAiPin" title="Buka Halaman Promosi Pijat Pak Maryono">
            <img src="../static/image/icon/campaign.svg" alt="Promo" />
          </button>
          <div class="actor-notes-side-card" id="actorNotesSideCardAiPin">
            <div class="actor-notes-side-header" style="background: linear-gradient(135deg, #1e3a8a, #0284c7);">
              <div class="notes-side-title" style="color: white; font-weight: 700; font-size: 11.5px; display: flex; align-items: center; gap: 6px;">
                <img src="../static/image/icon/campaign.svg" style="width: 14px; height: 14px; filter: brightness(0) invert(1);" /> Promo Terapi Punggung
              </div>
              <button class="notes-side-close" id="closeSideNotesAiPin" style="color: white;">✕</button>
            </div>
            <div class="actor-notes-side-body" style="padding: 10px; max-height: 250px; overflow-y: auto;">
              <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">Pijat Urut Sakit Punggung & Pinggang</div>
              <div style="font-size: 10.5px; color: #0284c7; font-weight: 700; margin-bottom: 6px;">Voucher Diskon 20% (Kode: SEHAT20)</div>
              <div style="font-size: 10.5px; color: #334155; line-height: 1.4; margin-bottom: 8px;">
                Layanan terapi saraf, urut pegal linu, dan pijat relaksasi berpengalaman 15+ tahun di Balikpapan.
              </div>
              <button type="button" class="notes-side-cta-btn promo" id="btnCtaPromoPijatPageAiPin" style="background: linear-gradient(135deg, #1e3a8a, #0284c7); color: white !important; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px; border-radius: 6px; border: none; font-weight: 700; font-size: 11px; cursor: pointer; width: 100%; box-shadow: 0 3px 8px rgba(2,132,199,0.3);">
                <img src="../static/image/icon/view.svg" class="notes-cta-icon" alt="" /> Lihat Halaman Promosi
              </button>
            </div>
          </div>
        `;
      }

      popupContent += `</div>`;

      marker.bindPopup(popupContent, {
        maxWidth: 420,
        className: 'custom-actor-leaflet-popup'
      });

      actorMarkersMap[actor.id] = marker;
    });

    // Targeting state
    let targetPinMarker = null;
    let targetCircleArea = null;

    // Radius range input listener (1:1 spatial_chat.js)
    const radiusSlider = document.getElementById('radiusSliderAiPin');
    const radiusDisp = document.getElementById('radiusDispAiPin');
    const radiusPanel = document.getElementById('radiusPanelAiPin');
    const btnSaveRadius = document.getElementById('btnSaveRadiusAiPin');

    if (radiusSlider && radiusDisp) {
      radiusSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        radiusDisp.textContent = val + ' m';
        if (targetCircleArea) {
          targetCircleArea.setRadius(val);
        }
      });
    }

    if (btnSaveRadius) {
      btnSaveRadius.addEventListener('click', () => {
        if (radiusPanel) radiusPanel.classList.add('hidden');
        const locBadge = document.getElementById('locationTargetBadgeAiPin');
        if (locBadge) locBadge.classList.remove('hidden');
        const chatbotOverlay = document.getElementById('chatbotOverlayAiPin');
        if (chatbotOverlay) chatbotOverlay.classList.remove('hidden');
      });
    }

    // Actor Switcher in AI Pin Card
    const appRootAiPinEl = document.getElementById('appRootAiPin');
    const switchIconsAiPin = appRootAiPinEl ? appRootAiPinEl.querySelectorAll('.actor-switch img') : [];
    const actorUsaha5 = document.getElementById('aktorUsaha5');
    const actorLokasi5 = document.getElementById('aktorLokasi5');

    switchIconsAiPin.forEach(icon => {
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = icon.getAttribute('data-target');
        switchIconsAiPin.forEach(i => i.classList.remove('active'));
        icon.classList.add('active');

        if (targetId === 'aktorUsaha5') {
          if (actorUsaha5) actorUsaha5.classList.remove('hidden');
          if (actorLokasi5) actorLokasi5.classList.add('hidden');
        } else {
          if (actorLokasi5) actorLokasi5.classList.remove('hidden');
          if (actorUsaha5) actorUsaha5.classList.add('hidden');
        }
      });
    });

    const chatbotBtnEl = document.getElementById('chatbotBtnAiPin');
    const chatbotOverlayEl = document.getElementById('chatbotOverlayAiPin');
    const closeChatbotBtnEl = document.getElementById('closeChatbotBtnAiPin');

    if (chatbotBtnEl && chatbotOverlayEl) {
      chatbotBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        chatbotOverlayEl.classList.toggle('hidden');
      });
    }

    if (closeChatbotBtnEl && chatbotOverlayEl) {
      closeChatbotBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        chatbotOverlayEl.classList.add('hidden');
      });
    }

    const promoPageContainer = document.getElementById('promotionBuilderContainerAiPin');
    const btnBackToMap = document.getElementById('btnBackToMapAiPin');
    if (btnBackToMap && promoPageContainer) {
      btnBackToMap.addEventListener('click', () => {
        promoPageContainer.classList.add('hidden');
      });
    }

    // ==========================================================================
    // AUTOPLAY SIMULATION LOOP CONTROLLER FOR AI PIN
    // "buka spasial chatbot -> klik ai pin -> targetkan koordinat -> slider radius -> kunci lokasi -> tanya kebutuhan pijat urut sakit punggung -> jawaban ai -> klik ke popup -> popup diklik ke landing page promosi pijat pak maryono -> scroll testimoni -> looping"
    // ==========================================================================
    function initAiPinAutoplayLoop() {
      const appRoot = document.getElementById('appRootAiPin');
      const pointer = document.getElementById('simulatedPointerAiPin');
      const chatbotBtn = document.getElementById('chatbotBtnAiPin');
      const chatbotOverlay = document.getElementById('chatbotOverlayAiPin');
      const chatMessages = document.getElementById('chatMessagesAiPin');
      const chatInput = document.getElementById('chatInputAiPin');
      const sendChatBtn = document.getElementById('sendChatBtnAiPin');
      const btnAiPinTarget = document.getElementById('btnAiPinTargetAiPin');
      const radiusPanelEl = document.getElementById('radiusPanelAiPin');
      const radiusSliderEl = document.getElementById('radiusSliderAiPin');
      const radiusDispEl = document.getElementById('radiusDispAiPin');
      const btnSaveRadiusEl = document.getElementById('btnSaveRadiusAiPin');
      const locationBadge = document.getElementById('locationTargetBadgeAiPin');
      const promoPage = document.getElementById('promotionBuilderContainerAiPin');

      if (!appRoot || !pointer || !leafletMapAiPin) return;

      let isAutoplayRunning = true;
      const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      function movePointerTo(targetX, targetY, duration = 800) {
        return new Promise(resolve => {
          pointer.style.transition = `top ${duration}ms cubic-bezier(0.25, 1, 0.5, 1), left ${duration}ms cubic-bezier(0.25, 1, 0.5, 1), transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)`;
          pointer.style.left = `${targetX}px`;
          pointer.style.top = `${targetY}px`;
          setTimeout(resolve, duration);
        });
      }

      function movePointerToElement(el, duration = 800) {
        if (!el) return Promise.resolve();
        const appRect = appRoot.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const targetX = elRect.left - appRect.left + (elRect.width / 2);
        const targetY = elRect.top - appRect.top + (elRect.height / 2);
        return movePointerTo(targetX, targetY, duration);
      }

      function movePointerToLatLng(latLng, duration = 800) {
        const point = leafletMapAiPin.latLngToContainerPoint(latLng);
        const mapEl = document.getElementById('mapAiPin');
        const appRect = appRoot.getBoundingClientRect();
        const mapRect = mapEl.getBoundingClientRect();
        const targetX = (mapRect.left - appRect.left) + point.x;
        const targetY = (mapRect.top - appRect.top) + point.y;
        return movePointerTo(targetX, targetY, duration);
      }

      async function simulateClick(holdMs = 250) {
        pointer.classList.add('clicking');
        await wait(holdMs);
        pointer.classList.remove('clicking');
        await wait(100);
      }

      async function simulateType(inputEl, text, speed = 25) {
        if (!inputEl) return;
        inputEl.value = '';
        for (let i = 0; i < text.length; i++) {
          inputEl.value += text[i];
          await wait(speed);
        }
      }

      async function runSimulationCycle() {
        while (isAutoplayRunning) {
          // 0. RESET STATE
          leafletMapAiPin.closePopup();
          if (chatbotOverlay) chatbotOverlay.classList.add('hidden');
          if (radiusPanelEl) radiusPanelEl.classList.add('hidden');
          if (locationBadge) locationBadge.classList.add('hidden');
          if (promoPage) promoPage.classList.add('hidden');
          if (chatInput) chatInput.value = '';
          if (chatMessages) {
            chatMessages.innerHTML = `
              <div class="message bot">
                <div class="bubble">Halo! Gunakan AI Pin untuk menargetkan titik radius wilayah dan dapatkan analisis kebutuhan lokal.</div>
              </div>
            `;
          }

          if (targetPinMarker) { leafletMapAiPin.removeLayer(targetPinMarker); targetPinMarker = null; }
          if (targetCircleArea) { leafletMapAiPin.removeLayer(targetCircleArea); targetCircleArea = null; }

          leafletMapAiPin.setView(initialCoords, initialZoom, { animate: false });

          // Start pointer at center
          await movePointerTo(165, 300, 400);
          await wait(800);

          // 1. BUKA SPASIAL CHATBOT
          if (chatbotBtn) {
            await movePointerToElement(chatbotBtn, 800);
            await simulateClick();
            if (chatbotOverlay) chatbotOverlay.classList.remove('hidden');
          }
          await wait(600);

          // 2. KLIK AI PIN (Targetkan Titik di Peta)
          if (btnAiPinTarget) {
            await movePointerToElement(btnAiPinTarget, 700);
            await simulateClick();
            if (chatbotOverlay) chatbotOverlay.classList.add('hidden');
          }
          await wait(500);

          // 3. TARGETKAN SUATU KOORDINAT DI PETA
          const targetPinCoords = L.latLng(-1.2425, 116.8620);
          leafletMapAiPin.panTo(targetPinCoords, { animate: true, duration: 0.6 });
          await wait(600);

          await movePointerToLatLng(targetPinCoords, 700);
          await simulateClick();

          // Drop AI Pin and Circle on map (Using 1:1 user L.icon)
          targetPinMarker = L.marker(targetPinCoords, {
            icon: createPinIcon()
          }).addTo(leafletMapAiPin);

          targetCircleArea = L.circle(targetPinCoords, {
            radius: 500,
            color: '#38a0c4',
            fillColor: '#8d98e0',
            fillOpacity: 0.22,
            weight: 2
          }).addTo(leafletMapAiPin);

          // Tampilkan Authentic Radius Panel
          if (radiusPanelEl) {
            radiusPanelEl.classList.remove('hidden');
            if (radiusSliderEl) radiusSliderEl.value = 500;
            if (radiusDispEl) radiusDispEl.textContent = '500 m';
          }
          await wait(600);

          // 4. SLIDER RADIUS (Geser radius dari 500m -> 1200m)
          if (radiusSliderEl && radiusDispEl) {
            await movePointerToElement(radiusSliderEl, 700);
            await simulateClick(100);

            // Animate radius expand
            for (let r = 500; r <= 1200; r += 100) {
              radiusSliderEl.value = r;
              radiusDispEl.textContent = r + ' m';
              targetCircleArea.setRadius(r);
              await wait(60);
            }
          }
          await wait(600);

          // 5. KLIK "KUNCI LOKASI" (saveTargetLocation)
          if (btnSaveRadiusEl) {
            await movePointerToElement(btnSaveRadiusEl, 650);
            await simulateClick();
            if (radiusPanelEl) radiusPanelEl.classList.add('hidden');
            if (chatbotOverlay) chatbotOverlay.classList.remove('hidden');
            if (locationBadge) locationBadge.classList.remove('hidden');
          }
          await wait(600);

          // 6. TANYA TENTANG KEBUTUHAN PIJAT URUT SAKIT PUNGGUNG
          if (chatInput) {
            await movePointerToElement(chatInput, 600);
            await simulateClick(150);
            await simulateType(chatInput, 'Butuh rekomendasi terapis pijat urut tradisional untuk sakit punggung dan pegal linu di sekitar radius ini', 22);
          }
          await wait(300);

          // Klik Kirim Chat
          if (sendChatBtn) {
            await movePointerToElement(sendChatBtn, 500);
            await simulateClick();
          }

          // 7. JAWABAN AI SPASIAL & SOFTELLING AEO UNTUK PIJAT PAK MARYONO
          if (chatMessages) {
            const userMsg = document.createElement('div');
            userMsg.className = 'message user';
            userMsg.innerHTML = '<div class="bubble">Butuh rekomendasi terapis pijat urut tradisional untuk sakit punggung dan pegal linu di sekitar radius ini</div>';
            chatMessages.appendChild(userMsg);
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;

            await wait(700);

            const botMsg = document.createElement('div');
            botMsg.className = 'message bot';
            botMsg.innerHTML = `
              <div class="bubble">
                Dalam radius 1200m di sekitar MT Haryono, teridentifikasi beberapa layanan kesehatan & relaksasi. Rekomendasi terapis terpercaya dengan spesialisasi keluhan sakit pinggang, pundak kaku, dan pegal linu adalah <span class="actor-link" id="btnGotoPijatAiPin"><strong>Pijat Tradisional & Refleksi Pak Maryono</strong></span> (Pengalaman 15+ tahun, melayani panggilan ke rumah dengan promo voucher terapi punggung).
              </div>
            `;
            chatMessages.appendChild(botMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            botMsg.querySelector('#btnGotoPijatAiPin')?.addEventListener('click', () => {
              if (chatbotOverlay) chatbotOverlay.classList.add('hidden');
              leafletMapAiPin.setView([-1.2430, 116.8615], 16);
              const heroM = actorMarkersMap['pijat-maryono'];
              if (heroM) heroM.openPopup();
            });
          }
          await wait(900);

          // 8. KLIK TAUTAN AEO MENUJU KE POPUP AKTOR USAHA
          const gotoBtn = document.getElementById('btnGotoPijatAiPin');
          if (gotoBtn) {
            await movePointerToElement(gotoBtn, 700);
            await simulateClick();
          }
          if (chatbotOverlay) chatbotOverlay.classList.add('hidden');
          await wait(400);

          // 9. MAP BERGESER KE TITIK PIJAT PAK MARYONO & POPUP TERBUKA
          const maryonoCoord = L.latLng(-1.2430, 116.8615);
          leafletMapAiPin.panTo(maryonoCoord, { animate: true, duration: 0.8 });
          await wait(800);

          await movePointerToLatLng(maryonoCoord, 600);
          await simulateClick();
          const heroMarker = actorMarkersMap['pijat-maryono'];
          if (heroMarker) heroMarker.openPopup();
          await wait(1000);

          // 10. KLIK POPUP / TOMBOL PROMOSI UNTUK MENUJU KE HALAMAN PROMOSI PIJAT PAK MARYONO
          const promoBtn = document.getElementById('btnPromoPijatAiPin') || document.querySelector('#mapAiPin .usaha-attached-notes-btn');
          if (promoBtn) {
            await movePointerToElement(promoBtn, 700);
            await simulateClick();
          }

          const sideCard = document.getElementById('actorNotesSideCardAiPin') || document.querySelector('#mapAiPin .actor-notes-side-card');
          if (sideCard) {
            sideCard.classList.add('active');
            sideCard.style.display = 'block';
          }
          await wait(500);

          // Gestur Geser Peta untuk Menampakkan Side Card secara Sempurna
          await movePointerTo(220, 260, 400);
          pointer.classList.add('clicking');
          await wait(150);
          leafletMapAiPin.panBy([130, 0], { animate: true, duration: 0.8 });
          await movePointerTo(85, 260, 800);
          pointer.classList.remove('clicking');
          await wait(400);

          // Klik CTA "Lihat Halaman Promosi"
          const ctaPromoBtn = document.getElementById('btnCtaPromoPijatPageAiPin') || (sideCard ? sideCard.querySelector('.notes-side-cta-btn.promo') : null);
          if (ctaPromoBtn) {
            await movePointerToElement(ctaPromoBtn, 700);
            await simulateClick();
          } else {
            await movePointerTo(200, 310, 600);
            await simulateClick();
          }
          await wait(400);

          // 11. LANDING PAGE JASA PIJAT PAK MARYONO DIBUKA
          if (promoPage) {
            promoPage.classList.remove('hidden');
          }
          await wait(700);

          // Pointer scroll di dalam Landing Page Jasa Promosi (Scroll down to testimonials & services)
          const promoContent = document.getElementById('promoPageContentAiPin');
          if (promoContent) {
            promoContent.scrollTop = 0;
            await movePointerTo(180, 220, 600);
            await wait(1200);

            // Scroll ke Paket Layanan & Harga
            promoContent.scrollTo({ top: 220, behavior: 'smooth' });
            await movePointerTo(180, 280, 800);
            await wait(1500);

            // Scroll ke Bagian Testimoni Pasien & Lokasi
            promoContent.scrollTo({ top: 480, behavior: 'smooth' });
            await movePointerTo(180, 320, 800);
            await wait(2200);

            // Scroll ke CTA WhatsApp di paling bawah
            promoContent.scrollTo({ top: 700, behavior: 'smooth' });
            await movePointerTo(180, 360, 800);
            await wait(2000);

            // Scroll balik ke atas
            promoContent.scrollTo({ top: 0, behavior: 'smooth' });
            await movePointerTo(180, 180, 700);
          }

          // 12. INSPEKSI LENGKAP HALAMAN PROMOSI PIJAT PAK MARYONO (Hold for 3s)
          await wait(3000);

          // 13. CLEAN RESET & LOOP
          if (promoPage) promoPage.classList.add('hidden');
          if (sideCard) {
            sideCard.classList.remove('active');
            sideCard.style.display = 'none';
          }
          await wait(1000);
        }
      }

      setTimeout(() => {
        runSimulationCycle();
      }, 1000);
    }

    initAiPinAutoplayLoop();
  }

  // ==========================================================================
  // 6. CIPTA KERJA SPATIAL GIS & MULTI-MODE AUTOPLAY SIMULATION (Card 7)
  // ==========================================================================
  function initJobModeSpatialGIS() {
    const mapEl = document.getElementById('mapJobMode');
    if (!mapEl || typeof L === 'undefined') return;

    const initialCoords = [-1.2425, 116.8620];
    const initialZoom = 15;

    const leafletMapJobMode = L.map('mapJobMode', {
      zoomControl: false,
      attributionControl: false
    }).setView(initialCoords, initialZoom);

    setTimeout(() => {
      leafletMapJobMode.invalidateSize();
    }, 200);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(leafletMapJobMode);

    const zoomIn = document.getElementById('zoomInJobMode');
    const zoomOut = document.getElementById('zoomOutJobMode');
    if (zoomIn) zoomIn.addEventListener('click', (e) => { e.stopPropagation(); leafletMapJobMode.zoomIn(); });
    if (zoomOut) zoomOut.addEventListener('click', (e) => { e.stopPropagation(); leafletMapJobMode.zoomOut(); });

    function createActorIcon(iconUrl) {
      return L.divIcon({
        className: 'custom-actor-map-marker',
        html: `<div class="actor-marker-pin"><img src="${iconUrl}" alt="Actor Marker" /></div>`,
        iconSize: [36, 46],
        iconAnchor: [18, 44],
        popupAnchor: [0, -40]
      });
    }

    // Business Actors on Job Mode Map
    const actors = [
      { name: 'Sentra Servis Elektronik Damai', lat: -1.2420, lng: 116.8605, category: 'Elektronik & Servis' },
      { name: 'Toko Sparepart Listrik Berkah', lat: -1.2440, lng: 116.8630, category: 'Komponen Kelistrikan' },
      { name: 'Perumahan Damai Bahagia RT 22', lat: -1.2410, lng: 116.8645, category: 'Kawasan Pemukiman' },
      { name: 'Kantin & Warung Makan Bu Siti', lat: -1.2450, lng: 116.8590, category: 'Kuliner UMKM' }
    ];

    actors.forEach(actor => {
      const marker = L.marker([actor.lat, actor.lng], {
        icon: createActorIcon('../static/image/actor/usaha.svg')
      }).addTo(leafletMapJobMode);

      marker.bindPopup(`
        <div class="actor-popup">
          <div class="actor-popup-header">Aktor Spasial</div>
          <div class="actor-popup-content">
            <div class="actor-popup-name">${actor.name}</div>
            <div class="actor-fokus-box" style="margin-top: 4px; font-size: 11px; color: #475569; background: #f1f5f9; padding: 4px 8px; border-radius: 6px;">
              <strong>Kategori:</strong> ${actor.category}
            </div>
          </div>
        </div>
      `, { maxWidth: 300, className: 'custom-actor-leaflet-popup' });
    });

    // Chatbot Overlay Toggle & Close
    const chatbotBtn = document.getElementById('chatbotBtnJobMode');
    const chatbotOverlay = document.getElementById('chatbotOverlayJobMode');
    const closeChatbotBtn = document.getElementById('closeChatbotBtnJobMode');
    const mainJcToggle = document.getElementById('mainJcToggleJobMode');
    const jcSubMenu = document.getElementById('jobCreationSubMenuJobMode');
    const chatInput = document.getElementById('chatInputJobMode');

    if (chatbotBtn && chatbotOverlay) {
      chatbotBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        chatbotOverlay.classList.toggle('hidden');
      });
    }

    if (closeChatbotBtn && chatbotOverlay) {
      closeChatbotBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        chatbotOverlay.classList.add('hidden');
      });
    }

    // Toggle Cipta Kerja Mode
    if (mainJcToggle && jcSubMenu) {
      mainJcToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        mainJcToggle.classList.toggle('active');
        jcSubMenu.classList.toggle('hidden');
      });
    }

    // Chips selection listener
    const chips = jcSubMenu ? jcSubMenu.querySelectorAll('.jc-chip') : [];
    chips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const mode = chip.getAttribute('data-mode');
        if (chatInput) {
          if (mode === 'sumber-daya') chatInput.placeholder = 'Sebutkan skill/aset lokal yang kamu punya...';
          else if (mode === 'celah-masalah') chatInput.placeholder = 'Tanya celah masalah/kebutuhan lokal sekitar...';
          else if (mode === 'analisis') chatInput.placeholder = 'Minta alur operasional/SOP teknis usaha...';
          else if (mode === 'simulasi-modal') chatInput.placeholder = 'Tanya simulasi modal awal & proyeksi omzet...';
          else if (mode === 'simulasi-lapangan-kerja') chatInput.placeholder = 'Simulasi penyerapan tenaga kerja lokal...';
        }
      });
    });

    // ==========================================================================
    // AUTOPLAY SIMULATION FOR CIPTA KERJA (5-MODE SEQUENTIAL RUN)
    // ==========================================================================
    function initJobModeAutoplayLoop() {
      const appRoot = document.getElementById('appRootJobMode');
      const pointer = document.getElementById('simulatedPointerJobMode');
      const chatMessages = document.getElementById('chatMessagesJobMode');
      const sendChatBtn = document.getElementById('sendChatBtnJobMode');
      const chipSumberDaya = document.getElementById('chipSumberDayaJobMode');
      const chipCelahMasalah = document.getElementById('chipCelahMasalahJobMode');
      const chipAnalisis = document.getElementById('chipAnalisisJobMode');
      const chipSimulasiModal = document.getElementById('chipSimulasiModalJobMode');
      const chipSimulasiKerja = document.getElementById('chipSimulasiKerjaJobMode');

      if (!appRoot || !pointer || !leafletMapJobMode) return;

      let isAutoplayRunning = true;
      const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      function movePointerTo(targetX, targetY, duration = 800) {
        return new Promise(resolve => {
          pointer.style.transition = `top ${duration}ms cubic-bezier(0.25, 1, 0.5, 1), left ${duration}ms cubic-bezier(0.25, 1, 0.5, 1), transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)`;
          pointer.style.left = `${targetX}px`;
          pointer.style.top = `${targetY}px`;
          setTimeout(resolve, duration);
        });
      }

      function movePointerToElement(el, duration = 800) {
        if (!el) return Promise.resolve();
        const appRect = appRoot.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        let targetX = elRect.left - appRect.left + (elRect.width / 2);
        let targetY = elRect.top - appRect.top + (elRect.height / 2);
        targetX = Math.max(10, Math.min(appRect.width - 10, targetX));
        targetY = Math.max(10, Math.min(appRect.height - 10, targetY));
        return movePointerTo(targetX, targetY, duration);
      }

      async function simulateClick(holdMs = 250) {
        pointer.classList.add('clicking');
        await wait(holdMs);
        pointer.classList.remove('clicking');
        await wait(100);
      }

      async function simulateType(inputEl, text, speed = 18) {
        if (!inputEl) return;
        inputEl.value = '';
        for (let i = 0; i < text.length; i++) {
          inputEl.value += text[i];
          await wait(speed);
        }
      }

      function appendChatMessage(role, htmlContent) {
        if (!chatMessages) return;
        const msg = document.createElement('div');
        msg.className = `message ${role}`;
        msg.innerHTML = `<div class="bubble">${htmlContent}</div>`;
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      async function swipeChipsTo(targetChip, targetScrollLeft) {
        if (!jcSubMenu || !targetChip) return;

        if (targetScrollLeft === undefined) {
          targetScrollLeft = Math.max(0, targetChip.offsetLeft - 16);
        }

        const currentScroll = jcSubMenu.scrollLeft;
        const scrollDelta = targetScrollLeft - currentScroll;

        // Jika ada perpindahan posisi chip horizontal, tampilkan gestur sentuh geser (swipe / drag)
        if (Math.abs(scrollDelta) > 12) {
          const appRect = appRoot.getBoundingClientRect();
          const jcRect = jcSubMenu.getBoundingClientRect();
          const swipeY = (jcRect.top - appRect.top) + (jcRect.height / 2);

          let startX, endX;
          if (scrollDelta > 0) {
            // Geser ke kiri (Swipe jari dari kanan ke kiri untuk memajukan chips)
            startX = Math.min(appRect.width - 35, 270);
            endX = Math.max(25, startX - Math.min(Math.abs(scrollDelta) * 0.9 + 40, 190));
          } else {
            // Geser ke kanan (Swipe jari dari kiri ke kanan untuk memundurkan chips)
            startX = 35;
            endX = Math.min(appRect.width - 35, startX + Math.min(Math.abs(scrollDelta) * 0.9 + 40, 190));
          }

          // 1. Gerakkan jari ke barisan chips
          await movePointerTo(startX, swipeY, 400);
          await wait(80);

          // 2. Sentuh layar (Press down / grab)
          pointer.classList.add('clicking');
          await wait(120);

          // 3. Tarik layar secara horizontal bersamaan dengan pergeseran scroll kontainer
          const dragDuration = 520;
          const startTime = performance.now();
          pointer.style.transition = 'none';

          await new Promise(resolve => {
            function animateDrag(now) {
              const elapsed = now - startTime;
              const progress = Math.min(1, elapsed / dragDuration);
              // Easing cubic yang sangat halus
              const ease = 1 - Math.pow(1 - progress, 3);

              const curX = startX + (endX - startX) * ease;
              const curScroll = currentScroll + (scrollDelta * ease);

              pointer.style.left = `${curX}px`;
              pointer.style.top = `${swipeY}px`;
              jcSubMenu.scrollLeft = curScroll;

              if (progress < 1) {
                requestAnimationFrame(animateDrag);
              } else {
                jcSubMenu.scrollLeft = targetScrollLeft;
                resolve();
              }
            }
            requestAnimationFrame(animateDrag);
          });

          await wait(90);
          // 4. Lepaskan sentuhan (Release touch)
          pointer.classList.remove('clicking');
          await wait(140);
        }

        // 5. Pointer bergerak presisi ke target chip yang telah bergeser dan menekan chip
        await movePointerToElement(targetChip, 380);
        await simulateClick(200);

        chips.forEach(c => c.classList.remove('active'));
        targetChip.classList.add('active');

        const mode = targetChip.getAttribute('data-mode');
        if (chatInput) {
          if (mode === 'sumber-daya') chatInput.placeholder = 'Sebutkan skill/aset lokal yang kamu punya...';
          else if (mode === 'celah-masalah') chatInput.placeholder = 'Tanya celah masalah/kebutuhan lokal sekitar...';
          else if (mode === 'analisis') chatInput.placeholder = 'Minta alur operasional/SOP teknis usaha...';
          else if (mode === 'simulasi-modal') chatInput.placeholder = 'Tanya simulasi modal awal & proyeksi omzet...';
          else if (mode === 'simulasi-lapangan-kerja') chatInput.placeholder = 'Simulasi penyerapan tenaga kerja lokal...';
        }
        await wait(220);
      }

      async function runSimulationCycle() {
        while (isAutoplayRunning) {
          // 0. RESET STATE
          if (chatbotOverlay) chatbotOverlay.classList.add('hidden');
          if (jcSubMenu) {
            jcSubMenu.classList.add('hidden');
            jcSubMenu.scrollTo({ left: 0, behavior: 'auto' });
          }
          if (mainJcToggle) mainJcToggle.classList.remove('active');
          if (chatInput) chatInput.value = '';
          if (chatMessages) {
            chatMessages.innerHTML = `
              <div class="message bot">
                <div class="bubble">Halo! Aktifkan mode Cipta Kerja untuk menganalisis potensi usaha dari skill, celah masalah, modal, hingga lapangan kerja.</div>
              </div>
            `;
          }
          leafletMapJobMode.setView(initialCoords, initialZoom, { animate: false });

          await movePointerTo(165, 300, 400);
          await wait(800);

          // 1. BUKA CHATBOT
          if (chatbotBtn) {
            await movePointerToElement(chatbotBtn, 800);
            await simulateClick();
            if (chatbotOverlay) chatbotOverlay.classList.remove('hidden');
          }
          await wait(600);

          // 2. KLIK TOMBOL "CIPTA KERJA" DI HEADER CHATBOT
          if (mainJcToggle) {
            await movePointerToElement(mainJcToggle, 700);
            await simulateClick();
            mainJcToggle.classList.add('active');
            if (jcSubMenu) jcSubMenu.classList.remove('hidden');
          }
          await wait(600);

          // ====================================================================
          // MODE 1: SKILL & SUMBER DAYA (Swipe to position 0)
          // ====================================================================
          if (chipSumberDaya) {
            await swipeChipsTo(chipSumberDaya, 0);
          }
          await wait(250);

          if (chatInput) {
            await movePointerToElement(chatInput, 600);
            await simulateClick(100);
            await simulateType(chatInput, 'Saya menganggur namun punya skill memperbaiki rice cooker dan alat dapur elektronik, apa peluang usaha yang cocok di Balikpapan?', 16);
          }
          await wait(200);

          if (sendChatBtn) {
            await movePointerToElement(sendChatBtn, 500);
            await simulateClick();
          }

          appendChatMessage('user', 'Saya menganggur namun punya skill memperbaiki rice cooker dan alat dapur elektronik, apa peluang usaha yang cocok di Balikpapan?');
          if (chatInput) chatInput.value = '';
          await wait(700);

          appendChatMessage('bot', `
            <strong>Analisis Skill & Sumber Daya (Mode 1):</strong><br>
            Keahlian servis rice cooker & peralatan dapur memiliki potensi serapan pasar tinggi di area pemukiman padat RT 18-24 Damai. Rekomendasi usaha: <strong>Jasa Servis Elektronik Dapur Keliling / Home Service</strong> dengan target perumahan warga dan kos-kosan pekerja.
          `);
          await wait(1800);

          // ====================================================================
          // MODE 2: CELAH MASALAH & KEBUTUHAN (Geser horizontal chips ke chip 2)
          // ====================================================================
          if (chipCelahMasalah) {
            await swipeChipsTo(chipCelahMasalah);
          }
          await wait(250);

          if (chatInput) {
            await movePointerToElement(chatInput, 600);
            await simulateClick(100);
            await simulateType(chatInput, 'Apa celah masalah dan kebutuhan warga sekitar terkait servis alat dapur?', 16);
          }
          await wait(200);

          if (sendChatBtn) {
            await movePointerToElement(sendChatBtn, 500);
            await simulateClick();
          }

          appendChatMessage('user', 'Apa celah masalah dan kebutuhan warga sekitar terkait servis alat dapur?');
          if (chatInput) chatInput.value = '';
          await wait(700);

          appendChatMessage('bot', `
            <strong>Celah Masalah & Kebutuhan Wilayah (Mode 2):</strong><br>
            Data spasial mencatat 450+ KK di radius 800m. Masalah utama: belum ada bengkel servis kelistrikan dapur kilat; warga terpaksa membeli baru atau menempuh jarak 4km ke pusat kota. Celah pasar: <em>Layanan antar-jemput rice cooker rusak dengan garansi 1 bulan</em>.
          `);
          await wait(1800);

          // ====================================================================
          // MODE 3: ANALISIS TEKNIS (Geser horizontal chips ke chip 3)
          // ====================================================================
          if (chipAnalisis) {
            await swipeChipsTo(chipAnalisis);
          }
          await wait(250);

          if (chatInput) {
            await movePointerToElement(chatInput, 600);
            await simulateClick(100);
            await simulateType(chatInput, 'Bagaimana alur teknis dan SOP operasional servis rice cooker?', 16);
          }
          await wait(200);

          if (sendChatBtn) {
            await movePointerToElement(sendChatBtn, 500);
            await simulateClick();
          }

          appendChatMessage('user', 'Bagaimana alur teknis dan SOP operasional servis rice cooker?');
          if (chatInput) chatInput.value = '';
          await wait(700);

          appendChatMessage('bot', `
            <strong>Alur Operasional & Teknis (Mode 3):</strong><br>
            1. <em>Pemeriksaan Termal & Fuse:</em> Cek tahanan elemen pemanas dan thermostat otomatis.<br>
            2. <em>Penggantian Komponen:</em> Ganti switch bimetal & kabel isolasi anti-panas standar SNI.<br>
            3. <em>Quality Control:</em> Uji penanak & penghangat 15 menit sebelum serah terima.
          `);
          await wait(1800);

          // ====================================================================
          // MODE 4: SIMULASI MODAL & KELAYAKAN (Geser horizontal chips ke chip 4)
          // ====================================================================
          if (chipSimulasiModal) {
            await swipeChipsTo(chipSimulasiModal);
          }
          await wait(250);

          if (chatInput) {
            await movePointerToElement(chatInput, 600);
            await simulateClick(100);
            await simulateType(chatInput, 'Berapa estimasi modal awal dan proyeksi omzet bulanan?', 16);
          }
          await wait(200);

          if (sendChatBtn) {
            await movePointerToElement(sendChatBtn, 500);
            await simulateClick();
          }

          appendChatMessage('user', 'Berapa estimasi modal awal dan proyeksi omzet bulanan?');
          if (chatInput) chatInput.value = '';
          await wait(700);

          appendChatMessage('bot', `
            <strong>Simulasi Finansial & Modal Usaha (Mode 4):</strong><br>
            • <strong>Modal Awal (CAPEX):</strong> Rp 1.250.000 (Multitester, solder, obeng set, stok thermal fuse & thermostat)<br>
            • <strong>Proyeksi Omzet:</strong> 4 unit/hari × Rp 45.000 = Rp 5.400.000 / bulan<br>
            • <strong>Laba Bersih & BEP:</strong> Estimasi profit Rp 4.100.000/bln dengan Payback Period <strong>10 hari</strong>.
          `);
          await wait(1800);

          // ====================================================================
          // MODE 5: SIMULASI LAPANGAN KERJA (Geser horizontal chips ke chip 5)
          // ====================================================================
          if (chipSimulasiKerja) {
            await swipeChipsTo(chipSimulasiKerja);
          }
          await wait(250);

          if (chatInput) {
            await movePointerToElement(chatInput, 600);
            await simulateClick(100);
            await simulateType(chatInput, 'Bagaimana potensi penyerapan tenaga kerja jika usaha berkembang?', 16);
          }
          await wait(200);

          if (sendChatBtn) {
            await movePointerToElement(sendChatBtn, 500);
            await simulateClick();
          }

          appendChatMessage('user', 'Bagaimana potensi penyerapan tenaga kerja jika usaha berkembang?');
          if (chatInput) chatInput.value = '';
          await wait(700);

          appendChatMessage('bot', `
            <strong>Simulasi Penyerapan Lapangan Kerja (Mode 5):</strong><br>
            Jika volume servis meluas ke kelurahan tetangga, model usaha dapat menyerap: <strong>2 Teknisi Magang</strong> (lulusan SMK lokal) + <strong>1 Kurir Antar-Jemput</strong>. Proyeksi kontribusi menurunkan angka pengangguran usia produktif di tingkat RT/Kelurahan.
          `);

          // Hold to read all 5 modes
          await wait(6000);

          // Close chatbot and loop
          if (chatbotOverlay) chatbotOverlay.classList.add('hidden');
          await wait(1000);
        }
      }

      setTimeout(() => {
        runSimulationCycle();
      }, 1000);
    }

    initJobModeAutoplayLoop();
  }

  // ==========================================================================
  // CARD 8: VIEW (HALAMAN PROMOSI & VISUAL BUILDER AUTOPLAY)
  // ==========================================================================
  function initViewPromotionBuilderSpatialGIS() {
    const mapEl = document.getElementById('mapView');
    if (!mapEl || typeof L === 'undefined') return;

    const initialCoords = [-1.2420, 116.8590];
    const initialZoom = 15;

    const leafletMapView = L.map('mapView', {
      zoomControl: false,
      attributionControl: false
    }).setView(initialCoords, initialZoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(leafletMapView);

    function createActorIcon(iconUrl) {
      return L.icon({
        iconUrl: iconUrl,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32]
      });
    }

    // HR Consultant Data
    const hrData = {
      name: 'Konsultan HR & Rekrutmen Nusantara',
      category: 'Usaha',
      iconUrl: '../static/image/actor/usaha.svg',
      address: 'Jl. Jenderal Sudirman No. 45, Klandasan Ilir, Balikpapan',
      lat: -1.2420,
      lng: 116.8590
    };

    const hrPopupHTML = `
      <div class="actor-popup" data-actor-id="aktorUsaha" data-unique-id="HR01" id="actorPopupHrView">
        <div class="actor-popup-header">${hrData.name}</div>
        <div class="actor-popup-content">
          <div class="actor-popup-visual-wrapper">
            <img src="img/konsultan-hr.svg" class="actor-popup-visual" alt="Konsultan HR" />
          </div>
          <div class="actor-location-wrapper">
            <div class="actor-address">${hrData.address}</div>
            <div class="actor-coord">${hrData.lat.toFixed(5)}, ${hrData.lng.toFixed(5)}</div>
          </div>
        </div>
        <div class="actor-popup-actions">
          <button type="button" class="actor-btn view-actor" id="btnViewActorHrView" title="Lihat Halaman Promosi">
            <img src="../static/image/icon/view.svg" class="emoji-img" alt="Lihat" />
          </button>
          <button type="button" class="actor-btn edit-actor" title="Edit">
            <img src="../static/image/icon/edit.svg" class="emoji-img" alt="Edit" />
          </button>
          <button type="button" class="actor-btn delete-actor" title="Hapus">
            <img src="../static/image/icon/delete.svg" class="emoji-img" alt="Hapus" />
          </button>
        </div>
      </div>
    `;

    const hrMarker = L.marker([hrData.lat, hrData.lng], {
      icon: createActorIcon(hrData.iconUrl)
    }).addTo(leafletMapView);

    hrMarker.bindPopup(hrPopupHTML, {
      maxWidth: 240,
      className: 'custom-actor-leaflet-popup'
    });

    // Ambient background markers
    const akuntanMarker = L.marker([-1.2465, 116.8640], {
      icon: createActorIcon('../static/image/actor/usaha.svg')
    }).addTo(leafletMapView);
    akuntanMarker.bindPopup(`<strong>Kantor Akuntan Publik &amp; Pajak</strong><br>Jl. MT Haryono No. 18`);

    const notarisMarker = L.marker([-1.2380, 116.8530], {
      icon: createActorIcon('../static/image/actor/usaha.svg')
    }).addTo(leafletMapView);
    notarisMarker.bindPopup(`<strong>Kantor Notaris &amp; PPAT</strong><br>Jl. Jend. Sudirman No. 82`);

    // Zoom controls
    const zoomInBtn = document.getElementById('zoomInView');
    const zoomOutBtn = document.getElementById('zoomOutView');
    if (zoomInBtn) zoomInBtn.onclick = () => leafletMapView.zoomIn();
    if (zoomOutBtn) zoomOutBtn.onclick = () => leafletMapView.zoomOut();

    // ==========================================================================
    // AUTOPLAY SIMULATION FOR VIEW & VISUAL BUILDER (CARD 8)
    // ==========================================================================
    function initViewAutoplayLoop() {
      const appRoot = document.getElementById('appRootView');
      const pointer = document.getElementById('simulatedPointerView');
      const promoOverlay = document.getElementById('promoBuilderContainerView');
      const toolboxRow = document.getElementById('toolboxRowView');
      const toolboxScroll = document.getElementById('toolboxScrollView');
      const canvasWorkspace = document.getElementById('canvasWorkspaceView');
      const canvas = document.getElementById('canvasView');
      const propertiesDrawer = document.getElementById('propertiesDrawerView');
      const saveToast = document.getElementById('saveToastView');

      const btnToggleLayers = document.getElementById('btnToggleLayersView');
      const btnPalette = document.getElementById('btnPaletteView');
      const btnUIKit = document.getElementById('btnUIKitView');
      const btnToggleMode = document.getElementById('btnToggleModeView');
      const modeIcon = document.getElementById('modeIconView');
      const btnSave = document.getElementById('btnSaveView');
      const btnBackToMap = document.getElementById('btnBackToMapView');
      const closePropertiesDrawer = document.getElementById('closePropertiesDrawerView');
      const propColorSwatch = document.getElementById('propColorSwatchView');

      // Toolbox chips
      const chipContainer = document.getElementById('chipToolContainerView');
      const chipTitle = document.getElementById('chipToolTitleView');
      const chipText = document.getElementById('chipToolTextView');
      const chipRow = document.getElementById('chipToolRowView');
      const chipBox = document.getElementById('chipToolBoxView');
      const chipImage = document.getElementById('chipToolImageView');
      const chipButton = document.getElementById('chipToolButtonView');

      if (!appRoot || !pointer || !leafletMapView) return;

      let isAutoplayRunning = true;
      const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      function movePointerTo(targetX, targetY, duration = 800) {
        return new Promise(resolve => {
          pointer.style.transition = `top ${duration}ms cubic-bezier(0.25, 1, 0.5, 1), left ${duration}ms cubic-bezier(0.25, 1, 0.5, 1), transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)`;
          pointer.style.left = `${targetX}px`;
          pointer.style.top = `${targetY}px`;
          setTimeout(resolve, duration);
        });
      }

      function movePointerToElement(el, duration = 800) {
        if (!el) return Promise.resolve();
        const appRect = appRoot.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        let targetX = elRect.left - appRect.left + (elRect.width / 2);
        let targetY = elRect.top - appRect.top + (elRect.height / 2);
        targetX = Math.max(10, Math.min(appRect.width - 10, targetX));
        targetY = Math.max(10, Math.min(appRect.height - 10, targetY));
        return movePointerTo(targetX, targetY, duration);
      }

      async function simulateClick(holdMs = 250) {
        pointer.classList.add('clicking');
        await wait(holdMs);
        pointer.classList.remove('clicking');
        await wait(100);
      }

      // Visible horizontal touch-drag gesture on toolbox strip
      async function swipeToolboxTo(targetChip, targetScrollLeft) {
        if (!toolboxScroll || !targetChip) return;

        if (targetScrollLeft === undefined) {
          targetScrollLeft = Math.max(0, targetChip.offsetLeft - 16);
        }

        const currentScroll = toolboxScroll.scrollLeft;
        const scrollDelta = targetScrollLeft - currentScroll;

        // Jika chip berada di posisi yang memerlukan geseran, lakukan gestur sentuh geser horizontal
        if (Math.abs(scrollDelta) > 10) {
          const appRect = appRoot.getBoundingClientRect();
          const tbRect = toolboxScroll.getBoundingClientRect();
          const swipeY = (tbRect.top - appRect.top) + (tbRect.height / 2);

          let startX, endX;
          if (scrollDelta > 0) {
            // Geser ke kiri (Swipe jari kanan ke kiri)
            startX = Math.min(appRect.width - 35, 260);
            endX = Math.max(25, startX - Math.min(Math.abs(scrollDelta) * 0.85 + 35, 180));
          } else {
            // Geser ke kanan (Swipe jari kiri ke kanan)
            startX = 35;
            endX = Math.min(appRect.width - 35, startX + Math.min(Math.abs(scrollDelta) * 0.85 + 35, 180));
          }

          // 1. Gerakkan jari ke barisan toolbox
          await movePointerTo(startX, swipeY, 380);
          await wait(70);

          // 2. Sentuh barisan toolbox (Press down)
          pointer.classList.add('clicking');
          await wait(100);

          // 3. Tarik toolbox secara horizontal bersamaan dengan pergeseran scrollLeft
          const dragDuration = 460;
          const startTime = performance.now();
          pointer.style.transition = 'none';

          await new Promise(resolve => {
            function animateTbDrag(now) {
              const elapsed = now - startTime;
              const progress = Math.min(1, elapsed / dragDuration);
              const ease = 1 - Math.pow(1 - progress, 3);
              const curX = startX + (endX - startX) * ease;
              const curScroll = currentScroll + (scrollDelta * ease);

              pointer.style.left = `${curX}px`;
              pointer.style.top = `${swipeY}px`;
              toolboxScroll.scrollLeft = curScroll;

              if (progress < 1) {
                requestAnimationFrame(animateTbDrag);
              } else {
                toolboxScroll.scrollLeft = targetScrollLeft;
                resolve();
              }
            }
            requestAnimationFrame(animateTbDrag);
          });

          await wait(70);
          pointer.classList.remove('clicking');
          await wait(110);
        }
      }

      // Natural drag & drop directly from toolbox chip to canvas
      async function simulateDragAndDrop(sourceChipEl, targetCanvasX, targetCanvasY, onDropCallback) {
        if (!sourceChipEl) return;

        // Geser toolbox terlebih dahulu agar chip terlihat jelas
        await swipeToolboxTo(sourceChipEl);

        await movePointerToElement(sourceChipEl, 380);
        await wait(80);

        pointer.classList.add('clicking');
        await wait(100);

        const appRect = appRoot.getBoundingClientRect();
        const chipRect = sourceChipEl.getBoundingClientRect();
        const startX = chipRect.left - appRect.left + (chipRect.width / 2);
        const startY = chipRect.top - appRect.top + (chipRect.height / 2);

        const dragDuration = 480;
        const startTime = performance.now();
        pointer.style.transition = 'none';

        await new Promise(resolve => {
          function animateDrag(now) {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / dragDuration);
            const ease = 1 - Math.pow(1 - progress, 3);
            const curX = startX + (targetCanvasX - startX) * ease;
            const curY = startY + (targetCanvasY - startY) * ease;

            pointer.style.left = `${curX}px`;
            pointer.style.top = `${curY}px`;

            if (progress < 1) {
              requestAnimationFrame(animateDrag);
            } else {
              resolve();
            }
          }
          requestAnimationFrame(animateDrag);
        });

        await wait(70);
        pointer.classList.remove('clicking');
        await wait(80);

        if (onDropCallback) onDropCallback();
        await wait(260);
      }

      async function runSimulationCycle() {
        while (isAutoplayRunning) {
          // 0. RESET STATE: In Preview mode, only 1 tool icon (edit_builder.svg) is visible
          if (promoOverlay) promoOverlay.classList.add('hidden');
          if (toolboxRow) toolboxRow.classList.add('hidden');
          if (toolboxScroll) toolboxScroll.scrollTo({ left: 0, behavior: 'auto' });
          if (propertiesDrawer) propertiesDrawer.classList.add('hidden');
          if (btnToggleLayers) btnToggleLayers.classList.add('hidden');
          if (btnPalette) btnPalette.classList.add('hidden');
          if (btnUIKit) btnUIKit.classList.add('hidden');
          if (btnSave) btnSave.classList.add('hidden');
          if (saveToast) saveToast.classList.add('hidden');
          if (modeIcon) modeIcon.src = '../static/image/icon/edit_builder.svg';
          leafletMapView.closePopup();
          leafletMapView.setView(initialCoords, initialZoom, { animate: false });

          if (canvas) {
            canvas.innerHTML = `
              <div style="text-align: center; color: #94a3b8; font-size: 11px; padding: 40px 10px; border: 2px dashed #cbd5e1; border-radius: 12px;" id="emptyCanvasGuideView">
                Tarik elemen dari toolbox di atas untuk mulai mendesain halaman promosi
              </div>
            `;
          }

          await movePointerTo(165, 300, 400);
          await wait(700);

          // 1. KLIK MARKER KONSULTAN HR PADA PETA
          const markerPos = leafletMapView.latLngToContainerPoint([hrData.lat, hrData.lng]);
          await movePointerTo(markerPos.x, markerPos.y - 12, 750);
          await simulateClick();
          hrMarker.openPopup();
          await wait(900);

          // 2. KLIK TOMBOL VIEW (view.svg) DI DALAM POPUP AKTOR
          const btnViewActor = document.getElementById('btnViewActorHrView') || document.querySelector('#actorPopupHrView .view-actor');
          if (btnViewActor) {
            await movePointerToElement(btnViewActor, 700);
            await simulateClick();
          }

          leafletMapView.closePopup();
          if (promoOverlay) promoOverlay.classList.remove('hidden');
          // Pastikan saat preview hanya ada 1 icon edit di kanan header
          if (btnToggleLayers) btnToggleLayers.classList.add('hidden');
          if (btnPalette) btnPalette.classList.add('hidden');
          if (btnUIKit) btnUIKit.classList.add('hidden');
          if (btnSave) btnSave.classList.add('hidden');
          if (toolboxRow) toolboxRow.classList.add('hidden');
          if (toolboxScroll) toolboxScroll.scrollTo({ left: 0, behavior: 'auto' });
          await wait(800);

          // 3. KLIK TOMBOL "EDIT" (edit_builder.svg) DI HEADER HALAMAN PROMOSI
          if (btnToggleMode) {
            await movePointerToElement(btnToggleMode, 650);
            await simulateClick();
            // Saat mode edit aktif, munculkan seluruh tools header & toolbox row
            if (btnToggleLayers) btnToggleLayers.classList.remove('hidden');
            if (btnPalette) btnPalette.classList.remove('hidden');
            if (btnUIKit) btnUIKit.classList.remove('hidden');
            if (btnSave) btnSave.classList.remove('hidden');
            if (toolboxRow) toolboxRow.classList.remove('hidden');
            if (modeIcon) modeIcon.src = '../static/image/icon/view.svg';
          }
          await wait(700);

          // 4. DRAG & DROP ELEMEN KE CANVAS SATU PER SATU DENGAN GESTUR GESER TOOLBOX
          // ====================================================================
          // A. DRAG KONTAINER
          // ====================================================================
          await simulateDragAndDrop(
            chipContainer,
            165, 180,
            () => {
              if (canvas) {
                canvas.innerHTML = `
                  <div class="builder-card-container" id="hrMainContainerView">
                    <div style="font-size: 10px; color: #94a3b8; text-align: center; padding: 12px; border: 1.5px dashed #e2e8f0; border-radius: 8px;" id="containerDropPlaceholderView">
                      Dropzone Kontainer Aktif
                    </div>
                  </div>
                `;
              }
            }
          );

          // ====================================================================
          // B. DRAG TEKS / JUDUL
          // ====================================================================
          await simulateDragAndDrop(
            chipTitle,
            165, 160,
            () => {
              const mainCont = document.getElementById('hrMainContainerView');
              const placeholder = document.getElementById('containerDropPlaceholderView');
              if (placeholder) placeholder.remove();
              if (mainCont) {
                const titleBlock = document.createElement('div');
                titleBlock.className = 'builder-title-block';
                titleBlock.id = 'hrTitleBlockView';
                titleBlock.innerHTML = `
                  <div class="builder-badge-tag">
                    <span>Konsultan SDM</span>
                  </div>
                  <h3 class="builder-main-title">Solusi Talenta &amp; Optimalisasi SDM Profesional</h3>
                  <p class="builder-main-desc">Membantu rekrutmen talenta terbaik, asesmen kompetensi, dan pelatihan tim korporasi di Balikpapan &amp; IKN.</p>
                `;
                mainCont.appendChild(titleBlock);
              }
            }
          );

          // ====================================================================
          // C. DRAG BARIS LAYOUT (Geser toolbox ke Baris)
          // ====================================================================
          await simulateDragAndDrop(
            chipRow,
            165, 250,
            () => {
              const mainCont = document.getElementById('hrMainContainerView');
              if (mainCont) {
                const rowFlex = document.createElement('div');
                rowFlex.className = 'builder-row-flex';
                rowFlex.id = 'hrRowFlexView';
                rowFlex.innerHTML = `
                  <div id="hrColLeftView" style="display: flex; flex-direction: column; gap: 6px;"></div>
                  <div id="hrColRightView" style="display: flex; flex-direction: column; gap: 6px;"></div>
                `;
                mainCont.appendChild(rowFlex);
              }
            }
          );

          // ====================================================================
          // D. DRAG BOX FITUR / METRIK (Geser toolbox ke Box)
          // ====================================================================
          await simulateDragAndDrop(
            chipBox,
            100, 260,
            () => {
              const colLeft = document.getElementById('hrColLeftView');
              if (colLeft) {
                colLeft.innerHTML = `
                  <div class="builder-metric-box">
                    <div class="metric-item"><span class="metric-dot"></span> 98.5% Akurasi Talenta</div>
                    <div class="metric-item"><span class="metric-dot"></span> 1.500+ Kandidat Siap</div>
                    <div class="metric-item"><span class="metric-dot"></span> Sertifikasi BNSP</div>
                  </div>
                `;
              }
            }
          );

          // ====================================================================
          // E. DRAG GAMBAR / ILUSTRASI (Geser toolbox ke Gambar)
          // ====================================================================
          await simulateDragAndDrop(
            chipImage,
            230, 260,
            () => {
              const colRight = document.getElementById('hrColRightView');
              if (colRight) {
                colRight.innerHTML = `
                  <div class="builder-img-block">
                    <img src="img/konsultan-hr.svg" style="width: 100%; max-width: 72px; height: 64px; object-fit: contain; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.12));" alt="Konsultan HR" />
                  </div>
                `;
              }
            }
          );

          // ====================================================================
          // F. DRAG TOMBOL CALL-TO-ACTION (Geser toolbox ke Tombol)
          // ====================================================================
          await simulateDragAndDrop(
            chipButton,
            165, 335,
            () => {
              const mainCont = document.getElementById('hrMainContainerView');
              if (mainCont) {
                const btnEl = document.createElement('button');
                btnEl.type = 'button';
                btnEl.className = 'builder-cta-btn';
                btnEl.id = 'elHrCtaButtonView';
                btnEl.innerHTML = `
                  <img src="../static/image/icon/whatsapp.svg" width="14" height="14" style="filter: brightness(0) invert(1);" alt="" />
                  <span>Konsultasi HR Gratis (WhatsApp)</span>
                `;
                mainCont.appendChild(btnEl);
              }
            }
          );
          await wait(600);

          // 5. KLIK ELEMEN TOMBOL UNTUK MEMBUKA PENGATURAN PANEL (WARNA, UKURAN, RADIUS)
          const targetBtn = document.getElementById('elHrCtaButtonView');
          if (targetBtn) {
            await movePointerToElement(targetBtn, 500);
            await simulateClick();
            targetBtn.classList.add('builder-selected-outline');
            targetBtn.innerHTML += `
              <div class="resize-handle tl"></div>
              <div class="resize-handle tr"></div>
              <div class="resize-handle bl"></div>
              <div class="resize-handle br"></div>
            `;
            if (propertiesDrawer) propertiesDrawer.classList.remove('hidden');
          }
          await wait(900);

          // DEMO PENGATURAN: KLIK PALET WARNA DI DALAM DRAWER
          if (propColorSwatch) {
            await movePointerToElement(propColorSwatch, 600);
            await simulateClick();
            if (targetBtn) {
              targetBtn.style.background = 'linear-gradient(135deg, #0284c7, #0F4C75)';
              targetBtn.style.borderRadius = '14px';
            }
          }
          await wait(1200);

          // TUTUP DRAWER PENGATURAN
          if (closePropertiesDrawer) {
            await movePointerToElement(closePropertiesDrawer, 500);
            await simulateClick();
            if (propertiesDrawer) propertiesDrawer.classList.add('hidden');
            if (targetBtn) {
              targetBtn.classList.remove('builder-selected-outline');
              targetBtn.querySelectorAll('.resize-handle').forEach(h => h.remove());
            }
          }
          await wait(600);

          // 6. KLIK TOMBOL SAVE (save.svg) DI HEADER
          if (btnSave) {
            await movePointerToElement(btnSave, 600);
            await simulateClick();

            // Tampilkan toast notifikasi berhasil simpan
            if (saveToast) saveToast.classList.remove('hidden');
            // Kembali ke preview mode (hanya 1 icon edit di kanan header)
            if (toolboxRow) toolboxRow.classList.add('hidden');
            if (btnToggleLayers) btnToggleLayers.classList.add('hidden');
            if (btnPalette) btnPalette.classList.add('hidden');
            if (btnUIKit) btnUIKit.classList.add('hidden');
            if (btnSave) btnSave.classList.add('hidden');
            if (modeIcon) modeIcon.src = '../static/image/icon/edit_builder.svg';
            await wait(1800);
            if (saveToast) saveToast.classList.add('hidden');
          }

          // Move pointer to bottom right to showcase completed page
          await movePointerTo(290, 480, 500);

          // Tahan tampilan hasil halaman promosi selama 5.5 detik
          await wait(5500);

          // Kembali ke peta untuk looping berikutnya
          if (btnBackToMap) {
            await movePointerToElement(btnBackToMap, 600);
            await simulateClick();
            if (promoOverlay) promoOverlay.classList.add('hidden');
          }
          await wait(1000);
        }
      }

      setTimeout(() => {
        runSimulationCycle();
      }, 1000);
    }

    initViewAutoplayLoop();
  }

  // 9. Initialize GenUI Chatbot Spatial GIS & Autoplay Simulation Loop
  function initGenUISpatialGIS() {
    const mapContainer = document.getElementById('mapGenUI');
    if (!mapContainer || typeof L === 'undefined') return;

    const initialCoords = [-1.2440, 116.8620];
    const initialZoom = 14;

    const leafletMapGenUI = L.map('mapGenUI', {
      zoomControl: false,
      attributionControl: false
    }).setView(initialCoords, initialZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(leafletMapGenUI);

    const zoomIn = document.getElementById('zoomInGenUI');
    const zoomOut = document.getElementById('zoomOutGenUI');
    if (zoomIn) zoomIn.addEventListener('click', (e) => { e.stopPropagation(); leafletMapGenUI.zoomIn(); });
    if (zoomOut) zoomOut.addEventListener('click', (e) => { e.stopPropagation(); leafletMapGenUI.zoomOut(); });

    // Business Actor Marker: Sentra Retail & Karir Nusantara
    const retailIcon = L.icon({
      iconUrl: '../static/image/actor/usaha.svg',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });

    const retailData = {
      name: 'Sentra Retail & Karir Nusantara',
      address: 'Jl. MT Haryono No. 88, Balikpapan',
      lat: -1.2440,
      lng: 116.8620
    };

    const retailMarker = L.marker([retailData.lat, retailData.lng], { icon: retailIcon }).addTo(leafletMapGenUI);

    const popupHtml = `
      <div class="actor-popup" data-actor-id="aktorUsaha" data-unique-id="RETAIL01" id="actorPopupGenUI">
        <div class="actor-popup-header">${retailData.name}</div>
        <div class="actor-popup-content">
          <div class="actor-popup-visual-wrapper">
            <img src="img/sentra.svg" class="actor-popup-visual" alt="Foto Visual" />
          </div>
          <div class="actor-location-wrapper">
            <div class="actor-address">${retailData.address}</div>
            <div class="actor-coord">${retailData.lat.toFixed(5)}, ${retailData.lng.toFixed(5)}</div>
          </div>
        </div>
        <div class="actor-popup-actions">
          <button type="button" class="actor-btn view-actor" id="btnViewActorGenUI" title="Lihat Halaman Promosi">
            <img src="../static/image/icon/view.svg" class="emoji-img" alt="Lihat" />
          </button>
          <button type="button" class="actor-btn edit-actor" title="Edit">
            <img src="../static/image/icon/edit.svg" class="emoji-img" alt="Edit" />
          </button>
          <button type="button" class="actor-btn delete-actor" title="Hapus">
            <img src="../static/image/icon/delete.svg" class="emoji-img" alt="Hapus" />
          </button>
        </div>
      </div>
    `;

    retailMarker.bindPopup(popupHtml, { maxWidth: 240, className: 'custom-actor-leaflet-popup' });

    // DOM References for Card 9 Builder
    const appRoot = document.getElementById('appRootGenUI');
    const pointer = document.getElementById('simulatedPointerGenUI');
    const promoOverlay = document.getElementById('promoBuilderContainerGenUI');
    const btnBackToMap = document.getElementById('btnBackToMapGenUI');
    const btnToggleLayers = document.getElementById('btnToggleLayersGenUI');
    const btnPalette = document.getElementById('btnPaletteGenUI');
    const btnUIKit = document.getElementById('btnUIKitGenUI');
    const btnToggleMode = document.getElementById('btnToggleModeGenUI');
    const modeIcon = document.getElementById('modeIconGenUI');
    const btnSave = document.getElementById('btnSaveGenUI');
    const toolboxRow = document.getElementById('toolboxRowGenUI');
    const toolboxScroll = document.getElementById('toolboxScrollGenUI');
    const canvas = document.getElementById('canvasGenUI');
    const propertiesDrawer = document.getElementById('propertiesDrawerGenUI');
    const closePropertiesDrawer = document.getElementById('closePropertiesDrawerGenUI');
    const saveToast = document.getElementById('saveToastGenUI');

    // Toolbox Chips
    const chipGenUI = document.getElementById('chipToolGenUIGenUI');

    // Drawer elements
    const propNameInput = document.getElementById('propChatbotNameGenUI');
    const propRadiusSlider = document.getElementById('propGenUIRadiusSlider');
    const propRadiusVal = document.getElementById('propGenUIRadiusVal');
    const propHeaderSwatch2 = document.getElementById('propGenUIHeaderSwatch2');
    const propBotSwatch2 = document.getElementById('propGenUIBotSwatch2');
    const propTempSlider = document.getElementById('propGenUITempSlider');
    const propTempVal = document.getElementById('propGenUITempVal');
    const btnUploadDoc = document.getElementById('btnUploadDocGenUI');
    const ragStatus = document.getElementById('ragDocUploadStatusGenUI');

    // Autoplay Controller for GenUI Chatbot Simulation
    function initGenUIAutoplayLoop() {
      if (!pointer || !appRoot) return;

      let isAutoplayRunning = true;
      const wait = ms => new Promise(r => setTimeout(r, ms));

      async function movePointerTo(targetX, targetY, duration = 500) {
        pointer.style.transition = `left ${duration}ms cubic-bezier(0.25, 1, 0.5, 1), top ${duration}ms cubic-bezier(0.25, 1, 0.5, 1)`;
        pointer.style.left = `${targetX}px`;
        pointer.style.top = `${targetY}px`;
        await wait(duration + 40);
      }

      async function movePointerToElement(element, duration = 500, offsetX = 0, offsetY = 0) {
        if (!element) return;
        const appRect = appRoot.getBoundingClientRect();
        const elRect = element.getBoundingClientRect();
        const targetX = elRect.left - appRect.left + (elRect.width / 2) + offsetX;
        const targetY = elRect.top - appRect.top + (elRect.height / 2) + offsetY;
        await movePointerTo(targetX, targetY, duration);
      }

      async function simulateClick(holdMs = 240) {
        pointer.classList.add('clicking');
        await wait(holdMs);
        pointer.classList.remove('clicking');
        await wait(100);
      }

      // Smooth horizontal swipe gesture on toolbox strip
      async function swipeToolboxTo(targetChip, targetScrollLeft) {
        if (!toolboxScroll || !targetChip) return;

        if (targetScrollLeft === undefined) {
          targetScrollLeft = Math.max(0, targetChip.offsetLeft - 16);
        }

        const currentScroll = toolboxScroll.scrollLeft;
        const scrollDelta = targetScrollLeft - currentScroll;

        if (Math.abs(scrollDelta) > 10) {
          const appRect = appRoot.getBoundingClientRect();
          const tbRect = toolboxScroll.getBoundingClientRect();
          const swipeY = (tbRect.top - appRect.top) + (tbRect.height / 2);

          let startX, endX;
          if (scrollDelta > 0) {
            startX = Math.min(appRect.width - 35, 260);
            endX = Math.max(25, startX - Math.min(Math.abs(scrollDelta) * 0.85 + 35, 190));
          } else {
            startX = 35;
            endX = Math.min(appRect.width - 35, startX + Math.min(Math.abs(scrollDelta) * 0.85 + 35, 190));
          }

          // 1. Move to toolbox strip
          await movePointerTo(startX, swipeY, 360);
          await wait(60);

          // 2. Press down
          pointer.classList.add('clicking');
          await wait(90);

          // 3. Drag toolbox horizontally
          const dragDuration = 460;
          const startTime = performance.now();
          pointer.style.transition = 'none';

          await new Promise(resolve => {
            function animateTbDrag(now) {
              const elapsed = now - startTime;
              const progress = Math.min(1, elapsed / dragDuration);
              const ease = 1 - Math.pow(1 - progress, 3);
              const curX = startX + (endX - startX) * ease;
              const curScroll = currentScroll + (scrollDelta * ease);

              pointer.style.left = `${curX}px`;
              pointer.style.top = `${swipeY}px`;
              toolboxScroll.scrollLeft = curScroll;

              if (progress < 1) {
                requestAnimationFrame(animateTbDrag);
              } else {
                toolboxScroll.scrollLeft = targetScrollLeft;
                resolve();
              }
            }
            requestAnimationFrame(animateTbDrag);
          });

          await wait(60);
          pointer.classList.remove('clicking');
          await wait(100);
        }
      }

      // Drag & drop chip directly to canvas
      async function simulateDragAndDrop(sourceChipEl, targetCanvasX, targetCanvasY, onDropCallback) {
        if (!sourceChipEl) return;

        await swipeToolboxTo(sourceChipEl);
        await movePointerToElement(sourceChipEl, 380);
        await wait(80);

        pointer.classList.add('clicking');
        await wait(100);

        const appRect = appRoot.getBoundingClientRect();
        const chipRect = sourceChipEl.getBoundingClientRect();
        const startX = chipRect.left - appRect.left + (chipRect.width / 2);
        const startY = chipRect.top - appRect.top + (chipRect.height / 2);

        const dragDuration = 480;
        const startTime = performance.now();
        pointer.style.transition = 'none';

        await new Promise(resolve => {
          function animateDrag(now) {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / dragDuration);
            const ease = 1 - Math.pow(1 - progress, 3);
            const curX = startX + (targetCanvasX - startX) * ease;
            const curY = startY + (targetCanvasY - startY) * ease;

            pointer.style.left = `${curX}px`;
            pointer.style.top = `${curY}px`;

            if (progress < 1) {
              requestAnimationFrame(animateDrag);
            } else {
              resolve();
            }
          }
          requestAnimationFrame(animateDrag);
        });

        await wait(70);
        pointer.classList.remove('clicking');
        await wait(80);

        if (onDropCallback) onDropCallback();
        await wait(240);
      }

      // Typing simulation
      async function simulateTyping(inputEl, text, charSpeed = 24) {
        if (!inputEl) return;
        inputEl.value = '';
        for (let i = 0; i < text.length; i++) {
          inputEl.value += text[i];
          await wait(charSpeed);
        }
      }

      async function runSimulationCycle() {
        while (isAutoplayRunning) {
          // 0. RESET STATE
          if (promoOverlay) promoOverlay.classList.add('hidden');
          if (toolboxRow) toolboxRow.classList.add('hidden');
          if (toolboxScroll) toolboxScroll.scrollTo({ left: 0, behavior: 'auto' });
          if (propertiesDrawer) propertiesDrawer.classList.add('hidden');
          if (btnToggleLayers) btnToggleLayers.classList.add('hidden');
          if (btnPalette) btnPalette.classList.add('hidden');
          if (btnUIKit) btnUIKit.classList.add('hidden');
          if (btnSave) btnSave.classList.add('hidden');
          if (saveToast) saveToast.classList.add('hidden');
          if (modeIcon) modeIcon.src = '../static/image/icon/edit_builder.svg';
          if (ragStatus) ragStatus.style.display = 'none';
          if (propNameInput) propNameInput.value = 'GenUI Assistant RAG';
          if (propRadiusSlider) propRadiusSlider.value = '12';
          if (propRadiusVal) propRadiusVal.textContent = '12';
          if (propTempSlider) propTempSlider.value = '0.3';
          if (propTempVal) propTempVal.textContent = '0.3';
          leafletMapGenUI.closePopup();
          leafletMapGenUI.setView(initialCoords, initialZoom, { animate: false });

          if (canvas) {
            canvas.innerHTML = `
              <div style="padding: 10px; display: flex; flex-direction: column; gap: 8px;" id="canvasContentGenUI">
                <div class="promo-hero-card" style="background: linear-gradient(135deg, #0F4C75, #38a0c4); padding: 12px; border-radius: 12px; color: #ffffff;">
                  <span class="promo-badge" style="background: #e0f2fe; color: #0369a1; font-size: 8.5px; font-weight: 800; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 3px;">Sentra Retail &amp; Karir 2211080</span>
                  <h3 style="font-size: 13.5px; font-weight: 800; margin: 0; color: #ffffff;">Pusat Distribusi &amp; Karir Nusantara</h3>
                  <p style="font-size: 9.5px; margin: 3px 0 0 0; opacity: 0.9; line-height: 1.35;">Katalog ritel modern terpadu dengan asisten kecerdasan buatan berbasis RAG dan info karir Balikpapan.</p>
                </div>
                <div id="genuiDropZone" style="min-height: 220px; border: 1.5px dashed #cbd5e1; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px; color: #94a3b8; font-size: 10.5px; text-align: center; gap: 4px;">
                  <span>Tarik elemen GenUI Chatbot ke area ini</span>
                </div>
              </div>
            `;
          }

          await movePointerTo(165, 300, 400);
          await wait(700);

          // 1. KLIK MARKER SENTRA RETAIL & KARIR PADA PETA
          const markerPos = leafletMapGenUI.latLngToContainerPoint([retailData.lat, retailData.lng]);
          await movePointerTo(markerPos.x, markerPos.y - 12, 750);
          await simulateClick();
          retailMarker.openPopup();
          await wait(900);

          // 2. KLIK TOMBOL VIEW (view.svg) DI DALAM POPUP AKTOR
          const btnViewActor = document.getElementById('btnViewActorGenUI') || document.querySelector('#actorPopupGenUI .view-actor');
          if (btnViewActor) {
            await movePointerToElement(btnViewActor, 700);
            await simulateClick();
          }

          leafletMapGenUI.closePopup();
          if (promoOverlay) promoOverlay.classList.remove('hidden');
          // In Preview Mode: only 1 tool icon (edit_builder.svg) in header right
          if (btnToggleLayers) btnToggleLayers.classList.add('hidden');
          if (btnPalette) btnPalette.classList.add('hidden');
          if (btnUIKit) btnUIKit.classList.add('hidden');
          if (btnSave) btnSave.classList.add('hidden');
          if (toolboxRow) toolboxRow.classList.add('hidden');
          if (toolboxScroll) toolboxScroll.scrollTo({ left: 0, behavior: 'auto' });
          await wait(800);

          // 3. KLIK TOMBOL "EDIT" (edit_builder.svg) DI HEADER
          if (btnToggleMode) {
            await movePointerToElement(btnToggleMode, 650);
            await simulateClick();
            if (btnToggleLayers) btnToggleLayers.classList.remove('hidden');
            if (btnPalette) btnPalette.classList.remove('hidden');
            if (btnUIKit) btnUIKit.classList.remove('hidden');
            if (btnSave) btnSave.classList.remove('hidden');
            if (toolboxRow) toolboxRow.classList.remove('hidden');
            if (modeIcon) modeIcon.src = '../static/image/icon/view.svg';
          }
          await wait(700);

          // 4. DRAG & DROP ELEMEN GENUI CHATBOT DARI TOOLBOX KE CANVAS
          await simulateDragAndDrop(
            chipGenUI,
            165, 230,
            () => {
              const dropZone = document.getElementById('genuiDropZone');
              if (dropZone) {
                dropZone.outerHTML = `
                  <div class="element-genui-chatbot-card" id="activeGenUICard" style="border-radius: 12px; box-shadow: 0 4px 16px rgba(15,76,117,0.12); border: 1.5px solid #bddce7; background: #ffffff; overflow: hidden; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
                    <div class="genui-bot-header" id="activeGenUIHeader" style="background: linear-gradient(135deg, #0F4C75, #38a0c4); padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; color: #ffffff; transition: background 0.3s ease;">
                      <div class="genui-bot-info" style="display: flex; align-items: center; gap: 7px;">
                        <div class="genui-bot-avatar" id="activeGenUIAvatar" style="width: 24px; height: 24px; background: rgba(255,255,255,0.22); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(255,255,255,0.3);">
                          
                        </div>
                        <div>
                          <div class="genui-bot-title-text" id="activeGenUITitle" style="font-size: 11px; font-weight: 700; color: #ffffff; line-height: 1.2;">GenUI Assistant RAG</div>
                          <div class="genui-bot-status" style="font-size: 8px; color: #a7f3d0; display: flex; align-items: center; gap: 3px;">
            
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="genui-bot-body" id="activeGenUIChatBody" style="padding: 8px; min-height: 140px; max-height: 175px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; background: #f8fafc; transition: all 0.3s ease;">
                      <div class="genui-bubble genui-bubble-ai" id="activeGenUIFirstBubble" style="background: #38a0c4; color: #ffffff; padding: 6px 9px; border-radius: 10px 10px 10px 2px; font-size: 10px; line-height: 1.35; max-width: 88%; transition: background 0.3s ease;">
                        Halo! Saya Asisten AI Sentra Retail &amp; Karir. Tanyakan seputar katalog produk, promo diskon, atau info lowongan kerja!
                      </div>
                      <div class="genui-quick-chips" id="activeGenUIQuickChips" style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px;">
                        <button type="button" class="genui-quick-chip" id="chipKatalogGenUI" style="background: #ffffff; border: 1px solid #bddce7; color: #0F4C75; font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 10px; cursor: pointer;">Katalog Produk</button>
                        <button type="button" class="genui-quick-chip" id="chipPromoGenUI" style="background: #ffffff; border: 1px solid #bddce7; color: #0F4C75; font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 10px; cursor: pointer;">Promo Spesial</button>
                        <button type="button" class="genui-quick-chip" id="chipKarirGenUI" style="background: #ffffff; border: 1px solid #bddce7; color: #0F4C75; font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 10px; cursor: pointer;">Info Karir</button>
                      </div>
                    </div>
                    <div class="genui-input-bar" style="padding: 5px 8px; display: flex; gap: 5px; align-items: center; background: #ffffff; border-top: 1px solid #bddce7;">
                      <input type="text" class="genui-input-field" id="activeGenUIInputField" placeholder="Ketik pertanyaan seputar produk &amp; karir..." style="flex: 1; border: 1px solid #cbd5e1; border-radius: 8px; padding: 4px 7px; font-size: 10px; color: #0f172a; outline: none;" />
                      <button type="button" class="genui-send-btn" id="activeGenUISendBtn" style="background: linear-gradient(135deg, #0F4C75, #38a0c4); border: none; border-radius: 8px; padding: 5px 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <img src="../static/image/icon/send.svg" alt="Send" style="width: 11px; height: 11px; filter: brightness(0) invert(1);" />
                      </button>
                    </div>
                  </div>
                `;
              }
            }
          );
          await wait(600);

          // 5. KLIK ELEMEN GENUI CHATBOT UNTUK MEMBUKA PENGATURAN PANEL
          const genuiCard = document.getElementById('activeGenUICard');
          if (genuiCard) {
            await movePointerToElement(genuiCard, 500);
            await simulateClick();
            genuiCard.classList.add('builder-selected-outline');
            if (propertiesDrawer) propertiesDrawer.classList.remove('hidden');
          }
          await wait(800);

          // A. UBAH NAMA BOT PERSONA DI PANEL
          if (propNameInput) {
            await movePointerToElement(propNameInput, 500);
            await simulateClick();
            await simulateTyping(propNameInput, 'Sentra AI Smart Assistant 2026', 20);
            const botTitle = document.getElementById('activeGenUITitle');
            if (botTitle) {
              botTitle.textContent = 'Sentra AI Smart Assistant 2026';
            }
          }
          await wait(500);

          // B. UBAH SUDUT RADIUS & UKURAN LAYOUT WIDGET (BORDER RADIUS SLIDER)
          if (propRadiusSlider) {
            await movePointerToElement(propRadiusSlider, 500);
            await simulateClick();
            propRadiusSlider.value = '18';
            if (propRadiusVal) propRadiusVal.textContent = '18';
            if (genuiCard) {
              genuiCard.style.borderRadius = '18px';
              genuiCard.style.boxShadow = '0 8px 24px rgba(15,76,117,0.18)';
              const chatBody = document.getElementById('activeGenUIChatBody');
              if (chatBody) {
                chatBody.style.minHeight = '155px';
              }
            }
          }
          await wait(600);

          // C. UBAH WARNA SWATCH HEADER (Electric Teal Gradient)
          if (propHeaderSwatch2) {
            await movePointerToElement(propHeaderSwatch2, 550);
            await simulateClick();
            const botHeader = document.getElementById('activeGenUIHeader');
            if (botHeader) {
              botHeader.style.background = 'linear-gradient(135deg, #0F4C75 0%, #0284c7 60%, #38a0c4 100%)';
            }
          }
          await wait(500);

          // D. UBAH WARNA SWATCH BUBBLE BOT (Gradient Azure)
          if (propBotSwatch2) {
            await movePointerToElement(propBotSwatch2, 550);
            await simulateClick();
            const firstBubble = document.getElementById('activeGenUIFirstBubble');
            if (firstBubble) {
              firstBubble.style.background = 'linear-gradient(135deg, #0284c7, #38a0c4)';
              firstBubble.style.borderRadius = '14px 14px 14px 2px';
            }
          }
          await wait(600);

          // E. UBAH TEMPERATURE MODEL AI
          if (propTempSlider) {
            await movePointerToElement(propTempSlider, 500);
            await simulateClick();
            propTempSlider.value = '0.3';
            if (propTempVal) propTempVal.textContent = '0.3';
          }
          await wait(500);

          // F. KLIK "UPLOAD DOKUMEN RAG" UNTUK INDEXING VECTOR PINECONE
          if (btnUploadDoc) {
            await movePointerToElement(btnUploadDoc, 600);
            await simulateClick();
            if (ragStatus) {
              ragStatus.style.display = 'block';
              ragStatus.innerHTML = `[OK] Katalog_Retail_dan_Karir_2026.pdf (48 Chunks terindeks Pinecone)`;
            }
          }
          await wait(1100);

          // G. TUTUP DRAWER PENGATURAN
          if (closePropertiesDrawer) {
            await movePointerToElement(closePropertiesDrawer, 500);
            await simulateClick();
            if (propertiesDrawer) propertiesDrawer.classList.add('hidden');
            if (genuiCard) {
              genuiCard.classList.remove('builder-selected-outline');
            }
          }
          await wait(600);

          // 6. KLIK TOMBOL SAVE (save.svg) DI HEADER
          if (btnSave) {
            await movePointerToElement(btnSave, 600);
            await simulateClick();

            if (saveToast) saveToast.classList.remove('hidden');
            if (toolboxRow) toolboxRow.classList.add('hidden');
            if (btnToggleLayers) btnToggleLayers.classList.add('hidden');
            if (btnPalette) btnPalette.classList.add('hidden');
            if (btnUIKit) btnUIKit.classList.add('hidden');
            if (btnSave) btnSave.classList.add('hidden');
            if (modeIcon) modeIcon.src = '../static/image/icon/edit_builder.svg';
            await wait(1800);
            if (saveToast) saveToast.classList.add('hidden');
          }
          await wait(600);

          // 7. TEST LIVE AI CHATBOT (MINIMAL 3 INPUT - OUTPUT CONVERSATIONS)
          const chatBody = document.getElementById('activeGenUIChatBody');
          const inputField = document.getElementById('activeGenUIInputField');
          const sendBtn = document.getElementById('activeGenUISendBtn');

          // -------------------------------------------------------------
          // CONVERSATION 1: Quick Chip "Katalog Produk"
          // -------------------------------------------------------------
          const chipKatalog = document.getElementById('chipKatalogGenUI');
          if (chipKatalog && chatBody) {
            await movePointerToElement(chipKatalog, 550);
            await simulateClick();

            // Append User Question
            const uMsg1 = document.createElement('div');
            uMsg1.className = 'genui-bubble genui-bubble-user';
            uMsg1.style.cssText = 'align-self: flex-end; background: #0F4C75; color: #ffffff; padding: 6px 9px; border-radius: 12px 12px 2px 12px; font-size: 10px; line-height: 1.35; max-width: 88%; box-shadow: 0 2px 6px rgba(15,76,117,0.25);';
            uMsg1.textContent = 'Katalog Produk';
            chatBody.appendChild(uMsg1);
            chatBody.scrollTop = chatBody.scrollHeight;
            await wait(500);

            // Bot RAG Response 1
            const bMsg1 = document.createElement('div');
            bMsg1.className = 'genui-bubble genui-bubble-ai';
            bMsg1.style.cssText = 'align-self: flex-start; background: linear-gradient(135deg, #0284c7, #38a0c4); color: #ffffff; padding: 6px 9px; border-radius: 14px 14px 14px 2px; font-size: 10px; line-height: 1.35; max-width: 88%; box-shadow: 0 2px 6px rgba(2,132,199,0.25);';
            bMsg1.innerHTML = 'Katalog produk unggulan hari ini di Sentra Retail:<br>1. <strong>Paket Sembako Nusantara</strong> (Diskon 15%)<br>2. <strong>Peralatan Smart Home &amp; Dapur</strong><br>3. <strong>Perlengkapan Kantor &amp; ATK</strong>';
            chatBody.appendChild(bMsg1);
            chatBody.scrollTop = chatBody.scrollHeight;
            await wait(1600);
          }

          // -------------------------------------------------------------
          // CONVERSATION 2: Input Karir / Lowongan Kerja
          // -------------------------------------------------------------
          if (inputField && sendBtn && chatBody) {
            await movePointerToElement(inputField, 500);
            await simulateClick();
            await simulateTyping(inputField, 'Apakah ada lowongan kerja barista atau staff gudang?');
            await wait(300);

            await movePointerToElement(sendBtn, 450);
            await simulateClick();

            const uMsg2 = document.createElement('div');
            uMsg2.className = 'genui-bubble genui-bubble-user';
            uMsg2.style.cssText = 'align-self: flex-end; background: #0F4C75; color: #ffffff; padding: 6px 9px; border-radius: 12px 12px 2px 12px; font-size: 10px; line-height: 1.35; max-width: 88%; box-shadow: 0 2px 6px rgba(15,76,117,0.25);';
            uMsg2.textContent = 'Apakah ada lowongan kerja barista atau staff gudang?';
            chatBody.appendChild(uMsg2);
            inputField.value = '';
            chatBody.scrollTop = chatBody.scrollHeight;
            await wait(600);

            // Bot RAG Response 2
            const bMsg2 = document.createElement('div');
            bMsg2.className = 'genui-bubble genui-bubble-ai';
            bMsg2.style.cssText = 'align-self: flex-start; background: linear-gradient(135deg, #0284c7, #38a0c4); color: #ffffff; padding: 6px 9px; border-radius: 14px 14px 14px 2px; font-size: 10px; line-height: 1.35; max-width: 88%; box-shadow: 0 2px 6px rgba(2,132,199,0.25);';
            bMsg2.innerHTML = 'Berdasarkan dokumen RAG terindeks, tersedia 2 posisi aktif:<br>• <strong>Barista Kafe Retail</strong> (Pengalaman 1 thn, Gaji Rp 3.8jt - 4.5jt)<br>• <strong>Staff Logistik Gudang</strong> (Usia maks 28 thn, Balikpapan Selatan)<br>Kirimkan CV kamu melalui tombol Karir!';
            chatBody.appendChild(bMsg2);
            chatBody.scrollTop = chatBody.scrollHeight;
            await wait(1800);
          }

          // -------------------------------------------------------------
          // CONVERSATION 3: Input Gratis Ongkir & Jam Operasional
          // -------------------------------------------------------------
          if (inputField && sendBtn && chatBody) {
            await movePointerToElement(inputField, 500);
            await simulateClick();
            await simulateTyping(inputField, 'Berapa minimal belanja untuk gratis ongkir dan jam buka?');
            await wait(300);

            await movePointerToElement(sendBtn, 450);
            await simulateClick();

            const uMsg3 = document.createElement('div');
            uMsg3.className = 'genui-bubble genui-bubble-user';
            uMsg3.style.cssText = 'align-self: flex-end; background: #0F4C75; color: #ffffff; padding: 6px 9px; border-radius: 12px 12px 2px 12px; font-size: 10px; line-height: 1.35; max-width: 88%; box-shadow: 0 2px 6px rgba(15,76,117,0.25);';
            uMsg3.textContent = 'Berapa minimal belanja untuk gratis ongkir dan jam buka?';
            chatBody.appendChild(uMsg3);
            inputField.value = '';
            chatBody.scrollTop = chatBody.scrollHeight;
            await wait(600);

            // Bot RAG Response 3
            const bMsg3 = document.createElement('div');
            bMsg3.className = 'genui-bubble genui-bubble-ai';
            bMsg3.style.cssText = 'align-self: flex-start; background: linear-gradient(135deg, #0284c7, #38a0c4); color: #ffffff; padding: 6px 9px; border-radius: 14px 14px 14px 2px; font-size: 10px; line-height: 1.35; max-width: 88%; box-shadow: 0 2px 6px rgba(2,132,199,0.25);';
            bMsg3.innerHTML = 'Sentra Retail buka setiap hari <strong>08.00 - 22.00 WITA</strong>. Gratis ongkir instan berlaku untuk belanja <strong>min. Rp 150.000</strong> dengan radius antar <strong>15 km</strong> di Balikpapan.';
            chatBody.appendChild(bMsg3);
            chatBody.scrollTop = chatBody.scrollHeight;
            await wait(1800);
          }

          // Pointer rests at bottom right during preview
          await movePointerTo(290, 480, 500);

          // Hold view for 5.5s so user can view the full working chatbot
          await wait(5500);

          // Kembali ke peta untuk looping berikutnya
          if (btnBackToMap) {
            await movePointerToElement(btnBackToMap, 600);
            await simulateClick();
            if (promoOverlay) promoOverlay.classList.add('hidden');
          }
          await wait(1000);
        }
      }

      setTimeout(() => {
        runSimulationCycle();
      }, 1000);
    }

    initGenUIAutoplayLoop();
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init3DPhoneRotation();
      initSpatialGIS();
      initDrawLokasiSpatialGIS();
      initCampaignSpatialGIS();
      initJobPortalSpatialGIS();
      initAiPinSpatialGIS();
      initJobModeSpatialGIS();
      initViewPromotionBuilderSpatialGIS();
      initGenUISpatialGIS();
    });
  } else {
    init3DPhoneRotation();
    initSpatialGIS();
    initDrawLokasiSpatialGIS();
    initCampaignSpatialGIS();
    initJobPortalSpatialGIS();
    initAiPinSpatialGIS();
    initJobModeSpatialGIS();
    initViewPromotionBuilderSpatialGIS();
    initGenUISpatialGIS();
  }
})();

