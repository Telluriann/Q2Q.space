import * as THREE from 'three'

/** Soft star-shaped sprite so points look like stars, not squares. Exported for starfield. */
export function createStarTexture(): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2
  const cy = size / 2
  const outer = size / 2 - 1
  const inner = outer * 0.35
  const points = 4
  ctx.clearRect(0, 0, size, size)
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2
    const x = cx + r * Math.cos(a)
    const y = cy + r * Math.sin(a)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, outer)
  g.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
  g.addColorStop(0.5, 'rgba(255, 255, 240, 0.85)')
  g.addColorStop(1, 'rgba(255, 255, 220, 0)')
  ctx.fillStyle = g
  ctx.fill()
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

let _starTextureCache: THREE.CanvasTexture | null = null
export function getStarTexture(): THREE.CanvasTexture {
  if (!_starTextureCache) _starTextureCache = createStarTexture()
  return _starTextureCache
}

export type GalaxyParams = {
  particleCount: number
  armCount: number
  bulgeFraction: number
  spiralScale: number
  spiralPitch: number
  armTurns: number
  armWidth: number
  armTaper: number
  diskThickness: number
  bulgeRadius: number
  bulgeFlatness: number
  bulgeColor: THREE.Color
  armColorOld: THREE.Color
  armColorYoung: THREE.Color
  armColorHII: THREE.Color
  outerFade: THREE.Color
}

export const defaultGalaxyParams: GalaxyParams = {
  particleCount: 180000,
  armCount: 2,
  bulgeFraction: 0.22,
  spiralScale: 0.12,
  spiralPitch: 0.28,
  armTurns: 1.8,
  armWidth: 0.14,
  armTaper: 0.6,
  diskThickness: 0.06,
  bulgeRadius: 0.2,
  bulgeFlatness: 0.6,
  bulgeColor: new THREE.Color(0xffaa77),
  armColorOld: new THREE.Color(0xffeedd),
  armColorYoung: new THREE.Color(0xccddff),
  armColorHII: new THREE.Color(0xaaccff),
  outerFade: new THREE.Color(0x334466),
}

export type GalaxyOptions = {
  params?: Partial<GalaxyParams>
  scale?: number
  position?: [number, number, number]
}

function gaussianRandom(): number {
  let u = 0,
    v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function createGalaxy(options: GalaxyOptions = {}): THREE.Group {
  const scale = options.scale ?? 1
  const position = options.position ?? [0, 0, 0]
  const p: GalaxyParams = { ...defaultGalaxyParams, ...options.params }

  const bulgeCount = Math.floor(p.particleCount * p.bulgeFraction)
  const diskCount = p.particleCount - bulgeCount

  const positions = new Float32Array(p.particleCount * 3)
  const colors = new Float32Array(p.particleCount * 3)

  let idx = 0

  for (let i = 0; i < bulgeCount; i++) {
    const u = Math.random()
    const v = Math.random()
    const w = Math.random()
    const r = Math.pow(u, 0.6)
    const phi = Math.acos(2 * v - 1)
    const theta = 2 * Math.PI * w
    const x = r * Math.sin(phi) * Math.cos(theta) * p.bulgeRadius * scale
    const y = r * Math.sin(phi) * Math.sin(theta) * p.bulgeRadius * scale
    const z = r * Math.cos(phi) * p.bulgeRadius * p.bulgeFlatness * scale

    positions[idx * 3] = x
    positions[idx * 3 + 1] = y
    positions[idx * 3 + 2] = z

    const age = Math.random()
    const c = p.bulgeColor.clone().lerp(new THREE.Color(0xdd8844), age * 0.4)
    const bright = 0.7 + 0.3 * Math.random()
    c.multiplyScalar(bright)
    colors[idx * 3] = c.r
    colors[idx * 3 + 1] = c.g
    colors[idx * 3 + 2] = c.b
    idx++
  }

  const armAngleStep = (2 * Math.PI) / p.armCount
  const rMin = p.spiralScale * scale
  const rMax = p.spiralScale * scale * Math.exp(p.spiralPitch * p.armTurns * 2 * Math.PI)

  for (let i = 0; i < diskCount; i++) {
    const arm = Math.floor(Math.random() * p.armCount)
    const baseAngle = arm * armAngleStep
    const t = Math.pow(Math.random(), 0.7)
    const r = rMin + (rMax - rMin) * t
    const angle = baseAngle + (1 / p.spiralPitch) * Math.log(r / (p.spiralScale * scale))
    const armWidthAtR = p.armWidth * scale * (1 - p.armTaper * t)
    const perp = gaussianRandom() * armWidthAtR
    const ax = Math.cos(angle)
    const ay = Math.sin(angle)
    const nx = -ay
    const ny = ax
    const x = r * ax + nx * perp
    const y = r * ay + ny * perp
    const z = gaussianRandom() * p.diskThickness * scale * (1 - 0.5 * t)

    positions[idx * 3] = x
    positions[idx * 3 + 1] = y
    positions[idx * 3 + 2] = z

    const dist = (r - rMin) / (rMax - rMin)
    const pop = Math.random()
    let c: THREE.Color
    if (pop < 0.08) {
      c = p.armColorHII.clone()
    } else if (pop < 0.4) {
      c = p.armColorYoung.clone().lerp(p.armColorOld, Math.random())
    } else {
      c = p.armColorOld.clone().lerp(p.bulgeColor, Math.random() * 0.3)
    }
    c.lerp(p.outerFade, dist * 0.85)
    const bright = 0.6 + 0.4 * Math.random()
    c.multiplyScalar(bright)
    colors[idx * 3] = c.r
    colors[idx * 3 + 1] = c.g
    colors[idx * 3 + 2] = c.b
    idx++
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.018 * scale,
    map: getStarTexture(),
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    alphaTest: 0.02,
  })

  const galaxy = new THREE.Points(geometry, material)
  galaxy.rotation.x = -Math.PI * 0.12
  const group = new THREE.Group()
  group.add(galaxy)
  group.position.set(position[0], position[1], position[2])
  return group
}
