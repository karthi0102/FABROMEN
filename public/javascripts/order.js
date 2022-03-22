// quantity
const v1=document.querySelector('.div1')
const v2=document.querySelector('.div2')
const v3=document.querySelector('.div3')
const v4=document.querySelector('.div4')
const v5=document.querySelector('.div5')
const v6=document.querySelector('.div6')
function generateRandomNumber() {
    return Math.floor(100000 + Math.random() * 900000);
}
let number = generateRandomNumber();

function numberToArray(number) {
    let array = number.toString().split(""); 
    return array.map(x => parseInt(x)); 
}
 
var myArray = numberToArray(otp);
console.log(myArray);

v1.textContent=myArray[0]
v2.textContent=myArray[1]
v3.textContent=myArray[2]
v4.textContent=myArray[3]
v5.textContent=myArray[4]
v6.textContent=myArray[5]