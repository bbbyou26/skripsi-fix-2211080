/* ==========================================
   PROMOTION PAGE BUILDER - CANVAS RENDERING & SELECTION ENGINE
   ========================================== */

function renderCanvas() {
  canvas.innerHTML = "";

  // Clear existing autoplay intervals
  Object.keys(carouselIntervals).forEach(key => {
    clearInterval(carouselIntervals[key]);
  });
  carouselIntervals = {};

  // Build relationships & Set pencegah infinite recursion loop
  const visitedIds = new Set();
  const rootElements = elements.filter(item => {
    if (!item.parentId) return true;
    const hasParent = elements.some(p => p.id === item.parentId || (p.type === "carousel" && item.parentId.startsWith(p.id + "_slide_")));
    return !hasParent;
  });

  function renderElement(item, parentDom) {
    if (!item || !item.id || visitedIds.has(item.id)) return;
    visitedIds.add(item.id);

    const div = document.createElement("div");
    div.className = "builder-element";
    div.id = item.id;
    div.dataset.type = item.type;

    // Apply layout positions (Relative Auto-Flow Stacking)
    div.style.position = "relative";
    div.style.left = "auto";
    div.style.top = "auto";
    div.style.width = item.style.width || "100%";
    if (item.type === "button" && item.btnDesignType === "input_button") {
      div.style.height = "auto";
      div.style.minHeight = item.inputLayout === "inline" ? "48px" : "125px";
    } else {
      div.style.height = (item.style && item.style.height && item.style.height !== "auto") ? item.style.height : (item.type === "button" ? "45px" : "auto");
      div.style.minHeight = item.type === "button" ? "44px" : "auto";
    }
    div.style.flexShrink = "0";
    div.style.boxSizing = "border-box";
    div.style.alignSelf = item.style.alignSelf || "center";
    if (item.style.alignItems) div.style.alignItems = item.style.alignItems;
    div.style.textAlign = item.style.textAlign || "center";
    if (item.style.margin) div.style.margin = item.style.margin;

    if (item.style && item.style.gapBottom !== undefined && item.style.gapBottom !== null) {
      div.style.marginBottom = typeof item.style.gapBottom === 'number' ? `${item.style.gapBottom}px` : item.style.gapBottom;
    } else if (item.style && item.style.marginBottom) {
      div.style.marginBottom = item.style.marginBottom;
    }
    div.style.zIndex = item.style.zIndex || "1";

    // Apply outer-div visual styles (border, shadow, outline, padding, background, clipPath)
    ["borderRadius", "border", "borderStyle", "borderColor", "borderWidth", "boxShadow", "outline", "outlineOffset", "padding", "backgroundColor", "background", "backgroundClip", "webkitBackgroundClip", "backgroundOrigin", "webkitMask", "webkitMaskComposite", "mask", "maskComposite", "clipPath", "webkitClipPath"].forEach(prop => {
      if (item.style[prop] !== undefined && item.style[prop] !== null && item.style[prop] !== '') {
        div.style[prop] = item.style[prop];
      }
    });

    if (item.style && item.style.borderRadius && item.style.borderRadius !== '0px' && item.style.borderRadius !== '0') {
      div.style.overflow = "hidden";
    }

    if (item.type === "media_embed" || (item.type === "button" && item.btnDesignType === "input_button")) {
      div.style.backgroundColor = "transparent";
      div.style.background = "transparent";
      div.style.border = "none";
      div.style.boxShadow = "none";
      div.style.overflow = "visible";
      div.style.padding = "0";
    }

    // SVG Gradient stroke rendering (100% transparent inside, full border on 4 sides, perfect border-radius)
    const sd = item.strokeData;
    if (sd && sd.enabled && sd.type && sd.type !== 'solid' && !(item.type === "button" && item.btnDesignType === "input_button")) {
      div.style.border = 'none';
      if (typeof buildStrokeSvgContent === 'function') {
        const strokeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        strokeSvg.setAttribute('class', 'builder-stroke-svg');
        strokeSvg.style.position = 'absolute';
        strokeSvg.style.top = '0';
        strokeSvg.style.left = '0';
        strokeSvg.style.width = '100%';
        strokeSvg.style.height = '100%';
        strokeSvg.style.pointerEvents = 'none';
        strokeSvg.style.overflow = 'visible';
        strokeSvg.style.zIndex = '2';
        strokeSvg.innerHTML = buildStrokeSvgContent(item.id, sd, item.style.borderRadius);
        div.appendChild(strokeSvg);
      }
    }

    if (selectedElementId === item.id) {
      div.classList.add("active-element");
    }

    let inner = null;
    if (item.type === "title") {
      const headingTag = (item.headingTag || "h2").toLowerCase();
      inner = document.createElement(headingTag);
      inner.className = "element-text" + (item.textAnimation ? " " + item.textAnimation : "");
      if (item.textAnimationDuration) inner.style.animationDuration = `${item.textAnimationDuration}s`;
      if (item.style && item.style.letterSpacing) inner.style.letterSpacing = item.style.letterSpacing;
      if (item.style && item.style.lineHeight) inner.style.lineHeight = item.style.lineHeight;
      inner.innerText = item.content || "";

      // Text stroke
      if (item.textStrokeWidth !== undefined && parseFloat(item.textStrokeWidth) > 0) {
        let strokeColor = "#000000";
        if (item.textStrokeColorData) {
          strokeColor = typeof hexToRgba === 'function' ? hexToRgba(item.textStrokeColorData.color || '#000000', (item.textStrokeColorData.opacity !== undefined ? item.textStrokeColorData.opacity : 100) / 100) : (item.textStrokeColorData.color || '#000000');
        } else if (item.textStrokeColor) {
          strokeColor = item.textStrokeColor;
        }
        inner.style.webkitTextStroke = `${item.textStrokeWidth}px ${strokeColor}`;
        inner.style.textStroke = `${item.textStrokeWidth}px ${strokeColor}`;
      } else {
        inner.style.webkitTextStroke = "";
        inner.style.textStroke = "";
      }

      // Text shadow
      const sBlur = item.textShadowBlur !== undefined ? parseFloat(item.textShadowBlur) : 0;
      const sOx = item.textShadowOffsetX !== undefined ? parseFloat(item.textShadowOffsetX) : 0;
      const sOy = item.textShadowOffsetY !== undefined ? parseFloat(item.textShadowOffsetY) : 0;
      if (sBlur > 0 || sOx !== 0 || sOy !== 0) {
        let shadowColor = "rgba(0,0,0,0.5)";
        if (item.textShadowColorData) {
          shadowColor = typeof hexToRgba === 'function' ? hexToRgba(item.textShadowColorData.color || '#000000', (item.textShadowColorData.opacity !== undefined ? item.textShadowColorData.opacity : 50) / 100) : (item.textShadowColorData.color || '#000000');
        } else if (item.textShadowColor) {
          shadowColor = item.textShadowColor;
        }
        inner.style.textShadow = `${sOx}px ${sOy}px ${sBlur}px ${shadowColor}`;
      } else {
        inner.style.textShadow = "none";
      }
    } else if (item.type === "text") {
      const mode = item.listMode || "normal";
      if (mode === "bullet" || mode === "numbered") {
        inner = document.createElement(mode === "numbered" ? "ol" : "ul");
        inner.className = `element-text element-list-${mode}` + (item.textAnimation ? " " + item.textAnimation : "");
        if (item.textAnimationDuration) inner.style.animationDuration = `${item.textAnimationDuration}s`;
        if (item.style && item.style.letterSpacing) inner.style.letterSpacing = item.style.letterSpacing;
        if (item.style && item.style.lineHeight) inner.style.lineHeight = item.style.lineHeight;
        inner.style.paddingLeft = "24px";
        inner.style.margin = "0";
        inner.style.textAlign = (item.style && item.style.textAlign) || "left";
        inner.style.listStylePosition = "outside";
        inner.style.listStyleType = mode === "numbered" ? "decimal" : "disc";

        const lines = (item.content || "").split("\n");
        lines.forEach(line => {
          let text = line;
          if (mode === "bullet") {
            text = text.replace(/^[\s•\-\*]+\s*/, "");
          } else if (mode === "numbered") {
            text = text.replace(/^\s*\d+[\.\)]\s*/, "");
          }
          const li = document.createElement("li");
          li.innerText = text;
          inner.appendChild(li);
        });
      } else {
        inner = document.createElement("p");
        inner.className = "element-text" + (item.textAnimation ? " " + item.textAnimation : "");
        if (item.textAnimationDuration) inner.style.animationDuration = `${item.textAnimationDuration}s`;
        if (item.style && item.style.letterSpacing) inner.style.letterSpacing = item.style.letterSpacing;
        if (item.style && item.style.lineHeight) inner.style.lineHeight = item.style.lineHeight;
        inner.innerText = item.content || "";
      }
    } else if (item.type === "image") {
      inner = document.createElement("img");
      inner.className = "element-image";
      const isPlaceholder = !item.imageSrc || item.imageSrc.includes("no-image.svg");
      if (isPlaceholder) {
        inner.style.objectFit = "contain";
        inner.style.padding = "10px";
      }
      inner.src = item.imageSrc || "/static/image/icon/no-image.svg";
    } else if (item.type === "button") {
      const isInputButton = item.btnDesignType === "input_button";
      if (isInputButton) {
        inner = document.createElement("div");
        inner.className = `element-button-input-container layout-${item.inputLayout || "stacked"}`;
        inner.style.display = "flex";
        inner.style.width = "100%";
        inner.style.boxSizing = "border-box";
        inner.style.gap = "12px";
        inner.style.background = "transparent";
        inner.style.border = "none";
        inner.style.padding = "0";

        if (item.inputLayout === "inline") {
          inner.style.flexDirection = "row";
          inner.style.alignItems = "stretch";
        } else {
          inner.style.flexDirection = "column";
        }

        const rad = (item.style && item.style.borderRadius !== undefined && item.style.borderRadius !== '') ? item.style.borderRadius : "10px";

        const textarea = document.createElement("textarea");
        textarea.className = "btn-input-textarea";
        textarea.placeholder = item.placeholderText !== undefined ? item.placeholderText : "Ketik pesan atau pertanyaan di sini...";
        textarea.style.boxSizing = "border-box";
        textarea.style.padding = "10px 14px";
        textarea.style.borderRadius = rad;
        textarea.style.border = `1.5px solid ${item.inputBorderColor || "#bddce7"}`;
        textarea.style.background = item.inputBg || "#ffffff";
        textarea.style.color = item.inputTextColor || "#2c5d6b";
        textarea.style.setProperty("--btn-input-text-color", item.inputTextColor || "#2c5d6b");
        textarea.style.fontFamily = "inherit";
        textarea.style.fontSize = "13px";
        textarea.style.resize = "vertical";
        textarea.style.outline = "none";

        const btn = document.createElement("a");
        btn.className = "element-button";
        btn.innerHTML = `<span class="btn-text-content" style="pointer-events: none; display: inline-block; font-size: inherit; font-weight: inherit; line-height: 1; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.content || "Kirim Pesan"}</span>`;
        btn.href = isEditMode ? "javascript:void(0)" : item.url || "#";
        btn.style.display = "flex";
        btn.style.alignItems = "center";
        btn.style.justifyContent = "center";
        btn.style.textAlign = "center";
        btn.style.cursor = "pointer";
        btn.style.textDecoration = "none";
        btn.style.boxSizing = "border-box";
        btn.style.borderRadius = rad;
        btn.style.overflow = "hidden";
        btn.style.position = "relative";

        // Button background & gradient fill
        let btnBg = (item.style && (item.style.backgroundColor || item.style.background)) || "#38a0c4";
        if (item.fillData && item.fillData.type && item.fillData.type !== 'solid' && item.fillData.enabled) {
          if (typeof buildGradientCss === 'function') {
            btnBg = buildGradientCss(item.fillData);
          }
        }
        btn.style.background = btnBg;
        btn.style.backgroundColor = (item.style && item.style.backgroundColor) || "#38a0c4";

        // Button stroke / border
        if (item.strokeData && item.strokeData.enabled) {
          const sw = item.strokeData.width || 1;
          const sStyle = item.strokeData.style || 'solid';
          const isSolid = !item.strokeData.type || item.strokeData.type === 'solid';
          if (isSolid) {
            const sColor = typeof hexToRgba === 'function' ? hexToRgba(item.strokeData.color || '#38a0c4', (item.strokeData.opacity !== undefined ? item.strokeData.opacity : 100) / 100) : (item.strokeData.color || '#38a0c4');
            btn.style.border = `${sw}px ${sStyle} ${sColor}`;
          } else {
            btn.style.border = 'none';
            if (typeof buildStrokeSvgContent === 'function') {
              const strokeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
              strokeSvg.setAttribute('class', 'builder-stroke-svg');
              strokeSvg.style.position = 'absolute';
              strokeSvg.style.top = '0';
              strokeSvg.style.left = '0';
              strokeSvg.style.width = '100%';
              strokeSvg.style.height = '100%';
              strokeSvg.style.pointerEvents = 'none';
              strokeSvg.style.overflow = 'visible';
              strokeSvg.style.zIndex = '2';
              strokeSvg.innerHTML = buildStrokeSvgContent(`${item.id}_btn`, item.strokeData, rad);
              btn.appendChild(strokeSvg);
            }
          }
        } else if (item.style && item.style.border && item.style.border !== 'none') {
          btn.style.border = item.style.border;
        } else if (item.style && item.style.borderWidth && item.style.borderStyle && item.style.borderColor) {
          btn.style.border = `${item.style.borderWidth} ${item.style.borderStyle} ${item.style.borderColor}`;
        } else {
          btn.style.border = 'none';
        }

        btn.style.color = (item.style && item.style.color) || "#ffffff";
        btn.style.fontWeight = (item.style && item.style.fontWeight) || "600";
        btn.style.fontSize = (item.style && item.style.fontSize) || "16px";
        btn.style.height = "44px";
        btn.style.minHeight = "44px";
        btn.style.maxHeight = "44px";

        if (item.inputLayout === "inline") {
          // 70% Textarea : 30% Button
          textarea.style.flex = "0 0 calc(70% - 6px)";
          textarea.style.width = "calc(70% - 6px)";
          textarea.style.height = "44px";
          textarea.style.minHeight = "44px";
          textarea.style.maxHeight = "44px";

          btn.style.flex = "0 0 calc(30% - 6px)";
          btn.style.width = "calc(30% - 6px)";
          btn.style.maxWidth = "calc(30% - 6px)";
          btn.style.padding = "0 8px";
        } else {
          // Stacked (Full lebar button di bawah)
          textarea.style.width = "100%";
          textarea.style.minHeight = "70px";

          const align = item.alignmentPreset || (item.style && item.style.alignSelf === "flex-start" ? "left" : (item.style && item.style.alignSelf === "flex-end" ? "right" : (item.style && item.style.alignSelf === "center" ? "center" : "stretch")));
          if (align === "left") {
            btn.style.alignSelf = "flex-start";
            btn.style.width = "180px";
            btn.style.maxWidth = "100%";
            btn.style.padding = "0 16px";
          } else if (align === "right") {
            btn.style.alignSelf = "flex-end";
            btn.style.width = "180px";
            btn.style.maxWidth = "100%";
            btn.style.padding = "0 16px";
          } else if (align === "center") {
            btn.style.alignSelf = "center";
            btn.style.width = "180px";
            btn.style.maxWidth = "100%";
            btn.style.padding = "0 16px";
          } else {
            // stretch / full width
            btn.style.alignSelf = "stretch";
            btn.style.width = "100%";
            btn.style.padding = "0 18px";
          }
        }

        if (isEditMode) {
          textarea.addEventListener("click", (e) => e.stopPropagation());
          textarea.addEventListener("mousedown", (e) => e.stopPropagation());
        }

        btn.onclick = (e) => {
          if (isEditMode) {
            e.preventDefault();
            return;
          }
          const typedText = textarea.value.trim();
          const boxPayload = (typeof getInteractiveBoxMessagePayload === "function") ? getInteractiveBoxMessagePayload() : "";
          let fullMessage = "";
          if (boxPayload && typedText) fullMessage = `${boxPayload}\n${typedText}`;
          else if (boxPayload) fullMessage = boxPayload;
          else fullMessage = typedText;

          let rawUrl = (item.url || "").trim();
          if (!rawUrl) rawUrl = "https://wa.me/";
          let targetUrl = rawUrl;

          const isWa = item.btnLinkType === "whatsapp" || targetUrl.includes("wa.me") || targetUrl.includes("whatsapp.com") || targetUrl.includes("api.whatsapp.com");

          if (isWa) {
            if (fullMessage) {
              if (targetUrl.includes("text=")) {
                targetUrl = targetUrl.replace(/([?&]text=)[^&]*/, `$1${encodeURIComponent(fullMessage)}`);
              } else {
                const sep = targetUrl.includes("?") ? "&" : "?";
                targetUrl = `${targetUrl}${sep}text=${encodeURIComponent(fullMessage)}`;
              }
            }
          }
          if (targetUrl && targetUrl !== "#" && targetUrl !== "javascript:void(0)") {
            window.open(targetUrl, "_blank", "noopener,noreferrer");
          }
        };

        inner.appendChild(textarea);
        inner.appendChild(btn);
      } else {
        inner = document.createElement("a");
        inner.className = "element-button";
        inner.innerHTML = `<span class="btn-text-content" style="pointer-events: none; display: inline-block; font-size: inherit; font-weight: inherit; line-height: 1; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.content || "Teks Tombol"}</span>`;
        inner.href = isEditMode ? "javascript:void(0)" : item.url || "#";
        inner.style.width = "100%";
        inner.style.height = "100%";
        inner.style.minHeight = "44px";
        inner.style.display = "flex";
        inner.style.alignItems = "center";
        inner.style.justifyContent = "center";
        inner.style.textAlign = (item.style && item.style.textAlign) || "center";
        inner.style.color = (item.style && item.style.color) || "#ffffff";
        inner.style.fontWeight = (item.style && item.style.fontWeight) || "600";
        inner.style.fontSize = (item.style && item.style.fontSize) || "16px";
        inner.style.textDecoration = "none";
        inner.style.overflow = "hidden";
        inner.style.padding = "0 16px";
        inner.style.boxSizing = "border-box";

        inner.onclick = (e) => {
          if (isEditMode) {
            e.preventDefault();
            return;
          }
          const boxPayload = (typeof getInteractiveBoxMessagePayload === "function") ? getInteractiveBoxMessagePayload() : "";
          let rawUrl = (item.url || "").trim();
          if (!rawUrl && boxPayload) rawUrl = "https://wa.me/";
          let targetUrl = rawUrl;

          const isWa = item.btnLinkType === "whatsapp" || targetUrl.includes("wa.me") || targetUrl.includes("whatsapp.com") || targetUrl.includes("api.whatsapp.com");

          if (isWa && boxPayload) {
            if (targetUrl.includes("text=")) {
              targetUrl = targetUrl.replace(/([?&]text=)[^&]*/, `$1${encodeURIComponent(boxPayload)}`);
            } else {
              const sep = targetUrl.includes("?") ? "&" : "?";
              targetUrl = `${targetUrl}${sep}text=${encodeURIComponent(boxPayload)}`;
            }
          }
          if (targetUrl && targetUrl !== "#" && targetUrl !== "javascript:void(0)") {
            window.open(targetUrl, "_blank", "noopener,noreferrer");
          }
        };

        if (!isEditMode && item.url && item.url !== "#") {
          inner.target = "_blank";
          inner.rel = "noopener noreferrer";
        }
      }
    } else if (item.type === "box-interaktif" || item.type === "box_interaktif") {
      inner = typeof createBoxInteraktifElement === "function" ? createBoxInteraktifElement(item) : null;


    } else if (item.type === "shape") {
      inner = document.createElement("div");
      inner.className = "element-shape";
    } else if (item.type === "container") {
      inner = document.createElement("div");
      inner.className = "element-container";
    } else if (item.type === "column") {
      inner = document.createElement("div");
      inner.className = "element-column";
    } else if (item.type === "row") {
      inner = document.createElement("div");
      inner.className = "element-row";
    } else if (item.type === "carousel") {
      inner = typeof createCarouselDOM === "function" ? createCarouselDOM(item) : null;
      if (typeof startCarouselAutoplay === "function") startCarouselAutoplay(item);
    } else if (item.type === "media_embed") {
      inner = typeof createMediaEmbedDOM === "function" ? createMediaEmbedDOM(item) : null;
    } else if (item.type === "genui_chatbot") {
      inner = typeof createGenuiChatbotElement === "function" ? createGenuiChatbotElement(item) : null;
    }

    if (inner) {
      const isInputBtn = item.type === "button" && item.btnDesignType === "input_button";
      const styleTarget = isInputBtn ? (inner.querySelector(".element-button") || inner) : inner;

      if (!isInputBtn) {
        applyElementStyles(inner, item.style);
      }

      const textFd = item.type === 'button' ? item.btnTextFillData : item.fillData;
      const textTarget = item.type === 'button' ? (inner.querySelector(".btn-text-content") || styleTarget) : styleTarget;

      if (['title', 'text', 'button'].includes(item.type)) {
        if (textFd && textFd.type && textFd.type !== 'solid' && textFd.enabled) {
          const gradCss = typeof buildGradientCss === 'function' ? buildGradientCss(textFd) : (item.style && item.style.background);
          if (gradCss) {
            textTarget.style.background = gradCss;
            textTarget.style.backgroundClip = 'text';
            textTarget.style.webkitBackgroundClip = 'text';
            textTarget.style.webkitTextFillColor = 'transparent';
            textTarget.style.color = 'transparent';
            textTarget.style.display = 'inline-block';
          }
        } else if (textFd && (textFd.type === 'solid' || !textFd.type) && textFd.enabled) {
          const rgba = typeof hexToRgba === 'function' ? hexToRgba(textFd.color || '#ffffff', (textFd.opacity !== undefined ? textFd.opacity : 100) / 100) : (textFd.color || '#ffffff');
          textTarget.style.color = rgba;
          textTarget.style.background = 'none';
          textTarget.style.backgroundClip = '';
          textTarget.style.webkitBackgroundClip = '';
          textTarget.style.webkitTextFillColor = rgba;
        } else if (item.style && (item.style.backgroundClip === 'text' || item.style.webkitBackgroundClip === 'text') && item.style.background) {
          textTarget.style.background = item.style.background;
          textTarget.style.backgroundClip = 'text';
          textTarget.style.webkitBackgroundClip = 'text';
          textTarget.style.webkitTextFillColor = 'transparent';
          textTarget.style.color = 'transparent';
        }
      }
      if (isEditMode && (item.type === "button" || inner.tagName === "A")) {
        inner.addEventListener("click", (e) => e.preventDefault());
      }
      div.appendChild(inner);
    }

    // Add children recursively
    if (["shape", "container", "row", "column"].includes(item.type)) {
      const targetArea = inner || div;

      // Enforce flex container properties for auto-expand on both div and inner targetArea
      div.style.display = "flex";
      div.style.flexShrink = "0";
      if (inner) {
        inner.style.display = "flex";
        inner.style.flexShrink = "0";
        inner.style.width = "100%";
        inner.style.height = "auto";
        inner.style.boxSizing = "border-box";
      }

      if (item.type === "row") {
        div.style.flexDirection = "row";
        div.style.flexWrap = "wrap";
        div.style.gap = "8px";
        if (inner) {
          inner.style.flexDirection = "row";
          inner.style.flexWrap = "wrap";
          inner.style.gap = "8px";
        }
      } else {
        div.style.flexDirection = "column";
        div.style.gap = "8px";
        if (inner) {
          inner.style.flexDirection = "column";
          inner.style.gap = "8px";
        }
      }

      // Respect height setting if specified
      if (item.style && item.style.height && item.style.height !== "auto") {
        div.style.height = item.style.height;
      } else {
        div.style.height = "auto";
      }
      div.style.minHeight = "50px";

      const children = elements.filter(child => child.parentId === item.id);
      children.forEach(child => {
        renderElement(child, targetArea);
      });

      if (isEditMode && children.length === 0) {
        const placeholder = document.createElement("div");
        placeholder.className = "empty-container-placeholder";
        placeholder.innerText = `Geser komponen ke sini (${item.type === 'shape' ? 'box' : item.type})`;
        targetArea.appendChild(placeholder);
      }
    } else if (item.type === "carousel") {
      const numSlides = item.slidesCount || 3;
      for (let idx = 0; idx < numSlides; idx++) {
        const slideId = `${item.id}_slide_${idx}`;
        const slideDom = (inner || div).querySelector(`#${slideId}`);
        if (slideDom) {
          if (isEditMode) {
            slideDom.addEventListener("dragover", (e) => {
              e.preventDefault();
              e.stopPropagation();
              slideDom.classList.add("drag-over-container");
            });
            slideDom.addEventListener("dragleave", (e) => {
              slideDom.classList.remove("drag-over-container");
            });
            slideDom.addEventListener("drop", (e) => {
              e.preventDefault();
              e.stopPropagation();
              slideDom.classList.remove("drag-over-container");
              const draggedId = e.dataTransfer.getData("text/element-id");
              const draggedType = e.dataTransfer.getData("text/type");
              if (draggedId && draggedId !== item.id) {
                const draggedIdx = elements.findIndex(el => el.id === draggedId);
                if (draggedIdx !== -1) {
                  const [draggedEl] = elements.splice(draggedIdx, 1);
                  draggedEl.parentId = slideId;
                  elements.push(draggedEl);
                  renderCanvas();
                  selectElement(draggedId);
                  if (typeof pushHistory === "function") pushHistory();
                }
              } else if (draggedType) {
                if (typeof createNewElement === "function") createNewElement(draggedType, "auto", "auto", slideId);
              }
            });
          }

          const slideChildren = elements.filter(child => child.parentId === slideId || (child.parentId === item.id && child.slideIndex === idx));
          slideChildren.forEach(child => {
            renderElement(child, slideDom);
          });

          if (isEditMode && slideChildren.length === 0) {
            const placeholder = document.createElement("div");
            placeholder.className = "empty-container-placeholder";
            placeholder.style.fontSize = "11px";
            placeholder.style.padding = "8px";
            placeholder.innerText = `Slide ${idx + 1} Kosong (Seret / Tambah Elemen Ke Sini)`;
            slideDom.appendChild(placeholder);
          }
        }
      }
    } else if (item.type === "box-interaktif" || item.type === "box_interaktif") {
      const cfg = item.boxConfig || {};
      const mode = cfg.mode || "expand_collapse";

      const setupContainerDropZone = (targetDom, targetParentId, placeholderLabel) => {
        if (!targetDom) return;

        if (isEditMode) {
          targetDom.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.stopPropagation();
            targetDom.classList.add("drag-over-container");
          });
          targetDom.addEventListener("dragleave", (e) => {
            targetDom.classList.remove("drag-over-container");
          });
          targetDom.addEventListener("drop", (e) => {
            e.preventDefault();
            e.stopPropagation();
            targetDom.classList.remove("drag-over-container");
            const draggedId = e.dataTransfer.getData("text/element-id");
            const draggedType = e.dataTransfer.getData("text/type");
            if (draggedId && draggedId !== item.id) {
              const draggedIdx = elements.findIndex(el => el.id === draggedId);
              if (draggedIdx !== -1) {
                const [draggedEl] = elements.splice(draggedIdx, 1);
                draggedEl.parentId = targetParentId;
                elements.push(draggedEl);
                renderCanvas();
                selectElement(draggedId);
                if (typeof pushHistory === "function") pushHistory();
              }
            } else if (draggedType) {
              if (typeof createNewElement === "function") createNewElement(draggedType, "auto", "auto", targetParentId);
            }
          });
        }

        const subChildren = elements.filter(child => child.parentId === targetParentId);
        subChildren.forEach(child => {
          renderElement(child, targetDom);
        });

        if (isEditMode && subChildren.length === 0) {
          const placeholder = document.createElement("div");
          placeholder.className = "empty-container-placeholder";
          placeholder.style.fontSize = "11px";
          placeholder.style.padding = "8px";
          placeholder.innerText = placeholderLabel;
          targetDom.appendChild(placeholder);
        }
      };

      if (mode === "expand_collapse") {
        const items = cfg.items && cfg.items.length ? cfg.items : [{ title: "Judul Panel 1" }];
        items.forEach((_, idx) => {
          const panelId = `${item.id}_panel_${idx}`;
          const panelDom = (inner || div).querySelector(`#${panelId}`);
          setupContainerDropZone(panelDom, panelId, `Panel ${idx + 1} Kosong (Seret / Tambah Elemen Ke Sini)`);
        });
      } else if (mode === "tabs") {
        const tabs = cfg.tabs && cfg.tabs.length ? cfg.tabs : [{ title: "Tab 1" }];
        tabs.forEach((_, idx) => {
          const tabId = `${item.id}_tab_${idx}`;
          const tabDom = (inner || div).querySelector(`#${tabId}`);
          setupContainerDropZone(tabDom, tabId, `Tab ${idx + 1} Kosong (Seret / Tambah Elemen Ke Sini)`);
        });
      } else if (mode === "flippable") {
        const frontId = `${item.id}_front`;
        const backId = `${item.id}_back`;
        const frontDom = (inner || div).querySelector(`#${frontId}`);
        const backDom = (inner || div).querySelector(`#${backId}`);
        setupContainerDropZone(frontDom, frontId, `Sisi Depan Kosong (Seret / Tambah Elemen Ke Sini)`);
        setupContainerDropZone(backDom, backId, `Sisi Belakang Kosong (Seret / Tambah Elemen Ke Sini)`);
      } else if (mode === "checkbox" || mode === "radio") {
        const items = cfg.items && cfg.items.length ? cfg.items : [{ title: "Pilihan 1" }];
        items.forEach((_, idx) => {
          const optId = `${item.id}_${mode}_${idx}`;
          const optDom = (inner || div).querySelector(`#${optId}`);
          setupContainerDropZone(optDom, optId, `Opsi ${idx + 1} Kosong (Seret Elemen Ke Sini)`);
        });
      }
    } else if (item.type === "genui_chatbot") {
      const cfg = item.chatbotConfig || {};
      if (cfg.enableCustomContent) {
        const slotId = `${item.id}_content`;
        const slotDom = (inner || div).querySelector(`#${slotId}`);
        if (slotDom) {
          if (isEditMode) {
            slotDom.addEventListener("dragover", (e) => {
              e.preventDefault();
              e.stopPropagation();
              slotDom.classList.add("drag-over-container");
            });
            slotDom.addEventListener("dragleave", (e) => {
              slotDom.classList.remove("drag-over-container");
            });
            slotDom.addEventListener("drop", (e) => {
              e.preventDefault();
              e.stopPropagation();
              slotDom.classList.remove("drag-over-container");
              const draggedId = e.dataTransfer.getData("text/element-id");
              const draggedType = e.dataTransfer.getData("text/type");
              if (draggedId && draggedId !== item.id) {
                const draggedIdx = elements.findIndex(el => el.id === draggedId);
                if (draggedIdx !== -1) {
                  const [draggedEl] = elements.splice(draggedIdx, 1);
                  draggedEl.parentId = slotId;
                  elements.push(draggedEl);
                  renderCanvas();
                  selectElement(draggedId);
                  if (typeof pushHistory === "function") pushHistory();
                }
              } else if (draggedType) {
                if (typeof createNewElement === "function") createNewElement(draggedType, "auto", "auto", slotId);
              }
            });
          }

          const subChildren = elements.filter(child => child.parentId === slotId || child.parentId === item.id);
          subChildren.forEach(child => {
            renderElement(child, slotDom);
          });

          if (isEditMode && subChildren.length === 0) {
            const placeholder = document.createElement("div");
            placeholder.className = "empty-container-placeholder";
            placeholder.style.fontSize = "11px";
            placeholder.style.padding = "8px";
            placeholder.innerText = "Kotak Konten Chatbot (Seret / Tambah Elemen Ke Sini)";
            slotDom.appendChild(placeholder);
          }
        }
      }
    }

    // Add Resize Handle if edit mode
    const handle = document.createElement("div");
    handle.className = "resize-handle";
    div.appendChild(handle);

    // Mousedown & Touchstart listener for selection/drag
    const handleElementSelect = (e) => {
      if (!isEditMode) return;
      if (e.target && e.target.classList && e.target.classList.contains("resize-handle")) return;

      // If clicking inside a child builder-element nested within this element, do not select this parent element
      const clickedBuilderEl = e.target ? e.target.closest(".builder-element") : null;
      if (clickedBuilderEl && clickedBuilderEl !== div) {
        return;
      }

      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
      selectElement(item.id);
    };

    div.addEventListener("mousedown", handleElementSelect);
    div.addEventListener("touchstart", handleElementSelect, { passive: true });

    // Drag-and-drop reordering & nesting in Edit Mode
    if (isEditMode) {
      div.setAttribute("draggable", "true");

      div.addEventListener("dragstart", (e) => {
        e.stopPropagation();
        e.dataTransfer.setData("text/element-id", item.id);
        e.dataTransfer.effectAllowed = "move";
        div.classList.add("is-dragging-reorder");
      });

      div.addEventListener("dragend", (e) => {
        e.stopPropagation();
        div.classList.remove("is-dragging-reorder");
        document.querySelectorAll(".drop-indicator-above, .drop-indicator-below, .drag-over-container").forEach(el => {
          el.classList.remove("drop-indicator-above", "drop-indicator-below", "drag-over-container");
        });
      });

      div.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isContainer = ["shape", "container", "row", "column", "carousel", "box-interaktif", "box_interaktif", "genui_chatbot"].includes(item.type);

        if (isContainer) {
          div.classList.add("drag-over-container");
        } else {
          const rect = div.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          div.classList.remove("drop-indicator-above", "drop-indicator-below");
          if (e.clientY < midY) {
            div.classList.add("drop-indicator-above");
          } else {
            div.classList.add("drop-indicator-below");
          }
        }
      });

      div.addEventListener("dragleave", (e) => {
        div.classList.remove("drop-indicator-above", "drop-indicator-below", "drag-over-container");
      });

      div.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        div.classList.remove("drop-indicator-above", "drop-indicator-below", "drag-over-container");

        const draggedId = e.dataTransfer.getData("text/element-id");
        const draggedType = e.dataTransfer.getData("text/type");
        const isContainer = ["shape", "container", "row", "column", "carousel", "box-interaktif", "box_interaktif", "genui_chatbot"].includes(item.type);

        if (isContainer) {
          let targetParentId = item.id;
          if (item.type === "carousel") {
            targetParentId = `${item.id}_slide_${item.carouselActiveIndex || 0}`;
          } else if (item.type === "box-interaktif" || item.type === "box_interaktif") {
            const cfg = item.boxConfig || {};
            const mode = cfg.mode || "expand_collapse";
            if (mode === "expand_collapse") {
              const panelIdx = (cfg.activeItemIndex !== undefined && cfg.activeItemIndex >= 0) ? cfg.activeItemIndex : 0;
              targetParentId = `${item.id}_panel_${panelIdx}`;
            } else if (mode === "tabs") {
              const tabIdx = (cfg.activeTabIndex !== undefined && cfg.activeTabIndex >= 0) ? cfg.activeTabIndex : 0;
              targetParentId = `${item.id}_tab_${tabIdx}`;
            } else if (mode === "flippable") {
              targetParentId = cfg.isFlipped ? `${item.id}_back` : `${item.id}_front`;
            } else if (mode === "checkbox" || mode === "radio") {
              targetParentId = `${item.id}_${mode}_0`;
            }
          } else if (item.type === "genui_chatbot") {
            targetParentId = `${item.id}_content`;
          }
          if (draggedId && draggedId !== item.id) {
            const draggedIdx = elements.findIndex(el => el.id === draggedId);
            if (draggedIdx !== -1) {
              const [draggedEl] = elements.splice(draggedIdx, 1);
              draggedEl.parentId = targetParentId;
              elements.push(draggedEl);
              renderCanvas();
              selectElement(draggedId);
              if (typeof pushHistory === "function") pushHistory();
            }
          } else if (draggedType) {
            if (typeof createNewElement === "function") createNewElement(draggedType, "auto", "auto", targetParentId);
          }
        } else {
          // REORDER DI SEBELAH/SEJAJAR ELEMEN LEAF
          const rect = div.getBoundingClientRect();
          const isAbove = e.clientY < (rect.top + rect.height / 2);

          if (draggedId && draggedId !== item.id) {
            const draggedIdx = elements.findIndex(el => el.id === draggedId);
            if (draggedIdx !== -1) {
              const [draggedEl] = elements.splice(draggedIdx, 1);
              draggedEl.parentId = item.parentId || null;
              let insertIdx = elements.findIndex(el => el.id === item.id);
              if (!isAbove) insertIdx++;
              elements.splice(insertIdx, 0, draggedEl);
              renderCanvas();
              selectElement(draggedId);
              if (typeof pushHistory === "function") pushHistory();
            }
          } else if (draggedType) {
            const targetIdx = elements.findIndex(el => el.id === item.id);
            let insertIdx = targetIdx !== -1 ? (isAbove ? targetIdx : targetIdx + 1) : elements.length;
            if (typeof createNewElementAtIndex === "function") createNewElementAtIndex(draggedType, insertIdx, item.parentId || null);
          }
        }
      });
    }

    parentDom.appendChild(div);
  }

  rootElements.forEach(item => {
    renderElement(item, canvas);
  });

  // Render layers panel if visible
  const layersPanel = document.getElementById("layersPanel");
  if (layersPanel && isEditMode && !layersPanel.classList.contains("hidden")) {
    if (typeof renderLayersPanelContent === "function") renderLayersPanelContent();
  }

  // Update background preview
  if (typeof updateBgStyle === "function") updateBgStyle();
  if (typeof adjustCanvasHeight === "function") adjustCanvasHeight();
}

