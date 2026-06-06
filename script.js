const params = new URLSearchParams(location.search);
const type = params.get("type") || "denki2";

const quizInfo = {
  denki2: {
    title: "第二種電気工事士",
    desc: "配線図・工具・法令・測定器・電気理論"
  },
  denki1: {
    title: "第一種電気工事士",
    desc: "高圧受電設備・電気工事・法令・施工管理"
  },
  denken3: {
    title: "第三種電気主任技術者（電験三種）",
    desc: "理論・電力・機械・法規"
  },
  shoubou: {
    title: "消防設備士",
    desc: "消防法・消火設備・警報設備・点検制度"
  },
  kikenbutsu4: {
    title: "危険物取扱者 乙種第4類",
    desc: "危険物の性質・消火・法令・基礎物理化学"
  }
};

const info = quizInfo[type] || quizInfo.denki2;

document.title = info.title + "クイズ";
document.getElementById("pageTitle").textContent = info.title + "クイズ";
document.getElementById("pageDesc").textContent = info.desc;

const quizList = document.getElementById("quizList");

quizList.innerHTML = Object.keys(quizInfo).map(key => `
  <a href="?type=${key}" class="${key === type ? "active" : ""}">
    ${quizInfo[key].title}
  </a>
`).join("");

function normalizeQuestion(q) {
  return {
    question: q.question || q.q,
    choices: q.choices || q.c,
    answer: q.answer || q.a,
    explanation: q.explanation || q.e || ""
  };
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

window.quizData = window.quizData || {};

const rawQuestions = window.quizData[type] || window.quizData.denki2 || [];

let questions = shuffle(rawQuestions.map(normalizeQuestion)).slice(0, 50);

let current = 0;
let score = 0;
let answered = false;

const counter = document.getElementById("counter");
const scoreEl = document.getElementById("score");
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const resultEl = document.getElementById("result");
const progressBar = document.getElementById("progressBar");

function showQuestion() {
  if (questions.length === 0) {
    counter.textContent = "0 / 0";
    questionEl.textContent = "問題データが読み込めません";
    choicesEl.innerHTML = "";
    resultEl.textContent = `window.quizData.${type} がありません`;
    return;
  }

  if (current >= questions.length) {
    finishQuiz();
    return;
  }

  answered = false;

  const q = questions[current];

  counter.textContent = `${current + 1} / ${questions.length}`;
  scoreEl.textContent = `スコア: ${score}`;
  questionEl.textContent = q.question;
  resultEl.textContent = "";

  progressBar.style.width = `${(current / questions.length) * 100}%`;

  choicesEl.innerHTML = "";

  shuffle(q.choices).forEach(choice => {
    const button = document.createElement("button");
    button.textContent = choice;
    button.onclick = () => checkAnswer(button, choice);
    choicesEl.appendChild(button);
  });
}

function checkAnswer(button, choice) {
  if (answered) return;

  answered = true;

  const q = questions[current];

  document.querySelectorAll("#choices button").forEach(btn => {
    btn.disabled = true;

    if (btn.textContent === q.answer) {
      btn.classList.add("correct");
    }
  });

  if (choice === q.answer) {
    score++;
    button.classList.add("correct");
    resultEl.textContent = q.explanation
      ? `正解！ ${q.explanation}`
      : "正解！";
  } else {
    button.classList.add("wrong");
    resultEl.textContent = q.explanation
      ? `不正解！ 正解は「${q.answer}」 ${q.explanation}`
      : `不正解！ 正解は「${q.answer}」`;
  }

  scoreEl.textContent = `スコア: ${score}`;

  setTimeout(() => {
    current++;
    showQuestion();
  }, 1700);
}

function finishQuiz() {
  counter.textContent = "終了";
  progressBar.style.width = "100%";
  questionEl.textContent = "結果発表";

  choicesEl.innerHTML = `
    <div class="finish">
      <p>${questions.length}問中 ${score}問正解！</p>
      <button onclick="location.reload()">もう一度挑戦</button>
      <a class="home-btn" href="./">ジャンル選択へ戻る</a>
    </div>
  `;

  resultEl.textContent = "";
}

showQuestion();