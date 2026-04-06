import { levels } from "../data/levels.js";

const totalLevels = levels.length;

function makeInitialScores() {
  return Array.from({ length: totalLevels }, () => null);
}

export function createGameState() {
  return {
    scene: "title",
    currentLevel: 1,
    scores: makeInitialScores(),
    drumrollOn: false,
  };
}

export function setScene(state, scene) {
  state.scene = scene;
}

export function resetGame(state) {
  state.scene = "title";
  state.currentLevel = 1;
  state.scores = makeInitialScores();
  state.drumrollOn = false;
}

export function getCurrentLevelData(state) {
  return levels.find((l) => l.id === state.currentLevel);
}

export function saveLevelScore(state, score) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  state.scores[state.currentLevel - 1] = clamped;
}

export function moveToNextStep(state) {
  if (state.scene === "level-result" && state.currentLevel < totalLevels) {
    state.currentLevel += 1;
    state.scene = "instruction";
    return;
  }

  if (state.scene === "level-result" && state.currentLevel === totalLevels) {
    state.scene = "final-result";
    return;
  }

  if (state.scene === "intro") {
    state.scene = "instruction";
    return;
  }

  if (state.scene === "instruction") {
    if (state.currentLevel === 1) {
      state.scene = "level-1";
      return;
    }

    if (state.currentLevel === 2) {
      state.scene = "level-2";
      return;
    }

    if (state.currentLevel === 3) {
      state.scene = "level-3";
      return;
    }

    if (state.currentLevel === 4) {
      state.scene = "level-4";
      return;
    }

    if (state.currentLevel === 5) {
      state.scene = "level-5";
      return;
    }

    state.scene = "level-placeholder";
  }
}

export function calculateFinalScore(state) {
  const safeScores = state.scores.map((s) => (typeof s === "number" ? s : 0));
  const total = safeScores.reduce((acc, s) => acc + s, 0);
  return Math.round(total / totalLevels);
}

export function getProgressLabel(state) {
  return `Level ${state.currentLevel} of ${totalLevels}`;
}
