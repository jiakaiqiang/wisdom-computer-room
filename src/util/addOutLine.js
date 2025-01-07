import {EffectComposer} from "three/addons/postprocessing/EffectComposer.js";
import {RenderPass} from "three/addons/postprocessing/RenderPass.js";
import {OutlinePass} from "three/addons/postprocessing/OutlinePass.js";
import * as THREE from "three";
/*
* renderer 渲染器
* scene  场景
* camera 相机
* domElement 渲染dom元素
*
* */
class createOutLine {
    constructor(  renderer, scene, camera,domElement) {
        this.composer = null;
        this.outlinePass = null;
        this.renderer = renderer;
        this.scene = renderer;
        this.camera = camera
        this.domElement = domElement;
    }
    init() {
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);

        this.outlinePass = new OutlinePass(
            new THREE.Vector2(this.domElement.clientWidth, this.domElement.clientHeight),
            this.scene,
            this.camera
        );
        this.outlinePass.visibleEdgeColor.set(0xff0000); // 可见边缘颜色
        this.outlinePass.hiddenEdgeColor.set(0xffffff); // 隐藏边缘颜色
        this.outlinePass.edgeStrength = 5; // 边缘强度
        this.outlinePass.edgeThickness = 1; // 边缘厚度
        this.composer.addPass(renderPass);
        this.composer.addPass(this.outlinePass);
    }
    selectObject(mesh){
        this.outlinePass.selectedObjects = mesh instanceof  Array ? mesh : [mesh];
    }
    dispose() {
        this.composer.dispose();
        this.outlinePass.dispose();
    }
    removeObject(){
        this.outlinePass.selectedObjects = [];
        //释放资源
        this.dispose()
    }
    render(){
        this.composer&&this.composer.render();
    }
}
export default  createOutLine