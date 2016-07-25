console.log("1111");
console.log("1112");
console.log("1113");
console.log("1114");
console.log("1115");
console.log("1116");
console.log("1117");
console.log("1118");
console.log("1119");
console.log("1110");
console.log("1121");
console.log("1122");
console.log("1123");
console.log("1124");
console.log("1125");
console.log("1125");
console.log("1126");
console.log("1127");
console.log("1128");
console.log("1129");
console.log("1120");

function pad (str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}

for (i = 0; i < 10000; i++) {
var num = i
var n = num.toString();

console.log(pad(n, 4));
} 

for (i = 65; i < 91; i++) {
String.fromCharCode(i);
pad(i, 4);
console.log(pad(i, 4));
	console.log(String.fromCharCode(i));
}
 

var array = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'z'];

for (var i = 0; i < array.length; i++) {
	var first = array[i];

	for (var j = 0; j < array.length; j++) {
		var second = array[j];

		for (var k = 0; k < array.length; k++) {
			var third = array[k];

			for (var w = 0; w < array.length; w++) {
				var fourth = array[w];

				console.log(first + second + third + fourth);
			}
		}
	}
}

var passhash = CryptoJS.MD5('rameen').toString();

console.log(passhash);
