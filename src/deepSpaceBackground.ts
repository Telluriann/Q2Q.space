import * as THREE from 'three'

/**
 * Loads a high-resolution photographic deep space background (e.g., Milky Way panorama)
 * as requested by the user. Place 'milkyway.jpg' in the public/ folder.
 */
export function createDeepSpaceBackground(): THREE.Texture {
  const loader = new THREE.TextureLoader()
  
  // Load the Milky Way panorama from the public folder.
  // For best results, it should be an equirectangular projection image.
  const tex = loader.load('/milkyway.jpg', (loadedTex) => {
    // Set correct color space for photos
    loadedTex.colorSpace = THREE.SRGBColorSpace
    // Improve filtering for large panoramas mapping to the screen
    loadedTex.minFilter = THREE.LinearFilter
    loadedTex.magFilter = THREE.LinearFilter
  })
  
  // Set mapping immediately so Three.js knows to treat it as a skybox/environment map
  tex.mapping = THREE.EquirectangularReflectionMapping
  return tex
}
