(function () {
  "use strict";

  var STORAGE_THEME_KEY = "valentine-theme";
  var STORAGE_PETALS_KEY = "valentine-petals";
  var STORAGE_HEARTS_KEY = "valentine-hearts";
  var STORAGE_AURA_KEY = "valentine-aura";
  var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  var defaultConfig = {
    prenom: "Shirley",
    petitsMots: [
      "Ton sourire rend mes matins plus doux.",
      "Avec toi, meme le silence est magnifique.",
      "Tu es ma pause bonheur dans chaque journee.",
      "Nos rires ensemble sont ma melodie preferee.",
      "Merci d'etre mon refuge et mon elan.",
      "Je t'aime plus fort a chaque saison."
    ],
    poeme:
      "À Center Parcs, janvier scella notre destin,\nSous les pins frissonnants nos mains cherchaient demain,\nPuis Sevran nous revit sous un ciel plus certain,\nComme un rêve gardé depuis l'âge enfantin.\nEn février, Bordeaux\nNous promet ses échos,\nNos pas vers un renouveau.\nTa fossette inégale illumine ton sourire,\nTes yeux font un ovale au moment de s'ouvrir,\nTa cicatrice fine ajoute à ton empire,\nEt ton parfum troublant me fait presque défaillir.\nTu donnes sans compter,\nAuprès des anciens blessés,\nPersévérante à aimer.\nVingt-quatre ans de lumière et de grâce infinie,\nDepuis nos treize ans, nos chemins sont unis,\nJ'adore être avec toi, ta présence m'envahit,\nShirley, ton nom résonne et ma vie s'embellit.\nDrôle et douce à la fois,\nSouriante chaque jour pour moi,\nEt mon cœur ne veut que toi.",
    captionsPhotos: [
      "Premier regard",
      "Un cafe, deux coeurs",
      "Notre promenade preferee",
      "Rires sous la pluie",
      "Soiree doree",
      "Main dans la main",
      "Instant vole",
      "Souvenir sucre",
      "La mer et nous",
      "Eclat de tendresse",
      "Danse improvisee",
      "Toujours toi"
    ],
    messageFinalSurprise: "Merci d'illuminer ma vie chaque jour. Mon plus beau cadeau, c'est toi."
  };

  function prefersReducedMotion() {
    return reducedMotionQuery.matches;
  }

  function readConfig() {
    var configNode = document.getElementById("site-config");
    if (!configNode) {
      return defaultConfig;
    }

    try {
      var parsed = JSON.parse(configNode.textContent || "{}");
      return {
        prenom: parsed.prenom || defaultConfig.prenom,
        petitsMots: Array.isArray(parsed.petitsMots) ? parsed.petitsMots : defaultConfig.petitsMots,
        poeme: parsed.poeme || defaultConfig.poeme,
        captionsPhotos: Array.isArray(parsed.captionsPhotos) ? parsed.captionsPhotos : defaultConfig.captionsPhotos,
        messageFinalSurprise: parsed.messageFinalSurprise || defaultConfig.messageFinalSurprise
      };
    } catch (error) {
      console.warn("Configuration invalide dans #site-config, valeurs par defaut utilisees.", error);
      return defaultConfig;
    }
  }

  var siteConfig = readConfig();

  function applyPersonalization(config) {
    var nameTargets = document.querySelectorAll("[data-girlfriend-name]");
    nameTargets.forEach(function (node) {
      node.textContent = config.prenom;
    });

    var noteTargets = document.querySelectorAll("[data-note-index]");
    noteTargets.forEach(function (node) {
      var index = Number(node.getAttribute("data-note-index"));
      node.textContent = config.petitsMots[index] || defaultConfig.petitsMots[index] || "Petit mot a personnaliser.";
    });

    var captionTargets = document.querySelectorAll("[data-caption-index]");
    captionTargets.forEach(function (node) {
      var index = Number(node.getAttribute("data-caption-index"));
      node.textContent = config.captionsPhotos[index] || defaultConfig.captionsPhotos[index] || "Souvenir a nommer";
    });

    var poemNode = document.getElementById("poem-text");
    if (poemNode) {
      poemNode.textContent = config.poeme;
    }

    var modalMessage = document.getElementById("modal-message");
    if (modalMessage) {
      modalMessage.textContent = config.messageFinalSurprise;
    }
  }

  function loadPhoto(card) {
    var media = card.querySelector(".photo-media");
    var source = card.getAttribute("data-photo");
    if (!media || !source) {
      return;
    }

    var image = new Image();
    image.onload = function () {
      card.classList.add("has-image");
      media.style.backgroundImage = 'url("' + source + '")';
    };
    image.onerror = function () {
      card.classList.remove("has-image");
    };
    image.src = source;
  }

  function setupLocalPhotos() {
    document.querySelectorAll(".photo-card, .favorite-frame").forEach(loadPhoto);
  }

  function setupSmoothScroll() {
    var anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(function (anchor) {
      anchor.addEventListener("click", function (event) {
        var hash = anchor.getAttribute("href");
        if (!hash || hash === "#") {
          return;
        }
        var target = document.querySelector(hash);
        if (!target) {
          return;
        }
        event.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start"
        });
        if (history.replaceState) {
          history.replaceState(null, "", hash);
        }
      });
    });
  }

  function setupActiveSection() {
    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
    if (!navLinks.length) {
      return;
    }

    var visibility = new Map();
    function refreshActive() {
      var bestId = "";
      var bestRatio = 0;
      visibility.forEach(function (ratio, id) {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      });
      if (!bestId) {
        return;
      }
      navLinks.forEach(function (link) {
        var isActive = link.getAttribute("href") === "#" + bestId;
        link.classList.toggle("active", isActive);
      });
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        refreshActive();
      },
      {
        root: null,
        threshold: [0.3, 0.5, 0.7],
        rootMargin: "-20% 0px -35% 0px"
      }
    );

    navLinks.forEach(function (link) {
      var sectionId = link.getAttribute("href");
      if (!sectionId) {
        return;
      }
      var section = document.querySelector(sectionId);
      if (section) {
        observer.observe(section);
      }
    });
  }

  function setupReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) {
      return;
    }

    if (prefersReducedMotion()) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    items.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  function setupThemeToggle() {
    var button = document.getElementById("theme-toggle");
    if (!button) {
      return;
    }

    function applyTheme(theme) {
      var isNight = theme === "night";
      document.body.classList.toggle("theme-night", isNight);
      button.setAttribute("aria-pressed", isNight ? "true" : "false");
      button.textContent = isNight ? "Aube rosee" : "Nuit feerique";
    }

    var savedTheme = localStorage.getItem(STORAGE_THEME_KEY);
    applyTheme(savedTheme === "night" ? "night" : "light");

    button.addEventListener("click", function () {
      var toNight = !document.body.classList.contains("theme-night");
      var nextTheme = toNight ? "night" : "light";
      applyTheme(nextTheme);
      localStorage.setItem(STORAGE_THEME_KEY, nextTheme);
    });
  }

  function setupHeartsToggle() {
    var button = document.getElementById("hearts-toggle");
    if (!button) {
      return;
    }

    var heartsEnabled = localStorage.getItem(STORAGE_HEARTS_KEY) !== "off";

    function applyHeartsState(skipPersist) {
      document.body.classList.toggle("fx-hearts-off", !heartsEnabled);
      button.setAttribute("aria-pressed", heartsEnabled ? "true" : "false");
      button.textContent = heartsEnabled
        ? prefersReducedMotion()
          ? "Coeurs : ON (statique)"
          : "Coeurs : ON"
        : "Coeurs : OFF";

      if (!skipPersist) {
        localStorage.setItem(STORAGE_HEARTS_KEY, heartsEnabled ? "on" : "off");
      }
    }

    button.addEventListener("click", function () {
      heartsEnabled = !heartsEnabled;
      applyHeartsState(false);
    });

    applyHeartsState(true);

    function onMotionChange() {
      applyHeartsState(true);
    }

    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", onMotionChange);
    } else if (typeof reducedMotionQuery.addListener === "function") {
      reducedMotionQuery.addListener(onMotionChange);
    }
  }

  function setupAuraToggle() {
    var button = document.getElementById("aura-toggle");
    if (!button) {
      return;
    }

    var auraEnabled = localStorage.getItem(STORAGE_AURA_KEY) !== "off";

    function applyAuraState(skipPersist) {
      document.body.classList.toggle("fx-aura-on", auraEnabled);
      document.body.classList.toggle("fx-aura-off", !auraEnabled);
      button.setAttribute("aria-pressed", auraEnabled ? "true" : "false");
      button.textContent = auraEnabled ? "Lueurs : ON" : "Lueurs : OFF";

      if (!skipPersist) {
        localStorage.setItem(STORAGE_AURA_KEY, auraEnabled ? "on" : "off");
      }
    }

    button.addEventListener("click", function () {
      auraEnabled = !auraEnabled;
      applyAuraState(false);
    });

    applyAuraState(true);
  }

  function createPetalsEngine() {
    var canvas = document.getElementById("petals-canvas");
    if (!canvas) {
      return null;
    }

    var ctx = canvas.getContext("2d");
    if (!ctx) {
      return null;
    }

    var width = 0;
    var height = 0;
    var petals = [];
    var rafId = 0;
    var maxPetals = 26;
    var palette = [
      "rgba(247, 201, 220, 0.75)",
      "rgba(236, 171, 202, 0.68)",
      "rgba(220, 117, 165, 0.56)",
      "rgba(214, 178, 94, 0.43)"
    ];

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!petals.length) {
        petals = Array.from({ length: maxPetals }, function () {
          return buildPetal(true);
        });
      }
    }

    function randomBetween(min, max) {
      return min + Math.random() * (max - min);
    }

    function buildPetal(randomY) {
      return {
        x: randomBetween(-20, width + 20),
        y: randomY ? randomBetween(-height, height) : -randomBetween(20, 220),
        w: randomBetween(6, 12),
        h: randomBetween(10, 16),
        speed: randomBetween(0.35, 1.05),
        drift: randomBetween(0.2, 1.2),
        phase: randomBetween(0, Math.PI * 2),
        angle: randomBetween(0, Math.PI * 2),
        spin: randomBetween(-0.016, 0.016),
        color: palette[Math.floor(Math.random() * palette.length)]
      };
    }

    function drawPetal(petal) {
      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, petal.w / 2, petal.h / 2, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = petal.color;
      ctx.fill();
      ctx.restore();
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      petals.forEach(function (petal, index) {
        petal.y += petal.speed;
        petal.phase += 0.02;
        petal.x += Math.sin(petal.phase) * petal.drift;
        petal.angle += petal.spin;

        if (petal.y > height + 24 || petal.x < -40 || petal.x > width + 40) {
          petals[index] = buildPetal(false);
        }

        drawPetal(petals[index]);
      });

      rafId = window.requestAnimationFrame(step);
    }

    return {
      start: function () {
        if (rafId) {
          return;
        }
        resize();
        step();
      },
      stop: function () {
        if (!rafId) {
          return;
        }
        window.cancelAnimationFrame(rafId);
        rafId = 0;
        ctx.clearRect(0, 0, width, height);
      },
      resize: resize
    };
  }

  function setupPetalsToggle(engine) {
    var button = document.getElementById("petals-toggle");
    if (!button || !engine) {
      return;
    }

    var petalsEnabled = localStorage.getItem(STORAGE_PETALS_KEY) !== "off";

    function applyPetalsState(skipPersist) {
      if (prefersReducedMotion()) {
        petalsEnabled = false;
        button.disabled = true;
        button.textContent = "Petales : OFF (mouvement reduit)";
        button.setAttribute("aria-pressed", "false");
        engine.stop();
        return;
      }

      button.disabled = false;
      button.textContent = petalsEnabled ? "Petales : ON" : "Petales : OFF";
      button.setAttribute("aria-pressed", petalsEnabled ? "true" : "false");

      if (petalsEnabled) {
        engine.start();
      } else {
        engine.stop();
      }

      if (!skipPersist) {
        localStorage.setItem(STORAGE_PETALS_KEY, petalsEnabled ? "on" : "off");
      }
    }

    button.addEventListener("click", function () {
      petalsEnabled = !petalsEnabled;
      applyPetalsState(false);
    });

    applyPetalsState(true);

    function onMotionChange() {
      if (prefersReducedMotion()) {
        petalsEnabled = false;
        applyPetalsState(true);
      } else {
        petalsEnabled = localStorage.getItem(STORAGE_PETALS_KEY) !== "off";
        applyPetalsState(true);
      }
    }

    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", onMotionChange);
    } else if (typeof reducedMotionQuery.addListener === "function") {
      reducedMotionQuery.addListener(onMotionChange);
    }

    window.addEventListener("resize", function () {
      engine.resize();
    });
  }

  function setupSparkles() {
    var sparkleTargets = document.querySelectorAll(".can-sparkle");

    function createSparkle(target) {
      if (prefersReducedMotion()) {
        return;
      }
      var rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }
      var dot = document.createElement("span");
      dot.className = "sparkle-dot";
      dot.style.left = Math.random() * (rect.width - 10) + "px";
      dot.style.top = Math.random() * (rect.height - 10) + "px";
      target.appendChild(dot);
      window.setTimeout(function () {
        dot.remove();
      }, 850);
    }

    sparkleTargets.forEach(function (target) {
      target.addEventListener("pointerenter", function () {
        for (var i = 0; i < 3; i += 1) {
          window.setTimeout(function () {
            createSparkle(target);
          }, i * 95);
        }
      });
    });
  }

  function setupTiltCards() {
    var cards = document.querySelectorAll(".note-card");
    if (!cards.length) {
      return;
    }

    cards.forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        if (prefersReducedMotion()) {
          return;
        }
        var rect = card.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width - 0.5;
        var py = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--ry", px * 10 + "deg");
        card.style.setProperty("--rx", py * -10 + "deg");
      });

      function resetTilt() {
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--rx", "0deg");
      }

      card.addEventListener("pointerleave", resetTilt);
      card.addEventListener("blur", resetTilt, true);
    });
  }

  function copyTextFallback(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    var success = false;
    try {
      success = document.execCommand("copy");
    } catch (error) {
      success = false;
    }
    document.body.removeChild(textarea);
    return success;
  }

  function setupCopyPoem() {
    var copyButton = document.getElementById("copy-poem");
    var poemText = document.getElementById("poem-text");
    var status = document.getElementById("copy-status");
    if (!copyButton || !poemText || !status) {
      return;
    }

    var statusTimeout = 0;
    function setStatus(message) {
      status.textContent = message;
      window.clearTimeout(statusTimeout);
      statusTimeout = window.setTimeout(function () {
        status.textContent = "";
      }, 2200);
    }

    copyButton.addEventListener("click", function () {
      var text = poemText.textContent ? poemText.textContent.trim() : "";
      if (!text) {
        setStatus("Poeme vide.");
        return;
      }

      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard
          .writeText(text)
          .then(function () {
            setStatus("Poeme copie dans le presse-papiers.");
          })
          .catch(function () {
            var fallbackOK = copyTextFallback(text);
            setStatus(fallbackOK ? "Poeme copie." : "Impossible de copier le poeme.");
          });
      } else {
        var ok = copyTextFallback(text);
        setStatus(ok ? "Poeme copie." : "Impossible de copier le poeme.");
      }
    });
  }

  function setupModal() {
    var modal = document.getElementById("surprise-modal");
    var openButton = document.getElementById("open-surprise");
    if (!modal || !openButton) {
      return;
    }

    var panel = modal.querySelector(".modal-panel");
    var closeButtons = modal.querySelectorAll("[data-close-modal]");
    var burstLayer = modal.querySelector(".modal-burst");
    var lastFocused = null;
    var focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "[tabindex]:not([tabindex='-1'])"
    ].join(",");

    function getFocusableElements() {
      return Array.prototype.slice
        .call(panel.querySelectorAll(focusableSelector))
        .filter(function (element) {
          return !element.hasAttribute("hidden");
        });
    }

    function launchModalBurst() {
      if (!burstLayer || prefersReducedMotion()) {
        return;
      }

      burstLayer.innerHTML = "";
      for (var i = 0; i < 22; i += 1) {
        var petal = document.createElement("span");
        petal.className = "modal-petal";
        petal.style.left = Math.random() * 100 + "%";
        petal.style.setProperty("--delay", Math.random() * 0.22 + "s");
        petal.style.setProperty("--x", (Math.random() - 0.5) * 120 + "px");
        petal.style.background =
          i % 4 === 0
            ? "rgba(214, 178, 94, 0.86)"
            : i % 2 === 0
              ? "rgba(245, 191, 215, 0.9)"
              : "rgba(210, 182, 235, 0.95)";
        burstLayer.appendChild(petal);
      }

      window.setTimeout(function () {
        burstLayer.innerHTML = "";
      }, 1900);
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", handleModalKeys);
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    function openModal() {
      lastFocused = document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      document.addEventListener("keydown", handleModalKeys);
      launchModalBurst();

      var focusable = getFocusableElements();
      if (focusable.length) {
        focusable[0].focus();
      } else {
        panel.focus();
      }
    }

    function trapFocus(event) {
      var focusable = getFocusableElements();
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function handleModalKeys(event) {
      if (event.key === "Escape") {
        closeModal();
        return;
      }
      if (event.key === "Tab") {
        trapFocus(event);
      }
    }

    openButton.addEventListener("click", openModal);
    closeButtons.forEach(function (button) {
      button.addEventListener("click", closeModal);
    });
  }

  applyPersonalization(siteConfig);
  setupLocalPhotos();
  setupSmoothScroll();
  setupActiveSection();
  setupReveal();
  setupThemeToggle();
  setupHeartsToggle();
  setupAuraToggle();
  setupPetalsToggle(createPetalsEngine());
  setupSparkles();
  setupTiltCards();
  setupCopyPoem();
  setupModal();
})();
