/* =========================
   共通FAQ（必要なら後で編集OK）
========================= */
var FAQ_COMMON = {
  "チャットの使い方": [
    { q: "開き方は？", a: "画面右下の「💬 チャット」を押すと開きます。もう一度押すと閉じます。" },
    { q: "×やESCで閉じられる？", a: "はい。右上の×ボタン、または ESC キーで閉じます。" },
    { q: "通信はしますか？", a: "しません。外部へは送信せず、このページ内だけで動きます。" }
  ],
  "サイトの全体像": [
    { q: "このサイトの目的は？", a: "AI入門、Power Automate、Web入門の3つをシンプルに学ぶためのガイドです。" },
    { q: "ページの移動は？", a: "上部の固定リンク（AI/PA/Web）か、各ページ内の目次リンクから移動できます。" }
  ],
  "よくある質問": [
    { q: "スマホでも使える？", a: "はい。レイアウトはスマホで見やすいように調整しています。" },
    { q: "検索はできる？", a: "画面上部の検索欄で、ページ内FAQをキーワードで探せます。" }
  ]
};

/* =========================
   ページ別追加（任意、今は空でOK）
   ?scope=ai / pa / web で将来出し分け可能
========================= */
var FAQ_PAGE = {};

/* =========================
   FAQ マージ（共通＋ページ別）
========================= */
function getScope() {
  var s = "";
  try {
    var params = new URLSearchParams(window.location.search);
    var v = params.get("scope");
    if (v) { s = v; }
  } catch (e) {}
  return s;
}

function cloneObject(obj) {
  var out = {};
  if (!obj) { return out; }
  var keys = Object.keys(obj);
  var i = 0;
  while (i < keys.length) {
    var k = keys[i];
    out[k] = Array.isArray(obj[k]) ? obj[k].slice() : obj[k];
    i = i + 1;
  }
  return out;
}

function mergeFAQ(commonObj, pageObj) {
  var merged = cloneObject(commonObj);
  if (!pageObj) { return merged; }
  var keys = Object.keys(pageObj);
  var i = 0;
  while (i < keys.length) {
    var k = keys[i];
    if (!merged[k]) {
      merged[k] = [];
    }
    var arr = pageObj[k];
    if (Array.isArray(arr)) {
      var j = 0;
      while (j < arr.length) {
        merged[k].push(arr[j]);
        j = j + 1;
      }
    }
    i = i + 1;
  }
  return merged;
}

/* =========================
   DOM参照
========================= */
var elFab = null;
var elPanel = null;
var elLog = null;
var elClose = null;

var elKw = null;
var elBtnSearch = null;
var elBtnClear = null;
var elResultCount = null;
var elResultList = null;

var elAnsWrap = null;
var elAnsTitle = null;
var elAnsBox = null;
var elBtnCopyAns = null;
var elBtnBackList = null;

var lastAnswer = "";

/* =========================
   初期化
========================= */
document.addEventListener("DOMContentLoaded", function () {
  // iframe時は上部リンク非表示
  hidePortalLinksInIframe();

  elFab = document.getElementById("chat-fab");
  elPanel = document.getElementById("chat-panel");
  elLog = document.getElementById("chat-log");
  elClose = document.getElementById("chat-close");

  elKw = document.getElementById("kw");
  elBtnSearch = document.getElementById("btnSearch");
  elBtnClear = document.getElementById("btnClear");
  elResultCount = document.getElementById("result-count");
  elResultList = document.getElementById("result-list");

  elAnsWrap = document.getElementById("answer-wrap");
  elAnsTitle = document.getElementById("answer-title");
  elAnsBox = document.getElementById("answer-box");
  elBtnCopyAns = document.getElementById("btnCopyAns");
  elBtnBackList = document.getElementById("btnBackList");

  if (!elFab || !elPanel || !elLog) {
    console.error("chatbot: 必要な要素が見つかりません。HTMLを確認してください。");
    return;
  }

  // FAQを作成
  var scope = getScope();
  var pageExtra = FAQ_PAGE[scope] || null;
  window.__FAQ_ACTIVE__ = mergeFAQ(FAQ_COMMON, pageExtra);

  bindFab();
  bindClose();
  bindEscToClose();
  bindSearch();
  bindAnswerTools();

  // 最初の案内
  clearLog(elLog);
  appendBot(elLog, "カテゴリを選んでください。", false);
});

