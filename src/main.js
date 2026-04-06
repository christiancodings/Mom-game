import {
  createGameState,
  getCurrentLevelData,
  moveToNextStep,
  resetGame,
  saveLevelScore,
  setScene,
} from "./core/gameState.js";
import { levels } from "./data/levels.js";
import { createRouter } from "./core/router.js";
import { renderScene } from "./ui/renderers.js";

const appEl = document.getElementById("app");
const state = createGameState();
state.level2Progress = createInitialLevelTwoProgress();
state.level1Progress = null;
state.level1Timer = null;
state.level3Progress = null;
state.level4Progress = null;
state.level5Progress = null;
state.audioUnlocked = false;
state.audioPrimed = false;
state.buttonClickSoundBound = false;
state.level1AssetsReady = false;
state.level4AssetsReady = false;
const router = createRouter(appEl, renderScene);

const AUTO_LEVEL4_TEST = false;
let level1PreloadPromise = null;
let level4PreloadPromise = null;

function toPreloadUrl(path) {
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash
    .split("/")
    .map((segment, idx) => (idx === 0 ? segment : encodeURIComponent(segment)))
    .join("/");
}

function toRawAssetUrl(path) {
  return path.startsWith("/") ? path : `/${path}`;
}

async function fetchWithTimeout(url, timeoutMs = 7000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { cache: "no-store", signal: controller.signal });
  }
  finally {
    clearTimeout(timeoutId);
  }
}

async function fetchAssetBlobUrl(assetPath) {
  const attempts = [toPreloadUrl(assetPath), toRawAssetUrl(assetPath)];
  for (const url of attempts) {
    let response;
    try {
      response = await fetchWithTimeout(url);
    }
    catch {
      continue;
    }
    if (response.ok) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
  }
  throw new Error(`Failed to load ${assetPath}`);
}

async function preloadLevelOneAssets() {
  if (state.level1AssetsReady) {
    return;
  }
  if (level1PreloadPromise) {
    await level1PreloadPromise;
    return;
  }

  const levelOne = levels.find((level) => level.id === 1);
  const assets = levelOne?.assets ?? {};
  const entries = Object.entries(assets);

  level1PreloadPromise = Promise.allSettled(
    entries.map(async ([key, assetPath]) => {
      assets[key] = await fetchAssetBlobUrl(assetPath);
    })
  ).then(() => {
    state.level1AssetsReady = true;
  }).finally(() => {
    level1PreloadPromise = null;
  });

  await level1PreloadPromise;
}

async function preloadLevelFourAssets() {
  if (state.level4AssetsReady) {
    return;
  }
  if (level4PreloadPromise) {
    await level4PreloadPromise;
    return;
  }

  const levelFour = levels.find((level) => level.id === 4);
  const assets = levelFour?.assets ?? {};
  const entries = Object.entries(assets);

  level4PreloadPromise = Promise.allSettled(
    entries.map(async ([key, assetPath]) => {
      assets[key] = await fetchAssetBlobUrl(assetPath);
    })
  ).then((results) => {
    state.level4AssetsReady = results.every((result) => result.status === "fulfilled");
  }).finally(() => {
    level4PreloadPromise = null;
  });

  await level4PreloadPromise;
}

