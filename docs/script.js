import * as THREE from "https://esm.sh/three@0.163.0";
import { OrbitControls } from "https://esm.sh/three@0.163.0/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "https://esm.sh/three@0.163.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://esm.sh/three@0.163.0/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "https://esm.sh/three@0.163.0/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "https://esm.sh/three@0.163.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "https://esm.sh/three@0.163.0/examples/jsm/postprocessing/OutputPass.js";
import { generateTextVertices, generateHeartVertices } from "./shapes.js";

let scene, camera, renderer, controls, particleSystem, composer, bloomPass;
let trailTexture, trailScene, trailCamera, trailMaterial, trailPass, trailComposer;
let clock = new THREE.Clock();
let frameCounter = 0;
let lastTime = 0;
let fps = 60;
let numParticles = 50000;
let targetPositions = [];
let velocities = [];
let animationProgress = 1;
let currentShape = 'sphere';
let noiseTime = 0;
let loadingProgress = 0;
let loadingBar = document.getElementById('loaderBar');
let loading = document.getElementById('loading');
let interactionPoint = new THREE.Vector3();
let isInteracting = false;
let interactionTimer = 0;
let interactionStrength = 0;

const availableShapes = ['sphere', 'torus', 'galaxy', 'blackhole', 'vortex', 'wave', 'heart', 'text'];
let currentShapeIndex = 0;

// Audio system variables
let audioSystem = null;
let isAudioEnabled = false;

// Text settings
const textParams = {
    textToRender: 'Hello'
};

const colorThemes = {
    cosmic: {
        particleColor1: new THREE.Color(0x00ccff),
        particleColor2: new THREE.Color(0xff00cc),
        backgroundColor: new THREE.Color(0x000000)
    },
    azure: {
        particleColor1: new THREE.Color(0x0066ff),
        particleColor2: new THREE.Color(0x00ffcc),
        backgroundColor: new THREE.Color(0x000000)
    },
    sunset: {
        particleColor1: new THREE.Color(0xff6600),
        particleColor2: new THREE.Color(0xff00aa),
        backgroundColor: new THREE.Color(0x000000)
    },
    emerald: {
        particleColor1: new THREE.Color(0x00ff66),
        particleColor2: new THREE.Color(0x66ffff),
        backgroundColor: new THREE.Color(0x000000)
    }
};

const params = {
    particleSize: 0.035,
    particleColor1: new THREE.Color(0x00ccff),
    particleColor2: new THREE.Color(0xff00cc),
    backgroundColor: new THREE.Color(0x000000),
    rotationSpeed: 0.1,
    bloomStrength: 1.0,
    bloomRadius: 0.5,
    bloomThreshold: 0.2,
    motionTrail: 0.5,
    noiseInfluence: 0.2,
    noiseSpeed: 0.1,
    ambientLightIntensity: 0.3,
    directionalLightIntensity: 0.8,
    interactionRadius: 0.8,
    interactionStrength: 2.0,
    galaxyArmCount: 3,
    galaxyArmWidth: 0.3,
    waveFrequency: 2.0,
    vortexIntensity: 2.5
};

initLoading();

function initLoading() {
    createSparkles();
    const loadingInterval = setInterval(() => {
        loadingProgress += Math.random() * 20;
        if (loadingProgress >= 100) {
            loadingProgress = 100;
            loadingBar.style.width = '100%';
            
            setTimeout(() => {
                loading.style.opacity = '0';
                setTimeout(() => {
                    loading.style.display = 'none';
                    init();
                }, 300);
            }, 500);
            
            clearInterval(loadingInterval);
        } else {
            loadingBar.style.width = loadingProgress + '%';
            if (Math.random() > 0.7) {
                addSparkle(loadingProgress);
            }
        }
    }, 100);
}

function createSparkles() {
    const sparklesContainer = document.getElementById('sparklesContainer');
    for (let i = 0; i < 20; i++) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        sparkle.style.display = 'none';
        sparklesContainer.appendChild(sparkle);
    }
}

