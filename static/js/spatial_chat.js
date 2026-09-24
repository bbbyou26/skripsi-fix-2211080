// Chatbot & Targeting Mode Logic
let isTargetingMode = false;
window.targetPin = window.targetPin || null;
window.targetCircle = window.targetCircle || null;
window.currentRadius = window.currentRadius || 500;
window.lastPinnedLocationName = "Area Target";
window.currentChatMode = "default";
window.spatialChatHistory = [];

window.toggleJobCreationMenu = function () {
    const subMenu = document.getElementById("jobCreationSubMenu");
    const toggleBtn = document.getElementById("mainJcToggle");
    if (subMenu) {
        subMenu.classList.toggle("hidden");
        if (!subMenu.classList.contains("hidden")) {
            toggleBtn.classList.add("active");
        } else {
            toggleBtn.classList.remove("active");
        }
    }
};

window.setChatMode = function (mode, element) {
    window.currentChatMode = mode;

    // Manage active chips
    const allChips = document.querySelectorAll('.jc-chip');
    allChips.forEach(chip => chip.classList.remove('active'));

    if (element && mode !== 'default') {
        element.classList.add('active');
    }

    if (mode !== 'sumber-daya' && window.removeChatImage) {
        window.removeChatImage(); // clear image if switching modes
    }

    // Manage input placeholder
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        if (mode === 'sumber-daya') chatInput.placeholder = "Sebutkan produk/aset lokal (misal: Bambu) ATAU skill, modal, & alat yang kamu punya...";
        else if (mode === 'celah-masalah') chatInput.placeholder = "Tanya celah masalah / kebutuhan lokal yang belum terpenuhi di radius...";
        else if (mode === 'analisis') chatInput.placeholder = "Minta alur operasional/teknis pemanfaatan...";
        else if (mode === 'simulasi-modal') chatInput.placeholder = "Tanya simulasi modal awal, proyeksi omzet, & titik balik modal...";
        else if (mode === 'simulasi-lapangan-kerja') chatInput.placeholder = "Simulasi penyerapan tenaga kerja lokal...";
        else chatInput.placeholder = "Tanyakan sesuatu...";
    }
};

window.currentChatMedia = null;

window.handleChatImageUpload = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        window.currentChatMedia = e.target.result;
        document.getElementById('chatPreviewImg').src = window.currentChatMedia;
        document.getElementById('chatImagePreview').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
};

window.removeChatImage = function () {
    window.currentChatMedia = null;
    const input = document.getElementById('chatImgInput');
    if (input) input.value = '';
    const preview = document.getElementById('chatImagePreview');
    if (preview) preview.classList.add('hidden');
    const img = document.getElementById('chatPreviewImg');
    if (img) img.src = '';
};


window.toggleChatbot = function () {
    const overlay = document.getElementById('chatbotOverlay');
    if (overlay) overlay.classList.toggle('hidden');
}

