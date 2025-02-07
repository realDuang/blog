import{_ as r,c as p,a as t,b as o,d as e,e as c,r as a,o as n}from"./app-srr4GW5I.js";const l={},i=t('<div class="custom-container tip"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 8h.01"></path><path d="M11 12h1v4h1"></path></g></svg><p class="custom-container-title">提示</p><p>说起 VSCode 中广受好评的功能，必须算上其优秀的调试（debug）功能，它拥有丰富的功能和直观的用户界面。</p><p>更为难得的是，VSCode 为这套调试架构实现的插件化机制，使得我们可以很方便地为不同的自定义语言和框架实现调试功能，并具有统一且通用的用户界面。</p></div><p><img src="https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240625155834.png" alt="20240625155834"></p><p>本文将以 Jupyter 接入 VSCode 调试的功能为例，介绍如何在 VSCode 中实现 Jupyter Debug Adapter。</p><h2 id="在-vscode-中注册-debug-adapter-protocol" tabindex="-1"><a class="header-anchor" href="#在-vscode-中注册-debug-adapter-protocol"><span>在 VSCode 中注册 Debug Adapter Protocol</span></a></h2><p><img src="https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240624142142.png" alt="(https://code.visualstudio.com/api/extension-guides/debugger-extension)"></p><p>从 VSCode 的相关介绍中我们可以看到，VSCode 的 Debug Adapter 是一个独立的进程，它负责处理 IDE 和调试器之间的通信。而调试功能正是通过 Debug Adapter Protocol（DAP）来实现的，它是一个标准的调试协议，用于在 IDE 和调试器之间进行通信。</p><p>而为了给 VSCode 挂载自定义的调试器，我们可以通过 <code>registerDebugAdapterDescriptorFactory</code> 这个 API 来注册我们的 Debug Adapter。由于 Jupyter 是基于 Python 语言的，因此这里的 debugType 选择 python。</p><p>之后我们就启动 debugpy 后在 vscode 中设置好 <code>launch.json</code> 入口，调试普通 python 代码了。</p>',8),s={href:"https://code.visualstudio.com/api/extension-guides/debugger-extension",target:"_blank",rel:"noopener noreferrer"},u=t('<p>在 DAP 中，要实现一套完成的 debugger 流程，要求我们需要实现一些基本的功能，如：</p><ol><li><code>initialize</code>：初始化调试器。</li><li><code>setBreakpoints</code>：设置断点。</li><li><code>variables</code>/<code>stackTrace</code>/<code>threads</code>：获取相关变量、调用栈等信息。</li><li><code>stepInto</code>/<code>stepOut</code>/<code>stepOver</code>：单步调试。</li><li><code>break statement</code>：中断调试。</li></ol><p>接下来我们就以 Jupyter 为例，看看如果要实现其他语言的 debug 接入，应该做哪些工作。</p><h2 id="实现-jupyter-debug-protocol" tabindex="-1"><a class="header-anchor" href="#实现-jupyter-debug-protocol"><span>实现 Jupyter Debug Protocol</span></a></h2>',4),g={href:"https://jupyter-client.readthedocs.io/en/latest/messaging.html#debug-request",target:"_blank",rel:"noopener noreferrer"},b=t('<p>我们可以通过以下的流程图来了解 debug 从发起到结束的全过程：</p><p><img src="https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240625145827.png" alt="20240625145827"></p><ol><li><p><code>Initialize</code> 阶段。IDE 会向 kernel 发送 <code>initialize_request</code>，这个 request 将会帮我们创建一个新的 channel 用来交换调试信息。</p></li><li><p><code>Attach</code> 阶段。该请求将会帮我们将建立好的 debug adaptor channel 与当前的 IDE 进行绑定，将在这里负责 debug 交互的全过程。</p></li><li><p><code>Configuring breakpoints and exception behavior</code> 阶段。这一部分是将 IDE 中设置的断点等相关信息传递给 kernel，以便 kernel 能够在适当的时候中断。</p><p>其中，setBreakpoints 等将会传递设置断点的行/函数/异常处理等信息，dumpCell 是将单元格内的内容或状态信息传递给 kernel。</p><p>值得注意的是，这里所有的请求 msg_type 将以 <code>debug_event</code> 或者 <code>status</code> 发出而不再是 <code>request</code>。</p><p>随着 configureationDone 的出现，标志着客户端配置过程的结束。</p></li><li><p><code>Execute request</code> 阶段。这一步与正常的代码执行完全一致，发出代码执行请求，最终收获到执行结果。</p><p>但此时，如果我们设置了 breakpoint，该过程将在执行到断点处时被一个内容为 <code>stopped</code> 的 <code>debug_event</code> 给暂时 block。</p></li><li><p><code>Pausing and extract context</code> 阶段。</p><p>当 kernel 收到 <code>stopped</code> 的<code>debug_event</code> 后，将会暂停当前的执行，此时会发送一系列<code>channel type</code> 为 <code>control</code> 的 <code>command</code>，将当前的各种相关 context 传递给 IDE。</p><p>其中 <code>variables</code> 是获取当前 code 中的变量信息，包括其名称类型等。<code>stackTrace</code> 帮助 IDE 获取当前的调用栈信息。<code>scopes</code> 则是获取函数或变量的作用域信息。<code>threads</code> 则是获取当前处理 debug 功能所处的线程信息。</p></li><li><p><code>Dispose</code> 阶段。当所有断点都被跳过后，之前的 <code>execute_request</code> 将被执行完成返回 <code>execute_reply</code>。至此 debug 流程结束。此时我们需要让 IDE 发送 <code>disconnect request</code> 来关闭当前的 debug adaptor channel。如果我们想正确执行完整的 debug 生命周期。无论是否异常结束，都需要执行 <code>disconnect request</code>。</p></li></ol><p>了解了 Jupyter Debug Protocol 的全流程后，我们就可以开始着手为 VSCode 的交互实现做准备了。</p><h2 id="利用-jupyterlab-库为沟通-kernel-提供-api-支持" tabindex="-1"><a class="header-anchor" href="#利用-jupyterlab-库为沟通-kernel-提供-api-支持"><span>利用 Jupyterlab 库为沟通 kernel 提供 API 支持</span></a></h2><p>上面我们简要介绍了一下 Jupyter 调试过程的原理，而事实上我们并不需要完全从零开始实现 Jupyter Debug Protocol，因为开源社区里已经有了很多现成的库可以帮助我们实现这一功能。</p><p>Jupyterlab 是一个为 Jupyter 打造的第一方开发环境工具库，它提供了丰富的 API 支持，可以帮助我们更方便地与 kernel 进行交互。</p><p>在 Jupyterlab 中，我们可以通过 <code>jupyterlab/debugger</code> 这个插件来实现对 Jupyter Debug Protocol 的支持。它提供了一套完整的调试功能，包括设置断点、单步调试、查看变量等。</p><p>因此，我们真正需要实现的触发事件与交互逻辑也就变得更为清晰了。只需要处理好 debugging 的这几个实现即可：</p><ol><li>debugging 的开始与终止事件</li><li>断点的设置与清除</li><li>代码执行</li><li>变量、调用栈等的查看</li><li>单步调试（包括<code>stepInto</code>/<code>stepOut</code>/<code>stepOver</code>）</li></ol><p>因此，我们可以得出基于 jupyterlab 的调试器实现的基本流程：</p><p><img src="https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240625161141.png" alt="20240625161141"></p><h2 id="实现-debugging-manager-完成对调试器的管理" tabindex="-1"><a class="header-anchor" href="#实现-debugging-manager-完成对调试器的管理"><span>实现 Debugging Manager 完成对调试器的管理</span></a></h2><p>到了最终代码实现的阶段了。我们需要实现一个 Debugging Manager，用于通过<code>registerDebugAdapterDescriptorFactory</code> 注册给 VSCode，管理调试器的启动、停止、断点设置等操作。</p>',14),h={href:"https://github.com/microsoft/vscode-jupyter",target:"_blank",rel:"noopener noreferrer"},m=t('<p><img src="https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240625160558.png" alt="20240625160558"></p><p>vscode-jupyter 通过额外增加了 <code>KernelDebugAdapter</code> 类实现了 <code>debug_event</code> 消息的收发，通过 <code>DebugCellController</code> 类来管理单元格的 debug 执行信息，实现了不同消息走不同 Controller 的分离。</p><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2><p>通过本文的介绍，我们可以了解 VSCode 的 Debug Adapter 的实现原理，并以 Jupyter 为例，成功在 VSCode 中实现 Jupyter Debug Adapter，并实现完全的调试能力。</p><p>得益于 VSCode 灵活的调试注入能力，我们可以方便地为更多的语言，甚至是一些自定义框架实现调试能力，这可能可以为更多的小众语言或框架的开发者带来工作效率上的帮助。</p>',5);function y(k,D){const d=a("ExternalLinkIcon");return n(),p("div",null,[i,o("blockquote",null,[o("p",null,[e("如果你想了解更多关于 Debug Adapter 的内容，可以参考 "),o("a",s,[e("VSCode 官方文档"),c(d)]),e("。")])]),u,o("p",null,[e("通过翻阅 "),o("a",g,[e("Jupyter 文档"),c(d)]),e("，我们可以知道，若要实现调试功能，其连接的 kernel 里必须要支持 Jupyter Debug Protocol，这也是我们主要需要实现的地方。")]),b,o("p",null,[e("具体的工程实现方案可以有很多，具体就不展开了，这里只 po 一下 "),o("a",h,[e("vscode-jupyter"),c(d)]),e(" 的实现方案：")]),m])}const _=r(l,[["render",y],["__file","implementing-jupyter-debug-adapter-in-vscode.html.vue"]]),x=JSON.parse('{"path":"/blogs/vscode-for-web/implementing-jupyter-debug-adapter-in-vscode.html","title":"在 VSCode 中实现 Jupyter Debug Adapter","lang":"en-US","frontmatter":{"title":"在 VSCode 中实现 Jupyter Debug Adapter","date":"2024-06-25T17:10:22.000Z","categories":["VSCode For Web 深入浅出"],"tags":["VS Code","Jupyter","Debug Adapter"]},"headers":[{"level":2,"title":"在 VSCode 中注册 Debug Adapter Protocol","slug":"在-vscode-中注册-debug-adapter-protocol","link":"#在-vscode-中注册-debug-adapter-protocol","children":[]},{"level":2,"title":"实现 Jupyter Debug Protocol","slug":"实现-jupyter-debug-protocol","link":"#实现-jupyter-debug-protocol","children":[]},{"level":2,"title":"利用 Jupyterlab 库为沟通 kernel 提供 API 支持","slug":"利用-jupyterlab-库为沟通-kernel-提供-api-支持","link":"#利用-jupyterlab-库为沟通-kernel-提供-api-支持","children":[]},{"level":2,"title":"实现 Debugging Manager 完成对调试器的管理","slug":"实现-debugging-manager-完成对调试器的管理","link":"#实现-debugging-manager-完成对调试器的管理","children":[]},{"level":2,"title":"总结","slug":"总结","link":"#总结","children":[]}],"git":{"createdTime":1738930383000,"updatedTime":1738930383000,"contributors":[{"name":"Duang Cheng","email":"longcheng@microsoft.com","commits":1}]},"filePathRelative":"blogs/vscode-for-web/implementing-jupyter-debug-adapter-in-vscode.md"}');export{_ as comp,x as data};
