import * as THREE from 'three'
import { getStarTexture } from './galaxy'

const STAR_COUNT = 80000 // slightly more stars for realism
const INNER_RADIUS = 8
const OUTER_RADIUS = 50

export function createStarfield() {
  const positions = new Float32Array(STAR_COUNT * 3)
  const colors = new Float32Array(STAR_COUNT * 3)
  const sizes = new Float32Array(STAR_COUNT)
  const phases = new Float32Array(STAR_COUNT)
  const speeds = new Float32Array(STAR_COUNT)

  const warm = new THREE.Color(0xfff0d8)
  const cool = new THREE.Color(0xdde8ff)
  const dim = new THREE.Color(0x3a4055)
  const veryDim = new THREE.Color(0x2a3040)
  const redFaint = new THREE.Color(0x402020)

  for (let i = 0; i < STAR_COUNT; i++) {
    // Distribute stars realistically:
    // Some are scattered completely randomly (halo),
    // but the majority are clustered along a "galactic plane".
    const inPlane = Math.random() < 0.75
    let u = Math.random() * 2 - 1 // cos(theta)
    
    // If in the plane, squash the distribution heavily towards the equator (u ~ 0)
    if (inPlane) {
      u = (Math.pow(Math.random(), 3) * 2 - 1) * 0.15 
    }

    const phi = Math.random() * Math.PI * 2
    const sqrtOneMinusU2 = Math.sqrt(1 - u * u)
    
    // Apply a slight tilt so the background Milky Way isn't perfectly horizontal
    const tilt = 0.3
    const xRaw = sqrtOneMinusU2 * Math.cos(phi)
    const yRaw = sqrtOneMinusU2 * Math.sin(phi)
    const zRaw = u
    
    const dirX = xRaw * Math.cos(tilt) - zRaw * Math.sin(tilt)
    const dirY = yRaw
    const dirZ = xRaw * Math.sin(tilt) + zRaw * Math.cos(tilt)

    // Radius
    const t = Math.pow(Math.random(), 0.5)
    const radius = INNER_RADIUS + (OUTER_RADIUS - INNER_RADIUS) * t

    positions[i * 3] = dirX * radius
    positions[i * 3 + 1] = dirY * radius
    positions[i * 3 + 2] = dirZ * radius

    // Colors
    const isBig = Math.random() < 0.05
    const isMedium = Math.random() < 0.2
    
    const colorRoll = Math.random()
    let base: THREE.Color
    
    if (colorRoll < 0.1) base = redFaint.clone()
    else if (colorRoll < 0.5) base = veryDim.clone()
    else if (colorRoll < 0.8) base = dim.clone()
    else if (colorRoll < 0.92) base = cool.clone()
    else base = warm.clone()
    
    const brightness = isBig ? 1.0 : (isMedium ? 0.6 + 0.4 * Math.random() : 0.2 + 0.3 * Math.random())
    base.multiplyScalar(brightness)

    colors[i * 3] = base.r
    colors[i * 3 + 1] = base.g
    colors[i * 3 + 2] = base.b

    // Sizes
    let size = 0.5
    if (isBig) size = 2.0 + Math.random() * 2.5
    else if (isMedium) size = 1.0 + Math.random() * 1.0
    else size = 0.2 + Math.random() * 0.6
    sizes[i] = size

    // Twinkling properties
    phases[i] = Math.random() * Math.PI * 2
    speeds[i] = 1.0 + Math.random() * 3.0 // Multiplier for time
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))

  const uniforms = {
    uTime: { value: 0 },
    uTexture: { value: getStarTexture() },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uSizeMultiplier: { value: 25.0 } // Global scaling factor
  }

  const material = new THREE.ShaderMaterial({
    uniforms,          
    vertexShader: `
      attribute float aSize;
      attribute float aPhase;
      attribute float aSpeed;
      attribute vec3 color;
      
      varying vec3 vColor;
      varying float vAlpha;
      
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uSizeMultiplier;
      
      void main() {
        vColor = color;
        
        // Twinkling effect: sine wave based on time, phase, and individual speed
        float twinkle = sin(uTime * aSpeed + aPhase) * 0.5 + 0.5;
        // Keep alpha mostly high, but dip sometimes
        vAlpha = 0.3 + 0.7 * twinkle;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        
        // Size attenuation (distant stars are smaller)
        float scaledSize = aSize * uSizeMultiplier * uPixelRatio;
        gl_PointSize = scaledSize * (1.0 / -mvPosition.z);
        
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      
      varying vec3 vColor;
      varying float vAlpha;
      
      void main() {
        vec4 texColor = texture2D(uTexture, gl_PointCoord);
        
        // Alpha test
        if(texColor.a < 0.05) discard;
        
        gl_FragColor = vec4(vColor * texColor.rgb, texColor.a * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geometry, material)

  return {
    points,
    update: (time: number) => {
      material.uniforms.uTime.value = time
    }
  }
}
