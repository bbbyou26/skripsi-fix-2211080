/* ==========================================
   PROMOTION PAGE BUILDER - COMPONENTS & PLUGINS ENGINE
   (Extracted and restored from BOWO source)
   ========================================== */

// ══════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════
// 1. CAROUSEL COMPONENT & HELPERS (Container-Level Multi-Slide)
// ══════════════════════════════════════════════════════════════
function createCarouselDOM(item) {
  const carousel = document.createElement("div");
  carousel.className = "element-carousel";
  carousel.style.position = "relative";
  carousel.style.width = "100%";
  carousel.style.height = "100%";
  carousel.style.overflow = "hidden";
  carousel.style.borderRadius = "inherit";
  carousel.style.background = "transparent";

  const numSlides = item.slidesCount !== undefined ? Math.max(1, parseInt(item.slidesCount)) : 3;
  let activeIndex = item.carouselActiveIndex || 0;
  if (activeIndex >= numSlides) activeIndex = 0;
  item.carouselActiveIndex = activeIndex;
  item.slidesCount = numSlides;

  const slidesWrapper = document.createElement("div");
  slidesWrapper.className = "carousel-slides-wrapper";
  slidesWrapper.style.position = "relative";
  slidesWrapper.style.width = "100%";
  slidesWrapper.style.height = "100%";

  for (let idx = 0; idx < numSlides; idx++) {
    const slide = document.createElement("div");
    const slideId = `${item.id}_slide_${idx}`;
    slide.className = `carousel-slide ${idx === activeIndex ? "active" : ""}`;
    slide.id = slideId;
    slide.dataset.slideIndex = idx;
    slide.style.position = "absolute";
    slide.style.top = "0";
    slide.style.left = "0";
    slide.style.width = "100%";
    slide.style.height = "100%";
    slide.style.boxSizing = "border-box";
    slide.style.display = idx === activeIndex ? "flex" : "none";
    slide.style.flexDirection = "column";
    slide.style.alignItems = "center";
    slide.style.justifyContent = "center";
    slide.style.opacity = idx === activeIndex ? "1" : "0";
    slide.style.transition = "opacity 0.4s ease-in-out";
    slide.style.zIndex = idx === activeIndex ? "2" : "1";
    slide.style.padding = "12px";

    slidesWrapper.appendChild(slide);
  }
  carousel.appendChild(slidesWrapper);

  // Styling custom for arrows (Supports Solid, Linear Gradient, Radial Gradient)
  const resolveFillDataToCss = (fd, fallback) => {
    if (!fd) return fallback;
    if (fd.type === "solid" || !fd.type) {
      return hexToRgba(fd.color || fallback, (fd.opacity !== undefined ? fd.opacity : 100) / 100);
    }
    return typeof buildGradientCss === "function" ? buildGradientCss(fd) : fallback;
  };

  const arrowBg = item.arrowBgData ? resolveFillDataToCss(item.arrowBgData, "rgba(0, 0, 0, 0.45)") : (item.arrowBgColor || "rgba(0, 0, 0, 0.45)");
  const arrowColor = item.arrowColorData ? (item.arrowColorData.type === "solid" || !item.arrowColorData.type ? hexToRgba(item.arrowColorData.color || "#ffffff", (item.arrowColorData.opacity !== undefined ? item.arrowColorData.opacity : 100) / 100) : item.arrowColorData.color || "#ffffff") : (item.arrowColor || "#ffffff");
  const arrowHoverBg = item.arrowHoverBgData ? resolveFillDataToCss(item.arrowHoverBgData, "#38a0c4") : (item.arrowHoverBgColor || "#38a0c4");
  const arrowRadius = item.arrowShape || "50%";

  // Left arrow
  const prevBtn = document.createElement("button");
  prevBtn.className = "carousel-control prev";
  prevBtn.innerHTML = "&#10094;";
  prevBtn.style.position = "absolute";
  prevBtn.style.top = "50%";
  prevBtn.style.left = "10px";
  prevBtn.style.transform = "translateY(-50%)";
  prevBtn.style.background = arrowBg;
  prevBtn.style.color = arrowColor;
  prevBtn.style.borderRadius = arrowRadius;
  prevBtn.style.width = "34px";
  prevBtn.style.height = "34px";
  prevBtn.style.border = "none";
  prevBtn.style.display = "flex";
  prevBtn.style.alignItems = "center";
  prevBtn.style.justifyContent = "center";
  prevBtn.style.cursor = "pointer";
  prevBtn.style.zIndex = "10";
  prevBtn.style.transition = "background 0.2s, color 0.2s";

  prevBtn.onmouseenter = () => prevBtn.style.background = arrowHoverBg;
  prevBtn.onmouseleave = () => prevBtn.style.background = arrowBg;

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateCarousel(item.id, -1);
  });

  // Right arrow
  const nextBtn = document.createElement("button");
  nextBtn.className = "carousel-control next";
  nextBtn.innerHTML = "&#10095;";
  nextBtn.style.position = "absolute";
  nextBtn.style.top = "50%";
  nextBtn.style.right = "10px";
  nextBtn.style.transform = "translateY(-50%)";
  nextBtn.style.background = arrowBg;
  nextBtn.style.color = arrowColor;
  nextBtn.style.borderRadius = arrowRadius;
  nextBtn.style.width = "34px";
  nextBtn.style.height = "34px";
  nextBtn.style.border = "none";
  nextBtn.style.display = "flex";
  nextBtn.style.alignItems = "center";
  nextBtn.style.justifyContent = "center";
  nextBtn.style.cursor = "pointer";
  nextBtn.style.zIndex = "10";
  nextBtn.style.transition = "background 0.2s, color 0.2s";

  nextBtn.onmouseenter = () => nextBtn.style.background = arrowHoverBg;
  nextBtn.onmouseleave = () => nextBtn.style.background = arrowBg;

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateCarousel(item.id, 1);
  });

  carousel.appendChild(prevBtn);
  carousel.appendChild(nextBtn);

  // Dots Navigation
  const dotsContainer = document.createElement("div");
  dotsContainer.className = "carousel-dots";
  dotsContainer.style.position = "absolute";
  dotsContainer.style.bottom = "8px";
  dotsContainer.style.left = "50%";
  dotsContainer.style.transform = "translateX(-50%)";
  dotsContainer.style.display = "flex";
  dotsContainer.style.gap = "6px";
  dotsContainer.style.zIndex = "10";

  for (let idx = 0; idx < numSlides; idx++) {
    const dot = document.createElement("span");
    dot.className = `carousel-dot ${idx === activeIndex ? "active" : ""}`;
    dot.style.width = idx === activeIndex ? "18px" : "8px";
    dot.style.height = "8px";
    dot.style.borderRadius = "4px";
    dot.style.backgroundColor = idx === activeIndex ? arrowHoverBg : "rgba(255, 255, 255, 0.6)";
    dot.style.cursor = "pointer";
    dot.style.transition = "all 0.3s";
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      setCarouselActiveIndex(item.id, idx);
    });
    dotsContainer.appendChild(dot);
  }
  carousel.appendChild(dotsContainer);

  return carousel;
}

function navigateCarousel(elementId, direction) {
  const data = elements.find(item => item.id === elementId);
  if (!data) return;

  const numSlides = data.slidesCount || 3;
  let activeIndex = data.carouselActiveIndex || 0;
  activeIndex = (activeIndex + direction + numSlides) % numSlides;
  data.carouselActiveIndex = activeIndex;

  renderCanvas();
  if (selectedElementId === elementId && typeof updatePropertiesDrawer === "function") {
    updatePropertiesDrawer(data);
  }
}

function setCarouselActiveIndex(elementId, idx) {
  const data = elements.find(item => item.id === elementId);
  if (!data) return;
  data.carouselActiveIndex = idx;
  renderCanvas();
  if (selectedElementId === elementId && typeof updatePropertiesDrawer === "function") {
    updatePropertiesDrawer(data);
  }
}

function addCarouselSlide() {
  if (!selectedElementId) return;
  const data = elements.find(item => item.id === selectedElementId);
  if (!data || data.type !== "carousel") return;

  data.slidesCount = (data.slidesCount || 3) + 1;
  data.carouselActiveIndex = data.slidesCount - 1;

  renderCanvas();
  if (typeof updatePropertiesDrawer === "function") updatePropertiesDrawer(data);
  if (typeof pushHistory === "function") pushHistory();
}

function deleteCarouselSlide() {
  if (!selectedElementId) return;
  const data = elements.find(item => item.id === selectedElementId);
  if (!data || data.type !== "carousel") return;

  if ((data.slidesCount || 3) <= 1) return;

  const currentIdx = data.carouselActiveIndex || 0;
  const slideId = `${data.id}_slide_${currentIdx}`;

  elements.forEach(child => {
    if (child.parentId === slideId || (child.parentId === data.id && child.slideIndex === currentIdx)) {
      child.parentId = null;
    } else if (child.parentId === data.id && child.slideIndex > currentIdx) {
      child.slideIndex -= 1;
    }
  });

  data.slidesCount -= 1;
  data.carouselActiveIndex = Math.max(0, currentIdx - 1);

  renderCanvas();
  if (typeof updatePropertiesDrawer === "function") updatePropertiesDrawer(data);
  if (typeof pushHistory === "function") pushHistory();
}

function updateCarouselArrowConfig(key, value) {
  if (!selectedElementId) return;
  const data = elements.find(item => item.id === selectedElementId);
  if (!data || data.type !== "carousel") return;

  data[key] = value;

  if (typeof updateCarouselColorTriggers === "function") {
    updateCarouselColorTriggers(data);
  }

  renderCanvas();
  if (typeof pushHistory === "function") pushHistory();
}

function startCarouselAutoplay(item) {
  if (carouselIntervals[item.id]) {
    clearInterval(carouselIntervals[item.id]);
    delete carouselIntervals[item.id];
  }

  const speed = item.carouselSpeed !== undefined ? parseInt(item.carouselSpeed) : 3;
  if (speed > 0 && !isEditMode) {
    carouselIntervals[item.id] = setInterval(() => {
      const numSlides = item.slidesCount || 3;
      let activeIndex = item.carouselActiveIndex || 0;
      activeIndex = (activeIndex + 1) % numSlides;
      item.carouselActiveIndex = activeIndex;

      const div = document.getElementById(item.id);
      if (div) {
        const slides = div.querySelectorAll(".carousel-slide");
        const dots = div.querySelectorAll(".carousel-dot");
        slides.forEach((slide, idx) => {
          if (idx === activeIndex) {
            slide.classList.add("active");
            slide.style.display = "flex";
            slide.style.opacity = "1";
          } else {
            slide.classList.remove("active");
            slide.style.display = "none";
            slide.style.opacity = "0";
          }
        });
        dots.forEach((dot, idx) => {
          if (idx === activeIndex) dot.classList.add("active");
          else dot.classList.remove("active");
        });
      }
    }, speed * 1000);
  }
}

function updateSelectedCarouselSpeed(val) {
  const data = elements.find(item => item.id === selectedElementId);
  if (!data || data.type !== "carousel") return;
  data.carouselSpeed = parseInt(val) || 0;

  startCarouselAutoplay(data);
}

window.addCarouselSlide = addCarouselSlide;
window.deleteCarouselSlide = deleteCarouselSlide;
window.setCarouselActiveIndex = setCarouselActiveIndex;
window.updateCarouselArrowConfig = updateCarouselArrowConfig;
window.updateSelectedCarouselSpeed = updateSelectedCarouselSpeed;


// ══════════════════════════════════════════════════════════════
// 2. MEDIA EMBED COMPONENT & HELPERS
// ══════════════════════════════════════════════════════════════
function cleanInputUrl(input) {
  if (!input || typeof input !== "string") return "";
  let str = input.trim();
  const iframeSrcMatch = str.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    return iframeSrcMatch[1];
  }
  return str;
}

function extractYouTubeId(url) {
  if (!url) return null;
  const str = cleanInputUrl(url);

  if (/^[a-zA-Z0-9_-]{11}$/.test(str.trim())) {
    return str.trim();
  }

  const patterns = [
    /v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
    /live\/([a-zA-Z0-9_-]{11})/,
    /v\/([a-zA-Z0-9_-]{11})/
  ];

  for (const p of patterns) {
    const m = str.match(p);
    if (m && m[1]) return m[1];
  }
  return null;
}

