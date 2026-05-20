const state = {
  minimalPairs: [],
  tonePairs: [],
  faq: [],
  minimalFilter: "all",
  toneFilter: "all",
  progress: {
    answered: 0,
    correct: 0,
    mistakes: [],
    lastPracticeDate: null
  }
};

const STORAGE_KEY = "thaiPronunciationProgressV1";

document.addEventListener("DOMContentLoaded", async () => {
  setupMenu();
  loadProgress();
  await loadAllData();
  setupControls();
  renderAll();
});

function setupMenu() {
  const menuToggle = document.querySelector("#menuToggle");
  const navLinks = document.querySelector("#navLinks");

  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });
}

async function loadAllData() {
  try {
    const [minimalRes, toneRes, faqRes] = await Promise.all([
      fetch("data/minimalPairs.json"),
      fetch("data/tonePairs.json"),
      fetch("data/faq.json")
    ]);

    if (!minimalRes.ok || !toneRes.ok || !faqRes.ok) {
      throw new Error("JSON 檔案讀取失敗");
    }

    state.minimalPairs = await minimalRes.json();
    state.tonePairs = await toneRes.json();
    state.faq = await faqRes.json();

    populateCategorySelect("minimalCategory", state.minimalPairs);
    populateCategorySelect("toneCategory", state.tonePairs);
  } catch (error) {
    console.error(error);
    showDataError();
  }
}

function showDataError() {
  const message = `
    <div class="notice">
      <strong>資料讀取失敗：</strong>
      請確認 data/minimalPairs.json、data/tonePairs.json、data/faq.json 是否存在，並使用伺服器方式開啟網站。
      如果直接用瀏覽器打開 index.html，部分瀏覽器可能會阻擋 fetch 讀取本地 JSON。
    </div>
  `;
  document.querySelector("#minimalContainer").innerHTML = message;
  document.querySelector("#toneContainer").innerHTML = message;
  document.querySelector("#faqContainer").innerHTML = message;
}

function setupControls() {
  document.querySelector("#minimalCategory").addEventListener("change", (event) => {
    state.minimalFilter = event.target.value;
    renderMinimalPairs();
  });

  document.querySelector("#toneCategory").addEventListener("change", (event) => {
    state.toneFilter = event.target.value;
    renderTonePairs();
  });

  document.querySelector("#shuffleMinimal").addEventListener("click", () => {
    state.minimalPairs = shuffleArray([...state.minimalPairs]);
    renderMinimalPairs();
  });

  document.querySelector("#shuffleTone").addEventListener("click", () => {
    state.tonePairs = shuffleArray([...state.tonePairs]);
    renderTonePairs();
  });

  document.querySelector("#resetProgress").addEventListener("click", () => {
    if (confirm("確定要清除所有學習進度嗎？")) {
      state.progress = {
        answered: 0,
        correct: 0,
        mistakes: [],
        lastPracticeDate: null
      };
      saveProgress();
      renderProgress();
      renderStats();
    }
  });
}

function renderAll() {
  renderMinimalPairs();
  renderTonePairs();
  renderFAQ();
  renderProgress();
}

function populateCategorySelect(selectId, data) {
  const select = document.querySelector(`#${selectId}`);
  const categories = [...new Set(data.map((item) => item.category))];

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = formatCategory(category);
    select.appendChild(option);
  });
}

function formatCategory(category) {
  const labels = {
    "บ_vs_ป": "บ vs ป",
    "ด_vs_ต": "ด vs ต",
    "ง_vs_น": "ง vs น",
    "ร_vs_ล": "ร vs ล",
    "low_vs_falling": "Low vs Falling",
    "advanced_mid_vs_rising": "Advanced：Mid vs Rising",
    "advanced_low_vs_rising": "Advanced：Low vs Rising",
    "advanced_falling_vs_rising": "Advanced：Falling vs Rising"
  };
  return labels[category] || category;
}

function getFiltered(data, filter) {
  if (filter === "all") return data;
  return data.filter((item) => item.category === filter);
}