// Helper: Point in Polygon (PIP)
function isPointInPolygon(point, polygon) {
    let latlngs = polygon.getLatLngs();
    if (latlngs.length > 0 && Array.isArray(latlngs[0])) latlngs = latlngs[0];
    let x = point.lat, y = point.lng;
    let inside = false;
    for (let i = 0, j = latlngs.length - 1; i < latlngs.length; j = i++) {
        let xi = latlngs[i].lat, yi = latlngs[i].lng;
        let xj = latlngs[j].lat, yj = latlngs[j].lng;
        let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// Helper: Jump to Actor
window.jumpToActor = function (id) {
    if (window.innerWidth < 600) window.toggleChatbot();
    // Cari marker di window.actorMarkers (array marker dari map.html)
    if (window.actorMarkers) {
        const marker = window.actorMarkers.find(m => m.uniqueId === id);
        if (marker) {
            map.setView(marker.getLatLng(), 18);
            marker.openPopup();
        }
    }
};

window.jumpToActorByName = function (name) {
    if (window.innerWidth < 600) window.toggleChatbot();
    if (window.actorMarkers) {
        // Toleransi pencarian nama dengan lowercase dan menyertakan spasi
        const query = name.toLowerCase().trim();
        const marker = window.actorMarkers.find(m => {
            if (!m.actorData) return false;
            const mName = (m.actorData["Nama"] || m.actorData["Nama Lokasi"] || "").toLowerCase();
            return mName.includes(query) || query.includes(mName);
        });
        if (marker) {
            map.setView(marker.getLatLng(), 18);
            marker.openPopup();
        } else {
            // Optional: fallback jika tidak ditemukan di peta
            console.log("Actor tidak ditemukan:", name);
        }
    }
};

// Optimized Delegated Listener
document.addEventListener('click', (e) => {
    if (e.target.closest('.chatbot')) {
        e.preventDefault();
        window.toggleChatbot();
        return;
    }

    if (e.target.closest('#btnAiPin')) {
        e.preventDefault();
        startTargetingMode();
        return;
    }

    // Send Chat
    if (e.target.closest('.send-chat')) {
        const chatInput = document.getElementById('chatInput');
        if (!chatInput) return;
        const text = chatInput.value.trim();
        if (!text && !window.currentChatMedia) return;

        let msgHtml = text;
        if (window.currentChatMedia) {
            msgHtml = `<img src="${window.currentChatMedia}" style="max-width: 100%; border-radius: 8px; margin-bottom: 8px;"/><br/>` + text;
        }
        appendMessage('user', msgHtml);

        chatInput.value = '';
        const mediaPayload = window.currentChatMedia;
        window.removeChatImage();

        // Indikator Mengetik
        const typingEl = document.createElement('div');
        typingEl.className = 'message bot typing-indicator';
        typingEl.innerHTML = `<div class="bubble"><em>AI sedang memetakan data radius...</em></div>`;
        document.getElementById('chatMessages').appendChild(typingEl);
        document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;

        const center = window.targetPin ? window.targetPin.getLatLng() : null;
        let actorsInRange = [];

        // Detect Place Name for LLM context (uses globally stored OSM name)
        let locationName = window.lastPinnedLocationName || "Area Target";

        let polygonsInRange = [];

        if (typeof window.actorMarkers !== 'undefined') {
            const polygons = window.actorMarkers.filter(m => m instanceof L.Polygon);
            const markers = window.actorMarkers.filter(m => m instanceof L.Marker && m !== window.targetPin);

            // 1. Ambil Poligon (Layers) untuk dikirim ke Backend
            polygons.forEach(p => {
                let latlngs = p.getLatLngs();
                if (latlngs.length > 0 && Array.isArray(latlngs[0])) latlngs = latlngs[0];

                polygonsInRange.push({
                    id: p.uniqueId,
                    name: p.actorData?.["Nama"] || p.actorData?.["Nama Lokasi"] || "Wilayah",
                    coords: latlngs.map(ll => [ll.lat, ll.lng])
                });
            });

            // 2. Ambil Aktor (Markers)
            markers.forEach(m => {
                if (m.actorData) {
                    const markLatLng = m.getLatLng();
                    let isInRange = center ? center.distanceTo(markLatLng) <= window.currentRadius : map.getBounds().contains(markLatLng);

                    if (isInRange) {
                        actorsInRange.push({
                            id: m.uniqueId,
                            name: m.actorData["Nama"] || "Aktor",
                            type: m.actorType,
                            lat: markLatLng.lat,
                            lng: markLatLng.lng,
                            fullData: m.actorData
                        });
                    }
                }
            });
        }

        fetch('/api/chat/spatial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: text,
                mode: window.currentChatMode,
                media_data: mediaPayload,
                actors: actorsInRange,
                polygons: polygonsInRange,
                location_name: locationName,
                pinnedCenter: center ? { lat: center.lat, lng: center.lng } : null,
                radius: window.currentRadius,
                history: window.spatialChatHistory || []
            })
        })
            .then(res => res.json())
            .then(data => {
                document.querySelectorAll('.typing-indicator').forEach(el => el.remove());
                if (data.reply) {
                    if (data.history && Array.isArray(data.history)) {
                        window.spatialChatHistory = data.history;
                    } else {
                        window.spatialChatHistory = window.spatialChatHistory || [];
                        window.spatialChatHistory.push({ role: 'user', text: text });
                        window.spatialChatHistory.push({ role: 'assistant', text: data.reply });
                        if (window.spatialChatHistory.length > 16) {
                            window.spatialChatHistory = window.spatialChatHistory.slice(-16);
                        }
                    }
                    const evalData = {
                        user_input: text,
                        ai_response: data.reply,
                        context: data.context || "",
                        has_image: !!mediaPayload
                    };
                    appendMessage('bot', data.reply, evalData, data.layout);
                }
            })
            .catch(err => {
                document.querySelectorAll('.typing-indicator').forEach(el => el.remove());
                appendMessage('bot', "Maaf, terjadi gangguan pada server. Silakan coba lagi.");
            });
    }
});

