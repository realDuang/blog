import{_ as t,c as l,a as i,b as n,d as s,e as a,r as o,o as p}from"./app-srr4GW5I.js";const c={},r=i('<div class="custom-container tip"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 8h.01"></path><path d="M11 12h1v4h1"></path></g></svg><p class="custom-container-title">提示</p><p>解决 github + Hexo 的博客多终端同步的思路是将博文内容相关文件放在 Github 项目中 master 中，将 Hexo 配置写博客用的相关文件放在 Github 项目的 hexo 分支上，这个是关键，多终端的同步只需要对分支 hexo 进行操作。</p></div><p>下面是详细的步骤讲解：</p><h2 id="_1-准备条件" tabindex="-1"><a class="header-anchor" href="#_1-准备条件"><span>1. 准备条件</span></a></h2>',3),h={href:"https://xuanwo.org/2015/03/26/hexo-intor/",target:"_blank",rel:"noopener noreferrer"},u=i(`<p>配置好这些，就可以捋起袖子大干一场了！</p><h2 id="_2-在其中一个终端操作-push-本地文件夹-hexo-中的必要文件到-yourname-github-io-的-hexo-分支上" tabindex="-1"><a class="header-anchor" href="#_2-在其中一个终端操作-push-本地文件夹-hexo-中的必要文件到-yourname-github-io-的-hexo-分支上"><span>2. 在其中一个终端操作，push 本地文件夹 Hexo 中的必要文件到 yourname.github.io 的 hexo 分支上</span></a></h2><p>在利用 Github+Hexo 搭建自己的博客时，新建了一个 Hexo 的文件夹，并进行相关的配置，这部分主要是将这些配置的文件托管到 Github 项目的分支上，其中只托管部分用于多终端的同步的文件，如完成的效果图所示：</p><p>git init //初始化本地仓库 git add source //将必要的文件依次添加，有些文件夹如 npm install 产生的 node_modules 由于路径过长不好处理，所以这里没有用&#39;git add .&#39;命令了，而是依次添加必要文件，如下所示</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> commit <span class="token parameter variable">-m</span> <span class="token string">&quot;Blog Source Hexo&quot;</span></span>
<span class="line"><span class="token function">git</span> branch hexo  //新建 hexo 分支</span>
<span class="line"><span class="token function">git</span> checkout hexo  //切换到 hexo 分支上</span>
<span class="line"><span class="token function">git</span> remote <span class="token function">add</span> origin git@github.com:yourname/yourname.github.io.git  //将本地与 Github 项目对接</span>
<span class="line"><span class="token function">git</span> push origin hexo  //push 到 Github 项目的 hexo 分支上</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>完成之后的效果图为：</p><p><img src="https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/sync-hexo-01.png" alt="hexo 分支"></p><p>这样你的 github 项目中就会多出一个 Hexo 分支，这个就是用于多终端同步关键的部分。</p><h2 id="_3-另一终端完成-clone-和-push-更新" tabindex="-1"><a class="header-anchor" href="#_3-另一终端完成-clone-和-push-更新"><span>3. 另一终端完成 clone 和 push 更新</span></a></h2><p>此时在另一终端更新博客，只需要将 Github 的 hexo 分支 clone 下来，进行初次的相关配置</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> clone <span class="token parameter variable">-b</span> hexo git@github.com:yourname/yourname.github.io.git  //将 Github 中 hexo 分支 clone 到本地</span>
<span class="line"><span class="token builtin class-name">cd</span>  yourname.github.io  //切换到刚刚 clone 的文件夹内</span>
<span class="line"><span class="token function">npm</span> <span class="token function">install</span>    //注意，这里一定要切换到刚刚 clone 的文件夹内执行，安装必要的所需组件，不用再 init</span>
<span class="line">hexo new post <span class="token string">&quot;new blog name&quot;</span>   //新建一个。md 文件，并编辑完成自己的博客内容</span>
<span class="line"><span class="token function">git</span> <span class="token function">add</span> <span class="token builtin class-name">source</span>  //经测试每次只要更新 sorcerer 中的文件到 Github 中即可，因为只是新建了一篇新博客</span>
<span class="line"><span class="token function">git</span> commit <span class="token parameter variable">-m</span> <span class="token string">&quot;XX&quot;</span></span>
<span class="line"><span class="token function">git</span> push origin hexo  //更新分支</span>
<span class="line">hexo d <span class="token parameter variable">-g</span>   //push 更新完分支之后将自己写的博客对接到自己搭的博客网站上，同时同步了 Github 中的 master</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_4-不同终端间愉快地玩耍" tabindex="-1"><a class="header-anchor" href="#_4-不同终端间愉快地玩耍"><span>4. 不同终端间愉快地玩耍</span></a></h2><p>在不同的终端已经做完配置，就可以愉快的分享自己更新的博客</p><p>进入自己相应的文件夹</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh" data-title="sh"><pre><code><span class="line"><span class="token function">git</span> pull origin hexo  //先 pull 完成本地与远端的融合</span>
<span class="line">hexo new post <span class="token string">&quot; new blog name&quot;</span></span>
<span class="line"><span class="token function">git</span> <span class="token function">add</span> <span class="token builtin class-name">source</span></span>
<span class="line"><span class="token function">git</span> commit <span class="token parameter variable">-m</span> <span class="token string">&quot;XX&quot;</span></span>
<span class="line"><span class="token function">git</span> push origin hexo</span>
<span class="line">hexo d <span class="token parameter variable">-g</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,15),d={href:"http://blog.csdn.net/Monkey_LZL/article/details/60870891",target:"_blank",rel:"noopener noreferrer"};function m(g,b){const e=o("ExternalLinkIcon");return p(),l("div",null,[r,n("p",null,[s("安装了 Node.js,Git,Hexo 环境 完成 Github 与本地 Hexo 的对接 这部分大家可以参考史上 "),n("a",h,[s("最详细的 Hexo 博客搭建图文教程"),a(e)])]),u,n("p",null,[s("本文转载自："),n("a",d,[s("http://blog.csdn.net/Monkey_LZL/article/details/60870891"),a(e)])])])}const x=t(c,[["render",m],["__file","2017-05-12.html.vue"]]),k=JSON.parse('{"path":"/blogs/others/2017-05-12.html","title":"解决 github + Hexo 的博客多终端同步问题","lang":"en-US","frontmatter":{"title":"解决 github + Hexo 的博客多终端同步问题","date":"2017-05-12T15:51:06.000Z","categories":["其他"],"tags":["git"]},"headers":[{"level":2,"title":"1. 准备条件","slug":"_1-准备条件","link":"#_1-准备条件","children":[]},{"level":2,"title":"2. 在其中一个终端操作，push 本地文件夹 Hexo 中的必要文件到 yourname.github.io 的 hexo 分支上","slug":"_2-在其中一个终端操作-push-本地文件夹-hexo-中的必要文件到-yourname-github-io-的-hexo-分支上","link":"#_2-在其中一个终端操作-push-本地文件夹-hexo-中的必要文件到-yourname-github-io-的-hexo-分支上","children":[]},{"level":2,"title":"3. 另一终端完成 clone 和 push 更新","slug":"_3-另一终端完成-clone-和-push-更新","link":"#_3-另一终端完成-clone-和-push-更新","children":[]},{"level":2,"title":"4. 不同终端间愉快地玩耍","slug":"_4-不同终端间愉快地玩耍","link":"#_4-不同终端间愉快地玩耍","children":[]}],"git":{"createdTime":1738930383000,"updatedTime":1738930383000,"contributors":[{"name":"Duang Cheng","email":"longcheng@microsoft.com","commits":1}]},"filePathRelative":"blogs/others/2017-05-12.md"}');export{x as comp,k as data};
