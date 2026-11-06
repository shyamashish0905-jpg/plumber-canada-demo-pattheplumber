(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  /* ---------- live Toronto time ---------- */

  const timeTargets = [$("#local-time"), $("#dispatch-time")].filter(Boolean);

  function updateTorontoTime() {
    const time = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Toronto",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(new Date());

    timeTargets.forEach((target) => {
      target.textContent = time;
    });
  }

  updateTorontoTime();
  window.setInterval(updateTorontoTime, 15000);

  /* ---------- price board toggle ---------- */

  const rateButtons = $$(".rate-toggle__btn");
  const priceBoard = $(".price-board");
  const priceMode = $("#price-mode");
  const rateHeader = $("#rate-header");
  const priceValues = $$(".price-value");
  const priceChips = $$(".price-chip");
  let recountTimer = null;

  if (rateButtons.length && priceBoard) {
    rateButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const rate = button.dataset.rate;
        if (!rate || priceBoard.dataset.rate === rate) return;

        priceBoard.dataset.rate = rate;

        rateButtons.forEach((other) => {
          const isActive = other === button;
          other.classList.toggle("is-active", isActive);
          other.setAttribute("aria-pressed", String(isActive));
        });

        const isNight = rate === "night";
        if (priceMode) priceMode.textContent = isNight ? "Showing night and weekend rates" : "Showing weekday rates";
        if (rateHeader) rateHeader.textContent = isNight ? "Night rate" : "Weekday rate";
        priceChips.forEach((chip) => {
          chip.textContent = isNight ? "Night" : "Day";
        });

        window.clearTimeout(recountTimer);
        priceValues.forEach((value) => {
          value.classList.remove("is-recounting");
          if (reduceMotion) {
            value.textContent = value.dataset[rate] || value.textContent;
            value.setAttribute("aria-label", `Placeholder price, ${isNight ? "night" : "weekday"} rate`);
            return;
          }

          // A short split-flap scramble, then the real placeholder value.
          value.classList.add("is-recounting");
          const scramble = window.setInterval(() => {
            value.textContent = `$${Math.floor(100 + Math.random() * 899)}–$${Math.floor(100 + Math.random() * 899)}`;
          }, 45);

          window.setTimeout(() => {
            window.clearInterval(scramble);
            value.textContent = value.dataset[rate] || "$000–$000";
            value.setAttribute("aria-label", `Placeholder price, ${isNight ? "night" : "weekday"} rate`);
            value.classList.remove("is-recounting");
          }, 320);
        });

        recountTimer = window.setTimeout(() => {
          priceValues.forEach((value) => value.classList.remove("is-recounting"));
        }, 500);
      });
    });
  }

  /* ---------- service-area map ---------- */

  const townButtons = $$(".town");
  const routeLine = $("#route-line");
  const routeOutline = $("#route-outline");
  const routeVan = $("#route-van");
  const destPin = $("#dest-pin");
  const arrivalTicket = $("#arrival-ticket");
  const ticketNumber = $("#ticket-number");
  const ticketTown = $("#ticket-town");
  const ticketEta = $("#ticket-eta");
  const ticketRoute = $("#ticket-route");
  const ticketNote = $("#ticket-note");
  const shop = { x: 555, y: 365 };
  let routeAnimation = 0;

  function makeRoutePath(target) {
    const midX = (shop.x + target.x) / 2 + (target.y - shop.y) * 0.12;
    const midY = (shop.y + target.y) / 2 - (target.x - shop.x) * 0.12 - 28;
    return `M ${shop.x} ${shop.y} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${target.x} ${target.y}`;
  }

  function animateVanAlong(path, duration = 880) {
    if (!routeVan) return;
    const token = ++routeAnimation;
    const length = path.getTotalLength();
    const start = performance.now();

    routeVan.hidden = false;

    const step = (now) => {
      if (token !== routeAnimation) return;
      const t = Math.min(1, (now - start) / duration);
      const point = path.getPointAtLength(length * t);
      routeVan.setAttribute("transform", `translate(${point.x} ${point.y})`);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        routeVan.hidden = true;
      }
    };

    requestAnimationFrame(step);
  }

  function selectTown(button, index) {
    const target = {
      x: Number(button.dataset.x),
      y: Number(button.dataset.y)
    };
    if (!Number.isFinite(target.x) || !Number.isFinite(target.y)) return;

    const town = button.dataset.town || "Your town";
    const pathData = makeRoutePath(target);

    if (routeLine && routeOutline) {
      routeLine.setAttribute("d", pathData);
      routeOutline.setAttribute("d", pathData);

      const length = routeLine.getTotalLength();
      routeLine.style.strokeDasharray = `${length}`;
      routeOutline.style.strokeDasharray = `${length}`;
      routeLine.style.strokeDashoffset = reduceMotion ? "0" : `${length}`;
      routeOutline.style.strokeDashoffset = reduceMotion ? "0" : `${length}`;

      if (!reduceMotion) {
        requestAnimationFrame(() => {
          routeLine.style.strokeDashoffset = "0";
          routeOutline.style.strokeDashoffset = "0";
        });
        animateVanAlong(routeLine);
      } else if (routeVan) {
        routeVan.hidden = true;
      }
    }

    if (destPin) {
      destPin.hidden = false;
      destPin.setAttribute("transform", `translate(${target.x} ${target.y + 8})`);
    }

    townButtons.forEach((townButton) => {
      const selected = townButton === button;
      townButton.setAttribute("aria-pressed", String(selected));
    });

    if (arrivalTicket) arrivalTicket.classList.add("is-routed");
    if (ticketNumber) ticketNumber.textContent = `#${String(index + 1).padStart(4, "0")}`;
    if (ticketTown) ticketTown.textContent = town;
    if (ticketEta) ticketEta.textContent = `${button.dataset.eta || "XX–XX"} MIN`;
    if (ticketRoute) ticketRoute.textContent = "Drawn from shop";
    if (ticketNote) {
      ticketNote.textContent = `Route drawn from the Toronto shop to ${town}. The arrival window is a placeholder — set real windows with Pat.`;
    }
  }

  townButtons.forEach((button, index) => {
    button.addEventListener("click", () => selectTown(button, index));
  });

  /* ---------- photo quote form ---------- */

  const quoteForm = $("#quote-form");
  const photoInput = $("#photos");
  const photoList = $("#photo-list");
  let photoObjectUrls = [];

  function renderPhotoList() {
    if (!photoInput || !photoList) return;

    photoObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    photoObjectUrls = [];
    photoList.innerHTML = "";

    const files = Array.from(photoInput.files || []);
    if (!files.length) {
      photoList.textContent = "No photos chosen yet.";
      return;
    }

    const thumbs = document.createElement("div");
    thumbs.className = "photo-thumbs";

    files.slice(0, 8).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const thumb = document.createElement("span");
      thumb.className = "photo-thumb";
      const image = document.createElement("img");
      const url = URL.createObjectURL(file);
      photoObjectUrls.push(url);
      image.src = url;
      image.alt = "";
      thumb.appendChild(image);
      thumbs.appendChild(thumb);
    });

    const summary = document.createElement("span");
    summary.className = "photo-count";
    summary.textContent = `${files.length} ${files.length === 1 ? "photo" : "photos"} ready — attach ${files.length === 1 ? "it" : "them"} in your email app.`;
    thumbs.appendChild(summary);

    photoList.appendChild(thumbs);
  }

  if (photoInput) {
    photoInput.addEventListener("change", renderPhotoList);
  }

  if (quoteForm) {
    quoteForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!quoteForm.reportValidity()) return;

      const status = $("#form-status");
      const data = new FormData(quoteForm);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const town = String(data.get("town") || "").trim();
      const message = String(data.get("message") || "").trim();
      const files = Array.from(photoInput?.files || []);

      const subject = `Photo quote request — ${name || "PatThePlumber website"}${town ? ` (${town})` : ""}`;
      const lines = [
        "Hi Pat,",
        "",
        message,
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        town ? `Town: ${town}` : null,
        files.length ? `Photos selected (attach these in your email app): ${files.map((file) => file.name).join(", ")}` : null,
        "",
        "Sent from the PatThePlumber website."
      ].filter((line) => line !== null);

      const mailto = `mailto:pattheplumber94@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;

      if (status) {
        status.textContent = files.length
          ? "Your email app should open with the details. Attach the selected photos there, then hit send."
          : "Your email app should open with the details filled in. Hit send and Pat will get it.";
        status.classList.add("is-visible");
        status.classList.remove("is-error");
      }

      window.setTimeout(() => {
        window.location.href = mailto;
      }, 90);
    });
  }

  /* ---------- reveal on scroll + rubber stamps ---------- */

  const revealTargets = $$([
    ".price-intro",
    ".price-board",
    ".steps__head",
    ".step-card",
    ".area__head",
    ".map-card",
    ".arrival-ticket",
    ".reviews__head",
    ".reviews__grid",
    ".guarantees__head",
    ".guarantee-card",
    ".paperwork",
    ".contact__head",
    ".call-panel",
    ".quote-card"
  ].join(","));

  if (!reduceMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

    revealTargets.forEach((element, index) => {
      element.classList.add("reveal");
      element.style.transitionDelay = `${(index % 3) * 55}ms`;
      revealObserver.observe(element);
    });
  }

  const stamps = $$("[data-stamp]");
  if (!reduceMotion && "IntersectionObserver" in window) {
    const stampObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          window.setTimeout(() => entry.target.classList.add("is-stamped"), 160);
          stampObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    stamps.forEach((stamp) => stampObserver.observe(stamp));
  } else {
    stamps.forEach((stamp) => stamp.classList.add("is-stamped"));
  }

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- signature copper pipe ---------- */

  const pipeLayer = $("#pipe-layer");
  const pipeSvg = $("#pipe-svg");
  const pipeShadow = $("#pipe-shadow");
  const pipeOutline = $("#pipe-outline");
  const pipeBody = $("#pipe-body");
  const pipeHighlight = $("#pipe-highlight");
  const pipeWater = $("#pipe-water");
  const jointsGroup = $("#pipe-joints");
  const waterHead = $("#water-head");
  const faucet = $("#pipe-faucet");
  const faucetLever = $("#faucet-lever");
  const faucetStream = $("#faucet-stream");
  const faucetStreamShine = $("#faucet-stream-shine");
  const faucetSplash = $("#faucet-splash");
  const footer = $("#footer");
  const footerName = $("#footer-name");
  const phoneSlab = $("#phone");

  if (pipeLayer && pipeSvg && phoneSlab && footer && footerName) {
    const SVG_NS = "http://www.w3.org/2000/svg";
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const getScrollY = () => window.scrollY || window.pageYOffset || 0;
    const documentTop = (element) => element.getBoundingClientRect().top + getScrollY();

    let metrics = null;
    let currentProgress = 0;
    let targetProgress = 0;
    let waterFrame = 0;
    let leverFrame = 0;
    let jointData = [];
    let jointObserver = null;
    let faucetOpened = false;
    let rebuildTimer = 0;

    function svgNode(tag, attributes = {}) {
      const node = document.createElementNS(SVG_NS, tag);
      Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
      return node;
    }

    function setLeverAngle(angle) {
      if (faucetLever) faucetLever.setAttribute("transform", `rotate(${angle} 0 -30)`);
    }

    function openFaucet() {
      if (faucetOpened) return;
      faucetOpened = true;
      pipeLayer.classList.add("is-pouring");

      if (faucetStream) faucetStream.style.strokeDashoffset = "0";
      if (faucetStreamShine) faucetStreamShine.style.strokeDashoffset = "0";

      if (reduceMotion) {
        setLeverAngle(26);
        return;
      }

      const start = performance.now();
      const from = -24;
      const to = 26;
      const duration = 620;

      const moveLever = (now) => {
        const t = clamp((now - start) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setLeverAngle(from + (to - from) * eased);
        if (t < 1) {
          leverFrame = requestAnimationFrame(moveLever);
        }
      };

      cancelAnimationFrame(leverFrame);
      leverFrame = requestAnimationFrame(moveLever);
    }

    function createJoint(x, y, number, width) {
      const small = width < 700;
      const ringRadius = small ? 10 : 15;
      const group = svgNode("g", {
        class: "pipe-joint",
        transform: `translate(${x} ${y})`
      });

      const glow = svgNode("circle", { class: "joint-glow", cx: 0, cy: 0, r: small ? 20 : 28 });
      const branchOutline = svgNode("line", {
        class: "joint-branch-outline",
        x1: -4,
        y1: 0,
        x2: -76,
        y2: 0
      });
      const branch = svgNode("line", {
        class: "joint-branch",
        x1: -4,
        y1: 0,
        x2: -76,
        y2: 0
      });
      const badge = svgNode("rect", {
        class: "joint-badge",
        x: -114,
        y: -14,
        width: 38,
        height: 28,
        rx: 2
      });
      const badgeText = svgNode("text", {
        class: "joint-badge-text",
        x: -95,
        y: 5
      });
      badgeText.textContent = number;

      const ring = svgNode("circle", { class: "joint-ring", cx: 0, cy: 0, r: ringRadius });
      const spokeA = svgNode("line", {
        class: "joint-spoke",
        x1: -ringRadius + 4,
        y1: 0,
        x2: ringRadius - 4,
        y2: 0
      });
      const spokeB = svgNode("line", {
        class: "joint-spoke",
        x1: 0,
        y1: -ringRadius + 4,
        x2: 0,
        y2: ringRadius - 4
      });
      const core = svgNode("circle", { class: "joint-core", cx: 0, cy: 0, r: small ? 3.5 : 5 });

      group.append(glow, branchOutline, branch, badge, badgeText, ring, spokeA, spokeB, core);
      return group;
    }

    function createStartFlange(x, y, width) {
      const small = width < 700;
      const radius = small ? 12 : 17;
      const group = svgNode("g", {
        class: "pipe-start",
        transform: `translate(${x} ${y})`
      });
      const outer = svgNode("circle", {
        class: "start-ring",
        cx: 0,
        cy: 0,
        r: radius
      });
      const inner = svgNode("circle", {
        class: "start-core",
        cx: 0,
        cy: 0,
        r: radius * 0.48
      });
      group.append(outer, inner);

      const boltRadius = small ? 1.4 : 2;
      for (let i = 0; i < 4; i += 1) {
        const angle = (Math.PI / 2) * i + Math.PI / 4;
        const bolt = svgNode("circle", {
          class: "start-bolt",
          cx: Math.cos(angle) * radius * 0.72,
          cy: Math.sin(angle) * radius * 0.72,
          r: boltRadius
        });
        group.appendChild(bolt);
      }

      return group;
    }

    function updateWater() {
      if (!metrics) return;

      const progress = reduceMotion ? 1 : currentProgress;
      const length = metrics.length;
      const point = pipeBody.getPointAtLength(length * progress);

      if (pipeWater) {
        pipeWater.style.strokeDashoffset = String(length * (1 - progress));
      }

      if (waterHead) {
        const inFlow = progress > 0.003 && progress < 0.997;
        waterHead.hidden = !inFlow;
        if (inFlow) {
          waterHead.setAttribute("transform", `translate(${point.x} ${point.y})`);
        }
      }

      jointData.forEach((joint) => {
        if (point.y >= joint.y - 3) joint.element.classList.add("is-lit");
      });

      const footerTop = footer.getBoundingClientRect().top;
      if (footerTop < window.innerHeight * 0.86 && progress > 0.52) {
        openFaucet();
      }
    }

    function waterTick() {
      const difference = targetProgress - currentProgress;

      if (Math.abs(difference) < 0.001) {
        currentProgress = targetProgress;
        waterFrame = 0;
        updateWater();
        return;
      }

      currentProgress += difference * 0.13;
      updateWater();
      waterFrame = requestAnimationFrame(waterTick);
    }

    function queueWater() {
      if (!metrics) return;

      const viewport = window.innerHeight;
      const travel = Math.max(1, metrics.endY - metrics.startY);
      const raw = (getScrollY() + viewport * 0.63 - metrics.startY) / travel;
      targetProgress = clamp(raw, 0, 1);

      if (reduceMotion) {
        currentProgress = 1;
        updateWater();
      } else if (!waterFrame) {
        waterFrame = requestAnimationFrame(waterTick);
      }

      if (footer.getBoundingClientRect().top < viewport * 0.86) {
        openFaucet();
      }
    }

    function buildPipe() {
      const width = Math.max(320, document.documentElement.clientWidth || window.innerWidth);
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight
      );

      pipeSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      pipeSvg.setAttribute("preserveAspectRatio", "none");
      pipeLayer.style.height = `${height}px`;

      const phoneRect = phoneSlab.getBoundingClientRect();
      const phoneTop = phoneRect.top + getScrollY();
      const startX = Math.min(phoneRect.right + getScrollXSafe() - 4, width - 12);
      const startY = phoneTop + phoneRect.height * 0.57;

      const gutterMargin = width < 600 ? 10 : width < 1000 ? 16 : 26;
      const gutterX = width - gutterMargin;
      const endX = gutterX - (width < 600 ? 42 : 52);

      const footerTop = documentTop(footer);
      const nameTop = documentTop(footerName);
      const endY = Math.max(footerTop + 112, nameTop - (width < 600 ? 152 : 168));
      const jogY = endY - 36;
      const startElbow = Math.max(startX + 2, gutterX - 46);

      const path = [
        `M ${startX.toFixed(1)} ${startY.toFixed(1)}`,
        `L ${startElbow.toFixed(1)} ${startY.toFixed(1)}`,
        `Q ${gutterX.toFixed(1)} ${startY.toFixed(1)} ${gutterX.toFixed(1)} ${(startY + 42).toFixed(1)}`,
        `L ${gutterX.toFixed(1)} ${jogY.toFixed(1)}`,
        `Q ${gutterX.toFixed(1)} ${(jogY + 22).toFixed(1)} ${(gutterX - 24).toFixed(1)} ${(jogY + 22).toFixed(1)}`,
        `L ${endX.toFixed(1)} ${(jogY + 22).toFixed(1)}`,
        `L ${endX.toFixed(1)} ${endY.toFixed(1)}`
      ].join(" ");

      [pipeShadow, pipeOutline, pipeBody, pipeHighlight, pipeWater].forEach((element) => {
        if (element) element.setAttribute("d", path);
      });

      if (pipeShadow) pipeShadow.setAttribute("transform", "translate(5 5)");

      const length = Math.max(1, pipeBody.getTotalLength());
      if (pipeWater) {
        pipeWater.style.strokeDasharray = String(length);
        pipeWater.style.strokeDashoffset = String(length * (1 - currentProgress));
      }

      if (jointsGroup) jointsGroup.textContent = "";

      if (jointsGroup) {
        jointsGroup.appendChild(createStartFlange(startX, startY, width));
      }

      jointData = [];
      const sections = $$("[data-pipe-section]").filter((section) => section.id !== "top");

      sections.forEach((section) => {
        const number = section.dataset.pipeNumber || "01";
        const sectionTop = documentTop(section);
        const jointY = section === footer ? sectionTop + 56 : sectionTop + 44;
        if (jointY > endY - 16) return;

        if (jointsGroup) {
          const joint = createJoint(gutterX, jointY, number, width);
          jointsGroup.appendChild(joint);
          jointData.push({ section, element: joint, y: jointY });
        }
      });

      if (jointObserver) jointObserver.disconnect();
      if ("IntersectionObserver" in window) {
        jointObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const joint = jointData.find((item) => item.section === entry.target);
            if (!joint) return;
            joint.element.classList.toggle("is-active", entry.isIntersecting);
            if (entry.isIntersecting) joint.element.classList.add("is-lit");
          });
        }, { rootMargin: "-28% 0px -55% 0px", threshold: 0 });
        jointData.forEach((joint) => jointObserver.observe(joint.section));
      }

      if (faucet) {
        faucet.setAttribute("transform", `translate(${endX.toFixed(1)} ${endY.toFixed(1)})`);
      }

      const streamStart = 70;
      const streamEnd = Math.max(streamStart + 64, nameTop + 24 - endY);
      const streamLength = streamEnd - streamStart;
      const streamPath = `M -96 ${streamStart} V ${streamEnd.toFixed(1)}`;

      [faucetStream, faucetStreamShine].forEach((stream) => {
        if (!stream) return;
        stream.setAttribute("d", streamPath);
        stream.style.strokeDasharray = String(streamLength);
        stream.style.strokeDashoffset = faucetOpened ? "0" : String(streamLength);
      });

      if (faucetSplash) {
        faucetSplash.setAttribute("transform", `translate(0 ${streamEnd.toFixed(1)})`);
      }

      metrics = { width, height, startX, startY, endX, endY, length };

      if (faucetOpened) {
        pipeLayer.classList.add("is-pouring");
        setLeverAngle(26);
      }

      updateWater();
      queueWater();
      requestAnimationFrame(updateWater);
    }

    function getScrollXSafe() {
      return window.scrollX || window.pageXOffset || 0;
    }

    function schedulePipeBuild() {
      window.clearTimeout(rebuildTimer);
      rebuildTimer = window.setTimeout(buildPipe, 120);
    }

    window.addEventListener("scroll", () => {
      if (!metrics) return;
      if (!waterFrame) queueWater();
      if (footer.getBoundingClientRect().top < window.innerHeight * 0.86) {
        openFaucet();
      }
    }, { passive: true });

    window.addEventListener("resize", schedulePipeBuild);

    if ("ResizeObserver" in window) {
      const pipeResizeObserver = new ResizeObserver(schedulePipeBuild);
      pipeResizeObserver.observe(document.body);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(schedulePipeBuild);
    }

    window.addEventListener("load", schedulePipeBuild);
    requestAnimationFrame(buildPipe);
  }

  /* FINAL */
})();
