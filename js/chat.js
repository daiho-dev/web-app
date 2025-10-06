// ====== データ（カテゴリ → 質問 → 回答）======
const FAQ = {
  "サイトの使い方": [
    { q: "アカウント登録は必要ですか？", a: "一部の機能を使うにはアカウント登録が必要です。トップページ右上の「新規登録」から行えます。" },
    { q: "パスワードを忘れた場合は？", a: "ログイン画面下の「パスワードをお忘れですか？」から再設定できます。" },
    { q: "スマホでも利用できますか？", a: "はい。スマートフォン・タブレットからもご利用いただけます。" }
  ],

  "トラブル・不具合": [
    { q: "ページが表示されません", a: "一度ページを再読み込みしてください（Ctrl + F5）。それでも改善しない場合はブラウザのキャッシュを削除してお試しください。" },
    { q: "メールが届きません", a: "迷惑メールフォルダをご確認ください。ドメイン指定受信を設定している場合は「@example.com」を許可してください。" },
    { q: "動作が遅いです", a: "通信環境をご確認の上、ブラウザを再起動してください。それでも遅い場合は別のブラウザをお試しください。" }
  ],

  "お問い合わせ・サポート": [
    { q: "問い合わせ方法を教えてください", a: "お問い合わせフォームまたは support@example.com 宛てにメールでご連絡ください。" },
    { q: "営業時間を教えてください", a: "平日10:00〜18:00（土日祝を除く）に対応しております。" },
    { q: "電話での問い合わせは可能ですか？", a: "現在はメールのみの対応とさせていただいております。" }
  ],

  "プライバシー・セキュリティ": [
    { q: "個人情報はどのように扱われていますか？", a: "当サイトではプライバシーポリシーに基づき、お客様の情報を厳重に管理しています。<br><a href='/privacy-policy' target='_blank'>プライバシーポリシーはこちら</a>" },
    { q: "クッキー（Cookie）は使用していますか？", a: "はい。サイトの利便性向上のためCookieを利用していますが、個人を特定する目的では利用していません。" }
  ]
};

// ====== 初期化 ======
window.addEventListener("DOMContentLoaded", init);

function init() {
  const fab = document.getElementById("chat-fab");
  const panel = document.getElementById("chat-panel");
  const log = document.getElementById("chat-log");

  if (!fab || !panel || !log) {
    console.error("chatbot: 必要な要素が見つかりません。HTMLを確認してください。");
    return;
  }

  fab.addEventListener("click", function () {
    const isOpen = panel.style.display === "flex";
    if (isOpen === true) {
      panel.style.display = "none";
      return;
    }
    panel.style.display = "flex";
    renderCategories(log);
  });
}

// ====== 共通UI関数 ======
function clearLog(log) {
  while (log.firstChild) {
    log.removeChild(log.firstChild);
  }
}

function appendBot(log, text, asHtml) {
  const div = document.createElement("div");
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
  const b = document.createElement("button");
  b.className = "btn";
  b.textContent = label;
  b.addEventListener("click", onClick);
  return b;
}

// ====== 画面：カテゴリ一覧 ======
function renderCategories(log) {
  clearLog(log);
  appendBot(log, "カテゴリを選んでください。", false);

  const cats = Object.keys(FAQ);
  for (let i = 0; i < cats.length; i++) {
    const name = cats[i];
    const btn = makeButton("📂 " + name, function () {
      renderQuestions(log, name);
    });
    log.appendChild(btn);
  }
}

// ====== 画面：質問一覧 ======
function renderQuestions(log, category) {
  clearLog(log);
  appendBot(log, "「" + category + "」の質問を選んでください。", false);

  const list = FAQ[category];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const btn = makeButton("❓ " + item.q, function () {
      showAnswer(log, category, i);
    });
    log.appendChild(btn);
  }

  const row = document.createElement("div");
  row.className = "row";
  const back = makeButton("← カテゴリへ", function () { renderCategories(log); });
  row.appendChild(back);
  log.appendChild(row);
}

// ====== 画面：回答表示 ======
function showAnswer(log, category, index) {
  clearLog(log);
  const item = FAQ[category][index];
  appendBot(log, "Q: " + item.q, false);
  appendBot(log, item.a, true);

  const row = document.createElement("div");
  row.className = "row";
  const backQ = makeButton("← 同じカテゴリの質問", function () { renderQuestions(log, category); });
  const backC = makeButton("カテゴリ一覧へ", function () { renderCategories(log); });
  row.appendChild(backQ);
  row.appendChild(backC);
  log.appendChild(row);
}
