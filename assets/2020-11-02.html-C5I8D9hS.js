import{_ as t,c as e,o as l,a}from"./app-srr4GW5I.js";const p={},i=a('<div class="custom-container tip"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 8h.01"></path><path d="M11 12h1v4h1"></path></g></svg><p class="custom-container-title">提示</p><p>对于我们程序开发者来说，想要学习一个框架，从开发一个 TodoList 项目做起，这就像学习语言先学会写 Hello world 一样基础。但其实，简单的 TodoList 里面，同样可以蕴含一些复杂的算法思想。</p></div><h2 id="从-todolist-说起" tabindex="-1"><a class="header-anchor" href="#从-todolist-说起"><span>从 TodoList 说起</span></a></h2><p>对于我们程序开发者来说，想要学习一个框架，从开发一个 TodoList 项目做起，这就像学习语言先学会写 Hello world 一样基础。但其实，简单的 TodoList 里面，同样可以蕴含一些复杂的算法思想。</p><p>设想一下，今天需要完成若干个任务，需要规划一下工作流，可以通过 TodoList 记录下来。但与普通的线性工作不同的是，每条工作任务可能会有若干个前置工作，那么现在我们该如何分配工作顺序呢？</p><p>其实这样的事情在我们自己平时的工作中经常遇到，而我们通常的做法是：优先找出不需要做前置工作的任务，将其完成。再寻找剩下的工作任务中，是否有已经将所有前置工作做完的任务，在接下来完成。如此往复，直到所有工作都已经被完成。</p><p>事实上，不知不觉中，我们已经悄然构建了一个有向无环图，并对其进行好了拓扑排序，按照拓扑序列的结果执行任务了。</p><h2 id="有向无环图与拓扑排序" tabindex="-1"><a class="header-anchor" href="#有向无环图与拓扑排序"><span>有向无环图与拓扑排序</span></a></h2><p>啥啥啥？我怎么不知道？</p><p>你看，每一个任务与它的前置任务之间都存在着一个父子关系。由于每个任务的前置可以有多个，因此使用有向图而不是有向树来表示更为合适。而已经做过的工作不会在被重复做一遍，因此工作流中不可能形成环路，从第一个工作开始，至最后一个工作结束，对于每个任务的执行必定是有且只有一遍的。而这，也就是有向无环图(Directed Acyclic Graph，下称 DAG 图)的定义了：</p><blockquote><p>如果一个有向图无法从某个顶点出发经过若干条边回到该点，则这个图是一个有向无环图。</p></blockquote><p>而拓扑序列，实际上指的是一个 DAG 图的所有顶点的线性序列，即将一个二维图展平成一维链的一种表示形式。</p><p>并非所有有向图都能生成拓扑序列，我们必须确保该图是不存在环的。</p><p>而检查有向图是否存在环的方法，我们可以跟无向图一样，以深度优先遍历的方式查找图，并在遍历时对节点染色，以方便判断该节点是否已被访问过。而其实，我们可以直接使用拓扑排序算法来更直观的进行判断。</p><p>拓扑排序的具体方法如下：先统计所有节点的入度，找到一个入度为 0 的节点作为序列的第一个节点，将该点从图中删去，同时删去以该节点为弧尾的所有有向边，并将有向边指向的顶点入度减一，得到一个新图，之后重复以上操作。</p><p>举个例子，假设有这样一个 DAG 图，其拓扑排序的算法演示如下：</p><p><img src="https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/20201012172421.png" alt="20201012172421"></p><p>这样最终得到的拓扑序列为：</p><p>A -&gt; D -&gt; E -&gt; B -&gt; C</p><p>操作结束时，若未删去所有的节点，即出现找不到入度为 0 的节点，则说明剩余的节点形成了一个环路，即该图有环，此时该函数就抛出错误，存在循环引用，终止计算。</p><h2 id="dag-图数据模型设计" tabindex="-1"><a class="header-anchor" href="#dag-图数据模型设计"><span>DAG 图数据模型设计</span></a></h2><p>在了解了 DAG 图的工作原理之后，接下来我们就可以撸起袖子开干了。</p><p>为了生成一个稳定的 DAG 图，首先我们需要一个严谨的数据模型作为工程的支撑。我们可以将项目的实现分为控制器与构成单元两个部分：</p><p>控制器部分负责 DAG 类整体的信息读取与写入，如查看布局信息，节点生成的拓扑序列，以及具体节点的增删改查等方法并在操作之后维持图的正确性，等等。</p><p>构成单元部分则相对简单，负责存放图中的自定义的顶点 node 以及关联关系 edge 的相关信息。</p><p>通过对这两部分的数据模型设计，即可描述一个完整的 DAG 图的状态扭转关系以及查改任意一处的数据或关联关系了。于是我们可以设计出一套基础且通用的数据模型，如下图所示：</p><p><img src="https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/20201103175325.png" alt="20201103175325"></p><h2 id="图结构变化后依赖关系的修复" tabindex="-1"><a class="header-anchor" href="#图结构变化后依赖关系的修复"><span>图结构变化后依赖关系的修复</span></a></h2><p>在上节数据模型中提到的 <code>高级 API</code> 对 DAG 图的操作中，都提到了一个子图的修复或重建行为，这也恰恰是这个算法中的难点，值得单独抽出来简要说一说。</p><p>当我们增加一个节点时，在设置好所有的邻边关系后，还需要对整图进行一次拓扑排序以排除存在环的可能。当存在环时，增加节点时添加的那条边可能会被弃用，以永远维持依赖图有向无环的稳定性。</p><p>当我们删除一个节点时，会使得其该节点所关联的所有入度与出度失效，因此处理这种情况时，应该先去除该节点所有的入度，取消掉对这些节点的监听，并沿着出度染色所有依赖该节点的继任节点，之后更新邻接表。</p><p>由于前置节点删除导致这些染色节点无法完成原本的计算，因此也需要将这些染色节点进行清除处理(当然，染色节点是可以根据具体产品策略来判断是否需要保留的，如保留节点但存储的数据结果返回错误)。</p><p>觉得比较难以理解的话，我们可以在下节的例子中实践一下。</p><h2 id="在-excel-中依赖图的应用" tabindex="-1"><a class="header-anchor" href="#在-excel-中依赖图的应用"><span>在 Excel 中依赖图的应用</span></a></h2><p>在 Excel 的设计中，函数功能是一个非常重要且难点极多的部分。设计函数功能，其中的难点在于：如何以代价最小的方式获取到该 Excel 函数所有依赖的数据，并能建立起对这些依赖数据的监听机制，在依赖数据更改时触发重算。</p><p>而对于这样复杂且频繁的数据变更，显然使用普通处理事件的方式：订阅者模式是不适用的，我们很难及时地进行事件的挂载与清理。</p><p>我们知道，在 Excel 表格中，一个单元格，既可以依赖多个单元格的数据，该单元格的运算结果也可以被多个单元格所依赖。并且当单元格之间形成了相互依赖时会报出循环引用 <code>&quot;#REF!&quot;</code> 错误。</p><p>经过了之前的介绍，我们很容易想到，函数的依赖关系恰好是符合 DAG 图的特性的，因此我们采用该数据结构来存储表格内所有函数之间的依赖关系，称为表格的<code>依赖图</code>。</p><p>依赖图中拥有多个单元格中存储的数据作为图顶点，(当然，在 Excel 中作为顶点的可以是任何依赖图中其它顶点的自定义数据，以下统一称之为数据节点)，这些顶点之间存在的依赖关系作为图的边。</p><p>当依赖图建立完成以后，我们就能够处理任意一处的数据变更导致所有依赖节点的数据重算了。从变更的节点开始进行拓扑排序，依照生成的拓扑序列依次重算所有继任节点，直到所有相关节点数据都被更新完成。</p><p>我们来举一个例子，模拟一下计算机是怎样处理表格的依赖关系的。</p><p>假如有如下的一个 Excel 表格：</p><table><thead><tr><th style="text-align:center;"></th><th style="text-align:right;">A</th><th style="text-align:right;">B</th></tr></thead><tbody><tr><td style="text-align:center;">1</td><td style="text-align:right;">1</td><td style="text-align:right;">=A1*A2</td></tr><tr><td style="text-align:center;">2</td><td style="text-align:right;">=A1+1</td><td style="text-align:right;">=SUM(A1, A2)+B1</td></tr></tbody></table><p>他的依赖关系是什么样的呢，我们可以很清晰地梳理出来。</p><p><img src="https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/20201105205629.png" alt="20201105205629"></p><p>再检查一下环，很好，符合DAG图的定义，可以开始计算了。</p><p>先进行一次整表的拓扑排序，得到如下结果：</p><p>A1 -&gt; A2 -&gt; B1 -&gt; SUM函数 -&gt; B2</p><p>接下来就可以依次对每个节点进行计算了。由于每个节点计算所需的参数都已经在前置处理中计算完成，因此每一个单元格的结果都是确定的。最终该Excel展现出来的结果如下，这样就帮助Excel完成了一次依赖图建造与首次计算。</p><table><thead><tr><th style="text-align:center;"></th><th style="text-align:right;">A</th><th style="text-align:right;">B</th></tr></thead><tbody><tr><td style="text-align:center;">1</td><td style="text-align:right;">1</td><td style="text-align:right;">2</td></tr><tr><td style="text-align:center;">2</td><td style="text-align:right;">2</td><td style="text-align:right;">5</td></tr></tbody></table><p>我们也可以来试试用户操作对依赖图的影响。我们可以看看把表格的A2单元格删除会发生什么。</p><p>按照之前所介绍的，当节点删除时同时也要删去其入度，变成下图这样：</p><p><img src="https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/20201105213506.png" alt="20201105213506"></p><p>接下来沿着出度对所有继任节点染色，B1单元格、SUM函数进入计算队列。</p><p>接下来遍历染色节点，由于这些节点处于依赖条件不满足，无法计算的状态，根据Excel产品的策略，他们返回计算错误结果 <code>#VALUE!</code>。</p><p>(如果你在Excel中尝试了这个数据却发现没有出现错误结果，是因为Excel对空值做了默认处理，在数字计算时转化成了0。)</p><p>之后更新他们的继任节点，根据拓扑排序结果，B2单元格进入计算队列。由于<code>#VALUE!</code>的结果无法正常参与计算，因此B2单元格也返回<code>#VALUE!</code>。最终Excel展示结果如下：</p><table><thead><tr><th style="text-align:center;"></th><th style="text-align:right;">A</th><th style="text-align:right;">B</th></tr></thead><tbody><tr><td style="text-align:center;">1</td><td style="text-align:right;">1</td><td style="text-align:right;">#VALUE!</td></tr><tr><td style="text-align:center;">2</td><td style="text-align:right;"></td><td style="text-align:right;">#VALUE!</td></tr></tbody></table><p>至此，Excel的依赖图结构以及数据就完成了一次更新。</p><h2 id="写在结尾" tabindex="-1"><a class="header-anchor" href="#写在结尾"><span>写在结尾</span></a></h2><p>当然，在 Excel 中真实的依赖图架构的数据模型要比上节所介绍的复杂得多。从节点的种类上，我们可能需要区分单元格节点、范围节点、位置节点、函数节点、甚至各种各样的自定义节点，他们在接收图的变化时都有着不同的行为。在对图的操作上，也会多出来许多情况需要考虑，如行列变更、复制粘贴、数据格式继承等等可能导致依赖图需要重算甚至重构的情况。</p><p>这里又可以细讲出很多篇文章，在此就不过多展开了，感兴趣的话可以在上节中基础的数据模型上自行扩展。</p><p>在复杂的工程项目架构中，往往存在着大量精妙的算法设计。有向无环图的思路在 Excel 的设计中也只是其中一隅，下次我会介绍更多 Excel 中涉及到的算法思路，帮助大家认识合适的算法思想对复杂问题的解决有多大的帮助。</p>',62),d=[i];function n(s,r){return l(),e("div",null,d)}const o=t(p,[["render",n],["__file","2020-11-02.html.vue"]]),h=JSON.parse('{"path":"/blogs/frontend-tech-institute/2020-11-02.html","title":"有向无环图的模型设计与应用","lang":"en-US","frontmatter":{"title":"有向无环图的模型设计与应用","date":"2020-11-02T15:59:22.000Z","categories":["前端技术研究院"],"tags":["设计模式","算法"]},"headers":[{"level":2,"title":"从 TodoList 说起","slug":"从-todolist-说起","link":"#从-todolist-说起","children":[]},{"level":2,"title":"有向无环图与拓扑排序","slug":"有向无环图与拓扑排序","link":"#有向无环图与拓扑排序","children":[]},{"level":2,"title":"DAG 图数据模型设计","slug":"dag-图数据模型设计","link":"#dag-图数据模型设计","children":[]},{"level":2,"title":"图结构变化后依赖关系的修复","slug":"图结构变化后依赖关系的修复","link":"#图结构变化后依赖关系的修复","children":[]},{"level":2,"title":"在 Excel 中依赖图的应用","slug":"在-excel-中依赖图的应用","link":"#在-excel-中依赖图的应用","children":[]},{"level":2,"title":"写在结尾","slug":"写在结尾","link":"#写在结尾","children":[]}],"git":{"createdTime":1738930383000,"updatedTime":1738930383000,"contributors":[{"name":"Duang Cheng","email":"longcheng@microsoft.com","commits":1}]},"filePathRelative":"blogs/frontend-tech-institute/2020-11-02.md"}');export{o as comp,h as data};
