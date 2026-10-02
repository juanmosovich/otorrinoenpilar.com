(function () {
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  }

  function initRatePrompt() {
    if (window.ORPRatePrompt) {
      window.ORPRatePrompt.autoShowOnEngagement();
    }
  }

  function initToggleButtons() {
    document.querySelectorAll(".toggle-btn").forEach((button) => {
      button.addEventListener("click", () => {
        setTimeout(() => {
          if (button.getAttribute("aria-expanded") === "true") {
            button.textContent = "Ver menos";
          } else {
            button.textContent = "Ver mas";
          }
        }, 300);
      });
    });
  }

  function initFormHandler() {
    const form = document.getElementById("ha_formulario_encuesta");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const formData = new FormData(this);
      const resultsDiv = document.getElementById("ha_resultados");
      const preferenceListDiv = document.getElementById("ha_lista_preferencias");
      if (!resultsDiv || !preferenceListDiv) {
        return;
      }

      preferenceListDiv.innerHTML = "";

      for (const [key, value] of formData.entries()) {
        let label = "";
        switch (key) {
          case "ha_cantidad_audifonos":
            label = "Preferencia de cantidad de audifonos:";
            break;
          case "ha_estetica":
            label = "Importancia de la estetica:";
            break;
          case "ha_adaptacion":
            label = "Preferencia de adaptacion:";
            break;
          case "ha_comodidad":
            label = "Importancia de la comodidad:";
            break;
          case "ha_alimentacion":
            label = "Preferencia de alimentacion:";
            break;
          case "ha_bluetooth":
            label = "Conectividad Bluetooth:";
            break;
          case "ha_control":
            label = "Importancia del control de volumen/programas:";
            break;
          case "ha_ruido":
            label = "Frecuencia en ambientes ruidosos:";
            break;
          case "ha_microfono":
            label = "Utilidad del microfono direccional:";
            break;
          case "ha_telebobina":
            label = "Frecuencia en lugares con bucle inductivo:";
            break;
          case "ha_presupuesto":
            label = "Presupuesto aproximado por audifono:";
            break;
          case "ha_otras_consideraciones":
            label = "Otras consideraciones:";
            break;
        }
        preferenceListDiv.innerHTML += `<p><strong>${label}</strong> ${value}</p>`;
      }

      resultsDiv.style.display = "block";
      this.reset();
    });
  }

  function initVideoLazy() {
    const videoCollapses = document.querySelectorAll(".collapse[data-video-id]");
    if (!videoCollapses.length) {
      return;
    }

    videoCollapses.forEach((collapseElement) => {
      collapseElement.addEventListener("shown.bs.collapse", () => {
        const isLoaded = collapseElement.getAttribute("data-loaded") === "true";
        if (isLoaded) {
          return;
        }

        const videoId = collapseElement.getAttribute("data-video-id");
        const targetDiv = document.getElementById("video-target-" + videoId);
        const videoTitle = collapseElement.getAttribute("data-video-title");

        if (videoId && targetDiv) {
          const iframeHtml = `
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; height: auto;">
              <iframe
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                src="https://www.youtube.com/embed/${videoId}"
                frameborder="0"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                title="${videoTitle}">
              </iframe>
            </div>
          `;

          targetDiv.innerHTML = iframeHtml;
          collapseElement.setAttribute("data-loaded", "true");
        }
      });
    });
  }

  function activateYtLite(el) {
    var id = el.getAttribute("data-id");
    if (!id) { return; }
    var title = el.getAttribute("data-title") || "Video de YouTube";
    var wrapper = document.createElement("div");
    wrapper.style.cssText = "position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:8px;";
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0";
    iframe.title = title;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.setAttribute("allowfullscreen", "");
    iframe.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; border:0;";
    wrapper.appendChild(iframe);
    el.replaceWith(wrapper);
  }

  function initYtLite() {
    document.addEventListener("click", function (e) {
      var el = e.target.closest(".yt-lite");
      if (el) { activateYtLite(el); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        var el = e.target.closest(".yt-lite");
        if (el) { e.preventDefault(); activateYtLite(el); }
      }
    });
  }

  function initScrollToTop() {
    const scrollBtn = document.getElementById("scrollToTop");
    if (!scrollBtn) {
      return;
    }

    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        scrollBtn.classList.add("show");
      } else {
        scrollBtn.classList.remove("show");
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();

    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  onReady(() => {
    initRatePrompt();
    initToggleButtons();
    initFormHandler();
    initVideoLazy();
    initYtLite();
    initScrollToTop();
  });
})();
