<template>
  <div ref="threeContainer" class="three-container"></div>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default {
  name: 'Wall',
  setup() {
    const threeContainer = ref(null);
    let scene, camera, renderer, controls, points = [];

    const initThree = () => {
      // 创建场景
      scene = new THREE.Scene();
      //添加网格
      scene.add(new THREE.GridHelper(100, 100));

      // 创建相机
      camera = new THREE.PerspectiveCamera(75, threeContainer.value.clientWidth / threeContainer.value.clientHeight, 0.1, 1000);
      camera.position.set(0, 20, 10);
      camera.lookAt(0, 0, 0);

      // 创建渲染器
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight);
      threeContainer.value.appendChild(renderer.domElement);

      // 添加轨道控制器
      controls = new OrbitControls(camera, renderer.domElement);
      controls.update();

      // 添加环境光
      const ambientLight = new THREE.AmbientLight(0x404040); // 环境光
      scene.add(ambientLight);

      // 添加平行光
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(1, 1, 1).normalize();
      scene.add(directionalLight);

      // 监听鼠标点击事件
      threeContainer.value.addEventListener('dblclick', onMouseClick, false);
    };

    const onMouseClick = (event) => {
      const mouse = new THREE.Vector2();
      const raycaster = new THREE.Raycaster();

      // 将鼠标位置归一化
      mouse.x = (event.clientX / threeContainer.value.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / threeContainer.value.clientHeight) * 2 + 1;

      // 更新射线投射器
      raycaster.setFromCamera(mouse, camera);

      // 投射到平面
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0)); // XY 平面
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);

      // 处理点击事件
      handleIntersection(intersection);
    };

    const handleIntersection = (intersection) => {
      points.push(intersection.clone());

      if (points.length > 1) {
        drawWall(points);
      }
    };

    const drawWall = (points) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const line = new THREE.Line(geometry, material);
      scene.add(line);

      if (points.length > 2 && points[0].distanceTo(points[points.length - 1]) < 0.1) {
        closeWall(points);
      }
    };

    const closeWall = (points) => {
      points.pop();

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      geometry.attributes.position.array.push(points[0].x, points[0].y, points[0].z);

      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
      const wall = new THREE.Mesh(geometry, material);
      scene.add(wall);

      points = [];
    };

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    onMounted(() => {
      initThree();
      animate();
    });

    return {
      threeContainer,
    };
  },
};
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100vh;
}
</style>