function getYouTubeEmbedUrl(url, autoplay = true) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  const autoParam = autoplay ? "autoplay=1&mute=1" : "autoplay=0";
  return `https://www.youtube.com/embed/${videoId}?${autoParam}`;
}

function getMapsEmbedUrl(url) {
  if (!url) return null;
  const cleaned = cleanInputUrl(url);
  if (cleaned.includes("google.com/maps/embed") || cleaned.includes("google.com/maps/d/embed")) {
    return cleaned;
  }
  if (cleaned.includes("google.com/maps") || cleaned.includes("maps.app.goo.gl")) {
    let query = "";
    if (cleaned.includes("/place/")) {
      const parts = cleaned.split("/place/");
      if (parts[1]) {
        query = parts[1].split("/")[0].replace(/\+/g, " ");
      }
    } else if (cleaned.includes("q=")) {
      const m = cleaned.match(/q=([^&]+)/);
      if (m) query = decodeURIComponent(m[1]);
    }
    if (!query) {
      const coordMatch = cleaned.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        query = `${coordMatch[1]},${coordMatch[2]}`;
      }
    }
    if (query) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(cleaned)}&output=embed`;
  }
  return null;
}

function getTikTokEmbedUrl(url) {
  if (!url) return null;
  const cleaned = cleanInputUrl(url);
  const match = cleaned.match(/(?:tiktok\.com\/(?:@[\w.-]+\/video\/|v\/|t\/)|video\/)(\d+)/i);
  if (match && match[1]) {
    return `https://www.tiktok.com/embed/v2/${match[1]}`;
  }
  return null;
}

