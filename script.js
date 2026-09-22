(function () {
  "use strict";

  /* ---------- Experience tabs ---------- */
  var xp = document.getElementById("xp");
  if (xp) {
    var tabs = xp.querySelectorAll(".xp-co");
    var details = xp.querySelectorAll(".xp-detail");
    Array.prototype.forEach.call(tabs, function (tab) {
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", tab.classList.contains("is-active") ? "true" : "false");
      tab.addEventListener("click", function () {
        var id = tab.getAttribute("data-co");
        Array.prototype.forEach.call(tabs, function (t) {
          var on = t === tab;
          t.classList.toggle("is-active", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
        });
        Array.prototype.forEach.call(details, function (d) {
          d.classList.toggle("is-active", d.getAttribute("data-co") === id);
        });
      });
    });
  }

  /* ---------- "Drop a Pokémon" footer ---------- */
  var stage = document.getElementById("pfootStage");
  var btn = document.getElementById("pfootBtn");
  var countEl = document.getElementById("pfootCount");
  if (!stage || !btn) return;

  // [Pokédex number, name]
  var MONS = [
    [1, "Bulbasaur"], [3, "Venusaur"], [4, "Charmander"], [6, "Charizard"],
    [7, "Squirtle"], [9, "Blastoise"], [25, "Pikachu"], [37, "Vulpix"],
    [39, "Jigglypuff"], [52, "Meowth"], [54, "Psyduck"], [58, "Growlithe"],
    [66, "Machop"], [79, "Slowpoke"], [94, "Gengar"], [104, "Cubone"],
    [129, "Magikarp"], [130, "Gyarados"], [132, "Ditto"], [133, "Eevee"],
    [143, "Snorlax"], [149, "Dragonite"], [151, "Mew"], [152, "Chikorita"],
    [155, "Cyndaquil"], [158, "Totodile"], [175, "Togepi"], [252, "Treecko"],
    [255, "Torchic"], [258, "Mudkip"], [393, "Piplup"], [448, "Lucario"],
    [778, "Mimikyu"]
  ];
  var SPRITE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
  var SIZE = 96;      // native sprite size, keeps the pixels crisp
  var MAX = 30;       // crowd limit
  var SEED = 8;       // starter crowd so the footer isn't empty
  var KEY = "pfoot:crowd:v1";

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(saved)) return saved;
    } catch (e) {}
    return null;
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }
  function rand(n) { return Math.floor(Math.random() * n); }
  function newMon(excludeIds) {
    var pool = MONS.filter(function (m) { return excludeIds.indexOf(m[0]) === -1; });
    if (!pool.length) pool = MONS;
    var m = pool[rand(pool.length)];
    return { id: m[0], rot: rand(13) - 6 };
  }
  function nameOf(id) {
    for (var i = 0; i < MONS.length; i++) if (MONS[i][0] === id) return MONS[i][1];
    return "Pokémon";
  }

  var track = document.createElement("div");
  track.className = "pfoot-track";
  stage.appendChild(track);

  var crowd = load();
  if (!crowd) {
    crowd = [];
    for (var i = 0; i < SEED; i++) {
      crowd.push(newMon(crowd.map(function (c) { return c.id; })));
    }
    save(crowd);
  }

  function makeMon(m, delay) {
    var el = document.createElement("div");
    el.className = "pfoot-mon";
    el.style.width = SIZE + "px";
    el.style.height = SIZE + "px";
    el.style.setProperty("--rot", m.rot + "deg");
    if (delay) el.style.animationDelay = delay + "ms";

    var img = new Image();
    img.className = "pfoot-sprite";
    img.alt = nameOf(m.id);
    img.draggable = false;
    img.src = SPRITE + m.id + ".png";
    img.addEventListener("error", function () { el.style.visibility = "hidden"; });

    var tag = document.createElement("span");
    tag.className = "pfoot-name";
    tag.textContent = nameOf(m.id);

    el.appendChild(img);
    el.appendChild(tag);
    return el;
  }

  // scale the whole crowd down so it always fits the page width
  function fit() {
    var n = track.children.length;
    if (!n) return;
    var full = n * (SIZE - 24) + 24;
    var avail = stage.clientWidth - 16;
    var s = Math.min(1, avail / full);
    track.style.transform = "scale(" + s.toFixed(3) + ")";
    track.style.setProperty("--inv", (1 / s).toFixed(3));
  }

  function updateUI() {
    var n = crowd.length;
    if (countEl) countEl.textContent = n + " Pokémon in the crowd";
  }

  crowd.forEach(function (m, i) { track.appendChild(makeMon(m, i * 60)); });
  fit();
  updateUI();
  window.addEventListener("resize", fit);

  btn.addEventListener("click", function () {
    // when the crowd is full, the oldest Pokémon leaves to make room
    if (crowd.length >= MAX) {
      crowd.shift();
      if (track.firstChild) track.removeChild(track.firstChild);
    }
    var m = newMon(crowd.map(function (c) { return c.id; }));
    crowd.push(m);
    save(crowd);
    // drop the new one into a random spot in the crowd
    var el = makeMon(m, 0);
    var at = rand(track.children.length + 1);
    track.insertBefore(el, track.children[at] || null);
    fit();
    updateUI();
  });
})();
