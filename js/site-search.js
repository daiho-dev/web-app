// js/site-search.js
(function(){
  // 検索対象ページ（ここに増やしていく）
  var PAGES = [
    {
      title: 'FAQボット（オフライン）',
      url: 'chatbot.html',
      keywords: 'カテゴリ 質問 回答 チャット ボット',
      summary: 'カテゴリ→質問→回答の形式でFAQを表示するチャットボット。'
    },
    {
      title: '地図ツール（Leaflet）',
      url: 'map.html',
      keywords: '地図 Leaflet ピン 住所 Nominatim 検索',
      summary: '地図をドラッグ・右クリックでピン追加。住所検索対応。'
    },
    {
      title: 'Markdownエディタ',
      url: 'mark.html',
      keywords: 'Markdown HTML プレビュー コピー',
      summary: 'Markdown入力をHTMLに変換し、コピー可能なエディタ。'
    }
  ];

  // DOM取得
  var elKw = document.getElementById('kw');
  var elBtnSearch = document.getElementById('btnSearch');
  var elBtnClear = document.getElementById('btnClear');
  var elCount = document.getElementById('count');
  var elList = document.getElementById('list');

  // イベント登録
  if (elBtnSearch) {
    elBtnSearch.addEventListener('click', function(){
      doSearch();
    });
  }
  if (elBtnClear) {
    elBtnClear.addEventListener('click', function(){
      clearSearch();
    });
  }
  if (elKw) {
    elKw.addEventListener('keydown', function(e){
      if (e.key === 'Enter') {
        doSearch();
      }
    });
  }

  function doSearch(){
    if (!elKw) { return; }
    var kw = elKw.value;
    if (!kw || kw.trim() === '') {
      clearSearch();
      return;
    }

    var results = searchPages(kw);
    renderResults(results, kw);
  }

  function clearSearch(){
    if (elKw) { elKw.value = ''; }
    if (elList) { elList.innerHTML = ''; }
    if (elCount) { elCount.textContent = ''; }
  }

  function normalize(s){
    if (!s) { return ''; }
    var t = s.replace(/[！-～]/g, function(ch){
      return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
    });
    t = t.toLowerCase().trim();
    return t;
  }

  function searchPages(keyword){
    var list = [];
    var kw = normalize(keyword);

    var i = 0;
    while (i < PAGES.length) {
      var p = PAGES[i];
      var text = normalize(p.title + ' ' + p.keywords + ' ' + p.summary);
      if (text.indexOf(kw) >= 0) {
        list.push(p);
      }
      i = i + 1;
    }
    return list;
  }

  function renderResults(list, keyword){
    if (!elList) { return; }
    elList.innerHTML = '';
    if (!elCount) { return; }

    if (list.length === 0) {
      elCount.textContent = '0 件ヒット';
      return;
    }
    elCount.textContent = list.length + ' 件ヒット';

    var i = 0;
    while (i < list.length) {
      var p = list[i];
      var div = document.createElement('div');
      div.className = 'item';

      var a = document.createElement('a');
      a.href = p.url;
      a.innerHTML = highlight(p.title, keyword);

      var sm = document.createElement('div');
      sm.className = 'small';
      sm.innerHTML = highlight(p.summary, keyword);

      div.appendChild(a);
      div.appendChild(sm);
      elList.appendChild(div);

      i = i + 1;
    }
  }

  function escapeHtml(s){
    if (!s) { return ''; }
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function escapeRegExp(s){
    if (!s) { return ''; }
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlight(text, keyword){
    if (!text) { return ''; }
    var raw = escapeHtml(text);
    if (!keyword) { return raw; }

    var re;
    try { re = new RegExp(escapeRegExp(keyword), 'gi'); }
    catch(e) { return raw; }

    var out = raw.replace(re, function(m){
      return '<mark>' + m + '</mark>';
    });
    return out;
  }
})();
