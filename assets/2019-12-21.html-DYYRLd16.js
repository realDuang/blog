import{_ as e,o as t,c as n,b as a}from"./app-B9TWmIeZ.js";const o={},c=a(`<div class="custom-container tip"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 8h.01"></path><path d="M11 12h1v4h1"></path></g></svg><p class="custom-container-title">TIP</p><p>因为 React16 框架使用了全新的<code>Fiber</code>架构，这其中有一个特性叫做<code>async rendering</code>，render 过程可中断，因此，render 函数之前的所有生命周期函数都有可能被多次执行，如果在这些函数中存在异步请求的话将会造成许多无用的请求被调用。</p></div><h2 id="为什么要变更生命周期" tabindex="-1"><a class="header-anchor" href="#为什么要变更生命周期"><span>为什么要变更生命周期</span></a></h2><p>因为 React16 框架使用了全新的<code>Fiber</code>架构，这其中有一个特性叫做<code>async rendering</code>，render 过程可中断，因此，render 函数之前的所有生命周期函数都有可能被多次执行，如果在这些函数中存在异步请求的话将会造成许多无用的请求被调用。</p><p>涉及到的生命周期函数一共有 4 个：</p><blockquote><p>componentWillMount</p><p>componentWillReceiveProps</p><p>shouldComponentUpdate</p><p>componentWillUpdate</p></blockquote><p>很多开发者在<code>componentWillMount</code>或是<code>componentWillUpdate</code>里调用请求的原因是期望请求回更新的状态能在 render 之前刷新，但这样是不可能的，无论请求相应速度多快，异步操作的返回逻辑执行都会被安排在下一次 tick 之后，页面还是会被 render 两次。</p><p>而在<code>componentWillReceiveProps</code>写同步逻辑也会存在一些问题，如当父组件传入的 props 变更非常频繁的时候，<code>componentWillReceiveProps</code>的调用次数是非常多的，但若是将这些逻辑放入 render 及以后的周期函数中则并不会这样，这是因为 react 进行 setState 的时候是会通过<code>transaction</code>进行合并的，实际 render 的执行次数并不会增多。</p><p>因此，从合理性上来说，推荐将异步请求放在<code>componentDidMount</code>里，同步处理逻辑写在 render 中或使用<code>shouldComponentUpdate</code>优化直接省去 render 步骤。为了强制开发者彻底摈弃这样的使用习惯，官方在 React16 中干脆去掉了除了<code>shouldComponentUpdate</code>以外的其他声明周期。</p><p>但仍然有开发者需要在 render 之前获取到 props 的更新，因此官方增加了新的生命周期函数<code>getDrivedStateFromProps</code>。它的作用其实与<code>componentWillReceiveProps</code>差不多，但优势在于在多次变更 props 操作的过程中，它与 render 一样，只更新一次。</p><p>我画了一张图来清晰地展示 React 新旧生命周期过程的对比：</p><p><img src="https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/React新旧生命周期对比.png" alt="React 新旧生命周期对比。png"></p><h2 id="componentwillxx-生命周期函数的替代者" tabindex="-1"><a class="header-anchor" href="#componentwillxx-生命周期函数的替代者"><span>componentWillXX 生命周期函数的替代者</span></a></h2><p>首先来看看这个新增引入的生命周期函数：</p><div class="language-typescript line-numbers-mode" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="token keyword">static</span> <span class="token function">getDrivedStateFromProps</span><span class="token punctuation">(</span>nextProps<span class="token punctuation">,</span> prevState<span class="token punctuation">)</span><span class="token operator">:</span> newState <span class="token operator">||</span> <span class="token keyword">null</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>在组件创建和更新时都会调用，它能获取到更新的 props 与当前的 state，返回更新后的 state，若不需要进行更新则返回 null。</p><p>我们需要注意的是，这个函数一定需要写成 static 的静态函数，这样做的目的是不让开发者在这个函数中拿到 this，因此无法进行<code>setState</code>操作，使之变成一个纯函数。以这样的方式规范了 react 在 render 函数执行之前不做任何更新状态的异步请求。</p><h2 id="如何在页面更新后立即获取到更新后的-dom-信息" tabindex="-1"><a class="header-anchor" href="#如何在页面更新后立即获取到更新后的-dom-信息"><span>如何在页面更新后立即获取到更新后的 DOM 信息</span></a></h2><p>这就要提到 React16 的另一个生命周期函数：</p><div class="language-typescript line-numbers-mode" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="token function">getSnapshotBeforeUpdate</span><span class="token punctuation">(</span>prevProps<span class="token punctuation">,</span> prevState<span class="token punctuation">)</span><span class="token operator">:</span> <span class="token builtin">any</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>这个函数的作用时机是 render 函数之后，实际组件更新之前，这个时候组件无法进行更改但可以读取 DOM 中的信息，我们可以在这个阶段获取到如 <code>ref</code> 之类的真实 DOM 数据，并将结果传递给 componentDidUpdate(prevProps, prevState, snapshot) 中的第三个参数，从而在更新后可以根据当前 DOM 的数据进行状态的相应调整。</p><h2 id="react16-如何进行错误捕获与处理" tabindex="-1"><a class="header-anchor" href="#react16-如何进行错误捕获与处理"><span>React16 如何进行错误捕获与处理</span></a></h2><p>因为 React 是基于 javascript 的框架，因此组件内部若存在 js 异常，将会阻断一些状态的更新，导致应用崩溃。而一般认为，在 UI 部分发生的异常不应该让整个应用 crash，为此在 React16.0 中，引入了一个新的异常处理捕获的生命周期函数<code>componentDidCatch</code>。</p><div class="language-typescript line-numbers-mode" data-ext="ts" data-title="ts"><pre class="language-typescript"><code><span class="token function">componentDidCatch</span><span class="token punctuation">(</span>error<span class="token punctuation">,</span> info<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>它引入了一个新概念：<code>error boundary</code>，错误边界。它是一个内部包含<code>componentDidCatch</code>函数的 React 类组件，它用以捕获在整个<strong>子组件树</strong>的构造函数以及生命周期函数中的 JS 异常，从而渲染不同的子页面。</p><p>注意，由于它本质上还是利用了 React 类的生命周期，因此只能对类组件的错误捕获有效，并且只能对错误边界包裹的子组件(不包括自身)有效。</p><p>若没有在错误边界中被 catch 的 JS 错误将导致整个 React 组件被卸载。</p><p>与 try/catch 不同的是，错误边界保留了 React 声明式的特性，而前者适用于命令式的代码。并且错误边界能捕获组件树内部底层逻辑导致的错误，如在<code>componentDidUpdate</code>中的<code>setState</code>。</p>`,27),s=[c];function p(r,d){return t(),n("div",null,s)}const l=e(o,[["render",p],["__file","2019-12-21.html.vue"]]),u=JSON.parse('{"path":"/blogs/frontend-basics/2019-12-21.html","title":"React15 与 React16 生命周期区别与使用方式","lang":"en-US","frontmatter":{"title":"React15 与 React16 生命周期区别与使用方式","date":"2019-12-21T17:38:35.000Z","categories":["前端基础"],"tags":["JavaScript","React"]},"headers":[{"level":2,"title":"为什么要变更生命周期","slug":"为什么要变更生命周期","link":"#为什么要变更生命周期","children":[]},{"level":2,"title":"componentWillXX 生命周期函数的替代者","slug":"componentwillxx-生命周期函数的替代者","link":"#componentwillxx-生命周期函数的替代者","children":[]},{"level":2,"title":"如何在页面更新后立即获取到更新后的 DOM 信息","slug":"如何在页面更新后立即获取到更新后的-dom-信息","link":"#如何在页面更新后立即获取到更新后的-dom-信息","children":[]},{"level":2,"title":"React16 如何进行错误捕获与处理","slug":"react16-如何进行错误捕获与处理","link":"#react16-如何进行错误捕获与处理","children":[]}],"git":{"createdTime":1733141773000,"updatedTime":1733141773000,"contributors":[{"name":"Duang Cheng","email":"longcheng@microsoft.com","commits":1}]},"filePathRelative":"blogs/frontend-basics/2019-12-21.md"}');export{l as comp,u as data};