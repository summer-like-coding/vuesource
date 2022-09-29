# [源码阅读]Vue2源码系列(上)

## 前言

**本文参加了由[公众号@若川视野](https://link.juejin.cn/?target=https%3A%2F%2Flxchuan12.gitee.io) 发起的每周源码共读活动，[点击了解详情一起参与。](https://juejin.cn/post/7079706017579139102)**

**这是源码共读的第24期，链接：第24期 【vue2 工具函数】[初学者也能看懂的 Vue2 源码中那些实用的基础工具函数](https://juejin.cn/post/7079765637437849614)**

## 源码

### 准备源码

```bash
git clone git@github.com:vuejs/vue.git
```

其实我们阅读的是`dist`文价夹下的`vue.js`文件，**最主要的是[打包后的 vue.js 14行到379行](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fvuejs%2Fvue%2Fblob%2Fdev%2Fdist%2Fvue.js%23L14-L379)**

### 源码分析

#### `Object.freeze()`

定义：对一个`Object`进行冻结，当时他没法全部冻结，他和浅拷贝差不多，他只可以冻住**一层**，意思就是：它可以对直接属性进行冻结，对于属性是引用类型的他是没法完全冻结的。

```javascript
const obj1 = {
    name:'summer',
    age:13,
    parent:{
        name:'alex',
        age:15
    }
}
var freezeObject = Object.freeze(obj1);
//对直接属性进行修改
freezeObject.name = "summer瓜瓜"
console.log(obj1)
//对引用类型进行修改
freezeObject.parent.name = "summer瓜瓜"
console.log(obj1)
```

```javascript
{name: 'summer', age: 13, parent: {…}}
age: 13
name: "summer"
parent: {name: 'alex', age: 15}
```

```javascript
{name: 'summer', age: 13, parent: {…}}
age: 13
name: "summer"
parent: {name: 'summer瓜瓜', age: 15}
```

**说明：**它只对直接类型进行冻结，对于引用类型，他是冻结不了的

**我们可以使用`isFrozen()`来判断是不是冻结**

```javascript
Object.isFrozen(obj1)//true
```

**一旦你的对象冻结了，那么你不能对对象进行任何的修改和添加等，即使是从原型上入手也不可以**

```javascript
Object.defineProperty(obj1, 'sex', {
    value:14
});
```

**这边直接就会报错，告诉你，不允许修改和添加**

#### `isPrimitive(value)`

定义：用于判断这个值的类型，**只进行判断了基本类型，对于引用类型还没有进行判断**

```javascript
function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    // $flow-disable-line
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}
```

#### 补充：

##### JavaScript的七大数据类型

+ number
+ string
+ null
+ undefined
+ Symbol
+ boolean
+ Object

##### 判断数据类型的方法

+ `typeof`

  > 定义：他只可以判断**简单数据和Function**类型，对于**Object和null**的判断不出来

+ Object原型

  > 定义：可以判断各种数据类型

  ```javascript
  Object.prototype.toString.call(value)
  ```

  ```javascript
  Object.prototype.toString.call([1,2,3])//"[object Array]"
  Object.prototype.toString.call("hello")//'[object String]'
  Object.prototype.toString.call(1)//'[object Number]'
  Object.prototype.toString.call(null)//'[object Null]'
  ```

问题：**因为我们获取得到不是直接的类型，一般我们都需要截取**，后续介绍

+ `instanceof`

  > 定义：`A instanceof B `,判断A是不是B的实例

  ```javascript
  1 instanceof Number//false
  "hello" instanceof String//false
  [] instanceof Array//true
  [] instanceof Object//true
  ```

  其实它使用的也是原型，利用的是**`A.__proto__ = B.prototype`**

  **原型这种东西，一般只有引用类型的才会有，也就是这个判断数据类型对方法只对引用类型有效**

  ```javascript
  const arr1 = [1,2,3]
  console.log(arr1)
  ```

  ```javascript
  [1, 2, 3]
  0: 1
  1: 2
  2: 3
  length: 3
  [[Prototype]]: Array(0)
  ```

  可以看到它是由`Prototype`这个属性的

  ```javascript
  const value = "hello";
  console.log(value)//hello
  const num = 1
  console.log(num)//1
  ```

  **我们可以看出，他们身上是没有这个属性的**

  至于为什么我们的`[] instanceof Array`,`[] instanceof Object`？

  + 因为`instanceof`可以判断出，`[] instanceof Array`,说明`[]`在`Array`的实例上
  + 当时我们可以知道`Array.prototype.__proto__`又指向了`Object.prototype`
  + 所以我们就可以推断出，这个`[] instanceof Object`

参考链接：[判断JS数据类型的四种方法 - 一像素 - 博客园 (cnblogs.com)](https://www.cnblogs.com/onepixel/p/5126046.html)

#### `isPlainObject`

定义：**鉴于`typeof`的缺点，没法准确判断`Object`是对象还是数组**，所以我们需要另一个函数来判断一下，他是精准判断一下

```javascript
let _tostring = Object.prototype.toString;
function isPlainObject(obj) {
  return _tostring.call(obj) === '[object object]'
}
```

**那么类似的，也可以对Object的继续继续划分**

#### `isRegExp(value)`

定义：判断value是不是正则表达式

```javascript
let _tostring = Object.prototype.toString;
function isRegExp (v) {
  return _toString.call(v) === '[object RegExp]'
}
```

#### `isRawType(value)`

定义：用于判断这个`value`的准确类型，当时正如上面提到的，它返回的是一个`"[Object Type]"`l类型，所以需要进行一些处理，`slice`

```javascript
var _toString = Object.prototype.toString;
function toRawType (value) {
  return _toString.call(value).slice(8, -1)//这样就可以直接显示出类型
}
```

**这样我们就可以直接获得到类型**

#### `isValidArrayINdex(val)`

定义：判断这个数组的索引是不是真实存在，就是有没有超过

```javascript
function isValidArrayIndex (val) {
  var n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}
```

知识点

+ `ParseFloat(string)`:意思就是将`string`转为`Float`类型

当遇到非数字的字符串时，他们会选取属于数字字符串的那一部分，来将它转为**浮点数**，类型还是`number`

```javascript
ParseFloat("123")//123
ParseFloat("1.23")//1.23
parseFloat("12asx.3")//12
parseFloat("asdf")//NaN
parseFloat("ASD123")//NaN
```

**对于不能转化为浮点数的值，我们直接就转为`NaN`**

**重要：他处理的时候，会先进行`str.trim()`操作**

+ `Math.floor(n) === n`

含义：因为我们的所有下标，他肯定时整数，这种向下取整就可以判断他到底是不是一个整数

+ `isFinite(value)`

含义：用于判断这个值是不有有限数值，一般会返回一个值

**只有当value为正无穷大或者负无穷大或者为`NaN`时，我们认为他不是有限数值**

```javascript
isFinite(Infinity)//false
isFinite(-Infinity)//false
isFinite(NaN)//false
isFinite(0); //true
isFinite("0");//true 
```

**比较：**

`Number.isFinite(value)`

他的要求更加严格，他需要`value`是`number`并且满足`isFinite(value)`

```javascript
if (Number.isFinite === undefined) Number.isFinite = function(value) {
    return typeof value === 'number' && isFinite(value);
}
```

参考链接：

[Number.isFinite() - JavaScript | MDN (mozilla.org)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite)

[isFinite() - JavaScript | MDN (mozilla.org)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/isFinite)

#### `toString(value)`

定义：判断这个value转为字符串

```javascript
  function toString (val) {
    return val == null
      ? ''
      : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
        ? JSON.stringify(val, null, 2)
        : String(val)
  }
```

逻辑：

+ 当`value`为空时，那么返回的就是`“ ”`空字符串
+ 当`value`为数组时，我们可以将`value`转为字符串，采用`JSON.stringify()`方式
+ 当`value`为纯对象，将`JS`对象转为`JSON`字符串
+ 其他的对于普通类的，我们可以利用`String(value)`转为字符串

#### `toNumber(value)`

定义：将他直接转为数字，如果不能转变为字符串

```javascript
  function toNumber (val) {
    var n = parseFloat(val);
    return isNaN(n) ? val : n
  }
```

逻辑：

+ 首先转为`number`
+ 因为`ParseFloat(value)`，如果`value`无法转为任何number，那么就是`NaN`
+ `isNaN()`，判断这个值是不是`NaN`

## 感悟和收获

1. 数据类型判断进行了复习
   + `typeof`:对一些`Object`的`array`和`object`判断不准
   + `instance`:因为原型的特点，所以他只能对引用类型进行判断
   + `Object.prototype.toString.call(value)`
2. 了解到了一些我不太常用的`api`
   + `freeze()`:浅冻住对象，只可以保护一层，不可以进行修改和增加
   + `isFinite(value)`:判断这个数是不是有限的
   + `String(value)`：转为字符串，之前一直用的`toString()`
