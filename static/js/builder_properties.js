/* ==========================================
   PROMOTION PAGE BUILDER - PROPERTIES DRAWER & FIGMA-LIKE FILL/STROKE
   ========================================== */

function updatePropertiesDrawer(data) {
  if (!data) return;

  // Sembunyikan semua group khusus
  document.getElementById("groupText").classList.add("hidden");
  document.getElementById("groupImage").classList.add("hidden");
  document.getElementById("groupShape").classList.add("hidden");
  document.getElementById("groupButton").classList.add("hidden");
  const groupCarousel = document.getElementById("groupCarousel");
  if (groupCarousel) groupCarousel.classList.add("hidden");
  const groupRow = document.getElementById("groupRow");
  if (groupRow) groupRow.classList.add("hidden");
  const groupColumn = document.getElementById("groupColumn");
  if (groupColumn) groupColumn.classList.add("hidden");
  const groupMediaEmbed = document.getElementById("groupMediaEmbed");
  if (groupMediaEmbed) groupMediaEmbed.classList.add("hidden");
  const groupGenuiChatbot = document.getElementById("groupGenuiChatbot");
  if (groupGenuiChatbot) groupGenuiChatbot.classList.add("hidden");
  const groupBoxInteraktif = document.getElementById("groupBoxInteraktif");
  if (groupBoxInteraktif) groupBoxInteraktif.classList.add("hidden");

  const panelBoxShapeEditor = document.getElementById("panelBoxShapeEditor");
  if (panelBoxShapeEditor) panelBoxShapeEditor.classList.add("hidden");

  const boxBorderRadius = document.getElementById("boxBorderRadius");
  const boxTextSpacing = document.getElementById("boxTextSpacing");

  // Tampilkan group yang sesuai
  if (data.type === "title" || data.type === "text") {
    if (boxBorderRadius) boxBorderRadius.classList.add("hidden");
    if (boxTextSpacing) boxTextSpacing.classList.remove("hidden");

    let ls = 0;
    if (data.style && data.style.letterSpacing) {
      ls = parseFloat(data.style.letterSpacing) || 0;
    }
    if (document.getElementById("propLetterSpacing")) document.getElementById("propLetterSpacing").value = ls;
    if (document.getElementById("letterSpacingVal")) document.getElementById("letterSpacingVal").innerText = ls;

    let lh = data.type === "title" ? 1.2 : 1.5;
    if (data.style && data.style.lineHeight) {
      lh = parseFloat(data.style.lineHeight) || lh;
    }
    if (document.getElementById("propLineHeight")) document.getElementById("propLineHeight").value = lh;
    if (document.getElementById("lineHeightVal")) document.getElementById("lineHeightVal").innerText = lh;

    document.getElementById("groupText").classList.remove("hidden");
    document.getElementById("propTextContent").value = data.content;
    document.getElementById("propFontSize").value = parseInt(data.style.fontSize) || 16;
    document.getElementById("fontSizeVal").innerText = parseInt(data.style.fontSize) || 16;
    document.getElementById("propFontWeight").value = data.style.fontWeight || "400";
    if (document.getElementById("propTextColor")) document.getElementById("propTextColor").value = rgbToHex(data.style.color) || "#2c5d6b";
    if (document.getElementById("propTextColorHex")) document.getElementById("propTextColorHex").innerText = data.style.color || "#2c5d6b";
    document.getElementById("propTextAlign").value = data.style.textAlign || "left";

    const groupTitleSpecific = document.getElementById("groupTitleSpecific");
    const groupParagraphSpecific = document.getElementById("groupParagraphSpecific");
    const groupTitleEffects = document.getElementById("groupTitleEffects");

    if (data.type === "title") {
      if (groupTitleSpecific) groupTitleSpecific.classList.remove("hidden");
      if (groupTitleEffects) groupTitleEffects.classList.remove("hidden");
      if (groupParagraphSpecific) groupParagraphSpecific.classList.add("hidden");

      if (document.getElementById("propHeadingTag")) {
        document.getElementById("propHeadingTag").value = (data.headingTag || "h2").toLowerCase();
      }

      // Title Stroke Controls
      const sWidth = data.textStrokeWidth !== undefined ? parseFloat(data.textStrokeWidth) : 0;
      if (document.getElementById("propTitleStrokeWidth")) document.getElementById("propTitleStrokeWidth").value = sWidth;
      if (document.getElementById("titleStrokeWidthVal")) document.getElementById("titleStrokeWidthVal").innerText = sWidth;

      // Title Shadow Controls
      const sBlur = data.textShadowBlur !== undefined ? parseFloat(data.textShadowBlur) : 0;
      if (document.getElementById("propTitleShadowBlur")) document.getElementById("propTitleShadowBlur").value = sBlur;
      if (document.getElementById("titleShadowBlurVal")) document.getElementById("titleShadowBlurVal").innerText = sBlur;

      const sOx = data.textShadowOffsetX !== undefined ? parseFloat(data.textShadowOffsetX) : 0;
      if (document.getElementById("propTitleShadowOffsetX")) document.getElementById("propTitleShadowOffsetX").value = sOx;
      if (document.getElementById("titleShadowOffsetXVal")) document.getElementById("titleShadowOffsetXVal").innerText = sOx;

      const sOy = data.textShadowOffsetY !== undefined ? parseFloat(data.textShadowOffsetY) : 2;
      if (document.getElementById("propTitleShadowOffsetY")) document.getElementById("propTitleShadowOffsetY").value = sOy;
      if (document.getElementById("titleShadowOffsetYVal")) document.getElementById("titleShadowOffsetYVal").innerText = sOy;

      updateTitleColorTriggers(data);
    } else {
      // data.type === "text"
      if (groupTitleSpecific) groupTitleSpecific.classList.add("hidden");
      if (groupTitleEffects) groupTitleEffects.classList.add("hidden");
      if (groupParagraphSpecific) groupParagraphSpecific.classList.remove("hidden");

      if (document.getElementById("propTextListMode")) {
        document.getElementById("propTextListMode").value = data.listMode || "normal";
      }
    }

    renderTextColorPanel();
    updateTextColorTriggerSummary();

    const suggestionsArea = document.getElementById("aiSuggestionsArea");
    if (suggestionsArea) suggestionsArea.classList.add("hidden");
    const promptInput = document.getElementById("propAiPrompt");
    if (promptInput) promptInput.value = "";
  } else {
    closeTextColorPopover();
    const groupTitleSpecific = document.getElementById("groupTitleSpecific");
    const groupParagraphSpecific = document.getElementById("groupParagraphSpecific");
    const groupTitleEffects = document.getElementById("groupTitleEffects");
    if (groupTitleSpecific) groupTitleSpecific.classList.add("hidden");
    if (groupTitleEffects) groupTitleEffects.classList.add("hidden");
    if (groupParagraphSpecific) groupParagraphSpecific.classList.add("hidden");

    if (boxBorderRadius) boxBorderRadius.classList.remove("hidden");
    if (boxTextSpacing) boxTextSpacing.classList.add("hidden");
  }

  if (data.type === "image") {
    document.getElementById("groupImage").classList.remove("hidden");
    const urlInput = document.getElementById("propImageUrl");
    if (urlInput) urlInput.value = data.imageSrc || "";
    document.getElementById("propObjectFit").value = data.style.objectFit || "cover";
  } else if (data.type === "shape") {
    document.getElementById("groupShape").classList.remove("hidden");
    if (panelBoxShapeEditor) panelBoxShapeEditor.classList.remove("hidden");
  } else if (data.type === "container") {
    document.getElementById("groupShape").classList.remove("hidden");
  } else if (data.type === "row") {
    document.getElementById("groupShape").classList.remove("hidden");
    if (groupRow) {
      groupRow.classList.remove("hidden");
      const colChildren = elements.filter(el => el.parentId === data.id && el.type === "column");
      document.getElementById("propRowColumnsCount").value = colChildren.length || 1;
    }
  } else if (data.type === "column") {
    document.getElementById("groupShape").classList.remove("hidden");
    if (groupColumn) {
      groupColumn.classList.remove("hidden");
      const preset = data.columnWidthPreset || (data.style.width && data.style.width.includes("50%") ? "50%" : (data.style.width && data.style.width.includes("33.33%") ? "33.33%" : (data.style.width && data.style.width.includes("66.66%") ? "66.66%" : (data.style.width && data.style.width.includes("25%") ? "25%" : (data.style.width && data.style.width.includes("75%") ? "75%" : (data.style.width === "auto" ? "auto" : "100%"))))));
      document.getElementById("propColumnWidth").value = preset;
    }
  } else if (data.type === "media_embed") {
    if (groupMediaEmbed) {
      groupMediaEmbed.classList.remove("hidden");
      document.getElementById("propMediaEmbedUrl").value = data.url || "";
      if (document.getElementById("propMediaAutoplay")) document.getElementById("propMediaAutoplay").checked = data.autoplay !== false;
      if (document.getElementById("propMediaFrameScale")) {
        const sc = data.frameScale !== undefined ? data.frameScale : 100;
        document.getElementById("propMediaFrameScale").value = sc;
        if (document.getElementById("frameScaleLbl")) document.getElementById("frameScaleLbl").innerText = sc;
      }
      if (document.getElementById("propMediaShowHeader")) document.getElementById("propMediaShowHeader").checked = data.showHeader !== false;
      if (document.getElementById("propMediaCoverImage")) document.getElementById("propMediaCoverImage").value = data.coverImage || "";
      if (document.getElementById("propMediaCustomTitle")) document.getElementById("propMediaCustomTitle").value = data.customTitle || "";
      if (document.getElementById("propMediaCustomDesc")) document.getElementById("propMediaCustomDesc").value = data.customDesc || "";
      if (document.getElementById("propMediaShowBtn")) document.getElementById("propMediaShowBtn").checked = data.showBtn !== false;
      if (document.getElementById("propMediaBtnText")) document.getElementById("propMediaBtnText").value = data.btnText || "Buka Link / Website";

      updateMediaEmbedColorTriggers(data);

      // Single Frame Customization Panel collapse state
      const hasCustomFrame = !!(
        data.coverImage ||
        data.customTitle ||
        data.customDesc ||
        data.showHeader === false ||
        data.headerBg ||
        data.headerBgData ||
        data.headerColor ||
        data.headerColorData ||
        data.titleColor ||
        data.titleColorData ||
        data.descColor ||
        data.descColorData ||
        data.btnBg ||
        data.btnBgData ||
        data.btnColor ||
        data.btnColorData ||
        (data.cardBg && data.cardBg !== "transparent")
      );
      const frameBody = document.getElementById("mediaFrameBodyPanel");
      const frameBtn = document.getElementById("btnMediaFrameToggle");
      if (frameBody) frameBody.classList.toggle("hidden", !hasCustomFrame);
      if (frameBtn) frameBtn.classList.toggle("fs-active", hasCustomFrame);
    }
  } else if (data.type === "genui_chatbot") {
    if (groupGenuiChatbot) {
      groupGenuiChatbot.classList.remove("hidden");
      const cfg = data.chatbotConfig || {};
      if (document.getElementById("propChatbotName")) document.getElementById("propChatbotName").value = cfg.botName || "AI Assistant";
      if (document.getElementById("chatbotAvatarImg")) {
        document.getElementById("chatbotAvatarImg").src = cfg.avatarUrl || "/static/image/icon/elemen-genui-chatbot.svg";
      }
      if (document.getElementById("chatbotUserAvatarImg")) {
        document.getElementById("chatbotUserAvatarImg").src = cfg.userAvatarUrl || "/static/image/icon/elemen-testimoni.svg";
      }
      if (document.getElementById("propChatbotSystemPrompt")) document.getElementById("propChatbotSystemPrompt").value = cfg.systemPrompt || "";
      if (document.getElementById("propChatbotWelcome")) document.getElementById("propChatbotWelcome").value = cfg.welcomeMsg || "Halo! Ada yang bisa saya bantu?";
      if (document.getElementById("propChatbotTone")) document.getElementById("propChatbotTone").value = cfg.tone || "friendly";

      if (document.getElementById("propChatbotChip1")) document.getElementById("propChatbotChip1").value = cfg.chip1 || "";
      if (document.getElementById("propChatbotChip2")) document.getElementById("propChatbotChip2").value = cfg.chip2 || "";
      if (document.getElementById("propChatbotChip3")) document.getElementById("propChatbotChip3").value = cfg.chip3 || "";

      if (document.getElementById("propChatbotChipsPosition")) document.getElementById("propChatbotChipsPosition").value = cfg.chipsPosition || "inside";
      if (document.getElementById("propChatbotChipRadius")) document.getElementById("propChatbotChipRadius").value = cfg.chipRadius || "16px";

      if (document.getElementById("propGenuiCustomContent")) document.getElementById("propGenuiCustomContent").checked = cfg.enableCustomContent === true;
      if (document.getElementById("propChatbotShowHeader")) document.getElementById("propChatbotShowHeader").checked = cfg.showHeader !== false;
      if (document.getElementById("propChatbotHeaderAlign")) document.getElementById("propChatbotHeaderAlign").value = cfg.headerAlign || "left";
      if (document.getElementById("propChatbotShowBubbleAvatars")) document.getElementById("propChatbotShowBubbleAvatars").checked = cfg.showBubbleAvatars === true;

      if (document.getElementById("propChatbotBotAlign")) document.getElementById("propChatbotBotAlign").value = cfg.botAlign || "flex-start";
      if (document.getElementById("propChatbotUserAlign")) document.getElementById("propChatbotUserAlign").value = cfg.userAlign || "flex-end";
      if (document.getElementById("propChatbotFontSize")) document.getElementById("propChatbotFontSize").value = cfg.fontSize || "13px";

      if (document.getElementById("propChatbotInputRadius")) document.getElementById("propChatbotInputRadius").value = cfg.inputBorderRadius || "12px";
      if (document.getElementById("propChatbotPlaceholder")) document.getElementById("propChatbotPlaceholder").value = cfg.placeholderText || "Ketik pertanyaan RAG...";
      if (document.getElementById("propChatbotInputContainerBgEnabled")) document.getElementById("propChatbotInputContainerBgEnabled").checked = cfg.inputContainerBgEnabled === true;

      if (document.getElementById("propChatbotSendBtnMode")) document.getElementById("propChatbotSendBtnMode").value = cfg.sendBtnMode || "icon_text";
      if (document.getElementById("propChatbotSendBtnText")) document.getElementById("propChatbotSendBtnText").value = cfg.sendBtnText !== undefined ? cfg.sendBtnText : "Kirim";

      updateChatbotColorTriggers(data);

      if (document.getElementById("chatbotBgUploadStatus")) {
        document.getElementById("chatbotBgUploadStatus").innerText = cfg.bgImageUrl ? "✔ Wallpaper aktif" : "";
      }
    }
  } else if (data.type === "box-interaktif" || data.type === "box_interaktif") {
    const groupBox = document.getElementById("groupBoxInteraktif");
    if (groupBox) {
      groupBox.classList.remove("hidden");
      if (!data.boxConfig) {
        data.boxConfig = {
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
      }
      const cfg = data.boxConfig;

      document.querySelectorAll("#groupBoxInteraktif .box-design-card").forEach(card => {
        card.classList.toggle("active", card.getAttribute("data-design") === (cfg.mode || "expand_collapse"));
      });

      renderBoxItemsListContainer(data);
      updateBoxInteractiveColorTriggers(data);
    }

  } else if (data.type === "button") {
    document.getElementById("groupButton").classList.remove("hidden");
    document.getElementById("groupShape").classList.remove("hidden");
    document.getElementById("propBtnText").value = data.content || "";

    const btnDesign = data.btnDesignType || "simple_button";
    data.btnDesignType = btnDesign;

    document.querySelectorAll("#groupButton .button-design-card").forEach(card => {
      card.classList.toggle("active", card.getAttribute("data-btn-design") === btnDesign);
    });

    const inputGroup = document.getElementById("btnInputSettingsGroup");
    if (inputGroup) {
      inputGroup.classList.toggle("hidden", btnDesign !== "input_button");
    }

    if (btnDesign === "input_button") {
      if (document.getElementById("propBtnInputLayout")) {
        document.getElementById("propBtnInputLayout").value = data.inputLayout || "stacked";
      }
      if (document.getElementById("propBtnPlaceholder")) {
        document.getElementById("propBtnPlaceholder").value = data.placeholderText !== undefined ? data.placeholderText : "Ketik pesan atau pertanyaan di sini...";
      }
      updateButtonInputColorTriggers(data);
    }

    // Deteksi atau baca btnLinkType
    let linkType = data.btnLinkType;
    if (!linkType) {
      if (data.url && (data.url.includes("wa.me") || data.url.includes("whatsapp.com"))) {
        linkType = "whatsapp";
      } else if (data.url) {
        linkType = "url";
      } else {
        linkType = "whatsapp";
      }
      data.btnLinkType = linkType;
    }

    const selectLinkType = document.getElementById("propBtnLinkType");
    if (selectLinkType) selectLinkType.value = linkType;

    const urlLabel = document.getElementById("propBtnUrlLabel");
    if (urlLabel) {
      urlLabel.innerText = linkType === "whatsapp" ? "Tautan WhatsApp (https://wa.me/...)" : "Tautan Web / Sosmed (https://...)";
    }

    const urlInput = document.getElementById("propBtnUrl");
    if (urlInput) {
      if (linkType === "whatsapp") {
        urlInput.value = data.url !== undefined ? data.url : "https://wa.me/";
        urlInput.placeholder = "https://wa.me/628123456789";
      } else {
        urlInput.value = data.url || "";
        urlInput.placeholder = "https://...";
      }
    }

    if (document.getElementById("propBtnFontWeight")) {
      document.getElementById("propBtnFontWeight").value = (data.style && data.style.fontWeight) || "600";
    }
    const btnFs = (data.style && data.style.fontSize) ? parseInt(data.style.fontSize) : 16;
    if (document.getElementById("propBtnFontSize")) document.getElementById("propBtnFontSize").value = btnFs;
    if (document.getElementById("btnFontSizeVal")) document.getElementById("btnFontSizeVal").innerText = btnFs;
    updateBtnTextColorTrigger(data);
  } else if (data.type === "carousel") {
    if (groupCarousel) {
      groupCarousel.classList.remove("hidden");
      document.getElementById("groupShape").classList.remove("hidden");

      const numSlides = data.slidesCount || 3;
      const activeIdx = data.carouselActiveIndex || 0;

      const slideCountLabel = document.getElementById("propCarouselSlideCount");
      if (slideCountLabel) slideCountLabel.innerText = `(${numSlides} Slide)`;

      // Render Slide Tabs
      const tabsContainer = document.getElementById("propCarouselSlideTabs");
      if (tabsContainer) {
        tabsContainer.innerHTML = "";
        for (let i = 0; i < numSlides; i++) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = `shape-preset-btn ${i === activeIdx ? "active" : ""}`;
          btn.style.padding = "4px 10px";
          btn.style.borderRadius = "14px";
          btn.style.border = i === activeIdx ? "1.5px solid #38a0c4" : "1px solid #bddce7";
          btn.style.background = i === activeIdx ? "#38a0c4" : "#ffffff";
          btn.style.color = i === activeIdx ? "#ffffff" : "#2c5d6b";
          btn.style.fontWeight = "700";
          btn.style.fontSize = "11px";
          btn.style.cursor = "pointer";
          btn.style.whiteSpace = "nowrap";
          btn.innerText = `Slide ${i + 1}`;
          btn.onclick = () => {
            if (typeof setCarouselActiveIndex === "function") setCarouselActiveIndex(data.id, i);
          };
          tabsContainer.appendChild(btn);
        }
      }

      // Populate Arrow Colors & Shape
      updateCarouselColorTriggers(data);

      const arrowShape = data.arrowShape || "50%";
      if (document.getElementById("propCarouselArrowShape")) document.getElementById("propCarouselArrowShape").value = arrowShape;

      document.getElementById("propCarouselSpeed").value = data.carouselSpeed !== undefined ? data.carouselSpeed : 3;
    }
  }

  loadFillStrokePanel(data);

  // Width slider
  const wVal = parseInt(data.style.width) || 80;
  document.getElementById("propWidth").value = wVal;
  document.getElementById("widthVal").innerText = wVal;

  // Height slider
  const hVal = data.style.height;
  const hNum = hVal === "auto" ? 100 : (parseInt(hVal) || 100);
  document.getElementById("propHeight").value = hVal === "auto" ? "" : hNum;
  document.getElementById("propHeightSlider").value = Math.min(hNum, 800);
  document.getElementById("heightVal").innerText = hVal === "auto" ? "Auto" : hNum;

  // Top (Posisi Y) slider
  const topPxInput = document.getElementById("propTopPx");
  const topPxSlider = document.getElementById("propTopPxSlider");
  const topPxLabel = document.getElementById("topPxVal");
  if (topPxInput && topPxSlider && topPxLabel) {
    if (!data.parentId) {
      let tpx = 0;
      if (data.style.top && data.style.top.includes('%')) {
        const canvasH = canvas.scrollHeight || canvas.offsetHeight;
        const topPercent = parseFloat(data.style.top) || 0;
        tpx = Math.round((topPercent / 100) * canvasH);
      } else {
        tpx = Math.round(parseFloat(data.style.top)) || 0;
      }
      topPxInput.value = tpx;
      topPxInput.placeholder = "Contoh: 120";
      topPxSlider.value = Math.min(tpx, 2000);
      topPxLabel.innerText = tpx;
    } else {
      topPxInput.value = "";
      topPxInput.placeholder = "(di dalam container)";
      topPxSlider.value = 0;
      topPxLabel.innerText = 0;
    }
  }

  // Gap bottom slider
  const gapVal = parseInt(data.style.gapBottom) || 0;
  const gapBottomInput = document.getElementById("propGapBottom");
  const gapBottomSlider = document.getElementById("propGapBottomSlider");
  const gapBottomLabel = document.getElementById("gapBottomVal");
  if (gapBottomInput) gapBottomInput.value = gapVal;
  if (gapBottomSlider) gapBottomSlider.value = Math.min(gapVal, 200);
  if (gapBottomLabel) gapBottomLabel.innerText = gapVal;

  // Z-Index slider (Range: 1 - 20)
  const zVal = parseInt(data.style.zIndex) || 1;
  const clampedZVal = Math.min(Math.max(zVal, 1), 20);
  document.getElementById("propZIndex").value = clampedZVal;
  document.getElementById("propZIndexSlider").value = clampedZVal;
  document.getElementById("zIndexVal").innerText = clampedZVal;

  // Border fields
  const radVal = (data.style && data.style.borderRadius !== undefined && data.style.borderRadius !== "") ? (parseInt(data.style.borderRadius) || 0) : 8;
  if (document.getElementById("propBorderRadius")) document.getElementById("propBorderRadius").value = radVal;
  if (document.getElementById("borderRadiusVal")) document.getElementById("borderRadiusVal").innerText = radVal;
  document.getElementById("propBorderStyle").value = (data.strokeData && data.strokeData.style) || data.style.strokeStyle || (data.style.borderStyle && data.style.borderStyle !== 'none' ? data.style.borderStyle : "solid");
  if (document.getElementById("propBorderColor")) document.getElementById("propBorderColor").value = rgbToHex(data.style.borderColor) || "#38a0c4";
  if (document.getElementById("propBorderColorHex")) document.getElementById("propBorderColorHex").innerText = data.style.borderColor || "#38a0c4";
  if (document.getElementById("propBorderWidth")) document.getElementById("propBorderWidth").value = parseInt(data.style.borderWidth) || 1;

  // Alignment options
  const alignSelect = document.getElementById("propAlignment");
  if (alignSelect) {
    const currentAlign = data.alignmentPreset || (data.style.alignSelf === "flex-start" ? "left" : data.style.alignSelf === "flex-end" ? "right" : data.style.alignSelf === "stretch" ? "stretch" : (data.style.alignSelf || "center"));
    alignSelect.value = currentAlign;
  }

  // Padding options
  const padVal = data.style.padding ? parseInt(data.style.padding) : 0;
  const padInput = document.getElementById("propPadding");
  if (padInput) {
    padInput.value = padVal;
    document.getElementById("paddingVal").innerText = padVal;
  }

  toggleBorderColorGroup(data.style.borderStyle || "none");
}

