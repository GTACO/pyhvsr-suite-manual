/* pyhvsr-suite — comportamiento del manual: tema, índice, buscador y ampliar imágenes.
   Todo es opcional: sin JavaScript el manual se lee igual (solo falta la interactividad). */
(function () {
  "use strict";

  var root = document.documentElement;

  // --- tema claro/oscuro: respeta el del sistema y recuerda la elección ----------
  function storedTheme() {
    try { return localStorage.getItem("hvsr-manual-theme"); } catch (e) { return null; }
  }
  var saved = storedTheme();
  if (saved === "light" || saved === "dark") { root.setAttribute("data-theme", saved); }

  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      if (!current) {
        current = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("hvsr-manual-theme", next); } catch (e) { /* sin almacenamiento: no pasa nada */ }
    });
  }

  // --- idioma elegido: se recuerda para el index.html --------------------------------
  var langLinks = document.querySelectorAll("[data-lang-switch]");
  Array.prototype.forEach.call(langLinks, function (a) {
    a.addEventListener("click", function () {
      try { localStorage.setItem("hvsr-manual-lang", a.getAttribute("data-lang-switch")); } catch (e) { /* idem */ }
    });
  });

  // --- índice en pantallas pequeñas ---------------------------------------------------
  var menuBtn = document.getElementById("menu-toggle");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () { document.body.classList.toggle("toc-open"); });
  }
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
  tocLinks.forEach(function (a) {
    a.addEventListener("click", function () { document.body.classList.remove("toc-open"); });
  });

  // --- sección actual resaltada en el índice -------------------------------------------
  var byId = {};
  tocLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
  var sections = Array.prototype.slice.call(document.querySelectorAll("main > section[id]"));
  if ("IntersectionObserver" in window) {
    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var first = sections.filter(function (s) { return visible[s.id]; })[0];
      tocLinks.forEach(function (a) { a.classList.remove("active"); });
      if (first && byId[first.id]) { byId[first.id].classList.add("active"); }
    }, { rootMargin: "-70px 0px -65% 0px" });
    sections.forEach(function (s) { observer.observe(s); });
  }

  // --- buscador: filtra el índice por el texto de cada sección --------------------------
  var search = document.getElementById("toc-search");
  if (search) {
    var texts = {};
    sections.forEach(function (s) { texts[s.id] = (s.textContent || "").toLowerCase(); });
    search.addEventListener("input", function () {
      var q = search.value.trim().toLowerCase();
      tocLinks.forEach(function (a) {
        var id = a.getAttribute("href").slice(1);
        a.parentElement.classList.toggle("hidden", q.length > 1 && (texts[id] || "").indexOf(q) === -1);
      });
    });
  }

  // --- ampliar imágenes al hacer clic ------------------------------------------------------
  var box = document.createElement("div");
  box.className = "lightbox";
  var big = document.createElement("img");
  box.appendChild(big);
  document.body.appendChild(box);
  function close() { box.classList.remove("open"); }
  box.addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { close(); } });
  Array.prototype.forEach.call(document.querySelectorAll("figure img"), function (img) {
    img.addEventListener("click", function () {
      big.src = img.src;
      big.alt = img.alt;
      box.classList.add("open");
    });
  });
})();