function getInstagramEmbedUrl(url) {
  if (!url) return null;
  const cleaned = cleanInputUrl(url);
  const match = cleaned.match(/instagram\.com\/(p|reel|tv)\/([^/?#&]+)/i);
  if (match && match[1] && match[2]) {
    return `https://www.instagram.com/${match[1]}/${match[2]}/embed`;
  }
  return null;
}

function getFacebookEmbedUrl(url) {
  if (!url) return null;
  const cleaned = cleanInputUrl(url);
  if (cleaned.includes("facebook.com") || cleaned.includes("fb.watch")) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleaned)}&show_text=false`;
  }
  return null;
}

function isDirectVideoUrl(url) {
  if (!url) return false;
  const cleaned = cleanInputUrl(url).toLowerCase();
  return (
    cleaned.endsWith(".mp4") ||
    cleaned.endsWith(".webm") ||
    cleaned.endsWith(".ogg") ||
    cleaned.endsWith(".mov") ||
    cleaned.startsWith("data:video")
  );
}

function createMediaEmbedDOM(item) {
  const wrapper = document.createElement("div");
  wrapper.className = "element-media-embed";
  wrapper.style.width = "100%";
  wrapper.style.height = "100%";
  wrapper.style.position = "relative";
  wrapper.style.borderRadius = "inherit";
  wrapper.style.overflow = "hidden";
  wrapper.style.background = "transparent";
  wrapper.style.backgroundColor = "transparent";
  wrapper.style.boxSizing = "border-box";

  const resolveFillDataToCss = (fd, fallback) => {
    if (!fd) return fallback;
    if (fd.type === "solid" || !fd.type) {
      return typeof hexToRgba === "function" ? hexToRgba(fd.color || fallback, (fd.opacity !== undefined ? fd.opacity : 100) / 100) : (fd.color || fallback);
    }
    return typeof buildGradientCss === "function" ? buildGradientCss(fd) : fallback;
  };

  const rawUrl = item.url || "";
  const cleanedUrl = cleanInputUrl(rawUrl);
  const autoplay = item.autoplay !== false;
  const showHeader = item.showHeader !== false;
  const headerBg = item.headerBgData ? resolveFillDataToCss(item.headerBgData, "#e2f0f5") : (item.headerBg || "#e2f0f5");
  const headerColor = item.headerColorData ? resolveFillDataToCss(item.headerColorData, "#2c5d6b") : (item.headerColor || "#2c5d6b");
  const coverImage = item.coverImage || "";
  const customTitle = item.customTitle || "";
  const customDesc = item.customDesc || "";
  const showBtn = item.showBtn !== false;
  const btnText = item.btnText || "Buka Link / Website";
  const btnBg = item.btnBgData ? resolveFillDataToCss(item.btnBgData, "#38a0c4") : (item.btnBg || "#38a0c4");
  const btnColor = item.btnColorData ? resolveFillDataToCss(item.btnColorData, "#ffffff") : (item.btnColor || "#ffffff");

  const scaleVal = (parseInt(item.frameScale) || 100) / 100;

  const ytUrl = getYouTubeEmbedUrl(cleanedUrl, autoplay);
  const mapsUrl = getMapsEmbedUrl(cleanedUrl);
  const tiktokUrl = getTikTokEmbedUrl(cleanedUrl);
  const igUrl = getInstagramEmbedUrl(cleanedUrl);
  const fbUrl = getFacebookEmbedUrl(cleanedUrl);
  const isVideo = isDirectVideoUrl(cleanedUrl);

  let embedSrc = null;
  if (ytUrl) embedSrc = ytUrl;
  else if (mapsUrl) embedSrc = mapsUrl;
  else if (tiktokUrl) embedSrc = tiktokUrl;
  else if (igUrl) embedSrc = igUrl;
  else if (fbUrl) embedSrc = fbUrl;

  const contentWrap = document.createElement("div");
  contentWrap.className = "media-content-wrap";
  contentWrap.style.width = "100%";
  contentWrap.style.height = "100%";
  contentWrap.style.overflow = "hidden";
  contentWrap.style.display = "flex";
  contentWrap.style.alignItems = "center";
  contentWrap.style.justifyContent = "center";
  contentWrap.style.boxSizing = "border-box";
  contentWrap.style.background = "transparent";
  contentWrap.style.backgroundColor = "transparent";

  // THE BROWSER MOCKUP FRAME CONTAINER
  const mockup = document.createElement("div");
  mockup.className = "browser-mockup";
  mockup.style.display = "flex";
  mockup.style.flexDirection = "column";
  mockup.style.width = "100%";
  mockup.style.height = "100%";
  mockup.style.background = "transparent";
  mockup.style.backgroundColor = "transparent";
  mockup.style.border = "1px solid rgba(0,0,0,0.12)";
  mockup.style.borderRadius = "10px";
  mockup.style.overflow = "hidden";
  mockup.style.position = "relative";
  mockup.style.boxSizing = "border-box";

  // 1. BROWSER HEADER BAR
  if (showHeader) {
    const header = document.createElement("div");
    header.className = "browser-header";
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.padding = "6px 12px";
    header.style.background = headerBg;
    header.style.borderBottom = "1px solid rgba(0,0,0,0.08)";
    header.style.height = "36px";
    header.style.flexShrink = "0";
    header.style.zIndex = "2";

    const address = document.createElement("div");
    address.className = "browser-address";
    address.style.flex = "1";
    address.style.display = "flex";
    address.style.alignItems = "center";
    address.style.gap = "8px";
    address.style.background = "#ffffff";
    address.style.padding = "4px 10px";
    address.style.borderRadius = "6px";
    address.style.fontSize = "11px";
    address.style.color = headerColor;
    address.style.border = "1px solid rgba(0,0,0,0.1)";
    address.style.overflow = "hidden";
    address.style.whiteSpace = "nowrap";
    address.style.textOverflow = "ellipsis";

    const icon = document.createElement("img");
    icon.src = "/static/image/icon/browser.svg";
    icon.alt = "Browser";
    icon.style.width = "14px";
    icon.style.height = "14px";
    icon.style.flexShrink = "0";

    const urlText = document.createElement("span");
    urlText.innerText = cleanedUrl || "https://...";
    urlText.style.overflow = "hidden";
    urlText.style.textOverflow = "ellipsis";

    address.appendChild(icon);
    address.appendChild(urlText);
    header.appendChild(address);
    mockup.appendChild(header);
  }

  // 2. BROWSER CONTENT BODY
  const body = document.createElement("div");
  body.className = "browser-content";
  body.style.flex = "1";
  body.style.width = "100%";
  body.style.height = "100%";
  body.style.position = "relative";
  body.style.overflow = "hidden";
  body.style.background = "transparent";
  body.style.backgroundColor = "transparent";

  if (isVideo) {
    const video = document.createElement("video");
    video.src = cleanedUrl;
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";
    video.style.display = "block";
    video.style.background = "transparent";
    video.controls = true;
    video.playsInline = true;
    if (autoplay) {
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
    }
    body.appendChild(video);
  } else if (embedSrc) {
    const iframe = document.createElement("iframe");
    iframe.src = embedSrc;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.display = "block";
    iframe.style.background = "transparent";
    iframe.style.backgroundColor = "transparent";
    iframe.setAttribute("allowtransparency", "true");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
    body.appendChild(iframe);
  } else {
    // Card Fallback when no URL is entered
    if (coverImage) {
      const cover = document.createElement("div");
      cover.style.position = "absolute";
      cover.style.inset = "0";
      cover.style.background = `url('${coverImage}') center/cover no-repeat`;
      cover.style.zIndex = "1";
      body.appendChild(cover);

      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.inset = "0";
      overlay.style.background = "rgba(0,0,0,0.25)";
      overlay.style.zIndex = "2";
      body.appendChild(overlay);
    }

    const isGoogleMapsLink = cleanedUrl.includes("google.com/maps") || cleanedUrl.includes("maps.app.goo.gl");
    const defaultTitle = isGoogleMapsLink ? "Google Maps" : (cleanedUrl ? "Kunjungi Situs Web" : "Media Embed");
    const displayTitle = customTitle || defaultTitle;
    const defaultDesc = isGoogleMapsLink ? "Klik untuk melihat lokasi di peta" : (cleanedUrl || "Masukkan URL YouTube, Google Maps, TikTok, IG, FB, atau MP4");
    const displayDesc = customDesc || defaultDesc;
    const iconPath = isGoogleMapsLink ? "/static/image/icon/pin-map.svg" : "/static/image/icon/browser.svg";

    const descColor = item.descColorData ? resolveFillDataToCss(item.descColorData, (coverImage ? "#f0f8ff" : "#7a8a94")) : (item.descColor || (coverImage ? "#f0f8ff" : "#7a8a94"));

    const innerContent = document.createElement("div");
    innerContent.style.position = "relative";
    innerContent.style.zIndex = "3";
    innerContent.style.display = "flex";
    innerContent.style.flexDirection = "column";
    innerContent.style.alignItems = "center";
    innerContent.style.justifyContent = "center";
    innerContent.style.padding = "16px";
    innerContent.style.height = "100%";
    innerContent.style.textAlign = "center";

    if (!coverImage) {
      const cardIcon = document.createElement("img");
      cardIcon.src = iconPath;
      cardIcon.alt = "Icon";
      cardIcon.style.width = "40px";
      cardIcon.style.height = "40px";
      cardIcon.style.marginBottom = "8px";
      innerContent.appendChild(cardIcon);
    }

    const titleDiv = document.createElement("div");
    titleDiv.style.fontSize = "14px";
    titleDiv.style.fontWeight = "700";

    const titleFd = item.titleColorData;
    if (titleFd && titleFd.type && titleFd.type !== "solid" && titleFd.enabled) {
      const gradCss = typeof buildGradientCss === "function" ? buildGradientCss(titleFd) : (titleFd.color || "#2c5d6b");
      titleDiv.style.background = gradCss;
      titleDiv.style.backgroundClip = "text";
      titleDiv.style.webkitBackgroundClip = "text";
      titleDiv.style.webkitTextFillColor = "transparent";
      titleDiv.style.color = "transparent";
    } else {
      const resolvedTitleColor = titleFd ? resolveFillDataToCss(titleFd, (coverImage ? "#ffffff" : "#2c5d6b")) : (item.titleColor || (coverImage ? "#ffffff" : "#2c5d6b"));
      titleDiv.style.color = resolvedTitleColor;
    }

    if (coverImage) titleDiv.style.textShadow = "0 1px 3px rgba(0,0,0,0.8)";
    titleDiv.style.marginBottom = "4px";
    titleDiv.innerText = displayTitle;
    innerContent.appendChild(titleDiv);

    const descDiv = document.createElement("div");
    descDiv.style.fontSize = "11px";
    descDiv.style.color = descColor;
    if (coverImage) descDiv.style.textShadow = "0 1px 2px rgba(0,0,0,0.8)";
    descDiv.style.maxWidth = "85%";
    descDiv.style.wordBreak = "break-all";
    descDiv.style.lineHeight = "1.4";
    descDiv.innerText = displayDesc;
    innerContent.appendChild(descDiv);

    if (showBtn) {
      const ctaBtn = document.createElement("div");
      ctaBtn.className = "btn-cta";
      ctaBtn.style.display = "inline-flex";
      ctaBtn.style.alignItems = "center";
      ctaBtn.style.gap = "6px";
      ctaBtn.style.marginTop = "12px";
      ctaBtn.style.padding = "8px 18px";
      ctaBtn.style.background = btnBg;
      ctaBtn.style.color = btnColor;
      ctaBtn.style.fontSize = "11px";
      ctaBtn.style.fontWeight = "700";
      ctaBtn.style.borderRadius = "6px";
      ctaBtn.style.boxShadow = "0 3px 8px rgba(0,0,0,0.2)";
      ctaBtn.style.cursor = "pointer";
      ctaBtn.innerHTML = `<span>${btnText}</span><span style="font-size:12px;">↗</span>`;
      innerContent.appendChild(ctaBtn);
    }

    body.appendChild(innerContent);
  }

  mockup.appendChild(body);

  if (scaleVal !== 1) {
    mockup.style.transform = `scale(${scaleVal})`;
    mockup.style.transformOrigin = "center center";
    mockup.style.transition = "transform 0.05s ease-out";
  }

  contentWrap.appendChild(mockup);
  wrapper.appendChild(contentWrap);

  const overlay = document.createElement("div");
  overlay.className = "media-embed-overlay";
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.zIndex = "4";
  overlay.style.cursor = "pointer";
  overlay.style.background = "transparent";

  if (!isEditMode && cleanedUrl) {
    overlay.addEventListener("click", (e) => {
      e.stopPropagation();
      window.open(cleanedUrl, "_blank");
    });
  }
  wrapper.appendChild(overlay);

  return wrapper;
}

function updateMediaEmbedConfig(key, val) {
  const data = elements.find(item => item.id === selectedElementId);
  if (!data || data.type !== "media_embed") return;

  data[key] = val;
  if (typeof updateMediaEmbedColorTriggers === "function") {
    updateMediaEmbedColorTriggers(data);
  }
  renderCanvas();
  if (typeof pushHistoryDebounced === "function") pushHistoryDebounced();
  else if (typeof pushHistory === "function") pushHistory();
}

function updateMediaEmbedLiveStyle(key, val) {
  const data = elements.find(item => item.id === selectedElementId);
  if (!data || data.type !== "media_embed") return;

  data[key] = val;

  const elDom = document.getElementById(selectedElementId);
  if (!elDom) {
    renderCanvas();
    return;
  }

  const contentWrap = elDom.querySelector(".media-content-wrap");

  if (key === "frameScale") {
    const scaleVal = (parseInt(val) || 100) / 100;
    if (contentWrap) {
      const innerTarget = contentWrap.querySelector("iframe, video, .browser-mockup");
      if (innerTarget) {
        innerTarget.style.transform = `scale(${scaleVal})`;
        innerTarget.style.transformOrigin = "center center";
        innerTarget.style.transition = "transform 0.05s ease-out";
      }
    }
  } else {
    renderCanvas();
  }

  if (typeof pushHistoryDebounced === "function") pushHistoryDebounced();
  else if (typeof pushHistory === "function") pushHistory();
}

function toggleMediaSection(btn, bodyId) {
  const body = document.getElementById(bodyId);
  if (!body) return;
  const isHidden = body.classList.contains("hidden");
  if (isHidden) {
    body.classList.remove("hidden");
    if (btn) btn.classList.add("fs-active");
  } else {
    body.classList.add("hidden");
    if (btn) btn.classList.remove("fs-active");
  }
}

function uploadMediaCoverImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const dataUrl = e.target.result;
    if (document.getElementById("propMediaCoverImage")) {
      document.getElementById("propMediaCoverImage").value = dataUrl;
    }
    updateMediaEmbedConfig("coverImage", dataUrl);
  };
  reader.readAsDataURL(file);
}

function createGenuiChatbotElement(item) {
  const cfg = item.chatbotConfig || {
    botName: "AI Assistant",
    botSubtitle: "Online",
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
    inputBg: "#ffffff",
    inputBorderColor: "#bddce7",
    inputTextColor: "#2c5d6b",
    inputBorderRadius: "12px",
    placeholderText: "Ketik pertanyaan RAG...",
    sendBtnBg: "#38a0c4",
    sendBtnTextColor: "#ffffff"
  };

  const resolveFillDataToCss = (fd, fallback) => {
    if (!fd) return fallback;
    if (fd.type === "solid" || !fd.type) {
      return typeof hexToRgba === "function" ? hexToRgba(fd.color || fallback, (fd.opacity !== undefined ? fd.opacity : 100) / 100) : (fd.color || fallback);
    }
    return typeof buildGradientCss === "function" ? buildGradientCss(fd) : fallback;
  };

  const resolveSolidToCss = (fd, fallback) => {
    if (!fd) return fallback;
    return typeof hexToRgba === "function" ? hexToRgba(fd.color || fallback, (fd.opacity !== undefined ? fd.opacity : 100) / 100) : (fd.color || fallback);
  };

  // Solid, Linear, Radial
  const headerBg = cfg.chatHeaderBgData ? resolveFillDataToCss(cfg.chatHeaderBgData, "#38a0c4") : (cfg.headerBg || cfg.botBg || "#38a0c4");
  const cardBg = cfg.chatCardBgData ? resolveFillDataToCss(cfg.chatCardBgData, "#fafcfd") : (cfg.cardBg || "#fafcfd");
  const inputContainerBg = cfg.chatInputContainerBgData ? resolveFillDataToCss(cfg.chatInputContainerBgData, "#ffffff") : ((cfg.inputContainerBg && cfg.inputContainerBg !== "transparent") ? cfg.inputContainerBg : "#ffffff");
  const botBg = cfg.chatBotBgData ? resolveFillDataToCss(cfg.chatBotBgData, "#38a0c4") : (cfg.botBg || "#38a0c4");
  const userBg = cfg.chatUserBgData ? resolveFillDataToCss(cfg.chatUserBgData, "#0F4C75") : (cfg.userBg || "#0F4C75");
  const sendBtnBg = cfg.chatSendBtnBgData ? resolveFillDataToCss(cfg.chatSendBtnBgData, "#38a0c4") : (cfg.sendBtnBg || cfg.botBg || "#38a0c4");

  // Solid-Only
  const headerTextColor = cfg.chatHeaderTextColorData ? resolveSolidToCss(cfg.chatHeaderTextColorData, "#ffffff") : (cfg.headerTextColor || "#ffffff");
  const botTextColor = cfg.chatBotTextColorData ? resolveSolidToCss(cfg.chatBotTextColorData, "#ffffff") : (cfg.botTextColor || cfg.textColor || "#ffffff");
  const userTextColor = cfg.chatUserTextColorData ? resolveSolidToCss(cfg.chatUserTextColorData, "#ffffff") : (cfg.userTextColor || cfg.textColor || "#ffffff");
  const chipBg = cfg.chatChipBgData ? resolveSolidToCss(cfg.chatChipBgData, "#ffffff") : (cfg.chipBg || "#ffffff");
  const chipTextColor = cfg.chatChipTextColorData ? resolveSolidToCss(cfg.chatChipTextColorData, "#0F4C75") : (cfg.chipTextColor || "#0F4C75");
  const chipBorderColor = cfg.chatChipBorderColorData ? resolveSolidToCss(cfg.chatChipBorderColorData, "#bddce7") : (cfg.chipBorderColor || "#bddce7");
  const inputBg = cfg.chatInputBgData ? resolveSolidToCss(cfg.chatInputBgData, "#ffffff") : (cfg.inputBg || "#ffffff");
  const inputBorderColor = cfg.chatInputBorderColorData ? resolveSolidToCss(cfg.chatInputBorderColorData, "#bddce7") : (cfg.inputBorderColor || "#bddce7");
  const inputTextColor = cfg.chatInputTextColorData ? resolveSolidToCss(cfg.chatInputTextColorData, "#2c5d6b") : (cfg.inputTextColor || "#2c5d6b");
  const scrollbarColor = cfg.chatScrollbarColorData ? resolveSolidToCss(cfg.chatScrollbarColorData, "#bddce7") : (cfg.scrollbarColor || "#bddce7");
  const sendBtnTextColor = cfg.chatSendBtnTextColorData ? resolveSolidToCss(cfg.chatSendBtnTextColorData, "#ffffff") : (cfg.sendBtnTextColor || "#ffffff");

  const wrapper = document.createElement("div");
  wrapper.className = "genui-chatbot-wrapper";
  wrapper.style.width = "100%";
  wrapper.style.height = "100%";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.background = cardBg;
  wrapper.style.borderRadius = item.style && item.style.borderRadius ? item.style.borderRadius : "14px";
  wrapper.style.border = "1px solid #bddce7";
  wrapper.style.overflow = "hidden";
  wrapper.style.boxSizing = "border-box";
  wrapper.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";

  const botAvatarSrc = cfg.avatarUrl || "/static/image/icon/elemen-genui-chatbot.svg";
  const botAvatarFilter = cfg.avatarUrl ? "none" : "brightness(0) invert(1)";
  const userAvatarSrc = cfg.userAvatarUrl || "/static/image/icon/elemen-testimoni.svg";

  // Helper to wrap bubble with avatar if enabled
  function createBubbleWithAvatar(bubbleEl, isBot) {
    if (!cfg.showBubbleAvatars) {
      return bubbleEl;
    }
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "flex-end";
    container.style.gap = "6px";
    container.style.maxWidth = "90%";
    container.style.alignSelf = isBot ? (cfg.botAlign || "flex-start") : (cfg.userAlign || "flex-end");

    const avatarDiv = document.createElement("div");
    avatarDiv.style.width = "24px";
    avatarDiv.style.height = "24px";
    avatarDiv.style.borderRadius = "50%";
    avatarDiv.style.overflow = "hidden";
    avatarDiv.style.background = isBot ? "rgba(56, 160, 196, 0.2)" : "rgba(15, 76, 117, 0.2)";
    avatarDiv.style.flexShrink = "0";
    avatarDiv.style.display = "flex";
    avatarDiv.style.alignItems = "center";
    avatarDiv.style.justifyContent = "center";

    const avatarImg = document.createElement("img");
    avatarImg.src = isBot ? botAvatarSrc : userAvatarSrc;
    avatarImg.style.width = "100%";
    avatarImg.style.height = "100%";
    avatarImg.style.objectFit = "cover";
    if (isBot && !cfg.avatarUrl) avatarImg.style.filter = "brightness(0) invert(1)";

    avatarDiv.appendChild(avatarImg);

    if (isBot) {
      container.appendChild(avatarDiv);
      container.appendChild(bubbleEl);
    } else {
      container.appendChild(bubbleEl);
      container.appendChild(avatarDiv);
    }
    return container;
  }

  // Header Bar (Can be shown or hidden via showHeader setting)
  if (cfg.showHeader !== false) {
    const headerAlign = cfg.headerAlign || "left";
    const header = document.createElement("div");
    header.style.padding = "10px 14px";
    header.style.background = headerBg;
    header.style.color = headerTextColor;
    header.style.fontWeight = "bold";
    header.style.fontSize = "13px";
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.gap = "10px";
    header.style.boxSizing = "border-box";
    header.style.width = "100%";
    header.style.margin = "0";

    if (headerAlign === "right") {
      header.style.flexDirection = "row-reverse";
      header.style.justifyContent = "flex-start";
    } else if (headerAlign === "center") {
      header.style.flexDirection = "row";
      header.style.justifyContent = "center";
    } else {
      header.style.flexDirection = "row";
      header.style.justifyContent = "flex-start";
    }

    const textAlign = headerAlign === "right" ? "right" : (headerAlign === "center" ? "center" : "left");

    header.innerHTML = `
      <div style="width:30px;height:30px;border-radius:50%;overflow:hidden;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <img src="${botAvatarSrc}" style="width:100%;height:100%;object-fit:cover;filter:${botAvatarFilter};" alt="bot avatar">
      </div>
      <div style="display:flex;flex-direction:column;align-items:${headerAlign === 'right' ? 'flex-end' : (headerAlign === 'center' ? 'center' : 'flex-start')};text-align:${textAlign};line-height:1.2;">
        <span style="text-align:${textAlign};">${cfg.botName || "AI Assistant"}</span>
      </div>
    `;
    wrapper.appendChild(header);
  }

  // Chat Body Window
  const bodyId = `genui-chatbot-body-${item.id || Math.random().toString(36).substr(2, 9)}`;
  const body = document.createElement("div");
  body.id = bodyId;
  body.className = "genui-chatbot-body";
  body.style.flex = "1";
  body.style.padding = "12px";
  body.style.overflowY = isEditMode ? "scroll" : "auto";
  body.style.display = "flex";
  body.style.flexDirection = "column";
  body.style.gap = "8px";
  body.style.background = cardBg;
  body.style.boxSizing = "border-box";
  body.style.setProperty("--chatbot-scrollbar-thumb", scrollbarColor);
  body.style.scrollbarColor = `${scrollbarColor} transparent`;
  body.style.scrollbarWidth = "thin";

  const scrollbarStyle = document.createElement("style");
  scrollbarStyle.textContent = `
    #${bodyId}::-webkit-scrollbar {
      width: 5px !important;
      height: 5px !important;
      display: block !important;
    }
    #${bodyId}::-webkit-scrollbar-track {
      background: transparent !important;
    }
    #${bodyId}::-webkit-scrollbar-thumb {
      background-color: ${scrollbarColor} !important;
      border-radius: 4px !important;
    }
    #${bodyId}::-webkit-scrollbar-thumb:hover {
      filter: brightness(0.85) !important;
    }
  `;
  wrapper.appendChild(scrollbarStyle);

  if (cfg.bgImageUrl) {
    body.style.backgroundImage = `url("${cfg.bgImageUrl}")`;
    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center";
    body.style.backgroundRepeat = "no-repeat";
  }

  // Quick Chips Builder Helper
  const chips = [cfg.chip1, cfg.chip2, cfg.chip3].filter(c => c && c.trim().length > 0);
  function renderChipsContainer() {
    if (chips.length === 0) return null;
    const chipsWrapper = document.createElement("div");
    chipsWrapper.style.display = "flex";
    chipsWrapper.style.flexWrap = "wrap";
    chipsWrapper.style.gap = "6px";
    chipsWrapper.style.padding = cfg.chipsPosition === "above_input" ? "6px 10px 2px 10px" : "4px 0";
    chipsWrapper.style.background = cfg.chipsPosition === "above_input" ? (cardBg || "rgba(255,255,255,0.95)") : "transparent";

    chips.forEach(chipText => {
      const chipBtn = document.createElement("button");
      chipBtn.style.background = chipBg;
      chipBtn.style.border = `1px solid ${chipBorderColor}`;
      chipBtn.style.color = chipTextColor;
      chipBtn.style.borderRadius = cfg.chipRadius || "16px";
      chipBtn.style.padding = "4px 10px";
      chipBtn.style.fontSize = "11px";
      chipBtn.style.cursor = "pointer";
      chipBtn.style.fontWeight = "600";
      chipBtn.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
      chipBtn.innerText = chipText;

      if (!isEditMode) {
        chipBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          sendChatMsg(chipText);
        };
      }

      chipsWrapper.appendChild(chipBtn);
    });
    return chipsWrapper;
  }

  // Welcome Message Bubble
  const welcomeBubble = document.createElement("div");
  welcomeBubble.style.alignSelf = cfg.botAlign || "flex-start";
  welcomeBubble.style.background = botBg;
  welcomeBubble.style.color = botTextColor;
  welcomeBubble.style.padding = "8px 12px";
  welcomeBubble.style.borderRadius = cfg.botAlign === "flex-end" ? "12px 12px 2px 12px" : "12px 12px 12px 2px";
  welcomeBubble.style.fontSize = cfg.fontSize || "13px";
  welcomeBubble.style.maxWidth = cfg.showBubbleAvatars ? "100%" : "85%";
  welcomeBubble.style.boxShadow = "0 2px 5px rgba(0,0,0,0.08)";
  welcomeBubble.innerText = cfg.welcomeMsg || "Halo! Ada yang bisa saya bantu terkait produk kami?";
  body.appendChild(createBubbleWithAvatar(welcomeBubble, true));

  // Render chips inside chat body right below AI Welcome Message bubble
  if (cfg.chipsPosition !== "above_input") {
    const insideChips = renderChipsContainer();
    if (insideChips) body.appendChild(insideChips);
  }

  // User Preview Bubble (displayed during edit mode to show layout & user bubble styling)
  if (isEditMode) {
    const userBubble = document.createElement("div");
    userBubble.style.alignSelf = cfg.userAlign || "flex-end";
    userBubble.style.background = userBg;
    userBubble.style.color = userTextColor;
    userBubble.style.padding = "8px 12px";
    userBubble.style.borderRadius = cfg.userAlign === "flex-start" ? "12px 12px 12px 2px" : "12px 12px 2px 12px";
    userBubble.style.fontSize = cfg.fontSize || "13px";
    userBubble.style.maxWidth = cfg.showBubbleAvatars ? "100%" : "85%";
    userBubble.style.boxShadow = "0 2px 5px rgba(0,0,0,0.08)";
    userBubble.innerText = "Apakah ada diskon atau promo minggu ini?";
    body.appendChild(createBubbleWithAvatar(userBubble, false));

  }

  // Custom Content Container Slot (jika fitur Tambah Konten Kustom diaktifkan)
  if (cfg.enableCustomContent) {
    const slot = document.createElement("div");
    slot.id = `${item.id}_content`;
    slot.className = "genui-chatbot-content-slot";
    slot.style.width = "100%";
    slot.style.display = "flex";
    slot.style.flexDirection = "column";
    slot.style.gap = "8px";
    slot.style.boxSizing = "border-box";
    slot.style.marginTop = "4px";
    body.appendChild(slot);
  }

  wrapper.appendChild(body);

  // Render chips above input area if chipsPosition is "above_input"
  if (cfg.chipsPosition === "above_input") {
    const aboveChips = renderChipsContainer();
    if (aboveChips) wrapper.appendChild(aboveChips);
  }

  // Input & Textarea Section Styling (Seamless Bottom Alignment)
  const inputArea = document.createElement("div");
  inputArea.style.padding = "8px 10px";
  inputArea.style.display = "flex";
  inputArea.style.gap = "6px";
  inputArea.style.alignItems = "center";
  inputArea.style.boxSizing = "border-box";
  inputArea.style.width = "100%";
  inputArea.style.margin = "0";

  // Jika background container bar dinonaktifkan (no background / transparan), hilangkan garis batas borderTop
  const isContainerTransparent = !cfg.inputContainerBgEnabled || !inputContainerBg || inputContainerBg === "transparent" || inputContainerBg.includes("rgba(0, 0, 0, 0)") || inputContainerBg.includes("rgba(0,0,0,0)");
  if (isContainerTransparent) {
    inputArea.style.background = "transparent";
    inputArea.style.borderTop = "none";
  } else {
    inputArea.style.background = inputContainerBg;
    inputArea.style.borderTop = `1px solid ${inputBorderColor}`;
  }

  const inputEl = document.createElement("input");
  inputEl.type = "text";
  inputEl.placeholder = cfg.placeholderText || "Ketik pertanyaan RAG...";
  inputEl.style.flex = "1";
  inputEl.style.background = inputBg;
  inputEl.style.border = `1px solid ${inputBorderColor}`;
  inputEl.style.color = inputTextColor;
  inputEl.style.borderRadius = cfg.inputBorderRadius || "12px";
  inputEl.style.padding = "7px 12px";
  inputEl.style.fontSize = "12px";
  inputEl.style.outline = "none";
  inputEl.style.boxSizing = "border-box";

  const sendBtn = document.createElement("button");
  sendBtn.style.background = sendBtnBg;
  sendBtn.style.color = sendBtnTextColor;
  sendBtn.style.border = "none";
  sendBtn.style.borderRadius = cfg.inputBorderRadius || "12px";
  sendBtn.style.fontSize = "12px";
  sendBtn.style.fontWeight = "bold";
  sendBtn.style.cursor = "pointer";
  sendBtn.style.flexShrink = "0";
  sendBtn.style.boxSizing = "border-box";
  sendBtn.style.display = "inline-flex";
  sendBtn.style.alignItems = "center";
  sendBtn.style.justifyContent = "center";
  sendBtn.style.gap = "6px";

  const sendBtnMode = cfg.sendBtnMode || "icon_text";
  const sendBtnText = cfg.sendBtnText !== undefined ? cfg.sendBtnText : "Kirim";

  const iconHtml = `<img src="/static/image/icon/send.svg" alt="Send" style="width: 16px; height: 16px; object-fit: contain; flex-shrink: 0;" />`;
  const textHtml = `<span>${sendBtnText}</span>`;

  if (sendBtnMode === "icon_only") {
    sendBtn.innerHTML = iconHtml;
    sendBtn.style.padding = "7px 10px";
    sendBtn.setAttribute("title", sendBtnText || "Kirim");
  } else if (sendBtnMode === "text_only") {
    sendBtn.innerHTML = textHtml;
    sendBtn.style.padding = "7px 14px";
  } else {
    sendBtn.innerHTML = `${iconHtml}${textHtml}`;
    sendBtn.style.padding = "7px 12px";
  }

  if (isEditMode) {
    inputEl.disabled = true;
    sendBtn.disabled = true;
  } else {
    inputEl.disabled = false;
    sendBtn.disabled = false;

    const handleSend = () => {
      const q = inputEl.value.trim();
      if (q) {
        inputEl.value = "";
        sendChatMsg(q);
      }
    };

    sendBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleSend();
    };

    inputEl.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handleSend();
      }
    };
  }

  inputArea.appendChild(inputEl);
  inputArea.appendChild(sendBtn);
  wrapper.appendChild(inputArea);

  async function sendChatMsg(queryText) {
    if (!queryText || !queryText.trim()) return;
    const text = queryText.trim();

    // 1. Render User Message
    const userMsg = document.createElement("div");
    userMsg.style.alignSelf = cfg.userAlign || "flex-end";
    userMsg.style.background = cfg.userBg || "#0F4C75";
    userMsg.style.color = cfg.userTextColor || cfg.textColor || "#ffffff";
    userMsg.style.padding = "8px 12px";
    userMsg.style.borderRadius = cfg.userAlign === "flex-start" ? "12px 12px 12px 2px" : "12px 12px 2px 12px";
    userMsg.style.fontSize = cfg.fontSize || "13px";
    userMsg.style.maxWidth = cfg.showBubbleAvatars ? "100%" : "85%";
    userMsg.style.wordBreak = "break-word";
    userMsg.style.boxShadow = "0 2px 5px rgba(0,0,0,0.08)";
    userMsg.innerText = text;
    body.appendChild(createBubbleWithAvatar(userMsg, false));

    // 2. Render Loading Bubble
    const loadingBubble = document.createElement("div");
    loadingBubble.style.alignSelf = cfg.botAlign || "flex-start";
    loadingBubble.style.background = cfg.botBg || "#38a0c4";
    loadingBubble.style.color = cfg.botTextColor || cfg.textColor || "#ffffff";
    loadingBubble.style.padding = "8px 12px";
    loadingBubble.style.borderRadius = cfg.botAlign === "flex-end" ? "12px 12px 2px 12px" : "12px 12px 12px 2px";
    loadingBubble.style.fontSize = cfg.fontSize || "13px";
    loadingBubble.style.maxWidth = cfg.showBubbleAvatars ? "100%" : "85%";
    loadingBubble.style.opacity = "0.75";
    loadingBubble.innerText = "Sedang berpikir...";

    const wrappedLoading = createBubbleWithAvatar(loadingBubble, true);
    body.appendChild(wrappedLoading);
    body.scrollTop = body.scrollHeight;

    inputEl.disabled = true;
    sendBtn.disabled = true;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paramId = urlParams.get('actor_id');
      const effActorId = paramId || (window.unique_id && window.unique_id !== "{{ unique_id }}" ? window.unique_id : (typeof actorId !== "undefined" && actorId && actorId !== "{{ unique_id }}" ? actorId : "general"));

      const resp = await fetch("/api/chatbot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          actor_id: effActorId,
          config: cfg
        })
      });
      const resData = await resp.json();

      if (wrappedLoading.parentNode) {
        wrappedLoading.parentNode.removeChild(wrappedLoading);
      }

      const botMsg = document.createElement("div");
      botMsg.style.alignSelf = cfg.botAlign || "flex-start";
      botMsg.style.background = cfg.botBg || "#38a0c4";
      botMsg.style.color = cfg.botTextColor || cfg.textColor || "#ffffff";
      botMsg.style.padding = "8px 12px";
      botMsg.style.borderRadius = cfg.botAlign === "flex-end" ? "12px 12px 2px 12px" : "12px 12px 12px 2px";
      botMsg.style.fontSize = cfg.fontSize || "13px";
      botMsg.style.maxWidth = cfg.showBubbleAvatars ? "100%" : "85%";
      botMsg.style.wordBreak = "break-word";
      botMsg.style.boxShadow = "0 2px 5px rgba(0,0,0,0.08)";

      if (resData.success && resData.answer) {
        botMsg.innerText = resData.answer;
      } else {
        botMsg.innerText = resData.message || "Maaf, terjadi kesalahan saat memproses pertanyaan Anda.";
      }
      body.appendChild(createBubbleWithAvatar(botMsg, true));

      if (resData.genui_card && resData.genui_card.type === "product_card" && cfg.enableProductCard !== false) {
        const cardEl = document.createElement("div");
        cardEl.style.alignSelf = cfg.botAlign || "flex-start";
        cardEl.style.background = "#ffffff";
        cardEl.style.color = "#333333";
        cardEl.style.border = "1px solid #bddce7";
        cardEl.style.borderRadius = "10px";
        cardEl.style.padding = "10px";
        cardEl.style.marginTop = "4px";
        cardEl.style.maxWidth = "85%";
        cardEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
        cardEl.innerHTML = `
          <div style="font-weight:bold;font-size:12px;color:#0F4C75;">${resData.genui_card.title || "Rekomendasi"}</div>
          <div style="font-size:11px;color:#666;margin:4px 0;">${resData.genui_card.price || ""}</div>
          <a href="${resData.genui_card.action_url || '#'}" target="_blank" style="display:inline-block;padding:4px 10px;background:${cfg.botBg || '#38a0c4'};color:white;text-decoration:none;border-radius:6px;font-size:11px;margin-top:4px;">${resData.genui_card.action_label || 'Lihat Detail'}</a>
        `;
        body.appendChild(cardEl);
      }
    } catch (err) {
      if (wrappedLoading.parentNode) {
        wrappedLoading.parentNode.removeChild(wrappedLoading);
      }
      const errorMsg = document.createElement("div");
      errorMsg.style.alignSelf = cfg.botAlign || "flex-start";
      errorMsg.style.background = "#e74c3c";
      errorMsg.style.color = "#ffffff";
      errorMsg.style.padding = "8px 12px";
      errorMsg.style.borderRadius = "12px";
      errorMsg.style.fontSize = cfg.fontSize || "13px";
      errorMsg.innerText = "Terjadi gangguan jaringan.";
      body.appendChild(errorMsg);
    } finally {
      inputEl.disabled = false;
      sendBtn.disabled = false;
      body.scrollTop = body.scrollHeight;
    }
  }

  return wrapper;
}

function updateChatbotConfig(key, val) {
  const data = elements.find(item => item.id === selectedElementId);
  if (!data || data.type !== "genui_chatbot") return;

  if (!data.chatbotConfig) {
    data.chatbotConfig = {
      botName: "AI Assistant",
      botSubtitle: "Online",
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
      sendBtnBg: "#38a0c4",
      sendBtnTextColor: "#ffffff"
    };
  }
  data.chatbotConfig[key] = val;
  if (typeof updateChatbotColorTriggers === "function") {
    updateChatbotColorTriggers(data);
  }
  renderCanvas();
  if (typeof pushHistoryDebounced === "function") pushHistoryDebounced();
  else if (typeof pushHistory === "function") pushHistory();
}

function uploadChatbotAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById("avatarUploadStatus");
  if (statusEl) statusEl.innerText = "Mengunggah avatar bot...";

  const reader = new FileReader();
  reader.onload = (e) => {
    const item = elements.find(i => i.id === selectedElementId);
    if (item) {
      if (!item.chatbotConfig) item.chatbotConfig = {};
      item.chatbotConfig.avatarUrl = e.target.result;
      renderCanvas();
    }
    if (statusEl) statusEl.innerText = "Avatar Bot dipasang!";
  };
  reader.readAsDataURL(file);
}

function uploadChatbotUserAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById("userAvatarUploadStatus");
  if (statusEl) statusEl.innerText = "Mengunggah avatar user...";

  const reader = new FileReader();
  reader.onload = (e) => {
    const item = elements.find(i => i.id === selectedElementId);
    if (item) {
      if (!item.chatbotConfig) item.chatbotConfig = {};
      item.chatbotConfig.userAvatarUrl = e.target.result;
      renderCanvas();
    }
    if (statusEl) statusEl.innerText = "Avatar User dipasang!";
  };
  reader.readAsDataURL(file);
}

function uploadChatbotBgImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById("chatbotBgUploadStatus");
  if (statusEl) statusEl.innerText = "Mengunggah wallpaper...";

  const reader = new FileReader();
  reader.onload = (e) => {
    const item = elements.find(i => i.id === selectedElementId);
    if (item) {
      if (!item.chatbotConfig) item.chatbotConfig = {};
      item.chatbotConfig.bgImageUrl = e.target.result;
      renderCanvas();
    }
    if (statusEl) statusEl.innerText = "Wallpaper background berhasil dipasang!";
  };
  reader.readAsDataURL(file);
}

function clearChatbotBgImage() {
  const item = elements.find(i => i.id === selectedElementId);
  if (item && item.chatbotConfig) {
    item.chatbotConfig.bgImageUrl = "";
    renderCanvas();
    const statusEl = document.getElementById("chatbotBgUploadStatus");
    if (statusEl) statusEl.innerText = "Gambar wallpaper dihapus.";
  }
}

window.updateChatbotConfig = updateChatbotConfig;
window.uploadChatbotAvatar = uploadChatbotAvatar;
window.uploadChatbotUserAvatar = uploadChatbotUserAvatar;
window.uploadChatbotBgImage = uploadChatbotBgImage;
window.clearChatbotBgImage = clearChatbotBgImage;
window.uploadRagDocument = uploadRagDocument;
window.updateMediaEmbedConfig = updateMediaEmbedConfig;
window.uploadMediaCoverImage = uploadMediaCoverImage;




function uploadRagDocument(event) {
  const file = event.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById("ragUploadStatus");
  if (statusEl) statusEl.innerText = "Mengunggah dokumen RAG...";

  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get('actor_id');
  const effActorId = paramId || (window.unique_id && window.unique_id !== "{{ unique_id }}" ? window.unique_id : (typeof actorId !== "undefined" && actorId && actorId !== "{{ unique_id }}" ? actorId : "general"));

  const formData = new FormData();
  formData.append("file", file);
  formData.append("actor_id", effActorId);

  fetch("/api/chatbot/upload_doc", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        if (statusEl) statusEl.innerText = data.message;
      } else {
        if (statusEl) statusEl.innerText = data.message || "Gagal mengunggah dokumen.";
      }
    })
    .catch(err => {
      if (statusEl) statusEl.innerText = "Terjadi kesalahan koneksi.";
    });
}


// ══════════════════════════════════════════════════════════════
// 4. GRID LAYOUT & COLUMN ALLOCATION
// ══════════════════════════════════════════════════════════════
function updateRowColumnsCount(count) {
  const data = elements.find(item => item.id === selectedElementId);
  if (!data || data.type !== "row") return;

  const countNum = parseInt(count) || 1;
  let colChildren = elements.filter(el => el.parentId === data.id && el.type === "column");

  if (colChildren.length < countNum) {
    const toAdd = countNum - colChildren.length;
    for (let i = 0; i < toAdd; i++) {
      const colId = "el-" + Math.random().toString(36).substr(2, 9);
      const newCol = {
        id: colId,
        type: "column",
        parentId: data.id,
        content: "",
        style: {
          position: "relative",
          left: "auto",
          top: "auto",
          width: "100%",
          height: "auto",
          padding: "10px",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          borderStyle: "solid",
          borderColor: "rgba(56, 160, 196, 0.1)",
          borderWidth: "1px",
          borderRadius: "8px",
          zIndex: "1"
        }
      };
      elements.push(newCol);
    }
  } else if (colChildren.length > countNum) {
    const removedCols = colChildren.slice(countNum);
    removedCols.forEach(col => {
      elements = elements.filter(el => el.id !== col.id);
      elements.forEach(el => {
        if (el.parentId === col.id) {
          el.parentId = null;
          el.style.position = "absolute";
          el.style.left = "10%";
          el.style.top = "160px";
          el.style.width = "80%";
        }
      });
    });
  }

  // Redistribute columns width equally by default
  const finalColChildren = elements.filter(el => el.parentId === data.id && el.type === "column");
  let widthVal = "100%";
  if (countNum === 2) widthVal = "calc(50% - 6px)";
  else if (countNum === 3) widthVal = "calc(33.33% - 8px)";
  else if (countNum === 4) widthVal = "calc(25% - 9px)";

  finalColChildren.forEach(col => {
    col.style.width = widthVal;
  });

  renderCanvas();
  pushHistory();
}

function updateColumnWidth(val) {
  const data = elements.find(item => item.id === selectedElementId);
  if (!data || data.type !== "column") return;

  let computedWidth = val;
  if (val === "50%") computedWidth = "calc(50% - 6px)";
  else if (val === "33.33%") computedWidth = "calc(33.33% - 8px)";
  else if (val === "66.66%") computedWidth = "calc(66.66% - 4px)";
  else if (val === "25%") computedWidth = "calc(25% - 9px)";
  else if (val === "75%") computedWidth = "calc(75% - 3px)";
  else if (val === "auto") computedWidth = "auto";

  data.columnWidthPreset = val;
  data.style.width = computedWidth;
  const div = document.getElementById(selectedElementId);
  if (div) div.style.width = computedWidth;

  renderCanvas();
  pushHistory();
}


// ══════════════════════════════════════════════════════════════
// 4. UI KIT BLOCK TEMPLATES SYSTEM
// ══════════════════════════════════════════════════════════════
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

window.uikitTemplatesCache = [];
window.activeUIKitFilterTag = "Semua";


function openUIKitModal() {
  const modal = document.getElementById("uiKitModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  loadUIKitTemplates();
}

function closeUIKitModal() {
  const modal = document.getElementById("uiKitModal");
  if (modal) modal.classList.add("hidden");
}

function loadUIKitTemplates() {
  const listContainer = document.getElementById("uikitTemplatesList");
  if (listContainer) {
    listContainer.innerHTML = `
      <div style="text-align: center; padding: 30px; color: #7a8a94;">
        <div class="loader-spinner" style="margin-bottom: 8px;"></div>
        <div style="font-size: 12px; font-weight: 600;">Memuat koleksi UI Kit...</div>
      </div>
    `;
  }

  fetch("/api/uikit/templates")
    .then(res => res.json())
    .then(data => {
      const templates = (data && data.success && Array.isArray(data.templates)) ? data.templates : [];
      window.uikitTemplatesCache = templates;
      renderUIKitTagPills();
      filterUIKitTemplates();
    })
    .catch(err => {
      console.warn("[loadUIKitTemplates] Error fetching from API:", err);
      window.uikitTemplatesCache = [];
      renderUIKitTagPills();
      filterUIKitTemplates();
    });
}

window.isUIKitAdminMode = false;

function renderUIKitTagPills() {
  const container = document.getElementById("uikitTagFilterContainer");
  if (!container) return;
  container.innerHTML = "";

  const tagSet = new Set(["Semua"]);
  window.uikitTemplatesCache.forEach(tpl => {
    if (tpl.tag) tagSet.add(tpl.tag);
  });

  tagSet.forEach(tag => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = `uikit-tag-pill ${window.activeUIKitFilterTag === tag ? "active" : ""}`;

    const tagText = document.createElement("span");
    tagText.innerText = tag;
    pill.appendChild(tagText);

    pill.onclick = () => {
      window.activeUIKitFilterTag = tag;
      renderUIKitTagPills();
      filterUIKitTemplates();
    };

    // If Admin Mode is active, allow deleting tag (except 'Semua')
    if (window.isUIKitAdminMode && tag !== "Semua") {
      const delTagBtn = document.createElement("span");
      delTagBtn.className = "uikit-tag-del-btn";
      delTagBtn.innerHTML = '<img src="/static/image/icon/close.svg" alt="X" style="width: 10px; height: 10px;" />';
      delTagBtn.title = `Hapus Kategori Tag "${tag}"`;
      delTagBtn.onclick = (e) => {
        e.stopPropagation();
        deleteUIKitTag(tag);
      };
      pill.appendChild(delTagBtn);
    }

    container.appendChild(pill);
  });
}

function filterUIKitTemplates() {
  const searchInput = document.getElementById("uikitSearchInput");
  const query = searchInput ? searchInput.value.trim() : "";
  const activeTag = window.activeUIKitFilterTag || "Semua";

  // Check if special admin command is entered
  if (query.toLowerCase() === ":admin/edit") {
    renderUIKitAdminAccessGate();
    return;
  }

  const filtered = window.uikitTemplatesCache.filter(tpl => {
    const matchTag = (activeTag === "Semua") || (tpl.tag && tpl.tag.toLowerCase() === activeTag.toLowerCase());
    const matchQuery = !query ||
      (tpl.name && tpl.name.toLowerCase().includes(query.toLowerCase())) ||
      (tpl.tag && tpl.tag.toLowerCase().includes(query.toLowerCase()));
    return matchTag && matchQuery;
  });

  renderUIKitCards(filtered);
}

// ══════════════════════════════════════════════════════════════
// ADMIN MODE ACCESS GATE & TOGGLES
// ══════════════════════════════════════════════════════════════
function renderUIKitAdminAccessGate() {
  const container = document.getElementById("uikitTemplatesList");
  if (!container) return;
  container.innerHTML = `
    <div class="uikit-admin-gate-card">
      <div class="uikit-admin-gate-icon">
        <img src="/static/image/icon/admin-shield.svg" alt="Admin Shield" width="26" height="26" />
      </div>
      <div class="uikit-admin-gate-title">Izinkan Akses Admin UI Kit</div>
      <div class="uikit-admin-gate-desc">
        Perintah khusus administrator terdeteksi. Aktifkan mode ini untuk mengizinkan penghapusan template blok serta penghapusan tag kategori.
      </div>
      <button type="button" class="btn-activate-uikit-admin" onclick="activateUIKitAdminMode()">
        <img src="/static/image/icon/admin-lock.svg" alt="Lock" width="16" height="16" />
        <span>Aktifkan Mode Pengelolaan Admin</span>
      </button>
    </div>
  `;
}

function activateUIKitAdminMode() {
  window.isUIKitAdminMode = true;
  const searchInput = document.getElementById("uikitSearchInput");
  if (searchInput) searchInput.value = "";
  if (typeof showToast === "function") {
    showToast("Mode Admin aktif: Anda sekarang dapat menghapus template blok dan tag.", "success");
  }
  renderUIKitTagPills();
  filterUIKitTemplates();
}

function deactivateUIKitAdminMode() {
  window.isUIKitAdminMode = false;
  if (typeof showToast === "function") {
    showToast("Mode Pengelolaan Admin dinonaktifkan.", "info");
  }
  renderUIKitTagPills();
  filterUIKitTemplates();
}

// ══════════════════════════════════════════════════════════════
// UI KIT DELETE CONFIRMATION MODAL HELPERS (KONSISTEN DENGAN APLIKASI)
// ══════════════════════════════════════════════════════════════
let pendingUIKitDeleteAction = null;

function openUIKitDeleteConfirm(title, desc, onConfirm) {
  const modal = document.getElementById("uikitDeleteConfirmModal");
  const titleEl = document.getElementById("uikitDeleteConfirmTitle");
  const descEl = document.getElementById("uikitDeleteConfirmDesc");
  if (titleEl) titleEl.innerText = title;
  if (descEl) descEl.innerText = desc;
  pendingUIKitDeleteAction = onConfirm;
  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeUIKitDeleteConfirm() {
  pendingUIKitDeleteAction = null;
  const modal = document.getElementById("uikitDeleteConfirmModal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

function executeUIKitDelete() {
  const action = pendingUIKitDeleteAction;
  closeUIKitDeleteConfirm();
  if (typeof action === "function") {
    action();
  }
}

function deleteUIKitTag(tagName) {
  const title = "Hapus Tag Kategori?";
  const desc = `Hapus tag kategori "${tagName}"? Semua template dengan tag ini akan dialihkan ke kategori "Umum".`;

  openUIKitDeleteConfirm(title, desc, () => {
    fetch("/api/uikit/tag/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag: tagName })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          window.uikitTemplatesCache.forEach(t => {
            if (t.tag && t.tag.toLowerCase() === tagName.toLowerCase()) {
              t.tag = "Umum";
            }
          });
          if (window.activeUIKitFilterTag === tagName) {
            window.activeUIKitFilterTag = "Semua";
          }
          renderUIKitTagPills();
          filterUIKitTemplates();
          if (typeof showToast === "function") {
            showToast(`Tag "${tagName}" berhasil dihapus dari sistem.`, "success");
          }
        } else {
          if (typeof showToast === "function") {
            showToast("Gagal menghapus tag: " + (data.error || "Kesalahan server"), "error");
          }
        }
      })
      .catch(err => {
        console.error(err);
        if (typeof showToast === "function") {
          showToast("Koneksi bermasalah saat menghapus tag.", "error");
        }
      });
  });
}

// ══════════════════════════════════════════════════════════════
// MINI DOM PREVIEW GENERATOR (SESUAI DESAIN PARENT & ELEMEN ASLI)
// ══════════════════════════════════════════════════════════════
function createTemplateMiniDOMPreview(tplElements) {
  if (!tplElements || !tplElements.length) {
    const empty = document.createElement("div");
    empty.style.cssText = "width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#7a8a94;";
    empty.innerText = "Pratinjau Desain";
    return empty;
  }

  // Cari root/parent element utama
  const rootEl = tplElements.find(el => !el.parentId || !tplElements.some(p => p.id === el.parentId)) || tplElements[0];
  const children = tplElements.filter(el => el.id !== rootEl.id);

  const previewWrapper = document.createElement("div");
  previewWrapper.className = "uikit-mini-preview-wrap";
  previewWrapper.style.cssText = `
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    box-sizing: border-box;
    background: #f4f8fa;
    overflow: hidden;
    user-select: none;
  `;

  const cardInner = document.createElement("div");
  cardInner.className = "uikit-mini-card-inner";

  // Ambil style dari root parent element
  const rootStyle = rootEl.style || {};
  let bg = rootStyle.background || rootStyle.backgroundColor || (rootEl.type === "shape" ? "linear-gradient(135deg, #0f4c75, #38a0c4)" : "#ffffff");
  let radius = rootStyle.borderRadius || "12px";
  let border = rootStyle.border || (rootEl.type === "shape" ? "none" : "1.5px solid #bddce7");
  let shadow = rootStyle.boxShadow || "0 4px 12px rgba(0,0,0,0.06)";

  const isDarkBg = typeof bg === "string" && (bg.includes("#0f4c75") || bg.includes("#1a") || bg.includes("#22") || bg.includes("#11") || bg.includes("#00") || bg.includes("#ff4757"));

  cardInner.style.cssText = `
    width: 100%;
    max-height: 120px;
    background: ${bg};
    border-radius: ${radius};
    border: ${border};
    box-shadow: ${shadow};
    padding: 10px 14px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: ${rootStyle.alignItems || (rootStyle.textAlign === "center" ? "center" : "flex-start")};
    gap: 4px;
    overflow: hidden;
  `;

  // Render elemen root jika itu teks/judul, atau render children-nya
  const renderList = rootEl.type === "shape" || rootEl.type === "container" || rootEl.type === "row" || rootEl.type === "column"
    ? children
    : [rootEl, ...children];

  if (renderList.length === 0) {
    const defaultTitle = document.createElement("div");
    defaultTitle.style.cssText = `font-size: 11px; font-weight: 800; color: ${isDarkBg ? '#ffffff' : '#2c5d6b'};`;
    defaultTitle.innerText = rootEl.content || "Desain Blok Template";
    cardInner.appendChild(defaultTitle);
  } else {
    renderList.slice(0, 4).forEach(el => {
      if (el.type === "title") {
        const h = document.createElement("div");
        h.style.cssText = `
          font-size: 11px;
          font-weight: 800;
          color: ${el.style?.color || (isDarkBg ? '#ffffff' : '#2c5d6b')};
          text-align: ${el.style?.textAlign || (rootStyle.textAlign === "center" ? "center" : "left")};
          line-height: 1.2;
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `;
        h.innerText = el.content || "Judul Template";
        cardInner.appendChild(h);
      } else if (el.type === "text") {
        const p = document.createElement("div");
        p.style.cssText = `
          font-size: 9px;
          color: ${el.style?.color || (isDarkBg ? '#e0f2fe' : '#577d8a')};
          text-align: ${el.style?.textAlign || (rootStyle.textAlign === "center" ? "center" : "left")};
          line-height: 1.3;
          width: 100%;
          max-height: 24px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        `;
        p.innerText = el.content || "Deskripsi konten promosi...";
        cardInner.appendChild(p);
      } else if (el.type === "button") {
        const b = document.createElement("div");
        const btnBg = el.style?.background || el.style?.backgroundColor || (el.buttonType === "whatsapp" ? "#25d366" : "#38a0c4");
        const btnColor = el.style?.color || "#ffffff";
        b.style.cssText = `
          font-size: 9px;
          font-weight: 700;
          background: ${btnBg};
          color: ${btnColor};
          padding: 3px 10px;
          border-radius: 6px;
          margin-top: 2px;
          display: inline-block;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.12);
        `;
        b.innerText = el.content || "Tombol CTA";
        cardInner.appendChild(b);
      } else if (el.type === "image" && el.imageSrc) {
        const img = document.createElement("img");
        img.src = el.imageSrc;
        img.style.cssText = "max-height: 32px; border-radius: 4px; object-fit: cover;";
        cardInner.appendChild(img);
      } else if (el.type === "box-interaktif" || el.type === "box_interaktif") {
        const boxElem = document.createElement("div");
        const cfg = el.boxConfig || {};
        boxElem.style.cssText = `
          width: 100%;
          background: ${cfg.itemBgColor || "#ffffff"};
          border: 1px solid ${cfg.accentColor || "#38a0c4"}40;
          border-radius: 6px;
          padding: 3px 6px;
          font-size: 8.5px;
          font-weight: 700;
          color: ${cfg.headerColor || "#2c5d6b"};
          display: flex;
          justify-content: space-between;
          align-items: center;
        `;
        boxElem.innerHTML = `<span>Box Interaktif</span><span style="color:${cfg.accentColor || '#38a0c4'};">▾</span>`;
        cardInner.appendChild(boxElem);
      }
    });
  }

  previewWrapper.appendChild(cardInner);
  return previewWrapper;
}

function renderUIKitCards(templates) {
  const container = document.getElementById("uikitTemplatesList");
  if (!container) return;
  container.innerHTML = "";

  // If Admin Mode is active, render active indicator banner at top
  if (window.isUIKitAdminMode) {
    const adminBar = document.createElement("div");
    adminBar.className = "uikit-admin-active-bar";
    adminBar.innerHTML = `
      <span>Mode Pengelolaan Admin Aktif (Hapus Blok & Tag diizinkan)</span>
      <button type="button" class="btn-exit-uikit-admin" onclick="deactivateUIKitAdminMode()">Keluar Mode Admin</button>
    `;
    container.appendChild(adminBar);
  }

  if (templates.length === 0) {
    const emptyEl = document.createElement("div");
    emptyEl.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; background: white; border-radius: 16px; border: 1px dashed #bddce7;">
        <img src="/static/image/icon/ui-kit.svg" style="width: 36px; height: 36px; opacity: 0.4; margin-bottom: 8px;" alt="Empty" />
        <div style="font-size: 13px; font-weight: 700; color: #2c5d6b;">Tidak Ada Template Ditemukan</div>
        <div style="font-size: 11px; color: #7a8a94; margin-top: 4px;">Coba gunakan kata kunci lain atau publish elemen baru dari panel Layer.</div>
      </div>
    `;
    container.appendChild(emptyEl);
    return;
  }

  templates.forEach(tpl => {
    const card = document.createElement("div");
    card.className = "uikit-card";

    // 1. Preview Thumbnail (Menampilkan gambar snapshot asli atau mini-DOM desain elemen parent)
    const previewDiv = document.createElement("div");
    previewDiv.className = "uikit-card-preview";

    const miniDom = createTemplateMiniDOMPreview(tpl.elements);

    if (tpl.thumbnail && tpl.thumbnail.startsWith("data:image")) {
      const img = document.createElement("img");
      img.src = tpl.thumbnail;
      img.alt = tpl.name;
      img.style.cssText = "width: 100%; height: 100%; object-fit: contain; background: #fafcfd; display: block;";
      img.onerror = () => {
        img.remove();
        previewDiv.appendChild(miniDom);
      };
      previewDiv.appendChild(img);
    } else {
      // Tampilkan representasi visual asli dari parent & children elemen
      previewDiv.appendChild(miniDom);
    }

    // 2. Card Body
    const bodyDiv = document.createElement("div");
    bodyDiv.className = "uikit-card-body";

    const titleEl = document.createElement("h4");
    titleEl.className = "uikit-card-title";
    titleEl.innerText = tpl.name;

    const metaDiv = document.createElement("div");
    metaDiv.className = "uikit-card-meta";

    const tagBadge = document.createElement("span");
    tagBadge.className = "uikit-card-tag";
    tagBadge.innerText = tpl.tag || "Umum";
    metaDiv.appendChild(tagBadge);

    const elemCount = document.createElement("span");
    elemCount.style.fontSize = "11px";
    elemCount.style.color = "#7a8a94";
    elemCount.innerText = `${(tpl.elements || []).length} komponen`;
    metaDiv.appendChild(elemCount);

    // 3. Actions Row
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "uikit-card-actions";

    const btnUse = document.createElement("button");
    btnUse.type = "button";
    btnUse.className = "uikit-btn-use";
    btnUse.innerHTML = `
      <img src="/static/image/icon/plus.svg" alt="Gunakan Template" width="14" height="14" />
      <span>Gunakan Template</span>
    `;
    btnUse.onclick = (e) => {
      e.stopPropagation();
      insertUIKitTemplateToCanvas(tpl.id);
    };
    actionsDiv.appendChild(btnUse);

    // Delete template action (ONLY SHOWN IN ADMIN MODE)
    if (window.isUIKitAdminMode) {
      const btnDel = document.createElement("button");
      btnDel.type = "button";
      btnDel.className = "uikit-btn-delete";
      btnDel.title = "Hapus Template Ini (Admin)";
      btnDel.innerHTML = `
        <img src="/static/image/icon/delete.svg" style="width: 14px; height: 14px;" alt="Delete" />
      `;
      btnDel.onclick = (e) => {
        e.stopPropagation();
        deleteUIKitTemplate(tpl.id, tpl.name);
      };
      actionsDiv.appendChild(btnDel);
    }

    bodyDiv.appendChild(titleEl);
    bodyDiv.appendChild(metaDiv);
    bodyDiv.appendChild(actionsDiv);

    card.appendChild(previewDiv);
    card.appendChild(bodyDiv);
    container.appendChild(card);
  });
}

