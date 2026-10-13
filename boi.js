/* ============================================================
   Trang Xem Bói — logic
   - Đọc thông tin người dùng
   - Sinh lá số NHẤT QUÁN từ hash(tên + ngày sinh + giờ + lĩnh vực)
     (cùng thông tin => cùng kết quả)
   - Hiển thị loading rồi kết quả theo từng lĩnh vực
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Giao diện sáng/tối (dùng chung với trang chủ) ---------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = themeToggle ? themeToggle.querySelector(".theme-toggle__icon") : null;

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
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  /* ---------- Năm ở footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Hàm băm & sinh số ngẫu nhiên có seed ---------- */
  // cyrb53: băm chuỗi -> số nguyên 53-bit
  function hashString(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h2 = Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }
  // mulberry32: PRNG từ seed
  function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

  /* ---------- Dữ liệu lá số theo từng lĩnh vực ---------- */
  const AREAS = {
    "tinh-duyen": {
      icon: "💕", name: "Tình duyên",
      readings: [
        "Duyên đến chậm nhưng chắc. Người hợp với bạn thường xuất hiện khi bạn không còn gấp gáp. Nửa cuối năm, tình cảm có dấu hiệu khởi sắc rõ rệt.",
        "Trái tim đang ở thế 'nửa mở'. Bạn dễ rung động trước người biết lắng nghe. Hãy thả lỏng, đừng vì sợ cô đơn mà chọn sai người.",
        "Chuyện tình cảm có mây có nắng. Có lúc hiểu lầm nhỏ nhưng nếu kiên nhẫn, hai bên sẽ hiểu nhau hơn. Mùa thu là thời điểm đẹp để thổ lộ."
      ],
      advice: [
        "Hãy yêu thương bản thân trước, đúng người sẽ đến đúng lúc.",
        "Đừng để điện thoại xen vào giây phút trò chuyện quan trọng.",
        "Một lời hỏi thăm chân thành đáng giá hơn trăm lần khoe khoang."
      ],
      lucky: ["Màu hồng phấn", "Thứ Ba", "Số 2", "Hướng Đông"]
    },
    "su-nghiep": {
      icon: "💼", name: "Sự nghiệp",
      readings: [
        "Sự nghiệp đang đi lên từng bước. Công sức bạn bỏ ra sắp được ghi nhận. Tháng tới có cơ hội thăng tiến hoặc đổi vai trò tốt hơn.",
        "Bạn thuộc kiểu 'trễ mà chắc'. Đừng so sánh với người khác; lộ trình của bạn khác, nhưng đích đến sẽ rất tốt.",
        "Công việc có chút xáo trộn đầu kỳ nhưng sẽ ổn định. Nên chủ động học thêm một kỹ năng mới — nó sẽ là chìa khóa mở đường."
      ],
      advice: [
        "Đầu tư vào kỹ năng chuyên môn — đó là tài sản không ai lấy được.",
        "Xây dựng quan hệ tốt với đồng nghiệp, quý nhân thường ngồi gần bạn.",
        "Khi phân vân, hãy chọn con đường khó hơn một chút để lớn nhanh hơn."
      ],
      lucky: ["Màu xanh navy", "Thứ Năm", "Số 8", "Hướng Nam"]
    },
    "duong-doi": {
      icon: "🛤️", name: "Đường đời",
      readings: [
        "Đường đời bạn có 'quẻ' kiên trì. Tuổi càng lớn càng ung dung. Những tháng năm trước mang tính rèn luyện, sau này sẽ là mùa thu hoạch.",
        "Bạn sinh ra để trải nghiệm và chia sẻ. Cuộc đời có nhiều khúc quanh bất ngờ, nhưng mỗi khúc quanh đều dẫn bạn đến chỗ mình cần đến.",
        "Vận trình của bạn thường 'hậu phát'. Đừng nản khi đồng trang lứa đi trước — bạn sẽ đi xa hơn vào đúng thời điểm của mình."
      ],
      advice: [
        "Sống thật, tốt với mọi người — đó là phong thủy tốt nhất.",
        "Hãy giữ một thói quen tốt và duy trì nó ít nhất 21 ngày.",
        "Đi chậm lại đủ để cảm ơn những gì mình đang có."
      ],
      lucky: ["Màu tím", "Chủ Nhật", "Số 9", "Hướng Bắc"]
    },
    "tai-loc": {
      icon: "💰", name: "Tài lộc",
      readings: [
        "Tài lộc có quẻ 'nạp âm'. Tiền vào chậm nhưng chắc. Nên tích lũy đều đặn, tránh đầu tư mạo hiểm theo đám đông.",
        "Có tin vui về dòng tiền bất ngờ — có thể là thưởng, quà, hoặc khoản thu hồi. Nhưng đừng tiêu ngay, hãy để nó 'đẻ' thêm.",
        "Về tiền bạc, bạn cần người cộng sự đáng tin. Một mối quan hệ làm ăn đúng đắn sẽ mang lại lợi nhuận bền vững."
      ],
      advice: [
        "Chi tiêu theo quy tắc cần – cần thiết – thích thú.",
        "Luôn có quỹ dự phòng bằng 3 tháng chi tiêu.",
        "Đừng cho vay người thân số tiền mà bạn không thể mất."
      ],
      lucky: ["Màu vàng đồng", "Thứ Bảy", "Số 6", "Hướng Tây"]
    },
    "suc-khoe": {
      icon: "🌿", name: "Sức khỏe",
      readings: [
        "Thể lực ổn định nhưng cần chú ý giấc ngủ. Cơ thể đang 'gõ cửa' nhắc bạn nghỉ ngơi nhiều hơn. Ưu tiên ngủ sớm trong tháng này.",
        "Sức khỏe tinh thần là điểm cần lưu ý. Bạn hay suy nghĩ nhiều; hãy tìm cách xả stress như đi bộ, thiền hoặc trò chuyện cùng bạn bè.",
        "Quẻ 'dương cường': năng lượng dồi dào. Duy trì vận động nhẹ hàng ngày sẽ giúp bạn giữ nhịp tốt trong suốt mùa."
      ],
      advice: [
        "Uống đủ nước và đi bộ 20 phút mỗi ngày.",
        "Buông điện thoại trước khi ngủ 30 phút.",
        "Lắng nghe cơ thể — mệt thì nghỉ, đừng cố."
      ],
      lucky: ["Màu xanh lá", "Thứ Tư", "Số 5", "Hướng Đông Nam"]
    }
  };

  const OVERALL = [
    "Tổng thể vận trình của bạn đang ở thế 'vượng khí dần lên'. Những gì bạn gieo ở hôm nay sẽ cho quả ở đúng mùa.",
    "Thầy thấy bạn đang ở giai đoạn chuyển mình nhẹ: vừa khó vừa may. Hãy giữ lòng kiên nhẫn, mọi thứ sẽ sáng ra.",
    "Vận của bạn như nước ngầm — chảy lặng lẽ nhưng rất sâu. Biết người biết ta, trăm trận trăm thắng."
  ];

  /* ---------- Lấy phần tử DOM ---------- */
  const form = document.getElementById("boi-form");
  const errorEl = document.getElementById("boi-error");
  const loadingEl = document.getElementById("boi-loading");
  const loadingText = document.getElementById("boi-loading-text");
  const resultEl = document.getElementById("boi-result");
  const resName = document.getElementById("res-name");
  const resMeta = document.getElementById("res-meta");
  const resSummary = document.getElementById("res-summary");
  const resGrid = document.getElementById("res-grid");
  const btnAgain = document.getElementById("btn-again");

  if (!form) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Đọc lĩnh vực có sẵn trên URL (?area=...) ---------- */
  try {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get("area");
    if (preset) {
      const box = form.querySelector(`input[name="area"][value="${preset}"]`);
      if (box) box.checked = true;
    }
  } catch (err) { /* bỏ qua nếu không đọc được URL */ }

  /* ---------- Nhân vật 3D: mắt & đầu nhìn theo chuột ---------- */
  const mage = document.querySelector(".mage");
  const magePupilL = document.getElementById("mage-pupil-left");
  const magePupilR = document.getElementById("mage-pupil-right");
  const mageHead = document.querySelector(".mage-head");

  if (mage && magePupilL && magePupilR && !reduceMotion) {
    const MAX_PUPIL = 3.6;  // con ngươi liếc mạnh
    const MAX_HEAD = 1.8;   // cả đầu nghiêng nhẹ (parallax)
    let tx = 0, ty = 0, cx = 0, cy = 0;

    const onMove = (mx, my) => {
      const r = mage.getBoundingClientRect();
      const cxr = r.left + r.width / 2;
      const cyr = r.top + r.height / 2;
      const dx = (mx - cxr) / (r.width / 2);
      const dy = (my - cyr) / (r.height / 2);
      tx = Math.max(-1, Math.min(1, dx));
      ty = Math.max(-1, Math.min(1, dy));
    };

    window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches.length) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    const tick = () => {
      cx += (tx - cx) * 0.15;
      cy += (ty - cy) * 0.15;
      const px = (cx * MAX_PUPIL).toFixed(2);
      const py = (cy * MAX_PUPIL).toFixed(2);
      magePupilL.setAttribute("transform", `translate(${px} ${py})`);
      magePupilR.setAttribute("transform", `translate(${px} ${py})`);
      if (mageHead) {
        mageHead.setAttribute("transform", `translate(${(cx * MAX_HEAD).toFixed(2)} ${(cy * MAX_HEAD).toFixed(2)})`);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Tiện ích ---------- */
  const showError = (msg) => {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = !msg;
  };

  const formatDateVN = (iso) => {
    if (!iso) return "Không rõ";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  // Ước lượng tuổi âm lịch rất đơn giản (mang tính vui)
  const calcAge = (iso) => {
    if (!iso) return null;
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return null;
    const diff = Date.now() - d.getTime();
    return Math.max(0, Math.floor(diff / (365.25 * 24 * 3600 * 1000)));
  };

  /* ---------- Sinh lá số cho một lĩnh vực ---------- */
  function fortuneFor(areaKey, person, rng) {
    const data = AREAS[areaKey];
    const reading = pick(rng, data.readings);
    const advice = pick(rng, data.advice);
    const score = 55 + Math.floor(rng() * 46); // 55% - 100%
    const luckyIndex = Math.floor(rng() * data.lucky.length);
    const luckyNum = 1 + Math.floor(rng() * 9);
    return { data, reading, advice, score, luckyIndex, luckyNum };
  }

  /* ---------- Tạo thẻ kết quả cho 1 lĩnh vực ---------- */
  function renderItem(areaKey, f) {
    const article = document.createElement("article");
    article.className = "boi-item";
    article.innerHTML = `
      <div class="boi-item__head">
        <span class="boi-item__name">${f.data.icon} ${f.data.name}</span>
        <span class="boi-item__score">${f.score}%</span>
      </div>
      <div class="boi-item__bar"><div class="boi-item__fill" data-w="${f.score}%"></div></div>
      <p class="boi-item__text">${f.reading}</p>
      <p class="boi-item__text"><strong>Lời Thầy:</strong> ${f.advice}</p>
      <div class="boi-item__lucky">
        <b>Vật phẩm may mắn:</b> ${f.data.lucky[f.luckyIndex]} · <b>Số may mắn:</b> ${f.luckyNum}
      </div>
    `;
    return article;
  }


  /* ---------- Xử lý khi gửi form ---------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    showError("");

    const name = document.getElementById("inp-name").value.trim();
    const birth = document.getElementById("inp-birth").value;
    const time = document.getElementById("inp-time").value;
    const gender = document.getElementById("inp-gender").value;
    const areas = Array.from(form.querySelectorAll('input[name="area"]:checked')).map((i) => i.value);

    // Kiểm tra dữ liệu
    if (!name) { showError("Thầy cần biết tên của bạn mới xem được!"); return; }
    if (!birth) { showError("Hãy nhập ngày sinh để Thầy lập lá số nhé."); return; }
    if (areas.length === 0) { showError("Bạn chưa chọn lĩnh vực nào. Chọn ít nhất một nhé!"); return; }

    const person = { name, birth, time, gender, areas };

    // Ẩn form & hiện màn hình chờ
    form.hidden = true;
    resultEl.hidden = true;
    loadingEl.hidden = false;
    if (resultEl) resultEl.hidden = true;

    // Chuỗi chờ vui
    const steps = ["Thầy đang lắc quẻ…", "Đang bốc bài…", "Đang ngắm sao…", "Xem xong rồi!"];
    let step = 0;
    const totalWait = reduceMotion ? 300 : 1500;
    const stepInterval = totalWait / steps.length;

    const timer = setInterval(() => {
      step++;
      if (loadingText) loadingText.textContent = steps[Math.min(step, steps.length - 1)];
      if (step >= steps.length - 1) clearInterval(timer);
    }, stepInterval);

    setTimeout(() => {
      clearInterval(timer);
      renderResult(person);
    }, totalWait);
  });

  /* ---------- Hiển thị kết quả ---------- */
  function renderResult(person) {
    loadingEl.hidden = true;

    // Seed tổng (dùng cho câu tổng quan)
    const baseSeed = hashString(`${person.name}|${person.birth}|${person.time || ""}|${person.gender}`);
    const baseRng = makeRng(baseSeed);
    const overall = pick(baseRng, OVERALL);

    const age = calcAge(person.birth);
    const genderText = person.gender === "nam" ? "Nam" : person.gender === "nu" ? "Nữ" : "Không tiết lộ";
    const metaParts = [`Sinh ${formatDateVN(person.birth)}`];
    if (person.time) metaParts.push(`lúc ${person.time}`);
    metaParts.push(`Giới tính: ${genderText}`);
    if (age !== null) metaParts.push(`~${age} tuổi`);

    resName.textContent = person.name;
    resMeta.textContent = metaParts.join(" · ");
    resSummary.innerHTML = `<strong>🔔 Quẻ chủ đạo:</strong> ${overall}`;

    resGrid.innerHTML = "";
    person.areas.forEach((areaKey) => {
      const seed = hashString(`${person.name}|${person.birth}|${person.time || ""}|${person.gender}|${areaKey}`);
      const f = fortuneFor(areaKey, person, makeRng(seed));
      resGrid.appendChild(renderItem(areaKey, f));
    });

    resultEl.hidden = false;

    // Kích hoạt thanh % sau khi hiển thị
    requestAnimationFrame(() => {
      resGrid.querySelectorAll(".boi-item__fill").forEach((el) => {
        el.style.width = el.getAttribute("data-w");
      });
    });

    // Cuộn tới kết quả
    resultEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  /* ---------- Nút xem cho người khác ---------- */
  if (btnAgain) {
    btnAgain.addEventListener("click", () => {
      form.reset();
      resultEl.hidden = true;
      form.hidden = false;
      showError("");
      form.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      document.getElementById("inp-name").focus();
    });
  }
})();

