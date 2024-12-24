<template>
  <div ref="threeContainer" class="three-container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import * as THREE from 'three';
import { CSG } from 'three-csg-ts';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
const threeContainer = ref(null);

onMounted(() => {


  // 初始化场景
  const scene = new THREE.Scene();


  const camera = new THREE.PerspectiveCamera(75, threeContainer.value.clientWidth / threeContainer.value.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(threeContainer.value.clientWidth,threeContainer.value.clientHeight);
  threeContainer.value.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5).normalize();
  scene.add(light);
  // 创建墙体
  const wallGeometry = new THREE.BoxGeometry(4, 3, 0.1);
  const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
  const wallMesh  =  new  THREE.Mesh(wallGeometry, wallMaterial)
  // 创建门和窗
  const doorGeometry = new THREE.BoxGeometry(1, 2, 0.1);
  doorGeometry.translate(1, -0.5, 0);
  const doorMaterial = new THREE.MeshBasicMaterial({ color: 'pink' });
  const doorMesh =  new THREE.Mesh(doorGeometry, doorMaterial)


  doorMesh.updateMatrix();

  // 执行 CSG 操作
  const wallCSG = CSG.fromMesh(wallMesh);
  const doorCSG = CSG.fromMesh(doorMesh);
  const subtractedCSG = wallCSG.subtract(doorCSG);

  // 转换回 Three.js 网格
  const resultMesh = CSG.toMesh(subtractedCSG, wallMesh.matrix);
  resultMesh.material = wallMaterial; // 应用相同的材质

  scene.add(resultMesh);
  const controls =  new OrbitControls(camera, renderer.domElement)
  controls.update()
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update()
  }

  animate();


  // 处理窗口大小变化
  window.addEventListener('resize', () => {
    camera.aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight);
  });

  return () => {
    window.removeEventListener('resize', () => {});
  };
});
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100vh;
}
</style>
