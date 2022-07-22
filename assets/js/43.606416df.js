(window.webpackJsonp=window.webpackJsonp||[]).push([[43],{589:function(e,t,v){"use strict";v.r(t);var s=v(11),r=Object(s.a)({},(function(){var e=this,t=e.$createElement,v=e._self._c||t;return v("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[v("div",{staticClass:"custom-block tip"},[v("p",{staticClass:"title"}),v("p",[e._v("我们知道，用户体验是 Web 产品最为重要的部分。尽可能减少首屏加载时间，更为流畅地展示用户所需求的内容，会是用户是否留存的关键因素。")]),e._v(" "),v("p",[e._v("而随着现代 Web 业务可供用户的交互行为越来越多，前端项目的复杂度越来越高，每个页面的渲染时间也必然越来越长，这就导致了用户的体验不佳，用户的操作变慢。")]),e._v(" "),v("p",[e._v("为此，前端工程师们在此部分持续发力，不断探究如何将首次页面渲染的时间减少到更小，提供更为优秀的产品体验。")])]),e._v(" "),v("p",[v("img",{attrs:{src:"https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20220722174820.png",alt:"20220722174820"}})]),e._v(" "),v("p",[e._v("我们知道，用户体验是 Web 产品最为重要的部分。尽可能减少首屏加载时间，更为流畅地展示用户所需求的内容，会是用户是否留存的关键因素。")]),e._v(" "),v("p",[e._v("而随着现代 Web 业务可供用户的交互行为越来越多，前端项目的复杂度越来越高，每个页面的渲染时间也必然越来越长，这就导致了用户的体验不佳，用户的操作变慢。")]),e._v(" "),v("p",[e._v("为此，前端工程师们在首屏请求的各个阶段中持续钻研，不断探究如何将首次页面渲染的时间减少到更小，力求提供更为优秀的产品体验。")]),e._v(" "),v("h2",{attrs:{id:"csr-client-side-render"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#csr-client-side-render"}},[e._v("#")]),e._v(" CSR（Client Side Render）")]),e._v(" "),v("p",[v("img",{attrs:{src:"https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20220720162452.png",alt:"20220720162452"}})]),e._v(" "),v("p",[e._v("浏览器渲染是最简单，最符合 Web 应用设计思路的渲染方式。")]),e._v(" "),v("p",[e._v("所谓浏览器渲染，就是将应用所需的页面展示、前端逻辑、接口请求全都在用户的浏览器中执行。它很好的实现了前后端的解耦，让前端开发更为独立，也让后台实现更为简单。")]),e._v(" "),v("p",[e._v("同时，为了缓解用户的等待焦虑，我们可以用 loading 态，或者骨架屏，进一步提升异步请求接口时的用户体验。")]),e._v(" "),v("p",[e._v("不过，随着业务复杂程度提高，浏览器渲染的开销也会变大，我们无法控制用户侧使用的机器性能，很多时候，用户使用的机器性能甚至不足以满足应用的需求，造成卡顿，甚至崩溃，这一点在移动端上尤甚。")]),e._v(" "),v("p",[e._v("而浏览器渲染由于前端的动态性过高，也会带来 SEO 不佳的问题。")]),e._v(" "),v("h2",{attrs:{id:"ssr-server-side-render"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#ssr-server-side-render"}},[e._v("#")]),e._v(" SSR（Server Side Render）")]),e._v(" "),v("p",[v("img",{attrs:{src:"https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20220720162513.png",alt:"20220720162513"}})]),e._v(" "),v("p",[e._v("服务端渲染的出现时间实际上是要比浏览器渲染要更早的。在 Web 应用发展的早期，所有的 ASP、JSP 等模板引擎构建的前端页面实际上就是服务端渲染的结果。而此时的服务端渲染无法进行前后端职责的解耦，因此逐步被浏览器渲染淘汰。")]),e._v(" "),v("p",[e._v("但在处理首屏体验的问题上，服务端渲染有着独到的优势。它能提前再服务端中完成页面模板的数据填充，从而一次性返回完整的首屏内容，从而面对 SEO 的爬取时能获取到更多有效的关键信息。")]),e._v(" "),v("p",[e._v("此外，由于其能快速直出首页的真实数据，体验往往比 loading 态更佳，在 TTI 的表现上更为出色。")]),e._v(" "),v("p",[e._v("但是，服务端渲染也有其自身的局限性。因为从本质上来说，SSR 服务无法完全与前端页面解耦开来。因此市面上较完备的 SSR 解决方案都只解决首屏的服务端渲染，并采用同构的方式，增加一层 node 中间层的方式来解决前端与 SSR 服务的更新同步问题，并与后端开发项目解耦。")]),e._v(" "),v("p",[e._v("但这无疑增加了项目的复杂度，并且随着业务的复杂程度变高，服务端渲染往往需要调起多个接口去请求数据并填充页面，这样可能会导致在 TTFB 上有一定劣势。")]),e._v(" "),v("p",[e._v("当然，最重要的是，服务端渲染对于服务器的负载要求是很高的。")]),e._v(" "),v("p",[v("img",{attrs:{src:"https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20220722153734.png",alt:"20220722153734"}})]),e._v(" "),v("p",[e._v("上图是引用的字节的某项目的 SSR 服务的单机 QPS 承载表现。我们可以看出，对于一个高访问量的网页应用来说，提供一个较为复杂的 SSR 服务的成本是相当高的，需要花费大量的金钱来堆机器。")]),e._v(" "),v("p",[e._v("因此，从降本增效的角度考虑，我们需要评估 SSR 带来的 ROI 是否符合预期。")]),e._v(" "),v("h2",{attrs:{id:"nsr-native-side-render"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#nsr-native-side-render"}},[e._v("#")]),e._v(" NSR（Native Side Render）")]),e._v(" "),v("p",[e._v("在移动互联网的浪潮下，移动端机能飞速提升，那么 Web 应用是否能搭上这一班车，将 Native 的性能利用起来，提升页面渲染性能呢？答案是肯定的，这就需要介绍到 NSR 了。")]),e._v(" "),v("p",[v("img",{attrs:{src:"https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20220720162547.png",alt:"20220720162547"}})]),e._v(" "),v("p",[e._v("Native 渲染的本质其实还是 SSR，只不过提供服务的 Server 转变为了客户端。由于需要用到客户端机能，因此此种实现通常应用在移动端 APP，或者 PWA 下。")]),e._v(" "),v("p",[e._v("当链接被点击时，先借助浏览器启用一个 JS 运行时，并加载 APP 中存储的 Html 模板，发送 xhr 请求预加载页面数据，从而在客户端本地拼接并渲染生成一个有数据的 Html 首屏，形成首次 NSR。同时可以将该首屏 Html 缓存在客户端，供下次页面打开时，实现 "),v("code",[e._v("stale-while-revalidate")]),e._v(" 的缓存效果。")]),e._v(" "),v("p",[e._v("由于 NSR 将服务器的渲染工作放在了客户端的一个个独立设备中，既实现了页面的预加载，同时又不会增加额外的服务器压力。达到秒看的效果。")]),e._v(" "),v("p",[e._v("这种能力在拥有客户端或者支持 PWA 的应用中应用广泛，例如手 Q，腾讯文档 APP 中都拥有通过 APP 中的离线包来实现首屏渲染加速的能力。")]),e._v(" "),v("h2",{attrs:{id:"esr-edge-side-render"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#esr-edge-side-render"}},[e._v("#")]),e._v(" ESR（Edge Side Render）")]),e._v(" "),v("p",[e._v("那么，对于纯 Web 应用，而又由于兼容性等原因暂时无法支持 PWA 的页面，有没有一个合适的首屏渲染加速方案呢？")]),e._v(" "),v("p",[e._v("随着云与边缘计算的快速发展，前端页面也需要考虑分布式的请求处理优化。")]),e._v(" "),v("p",[v("img",{attrs:{src:"https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20220720162606.png",alt:"20220720162606"}})]),e._v(" "),v("p",[e._v("我们知道，CDN 节点相比真实服务节点更贴近用户，能更快将内容返回。因此我们可以将静态的 Html 内容模板缓存在 CDN 上。当接到请求时，先快速将静态模板页面返回给用户，同时在 CDN 服务器上对页面动态部分发起向后端发起请求，并将获取到的动态内容在以流式下发的方式继续返回给用户。")]),e._v(" "),v("p",[e._v("这里实际上利用到了 HTTP 的 SSE（Server Send Events）协议，通过服务器向客户端发送单向事件流，实现同一个 Html 文件的分块传输预渲染。")]),e._v(" "),v("h2",{attrs:{id:"最佳实践是"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#最佳实践是"}},[e._v("#")]),e._v(" 最佳实践是？")]),e._v(" "),v("p",[e._v("这也是我们最近实现的，通过服务中间节点的流式下发能力，实现首屏渲染加速。")])])}),[],!1,null,null,null);t.default=r.exports}}]);