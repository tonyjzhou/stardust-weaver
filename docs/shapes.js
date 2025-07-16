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

function generateNikeSwooshVertices(scale, density) {
    const vertices = [];
    const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50">
      <path d="M20 35 C 30 25, 60 15, 85 20 C 90 21, 85 25, 80 24 C 60 20, 35 28, 20 35 Z" fill="#000"/>
    </svg>
    `;

    const loader = new SVGLoader();
    const data = loader.parse(svgData);

    const paths = data.paths;
    const divisions = density ? Math.floor(density / 15) : 15;

    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const shapes = SVGLoader.createShapes(path);

        for (let j = 0; j < shapes.length; j++) {
            const shape = shapes[j];
            const points = shape.getPoints(divisions);
            for(let k = 0; k < points.length; k++) {
                const point = points[k];
                const vx = (point.x - 50) * scale * 0.08;
                const vy = -(point.y - 25) * scale * 0.08;
                const vz = (Math.random() - 0.5) * scale * 0.15;
                vertices.push(new THREE.Vector3(vx, vy, vz));
            }
        }
    }

    return vertices;
}

function generateAppleVertices(scale, density) {
    const vertices = [];
    const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 10 C 30 10, 15 25, 15 45 C 15 70, 35 90, 50 90 C 65 90, 85 70, 85 45 C 85 25, 70 10, 50 10 Z M 65 20 C 75 15, 85 25, 75 35 C 70 30, 65 25, 65 20 Z" fill="#000"/>
      <ellipse cx="65" cy="25" rx="8" ry="4" fill="#fff"/>
    </svg>
    `;

    const loader = new SVGLoader();
    const data = loader.parse(svgData);

    const paths = data.paths;
    const divisions = density ? Math.floor(density / 12) : 12;

    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const shapes = SVGLoader.createShapes(path);

        for (let j = 0; j < shapes.length; j++) {
            const shape = shapes[j];
            const points = shape.getPoints(divisions);
            for(let k = 0; k < points.length; k++) {
                const point = points[k];
                const vx = (point.x - 50) * scale * 0.08;
                const vy = -(point.y - 50) * scale * 0.08;
                const vz = (Math.random() - 0.5) * scale * 0.15;
                vertices.push(new THREE.Vector3(vx, vy, vz));
            }
        }
    }

    return vertices;
}

function generateMercedesVertices(scale, density) {
    const vertices = [];
    
    const numPoints = Math.min(density || 2000, 2000);
    const centerX = 0;
    const centerY = 0;
    const radius = 3 * scale * 0.1;
    
    // Generate circle outline
    const circlePoints = Math.floor(numPoints * 0.6);
    for (let i = 0; i < circlePoints; i++) {
        const angle = (i / circlePoints) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const z = (Math.random() - 0.5) * scale * 0.15;
        vertices.push(new THREE.Vector3(x, y, z));
    }
    
    // Generate three spokes
    const spokePoints = Math.floor(numPoints * 0.4 / 3);
    
    // Top spoke (12 o'clock)
    for (let i = 0; i < spokePoints; i++) {
        const t = i / spokePoints;
        const x = centerX;
        const y = centerY + (t * radius);
        const z = (Math.random() - 0.5) * scale * 0.15;
        vertices.push(new THREE.Vector3(x, y, z));
    }
    
    // Bottom left spoke (8 o'clock)
    for (let i = 0; i < spokePoints; i++) {
        const t = i / spokePoints;
        const x = centerX - (t * radius * 0.866); // cos(30°)
        const y = centerY - (t * radius * 0.5);   // sin(30°)
        const z = (Math.random() - 0.5) * scale * 0.15;
        vertices.push(new THREE.Vector3(x, y, z));
    }
    
    // Bottom right spoke (4 o'clock)
    for (let i = 0; i < spokePoints; i++) {
        const t = i / spokePoints;
        const x = centerX + (t * radius * 0.866); // cos(30°)
        const y = centerY - (t * radius * 0.5);   // sin(30°)
        const z = (Math.random() - 0.5) * scale * 0.15;
        vertices.push(new THREE.Vector3(x, y, z));
    }

    return vertices;
}

function generateMickeyVertices(scale, density) {
    const vertices = [];
    
    const numPoints = Math.min(density || 2000, 2000);
    const pointsPerCircle = Math.floor(numPoints / 3);

    // Main head circle
    for (let i = 0; i < pointsPerCircle; i++) {
        const angle = (i / pointsPerCircle) * Math.PI * 2;
        const radius = 3 * scale * 0.1;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = (Math.random() - 0.5) * scale * 0.15;
        vertices.push(new THREE.Vector3(x, y, z));
    }

    // Left ear
    for (let i = 0; i < pointsPerCircle; i++) {
        const angle = (i / pointsPerCircle) * Math.PI * 2;
        const radius = 2 * scale * 0.1;
        const x = Math.cos(angle) * radius - 2.5 * scale * 0.1;
        const y = Math.sin(angle) * radius + 2.5 * scale * 0.1;
        const z = (Math.random() - 0.5) * scale * 0.15;
        vertices.push(new THREE.Vector3(x, y, z));
    }

    // Right ear
    for (let i = 0; i < pointsPerCircle; i++) {
        const angle = (i / pointsPerCircle) * Math.PI * 2;
        const radius = 2 * scale * 0.1;
        const x = Math.cos(angle) * radius + 2.5 * scale * 0.1;
        const y = Math.sin(angle) * radius + 2.5 * scale * 0.1;
        const z = (Math.random() - 0.5) * scale * 0.15;
        vertices.push(new THREE.Vector3(x, y, z));
    }

    return vertices;
}

function generateMcDonaldsVertices(scale, density) {
    const vertices = [];
    
    const numPoints = Math.min(density || 2000, 2000);
    const pointsPerArch = Math.floor(numPoints / 2);
    
    // Left arch
    for (let i = 0; i < pointsPerArch; i++) {
        const t = i / pointsPerArch;
        const angle = t * Math.PI;
        const archHeight = 2.5 * scale * 0.1;
        const archWidth = 1.5 * scale * 0.1;
        
        const x = -archWidth + Math.cos(angle) * archWidth;
        const y = -archHeight + Math.sin(angle) * archHeight;
        const z = (Math.random() - 0.5) * scale * 0.15;
        vertices.push(new THREE.Vector3(x, y, z));
    }
    
    // Right arch
    for (let i = 0; i < pointsPerArch; i++) {
        const t = i / pointsPerArch;
        const angle = t * Math.PI;
        const archHeight = 2.5 * scale * 0.1;
        const archWidth = 1.5 * scale * 0.1;
        
        const x = archWidth + Math.cos(angle) * archWidth;
        const y = -archHeight + Math.sin(angle) * archHeight;
        const z = (Math.random() - 0.5) * scale * 0.15;
        vertices.push(new THREE.Vector3(x, y, z));
    }

    return vertices;
}

export { 
    generateHeartVertices, 
    generateKingVertices, 
    generateNikeSwooshVertices, 
    generateAppleVertices, 
    generateMercedesVertices, 
    generateMickeyVertices, 
    generateMcDonaldsVertices 
};