function renderMinimalPairs() {
  const container = document.querySelector("#minimalContainer");
  const data = getFiltered(state.minimalPairs, state.minimalFilter);
  renderStats();
  container.innerHTML = data.map((item, index) => createQuestionCard(item, index, "minimal")).join("");
  attachQuestionEvents(container);
}

function renderTonePairs() {
  const container = document.querySelector("#toneContainer");
  const data = getFiltered(state.tonePairs, state.toneFilter);
  renderStats();
  container.innerHTML = data.map((item, index) => createQuestionCard(item, index, "tone")).join("");
  attachQuestionEvents(container);
}

function renderStats() {
  const minimalData = getFiltered(state.minimalPairs, state.minimalFilter);
  const toneData = getFiltered(state.tonePairs, state.toneFilter);

  document.querySelector("#minimalStats").innerHTML = `
    <span>目前題組：${formatCategory(state.minimalFilter)}</span>
    <span>題數：${minimalData.length}</span>
  `;

  document.querySelector("#toneStats").innerHTML = `
    <span>目前題組：${formatCategory(state.toneFilter)}</span>
    <span>題數：${toneData.length}</span>
  `;
}

function createQuestionCard(item, index, mode) {
  const toneContour = item.toneContour ? `<span class="contour">${contourSymbol(item.toneContour)}</span>` : "";
  const wordATone = item.wordA.tone ? `<small>${toneName(item.wordA.tone)} ${item.wordA.thaiToneName || ""}</small>` : `<small>${item.wordA.feature || item.wordA.phoneme || ""}</small>`;
  const wordBTone = item.wordB.tone ? `<small>${toneName(item.wordB.tone)} ${item.wordB.thaiToneName || ""}</small>` : `<small>${item.wordB.feature || item.wordB.phoneme || ""}</small>`;

  return `
    <article class="question-card" data-id="${item.id}" data-correct="${escapeHtml(item.correctAnswer)}" data-audio="${escapeHtml(item.audio)}" data-mode="${mode}">
      <div class="question-top">
        <div>
          <div class="question-meta">${item.id}｜${formatCategory(item.category)}｜${item.focus}</div>
          <h3>${item.question} ${toneContour}</h3>
        </div>
        <div class="question-meta">第 ${index + 1} 題</div>
      </div>

      <div class="thai-pair">
        <div class="thai-chip">${item.wordA.thai}<br>${wordATone}</div>
        <div class="thai-chip">${item.wordB.thai}<br>${wordBTone}</div>
      </div>

      <div class="audio-row">
        <button class="btn primary small play-audio">播放音檔</button>
        <span class="audio-status">音檔路徑：${item.audio}</span>
      </div>

      <div class="option-row">
        <button class="option-btn" data-answer="${escapeHtml(item.wordA.thai)}">A. <span>${item.wordA.thai}</span></button>
        <button class="option-btn" data-answer="${escapeHtml(item.wordB.thai)}">B. <span>${item.wordB.thai}</span></button>
      </div>

      <div class="feedback" aria-live="polite">
        <strong class="feedback-title"></strong>
        <p class="feedback-body"></p>
      </div>

      <template class="explanation-template">${escapeHtml(item.explanation)}</template>
    </article>
  `;
}

function attachQuestionEvents(container) {
  container.querySelectorAll(".play-audio").forEach((button) => {
    button.addEventListener("click", handleAudioPlay);
  });

  container.querySelectorAll(".option-btn").forEach((button) => {
    button.addEventListener("click", handleAnswer);
  });
}

function handleAudioPlay(event) {
  const card = event.target.closest(".question-card");
  const audioPath = card.dataset.audio;
  const status = card.querySelector(".audio-status");
  const audio = new Audio(audioPath);

  audio.addEventListener("error", () => {
    status.textContent = "音檔尚未上傳，請之後放入：" + audioPath;
  });

  audio.play()
    .then(() => {
      status.textContent = "正在播放：" + audioPath;
    })
    .catch(() => {
      status.textContent = "音檔尚未上傳或瀏覽器阻擋播放：" + audioPath;
    });
}

