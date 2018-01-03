---
title: "jquery 判断 checked 的三种方法"
date: 2017-01-05 16:28:03
categories: "常见问题集锦"
tags: "jquery"
description: "jquery 判断 checked 状态"
---

---

.attr(‘checked): //看版本1.6+返回:”checked”或”undefined” ;1.5-返回: true 或 false
.prop(‘checked’): //16+:true/false
.is(‘:checked’): //所有版本:true/false//别忘记冒号哦

jquery 赋值 checked 的几种写法:

所有的jquery版本都可以这样赋值:
$$(“#cb1”).attr(“checked”,”checked”);
$(“#cb1”).attr(“checked”,true);
jquery1.6+:prop的4种赋值:
// $(“#cb1″).prop(“checked”,true);//很简单就不说了哦
// $(“#cb1″).prop({checked:true}); //map键值对
// $(“#cb1″).prop(“checked”,function(){
return true;
//函数返回 true 或 false
});
//记得还有这种哦:$(“#cb1″).prop(“checked”,”checked”);

本文转载自：[点我跳转](http://www.wufangbo.com/jquery-pan-duan-checked/)