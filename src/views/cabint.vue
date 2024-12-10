<template>
  <div class="cabinet-info"  :style="{display: state.cabinetDisplay,'left':'300px'}">
    <div class="cabinet-info-title">
       <div>
         机柜信息:
       </div>
      <div style="margin-left:10px">
        测试机柜1
      </div>
    </div>
    <div class="cabinet">
      <div class="cabinet-item" v-for="item in cabinetInfo">
        <div>
          {{item.name}}
        </div>
        <div>
          {{item.value}}
        </div>
      </div>

    </div>
  </div>
  <div ref="threeContainer" style="width: 100%; height: 100%;">

  </div>
  <div

      :style="{display: state.planeDisplay}"
  >
   <div class="cabinet-info" style="right:300px;">
     <div class="cabinet-info-title">
          <div class="">
            设备名称：
          </div>
         <div class="">
             测试名称
         </div>
     </div>
     <div class="cabinet">
       <div class="cabinet-item" v-for="item in deviceInfo">
         <div>
           {{item.name}}
         </div>
         <div>
           {{item.value}}
         </div>
       </div>

     </div>
   </div>
  </div>
<!--  <el-button type="primary" icon="">-->

<!--  </el-button>-->

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
let deviceMaterials ={}
let scene, camera, renderer,deviceList=[] ,controls,currentDevice,outlinePass,composer;
const raycaster = new THREE.Raycaster();
const state = reactive({
  planePos: {
    left: 0,
    top: 0
  },
  planeDisplay: "none",
  cabinetDisplay:"block",
  curCabinet: {
    name: "Loading……",
    temperature: 0,
    capacity: 0,
    count: 0
  }
});

const cabinetInfo = reactive([
  {
    name:"容量",
    value:"60"
  },{
  name:"电流",
    value:'20A'
  },
  {
    name:"电压",
    value:"220v"
  },
    {
      name:"功率",
      value:"100W"
    },
    {
      name:"厂家",
      value:"华硕"
    },
    {
      name:"端口数",
      value:"8"
    },
    {
      name:"宽高",
      value:"173*868"
    }

])

const deviceInfo = reactive([
  {
    name:"u数",
    value:'4'
  },
    {
      name:"编号",
      value:'1'
    },
    {
      name:"型号",
      value:'ASUS'
    },
    {
      name:"购买日期",
      value:"2023-05-05"
    },
    {
      name:"厂家",
      value:"华硕"
    },
    {
      name:"证书",
      value:"123456789"
    }
])

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
  scene.add(new THREE.AxesHelper(10))
  const loader = new GLTFLoader();
  loader.load(
    'models/cabinet/test15.glb', // 替换为你的模型路径
    function (cabinet) {

      cabinet.scene.traverse((child) => {
        if (child.isMesh) {
          console.log(child)
          let {map,color}= child.material

          if(child.name.indexOf('device')!=-1){
            deviceList.push(child)
            // 存储原始材质
            deviceMaterials[child.uuid] = child.material;

          }
          child.material = new THREE.MeshStandardMaterial({
            color:color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6 ,// 初始透明度
            metalness: 0.2, // 根据需要调整
            roughness:0.6// 根据需要调整
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
    selectDevice(event.offsetX, event.offsetY,false);


  })
  renderer.domElement.addEventListener("dblclick", async (event) => {

    selectDevice(event.offsetX, event.offsetY,true);
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
const selectDevice = (px, py,type) => {

  const x = (px / threeContainer.value.clientWidth) * 2 - 1;
  const y = -(py / threeContainer.value.clientHeight) * 2 + 1;
  //设置鼠标的裁剪坐标和相机的设置射线投射器
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
  const intersect = raycaster.intersectObjects(deviceList)[0];
  let intersectObj = intersect ? intersect.object : null;
  console.log(intersectObj,'intersectObj')
  if (intersectObj) {

    // 设置选中设备为高亮
    intersectObj.material.opacity = 1;

    deviceList.forEach(device => {
      if (device.uuid !== intersectObj.uuid) {
        device.material.opacity = 0.5;
      }
    });
    currentDevice = intersectObj;

    outlinePass.selectedObjects = [intersectObj]
    if(type){
      //视图平移
      console.log(intersectObj,'sfd')
      //更新父类的世界矩阵
     //  intersectObj.parent.updateWorldMatrix()
     //  intersectObj.matrix =  intersectObj.parent.matrixWorld
     // //  intersectObj.matrix.decompose(intersectObj.position, intersectObj.quaternion, intersectObj.scale)
     // // console.log(intersectObj.position,'-')
    camera.position.set(intersectObj.parent.position.x,intersectObj.parent.position.y+0.5,intersectObj.parent.position.z+0.5)
    camera.lookAt(intersectObj.parent.position.x,intersectObj.parent.position.y+0.5,intersectObj.parent.position.z)
    controls.target.set(intersectObj.parent.position.x,intersectObj.parent.position.y+0.5,intersectObj.parent.position.z)
    controls.update()
      state.cabinetDisplay= 'none'
    }else{
      state.planeDisplay = 'block'
    }

    //对应的设备弹出 并且加外边框
  }else{
    currentDevice = null
    state.planeDisplay = 'none'
    state.cabinetDisplay =  'block'
    outlinePass.selectedObjects = [];
    // 恢复所有设备的透明度
    deviceList.forEach(device => {
      device.material.opacity = 0.5;
    })
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
.cabinet-info{
  border-radius: 10px;
  position: absolute;

  top:300px;
  width:300px;

  background-color: #519ddf;
  color:white;
  padding:10px 10px;
  .cabinet-info-title{
    display: flex;
    margin-bottom:10px;
    justify-content: space-between;
    border-bottom:1px solid #d6d2d2;
    padding-bottom: 8px;
    &>div:nth-of-type(1){
      font-size:18px;
    }
  }
  .cabinet {
    .cabinet-item{
      display: flex;
      justify-content: space-between;
      line-height:20px;

    }
  }

}
#planes {
  position: absolute;
  top: 300px;
  right:300px;
  width: 300px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 10px 10px;

  display: none;
}
</style>
