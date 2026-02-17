(function () {
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  }

  // Variable global para el contexto de audio. Se compartira entre ambas apps
  // para evitar problemas de compatibilidad.
  window.audioContext = window.audioContext || null;

  // === Logica para Tinnitus STOP (Terapia de Tono Puro y Notch) ===
  let notchOscillator, notchGainNode, isPlayingNotch = false;
  let notchTreatmentActive = false, notchTreatmentStartTime, notchTimerInterval;
  let notchFrequency = 1000, notchVolume = 0.2;
  let notchWhiteNoiseBuffer, notchSource, notchFilter;

  // === Logica para Ruido Blanco/Rosa/Fractal ===
  let noiseSource = null;
  let noiseGainNode = null;

  function getAudioContext() {
    if (!window.audioContext) {
      window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (window.audioContext.state === "suspended") {
      window.audioContext.resume();
    }
    return window.audioContext;
  }

  // -------------------------------------------------------------------------
  // LOGICA DE NAVEGACION (SELECCION DE TERAPIA)
  // -------------------------------------------------------------------------

  function tsShowSection(sectionId) {
    document.querySelectorAll("main section").forEach((section) => {
      section.classList.add("ts-hidden");
    });
    const target = document.getElementById(sectionId);
    if (target) {
      target.classList.remove("ts-hidden");
    }
  }

  function initTinnitusStopUI() {
    const notchLink = document.getElementById("ts-notch-link");
    const complexLink = document.getElementById("ts-complex-link");
    const notchBackBtn = document.getElementById("ts-notch-back-btn");
    const complexBackBtn = document.getElementById("ts-complex-back-btn");

    if (notchLink) {
      notchLink.addEventListener("click", (e) => {
        e.preventDefault();
        tsShowSection("tinnitus-notch-section");
      });
    }

    if (complexLink) {
      complexLink.addEventListener("click", (e) => {
        e.preventDefault();
        tsShowSection("tinnitus-complex-section");
      });
    }

    if (notchBackBtn) {
      notchBackBtn.addEventListener("click", () => {
        tsShowSection("tinnitus-selector-section");
      });
    }

    if (complexBackBtn) {
      complexBackBtn.addEventListener("click", () => {
        tsShowSection("tinnitus-selector-section");
      });
    }

    initializeNotchApp();
  }

  // -------------------------------------------------------------------------
  // LOGICA DE TERAPIA NOTCH (AUDIO Y CONTROLES)
  // -------------------------------------------------------------------------

  function initializeNotchApp() {
    const frequencySlider = document.getElementById("ts-frequency-slider");
    const selectedFrequency = document.getElementById("ts-selected-frequency");
    const playStopButton = document.getElementById("ts-notch-play-btn");
    const treatmentButton = document.getElementById("ts-notch-treatment-btn");
    const volumeControl = document.getElementById("ts-volume-control");
    const timerDisplay = document.getElementById("ts-timer");
    const warningMessage = document.getElementById("ts-warning-message");

    if (!frequencySlider || !selectedFrequency || !playStopButton || !treatmentButton || !volumeControl || !timerDisplay || !warningMessage) {
      console.warn("Algunos elementos de la aplicacion Notch no se encontraron.");
      return;
    }

    frequencySlider.addEventListener("input", function () {
      notchFrequency = parseInt(this.value, 10);
      selectedFrequency.textContent = notchFrequency + " Hz";
      if (isPlayingNotch && notchOscillator) {
        notchOscillator.frequency.setValueAtTime(notchFrequency, getAudioContext().currentTime);
      }
      if (notchTreatmentActive && notchFilter) {
        notchFilter.frequency.setValueAtTime(notchFrequency, getAudioContext().currentTime);
      }
    });

    volumeControl.addEventListener("input", function () {
      notchVolume = this.value / 100;
      if (isPlayingNotch && notchGainNode) {
        notchGainNode.gain.setValueAtTime(notchVolume * 0.1, getAudioContext().currentTime);
      }
      if (notchTreatmentActive && notchGainNode) {
        notchGainNode.gain.setValueAtTime(notchVolume * 0.3, getAudioContext().currentTime);
      }
    });

    playStopButton.addEventListener("click", function () {
      if (isPlayingNotch) {
        stopNotchAudio();
      } else {
        stopComplexAudio();
        startNotchAudio();
      }
    });

    treatmentButton.addEventListener("click", function () {
      if (notchTreatmentActive) {
        stopNotchTreatment();
      } else {
        stopComplexAudio();
        startNotchTreatment();
      }
    });
  }

  function startNotchAudio() {
    try {
      const ctx = getAudioContext();
      notchOscillator = ctx.createOscillator();
      notchGainNode = ctx.createGain();
      notchOscillator.connect(notchGainNode);
      notchGainNode.connect(ctx.destination);
      notchOscillator.frequency.setValueAtTime(notchFrequency, ctx.currentTime);
      notchOscillator.type = "sine";
      notchGainNode.gain.setValueAtTime(notchVolume * 0.1, ctx.currentTime);
      notchOscillator.start();
      isPlayingNotch = true;
      document.getElementById("ts-notch-play-btn").textContent = "Detener Sonido";
    } catch (error) {
      console.error("Error al iniciar el audio:", error);
    }
  }

  function stopNotchAudio() {
    if (notchOscillator) {
      notchOscillator.stop();
      notchOscillator.disconnect();
      notchOscillator = null;
      notchGainNode = null;
    }
    isPlayingNotch = false;
    const playBtn = document.getElementById("ts-notch-play-btn");
    if (playBtn) {
      playBtn.textContent = "Probar Frecuencia";
    }
  }

  function generateNotchWhiteNoise() {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 2;
    notchWhiteNoiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = notchWhiteNoiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  function startNotchTreatment() {
    stopNotchAudio();
    try {
      const ctx = getAudioContext();
      if (!notchWhiteNoiseBuffer) {
        generateNotchWhiteNoise();
      }

      notchSource = ctx.createBufferSource();
      notchSource.buffer = notchWhiteNoiseBuffer;
      notchSource.loop = true;

      notchFilter = ctx.createBiquadFilter();
      notchFilter.type = "notch";
      notchFilter.frequency.setValueAtTime(notchFrequency, ctx.currentTime);
      notchFilter.Q.setValueAtTime(30, ctx.currentTime);

      notchGainNode = ctx.createGain();
      notchGainNode.gain.setValueAtTime(notchVolume * 0.3, ctx.currentTime);

      notchSource.connect(notchFilter);
      notchFilter.connect(notchGainNode);
      notchGainNode.connect(ctx.destination);

      notchSource.start();
      notchTreatmentActive = true;
      document.getElementById("ts-notch-treatment-btn").textContent = "Detener Tratamiento";

      notchTreatmentStartTime = Date.now();
      notchTimerInterval = setInterval(() => {
        const elapsed = Date.now() - notchTreatmentStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        document.getElementById("ts-timer").textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

        if (minutes >= 45 && minutes < 50) {
          const warning = document.getElementById("ts-warning-message");
          warning.textContent = "¡Quedan menos de 5 minutos!";
          warning.classList.remove("ts-hidden");
        }
        if (minutes >= 50) {
          stopNotchTreatment();
          alert("Tratamiento completado. Se recomienda descansar antes de la proxima sesion.");
        }
      }, 1000);
    } catch (error) {
      console.error("Error al iniciar terapia notch:", error);
    }
  }

  function stopNotchTreatment() {
    if (notchSource) {
      notchSource.stop();
      notchSource.disconnect();
      notchSource = null;
    }
    notchTreatmentActive = false;
    const treatmentBtn = document.getElementById("ts-notch-treatment-btn");
    if (treatmentBtn) {
      treatmentBtn.textContent = "Iniciar Tratamiento";
    }
    clearInterval(notchTimerInterval);
    const timer = document.getElementById("ts-timer");
    if (timer) {
      timer.textContent = "00:00";
    }
    const warning = document.getElementById("ts-warning-message");
    if (warning) {
      warning.classList.add("ts-hidden");
    }
  }

  // -------------------------------------------------------------------------
  // LOGICA DE TERAPIA COMPLEJA (AUDIO DE RUIDOS)
  // -------------------------------------------------------------------------

  function stopComplexAudio() {
    if (noiseSource) {
      noiseSource.stop();
      noiseSource.disconnect();
      noiseSource = null;
    }
  }

  function createNoiseNode(type) {
    const ctx = getAudioContext();
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    if (type === "blanco") {
      for (let i = 0; i < bufferSize; i += 1) {
        output[i] = Math.random() * 2 - 1;
      }
    } else if (type === "rosa") {
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i += 1) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99476 * b1 + white * 0.0993388;
        b2 = 0.96900 * b2 + white * 0.4432098;
        output[i] = (b0 + b1 + b2) * 0.1;
      }
    } else if (type === "fractal") {
      let lastValue = 0;
      for (let i = 0; i < bufferSize; i += 1) {
        lastValue = (Math.random() * 2 - 1) * 0.5 + lastValue * 0.5;
        output[i] = lastValue;
      }
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;
    return noiseNode;
  }

  function playNoise(type) {
    stopNotchAudio();
    stopNotchTreatment();

    if (noiseSource) {
      noiseSource.stop();
      noiseSource.disconnect();
    }
    noiseSource = createNoiseNode(type);
    noiseGainNode = getAudioContext().createGain();
    noiseSource.connect(noiseGainNode);
    noiseGainNode.connect(getAudioContext().destination);
    const volumenControl = document.getElementById("ts-complex-volumen");
    if (volumenControl) {
      noiseGainNode.gain.value = volumenControl.value;
    }
    noiseSource.start();
  }

  function initNoiseControls() {
    const btnBlanco = document.getElementById("ts-btn-blanco");
    const btnRosa = document.getElementById("ts-btn-rosa");
    const btnFractal = document.getElementById("ts-btn-fractal");
    const btnStop = document.getElementById("ts-btn-stop-complex");
    const volumenControl = document.getElementById("ts-complex-volumen");

    if (btnBlanco) {
      btnBlanco.addEventListener("click", () => playNoise("blanco"));
    }
    if (btnRosa) {
      btnRosa.addEventListener("click", () => playNoise("rosa"));
    }
    if (btnFractal) {
      btnFractal.addEventListener("click", () => playNoise("fractal"));
    }
    if (btnStop) {
      btnStop.addEventListener("click", () => {
        if (noiseSource) {
          noiseSource.stop();
          noiseSource = null;
        }
      });
    }
    if (volumenControl) {
      volumenControl.addEventListener("input", (e) => {
        if (noiseGainNode) {
          noiseGainNode.gain.value = e.target.value;
        }
      });
    }
  }

  // -------------------------------------------------------------------------
  // ONDAS BINAURALES PARA TINNITUS
  // -------------------------------------------------------------------------

  let tinnitusInitialized = false;

  function initTinnitusApp() {
    if (tinnitusInitialized) {
      return;
    }

    tinnitusInitialized = true;

    const freqLeftSlider = document.getElementById("tinnitusFreqLeft");
    const freqRightSlider = document.getElementById("tinnitusFreqRight");
    const displayLeft = document.getElementById("tinnitusDisplayLeft");
    const displayRight = document.getElementById("tinnitusDisplayRight");
    const binauralFreqDisplay = document.getElementById("tinnitusBinauralFreq");
    const playBtn = document.getElementById("tinnitusPlayBtn");
    const stopBtn = document.getElementById("tinnitusStopBtn");
    const statusMessage = document.getElementById("tinnitusStatusMessage");

    if (!freqLeftSlider || !freqRightSlider || !playBtn || !stopBtn) {
      return;
    }

    let audioCtx = null;
    let oscillatorLeft = null;
    let oscillatorRight = null;
    let pannerNodeLeft = null;
    let pannerNodeRight = null;

    function updateFrequencies() {
      const freqLeft = parseFloat(freqLeftSlider.value);
      const freqRight = parseFloat(freqRightSlider.value);

      displayLeft.textContent = freqLeft;
      displayRight.textContent = freqRight;
      binauralFreqDisplay.textContent = Math.abs(freqLeft - freqRight).toFixed(2);

      if (audioCtx && oscillatorLeft && oscillatorRight) {
        oscillatorLeft.frequency.setValueAtTime(freqLeft, audioCtx.currentTime);
        oscillatorRight.frequency.setValueAtTime(freqRight, audioCtx.currentTime);
      }
    }

    function createBinauralBeats() {
      if (audioCtx && audioCtx.state === "running") {
        statusMessage.textContent = "El sonido ya esta en reproduccion.";
        return;
      }

      audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      oscillatorLeft = audioCtx.createOscillator();
      oscillatorRight = audioCtx.createOscillator();

      pannerNodeLeft = audioCtx.createStereoPanner();
      pannerNodeRight = audioCtx.createStereoPanner();

      oscillatorLeft.connect(pannerNodeLeft);
      pannerNodeLeft.pan.setValueAtTime(-1, audioCtx.currentTime);
      pannerNodeLeft.connect(audioCtx.destination);

      oscillatorRight.connect(pannerNodeRight);
      pannerNodeRight.pan.setValueAtTime(1, audioCtx.currentTime);
      pannerNodeRight.connect(audioCtx.destination);

      updateFrequencies();

      oscillatorLeft.start();
      oscillatorRight.start();
      statusMessage.textContent = "Sonido en reproduccion. Ajusta los controles.";
    }

    function stopBinauralBeats() {
      if (audioCtx && audioCtx.state !== "closed") {
        oscillatorLeft.stop();
        oscillatorRight.stop();
        audioCtx.close();
        audioCtx = null;
        statusMessage.textContent = "Reproduccion detenida.";
      }
    }

    freqLeftSlider.addEventListener("input", updateFrequencies);
    freqRightSlider.addEventListener("input", updateFrequencies);
    playBtn.addEventListener("click", createBinauralBeats);
    stopBtn.addEventListener("click", stopBinauralBeats);
  }

  function setupTinnitusAppLoader() {
    const tinnitusRoot = document.getElementById("tinnitus-selector-section") ||
      document.getElementById("ondas-binaurales");

    if (!tinnitusRoot) {
      return;
    }

    const onInteract = () => initTinnitusApp();

    tinnitusRoot.addEventListener("click", onInteract, { once: true });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          initTinnitusApp();
          observer.disconnect();
        }
      }, { rootMargin: "200px 0px" });

      observer.observe(tinnitusRoot);
    } else {
      initTinnitusApp();
    }
  }

  onReady(() => {
    initTinnitusStopUI();
    initNoiseControls();
    setupTinnitusAppLoader();
  });
})();
