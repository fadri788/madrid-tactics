// Registers the service worker and shows an "Install app" button when Chrome allows it.
// Does nothing when the page is opened as a file (file://), so double-clicking index.html still works.
(function () {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => console.warn("SW failed:", err));
  });

  let deferred = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    // The redesigned dashboard has .nav__actions; the board and graphic pages still have the old .nav
    const actions = document.querySelector(".nav__actions");
    const nav = actions || document.querySelector(".nav");
    if (!nav || document.getElementById("install-app")) return;
    const btn = document.createElement("a");
    btn.id = "install-app";
    btn.href = "#";
    if (actions) {
      btn.className = "nav__link";
      btn.textContent = "Install app";
    } else {
      btn.textContent = "⬇ Install app";
      btn.style.color = "var(--gold)";
    }
    btn.addEventListener("click", async (ev) => {
      ev.preventDefault();
      if (!deferred) return;
      deferred.prompt();
      await deferred.userChoice;
      deferred = null;
      btn.remove();
    });
    if (actions) nav.prepend(btn); else nav.appendChild(btn);
  });

  window.addEventListener("appinstalled", () => {
    const btn = document.getElementById("install-app");
    if (btn) btn.remove();
  });
})();
