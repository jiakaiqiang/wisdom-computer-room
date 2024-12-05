<template>
  <div ref="threeContainer" style="width: 100%; height: 100%;">
    <div
        id="plane"
        :style="{left: state.planePos.left,top:state.planePos.top,right: state.planePos.right,display: state.planeDisplay}"
    >
      <p>机柜名称：{{ state.curCabinet.name }}</p>
      <p>机柜温度：{{ state.curCabinet.temperature }}°</p>
      <p>使用情况：{{ state.curCabinet.count }} / {{ state.curCabinet.capacity }}</p>
    </div>

  </div>

</template>

<script setup>
import {ref, onMounted, reactive} from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {EffectComposer} from "three/addons/postprocessing/EffectComposer.js";
import {RenderPass} from "three/addons/postprocessing/RenderPass.js";
import {OutlinePass} from "three/addons/postprocessing/OutlinePass.js";

const threeContainer = ref(null);

let scene, camera, renderer,deviceList=[] ,controls,currentDevice,outlinePass,composer;
const raycaster = new THREE.Raycaster();
const state = reactive({
  planePos: {
    left: 0,
    top: 0
  },
  planeDisplay: "none",
  curCabinet: {
    name: "Loading……",
    temperature: 0,
    capacity: 0,
    count: 0
  }
});

onMounted(() => {
  console.log('-fwefwfewfw')
  init();
});

function init() {
  // 创建场景
  scene = new THREE.Scene();
  // 设置背景颜色
  scene.background = new THREE.Color('#89b9ea');

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    threeContainer.value.clientWidth / threeContainer.value.clientHeight,
    0.1,
    1000
  );
   camera.position.set(0,1.5,2)

   camera.lookAt(0,3,0)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight);
  threeContainer.value.appendChild(renderer.domElement);

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, 1).normalize();
  createOutline()
  // 加载模型
  const loader = new GLTFLoader();
  loader.load(
    'models/cabinet/test11.glb', // 替换为你的模型路径
    function (cabinet) {

      cabinet.scene.traverse((child) => {
        if (child.isMesh) {
          console.log(child)
          let {map,color}= child.material

          if(child.name.indexOf('device')!=-1){
            deviceList.push(child)
          }
          child.material = new THREE.MeshStandardMaterial({
            color:color,
            side: THREE.DoubleSide,

            metalness: 0.1, // 根据需要调整
            roughness:0.5// 根据需要调整
          });
        }
      });
      scene.add(cabinet.scene);
    },
    undefined,
    function (error) {
      console.error('An error happened', error);
    }
  );

  // 渲染循环
  function animate() {
    composer.render();
    requestAnimationFrame(animate);
    //renderer.render(scene, camera);
  }

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0,1.2,0)
  controls.update()
  controls.addEventListener("change", function () {
   // renderer.render(scene, camera);
     if(composer){
       composer.render()
     }
  });
  animate();

  // 处理窗口大小变化
  window.addEventListener('resize', onWindowResize, false);
  renderer.domElement.addEventListener("click", async (event) => {
    selectDevice(event.offsetX, event.offsetY);


  })
  renderer.domElement.addEventListener("dblclick", async (event) => {
    selectDevice(event.offsetX, event.offsetY);
  })
}
//创建外边框
const createOutline = () => {
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);

  outlinePass = new OutlinePass(
      new THREE.Vector2(threeContainer.value.clientWidth, threeContainer.value.clientHeight),
      scene,
      camera
  );
  outlinePass.visibleEdgeColor.set(0xff0000); // 可见边缘颜色
  outlinePass.hiddenEdgeColor.set(0xffffff); // 隐藏边缘颜色
  outlinePass.edgeStrength = 5; // 边缘强度
  outlinePass.edgeThickness = 1; // 边缘厚度


  composer.addPass(renderPass);
  composer.addPass(outlinePass);
}
const selectDevice = (px, py) => {

  const x = (px / threeContainer.value.clientWidth) * 2 - 1;
  const y = -(py / threeContainer.value.clientHeight) * 2 + 1;
  //设置鼠标的裁剪坐标和相机的设置射线投射器
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
  const intersect = raycaster.intersectObjects(deviceList)[0];
  let intersectObj = intersect ? intersect.object : null;
  console.log(intersectObj,'intersectObj')
  if (intersectObj) {
    state.planePos.left = px + "px";
    state.planePos.top = py + "px";

    state.curCabinet = {
      name: `测试设备`,
      temperature: 12,
      capacity: 20,
      count: 5
    };

    currentDevice = intersectObj;
    state.planeDisplay = "block";
    outlinePass.selectedObjects = [intersectObj]
    //对应的设备弹出 并且加外边框
  }else{
    currentDevice = null
    state.planeDisplay = "none"
    outlinePass.selectedObjects = [];
  }

}
function onWindowResize() {
  camera.aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight);
  composer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight);
}
</script>

<style scoped>
#threeContainer {
  width: 100%;
  height: 100%;
}
#plane {
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 10px 10px;
  transform: translate(12px, -100%);
  display: none;
}
</style>