function handleAnswer(event) {
  const button = event.currentTarget;
  const card = button.closest(".question-card");
  const selected = button.dataset.answer;
  const correct = card.dataset.correct;
  const isCorrect = selected === correct;
  const feedback = card.querySelector(".feedback");
  const feedbackTitle = card.querySelector(".feedback-title");
  const feedbackBody = card.querySelector(".feedback-body");
  const explanation = card.querySelector(".explanation-template").innerHTML;

  card.querySelectorAll(".option-btn").forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.answer === correct) btn.classList.add("correct");
    if (btn.dataset.answer === selected && !isCorrect) btn.classList.add("incorrect");
  });

  feedback.classList.add("show");
  feedback.classList.toggle("correct", isCorrect);
  feedback.classList.toggle("incorrect", !isCorrect);

  feedbackTitle.textContent = isCorrect ? "答對了！" : "再練習一次！";
  feedbackBody.innerHTML = `
    正確答案是 <strong>${correct}</strong>。<br>
    ${explanation}
  `;

  updateProgress({
    id: card.dataset.id,
    selected,
    correct,
    isCorrect,
    explanation: stripHtml(explanation),
    mode: card.dataset.mode
  });
}

function updateProgress(result) {
  state.progress.answered += 1;
  if (result.isCorrect) {
    state.progress.correct += 1;
  } else {
    state.progress.mistakes.unshift({
      ...result,
      date: new Date().toLocaleString("zh-TW")
    });
    state.progress.mistakes = state.progress.mistakes.slice(0, 30);
  }

  state.progress.lastPracticeDate = new Date().toISOString();
  saveProgress();
  renderProgress();
}

function renderFAQ() {
  const container = document.querySelector("#faqContainer");
  container.innerHTML = state.faq.map((item) => `
    <article class="faq-item">
      <button class="faq-question">${item.question}</button>
      <div class="faq-answer">${item.answer}</div>
    </article>
  `).join("");

  container.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      button.closest(".faq-item").classList.toggle("open");
    });
  });
}

function renderProgress() {
  const progress = state.progress;
  const rate = progress.answered === 0 ? 0 : Math.round((progress.correct / progress.answered) * 100);
  const lastDate = progress.lastPracticeDate ? new Date(progress.lastPracticeDate).toLocaleString("zh-TW") : "尚未開始";

  document.querySelector("#overallProgress").innerHTML = `
    <p>已完成題數：<strong>${progress.answered}</strong></p>
    <p>答對題數：<strong>${progress.correct}</strong></p>
    <p>正確率：<strong>${rate}%</strong></p>
    <p>最近練習：<strong>${lastDate}</strong></p>
  `;

  const mistakeList = document.querySelector("#mistakeList");
  if (progress.mistakes.length === 0) {
    mistakeList.innerHTML = "<p>目前沒有錯題紀錄。完成練習後，錯題會顯示在這裡。</p>";
    return;
  }

  mistakeList.innerHTML = progress.mistakes.map((item) => `
    <div class="mistake-item">
      <strong>${item.id}</strong><br>
      你選了：${item.selected}｜正確答案：${item.correct}<br>
      <small>${item.explanation}</small><br>
      <small>${item.date}</small>
    </div>
  `).join("");
}

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      state.progress = JSON.parse(saved);
    }
  } catch (error) {
    console.error("Progress load failed", error);
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
}

function contourSymbol(tone) {
  const symbols = {
    mid: "─",
    low: "▁",
    falling: "↘",
    rising: "↗"
  };
  return symbols[tone] || tone;
}

function toneName(tone) {
  const names = {
    mid: "中聲",
    low: "低聲",
    falling: "降聲",
    rising: "升聲"
  };
  return names[tone] || tone;
}

function shuffleArray(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function stripHtml(value) {
  const div = document.createElement("div");
  div.innerHTML = value;
  return div.textContent || div.innerText || "";
}