function shuffleArray(values) {
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createInitialLevelTwoProgress() {
  const levelTwo = levels.find((level) => level.id === 2);
  const total = levelTwo?.scenarios?.length ?? 0;
  const order = shuffleArray(Array.from({ length: total }, (_, idx) => idx));
  return {
    index: 0,
    correct: 0,
    order,
  };
}

const audio = {
  bgMusic: new Audio("Sfx/BG-Music.mp3"),
  endOfGame: new Audio("Sfx/EndOfGameSound.mp3"),
  levelComplete: new Audio("Sfx/LevelCompleteSound.mp3"),
  traffic: new Audio("Sfx/Traffic.mp3"),
  mouseClick: new Audio("Sfx/MouseClick.mp3"),
  pouring: new Audio("Sfx/PouringSound.mp3"),
  slice: new Audio("Sfx/SliceSound.mp3"),
};

audio.bgMusic.loop = true;
audio.bgMusic.volume = 0.45;
audio.endOfGame.volume = 0.8;
audio.levelComplete.volume = 1;
audio.traffic.loop = true;
audio.traffic.volume = 0.42;
audio.mouseClick.volume = 0.62;
audio.pouring.loop = true;
audio.pouring.volume = 0.55;
audio.slice.volume = 0.7;

function safePlay(sound, { restart = false } = {}) {
  if (!sound) {
    return;
  }

  if (restart) {
    sound.currentTime = 0;
  }

  sound.play().catch(() => {
    // Ignore autoplay/gesture blocks; next user interaction will retry.
  });
}

function primeAudioElement(sound) {
  if (!sound) {
    return;
  }
  const wasMuted = sound.muted;
  sound.muted = true;
  const playPromise = sound.play();
  if (playPromise && typeof playPromise.then === "function") {
    playPromise
      .then(() => {
        sound.pause();
        sound.currentTime = 0;
        sound.muted = wasMuted;
      })
      .catch(() => {
        sound.muted = wasMuted;
      });
    return;
  }
  sound.pause();
  sound.currentTime = 0;
  sound.muted = wasMuted;
}

function primeGameplayAudio() {
  if (state.audioPrimed) {
    return;
  }
  state.audioPrimed = true;
  primeAudioElement(audio.levelComplete);
  primeAudioElement(audio.endOfGame);
  primeAudioElement(audio.traffic);
  primeAudioElement(audio.mouseClick);
  primeAudioElement(audio.pouring);
  primeAudioElement(audio.slice);
}

function unlockAndStartBgMusic() {
  if (!state.audioUnlocked) {
    state.audioUnlocked = true;
  }
  primeGameplayAudio();
  if (audio.bgMusic.paused) {
    safePlay(audio.bgMusic);
  }
}

function unlockAudioFromGesture() {
  if (!state.audioUnlocked) {
    state.audioUnlocked = true;
  }
  primeGameplayAudio();
}

function playLevelCompleteSound() {
  if (!state.audioUnlocked) {
    return;
  }
  const previousBgVolume = audio.bgMusic.volume;
  audio.bgMusic.volume = Math.max(0.2, previousBgVolume * 0.5);
  safePlay(audio.levelComplete, { restart: true });
  setTimeout(() => {
    audio.bgMusic.volume = previousBgVolume;
  }, 900);
}

function playFinalScoreSound() {
  if (!state.audioUnlocked) {
    return;
  }
  safePlay(audio.endOfGame, { restart: true });
}

function startPourSound() {
  if (!state.audioUnlocked) {
    return;
  }
  if (audio.pouring.paused) {
    safePlay(audio.pouring);
  }
}

function stopPourSound() {
  audio.pouring.pause();
  audio.pouring.currentTime = 0;
}

function playSliceSound() {
  if (!state.audioUnlocked) {
    return;
  }
  safePlay(audio.slice, { restart: true });
}

function startTrafficSound() {
  if (!state.audioUnlocked) {
    return;
  }
  if (audio.traffic.paused) {
    safePlay(audio.traffic);
  }
}

function stopTrafficSound() {
  audio.traffic.pause();
  audio.traffic.currentTime = 0;
}

function playMouseClickSound() {
  if (!state.audioUnlocked) {
    return;
  }
  safePlay(audio.mouseClick, { restart: true });
}

function syncSceneAudio() {
  if (state.scene === "level-4") {
    startTrafficSound();
    return;
  }
  stopTrafficSound();
}

function render() {
  router.render(state);
  wireEvents();
  syncSceneAudio();
}

function getMockScore() {
  const slider = document.getElementById("mock-score");
  if (!slider) {
    return 70;
  }
  return Number(slider.value);
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function createInitialLevelOneProgress() {
  return {
    step: 1,
    amounts: {
      garry: 0,
      water: 0,
      sauce: 0,
      sardines: 0,
    },
    cuts: {
      tomato: 0,
      onion: 0,
    },
    tomatoAdded: false,
    onionAdded: false,
    mixShakeCount: 0,
    isMixing: false,
    lastMixX: null,
    lastMixDirection: 0,
    knifeEquipped: false,
    lastKnifeX: null,
    lastKnifeY: null,
    lastKnifeDirection: 0,
    activePour: null,
    addTransitioning: false,
  };
}

const level3ChorePool = [
  "Wash dishes",
  "Put away shoes",
  "Wipe table",
  "Sort laundry",
  "Make bed",
  "Take out trash",
  "Sweep hallway",
  "Fold clothes",
  "Pack lunch",
  "Clean windows",
];

const LEVEL3_DURATION_MS = 90000;

function createInitialLevelThreeProgress() {
  return {
    startedAt: Date.now(),
    remainingMs: LEVEL3_DURATION_MS,
    completed: 0,
    target: 12,
    nextChoreId: 1,
    lastSpawnAt: Date.now(),
    activeChores: [],
    sons: {
      A: { busyUntil: 0, taskLabel: null },
      B: { busyUntil: 0, taskLabel: null },
    },
    intervalId: null,
  };
}

function clearLevelThreeLoop() {
  if (state.level3Progress?.intervalId) {
    clearInterval(state.level3Progress.intervalId);
  }
  if (state.level3Progress) {
    state.level3Progress.intervalId = null;
  }
}

function createRandomChore(progress) {
  const label = level3ChorePool[Math.floor(Math.random() * level3ChorePool.length)];
  const durationSec = 3 + Math.floor(Math.random() * 16);
  return {
    id: progress.nextChoreId++,
    label,
    durationSec,
  };
}

function finishLevelThree() {
  clearLevelThreeLoop();
  const progress = state.level3Progress;
  const score = progress.completed >= progress.target
    ? 100
    : clampPercent((progress.completed / progress.target) * 100);
  saveLevelScore(state, score);
  setScene(state, "level-result");
  playLevelCompleteSound();
  render();
}

function startLevelThreeLoop() {
  if (!state.level3Progress) {
    state.level3Progress = createInitialLevelThreeProgress();
  }
  const progress = state.level3Progress;
  if (progress.intervalId) {
    return;
  }

  // Spawn a couple chores immediately so the player can act right away.
  progress.activeChores.push(createRandomChore(progress), createRandomChore(progress));

  progress.intervalId = setInterval(() => {
    if (state.scene !== "level-3" || !state.level3Progress) {
      clearLevelThreeLoop();
      return;
    }

    const now = Date.now();
    progress.remainingMs = Math.max(0, LEVEL3_DURATION_MS - (now - progress.startedAt));

    ["A", "B"].forEach((sonKey) => {
      const son = progress.sons[sonKey];
      if (son.taskLabel && now >= son.busyUntil) {
        son.taskLabel = null;
        son.busyUntil = 0;
        progress.completed += 1;
      }
    });

    while (now - progress.lastSpawnAt >= 8000) {
      progress.lastSpawnAt += 8000;
      progress.activeChores.push(createRandomChore(progress));
      if (progress.activeChores.length > 6) {
        progress.activeChores.shift();
      }
    }

    if (progress.remainingMs <= 0) {
      finishLevelThree();
      return;
    }

    render();
  }, 200);
}

function createInitialLevelFourProgress() {
  return {
    startedAt: Date.now(),
    remainingMs: 45000,
    lane: 1,
    phase: "outbound",
    pickedUp: false,
    outboundProgress: 0,
    returnProgress: 0,
    annalieVisible: false,
    annaliePassed: false,
    returnStartedAt: 0,
    obstacles: [],
    nextObstacleId: 1,
    lastSpawnAt: Date.now(),
    intervalId: null,
  };
}

function createInitialLevelFiveProgress(level) {
  return {
    index: 0,
    answered: 0,
    targetPrompts: level?.targetPrompts ?? 30,
    meters: {
      FU: 50,
      MO: 50,
      KS: 50,
      KH: 50,
    },
    taxDueRound: null,
    lastTaxOutcome: null,
    gameOverReason: null,
  };
}

function clampMeter(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function applyLevelFiveAllMeterDelta(progress, delta) {
  Object.keys(progress.meters).forEach((meterKey) => {
    progress.meters[meterKey] = clampMeter((progress.meters[meterKey] ?? 50) + delta);
  });
}

function levelFiveHasZeroMeter(progress) {
  return Object.values(progress.meters).some((value) => value <= 0);
}

function finishLevelFive(progress) {
  const target = progress.targetPrompts || 30;
  const score = progress.answered >= target
    ? 100
    : clampPercent((progress.answered / target) * 100);
  saveLevelScore(state, score);
  setScene(state, "level-result");
  playLevelCompleteSound();
  render();
}

function answerLevelFive(choice) {
  const level = getCurrentLevelData(state);
  if (!state.level5Progress) {
    state.level5Progress = createInitialLevelFiveProgress(level);
  }
  const progress = state.level5Progress;
  if (progress.taxDueRound !== null) {
    return;
  }

  const prompts = level.promptEffects ?? [];
  const current = prompts[progress.index];
  if (!current) {
    finishLevelFive(progress);
    return;
  }

  const effects = choice === "yes" ? current.yes : current.no;
  Object.entries(effects).forEach(([meterKey, delta]) => {
    progress.meters[meterKey] = clampMeter((progress.meters[meterKey] ?? 50) + Number(delta));
  });

  progress.answered += 1;
  progress.index += 1;

  if (levelFiveHasZeroMeter(progress)) {
    progress.gameOverReason = "meter-zero";
    finishLevelFive(progress);
    return;
  }

  if (progress.answered > 0 && progress.answered % 10 === 0) {
    progress.taxDueRound = progress.answered;
    progress.lastTaxOutcome = null;
    render();
    return;
  }

  if (progress.answered >= progress.targetPrompts || progress.index >= prompts.length) {
    finishLevelFive(progress);
  }
}

function resolveLevelFiveTax(shouldPay) {
  const level = getCurrentLevelData(state);
  if (!state.level5Progress) {
    state.level5Progress = createInitialLevelFiveProgress(level);
  }
  const progress = state.level5Progress;
  if (progress.taxDueRound === null) {
    return;
  }

  if (shouldPay) {
    progress.meters.MO = clampMeter((progress.meters.MO ?? 0) * 0.8);
    progress.lastTaxOutcome = "paid";
  }
  else {
    applyLevelFiveAllMeterDelta(progress, -10);
    progress.lastTaxOutcome = "skipped";
  }

  progress.taxDueRound = null;

  if (levelFiveHasZeroMeter(progress)) {
    progress.gameOverReason = "meter-zero";
    finishLevelFive(progress);
    return;
  }

  const prompts = level.promptEffects ?? [];
  if (progress.answered >= progress.targetPrompts || progress.index >= prompts.length) {
    finishLevelFive(progress);
  }
}

function clearLevelFourLoop() {
  if (state.level4Progress?.intervalId) {
    clearInterval(state.level4Progress.intervalId);
  }
  if (state.level4Progress) {
    state.level4Progress.intervalId = null;
  }
}

function finishLevelFour(score) {
  clearLevelFourLoop();
  saveLevelScore(state, score);
  setScene(state, "level-result");
  playLevelCompleteSound();
  render();
}

function startLevelFourLoop() {
  if (!state.level4Progress) {
    state.level4Progress = createInitialLevelFourProgress();
  }
  const progress = state.level4Progress;
  if (progress.intervalId) {
    return;
  }

  progress.intervalId = setInterval(() => {
    if (state.scene !== "level-4" || !state.level4Progress) {
      clearLevelFourLoop();
      return;
    }

    const now = Date.now();
    const elapsedMs = now - progress.startedAt;
    progress.remainingMs = Math.max(0, 45000 - elapsedMs);

    const deltaSec = 0.1;
    const deltaMs = deltaSec * 1000;

    if (progress.phase === "outbound") {
      progress.outboundProgress = Math.min(1, progress.outboundProgress + deltaMs / 18000);

      if (elapsedMs >= 10000) {
        progress.annalieVisible = true;
      }

      if (progress.annalieVisible && progress.outboundProgress >= 0.72) {
        progress.annaliePassed = true;
        progress.pickedUp = true;
        progress.phase = "return";
        progress.returnStartedAt = now;
        progress.lastSpawnAt = now;
        progress.obstacles = [];
      }
    }
    else if (progress.phase === "return") {
      progress.returnProgress = Math.min(1, (now - progress.returnStartedAt) / 18000);
      if (progress.returnProgress >= 1) {
        finishLevelFour(100);
        return;
      }
    }

    const spawnEveryMs = progress.phase === "return" ? 500 : 1000;
    while (now - progress.lastSpawnAt >= spawnEveryMs) {
      progress.lastSpawnAt += spawnEveryMs;
      const isReturn = progress.phase === "return";
      progress.obstacles.push({
        id: progress.nextObstacleId++,
        lane: Math.floor(Math.random() * 3),
        yPercent: isReturn ? 112 : -12,
        speed: isReturn ? -84 : 62,
      });
    }

    progress.obstacles.forEach((obstacle) => {
      obstacle.yPercent += obstacle.speed * deltaSec;
    });
    progress.obstacles = progress.obstacles.filter((obstacle) => obstacle.yPercent >= -15 && obstacle.yPercent <= 115);

    const playerAnchorY = progress.phase === "return" ? 8 : 82;
    const hit = progress.obstacles.some((obstacle) => {
      return obstacle.lane === progress.lane && Math.abs(obstacle.yPercent - playerAnchorY) <= 10;
    });
    if (hit) {
      finishLevelFour(progress.pickedUp ? 50 : 0);
      return;
    }

    if (progress.remainingMs <= 0) {
      finishLevelFour(progress.pickedUp ? 50 : 0);
      return;
    }

    render();
  }, 100);
}

function playBowlDropFx(item) {
  const id = item === "tomato" ? "l1-drop-tomato" : "l1-drop-onion";
  const el = document.getElementById(id);
  if (!el) {
    return;
  }

  el.classList.remove("run");
  // Force reflow so animation can restart on repeated triggers.
  void el.offsetWidth;
  el.classList.add("run");
}

function resetLevelOneMotionState() {
  if (!state.level1Progress) {
    return;
  }
  state.level1Progress.isMixing = false;
  state.level1Progress.lastMixX = null;
  state.level1Progress.lastMixDirection = 0;
  state.level1Progress.knifeEquipped = false;
  state.level1Progress.lastKnifeX = null;
  state.level1Progress.lastKnifeY = null;
  state.level1Progress.lastKnifeDirection = 0;
  state.level1Progress.activePour = null;
  stopPourSound();
  document.body.style.cursor = "";
}

function updateKnifeCursorUI() {
  const progress = state.level1Progress;
  const cutSurface = document.getElementById("l1-cut-surface");
  const knifeCursor = document.getElementById("l1-knife-cursor");
  const statusEl = document.getElementById("l1-knife-status");
  if (!progress || !cutSurface) {
    return;
  }

  if (progress.knifeEquipped) {
    cutSurface.style.cursor = "none";
    if (knifeCursor) {
      knifeCursor.classList.add("visible");
    }
    if (statusEl) {
      statusEl.textContent = "Knife ready";
    }
  }
  else {
    cutSurface.style.cursor = "not-allowed";
    if (knifeCursor) {
      knifeCursor.classList.remove("visible");
    }
    if (statusEl) {
      statusEl.textContent = "Knife not equipped";
    }
  }
}

function updateKnifeCursorPosition(evt) {
  const cutSurface = document.getElementById("l1-cut-surface");
  const knifeCursor = document.getElementById("l1-knife-cursor");
  if (!cutSurface || !knifeCursor || !state.level1Progress?.knifeEquipped) {
    return;
  }

  const rect = cutSurface.getBoundingClientRect();
  const x = Math.max(0, Math.min(rect.width, evt.clientX - rect.left));
  const y = Math.max(0, Math.min(rect.height, evt.clientY - rect.top));
  knifeCursor.style.left = `${x}px`;
  knifeCursor.style.top = `${y}px`;
}

function finishLevelOne() {
  clearLevelOneTimer();
  stopPourSound();
  saveLevelScore(state, calculateLevelOneScore());
  setScene(state, "level-result");
  playLevelCompleteSound();
  render();
}

function moveLevelOneToNextStep() {
  ensureLevelOneProgress();
  if (state.level1Progress.step >= 10) {
    finishLevelOne();
    return;
  }

  state.level1Progress.step += 1;
  state.level1Progress.mixShakeCount = 0;
  resetLevelOneMotionState();
  render();
}

function clearLevelOneTimer() {
  if (state.level1Timer?.intervalId) {
    clearInterval(state.level1Timer.intervalId);
  }
  state.level1Timer = null;
}

function updateLevelOneTimerUI() {
  const timerEl = document.getElementById("l1-timer");
  const timerBannerEl = document.querySelector(".timer-banner");
  const timerAlertEl = document.getElementById("l1-timer-alert");
  if (!timerEl || !state.level1Timer) {
    return;
  }

  const secondsLeft = Math.max(0, Math.ceil(state.level1Timer.remainingMs / 1000));
  timerEl.textContent = String(secondsLeft);

  if (timerBannerEl) {
    timerBannerEl.classList.toggle("urgent", secondsLeft <= 10);
  }
  if (timerAlertEl) {
    timerAlertEl.classList.toggle("visible", secondsLeft <= 10 && secondsLeft > 0);
  }
}

function startLevelOneTimer() {
  if (state.level1Timer?.intervalId) {
    return;
  }

  const level = getCurrentLevelData(state);
  const timeLimitSeconds = level?.timeLimitSeconds ?? 45;
  if (!timeLimitSeconds || timeLimitSeconds <= 0) {
    clearLevelOneTimer();
    return;
  }

  state.level1Timer = {
    remainingMs: timeLimitSeconds * 1000,
    intervalId: null,
  };
  updateLevelOneTimerUI();

  state.level1Timer.intervalId = setInterval(() => {
    if (state.scene !== "level-1" || !state.level1Timer) {
      clearLevelOneTimer();
      return;
    }

    state.level1Timer.remainingMs -= 100;
    updateLevelOneTimerUI();

    if (state.level1Timer.remainingMs <= 0) {
      finishLevelOne();
    }
  }, 100);
}

function ensureLevelOneProgress() {
  if (!state.level1Progress) {
    state.level1Progress = createInitialLevelOneProgress();
  }
}

function calculateAccuracy(actual, target, tolerance) {
  const delta = Math.abs(actual - target);
  if (delta >= tolerance) {
    return 0;
  }
  return ((tolerance - delta) / tolerance) * 100;
}

function calculateLevelOneScore() {
  const level = getCurrentLevelData(state);
  const targets = level.targets;
  const cutTargets = level.cutTargets;
  ensureLevelOneProgress();
  const progress = state.level1Progress;

  const garry = progress.amounts.garry;
  const water = progress.amounts.water;
  const sauce = progress.amounts.sauce;
  const sardines = progress.amounts.sardines;

  const tomatoCuts = progress.cuts.tomato;
  const onionCuts = progress.cuts.onion;

  const garryAccuracy = calculateAccuracy(garry, targets.garry, Math.max(16, targets.garry * 0.5));
  const waterAccuracy = calculateAccuracy(water, targets.water, Math.max(16, targets.water * 0.5));
  const sauceAccuracy = calculateAccuracy(sauce, targets.sauce, Math.max(10, targets.sauce * 0.65));
  const sardinesAccuracy = calculateAccuracy(
    sardines,
    targets.sardines,
    Math.max(12, targets.sardines * 0.55)
  );

  const tomatoAccuracy = calculateAccuracy(tomatoCuts, cutTargets.tomato, 4);
  const onionAccuracy = calculateAccuracy(onionCuts, cutTargets.onion, 4);
  const prepScore = (tomatoAccuracy + onionAccuracy) / 2;

  const weighted =
    garryAccuracy * 0.25 +
    waterAccuracy * 0.25 +
    sauceAccuracy * 0.2 +
    sardinesAccuracy * 0.2 +
    prepScore * 0.1;

  return clampPercent(weighted);
}

function refreshLevelOneUI() {
  ensureLevelOneProgress();
  const level = getCurrentLevelData(state);
  const progress = state.level1Progress;

  ["garry", "water", "sauce", "sardines"].forEach((name) => {
    const amountEl = document.getElementById(`l1-amount-${name}`);
    if (amountEl) {
      amountEl.textContent = String(progress.amounts[name]);
    }
  });

  const cutCountEl = document.getElementById("l1-cut-count");
  if (cutCountEl) {
    if (progress.step === 7) {
      cutCountEl.textContent = String(progress.cuts.tomato);
    }
    if (progress.step === 8) {
      cutCountEl.textContent = String(progress.cuts.onion);
    }
  }

  const shakeCountEl = document.getElementById("l1-shake-count");
  if (shakeCountEl) {
    shakeCountEl.textContent = String(progress.mixShakeCount);
  }

  const tomatoAddedEl = document.getElementById("l1-added-tomato");
  const onionAddedEl = document.getElementById("l1-added-onion");
  if (tomatoAddedEl) {
    tomatoAddedEl.textContent = progress.tomatoAdded ? "Added" : "Not added";
  }
  if (onionAddedEl) {
    onionAddedEl.textContent = progress.onionAdded ? "Added" : "Not added";
  }

  const pourStreamEl = document.getElementById("l1-pour-stream");
  if (pourStreamEl) {
    if (progress.activePour) {
      pourStreamEl.classList.add("visible");
      pourStreamEl.setAttribute("data-pour-color", progress.activePour);
    }
    else {
      pourStreamEl.classList.remove("visible");
    }
  }

  const ingredientEl = document.getElementById("l1-current-ingredient");
  if (ingredientEl) {
    ingredientEl.classList.toggle("pouring", Boolean(progress.activePour));
  }

  const bowlEl = document.getElementById("l1-bowl-visual");
  if (bowlEl) {
    const shouldShake = progress.isMixing && [3, 6, 10].includes(progress.step);
    bowlEl.classList.toggle("mixing", shouldShake);
  }

  const wholeEl = document.getElementById("l1-cut-whole");
  const slicedEl = document.getElementById("l1-cut-sliced");
  if (wholeEl && slicedEl && level?.cutTargets) {
    const current = progress.step === 7 ? progress.cuts.tomato : progress.cuts.onion;
    const target = progress.step === 7 ? level.cutTargets.tomato : level.cutTargets.onion;
    const ratio = Math.max(0, Math.min(1, current / Math.max(1, target)));
    wholeEl.style.opacity = String(1 - ratio);
    slicedEl.style.opacity = String(ratio);
  }

  updateKnifeCursorUI();
  updateLevelOneTimerUI();
}

function wireLevelOneGameplay() {
  const stepRoot = document.getElementById("l1-step-root");
  if (!stepRoot) {
    return;
  }
  ensureLevelOneProgress();
  startLevelOneTimer();

  const level = getCurrentLevelData(state);
  const progress = state.level1Progress;
  const pourByStep = {
    1: "garry",
    2: "water",
    4: "sauce",
    5: "sardines",
  };

  const pourBtn = appEl.querySelector("[data-l1-pour]");
  if (pourBtn) {
    const expectedIngredient = pourByStep[progress.step];
    const stepAtPourStart = progress.step;
    let pourTimer = null;
    let poured = false;

    const stopPour = () => {
      if (pourTimer) {
        clearInterval(pourTimer);
        pourTimer = null;
      }

      progress.activePour = null;
      stopPourSound();
      refreshLevelOneUI();

      if (poured && expectedIngredient && progress.step === stepAtPourStart) {
        moveLevelOneToNextStep();
      }
      poured = false;
    };

    const startPour = () => {
      const ingredient = pourBtn.getAttribute("data-l1-pour");
      if (!ingredient || ingredient !== expectedIngredient) {
        return;
      }

      progress.activePour = ingredient;
      startPourSound();
      poured = false;
      refreshLevelOneUI();

      pourTimer = setInterval(() => {
        progress.amounts[ingredient] = Math.min(120, progress.amounts[ingredient] + 1);
        poured = true;
        refreshLevelOneUI();
      }, 70);
    };

    pourBtn.addEventListener("pointerdown", startPour);
    pourBtn.addEventListener("pointerup", stopPour);
    pourBtn.addEventListener("pointercancel", stopPour);
    pourBtn.addEventListener("pointerleave", stopPour);
  }

  const mixZone = document.getElementById("l1-mix-zone");
  if (mixZone) {
    const mixSteps = [3, 6, 10];

    const stopMix = () => {
      progress.isMixing = false;
      progress.lastMixX = null;
      progress.lastMixDirection = 0;
      refreshLevelOneUI();
    };

    mixZone.addEventListener("pointerdown", (evt) => {
      if (!mixSteps.includes(progress.step)) {
        return;
      }
      progress.isMixing = true;
      progress.mixShakeCount = 0;
      progress.lastMixX = evt.clientX;
      progress.lastMixDirection = 0;
      mixZone.setPointerCapture(evt.pointerId);
      refreshLevelOneUI();
    });

    mixZone.addEventListener("pointermove", (evt) => {
      if (!progress.isMixing || !mixSteps.includes(progress.step)) {
        return;
      }

      const dx = evt.clientX - (progress.lastMixX ?? evt.clientX);
      if (Math.abs(dx) < 16) {
        return;
      }

      const direction = dx > 0 ? 1 : -1;
      progress.lastMixX = evt.clientX;

      if (direction !== progress.lastMixDirection) {
        progress.lastMixDirection = direction;
        progress.mixShakeCount += 1;
        refreshLevelOneUI();
      }

      if (progress.mixShakeCount >= 12) {
        stopMix();
        moveLevelOneToNextStep();
      }
    });

    mixZone.addEventListener("pointerup", stopMix);
    mixZone.addEventListener("pointercancel", stopMix);
    mixZone.addEventListener("pointerleave", stopMix);
  }

  const knifeBtn = document.getElementById("l1-knife-toggle");
  const cutSurface = document.getElementById("l1-cut-surface");
  if (knifeBtn && cutSurface) {
    knifeBtn.addEventListener("click", () => {
      progress.knifeEquipped = !progress.knifeEquipped;
      progress.lastKnifeX = null;
      progress.lastKnifeY = null;
      progress.lastKnifeDirection = 0;
      knifeBtn.classList.toggle("active", progress.knifeEquipped);
      knifeBtn.textContent = progress.knifeEquipped ? "Knife Equipped" : "Equip Knife";
      updateKnifeCursorUI();
    });

    cutSurface.addEventListener("pointermove", (evt) => {
      updateKnifeCursorPosition(evt);
      if (!progress.knifeEquipped || (progress.step !== 7 && progress.step !== 8)) {
        return;
      }

      if (progress.lastKnifeX === null || progress.lastKnifeY === null) {
        progress.lastKnifeX = evt.clientX;
        progress.lastKnifeY = evt.clientY;
        return;
      }

      const dx = evt.clientX - progress.lastKnifeX;
      const dy = evt.clientY - progress.lastKnifeY;
      if (Math.abs(dx) < 18 || Math.abs(dx) <= Math.abs(dy)) {
        return;
      }

      const direction = dx > 0 ? 1 : -1;
      if (direction === progress.lastKnifeDirection) {
        progress.lastKnifeX = evt.clientX;
        progress.lastKnifeY = evt.clientY;
        return;
      }

      progress.lastKnifeX = evt.clientX;
      progress.lastKnifeY = evt.clientY;
      progress.lastKnifeDirection = direction;

      const item = progress.step === 7 ? "tomato" : "onion";
      const target = progress.step === 7 ? level.cutTargets.tomato : level.cutTargets.onion;
      progress.cuts[item] = Math.min(target, progress.cuts[item] + 1);
      playSliceSound();
      refreshLevelOneUI();

      if (progress.cuts[item] >= target) {
        progress.knifeEquipped = false;
        progress.lastKnifeDirection = 0;
        updateKnifeCursorUI();
        moveLevelOneToNextStep();
      }
    });

    cutSurface.addEventListener("pointerenter", (evt) => {
      updateKnifeCursorPosition(evt);
    });
  }

  appEl.querySelectorAll("[data-l1-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (progress.step !== 9) {
        return;
      }
      if (progress.addTransitioning) {
        return;
      }

      const ingredient = btn.getAttribute("data-l1-add");
      if (ingredient === "tomato") {
        progress.tomatoAdded = true;
        playBowlDropFx("tomato");
      }
      if (ingredient === "onion") {
        progress.onionAdded = true;
        playBowlDropFx("onion");
      }

      refreshLevelOneUI();
      if (progress.tomatoAdded && progress.onionAdded) {
        progress.addTransitioning = true;
        setTimeout(() => {
          progress.addTransitioning = false;
          moveLevelOneToNextStep();
        }, 550);
      }
    });
  });

  refreshLevelOneUI();
}