function updateSelectedElementContent() {
  const data = elements.find((item) => item.id === selectedElementId);
  if (!data) return;

  const input = data.type === "button" ? document.getElementById("propBtnText") : document.getElementById("propTextContent");
  data.content = input.value;

  const div = document.getElementById(selectedElementId);
  if (div) {
    if (data.type === "button") {
      const btnSpan = div.querySelector(".btn-text-content");
      if (btnSpan) btnSpan.innerText = data.content;
      else {
        const btn = div.querySelector(".element-button") || div.firstElementChild;
        if (btn) btn.innerText = data.content;
      }
    } else if (data.type === "text" && (data.listMode === "bullet" || data.listMode === "numbered")) {
      renderCanvas();
    } else {
      const inner = div.firstElementChild;
      if (inner) inner.innerText = data.content;
    }
  }
  if (typeof adjustCanvasHeight === "function") adjustCanvasHeight();
  if (typeof pushHistoryDebounced === "function") pushHistoryDebounced();
}

function updateSelectedElementStyle(key, val) {
  const data = elements.find((item) => item.id === selectedElementId);
  if (!data) return;

  data.style[key] = val;

  if (key === "width" && !data.parentId) {
    const wVal = parseFloat(val);
    if (!isNaN(wVal)) {
      const leftVal = `${((100 - wVal) / 2).toFixed(2)}%`;
      data.style.left = leftVal;
      const div = document.getElementById(selectedElementId);
      if (div) div.style.left = leftVal;
    }
  }

  if (key === "color" && data.type === "button") {
    const btnHex = document.getElementById("propBtnTextColorHex");
    if (btnHex) btnHex.innerText = val;
  } else if (key === "color") {
    const textHex = document.getElementById("propTextColorHex");
    if (textHex) textHex.innerText = val;
    if (['title', 'text'].includes(data.type)) {
      if (!data.fillData) data.fillData = getDefaultFillData(data.style, data.type);
      data.fillData.color = val;
      updateTextColorTriggerSummary();
    }
  } else if (key === "backgroundColor" && data.type === "button") {
    const btnBgHex = document.getElementById("propBtnBgHex");
    if (btnBgHex) btnBgHex.innerText = val;
  } else if (key === "backgroundColor") {
    const shapeBgHex = document.getElementById("propShapeBgHex");
    if (shapeBgHex) shapeBgHex.innerText = val;
  } else if (key === "borderColor") {
    const borderHex = document.getElementById("propBorderColorHex");
    if (borderHex) borderHex.innerText = val;
  }

  if (key === "borderStyle") toggleBorderColorGroup(val);

  const div = document.getElementById(selectedElementId);
  if (div) {
    const isInputBtn = data.type === "button" && data.btnDesignType === "input_button";
    if (["width", "zIndex"].includes(key) || (!isInputBtn && ["height", "borderRadius", "borderStyle", "borderColor", "borderWidth", "padding", "boxShadow", "outline"].includes(key))) {
      div.style[key] = val;
    }
    if (key === "borderRadius") {
      if (!isInputBtn) {
        div.style.overflow = (val && parseInt(val) > 0) ? "hidden" : "";
        if (document.getElementById("borderRadiusVal")) {
          document.getElementById("borderRadiusVal").innerText = parseInt(val) || 0;
        }
        const strokeRect = div.querySelector(':scope > .builder-stroke-svg rect');
        if (strokeRect) {
          const r = parseInt(val) || 0;
          strokeRect.setAttribute('rx', r);
          strokeRect.setAttribute('ry', r);
        }
      } else {
        const textarea = div.querySelector(".btn-input-textarea");
        const btn = div.querySelector(".element-button");
        if (textarea) textarea.style.borderRadius = val;
        if (btn) btn.style.borderRadius = val;
      }
    }
    const inner = div.firstElementChild;
    if (inner) {
      const styleTarget = isInputBtn ? (inner.querySelector(".element-button") || inner) : inner;
      if (key === "borderRadius") {
        styleTarget.style.borderRadius = val;
      }
      if (key === "fontSize" || key === "fontWeight") {
        styleTarget.style[key] = val;
        const btnSpan = div.querySelector(".btn-text-content");
        if (btnSpan) {
          btnSpan.style[key] = val;
        }
      }
      applyElementStyles(styleTarget, data.style);
    }
  }
  if (typeof pushHistoryDebounced === "function") pushHistoryDebounced();
}

function updateSelectedElementImageSrc(val) {
  const data = elements.find((item) => item.id === selectedElementId);
  if (!data || data.type !== "image") return;

  data.imageSrc = val;
  const div = document.getElementById(selectedElementId);
  if (div) {
    const img = div.firstElementChild;
    if (img) img.src = val;
  }
}

function updateButtonDesignType(type) {
  const data = elements.find((item) => item.id === selectedElementId);
  if (!data || data.type !== "button") return;

  data.btnDesignType = type;

  document.querySelectorAll("#groupButton .button-design-card").forEach(card => {
    card.classList.toggle("active", card.getAttribute("data-btn-design") === type);
  });

  const inputGroup = document.getElementById("btnInputSettingsGroup");
  if (inputGroup) {
    inputGroup.classList.toggle("hidden", type !== "input_button");
  }

  if (type === "input_button") {
    if (!data.placeholderText) data.placeholderText = "Ketik pesan atau pertanyaan di sini...";
    if (!data.inputLayout) data.inputLayout = "stacked";
    if (!data.inputBg) data.inputBg = "#ffffff";
    if (!data.inputTextColor) data.inputTextColor = "#2c5d6b";
    if (!data.inputBorderColor) data.inputBorderColor = "#bddce7";
    if (data.placeholderText === undefined) data.placeholderText = "Ketik pesan atau pertanyaan di sini...";
    if (!data.inputLayout) data.inputLayout = "stacked";
    if (!data.style) data.style = {};
    if (!data.style.height || data.style.height === "auto") {
      data.style.height = "45px";
    }
    if (!data.style.backgroundColor && !data.style.background) {
      data.style.backgroundColor = "#38a0c4";
    }
    if (!data.style.color) {
      data.style.color = "#ffffff";
    }
    updateButtonInputColorTriggers(data);
  } else {
    if (!data.style.height || data.style.height === "auto" || parseInt(data.style.height) < 40) {
      data.style.height = "45px";
    }
    if (!data.style.backgroundColor && !data.style.background) {
      data.style.backgroundColor = "#38a0c4";
    }
    if (!data.style.color) {
      data.style.color = "#ffffff";
    }
  }

  renderCanvas();
  if (typeof pushHistory === "function") pushHistory();
}

function updateButtonInputConfig(key, value) {
  const data = elements.find((item) => item.id === selectedElementId);
  if (!data || data.type !== "button") return;

  data[key] = value;

  if (key === "inputBg" && document.getElementById("propBtnInputBgHex")) {
    document.getElementById("propBtnInputBgHex").innerText = value;
  }
  if (key === "inputTextColor" && document.getElementById("propBtnInputTextColorHex")) {
    document.getElementById("propBtnInputTextColorHex").innerText = value;
  }
  if (key === "inputBorderColor" && document.getElementById("propBtnInputBorderColorHex")) {
    document.getElementById("propBtnInputBorderColorHex").innerText = value;
  }

  renderCanvas();
  if (typeof pushHistory === "function") pushHistory();
}

window.updateButtonDesignType = updateButtonDesignType;
window.updateButtonInputConfig = updateButtonInputConfig;

function updateSelectedElementLinkType(type) {
  const data = elements.find((item) => item.id === selectedElementId);
  if (!data || data.type !== "button") return;

  data.btnLinkType = type;
  const urlInput = document.getElementById("propBtnUrl");
  const urlLabel = document.getElementById("propBtnUrlLabel");

  if (type === "whatsapp") {
    if (urlLabel) urlLabel.innerText = "Tautan WhatsApp (https://wa.me/...)";
    if (!data.url || (!data.url.includes("wa.me") && !data.url.includes("whatsapp.com"))) {
      data.url = "https://wa.me/";
    }
    if (urlInput) {
      urlInput.value = data.url;
      urlInput.placeholder = "https://wa.me/628123456789";
      urlInput.focus();
    }
  } else {
    // Kalo klik bukan whatsapp (link web/sosmed), kosongkan
    if (urlLabel) urlLabel.innerText = "Tautan Web / Sosmed (https://...)";
    if (data.url && (data.url.includes("wa.me") || data.url.includes("whatsapp.com"))) {
      data.url = "";
    }
    if (urlInput) {
      urlInput.value = data.url || "";
      urlInput.placeholder = "https://...";
      urlInput.focus();
    }
  }

  const div = document.getElementById(selectedElementId);
  if (div) {
    const a = div.querySelector("a.element-button") || div.firstElementChild;
    if (a && typeof isEditMode !== "undefined" && !isEditMode) {
      a.href = data.url || "#";
    }
  }
  if (typeof pushHistory === "function") pushHistory();
}

function updateSelectedElementLink(val) {
  const data = elements.find((item) => item.id === selectedElementId);
  if (!data || data.type !== "button") return;
  data.url = val;
  const div = document.getElementById(selectedElementId);
  if (div) {
    const a = div.querySelector("a.element-button") || div.firstElementChild;
    if (a && typeof isEditMode !== "undefined" && !isEditMode) {
      a.href = val || "#";
    }
  }
}

function uploadElementImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    updateSelectedElementImageSrc(e.target.result);
    const urlInput = document.getElementById("propImageUrl");
    if (urlInput) urlInput.value = "Image Base64 Data Loaded";
  };
  reader.readAsDataURL(file);
}

function toggleBorderColorGroup(style) {
  const group = document.getElementById("borderColorGroup");
  if (!group) return;
  if (style === "none") {
    group.classList.add("hidden");
  } else {
    group.classList.remove("hidden");
  }
}

let pendingDeleteElementId = null;

function requestDeleteElement(elementId) {
  if (!elementId) return;
  pendingDeleteElementId = elementId;
  const modal = document.getElementById("deleteElementModal");
  if (modal) {
    modal.classList.remove("hidden");
  } else {
    performDeleteElementById(elementId);
  }
}

