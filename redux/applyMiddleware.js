import compose from './compose'

/**
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    //1、 通过createStore方法创建出一个store
    const store = createStore(...args)
    // 2、定一个dispatch，如果在中间件构造过程中调用，抛出错误提示
    let dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.'
      )
    }
// 3、定义middlewareAPI，有两个方法，一个是getState，另一个是dispatch，将其作为中间件调用的store的桥接
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    // 4、middlewares调用Array.prototype.map进行改造，存放在chain
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    // 5、用compose整合chain数组，并赋值给dispatch
    dispatch = compose(...chain)(store.dispatch)
// 6、将新的dispatch替换原先的store.dispatch
    return {
      ...store,
      dispatch
    }
  }
}


// redux-thunk 源码   需要结合第三方中间件 看一下
// function createThunkMiddleware(extraArgument) {
//   return ({ dispatch, getState }) => next => action => {
//     if (typeof action === 'function') {
//       return action(dispatch, getState, extraArgument);
//     }

//     return next(action);
//   };
// }

// const thunk = createThunkMiddleware();
// thunk.withExtraArgument = createThunkMiddleware;

// export default thunk;
