---
title: jQuery判断及修改checked状态的方法
categories: 常见问题集锦
tags: jQuery
description: >-
  表单中经常需要使用单选框或多选框来让用户选择，而我们经常使用jQuery来判断或改变选项中checked的状态，但是由于jQuery版本不同，判断的方法也不太一样，这个坑点在这里记录一下。
abbrlink: 634e
date: 2017-01-05 16:28:03
---

表单中经常需要使用单选框或多选框来让用户选择，而我们经常使用jQuery来判断或改变选项中checked的状态，但是由于jQuery版本不同，判断的方法也不太一样，这个坑点在这里记录一下。

<!-- more -->

```js
.attr("checked"): //1.6+返回: "checked"或"undefined"; 1.5以下返回: true/false
.prop("checked"): //1.6+: true/false
.is(":checked"): //所有版本: true/false，注意冒号
```

jQuery 赋值 checked 的几种写法:

所有的jQuery版本都可以这样赋值:

```js
$("#cb1").attr("checked","checked");
$("#cb1").attr("checked",true);
```

jquery1.6+: prop的4种赋值:

```js
$("#cb1″).prop("checked", true);  
$("#cb1″).prop({ checked: true });
$("#cb1″).prop("checked", function() {
  return true; //函数返回 true 或 false
});
$("#cb1″).prop("checked", "checked");
```
