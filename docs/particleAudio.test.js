const { updateParticlesWithAudio } = require('./particleUpdate');

describe('Particle Audio Reactivity', () => {
  it('updates particle positions based on audio bass', () => {
    const positions = new Float32Array([0, 0, 0]);
    const audioData = new Uint8Array([100, 50, 0]);
    updateParticlesWithAudio(positions, audioData);
    expect(positions[1]).not.toBe(0);
  });
}); 