import * as THREE from 'three'
//加载模型
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
const loader = {
    obj:new OBJLoader(),
    gltf:new GLTFLoader(),
}


//加载模型
export const loadingModel=(url,type='gltf') =>{
    const gltfLoader =  loader[type]
    return new Promise((resolve, reject) => {
        gltfLoader.load(url, (gltf) => {
            resolve(gltf)
        })
    })



}
