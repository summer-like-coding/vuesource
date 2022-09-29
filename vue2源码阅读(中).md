# [源码阅读]vue2源码系列(中)

## 前言

**持续创作，加速成长！这是我参与「掘金日新计划 · 10 月更文挑战」的第N天，[点击查看活动详情](https://juejin.cn/post/7147654075599978532)**

**本文参加了由[公众号@若川视野](https://link.juejin.cn/?target=https%3A%2F%2Flxchuan12.gitee.io) 发起的每周源码共读活动，[点击了解详情一起参与。](https://juejin.cn/post/7079706017579139102)**

**这是源码共读的第24期，链接：第24期 【vue2 工具函数】[初学者也能看懂的 Vue2 源码中那些实用的基础工具函数](https://juejin.cn/post/7079765637437849614)**

其实对于`Vue2`源码系列以及有了一篇[[源码阅读\]Vue2源码系列(上) - 掘金 (juejin.cn)](https://juejin.cn/post/7147668065658863647)，因为`Vue2`的源码比较多，所以花了两天时间给自己理解一下

## 源码分析

### `makeMap()`

定义：传入一个用`,`划分的字符串和是否大小写，生成一个对象，判断`key`是不是在这个对象(`map`)中，如果在这个对象中，那么就会返回对应的`value`,没有直接`undefined`

```javascript
function makeMap (str,expectsLowerCase) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? function (val) { return map[val.toLowerCase()]; }
    : function (val) { return map[val]; }
}
 console.log(makeMap("1,2,3,4,5,a,s,d,f",true)("6"));//undefined
 console.log(makeMap("1,2,3,4,5,a,s,d,f",true)("a"));//true
```

#### `object.create()`

> 创建一个新对象，可以使用现有的对象来作为**新对象的原型**

```javascript
const person = {
    name:'summer',
    age:13,
    do:function(){console.log("你好")}
}
const summer = Object.create(person)//这时，这个summer的原型就是person
console.log(summer)
```

```javascript
{}
[[Prototype]]: Object
age: 13
do: ƒ ()
name: "summer"
```

意思就是`summer`其实是可以调用`person`身上的一些方法和属性

```javascript
summer.name = "summer瓜瓜"
console.log(summer)//{name: 'summer瓜瓜'}
console.log(perosn)//{name: 'summer', age: 13, do: ƒ}
person.name = "Alex"
console.log(summer)//{name: 'summer瓜瓜'}
console.log(perosn)//{name: 'alex', age: 13, do: ƒ}
```

**发现：create以后的对象不会和之前的对象就是原型上有关系，他们不会使用一样的地址，`summer`如果定义了和`person`一样的属性，那么属性进行覆盖**

**注意：**

#### `Object.create(null)`

其实我感觉这个需要慎用,null在`js`中其实也是一个对象，但是它不具有原型，这也就意味者，Object的一些需要使用原型的`api`，我现在创建的这个是用不了的

**我们一般将以`null`为原型的对象理解为`map`的替代**

参考链接:[Object.create() - JavaScript | MDN (mozilla.org)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create)

疑问：但是我return的其实是一个函数，但是我的参数些什么呢？或者说，这个使用场景是什么？

### `remove()`

定义：从数组里删除一个`item`

```javascript
function remove (arr, item) {
   if (arr.length) {
    var index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1)
   }
  }
}
```

逻辑：

+ 首先先找到`item`所在的位置
+ 使用`api`进行删除(如果这个值存在的话)

#### `array.splice()`

> **是array比较常用的一种`api`**，可以用于增删改功能

`array.splice(start,num,value)`:意思就是从`start`位置删除`num`个元素，并在后面添加`value`,就是在删的后面添加

### `hasOwn(obj,key)`

定义：它其实就是在判断`obj`上是不是又这个`key`

```javascript
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwn (obj, key) {
    return hasOwnProperty.call(obj, key)
  }
```

注意：

**明明一般的我们本来就可以使用**`object1.hasOwnProperty(key)`**来判断他是不是有这个属性，那么我们什么还需要多加这个呢？？**

参考：[Object.prototype.hasOwnProperty() - JavaScript | MDN (mozilla.org)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty)

因为我们为了防止一个对象他的身上本身就有`hasOwnPrototpye`这个属性，其实这时候我们可以联想到`Object.create()`

```javascript
var foo = {
  bar: 'Here be dragons'
};
foo.hasOwnProperty('bar'); //true
```

**因为这个`foo`身上没有`hasOwnPrototype`属性，所以我们可以使用他原型上的这个属性**

但是我们改为

```javascript
var foo = {
  hasOwnProperty: function() {
    return false;
  },
  bar: 'Here be dragons'
};
foo.hasOwnProperty('bar'); // 始终返回 false
```

**因为我们对这个属性进行了重新赋值(就这么理解，具体我也不知道)**，所以他不具有原型上的属性的原来属性值了

这时候我们就可以使用`Object.hasOwnPrototype.call(foo,"bar")`

### `cached(fn)`

定义：创建一个纯函数

**其实我还是不太理解为什么需要这个函数？🤦‍♀️，因为我觉得，后面的例子明明不使用这个函数也同样可以实现啊！！**

```javascript
  function cached (fn) {
    var cache = Object.create(null);//创建了一个对象
    return (function cachedFn (str) {
      var hit = cache[str];
      return hit || (cache[str] = fn(str))
    })
  }
```

补充：

#### 纯函数

+ 每次调用参数相同，输出也是相同的
+ **不会改变传入参数的值，也不会改变外部变量的值**
+ 没有副作用：不会进行网络请求，`Math.random`之类

参考链接：[程序员 - 纯函数是什么？_个人文章 - SegmentFault 思否](https://segmentfault.com/a/1190000039330123)

#### 高阶函数

至少满足下列一个条件

+ 接受函数作为参数
+ 返回一个函数

#### 柯里化

大概意思就是：他也是一个函数，也接收参数，但是接收参数不会立即计算，而是返回另一个函数，原来传入的参数在闭包中存起来。

在vue源码中，他是这么用的

#### `camlize()`

定义：将字符转为小驼峰

```javascript
var camelizeRE = /-(\w)/g;//匹配所有-开头的东西
var camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) {
      return c ? c.toUpperCase() : ''; })
});
```

补充

##### `string.replace(regexp,function)`

在这里我们只聊聊这一种

针对mdn的理解：

1. 当我们去匹配正则，并且匹配成功后，我们的函数就会立即执行
2. 并且函数的返回值会替换你刚刚匹配的那些值

参考链接：[String.prototype.replace() - JavaScript | MDN (mozilla.org)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace#指定一个函数作为参数)

其实我们可以将上述代码改一下

```javascript
var camelizeRE = /-(\w)/g;
var change = (match, p1, offset, string) => {
  //console.log("是些",match, p1, offset, string);
  return p1 ? p1.toUpperCase() : '';
}
var camelize = cached(function (str) {
  return str.replace(camelizeRE, change)
});
console.log(camelize('-WSE-123'));//WES123
console.log(camelize('on-click'));//onclick
```

```bash
是些 -W W 0 -WSE-123
是些 -1 1 4 -WSE-123
WSE123
```

**可以看到函数执行了两次，满足几次就会执行几次这个函数**

参数

+ `match`:其实我们需要匹配的正则或者字串
+ `p{n}`:正则可能有n个，n个匹配的字符串
+ `offset`:就是你匹配的字符在原数组的`index`是多少
+ `string`:需要被匹配的字符串

这么一理解的话，就知道`function (_, c)`里面的占位符，他占的是`match`

#### `capitalize()`

定义：首字母大写

```javascript
var capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)//字符串进行拼接
});
console.log(capitalize("summer"));//Summer
```

#### `hyphenate()`

定义：就是将`onClick => on-click`

```javascript
  var hyphenateRE = /\B([A-Z])/g;
  var hyphenate = cached(function (str) {
    return str.replace(hyphenateRE, '-$1').toLowerCase()
  });
```

具体关于`replace`的使用参考：[String.prototype.replace() - JavaScript | MDN (mozilla.org)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace#使用字符串作为参数)

这边`$1`:就是匹配第一个正则匹配的项，在前面加上`-`

## 感悟

通过这次源码阅读，我真的收获很多

+ `Object.create()`的使用，对原型的一些理解
  + `A.prototype = B`:`B`就是`A`的原型
  + 那么B上面的属性A都是有的，但是一旦A设置了一个和B属性一样的属性，那么我觉得就是类似于一种重写
+ 判断一个对象身上有没有这个属性`obj.hasOwnProperty(key)`

+ 了解到了柯里化，高阶函数和纯函数
+ 了解了`replace`,这个一直很常用，但是我一直都不太熟悉
+ 关于我对`cached()`还是很迷惑，主要是不太理解为什么非得用它

