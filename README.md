# Flappy Bird-Styled Game  
**by Anthony Joseph**

![Flappy Bird](Flappy Bird Game/images/favicon.jpeg)


---

## Overview

This is a browser-based, WebGL-powered flappy bird-style game where players control a bird trying to avoid crashing into pipes.

The game features:
- Smooth animated graphics with WebGL  
- Gradual difficulty increases  
- Night mode toggle  
- Start screen, countdown, and game over screen  
- High Score tracking with local storage  
- Sound effects for flapping and collisions  
- Background music  

---

## How to Play

- **Start**: Click the "Start" button to begin. A countdown from 3 to 0 will appear.  
- **Control the Bird**:  
  - Press the Spacebar or tap the screen (on mobile) to make the bird "flap" upward.  
  - Turn your “default zoom” to 50% on mobile for proper gameplay.  
- **Objective**:  
  - Fly the bird through the gaps between the pipes without hitting them or falling off the screen.  
- **Night Mode**:  
  - Press the Down Arrow key to change between Day and Night modes manually.  
  - Night mode is used for people who want a constant colour with no changing background and pipes.  

![Night Mode](images/NightMode.png)


- **Game Over**:  
  - If you crash into a pipe or fall off the screen, the game ends.  
  - Your final score and best score will be displayed.  
  - Press the Restart button to start over.  

---

## Visuals

- **WebGL Graphics**: Bird is drawn with a circle and triangles (wings, beak) that animate (wing flapping).  
- **Pipes**: Color changes based on the player's score.  
  - Green at the beginning  
  - Red after 20 points  
  - Blue after 40 points  
  - Black after 60 points  
  - Pink after 80 points  
  - Yellow after 100 points  
- **Background**: Changes colors dynamically:  
  - Green at the beginning  
  - Sky blue after 20 points  
  - Darker tones after 50 points  
  - Night mode after 100 points or by pressing the Down Arrow  

---

## Sound

- Background music plays during gameplay  
- Flap sound when the bird jumps  
- Collision sound when hitting a pipe or falling  

---

## Scoring

- Score increases by 1 for each pipe passed  
- High Score is stored using local storage  
- When you beat your previous high score, the score flashes gold  

---

## Difficulty

- Pipe movement speed increases as your score grows:  
  - Speed jumps once you pass 10 points  
  - Speed continues to gradually increase after 50 points  

---

## Controls

| Key / Action             | Function                   |
|--------------------------|----------------------------|
| Spacebar                 | Make the bird jump         |
| Touchscreen tap (mobile) | Make the bird jump         |
| Arrow Down               | Toggle night mode on/off   |
| Click Start              | Starts the game            |
| Click Restart            | Restarts the game after Game Over |

---

## Code Highlights

- **Bird Physics**: Gravity constantly pulls the bird down but pressing Space or tapping resets an upward velocity.  
- **Pipes**:  
  - Randomly generated at timed intervals  
- **Collision Detection**:  
  - If the bird touches a pipe or flies out of the screen, Game Over is triggered  
- **Animations**:  
  - Bird’s wing flaps subtly based on game frames  

---

## ENJOY THE GAME!
