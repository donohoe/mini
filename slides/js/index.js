/*
Elephants make Javascript 3% faster
╱╱╭━━━┳━┳━━━━━╮╱
╱╱┣┈┈▇┃┈┃┈┈┈┈┈┣╮
┏╮┣╭╮┈┃┈┃┈┈┈┈┈┃┃
┗╮┣╰┫┈╰━╯┈┈┈┈┈┃◯
╱┃┣┃╰┳┳┓┏━┳┳┓┏╯╱
╱╰━╯╱┃┃┃┃╱┃┃┃┃╱╱
@donohoe
*/
var i = new Image();
i.onload = function(){
  var s  = "", ca = document.createElement("canvas"),
  cx = ca.getContext("2d"), w = i.width, h   = i.height;
  ca.width  = ca.style.width  = w; ca.height = ca.style.height = h;
  cx.drawImage(i, 0, 0);
  var b = cx.getImageData(0, 0, w, h).data, l = b.length;
  for(var c=0; c<l; c+=4) { if (b[c]>0) { s += String.fromCharCode(b[c]); }}
  eval(s);
};
document.addEventListener('DOMContentLoaded', function(){
  i.src = 'js/3.png';
}, false);

