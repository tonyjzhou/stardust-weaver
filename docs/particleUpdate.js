function updateParticlesWithAudio(positions, audioData) {
  // Extract bass frequencies (first few bins represent lower frequencies)
  const bassLevel = audioData[0] / 255.0; // Normalize to 0-1
  
  // Apply audio-reactive displacement to Y position
  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 1] += Math.sin(Date.now() * 0.01 + i) * bassLevel * 0.1;
  }
}

module.exports = { updateParticlesWithAudio }; 