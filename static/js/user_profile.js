
// PROFILE LOGIC
(function () {
    const keluarBtn = document.getElementById('Keluar');
    if (keluarBtn) {
        keluarBtn.addEventListener('click', () => {
            window.location.href = '/logout';
        });
    }

    const profilBtn = document.getElementById('Profil');
    if (profilBtn) {
        profilBtn.addEventListener('click', () => {
            document.getElementById('profileEditOverlay').classList.remove('hidden');
            document.getElementById('profileWrapper').classList.remove('active');
        });
    }

    window.previewProfilePhoto = function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('profilePreviewImg').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const name = document.getElementById('profileNameInput').value;
            const file = document.getElementById('profileFileInput').files[0];

            const formData = new FormData();
            formData.append('nama', name);
            if (file) formData.append('foto', file);

            saveBtn.disabled = true;
            saveBtn.innerText = "Menyimpan...";

            try {
                const res = await fetch('/api/user/update', {
                    method: 'POST',
                    body: formData
                });
                const json = await res.json();
                if (json.success) {
                    const newImgSrc = document.getElementById('profilePreviewImg').src;
                    document.querySelectorAll('.open-profile img, #imgProfile img').forEach(img => {
                        img.src = newImgSrc;
                    });
                    document.querySelectorAll('.nama').forEach(el => {
                        el.innerText = name;
                    });

                    document.getElementById('profileEditOverlay').classList.add('hidden');
                    if (typeof showToast === 'function') showToast("Profil diperbarui!", "success");
                } else {
                    alert("Gagal update profil: " + (json.error || "Unknown error"));
                }
            } catch (err) {
                console.error(err);
                alert("Terjadi kesalahan koneksi.");
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerText = "Simpan Perubahan";
            }
        });
    }

    // Toggle Izinkan Akses checkbox state persistence
    const toggleIzinkanAkses = document.getElementById('toggleIzinkanAkses');
    if (toggleIzinkanAkses) {
        const savedState = localStorage.getItem('izinkanAksesChecked') === 'true';
        toggleIzinkanAkses.checked = savedState;

        toggleIzinkanAkses.addEventListener('change', (e) => {
            localStorage.setItem('izinkanAksesChecked', e.target.checked);
            if (typeof showToast === 'function') {
                showToast(e.target.checked ? "Izinkan Akses diaktifkan" : "Izinkan Akses dinonaktifkan", "info");
            }
        });
    }

    // Fetch User Permissions & Creation Quota
    fetch('/api/user/permissions')
        .then(res => res.json())
        .then(data => {
            if (data.creation_quota) {
                window.userCreationQuota = data.creation_quota;
                if (typeof window.updateActorCreationUI === 'function') {
                    window.updateActorCreationUI();
                }
            }
        })
        .catch(err => console.error("Error loading permissions:", err));

    // Admin Overlay Logic & Tabs
    window.currentPermissionTab = 'actor';

    window.switchPermissionTab = function (tabName) {
        window.currentPermissionTab = tabName;
        const btnActor = document.getElementById('tabBtnActor');
        const btnCreation = document.getElementById('tabBtnCreation');
        const listActor = document.getElementById('permissionRequestsList');
        const listCreation = document.getElementById('creationRequestsList');

        if (tabName === 'actor') {
            if (btnActor) btnActor.classList.add('active');
            if (btnCreation) btnCreation.classList.remove('active');
            if (listActor) { listActor.classList.remove('hidden'); listActor.style.display = 'flex'; }
            if (listCreation) { listCreation.classList.add('hidden'); listCreation.style.display = 'none'; }
            window.fetchPermissionRequests();
        } else if (tabName === 'creation') {
            if (btnCreation) btnCreation.classList.add('active');
            if (btnActor) btnActor.classList.remove('active');
            if (listCreation) { listCreation.classList.remove('hidden'); listCreation.style.display = 'flex'; }
            if (listActor) { listActor.classList.add('hidden'); listActor.style.display = 'none'; }
            window.fetchCreationRequests();
        }
    };

    window.togglePermissionOverlay = function () {
        const overlay = document.getElementById('permissionOverlay');
        if (!overlay) return;

        if (overlay.classList.contains('hidden')) {
            overlay.classList.remove('hidden');
            window.switchPermissionTab(window.currentPermissionTab || 'actor');
        } else {
            overlay.classList.add('hidden');
        }
    };

    window.fetchPermissionRequests = async function () {
        const container = document.getElementById('permissionRequestsList');
        if (!container) return;

        container.innerHTML = '<div style="text-align: center; color: #7a8a94; padding: 20px;">Memuat permintaan...</div>';

        try {
            const res = await fetch('/api/permission/requests');
            const data = await res.json();

            if (!data.requests || data.requests.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: #7a8a94; padding: 20px;">Tidak ada permintaan akses baru.</div>';
                return;
            }

            container.innerHTML = data.requests.map(req => {
                const fotoSrc = req.foto ? `data:image/*;base64,${req.foto}` : '/static/image/icon/view.svg';
                return `
                    <div class="permission-request-card" id="req-${req.nama_akun}-${req.actor_id}">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 48px; height: 48px; border-radius: 50%; overflow: hidden; background: #38a0c4; flex-shrink: 0; border: 2px solid #38a0c4; box-shadow: 0 2px 8px rgba(56, 160, 196, 0.2);">
                                <img src="${fotoSrc}" style="width: 100%; height: 100%; object-fit: cover;" alt="Profile" />
                            </div>
                            <div style="display: flex; flex-direction: column; min-width: 0; flex: 1;">
                                <span style="font-size: 14px; font-weight: 700; color: #2c5d6b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${req.nama}</span>
                                <span style="font-size: 11px; color: #7a8a94;">@${req.nama_akun} &bull; ${req.tanggal}</span>
                            </div>
                        </div>
                        <div style="background: #f8fbff; border: 1px solid #eef2f4; border-radius: 12px; padding: 10px 14px; display: flex; flex-direction: column; gap: 4px;">
                            <span style="font-size: 10px; color: #8d98e0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Aktor Marker</span>
                            <span style="font-size: 13px; font-weight: 700; color: #2c5d6b;">${req.actor_name}</span>
                            <span style="font-size: 11px; color: #38a0c4; font-weight: 600;">ID: ${req.actor_id}</span>
                            ${req.alasan ? `
                            <div style="margin-top: 4px; background: #ffffff; border: 1px dashed #bddce7; border-radius: 8px; padding: 6px 10px; font-size: 11px; color: #555;">
                                <span style="font-weight: 700; color: #2c5d6b;">Alasan:</span> ${req.alasan}
                            </div>
                            ` : ''}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-reject-permission" onclick="window.rejectPermission('${req.nama_akun}', '${req.actor_id}', this)">Tolak</button>
                            <button class="btn-confirm-permission" style="flex: 1;" onclick="window.confirmPermission('${req.nama_akun}', '${req.actor_id}', this)">Izinkan</button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            console.error(err);
            container.innerHTML = '<div style="text-align: center; color: #ff6b6b; padding: 20px;">Gagal memuat permintaan.</div>';
        }
    };

    window.confirmPermission = async function (username, actorId, btn) {
        const card = document.getElementById(`req-${username}-${actorId}`);
        const allBtns = card ? card.querySelectorAll('button') : [btn];
        allBtns.forEach(b => b.disabled = true);
        btn.innerText = "Mengonfirmasi...";

        try {
            const res = await fetch('/api/permission/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama_akun: username, actor_id: actorId })
            });
            const data = await res.json();

            if (data.success) {
                btn.innerText = "✓ Diizinkan";
                btn.style.background = "#2ecc71";
                btn.style.boxShadow = "none";
                if (typeof showToast === 'function') {
                    showToast("Akses izin disetujui!", "success");
                }

                setTimeout(() => {
                    if (card) {
                        card.style.transition = "all 0.4s ease";
                        card.style.opacity = "0";
                        card.style.transform = "scale(0.9)";
                        setTimeout(() => {
                            card.remove();
                            const container = document.getElementById('permissionRequestsList');
                            if (container && container.children.length === 0) {
                                container.innerHTML = '<div style="text-align: center; color: #7a8a94; padding: 20px;">Tidak ada permintaan akses baru.</div>';
                            }
                        }, 400);
                    }
                }, 800);
            } else {
                allBtns.forEach(b => b.disabled = false);
                btn.innerText = "Izinkan";
                if (typeof showToast === 'function') {
                    showToast("Gagal mengonfirmasi: " + (data.error || "error"), "error");
                }
            }
        } catch (err) {
            console.error(err);
            allBtns.forEach(b => b.disabled = false);
            btn.innerText = "Izinkan";
            if (typeof showToast === 'function') {
                showToast("Terjadi kesalahan jaringan.", "error");
            }
        }
    };

    window.rejectPermission = async function (username, actorId, btn) {
        const card = document.getElementById(`req-${username}-${actorId}`);
        const allBtns = card ? card.querySelectorAll('button') : [btn];
        allBtns.forEach(b => b.disabled = true);
        btn.innerText = "Menolak...";

        try {
            const res = await fetch('/api/permission/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama_akun: username, actor_id: actorId })
            });
            const data = await res.json();

            if (data.success) {
                btn.innerText = "✕ Ditolak";
                btn.style.background = "#ff6b6b";
                btn.style.color = "white";
                btn.style.boxShadow = "none";
                if (typeof showToast === 'function') {
                    showToast("Permintaan akses ditolak.", "info");
                }

                setTimeout(() => {
                    if (card) {
                        card.style.transition = "all 0.4s ease";
                        card.style.opacity = "0";
                        card.style.transform = "scale(0.9)";
                        setTimeout(() => {
                            card.remove();
                            const container = document.getElementById('permissionRequestsList');
                            if (container && container.children.length === 0) {
                                container.innerHTML = '<div style="text-align: center; color: #7a8a94; padding: 20px;">Tidak ada permintaan akses baru.</div>';
                            }
                        }, 400);
                    }
                }, 800);
            } else {
                allBtns.forEach(b => b.disabled = false);
                btn.innerText = "Tolak";
                if (typeof showToast === 'function') {
                    showToast("Gagal menolak izin: " + (data.error || "error"), "error");
                }
            }
        } catch (err) {
            console.error(err);
            allBtns.forEach(b => b.disabled = false);
            btn.innerText = "Tolak";
            if (typeof showToast === 'function') {
                showToast("Terjadi kesalahan jaringan.", "error");
            }
        }
    };

    window.fetchCreationRequests = async function () {
        const container = document.getElementById('creationRequestsList');
        if (!container) return;

        container.innerHTML = '<div style="text-align: center; color: #7a8a94; padding: 20px;">Memuat permohonan...</div>';

        try {
            const res = await fetch('/api/permission/creation_requests');
            const data = await res.json();

            if (!data.requests || data.requests.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: #7a8a94; padding: 20px;">Tidak ada permohonan kuota baru.</div>';
                return;
            }

            container.innerHTML = data.requests.map(req => {
                const fotoSrc = req.foto ? `data:image/*;base64,${req.foto}` : '/static/image/icon/view.svg';
                return `
                    <div class="permission-request-card" id="req-creation-${req.nama_akun}">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 48px; height: 48px; border-radius: 50%; overflow: hidden; background: #8d98e0; flex-shrink: 0; border: 2px solid #8d98e0; box-shadow: 0 2px 8px rgba(141, 152, 224, 0.3);">
                                <img src="${fotoSrc}" style="width: 100%; height: 100%; object-fit: cover;" alt="Profile" />
                            </div>
                            <div style="display: flex; flex-direction: column; min-width: 0; flex: 1;">
                                <span style="font-size: 14px; font-weight: 700; color: #2c5d6b;">${req.nama}</span>
                                <span style="font-size: 11px; color: #7a8a94;">@${req.nama_akun} &bull; ${req.tanggal}</span>
                            </div>
                        </div>
                        <div style="background: #f8fbff; border: 1px solid #eef2f4; border-radius: 12px; padding: 10px 14px; display: flex; flex-direction: column; gap: 4px;">
                            <span style="font-size: 10px; color: #8d98e0; font-weight: 700; text-transform: uppercase;">Permohonan Kuota Marker</span>
                            <span style="font-size: 14px; font-weight: 800; color: #38a0c4;">+${req.jumlah} Marker Aktor</span>
                            ${req.alasan ? `
                            <div style="margin-top: 4px; background: #ffffff; border: 1px dashed #bddce7; border-radius: 8px; padding: 6px 10px; font-size: 11px; color: #555;">
                                <span style="font-weight: 700; color: #2c5d6b;">Alasan:</span> ${req.alasan}
                            </div>
                            ` : ''}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-reject-permission" onclick="window.rejectCreationPermission('${req.nama_akun}', this)">Tolak</button>
                            <button class="btn-confirm-permission" style="flex: 1;" onclick="window.approveCreationPermission('${req.nama_akun}', ${req.jumlah}, this)">Izinkan</button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            console.error(err);
            container.innerHTML = '<div style="text-align: center; color: #ff6b6b; padding: 20px;">Gagal memuat permohonan.</div>';
        }
    };

    window.approveCreationPermission = async function (username, amount, btn) {
        const card = document.getElementById(`req-creation-${username}`);
        const allBtns = card ? card.querySelectorAll('button') : [btn];
        allBtns.forEach(b => b.disabled = true);
        btn.innerText = "Mengonfirmasi...";

        try {
            const res = await fetch('/api/permission/approve_creation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama_akun: username, jumlah: amount })
            });
            const data = await res.json();

            if (data.success) {
                btn.innerText = "✓ Diizinkan";
                btn.style.background = "#2ecc71";
                btn.style.boxShadow = "none";
                if (typeof showToast === 'function') {
                    showToast(`Kuota +${amount} marker disetujui!`, "success");
                }

                setTimeout(() => {
                    if (card) {
                        card.style.transition = "all 0.4s ease";
                        card.style.opacity = "0";
                        card.style.transform = "scale(0.9)";
                        setTimeout(() => {
                            card.remove();
                            const container = document.getElementById('creationRequestsList');
                            if (container && container.children.length === 0) {
                                container.innerHTML = '<div style="text-align: center; color: #7a8a94; padding: 20px;">Tidak ada permohonan kuota baru.</div>';
                            }
                        }, 400);
                    }
                }, 800);
            } else {
                allBtns.forEach(b => b.disabled = false);
                btn.innerText = "Izinkan";
                if (typeof showToast === 'function') {
                    showToast("Gagal menyetujui kuota: " + (data.error || "error"), "error");
                }
            }
        } catch (err) {
            console.error(err);
            allBtns.forEach(b => b.disabled = false);
            btn.innerText = "Izinkan";
            if (typeof showToast === 'function') {
                showToast("Terjadi kesalahan jaringan.", "error");
            }
        }
    };

    window.rejectCreationPermission = async function (username, btn) {
        const card = document.getElementById(`req-creation-${username}`);
        const allBtns = card ? card.querySelectorAll('button') : [btn];
        allBtns.forEach(b => b.disabled = true);
        btn.innerText = "Menolak...";

        try {
            const res = await fetch('/api/permission/reject_creation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama_akun: username })
            });
            const data = await res.json();

            if (data.success) {
                btn.innerText = "✕ Ditolak";
                btn.style.background = "#ff6b6b";
                btn.style.color = "white";
                btn.style.boxShadow = "none";
                if (typeof showToast === 'function') {
                    showToast("Permohonan kuota ditolak.", "info");
                }

                setTimeout(() => {
                    if (card) {
                        card.style.transition = "all 0.4s ease";
                        card.style.opacity = "0";
                        card.style.transform = "scale(0.9)";
                        setTimeout(() => {
                            card.remove();
                            const container = document.getElementById('creationRequestsList');
                            if (container && container.children.length === 0) {
                                container.innerHTML = '<div style="text-align: center; color: #7a8a94; padding: 20px;">Tidak ada permohonan kuota baru.</div>';
                            }
                        }, 400);
                    }
                }, 800);
            } else {
                allBtns.forEach(b => b.disabled = false);
                btn.innerText = "Tolak";
                if (typeof showToast === 'function') {
                    showToast("Gagal menolak permohonan: " + (data.error || "error"), "error");
                }
            }
        } catch (err) {
            console.error(err);
            allBtns.forEach(b => b.disabled = false);
            btn.innerText = "Tolak";
            if (typeof showToast === 'function') {
                showToast("Terjadi kesalahan jaringan.", "error");
            }
        }
    };
})();
