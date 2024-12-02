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
      const camera = new THREE.PerspectiveCamera(75, containerElement.clientWidth / containerElement.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
      containerElement.appendChild(renderer.domElement);

      // 设置相机位置
      camera.position.z = 5;

      // 添加环境光
      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);

      // 添加点光源
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);

      // 创建 MTLLoader 和 OBJLoader
      const mtlLoader = new MTLLoader();
      const objLoader = new OBJLoader();



      // 加载 MTL 文件
      mtlLoader.load('models/cabinet/cabinet_42u.mtl', (materials) => {
        materials.preload();

        // 设置 OBJLoader 使用加载的材质
        objLoader.setMaterials(materials);

        // 加载 OBJ 文件
        objLoader.load('models/cabinet/cabinet_42u.obj', (object) => {
          scene.add(object);

          // 保存模型对象以便后续操作
          modelObject = object;

          // 调整模型位置或缩放（可选）
          object.position.set(0, 0, 0);
          object.scale.set(1, 1, 1);

          // 渲染循环
          animate(renderer, scene, camera);
        }, undefined, (error) => {
          console.error('An error happened while loading OBJ file:', error);
        });
      }, undefined, (error) => {
        console.error('An error happened while loading MTL file:', error);
      });

      // 处理窗口大小变化
      window.addEventListener('resize', () => {
        const width = containerElement.clientWidth;
        const height = containerElement.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      });
    };

    const animate = (renderer, scene, camera) => {
      requestAnimationFrame(() => animate(renderer, scene, camera));
      renderer.render(scene, camera);
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
