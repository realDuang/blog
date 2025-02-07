---
title: 在 VSCode 中实现 Jupyter Debug Adapter
date: 2024-06-25 17:10:22
---

:::tip
说起 VSCode 中广受好评的功能，必须算上其优秀的调试（debug）功能，它拥有丰富的功能和直观的用户界面。

更为难得的是，VSCode 为这套调试架构实现的插件化机制，使得我们可以很方便地为不同的自定义语言和框架实现调试功能，并具有统一且通用的用户界面。
:::

![[20240625155834](https://code.visualstudio.com/api/extension-guides/debugger-extension)](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240625155834.png)

本文将以 Jupyter 接入 VSCode 调试的功能为例，介绍如何在 VSCode 中实现 Jupyter Debug Adapter。

## 在 VSCode 中注册 Debug Adapter Protocol

![(https://code.visualstudio.com/api/extension-guides/debugger-extension)](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240624142142.png)

从 VSCode 的相关介绍中我们可以看到，VSCode 的 Debug Adapter 是一个独立的进程，它负责处理 IDE 和调试器之间的通信。而调试功能正是通过 Debug Adapter Protocol（DAP）来实现的，它是一个标准的调试协议，用于在 IDE 和调试器之间进行通信。

而为了给 VSCode 挂载自定义的调试器，我们可以通过 `registerDebugAdapterDescriptorFactory` 这个 API 来注册我们的 Debug Adapter。由于 Jupyter 是基于 Python 语言的，因此这里的 debugType 选择 python。

之后我们就启动 debugpy 后在 vscode 中设置好 `launch.json` 入口，调试普通 python 代码了。

> 如果你想了解更多关于 Debug Adapter 的内容，可以参考 [VSCode 官方文档](https://code.visualstudio.com/api/extension-guides/debugger-extension)。

在 DAP 中，要实现一套完成的 debugger 流程，要求我们需要实现一些基本的功能，如：

1. `initialize`：初始化调试器。
2. `setBreakpoints`：设置断点。
3. `variables`/`stackTrace`/`threads`：获取相关变量、调用栈等信息。
4. `stepInto`/`stepOut`/`stepOver`：单步调试。
5. `break statement`：中断调试。

接下来我们就以 Jupyter 为例，看看如果要实现其他语言的 debug 接入，应该做哪些工作。

## 实现 Jupyter Debug Protocol

通过翻阅 [Jupyter 文档](https://jupyter-client.readthedocs.io/en/latest/messaging.html#debug-request)，我们可以知道，若要实现调试功能，其连接的 kernel 里必须要支持 Jupyter Debug Protocol，这也是我们主要需要实现的地方。

我们可以通过以下的流程图来了解 debug 从发起到结束的全过程：

![20240625145827](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240625145827.png)

1. `Initialize` 阶段。IDE 会向 kernel 发送 `initialize_request`，这个 request 将会帮我们创建一个新的 channel 用来交换调试信息。

2. `Attach` 阶段。该请求将会帮我们将建立好的 debug adaptor channel 与当前的 IDE 进行绑定，将在这里负责 debug 交互的全过程。

3. `Configuring breakpoints and exception behavior` 阶段。这一部分是将 IDE 中设置的断点等相关信息传递给 kernel，以便 kernel 能够在适当的时候中断。

   其中，setBreakpoints 等将会传递设置断点的行/函数/异常处理等信息，dumpCell 是将单元格内的内容或状态信息传递给 kernel。

   值得注意的是，这里所有的请求 msg_type 将以 `debug_event` 或者 `status` 发出而不再是 `request`。

   随着 configureationDone 的出现，标志着客户端配置过程的结束。

4. `Execute request` 阶段。这一步与正常的代码执行完全一致，发出代码执行请求，最终收获到执行结果。

   但此时，如果我们设置了 breakpoint，该过程将在执行到断点处时被一个内容为 `stopped` 的 `debug_event` 给暂时 block。

5. `Pausing and extract context` 阶段。

   当 kernel 收到 `stopped` 的`debug_event` 后，将会暂停当前的执行，此时会发送一系列`channel type` 为 `control` 的 `command`，将当前的各种相关 context 传递给 IDE。

   其中 `variables` 是获取当前 code 中的变量信息，包括其名称类型等。`stackTrace` 帮助 IDE 获取当前的调用栈信息。`scopes` 则是获取函数或变量的作用域信息。`threads` 则是获取当前处理 debug 功能所处的线程信息。

6. `Dispose` 阶段。当所有断点都被跳过后，之前的 `execute_request` 将被执行完成返回 `execute_reply`。至此 debug 流程结束。此时我们需要让 IDE 发送 `disconnect request` 来关闭当前的 debug adaptor channel。如果我们想正确执行完整的 debug 生命周期。无论是否异常结束，都需要执行 `disconnect request`。

了解了 Jupyter Debug Protocol 的全流程后，我们就可以开始着手为 VSCode 的交互实现做准备了。

## 利用 Jupyterlab 库为沟通 kernel 提供 API 支持

上面我们简要介绍了一下 Jupyter 调试过程的原理，而事实上我们并不需要完全从零开始实现 Jupyter Debug Protocol，因为开源社区里已经有了很多现成的库可以帮助我们实现这一功能。

Jupyterlab 是一个为 Jupyter 打造的第一方开发环境工具库，它提供了丰富的 API 支持，可以帮助我们更方便地与 kernel 进行交互。

在 Jupyterlab 中，我们可以通过 `jupyterlab/debugger` 这个插件来实现对 Jupyter Debug Protocol 的支持。它提供了一套完整的调试功能，包括设置断点、单步调试、查看变量等。

因此，我们真正需要实现的触发事件与交互逻辑也就变得更为清晰了。只需要处理好 debugging 的这几个实现即可：

1. debugging 的开始与终止事件
2. 断点的设置与清除
3. 代码执行
4. 变量、调用栈等的查看
5. 单步调试（包括`stepInto`/`stepOut`/`stepOver`）

因此，我们可以得出基于 jupyterlab 的调试器实现的基本流程：

![20240625161141](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240625161141.png)

## 实现 Debugging Manager 完成对调试器的管理

到了最终代码实现的阶段了。我们需要实现一个 Debugging Manager，用于通过`registerDebugAdapterDescriptorFactory` 注册给 VSCode，管理调试器的启动、停止、断点设置等操作。

具体的工程实现方案可以有很多，具体就不展开了，这里只 po 一下 [vscode-jupyter](https://github.com/microsoft/vscode-jupyter) 的实现方案：

![20240625160558](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20240625160558.png)

vscode-jupyter 通过额外增加了 `KernelDebugAdapter` 类实现了 `debug_event` 消息的收发，通过 `DebugCellController` 类来管理单元格的 debug 执行信息，实现了不同消息走不同 Controller 的分离。

## 总结

通过本文的介绍，我们可以了解 VSCode 的 Debug Adapter 的实现原理，并以 Jupyter 为例，成功在 VSCode 中实现 Jupyter Debug Adapter，并实现完全的调试能力。

得益于 VSCode 灵活的调试注入能力，我们可以方便地为更多的语言，甚至是一些自定义框架实现调试能力，这可能可以为更多的小众语言或框架的开发者带来工作效率上的帮助。