function wireLevelThreeGameplay() {
  if (state.scene !== "level-3") {
    return;
  }
  startLevelThreeLoop();
}

function wireLevelFourGameplay() {
  if (state.scene !== "level-4") {
    return;
  }
  startLevelFourLoop();
}

function ensureLevelTwoProgress() {
  if (!state.level2Progress || typeof state.level2Progress.index !== "number") {
    state.level2Progress = createInitialLevelTwoProgress();
  }
  if (!Array.isArray(state.level2Progress.order)) {
    state.level2Progress.order = createInitialLevelTwoProgress().order;
  }
}

function answerLevelTwo(choice) {
  const level = getCurrentLevelData(state);
  ensureLevelTwoProgress();

  const currentOrderIndex = state.level2Progress.order[state.level2Progress.index];
  const scenario = level.scenarios[currentOrderIndex];
  if (!scenario) {
    return;
  }

  if (choice === scenario.correct) {
    state.level2Progress.correct += 1;
  }

  state.level2Progress.index += 1;

  if (state.level2Progress.index >= level.scenarios.length) {
    const score = (state.level2Progress.correct / level.scenarios.length) * 100;
    saveLevelScore(state, score);
    setScene(state, "level-result");
  }
}

function wireEvents() {
  if (!state.buttonClickSoundBound) {
    appEl.addEventListener("click", (evt) => {
      if (evt.target.closest("button")) {
        playMouseClickSound();
      }
    });
    state.buttonClickSoundBound = true;
  }

  wireLevelOneGameplay();
  wireLevelThreeGameplay();
  wireLevelFourGameplay();

  const slider = document.getElementById("mock-score");
  const sliderLabel = document.getElementById("mock-score-value");
  if (slider && sliderLabel) {
    slider.addEventListener("input", () => {
      sliderLabel.textContent = `${slider.value}%`;
    });
  }

  appEl.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", async (evt) => {
      const action = evt.currentTarget.getAttribute("data-action");

      switch (action) {
        case "start-game":
          {
            const startBtn = evt.currentTarget;
            const originalText = startBtn.textContent;
            startBtn.disabled = true;
            startBtn.textContent = "Loading assets...";
            await preloadLevelOneAssets();
            await preloadLevelFourAssets();
            startBtn.disabled = false;
            startBtn.textContent = originalText;
          }
          unlockAndStartBgMusic();
          setScene(state, "intro");
          state.level2Progress = createInitialLevelTwoProgress();
          state.level1Progress = createInitialLevelOneProgress();
          state.level3Progress = null;
          state.level4Progress = null;
          state.level5Progress = null;
          break;

        case "continue":
          unlockAndStartBgMusic();
          {
            const wasLevelResult = state.scene === "level-result";
            const wasFinalLevelResult = wasLevelResult && state.currentLevel === 5;

            if (state.scene === "instruction" && state.currentLevel === 1) {
              state.level1Progress = createInitialLevelOneProgress();
            }
            if (state.scene === "instruction" && state.currentLevel === 2) {
              state.level2Progress = createInitialLevelTwoProgress();
            }
            if (state.scene === "instruction" && state.currentLevel === 3) {
              clearLevelThreeLoop();
              state.level3Progress = createInitialLevelThreeProgress();
            }
            if (state.scene === "instruction" && state.currentLevel === 4) {
              const continueBtn = evt.currentTarget;
              const originalText = continueBtn.textContent;
              continueBtn.disabled = true;
              continueBtn.textContent = "Loading assets...";
              try {
                await preloadLevelFourAssets();
              }
              finally {
                continueBtn.disabled = false;
                continueBtn.textContent = originalText;
              }
              clearLevelFourLoop();
              state.level4Progress = createInitialLevelFourProgress();
            }
            if (state.scene === "instruction" && state.currentLevel === 5) {
              state.level5Progress = createInitialLevelFiveProgress(getCurrentLevelData(state));
            }
            moveToNextStep(state);

            if (wasFinalLevelResult && state.scene === "final-result") {
              playFinalScoreSound();
            }
          }
          break;

        case "complete-level":
          unlockAndStartBgMusic();
          saveLevelScore(state, getMockScore());
          setScene(state, "level-result");
          playLevelCompleteSound();
          break;

        case "complete-level-1":
          finishLevelOne();
          break;

        case "answer-level-2": {
          unlockAndStartBgMusic();
          const choice = evt.currentTarget.getAttribute("data-choice");
          const previousScene = state.scene;
          answerLevelTwo(choice);
          if (previousScene !== "level-result" && state.scene === "level-result") {
            playLevelCompleteSound();
          }
          break;
        }

        case "assign-level-3": {
          if (state.scene !== "level-3" || !state.level3Progress) {
            break;
          }
          const choreId = Number(evt.currentTarget.getAttribute("data-chore-id"));
          const sonKey = evt.currentTarget.getAttribute("data-son");
          const progress = state.level3Progress;
          const son = progress.sons[sonKey];
          if (!son || son.taskLabel) {
            break;
          }

          const idx = progress.activeChores.findIndex((chore) => chore.id === choreId);
          if (idx < 0) {
            break;
          }

          const chore = progress.activeChores[idx];
          progress.activeChores.splice(idx, 1);
          son.taskLabel = chore.label;
          son.busyUntil = Date.now() + chore.durationSec * 1000;
          render();
          break;
        }

        case "answer-level-5": {
          if (state.scene !== "level-5") {
            break;
          }
          const choice = evt.currentTarget.getAttribute("data-choice");
          answerLevelFive(choice === "yes" ? "yes" : "no");
          break;
        }

        case "answer-level-5-tax": {
          if (state.scene !== "level-5") {
            break;
          }
          const choice = evt.currentTarget.getAttribute("data-choice");
          resolveLevelFiveTax(choice === "pay");
          break;
        }

        case "show-instruction":
          stopPourSound();
          clearLevelOneTimer();
          clearLevelThreeLoop();
          clearLevelFourLoop();
          setScene(state, "instruction");
          break;

        case "go-title":
          stopPourSound();
          clearLevelOneTimer();
          clearLevelThreeLoop();
          clearLevelFourLoop();
          resetGame(state);
          state.level2Progress = createInitialLevelTwoProgress();
          state.level1Progress = createInitialLevelOneProgress();
          state.level3Progress = null;
          state.level4Progress = null;
          state.level5Progress = null;
          break;

        case "restart":
          stopPourSound();
          clearLevelOneTimer();
          clearLevelThreeLoop();
          clearLevelFourLoop();
          resetGame(state);
          state.level2Progress = createInitialLevelTwoProgress();
          state.level1Progress = createInitialLevelOneProgress();
          state.level3Progress = null;
          state.level4Progress = null;
          state.level5Progress = null;
          break;

        default:
          break;
      }

      render();
    });
  });
}

function handleLevelFourKeydown(evt) {
  if (state.scene !== "level-4" || !state.level4Progress) {
    return;
  }

  if (evt.key === "ArrowLeft") {
    state.level4Progress.lane = Math.max(0, state.level4Progress.lane - 1);
    evt.preventDefault();
    render();
  }

  if (evt.key === "ArrowRight") {
    state.level4Progress.lane = Math.min(2, state.level4Progress.lane + 1);
    evt.preventDefault();
    render();
  }
}

document.addEventListener("pointerdown", unlockAudioFromGesture, { capture: true });
document.addEventListener("keydown", unlockAudioFromGesture, { capture: true });
document.addEventListener("keydown", handleLevelFourKeydown);

if (AUTO_LEVEL4_TEST) {
  setScene(state, "level-4");
  state.currentLevel = 4;
  state.level4Progress = createInitialLevelFourProgress();
}

render();
