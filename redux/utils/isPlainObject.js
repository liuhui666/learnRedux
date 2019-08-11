/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 * 
 * 工具方法-->检测是不是简单对象  
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
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}
