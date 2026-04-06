export const levels = [
  {
    id: 1,
    title: "African Food Prep",
    objective:
      "Complete the guided 10-step tabletop prep sequence: pour ingredients, mix by hold-and-shake, cut tomato and onion with knife slides, add chopped ingredients, and final mix. You only have 60 seconds.",
    controls: "Mouse hold-to-pour, hold-and-shake to mix, hold knife + horizontal slide to cut",
    scoring:
      "Garry 25%, Water 25%, Sauce 20%, Sardines 20%, exact cuts 10%.",
    timeLimitSeconds: 60,
    targets: {
      garry: 70,
      water: 60,
      sauce: 18,
      sardines: 35,
    },
    cutTargets: {
      tomato: 9,
      onion: 7,
    },
    assets: {
      garry: "png's/Garri.PNG",
      water: "png's/water.PNG",
      sauce: "png's/AfricanSauce.PNG",
      sardines: "png's/Sardines.PNG",
      bowl: "png's/Bowl.PNG",
      pourStream: "png's/PourStream.png",
      tomatoWhole: "png's/Tomato.PNG",
      tomatoSliced: "png's/TomatoSliced.PNG",
      onionWhole: "png's/Onion.PNG",
      onionSliced: "png's/OnionDiced.PNG",
      knife: "png's/Knife.png",
    },
  },
  {
    id: 2,
    title: "Discipline Decisions",
    objective:
      "Read each scenario and choose Ground or Don't Ground using parenting judgment.",
    controls: "Mouse click on binary choices",
    scoring: "Correct answers out of 13 questions.",
    scenarios: [
      { prompt: "Son did not clean his room when asked.", correct: "ground" },
      {
        prompt: "Son cleaned the kitchen table without being asked.",
        correct: "dont-ground",
      },
      { prompt: "Son lied about finishing homework.", correct: "ground" },
      {
        prompt: "Son helped younger sibling with schoolwork.",
        correct: "dont-ground",
      },
      {
        prompt: "Son shouted disrespectfully at parent.",
        correct: "ground",
      },
      {
        prompt: "Son forgot once to take out trash, apologized, then did it.",
        correct: "dont-ground",
      },
      {
        prompt: "Son broke curfew by one hour and didn't call.",
        correct: "ground",
      },
      {
        prompt: "Son received positive teacher feedback and was respectful.",
        correct: "dont-ground",
      },
      {
        prompt: "Son hit his brother during an argument.",
        correct: "ground",
      },
      {
        prompt: "Son spilled juice accidentally and cleaned it immediately.",
        correct: "dont-ground",
      },
      {
        prompt: "Son skipped chores to play games.",
        correct: "ground",
      },
      {
        prompt: "Son shared and behaved kindly with guests.",
        correct: "dont-ground",
      },
      {
        prompt: "Son used bad language repeatedly after warnings.",
        correct: "ground",
      },
    ],
  },
  {
    id: 3,
    title: "Assigning Chores",
    objective:
      "Assign two sons to house chores and prioritize time-efficient tasks.",
    controls: "Mouse click assignments",
    scoring: "Completed chores out of target 12 within 90 seconds.",
    placeholderHint:
      "Milestone 1 placeholder: timed spawn and assignment logic arrives in Milestone 3.",
  },
  {
    id: 4,
    title: "Drive to Pick Up Annalie",
    objective:
      "Switch lanes to avoid traffic, pick up Annalie, and return home safely.",
    controls: "Left and right arrow keys",
    scoring: "0%, 50%, or 100% based on crash phase.",
    assets: {
      annalie: "png's/Annalie.png",
      playerCar: "png's/Player Car.png",
    },
    placeholderHint:
      "Milestone 1 placeholder: lane movement and obstacle systems arrive in Milestone 3.",
  },
  {
    id: 5,
    title: "Family Balance",
    objective:
      "Answer yes/no prompts to balance Family Unity, Money, Kid's Happiness, and Kid's Success.",
    controls: "Mouse click yes/no",
    scoring: "Survive 30 prompts with tax events every 10 rounds; meter hits 0 ends the level.",
    targetPrompts: 30,
    promptEffects: [
      { prompt: "Family trip this weekend", yes: { FU: 7, MO: -6, KH: 6, KS: 1 }, no: { FU: -7, MO: 6, KH: -6, KS: -1 } },
      { prompt: "Take overtime shift", yes: { FU: -5, MO: 8, KH: -4, KS: 2 }, no: { FU: 5, MO: -8, KH: 4, KS: -2 } },
      { prompt: "Pay for after-school tutoring", yes: { FU: 1, MO: -6, KH: -2, KS: 7 }, no: { FU: -1, MO: 6, KH: 2, KS: -7 } },
      { prompt: "Host family game night", yes: { FU: 6, MO: -3, KH: 5, KS: 1 }, no: { FU: -6, MO: 3, KH: -5, KS: -1 } },
      { prompt: "Cut entertainment spending", yes: { FU: -2, MO: 7, KH: -5, KS: 2 }, no: { FU: 2, MO: -7, KH: 5, KS: -2 } },
      { prompt: "Enroll kids in coding camp", yes: { FU: -1, MO: -7, KH: -2, KS: 8 }, no: { FU: 1, MO: 7, KH: 2, KS: -8 } },
      { prompt: "Cook dinner together", yes: { FU: 5, MO: -2, KH: 4, KS: 2 }, no: { FU: -5, MO: 2, KH: -4, KS: -2 } },
      { prompt: "Buy the newest game console", yes: { FU: 2, MO: -8, KH: 7,KS: -2 }, no: { FU: -2, MO: 8, KH: -7, KS: 2 } },
      { prompt: "Set strict homework hours", yes: { FU: -1, MO: 1, KH: -4, KS: 7 }, no: { FU: 1, MO: -1, KH: 4, KS: -7 } },
      { prompt: "Plan a low-cost picnic", yes: { FU: 6, MO: -2, KH: 5, KS: 1 }, no: { FU: -6, MO: 2, KH: -5, KS: -1 } },
      { prompt: "Invest in exam prep books", yes: { FU: 0, MO: -5, KH: -1, KS: 6 }, no: { FU: 0, MO: 5, KH: 1, KS: -6 } },
      { prompt: "Skip date night to save money", yes: { FU: -4, MO: 6, KH: -2, KS: 1 }, no: { FU: 4, MO: -6, KH: 2, KS: -1 } },
      { prompt: "Let kids choose family activity", yes: { FU: 4, MO: -3, KH: 6, KS: 1 }, no: { FU: -4, MO: 3, KH: -6, KS: -1 } },
      { prompt: "Take a second side gig", yes: { FU: -6, MO: 9, KH: -3, KS: 1 }, no: { FU: 6, MO: -9, KH: 3, KS: -1 } },
      { prompt: "Pay for school field trip", yes: { FU: 2, MO: -7, KH: 4, KS: 6 }, no: { FU: -2, MO: 7, KH: -4, KS: -6 } },
      { prompt: "Weekend family cleaning challenge", yes: { FU: 3, MO: 1, KH: -2, KS: 5 }, no: { FU: -3, MO: -1, KH: 2, KS: -5 } },
      { prompt: "Order takeout to save time", yes: { FU: 2, MO: -6, KH: 4, KS: -1 }, no: { FU: -2, MO: 6, KH: -4, KS: 1 } },
      { prompt: "Family reading hour nightly", yes: { FU: 4, MO: 0, KH: 2, KS: 6 }, no: { FU: -4, MO: 0, KH: -2, KS: -6 } },
      { prompt: "Delay bill payment for fun day", yes: { FU: 3, MO: -9, KH: 4, KS: -1 }, no: { FU: -3, MO: 9, KH: -4, KS: 1 } },
      { prompt: "Start kids savings jars", yes: { FU: 1, MO: 5, KH: -2, KS: 4 }, no: { FU: -1, MO: -5, KH: 2, KS: -4 } },
      { prompt: "Sign up for music lessons", yes: { FU: 2, MO: -6, KH: 5, KS: 5 }, no: { FU: -2, MO: 6, KH: -5, KS: -5 } },
      { prompt: "Ban devices after dinner", yes: { FU: 2, MO: 0, KH: -5, KS: 6 }, no: { FU: -2, MO: 0, KH: 5, KS: -6 } },
      { prompt: "Family dance party night", yes: { FU: 6, MO: -1, KH: 6, KS: 1 }, no: { FU: -6, MO: 1, KH: -6, KS: -1 } },
      { prompt: "Skip vacation to build savings", yes: { FU: -5, MO: 8, KH: -4, KS: 2 }, no: { FU: 5, MO: -8, KH: 4, KS: -2 } },
      { prompt: "Reward report card with outing", yes: { FU: 3, MO: -5, KH: 5, KS: 4 }, no: { FU: -3, MO: 5, KH: -5, KS: -4 } },
      { prompt: "Add chore allowance system", yes: { FU: 1, MO: -3, KH: -1, KS: 6 }, no: { FU: -1, MO: 3, KH: 1, KS: -6 } },
      { prompt: "Family volunteer day", yes: { FU: 5, MO: -2, KH: 3, KS: 4 }, no: { FU: -5, MO: 2, KH: -3, KS: -4 } },
      { prompt: "Take unpaid day off for school event", yes: { FU: 4, MO: -7, KH: 3, KS: 5 }, no: { FU: -4, MO: 7, KH: -3, KS: -5 } },
      { prompt: "Prioritize budget meeting at home", yes: { FU: -1, MO: 6, KH: -2, KS: 3 }, no: { FU: 1, MO: -6, KH: 2, KS: -3 } },
      { prompt: "Visit grandparents together", yes: { FU: 7, MO: -3, KH: 4, KS: 2 }, no: { FU: -7, MO: 3, KH: -4, KS: -2 } },
    ],
  },
];
