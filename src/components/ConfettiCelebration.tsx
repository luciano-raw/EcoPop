import confetti from 'canvas-confetti';

/**
 * Triggers a confetti celebration.
 * The intensity increases as the user accumulates more points.
 * 
 * @param pointsEarned The points earned in this transaction
 * @param totalPoints The user's new total points balance
 */
export const triggerConfetti = (pointsEarned: number, totalPoints: number) => {
  // Base confetti burst (Cinépolis Gold & Eco Green colors)
  const colors = ['#ffcc00', '#10b981', '#003bff', '#ffffff', '#34d399'];
  
  // Decide intensity based on total points
  // Level 1: Under 200 points (normal scan)
  // Level 2: 200 to 500 points (decent achievement)
  // Level 3: 500+ points (Eco Hero status!)
  
  if (totalPoints < 200) {
    // Single nice burst
    confetti({
      particleCount: 80 + Math.min(pointsEarned / 2, 50),
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
      disableForReducedMotion: true
    });
  } else if (totalPoints >= 200 && totalPoints < 500) {
    // Double side-cannon burst
    const duration = 1.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000, colors: colors };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, animate a bit higher than they start
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  } else {
    // LEVEL 3: Eco Hero Fireworks!
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000, colors: colors };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 70 * (timeLeft / duration);
      
      // Fire from multiple origins
      confetti({ 
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
      });
      confetti({ 
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
      });
      confetti({ 
        ...defaults, 
        particleCount: particleCount * 1.5, 
        origin: { x: 0.5, y: 0.4 } 
      });
    }, 200);
  }
};
