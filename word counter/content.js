let popup;
let hideTimeout;

function createPopup() {
  if (popup) return popup;

  popup = document.createElement("div");
  popup.id = "selection-counter-popup";
  document.body.appendChild(popup);

  return popup;
}

function getSelectedText() {
  let text = "";

  if (window.getSelection) {
    text = window.getSelection().toString();
  }

  const active = document.activeElement;
  if (!text && active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT")) {
    text = active.value.substring(active.selectionStart, active.selectionEnd);
  }

  return text.trim();
}

function showPopup(text, x, y) {
  if (!text) return;

  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const chars = text.length;

  const p = createPopup();

  p.innerHTML = `
    <div class="sc-box">
      <span><b>${words}</b> words</span>
      <span><b>${chars}</b> chars</span>
    </div>
  `;

  p.style.left = (x || 100) + "px";
  p.style.top = ((y || 100) - 50) + "px";

  p.classList.add("visible");

  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    p.classList.remove("visible");
  }, 2500);
}

function handleSelection(e) {
  setTimeout(() => {
    const text = getSelectedText();
    if (text) {
      showPopup(text, e?.clientX, e?.clientY);
    }
  }, 50);
}

document.addEventListener("mouseup", handleSelection, true);
document.addEventListener("keyup", handleSelection, true);

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SHOW_COUNT") {
    showPopup(msg.text, msg.x || 200, msg.y || 150);
  }
});
