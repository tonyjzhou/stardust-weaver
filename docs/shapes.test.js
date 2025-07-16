const { generateHeartVertices, generateTextVertices } = require('./shapes');

describe('Shape Generation', () => {
  it('generates heart shape vertices', () => {
    const vertices = generateHeartVertices(1.0, 100);
    expect(vertices.length).toBeGreaterThan(0);
    expect(vertices[0]).toHaveProperty('x');
    expect(vertices[0]).toHaveProperty('y');
    expect(vertices[0]).toHaveProperty('z');
  });
  it('generates text shape vertices', () => {
    const vertices = generateTextVertices("3D", 1.0, 100);
    expect(vertices.length).toBeGreaterThan(0);
    expect(vertices[0]).toHaveProperty('x');
    expect(vertices[0]).toHaveProperty('y');
    expect(vertices[0]).toHaveProperty('z');
  });
}); 