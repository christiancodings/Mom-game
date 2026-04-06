# The Mom Game - Milestone 5 Build

This is a browser implementation through Milestone 5 of the PRD.

## Quick Local Link
- http://localhost:5500/

## Included in Milestone 5
- Core game loop and scene flow
- Global score manager
- Reusable level instruction screen template
- Playable Level 1 (African Food Prep) with weighted precision scoring
- Playable Level 2 (Discipline Decisions) with 13-scenario correctness scoring
- Playable Level 3 (Assigning Chores) with 90-second timed spawn/assignment loop and scoring
- Playable Level 4 (Drive to Pick Up Annalie) with lane obstacles and tri-state scoring
- Playable Level 5 (Family Balance) with four meters, opposing tradeoff prompts, and tax events every 10 rounds
- Final score screen: "You are.. X% Mom!!"

## Scene Flow
1. Title
2. Intro
3. Instruction (per level)
4. Level Gameplay (Levels 1-5 implemented)
5. Level Result
6. Repeat for levels 1-5
7. Final Result

## Project Structure
- `index.html`: app entry
- `styles/main.css`: UI styling
- `src/main.js`: event wiring and app startup
- `src/core/gameState.js`: global state and score logic
- `src/core/router.js`: simple scene router
- `src/ui/renderers.js`: scene HTML renderers
- `src/data/levels.js`: level metadata and instruction content

## Run Locally
Because this project uses ES modules, run it with a simple local web server.

### Option A: VS Code Live Server
1. Install Live Server extension if needed.
2. Right-click `index.html`.
3. Click "Open with Live Server".

### Option B: Python server
From `c:\ProjectsCode\MomGame` run:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Milestone 5 Test Checklist
1. Click Start Game from title.
2. Continue from intro to level instructions.
3. Level 1: adjust garry/water/sauce + prep checklist and complete.
4. Confirm Level 1 result appears with weighted percentage score.
5. Level 2: answer all 13 Ground/Don't Ground prompts.
6. Confirm Level 2 score matches (correct / 13) x 100.
7. Level 3: assign chores to Son A/Son B, survive 90s, verify score uses completed/12.
8. Level 4: use arrow keys to dodge obstacles, verify scoring is 0/50/100 by outcome.
9. Level 5: answer prompt tradeoffs and verify tax event appears every 10 rounds.
10. In Level 5 tax event: Pay Taxes reduces Money by 20%; Skip Taxes reduces all meters by 10.
11. Confirm Level 5 ends if any meter reaches 0, or scores by answered/30 when below target.
12. Confirm final score equals average of all 5 saved level scores.
12. Click Play Again and verify state resets.

## Notes
- Levels 1-5 are implemented through Milestone 5 tuning and QA.