function cancelDeleteElement() {
  pendingDeleteElementId = null;
  const modal = document.getElementById("deleteElementModal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

function confirmDeleteElement() {
  const modal = document.getElementById("deleteElementModal");
  if (modal) {
    modal.classList.add("hidden");
  }
  if (!pendingDeleteElementId) return;
  const targetId = pendingDeleteElementId;
  pendingDeleteElementId = null;
  performDeleteElementById(targetId);
  if (typeof showToast === "function") showToast("Komponen berhasil dihapus", "info");
}

function deleteSelectedElement() {
  if (!selectedElementId) return;
  requestDeleteElement(selectedElementId);
}

function updateBgStyle() {
  const bgTypeSelect = document.getElementById("bgType");
  if (!bgTypeSelect) return;
  const type = bgTypeSelect.value;
  const solidGroup = document.getElementById("solidBgGroup");
  const imageGroup = document.getElementById("imageBgGroup");

  let bgOverlay = document.getElementById("canvasBgImageOverlay");
  if (bgOverlay) {
    bgOverlay.style.display = "none";
  }

  if (type === "color") {
    if (solidGroup) solidGroup.classList.remove("hidden");
    if (imageGroup) imageGroup.classList.add("hidden");
    canvas.style.backgroundImage = "none";

    if (!window.pageBgFillData) {
      let initColor = "#f2f7f9";
      if (canvas && canvas.style.background) {
        initColor = rgbToHex(canvas.style.background) || "#f2f7f9";
      }
      window.pageBgFillData = {
        enabled: true,
        type: "solid",
        color: initColor,
        opacity: 100
      };
    }
    window.pageBgFillData.type = "solid";
    const fd = window.pageBgFillData;
    const rgba = hexToRgba(fd.color || "#f2f7f9", (fd.opacity !== undefined ? fd.opacity : 100) / 100);
    canvas.style.background = rgba;
    updatePageBgColorTrigger();
  } else if (type === "image") {
    if (solidGroup) solidGroup.classList.add("hidden");
    if (imageGroup) imageGroup.classList.remove("hidden");
    const opacity = window.bgImageOpacity !== undefined ? window.bgImageOpacity : 1.0;
    if (window.bgImageSrc) {
      canvas.style.backgroundImage = `linear-gradient(rgba(242, 247, 249, ${1 - opacity}), rgba(242, 247, 249, ${1 - opacity})), url(${window.bgImageSrc})`;
      canvas.style.backgroundSize = "cover";
      canvas.style.backgroundPosition = "center";
      canvas.style.backgroundRepeat = "no-repeat";
    } else {
      canvas.style.backgroundImage = "none";
      canvas.style.background = "#f2f7f9";
    }
  }
}

function setPresetGradient(grad) {
  canvas.style.background = grad;
  if (typeof pushHistory === "function") pushHistory();
}

function rgbToHex(rgb) {
  if (!rgb) return "#ffffff";
  if (rgb.startsWith("#")) return rgb;

  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (!match) return "#ffffff";

  const r = parseInt(match[1]).toString(16).padStart(2, "0");
  const g = parseInt(match[2]).toString(16).padStart(2, "0");
  const b = parseInt(match[3]).toString(16).padStart(2, "0");

  return `#${r}${g}${b}`;
}

function updateSelectedElementTopPx(val) {
  const data = elements.find(item => item.id === selectedElementId);
  if (!data || data.parentId) return;

  const px = parseInt(val);
  if (isNaN(px)) return;

  data.style.top = `${px}px`;

  const div = document.getElementById(selectedElementId);
  if (div) div.style.top = data.style.top;

  if (typeof adjustCanvasHeight === "function") adjustCanvasHeight();
}

function updateSelectedElementGapBottom(val) {
  const data = elements.find(item => item.id === selectedElementId);
  if (!data) return;
  const numVal = parseInt(val) || 0;
  data.style.gapBottom = `${numVal}px`;
  data.style.marginBottom = `${numVal}px`;

  const div = document.getElementById(selectedElementId);
  if (div) {
    div.style.marginBottom = `${numVal}px`;
  }

  if (typeof adjustCanvasHeight === "function") adjustCanvasHeight();
  if (typeof pushHistoryDebounced === "function") pushHistoryDebounced();
}

function snapElementBelowPrevious() {
  const data = elements.find(item => item.id === selectedElementId);
  if (!data || data.parentId) return;

  const canvasH = canvas.scrollHeight || canvas.offsetHeight;
  const canvasRect = canvas.getBoundingClientRect();
  const scrollTop = getCanvasScrollable().scrollTop || 0;

  let currentTopPx = 0;
  if (data.style.top && data.style.top.includes('%')) {
    const currentTopPct = parseFloat(data.style.top) || 0;
    currentTopPx = (currentTopPct / 100) * canvasH;
  } else {
    currentTopPx = parseFloat(data.style.top) || 0;
  }

  let closestBottom = null;
  let closestDist = Infinity;

  elements.forEach(item => {
    if (item.id === data.id || item.parentId) return;
    const el = document.getElementById(item.id);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const bottomPx = r.bottom - canvasRect.top + scrollTop;
    const dist = currentTopPx - bottomPx;
    if (dist >= -4 && dist < closestDist) {
      closestDist = dist;
      closestBottom = bottomPx;
    }
  });

  if (closestBottom === null) {
    closestBottom = 0;
  }

  const gapBottom = parseInt(data.style.gapBottom) || 0;
  const newTopPx = closestBottom + gapBottom;

  data.style.top = `${newTopPx}px`;
  const div = document.getElementById(selectedElementId);
  if (div) div.style.top = data.style.top;

  const topPxInput = document.getElementById("propTopPx");
  if (topPxInput) topPxInput.value = Math.round(newTopPx);

  if (typeof showSnapGuide === "function") showSnapGuide(closestBottom);
  if (typeof hideSnapGuide === "function") setTimeout(hideSnapGuide, 600);
  if (typeof adjustCanvasHeight === "function") adjustCanvasHeight();
  if (typeof pushHistory === "function") pushHistory();
}

function updateSelectedElementAlignment(val) {
  const data = elements.find(item => item.id === selectedElementId);
  if (!data) return;

  data.alignmentPreset = val;

  let flexVal = "stretch";
  if (val === "left") flexVal = "flex-start";
  else if (val === "center") flexVal = "center";
  else if (val === "right") flexVal = "flex-end";
  else if (val === "stretch") flexVal = "stretch";

  data.style.alignSelf = flexVal;
  data.style.textAlign = val === "stretch" ? "left" : val;

  if (["column", "container", "shape", "row"].includes(data.type)) {
    data.style.alignItems = flexVal;
  }

  const div = document.getElementById(selectedElementId);
  if (div) {
    div.style.alignSelf = flexVal;
    div.style.textAlign = val === "stretch" ? "left" : val;
    if (["column", "container", "shape", "row"].includes(data.type)) {
      div.style.alignItems = flexVal;
    }
  }

  renderCanvas();
  if (typeof pushHistory === "function") pushHistory();
}

// FIGMA-LIKE FILL & STROKE ENGINE
let currentFillData = null;
let currentStrokeData = null;

function hexToRgba(hex, alpha) {
  alpha = (alpha !== undefined) ? Math.max(0, Math.min(1, parseFloat(alpha))) : 1;
  if (!hex || typeof hex !== 'string') return `rgba(255,255,255,${alpha})`;

  if (hex.startsWith('rgb')) {
    const m = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (m) {
      const a = (alpha !== undefined) ? alpha : (m[4] !== undefined ? parseFloat(m[4]) : 1);
      return `rgba(${m[1]},${m[2]},${m[3]},${a})`;
    }
  }

  let clean = hex.startsWith('#') ? hex.slice(1) : hex;
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }

  if (clean.length < 6) return `rgba(255,255,255,${alpha})`;

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(255,255,255,${alpha})`;
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

function getDefaultFillData(existingStyle, elementType) {
  if (elementType === 'title' || elementType === 'text') {
    const textColor = (existingStyle && rgbToHex(existingStyle.color)) || '#2c5d6b';
    const validColor = textColor || '#2c5d6b';
    let type = 'solid';
    if (existingStyle && existingStyle.backgroundClip === 'text' && existingStyle.background && existingStyle.background.includes('gradient')) {
      type = existingStyle.background.includes('radial') ? 'radial' : 'linear';
    }
    return {
      enabled: true, type,
      color: validColor, opacity: 100,
      gradient: {
        angle: 135,
        stops: [
          { position: 0, color: validColor, opacity: 100 },
          { position: 100, color: '#e040fb', opacity: 100 }
        ]
      }
    };
  }

  let color = '#38a0c4';
  let opacity = 100;
  let type = 'solid';
  let gradientStops = [
    { position: 0, color: '#38a0c4', opacity: 100 },
    { position: 100, color: '#8d98e0', opacity: 100 }
  ];
  let gradientAngle = 135;

  if (existingStyle) {
    if (existingStyle.backgroundColor && existingStyle.backgroundColor !== 'transparent') {
      const h = rgbToHex(existingStyle.backgroundColor);
      if (h) color = h;
      const m = (existingStyle.backgroundColor + '').match(/rgba?\([\d,.\s]+,\s*([\d.]+)\)/);
      if (m) opacity = Math.round(parseFloat(m[1]) * 100);
    } else if (existingStyle.background && !existingStyle.background.includes('gradient') && existingStyle.background !== 'transparent') {
      const h = rgbToHex(existingStyle.background);
      if (h) color = h;
    }

    if (existingStyle.background && existingStyle.background.includes('gradient')) {
      type = existingStyle.background.includes('radial') ? 'radial' : 'linear';
      const angleMatch = existingStyle.background.match(/(\d+)deg/);
      if (angleMatch) gradientAngle = parseInt(angleMatch[1]) || 135;

      const stopsMatch = existingStyle.background.match(/(#[0-9a-fA-F]{3,6}|rgba?\([\d,.\s]+\))\s*(\d+)?%/g);
      if (stopsMatch && stopsMatch.length >= 2) {
        gradientStops = stopsMatch.map((s, idx) => {
          const parts = s.trim().split(/\s+/);
          const c = rgbToHex(parts[0]);
          let pos = parts[1] ? parseInt(parts[1]) : (idx === 0 ? 0 : 100);
          let op = 100;
          const m = parts[0].match(/rgba?\([\d,.\s]+,\s*([\d.]+)\)/);
          if (m) op = Math.round(parseFloat(m[1]) * 100);
          return { position: isNaN(pos) ? (idx * 50) : pos, color: c, opacity: op };
        });
      } else {
        gradientStops[0].color = color;
      }
    } else {
      gradientStops[0].color = color;
    }
  }

  return {
    enabled: true,
    type,
    color,
    opacity,
    gradient: {
      angle: gradientAngle,
      stops: gradientStops
    }
  };
}

function getDefaultStrokeData(existingStyle, elementType) {
  const noStrokeTypes = ['title', 'text', 'image', 'carousel', 'media_embed', 'genui_chatbot', 'box-interaktif', 'box_interaktif'];
  if (noStrokeTypes.includes(elementType)) {
    return {
      enabled: false,
      type: 'solid',
      color: '#38a0c4',
      opacity: 100,
      width: 1,
      style: 'solid',
      gradient: {
        angle: 135,
        stops: [
          { position: 0, color: '#38a0c4', opacity: 100 },
          { position: 100, color: '#ffffff', opacity: 100 }
        ]
      }
    };
  }
  const hasBorder = existingStyle && (
    (existingStyle.borderStyle && existingStyle.borderStyle !== 'none') ||
    (existingStyle.border && existingStyle.border !== 'none') ||
    (existingStyle.borderImage && existingStyle.borderImage !== 'none')
  );

  let st = 'solid';
  if (existingStyle && existingStyle.strokeStyle) {
    st = existingStyle.strokeStyle;
  } else if (existingStyle && existingStyle.borderStyle && existingStyle.borderStyle !== 'none') {
    st = existingStyle.borderStyle;
  }

  let strokeType = 'solid';
  let gradientAngle = 135;
  let color = (existingStyle && rgbToHex(existingStyle.borderColor)) || '#38a0c4';
  let gradientStops = [
    { position: 0, color: color, opacity: 100 },
    { position: 100, color: '#ffffff', opacity: 100 }
  ];

  if (existingStyle && existingStyle.borderImage && existingStyle.borderImage.includes('gradient')) {
    strokeType = existingStyle.borderImage.includes('radial') ? 'radial' : 'linear';
  }

  return {
    enabled: !!hasBorder,
    type: strokeType,
    color: color,
    opacity: 100,
    width: (existingStyle && parseInt(existingStyle.borderWidth)) || 1,
    style: st,
    gradient: {
      angle: gradientAngle,
      stops: gradientStops
    }
  };
}

function loadFillStrokePanel(data) {
  closeFillPopover();
  closeStrokePopover();

  if (!data.fillData) {
    data.fillData = getDefaultFillData(data.style, data.type);
  } else {
    const div = document.getElementById(data.id);
    const bg = data.style?.background || (div ? div.style.background : '');
    const bgCol = data.style?.backgroundColor || (div ? div.style.backgroundColor : '');
    const textCol = data.style?.color || (div ? div.style.color : '');

    if (['title', 'text'].includes(data.type)) {
      if (textCol && data.fillData.type === 'solid') {
        const hex = rgbToHex(textCol);
        if (hex) data.fillData.color = hex;
      }
    } else {
      if (bg && bg.includes('gradient')) {
        data.fillData.type = bg.includes('radial') ? 'radial' : 'linear';
      } else if (bgCol && bgCol !== 'transparent') {
        const hex = rgbToHex(bgCol);
        if (hex) data.fillData.color = hex;
      }
    }
  }

  if (!data.strokeData) {
    data.strokeData = getDefaultStrokeData(data.style, data.type);
  } else {
    if (!data.strokeData.type) data.strokeData.type = 'solid';
    if (!data.strokeData.gradient) {
      data.strokeData.gradient = {
        angle: 135,
        stops: [
          { position: 0, color: data.strokeData.color || '#38a0c4', opacity: 100 },
          { position: 100, color: '#ffffff', opacity: 100 }
        ]
      };
    }
    const div = document.getElementById(data.id);
    const borderImg = data.style?.borderImage || (div ? div.style.borderImage : '');
    const borderCol = data.style?.borderColor || (div ? div.style.borderColor : '');
    if (borderImg && borderImg.includes('gradient')) {
      data.strokeData.type = borderImg.includes('radial') ? 'radial' : 'linear';
    } else if (borderCol && borderCol !== 'transparent') {
      const hex = rgbToHex(borderCol);
      if (hex) data.strokeData.color = hex;
    }
  }

  const noStrokeTypes = ['title', 'text', 'image', 'carousel', 'media_embed', 'genui_chatbot', 'box-interaktif', 'box_interaktif'];
  if (noStrokeTypes.includes(data.type)) {
    if (data.strokeData) data.strokeData.enabled = false;
  }

  currentFillData = data.fillData;
  currentStrokeData = data.strokeData;

  const hint = document.getElementById('fillContextHint');
  if (hint) {
    if (data.type === 'title' || data.type === 'text') {
      hint.textContent = 'Untuk teks: Solid = warna teks, Linear/Radial = gradient teks';
      hint.classList.remove('hidden');
    } else {
      hint.classList.add('hidden');
    }
  }

  const noFillTypes = ['image', 'media_embed'];
  const fillSec = document.getElementById('fillCardSection');
  if (fillSec) {
    if (noFillTypes.includes(data.type)) {
      fillSec.classList.add('hidden');
    } else {
      fillSec.classList.remove('hidden');
    }
  }

  const strokeSec = document.getElementById('strokeCardSection');
  if (strokeSec) {
    if (noStrokeTypes.includes(data.type)) {
      strokeSec.classList.add('hidden');
    } else {
      strokeSec.classList.remove('hidden');
    }
  }

  renderFillPanel();
  renderStrokePanel();
  if (['title', 'text'].includes(data.type)) {
    renderTextColorPanel();
  }
}

function buildGradientCss(fd) {
  const g = fd.gradient;
  if (!g || !g.stops || g.stops.length < 2) return 'transparent';
  const sorted = [...g.stops].sort((a, b) => a.position - b.position);
  const stopsCss = sorted.map(s => `${hexToRgba(s.color, s.opacity / 100)} ${s.position}%`).join(', ');
  if (fd.type === 'radial') return `radial-gradient(circle, ${stopsCss})`;
  return `linear-gradient(${g.angle || 135}deg, ${stopsCss})`;
}

function buildStrokeSvgContent(divId, sd, radius) {
  const w = Math.max(1, sd.width || 1);
  const r = Math.max(0, parseInt(radius) || 0);
  const isRadial = sd.type === 'radial';
  const gradId = `strokeGrad_${(divId || 'el').replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  const sortedStops = [...(sd.gradient?.stops || [
    { position: 0, color: '#38a0c4', opacity: 100 },
    { position: 100, color: '#ffffff', opacity: 100 }
  ])].sort((a, b) => a.position - b.position);

  const stopsHtml = sortedStops.map(s => {
    const col = s.color || '#38a0c4';
    const op = (s.opacity !== undefined ? s.opacity : 100) / 100;
    return `<stop offset="${s.position}%" stop-color="${col}" stop-opacity="${op}" />`;
  }).join('');

  let gradDef = '';
  if (isRadial) {
    gradDef = `<radialGradient id="${gradId}" cx="50%" cy="50%" r="50%">${stopsHtml}</radialGradient>`;
  } else {
    const angle = sd.gradient?.angle !== undefined ? sd.gradient.angle : 135;
    const rad = ((angle - 90) * Math.PI) / 180;
    const x1 = (50 - 50 * Math.cos(rad)).toFixed(2) + '%';
    const y1 = (50 - 50 * Math.sin(rad)).toFixed(2) + '%';
    const x2 = (50 + 50 * Math.cos(rad)).toFixed(2) + '%';
    const y2 = (50 + 50 * Math.sin(rad)).toFixed(2) + '%';
    gradDef = `<linearGradient id="${gradId}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stopsHtml}</linearGradient>`;
  }

  let dash = '';
  if (sd.style === 'dashed') dash = `stroke-dasharray="${w * 3} ${w * 2}"`;
  else if (sd.style === 'dotted') dash = `stroke-dasharray="${w} ${w * 1.5}"`;

  return `<defs>${gradDef}</defs><rect x="${w / 2}" y="${w / 2}" style="width: calc(100% - ${w}px); height: calc(100% - ${w}px);" rx="${r}" ry="${r}" fill="none" stroke="url(#${gradId})" stroke-width="${w}" ${dash} />`;
}
window.buildStrokeSvgContent = buildStrokeSvgContent;

function applyFillStroke() {
  if (activeFillTarget && activeFillTarget.key === 'pageBgFillData') {
    currentFillData.type = 'solid';
    window.pageBgFillData = currentFillData;
    const rgba = hexToRgba(currentFillData.color || '#f2f7f9', (currentFillData.opacity !== undefined ? currentFillData.opacity : 100) / 100);
    canvas.style.background = rgba;
    canvas.style.backgroundImage = 'none';
    updatePageBgColorTrigger();
    if (typeof pushHistory === 'function') pushHistory();
    return;
  }

  const data = elements.find(item => item.id === selectedElementId);
  if (!data) return;

  if (activeFillTarget && activeFillTarget.key && activeFillTarget.key !== 'fillData') {
    data[activeFillTarget.key] = currentFillData;
    if (data.type === 'carousel') {
      renderCanvas();
      updateCarouselColorTriggers(data);
    } else if (data.type === 'button') {
      if (activeFillTarget.key === 'btnTextFillData') {
        if (currentFillData.type === 'solid' || !currentFillData.type) {
          const rgba = hexToRgba(currentFillData.color || '#ffffff', (currentFillData.opacity !== undefined ? currentFillData.opacity : 100) / 100);
          data.style.color = rgba;
        }
        updateBtnTextColorTrigger(data);
      } else if (activeFillTarget.key === 'btnInputBgData') {
        const rgba = hexToRgba(currentFillData.color || '#ffffff', (currentFillData.opacity !== undefined ? currentFillData.opacity : 100) / 100);
        data.inputBg = rgba;
        updateButtonInputColorTriggers(data);
      } else if (activeFillTarget.key === 'btnInputTextColorData') {
        const rgba = hexToRgba(currentFillData.color || '#2c5d6b', (currentFillData.opacity !== undefined ? currentFillData.opacity : 100) / 100);
        data.inputTextColor = rgba;
        updateButtonInputColorTriggers(data);
      } else if (activeFillTarget.key === 'btnInputBorderColorData') {
        const rgba = hexToRgba(currentFillData.color || '#bddce7', (currentFillData.opacity !== undefined ? currentFillData.opacity : 100) / 100);
        data.inputBorderColor = rgba;
        updateButtonInputColorTriggers(data);
      }
      renderCanvas();
    } else if (data.type === 'media_embed') {
      renderCanvas();
      updateMediaEmbedColorTriggers(data);
    } else if (data.type === 'title') {
      renderCanvas();
      updateTitleColorTriggers(data);
    } else if (typeof isBoxInteraktifType === 'function' && isBoxInteraktifType(data.type)) {
      if (!data.boxConfig) data.boxConfig = {};
      data.boxConfig[activeFillTarget.key] = currentFillData;
      if (activeFillTarget.key === 'boxBgData') {
        data.boxConfig.bgColor = currentFillData.type === 'solid' ? hexToRgba(currentFillData.color, (currentFillData.opacity !== undefined ? currentFillData.opacity : 100) / 100) : (typeof buildGradientCss === 'function' ? buildGradientCss(currentFillData) : currentFillData.color);
      } else if (activeFillTarget.key === 'boxItemBgData') {
        data.boxConfig.itemBgColor = hexToRgba(currentFillData.color, (currentFillData.opacity !== undefined ? currentFillData.opacity : 100) / 100);
      } else if (activeFillTarget.key === 'boxHeaderColorData') {
        data.boxConfig.headerColor = hexToRgba(currentFillData.color, (currentFillData.opacity !== undefined ? currentFillData.opacity : 100) / 100);
      } else if (activeFillTarget.key === 'boxAccentColorData') {
        data.boxConfig.accentColor = hexToRgba(currentFillData.color, (currentFillData.opacity !== undefined ? currentFillData.opacity : 100) / 100);
      }
      renderCanvas();
      updateBoxInteractiveColorTriggers(data);
    } else if (data.type === 'genui_chatbot') {
      if (!data.chatbotConfig) data.chatbotConfig = {};
      data.chatbotConfig[activeFillTarget.key] = currentFillData;

      const toCss = (fd, def) => {
        if (!fd) return def;
        if (fd.type === 'solid' || !fd.type) {
          return hexToRgba(fd.color || def, (fd.opacity !== undefined ? fd.opacity : 100) / 100);
        }
        return typeof buildGradientCss === 'function' ? buildGradientCss(fd) : (fd.color || def);
      };

      const toSolidRgba = (fd, def) => {
        if (!fd) return def;
        return hexToRgba(fd.color || def, (fd.opacity !== undefined ? fd.opacity : 100) / 100);
      };

      if (activeFillTarget.key === 'chatChipBgData') {
        data.chatbotConfig.chipBg = toSolidRgba(currentFillData, '#ffffff');
      } else if (activeFillTarget.key === 'chatChipTextColorData') {
        data.chatbotConfig.chipTextColor = toSolidRgba(currentFillData, '#0F4C75');
      } else if (activeFillTarget.key === 'chatChipBorderColorData') {
        data.chatbotConfig.chipBorderColor = toSolidRgba(currentFillData, '#bddce7');
      } else if (activeFillTarget.key === 'chatHeaderTextColorData') {
        data.chatbotConfig.headerTextColor = toSolidRgba(currentFillData, '#ffffff');
      } else if (activeFillTarget.key === 'chatBotTextColorData') {
        data.chatbotConfig.botTextColor = toSolidRgba(currentFillData, '#ffffff');
      } else if (activeFillTarget.key === 'chatUserTextColorData') {
        data.chatbotConfig.userTextColor = toSolidRgba(currentFillData, '#ffffff');
      } else if (activeFillTarget.key === 'chatInputBgData') {
        data.chatbotConfig.inputBg = toSolidRgba(currentFillData, '#ffffff');
      } else if (activeFillTarget.key === 'chatInputBorderColorData') {
        data.chatbotConfig.inputBorderColor = toSolidRgba(currentFillData, '#bddce7');
      } else if (activeFillTarget.key === 'chatInputTextColorData') {
        data.chatbotConfig.inputTextColor = toSolidRgba(currentFillData, '#2c5d6b');
      } else if (activeFillTarget.key === 'chatSendBtnTextColorData') {
        data.chatbotConfig.sendBtnTextColor = toSolidRgba(currentFillData, '#ffffff');
      } else if (activeFillTarget.key === 'chatHeaderBgData') {
        data.chatbotConfig.headerBg = toCss(currentFillData, '#38a0c4');
      } else if (activeFillTarget.key === 'chatCardBgData') {
        data.chatbotConfig.cardBg = toCss(currentFillData, '#fafcfd');
      } else if (activeFillTarget.key === 'chatInputContainerBgData') {
        data.chatbotConfig.inputContainerBg = toCss(currentFillData, 'transparent');
      } else if (activeFillTarget.key === 'chatBotBgData') {
        data.chatbotConfig.botBg = toCss(currentFillData, '#38a0c4');
      } else if (activeFillTarget.key === 'chatUserBgData') {
        data.chatbotConfig.userBg = toCss(currentFillData, '#0F4C75');
      } else if (activeFillTarget.key === 'chatScrollbarColorData') {
        data.chatbotConfig.scrollbarColor = toSolidRgba(currentFillData, '#bddce7');
      } else if (activeFillTarget.key === 'chatSendBtnBgData') {
        data.chatbotConfig.sendBtnBg = toCss(currentFillData, '#38a0c4');
      }

      renderCanvas();
      updateChatbotColorTriggers(data);
    }
    if (typeof pushHistory === 'function') pushHistory();
    return;
  }

  if (!data.fillData || !data.strokeData) return;
  const fd = data.fillData;
  const sd = data.strokeData;
  const div = document.getElementById(selectedElementId);
  if (!div) return;

  const isTextEl = ['title', 'text'].includes(data.type);
  const inner = div.firstElementChild;

  if (isTextEl) {
    const clearGradText = (el) => {
      el.style.background = '';
      el.style.backgroundClip = '';
      el.style.webkitBackgroundClip = '';
      el.style.webkitTextFillColor = '';
    };
    if (!fd.enabled) {
      data.style.color = 'transparent';
      delete data.style.background;
      delete data.style.backgroundClip;
      delete data.style.webkitBackgroundClip;
      delete data.style.webkitTextFillColor;
      if (inner) {
        inner.style.color = 'transparent';
        clearGradText(inner);
      }
    } else if (fd.type === 'solid') {
      const rgba = hexToRgba(fd.color, fd.opacity / 100);
      data.style.color = rgba;
      delete data.style.background;
      delete data.style.backgroundClip;
      delete data.style.webkitBackgroundClip;
      delete data.style.webkitTextFillColor;
      if (inner) {
        clearGradText(inner);
        inner.style.color = rgba;
      }
    } else {
      const gradCss = buildGradientCss(fd);
      data.style.background = gradCss;
      data.style.backgroundClip = 'text';
      data.style.webkitBackgroundClip = 'text';
      data.style.webkitTextFillColor = 'transparent';
      delete data.style.color;
      if (inner) {
        inner.style.background = gradCss;
        inner.style.backgroundClip = 'text';
        inner.style.webkitBackgroundClip = 'text';
        inner.style.webkitTextFillColor = 'transparent';
        inner.style.color = 'transparent';
      }
    }
  } else if (data.type === 'image') {
    const opacityVal = fd.opacity / 100;
    if (inner) {
      inner.style.opacity = opacityVal;
      if (!fd.enabled) {
        inner.style.background = '';
        inner.style.backgroundColor = 'transparent';
      } else {
        if (fd.type === 'solid') {
          const rgba = hexToRgba(fd.color, 1);
          inner.style.background = '';
          inner.style.backgroundColor = rgba;
        } else {
          const gradCss = buildGradientCss(fd);
          inner.style.backgroundColor = '';
          inner.style.background = gradCss;
        }
      }
    }
    data.style.opacity = opacityVal;
    if (!fd.enabled) {
      data.style.backgroundColor = 'transparent';
      delete data.style.background;
    } else {
      if (fd.type === 'solid') {
        data.style.backgroundColor = hexToRgba(fd.color, 1);
        delete data.style.background;
      } else {
        data.style.background = buildGradientCss(fd);
        delete data.style.backgroundColor;
      }
    }
  } else if (data.type === 'button' && data.btnDesignType === 'input_button') {
    div.style.backgroundColor = 'transparent';
    div.style.background = 'transparent';
    div.style.border = 'none';
    const targetBtn = inner ? inner.querySelector(".element-button") : null;
    if (!fd.enabled) {
      data.style.backgroundColor = 'transparent';
      delete data.style.background;
      if (targetBtn) {
        targetBtn.style.background = 'transparent';
        targetBtn.style.backgroundColor = 'transparent';
      }
    } else if (fd.type === 'solid') {
      const rgba = hexToRgba(fd.color, fd.opacity / 100);
      data.style.backgroundColor = rgba;
      delete data.style.background;
      if (targetBtn) {
        targetBtn.style.background = rgba;
        targetBtn.style.backgroundColor = rgba;
      }
    } else {
      const gradCss = buildGradientCss(fd);
      data.style.background = gradCss;
      delete data.style.backgroundColor;
      if (targetBtn) {
        targetBtn.style.background = gradCss;
      }
    }
  } else {
    if (!fd.enabled) {
      div.style.backgroundColor = 'transparent';
      div.style.background = '';
      data.style.backgroundColor = 'transparent';
      delete data.style.background;
      if (inner) {
        inner.style.background = '';
        inner.style.backgroundColor = 'transparent';
      }
    } else if (fd.type === 'solid') {
      const rgba = hexToRgba(fd.color, fd.opacity / 100);
      div.style.background = '';
      div.style.backgroundColor = rgba;
      data.style.backgroundColor = rgba;
      delete data.style.background;
      if (inner) {
        inner.style.background = '';
        inner.style.backgroundColor = 'transparent';
      }
    } else {
      const gradCss = buildGradientCss(fd);
      div.style.backgroundColor = '';
      div.style.background = gradCss;
      data.style.background = gradCss;
      delete data.style.backgroundColor;
      if (inner) {
        inner.style.backgroundColor = '';
        inner.style.background = 'transparent';
      }
    }
  }

  if (data.style && data.style.clipPath) {
    div.style.clipPath = data.style.clipPath;
    div.style.webkitClipPath = data.style.clipPath;
  }

  div.style.border = 'none';
  div.style.outline = 'none';
  div.style.outlineOffset = '0px';
  div.style.borderImage = 'none';
  div.style.borderImageSlice = '';
  div.style.backgroundClip = '';
  div.style.backgroundOrigin = '';
  div.style.webkitMask = '';
  div.style.mask = '';
  delete data.style.border;
  delete data.style.outline;
  delete data.style.outlineOffset;
  delete data.style.borderImage;
  delete data.style.borderImageSlice;
  delete data.style.backgroundClip;
  delete data.style.backgroundOrigin;
  delete data.style.webkitMask;
  delete data.style.mask;
  delete data.style.strokePosition;
  data.style.borderStyle = 'none';
  delete data.style.borderColor;
  delete data.style.borderWidth;

  let strokeSvg = div.querySelector(':scope > .builder-stroke-svg');

  const noStrokeTypes = ['title', 'text', 'image', 'carousel', 'media_embed', 'genui_chatbot', 'box-interaktif', 'box_interaktif'];
  if (noStrokeTypes.includes(data.type)) {
    sd.enabled = false;
  }

  if (data.type === 'button' && data.btnDesignType === 'input_button') {
    const targetBtn = inner ? inner.querySelector(".element-button") : null;
    div.style.border = 'none';
    if (strokeSvg) strokeSvg.remove();
    if (targetBtn) {
      let btnStrokeSvg = targetBtn.querySelector(':scope > .builder-stroke-svg');
      if (sd.enabled) {
        const w = Math.max(1, sd.width || 1);
        const borderStyle = sd.style || 'solid';
        const isSolid = !sd.type || sd.type === 'solid';
        if (isSolid) {
          if (btnStrokeSvg) btnStrokeSvg.remove();
          const sRgba = hexToRgba(sd.color, (sd.opacity !== undefined ? sd.opacity : 100) / 100);
          targetBtn.style.border = `${w}px ${borderStyle} ${sRgba}`;
          data.style.border = `${w}px ${borderStyle} ${sRgba}`;
          data.style.borderStyle = borderStyle;
          data.style.borderColor = sRgba;
          data.style.borderWidth = `${w}px`;
          delete data.style.strokeGradient;
        } else {
          targetBtn.style.border = 'none';
          targetBtn.style.position = 'relative';
          if (!btnStrokeSvg) {
            btnStrokeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            btnStrokeSvg.setAttribute('class', 'builder-stroke-svg');
            btnStrokeSvg.style.position = 'absolute';
            btnStrokeSvg.style.top = '0';
            btnStrokeSvg.style.left = '0';
            btnStrokeSvg.style.width = '100%';
            btnStrokeSvg.style.height = '100%';
            btnStrokeSvg.style.pointerEvents = 'none';
            btnStrokeSvg.style.overflow = 'visible';
            btnStrokeSvg.style.zIndex = '2';
            targetBtn.appendChild(btnStrokeSvg);
          }
          btnStrokeSvg.innerHTML = buildStrokeSvgContent(`${div.id}_btn`, sd, data.style.borderRadius);
          data.style.borderWidth = `${w}px`;
          data.style.borderStyle = borderStyle;
          data.style.strokeGradient = buildGradientCss(sd);
        }
      } else {
        targetBtn.style.border = 'none';
        delete data.style.border;
        delete data.style.borderWidth;
        delete data.style.borderStyle;
        delete data.style.borderColor;
        delete data.style.strokeGradient;
        if (btnStrokeSvg) btnStrokeSvg.remove();
      }
    }
  } else if (sd.enabled) {
    const w = Math.max(1, sd.width || 1);
    const borderStyle = sd.style || 'solid';
    const isSolid = !sd.type || sd.type === 'solid';

    sd.style = borderStyle;
    data.style.strokeStyle = borderStyle;

    if (isSolid) {
      if (strokeSvg) strokeSvg.remove();
      const sRgba = hexToRgba(sd.color, (sd.opacity !== undefined ? sd.opacity : 100) / 100);
      div.style.border = `${w}px ${borderStyle} ${sRgba}`;

      data.style.border = `${w}px ${borderStyle} ${sRgba}`;
      data.style.borderStyle = borderStyle;
      data.style.borderColor = sRgba;
      data.style.borderWidth = `${w}px`;
      delete data.style.strokeGradient;
    } else {
      // SVG Gradient Stroke: 100% transparent inside (fill=none), aligned exactly to element outer boundary
      div.style.border = 'none';
      if (!strokeSvg) {
        strokeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        strokeSvg.setAttribute('class', 'builder-stroke-svg');
        strokeSvg.style.position = 'absolute';
        strokeSvg.style.top = '0';
        strokeSvg.style.left = '0';
        strokeSvg.style.width = '100%';
        strokeSvg.style.height = '100%';
        strokeSvg.style.pointerEvents = 'none';
        strokeSvg.style.overflow = 'visible';
        strokeSvg.style.zIndex = '2';
        div.appendChild(strokeSvg);
      }
      strokeSvg.innerHTML = buildStrokeSvgContent(div.id, sd, data.style.borderRadius);

      data.style.border = 'none';
      data.style.borderWidth = `${w}px`;
      data.style.borderStyle = borderStyle;
      delete data.style.borderColor;
      data.style.strokeGradient = buildGradientCss(sd);
    }
  } else {
    if (strokeSvg) strokeSvg.remove();
    div.style.border = 'none';
    delete data.style.border;
    delete data.style.borderWidth;
    delete data.style.borderStyle;
    delete data.style.borderColor;
    delete data.style.strokeGradient;
  }
  updateFillTriggerSummary();
  updateStrokeTriggerSummary();
  updateTextColorTriggerSummary();
  if (typeof pushHistoryDebounced === "function") pushHistoryDebounced();
}

function updateTextColorTriggerSummary() {
  const data = elements.find(i => i.id === selectedElementId);
  const fd = (data && data.fillData) ? data.fillData : currentFillData;
  if (!fd) return;

  const swatch = document.getElementById('textColorTriggerSwatch');
  const hexLabel = document.getElementById('textColorTriggerHex');
  const opacityLabel = document.getElementById('textColorTriggerOpacity');
  if (!swatch) return;

  const isSolid = !fd.type || fd.type === 'solid';

  if (isSolid) {
    const color = fd.color || '#2c5d6b';
    const op = (fd.opacity !== undefined ? fd.opacity : 100) / 100;
    const rgba = hexToRgba(color, op);

    swatch.style.background = rgba;
    swatch.style.backgroundColor = rgba;

    if (hexLabel) hexLabel.innerText = color.startsWith('#') ? color.toUpperCase() : '#' + color.toUpperCase();
    if (opacityLabel) opacityLabel.innerText = `${fd.opacity !== undefined ? fd.opacity : 100}%`;
  } else {
    const gradCss = buildGradientCss(fd);
    swatch.style.background = gradCss;
    const angleText = fd.type === 'linear' ? ` ${fd.gradient?.angle || 135}°` : '';
    if (hexLabel) hexLabel.innerText = fd.type === 'linear' ? `Linear${angleText}` : 'Radial';
    if (opacityLabel) opacityLabel.innerText = `${fd.opacity !== undefined ? fd.opacity : 100}%`;
  }
}

let activeFillTarget = null;

function updateTriggerSummaryFor(swatchId, hexId, opacityId, fd) {
  const swatch = document.getElementById(swatchId);
  const hexLabel = document.getElementById(hexId);
  const opacityLabel = document.getElementById(opacityId);
  if (!swatch || !fd) return;

  const isSolid = !fd.type || fd.type === 'solid';

  if (isSolid) {
    const color = fd.color || '#ffffff';
    const op = (fd.opacity !== undefined ? fd.opacity : 100) / 100;
    const rgba = hexToRgba(color, op);

    swatch.style.background = rgba;
    swatch.style.backgroundColor = rgba;

    if (hexLabel) hexLabel.innerText = color.startsWith('#') ? color.toUpperCase() : '#' + color.toUpperCase();
    if (opacityLabel) opacityLabel.innerText = `${fd.opacity !== undefined ? fd.opacity : 100}%`;
  } else {
    const gradCss = buildGradientCss(fd);
    swatch.style.background = gradCss;
    const angleText = fd.type === 'linear' ? ` ${fd.gradient?.angle || 135}°` : '';
    if (hexLabel) hexLabel.innerText = fd.type === 'linear' ? `Linear${angleText}` : 'Radial';
    if (opacityLabel) opacityLabel.innerText = `${fd.opacity !== undefined ? fd.opacity : 100}%`;
  }
}

function parseColorToHexAndOpacity(colorStr, defaultHex = '#38a0c4', defaultOp = 100) {
  if (!colorStr) return { hex: defaultHex, opacity: defaultOp };
  colorStr = String(colorStr).trim();

  if (colorStr.startsWith('rgba')) {
    const m = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (m) {
      const r = parseInt(m[1]).toString(16).padStart(2, '0');
      const g = parseInt(m[2]).toString(16).padStart(2, '0');
      const b = parseInt(m[3]).toString(16).padStart(2, '0');
      const op = m[4] !== undefined ? Math.round(parseFloat(m[4]) * 100) : 100;
      return { hex: `#${r}${g}${b}`, opacity: isNaN(op) ? 100 : op };
    }
  } else if (colorStr.startsWith('rgb')) {
    const m = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (m) {
      const r = parseInt(m[1]).toString(16).padStart(2, '0');
      const g = parseInt(m[2]).toString(16).padStart(2, '0');
      const b = parseInt(m[3]).toString(16).padStart(2, '0');
      return { hex: `#${r}${g}${b}`, opacity: 100 };
    }
  } else if (colorStr.startsWith('#')) {
    let clean = colorStr.slice(1);
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    if (clean.length === 6) return { hex: `#${clean}`, opacity: 100 };
  }
  return { hex: defaultHex, opacity: defaultOp };
}

function ensureTargetFillData(data, key, legacyKey, defaultColor, defaultOpacity = 100) {
  if (!data) return null;
  if (!data[key]) {
    let raw = defaultColor;
    if (legacyKey === 'style.color' && data.style && data.style.color) {
      raw = data.style.color;
    } else if (legacyKey && data[legacyKey]) {
      raw = data[legacyKey];
    }
    const parsed = parseColorToHexAndOpacity(raw, defaultColor, defaultOpacity);
    data[key] = {
      enabled: true,
      type: 'solid',
      color: parsed.hex,
      opacity: parsed.opacity,
      gradient: {
        angle: 135,
        stops: [
          { position: 0, color: parsed.hex, opacity: parsed.opacity },
          { position: 100, color: '#38a0c4', opacity: 100 }
        ]
      }
    };
  }
  return data[key];
}

function updateCarouselColorTriggers(data) {
  if (!data) return;
  const arrowBgFd = ensureTargetFillData(data, 'arrowBgData', 'arrowBgColor', '#000000', 45);
  const arrowColorFd = ensureTargetFillData(data, 'arrowColorData', 'arrowColor', '#ffffff', 100);
  const arrowHoverBgFd = ensureTargetFillData(data, 'arrowHoverBgData', 'arrowHoverBgColor', '#38a0c4', 100);

  updateTriggerSummaryFor('propCarouselArrowBgSwatch', 'propCarouselArrowBgHex', 'propCarouselArrowBgOpacity', arrowBgFd);
  updateTriggerSummaryFor('propCarouselArrowColorSwatch', 'propCarouselArrowColorHex', 'propCarouselArrowColorOpacity', arrowColorFd);
  updateTriggerSummaryFor('propCarouselArrowHoverBgSwatch', 'propCarouselArrowHoverBgHex', 'propCarouselArrowHoverBgOpacity', arrowHoverBgFd);
}

function updateBtnTextColorTrigger(data) {
  if (!data || data.type !== 'button') return;
  const rawColor = (data.style && data.style.color) ? data.style.color : '#ffffff';
  const btnTextFd = ensureTargetFillData(data, 'btnTextFillData', 'style.color', rawColor, 100);
  updateTriggerSummaryFor('propBtnTextColorSwatch', 'propBtnTextColorHex', 'propBtnTextColorOpacity', btnTextFd);
}

function updateButtonInputColorTriggers(data) {
  if (!data || data.type !== 'button') return;
  const inBgFd = ensureTargetFillData(data, 'btnInputBgData', 'inputBg', '#ffffff', 100);
  const inTextFd = ensureTargetFillData(data, 'btnInputTextColorData', 'inputTextColor', '#2c5d6b', 100);
  const inBorderFd = ensureTargetFillData(data, 'btnInputBorderColorData', 'inputBorderColor', '#bddce7', 100);

  updateTriggerSummaryFor('propBtnInputBgSwatch', 'propBtnInputBgHex', 'propBtnInputBgOpacity', inBgFd);
  updateTriggerSummaryFor('propBtnInputTextColorSwatch', 'propBtnInputTextColorHex', 'propBtnInputTextColorOpacity', inTextFd);
  updateTriggerSummaryFor('propBtnInputBorderColorSwatch', 'propBtnInputBorderColorHex', 'propBtnInputBorderColorOpacity', inBorderFd);
}

function updateMediaEmbedColorTriggers(data) {
  if (!data || data.type !== 'media_embed') return;
  const headerBgFd = ensureTargetFillData(data, 'headerBgData', 'headerBg', '#e2f0f5', 100);
  const headerColorFd = ensureTargetFillData(data, 'headerColorData', 'headerColor', '#2c5d6b', 100);
  const titleColorFd = ensureTargetFillData(data, 'titleColorData', 'titleColor', '#2c5d6b', 100);
  const descColorFd = ensureTargetFillData(data, 'descColorData', 'descColor', '#7a8a94', 100);
  const btnBgFd = ensureTargetFillData(data, 'btnBgData', 'btnBg', '#38a0c4', 100);
  const btnColorFd = ensureTargetFillData(data, 'btnColorData', 'btnColor', '#ffffff', 100);

  updateTriggerSummaryFor('propMediaHeaderBgSwatch', 'propMediaHeaderBgHex', 'propMediaHeaderBgOpacity', headerBgFd);
  updateTriggerSummaryFor('propMediaHeaderColorSwatch', 'propMediaHeaderColorHex', 'propMediaHeaderColorOpacity', headerColorFd);
  updateTriggerSummaryFor('propMediaTitleColorSwatch', 'propMediaTitleColorHex', 'propMediaTitleColorOpacity', titleColorFd);
  updateTriggerSummaryFor('propMediaDescColorSwatch', 'propMediaDescColorHex', 'propMediaDescColorOpacity', descColorFd);
  updateTriggerSummaryFor('propMediaBtnBgSwatch', 'propMediaBtnBgHex', 'propMediaBtnBgOpacity', btnBgFd);
  updateTriggerSummaryFor('propMediaBtnColorSwatch', 'propMediaBtnColorHex', 'propMediaBtnColorOpacity', btnColorFd);
}

function updateTitleColorTriggers(data) {
  if (!data || data.type !== 'title') return;
  const strokeFd = ensureTargetFillData(data, 'textStrokeColorData', 'textStrokeColor', '#000000', 100);
  const shadowFd = ensureTargetFillData(data, 'textShadowColorData', 'textShadowColor', '#000000', 50);

  updateTriggerSummaryFor('propTitleStrokeColorSwatch', 'propTitleStrokeColorHex', 'propTitleStrokeColorOpacity', strokeFd);
  updateTriggerSummaryFor('propTitleShadowColorSwatch', 'propTitleShadowColorHex', 'propTitleShadowColorOpacity', shadowFd);
}

function updateBoxInteractiveColorTriggers(data) {
  if (!data || (typeof isBoxInteraktifType === 'function' && !isBoxInteraktifType(data.type))) return;
  if (!data.boxConfig) data.boxConfig = {};
  const cfg = data.boxConfig;

  const bgFd = ensureTargetFillData(cfg, 'boxBgData', 'bgColor', cfg.bgColor || '#ffffff', 100);
  const itemBgFd = ensureTargetFillData(cfg, 'boxItemBgData', 'itemBgColor', cfg.itemBgColor || '#ffffff', 100);
  const headerColorFd = ensureTargetFillData(cfg, 'boxHeaderColorData', 'headerColor', cfg.headerColor || '#2c5d6b', 100);
  const accentColorFd = ensureTargetFillData(cfg, 'boxAccentColorData', 'accentColor', cfg.accentColor || '#38a0c4', 100);

  updateTriggerSummaryFor('propBoxBgSwatch', 'propBoxBgHex', 'propBoxBgOpacity', bgFd);
  updateTriggerSummaryFor('propBoxItemBgSwatch', 'propBoxItemBgHex', 'propBoxItemBgOpacity', itemBgFd);
  updateTriggerSummaryFor('propBoxHeaderColorSwatch', 'propBoxHeaderColorHex', 'propBoxHeaderColorOpacity', headerColorFd);
  updateTriggerSummaryFor('propBoxAccentColorSwatch', 'propBoxAccentColorHex', 'propBoxAccentColorOpacity', accentColorFd);
}

function updateChatbotColorTriggers(data) {
  if (!data || data.type !== 'genui_chatbot') return;
  if (!data.chatbotConfig) data.chatbotConfig = {};
  const cfg = data.chatbotConfig;

  // Solid-only
  const chipBgFd = ensureTargetFillData(cfg, 'chatChipBgData', 'chipBg', cfg.chipBg || '#ffffff', 100);
  const chipTextColorFd = ensureTargetFillData(cfg, 'chatChipTextColorData', 'chipTextColor', cfg.chipTextColor || '#0F4C75', 100);
  const chipBorderColorFd = ensureTargetFillData(cfg, 'chatChipBorderColorData', 'chipBorderColor', cfg.chipBorderColor || '#bddce7', 100);
  const headerTextColorFd = ensureTargetFillData(cfg, 'chatHeaderTextColorData', 'headerTextColor', cfg.headerTextColor || '#ffffff', 100);
  const botTextColorFd = ensureTargetFillData(cfg, 'chatBotTextColorData', 'botTextColor', cfg.botTextColor || cfg.textColor || '#ffffff', 100);
  const userTextColorFd = ensureTargetFillData(cfg, 'chatUserTextColorData', 'userTextColor', cfg.userTextColor || cfg.textColor || '#ffffff', 100);
  const inputBgFd = ensureTargetFillData(cfg, 'chatInputBgData', 'inputBg', cfg.inputBg || '#ffffff', 100);
  const inputBorderColorFd = ensureTargetFillData(cfg, 'chatInputBorderColorData', 'inputBorderColor', cfg.inputBorderColor || '#bddce7', 100);
  const inputTextColorFd = ensureTargetFillData(cfg, 'chatInputTextColorData', 'inputTextColor', cfg.inputTextColor || '#2c5d6b', 100);
  const scrollbarColorFd = ensureTargetFillData(cfg, 'chatScrollbarColorData', 'scrollbarColor', cfg.scrollbarColor || '#bddce7', 100);
  const sendBtnTextColorFd = ensureTargetFillData(cfg, 'chatSendBtnTextColorData', 'sendBtnTextColor', cfg.sendBtnTextColor || '#ffffff', 100);

  // Solid, Linear, Radial
  const headerBgFd = ensureTargetFillData(cfg, 'chatHeaderBgData', 'headerBg', cfg.headerBg || cfg.botBg || '#38a0c4', 100);
  const cardBgFd = ensureTargetFillData(cfg, 'chatCardBgData', 'cardBg', cfg.cardBg || '#fafcfd', 100);
  const inputContainerBgFd = ensureTargetFillData(cfg, 'chatInputContainerBgData', 'inputContainerBg', (cfg.inputContainerBg && cfg.inputContainerBg !== 'transparent') ? cfg.inputContainerBg : '#ffffff', 100);
  const botBgFd = ensureTargetFillData(cfg, 'chatBotBgData', 'botBg', cfg.botBg || '#38a0c4', 100);
  const userBgFd = ensureTargetFillData(cfg, 'chatUserBgData', 'userBg', cfg.userBg || '#0F4C75', 100);
  const sendBtnBgFd = ensureTargetFillData(cfg, 'chatSendBtnBgData', 'sendBtnBg', cfg.sendBtnBg || cfg.botBg || '#38a0c4', 100);

  updateTriggerSummaryFor('propChatbotChipBgSwatch', 'propChatbotChipBgHex', 'propChatbotChipBgOpacity', chipBgFd);
  updateTriggerSummaryFor('propChatbotChipTextColorSwatch', 'propChatbotChipTextColorHex', 'propChatbotChipTextColorOpacity', chipTextColorFd);
  updateTriggerSummaryFor('propChatbotChipBorderColorSwatch', 'propChatbotChipBorderColorHex', 'propChatbotChipBorderColorOpacity', chipBorderColorFd);
  updateTriggerSummaryFor('propChatbotHeaderTextColorSwatch', 'propChatbotHeaderTextColorHex', 'propChatbotHeaderTextColorOpacity', headerTextColorFd);
  updateTriggerSummaryFor('propChatbotBotTextColorSwatch', 'propChatbotBotTextColorHex', 'propChatbotBotTextColorOpacity', botTextColorFd);
  updateTriggerSummaryFor('propChatbotUserTextColorSwatch', 'propChatbotUserTextColorHex', 'propChatbotUserTextColorOpacity', userTextColorFd);
  updateTriggerSummaryFor('propChatbotInputBgSwatch', 'propChatbotInputBgHex', 'propChatbotInputBgOpacity', inputBgFd);
  updateTriggerSummaryFor('propChatbotInputBorderColorSwatch', 'propChatbotInputBorderColorHex', 'propChatbotInputBorderColorOpacity', inputBorderColorFd);
  updateTriggerSummaryFor('propChatbotInputTextColorSwatch', 'propChatbotInputTextColorHex', 'propChatbotInputTextColorOpacity', inputTextColorFd);
  updateTriggerSummaryFor('propChatbotScrollbarColorSwatch', 'propChatbotScrollbarColorHex', 'propChatbotScrollbarColorOpacity', scrollbarColorFd);
  updateTriggerSummaryFor('propChatbotSendBtnTextColorSwatch', 'propChatbotSendBtnTextColorHex', 'propChatbotSendBtnTextColorOpacity', sendBtnTextColorFd);

  updateTriggerSummaryFor('propChatbotHeaderBgSwatch', 'propChatbotHeaderBgHex', 'propChatbotHeaderBgOpacity', headerBgFd);
  updateTriggerSummaryFor('propChatbotCardBgSwatch', 'propChatbotCardBgHex', 'propChatbotCardBgOpacity', cardBgFd);
  updateTriggerSummaryFor('propChatbotInputContainerBgSwatch', 'propChatbotInputContainerBgHex', 'propChatbotInputContainerBgOpacity', inputContainerBgFd);
  updateTriggerSummaryFor('propChatbotBotBgSwatch', 'propChatbotBotBgHex', 'propChatbotBotBgOpacity', botBgFd);
  updateTriggerSummaryFor('propChatbotUserBgSwatch', 'propChatbotUserBgHex', 'propChatbotUserBgOpacity', userBgFd);
  updateTriggerSummaryFor('propChatbotSendBtnBgSwatch', 'propChatbotSendBtnBgHex', 'propChatbotSendBtnBgOpacity', sendBtnBgFd);

  const inputContainerTrigger = document.getElementById('propChatbotInputContainerBgTrigger');
  if (inputContainerTrigger) {
    if (!cfg.inputContainerBgEnabled) {
      inputContainerTrigger.style.opacity = '0.4';
      inputContainerTrigger.style.pointerEvents = 'none';
    } else {
      inputContainerTrigger.style.opacity = '1';
      inputContainerTrigger.style.pointerEvents = 'auto';
    }
  }

  const inputBgTrigger = document.getElementById('propChatbotInputBgTrigger');
  if (inputBgTrigger) {
    inputBgTrigger.style.opacity = '1';
    inputBgTrigger.style.pointerEvents = 'auto';
  }
}
window.updateChatbotColorTriggers = updateChatbotColorTriggers;

function updateSelectedElementHeadingTag(val) {
  const data = elements.find((item) => item.id === selectedElementId);
  if (!data || data.type !== "title") return;
  data.headingTag = val;

  const headingFontSizes = {
    h1: 32,
    h2: 26,
    h3: 22,
    h4: 18
  };

  const newSize = headingFontSizes[(val || "").toLowerCase()] || 26;
  if (!data.style) data.style = {};
  data.style.fontSize = newSize + "px";

  const sizeInput = document.getElementById("propFontSize");
  const sizeVal = document.getElementById("fontSizeVal");
  if (sizeInput) sizeInput.value = newSize;
  if (sizeVal) sizeVal.innerText = newSize;

  renderCanvas();
  if (typeof renderLayers === "function") renderLayers();
  if (typeof pushHistory === "function") pushHistory();
}

function updateSelectedElementTitleStrokeWidth(val) {
  const data = elements.find((item) => item.id === selectedElementId);
  if (!data || data.type !== "title") return;
  const num = parseFloat(val) || 0;
  data.textStrokeWidth = num;
  const lbl = document.getElementById("titleStrokeWidthVal");
  if (lbl) lbl.innerText = num;
  renderCanvas();
  if (typeof pushHistoryDebounced === "function") pushHistoryDebounced();
}

function updateSelectedElementTitleShadowBlur(val) {
  const data = elements.find((item) => item.id === selectedElementId);
  if (!data || data.type !== "title") return;
  const num = parseFloat(val) || 0;
  data.textShadowBlur = num;
  const lbl = document.getElementById("titleShadowBlurVal");
  if (lbl) lbl.innerText = num;
  renderCanvas();
  if (typeof pushHistoryDebounced === "function") pushHistoryDebounced();
}

function updateSelectedElementTitleShadowOffsetX(val) {
  const data = elements.find((item) => item.id === selectedElementId);
  if (!data || data.type !== "title") return;
  const num = parseFloat(val) || 0;
  data.textShadowOffsetX = num;
  const lbl = document.getElementById("titleShadowOffsetXVal");
  if (lbl) lbl.innerText = num;
  renderCanvas();
  if (typeof pushHistoryDebounced === "function") pushHistoryDebounced();
}

function updateSelectedElementTitleShadowOffsetY(val) {
  const data = elements.find((item) => item.id === selectedElementId);
  if (!data || data.type !== "title") return;
  const num = parseFloat(val) || 0;
  data.textShadowOffsetY = num;
  const lbl = document.getElementById("titleShadowOffsetYVal");
  if (lbl) lbl.innerText = num;
  renderCanvas();
  if (typeof pushHistoryDebounced === "function") pushHistoryDebounced();
}

function updateSelectedElementTextListMode(val) {
  const data = elements.find((item) => item.id === selectedElementId);
  if (!data || data.type !== "text") return;
  data.listMode = val;
  renderCanvas();
  if (typeof renderLayers === "function") renderLayers();
  if (typeof pushHistory === "function") pushHistory();
}

function updatePageBgColorTrigger() {
  if (!window.pageBgFillData) {
    let initColor = "#f2f7f9";
    if (typeof canvas !== "undefined" && canvas && canvas.style.background) {
      initColor = rgbToHex(canvas.style.background) || "#f2f7f9";
    }
    window.pageBgFillData = {
      enabled: true,
      type: "solid",
      color: initColor,
      opacity: 100
    };
  }
  window.pageBgFillData.type = "solid";
  updateTriggerSummaryFor('pageBgColorSwatch', 'pageBgColorHex', 'pageBgColorOpacity', window.pageBgFillData);
}

function updateFillTriggerSummary() {
  if (activeFillTarget && activeFillTarget.swatchId) {
    updateTriggerSummaryFor(activeFillTarget.swatchId, activeFillTarget.hexId, activeFillTarget.opacityId, currentFillData);
    return;
  }

  const data = elements.find(i => i.id === selectedElementId);
  if (!data) return;

  const fd = (data && data.fillData) ? data.fillData : currentFillData;
  updateTriggerSummaryFor('fillTriggerSwatch', 'fillTriggerHex', 'fillTriggerOpacity', fd);
}

function updateStrokeTriggerSummary() {
  const data = elements.find(i => i.id === selectedElementId);
  const sd = (data && data.strokeData) ? data.strokeData : currentStrokeData;
  if (!sd) return;
  currentStrokeData = sd;

  const trigger = document.getElementById('strokeTriggerBox');
  const swatch = document.getElementById('strokeTriggerSwatch');
  const hexLabel = document.getElementById('strokeTriggerHex');
  const opacityLabel = document.getElementById('strokeTriggerOpacity');
  if (!swatch) return;

  const isSolid = !sd.type || sd.type === 'solid';
  if (!sd.enabled) {
    swatch.style.background = 'transparent';
    if (hexLabel) hexLabel.innerText = 'None';
    if (opacityLabel) opacityLabel.innerText = '0%';
  } else if (isSolid) {
    const hex = (sd.color || '#38a0c4').toUpperCase();
    const op = sd.opacity !== undefined ? sd.opacity : 100;
    swatch.style.background = hexToRgba(hex, op / 100);
    if (hexLabel) hexLabel.innerText = hex;
    if (opacityLabel) opacityLabel.innerText = `${op}%`;
  } else {
    const gradCss = buildGradientCss(sd);
    swatch.style.background = gradCss;
    if (hexLabel) {
      hexLabel.innerText = sd.type === 'radial' ? 'Radial' : `Linear ${sd.gradient?.angle || 135}°`;
    }
    if (opacityLabel) opacityLabel.innerText = `${sd.opacity !== undefined ? sd.opacity : 100}%`;
  }
}

function positionFloatingPopover(popover, trigger) {
  const appContainer = document.querySelector('.app') || document.body;
  if (popover.parentElement !== appContainer) {
    appContainer.appendChild(popover);
  }

  const appRect = appContainer.getBoundingClientRect();
  const triggerRect = trigger.getBoundingClientRect();
  const popoverWidth = 280;
  const popoverHeight = 310;

  // X position relative to .app (strictly clamped inside .app)
  const relLeft = triggerRect.left - appRect.left;
  const finalLeft = Math.max(10, Math.min(relLeft, appRect.width - popoverWidth - 10));

  // Y position relative to .app bottom (right above trigger, strictly within .app)
  const relBottom = appRect.bottom - triggerRect.top + 8;
  const maxBottom = appRect.height - popoverHeight - 20;
  const finalBottom = Math.max(20, Math.min(relBottom, maxBottom > 20 ? maxBottom : 20));

  popover.style.position = 'absolute';
  popover.style.zIndex = '999999';
  popover.style.left = finalLeft + 'px';
  popover.style.bottom = finalBottom + 'px';
  popover.style.top = 'auto';
  popover.style.right = 'auto';
}

function toggleTextColorPopover(e) {
  if (e) e.stopPropagation();
  closeFillPopover();
  closeStrokePopover();

  const popover = document.getElementById('textColorPopoverBox');
  const trigger = document.getElementById('textColorTriggerBox');
  if (!popover || !trigger) return;

  // Move popover to .app container
  const appContainer = document.querySelector('.app') || document.body;
  if (popover.parentElement !== appContainer) {
    appContainer.appendChild(popover);
  }

  const isHidden = popover.classList.contains('hidden');
  if (isHidden) {
    popover.classList.remove('hidden');
    popover.style.display = 'block';
    positionFloatingPopover(popover, trigger);
    renderTextColorPanel();
  } else {
    popover.classList.add('hidden');
    popover.style.display = 'none';
  }
}

function closeTextColorPopover() {
  const popover = document.getElementById('textColorPopoverBox');
  if (popover) {
    popover.classList.add('hidden');
    popover.style.display = 'none';
  }
}

function openFillPopoverForTarget(targetKey, title, triggerId, swatchId, hexId, opacityId, e) {
  if (e) e.stopPropagation();
  closeStrokePopover();
  closeTextColorPopover();

  const popover = document.getElementById('fillPopoverBox');
  const trigger = document.getElementById(triggerId || 'fillTriggerBox');
  if (!popover || !trigger) return;

  // Move popover to .app container
  const appContainer = document.querySelector('.app') || document.body;
  if (popover.parentElement !== appContainer) {
    appContainer.appendChild(popover);
  }

  // Toggle if clicked on same open trigger
  const isSameOpen = activeFillTarget && activeFillTarget.triggerId === triggerId && !popover.classList.contains('hidden');
  if (isSameOpen) {
    closeFillPopover();
    return;
  }

  const typeRow = popover.querySelector('.fill-type-row');

  if (targetKey === 'pageBgFillData') {
    if (!window.pageBgFillData) {
      let initColor = '#f2f7f9';
      if (typeof canvas !== 'undefined' && canvas && canvas.style.background) {
        initColor = rgbToHex(canvas.style.background) || '#f2f7f9';
      }
      window.pageBgFillData = {
        enabled: true,
        type: 'solid',
        color: initColor,
        opacity: 100
      };
    }
    window.pageBgFillData.type = 'solid';
    currentFillData = window.pageBgFillData;
    if (typeRow) typeRow.style.display = 'none';
    activeFillTarget = { key: 'pageBgFillData', title: title || 'Latar Warna Halaman', triggerId, swatchId, hexId, opacityId, solidOnly: true };

    const titleEl = document.getElementById('fillPopoverTitle');
    if (titleEl) titleEl.innerText = activeFillTarget.title;

    popover.classList.remove('hidden');
    popover.style.display = 'block';
    positionFloatingPopover(popover, trigger);
    renderFillPanel();
    return;
  }

  const data = elements.find(i => i.id === selectedElementId);
  if (!data) return;

  const mediaEmbedKeys = {
    headerBgData: { legacy: 'headerBg', defaultColor: '#e2f0f5', solidOnly: false, title: 'Warna Latar Header' },
    headerColorData: { legacy: 'headerColor', defaultColor: '#2c5d6b', solidOnly: true, title: 'Warna Teks Header' },
    titleColorData: { legacy: 'titleColor', defaultColor: '#2c5d6b', solidOnly: false, title: 'Warna Judul' },
    descColorData: { legacy: 'descColor', defaultColor: '#7a8a94', solidOnly: true, title: 'Warna Deskripsi' },
    btnBgData: { legacy: 'btnBg', defaultColor: '#38a0c4', solidOnly: false, title: 'Warna Tombol CTA' },
    btnColorData: { legacy: 'btnColor', defaultColor: '#ffffff', solidOnly: true, title: 'Warna Teks CTA' }
  };

  const titleEffectKeys = {
    textStrokeColorData: { legacy: 'textStrokeColor', defaultColor: '#000000', defaultOpacity: 100, solidOnly: true, title: 'Warna Stroke Teks' },
    textShadowColorData: { legacy: 'textShadowColor', defaultColor: '#000000', defaultOpacity: 50, solidOnly: true, title: 'Warna Bayangan Teks' }
  };

  const buttonInputKeys = {
    btnInputBgData: { legacy: 'inputBg', defaultColor: '#ffffff', solidOnly: true, title: 'Warna Input Bg' },
    btnInputTextColorData: { legacy: 'inputTextColor', defaultColor: '#2c5d6b', solidOnly: true, title: 'Warna Teks Input' },
    btnInputBorderColorData: { legacy: 'inputBorderColor', defaultColor: '#bddce7', solidOnly: true, title: 'Warna Border Input' }
  };

  const boxInteraktifKeys = {
    boxBgData: { legacy: 'bgColor', defaultColor: '#ffffff', solidOnly: false, title: 'Fill Background Modul' },
    boxItemBgData: { legacy: 'itemBgColor', defaultColor: '#ffffff', solidOnly: true, title: 'Warna Item / Card' },
    boxHeaderColorData: { legacy: 'headerColor', defaultColor: '#2c5d6b', solidOnly: true, title: 'Warna Teks Judul/Tab' },
    boxAccentColorData: { legacy: 'accentColor', defaultColor: '#38a0c4', solidOnly: true, title: 'Warna Aksens / Ikon' }
  };

  const chatbotKeys = {
    // Solid only
    chatChipBgData: { legacy: 'chipBg', defaultColor: '#ffffff', solidOnly: true, title: 'Warna Background Chips' },
    chatChipTextColorData: { legacy: 'chipTextColor', defaultColor: '#0F4C75', solidOnly: true, title: 'Warna Teks Chips' },
    chatChipBorderColorData: { legacy: 'chipBorderColor', defaultColor: '#bddce7', solidOnly: true, title: 'Warna Border Chips' },
    chatHeaderTextColorData: { legacy: 'headerTextColor', defaultColor: '#ffffff', solidOnly: true, title: 'Warna Teks Header' },
    chatBotTextColorData: { legacy: 'botTextColor', defaultColor: '#ffffff', solidOnly: true, title: 'Warna Teks Pesan Bot' },
    chatUserTextColorData: { legacy: 'userTextColor', defaultColor: '#ffffff', solidOnly: true, title: 'Warna Teks Pesan User' },
    chatInputBgData: { legacy: 'inputBg', defaultColor: '#ffffff', solidOnly: true, title: 'Warna Background Kotak Input' },
    chatInputBorderColorData: { legacy: 'inputBorderColor', defaultColor: '#bddce7', solidOnly: true, title: 'Warna Border Kotak Input' },
    chatInputTextColorData: { legacy: 'inputTextColor', defaultColor: '#2c5d6b', solidOnly: true, title: 'Warna Teks Kotak Input' },
    chatScrollbarColorData: { legacy: 'scrollbarColor', defaultColor: '#bddce7', solidOnly: true, title: 'Warna Scrollbar Chat' },
    chatSendBtnTextColorData: { legacy: 'sendBtnTextColor', defaultColor: '#ffffff', solidOnly: true, title: 'Warna Teks / Icon Tombol Kirim' },

    // Solid, Linear, Radial
    chatHeaderBgData: { legacy: 'headerBg', defaultColor: '#38a0c4', solidOnly: false, title: 'Warna Background Header' },
    chatCardBgData: { legacy: 'cardBg', defaultColor: '#fafcfd', solidOnly: false, title: 'Warna Latar Belakang Chat (Chat Body)' },
    chatInputContainerBgData: { legacy: 'inputContainerBg', defaultColor: '#ffffff', defaultOpacity: 100, solidOnly: false, title: 'Warna Background Container Bar' },
    chatBotBgData: { legacy: 'botBg', defaultColor: '#38a0c4', solidOnly: false, title: 'Warna Bubble Bot' },
    chatUserBgData: { legacy: 'userBg', defaultColor: '#0F4C75', solidOnly: false, title: 'Warna Bubble User' },
    chatSendBtnBgData: { legacy: 'sendBtnBg', defaultColor: '#38a0c4', solidOnly: false, title: 'Warna Tombol Kirim' }
  };

  if (targetKey === 'arrowColorData') {
    currentFillData = ensureTargetFillData(data, 'arrowColorData', 'arrowColor', '#ffffff', 100);
    currentFillData.type = 'solid';
    activeFillTarget = { key: 'arrowColorData', title: title || 'Warna Ikon Panah', triggerId, swatchId, hexId, opacityId, solidOnly: true };
    if (typeRow) typeRow.style.display = 'none';
  } else if (titleEffectKeys[targetKey]) {
    const info = titleEffectKeys[targetKey];
    currentFillData = ensureTargetFillData(data, targetKey, info.legacy, info.defaultColor, info.defaultOpacity || 100);
    currentFillData.type = 'solid';
    activeFillTarget = { key: targetKey, title: title || info.title, triggerId, swatchId, hexId, opacityId, solidOnly: true };
    if (typeRow) typeRow.style.display = 'none';
  } else if (buttonInputKeys[targetKey]) {
    const info = buttonInputKeys[targetKey];
    currentFillData = ensureTargetFillData(data, targetKey, info.legacy, info.defaultColor, 100);
    currentFillData.type = 'solid';
    activeFillTarget = { key: targetKey, title: title || info.title, triggerId, swatchId, hexId, opacityId, solidOnly: true };
    if (typeRow) typeRow.style.display = 'none';
  } else if (mediaEmbedKeys[targetKey]) {
    const info = mediaEmbedKeys[targetKey];
    currentFillData = ensureTargetFillData(data, targetKey, info.legacy, info.defaultColor, 100);
    if (info.solidOnly) {
      currentFillData.type = 'solid';
      if (typeRow) typeRow.style.display = 'none';
    } else {
      if (typeRow) typeRow.style.display = '';
    }
    activeFillTarget = { key: targetKey, title: title || info.title, triggerId, swatchId, hexId, opacityId, solidOnly: info.solidOnly };
  } else if (boxInteraktifKeys[targetKey]) {
    const info = boxInteraktifKeys[targetKey];
    if (!data.boxConfig) data.boxConfig = {};
    currentFillData = ensureTargetFillData(data.boxConfig, targetKey, info.legacy, info.defaultColor, 100);
    if (info.solidOnly) {
      currentFillData.type = 'solid';
      if (typeRow) typeRow.style.display = 'none';
    } else {
      if (typeRow) typeRow.style.display = '';
    }
    activeFillTarget = { key: targetKey, title: title || info.title, triggerId, swatchId, hexId, opacityId, solidOnly: info.solidOnly };
  } else if (chatbotKeys[targetKey]) {
    const info = chatbotKeys[targetKey];
    if (!data.chatbotConfig) data.chatbotConfig = {};
    currentFillData = ensureTargetFillData(data.chatbotConfig, targetKey, info.legacy, info.defaultColor, 100);
    if (info.solidOnly) {
      currentFillData.type = 'solid';
      if (typeRow) typeRow.style.display = 'none';
    } else {
      if (typeRow) typeRow.style.display = '';
    }
    activeFillTarget = { key: targetKey, title: title || info.title, triggerId, swatchId, hexId, opacityId, solidOnly: info.solidOnly };
  } else {
    if (typeRow) typeRow.style.display = '';
    if (targetKey === 'arrowBgData') {
      currentFillData = ensureTargetFillData(data, 'arrowBgData', 'arrowBgColor', '#000000', 45);
      activeFillTarget = { key: 'arrowBgData', title: title || 'Warna Latar Panah', triggerId, swatchId, hexId, opacityId };
    } else if (targetKey === 'arrowHoverBgData') {
      currentFillData = ensureTargetFillData(data, 'arrowHoverBgData', 'arrowHoverBgColor', '#38a0c4', 100);
      activeFillTarget = { key: 'arrowHoverBgData', title: title || 'Warna Hover Panah', triggerId, swatchId, hexId, opacityId };
    } else if (targetKey === 'btnTextFillData') {
      const rawColor = (data.style && data.style.color) ? data.style.color : '#ffffff';
      currentFillData = ensureTargetFillData(data, 'btnTextFillData', 'style.color', rawColor, 100);
      activeFillTarget = { key: 'btnTextFillData', title: title || 'Warna Teks Tombol', triggerId, swatchId, hexId, opacityId };
    } else {
      // Default element fill
      if (!data.fillData) data.fillData = getDefaultFillData(data.style, data.type);
      currentFillData = data.fillData;
      activeFillTarget = { key: 'fillData', title: 'Fill / Warna', triggerId: 'fillTriggerBox', swatchId: 'fillTriggerSwatch', hexId: 'fillTriggerHex', opacityId: 'fillTriggerOpacity' };
    }
  }

  const titleEl = document.getElementById('fillPopoverTitle');
  if (titleEl) titleEl.innerText = activeFillTarget.title;

  popover.classList.remove('hidden');
  popover.style.display = 'block';
  positionFloatingPopover(popover, trigger);
  renderFillPanel();
}

function toggleFillPopover(e) {
  openFillPopoverForTarget(null, 'Fill / Warna', 'fillTriggerBox', 'fillTriggerSwatch', 'fillTriggerHex', 'fillTriggerOpacity', e);
}

function closeFillPopover() {
  const popover = document.getElementById('fillPopoverBox');
  if (popover) {
    popover.classList.add('hidden');
    popover.style.display = 'none';
    const typeRow = popover.querySelector('.fill-type-row');
    if (typeRow) typeRow.style.display = '';
  }
  activeFillTarget = null;
}

function toggleStrokePopover(e) {
  if (e) e.stopPropagation();
  closeFillPopover();
  closeTextColorPopover();
  const popover = document.getElementById('strokePopoverBox');
  const trigger = document.getElementById('strokeTriggerBox');
  if (!popover || !trigger) return;

  // Move popover to .app container
  const appContainer = document.querySelector('.app') || document.body;
  if (popover.parentElement !== appContainer) {
    appContainer.appendChild(popover);
  }

  const isHidden = popover.classList.contains('hidden');
  if (isHidden) {
    popover.classList.remove('hidden');
    popover.style.display = 'block';
    positionFloatingPopover(popover, trigger);
  } else {
    popover.classList.add('hidden');
    popover.style.display = 'none';
  }
}

function closeStrokePopover() {
  const popover = document.getElementById('strokePopoverBox');
  if (popover) {
    popover.classList.add('hidden');
    popover.style.display = 'none';
  }
}

document.addEventListener('click', (e) => {
  const fillPopover = document.getElementById('fillPopoverBox');
  if (fillPopover && !fillPopover.classList.contains('hidden')) {
    const activeTrigger = activeFillTarget ? document.getElementById(activeFillTarget.triggerId) : document.getElementById('fillTriggerBox');
    if (!fillPopover.contains(e.target) && !activeTrigger?.contains(e.target)) {
      closeFillPopover();
    }
  }
  const strokePopover = document.getElementById('strokePopoverBox');
  const strokeTrigger = document.getElementById('strokeTriggerBox');
  if (strokePopover && !strokePopover.classList.contains('hidden')) {
    if (!strokePopover.contains(e.target) && !strokeTrigger?.contains(e.target)) {
      strokePopover.classList.add('hidden');
      strokePopover.style.display = 'none';
    }
  }
  const textPopover = document.getElementById('textColorPopoverBox');
  const textTrigger = document.getElementById('textColorTriggerBox');
  if (textPopover && !textPopover.classList.contains('hidden')) {
    if (!textPopover.contains(e.target) && !textTrigger?.contains(e.target)) {
      textPopover.classList.add('hidden');
      textPopover.style.display = 'none';
    }
  }
});

function renderTextColorPanel() {
  const data = elements.find(i => i.id === selectedElementId);
  const fd = (data && data.fillData) ? data.fillData : currentFillData;
  if (!fd) return;
  currentFillData = fd;

  updateTextColorTriggerSummary();

  ['Solid', 'Linear', 'Radial'].forEach(t => {
    const tab = document.getElementById('textTab' + t);
    if (tab) tab.classList.toggle('active', (fd.type || 'solid') === t.toLowerCase());
  });

  const isSolid = !fd.type || fd.type === 'solid';
  const solidRow = document.getElementById('solidTextColorRow');
  const solidOp = document.getElementById('solidTextColorOpacityRow');
  const gradPanel = document.getElementById('gradientTextColorPanel');
  const gradAngle = document.getElementById('textGradAngleRow');

  if (solidRow) solidRow.classList.toggle('hidden', !isSolid);
  if (solidOp) solidOp.classList.toggle('hidden', !isSolid);
  if (gradPanel) gradPanel.classList.toggle('hidden', isSolid);
  if (gradAngle) gradAngle.classList.toggle('hidden', fd.type !== 'linear');

  const el = id => document.getElementById(id);

  if (isSolid) {
    if (el('textColorInput')) {
      el('textColorInput').value = fd.color || '#2c5d6b';
      el('textColorInput').style.background = hexToRgba(fd.color || '#2c5d6b', (fd.opacity !== undefined ? fd.opacity : 100) / 100);
    }
    if (el('textColorHexInput')) el('textColorHexInput').value = (fd.color || '#2c5d6b').replace('#', '');
    if (el('textColorOpacityInput')) el('textColorOpacityInput').value = fd.opacity !== undefined ? fd.opacity : 100;
    if (el('textColorOpacitySlider')) el('textColorOpacitySlider').value = fd.opacity !== undefined ? fd.opacity : 100;
  } else {
    updateTextGradientPreview();
    renderTextGradientStops();
    const g = fd.gradient;
    if (g) {
      const a = g.angle !== undefined ? g.angle : 135;
      if (el('textGradAngleSlider')) el('textGradAngleSlider').value = a;
      if (el('textGradAngleInput')) el('textGradAngleInput').value = a;
      if (el('textGradAngleLbl')) el('textGradAngleLbl').innerText = a;
    }
  }
}

function setTextColorType(type) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data) return;
  if (!data.fillData) data.fillData = getDefaultFillData(data.style, data.type);
  data.fillData.type = type;
  if (!data.fillData.gradient) {
    data.fillData.gradient = {
      angle: 135,
      stops: [
        { position: 0, color: data.fillData.color || '#2c5d6b', opacity: 100 },
        { position: 100, color: '#38a0c4', opacity: 100 }
      ]
    };
  }
  currentFillData = data.fillData;
  renderTextColorPanel();
  applyFillStroke();
}

