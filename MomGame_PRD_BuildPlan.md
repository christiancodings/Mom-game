# MOM GAME
## Product Requirements Document (PRD) + Build Plan

- **Version:** 1.0  
- **Date:** April 2, 2026  
- **Product Owner:** Chris (Creator)

## 1. Product Summary
The Mom Game is a browser-based 2D cartoon game where the player takes the role of a mom managing home and family responsibilities across 5 mini-levels. Each level produces a percentage score. The final result is the average of all five scores and is shown on a final celebration screen:

**You are.. X% Mom!!**

### Design Goals
1. Progressive difficulty from Level 1 to Level 5.
2. Easy-medium challenge tuned for casual/family play.
3. Total run time target of 18-25 minutes.
4. Clear instructions before every level.
5. Equal weighting of each level in final score.

## 2. Target Platform and Experience
### Platform
1. Web browser (PC/laptop first)

### Build Approach
1. No-code/low-code first for fast MVP
2. Recommended tool: Construct 3
3. Alternate no-cost option: GDevelop

### Visual Direction
1. 2D cartoon style
2. Warm family/home atmosphere
3. Light story transitions between levels
4. Use existing audio assets provided by creator

### Controls
1. Mouse interactions for drag/drop and UI decisions
2. Keyboard left/right for driving level
3. One primary way to play (no alternate control mode for MVP)

## 3. Success Metrics
### Primary Success Metrics
1. At least 65% of first-time players complete all 5 levels.
2. Average session length is 18-25 minutes.
3. Players understand objective in each level without confusion.

### Level Completion Quality Targets
1. Level 1 average score >= 80%
2. Level 2 average score >= 70%
3. Level 3 average score >= 60%
4. Level 4 average score >= 55%
5. Level 5 average score >= 45%

## 4. Global Game Flow
1. Title Screen
2. Intro Story Screen
3. Level Instruction Screen
4. Gameplay Screen
5. Level Result Screen (percentage)
6. Repeat for all 5 levels
7. Final Drumroll + Final Score Screen

### Final Score Formula
Let level scores be $L_1, L_2, L_3, L_4, L_5$.

$$
\text{Final Percentage} = \frac{L_1 + L_2 + L_3 + L_4 + L_5}{5}
$$

## 5. Level Requirements

## Level 1: African Food Prep
### Goal
Create a dish using garry, water, African sauce, sliced tomatoes, and sliced onions with precise amounts.

### Instruction Text
Drag ingredients onto the counter and make the dish. Measure ingredients carefully and finish by slicing and adding tomatoes and onions.

### Gameplay
1. Countertop scene with hand cursor icon.
2. Drag garry into bowl.
3. Add water amount.
4. Add a little African sauce.
5. Slice tomatoes and onions with knife interaction.
6. Mix everything.

### Scoring
1. Garry accuracy: 35%
2. Water accuracy: 35%
3. Sauce accuracy: 20%
4. Tomato/onion prep completion and quality: 10%
5. Total = Level 1 percentage

### Difficulty Tuning
1. Forgiving acceptable ranges on first version.
2. Real-time visual feedback meter while adding ingredients.
3. No hard fail, always end with a score.

## Level 2: Discipline Decisions
### Goal
Answer family discipline scenarios with Ground or Don't Ground.

### Instruction Text
Read each scenario and choose Ground or Don't Ground based on behavior.

### Gameplay
1. 13 total prompts.
2. Two buttons: Ground and Don't Ground.
3. End screen shows total correct.

### Scoring
$$
L_2 = \left(\frac{\text{Correct}}{13}\right) \times 100
$$

### Scenario Bank (Editable)
1. Son did not clean his room when asked. Correct: Ground
2. Son cleaned the kitchen table without being asked. Correct: Don't Ground
3. Son lied about finishing homework. Correct: Ground
4. Son helped younger sibling with schoolwork. Correct: Don't Ground
5. Son shouted disrespectfully at parent. Correct: Ground
6. Son forgot once to take out trash, apologized, then did it. Correct: Don't Ground
7. Son broke curfew by one hour and didn't call. Correct: Ground
8. Son received positive teacher feedback and was respectful. Correct: Don't Ground
9. Son hit his brother during an argument. Correct: Ground
10. Son spilled juice accidentally and cleaned it immediately. Correct: Don't Ground
11. Son skipped chores to play games. Correct: Ground
12. Son shared and behaved kindly with guests. Correct: Don't Ground
13. Son used bad language repeatedly after warnings. Correct: Ground