function applyElementStyles(el, style) {
  if (!style) return;
  const outerDivOnly = [
    "left", "top", "width", "height", "zIndex",
    "boxShadow", "outline", "outlineOffset", "gapBottom",
    "padding", "borderRadius", "border", "borderStyle", "borderColor", "borderWidth", "backgroundColor", "background", "clipPath", "webkitClipPath"
  ];
  Object.keys(style).forEach((key) => {
    if (outerDivOnly.includes(key)) return;
    if (style[key] === null || style[key] === undefined) return;
    el.style[key] = style[key];
  });

  if (style.borderRadius !== undefined && style.borderRadius !== null && style.borderRadius !== "") {
    el.style.borderRadius = style.borderRadius;
  }
}

function toggleEditMode() {
  if (!window.isAdmin) return;
  isEditMode = !isEditMode;

  const icon = document.getElementById("modeIcon");
  const saveBtn = document.getElementById("btnSave");
  const toolbox = document.getElementById("toolboxRow");
  const drawer = document.getElementById("propertiesDrawer");
  const layersBtn = document.getElementById("btnToggleLayers");
  const layersPanel = document.getElementById("layersPanel");
  const btnPalette = document.getElementById("btnPalette");

  if (isEditMode) {
    if (icon) {
      if (icon.tagName && icon.tagName.toLowerCase() === 'img') {
        icon.src = "/static/image/icon/view.svg";
        icon.alt = "Mode Preview";
      } else {
        icon.outerHTML = `<img id="modeIcon" src="/static/image/icon/view.svg" alt="Mode Preview" style="width: 28px; height: 28px;" />`;
      }
    }
    saveBtn.classList.remove("hidden");
    toolbox.classList.remove("hidden");
    canvas.classList.add("editing-active");
    if (layersBtn) layersBtn.classList.remove("hidden");
    if (btnPalette && window.isAdmin) btnPalette.classList.remove("hidden");
    const btnUIKit = document.getElementById("btnUIKit");
    if (btnUIKit && window.isAdmin) btnUIKit.classList.remove("hidden");
    document.getElementById("btnUndo")?.classList.remove("hidden");
    document.getElementById("btnRedo")?.classList.remove("hidden");
  } else {
    if (icon) {
      if (icon.tagName && icon.tagName.toLowerCase() === 'img') {
        icon.src = "/static/image/icon/edit_builder.svg";
        icon.alt = "Mode Edit";
      } else {
        icon.outerHTML = `<img id="modeIcon" src="/static/image/icon/edit_builder.svg" alt="Mode Edit" style="width: 28px; height: 28px;" />`;
      }
    }
    saveBtn.classList.add("hidden");
    toolbox.classList.add("hidden");
    drawer.classList.add("hidden");
    canvas.classList.remove("editing-active");
    if (layersBtn) layersBtn.classList.add("hidden");
    if (layersPanel) layersPanel.classList.add("hidden");
    if (btnPalette) btnPalette.classList.add("hidden");
    const btnUIKit = document.getElementById("btnUIKit");
    if (btnUIKit) btnUIKit.classList.add("hidden");
    document.getElementById("paletteHeaderContainer")?.classList.add("hidden");
    document.getElementById("btnUndo")?.classList.add("hidden");
    document.getElementById("btnRedo")?.classList.add("hidden");
    deselectAll();
  }
  renderCanvas();
}

