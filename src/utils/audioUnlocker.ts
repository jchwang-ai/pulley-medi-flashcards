/**
 * Utility to unlock audio on mobile browsers (especially iOS Safari)
 * which require a user interaction to start the AudioContext or play Audio.
 */
let unlocked = false;

export function unlockAudio() {
  if (unlocked) return;
  
  const silentAudio = new Audio();
  // Use a tiny silent wav data URI
  silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFRm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
  
  const unlock = () => {
    silentAudio.play()
      .then(() => {
        unlocked = true;
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
        console.log('Audio system unlocked');
      })
      .catch(err => {
        console.warn('Audio unlock failed:', err);
      });
  };

  window.addEventListener('click', unlock);
  window.addEventListener('touchstart', unlock);
}
