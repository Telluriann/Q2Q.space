import * as THREE from 'three'

function createSunTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Base gradient
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, '#ffffff')
  grad.addColorStop(0.2, '#fff1cc')
  grad.addColorStop(0.6, '#ffaa00')
  grad.addColorStop(0.9, '#dd3300')
  grad.addColorStop(1, '#880000')

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  // Add procedural "solar flares" and noise using overlapping circles
  ctx.globalCompositeOperation = 'overlay'
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = Math.random() * 40 + 10

    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(255, 255, 255, ${Math.random() * 0.4})`)
    g.addColorStop(1, 'rgba(255, 100, 0, 0)')
    ctx.fillStyle = g
    ctx.fill()
  }

  // Sunspots
  ctx.globalCompositeOperation = 'multiply'
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2
    const dist = Math.random() * (size / 2.5)
    const x = size / 2 + Math.cos(angle) * dist
    const y = size / 2 + Math.sin(angle) * dist
    const r = Math.random() * 15 + 2
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(100, 20, 0, ${Math.random() * 0.8 + 0.2})`
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  return tex
}

function createOrbit(radius: number): THREE.Line {
  const curve = new THREE.EllipseCurve(
    0, 0,            // ax, aY
    radius, radius,  // xRadius, yRadius
    0, 2 * Math.PI,  // aStartAngle, aEndAngle
    false,           // aClockwise
    0                // aRotation
  )

  const points = curve.getPoints(64)
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })
  const orbit = new THREE.Line(geometry, material)
  orbit.rotation.x = Math.PI / 2
  return orbit
}

export function createSolarSystem(): THREE.Group {
  const group = new THREE.Group()
  group.name = 'SolarSystem'

  const SUN_RADIUS = 0.04

  // Sun
  const sunGeometry = new THREE.SphereGeometry(SUN_RADIUS, 64, 64)
  const sunMaterial = new THREE.MeshStandardMaterial({
    map: createSunTexture(),
    emissiveMap: createSunTexture(),
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 1.5,
    roughness: 0.4,
    metalness: 0.1
  })
  const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial)
  sunMesh.name = 'Sun'

  // Sun Corona (Multiple layers for rich glow)
  const createCoronaLayer = (scaleMult: number, opacity: number, color: number) => {
    const glowGeometry = new THREE.SphereGeometry(SUN_RADIUS * scaleMult, 32, 32)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide
    })
    return new THREE.Mesh(glowGeometry, glowMaterial)
  }

  sunMesh.add(createCoronaLayer(1.3, 0.4, 0xffaa00))
  sunMesh.add(createCoronaLayer(1.8, 0.15, 0xff5500))
  sunMesh.add(createCoronaLayer(3.0, 0.05, 0xff2200))

  group.add(sunMesh)

  // Planets and Orbits
  const planetsData = [
    { name: 'Mercury', distance: 0.08, size: 0.0015, color: 0xaaaaaa },
    { name: 'Venus', distance: 0.14, size: 0.0035, color: 0xffddaa },
    // Earth is added externally at distance 0.2
    { name: 'Mars', distance: 0.28, size: 0.002, color: 0xff4422 },
  ]

  // We also want an orbit line for Earth (distance 0.2)
  group.add(createOrbit(0.2))

  planetsData.forEach(p => {
    // Orbit line
    group.add(createOrbit(p.distance))

    // Planet mesh
    const geo = new THREE.SphereGeometry(p.size, 16, 16)
    const mat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.8 })
    const mesh = new THREE.Mesh(geo, mat)

    // Randomize initial position on the orbit
    const angle = Math.random() * Math.PI * 2
    mesh.position.set(Math.cos(angle) * p.distance, 0, Math.sin(angle) * p.distance)
    group.add(mesh)
  })

  // Solar system position in the Milky Way
  group.position.set(0.82, 0, 0.012)

  // Add a very subtle point light from the sun
  const sunLight = new THREE.PointLight(0xffeedd, 2, 2.0)
  group.add(sunLight)

  return group
}

export function getSolarSystemDistance(): number {
  return 0.82
}