let lastElementSelectTime = 0;

function selectElement(id) {
  lastElementSelectTime = Date.now();
  const canvasScrollable = getCanvasScrollable();
  if (selectedElementId === null && canvasScrollable) {
    originalScrollTop = canvasScrollable.scrollTop;
  }

  selectedElementId = id;
  document.querySelectorAll(".builder-element").forEach((el) => {
    el.classList.remove("active-element");
  });
  const el = document.getElementById(id);
  if (el) {
    el.classList.add("active-element");
    if (canvasScrollable) {
      let totalOffsetTop = 0;
      let current = el;
      while (current && current !== canvasScrollable) {
        totalOffsetTop += current.offsetTop;
        current = current.offsetParent;
      }

      const drawer = document.getElementById("propertiesDrawer");
      const drawerHeight = drawer ? drawer.offsetHeight : 0;
      const safeDrawerHeight = drawerHeight || 300;

      let spacer = document.getElementById("canvasScrollSpacer");
      if (!spacer) {
        spacer = document.createElement("div");
        spacer.id = "canvasScrollSpacer";
        spacer.style.width = "100%";
        spacer.style.pointerEvents = "none";
        canvasScrollable.appendChild(spacer);
      }
      spacer.style.height = (safeDrawerHeight + 150) + "px";
      spacer.style.display = "block";

      const visibleHeight = canvasScrollable.clientHeight - safeDrawerHeight;
      const targetScroll = Math.max(0, totalOffsetTop - Math.max(20, visibleHeight / 3));

      setTimeout(() => {
        if (typeof canvasScrollable.scrollTo === "function") {
          canvasScrollable.scrollTo({
            top: targetScroll,
            behavior: "smooth"
          });
        } else {
          canvasScrollable.scrollTop = targetScroll;
        }
      }, 50);
    }
  }

  const drawer = document.getElementById("propertiesDrawer");
  if (drawer) {
    drawer.classList.remove("hidden");
  }
  document.getElementById("drawerTitle").innerText = "Pengaturan Elemen";

  document.getElementById("bgSettingsPanel").classList.add("hidden");
  document.getElementById("elementPropertiesPanel").classList.remove("hidden");
  const drawerActions = document.getElementById("drawerActions");
  if (drawerActions) drawerActions.style.display = "";

  const data = elements.find((item) => item.id === id);
  if (data && typeof updatePropertiesDrawer === "function") {
    updatePropertiesDrawer(data);
  }
}