function addSparkle(progressPercent) {
    const sparklesContainer = document.getElementById('sparklesContainer');
    const unusedSparkle = Array.from(sparklesContainer.children).find(s => s.style.display === 'none');
    
    if (!unusedSparkle) return;
    
    const x = progressPercent * 0.01 * sparklesContainer.offsetWidth;
    const y = Math.random() * sparklesContainer.offsetHeight;
    const size = 1 + Math.random() * 3;
    const duration = 600 + Math.random() * 1000;
    const hue = Math.random() > 0.5 ? '190' : '320';
    const color = `hsla(${hue}, 100%, 70%, 1)`;
    
    unusedSparkle.style.display = 'block';
    unusedSparkle.style.width = `${size}px`;
    unusedSparkle.style.height = `${size}px`;
    unusedSparkle.style.left = `${x}px`;
    unusedSparkle.style.top = `${y}px`;
    unusedSparkle.style.background = color;
    unusedSparkle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
    unusedSparkle.style.animation = `sparkle ${duration}ms forwards`;
    
    setTimeout(() => {
        unusedSparkle.style.display = 'none';
        unusedSparkle.style.animation = 'none';
    }, duration);
}

function init() {
    try {
        initScenes();
        initLights();
        createParticleSystem();
        initControls();
        initEventListeners();
        initComposers();
        
        if (composer) {
            initTrailEffect();
            initNoiseShader();
        }
        
        initAudioSystem();
        applyColorTheme('sunset');
        morphToShape('sphere');
        
        const controlPanels = document.getElementById('controlPanels');
        const toggleButton = document.getElementById('toggleControls');
        controlPanels.style.display = 'none';
        toggleButton.classList.add('closed');
        
        animate();
    } catch (error) {
        console.error("Error initializing:", error);
        if (loading) {
            loading.innerHTML = '<h1>Error initializing 3D scene</h1><p>Try using a different browser or device</p>';
            loading.style.opacity = '1';
            loading.style.display = 'flex';
        }
    }
}

function initScenes() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(params.backgroundColor);
    scene.fog = new THREE.FogExp2(params.backgroundColor, 0.03);
    
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.getElementById('container').appendChild(renderer.domElement);
    
    trailScene = new THREE.Scene();
    trailCamera = camera.clone();
    trailTexture = new THREE.WebGLRenderTarget(
        window.innerWidth,
        window.innerHeight,
        {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            colorSpace: THREE.SRGBColorSpace
        }
    );
}

function initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, params.ambientLightIntensity);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, params.directionalLightIntensity);
    directionalLight.position.set(1, 3, 2);
    scene.add(directionalLight);
    const pointLight1 = new THREE.PointLight(params.particleColor1, 1, 20);
    pointLight1.position.set(5, 3, 2);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(params.particleColor2, 1, 20);
    pointLight2.position.set(-5, -3, -2);
    scene.add(pointLight2);
}

function initComposers() {
    try {
        composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);
        bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            params.bloomStrength,
            params.bloomRadius,
            params.bloomThreshold
        );
        composer.addPass(bloomPass);
        const outputPass = new OutputPass();
        composer.addPass(outputPass);
        
        if (trailTexture) {
            trailComposer = new EffectComposer(renderer, trailTexture);
            const trailRenderPass = new RenderPass(trailScene, trailCamera);
            trailComposer.addPass(trailRenderPass);
        }
    } catch (error) {
        console.error("Error initializing composers:", error);
    }
}

