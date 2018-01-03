---
title: js学习笔记梳理（二）
date: 2017-02-20 22:08:38
categories: "JavaScript"
tags: "es5"
description: "最近在梳理关于js一些原理层次的东西，感觉学的有点乱，是时候整理沉淀一下记录成文字了。在我看来，最难理解的核心就两点，一是对闭包的理解，二是对原型链的深入。"
---

---

上一节我梳理了一下闭包的概念，这些天各种学校的事情挺忙的，直到现在才有空余时间来写写博客这样杀时间的事儿。这一次整理一下原型链的那些事儿。

------

大家都知道在JavaScript的世界里，一切皆对象。而我们又知道，JavaScript并不是完全的一门 OOP（面向对象编程）的语言，它是一门面向原型链编程的语言。综上我们可以得出，其实原型也是一个对象。这对我接下来要讲的内容的理解有至关重要的作用。

OOP中一个最重要的特性就是继承，那JavaScript作为一门完全独立的语言自然也需要有这一特性，而JavaScript本身并没有类继承或者接口继承相关的概念，我们需要使用原型链来模拟这一过程。不多说，先上一个例子。

```javascript
    function Person (name) {
    this.name = name;
    }

    function Father () {

    }
    Father.prototype = {    //Father的原型
        age: 50,
        home: ['Beijing', 'Shanghai']
    };

    var father = new Father();
    Person.prototype = father; //Person 的原型为 Father
    // 这样写的好处是子类如果更改了prototype，那么更改的东西也是附加到father这个实例对象上的
    // 如果你直接写Person.prototype = Father.prototype，
    // 那你对 Person 的 prototype 的任何修改都会同时修改 Father 的 prototype

```

这个例子中，我定义了一个父类构造函数Father，和一个子类构造函数Person。至于为什么用构造函数这么奇怪的模式来定义一个类的原因我认为完全可以下次再开一篇专门的文章来阐述，简单来说这个构造函数模式是JavaScript生成自定义原型链的一种模式。

好，那么接下来，重点来了。这里使用了父类构造函数的prototype，这是个什么东东呢？在JavaScript里，对每一个函数，都自动会继承一个prototype的属性，指向了构造函数所继承的原型对象。

我之前说过，万物皆对象。函数当然也是一个对象，它当然也需要继承另一个对象，那么被函数对象继承的对象，就叫原型对象，在例子里面，他就叫做Father.prototype。

原型对象，首先是一个对象呀。因此我在重写父类构造函数的原型对象的时候使用了字面量模式，也就是{……}的方法来指定一个对象。当然，你要这么书写也是对的：

```javascript
    Father.prototype.age = 50;
    Father.prototype.home = ['Beijing', 'Shanghai'];
```

当然，它们之间会有一些差别，但就为对象赋值的情况他们的作用是等效的。

在之后呢，我们为父类创建了一个实例，并将子类构造函数的原型对象指向了这个实例，到此继承原型链完成。

啊啊啊不要问我为什么要这样继承了，这样做并不奇怪。首先我们知道函数的 prototype 必定指向一个obj对象，那么构造函数显然不能担当这一职责，只有被实例化的对象才能成为子类的原型对象。这里可以填入的对象有两个，一个是father，另一个是Father.prototype。那为什么不是后面这个呢？试试就知道了。

```javascript
    Person.prototype = Father.prototype;
```

这行代码一敲完我就觉得非常的搞笑了，按自然语言的理解来看看，你的父亲等于你父亲的父亲！？？那你爸是你表哥咯？实际上呢，这样子的赋值语句也经常用到，只不过含义完全不同，这是继承自同一原型的两个不同子类，相当于兄弟节点，这好理解吧？

这里要讲的是子类继承，因此接下来子类的构造函数的prototype自然也指向这个被实例化的原型对象。JavaScript的语言逻辑就是这么奇怪又好有道理的样子。

好，接下来我要给子类实例化两个对象出来，分别是我和我弟弟。

```javascript
    var person1 = new Person('成龙');
    var person2 = new Person('成风');
```

前戏就讲到这里，接下来我们进入正题。基于原型到底有哪些特性。

------

1.简单赋值不会改变原型以及该对象的兄弟对象的属性，实例不能改变原型的基本值属性。
------

还是先举一个例子，比如我肯定没有我爸年纪那么大，因此我继承了所有属性后，我还应该要自己有一个年龄属性覆盖上去。

```javascript
    person1.age = 20;
    console.log(person1.age);    //20
    console.log(person1.__proto__.age);   //50
```

子类改变了自己类内的属性（实质是覆盖，使用delete删去该属性后，仍然继承父类的值），但是这并不会影响父类中该属性的值。

这很好理解吧，你虽然天生遗传了你爸的基因，但是你自己上课外班学会了唱歌跳舞你爸总不会就自然学会了吧？

ps：这里说一说"__proto__"这个属性，ECMAScript5中叫它[prototype]，是每一个被实例化的对象都会被继承的属性，它的指向与该实例化对象的构造函数的prototype的指向相同，指向原型对象。

------

2.原型中引用类型的属性是共享的，实例对象能够修改原型对象中引用类型对象的属性
------

