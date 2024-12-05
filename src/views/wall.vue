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
    let pointArr = []

    const initThree = () => {
      // 创建场景
      scene = new THREE.Scene();
      scene.add(new THREE.AxesHelper(5))
      //添加网格
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
      // 监听鼠标按下事件
      renderer.domElement.addEventListener("mousedown", onMouseDown);
      window.addEventListener("keyup", onMouseKeyUp);
    };
    const onMouseKeyUp = (event)=>{
      if (event.key === "Control" || event.code === "ControlLeft" || event.code === "ControlRight") {
        console.log('Ctrl 键已释放');
        if (pointArr.length > 1) {

          const lineGeometry = new THREE.BufferGeometry().setFromPoints(pointArr);
          const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
          const line = new THREE.LineLoop(lineGeometry, lineMaterial);
          scene.add(line);
          pointArr.push(pointArr[0])
          pointArr.forEach((item,index)=>{
            createWall(item,pointArr[index+1])
          })
        }else{

        }
        // 在这里添加你需要的操作
      }
    }
    const createWall = (start,end)=>{
      // 画墙开始
      // 和并曲线

      const curvePath = new THREE.CurvePath();
      const curv3 = new THREE.LineCurve3(
          new THREE.Vector3(start.x, start.y, start.z),
          new THREE.Vector3(end.x, end.y, end.z)
      );
      curvePath.add(curv3);

      // 设置挤压参数，按路径挤压
      const extrudeSettings = {
        steps: 200,
        bevelEnabled: true,
        bevelThickness: 100,
        extrudePath: curvePath,
      };

      // 设置挤压面
      const pts = [];
      const deepness = 0.1; // 厚度
      const height = 2; // 高度
      pts.push(new THREE.Vector2(0, -0.5 * deepness));
      pts.push(new THREE.Vector2(-height, -0.5 * deepness));
      pts.push(new THREE.Vector2(-height, 0.5 * deepness));
      pts.push(new THREE.Vector2(0, 0.5 * deepness));

      // 生成挤压模型
      const shape = new THREE.Shape(pts);
      const geometry = new THREE.ExtrudeGeometry(
          shape,
          extrudeSettings
      );
      const material2 = new THREE.MeshBasicMaterial({
        color: "green",
        wireframe: false,
      });
      const mesh = new THREE.Mesh(geometry, material2);

      // 将墙体添加到场景中
      scene.add(mesh)

    }
  const  onMouseDown = (event)=>{
      if (event.ctrlKey) {
        console.log('Ctrl 键被按下，同时鼠标按下');
        //获取鼠标的点坐标
        const mouse = new THREE.Vector2();
        mouse.x = (event.offsetX / threeContainer.value.clientWidth) * 2 - 1;
        mouse.y = -(event.offsetY / threeContainer.value.clientHeight) * 2 + 1;
        console.log(mouse)
        const raycaster = new THREE.Raycaster();
        const normal = new THREE.Vector3(0, 1, 0);
        const planeGround = new THREE.Plane(normal, 0);

        // 从相机发出一条射线经过鼠标点击的位置
        raycaster.setFromCamera(mouse, camera);

        // 拿到该射线
        const ray = raycaster.ray;

        // 计算相机到射线的对象，可能有多个对象，返回一个数组，按照相机距离远近排列
        const intersects = ray.intersectPlane(
            planeGround,
            new THREE.Vector3(0, 0, 0)
        );

        // //获取射线投射器和场景中对象的交点
        // const intersects = raycaster.intersectObjects(planeGround);
        console.log(intersects,'wewe')
        if (intersects) {
          const point = intersects
          const geometry = new THREE.SphereGeometry(0.1, 32, 32);
          const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
          const sphere = new THREE.Mesh(geometry, material);
          sphere.position.copy(point);
          scene.add(sphere);
          if(pointArr.length>0){

          }
          pointArr.push(point)


        }

        // 在这里添加你需要的操作
      } else {
        console.log('鼠标按下，但没有按下 Ctrl 键');
        // 在这里添加你需要的操作

      }
    }

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    onMounted(() => {
      // 确保容器尺寸是最新的
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