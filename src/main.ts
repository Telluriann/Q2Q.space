import * as THREE from 'three'
import { createScene } from './scene'

const canvas = document.querySelector<HTMLCanvasElement>('#app canvas') ?? undefined
const scene = createScene(canvas)

function tick() {
  scene.update()
  requestAnimationFrame(tick)
}
tick()
