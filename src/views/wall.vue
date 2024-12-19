<template>
  <div ref="threeContainer" class="three-container"></div>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

export default {
  name: 'Wall',
  setup() {
    const threeContainer = ref(null);
    let scene, camera, renderer, controls;
    let startPoint = null;
    let tempLine = null;
    let tempDistanceText = null;

    const initThree = () => {
      // 创建场景
      scene = new THREE.Scene();
      scene.add(new THREE.AxesHelper(5));
      // 添加网格
      scene.add(new THREE.GridHelper(100, 100));

      // 创建相机
      camera = new THREE.PerspectiveCamera(75, threeContainer.value.clientWidth / threeContainer.value.clientHeight, 0.1, 1000);
      camera.position.set(20, 20, 20);
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

      // 监听鼠标事件
      renderer.domElement.addEventListener("mousedown", onMouseDown);
      renderer.domElement.addEventListener("mousemove", onMouseMove);
      renderer.domElement.addEventListener("mouseup", onMouseUp);
    };

    const onMouseDown = (event) => {
      const mouse = getMousePosition(event);
      const point = getIntersectionPoint(mouse);

      if (point) {
        startPoint = point;
        addSphere(point);
      }
    };

    const onMouseMove = (event) => {
      if (!startPoint) return;

      const mouse = getMousePosition(event);
      const point = getIntersectionPoint(mouse);

      if (point) {
        updateTempLine(startPoint, point);
        updateDistanceText(startPoint, point);
      }
    };

    const onMouseUp = (event) => {
      if (!startPoint) return;

      const mouse = getMousePosition(event);
      const endPoint = getIntersectionPoint(mouse);

      if (endPoint) {
        createWall(startPoint, endPoint);
        startPoint = null;
        removeTempLine();
        removeDistanceText();
      }
    };

    const getMousePosition = (event) => {
      const mouse = new THREE.Vector2();
      mouse.x = (event.offsetX / threeContainer.value.clientWidth) * 2 - 1;
      mouse.y = -(event.offsetY / threeContainer.value.clientHeight) * 2 + 1;
      return mouse;
    };

    const getIntersectionPoint = (mouse) => {
      const raycaster = new THREE.Raycaster();
      const normal = new THREE.Vector3(0, 1, 0);
      const planeGround = new THREE.Plane(normal, 0);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.ray.intersectPlane(planeGround, new THREE.Vector3(0, 0, 0));

      if (intersects.length > 0) {
        return intersects[0].point;
      }
      return null;
    };

    const addSphere = (point) => {
      const geometry = new THREE.SphereGeometry(0.1, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(point);
      scene.add(sphere);
    };

    const createWall = (start, end) => {
      const curvePath = new THREE.CurvePath();
      const curv3 = new THREE.LineCurve3(
        new THREE.Vector3(start.x, start.y, start.z),
        new THREE.Vector3(end.x, end.y, end.z)
      );
      curvePath.add(curv3);

      const extrudeSettings = {
        steps: 200,
        bevelEnabled: true,
        bevelThickness: 100,
        extrudePath: curvePath,
      };

      const pts = [];
      const deepness = 0.1; // 厚度
      const height = 2; // 高度
      pts.push(new THREE.Vector2(0, -0.5 * deepness));
      pts.push(new THREE.Vector2(-height, -0.5 * deepness));
      pts.push(new THREE.Vector2(-height, 0.5 * deepness));
      pts.push(new THREE.Vector2(0, 0.5 * deepness));

      const shape = new THREE.Shape(pts);
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const material2 = new THREE.MeshBasicMaterial({
        color: "green",
        wireframe: false,
      });
      const mesh = new THREE.Mesh(geometry, material2);

      scene.add(mesh);
    };





    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    onMounted(() => {
      window.addEventListener('resize', () => {
        camera.aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight);
      });
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
