<template>
  <div ref="container" class="three-container"></div>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

export default {
  name: 'ThreeScene',
  setup() {
    const container = ref(null);
    let modelObject = null;

    onMounted(() => {
      initThree();
    });

    const initThree = () => {
      // 获取容器元素
      const containerElement = container.value;

      // 创建场景、相机和渲染器
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, containerElement.clientWidth / containerElement.clientHeight, 0.001, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
      containerElement.appendChild(renderer.domElement);

      // 设置相机位置
      camera.position.z = 5;

      // 添加环境光
      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);

      //创建盒子
      // const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
      // const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      // const box = new THREE.Mesh(boxGeometry, boxMaterial);
      // scene.add(box);
      //
      const objLoader = new OBJLoader();
      // 加载 OBJ 文件
      objLoader.load('models/cabinet/cabinet_42u.obj', (object) => {
        //循环遍历所有子对象
        object.traverse((child) => {
        });

        // 调整模型位置或缩放（可选）
        object.position.set(0, 0, 0);
        object.scale.set(4,4,4);

        scene.add(object);
      }, undefined, (error) => {
        console.error('An error happened while loading OBJ file:', error);
      });

      // 处理窗口大小变化
      window.addEventListener('resize', () => {
        const width = containerElement.clientWidth;
        const height = containerElement.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      });
      const animate = () => {
        requestAnimationFrame(() => animate(renderer, scene, camera));
        renderer.render(scene, camera);
      };
      animate()
    };


    return {
      container
    };
  }
};
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100vh;
}
</style>
