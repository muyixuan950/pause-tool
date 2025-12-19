const moduleA = document.getElementById("module-a");
const moduleB = document.getElementById("module-b");
const moduleC = document.getElementById("module-c");
const moduleCPause = document.getElementById("module-c-pause");

const startBtn = document.getElementById("startBtn");
const backToA = document.getElementById("backToA");
const toC = document.getElementById("toC");
const backToB = document.getElementById("backToB");

const bInfluence = document.getElementById("b_influence");
const bNoControl = document.getElementById("b_nocontrol");
const bSupport = document.getElementById("b_support");

function show(el){ if(el) el.classList.remove("hidden"); }
function hide(el){ if(el) el.classList.add("hidden"); }

function saveB(){
  if(!bInfluence || !bNoControl || !bSupport) return;
  const data = {
    influence: bInfluence.value.trim(),
    nocontrol: bNoControl.value.trim(),
    support: bSupport.value.trim(),
  };
  localStorage.setItem("iam_b", JSON.stringify(data));
}

function loadB(){
  if(!bInfluence || !bNoControl || !bSupport) return;
  const raw = localStorage.getItem("iam_b");
  if(!raw) return;
  try{
    const data = JSON.parse(raw);
    bInfluence.value = data.influence || "";
    bNoControl.value = data.nocontrol || "";
    bSupport.value = data.support || "";
  }catch(e){}
}

function goTo(from, to){
  hide(from);
  show(to);

  // ===== Module E page background toggle =====
  document.body.classList.toggle("e-bg", to && to.id === "module-e");

  if(to) to.scrollIntoView({ behavior: "smooth", block: "start" });
}


loadB();

// A -> B
if(startBtn) startBtn.addEventListener("click", () => goTo(moduleA, moduleB));

// B -> A
if(backToA) backToA.addEventListener("click", () => goTo(moduleB, moduleA));

// autosave while typing
[bInfluence, bNoControl, bSupport].forEach(el => {
  if(!el) return;
  el.addEventListener("input", saveB);
});

// B -> C (require at least one field non-empty)
if(toC){
  toC.addEventListener("click", () => {
    saveB();
    const anyText =
      (bInfluence?.value || "").trim() ||
      (bNoControl?.value || "").trim() ||
      (bSupport?.value || "").trim();

    if(!anyText){
      bInfluence?.focus();
      return;
    }
    goTo(moduleB, moduleC);
  });
}

// C -> B
if(backToB) backToB.addEventListener("click", () => goTo(moduleC, moduleB));

// ===== Module C: Drivers -> Allowers =====
const drivers = document.querySelectorAll('.driver input');
const allowerBox = document.getElementById('allowerBox');
const toPause = document.getElementById('toPause');
const backToC = document.getElementById('backToC');
const pauseText = document.getElementById('pauseText');
const pauseVisual = document.getElementById('pauseVisual');
const pauseOverlay = document.getElementById('pauseOverlay');
const pauseHeadline = document.getElementById('pauseHeadline');
const pauseAllowers = document.getElementById('pauseAllowers');
const allowerContent = document.getElementById('allowerContent');

let pauseStep = 1; // 1=show headline, 2=show allowers
let pauseIndex = 0;
let pauseLines = [];


const allowers = {
  "Be Perfect": "It's okay to be good enough as you are.",
  "Be Strong": "It's okay to show vulnerability and ask for help.",
  "Try Hard": "It's okay to take action without pushing yourself too hard.",
  "Please Others": "It's okay to take care of your own needs.",
  "Hurry Up": "It's okay to take your time and be present."
};

function updateAllower(){
  const selected = Array.from(drivers)
    .filter(d => d.checked)
    .map(d => allowers[d.value]);

  if(selected.length === 0){
    allowerBox.classList.add("hidden");
    allowerContent.innerHTML = "";
    return;
  }

  allowerContent.innerHTML = selected
    .map(line => `<div class="allowerLine">${line}</div>`)
    .join("");

  allowerBox.classList.remove("hidden");
}


drivers.forEach(d => d.addEventListener('change', updateAllower));

// C -> Pause
if(toPause){
  toPause.addEventListener('click', () => {
    const text = allowerBox.textContent.trim();
    if(!text) return;

    // prepare allowers lines (but show none yet)
    pauseLines = Array.from(allowerBox.querySelectorAll(".allowerLine")).map(el => el.textContent.trim());
    pauseIndex = 0;
    pauseText.innerHTML = "";

    // show pause screen
    hide(moduleC);
    show(moduleCPause);

    // reset to step 1
    pauseStep = 1;
    pauseAllowers.classList.add("hidden");
    pauseHeadline.classList.remove("hidden");
    if(pauseToD) pauseToD.classList.add("hidden");

    // trigger rise animation for headline
    pauseHeadline.classList.add("pauseRise");
    pauseHeadline.classList.remove("is-visible");
    requestAnimationFrame(() => pauseHeadline.classList.add("is-visible"));
  });
}

