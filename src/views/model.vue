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
    const container = ref(null);
    let modelObject = null;
    let  mixer = ''
    onMounted(() => {
      initThree();
    });
    var clock = new THREE.Clock();
    const initThree = () => {
      // 获取容器元素
      const containerElement = container.value;

      // 创建场景、相机和渲染器
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, containerElement.clientWidth / containerElement.clientHeight, 0.001, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
      containerElement.appendChild(renderer.domElement);
      let controls = new OrbitControls( camera, renderer.domElement );
      controls.target.set( 0, 0.5, 0 );
      controls.enablePan = false;
      // 设置相机位置
      camera.position.set( 5, 2, 8 );

      // 添加环境光
      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);
      let pointLight = new THREE.PointLight( 0xffffff, 1 );
      pointLight.position.copy( camera.position );
      scene.add( pointLight);



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

      var dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath( '/src/draco/gltf/' );
      const objLoader = new GLTFLoader();
      objLoader.setDRACOLoader( dracoLoader );
      // 加载 OBJ 文件
      objLoader.load('/public/gltf/LittlestTokyo.glb', (object) => {

        object.scene.position.set( 1, 1, 0 );
        object.scene.scale.set( 0.01, 0.01, 0.01 );
        object.scene.traverse((child) => {
          if (child.isMesh) {
            child.material.envMap = envMap;
          }
        });
        console.log(object,'object.animations')
       mixer = new THREE.AnimationMixer( object.scene );
        mixer.clipAction( object.animations[ 0 ] ).play();
        scene.add(object.scene);
      }, undefined, (error) => {
        console.error('An error happened while loading OBJ file:', error);
      });

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
        var delta = clock.getDelta();
        if(mixer){
          mixer.update( delta );
        }
        controls.update( delta );
      };
      animate()
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
