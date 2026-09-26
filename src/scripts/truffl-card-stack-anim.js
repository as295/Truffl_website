
(function() {
  function initCardStack() {
    const section = document.getElementById("tr-engines-section");
    if (!section) return;
    const grid = document.getElementById("tr-engines-grid");
    const toggleBtn = document.getElementById("tr-stack-cycle-btn");
    const cards = grid ? grid.querySelectorAll(".tr-engine-card") : [];
    if (!grid || cards.length === 0) return;

    let isStacked = false;
    let autoInterval = null;
    let isUserInteracting = false;
    let resumeTimeout = null;

    function setStacked(stacked) {
      isStacked = stacked;
      if (isStacked) {
        grid.classList.remove("is-spread");
        grid.classList.add("is-stacked");
        if (toggleBtn) {
          toggleBtn.querySelector(".btn-label").textContent = "Fan out cards";
        }
      } else {
        grid.classList.remove("is-stacked");
        grid.classList.add("is-spread");
        if (toggleBtn) {
          toggleBtn.querySelector(".btn-label").textContent = "Fold into stack";
        }
      }
    }

    function toggle() {
      setStacked(!isStacked);
    }

    if (toggleBtn) {
      toggleBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        toggle();
        pauseAutoCycle();
      });
    }

    cards.forEach(card => {
      card.addEventListener("click", function() {
        toggle();
        pauseAutoCycle();
      });
    });

    function startAutoCycle() {
      stopAutoCycle();
      autoInterval = setInterval(function() {
        if (!isUserInteracting) {
          toggle();
        }
      }, 4500);
    }

    function stopAutoCycle() {
      if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
      }
    }

    function pauseAutoCycle() {
      isUserInteracting = true;
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(function() {
        isUserInteracting = false;
      }, 10000);
    }

    grid.addEventListener("mouseenter", function() {
      isUserInteracting = true;
    });
    grid.addEventListener("mouseleave", function() {
      isUserInteracting = false;
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) {
          startAutoCycle();
        } else {
          stopAutoCycle();
        }
      }, { threshold: 0.15 });
      observer.observe(section);
    } else {
      startAutoCycle();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCardStack);
  } else {
    initCardStack();
  }
})();
