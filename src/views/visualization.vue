<template>
  <div style="height:100%;width:100%;display: flex;">
    <div v-if="showModelAll" ref="thress" class="three-dom">

      <div
          id="plane"
          :style="{left: state.planePos.left,top:state.planePos.top,right: state.planePos.right,display: state.planeDisplay}"
      >
        <p>机柜名称：{{ state.curCabinet.name }}</p>

        <p>上架设备数:{{state.curCabinet.shelfNum}}个</p>
        <p>已使用：{{ state.curCabinet.usedNum }}U </p>
        <p>总u数：{{ state.curCabinet.cabinetU }}U</p>
      </div>
    </div>
    <div
        id="video"
        :style="{position:'absolute',left: state.pointPos.left,top:state.pointPos.top,display: state.pointDisplay,width:'100px',height:'100px'}"
    >
      <video width='200px' height='200px' controls>
        <source src="https://stream7.iqilu.com/10339/upload_transcode/202002/18/202002181038474liyNnnSzz.mp4"
                type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>

    <!---->
    <cabint v-if="!showModelAll" :currentCabinet="state.curCabinet" class="three-dom"></cabint>

    <el-button v-if="showModelAll" @click="handleAuto" style="position: absolute; top: 10px; left: 10px">自动巡检</el-button>
    <el-button  v-if="showModelAll" @click="handleAssign" style="position: absolute; top: 10px; left:100px" :disabled="!showModelAll">指定巡检</el-button>
    <!--    <el-button v-if="!curPoint" @click="changeEyes" style="position: absolute; top: 10px; left:100px">切换视角</el-button>-->
    <el-button   @click="changeDefaultEyes" :style="{position: 'absolute', top: '10px' ,left:!showModelAll?'10px':'200px'}">返回默认视角</el-button>
    <el-button v-if="showModelAll" @click="generateMois" style="position: absolute; top: 10px; left:340px">添加湿度</el-button>
    <el-button v-if="showModelAll"  @click="generateHeatMap" style="position: absolute; top: 10px; left:440px">添加温度</el-button>
  </div>

</template>

<script setup>
import {ref, onMounted, reactive, watch, nextTick, getCurrentInstance, onBeforeMount,onBeforeUnmount} from "vue";
import {EffectComposer} from "three/addons/postprocessing/EffectComposer.js";
import {RenderPass} from "three/addons/postprocessing/RenderPass.js";
import {OutlinePass} from "three/addons/postprocessing/OutlinePass.js";
import cabint from './cabint.vue'
import {
  handlePointData,
  createSquare,
  createPoint,
  PointData,
  handeLineData,
  cabinetData,
  tempData,
  mosi,
  alarmCabint
} from './pointData.js'
import createOutLine from '@/util/addOutLine.js'
import addHeatmapPlane from '@/views/yuntu.js'
import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import  CreateWebSocket from '@/axios/websocket.js'
import {addEvent,removeEvent,triggerEvent} from '@/util/Event.js'
import * as TWEEN from "@tweenjs/tween.js";
import {PathGeometry, PathPointList} from "three.path";
import jsSHA from 'jssha'
const shaObj = new jsSHA('SHA-512', 'TEXT', {
  encoding: 'UTF8',
  numRounds: 3088
})
shaObj.update('QAZWSXmoon890@')
let newPassword = shaObj.getHash('HEX')
const {proxy}  =  getCurrentInstance()
import {setToken} from "@/util/token.js";


proxy.$request({
     url: 'login/thirdPartyLogin',
     method: 'post',
     data: {
       account: 'super',
       password: newPassword
     }
}).then(res => {
  if(res.code==0){
    //存储cookie
    setToken(res.data.Token)

  }

})

const thress = ref(null);
let showModelAll = ref(true)
let basepoint={x:'',y:''};
watch(() => showModelAll.value, (val) => {
  if (val) {
    nextTick(() => {
      init()
    })
  } else {
    signal.value = false
    console.log('wefwefw------------------------')
  }
})
//存储所有的模型
let modelList = []
let deviceList = []

