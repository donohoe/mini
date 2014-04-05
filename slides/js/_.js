var $=function(el) {
 return document.getElementById(el);
};

var $$=function(el) {
 return document.getElementsByClassName(el);
};

/* Cookie */
var _sC=function(name, value, expires, path, domain, secure) { // Set Cookie
  var t = new Date();
  t.setTime(t.getTime());
  if (expires) { expires = expires*86400000; }
  var ed = new Date(t.getTime()+(expires));
  document.cookie = name+"=" +escape(value)+
  ((expires) ? ";expires="+ed.toGMTString() : "")+((path) ? ";path="+path : "")+
  ((domain)  ? ";domain="+domain : "")+((secure) ? ";secure" : "");
};

var _gC=function(lookFor) { // Get Cookie
  var all=document.cookie.split(';'),len=all.length,tmp='',nme='',val='',fnd=false;
  for (i=0;i<len;i++) {
    tmp = all[i].split('=');
    nme = tmp[0].replace(/^\s+|\s+$/g, '');
    if (nme == lookFor ) {
      fnd = true;
      if ( tmp.length > 1 ) { val = unescape(tmp[1].replace(/^\s+|\s+$/g, '')); }
      return val;
      break;
    }
    tmp = null;
    nme = '';
  }
  if (!fnd ) { return null; }
};

