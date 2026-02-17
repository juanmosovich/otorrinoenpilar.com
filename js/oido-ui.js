(function () {
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  }

  function runIdle(fn) {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(fn, { timeout: 2000 });
      return;
    }
    setTimeout(fn, 0);
  }

  function initReviewModal() {
    // Defer this to avoid blocking the initial render.
    runIdle(() => {
      if (sessionStorage.getItem("resenaMostrada")) {
        return;
      }

      const tiempoMinimo = 60000;
      const scrollRequerido = 50;
      const tiempoInicio = Date.now();
      let scrollRealizado = false;
      let modalMostrado = false;

      function obtenerPorcentajeScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        return (scrollTop / scrollHeight) * 100;
      }

      function verificarScroll() {
        if (obtenerPorcentajeScroll() >= scrollRequerido) {
          scrollRealizado = true;
        }
      }

      function mostrarModal() {
        if (modalMostrado) {
          return;
        }

        modalMostrado = true;
        if (window.bootstrap && document.getElementById("modalResena")) {
          const modal = new window.bootstrap.Modal(document.getElementById("modalResena"));
          modal.show();
          sessionStorage.setItem("resenaMostrada", "true");
        }

        window.removeEventListener("scroll", onScroll);
        document.removeEventListener("mouseleave", detectarSalida);
      }

      function verificarCondiciones() {
        const tiempoTranscurrido = Date.now() - tiempoInicio >= tiempoMinimo;
        if (tiempoTranscurrido && scrollRealizado) {
          mostrarModal();
        }
      }

      function detectarSalida(e) {
        if (e.clientY <= 0 && Date.now() - tiempoInicio >= 30000) {
          mostrarModal();
        }
      }

      function onScroll() {
        verificarScroll();
        verificarCondiciones();
      }

      window.addEventListener("scroll", onScroll, { passive: true });
      document.addEventListener("mouseleave", detectarSalida);
      setInterval(verificarCondiciones, 5000);
    });
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
    initReviewModal();
    initToggleButtons();
    initFormHandler();
    initVideoLazy();
    initScrollToTop();
  });
})();
