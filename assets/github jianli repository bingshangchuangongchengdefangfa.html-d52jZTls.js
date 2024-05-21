import{_ as n,o as s,c as i,b as a}from"./app-ZJlk8RDi.js";const e={},t=a(`<div class="custom-container tip"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 8h.01"></path><path d="M11 12h1v4h1"></path></g></svg><p class="custom-container-title">TIP</p><p>这不是什么新知识了，自从我用 github 以来一直就是这么用着的，但是最近有一段时间没上传过自己的 project 了，竟然手生了忘了怎么做了。想了想还是记录下来比较好，也给大家分享分享。</p><p>由于是给自己做的备忘，怎么注册 github 之类的新手问题我就不说了，不懂的朋友可以自行去百度相关问题，很多的。</p></div><h2 id="先-clone-再写入的方法-适用于还未开发项目时" tabindex="-1"><a class="header-anchor" href="#先-clone-再写入的方法-适用于还未开发项目时"><span>先 clone 再写入的方法（适用于还未开发项目时）</span></a></h2><p>通常最简单最无脑的办法就是现在 github 网站上创建一个 repository，可以自己任意设定名字和 readme.md。之后通过：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">git</span> clone git@github.com:username/respositoryname.git
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>克隆到本地，之后往里面写入文件文件夹就行了。</p><p>写完想要提交到 github 的话，就输入如下命令：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">git</span> pull
<span class="token function">git</span> <span class="token function">add</span> <span class="token builtin class-name">.</span>
<span class="token function">git</span> commit <span class="token parameter variable">-m</span> <span class="token string">&quot;first commit&quot;</span>
<span class="token function">git</span> push origin master
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里最好先 git pull 一下，以免有冲突导致提交不成功。</p><h2 id="对本地项目-git-init-再提交-适用于项目已经成型-想要在此时进行版本控制" tabindex="-1"><a class="header-anchor" href="#对本地项目-git-init-再提交-适用于项目已经成型-想要在此时进行版本控制"><span>对本地项目 git init 再提交（适用于项目已经成型，想要在此时进行版本控制）</span></a></h2><p>如果你已经写好了工程但还没有进行过 git 版本控制，或者直接是从别的地方下载好的 github 上的工程还没有进入你自己的代码库的话，可以使用这种方法：</p><p>首先，如果你的工程完全没有经过 git 版本控制，那么在你的工程目录中输入命令：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>    <span class="token function">git</span> init
    <span class="token function">touch</span> .gitignore
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>之后你的工程里会多出一个。git 的文件夹，之后你需要建立一个。gitignore 文件，来建立规则忽略你不想传上 github 进行版本控制的文件或文件夹（一般为依赖库、数据库或者一些隐私文件），配置规则请百度。</p><p>之后的操作跟方法一大体相同，指定要提交到的远程 repository，并注意同步冲突问题，之后提交即可。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">git</span> <span class="token function">add</span> <span class="token builtin class-name">.</span>
<span class="token function">git</span> commit <span class="token parameter variable">-m</span> <span class="token string">&quot;first commit&quot;</span>
<span class="token function">git</span> remote <span class="token function">add</span> origin git@github.com:username/respositoryname.git
<span class="token function">git</span> pull origin master
<span class="token function">git</span> push <span class="token parameter variable">-u</span> origin master
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其实 github 还提供了一个方法：import code from another repository，从别的版本库中导入工程，这个就不细说了，因为 git 是公认的目前最好的版本控制库，根本不需要再放在别的地方了。有历史原因的工程想导入的话完全可以先下载下来，再参照方法一二进行。</p>`,16),o=[t];function l(c,r){return s(),i("div",null,o)}const d=n(e,[["render",l],["__file","github jianli repository bingshangchuangongchengdefangfa.html.vue"]]),g=JSON.parse('{"path":"/blogs/qita/github jianli repository bingshangchuangongchengdefangfa.html","title":"github 建立 repository 并上传工程的方法","lang":"en-US","frontmatter":{"title":"github 建立 repository 并上传工程的方法","date":"2017/07/02 23:46:32","categories":["其他"],"tags":["git"]},"headers":[{"level":2,"title":"先 clone 再写入的方法（适用于还未开发项目时）","slug":"先-clone-再写入的方法-适用于还未开发项目时","link":"#先-clone-再写入的方法-适用于还未开发项目时","children":[]},{"level":2,"title":"对本地项目 git init 再提交（适用于项目已经成型，想要在此时进行版本控制）","slug":"对本地项目-git-init-再提交-适用于项目已经成型-想要在此时进行版本控制","link":"#对本地项目-git-init-再提交-适用于项目已经成型-想要在此时进行版本控制","children":[]}],"git":{"createdTime":1716285190000,"updatedTime":1716285190000,"contributors":[{"name":"Duang Cheng","email":"longcheng@microsoft.com","commits":1}]},"filePathRelative":"blogs/其他/github 建立 repository 并上传工程的方法.md"}');export{d as comp,g as data};