function onTextColorSolidColor(hex) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data) return;
  if (!data.fillData) data.fillData = getDefaultFillData(data.style, data.type);
  data.fillData.color = hex;
  currentFillData = data.fillData;
  const sw = document.getElementById('textColorInput');
  const hi = document.getElementById('textColorHexInput');
  if (sw) sw.style.background = hexToRgba(hex, (data.fillData.opacity !== undefined ? data.fillData.opacity : 100) / 100);
  if (hi) hi.value = hex.replace('#', '');
  applyFillStroke();
}

function onTextColorHexText(str) {
  if (str.length === 6 && /^[0-9a-fA-F]{6}$/.test(str)) {
    const hex = '#' + str;
    const data = elements.find(i => i.id === selectedElementId);
    if (!data) return;
    if (!data.fillData) data.fillData = getDefaultFillData(data.style, data.type);
    data.fillData.color = hex;
    currentFillData = data.fillData;
    const sw = document.getElementById('textColorInput');
    if (sw) {
      sw.value = hex;
      sw.style.background = hexToRgba(hex, (data.fillData.opacity !== undefined ? data.fillData.opacity : 100) / 100);
    }
    applyFillStroke();
  }
}

function onTextColorOpacity(val) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data) return;
  if (!data.fillData) data.fillData = getDefaultFillData(data.style, data.type);
  data.fillData.opacity = Math.max(0, Math.min(100, parseInt(val) || 0));
  currentFillData = data.fillData;
  const sw = document.getElementById('textColorInput');
  if (sw) sw.style.background = hexToRgba(data.fillData.color || '#2c5d6b', data.fillData.opacity / 100);
  applyFillStroke();
}