function insertUIKitTemplateToCanvas(templateId) {
  const tpl = window.uikitTemplatesCache.find(t => t.id === templateId);
  if (!tpl || !Array.isArray(tpl.elements) || tpl.elements.length === 0) {
    if (typeof showToast === "function") showToast("Data template tidak valid.", "error");
    return;
  }

  // 1. Generate map ID lama -> ID baru
  const idMap = {};
  tpl.elements.forEach((item, idx) => {
    const oldId = item.id;
    const newId = `el-${Math.random().toString(36).substr(2, 9)}`;
    idMap[oldId] = newId;
  });

  // 2. Tentukan posisi penyisipan di canvas (di bawah elemen terakhir yang ada)
  let maxBottom = 60;
  elements.forEach(el => {
    const topNum = parseInt(el.style?.top || "0", 10) || 0;
    const heightNum = parseInt(el.style?.height || "80", 10) || 80;
    if (topNum + heightNum > maxBottom) {
      maxBottom = topNum + heightNum;
    }
  });

  // 3. Clone and remap
  const newElements = tpl.elements.map(orig => {
    const clone = JSON.parse(JSON.stringify(orig));
    const oldId = clone.id;
    clone.id = idMap[oldId];

    // Remap parentId
    if (clone.parentId && idMap[clone.parentId]) {
      clone.parentId = idMap[clone.parentId];
    } else if (clone.parentId && clone.parentId.includes("_slide_")) {
      const parts = clone.parentId.split("_slide_");
      const rootOldId = parts[0];
      const slideIdx = parts[1];
      if (idMap[rootOldId]) {
        clone.parentId = `${idMap[rootOldId]}_slide_${slideIdx}`;
      }
    } else {
      clone.parentId = null;
    }

    // Adjust position if root element
    if (!clone.parentId && clone.style) {
      if (clone.style.position === "absolute") {
        clone.style.top = `${maxBottom + 20}px`;
      }
    }

    return clone;
  });

  // 4. Append to elements
  elements.push(...newElements);

  // 5. Update canvas & history
  renderCanvas();
  if (typeof adjustCanvasHeight === "function") adjustCanvasHeight();
  if (typeof pushHistory === "function") pushHistory();

  closeUIKitModal();
  if (typeof showToast === "function") {
    showToast(`Template "${tpl.name}" berhasil ditambahkan ke canvas!`, "success");
  }
}

