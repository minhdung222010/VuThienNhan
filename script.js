/* ============================================================
   Tương tác cho trang giới thiệu cá nhân
   - Đổi giao diện sáng/tối (ghi nhớ lựa chọn)
   - Menu di động
   - Hiệu ứng xuất hiện khi cuộn
   - Thanh kỹ năng và đếm số
   - Năm tự động ở footer
   ============================================================ */

(function () {
  "use strict";

  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = themeToggle ? themeToggle.querySelector(".theme-toggle__icon") : null;

  /* ---------- 1. Giao diện sáng / tối ---------- */
  const getPreferredTheme = () => {
    const saved = localStorage.getItem("vtn-theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    if (themeIcon) themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("vtn-theme", theme);
  };

  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(current);
    });
  }

  /* ---------- 2. Menu di động ---------- */
  const burger = document.getElementById("nav-burger");
  const navMenu = document.getElementById("nav-menu");

  const closeMenu = () => {
    if (!burger || !navMenu) return;
    navMenu.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  };

  if (burger && navMenu) {
    burger.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");
      burger.classList.toggle("is-open", isOpen);
      burger.setAttribute("aria-expanded", String(isOpen));
    });
    // Đóng menu khi bấm vào một liên kết
    navMenu.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", closeMenu)
    );
  }

  /* ---------- 3. Hiệu ứng xuất hiện khi cuộn ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("is-visible");
          // Kích hoạt đếm số nếu phần tử chứa bộ đếm
          const counters = el.querySelectorAll(".about__stat-num");
          counters.forEach(runCounter);
          observer.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    // Dự phòng: hiện tất cả nếu trình duyệt không hỗ trợ
    revealEls.forEach((el) => el.classList.add("is-visible"));
    document.querySelectorAll(".about__stat-num").forEach(runCounter);
  }

  /* ---------- 4. Đếm số ---------- */
  function runCounter(el) {
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    const duration = 1400;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // hiệu ứng easing
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- 5. Đổ bóng thanh điều hướng khi cuộn ---------- */
  const navbar = document.getElementById("navbar");
  const onScroll = () => {
    if (navbar) navbar.classList.toggle("is-scrolled", window.scrollY > 20);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 6. Năm ở footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 7. Avatar 3D: mắt & mặt theo hướng chuột ---------- */
  const avatar = document.querySelector(".hero__avatar-svg");
  const pupilLeft = document.getElementById("pupil-left");
  const pupilRight = document.getElementById("pupil-right");
  const faceLean = document.querySelector(".face-lean");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (avatar && pupilLeft && pupilRight && !reduceMotion) {
    // Vị trí nghỉ của con ngươi (tâm mắt) trong toạ độ viewBox 200x200
    const MAX_PUPIL = 3.4;   // độ lệch tối đa của con ngươi (giữ trong lòng trắng)
    const MAX_LEAN = 2.2;    // độ nghiêng tối đa của nét mặt
    let targetX = 0, targetY = 0;   // mục tiêu (-1 .. 1)
    let curX = 0, curY = 0;         // giá trị hiện tại (đã lerp)

    const onMove = (clientX, clientY) => {
      const rect = avatar.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Vector hướng từ tâm avatar tới chuột, chuẩn hoá theo nửa kích thước
      const dx = (clientX - cx) / (rect.width / 2);
      const dy = (clientY - cy) / (rect.height / 2);
      // Giới hạn về [-1, 1] để không dịch chuyển quá mức
      targetX = Math.max(-1, Math.min(1, dx));
      targetY = Math.max(-1, Math.min(1, dy));
    };

    window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches.length) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    // Vòng lặp render với lerp cho chuyển động mượt mà
    const tick = () => {
      curX += (targetX - curX) * 0.15;
      curY += (targetY - curY) * 0.15;

      const px = (curX * MAX_PUPIL).toFixed(2);
      const py = (curY * MAX_PUPIL).toFixed(2);
      pupilLeft.setAttribute("transform", `translate(${px} ${py})`);
      pupilRight.setAttribute("transform", `translate(${px} ${py})`);

      if (faceLean) {
        const lx = (curX * MAX_LEAN).toFixed(2);
        const ly = (curY * MAX_LEAN).toFixed(2);
        faceLean.setAttribute("transform", `translate(${lx} ${ly})`);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
})();