## Level 3: Assigning Chores
### Goal
Maximize completed chores in 60 seconds by assigning two sons efficiently.

### Instruction Text
Chores appear around the house over time. Assign tasks to 2 sons and prioritize quick wins for maximum total completions.

### Gameplay
1. House map with chore icons appearing in rooms.
2. New chore spawns every 8 seconds.
3. Each chore has random duration between 3 and 18 seconds.
4. Player assigns each chore to Son A or Son B.
5. Each son can only do one task at a time.
6. Round duration is 60 seconds.

### Scoring
1. If completed chores >= 12, score is 100%.
2. If completed chores < 12:

$$
L_3 = \left(\frac{\text{Completed}}{12}\right) \times 100
$$

### Example Chores
1. Wash dishes: 15s
2. Put away shoes: 7s
3. Wipe table: 5s
4. Sort laundry: 11s
5. Make bed: 6s

## Level 4: Drive to Pick Up Annalie
### Goal
Drive to pick up Annalie, then return home while avoiding obstacles in 3 lanes.

### Instruction Text
Move left and right to avoid cones and cars. Reach Annalie first, then survive the trip back home.

### Gameplay
1. Three lanes.
2. Left/right arrows to switch lanes.
3. Outbound road phase to reach Annalie.
4. Return road phase with slightly increased challenge.
5. Collision ends run with score based on phase.

### Scoring
1. Crash before pickup: 0%
2. Pickup achieved, crash on return: 50%
3. Pickup + return home safely: 100%

## Level 5: Family Balance (Hardest)
### Goal
Keep 4 family meters above 0 as long as possible while answering yes/no prompts.

### Instruction Text
Balance Family Unity, Money, Kid Success, and Kid Happiness. Every choice helps some areas and hurts others. If any meter hits 0, you lose.

### Gameplay
1. Meters: Family Unity (FU), Money (MO), Kid Success (KS), Kid Happiness (KH)
2. Initial values: all 50%
3. Meter bounds: 0 to 100
4. Continuous prompt queue with Yes/No choices
5. Prompt effects can be positive, negative, or mixed
6. Lose condition: any meter reaches 0

### Scoring
1. If answered prompts >= 30, score = 100%
2. If answered prompts < 30:

$$
L_5 = \left(\frac{\text{Answered}}{30}\right) \times 100
$$

### Balance Helper Rule (Recommended)
1. Every 5 prompts survived, give +3 to the currently lowest meter.

## 6. Level 5 Prompt Bank (90 Prompts)
**Format:** Prompt | YES effect | NO effect

