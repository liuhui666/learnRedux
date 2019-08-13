import $$observable from 'symbol-observable'

import ActionTypes from './utils/actionTypes'
import isPlainObject from './utils/isPlainObject'

/**
 * 
 * @param {*} reducer 
 * @param {*} preloadedState 
 * @param {*} enhancer 
 * 使用 redux 最主要的 API，就是这个 createStore，它用于创建一个 redux store，为你提供状态管理。
// 它接受三个参数（第二三个可选），第一个是 reducer，用于改变 redux store 的状态；第二个是初始化的 store,
// 即最开始时候 store 的快照；第三个参数是由 applyMiddleware 函数返回的 enhancer 对象，使用中间件必须
// 提供的参数。
 */
export default function createStore(reducer, preloadedState, enhancer) {
  // 1、判断如果传递多个enhancer会报错
  if (
    (typeof preloadedState === 'function' && typeof enhancer === 'function') ||
    (typeof enhancer === 'function' && typeof arguments[3] === 'function')
  ) {
    throw new Error(
      'It looks like you are passing several store enhancers to ' +
        'createStore(). This is not supported. Instead, compose them ' +
        'together to a single function.'
    )
  }

  //2、 第二个参数不传的情况
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  // 3、enhancer必须是function
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }

    return enhancer(createStore)(reducer, preloadedState)
 /**
  *     enhancer =(createStore)=>{  
        return (reducer, preloadedState)=>{   }
        常见的enhancer 有redux-thunk 要配合applyMiddleware使用。applyMiddleware的作用就是把这些enhancer格式化成符合redux要求的enhancer
  *  */ 
 }

  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }

  let currentReducer = reducer //存储当前的reducer
  let currentState = preloadedState //存储当前的store 即state
  let currentListeners = [] //用于存储通过 store.subscribe 注册的当前的所有订阅者。
  let nextListeners = currentListeners //新的 listeners 数组，确保不直接修改 listeners。
  let isDispatching = false //作为锁来用  redux是一个统一的状态管理容器，要保证数据的一致性，所以在同一时间只能做一次数据修改。如果两个action同时修改会造成巨大的灾难？？？什么灾难呢。


  /** 
   * 【没错 就是有这样的疑问，不过这个case 没太懂】 
   * 
   * 看到这里可能有小伙伴们对currentListeners和nextListeners有这么一个疑问？
   * 函数dispatch里面将二者合并成一个引用，为啥这里有啥给他俩分开？直接用currentListeners不可以吗？
   * 这里这样做其实也是为了数据的一致性，因为有这么一种的情况存在。
   * 当redux在通知所有订阅者的时候，此时又有一个新的订阅者加进来了。
   * 如果只用currentListeners的话，当新的订阅者插进来的时候，就会打乱原有的顺序，从而引发一些严重的问题。
   * 
   * // 顾名思义，确保 nextListeners 可以被修改，当 nextListeners 与 currentListeners 指向同一个数组的时候
  // 让 nextListeners 成为 currentListeners 的副本。防止修改 nextListeners 导致 currentListeners 发生变化。
  // 一开始我也不是很明白为什么会存在 nextListeners，因为后面 dispatch 函数中还是直接把 nextListeners 赋值给了 currentListeners。
  // 直接使用 currentListeners 也是可以的。后来去 redux 的 repo 搜了搜，发现了一个 issue（https://github.com/reduxjs/redux/issues/2157） 讲述了这个做法的理由。
  // 提交这段代码的作者的解释（https://github.com/reduxjs/redux/commit/c031c0a8d900e0e95a4915ecc0f96c6fe2d6e92b）是防止 Array.slice 的滥用，只有在必要的时候调用 Array.slice 方法来复制 listeners。
  // 以前的做法是每次 dispatch 都要 slice 一次，导致了性能的降低吧。
   */
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) { //如果是同一个引用 就做一个浅拷贝   为什么要搞一个nextListeners和currentListeners，为什么要做浅拷贝
      nextListeners = currentListeners.slice()
    }
  }

  function getState() {  //闭包的用法
    /**
     *   这个比较简单了
     *   reducer正在操作的时候 不可以getState
     *    返回当前的state
     * 
     *   可以直接对createStore生成的state进行修改，但是通知订阅者进行数据更新。redux也不允许这么做
     */
    if (isDispatching) { 
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
          'The reducer has already received the state as an argument. ' +
          'Pass it down from the top reducer instead of reading it from the store.'
      )
    }

    return currentState
  }

  /**
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {
    /**
     * 先做了两个判断 
     * 1、判断监听者是否为函数 
     * 2、是否有reducer正在进行数据修改
     */
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.')
    }

    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
          'If you would like to be notified after the store has been updated, subscribe from a ' +
          'component and invoke store.getState() in the callback to access the latest state. ' +
          'See https://redux.js.org/api-reference/store#subscribelistener for more details.'
      )
    }

    let isSubscribed = true  //表示该订阅者在订阅中

    ensureCanMutateNextListeners()
    nextListeners.push(listener) // 将订阅者加入监听到队列中

    // 
    /**
     * 返回一个 取消监听的方法  依旧要先判断
     * 1、是否订阅状态
     * 2、是否有reducer正在处理数据
     * 3、删除订阅方法
     */
    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. ' +
            'See https://redux.js.org/api-reference/store#subscribelistener for more details.'
        )
      }

      isSubscribed = false

      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
      currentListeners = null
    }
  }

  function dispatch(action) {
    /**
     * 一 判断actoin是否是简单对象
     * 二 判断action的type是否存在
     * 三 判断当前是否有其他的reducer操作
     *  */ 

    if (!isPlainObject(action)) { //如果action不是简单对象 报错
      throw new Error(
        'Actions must be plain objects. ' +
          'Use custom middleware for async actions.'
      )
    }

    if (typeof action.type === 'undefined') {//action 必须有type
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
          'Have you misspelled a constant?'
      )
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      isDispatching = true
      currentState = currentReducer(currentState, action) //得到的state值赋值给currentState   （reducer返回的是个新state不是）
    } finally {
      isDispatching = false 
    }

    const listeners = (currentListeners = nextListeners) //一一通知订阅者做数据更新  //这个listener哪里的？？
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }
// 返回当前所使用的 action，这一步是中间件嵌套使用的关键，很重要。
    return action
  }

  /**
   * 用来替换reducer的  项目里很少能用到
   * 用于动态替换当前的 reducers。适用于按需加载，代码拆分等场景
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    currentReducer = nextReducer

    // This action has a similiar effect to ActionTypes.INIT.
    // Any reducers that existed in both the new and old rootReducer
    // will receive the previous state. This effectively populates
    // the new state tree with any relevant data from the old one.
    dispatch({ type: ActionTypes.REPLACE })
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */
  function observable() {
    const outerSubscribe = subscribe
    return {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe(observer) {
        if (typeof observer !== 'object' || observer === null) {
          throw new TypeError('Expected the observer to be an object.')
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }

  /**
   * 为啥要有这么一行代码？原因很简单，假设我们没有这样代码，此时currentState就是undefined的，
   * 也就我说我们没有默认值了，当我们dispatch一个action的时候，就无法在currentState基础上做更新。
   * 所以需要拿到所有reducer默认的state，这样后续的dispatch一个action的时候，才可以更新我们的state。
   */
  dispatch({ type: ActionTypes.INIT })

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }

}
