<template>
  <div class="cabinet-info"  :style="{display: state.cabinetDisplay,'left':'300px'}">
    <div class="cabinet-info-title">
       <div>
         机柜信息:
       </div>
      <div style="margin-left:10px">
        {{ getItemInfo().name }}
      </div>
    </div>
    <div class="cabinet">
      <div class="cabinet-item" v-for="item in cabinetInfo">
        <div>
          {{item.name}}
        </div>
        <div>
          {{getItemInfo()[item.value]}}
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
  <div class="delete" :style="{'position': 'absolute',display:deleteInfo.Display, top: deleteInfo.top, left: deleteInfo.left}">
    <el-button type="text"   @click="handleDelete" >下架</el-button>
  </div>
<!--  <el-button type="primary" icon="">-->

<!--  </el-button>-->

</template>

<script setup>
import {ref, onMounted, reactive} from "vue";
import {itemCabine} from '@/views/pointData'
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {EffectComposer} from "three/addons/postprocessing/EffectComposer.js";
import {RenderPass} from "three/addons/postprocessing/RenderPass.js";
import {OutlinePass} from "three/addons/postprocessing/OutlinePass.js";
const  props =  defineProps({
  currentCabinet:{
    type:Object,
    default:()=>{}
  }
})
const  deleteInfo = reactive({
  top:'0px',
  left:'0px',
  Display:'none'
})
const getItemInfo = ()=>{
  return itemCabine.find(item=>item.id==props.currentCabinet.id)
}
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
    name:"机柜编号",
    value:"cabinetNumber"
  },{
  name:"所属机房",
    value:'西安机房'
  },
  {
    name:"电压",
    value:"electricity"
  },
    {
      name:"电流",
      value:"voltage"
    },
    {
      name:"最大电流",
      value:"maxvoltage"
    },
    {
      name:"U数",
      value:"cabinetU"
    },
  {
    name:'离地距离',
    value:'distance'
  },
    {
      name:"高",
      value:"cabinetHeight"
    },
  {
    name:"宽",
    value:"cabinetWidth"
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

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(0, 1, 15);
  const targetObject = new THREE.Object3D();

  targetObject.position.set(0,0.5,0)
  directionalLight.target = targetObject;
  scene.add(targetObject);
  scene.add( directionalLight.target );
  scene.add(directionalLight);
  //添加光线辅助器
  const helper = new THREE.DirectionalLightHelper(directionalLight, 1);
  scene.add(helper);
  createOutline()

  const loader = new GLTFLoader();
  loader.load(
    'models/test2.glb', // 替换为你的模型路径
    function (cabinet) {
      console.log(cabinet.scene,'cabinet.scene')
      cabinet.scene.traverse((child) => {
        if (child.isMesh) {
          console.log(child)
          let {map,color}= child.material

          // if(child.name.indexOf('cabint')!=-1){
          //   deviceList.push(child)
          //   // 存储原始材质
          //   deviceMaterials[child.uuid] = child.material;
          //
          // }
          child.material = new THREE.MeshPhysicalMaterial({
            side: THREE.DoubleSide,
            color,
            metalness: 0.8, // 根据需要调整
            roughness:0.3// 根据需要调整
          });
        }
      });
      scene.add(cabinet.scene);
      //线框
   // const geomoetry =  cabinet.scene.children[0]
   //    const edges = new THREE.EdgesGeometry( cabinet.scene.children[0].geometry );
   //    const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) )
  // cabinet.scene.rotateY(-Math.PI/2)
   //    geomoetry.updateWorldMatrix(true,true)
   //    line.matrix.copy(geomoetry.matrixWorld);
   //    line.matrix.decompose(line.position,line.quaternion,line.scale)
   //    scene.add(line);
    },
    undefined,
    function (error) {
      console.error('An error happened', error);
    }
  );
  //根据设备的数量加载设备模型
  for (let i = 0; i < 10; i++) {
    loader.load('models/device.glb',(gltf)=>{
      //更新世界坐标
      // gltf.scene.updateMatrixWorld(true);

      // let  data  =  gltf.scenes[0].children[0]
      // data.updateWorldMatrix(true,false)
      //
      // gltf.scene.matrix.copy(data.matrixWorld)
      // gltf.scene.matrix.decompose(gltf.scene.position,gltf.scene.quaternion,gltf.scene.scale)

      //设置自身的坐标 比例等
      gltf.scene.scale.set(0.08,0.1,0.06)
      gltf.scene.position.z = -0.28
      gltf.scene.position.x = -0.01
      gltf.scene.position.y=0.2+i*0.19
     gltf.scene.traverse(child=>{
       child.material = new THREE.MeshPhysicalMaterial({
         side: THREE.DoubleSide,

         metalness: 0.5, // 根据需要调整
         roughness:0.5// 根据需要调整
       });
     })
      deviceList.push(gltf.scene)
      scene.add(gltf.scene)
      console.log(gltf)
    })
    // const device = new THREE.Mesh(
    //   new THREE.BoxGeometry(0.1, 0.1, 0.1),
    //   new THREE.MeshStandardMaterial({
    //     color: new THREE.Color(Math.random() * 0xffffff),
    //     side: THREE.DoubleSide,
    //     transparent: true,
    //     opacity: 0.6 ,// 初始透明度
    //     metalness: 0.2, // 根据需要调整
    //   })
    // )
  }


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
  //右键
    renderer.domElement.addEventListener("contextmenu", async (event) => {

      selectDevice(event.offsetX, event.offsetY,false,'right');
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
const selectDevice = (px, py,type,mouseType='left') => {

  const x = (px / threeContainer.value.clientWidth) * 2 - 1;
  const y = -(py / threeContainer.value.clientHeight) * 2 + 1;
  //设置鼠标的裁剪坐标和相机的设置射线投射器
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
  const intersect = raycaster.intersectObjects(deviceList)[0];
  let intersectObj = intersect ? intersect.object : null;
  console.log(intersectObj,'intersectObj')
  if (intersectObj) {

    // 设置选中设备为高亮
    // intersectObj.material.opacity = 1;
    //
    // deviceList.forEach(device => {
    //   if (device.uuid !== intersectObj.uuid) {
    //     device.material.opacity = 0.5;
    //   }
    // });
    currentDevice = intersectObj;

    outlinePass.selectedObjects = [intersectObj]
    console.log(intersectObj,'intersectObj')
    intersectObj.position.z= intersectObj.position.z+12
    if(type){
      //视图平移
      console.log(intersectObj,'sfd')
      //更新父类的世界矩阵
     //  intersectObj.parent.updateWorldMatrix()
     //  intersectObj.matrix =  intersectObj.parent.matrixWorld
     // //  intersectObj.matrix.decompose(intersectObj.position, intersectObj.quaternion, intersectObj.scale)
     // // console.log(intersectObj.position,'-')
    // camera.position.set(intersectObj.parent.position.x,intersectObj.parent.position.y+0.5,intersectObj.parent.position.z+0.5)
    // camera.lookAt(intersectObj.parent.position.x,intersectObj.parent.position.y+0.5,intersectObj.parent.position.z)
    // controls.target.set(intersectObj.parent.position.x,intersectObj.parent.position.y+0.5,intersectObj.parent.position.z)
    // controls.update()
      //state.cabinetDisplay= 'none'
    }else{
       if(mouseType=='left'){
         state.planeDisplay = 'block'
       }
    }
    if(mouseType==='right'){
      //显示操作位置 弹窗。
      deleteInfo.Display =  'block'
      state.planeDisplay = 'none'
      deleteInfo.top = py-10+'px'
      deleteInfo.left = px+100+'px'
    }
    //对应的设备弹出 并且加外边框
  }else{
    currentDevice = null
    state.planeDisplay = 'none'
    state.cabinetDisplay =  'block'
    deleteInfo.Display =  'none'
    outlinePass.selectedObjects = [];
    // 恢复所有设备的透明度
    // deviceList.forEach(device => {
    //   device.material.opacity = 0.5;
    // })
  }


}
//删除选中的设备
const handleDelete = ()=>{
  console.log(scene,'scene')
  if(currentDevice){
    scene.children.forEach(item=>{
      if(item.uuid==currentDevice.parent.parent.uuid){

        scene.remove(item)
        deviceList.splice(deviceList.indexOf(currentDevice.parent.parent),1)
      }

    })

    scene.remove(currentDevice)
    currentDevice.geometry.dispose()
    currentDevice.material.dispose();

    currentDevice = null
    deleteInfo.Display =  'none'



    outlinePass.selectedObjects = [];
    console.log(scene,'currentDevice')
    //更新场景
    renderer.render(scene, camera);
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
.delete{
  width:50px;

  background:#fafafa;
  text-align: center;
  line-height:20px;
  padding:10px;
  border-radius:5px;
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
