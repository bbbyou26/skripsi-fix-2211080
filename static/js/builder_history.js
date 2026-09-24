/* ==========================================
   PROMOTION PAGE BUILDER - UNDO / REDO HISTORY SYSTEM
   ========================================== */

let pushHistoryTimeout = null;
function pushHistoryDebounced() {
  if (pushHistoryTimeout) {
    clearTimeout(pushHistoryTimeout);
  }
  pushHistoryTimeout = setTimeout(() => {
    pushHistory();
  }, 500);
}

function getHistoryState() {
  const bgTypeSelect = document.getElementById("bgType");
  return {
    elements: JSON.parse(JSON.stringify(elements)),
    background: {
      type: bgTypeSelect ? bgTypeSelect.value : "color",
      style: canvas.style.background || "#f2f7f9",
      color: window.pageBgFillData ? window.pageBgFillData.color : "#f2f7f9",
      fillData: window.pageBgFillData ? JSON.parse(JSON.stringify(window.pageBgFillData)) : null
    }
  };
}

function pushHistory() {
  const state = getHistoryState();
  const stateStr = JSON.stringify(state);

  // Prevent duplicate states consecutively
  if (undoStack.length > 0 && undoStack[undoStack.length - 1] === stateStr) {
    return;
  }

  undoStack.push(stateStr);
  if (undoStack.length > MAX_HISTORY_LIMIT) {
    undoStack.shift();
  }

  // Clear redo stack when a new action is performed
  redoStack = [];
  updateUndoRedoButtons();
}

function undo() {
  if (undoStack.length <= 1) return;

  const currentState = undoStack.pop();
  redoStack.push(currentState);

  const prevStateStr = undoStack[undoStack.length - 1];
  const prevState = JSON.parse(prevStateStr);

  applyHistoryState(prevState);
}

function redo() {
  if (redoStack.length === 0) return;

  const nextStateStr = redoStack.pop();
  undoStack.push(nextStateStr);

  const nextState = JSON.parse(nextStateStr);

  applyHistoryState(nextState);
}

function applyHistoryState(stateObj) {
  elements = stateObj.elements;

  if (stateObj.background) {
    canvas.style.background = stateObj.background.style;
    const bgTypeSelect = document.getElementById("bgType");
    if (bgTypeSelect) {
      bgTypeSelect.value = stateObj.background.type || "color";
      if (stateObj.background.fillData) {
        window.pageBgFillData = JSON.parse(JSON.stringify(stateObj.background.fillData));
      }
      if (typeof updatePageBgColorTrigger === "function") {
        updatePageBgColorTrigger();
      }
    }
  }

  if (selectedElementId && !elements.some(item => item.id === selectedElementId)) {
    if (typeof deselectAll === "function") deselectAll();
  } else {
    const currentSelectedId = selectedElementId;
    if (typeof renderCanvas === "function") renderCanvas();
    if (currentSelectedId && typeof selectElement === "function") {
      selectElement(currentSelectedId);
    }
  }

  updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
  const undoBtn = document.getElementById("btnUndo");
  const redoBtn = document.getElementById("btnRedo");

  if (undoBtn) {
    undoBtn.disabled = undoStack.length <= 1;
  }
  if (redoBtn) {
    redoBtn.disabled = redoStack.length === 0;
  }
}

// Global change listener to push history for properties drawer commits
document.addEventListener("change", (e) => {
  const drawer = document.getElementById("propertiesDrawer");
  if (drawer && drawer.contains(e.target)) {
    pushHistory();
  }
});

// Keyboard shortcuts for Undo/Redo
document.addEventListener("keydown", (e) => {
  if (!isEditMode) return;

  const isTextInput = (e.target.tagName === "TEXTAREA" || (e.target.tagName === "INPUT" && ["text", "number", "email", "url", "password", "search"].includes(e.target.type)));
  if (isTextInput) return;

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
    e.preventDefault();
    if (e.shiftKey) {
      redo();
    } else {
      undo();
    }
  }

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
    e.preventDefault();
    redo();
  }
});
