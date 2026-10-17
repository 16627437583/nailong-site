(function () {
  "use strict";

  /* 官网地址只写在 index.html 的「立即前往官网」按钮上，此处不再保留常量 */

  /* ---------- 学号 / 来访人次 ---------- */
  var BASE = 456;
  var visits = 0;
  try {
    visits = parseInt(localStorage.getItem("nailong_visits") || "0", 10);
    if (isNaN(visits)) visits = 0;
    visits += 1;
    localStorage.setItem("nailong_visits", String(visits));
  } catch (e) {
    visits = Math.floor(Math.random() * 80) + 20;
  }
  var myNumber = BASE + visits;

  var stuNo = document.getElementById("stuNo");
  stuNo.textContent = "NAI·2026·" + String(myNumber).padStart(4, "0");

  var visitEl = document.getElementById("visitNum");
  var startTime = null;
  var DURATION = 1600;
  function rollUp(ts) {
    if (!startTime) startTime = ts;
    var p = Math.min((ts - startTime) / DURATION, 1);
    var eased = 1 - Math.pow(1 - p, 3);
    visitEl.textContent = Math.round(myNumber * eased).toLocaleString();
    if (p < 1) requestAnimationFrame(rollUp);
  }
  setTimeout(function () {
    requestAnimationFrame(rollUp);
  }, 1400);

  /* ---------- 彩带礼花 ---------- */
  var canvas = document.getElementById("confetti");
  var ctx = canvas.getContext("2d");
  var COLORS = ["#FFD23F", "#FFB300", "#1E56A0", "#4FB0E0", "#FF8FA3", "#FFF3C4"];
  var pieces = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  function burst(count, originX, originY, spread) {
    for (var i = 0; i < count; i++) {
      pieces.push({
        x: originX,
        y: originY,
        vx: (Math.random() - 0.5) * spread,
        vy: Math.random() * -9 - 4,
        size: Math.random() * 7 + 4,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25,
        life: 1
      });
    }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = pieces.length - 1; i >= 0; i--) {
      var p = pieces[i];
      p.vy += 0.22;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 0.008;
      if (p.life <= 0 || p.y > canvas.height + 40) {
        pieces.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  setTimeout(function () {
    burst(70, canvas.width / 2, canvas.height * 0.32, 14);
  }, 900);
  setTimeout(function () {
    burst(50, canvas.width * 0.3, canvas.height * 0.28, 12);
    burst(50, canvas.width * 0.7, canvas.height * 0.28, 12);
  }, 1500);

  /* ---------- 前往官网（仅点击触发，无倒计时、无自动跳转） ---------- */
  var goBtn = document.getElementById("goBtn");
  if (goBtn) {
    goBtn.addEventListener("click", function () {
      goBtn.classList.add("done");
      var label = goBtn.querySelector(".go-btn-label");
      if (label) label.textContent = "正在前往…";
    });
  }

  /* ---------- 右下角奶龙客服：表白墙微信号气泡 ---------- */
  var wallBot = document.getElementById("wallBot");
  var wallBubble = document.getElementById("wallBubble");
  var wallDragon = document.getElementById("wallDragon");
  var wallCopy = document.getElementById("wallCopy");
  if (wallBot && wallBubble && wallDragon) {
    var WECHAT = "HLGBBQ-2025";
    var autoTimer = null;

    function openBubble() {
      clearTimeout(autoTimer);
      wallBubble.classList.add("show");
      wallDragon.setAttribute("aria-expanded", "true");
    }
    function closeBubble() {
      wallBubble.classList.remove("show");
      wallDragon.setAttribute("aria-expanded", "false");
    }
    function scheduleClose() {
      clearTimeout(autoTimer);
      autoTimer = setTimeout(closeBubble, 6000);
    }

    // 点奶龙：开 / 关气泡
    wallDragon.addEventListener("click", function (e) {
      e.stopPropagation();
      if (wallBubble.classList.contains("show")) {
        closeBubble();
      } else {
        openBubble();
        scheduleClose();
      }
    });

    // 鼠标移入奶龙或气泡时保持展开，避免误触消失
    wallBot.addEventListener("mouseenter", function () { clearTimeout(autoTimer); });
    wallBot.addEventListener("mouseleave", function () {
      if (wallBubble.classList.contains("show")) scheduleClose();
    });

    // 点击页面空白处收起（复制按钮点击不受影响）
    document.addEventListener("click", function (e) {
      if (!wallBot.contains(e.target)) closeBubble();
    });

    // 复制微信号
    if (wallCopy) {
      wallCopy.addEventListener("click", function (e) {
        e.stopPropagation();
        var done = function () {
          wallCopy.textContent = "已复制";
          wallCopy.classList.add("done");
          setTimeout(function () {
            wallCopy.textContent = "复制";
            wallCopy.classList.remove("done");
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(WECHAT).then(done, fallback);
        } else {
          fallback();
        }
        function fallback() {
          var ta = document.createElement("textarea");
          ta.value = WECHAT;
          ta.setAttribute("readonly", "");
          ta.style.cssText = "position:absolute;left:-9999px;opacity:0";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); done(); } catch (err) { /* 忽略 */ }
          document.body.removeChild(ta);
        }
      });
    }

    // 进入页面 2.6 秒后自动探头提示一次（只提示这一次，6 秒后自动收起，不长期遮挡内容）
    setTimeout(function () {
      if (!wallBubble.classList.contains("show")) {
        openBubble();
        scheduleClose();
      }
    }, 2600);
  }
})();
