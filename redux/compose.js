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

/**
 * 我们一步一步分解一下, func3 初始化的值为 funcs = [fn1,fn2,fn3], reduce执行

   第一步时 

　　a = fn1

　　b = fn2 

       a(b(...args)) = fn1(fn2(...args))

　　(...args) => a(b(...args))   = (...args) = > fn1(fn2(...args))

  第二步时

      a =  (...ag) = > fn1(fn2(...ag))  // 避免和后面混淆，rest参数名修改为  ag

      b = fn3

      a(b(...args)) = a( fn3(...args) )  = fn1(fn2(    fn3(...args)   ))  // 这一步是关键，b(...args)执行后作为a函数的入参，也就是 ...ag = fn3(...args)

　  (...args) => a(b(...args))   = (...args) = > fn1(fn2(fn3(...args))) 

 

   所以最后返回的就是这样的一个函数  (...args) = > fn1(fn2(fn3(...args))) 

   再多函数，也是以此类推。　　
 */
