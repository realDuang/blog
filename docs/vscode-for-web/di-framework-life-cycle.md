---
title: 浅析依赖注入框架的生命周期(以 InversifyJS 为例)
date: 2023-02-09 17:39:42
---

:::tip
在上一篇介绍了 VSCode 的依赖注入设计，并且实现了一个简单的 IOC 框架。但是距离成为一个生产环境可用的框架还差的很远。

行业内已经有许多非常优秀的开源 IOC 框架，它们划分了更为清晰地模块来应对复杂情况下依赖注入运行的正确性。

这里我将以 InversifyJS 为例，分析它的生命周期设计，来弄清楚在一个优秀的 IOC 框架中，完成一次注入流程到底是什么样的。
:::

<!-- more -->

## InversifyJS 的生命周期

在激活 InversifyJS 后，框架通常会监听并经历五个阶段，分别是：

1. Annotation 注释阶段
2. Planning 规划阶段
3. Middleware (optional) 中间件钩子
4. Resolution 解析执行阶段
5. Activation (optional) 激活钩子

本篇文章将着重介绍其中的**三个必选阶段**。旨在解释框架到底是如何规划模块实例化的先后顺序，以实现依赖注入能力的。

接下来的解析将围绕如下例子：

```ts
@injectable()
class FooBar implements FooBarInterface {
  public foo: FooInterface;
  public bar: BarInterface;
  constructor(
    @inject("FooInterface") foo: FooInterface,
    @inject("BarInterface") bar: BarInterface
  ) {
    this.foo = foo;
    this.bar = bar;
  }
}
const container = new Container();
const foobar = container.get<FooBarInterface>("FooBarInterface");
```

## Annotation 注释阶段

在此阶段中，框架将通过装饰器为所有接入框架的对象打上标记，以便规划阶段时进行管理。

在这个阶段中，最重要的 API 就是 `injectable` 。它使用 Reflect metadata，对 Class 构造函数中通过 `inject` API 注入的 property 进行标注，并挂在在了该类的 `metadataKey` 上。

```ts
function injectable() {
  return function (target: any) {
    if (Reflect.hasOwnMetadata(METADATA_KEY.PARAM_TYPES, target)) {
      throw new Error(ERRORS_MSGS.DUPLICATED_INJECTABLE_DECORATOR);
    }

    const types =
      Reflect.getMetadata(METADATA_KEY.DESIGN_PARAM_TYPES, target) || [];
    Reflect.defineMetadata(METADATA_KEY.PARAM_TYPES, types, target);

    return target;
  };
}
```

## Planning 规划阶段

本阶段时该框架的核心阶段，它真正生成了在一个 Container 中，所有类模块的依赖关系树。因此，在 Container 类进行实例化时，规划阶段就开始了。

在实例化时，根据传入的 id 与 scope 可以确定该实例容器的作用域范围，生成一个 context，拥有对内左右模块的管理权。

```ts
class Context implements interfaces.Context {
  public id: number;
  public container: interfaces.Container;
  public plan: interfaces.Plan;
  public currentRequest: interfaces.Request;
  public constructor(container: interfaces.Container) {
    this.id = id(); // generate a unique id
    this.container = container;
  }
  public addPlan(plan: interfaces.Plan) {
    this.plan = plan;
  }
  public setCurrentRequest(currentRequest: interfaces.Request) {
    this.currentRequest = currentRequest;
  }
}
```

我们可以注意到，这个 context 中包含一个空的 plan 对象，这是 planning 阶段的核心，该阶段就是为生成的容器规划好要执行的任务。

plan 对象中将包含一个 request 对象，request 是一个可递归的属性结构，它包含了要查找的 id 外，还需要 target 参数，即规定找到依赖实例后将引用赋值给哪个参数。

```ts
class Request implements interfaces.Request {
    public id: number;
    public serviceIdentifier: interfaces.ServiceIdentifier<any>; // 被修饰类 id
    public parentContext: interfaces.Context;
    public parentRequest: interfaces.Request | null; // 树形结构的 request，指向父节点
    public bindings: interfaces.Binding<any>[];
    public childRequests: interfaces.Request[]; // 树形结构的 request，指向子节点
    public target: interfaces.Target; // 指向赋值目标参数
    public requestScope: interfaces.RequestScope;
    ...
}
```

以篇头的例子为例。在容器执行 get 函数后，框架生成了一个新的 plan，该 plan 的生成过程中将执行\_createSubRequests 方法，从上而下创建 Request 依赖树。

创建完成后的 plan 对象生成的 request 树将包含有请求目标为 null 的根 request 与两个子 request：

第一个子 request 指向 FooInterface 接口，并且请求结果的 target 赋值给构造函数中的参数 foo。第二个子 request 指向 BarInterface 接口，并且请求结果的 target 赋值给构造函数中的参数 bar。

注意，此处的依赖树生成仍在 interface 层面，没有任何类被实例化。

用一张图来更直观地表现该阶段中各对象的生成调用过程：

![20230209165944](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20230209165944.png)

这样，每一个类与其依赖项之间的请求关系就构造完毕了。

## Resolution 解析执行阶段

该阶段便是执行在规划阶段中生成的 request 依赖树，从无依赖的叶子节点开始，自下而上实例化每一个依赖类，到根 request 结束时，即最终完成 `FooBar` 自身的实例化。

且该解析过程可以选择同步或异步执行，在复杂情况下，使用异步懒加载的方式执行解析，有助于提高性能。

至此，一次完整的具有依赖的类的实例化就完成了。我们可以通过打印依赖树，清晰地观察到该实例依赖了哪些实例，从而避免了一切可能的循环依赖，与多次构造依赖带来的内存泄露等很多难以排查的问题。

## 参考资料

[InversifyJS Architecture Overview](https://github.com/inversify/InversifyJS/blob/master/wiki/architecture.md)