function startTargetingMode() {
    if (typeof map === 'undefined') return;
    window.toggleChatbot();
    isTargetingMode = true;
    map.getContainer().style.cursor = 'crosshair';

    const radiusPanel = document.createElement('div');
    radiusPanel.id = 'radiusPanel';
    radiusPanel.className = 'radius-panel';
    radiusPanel.innerHTML = `
        <div class="radius-info">
            <span class="radius-label">Tentukan Radius</span>
            <span id="radiusDisp" class="radius-val">${window.currentRadius} m</span>
        </div>
        <input type="range" id="radiusSlider" min="50" max="10000" step="50" value="${window.currentRadius}">
        <button class="btn-save-radius" onclick="saveTargetLocation()">Kunci Lokasi</button>
    `;
    const appElem = document.querySelector('.app') || document.body;
    appElem.appendChild(radiusPanel);

    const slider = document.getElementById('radiusSlider');
    slider.oninput = (e) => {
        window.currentRadius = parseInt(e.target.value);
        document.getElementById('radiusDisp').innerText = window.currentRadius + ' m';
        if (window.targetCircle) window.targetCircle.setRadius(window.currentRadius);
    };

    map.on('click', handleTargetClick);
}

function handleTargetClick(e) {
    if (typeof window.handleStreetViewMapClick === 'function' && window.handleStreetViewMapClick(e.latlng.lat, e.latlng.lng)) {
        return;
    }
    if (!isTargetingMode) return;
    if (window.targetPin) map.removeLayer(window.targetPin);
    if (window.targetCircle) map.removeLayer(window.targetCircle);

    const pinIcon = L.icon({
        iconUrl: '/static/image/icon/ai-pin.svg',
        iconSize: [44, 44],
        iconAnchor: [22, 22]
    });

    window.targetPin = L.marker(e.latlng, { icon: pinIcon, draggable: true }).addTo(map);
    window.targetCircle = L.circle(e.latlng, { radius: window.currentRadius, color: '#38a0c4', fillOpacity: 0.2 }).addTo(map);
    window.targetPin.on('drag', (ev) => { window.targetCircle.setLatLng(ev.latlng); });
}

