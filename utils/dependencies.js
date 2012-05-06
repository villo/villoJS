
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
    http://www.JSON.org/json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html
*/

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {


        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {


        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];


        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }


        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }


        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':


            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

            return String(value);


        case 'object':

            if (!value) {
                return 'null';
            }

            gap += indent;
            partial = [];

            if (Object.prototype.toString.apply(value) === '[object Array]') {


                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }


                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }


            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {


                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }


            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }


    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

            var i;
            gap = '';
            indent = '';

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }


            } else if (typeof space === 'string') {
                indent = space;
            }

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            return str('', {'': value});
        };
    }


    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {


            var j;

            function walk(holder, key) {


                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }


            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {


                j = eval('(' + text + ')');


                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

            throw new SyntaxError('JSON.parse');
        };
    }
}());


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
 * PubNub-3.1.js + socketIO
 * See http://www.pubnub.com and http://www.socket.io
 */

/*
 * PUBNUB:
 */
(function(){
function r(){return function(){}}
window.JSON&&window.JSON.stringify||function(){function w(c){k.lastIndex=0;return k.test(c)?'"'+c.replace(k,function(c){var e=g[c];return"string"===typeof e?e:"\\u"+("0000"+c.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+c+'"'}function t(c,g){var e,h,o,n,k=i,l,f=g[c];f&&"object"===typeof f&&"function"===typeof f.toJSON&&(f=f.toJSON(c));"function"===typeof m&&(f=m.call(g,c,f));switch(typeof f){case "string":return w(f);case "number":return isFinite(f)?""+f:"null";case "boolean":case "null":return""+
f;case "object":if(!f)return"null";i+=p;l=[];if("[object Array]"===Object.prototype.toString.apply(f)){n=f.length;for(e=0;e<n;e+=1)l[e]=t(e,f)||"null";o=0===l.length?"[]":i?"[\n"+i+l.join(",\n"+i)+"\n"+k+"]":"["+l.join(",")+"]";i=k;return o}if(m&&"object"===typeof m){n=m.length;for(e=0;e<n;e+=1)h=m[e],"string"===typeof h&&(o=t(h,f))&&l.push(w(h)+(i?": ":":")+o)}else for(h in f)Object.hasOwnProperty.call(f,h)&&(o=t(h,f))&&l.push(w(h)+(i?": ":":")+o);o=0===l.length?"{}":i?"{\n"+i+l.join(",\n"+i)+"\n"+
k+"}":"{"+l.join(",")+"}";i=k;return o}}window.JSON||(window.JSON={});"function"!==typeof String.prototype.toJSON&&(String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()});var k=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,i,p,g={"\u0008":"\\b","\t":"\\t","\n":"\\n","\u000c":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},m;"function"!==typeof JSON.stringify&&(JSON.stringify=function(c,
g,e){var h;p=i="";if("number"===typeof e)for(h=0;h<e;h+=1)p+=" ";else"string"===typeof e&&(p=e);if((m=g)&&"function"!==typeof g&&("object"!==typeof g||"number"!==typeof g.length))throw Error("JSON.stringify");return t("",{"":c})});"function"!==typeof JSON.parse&&(JSON.parse=function(c){return eval("("+c+")")})}();
window.PUBNUB||function(){function w(a){var b={},d=a.publish_key||villo.app.pubnub.pub,s=a.subscribe_key||villo.app.pubnub.sub,j=a.ssl?"s":"",z="http"+j+"://"+(a.origin||"pubsub.pubnub.com"),q={history:function(a,b){var b=a.callback||b,d=a.limit||100,c=a.channel,e=f();if(!c)return g("Missing Channel");if(!b)return g("Missing Callback");u({c:e,url:[z,"history",s,A(c),e,d],b:function(a){b(a)},a:function(a){g(a)}})},time:function(a){var b=f();u({c:b,url:[z,"time",b],b:function(b){a(b[0])},a:function(){a(0)}})},uuid:function(a){var b=f();
u({c:b,url:["http"+j+"://pubnub-prod.appspot.com/uuid?callback="+b],b:function(b){a(b[0])},a:function(){a(0)}})},publish:function(a,b){var b=b||a.callback||r(),c=a.message,e=a.channel,j=f();if(!c)return g("Missing Message");if(!e)return g("Missing Channel");if(!d)return g("Missing Publish Key");c=JSON.stringify(c);c=[z,"publish",d,s,0,A(e),j,A(c)];if(1800<c.join().length)return g("Message Too Big");u({c:j,b:function(a){b(a)},a:function(){b([0,"Disconnected"])},url:c})},unsubscribe:function(a){a=a.channel;
a in b&&(b[a].d=0,b[a].e&&b[a].e(0))},subscribe:function(a,d){function e(){var a=f();b[j].d&&(b[j].e=u({c:a,url:[t,"subscribe",s,A(j),a,i],a:function(){m||(m=1,o());setTimeout(e,x);q.time(function(a){a||k()})},b:function(a){b[j].d&&(p||(p=1,l()),m&&(m=0,n()),h=B.set(s+j,i=h&&B.get(s+j)||a[1]),c(a[0],function(b){d(b,a)}),setTimeout(e,10))}}))}var j=a.channel,d=d||a.callback,h=a.restore,i=0,k=a.error||r(),l=a.connect||r(),n=a.reconnect||r(),o=a.disconnect||r(),m=0,p=0,t=M(z);if(!C)return I.push([a,
d,q]);if(!j)return g("Missing Channel");if(!d)return g("Missing Callback");if(!s)return g("Missing Subscribe Key");j in b||(b[j]={});if(b[j].d)return g("Already Connected");b[j].d=1;e()},xdr:u,ready:D,db:B,each:c,map:G,css:H,$:p,create:l,bind:h,supplant:e,head:o,search:m,attr:n,now:k,unique:t,events:y,updater:i,init:w};return q}function t(){return"x"+ ++N+""+ +new Date}function k(){return+new Date}function i(a,b){function d(){c+b>k()?(clearTimeout(s),s=setTimeout(d,b)):(c=k(),a())}var s,c=0;return d}
function p(a){return document.getElementById(a)}function g(a){console.log(a)}function m(a,b){var d=[];c(a.split(/\s+/),function(a){c((b||document).getElementsByTagName(a),function(a){d.push(a)})});return d}function c(a,b){if(a&&b)if("undefined"!=typeof a[0])for(var d=0,s=a.length;d<s;)b.call(a[d],a[d],d++);else for(d in a)a.hasOwnProperty&&a.hasOwnProperty(d)&&b.call(a[d],d,a[d])}function G(a,b){var d=[];c(a||[],function(a,c){d.push(b(a,c))});return d}function e(a,b){return a.replace(O,function(a,
c){return b[c]||a})}function h(a,b,d){c(a.split(","),function(a){function c(a){a||(a=window.event);d(a)||(a.cancelBubble=!0,a.returnValue=!1,a.preventDefault&&a.preventDefault(),a.stopPropagation&&a.stopPropagation())}b.addEventListener?b.addEventListener(a,c,!1):b.attachEvent?b.attachEvent("on"+a,c):b["on"+a]=c})}function o(){return m("head")[0]}function n(a,b,d){if(d)a.setAttribute(b,d);else return a&&a.getAttribute&&a.getAttribute(b)}function H(a,b){for(var d in b)if(b.hasOwnProperty(d))try{a.style[d]=
b[d]+(0<"|width|height|top|left|".indexOf(d)&&"number"==typeof b[d]?"px":"")}catch(c){}}function l(a){return document.createElement(a)}function f(){return E||q()?0:t()}function A(a){return G(encodeURIComponent(a).split(""),function(a){return 0>"-_.!~*'()".indexOf(a)?a:"%"+a.charCodeAt(0).toString(16).toUpperCase()}).join("")}function u(a){function b(a,b){f||(f=1,a||i(b),d.onerror=null,clearTimeout(g),setTimeout(function(){a&&h();var b=p(e),d=b&&b.parentNode;d&&d.removeChild(b)},x))}if(E||q())return P(a);
var d=l("script"),c=a.c,e=t(),f=0,g=setTimeout(function(){b(1)},F),h=a.a||r(),i=a.b||r();window[c]=function(a){b(0,a)};d[J]=J;d.onerror=function(){b(1)};d.src=a.url.join(K);n(d,"id",e);o().appendChild(d);return b}function P(a){function b(a){e||(e=1,clearTimeout(g),c&&(c.onerror=c.onload=null,c.abort&&c.abort(),c=null),a&&h())}function d(){if(!f){f=1;clearTimeout(g);try{response=JSON.parse(c.responseText)}catch(a){return b(1)}i(response)}}var c,e=0,f=0,g=setTimeout(function(){b(1)},F),h=a.a||r(),i=
a.b||r();try{c=q()||window.XDomainRequest&&new XDomainRequest||new XMLHttpRequest,c.onerror=c.onabort=function(){b(1)},c.onload=c.onloadend=d,c.timeout=F,c.open("GET",a.url.join(K),!0),c.send()}catch(k){return b(0),E=0,u(a)}return b}function D(){PUBNUB.time(k);PUBNUB.time(function(){setTimeout(function(){C||(C=1,c(I,function(a){a[2].subscribe(a[0],a[1])}))},x)})}function q(){if(!L.get)return 0;var a={id:q.id++,send:r(),abort:function(){a.id={}},open:function(b,c){q[a.id]=a;L.get(a.id,c)}};return a}
window.console||(window.console=window.console||{});console.log||(console.log=(window.opera||{}).postError||r());var B=function(){var a=window.localStorage;return{get:function(b){try{return a?a.getItem(b):-1==document.cookie.indexOf(b)?null:((document.cookie||"").match(RegExp(b+"=([^;]+)"))||[])[1]||null}catch(c){}},set:function(b,c){try{if(a)return a.setItem(b,c)&&0;document.cookie=b+"="+c+"; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/"}catch(e){}}}}(),N=1,O=/{([\w\-]+)}/g,J="async",K="/",F=14E4,
x=1E3,E=-1==navigator.userAgent.indexOf("MSIE 6"),M=function(){var a=Math.floor(9*Math.random())+1;return function(b){return 0<b.indexOf("pubsub")&&b.replace("pubsub","ps"+(10>++a?a:a=1))||b}}(),y={list:{},unbind:function(a){y.list[a]=[]},bind:function(a,b){(y.list[a]=y.list[a]||[]).push(b)},fire:function(a,b){c(y.list[a]||[],function(a){a(b)})}},v=p("pubnub")||{},C=0,I=[];PUBNUB=w({publish_key:n(v,"pub-key"),subscribe_key:n(v,"sub-key"),ssl:"on"==n(v,"ssl"),origin:n(v,"origin")});H(v,{position:"absolute",
top:-x});if("opera"in window||n(v,"flash"))v.innerHTML="<object id=pubnubs data=https://dh15atwfs066y.cloudfront.net/pubnub.swf><param name=movie value=https://dh15atwfs066y.cloudfront.net/pubnub.swf><param name=allowscriptaccess value=always></object>";var L=p("pubnubs")||{};h("load",window,function(){setTimeout(D,0)});PUBNUB.rdx=function(a,b){if(!b)return q[a].onerror();q[a].responseText=unescape(b);q[a].onload()};q.id=x;window.jQuery&&(window.jQuery.PUBNUB=PUBNUB);"undefined"!==typeof module&&
(module.f=PUBNUB)&&D()}();
})();

/*
 * SOCKET.IO:
 */
(function(){

    // =====================================================================
    // PubNub Socket.IO
    // =====================================================================
    var p          = PUBNUB
    ,   standard   = 'standard'
    ,   uuid       = PUBNUB.db.get('uuid') || p.uuid(function(id){
            PUBNUB.db.set( 'uuid', uuid = id )
        })
    ,   now        = function(){return+new Date}
    ,   namespaces = {}
    ,   users      = {}
    ,   io         = window.io = {
        connected  : false,
        disconnect : function(channel) {
            namespaces = {};
            p.unsubscribe(channel);
        },
        connect    : function( host, setup ) {

            // PARSE SETUP and HOST
            var urlbits   = (host+'////').split('/')
            ,   setup     = setup || {}
            ,   cuser     = setup['user'] || {}
            ,   presence  = 'presence' in setup ? setup['presence'] : true
            ,   origin    = urlbits[2]
            ,   namespace = urlbits[3] || standard
            ,   socket    = create_socket(namespace);

            // PASSWORD ENCRYPTION
            socket.password = 'sjcl' in window && setup.password;

            // PUBNUB ALREADY SETUP?
            if (io.connected) return socket;
            io.connected = true;

            // GEO LOCATION
            if (setup.geo) setInterval( locate, 15000 ) && locate();

            // SETUP PUBNUB
            setup.origin   = origin;
            p              = p.init(setup);
            p.disconnected = 0;
            p.channel      = setup.channel || standard;

            // DISCONNECTED
            function dropped() {
                if (p.disconnected) return;
                p.disconnected = 1;
                p.each( namespaces, function(ns) {
                    p.events.fire( ns + 'disconnect', {} ) 
                } );
            }

            // ESTABLISH CONNECTION
            p.subscribe({
                channel : p.channel,
                disconnect : dropped,
                reconnect : function() {p.disconnected = 0;},
                connect : function() {
                    p.disconnected = 0;
                    p.each( namespaces, function(ns) {
                        p.events.fire( ns + 'connect', {} ) 
                    } );
                },
                callback : function(evt) {
                    if (p.disconnected) p.each( namespaces, function(ns) {
                        p.events.fire( ns + 'reconnect', {} ) 
                    } );
 
                    p.disconnected = 0;

                    var data = decrypt( evt.ns, evt.data );

                    if (evt.ns in namespaces)
                        data && p.events.fire( evt.ns + evt.name, data );

                    // USER EVENTS
                    if (!evt.uuid || evt.uuid === uuid) return;

                    evt.name === 'ping' && p.each( data.nss, function(ns) {

                        users[ns] = users[ns] || {};

                        var user = users[ns][evt.uuid] =
                        users[ns][evt.uuid] || (function() { return {
                            geo       : evt.geo || [ 0, 0 ],
                            uuid      : evt.uuid,
                            last      : now(),
                            socket    : socket,
                            namespace : ns,
                            connected : false,
                            slot      : socket.user_count++
                        } })();

                        user.last = now();
                        user.data = data.cuser;

                        if (user.connected) return;

                        user.connected = true;
                        p.events.fire( ns + 'join', user );

                    } );

                    if (evt.name === 'user-disconnect') disconnect(evt.uuid);
                }
            });

            // TCP KEEP ALIVE
            if (presence) {
                clearInterval(p.tcpKeepAlive);
                p.tcpKeepAlive = setInterval( p.updater( function() {
                    var nss = p.map( namespaces, function(ns) { return ns } );
                    if (!(nss||[]).length) return;
                    send( 'ping', standard, { nss : nss, cuser : cuser } );
                }, 2500 ), 500 );
            }

            // RETURN SOCKET
            return socket;
        }
    };

    // =====================================================================
    // Advanced User Presence
    // =====================================================================
    setInterval( function() {
        if (p.disconnected) return;

        p.each( users, function(namespace) {
            p.each( users[namespace], function(uid) {
                var user = users[namespace][uid];
                if (now() - user.last < 5500 || uid === uuid) return;
                disconnect(user.uuid);
            } );
        } );
    }, 1000 );

    function disconnect(uid) {
        p.each( namespaces, function(ns) {
            var user = users[ns][uid];
            if (!user.connected) return;

            user.connected = false;
            user.socket.user_count--;
            p.events.fire( ns + 'leave', user ) 
        } );
    }

    typeof window !== 'undefined' &&
    p.bind( 'beforeunload', window, function() {
        send( 'user-disconnect', '', uuid );
        return true;
    } );

    // =====================================================================
    // Stanford Crypto Library with AES Encryption
    // =====================================================================
    function encrypt( namespace, data ) {
        var namespace = namespace || standard
        ,   socket    = namespaces[namespace];

        return 'password' in socket && socket.password && sjcl.encrypt(
           socket.password, JSON.stringify(data)+''
        ) || data;
    }

    function decrypt( namespace, data ) {
        var namespace = namespace || standard
        ,   socket    = namespaces[namespace];

        if (!socket.password) return data;
        try { return JSON.parse(
            sjcl.decrypt( socket.password, data )
        ); }
        catch(e) { return null; }
    }

    // =====================================================================
    // PUBLISH A MESSAGE + Retry if Failed with fallback
    // =====================================================================
    function send( event, namespace, data, wait, cb ) {
        p.publish({
            channel : p.channel,
            message : {
                name : event,
                ns   : namespace || standard,
                data : encrypt( namespace, data || {} ),
                uuid : uuid,
                geo  : p.location || [ 0, 0 ]
            },
            callback : function(info) {
                if (info[0]) return (cb||function(){})(info);
                var retry = (wait || 500) * 2;
                setTimeout( function() {
                    send( event, namespace, data, retry, cb );
                }, retry > 5500 ? 5500 : retry );
            }
        });
    }

    // =====================================================================
    // GEO LOCATION DATA (LATITUDE AND LONGITUDE)
    // =====================================================================
    function locate(callback) {
        var callback = callback || function(){};
        navigator && navigator.geolocation &&
        navigator.geolocation.getCurrentPosition(function(position) {  
            p.location = [
                position.coords.latitude,
                position.coords.longitude
            ];
            callback(p.location);
        }) || callback([ 0, 0 ]); 
    }

    // =====================================================================
    // CREATE SOCKET
    // =====================================================================
    function create_socket(namespace) {
        if ( namespace !== standard &&
             !(standard in namespaces)
        ) create_socket(standard);

        return namespaces[namespace] = {
            namespace      : namespace,
            users          : users[namespace] = {},
            user_count     : 1,
            get_user_list  : function(){
                return namespaces[namespace].users;
            },
            get_user_count : function(){
                return namespaces[namespace].user_count;
            },
            emit : function( event, data, receipt ) {
                send( event, namespace, data, 0, receipt );
            },
            send : function( data, receipt ) {
                send( 'message', namespace, data, 0, receipt );
            },
            on : function( event, fn ) {
                if (typeof event === 'string')
                    p.events.bind( namespace + event, fn );
                else if (typeof event === 'object')
                    p.each( event, function(evt) {
                        p.events.bind( namespace + evt, fn );
                    } );
            },
            disconnect : function() {
                delete namespaces[namespace];
            }
        };
    }
})();