function initTrailEffect() {
    trailMaterial = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: { value: null },
            opacity: { value: params.motionTrail }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float opacity;
            varying vec2 vUv;
            
            void main() {
                vec4 texel = texture2D(tDiffuse, vUv);
                gl_FragColor = opacity * texel;
            }
        `
    });
    
    trailPass = new ShaderPass(trailMaterial);
    trailPass.renderToScreen = false;
    composer.addPass(trailPass);
}

function initNoiseShader() {
    const noiseShader = {
        uniforms: {
            tDiffuse: { value: null },
            time: { value: 0.0 },
            noiseInfluence: { value: params.noiseInfluence }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float time;
            uniform float noiseInfluence;
            varying vec2 vUv;
            
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
            
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
                m = m*m;
                m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                vec3 g;
                g.x = a0.x * x0.x + h.x * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }
            
            void main() {
                vec2 uv = vUv;
                float noise = snoise(uv * 8.0 + time * 0.2) * noiseInfluence;
                uv.x += noise * 0.02;
                uv.y += noise * 0.02;
                vec4 texel = texture2D(tDiffuse, uv);
                float colorNoise = snoise(uv * 3.0 - time * 0.1) * 0.1;
                texel.r += colorNoise * texel.r;
                texel.b -= colorNoise * 0.5 * texel.b;
                gl_FragColor = texel;
            }
        `
    };
    
    const noisePass = new ShaderPass(noiseShader);
    noisePass.uniforms.noiseInfluence.value = params.noiseInfluence;
    composer.addPass(noisePass);
    composer.noisePass = noisePass;
}

function initControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.7;
    controls.zoomSpeed = 0.8;
    controls.panSpeed = 0.8;
    controls.minDistance = 2;
    controls.maxDistance = 20;
    
    controls.addEventListener('start', () => {
        document.body.style.cursor = 'grabbing';
    });
    controls.addEventListener('end', () => {
        document.body.style.cursor = 'grab';
    });
}

