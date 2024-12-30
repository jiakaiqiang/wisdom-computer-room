/*
* 创建axios 请求
*
* */
import {getToken,removeToken}  from '@/util/token.js'
import website from '@/config/website'
import axios from 'axios'
import errorCode from '@/config/errorCode.js'
import {ElMessage} from "element-plus";
//白名单地址

const instacence = axios.create({
  baseURL: '/api',
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})
axios.defaults.headers["post"]["Content-Type"] = "application/json";
axios.defaults.headers["put"]["Content-Type"] = "application/json";
axios.defaults.headers["patch"]["Content-Type"] = "application/json";
axios.defaults.headers["post"]["Content-Type"] =
    "application/x-www-form-urlencoded";

instacence.interceptors.request.use(config => {
    if (getToken()) {
        config.headers[website.Authorization] =
            "Bearer " + getToken();
    }
    return config
})

instacence.interceptors.response.use(res => {
    const  code =  res
    console.log(code,'code')
    if(code.status!=200){
        ElMessage.error(errorCode[code])
    }

    return res.data
})

export default instacence