function onTextGradientAngleChange(val) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.fillData || !data.fillData.gradient) return;
  data.fillData.gradient.angle = parseInt(val) || 135;
  currentFillData = data.fillData;
  updateTextGradientPreview();
  applyFillStroke();
}

function updateTextGradientPreview() {
  const fd = currentFillData;
  const bar = document.getElementById('textGradPreviewBar');
  if (!fd || !fd.gradient || !bar) return;
  bar.style.background = buildGradientCss(fd);

  if (!bar.dataset.hasListener) {
    bar.dataset.hasListener = "true";
    bar.addEventListener('click', (e) => {
      const rect = bar.getBoundingClientRect();
      const percent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      addTextGradientStopAt(percent);
    });
  }
}

function addTextGradientStop() {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.fillData || !data.fillData.gradient) return;
  const stops = data.fillData.gradient.stops;
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  let bestPos = 50;
  let maxGap = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1].position - sorted[i].position;
    if (gap > maxGap) {
      maxGap = gap;
      bestPos = Math.round((sorted[i].position + sorted[i + 1].position) / 2);
    }
  }
  stops.push({ position: bestPos, color: '#38a0c4', opacity: 100 });
  stops.sort((a, b) => a.position - b.position);
  currentFillData = data.fillData;
  updateTextGradientPreview();
  renderTextGradientStops();
  applyFillStroke();
}