// Click / keyboard on the fullscreen pause overlay
if(pauseOverlay){
  pauseOverlay.addEventListener("click", revealNextLine);
  pauseOverlay.addEventListener("keydown", (e) => {
    if(e.key === "Enter" || e.key === " "){
      e.preventDefault();
      revealNextLine();
    }
  });
}

// Pause -> C
if(backToC){
  backToC.addEventListener('click', () => goTo(moduleCPause, moduleC));
}

// Pause step 2
function revealNextLine(){
  // 第一次点击：从标题切到 allowers 区域
  if(pauseStep === 1){
    pauseStep = 2;
    pauseHeadline.classList.add("hidden");
    pauseAllowers.classList.remove("hidden");
  }

  // 如果已经全部显示完：不再追加（等待用户点 Continue）
  if(pauseIndex >= pauseLines.length){
    if(pauseToD) pauseToD.classList.remove("hidden");
    return;
  }

  const div = document.createElement("div");
  div.className = "allowerLine pauseRise";
  div.textContent = pauseLines[pauseIndex];
  pauseText.appendChild(div);

  requestAnimationFrame(() => div.classList.add("is-visible"));
  pauseIndex++;

  // 刚好显示完最后一行：显示 Continue
  if(pauseIndex >= pauseLines.length){
    if(pauseToD) pauseToD.classList.remove("hidden");
  }
}

// ===== Module D: Values (max 4) =====
const moduleD = document.getElementById("module-d");
const moduleE = document.getElementById("module-e");

const valuesGrid = document.getElementById("valuesGrid");
const valuesLimitNote = document.getElementById("valuesLimitNote");

const backToPause = document.getElementById("backToPause");
const toE = document.getElementById("toE");
const backToD = document.getElementById("backToD");


// Pause Continue button (in fullscreen pause)
const pauseToD = document.getElementById("pauseToD");

if(pauseToD){
  pauseToD.addEventListener("click", () => goTo(moduleCPause, moduleD));
}

const MAX_VALUES = 4;

const VALUES = [
  { name: "Integrity", desc: "Acting in a way that doesn’t go against who I believe I am." },
  { name: "Autonomy",  desc: "Being able to make this choice as my own." },
  { name: "Dignity",   desc: "Treating myself as someone worthy of respect." },

  { name: "Care",       desc: "Not causing unnecessary harm to myself or others." },
  { name: "Connection", desc: "Staying emotionally connected rather than cutting off." },
  { name: "Belonging",  desc: "Not choosing in a way that leaves me feeling excluded or alone." },
  { name: "Fairness",   desc: "Feeling that this choice is justifiable, not arbitrary or unfair." },

  { name: "Peace",    desc: "Choosing what allows me to feel calmer, not constantly tense." },
  { name: "Clarity",  desc: "Being able to understand what I’m doing and why." },
  { name: "Security", desc: "Protecting what I rely on to feel safe right now." },
  { name: "Stability",desc: "Avoiding changes that would make life feel unmanageably chaotic." },

  { name: "Growth",   desc: "Allowing myself to move forward rather than stay stuck." },
  { name: "Meaning",  desc: "Feeling that this choice matters to me beyond convenience." },
  { name: "Success",  desc: "Not undermining outcomes or results I’m working toward." }
];

let selectedValues = new Set();

function saveD(){
  localStorage.setItem("iam_d", JSON.stringify(Array.from(selectedValues)));
}

function loadD(){
  const raw = localStorage.getItem("iam_d");
  if(!raw) return;
  try{
    const arr = JSON.parse(raw);
    if(Array.isArray(arr)){
      const allowed = new Set(VALUES.map(v => v.name));
      selectedValues = new Set(arr.filter(v => allowed.has(v)));
    }
  }catch(e){}
}

function setContinueState(){
  if(!toE) return;
  // require at least 1 selected
  toE.disabled = !(selectedValues.size >= 1 && selectedValues.size <= MAX_VALUES);
}

let limitTimer = null;
function flashLimitNote(){
  if(!valuesLimitNote) return;
  valuesLimitNote.textContent = `You can choose up to ${MAX_VALUES}.`;
  valuesLimitNote.classList.remove("hidden");
  clearTimeout(limitTimer);
  limitTimer = setTimeout(() => valuesLimitNote.classList.add("hidden"), 1200);
}

function toggleValue(name){
  if(selectedValues.has(name)){
    selectedValues.delete(name);
    saveD();
    renderValues();
    return;
  }

  if(selectedValues.size >= MAX_VALUES){
    flashLimitNote();
    return;
  }

  selectedValues.add(name);
  saveD();
  renderValues();
}

