import * as THREE from 'three'

export function createGalaxyCluster(): THREE.Group {
  const group = new THREE.Group()
  group.name = 'GalaxyCluster'

  // Represents Laniakea or Virgo Supercluster
  const particleCount = 50000
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  const radius = 600

  const colorPalette = [
    new THREE.Color(0xffddaa), // Yellowish galaxy
    new THREE.Color(0xaaaaff), // Blueish galaxy
    new THREE.Color(0xffffff), // White galaxy
  ]

  for (let i = 0; i < particleCount; i++) {
    const u = Math.random()
    const v = Math.random()
    const theta = u * 2.0 * Math.PI
    const phi = Math.acos(2.0 * v - 1.0)
    // Concentrate towards center
    const r = radius * Math.pow(Math.random(), 2.0) 

    const x = r * Math.sin(phi) * Math.cos(theta)
    const y = r * Math.sin(phi) * Math.sin(theta) * 0.4 // Flattened cluster
    const z = r * Math.cos(phi)

    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z

    const baseColor = colorPalette[Math.floor(Math.random() * colorPalette.length)]

    colors[i * 3] = baseColor.r
    colors[i * 3 + 1] = baseColor.g
    colors[i * 3 + 2] = baseColor.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const canvas = document.createElement('canvas')
  canvas.width = 16
  canvas.height = 16
  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(8, 8, 0, 8, 8, 8)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 16, 16)
  const texture = new THREE.CanvasTexture(canvas)

  const material = new THREE.PointsMaterial({
    size: 5,
    vertexColors: true,
    map: texture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.6
  })

  const points = new THREE.Points(geometry, material)
  group.add(points)

  return group
}
