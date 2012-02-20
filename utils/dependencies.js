/* Villo Dependencies */



/* 
 * Store.js
 * Copyright (c) 2010-2011 Marcus Westin
 */
var store=function(){var b={},e=window,g=e.document,c;b.disabled=false;b.set=function(){};b.get=function(){};b.remove=function(){};b.clear=function(){};b.transact=function(a,d){var f=b.get(a);if(typeof f=="undefined")f={};d(f);b.set(a,f)};b.serialize=function(a){return JSON.stringify(a)};b.deserialize=function(a){if(typeof a=="string")return JSON.parse(a)};var h;try{h="localStorage"in e&&e.localStorage}catch(k){h=false}if(h){c=e.localStorage;b.set=function(a,d){c.setItem(a,b.serialize(d))};b.get=
function(a){return b.deserialize(c.getItem(a))};b.remove=function(a){c.removeItem(a)};b.clear=function(){c.clear()}}else{var i;try{i="globalStorage"in e&&e.globalStorage&&e.globalStorage[e.location.hostname]}catch(l){i=false}if(i){c=e.globalStorage[e.location.hostname];b.set=function(a,d){c[a]=b.serialize(d)};b.get=function(a){return b.deserialize(c[a]&&c[a].value)};b.remove=function(a){delete c[a]};b.clear=function(){for(var a in c)delete c[a]}}else if(g.documentElement.addBehavior){c=g.createElement("div");
e=function(a){return function(){var d=Array.prototype.slice.call(arguments,0);d.unshift(c);g.body.appendChild(c);c.addBehavior("#default#userData");c.load("localStorage");d=a.apply(b,d);g.body.removeChild(c);return d}};b.set=e(function(a,d,f){a.setAttribute(d,b.serialize(f));a.save("localStorage")});b.get=e(function(a,d){return b.deserialize(a.getAttribute(d))});b.remove=e(function(a,d){a.removeAttribute(d);a.save("localStorage")});b.clear=e(function(a){var d=a.XMLDocument.documentElement.attributes;
a.load("localStorage");for(var f=0,j;j=d[f];f++)a.removeAttribute(j.name);a.save("localStorage")})}}try{b.set("__storejs__","__storejs__");if(b.get("__storejs__")!="__storejs__")b.disabled=true;b.remove("__storejs__")}catch(m){b.disabled=true}return b}();


/* 
 * json2.js 
 * Public Domain
 * See http://www.JSON.org/js.html
 */
var JSON;if(!JSON){JSON={};}
(function(){"use strict";function f(n){return n<10?'0'+n:n;}
if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+
f(this.getUTCMonth()+1)+'-'+
f(this.getUTCDate())+'T'+
f(this.getUTCHours())+':'+
f(this.getUTCMinutes())+':'+
f(this.getUTCSeconds())+'Z':null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf();};}
var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}
function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}
if(typeof rep==='function'){value=rep.call(holder,key,value);}
switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}
gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}
v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}
if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==='string'){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}
v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}
if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}
rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}
return str('',{'':value});};}
if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}
return reviver.call(holder,key,value);}
text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+
('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}
if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}
throw new SyntaxError('JSON.parse');};}}());


/* 
 * Script.js
 * See https://github.com/ded/script.js
 */