function deselectAll() {
  selectedElementId = null;
  document.querySelectorAll(".builder-element").forEach((el) => {
    el.classList.remove("active-element");
  });
  const drawer = document.getElementById("propertiesDrawer");
  if (drawer) drawer.classList.add("hidden");

  const spacer = document.getElementById("canvasScrollSpacer");
  if (spacer) {
    spacer.style.display = "none";
    spacer.style.height = "0px";
  }
  originalScrollTop = null;
}

canvas.addEventListener("click", (e) => {
  if (Date.now() - lastElementSelectTime < 600) return;
  if (e.target === canvas) {
    deselectAll();
  }
});

function openBgSettings() {
  deselectAll();
  const drawer = document.getElementById("propertiesDrawer");
  drawer.classList.remove("hidden");
  document.getElementById("drawerTitle").innerText = "Latar Belakang";
  document.getElementById("bgSettingsPanel").classList.remove("hidden");
  document.getElementById("elementPropertiesPanel").classList.add("hidden");
  const drawerActions = document.getElementById("drawerActions");
  if (drawerActions) drawerActions.style.display = "none";
}

const SNAP_THRESHOLD = 10;

function showSnapGuide(topPx) {
  const guide = document.getElementById("snapGuideLine");
  if (!guide) return;
  guide.style.top = topPx + "px";
  guide.style.display = "block";
  guide.style.animation = "none";
  guide.offsetHeight;
  guide.style.animation = "";
}

