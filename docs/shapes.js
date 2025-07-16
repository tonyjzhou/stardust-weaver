import * as THREE from "https://esm.sh/three@0.163.0";

function generateHeartVertices(scale, numPoints) {
  const vertices = [];
  
  for (let i = 0; i < numPoints; i++) {
    const t = (i / numPoints) * Math.PI * 2;
    
    // Heart equation in 2D: x = 16sin³(t), y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
    const x = 16 * Math.pow(Math.sin(t), 3) * scale * 0.05;
    const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale * 0.05;
    const z = (Math.random() - 0.5) * scale * 0.2; // Add some depth variation
    
    vertices.push(new THREE.Vector3(x, y, z));
  }
  
  return vertices;
}

function generateTextVertices(text, scale, density) {
    const vertices = [];
    
    // Create canvas for text rendering
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set up canvas dimensions and font
    const fontSize = 200;
    ctx.font = `bold ${fontSize}px Arial`;
    const metrics = ctx.measureText(text);
    canvas.width = Math.max(metrics.width, 100);
    canvas.height = fontSize * 1.2;
    
    // Clear and redraw with proper font settings
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, canvas.height / 2);
    
    // Sample pixels to create vertices
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const skip = Math.max(1, Math.floor(Math.sqrt(canvas.width * canvas.height / density)));
    
    for (let y = 0; y < canvas.height; y += skip) {
        for (let x = 0; x < canvas.width; x += skip) {
            const index = (y * canvas.width + x) * 4;
            const alpha = data[index + 3];
            
            if (alpha > 128) { // If pixel is visible
                // Convert canvas coordinates to 3D space
                const vx = ((x - canvas.width / 2) / canvas.height) * scale;
                const vy = ((canvas.height / 2 - y) / canvas.height) * scale;
                const vz = (Math.random() - 0.5) * scale * 0.1;
                
                vertices.push(new THREE.Vector3(vx, vy, vz));
            }
        }
    }
    
    return vertices;
}

export { generateHeartVertices, generateTextVertices };