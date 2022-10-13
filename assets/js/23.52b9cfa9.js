(window.webpackJsonp=window.webpackJsonp||[]).push([[23],{569:function(t,s,a){"use strict";a.r(s);var e=a(11),r=Object(e.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("div",{staticClass:"custom-block tip"},[a("p",{staticClass:"title"}),a("p",[t._v("在理解了 redux 的作用原理后，我们来看看 redux 的基本概念。")])]),a("h3",{attrs:{id:"state"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#state"}},[t._v("#")]),t._v(" state")]),t._v(" "),a("p",[a("code",[t._v("state")]),t._v("：state 是状态管理的根本。在 redux 中，有唯一的状态树 state，为整个应用共享。本质上是一个普通对象。处于程序逻辑中，无法直接调用。")]),t._v(" "),a("h3",{attrs:{id:"store"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#store"}},[t._v("#")]),t._v(" store")]),t._v(" "),a("p",[a("code",[t._v("store")]),t._v("：store 是 state 的管理者，一个应用同样只有唯一的 store，管理着唯一的 state。store 包含下列四个函数：")]),t._v(" "),a("blockquote",[a("p",[a("code",[t._v("getState()")]),t._v(" ：用于获取整个 state")]),t._v(" "),a("p",[a("code",[t._v("dispatch(action)")]),t._v(" ：View 触发 action 改变 state 的"),a("strong",[t._v("唯一途径")]),t._v("，请注意我用了"),a("strong",[t._v("唯一")]),t._v("这个词")]),t._v(" "),a("p",[a("code",[t._v("subscribe(listener)")]),t._v(" ：可以理解成是 DOM 中的 addEventListener ，也就是我在上一篇里说过的发布订阅模式中的订阅方法，在 redux 的使用中，这个方法通常不需要手动使用，一般会放在 setState 方法中。")]),t._v(" "),a("p",[a("code",[t._v("replaceReducer(nextReducer)")]),t._v(" ：这个不太常用，一般在 Webpack Code-Splitting 按需加载的时候用获取 state 的方式：")])]),t._v(" "),a("p",[t._v("这几个方法中，"),a("code",[t._v("dispatch")]),t._v("函数略微难理解一点，单独提出来说说。")]),t._v(" "),a("h3",{attrs:{id:"dispatch"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#dispatch"}},[t._v("#")]),t._v(" dispatch")]),t._v(" "),a("p",[a("code",[t._v("dispatch(action)")]),t._v("用于 View 层想要更改 state 的操作，发布订阅模式中的发布操作。用于通知 store 做相应变更。")]),t._v(" "),a("p",[t._v("那么怎么让 store 知道变更哪一个属性呢？这里就要提到"),a("code",[t._v("action")]),t._v("了。"),a("code",[t._v("action")]),t._v("实际上是一个包含了"),a("code",[t._v("type")]),t._v("属性以及"),a("code",[t._v("payload")]),t._v("对象属性（这个叫载荷，不是必须的，但是在规范里推荐使用）的普通对象。其中"),a("code",[t._v("type")]),t._v("属性定义了应该进行的操作名。")]),t._v(" "),a("p",[t._v("我们从这里可以看出，由于载荷的存在，通常我们需要对"),a("code",[t._v("action")]),t._v("进行一些处理，因此，通常"),a("code",[t._v("action")]),t._v("对象由一个返回"),a("code",[t._v("action")]),t._v("对象的普通函数生成，一般我们称之为"),a("code",[t._v("actionCreator")]),t._v("函数。")]),t._v(" "),a("p",[a("code",[t._v("actionCreator")]),t._v("函数不仅可以直接返回"),a("code",[t._v("action")]),t._v("对象，也可以返回一个闭包，闭包传入的参数可以为我们刚才介绍的 store 中的四个函数，最终结果必须返回一个"),a("code",[t._v("action")]),t._v("对象。")]),t._v(" "),a("blockquote",[a("p",[t._v("注："),a("code",[t._v("actionCreator")]),t._v("函数不能直接当做参数传入 dispatch 中，必须引入中间件"),a("code",[t._v("redux-thunk")]),t._v("。")])]),t._v(" "),a("h3",{attrs:{id:"createstore"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#createstore"}},[t._v("#")]),t._v(" createStore")]),t._v(" "),a("p",[t._v("于是问题来了，既然"),a("code",[t._v("state")]),t._v("是由"),a("code",[t._v("store")]),t._v("生成和管理的，那么这个"),a("code",[t._v("store")]),t._v("又是怎么来的呢？生成 store 的方式又需要用到一个新的函数："),a("code",[t._v("createStore(reducer, intialState, applyMiddleware)")]),t._v("。（"),a("code",[t._v("initialState")]),t._v("参数可以设置初始 state，非必须。"),a("code",[t._v("applyMiddleware(middlewares)")]),t._v("方法用于引入中间件，这里按住不表）这里又引出来一个新东西：reducer，这是干什么的呢？")]),t._v(" "),a("h3",{attrs:{id:"reducer"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#reducer"}},[t._v("#")]),t._v(" reducer")]),t._v(" "),a("p",[t._v("刚刚说到的 action ，我的简单的理解是：type 的值就是函数名，payload 的值就是函数的传入参数。那么这个特殊的“函数”在哪里执行呢？redux 的思想是：当 View 层调用"),a("code",[t._v("dispatch")]),t._v("方法，发出相应的"),a("code",[t._v("action")]),t._v("给"),a("code",[t._v("store")]),t._v("，"),a("code",[t._v("store")]),t._v(" 收到 "),a("code",[t._v("action")]),t._v(" 以后，必须给出一个新的 "),a("code",[t._v("state")]),t._v("，这样 View 才会发生变化。这种 "),a("code",[t._v("state")]),t._v(" 的计算过程就叫做 "),a("code",[t._v("reducer")]),t._v("。")]),t._v(" "),a("p",[a("code",[t._v("reducer(oldState, action)")]),t._v("是一个纯函数（指任何时候输入同一个数据，返回的数据永远都相同，也就是说 reducer 函数中的处理不能带有任何异步操作），"),a("code",[t._v("reducer")]),t._v("负责对"),a("code",[t._v("state")]),t._v("操作，接收旧的 state 和 action，根据"),a("code",[t._v("action.type")]),t._v("的类型以及"),a("code",[t._v("action.payload")]),t._v("中的数据，处理 state 并返回。")]),t._v(" "),a("div",{staticClass:"language-js line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("reducer")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("state"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" action")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("switch")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("action"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("type"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("case")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'ADD'")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("...")]),t._v("state"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        "),a("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" state"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("count "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v(" action"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("payload"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("num"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("case")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'DELETE'")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("...")]),t._v("state"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        "),a("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" state"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("count "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v(" action"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("payload"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("num"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("default")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" state"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br"),a("span",{staticClass:"line-number"},[t._v("7")]),a("br"),a("span",{staticClass:"line-number"},[t._v("8")]),a("br"),a("span",{staticClass:"line-number"},[t._v("9")]),a("br"),a("span",{staticClass:"line-number"},[t._v("10")]),a("br"),a("span",{staticClass:"line-number"},[t._v("11")]),a("br"),a("span",{staticClass:"line-number"},[t._v("12")]),a("br"),a("span",{staticClass:"line-number"},[t._v("13")]),a("br"),a("span",{staticClass:"line-number"},[t._v("14")]),a("br"),a("span",{staticClass:"line-number"},[t._v("15")]),a("br"),a("span",{staticClass:"line-number"},[t._v("16")]),a("br")])]),a("p",[t._v("一行代码简单来说就是"),a("code",[t._v("(oldState, action) => newState")]),t._v("。由于"),a("code",[t._v("reducer")]),t._v("是直接替换"),a("code",[t._v("state")]),t._v("，因此"),a("code",[t._v("reducer")]),t._v("必须有返回值。不然整个 redux 就会得不到"),a("code",[t._v("state")]),t._v("了。")]),t._v(" "),a("p",[t._v("话说一个计算变化重新生成 state 的方法为什么要叫 reducer 呢？我查了查资料，原来这个方法可以作为数组的"),a("code",[t._v("reduce")]),t._v("方法的参数。使用方法如下：")]),t._v(" "),a("div",{staticClass:"language-js line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" actions "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("type")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'ADD'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("payload")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),a("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("num")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("type")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'ADD'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("payload")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),a("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("num")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" newState "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" actions"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("reduce")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("reducer"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" state"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// {..., count: 3}")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br")])]),a("p",[t._v("由于 redux 中，"),a("code",[t._v("reducer")]),t._v("和"),a("code",[t._v("state")]),t._v("一样，也是唯一的，因此如果我们需要根据不同的处理逻辑分割"),a("code",[t._v("reducer")]),t._v("的话，需要用"),a("code",[t._v("combineReducers({reducer})")]),t._v("将这些"),a("code",[t._v("reducer")]),t._v("合并成一个"),a("code",[t._v("rootReducer")]),t._v("。")])])}),[],!1,null,null,null);s.default=r.exports}}]);