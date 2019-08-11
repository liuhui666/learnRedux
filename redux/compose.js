/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

export default function compose(...funcs) {
  // 多理解理解
  //这个函数主要作用就是将多个函数连接起来，将一个函数的返回值作为另一个函数的传参进行计算，得出最终的返回值。
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
// 以下说法 不太明白
// 如果想要其从左向右执行也很简单，做一下顺序的颠倒即可。

// ===> 转换前 return a(b.apply(undefined, arguments));
// ===> 转换后 return b(a.apply(undefined, arguments));