!function(win, doc, timeout) {
  var head = doc.getElementsByTagName('head')[0],
      list = {}, ids = {}, delay = {}, scriptpath,
      scripts = {}, s = 'string', f = false,
      push = 'push', domContentLoaded = 'DOMContentLoaded', readyState = 'readyState',
      addEventListener = 'addEventListener', onreadystatechange = 'onreadystatechange',
      every = function(ar, fn) {
        for (var i = 0, j = ar.length; i < j; ++i) {
          if (!fn(ar[i])) {
            return f;
          }
        }
        return 1;
      };
      function each(ar, fn) {
        every(ar, function(el) {
          return !fn(el);
        });
      }

  if (!doc[readyState] && doc[addEventListener]) {
    doc[addEventListener](domContentLoaded, function fn() {
      doc.removeEventListener(domContentLoaded, fn, f);
      doc[readyState] = "complete";
    }, f);
    doc[readyState] = "loading";
  }

  function $script(paths, idOrDone, optDone) {
    paths = paths[push] ? paths : [paths];
    var idOrDoneIsDone = idOrDone && idOrDone.call,
        done = idOrDoneIsDone ? idOrDone : optDone,
        id = idOrDoneIsDone ? paths.join('') : idOrDone,
        queue = paths.length;
    function loopFn(item) {
      return item.call ? item() : list[item];
    }
    function callback() {
      if (!--queue) {
        list[id] = 1;
        done && done();
        for (var dset in delay) {
          every(dset.split('|'), loopFn) && !each(delay[dset], loopFn) && (delay[dset] = []);
        }
      }
    }
    timeout(function() {
      each(paths, function(path) {
        if (scripts[path]) {
          id && (ids[id] = 1);
          scripts[path] == 2 && callback();
          return;
        }
        scripts[path] = 1;
        id && (ids[id] = 1);
        create(scriptpath ?
          scriptpath + path + '.js' :
          path, callback);
      });
    }, 0);
    return $script;
  }

  function create(path, fn) {
    var el = doc.createElement("script"),
        loaded = f;
    el.onload = el.onerror = el[onreadystatechange] = function () {
      if ((el[readyState] && !(/^c|loade/.test(el[readyState]))) || loaded) {
        return;
      }
      el.onload = el[onreadystatechange] = null;
      loaded = 1;
      scripts[path] = 2;
      fn();
    };
    el.async = 1;
    el.src = path;
	el.type = "text/javascript"
    head.insertBefore(el, head.firstChild);
  }

  $script.get = create;

  $script.path = function(p) {
    scriptpath = p
  }
  $script.ready = function(deps, ready, req) {
    deps = deps[push] ? deps : [deps];
    var missing = [];
    !each(deps, function(dep) {
      list[dep] || missing[push](dep);
    }) && every(deps, function(dep) {
      return list[dep];
    }) ? ready() : !function(key) {
      delay[key] = delay[key] || [];
      delay[key][push](ready);
      req && req(missing);
    }(deps.join('|'));
    return $script;
  };

  var old = win.$script;
  $script.noConflict = function () {
    win.$script = old;
    return this;
  };

  (typeof module !== 'undefined' && module.exports) ?
    (module.exports = $script) :
    (win['$script'] = $script);

}(this, document, setTimeout);

/* 
 * PubNub-3.1.js 
 * See http://www.pubnub.com
 * This was moved here due to problemss with the async loader.
 */

