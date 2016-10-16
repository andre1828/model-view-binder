// new customObj(value, name on html)

console.time('loading');



let num = new number(20, 'number');

let str = new string('test', 'string');

let bool = new boolean(true, 'boolean');

let person = {
  name : 'Maria',
  age : 30 ,
  job : 'doctor',
  friend : new object({name : 'Ademiltoncreyson', age : 10, job: 'student'})
};

let obj = new object(person , 'person');

let peopleArray = [
  {name : 'Jonas', age : 20, job : 'cooker'} ,
  {name : 'Joelma', age : 90, job : 'Teacher'} ,
  {name : 'Khatherynie', age : 25, job : 'Developer'} ,
]

let arr = new array(peopleArray, 'peopleArray');

let numArr = new array(range(10), 'numArray');

console.timeEnd('loading');

function range(range) {
  let newArray = [];
  for (var i = 0; i < range; i++) {
      newArray.push(i);
  }
  return newArray;
}
