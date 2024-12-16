<template>
  <div ref="container" class="three-container"></div>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
export default {
  name: 'ThreeScene',
  setup() {
    let skeleton,camera;
    const container = ref(null);
    let modelObject = null;
    let  mixer = '';
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();
    let models=[]
    onMounted(() => {
      initThree();
    });
    var clock = new THREE.Clock();
    const initThree = () => {
      // 获取容器元素
      const containerElement = container.value;

      // 创建场景、相机和渲染器
      const scene = new THREE.Scene();
      scene.background = new THREE.Color( 0xa0a0a0 );

      camera = new THREE.PerspectiveCamera(75, containerElement.clientWidth / containerElement.clientHeight, 0.001, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
      containerElement.appendChild(renderer.domElement);
      let controls = new OrbitControls( camera, renderer.domElement );
      controls.target.set( 0, 0.5, 0 );
      controls.enablePan = false;
      // 设置相机位置
      camera.position.set( 1, 2, - 3 );
      camera.lookAt( 0, 1, 0 );
      var hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
      hemiLight.position.set( 0, 20, 0 );
      scene.add( hemiLight );
      // 添加环境光
      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);
      var dirLight = new THREE.DirectionalLight( 0xffffff );
      dirLight.position.set( - 3, 10, - 10 );
      //开启阴影
      dirLight.castShadow = true;
      //创建阴影
      dirLight.shadow.camera.top = 2;
      dirLight.shadow.camera.bottom = - 2;
      dirLight.shadow.camera.left = - 2;
      dirLight.shadow.camera.right = 2;
      dirLight.shadow.camera.near = 0.1;
      dirLight.shadow.camera.far = 40;
      scene.add( dirLight );


      var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
      mesh.rotation.x = - Math.PI / 2;
      mesh.receiveShadow = true;
      scene.add( mesh );
      //创建盒子
      // const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
      // const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      // const box = new THREE.Mesh(boxGeometry, boxMaterial);
      // scene.add(box);
      //加载环境贴图

      // envmap
      var path = 'textures/cube/Park2/';
      var format = '.jpg';
      var envMap = new THREE.CubeTextureLoader().setPath('textures/cube/Park2/').load( [
       'posx' + format,'negx' + format, 'posy' + format, 'negy' + format,
        'posz' + format,  'negz' + format
      ] );

      // var dracoLoader = new DRACOLoader();
      // dracoLoader.setDecoderPath( '/src/draco/gltf/' );
    const objLoader = new GLTFLoader();
      // objLoader.setDRACOLoader( dracoLoader );
      // 加载 OBJ 文件
      objLoader.load('/public/gltf/Soldier.glb', (object) => {
        object.scene.traverse(gltf=>{

          if(gltf.isMesh){
            gltf.material.transparent = true;
            gltf.material.opacity = 0.2;
            models.push(gltf)

          }
        })

        scene.add(object.scene);
      }, undefined, (error) => {
        console.error('An error happened while loading OBJ file:', error);
      });


      // 添加鼠标点击事件监听器
      window.addEventListener('click', onMouseClick, false);

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

    const onMouseClick = (event) => {
      // 将鼠标位置归一化到 [-1, 1] 范围内
      mouse.x = (event.clientX / container.value.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / container.value.clientHeight) * 2 + 1;

      // 更新射线投射器
      raycaster.setFromCamera(mouse, camera);

      // 计算所有与射线相交的对象
      const intersects = raycaster.intersectObjects(models);
      console.log(intersects,'intersects')
      if (intersects.length > 0) {
        // 获取第一个相交的对象
        const selectedModel = intersects[0].object;

        // 遍历所有模型，设置透明度
        models.forEach((model) => {
          console.log(model.uuid === selectedModel.uuid,'model.uuid === selectedModel.uuid')
          if (model.uuid === selectedModel.uuid) {
            model.material.transparent = false;
            model.material.opacity = 1;
          } else {
            model.material.transparent = true;
            model.material.opacity = 0.1;

          }
        });
      }
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
