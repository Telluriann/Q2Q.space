import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let objectsData = [];
let threeObjects = [];

// True Cosmic Scale Logic (Powers of Ten style)
let logTargetScale = Math.log10(1.7); // Start perfectly scaled for the Human (1.7 meters)
let logCurrentScale = logTargetScale;
const scrollSpeed = 0.002;
const smoothFactor = 0.08;

// UI Elements
const infoPanel = document.getElementById('info-panel');
const objName = document.getElementById('object-name');
const objType = document.getElementById('object-type');
const objSize = document.getElementById('object-size');
const objDist = document.getElementById('object-distance');
const objDesc = document.getElementById('object-desc');
const progressBar = document.getElementById('progress-bar');
const scrollHint = document.querySelector('.scroll-hint');
const currentScaleReadout = document.createElement('div'); 

async function init() { 
    try {
        const response = await fetch('/api/objects/');
        objectsData = await response.json();
    } catch (error) {
        console.error("Failed to fetch cosmic data:", error);
        return;
    }

    setupDynamicUI();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020204);
    createStarfield();

    // Camera is completely static at 10 units away. 
    // We modify the "scale" of the universe itself instead.
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.001, 1000);
    camera.position.set(0, 0, 10); 

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false; // Disable native zoom; we use custom exponential math
    controls.enablePan = false;
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Create objects layered directly inside each other
    objectsData.forEach((data, index) => {
        let geometry;
        let material;

        // Visual distinction based on type
        if (data.object_type === 'Galaxy' || data.object_type === 'Universe' || data.object_type === 'Galaxy Group') {
            geometry = new THREE.SphereGeometry(1, 48, 48);
            material = new THREE.MeshBasicMaterial({ 
                color: data.base_color, 
                wireframe: true,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.renderOrder = -data.size_in_meters; // Largest back
            scene.add(mesh);

            // Glowing core
            const coreGeom = new THREE.SphereGeometry(0.2, 16, 16);
            const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
            const core = new THREE.Mesh(coreGeom, coreMat);
            mesh.add(core);

            addGalaxyParticles(mesh, data.base_color);

            threeObjects.push({ mesh, coreMat, data, size: data.size_in_meters });

        } else if (data.object_type === 'Star') {
            geometry = new THREE.SphereGeometry(1, 64, 64);
            material = new THREE.MeshBasicMaterial({ 
                color: data.base_color,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.renderOrder = -data.size_in_meters;

            const glowMat = new THREE.MeshBasicMaterial({
                color: data.base_color,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const glow = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 32), glowMat);
            mesh.add(glow);
            
            scene.add(mesh);
            threeObjects.push({ mesh, glowMat, data, size: data.size_in_meters });

        } else {
            geometry = new THREE.SphereGeometry(1, 64, 64);
            material = new THREE.MeshStandardMaterial({ 
                color: data.base_color,
                roughness: 0.6,
                metalness: 0.2,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.renderOrder = -data.size_in_meters;
            scene.add(mesh);
            threeObjects.push({ mesh, data, size: data.size_in_meters });
        }
    });

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('wheel', onScroll, { passive: false });

    animate();
}

function addGalaxyParticles(parentMesh, colorStr) {
    const geometry = new THREE.BufferGeometry();
    const count = 3000;
    const posArray = new Float32Array(count * 3);
    for(let i=0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const r = Math.random() * 1.5;
        posArray[i*3] = Math.cos(theta) * r;
        posArray[i*3+1] = (Math.random() - 0.5) * 0.2;
        posArray[i*3+2] = Math.sin(theta) * r;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const material = new THREE.PointsMaterial({
        size: 0.05,
        color: new THREE.Color(colorStr),
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    // Add directly to the galaxy mesh so they scale with it
    const particles = new THREE.Points(geometry, material);
    parentMesh.add(particles);
    // Bind material for opacity fading
    parentMesh.userData.particlesMat = material;
}

function setupDynamicUI() {
    currentScaleReadout.className = 'glass-panel';
    currentScaleReadout.style.position = 'absolute';
    currentScaleReadout.style.top = '10px';
    currentScaleReadout.style.right = '20px';
    currentScaleReadout.style.fontSize = '1.3rem';
    currentScaleReadout.style.padding = '12px 24px';
    currentScaleReadout.style.fontWeight = '600';
    currentScaleReadout.style.color = '#fff';
    currentScaleReadout.innerHTML = `Field of view: 10<sup>0</sup> m`;
    document.getElementById('ui-container').appendChild(currentScaleReadout);
}

function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 5000;
    const posArray = new Float32Array(starsCount * 3);
    for(let i=0; i < starsCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 1000;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starsMaterial = new THREE.PointsMaterial({
        size: 1.2,
        color: 0xcccccc,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });
    scene.add(new THREE.Points(starsGeometry, starsMaterial));
}

function onScroll(event) {
    event.preventDefault();
    logTargetScale += event.deltaY * scrollSpeed;
    
    // Limits
    const minLog = Math.log10(1); 
    const maxLog = Math.log10(8.8e26) + 1; // Universe size
    logTargetScale = Math.max(minLog, Math.min(maxLog, logTargetScale));

    if (scrollHint && scrollHint.style.opacity !== '0') {
        scrollHint.style.transition = 'opacity 0.5s';
        scrollHint.style.opacity = '0';
    }
}

function showInfoPanel(data) {
    if (objName.innerText !== data.name) {
        objName.innerText = data.name;
        objType.innerText = data.object_type;
        objSize.innerText = data.size_description;
        objDist.innerText = data.distance_from_earth;
        objDesc.innerText = data.description;
        
        infoPanel.classList.remove('hidden');
    }
}

function hideInfoPanel() {
    infoPanel.classList.add('hidden');
    objName.innerText = ''; 
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Interpolate the exponential scale
    logCurrentScale += (logTargetScale - logCurrentScale) * smoothFactor;
    const currentScale = Math.pow(10, logCurrentScale);
    
    // Update live scale UI (like "10^6 m")
    const exponent = Math.floor(logCurrentScale);
    currentScaleReadout.innerHTML = `Field of view: ~ 10<sup>${exponent.toFixed(0)}</sup> m`;

    let closestObj = null;
    let maxVisualAppeal = 0; 

    threeObjects.forEach(obj => {
        // True Math: Object size in meters divided by current scale of the universe
        const visualRadius = obj.size / currentScale;
        
        // Scale the mesh mathematically
        obj.mesh.scale.set(visualRadius, visualRadius, Math.max(0.001, visualRadius));

        // Calculate opacity based on visual radius (Bell Curve equation)
        let opacity = 0;
        if (visualRadius > 0.05 && visualRadius < 50) {
            opacity = 1 - Math.min(1, Math.abs(Math.log10(visualRadius) - Math.log10(3.5)) / 1.4);
        }
        
        opacity = Math.max(0, opacity); // Clamp to 0
        obj.mesh.visible = opacity > 0;
        obj.mesh.material.opacity = opacity;
        
        // Sub-materials like glows, cores, particles
        if (obj.coreMat) obj.coreMat.opacity = opacity * 0.9;
        if (obj.glowMat) obj.glowMat.opacity = Math.min(1, opacity * 1.5);
        if (obj.mesh.userData.particlesMat) obj.mesh.userData.particlesMat.opacity = opacity * 0.6;

        // Subtle rotation
        if (obj.data.object_type !== 'Universe') {
            obj.mesh.rotation.y += 0.001;
        }

        if (opacity > maxVisualAppeal) {
            maxVisualAppeal = opacity;
            closestObj = obj;
        }
    });

    // Determine which panel to show based on which object is fully in-frame
    if (closestObj && maxVisualAppeal > 0.8) {
        showInfoPanel(closestObj.data);
    } else if (maxVisualAppeal <= 0.8) {
        hideInfoPanel();
    }

    // Update Progress bar (0 to 100%)
    if (progressBar) {
        const total = Math.log10(8.8e26);
        const progress = Math.max(0, Math.min(100, (logCurrentScale / total) * 100));
        progressBar.style.width = progress + '%';
    }

    controls.update();
    renderer.render(scene, camera);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
