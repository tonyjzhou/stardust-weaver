import * as THREE from "https://esm.sh/three@0.163.0";
import { SVGLoader } from "https://esm.sh/three@0.163.0/examples/jsm/loaders/SVGLoader.js";

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
    const fontSize = 400; // Increased for better resolution
    ctx.font = `bold ${fontSize}px sans-serif`;
    const metrics = ctx.measureText(text);
    canvas.width = Math.max(metrics.width + 40, 200); // Add padding
    canvas.height = fontSize * 1.5; // More height for better spacing
    
    // Clear and redraw with proper font settings
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Sample pixels to create vertices with improved algorithm
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Use a smaller, more consistent skip value for better definition
    const skip = Math.max(2, Math.floor(Math.sqrt(canvas.width * canvas.height / (density * 2))));
    
    for (let y = 0; y < canvas.height; y += skip) {
        for (let x = 0; x < canvas.width; x += skip) {
            const index = (y * canvas.width + x) * 4;
            const alpha = data[index + 3];
            
            if (alpha > 200) { // Higher threshold for cleaner text
                // Convert canvas coordinates to 3D space with proper scaling
                const vx = ((x - canvas.width / 2) / Math.max(canvas.width, canvas.height)) * scale * 3;
                const vy = ((canvas.height / 2 - y) / Math.max(canvas.width, canvas.height)) * scale * 3;
                const vz = (Math.random() - 0.5) * scale * 0.02; // Less Z variation
                
                vertices.push(new THREE.Vector3(vx, vy, vz));
            }
        }
    }
    
    return vertices;
}

function generateKingVertices(scale, density) {
    const vertices = [];
    const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
      <g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/>
        <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1.5-3-3-3s-3 3-3 3c-1.5 3 3 10.5 3 10.5" stroke-linecap="butt" stroke-linejoin="miter"/>
        <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s-4.5 4-10.5 4-10.5-4-10.5-4v7"/>
        <path d="M11.5 30c5.5-3 15.5-3 21 0l-10.5 3.5z"/>
        <path d="M11.5 30v-2.5s4.5-1.5 10.5-1.5 10.5 1.5 10.5 1.5V30"/>
        <path d="M11.5 27.5v-2s4.5-1.5 10.5-1.5 10.5 1.5 10.5 1.5V27.5"/>
        <path d="M22.5 25l-11-12.5h22z"/>
      </g>
    </svg>
    `;

    const loader = new SVGLoader();
    const data = loader.parse(svgData);

    const paths = data.paths;
    const divisions = density ? Math.floor(density / 10) : 10;

    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const shapes = SVGLoader.createShapes(path);

        for (let j = 0; j < shapes.length; j++) {
            const shape = shapes[j];
            const points = shape.getPoints(divisions);
            for(let k = 0; k < points.length; k++) {
                const point = points[k];
                // Center and scale the points
                const vx = (point.x - 22.5) * scale * 0.1;
                const vy = -(point.y - 22.5) * scale * 0.1;
                const vz = (Math.random() - 0.5) * scale * 0.2;
                vertices.push(new THREE.Vector3(vx, vy, vz));
            }
        }
    }

    return vertices;
}

export { generateHeartVertices, generateTextVertices, generateKingVertices };