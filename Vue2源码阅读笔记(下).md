# [源码阅读]Vue2源码系列(下)

## 前言

**持续创作，加速成长！这是我参与「掘金日新计划 · 10 月更文挑战」的第2天，[点击查看活动详情](https://juejin.cn/post/7147654075599978532)**

**本文参加了由[公众号@若川视野](https://link.juejin.cn/?target=https%3A%2F%2Flxchuan12.gitee.io) 发起的每周源码共读活动，[点击了解详情一起参与。](https://juejin.cn/post/7079706017579139102)**

**这是源码共读的第24期，链接：第24期 【vue2 工具函数】[初学者也能看懂的 Vue2 源码中那些实用的基础工具函数](https://juejin.cn/post/7079765637437849614)**

其实对于`Vue2`源码系列以及有了一篇[[源码阅读\]vue2源码系列(中) - 掘金 (juejin.cn)](https://juejin.cn/post/7148355246073315336)因为`Vue2`的源码比较多，所以花了几天时间给自己理解一下🤦‍♀️

## 源码分析

### `polyfillBind()`

定义：其实就是为了兼容以前的老版本，所以实现了一个`bind`方法

```javascript
function polyfillBind (fn, ctx) {
    function boundFn (a) {
      var l = arguments.length;
      return l
        ? l > 1
          ? fn.apply(ctx, arguments)
      		: fn.call(ctx, a)
      			: fn.call(ctx)
  }
  boundFn._length = fn.length;
  return boundFn
}
function nativeBind (fn, ctx) {
    return fn.bind(ctx)
  }
var bind = Function.prototype.bind
    ? nativeBind
    : polyfillBind;
```

首先我们先复习一下`bind`,`apply`,`call`

#### `function.prototype.call()`

定义：使用指定的`this`的值和单独给出来的参数来调用函数

它的返回值是`this`的值和调用函数的返回值

我的理解是：**实现属性或者方法继承**和**调用函数**

+ 实现继承：

```javascript
function Product(name, price) {
  this.name = name;
  this.price = price;
}

function Food(name, price) {
  Product.call(this, name, price);
  this.category = 'food';
}

function Toy(name, price) {
  Product.call(this, name, price);
  this.category = 'toy';
}

var cheese = new Food('feta', 5);
var fun = new Toy('robot', 40);
console.log(cheese);
console.log(fun)
```

```bash
Food {name: 'feta', price: 5, category: 'food'}
Toy {name: 'robot', price: 40, category: 'toy'}
```

**这里其实就可以理解为一种继承，`Food`和`Toy`都继承了`Product`的`name`和`price`属性**

+ 调用函数

```javascript
function greet() {
  var reply = [this.animal, 'typically sleep between', 			this.sleepDuration].join(' ');
  console.log(reply);
}
var obj = {
  animal: 'cats', sleepDuration: '12 and 16 hours'
};
greet.call(obj);  // cats typically sleep between 12 and 16 hours
```

这里面我们可以理解为：**greet函数执行时**，`this`其实是指向`obj`的，也就是我现在可以在这个函数里访问这个`obj`的一些属性

注意：

`call`的第一个参数表示的是`this`

+ 如果在非严格模式下，我们将`this`的指向设置为`null`或者`undefined`,这时候我们的`this`就会自动指向`window`
+ 如果在严格模式，你只要写了，无论是什么，都是`this`

具体可以阅读：[面试官问：能否模拟实现JS的call和apply方法 - 掘金 (juejin.cn)](https://juejin.cn/post/6844903728147857415)

#### `function.prototype.apply()`

**其实他的用法和上面介绍的`call`非常类似，区别就在于：call可以接受很多参数，但是apply只可以接受最多两个参数**

+ 第一个参数：是用来指定this的指向
+ 第二个参数：是一个数组或者类数组，用来装所有的参数

使用：**当我们可以确定参数是多少时，我们就可以使用`call`，没法确定就可以使用`apply`**

#### `function.prototype.bind()`

定义：`bind()`方法会**创建一个新的函数**，然后当`bind()`被调用，第一个参数作为`this`的指向，其余参数作为函数的新参数

使用：**创建一个函数，目的为了不改变this**

```javascript
this.x = 9;    // 在浏览器中，this 指向全局的 "window" 对象
var module = {
  x: 81,
  getX: function() { return this.x; }
};
module.getX(); // 81
var retrieveX = module.getX;
retrieveX();//9，因为函数在全局调用
var boundGetX = retrieveX.bind(module);//this绑定到了module身上
boundGetX(); // 81
```

**偏函数：**

大概意思就是，你里面的参数（除了第一个）都会**作为函数的参数**，后续你**再次调用绑定函数**时，你传入的参数也依然会作为函数的参数，只是**他们会被插在原先那个函数参数的后面**

```javascript
function list() {
  return [...arguments];
}
function addArguments(arg1, arg2) {
    return arg1 + arg2
}
var list1 = list(1, 2, 3); // [1, 2, 3]
var result1 = addArguments(1, 2); // 3
// 创建一个函数，它拥有预设参数列表。
var leadingThirtysevenList = list.bind(null, 37);//bind会创建一个函数
// 创建一个函数，它拥有预设的第一个参数
var addThirtySeven = addArguments.bind(null, 37);//bind会创建一个函数
var list2 = leadingThirtysevenList();
// [37]
var list3 = leadingThirtysevenList(1, 2, 3);
// [37, 1, 2, 3]
var result2 = addThirtySeven(5);
// 37 + 5 = 42
var result3 = addThirtySeven(5, 10);//因为我之前已经固定只可以有两个参数，现在两个参数已经满了，所以10就上不去
// 37 + 5 = 42 ，第二个参数被忽略
```

代码参考链接:[Function.prototype.bind() - JavaScript | MDN (mozilla.org)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)

所以：**你会发现其实bind他是会创建一个函数，如果你不去调用，那么什么用也没有**

好了现在我们开始调试代码

**注意：bind你可以没有参数，只要你有参数，那么你第一个参数一定是this的指向**

```javascript
function list() {
    console.log("arguments",arguments);
    return [...arguments]
  }
let bindFun = bind(list,null)//this是null，在非严格模式下，指向window
console.log("bindFun",bindFun(1,2,3));
```

```bash
arguments Arguments(3) [1, 2, 3, callee: <accessor>,Symbol(Symbol.iterator): ƒ]
bindFun (3) [1, 2, 3]
```

理解：

+ `bind()`,其实就是在调用那个bind，但是bind的返回值是一个函数

+ 下面就直接调用，调用的时候，我们会执行那个`fn`,这边就是那个`list`,但是刚刚我们之传入了两个参数

  + 一个是函数`fn`,就是调用的函数
  + 一个是`bind(thisArgs)`的`thisArgs`

  也就是我们还没有传入其他参数

+ 传入参数`bindFun(1,2,3)`

### `toArray()`

定义：就是将类数组转为数组，并且支持定义`start`位置

```javascript
  function toArray(list, start) {
    start = start || 0;
    var i = list.length - start;
    // 确定array的大小
    var ret = new Array(i);
    while (i--) {
      // 将数放进去
      ret[i] = list[i + start];
    }
    return ret
  }
```

**但是前提条件就是：类数组，因为类数组具有索引**

### `extend()`

定义：将对象进行合并

```javascript
function extend (to, _from) {
  for (var key in _from) {
    to[key] = _from[key];
  }
  return to
}
let obj1 = {}
let obj2 = {name:'summer',age:13,hobby:["music","coding"]}
console.log(extend(obj1, obj2));
```

**其实我感觉它就是一种浅拷贝:复制只能复制一层，如果后续是引用类型的，那么复制的值改变了，原来的值也会改变**

```javascript
 let obj2 = { name: 'summer', age: 13, hobby: ["music", 'coding'] }
let obj3 = extend({},obj2)
console.log(obj3);
obj3.name = "alex"
console.log(obj3);
obj3.hobby = ["sing", 'basketball']
console.log(obj3);
console.log("obj2",obj2);
```

```bash
{name: 'summer', age: 13, hobby: Array(2)}
{name: 'alex', age: 13, hobby: Array(2)}
{name: 'alex', age: 13, hobby: Array(2)}
obj2 {name: 'summer', age: 13, hobby: Array(2)}
```

### `toObject()`

定义：将**二维数组**转化为对象，也可以将多维数组进行转化，但是问题就是，他会进行覆盖，因为我每次每次去调用`extend()`函数，`key`每次都是从`0`开始

```javascript
  function toObject(arr) {
    var res = {};
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]) {
        extend(res, arr[i]);
      }
    }
    return res
  }
  console.log("toObject",toObject([[1,2]]));
```

```bash
toObject {0: 1, 1: 2}
```

**假如操作的是多维数组，例如[[1,2],[3,4]]**

```javascript
console.log("toObject",toObject([[1,2],[3,4]]));//toObject {0: 3, 1: 4}
```

**如果操作的是一维数组，那么直接就是空对象，因为在`extend()`你就没法进行遍历**`for..in`要求你必须是可迭代的

## 收获

第一次看`Vue`的源码，感觉这次收获满满吧

+ 了解到了`bind`，`apply`,`call`
  + `apply`和`call`其实功能类似
  + `bind`的特点就是，它会返回一个新的函数
  + 用`apply`和`call`来实现一个`bind`

参考链接：

[初学者也能看懂的 Vue2 源码中那些实用的基础工具函数 - 掘金 (juejin.cn)](https://juejin.cn/post/7024276020731592741)

[【若川视野 x 源码共读】第24期 | vue2工具函数 - 掘金 (juejin.cn)](https://juejin.cn/post/7091117982654398477)