function deleteUIKitTemplate(templateId, templateName) {
  const title = "Hapus Template?";
  const desc = `Template "${templateName || 'ini'}" akan dihapus dari koleksi UI Kit secara permanen dan tidak bisa dikembalikan.`;

  openUIKitDeleteConfirm(title, desc, () => {
    fetch("/api/uikit/template/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: templateId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          window.uikitTemplatesCache = window.uikitTemplatesCache.filter(t => t.id !== templateId);
          filterUIKitTemplates();
          if (typeof showToast === "function") {
            showToast("Template berhasil dihapus dari UI Kit.", "info");
          }
        } else {
          if (typeof showToast === "function") {
            showToast("Gagal menghapus: " + (data.error || "Kesalahan server"), "error");
          }
        }
      })
      .catch(err => {
        console.error(err);
        if (typeof showToast === "function") {
          showToast("Koneksi bermasalah saat menghapus template.", "error");
        }
      });
  });
}


// ══════════════════════════════════════════════════════════════
// 5. PALETTE TOOLS - EXTRACT DOMINANT COLORS FROM IMAGE
// ══════════════════════════════════════════════════════════════
function togglePaletteModal() {
  const container = document.getElementById("paletteHeaderContainer");
  if (container) {
    container.classList.toggle("hidden");

    // Auto-extract actor foto colors if empty
    const swatchesDiv = document.getElementById("paletteHeaderSwatches");
    if (!swatchesDiv.children.length && window.actorFoto) {
      extractColorsFromUrl(window.actorFoto);
    }
  }
}

