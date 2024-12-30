import h337 from '@rengr/heatmap.js'
import * as THREE from "three";
export default function addHeatmapPlane(scene,data,basepoint) {
   let heatmapPlane = null
    let x =6
    let y = 13
    const canvasBox = document.createElement('div')
    document.body.appendChild(canvasBox)

    canvasBox.style.width = x + 'px'
    canvasBox.style.height = y + 'px'
    canvasBox.style.position = 'absolute'
    canvasBox.style.top = '0px'
    canvasBox.style.left = '0px'

    let canvas = h337.create({
        container: canvasBox,
        radius: 3,
        maxOpacity: 0.8,
        minOpacity: 0
    })
    canvas.setData({
        max: 40,
        min: 0,
        data: data.map(item=>{
            return {
                x:Math.abs(item.x),
                y:Math.abs(item.y),
                value:item.value
            }
        })
    })
    const g = new THREE.PlaneGeometry(x, y)
    const m = new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(canvas._renderer.canvas),
        transparent: true,
        side: THREE.DoubleSide
    })
   heatmapPlane = new THREE.Mesh(g, m)
    heatmapPlane.rotateX(Math.PI / 2)
    heatmapPlane.position.set(Math.abs(basepoint.x),0,Math.abs(basepoint.z+0.5))
    scene.add(heatmapPlane)
    document.body.removeChild(canvasBox)
    return heatmapPlane
}