function renderValues(){
  if(!valuesGrid) return;
  valuesGrid.innerHTML = "";

  VALUES.forEach(({ name, desc }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "valuePill";
    btn.setAttribute("aria-pressed", selectedValues.has(name) ? "true" : "false");

    const left = document.createElement("div");
    left.className = "valueName";
    left.textContent = name;

    const right = document.createElement("div");
    right.className = "valueMeta";
    right.textContent = selectedValues.has(name) ? "Selected" : "Tap";

    const hint = document.createElement("div");
    hint.className = "valueHint";
    hint.textContent = desc;

    btn.appendChild(left);
    btn.appendChild(right);
    btn.appendChild(hint);

    btn.addEventListener("click", () => toggleValue(name));
    valuesGrid.appendChild(btn);
  });

  setContinueState();
}

// init
loadD();
renderValues();

// ----- Navigation -----

// Pause -> D (click continue button)
if(pauseToD){
  pauseToD.addEventListener("click", () => goTo(moduleCPause, moduleD));
}

// D -> Pause
if(backToPause){
  backToPause.addEventListener("click", () => goTo(moduleD, moduleCPause));
}

// D -> E
if(toE){
  toE.addEventListener("click", () => {
    if(toE.disabled) return;
    goTo(moduleD, moduleE);
  });
}

// E -> D
if(backToD){
  backToD.addEventListener("click", () => goTo(moduleE, moduleD));
}

// ===== Module E =====

const eInfluenceSource = document.getElementById("e_influence_source");
const eNextStep = document.getElementById("e_next_step");
const eAllowing = document.getElementById("e_allowing");
const eValues = document.getElementById("e_values");
const copyE = document.getElementById("copyE");
const eNoControl = document.getElementById("e_nocontrol");
const eSupport = document.getElementById("e_support");

function normalizeAllower(line){
  return line
    .replace(/^It's okay to\s+/i, "")
    .replace(/^It's okay to\s+/i, "")
    .replace(/\.$/, "")
    .replace(/\byou are\b/i, "I am")
    .replace(/\byourself\b/i, "myself")
    .replace(/\byour\b/i, "my");
}


function normalizeValues(arr){
  if(!arr || arr.length === 0) return "";
  if(arr.length === 1) return arr[0].toLowerCase();
  return `what gives this decision ${arr
    .map(v => v.toLowerCase())
    .join(", ")}`;
}

// Load data into Module E
function loadE(){
  // ---- From Module B ----
  const rawB = localStorage.getItem("iam_b");
  if(rawB && eInfluenceSource){
    try{
      const data = JSON.parse(rawB);
      eInfluenceSource.value = data.influence || "";
    }catch(e){}
  }

  // ---- From Module B (background refs) ----
if(rawB){
  try{
    const data = JSON.parse(rawB);
    if(eNoControl) eNoControl.textContent = data.nocontrol || "";
    if(eSupport) eSupport.textContent = data.support || "";
  }catch(e){}
}

// ---- From Module C (allowers) ----
const selectedAllowers = Array.from(document.querySelectorAll(".driver input"))
  .filter(d => d.checked)
  .map(d => normalizeAllower(allowers[d.value]));

if(eAllowing){
  if(selectedAllowers.length === 1){
    eAllowing.textContent = selectedAllowers[0];
  }else if(selectedAllowers.length > 1){
    eAllowing.innerHTML = selectedAllowers
      .map((line, i) => {
        const suffix = i < selectedAllowers.length - 1 ? ",<br>" : "";
        return line + suffix;
      })
      .join("");
  }else{
    eAllowing.textContent = "";
  }
}

 // ---- From Module D (values) ----
const rawD = localStorage.getItem("iam_d");
if(rawD && eValues){
  try{
    const arr = JSON.parse(rawD);
    if(Array.isArray(arr)){
      eValues.textContent = normalizeValues(arr);
    }
  }catch(e){}
}

  // Focus next step box
  if(eNextStep){
    setTimeout(() => eNextStep.focus(), 0);
  }
}

// Hook into D -> E navigation
if(toE){
  toE.addEventListener("click", () => {
    if(toE.disabled) return;
    goTo(moduleD, moduleE);
    loadE();
  });
}

// Copy output
if(copyE){
  copyE.addEventListener("click", () => {
    const text = [
      "My next step is:",
      eNextStep?.value || "",
      "",
      "I'm allowing myself to:",
      eAllowing?.textContent || "",
      "",
      "I'm choosing not to betray:",
      eValues?.textContent || ""
    ].join("\n");

    navigator.clipboard.writeText(text);
  });
}