function extractColorsFromUrl(url) {
  const img = new Image();
  img.onload = function () {
    performExtraction(img);
  };
  if (!url.startsWith("data:")) img.crossOrigin = "Anonymous";
  img.src = url;
}

function handlePaletteImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      performExtraction(img);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function performExtraction(img) {
  // Resize image to 30x30 to average colors
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 30;
  canvas.height = 30;
  ctx.drawImage(img, 0, 0, 30, 30);
  const imgData = ctx.getImageData(0, 0, 30, 30).data;

  const colorCounts = {};
  for (let i = 0; i < imgData.length; i += 4) {
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];
    const a = imgData[i + 3];
    if (a < 128) continue; // skip transparent

    const qr = Math.round(r / 16) * 16;
    const qg = Math.round(g / 16) * 16;
    const qb = Math.round(b / 16) * 16;
    const rgbKey = `${qr},${qg},${qb}`;
    colorCounts[rgbKey] = (colorCounts[rgbKey] || 0) + 1;
  }

  const sortedColors = Object.keys(colorCounts).sort((c1, c2) => colorCounts[c2] - colorCounts[c1]);

  const palette = [];
  for (const colStr of sortedColors) {
    const [r, g, b] = colStr.split(',').map(Number);

    let isSimilar = false;
    for (const p of palette) {
      const dist = Math.sqrt((r - p.r) ** 2 + (g - p.g) ** 2 + (b - p.b) ** 2);
      if (dist < 60) {
        isSimilar = true;
        break;
      }
    }

    if (!isSimilar) {
      palette.push({ r, g, b, hex: rgbToHexStr(r, g, b) });
    }

    if (palette.length >= 6) break;
  }

  const container = document.getElementById("paletteHeaderSwatches");
  if (!container) return;
  container.innerHTML = "";
  palette.forEach(color => {
    const swatch = document.createElement("div");
    swatch.style.width = "22px";
    swatch.style.height = "22px";
    swatch.style.background = color.hex;
    swatch.style.borderRadius = "4px";
    swatch.style.cursor = "pointer";
    swatch.style.border = "1px solid rgba(0,0,0,0.2)";
    swatch.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
    swatch.style.transition = "transform 0.15s";
    swatch.title = color.hex.toUpperCase();

    swatch.onmouseenter = () => swatch.style.transform = "scale(1.15)";
    swatch.onmouseleave = () => swatch.style.transform = "scale(1.0)";

    swatch.onclick = () => selectPaletteColor(color.hex);
    container.appendChild(swatch);
  });
}

