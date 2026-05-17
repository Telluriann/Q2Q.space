import * as THREE from 'three'
import { createScene } from './scene'

const canvas = document.querySelector<HTMLCanvasElement>('#app canvas') ?? undefined
const scene = createScene(canvas)

function tick() {
  scene.update()
  requestAnimationFrame(tick)
}
tick()

// Typing animation logic for title
const titleElement = document.getElementById('animated-title');
if (titleElement) {
  const texts = ["Q2Q.space", "Quantum to Quasar"];
  
  let currentText = "";
  let isDeleting = false;
  let loopNum = 0;
  let typingSpeed = 120;
  
  function type() {
    const textIndex = loopNum % texts.length;
    const fullText = texts[textIndex];
    
    if (isDeleting) {
      currentText = fullText.substring(0, currentText.length - 1);
      typingSpeed = 50; // Faster when deleting
    } else {
      currentText = fullText.substring(0, currentText.length + 1);
      typingSpeed = 120;
    }
    
    titleElement!.textContent = currentText;
    
    let delta = typingSpeed;
    
    if (!isDeleting && currentText === fullText) {
      // Pause at the end of typing a word
      // Leave 'Q2Q.space' on screen longer (e.g. 5 seconds), and 'Quantum to Quasar' shorter (e.g. 2 seconds)
      delta = textIndex === 0 ? 5000 : 2000; 
      isDeleting = true;
    } else if (isDeleting && currentText === "") {
      isDeleting = false;
      loopNum++;
      delta = 500; // Pause before typing next word
    }
    
    setTimeout(type, delta);
  }
  
  // Start animation after a short delay
  setTimeout(type, 1000);
}
