<template>
  <div style="height:100%;width:100%;display: flex;">
    <div v-if="showModelAll" ref="thress" class="three-dom">

      <div
          id="plane"
          :style="{left: state.planePos.left,top:state.planePos.top,right: state.planePos.right,display: state.planeDisplay}"
      >
        <p>机柜名称：{{ state.curCabinet.name }}</p>
        <p>机柜温度：{{ state.curCabinet.temperature }}°</p>
        <p>使用情况：{{ state.curCabinet.count }} / {{ state.curCabinet.capacity }}</p>
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
    <cabint v-if="!showModelAll" class="three-dom"></cabint>

    <el-button @click="handleAuto" style="position: absolute; top: 10px; left: 10px">自动巡检</el-button>
    <!--    <el-button v-if="!curPoint" @click="changeEyes" style="position: absolute; top: 10px; left:100px">切换视角</el-button>-->
    <el-button @click="changeDefaultEyes" style="position: absolute; top: 10px; left:100px">返回默认视角</el-button>
  </div>

</template>

<script setup>
import {ref, onMounted, reactive, watch, nextTick} from "vue";
import cabint from './cabint.vue'

import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";


import * as TWEEN from "@tweenjs/tween.js";
import {PathGeometry, PathPointList} from "three.path";

const thress = ref(null);
let showModelAll = ref(true)
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
let pointArr = [
  2,
  0,
  -5.5,
  -9,
  0,
  -5.5,
  -9,
  0,
  -3,
  9,
  0,
  -3,
  9,
  0,
  2,
  -5,
  0,
  2
  // 其他坐标点...
];
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

const initPathPoints = () => {
  points = [];
  for (let i = 0; i < pointArr.length; i += 3) {
    points.push(
        new THREE.Vector3(pointArr[i], pointArr[i + 1], pointArr[i + 2])
    );
  }

  pathCurve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0);
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
        controls.enabled = true;
        signal.value = false
        console.log("路径结束");
      })
      .start();
};

const handleAuto = () => {
  // eyesValue.value = true;
  //controls.enabled = false;
  showModelAll.value = true

  const stopPoints = [-9, 0, -5.5]; // 指定停止点的索引
  const points = pathCurve.getPoints(1000);
  const duration = 12000; // 总时间

  moveSquareAlongPath(points, duration, stopPoints);
};
const changeDefaultEyes = () => {
  showModelAll.value = true

  //点信息重置
  curPoint = null

  camera.lookAt(0, 0, 0);
  camera.position.set(0, 20, 4);
  scene.add(camera);

  controls.target.set(0, 0, 0)
  controls.update();
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

  renderer.render(scene, camera);
  camera.updateProjectionMatrix();
};
const init = () => {
  scene = new THREE.Scene();
  //设置场景背景天蓝色


  scene.background = new THREE.Color('#89b9ea');
  renderer = new THREE.WebGLRenderer();
  renderer.physicallyCorrectLights = true
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);

  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 40, 20)
  scene.add(directionalLight);
  initPathPoints();
  createSquare();
  renderPath(renderer);
  createPoint();

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
      "/public/models/machineRoom.gltf",
      function (gltf) {
        gltf.scene.children.forEach(item => {
          const {map, color} = item.material;
          if (map) {
            item.material = new THREE.MeshBasicMaterial({
              map: crtTexture(item.name.split("-")[0]),
              side: THREE.DoubleSide // 设置模型只能查看正面
            });
          } else {
            item.material = new THREE.MeshBasicMaterial({
              color,
              side: THREE.DoubleSide
            });
          }

          if (item.name.includes("cabinet")) {
            cabinets.push(item);
          }
        });
        modelList.push(gltf.scene)
        scene.add(...gltf.scene.children);
        // scene.add(pathToShow); // 确保路径贴图被添加到场景中
      },
      num => {
      },
      err => {
      }
  );

  camera = new THREE.PerspectiveCamera(
      75,
      thress.value.clientWidth / thress.value.clientHeight,
      0.01,
      1000
  );

  camera.lookAt(0, 0, 0);
  camera.position.set(0, 20, 4);
  // cubPerson.add(camera);
  scene.add(cubPerson);

  // 创建十字坐标
  scene.add(new THREE.AxesHelper(5));


  renderer.setSize(thress.value.clientWidth, thress.value.clientHeight);
  thress.value.appendChild(renderer.domElement);


  controls = new OrbitControls(camera, renderer.domElement);

  controls.addEventListener("change", function () {
    renderer.render(scene, camera);
  });

  animate();

  renderer.domElement.addEventListener("dblclick", async (event) => {
    state.planeDisplay = 'none'
    modelList[0].visible = false
    if (signal.value) {
      return false
    }

    const px = event.offsetX;
    const py = event.offsetY;
    //selectCabinet(px, py);

    // selectDevice(px,py)
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
    selectCabinet(px, py);
  });
};
//绘制巡检点

const createSquare = () => {
  const geoPerson = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const matPeron = new THREE.MeshBasicMaterial({color: 0x00ff00});
  cubPerson = new THREE.Mesh(geoPerson, matPeron);
  cubPerson.position.set(2, 0.3, -5.5);
  scene.add(cubPerson);
};
const createPoint = () => {

  for (let i = 0; i < points.length; i++) {
    const geoPerson = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const matPeron = new THREE.MeshBasicMaterial({color: "red"});
    let point = new THREE.Mesh(geoPerson, matPeron);
    point.position.copy(points[i])
    point.position.y = 0.2
    scene.add(point);
    pointsArray.push(point);
  }
};

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
  pathToShow.position.y = 0.2;
  pathToShow.name = "path";
  scene.add(pathToShow);
};

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
    if (px + 200 >= thress.value.clientWidth) {
      state.planePos.right = px + 200 - thress.value.clientWidth
    }
    state.curCabinet = {
      name: `测试机柜${curCabinet?.name.split("-")[1]}`,
      temperature: 12,
      capacity: 20,
      count: 5
    };
       console.log(intersectObj !== curCabinet,'intersectObj !== curCabinet')
    if (intersectObj !== curCabinet) {

      intersectObj.material.map = crtTexture("cabinet-hover");

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
const selectPoinet = (px, py) => {
  const x = (px / thress.value.clientWidth) * 2 - 1;
  const y = -(py / thress.value.clientHeight) * 2 + 1;
  //设置鼠标的裁剪坐标和相机的设置射线投射器
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
  const intersect = raycaster.intersectObjects(pointsArray)[0];
  console.log(intersect, 'intersect')
  let intersectObj = intersect ? intersect.object : null;
  if (intersectObj) {
    state.pointPos.left = px + "px";
    state.pointPos.top = py + "px";
    state.pointDisplay = "block";

    curPoint = intersectObj;
    camera.lookAt(
        curPoint.position.x,
        curPoint.position.y + 1,
        curPoint.position.z
    );

    camera.position.set(
        curPoint.position.x,
        curPoint.position.y + 1,
        curPoint.position.z
    );

    controls.target.set(
        curPoint.position.x - 0.1,
        curPoint.position.y + 1,
        curPoint.position.z
    );
    controls.update();
    controls.enabled = true; // 启用轨道控制

  } else {
    curPoint = null
    state.pointDisplay = "none";

  }
}

onMounted(() => {
  init();
});
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