引用类型是什么呢，这里涉及到js的基础知识了，在JavaScript中，数据类型一共有7种，分别是：Number, String, Boolean, Undefined, Null, Object, Function。其中基本数据类型共5种：Number, String, Boolean, Undefined, Null。而剩下的统称为引用类型，包括obj对象，函数和数组。究其原理呢，是因为引用类型并不实际占用栈内存而只是其中的基本类型数据占用，引用类型仅用堆内存提供指针指向他们，于是就有了一个非常有趣的现象：基本数据类型永远无法被改变，而引用类型可以，原因就是引用类型只需要修改指针，指向另外一个基本类型数据就可以了呀。

扯远了，总而言之，引用类型并不是保存值的，而只是一个指针堆，或者说是基本数据的引用堆，因此我们修改实例对象中的引用类型对象的时候，原型对象中引用类型对象的属性也会同时被修改，因为他们本来就指向的同一个内存块嘛。

还是举一个例子加深一下理解。

```javascript
    console.log(person1.home);    //[ 'Beijing', 'Shanghai' ]
    person1.home[0] = 'Shenzhen';
    console.log(father.home);    //[ 'Shenzhen', 'Shanghai' ]
    console.log(person1.home);   //[ 'Shenzhen', 'Shanghai' ]
```

本来啊，你们一家都住在北京，但是你长大了，跑到深圳去工作了，还在那里买了房子住下了，于是你的住址被迁移到了深圳。但是同时，你必须要和爸妈住在一起，拥有相同的住址（引用类型嘛，指向同一个地址位置），因此你爸也吧户口改了，迁移到了深圳。

还是不能理解？哎，我也觉得有点牵强，还是不能随便类比，那还是来个基础编程吧。我们如果要让person1拥有一个home的数组属性，并且它的第0号元素为'Shenzhen'，该怎么办呢？

```javascript
    var person1 = {};
    person1.home[0] = 'Shenzhen';
```

这样行得通吗？你可以自己试试，显然是不可以的，这里会报错：'home' not defined。它连home这个属性都还没有呀，怎么能给home的第一个元素赋值呢？所以我们应该这样写：

```javascript
    var person1 = {};
    person1.home = [];
    person1.home[0] = 'Shenzhen';
```

先把home属性给它定义出来自然就不会有问题啦。其实呀，这跟我们的问题是一样一样的。person1中，并没有一个名为home的属性，因此person1.home[0]是不行的。

至于为什么没有报错呢，是因为js的原型链向上搜索机制：如果查找一个对象的属性没有找到，搜索会继续在继承的对象中搜索，如果还没有则逐级向上搜索直到找到为止。而此时，虽然person1中没有这个属性，但它继承的父类中有home这个属性，于是系统会认为找到了这个属性，并随着你的赋值语句更改了父类中该属性的值。

再来举一个例子。我们开始说了，给子类改写属性的实质是一种覆盖。删除实例的属性之后，就会取消了子类的属性覆盖，这个时候再需要调用该对象的这个属性时，就会从原型链上一层一层找到头，直到找到为止。

```javascript
    console.log(person1.home);    //[ 'Shenzhen', 'Shanghai' ]
    delete person1.home;
    console.log(person1.home);    //[ 'Beijing', 'Shanghai' ]
```

累死了，现在总该明白这西方的一套是怎么回事了吧？如果这样还不明白的话，我也只能说“不了不了“。

------

3.改写构造函数的原型，改写的属性能够动态反应到实例化的对象中
------

在定义父类完毕后，你突然想补充一点，比如说：我弟和我都是男的啊！你爸那一代身份证可能没考虑到性别这一属性，那你爸和你以及你弟怎么办呢,总不能性别模糊吧？

办法还是有的，就是改写子类的原型对象。

```javascript
    Person.prototype.sex = 'male';
    // 等同于father.sex = 'male'，也等同于person1.__proto__.sex = 'male'
    // 这里不能写成：Father.sex = 'male'; 这是因为面向对象编程的规则：对象（实例）才是属性的拥有者。
    console.log(person1.sex);   'male'
    console.log(father.sex);    'male'
```

其实呀，这个Person.prototype就是 father，因此呢，你如果非要定义father.sex = 'male' 也不是不可以，仅在此题中实现的效果是相同的。但是这不符合JavaScript规范，也是普遍面向对象编程的规则：对象（实例）才是属性的拥有者。

改写原型对象后呢，子类也会动态地继承这些属性，因此这一招改原型大法还是非常的常用的。

------

4.重写构造函数的原型，使子类继承一个新的原型
------

比如呀，你有一个同母异父的弟弟，他的什么东西都和你跟你爸爸不像，显然啊，他跟你爸并没有什么血缘关系嘛，因此它没有任何属性是从你爸那里继承的呀。

重写原型其实很简单，直接对Person.prototype附一个不同字面量对象即可。由于重写原型会使得原有的继承全部更换，因此不是特殊用途的情况下使用的很少。

```javascript
    Person.prototype = {
        age: 40,
        home: ['Guangzhou', 'Changsha']
    };

    var person3 = new Person('黄龙');
    // 这个时候Person的原型已经完全变成了另一个对象，于是我连这个家伙的姓氏都改掉了~
    console.log(person3.home);
    console.log(person3.age);
    console.log(person1.home);
    console.log(person1.age);
```

你这个没有什么血缘关系的弟弟有一个更年轻的爸爸，住址也跟你完全不同，其实跟你完全就是两个世界的人了嘛，于是我连这个家伙的姓氏都改掉了~ 

------

唔，大概我能总结出来的特性就这么多啦，想到再补充吧~

