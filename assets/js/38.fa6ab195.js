(window.webpackJsonp=window.webpackJsonp||[]).push([[38],{535:function(t,e,n){"use strict";n.r(e);var s=n(7),a=Object(s.a)({},(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[n("div",{staticClass:"custom-block tip"},[n("p",{staticClass:"title"}),n("p",[t._v("最近在着手腾讯文档的输入体验优化，在其中有一个不起眼的小需求引起了我的注意，并顺便研究了一些事件监听机制相结合的特点，特此记录一下填坑过程。")])]),t._v(" "),n("h2",{attrs:{id:"模拟光标跟随"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#模拟光标跟随"}},[t._v("#")]),t._v(" 模拟光标跟随")]),t._v(" "),n("p",[t._v("大部分的主流输入法都有这样一个特性，在输入中文时，可以通过左右方向键控制光标，移动至输入区中任意两个字符之间的位置，用户接下来的字符输入将在光标处直接插入。")]),t._v(" "),n("p",[t._v("由于腾讯文档的渲染的画布是完全自主实现的，为了在体验上与普通可编辑画布保持一致，我们需要自己来模拟这一光标的移动行为。")]),t._v(" "),n("p",[t._v("首先，我们需要确定的是输入法中的模拟光标进行更新的时机。经试验，用户在进行中文输入时，若使用了"),n("em",[t._v("方向键")]),t._v("移动光标，将会触发光标的移动行为。因此，首先要解决的是使用合适的事件监听来捕获这一行为，从而进行更新。既然是对输入框的行为进行模拟，自然而然的，我们首先想到的是输入框触发的监听器。")]),t._v(" "),n("h2",{attrs:{id:"浏览器输入框对输入的监听机制"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#浏览器输入框对输入的监听机制"}},[t._v("#")]),t._v(" 浏览器输入框对输入的监听机制")]),t._v(" "),n("p",[t._v("在浏览器对键盘的输入规范中，将键盘输入分为了直接输入与间接输入两种。直接输入将会触发输入框的 "),n("code",[t._v("onInput")]),t._v(" 事件 (IE9 之前不支持该事件，只能用 "),n("code",[t._v("onKeyUp")]),t._v(" 等键盘事件作为降级选择）。而对于间接输入，规范将事件监听分为了 "),n("code",[t._v("onCompositionStart")]),t._v(", "),n("code",[t._v("onCompositionUpdate")]),t._v(", "),n("code",[t._v("onCompositionEnd")]),t._v(" 三个部分。")]),t._v(" "),n("p",[t._v("而间接输入的同时，中间态的写入也会导致输入框内容的变化，从而也会触发 "),n("code",[t._v("onInput")]),t._v(" 事件。因此在间接输入中，事件的触发次序为："),n("code",[t._v("onCompositionStart")]),t._v(", "),n("code",[t._v("onCompositionUpdate")]),t._v(", "),n("code",[t._v("onInput")]),t._v(", "),n("code",[t._v("onCompositionEnd")]),t._v("。")]),t._v(" "),n("p",[n("img",{attrs:{src:"https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20210203173000.png",alt:"20210203173000"}})]),t._v(" "),n("p",[t._v("需要注意的是，若输入完成时，输入框的内容没有发生变化，则 "),n("code",[t._v("onChange")]),t._v(" 事件与 "),n("code",[t._v("onCompositionEnd")]),t._v(" 事件都将不会被触发。")]),t._v(" "),n("p",[t._v("中文输入法在键入选词的过程属于间接输入情况，此时中间文本不会直接落盘在输入框内。而通过回车等按键退出中文输入选词后，中文文字将会落盘到输入框，此时属于直接输入情况。")]),t._v(" "),n("p",[t._v("而我们需要关注的光标事件显然是在间接输入中获取到的。在输入法选词光标左右移动时，由于内容不变，此时并不会触发 "),n("code",[t._v("onInput")]),t._v(" 事件，但是会触发一次 "),n("code",[t._v("onCompositionUpdate")]),t._v(" 事件，我们可以通过这个事件来判断光标位置，重置画布的光标位置。但最终我们并未使用这个事件做判断器，原因在下面会讲到。")]),t._v(" "),n("h2",{attrs:{id:"判断当前光标的位置"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#判断当前光标的位置"}},[t._v("#")]),t._v(" 判断当前光标的位置")]),t._v(" "),n("p",[t._v("解决了了光标的重置时机，接下来就该解决光标的位置判定了。由于 DOM 标准中并没有直接获取光标位置的方法，因此这一块也需要我们自主实现。我的思路是，通过选取光标到输入起始位置的字符串，判断选中的字符串长度，即可知道光标当前位置相对于起始位置的偏移量，从而确定光标位置。")]),t._v(" "),n("p",[t._v("对于普通的 input 输入框来说起始比较简单，输入框提供了 "),n("code",[t._v("inputElement.selectionStart")]),t._v(" 属性作为当前光标位置距离输入起始点的偏移量，我们直接使用就可以了。但是对于 "),n("code",[t._v("contentEditable=true")]),t._v(" 的 div 节点来说是没有这一属性的，我们得另想办法。")]),t._v(" "),n("p",[t._v("根据之前写 E2E 测试得来的灵感，我们可以模拟创建一个从当前光标位置到输入起始位置的选区，通过判断该选区的字符串长度即光标所在位置的偏移量。通过 "),n("code",[t._v("window.getSelection()")]),t._v(" 方法能够得到 Selection 对象，这是一个表示当前文本选区的对象，由于我们正处在输入状态中，因此该选区位置就在当前的输入框中，从而能获取到上面所需的偏移量。")]),t._v(" "),n("div",{staticClass:"language-js line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-js"}},[n("code",[n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" selection "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" window"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("getSelection")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 确定输入框在输入态，存在选区")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("selection"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("rangeCount "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" range "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" selection"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("getRangeAt")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" range"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("endOffset"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])]),t._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[t._v("1")]),n("br"),n("span",{staticClass:"line-number"},[t._v("2")]),n("br"),n("span",{staticClass:"line-number"},[t._v("3")]),n("br"),n("span",{staticClass:"line-number"},[t._v("4")]),n("br"),n("span",{staticClass:"line-number"},[t._v("5")]),n("br"),n("span",{staticClass:"line-number"},[t._v("6")]),n("br")])]),n("p",[t._v("获取完光标位置，还需要在我们的画布上重新设置回去。设置的思路其实是类似的，通过使用"),n("code",[t._v("document.createRange")]),t._v("方法新建一个选区范围，其起始位置设置为需要移动的目标位置，然后移除选区，即可使光标落在目标位置了。")]),t._v(" "),n("h2",{attrs:{id:"性能优化"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#性能优化"}},[t._v("#")]),t._v(" 性能优化")]),t._v(" "),n("p",[t._v("之前说到在光标移动时的确会触发一次"),n("code",[t._v("onCompositionUpdate")]),t._v(" 事件。但是，"),n("code",[t._v("onCompositionUpdate")]),t._v(" 事件是一个高频的操作，每一次间接输入时都会触发，这会导致光标不断地重置位置，带来不必要的性能损失。")]),t._v(" "),n("p",[t._v("并且，"),n("code",[t._v("onCompositionUpdate")]),t._v(" 事件的入参只有更新的中间字符串值，只能用来判断输入中间字符串是否发生变化。移动光标行为本身并不会导致字符串发生改变，但反过来，使字符串不发生改变的操作一定是移动光标操作这一说法并不成立。因此，尽管移动光标会触发该事件，但我们仍然没有有效的手段去判断是输入法中的光标移动导致的事件触发。")]),t._v(" "),n("p",[t._v("那么，之前用很大篇幅讲过光标变动的本质实际上是选区变化，那么，输入法触发的光标移动会不会给输入框发出选区变更通知呢？很不幸，目前绝大多数的输入法都是不支持的。并且由于光标移动被视为输入法内部的行为，因此在输入框中光标所进行的移动，不会有事件主动抛出。因此，输入框中的选区变更事件 "),n("code",[t._v("onSelectionChange")]),t._v(" 事件也无法被触发。")]),t._v(" "),n("p",[t._v("既然输入框中的事件监听无法准确判断光标的移动，我们只能退而求其次，从更低层次的逻辑，通过监听键盘的按键输入来尝试还原这一行为了。优化思路是这样的，触发光标跟随的时机规则为：用户输入时，若使用了"),n("em",[t._v("左方向键")]),t._v("移动光标，将会开启光标跟随的能力，随着输入不断更新的光标位置，直到光标再次被移动到末尾位置结束。由于中文输入时按下"),n("em",[t._v("左方向键")]),t._v("的行为是一个低频操作，这样一来，大部分的输入操作都不需要执行判断并重置光标，提高普通输入下的性能表现。")]),t._v(" "),n("p",[t._v("附上最终的判断逻辑吧：")]),t._v(" "),n("p",[n("img",{attrs:{src:"https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20210207174544.png",alt:"20210207174544"}})]),t._v(" "),n("p",[t._v("那么，如何获取并判断用户输入时的按键信息呢？当然是使用更第一层级的事件接口 KeyboardEvent 了。")]),t._v(" "),n("h2",{attrs:{id:"键盘输入事件对中文输入法的支持"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#键盘输入事件对中文输入法的支持"}},[t._v("#")]),t._v(" 键盘输入事件对中文输入法的支持")]),t._v(" "),n("p",[t._v("KeyboardEvent 在低层级下提示用户与一个键盘按键的交互是什么，不涉及这个交互的上下文含义。一般来说当你需要处理文本输入的时候，应当使用上节所说的输入框监听事件代替。例如当用户使用其他方式输入文本时，如平板电脑的手写系统等，键盘事件可能不会触发。")]),t._v(" "),n("blockquote",[n("p",[t._v("KeyboardEvent 对象描述了用户与键盘的交互。 每个事件都描述了用户与一个按键（或一个按键和修饰键的组合）的单个交互；事件类型 keydown，keypress 与 keyup 用于识别不同的键盘活动类型。")])]),t._v(" "),n("p",[t._v("键盘输入事件的设计思路与间接输入的钩子类似，浏览器中对于键盘输入同样分为 "),n("code",[t._v("onKeyDown")]),t._v(", "),n("code",[t._v("onKeyPress")]),t._v(", "),n("code",[t._v("onKeyUp")]),t._v(" 三个阶段的事件触发，分别对应按键不同的行为触发时机。（注："),n("code",[t._v("onKeyPress")]),t._v(" 事件高度依赖设备支持，所以尽量不要使用该钩子）")]),t._v(" "),n("p",[t._v("这三个事件都传入了 KeyboardEvent 入参，帮助我们了解当前执行该事件时触发的按键信息。MDN 上该入参具有如下属性支持：")]),t._v(" "),n("p",[n("img",{attrs:{src:"https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20210203204752.png",alt:"20210203204752"}})]),t._v(" "),n("p",[t._v("在文档规范中，我们可以发现许多对问题的解决十分有用的新属性，例如 "),n("code",[t._v("event.isComposing")]),t._v(" 属性用于判断当前是否会触发 "),n("code",[t._v("onCompositionUpdate")]),t._v(" 事件，"),n("code",[t._v("event.code")]),t._v(" 用于判断与键盘布局与输入状态无关的当前按键输入，获取中文输入中的按键轻而易举。我们可以利用这两个状态帮助我们完成按键监听与事件触发。")]),t._v(" "),n("h2",{attrs:{id:"兜底方案支持"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#兜底方案支持"}},[t._v("#")]),t._v(" 兜底方案支持")]),t._v(" "),n("p",[t._v("之前说过， KeyboardEvent 是一个十分依赖软硬件支持的事件，不仅需要浏览器的能力支持，与输入法甚至键盘类型都有关系。经试验后发现，这些新属性在许多浏览器与输入法的组合中都无法通过"),n("code",[t._v("onKeyDown")]),t._v("正确获取，在 Windows 下部分中文输入法甚至都无法支持 "),n("code",[t._v("event.key")]),t._v(" 属性。为了达到最大的兼容性，在兜底的方法下，仅能用 "),n("code",[t._v("event.keyCode")]),t._v(" 这种已经被 deprecated 的方法来勉强替代使用了。")]),t._v(" "),n("p",[t._v("兜底方案的使用问题就此解决了吗？并没有。中文拼音的输入中间字符是系统无法识别的。在 Windows 桌面应用程序对键盘输入规范中，我们发现 Windows 将所有未识别的设备输入都设置为 "),n("code",[t._v("VK_PROCESSKEY 229")]),t._v("，浏览器的 "),n("code",[t._v("event.keyCode")]),t._v(" 复用了这一规范，因此在中文输入过程中，无论按下什么按键，返回的 "),n("code",[t._v("event.keyCode")]),t._v(" 永远是 229。")]),t._v(" "),n("p",[t._v("网上对于该问题的解决方案都是建议使用 "),n("code",[t._v("onKeyUp")]),t._v(" 代替 "),n("code",[t._v("onKeyDown")]),t._v("。但首先，这不满足对于一个要求实时体现输入的光标移动操作要求。第二，使用 "),n("code",[t._v("onKeyUp")]),t._v(" 会有更多的问题，在 Windows 下进行中文输入时，由于不同的输入法回调 "),n("code",[t._v("onKeyUp")]),t._v(" 的实现不同，该事件可能会被触发一次或两次，要么全为 229，要么一次为 229，另一次为正确的 key（对，说的就是你，搜狗）。为了避免我们去不断去填五花八门的第三方输入法实现的坑，兜底方案采用了当检测到输入了未识别的按键时，也启用光标跟随能力。")]),t._v(" "),n("h2",{attrs:{id:"结语"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#结语"}},[t._v("#")]),t._v(" 结语")]),t._v(" "),n("p",[t._v("一套操作下来，这套中文输入法下光标跟随的功能算是完美实现了。回顾一下我们解决这个问题所趟过的坑，实际上也反映着浏览器 JS DOM 标准在不断进化，不断补足历史遗留的坑点。当然，它还远远称不上完美，仍然存在大量的能力缺失，如我们在这个问题中遇到的判断光标偏移量的解决方案，本质上还是一种 hack。而扩展 JS 的能力边界，使其变得更强大，更好用，这正是我们作为前端开发人员需要努力的方向。")])])}),[],!1,null,null,null);e.default=a.exports}}]);