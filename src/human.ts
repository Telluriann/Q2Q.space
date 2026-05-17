import * as THREE from 'three'

export function createHuman(): THREE.Group {
  const group = new THREE.Group()
  group.name = 'Human'

  const loader = new THREE.TextureLoader()
  const humanTexture = loader.load('/human.png')
  humanTexture.minFilter = THREE.LinearMipmapLinearFilter
  humanTexture.magFilter = THREE.LinearFilter

  // Base scale factor
  const scale = 0.0003
  // Make the sprite height roughly equivalent to the old 3D human height (which was ~8 * scale)
  const spriteSize = 8 * scale
  
  // Use Additive Blending to make the black background perfectly transparent
  // Keep opacity low (0.3) so it doesn't cause a massive bloom whiteout when zooming close
  const material = new THREE.SpriteMaterial({ 
    map: humanTexture, 
    color: 0xffffff,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    opacity: 0.3 
  })

  const sprite = new THREE.Sprite(material)
  sprite.scale.set(spriteSize, spriteSize, 1)
  
  // Shift the sprite up so the bottom (feet) rests on the origin
  sprite.position.y = spriteSize / 2

  // Add a very subtle ambient glow to ground it
  const glowGeo = new THREE.SphereGeometry(spriteSize * 0.4, 16, 16)
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  const glow = new THREE.Mesh(glowGeo, glowMat)
  glow.position.y = spriteSize / 2

  group.add(sprite, glow)

  // Position human on Earth's surface (radius is 0.005)
  group.position.set(0, 0, 0.005)
  
  // Rotate so the group's "Up" matches the Earth's surface normal.
  // This allows the camera logic in scene.ts to perfectly align in front of the human!
  group.rotation.x = Math.PI / 2

  return group
}