1. Family movie night | FU+7 KH+6 MO-3 | FU-4 KH-3
2. Buy school books early | KS+6 MO-5 | KS-4
3. Take kids to park | FU+5 KH+7 MO-2 | KH-4
4. Extra tutoring | KS+8 KH-3 MO-4 | KS-5
5. Family dinner at home | FU+6 KH+3 MO-2 | FU-3
6. Surprise toy gift | KH+8 MO-6 | KH-3
7. Weekend overtime | MO+9 FU-4 KH-3 | MO-4
8. Attend parent-teacher meeting | KS+6 FU+3 MO-1 | KS-4 FU-2
9. Enforce strict bedtime | KS+4 KH-2 FU+1 | KS-2 KH+1
10. Let kids stay up late | KH+4 FU+2 KS-4 | KH-1
11. Save money this week | MO+7 KH-2 | MO-3
12. Family reflection night | FU+6 KH+2 | FU-2
13. Cook together | FU+5 KS+2 KH+4 MO-2 | FU-2
14. Buy educational app | KS+5 MO-4 | KS-2
15. Skip outing to save cash | MO+5 FU-3 KH-4 | MO-2
16. Reward good grades | KH+5 KS+2 MO-3 | KH-2
17. Deep-clean together | FU+4 KS+1 KH-2 | FU-1
18. Replace broken appliance | FU+2 MO-8 KH+1 | FU-2 KH-1
19. Teach budgeting | KS+4 MO+3 KH-1 | KS-2
20. Host cousins sleepover | FU+7 KH+6 MO-5 | FU-2 KH-2
21. Delay a bill for fun outing | KH+3 FU+1 MO-8 | KH-2
22. Limit screen time | KS+5 KH-3 FU+1 | KS-2 KH+1
23. Family dance evening | FU+6 KH+6 MO-1 | FU-3
24. Buy healthy groceries | KS+3 KH+2 MO-4 | KS-2
25. Work from home tonight | MO+4 FU+2 KH-1 | MO-2
26. Pay for field trip | KS+6 KH+4 MO-7 | KS-3 KH-2
27. Chore checklist system | KS+4 FU+2 KH-1 | KS-2
28. Ignore sibling argument | KH-3 FU-5 | FU+1 KH+1
29. Mediate sibling argument calmly | FU+6 KH+2 | FU-2
30. Visit grandparents | FU+7 KH+4 MO-3 | FU-3
31. Buy cheaper shoes | MO+3 KH-2 KS-1 | MO-2
32. Buy better school shoes | KS+2 KH+2 MO-4 | KH-1
33. Family game night | FU+6 KH+5 | FU-3
34. Emergency doctor visit | KH+1 KS+1 MO-9 | KH-3
35. Reading hour | KS+6 KH-1 | KS-3
36. Kids choose dinner | KH+4 FU+2 MO-2 | KH-1
37. Cancel outing for chores | KS+2 KH-4 FU-2 | KS-1
38. Hire cleaning help | FU+2 KH+2 MO-6 | FU-1
39. Weekly family schedule | FU+4 KS+4 KH-1 | FU-2 KS-2
40. Buy classmate party gift | KH+4 FU+1 MO-4 | KH-2
41. Strict allowance budget | MO+6 KH-2 | MO-2
42. Increase allowance | KH+3 KS+2 MO-4 | KH-1
43. Family volunteering | FU+5 KS+3 KH+2 MO-2 | FU-2
44. Skip breakfast to save time | KS-3 KH-3 MO+1 | KS+1
45. Prepare breakfast together | FU+4 KS+2 KH+2 MO-2 | FU-1
46. Upgrade home internet | KS+5 MO-5 | KS-2
47. Skip homework check | KS-4 KH+1 | KS+1
48. Check homework carefully | KS+6 KH-1 FU+1 | KS-2
49. Low-cost picnic | FU+5 KH+4 MO-2 | FU-2
50. Expensive weekend trip | FU+7 KH+6 MO-10 | FU-2 KH-2
51. Kids help younger sibling | FU+3 KS+2 KH-1 | FU-1
52. Do all tasks yourself | KH+1 FU-2 KS-1 | FU+1
53. Celebrate small wins | KH+5 FU+4 MO-1 | KH-2
54. Delay celebration | MO+2 KH-3 | MO-1
55. Buy second-hand study desk | KS+3 MO-2 KH+1 | KS-1
56. Buy premium desk set | KS+4 KH+2 MO-7 | KS-1
57. Start savings jar | MO+5 KS+1 KH-1 | MO-2
58. Spend bonus on treats | KH+5 FU+2 MO-6 | KH-2
59. Require apology for rude behavior | FU+3 KS+2 KH-2 | FU-3
60. Ignore rude behavior | KH+1 FU-4 KS-2 | KH-1
61. Invite friends over | KH+5 FU+2 MO-3 | KH-2
62. Decline visit to save money | MO+2 KH-3 FU-1 | MO-1
63. Family cleanup challenge | FU+4 KS+2 KH+1 | FU-2
64. Replace broken phone now | KH+3 KS+1 MO-8 | KH-2
65. Delay phone replacement | MO+3 KH-4 KS-1 | MO-1
66. Bedtime story | FU+5 KH+4 KS+1 | FU-2
67. Skip bedtime routine | KS-2 KH-2 FU-3 | KS+1
68. One-on-one talk with each child | FU+6 KH+3 | FU-2
69. Extra chores as consequence | KS+3 KH-3 FU+1 | KS-1
70. Remove all chores | KH+2 KS-4 FU-1 | KH-1
71. Family sports day | FU+6 KH+5 MO-2 | FU-2
72. Buy new sports gear | KH+3 KS+1 MO-5 | KH-1
73. Focus only on money this week | MO+8 FU-4 KH-4 KS-1 | MO-3
74. Focus only on school this week | KS+8 KH-4 FU-2 | KS-2
75. Focus only on fun this week | KH+8 FU+3 KS-5 MO-3 | KH-2
76. Balanced weekly plan | FU+4 KS+4 KH+4 MO+2 | FU-1
77. Repair item yourself | MO+3 KS+1 KH-1 | MO-2
78. Pay for urgent repair service | FU+1 KH+1 MO-6 | FU-1
79. Encourage sibling teamwork | FU+5 KS+2 KH+2 | FU-2
80. Let each child work alone always | KS+1 FU-4 KH-1 | FU+1
81. Family budget meeting | MO+4 KS+2 FU+2 KH-1 | FU-1
82. Buy concert tickets | KH+6 FU+3 MO-7 | KH-2
83. Start weekly reading challenge | KS+5 KH+1 FU+1 | KS-2
84. Skip school project supplies | MO+2 KS-5 KH-1 | MO-1
85. Plan surprise family thank-you night | FU+8 KH+4 MO-3 | FU-3
86. Extend work shift before school event | MO+6 KS-1 FU-4 KH-2 | MO-2
87. Teach kids simple cooking skills | KS+3 FU+3 KH+2 MO-1 | KS-1
88. Buy new family board game | FU+4 KH+5 MO-4 | KH-1
89. Pay for exam prep class | KS+7 MO-6 KH-1 | KS-3
90. Pause all spending for a week | MO+8 KH-3 FU-2 | MO-2

