import { calculateFinalScore, getCurrentLevelData, getProgressLabel } from "../core/gameState.js";

function getPercentColor(percent) {
  const clamped = Math.max(0, Math.min(100, percent));
  const hue = (clamped / 100) * 120;
  return `hsl(${hue}, 85%, 42%)`;
}

function renderScoreRows(scores) {
  return scores
    .map((score, idx) => {
      const value = score === null ? "Not played" : `${score}%`;
      return `<div class="kv"><span>Level ${idx + 1}</span><strong>${value}</strong></div>`;
    })
    .join("");
}

function shell(content) {
  return `<section class="card stack">${content}</section>`;
}

function toAssetSrc(path) {
  if (!path) {
    return "";
  }
  if (path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash
    .split("/")
    .map((segment, idx) => (idx === 0 ? segment : encodeURIComponent(segment)))
    .join("/");
}

function renderLevelOneScene(state, level) {
  const targets = level.targets;
  const cuts = level.cutTargets;
  const timeLimitSeconds = level.timeLimitSeconds ?? 45;
  const assets = level.assets ?? {};
  const progress = state.level1Progress ?? {
    step: 1,
    amounts: { garry: 0, water: 0, sauce: 0, sardines: 0 },
    cuts: { tomato: 0, onion: 0 },
    tomatoAdded: false,
    onionAdded: false,
    mixShakeCount: 0,
    isMixing: false,
    knifeEquipped: false,
    activePour: null,
  };

  const stepText = {
    1: "Step 1: Hold to pour garry into the bowl.",
    2: "Step 2: Hold to pour water into the bowl.",
    3: "Step 3: Hold and shake the mouse left-right to mix.",
    4: "Step 4: Hold to pour African sauce into the bowl.",
    5: "Step 5: Hold to pour sardines into the bowl.",
    6: "Step 6: Hold and shake the mouse left-right to mix again.",
    7: `Step 7: Click to equip knife, then slide horizontally on tomato (${cuts.tomato} cuts).`,
    8: `Step 8: Click to equip knife, then slide horizontally on onion (${cuts.onion} cuts).`,
    9: "Step 9: Add tomatoes and onions to the bowl.",
    10: "Step 10: Final mix - hold and shake the mouse left-right.",
  };

  const pourByStep = {
    1: "garry",
    2: "water",
    4: "sauce",
    5: "sardines",
  };

  const currentPour = pourByStep[progress.step];
  const inCuttingScene = progress.step === 7 || progress.step === 8;

  const ingredientLabels = {
    garry: "Garry",
    water: "Water",
    sauce: "African Sauce",
    sardines: "Sardines",
  };

  const singleIngredientVisual = currentPour
    ? assets[currentPour]
      ? `<img id="l1-current-ingredient" class="ingredient-img${progress.activePour === currentPour ? " pouring" : ""}" src="${toAssetSrc(assets[currentPour])}" alt="${ingredientLabels[currentPour]}" />`
      : `<div class="ingredient-fallback">${ingredientLabels[currentPour]}</div>`
    : `<div class="ingredient-fallback">Mixing Step</div>`;

  const amountRows = [
    ["garry", "Garry", targets.garry],
    ["water", "Water", targets.water],
    ["sauce", "African Sauce", targets.sauce],
    ["sardines", "Sardines", targets.sardines],
  ]
    .map(([key, label, target]) => {
      return `<div class="amount-row"><span>${label}</span><strong><span id="l1-amount-${key}">${progress.amounts[key]}</span>ml / ${target}ml</strong></div>`;
    })
    .join("");

  const pourControls = currentPour
    ? `<div class="stack">
        <p class="small">Hold to pour and release when you think the amount is right.</p>
        <button class="btn" data-l1-pour="${currentPour}">Hold to pour ${currentPour}</button>
      </div>`
    : "";

  const mixControls = [3, 6, 10].includes(progress.step)
    ? `<div class="stack">
        <p class="small">Keep holding inside the mix area and shake horizontally.</p>
        <div id="l1-mix-zone" class="mix-zone">
          <strong>Mix Area</strong>
          <span>Shakes: <span id="l1-shake-count">${progress.mixShakeCount}</span> / 12</span>
        </div>
      </div>`
    : "";

  const addControls = progress.step === 9
    ? `<div class="stack">
        <p class="small">Add both chopped ingredients to continue.</p>
        <div class="row">
          <button class="btn" data-l1-add="tomato">Add Tomato</button>
          <span id="l1-added-tomato">${progress.tomatoAdded ? "Added" : "Not added"}</span>
        </div>
        <div class="row">
          <button class="btn" data-l1-add="onion">Add Onion</button>
          <span id="l1-added-onion">${progress.onionAdded ? "Added" : "Not added"}</span>
        </div>
      </div>`
    : "";

  const cutItem = progress.step === 7 ? "tomato" : "onion";
  const cutWholeAsset = progress.step === 7 ? assets.tomatoWhole : assets.onionWhole;
  const cutSlicedAsset = progress.step === 7 ? assets.tomatoSliced : assets.onionSliced;
  const cutRatio = Math.max(
    0,
    Math.min(
      1,
      (progress.step === 7 ? progress.cuts.tomato / cuts.tomato : progress.cuts.onion / cuts.onion)
    )
  );

  const cutBlendVisual = cutWholeAsset || cutSlicedAsset
    ? `<div class="cut-blend" data-cut-item="${cutItem}">
        ${
          cutWholeAsset
            ? `<img id="l1-cut-whole" class="cut-asset large cut-layer" src="${toAssetSrc(cutWholeAsset)}" alt="${cutItem} whole" style="opacity:${1 - cutRatio}" />`
            : `<div id="l1-cut-whole" class="cut-fallback cut-layer" style="opacity:${1 - cutRatio}">${cutItem} whole</div>`
        }
        ${
          cutSlicedAsset
            ? `<img id="l1-cut-sliced" class="cut-asset large cut-layer" src="${toAssetSrc(cutSlicedAsset)}" alt="${cutItem} sliced" style="opacity:${cutRatio}" />`
            : `<div id="l1-cut-sliced" class="cut-fallback cut-layer" style="opacity:${cutRatio}">${cutItem} sliced</div>`
        }
      </div>`
    : `<div class="cut-fallback">${cutItem}</div>`;

  const currentCutCount = progress.step === 7 ? progress.cuts.tomato : progress.cuts.onion;
  const currentCutTarget = progress.step === 7 ? cuts.tomato : cuts.onion;

  return shell(`
    ${
      timeLimitSeconds > 0
        ? `<div class="timer-banner"><span>Time Left</span><strong><span id="l1-timer">${timeLimitSeconds}</span>s</strong><span id="l1-timer-alert" class="timer-alert">10 seconds left!</span></div>`
        : ""
    }
    <span class="level-chip">${getProgressLabel(state)}</span>
    <h2>${level.title}</h2>
    <div class="step-banner" id="l1-step-root">
      <strong>Step ${progress.step} of 10</strong>
      <span>${stepText[progress.step]}</span>
    </div>

    ${
      inCuttingScene
        ? `<div class="panel cutting-scene">
            <h3>Cutting Table</h3>
            <div class="cutting-layout">
              <div class="stack">
                <button id="l1-knife-toggle" class="knife-toggle-btn${progress.knifeEquipped ? " active" : ""}" type="button">
                  ${progress.knifeEquipped ? "Knife Equipped" : "Equip Knife"}
                </button>
                <p class="small">Click once to equip. Your cursor becomes the knife in the cutting area.</p>
                <p id="l1-knife-status" class="small">${progress.knifeEquipped ? "Knife ready" : "Knife not equipped"}</p>
                <p><strong>Cuts:</strong> <span id="l1-cut-count">${currentCutCount}</span> / ${currentCutTarget}</p>
                ${assets.knife ? `<img class="knife-asset" src="${toAssetSrc(assets.knife)}" alt="Knife" />` : ""}
              </div>
              <div id="l1-cut-surface" class="cut-surface">
                <div id="l1-knife-cursor" class="knife-cursor${progress.knifeEquipped ? " visible" : ""}">
                  ${assets.knife ? `<img class="knife-cursor-img" src="${toAssetSrc(assets.knife)}" alt="Knife cursor" />` : ""}
                </div>
                ${cutBlendVisual}
                <p class="small">Slide left and right over this area to cut.</p>
              </div>
            </div>
          </div>`
        : `<div class="panel bowl-scene">
            <h3>Tabletop Bowl Station</h3>
            <div class="bowl-stage">
              <div class="ingredient-strip">
                ${singleIngredientVisual}
              </div>
              <div id="l1-bowl-visual" class="bowl-visual${progress.isMixing && [3, 6, 10].includes(progress.step) ? " mixing" : ""}">
                ${assets.bowl ? `<img class="bowl-img" src="${toAssetSrc(assets.bowl)}" alt="Bowl" />` : `<div class="bowl-fallback">Bowl</div>`}
                ${
                  assets.pourStream
                    ? `<img id="l1-pour-stream" class="pour-stream${progress.activePour ? " visible" : ""}" src="${toAssetSrc(assets.pourStream)}" data-pour-color="${progress.activePour ?? "water"}" alt="Pour stream" />`
                    : ""
                }
                ${
                  assets.tomatoSliced
                    ? `<img id="l1-drop-tomato" class="drop-fx" src="${toAssetSrc(assets.tomatoSliced)}" alt="Tomato drop" />`
                    : `<div id="l1-drop-tomato" class="drop-fx drop-fx-fallback">Tomato</div>`
                }
                ${
                  assets.onionSliced
                    ? `<img id="l1-drop-onion" class="drop-fx" src="${toAssetSrc(assets.onionSliced)}" alt="Onion drop" />`
                    : `<div id="l1-drop-onion" class="drop-fx drop-fx-fallback">Onion</div>`
                }
              </div>
            </div>
            <div class="grid-2">
              <div class="stack">${amountRows}</div>
              <div class="stack">${pourControls}${mixControls}${addControls}</div>
            </div>
          </div>`
    }

  `);
}

function renderLevelTwoScene(state, level) {
  const total = level.scenarios.length;
  const currentIndex = state.level2Progress?.index ?? 0;
  const order = state.level2Progress?.order ?? [];
  const scenarioIndex = Number.isInteger(order[currentIndex]) ? order[currentIndex] : currentIndex;
  const prompt = level.scenarios[scenarioIndex];
  const step = Math.min(currentIndex + 1, total);

  if (!prompt) {
    return shell(`
      <span class="level-chip">${getProgressLabel(state)}</span>
      <h2>${level.title}</h2>
      <p>Quiz complete. Preparing your result...</p>
      <div class="row">
        <button class="btn" data-action="continue">Continue</button>
      </div>
    `);
  }

  return shell(`
    <span class="level-chip">${getProgressLabel(state)}</span>
    <h2>${level.title}</h2>
    <p class="small">Question ${step} of ${total}</p>
    <p class="quiz-prompt">${prompt.prompt}</p>
    <div class="row">
      <button class="btn danger" data-action="answer-level-2" data-choice="ground">Ground</button>
      <button class="btn" data-action="answer-level-2" data-choice="dont-ground">Don't Ground</button>
    </div>
  `);
}

function renderLevelThreeScene(state, level) {
  const progress = state.level3Progress ?? {
    remainingMs: 60000,
    completed: 0,
    target: 12,
    sons: {
      A: { taskLabel: null, busyUntil: 0 },
      B: { taskLabel: null, busyUntil: 0 },
    },
    activeChores: [],
  };

  const secondsLeft = Math.max(0, Math.ceil((progress.remainingMs ?? 0) / 1000));
  const sonASeconds = progress.sons?.A?.taskLabel
    ? Math.max(0, Math.ceil(((progress.sons.A.busyUntil ?? 0) - Date.now()) / 1000))
    : 0;
  const sonBSeconds = progress.sons?.B?.taskLabel
    ? Math.max(0, Math.ceil(((progress.sons.B.busyUntil ?? 0) - Date.now()) / 1000))
    : 0;

  const sonStatus = `
    <div class="grid-2">
      <div class="panel stack">
        <h3>Christian</h3>
        <p>${progress.sons?.A?.taskLabel ? `Busy: ${progress.sons.A.taskLabel}` : "Available"}</p>
        <p class="small">${progress.sons?.A?.taskLabel ? `${sonASeconds}s remaining` : "Ready for assignment"}</p>
      </div>
      <div class="panel stack">
        <h3>Jason</h3>
        <p>${progress.sons?.B?.taskLabel ? `Busy: ${progress.sons.B.taskLabel}` : "Available"}</p>
        <p class="small">${progress.sons?.B?.taskLabel ? `${sonBSeconds}s remaining` : "Ready for assignment"}</p>
      </div>
    </div>
  `;

  const choreCards = progress.activeChores?.length
    ? progress.activeChores
      .map((chore) => {
        return `
          <div class="panel chore-card">
            <strong>${chore.label}</strong>
            <p class="small">Duration: ${chore.durationSec}s</p>
            <div class="row">
              <button class="btn" data-action="assign-level-3" data-chore-id="${chore.id}" data-son="A">Assign Christian</button>
              <button class="btn alt" data-action="assign-level-3" data-chore-id="${chore.id}" data-son="B">Assign Jason</button>
            </div>
          </div>
        `;
      })
      .join("")
    : `<div class="panel"><p class="small">No chores waiting right now. New chores spawn every 8 seconds.</p></div>`;

  return shell(`
    <div class="timer-banner${secondsLeft <= 10 ? " urgent" : ""}">
      <span>Time Left</span>
      <strong>${secondsLeft}s</strong>
      <span class="timer-alert${secondsLeft <= 10 && secondsLeft > 0 ? " visible" : ""}">10 seconds left!</span>
    </div>
    <span class="level-chip">${getProgressLabel(state)}</span>
    <h2>${level.title}</h2>
    <p><strong>Completed chores:</strong> ${progress.completed} / ${progress.target}</p>
    ${sonStatus}
    <div class="stack">
      <h3>Available Chores</h3>
      ${choreCards}
    </div>
  `);
}

function renderLevelFourScene(state, level) {
  const progress = state.level4Progress ?? {
    lane: 1,
    phase: "outbound",
    remainingMs: 40000,
    obstacles: [],
    pickedUp: false,
    annalieVisible: false,
    annaliePassed: false,
  };
  const secondsLeft = Math.max(0, Math.ceil((progress.remainingMs ?? 0) / 1000));
  const laneLabels = ["Left", "Center", "Right"];
  const playerTopPercent = progress.phase === "return" ? 8 : 82;
  const assets = level.assets ?? {};
  const annalieImageSrc = toAssetSrc(assets.annalie);
  const playerCarImageSrc = toAssetSrc(assets.playerCar);

  const obstacleNodes = (progress.obstacles ?? [])
    .map((obstacle) => {
      return `<div class="road-obstacle" style="left: calc(${obstacle.lane} * 33.333% + 7%); top: ${obstacle.yPercent}%;"></div>`;
    })
    .join("");

  const annalieSide = progress.annalieVisible && !progress.annaliePassed
    ? `
      <aside class="annalie-side">
        <img class="pickup-placeholder-img" src="${annalieImageSrc}" alt="Annalie waiting at roadside" />
        <p><strong>Annalie waiting</strong></p>
      </aside>
    `
    : "";

  return shell(`
    <div class="timer-banner${secondsLeft <= 10 ? " urgent" : ""}">
      <span>${progress.phase === "return" ? "Return Trip" : "Outbound Trip"}</span>
      <strong>${secondsLeft}s</strong>
      <span class="timer-alert${secondsLeft <= 10 && secondsLeft > 0 ? " visible" : ""}">Stay focused!</span>
    </div>
    <span class="level-chip">${getProgressLabel(state)}</span>
    <h2>${level.title}</h2>
    <p><strong>Phase:</strong> ${progress.phase === "return" ? "Returning Home" : "Driving to Annalie"}</p>
    <p class="small">Use Left and Right arrow keys to switch lanes. Current lane: ${laneLabels[progress.lane] ?? "Center"}</p>
    <div class="road-layout">
      <div class="road-track${progress.phase === "return" ? " return" : ""}" id="l4-road-track">
        <div class="lane-divider" style="left: 33.333%;"></div>
        <div class="lane-divider" style="left: 66.666%;"></div>
        ${obstacleNodes}
        <img class="player-car fixed${progress.phase === "return" ? " return" : ""}" src="${playerCarImageSrc}" alt="Player car" style="left: calc(${progress.lane} * 33.333% + 7%); top: ${playerTopPercent}%;" />
      </div>
      ${annalieSide}
    </div>
  `);
}

function renderLevelFiveScene(state, level) {
  const progress = state.level5Progress ?? {
    index: 0,
    answered: 0,
    targetPrompts: level.targetPrompts ?? 30,
    meters: { FU: 50, MO: 50, KS: 50, KH: 50 },
    taxDueRound: null,
    lastTaxOutcome: null,
  };

  const prompts = level.promptEffects ?? [];
  const current = prompts[progress.index] ?? null;

  const meterRows = [
    ["FU", "Family Unity"],
    ["MO", "Money"],
    ["KH", "Kid's Happiness"],
    ["KS", "Kid's Success"],
  ]
    .map(([key, label]) => {
      const value = Math.max(0, Math.min(100, Math.round(progress.meters?.[key] ?? 50)));
      return `
        <div class="meter-card">
          <div class="meter-head"><strong>${label}</strong><span>${value}%</span></div>
          <div class="meter-track"><div class="meter-fill" style="width:${value}%;"></div></div>
        </div>
      `;
    })
    .join("");

  const progressLabel = `${Math.min(progress.answered, progress.targetPrompts)} / ${progress.targetPrompts}`;
  const taxDue = progress.taxDueRound !== null;
  const taxMessage = taxDue
    ? `Tax Collector arrived after round ${progress.taxDueRound}.`
    : "";
  const taxOutcomeMessage = progress.lastTaxOutcome === "paid"
    ? "Taxes paid: Money dropped by 20%."
    : progress.lastTaxOutcome === "skipped"
      ? "Taxes skipped: all meters dropped by 10."
      : "";
  const promptText = taxDue
    ? "Pay taxes now or skip taxes and take a global penalty."
    : (current?.prompt ?? "All prompts complete. Calculating your score...");

  return shell(`
    <span class="level-chip">${getProgressLabel(state)}</span>
    <h2>${level.title}</h2>
    <p><strong>Decisions made:</strong> ${progressLabel}</p>
    <div class="panel stack level5-board">
      <h3>Family Balance Meters</h3>
      <div class="level5-meters">
        ${meterRows}
      </div>
    </div>
    <div class="panel stack level5-prompt-card">
      <h3>Current Prompt</h3>
      <p class="quiz-prompt level5-prompt">${promptText}</p>
      ${taxDue ? `<p class="small"><strong>${taxMessage}</strong></p>` : ""}
      ${taxOutcomeMessage ? `<p class="small"><strong>${taxOutcomeMessage}</strong></p>` : ""}
      <div class="row">
        ${taxDue
          ? `<button class="btn ok" data-action="answer-level-5-tax" data-choice="pay">Pay Taxes</button>
             <button class="btn danger" data-action="answer-level-5-tax" data-choice="skip">Skip Taxes</button>`
          : `<button class="btn danger" data-action="answer-level-5" data-choice="no" ${current ? "" : "disabled"}>No</button>
             <button class="btn ok" data-action="answer-level-5" data-choice="yes" ${current ? "" : "disabled"}>Yes</button>`}
      </div>
      <p class="small">Every 10 prompts, taxes are due. Pay taxes to lose 20% Money, or skip and all four meters drop by 10. If any meter hits 0, the level ends immediately.</p>
    </div>
  `);
}

export function renderScene(state) {
  switch (state.scene) {
    case "title":
      return shell(`
        <h1>The Mom Game</h1>
        <div class="row">
          <button class="btn" data-action="start-game">Start Game</button>
        </div>
      `);

    case "intro":
      return shell(`
        <span class="level-chip">Story Intro</span>
        <h2>A Day in Mom Life</h2>
        <p>You are stepping into a busy day of parenting, home care, and family balance. Complete all five levels and reveal your final Mom score.</p>
        <div class="row">
          <button class="btn" data-action="continue">Continue</button>
        </div>
      `);

    case "instruction": {
      const level = getCurrentLevelData(state);
      return shell(`
        <span class="level-chip">${getProgressLabel(state)}</span>
        <h2>Instructions: ${level.title}</h2>
        <p><strong>Objective:</strong> ${level.objective}</p>
        <p><strong>Controls:</strong> ${level.controls}</p>
        <p><strong>Scoring:</strong> ${level.scoring}</p>
        <div class="row">
          <button class="btn" data-action="continue">Start Level</button>
        </div>
      `);
    }

    case "level-placeholder": {
      const level = getCurrentLevelData(state);
      const current = state.scores[state.currentLevel - 1] ?? 70;
      return shell(`
        <span class="level-chip">${getProgressLabel(state)}</span>
        <h2>${level.title} (Placeholder)</h2>
        <p>${level.placeholderHint}</p>
        <p class="small">For Milestone 1 testing, set a mock score then complete the level.</p>
        <div class="stack">
          <label for="mock-score"><strong>Mock level score: <span id="mock-score-value">${current}%</span></strong></label>
          <input id="mock-score" class="score-input" type="range" min="0" max="100" value="${current}" />
          <div class="row">
            <button class="btn ok" data-action="complete-level">Complete Level</button>
          </div>
        </div>
      `);
    }

    case "level-1": {
      const level = getCurrentLevelData(state);
      return renderLevelOneScene(state, level);
    }

    case "level-2": {
      const level = getCurrentLevelData(state);
      return renderLevelTwoScene(state, level);
    }

    case "level-3": {
      const level = getCurrentLevelData(state);
      return renderLevelThreeScene(state, level);
    }

    case "level-4": {
      const level = getCurrentLevelData(state);
      return renderLevelFourScene(state, level);
    }

    case "level-5": {
      const level = getCurrentLevelData(state);
      return renderLevelFiveScene(state, level);
    }

    case "level-result": {
      const levelScore = state.scores[state.currentLevel - 1];
      const scoreColor = getPercentColor(levelScore);
      return shell(`
        <span class="level-chip">${getProgressLabel(state)}</span>
        <h2>Level ${state.currentLevel} Complete</h2>
        <p class="result-big" style="color:${scoreColor}">${levelScore}%</p>
        <p>Your level percentage has been saved to the global score manager.</p>
        <div class="row">
          <button class="btn" data-action="continue">Continue</button>
        </div>
      `);
    }

    case "final-result": {
      const finalScore = calculateFinalScore(state);
      const finalColor = getPercentColor(finalScore);
      return shell(`
        <span class="level-chip">Final Result</span>
        <h2>Drumroll...</h2>
        <p class="result-big" style="color:${finalColor}">You are.. ${finalScore}% Mom!!</p>
        <h3>Level Breakdown</h3>
        ${renderScoreRows(state.scores)}
        <div class="row">
          <button class="btn alt" data-action="restart">Play Again</button>
        </div>
      `);
    }

    default:
      return shell(`<h2>Unknown scene</h2>`);
  }
}