/* =========================
   開閉
========================= */
function bindFab() {
  elFab.addEventListener("click", function () {
    var isOpen = elPanel.style.display === "flex";
    if (isOpen) {
      elPanel.style.display = "none";
      return;
    }
    elPanel.style.display = "flex"; // CSSは display:none; → 開くときは flex
    renderCategories(elLog);
  });
}

function bindClose() {
  if (!elClose) { return; }
  elClose.addEventListener("click", function () {
    elPanel.style.display = "none";
  });
}

function bindEscToClose() {
  document.addEventListener("keydown", function (e) {
    if (!elPanel) { return; }
    if (!e) { return; }
    var isOpen = elPanel.style.display === "flex";
    if (isOpen && e.key === "Escape") {
      elPanel.style.display = "none";
    }
  });
}

/* =========================
   カテゴリ → 質問 → 回答
========================= */
function clearLog(log) {
  while (log.firstChild) {
    log.removeChild(log.firstChild);
  }
}

function appendBot(log, text, asHtml) {
  var div = document.createElement("div");
  div.className = "msg bot";
  if (asHtml === true) {
    div.innerHTML = "ボット: " + text;
  } else {
    div.textContent = "ボット: " + text;
  }
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function makeButton(label, onClick) {
  var b = document.createElement("button");
  b.className = "qbtn";
  b.type = "button";
  b.textContent = label;
  b.addEventListener("click", onClick);
  return b;
}

function renderCategories(log) {
  clearLog(log);
  appendBot(log, "カテゴリを選んでください。", false);

  var data = window.__FAQ_ACTIVE__ || {};
  var cats = Object.keys(data);
  var i = 0;
  while (i < cats.length) {
    var name = cats[i];
    var btn = makeButton("📂 " + name, (function (c) {
      return function () { renderQuestions(log, c); };
    })(name));
    log.appendChild(btn);
    i = i + 1;
  }
}

function renderQuestions(log, category) {
  clearLog(log);
  appendBot(log, "「" + category + "」の質問を選んでください。", false);

  var data = window.__FAQ_ACTIVE__ || {};
  var list = data[category] || [];
  var i = 0;
  while (i < list.length) {
    var item = list[i];
    var btn = makeButton("❓ " + item.q, (function (idx) {
      return function () { showAnswer(log, category, idx); };
    })(i));
    log.appendChild(btn);
    i = i + 1;
  }

  var row = document.createElement("div");
  row.className = "row";
  var back = makeButton("← カテゴリへ", function () { renderCategories(log); });
  row.appendChild(back);
  log.appendChild(row);
}

function showAnswer(log, category, index) {
  clearLog(log);

  var data = window.__FAQ_ACTIVE__ || {};
  var list = data[category] || [];
  var item = list[index] || { q: "", a: "" };

  appendBot(log, "Q: " + item.q, false);
  appendBot(log, item.a, true);

  var row = document.createElement("div");
  row.className = "row";
  var backQ = makeButton("← 同じカテゴリの質問", function () { renderQuestions(log, category); });
  var backC = makeButton("カテゴリ一覧へ", function () { renderCategories(log); });
  row.appendChild(backQ);
  row.appendChild(backC);
  log.appendChild(row);
}

/* =========================
   検索（ページ内FAQ検索のまま）
========================= */
function bindSearch() {
  if (elBtnSearch) {
    elBtnSearch.addEventListener("click", function () { doSearch(); });
  }
  if (elBtnClear) {
    elBtnClear.addEventListener("click", function () { clearSearch(); });
  }
  if (elKw) {
    elKw.addEventListener("keydown", function (e) {
      if (e && e.key === "Enter") {
        doSearch();
      }
    });
  }
}

function doSearch() {
  if (!elKw) { return; }
  var kw = elKw.value;
  if (!kw || kw.trim() === "") {
    clearSearch();
    return;
  }
  var hits = searchFaq(kw);
  renderResults(hits, kw);
  hideAnswer();
}

function clearSearch() {
  if (elKw) { elKw.value = ""; }
  if (elResultCount) { elResultCount.textContent = ""; }
  if (elResultList) { elResultList.innerHTML = ""; }
  hideAnswer();
}

function searchFaq(keyword) {
  var list = [];
  var kw = normalize(keyword);

  var data = window.__FAQ_ACTIVE__ || {};
  var cats = Object.keys(data);
  var i = 0;
  while (i < cats.length) {
    var catName = cats[i];
    var items = data[catName] || [];
    var j = 0;
    while (j < items.length) {
      var it = items[j];
      var qNorm = normalize(it.q);
      var aNorm = normalize(it.a);
      var hitQ = qNorm.indexOf(kw) >= 0;
      var hitA = aNorm.indexOf(kw) >= 0;
      var hit = false;
      if (hitQ) { hit = true; }
      if (hitA) { hit = true; }
      if (hit) {
        list.push({ category: catName, q: it.q, a: it.a });
      }
      j = j + 1;
    }
    i = i + 1;
  }
  return list;
}

function normalize(s) {
  if (!s) { return ""; }
  var t = s;
  t = t.replace(/[！-～]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0); });
  t = t.toLowerCase();
  t = t.trim();
  return t;
}