## 7. Build Plan and Delivery Milestones

## Milestone 1: Foundation and Core Loop
1. Build all global screens and navigation flow.
2. Implement global state and scoring manager.
3. Add reusable instruction-card component.
4. Add audio manager using creator's existing audio.
5. Output: End-to-end shell with placeholder gameplay.

## Milestone 2: Build Levels 1 and 2
1. Implement Level 1 drag/drop cooking and precision scoring.
2. Implement Level 2 scenario quiz and correctness scoring.
3. Create result cards with percentage display.
4. Output: First two complete playable levels.

## Milestone 3: Build Levels 3 and 4
1. Implement Level 3 chore spawn/timer/assignment logic.
2. Implement Level 4 lane driving and obstacle logic.
3. Add tri-state Level 4 scoring (0, 50, 100).
4. Output: Four-level sequence playable.

## Milestone 4: Build Level 5 and Prompt System
1. Implement 4-meter system and lose-at-zero rule.
2. Add data-driven prompt ingestion (CSV/JSON).
3. Add 90 prompt entries and effect resolution.
4. Output: Full five-level run with final score.

## Milestone 5: Tuning and QA
1. Tune difficulty to easy-medium curve.
2. Validate instruction clarity before each level.
3. Run repeated full-play sessions for timing target.
4. Fix balancing and UI readability issues.
5. Output: Release-ready MVP.

## 8. QA Checklist
1. Verify all five level percentages calculate correctly.
2. Verify final percentage equals average of all five levels.
3. Verify Level 4 scoring states map to exact outcomes.
4. Verify Level 5 always ends when any meter reaches 0.
5. Verify no level can soft-lock.
6. Verify full run target remains 18-25 minutes.
7. Verify all instruction screens appear before level start.

## 9. Out of Scope for MVP
1. Multiplayer
2. User accounts or cloud save
3. Mobile native app deployment
4. Localization/multi-language
5. Advanced accessibility modes beyond base controls

## 10. Recommended AI Model
Best core model for creating this game: **GPT-5.3-Codex**.

Use it for:
1. System design and architecture
2. Gameplay logic and balancing formulas
3. Prompt content generation and editing tools
4. Iterative tuning and QA support

---

**End of Document**