function hideSnapGuide() {
  const guide = document.getElementById("snapGuideLine");
  if (guide) guide.style.display = "none";
}

function getCanvasScrollable() {
  return document.getElementById("canvasScrollable") || document.querySelector(".canvas-workspace");
}

// Inisialisasi render canvas saat halaman selesai dimuat
function initCanvasRender() {
  if (typeof convertPercentagesToPixels === "function") convertPercentagesToPixels();
  if (typeof renderCanvas === "function") renderCanvas();
  if (typeof pushHistory === "function") pushHistory();
}

function getInteractiveBoxMessagePayload() {
  const payloads = [];
  elements.forEach(el => {
    if ((el.type === "box-interaktif" || el.type === "box_interaktif") && el.boxConfig && el.boxConfig.sendDataToButton) {
      const mode = el.boxConfig.mode;
      if (mode === "checkbox" || mode === "radio") {
        const items = el.boxConfig.items || [];
        const checkedItems = items.filter(it => it.checked).map(it => (it.title || "").trim()).filter(Boolean);
        if (checkedItems.length > 0) {
          const choiceStr = checkedItems.join(", ");
          const tpl = (el.boxConfig.messageText || "Pilihan Saya: {pilihan}").trim();
          if (tpl.includes("{pilihan}")) {
            payloads.push(tpl.replace(/\{pilihan\}/g, choiceStr));
          } else if (tpl) {
            payloads.push(`${tpl}: ${choiceStr}`);
          } else {
            payloads.push(`Pilihan: ${choiceStr}`);
          }
        }
      }
    }
  });
  return payloads.join("\n");
}
window.getInteractiveBoxMessagePayload = getInteractiveBoxMessagePayload;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCanvasRender);
} else {
  initCanvasRender();
}