let camera,
    scene,
    renderer,
    arrow,
    pathCurve,
    cameraTween,
    cubPerson,
    tween,
    controls,
    pathToShow,
    points;
let pointsArray = []
let pointArr = [];
let cabinets = [];
let curCabinet = null; //划入的机柜
let curPoint = null //当前点
let renderFunc = {};
let jkqSelectObect = {
  material: {}
};
let signal = ref(false)//单机柜
let eyesValue = ref(false);

const state = reactive({
  planePos: {
    left: 0,
    top: 0
  },
  pointPos: {
    left: 0,
    top: 0
  },
  pointDisplay: "none",
  planeDisplay: "none",
  curCabinet: {
    name: "Loading……",
    temperature: 0,
    capacity: 0,
    count: 0
  }
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let maps = new Map();

//创建动画函数
const registerRenderFunc = (name, func) => {
  renderFunc[name] = func;
};



const moveSquareAlongPath = (points, duration, stopPoints) => {
  const totalLength = pathCurve.getLength();
  const step = totalLength / points.length;

  let currentPointIndex = 0;
  let currentLength = 0;

  tween = new TWEEN.Tween({t: 0})
      .to({t: 1}, duration)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(({t}) => {

        // const length = t * totalLength;
        //获取对应时间点的信息
        const point = pathCurve.getPointAt(t);

        cubPerson.position.set(point.x, 0.3, point.z);
        if (eyesValue.value) {
          // // 获取前一个点的索引
          const previousPointIndex = Math.max(0, currentPointIndex - 2);
          const previousPoint = points[previousPointIndex];

          // // 计算物体的朝向
          const direction = new THREE.Vector3();
          direction.subVectors(point, previousPoint).normalize();

          // // // 设置相机的方向


          currentLength += step;
          currentPointIndex = Math.floor(currentLength / step);
          // 更新相机位置和方向
          camera.position.set(point.x, 1, point.z); // 相机高度稍微高一点
          camera.lookAt(point);
          camera.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(camera.position, camera.position.clone().add(direction), new THREE.Vector3(0, 1, 0)));
        }


      })
      .onComplete(() => {
        console.log(pathToShow,'pathToShow')
        controls.enabled = true;
        signal.value = false
        scene.remove(...pointArr)
        //删除路径
        scene.remove(pathToShow)
        console.log("路径结束");
      })
      .start();
};
const socketwebrobot = new CreateWebSocket('ws://10.173.30.81/webSocket')
socketwebrobot.connection(()=>{
  socketwebrobot?.send(
      JSON.stringify({
        op: "subscribe",
        id: "subscribe:/map:1",
        type: "nav_msgs/OccupancyGrid",
        topic: "/map",
        compression: "png",
        throttle_rate: 0,
        queue_length: 0,
      })
  );
  socketwebrobot?.send(
      JSON.stringify({
        op: "advertise",
        id: "advertise:/move_base/goal:2",
        type: "move_base_msgs/MoveBaseActionGoal",
        topic: "/move_base/goal",
        latch: false,
        queue_size: 100,
      })
  );
  socketwebrobot?.send(
      JSON.stringify({
        op: "advertise",
        id: "advertise:/move_base/cancel:3",
        type: "actionlib_msgs/GoalID",
        topic: "/move_base/cancel",
        latch: false,
        queue_size: 100,
      })
  );
  socketwebrobot?.send(
      JSON.stringify({
        op: "subscribe",
        id: "subscribe:/move_base/status:4",
        type: "actionlib_msgs/GoalStatusArray",
        topic: "/move_base/status",
        compression: "none",
        throttle_rate: 0,
        queue_length: 0,
      })
  );
  socketwebrobot?.send(
      JSON.stringify({
        op: "subscribe",
        id: "subscribe:/move_base/feedback:5",
        type: "move_base_msgs/MoveBaseActionFeedback",
        topic: "/move_base/feedback",
        compression: "none",
        throttle_rate: 0,
        queue_length: 0,
      })
  );
  socketwebrobot?.send(
      JSON.stringify({
        op: "subscribe",
        id: "subscribe:/move_base/result:6",
        type: "move_base_msgs/MoveBaseActionResult",
        topic: "/move_base/result",
        compression: "none",
        throttle_rate: 0,
        queue_length: 0,
      })
  );
  socketwebrobot?.send(
      JSON.stringify({
        op: "subscribe",
        id: "subscribe:/amcl_pose:7",
        type: "geometry_msgs/PoseWithCovarianceStamped",
        topic: "/amcl_pose",
        compression: "none",
        throttle_rate: 100,
        queue_length: 0,
      })
  );
  socketwebrobot?.send(
      JSON.stringify({
        op: "subscribe",
        id: "subscribe:/map_metadata:8",
        type: "nav_msgs/MapMetaData",
        topic: "/map_metadata",
        compression: "none",
        throttle_rate: 0,
        queue_length: 0,
      })
  );
  socketwebrobot?.send(
      JSON.stringify({
        op: "subscribe",
        id: "subscribe:/amcl_pose:9",
        type: "geometry_msgs/PoseWithCovarianceStamped",
        topic: "/amcl_pose",
        compression: "none",
        throttle_rate: 0,
        queue_length: 0,
      })
  );
  socketwebrobot?.send(
      JSON.stringify({
        op: "subscribe",
        id: "subscribe:/robot_vel:10",
        type: "geometry_msgs/Twist",
        topic: "/robot_vel",
        compression: "none",
        throttle_rate: 0,
        queue_length: 0,
      })
  );
  socketwebrobot?.send(
      JSON.stringify({
        op: "advertise",
        id: "advertise:/cmd_vel:11",
        type: "geometry_msgs/Twist",
        topic: "/cmd_vel",
        latch: false,
        queue_size: 100,
      })
  );
  socketwebrobot?.send(
      JSON.stringify({
        op: "publish",
        id: "publish:/cmd_vel:12",
        topic: "/cmd_vel",
        msg: {
          linear: { x: 0, y: 0, z: 0 },
          angular: { x: 0, y: 0, z: 0 },
        },
        latch: false,
      })
  );
})
socketwebrobot.onopen(()=>{})
socketwebrobot.onmessage((a)=>{

  const hh = JSON.parse("string" == typeof a ? a : a.data);
  if(hh.topic && hh.topic == "/amcl_pose"){
    let coordinate = hh.msg.pose.pose.position; // 坐标
    if(cubPerson){
      cubPerson.position.set(coordinate.x, 0, -coordinate.y)
    }
    console.log(coordinate)
  }

})

//卸载前
onBeforeUnmount(() => {
  socketwebrobot.close(()=>{
  scene.remove(...pointArr)
  scene.remove(pathToShow)
})

})


const handleAuto = () => {
  // eyesValue.value = true;
  //controls.enabled = false;
  scene.remove(...pointArr)
  points =  handlePointData(thress.value.clientWidth,thress.value.clientHeight,PointData)
  pathCurve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0);

  pointArr =  createPoint(points);
  pointArr.forEach(item=>{
    scene.add(item)
  })
  renderPath(renderer);


  showModelAll.value = true

  const stopPoints = [-9, 0, -5.5]; // 指定停止点的索引

  const duration = 20000; // 总时间

  moveSquareAlongPath(pathCurve.getPoints(1000), duration, stopPoints);
};
//指定巡检
const handleAssign = ()=>{

  //删除环境中的点和线

  scene.remove(...pointArr)
  //删除路径
  scene.remove(pathToShow)





  proxy.$request({
    method:"post",
    url:'missionExecute/execute',
    data:{

      missionId: 1,
      missionTypeId: 1
    }
  }).then(res=>{
    //创建webSocket

//获取巡检点

    console.log(handeLineData)
    points =  handlePointData(thress.value.clientWidth,thress.value.clientHeight,handeLineData.position_list)
    pathCurve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0);

    pointArr =  createPoint(points);
    pointArr.forEach(item=>{
      scene.add(item)
    })
    renderPath(renderer);
  })

}
const changeDefaultEyes = () => {
  showModelAll.value = true

  //点信息重置
  curPoint = null

  camera.lookAt(Math.abs(basepoint.x),0,Math.abs(basepoint.z))
  camera.position.set(Math.abs(basepoint.x),10,Math.abs(basepoint.z))
  controls.target.set(Math.abs(basepoint.x),0,Math.abs(basepoint.z))
  controls.update()
  state.pointDisplay = 'none'
  state.planeDisplay = 'none'
}

