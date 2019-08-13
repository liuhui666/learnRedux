/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 * 
 * 工具方法-->检测是不是简单对象（纯对象）  因为redux要求action和state是个纯对象 
 * 
 * 实质上就是判断__proto__是不是直接等于Object.prototype
 * 
 * 这段写法 有点不是太明白
 * 
 * 为啥不能  return Object.getPrototypeOf(obj)===Object.protptype
 */
export default function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false

  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    // 获取最顶级的原型，如果是自身，就说明是纯对象
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}
