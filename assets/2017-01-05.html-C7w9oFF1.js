import{_ as n,o as s,c as a,b as t}from"./app-B9TWmIeZ.js";const e={},p=t(`<div class="custom-container tip"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 8h.01"></path><path d="M11 12h1v4h1"></path></g></svg><p class="custom-container-title">TIP</p><p>表单中经常需要使用单选框或多选框来让用户选择，而我们经常使用 jQuery 来判断或改变选项中 checked 的状态，但是由于 jQuery 版本不同，判断的方法也不太一样，这个坑点在这里记录一下。</p></div><div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code><span class="token punctuation">.</span><span class="token function">attr</span><span class="token punctuation">(</span><span class="token string">&quot;checked&quot;</span><span class="token punctuation">)</span><span class="token operator">:</span> <span class="token comment">//1.6+返回：&quot;checked&quot;或&quot;undefined&quot;; 1.5 以下返回：true/false</span>
<span class="token punctuation">.</span><span class="token function">prop</span><span class="token punctuation">(</span><span class="token string">&quot;checked&quot;</span><span class="token punctuation">)</span><span class="token operator">:</span> <span class="token comment">//1.6+: true/false</span>
<span class="token punctuation">.</span><span class="token function">is</span><span class="token punctuation">(</span><span class="token string">&quot;:checked&quot;</span><span class="token punctuation">)</span><span class="token operator">:</span> <span class="token comment">//所有版本：true/false，注意冒号</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>jQuery 赋值 checked 的几种写法：</p><p>所有的 jQuery 版本都可以这样赋值：</p><div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code><span class="token function">$</span><span class="token punctuation">(</span><span class="token string">&quot;#cb1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">attr</span><span class="token punctuation">(</span><span class="token string">&quot;checked&quot;</span><span class="token punctuation">,</span><span class="token string">&quot;checked&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">$</span><span class="token punctuation">(</span><span class="token string">&quot;#cb1&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">attr</span><span class="token punctuation">(</span><span class="token string">&quot;checked&quot;</span><span class="token punctuation">,</span><span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>jquery1.6+: prop 的 4 种赋值：</p><div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code><span class="token function">$</span><span class="token punctuation">(</span><span class="token string">&quot;#cb1″).prop(&quot;</span>checked&quot;<span class="token punctuation">,</span> <span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>  
<span class="token function">$</span><span class="token punctuation">(</span>&quot;#cb1″<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">prop</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">checked</span><span class="token operator">:</span> <span class="token boolean">true</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">$</span><span class="token punctuation">(</span><span class="token string">&quot;#cb1″).prop(&quot;</span>checked&quot;<span class="token punctuation">,</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">return</span> <span class="token boolean">true</span><span class="token punctuation">;</span> <span class="token comment">//函数返回 true 或 false</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token function">$</span><span class="token punctuation">(</span><span class="token string">&quot;#cb1″).prop(&quot;</span>checked<span class="token string">&quot;, &quot;</span>checked&quot;<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,7),o=[p];function c(u,i){return s(),a("div",null,o)}const r=n(e,[["render",c],["__file","2017-01-05.html.vue"]]),k=JSON.parse('{"path":"/blogs/others/2017-01-05.html","title":"jQuery 判断及修改 checked 状态的方法","lang":"en-US","frontmatter":{"title":"jQuery 判断及修改 checked 状态的方法","date":"2017-01-05T16:28:03.000Z","categories":["其他"],"tags":["jQuery"]},"headers":[],"git":{"createdTime":1733141773000,"updatedTime":1733141773000,"contributors":[{"name":"Duang Cheng","email":"longcheng@microsoft.com","commits":1}]},"filePathRelative":"blogs/others/2017-01-05.md"}');export{r as comp,k as data};