const changeEyes = () => {
  //自动巡检切换视角
  showModelAll.value = true

  if (controls.enabled && !eyesValue.value) {
    return false
  }
  controls.enabled = false;
  eyesValue.value = !eyesValue.value;

  if (!eyesValue.value) {
    camera.lookAt(0, 0, 0);
    camera.position.set(0, 20, 4);
    scene.add(camera);

    controls.target.set(0, 0, 0)
    controls.update();
  } else {
    camera.position.set(0, 1, -5);

  }
};
//加载纹理贴图
const crtTexture = imgName => {
  let curTexture = maps.get(imgName);
  if (!curTexture) {
    curTexture = new THREE.TextureLoader().load(`public/models/${imgName}.jpg`);
    curTexture.flipY = false;
    curTexture.wrapS = THREE.RepeatWrapping;
    curTexture.wrapT =THREE.RepeatWrapping;
    maps.set(imgName, curTexture);
  }
  return curTexture;
};
//创建动画效果
const animate = () => {
  requestAnimationFrame(animate);

  tween && tween.update(); // 更新 TWEEN 动画
  composer&&composer.render();
  // renderer.render(scene, camera); 发光体渲染师 renderer 不在使用
  camera.updateProjectionMatrix();
};
let OutLine,composer,outlinePass;
const createOutline = () => {
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);

  outlinePass = new OutlinePass(
      new THREE.Vector2(thress.value.clientWidth, thress.value.clientHeight),
      scene,
      camera
  );
  outlinePass.visibleEdgeColor.set(0xff0000); // 可见边缘颜色
  outlinePass.hiddenEdgeColor.set(0xffffff); // 隐藏边缘颜色
  outlinePass.edgeStrength = 10; // 边缘强度
  outlinePass.edgeThickness = 2; // 边缘厚度


  composer.addPass(renderPass);
  composer.addPass(outlinePass);
}
const init = () => {
  scene = new THREE.Scene();
  //设置场景背景天蓝色


  scene.background = new THREE.Color('#89b9ea');
  renderer = new THREE.WebGLRenderer();
  renderer.physicallyCorrectLights = true
  camera = new THREE.PerspectiveCamera(
      75,
      thress.value.clientWidth / thress.value.clientHeight,
      0.01,
      1000
  );


  const ambientLight = new THREE.AmbientLight(0xffffff, 1);

  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 40, 20)
  scene.add(directionalLight);

  cubPerson =  createSquare()

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minPolarAngle=0
  controls.maxPolarAngle=Math.PI/2 - 0.05
  controls.update()
  controls.addEventListener("change", function () {
    renderer.render(scene, camera);
  });

  // OutLine =  new createOutLine(renderer, scene, camera,thress.value)
  // OutLine.init()
  const outlineData = []
  //加載模型
  let  loader =  new GLTFLoader()
  loader.load('/public/models/sceneNew.glb',gltf=>{
     let alaramCabint =  alarmCabint.map(item=>item.cabinetId)

    gltf.scene.traverse(item=>{
    if(item.isMesh){
      if (item.name.includes("cabinet")) {
        if(alaramCabint.includes(item.parent.userData.cabinetId)){
          outlineData.push(item)
        }
        cabinets.push(item);
      }
    }
    })
    let data =  gltf.scene.getObjectByName('Box')


     basepoint  =  data.position
    //计算模型距离原点的距离
    gltf.scene.position.set(Math.abs(basepoint.x),0,Math.abs(basepoint.z))
    camera.lookAt(Math.abs(basepoint.x),0,Math.abs(basepoint.z))
    camera.position.set(Math.abs(basepoint.x),10,Math.abs(basepoint.z))
    controls.target.set(Math.abs(basepoint.x),0,Math.abs(basepoint.z))
    controls.update()
    scene.add(gltf.scene)
    createOutline()

    outlinePass.selectedObjects = [...outlineData]
    composer.render()

  })





  // cubPerson.add(camera);
  scene.add(cubPerson);

  // 创建十字坐标
  scene.add(new THREE.AxesHelper(5));


  renderer.setSize(thress.value.clientWidth, thress.value.clientHeight);
  thress.value.appendChild(renderer.domElement);






  // OutLine.selectObject(outlineData)
  setTimeout(()=>{
    outlinePass.selectedObjects=[]
    outlineData.forEach(item=>{
      //释放内存
      item.material.dispose()
      item.geometry.dispose()
    })

  },2000)

  animate();

  renderer.domElement.addEventListener("dblclick", async (event) => {
    state.planeDisplay = 'none'

    if (signal.value) {
      return false
    }

    const px = event.offsetX;
    const py = event.offsetY;
    if (curCabinet) {
      //
      // //其他的物体只先是线框
      // for (let i = 0; i < scene.children.length; i++) {
      //   const element = scene.children[i];
      //
      //   if (element.isMesh) {
      //     element.visible = true
      //   }
      //
      // }
      curCabinet = null
      showModelAll.value = false
    }else{
      selectPoinet(px, py);
    }



  });
  renderer.domElement.addEventListener("mousemove", event => {
    const px = event.offsetX;
    const py = event.offsetY;
    if (signal.value || curPoint) {
      return false
    }
    selectCabinet(px,py)
  });
};
//绘制巡检点




