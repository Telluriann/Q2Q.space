import * as THREE from 'three'

/**
 * Creates a massive skybox sphere using the high-resolution Milky Way panorama.
 * This allows us to dynamically fade out the background when zooming out to intergalactic scales.
 */
export function createDeepSpaceBackgroundMesh(): THREE.Mesh {
  const loader = new THREE.TextureLoader()
  
  // Skybox sphere needs to be massive but within the camera's far plane.
  const geometry = new THREE.SphereGeometry(15000, 64, 64)
  
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.BackSide, // Render on the inside of the sphere
    transparent: true,
    opacity: 1.0,
    depthWrite: false
  })

  // Load the Milky Way panorama
  loader.load('/milkyway.jpg', (loadedTex) => {
    loadedTex.colorSpace = THREE.SRGBColorSpace
    loadedTex.minFilter = THREE.LinearFilter
    loadedTex.magFilter = THREE.LinearFilter
    
    material.map = loadedTex
    material.needsUpdate = true
  })
  
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = 'DeepSpaceSkybox'
  
  return mesh
}