function s(){return function(){}}
window.JSON&&window.JSON.stringify||function(){function y(c){k.lastIndex=0;return k.test(c)?'"'+c.replace(k,function(c){var g=f[c];return typeof g==="string"?g:"\\u"+("0000"+c.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+c+'"'}function u(c,f){var g,h,o,m,k=i,l,e=f[c];e&&typeof e==="object"&&typeof e.toJSON==="function"&&(e=e.toJSON(c));typeof p==="function"&&(e=p.call(f,c,e));switch(typeof e){case "string":return y(e);case "number":return isFinite(e)?String(e):"null";case "boolean":case "null":return String(e);
case "object":if(!e)return"null";i+=t;l=[];if(Object.prototype.toString.apply(e)==="[object Array]"){m=e.length;for(g=0;g<m;g+=1)l[g]=u(g,e)||"null";o=l.length===0?"[]":i?"[\n"+i+l.join(",\n"+i)+"\n"+k+"]":"["+l.join(",")+"]";i=k;return o}if(p&&typeof p==="object"){m=p.length;for(g=0;g<m;g+=1)h=p[g],typeof h==="string"&&(o=u(h,e))&&l.push(y(h)+(i?": ":":")+o)}else for(h in e)Object.hasOwnProperty.call(e,h)&&(o=u(h,e))&&l.push(y(h)+(i?": ":":")+o);o=l.length===0?"{}":i?"{\n"+i+l.join(",\n"+i)+"\n"+
k+"}":"{"+l.join(",")+"}";i=k;return o}}window.JSON||(window.JSON={});if(typeof String.prototype.toJSON!=="function")String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()};var k=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,i,t,f={"\u0008":"\\b","\t":"\\t","\n":"\\n","\u000c":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},p;typeof JSON.stringify!=="function"&&(JSON.stringify=function(c,
f,g){var h;t=i="";if(typeof g==="number")for(h=0;h<g;h+=1)t+=" ";else typeof g==="string"&&(t=g);if((p=f)&&typeof f!=="function"&&(typeof f!=="object"||typeof f.length!=="number"))throw Error("JSON.stringify");return u("",{"":c})});typeof JSON.parse!=="function"&&(JSON.parse=function(c){return eval("("+c+")")})}();
window.PUBNUB||function(){function y(a){var b={},d=a.publish_key||"pub-42c6b905-6d4e-4896-b74f-c1065ab0dc10",q=a.subscribe_key||"sub-4e37d063-edfa-11df-8f1a-517217f921a4",r=a.ssl?"s":"",v="http"+r+"://"+(a.origin||"pubsub.pubnub.com"),n={history:function(a,b){var b=a.callback||b,d=a.limit||100,j=a.channel,c=e();if(!j)return f("Missing Channel");if(!b)return f("Missing Callback");w({c:c,url:[v,"history",q,z(j),c,d],b:function(a){b(a)},a:function(a){f(a)}})},time:function(a){var b=e();w({c:b,url:[v,"time",b],b:function(b){a(b[0])},a:function(){a(0)}})},uuid:function(a){var b=
e();w({c:b,url:["http"+r+"://pubnub-prod.appspot.com/uuid?callback="+b],b:function(b){a(b[0])},a:function(){a(0)}})},analytics:function(a){var b=e(),c=a.limit||100,j=a.ago||0,f=a.duration||100,v=a.callback;w({c:b,b:function(a){v(a)},a:function(){v(0)},url:[["http"+r+"://pubnub-prod.appspot.com/analytics-channel?callback="+b,"sub-key="+q,"pub-key="+d,"channel="+z(a.channel||""),"limit="+c,"ago="+j,"duration="+f].join("&")]})},publish:function(a,b){var b=b||a.callback||s(),c=a.message,j=a.channel,r=
e();if(!c)return f("Missing Message");if(!j)return f("Missing Channel");if(!d)return f("Missing Publish Key");c=JSON.stringify(c);c=[v,"publish",d,q,0,z(j),r,z(c)];if(c.join().length>1800)return f("Message Too Big");w({c:r,b:function(a){b(a)},a:function(){b([0,"Disconnected"])},url:c})},unsubscribe:function(a){a=a.channel;if(a in b)b[a].d=0,b[a].e&&b[a].e(0)},subscribe:function(a,d){function r(){var a=e();if(b[j].d)b[j].e=w({c:a,url:[m,"subscribe",q,z(j),a,h],a:function(){setTimeout(r,A);n.time(function(a){a||
i()})},b:function(a){b[j].d&&(k||(k=1,l()),g=C.set(q+j,h=g&&C.get(q+j)||a[1]),c(a[0],function(b){d(b,a)}),setTimeout(r,10))}})}var j=a.channel,d=d||a.callback,g=a.restore,h=0,i=a.error||s(),k=0,l=a.connect||s(),m=N(v);if(!D)return I.push([a,d,n]);if(!j)return f("Missing Channel");if(!d)return f("Missing Callback");if(!q)return f("Missing Subscribe Key");j in b||(b[j]={});if(b[j].d)return f("Already Connected");b[j].d=1;r()},db:C,each:c,map:G,css:H,$:t,create:l,bind:h,supplant:g,head:o,search:p,attr:m,
now:k,unique:u,events:B,updater:i,init:y};return n}function u(){return"x"+ ++O+""+ +new Date}function k(){return+new Date}function i(a,b){function d(){c+b>k()?(clearTimeout(q),q=setTimeout(d,b)):(c=k(),a())}var q,c=0;return d}function t(a){return document.getElementById(a)}function f(a){console.log(a)}function p(a,b){var d=[];c(a.split(/\s+/),function(a){c((b||document).getElementsByTagName(a),function(a){d.push(a)})});return d}function c(a,b){if(a&&b)if(typeof a[0]!="undefined")for(var d=0,c=a.length;d<
c;)b.call(a[d],a[d],d++);else for(d in a)a.hasOwnProperty&&a.hasOwnProperty(d)&&b.call(a[d],d,a[d])}function G(a,b){var d=[];c(a||[],function(a,c){d.push(b(a,c))});return d}function g(a,b){return a.replace(P,function(a,c){return b[c]||a})}function h(a,b,d){c(a.split(","),function(a){function c(a){if(!a)a=window.event;if(!d(a))a.cancelBubble=true,a.returnValue=false,a.preventDefault&&a.preventDefault(),a.stopPropagation&&a.stopPropagation()}b.addEventListener?b.addEventListener(a,c,false):b.attachEvent?
b.attachEvent("on"+a,c):b["on"+a]=c})}function o(){return p("head")[0]}function m(a,b,d){if(d)a.setAttribute(b,d);else return a&&a.getAttribute&&a.getAttribute(b)}function H(a,b){for(var d in b)if(b.hasOwnProperty(d))try{a.style[d]=b[d]+("|width|height|top|left|".indexOf(d)>0&&typeof b[d]=="number"?"px":"")}catch(c){}}function l(a){return document.createElement(a)}function e(){return E||n()?0:u()}function z(a){return G(encodeURIComponent(a).split(""),function(a){return"-_.!~*'()".indexOf(a)<0?a:"%"+
a.charCodeAt(0).toString(16).toUpperCase()}).join("")}function w(a){function b(a,b){if(!f)f=1,a||i(b),d.onerror=null,clearTimeout(g),setTimeout(function(){a&&h();var b=t(e),d=b&&b.parentNode;d&&d.removeChild(b)},A)}if(E||n())return Q(a);var d=l("script"),c=a.c,e=u(),f=0,g=setTimeout(function(){b(1)},F),h=a.a||s(),i=a.b||s();window[c]=function(a){b(0,a)};d[J]=J;d.onerror=function(){b(1)};d.src=a.url.join(K);m(d,"id",e);o().appendChild(d);return b}function Q(a){function b(a){if(!e){e=1;clearTimeout(g);
if(c)c.onerror=c.onload=null,c.abort&&c.abort(),c=null;a&&h()}}function d(){if(!f){f=1;clearTimeout(g);try{response=JSON.parse(c.responseText)}catch(a){return b(1)}i(response)}}var c,e=0,f=0,g=setTimeout(function(){b(1)},F),h=a.a||s(),i=a.b||s();try{c=n()||window.XDomainRequest&&new XDomainRequest||new XMLHttpRequest,c.onerror=function(){b(1)},c.onload=d,c.timeout=F,c.open("GET",a.url.join(K),true),c.send()}catch(k){return b(0),E=0,w(a)}return b}function L(){PUBNUB.time(k);PUBNUB.time(function(){setTimeout(function(){D||
(D=1,c(I,function(a){a[2].subscribe(a[0],a[1])}))},A)})}function n(){if(!M.get)return 0;var a={id:n.id++,send:s(),abort:function(){a.id={}},open:function(b,c){n[a.id]=a;M.get(a.id,c)}};return a}window.console||(window.console=window.console||{});console.log||(console.log=(window.opera||{}).postError||s());var C=function(){var a=window.localStorage;return{get:function(b){return a?a.getItem(b):document.cookie.indexOf(b)==-1?null:((document.cookie||"").match(RegExp(b+"=([^;]+)"))||[])[1]||null},set:function(b,
c){if(a)return a.setItem(b,c)&&0;document.cookie=b+"="+c+"; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/"}}}(),O=1,P=/{([\w\-]+)}/g,J="async",K="/",F=14E4,A=1E3,E=navigator.userAgent.indexOf("MSIE 6")==-1,N=function(){var a=Math.floor(Math.random()*9)+1;return function(b){return b.indexOf("pubsub")>0&&b.replace("pubsub","ps"+(++a<10?a:a=1))||b}}(),B={list:{},unbind:function(a){B.list[a]=[]},bind:function(a,b){(B.list[a]=B.list[a]||[]).push(b)},fire:function(a,b){c(B.list[a]||[],function(a){a(b)})}},
x=t("pubnub")||{},D=0,I=[];PUBNUB=y({publish_key:m(x,"pub-key"),subscribe_key:m(x,"sub-key"),ssl:m(x,"ssl")=="on",origin:m(x,"origin")});H(x,{position:"absolute",top:-A});if("opera"in window||m(x,"flash"))x.innerHTML="<object id=pubnubs type=application/x-shockwave-flash width=1 height=1 data=https://dh15atwfs066y.cloudfront.net/pubnub.swf><param name=movie value=https://dh15atwfs066y.cloudfront.net/pubnub.swf /><param name=allowscriptaccess value=always /></object>";var M=t("pubnubs")||{};h("load",
window,function(){setTimeout(L,0)});PUBNUB.rdx=function(a,b){if(!b)return n[a].onerror();n[a].responseText=unescape(b);n[a].onload()};n.id=A;window.jQuery&&(window.jQuery.PUBNUB=PUBNUB);typeof module!=="undefined"&&(module.f=PUBNUB)&&L()}();
