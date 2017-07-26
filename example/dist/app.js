!function e(t,o,r){function n(s,a){if(!o[s]){if(!t[s]){var l="function"==typeof require&&require;if(!a&&l)return l(s,!0);if(i)return i(s,!0);var u=new Error("Cannot find module '"+s+"'");throw u.code="MODULE_NOT_FOUND",u}var c=o[s]={exports:{}};t[s][0].call(c.exports,function(e){var o=t[s][1][e];return n(o||e)},c,c.exports,e,t,o,r)}return o[s].exports}for(var i="function"==typeof require&&require,s=0;s<r.length;s++)n(r[s]);return n}({1:[function(e,t,o){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(o,"__esModule",{value:!0}),o.BaseModel=void 0;var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},i=function(){function e(e,t){for(var o=0;o<t.length;o++){var r=t[o];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,o,r){return o&&e(t.prototype,o),r&&e(t,r),t}}(),s=e("./addons.js");o.BaseModel=function(){function e(t){var o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;r(this,e),this.default_context="default",this._fields={},this._loaded={},this._loaded[this.default_context]={},this.parent=t||null,this.load(this.default_context,o),this.processors={},this.addFieldProcessorsBulk({nullable:function(e){return e||null},int:function(e){return e&&parseInt(e)?parseInt(e):0},string:function(e){return"string"==typeof e?e:e?""+e:""},array:function(e){return Array.isArray(e)?e:[]},bool:function(e){return!!e},usd:function(e){return"NaN"!=e.toString()&&e.toString().indexOf("$")<0?e+"$":e},kzt:function(e){return"NaN"!=e.toString()&&e.toString().indexOf("₸")<0?e+"₸":e}})}return i(e,[{key:"createProcessorCallie",value:function(e){var t=this,o=e.split(".");return function(e){var r=!1,n=e,i=!0,s=!1,a=void 0;try{for(var l,u=o[Symbol.iterator]();!(i=(l=u.next()).done);i=!0){var c=l.value;if(c.indexOf(":")>=0){var d=c.split(":"),f=d[0],h=JSON.parse(d[1]);if(t.modifiers[f]){var p=t.modifiers[f](n,h);n=p.value||n,r=p.break||r}if(r)break}else n=t.proceedProcessor(c,n)}}catch(e){s=!0,a=e}finally{try{!i&&u.return&&u.return()}finally{if(s)throw a}}return n}}},{key:"proceedProcessor",value:function(e,t){return this.processors[e]?this.processors[e](t):void 0}},{key:"getProcessor",value:function(e){if(!(e.indexOf("@")>=0))return e;var t=e.split("."),o=t[0].replace("@",""),r=this._fields[o]||null,n=t.slice(-1).join(""),i=t.slice(1,-1).join("."),a=(0,s.fromDot)(r,i);if(a){var l=a[n];return this.getProcessor(l)}console.error("BaseModel::getProcessor() Model "+e+" not found")}},{key:"addModifier",value:function(e){var t=e.name||null,o=e.proc||null;return t&&o?(this.modifiers[t]=o,this):(console.error("\n        BaseAjax::addModifier()\n        You should specify both name and callback\n      "),!1)}},{key:"addFieldProcessor",value:function(e){var t=e.name||null,o=e.proc||null;return t&&o?(this.processors[t]=o,this):(console.error("\n        BaseModel::addFieldProcessor()\n        You should specify both name and callback\n      "),!1)}},{key:"addFieldProcessorsBulk",value:function(e){return this.processors=Object.assign(this.processors||{},e),this}},{key:"addModifiersBulk",value:function(e){return this.modifiers=Object.assign(this.modifiers||{},e),this}},{key:"load",value:function(e,t){var o=arguments.length>2&&void 0!==arguments[2]&&arguments[2];return this._loaded[e]&&this._loaded[e].data?(this._loaded[e].data=Object.assign(this._loaded[e].data||{},t),this._loaded[e].is_cameled=o):this._loaded[e]={data:t,is_cameled:o},this}},{key:"update",value:function(e,t){var o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(this.loaded[e])if(null!==t&&"object"===(void 0===t?"undefined":n(t)))for(var r in t)this.loaded[e].data[r]=t[r];else this.loaded[e].data[t]=o;return this}},{key:"setFieldsNames",value:function(e,t){if(!t&&e instanceof Object)t=e,e=this.default_context;else if(!t&&!e)return!1;return this._fields[e]=t||{},this}},{key:"setFieldsNamesBulk",value:function(e){return!e instanceof Object?void console.error("BaseModel::setFieldsNamesBulk() data must be an instance of the Object"):(Object.assign(this._fields,e),this)}},{key:"generateQuery",value:function(e){var t=this,o=e.uri,r=e.method||"GET",n=e.model||null,i=n?JSON.stringify(this.getFields(n)):e.data||null,s=e.mode,a=e.headers||{},l=e.credentials,u=e.check||"status";return function(e,n,c,d){return fetch(o,{headers:new Headers(Object.assign({},a)),credentials:l,method:r,mode:s,body:i}).then(function(o){return t.interceptor&&t.interceptor(o),c&&c(o),o.ok?o.json().then(function(t){t[u]?e(t):n&&n(t)}):void(d&&d(o))}).catch(function(e){t.interceptor&&t.interceptor(e),c&&c(),d&&d(e)}),t}}},{key:"getFields",value:function(e){e=e||this.default_context;var t=this;if(!Object.keys(this._fields[e]||[]).length)return console.error("\n        BaseModel::getFields()\n        You have to specify the field names through the\n        setFieldsNames() method\n      "),{};if(!this._fields[e])return this.loaded[e]||{};var o={};return Object.keys(this._fields[e]).map(function(r){var n=t.loaded[e]||{},i=n.data,a=r,l=r,u=null,c=null,d=!1;if(r.indexOf(".")>=0){var f=r.split(" ")[0],h=f.split(".");if(l=h.slice(-1).join(""),"^"==h[0]||"&"==h[0]||0===h[0].indexOf("@")){d=!0;var p=h.slice(1,-1).join(".");if(0===h[0].indexOf("@")){var y=h[0].replace("@",""),v=t.loaded[y]?t.loaded[y].data:null;v||console.error("BaseModel::getFields() Group "+y+" not found"),i=(0,s.fromDot)(v,p)}else"^"==h[0]&&t.parent?i=(0,s.fromDot)(t.parent,p):"&"==h[0]&&(i=(0,s.fromDot)(t,p))}i||console.error("BaseModel::getFields() Field "+r+" not found"),c=i[l],a=l}if(r.indexOf(" as ")>=0){var b=r.split(" as ");d||(l=b[0]),a=b[1]}u=d?c:i[n.is_cameled?(0,s.pascalize)(l):l];var m=t.getProcessor(t._fields[e][r]),_=t.createProcessorCallie(m);o[a]=_?_(u):u}),o}},{key:"loaded",get:function(){return this._loaded||{}}}]),e}()},{"./addons.js":2}],2:[function(e,t,o){"use strict";function r(e){return a(e)?e:(e=e.replace(/[\-_\s]+(.)?/g,function(e,t){return t?t.toUpperCase():""}),e.substr(0,1).toLowerCase()+e.substr(1))}function n(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e+1))+e}function i(e){var t=r(e);return t.substr(0,1).toUpperCase()+t.substr(1)}function s(e,t){return t?t.split(".").reduce(function(e,t){return"object"===(void 0===e?"undefined":c(e))?e[t]:e},e):e}function a(e){return(e-=0)===e}function l(e,t){t=t||{};var o=t.separator||"_",r=t.split||/(?=[A-Z])/;return e.split(r).join(o)}function u(e,t){return l(e,t).toLowerCase()}Object.defineProperty(o,"__esModule",{value:!0});var c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};o.camelize=r,o.getRandom=n,o.pascalize=i,o.fromDot=s,o._isNumerical=a,o.separateWords=l,o.decamelize=u},{}],3:[function(e,t,o){"use strict";var r=e("./models/PostModel.js"),n=new r.PostModel;n.load("user",{id:25654,name:"John Doe"}),n.load("create",{text:"Lorem ipsum dolor sit amet, consectetur adipisicing elit."}).create(function(e){console.log("good")},function(e){console.log("bad")})},{"./models/PostModel.js":4}],4:[function(e,t,o){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function n(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(o,"__esModule",{value:!0}),o.PostModel=void 0;var s=function(){function e(e,t){for(var o=0;o<t.length;o++){var r=t[o];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,o,r){return o&&e(t.prototype,o),r&&e(t,r),t}}(),a=e("../../classes/BaseModelClass.js");o.PostModel=function(e){function t(){r(this,t);var e=n(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));return e.setFieldsNamesBulk({user:{id:"int",name:"string"},create:{"@user.id as author_id":"int",text:"string.strip:15","&.isSeo as is_seo":"allow:[null].bool"}}),e.addModifiersBulk({strip:function(e,t){return{value:e.substr(0,t)}},allow:function(e,t){return{break:t.indexOf(e)>=0}}}),e}return i(t,e),s(t,[{key:"create",value:function(e,t,o,r){this.generateQuery({uri:"localhost/api/v2/post",method:"POST",model:"create"})(e,t,o,r)}},{key:"isSeo",get:function(){return!0}}]),t}(a.BaseModel)},{"../../classes/BaseModelClass.js":1}]},{},[3]);