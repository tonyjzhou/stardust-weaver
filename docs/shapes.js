function generateHeartVertices(scale, numPoints) {
  const vertices = [];
  
  for (let i = 0; i < numPoints; i++) {
    const t = (i / numPoints) * Math.PI * 2;
    
    // Heart equation in 2D: x = 16sin³(t), y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
    const x = 16 * Math.pow(Math.sin(t), 3) * scale * 0.05;
    const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale * 0.05;
    const z = (Math.random() - 0.5) * scale * 0.2; // Add some depth variation
    
    vertices.push({ x, y, z });
  }
  
  return vertices;
}

function generateTextVertices(text, scale, density) {
  const vertices = [];
  // Simple implementation for "3D" text
  const letterWidth = scale * 0.3;
  const letterHeight = scale * 0.5;
  
  if (text === "3D") {
    // Generate "3" shape
    for (let i = 0; i < density / 2; i++) {
      const t = (i / (density / 2)) * Math.PI * 2;
      const x = Math.cos(t) * letterWidth - letterWidth;
      const y = Math.sin(t) * letterHeight;
      const z = (Math.random() - 0.5) * scale * 0.1;
      vertices.push({ x, y, z });
    }
    
    // Generate "D" shape
    for (let i = 0; i < density / 2; i++) {
      const t = (i / (density / 2)) * Math.PI;
      const x = Math.cos(t) * letterWidth + letterWidth;
      const y = Math.sin(t) * letterHeight;
      const z = (Math.random() - 0.5) * scale * 0.1;
      vertices.push({ x, y, z });
    }
  }
  
  return vertices;
}

module.exports = { generateHeartVertices, generateTextVertices }; 