function rgbToHexStr(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

function getContrastColor(r, g, b) {
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? "#000000" : "#ffffff";
}

function selectPaletteColor(hex) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(hex).then(() => {
      showToast('Warna ' + hex.toUpperCase() + ' disalin ke clipboard!', 'info');
    }).catch(() => { });
  }

  if (selectedElementId) {
    const data = elements.find(el => el.id === selectedElementId);
    if (data) {
      if (data.type === "title" || data.type === "text") {
        if (typeof onTextColorSolidColor === "function") {
          onTextColorSolidColor(hex);
        } else if (typeof updateSelectedElementStyle === "function") {
          updateSelectedElementStyle("color", hex);
        }
        if (typeof updateTextColorTriggerSummary === "function") updateTextColorTriggerSummary();
        const colInput = document.getElementById("textColorInput");
        if (colInput) colInput.value = hex;
        const hexLbl = document.getElementById("textColorTriggerHex");
        if (hexLbl) hexLbl.innerText = hex.toUpperCase();
      } else if (data.type === "button") {
        if (typeof updateSelectedElementStyle === "function") updateSelectedElementStyle("backgroundColor", hex);
        const btnColInput = document.getElementById("propBtnTextColor");
        data.style.backgroundColor = hex;
      } else if (data.type === "shape" || data.type === "container" || data.type === "row" || data.type === "column") {
        const fillSolidInput = document.getElementById("fillColorInput");
        if (fillSolidInput) {
          fillSolidInput.value = hex;
          if (typeof onFillSolidColor === "function") onFillSolidColor(hex);
        }
      }
      renderCanvas();
      pushHistory();
    }
  }
}


// ══════════════════════════════════════════════════════════════
// 6. TOAST NOTIFICATION SYSTEM
// ══════════════════════════════════════════════════════════════
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

function showToastNotification(msg, type = "info") {
  showToast(msg, type);
}

