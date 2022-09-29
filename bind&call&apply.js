function greet() {
    var reply = [this.animal, 'typically sleep between', this.sleepDuration].join(' ');
    console.log(reply);
    return reply
}
var obj = {
    animal: 'cats', sleepDuration: '12 and 16 hours'
};
console.log("call返回结果", greet.call(obj));
greet.call(obj);  // cats typically sleep between 12 and 16 hours

function list() {
    // return Array.prototype.slice.call(arguments);
    return [...arguments]
}

function addArguments(arg1, arg2) {
    // console.log("arg1",arg1);
    // console.log("arg2",arg2);
    return arg1 + arg2
}

var list1 = list(1, 2, 3); // [1, 2, 3]
console.log("list1",list1)
var result1 = addArguments(1, 2); // 3

// 创建一个函数，它拥有预设参数列表。
var leadingThirtysevenList = list.bind(null, 37);

console.log("leadingThirtysevenList",leadingThirtysevenList)
// 创建一个函数，它拥有预设的第一个参数
var addThirtySeven = addArguments.bind(null,37);
console.log("addThirtySeven",addThirtySeven)

var list2 = leadingThirtysevenList();
// [37]
console.log("list2",list2)

var list3 = leadingThirtysevenList(1, 2, 3);
// [37, 1, 2, 3]
console.log("list3",list3)

var result2 = addThirtySeven(5);
// 37 + 5 = 42
// console.log("result2",result2)
var result3 = addThirtySeven(5, 10);
// console.log("result3",result3)
  // 37 + 5 = 42 ，第二个参数被忽略
