(window.webpackJsonp=window.webpackJsonp||[]).push([[51],{597:function(s,t,a){"use strict";a.r(t);var n=a(11),e=Object(n.a)({},(function(){var s=this,t=s.$createElement,a=s._self._c||t;return a("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[a("p",[s._v("在大型项目的管理中，控制反转的思想是非常重要的。它可以帮助我们解耦代码，提高代码的可维护性。同时避免了不必要的重复实例化，降低内存泄漏的可能性。")]),s._v(" "),a("p",[s._v("而在 JS/TS 技术栈中，我们通常会使用依赖注入框架来帮助我们管理服务。这其中最佳的选择当然是 Angular 这种大而全的大型工程开发框架。而对于使用了其他 UI 框架的项目来说，我们同样可以额外引入一个轻量化的依赖注入框架。而 InversifyJS 就是其中的佼佼者。我们可以通过使用它，来见微知著地了解依赖注入的原理与设计哲学。")]),s._v(" "),a("p",[s._v("但最近在使用 Inversify 进行项目重构时，遇到了一个问题：众所周知依赖注入框架天生适合管理单例服务。它的设计哲学是 "),a("code",[s._v("Everything as Service")]),s._v("。但是在某些场景下，单例模式并不能解决一切问题，我们同样需要进行多实例的管理。那么我们该如何解决这个问题呢？")]),s._v(" "),a("p",[s._v("这并不是 Inversify 框架的问题，而其实是一个依赖注入框架下常见的设计疑惑，但是网上对此的解析资料却很少。")]),s._v(" "),a("p",[s._v("我看了很多使用了 InversifyJS 的项目，他们对此的方式就是直接在需要处实例化，不将其注册到容器中。这实际上是没有真正理解到依赖注入框架的内核。这样做的好处是简单，但是有很多弊端。由于我们无法在容器中统一管理这些实例，那么这些服务的生命周期将不受控制，在 dispose 时无法在容器中统一销毁这些实例。与不引入依赖注入框架一样，这样同样会带来内存泄漏的可能性。")]),s._v(" "),a("p",[s._v("那么该如何正确地处理这种情况呢？")]),s._v(" "),a("h2",{attrs:{id:"构造器注入"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#构造器注入"}},[s._v("#")]),s._v(" 构造器注入")]),s._v(" "),a("p",[s._v("一个最简便的改造方式是，我们将类的构造函数绑定到容器中。需要的时候从容器中获取类的构造器，再进行实例化。这样我们就可以在容器中统一管理这些实例了。")]),s._v(" "),a("div",{staticClass:"language-ts line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-ts"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 将 InstanceClass 的构造函数绑定到容器中")]),s._v("\ncontainer\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-function"}},[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("bind")]),a("span",{pre:!0,attrs:{class:"token generic class-name"}},[a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("interfaces"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("Newable"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("InstanceClass"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">>")])])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Newable<InstanceClass>"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-function"}},[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("toConstructor")]),a("span",{pre:!0,attrs:{class:"token generic class-name"}},[a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("InstanceClass"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")])])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("InstanceClass"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br")])]),a("div",{staticClass:"language-ts line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-ts"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 获取构造器")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("constructor")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token decorator"}},[a("span",{pre:!0,attrs:{class:"token at operator"}},[s._v("@")]),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("inject")])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Newable<InstanceClass>"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" InstanceClass"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" Newable"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("InstanceClass"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("this")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("instance1 "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("new")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("InstanceClass")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("this")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("instance2 "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("new")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("InstanceClass")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br")])]),a("p",[s._v("实例会跟随类的生命周期而存在，且该类能纳入容器中进行管理。但是这样做，实际上仍然无法在容器中统一管理这些实例的生命周期。如果我们需要在 dispose 时销毁这些实例，那么我们需要在类中手动实现 dispose 方法，并在 dispose 时手动销毁这些实例。")]),s._v(" "),a("p",[s._v("这样改造的好处是简单，但是很多时候并不是一个最优解，因为我们希望该实例本身能在注入框架的管理下，避免我们去手动的控制与销毁。")]),s._v(" "),a("h2",{attrs:{id:"工厂注入"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#工厂注入"}},[s._v("#")]),s._v(" 工厂注入")]),s._v(" "),a("p",[s._v("依赖注入框架天生不太好管理多实例的服务，但是如果利用工厂模式的设计思想，将这些服务的实例化过程封装到工厂中，而这样的工厂类一定是单例的。那么我们就可以通过管理工厂类来管理这些多实例服务的生命周期了。")]),s._v(" "),a("p",[s._v("在需要多实例服务实例化时，我们不直接 import 类进行实例化，而是通过 import 工厂类来获取实例。这样我们就可以在工厂中控制多实例服务的生命周期了。")]),s._v(" "),a("p",[s._v("在 InversifyJS 中，提供了工厂注入的方法：")]),s._v(" "),a("div",{staticClass:"language-ts line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-ts"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 设置工厂函数")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function-variable function"}},[s._v("instanceFactory")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" context"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("container"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-function"}},[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("get")]),a("span",{pre:!0,attrs:{class:"token generic class-name"}},[a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("InstanceClass"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")])])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Instance"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 工厂创建器，这里设置高阶函数的目的是将 context 传递给工厂函数，方便获取容器")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function-variable function"}},[s._v("instanceFactoryCreator")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("context"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" interfaces"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("Context"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" instanceFactory"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 绑定工厂")]),s._v("\ncontainer\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-function"}},[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("bind")]),a("span",{pre:!0,attrs:{class:"token generic class-name"}},[a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("interfaces"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("Factory"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("InstanceClass"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">>")])])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Factory<InstanceClass>"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-function"}},[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("toFactory")]),a("span",{pre:!0,attrs:{class:"token generic class-name"}},[a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("InstanceClass"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")])])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("instanceFactoryCreator"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br"),a("span",{staticClass:"line-number"},[s._v("12")]),a("br"),a("span",{staticClass:"line-number"},[s._v("13")]),a("br"),a("span",{staticClass:"line-number"},[s._v("14")]),a("br")])]),a("div",{staticClass:"language-ts line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-ts"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 获取构造器")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("constructor")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token decorator"}},[a("span",{pre:!0,attrs:{class:"token at operator"}},[s._v("@")]),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("inject")])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Factory<InstanceClass>"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("private")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function-variable function"}},[s._v("instanceFactory")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" InstanceClass"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("this")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("instance1 "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("this")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("instanceFactory")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("this")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("instance2 "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("this")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("instanceFactory")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br")])]),a("p",[s._v("这样的实现非常优雅，也是 Inversify 推荐的多实例管理方式。")]),s._v(" "),a("p",[s._v("当然，你也可以通过高阶函数的方式，生成不同的的工厂函数，以实现不同的实例化逻辑。")]),s._v(" "),a("div",{staticClass:"language-ts line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-ts"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 设置工厂函数")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function-variable function"}},[s._v("instanceFactory")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("name"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token builtin"}},[s._v("string")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("if")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("name "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("===")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Instance"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" context"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("container"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-function"}},[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("get")]),a("span",{pre:!0,attrs:{class:"token generic class-name"}},[a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("InstanceClass"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")])])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Instance"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" context"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("container"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-function"}},[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("get")]),a("span",{pre:!0,attrs:{class:"token generic class-name"}},[a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("DefaultClass"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")])])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Default"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 工厂创建器，这里设置高阶函数的目的是将 context 传递给工厂函数，方便获取容器")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function-variable function"}},[s._v("instanceFactoryCreator")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("context"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" interfaces"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("Context"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" instanceFactory"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 绑定工厂")]),s._v("\ncontainer\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-function"}},[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("bind")]),a("span",{pre:!0,attrs:{class:"token generic class-name"}},[a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("interfaces"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("Factory"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("InstanceClass"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">>")])])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Factory<InstanceClass>"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-function"}},[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("toFactory")]),a("span",{pre:!0,attrs:{class:"token generic class-name"}},[a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("InstanceClass"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")])])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("instanceFactoryCreator"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br"),a("span",{staticClass:"line-number"},[s._v("12")]),a("br"),a("span",{staticClass:"line-number"},[s._v("13")]),a("br"),a("span",{staticClass:"line-number"},[s._v("14")]),a("br"),a("span",{staticClass:"line-number"},[s._v("15")]),a("br"),a("span",{staticClass:"line-number"},[s._v("16")]),a("br"),a("span",{staticClass:"line-number"},[s._v("17")]),a("br")])]),a("p",[s._v("在大多数情况下，它就是最标准的依赖注入框架下多实例管理方式了，也推荐能使用此方式的类尽量如此改造。")]),s._v(" "),a("h2",{attrs:{id:"带参数实例化的工厂注入"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#带参数实例化的工厂注入"}},[s._v("#")]),s._v(" 带参数实例化的工厂注入")]),s._v(" "),a("p",[s._v("现在重点来了，依赖注入框架完美解决了在类实例化时需要传入的依赖实例，避免了我们需要在类的构造函数中获取或新建依赖实例。那么，对于那些依赖于传入外部上下文变量的类，我们该如何处理呢？")]),s._v(" "),a("p",[s._v("这是我们将已有的项目重构的过程中，经常会遇到的一种情况，这些类的构造函数执行过程依赖于外部上下文变量。")]),s._v(" "),a("p",[s._v("InversifyJS 的工厂注入在这中情形下的推荐实现方式比较奇怪，是在获取实例后为实例进行属性注入。我大致转写一下主要实现：")]),s._v(" "),a("div",{staticClass:"language-ts line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-ts"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 设置工厂函数")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function-variable function"}},[s._v("instanceFactory")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("payload"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" Record"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),a("span",{pre:!0,attrs:{class:"token builtin"}},[s._v("string")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token builtin"}},[s._v("any")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" instance "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" context"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("container"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-function"}},[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("get")]),a("span",{pre:!0,attrs:{class:"token generic class-name"}},[a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("InstanceClass"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")])])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Instance"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n  instance"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("payload "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" payload"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" instance"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 工厂创建器，这里设置高阶函数的目的是将 context 传递给工厂函数，方便获取容器")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function-variable function"}},[s._v("instanceFactoryCreator")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("context"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" interfaces"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("Context"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" instanceFactory"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 绑定工厂")]),s._v("\ncontainer\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-function"}},[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("bind")]),a("span",{pre:!0,attrs:{class:"token generic class-name"}},[a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("interfaces"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("Factory"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("InstanceClass"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">>")])])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Factory<InstanceClass>"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-function"}},[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("toFactory")]),a("span",{pre:!0,attrs:{class:"token generic class-name"}},[a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("InstanceClass"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")])])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("instanceFactoryCreator"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br"),a("span",{staticClass:"line-number"},[s._v("12")]),a("br"),a("span",{staticClass:"line-number"},[s._v("13")]),a("br"),a("span",{staticClass:"line-number"},[s._v("14")]),a("br"),a("span",{staticClass:"line-number"},[s._v("15")]),a("br"),a("span",{staticClass:"line-number"},[s._v("16")]),a("br")])]),a("p",[s._v("在实例化后的运行时改变实例的属性，从而使实例中对属性的依赖得以满足。但这样的实现方式，会使得我们原有类的实现方式发生改变，也会改变类中属性的访问方式，例如原来时 readonly 或是 private 的属性，我们都无法在运行时对其进行赋值。")]),s._v(" "),a("p",[s._v("当这个类继承于外部需要传入参数的类，或者是需要在首次实例化时根据传入的变量依赖执行部分操作时，这种实例化的方式是行不通的。")]),s._v(" "),a("p",[s._v("那么如果我们的改造类具有以上特性，在不改变原有实现方式的情况下，应当如何做呢？")]),s._v(" "),a("p",[s._v("我们可以注意到，通过构造器注入的方式并不会将实例化时的行为交给容器，因此我们可以在这里进行手动的实例化并传入参数。那这样的实例化方式同样可以与工厂模式相结合，实现带参数实例化的工厂注入。")]),s._v(" "),a("div",{staticClass:"language-ts line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-ts"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 设置工厂函数")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function-variable function"}},[s._v("instanceFactory")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("payload"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" Record"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),a("span",{pre:!0,attrs:{class:"token builtin"}},[s._v("string")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token builtin"}},[s._v("any")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" InstanceClass "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" context"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("container"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-function"}},[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("get")]),a("span",{pre:!0,attrs:{class:"token generic class-name"}},[a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("Newable"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("InstanceClass"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">>")])])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("\n    "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Newable<InstanceClass>"')]),s._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" instance "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("new")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("InstanceClass")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("payload"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" instance"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br")])]),a("p",[s._v("注意，这里的 "),a("code",[s._v("new InstanceClass")]),s._v(" 并不是引用原有类，而是引用了类的构造函数，而构造函数处于框架的管辖下，因此某种程度上该实例也是由框架进行了实例化得来的。因此，原有类甚至都不需要通过 "),a("code",[s._v("@injectable")]),s._v(" 标注与注册。只需注册其构造器即可。")]),s._v(" "),a("p",[s._v("但始终，对于带参数实例化的工厂注入，它的实现方式并不优雅，也不符合依赖注入的思想。因此，本质上来说，类似于"),a("code",[s._v("类继承")]),s._v("的方式并不是一个好的"),a("code",[s._v("code smell")]),s._v("，我们推荐使用"),a("code",[s._v("对象组合")]),s._v("来代替"),a("code",[s._v("类继承")]),s._v("，从而规避掉需要在构造函数中为 super() 传入变量的尴尬局面。")]),s._v(" "),a("h2",{attrs:{id:"结语"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#结语"}},[s._v("#")]),s._v(" 结语")]),s._v(" "),a("p",[s._v("以上就是我在使用依赖注入框架重构项目时，对于多实例服务管理的一些思考与实践。它成功地帮我完成了整个项目的重构，也让我对于依赖注入框架有了更深的理解。")]),s._v(" "),a("p",[s._v("但于此同时，我也在实践中发现了许多依赖注入框架的局限性。但这并不说明依赖注入框架不够完善，而是说明了依赖注入作为一种设计模式与思想，它有其匹配的设计哲学。例如在上述的例子中，真正按照框架的最佳实践来说，我们应当只为服务注入行为抽象，而不是某些具体的变量数据，这对代码可测性来说非常重要。")]),s._v(" "),a("p",[s._v("因此，我更推荐在使用依赖注入框架前，先学习依赖注入的设计思想，再去使用框架。而不是尝试魔改某个依赖注入框架来迎合固有的编码风格。这不一定对设计与性能有正向的收益。")])])}),[],!1,null,null,null);t.default=e.exports}}]);