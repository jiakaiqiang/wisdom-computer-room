//添加监听事件
export const addEvent = (targetObject, eventName, callback)=>{
    targetObject.addEventListener(eventName,callback)
}
export const removeEvent = (targetObject, eventName, callback)=> {
    targetObject.removeEventListener(eventName, callback)
}
//触发事件
export const triggerEvent = (targetObject, eventName, data)=>{
    let event = new CustomEvent(eventName, {
        detail: data
    });
    targetObject.dispatchEvent(event);
}