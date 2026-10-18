(function () {
  "use strict";

  const clockEl = document.getElementById("clock");
  function updateClock() {
    if (!clockEl) return;
    const d = new Date();
    clockEl.textContent = d.toLocaleString("ja-JP", { hour12: false });
  }
  updateClock();
  setInterval(updateClock, 1000);

  const copyBtn = document.getElementById("copy-discord");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      const id = copyBtn.getAttribute("data-copy") || "Konayukiw";
      const done = function () {
        copyBtn.textContent = "コピー済";
        setTimeout(function () {
          copyBtn.textContent = "コピー";
        }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(id).then(done).catch(done);
      } else {
        const ta = document.createElement("textarea");
        ta.value = id;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (_) {}
        document.body.removeChild(ta);
        done();
      }
    });
  }

  const allCards = Array.from(document.querySelectorAll(".node-card"));
  const favLangNodes = Array.from(document.querySelectorAll(".fav-node[data-fav-lang]"));

  favLangNodes.forEach(function (fav) {
    const lang = fav.getAttribute("data-fav-lang");
    fav.addEventListener("mouseenter", function () {
      allCards.forEach(function (card) {
        if (card.getAttribute("data-lang") === lang) {
          card.classList.add("is-highlighted");
        }
      });
    });
    fav.addEventListener("mouseleave", function () {
      allCards.forEach(function (card) {
        card.classList.remove("is-highlighted");
      });
    });
  });
})();
