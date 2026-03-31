/**
 * Mahara Schools CRM — Security module
 * Adds DevTools detection, right-click blocking, keyboard shortcut blocking,
 * and text-selection prevention to harden the client interface.
 */
export function setupSecurity() {
  let devToolsOpen = false;

  function detectDevTools() {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    const opened = widthDiff > threshold || heightDiff > threshold;

    if (opened && !devToolsOpen) {
      devToolsOpen = true;
      const root = document.getElementById("root");
      if (root) root.style.display = "none";
      if (!document.getElementById("devtools-block")) {
        const overlay = document.createElement("div");
        overlay.id = "devtools-block";
        overlay.style.cssText =
          "position:fixed;inset:0;background:#0f2027;display:flex;align-items:center;justify-content:center;z-index:99999;font-family:sans-serif;";
        overlay.innerHTML = `
          <div style="text-align:center;color:#78C8C8;padding:2rem;">
            <div style="font-size:56px;margin-bottom:20px;">🔒</div>
            <h2 style="font-size:22px;font-weight:700;margin-bottom:10px;color:#78C8C8;">Access Restricted</h2>
            <p style="color:#9ca3af;font-size:15px;max-width:360px;line-height:1.6;">Developer tools have been detected. Please close them to continue using Mahara Schools CRM.</p>
            <div style="margin-top:20px;font-size:12px;color:#4b5563;">Mahara Schools · Secure CRM Platform</div>
          </div>
        `;
        document.body.appendChild(overlay);
      }
    } else if (!opened && devToolsOpen) {
      devToolsOpen = false;
      const overlay = document.getElementById("devtools-block");
      if (overlay) overlay.remove();
      const root = document.getElementById("root");
      if (root) root.style.display = "block";
    }
  }

  // Poll every 800ms
  setInterval(detectDevTools, 800);
  detectDevTools();

  // Block right-click
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // Block keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // F12
    if (e.key === "F12") {
      e.preventDefault();
      return;
    }
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl) {
      // Block: U (view-source), S (save), P (print)
      if (["u", "s", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return;
      }
      // Block: Ctrl+Shift+I / J / C / K (devtools / console)
      if (e.shiftKey && ["i", "j", "c", "k"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return;
      }
    }
  });

  // Disable drag of elements
  document.addEventListener("dragstart", (e) => e.preventDefault());

  // Console API trap
  try {
    Object.defineProperty(console, "_commandLineAPI", {
      get() {
        detectDevTools();
      },
    });
  } catch {
    // ignore
  }
}
