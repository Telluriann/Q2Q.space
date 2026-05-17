import * as THREE from 'three'

export function createObservableUniverse(): THREE.Group {
  const group = new THREE.Group()
  group.name = 'ObservableUniverse'

  const particleCount = 200000
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  const radius = 8000

  const colorPalette = [
    new THREE.Color(0x330066), // Deep purple
    new THREE.Color(0x660099), // Bright purple
    new THREE.Color(0x111133), // Dark blue
    new THREE.Color(0xff4422), // Orange/red glow
  ]

  for (let i = 0; i < particleCount; i++) {
    // Generate point in sphere
    const u = Math.random()
    const v = Math.random()
    const theta = u * 2.0 * Math.PI
    const phi = Math.acos(2.0 * v - 1.0)
    // Bias towards the edges slightly to make it feel enveloping
    const r = radius * Math.pow(Math.random(), 0.5) 

    const x = r * Math.sin(phi) * Math.cos(theta)
    const y = r * Math.sin(phi) * Math.sin(theta)
    const z = r * Math.cos(phi)

    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z

    const baseColor = colorPalette[Math.floor(Math.random() * colorPalette.length)]
    
    // Filament-like clustering (pseudo-random density)
    const noise = Math.sin(x*0.01) * Math.cos(y*0.01) * Math.sin(z*0.01)
    let intensity = noise > 0.5 ? 1.5 : 0.5

    colors[i * 3] = baseColor.r * intensity
    colors[i * 3 + 1] = baseColor.g * intensity
    colors[i * 3 + 2] = baseColor.b * intensity
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  // Create circular texture for points
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 32, 32)
  const texture = new THREE.CanvasTexture(canvas)

  const material = new THREE.PointsMaterial({
    size: 25,
    vertexColors: true,
    map: texture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.3
  })

  const points = new THREE.Points(geometry, material)
  group.add(points)

  return group
}