function renderResults(items, keyword) {
  if (!elResultList) { return; }
  elResultList.innerHTML = "";

  if (elResultCount) {
    if (items && items.length > 0) {
      elResultCount.textContent = String(items.length) + " 件ヒット";
    } else {
      elResultCount.textContent = "0 件";
    }
  }

  if (!items || items.length === 0) {
    var p = document.createElement("div");
    p.className = "small";
    p.textContent = "見つからない時は、言い回しを少し変えてみてね。";
    elResultList.appendChild(p);
    return;
  }

  var i = 0;
  while (i < items.length) {
    var r = items[i];
    var div = document.createElement("div");
    div.className = "result-item";
    var cat = document.createElement("div");
    cat.className = "small";
    cat.textContent = "カテゴリ: " + r.category;
    var q = document.createElement("div");
    q.innerHTML = highlight(r.q, keyword);
    (function (ans) {
      div.addEventListener("click", function () { showAnswer(elLog, r.category, -1); elAnsBox && (elAnsBox.textContent = ans); });
    })(r.a);
    div.appendChild(cat);
    div.appendChild(q);
    elResultList.appendChild(div);
    i = i + 1;
  }
}

function escapeHtml(s) {
  if (!s) { return ""; }
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function escapeRegExp(s) {
  if (!s) { return ""; }
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text, keyword) {
  if (!text) { return ""; }
  var raw = escapeHtml(text);
  if (!keyword) { return raw; }
  var kw = escapeRegExp(keyword);
  var re;
  try { re = new RegExp(kw, "gi"); }
  catch (e) { return raw; }
  var out = raw.replace(re, function (m) { return "<mark>" + m + "</mark>"; });
  return out;
}

/* =========================
   回答表示（検索と共有）
========================= */
function hideAnswer() {
  lastAnswer = "";
  if (elAnsWrap) { elAnsWrap.style.display = "none"; }
  if (elAnsBox) { elAnsBox.textContent = ""; }
}

function bindAnswerTools() {
  if (elBtnCopyAns) {
    elBtnCopyAns.addEventListener("click", function () {
      copyAnswer();
    });
  }
  if (elBtnBackList) {
    elBtnBackList.addEventListener("click", function () {
      hideAnswer();
    });
  }
}

function copyAnswer() {
  if (!elAnsBox) { return; }
  var text = elAnsBox.textContent || "";
  if (!text) { return; }
  if (!navigator.clipboard) {
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    return;
  }
  navigator.clipboard.writeText(text).catch(function(e){});
}

/* =========================
   iframe時：上部リンク非表示
========================= */
function isInIFrame() {
  var inFrame = false;
  try {
    if (window.self !== window.top) {
      inFrame = true;
    } else {
      inFrame = false;
    }
  } catch (e) {
    inFrame = true;
  }
  return inFrame;
}

function hidePortalLinksInIframe() {
  var links = document.getElementById("portal-links");
  if (!links) { return; }
  var inFrame = isInIFrame();
  if (inFrame) {
    links.style.display = "none";
  }
}