const renderPath = async renderer => {
  arrow = new THREE.TextureLoader().load("public/arrow.png");
  arrow.wrapS = THREE.RepeatWrapping;
  arrow.anisotropy = renderer.capabilities.getMaxAnisotropy();

  registerRenderFunc("walk-way", () => {
    arrow.offset.x -= 0.02;
  });

  const material = new THREE.MeshBasicMaterial({
    map: arrow,
    blending: THREE.CustomBlending
  });

  const up = new THREE.Vector3(0, 1, 0);

  let pathPoints = new PathPointList();
  pathPoints.set(pathCurve.getPoints(1000), 0.5, 1, up, false);

  const geometry = new PathGeometry();
  geometry.update(pathPoints, {
    width: 0.1,
    arrow: true
  });

  pathToShow = new THREE.Mesh(geometry, material);
  pathToShow.position.y = -0.5;
  pathToShow.name = "path";
  scene.add(pathToShow);
};


const selectPoinet = (px, py) => {
  const x = (px / thress.value.clientWidth) * 2 - 1;
  const y = -(py / thress.value.clientHeight) * 2 + 1;
  //设置鼠标的裁剪坐标和相机的设置射线投射器
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
  const intersect = raycaster.intersectObjects(pointArr)[0];
  console.log(intersect, 'intersect')
  let intersectObj = intersect ? intersect.object : null;
  if (intersectObj) {
    state.pointPos.left = px + "px";
    state.pointPos.top = py + "px";
    state.pointDisplay = "block";

    curPoint = intersectObj;
    camera.lookAt(
        curPoint.position.x,
        0.5 ,
        curPoint.position.z
    );

    camera.position.set(
        curPoint.position.x,
        0.5 ,
        curPoint.position.z
    );

    controls.target.set(
        curPoint.position.x - 0.1,
        0.5 ,
        curPoint.position.z
    );
    controls.update();
    controls.enabled = true; // 启用轨道控制

  } else {
    curPoint = null
    state.pointDisplay = "none";

  }
}
// const cabintList  =  ref([])
onBeforeMount(()=>{
 // getCabint()
})
onMounted(() => {
  init();
  //添加响应式事件

});

