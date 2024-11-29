import {createRouter,createWebHashHistory} from 'vue-router'



let routes =[
    {
        path:'/',
        name:'basicLayout',
        meta: {
            title: "基础"
        },
        redirect:'/Visualization-1',
        children:[
            {
                path:'Visualization',
                name:'Visualization',
                component:()=>import('@/views/Visualization.vue')
            },
            {
                path:'Visualization-1',
                name:'Visualization',
                component:()=>import('@/views/Visualization-1.vue')
            }
        ]
    }

]

export {routes}
// 创建路由实例
const router =  createRouter({
    history:createWebHashHistory(),
    routes:routes
})
export default router