function saveTargetLocation() {
    if (!window.targetPin) return;
    isTargetingMode = false;
    map.off('click', handleTargetClick);
    map.getContainer().style.cursor = '';
    const panel = document.getElementById('radiusPanel');
    if (panel) panel.remove();

    document.getElementById('locationTargetBadge').classList.remove('hidden');
    window.toggleChatbot();

    const center = window.targetPin.getLatLng();
    fetch('/api/spatial/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: center.lat, lng: center.lng, radius: window.currentRadius })
    });

    // Detect Nearby Polygon Name for display
    let inPolygon = false;
    let locationName = "Area Target";

    if (typeof window.actorMarkers !== 'undefined') {
        const polygons = window.actorMarkers.filter(m => m instanceof L.Polygon);
        polygons.forEach(poly => {
            if (isPointInPolygon(center, poly)) {
                locationName = poly.actorData?.["Nama"] || poly.actorData?.["Nama Lokasi"] || locationName;
                inPolygon = true;
            }
        });
    }

    const appendTargetLockMsg = (locName, c) => {
        appendMessage('bot', `Target Lokasi Terkunci: ${window.currentRadius} meter. Menganalisis ekosistem...<br/><em>${locName} (${c.lat.toFixed(4)}, ${c.lng.toFixed(4)})</em>`);
    };

    if (inPolygon) {
        window.lastPinnedLocationName = locationName;
        appendTargetLockMsg(locationName, center);
    } else {
        // Reverse Geocoding OSM Nominatim API
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${center.lat}&lon=${center.lng}`)
            .then(res => res.json())
            .then(data => {
                if (data.display_name) {
                    // Potong nama tempat agar tidak terlalu panjang (ambil info area spesifik)
                    const parts = data.display_name.split(",");
                    locationName = parts.slice(0, 3).join(",").trim();
                }
                window.lastPinnedLocationName = locationName;
                appendTargetLockMsg(locationName, center);
            }).catch(err => {
                console.log("[Nominatim] Gagal mendapatkan lokasi OSM:", err);
                window.lastPinnedLocationName = "Area Target";
                appendTargetLockMsg("Area Target", center);
            });
    }
}

function formatResponseToCarousel(htmlText) {
    if (!htmlText || !htmlText.includes('<h3')) return htmlText;

    const parts = htmlText.split(/(?=<h3)/i);
    let leadText = parts[0] ? parts[0].trim() : '';
    let cardsHtml = '';

    for (let i = 1; i < parts.length; i++) {
        if (parts[i].trim()) {
            cardsHtml += `<div class="chat-carousel-card">${parts[i].trim()}</div>`;
        }
    }

    if (!cardsHtml) return htmlText;

    return (leadText ? `<div style="margin-bottom: 8px;">${leadText}</div>` : '') + `<div class="chat-carousel-wrapper">${cardsHtml}</div>`;
}

function appendMessage(sender, text, evalData = null) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    let formattedText;
    if (text.trim().startsWith('<') && !text.includes('\n')) {
        formattedText = text;
    } else {
        let processed = text;

        // 1. Bersihkan pengulangan nama ganda: misal "Warung Syafaat Warung Syafaat [[PO41F5]]" atau "**Warung Syafaat** [[Warung Syafaat|PO41F5]]"
        processed = processed.replace(/\b([A-Za-z0-9\s'._-]+?)\s+\1\b(?=\s*\[\[)/gi, '$1');
        processed = processed.replace(/(?:\*\*)?([^\n\r*\[\]]+?)(?:\*\*)?\s*\[\[\s*\1\s*\|\s*([^\[\]|\n\r]+)\s*\]\]/gi, '[[$1|$2]]');

        // 2. Normalisasi format "Nama Usaha [[ID]]" atau "**Nama Usaha** [[ID]]" menjadi "[[Nama Usaha|ID]]"
        processed = processed.replace(/(?:\*\*)?([^\n\r*\[\]|]{2,60}?)(?:\*\*)?\s*\[\[\s*([A-Za-z0-9_-]{3,20})\s*\]\]/g, (match, actorName, actorId) => {
            const trimmedName = actorName.trim();
            if (trimmedName.endsWith(':') || trimmedName === 'Tag AEO' || trimmedName.includes('|')) return match;
            return `[[${trimmedName}|${actorId}]]`;
        });

        // 3. Normalisasi format standalone "[[ID]]" (jika hanya ID saja tanpa nama)
        processed = processed.replace(/\[\[\s*([A-Za-z0-9_-]{3,20})\s*\]\]/g, (match, id) => {
            let actorName = id;
            if (window.actorMarkers) {
                const found = window.actorMarkers.find(m => m.uniqueId === id || (m.actorData && (m.actorData["id"] === id || m.actorData["UniqueId"] === id)));
                if (found && found.actorData) {
                    actorName = found.actorData["Nama"] || found.actorData["Nama Lokasi"] || id;
                }
            }
            return `[[${actorName}|${id}]]`;
        });

        // 4. Ubah format [[Nama|ID]] menjadi safe clickable span (SEBELUM Marked.js dipanggil agar tidak bentrok dengan karakter '|' tabel Markdown)
        processed = processed.replace(/\[\[\s*([^\[\]|\n\r]+?)\s*\|\s*([^\[\]|\n\r]+?)\s*\]\]/g, (match, name, id) => {
            const cleanName = name.trim();
            const cleanId = id.trim().replace(/'/g, "\\'");
            return `<span class="actor-link" onclick="window.jumpToActor('${cleanId}')"><strong>${cleanName}</strong></span>`;
        });

        // 5. Use Marked for standard Markdown (Tables, Lists, Bold, Task Checklists, etc.)
        if (typeof marked !== 'undefined') {
            formattedText = marked.parse(processed)
                .replace(/<table[^>]*>/g, match => '<div class="table-scroll-wrapper">' + match)
                .replace(/<\/table>/g, '</table></div>')
                .replace(/\[ \]/g, '<input type="checkbox"/>')
                .replace(/\[x\]/gi, '<input type="checkbox" checked/>');
        } else {
            formattedText = processed
                .replace(/\[ \]/g, '<input type="checkbox"/>')
                .replace(/\[x\]/gi, '<input type="checkbox" checked/>')
                .replace(/\n\n+/g, '<br/><br/>')
                .replace(/\n/g, '<br/>');
        }

        // 6. Ubah sisa <strong> (dari bold text Markdown AI) menjadi CTA pop-up berdasarkan NAMA (Auto-AEO fallback) HANYA jika bertipe aktor
        formattedText = formattedText.replace(/<strong>(.*?)<\/strong>/g, (match, textContent) => {
            // Jika sudah ada di dalam actor-link atau tag HTML, abaikan
            if (textContent.includes("span class") || textContent.includes("<")) return match;

            // Cek apakah 'textContent' benar-benar nama aktor yang ada di map
            let isActor = false;
            let matchedId = null;
            if (window.actorMarkers) {
                const query = textContent.toLowerCase().trim();
                if (query.length >= 3) {
                    const found = window.actorMarkers.find(m => {
                        if (!m.actorData) return false;
                        const mName = (m.actorData["Nama"] || m.actorData["Nama Lokasi"] || "").toLowerCase().trim();
                        return mName && (mName === query || (mName.length > 3 && (mName.includes(query) || query.includes(mName))));
                    });
                    if (found) {
                        isActor = true;
                        matchedId = found.uniqueId;
                    }
                }
            }

            if (isActor && matchedId) {
                return `<span class="actor-link" onclick="window.jumpToActor('${matchedId}')"><strong>${textContent}</strong></span>`;
            }
            // Jika bukan aktor, biarkan tetap <strong> biasa
            return match;
        });

        // 7. Ubah struktur jawaban bot menjadi Carousel Horizontal Cards per section H3
        if (sender === 'bot') {
            formattedText = formatResponseToCarousel(formattedText);
        }
    }

    const msgContainer = document.createElement('div');
    msgContainer.className = 'message-container ' + sender;
    msgContainer.style.display = 'flex';
    msgContainer.style.flexDirection = 'column';
    msgContainer.style.alignItems = sender === 'user' ? 'flex-end' : 'flex-start';
    msgContainer.style.marginBottom = '15px';

    const msg = document.createElement('div');
    msg.className = 'message ' + sender;
    msg.style.maxWidth = '100%';
    msg.innerHTML = `<div class="bubble">${formattedText}</div>`;

    msgContainer.appendChild(msg);

    if (sender === 'bot' && evalData) {
        const evalTrigger = document.createElement('div');
        evalTrigger.className = 'eval-trigger-container';
        const evalBtn = document.createElement('button');
        evalBtn.className = 'btn-eval-trigger';
        evalBtn.dataset.eval = JSON.stringify(evalData);
        evalBtn.innerHTML = `
            <img src="/static/image/icon/eval.svg" alt="Evaluasi" style="width: 20px; height: 20px;" />
            Evaluasi Output
        `;
        evalBtn.onclick = function () { window.evaluateMessage(this); };
        evalTrigger.appendChild(evalBtn);
        msgContainer.appendChild(evalTrigger);
    }

    chatMessages.appendChild(msgContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

window.evaluateMessage = function (btn) {
    const data = JSON.parse(btn.dataset.eval);
    const container = btn.closest('.message-container');

    // Check if results already exist
    if (container.querySelector('.eval-results-card')) {
        container.querySelector('.eval-results-card').remove();
        btn.innerHTML = `
            <img src="/static/image/icon/eval.svg" alt="Evaluasi" style="width: 20px; height: 20px;" />
            Evaluasi Output
        `;
        return;
    }

    // Show loading
    const loadingId = 'loading-' + Math.random().toString(36).substr(2, 9);
    const loadingHtml = `
        <div id="${loadingId}" class="eval-results-card">
            <div class="eval-loading">
                <div class="eval-spinner"></div>
                <span>Menganalisis kualitas jawaban (RAGAS)...</span>
            </div>
        </div>
    `;
    container.appendChild(new DOMParser().parseFromString(loadingHtml, 'text/html').body.firstChild);
    btn.innerHTML = '<img src="/static/image/icon/close.svg" alt="Tutup" style="width: 14px; height: 14px;" /> Tutup Evaluasi';

    fetch('/api/ragas/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(res => {
            document.getElementById(loadingId).remove();
            if (res.success) {
                const s = res.scores;
                const l = res.labels;

                const getLevelClass = (score) => {
                    if (score >= 0.85) return 'excellent';
                    if (score >= 0.70) return 'good';
                    if (score >= 0.50) return 'fair';
                    return 'poor';
                };

                const resultsHtml = `
                <div class="eval-results-card">
                    <div class="eval-header">
                        <span class="eval-title">RAGAS Evaluation</span>
                        <span class="overall-badge level-${getLevelClass(s.overall)}">${l.overall} (${s.overall})</span>
                    </div>
                    <div class="score-grid">
                        <div class="score-item">
                            <div class="score-label">Faithfulness</div>
                            <div class="score-value">${s.faithfulness}</div>
                            <div class="score-desc text-${getLevelClass(s.faithfulness)}">${l.faithfulness}</div>
                        </div>
                        <div class="score-item">
                            <div class="score-label">Relevancy</div>
                            <div class="score-value">${s.relevancy}</div>
                            <div class="score-desc text-${getLevelClass(s.relevancy)}">${l.relevancy}</div>
                        </div>
                    </div>
                </div>
            `;
                container.appendChild(new DOMParser().parseFromString(resultsHtml, 'text/html').body.firstChild);
            } else {
                const errorHtml = `<div class="eval-results-card" style="color: #e74c3c; font-size: 11px;">Error: ${res.error}</div>`;
                container.appendChild(new DOMParser().parseFromString(errorHtml, 'text/html').body.firstChild);
            }
        })
        .catch(err => {
            document.getElementById(loadingId).remove();
            const errorHtml = `<div class="eval-results-card" style="color: #e74c3c; font-size: 11px;">Gagal memanggil engine evaluasi.</div>`;
            container.appendChild(new DOMParser().parseFromString(errorHtml, 'text/html').body.firstChild);
        });
};


window.removeLocationTarget = function () {
    if (window.targetPin) map.removeLayer(window.targetPin);
    if (window.targetCircle) map.removeLayer(window.targetCircle);
    window.targetPin = null;
    window.targetCircle = null;
    document.getElementById('locationTargetBadge').classList.add('hidden');
    appendMessage('bot', "Target lokasi dihapus.");
};