const selectCabinet = (px, py) => {
  const x = (px / thress.value.clientWidth) * 2 - 1;
  const y = -(py / thress.value.clientHeight) * 2 + 1;
  //设置鼠标的裁剪坐标和相机的设置射线投射器
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
  //获取射线投射器和场景中对象的交点

  const intersect = raycaster.intersectObjects(cabinets)[0];

  let intersectObj = intersect ? intersect.object : null;


//如果当前对象和交叉对象不同 则取消选中状态
  if (curCabinet && curCabinet !== intersectObj) {
    curCabinet.material.map = crtTexture("cabinet");
  }
  //如果存在交叉对象 则进行选中
  if (intersectObj) {
    state.planePos.left = px + "px";
    state.planePos.top = py + "px";
    //超出可视区域则显示在左边
const data =  cabinetData.find(item=>item.id==intersectObj.parent.userData.cabinetId)
    if(data){
      state.curCabinet = {

        name:data.name+'机柜',
        shelfNum: data.shelfNum,
        usedNum:data.usedNum,
        cabinetU: data.cabinetU,
        cabinetId:data.id
      };
    }else{
      return
    }

    // OutLine.selectObject(intersectObj)

    if (intersectObj !== curCabinet) {

     // intersectObj.material.map = crtTexture("cabinet-hover");

      state.planeDisplay = "block";
      thress.value.style.cursor = "pointer";
      curCabinet = intersectObj;
    }


    //如果不存在交叉对象 则取消选中状态
  } else if (curCabinet) {
    curCabinet = null;
    thress.value.style.cursor = "default";
    state.planeDisplay = "none";
  }

};
const getCabint = ()=>{
    proxy.$request({
      method:"post",
      url:"home/selectRackListByDataCenterId/1",

    }).then(res=>{
      console.log(res,'re')
      cabintList.value =  res.data
    })
}
//生成热力图
let heatmapPlane = null
let heatmapPlaneMois = null
const generateHeatMap = ()=>{
  console.log(heatmapPlane,'wefw')
  scene.remove(heatmapPlaneMois)

  if(heatmapPlane){
    scene.remove(heatmapPlane)
    heatmapPlane = null
    return  false
  }
  function handlePosint(){
    return  tempData.map(items=>{
      let data =  PointData.find(item=>items.positionId==item.robotPositionId)

      if(data){
        items = {
          ...items,
          ...data.position,
          y:-data.position.y
        }
      }
      console.log(items)
      return items
    })
  }
  heatmapPlane = addHeatmapPlane(scene,handlePosint(),basepoint)
}

const generateMois = ()=>{
  function handlePosint(){
    return  mosi.map(items=>{
      let data =  PointData.find(item=>items.positionId==item.robotPositionId)

      if(data){
        items = {
          ...items,
          ...data.position,
          y:-data.position.y
        }
      }
      console.log(items)
      return items
    })
  }

  scene.remove(heatmapPlane)
  if(heatmapPlaneMois){
    scene.remove(heatmapPlaneMois)
    heatmapPlaneMois = null
    return  false
  }

  heatmapPlaneMois=  addHeatmapPlane(scene,handlePosint(),basepoint)
}
window.addEventListener("resize", () => {
  renderer.setSize(thress.value.clientWidth, thress.value.clientHeight);
  camera.aspect = thress.value.clientWidth / thress.value.clientHeight;
  camera.updateProjectionMatrix();
  renderPath(renderer);
});
</script>

<style scoped lang="scss">
.three-dom {
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
