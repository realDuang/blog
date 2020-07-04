---
title: 利用 React 高阶组件实现一个面包屑导航
categories: JavaScript
tags: React
abbrlink: '57'
date: 2018-11-12 11:51:01
---

## 什么是 React 高阶组件

React 高阶组件就是以高阶函数的方式包裹需要修饰的 React 组件，并返回处理完成后的 React 组件。React 高阶组件在 React 生态中使用的非常频繁，比如`react-router` 中的 `withRouter` 以及 `react-redux` 中 `connect` 等许多 API 都是以这样的方式来实现的。

<!-- more -->

## 使用 React 高阶组件的好处

在工作中，我们经常会有很多功能相似，组件代码重复的页面需求，通常我们可以通过完全复制一遍代码的方式实现功能，但是这样页面的维护可维护性就会变得极差，需要对每一个页面里的相同组件去做更改。因此，我们可以将其中共同的部分，比如接受相同的查询操作结果、组件外同一的标签包裹等抽离出来，做一个单独的函数，并传入不同的业务组件作为子组件参数，而这个函数不会修改子组件，只是通过组合的方式将子组件包装在容器组件中，是一个无副作用的纯函数，从而我们能够在不改变这些组件逻辑的情况下将这部分代码解耦，提升代码可维护性。

## 自己动手实现一个高阶组件

前端项目里，带链接指向的面包屑导航十分常用，但由于面包屑导航需要手动维护一个所有目录路径与目录名映射的数组，而这里所有的数据我们都能从 `react-router` 的路由表中取得，因此我们可以从这里入手，实现一个面包屑导航的高阶组件。

首先我们看看我们的路由表提供的数据以及目标面包屑组件所需要的数据：

```js
// 这里展示的是 react-router4 的route示例
let routes = [
  {
    breadcrumb: '一级目录',
    path: '/a',
    component: require('../a/index.js').default,
    items: [
      {
        breadcrumb: '二级目录',
        path: '/a/b',
        component: require('../a/b/index.js').default,
        items: [
          {
            breadcrumb: '三级目录1',
            path: '/a/b/c1',
            component: require('../a/b/c1/index.js').default,
            exact: true,
          },
          {
            breadcrumb: '三级目录2',
            path: '/a/b/c2',
            component: require('../a/b/c2/index.js').default,
            exact: true,
          },
      }
    ]
  }
]

// 理想中的面包屑组件
// 展示格式为 a / b / c1 并都附上链接
const BreadcrumbsComponent = ({ breadcrumbs }) => (
  <div>
    {breadcrumbs.map((breadcrumb, index) => (
      <span key={breadcrumb.props.path}>
        <link to={breadcrumb.props.path}>{breadcrumb}</link>
        {index < breadcrumbs.length - 1 && <i> / </i>}
      </span>
    ))}
  </div>
);
```

这里我们可以看到，面包屑组件需要提供的数据一共有三种，一种是当前页面的路径，一种是面包屑所带的文字，一种是该面包屑的导航链接指向。

其中第一种我们可以通过 react-router 提供的 withRouter 高阶组件包裹，可使子组件获取到当前页面的 location 属性，从而获取页面路径。

后两种需要我们对 routes 进行操作，首先将 routes 提供的数据扁平化成面包屑导航需要的格式，我们可以使用一个函数来实现它。

```js
/**
 * 以递归的方式展平react router数组
 */
const flattenRoutes = arr =>
  arr.reduce(function(prev, item) {
    prev.push(item);
    return prev.concat(
      Array.isArray(item.items) ? flattenRoutes(item.items) : item
    );
  }, []);
```

之后将展平的目录路径映射与当前页面路径一同放入处理函数，生成面包屑导航结构。

```js
export const getBreadcrumbs = ({ flattenRoutes, location }) => {
  // 初始化匹配数组match
  let matches = [];

  location.pathname
    // 取得路径名，然后将路径分割成每一路由部分.
    .split('?')[0]
    .split('/')
    // 对每一部分执行一次调用`getBreadcrumb()`的reduce.
    .reduce((prev, curSection) => {
      // 将最后一个路由部分与当前部分合并，比如当路径为 `/x/xx/xxx` 时，pathSection分别检查 `/x` `/x/xx` `/x/xx/xxx` 的匹配，并分别生成面包屑
      const pathSection = `${prev}/${curSection}`;
      const breadcrumb = getBreadcrumb({
        flattenRoutes,
        curSection,
        pathSection,
      });

      // 将面包屑导入到matches数组中
      matches.push(breadcrumb);

      // 传递给下一次reduce的路径部分
      return pathSection;
    });
  return matches;
};
```

