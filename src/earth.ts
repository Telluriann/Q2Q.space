import * as THREE from 'three'

/** Earth: invisible in normal view; grows into a clear sphere only as camera gets close */
const EARTH_RADIUS = 0.018
const EARTH_DISTANCE = 0.82

/** Equirectangular Earth-like texture: blue oceans, simplified continents (no external images) */
function createEarthTexture(): THREE.CanvasTexture {
  const w = 1024
  const h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  // Oceans
  ctx.fillStyle = '#1a4d7a'
  ctx.fillRect(0, 0, w, h)
  // Deeper blue variation
  const oceanGrad = ctx.createLinearGradient(0, 0, w, h)
  oceanGrad.addColorStop(0, '#1e5a8a')
  oceanGrad.addColorStop(0.5, '#164670')
  oceanGrad.addColorStop(1, '#1a4d7a')
  ctx.fillStyle = oceanGrad
  ctx.fillRect(0, 0, w, h)

  // Simplified continent shapes (ellipses/blobs) - rough world map
  ctx.fillStyle = '#2d5a3d'
  // Americas
  ctx.beginPath()
  ctx.ellipse(w * 0.22, h * 0.55, w * 0.12, h * 0.35, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(w * 0.28, h * 0.28, w * 0.1, h * 0.2, 0, 0, Math.PI * 2)
  ctx.fill()
  // Europe / Africa
  ctx.beginPath()
  ctx.ellipse(w * 0.52, h * 0.5, w * 0.08, h * 0.38, 0, 0, Math.PI * 2)
  ctx.fill()
  // Asia
  ctx.beginPath()
  ctx.ellipse(w * 0.72, h * 0.45, w * 0.2, h * 0.32, 0, 0, Math.PI * 2)
  ctx.fill()
  // Australia
  ctx.beginPath()
  ctx.ellipse(w * 0.82, h * 0.72, w * 0.06, h * 0.12, 0, 0, Math.PI * 2)
  ctx.fill()
  // Greenland
  ctx.fillStyle = '#3d6b4f'
  ctx.beginPath()
  ctx.ellipse(w * 0.18, h * 0.22, w * 0.04, h * 0.15, 0, 0, Math.PI * 2)
  ctx.fill()

  // Lighter land (deserts / plains)
  ctx.fillStyle = 'rgba(180, 160, 120, 0.5)'
  ctx.beginPath()
  ctx.ellipse(w * 0.72, h * 0.5, w * 0.08, h * 0.15, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(w * 0.25, h * 0.5, w * 0.05, h * 0.2, 0, 0, Math.PI * 2)
  ctx.fill()

  // Cloud band (subtle)
  const cloudGrad = ctx.createLinearGradient(0, h * 0.4, 0, h * 0.6)
  cloudGrad.addColorStop(0, 'rgba(255, 255, 255, 0)')
  cloudGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.08)')
  cloudGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.08)')
  cloudGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = cloudGrad
  ctx.fillRect(0, 0, w, h)

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.needsUpdate = true
  return tex
}

export function createEarth(): THREE.Group {
  const group = new THREE.Group()
  group.name = 'Earth'
  group.scale.setScalar(0)

  const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 48, 32)
  const material = new THREE.MeshStandardMaterial({
    map: createEarthTexture(),
    metalness: 0.05,
    roughness: 0.85,
  })
  const sphere = new THREE.Mesh(geometry, material)
  sphere.name = 'EarthSphere'
  group.add(sphere)

  const glowGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.85, 24, 16)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x88bbff,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
  })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  glow.name = 'EarthGlow'
  group.add(glow)

  group.position.set(EARTH_DISTANCE, 0, 0.012)
  return group
}

export function getEarthDistance(): number {
  return EARTH_DISTANCE
}

/** Scale factor 0 (invisible) when far, 1 (full) when close. Smooth transition. */
export function earthScaleFromDistance(distance: number): number {
  const far = 2.4
  const near = 0.45
  if (distance >= far) return 0
  if (distance <= near) return 1
  const t = (far - distance) / (far - near)
  return t * t * (3 - 2 * t)
}
