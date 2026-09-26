
(function() {
  function initArchGridAnim() {
    const container = document.querySelector("#truffl-recovery-concept .tr-grid-canvas");
    if (!container) return;
    let canvas = document.getElementById("tr-arch-bg-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "tr-arch-bg-canvas";
      canvas.className = "tr-grid-bg-canvas";
      container.insertBefore(canvas, container.firstChild);
    }
    const ctx = canvas.getContext("2d");
    let width = 0, height = 0;
    const CELL_SIZE = 72;
    let cols = 0, rows = 0;

    function resize() {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      cols = Math.ceil(width / CELL_SIZE);
      rows = Math.ceil(height / CELL_SIZE);
    }

    window.addEventListener("resize", resize);
    resize();

    const activeBoxes = [];
    const MAX_ACTIVE = 16;

    // Color palettes for Blue and White popping boxes
    const BLUE_PALETTE = [
      { fill: "#3b66d6", border: "#2548bc", glow: "rgba(59, 102, 214, 0.42)" },
      { fill: "#4470e2", border: "#2b52be", glow: "rgba(68, 112, 226, 0.40)" },
      { fill: "#315cff", border: "#1f46dc", glow: "rgba(49, 92, 255, 0.45)" }
    ];

    function createBox(col, row, forcedType) {
      if (col < 0 || col >= cols || row < 0 || row >= rows) return null;
      if (activeBoxes.some(b => b.col === col && b.row === row)) return null;

      let chosenType = forcedType;
      if (!chosenType) {
        const rand = Math.random();
        if (rand < 0.42) chosenType = "blue";
        else if (rand < 0.78) chosenType = "white";
        else chosenType = "blue-to-white";
      }

      const blueStyle = BLUE_PALETTE[Math.floor(Math.random() * BLUE_PALETTE.length)];
      const duration = 1200 + Math.random() * 1000;

      return {
        col,
        row,
        type: chosenType,
        blueStyle,
        startTime: performance.now(),
        duration: duration
      };
    }

    function spawnRandom() {
      if (cols <= 0 || rows <= 0) return;
      // Frequently spawn alternating Blue and White pairs or single boxes
      const isPair = Math.random() < 0.45;
      const col = Math.floor(Math.random() * cols);
      const row = Math.floor(Math.random() * rows);

      if (isPair) {
        // Spawn one blue box and one white box side-by-side or stacked
        const b1 = createBox(col, row, "blue");
        if (b1) activeBoxes.push(b1);

        const horizontal = Math.random() < 0.5;
        const col2 = horizontal ? (col + 1 < cols ? col + 1 : col - 1) : col;
        const row2 = horizontal ? row : (row + 1 < rows ? row + 1 : row - 1);
        const b2 = createBox(col2, row2, "white");
        if (b2) activeBoxes.push(b2);
      } else {
        const b = createBox(col, row);
        if (b) activeBoxes.push(b);
      }
    }

    // Seed initial active boxes staggered across animation progress
    for (let i = 0; i < 12; i++) {
      spawnRandom();
      if (activeBoxes[activeBoxes.length - 1]) {
        activeBoxes[activeBoxes.length - 1].startTime -= Math.random() * 1600;
      }
    }

    // Interactive mouse hover popping
    container.addEventListener("mousemove", function(e) {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const col = Math.floor(x / CELL_SIZE);
      const row = Math.floor(y / CELL_SIZE);
      const b = createBox(col, row, Math.random() < 0.5 ? "blue" : "white");
      if (b) activeBoxes.push(b);
    });

    function drawRoundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    let lastSpawn = performance.now();

    function render(now) {
      if (width === 0 || height === 0) {
        resize();
      }
      ctx.clearRect(0, 0, width, height);

      // Keep animation continuous and lively
      if (activeBoxes.length < MAX_ACTIVE && now - lastSpawn > 120) {
        spawnRandom();
        lastSpawn = now;
      }

      for (let i = activeBoxes.length - 1; i >= 0; i--) {
        const box = activeBoxes[i];
        if (now < box.startTime) continue;
        const elapsed = now - box.startTime;
        const progress = elapsed / box.duration;

        if (progress >= 1) {
          activeBoxes.splice(i, 1);
          continue;
        }

        let scale = 1;
        let alpha = 1;

        if (progress < 0.16) {
          // Energetic pop out with elastic overshoot
          const p = progress / 0.16;
          scale = 0.5 + 0.5 * Math.sin(p * Math.PI * 0.5) + 0.14 * Math.sin(p * Math.PI);
          alpha = p;
        } else if (progress < 0.74) {
          // Sustained prominent hold
          const p = (progress - 0.16) / 0.58;
          scale = 1.0 + 0.015 * Math.sin(p * Math.PI * 2);
          alpha = 1;
        } else {
          // Crisp pop off (shrinks down and vanishes)
          const p = (progress - 0.74) / 0.26;
          scale = 1.0 - 0.28 * p;
          alpha = 1 - p;
        }

        const cx = box.col * CELL_SIZE + CELL_SIZE / 2;
        const cy = box.row * CELL_SIZE + CELL_SIZE / 2;
        const boxSize = CELL_SIZE - 4; // 68px inside 72px grid
        const radius = 10;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        let isWhite = box.type === "white";
        if (box.type === "blue-to-white") {
          isWhite = progress > 0.45;
        }

        if (isWhite) {
          // Pure White Box popping out with crisp blue border & soft shadow
          ctx.shadowColor = "rgba(59, 102, 214, 0.24)";
          ctx.shadowBlur = 12;
          ctx.shadowOffsetY = 4;
          drawRoundRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize, radius);
          ctx.fillStyle = "#ffffff";
          ctx.fill();

          ctx.shadowColor = "transparent";
          ctx.strokeStyle = "#3b66d6";
          ctx.lineWidth = 1.8;
          ctx.stroke();
        } else {
          // Vibrant Truffl Blue Box popping out with colored glow
          ctx.shadowColor = box.blueStyle.glow;
          ctx.shadowBlur = 14;
          ctx.shadowOffsetY = 4;
          drawRoundRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize, radius);
          ctx.fillStyle = box.blueStyle.fill;
          ctx.fill();

          ctx.shadowColor = "transparent";
          ctx.strokeStyle = box.blueStyle.border;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }

        ctx.restore();
      }

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initArchGridAnim);
  } else {
    initArchGridAnim();
  }
})();
