import{_ as e,c as a,o as t,a as s}from"./app-srr4GW5I.js";const i={},l=s('<div class="custom-container tip"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 8h.01"></path><path d="M11 12h1v4h1"></path></g></svg><p class="custom-container-title">提示</p><p>实现一个完美个性化标准的目标是：一个统一管理及备份所有应用配置方式。而本篇文章带来的，就是为了满足这个目标而诞生的最佳解决方案 Dotfiles manager。</p></div><p>若想提高自己的开发效率，得心应手的工具是必不可少的。而各软件的配置种类繁多且各不相同，这需要我们花费大量的时间去学习和记忆。这给穿插使用各种工具的我们带来了较大的记忆成本，而为了减少这种记忆成本，我们会想办法统一一个个性化标准，然后在每个软件中进行设置，以尽量匹配这一标准。</p><p>而实现一个完美个性化标准的目标是：一个统一管理及备份所有应用配置方式。而本篇文章带来的，就是为了满足这个目标而诞生的最佳解决方案 Dotfiles manager。</p><h2 id="什么是dotfiles" tabindex="-1"><a class="header-anchor" href="#什么是dotfiles"><span>什么是dotfiles</span></a></h2><p>Dotfiles manager，实际上就是管理dotfiles的命令管理器。而所谓dotfiles，是指文件名称以 . 为前缀的文件或文件夹的统称。对于unix-based的系统来说，这样的文件名称在文件列表中处于不可见状态，即所谓的隐藏文件，需要通过-a的方式才能查看到。</p><p>这些文件多出现在用户的根目录下，通常是给该系统用户以及其所使用的软件存储一些个性化的配置，从而达到个人使用起来更贴合习惯，从而大幅提升工作效率。如常见的terminal个性化配置.bashrc或.bash_profile, vim个性化配置.vimrc等等，都属于dotfiles的范畴。</p><h2 id="为什么需要dotfiles-manager" tabindex="-1"><a class="header-anchor" href="#为什么需要dotfiles-manager"><span>为什么需要Dotfiles manager</span></a></h2><p>工具的使用的原则应该是：让工具适应我们，而不是让我们习惯工具。因此，我们会需要对工具进行符合自己使用习惯的改造。小到各软件快捷键及alias的配置统一，大到设置一键执行的多应用联动的工具化脚本。当许多或常用，或便利的配置被添加完毕之后，给自己带来的效率提升是无与伦比的。</p><p>而这样一来，软件配置将是一个高度定制化的东西，任何一个工具都需要时间进行深度地打磨来符合自己的使用习惯。问题还会越来越多，你会发现随着高度的定制化，尽管摆脱了特定软件特定操作对你的束缚，但又似乎被固定的设备深度绑定了，因为大量杂乱的配置使得你在更换新的开发环境的时候显得尤为艰难，需要手动对每一个软件重新进行一遍设置。由此一来，配置的更新及多设备同步也是一大难题。</p><p>之前说到，一个完美的个性化标准有两点：极为方便的</p><p>这时候，就急需一个能统一管理及备份所有应用配置的方式来帮助我们完成这一目标。而对于支持文件或命令行配置的应用来说，这一目标的最佳解决方案就是Dotfiles manager。</p><h2 id="有哪些软件能够被dotfiles-manager支持" tabindex="-1"><a class="header-anchor" href="#有哪些软件能够被dotfiles-manager支持"><span>有哪些软件能够被dotfiles manager支持</span></a></h2><p>从理论上来说，一切支持文件配置或命令行配置的应用及系统都一定能被Dotfiles manager支持。对于Linux来说，这几乎包括一切软件。</p><p>对于我日常使用环境来说，目前需要用到dotfiles manager来管理配置的主要有如下一些功能：</p><img src="https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/image-20210120174747924.png" alt="image-20210120174747924" style="zoom:50%;">',15),o=[l];function n(r,d){return t(),a("div",null,o)}const m=e(i,[["render",n],["__file","2021-03-13.html.vue"]]),p=JSON.parse('{"path":"/blogs/others/2021-03-13.html","title":"优雅地管理与同步个人工作环境 -- dotfiles manager","lang":"en-US","frontmatter":{"title":"优雅地管理与同步个人工作环境 -- dotfiles manager","date":"2021-03-13T16:06:27.000Z","categories":["其他"],"tags":["工作效率","Dotfiles"]},"headers":[{"level":2,"title":"什么是dotfiles","slug":"什么是dotfiles","link":"#什么是dotfiles","children":[]},{"level":2,"title":"为什么需要Dotfiles manager","slug":"为什么需要dotfiles-manager","link":"#为什么需要dotfiles-manager","children":[]},{"level":2,"title":"有哪些软件能够被dotfiles manager支持","slug":"有哪些软件能够被dotfiles-manager支持","link":"#有哪些软件能够被dotfiles-manager支持","children":[]}],"git":{"createdTime":1738930383000,"updatedTime":1738930383000,"contributors":[{"name":"Duang Cheng","email":"longcheng@microsoft.com","commits":1}]},"filePathRelative":"blogs/others/2021-03-13.md"}');export{m as comp,p as data};