然后对于每一个面包屑路径部分，生成目录名称并附上指向对应路由位置的链接属性。

```js
const getBreadcrumb = ({ flattenRoutes, curSection, pathSection }) => {
  const matchRoute = flattenRoutes.find(ele => {
    const { breadcrumb, path } = ele;
    if (!breadcrumb || !path) {
      throw new Error(
        'Router中的每一个route必须包含 `path` 以及 `breadcrumb` 属性'
      );
    }
    // 查找是否有匹配
    // exact 为 react router4 的属性，用于精确匹配路由
    return matchPath(pathSection, { path, exact: true });
  });

  // 返回breadcrumb的值，没有就返回原匹配子路径名
  if (matchRoute) {
    return render({
      content: matchRoute.breadcrumb || curSection,
      path: matchRoute.path,
    });
  }

  // 对于routes表中不存在的路径
  // 根目录默认名称为首页.
  return render({
    content: pathSection === '/' ? '首页' : curSection,
    path: pathSection,
  });
};
```

之后由 render 函数生成最后的单个面包屑导航样式。单个面包屑组件需要为 render 函数提供该面包屑指向的路径 `path`, 以及该面包屑内容映射`content` 这两个 props。

```js
/**
 *
 */
const render = ({ content, path }) => {
  const componentProps = { path };
  if (typeof content === 'function') {
    return <content {...componentProps} />;
  }
  return <span {...componentProps}>{content}</span>;
};
```

有了这些功能函数，我们就能实现一个能为包裹组件传入当前所在路径以及路由属性的 React 高阶组件了。传入一个组件，返回一个新的相同的组件结构，这样便不会对组件外的任何功能与操作造成破坏。

```js
const BreadcrumbsHoc = (
  location = window.location,
  routes = []
) => Component => {
  const BreadComponent = (
    <Component
      breadcrumbs={getBreadcrumbs({
        flattenRoutes: flattenRoutes(routes),
        location,
      })}
    />
  );
  return BreadComponent;
};
export default BreadcrumbsHoc;
```

调用这个高阶组件的方法也非常简单，只需要传入当前所在路径以及整个 `react router` 生成的 `routes` 属性即可。
至于如何取得当前所在路径，我们可以利用 `react router` 提供的 `withRouter` 函数，如何使用请自行查阅相关文档。
值得一提的是，`withRouter` 本身就是一个高阶组件，能为包裹组件提供包括 `location` 属性在内的若干路由属性。所以这个 API 也能作为学习高阶组件一个很好的参考。

```js
withRouter(({ location }) =>
  BreadcrumbsHoc(location, routes)(BreadcrumbsComponent)
);
```

## Q&A

如果`react router` 生成的 `routes` 不是由自己手动维护的，甚至都没有存在本地，而是通过请求拉取到的，存储在 redux 里，通过 `react-redux` 提供的 `connect` 高阶函数包裹时，路由发生变化时并不会导致该面包屑组件更新。使用方法如下：

```js
function mapStateToProps(state) {
  return {
    routes: state.routes,
  };
}

connect(mapStateToProps)(
  withRouter(({ location }) =>
    BreadcrumbsHoc(location, routes)(BreadcrumbsComponent)
  )
);
```

---

这其实是 `connect` 函数的一个**bug**。因为 react-redux 的 connect 高阶组件会为传入的参数组件实现 shouldComponentUpdate 这个钩子函数，导致**只有 prop 发生变化时才触发更新相关的生命周期函数(含 render)**，而很显然，我们的 location 对象并没有作为 prop 传入该参数组件。

官方推荐的做法是使用 `withRouter` 来包裹 `connect` 的 `return value`，即

```js
withRouter(
  connect(mapStateToProps)(({ location, routes }) =>
    BreadcrumbsHoc(location, routes)(BreadcrumbsComponent)
  )
);
```

其实我们从这里也可以看出，高阶组件同高阶函数一样，不会对组件的类型造成任何更改，因此高阶组件就如同链式调用一样，可以任意多层包裹来给组件传入不同的属性，在正常情况下也可以随意调换位置，在使用上非常的灵活。这种可插拔特性使得高阶组件非常受 React 生态的青睐，很多开源库里都能看到这种特性的影子，有空也可以都拿出来分析一下。