function addTextGradientStopAt(percent) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.fillData || !data.fillData.gradient) return;
  const stops = data.fillData.gradient.stops;
  stops.push({ position: percent, color: '#38a0c4', opacity: 100 });
  stops.sort((a, b) => a.position - b.position);
  currentFillData = data.fillData;
  updateTextGradientPreview();
  renderTextGradientStops();
  applyFillStroke();
}

function removeTextGradientStop(idx) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.fillData || !data.fillData.gradient) return;
  if (data.fillData.gradient.stops.length <= 2) return;
  data.fillData.gradient.stops.splice(idx, 1);
  currentFillData = data.fillData;
  updateTextGradientPreview();
  renderTextGradientStops();
  applyFillStroke();
}

function renderTextGradientStops() {
  const fd = currentFillData;
  const list = document.getElementById('textGradStopsList');
  if (!fd || !fd.gradient || !list) return;
  list.innerHTML = '';

  fd.gradient.stops.forEach((stop, idx) => {
    const row = document.createElement('div');
    row.className = 'grad-stop-row';
    const canDel = fd.gradient.stops.length > 2;
    row.innerHTML = `
      <input type="number" id="textGradStopPos_${idx}" class="fs-pos-input" value="${stop.position}" min="0" max="100"
        oninput="updateTextStopPosition(${idx}, parseInt(this.value)||0)" />
      <span class="fs-percent-sm">%</span>
      <input type="color" id="textGradStopColor_${idx}" class="fs-swatch-input fs-swatch-sm" value="${stop.color}"
        oninput="updateTextStopColor(${idx}, this.value)" style="background:${hexToRgba(stop.color, stop.opacity / 100)}" />
      <input type="text" id="textGradStopHex_${idx}" class="fs-hex-input fs-hex-sm" value="${stop.color.replace('#', '')}" maxlength="6"
        oninput="updateTextStopHex(${idx}, this.value)" />
      <input type="number" id="textGradStopOpacity_${idx}" class="fs-opacity-input" value="${stop.opacity}" min="0" max="100"
        oninput="updateTextStopOpacity(${idx}, parseInt(this.value)||0)" />
      <span class="fs-percent-sm">%</span>
      ${canDel ? `<button class="fs-del-stop-btn" onclick="removeTextGradientStop(${idx})">&#8212;</button>` : '<span style="width:22px;flex-shrink:0"></span>'}
    `;
    list.appendChild(row);
  });
}

function updateTextStopPosition(idx, val) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.fillData || !data.fillData.gradient) return;
  const pos = Math.max(0, Math.min(100, val));
  data.fillData.gradient.stops[idx].position = pos;

  const posInput = document.getElementById(`textGradStopPos_${idx}`);
  if (posInput && document.activeElement !== posInput) {
    posInput.value = pos;
  }
  updateTextGradientPreview();
  applyFillStroke();
}

function updateTextStopColor(idx, hex) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.fillData || !data.fillData.gradient) return;
  data.fillData.gradient.stops[idx].color = hex;
  const stop = data.fillData.gradient.stops[idx];

  const colorInput = document.getElementById(`textGradStopColor_${idx}`);
  if (colorInput) {
    colorInput.style.background = hexToRgba(hex, stop.opacity / 100);
    colorInput.value = hex;
  }
  const hexInput = document.getElementById(`textGradStopHex_${idx}`);
  if (hexInput && document.activeElement !== hexInput) {
    hexInput.value = hex.replace('#', '');
  }

  updateTextGradientPreview();
  applyFillStroke();
}

function updateTextStopHex(idx, str) {
  if (str.length === 6 && /^[0-9a-fA-F]{6}$/.test(str)) {
    const hex = '#' + str;
    const data = elements.find(i => i.id === selectedElementId);
    if (!data || !data.fillData || !data.fillData.gradient) return;
    data.fillData.gradient.stops[idx].color = hex;
    const stop = data.fillData.gradient.stops[idx];

    const colorInput = document.getElementById(`textGradStopColor_${idx}`);
    if (colorInput) {
      colorInput.style.background = hexToRgba(hex, stop.opacity / 100);
      colorInput.value = hex;
    }

    updateTextGradientPreview();
    applyFillStroke();
  }
}

function updateTextStopOpacity(idx, val) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.fillData || !data.fillData.gradient) return;
  const op = Math.max(0, Math.min(100, val));
  data.fillData.gradient.stops[idx].opacity = op;
  const stop = data.fillData.gradient.stops[idx];

  const colorInput = document.getElementById(`textGradStopColor_${idx}`);
  if (colorInput) {
    colorInput.style.background = hexToRgba(stop.color, op / 100);
  }

  updateTextGradientPreview();
  applyFillStroke();
}

function renderFillPanel() {
  const fd = currentFillData;
  const body = document.getElementById('fillBodyPanel');
  const eyeBtn = document.getElementById('btnFillToggle');
  if (!fd || !body || !eyeBtn) return;

  eyeBtn.classList.toggle('fs-active', fd.enabled);
  body.classList.toggle('hidden', !fd.enabled);
  if (!fd.enabled) {
    closeFillPopover();
    return;
  }

  updateFillTriggerSummary();

  ['Solid', 'Linear', 'Radial'].forEach(t => {
    const tab = document.getElementById('tab' + t);
    if (tab) tab.classList.toggle('active', fd.type === t.toLowerCase());
  });

  const isSolid = fd.type === 'solid';
  const solidRow = document.getElementById('solidFillRow');
  const solidOp = document.getElementById('solidOpacityRow');
  const gradPanel = document.getElementById('gradientFillPanel');
  const gradAngle = document.getElementById('gradAngleRow');

  if (solidRow) solidRow.classList.toggle('hidden', !isSolid);
  if (solidOp) solidOp.classList.toggle('hidden', !isSolid);
  if (gradPanel) gradPanel.classList.toggle('hidden', isSolid);
  if (gradAngle) gradAngle.classList.toggle('hidden', fd.type !== 'linear');

  if (isSolid) {
    const el = id => document.getElementById(id);
    if (el('fillColorInput')) {
      el('fillColorInput').value = fd.color;
      el('fillColorInput').style.background = hexToRgba(fd.color, fd.opacity / 100);
    }
    if (el('fillHexInput')) el('fillHexInput').value = fd.color.replace('#', '');
    if (el('fillOpacityInput')) el('fillOpacityInput').value = fd.opacity;
    if (el('fillOpacitySlider')) el('fillOpacitySlider').value = fd.opacity;
  } else {
    updateGradientPreview();
    renderGradientStops();
    const g = fd.gradient;
    if (g) {
      const a = g.angle || 135;
      const el = id => document.getElementById(id);
      if (el('gradAngleSlider')) el('gradAngleSlider').value = a;
      if (el('gradAngleInput')) el('gradAngleInput').value = a;
      if (el('gradAngleLbl')) el('gradAngleLbl').innerText = a;
    }
  }
}

function renderStrokePanel() {
  const sd = currentStrokeData;
  const body = document.getElementById('strokeBodyPanel');
  const eyeBtn = document.getElementById('btnStrokeToggle');
  if (!sd || !body || !eyeBtn) return;

  eyeBtn.classList.toggle('fs-active', sd.enabled);
  body.classList.toggle('hidden', !sd.enabled);
  if (!sd.enabled) {
    closeStrokePopover();
    return;
  }

  updateStrokeTriggerSummary();

  ['Solid', 'Linear', 'Radial'].forEach(t => {
    const tab = document.getElementById('strokeTab' + t);
    if (tab) tab.classList.toggle('active', (sd.type || 'solid') === t.toLowerCase());
  });

  const isSolid = !sd.type || sd.type === 'solid';
  const solidRow = document.getElementById('solidStrokeRow');
  const solidOp = document.getElementById('solidStrokeOpacityRow');
  const gradPanel = document.getElementById('gradientStrokePanel');
  const gradAngle = document.getElementById('gradStrokeAngleRow');

  if (solidRow) solidRow.classList.toggle('hidden', !isSolid);
  if (solidOp) solidOp.classList.toggle('hidden', !isSolid);
  if (gradPanel) gradPanel.classList.toggle('hidden', isSolid);
  if (gradAngle) gradAngle.classList.toggle('hidden', sd.type !== 'linear');

  const el = id => document.getElementById(id);

  if (isSolid) {
    if (el('strokeColorInput')) {
      el('strokeColorInput').value = sd.color || '#38a0c4';
      el('strokeColorInput').style.background = hexToRgba(sd.color || '#38a0c4', (sd.opacity !== undefined ? sd.opacity : 100) / 100);
    }
    if (el('strokeHexInput')) el('strokeHexInput').value = (sd.color || '#38a0c4').replace('#', '');
    if (el('strokeOpacityInput')) el('strokeOpacityInput').value = sd.opacity !== undefined ? sd.opacity : 100;
    if (el('strokeOpacitySlider')) el('strokeOpacitySlider').value = sd.opacity !== undefined ? sd.opacity : 100;
  } else {
    updateStrokeGradientPreview();
    renderStrokeGradientStops();
    const g = sd.gradient;
    if (g) {
      const a = g.angle || 135;
      if (el('gradStrokeAngleSlider')) el('gradStrokeAngleSlider').value = a;
      if (el('gradStrokeAngleInput')) el('gradStrokeAngleInput').value = a;
      if (el('gradStrokeAngleLbl')) el('gradStrokeAngleLbl').innerText = a;
    }
  }

  if (el('propBorderStyle')) el('propBorderStyle').value = sd.style || 'solid';
  if (el('strokeWeightSlider')) el('strokeWeightSlider').value = Math.min(sd.width || 1, 20);
  if (el('strokeWeightInput')) el('strokeWeightInput').value = sd.width || 1;
  if (el('strokeWeightLbl')) el('strokeWeightLbl').innerText = sd.width || 1;
}

function updateGradientPreview() {
  const fd = currentFillData;
  const bar = document.getElementById('gradPreviewBar');
  if (!fd || !fd.gradient || !bar) return;
  bar.style.background = buildGradientCss(fd);

  if (!bar.dataset.hasListener) {
    bar.dataset.hasListener = "true";
    bar.addEventListener('click', (e) => {
      const rect = bar.getBoundingClientRect();
      const percent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      addGradientStopAt(percent);
    });
  }
}

function addGradientStopAt(percent) {
  if (!currentFillData) return;
  if (!currentFillData.gradient) {
    currentFillData.gradient = {
      angle: 135,
      stops: [
        { position: 0, color: currentFillData.color || '#38a0c4', opacity: 100 },
        { position: 100, color: '#ffffff', opacity: 100 }
      ]
    };
  }
  const stops = currentFillData.gradient.stops;
  stops.push({ position: percent, color: '#ffffff', opacity: 100 });
  stops.sort((a, b) => a.position - b.position);
  updateGradientPreview();
  renderGradientStops();
  applyFillStroke();
}

function renderGradientStops() {
  const fd = currentFillData;
  const list = document.getElementById('gradStopsList');
  if (!fd || !fd.gradient || !list) return;
  list.innerHTML = '';

  fd.gradient.stops.forEach((stop, idx) => {
    const row = document.createElement('div');
    row.className = 'grad-stop-row';
    const canDel = fd.gradient.stops.length > 2;
    row.innerHTML = `
      <input type="number" id="gradStopPos_${idx}" class="fs-pos-input" value="${stop.position}" min="0" max="100"
        oninput="updateStopPosition(${idx}, parseInt(this.value)||0)" />
      <span class="fs-percent-sm">%</span>
      <input type="color" id="gradStopColor_${idx}" class="fs-swatch-input fs-swatch-sm" value="${stop.color}"
        oninput="updateStopColor(${idx}, this.value)" style="background:${hexToRgba(stop.color, stop.opacity / 100)}" />
      <input type="text" id="gradStopHex_${idx}" class="fs-hex-input fs-hex-sm" value="${stop.color.replace('#', '')}" maxlength="6"
        oninput="updateStopHex(${idx}, this.value)" />
      <input type="number" id="gradStopOpacity_${idx}" class="fs-opacity-input" value="${stop.opacity}" min="0" max="100"
        oninput="updateStopOpacity(${idx}, parseInt(this.value)||0)" />
      <span class="fs-percent-sm">%</span>
      ${canDel ? `<button class="fs-del-stop-btn" onclick="removeGradientStop(${idx})">&#8212;</button>` : '<span style="width:22px;flex-shrink:0"></span>'}
    `;
    list.appendChild(row);
  });
}

function toggleFillEnabled() {
  if (!currentFillData) return;
  currentFillData.enabled = !currentFillData.enabled;
  renderFillPanel();
  applyFillStroke();
}

function setFillType(type) {
  if (!currentFillData) return;
  currentFillData.type = type;
  if (!currentFillData.gradient) {
    currentFillData.gradient = {
      angle: 135,
      stops: [
        { position: 0, color: currentFillData.color || '#38a0c4', opacity: currentFillData.opacity !== undefined ? currentFillData.opacity : 100 },
        { position: 100, color: '#ffffff', opacity: 100 }
      ]
    };
  }
  renderFillPanel();
  applyFillStroke();
}

function onFillSolidColor(hex) {
  if (!currentFillData) return;
  currentFillData.color = hex;
  const sw = document.getElementById('fillColorInput');
  const hi = document.getElementById('fillHexInput');
  if (sw) sw.style.background = hexToRgba(hex, (currentFillData.opacity !== undefined ? currentFillData.opacity : 100) / 100);
  if (hi) hi.value = hex.replace('#', '');
  applyFillStroke();
  updateFillTriggerSummary();
}

function onFillHexText(str) {
  if (str.length === 6 && /^[0-9a-fA-F]{6}$/.test(str)) {
    const hex = '#' + str;
    onFillSolidColor(hex);
    const ci = document.getElementById('fillColorInput');
    if (ci) ci.value = hex;
  }
}

function onFillOpacity(val) {
  if (!currentFillData) return;
  currentFillData.opacity = Math.max(0, Math.min(100, parseInt(val) || 0));
  const sw = document.getElementById('fillColorInput');
  if (sw) sw.style.background = hexToRgba(currentFillData.color, currentFillData.opacity / 100);
  applyFillStroke();
  updateFillTriggerSummary();
}

function onGradientAngleChange(val) {
  if (!currentFillData || !currentFillData.gradient) return;
  currentFillData.gradient.angle = parseInt(val) || 135;
  updateGradientPreview();
  applyFillStroke();
  updateFillTriggerSummary();
}

function addGradientStop() {
  if (!currentFillData || !currentFillData.gradient) return;
  const stops = currentFillData.gradient.stops;
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  let bestPos = 50, maxGap = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1].position - sorted[i].position;
    if (gap > maxGap) {
      maxGap = gap;
      bestPos = Math.round((sorted[i].position + sorted[i + 1].position) / 2);
    }
  }
  stops.push({ position: bestPos, color: '#ffffff', opacity: 100 });
  stops.sort((a, b) => a.position - b.position);
  updateGradientPreview();
  renderGradientStops();
  applyFillStroke();
}

function removeGradientStop(idx) {
  if (!currentFillData || !currentFillData.gradient) return;
  if (currentFillData.gradient.stops.length <= 2) return;
  currentFillData.gradient.stops.splice(idx, 1);
  updateGradientPreview();
  renderGradientStops();
  applyFillStroke();
}

function updateStopPosition(idx, val) {
  if (!currentFillData || !currentFillData.gradient) return;
  const pos = Math.max(0, Math.min(100, val));
  currentFillData.gradient.stops[idx].position = pos;

  const posInput = document.getElementById(`gradStopPos_${idx}`);
  if (posInput && document.activeElement !== posInput) {
    posInput.value = pos;
  }
  updateGradientPreview();
  applyFillStroke();
}

function updateStopColor(idx, hex) {
  if (!currentFillData || !currentFillData.gradient) return;
  currentFillData.gradient.stops[idx].color = hex;
  const stop = currentFillData.gradient.stops[idx];

  const colorInput = document.getElementById(`gradStopColor_${idx}`);
  if (colorInput) {
    colorInput.style.background = hexToRgba(hex, stop.opacity / 100);
    colorInput.value = hex;
  }
  const hexInput = document.getElementById(`gradStopHex_${idx}`);
  if (hexInput && document.activeElement !== hexInput) {
    hexInput.value = hex.replace('#', '');
  }

  updateGradientPreview();
  applyFillStroke();
}

function updateStopHex(idx, str) {
  if (str.length === 6 && /^[0-9a-fA-F]{6}$/.test(str)) {
    const hex = '#' + str;
    if (!currentFillData || !currentFillData.gradient) return;
    currentFillData.gradient.stops[idx].color = hex;
    const stop = currentFillData.gradient.stops[idx];

    const colorInput = document.getElementById(`gradStopColor_${idx}`);
    if (colorInput) {
      colorInput.style.background = hexToRgba(hex, stop.opacity / 100);
      colorInput.value = hex;
    }

    updateGradientPreview();
    applyFillStroke();
  }
}

function updateStopOpacity(idx, val) {
  if (!currentFillData || !currentFillData.gradient) return;
  const op = Math.max(0, Math.min(100, val));
  currentFillData.gradient.stops[idx].opacity = op;
  const stop = currentFillData.gradient.stops[idx];

  const colorInput = document.getElementById(`gradStopColor_${idx}`);
  if (colorInput) {
    colorInput.style.background = hexToRgba(stop.color, op / 100);
  }

  updateGradientPreview();
  applyFillStroke();
}

function toggleStrokeEnabled() {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.strokeData) return;
  data.strokeData.enabled = !data.strokeData.enabled;
  currentStrokeData = data.strokeData;
  renderStrokePanel();
  applyFillStroke();
}

function setStrokeType(type) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.strokeData) return;
  data.strokeData.type = type;
  if (!data.strokeData.gradient) {
    data.strokeData.gradient = {
      angle: 135,
      stops: [
        { position: 0, color: data.strokeData.color || '#38a0c4', opacity: 100 },
        { position: 100, color: '#ffffff', opacity: 100 }
      ]
    };
  }
  currentStrokeData = data.strokeData;
  renderStrokePanel();
  applyFillStroke();
}

function updateStrokeGradientPreview() {
  const sd = currentStrokeData;
  const bar = document.getElementById('gradStrokePreviewBar');
  if (!sd || !sd.gradient || !bar) return;
  bar.style.background = buildGradientCss(sd);

  if (!bar.dataset.hasListener) {
    bar.dataset.hasListener = "true";
    bar.addEventListener('click', (e) => {
      const rect = bar.getBoundingClientRect();
      const percent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      addStrokeGradientStopAt(percent);
    });
  }
}

function addStrokeGradientStopAt(percent) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.strokeData || !data.strokeData.gradient) return;
  const stops = data.strokeData.gradient.stops;
  stops.push({ position: percent, color: '#ffffff', opacity: 100 });
  stops.sort((a, b) => a.position - b.position);
  currentStrokeData = data.strokeData;
  updateStrokeGradientPreview();
  renderStrokeGradientStops();
  applyFillStroke();
}

function renderStrokeGradientStops() {
  const sd = currentStrokeData;
  const list = document.getElementById('gradStrokeStopsList');
  if (!sd || !sd.gradient || !list) return;
  list.innerHTML = '';

  sd.gradient.stops.forEach((stop, idx) => {
    const row = document.createElement('div');
    row.className = 'grad-stop-row';
    const canDel = sd.gradient.stops.length > 2;
    row.innerHTML = `
      <input type="number" id="gradStrokeStopPos_${idx}" class="fs-pos-input" value="${stop.position}" min="0" max="100"
        oninput="updateStrokeStopPosition(${idx}, parseInt(this.value)||0)" />
      <span class="fs-percent-sm">%</span>
      <input type="color" id="gradStrokeStopColor_${idx}" class="fs-swatch-input fs-swatch-sm" value="${stop.color}"
        oninput="updateStrokeStopColor(${idx}, this.value)" style="background:${hexToRgba(stop.color, stop.opacity / 100)}" />
      <input type="text" id="gradStrokeStopHex_${idx}" class="fs-hex-input fs-hex-sm" value="${stop.color.replace('#', '')}" maxlength="6"
        oninput="updateStrokeStopHex(${idx}, this.value)" />
      <input type="number" id="gradStrokeStopOpacity_${idx}" class="fs-opacity-input" value="${stop.opacity}" min="0" max="100"
        oninput="updateStrokeStopOpacity(${idx}, parseInt(this.value)||0)" />
      <span class="fs-percent-sm">%</span>
      ${canDel ? `<button class="fs-del-stop-btn" onclick="removeStrokeGradientStop(${idx})">&#8212;</button>` : '<span style="width:22px;flex-shrink:0"></span>'}
    `;
    list.appendChild(row);
  });
}

function onStrokeGradientAngleChange(val) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.strokeData || !data.strokeData.gradient) return;
  data.strokeData.gradient.angle = parseInt(val) || 135;
  currentStrokeData = data.strokeData;
  updateStrokeGradientPreview();
  applyFillStroke();
  updateStrokeTriggerSummary();
}

function addStrokeGradientStop() {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.strokeData || !data.strokeData.gradient) return;
  const stops = data.strokeData.gradient.stops;
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  let bestPos = 50, maxGap = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1].position - sorted[i].position;
    if (gap > maxGap) {
      maxGap = gap;
      bestPos = Math.round((sorted[i].position + sorted[i + 1].position) / 2);
    }
  }
  stops.push({ position: bestPos, color: '#ffffff', opacity: 100 });
  stops.sort((a, b) => a.position - b.position);
  currentStrokeData = data.strokeData;
  updateStrokeGradientPreview();
  renderStrokeGradientStops();
  applyFillStroke();
}

function removeStrokeGradientStop(idx) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.strokeData || !data.strokeData.gradient) return;
  if (data.strokeData.gradient.stops.length <= 2) return;
  data.strokeData.gradient.stops.splice(idx, 1);
  currentStrokeData = data.strokeData;
  updateStrokeGradientPreview();
  renderStrokeGradientStops();
  applyFillStroke();
}

function updateStrokeStopPosition(idx, val) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.strokeData || !data.strokeData.gradient) return;
  const pos = Math.max(0, Math.min(100, val));
  data.strokeData.gradient.stops[idx].position = pos;

  const posInput = document.getElementById(`gradStrokeStopPos_${idx}`);
  if (posInput && document.activeElement !== posInput) {
    posInput.value = pos;
  }
  updateStrokeGradientPreview();
  applyFillStroke();
}

function updateStrokeStopColor(idx, hex) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.strokeData || !data.strokeData.gradient) return;
  data.strokeData.gradient.stops[idx].color = hex;
  const stop = data.strokeData.gradient.stops[idx];

  const colorInput = document.getElementById(`gradStrokeStopColor_${idx}`);
  if (colorInput) {
    colorInput.style.background = hexToRgba(hex, stop.opacity / 100);
    colorInput.value = hex;
  }
  const hexInput = document.getElementById(`gradStrokeStopHex_${idx}`);
  if (hexInput && document.activeElement !== hexInput) {
    hexInput.value = hex.replace('#', '');
  }

  updateStrokeGradientPreview();
  applyFillStroke();
}

function updateStrokeStopHex(idx, str) {
  if (str.length === 6 && /^[0-9a-fA-F]{6}$/.test(str)) {
    const hex = '#' + str;
    const data = elements.find(i => i.id === selectedElementId);
    if (!data || !data.strokeData || !data.strokeData.gradient) return;
    data.strokeData.gradient.stops[idx].color = hex;
    const stop = data.strokeData.gradient.stops[idx];

    const colorInput = document.getElementById(`gradStrokeStopColor_${idx}`);
    if (colorInput) {
      colorInput.style.background = hexToRgba(hex, stop.opacity / 100);
      colorInput.value = hex;
    }

    updateStrokeGradientPreview();
    applyFillStroke();
  }
}

function updateStrokeStopOpacity(idx, val) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.strokeData || !data.strokeData.gradient) return;
  const op = Math.max(0, Math.min(100, val));
  data.strokeData.gradient.stops[idx].opacity = op;
  const stop = data.strokeData.gradient.stops[idx];

  const colorInput = document.getElementById(`gradStrokeStopColor_${idx}`);
  if (colorInput) {
    colorInput.style.background = hexToRgba(stop.color, op / 100);
  }

  updateStrokeGradientPreview();
  applyFillStroke();
}

function onStrokeSolidColor(hex) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.strokeData) return;
  data.strokeData.color = hex;
  currentStrokeData = data.strokeData;
  const sw = document.getElementById('strokeColorInput');
  const hi = document.getElementById('strokeHexInput');
  if (sw) sw.style.background = hexToRgba(hex, (data.strokeData.opacity !== undefined ? data.strokeData.opacity : 100) / 100);
  if (hi) hi.value = hex.replace('#', '');
  applyFillStroke();
  updateStrokeTriggerSummary();
}

function onStrokeColor(hex) {
  onStrokeSolidColor(hex);
}

function onStrokeHexText(str) {
  if (str.length === 6 && /^[0-9a-fA-F]{6}$/.test(str)) {
    const hex = '#' + str;
    onStrokeSolidColor(hex);
    const ci = document.getElementById('strokeColorInput');
    if (ci) ci.value = hex;
  }
}

function onStrokeOpacity(val) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.strokeData) return;
  data.strokeData.opacity = Math.max(0, Math.min(100, parseInt(val) || 0));
  currentStrokeData = data.strokeData;
  const sw = document.getElementById('strokeColorInput');
  if (sw) sw.style.background = hexToRgba(data.strokeData.color, data.strokeData.opacity / 100);
  applyFillStroke();
  updateStrokeTriggerSummary();
}

function onStrokeWeight(val) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.strokeData) return;
  data.strokeData.width = Math.max(1, parseInt(val) || 1);
  applyFillStroke();
}

function onStrokeStyleChange(style) {
  const data = elements.find(i => i.id === selectedElementId);
  if (!data || !data.strokeData) return;
  data.strokeData.style = style;
  applyFillStroke();
}

// ══════════════════════════════════════════════════════════════
// BOX INTERAKTIF CONFIGURATION FUNCTIONS
// ══════════════════════════════════════════════════════════════
function isBoxInteraktifType(type) {
  return type === "box-interaktif" || type === "box_interaktif";
}

function renderBoxItemsListContainer(el) {
  if (!el) {
    el = elements.find(item => item.id === selectedElementId);
  }
  if (!el || !isBoxInteraktifType(el.type)) return;

  const cfg = el.boxConfig || {};
  const mode = cfg.mode || "expand_collapse";

  const boxItemsManagerRow = document.getElementById("boxItemsManagerRow");
  const boxFlipManagerRow = document.getElementById("boxFlipManagerRow");
  const boxButtonIntegrationRow = document.getElementById("boxButtonIntegrationRow");
  const boxItemsListContainer = document.getElementById("boxItemsListContainer");
  const boxItemsManagerLabel = document.getElementById("boxItemsManagerLabel");
  const btnAddSlide = document.getElementById("btnBoxAddItem") || document.querySelector("#boxItemsManagerRow .btn-box-add-item");

  if (mode === "flippable") {
    if (boxItemsManagerRow) boxItemsManagerRow.classList.add("hidden");
    if (boxFlipManagerRow) boxFlipManagerRow.classList.remove("hidden");
    if (boxButtonIntegrationRow) boxButtonIntegrationRow.classList.add("hidden");

    const frontBtn = document.getElementById("btnFlipSideFront");
    const backBtn = document.getElementById("btnFlipSideBack");
    if (frontBtn && backBtn) {
      frontBtn.classList.toggle("active", !cfg.isFlipped);
      backBtn.classList.toggle("active", !!cfg.isFlipped);
    }
    return;
  }

  if (boxItemsManagerRow) boxItemsManagerRow.classList.remove("hidden");
  if (boxFlipManagerRow) boxFlipManagerRow.classList.add("hidden");

  if (mode === "checkbox" || mode === "radio") {
    if (boxButtonIntegrationRow) {
      boxButtonIntegrationRow.classList.remove("hidden");
      const sendCb = document.getElementById("propBoxSendDataToButton");
      if (sendCb) sendCb.checked = (cfg.sendDataToButton !== undefined) ? !!cfg.sendDataToButton : true;
      if (cfg.sendDataToButton === undefined) cfg.sendDataToButton = true;
      const msgInput = document.getElementById("propBoxMessageText");
      if (msgInput) msgInput.value = cfg.messageText !== undefined ? cfg.messageText : "Pilihan Saya: {pilihan}";
    }
    if (mode === "checkbox") {
      if (boxItemsManagerLabel) boxItemsManagerLabel.innerText = "Daftar Opsi Checkbox";
      if (btnAddSlide) btnAddSlide.innerText = "+ Tambah Opsi Checkbox";
      if (!cfg.items || !cfg.items.length) {
        cfg.items = [
          { title: "Pilihan 1", checked: false },
          { title: "Pilihan 2", checked: false }
        ];
      }
    } else {
      if (boxItemsManagerLabel) boxItemsManagerLabel.innerText = "Daftar Opsi Radio Button";
      if (btnAddSlide) btnAddSlide.innerText = "+ Tambah Opsi Radio";
      if (!cfg.items || !cfg.items.length) {
        cfg.items = [
          { title: "Opsi A", checked: true },
          { title: "Opsi B", checked: false }
        ];
      }
    }
  } else {
    if (boxButtonIntegrationRow) boxButtonIntegrationRow.classList.add("hidden");
    if (mode === "tabs") {
      if (boxItemsManagerLabel) boxItemsManagerLabel.innerText = "Daftar Judul Tab";
      if (btnAddSlide) btnAddSlide.innerText = "+ Tambah Tab";
      if (!cfg.tabs) cfg.tabs = [{ title: "Tab 1" }, { title: "Tab 2" }, { title: "Tab 3" }];
    } else {
      if (boxItemsManagerLabel) boxItemsManagerLabel.innerText = "Daftar Judul Panel";
      if (btnAddSlide) btnAddSlide.innerText = "+ Tambah Panel";
      if (!cfg.items) cfg.items = [{ title: "Judul Panel 1" }, { title: "Judul Panel 2" }, { title: "Judul Panel 3" }];
    }
  }

  const list = mode === "tabs" ? cfg.tabs : cfg.items;

  if (boxItemsListContainer) {
    boxItemsListContainer.innerHTML = "";
    list.forEach((item, idx) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.gap = "6px";
      row.style.alignItems = "center";

      if (mode === "checkbox" || mode === "radio") {
        const toggleCheck = document.createElement("input");
        toggleCheck.type = mode === "radio" ? "radio" : "checkbox";
        toggleCheck.className = mode === "radio" ? "custom-radio" : "custom-checkbox";
        toggleCheck.name = `boxOptChecked_${el.id}`;
        toggleCheck.checked = !!item.checked;
        toggleCheck.title = "Default Dipilih / Dicentang";
        toggleCheck.onchange = (e) => {
          if (mode === "radio") {
            list.forEach((it, iIdx) => {
              it.checked = (iIdx === idx);
            });
          } else {
            item.checked = e.target.checked;
          }
          renderCanvas();
          renderBoxItemsListContainer(el);
          if (typeof pushHistory === "function") pushHistory();
        };
        row.appendChild(toggleCheck);
      }

      const input = document.createElement("input");
      input.type = "text";
      input.className = "prop-input";
      input.value = item.title || "";
      input.placeholder = mode === "tabs" ? `Judul Tab ${idx + 1}` : (mode === "radio" ? `Opsi ${idx + 1}` : (mode === "checkbox" ? `Pilihan ${idx + 1}` : `Judul Panel ${idx + 1}`));
      input.style.flex = "1";
      input.style.fontSize = "12px";
      input.style.padding = "4px 8px";
      input.oninput = (e) => updateBoxInteractiveItemTitle(idx, e.target.value);

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.title = "Hapus Item";
      delBtn.className = "btn-item-delete-svg";
      delBtn.innerHTML = `<img src="/static/image/icon/delete.svg" style="width: 14px; height: 14px;" alt="Hapus" />`;
      delBtn.onclick = () => deleteBoxInteractiveItem(idx);

      row.appendChild(input);
      if (list.length > 1) {
        row.appendChild(delBtn);
      }
      boxItemsListContainer.appendChild(row);
    });
  }
}

function updateBoxInteractiveItemTitle(idx, value) {
  if (!selectedElementId) return;
  const el = elements.find(item => item.id === selectedElementId);
  const cfg = el ? el.boxConfig : null;
  if (!el || !isBoxInteraktifType(el.type) || !cfg) return;

  const mode = cfg.mode || "expand_collapse";
  const list = mode === "tabs" ? (cfg.tabs ||= []) : (cfg.items ||= []);
  if (list[idx]) {
    list[idx].title = value;
    renderCanvas();
    if (typeof pushHistory === "function") pushHistory();
  }
}

function addBoxInteractiveItem() {
  if (!selectedElementId) return;
  const el = elements.find(item => item.id === selectedElementId);
  const cfg = el ? el.boxConfig : null;
  if (!el || !isBoxInteraktifType(el.type) || !cfg) return;

  const mode = cfg.mode || "expand_collapse";
  if (mode === "tabs") {
    if (!cfg.tabs) cfg.tabs = [];
    cfg.tabs.push({ title: `Tab ${cfg.tabs.length + 1}` });
  } else if (mode === "checkbox") {
    if (!cfg.items) cfg.items = [];
    cfg.items.push({ title: `Pilihan ${cfg.items.length + 1}`, checked: false });
  } else if (mode === "radio") {
    if (!cfg.items) cfg.items = [];
    cfg.items.push({ title: `Opsi ${String.fromCharCode(65 + (cfg.items.length % 26))}`, checked: false });
  } else {
    if (!cfg.items) cfg.items = [];
    cfg.items.push({ title: `Judul Panel ${cfg.items.length + 1}` });
  }

  renderBoxItemsListContainer(el);
  renderCanvas();
  if (typeof pushHistory === "function") pushHistory();
}

function deleteBoxInteractiveItem(idx) {
  if (!selectedElementId) return;
  const el = elements.find(item => item.id === selectedElementId);
  const cfg = el ? el.boxConfig : null;
  if (!el || !isBoxInteraktifType(el.type) || !cfg) return;

  const mode = cfg.mode || "expand_collapse";
  const list = mode === "tabs" ? cfg.tabs : cfg.items;

  if (list && list.length > 1) {
    list.splice(idx, 1);
    if (mode === "tabs" && cfg.activeTabIndex >= list.length) {
      cfg.activeTabIndex = list.length - 1;
    }
    if (mode === "expand_collapse" && cfg.activeItemIndex >= list.length) {
      cfg.activeItemIndex = list.length - 1;
    }
    renderBoxItemsListContainer(el);
    renderCanvas();
    if (typeof pushHistory === "function") pushHistory();
  }
}

function toggleBoxInteractiveFlip(isFlipped) {
  if (!selectedElementId) return;
  const el = elements.find(item => item.id === selectedElementId);
  const cfg = el ? el.boxConfig : null;
  if (!el || !isBoxInteraktifType(el.type) || !cfg) return;

  cfg.isFlipped = isFlipped;

  const frontBtn = document.getElementById("btnFlipSideFront");
  const backBtn = document.getElementById("btnFlipSideBack");
  if (frontBtn && backBtn) {
    frontBtn.classList.toggle("active", !isFlipped);
    backBtn.classList.toggle("active", isFlipped);
  }

  renderCanvas();
  if (typeof pushHistory === "function") pushHistory();
}

function updateBoxInteraktifConfig(key, value) {
  if (!selectedElementId) return;
  const el = elements.find(item => item.id === selectedElementId);
  if (!el || !isBoxInteraktifType(el.type)) return;

  if (!el.boxConfig) {
    el.boxConfig = {
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
  }

  el.boxConfig[key] = value;

  const setLabel = (id, val) => {
    const dom = document.getElementById(id);
    if (dom) dom.innerText = val;
  };

  if (key === "bgColor") setLabel("propBoxBgColorHex", value);
  if (key === "itemBgColor") setLabel("propBoxItemBgColorHex", value);
  if (key === "headerColor") setLabel("propBoxHeaderColorHex", value);
  if (key === "accentColor") setLabel("propBoxAccentColorHex", value);

  if (key === "mode") {
    document.querySelectorAll("#groupBoxInteraktif .box-design-card").forEach(card => {
      card.classList.toggle("active", card.getAttribute("data-design") === value);
    });
    renderBoxItemsListContainer(el);
  }

  renderCanvas();
  if (typeof pushHistory === "function") pushHistory();
}

window.updateBoxInteraktifConfig = updateBoxInteraktifConfig;
window.renderBoxItemsListContainer = renderBoxItemsListContainer;
window.updateBoxInteractiveItemTitle = updateBoxInteractiveItemTitle;
window.addBoxInteractiveItem = addBoxInteractiveItem;
window.deleteBoxInteractiveItem = deleteBoxInteractiveItem;
window.toggleBoxInteractiveFlip = toggleBoxInteractiveFlip;
window.openFillPopoverForTarget = openFillPopoverForTarget;
window.updateCarouselColorTriggers = updateCarouselColorTriggers;
window.updateBtnTextColorTrigger = updateBtnTextColorTrigger;
window.updateButtonInputColorTriggers = updateButtonInputColorTriggers;
window.updateMediaEmbedColorTriggers = updateMediaEmbedColorTriggers;
window.updatePageBgColorTrigger = updatePageBgColorTrigger;
window.updateTitleColorTriggers = updateTitleColorTriggers;
window.updateBoxInteractiveColorTriggers = updateBoxInteractiveColorTriggers;
window.updateSelectedElementHeadingTag = updateSelectedElementHeadingTag;
window.updateSelectedElementTitleStrokeWidth = updateSelectedElementTitleStrokeWidth;
window.updateSelectedElementTitleShadowBlur = updateSelectedElementTitleShadowBlur;
window.updateSelectedElementTitleShadowOffsetX = updateSelectedElementTitleShadowOffsetX;
window.updateSelectedElementTitleShadowOffsetY = updateSelectedElementTitleShadowOffsetY;
window.updateSelectedElementTextListMode = updateSelectedElementTextListMode;