function createParticleSystem() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(numParticles * 3);
    const colors = new Float32Array(numParticles * 3);
    const sizes = new Float32Array(numParticles);
    
    targetPositions = new Float32Array(numParticles * 3);
    velocities = new Float32Array(numParticles * 3);
    
    for (let i = 0; i < numParticles; i++) {
        const phi = Math.acos(-1 + (2 * i) / numParticles);
        const theta = Math.sqrt(numParticles * Math.PI) * phi;
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.sin(phi) * Math.sin(theta);
        const z = Math.cos(phi);
        
        positions[i * 3] = x * 1.5;
        positions[i * 3 + 1] = y * 1.5;
        positions[i * 3 + 2] = z * 1.5;
        
        targetPositions[i * 3] = positions[i * 3];
        targetPositions[i * 3 + 1] = positions[i * 3 + 1];
        targetPositions[i * 3 + 2] = positions[i * 3 + 2];
        
        velocities[i * 3] = 0;
        velocities[i * 3 + 1] = 0;
        velocities[i * 3 + 2] = 0;
        
        const mixFactor = Math.random();
        const color = new THREE.Color().lerpColors(
            params.particleColor1,
            params.particleColor2,
            mixFactor
        );
        color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.3);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        sizes[i] = params.particleSize * (0.6 + Math.random() * 0.8);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        },
        vertexShader: `
            attribute float size;
            varying vec3 vColor;
            uniform float time;
            uniform float pixelRatio;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            uniform float time;
            
            void main() {
                vec2 uv = gl_PointCoord.xy - 0.5;
                float dist = length(uv);
                if (dist > 0.5) discard;
                float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
                float glow = exp(-dist * 3.0) * 0.5 + 0.5;
                vec3 finalColor = vColor * glow;
                gl_FragColor = vec4(finalColor, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    });
    
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    const trailParticles = particleSystem.clone();
    trailScene.add(trailParticles);
}

function updateParticleSystem() {
    if (!particleSystem) return;
    
    const colors = particleSystem.geometry.attributes.color.array;
    const sizes = particleSystem.geometry.attributes.size.array;
    
    for (let i = 0; i < numParticles; i++) {
        const mixFactor = Math.random();
        const color = new THREE.Color().lerpColors(
            params.particleColor1,
            params.particleColor2,
            mixFactor
        );
        color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.3);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        sizes[i] = params.particleSize * (0.6 + Math.random() * 0.8);
    }
    
    scene.background = params.backgroundColor;
    scene.fog.color = params.backgroundColor;
    particleSystem.geometry.attributes.color.needsUpdate = true;
    particleSystem.geometry.attributes.size.needsUpdate = true;
}

function initEventListeners() {
    const changeShapeButton = document.getElementById('changeShape');
    if (changeShapeButton) {
        changeShapeButton.addEventListener('click', () => {
            currentShapeIndex = (currentShapeIndex + 1) % availableShapes.length;
            const nextShape = availableShapes[currentShapeIndex];
            morphToShape(nextShape);
            document.getElementById('currentShapeValue').textContent = 
                nextShape.charAt(0).toUpperCase() + nextShape.slice(1);
            changeShapeButton.classList.add('active');
            setTimeout(() => {
                changeShapeButton.classList.remove('active');
            }, 300);
        });
    }
    
    const themeButtons = document.querySelectorAll('.color-theme');
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            themeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            applyColorTheme(button.dataset.theme);
        });
    });
    
    document.getElementById('particleSize').addEventListener('input', (e) => {
        params.particleSize = parseFloat(e.target.value);
        document.getElementById('sizeValue').textContent = params.particleSize.toFixed(3);
        updateParticleSystem();
    });
    document.getElementById('particleCount').addEventListener('input', (e) => {
        const newCount = parseInt(e.target.value);
        document.getElementById('countValue').textContent = newCount;
        document.getElementById('particleCountValue').textContent = newCount.toLocaleString();
        if (Math.abs(newCount - numParticles) > 10000) {
            numParticles = newCount;
            recreateParticleSystem();
        }
    });
    document.getElementById('rotationSpeed').addEventListener('input', (e) => {
        params.rotationSpeed = parseFloat(e.target.value);
        document.getElementById('speedValue').textContent = params.rotationSpeed.toFixed(2);
    });
    document.getElementById('bloomStrength').addEventListener('input', (e) => {
        params.bloomStrength = parseFloat(e.target.value);
        document.getElementById('bloomValue').textContent = params.bloomStrength.toFixed(1);
        bloomPass.strength = params.bloomStrength;
    });
    document.getElementById('bloomRadius').addEventListener('input', (e) => {
        params.bloomRadius = parseFloat(e.target.value);
        document.getElementById('bloomRadiusValue').textContent = params.bloomRadius.toFixed(2);
        bloomPass.radius = params.bloomRadius;
    });
    document.getElementById('motionTrail').addEventListener('input', (e) => {
        params.motionTrail = parseFloat(e.target.value);
        document.getElementById('trailValue').textContent = params.motionTrail.toFixed(2);
        if (trailMaterial) {
            trailMaterial.uniforms.opacity.value = params.motionTrail;
        }
    });
    document.getElementById('noiseInfluence').addEventListener('input', (e) => {
        params.noiseInfluence = parseFloat(e.target.value);
        document.getElementById('noiseValue').textContent = params.noiseInfluence.toFixed(2);
        if (composer.noisePass) {
            composer.noisePass.uniforms.noiseInfluence.value = params.noiseInfluence;
        }
    });
    document.getElementById('noiseSpeed').addEventListener('input', (e) => {
        params.noiseSpeed = parseFloat(e.target.value);
        document.getElementById('noiseSpeedValue').textContent = params.noiseSpeed.toFixed(2);
    });
    
    document.getElementById('enableAudio').addEventListener('click', async () => {
        const button = document.getElementById('enableAudio');
        const status = document.getElementById('audioStatus');
        
        if (!isAudioEnabled) {
            button.textContent = 'Enabling...';
            button.disabled = true;
            
            await enableAudioInput();
            
            if (isAudioEnabled) {
                button.textContent = 'Disable Audio';
                status.textContent = 'Audio: Enabled';
                status.style.color = '#0cf';
            } else {
                button.textContent = 'Enable Microphone';
                status.textContent = 'Audio: Failed to enable';
                status.style.color = '#ff6666';
            }
            button.disabled = false;
        } else {
            isAudioEnabled = false;
            if (audioSystem && audioSystem.source) {
                audioSystem.source.disconnect();
            }
            button.textContent = 'Enable Microphone';
                         status.textContent = 'Audio: Disabled';
             status.style.color = '#ccc';
         }
     });
     
     // Text input event listeners
     const customTextInput = document.getElementById('customText');
     const updateTextButton = document.getElementById('updateText');
     const textPreview = document.getElementById('textPreview');
     
     function updateDisplayedText() {
    const newText = customTextInput.value.trim().toUpperCase();
    if (newText.length === 0) {
        customTextInput.style.borderColor = '#ff6666';
        return;
    }
    
    if (newText.length > 10) {
        customTextInput.style.borderColor = '#ff6666';
        customTextInput.value = newText.substring(0, 10);
        return;
    }
    
    customTextInput.style.borderColor = 'rgba(0, 204, 255, 0.3)';
    textParams.textToRender = newText;
    textPreview.textContent = `Current: ${newText}`;
    
    // If currently showing text shape, regenerate it
    if (currentShape === 'text') {
        morphToShape('text');
    }
}
     
     updateTextButton.addEventListener('click', updateDisplayedText);
     
     customTextInput.addEventListener('keypress', (e) => {
         if (e.key === 'Enter') {
             updateDisplayedText();
         }
     });
     
     customTextInput.addEventListener('input', (e) => {
         // Reset border color on input
         e.target.style.borderColor = 'rgba(0, 204, 255, 0.3)';
     });
    
    document.getElementById('toggleControls').addEventListener('click', () => {
        const controlPanels = document.getElementById('controlPanels');
        const toggleButton = document.getElementById('toggleControls');
        if (controlPanels.style.display === 'none') {
            controlPanels.style.display = 'block';
            toggleButton.classList.remove('closed');
        } else {
            controlPanels.style.display = 'none';
            toggleButton.classList.add('closed');
        }
    });
    
    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('dblclick', () => {
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);
        controls.reset();
    });
    
    renderer.domElement.addEventListener('mousedown', (event) => {
        if (event.button === 0 && event.ctrlKey) {
            const planeNormal = new THREE.Vector3().subVectors(
                camera.position,
                controls.target
            ).normalize();
            const plane = new THREE.Plane(planeNormal, -controls.target.dot(planeNormal));
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                - (event.clientY / window.innerHeight) * 2 + 1
            );
            raycaster.setFromCamera(mouse, camera);
            raycaster.ray.intersectPlane(plane, interactionPoint);
            isInteracting = true;
            interactionStrength = 1.0;
            interactionTimer = 0;
            controls.enabled = false;
            document.body.style.cursor = 'crosshair';
        }
    });
    renderer.domElement.addEventListener('mouseup', () => {
        if (isInteracting) {
            isInteracting = false;
            controls.enabled = true;
            document.body.style.cursor = 'grab';
        }
    });
}

function recreateParticleSystem() {
    if (particleSystem) {
        scene.remove(particleSystem);
        trailScene.remove(trailScene.children[0]);
        particleSystem.geometry.dispose();
        particleSystem.material.dispose();
    }
    createParticleSystem();
    morphToShape(currentShape);
}

function morphToShape(shapeType) {
    currentShape = shapeType;
    let targetVertices = [];
    switch (shapeType) {
        case 'sphere':
            targetVertices = generateSphereVertices(1.8, 64, 32);
            break;
        case 'torus':
            targetVertices = generateTorusVertices(1.5, 0.5, 32, 200);
            break;
        case 'galaxy':
            targetVertices = generateGalaxyVertices(2.0, params.galaxyArmCount, params.galaxyArmWidth);
            break;
        case 'blackhole':
            targetVertices = generateBlackHoleVertices(2.0, 0.6);
            break;
        case 'vortex':
            targetVertices = generateVortexVertices(2.0, params.vortexIntensity);
            break;
        case 'wave':
            targetVertices = generateWaveFunctionVertices(2.0, params.waveFrequency);
            break;
        case 'heart':
            targetVertices = generateHeartVertices(2.0, Math.min(numParticles, 1000));
            break;
        case 'text':
            targetVertices = generateTextVertices(textParams.textToRender, 2.0, Math.min(numParticles, 500));
            break;
        default:
            console.error("Unknown shape:", shapeType);
            return;
    }
    if (targetVertices.length === 0) {
        console.error("No vertices generated for shape:", shapeType);
        return;
    }
    const positions = particleSystem.geometry.attributes.position.array;
    for (let i = 0; i < numParticles; i++) {
        const vertexIndex = i % targetVertices.length;
        const targetVertex = targetVertices[vertexIndex];
        targetPositions[i * 3] = targetVertex.x;
        targetPositions[i * 3 + 1] = targetVertex.y;
        targetPositions[i * 3 + 2] = targetVertex.z;
        velocities[i * 3] = 0;
        velocities[i * 3 + 1] = 0;
        velocities[i * 3 + 2] = 0;
    }
    animationProgress = 0;
}

function applyColorTheme(theme) {
    if (!colorThemes[theme]) {
        console.error("Unknown theme:", theme);
        return;
    }
    params.particleColor1 = colorThemes[theme].particleColor1.clone();
    params.particleColor2 = colorThemes[theme].particleColor2.clone();
    params.backgroundColor = colorThemes[theme].backgroundColor.clone();
    updateParticleSystem();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (composer) {
        composer.setSize(window.innerWidth, window.innerHeight);
    }
    if (trailTexture) {
        trailTexture.setSize(window.innerWidth, window.innerHeight);
    }
    if (trailComposer) {
        trailComposer.setSize(window.innerWidth, window.innerHeight);
    }
    if (particleSystem && particleSystem.material.uniforms && particleSystem.material.uniforms.pixelRatio) {
        particleSystem.material.uniforms.pixelRatio.value = Math.min(window.devicePixelRatio, 2);
    }
}

function animate() {
    requestAnimationFrame(animate);
    try {
        const delta = Math.min(clock.getDelta(), 0.1);
        const elapsedTime = clock.getElapsedTime();
        frameCounter++;
        if (elapsedTime - lastTime >= 1.0) {
            fps = Math.round(frameCounter / (elapsedTime - lastTime));
            document.getElementById('fpsValue').textContent = fps;
            frameCounter = 0;
            lastTime = elapsedTime;
        }
        noiseTime += delta * params.noiseSpeed;
        if (composer && composer.noisePass) {
            composer.noisePass.uniforms.time.value = noiseTime;
        }
        if (particleSystem && particleSystem.material.uniforms && particleSystem.material.uniforms.time) {
            particleSystem.material.uniforms.time.value = elapsedTime;
        }
        
        // Update audio data and apply audio-reactive effects
        if (audioSystem && audioSystem.isSetup && isAudioEnabled) {
            audioSystem.analyser.getByteFrequencyData(audioSystem.dataArray);
        }
        
        if (particleSystem) {
            particleSystem.rotation.y += delta * params.rotationSpeed;
            particleSystem.rotation.x += delta * params.rotationSpeed * 0.3;
            const positions = particleSystem.geometry.attributes.position.array;
            if (animationProgress < 1) {
                animationProgress += delta * 0.5;
                const spring = 5.0;
                const damping = 0.8;
                for (let i = 0; i < numParticles; i++) {
                    for (let j = 0; j < 3; j++) {
                        const idx = i * 3 + j;
                        const force = (targetPositions[idx] - positions[idx]) * spring;
                        velocities[idx] = velocities[idx] * damping + force * delta;
                        positions[idx] += velocities[idx] * delta * 4;
                    }
                }
                if (frameCounter % 60 === 0) {
                }
            } else {
                for (let i = 0; i < numParticles; i++) {
                    if (i % 3 !== 0) continue;
                    const idx = i * 3;
                    const noise1 = Math.sin(elapsedTime * 0.5 + i * 0.1) * 0.02;
                    const noise2 = Math.cos(elapsedTime * 0.7 + i * 0.2) * 0.02;
                    const noise3 = Math.sin(elapsedTime * 0.3 + i * 0.05) * 0.02;
                    positions[idx] += noise1 * params.noiseInfluence;
                    positions[idx + 1] += noise2 * params.noiseInfluence;
                    positions[idx + 2] += noise3 * params.noiseInfluence;
                    positions[idx] += (targetPositions[idx] - positions[idx]) * 0.1;
                    positions[idx + 1] += (targetPositions[idx + 1] - positions[idx + 1]) * 0.1;
                    positions[idx + 2] += (targetPositions[idx + 2] - positions[idx + 2]) * 0.1;
                }
                
                // Apply audio-reactive updates
                if (audioSystem && audioSystem.isSetup && isAudioEnabled) {
                    updateParticlesWithAudio(positions, audioSystem.dataArray);
                }
            }
            if (isInteracting) {
                interactionTimer += delta;
                interactionStrength = 1.0 - Math.min(interactionTimer * 0.5, 0.9);
                for (let i = 0; i < numParticles; i++) {
                    const idx = i * 3;
                    const particlePos = new THREE.Vector3(
                        positions[idx],
                        positions[idx + 1],
                        positions[idx + 2]
                    );
                    const toInteraction = new THREE.Vector3().subVectors(
                        particlePos,
                        interactionPoint
                    );
                    const distance = toInteraction.length();
                    if (distance < params.interactionRadius) {
                        toInteraction.normalize();
                        const forceMagnitude = (1 - distance / params.interactionRadius) * params.interactionStrength * interactionStrength;
                        positions[idx] += toInteraction.x * forceMagnitude * delta;
                        positions[idx + 1] += toInteraction.y * forceMagnitude * delta;
                        positions[idx + 2] += toInteraction.z * forceMagnitude * delta;
                    }
                }
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;
            if (trailScene.children[0]) {
                trailScene.children[0].rotation.copy(particleSystem.rotation);
                trailScene.children[0].geometry.attributes.position.array = positions;
                trailScene.children[0].geometry.attributes.position.needsUpdate = true;
            }
        }
        if (controls) {
            controls.update();
        }
        if (trailTexture) {
            renderer.setRenderTarget(trailTexture);
            renderer.render(scene, camera);
        }
        renderer.setRenderTarget(null);
        if (composer) {
            composer.render();
        } else {
            renderer.render(scene, camera);
        }
    } catch (error) {
        console.error("Error in animation loop:", error);
    }
}

function generateSphereVertices(radius, widthSegments, heightSegments) {
    const vertices = [];
    for (let i = 0; i <= heightSegments; i++) {
        const theta = i * Math.PI / heightSegments;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        for (let j = 0; j <= widthSegments; j++) {
            const phi = j * 2 * Math.PI / widthSegments;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);
            const x = cosPhi * sinTheta * radius;
            const y = cosTheta * radius;
            const z = sinPhi * sinTheta * radius;
            vertices.push(new THREE.Vector3(x, y, z));
        }
    }
    return vertices;
}

function generateTorusVertices(radius, tube, radialSegments, tubularSegments) {
    const vertices = [];
    for (let i = 0; i <= radialSegments; i++) {
        const theta = i * Math.PI * 2 / radialSegments;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        for (let j = 0; j <= tubularSegments; j++) {
            const phi = j * Math.PI * 2 / tubularSegments;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);
            const x = (radius + tube * cosPhi) * cosTheta;
            const y = (radius + tube * cosPhi) * sinTheta;
            const z = tube * sinPhi;
            vertices.push(new THREE.Vector3(x, y, z));
        }
    }
    return vertices;
}

function generateGalaxyVertices(radius, arms, armWidth) {
    const vertices = [];
    const particlesPerArm = Math.floor(numParticles / arms);
    for (let a = 0; a < arms; a++) {
        const armOffset = (a * Math.PI * 2) / arms;
        for (let i = 0; i < particlesPerArm; i++) {
            const distance = Math.random() * radius;
            const spinAngle = distance * 2.0;
            const angle = armOffset + spinAngle + (Math.random() - 0.5) * armWidth;
            const x = Math.cos(angle) * distance;
            const y = (Math.random() - 0.5) * distance * 0.2;
            const z = Math.sin(angle) * distance;
            vertices.push(new THREE.Vector3(x, y, z));
        }
    }
    return vertices;
}

function generateBlackHoleVertices(radius, innerRadius) {
    const vertices = [];
    for (let i = 0; i < numParticles * 0.9; i++) {
        const distance = innerRadius + Math.random() * (radius - innerRadius);
        const angle = Math.random() * Math.PI * 2;
        const normalizedDist = (distance - innerRadius) / (radius - innerRadius);
        if (Math.random() > normalizedDist * 0.7) {
            const x = Math.cos(angle) * distance;
            const y = (Math.random() - 0.5) * 0.2;
            const z = Math.sin(angle) * distance;
            vertices.push(new THREE.Vector3(x, y, z));
        }
    }
    for (let i = 0; i < numParticles * 0.1; i++) {
        const height = (Math.random() * 2 - 1) * radius * 2;
        const distance = Math.random() * innerRadius * 0.5;
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * distance;
        const y = height;
        const z = Math.sin(angle) * distance;
        vertices.push(new THREE.Vector3(x, y, z));
    }
    return vertices;
}

function generateVortexVertices(radius, intensity) {
    const vertices = [];
    for (let i = 0; i < numParticles; i++) {
        const t = i / numParticles;
        const height = (Math.random() * 2 - 1) * radius;
        const angle = t * Math.PI * 16 + height * 0.2;
        const distCenter = Math.pow(Math.abs(height / radius), 0.5) * radius * 0.8;
        const distVariation = (Math.random() - 0.5) * radius * 0.2;
        const twistFactor = Math.pow(Math.abs(height / radius), 2) * intensity;
        const dist = distCenter + distVariation;
        const x = Math.cos(angle) * dist;
        const y = height;
        const z = Math.sin(angle) * dist;
        vertices.push(new THREE.Vector3(x, y, z));
    }
    return vertices;
}

function generateWaveFunctionVertices(radius, frequency) {
    const vertices = [];
    const gridSize = Math.ceil(Math.sqrt(numParticles));
    const spacing = radius * 2 / gridSize;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (vertices.length >= numParticles) break;
            const x = (i - gridSize/2) * spacing;
            const z = (j - gridSize/2) * spacing;
            const dist = Math.sqrt(x*x + z*z);
            const y = Math.sin(dist * frequency) * Math.exp(-dist/radius) * radius * 0.5;
            vertices.push(new THREE.Vector3(x, y, z));
        }
    }
    return vertices;
}



function initAudioSystem() {
    try {
        audioSystem = {
            context: new (window.AudioContext || window.webkitAudioContext)(),
            analyser: null,
            dataArray: null,
            source: null,
            isSetup: false
        };
        
        audioSystem.analyser = audioSystem.context.createAnalyser();
        audioSystem.analyser.fftSize = 256;
        audioSystem.dataArray = new Uint8Array(audioSystem.analyser.frequencyBinCount);
        
        console.log("Audio system initialized");
    } catch (error) {
        console.warn("Audio system not available:", error);
        audioSystem = null;
    }
}

async function enableAudioInput() {
    if (!audioSystem || audioSystem.isSetup) return;
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioSystem.source = audioSystem.context.createMediaStreamSource(stream);
        audioSystem.source.connect(audioSystem.analyser);
        audioSystem.isSetup = true;
        isAudioEnabled = true;
        console.log("Audio input enabled");
    } catch (error) {
        console.warn("Could not access microphone:", error);
    }
}

function updateParticlesWithAudio(positions, audioData) {
    if (!audioData || audioData.length === 0) return;
    
    // Extract bass frequencies (first few bins represent lower frequencies)
    const bassLevel = audioData[0] / 255.0; // Normalize to 0-1
    const midLevel = audioData[Math.floor(audioData.length * 0.3)] / 255.0;
    const trebleLevel = audioData[Math.floor(audioData.length * 0.8)] / 255.0;
    
    // Apply audio-reactive displacement
    for (let i = 0; i < positions.length; i += 3) {
        const particleIndex = i / 3;
        const time = Date.now() * 0.01;
        
        // Bass affects Y movement
        positions[i + 1] += Math.sin(time + particleIndex * 0.1) * bassLevel * 0.05;
        
        // Mid frequencies affect X movement
        positions[i] += Math.cos(time + particleIndex * 0.2) * midLevel * 0.03;
        
        // Treble affects Z movement
        positions[i + 2] += Math.sin(time + particleIndex * 0.15) * trebleLevel * 0.02;
    }
}