// ══════════════════════════════════════════════════════════════
// 7. BOX INTERAKTIF COMPONENT BUILDER (Accordion, Tabs, Flippable, Checkbox, Radio)
// ══════════════════════════════════════════════════════════════
function createBoxInteraktifElement(item) {
  const cfg = item.boxConfig || {
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
    bgColor: "#ffffff",
    itemBgColor: "#ffffff",
    headerColor: "#2c5d6b",
    textColor: "#5a6a74",
    accentColor: "#38a0c4"
  };

  const mode = cfg.mode || "expand_collapse";

  const resolveFill = (fd, fallback) => {
    if (!fd) return fallback;
    if (fd.type === 'solid' || !fd.type) {
      const op = fd.opacity !== undefined ? fd.opacity : 100;
      return typeof hexToRgba === 'function' ? hexToRgba(fd.color || fallback, op / 100) : (fd.color || fallback);
    }
    return typeof buildGradientCss === "function" ? buildGradientCss(fd) : (fd.color || fallback);
  };

  const bgColor = resolveFill(cfg.boxBgData, cfg.bgColor || "#ffffff");
  const itemBgColor = resolveFill(cfg.boxItemBgData, cfg.itemBgColor || "#ffffff");
  const headerColor = resolveFill(cfg.boxHeaderColorData, cfg.headerColor || "#2c5d6b");
  const accentColor = resolveFill(cfg.boxAccentColorData, cfg.accentColor || "#38a0c4");

  const rawAccentHex = (cfg.boxAccentColorData && cfg.boxAccentColorData.color) || cfg.accentColor || '#38a0c4';
  const accentBorderLight = typeof hexToRgba === 'function' ? hexToRgba(rawAccentHex, 0.25) : accentColor;
  const accentBorderMedium = typeof hexToRgba === 'function' ? hexToRgba(rawAccentHex, 0.35) : accentColor;
  const accentBorderHeader = typeof hexToRgba === 'function' ? hexToRgba(rawAccentHex, 0.4) : accentColor;

  const container = document.createElement("div");
  container.className = `box-interactive-container box-mode-${mode}`;
  container.style.width = "100%";
  container.style.boxSizing = "border-box";
  container.style.padding = "16px";
  container.style.borderRadius = item.style && item.style.borderRadius ? item.style.borderRadius : "14px";
  container.style.background = bgColor;
  container.style.border = `1px solid ${accentBorderLight}`;
  container.style.boxShadow = "0 4px 14px rgba(0,0,0,0.04)";

  if (item.style && item.style.height && item.style.height !== "auto") {
    container.style.height = "100%";
    container.style.overflowY = "auto";
  } else {
    container.style.height = "auto";
  }

  if (mode === "expand_collapse") {
    const itemsList = document.createElement("div");
    itemsList.style.display = "flex";
    itemsList.style.flexDirection = "column";
    itemsList.style.gap = "10px";

    const items = cfg.items && cfg.items.length ? cfg.items : [{ title: "Judul Panel 1" }];
    items.forEach((panelItem, idx) => {
      const itemCard = document.createElement("div");
      itemCard.className = "box-panel-card";
      itemCard.style.background = itemBgColor;
      itemCard.style.border = `1.5px solid ${accentBorderHeader}`;
      itemCard.style.borderRadius = "10px";
      itemCard.style.overflow = "hidden";
      itemCard.style.transition = "all 0.2s ease";

      const header = document.createElement("div");
      header.className = "box-panel-header";
      header.style.padding = "12px 14px";
      header.style.display = "flex";
      header.style.alignItems = "center";
      header.style.justifyContent = "space-between";
      header.style.cursor = "pointer";
      header.style.userSelect = "none";

      const titleSpan = document.createElement("span");
      titleSpan.innerText = panelItem.title || `Judul Panel ${idx + 1}`;
      titleSpan.style.fontSize = "13.5px";
      titleSpan.style.fontWeight = "700";
      titleSpan.style.color = headerColor;

      const iconBox = document.createElement("div");
      iconBox.className = "box-toggle-icon";
      iconBox.style.display = "flex";
      iconBox.style.alignItems = "center";
      iconBox.style.color = accentColor;
      iconBox.style.transition = "transform 0.25s ease";
      iconBox.innerHTML = `<img src="/static/image/icon/chevron-down.svg" alt="Expand" width="18" height="18" />`;

      header.appendChild(titleSpan);
      header.appendChild(iconBox);

      const body = document.createElement("div");
      body.className = "box-panel-body";
      body.id = `${item.id}_panel_${idx}`;
      body.style.padding = "10px 14px 14px 14px";
      body.style.display = (cfg.activeItemIndex === idx || (cfg.activeItemIndex === undefined && idx === 0)) ? "flex" : "none";
      body.style.flexDirection = "column";
      body.style.gap = "8px";
      body.style.minHeight = "40px";

      if (cfg.activeItemIndex === idx || (cfg.activeItemIndex === undefined && idx === 0)) {
        iconBox.style.transform = "rotate(180deg)";
      }

      header.onclick = (e) => {
        e.stopPropagation();
        const isHidden = body.style.display === "none";
        itemsList.querySelectorAll(".box-panel-body").forEach(b => (b.style.display = "none"));
        itemsList.querySelectorAll(".box-toggle-icon").forEach(i => (i.style.transform = "rotate(0deg)"));
        if (isHidden) {
          body.style.display = "flex";
          iconBox.style.transform = "rotate(180deg)";
          cfg.activeItemIndex = idx;
        } else {
          cfg.activeItemIndex = -1;
        }
      };

      itemCard.appendChild(header);
      itemCard.appendChild(body);
      itemsList.appendChild(itemCard);
    });

    container.appendChild(itemsList);
  } else if (mode === "tabs") {
    const tabsHeader = document.createElement("div");
    tabsHeader.className = "box-tabs-header";

    const tabContentContainer = document.createElement("div");
    tabContentContainer.className = "box-tabs-content-container";
    tabContentContainer.style.width = "100%";

    const tabs = cfg.tabs && cfg.tabs.length ? cfg.tabs : [{ title: "Tab 1" }];
    const activeIdx = (cfg.activeTabIndex >= 0 && cfg.activeTabIndex < tabs.length) ? cfg.activeTabIndex : 0;

    tabs.forEach((tabItem, idx) => {
      const tabBtn = document.createElement("button");
      tabBtn.type = "button";
      tabBtn.className = `box-tab-button ${idx === activeIdx ? "active" : ""}`;
      tabBtn.innerText = tabItem.title || `Tab ${idx + 1}`;
      tabBtn.style.background = idx === activeIdx ? accentColor : itemBgColor;
      tabBtn.style.color = idx === activeIdx ? "#ffffff" : headerColor;
      tabBtn.style.border = `1.5px solid ${accentBorderHeader}`;

      tabBtn.onclick = (e) => {
        e.stopPropagation();
        cfg.activeTabIndex = idx;
        tabsHeader.querySelectorAll(".box-tab-button").forEach((btn, bIdx) => {
          btn.classList.toggle("active", bIdx === idx);
          btn.style.background = bIdx === idx ? accentColor : itemBgColor;
          btn.style.color = bIdx === idx ? "#ffffff" : headerColor;
        });
        tabContentContainer.querySelectorAll(".box-tab-panel").forEach((panel, pIdx) => {
          panel.style.display = pIdx === idx ? "flex" : "none";
        });
      };

      tabsHeader.appendChild(tabBtn);

      const tabPanel = document.createElement("div");
      tabPanel.className = "box-tab-panel";
      tabPanel.id = `${item.id}_tab_${idx}`;
      tabPanel.style.display = idx === activeIdx ? "flex" : "none";
      tabPanel.style.flexDirection = "column";
      tabPanel.style.gap = "8px";
      tabPanel.style.minHeight = "60px";
      tabPanel.style.padding = "12px";
      tabPanel.style.borderRadius = "10px";
      tabPanel.style.background = itemBgColor;
      tabPanel.style.border = `1px solid ${accentBorderLight}`;

      tabContentContainer.appendChild(tabPanel);
    });

    container.appendChild(tabsHeader);
    container.appendChild(tabContentContainer);
  } else if (mode === "flippable") {
    const isFlipped = !!cfg.isFlipped;

    const flippableWrapper = document.createElement("div");
    flippableWrapper.className = "box-flippable-wrapper";

    const frontSide = document.createElement("div");
    frontSide.className = `box-flippable-side box-flippable-front ${!isFlipped ? "box-side-active" : ""}`;
    frontSide.id = `${item.id}_front`;
    frontSide.style.background = itemBgColor;
    frontSide.style.border = `1.5px solid ${accentBorderMedium}`;
    frontSide.style.display = !isFlipped ? "flex" : "none";
    frontSide.style.flexDirection = "column";
    frontSide.style.gap = "8px";

    const backSide = document.createElement("div");
    backSide.className = `box-flippable-side box-flippable-back ${isFlipped ? "box-side-active" : ""}`;
    backSide.id = `${item.id}_back`;
    backSide.style.background = itemBgColor;
    backSide.style.border = `1.5px solid ${accentBorderMedium}`;
    backSide.style.display = isFlipped ? "flex" : "none";
    backSide.style.flexDirection = "column";
    backSide.style.gap = "8px";

    flippableWrapper.appendChild(frontSide);
    flippableWrapper.appendChild(backSide);
    container.appendChild(flippableWrapper);
  } else if (mode === "checkbox" || mode === "radio") {
    const isRadio = mode === "radio";
    const optionsList = document.createElement("div");
    optionsList.className = `box-${mode}-list`;
    optionsList.style.display = "flex";
    optionsList.style.flexDirection = "column";
    optionsList.style.gap = "10px";
    optionsList.style.width = "100%";

    const defaultList = isRadio ? [
      { title: "Opsi A", value: "Opsi A", checked: true },
      { title: "Opsi B", value: "Opsi B", checked: false }
    ] : [
      { title: "Pilihan 1", value: "Pilihan 1", checked: false },
      { title: "Pilihan 2", value: "Pilihan 2", checked: false }
    ];

    const items = (cfg.items && cfg.items.length) ? cfg.items : defaultList;
    if (!cfg.items || !cfg.items.length) cfg.items = items;

    items.forEach((optItem, idx) => {
      const optCard = document.createElement("div");
      optCard.className = `box-${mode}-card`;
      optCard.style.background = itemBgColor;
      optCard.style.border = `1.5px solid ${optItem.checked ? accentColor : accentBorderMedium}`;
      optCard.style.borderRadius = "10px";
      optCard.style.overflow = "hidden";
      optCard.style.transition = "all 0.2s ease";
      optCard.style.boxSizing = "border-box";

      const header = document.createElement("div");
      header.className = `box-${mode}-header`;
      header.style.padding = "10px 14px";
      header.style.display = "flex";
      header.style.alignItems = "center";
      header.style.gap = "10px";
      header.style.cursor = "pointer";
      header.style.userSelect = "none";

      // Icon Checkbox or Radio
      const indicator = document.createElement("div");
      indicator.className = `box-${mode}-indicator`;
      indicator.style.width = "20px";
      indicator.style.height = "20px";
      indicator.style.flexShrink = "0";
      indicator.style.display = "flex";
      indicator.style.alignItems = "center";
      indicator.style.justifyContent = "center";
      indicator.style.borderRadius = isRadio ? "50%" : "5px";
      indicator.style.border = `2px solid ${optItem.checked ? accentColor : '#a4c2cb'}`;
      indicator.style.background = optItem.checked ? accentColor : '#ffffff';
      indicator.style.transition = "all 0.15s ease";

      if (isRadio) {
        indicator.innerHTML = optItem.checked ? `<div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>` : "";
      } else {
        indicator.innerHTML = optItem.checked ? `<img src="/static/image/icon/checkbox-check.svg" alt="Checked" width="13" height="13" />` : "";
      }

      const titleSpan = document.createElement("span");
      titleSpan.innerText = optItem.title || (isRadio ? `Opsi ${idx + 1}` : `Pilihan ${idx + 1}`);
      titleSpan.style.fontSize = "13.5px";
      titleSpan.style.fontWeight = "600";
      titleSpan.style.color = headerColor;
      titleSpan.style.flex = "1";

      header.appendChild(indicator);
      header.appendChild(titleSpan);

      // Body dropzone container for nesting elements!
      const body = document.createElement("div");
      body.className = `box-${mode}-body`;
      body.id = `${item.id}_${mode}_${idx}`;
      body.style.padding = "6px 14px 12px 14px";
      body.style.display = "flex";
      body.style.flexDirection = "column";
      body.style.gap = "8px";
      body.style.minHeight = "36px";
      body.style.boxSizing = "border-box";

      header.onclick = (e) => {
        e.stopPropagation();
        if (isRadio) {
          items.forEach((it, iIdx) => {
            it.checked = (iIdx === idx);
          });
        } else {
          optItem.checked = !optItem.checked;
        }
        renderCanvas();
        if (typeof renderBoxItemsListContainer === "function") {
          const curEl = elements.find(el => el.id === item.id);
          if (curEl) renderBoxItemsListContainer(curEl);
        }
        if (typeof pushHistoryDebounced === "function") pushHistoryDebounced();
      };

      optCard.appendChild(header);
      optCard.appendChild(body);
      optionsList.appendChild(optCard);
    });

    container.appendChild(optionsList);
  }

  return container;
}

window.createBoxInteraktifElement = createBoxInteraktifElement;
