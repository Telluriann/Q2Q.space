import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import { createGalaxy, defaultGalaxyParams, type GalaxyParams } from './galaxy'
import { createStarfield } from './starfield'
import { createDeepSpaceBackgroundMesh } from './deepSpaceBackground'
import { createEarth, earthScaleFromDistance } from './earth'
import { createObservableUniverse } from './universe'
import { createGalaxyCluster } from './cluster'
import { createSolarSystem } from './solarsystem'
import { createHuman } from './human'

export function createScene(canvas?: HTMLCanvasElement) {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.00001, 20000)
  camera.position.set(0, 0, 8000)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, logarithmicDepthBuffer: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
  const app = document.getElementById('app')!
  if (!canvas) app.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 0.0001
  controls.maxDistance = 15000

  // Dynamic Background Skybox
  const skybox = createDeepSpaceBackgroundMesh()
  scene.add(skybox)

  const starfield = createStarfield()
  scene.add(starfield.points)

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
  dirLight.position.set(2, 1, 3)
  scene.add(dirLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
  scene.add(ambientLight)

  // 1. Observable Universe
  const universe = createObservableUniverse()
  scene.add(universe)
  const universeMat = (universe.children[0] as THREE.Points).material as THREE.PointsMaterial

  // 2. Galaxy Cluster
  const cluster = createGalaxyCluster()
  scene.add(cluster)
  const clusterMat = (cluster.children[0] as THREE.Points).material as THREE.PointsMaterial

  // 3. Local Group & Milky Way
  const galaxyParams: GalaxyParams = {
    ...defaultGalaxyParams,
    particleCount: 180000,
    armCount: 2,
  }

  const galaxyDefinitions = [
    { name: 'Milky Way', params: { ...galaxyParams }, scale: 1, pos: [0, 0, 0], isOurs: true },
    { name: 'Andromeda', params: { ...galaxyParams, particleCount: 220000, armColorYoung: new THREE.Color(0xbbaaff) }, scale: 1.2, pos: [12, 4, -15], isOurs: false },
    { name: 'Triangulum', params: { ...galaxyParams, particleCount: 60000, armCount: 3, spiralPitch: 0.35, armColorYoung: new THREE.Color(0x99ddff) }, scale: 0.5, pos: [-8, -6, -20], isOurs: false },
    { name: 'Large Magellanic Cloud', params: { ...galaxyParams, particleCount: 25000, armCount: 1, bulgeFraction: 0.1 }, scale: 0.3, pos: [2, -1.5, 1.5], isOurs: false },
    { name: 'Small Magellanic Cloud', params: { ...galaxyParams, particleCount: 15000, armCount: 1, bulgeFraction: 0.05 }, scale: 0.2, pos: [1.2, -2.5, 0.8], isOurs: false },
  ]

  const galaxies: { mesh: THREE.Group, def: typeof galaxyDefinitions[0] }[] = []
  let milkyWayMesh: THREE.Group | null = null

  galaxyDefinitions.forEach(def => {
    const mesh = createGalaxy({ params: def.params, scale: def.scale, position: def.pos as [number, number, number] })
    scene.add(mesh)
    galaxies.push({ mesh, def })
    if (def.isOurs) milkyWayMesh = mesh
  })

  // 4. Solar System & Sun
  const solarSystem = createSolarSystem()
  if (milkyWayMesh) {
    ; (milkyWayMesh.children[0] as THREE.Object3D).add(solarSystem)
  }

  // 5. Earth
  const earth = createEarth()
  solarSystem.add(earth)

  // 6. Human
  const human = createHuman()
  earth.add(human)

  // --- FLOATING LABELS SETUP ---
  const labelsContainer = document.createElement('div')
  labelsContainer.className = 'labels-container'
  app.appendChild(labelsContainer)

  type LabelDef = { text: string, getPos: () => THREE.Vector3, element: HTMLDivElement, minVisibleDist: number, maxVisibleDist: number }
  const floatingLabels: LabelDef[] = []

  const addLabel = (text: string, getPos: () => THREE.Vector3, minD: number, maxD: number) => {
    const el = document.createElement('div')
    el.className = 'floating-label'
    el.innerText = text
    labelsContainer.appendChild(el)
    floatingLabels.push({ text, getPos, element: el, minVisibleDist: minD, maxVisibleDist: maxD })
  }

  const tempV = new THREE.Vector3()
  // Add labels for context
  addLabel('Observable Universe Center', () => tempV.set(0, 0, 0), 2000, 15000)
  addLabel('Laniakea Supercluster', () => tempV.set(0, 0, 0), 150, 1500)
  addLabel('Local Group', () => tempV.set(0, 0, 0), 20, 100)
  addLabel('Milky Way', () => tempV.set(0, 0, 0), 2, 15)
  addLabel('Andromeda', () => tempV.set(12, 4, -15), 5, 40)
  addLabel('Solar System', () => { solarSystem.getWorldPosition(tempV); return tempV }, 0.3, 5)
  addLabel('Sun', () => { solarSystem.getWorldPosition(tempV); return tempV }, 0.05, 0.25)
  addLabel('Earth', () => { earth.getWorldPosition(tempV); return tempV }, 0.01, 0.04)
  addLabel('Human', () => { human.getWorldPosition(tempV); return tempV }, 0.0001, 0.005)

  // --- POST-PROCESSING ---
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.8,
    0.4,
    0.3
  )
  composer.addPass(bloomPass)

  // --- UI NAVIGATION ---
  const navContainer = document.createElement('div')
  navContainer.className = 'scale-nav'
  navContainer.innerHTML = '<div class="scale-line"></div>'

  const scales = [
    { id: 'universe', label: 'Observable Universe', camDist: 8000, getTarget: () => tempV.set(0, 0, 0) },
    { id: 'cluster', label: 'Local Supercluster', camDist: 800, getTarget: () => tempV.set(0, 0, 0) },
    { id: 'localgroup', label: 'Local Group', camDist: 30, getTarget: () => tempV.set(0, 0, 0) },
    { id: 'milkyway', label: 'Milky Way', camDist: 10, getTarget: () => tempV.set(0, 0, 0) },
    { id: 'solarsystem', label: 'Solar System', camDist: 0.6, getTarget: () => { solarSystem.getWorldPosition(tempV); return tempV } },
    { id: 'sun', label: 'Sun', camDist: 0.15, getTarget: () => { solarSystem.getWorldPosition(tempV); return tempV } },
    { id: 'earth', label: 'Earth', camDist: 0.02, getTarget: () => { earth.getWorldPosition(tempV); return tempV } },
    {
      id: 'human',
      label: 'Human',
      camDist: 0.002,
      getTarget: () => {
        human.getWorldPosition(tempV);
        // Shift target up to human's chest level
        const earthPos = new THREE.Vector3();
        earth.getWorldPosition(earthPos);
        const upDir = new THREE.Vector3().subVectors(tempV, earthPos).normalize();
        tempV.add(upDir.multiplyScalar(0.0012));
        return tempV;
      }
    }
  ]

  let currentScaleIndex = 0

  scales.forEach((scale, index) => {
    const el = document.createElement('div')
    el.className = `scale-step ${index === 0 ? 'active' : ''}`
    el.innerText = scale.label
    el.onclick = () => jumpToScale(index)
    navContainer.appendChild(el)
  })
  app.appendChild(navContainer)

  const cinematicControls = document.createElement('div')
  cinematicControls.className = 'cinematic-controls'
  cinematicControls.innerHTML = '<button class="play-btn">Play Journey</button>'
  app.appendChild(cinematicControls)

  cinematicControls.querySelector('.play-btn')!.addEventListener('click', () => {
    state.isCinematicPlaying = !state.isCinematicPlaying
    const btn = cinematicControls.querySelector('.play-btn')!
    btn.innerHTML = state.isCinematicPlaying ? 'Stop Journey' : 'Play Journey'
    if (state.isCinematicPlaying) {
      if (currentScaleIndex === scales.length - 1) currentScaleIndex = 0 // loop back
      jumpToScale(currentScaleIndex + 1)
    }
  })

  // --- STATE & ANIMATION ---
  const state = {
    rotationSpeed: 0.002,
    bloomStrength: 0.8,
    bloomRadius: 0.4,
    bloomThreshold: 0.3,
    isTransitioning: false,
    isCinematicPlaying: false
  }

  let transitionStart = 0
  const TRANSITION_DURATION = 7000 // ms
  const startCamPos = new THREE.Vector3()
  const endCamPos = new THREE.Vector3()
  const startTarget = new THREE.Vector3()
  const endTarget = new THREE.Vector3()

  function jumpToScale(index: number) {
    if (state.isTransitioning || index < 0 || index >= scales.length) return

    document.querySelectorAll('.scale-step').forEach((el, i) => {
      el.classList.toggle('active', i === index)
    })

    const targetData = scales[index]
    const targetPos = targetData.getTarget()

    startCamPos.copy(camera.position)
    startTarget.copy(controls.target)

    endTarget.copy(targetPos)

    if (index === scales.length - 1) {
      // Place the camera exactly in front of the human, looking at their chest
      const forwardDir = new THREE.Vector3()
      human.getWorldDirection(forwardDir) // Gets the human's local +Z (forward) axis
      endCamPos.copy(endTarget).add(forwardDir.multiplyScalar(targetData.camDist))
    } else {
      const dir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize()
      if (dir.lengthSq() === 0) dir.set(0, 0, 1)
      endCamPos.copy(endTarget).add(dir.multiplyScalar(targetData.camDist))
    }

    currentScaleIndex = index
    state.isTransitioning = true
    transitionStart = performance.now()
  }

  const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  window.addEventListener('resize', () => {
    const w = window.innerWidth
    const h = window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    composer.setSize(w, h)
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    bloomPass.setSize(w, h)
  })

  const labelPos = new THREE.Vector3()

  return {
    update() {
      const now = performance.now()
      starfield.update(now / 1000)

      // Handle transitions
      if (state.isTransitioning) {
        let t = (now - transitionStart) / TRANSITION_DURATION
        if (t >= 1) {
          t = 1
          state.isTransitioning = false
          if (state.isCinematicPlaying) {
            setTimeout(() => {
              if (state.isCinematicPlaying) {
                if (currentScaleIndex < scales.length - 1) {
                  jumpToScale(currentScaleIndex + 1)
                } else {
                  state.isCinematicPlaying = false
                  const btn = cinematicControls.querySelector('.play-btn')!
                  btn.innerHTML = 'Play Journey'
                }
              }
            }, 2500) // pause between steps
          }
        }
        const easeT = easeInOutCubic(t)
        camera.position.lerpVectors(startCamPos, endCamPos, easeT)
        controls.target.lerpVectors(startTarget, endTarget, easeT)
      }

      controls.update()

      // Keep skybox centered on camera so we never reach its edge
      skybox.position.copy(camera.position)

      const distToTarget = camera.position.distanceTo(controls.target)
      camera.near = Math.max(0.00001, distToTarget / 1000)
      camera.far = Math.max(10, distToTarget * 10)
      camera.updateProjectionMatrix()

      // Fade out Deep Space Skybox outside the Milky Way
      const skyboxMat = skybox.material as THREE.MeshBasicMaterial
      if (distToTarget < 12) {
        skyboxMat.opacity = 1.0
      } else if (distToTarget < 25) {
        skyboxMat.opacity = 1.0 - ((distToTarget - 12) / 13)
      } else {
        skyboxMat.opacity = 0
      }

      // Fade out Universe and Cluster to prevent bloom whiteout at close range
      if (distToTarget > 2000) {
        universeMat.opacity = 0.3
      } else if (distToTarget > 500) {
        universeMat.opacity = 0.3 * ((distToTarget - 500) / 1500)
      } else {
        universeMat.opacity = 0
      }

      if (distToTarget > 200) {
        clusterMat.opacity = 0.6
      } else if (distToTarget > 40) {
        clusterMat.opacity = 0.6 * ((distToTarget - 40) / 160)
      } else {
        clusterMat.opacity = 0
      }

      // Spin and fade galaxies
      galaxies.forEach(g => {
        const pts = g.mesh.children[0] as THREE.Points

        // Stop spinning the galaxy if we are zooming into the Solar System or smaller.
        // This prevents the Solar System/Earth from moving away from the camera target!
        if (currentScaleIndex < 4 && !state.isTransitioning) {
          pts.rotation.z += state.rotationSpeed * (1 / g.def.scale) * 0.2
        } else if (currentScaleIndex < 4 && state.isTransitioning) {
          pts.rotation.z += state.rotationSpeed * (1 / g.def.scale) * 0.2
        }
        // Wait, better logic: just stop spinning entirely if scale index >= 4
        if (currentScaleIndex < 4) {
          pts.rotation.z += state.rotationSpeed * (1 / g.def.scale) * 0.2
        }

        const mat = pts.material as THREE.PointsMaterial
        if (distToTarget > 5) {
          mat.opacity = 0.9
        } else if (distToTarget > 1) {
          mat.opacity = 0.9 * ((distToTarget - 1) / 4)
        } else {
          mat.opacity = 0
        }
      })

      // Spin Earth, but stop spinning when we are targeting Earth or Human
      // so the human stays on the correct side and doesn't spin away.
      if (currentScaleIndex < 6) {
        earth.rotation.y += 0.005
      }

      // Update floating HTML labels
      floatingLabels.forEach(label => {
        const d = camera.position.distanceTo(label.getPos())
        // Only show if within acceptable distance ranges
        if (d >= label.minVisibleDist && d <= label.maxVisibleDist) {
          labelPos.copy(label.getPos())
          labelPos.project(camera)

          if (labelPos.z > 1) {
            label.element.style.opacity = '0'
          } else {
            const x = (labelPos.x * 0.5 + 0.5) * window.innerWidth
            const y = (-(labelPos.y * 0.5) + 0.5) * window.innerHeight
            label.element.style.left = `${x}px`
            label.element.style.top = `${y}px`
            label.element.style.opacity = '1'
            label.element.classList.remove('hidden-label')
          }
        } else {
          label.element.style.opacity = '0'
          // Delay hiding so opacity transition plays
          if (label.element.style.opacity === '0') {
            // label.element.classList.add('hidden-label') // optional
          }
        }
      })

      bloomPass.strength = state.bloomStrength
      bloomPass.radius = state.bloomRadius
      bloomPass.threshold = state.bloomThreshold

      composer.render()
    },
  }
}
