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
        "Chuyện tình cảm có mây có nắng. Có lúc hiểu lầm nhỏ nhưng nếu kiên nhẫn, hai bên sẽ hiểu nhau hơn. Mùa thu là thời điểm đẹp để thổ lộ.",
        "Đào hoa đang nở rộ. Người cũ có thể quay lại, người mới cũng đang tới gần. Hãy để lý trí dẫn đường, đừng để cảm xúc nhất thời quyết định.",
        "Tình duyên của bạn mang quẻ 'tương phùng'. Người bạn từng lướt qua trong quá khứ có thể là mối duyên trời định. Hãy mở lòng đón nhận.",
        "Thầy thấy bạn đang được ai đó để ý thầm. Người ấy hiền lành, chân thành nhưng hơi nhút nhát. Một tín hiệu nhỏ từ bạn sẽ khiến mọi thứ bừng sáng.",
        "Năm nay tình cảm có thăng có trầm. Đầu năm bình lặng, giữa năm sóng gió, cuối năm viên mãn. Ai đi qua được sóng gió cùng bạn mới là chân tình.",
        "Duyên phận của bạn gắn với chữ 'nhẫn'. Càng vội càng lỡ, càng thong thả càng gặp đúng người. Hãy chăm sóc bản thân thật tốt, tình yêu sẽ tự tìm đến."
      ],
      advice: [
        "Hãy yêu thương bản thân trước, đúng người sẽ đến đúng lúc.",
        "Đừng để điện thoại xen vào giây phút trò chuyện quan trọng.",
        "Một lời hỏi thăm chân thành đáng giá hơn trăm lần khoe khoang.",
        "Học cách lắng nghe trước khi đáp lời — người ấy sẽ cảm động lắm.",
        "Đừng so sánh tình yêu của mình với người khác trên mạng.",
        "Dành một buổi tối mỗi tuần cho người mình thương, không công việc."
      ],
      lucky: ["Màu hồng phấn", "Thứ Ba", "Số 2", "Hướng Đông", "Màu đỏ rượu", "Thứ Sáu", "Số 9", "Hoa hồng"]
    },
    "su-nghiep": {
      icon: "💼", name: "Sự nghiệp",
      readings: [
        "Sự nghiệp đang đi lên từng bước. Công sức bạn bỏ ra sắp được ghi nhận. Tháng tới có cơ hội thăng tiến hoặc đổi vai trò tốt hơn.",
        "Bạn thuộc kiểu 'trễ mà chắc'. Đừng so sánh với người khác; lộ trình của bạn khác, nhưng đích đến sẽ rất tốt.",
        "Công việc có chút xáo trộn đầu kỳ nhưng sẽ ổn định. Nên chủ động học thêm một kỹ năng mới — nó sẽ là chìa khóa mở đường.",
        "Quý nhân đang ở rất gần — có thể là sếp, đồng nghiệp lớn tuổi hoặc người thầy cũ. Hãy mạnh dạn hỏi, bạn sẽ được chỉ đường.",
        "Thầy thấy quẻ 'khai trương': hợp khởi sự việc mới, nhận dự án mới hoặc chuyển hướng. Cứ làm, trời không phụ người có chí.",
        "Giai đoạn này nên 'thủ' hơn 'công'. Củng cố vị trí hiện tại, hoàn thiện kỹ năng, chờ thời cơ chín muồi rồi bung ra.",
        "Có dấu hiệu thay đổi môi trường làm việc theo hướng tốt hơn. Đừng sợ xáo trộn — cái mới sẽ hợp với bạn hơn cái cũ.",
        "Sự nghiệp của bạn gắn với chữ 'tín'. Giữ uy tín, làm đúng hẹn, nói ít làm nhiều — tiếng lành đồn xa, cơ hội tự tới."
      ],
      advice: [
        "Đầu tư vào kỹ năng chuyên môn — đó là tài sản không ai lấy được.",
        "Xây dựng quan hệ tốt với đồng nghiệp, quý nhân thường ngồi gần bạn.",
        "Khi phân vân, hãy chọn con đường khó hơn một chút để lớn nhanh hơn.",
        "Ghi lại thành quả mỗi tuần — đến lúc cần, bạn sẽ có thứ để nói.",
        "Đừng ngại nhận việc khó, đó là vé thăng hạng nhanh nhất.",
        "Giữ giờ giấc và lời hứa — uy tín là vốn lớn nhất chốn công sở."
      ],
      lucky: ["Màu xanh navy", "Thứ Năm", "Số 8", "Hướng Nam", "Màu xám bạc", "Thứ Hai", "Số 1", "Cây kim tiền"]
    },
    "duong-doi": {
      icon: "🛤️", name: "Đường đời",
      readings: [
        "Đường đời bạn có 'quẻ' kiên trì. Tuổi càng lớn càng ung dung. Những tháng năm trước mang tính rèn luyện, sau này sẽ là mùa thu hoạch.",
        "Bạn sinh ra để trải nghiệm và chia sẻ. Cuộc đời có nhiều khúc quanh bất ngờ, nhưng mỗi khúc quanh đều dẫn bạn đến chỗ mình cần đến.",
        "Vận trình của bạn thường 'hậu phát'. Đừng nản khi đồng trang lứa đi trước — bạn sẽ đi xa hơn vào đúng thời điểm của mình.",
        "Thầy thấy bạn mang mệnh 'người gieo hạt'. Việc tốt bạn làm hôm nay, dù nhỏ, sau này sẽ nở thành rừng cây che mát cho chính bạn.",
        "Đường đời có ba nấc thang lớn, bạn đang ở nấc thứ hai. Nấc này vất vả nhất nhưng cũng là nấc quyết định — cố lên, đỉnh gần lắm rồi.",
        "Bạn hợp với cuộc sống 'vừa đủ mà vui'. Đừng chạy theo chuẩn của thiên hạ; hạnh phúc của bạn nằm ở những điều giản dị nhất.",
        "Quẻ 'viễn hành': đi xa sẽ gặp may. Một chuyến đi, một lần chuyển chỗ ở hoặc đổi môi trường sẽ mở ra vận mới cho bạn.",
        "Đời bạn như dòng sông — có đoạn êm, đoạn thác, nhưng cuối cùng đều ra biển lớn. Cứ thuận dòng mà tiến, đừng cưỡng cầu."
      ],
      advice: [
        "Sống thật, tốt với mọi người — đó là phong thủy tốt nhất.",
        "Hãy giữ một thói quen tốt và duy trì nó ít nhất 21 ngày.",
        "Đi chậm lại đủ để cảm ơn những gì mình đang có.",
        "Mỗi năm học một điều mới — đời bạn sẽ không bao giờ nhàm chán.",
        "Giữ liên lạc với gia đình, đó là gốc rễ của mọi vận may.",
        "Viết nhật ký mỗi tối — bạn sẽ thấy mình trưởng thành từng ngày."
      ],
      lucky: ["Màu tím", "Chủ Nhật", "Số 9", "Hướng Bắc", "Màu trắng ngà", "Thứ Tư", "Số 7", "Đá thạch anh"]
    },
    "tai-loc": {
      icon: "💰", name: "Tài lộc",
      readings: [
        "Tài lộc có quẻ 'nạp âm'. Tiền vào chậm nhưng chắc. Nên tích lũy đều đặn, tránh đầu tư mạo hiểm theo đám đông.",
        "Có tin vui về dòng tiền bất ngờ — có thể là thưởng, quà, hoặc khoản thu hồi. Nhưng đừng tiêu ngay, hãy để nó 'đẻ' thêm.",
        "Về tiền bạc, bạn cần người cộng sự đáng tin. Một mối quan hệ làm ăn đúng đắn sẽ mang lại lợi nhuận bền vững.",
        "Thầy thấy quẻ 'khai nguồn': hợp mở thêm nguồn thu thứ hai. Việc tay trái ban đầu nhỏ, sau này có khi vượt cả việc chính.",
        "Tài vận đang lên theo hình bậc thang — mỗi bậc một nấc cao hơn. Kiên nhẫn tích lũy, đừng ham giàu nhanh mà trượt chân.",
        "Có lộc từ phương xa hoặc từ người ít gặp. Một cuộc gọi, một tin nhắn cũ có thể mang theo cơ hội tiền bạc.",
        "Năm nay nên 'giữ' hơn 'đánh'. Tiền mặt là vua; ai giữ được tiền lúc khó khăn, lúc thuận lợi sẽ bứt phá.",
        "Lộc của bạn gắn với chữ 'đức'. Càng cho đi đúng cách, tiền càng quay lại nhiều hơn. Làm ăn có tâm, khách tự tìm đến."
      ],
      advice: [
        "Chi tiêu theo quy tắc cần – cần thiết – thích thú.",
        "Luôn có quỹ dự phòng bằng 3 tháng chi tiêu.",
        "Đừng cho vay người thân số tiền mà bạn không thể mất.",
        "Trích 10% thu nhập để tiết kiệm ngay khi nhận lương.",
        "Trước khi mua món đắt tiền, hãy đợi 3 ngày rồi quyết.",
        "Học một chút về đầu tư — tiền nhàn rỗi không nên nằm yên."
      ],
      lucky: ["Màu vàng đồng", "Thứ Bảy", "Số 6", "Hướng Tây", "Màu xanh lá đậm", "Thứ Năm", "Số 3", "Tỳ hưu"]
    },
    "suc-khoe": {
      icon: "🌿", name: "Sức khỏe",
      readings: [
        "Thể lực ổn định nhưng cần chú ý giấc ngủ. Cơ thể đang 'gõ cửa' nhắc bạn nghỉ ngơi nhiều hơn. Ưu tiên ngủ sớm trong tháng này.",
        "Sức khỏe tinh thần là điểm cần lưu ý. Bạn hay suy nghĩ nhiều; hãy tìm cách xả stress như đi bộ, thiền hoặc trò chuyện cùng bạn bè.",
        "Quẻ 'dương cường': năng lượng dồi dào. Duy trì vận động nhẹ hàng ngày sẽ giúp bạn giữ nhịp tốt trong suốt mùa.",
        "Dạ dày và đường ruột cần được quan tâm. Ăn đúng bữa, nhai kỹ, bớt đồ cay nóng — cơ thể sẽ cảm ơn bạn rất nhiều.",
        "Thầy thấy bạn hay thức khuya ôm điện thoại. Mắt và cổ vai gáy đang 'kêu cứu'. Hãy cho chúng nghỉ ngơi, vận may sức khỏe sẽ quay lại.",
        "Mùa này hợp vận động ngoài trời: đi bộ, đạp xe, hít thở sâu. Thiên nhiên là liều thuốc bổ miễn phí tốt nhất cho bạn.",
        "Tinh thần quyết định 70% sức khỏe của bạn. Cười nhiều hơn, lo ít đi — bệnh vặt sẽ tự tránh xa.",
        "Quẻ 'trường sinh': nền tảng sức khỏe của bạn rất tốt. Chỉ cần duy trì nếp sống điều độ, bạn sẽ khỏe hơn đa số người cùng tuổi."
      ],
      advice: [
        "Uống đủ nước và đi bộ 20 phút mỗi ngày.",
        "Buông điện thoại trước khi ngủ 30 phút.",
        "Lắng nghe cơ thể — mệt thì nghỉ, đừng cố.",
        "Ăn sáng đầy đủ, đó là bữa quan trọng nhất ngày.",
        "Đứng dậy vươn vai mỗi giờ nếu ngồi làm việc lâu.",
        "Khám sức khỏe định kỳ — phòng bệnh hơn chữa bệnh."
      ],
      lucky: ["Màu xanh lá", "Thứ Tư", "Số 5", "Hướng Đông Nam", "Màu cam nhạt", "Chủ Nhật", "Số 4", "Trà thảo mộc"]
    }
  };

  const OVERALL = [
    "Tổng thể vận trình của bạn đang ở thế 'vượng khí dần lên'. Những gì bạn gieo ở hôm nay sẽ cho quả ở đúng mùa.",
    "Thầy thấy bạn đang ở giai đoạn chuyển mình nhẹ: vừa khó vừa may. Hãy giữ lòng kiên nhẫn, mọi thứ sẽ sáng ra.",
    "Vận của bạn như nước ngầm — chảy lặng lẽ nhưng rất sâu. Biết người biết ta, trăm trận trăm thắng.",
    "Quẻ tổng quan báo 'cát tinh cao chiếu'. Việc lớn nên làm, việc khó nên thử — trời đang đứng về phía người dám bước.",
    "Vận trình của bạn như bình minh: tối đã qua, sáng đang tới. Ai kiên nhẫn thêm một chút sẽ thấy mặt trời.",
    "Thầy thấy ba chữ cho năm nay của bạn: 'ổn – tiến – vui'. Giữ ổn, dám tiến, ắt sẽ vui.",
    "Tổng thể lá số cho thấy bạn đang tích phúc. Cứ sống tử tế, làm việc chăm chỉ — vận may đang xếp hàng chờ bạn.",
    "Quẻ 'thiên thời': đúng người, đúng việc, chỉ còn chờ đúng thời điểm. Hãy chuẩn bị thật kỹ, cơ hội gõ cửa là mở ngay."
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
  const btnShare = document.getElementById("btn-share");
  const btnHistory = document.getElementById("btn-history");
  const historyBox = document.getElementById("boi-history");
  const historyList = document.getElementById("history-list");
  const btnClearHistory = document.getElementById("btn-clear-history");
  const HISTORY_KEY = "vtn-boi-history";
  let lastPerson = null;

  /* ---------- Lịch sử: lưu 10 lần xem gần nhất ---------- */
  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    catch (_) { return []; }
  }
  function saveHistoryEntry(person) {
    const list = loadHistory();
    // Tránh trùng: cùng tên + ngày sinh + lĩnh vực thì đưa lên đầu
    const key = `${person.name}|${person.birth}|${person.areas.join(",")}`;
    const next = [{ ...person, key, at: new Date().toISOString() },
      ...list.filter((e) => e.key !== key)].slice(0, 10);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch (_) {}
  }
  function renderHistoryList() {
    const list = loadHistory();
    historyList.innerHTML = "";
    if (!list.length) {
      historyList.innerHTML = '<li class="boi-history__empty">Chưa có lần xem nào. Xem bói xong sẽ lưu ở đây!</li>';
      return;
    }
    list.forEach((entry) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      const areaNames = entry.areas.map((a) => (AREAS[a] ? AREAS[a].name : a)).join(", ");
      const when = new Date(entry.at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
      btn.innerHTML = `<span>🔮 <b></b> · ${areaNames}</span><span>${when}</span>`;
      btn.querySelector("b").textContent = entry.name;
      btn.addEventListener("click", () => {
        historyBox.hidden = true;
        renderResult(entry);
        mageSpeak("Ta đã mở lại lá số cũ cho ngươi xem!", 2400);
      });
      li.appendChild(btn);
      historyList.appendChild(li);
    });
  }
  if (btnHistory) {
    btnHistory.addEventListener("click", () => {
      historyBox.hidden = !historyBox.hidden;
      if (!historyBox.hidden) renderHistoryList();
    });
  }
  if (btnClearHistory) {
    btnClearHistory.addEventListener("click", () => {
      try { localStorage.removeItem(HISTORY_KEY); } catch (_) {}
      renderHistoryList();
    });
  }

  /* ---------- Chia sẻ lá số ---------- */
  if (btnShare) {
    btnShare.addEventListener("click", async () => {
      if (!lastPerson) return;
      const areaNames = lastPerson.areas.map((a) => (AREAS[a] ? `${AREAS[a].icon} ${AREAS[a].name}` : a)).join(", ");
      const text = `🔮 Lá số của ${lastPerson.name} do Thầy Vũ Thiện Nhân xem: ${areaNames}. Mời bạn vào xem bói tại quán của Thầy!`;
      const url = location.href.split("?")[0];
      // Ưu tiên Web Share API (điện thoại), rồi clipboard, cuối cùng là prompt
      if (navigator.share) {
        try { await navigator.share({ title: "Lá số của " + lastPerson.name, text, url }); mageSpeak("Đã gửi lá số đi xa… duyên lành sẽ tới!", 2400); }
        catch (_) { /* người dùng hủy */ }
      } else if (navigator.clipboard) {
        try { await navigator.clipboard.writeText(`${text} ${url}`); mageSpeak("Đã chép lá số! Dán lên Facebook khoe đi nào!", 2600); }
        catch (_) { window.prompt("Chép đoạn này để chia sẻ:", `${text} ${url}`); }
      } else {
        window.prompt("Chép đoạn này để chia sẻ:", `${text} ${url}`);
      }
    });
  }

  if (!form) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Slider chọn lĩnh vực (lướt ngang mượt) ---------- */
  (function initAreaSlider() {
    var viewport = document.getElementById("boi-viewport");
    if (!viewport) return;
    var track = document.getElementById("boi-track");
    var prevBtn = document.getElementById("boi-prev");
    var nextBtn = document.getElementById("boi-next");
    var dotsWrap = document.getElementById("boi-dots");
    var slides = track ? Array.prototype.slice.call(track.querySelectorAll(".boi-slide")) : [];
    if (!track || slides.length === 0) return;

    var step = function () {
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 12;
      return slides[0].getBoundingClientRect().width + gap;
    };

    var dots = [];
    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var d = document.createElement("button");
        d.type = "button";
        d.className = "boi-slider__dot";
        d.setAttribute("aria-label", "Di toi linh vuc " + (i + 1));
        d.addEventListener("click", function () {
          viewport.scrollTo({ left: slides[i].offsetLeft - viewport.clientWidth / 2 + slides[i].offsetWidth / 2, behavior: reduceMotion ? "auto" : "smooth" });
        });
        dotsWrap.appendChild(d);
        dots.push(d);
      });
    }

    var update = function () {
      var maxScroll = viewport.scrollWidth - viewport.clientWidth;
      if (prevBtn) prevBtn.disabled = viewport.scrollLeft <= 4;
      if (nextBtn) nextBtn.disabled = viewport.scrollLeft >= maxScroll - 4;
      var center = viewport.scrollLeft + viewport.clientWidth / 2;
      var best = 0, bestDist = Infinity;
      slides.forEach(function (s, i) {
        var c = s.offsetLeft + s.offsetWidth / 2;
        var dist = Math.abs(c - center);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === best); });
    };

    if (prevBtn) prevBtn.addEventListener("click", function () { viewport.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" }); });
    if (nextBtn) nextBtn.addEventListener("click", function () { viewport.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" }); });

    var raf = null;
    viewport.addEventListener("scroll", function () {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener("resize", update);

    var dragging = false, dragMoved = false, startX = 0, startScroll = 0;
    viewport.addEventListener("pointerdown", function (e) {
      dragging = true; dragMoved = false;
      startX = e.clientX; startScroll = viewport.scrollLeft;
      viewport.classList.add("is-dragging");
    });
    viewport.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      // Chỉ coi là kéo khi di chuyển rõ rệt; click thường không chặn chọn ô
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 8) {
        dragMoved = true;
        viewport.scrollLeft = startScroll - dx;
      }
    });
    var endDrag = function () { dragging = false; dragMoved = false; viewport.classList.remove("is-dragging"); };
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    // Chuột nhả ngoài khung (không còn pointer capture) vẫn phải reset, nếu không click sau bị chặn oan
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    // Nếu vừa kéo xong thì chặn 1 click "ma" ngay sau đó; click chọn ô bình thường cho qua
    track.addEventListener("click", function (e) {
      if (dragMoved) { e.preventDefault(); e.stopPropagation(); dragMoved = false; }
    }, true);

    viewport.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); viewport.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" }); }
      if (e.key === "ArrowLeft") { e.preventDefault(); viewport.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" }); }
    });

    requestAnimationFrame(function () {
      update();
      try {
        var preset = new URLSearchParams(window.location.search).get("area");
        if (preset) {
          var box = track.querySelector('input[value="' + preset + '"]');
          if (box) {
            var slide = box.closest(".boi-slide");
            if (slide) viewport.scrollTo({ left: slide.offsetLeft - viewport.clientWidth / 2 + slide.offsetWidth / 2, behavior: "auto" });
            update();
          }
        }
      } catch (err) {}
    });
  })();

  /* ---------- Nhan vat 3D: mat & dau nhin theo chuot ---------- */
  const mage = document.querySelector(".mage");
  const magePupilL = document.getElementById("mage-pupil-left");
  const magePupilR = document.getElementById("mage-pupil-right");
  const mageHead = document.querySelector(".mage-head");
  const mageWrap = document.getElementById("mage-wrap") || mage?.closest(".mage-wrap");
  const mageSpeech = document.getElementById("mage-speech");
  let speechTimer = null;

  /* Thầy nói một câu trong bong bóng thoại */
  function mageSpeak(text, duration = 2600) {
    if (!mageSpeech) return;
    mageSpeech.textContent = text;
    mageSpeech.hidden = false;
    requestAnimationFrame(() => mageSpeech.classList.add("show"));
    if (speechTimer) clearTimeout(speechTimer);
    speechTimer = setTimeout(() => {
      mageSpeech.classList.remove("show");
      speechTimer = setTimeout(() => { mageSpeech.hidden = true; }, 320);
    }, duration);
  }
  /* Thầy múa gậy khi "lắc quẻ" */
  function mageCastStart() { if (mageWrap) mageWrap.classList.add("casting"); }
  function mageCastStop() { if (mageWrap) mageWrap.classList.remove("casting"); }

  const MAGE_GREETINGS = [
    "Hữu duyên thiên lý năng tương ngộ… mời nhập tên để ta xem!",
    "Để ta ngắm tướng ngươi một lát… ừm, khí sắc không tệ!",
    "Ngươi muốn hỏi tình duyên hay sự nghiệp? Cứ chọn, ta xem hết!",
    "Hôm nay sao sáng, quẻ đẹp… đừng bỏ lỡ thời cơ!"
  ];
  const MAGE_CASTING = [
    "Để ta lắc quẻ… rung đùi… bấm độn…",
    "Hỡi các vì sao, xin hãy mách bảo!",
    "Gậy thần ơi, xoay đi… quẻ hiện ra nào!",
    "Ta đang nhìn thấu vận mệnh của ngươi…"
  ];
  const MAGE_DONE_GOOD = [
    "Quẻ đẹp đấy! Vận đỏ như son, nhớ nắm lấy!",
    "Ha ha! Cát tinh cao chiếu — chúc mừng ngươi!"
  ];
  const MAGE_DONE_MID = [
    "Quẻ này nửa hung nửa cát… đọc kỹ lời ta dặn nhé!",
    "Vận đang chuyển mình… kiên nhẫn là chìa khóa!"
  ];

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
      // Dùng CSS transform để ăn khớp với transition trong CSS
      magePupilL.style.transform = `translate(${px}px, ${py}px)`;
      magePupilR.style.transform = `translate(${px}px, ${py}px)`;
      if (mageHead) {
        mageHead.style.transform = `translate(${(cx * MAX_HEAD).toFixed(2)}px, ${(cy * MAX_HEAD).toFixed(2)}px)`;
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
  // Tính tuổi từ ngày sinh ISO (yyyy-mm-dd); trả về null nếu không hợp lệ
  const calcAge = (iso) => {
    if (!iso) return null;
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age >= 0 && age < 150 ? age : null;
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
    const totalWait = reduceMotion ? 300 : 3600;
    const stepInterval = totalWait / steps.length;

    // Thầy múa gậy + nói trong lúc lắc quẻ
    mageCastStart();
    mageSpeak(pick(Math.random, MAGE_CASTING), Math.min(totalWait, 3000));

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
    // Dừng múa gậy, lưu lịch sử + Thầy nhận xét theo quẻ
    mageCastStop();
    lastPerson = person;
    saveHistoryEntry(person);
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
      if (areaKey === "tarot" || !AREAS[areaKey]) return; // mục Tarot không mở lại bằng lá số thường
      const seed = hashString(`${person.name}|${person.birth}|${person.time || ""}|${person.gender}|${areaKey}`);
      const f = fortuneFor(areaKey, person, makeRng(seed));
      resGrid.appendChild(renderItem(areaKey, f));
    });

    resultEl.hidden = false;

    // Thầy nhận xét theo điểm trung bình thật của lá số
    try {
      const scores = Array.from(resGrid.querySelectorAll(".boi-item__fill"))
        .map((el) => parseInt(el.getAttribute("data-w"), 10) || 0);
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 75;
      mageSpeak(pick(Math.random, avg >= 78 ? MAGE_DONE_GOOD : MAGE_DONE_MID), 3200);
    } catch (_) { /* không chặn hiển thị kết quả */ }

    // Kích hoạt thanh % sau khi hiển thị
    requestAnimationFrame(() => {
      resGrid.querySelectorAll(".boi-item__fill").forEach((el) => {
        el.style.width = el.getAttribute("data-w");
      });
    });

    // Cuộn tới kết quả
    resultEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  const TAROT_POS = ["Quá khứ", "Hiện tại", "Tương lai"];
  const tarotBox = document.getElementById("tarot");
  const tarotDeck = document.getElementById("tarot-deck");
  const btnTarot = document.getElementById("btn-tarot");
  const btnTarotShuffle = document.getElementById("btn-tarot-shuffle");
  let tarotPicks = [];
  function tarotDeal(rng) {
    tarotPicks = [];
    tarotDeck.innerHTML = "";
    const pool = TAROT.slice();
    for (let n = 0; n < 9 && pool.length; n++) {
      const k = Math.floor((rng ? rng() : Math.random()) * pool.length);
      const card = pool.splice(k, 1)[0];
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tarot-card";
      b.setAttribute("aria-label", "La bai up, cham de lat");
      b.innerHTML = '<span class="tarot-card__inner"><span class="tarot-card__face tarot-card__back">🔮<small>Thay Nhan</small></span><span class="tarot-card__face tarot-card__front"><span class="tarot-card__emoji">' + card.emoji + '</span><span class="tarot-card__name">' + card.name + '</span><span class="tarot-card__pos"></span></span></span>';
      b.addEventListener("click", () => {
        if (b.classList.contains("flipped")) return;
        if (tarotPicks.length >= 3) { mageSpeak("Chi duoc chon 3 la! Bam Xao bai de choi lai.", 2400); return; }
        b.classList.add("flipped", "picked");
        const pos = TAROT_POS[tarotPicks.length];
        b.querySelector(".tarot-card__pos").textContent = pos;
        tarotPicks.push({ pos: pos, name: card.name, emoji: card.emoji, meaning: card.meaning });
        mageSpeak(pos === "Quá khứ" ? "La 1: qua khu…" : pos === "Hiện tại" ? "La 2: hien tai…" : "La cuoi: tuong lai… de ta luan!", 2200);
        if (tarotPicks.length === 3) {
          tarotDeck.querySelectorAll(".tarot-card:not(.flipped)").forEach((x) => { x.disabled = true; x.style.opacity = "0.45"; });
          setTimeout(tarotShow, reduceMotion ? 100 : 900);
        }
      });
      tarotDeck.appendChild(b);
    }
  }
  function tarotShow() {
    const nmEl = document.getElementById("inp-name");
    const nm = (nmEl && nmEl.value.trim()) || "ban";
    resName.textContent = nm;
    resMeta.textContent = "Trai bai Tarot 3 la · Qua khu – Hien tai – Tuong lai";
    resSummary.innerHTML = "<strong>🔔 Thay luan:</strong> Ba la bai da noi len hanh trinh cua " + nm + ". Doc ky tung la nhe!";
    resGrid.innerHTML = "";
    tarotPicks.forEach((p, i) => {
      const pct = 68 + ((hashString(nm + p.name) + i * 7) % 28);
      const item = document.createElement("article");
      item.className = "boi-item";
      item.innerHTML = '<div class="boi-item__head"><span class="boi-item__name">' + p.emoji + " " + p.pos + '</span><span class="boi-item__score">' + pct + '%</span></div><div class="boi-item__bar"><div class="boi-item__fill" data-w="' + pct + '%"></div></div><p class="boi-item__text"><b>' + p.name + ":</b> " + p.meaning + "</p>";
      resGrid.appendChild(item);
    });
    lastPerson = { name: nm, birth: "tarot", time: "", gender: "", areas: ["tarot"] };
    form.hidden = true;
    loadingEl.hidden = true;
    if (historyBox) historyBox.hidden = true;
    resultEl.hidden = false;
    requestAnimationFrame(() => { resGrid.querySelectorAll(".boi-item__fill").forEach((el) => { el.style.width = el.getAttribute("data-w"); }); });
    resultEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    mageSpeak("Bai da lat het! Que nay… rat dang ngam!", 3000);
  }

  const TAROT = [
    { name: "The Fool", emoji: "🤡", meaning: "Khởi đầu mới đầy liều lĩnh nhưng tiềm năng. Hãy dám bước, vũ trụ sẽ đỡ lấy bạn." },
    { name: "The Magician", emoji: "🎩", meaning: "Bạn đang nắm mọi công cụ cần thiết. Hành động ngay — ý tưởng sẽ thành hiện thực." },
    { name: "High Priestess", emoji: "🌙", meaning: "Hãy lắng nghe trực giác. Câu trả lời bạn tìm đã nằm sẵn trong lòng." },
    { name: "The Empress", emoji: "👑", meaning: "Sự đủ đầy và yêu thương đang nở rộ. Giai đoạn tốt để vun đắp." },
    { name: "The Emperor", emoji: "🏛️", meaning: "Kỷ luật và cấu trúc sẽ đưa bạn tới đỉnh. Hãy làm chủ cuộc chơi." },
    { name: "The Lovers", emoji: "💞", meaning: "Lựa chọn quan trọng về tình cảm. Hãy chọn bằng cả tim và óc." },
    { name: "The Chariot", emoji: "🏇", meaning: "Tiến lên với ý chí sắt đá — chiến thắng đang chờ cuối đường." },
    { name: "Strength", emoji: "🦁", meaning: "Kiên nhẫn thắng nóng vội. Sức mạnh mềm khuất phục mọi khó khăn." },
    { name: "Wheel Fortune", emoji: "🎡", meaning: "Vận may đang xoay có lợi cho bạn. Nắm lấy thời cơ!" },
    { name: "The Star", emoji: "⭐", meaning: "Hy vọng và chữa lành. Điều bạn mong đang dần thành hình." },
    { name: "The Moon", emoji: "🌕", meaning: "Có điều chưa rõ ràng — đừng vội quyết định lớn lúc này." },
    { name: "The Sun", emoji: "☀️", meaning: "Rực rỡ! Niềm vui, thành công và công nhận đang tới." }
  ];

  /* ---------- Nút Rút bài Tarot + Xào bài ---------- */
  if (btnTarot) {
    btnTarot.addEventListener("click", () => {
      const nmEl = document.getElementById("inp-name");
      const nm = (nmEl && nmEl.value.trim()) || "";
      if (!nm) { showError("Nhap ten truoc de Thay xao bai cho dung nguoi nhe!"); if (nmEl) nmEl.focus(); return; }
      showError("");
      tarotBox.hidden = false;
      tarotDeal(makeRng(hashString(nm + "|tarot|" + new Date().toDateString())));
      mageSpeak(nm + " muon rut bai u? Chon 3 la di, ta xem cho!", 2800);
      tarotBox.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    });
  }
  if (btnTarotShuffle) {
    btnTarotShuffle.addEventListener("click", () => {
      tarotDeal(null);
      mageSpeak("Da xao lai! Bai moi, van moi — chon di!", 2200);
    });
  }

  /* ---------- Nút xem cho người khác ---------- */
  if (btnAgain) {
    btnAgain.addEventListener("click", () => {
      form.reset();
      resultEl.hidden = true;
      form.hidden = false;
      if (tarotBox) tarotBox.hidden = true;
      showError("");
      mageSpeak("Mời người tiếp theo… ta xem không sót một ai!", 2600);
      form.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      document.getElementById("inp-name").focus();
    });
  }

  /* ---------- Thầy chào lúc mới vào + nháy mắt định kỳ ---------- */
  setTimeout(() => {
    if (!reduceMotion) mageSpeak(pick(Math.random, MAGE_GREETINGS), 3200);
  }, 900);
  // Nháy mắt: chớp nhẹ 150ms mỗi 3.2–5.5s (dùng opacity để không đè transform mắt theo chuột)
  if (!reduceMotion && mage) {
    const eyes = mage.querySelector(".mage-eyes");
    const blink = () => {
      if (eyes) {
        eyes.style.opacity = "0.1";
        setTimeout(() => { eyes.style.opacity = ""; }, 150);
      }
      setTimeout(blink, 3200 + Math.random() * 2300);
    };
    // transition cho nháy mắt (không đè lên transform do chuột điều khiển vì khác phần tử)
    if (eyes) eyes.style.transition = "transform 0.12s ease";
    setTimeout(blink, 2500);
  }
})();

