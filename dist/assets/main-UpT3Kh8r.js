function kh(n){return n&&n.__esModule&&Object.prototype.hasOwnProperty.call(n,"default")?n.default:n}var Uh={exports:{}},Di={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Pm=Symbol.for("react.transitional.element"),Im=Symbol.for("react.fragment");function Nh(n,t,e){var l=null;if(e!==void 0&&(l=""+e),t.key!==void 0&&(l=""+t.key),"key"in t){e={};for(var r in t)r!=="key"&&(e[r]=t[r])}else e=t;return t=e.ref,{$$typeof:Pm,type:n,key:l,ref:t!==void 0?t:null,props:e}}Di.Fragment=Im;Di.jsx=Nh;Di.jsxs=Nh;Uh.exports=Di;var D=Uh.exports,wh={exports:{}},U={};/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ds=Symbol.for("react.transitional.element"),ty=Symbol.for("react.portal"),ny=Symbol.for("react.fragment"),ey=Symbol.for("react.strict_mode"),ly=Symbol.for("react.profiler"),ry=Symbol.for("react.consumer"),ay=Symbol.for("react.context"),dy=Symbol.for("react.forward_ref"),iy=Symbol.for("react.suspense"),uy=Symbol.for("react.memo"),Bh=Symbol.for("react.lazy"),oy=Symbol.for("react.activity"),kc=Symbol.iterator;function sy(n){return n===null||typeof n!="object"?null:(n=kc&&n[kc]||n["@@iterator"],typeof n=="function"?n:null)}var Hh={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},jh=Object.assign,Lh={};function Dr(n,t,e){this.props=n,this.context=t,this.refs=Lh,this.updater=e||Hh}Dr.prototype.isReactComponent={};Dr.prototype.setState=function(n,t){if(typeof n!="object"&&typeof n!="function"&&n!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,n,t,"setState")};Dr.prototype.forceUpdate=function(n){this.updater.enqueueForceUpdate(this,n,"forceUpdate")};function Yh(){}Yh.prototype=Dr.prototype;function is(n,t,e){this.props=n,this.context=t,this.refs=Lh,this.updater=e||Hh}var us=is.prototype=new Yh;us.constructor=is;jh(us,Dr.prototype);us.isPureReactComponent=!0;var Uc=Array.isArray;function Ku(){}var at={H:null,A:null,T:null,S:null},Xh=Object.prototype.hasOwnProperty;function os(n,t,e){var l=e.ref;return{$$typeof:ds,type:n,key:t,ref:l!==void 0?l:null,props:e}}function cy(n,t){return os(n.type,t,n.props)}function ss(n){return typeof n=="object"&&n!==null&&n.$$typeof===ds}function fy(n){var t={"=":"=0",":":"=2"};return"$"+n.replace(/[=:]/g,function(e){return t[e]})}var Nc=/\/+/g;function Ii(n,t){return typeof n=="object"&&n!==null&&n.key!=null?fy(""+n.key):t.toString(36)}function hy(n){switch(n.status){case"fulfilled":return n.value;case"rejected":throw n.reason;default:switch(typeof n.status=="string"?n.then(Ku,Ku):(n.status="pending",n.then(function(t){n.status==="pending"&&(n.status="fulfilled",n.value=t)},function(t){n.status==="pending"&&(n.status="rejected",n.reason=t)})),n.status){case"fulfilled":return n.value;case"rejected":throw n.reason}}throw n}function jl(n,t,e,l,r){var a=typeof n;(a==="undefined"||a==="boolean")&&(n=null);var d=!1;if(n===null)d=!0;else switch(a){case"bigint":case"string":case"number":d=!0;break;case"object":switch(n.$$typeof){case ds:case ty:d=!0;break;case Bh:return d=n._init,jl(d(n._payload),t,e,l,r)}}if(d)return r=r(n),d=l===""?"."+Ii(n,0):l,Uc(r)?(e="",d!=null&&(e=d.replace(Nc,"$&/")+"/"),jl(r,t,e,"",function(o){return o})):r!=null&&(ss(r)&&(r=cy(r,e+(r.key==null||n&&n.key===r.key?"":(""+r.key).replace(Nc,"$&/")+"/")+d)),t.push(r)),1;d=0;var i=l===""?".":l+":";if(Uc(n))for(var u=0;u<n.length;u++)l=n[u],a=i+Ii(l,u),d+=jl(l,t,e,a,r);else if(u=sy(n),typeof u=="function")for(n=u.call(n),u=0;!(l=n.next()).done;)l=l.value,a=i+Ii(l,u++),d+=jl(l,t,e,a,r);else if(a==="object"){if(typeof n.then=="function")return jl(hy(n),t,e,l,r);throw t=String(n),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(n).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return d}function ad(n,t,e){if(n==null)return n;var l=[],r=0;return jl(n,l,"","",function(a){return t.call(e,a,r++)}),l}function py(n){if(n._status===-1){var t=n._result;t=t(),t.then(function(e){(n._status===0||n._status===-1)&&(n._status=1,n._result=e)},function(e){(n._status===0||n._status===-1)&&(n._status=2,n._result=e)}),n._status===-1&&(n._status=0,n._result=t)}if(n._status===1)return n._result.default;throw n._result}var wc=typeof reportError=="function"?reportError:function(n){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof n=="object"&&n!==null&&typeof n.message=="string"?String(n.message):String(n),error:n});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",n);return}console.error(n)},gy={map:ad,forEach:function(n,t,e){ad(n,function(){t.apply(this,arguments)},e)},count:function(n){var t=0;return ad(n,function(){t++}),t},toArray:function(n){return ad(n,function(t){return t})||[]},only:function(n){if(!ss(n))throw Error("React.Children.only expected to receive a single React element child.");return n}};U.Activity=oy;U.Children=gy;U.Component=Dr;U.Fragment=ny;U.Profiler=ly;U.PureComponent=is;U.StrictMode=ey;U.Suspense=iy;U.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=at;U.__COMPILER_RUNTIME={__proto__:null,c:function(n){return at.H.useMemoCache(n)}};U.cache=function(n){return function(){return n.apply(null,arguments)}};U.cacheSignal=function(){return null};U.cloneElement=function(n,t,e){if(n==null)throw Error("The argument must be a React element, but you passed "+n+".");var l=jh({},n.props),r=n.key;if(t!=null)for(a in t.key!==void 0&&(r=""+t.key),t)!Xh.call(t,a)||a==="key"||a==="__self"||a==="__source"||a==="ref"&&t.ref===void 0||(l[a]=t[a]);var a=arguments.length-2;if(a===1)l.children=e;else if(1<a){for(var d=Array(a),i=0;i<a;i++)d[i]=arguments[i+2];l.children=d}return os(n.type,r,l)};U.createContext=function(n){return n={$$typeof:ay,_currentValue:n,_currentValue2:n,_threadCount:0,Provider:null,Consumer:null},n.Provider=n,n.Consumer={$$typeof:ry,_context:n},n};U.createElement=function(n,t,e){var l,r={},a=null;if(t!=null)for(l in t.key!==void 0&&(a=""+t.key),t)Xh.call(t,l)&&l!=="key"&&l!=="__self"&&l!=="__source"&&(r[l]=t[l]);var d=arguments.length-2;if(d===1)r.children=e;else if(1<d){for(var i=Array(d),u=0;u<d;u++)i[u]=arguments[u+2];r.children=i}if(n&&n.defaultProps)for(l in d=n.defaultProps,d)r[l]===void 0&&(r[l]=d[l]);return os(n,a,r)};U.createRef=function(){return{current:null}};U.forwardRef=function(n){return{$$typeof:dy,render:n}};U.isValidElement=ss;U.lazy=function(n){return{$$typeof:Bh,_payload:{_status:-1,_result:n},_init:py}};U.memo=function(n,t){return{$$typeof:uy,type:n,compare:t===void 0?null:t}};U.startTransition=function(n){var t=at.T,e={};at.T=e;try{var l=n(),r=at.S;r!==null&&r(e,l),typeof l=="object"&&l!==null&&typeof l.then=="function"&&l.then(Ku,wc)}catch(a){wc(a)}finally{t!==null&&e.types!==null&&(t.types=e.types),at.T=t}};U.unstable_useCacheRefresh=function(){return at.H.useCacheRefresh()};U.use=function(n){return at.H.use(n)};U.useActionState=function(n,t,e){return at.H.useActionState(n,t,e)};U.useCallback=function(n,t){return at.H.useCallback(n,t)};U.useContext=function(n){return at.H.useContext(n)};U.useDebugValue=function(){};U.useDeferredValue=function(n,t){return at.H.useDeferredValue(n,t)};U.useEffect=function(n,t){return at.H.useEffect(n,t)};U.useEffectEvent=function(n){return at.H.useEffectEvent(n)};U.useId=function(){return at.H.useId()};U.useImperativeHandle=function(n,t,e){return at.H.useImperativeHandle(n,t,e)};U.useInsertionEffect=function(n,t){return at.H.useInsertionEffect(n,t)};U.useLayoutEffect=function(n,t){return at.H.useLayoutEffect(n,t)};U.useMemo=function(n,t){return at.H.useMemo(n,t)};U.useOptimistic=function(n,t){return at.H.useOptimistic(n,t)};U.useReducer=function(n,t,e){return at.H.useReducer(n,t,e)};U.useRef=function(n){return at.H.useRef(n)};U.useState=function(n){return at.H.useState(n)};U.useSyncExternalStore=function(n,t,e){return at.H.useSyncExternalStore(n,t,e)};U.useTransition=function(){return at.H.useTransition()};U.version="19.2.6";wh.exports=U;var T=wh.exports;const Gh=kh(T);var Qh={exports:{}},Oi={},Vh={exports:{}},Zh={};/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(n){function t(O,M){var C=O.length;O.push(M);t:for(;0<C;){var $=C-1>>>1,it=O[$];if(0<r(it,M))O[$]=M,O[C]=it,C=$;else break t}}function e(O){return O.length===0?null:O[0]}function l(O){if(O.length===0)return null;var M=O[0],C=O.pop();if(C!==M){O[0]=C;t:for(var $=0,it=O.length,Xn=it>>>1;$<Xn;){var Sn=2*($+1)-1,Nl=O[Sn],Mt=Sn+1,qn=O[Mt];if(0>r(Nl,C))Mt<it&&0>r(qn,Nl)?(O[$]=qn,O[Mt]=C,$=Mt):(O[$]=Nl,O[Sn]=C,$=Sn);else if(Mt<it&&0>r(qn,C))O[$]=qn,O[Mt]=C,$=Mt;else break t}}return M}function r(O,M){var C=O.sortIndex-M.sortIndex;return C!==0?C:O.id-M.id}if(n.unstable_now=void 0,typeof performance=="object"&&typeof performance.now=="function"){var a=performance;n.unstable_now=function(){return a.now()}}else{var d=Date,i=d.now();n.unstable_now=function(){return d.now()-i}}var u=[],o=[],s=1,c=null,f=3,h=!1,b=!1,m=!1,v=!1,g=typeof setTimeout=="function"?setTimeout:null,p=typeof clearTimeout=="function"?clearTimeout:null,y=typeof setImmediate<"u"?setImmediate:null;function _(O){for(var M=e(o);M!==null;){if(M.callback===null)l(o);else if(M.startTime<=O)l(o),M.sortIndex=M.expirationTime,t(u,M);else break;M=e(o)}}function S(O){if(m=!1,_(O),!b)if(e(u)!==null)b=!0,A||(A=!0,X());else{var M=e(o);M!==null&&G(S,M.startTime-O)}}var A=!1,q=-1,E=5,x=-1;function R(){return v?!0:!(n.unstable_now()-x<E)}function H(){if(v=!1,A){var O=n.unstable_now();x=O;var M=!0;try{t:{b=!1,m&&(m=!1,p(q),q=-1),h=!0;var C=f;try{n:{for(_(O),c=e(u);c!==null&&!(c.expirationTime>O&&R());){var $=c.callback;if(typeof $=="function"){c.callback=null,f=c.priorityLevel;var it=$(c.expirationTime<=O);if(O=n.unstable_now(),typeof it=="function"){c.callback=it,_(O),M=!0;break n}c===e(u)&&l(u),_(O)}else l(u);c=e(u)}if(c!==null)M=!0;else{var Xn=e(o);Xn!==null&&G(S,Xn.startTime-O),M=!1}}break t}finally{c=null,f=C,h=!1}M=void 0}}finally{M?X():A=!1}}}var X;if(typeof y=="function")X=function(){y(H)};else if(typeof MessageChannel<"u"){var Z=new MessageChannel,P=Z.port2;Z.port1.onmessage=H,X=function(){P.postMessage(null)}}else X=function(){g(H,0)};function G(O,M){q=g(function(){O(n.unstable_now())},M)}n.unstable_IdlePriority=5,n.unstable_ImmediatePriority=1,n.unstable_LowPriority=4,n.unstable_NormalPriority=3,n.unstable_Profiling=null,n.unstable_UserBlockingPriority=2,n.unstable_cancelCallback=function(O){O.callback=null},n.unstable_forceFrameRate=function(O){0>O||125<O?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):E=0<O?Math.floor(1e3/O):5},n.unstable_getCurrentPriorityLevel=function(){return f},n.unstable_next=function(O){switch(f){case 1:case 2:case 3:var M=3;break;default:M=f}var C=f;f=M;try{return O()}finally{f=C}},n.unstable_requestPaint=function(){v=!0},n.unstable_runWithPriority=function(O,M){switch(O){case 1:case 2:case 3:case 4:case 5:break;default:O=3}var C=f;f=O;try{return M()}finally{f=C}},n.unstable_scheduleCallback=function(O,M,C){var $=n.unstable_now();switch(typeof C=="object"&&C!==null?(C=C.delay,C=typeof C=="number"&&0<C?$+C:$):C=$,O){case 1:var it=-1;break;case 2:it=250;break;case 5:it=1073741823;break;case 4:it=1e4;break;default:it=5e3}return it=C+it,O={id:s++,callback:M,priorityLevel:O,startTime:C,expirationTime:it,sortIndex:-1},C>$?(O.sortIndex=C,t(o,O),e(u)===null&&O===e(o)&&(m?(p(q),q=-1):m=!0,G(S,C-$))):(O.sortIndex=it,t(u,O),b||h||(b=!0,A||(A=!0,X()))),O},n.unstable_shouldYield=R,n.unstable_wrapCallback=function(O){var M=f;return function(){var C=f;f=M;try{return O.apply(this,arguments)}finally{f=C}}}})(Zh);Vh.exports=Zh;var my=Vh.exports,Kh={exports:{}},Xt={};/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var yy=T;function Jh(n){var t="https://react.dev/errors/"+n;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var e=2;e<arguments.length;e++)t+="&args[]="+encodeURIComponent(arguments[e])}return"Minified React error #"+n+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function xe(){}var Yt={d:{f:xe,r:function(){throw Error(Jh(522))},D:xe,C:xe,L:xe,m:xe,X:xe,S:xe,M:xe},p:0,findDOMNode:null},by=Symbol.for("react.portal");function _y(n,t,e){var l=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:by,key:l==null?null:""+l,children:n,containerInfo:t,implementation:e}}var ea=yy.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Ri(n,t){if(n==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}Xt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Yt;Xt.createPortal=function(n,t){var e=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(Jh(299));return _y(n,t,null,e)};Xt.flushSync=function(n){var t=ea.T,e=Yt.p;try{if(ea.T=null,Yt.p=2,n)return n()}finally{ea.T=t,Yt.p=e,Yt.d.f()}};Xt.preconnect=function(n,t){typeof n=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,Yt.d.C(n,t))};Xt.prefetchDNS=function(n){typeof n=="string"&&Yt.d.D(n)};Xt.preinit=function(n,t){if(typeof n=="string"&&t&&typeof t.as=="string"){var e=t.as,l=Ri(e,t.crossOrigin),r=typeof t.integrity=="string"?t.integrity:void 0,a=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;e==="style"?Yt.d.S(n,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:l,integrity:r,fetchPriority:a}):e==="script"&&Yt.d.X(n,{crossOrigin:l,integrity:r,fetchPriority:a,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};Xt.preinitModule=function(n,t){if(typeof n=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var e=Ri(t.as,t.crossOrigin);Yt.d.M(n,{crossOrigin:e,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0})}}else t==null&&Yt.d.M(n)};Xt.preload=function(n,t){if(typeof n=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var e=t.as,l=Ri(e,t.crossOrigin);Yt.d.L(n,e,{crossOrigin:l,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};Xt.preloadModule=function(n,t){if(typeof n=="string")if(t){var e=Ri(t.as,t.crossOrigin);Yt.d.m(n,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:e,integrity:typeof t.integrity=="string"?t.integrity:void 0})}else Yt.d.m(n)};Xt.requestFormReset=function(n){Yt.d.r(n)};Xt.unstable_batchedUpdates=function(n,t){return n(t)};Xt.useFormState=function(n,t,e){return ea.H.useFormState(n,t,e)};Xt.useFormStatus=function(){return ea.H.useHostTransitionStatus()};Xt.version="19.2.6";function $h(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE($h)}catch(n){console.error(n)}}$h(),Kh.exports=Xt;var vy=Kh.exports;/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var zt=my,Wh=T,Sy=vy;function z(n){var t="https://react.dev/errors/"+n;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var e=2;e<arguments.length;e++)t+="&args[]="+encodeURIComponent(arguments[e])}return"Minified React error #"+n+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Fh(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11)}function Qa(n){var t=n,e=n;if(n.alternate)for(;t.return;)t=t.return;else{n=t;do t=n,t.flags&4098&&(e=t.return),n=t.return;while(n)}return t.tag===3?e:null}function Ph(n){if(n.tag===13){var t=n.memoizedState;if(t===null&&(n=n.alternate,n!==null&&(t=n.memoizedState)),t!==null)return t.dehydrated}return null}function Ih(n){if(n.tag===31){var t=n.memoizedState;if(t===null&&(n=n.alternate,n!==null&&(t=n.memoizedState)),t!==null)return t.dehydrated}return null}function Bc(n){if(Qa(n)!==n)throw Error(z(188))}function qy(n){var t=n.alternate;if(!t){if(t=Qa(n),t===null)throw Error(z(188));return t!==n?null:n}for(var e=n,l=t;;){var r=e.return;if(r===null)break;var a=r.alternate;if(a===null){if(l=r.return,l!==null){e=l;continue}break}if(r.child===a.child){for(a=r.child;a;){if(a===e)return Bc(r),n;if(a===l)return Bc(r),t;a=a.sibling}throw Error(z(188))}if(e.return!==l.return)e=r,l=a;else{for(var d=!1,i=r.child;i;){if(i===e){d=!0,e=r,l=a;break}if(i===l){d=!0,l=r,e=a;break}i=i.sibling}if(!d){for(i=a.child;i;){if(i===e){d=!0,e=a,l=r;break}if(i===l){d=!0,l=a,e=r;break}i=i.sibling}if(!d)throw Error(z(189))}}if(e.alternate!==l)throw Error(z(190))}if(e.tag!==3)throw Error(z(188));return e.stateNode.current===e?n:t}function tp(n){var t=n.tag;if(t===5||t===26||t===27||t===6)return n;for(n=n.child;n!==null;){if(t=tp(n),t!==null)return t;n=n.sibling}return null}var dt=Object.assign,Ty=Symbol.for("react.element"),dd=Symbol.for("react.transitional.element"),Jr=Symbol.for("react.portal"),Xl=Symbol.for("react.fragment"),np=Symbol.for("react.strict_mode"),Ju=Symbol.for("react.profiler"),ep=Symbol.for("react.consumer"),oe=Symbol.for("react.context"),cs=Symbol.for("react.forward_ref"),$u=Symbol.for("react.suspense"),Wu=Symbol.for("react.suspense_list"),fs=Symbol.for("react.memo"),Ee=Symbol.for("react.lazy"),Fu=Symbol.for("react.activity"),xy=Symbol.for("react.memo_cache_sentinel"),Hc=Symbol.iterator;function jr(n){return n===null||typeof n!="object"?null:(n=Hc&&n[Hc]||n["@@iterator"],typeof n=="function"?n:null)}var Ey=Symbol.for("react.client.reference");function Pu(n){if(n==null)return null;if(typeof n=="function")return n.$$typeof===Ey?null:n.displayName||n.name||null;if(typeof n=="string")return n;switch(n){case Xl:return"Fragment";case Ju:return"Profiler";case np:return"StrictMode";case $u:return"Suspense";case Wu:return"SuspenseList";case Fu:return"Activity"}if(typeof n=="object")switch(n.$$typeof){case Jr:return"Portal";case oe:return n.displayName||"Context";case ep:return(n._context.displayName||"Context")+".Consumer";case cs:var t=n.render;return n=n.displayName,n||(n=t.displayName||t.name||"",n=n!==""?"ForwardRef("+n+")":"ForwardRef"),n;case fs:return t=n.displayName||null,t!==null?t:Pu(n.type)||"Memo";case Ee:t=n._payload,n=n._init;try{return Pu(n(t))}catch{}}return null}var $r=Array.isArray,k=Wh.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,V=Sy.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,gl={pending:!1,data:null,method:null,action:null},Iu=[],Gl=-1;function Fn(n){return{current:n}}function Ot(n){0>Gl||(n.current=Iu[Gl],Iu[Gl]=null,Gl--)}function et(n,t){Gl++,Iu[Gl]=n.current,n.current=t}var $n=Fn(null),va=Fn(null),je=Fn(null),Qd=Fn(null);function Vd(n,t){switch(et(je,t),et(va,n),et($n,null),t.nodeType){case 9:case 11:n=(n=t.documentElement)&&(n=n.namespaceURI)?Vf(n):0;break;default:if(n=t.tagName,t=t.namespaceURI)t=Vf(t),n=q0(t,n);else switch(n){case"svg":n=1;break;case"math":n=2;break;default:n=0}}Ot($n),et($n,n)}function fr(){Ot($n),Ot(va),Ot(je)}function to(n){n.memoizedState!==null&&et(Qd,n);var t=$n.current,e=q0(t,n.type);t!==e&&(et(va,n),et($n,e))}function Zd(n){va.current===n&&(Ot($n),Ot(va)),Qd.current===n&&(Ot(Qd),Ma._currentValue=gl)}var tu,jc;function ol(n){if(tu===void 0)try{throw Error()}catch(e){var t=e.stack.trim().match(/\n( *(at )?)/);tu=t&&t[1]||"",jc=-1<e.stack.indexOf(`
    at`)?" (<anonymous>)":-1<e.stack.indexOf("@")?"@unknown:0:0":""}return`
`+tu+n+jc}var nu=!1;function eu(n,t){if(!n||nu)return"";nu=!0;var e=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var l={DetermineComponentFrameRoot:function(){try{if(t){var c=function(){throw Error()};if(Object.defineProperty(c.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(c,[])}catch(h){var f=h}Reflect.construct(n,[],c)}else{try{c.call()}catch(h){f=h}n.call(c.prototype)}}else{try{throw Error()}catch(h){f=h}(c=n())&&typeof c.catch=="function"&&c.catch(function(){})}}catch(h){if(h&&f&&typeof h.stack=="string")return[h.stack,f.stack]}return[null,null]}};l.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(l.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(l.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var a=l.DetermineComponentFrameRoot(),d=a[0],i=a[1];if(d&&i){var u=d.split(`
`),o=i.split(`
`);for(r=l=0;l<u.length&&!u[l].includes("DetermineComponentFrameRoot");)l++;for(;r<o.length&&!o[r].includes("DetermineComponentFrameRoot");)r++;if(l===u.length||r===o.length)for(l=u.length-1,r=o.length-1;1<=l&&0<=r&&u[l]!==o[r];)r--;for(;1<=l&&0<=r;l--,r--)if(u[l]!==o[r]){if(l!==1||r!==1)do if(l--,r--,0>r||u[l]!==o[r]){var s=`
`+u[l].replace(" at new "," at ");return n.displayName&&s.includes("<anonymous>")&&(s=s.replace("<anonymous>",n.displayName)),s}while(1<=l&&0<=r);break}}}finally{nu=!1,Error.prepareStackTrace=e}return(e=n?n.displayName||n.name:"")?ol(e):""}function zy(n,t){switch(n.tag){case 26:case 27:case 5:return ol(n.type);case 16:return ol("Lazy");case 13:return n.child!==t&&t!==null?ol("Suspense Fallback"):ol("Suspense");case 19:return ol("SuspenseList");case 0:case 15:return eu(n.type,!1);case 11:return eu(n.type.render,!1);case 1:return eu(n.type,!0);case 31:return ol("Activity");default:return""}}function Lc(n){try{var t="",e=null;do t+=zy(n,e),e=n,n=n.return;while(n);return t}catch(l){return`
Error generating stack: `+l.message+`
`+l.stack}}var no=Object.prototype.hasOwnProperty,hs=zt.unstable_scheduleCallback,lu=zt.unstable_cancelCallback,Ay=zt.unstable_shouldYield,Dy=zt.unstable_requestPaint,cn=zt.unstable_now,Oy=zt.unstable_getCurrentPriorityLevel,lp=zt.unstable_ImmediatePriority,rp=zt.unstable_UserBlockingPriority,Kd=zt.unstable_NormalPriority,Ry=zt.unstable_LowPriority,ap=zt.unstable_IdlePriority,My=zt.log,Cy=zt.unstable_setDisableYieldValue,Va=null,fn=null;function Me(n){if(typeof My=="function"&&Cy(n),fn&&typeof fn.setStrictMode=="function")try{fn.setStrictMode(Va,n)}catch{}}var hn=Math.clz32?Math.clz32:Ny,ky=Math.log,Uy=Math.LN2;function Ny(n){return n>>>=0,n===0?32:31-(ky(n)/Uy|0)|0}var id=256,ud=262144,od=4194304;function sl(n){var t=n&42;if(t!==0)return t;switch(n&-n){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return n&261888;case 262144:case 524288:case 1048576:case 2097152:return n&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return n&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return n}}function Mi(n,t,e){var l=n.pendingLanes;if(l===0)return 0;var r=0,a=n.suspendedLanes,d=n.pingedLanes;n=n.warmLanes;var i=l&134217727;return i!==0?(l=i&~a,l!==0?r=sl(l):(d&=i,d!==0?r=sl(d):e||(e=i&~n,e!==0&&(r=sl(e))))):(i=l&~a,i!==0?r=sl(i):d!==0?r=sl(d):e||(e=l&~n,e!==0&&(r=sl(e)))),r===0?0:t!==0&&t!==r&&!(t&a)&&(a=r&-r,e=t&-t,a>=e||a===32&&(e&4194048)!==0)?t:r}function Za(n,t){return(n.pendingLanes&~(n.suspendedLanes&~n.pingedLanes)&t)===0}function wy(n,t){switch(n){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function dp(){var n=od;return od<<=1,!(od&62914560)&&(od=4194304),n}function ru(n){for(var t=[],e=0;31>e;e++)t.push(n);return t}function Ka(n,t){n.pendingLanes|=t,t!==268435456&&(n.suspendedLanes=0,n.pingedLanes=0,n.warmLanes=0)}function By(n,t,e,l,r,a){var d=n.pendingLanes;n.pendingLanes=e,n.suspendedLanes=0,n.pingedLanes=0,n.warmLanes=0,n.expiredLanes&=e,n.entangledLanes&=e,n.errorRecoveryDisabledLanes&=e,n.shellSuspendCounter=0;var i=n.entanglements,u=n.expirationTimes,o=n.hiddenUpdates;for(e=d&~e;0<e;){var s=31-hn(e),c=1<<s;i[s]=0,u[s]=-1;var f=o[s];if(f!==null)for(o[s]=null,s=0;s<f.length;s++){var h=f[s];h!==null&&(h.lane&=-536870913)}e&=~c}l!==0&&ip(n,l,0),a!==0&&r===0&&n.tag!==0&&(n.suspendedLanes|=a&~(d&~t))}function ip(n,t,e){n.pendingLanes|=t,n.suspendedLanes&=~t;var l=31-hn(t);n.entangledLanes|=t,n.entanglements[l]=n.entanglements[l]|1073741824|e&261930}function up(n,t){var e=n.entangledLanes|=t;for(n=n.entanglements;e;){var l=31-hn(e),r=1<<l;r&t|n[l]&t&&(n[l]|=t),e&=~r}}function op(n,t){var e=t&-t;return e=e&42?1:ps(e),e&(n.suspendedLanes|t)?0:e}function ps(n){switch(n){case 2:n=1;break;case 8:n=4;break;case 32:n=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:n=128;break;case 268435456:n=134217728;break;default:n=0}return n}function gs(n){return n&=-n,2<n?8<n?n&134217727?32:268435456:8:2}function sp(){var n=V.p;return n!==0?n:(n=window.event,n===void 0?32:k0(n.type))}function Yc(n,t){var e=V.p;try{return V.p=n,t()}finally{V.p=e}}var ll=Math.random().toString(36).slice(2),kt="__reactFiber$"+ll,It="__reactProps$"+ll,Or="__reactContainer$"+ll,eo="__reactEvents$"+ll,Hy="__reactListeners$"+ll,jy="__reactHandles$"+ll,Xc="__reactResources$"+ll,Ja="__reactMarker$"+ll;function ms(n){delete n[kt],delete n[It],delete n[eo],delete n[Hy],delete n[jy]}function Ql(n){var t=n[kt];if(t)return t;for(var e=n.parentNode;e;){if(t=e[Or]||e[kt]){if(e=t.alternate,t.child!==null||e!==null&&e.child!==null)for(n=Wf(n);n!==null;){if(e=n[kt])return e;n=Wf(n)}return t}n=e,e=n.parentNode}return null}function Rr(n){if(n=n[kt]||n[Or]){var t=n.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return n}return null}function Wr(n){var t=n.tag;if(t===5||t===26||t===27||t===6)return n.stateNode;throw Error(z(33))}function er(n){var t=n[Xc];return t||(t=n[Xc]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function Dt(n){n[Ja]=!0}var cp=new Set,fp={};function Ol(n,t){hr(n,t),hr(n+"Capture",t)}function hr(n,t){for(fp[n]=t,n=0;n<t.length;n++)cp.add(t[n])}var Ly=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Gc={},Qc={};function Yy(n){return no.call(Qc,n)?!0:no.call(Gc,n)?!1:Ly.test(n)?Qc[n]=!0:(Gc[n]=!0,!1)}function Td(n,t,e){if(Yy(t))if(e===null)n.removeAttribute(t);else{switch(typeof e){case"undefined":case"function":case"symbol":n.removeAttribute(t);return;case"boolean":var l=t.toLowerCase().slice(0,5);if(l!=="data-"&&l!=="aria-"){n.removeAttribute(t);return}}n.setAttribute(t,""+e)}}function sd(n,t,e){if(e===null)n.removeAttribute(t);else{switch(typeof e){case"undefined":case"function":case"symbol":case"boolean":n.removeAttribute(t);return}n.setAttribute(t,""+e)}}function te(n,t,e,l){if(l===null)n.removeAttribute(e);else{switch(typeof l){case"undefined":case"function":case"symbol":case"boolean":n.removeAttribute(e);return}n.setAttributeNS(t,e,""+l)}}function En(n){switch(typeof n){case"bigint":case"boolean":case"number":case"string":case"undefined":return n;case"object":return n;default:return""}}function hp(n){var t=n.type;return(n=n.nodeName)&&n.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function Xy(n,t,e){var l=Object.getOwnPropertyDescriptor(n.constructor.prototype,t);if(!n.hasOwnProperty(t)&&typeof l<"u"&&typeof l.get=="function"&&typeof l.set=="function"){var r=l.get,a=l.set;return Object.defineProperty(n,t,{configurable:!0,get:function(){return r.call(this)},set:function(d){e=""+d,a.call(this,d)}}),Object.defineProperty(n,t,{enumerable:l.enumerable}),{getValue:function(){return e},setValue:function(d){e=""+d},stopTracking:function(){n._valueTracker=null,delete n[t]}}}}function lo(n){if(!n._valueTracker){var t=hp(n)?"checked":"value";n._valueTracker=Xy(n,t,""+n[t])}}function pp(n){if(!n)return!1;var t=n._valueTracker;if(!t)return!0;var e=t.getValue(),l="";return n&&(l=hp(n)?n.checked?"true":"false":n.value),n=l,n!==e?(t.setValue(n),!0):!1}function Jd(n){if(n=n||(typeof document<"u"?document:void 0),typeof n>"u")return null;try{return n.activeElement||n.body}catch{return n.body}}var Gy=/[\n"\\]/g;function Dn(n){return n.replace(Gy,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function ro(n,t,e,l,r,a,d,i){n.name="",d!=null&&typeof d!="function"&&typeof d!="symbol"&&typeof d!="boolean"?n.type=d:n.removeAttribute("type"),t!=null?d==="number"?(t===0&&n.value===""||n.value!=t)&&(n.value=""+En(t)):n.value!==""+En(t)&&(n.value=""+En(t)):d!=="submit"&&d!=="reset"||n.removeAttribute("value"),t!=null?ao(n,d,En(t)):e!=null?ao(n,d,En(e)):l!=null&&n.removeAttribute("value"),r==null&&a!=null&&(n.defaultChecked=!!a),r!=null&&(n.checked=r&&typeof r!="function"&&typeof r!="symbol"),i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"?n.name=""+En(i):n.removeAttribute("name")}function gp(n,t,e,l,r,a,d,i){if(a!=null&&typeof a!="function"&&typeof a!="symbol"&&typeof a!="boolean"&&(n.type=a),t!=null||e!=null){if(!(a!=="submit"&&a!=="reset"||t!=null)){lo(n);return}e=e!=null?""+En(e):"",t=t!=null?""+En(t):e,i||t===n.value||(n.value=t),n.defaultValue=t}l=l??r,l=typeof l!="function"&&typeof l!="symbol"&&!!l,n.checked=i?n.checked:!!l,n.defaultChecked=!!l,d!=null&&typeof d!="function"&&typeof d!="symbol"&&typeof d!="boolean"&&(n.name=d),lo(n)}function ao(n,t,e){t==="number"&&Jd(n.ownerDocument)===n||n.defaultValue===""+e||(n.defaultValue=""+e)}function lr(n,t,e,l){if(n=n.options,t){t={};for(var r=0;r<e.length;r++)t["$"+e[r]]=!0;for(e=0;e<n.length;e++)r=t.hasOwnProperty("$"+n[e].value),n[e].selected!==r&&(n[e].selected=r),r&&l&&(n[e].defaultSelected=!0)}else{for(e=""+En(e),t=null,r=0;r<n.length;r++){if(n[r].value===e){n[r].selected=!0,l&&(n[r].defaultSelected=!0);return}t!==null||n[r].disabled||(t=n[r])}t!==null&&(t.selected=!0)}}function mp(n,t,e){if(t!=null&&(t=""+En(t),t!==n.value&&(n.value=t),e==null)){n.defaultValue!==t&&(n.defaultValue=t);return}n.defaultValue=e!=null?""+En(e):""}function yp(n,t,e,l){if(t==null){if(l!=null){if(e!=null)throw Error(z(92));if($r(l)){if(1<l.length)throw Error(z(93));l=l[0]}e=l}e==null&&(e=""),t=e}e=En(t),n.defaultValue=e,l=n.textContent,l===e&&l!==""&&l!==null&&(n.value=l),lo(n)}function pr(n,t){if(t){var e=n.firstChild;if(e&&e===n.lastChild&&e.nodeType===3){e.nodeValue=t;return}}n.textContent=t}var Qy=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Vc(n,t,e){var l=t.indexOf("--")===0;e==null||typeof e=="boolean"||e===""?l?n.setProperty(t,""):t==="float"?n.cssFloat="":n[t]="":l?n.setProperty(t,e):typeof e!="number"||e===0||Qy.has(t)?t==="float"?n.cssFloat=e:n[t]=(""+e).trim():n[t]=e+"px"}function bp(n,t,e){if(t!=null&&typeof t!="object")throw Error(z(62));if(n=n.style,e!=null){for(var l in e)!e.hasOwnProperty(l)||t!=null&&t.hasOwnProperty(l)||(l.indexOf("--")===0?n.setProperty(l,""):l==="float"?n.cssFloat="":n[l]="");for(var r in t)l=t[r],t.hasOwnProperty(r)&&e[r]!==l&&Vc(n,r,l)}else for(var a in t)t.hasOwnProperty(a)&&Vc(n,a,t[a])}function ys(n){if(n.indexOf("-")===-1)return!1;switch(n){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Vy=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Zy=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function xd(n){return Zy.test(""+n)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":n}function se(){}var io=null;function bs(n){return n=n.target||n.srcElement||window,n.correspondingUseElement&&(n=n.correspondingUseElement),n.nodeType===3?n.parentNode:n}var Vl=null,rr=null;function Zc(n){var t=Rr(n);if(t&&(n=t.stateNode)){var e=n[It]||null;t:switch(n=t.stateNode,t.type){case"input":if(ro(n,e.value,e.defaultValue,e.defaultValue,e.checked,e.defaultChecked,e.type,e.name),t=e.name,e.type==="radio"&&t!=null){for(e=n;e.parentNode;)e=e.parentNode;for(e=e.querySelectorAll('input[name="'+Dn(""+t)+'"][type="radio"]'),t=0;t<e.length;t++){var l=e[t];if(l!==n&&l.form===n.form){var r=l[It]||null;if(!r)throw Error(z(90));ro(l,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(t=0;t<e.length;t++)l=e[t],l.form===n.form&&pp(l)}break t;case"textarea":mp(n,e.value,e.defaultValue);break t;case"select":t=e.value,t!=null&&lr(n,!!e.multiple,t,!1)}}}var au=!1;function _p(n,t,e){if(au)return n(t,e);au=!0;try{var l=n(t);return l}finally{if(au=!1,(Vl!==null||rr!==null)&&(Gi(),Vl&&(t=Vl,n=rr,rr=Vl=null,Zc(t),n)))for(t=0;t<n.length;t++)Zc(n[t])}}function Sa(n,t){var e=n.stateNode;if(e===null)return null;var l=e[It]||null;if(l===null)return null;e=l[t];t:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(l=!l.disabled)||(n=n.type,l=!(n==="button"||n==="input"||n==="select"||n==="textarea")),n=!l;break t;default:n=!1}if(n)return null;if(e&&typeof e!="function")throw Error(z(231,t,typeof e));return e}var ge=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),uo=!1;if(ge)try{var Lr={};Object.defineProperty(Lr,"passive",{get:function(){uo=!0}}),window.addEventListener("test",Lr,Lr),window.removeEventListener("test",Lr,Lr)}catch{uo=!1}var Ce=null,_s=null,Ed=null;function vp(){if(Ed)return Ed;var n,t=_s,e=t.length,l,r="value"in Ce?Ce.value:Ce.textContent,a=r.length;for(n=0;n<e&&t[n]===r[n];n++);var d=e-n;for(l=1;l<=d&&t[e-l]===r[a-l];l++);return Ed=r.slice(n,1<l?1-l:void 0)}function zd(n){var t=n.keyCode;return"charCode"in n?(n=n.charCode,n===0&&t===13&&(n=13)):n=t,n===10&&(n=13),32<=n||n===13?n:0}function cd(){return!0}function Kc(){return!1}function nn(n){function t(e,l,r,a,d){this._reactName=e,this._targetInst=r,this.type=l,this.nativeEvent=a,this.target=d,this.currentTarget=null;for(var i in n)n.hasOwnProperty(i)&&(e=n[i],this[i]=e?e(a):a[i]);return this.isDefaultPrevented=(a.defaultPrevented!=null?a.defaultPrevented:a.returnValue===!1)?cd:Kc,this.isPropagationStopped=Kc,this}return dt(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e&&(e.preventDefault?e.preventDefault():typeof e.returnValue!="unknown"&&(e.returnValue=!1),this.isDefaultPrevented=cd)},stopPropagation:function(){var e=this.nativeEvent;e&&(e.stopPropagation?e.stopPropagation():typeof e.cancelBubble!="unknown"&&(e.cancelBubble=!0),this.isPropagationStopped=cd)},persist:function(){},isPersistent:cd}),t}var Rl={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(n){return n.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Ci=nn(Rl),$a=dt({},Rl,{view:0,detail:0}),Ky=nn($a),du,iu,Yr,ki=dt({},$a,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:vs,button:0,buttons:0,relatedTarget:function(n){return n.relatedTarget===void 0?n.fromElement===n.srcElement?n.toElement:n.fromElement:n.relatedTarget},movementX:function(n){return"movementX"in n?n.movementX:(n!==Yr&&(Yr&&n.type==="mousemove"?(du=n.screenX-Yr.screenX,iu=n.screenY-Yr.screenY):iu=du=0,Yr=n),du)},movementY:function(n){return"movementY"in n?n.movementY:iu}}),Jc=nn(ki),Jy=dt({},ki,{dataTransfer:0}),$y=nn(Jy),Wy=dt({},$a,{relatedTarget:0}),uu=nn(Wy),Fy=dt({},Rl,{animationName:0,elapsedTime:0,pseudoElement:0}),Py=nn(Fy),Iy=dt({},Rl,{clipboardData:function(n){return"clipboardData"in n?n.clipboardData:window.clipboardData}}),tb=nn(Iy),nb=dt({},Rl,{data:0}),$c=nn(nb),eb={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},lb={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},rb={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function ab(n){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(n):(n=rb[n])?!!t[n]:!1}function vs(){return ab}var db=dt({},$a,{key:function(n){if(n.key){var t=eb[n.key]||n.key;if(t!=="Unidentified")return t}return n.type==="keypress"?(n=zd(n),n===13?"Enter":String.fromCharCode(n)):n.type==="keydown"||n.type==="keyup"?lb[n.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:vs,charCode:function(n){return n.type==="keypress"?zd(n):0},keyCode:function(n){return n.type==="keydown"||n.type==="keyup"?n.keyCode:0},which:function(n){return n.type==="keypress"?zd(n):n.type==="keydown"||n.type==="keyup"?n.keyCode:0}}),ib=nn(db),ub=dt({},ki,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Wc=nn(ub),ob=dt({},$a,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:vs}),sb=nn(ob),cb=dt({},Rl,{propertyName:0,elapsedTime:0,pseudoElement:0}),fb=nn(cb),hb=dt({},ki,{deltaX:function(n){return"deltaX"in n?n.deltaX:"wheelDeltaX"in n?-n.wheelDeltaX:0},deltaY:function(n){return"deltaY"in n?n.deltaY:"wheelDeltaY"in n?-n.wheelDeltaY:"wheelDelta"in n?-n.wheelDelta:0},deltaZ:0,deltaMode:0}),pb=nn(hb),gb=dt({},Rl,{newState:0,oldState:0}),mb=nn(gb),yb=[9,13,27,32],Ss=ge&&"CompositionEvent"in window,la=null;ge&&"documentMode"in document&&(la=document.documentMode);var bb=ge&&"TextEvent"in window&&!la,Sp=ge&&(!Ss||la&&8<la&&11>=la),Fc=" ",Pc=!1;function qp(n,t){switch(n){case"keyup":return yb.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Tp(n){return n=n.detail,typeof n=="object"&&"data"in n?n.data:null}var Zl=!1;function _b(n,t){switch(n){case"compositionend":return Tp(t);case"keypress":return t.which!==32?null:(Pc=!0,Fc);case"textInput":return n=t.data,n===Fc&&Pc?null:n;default:return null}}function vb(n,t){if(Zl)return n==="compositionend"||!Ss&&qp(n,t)?(n=vp(),Ed=_s=Ce=null,Zl=!1,n):null;switch(n){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Sp&&t.locale!=="ko"?null:t.data;default:return null}}var Sb={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Ic(n){var t=n&&n.nodeName&&n.nodeName.toLowerCase();return t==="input"?!!Sb[n.type]:t==="textarea"}function xp(n,t,e,l){Vl?rr?rr.push(l):rr=[l]:Vl=l,t=fi(t,"onChange"),0<t.length&&(e=new Ci("onChange","change",null,e,l),n.push({event:e,listeners:t}))}var ra=null,qa=null;function qb(n){_0(n,0)}function Ui(n){var t=Wr(n);if(pp(t))return n}function tf(n,t){if(n==="change")return t}var Ep=!1;if(ge){var ou;if(ge){var su="oninput"in document;if(!su){var nf=document.createElement("div");nf.setAttribute("oninput","return;"),su=typeof nf.oninput=="function"}ou=su}else ou=!1;Ep=ou&&(!document.documentMode||9<document.documentMode)}function ef(){ra&&(ra.detachEvent("onpropertychange",zp),qa=ra=null)}function zp(n){if(n.propertyName==="value"&&Ui(qa)){var t=[];xp(t,qa,n,bs(n)),_p(qb,t)}}function Tb(n,t,e){n==="focusin"?(ef(),ra=t,qa=e,ra.attachEvent("onpropertychange",zp)):n==="focusout"&&ef()}function xb(n){if(n==="selectionchange"||n==="keyup"||n==="keydown")return Ui(qa)}function Eb(n,t){if(n==="click")return Ui(t)}function zb(n,t){if(n==="input"||n==="change")return Ui(t)}function Ab(n,t){return n===t&&(n!==0||1/n===1/t)||n!==n&&t!==t}var mn=typeof Object.is=="function"?Object.is:Ab;function Ta(n,t){if(mn(n,t))return!0;if(typeof n!="object"||n===null||typeof t!="object"||t===null)return!1;var e=Object.keys(n),l=Object.keys(t);if(e.length!==l.length)return!1;for(l=0;l<e.length;l++){var r=e[l];if(!no.call(t,r)||!mn(n[r],t[r]))return!1}return!0}function lf(n){for(;n&&n.firstChild;)n=n.firstChild;return n}function rf(n,t){var e=lf(n);n=0;for(var l;e;){if(e.nodeType===3){if(l=n+e.textContent.length,n<=t&&l>=t)return{node:e,offset:t-n};n=l}t:{for(;e;){if(e.nextSibling){e=e.nextSibling;break t}e=e.parentNode}e=void 0}e=lf(e)}}function Ap(n,t){return n&&t?n===t?!0:n&&n.nodeType===3?!1:t&&t.nodeType===3?Ap(n,t.parentNode):"contains"in n?n.contains(t):n.compareDocumentPosition?!!(n.compareDocumentPosition(t)&16):!1:!1}function Dp(n){n=n!=null&&n.ownerDocument!=null&&n.ownerDocument.defaultView!=null?n.ownerDocument.defaultView:window;for(var t=Jd(n.document);t instanceof n.HTMLIFrameElement;){try{var e=typeof t.contentWindow.location.href=="string"}catch{e=!1}if(e)n=t.contentWindow;else break;t=Jd(n.document)}return t}function qs(n){var t=n&&n.nodeName&&n.nodeName.toLowerCase();return t&&(t==="input"&&(n.type==="text"||n.type==="search"||n.type==="tel"||n.type==="url"||n.type==="password")||t==="textarea"||n.contentEditable==="true")}var Db=ge&&"documentMode"in document&&11>=document.documentMode,Kl=null,oo=null,aa=null,so=!1;function af(n,t,e){var l=e.window===e?e.document:e.nodeType===9?e:e.ownerDocument;so||Kl==null||Kl!==Jd(l)||(l=Kl,"selectionStart"in l&&qs(l)?l={start:l.selectionStart,end:l.selectionEnd}:(l=(l.ownerDocument&&l.ownerDocument.defaultView||window).getSelection(),l={anchorNode:l.anchorNode,anchorOffset:l.anchorOffset,focusNode:l.focusNode,focusOffset:l.focusOffset}),aa&&Ta(aa,l)||(aa=l,l=fi(oo,"onSelect"),0<l.length&&(t=new Ci("onSelect","select",null,t,e),n.push({event:t,listeners:l}),t.target=Kl)))}function dl(n,t){var e={};return e[n.toLowerCase()]=t.toLowerCase(),e["Webkit"+n]="webkit"+t,e["Moz"+n]="moz"+t,e}var Jl={animationend:dl("Animation","AnimationEnd"),animationiteration:dl("Animation","AnimationIteration"),animationstart:dl("Animation","AnimationStart"),transitionrun:dl("Transition","TransitionRun"),transitionstart:dl("Transition","TransitionStart"),transitioncancel:dl("Transition","TransitionCancel"),transitionend:dl("Transition","TransitionEnd")},cu={},Op={};ge&&(Op=document.createElement("div").style,"AnimationEvent"in window||(delete Jl.animationend.animation,delete Jl.animationiteration.animation,delete Jl.animationstart.animation),"TransitionEvent"in window||delete Jl.transitionend.transition);function Ml(n){if(cu[n])return cu[n];if(!Jl[n])return n;var t=Jl[n],e;for(e in t)if(t.hasOwnProperty(e)&&e in Op)return cu[n]=t[e];return n}var Rp=Ml("animationend"),Mp=Ml("animationiteration"),Cp=Ml("animationstart"),Ob=Ml("transitionrun"),Rb=Ml("transitionstart"),Mb=Ml("transitioncancel"),kp=Ml("transitionend"),Up=new Map,co="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");co.push("scrollEnd");function Ln(n,t){Up.set(n,t),Ol(t,[n])}var $d=typeof reportError=="function"?reportError:function(n){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof n=="object"&&n!==null&&typeof n.message=="string"?String(n.message):String(n),error:n});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",n);return}console.error(n)},xn=[],$l=0,Ts=0;function Ni(){for(var n=$l,t=Ts=$l=0;t<n;){var e=xn[t];xn[t++]=null;var l=xn[t];xn[t++]=null;var r=xn[t];xn[t++]=null;var a=xn[t];if(xn[t++]=null,l!==null&&r!==null){var d=l.pending;d===null?r.next=r:(r.next=d.next,d.next=r),l.pending=r}a!==0&&Np(e,r,a)}}function wi(n,t,e,l){xn[$l++]=n,xn[$l++]=t,xn[$l++]=e,xn[$l++]=l,Ts|=l,n.lanes|=l,n=n.alternate,n!==null&&(n.lanes|=l)}function xs(n,t,e,l){return wi(n,t,e,l),Wd(n)}function Cl(n,t){return wi(n,null,null,t),Wd(n)}function Np(n,t,e){n.lanes|=e;var l=n.alternate;l!==null&&(l.lanes|=e);for(var r=!1,a=n.return;a!==null;)a.childLanes|=e,l=a.alternate,l!==null&&(l.childLanes|=e),a.tag===22&&(n=a.stateNode,n===null||n._visibility&1||(r=!0)),n=a,a=a.return;return n.tag===3?(a=n.stateNode,r&&t!==null&&(r=31-hn(e),n=a.hiddenUpdates,l=n[r],l===null?n[r]=[t]:l.push(t),t.lane=e|536870912),a):null}function Wd(n){if(50<pa)throw pa=0,Co=null,Error(z(185));for(var t=n.return;t!==null;)n=t,t=n.return;return n.tag===3?n.stateNode:null}var Wl={};function Cb(n,t,e,l){this.tag=n,this.key=e,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=l,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function an(n,t,e,l){return new Cb(n,t,e,l)}function Es(n){return n=n.prototype,!(!n||!n.isReactComponent)}function fe(n,t){var e=n.alternate;return e===null?(e=an(n.tag,t,n.key,n.mode),e.elementType=n.elementType,e.type=n.type,e.stateNode=n.stateNode,e.alternate=n,n.alternate=e):(e.pendingProps=t,e.type=n.type,e.flags=0,e.subtreeFlags=0,e.deletions=null),e.flags=n.flags&65011712,e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},e.sibling=n.sibling,e.index=n.index,e.ref=n.ref,e.refCleanup=n.refCleanup,e}function wp(n,t){n.flags&=65011714;var e=n.alternate;return e===null?(n.childLanes=0,n.lanes=t,n.child=null,n.subtreeFlags=0,n.memoizedProps=null,n.memoizedState=null,n.updateQueue=null,n.dependencies=null,n.stateNode=null):(n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.subtreeFlags=0,n.deletions=null,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,n.type=e.type,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),n}function Ad(n,t,e,l,r,a){var d=0;if(l=n,typeof n=="function")Es(n)&&(d=1);else if(typeof n=="string")d=B1(n,e,$n.current)?26:n==="html"||n==="head"||n==="body"?27:5;else t:switch(n){case Fu:return n=an(31,e,t,r),n.elementType=Fu,n.lanes=a,n;case Xl:return ml(e.children,r,a,t);case np:d=8,r|=24;break;case Ju:return n=an(12,e,t,r|2),n.elementType=Ju,n.lanes=a,n;case $u:return n=an(13,e,t,r),n.elementType=$u,n.lanes=a,n;case Wu:return n=an(19,e,t,r),n.elementType=Wu,n.lanes=a,n;default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case oe:d=10;break t;case ep:d=9;break t;case cs:d=11;break t;case fs:d=14;break t;case Ee:d=16,l=null;break t}d=29,e=Error(z(130,n===null?"null":typeof n,"")),l=null}return t=an(d,e,t,r),t.elementType=n,t.type=l,t.lanes=a,t}function ml(n,t,e,l){return n=an(7,n,l,t),n.lanes=e,n}function fu(n,t,e){return n=an(6,n,null,t),n.lanes=e,n}function Bp(n){var t=an(18,null,null,0);return t.stateNode=n,t}function hu(n,t,e){return t=an(4,n.children!==null?n.children:[],n.key,t),t.lanes=e,t.stateNode={containerInfo:n.containerInfo,pendingChildren:null,implementation:n.implementation},t}var df=new WeakMap;function On(n,t){if(typeof n=="object"&&n!==null){var e=df.get(n);return e!==void 0?e:(t={value:n,source:t,stack:Lc(t)},df.set(n,t),t)}return{value:n,source:t,stack:Lc(t)}}var Fl=[],Pl=0,Fd=null,xa=0,zn=[],An=0,We=null,Vn=1,Zn="";function de(n,t){Fl[Pl++]=xa,Fl[Pl++]=Fd,Fd=n,xa=t}function Hp(n,t,e){zn[An++]=Vn,zn[An++]=Zn,zn[An++]=We,We=n;var l=Vn;n=Zn;var r=32-hn(l)-1;l&=~(1<<r),e+=1;var a=32-hn(t)+r;if(30<a){var d=r-r%5;a=(l&(1<<d)-1).toString(32),l>>=d,r-=d,Vn=1<<32-hn(t)+r|e<<r|l,Zn=a+n}else Vn=1<<a|e<<r|l,Zn=n}function zs(n){n.return!==null&&(de(n,1),Hp(n,1,0))}function As(n){for(;n===Fd;)Fd=Fl[--Pl],Fl[Pl]=null,xa=Fl[--Pl],Fl[Pl]=null;for(;n===We;)We=zn[--An],zn[An]=null,Zn=zn[--An],zn[An]=null,Vn=zn[--An],zn[An]=null}function jp(n,t){zn[An++]=Vn,zn[An++]=Zn,zn[An++]=We,Vn=t.id,Zn=t.overflow,We=n}var Ut=null,rt=null,L=!1,Le=null,Rn=!1,fo=Error(z(519));function Fe(n){var t=Error(z(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Ea(On(t,n)),fo}function uf(n){var t=n.stateNode,e=n.type,l=n.memoizedProps;switch(t[kt]=n,t[It]=l,e){case"dialog":w("cancel",t),w("close",t);break;case"iframe":case"object":case"embed":w("load",t);break;case"video":case"audio":for(e=0;e<Oa.length;e++)w(Oa[e],t);break;case"source":w("error",t);break;case"img":case"image":case"link":w("error",t),w("load",t);break;case"details":w("toggle",t);break;case"input":w("invalid",t),gp(t,l.value,l.defaultValue,l.checked,l.defaultChecked,l.type,l.name,!0);break;case"select":w("invalid",t);break;case"textarea":w("invalid",t),yp(t,l.value,l.defaultValue,l.children)}e=l.children,typeof e!="string"&&typeof e!="number"&&typeof e!="bigint"||t.textContent===""+e||l.suppressHydrationWarning===!0||S0(t.textContent,e)?(l.popover!=null&&(w("beforetoggle",t),w("toggle",t)),l.onScroll!=null&&w("scroll",t),l.onScrollEnd!=null&&w("scrollend",t),l.onClick!=null&&(t.onclick=se),t=!0):t=!1,t||Fe(n,!0)}function of(n){for(Ut=n.return;Ut;)switch(Ut.tag){case 5:case 31:case 13:Rn=!1;return;case 27:case 3:Rn=!0;return;default:Ut=Ut.return}}function wl(n){if(n!==Ut)return!1;if(!L)return of(n),L=!0,!1;var t=n.tag,e;if((e=t!==3&&t!==27)&&((e=t===5)&&(e=n.type,e=!(e!=="form"&&e!=="button")||Bo(n.type,n.memoizedProps)),e=!e),e&&rt&&Fe(n),of(n),t===13){if(n=n.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(z(317));rt=$f(n)}else if(t===31){if(n=n.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(z(317));rt=$f(n)}else t===27?(t=rt,rl(n.type)?(n=Yo,Yo=null,rt=n):rt=t):rt=Ut?Un(n.stateNode.nextSibling):null;return!0}function xl(){rt=Ut=null,L=!1}function pu(){var n=Le;return n!==null&&(Zt===null?Zt=n:Zt.push.apply(Zt,n),Le=null),n}function Ea(n){Le===null?Le=[n]:Le.push(n)}var ho=Fn(null),kl=null,ce=null;function Ae(n,t,e){et(ho,t._currentValue),t._currentValue=e}function he(n){n._currentValue=ho.current,Ot(ho)}function po(n,t,e){for(;n!==null;){var l=n.alternate;if((n.childLanes&t)!==t?(n.childLanes|=t,l!==null&&(l.childLanes|=t)):l!==null&&(l.childLanes&t)!==t&&(l.childLanes|=t),n===e)break;n=n.return}}function go(n,t,e,l){var r=n.child;for(r!==null&&(r.return=n);r!==null;){var a=r.dependencies;if(a!==null){var d=r.child;a=a.firstContext;t:for(;a!==null;){var i=a;a=r;for(var u=0;u<t.length;u++)if(i.context===t[u]){a.lanes|=e,i=a.alternate,i!==null&&(i.lanes|=e),po(a.return,e,n),l||(d=null);break t}a=i.next}}else if(r.tag===18){if(d=r.return,d===null)throw Error(z(341));d.lanes|=e,a=d.alternate,a!==null&&(a.lanes|=e),po(d,e,n),d=null}else d=r.child;if(d!==null)d.return=r;else for(d=r;d!==null;){if(d===n){d=null;break}if(r=d.sibling,r!==null){r.return=d.return,d=r;break}d=d.return}r=d}}function Mr(n,t,e,l){n=null;for(var r=t,a=!1;r!==null;){if(!a){if(r.flags&524288)a=!0;else if(r.flags&262144)break}if(r.tag===10){var d=r.alternate;if(d===null)throw Error(z(387));if(d=d.memoizedProps,d!==null){var i=r.type;mn(r.pendingProps.value,d.value)||(n!==null?n.push(i):n=[i])}}else if(r===Qd.current){if(d=r.alternate,d===null)throw Error(z(387));d.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(n!==null?n.push(Ma):n=[Ma])}r=r.return}n!==null&&go(t,n,e,l),t.flags|=262144}function Pd(n){for(n=n.firstContext;n!==null;){if(!mn(n.context._currentValue,n.memoizedValue))return!0;n=n.next}return!1}function El(n){kl=n,ce=null,n=n.dependencies,n!==null&&(n.firstContext=null)}function Nt(n){return Lp(kl,n)}function fd(n,t){return kl===null&&El(n),Lp(n,t)}function Lp(n,t){var e=t._currentValue;if(t={context:t,memoizedValue:e,next:null},ce===null){if(n===null)throw Error(z(308));ce=t,n.dependencies={lanes:0,firstContext:t},n.flags|=524288}else ce=ce.next=t;return e}var kb=typeof AbortController<"u"?AbortController:function(){var n=[],t=this.signal={aborted:!1,addEventListener:function(e,l){n.push(l)}};this.abort=function(){t.aborted=!0,n.forEach(function(e){return e()})}},Ub=zt.unstable_scheduleCallback,Nb=zt.unstable_NormalPriority,Tt={$$typeof:oe,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Ds(){return{controller:new kb,data:new Map,refCount:0}}function Wa(n){n.refCount--,n.refCount===0&&Ub(Nb,function(){n.controller.abort()})}var da=null,mo=0,gr=0,ar=null;function wb(n,t){if(da===null){var e=da=[];mo=0,gr=Is(),ar={status:"pending",value:void 0,then:function(l){e.push(l)}}}return mo++,t.then(sf,sf),t}function sf(){if(--mo===0&&da!==null){ar!==null&&(ar.status="fulfilled");var n=da;da=null,gr=0,ar=null;for(var t=0;t<n.length;t++)(0,n[t])()}}function Bb(n,t){var e=[],l={status:"pending",value:null,reason:null,then:function(r){e.push(r)}};return n.then(function(){l.status="fulfilled",l.value=t;for(var r=0;r<e.length;r++)(0,e[r])(t)},function(r){for(l.status="rejected",l.reason=r,r=0;r<e.length;r++)(0,e[r])(void 0)}),l}var cf=k.S;k.S=function(n,t){t0=cn(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&wb(n,t),cf!==null&&cf(n,t)};var yl=Fn(null);function Os(){var n=yl.current;return n!==null?n:nt.pooledCache}function Dd(n,t){t===null?et(yl,yl.current):et(yl,t.pool)}function Yp(){var n=Os();return n===null?null:{parent:Tt._currentValue,pool:n}}var Cr=Error(z(460)),Rs=Error(z(474)),Bi=Error(z(542)),Id={then:function(){}};function ff(n){return n=n.status,n==="fulfilled"||n==="rejected"}function Xp(n,t,e){switch(e=n[e],e===void 0?n.push(t):e!==t&&(t.then(se,se),t=e),t.status){case"fulfilled":return t.value;case"rejected":throw n=t.reason,pf(n),n;default:if(typeof t.status=="string")t.then(se,se);else{if(n=nt,n!==null&&100<n.shellSuspendCounter)throw Error(z(482));n=t,n.status="pending",n.then(function(l){if(t.status==="pending"){var r=t;r.status="fulfilled",r.value=l}},function(l){if(t.status==="pending"){var r=t;r.status="rejected",r.reason=l}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw n=t.reason,pf(n),n}throw bl=t,Cr}}function cl(n){try{var t=n._init;return t(n._payload)}catch(e){throw e!==null&&typeof e=="object"&&typeof e.then=="function"?(bl=e,Cr):e}}var bl=null;function hf(){if(bl===null)throw Error(z(459));var n=bl;return bl=null,n}function pf(n){if(n===Cr||n===Bi)throw Error(z(483))}var dr=null,za=0;function hd(n){var t=za;return za+=1,dr===null&&(dr=[]),Xp(dr,n,t)}function Xr(n,t){t=t.props.ref,n.ref=t!==void 0?t:null}function pd(n,t){throw t.$$typeof===Ty?Error(z(525)):(n=Object.prototype.toString.call(t),Error(z(31,n==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":n)))}function Gp(n){function t(g,p){if(n){var y=g.deletions;y===null?(g.deletions=[p],g.flags|=16):y.push(p)}}function e(g,p){if(!n)return null;for(;p!==null;)t(g,p),p=p.sibling;return null}function l(g){for(var p=new Map;g!==null;)g.key!==null?p.set(g.key,g):p.set(g.index,g),g=g.sibling;return p}function r(g,p){return g=fe(g,p),g.index=0,g.sibling=null,g}function a(g,p,y){return g.index=y,n?(y=g.alternate,y!==null?(y=y.index,y<p?(g.flags|=67108866,p):y):(g.flags|=67108866,p)):(g.flags|=1048576,p)}function d(g){return n&&g.alternate===null&&(g.flags|=67108866),g}function i(g,p,y,_){return p===null||p.tag!==6?(p=fu(y,g.mode,_),p.return=g,p):(p=r(p,y),p.return=g,p)}function u(g,p,y,_){var S=y.type;return S===Xl?s(g,p,y.props.children,_,y.key):p!==null&&(p.elementType===S||typeof S=="object"&&S!==null&&S.$$typeof===Ee&&cl(S)===p.type)?(p=r(p,y.props),Xr(p,y),p.return=g,p):(p=Ad(y.type,y.key,y.props,null,g.mode,_),Xr(p,y),p.return=g,p)}function o(g,p,y,_){return p===null||p.tag!==4||p.stateNode.containerInfo!==y.containerInfo||p.stateNode.implementation!==y.implementation?(p=hu(y,g.mode,_),p.return=g,p):(p=r(p,y.children||[]),p.return=g,p)}function s(g,p,y,_,S){return p===null||p.tag!==7?(p=ml(y,g.mode,_,S),p.return=g,p):(p=r(p,y),p.return=g,p)}function c(g,p,y){if(typeof p=="string"&&p!==""||typeof p=="number"||typeof p=="bigint")return p=fu(""+p,g.mode,y),p.return=g,p;if(typeof p=="object"&&p!==null){switch(p.$$typeof){case dd:return y=Ad(p.type,p.key,p.props,null,g.mode,y),Xr(y,p),y.return=g,y;case Jr:return p=hu(p,g.mode,y),p.return=g,p;case Ee:return p=cl(p),c(g,p,y)}if($r(p)||jr(p))return p=ml(p,g.mode,y,null),p.return=g,p;if(typeof p.then=="function")return c(g,hd(p),y);if(p.$$typeof===oe)return c(g,fd(g,p),y);pd(g,p)}return null}function f(g,p,y,_){var S=p!==null?p.key:null;if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return S!==null?null:i(g,p,""+y,_);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case dd:return y.key===S?u(g,p,y,_):null;case Jr:return y.key===S?o(g,p,y,_):null;case Ee:return y=cl(y),f(g,p,y,_)}if($r(y)||jr(y))return S!==null?null:s(g,p,y,_,null);if(typeof y.then=="function")return f(g,p,hd(y),_);if(y.$$typeof===oe)return f(g,p,fd(g,y),_);pd(g,y)}return null}function h(g,p,y,_,S){if(typeof _=="string"&&_!==""||typeof _=="number"||typeof _=="bigint")return g=g.get(y)||null,i(p,g,""+_,S);if(typeof _=="object"&&_!==null){switch(_.$$typeof){case dd:return g=g.get(_.key===null?y:_.key)||null,u(p,g,_,S);case Jr:return g=g.get(_.key===null?y:_.key)||null,o(p,g,_,S);case Ee:return _=cl(_),h(g,p,y,_,S)}if($r(_)||jr(_))return g=g.get(y)||null,s(p,g,_,S,null);if(typeof _.then=="function")return h(g,p,y,hd(_),S);if(_.$$typeof===oe)return h(g,p,y,fd(p,_),S);pd(p,_)}return null}function b(g,p,y,_){for(var S=null,A=null,q=p,E=p=0,x=null;q!==null&&E<y.length;E++){q.index>E?(x=q,q=null):x=q.sibling;var R=f(g,q,y[E],_);if(R===null){q===null&&(q=x);break}n&&q&&R.alternate===null&&t(g,q),p=a(R,p,E),A===null?S=R:A.sibling=R,A=R,q=x}if(E===y.length)return e(g,q),L&&de(g,E),S;if(q===null){for(;E<y.length;E++)q=c(g,y[E],_),q!==null&&(p=a(q,p,E),A===null?S=q:A.sibling=q,A=q);return L&&de(g,E),S}for(q=l(q);E<y.length;E++)x=h(q,g,E,y[E],_),x!==null&&(n&&x.alternate!==null&&q.delete(x.key===null?E:x.key),p=a(x,p,E),A===null?S=x:A.sibling=x,A=x);return n&&q.forEach(function(H){return t(g,H)}),L&&de(g,E),S}function m(g,p,y,_){if(y==null)throw Error(z(151));for(var S=null,A=null,q=p,E=p=0,x=null,R=y.next();q!==null&&!R.done;E++,R=y.next()){q.index>E?(x=q,q=null):x=q.sibling;var H=f(g,q,R.value,_);if(H===null){q===null&&(q=x);break}n&&q&&H.alternate===null&&t(g,q),p=a(H,p,E),A===null?S=H:A.sibling=H,A=H,q=x}if(R.done)return e(g,q),L&&de(g,E),S;if(q===null){for(;!R.done;E++,R=y.next())R=c(g,R.value,_),R!==null&&(p=a(R,p,E),A===null?S=R:A.sibling=R,A=R);return L&&de(g,E),S}for(q=l(q);!R.done;E++,R=y.next())R=h(q,g,E,R.value,_),R!==null&&(n&&R.alternate!==null&&q.delete(R.key===null?E:R.key),p=a(R,p,E),A===null?S=R:A.sibling=R,A=R);return n&&q.forEach(function(X){return t(g,X)}),L&&de(g,E),S}function v(g,p,y,_){if(typeof y=="object"&&y!==null&&y.type===Xl&&y.key===null&&(y=y.props.children),typeof y=="object"&&y!==null){switch(y.$$typeof){case dd:t:{for(var S=y.key;p!==null;){if(p.key===S){if(S=y.type,S===Xl){if(p.tag===7){e(g,p.sibling),_=r(p,y.props.children),_.return=g,g=_;break t}}else if(p.elementType===S||typeof S=="object"&&S!==null&&S.$$typeof===Ee&&cl(S)===p.type){e(g,p.sibling),_=r(p,y.props),Xr(_,y),_.return=g,g=_;break t}e(g,p);break}else t(g,p);p=p.sibling}y.type===Xl?(_=ml(y.props.children,g.mode,_,y.key),_.return=g,g=_):(_=Ad(y.type,y.key,y.props,null,g.mode,_),Xr(_,y),_.return=g,g=_)}return d(g);case Jr:t:{for(S=y.key;p!==null;){if(p.key===S)if(p.tag===4&&p.stateNode.containerInfo===y.containerInfo&&p.stateNode.implementation===y.implementation){e(g,p.sibling),_=r(p,y.children||[]),_.return=g,g=_;break t}else{e(g,p);break}else t(g,p);p=p.sibling}_=hu(y,g.mode,_),_.return=g,g=_}return d(g);case Ee:return y=cl(y),v(g,p,y,_)}if($r(y))return b(g,p,y,_);if(jr(y)){if(S=jr(y),typeof S!="function")throw Error(z(150));return y=S.call(y),m(g,p,y,_)}if(typeof y.then=="function")return v(g,p,hd(y),_);if(y.$$typeof===oe)return v(g,p,fd(g,y),_);pd(g,y)}return typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint"?(y=""+y,p!==null&&p.tag===6?(e(g,p.sibling),_=r(p,y),_.return=g,g=_):(e(g,p),_=fu(y,g.mode,_),_.return=g,g=_),d(g)):e(g,p)}return function(g,p,y,_){try{za=0;var S=v(g,p,y,_);return dr=null,S}catch(q){if(q===Cr||q===Bi)throw q;var A=an(29,q,null,g.mode);return A.lanes=_,A.return=g,A}finally{}}}var zl=Gp(!0),Qp=Gp(!1),ze=!1;function Ms(n){n.updateQueue={baseState:n.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function yo(n,t){n=n.updateQueue,t.updateQueue===n&&(t.updateQueue={baseState:n.baseState,firstBaseUpdate:n.firstBaseUpdate,lastBaseUpdate:n.lastBaseUpdate,shared:n.shared,callbacks:null})}function Ye(n){return{lane:n,tag:0,payload:null,callback:null,next:null}}function Xe(n,t,e){var l=n.updateQueue;if(l===null)return null;if(l=l.shared,Q&2){var r=l.pending;return r===null?t.next=t:(t.next=r.next,r.next=t),l.pending=t,t=Wd(n),Np(n,null,e),t}return wi(n,l,t,e),Wd(n)}function ia(n,t,e){if(t=t.updateQueue,t!==null&&(t=t.shared,(e&4194048)!==0)){var l=t.lanes;l&=n.pendingLanes,e|=l,t.lanes=e,up(n,e)}}function gu(n,t){var e=n.updateQueue,l=n.alternate;if(l!==null&&(l=l.updateQueue,e===l)){var r=null,a=null;if(e=e.firstBaseUpdate,e!==null){do{var d={lane:e.lane,tag:e.tag,payload:e.payload,callback:null,next:null};a===null?r=a=d:a=a.next=d,e=e.next}while(e!==null);a===null?r=a=t:a=a.next=t}else r=a=t;e={baseState:l.baseState,firstBaseUpdate:r,lastBaseUpdate:a,shared:l.shared,callbacks:l.callbacks},n.updateQueue=e;return}n=e.lastBaseUpdate,n===null?e.firstBaseUpdate=t:n.next=t,e.lastBaseUpdate=t}var bo=!1;function ua(){if(bo){var n=ar;if(n!==null)throw n}}function oa(n,t,e,l){bo=!1;var r=n.updateQueue;ze=!1;var a=r.firstBaseUpdate,d=r.lastBaseUpdate,i=r.shared.pending;if(i!==null){r.shared.pending=null;var u=i,o=u.next;u.next=null,d===null?a=o:d.next=o,d=u;var s=n.alternate;s!==null&&(s=s.updateQueue,i=s.lastBaseUpdate,i!==d&&(i===null?s.firstBaseUpdate=o:i.next=o,s.lastBaseUpdate=u))}if(a!==null){var c=r.baseState;d=0,s=o=u=null,i=a;do{var f=i.lane&-536870913,h=f!==i.lane;if(h?(j&f)===f:(l&f)===f){f!==0&&f===gr&&(bo=!0),s!==null&&(s=s.next={lane:0,tag:i.tag,payload:i.payload,callback:null,next:null});t:{var b=n,m=i;f=t;var v=e;switch(m.tag){case 1:if(b=m.payload,typeof b=="function"){c=b.call(v,c,f);break t}c=b;break t;case 3:b.flags=b.flags&-65537|128;case 0:if(b=m.payload,f=typeof b=="function"?b.call(v,c,f):b,f==null)break t;c=dt({},c,f);break t;case 2:ze=!0}}f=i.callback,f!==null&&(n.flags|=64,h&&(n.flags|=8192),h=r.callbacks,h===null?r.callbacks=[f]:h.push(f))}else h={lane:f,tag:i.tag,payload:i.payload,callback:i.callback,next:null},s===null?(o=s=h,u=c):s=s.next=h,d|=f;if(i=i.next,i===null){if(i=r.shared.pending,i===null)break;h=i,i=h.next,h.next=null,r.lastBaseUpdate=h,r.shared.pending=null}}while(!0);s===null&&(u=c),r.baseState=u,r.firstBaseUpdate=o,r.lastBaseUpdate=s,a===null&&(r.shared.lanes=0),Ie|=d,n.lanes=d,n.memoizedState=c}}function Vp(n,t){if(typeof n!="function")throw Error(z(191,n));n.call(t)}function Zp(n,t){var e=n.callbacks;if(e!==null)for(n.callbacks=null,n=0;n<e.length;n++)Vp(e[n],t)}var mr=Fn(null),ti=Fn(0);function gf(n,t){n=_e,et(ti,n),et(mr,t),_e=n|t.baseLanes}function _o(){et(ti,_e),et(mr,mr.current)}function Cs(){_e=ti.current,Ot(mr),Ot(ti)}var yn=Fn(null),kn=null;function De(n){var t=n.alternate;et(bt,bt.current&1),et(yn,n),kn===null&&(t===null||mr.current!==null||t.memoizedState!==null)&&(kn=n)}function vo(n){et(bt,bt.current),et(yn,n),kn===null&&(kn=n)}function Kp(n){n.tag===22?(et(bt,bt.current),et(yn,n),kn===null&&(kn=n)):Oe()}function Oe(){et(bt,bt.current),et(yn,yn.current)}function rn(n){Ot(yn),kn===n&&(kn=null),Ot(bt)}var bt=Fn(0);function ni(n){for(var t=n;t!==null;){if(t.tag===13){var e=t.memoizedState;if(e!==null&&(e=e.dehydrated,e===null||jo(e)||Lo(e)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder==="forwards"||t.memoizedProps.revealOrder==="backwards"||t.memoizedProps.revealOrder==="unstable_legacy-backwards"||t.memoizedProps.revealOrder==="together")){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===n)break;for(;t.sibling===null;){if(t.return===null||t.return===n)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var me=0,N=null,F=null,vt=null,ei=!1,ir=!1,Al=!1,li=0,Aa=0,ur=null,Hb=0;function pt(){throw Error(z(321))}function ks(n,t){if(t===null)return!1;for(var e=0;e<t.length&&e<n.length;e++)if(!mn(n[e],t[e]))return!1;return!0}function Us(n,t,e,l,r,a){return me=a,N=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,k.H=n===null||n.memoizedState===null?xg:Vs,Al=!1,a=e(l,r),Al=!1,ir&&(a=$p(t,e,l,r)),Jp(n),a}function Jp(n){k.H=Da;var t=F!==null&&F.next!==null;if(me=0,vt=F=N=null,ei=!1,Aa=0,ur=null,t)throw Error(z(300));n===null||xt||(n=n.dependencies,n!==null&&Pd(n)&&(xt=!0))}function $p(n,t,e,l){N=n;var r=0;do{if(ir&&(ur=null),Aa=0,ir=!1,25<=r)throw Error(z(301));if(r+=1,vt=F=null,n.updateQueue!=null){var a=n.updateQueue;a.lastEffect=null,a.events=null,a.stores=null,a.memoCache!=null&&(a.memoCache.index=0)}k.H=Eg,a=t(e,l)}while(ir);return a}function jb(){var n=k.H,t=n.useState()[0];return t=typeof t.then=="function"?Fa(t):t,n=n.useState()[0],(F!==null?F.memoizedState:null)!==n&&(N.flags|=1024),t}function Ns(){var n=li!==0;return li=0,n}function ws(n,t,e){t.updateQueue=n.updateQueue,t.flags&=-2053,n.lanes&=~e}function Bs(n){if(ei){for(n=n.memoizedState;n!==null;){var t=n.queue;t!==null&&(t.pending=null),n=n.next}ei=!1}me=0,vt=F=N=null,ir=!1,Aa=li=0,ur=null}function Lt(){var n={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return vt===null?N.memoizedState=vt=n:vt=vt.next=n,vt}function _t(){if(F===null){var n=N.alternate;n=n!==null?n.memoizedState:null}else n=F.next;var t=vt===null?N.memoizedState:vt.next;if(t!==null)vt=t,F=n;else{if(n===null)throw N.alternate===null?Error(z(467)):Error(z(310));F=n,n={memoizedState:F.memoizedState,baseState:F.baseState,baseQueue:F.baseQueue,queue:F.queue,next:null},vt===null?N.memoizedState=vt=n:vt=vt.next=n}return vt}function Hi(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Fa(n){var t=Aa;return Aa+=1,ur===null&&(ur=[]),n=Xp(ur,n,t),t=N,(vt===null?t.memoizedState:vt.next)===null&&(t=t.alternate,k.H=t===null||t.memoizedState===null?xg:Vs),n}function ji(n){if(n!==null&&typeof n=="object"){if(typeof n.then=="function")return Fa(n);if(n.$$typeof===oe)return Nt(n)}throw Error(z(438,String(n)))}function Hs(n){var t=null,e=N.updateQueue;if(e!==null&&(t=e.memoCache),t==null){var l=N.alternate;l!==null&&(l=l.updateQueue,l!==null&&(l=l.memoCache,l!=null&&(t={data:l.data.map(function(r){return r.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),e===null&&(e=Hi(),N.updateQueue=e),e.memoCache=t,e=t.data[t.index],e===void 0)for(e=t.data[t.index]=Array(n),l=0;l<n;l++)e[l]=xy;return t.index++,e}function ye(n,t){return typeof t=="function"?t(n):t}function Od(n){var t=_t();return js(t,F,n)}function js(n,t,e){var l=n.queue;if(l===null)throw Error(z(311));l.lastRenderedReducer=e;var r=n.baseQueue,a=l.pending;if(a!==null){if(r!==null){var d=r.next;r.next=a.next,a.next=d}t.baseQueue=r=a,l.pending=null}if(a=n.baseState,r===null)n.memoizedState=a;else{t=r.next;var i=d=null,u=null,o=t,s=!1;do{var c=o.lane&-536870913;if(c!==o.lane?(j&c)===c:(me&c)===c){var f=o.revertLane;if(f===0)u!==null&&(u=u.next={lane:0,revertLane:0,gesture:null,action:o.action,hasEagerState:o.hasEagerState,eagerState:o.eagerState,next:null}),c===gr&&(s=!0);else if((me&f)===f){o=o.next,f===gr&&(s=!0);continue}else c={lane:0,revertLane:o.revertLane,gesture:null,action:o.action,hasEagerState:o.hasEagerState,eagerState:o.eagerState,next:null},u===null?(i=u=c,d=a):u=u.next=c,N.lanes|=f,Ie|=f;c=o.action,Al&&e(a,c),a=o.hasEagerState?o.eagerState:e(a,c)}else f={lane:c,revertLane:o.revertLane,gesture:o.gesture,action:o.action,hasEagerState:o.hasEagerState,eagerState:o.eagerState,next:null},u===null?(i=u=f,d=a):u=u.next=f,N.lanes|=c,Ie|=c;o=o.next}while(o!==null&&o!==t);if(u===null?d=a:u.next=i,!mn(a,n.memoizedState)&&(xt=!0,s&&(e=ar,e!==null)))throw e;n.memoizedState=a,n.baseState=d,n.baseQueue=u,l.lastRenderedState=a}return r===null&&(l.lanes=0),[n.memoizedState,l.dispatch]}function mu(n){var t=_t(),e=t.queue;if(e===null)throw Error(z(311));e.lastRenderedReducer=n;var l=e.dispatch,r=e.pending,a=t.memoizedState;if(r!==null){e.pending=null;var d=r=r.next;do a=n(a,d.action),d=d.next;while(d!==r);mn(a,t.memoizedState)||(xt=!0),t.memoizedState=a,t.baseQueue===null&&(t.baseState=a),e.lastRenderedState=a}return[a,l]}function Wp(n,t,e){var l=N,r=_t(),a=L;if(a){if(e===void 0)throw Error(z(407));e=e()}else e=t();var d=!mn((F||r).memoizedState,e);if(d&&(r.memoizedState=e,xt=!0),r=r.queue,Ls(Ip.bind(null,l,r,n),[n]),r.getSnapshot!==t||d||vt!==null&&vt.memoizedState.tag&1){if(l.flags|=2048,yr(9,{destroy:void 0},Pp.bind(null,l,r,e,t),null),nt===null)throw Error(z(349));a||me&127||Fp(l,t,e)}return e}function Fp(n,t,e){n.flags|=16384,n={getSnapshot:t,value:e},t=N.updateQueue,t===null?(t=Hi(),N.updateQueue=t,t.stores=[n]):(e=t.stores,e===null?t.stores=[n]:e.push(n))}function Pp(n,t,e,l){t.value=e,t.getSnapshot=l,tg(t)&&ng(n)}function Ip(n,t,e){return e(function(){tg(t)&&ng(n)})}function tg(n){var t=n.getSnapshot;n=n.value;try{var e=t();return!mn(n,e)}catch{return!0}}function ng(n){var t=Cl(n,2);t!==null&&Jt(t,n,2)}function So(n){var t=Lt();if(typeof n=="function"){var e=n;if(n=e(),Al){Me(!0);try{e()}finally{Me(!1)}}}return t.memoizedState=t.baseState=n,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:ye,lastRenderedState:n},t}function eg(n,t,e,l){return n.baseState=e,js(n,F,typeof l=="function"?l:ye)}function Lb(n,t,e,l,r){if(Yi(n))throw Error(z(485));if(n=t.action,n!==null){var a={payload:r,action:n,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(d){a.listeners.push(d)}};k.T!==null?e(!0):a.isTransition=!1,l(a),e=t.pending,e===null?(a.next=t.pending=a,lg(t,a)):(a.next=e.next,t.pending=e.next=a)}}function lg(n,t){var e=t.action,l=t.payload,r=n.state;if(t.isTransition){var a=k.T,d={};k.T=d;try{var i=e(r,l),u=k.S;u!==null&&u(d,i),mf(n,t,i)}catch(o){qo(n,t,o)}finally{a!==null&&d.types!==null&&(a.types=d.types),k.T=a}}else try{a=e(r,l),mf(n,t,a)}catch(o){qo(n,t,o)}}function mf(n,t,e){e!==null&&typeof e=="object"&&typeof e.then=="function"?e.then(function(l){yf(n,t,l)},function(l){return qo(n,t,l)}):yf(n,t,e)}function yf(n,t,e){t.status="fulfilled",t.value=e,rg(t),n.state=e,t=n.pending,t!==null&&(e=t.next,e===t?n.pending=null:(e=e.next,t.next=e,lg(n,e)))}function qo(n,t,e){var l=n.pending;if(n.pending=null,l!==null){l=l.next;do t.status="rejected",t.reason=e,rg(t),t=t.next;while(t!==l)}n.action=null}function rg(n){n=n.listeners;for(var t=0;t<n.length;t++)(0,n[t])()}function ag(n,t){return t}function bf(n,t){if(L){var e=nt.formState;if(e!==null){t:{var l=N;if(L){if(rt){n:{for(var r=rt,a=Rn;r.nodeType!==8;){if(!a){r=null;break n}if(r=Un(r.nextSibling),r===null){r=null;break n}}a=r.data,r=a==="F!"||a==="F"?r:null}if(r){rt=Un(r.nextSibling),l=r.data==="F!";break t}}Fe(l)}l=!1}l&&(t=e[0])}}return e=Lt(),e.memoizedState=e.baseState=t,l={pending:null,lanes:0,dispatch:null,lastRenderedReducer:ag,lastRenderedState:t},e.queue=l,e=Sg.bind(null,N,l),l.dispatch=e,l=So(!1),a=Qs.bind(null,N,!1,l.queue),l=Lt(),r={state:t,dispatch:null,action:n,pending:null},l.queue=r,e=Lb.bind(null,N,r,a,e),r.dispatch=e,l.memoizedState=n,[t,e,!1]}function _f(n){var t=_t();return dg(t,F,n)}function dg(n,t,e){if(t=js(n,t,ag)[0],n=Od(ye)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var l=Fa(t)}catch(d){throw d===Cr?Bi:d}else l=t;t=_t();var r=t.queue,a=r.dispatch;return e!==t.memoizedState&&(N.flags|=2048,yr(9,{destroy:void 0},Yb.bind(null,r,e),null)),[l,a,n]}function Yb(n,t){n.action=t}function vf(n){var t=_t(),e=F;if(e!==null)return dg(t,e,n);_t(),t=t.memoizedState,e=_t();var l=e.queue.dispatch;return e.memoizedState=n,[t,l,!1]}function yr(n,t,e,l){return n={tag:n,create:e,deps:l,inst:t,next:null},t=N.updateQueue,t===null&&(t=Hi(),N.updateQueue=t),e=t.lastEffect,e===null?t.lastEffect=n.next=n:(l=e.next,e.next=n,n.next=l,t.lastEffect=n),n}function ig(){return _t().memoizedState}function Rd(n,t,e,l){var r=Lt();N.flags|=n,r.memoizedState=yr(1|t,{destroy:void 0},e,l===void 0?null:l)}function Li(n,t,e,l){var r=_t();l=l===void 0?null:l;var a=r.memoizedState.inst;F!==null&&l!==null&&ks(l,F.memoizedState.deps)?r.memoizedState=yr(t,a,e,l):(N.flags|=n,r.memoizedState=yr(1|t,a,e,l))}function Sf(n,t){Rd(8390656,8,n,t)}function Ls(n,t){Li(2048,8,n,t)}function Xb(n){N.flags|=4;var t=N.updateQueue;if(t===null)t=Hi(),N.updateQueue=t,t.events=[n];else{var e=t.events;e===null?t.events=[n]:e.push(n)}}function ug(n){var t=_t().memoizedState;return Xb({ref:t,nextImpl:n}),function(){if(Q&2)throw Error(z(440));return t.impl.apply(void 0,arguments)}}function og(n,t){return Li(4,2,n,t)}function sg(n,t){return Li(4,4,n,t)}function cg(n,t){if(typeof t=="function"){n=n();var e=t(n);return function(){typeof e=="function"?e():t(null)}}if(t!=null)return n=n(),t.current=n,function(){t.current=null}}function fg(n,t,e){e=e!=null?e.concat([n]):null,Li(4,4,cg.bind(null,t,n),e)}function Ys(){}function hg(n,t){var e=_t();t=t===void 0?null:t;var l=e.memoizedState;return t!==null&&ks(t,l[1])?l[0]:(e.memoizedState=[n,t],n)}function pg(n,t){var e=_t();t=t===void 0?null:t;var l=e.memoizedState;if(t!==null&&ks(t,l[1]))return l[0];if(l=n(),Al){Me(!0);try{n()}finally{Me(!1)}}return e.memoizedState=[l,t],l}function Xs(n,t,e){return e===void 0||me&1073741824&&!(j&261930)?n.memoizedState=t:(n.memoizedState=e,n=e0(),N.lanes|=n,Ie|=n,e)}function gg(n,t,e,l){return mn(e,t)?e:mr.current!==null?(n=Xs(n,e,l),mn(n,t)||(xt=!0),n):!(me&42)||me&1073741824&&!(j&261930)?(xt=!0,n.memoizedState=e):(n=e0(),N.lanes|=n,Ie|=n,t)}function mg(n,t,e,l,r){var a=V.p;V.p=a!==0&&8>a?a:8;var d=k.T,i={};k.T=i,Qs(n,!1,t,e);try{var u=r(),o=k.S;if(o!==null&&o(i,u),u!==null&&typeof u=="object"&&typeof u.then=="function"){var s=Bb(u,l);sa(n,t,s,pn(n))}else sa(n,t,l,pn(n))}catch(c){sa(n,t,{then:function(){},status:"rejected",reason:c},pn())}finally{V.p=a,d!==null&&i.types!==null&&(d.types=i.types),k.T=d}}function Gb(){}function To(n,t,e,l){if(n.tag!==5)throw Error(z(476));var r=yg(n).queue;mg(n,r,t,gl,e===null?Gb:function(){return bg(n),e(l)})}function yg(n){var t=n.memoizedState;if(t!==null)return t;t={memoizedState:gl,baseState:gl,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:ye,lastRenderedState:gl},next:null};var e={};return t.next={memoizedState:e,baseState:e,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:ye,lastRenderedState:e},next:null},n.memoizedState=t,n=n.alternate,n!==null&&(n.memoizedState=t),t}function bg(n){var t=yg(n);t.next===null&&(t=n.alternate.memoizedState),sa(n,t.next.queue,{},pn())}function Gs(){return Nt(Ma)}function _g(){return _t().memoizedState}function vg(){return _t().memoizedState}function Qb(n){for(var t=n.return;t!==null;){switch(t.tag){case 24:case 3:var e=pn();n=Ye(e);var l=Xe(t,n,e);l!==null&&(Jt(l,t,e),ia(l,t,e)),t={cache:Ds()},n.payload=t;return}t=t.return}}function Vb(n,t,e){var l=pn();e={lane:l,revertLane:0,gesture:null,action:e,hasEagerState:!1,eagerState:null,next:null},Yi(n)?qg(t,e):(e=xs(n,t,e,l),e!==null&&(Jt(e,n,l),Tg(e,t,l)))}function Sg(n,t,e){var l=pn();sa(n,t,e,l)}function sa(n,t,e,l){var r={lane:l,revertLane:0,gesture:null,action:e,hasEagerState:!1,eagerState:null,next:null};if(Yi(n))qg(t,r);else{var a=n.alternate;if(n.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var d=t.lastRenderedState,i=a(d,e);if(r.hasEagerState=!0,r.eagerState=i,mn(i,d))return wi(n,t,r,0),nt===null&&Ni(),!1}catch{}finally{}if(e=xs(n,t,r,l),e!==null)return Jt(e,n,l),Tg(e,t,l),!0}return!1}function Qs(n,t,e,l){if(l={lane:2,revertLane:Is(),gesture:null,action:l,hasEagerState:!1,eagerState:null,next:null},Yi(n)){if(t)throw Error(z(479))}else t=xs(n,e,l,2),t!==null&&Jt(t,n,2)}function Yi(n){var t=n.alternate;return n===N||t!==null&&t===N}function qg(n,t){ir=ei=!0;var e=n.pending;e===null?t.next=t:(t.next=e.next,e.next=t),n.pending=t}function Tg(n,t,e){if(e&4194048){var l=t.lanes;l&=n.pendingLanes,e|=l,t.lanes=e,up(n,e)}}var Da={readContext:Nt,use:ji,useCallback:pt,useContext:pt,useEffect:pt,useImperativeHandle:pt,useLayoutEffect:pt,useInsertionEffect:pt,useMemo:pt,useReducer:pt,useRef:pt,useState:pt,useDebugValue:pt,useDeferredValue:pt,useTransition:pt,useSyncExternalStore:pt,useId:pt,useHostTransitionStatus:pt,useFormState:pt,useActionState:pt,useOptimistic:pt,useMemoCache:pt,useCacheRefresh:pt};Da.useEffectEvent=pt;var xg={readContext:Nt,use:ji,useCallback:function(n,t){return Lt().memoizedState=[n,t===void 0?null:t],n},useContext:Nt,useEffect:Sf,useImperativeHandle:function(n,t,e){e=e!=null?e.concat([n]):null,Rd(4194308,4,cg.bind(null,t,n),e)},useLayoutEffect:function(n,t){return Rd(4194308,4,n,t)},useInsertionEffect:function(n,t){Rd(4,2,n,t)},useMemo:function(n,t){var e=Lt();t=t===void 0?null:t;var l=n();if(Al){Me(!0);try{n()}finally{Me(!1)}}return e.memoizedState=[l,t],l},useReducer:function(n,t,e){var l=Lt();if(e!==void 0){var r=e(t);if(Al){Me(!0);try{e(t)}finally{Me(!1)}}}else r=t;return l.memoizedState=l.baseState=r,n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:n,lastRenderedState:r},l.queue=n,n=n.dispatch=Vb.bind(null,N,n),[l.memoizedState,n]},useRef:function(n){var t=Lt();return n={current:n},t.memoizedState=n},useState:function(n){n=So(n);var t=n.queue,e=Sg.bind(null,N,t);return t.dispatch=e,[n.memoizedState,e]},useDebugValue:Ys,useDeferredValue:function(n,t){var e=Lt();return Xs(e,n,t)},useTransition:function(){var n=So(!1);return n=mg.bind(null,N,n.queue,!0,!1),Lt().memoizedState=n,[!1,n]},useSyncExternalStore:function(n,t,e){var l=N,r=Lt();if(L){if(e===void 0)throw Error(z(407));e=e()}else{if(e=t(),nt===null)throw Error(z(349));j&127||Fp(l,t,e)}r.memoizedState=e;var a={value:e,getSnapshot:t};return r.queue=a,Sf(Ip.bind(null,l,a,n),[n]),l.flags|=2048,yr(9,{destroy:void 0},Pp.bind(null,l,a,e,t),null),e},useId:function(){var n=Lt(),t=nt.identifierPrefix;if(L){var e=Zn,l=Vn;e=(l&~(1<<32-hn(l)-1)).toString(32)+e,t="_"+t+"R_"+e,e=li++,0<e&&(t+="H"+e.toString(32)),t+="_"}else e=Hb++,t="_"+t+"r_"+e.toString(32)+"_";return n.memoizedState=t},useHostTransitionStatus:Gs,useFormState:bf,useActionState:bf,useOptimistic:function(n){var t=Lt();t.memoizedState=t.baseState=n;var e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=e,t=Qs.bind(null,N,!0,e),e.dispatch=t,[n,t]},useMemoCache:Hs,useCacheRefresh:function(){return Lt().memoizedState=Qb.bind(null,N)},useEffectEvent:function(n){var t=Lt(),e={impl:n};return t.memoizedState=e,function(){if(Q&2)throw Error(z(440));return e.impl.apply(void 0,arguments)}}},Vs={readContext:Nt,use:ji,useCallback:hg,useContext:Nt,useEffect:Ls,useImperativeHandle:fg,useInsertionEffect:og,useLayoutEffect:sg,useMemo:pg,useReducer:Od,useRef:ig,useState:function(){return Od(ye)},useDebugValue:Ys,useDeferredValue:function(n,t){var e=_t();return gg(e,F.memoizedState,n,t)},useTransition:function(){var n=Od(ye)[0],t=_t().memoizedState;return[typeof n=="boolean"?n:Fa(n),t]},useSyncExternalStore:Wp,useId:_g,useHostTransitionStatus:Gs,useFormState:_f,useActionState:_f,useOptimistic:function(n,t){var e=_t();return eg(e,F,n,t)},useMemoCache:Hs,useCacheRefresh:vg};Vs.useEffectEvent=ug;var Eg={readContext:Nt,use:ji,useCallback:hg,useContext:Nt,useEffect:Ls,useImperativeHandle:fg,useInsertionEffect:og,useLayoutEffect:sg,useMemo:pg,useReducer:mu,useRef:ig,useState:function(){return mu(ye)},useDebugValue:Ys,useDeferredValue:function(n,t){var e=_t();return F===null?Xs(e,n,t):gg(e,F.memoizedState,n,t)},useTransition:function(){var n=mu(ye)[0],t=_t().memoizedState;return[typeof n=="boolean"?n:Fa(n),t]},useSyncExternalStore:Wp,useId:_g,useHostTransitionStatus:Gs,useFormState:vf,useActionState:vf,useOptimistic:function(n,t){var e=_t();return F!==null?eg(e,F,n,t):(e.baseState=n,[n,e.queue.dispatch])},useMemoCache:Hs,useCacheRefresh:vg};Eg.useEffectEvent=ug;function yu(n,t,e,l){t=n.memoizedState,e=e(l,t),e=e==null?t:dt({},t,e),n.memoizedState=e,n.lanes===0&&(n.updateQueue.baseState=e)}var xo={enqueueSetState:function(n,t,e){n=n._reactInternals;var l=pn(),r=Ye(l);r.payload=t,e!=null&&(r.callback=e),t=Xe(n,r,l),t!==null&&(Jt(t,n,l),ia(t,n,l))},enqueueReplaceState:function(n,t,e){n=n._reactInternals;var l=pn(),r=Ye(l);r.tag=1,r.payload=t,e!=null&&(r.callback=e),t=Xe(n,r,l),t!==null&&(Jt(t,n,l),ia(t,n,l))},enqueueForceUpdate:function(n,t){n=n._reactInternals;var e=pn(),l=Ye(e);l.tag=2,t!=null&&(l.callback=t),t=Xe(n,l,e),t!==null&&(Jt(t,n,e),ia(t,n,e))}};function qf(n,t,e,l,r,a,d){return n=n.stateNode,typeof n.shouldComponentUpdate=="function"?n.shouldComponentUpdate(l,a,d):t.prototype&&t.prototype.isPureReactComponent?!Ta(e,l)||!Ta(r,a):!0}function Tf(n,t,e,l){n=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(e,l),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(e,l),t.state!==n&&xo.enqueueReplaceState(t,t.state,null)}function Dl(n,t){var e=t;if("ref"in t){e={};for(var l in t)l!=="ref"&&(e[l]=t[l])}if(n=n.defaultProps){e===t&&(e=dt({},e));for(var r in n)e[r]===void 0&&(e[r]=n[r])}return e}function zg(n){$d(n)}function Ag(n){console.error(n)}function Dg(n){$d(n)}function ri(n,t){try{var e=n.onUncaughtError;e(t.value,{componentStack:t.stack})}catch(l){setTimeout(function(){throw l})}}function xf(n,t,e){try{var l=n.onCaughtError;l(e.value,{componentStack:e.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function Eo(n,t,e){return e=Ye(e),e.tag=3,e.payload={element:null},e.callback=function(){ri(n,t)},e}function Og(n){return n=Ye(n),n.tag=3,n}function Rg(n,t,e,l){var r=e.type.getDerivedStateFromError;if(typeof r=="function"){var a=l.value;n.payload=function(){return r(a)},n.callback=function(){xf(t,e,l)}}var d=e.stateNode;d!==null&&typeof d.componentDidCatch=="function"&&(n.callback=function(){xf(t,e,l),typeof r!="function"&&(Ge===null?Ge=new Set([this]):Ge.add(this));var i=l.stack;this.componentDidCatch(l.value,{componentStack:i!==null?i:""})})}function Zb(n,t,e,l,r){if(e.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){if(t=e.alternate,t!==null&&Mr(t,e,r,!0),e=yn.current,e!==null){switch(e.tag){case 31:case 13:return kn===null?oi():e.alternate===null&&gt===0&&(gt=3),e.flags&=-257,e.flags|=65536,e.lanes=r,l===Id?e.flags|=16384:(t=e.updateQueue,t===null?e.updateQueue=new Set([l]):t.add(l),Du(n,l,r)),!1;case 22:return e.flags|=65536,l===Id?e.flags|=16384:(t=e.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([l])},e.updateQueue=t):(e=t.retryQueue,e===null?t.retryQueue=new Set([l]):e.add(l)),Du(n,l,r)),!1}throw Error(z(435,e.tag))}return Du(n,l,r),oi(),!1}if(L)return t=yn.current,t!==null?(!(t.flags&65536)&&(t.flags|=256),t.flags|=65536,t.lanes=r,l!==fo&&(n=Error(z(422),{cause:l}),Ea(On(n,e)))):(l!==fo&&(t=Error(z(423),{cause:l}),Ea(On(t,e))),n=n.current.alternate,n.flags|=65536,r&=-r,n.lanes|=r,l=On(l,e),r=Eo(n.stateNode,l,r),gu(n,r),gt!==4&&(gt=2)),!1;var a=Error(z(520),{cause:l});if(a=On(a,e),ha===null?ha=[a]:ha.push(a),gt!==4&&(gt=2),t===null)return!0;l=On(l,e),e=t;do{switch(e.tag){case 3:return e.flags|=65536,n=r&-r,e.lanes|=n,n=Eo(e.stateNode,l,n),gu(e,n),!1;case 1:if(t=e.type,a=e.stateNode,(e.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||a!==null&&typeof a.componentDidCatch=="function"&&(Ge===null||!Ge.has(a))))return e.flags|=65536,r&=-r,e.lanes|=r,r=Og(r),Rg(r,n,e,l),gu(e,r),!1}e=e.return}while(e!==null);return!1}var Zs=Error(z(461)),xt=!1;function Ct(n,t,e,l){t.child=n===null?Qp(t,null,e,l):zl(t,n.child,e,l)}function Ef(n,t,e,l,r){e=e.render;var a=t.ref;if("ref"in l){var d={};for(var i in l)i!=="ref"&&(d[i]=l[i])}else d=l;return El(t),l=Us(n,t,e,d,a,r),i=Ns(),n!==null&&!xt?(ws(n,t,r),be(n,t,r)):(L&&i&&zs(t),t.flags|=1,Ct(n,t,l,r),t.child)}function zf(n,t,e,l,r){if(n===null){var a=e.type;return typeof a=="function"&&!Es(a)&&a.defaultProps===void 0&&e.compare===null?(t.tag=15,t.type=a,Mg(n,t,a,l,r)):(n=Ad(e.type,null,l,t,t.mode,r),n.ref=t.ref,n.return=t,t.child=n)}if(a=n.child,!Ks(n,r)){var d=a.memoizedProps;if(e=e.compare,e=e!==null?e:Ta,e(d,l)&&n.ref===t.ref)return be(n,t,r)}return t.flags|=1,n=fe(a,l),n.ref=t.ref,n.return=t,t.child=n}function Mg(n,t,e,l,r){if(n!==null){var a=n.memoizedProps;if(Ta(a,l)&&n.ref===t.ref)if(xt=!1,t.pendingProps=l=a,Ks(n,r))n.flags&131072&&(xt=!0);else return t.lanes=n.lanes,be(n,t,r)}return zo(n,t,e,l,r)}function Cg(n,t,e,l){var r=l.children,a=n!==null?n.memoizedState:null;if(n===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),l.mode==="hidden"){if(t.flags&128){if(a=a!==null?a.baseLanes|e:e,n!==null){for(l=t.child=n.child,r=0;l!==null;)r=r|l.lanes|l.childLanes,l=l.sibling;l=r&~a}else l=0,t.child=null;return Af(n,t,a,e,l)}if(e&536870912)t.memoizedState={baseLanes:0,cachePool:null},n!==null&&Dd(t,a!==null?a.cachePool:null),a!==null?gf(t,a):_o(),Kp(t);else return l=t.lanes=536870912,Af(n,t,a!==null?a.baseLanes|e:e,e,l)}else a!==null?(Dd(t,a.cachePool),gf(t,a),Oe(),t.memoizedState=null):(n!==null&&Dd(t,null),_o(),Oe());return Ct(n,t,r,e),t.child}function Fr(n,t){return n!==null&&n.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Af(n,t,e,l,r){var a=Os();return a=a===null?null:{parent:Tt._currentValue,pool:a},t.memoizedState={baseLanes:e,cachePool:a},n!==null&&Dd(t,null),_o(),Kp(t),n!==null&&Mr(n,t,l,!0),t.childLanes=r,null}function Md(n,t){return t=ai({mode:t.mode,children:t.children},n.mode),t.ref=n.ref,n.child=t,t.return=n,t}function Df(n,t,e){return zl(t,n.child,null,e),n=Md(t,t.pendingProps),n.flags|=2,rn(t),t.memoizedState=null,n}function Kb(n,t,e){var l=t.pendingProps,r=(t.flags&128)!==0;if(t.flags&=-129,n===null){if(L){if(l.mode==="hidden")return n=Md(t,l),t.lanes=536870912,Fr(null,n);if(vo(t),(n=rt)?(n=x0(n,Rn),n=n!==null&&n.data==="&"?n:null,n!==null&&(t.memoizedState={dehydrated:n,treeContext:We!==null?{id:Vn,overflow:Zn}:null,retryLane:536870912,hydrationErrors:null},e=Bp(n),e.return=t,t.child=e,Ut=t,rt=null)):n=null,n===null)throw Fe(t);return t.lanes=536870912,null}return Md(t,l)}var a=n.memoizedState;if(a!==null){var d=a.dehydrated;if(vo(t),r)if(t.flags&256)t.flags&=-257,t=Df(n,t,e);else if(t.memoizedState!==null)t.child=n.child,t.flags|=128,t=null;else throw Error(z(558));else if(xt||Mr(n,t,e,!1),r=(e&n.childLanes)!==0,xt||r){if(l=nt,l!==null&&(d=op(l,e),d!==0&&d!==a.retryLane))throw a.retryLane=d,Cl(n,d),Jt(l,n,d),Zs;oi(),t=Df(n,t,e)}else n=a.treeContext,rt=Un(d.nextSibling),Ut=t,L=!0,Le=null,Rn=!1,n!==null&&jp(t,n),t=Md(t,l),t.flags|=4096;return t}return n=fe(n.child,{mode:l.mode,children:l.children}),n.ref=t.ref,t.child=n,n.return=t,n}function Cd(n,t){var e=t.ref;if(e===null)n!==null&&n.ref!==null&&(t.flags|=4194816);else{if(typeof e!="function"&&typeof e!="object")throw Error(z(284));(n===null||n.ref!==e)&&(t.flags|=4194816)}}function zo(n,t,e,l,r){return El(t),e=Us(n,t,e,l,void 0,r),l=Ns(),n!==null&&!xt?(ws(n,t,r),be(n,t,r)):(L&&l&&zs(t),t.flags|=1,Ct(n,t,e,r),t.child)}function Of(n,t,e,l,r,a){return El(t),t.updateQueue=null,e=$p(t,l,e,r),Jp(n),l=Ns(),n!==null&&!xt?(ws(n,t,a),be(n,t,a)):(L&&l&&zs(t),t.flags|=1,Ct(n,t,e,a),t.child)}function Rf(n,t,e,l,r){if(El(t),t.stateNode===null){var a=Wl,d=e.contextType;typeof d=="object"&&d!==null&&(a=Nt(d)),a=new e(l,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=xo,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=l,a.state=t.memoizedState,a.refs={},Ms(t),d=e.contextType,a.context=typeof d=="object"&&d!==null?Nt(d):Wl,a.state=t.memoizedState,d=e.getDerivedStateFromProps,typeof d=="function"&&(yu(t,e,d,l),a.state=t.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof a.getSnapshotBeforeUpdate=="function"||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(d=a.state,typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount(),d!==a.state&&xo.enqueueReplaceState(a,a.state,null),oa(t,l,a,r),ua(),a.state=t.memoizedState),typeof a.componentDidMount=="function"&&(t.flags|=4194308),l=!0}else if(n===null){a=t.stateNode;var i=t.memoizedProps,u=Dl(e,i);a.props=u;var o=a.context,s=e.contextType;d=Wl,typeof s=="object"&&s!==null&&(d=Nt(s));var c=e.getDerivedStateFromProps;s=typeof c=="function"||typeof a.getSnapshotBeforeUpdate=="function",i=t.pendingProps!==i,s||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(i||o!==d)&&Tf(t,a,l,d),ze=!1;var f=t.memoizedState;a.state=f,oa(t,l,a,r),ua(),o=t.memoizedState,i||f!==o||ze?(typeof c=="function"&&(yu(t,e,c,l),o=t.memoizedState),(u=ze||qf(t,e,u,l,f,o,d))?(s||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(t.flags|=4194308)):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=l,t.memoizedState=o),a.props=l,a.state=o,a.context=d,l=u):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),l=!1)}else{a=t.stateNode,yo(n,t),d=t.memoizedProps,s=Dl(e,d),a.props=s,c=t.pendingProps,f=a.context,o=e.contextType,u=Wl,typeof o=="object"&&o!==null&&(u=Nt(o)),i=e.getDerivedStateFromProps,(o=typeof i=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(d!==c||f!==u)&&Tf(t,a,l,u),ze=!1,f=t.memoizedState,a.state=f,oa(t,l,a,r),ua();var h=t.memoizedState;d!==c||f!==h||ze||n!==null&&n.dependencies!==null&&Pd(n.dependencies)?(typeof i=="function"&&(yu(t,e,i,l),h=t.memoizedState),(s=ze||qf(t,e,s,l,f,h,u)||n!==null&&n.dependencies!==null&&Pd(n.dependencies))?(o||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(l,h,u),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(l,h,u)),typeof a.componentDidUpdate=="function"&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof a.componentDidUpdate!="function"||d===n.memoizedProps&&f===n.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||d===n.memoizedProps&&f===n.memoizedState||(t.flags|=1024),t.memoizedProps=l,t.memoizedState=h),a.props=l,a.state=h,a.context=u,l=s):(typeof a.componentDidUpdate!="function"||d===n.memoizedProps&&f===n.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||d===n.memoizedProps&&f===n.memoizedState||(t.flags|=1024),l=!1)}return a=l,Cd(n,t),l=(t.flags&128)!==0,a||l?(a=t.stateNode,e=l&&typeof e.getDerivedStateFromError!="function"?null:a.render(),t.flags|=1,n!==null&&l?(t.child=zl(t,n.child,null,r),t.child=zl(t,null,e,r)):Ct(n,t,e,r),t.memoizedState=a.state,n=t.child):n=be(n,t,r),n}function Mf(n,t,e,l){return xl(),t.flags|=256,Ct(n,t,e,l),t.child}var bu={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function _u(n){return{baseLanes:n,cachePool:Yp()}}function vu(n,t,e){return n=n!==null?n.childLanes&~e:0,t&&(n|=un),n}function kg(n,t,e){var l=t.pendingProps,r=!1,a=(t.flags&128)!==0,d;if((d=a)||(d=n!==null&&n.memoizedState===null?!1:(bt.current&2)!==0),d&&(r=!0,t.flags&=-129),d=(t.flags&32)!==0,t.flags&=-33,n===null){if(L){if(r?De(t):Oe(),(n=rt)?(n=x0(n,Rn),n=n!==null&&n.data!=="&"?n:null,n!==null&&(t.memoizedState={dehydrated:n,treeContext:We!==null?{id:Vn,overflow:Zn}:null,retryLane:536870912,hydrationErrors:null},e=Bp(n),e.return=t,t.child=e,Ut=t,rt=null)):n=null,n===null)throw Fe(t);return Lo(n)?t.lanes=32:t.lanes=536870912,null}var i=l.children;return l=l.fallback,r?(Oe(),r=t.mode,i=ai({mode:"hidden",children:i},r),l=ml(l,r,e,null),i.return=t,l.return=t,i.sibling=l,t.child=i,l=t.child,l.memoizedState=_u(e),l.childLanes=vu(n,d,e),t.memoizedState=bu,Fr(null,l)):(De(t),Ao(t,i))}var u=n.memoizedState;if(u!==null&&(i=u.dehydrated,i!==null)){if(a)t.flags&256?(De(t),t.flags&=-257,t=Su(n,t,e)):t.memoizedState!==null?(Oe(),t.child=n.child,t.flags|=128,t=null):(Oe(),i=l.fallback,r=t.mode,l=ai({mode:"visible",children:l.children},r),i=ml(i,r,e,null),i.flags|=2,l.return=t,i.return=t,l.sibling=i,t.child=l,zl(t,n.child,null,e),l=t.child,l.memoizedState=_u(e),l.childLanes=vu(n,d,e),t.memoizedState=bu,t=Fr(null,l));else if(De(t),Lo(i)){if(d=i.nextSibling&&i.nextSibling.dataset,d)var o=d.dgst;d=o,l=Error(z(419)),l.stack="",l.digest=d,Ea({value:l,source:null,stack:null}),t=Su(n,t,e)}else if(xt||Mr(n,t,e,!1),d=(e&n.childLanes)!==0,xt||d){if(d=nt,d!==null&&(l=op(d,e),l!==0&&l!==u.retryLane))throw u.retryLane=l,Cl(n,l),Jt(d,n,l),Zs;jo(i)||oi(),t=Su(n,t,e)}else jo(i)?(t.flags|=192,t.child=n.child,t=null):(n=u.treeContext,rt=Un(i.nextSibling),Ut=t,L=!0,Le=null,Rn=!1,n!==null&&jp(t,n),t=Ao(t,l.children),t.flags|=4096);return t}return r?(Oe(),i=l.fallback,r=t.mode,u=n.child,o=u.sibling,l=fe(u,{mode:"hidden",children:l.children}),l.subtreeFlags=u.subtreeFlags&65011712,o!==null?i=fe(o,i):(i=ml(i,r,e,null),i.flags|=2),i.return=t,l.return=t,l.sibling=i,t.child=l,Fr(null,l),l=t.child,i=n.child.memoizedState,i===null?i=_u(e):(r=i.cachePool,r!==null?(u=Tt._currentValue,r=r.parent!==u?{parent:u,pool:u}:r):r=Yp(),i={baseLanes:i.baseLanes|e,cachePool:r}),l.memoizedState=i,l.childLanes=vu(n,d,e),t.memoizedState=bu,Fr(n.child,l)):(De(t),e=n.child,n=e.sibling,e=fe(e,{mode:"visible",children:l.children}),e.return=t,e.sibling=null,n!==null&&(d=t.deletions,d===null?(t.deletions=[n],t.flags|=16):d.push(n)),t.child=e,t.memoizedState=null,e)}function Ao(n,t){return t=ai({mode:"visible",children:t},n.mode),t.return=n,n.child=t}function ai(n,t){return n=an(22,n,null,t),n.lanes=0,n}function Su(n,t,e){return zl(t,n.child,null,e),n=Ao(t,t.pendingProps.children),n.flags|=2,t.memoizedState=null,n}function Cf(n,t,e){n.lanes|=t;var l=n.alternate;l!==null&&(l.lanes|=t),po(n.return,t,e)}function qu(n,t,e,l,r,a){var d=n.memoizedState;d===null?n.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:l,tail:e,tailMode:r,treeForkCount:a}:(d.isBackwards=t,d.rendering=null,d.renderingStartTime=0,d.last=l,d.tail=e,d.tailMode=r,d.treeForkCount=a)}function Ug(n,t,e){var l=t.pendingProps,r=l.revealOrder,a=l.tail;l=l.children;var d=bt.current,i=(d&2)!==0;if(i?(d=d&1|2,t.flags|=128):d&=1,et(bt,d),Ct(n,t,l,e),l=L?xa:0,!i&&n!==null&&n.flags&128)t:for(n=t.child;n!==null;){if(n.tag===13)n.memoizedState!==null&&Cf(n,e,t);else if(n.tag===19)Cf(n,e,t);else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break t;for(;n.sibling===null;){if(n.return===null||n.return===t)break t;n=n.return}n.sibling.return=n.return,n=n.sibling}switch(r){case"forwards":for(e=t.child,r=null;e!==null;)n=e.alternate,n!==null&&ni(n)===null&&(r=e),e=e.sibling;e=r,e===null?(r=t.child,t.child=null):(r=e.sibling,e.sibling=null),qu(t,!1,r,e,a,l);break;case"backwards":case"unstable_legacy-backwards":for(e=null,r=t.child,t.child=null;r!==null;){if(n=r.alternate,n!==null&&ni(n)===null){t.child=r;break}n=r.sibling,r.sibling=e,e=r,r=n}qu(t,!0,e,null,a,l);break;case"together":qu(t,!1,null,null,void 0,l);break;default:t.memoizedState=null}return t.child}function be(n,t,e){if(n!==null&&(t.dependencies=n.dependencies),Ie|=t.lanes,!(e&t.childLanes))if(n!==null){if(Mr(n,t,e,!1),(e&t.childLanes)===0)return null}else return null;if(n!==null&&t.child!==n.child)throw Error(z(153));if(t.child!==null){for(n=t.child,e=fe(n,n.pendingProps),t.child=e,e.return=t;n.sibling!==null;)n=n.sibling,e=e.sibling=fe(n,n.pendingProps),e.return=t;e.sibling=null}return t.child}function Ks(n,t){return n.lanes&t?!0:(n=n.dependencies,!!(n!==null&&Pd(n)))}function Jb(n,t,e){switch(t.tag){case 3:Vd(t,t.stateNode.containerInfo),Ae(t,Tt,n.memoizedState.cache),xl();break;case 27:case 5:to(t);break;case 4:Vd(t,t.stateNode.containerInfo);break;case 10:Ae(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,vo(t),null;break;case 13:var l=t.memoizedState;if(l!==null)return l.dehydrated!==null?(De(t),t.flags|=128,null):e&t.child.childLanes?kg(n,t,e):(De(t),n=be(n,t,e),n!==null?n.sibling:null);De(t);break;case 19:var r=(n.flags&128)!==0;if(l=(e&t.childLanes)!==0,l||(Mr(n,t,e,!1),l=(e&t.childLanes)!==0),r){if(l)return Ug(n,t,e);t.flags|=128}if(r=t.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),et(bt,bt.current),l)break;return null;case 22:return t.lanes=0,Cg(n,t,e,t.pendingProps);case 24:Ae(t,Tt,n.memoizedState.cache)}return be(n,t,e)}function Ng(n,t,e){if(n!==null)if(n.memoizedProps!==t.pendingProps)xt=!0;else{if(!Ks(n,e)&&!(t.flags&128))return xt=!1,Jb(n,t,e);xt=!!(n.flags&131072)}else xt=!1,L&&t.flags&1048576&&Hp(t,xa,t.index);switch(t.lanes=0,t.tag){case 16:t:{var l=t.pendingProps;if(n=cl(t.elementType),t.type=n,typeof n=="function")Es(n)?(l=Dl(n,l),t.tag=1,t=Rf(null,t,n,l,e)):(t.tag=0,t=zo(null,t,n,l,e));else{if(n!=null){var r=n.$$typeof;if(r===cs){t.tag=11,t=Ef(null,t,n,l,e);break t}else if(r===fs){t.tag=14,t=zf(null,t,n,l,e);break t}}throw t=Pu(n)||n,Error(z(306,t,""))}}return t;case 0:return zo(n,t,t.type,t.pendingProps,e);case 1:return l=t.type,r=Dl(l,t.pendingProps),Rf(n,t,l,r,e);case 3:t:{if(Vd(t,t.stateNode.containerInfo),n===null)throw Error(z(387));l=t.pendingProps;var a=t.memoizedState;r=a.element,yo(n,t),oa(t,l,null,e);var d=t.memoizedState;if(l=d.cache,Ae(t,Tt,l),l!==a.cache&&go(t,[Tt],e,!0),ua(),l=d.element,a.isDehydrated)if(a={element:l,isDehydrated:!1,cache:d.cache},t.updateQueue.baseState=a,t.memoizedState=a,t.flags&256){t=Mf(n,t,l,e);break t}else if(l!==r){r=On(Error(z(424)),t),Ea(r),t=Mf(n,t,l,e);break t}else{switch(n=t.stateNode.containerInfo,n.nodeType){case 9:n=n.body;break;default:n=n.nodeName==="HTML"?n.ownerDocument.body:n}for(rt=Un(n.firstChild),Ut=t,L=!0,Le=null,Rn=!0,e=Qp(t,null,l,e),t.child=e;e;)e.flags=e.flags&-3|4096,e=e.sibling}else{if(xl(),l===r){t=be(n,t,e);break t}Ct(n,t,l,e)}t=t.child}return t;case 26:return Cd(n,t),n===null?(e=Pf(t.type,null,t.pendingProps,null))?t.memoizedState=e:L||(e=t.type,n=t.pendingProps,l=hi(je.current).createElement(e),l[kt]=t,l[It]=n,wt(l,e,n),Dt(l),t.stateNode=l):t.memoizedState=Pf(t.type,n.memoizedProps,t.pendingProps,n.memoizedState),null;case 27:return to(t),n===null&&L&&(l=t.stateNode=E0(t.type,t.pendingProps,je.current),Ut=t,Rn=!0,r=rt,rl(t.type)?(Yo=r,rt=Un(l.firstChild)):rt=r),Ct(n,t,t.pendingProps.children,e),Cd(n,t),n===null&&(t.flags|=4194304),t.child;case 5:return n===null&&L&&((r=l=rt)&&(l=x1(l,t.type,t.pendingProps,Rn),l!==null?(t.stateNode=l,Ut=t,rt=Un(l.firstChild),Rn=!1,r=!0):r=!1),r||Fe(t)),to(t),r=t.type,a=t.pendingProps,d=n!==null?n.memoizedProps:null,l=a.children,Bo(r,a)?l=null:d!==null&&Bo(r,d)&&(t.flags|=32),t.memoizedState!==null&&(r=Us(n,t,jb,null,null,e),Ma._currentValue=r),Cd(n,t),Ct(n,t,l,e),t.child;case 6:return n===null&&L&&((n=e=rt)&&(e=E1(e,t.pendingProps,Rn),e!==null?(t.stateNode=e,Ut=t,rt=null,n=!0):n=!1),n||Fe(t)),null;case 13:return kg(n,t,e);case 4:return Vd(t,t.stateNode.containerInfo),l=t.pendingProps,n===null?t.child=zl(t,null,l,e):Ct(n,t,l,e),t.child;case 11:return Ef(n,t,t.type,t.pendingProps,e);case 7:return Ct(n,t,t.pendingProps,e),t.child;case 8:return Ct(n,t,t.pendingProps.children,e),t.child;case 12:return Ct(n,t,t.pendingProps.children,e),t.child;case 10:return l=t.pendingProps,Ae(t,t.type,l.value),Ct(n,t,l.children,e),t.child;case 9:return r=t.type._context,l=t.pendingProps.children,El(t),r=Nt(r),l=l(r),t.flags|=1,Ct(n,t,l,e),t.child;case 14:return zf(n,t,t.type,t.pendingProps,e);case 15:return Mg(n,t,t.type,t.pendingProps,e);case 19:return Ug(n,t,e);case 31:return Kb(n,t,e);case 22:return Cg(n,t,e,t.pendingProps);case 24:return El(t),l=Nt(Tt),n===null?(r=Os(),r===null&&(r=nt,a=Ds(),r.pooledCache=a,a.refCount++,a!==null&&(r.pooledCacheLanes|=e),r=a),t.memoizedState={parent:l,cache:r},Ms(t),Ae(t,Tt,r)):(n.lanes&e&&(yo(n,t),oa(t,null,null,e),ua()),r=n.memoizedState,a=t.memoizedState,r.parent!==l?(r={parent:l,cache:l},t.memoizedState=r,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=r),Ae(t,Tt,l)):(l=a.cache,Ae(t,Tt,l),l!==r.cache&&go(t,[Tt],e,!0))),Ct(n,t,t.pendingProps.children,e),t.child;case 29:throw t.pendingProps}throw Error(z(156,t.tag))}function ne(n){n.flags|=4}function Tu(n,t,e,l,r){if((t=(n.mode&32)!==0)&&(t=!1),t){if(n.flags|=16777216,(r&335544128)===r)if(n.stateNode.complete)n.flags|=8192;else if(a0())n.flags|=8192;else throw bl=Id,Rs}else n.flags&=-16777217}function kf(n,t){if(t.type!=="stylesheet"||t.state.loading&4)n.flags&=-16777217;else if(n.flags|=16777216,!D0(t))if(a0())n.flags|=8192;else throw bl=Id,Rs}function gd(n,t){t!==null&&(n.flags|=4),n.flags&16384&&(t=n.tag!==22?dp():536870912,n.lanes|=t,br|=t)}function Gr(n,t){if(!L)switch(n.tailMode){case"hidden":t=n.tail;for(var e=null;t!==null;)t.alternate!==null&&(e=t),t=t.sibling;e===null?n.tail=null:e.sibling=null;break;case"collapsed":e=n.tail;for(var l=null;e!==null;)e.alternate!==null&&(l=e),e=e.sibling;l===null?t||n.tail===null?n.tail=null:n.tail.sibling=null:l.sibling=null}}function lt(n){var t=n.alternate!==null&&n.alternate.child===n.child,e=0,l=0;if(t)for(var r=n.child;r!==null;)e|=r.lanes|r.childLanes,l|=r.subtreeFlags&65011712,l|=r.flags&65011712,r.return=n,r=r.sibling;else for(r=n.child;r!==null;)e|=r.lanes|r.childLanes,l|=r.subtreeFlags,l|=r.flags,r.return=n,r=r.sibling;return n.subtreeFlags|=l,n.childLanes=e,t}function $b(n,t,e){var l=t.pendingProps;switch(As(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return lt(t),null;case 1:return lt(t),null;case 3:return e=t.stateNode,l=null,n!==null&&(l=n.memoizedState.cache),t.memoizedState.cache!==l&&(t.flags|=2048),he(Tt),fr(),e.pendingContext&&(e.context=e.pendingContext,e.pendingContext=null),(n===null||n.child===null)&&(wl(t)?ne(t):n===null||n.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,pu())),lt(t),null;case 26:var r=t.type,a=t.memoizedState;return n===null?(ne(t),a!==null?(lt(t),kf(t,a)):(lt(t),Tu(t,r,null,l,e))):a?a!==n.memoizedState?(ne(t),lt(t),kf(t,a)):(lt(t),t.flags&=-16777217):(n=n.memoizedProps,n!==l&&ne(t),lt(t),Tu(t,r,n,l,e)),null;case 27:if(Zd(t),e=je.current,r=t.type,n!==null&&t.stateNode!=null)n.memoizedProps!==l&&ne(t);else{if(!l){if(t.stateNode===null)throw Error(z(166));return lt(t),null}n=$n.current,wl(t)?uf(t):(n=E0(r,l,e),t.stateNode=n,ne(t))}return lt(t),null;case 5:if(Zd(t),r=t.type,n!==null&&t.stateNode!=null)n.memoizedProps!==l&&ne(t);else{if(!l){if(t.stateNode===null)throw Error(z(166));return lt(t),null}if(a=$n.current,wl(t))uf(t);else{var d=hi(je.current);switch(a){case 1:a=d.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:a=d.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":a=d.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":a=d.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":a=d.createElement("div"),a.innerHTML="<script><\/script>",a=a.removeChild(a.firstChild);break;case"select":a=typeof l.is=="string"?d.createElement("select",{is:l.is}):d.createElement("select"),l.multiple?a.multiple=!0:l.size&&(a.size=l.size);break;default:a=typeof l.is=="string"?d.createElement(r,{is:l.is}):d.createElement(r)}}a[kt]=t,a[It]=l;t:for(d=t.child;d!==null;){if(d.tag===5||d.tag===6)a.appendChild(d.stateNode);else if(d.tag!==4&&d.tag!==27&&d.child!==null){d.child.return=d,d=d.child;continue}if(d===t)break t;for(;d.sibling===null;){if(d.return===null||d.return===t)break t;d=d.return}d.sibling.return=d.return,d=d.sibling}t.stateNode=a;t:switch(wt(a,r,l),r){case"button":case"input":case"select":case"textarea":l=!!l.autoFocus;break t;case"img":l=!0;break t;default:l=!1}l&&ne(t)}}return lt(t),Tu(t,t.type,n===null?null:n.memoizedProps,t.pendingProps,e),null;case 6:if(n&&t.stateNode!=null)n.memoizedProps!==l&&ne(t);else{if(typeof l!="string"&&t.stateNode===null)throw Error(z(166));if(n=je.current,wl(t)){if(n=t.stateNode,e=t.memoizedProps,l=null,r=Ut,r!==null)switch(r.tag){case 27:case 5:l=r.memoizedProps}n[kt]=t,n=!!(n.nodeValue===e||l!==null&&l.suppressHydrationWarning===!0||S0(n.nodeValue,e)),n||Fe(t,!0)}else n=hi(n).createTextNode(l),n[kt]=t,t.stateNode=n}return lt(t),null;case 31:if(e=t.memoizedState,n===null||n.memoizedState!==null){if(l=wl(t),e!==null){if(n===null){if(!l)throw Error(z(318));if(n=t.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(z(557));n[kt]=t}else xl(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;lt(t),n=!1}else e=pu(),n!==null&&n.memoizedState!==null&&(n.memoizedState.hydrationErrors=e),n=!0;if(!n)return t.flags&256?(rn(t),t):(rn(t),null);if(t.flags&128)throw Error(z(558))}return lt(t),null;case 13:if(l=t.memoizedState,n===null||n.memoizedState!==null&&n.memoizedState.dehydrated!==null){if(r=wl(t),l!==null&&l.dehydrated!==null){if(n===null){if(!r)throw Error(z(318));if(r=t.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(z(317));r[kt]=t}else xl(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;lt(t),r=!1}else r=pu(),n!==null&&n.memoizedState!==null&&(n.memoizedState.hydrationErrors=r),r=!0;if(!r)return t.flags&256?(rn(t),t):(rn(t),null)}return rn(t),t.flags&128?(t.lanes=e,t):(e=l!==null,n=n!==null&&n.memoizedState!==null,e&&(l=t.child,r=null,l.alternate!==null&&l.alternate.memoizedState!==null&&l.alternate.memoizedState.cachePool!==null&&(r=l.alternate.memoizedState.cachePool.pool),a=null,l.memoizedState!==null&&l.memoizedState.cachePool!==null&&(a=l.memoizedState.cachePool.pool),a!==r&&(l.flags|=2048)),e!==n&&e&&(t.child.flags|=8192),gd(t,t.updateQueue),lt(t),null);case 4:return fr(),n===null&&tc(t.stateNode.containerInfo),lt(t),null;case 10:return he(t.type),lt(t),null;case 19:if(Ot(bt),l=t.memoizedState,l===null)return lt(t),null;if(r=(t.flags&128)!==0,a=l.rendering,a===null)if(r)Gr(l,!1);else{if(gt!==0||n!==null&&n.flags&128)for(n=t.child;n!==null;){if(a=ni(n),a!==null){for(t.flags|=128,Gr(l,!1),n=a.updateQueue,t.updateQueue=n,gd(t,n),t.subtreeFlags=0,n=e,e=t.child;e!==null;)wp(e,n),e=e.sibling;return et(bt,bt.current&1|2),L&&de(t,l.treeForkCount),t.child}n=n.sibling}l.tail!==null&&cn()>ii&&(t.flags|=128,r=!0,Gr(l,!1),t.lanes=4194304)}else{if(!r)if(n=ni(a),n!==null){if(t.flags|=128,r=!0,n=n.updateQueue,t.updateQueue=n,gd(t,n),Gr(l,!0),l.tail===null&&l.tailMode==="hidden"&&!a.alternate&&!L)return lt(t),null}else 2*cn()-l.renderingStartTime>ii&&e!==536870912&&(t.flags|=128,r=!0,Gr(l,!1),t.lanes=4194304);l.isBackwards?(a.sibling=t.child,t.child=a):(n=l.last,n!==null?n.sibling=a:t.child=a,l.last=a)}return l.tail!==null?(n=l.tail,l.rendering=n,l.tail=n.sibling,l.renderingStartTime=cn(),n.sibling=null,e=bt.current,et(bt,r?e&1|2:e&1),L&&de(t,l.treeForkCount),n):(lt(t),null);case 22:case 23:return rn(t),Cs(),l=t.memoizedState!==null,n!==null?n.memoizedState!==null!==l&&(t.flags|=8192):l&&(t.flags|=8192),l?e&536870912&&!(t.flags&128)&&(lt(t),t.subtreeFlags&6&&(t.flags|=8192)):lt(t),e=t.updateQueue,e!==null&&gd(t,e.retryQueue),e=null,n!==null&&n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(e=n.memoizedState.cachePool.pool),l=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(l=t.memoizedState.cachePool.pool),l!==e&&(t.flags|=2048),n!==null&&Ot(yl),null;case 24:return e=null,n!==null&&(e=n.memoizedState.cache),t.memoizedState.cache!==e&&(t.flags|=2048),he(Tt),lt(t),null;case 25:return null;case 30:return null}throw Error(z(156,t.tag))}function Wb(n,t){switch(As(t),t.tag){case 1:return n=t.flags,n&65536?(t.flags=n&-65537|128,t):null;case 3:return he(Tt),fr(),n=t.flags,n&65536&&!(n&128)?(t.flags=n&-65537|128,t):null;case 26:case 27:case 5:return Zd(t),null;case 31:if(t.memoizedState!==null){if(rn(t),t.alternate===null)throw Error(z(340));xl()}return n=t.flags,n&65536?(t.flags=n&-65537|128,t):null;case 13:if(rn(t),n=t.memoizedState,n!==null&&n.dehydrated!==null){if(t.alternate===null)throw Error(z(340));xl()}return n=t.flags,n&65536?(t.flags=n&-65537|128,t):null;case 19:return Ot(bt),null;case 4:return fr(),null;case 10:return he(t.type),null;case 22:case 23:return rn(t),Cs(),n!==null&&Ot(yl),n=t.flags,n&65536?(t.flags=n&-65537|128,t):null;case 24:return he(Tt),null;case 25:return null;default:return null}}function wg(n,t){switch(As(t),t.tag){case 3:he(Tt),fr();break;case 26:case 27:case 5:Zd(t);break;case 4:fr();break;case 31:t.memoizedState!==null&&rn(t);break;case 13:rn(t);break;case 19:Ot(bt);break;case 10:he(t.type);break;case 22:case 23:rn(t),Cs(),n!==null&&Ot(yl);break;case 24:he(Tt)}}function Pa(n,t){try{var e=t.updateQueue,l=e!==null?e.lastEffect:null;if(l!==null){var r=l.next;e=r;do{if((e.tag&n)===n){l=void 0;var a=e.create,d=e.inst;l=a(),d.destroy=l}e=e.next}while(e!==r)}}catch(i){J(t,t.return,i)}}function Pe(n,t,e){try{var l=t.updateQueue,r=l!==null?l.lastEffect:null;if(r!==null){var a=r.next;l=a;do{if((l.tag&n)===n){var d=l.inst,i=d.destroy;if(i!==void 0){d.destroy=void 0,r=t;var u=e,o=i;try{o()}catch(s){J(r,u,s)}}}l=l.next}while(l!==a)}}catch(s){J(t,t.return,s)}}function Bg(n){var t=n.updateQueue;if(t!==null){var e=n.stateNode;try{Zp(t,e)}catch(l){J(n,n.return,l)}}}function Hg(n,t,e){e.props=Dl(n.type,n.memoizedProps),e.state=n.memoizedState;try{e.componentWillUnmount()}catch(l){J(n,t,l)}}function ca(n,t){try{var e=n.ref;if(e!==null){switch(n.tag){case 26:case 27:case 5:var l=n.stateNode;break;case 30:l=n.stateNode;break;default:l=n.stateNode}typeof e=="function"?n.refCleanup=e(l):e.current=l}}catch(r){J(n,t,r)}}function Kn(n,t){var e=n.ref,l=n.refCleanup;if(e!==null)if(typeof l=="function")try{l()}catch(r){J(n,t,r)}finally{n.refCleanup=null,n=n.alternate,n!=null&&(n.refCleanup=null)}else if(typeof e=="function")try{e(null)}catch(r){J(n,t,r)}else e.current=null}function jg(n){var t=n.type,e=n.memoizedProps,l=n.stateNode;try{t:switch(t){case"button":case"input":case"select":case"textarea":e.autoFocus&&l.focus();break t;case"img":e.src?l.src=e.src:e.srcSet&&(l.srcset=e.srcSet)}}catch(r){J(n,n.return,r)}}function xu(n,t,e){try{var l=n.stateNode;b1(l,n.type,e,t),l[It]=t}catch(r){J(n,n.return,r)}}function Lg(n){return n.tag===5||n.tag===3||n.tag===26||n.tag===27&&rl(n.type)||n.tag===4}function Eu(n){t:for(;;){for(;n.sibling===null;){if(n.return===null||Lg(n.return))return null;n=n.return}for(n.sibling.return=n.return,n=n.sibling;n.tag!==5&&n.tag!==6&&n.tag!==18;){if(n.tag===27&&rl(n.type)||n.flags&2||n.child===null||n.tag===4)continue t;n.child.return=n,n=n.child}if(!(n.flags&2))return n.stateNode}}function Do(n,t,e){var l=n.tag;if(l===5||l===6)n=n.stateNode,t?(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e).insertBefore(n,t):(t=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,t.appendChild(n),e=e._reactRootContainer,e!=null||t.onclick!==null||(t.onclick=se));else if(l!==4&&(l===27&&rl(n.type)&&(e=n.stateNode,t=null),n=n.child,n!==null))for(Do(n,t,e),n=n.sibling;n!==null;)Do(n,t,e),n=n.sibling}function di(n,t,e){var l=n.tag;if(l===5||l===6)n=n.stateNode,t?e.insertBefore(n,t):e.appendChild(n);else if(l!==4&&(l===27&&rl(n.type)&&(e=n.stateNode),n=n.child,n!==null))for(di(n,t,e),n=n.sibling;n!==null;)di(n,t,e),n=n.sibling}function Yg(n){var t=n.stateNode,e=n.memoizedProps;try{for(var l=n.type,r=t.attributes;r.length;)t.removeAttributeNode(r[0]);wt(t,l,e),t[kt]=n,t[It]=e}catch(a){J(n,n.return,a)}}var ue=!1,St=!1,zu=!1,Uf=typeof WeakSet=="function"?WeakSet:Set,At=null;function Fb(n,t){if(n=n.containerInfo,No=yi,n=Dp(n),qs(n)){if("selectionStart"in n)var e={start:n.selectionStart,end:n.selectionEnd};else t:{e=(e=n.ownerDocument)&&e.defaultView||window;var l=e.getSelection&&e.getSelection();if(l&&l.rangeCount!==0){e=l.anchorNode;var r=l.anchorOffset,a=l.focusNode;l=l.focusOffset;try{e.nodeType,a.nodeType}catch{e=null;break t}var d=0,i=-1,u=-1,o=0,s=0,c=n,f=null;n:for(;;){for(var h;c!==e||r!==0&&c.nodeType!==3||(i=d+r),c!==a||l!==0&&c.nodeType!==3||(u=d+l),c.nodeType===3&&(d+=c.nodeValue.length),(h=c.firstChild)!==null;)f=c,c=h;for(;;){if(c===n)break n;if(f===e&&++o===r&&(i=d),f===a&&++s===l&&(u=d),(h=c.nextSibling)!==null)break;c=f,f=c.parentNode}c=h}e=i===-1||u===-1?null:{start:i,end:u}}else e=null}e=e||{start:0,end:0}}else e=null;for(wo={focusedElem:n,selectionRange:e},yi=!1,At=t;At!==null;)if(t=At,n=t.child,(t.subtreeFlags&1028)!==0&&n!==null)n.return=t,At=n;else for(;At!==null;){switch(t=At,a=t.alternate,n=t.flags,t.tag){case 0:if(n&4&&(n=t.updateQueue,n=n!==null?n.events:null,n!==null))for(e=0;e<n.length;e++)r=n[e],r.ref.impl=r.nextImpl;break;case 11:case 15:break;case 1:if(n&1024&&a!==null){n=void 0,e=t,r=a.memoizedProps,a=a.memoizedState,l=e.stateNode;try{var b=Dl(e.type,r);n=l.getSnapshotBeforeUpdate(b,a),l.__reactInternalSnapshotBeforeUpdate=n}catch(m){J(e,e.return,m)}}break;case 3:if(n&1024){if(n=t.stateNode.containerInfo,e=n.nodeType,e===9)Ho(n);else if(e===1)switch(n.nodeName){case"HEAD":case"HTML":case"BODY":Ho(n);break;default:n.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(n&1024)throw Error(z(163))}if(n=t.sibling,n!==null){n.return=t.return,At=n;break}At=t.return}}function Xg(n,t,e){var l=e.flags;switch(e.tag){case 0:case 11:case 15:le(n,e),l&4&&Pa(5,e);break;case 1:if(le(n,e),l&4)if(n=e.stateNode,t===null)try{n.componentDidMount()}catch(d){J(e,e.return,d)}else{var r=Dl(e.type,t.memoizedProps);t=t.memoizedState;try{n.componentDidUpdate(r,t,n.__reactInternalSnapshotBeforeUpdate)}catch(d){J(e,e.return,d)}}l&64&&Bg(e),l&512&&ca(e,e.return);break;case 3:if(le(n,e),l&64&&(n=e.updateQueue,n!==null)){if(t=null,e.child!==null)switch(e.child.tag){case 27:case 5:t=e.child.stateNode;break;case 1:t=e.child.stateNode}try{Zp(n,t)}catch(d){J(e,e.return,d)}}break;case 27:t===null&&l&4&&Yg(e);case 26:case 5:le(n,e),t===null&&l&4&&jg(e),l&512&&ca(e,e.return);break;case 12:le(n,e);break;case 31:le(n,e),l&4&&Vg(n,e);break;case 13:le(n,e),l&4&&Zg(n,e),l&64&&(n=e.memoizedState,n!==null&&(n=n.dehydrated,n!==null&&(e=d1.bind(null,e),z1(n,e))));break;case 22:if(l=e.memoizedState!==null||ue,!l){t=t!==null&&t.memoizedState!==null||St,r=ue;var a=St;ue=l,(St=t)&&!a?re(n,e,(e.subtreeFlags&8772)!==0):le(n,e),ue=r,St=a}break;case 30:break;default:le(n,e)}}function Gg(n){var t=n.alternate;t!==null&&(n.alternate=null,Gg(t)),n.child=null,n.deletions=null,n.sibling=null,n.tag===5&&(t=n.stateNode,t!==null&&ms(t)),n.stateNode=null,n.return=null,n.dependencies=null,n.memoizedProps=null,n.memoizedState=null,n.pendingProps=null,n.stateNode=null,n.updateQueue=null}var ut=null,Vt=!1;function ee(n,t,e){for(e=e.child;e!==null;)Qg(n,t,e),e=e.sibling}function Qg(n,t,e){if(fn&&typeof fn.onCommitFiberUnmount=="function")try{fn.onCommitFiberUnmount(Va,e)}catch{}switch(e.tag){case 26:St||Kn(e,t),ee(n,t,e),e.memoizedState?e.memoizedState.count--:e.stateNode&&(e=e.stateNode,e.parentNode.removeChild(e));break;case 27:St||Kn(e,t);var l=ut,r=Vt;rl(e.type)&&(ut=e.stateNode,Vt=!1),ee(n,t,e),ga(e.stateNode),ut=l,Vt=r;break;case 5:St||Kn(e,t);case 6:if(l=ut,r=Vt,ut=null,ee(n,t,e),ut=l,Vt=r,ut!==null)if(Vt)try{(ut.nodeType===9?ut.body:ut.nodeName==="HTML"?ut.ownerDocument.body:ut).removeChild(e.stateNode)}catch(a){J(e,t,a)}else try{ut.removeChild(e.stateNode)}catch(a){J(e,t,a)}break;case 18:ut!==null&&(Vt?(n=ut,Kf(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,e.stateNode),qr(n)):Kf(ut,e.stateNode));break;case 4:l=ut,r=Vt,ut=e.stateNode.containerInfo,Vt=!0,ee(n,t,e),ut=l,Vt=r;break;case 0:case 11:case 14:case 15:Pe(2,e,t),St||Pe(4,e,t),ee(n,t,e);break;case 1:St||(Kn(e,t),l=e.stateNode,typeof l.componentWillUnmount=="function"&&Hg(e,t,l)),ee(n,t,e);break;case 21:ee(n,t,e);break;case 22:St=(l=St)||e.memoizedState!==null,ee(n,t,e),St=l;break;default:ee(n,t,e)}}function Vg(n,t){if(t.memoizedState===null&&(n=t.alternate,n!==null&&(n=n.memoizedState,n!==null))){n=n.dehydrated;try{qr(n)}catch(e){J(t,t.return,e)}}}function Zg(n,t){if(t.memoizedState===null&&(n=t.alternate,n!==null&&(n=n.memoizedState,n!==null&&(n=n.dehydrated,n!==null))))try{qr(n)}catch(e){J(t,t.return,e)}}function Pb(n){switch(n.tag){case 31:case 13:case 19:var t=n.stateNode;return t===null&&(t=n.stateNode=new Uf),t;case 22:return n=n.stateNode,t=n._retryCache,t===null&&(t=n._retryCache=new Uf),t;default:throw Error(z(435,n.tag))}}function md(n,t){var e=Pb(n);t.forEach(function(l){if(!e.has(l)){e.add(l);var r=i1.bind(null,n,l);l.then(r,r)}})}function Gt(n,t){var e=t.deletions;if(e!==null)for(var l=0;l<e.length;l++){var r=e[l],a=n,d=t,i=d;t:for(;i!==null;){switch(i.tag){case 27:if(rl(i.type)){ut=i.stateNode,Vt=!1;break t}break;case 5:ut=i.stateNode,Vt=!1;break t;case 3:case 4:ut=i.stateNode.containerInfo,Vt=!0;break t}i=i.return}if(ut===null)throw Error(z(160));Qg(a,d,r),ut=null,Vt=!1,a=r.alternate,a!==null&&(a.return=null),r.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)Kg(t,n),t=t.sibling}var Bn=null;function Kg(n,t){var e=n.alternate,l=n.flags;switch(n.tag){case 0:case 11:case 14:case 15:Gt(t,n),Qt(n),l&4&&(Pe(3,n,n.return),Pa(3,n),Pe(5,n,n.return));break;case 1:Gt(t,n),Qt(n),l&512&&(St||e===null||Kn(e,e.return)),l&64&&ue&&(n=n.updateQueue,n!==null&&(l=n.callbacks,l!==null&&(e=n.shared.hiddenCallbacks,n.shared.hiddenCallbacks=e===null?l:e.concat(l))));break;case 26:var r=Bn;if(Gt(t,n),Qt(n),l&512&&(St||e===null||Kn(e,e.return)),l&4){var a=e!==null?e.memoizedState:null;if(l=n.memoizedState,e===null)if(l===null)if(n.stateNode===null){t:{l=n.type,e=n.memoizedProps,r=r.ownerDocument||r;n:switch(l){case"title":a=r.getElementsByTagName("title")[0],(!a||a[Ja]||a[kt]||a.namespaceURI==="http://www.w3.org/2000/svg"||a.hasAttribute("itemprop"))&&(a=r.createElement(l),r.head.insertBefore(a,r.querySelector("head > title"))),wt(a,l,e),a[kt]=n,Dt(a),l=a;break t;case"link":var d=th("link","href",r).get(l+(e.href||""));if(d){for(var i=0;i<d.length;i++)if(a=d[i],a.getAttribute("href")===(e.href==null||e.href===""?null:e.href)&&a.getAttribute("rel")===(e.rel==null?null:e.rel)&&a.getAttribute("title")===(e.title==null?null:e.title)&&a.getAttribute("crossorigin")===(e.crossOrigin==null?null:e.crossOrigin)){d.splice(i,1);break n}}a=r.createElement(l),wt(a,l,e),r.head.appendChild(a);break;case"meta":if(d=th("meta","content",r).get(l+(e.content||""))){for(i=0;i<d.length;i++)if(a=d[i],a.getAttribute("content")===(e.content==null?null:""+e.content)&&a.getAttribute("name")===(e.name==null?null:e.name)&&a.getAttribute("property")===(e.property==null?null:e.property)&&a.getAttribute("http-equiv")===(e.httpEquiv==null?null:e.httpEquiv)&&a.getAttribute("charset")===(e.charSet==null?null:e.charSet)){d.splice(i,1);break n}}a=r.createElement(l),wt(a,l,e),r.head.appendChild(a);break;default:throw Error(z(468,l))}a[kt]=n,Dt(a),l=a}n.stateNode=l}else nh(r,n.type,n.stateNode);else n.stateNode=If(r,l,n.memoizedProps);else a!==l?(a===null?e.stateNode!==null&&(e=e.stateNode,e.parentNode.removeChild(e)):a.count--,l===null?nh(r,n.type,n.stateNode):If(r,l,n.memoizedProps)):l===null&&n.stateNode!==null&&xu(n,n.memoizedProps,e.memoizedProps)}break;case 27:Gt(t,n),Qt(n),l&512&&(St||e===null||Kn(e,e.return)),e!==null&&l&4&&xu(n,n.memoizedProps,e.memoizedProps);break;case 5:if(Gt(t,n),Qt(n),l&512&&(St||e===null||Kn(e,e.return)),n.flags&32){r=n.stateNode;try{pr(r,"")}catch(b){J(n,n.return,b)}}l&4&&n.stateNode!=null&&(r=n.memoizedProps,xu(n,r,e!==null?e.memoizedProps:r)),l&1024&&(zu=!0);break;case 6:if(Gt(t,n),Qt(n),l&4){if(n.stateNode===null)throw Error(z(162));l=n.memoizedProps,e=n.stateNode;try{e.nodeValue=l}catch(b){J(n,n.return,b)}}break;case 3:if(Nd=null,r=Bn,Bn=pi(t.containerInfo),Gt(t,n),Bn=r,Qt(n),l&4&&e!==null&&e.memoizedState.isDehydrated)try{qr(t.containerInfo)}catch(b){J(n,n.return,b)}zu&&(zu=!1,Jg(n));break;case 4:l=Bn,Bn=pi(n.stateNode.containerInfo),Gt(t,n),Qt(n),Bn=l;break;case 12:Gt(t,n),Qt(n);break;case 31:Gt(t,n),Qt(n),l&4&&(l=n.updateQueue,l!==null&&(n.updateQueue=null,md(n,l)));break;case 13:Gt(t,n),Qt(n),n.child.flags&8192&&n.memoizedState!==null!=(e!==null&&e.memoizedState!==null)&&(Xi=cn()),l&4&&(l=n.updateQueue,l!==null&&(n.updateQueue=null,md(n,l)));break;case 22:r=n.memoizedState!==null;var u=e!==null&&e.memoizedState!==null,o=ue,s=St;if(ue=o||r,St=s||u,Gt(t,n),St=s,ue=o,Qt(n),l&8192)t:for(t=n.stateNode,t._visibility=r?t._visibility&-2:t._visibility|1,r&&(e===null||u||ue||St||fl(n)),e=null,t=n;;){if(t.tag===5||t.tag===26){if(e===null){u=e=t;try{if(a=u.stateNode,r)d=a.style,typeof d.setProperty=="function"?d.setProperty("display","none","important"):d.display="none";else{i=u.stateNode;var c=u.memoizedProps.style,f=c!=null&&c.hasOwnProperty("display")?c.display:null;i.style.display=f==null||typeof f=="boolean"?"":(""+f).trim()}}catch(b){J(u,u.return,b)}}}else if(t.tag===6){if(e===null){u=t;try{u.stateNode.nodeValue=r?"":u.memoizedProps}catch(b){J(u,u.return,b)}}}else if(t.tag===18){if(e===null){u=t;try{var h=u.stateNode;r?Jf(h,!0):Jf(u.stateNode,!1)}catch(b){J(u,u.return,b)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===n)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===n)break t;for(;t.sibling===null;){if(t.return===null||t.return===n)break t;e===t&&(e=null),t=t.return}e===t&&(e=null),t.sibling.return=t.return,t=t.sibling}l&4&&(l=n.updateQueue,l!==null&&(e=l.retryQueue,e!==null&&(l.retryQueue=null,md(n,e))));break;case 19:Gt(t,n),Qt(n),l&4&&(l=n.updateQueue,l!==null&&(n.updateQueue=null,md(n,l)));break;case 30:break;case 21:break;default:Gt(t,n),Qt(n)}}function Qt(n){var t=n.flags;if(t&2){try{for(var e,l=n.return;l!==null;){if(Lg(l)){e=l;break}l=l.return}if(e==null)throw Error(z(160));switch(e.tag){case 27:var r=e.stateNode,a=Eu(n);di(n,a,r);break;case 5:var d=e.stateNode;e.flags&32&&(pr(d,""),e.flags&=-33);var i=Eu(n);di(n,i,d);break;case 3:case 4:var u=e.stateNode.containerInfo,o=Eu(n);Do(n,o,u);break;default:throw Error(z(161))}}catch(s){J(n,n.return,s)}n.flags&=-3}t&4096&&(n.flags&=-4097)}function Jg(n){if(n.subtreeFlags&1024)for(n=n.child;n!==null;){var t=n;Jg(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),n=n.sibling}}function le(n,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)Xg(n,t.alternate,t),t=t.sibling}function fl(n){for(n=n.child;n!==null;){var t=n;switch(t.tag){case 0:case 11:case 14:case 15:Pe(4,t,t.return),fl(t);break;case 1:Kn(t,t.return);var e=t.stateNode;typeof e.componentWillUnmount=="function"&&Hg(t,t.return,e),fl(t);break;case 27:ga(t.stateNode);case 26:case 5:Kn(t,t.return),fl(t);break;case 22:t.memoizedState===null&&fl(t);break;case 30:fl(t);break;default:fl(t)}n=n.sibling}}function re(n,t,e){for(e=e&&(t.subtreeFlags&8772)!==0,t=t.child;t!==null;){var l=t.alternate,r=n,a=t,d=a.flags;switch(a.tag){case 0:case 11:case 15:re(r,a,e),Pa(4,a);break;case 1:if(re(r,a,e),l=a,r=l.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(o){J(l,l.return,o)}if(l=a,r=l.updateQueue,r!==null){var i=l.stateNode;try{var u=r.shared.hiddenCallbacks;if(u!==null)for(r.shared.hiddenCallbacks=null,r=0;r<u.length;r++)Vp(u[r],i)}catch(o){J(l,l.return,o)}}e&&d&64&&Bg(a),ca(a,a.return);break;case 27:Yg(a);case 26:case 5:re(r,a,e),e&&l===null&&d&4&&jg(a),ca(a,a.return);break;case 12:re(r,a,e);break;case 31:re(r,a,e),e&&d&4&&Vg(r,a);break;case 13:re(r,a,e),e&&d&4&&Zg(r,a);break;case 22:a.memoizedState===null&&re(r,a,e),ca(a,a.return);break;case 30:break;default:re(r,a,e)}t=t.sibling}}function Js(n,t){var e=null;n!==null&&n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(e=n.memoizedState.cachePool.pool),n=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),n!==e&&(n!=null&&n.refCount++,e!=null&&Wa(e))}function $s(n,t){n=null,t.alternate!==null&&(n=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==n&&(t.refCount++,n!=null&&Wa(n))}function wn(n,t,e,l){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)$g(n,t,e,l),t=t.sibling}function $g(n,t,e,l){var r=t.flags;switch(t.tag){case 0:case 11:case 15:wn(n,t,e,l),r&2048&&Pa(9,t);break;case 1:wn(n,t,e,l);break;case 3:wn(n,t,e,l),r&2048&&(n=null,t.alternate!==null&&(n=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==n&&(t.refCount++,n!=null&&Wa(n)));break;case 12:if(r&2048){wn(n,t,e,l),n=t.stateNode;try{var a=t.memoizedProps,d=a.id,i=a.onPostCommit;typeof i=="function"&&i(d,t.alternate===null?"mount":"update",n.passiveEffectDuration,-0)}catch(u){J(t,t.return,u)}}else wn(n,t,e,l);break;case 31:wn(n,t,e,l);break;case 13:wn(n,t,e,l);break;case 23:break;case 22:a=t.stateNode,d=t.alternate,t.memoizedState!==null?a._visibility&2?wn(n,t,e,l):fa(n,t):a._visibility&2?wn(n,t,e,l):(a._visibility|=2,Ll(n,t,e,l,(t.subtreeFlags&10256)!==0||!1)),r&2048&&Js(d,t);break;case 24:wn(n,t,e,l),r&2048&&$s(t.alternate,t);break;default:wn(n,t,e,l)}}function Ll(n,t,e,l,r){for(r=r&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var a=n,d=t,i=e,u=l,o=d.flags;switch(d.tag){case 0:case 11:case 15:Ll(a,d,i,u,r),Pa(8,d);break;case 23:break;case 22:var s=d.stateNode;d.memoizedState!==null?s._visibility&2?Ll(a,d,i,u,r):fa(a,d):(s._visibility|=2,Ll(a,d,i,u,r)),r&&o&2048&&Js(d.alternate,d);break;case 24:Ll(a,d,i,u,r),r&&o&2048&&$s(d.alternate,d);break;default:Ll(a,d,i,u,r)}t=t.sibling}}function fa(n,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var e=n,l=t,r=l.flags;switch(l.tag){case 22:fa(e,l),r&2048&&Js(l.alternate,l);break;case 24:fa(e,l),r&2048&&$s(l.alternate,l);break;default:fa(e,l)}t=t.sibling}}var Pr=8192;function Bl(n,t,e){if(n.subtreeFlags&Pr)for(n=n.child;n!==null;)Wg(n,t,e),n=n.sibling}function Wg(n,t,e){switch(n.tag){case 26:Bl(n,t,e),n.flags&Pr&&n.memoizedState!==null&&H1(e,Bn,n.memoizedState,n.memoizedProps);break;case 5:Bl(n,t,e);break;case 3:case 4:var l=Bn;Bn=pi(n.stateNode.containerInfo),Bl(n,t,e),Bn=l;break;case 22:n.memoizedState===null&&(l=n.alternate,l!==null&&l.memoizedState!==null?(l=Pr,Pr=16777216,Bl(n,t,e),Pr=l):Bl(n,t,e));break;default:Bl(n,t,e)}}function Fg(n){var t=n.alternate;if(t!==null&&(n=t.child,n!==null)){t.child=null;do t=n.sibling,n.sibling=null,n=t;while(n!==null)}}function Qr(n){var t=n.deletions;if(n.flags&16){if(t!==null)for(var e=0;e<t.length;e++){var l=t[e];At=l,Ig(l,n)}Fg(n)}if(n.subtreeFlags&10256)for(n=n.child;n!==null;)Pg(n),n=n.sibling}function Pg(n){switch(n.tag){case 0:case 11:case 15:Qr(n),n.flags&2048&&Pe(9,n,n.return);break;case 3:Qr(n);break;case 12:Qr(n);break;case 22:var t=n.stateNode;n.memoizedState!==null&&t._visibility&2&&(n.return===null||n.return.tag!==13)?(t._visibility&=-3,kd(n)):Qr(n);break;default:Qr(n)}}function kd(n){var t=n.deletions;if(n.flags&16){if(t!==null)for(var e=0;e<t.length;e++){var l=t[e];At=l,Ig(l,n)}Fg(n)}for(n=n.child;n!==null;){switch(t=n,t.tag){case 0:case 11:case 15:Pe(8,t,t.return),kd(t);break;case 22:e=t.stateNode,e._visibility&2&&(e._visibility&=-3,kd(t));break;default:kd(t)}n=n.sibling}}function Ig(n,t){for(;At!==null;){var e=At;switch(e.tag){case 0:case 11:case 15:Pe(8,e,t);break;case 23:case 22:if(e.memoizedState!==null&&e.memoizedState.cachePool!==null){var l=e.memoizedState.cachePool.pool;l!=null&&l.refCount++}break;case 24:Wa(e.memoizedState.cache)}if(l=e.child,l!==null)l.return=e,At=l;else t:for(e=n;At!==null;){l=At;var r=l.sibling,a=l.return;if(Gg(l),l===e){At=null;break t}if(r!==null){r.return=a,At=r;break t}At=a}}}var Ib={getCacheForType:function(n){var t=Nt(Tt),e=t.data.get(n);return e===void 0&&(e=n(),t.data.set(n,e)),e},cacheSignal:function(){return Nt(Tt).controller.signal}},t1=typeof WeakMap=="function"?WeakMap:Map,Q=0,nt=null,B=null,j=0,K=0,en=null,ke=!1,kr=!1,Ws=!1,_e=0,gt=0,Ie=0,_l=0,Fs=0,un=0,br=0,ha=null,Zt=null,Oo=!1,Xi=0,t0=0,ii=1/0,ui=null,Ge=null,Et=0,Qe=null,_r=null,pe=0,Ro=0,Mo=null,n0=null,pa=0,Co=null;function pn(){return Q&2&&j!==0?j&-j:k.T!==null?Is():sp()}function e0(){if(un===0)if(!(j&536870912)||L){var n=ud;ud<<=1,!(ud&3932160)&&(ud=262144),un=n}else un=536870912;return n=yn.current,n!==null&&(n.flags|=32),un}function Jt(n,t,e){(n===nt&&(K===2||K===9)||n.cancelPendingCommit!==null)&&(vr(n,0),Ue(n,j,un,!1)),Ka(n,e),(!(Q&2)||n!==nt)&&(n===nt&&(!(Q&2)&&(_l|=e),gt===4&&Ue(n,j,un,!1)),Pn(n))}function l0(n,t,e){if(Q&6)throw Error(z(327));var l=!e&&(t&127)===0&&(t&n.expiredLanes)===0||Za(n,t),r=l?l1(n,t):Au(n,t,!0),a=l;do{if(r===0){kr&&!l&&Ue(n,t,0,!1);break}else{if(e=n.current.alternate,a&&!n1(e)){r=Au(n,t,!1),a=!1;continue}if(r===2){if(a=t,n.errorRecoveryDisabledLanes&a)var d=0;else d=n.pendingLanes&-536870913,d=d!==0?d:d&536870912?536870912:0;if(d!==0){t=d;t:{var i=n;r=ha;var u=i.current.memoizedState.isDehydrated;if(u&&(vr(i,d).flags|=256),d=Au(i,d,!1),d!==2){if(Ws&&!u){i.errorRecoveryDisabledLanes|=a,_l|=a,r=4;break t}a=Zt,Zt=r,a!==null&&(Zt===null?Zt=a:Zt.push.apply(Zt,a))}r=d}if(a=!1,r!==2)continue}}if(r===1){vr(n,0),Ue(n,t,0,!0);break}t:{switch(l=n,a=r,a){case 0:case 1:throw Error(z(345));case 4:if((t&4194048)!==t)break;case 6:Ue(l,t,un,!ke);break t;case 2:Zt=null;break;case 3:case 5:break;default:throw Error(z(329))}if((t&62914560)===t&&(r=Xi+300-cn(),10<r)){if(Ue(l,t,un,!ke),Mi(l,0,!0)!==0)break t;pe=t,l.timeoutHandle=T0(Nf.bind(null,l,e,Zt,ui,Oo,t,un,_l,br,ke,a,"Throttled",-0,0),r);break t}Nf(l,e,Zt,ui,Oo,t,un,_l,br,ke,a,null,-0,0)}}break}while(!0);Pn(n)}function Nf(n,t,e,l,r,a,d,i,u,o,s,c,f,h){if(n.timeoutHandle=-1,c=t.subtreeFlags,c&8192||(c&16785408)===16785408){c={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:se},Wg(t,a,c);var b=(a&62914560)===a?Xi-cn():(a&4194048)===a?t0-cn():0;if(b=j1(c,b),b!==null){pe=a,n.cancelPendingCommit=b(Bf.bind(null,n,t,a,e,l,r,d,i,u,s,c,null,f,h)),Ue(n,a,d,!o);return}}Bf(n,t,a,e,l,r,d,i,u)}function n1(n){for(var t=n;;){var e=t.tag;if((e===0||e===11||e===15)&&t.flags&16384&&(e=t.updateQueue,e!==null&&(e=e.stores,e!==null)))for(var l=0;l<e.length;l++){var r=e[l],a=r.getSnapshot;r=r.value;try{if(!mn(a(),r))return!1}catch{return!1}}if(e=t.child,t.subtreeFlags&16384&&e!==null)e.return=t,t=e;else{if(t===n)break;for(;t.sibling===null;){if(t.return===null||t.return===n)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Ue(n,t,e,l){t&=~Fs,t&=~_l,n.suspendedLanes|=t,n.pingedLanes&=~t,l&&(n.warmLanes|=t),l=n.expirationTimes;for(var r=t;0<r;){var a=31-hn(r),d=1<<a;l[a]=-1,r&=~d}e!==0&&ip(n,e,t)}function Gi(){return Q&6?!0:(Ia(0),!1)}function Ps(){if(B!==null){if(K===0)var n=B.return;else n=B,ce=kl=null,Bs(n),dr=null,za=0,n=B;for(;n!==null;)wg(n.alternate,n),n=n.return;B=null}}function vr(n,t){var e=n.timeoutHandle;e!==-1&&(n.timeoutHandle=-1,S1(e)),e=n.cancelPendingCommit,e!==null&&(n.cancelPendingCommit=null,e()),pe=0,Ps(),nt=n,B=e=fe(n.current,null),j=t,K=0,en=null,ke=!1,kr=Za(n,t),Ws=!1,br=un=Fs=_l=Ie=gt=0,Zt=ha=null,Oo=!1,t&8&&(t|=t&32);var l=n.entangledLanes;if(l!==0)for(n=n.entanglements,l&=t;0<l;){var r=31-hn(l),a=1<<r;t|=n[r],l&=~a}return _e=t,Ni(),e}function r0(n,t){N=null,k.H=Da,t===Cr||t===Bi?(t=hf(),K=3):t===Rs?(t=hf(),K=4):K=t===Zs?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,en=t,B===null&&(gt=1,ri(n,On(t,n.current)))}function a0(){var n=yn.current;return n===null?!0:(j&4194048)===j?kn===null:(j&62914560)===j||j&536870912?n===kn:!1}function d0(){var n=k.H;return k.H=Da,n===null?Da:n}function i0(){var n=k.A;return k.A=Ib,n}function oi(){gt=4,ke||(j&4194048)!==j&&yn.current!==null||(kr=!0),!(Ie&134217727)&&!(_l&134217727)||nt===null||Ue(nt,j,un,!1)}function Au(n,t,e){var l=Q;Q|=2;var r=d0(),a=i0();(nt!==n||j!==t)&&(ui=null,vr(n,t)),t=!1;var d=gt;t:do try{if(K!==0&&B!==null){var i=B,u=en;switch(K){case 8:Ps(),d=6;break t;case 3:case 2:case 9:case 6:yn.current===null&&(t=!0);var o=K;if(K=0,en=null,Il(n,i,u,o),e&&kr){d=0;break t}break;default:o=K,K=0,en=null,Il(n,i,u,o)}}e1(),d=gt;break}catch(s){r0(n,s)}while(!0);return t&&n.shellSuspendCounter++,ce=kl=null,Q=l,k.H=r,k.A=a,B===null&&(nt=null,j=0,Ni()),d}function e1(){for(;B!==null;)u0(B)}function l1(n,t){var e=Q;Q|=2;var l=d0(),r=i0();nt!==n||j!==t?(ui=null,ii=cn()+500,vr(n,t)):kr=Za(n,t);t:do try{if(K!==0&&B!==null){t=B;var a=en;n:switch(K){case 1:K=0,en=null,Il(n,t,a,1);break;case 2:case 9:if(ff(a)){K=0,en=null,wf(t);break}t=function(){K!==2&&K!==9||nt!==n||(K=7),Pn(n)},a.then(t,t);break t;case 3:K=7;break t;case 4:K=5;break t;case 7:ff(a)?(K=0,en=null,wf(t)):(K=0,en=null,Il(n,t,a,7));break;case 5:var d=null;switch(B.tag){case 26:d=B.memoizedState;case 5:case 27:var i=B;if(d?D0(d):i.stateNode.complete){K=0,en=null;var u=i.sibling;if(u!==null)B=u;else{var o=i.return;o!==null?(B=o,Qi(o)):B=null}break n}}K=0,en=null,Il(n,t,a,5);break;case 6:K=0,en=null,Il(n,t,a,6);break;case 8:Ps(),gt=6;break t;default:throw Error(z(462))}}r1();break}catch(s){r0(n,s)}while(!0);return ce=kl=null,k.H=l,k.A=r,Q=e,B!==null?0:(nt=null,j=0,Ni(),gt)}function r1(){for(;B!==null&&!Ay();)u0(B)}function u0(n){var t=Ng(n.alternate,n,_e);n.memoizedProps=n.pendingProps,t===null?Qi(n):B=t}function wf(n){var t=n,e=t.alternate;switch(t.tag){case 15:case 0:t=Of(e,t,t.pendingProps,t.type,void 0,j);break;case 11:t=Of(e,t,t.pendingProps,t.type.render,t.ref,j);break;case 5:Bs(t);default:wg(e,t),t=B=wp(t,_e),t=Ng(e,t,_e)}n.memoizedProps=n.pendingProps,t===null?Qi(n):B=t}function Il(n,t,e,l){ce=kl=null,Bs(t),dr=null,za=0;var r=t.return;try{if(Zb(n,r,t,e,j)){gt=1,ri(n,On(e,n.current)),B=null;return}}catch(a){if(r!==null)throw B=r,a;gt=1,ri(n,On(e,n.current)),B=null;return}t.flags&32768?(L||l===1?n=!0:kr||j&536870912?n=!1:(ke=n=!0,(l===2||l===9||l===3||l===6)&&(l=yn.current,l!==null&&l.tag===13&&(l.flags|=16384))),o0(t,n)):Qi(t)}function Qi(n){var t=n;do{if(t.flags&32768){o0(t,ke);return}n=t.return;var e=$b(t.alternate,t,_e);if(e!==null){B=e;return}if(t=t.sibling,t!==null){B=t;return}B=t=n}while(t!==null);gt===0&&(gt=5)}function o0(n,t){do{var e=Wb(n.alternate,n);if(e!==null){e.flags&=32767,B=e;return}if(e=n.return,e!==null&&(e.flags|=32768,e.subtreeFlags=0,e.deletions=null),!t&&(n=n.sibling,n!==null)){B=n;return}B=n=e}while(n!==null);gt=6,B=null}function Bf(n,t,e,l,r,a,d,i,u){n.cancelPendingCommit=null;do Vi();while(Et!==0);if(Q&6)throw Error(z(327));if(t!==null){if(t===n.current)throw Error(z(177));if(a=t.lanes|t.childLanes,a|=Ts,By(n,e,a,d,i,u),n===nt&&(B=nt=null,j=0),_r=t,Qe=n,pe=e,Ro=a,Mo=r,n0=l,t.subtreeFlags&10256||t.flags&10256?(n.callbackNode=null,n.callbackPriority=0,u1(Kd,function(){return p0(),null})):(n.callbackNode=null,n.callbackPriority=0),l=(t.flags&13878)!==0,t.subtreeFlags&13878||l){l=k.T,k.T=null,r=V.p,V.p=2,d=Q,Q|=4;try{Fb(n,t,e)}finally{Q=d,V.p=r,k.T=l}}Et=1,s0(),c0(),f0()}}function s0(){if(Et===1){Et=0;var n=Qe,t=_r,e=(t.flags&13878)!==0;if(t.subtreeFlags&13878||e){e=k.T,k.T=null;var l=V.p;V.p=2;var r=Q;Q|=4;try{Kg(t,n);var a=wo,d=Dp(n.containerInfo),i=a.focusedElem,u=a.selectionRange;if(d!==i&&i&&i.ownerDocument&&Ap(i.ownerDocument.documentElement,i)){if(u!==null&&qs(i)){var o=u.start,s=u.end;if(s===void 0&&(s=o),"selectionStart"in i)i.selectionStart=o,i.selectionEnd=Math.min(s,i.value.length);else{var c=i.ownerDocument||document,f=c&&c.defaultView||window;if(f.getSelection){var h=f.getSelection(),b=i.textContent.length,m=Math.min(u.start,b),v=u.end===void 0?m:Math.min(u.end,b);!h.extend&&m>v&&(d=v,v=m,m=d);var g=rf(i,m),p=rf(i,v);if(g&&p&&(h.rangeCount!==1||h.anchorNode!==g.node||h.anchorOffset!==g.offset||h.focusNode!==p.node||h.focusOffset!==p.offset)){var y=c.createRange();y.setStart(g.node,g.offset),h.removeAllRanges(),m>v?(h.addRange(y),h.extend(p.node,p.offset)):(y.setEnd(p.node,p.offset),h.addRange(y))}}}}for(c=[],h=i;h=h.parentNode;)h.nodeType===1&&c.push({element:h,left:h.scrollLeft,top:h.scrollTop});for(typeof i.focus=="function"&&i.focus(),i=0;i<c.length;i++){var _=c[i];_.element.scrollLeft=_.left,_.element.scrollTop=_.top}}yi=!!No,wo=No=null}finally{Q=r,V.p=l,k.T=e}}n.current=t,Et=2}}function c0(){if(Et===2){Et=0;var n=Qe,t=_r,e=(t.flags&8772)!==0;if(t.subtreeFlags&8772||e){e=k.T,k.T=null;var l=V.p;V.p=2;var r=Q;Q|=4;try{Xg(n,t.alternate,t)}finally{Q=r,V.p=l,k.T=e}}Et=3}}function f0(){if(Et===4||Et===3){Et=0,Dy();var n=Qe,t=_r,e=pe,l=n0;t.subtreeFlags&10256||t.flags&10256?Et=5:(Et=0,_r=Qe=null,h0(n,n.pendingLanes));var r=n.pendingLanes;if(r===0&&(Ge=null),gs(e),t=t.stateNode,fn&&typeof fn.onCommitFiberRoot=="function")try{fn.onCommitFiberRoot(Va,t,void 0,(t.current.flags&128)===128)}catch{}if(l!==null){t=k.T,r=V.p,V.p=2,k.T=null;try{for(var a=n.onRecoverableError,d=0;d<l.length;d++){var i=l[d];a(i.value,{componentStack:i.stack})}}finally{k.T=t,V.p=r}}pe&3&&Vi(),Pn(n),r=n.pendingLanes,e&261930&&r&42?n===Co?pa++:(pa=0,Co=n):pa=0,Ia(0)}}function h0(n,t){(n.pooledCacheLanes&=t)===0&&(t=n.pooledCache,t!=null&&(n.pooledCache=null,Wa(t)))}function Vi(){return s0(),c0(),f0(),p0()}function p0(){if(Et!==5)return!1;var n=Qe,t=Ro;Ro=0;var e=gs(pe),l=k.T,r=V.p;try{V.p=32>e?32:e,k.T=null,e=Mo,Mo=null;var a=Qe,d=pe;if(Et=0,_r=Qe=null,pe=0,Q&6)throw Error(z(331));var i=Q;if(Q|=4,Pg(a.current),$g(a,a.current,d,e),Q=i,Ia(0,!1),fn&&typeof fn.onPostCommitFiberRoot=="function")try{fn.onPostCommitFiberRoot(Va,a)}catch{}return!0}finally{V.p=r,k.T=l,h0(n,t)}}function Hf(n,t,e){t=On(e,t),t=Eo(n.stateNode,t,2),n=Xe(n,t,2),n!==null&&(Ka(n,2),Pn(n))}function J(n,t,e){if(n.tag===3)Hf(n,n,e);else for(;t!==null;){if(t.tag===3){Hf(t,n,e);break}else if(t.tag===1){var l=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof l.componentDidCatch=="function"&&(Ge===null||!Ge.has(l))){n=On(e,n),e=Og(2),l=Xe(t,e,2),l!==null&&(Rg(e,l,t,n),Ka(l,2),Pn(l));break}}t=t.return}}function Du(n,t,e){var l=n.pingCache;if(l===null){l=n.pingCache=new t1;var r=new Set;l.set(t,r)}else r=l.get(t),r===void 0&&(r=new Set,l.set(t,r));r.has(e)||(Ws=!0,r.add(e),n=a1.bind(null,n,t,e),t.then(n,n))}function a1(n,t,e){var l=n.pingCache;l!==null&&l.delete(t),n.pingedLanes|=n.suspendedLanes&e,n.warmLanes&=~e,nt===n&&(j&e)===e&&(gt===4||gt===3&&(j&62914560)===j&&300>cn()-Xi?!(Q&2)&&vr(n,0):Fs|=e,br===j&&(br=0)),Pn(n)}function g0(n,t){t===0&&(t=dp()),n=Cl(n,t),n!==null&&(Ka(n,t),Pn(n))}function d1(n){var t=n.memoizedState,e=0;t!==null&&(e=t.retryLane),g0(n,e)}function i1(n,t){var e=0;switch(n.tag){case 31:case 13:var l=n.stateNode,r=n.memoizedState;r!==null&&(e=r.retryLane);break;case 19:l=n.stateNode;break;case 22:l=n.stateNode._retryCache;break;default:throw Error(z(314))}l!==null&&l.delete(t),g0(n,e)}function u1(n,t){return hs(n,t)}var si=null,Yl=null,ko=!1,ci=!1,Ou=!1,Ne=0;function Pn(n){n!==Yl&&n.next===null&&(Yl===null?si=Yl=n:Yl=Yl.next=n),ci=!0,ko||(ko=!0,s1())}function Ia(n,t){if(!Ou&&ci){Ou=!0;do for(var e=!1,l=si;l!==null;){if(n!==0){var r=l.pendingLanes;if(r===0)var a=0;else{var d=l.suspendedLanes,i=l.pingedLanes;a=(1<<31-hn(42|n)+1)-1,a&=r&~(d&~i),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(e=!0,jf(l,a))}else a=j,a=Mi(l,l===nt?a:0,l.cancelPendingCommit!==null||l.timeoutHandle!==-1),!(a&3)||Za(l,a)||(e=!0,jf(l,a));l=l.next}while(e);Ou=!1}}function o1(){m0()}function m0(){ci=ko=!1;var n=0;Ne!==0&&v1()&&(n=Ne);for(var t=cn(),e=null,l=si;l!==null;){var r=l.next,a=y0(l,t);a===0?(l.next=null,e===null?si=r:e.next=r,r===null&&(Yl=e)):(e=l,(n!==0||a&3)&&(ci=!0)),l=r}Et!==0&&Et!==5||Ia(n),Ne!==0&&(Ne=0)}function y0(n,t){for(var e=n.suspendedLanes,l=n.pingedLanes,r=n.expirationTimes,a=n.pendingLanes&-62914561;0<a;){var d=31-hn(a),i=1<<d,u=r[d];u===-1?(!(i&e)||i&l)&&(r[d]=wy(i,t)):u<=t&&(n.expiredLanes|=i),a&=~i}if(t=nt,e=j,e=Mi(n,n===t?e:0,n.cancelPendingCommit!==null||n.timeoutHandle!==-1),l=n.callbackNode,e===0||n===t&&(K===2||K===9)||n.cancelPendingCommit!==null)return l!==null&&l!==null&&lu(l),n.callbackNode=null,n.callbackPriority=0;if(!(e&3)||Za(n,e)){if(t=e&-e,t===n.callbackPriority)return t;switch(l!==null&&lu(l),gs(e)){case 2:case 8:e=rp;break;case 32:e=Kd;break;case 268435456:e=ap;break;default:e=Kd}return l=b0.bind(null,n),e=hs(e,l),n.callbackPriority=t,n.callbackNode=e,t}return l!==null&&l!==null&&lu(l),n.callbackPriority=2,n.callbackNode=null,2}function b0(n,t){if(Et!==0&&Et!==5)return n.callbackNode=null,n.callbackPriority=0,null;var e=n.callbackNode;if(Vi()&&n.callbackNode!==e)return null;var l=j;return l=Mi(n,n===nt?l:0,n.cancelPendingCommit!==null||n.timeoutHandle!==-1),l===0?null:(l0(n,l,t),y0(n,cn()),n.callbackNode!=null&&n.callbackNode===e?b0.bind(null,n):null)}function jf(n,t){if(Vi())return null;l0(n,t,!0)}function s1(){q1(function(){Q&6?hs(lp,o1):m0()})}function Is(){if(Ne===0){var n=gr;n===0&&(n=id,id<<=1,!(id&261888)&&(id=256)),Ne=n}return Ne}function Lf(n){return n==null||typeof n=="symbol"||typeof n=="boolean"?null:typeof n=="function"?n:xd(""+n)}function Yf(n,t){var e=t.ownerDocument.createElement("input");return e.name=t.name,e.value=t.value,n.id&&e.setAttribute("form",n.id),t.parentNode.insertBefore(e,t),n=new FormData(n),e.parentNode.removeChild(e),n}function c1(n,t,e,l,r){if(t==="submit"&&e&&e.stateNode===r){var a=Lf((r[It]||null).action),d=l.submitter;d&&(t=(t=d[It]||null)?Lf(t.formAction):d.getAttribute("formAction"),t!==null&&(a=t,d=null));var i=new Ci("action","action",null,l,r);n.push({event:i,listeners:[{instance:null,listener:function(){if(l.defaultPrevented){if(Ne!==0){var u=d?Yf(r,d):new FormData(r);To(e,{pending:!0,data:u,method:r.method,action:a},null,u)}}else typeof a=="function"&&(i.preventDefault(),u=d?Yf(r,d):new FormData(r),To(e,{pending:!0,data:u,method:r.method,action:a},a,u))},currentTarget:r}]})}}for(var Ru=0;Ru<co.length;Ru++){var Mu=co[Ru],f1=Mu.toLowerCase(),h1=Mu[0].toUpperCase()+Mu.slice(1);Ln(f1,"on"+h1)}Ln(Rp,"onAnimationEnd");Ln(Mp,"onAnimationIteration");Ln(Cp,"onAnimationStart");Ln("dblclick","onDoubleClick");Ln("focusin","onFocus");Ln("focusout","onBlur");Ln(Ob,"onTransitionRun");Ln(Rb,"onTransitionStart");Ln(Mb,"onTransitionCancel");Ln(kp,"onTransitionEnd");hr("onMouseEnter",["mouseout","mouseover"]);hr("onMouseLeave",["mouseout","mouseover"]);hr("onPointerEnter",["pointerout","pointerover"]);hr("onPointerLeave",["pointerout","pointerover"]);Ol("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Ol("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Ol("onBeforeInput",["compositionend","keypress","textInput","paste"]);Ol("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Ol("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Ol("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Oa="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),p1=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Oa));function _0(n,t){t=(t&4)!==0;for(var e=0;e<n.length;e++){var l=n[e],r=l.event;l=l.listeners;t:{var a=void 0;if(t)for(var d=l.length-1;0<=d;d--){var i=l[d],u=i.instance,o=i.currentTarget;if(i=i.listener,u!==a&&r.isPropagationStopped())break t;a=i,r.currentTarget=o;try{a(r)}catch(s){$d(s)}r.currentTarget=null,a=u}else for(d=0;d<l.length;d++){if(i=l[d],u=i.instance,o=i.currentTarget,i=i.listener,u!==a&&r.isPropagationStopped())break t;a=i,r.currentTarget=o;try{a(r)}catch(s){$d(s)}r.currentTarget=null,a=u}}}}function w(n,t){var e=t[eo];e===void 0&&(e=t[eo]=new Set);var l=n+"__bubble";e.has(l)||(v0(t,n,2,!1),e.add(l))}function Cu(n,t,e){var l=0;t&&(l|=4),v0(e,n,l,t)}var yd="_reactListening"+Math.random().toString(36).slice(2);function tc(n){if(!n[yd]){n[yd]=!0,cp.forEach(function(e){e!=="selectionchange"&&(p1.has(e)||Cu(e,!1,n),Cu(e,!0,n))});var t=n.nodeType===9?n:n.ownerDocument;t===null||t[yd]||(t[yd]=!0,Cu("selectionchange",!1,t))}}function v0(n,t,e,l){switch(k0(t)){case 2:var r=X1;break;case 8:r=G1;break;default:r=rc}e=r.bind(null,t,e,n),r=void 0,!uo||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(r=!0),l?r!==void 0?n.addEventListener(t,e,{capture:!0,passive:r}):n.addEventListener(t,e,!0):r!==void 0?n.addEventListener(t,e,{passive:r}):n.addEventListener(t,e,!1)}function ku(n,t,e,l,r){var a=l;if(!(t&1)&&!(t&2)&&l!==null)t:for(;;){if(l===null)return;var d=l.tag;if(d===3||d===4){var i=l.stateNode.containerInfo;if(i===r)break;if(d===4)for(d=l.return;d!==null;){var u=d.tag;if((u===3||u===4)&&d.stateNode.containerInfo===r)return;d=d.return}for(;i!==null;){if(d=Ql(i),d===null)return;if(u=d.tag,u===5||u===6||u===26||u===27){l=a=d;continue t}i=i.parentNode}}l=l.return}_p(function(){var o=a,s=bs(e),c=[];t:{var f=Up.get(n);if(f!==void 0){var h=Ci,b=n;switch(n){case"keypress":if(zd(e)===0)break t;case"keydown":case"keyup":h=ib;break;case"focusin":b="focus",h=uu;break;case"focusout":b="blur",h=uu;break;case"beforeblur":case"afterblur":h=uu;break;case"click":if(e.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":h=Jc;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":h=$y;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":h=sb;break;case Rp:case Mp:case Cp:h=Py;break;case kp:h=fb;break;case"scroll":case"scrollend":h=Ky;break;case"wheel":h=pb;break;case"copy":case"cut":case"paste":h=tb;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":h=Wc;break;case"toggle":case"beforetoggle":h=mb}var m=(t&4)!==0,v=!m&&(n==="scroll"||n==="scrollend"),g=m?f!==null?f+"Capture":null:f;m=[];for(var p=o,y;p!==null;){var _=p;if(y=_.stateNode,_=_.tag,_!==5&&_!==26&&_!==27||y===null||g===null||(_=Sa(p,g),_!=null&&m.push(Ra(p,_,y))),v)break;p=p.return}0<m.length&&(f=new h(f,b,null,e,s),c.push({event:f,listeners:m}))}}if(!(t&7)){t:{if(f=n==="mouseover"||n==="pointerover",h=n==="mouseout"||n==="pointerout",f&&e!==io&&(b=e.relatedTarget||e.fromElement)&&(Ql(b)||b[Or]))break t;if((h||f)&&(f=s.window===s?s:(f=s.ownerDocument)?f.defaultView||f.parentWindow:window,h?(b=e.relatedTarget||e.toElement,h=o,b=b?Ql(b):null,b!==null&&(v=Qa(b),m=b.tag,b!==v||m!==5&&m!==27&&m!==6)&&(b=null)):(h=null,b=o),h!==b)){if(m=Jc,_="onMouseLeave",g="onMouseEnter",p="mouse",(n==="pointerout"||n==="pointerover")&&(m=Wc,_="onPointerLeave",g="onPointerEnter",p="pointer"),v=h==null?f:Wr(h),y=b==null?f:Wr(b),f=new m(_,p+"leave",h,e,s),f.target=v,f.relatedTarget=y,_=null,Ql(s)===o&&(m=new m(g,p+"enter",b,e,s),m.target=y,m.relatedTarget=v,_=m),v=_,h&&b)n:{for(m=g1,g=h,p=b,y=0,_=g;_;_=m(_))y++;_=0;for(var S=p;S;S=m(S))_++;for(;0<y-_;)g=m(g),y--;for(;0<_-y;)p=m(p),_--;for(;y--;){if(g===p||p!==null&&g===p.alternate){m=g;break n}g=m(g),p=m(p)}m=null}else m=null;h!==null&&Xf(c,f,h,m,!1),b!==null&&v!==null&&Xf(c,v,b,m,!0)}}t:{if(f=o?Wr(o):window,h=f.nodeName&&f.nodeName.toLowerCase(),h==="select"||h==="input"&&f.type==="file")var A=tf;else if(Ic(f))if(Ep)A=zb;else{A=xb;var q=Tb}else h=f.nodeName,!h||h.toLowerCase()!=="input"||f.type!=="checkbox"&&f.type!=="radio"?o&&ys(o.elementType)&&(A=tf):A=Eb;if(A&&(A=A(n,o))){xp(c,A,e,s);break t}q&&q(n,f,o),n==="focusout"&&o&&f.type==="number"&&o.memoizedProps.value!=null&&ao(f,"number",f.value)}switch(q=o?Wr(o):window,n){case"focusin":(Ic(q)||q.contentEditable==="true")&&(Kl=q,oo=o,aa=null);break;case"focusout":aa=oo=Kl=null;break;case"mousedown":so=!0;break;case"contextmenu":case"mouseup":case"dragend":so=!1,af(c,e,s);break;case"selectionchange":if(Db)break;case"keydown":case"keyup":af(c,e,s)}var E;if(Ss)t:{switch(n){case"compositionstart":var x="onCompositionStart";break t;case"compositionend":x="onCompositionEnd";break t;case"compositionupdate":x="onCompositionUpdate";break t}x=void 0}else Zl?qp(n,e)&&(x="onCompositionEnd"):n==="keydown"&&e.keyCode===229&&(x="onCompositionStart");x&&(Sp&&e.locale!=="ko"&&(Zl||x!=="onCompositionStart"?x==="onCompositionEnd"&&Zl&&(E=vp()):(Ce=s,_s="value"in Ce?Ce.value:Ce.textContent,Zl=!0)),q=fi(o,x),0<q.length&&(x=new $c(x,n,null,e,s),c.push({event:x,listeners:q}),E?x.data=E:(E=Tp(e),E!==null&&(x.data=E)))),(E=bb?_b(n,e):vb(n,e))&&(x=fi(o,"onBeforeInput"),0<x.length&&(q=new $c("onBeforeInput","beforeinput",null,e,s),c.push({event:q,listeners:x}),q.data=E)),c1(c,n,o,e,s)}_0(c,t)})}function Ra(n,t,e){return{instance:n,listener:t,currentTarget:e}}function fi(n,t){for(var e=t+"Capture",l=[];n!==null;){var r=n,a=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||a===null||(r=Sa(n,e),r!=null&&l.unshift(Ra(n,r,a)),r=Sa(n,t),r!=null&&l.push(Ra(n,r,a))),n.tag===3)return l;n=n.return}return[]}function g1(n){if(n===null)return null;do n=n.return;while(n&&n.tag!==5&&n.tag!==27);return n||null}function Xf(n,t,e,l,r){for(var a=t._reactName,d=[];e!==null&&e!==l;){var i=e,u=i.alternate,o=i.stateNode;if(i=i.tag,u!==null&&u===l)break;i!==5&&i!==26&&i!==27||o===null||(u=o,r?(o=Sa(e,a),o!=null&&d.unshift(Ra(e,o,u))):r||(o=Sa(e,a),o!=null&&d.push(Ra(e,o,u)))),e=e.return}d.length!==0&&n.push({event:t,listeners:d})}var m1=/\r\n?/g,y1=/\u0000|\uFFFD/g;function Gf(n){return(typeof n=="string"?n:""+n).replace(m1,`
`).replace(y1,"")}function S0(n,t){return t=Gf(t),Gf(n)===t}function W(n,t,e,l,r,a){switch(e){case"children":typeof l=="string"?t==="body"||t==="textarea"&&l===""||pr(n,l):(typeof l=="number"||typeof l=="bigint")&&t!=="body"&&pr(n,""+l);break;case"className":sd(n,"class",l);break;case"tabIndex":sd(n,"tabindex",l);break;case"dir":case"role":case"viewBox":case"width":case"height":sd(n,e,l);break;case"style":bp(n,l,a);break;case"data":if(t!=="object"){sd(n,"data",l);break}case"src":case"href":if(l===""&&(t!=="a"||e!=="href")){n.removeAttribute(e);break}if(l==null||typeof l=="function"||typeof l=="symbol"||typeof l=="boolean"){n.removeAttribute(e);break}l=xd(""+l),n.setAttribute(e,l);break;case"action":case"formAction":if(typeof l=="function"){n.setAttribute(e,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof a=="function"&&(e==="formAction"?(t!=="input"&&W(n,t,"name",r.name,r,null),W(n,t,"formEncType",r.formEncType,r,null),W(n,t,"formMethod",r.formMethod,r,null),W(n,t,"formTarget",r.formTarget,r,null)):(W(n,t,"encType",r.encType,r,null),W(n,t,"method",r.method,r,null),W(n,t,"target",r.target,r,null)));if(l==null||typeof l=="symbol"||typeof l=="boolean"){n.removeAttribute(e);break}l=xd(""+l),n.setAttribute(e,l);break;case"onClick":l!=null&&(n.onclick=se);break;case"onScroll":l!=null&&w("scroll",n);break;case"onScrollEnd":l!=null&&w("scrollend",n);break;case"dangerouslySetInnerHTML":if(l!=null){if(typeof l!="object"||!("__html"in l))throw Error(z(61));if(e=l.__html,e!=null){if(r.children!=null)throw Error(z(60));n.innerHTML=e}}break;case"multiple":n.multiple=l&&typeof l!="function"&&typeof l!="symbol";break;case"muted":n.muted=l&&typeof l!="function"&&typeof l!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(l==null||typeof l=="function"||typeof l=="boolean"||typeof l=="symbol"){n.removeAttribute("xlink:href");break}e=xd(""+l),n.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",e);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":l!=null&&typeof l!="function"&&typeof l!="symbol"?n.setAttribute(e,""+l):n.removeAttribute(e);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":l&&typeof l!="function"&&typeof l!="symbol"?n.setAttribute(e,""):n.removeAttribute(e);break;case"capture":case"download":l===!0?n.setAttribute(e,""):l!==!1&&l!=null&&typeof l!="function"&&typeof l!="symbol"?n.setAttribute(e,l):n.removeAttribute(e);break;case"cols":case"rows":case"size":case"span":l!=null&&typeof l!="function"&&typeof l!="symbol"&&!isNaN(l)&&1<=l?n.setAttribute(e,l):n.removeAttribute(e);break;case"rowSpan":case"start":l==null||typeof l=="function"||typeof l=="symbol"||isNaN(l)?n.removeAttribute(e):n.setAttribute(e,l);break;case"popover":w("beforetoggle",n),w("toggle",n),Td(n,"popover",l);break;case"xlinkActuate":te(n,"http://www.w3.org/1999/xlink","xlink:actuate",l);break;case"xlinkArcrole":te(n,"http://www.w3.org/1999/xlink","xlink:arcrole",l);break;case"xlinkRole":te(n,"http://www.w3.org/1999/xlink","xlink:role",l);break;case"xlinkShow":te(n,"http://www.w3.org/1999/xlink","xlink:show",l);break;case"xlinkTitle":te(n,"http://www.w3.org/1999/xlink","xlink:title",l);break;case"xlinkType":te(n,"http://www.w3.org/1999/xlink","xlink:type",l);break;case"xmlBase":te(n,"http://www.w3.org/XML/1998/namespace","xml:base",l);break;case"xmlLang":te(n,"http://www.w3.org/XML/1998/namespace","xml:lang",l);break;case"xmlSpace":te(n,"http://www.w3.org/XML/1998/namespace","xml:space",l);break;case"is":Td(n,"is",l);break;case"innerText":case"textContent":break;default:(!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(e=Vy.get(e)||e,Td(n,e,l))}}function Uo(n,t,e,l,r,a){switch(e){case"style":bp(n,l,a);break;case"dangerouslySetInnerHTML":if(l!=null){if(typeof l!="object"||!("__html"in l))throw Error(z(61));if(e=l.__html,e!=null){if(r.children!=null)throw Error(z(60));n.innerHTML=e}}break;case"children":typeof l=="string"?pr(n,l):(typeof l=="number"||typeof l=="bigint")&&pr(n,""+l);break;case"onScroll":l!=null&&w("scroll",n);break;case"onScrollEnd":l!=null&&w("scrollend",n);break;case"onClick":l!=null&&(n.onclick=se);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!fp.hasOwnProperty(e))t:{if(e[0]==="o"&&e[1]==="n"&&(r=e.endsWith("Capture"),t=e.slice(2,r?e.length-7:void 0),a=n[It]||null,a=a!=null?a[e]:null,typeof a=="function"&&n.removeEventListener(t,a,r),typeof l=="function")){typeof a!="function"&&a!==null&&(e in n?n[e]=null:n.hasAttribute(e)&&n.removeAttribute(e)),n.addEventListener(t,l,r);break t}e in n?n[e]=l:l===!0?n.setAttribute(e,""):Td(n,e,l)}}}function wt(n,t,e){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":w("error",n),w("load",n);var l=!1,r=!1,a;for(a in e)if(e.hasOwnProperty(a)){var d=e[a];if(d!=null)switch(a){case"src":l=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(z(137,t));default:W(n,t,a,d,e,null)}}r&&W(n,t,"srcSet",e.srcSet,e,null),l&&W(n,t,"src",e.src,e,null);return;case"input":w("invalid",n);var i=a=d=r=null,u=null,o=null;for(l in e)if(e.hasOwnProperty(l)){var s=e[l];if(s!=null)switch(l){case"name":r=s;break;case"type":d=s;break;case"checked":u=s;break;case"defaultChecked":o=s;break;case"value":a=s;break;case"defaultValue":i=s;break;case"children":case"dangerouslySetInnerHTML":if(s!=null)throw Error(z(137,t));break;default:W(n,t,l,s,e,null)}}gp(n,a,i,u,o,d,r,!1);return;case"select":w("invalid",n),l=d=a=null;for(r in e)if(e.hasOwnProperty(r)&&(i=e[r],i!=null))switch(r){case"value":a=i;break;case"defaultValue":d=i;break;case"multiple":l=i;default:W(n,t,r,i,e,null)}t=a,e=d,n.multiple=!!l,t!=null?lr(n,!!l,t,!1):e!=null&&lr(n,!!l,e,!0);return;case"textarea":w("invalid",n),a=r=l=null;for(d in e)if(e.hasOwnProperty(d)&&(i=e[d],i!=null))switch(d){case"value":l=i;break;case"defaultValue":r=i;break;case"children":a=i;break;case"dangerouslySetInnerHTML":if(i!=null)throw Error(z(91));break;default:W(n,t,d,i,e,null)}yp(n,l,r,a);return;case"option":for(u in e)if(e.hasOwnProperty(u)&&(l=e[u],l!=null))switch(u){case"selected":n.selected=l&&typeof l!="function"&&typeof l!="symbol";break;default:W(n,t,u,l,e,null)}return;case"dialog":w("beforetoggle",n),w("toggle",n),w("cancel",n),w("close",n);break;case"iframe":case"object":w("load",n);break;case"video":case"audio":for(l=0;l<Oa.length;l++)w(Oa[l],n);break;case"image":w("error",n),w("load",n);break;case"details":w("toggle",n);break;case"embed":case"source":case"link":w("error",n),w("load",n);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(o in e)if(e.hasOwnProperty(o)&&(l=e[o],l!=null))switch(o){case"children":case"dangerouslySetInnerHTML":throw Error(z(137,t));default:W(n,t,o,l,e,null)}return;default:if(ys(t)){for(s in e)e.hasOwnProperty(s)&&(l=e[s],l!==void 0&&Uo(n,t,s,l,e,void 0));return}}for(i in e)e.hasOwnProperty(i)&&(l=e[i],l!=null&&W(n,t,i,l,e,null))}function b1(n,t,e,l){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,a=null,d=null,i=null,u=null,o=null,s=null;for(h in e){var c=e[h];if(e.hasOwnProperty(h)&&c!=null)switch(h){case"checked":break;case"value":break;case"defaultValue":u=c;default:l.hasOwnProperty(h)||W(n,t,h,null,l,c)}}for(var f in l){var h=l[f];if(c=e[f],l.hasOwnProperty(f)&&(h!=null||c!=null))switch(f){case"type":a=h;break;case"name":r=h;break;case"checked":o=h;break;case"defaultChecked":s=h;break;case"value":d=h;break;case"defaultValue":i=h;break;case"children":case"dangerouslySetInnerHTML":if(h!=null)throw Error(z(137,t));break;default:h!==c&&W(n,t,f,h,l,c)}}ro(n,d,i,u,o,s,a,r);return;case"select":h=d=i=f=null;for(a in e)if(u=e[a],e.hasOwnProperty(a)&&u!=null)switch(a){case"value":break;case"multiple":h=u;default:l.hasOwnProperty(a)||W(n,t,a,null,l,u)}for(r in l)if(a=l[r],u=e[r],l.hasOwnProperty(r)&&(a!=null||u!=null))switch(r){case"value":f=a;break;case"defaultValue":i=a;break;case"multiple":d=a;default:a!==u&&W(n,t,r,a,l,u)}t=i,e=d,l=h,f!=null?lr(n,!!e,f,!1):!!l!=!!e&&(t!=null?lr(n,!!e,t,!0):lr(n,!!e,e?[]:"",!1));return;case"textarea":h=f=null;for(i in e)if(r=e[i],e.hasOwnProperty(i)&&r!=null&&!l.hasOwnProperty(i))switch(i){case"value":break;case"children":break;default:W(n,t,i,null,l,r)}for(d in l)if(r=l[d],a=e[d],l.hasOwnProperty(d)&&(r!=null||a!=null))switch(d){case"value":f=r;break;case"defaultValue":h=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(z(91));break;default:r!==a&&W(n,t,d,r,l,a)}mp(n,f,h);return;case"option":for(var b in e)if(f=e[b],e.hasOwnProperty(b)&&f!=null&&!l.hasOwnProperty(b))switch(b){case"selected":n.selected=!1;break;default:W(n,t,b,null,l,f)}for(u in l)if(f=l[u],h=e[u],l.hasOwnProperty(u)&&f!==h&&(f!=null||h!=null))switch(u){case"selected":n.selected=f&&typeof f!="function"&&typeof f!="symbol";break;default:W(n,t,u,f,l,h)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var m in e)f=e[m],e.hasOwnProperty(m)&&f!=null&&!l.hasOwnProperty(m)&&W(n,t,m,null,l,f);for(o in l)if(f=l[o],h=e[o],l.hasOwnProperty(o)&&f!==h&&(f!=null||h!=null))switch(o){case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(z(137,t));break;default:W(n,t,o,f,l,h)}return;default:if(ys(t)){for(var v in e)f=e[v],e.hasOwnProperty(v)&&f!==void 0&&!l.hasOwnProperty(v)&&Uo(n,t,v,void 0,l,f);for(s in l)f=l[s],h=e[s],!l.hasOwnProperty(s)||f===h||f===void 0&&h===void 0||Uo(n,t,s,f,l,h);return}}for(var g in e)f=e[g],e.hasOwnProperty(g)&&f!=null&&!l.hasOwnProperty(g)&&W(n,t,g,null,l,f);for(c in l)f=l[c],h=e[c],!l.hasOwnProperty(c)||f===h||f==null&&h==null||W(n,t,c,f,l,h)}function Qf(n){switch(n){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function _1(){if(typeof performance.getEntriesByType=="function"){for(var n=0,t=0,e=performance.getEntriesByType("resource"),l=0;l<e.length;l++){var r=e[l],a=r.transferSize,d=r.initiatorType,i=r.duration;if(a&&i&&Qf(d)){for(d=0,i=r.responseEnd,l+=1;l<e.length;l++){var u=e[l],o=u.startTime;if(o>i)break;var s=u.transferSize,c=u.initiatorType;s&&Qf(c)&&(u=u.responseEnd,d+=s*(u<i?1:(i-o)/(u-o)))}if(--l,t+=8*(a+d)/(r.duration/1e3),n++,10<n)break}}if(0<n)return t/n/1e6}return navigator.connection&&(n=navigator.connection.downlink,typeof n=="number")?n:5}var No=null,wo=null;function hi(n){return n.nodeType===9?n:n.ownerDocument}function Vf(n){switch(n){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function q0(n,t){if(n===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return n===1&&t==="foreignObject"?0:n}function Bo(n,t){return n==="textarea"||n==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Uu=null;function v1(){var n=window.event;return n&&n.type==="popstate"?n===Uu?!1:(Uu=n,!0):(Uu=null,!1)}var T0=typeof setTimeout=="function"?setTimeout:void 0,S1=typeof clearTimeout=="function"?clearTimeout:void 0,Zf=typeof Promise=="function"?Promise:void 0,q1=typeof queueMicrotask=="function"?queueMicrotask:typeof Zf<"u"?function(n){return Zf.resolve(null).then(n).catch(T1)}:T0;function T1(n){setTimeout(function(){throw n})}function rl(n){return n==="head"}function Kf(n,t){var e=t,l=0;do{var r=e.nextSibling;if(n.removeChild(e),r&&r.nodeType===8)if(e=r.data,e==="/$"||e==="/&"){if(l===0){n.removeChild(r),qr(t);return}l--}else if(e==="$"||e==="$?"||e==="$~"||e==="$!"||e==="&")l++;else if(e==="html")ga(n.ownerDocument.documentElement);else if(e==="head"){e=n.ownerDocument.head,ga(e);for(var a=e.firstChild;a;){var d=a.nextSibling,i=a.nodeName;a[Ja]||i==="SCRIPT"||i==="STYLE"||i==="LINK"&&a.rel.toLowerCase()==="stylesheet"||e.removeChild(a),a=d}}else e==="body"&&ga(n.ownerDocument.body);e=r}while(e);qr(t)}function Jf(n,t){var e=n;n=0;do{var l=e.nextSibling;if(e.nodeType===1?t?(e._stashedDisplay=e.style.display,e.style.display="none"):(e.style.display=e._stashedDisplay||"",e.getAttribute("style")===""&&e.removeAttribute("style")):e.nodeType===3&&(t?(e._stashedText=e.nodeValue,e.nodeValue=""):e.nodeValue=e._stashedText||""),l&&l.nodeType===8)if(e=l.data,e==="/$"){if(n===0)break;n--}else e!=="$"&&e!=="$?"&&e!=="$~"&&e!=="$!"||n++;e=l}while(e)}function Ho(n){var t=n.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var e=t;switch(t=t.nextSibling,e.nodeName){case"HTML":case"HEAD":case"BODY":Ho(e),ms(e);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(e.rel.toLowerCase()==="stylesheet")continue}n.removeChild(e)}}function x1(n,t,e,l){for(;n.nodeType===1;){var r=e;if(n.nodeName.toLowerCase()!==t.toLowerCase()){if(!l&&(n.nodeName!=="INPUT"||n.type!=="hidden"))break}else if(l){if(!n[Ja])switch(t){case"meta":if(!n.hasAttribute("itemprop"))break;return n;case"link":if(a=n.getAttribute("rel"),a==="stylesheet"&&n.hasAttribute("data-precedence"))break;if(a!==r.rel||n.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||n.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||n.getAttribute("title")!==(r.title==null?null:r.title))break;return n;case"style":if(n.hasAttribute("data-precedence"))break;return n;case"script":if(a=n.getAttribute("src"),(a!==(r.src==null?null:r.src)||n.getAttribute("type")!==(r.type==null?null:r.type)||n.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&a&&n.hasAttribute("async")&&!n.hasAttribute("itemprop"))break;return n;default:return n}}else if(t==="input"&&n.type==="hidden"){var a=r.name==null?null:""+r.name;if(r.type==="hidden"&&n.getAttribute("name")===a)return n}else return n;if(n=Un(n.nextSibling),n===null)break}return null}function E1(n,t,e){if(t==="")return null;for(;n.nodeType!==3;)if((n.nodeType!==1||n.nodeName!=="INPUT"||n.type!=="hidden")&&!e||(n=Un(n.nextSibling),n===null))return null;return n}function x0(n,t){for(;n.nodeType!==8;)if((n.nodeType!==1||n.nodeName!=="INPUT"||n.type!=="hidden")&&!t||(n=Un(n.nextSibling),n===null))return null;return n}function jo(n){return n.data==="$?"||n.data==="$~"}function Lo(n){return n.data==="$!"||n.data==="$?"&&n.ownerDocument.readyState!=="loading"}function z1(n,t){var e=n.ownerDocument;if(n.data==="$~")n._reactRetry=t;else if(n.data!=="$?"||e.readyState!=="loading")t();else{var l=function(){t(),e.removeEventListener("DOMContentLoaded",l)};e.addEventListener("DOMContentLoaded",l),n._reactRetry=l}}function Un(n){for(;n!=null;n=n.nextSibling){var t=n.nodeType;if(t===1||t===3)break;if(t===8){if(t=n.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return n}var Yo=null;function $f(n){n=n.nextSibling;for(var t=0;n;){if(n.nodeType===8){var e=n.data;if(e==="/$"||e==="/&"){if(t===0)return Un(n.nextSibling);t--}else e!=="$"&&e!=="$!"&&e!=="$?"&&e!=="$~"&&e!=="&"||t++}n=n.nextSibling}return null}function Wf(n){n=n.previousSibling;for(var t=0;n;){if(n.nodeType===8){var e=n.data;if(e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"){if(t===0)return n;t--}else e!=="/$"&&e!=="/&"||t++}n=n.previousSibling}return null}function E0(n,t,e){switch(t=hi(e),n){case"html":if(n=t.documentElement,!n)throw Error(z(452));return n;case"head":if(n=t.head,!n)throw Error(z(453));return n;case"body":if(n=t.body,!n)throw Error(z(454));return n;default:throw Error(z(451))}}function ga(n){for(var t=n.attributes;t.length;)n.removeAttributeNode(t[0]);ms(n)}var Nn=new Map,Ff=new Set;function pi(n){return typeof n.getRootNode=="function"?n.getRootNode():n.nodeType===9?n:n.ownerDocument}var Te=V.d;V.d={f:A1,r:D1,D:O1,C:R1,L:M1,m:C1,X:U1,S:k1,M:N1};function A1(){var n=Te.f(),t=Gi();return n||t}function D1(n){var t=Rr(n);t!==null&&t.tag===5&&t.type==="form"?bg(t):Te.r(n)}var Ur=typeof document>"u"?null:document;function z0(n,t,e){var l=Ur;if(l&&typeof t=="string"&&t){var r=Dn(t);r='link[rel="'+n+'"][href="'+r+'"]',typeof e=="string"&&(r+='[crossorigin="'+e+'"]'),Ff.has(r)||(Ff.add(r),n={rel:n,crossOrigin:e,href:t},l.querySelector(r)===null&&(t=l.createElement("link"),wt(t,"link",n),Dt(t),l.head.appendChild(t)))}}function O1(n){Te.D(n),z0("dns-prefetch",n,null)}function R1(n,t){Te.C(n,t),z0("preconnect",n,t)}function M1(n,t,e){Te.L(n,t,e);var l=Ur;if(l&&n&&t){var r='link[rel="preload"][as="'+Dn(t)+'"]';t==="image"&&e&&e.imageSrcSet?(r+='[imagesrcset="'+Dn(e.imageSrcSet)+'"]',typeof e.imageSizes=="string"&&(r+='[imagesizes="'+Dn(e.imageSizes)+'"]')):r+='[href="'+Dn(n)+'"]';var a=r;switch(t){case"style":a=Sr(n);break;case"script":a=Nr(n)}Nn.has(a)||(n=dt({rel:"preload",href:t==="image"&&e&&e.imageSrcSet?void 0:n,as:t},e),Nn.set(a,n),l.querySelector(r)!==null||t==="style"&&l.querySelector(td(a))||t==="script"&&l.querySelector(nd(a))||(t=l.createElement("link"),wt(t,"link",n),Dt(t),l.head.appendChild(t)))}}function C1(n,t){Te.m(n,t);var e=Ur;if(e&&n){var l=t&&typeof t.as=="string"?t.as:"script",r='link[rel="modulepreload"][as="'+Dn(l)+'"][href="'+Dn(n)+'"]',a=r;switch(l){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":a=Nr(n)}if(!Nn.has(a)&&(n=dt({rel:"modulepreload",href:n},t),Nn.set(a,n),e.querySelector(r)===null)){switch(l){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(e.querySelector(nd(a)))return}l=e.createElement("link"),wt(l,"link",n),Dt(l),e.head.appendChild(l)}}}function k1(n,t,e){Te.S(n,t,e);var l=Ur;if(l&&n){var r=er(l).hoistableStyles,a=Sr(n);t=t||"default";var d=r.get(a);if(!d){var i={loading:0,preload:null};if(d=l.querySelector(td(a)))i.loading=5;else{n=dt({rel:"stylesheet",href:n,"data-precedence":t},e),(e=Nn.get(a))&&nc(n,e);var u=d=l.createElement("link");Dt(u),wt(u,"link",n),u._p=new Promise(function(o,s){u.onload=o,u.onerror=s}),u.addEventListener("load",function(){i.loading|=1}),u.addEventListener("error",function(){i.loading|=2}),i.loading|=4,Ud(d,t,l)}d={type:"stylesheet",instance:d,count:1,state:i},r.set(a,d)}}}function U1(n,t){Te.X(n,t);var e=Ur;if(e&&n){var l=er(e).hoistableScripts,r=Nr(n),a=l.get(r);a||(a=e.querySelector(nd(r)),a||(n=dt({src:n,async:!0},t),(t=Nn.get(r))&&ec(n,t),a=e.createElement("script"),Dt(a),wt(a,"link",n),e.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},l.set(r,a))}}function N1(n,t){Te.M(n,t);var e=Ur;if(e&&n){var l=er(e).hoistableScripts,r=Nr(n),a=l.get(r);a||(a=e.querySelector(nd(r)),a||(n=dt({src:n,async:!0,type:"module"},t),(t=Nn.get(r))&&ec(n,t),a=e.createElement("script"),Dt(a),wt(a,"link",n),e.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},l.set(r,a))}}function Pf(n,t,e,l){var r=(r=je.current)?pi(r):null;if(!r)throw Error(z(446));switch(n){case"meta":case"title":return null;case"style":return typeof e.precedence=="string"&&typeof e.href=="string"?(t=Sr(e.href),e=er(r).hoistableStyles,l=e.get(t),l||(l={type:"style",instance:null,count:0,state:null},e.set(t,l)),l):{type:"void",instance:null,count:0,state:null};case"link":if(e.rel==="stylesheet"&&typeof e.href=="string"&&typeof e.precedence=="string"){n=Sr(e.href);var a=er(r).hoistableStyles,d=a.get(n);if(d||(r=r.ownerDocument||r,d={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},a.set(n,d),(a=r.querySelector(td(n)))&&!a._p&&(d.instance=a,d.state.loading=5),Nn.has(n)||(e={rel:"preload",as:"style",href:e.href,crossOrigin:e.crossOrigin,integrity:e.integrity,media:e.media,hrefLang:e.hrefLang,referrerPolicy:e.referrerPolicy},Nn.set(n,e),a||w1(r,n,e,d.state))),t&&l===null)throw Error(z(528,""));return d}if(t&&l!==null)throw Error(z(529,""));return null;case"script":return t=e.async,e=e.src,typeof e=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(t=Nr(e),e=er(r).hoistableScripts,l=e.get(t),l||(l={type:"script",instance:null,count:0,state:null},e.set(t,l)),l):{type:"void",instance:null,count:0,state:null};default:throw Error(z(444,n))}}function Sr(n){return'href="'+Dn(n)+'"'}function td(n){return'link[rel="stylesheet"]['+n+"]"}function A0(n){return dt({},n,{"data-precedence":n.precedence,precedence:null})}function w1(n,t,e,l){n.querySelector('link[rel="preload"][as="style"]['+t+"]")?l.loading=1:(t=n.createElement("link"),l.preload=t,t.addEventListener("load",function(){return l.loading|=1}),t.addEventListener("error",function(){return l.loading|=2}),wt(t,"link",e),Dt(t),n.head.appendChild(t))}function Nr(n){return'[src="'+Dn(n)+'"]'}function nd(n){return"script[async]"+n}function If(n,t,e){if(t.count++,t.instance===null)switch(t.type){case"style":var l=n.querySelector('style[data-href~="'+Dn(e.href)+'"]');if(l)return t.instance=l,Dt(l),l;var r=dt({},e,{"data-href":e.href,"data-precedence":e.precedence,href:null,precedence:null});return l=(n.ownerDocument||n).createElement("style"),Dt(l),wt(l,"style",r),Ud(l,e.precedence,n),t.instance=l;case"stylesheet":r=Sr(e.href);var a=n.querySelector(td(r));if(a)return t.state.loading|=4,t.instance=a,Dt(a),a;l=A0(e),(r=Nn.get(r))&&nc(l,r),a=(n.ownerDocument||n).createElement("link"),Dt(a);var d=a;return d._p=new Promise(function(i,u){d.onload=i,d.onerror=u}),wt(a,"link",l),t.state.loading|=4,Ud(a,e.precedence,n),t.instance=a;case"script":return a=Nr(e.src),(r=n.querySelector(nd(a)))?(t.instance=r,Dt(r),r):(l=e,(r=Nn.get(a))&&(l=dt({},e),ec(l,r)),n=n.ownerDocument||n,r=n.createElement("script"),Dt(r),wt(r,"link",l),n.head.appendChild(r),t.instance=r);case"void":return null;default:throw Error(z(443,t.type))}else t.type==="stylesheet"&&!(t.state.loading&4)&&(l=t.instance,t.state.loading|=4,Ud(l,e.precedence,n));return t.instance}function Ud(n,t,e){for(var l=e.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=l.length?l[l.length-1]:null,a=r,d=0;d<l.length;d++){var i=l[d];if(i.dataset.precedence===t)a=i;else if(a!==r)break}a?a.parentNode.insertBefore(n,a.nextSibling):(t=e.nodeType===9?e.head:e,t.insertBefore(n,t.firstChild))}function nc(n,t){n.crossOrigin==null&&(n.crossOrigin=t.crossOrigin),n.referrerPolicy==null&&(n.referrerPolicy=t.referrerPolicy),n.title==null&&(n.title=t.title)}function ec(n,t){n.crossOrigin==null&&(n.crossOrigin=t.crossOrigin),n.referrerPolicy==null&&(n.referrerPolicy=t.referrerPolicy),n.integrity==null&&(n.integrity=t.integrity)}var Nd=null;function th(n,t,e){if(Nd===null){var l=new Map,r=Nd=new Map;r.set(e,l)}else r=Nd,l=r.get(e),l||(l=new Map,r.set(e,l));if(l.has(n))return l;for(l.set(n,null),e=e.getElementsByTagName(n),r=0;r<e.length;r++){var a=e[r];if(!(a[Ja]||a[kt]||n==="link"&&a.getAttribute("rel")==="stylesheet")&&a.namespaceURI!=="http://www.w3.org/2000/svg"){var d=a.getAttribute(t)||"";d=n+d;var i=l.get(d);i?i.push(a):l.set(d,[a])}}return l}function nh(n,t,e){n=n.ownerDocument||n,n.head.insertBefore(e,t==="title"?n.querySelector("head > title"):null)}function B1(n,t,e){if(e===1||t.itemProp!=null)return!1;switch(n){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;switch(t.rel){case"stylesheet":return n=t.disabled,typeof t.precedence=="string"&&n==null;default:return!0}case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function D0(n){return!(n.type==="stylesheet"&&!(n.state.loading&3))}function H1(n,t,e,l){if(e.type==="stylesheet"&&(typeof l.media!="string"||matchMedia(l.media).matches!==!1)&&!(e.state.loading&4)){if(e.instance===null){var r=Sr(l.href),a=t.querySelector(td(r));if(a){t=a._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(n.count++,n=gi.bind(n),t.then(n,n)),e.state.loading|=4,e.instance=a,Dt(a);return}a=t.ownerDocument||t,l=A0(l),(r=Nn.get(r))&&nc(l,r),a=a.createElement("link"),Dt(a);var d=a;d._p=new Promise(function(i,u){d.onload=i,d.onerror=u}),wt(a,"link",l),e.instance=a}n.stylesheets===null&&(n.stylesheets=new Map),n.stylesheets.set(e,t),(t=e.state.preload)&&!(e.state.loading&3)&&(n.count++,e=gi.bind(n),t.addEventListener("load",e),t.addEventListener("error",e))}}var Nu=0;function j1(n,t){return n.stylesheets&&n.count===0&&wd(n,n.stylesheets),0<n.count||0<n.imgCount?function(e){var l=setTimeout(function(){if(n.stylesheets&&wd(n,n.stylesheets),n.unsuspend){var a=n.unsuspend;n.unsuspend=null,a()}},6e4+t);0<n.imgBytes&&Nu===0&&(Nu=62500*_1());var r=setTimeout(function(){if(n.waitingForImages=!1,n.count===0&&(n.stylesheets&&wd(n,n.stylesheets),n.unsuspend)){var a=n.unsuspend;n.unsuspend=null,a()}},(n.imgBytes>Nu?50:800)+t);return n.unsuspend=e,function(){n.unsuspend=null,clearTimeout(l),clearTimeout(r)}}:null}function gi(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)wd(this,this.stylesheets);else if(this.unsuspend){var n=this.unsuspend;this.unsuspend=null,n()}}}var mi=null;function wd(n,t){n.stylesheets=null,n.unsuspend!==null&&(n.count++,mi=new Map,t.forEach(L1,n),mi=null,gi.call(n))}function L1(n,t){if(!(t.state.loading&4)){var e=mi.get(n);if(e)var l=e.get(null);else{e=new Map,mi.set(n,e);for(var r=n.querySelectorAll("link[data-precedence],style[data-precedence]"),a=0;a<r.length;a++){var d=r[a];(d.nodeName==="LINK"||d.getAttribute("media")!=="not all")&&(e.set(d.dataset.precedence,d),l=d)}l&&e.set(null,l)}r=t.instance,d=r.getAttribute("data-precedence"),a=e.get(d)||l,a===l&&e.set(null,r),e.set(d,r),this.count++,l=gi.bind(this),r.addEventListener("load",l),r.addEventListener("error",l),a?a.parentNode.insertBefore(r,a.nextSibling):(n=n.nodeType===9?n.head:n,n.insertBefore(r,n.firstChild)),t.state.loading|=4}}var Ma={$$typeof:oe,Provider:null,Consumer:null,_currentValue:gl,_currentValue2:gl,_threadCount:0};function Y1(n,t,e,l,r,a,d,i,u){this.tag=1,this.containerInfo=n,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=ru(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=ru(0),this.hiddenUpdates=ru(null),this.identifierPrefix=l,this.onUncaughtError=r,this.onCaughtError=a,this.onRecoverableError=d,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=u,this.incompleteTransitions=new Map}function O0(n,t,e,l,r,a,d,i,u,o,s,c){return n=new Y1(n,t,e,d,u,o,s,c,i),t=1,a===!0&&(t|=24),a=an(3,null,null,t),n.current=a,a.stateNode=n,t=Ds(),t.refCount++,n.pooledCache=t,t.refCount++,a.memoizedState={element:l,isDehydrated:e,cache:t},Ms(a),n}function R0(n){return n?(n=Wl,n):Wl}function M0(n,t,e,l,r,a){r=R0(r),l.context===null?l.context=r:l.pendingContext=r,l=Ye(t),l.payload={element:e},a=a===void 0?null:a,a!==null&&(l.callback=a),e=Xe(n,l,t),e!==null&&(Jt(e,n,t),ia(e,n,t))}function eh(n,t){if(n=n.memoizedState,n!==null&&n.dehydrated!==null){var e=n.retryLane;n.retryLane=e!==0&&e<t?e:t}}function lc(n,t){eh(n,t),(n=n.alternate)&&eh(n,t)}function C0(n){if(n.tag===13||n.tag===31){var t=Cl(n,67108864);t!==null&&Jt(t,n,67108864),lc(n,67108864)}}function lh(n){if(n.tag===13||n.tag===31){var t=pn();t=ps(t);var e=Cl(n,t);e!==null&&Jt(e,n,t),lc(n,t)}}var yi=!0;function X1(n,t,e,l){var r=k.T;k.T=null;var a=V.p;try{V.p=2,rc(n,t,e,l)}finally{V.p=a,k.T=r}}function G1(n,t,e,l){var r=k.T;k.T=null;var a=V.p;try{V.p=8,rc(n,t,e,l)}finally{V.p=a,k.T=r}}function rc(n,t,e,l){if(yi){var r=Xo(l);if(r===null)ku(n,t,l,bi,e),rh(n,l);else if(V1(r,n,t,e,l))l.stopPropagation();else if(rh(n,l),t&4&&-1<Q1.indexOf(n)){for(;r!==null;){var a=Rr(r);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var d=sl(a.pendingLanes);if(d!==0){var i=a;for(i.pendingLanes|=2,i.entangledLanes|=2;d;){var u=1<<31-hn(d);i.entanglements[1]|=u,d&=~u}Pn(a),!(Q&6)&&(ii=cn()+500,Ia(0))}}break;case 31:case 13:i=Cl(a,2),i!==null&&Jt(i,a,2),Gi(),lc(a,2)}if(a=Xo(l),a===null&&ku(n,t,l,bi,e),a===r)break;r=a}r!==null&&l.stopPropagation()}else ku(n,t,l,null,e)}}function Xo(n){return n=bs(n),ac(n)}var bi=null;function ac(n){if(bi=null,n=Ql(n),n!==null){var t=Qa(n);if(t===null)n=null;else{var e=t.tag;if(e===13){if(n=Ph(t),n!==null)return n;n=null}else if(e===31){if(n=Ih(t),n!==null)return n;n=null}else if(e===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;n=null}else t!==n&&(n=null)}}return bi=n,null}function k0(n){switch(n){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(Oy()){case lp:return 2;case rp:return 8;case Kd:case Ry:return 32;case ap:return 268435456;default:return 32}default:return 32}}var Go=!1,Ve=null,Ze=null,Ke=null,Ca=new Map,ka=new Map,Re=[],Q1="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function rh(n,t){switch(n){case"focusin":case"focusout":Ve=null;break;case"dragenter":case"dragleave":Ze=null;break;case"mouseover":case"mouseout":Ke=null;break;case"pointerover":case"pointerout":Ca.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":ka.delete(t.pointerId)}}function Vr(n,t,e,l,r,a){return n===null||n.nativeEvent!==a?(n={blockedOn:t,domEventName:e,eventSystemFlags:l,nativeEvent:a,targetContainers:[r]},t!==null&&(t=Rr(t),t!==null&&C0(t)),n):(n.eventSystemFlags|=l,t=n.targetContainers,r!==null&&t.indexOf(r)===-1&&t.push(r),n)}function V1(n,t,e,l,r){switch(t){case"focusin":return Ve=Vr(Ve,n,t,e,l,r),!0;case"dragenter":return Ze=Vr(Ze,n,t,e,l,r),!0;case"mouseover":return Ke=Vr(Ke,n,t,e,l,r),!0;case"pointerover":var a=r.pointerId;return Ca.set(a,Vr(Ca.get(a)||null,n,t,e,l,r)),!0;case"gotpointercapture":return a=r.pointerId,ka.set(a,Vr(ka.get(a)||null,n,t,e,l,r)),!0}return!1}function U0(n){var t=Ql(n.target);if(t!==null){var e=Qa(t);if(e!==null){if(t=e.tag,t===13){if(t=Ph(e),t!==null){n.blockedOn=t,Yc(n.priority,function(){lh(e)});return}}else if(t===31){if(t=Ih(e),t!==null){n.blockedOn=t,Yc(n.priority,function(){lh(e)});return}}else if(t===3&&e.stateNode.current.memoizedState.isDehydrated){n.blockedOn=e.tag===3?e.stateNode.containerInfo:null;return}}}n.blockedOn=null}function Bd(n){if(n.blockedOn!==null)return!1;for(var t=n.targetContainers;0<t.length;){var e=Xo(n.nativeEvent);if(e===null){e=n.nativeEvent;var l=new e.constructor(e.type,e);io=l,e.target.dispatchEvent(l),io=null}else return t=Rr(e),t!==null&&C0(t),n.blockedOn=e,!1;t.shift()}return!0}function ah(n,t,e){Bd(n)&&e.delete(t)}function Z1(){Go=!1,Ve!==null&&Bd(Ve)&&(Ve=null),Ze!==null&&Bd(Ze)&&(Ze=null),Ke!==null&&Bd(Ke)&&(Ke=null),Ca.forEach(ah),ka.forEach(ah)}function bd(n,t){n.blockedOn===t&&(n.blockedOn=null,Go||(Go=!0,zt.unstable_scheduleCallback(zt.unstable_NormalPriority,Z1)))}var _d=null;function dh(n){_d!==n&&(_d=n,zt.unstable_scheduleCallback(zt.unstable_NormalPriority,function(){_d===n&&(_d=null);for(var t=0;t<n.length;t+=3){var e=n[t],l=n[t+1],r=n[t+2];if(typeof l!="function"){if(ac(l||e)===null)continue;break}var a=Rr(e);a!==null&&(n.splice(t,3),t-=3,To(a,{pending:!0,data:r,method:e.method,action:l},l,r))}}))}function qr(n){function t(u){return bd(u,n)}Ve!==null&&bd(Ve,n),Ze!==null&&bd(Ze,n),Ke!==null&&bd(Ke,n),Ca.forEach(t),ka.forEach(t);for(var e=0;e<Re.length;e++){var l=Re[e];l.blockedOn===n&&(l.blockedOn=null)}for(;0<Re.length&&(e=Re[0],e.blockedOn===null);)U0(e),e.blockedOn===null&&Re.shift();if(e=(n.ownerDocument||n).$$reactFormReplay,e!=null)for(l=0;l<e.length;l+=3){var r=e[l],a=e[l+1],d=r[It]||null;if(typeof a=="function")d||dh(e);else if(d){var i=null;if(a&&a.hasAttribute("formAction")){if(r=a,d=a[It]||null)i=d.formAction;else if(ac(r)!==null)continue}else i=d.action;typeof i=="function"?e[l+1]=i:(e.splice(l,3),l-=3),dh(e)}}}function N0(){function n(a){a.canIntercept&&a.info==="react-transition"&&a.intercept({handler:function(){return new Promise(function(d){return r=d})},focusReset:"manual",scroll:"manual"})}function t(){r!==null&&(r(),r=null),l||setTimeout(e,20)}function e(){if(!l&&!navigation.transition){var a=navigation.currentEntry;a&&a.url!=null&&navigation.navigate(a.url,{state:a.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var l=!1,r=null;return navigation.addEventListener("navigate",n),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(e,100),function(){l=!0,navigation.removeEventListener("navigate",n),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),r!==null&&(r(),r=null)}}}function dc(n){this._internalRoot=n}Zi.prototype.render=dc.prototype.render=function(n){var t=this._internalRoot;if(t===null)throw Error(z(409));var e=t.current,l=pn();M0(e,l,n,t,null,null)};Zi.prototype.unmount=dc.prototype.unmount=function(){var n=this._internalRoot;if(n!==null){this._internalRoot=null;var t=n.containerInfo;M0(n.current,2,null,n,null,null),Gi(),t[Or]=null}};function Zi(n){this._internalRoot=n}Zi.prototype.unstable_scheduleHydration=function(n){if(n){var t=sp();n={blockedOn:null,target:n,priority:t};for(var e=0;e<Re.length&&t!==0&&t<Re[e].priority;e++);Re.splice(e,0,n),e===0&&U0(n)}};var ih=Wh.version;if(ih!=="19.2.6")throw Error(z(527,ih,"19.2.6"));V.findDOMNode=function(n){var t=n._reactInternals;if(t===void 0)throw typeof n.render=="function"?Error(z(188)):(n=Object.keys(n).join(","),Error(z(268,n)));return n=qy(t),n=n!==null?tp(n):null,n=n===null?null:n.stateNode,n};var K1={bundleType:0,version:"19.2.6",rendererPackageName:"react-dom",currentDispatcherRef:k,reconcilerVersion:"19.2.6"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var vd=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!vd.isDisabled&&vd.supportsFiber)try{Va=vd.inject(K1),fn=vd}catch{}}Oi.createRoot=function(n,t){if(!Fh(n))throw Error(z(299));var e=!1,l="",r=zg,a=Ag,d=Dg;return t!=null&&(t.unstable_strictMode===!0&&(e=!0),t.identifierPrefix!==void 0&&(l=t.identifierPrefix),t.onUncaughtError!==void 0&&(r=t.onUncaughtError),t.onCaughtError!==void 0&&(a=t.onCaughtError),t.onRecoverableError!==void 0&&(d=t.onRecoverableError)),t=O0(n,1,!1,null,null,e,l,null,r,a,d,N0),n[Or]=t.current,tc(n),new dc(t)};Oi.hydrateRoot=function(n,t,e){if(!Fh(n))throw Error(z(299));var l=!1,r="",a=zg,d=Ag,i=Dg,u=null;return e!=null&&(e.unstable_strictMode===!0&&(l=!0),e.identifierPrefix!==void 0&&(r=e.identifierPrefix),e.onUncaughtError!==void 0&&(a=e.onUncaughtError),e.onCaughtError!==void 0&&(d=e.onCaughtError),e.onRecoverableError!==void 0&&(i=e.onRecoverableError),e.formState!==void 0&&(u=e.formState)),t=O0(n,1,!0,t,e??null,l,r,u,a,d,i,N0),t.context=R0(null),e=t.current,l=pn(),l=ps(l),r=Ye(l),r.callback=null,Xe(e,r,l),e=l,t.current.lanes=e,Ka(t,e),Pn(t),n[Or]=t.current,tc(n),new Zi(t)};Oi.version="19.2.6";function w0(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(w0)}catch(n){console.error(n)}}w0(),Qh.exports=Oi;var J1=Qh.exports;const $1=kh(J1);/**
 * react-router v7.15.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */var uh="popstate";function oh(n){return typeof n=="object"&&n!=null&&"pathname"in n&&"search"in n&&"hash"in n&&"state"in n&&"key"in n}function W1(n={}){function t(l,r){var o;let a=(o=r.state)==null?void 0:o.masked,{pathname:d,search:i,hash:u}=a||l.location;return Qo("",{pathname:d,search:i,hash:u},r.state&&r.state.usr||null,r.state&&r.state.key||"default",a?{pathname:l.location.pathname,search:l.location.search,hash:l.location.hash}:void 0)}function e(l,r){return typeof r=="string"?r:Ua(r)}return P1(t,e,null,n)}function st(n,t){if(n===!1||n===null||typeof n>"u")throw new Error(t)}function jn(n,t){if(!n){typeof console<"u"&&console.warn(t);try{throw new Error(t)}catch{}}}function F1(){return Math.random().toString(36).substring(2,10)}function sh(n,t){return{usr:n.state,key:n.key,idx:t,masked:n.mask?{pathname:n.pathname,search:n.search,hash:n.hash}:void 0}}function Qo(n,t,e=null,l,r){return{pathname:typeof n=="string"?n:n.pathname,search:"",hash:"",...typeof t=="string"?wr(t):t,state:e,key:t&&t.key||l||F1(),mask:r}}function Ua({pathname:n="/",search:t="",hash:e=""}){return t&&t!=="?"&&(n+=t.charAt(0)==="?"?t:"?"+t),e&&e!=="#"&&(n+=e.charAt(0)==="#"?e:"#"+e),n}function wr(n){let t={};if(n){let e=n.indexOf("#");e>=0&&(t.hash=n.substring(e),n=n.substring(0,e));let l=n.indexOf("?");l>=0&&(t.search=n.substring(l),n=n.substring(0,l)),n&&(t.pathname=n)}return t}function P1(n,t,e,l={}){let{window:r=document.defaultView,v5Compat:a=!1}=l,d=r.history,i="POP",u=null,o=s();o==null&&(o=0,d.replaceState({...d.state,idx:o},""));function s(){return(d.state||{idx:null}).idx}function c(){i="POP";let v=s(),g=v==null?null:v-o;o=v,u&&u({action:i,location:m.location,delta:g})}function f(v,g){i="PUSH";let p=oh(v)?v:Qo(m.location,v,g);o=s()+1;let y=sh(p,o),_=m.createHref(p.mask||p);try{d.pushState(y,"",_)}catch(S){if(S instanceof DOMException&&S.name==="DataCloneError")throw S;r.location.assign(_)}a&&u&&u({action:i,location:m.location,delta:1})}function h(v,g){i="REPLACE";let p=oh(v)?v:Qo(m.location,v,g);o=s();let y=sh(p,o),_=m.createHref(p.mask||p);d.replaceState(y,"",_),a&&u&&u({action:i,location:m.location,delta:0})}function b(v){return I1(v)}let m={get action(){return i},get location(){return n(r,d)},listen(v){if(u)throw new Error("A history only accepts one active listener");return r.addEventListener(uh,c),u=v,()=>{r.removeEventListener(uh,c),u=null}},createHref(v){return t(r,v)},createURL:b,encodeLocation(v){let g=b(v);return{pathname:g.pathname,search:g.search,hash:g.hash}},push:f,replace:h,go(v){return d.go(v)}};return m}function I1(n,t=!1){let e="http://localhost";typeof window<"u"&&(e=window.location.origin!=="null"?window.location.origin:window.location.href),st(e,"No window.location.(origin|href) available to create URL");let l=typeof n=="string"?n:Ua(n);return l=l.replace(/ $/,"%20"),!t&&l.startsWith("//")&&(l=e+l),new URL(l,e)}function B0(n,t,e="/"){return t_(n,t,e,!1)}function t_(n,t,e,l,r){let a=typeof t=="string"?wr(t):t,d=ve(a.pathname||"/",e);if(d==null)return null;let i=n_(n),u=null,o=h_(d);for(let s=0;u==null&&s<i.length;++s)u=c_(i[s],o,l);return u}function n_(n){let t=H0(n);return e_(t),t}function H0(n,t=[],e=[],l="",r=!1){let a=(d,i,u=r,o)=>{let s={relativePath:o===void 0?d.path||"":o,caseSensitive:d.caseSensitive===!0,childrenIndex:i,route:d};if(s.relativePath.startsWith("/")){if(!s.relativePath.startsWith(l)&&u)return;st(s.relativePath.startsWith(l),`Absolute route path "${s.relativePath}" nested under path "${l}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`),s.relativePath=s.relativePath.slice(l.length)}let c=Hn([l,s.relativePath]),f=e.concat(s);d.children&&d.children.length>0&&(st(d.index!==!0,`Index routes must not have child routes. Please remove all child routes from route path "${c}".`),H0(d.children,t,f,c,u)),!(d.path==null&&!d.index)&&t.push({path:c,score:o_(c,d.index),routesMeta:f})};return n.forEach((d,i)=>{var u;if(d.path===""||!((u=d.path)!=null&&u.includes("?")))a(d,i);else for(let o of j0(d.path))a(d,i,!0,o)}),t}function j0(n){let t=n.split("/");if(t.length===0)return[];let[e,...l]=t,r=e.endsWith("?"),a=e.replace(/\?$/,"");if(l.length===0)return r?[a,""]:[a];let d=j0(l.join("/")),i=[];return i.push(...d.map(u=>u===""?a:[a,u].join("/"))),r&&i.push(...d),i.map(u=>n.startsWith("/")&&u===""?"/":u)}function e_(n){n.sort((t,e)=>t.score!==e.score?e.score-t.score:s_(t.routesMeta.map(l=>l.childrenIndex),e.routesMeta.map(l=>l.childrenIndex)))}var l_=/^:[\w-]+$/,r_=3,a_=2,d_=1,i_=10,u_=-2,ch=n=>n==="*";function o_(n,t){let e=n.split("/"),l=e.length;return e.some(ch)&&(l+=u_),t&&(l+=a_),e.filter(r=>!ch(r)).reduce((r,a)=>r+(l_.test(a)?r_:a===""?d_:i_),l)}function s_(n,t){return n.length===t.length&&n.slice(0,-1).every((l,r)=>l===t[r])?n[n.length-1]-t[t.length-1]:0}function c_(n,t,e=!1){let{routesMeta:l}=n,r={},a="/",d=[];for(let i=0;i<l.length;++i){let u=l[i],o=i===l.length-1,s=a==="/"?t:t.slice(a.length)||"/",c=_i({path:u.relativePath,caseSensitive:u.caseSensitive,end:o},s),f=u.route;if(!c&&o&&e&&!l[l.length-1].route.index&&(c=_i({path:u.relativePath,caseSensitive:u.caseSensitive,end:!1},s)),!c)return null;Object.assign(r,c.params),d.push({params:r,pathname:Hn([a,c.pathname]),pathnameBase:y_(Hn([a,c.pathnameBase])),route:f}),c.pathnameBase!=="/"&&(a=Hn([a,c.pathnameBase]))}return d}function _i(n,t){typeof n=="string"&&(n={path:n,caseSensitive:!1,end:!0});let[e,l]=f_(n.path,n.caseSensitive,n.end),r=t.match(e);if(!r)return null;let a=r[0],d=a.replace(/(.)\/+$/,"$1"),i=r.slice(1);return{params:l.reduce((o,{paramName:s,isOptional:c},f)=>{if(s==="*"){let b=i[f]||"";d=a.slice(0,a.length-b.length).replace(/(.)\/+$/,"$1")}const h=i[f];return c&&!h?o[s]=void 0:o[s]=(h||"").replace(/%2F/g,"/"),o},{}),pathname:a,pathnameBase:d,pattern:n}}function f_(n,t=!1,e=!0){jn(n==="*"||!n.endsWith("*")||n.endsWith("/*"),`Route path "${n}" will be treated as if it were "${n.replace(/\*$/,"/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${n.replace(/\*$/,"/*")}".`);let l=[],r="^"+n.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^${}|()[\]]/g,"\\$&").replace(/\/:([\w-]+)(\?)?/g,(d,i,u,o,s)=>{if(l.push({paramName:i,isOptional:u!=null}),u){let c=s.charAt(o+d.length);return c&&c!=="/"?"/([^\\/]*)":"(?:/([^\\/]*))?"}return"/([^\\/]+)"}).replace(/\/([\w-]+)\?(\/|$)/g,"(/$1)?$2");return n.endsWith("*")?(l.push({paramName:"*"}),r+=n==="*"||n==="/*"?"(.*)$":"(?:\\/(.+)|\\/*)$"):e?r+="\\/*$":n!==""&&n!=="/"&&(r+="(?:(?=\\/|$))"),[new RegExp(r,t?void 0:"i"),l]}function h_(n){try{return n.split("/").map(t=>decodeURIComponent(t).replace(/\//g,"%2F")).join("/")}catch(t){return jn(!1,`The URL path "${n}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${t}).`),n}}function ve(n,t){if(t==="/")return n;if(!n.toLowerCase().startsWith(t.toLowerCase()))return null;let e=t.endsWith("/")?t.length-1:t.length,l=n.charAt(e);return l&&l!=="/"?null:n.slice(e)||"/"}var p_=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;function g_(n,t="/"){let{pathname:e,search:l="",hash:r=""}=typeof n=="string"?wr(n):n,a;return e?(e=L0(e),e.startsWith("/")?a=fh(e.substring(1),"/"):a=fh(e,t)):a=t,{pathname:a,search:b_(l),hash:__(r)}}function fh(n,t){let e=vi(t).split("/");return n.split("/").forEach(r=>{r===".."?e.length>1&&e.pop():r!=="."&&e.push(r)}),e.length>1?e.join("/"):"/"}function wu(n,t,e,l){return`Cannot include a '${n}' character in a manually specified \`to.${t}\` field [${JSON.stringify(l)}].  Please separate it out to the \`to.${e}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`}function m_(n){return n.filter((t,e)=>e===0||t.route.path&&t.route.path.length>0)}function ic(n){let t=m_(n);return t.map((e,l)=>l===t.length-1?e.pathname:e.pathnameBase)}function Ki(n,t,e,l=!1){let r;typeof n=="string"?r=wr(n):(r={...n},st(!r.pathname||!r.pathname.includes("?"),wu("?","pathname","search",r)),st(!r.pathname||!r.pathname.includes("#"),wu("#","pathname","hash",r)),st(!r.search||!r.search.includes("#"),wu("#","search","hash",r)));let a=n===""||r.pathname==="",d=a?"/":r.pathname,i;if(d==null)i=e;else{let c=t.length-1;if(!l&&d.startsWith("..")){let f=d.split("/");for(;f[0]==="..";)f.shift(),c-=1;r.pathname=f.join("/")}i=c>=0?t[c]:"/"}let u=g_(r,i),o=d&&d!=="/"&&d.endsWith("/"),s=(a||d===".")&&e.endsWith("/");return!u.pathname.endsWith("/")&&(o||s)&&(u.pathname+="/"),u}var L0=n=>n.replace(/\/\/+/g,"/"),Hn=n=>L0(n.join("/")),vi=n=>n.replace(/\/+$/,""),y_=n=>vi(n).replace(/^\/*/,"/"),b_=n=>!n||n==="?"?"":n.startsWith("?")?n:"?"+n,__=n=>!n||n==="#"?"":n.startsWith("#")?n:"#"+n,v_=class{constructor(n,t,e,l=!1){this.status=n,this.statusText=t||"",this.internal=l,e instanceof Error?(this.data=e.toString(),this.error=e):this.data=e}};function S_(n){return n!=null&&typeof n.status=="number"&&typeof n.statusText=="string"&&typeof n.internal=="boolean"&&"data"in n}function q_(n){let t=n.map(e=>e.route.path).filter(Boolean);return Hn(t)||"/"}var Y0=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u";function X0(n,t){let e=n;if(typeof e!="string"||!p_.test(e))return{absoluteURL:void 0,isExternal:!1,to:e};let l=e,r=!1;if(Y0)try{let a=new URL(window.location.href),d=e.startsWith("//")?new URL(a.protocol+e):new URL(e),i=ve(d.pathname,t);d.origin===a.origin&&i!=null?e=i+d.search+d.hash:r=!0}catch{jn(!1,`<Link to="${e}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`)}return{absoluteURL:l,isExternal:r,to:e}}Object.getOwnPropertyNames(Object.prototype).sort().join("\0");var G0=["POST","PUT","PATCH","DELETE"];new Set(G0);var T_=["GET",...G0];new Set(T_);var Br=T.createContext(null);Br.displayName="DataRouter";var Ji=T.createContext(null);Ji.displayName="DataRouterState";var Q0=T.createContext(!1);function x_(){return T.useContext(Q0)}var V0=T.createContext({isTransitioning:!1});V0.displayName="ViewTransition";var E_=T.createContext(new Map);E_.displayName="Fetchers";var z_=T.createContext(null);z_.displayName="Await";var vn=T.createContext(null);vn.displayName="Navigation";var ed=T.createContext(null);ed.displayName="Location";var Yn=T.createContext({outlet:null,matches:[],isDataRoute:!1});Yn.displayName="Route";var uc=T.createContext(null);uc.displayName="RouteError";var Z0="REACT_ROUTER_ERROR",A_="REDIRECT",D_="ROUTE_ERROR_RESPONSE";function O_(n){if(n.startsWith(`${Z0}:${A_}:{`))try{let t=JSON.parse(n.slice(28));if(typeof t=="object"&&t&&typeof t.status=="number"&&typeof t.statusText=="string"&&typeof t.location=="string"&&typeof t.reloadDocument=="boolean"&&typeof t.replace=="boolean")return t}catch{}}function R_(n){if(n.startsWith(`${Z0}:${D_}:{`))try{let t=JSON.parse(n.slice(40));if(typeof t=="object"&&t&&typeof t.status=="number"&&typeof t.statusText=="string")return new v_(t.status,t.statusText,t.data)}catch{}}function M_(n,{relative:t}={}){st(Hr(),"useHref() may be used only in the context of a <Router> component.");let{basename:e,navigator:l}=T.useContext(vn),{hash:r,pathname:a,search:d}=ld(n,{relative:t}),i=a;return e!=="/"&&(i=a==="/"?e:Hn([e,a])),l.createHref({pathname:i,search:d,hash:r})}function Hr(){return T.useContext(ed)!=null}function In(){return st(Hr(),"useLocation() may be used only in the context of a <Router> component."),T.useContext(ed).location}var K0="You should call navigate() in a React.useEffect(), not when your component is first rendered.";function J0(n){T.useContext(vn).static||T.useLayoutEffect(n)}function $0(){let{isDataRoute:n}=T.useContext(Yn);return n?V_():C_()}function C_(){st(Hr(),"useNavigate() may be used only in the context of a <Router> component.");let n=T.useContext(Br),{basename:t,navigator:e}=T.useContext(vn),{matches:l}=T.useContext(Yn),{pathname:r}=In(),a=JSON.stringify(ic(l)),d=T.useRef(!1);return J0(()=>{d.current=!0}),T.useCallback((u,o={})=>{if(jn(d.current,K0),!d.current)return;if(typeof u=="number"){e.go(u);return}let s=Ki(u,JSON.parse(a),r,o.relative==="path");n==null&&t!=="/"&&(s.pathname=s.pathname==="/"?t:Hn([t,s.pathname])),(o.replace?e.replace:e.push)(s,o.state,o)},[t,e,a,r,n])}T.createContext(null);function k_(){let{matches:n}=T.useContext(Yn),t=n[n.length-1];return(t==null?void 0:t.params)??{}}function ld(n,{relative:t}={}){let{matches:e}=T.useContext(Yn),{pathname:l}=In(),r=JSON.stringify(ic(e));return T.useMemo(()=>Ki(n,JSON.parse(r),l,t==="path"),[n,r,l,t])}function U_(n,t){return W0(n,t)}function W0(n,t,e){var v;st(Hr(),"useRoutes() may be used only in the context of a <Router> component.");let{navigator:l}=T.useContext(vn),{matches:r}=T.useContext(Yn),a=r[r.length-1],d=a?a.params:{},i=a?a.pathname:"/",u=a?a.pathnameBase:"/",o=a&&a.route;{let g=o&&o.path||"";P0(i,!o||g.endsWith("*")||g.endsWith("*?"),`You rendered descendant <Routes> (or called \`useRoutes()\`) at "${i}" (under <Route path="${g}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${g}"> to <Route path="${g==="/"?"*":`${g}/*`}">.`)}let s=In(),c;if(t){let g=typeof t=="string"?wr(t):t;st(u==="/"||((v=g.pathname)==null?void 0:v.startsWith(u)),`When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, the location pathname must begin with the portion of the URL pathname that was matched by all parent routes. The current pathname base is "${u}" but pathname "${g.pathname}" was given in the \`location\` prop.`),c=g}else c=s;let f=c.pathname||"/",h=f;if(u!=="/"){let g=u.replace(/^\//,"").split("/");h="/"+f.replace(/^\//,"").split("/").slice(g.length).join("/")}let b=e&&e.state.matches.length?e.state.matches.map(g=>Object.assign(g,{route:e.manifest[g.route.id]||g.route})):B0(n,{pathname:h});jn(o||b!=null,`No routes matched location "${c.pathname}${c.search}${c.hash}" `),jn(b==null||b[b.length-1].route.element!==void 0||b[b.length-1].route.Component!==void 0||b[b.length-1].route.lazy!==void 0,`Matched leaf route at location "${c.pathname}${c.search}${c.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`);let m=j_(b&&b.map(g=>Object.assign({},g,{params:Object.assign({},d,g.params),pathname:Hn([u,l.encodeLocation?l.encodeLocation(g.pathname.replace(/%/g,"%25").replace(/\?/g,"%3F").replace(/#/g,"%23")).pathname:g.pathname]),pathnameBase:g.pathnameBase==="/"?u:Hn([u,l.encodeLocation?l.encodeLocation(g.pathnameBase.replace(/%/g,"%25").replace(/\?/g,"%3F").replace(/#/g,"%23")).pathname:g.pathnameBase])})),r,e);return t&&m?T.createElement(ed.Provider,{value:{location:{pathname:"/",search:"",hash:"",state:null,key:"default",mask:void 0,...c},navigationType:"POP"}},m):m}function N_(){let n=Q_(),t=S_(n)?`${n.status} ${n.statusText}`:n instanceof Error?n.message:JSON.stringify(n),e=n instanceof Error?n.stack:null,l="rgba(200,200,200, 0.5)",r={padding:"0.5rem",backgroundColor:l},a={padding:"2px 4px",backgroundColor:l},d=null;return console.error("Error handled by React Router default ErrorBoundary:",n),d=T.createElement(T.Fragment,null,T.createElement("p",null,"💿 Hey developer 👋"),T.createElement("p",null,"You can provide a way better UX than this when your app throws errors by providing your own ",T.createElement("code",{style:a},"ErrorBoundary")," or"," ",T.createElement("code",{style:a},"errorElement")," prop on your route.")),T.createElement(T.Fragment,null,T.createElement("h2",null,"Unexpected Application Error!"),T.createElement("h3",{style:{fontStyle:"italic"}},t),e?T.createElement("pre",{style:r},e):null,d)}var w_=T.createElement(N_,null),F0=class extends T.Component{constructor(n){super(n),this.state={location:n.location,revalidation:n.revalidation,error:n.error}}static getDerivedStateFromError(n){return{error:n}}static getDerivedStateFromProps(n,t){return t.location!==n.location||t.revalidation!=="idle"&&n.revalidation==="idle"?{error:n.error,location:n.location,revalidation:n.revalidation}:{error:n.error!==void 0?n.error:t.error,location:t.location,revalidation:n.revalidation||t.revalidation}}componentDidCatch(n,t){this.props.onError?this.props.onError(n,t):console.error("React Router caught the following error during render",n)}render(){let n=this.state.error;if(this.context&&typeof n=="object"&&n&&"digest"in n&&typeof n.digest=="string"){const e=R_(n.digest);e&&(n=e)}let t=n!==void 0?T.createElement(Yn.Provider,{value:this.props.routeContext},T.createElement(uc.Provider,{value:n,children:this.props.component})):this.props.children;return this.context?T.createElement(B_,{error:n},t):t}};F0.contextType=Q0;var Bu=new WeakMap;function B_({children:n,error:t}){let{basename:e}=T.useContext(vn);if(typeof t=="object"&&t&&"digest"in t&&typeof t.digest=="string"){let l=O_(t.digest);if(l){let r=Bu.get(t);if(r)throw r;let a=X0(l.location,e);if(Y0&&!Bu.get(t))if(a.isExternal||l.reloadDocument)window.location.href=a.absoluteURL||a.to;else{const d=Promise.resolve().then(()=>window.__reactRouterDataRouter.navigate(a.to,{replace:l.replace}));throw Bu.set(t,d),d}return T.createElement("meta",{httpEquiv:"refresh",content:`0;url=${a.absoluteURL||a.to}`})}}return n}function H_({routeContext:n,match:t,children:e}){let l=T.useContext(Br);return l&&l.static&&l.staticContext&&(t.route.errorElement||t.route.ErrorBoundary)&&(l.staticContext._deepestRenderedBoundaryId=t.route.id),T.createElement(Yn.Provider,{value:n},e)}function j_(n,t=[],e){let l=e==null?void 0:e.state;if(n==null){if(!l)return null;if(l.errors)n=l.matches;else if(t.length===0&&!l.initialized&&l.matches.length>0)n=l.matches;else return null}let r=n,a=l==null?void 0:l.errors;if(a!=null){let s=r.findIndex(c=>c.route.id&&(a==null?void 0:a[c.route.id])!==void 0);st(s>=0,`Could not find a matching route for errors on route IDs: ${Object.keys(a).join(",")}`),r=r.slice(0,Math.min(r.length,s+1))}let d=!1,i=-1;if(e&&l){d=l.renderFallback;for(let s=0;s<r.length;s++){let c=r[s];if((c.route.HydrateFallback||c.route.hydrateFallbackElement)&&(i=s),c.route.id){let{loaderData:f,errors:h}=l,b=c.route.loader&&!f.hasOwnProperty(c.route.id)&&(!h||h[c.route.id]===void 0);if(c.route.lazy||b){e.isStatic&&(d=!0),i>=0?r=r.slice(0,i+1):r=[r[0]];break}}}}let u=e==null?void 0:e.onError,o=l&&u?(s,c)=>{var f,h;u(s,{location:l.location,params:((h=(f=l.matches)==null?void 0:f[0])==null?void 0:h.params)??{},pattern:q_(l.matches),errorInfo:c})}:void 0;return r.reduceRight((s,c,f)=>{let h,b=!1,m=null,v=null;l&&(h=a&&c.route.id?a[c.route.id]:void 0,m=c.route.errorElement||w_,d&&(i<0&&f===0?(P0("route-fallback",!1,"No `HydrateFallback` element provided to render during initial hydration"),b=!0,v=null):i===f&&(b=!0,v=c.route.hydrateFallbackElement||null)));let g=t.concat(r.slice(0,f+1)),p=()=>{let y;return h?y=m:b?y=v:c.route.Component?y=T.createElement(c.route.Component,null):c.route.element?y=c.route.element:y=s,T.createElement(H_,{match:c,routeContext:{outlet:s,matches:g,isDataRoute:l!=null},children:y})};return l&&(c.route.ErrorBoundary||c.route.errorElement||f===0)?T.createElement(F0,{location:l.location,revalidation:l.revalidation,component:m,error:h,children:p(),routeContext:{outlet:null,matches:g,isDataRoute:!0},onError:o}):p()},null)}function oc(n){return`${n} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`}function L_(n){let t=T.useContext(Br);return st(t,oc(n)),t}function Y_(n){let t=T.useContext(Ji);return st(t,oc(n)),t}function X_(n){let t=T.useContext(Yn);return st(t,oc(n)),t}function sc(n){let t=X_(n),e=t.matches[t.matches.length-1];return st(e.route.id,`${n} can only be used on routes that contain a unique "id"`),e.route.id}function G_(){return sc("useRouteId")}function Q_(){var l;let n=T.useContext(uc),t=Y_("useRouteError"),e=sc("useRouteError");return n!==void 0?n:(l=t.errors)==null?void 0:l[e]}function V_(){let{router:n}=L_("useNavigate"),t=sc("useNavigate"),e=T.useRef(!1);return J0(()=>{e.current=!0}),T.useCallback(async(r,a={})=>{jn(e.current,K0),e.current&&(typeof r=="number"?await n.navigate(r):await n.navigate(r,{fromRouteId:t,...a}))},[n,t])}var hh={};function P0(n,t,e){!t&&!hh[n]&&(hh[n]=!0,jn(!1,e))}T.memo(Z_);function Z_({routes:n,manifest:t,future:e,state:l,isStatic:r,onError:a}){return W0(n,void 0,{manifest:t,state:l,isStatic:r,onError:a})}function K_({to:n,replace:t,state:e,relative:l}){st(Hr(),"<Navigate> may be used only in the context of a <Router> component.");let{static:r}=T.useContext(vn);jn(!r,"<Navigate> must not be used on the initial render in a <StaticRouter>. This is a no-op, but you should modify your code so the <Navigate> is only ever rendered in response to some user interaction or state change.");let{matches:a}=T.useContext(Yn),{pathname:d}=In(),i=$0(),u=Ki(n,ic(a),d,l==="path"),o=JSON.stringify(u);return T.useEffect(()=>{i(JSON.parse(o),{replace:t,state:e,relative:l})},[i,o,l,t,e]),null}function Hd(n){st(!1,"A <Route> is only ever to be used as the child of <Routes> element, never rendered directly. Please wrap your <Route> in a <Routes>.")}function J_({basename:n="/",children:t=null,location:e,navigationType:l="POP",navigator:r,static:a=!1,useTransitions:d}){st(!Hr(),"You cannot render a <Router> inside another <Router>. You should never have more than one in your app.");let i=n.replace(/^\/*/,"/"),u=T.useMemo(()=>({basename:i,navigator:r,static:a,useTransitions:d,future:{}}),[i,r,a,d]);typeof e=="string"&&(e=wr(e));let{pathname:o="/",search:s="",hash:c="",state:f=null,key:h="default",mask:b}=e,m=T.useMemo(()=>{let v=ve(o,i);return v==null?null:{location:{pathname:v,search:s,hash:c,state:f,key:h,mask:b},navigationType:l}},[i,o,s,c,f,h,l,b]);return jn(m!=null,`<Router basename="${i}"> is not able to match the URL "${o}${s}${c}" because it does not start with the basename, so the <Router> won't render anything.`),m==null?null:T.createElement(vn.Provider,{value:u},T.createElement(ed.Provider,{children:t,value:m}))}function $_({children:n,location:t}){return U_(Vo(n),t)}function Vo(n,t=[]){let e=[];return T.Children.forEach(n,(l,r)=>{if(!T.isValidElement(l))return;let a=[...t,r];if(l.type===T.Fragment){e.push.apply(e,Vo(l.props.children,a));return}st(l.type===Hd,`[${typeof l.type=="string"?l.type:l.type.name}] is not a <Route> component. All component children of <Routes> must be a <Route> or <React.Fragment>`),st(!l.props.index||!l.props.children,"An index route cannot have child routes.");let d={id:l.props.id||a.join("-"),caseSensitive:l.props.caseSensitive,element:l.props.element,Component:l.props.Component,index:l.props.index,path:l.props.path,middleware:l.props.middleware,loader:l.props.loader,action:l.props.action,hydrateFallbackElement:l.props.hydrateFallbackElement,HydrateFallback:l.props.HydrateFallback,errorElement:l.props.errorElement,ErrorBoundary:l.props.ErrorBoundary,hasErrorBoundary:l.props.hasErrorBoundary===!0||l.props.ErrorBoundary!=null||l.props.errorElement!=null,shouldRevalidate:l.props.shouldRevalidate,handle:l.props.handle,lazy:l.props.lazy};l.props.children&&(d.children=Vo(l.props.children,a)),e.push(d)}),e}var jd="get",Ld="application/x-www-form-urlencoded";function $i(n){return typeof HTMLElement<"u"&&n instanceof HTMLElement}function W_(n){return $i(n)&&n.tagName.toLowerCase()==="button"}function F_(n){return $i(n)&&n.tagName.toLowerCase()==="form"}function P_(n){return $i(n)&&n.tagName.toLowerCase()==="input"}function I_(n){return!!(n.metaKey||n.altKey||n.ctrlKey||n.shiftKey)}function tv(n,t){return n.button===0&&(!t||t==="_self")&&!I_(n)}var Sd=null;function nv(){if(Sd===null)try{new FormData(document.createElement("form"),0),Sd=!1}catch{Sd=!0}return Sd}var ev=new Set(["application/x-www-form-urlencoded","multipart/form-data","text/plain"]);function Hu(n){return n!=null&&!ev.has(n)?(jn(!1,`"${n}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${Ld}"`),null):n}function lv(n,t){let e,l,r,a,d;if(F_(n)){let i=n.getAttribute("action");l=i?ve(i,t):null,e=n.getAttribute("method")||jd,r=Hu(n.getAttribute("enctype"))||Ld,a=new FormData(n)}else if(W_(n)||P_(n)&&(n.type==="submit"||n.type==="image")){let i=n.form;if(i==null)throw new Error('Cannot submit a <button> or <input type="submit"> without a <form>');let u=n.getAttribute("formaction")||i.getAttribute("action");if(l=u?ve(u,t):null,e=n.getAttribute("formmethod")||i.getAttribute("method")||jd,r=Hu(n.getAttribute("formenctype"))||Hu(i.getAttribute("enctype"))||Ld,a=new FormData(i,n),!nv()){let{name:o,type:s,value:c}=n;if(s==="image"){let f=o?`${o}.`:"";a.append(`${f}x`,"0"),a.append(`${f}y`,"0")}else o&&a.append(o,c)}}else{if($i(n))throw new Error('Cannot submit element that is not <form>, <button>, or <input type="submit|image">');e=jd,l=null,r=Ld,d=n}return a&&r==="text/plain"&&(d=a,a=void 0),{action:l,method:e.toLowerCase(),encType:r,formData:a,body:d}}Object.getOwnPropertyNames(Object.prototype).sort().join("\0");function cc(n,t){if(n===!1||n===null||typeof n>"u")throw new Error(t)}function I0(n,t,e,l){let r=typeof n=="string"?new URL(n,typeof window>"u"?"server://singlefetch/":window.location.origin):n;return e?r.pathname.endsWith("/")?r.pathname=`${r.pathname}_.${l}`:r.pathname=`${r.pathname}.${l}`:r.pathname==="/"?r.pathname=`_root.${l}`:t&&ve(r.pathname,t)==="/"?r.pathname=`${vi(t)}/_root.${l}`:r.pathname=`${vi(r.pathname)}.${l}`,r}async function rv(n,t){if(n.id in t)return t[n.id];try{let e=await import(n.module);return t[n.id]=e,e}catch(e){return console.error(`Error loading route module \`${n.module}\`, reloading page...`),console.error(e),window.__reactRouterContext&&window.__reactRouterContext.isSpaMode,window.location.reload(),new Promise(()=>{})}}function av(n){return n==null?!1:n.href==null?n.rel==="preload"&&typeof n.imageSrcSet=="string"&&typeof n.imageSizes=="string":typeof n.rel=="string"&&typeof n.href=="string"}async function dv(n,t,e){let l=await Promise.all(n.map(async r=>{let a=t.routes[r.route.id];if(a){let d=await rv(a,e);return d.links?d.links():[]}return[]}));return sv(l.flat(1).filter(av).filter(r=>r.rel==="stylesheet"||r.rel==="preload").map(r=>r.rel==="stylesheet"?{...r,rel:"prefetch",as:"style"}:{...r,rel:"prefetch"}))}function ph(n,t,e,l,r,a){let d=(u,o)=>e[o]?u.route.id!==e[o].route.id:!0,i=(u,o)=>{var s;return e[o].pathname!==u.pathname||((s=e[o].route.path)==null?void 0:s.endsWith("*"))&&e[o].params["*"]!==u.params["*"]};return a==="assets"?t.filter((u,o)=>d(u,o)||i(u,o)):a==="data"?t.filter((u,o)=>{var c;let s=l.routes[u.route.id];if(!s||!s.hasLoader)return!1;if(d(u,o)||i(u,o))return!0;if(u.route.shouldRevalidate){let f=u.route.shouldRevalidate({currentUrl:new URL(r.pathname+r.search+r.hash,window.origin),currentParams:((c=e[0])==null?void 0:c.params)||{},nextUrl:new URL(n,window.origin),nextParams:u.params,defaultShouldRevalidate:!0});if(typeof f=="boolean")return f}return!0}):[]}function iv(n,t,{includeHydrateFallback:e}={}){return uv(n.map(l=>{let r=t.routes[l.route.id];if(!r)return[];let a=[r.module];return r.clientActionModule&&(a=a.concat(r.clientActionModule)),r.clientLoaderModule&&(a=a.concat(r.clientLoaderModule)),e&&r.hydrateFallbackModule&&(a=a.concat(r.hydrateFallbackModule)),r.imports&&(a=a.concat(r.imports)),a}).flat(1))}function uv(n){return[...new Set(n)]}function ov(n){let t={},e=Object.keys(n).sort();for(let l of e)t[l]=n[l];return t}function sv(n,t){let e=new Set;return new Set(t),n.reduce((l,r)=>{let a=JSON.stringify(ov(r));return e.has(a)||(e.add(a),l.push({key:a,link:r})),l},[])}function fc(){let n=T.useContext(Br);return cc(n,"You must render this element inside a <DataRouterContext.Provider> element"),n}function cv(){let n=T.useContext(Ji);return cc(n,"You must render this element inside a <DataRouterStateContext.Provider> element"),n}var hc=T.createContext(void 0);hc.displayName="FrameworkContext";function pc(){let n=T.useContext(hc);return cc(n,"You must render this element inside a <HydratedRouter> element"),n}function fv(n,t){let e=T.useContext(hc),[l,r]=T.useState(!1),[a,d]=T.useState(!1),{onFocus:i,onBlur:u,onMouseEnter:o,onMouseLeave:s,onTouchStart:c}=t,f=T.useRef(null);T.useEffect(()=>{if(n==="render"&&d(!0),n==="viewport"){let m=g=>{g.forEach(p=>{d(p.isIntersecting)})},v=new IntersectionObserver(m,{threshold:.5});return f.current&&v.observe(f.current),()=>{v.disconnect()}}},[n]),T.useEffect(()=>{if(l){let m=setTimeout(()=>{d(!0)},100);return()=>{clearTimeout(m)}}},[l]);let h=()=>{r(!0)},b=()=>{r(!1),d(!1)};return e?n!=="intent"?[a,f,{}]:[a,f,{onFocus:Zr(i,h),onBlur:Zr(u,b),onMouseEnter:Zr(o,h),onMouseLeave:Zr(s,b),onTouchStart:Zr(c,h)}]:[!1,f,{}]}function Zr(n,t){return e=>{n&&n(e),e.defaultPrevented||t(e)}}function hv({page:n,...t}){let e=x_(),{router:l}=fc(),r=T.useMemo(()=>B0(l.routes,n,l.basename),[l.routes,n,l.basename]);return r?e?T.createElement(gv,{page:n,matches:r,...t}):T.createElement(mv,{page:n,matches:r,...t}):null}function pv(n){let{manifest:t,routeModules:e}=pc(),[l,r]=T.useState([]);return T.useEffect(()=>{let a=!1;return dv(n,t,e).then(d=>{a||r(d)}),()=>{a=!0}},[n,t,e]),l}function gv({page:n,matches:t,...e}){let l=In(),{future:r}=pc(),{basename:a}=fc(),d=T.useMemo(()=>{if(n===l.pathname+l.search+l.hash)return[];let i=I0(n,a,r.unstable_trailingSlashAwareDataRequests,"rsc"),u=!1,o=[];for(let s of t)typeof s.route.shouldRevalidate=="function"?u=!0:o.push(s.route.id);return u&&o.length>0&&i.searchParams.set("_routes",o.join(",")),[i.pathname+i.search]},[a,r.unstable_trailingSlashAwareDataRequests,n,l,t]);return T.createElement(T.Fragment,null,d.map(i=>T.createElement("link",{key:i,rel:"prefetch",as:"fetch",href:i,...e})))}function mv({page:n,matches:t,...e}){let l=In(),{future:r,manifest:a,routeModules:d}=pc(),{basename:i}=fc(),{loaderData:u,matches:o}=cv(),s=T.useMemo(()=>ph(n,t,o,a,l,"data"),[n,t,o,a,l]),c=T.useMemo(()=>ph(n,t,o,a,l,"assets"),[n,t,o,a,l]),f=T.useMemo(()=>{if(n===l.pathname+l.search+l.hash)return[];let m=new Set,v=!1;if(t.forEach(p=>{var _;let y=a.routes[p.route.id];!y||!y.hasLoader||(!s.some(S=>S.route.id===p.route.id)&&p.route.id in u&&((_=d[p.route.id])!=null&&_.shouldRevalidate)||y.hasClientLoader?v=!0:m.add(p.route.id))}),m.size===0)return[];let g=I0(n,i,r.unstable_trailingSlashAwareDataRequests,"data");return v&&m.size>0&&g.searchParams.set("_routes",t.filter(p=>m.has(p.route.id)).map(p=>p.route.id).join(",")),[g.pathname+g.search]},[i,r.unstable_trailingSlashAwareDataRequests,u,l,a,s,t,n,d]),h=T.useMemo(()=>iv(c,a),[c,a]),b=pv(c);return T.createElement(T.Fragment,null,f.map(m=>T.createElement("link",{key:m,rel:"prefetch",as:"fetch",href:m,...e})),h.map(m=>T.createElement("link",{key:m,rel:"modulepreload",href:m,...e})),b.map(({key:m,link:v})=>T.createElement("link",{key:m,nonce:e.nonce,...v,crossOrigin:v.crossOrigin??e.crossOrigin})))}function yv(...n){return t=>{n.forEach(e=>{typeof e=="function"?e(t):e!=null&&(e.current=t)})}}var bv=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u";try{bv&&(window.__reactRouterVersion="7.15.0")}catch{}function _v({basename:n,children:t,useTransitions:e,window:l}){let r=T.useRef();r.current==null&&(r.current=W1({window:l,v5Compat:!0}));let a=r.current,[d,i]=T.useState({action:a.action,location:a.location}),u=T.useCallback(o=>{e===!1?i(o):T.startTransition(()=>i(o))},[e]);return T.useLayoutEffect(()=>a.listen(u),[a,u]),T.createElement(J_,{basename:n,children:t,location:d.location,navigationType:d.action,navigator:a,useTransitions:e})}var tm=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,Na=T.forwardRef(function({onClick:t,discover:e="render",prefetch:l="none",relative:r,reloadDocument:a,replace:d,mask:i,state:u,target:o,to:s,preventScrollReset:c,viewTransition:f,defaultShouldRevalidate:h,...b},m){let{basename:v,navigator:g,useTransitions:p}=T.useContext(vn),y=typeof s=="string"&&tm.test(s),_=X0(s,v);s=_.to;let S=M_(s,{relative:r}),A=In(),q=null;if(i){let G=Ki(i,[],A.mask?A.mask.pathname:"/",!0);v!=="/"&&(G.pathname=G.pathname==="/"?v:Hn([v,G.pathname])),q=g.createHref(G)}let[E,x,R]=fv(l,b),H=Tv(s,{replace:d,mask:i,state:u,target:o,preventScrollReset:c,relative:r,viewTransition:f,defaultShouldRevalidate:h,useTransitions:p});function X(G){t&&t(G),G.defaultPrevented||H(G)}let Z=!(_.isExternal||a),P=T.createElement("a",{...b,...R,href:(Z?q:void 0)||_.absoluteURL||S,onClick:Z?X:t,ref:yv(m,x),target:o,"data-discover":!y&&e==="render"?"true":void 0});return E&&!y?T.createElement(T.Fragment,null,P,T.createElement(hv,{page:S})):P});Na.displayName="Link";var vv=T.forwardRef(function({"aria-current":t="page",caseSensitive:e=!1,className:l="",end:r=!1,style:a,to:d,viewTransition:i,children:u,...o},s){let c=ld(d,{relative:o.relative}),f=In(),h=T.useContext(Ji),{navigator:b,basename:m}=T.useContext(vn),v=h!=null&&Dv(c)&&i===!0,g=b.encodeLocation?b.encodeLocation(c).pathname:c.pathname,p=f.pathname,y=h&&h.navigation&&h.navigation.location?h.navigation.location.pathname:null;e||(p=p.toLowerCase(),y=y?y.toLowerCase():null,g=g.toLowerCase()),y&&m&&(y=ve(y,m)||y);const _=g!=="/"&&g.endsWith("/")?g.length-1:g.length;let S=p===g||!r&&p.startsWith(g)&&p.charAt(_)==="/",A=y!=null&&(y===g||!r&&y.startsWith(g)&&y.charAt(g.length)==="/"),q={isActive:S,isPending:A,isTransitioning:v},E=S?t:void 0,x;typeof l=="function"?x=l(q):x=[l,S?"active":null,A?"pending":null,v?"transitioning":null].filter(Boolean).join(" ");let R=typeof a=="function"?a(q):a;return T.createElement(Na,{...o,"aria-current":E,className:x,ref:s,style:R,to:d,viewTransition:i},typeof u=="function"?u(q):u)});vv.displayName="NavLink";var Sv=T.forwardRef(({discover:n="render",fetcherKey:t,navigate:e,reloadDocument:l,replace:r,state:a,method:d=jd,action:i,onSubmit:u,relative:o,preventScrollReset:s,viewTransition:c,defaultShouldRevalidate:f,...h},b)=>{let{useTransitions:m}=T.useContext(vn),v=zv(),g=Av(i,{relative:o}),p=d.toLowerCase()==="get"?"get":"post",y=typeof i=="string"&&tm.test(i),_=S=>{if(u&&u(S),S.defaultPrevented)return;S.preventDefault();let A=S.nativeEvent.submitter,q=(A==null?void 0:A.getAttribute("formmethod"))||d,E=()=>v(A||S.currentTarget,{fetcherKey:t,method:q,navigate:e,replace:r,state:a,relative:o,preventScrollReset:s,viewTransition:c,defaultShouldRevalidate:f});m&&e!==!1?T.startTransition(()=>E()):E()};return T.createElement("form",{ref:b,method:p,action:g,onSubmit:l?u:_,...h,"data-discover":!y&&n==="render"?"true":void 0})});Sv.displayName="Form";function qv(n){return`${n} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`}function nm(n){let t=T.useContext(Br);return st(t,qv(n)),t}function Tv(n,{target:t,replace:e,mask:l,state:r,preventScrollReset:a,relative:d,viewTransition:i,defaultShouldRevalidate:u,useTransitions:o}={}){let s=$0(),c=In(),f=ld(n,{relative:d});return T.useCallback(h=>{if(tv(h,t)){h.preventDefault();let b=e!==void 0?e:Ua(c)===Ua(f),m=()=>s(n,{replace:b,mask:l,state:r,preventScrollReset:a,relative:d,viewTransition:i,defaultShouldRevalidate:u});o?T.startTransition(()=>m()):m()}},[c,s,f,e,l,r,t,n,a,d,i,u,o])}var xv=0,Ev=()=>`__${String(++xv)}__`;function zv(){let{router:n}=nm("useSubmit"),{basename:t}=T.useContext(vn),e=G_(),l=n.fetch,r=n.navigate;return T.useCallback(async(a,d={})=>{let{action:i,method:u,encType:o,formData:s,body:c}=lv(a,t);if(d.navigate===!1){let f=d.fetcherKey||Ev();await l(f,e,d.action||i,{defaultShouldRevalidate:d.defaultShouldRevalidate,preventScrollReset:d.preventScrollReset,formData:s,body:c,formMethod:d.method||u,formEncType:d.encType||o,flushSync:d.flushSync})}else await r(d.action||i,{defaultShouldRevalidate:d.defaultShouldRevalidate,preventScrollReset:d.preventScrollReset,formData:s,body:c,formMethod:d.method||u,formEncType:d.encType||o,replace:d.replace,state:d.state,fromRouteId:e,flushSync:d.flushSync,viewTransition:d.viewTransition})},[l,r,t,e])}function Av(n,{relative:t}={}){let{basename:e}=T.useContext(vn),l=T.useContext(Yn);st(l,"useFormAction must be used inside a RouteContext");let[r]=l.matches.slice(-1),a={...ld(n||".",{relative:t})},d=In();if(n==null){a.search=d.search;let i=new URLSearchParams(a.search),u=i.getAll("index");if(u.some(s=>s==="")){i.delete("index"),u.filter(c=>c).forEach(c=>i.append("index",c));let s=i.toString();a.search=s?`?${s}`:""}}return(!n||n===".")&&r.route.index&&(a.search=a.search?a.search.replace(/^\?/,"?index&"):"?index"),e!=="/"&&(a.pathname=a.pathname==="/"?e:Hn([e,a.pathname])),Ua(a)}function Dv(n,{relative:t}={}){let e=T.useContext(V0);st(e!=null,"`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?");let{basename:l}=nm("useViewTransitionState"),r=ld(n,{relative:t});if(!e.isTransitioning)return!1;let a=ve(e.currentLocation.pathname,l)||e.currentLocation.pathname,d=ve(e.nextLocation.pathname,l)||e.nextLocation.pathname;return _i(r.pathname,d)!=null||_i(r.pathname,a)!=null}function ae(n){if(n===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return n}function em(n,t){n.prototype=Object.create(t.prototype),n.prototype.constructor=n,n.__proto__=t}/*!
 * GSAP 3.15.0
 * https://gsap.com
 *
 * @license Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/var gn={autoSleep:120,force3D:"auto",nullTargetWarn:1,units:{lineHeight:""}},wa={duration:.5,overwrite:!1,delay:0},gc,Bt,ot,Mn=1e8,tt=1/Mn,Zo=Math.PI*2,Ov=Zo/4,Rv=0,lm=Math.sqrt,Mv=Math.cos,Cv=Math.sin,Rt=function(t){return typeof t=="string"},mt=function(t){return typeof t=="function"},Se=function(t){return typeof t=="number"},mc=function(t){return typeof t>"u"},Wn=function(t){return typeof t=="object"},$t=function(t){return t!==!1},yc=function(){return typeof window<"u"},qd=function(t){return mt(t)||Rt(t)},rm=typeof ArrayBuffer=="function"&&ArrayBuffer.isView||function(){},jt=Array.isArray,kv=/random\([^)]+\)/g,Uv=/,\s*/g,gh=/(?:-?\.?\d|\.)+/gi,am=/[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,tr=/[-+=.]*\d+[.e-]*\d*[a-z%]*/g,ju=/[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,dm=/[+-]=-?[.\d]+/,Nv=/[^,'"\[\]\s]+/gi,wv=/^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,ft,Gn,Ko,bc,bn={},Si={},im,um=function(t){return(Si=Tr(t,bn))&&tn},_c=function(t,e){return console.warn("Invalid property",t,"set to",e,"Missing plugin? gsap.registerPlugin()")},Ba=function(t,e){return!e&&console.warn(t)},om=function(t,e){return t&&(bn[t]=e)&&Si&&(Si[t]=e)||bn},Ha=function(){return 0},Bv={suppressEvents:!0,isStart:!0,kill:!1},Yd={suppressEvents:!0,kill:!1},Hv={suppressEvents:!0},vc={},Je=[],Jo={},sm,ln={},Lu={},mh=30,Xd=[],Sc="",qc=function(t){var e=t[0],l,r;if(Wn(e)||mt(e)||(t=[t]),!(l=(e._gsap||{}).harness)){for(r=Xd.length;r--&&!Xd[r].targetTest(e););l=Xd[r]}for(r=t.length;r--;)t[r]&&(t[r]._gsap||(t[r]._gsap=new Cm(t[r],l)))||t.splice(r,1);return t},vl=function(t){return t._gsap||qc(Cn(t))[0]._gsap},cm=function(t,e,l){return(l=t[e])&&mt(l)?t[e]():mc(l)&&t.getAttribute&&t.getAttribute(e)||l},Wt=function(t,e){return(t=t.split(",")).forEach(e)||t},yt=function(t){return Math.round(t*1e5)/1e5||0},ct=function(t){return Math.round(t*1e7)/1e7||0},or=function(t,e){var l=e.charAt(0),r=parseFloat(e.substr(2));return t=parseFloat(t),l==="+"?t+r:l==="-"?t-r:l==="*"?t*r:t/r},jv=function(t,e){for(var l=e.length,r=0;t.indexOf(e[r])<0&&++r<l;);return r<l},qi=function(){var t=Je.length,e=Je.slice(0),l,r;for(Jo={},Je.length=0,l=0;l<t;l++)r=e[l],r&&r._lazy&&(r.render(r._lazy[0],r._lazy[1],!0)._lazy=0)},Tc=function(t){return!!(t._initted||t._startAt||t.add)},fm=function(t,e,l,r){Je.length&&!Bt&&qi(),t.render(e,l,!!(Bt&&e<0&&Tc(t))),Je.length&&!Bt&&qi()},hm=function(t){var e=parseFloat(t);return(e||e===0)&&(t+"").match(Nv).length<2?e:Rt(t)?t.trim():t},pm=function(t){return t},_n=function(t,e){for(var l in e)l in t||(t[l]=e[l]);return t},Lv=function(t){return function(e,l){for(var r in l)r in e||r==="duration"&&t||r==="ease"||(e[r]=l[r])}},Tr=function(t,e){for(var l in e)t[l]=e[l];return t},yh=function n(t,e){for(var l in e)l!=="__proto__"&&l!=="constructor"&&l!=="prototype"&&(t[l]=Wn(e[l])?n(t[l]||(t[l]={}),e[l]):e[l]);return t},Ti=function(t,e){var l={},r;for(r in t)r in e||(l[r]=t[r]);return l},ma=function(t){var e=t.parent||ft,l=t.keyframes?Lv(jt(t.keyframes)):_n;if($t(t.inherit))for(;e;)l(t,e.vars.defaults),e=e.parent||e._dp;return t},Yv=function(t,e){for(var l=t.length,r=l===e.length;r&&l--&&t[l]===e[l];);return l<0},gm=function(t,e,l,r,a){var d=t[r],i;if(a)for(i=e[a];d&&d[a]>i;)d=d._prev;return d?(e._next=d._next,d._next=e):(e._next=t[l],t[l]=e),e._next?e._next._prev=e:t[r]=e,e._prev=d,e.parent=e._dp=t,e},Wi=function(t,e,l,r){l===void 0&&(l="_first"),r===void 0&&(r="_last");var a=e._prev,d=e._next;a?a._next=d:t[l]===e&&(t[l]=d),d?d._prev=a:t[r]===e&&(t[r]=a),e._next=e._prev=e.parent=null},tl=function(t,e){t.parent&&(!e||t.parent.autoRemoveChildren)&&t.parent.remove&&t.parent.remove(t),t._act=0},Sl=function(t,e){if(t&&(!e||e._end>t._dur||e._start<0))for(var l=t;l;)l._dirty=1,l=l.parent;return t},Xv=function(t){for(var e=t.parent;e&&e.parent;)e._dirty=1,e.totalDuration(),e=e.parent;return t},$o=function(t,e,l,r){return t._startAt&&(Bt?t._startAt.revert(Yd):t.vars.immediateRender&&!t.vars.autoRevert||t._startAt.render(e,!0,r))},Gv=function n(t){return!t||t._ts&&n(t.parent)},bh=function(t){return t._repeat?xr(t._tTime,t=t.duration()+t._rDelay)*t:0},xr=function(t,e){var l=Math.floor(t=ct(t/e));return t&&l===t?l-1:l},xi=function(t,e){return(t-e._start)*e._ts+(e._ts>=0?0:e._dirty?e.totalDuration():e._tDur)},Fi=function(t){return t._end=ct(t._start+(t._tDur/Math.abs(t._ts||t._rts||tt)||0))},Pi=function(t,e){var l=t._dp;return l&&l.smoothChildTiming&&t._ts&&(t._start=ct(l._time-(t._ts>0?e/t._ts:((t._dirty?t.totalDuration():t._tDur)-e)/-t._ts)),Fi(t),l._dirty||Sl(l,t)),t},mm=function(t,e){var l;if((e._time||!e._dur&&e._initted||e._start<t._time&&(e._dur||!e.add))&&(l=xi(t.rawTime(),e),(!e._dur||rd(0,e.totalDuration(),l)-e._tTime>tt)&&e.render(l,!0)),Sl(t,e)._dp&&t._initted&&t._time>=t._dur&&t._ts){if(t._dur<t.duration())for(l=t;l._dp;)l.rawTime()>=0&&l.totalTime(l._tTime),l=l._dp;t._zTime=-tt}},Qn=function(t,e,l,r){return e.parent&&tl(e),e._start=ct((Se(l)?l:l||t!==ft?Tn(t,l,e):t._time)+e._delay),e._end=ct(e._start+(e.totalDuration()/Math.abs(e.timeScale())||0)),gm(t,e,"_first","_last",t._sort?"_start":0),Wo(e)||(t._recent=e),r||mm(t,e),t._ts<0&&Pi(t,t._tTime),t},ym=function(t,e){return(bn.ScrollTrigger||_c("scrollTrigger",e))&&bn.ScrollTrigger.create(e,t)},bm=function(t,e,l,r,a){if(Ec(t,e,a),!t._initted)return 1;if(!l&&t._pt&&!Bt&&(t._dur&&t.vars.lazy!==!1||!t._dur&&t.vars.lazy)&&sm!==dn.frame)return Je.push(t),t._lazy=[a,r],1},Qv=function n(t){var e=t.parent;return e&&e._ts&&e._initted&&!e._lock&&(e.rawTime()<0||n(e))},Wo=function(t){var e=t.data;return e==="isFromStart"||e==="isStart"},Vv=function(t,e,l,r){var a=t.ratio,d=e<0||!e&&(!t._start&&Qv(t)&&!(!t._initted&&Wo(t))||(t._ts<0||t._dp._ts<0)&&!Wo(t))?0:1,i=t._rDelay,u=0,o,s,c;if(i&&t._repeat&&(u=rd(0,t._tDur,e),s=xr(u,i),t._yoyo&&s&1&&(d=1-d),s!==xr(t._tTime,i)&&(a=1-d,t.vars.repeatRefresh&&t._initted&&t.invalidate())),d!==a||Bt||r||t._zTime===tt||!e&&t._zTime){if(!t._initted&&bm(t,e,r,l,u))return;for(c=t._zTime,t._zTime=e||(l?tt:0),l||(l=e&&!c),t.ratio=d,t._from&&(d=1-d),t._time=0,t._tTime=u,o=t._pt;o;)o.r(d,o.d),o=o._next;e<0&&$o(t,e,l,!0),t._onUpdate&&!l&&on(t,"onUpdate"),u&&t._repeat&&!l&&t.parent&&on(t,"onRepeat"),(e>=t._tDur||e<0)&&t.ratio===d&&(d&&tl(t,1),!l&&!Bt&&(on(t,d?"onComplete":"onReverseComplete",!0),t._prom&&t._prom()))}else t._zTime||(t._zTime=e)},Zv=function(t,e,l){var r;if(l>e)for(r=t._first;r&&r._start<=l;){if(r.data==="isPause"&&r._start>e)return r;r=r._next}else for(r=t._last;r&&r._start>=l;){if(r.data==="isPause"&&r._start<e)return r;r=r._prev}},Er=function(t,e,l,r){var a=t._repeat,d=ct(e)||0,i=t._tTime/t._tDur;return i&&!r&&(t._time*=d/t._dur),t._dur=d,t._tDur=a?a<0?1e10:ct(d*(a+1)+t._rDelay*a):d,i>0&&!r&&Pi(t,t._tTime=t._tDur*i),t.parent&&Fi(t),l||Sl(t.parent,t),t},_h=function(t){return t instanceof Kt?Sl(t):Er(t,t._dur)},Kv={_start:0,endTime:Ha,totalDuration:Ha},Tn=function n(t,e,l){var r=t.labels,a=t._recent||Kv,d=t.duration()>=Mn?a.endTime(!1):t._dur,i,u,o;return Rt(e)&&(isNaN(e)||e in r)?(u=e.charAt(0),o=e.substr(-1)==="%",i=e.indexOf("="),u==="<"||u===">"?(i>=0&&(e=e.replace(/=/,"")),(u==="<"?a._start:a.endTime(a._repeat>=0))+(parseFloat(e.substr(1))||0)*(o?(i<0?a:l).totalDuration()/100:1)):i<0?(e in r||(r[e]=d),r[e]):(u=parseFloat(e.charAt(i-1)+e.substr(i+1)),o&&l&&(u=u/100*(jt(l)?l[0]:l).totalDuration()),i>1?n(t,e.substr(0,i-1),l)+u:d+u)):e==null?d:+e},ya=function(t,e,l){var r=Se(e[1]),a=(r?2:1)+(t<2?0:1),d=e[a],i,u;if(r&&(d.duration=e[1]),d.parent=l,t){for(i=d,u=l;u&&!("immediateRender"in i);)i=u.vars.defaults||{},u=$t(u.vars.inherit)&&u.parent;d.immediateRender=$t(i.immediateRender),t<2?d.runBackwards=1:d.startAt=e[a-1]}return new qt(e[0],d,e[a+1])},al=function(t,e){return t||t===0?e(t):e},rd=function(t,e,l){return l<t?t:l>e?e:l},Ht=function(t,e){return!Rt(t)||!(e=wv.exec(t))?"":e[1]},Jv=function(t,e,l){return al(l,function(r){return rd(t,e,r)})},Fo=[].slice,_m=function(t,e){return t&&Wn(t)&&"length"in t&&(!e&&!t.length||t.length-1 in t&&Wn(t[0]))&&!t.nodeType&&t!==Gn},$v=function(t,e,l){return l===void 0&&(l=[]),t.forEach(function(r){var a;return Rt(r)&&!e||_m(r,1)?(a=l).push.apply(a,Cn(r)):l.push(r)})||l},Cn=function(t,e,l){return ot&&!e&&ot.selector?ot.selector(t):Rt(t)&&!l&&(Ko||!zr())?Fo.call((e||bc).querySelectorAll(t),0):jt(t)?$v(t,l):_m(t)?Fo.call(t,0):t?[t]:[]},Po=function(t){return t=Cn(t)[0]||Ba("Invalid scope")||{},function(e){var l=t.current||t.nativeElement||t;return Cn(e,l.querySelectorAll?l:l===t?Ba("Invalid scope")||bc.createElement("div"):t)}},vm=function(t){return t.sort(function(){return .5-Math.random()})},Sm=function(t){if(mt(t))return t;var e=Wn(t)?t:{each:t},l=ql(e.ease),r=e.from||0,a=parseFloat(e.base)||0,d={},i=r>0&&r<1,u=isNaN(r)||i,o=e.axis,s=r,c=r;return Rt(r)?s=c={center:.5,edges:.5,end:1}[r]||0:!i&&u&&(s=r[0],c=r[1]),function(f,h,b){var m=(b||e).length,v=d[m],g,p,y,_,S,A,q,E,x;if(!v){if(x=e.grid==="auto"?0:(e.grid||[1,Mn])[1],!x){for(q=-Mn;q<(q=b[x++].getBoundingClientRect().left)&&x<m;);x<m&&x--}for(v=d[m]=[],g=u?Math.min(x,m)*s-.5:r%x,p=x===Mn?0:u?m*c/x-.5:r/x|0,q=0,E=Mn,A=0;A<m;A++)y=A%x-g,_=p-(A/x|0),v[A]=S=o?Math.abs(o==="y"?_:y):lm(y*y+_*_),S>q&&(q=S),S<E&&(E=S);r==="random"&&vm(v),v.max=q-E,v.min=E,v.v=m=(parseFloat(e.amount)||parseFloat(e.each)*(x>m?m-1:o?o==="y"?m/x:x:Math.max(x,m/x))||0)*(r==="edges"?-1:1),v.b=m<0?a-m:a,v.u=Ht(e.amount||e.each)||0,l=l&&m<0?u2(l):l}return m=(v[f]-v.min)/v.max||0,ct(v.b+(l?l(m):m)*v.v)+v.u}},Io=function(t){var e=Math.pow(10,((t+"").split(".")[1]||"").length);return function(l){var r=ct(Math.round(parseFloat(l)/t)*t*e);return(r-r%1)/e+(Se(l)?0:Ht(l))}},qm=function(t,e){var l=jt(t),r,a;return!l&&Wn(t)&&(r=l=t.radius||Mn,t.values?(t=Cn(t.values),(a=!Se(t[0]))&&(r*=r)):t=Io(t.increment)),al(e,l?mt(t)?function(d){return a=t(d),Math.abs(a-d)<=r?a:d}:function(d){for(var i=parseFloat(a?d.x:d),u=parseFloat(a?d.y:0),o=Mn,s=0,c=t.length,f,h;c--;)a?(f=t[c].x-i,h=t[c].y-u,f=f*f+h*h):f=Math.abs(t[c]-i),f<o&&(o=f,s=c);return s=!r||o<=r?t[s]:d,a||s===d||Se(d)?s:s+Ht(d)}:Io(t))},Tm=function(t,e,l,r){return al(jt(t)?!e:l===!0?!!(l=0):!r,function(){return jt(t)?t[~~(Math.random()*t.length)]:(l=l||1e-5)&&(r=l<1?Math.pow(10,(l+"").length-2):1)&&Math.floor(Math.round((t-l/2+Math.random()*(e-t+l*.99))/l)*l*r)/r})},Wv=function(){for(var t=arguments.length,e=new Array(t),l=0;l<t;l++)e[l]=arguments[l];return function(r){return e.reduce(function(a,d){return d(a)},r)}},Fv=function(t,e){return function(l){return t(parseFloat(l))+(e||Ht(l))}},Pv=function(t,e,l){return Em(t,e,0,1,l)},xm=function(t,e,l){return al(l,function(r){return t[~~e(r)]})},Iv=function n(t,e,l){var r=e-t;return jt(t)?xm(t,n(0,t.length),e):al(l,function(a){return(r+(a-t)%r)%r+t})},t2=function n(t,e,l){var r=e-t,a=r*2;return jt(t)?xm(t,n(0,t.length-1),e):al(l,function(d){return d=(a+(d-t)%a)%a||0,t+(d>r?a-d:d)})},ja=function(t){return t.replace(kv,function(e){var l=e.indexOf("[")+1,r=e.substring(l||7,l?e.indexOf("]"):e.length-1).split(Uv);return Tm(l?r:+r[0],l?0:+r[1],+r[2]||1e-5)})},Em=function(t,e,l,r,a){var d=e-t,i=r-l;return al(a,function(u){return l+((u-t)/d*i||0)})},n2=function n(t,e,l,r){var a=isNaN(t+e)?0:function(h){return(1-h)*t+h*e};if(!a){var d=Rt(t),i={},u,o,s,c,f;if(l===!0&&(r=1)&&(l=null),d)t={p:t},e={p:e};else if(jt(t)&&!jt(e)){for(s=[],c=t.length,f=c-2,o=1;o<c;o++)s.push(n(t[o-1],t[o]));c--,a=function(b){b*=c;var m=Math.min(f,~~b);return s[m](b-m)},l=e}else r||(t=Tr(jt(t)?[]:{},t));if(!s){for(u in e)xc.call(i,t,u,"get",e[u]);a=function(b){return Dc(b,i)||(d?t.p:t)}}}return al(l,a)},vh=function(t,e,l){var r=t.labels,a=Mn,d,i,u;for(d in r)i=r[d]-e,i<0==!!l&&i&&a>(i=Math.abs(i))&&(u=d,a=i);return u},on=function(t,e,l){var r=t.vars,a=r[e],d=ot,i=t._ctx,u,o,s;if(a)return u=r[e+"Params"],o=r.callbackScope||t,l&&Je.length&&qi(),i&&(ot=i),s=u?a.apply(o,u):a.call(o),ot=d,s},Ir=function(t){return tl(t),t.scrollTrigger&&t.scrollTrigger.kill(!!Bt),t.progress()<1&&on(t,"onInterrupt"),t},nr,zm=[],Am=function(t){if(t)if(t=!t.name&&t.default||t,yc()||t.headless){var e=t.name,l=mt(t),r=e&&!l&&t.init?function(){this._props=[]}:t,a={init:Ha,render:Dc,add:xc,kill:b2,modifier:y2,rawVars:0},d={targetTest:0,get:0,getSetter:Ac,aliases:{},register:0};if(zr(),t!==r){if(ln[e])return;_n(r,_n(Ti(t,a),d)),Tr(r.prototype,Tr(a,Ti(t,d))),ln[r.prop=e]=r,t.targetTest&&(Xd.push(r),vc[e]=1),e=(e==="css"?"CSS":e.charAt(0).toUpperCase()+e.substr(1))+"Plugin"}om(e,r),t.register&&t.register(tn,r,Ft)}else zm.push(t)},I=255,ta={aqua:[0,I,I],lime:[0,I,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,I],navy:[0,0,128],white:[I,I,I],olive:[128,128,0],yellow:[I,I,0],orange:[I,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[I,0,0],pink:[I,192,203],cyan:[0,I,I],transparent:[I,I,I,0]},Yu=function(t,e,l){return t+=t<0?1:t>1?-1:0,(t*6<1?e+(l-e)*t*6:t<.5?l:t*3<2?e+(l-e)*(2/3-t)*6:e)*I+.5|0},Dm=function(t,e,l){var r=t?Se(t)?[t>>16,t>>8&I,t&I]:0:ta.black,a,d,i,u,o,s,c,f,h,b;if(!r){if(t.substr(-1)===","&&(t=t.substr(0,t.length-1)),ta[t])r=ta[t];else if(t.charAt(0)==="#"){if(t.length<6&&(a=t.charAt(1),d=t.charAt(2),i=t.charAt(3),t="#"+a+a+d+d+i+i+(t.length===5?t.charAt(4)+t.charAt(4):"")),t.length===9)return r=parseInt(t.substr(1,6),16),[r>>16,r>>8&I,r&I,parseInt(t.substr(7),16)/255];t=parseInt(t.substr(1),16),r=[t>>16,t>>8&I,t&I]}else if(t.substr(0,3)==="hsl"){if(r=b=t.match(gh),!e)u=+r[0]%360/360,o=+r[1]/100,s=+r[2]/100,d=s<=.5?s*(o+1):s+o-s*o,a=s*2-d,r.length>3&&(r[3]*=1),r[0]=Yu(u+1/3,a,d),r[1]=Yu(u,a,d),r[2]=Yu(u-1/3,a,d);else if(~t.indexOf("="))return r=t.match(am),l&&r.length<4&&(r[3]=1),r}else r=t.match(gh)||ta.transparent;r=r.map(Number)}return e&&!b&&(a=r[0]/I,d=r[1]/I,i=r[2]/I,c=Math.max(a,d,i),f=Math.min(a,d,i),s=(c+f)/2,c===f?u=o=0:(h=c-f,o=s>.5?h/(2-c-f):h/(c+f),u=c===a?(d-i)/h+(d<i?6:0):c===d?(i-a)/h+2:(a-d)/h+4,u*=60),r[0]=~~(u+.5),r[1]=~~(o*100+.5),r[2]=~~(s*100+.5)),l&&r.length<4&&(r[3]=1),r},Om=function(t){var e=[],l=[],r=-1;return t.split($e).forEach(function(a){var d=a.match(tr)||[];e.push.apply(e,d),l.push(r+=d.length+1)}),e.c=l,e},Sh=function(t,e,l){var r="",a=(t+r).match($e),d=e?"hsla(":"rgba(",i=0,u,o,s,c;if(!a)return t;if(a=a.map(function(f){return(f=Dm(f,e,1))&&d+(e?f[0]+","+f[1]+"%,"+f[2]+"%,"+f[3]:f.join(","))+")"}),l&&(s=Om(t),u=l.c,u.join(r)!==s.c.join(r)))for(o=t.replace($e,"1").split(tr),c=o.length-1;i<c;i++)r+=o[i]+(~u.indexOf(i)?a.shift()||d+"0,0,0,0)":(s.length?s:a.length?a:l).shift());if(!o)for(o=t.split($e),c=o.length-1;i<c;i++)r+=o[i]+a[i];return r+o[c]},$e=function(){var n="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",t;for(t in ta)n+="|"+t+"\\b";return new RegExp(n+")","gi")}(),e2=/hsl[a]?\(/,Rm=function(t){var e=t.join(" "),l;if($e.lastIndex=0,$e.test(e))return l=e2.test(e),t[1]=Sh(t[1],l),t[0]=Sh(t[0],l,Om(t[1])),!0},La,dn=function(){var n=Date.now,t=500,e=33,l=n(),r=l,a=1e3/240,d=a,i=[],u,o,s,c,f,h,b=function m(v){var g=n()-r,p=v===!0,y,_,S,A;if((g>t||g<0)&&(l+=g-e),r+=g,S=r-l,y=S-d,(y>0||p)&&(A=++c.frame,f=S-c.time*1e3,c.time=S=S/1e3,d+=y+(y>=a?4:a-y),_=1),p||(u=o(m)),_)for(h=0;h<i.length;h++)i[h](S,f,A,v)};return c={time:0,frame:0,tick:function(){b(!0)},deltaRatio:function(v){return f/(1e3/(v||60))},wake:function(){im&&(!Ko&&yc()&&(Gn=Ko=window,bc=Gn.document||{},bn.gsap=tn,(Gn.gsapVersions||(Gn.gsapVersions=[])).push(tn.version),um(Si||Gn.GreenSockGlobals||!Gn.gsap&&Gn||{}),zm.forEach(Am)),s=typeof requestAnimationFrame<"u"&&requestAnimationFrame,u&&c.sleep(),o=s||function(v){return setTimeout(v,d-c.time*1e3+1|0)},La=1,b(2))},sleep:function(){(s?cancelAnimationFrame:clearTimeout)(u),La=0,o=Ha},lagSmoothing:function(v,g){t=v||1/0,e=Math.min(g||33,t)},fps:function(v){a=1e3/(v||240),d=c.time*1e3+a},add:function(v,g,p){var y=g?function(_,S,A,q){v(_,S,A,q),c.remove(y)}:v;return c.remove(v),i[p?"unshift":"push"](y),zr(),y},remove:function(v,g){~(g=i.indexOf(v))&&i.splice(g,1)&&h>=g&&h--},_listeners:i},c}(),zr=function(){return!La&&dn.wake()},Y={},l2=/^[\d.\-M][\d.\-,\s]/,r2=/["']/g,a2=function(t){for(var e={},l=t.substr(1,t.length-3).split(":"),r=l[0],a=1,d=l.length,i,u,o;a<d;a++)u=l[a],i=a!==d-1?u.lastIndexOf(","):u.length,o=u.substr(0,i),e[r]=isNaN(o)?o.replace(r2,"").trim():+o,r=u.substr(i+1).trim();return e},d2=function(t){var e=t.indexOf("(")+1,l=t.indexOf(")"),r=t.indexOf("(",e);return t.substring(e,~r&&r<l?t.indexOf(")",l+1):l)},i2=function(t){var e=(t+"").split("("),l=Y[e[0]];return l&&e.length>1&&l.config?l.config.apply(null,~t.indexOf("{")?[a2(e[1])]:d2(t).split(",").map(hm)):Y._CE&&l2.test(t)?Y._CE("",t):l},u2=function(t){return function(e){return 1-t(1-e)}},ql=function(t,e){return t&&(mt(t)?t:Y[t]||i2(t))||e},Ul=function(t,e,l,r){l===void 0&&(l=function(u){return 1-e(1-u)}),r===void 0&&(r=function(u){return u<.5?e(u*2)/2:1-e((1-u)*2)/2});var a={easeIn:e,easeOut:l,easeInOut:r},d;return Wt(t,function(i){Y[i]=bn[i]=a,Y[d=i.toLowerCase()]=l;for(var u in a)Y[d+(u==="easeIn"?".in":u==="easeOut"?".out":".inOut")]=Y[i+"."+u]=a[u]}),a},Mm=function(t){return function(e){return e<.5?(1-t(1-e*2))/2:.5+t((e-.5)*2)/2}},Xu=function n(t,e,l){var r=e>=1?e:1,a=(l||(t?.3:.45))/(e<1?e:1),d=a/Zo*(Math.asin(1/r)||0),i=function(s){return s===1?1:r*Math.pow(2,-10*s)*Cv((s-d)*a)+1},u=t==="out"?i:t==="in"?function(o){return 1-i(1-o)}:Mm(i);return a=Zo/a,u.config=function(o,s){return n(t,o,s)},u},Gu=function n(t,e){e===void 0&&(e=1.70158);var l=function(d){return d?--d*d*((e+1)*d+e)+1:0},r=t==="out"?l:t==="in"?function(a){return 1-l(1-a)}:Mm(l);return r.config=function(a){return n(t,a)},r};Wt("Linear,Quad,Cubic,Quart,Quint,Strong",function(n,t){var e=t<5?t+1:t;Ul(n+",Power"+(e-1),t?function(l){return Math.pow(l,e)}:function(l){return l},function(l){return 1-Math.pow(1-l,e)},function(l){return l<.5?Math.pow(l*2,e)/2:1-Math.pow((1-l)*2,e)/2})});Y.Linear.easeNone=Y.none=Y.Linear.easeIn;Ul("Elastic",Xu("in"),Xu("out"),Xu());(function(n,t){var e=1/t,l=2*e,r=2.5*e,a=function(i){return i<e?n*i*i:i<l?n*Math.pow(i-1.5/t,2)+.75:i<r?n*(i-=2.25/t)*i+.9375:n*Math.pow(i-2.625/t,2)+.984375};Ul("Bounce",function(d){return 1-a(1-d)},a)})(7.5625,2.75);Ul("Expo",function(n){return Math.pow(2,10*(n-1))*n+n*n*n*n*n*n*(1-n)});Ul("Circ",function(n){return-(lm(1-n*n)-1)});Ul("Sine",function(n){return n===1?1:-Mv(n*Ov)+1});Ul("Back",Gu("in"),Gu("out"),Gu());Y.SteppedEase=Y.steps=bn.SteppedEase={config:function(t,e){t===void 0&&(t=1);var l=1/t,r=t+(e?0:1),a=e?1:0,d=1-tt;return function(i){return((r*rd(0,d,i)|0)+a)*l}}};wa.ease=Y["quad.out"];Wt("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt",function(n){return Sc+=n+","+n+"Params,"});var Cm=function(t,e){this.id=Rv++,t._gsap=this,this.target=t,this.harness=e,this.get=e?e.get:cm,this.set=e?e.getSetter:Ac},Ya=function(){function n(e){this.vars=e,this._delay=+e.delay||0,(this._repeat=e.repeat===1/0?-2:e.repeat||0)&&(this._rDelay=e.repeatDelay||0,this._yoyo=!!e.yoyo||!!e.yoyoEase),this._ts=1,Er(this,+e.duration,1,1),this.data=e.data,ot&&(this._ctx=ot,ot.data.push(this)),La||dn.wake()}var t=n.prototype;return t.delay=function(l){return l||l===0?(this.parent&&this.parent.smoothChildTiming&&this.startTime(this._start+l-this._delay),this._delay=l,this):this._delay},t.duration=function(l){return arguments.length?this.totalDuration(this._repeat>0?l+(l+this._rDelay)*this._repeat:l):this.totalDuration()&&this._dur},t.totalDuration=function(l){return arguments.length?(this._dirty=0,Er(this,this._repeat<0?l:(l-this._repeat*this._rDelay)/(this._repeat+1))):this._tDur},t.totalTime=function(l,r){if(zr(),!arguments.length)return this._tTime;var a=this._dp;if(a&&a.smoothChildTiming&&this._ts){for(Pi(this,l),!a._dp||a.parent||mm(a,this);a&&a.parent;)a.parent._time!==a._start+(a._ts>=0?a._tTime/a._ts:(a.totalDuration()-a._tTime)/-a._ts)&&a.totalTime(a._tTime,!0),a=a.parent;!this.parent&&this._dp.autoRemoveChildren&&(this._ts>0&&l<this._tDur||this._ts<0&&l>0||!this._tDur&&!l)&&Qn(this._dp,this,this._start-this._delay)}return(this._tTime!==l||!this._dur&&!r||this._initted&&Math.abs(this._zTime)===tt||!this._initted&&this._dur&&l||!l&&!this._initted&&(this.add||this._ptLookup))&&(this._ts||(this._pTime=l),fm(this,l,r)),this},t.time=function(l,r){return arguments.length?this.totalTime(Math.min(this.totalDuration(),l+bh(this))%(this._dur+this._rDelay)||(l?this._dur:0),r):this._time},t.totalProgress=function(l,r){return arguments.length?this.totalTime(this.totalDuration()*l,r):this.totalDuration()?Math.min(1,this._tTime/this._tDur):this.rawTime()>=0&&this._initted?1:0},t.progress=function(l,r){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&!(this.iteration()&1)?1-l:l)+bh(this),r):this.duration()?Math.min(1,this._time/this._dur):this.rawTime()>0?1:0},t.iteration=function(l,r){var a=this.duration()+this._rDelay;return arguments.length?this.totalTime(this._time+(l-1)*a,r):this._repeat?xr(this._tTime,a)+1:1},t.timeScale=function(l,r){if(!arguments.length)return this._rts===-tt?0:this._rts;if(this._rts===l)return this;var a=this.parent&&this._ts?xi(this.parent._time,this):this._tTime;return this._rts=+l||0,this._ts=this._ps||l===-tt?0:this._rts,this.totalTime(rd(-Math.abs(this._delay),this.totalDuration(),a),r!==!1),Fi(this),Xv(this)},t.paused=function(l){return arguments.length?(this._ps!==l&&(this._ps=l,l?(this._pTime=this._tTime||Math.max(-this._delay,this.rawTime()),this._ts=this._act=0):(zr(),this._ts=this._rts,this.totalTime(this.parent&&!this.parent.smoothChildTiming?this.rawTime():this._tTime||this._pTime,this.progress()===1&&Math.abs(this._zTime)!==tt&&(this._tTime-=tt)))),this):this._ps},t.startTime=function(l){if(arguments.length){this._start=ct(l);var r=this.parent||this._dp;return r&&(r._sort||!this.parent)&&Qn(r,this,this._start-this._delay),this}return this._start},t.endTime=function(l){return this._start+($t(l)?this.totalDuration():this.duration())/Math.abs(this._ts||1)},t.rawTime=function(l){var r=this.parent||this._dp;return r?l&&(!this._ts||this._repeat&&this._time&&this.totalProgress()<1)?this._tTime%(this._dur+this._rDelay):this._ts?xi(r.rawTime(l),this):this._tTime:this._tTime},t.revert=function(l){l===void 0&&(l=Hv);var r=Bt;return Bt=l,Tc(this)&&(this.timeline&&this.timeline.revert(l),this.totalTime(-.01,l.suppressEvents)),this.data!=="nested"&&l.kill!==!1&&this.kill(),Bt=r,this},t.globalTime=function(l){for(var r=this,a=arguments.length?l:r.rawTime();r;)a=r._start+a/(Math.abs(r._ts)||1),r=r._dp;return!this.parent&&this._sat?this._sat.globalTime(l):a},t.repeat=function(l){return arguments.length?(this._repeat=l===1/0?-2:l,_h(this)):this._repeat===-2?1/0:this._repeat},t.repeatDelay=function(l){if(arguments.length){var r=this._time;return this._rDelay=l,_h(this),r?this.time(r):this}return this._rDelay},t.yoyo=function(l){return arguments.length?(this._yoyo=l,this):this._yoyo},t.seek=function(l,r){return this.totalTime(Tn(this,l),$t(r))},t.restart=function(l,r){return this.play().totalTime(l?-this._delay:0,$t(r)),this._dur||(this._zTime=-tt),this},t.play=function(l,r){return l!=null&&this.seek(l,r),this.reversed(!1).paused(!1)},t.reverse=function(l,r){return l!=null&&this.seek(l||this.totalDuration(),r),this.reversed(!0).paused(!1)},t.pause=function(l,r){return l!=null&&this.seek(l,r),this.paused(!0)},t.resume=function(){return this.paused(!1)},t.reversed=function(l){return arguments.length?(!!l!==this.reversed()&&this.timeScale(-this._rts||(l?-tt:0)),this):this._rts<0},t.invalidate=function(){return this._initted=this._act=0,this._zTime=-tt,this},t.isActive=function(){var l=this.parent||this._dp,r=this._start,a;return!!(!l||this._ts&&this._initted&&l.isActive()&&(a=l.rawTime(!0))>=r&&a<this.endTime(!0)-tt)},t.eventCallback=function(l,r,a){var d=this.vars;return arguments.length>1?(r?(d[l]=r,a&&(d[l+"Params"]=a),l==="onUpdate"&&(this._onUpdate=r)):delete d[l],this):d[l]},t.then=function(l){var r=this,a=r._prom;return new Promise(function(d){var i=mt(l)?l:pm,u=function(){var s=r.then;r.then=null,a&&a(),mt(i)&&(i=i(r))&&(i.then||i===r)&&(r.then=s),d(i),r.then=s};r._initted&&r.totalProgress()===1&&r._ts>=0||!r._tTime&&r._ts<0?u():r._prom=u})},t.kill=function(){Ir(this)},n}();_n(Ya.prototype,{_time:0,_start:0,_end:0,_tTime:0,_tDur:0,_dirty:0,_repeat:0,_yoyo:!1,parent:null,_initted:!1,_rDelay:0,_ts:1,_dp:0,ratio:0,_zTime:-tt,_prom:0,_ps:!1,_rts:1});var Kt=function(n){em(t,n);function t(l,r){var a;return l===void 0&&(l={}),a=n.call(this,l)||this,a.labels={},a.smoothChildTiming=!!l.smoothChildTiming,a.autoRemoveChildren=!!l.autoRemoveChildren,a._sort=$t(l.sortChildren),ft&&Qn(l.parent||ft,ae(a),r),l.reversed&&a.reverse(),l.paused&&a.paused(!0),l.scrollTrigger&&ym(ae(a),l.scrollTrigger),a}var e=t.prototype;return e.to=function(r,a,d){return ya(0,arguments,this),this},e.from=function(r,a,d){return ya(1,arguments,this),this},e.fromTo=function(r,a,d,i){return ya(2,arguments,this),this},e.set=function(r,a,d){return a.duration=0,a.parent=this,ma(a).repeatDelay||(a.repeat=0),a.immediateRender=!!a.immediateRender,new qt(r,a,Tn(this,d),1),this},e.call=function(r,a,d){return Qn(this,qt.delayedCall(0,r,a),d)},e.staggerTo=function(r,a,d,i,u,o,s){return d.duration=a,d.stagger=d.stagger||i,d.onComplete=o,d.onCompleteParams=s,d.parent=this,new qt(r,d,Tn(this,u)),this},e.staggerFrom=function(r,a,d,i,u,o,s){return d.runBackwards=1,ma(d).immediateRender=$t(d.immediateRender),this.staggerTo(r,a,d,i,u,o,s)},e.staggerFromTo=function(r,a,d,i,u,o,s,c){return i.startAt=d,ma(i).immediateRender=$t(i.immediateRender),this.staggerTo(r,a,i,u,o,s,c)},e.render=function(r,a,d){var i=this._time,u=this._dirty?this.totalDuration():this._tDur,o=this._dur,s=r<=0?0:ct(r),c=this._zTime<0!=r<0&&(this._initted||!o),f,h,b,m,v,g,p,y,_,S,A,q;if(this!==ft&&s>u&&r>=0&&(s=u),s!==this._tTime||d||c){if(i!==this._time&&o&&(s+=this._time-i,r+=this._time-i),f=s,_=this._start,y=this._ts,g=!y,c&&(o||(i=this._zTime),(r||!a)&&(this._zTime=r)),this._repeat){if(A=this._yoyo,v=o+this._rDelay,this._repeat<-1&&r<0)return this.totalTime(v*100+r,a,d);if(f=ct(s%v),s===u?(m=this._repeat,f=o):(S=ct(s/v),m=~~S,m&&m===S&&(f=o,m--),f>o&&(f=o)),S=xr(this._tTime,v),!i&&this._tTime&&S!==m&&this._tTime-S*v-this._dur<=0&&(S=m),A&&m&1&&(f=o-f,q=1),m!==S&&!this._lock){var E=A&&S&1,x=E===(A&&m&1);if(m<S&&(E=!E),i=E?0:s%o?o:s,this._lock=1,this.render(i||(q?0:ct(m*v)),a,!o)._lock=0,this._tTime=s,!a&&this.parent&&on(this,"onRepeat"),this.vars.repeatRefresh&&!q&&(this.invalidate()._lock=1,S=m),i&&i!==this._time||g!==!this._ts||this.vars.onRepeat&&!this.parent&&!this._act)return this;if(o=this._dur,u=this._tDur,x&&(this._lock=2,i=E?o:-1e-4,this.render(i,!0),this.vars.repeatRefresh&&!q&&this.invalidate()),this._lock=0,!this._ts&&!g)return this}}if(this._hasPause&&!this._forcing&&this._lock<2&&(p=Zv(this,ct(i),ct(f)),p&&(s-=f-(f=p._start))),this._tTime=s,this._time=f,this._act=!!y,this._initted||(this._onUpdate=this.vars.onUpdate,this._initted=1,this._zTime=r,i=0),!i&&s&&o&&!a&&!S&&(on(this,"onStart"),this._tTime!==s))return this;if(f>=i&&r>=0)for(h=this._first;h;){if(b=h._next,(h._act||f>=h._start)&&h._ts&&p!==h){if(h.parent!==this)return this.render(r,a,d);if(h.render(h._ts>0?(f-h._start)*h._ts:(h._dirty?h.totalDuration():h._tDur)+(f-h._start)*h._ts,a,d),f!==this._time||!this._ts&&!g){p=0,b&&(s+=this._zTime=-tt);break}}h=b}else{h=this._last;for(var R=r<0?r:f;h;){if(b=h._prev,(h._act||R<=h._end)&&h._ts&&p!==h){if(h.parent!==this)return this.render(r,a,d);if(h.render(h._ts>0?(R-h._start)*h._ts:(h._dirty?h.totalDuration():h._tDur)+(R-h._start)*h._ts,a,d||Bt&&Tc(h)),f!==this._time||!this._ts&&!g){p=0,b&&(s+=this._zTime=R?-tt:tt);break}}h=b}}if(p&&!a&&(this.pause(),p.render(f>=i?0:-tt)._zTime=f>=i?1:-1,this._ts))return this._start=_,Fi(this),this.render(r,a,d);this._onUpdate&&!a&&on(this,"onUpdate",!0),(s===u&&this._tTime>=this.totalDuration()||!s&&i)&&(_===this._start||Math.abs(y)!==Math.abs(this._ts))&&(this._lock||((r||!o)&&(s===u&&this._ts>0||!s&&this._ts<0)&&tl(this,1),!a&&!(r<0&&!i)&&(s||i||!u)&&(on(this,s===u&&r>=0?"onComplete":"onReverseComplete",!0),this._prom&&!(s<u&&this.timeScale()>0)&&this._prom())))}return this},e.add=function(r,a){var d=this;if(Se(a)||(a=Tn(this,a,r)),!(r instanceof Ya)){if(jt(r))return r.forEach(function(i){return d.add(i,a)}),this;if(Rt(r))return this.addLabel(r,a);if(mt(r))r=qt.delayedCall(0,r);else return this}return this!==r?Qn(this,r,a):this},e.getChildren=function(r,a,d,i){r===void 0&&(r=!0),a===void 0&&(a=!0),d===void 0&&(d=!0),i===void 0&&(i=-Mn);for(var u=[],o=this._first;o;)o._start>=i&&(o instanceof qt?a&&u.push(o):(d&&u.push(o),r&&u.push.apply(u,o.getChildren(!0,a,d)))),o=o._next;return u},e.getById=function(r){for(var a=this.getChildren(1,1,1),d=a.length;d--;)if(a[d].vars.id===r)return a[d]},e.remove=function(r){return Rt(r)?this.removeLabel(r):mt(r)?this.killTweensOf(r):(r.parent===this&&Wi(this,r),r===this._recent&&(this._recent=this._last),Sl(this))},e.totalTime=function(r,a){return arguments.length?(this._forcing=1,!this._dp&&this._ts&&(this._start=ct(dn.time-(this._ts>0?r/this._ts:(this.totalDuration()-r)/-this._ts))),n.prototype.totalTime.call(this,r,a),this._forcing=0,this):this._tTime},e.addLabel=function(r,a){return this.labels[r]=Tn(this,a),this},e.removeLabel=function(r){return delete this.labels[r],this},e.addPause=function(r,a,d){var i=qt.delayedCall(0,a||Ha,d);return i.data="isPause",this._hasPause=1,Qn(this,i,Tn(this,r))},e.removePause=function(r){var a=this._first;for(r=Tn(this,r);a;)a._start===r&&a.data==="isPause"&&tl(a),a=a._next},e.killTweensOf=function(r,a,d){for(var i=this.getTweensOf(r,d),u=i.length;u--;)we!==i[u]&&i[u].kill(r,a);return this},e.getTweensOf=function(r,a){for(var d=[],i=Cn(r),u=this._first,o=Se(a),s;u;)u instanceof qt?jv(u._targets,i)&&(o?(!we||u._initted&&u._ts)&&u.globalTime(0)<=a&&u.globalTime(u.totalDuration())>a:!a||u.isActive())&&d.push(u):(s=u.getTweensOf(i,a)).length&&d.push.apply(d,s),u=u._next;return d},e.tweenTo=function(r,a){a=a||{};var d=this,i=Tn(d,r),u=a,o=u.startAt,s=u.onStart,c=u.onStartParams,f=u.immediateRender,h,b=qt.to(d,_n({ease:a.ease||"none",lazy:!1,immediateRender:!1,time:i,overwrite:"auto",duration:a.duration||Math.abs((i-(o&&"time"in o?o.time:d._time))/d.timeScale())||tt,onStart:function(){if(d.pause(),!h){var v=a.duration||Math.abs((i-(o&&"time"in o?o.time:d._time))/d.timeScale());b._dur!==v&&Er(b,v,0,1).render(b._time,!0,!0),h=1}s&&s.apply(b,c||[])}},a));return f?b.render(0):b},e.tweenFromTo=function(r,a,d){return this.tweenTo(a,_n({startAt:{time:Tn(this,r)}},d))},e.recent=function(){return this._recent},e.nextLabel=function(r){return r===void 0&&(r=this._time),vh(this,Tn(this,r))},e.previousLabel=function(r){return r===void 0&&(r=this._time),vh(this,Tn(this,r),1)},e.currentLabel=function(r){return arguments.length?this.seek(r,!0):this.previousLabel(this._time+tt)},e.shiftChildren=function(r,a,d){d===void 0&&(d=0);var i=this._first,u=this.labels,o;for(r=ct(r);i;)i._start>=d&&(i._start+=r,i._end+=r),i=i._next;if(a)for(o in u)u[o]>=d&&(u[o]+=r);return Sl(this)},e.invalidate=function(r){var a=this._first;for(this._lock=0;a;)a.invalidate(r),a=a._next;return n.prototype.invalidate.call(this,r)},e.clear=function(r){r===void 0&&(r=!0);for(var a=this._first,d;a;)d=a._next,this.remove(a),a=d;return this._dp&&(this._time=this._tTime=this._pTime=0),r&&(this.labels={}),Sl(this)},e.totalDuration=function(r){var a=0,d=this,i=d._last,u=Mn,o,s,c;if(arguments.length)return d.timeScale((d._repeat<0?d.duration():d.totalDuration())/(d.reversed()?-r:r));if(d._dirty){for(c=d.parent;i;)o=i._prev,i._dirty&&i.totalDuration(),s=i._start,s>u&&d._sort&&i._ts&&!d._lock?(d._lock=1,Qn(d,i,s-i._delay,1)._lock=0):u=s,s<0&&i._ts&&(a-=s,(!c&&!d._dp||c&&c.smoothChildTiming)&&(d._start+=ct(s/d._ts),d._time-=s,d._tTime-=s),d.shiftChildren(-s,!1,-1/0),u=0),i._end>a&&i._ts&&(a=i._end),i=o;Er(d,d===ft&&d._time>a?d._time:a,1,1),d._dirty=0}return d._tDur},t.updateRoot=function(r){if(ft._ts&&(fm(ft,xi(r,ft)),sm=dn.frame),dn.frame>=mh){mh+=gn.autoSleep||120;var a=ft._first;if((!a||!a._ts)&&gn.autoSleep&&dn._listeners.length<2){for(;a&&!a._ts;)a=a._next;a||dn.sleep()}}},t}(Ya);_n(Kt.prototype,{_lock:0,_hasPause:0,_forcing:0});var o2=function(t,e,l,r,a,d,i){var u=new Ft(this._pt,t,e,0,1,Hm,null,a),o=0,s=0,c,f,h,b,m,v,g,p;for(u.b=l,u.e=r,l+="",r+="",(g=~r.indexOf("random("))&&(r=ja(r)),d&&(p=[l,r],d(p,t,e),l=p[0],r=p[1]),f=l.match(ju)||[];c=ju.exec(r);)b=c[0],m=r.substring(o,c.index),h?h=(h+1)%5:m.substr(-5)==="rgba("&&(h=1),b!==f[s++]&&(v=parseFloat(f[s-1])||0,u._pt={_next:u._pt,p:m||s===1?m:",",s:v,c:b.charAt(1)==="="?or(v,b)-v:parseFloat(b)-v,m:h&&h<4?Math.round:0},o=ju.lastIndex);return u.c=o<r.length?r.substring(o,r.length):"",u.fp=i,(dm.test(r)||g)&&(u.e=0),this._pt=u,u},xc=function(t,e,l,r,a,d,i,u,o,s){mt(r)&&(r=r(a||0,t,d));var c=t[e],f=l!=="get"?l:mt(c)?o?t[e.indexOf("set")||!mt(t["get"+e.substr(3)])?e:"get"+e.substr(3)](o):t[e]():c,h=mt(c)?o?p2:wm:zc,b;if(Rt(r)&&(~r.indexOf("random(")&&(r=ja(r)),r.charAt(1)==="="&&(b=or(f,r)+(Ht(f)||0),(b||b===0)&&(r=b))),!s||f!==r||ts)return!isNaN(f*r)&&r!==""?(b=new Ft(this._pt,t,e,+f||0,r-(f||0),typeof c=="boolean"?m2:Bm,0,h),o&&(b.fp=o),i&&b.modifier(i,this,t),this._pt=b):(!c&&!(e in t)&&_c(e,r),o2.call(this,t,e,f,r,h,u||gn.stringFilter,o))},s2=function(t,e,l,r,a){if(mt(t)&&(t=ba(t,a,e,l,r)),!Wn(t)||t.style&&t.nodeType||jt(t)||rm(t))return Rt(t)?ba(t,a,e,l,r):t;var d={},i;for(i in t)d[i]=ba(t[i],a,e,l,r);return d},km=function(t,e,l,r,a,d){var i,u,o,s;if(ln[t]&&(i=new ln[t]).init(a,i.rawVars?e[t]:s2(e[t],r,a,d,l),l,r,d)!==!1&&(l._pt=u=new Ft(l._pt,a,t,0,1,i.render,i,0,i.priority),l!==nr))for(o=l._ptLookup[l._targets.indexOf(a)],s=i._props.length;s--;)o[i._props[s]]=u;return i},we,ts,Ec=function n(t,e,l){var r=t.vars,a=r.ease,d=r.startAt,i=r.immediateRender,u=r.lazy,o=r.onUpdate,s=r.runBackwards,c=r.yoyoEase,f=r.keyframes,h=r.autoRevert,b=t._dur,m=t._startAt,v=t._targets,g=t.parent,p=g&&g.data==="nested"?g.vars.targets:v,y=t._overwrite==="auto"&&!gc,_=t.timeline,S=r.easeReverse||c,A,q,E,x,R,H,X,Z,P,G,O,M,C;if(_&&(!f||!a)&&(a="none"),t._ease=ql(a,wa.ease),t._rEase=S&&(ql(S)||t._ease),t._from=!_&&!!r.runBackwards,t._from&&(t.ratio=1),!_||f&&!r.stagger){if(Z=v[0]?vl(v[0]).harness:0,M=Z&&r[Z.prop],A=Ti(r,vc),m&&(m._zTime<0&&m.progress(1),e<0&&s&&i&&!h?m.render(-1,!0):m.revert(s&&b?Yd:Bv),m._lazy=0),d){if(tl(t._startAt=qt.set(v,_n({data:"isStart",overwrite:!1,parent:g,immediateRender:!0,lazy:!m&&$t(u),startAt:null,delay:0,onUpdate:o&&function(){return on(t,"onUpdate")},stagger:0},d))),t._startAt._dp=0,t._startAt._sat=t,e<0&&(Bt||!i&&!h)&&t._startAt.revert(Yd),i&&b&&e<=0&&l<=0){e&&(t._zTime=e);return}}else if(s&&b&&!m){if(e&&(i=!1),E=_n({overwrite:!1,data:"isFromStart",lazy:i&&!m&&$t(u),immediateRender:i,stagger:0,parent:g},A),M&&(E[Z.prop]=M),tl(t._startAt=qt.set(v,E)),t._startAt._dp=0,t._startAt._sat=t,e<0&&(Bt?t._startAt.revert(Yd):t._startAt.render(-1,!0)),t._zTime=e,!i)n(t._startAt,tt,tt);else if(!e)return}for(t._pt=t._ptCache=0,u=b&&$t(u)||u&&!b,q=0;q<v.length;q++){if(R=v[q],X=R._gsap||qc(v)[q]._gsap,t._ptLookup[q]=G={},Jo[X.id]&&Je.length&&qi(),O=p===v?q:p.indexOf(R),Z&&(P=new Z).init(R,M||A,t,O,p)!==!1&&(t._pt=x=new Ft(t._pt,R,P.name,0,1,P.render,P,0,P.priority),P._props.forEach(function($){G[$]=x}),P.priority&&(H=1)),!Z||M)for(E in A)ln[E]&&(P=km(E,A,t,O,R,p))?P.priority&&(H=1):G[E]=x=xc.call(t,R,E,"get",A[E],O,p,0,r.stringFilter);t._op&&t._op[q]&&t.kill(R,t._op[q]),y&&t._pt&&(we=t,ft.killTweensOf(R,G,t.globalTime(e)),C=!t.parent,we=0),t._pt&&u&&(Jo[X.id]=1)}H&&jm(t),t._onInit&&t._onInit(t)}t._onUpdate=o,t._initted=(!t._op||t._pt)&&!C,f&&e<=0&&_.render(Mn,!0,!0)},c2=function(t,e,l,r,a,d,i,u){var o=(t._pt&&t._ptCache||(t._ptCache={}))[e],s,c,f,h;if(!o)for(o=t._ptCache[e]=[],f=t._ptLookup,h=t._targets.length;h--;){if(s=f[h][e],s&&s.d&&s.d._pt)for(s=s.d._pt;s&&s.p!==e&&s.fp!==e;)s=s._next;if(!s)return ts=1,t.vars[e]="+=0",Ec(t,i),ts=0,u?Ba(e+" not eligible for reset. Try splitting into individual properties"):1;o.push(s)}for(h=o.length;h--;)c=o[h],s=c._pt||c,s.s=(r||r===0)&&!a?r:s.s+(r||0)+d*s.c,s.c=l-s.s,c.e&&(c.e=yt(l)+Ht(c.e)),c.b&&(c.b=s.s+Ht(c.b))},f2=function(t,e){var l=t[0]?vl(t[0]).harness:0,r=l&&l.aliases,a,d,i,u;if(!r)return e;a=Tr({},e);for(d in r)if(d in a)for(u=r[d].split(","),i=u.length;i--;)a[u[i]]=a[d];return a},h2=function(t,e,l,r){var a=e.ease||r||"power1.inOut",d,i;if(jt(e))i=l[t]||(l[t]=[]),e.forEach(function(u,o){return i.push({t:o/(e.length-1)*100,v:u,e:a})});else for(d in e)i=l[d]||(l[d]=[]),d==="ease"||i.push({t:parseFloat(t),v:e[d],e:a})},ba=function(t,e,l,r,a){return mt(t)?t.call(e,l,r,a):Rt(t)&&~t.indexOf("random(")?ja(t):t},Um=Sc+"repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert",Nm={};Wt(Um+",id,stagger,delay,duration,paused,scrollTrigger",function(n){return Nm[n]=1});var qt=function(n){em(t,n);function t(l,r,a,d){var i;typeof r=="number"&&(a.duration=r,r=a,a=null),i=n.call(this,d?r:ma(r))||this;var u=i.vars,o=u.duration,s=u.delay,c=u.immediateRender,f=u.stagger,h=u.overwrite,b=u.keyframes,m=u.defaults,v=u.scrollTrigger,g=r.parent||ft,p=(jt(l)||rm(l)?Se(l[0]):"length"in r)?[l]:Cn(l),y,_,S,A,q,E,x,R;if(i._targets=p.length?qc(p):Ba("GSAP target "+l+" not found. https://gsap.com",!gn.nullTargetWarn)||[],i._ptLookup=[],i._overwrite=h,b||f||qd(o)||qd(s)){r=i.vars;var H=r.easeReverse||r.yoyoEase;if(y=i.timeline=new Kt({data:"nested",defaults:m||{},targets:g&&g.data==="nested"?g.vars.targets:p}),y.kill(),y.parent=y._dp=ae(i),y._start=0,f||qd(o)||qd(s)){if(A=p.length,x=f&&Sm(f),Wn(f))for(q in f)~Um.indexOf(q)&&(R||(R={}),R[q]=f[q]);for(_=0;_<A;_++)S=Ti(r,Nm),S.stagger=0,H&&(S.easeReverse=H),R&&Tr(S,R),E=p[_],S.duration=+ba(o,ae(i),_,E,p),S.delay=(+ba(s,ae(i),_,E,p)||0)-i._delay,!f&&A===1&&S.delay&&(i._delay=s=S.delay,i._start+=s,S.delay=0),y.to(E,S,x?x(_,E,p):0),y._ease=Y.none;y.duration()?o=s=0:i.timeline=0}else if(b){ma(_n(y.vars.defaults,{ease:"none"})),y._ease=ql(b.ease||r.ease||"none");var X=0,Z,P,G;if(jt(b))b.forEach(function(O){return y.to(p,O,">")}),y.duration();else{S={};for(q in b)q==="ease"||q==="easeEach"||h2(q,b[q],S,b.easeEach);for(q in S)for(Z=S[q].sort(function(O,M){return O.t-M.t}),X=0,_=0;_<Z.length;_++)P=Z[_],G={ease:P.e,duration:(P.t-(_?Z[_-1].t:0))/100*o},G[q]=P.v,y.to(p,G,X),X+=G.duration;y.duration()<o&&y.to({},{duration:o-y.duration()})}}o||i.duration(o=y.duration())}else i.timeline=0;return h===!0&&!gc&&(we=ae(i),ft.killTweensOf(p),we=0),Qn(g,ae(i),a),r.reversed&&i.reverse(),r.paused&&i.paused(!0),(c||!o&&!b&&i._start===ct(g._time)&&$t(c)&&Gv(ae(i))&&g.data!=="nested")&&(i._tTime=-tt,i.render(Math.max(0,-s)||0)),v&&ym(ae(i),v),i}var e=t.prototype;return e.render=function(r,a,d){var i=this._time,u=this._tDur,o=this._dur,s=r<0,c=r>u-tt&&!s?u:r<tt?0:r,f,h,b,m,v,g,p,y;if(!o)Vv(this,r,a,d);else if(c!==this._tTime||!r||d||!this._initted&&this._tTime||this._startAt&&this._zTime<0!==s||this._lazy){if(f=c,y=this.timeline,this._repeat){if(m=o+this._rDelay,this._repeat<-1&&s)return this.totalTime(m*100+r,a,d);if(f=ct(c%m),c===u?(b=this._repeat,f=o):(v=ct(c/m),b=~~v,b&&b===v?(f=o,b--):f>o&&(f=o)),g=this._yoyo&&b&1,g&&(f=o-f),v=xr(this._tTime,m),f===i&&!d&&this._initted&&b===v)return this._tTime=c,this;b!==v&&this.vars.repeatRefresh&&!g&&!this._lock&&f!==m&&this._initted&&(this._lock=d=1,this.render(ct(m*b),!0).invalidate()._lock=0)}if(!this._initted){if(bm(this,s?r:f,d,a,c))return this._tTime=0,this;if(i!==this._time&&!(d&&this.vars.repeatRefresh&&b!==v))return this;if(o!==this._dur)return this.render(r,a,d)}if(this._rEase){var _=f<i;if(_!==this._inv){var S=_?i:o-i;this._inv=_,this._from&&(this.ratio=1-this.ratio),this._invRatio=this.ratio,this._invTime=i,this._invRecip=S?(_?-1:1)/S:0,this._invScale=_?-this.ratio:1-this.ratio,this._invEase=_?this._rEase:this._ease}this.ratio=p=this._invRatio+this._invScale*this._invEase((f-this._invTime)*this._invRecip)}else this.ratio=p=this._ease(f/o);if(this._from&&(this.ratio=p=1-p),this._tTime=c,this._time=f,!this._act&&this._ts&&(this._act=1,this._lazy=0),!i&&c&&!a&&!v&&(on(this,"onStart"),this._tTime!==c))return this;for(h=this._pt;h;)h.r(p,h.d),h=h._next;y&&y.render(r<0?r:y._dur*y._ease(f/this._dur),a,d)||this._startAt&&(this._zTime=r),this._onUpdate&&!a&&(s&&$o(this,r,a,d),on(this,"onUpdate")),this._repeat&&b!==v&&this.vars.onRepeat&&!a&&this.parent&&on(this,"onRepeat"),(c===this._tDur||!c)&&this._tTime===c&&(s&&!this._onUpdate&&$o(this,r,!0,!0),(r||!o)&&(c===this._tDur&&this._ts>0||!c&&this._ts<0)&&tl(this,1),!a&&!(s&&!i)&&(c||i||g)&&(on(this,c===u?"onComplete":"onReverseComplete",!0),this._prom&&!(c<u&&this.timeScale()>0)&&this._prom()))}return this},e.targets=function(){return this._targets},e.invalidate=function(r){return(!r||!this.vars.runBackwards)&&(this._startAt=0),this._pt=this._op=this._onUpdate=this._lazy=this.ratio=0,this._ptLookup=[],this.timeline&&this.timeline.invalidate(r),n.prototype.invalidate.call(this,r)},e.resetTo=function(r,a,d,i,u){La||dn.wake(),this._ts||this.play();var o=Math.min(this._dur,(this._dp._time-this._start)*this._ts),s;return this._initted||Ec(this,o),s=this._ease(o/this._dur),c2(this,r,a,d,i,s,o,u)?this.resetTo(r,a,d,i,1):(Pi(this,0),this.parent||gm(this._dp,this,"_first","_last",this._dp._sort?"_start":0),this.render(0))},e.kill=function(r,a){if(a===void 0&&(a="all"),!r&&(!a||a==="all"))return this._lazy=this._pt=0,this.parent?Ir(this):this.scrollTrigger&&this.scrollTrigger.kill(!!Bt),this;if(this.timeline){var d=this.timeline.totalDuration();return this.timeline.killTweensOf(r,a,we&&we.vars.overwrite!==!0)._first||Ir(this),this.parent&&d!==this.timeline.totalDuration()&&Er(this,this._dur*this.timeline._tDur/d,0,1),this}var i=this._targets,u=r?Cn(r):i,o=this._ptLookup,s=this._pt,c,f,h,b,m,v,g;if((!a||a==="all")&&Yv(i,u))return a==="all"&&(this._pt=0),Ir(this);for(c=this._op=this._op||[],a!=="all"&&(Rt(a)&&(m={},Wt(a,function(p){return m[p]=1}),a=m),a=f2(i,a)),g=i.length;g--;)if(~u.indexOf(i[g])){f=o[g],a==="all"?(c[g]=a,b=f,h={}):(h=c[g]=c[g]||{},b=a);for(m in b)v=f&&f[m],v&&((!("kill"in v.d)||v.d.kill(m)===!0)&&Wi(this,v,"_pt"),delete f[m]),h!=="all"&&(h[m]=1)}return this._initted&&!this._pt&&s&&Ir(this),this},t.to=function(r,a){return new t(r,a,arguments[2])},t.from=function(r,a){return ya(1,arguments)},t.delayedCall=function(r,a,d,i){return new t(a,0,{immediateRender:!1,lazy:!1,overwrite:!1,delay:r,onComplete:a,onReverseComplete:a,onCompleteParams:d,onReverseCompleteParams:d,callbackScope:i})},t.fromTo=function(r,a,d){return ya(2,arguments)},t.set=function(r,a){return a.duration=0,a.repeatDelay||(a.repeat=0),new t(r,a)},t.killTweensOf=function(r,a,d){return ft.killTweensOf(r,a,d)},t}(Ya);_n(qt.prototype,{_targets:[],_lazy:0,_startAt:0,_op:0,_onInit:0});Wt("staggerTo,staggerFrom,staggerFromTo",function(n){qt[n]=function(){var t=new Kt,e=Fo.call(arguments,0);return e.splice(n==="staggerFromTo"?5:4,0,0),t[n].apply(t,e)}});var zc=function(t,e,l){return t[e]=l},wm=function(t,e,l){return t[e](l)},p2=function(t,e,l,r){return t[e](r.fp,l)},g2=function(t,e,l){return t.setAttribute(e,l)},Ac=function(t,e){return mt(t[e])?wm:mc(t[e])&&t.setAttribute?g2:zc},Bm=function(t,e){return e.set(e.t,e.p,Math.round((e.s+e.c*t)*1e6)/1e6,e)},m2=function(t,e){return e.set(e.t,e.p,!!(e.s+e.c*t),e)},Hm=function(t,e){var l=e._pt,r="";if(!t&&e.b)r=e.b;else if(t===1&&e.e)r=e.e;else{for(;l;)r=l.p+(l.m?l.m(l.s+l.c*t):Math.round((l.s+l.c*t)*1e4)/1e4)+r,l=l._next;r+=e.c}e.set(e.t,e.p,r,e)},Dc=function(t,e){for(var l=e._pt;l;)l.r(t,l.d),l=l._next},y2=function(t,e,l,r){for(var a=this._pt,d;a;)d=a._next,a.p===r&&a.modifier(t,e,l),a=d},b2=function(t){for(var e=this._pt,l,r;e;)r=e._next,e.p===t&&!e.op||e.op===t?Wi(this,e,"_pt"):e.dep||(l=1),e=r;return!l},_2=function(t,e,l,r){r.mSet(t,e,r.m.call(r.tween,l,r.mt),r)},jm=function(t){for(var e=t._pt,l,r,a,d;e;){for(l=e._next,r=a;r&&r.pr>e.pr;)r=r._next;(e._prev=r?r._prev:d)?e._prev._next=e:a=e,(e._next=r)?r._prev=e:d=e,e=l}t._pt=a},Ft=function(){function n(e,l,r,a,d,i,u,o,s){this.t=l,this.s=a,this.c=d,this.p=r,this.r=i||Bm,this.d=u||this,this.set=o||zc,this.pr=s||0,this._next=e,e&&(e._prev=this)}var t=n.prototype;return t.modifier=function(l,r,a){this.mSet=this.mSet||this.set,this.set=_2,this.m=l,this.mt=a,this.tween=r},n}();Wt(Sc+"parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse",function(n){return vc[n]=1});bn.TweenMax=bn.TweenLite=qt;bn.TimelineLite=bn.TimelineMax=Kt;ft=new Kt({sortChildren:!1,defaults:wa,autoRemoveChildren:!0,id:"root",smoothChildTiming:!0});gn.stringFilter=Rm;var Tl=[],Gd={},v2=[],qh=0,S2=0,Qu=function(t){return(Gd[t]||v2).map(function(e){return e()})},ns=function(){var t=Date.now(),e=[];t-qh>2&&(Qu("matchMediaInit"),Tl.forEach(function(l){var r=l.queries,a=l.conditions,d,i,u,o;for(i in r)d=Gn.matchMedia(r[i]).matches,d&&(u=1),d!==a[i]&&(a[i]=d,o=1);o&&(l.revert(),u&&e.push(l))}),Qu("matchMediaRevert"),e.forEach(function(l){return l.onMatch(l,function(r){return l.add(null,r)})}),qh=t,Qu("matchMedia"))},Lm=function(){function n(e,l){this.selector=l&&Po(l),this.data=[],this._r=[],this.isReverted=!1,this.id=S2++,e&&this.add(e)}var t=n.prototype;return t.add=function(l,r,a){mt(l)&&(a=r,r=l,l=mt);var d=this,i=function(){var o=ot,s=d.selector,c;return o&&o!==d&&o.data.push(d),a&&(d.selector=Po(a)),ot=d,c=r.apply(d,arguments),mt(c)&&d._r.push(c),ot=o,d.selector=s,d.isReverted=!1,c};return d.last=i,l===mt?i(d,function(u){return d.add(null,u)}):l?d[l]=i:i},t.ignore=function(l){var r=ot;ot=null,l(this),ot=r},t.getTweens=function(){var l=[];return this.data.forEach(function(r){return r instanceof n?l.push.apply(l,r.getTweens()):r instanceof qt&&!(r.parent&&r.parent.data==="nested")&&l.push(r)}),l},t.clear=function(){this._r.length=this.data.length=0},t.kill=function(l,r){var a=this;if(l?function(){for(var i=a.getTweens(),u=a.data.length,o;u--;)o=a.data[u],o.data==="isFlip"&&(o.revert(),o.getChildren(!0,!0,!1).forEach(function(s){return i.splice(i.indexOf(s),1)}));for(i.map(function(s){return{g:s._dur||s._delay||s._sat&&!s._sat.vars.immediateRender?s.globalTime(0):-1/0,t:s}}).sort(function(s,c){return c.g-s.g||-1/0}).forEach(function(s){return s.t.revert(l)}),u=a.data.length;u--;)o=a.data[u],o instanceof Kt?o.data!=="nested"&&(o.scrollTrigger&&o.scrollTrigger.revert(),o.kill()):!(o instanceof qt)&&o.revert&&o.revert(l);a._r.forEach(function(s){return s(l,a)}),a.isReverted=!0}():this.data.forEach(function(i){return i.kill&&i.kill()}),this.clear(),r)for(var d=Tl.length;d--;)Tl[d].id===this.id&&Tl.splice(d,1)},t.revert=function(l){this.kill(l||{})},n}(),q2=function(){function n(e){this.contexts=[],this.scope=e,ot&&ot.data.push(this)}var t=n.prototype;return t.add=function(l,r,a){Wn(l)||(l={matches:l});var d=new Lm(0,a||this.scope),i=d.conditions={},u,o,s;ot&&!d.selector&&(d.selector=ot.selector),this.contexts.push(d),r=d.add("onMatch",r),d.queries=l;for(o in l)o==="all"?s=1:(u=Gn.matchMedia(l[o]),u&&(Tl.indexOf(d)<0&&Tl.push(d),(i[o]=u.matches)&&(s=1),u.addListener?u.addListener(ns):u.addEventListener("change",ns)));return s&&r(d,function(c){return d.add(null,c)}),this},t.revert=function(l){this.kill(l||{})},t.kill=function(l){this.contexts.forEach(function(r){return r.kill(l,!0)})},n}(),Ei={registerPlugin:function(){for(var t=arguments.length,e=new Array(t),l=0;l<t;l++)e[l]=arguments[l];e.forEach(function(r){return Am(r)})},timeline:function(t){return new Kt(t)},getTweensOf:function(t,e){return ft.getTweensOf(t,e)},getProperty:function(t,e,l,r){Rt(t)&&(t=Cn(t)[0]);var a=vl(t||{}).get,d=l?pm:hm;return l==="native"&&(l=""),t&&(e?d((ln[e]&&ln[e].get||a)(t,e,l,r)):function(i,u,o){return d((ln[i]&&ln[i].get||a)(t,i,u,o))})},quickSetter:function(t,e,l){if(t=Cn(t),t.length>1){var r=t.map(function(s){return tn.quickSetter(s,e,l)}),a=r.length;return function(s){for(var c=a;c--;)r[c](s)}}t=t[0]||{};var d=ln[e],i=vl(t),u=i.harness&&(i.harness.aliases||{})[e]||e,o=d?function(s){var c=new d;nr._pt=0,c.init(t,l?s+l:s,nr,0,[t]),c.render(1,c),nr._pt&&Dc(1,nr)}:i.set(t,u);return d?o:function(s){return o(t,u,l?s+l:s,i,1)}},quickTo:function(t,e,l){var r,a=tn.to(t,_n((r={},r[e]="+=0.1",r.paused=!0,r.stagger=0,r),l||{})),d=function(u,o,s){return a.resetTo(e,u,o,s)};return d.tween=a,d},isTweening:function(t){return ft.getTweensOf(t,!0).length>0},defaults:function(t){return t&&t.ease&&(t.ease=ql(t.ease,wa.ease)),yh(wa,t||{})},config:function(t){return yh(gn,t||{})},registerEffect:function(t){var e=t.name,l=t.effect,r=t.plugins,a=t.defaults,d=t.extendTimeline;(r||"").split(",").forEach(function(i){return i&&!ln[i]&&!bn[i]&&Ba(e+" effect requires "+i+" plugin.")}),Lu[e]=function(i,u,o){return l(Cn(i),_n(u||{},a),o)},d&&(Kt.prototype[e]=function(i,u,o){return this.add(Lu[e](i,Wn(u)?u:(o=u)&&{},this),o)})},registerEase:function(t,e){Y[t]=ql(e)},parseEase:function(t,e){return arguments.length?ql(t,e):Y},getById:function(t){return ft.getById(t)},exportRoot:function(t,e){t===void 0&&(t={});var l=new Kt(t),r,a;for(l.smoothChildTiming=$t(t.smoothChildTiming),ft.remove(l),l._dp=0,l._time=l._tTime=ft._time,r=ft._first;r;)a=r._next,(e||!(!r._dur&&r instanceof qt&&r.vars.onComplete===r._targets[0]))&&Qn(l,r,r._start-r._delay),r=a;return Qn(ft,l,0),l},context:function(t,e){return t?new Lm(t,e):ot},matchMedia:function(t){return new q2(t)},matchMediaRefresh:function(){return Tl.forEach(function(t){var e=t.conditions,l,r;for(r in e)e[r]&&(e[r]=!1,l=1);l&&t.revert()})||ns()},addEventListener:function(t,e){var l=Gd[t]||(Gd[t]=[]);~l.indexOf(e)||l.push(e)},removeEventListener:function(t,e){var l=Gd[t],r=l&&l.indexOf(e);r>=0&&l.splice(r,1)},utils:{wrap:Iv,wrapYoyo:t2,distribute:Sm,random:Tm,snap:qm,normalize:Pv,getUnit:Ht,clamp:Jv,splitColor:Dm,toArray:Cn,selector:Po,mapRange:Em,pipe:Wv,unitize:Fv,interpolate:n2,shuffle:vm},install:um,effects:Lu,ticker:dn,updateRoot:Kt.updateRoot,plugins:ln,globalTimeline:ft,core:{PropTween:Ft,globals:om,Tween:qt,Timeline:Kt,Animation:Ya,getCache:vl,_removeLinkedListItem:Wi,reverting:function(){return Bt},context:function(t){return t&&ot&&(ot.data.push(t),t._ctx=ot),ot},suppressOverwrites:function(t){return gc=t}}};Wt("to,from,fromTo,delayedCall,set,killTweensOf",function(n){return Ei[n]=qt[n]});dn.add(Kt.updateRoot);nr=Ei.to({},{duration:0});var T2=function(t,e){for(var l=t._pt;l&&l.p!==e&&l.op!==e&&l.fp!==e;)l=l._next;return l},x2=function(t,e){var l=t._targets,r,a,d;for(r in e)for(a=l.length;a--;)d=t._ptLookup[a][r],d&&(d=d.d)&&(d._pt&&(d=T2(d,r)),d&&d.modifier&&d.modifier(e[r],t,l[a],r))},Vu=function(t,e){return{name:t,headless:1,rawVars:1,init:function(r,a,d){d._onInit=function(i){var u,o;if(Rt(a)&&(u={},Wt(a,function(s){return u[s]=1}),a=u),e){u={};for(o in a)u[o]=e(a[o]);a=u}x2(i,a)}}}},tn=Ei.registerPlugin({name:"attr",init:function(t,e,l,r,a){var d,i,u;this.tween=l;for(d in e)u=t.getAttribute(d)||"",i=this.add(t,"setAttribute",(u||0)+"",e[d],r,a,0,0,d),i.op=d,i.b=u,this._props.push(d)},render:function(t,e){for(var l=e._pt;l;)Bt?l.set(l.t,l.p,l.b,l):l.r(t,l.d),l=l._next}},{name:"endArray",headless:1,init:function(t,e){for(var l=e.length;l--;)this.add(t,l,t[l]||0,e[l],0,0,0,0,0,1)}},Vu("roundProps",Io),Vu("modifiers"),Vu("snap",qm))||Ei;qt.version=Kt.version=tn.version="3.15.0";im=1;yc()&&zr();Y.Power0;Y.Power1;Y.Power2;Y.Power3;Y.Power4;Y.Linear;Y.Quad;Y.Cubic;Y.Quart;Y.Quint;Y.Strong;Y.Elastic;Y.Back;Y.SteppedEase;Y.Bounce;Y.Sine;Y.Expo;Y.Circ;/*!
 * CSSPlugin 3.15.0
 * https://gsap.com
 *
 * Copyright 2008-2026, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/var Th,Be,sr,Oc,pl,xh,Rc,E2=function(){return typeof window<"u"},qe={},hl=180/Math.PI,cr=Math.PI/180,Hl=Math.atan2,Eh=1e8,Mc=/([A-Z])/g,z2=/(left|right|width|margin|padding|x)/i,A2=/[\s,\(]\S/,Jn={autoAlpha:"opacity,visibility",scale:"scaleX,scaleY",alpha:"opacity"},es=function(t,e){return e.set(e.t,e.p,Math.round((e.s+e.c*t)*1e4)/1e4+e.u,e)},D2=function(t,e){return e.set(e.t,e.p,t===1?e.e:Math.round((e.s+e.c*t)*1e4)/1e4+e.u,e)},O2=function(t,e){return e.set(e.t,e.p,t?Math.round((e.s+e.c*t)*1e4)/1e4+e.u:e.b,e)},R2=function(t,e){return e.set(e.t,e.p,t===1?e.e:t?Math.round((e.s+e.c*t)*1e4)/1e4+e.u:e.b,e)},M2=function(t,e){var l=e.s+e.c*t;e.set(e.t,e.p,~~(l+(l<0?-.5:.5))+e.u,e)},Ym=function(t,e){return e.set(e.t,e.p,t?e.e:e.b,e)},Xm=function(t,e){return e.set(e.t,e.p,t!==1?e.b:e.e,e)},C2=function(t,e,l){return t.style[e]=l},k2=function(t,e,l){return t.style.setProperty(e,l)},U2=function(t,e,l){return t._gsap[e]=l},N2=function(t,e,l){return t._gsap.scaleX=t._gsap.scaleY=l},w2=function(t,e,l,r,a){var d=t._gsap;d.scaleX=d.scaleY=l,d.renderTransform(a,d)},B2=function(t,e,l,r,a){var d=t._gsap;d[e]=l,d.renderTransform(a,d)},ht="transform",Pt=ht+"Origin",H2=function n(t,e){var l=this,r=this.target,a=r.style,d=r._gsap;if(t in qe&&a){if(this.tfm=this.tfm||{},t!=="transform")t=Jn[t]||t,~t.indexOf(",")?t.split(",").forEach(function(i){return l.tfm[i]=ie(r,i)}):this.tfm[t]=d.x?d[t]:ie(r,t),t===Pt&&(this.tfm.zOrigin=d.zOrigin);else return Jn.transform.split(",").forEach(function(i){return n.call(l,i,e)});if(this.props.indexOf(ht)>=0)return;d.svg&&(this.svgo=r.getAttribute("data-svg-origin"),this.props.push(Pt,e,"")),t=ht}(a||e)&&this.props.push(t,e,a[t])},Gm=function(t){t.translate&&(t.removeProperty("translate"),t.removeProperty("scale"),t.removeProperty("rotate"))},j2=function(){var t=this.props,e=this.target,l=e.style,r=e._gsap,a,d;for(a=0;a<t.length;a+=3)t[a+1]?t[a+1]===2?e[t[a]](t[a+2]):e[t[a]]=t[a+2]:t[a+2]?l[t[a]]=t[a+2]:l.removeProperty(t[a].substr(0,2)==="--"?t[a]:t[a].replace(Mc,"-$1").toLowerCase());if(this.tfm){for(d in this.tfm)r[d]=this.tfm[d];r.svg&&(r.renderTransform(),e.setAttribute("data-svg-origin",this.svgo||"")),a=Rc(),(!a||!a.isStart)&&!l[ht]&&(Gm(l),r.zOrigin&&l[Pt]&&(l[Pt]+=" "+r.zOrigin+"px",r.zOrigin=0,r.renderTransform()),r.uncache=1)}},Qm=function(t,e){var l={target:t,props:[],revert:j2,save:H2};return t._gsap||tn.core.getCache(t),e&&t.style&&t.nodeType&&e.split(",").forEach(function(r){return l.save(r)}),l},Vm,ls=function(t,e){var l=Be.createElementNS?Be.createElementNS((e||"http://www.w3.org/1999/xhtml").replace(/^https/,"http"),t):Be.createElement(t);return l&&l.style?l:Be.createElement(t)},sn=function n(t,e,l){var r=getComputedStyle(t);return r[e]||r.getPropertyValue(e.replace(Mc,"-$1").toLowerCase())||r.getPropertyValue(e)||!l&&n(t,Ar(e)||e,1)||""},zh="O,Moz,ms,Ms,Webkit".split(","),Ar=function(t,e,l){var r=e||pl,a=r.style,d=5;if(t in a&&!l)return t;for(t=t.charAt(0).toUpperCase()+t.substr(1);d--&&!(zh[d]+t in a););return d<0?null:(d===3?"ms":d>=0?zh[d]:"")+t},rs=function(){E2()&&window.document&&(Th=window,Be=Th.document,sr=Be.documentElement,pl=ls("div")||{style:{}},ls("div"),ht=Ar(ht),Pt=ht+"Origin",pl.style.cssText="border-width:0;line-height:0;position:absolute;padding:0",Vm=!!Ar("perspective"),Rc=tn.core.reverting,Oc=1)},Ah=function(t){var e=t.ownerSVGElement,l=ls("svg",e&&e.getAttribute("xmlns")||"http://www.w3.org/2000/svg"),r=t.cloneNode(!0),a;r.style.display="block",l.appendChild(r),sr.appendChild(l);try{a=r.getBBox()}catch{}return l.removeChild(r),sr.removeChild(l),a},Dh=function(t,e){for(var l=e.length;l--;)if(t.hasAttribute(e[l]))return t.getAttribute(e[l])},Zm=function(t){var e,l;try{e=t.getBBox()}catch{e=Ah(t),l=1}return e&&(e.width||e.height)||l||(e=Ah(t)),e&&!e.width&&!e.x&&!e.y?{x:+Dh(t,["x","cx","x1"])||0,y:+Dh(t,["y","cy","y1"])||0,width:0,height:0}:e},Km=function(t){return!!(t.getCTM&&(!t.parentNode||t.ownerSVGElement)&&Zm(t))},nl=function(t,e){if(e){var l=t.style,r;e in qe&&e!==Pt&&(e=ht),l.removeProperty?(r=e.substr(0,2),(r==="ms"||e.substr(0,6)==="webkit")&&(e="-"+e),l.removeProperty(r==="--"?e:e.replace(Mc,"-$1").toLowerCase())):l.removeAttribute(e)}},He=function(t,e,l,r,a,d){var i=new Ft(t._pt,e,l,0,1,d?Xm:Ym);return t._pt=i,i.b=r,i.e=a,t._props.push(l),i},Oh={deg:1,rad:1,turn:1},L2={grid:1,flex:1},el=function n(t,e,l,r){var a=parseFloat(l)||0,d=(l+"").trim().substr((a+"").length)||"px",i=pl.style,u=z2.test(e),o=t.tagName.toLowerCase()==="svg",s=(o?"client":"offset")+(u?"Width":"Height"),c=100,f=r==="px",h=r==="%",b,m,v,g;if(r===d||!a||Oh[r]||Oh[d])return a;if(d!=="px"&&!f&&(a=n(t,e,l,"px")),g=t.getCTM&&Km(t),(h||d==="%")&&(qe[e]||~e.indexOf("adius")))return b=g?t.getBBox()[u?"width":"height"]:t[s],yt(h?a/b*c:a/100*b);if(i[u?"width":"height"]=c+(f?d:r),m=r!=="rem"&&~e.indexOf("adius")||r==="em"&&t.appendChild&&!o?t:t.parentNode,g&&(m=(t.ownerSVGElement||{}).parentNode),(!m||m===Be||!m.appendChild)&&(m=Be.body),v=m._gsap,v&&h&&v.width&&u&&v.time===dn.time&&!v.uncache)return yt(a/v.width*c);if(h&&(e==="height"||e==="width")){var p=t.style[e];t.style[e]=c+r,b=t[s],p?t.style[e]=p:nl(t,e)}else(h||d==="%")&&!L2[sn(m,"display")]&&(i.position=sn(t,"position")),m===t&&(i.position="static"),m.appendChild(pl),b=pl[s],m.removeChild(pl),i.position="absolute";return u&&h&&(v=vl(m),v.time=dn.time,v.width=m[s]),yt(f?b*a/c:b&&a?c/b*a:0)},ie=function(t,e,l,r){var a;return Oc||rs(),e in Jn&&e!=="transform"&&(e=Jn[e],~e.indexOf(",")&&(e=e.split(",")[0])),qe[e]&&e!=="transform"?(a=Ga(t,r),a=e!=="transformOrigin"?a[e]:a.svg?a.origin:Ai(sn(t,Pt))+" "+a.zOrigin+"px"):(a=t.style[e],(!a||a==="auto"||r||~(a+"").indexOf("calc("))&&(a=zi[e]&&zi[e](t,e,l)||sn(t,e)||cm(t,e)||(e==="opacity"?1:0))),l&&!~(a+"").trim().indexOf(" ")?el(t,e,a,l)+l:a},Y2=function(t,e,l,r){if(!l||l==="none"){var a=Ar(e,t,1),d=a&&sn(t,a,1);d&&d!==l?(e=a,l=d):e==="borderColor"&&(l=sn(t,"borderTopColor"))}var i=new Ft(this._pt,t.style,e,0,1,Hm),u=0,o=0,s,c,f,h,b,m,v,g,p,y,_,S;if(i.b=l,i.e=r,l+="",r+="",r.substring(0,6)==="var(--"&&(r=sn(t,r.substring(4,r.indexOf(")")))),r==="auto"&&(m=t.style[e],t.style[e]=r,r=sn(t,e)||r,m?t.style[e]=m:nl(t,e)),s=[l,r],Rm(s),l=s[0],r=s[1],f=l.match(tr)||[],S=r.match(tr)||[],S.length){for(;c=tr.exec(r);)v=c[0],p=r.substring(u,c.index),b?b=(b+1)%5:(p.substr(-5)==="rgba("||p.substr(-5)==="hsla(")&&(b=1),v!==(m=f[o++]||"")&&(h=parseFloat(m)||0,_=m.substr((h+"").length),v.charAt(1)==="="&&(v=or(h,v)+_),g=parseFloat(v),y=v.substr((g+"").length),u=tr.lastIndex-y.length,y||(y=y||gn.units[e]||_,u===r.length&&(r+=y,i.e+=y)),_!==y&&(h=el(t,e,m,y)||0),i._pt={_next:i._pt,p:p||o===1?p:",",s:h,c:g-h,m:b&&b<4||e==="zIndex"?Math.round:0});i.c=u<r.length?r.substring(u,r.length):""}else i.r=e==="display"&&r==="none"?Xm:Ym;return dm.test(r)&&(i.e=0),this._pt=i,i},Rh={top:"0%",bottom:"100%",left:"0%",right:"100%",center:"50%"},X2=function(t){var e=t.split(" "),l=e[0],r=e[1]||"50%";return(l==="top"||l==="bottom"||r==="left"||r==="right")&&(t=l,l=r,r=t),e[0]=Rh[l]||l,e[1]=Rh[r]||r,e.join(" ")},G2=function(t,e){if(e.tween&&e.tween._time===e.tween._dur){var l=e.t,r=l.style,a=e.u,d=l._gsap,i,u,o;if(a==="all"||a===!0)r.cssText="",u=1;else for(a=a.split(","),o=a.length;--o>-1;)i=a[o],qe[i]&&(u=1,i=i==="transformOrigin"?Pt:ht),nl(l,i);u&&(nl(l,ht),d&&(d.svg&&l.removeAttribute("transform"),r.scale=r.rotate=r.translate="none",Ga(l,1),d.uncache=1,Gm(r)))}},zi={clearProps:function(t,e,l,r,a){if(a.data!=="isFromStart"){var d=t._pt=new Ft(t._pt,e,l,0,0,G2);return d.u=r,d.pr=-10,d.tween=a,t._props.push(l),1}}},Xa=[1,0,0,1,0,0],Jm={},$m=function(t){return t==="matrix(1, 0, 0, 1, 0, 0)"||t==="none"||!t},Mh=function(t){var e=sn(t,ht);return $m(e)?Xa:e.substr(7).match(am).map(yt)},Cc=function(t,e){var l=t._gsap||vl(t),r=t.style,a=Mh(t),d,i,u,o;return l.svg&&t.getAttribute("transform")?(u=t.transform.baseVal.consolidate().matrix,a=[u.a,u.b,u.c,u.d,u.e,u.f],a.join(",")==="1,0,0,1,0,0"?Xa:a):(a===Xa&&!t.offsetParent&&t!==sr&&!l.svg&&(u=r.display,r.display="block",d=t.parentNode,(!d||!t.offsetParent&&!t.getBoundingClientRect().width)&&(o=1,i=t.nextElementSibling,sr.appendChild(t)),a=Mh(t),u?r.display=u:nl(t,"display"),o&&(i?d.insertBefore(t,i):d?d.appendChild(t):sr.removeChild(t))),e&&a.length>6?[a[0],a[1],a[4],a[5],a[12],a[13]]:a)},as=function(t,e,l,r,a,d){var i=t._gsap,u=a||Cc(t,!0),o=i.xOrigin||0,s=i.yOrigin||0,c=i.xOffset||0,f=i.yOffset||0,h=u[0],b=u[1],m=u[2],v=u[3],g=u[4],p=u[5],y=e.split(" "),_=parseFloat(y[0])||0,S=parseFloat(y[1])||0,A,q,E,x;l?u!==Xa&&(q=h*v-b*m)&&(E=_*(v/q)+S*(-m/q)+(m*p-v*g)/q,x=_*(-b/q)+S*(h/q)-(h*p-b*g)/q,_=E,S=x):(A=Zm(t),_=A.x+(~y[0].indexOf("%")?_/100*A.width:_),S=A.y+(~(y[1]||y[0]).indexOf("%")?S/100*A.height:S)),r||r!==!1&&i.smooth?(g=_-o,p=S-s,i.xOffset=c+(g*h+p*m)-g,i.yOffset=f+(g*b+p*v)-p):i.xOffset=i.yOffset=0,i.xOrigin=_,i.yOrigin=S,i.smooth=!!r,i.origin=e,i.originIsAbsolute=!!l,t.style[Pt]="0px 0px",d&&(He(d,i,"xOrigin",o,_),He(d,i,"yOrigin",s,S),He(d,i,"xOffset",c,i.xOffset),He(d,i,"yOffset",f,i.yOffset)),t.setAttribute("data-svg-origin",_+" "+S)},Ga=function(t,e){var l=t._gsap||new Cm(t);if("x"in l&&!e&&!l.uncache)return l;var r=t.style,a=l.scaleX<0,d="px",i="deg",u=getComputedStyle(t),o=sn(t,Pt)||"0",s,c,f,h,b,m,v,g,p,y,_,S,A,q,E,x,R,H,X,Z,P,G,O,M,C,$,it,Xn,Sn,Nl,Mt,qn;return s=c=f=m=v=g=p=y=_=0,h=b=1,l.svg=!!(t.getCTM&&Km(t)),u.translate&&((u.translate!=="none"||u.scale!=="none"||u.rotate!=="none")&&(r[ht]=(u.translate!=="none"?"translate3d("+(u.translate+" 0 0").split(" ").slice(0,3).join(", ")+") ":"")+(u.rotate!=="none"?"rotate("+u.rotate+") ":"")+(u.scale!=="none"?"scale("+u.scale.split(" ").join(",")+") ":"")+(u[ht]!=="none"?u[ht]:"")),r.scale=r.rotate=r.translate="none"),q=Cc(t,l.svg),l.svg&&(l.uncache?(C=t.getBBox(),o=l.xOrigin-C.x+"px "+(l.yOrigin-C.y)+"px",M=""):M=!e&&t.getAttribute("data-svg-origin"),as(t,M||o,!!M||l.originIsAbsolute,l.smooth!==!1,q)),S=l.xOrigin||0,A=l.yOrigin||0,q!==Xa&&(H=q[0],X=q[1],Z=q[2],P=q[3],s=G=q[4],c=O=q[5],q.length===6?(h=Math.sqrt(H*H+X*X),b=Math.sqrt(P*P+Z*Z),m=H||X?Hl(X,H)*hl:0,p=Z||P?Hl(Z,P)*hl+m:0,p&&(b*=Math.abs(Math.cos(p*cr))),l.svg&&(s-=S-(S*H+A*Z),c-=A-(S*X+A*P))):(qn=q[6],Nl=q[7],it=q[8],Xn=q[9],Sn=q[10],Mt=q[11],s=q[12],c=q[13],f=q[14],E=Hl(qn,Sn),v=E*hl,E&&(x=Math.cos(-E),R=Math.sin(-E),M=G*x+it*R,C=O*x+Xn*R,$=qn*x+Sn*R,it=G*-R+it*x,Xn=O*-R+Xn*x,Sn=qn*-R+Sn*x,Mt=Nl*-R+Mt*x,G=M,O=C,qn=$),E=Hl(-Z,Sn),g=E*hl,E&&(x=Math.cos(-E),R=Math.sin(-E),M=H*x-it*R,C=X*x-Xn*R,$=Z*x-Sn*R,Mt=P*R+Mt*x,H=M,X=C,Z=$),E=Hl(X,H),m=E*hl,E&&(x=Math.cos(E),R=Math.sin(E),M=H*x+X*R,C=G*x+O*R,X=X*x-H*R,O=O*x-G*R,H=M,G=C),v&&Math.abs(v)+Math.abs(m)>359.9&&(v=m=0,g=180-g),h=yt(Math.sqrt(H*H+X*X+Z*Z)),b=yt(Math.sqrt(O*O+qn*qn)),E=Hl(G,O),p=Math.abs(E)>2e-4?E*hl:0,_=Mt?1/(Mt<0?-Mt:Mt):0),l.svg&&(M=t.getAttribute("transform"),l.forceCSS=t.setAttribute("transform","")||!$m(sn(t,ht)),M&&t.setAttribute("transform",M))),Math.abs(p)>90&&Math.abs(p)<270&&(a?(h*=-1,p+=m<=0?180:-180,m+=m<=0?180:-180):(b*=-1,p+=p<=0?180:-180)),e=e||l.uncache,l.x=s-((l.xPercent=s&&(!e&&l.xPercent||(Math.round(t.offsetWidth/2)===Math.round(-s)?-50:0)))?t.offsetWidth*l.xPercent/100:0)+d,l.y=c-((l.yPercent=c&&(!e&&l.yPercent||(Math.round(t.offsetHeight/2)===Math.round(-c)?-50:0)))?t.offsetHeight*l.yPercent/100:0)+d,l.z=f+d,l.scaleX=yt(h),l.scaleY=yt(b),l.rotation=yt(m)+i,l.rotationX=yt(v)+i,l.rotationY=yt(g)+i,l.skewX=p+i,l.skewY=y+i,l.transformPerspective=_+d,(l.zOrigin=parseFloat(o.split(" ")[2])||!e&&l.zOrigin||0)&&(r[Pt]=Ai(o)),l.xOffset=l.yOffset=0,l.force3D=gn.force3D,l.renderTransform=l.svg?V2:Vm?Wm:Q2,l.uncache=0,l},Ai=function(t){return(t=t.split(" "))[0]+" "+t[1]},Zu=function(t,e,l){var r=Ht(e);return yt(parseFloat(e)+parseFloat(el(t,"x",l+"px",r)))+r},Q2=function(t,e){e.z="0px",e.rotationY=e.rotationX="0deg",e.force3D=0,Wm(t,e)},il="0deg",Kr="0px",ul=") ",Wm=function(t,e){var l=e||this,r=l.xPercent,a=l.yPercent,d=l.x,i=l.y,u=l.z,o=l.rotation,s=l.rotationY,c=l.rotationX,f=l.skewX,h=l.skewY,b=l.scaleX,m=l.scaleY,v=l.transformPerspective,g=l.force3D,p=l.target,y=l.zOrigin,_="",S=g==="auto"&&t&&t!==1||g===!0;if(y&&(c!==il||s!==il)){var A=parseFloat(s)*cr,q=Math.sin(A),E=Math.cos(A),x;A=parseFloat(c)*cr,x=Math.cos(A),d=Zu(p,d,q*x*-y),i=Zu(p,i,-Math.sin(A)*-y),u=Zu(p,u,E*x*-y+y)}v!==Kr&&(_+="perspective("+v+ul),(r||a)&&(_+="translate("+r+"%, "+a+"%) "),(S||d!==Kr||i!==Kr||u!==Kr)&&(_+=u!==Kr||S?"translate3d("+d+", "+i+", "+u+") ":"translate("+d+", "+i+ul),o!==il&&(_+="rotate("+o+ul),s!==il&&(_+="rotateY("+s+ul),c!==il&&(_+="rotateX("+c+ul),(f!==il||h!==il)&&(_+="skew("+f+", "+h+ul),(b!==1||m!==1)&&(_+="scale("+b+", "+m+ul),p.style[ht]=_||"translate(0, 0)"},V2=function(t,e){var l=e||this,r=l.xPercent,a=l.yPercent,d=l.x,i=l.y,u=l.rotation,o=l.skewX,s=l.skewY,c=l.scaleX,f=l.scaleY,h=l.target,b=l.xOrigin,m=l.yOrigin,v=l.xOffset,g=l.yOffset,p=l.forceCSS,y=parseFloat(d),_=parseFloat(i),S,A,q,E,x;u=parseFloat(u),o=parseFloat(o),s=parseFloat(s),s&&(s=parseFloat(s),o+=s,u+=s),u||o?(u*=cr,o*=cr,S=Math.cos(u)*c,A=Math.sin(u)*c,q=Math.sin(u-o)*-f,E=Math.cos(u-o)*f,o&&(s*=cr,x=Math.tan(o-s),x=Math.sqrt(1+x*x),q*=x,E*=x,s&&(x=Math.tan(s),x=Math.sqrt(1+x*x),S*=x,A*=x)),S=yt(S),A=yt(A),q=yt(q),E=yt(E)):(S=c,E=f,A=q=0),(y&&!~(d+"").indexOf("px")||_&&!~(i+"").indexOf("px"))&&(y=el(h,"x",d,"px"),_=el(h,"y",i,"px")),(b||m||v||g)&&(y=yt(y+b-(b*S+m*q)+v),_=yt(_+m-(b*A+m*E)+g)),(r||a)&&(x=h.getBBox(),y=yt(y+r/100*x.width),_=yt(_+a/100*x.height)),x="matrix("+S+","+A+","+q+","+E+","+y+","+_+")",h.setAttribute("transform",x),p&&(h.style[ht]=x)},Z2=function(t,e,l,r,a){var d=360,i=Rt(a),u=parseFloat(a)*(i&&~a.indexOf("rad")?hl:1),o=u-r,s=r+o+"deg",c,f;return i&&(c=a.split("_")[1],c==="short"&&(o%=d,o!==o%(d/2)&&(o+=o<0?d:-d)),c==="cw"&&o<0?o=(o+d*Eh)%d-~~(o/d)*d:c==="ccw"&&o>0&&(o=(o-d*Eh)%d-~~(o/d)*d)),t._pt=f=new Ft(t._pt,e,l,r,o,D2),f.e=s,f.u="deg",t._props.push(l),f},Ch=function(t,e){for(var l in e)t[l]=e[l];return t},K2=function(t,e,l){var r=Ch({},l._gsap),a="perspective,force3D,transformOrigin,svgOrigin",d=l.style,i,u,o,s,c,f,h,b;r.svg?(o=l.getAttribute("transform"),l.setAttribute("transform",""),d[ht]=e,i=Ga(l,1),nl(l,ht),l.setAttribute("transform",o)):(o=getComputedStyle(l)[ht],d[ht]=e,i=Ga(l,1),d[ht]=o);for(u in qe)o=r[u],s=i[u],o!==s&&a.indexOf(u)<0&&(h=Ht(o),b=Ht(s),c=h!==b?el(l,u,o,b):parseFloat(o),f=parseFloat(s),t._pt=new Ft(t._pt,i,u,c,f-c,es),t._pt.u=b||0,t._props.push(u));Ch(i,r)};Wt("padding,margin,Width,Radius",function(n,t){var e="Top",l="Right",r="Bottom",a="Left",d=(t<3?[e,l,r,a]:[e+a,e+l,r+l,r+a]).map(function(i){return t<2?n+i:"border"+i+n});zi[t>1?"border"+n:n]=function(i,u,o,s,c){var f,h;if(arguments.length<4)return f=d.map(function(b){return ie(i,b,o)}),h=f.join(" "),h.split(f[0]).length===5?f[0]:h;f=(s+"").split(" "),h={},d.forEach(function(b,m){return h[b]=f[m]=f[m]||f[(m-1)/2|0]}),i.init(u,h,c)}});var Fm={name:"css",register:rs,targetTest:function(t){return t.style&&t.nodeType},init:function(t,e,l,r,a){var d=this._props,i=t.style,u=l.vars.startAt,o,s,c,f,h,b,m,v,g,p,y,_,S,A,q,E,x;Oc||rs(),this.styles=this.styles||Qm(t),E=this.styles.props,this.tween=l;for(m in e)if(m!=="autoRound"&&(s=e[m],!(ln[m]&&km(m,e,l,r,t,a)))){if(h=typeof s,b=zi[m],h==="function"&&(s=s.call(l,r,t,a),h=typeof s),h==="string"&&~s.indexOf("random(")&&(s=ja(s)),b)b(this,t,m,s,l)&&(q=1);else if(m.substr(0,2)==="--")o=(getComputedStyle(t).getPropertyValue(m)+"").trim(),s+="",$e.lastIndex=0,$e.test(o)||(v=Ht(o),g=Ht(s),g?v!==g&&(o=el(t,m,o,g)+g):v&&(s+=v)),this.add(i,"setProperty",o,s,r,a,0,0,m),d.push(m),E.push(m,0,i[m]);else if(h!=="undefined"){if(u&&m in u?(o=typeof u[m]=="function"?u[m].call(l,r,t,a):u[m],Rt(o)&&~o.indexOf("random(")&&(o=ja(o)),Ht(o+"")||o==="auto"||(o+=gn.units[m]||Ht(ie(t,m))||""),(o+"").charAt(1)==="="&&(o=ie(t,m))):o=ie(t,m),f=parseFloat(o),p=h==="string"&&s.charAt(1)==="="&&s.substr(0,2),p&&(s=s.substr(2)),c=parseFloat(s),m in Jn&&(m==="autoAlpha"&&(f===1&&ie(t,"visibility")==="hidden"&&c&&(f=0),E.push("visibility",0,i.visibility),He(this,i,"visibility",f?"inherit":"hidden",c?"inherit":"hidden",!c)),m!=="scale"&&m!=="transform"&&(m=Jn[m],~m.indexOf(",")&&(m=m.split(",")[0]))),y=m in qe,y){if(this.styles.save(m),x=s,h==="string"&&s.substring(0,6)==="var(--"){if(s=sn(t,s.substring(4,s.indexOf(")"))),s.substring(0,5)==="calc("){var R=t.style.perspective;t.style.perspective=s,s=sn(t,"perspective"),R?t.style.perspective=R:nl(t,"perspective")}c=parseFloat(s)}if(_||(S=t._gsap,S.renderTransform&&!e.parseTransform||Ga(t,e.parseTransform),A=e.smoothOrigin!==!1&&S.smooth,_=this._pt=new Ft(this._pt,i,ht,0,1,S.renderTransform,S,0,-1),_.dep=1),m==="scale")this._pt=new Ft(this._pt,S,"scaleY",S.scaleY,(p?or(S.scaleY,p+c):c)-S.scaleY||0,es),this._pt.u=0,d.push("scaleY",m),m+="X";else if(m==="transformOrigin"){E.push(Pt,0,i[Pt]),s=X2(s),S.svg?as(t,s,0,A,0,this):(g=parseFloat(s.split(" ")[2])||0,g!==S.zOrigin&&He(this,S,"zOrigin",S.zOrigin,g),He(this,i,m,Ai(o),Ai(s)));continue}else if(m==="svgOrigin"){as(t,s,1,A,0,this);continue}else if(m in Jm){Z2(this,S,m,f,p?or(f,p+s):s);continue}else if(m==="smoothOrigin"){He(this,S,"smooth",S.smooth,s);continue}else if(m==="force3D"){S[m]=s;continue}else if(m==="transform"){K2(this,s,t);continue}}else m in i||(m=Ar(m)||m);if(y||(c||c===0)&&(f||f===0)&&!A2.test(s)&&m in i)v=(o+"").substr((f+"").length),c||(c=0),g=Ht(s)||(m in gn.units?gn.units[m]:v),v!==g&&(f=el(t,m,o,g)),this._pt=new Ft(this._pt,y?S:i,m,f,(p?or(f,p+c):c)-f,!y&&(g==="px"||m==="zIndex")&&e.autoRound!==!1?M2:es),this._pt.u=g||0,y&&x!==s?(this._pt.b=o,this._pt.e=x,this._pt.r=R2):v!==g&&g!=="%"&&(this._pt.b=o,this._pt.r=O2);else if(m in i)Y2.call(this,t,m,o,p?p+s:s);else if(m in t)this.add(t,m,o||t[m],p?p+s:s,r,a);else if(m!=="parseTransform"){_c(m,s);continue}y||(m in i?E.push(m,0,i[m]):typeof t[m]=="function"?E.push(m,2,t[m]()):E.push(m,1,o||t[m])),d.push(m)}}q&&jm(this)},render:function(t,e){if(e.tween._time||!Rc())for(var l=e._pt;l;)l.r(t,l.d),l=l._next;else e.styles.revert()},get:ie,aliases:Jn,getSetter:function(t,e,l){var r=Jn[e];return r&&r.indexOf(",")<0&&(e=r),e in qe&&e!==Pt&&(t._gsap.x||ie(t,"x"))?l&&xh===l?e==="scale"?N2:U2:(xh=l||{})&&(e==="scale"?w2:B2):t.style&&!mc(t.style[e])?C2:~e.indexOf("-")?k2:Ac(t,e)},core:{_removeProperty:nl,_getMatrix:Cc}};tn.utils.checkPrefix=Ar;tn.core.getStyleSaver=Qm;(function(n,t,e,l){var r=Wt(n+","+t+","+e,function(a){qe[a]=1});Wt(t,function(a){gn.units[a]="deg",Jm[a]=1}),Jn[r[13]]=n+","+t,Wt(l,function(a){var d=a.split(":");Jn[d[1]]=r[d[0]]})})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent","rotation,rotationX,rotationY,skewX,skewY","transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective","0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");Wt("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective",function(n){gn.units[n]="px"});tn.registerPlugin(Fm);var _a=tn.registerPlugin(Fm)||tn;_a.core.Tween;const na=[{slug:"di-tian-sui",title:"滴天髓阐微",total:64,done:9,chapters:[{num:"01",name:"天道",isDone:!0},{num:"02",name:"坤道",isDone:!0},{num:"03",name:"人道",isDone:!0},{num:"04",name:"知命",isDone:!0},{num:"05",name:"理气",isDone:!0},{num:"06",name:"配合",isDone:!0},{num:"07",name:"天干",isDone:!0},{num:"08",name:"地支",isDone:!0},{num:"09",name:"干支总论",isDone:!1},{num:"10",name:"形象",isDone:!1},{num:"11",name:"方局",isDone:!1},{num:"12",name:"八格",isDone:!0},{num:"13",name:"体用",isDone:!1},{num:"14",name:"精神",isDone:!1},{num:"15",name:"月令",isDone:!1},{num:"16",name:"生时",isDone:!1},{num:"17",name:"衰旺",isDone:!1},{num:"18",name:"中和",isDone:!1},{num:"19",name:"源流",isDone:!1},{num:"20",name:"通关",isDone:!1},{num:"21",name:"官杀",isDone:!1},{num:"22",name:"伤官",isDone:!1},{num:"23",name:"清气",isDone:!1},{num:"24",name:"浊气",isDone:!1},{num:"25",name:"真神",isDone:!1},{num:"26",name:"假神",isDone:!1},{num:"27",name:"刚柔",isDone:!1},{num:"28",name:"顺逆",isDone:!1},{num:"29",name:"寒暖",isDone:!1},{num:"30",name:"燥湿",isDone:!1},{num:"31",name:"隐显",isDone:!1},{num:"32",name:"众寡",isDone:!1},{num:"33",name:"震兑",isDone:!1},{num:"34",name:"坎离",isDone:!1},{num:"35",name:"夫妻",isDone:!1},{num:"36",name:"子女",isDone:!1},{num:"37",name:"父母",isDone:!1},{num:"38",name:"兄弟",isDone:!1},{num:"39",name:"何知",isDone:!1},{num:"40",name:"女命",isDone:!1},{num:"41",name:"小儿",isDone:!1},{num:"42",name:"才德",isDone:!1},{num:"43",name:"奋郁",isDone:!1},{num:"44",name:"恩怨",isDone:!1},{num:"45",name:"闲神",isDone:!1},{num:"46",name:"从象",isDone:!1},{num:"47",name:"化象",isDone:!1},{num:"48",name:"假从",isDone:!1},{num:"49",name:"假化",isDone:!1},{num:"50",name:"顺局",isDone:!1},{num:"51",name:"反局",isDone:!1},{num:"52",name:"战局",isDone:!1},{num:"53",name:"合局",isDone:!1},{num:"54",name:"君象",isDone:!1},{num:"55",name:"臣象",isDone:!1},{num:"56",name:"母象",isDone:!1},{num:"57",name:"子象",isDone:!1},{num:"58",name:"性情",isDone:!1},{num:"59",name:"疾病",isDone:!1},{num:"60",name:"出身",isDone:!1},{num:"61",name:"地位",isDone:!1},{num:"62",name:"岁运",isDone:!1},{num:"63",name:"真元",isDone:!1},{num:"64",name:"六亲总论",isDone:!1}],skills:[{name:"bage"},{name:"dizhi"},{name:"kundao"},{name:"liqi"},{name:"peihe"},{name:"rendao"},{name:"tiandao"},{name:"tiangan"},{name:"zhiming"}]}],J2=()=>(Gh.useEffect(()=>{const n=document.querySelectorAll(".book-card");_a.fromTo(n,{opacity:0,y:20},{opacity:1,y:0,duration:.5,stagger:.12,ease:"power2.out",delay:.1})},[]),D.jsxs("div",{style:{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",paddingTop:80,paddingBottom:64,paddingLeft:16,paddingRight:16},children:[D.jsxs("div",{style:{textAlign:"center",marginBottom:64,position:"relative",overflow:"hidden",width:"100%",maxWidth:1100},children:[D.jsx("div",{style:{position:"absolute",top:-80,left:"50%",transform:"translateX(-50%)",width:500,height:300,pointerEvents:"none",background:"radial-gradient(ellipse, rgba(122,79,170,0.15) 0%, transparent 70%)"}}),D.jsx("div",{style:{display:"inline-block",background:"rgba(122,79,170,0.2)",border:"1px solid rgba(122,79,170,0.4)",color:"#b090e0",fontSize:11,letterSpacing:3,padding:"4px 16px",borderRadius:20,marginBottom:16},children:"正统子平学术"}),D.jsx("h1",{style:{fontSize:30,color:"#f0c060",letterSpacing:6,marginBottom:10,fontWeight:"bold",textShadow:"0 0 30px rgba(240,192,96,0.3)"},children:"命理学术中心"}),D.jsx("p",{style:{fontSize:13,color:"#8080a0"},children:"经典原文 · 专业注解 · 学术整理"})]}),D.jsxs("div",{style:{display:"flex",gap:48,marginBottom:64},children:[D.jsxs("div",{style:{textAlign:"center"},children:[D.jsx("div",{style:{fontSize:28,color:"#f0c060",fontWeight:"bold"},children:na.length}),D.jsx("div",{style:{fontSize:12,color:"#8080a0",marginTop:4},children:"典籍"})]}),D.jsxs("div",{style:{textAlign:"center"},children:[D.jsx("div",{style:{fontSize:28,color:"#f0c060",fontWeight:"bold"},children:na.reduce((n,t)=>n+t.total,0)}),D.jsx("div",{style:{fontSize:12,color:"#8080a0",marginTop:4},children:"总篇章"})]}),D.jsxs("div",{style:{textAlign:"center"},children:[D.jsx("div",{style:{fontSize:28,color:"#f0c060",fontWeight:"bold"},children:na.reduce((n,t)=>n+t.done,0)}),D.jsx("div",{style:{fontSize:12,color:"#8080a0",marginTop:4},children:"已解读"})]})]}),D.jsx("div",{style:{width:"100%",maxWidth:900,display:"grid",gap:20},children:na.map(n=>D.jsxs(Na,{to:`/${n.slug}`,style:{display:"block",background:"#101828",border:"1px solid #1a1a30",borderRadius:12,padding:28,textDecoration:"none",transition:"all 0.25s",cursor:"pointer"},onMouseEnter:t=>{t.currentTarget.style.borderColor="#f0c060",t.currentTarget.style.background="#141e30",t.currentTarget.style.transform="translateY(-2px)",t.currentTarget.style.boxShadow="0 8px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(240,192,96,0.3)"},onMouseLeave:t=>{t.currentTarget.style.borderColor="#1a1a30",t.currentTarget.style.background="#101828",t.currentTarget.style.transform="",t.currentTarget.style.boxShadow=""},children:[D.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16},children:[D.jsxs("div",{children:[D.jsxs("h2",{style:{fontSize:20,color:"#f0c060",fontWeight:"bold",letterSpacing:2,marginBottom:8},children:["《",n.title,"》"]}),D.jsx("p",{style:{fontSize:13,color:"#8080a0"},children:"原著：刘伯温（托名）｜注疏：任铁樵"})]}),D.jsxs("div",{style:{textAlign:"right"},children:[D.jsx("div",{style:{fontSize:18,color:"#f0c060",fontWeight:"bold"},children:n.total}),D.jsx("div",{style:{fontSize:12,color:"#8080a0"},children:"篇章"})]})]}),D.jsx("div",{style:{height:6,borderRadius:3,overflow:"hidden",background:"#1a1a30"},children:D.jsx("div",{style:{height:"100%",borderRadius:3,width:`${n.total>0?n.done/n.total*100:0}%`,background:"linear-gradient(90deg, #7a4faa, #f0c060)",transition:"width 0.5s"}})}),D.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:12,color:"#6060a0"},children:[D.jsxs("span",{children:["已解读 ",n.done," 篇"]}),D.jsxs("span",{children:[n.total>0?Math.round(n.done/n.total*100):0,"% 完成"]})]})]},n.slug))}),D.jsxs("div",{style:{marginTop:80,textAlign:"center",fontSize:12,color:"#505070",borderTop:"1px solid #1f1f38",paddingTop:20,width:"100%",maxWidth:1100},children:["Hermes Agent · 学术整理 · ",D.jsx("a",{href:"https://www.iwzbz.com",target:"_blank",rel:"noreferrer",style:{color:"#7090c0"},children:"iwzbz.com"})]})]})),$2={天道:`<h1>《滴天髓》·天道篇·详细解读教程</h1>
<blockquote>
<p><strong>原著：</strong> 《滴天髓》上篇第一章·天道
<strong>注疏：</strong> 任铁樵（徐乐吾评注本）
<strong>正文：</strong> 欲识三元万法宗，先观帝载与神功
<strong>本章字数：</strong> 223字
<strong>完成日期：</strong> 2026-05-13</p>
</blockquote>
<hr>
<h2>📖 第一部分：通读全貌（扫盲层）</h2>
<h3>一、本章地位</h3>
<pre><code>《滴天髓》开篇第一论
  ↓
定三元之基础
  ↓
为全书之总纲
</code></pre>
<p>天道篇是《滴天髓》的开篇，相当于整部经典的<strong>总论</strong>。任铁樵开篇即点明：</p>
<blockquote>
<p>三元之理，是万法之宗</p>
</blockquote>
<h3>二、本章结构</h3>
<pre><code>┌─────────────────────────────────────────┐
│              天道篇结构                  │
├─────────────────────────────────────────┤
│                                         │
│  ① 开篇正文（10字）                     │
│     欲识三元万法宗，先观帝载与神功        │
│                                         │
│  ② 【原注】详解（47字）                  │
│     天有阴阳，故春木、夏火、秋金、        │
│     冬水、季土，随乎时节，显其神功……    │
│                                         │
│  ③ 【任氏曰】详解（30字）                │
│     天干为天元，地支为地元，              │
│     支中所藏为人元……                    │
│                                         │
└─────────────────────────────────────────┘
</code></pre>
<h3>三、生僻字词速查</h3>
<table>
<thead>
<tr>
<th>字词</th>
<th>读音</th>
<th>含义</th>
</tr>
</thead>
<tbody><tr>
<td><strong>帝载</strong></td>
<td>dì zǎi</td>
<td>帝，天帝；载，承载。引申为天地之道</td>
</tr>
<tr>
<td><strong>神功</strong></td>
<td>shén gōng</td>
<td>神妙的功用，五行四时运行之功</td>
</tr>
<tr>
<td><strong>三元</strong></td>
<td>sān yuán</td>
<td>天元（天干）、地元（地支）、人元（藏干）</td>
</tr>
<tr>
<td><strong>宗</strong></td>
<td>zōng</td>
<td>根本、宗源</td>
</tr>
<tr>
<td><strong>悉</strong></td>
<td>xī</td>
<td>全、都</td>
</tr>
<tr>
<td><strong>本</strong></td>
<td>běn</td>
<td>来源、根本</td>
</tr>
</tbody></table>
<hr>
<h2>📚 第二部分：逐层精解（专业层）</h2>
<h3>四、原文逐句解析</h3>
<h4>4.1 开篇正文</h4>
<blockquote>
<p><strong>原文：</strong> 欲识三元万法宗，先观帝载与神功</p>
</blockquote>
<p><strong>【逐字拆解】</strong></p>
<table>
<thead>
<tr>
<th>字</th>
<th>含义</th>
<th>命理指向</th>
</tr>
</thead>
<tbody><tr>
<td><strong>欲</strong></td>
<td>想要</td>
<td>开启探索之门</td>
</tr>
<tr>
<td><strong>识</strong></td>
<td>认识、理解</td>
<td>指认识命理的路径</td>
</tr>
<tr>
<td><strong>三元</strong></td>
<td>天元、地元、人元</td>
<td>三元是命理的最小单位</td>
</tr>
<tr>
<td><strong>万法宗</strong></td>
<td>万千论命方法的根本</td>
<td>所有方法皆源于此</td>
</tr>
<tr>
<td><strong>先观</strong></td>
<td>首先观察</td>
<td>强调首要步骤</td>
</tr>
<tr>
<td><strong>帝载</strong></td>
<td>天地之承载</td>
<td>指天道阴阳</td>
</tr>
<tr>
<td><strong>神功</strong></td>
<td>神妙的功用</td>
<td>五行运行之功</td>
</tr>
</tbody></table>
<p><strong>【任注解读】</strong></p>
<p>任铁樵将&quot;帝载&quot;解读为&quot;阴阳&quot;，将&quot;神功&quot;解读为&quot;五行播于四时&quot;。这是理解天道篇的关键：</p>
<blockquote>
<p>天有阴阳 → 阴阳是天道之本
五行播于四时 → 五行随季节显功用</p>
</blockquote>
<p><strong>【图解】</strong></p>
<pre><code>开篇结构图：

欲识三元万法宗，先观帝载与神功
  ↓                ↓
 认识三元    先观察天地之道
    ↓                ↓
  万法皆从此出    阴阳五行是根本
</code></pre>
<hr>
<h4>4.2 【原注】详解</h4>
<blockquote>
<p><strong>原文：</strong> 天有阴阳，故春木、夏火、秋金、冬水、季土，随乎时节，显其神功，命中天地人三元之理，悉本于此。</p>
</blockquote>
<p><strong>【逐段解读】</strong></p>
<table>
<thead>
<tr>
<th>关键词</th>
<th>命理含义</th>
</tr>
</thead>
<tbody><tr>
<td><strong>天有阴阳</strong></td>
<td>天道分阴阳两面，阴阳是万物的根本</td>
</tr>
<tr>
<td><strong>春木</strong></td>
<td>春季木气当令，木主生发</td>
</tr>
<tr>
<td><strong>夏火</strong></td>
<td>夏季火气当令，火主炎上</td>
</tr>
<tr>
<td><strong>秋金</strong></td>
<td>秋季金气当令，金主收敛</td>
</tr>
<tr>
<td><strong>冬水</strong></td>
<td>冬季水气当令，水主封藏</td>
</tr>
<tr>
<td><strong>季土</strong></td>
<td>四季末月土气当令，土主转化</td>
</tr>
<tr>
<td><strong>随乎时节</strong></td>
<td>五行随季节变化而有旺衰</td>
</tr>
<tr>
<td><strong>显其神功</strong></td>
<td>五行在不同季节显出不同的功用</td>
</tr>
<tr>
<td><strong>命中</strong></td>
<td>命中注定、命局之中</td>
</tr>
<tr>
<td><strong>天地人三元</strong></td>
<td>天干、地支、藏干</td>
</tr>
<tr>
<td><strong>悉本于此</strong></td>
<td>全部来源于天道阴阳五行</td>
</tr>
</tbody></table>
<p><strong>【任注解读】</strong></p>
<p>任铁樵在原注基础上进一步阐发：</p>
<blockquote>
<p>阴阳本乎太极，是所谓帝载
五行播于四时，是所谓神功
乃三才之统系，万物之本原</p>
</blockquote>
<p><strong>【图解】</strong></p>
<pre><code>天道运行图：

     天（阴阳）
        ↓
    ┌──┬──┐
    │  │  │
  阳  ↓  阴
    │  │  │
  春木  冬水
    │  │  │
  夏火  秋金
    │  │  │
  土（季土调和）
        ↓
    三元之理
</code></pre>
<hr>
<h4>4.3 【任氏曰】详解</h4>
<blockquote>
<p><strong>原文：</strong> 天干为天元，地支为地元，支中所藏为人元。人之命命，万有不齐，总不越此三元之理，所谓万法宗也。</p>
</blockquote>
<p><strong>【逐句解读】</strong></p>
<table>
<thead>
<tr>
<th>关键词</th>
<th>命理含义</th>
</tr>
</thead>
<tbody><tr>
<td><strong>天干为天元</strong></td>
<td>十个天干代表天元，是命局的显用层面</td>
</tr>
<tr>
<td><strong>地支为地元</strong></td>
<td>十二地支代表地元，是命局的根基层面</td>
</tr>
<tr>
<td><strong>支中所藏为人元</strong></td>
<td>地支中藏的干为人元，是命局的通变之机</td>
</tr>
<tr>
<td><strong>人之命命</strong></td>
<td>世间人的命各有不同</td>
</tr>
<tr>
<td><strong>万有不齐</strong></td>
<td>命局千变万化，各不相同</td>
</tr>
<tr>
<td><strong>总不越此三元之理</strong></td>
<td>无论如何变化，都离不开三元之理</td>
</tr>
<tr>
<td><strong>万法宗</strong></td>
<td>所有命理方法都以此为根本</td>
</tr>
</tbody></table>
<p><strong>【任注解读】</strong></p>
<p>任铁樵强调：</p>
<ul>
<li>三元是论命的最小单位</li>
<li>无论命局如何复杂，都不越此三元之理</li>
<li>这是命理学万法之宗</li>
</ul>
<p><strong>【图解】</strong></p>
<pre><code>三元结构图：

      天元（天干）
         ↓
    ┌────┼────┐
    ↓         ↓
  显用      显用于外
    ↓         ↓
┌──┴──┐   ┌──┴──┐
│天干│   │十干│
│ 10 │   │甲乙│
└────┘   │丙丁│
         │戊己│
         │庚辛│
         │壬癸│
         └────┘

      人元（藏干）
         ↓
    ┌────┼────┐
    ↓         ↓
  通变      通变于中
    ↓         ↓
┌──┴──┐   ┌──┴──┐
│藏干│   │人元│
│ 12 │   │通变│
└────┘   └────┘

      地元（地支）
         ↓
    ┌────┼────┐
    ↓         ↓
  根基      根基于内
    ↓         ↓
┌──┴──┐   ┌──┴──┐
│地支│   │十二│
│ 12 │   │支  │
└────┘   └────┘
</code></pre>
<hr>
<h3>五、三元关系深度解析</h3>
<h4>5.1 三元的本质</h4>
<pre><code>天元 = 天干 → 显用于外
  ↓
地元 = 地支 → 根基于内
  ↓
人元 = 藏干 → 通变于中
</code></pre>
<p><strong>【三层关系】</strong></p>
<table>
<thead>
<tr>
<th>层面</th>
<th>代表</th>
<th>作用</th>
<th>特点</th>
</tr>
</thead>
<tbody><tr>
<td><strong>天元</strong></td>
<td>天干（十干）</td>
<td>显用于外</td>
<td>外显、易见</td>
</tr>
<tr>
<td><strong>地元</strong></td>
<td>地支（十二支）</td>
<td>根基于内</td>
<td>内敛、根基</td>
</tr>
<tr>
<td><strong>人元</strong></td>
<td>藏干</td>
<td>通变于中</td>
<td>变化、通达</td>
</tr>
</tbody></table>
<h4>5.2 三元与命局分析</h4>
<p><strong>【分析三步法】</strong></p>
<pre><code>第一步：观天元（天干）
  → 看天干透出何神
  → 判断命局显用的十神
  → 确定命局的主要矛盾

第二步：观人元（藏干）
  → 看地支藏何干
  → 判断地支内在的气机
  → 确定命局的通变之机

第三步：观地元（地支）
  → 看地支本身五行
  → 判断日主是否得地
  → 确定命局的根基
</code></pre>
<h4>5.3 三元与吉凶判定</h4>
<pre><code>三元配合得当 → 吉
三元配合失当 → 凶

配合要素：
  ① 天元是否有力（透干且得根）
  ② 人元是否能用（藏干是否透出）
  ③ 地支是否稳定（无冲刑破害）
</code></pre>
<hr>
<h3>六、核心命理公式</h3>
<h4>公式一：三元本体论</h4>
<pre><code>天元（天干） + 地元（地支） + 人元（藏干） = 完整命局
    ↓              ↓              ↓
   显用           根基           通变
</code></pre>
<h4>公式二：天道运行论</h4>
<pre><code>天（阳） + 地（阴） + 人（中和） = 完整天道
  ↓         ↓          ↓
春夏木火  秋冬金水   季土调和
  ↓         ↓          ↓
生长收藏   收敛封藏   平衡转化
</code></pre>
<h4>公式三：万法归宗论</h4>
<pre><code>三元为宗 → 万法皆从此出
    ↓
观察阴阳 → 审察五行 → 判定三元配合 → 推断命局吉凶
</code></pre>
<h4>公式四：命局分析总公式</h4>
<pre><code>命局 = 天元 + 人元 + 地支
   ↓
天元定显用 → 日主与十神的关系
人元定通变 → 地支内在的气机变化
地支定根基 → 日主是否得地
   ↓
三者配合 → 命局吉凶判定
</code></pre>
<hr>
<h2>🔥 第三部分：实战应用（高手层）</h2>
<h3>七、三元在命局分析中的具体应用</h3>
<h4>7.1 天元应用（天干分析）</h4>
<p><strong>【三步法】</strong></p>
<pre><code>第一步：看天干透出何神
  → 确定命局显用的十神
  → 判断命局的主要矛盾

第二步：看天干之间的生克制化
  → 判断天元是否清纯
  → 判断天元是否有情

第三步：看天干与地支的关系
  → 判断天元是否得根
  → 判断天元是否有底气
</code></pre>
<p><strong>【例】</strong></p>
<pre><code>乾造：甲午 庚午 丙子 壬辰
     │    │    │    │
   天元 天元 天元 天元
     ↓    ↓    ↓    ↓
   甲木 庚金 丙火 壬水
     ↓    ↓    ↓    ↓
   显用 显用 显用 显用
</code></pre>
<h4>7.2 人元应用（藏干分析）</h4>
<p><strong>【三步法】</strong></p>
<pre><code>第一步：看地支藏何干
  → 确定地支内在的气机
  → 判断人元的力量大小

第二步：看人元是否透出天干
  → 判断人元能否显用
  → 判断命局是否有潜力

第三步：看人元与他支的关系
  → 判断人元是否能流通
  → 判断命局是否有生气
</code></pre>
<p><strong>【例】</strong></p>
<pre><code>子月：地支子藏癸水
  → 人元为癸水
  → 癸水是否透出？
  → 透出则人元可用
</code></pre>
<h4>7.3 地元应用（地支分析）</h4>
<p><strong>【三步法】</strong></p>
<pre><code>第一步：看地支本身五行
  → 确定命局的根基
  → 判断日主是否得地

第二步：看地支之间的刑冲合害
  → 判断地支是否稳定
  → 判断命局是否有动荡

第三步：看地支对天干的影响
  → 判断根基对显用的支撑
  → 判断命局是否有力
</code></pre>
<hr>
<h3>八、本章与后续章节的关联</h3>
<table>
<thead>
<tr>
<th>后续篇章</th>
<th>关联内容</th>
<th>学习提示</th>
</tr>
</thead>
<tbody><tr>
<td><strong>地道</strong></td>
<td>三元中的地元，地支的根基作用</td>
<td>地元是地支层面</td>
</tr>
<tr>
<td><strong>人道</strong></td>
<td>三元中的人元，命局中的通变之机</td>
<td>人元是通变层面</td>
</tr>
<tr>
<td><strong>天干</strong></td>
<td>天元的详细展开</td>
<td>天元是显用层面</td>
</tr>
<tr>
<td><strong>地支</strong></td>
<td>地元的详细展开</td>
<td>地元是根基层面</td>
</tr>
<tr>
<td><strong>配合</strong></td>
<td>三元如何配合成格</td>
<td>三元配合决定格局</td>
</tr>
<tr>
<td><strong>八格</strong></td>
<td>配合之后的格局论断</td>
<td>八格是配合的结果</td>
</tr>
</tbody></table>
<hr>
<h2>🏆 第四部分：核心背诵</h2>
<h3>九、必须背诵的名句</h3>
<blockquote>
<p><strong>名句一：</strong> 欲识三元万法宗，先观帝载与神功
→ 点明三元是万法之宗</p>
</blockquote>
<blockquote>
<p><strong>名句二：</strong> 天有阴阳，故春木、夏火、秋金、冬水、季土，随乎时节，显其神功
→ 天道运行的基本规律</p>
</blockquote>
<blockquote>
<p><strong>名句三：</strong> 天干为天元，地支为地元，支中所藏为人元
→ 三元的基本定义</p>
</blockquote>
<blockquote>
<p><strong>名句四：</strong> 人之命命，万有不齐，总不越此三元之理
→ 万变不离其宗</p>
</blockquote>
<hr>
<h2>✅ 第五部分：学习检验</h2>
<h3>十、自测题</h3>
<table>
<thead>
<tr>
<th>题号</th>
<th>问题</th>
<th>参考答案</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>三元指哪三元？</td>
<td>天元（天干）、地元（地支）、人元（藏干）</td>
</tr>
<tr>
<td>2</td>
<td>天道的核心规律是什么？</td>
<td>天有阴阳，四时有五行，五行随季节显功用</td>
</tr>
<tr>
<td>3</td>
<td>&quot;万法宗&quot;指的是什么？</td>
<td>三元之理是所有命理方法的根本宗源</td>
</tr>
<tr>
<td>4</td>
<td>天元、地元、人元的关系是什么？</td>
<td>天元为显，地元为基，人元为通</td>
</tr>
<tr>
<td>5</td>
<td>春木、夏火、秋金、冬水、季土分别代表什么？</td>
<td>木火金水土随季节显神功</td>
</tr>
</tbody></table>
<hr>
<h2>📝 附：完整原文</h2>
<h3>原文一：开篇正文</h3>
<pre><code>欲识三元万法宗，先观帝载与神功。
</code></pre>
<h3>原文二：【原注】</h3>
<pre><code>天有阴阳，故春木、夏火、秋金、冬水、季土，
随乎时节，显其神功，命中天地人三元之理，悉本于此。
</code></pre>
<h3>原文三：【任氏曰】</h3>
<pre><code>天干为天元，地支为地元，支中所藏为人元。
人之命命，万有不齐，总不越此三元之理，所谓万法宗也。
《滴天髓》首明天道如此。
</code></pre>
<hr>
<p><em>本解读由 Hermes Agent 自动生成于 2026-05-13</em></p>
`,坤道:`<h1>《滴天髓》·坤道篇·详细解读教程</h1>
<blockquote>
<p><strong>原著：</strong> 《滴天髓》上篇第二章·坤道
<strong>注疏：</strong> 任铁樵（徐乐吾评注本）
<strong>正文：</strong> 坤元合德机缄通，五气偏全会凶吉
<strong>本章字数：</strong> 223字
<strong>完成日期：</strong> 2026-05-13
<strong>页面：</strong> <a href="https://www.iwzbz.com/artical/pcbook/v2/3_1_7_4.html">https://www.iwzbz.com/artical/pcbook/v2/3_1_7_4.html</a></p>
</blockquote>
<hr>
<h2>📖 第一部分：通读全貌（扫盲层）</h2>
<h3>一、本章地位</h3>
<pre><code>天道篇（第一章）→ 天元、地元、人元
  ↓
坤道篇（第二章）→ 地元的具体展开
  ↓
地道 = 坤象 = 地支之德
</code></pre>
<p><strong>天道</strong>论天之阴阳五行，<strong>坤道</strong>论地之刚柔厚载。坤道是天道在地支层面的具体展开。</p>
<h3>二、本章结构</h3>
<pre><code>┌─────────────────────────────────────────┐
│              坤道篇结构                  │
├─────────────────────────────────────────┤
│                                         │
│  ① 开篇正文（14字）                     │
│     坤元合德机缄通，五气偏全会凶吉       │
│                                         │
│  ② 【原注】详解（64字）                  │
│     地有刚柔，故五行生于东南西北中，     │
│     与天合德，而感其机缄之妙……          │
│                                         │
│  ③ 【任氏曰】详解（72字）                │
│     &quot;大哉乾元，万物资始&quot;，              │
│     &quot;至哉坤元，万物资生&quot;……              │
│                                         │
└─────────────────────────────────────────┘
</code></pre>
<h3>三、生僻字词速查</h3>
<table>
<thead>
<tr>
<th>字词</th>
<th>读音</th>
<th>含义</th>
</tr>
</thead>
<tbody><tr>
<td><strong>坤元</strong></td>
<td>kūn yuán</td>
<td>地之元始，地的根本</td>
</tr>
<tr>
<td><strong>合德</strong></td>
<td>hé dé</td>
<td>与天德相合</td>
</tr>
<tr>
<td><strong>机缄</strong></td>
<td>jī jiān</td>
<td>机关，造化之枢纽</td>
</tr>
<tr>
<td><strong>偏全</strong></td>
<td>piān quán</td>
<td>偏倚与完整</td>
</tr>
<tr>
<td><strong>刚柔</strong></td>
<td>gāng róu</td>
<td>刚健与柔顺</td>
</tr>
<tr>
<td><strong>厚载</strong></td>
<td>hòu zài</td>
<td>厚德承载万物</td>
</tr>
</tbody></table>
<hr>
<h2>📚 第二部分：逐层精解（专业层）</h2>
<h3>四、原文逐句解析</h3>
<h4>4.1 开篇正文</h4>
<blockquote>
<p><strong>原文：</strong> 坤元合德机缄通，五气偏全会凶吉</p>
</blockquote>
<p><strong>【逐句拆解】</strong></p>
<table>
<thead>
<tr>
<th>关键词</th>
<th>含义</th>
<th>命理指向</th>
</tr>
</thead>
<tbody><tr>
<td><strong>坤元</strong></td>
<td>地之元始</td>
<td>地支是命的根基</td>
</tr>
<tr>
<td><strong>合德</strong></td>
<td>与天德相合</td>
<td>地支与天干配合</td>
</tr>
<tr>
<td><strong>机缄通</strong></td>
<td>造化机关通畅</td>
<td>地支藏干流通无阻</td>
</tr>
<tr>
<td><strong>五气</strong></td>
<td>木火土金水五行之气</td>
<td>五行在地支的分布</td>
</tr>
<tr>
<td><strong>偏全</strong></td>
<td>偏倚与完整</td>
<td>五行是否齐全</td>
</tr>
<tr>
<td><strong>会凶吉</strong></td>
<td>会合则吉，偏枯则凶</td>
<td>五行配合决定吉凶</td>
</tr>
</tbody></table>
<p><strong>【图解】</strong></p>
<pre><code>坤元合德机缄通，五气偏全会凶吉
   ↓           ↓       ↓
  地支藏干    机关通畅   五行配合
   ↓           ↓       ↓
 与天干合德   气脉流通   吉凶判定
</code></pre>
<hr>
<h4>4.2 【原注】详解</h4>
<blockquote>
<p><strong>原文：</strong> 地有刚柔，故五行生于东南西北中，与天合德，而感其机缄之妙。赋于人者，有偏全之不一，故吉凶定于此。</p>
</blockquote>
<p><strong>【逐段解读】</strong></p>
<table>
<thead>
<tr>
<th>关键词</th>
<th>命理含义</th>
</tr>
</thead>
<tbody><tr>
<td><strong>地有刚柔</strong></td>
<td>地道分刚柔两面，柔顺为坤之本德</td>
</tr>
<tr>
<td><strong>五行生于东南西北中</strong></td>
<td>木火金水分居四维，土居中央</td>
</tr>
<tr>
<td><strong>与天合德</strong></td>
<td>地支与天干相合，天地配合</td>
</tr>
<tr>
<td><strong>感其机缄之妙</strong></td>
<td>感受造化机关的妙处</td>
</tr>
<tr>
<td><strong>赋于人者有偏全</strong></td>
<td>人禀赋五行有偏全之别</td>
</tr>
<tr>
<td><strong>吉凶定于此</strong></td>
<td>吉凶取决于五行偏全</td>
</tr>
</tbody></table>
<p><strong>【任注解读】</strong></p>
<p>任铁樵从天地对应角度阐释：</p>
<blockquote>
<p>乾元主健，坤元主顺
顺以承天，德与天合
昭融覆盖，载华育</p>
</blockquote>
<p><strong>【核心思想】</strong></p>
<pre><code>乾（天） = 刚健，主动，主始
坤（地） = 柔顺，主承，主生

天（乾元）主健 → 赋予万物的元始之气
地（坤元）主顺 → 承载天德，孕育万物
</code></pre>
<hr>
<h4>4.3 【任氏曰】详解</h4>
<blockquote>
<p><strong>原文：</strong> &quot;大哉乾元，万物资始&quot;，&quot;至哉坤元，万物资生&quot;，乾主健，坤主顺，顺以承天，德与天合；昭融覆盖，耨育物र्त。噤五行之氣有偏全，故萬物之命有吉凶。</p>
</blockquote>
<p><strong>【逐段解读】</strong></p>
<table>
<thead>
<tr>
<th>关键词</th>
<th>命理含义</th>
</tr>
</thead>
<tbody><tr>
<td><strong>乾元主健</strong></td>
<td>天道主刚健</td>
</tr>
<tr>
<td><strong>坤元主顺</strong></td>
<td>地道主柔顺</td>
</tr>
<tr>
<td><strong>顺以承天</strong></td>
<td>柔顺以承接天道</td>
</tr>
<tr>
<td><strong>德与天合</strong></td>
<td>地道之德与天道相合</td>
</tr>
<tr>
<td><strong>昭融覆盖</strong></td>
<td>光明融和，覆盖万物</td>
</tr>
<tr>
<td><strong>耨育万物</strong></td>
<td>养护培育万物</td>
</tr>
<tr>
<td><strong>五行之气有偏全</strong></td>
<td>五行之气在地支分布有偏全</td>
</tr>
<tr>
<td><strong>万物之命有吉凶</strong></td>
<td>因此万物的命有吉凶之分</td>
</tr>
</tbody></table>
<p><strong>【核心思想】</strong></p>
<pre><code>乾元 = 万物资始（天）
坤元 = 万物资生（地）

天施 → 地受
天始 → 地生

五气偏全 → 命有吉凶
</code></pre>
<hr>
<h3>五、坤道与命局分析</h3>
<h4>5.1 坤元与地支的关系</h4>
<pre><code>坤元 = 地支之元
  ↓
地支为地元
  ↓
地支藏干为人元
  ↓
坤元合德 → 天干与地支配合
  ↓
机缄通 → 藏干流通无阻
  ↓
五气偏全 → 判断命局吉凶
</code></pre>
<h4>5.2 命局吉凶判断</h4>
<pre><code>五气偏全 → 吉
  ├─ 五行齐全
  ├─ 无过旺过衰
  └─ 地支藏干流通

五气偏枯 → 凶
  ├─ 五行缺失
  ├─ 过旺或过衰
  └─ 地支藏干受阻
</code></pre>
<hr>
<h3>六、核心命理公式</h3>
<h4>公式一：乾坤对应论</h4>
<pre><code>乾元（天元） + 坤元（地元） = 天地配合
   ↓              ↓
  刚健主始       柔顺主生
</code></pre>
<h4>公式二：坤道与吉凶</h4>
<pre><code>坤元合德 + 五气偏全 → 吉
坤元失德 + 五气偏枯 → 凶
</code></pre>
<h4>公式三：地支分析论</h4>
<pre><code>地支（地元）
   ↓
藏干（人元）
   ↓
与天干（天元）配合
   ↓
机缄通否 → 吉凶判定
</code></pre>
<hr>
<h2>🔥 第三部分：实战应用（高手层）</h2>
<h3>七、坤道在命局分析中的具体应用</h3>
<h4>7.1 观地支之刚柔</h4>
<pre><code>地支刚柔判断：
  刚 → 寅、申、巳、亥（驿马冲动）
  柔 → 子、午、卯、酉（专位静守）
  中 → 辰戌丑未（杂气）

刚柔配合：
  刚柔相济 → 中和之命
  过刚无柔 → 刑克之命
  过柔无刚 → 懦弱之命
</code></pre>
<h4>7.2 观五气偏全</h4>
<pre><code>五气偏全判断：
  五行齐全 → 命局有根基
  缺一五行 → 命局有缺陷
  缺二五行 → 命局偏枯

偏枯补救：
  缺则补之（用神补）
  偏则抑之（忌神制）
</code></pre>
<h4>7.3 观机缄通塞</h4>
<pre><code>机缄通 → 地支藏干流通
  ├─ 藏干相生 → 气脉流通
  ├─ 藏干相合 → 情意相通
  └─ 无冲刑破害 → 根基稳固

机缄塞 → 地支藏干阻滞
  ├─ 藏干相克 → 气脉受阻
  ├─ 冲刑破害 → 根基动摇
  └─ 缺五行 → 无气可通
</code></pre>
<hr>
<h3>八、本章与后续章节的关联</h3>
<table>
<thead>
<tr>
<th>后续篇章</th>
<th>关联内容</th>
<th>学习提示</th>
</tr>
</thead>
<tbody><tr>
<td><strong>人道</strong></td>
<td>坤道在人道的体现</td>
<td>人元是坤道的通变</td>
</tr>
<tr>
<td><strong>天干</strong></td>
<td>天元与坤元的关系</td>
<td>天干为天元</td>
</tr>
<tr>
<td><strong>地支</strong></td>
<td>坤元的详细展开</td>
<td>地支为地元</td>
</tr>
<tr>
<td><strong>配合</strong></td>
<td>天地如何合德</td>
<td>天干地支配合成格</td>
</tr>
<tr>
<td><strong>形象</strong></td>
<td>乾坤形象的延伸</td>
<td>形象论的基础</td>
</tr>
</tbody></table>
<hr>
<h2>🏆 第四部分：核心背诵</h2>
<h3>九、必须背诵的名句</h3>
<blockquote>
<p><strong>名句一：</strong> 坤元合德机缄通，五气偏全会凶吉
→ 坤道是吉凶判定的根本</p>
</blockquote>
<blockquote>
<p><strong>名句二：</strong> 地有刚柔，故五行生于东南西北中，与天合德，而感其机缄之妙
→ 地道刚柔与五行的关系</p>
</blockquote>
<blockquote>
<p><strong>名句三：</strong> 乾主健，坤主顺，顺以承天，德与天合
→ 乾坤对应的核心思想</p>
</blockquote>
<blockquote>
<p><strong>名句四：</strong> 五行之气有偏全，故万物之命有吉凶
→ 偏全决定吉凶</p>
</blockquote>
<hr>
<h2>✅ 第五部分：学习检验</h2>
<h3>十、自测题</h3>
<table>
<thead>
<tr>
<th>题号</th>
<th>问题</th>
<th>参考答案</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>坤元与乾元的关系是什么？</td>
<td>乾主健，坤主顺；乾为资始，坤为资生</td>
</tr>
<tr>
<td>2</td>
<td>&quot;机缄通&quot;指的是什么？</td>
<td>地支藏干流通无阻</td>
</tr>
<tr>
<td>3</td>
<td>五气偏全与吉凶的关系是什么？</td>
<td>偏全则吉，偏枯则凶</td>
</tr>
<tr>
<td>4</td>
<td>坤道在地支分析中的作用是什么？</td>
<td>判断地支刚柔与藏干流通</td>
</tr>
<tr>
<td>5</td>
<td>&quot;与天合德&quot;的含义是什么？</td>
<td>地支与天干配合，天地相合</td>
</tr>
</tbody></table>
<hr>
<h2>📝 附：完整原文</h2>
<h3>原文一：开篇正文</h3>
<pre><code>坤元合德机缄通，五气偏全会凶吉。
</code></pre>
<h3>原文二：【原注】</h3>
<pre><code>地有刚柔，故五行生于东南西北中，
与天合德，而感其机缄之妙。
赋于人者，有偏全之不一，故吉凶定于此。
</code></pre>
<h3>原文三：【任氏曰】</h3>
<pre><code>&quot;大哉乾元，万物资始&quot;，&quot;至哉坤元，万物资生&quot;。
乾主健，坤主顺，顺以承天，德与天合；
昭融覆盖，耨育万物。
噤五行之氣有偏全，故萬物之命有吉凶。
</code></pre>
<hr>
<h2>📋 备注</h2>
<p>本篇章为《滴天髓阐微》坤道篇（地道），内容较为简洁，无命造实例。后续篇章如配合、八格等有丰富命造实例，可结合学习。</p>
<hr>
<p><em>本解读由 Hermes Agent 自动生成于 2026-05-13</em></p>
`,人道:`<h1>《滴天髓》·人道篇·详细解读教程</h1>
<blockquote>
<p><strong>原著：</strong> 《滴天髓》上篇第三章·人道
<strong>注疏：</strong> 任铁樵（徐乐吾评注本）
<strong>正文：</strong> 戴天履地人为贵，顺则吉兮凶则悖
<strong>本章字数：</strong> 708字
<strong>完成日期：</strong> 2026-05-13
<strong>页面：</strong> <a href="https://www.iwzbz.com/artical/pcbook/v2/3_1_7_5.html">https://www.iwzbz.com/artical/pcbook/v2/3_1_7_5.html</a></p>
</blockquote>
<hr>
<h2>📖 第一部分：通读全貌（扫盲层）</h2>
<h3>一、本章地位</h3>
<pre><code>天道篇 → 天元（天干）→ 天地之理
坤道篇 → 地元（地支）→ 刚柔厚载
  ↓
人道篇 → 人元（藏干）→ 顺悖吉凶
</code></pre>
<p>人道篇是天道、坤道之后的第三篇，核心论述<strong>人禀五行之全，命以顺悖定吉凶</strong>。</p>
<h3>二、本章结构</h3>
<pre><code>┌─────────────────────────────────────────────────┐
│  ① 开篇正文（12字）                              │
│     戴天履地人为贵，顺则吉兮凶则悖                │
│                                                 │
│  ② 【原注】                                      │
│     万物莫不得五行而戴天履地，惟人得五行之全……   │
│                                                 │
│  ③ 【任氏曰】第一段：顺悖之理（核心）             │
│     顺者接续相生，悖者反克为害                   │
│                                                 │
│  ④ 【任氏曰】第二段：五行偏枯批判                │
│     谬书妄言四戊午为圣帝之造，皆后人讹传          │
│                                                 │
│  ⑤ 【任氏曰】第三段：命造实例（四壬寅）          │
│     史姓四壬寅，偏枯终有损                       │
└─────────────────────────────────────────────────┘
</code></pre>
<hr>
<h2>📚 第二部分：逐层精解（专业层）</h2>
<h3>四、开篇正文解析</h3>
<blockquote>
<p><strong>原文：</strong> 戴天履地人为贵，顺则吉兮凶则悖</p>
</blockquote>
<table>
<thead>
<tr>
<th>关键词</th>
<th>含义</th>
<th>命理指向</th>
</tr>
</thead>
<tbody><tr>
<td><strong>戴天履地</strong></td>
<td>头顶天，脚踏地</td>
<td>人立于天地之间</td>
</tr>
<tr>
<td><strong>人为贵</strong></td>
<td>人为万物之贵</td>
<td>人禀五行之全</td>
</tr>
<tr>
<td><strong>顺则吉</strong></td>
<td>顺五行之理则吉</td>
<td>相生相化，顺势而吉</td>
</tr>
<tr>
<td><strong>凶则悖</strong></td>
<td>悖五行之理则凶</td>
<td>反克为害，逆势而凶</td>
</tr>
</tbody></table>
<p><strong>【任注解读】</strong></p>
<blockquote>
<p>人居覆载之中，戴天履地，八字贵乎天干地支顺而不悖也</p>
</blockquote>
<p>顺悖是判断命局吉凶的核心标准。</p>
<hr>
<h3>五、【原注】详解</h3>
<blockquote>
<p>万物莫不得五行而戴天履地，惟人得五行之全，故为贵。其有吉凶之不一者，以其得于五行之顺与悖也。</p>
</blockquote>
<p><strong>【逐句解读】</strong></p>
<table>
<thead>
<tr>
<th>关键词</th>
<th>命理含义</th>
</tr>
</thead>
<tbody><tr>
<td>万物莫不得五行</td>
<td>所有事物都禀赋五行之气</td>
</tr>
<tr>
<td>戴天履地</td>
<td>头顶天，脚踏地</td>
</tr>
<tr>
<td>惟人得五行之全</td>
<td>唯独人得五行之完全</td>
</tr>
<tr>
<td>故为贵</td>
<td>因此人为万物之贵</td>
</tr>
<tr>
<td>吉凶之不一</td>
<td>吉凶各有不同</td>
</tr>
<tr>
<td>得于五行之顺与悖</td>
<td>取决于五行配合的顺逆</td>
</tr>
</tbody></table>
<p><strong>【图解】</strong></p>
<pre><code>五行与人：
  万物 → 各得五行之一偏（羽虫属火，毛虫属木...）
  人   → 得五行之全（土居中央，木火金水中气）
  ↓
  五行全 → 贵
  五行偏 → 贱
</code></pre>
<hr>
<h3>六、【任氏曰】详解（核心）</h3>
<h4>6.1 顺悖之理</h4>
<blockquote>
<p>顺者接续相生，悖者反克为害，故吉凶判然。</p>
</blockquote>
<p><strong>【顺的四种情况】</strong></p>
<table>
<thead>
<tr>
<th>情形</th>
<th>举例</th>
<th>结果</th>
</tr>
</thead>
<tbody><tr>
<td>天干气弱，地支生之</td>
<td>木弱，亥子水生木</td>
<td>有情而顺</td>
</tr>
<tr>
<td>地支神衰，天干辅之</td>
<td>水衰，天干壬癸助水</td>
<td>有情而顺</td>
</tr>
<tr>
<td>地支有根，天干通根</td>
<td>木有寅卯，天干甲乙</td>
<td>有情而顺</td>
</tr>
<tr>
<td>天干有化，地支化解</td>
<td>木被金克，壬癸化金</td>
<td>有情而顺</td>
</tr>
</tbody></table>
<p><strong>【悖的四种情况】</strong></p>
<table>
<thead>
<tr>
<th>情形</th>
<th>举例</th>
<th>结果</th>
</tr>
</thead>
<tbody><tr>
<td>天干气弱，地支抑之</td>
<td>木弱，申酉金克木</td>
<td>无情而悖</td>
</tr>
<tr>
<td>地支神衰，天干克之</td>
<td>水衰，戊己土克水</td>
<td>无情而悖</td>
</tr>
<tr>
<td>支无根而加帮扶</td>
<td>木无根，辰戌丑未助金</td>
<td>无情而悖</td>
</tr>
<tr>
<td>天干无化而党助忌神</td>
<td>木无壬癸，戊己透干</td>
<td>无情而悖</td>
</tr>
</tbody></table>
<hr>
<h4>6.2 木为例的完整分析</h4>
<blockquote>
<p>假如干是木，畏金之克，地支有亥子生之；支无亥子，天干有壬癸以化之；干无壬癸，地支有寅卯以通根；支无寅卯，天干有丙丁以制之，木有生机，吉可知矣。</p>
</blockquote>
<p><strong>【木的四种救应】</strong></p>
<pre><code>木（天干）被金克 → 四种救应方式：
  ① 地支亥子水 → 生木化金
  ② 天干壬癸水 → 化金生木
  ③ 地支寅卯木 → 通根帮木
  ④ 天干丙丁火 → 制金护木
  ↓
  任何一种 → 木有生机 → 吉
</code></pre>
<blockquote>
<p>若天干无壬癸，而反透之以戊己；支无亥子寅卯，而反加之以辰戌丑未申酉，党助庚辛之金，木无生理，凶可知矣。</p>
</blockquote>
<p><strong>【木的悖逆情况】</strong></p>
<pre><code>木被金克 → 无救应 + 加重 → 凶
  ├─ 天干无壬癸，反透戊己 → 己土助金克木
  ├─ 支无亥子寅卯 → 无根可援
  ├─ 加辰戌丑未申酉 → 党助金势
  └─ 木无生理 → 凶
</code></pre>
<hr>
<h4>6.3 五行偏枯批判</h4>
<blockquote>
<p>谬书妄言四戊午者，是圣帝之造，四癸亥者，是张桓侯之造，究其理皆后人讹传。</p>
</blockquote>
<p><strong>【批判对象】</strong></p>
<table>
<thead>
<tr>
<th>谬说</th>
<th>谬称</th>
<th>任注观点</th>
</tr>
</thead>
<tbody><tr>
<td>四戊午</td>
<td>圣帝之造</td>
<td>后人讹传</td>
</tr>
<tr>
<td>四癸亥</td>
<td>张桓侯之造</td>
<td>后人讹传</td>
</tr>
<tr>
<td>四丁未</td>
<td>（未列）</td>
<td>同属偏枯</td>
</tr>
<tr>
<td>四乙酉</td>
<td>（未列）</td>
<td>同属偏枯</td>
</tr>
</tbody></table>
<p><strong>【任注结论】</strong></p>
<blockquote>
<p>皆作偏枯论，无不应验</p>
</blockquote>
<hr>
<h4>6.4 命造实例：史姓四壬寅</h4>
<p><strong>【命造】</strong></p>
<pre><code>四壬寅
  壬寅 壬寅 壬寅 壬寅
    │    │    │    │
  水木  水木  水木  水木
</code></pre>
<p><strong>【命局分析】</strong></p>
<table>
<thead>
<tr>
<th>分析要点</th>
<th>内容</th>
</tr>
</thead>
<tbody><tr>
<td>日主</td>
<td>壬水，四壬无甲木通根，身弱</td>
</tr>
<tr>
<td>用神</td>
<td>寅中火土（食神、财星）</td>
</tr>
<tr>
<td>问题</td>
<td>寅中火土之气无从引出</td>
</tr>
<tr>
<td>早年</td>
<td>幼遭孤苦，中受饥寒</td>
</tr>
<tr>
<td>中年</td>
<td>运转南方，引出寅中火气</td>
</tr>
<tr>
<td>结果</td>
<td>得际遇，经营发财</td>
</tr>
<tr>
<td>晚年</td>
<td>无子，家业分夺一空</td>
</tr>
</tbody></table>
<p><strong>【任注断语】</strong></p>
<blockquote>
<p>命贵中和，偏枯终于有损；理求平正，奇异不足为凭</p>
</blockquote>
<p><strong>【核心结论】</strong></p>
<pre><code>偏枯 → 终有损
中和 → 命之贵
奇异 → 不足凭
</code></pre>
<hr>
<h3>七、核心命理公式</h3>
<h4>公式一：人道总纲</h4>
<pre><code>人禀五行之全 → 贵
顺五行之理 → 吉
悖五行之理 → 凶
</code></pre>
<h4>公式二：顺悖判断</h4>
<pre><code>顺 = 接续相生 = 有情 = 吉
悖 = 反克为害 = 无情 = 凶
</code></pre>
<h4>公式三：五行救应</h4>
<pre><code>日主被克 → 四种救应（生、化、根、制）
  ├─ 有一种 → 吉
  └─ 无一种 → 凶
</code></pre>
<h4>公式四：偏枯论</h4>
<pre><code>偏枯 = 四柱缺陷/五行偏枯 = 终有损
中和 = 四柱流通/五行生化 = 命之贵
奇异 = 非中和之命 = 不足为凭
</code></pre>
<hr>
<h2>🔥 第三部分：实战应用（高手层）</h2>
<h3>八、顺悖分析实战</h3>
<h4>8.1 判断顺悖四步法</h4>
<pre><code>第一步：观日主被何物所克
  → 确定忌神

第二步：观有无救应
  ① 地支有无生助日主之物
  ② 天干有无化忌之神
  ③ 地支有无通根之支
  ④ 天干有无制忌之物

第三步：判断有情无情
  有救应 → 有情 → 顺则吉
  无救应 → 无情 → 悖则凶

第四步：观运程配合
  早年无救应 → 命苦
  中年有运助 → 转机
  晚年运又变 → 再变
</code></pre>
<h4>8.2 偏枯命局特征</h4>
<pre><code>偏枯命局特征：
  ① 四柱中缺一五行
  ② 日主无根或根被冲破
  ③ 用神无力或被制
  ④ 忌神猖狂无制

偏枯命局结果：
  ① 早年艰难
  ② 中年转机（需大运配合）
  ③ 晚年再变（运过又衰）
  ④ 难以全美
</code></pre>
<hr>
<h2>🏆 第四部分：核心背诵</h2>
<h3>九、必须背诵的名句</h3>
<blockquote>
<p><strong>1.</strong> 戴天履地人为贵，顺则吉兮凶则悖
→ 人道总纲</p>
</blockquote>
<blockquote>
<p><strong>2.</strong> 万物莫不得五行而戴天履地，惟人得五行之全，故为贵
→ 人贵于万物之因</p>
</blockquote>
<blockquote>
<p><strong>3.</strong> 顺者接续相生，悖者反克为害，故吉凶判然
→ 顺悖定吉凶</p>
</blockquote>
<blockquote>
<p><strong>4.</strong> 命贵中和，偏枯终于有损；理求平正，奇异不足为凭
→ 中和为贵，奇异非贵</p>
</blockquote>
<hr>
<h2>✅ 第五部分：学习检验</h2>
<h3>十、自测题</h3>
<table>
<thead>
<tr>
<th>题号</th>
<th>问题</th>
<th>参考答案</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>人为什么为贵？</td>
<td>人得五行之全</td>
</tr>
<tr>
<td>2</td>
<td>顺与悖的本质区别是什么？</td>
<td>顺=相生有情，悖=反克无情</td>
</tr>
<tr>
<td>3</td>
<td>木被金克的四种救应是什么？</td>
<td>地支亥子生、天干壬癸化、地支寅卯根、天干丙丁制</td>
</tr>
<tr>
<td>4</td>
<td>&quot;四戊午为圣帝之造&quot;为何错误？</td>
<td>偏枯论，不足为凭</td>
</tr>
<tr>
<td>5</td>
<td>史姓四壬寅命局的关键问题是什么？</td>
<td>寅中火土之气无从引出</td>
</tr>
</tbody></table>
<hr>
<h2>📝 附：完整原文</h2>
<h3>原文一：开篇正文</h3>
<pre><code>戴天履地人为贵，顺则吉兮凶则悖。
</code></pre>
<h3>原文二：【原注】</h3>
<pre><code>万物莫不得五行而戴天履地，惟人得五行之全，故为贵。
其有吉凶之不一者，以其得于五行之顺与悖也。
</code></pre>
<h3>原文三：【任氏曰】完整</h3>
<pre><code>人居覆载之中，戴天履地，八字贵乎天干地支顺而不悖也。
顺者接续相生，悖者反克为害，故吉凶判然。

如天干气弱，地支生之，地支神衰，天干辅之，皆为有情而顺则吉；
如天干衰弱，地支抑之，地支气弱，天干克之，皆为无情而悖则凶也。

假如干是木，畏金之克，地支有亥子生之；支无亥子，天干有壬癸以化之；
干无壬癸，地支有寅卯以通根；支无寅卯，天干有丙丁以制之，木有生机，吉可知矣。
若天干无壬癸，而反透之以戊己；支无亥子寅卯，而反加之以辰戌丑未申酉，
党助庚辛之金，木无生理，凶可知矣。馀可类推。

凡物莫不得五行，戴天履地，即羽毛鳞蚧，亦各得五行专气而生，
如羽虫属火，毛属木，鳞属金，蚧属水。
惟人属土，土居中央，乃木火金水中气所成，独是五行之全，为贵。
是以人之八字，最宜四柱流通，五行生化；大忌四柱缺陷，五行偏枯。
谬书妄言四戊午者，是圣帝之造，四癸亥者，是张桓侯之造，究其理皆后人讹传。

余行道以来，推过四戊午、四丁未、四癸亥、四乙酉、四辛卯、四庚辰、四甲戌者甚多，
皆作偏枯论，无不应验。
同邑史姓者有四壬寅者，寅中火土长生，食神禄旺，尚有生化之忣，
而妻财子禄，不能全美，只因寅中火土之气，无从引出，
以致幼遭孤苦，中受饥寒；至三旬外，运转南方，引出寅中火气，得际遇，经营发财；
后竟无子，家业分夺一空。可知仍作偏枯论也。
由此观之，命贵中和，偏枯终于有损；理求平正，奇异不足为凭。
</code></pre>
<hr>
<p><em>本解读由 Hermes Agent 自动生成于 2026-05-13</em></p>
`,知命:`<h1>《滴天髓》·知命篇·详细解读教程</h1>
<blockquote>
<p><strong>原著：</strong> 《滴天髓》上篇第四章·知命
<strong>注疏：</strong> 任铁樵（徐乐吾评注本）
<strong>正文：</strong> 要与人间开聋聩，顺逆之机须理会
<strong>本章字数：</strong> 2130字
<strong>完成日期：</strong> 2026-05-13
<strong>页面：</strong> <a href="https://www.iwzbz.com/artical/pcbook/v2/3_1_7_6.html">https://www.iwzbz.com/artical/pcbook/v2/3_1_7_6.html</a></p>
</blockquote>
<hr>
<h2>📖 第一部分：通读全貌（扫盲层）</h2>
<h3>一、本章地位</h3>
<pre><code>天道篇 → 天元 → 天地之理
坤道篇 → 地元 → 刚柔厚载
人道篇 → 人元 → 顺悖吉凶
  ↓
知命篇 → 顺逆之机 → 论命之要
</code></pre>
<p>知命篇是天道、坤道、人道三篇基础理论之后的第一篇实务论，核心论述<strong>顺逆之机为论命之要</strong>。</p>
<h3>二、本章结构</h3>
<pre><code>┌─────────────────────────────────────────────────┐
│  ① 开篇正文（14字）                              │
│     要与人间开聋聩，顺逆之机须理会                │
│                                                 │
│  ② 【原注】                                     │
│     不知命者如聋聩，知命于顺逆之机……            │
│                                                 │
│  ③ 【任氏曰】批判谬说                           │
│     混看奇格异局、妄论神煞、不究日主衰旺……      │
│                                                 │
│  ④ 【任氏曰】正论四句                           │
│     用之为财不可劫，用之为官不可伤……            │
│                                                 │
│  ⑤ 五个命造实例                                 │
│     高宗纯皇帝、董中堂、己酉丙寅、王姓、福建人   │
└─────────────────────────────────────────────────┘
</code></pre>
<h3>三、生僻字词速查</h3>
<table>
<thead>
<tr>
<th>字词</th>
<th>读音</th>
<th>含义</th>
</tr>
</thead>
<tbody><tr>
<td><strong>聋聩</strong></td>
<td>lóng kuì</td>
<td>耳聋眼瞎，比喻不明命理</td>
</tr>
<tr>
<td><strong>理会</strong></td>
<td>lǐ huì</td>
<td>理解、理会</td>
</tr>
<tr>
<td><strong>咸池</strong></td>
<td>xián chí</td>
<td>神煞名，主桃花女淫</td>
</tr>
<tr>
<td><strong>金锁铁蛇</strong></td>
<td>jīn suǒ tiě shé</td>
<td>小儿关煞名</td>
</tr>
<tr>
<td><strong>旺相</strong></td>
<td>wàng xiàng</td>
<td>月令当令，旺盛</td>
</tr>
<tr>
<td><strong>魁罡</strong></td>
<td>kuí gāng</td>
<td>壬辰、庚戌、戊戌、癸丑日</td>
</tr>
</tbody></table>
<hr>
<h2>📚 第二部分：逐层精解（专业层）</h2>
<h3>四、开篇正文解析</h3>
<blockquote>
<p><strong>原文：</strong> 要与人间开聋聩，顺逆之机须理会</p>
</blockquote>
<table>
<thead>
<tr>
<th>关键词</th>
<th>含义</th>
<th>命理指向</th>
</tr>
</thead>
<tbody><tr>
<td><strong>开聋聩</strong></td>
<td>开启愚昧不明之人</td>
<td>使人知命</td>
</tr>
<tr>
<td><strong>顺逆之机</strong></td>
<td>顺逆的关键机括</td>
<td>论命的根本</td>
</tr>
<tr>
<td><strong>须理会</strong></td>
<td>必须理解理会</td>
<td>顺逆为论命之要</td>
</tr>
</tbody></table>
<p><strong>【任注解读】</strong></p>
<blockquote>
<p>不知命者如聋聩，知命于顺逆之机而能理会之，庶可以开天下之聋聩</p>
</blockquote>
<hr>
<h3>五、【原注】详解</h3>
<blockquote>
<p>不知命者如聋聩，知命于顺逆之机而能理会之，庶可以开天下之聋聩。</p>
</blockquote>
<p><strong>【核心思想】</strong></p>
<ul>
<li>不知命者 → 如聋聩（不明）</li>
<li>知命者 → 理会顺逆之机</li>
<li>理会顺逆 → 可开聋聩（明命）</li>
</ul>
<hr>
<h3>六、【任氏曰】详解（核心批判）</h3>
<h4>6.1 批判五种谬说</h4>
<table>
<thead>
<tr>
<th>序号</th>
<th>批判对象</th>
<th>谬误表现</th>
<th>任注观点</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>奇格异局</td>
<td>混看神煞纳音</td>
<td>非关命理休咎</td>
</tr>
<tr>
<td>2</td>
<td>桃花咸池</td>
<td>专论女命邪淫</td>
<td>受责鬼神</td>
</tr>
<tr>
<td>3</td>
<td>金锁铁蛇</td>
<td>谬指小儿关煞</td>
<td>忧人父母</td>
</tr>
<tr>
<td>4</td>
<td>财官为喜</td>
<td>总以财官为喜，伤杀为憎</td>
<td>不知财官为六亲取用之名</td>
</tr>
<tr>
<td>5</td>
<td>食印为福</td>
<td>尽以食印为福，枭劫为殃</td>
<td>不知日主衰旺</td>
</tr>
</tbody></table>
<h4>6.2 任注反驳</h4>
<blockquote>
<p>如财可养命，则财多身弱者，不为富屋贫人，而成巨富；官可荣身，则身衰官重者，不至夭贱，而成显贵。</p>
</blockquote>
<p><strong>【任注核心观点】</strong></p>
<pre><code>财官非养命荣身之物
  ↓
财多身弱 → 富屋贫人（不成巨富）
身衰官重 → 夭贱之人（不成显贵）
  ↓
关键在于日主衰旺
</code></pre>
<h4>6.3 正论：四句核心</h4>
<blockquote>
<p>用之为财不可劫，用之为官不可伤，用之印绶不可坏，用之食神不可夺。</p>
</blockquote>
<p><strong>【四句解读】</strong></p>
<table>
<thead>
<tr>
<th>用神</th>
<th>不可</th>
<th>原因</th>
</tr>
</thead>
<tbody><tr>
<td>财</td>
<td>不可劫</td>
<td>劫则破格</td>
</tr>
<tr>
<td>官</td>
<td>不可伤</td>
<td>伤则损贵</td>
</tr>
<tr>
<td>印</td>
<td>不可坏</td>
<td>坏则无生</td>
</tr>
<tr>
<td>食</td>
<td>不可夺</td>
<td>夺则损福</td>
</tr>
</tbody></table>
<p><strong>【关键在一&quot;用&quot;字】</strong></p>
<blockquote>
<p>其要在一&quot;用&quot;字。无知学命者，不究&quot;用&quot;字根源，专以财官为重</p>
</blockquote>
<pre><code>&quot;用&quot;字根源：
  不用财星尽可劫
  不用官星尽可伤
  不用印绶尽可坏
  不用食神尽可夺
</code></pre>
<hr>
<h3>七、五个命造实例详解</h3>
<h4>7.1 命造一：高宗纯皇帝（乾隆）</h4>
<pre><code>乾：辛卯 丁酉 庚午 丙子
     财  杀   官   官

丙丁火炼秋金（庚金）
子午卯酉冲（支全四正）
五行无土，不作旺论
</code></pre>
<p><strong>【命局分析】</strong></p>
<table>
<thead>
<tr>
<th>分析要点</th>
<th>内容</th>
</tr>
</thead>
<tbody><tr>
<td>日主</td>
<td>庚金，生于酉月，当令旺盛</td>
</tr>
<tr>
<td>用神</td>
<td>午火（官星）克金</td>
</tr>
<tr>
<td>忌神</td>
<td>子水（冲午）破火</td>
</tr>
<tr>
<td>关键</td>
<td>子午逢冲，水克火护酉金</td>
</tr>
<tr>
<td>关键</td>
<td>卯酉逢冲，金克木护午火</td>
</tr>
</tbody></table>
<p><strong>【格局判断】</strong></p>
<pre><code>庚金当令，本应旺
但子午冲 → 午火破酉金
卯酉冲 → 卯木助午火
四正俱全 → 气贯八方
无土 → 不作旺论
  ↓
午火为用，制庚金
子水冲午 → 破坏
卯木冲酉 → 护午
  ↓
制化得宜 → 大贵
</code></pre>
<p><strong>【任注断语】</strong></p>
<blockquote>
<p>天下熙宁也（金马朱鸢，并隶版图之内）</p>
</blockquote>
<hr>
<h4>7.2 命造二：董中堂</h4>
<pre><code>乾：庚申 庚辰 戊辰 戊午
     官  官   印   比

日干戊土，生于季春午时
春时虚土，非比六九月之实
</code></pre>
<p><strong>【命局分析】</strong></p>
<table>
<thead>
<tr>
<th>分析要点</th>
<th>内容</th>
</tr>
</thead>
<tbody><tr>
<td>日主</td>
<td>戊土，生于辰月（春土虚）</td>
</tr>
<tr>
<td>用神</td>
<td>午火（印星）温土</td>
</tr>
<tr>
<td>忌神</td>
<td>辰土蓄水泄火</td>
</tr>
<tr>
<td>关键</td>
<td>午火为用，辰不伤午</td>
</tr>
<tr>
<td>关键</td>
<td>两庚泄土生水（日主过泄）</td>
</tr>
</tbody></table>
<p><strong>【格局判断】</strong></p>
<pre><code>戊土生辰月，春土虚寒
午时温燥，午火为用
两辰蓄水泄火（日主过泄）
用神在午火温土
  ↓
印绶为用，精神旺足
纯粹中和 → 大贵
</code></pre>
<p><strong>【任注断语】</strong></p>
<blockquote>
<p>一生宦海无波，三十余年太平相业，直至子运会水局不禄，寿已八旬矣</p>
</blockquote>
<p><strong>【关键】</strong></p>
<ul>
<li>丑运水局冲午 → 寿终</li>
<li>印证：子运会水局不禄</li>
</ul>
<hr>
<h4>7.3 命造三：己酉 丙寅（新增）</h4>
<pre><code>乾：辛酉 辛丑 己酉 丙寅
     财  财   财   印

日干己土，诞丑月，冬土寒湿
两辛泄土生金，日主过泄
</code></pre>
<p><strong>【命局分析】</strong></p>
<table>
<thead>
<tr>
<th>分析要点</th>
<th>内容</th>
</tr>
</thead>
<tbody><tr>
<td>日主</td>
<td>己土，生于丑月（冬土寒湿）</td>
</tr>
<tr>
<td>用神</td>
<td>丙火（印星）温土</td>
</tr>
<tr>
<td>忌神</td>
<td>辛金（财星）泄土</td>
</tr>
<tr>
<td>关键</td>
<td>寅木生丙火，丙火有根</td>
</tr>
<tr>
<td>关键</td>
<td>冬土寒湿，需火温</td>
</tr>
</tbody></table>
<p><strong>【格局判断】</strong></p>
<pre><code>己土生丑月，寒湿无温
两辛泄土，日主过泄
用神在丙火温土
寅木生火 → 精神旺足
  ↓
印绶为用，人极纤美灵秀
早运壬癸有阻，南方火地 → 前程无限
</code></pre>
<p><strong>【任注断语】</strong></p>
<blockquote>
<p>人极纤美灵秀，早运壬癸，书香有阻，将来巳午未南方火地，前程未可限量</p>
</blockquote>
<hr>
<h4>7.4 命造四：王姓（身强杀浅误判）</h4>
<pre><code>乾：壬辰 壬寅 甲寅 庚午
     印  印   比   杀

俗以身强杀浅论，取庚金为用
春木逢金，必作栋梁之器
</code></pre>
<p><strong>【命局分析】</strong></p>
<table>
<thead>
<tr>
<th>分析要点</th>
<th>内容</th>
</tr>
</thead>
<tbody><tr>
<td>日主</td>
<td>甲木，生于寅月（当令）</td>
</tr>
<tr>
<td>误判</td>
<td>身强杀浅，取庚金</td>
</tr>
<tr>
<td>正判</td>
<td>庚金休囚极，午火敌之，壬水泄之</td>
</tr>
<tr>
<td>问题</td>
<td>庚金反为病（忌神）</td>
</tr>
</tbody></table>
<p><strong>【格局判断】</strong></p>
<pre><code>甲木生寅月，当令旺盛
庚金透出，本应为用
但：庚金休囚（春金衰）
    午火敌庚 → 庚被制
    壬水泄庚 → 庚无力
  ↓
庚金非用神，反为忌神
旺之极者，宜泄不宜克
午火为用，顺其气势
  ↓
书香未售，读书不第
家业渐销
</code></pre>
<p><strong>【任注断语】</strong></p>
<blockquote>
<p>至三旬外，不但读书未售，而且家业渐销</p>
</blockquote>
<p><strong>【关键转折】</strong></p>
<ul>
<li>丙午运 → 克尽庚金之病</li>
<li>发财十余万 → 庚金为病明矣</li>
</ul>
<p><strong>【核心道理】</strong></p>
<blockquote>
<p>旺之极者，宜泄而不宜克，宜顺其气势，弗悖其性也</p>
</blockquote>
<hr>
<h4>7.5 命造五：福建人（昆仑之水）</h4>
<pre><code>乾：癸酉 甲子 癸亥 辛酉
     杀  印   比   枭

水旺逢金，其势冲奔
一点甲木枯浮，难泄水气
</code></pre>
<p><strong>【命局分析】</strong></p>
<table>
<thead>
<tr>
<th>分析要点</th>
<th>内容</th>
</tr>
</thead>
<tbody><tr>
<td>日主</td>
<td>癸水，生于子月（当令）</td>
</tr>
<tr>
<td>用神</td>
<td>辛金（印星）生水</td>
</tr>
<tr>
<td>忌神</td>
<td>无（但甲木泄水为小忌）</td>
</tr>
<tr>
<td>关键</td>
<td>水势冲奔，宜顺不宜逆</td>
</tr>
</tbody></table>
<p><strong>【格局判断】</strong></p>
<pre><code>癸水生子月，当令旺盛
辛金印星生水
甲木泄水（枯浮无用）
  ↓
水势冲奔 → 宜泄不宜克
顺其流 → 美
逆其流 → 凶
  ↓
初运癸亥 → 助旺神，荫庇有余
壬戌运 → 逆其势，刑耗并见
辛酉庚申 → 丁财并旺
己未戊午 → 逆性，半生事业尽付东流
</code></pre>
<p><strong>【任注断语】</strong></p>
<blockquote>
<p>此所谓&quot;昆仑之水，可顺而不可逆也&quot;。顺逆之机，不可不知也。</p>
</blockquote>
<p><strong>【核心道理】</strong></p>
<blockquote>
<p>昆仑之水，可顺而不可逆</p>
</blockquote>
<hr>
<h3>八、核心命理公式</h3>
<h4>公式一：知命总纲</h4>
<pre><code>知命 = 理会顺逆之机
  ↓
顺逆之机 = 论命之要
  ↓
顺者吉，逆者凶
</code></pre>
<h4>公式二：四句核心</h4>
<pre><code>用之为财不可劫
用之为官不可伤
用之印绶不可坏
用之食神不可夺
  ↓
关键在一&quot;用&quot;字
</code></pre>
<h4>公式三：旺极之命</h4>
<pre><code>旺之极者，宜泄不宜克
  ↓
顺其气势则吉
悖其性则凶
</code></pre>
<h4>公式四：水命顺逆</h4>
<pre><code>昆仑之水，可顺而不可逆
  ↓
顺其势则吉
逆其流则凶
</code></pre>
<hr>
<h2>🔥 第三部分：实战应用（高手层）</h2>
<h3>九、知命实战四步法</h3>
<pre><code>第一步：察日主衰旺
  → 日主得令否？得地否？得势否？

第二步：究顺悖之机
  → 日主喜忌为何？
  → 用神能否得用？
  → 忌神能否受制？

第三步：审进退之节
  → 旺者宜泄宜克？
  → 弱者宜生宜扶？

第四步：论喜忌之真
  → 不以财官为喜，不以伤杀为憎
  → 专论日主衰旺
</code></pre>
<hr>
<h2>🏆 第四部分：核心背诵</h2>
<h3>十、必须背诵的名句</h3>
<blockquote>
<p><strong>1.</strong> 要与人间开聋聩，顺逆之机须理会
→ 论命之要在于顺逆</p>
</blockquote>
<blockquote>
<p><strong>2.</strong> 用之为财不可劫，用之为官不可伤，用之印绶不可坏，用之食神不可夺
→ 四句核心</p>
</blockquote>
<blockquote>
<p><strong>3.</strong> 旺之极者，宜泄而不宜克，宜顺其气势，弗悖其性也
→ 旺极之命处理原则</p>
</blockquote>
<blockquote>
<p><strong>4.</strong> 昆仑之水，可顺而不可逆也。顺逆之机，不可不知也
→ 顺逆为论命之要</p>
</blockquote>
<hr>
<h2>✅ 第五部分：学习检验</h2>
<h3>十一、自测题</h3>
<table>
<thead>
<tr>
<th>题号</th>
<th>问题</th>
<th>参考答案</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>知命篇的核心是什么？</td>
<td>理会顺逆之机</td>
</tr>
<tr>
<td>2</td>
<td>&quot;用之为财不可劫&quot;的关键在哪？</td>
<td>在一&quot;用&quot;字，不用尽可劫</td>
</tr>
<tr>
<td>3</td>
<td>王姓命局的误判原因是什么？</td>
<td>误以庚金为用，不知庚金为病</td>
</tr>
<tr>
<td>4</td>
<td>&quot;昆仑之水&quot;命局的处理原则是什么？</td>
<td>顺其流则吉，逆其流则凶</td>
</tr>
<tr>
<td>5</td>
<td>五个命造的共同特点是什么？</td>
<td>皆以顺逆之机为论命关键</td>
</tr>
</tbody></table>
<hr>
<h2>📝 附：完整原文</h2>
<h3>原文一：开篇正文</h3>
<pre><code>要与人间开聋聩，顺逆之机须理会。
</code></pre>
<h3>原文二：【原注】</h3>
<pre><code>不知命者如聋聩，知命于顺逆之机而能理会之，庶可以开天下之聋聩。
</code></pre>
<h3>原文三：【任氏曰】核心</h3>
<pre><code>用之为财不可劫，用之为官不可伤，用之印绶不可坏，用之食神不可夺。
此四句原有至理，其要在一&quot;用&quot;字。
</code></pre>
<h3>原文四：命造五例</h3>
<ol>
<li>高宗纯皇帝：辛卯 丁酉 庚午 丙子</li>
<li>董中堂：庚申 庚辰 戊辰 戊午</li>
<li>己酉丙寅：辛酉 辛丑 己酉 丙寅</li>
<li>王姓：壬辰 壬寅 甲寅 庚午</li>
<li>福建人：癸酉 甲子 癸亥 辛酉</li>
</ol>
<hr>
<p><em>本解读由 Hermes Agent 自动生成于 2026-05-13</em></p>
`,理气:`<h1>《滴天髓》·理气篇·详细解读教程</h1>
<blockquote>
<p><strong>原著：</strong> 《滴天髓》上篇第五章·理气
<strong>注疏：</strong> 任铁樵（徐乐吾评注本）
<strong>正文：</strong> 理承气行岂有常，进兮退兮宜抑扬
<strong>本章字数：</strong> 1038字
<strong>完成日期：</strong> 2026-05-13
<strong>页面：</strong> <a href="https://www.iwzbz.com/artical/pcbook/v2/3_1_7_7.html">https://www.iwzbz.com/artical/pcbook/v2/3_1_7_7.html</a></p>
</blockquote>
<hr>
<h2>📖 第一部分：通读全貌（扫盲层）</h2>
<h3>一、本章地位</h3>
<pre><code>天道 → 天元 → 三元之宗
坤道 → 地支刚柔
人道 → 顺悖吉凶
知命 → 顺逆之机
  ↓
理气 → 进退之机 → 旺相休囚
</code></pre>
<p>理气篇是知命篇的延伸，核心论述<strong>理气进退之机</strong>，强调旺相休囚随四季变化。</p>
<h3>二、本章结构</h3>
<pre><code>┌─────────────────────────────────────────────────┐
│  ① 开篇正文（14字）                              │
│     理承气行岂有常，进兮退兮宜抑扬                │
│                                                 │
│  ② 【原注】                                     │
│     阖关往来皆是气，而理行乎其间……              │
│                                                 │
│  ③ 【任氏曰】进退之机                           │
│     将来者进，是谓相；进而当令，是谓旺……        │
│                                                 │
│  ④ 命造两例                                    │
│     丁亥庚戌甲辰壬申 vs 乙亥庚辰甲戌壬申        │
└─────────────────────────────────────────────────┘
</code></pre>
<hr>
<h2>📚 第二部分：逐层精解（专业层）</h2>
<h3>三、开篇正文解析</h3>
<blockquote>
<p><strong>原文：</strong> 理承气行岂有常，进兮退兮宜抑扬</p>
</blockquote>
<table>
<thead>
<tr>
<th>关键词</th>
<th>含义</th>
<th>命理指向</th>
</tr>
</thead>
<tbody><tr>
<td><strong>理承气行</strong></td>
<td>理随气行，气为理用</td>
<td>五行随气变化</td>
</tr>
<tr>
<td><strong>岂有常</strong></td>
<td>没有永恒不变</td>
<td>气行无常</td>
</tr>
<tr>
<td><strong>进退</strong></td>
<td>前进后退</td>
<td>旺相休囚的转化</td>
</tr>
<tr>
<td><strong>宜抑扬</strong></td>
<td>应当抑扬</td>
<td>进则抑，退则扬</td>
</tr>
</tbody></table>
<p><strong>【核心思想】</strong></p>
<ul>
<li>理随气行，气有进退</li>
<li>进退有常，抑扬适度</li>
</ul>
<hr>
<h3>四、【原注】详解</h3>
<blockquote>
<p>阖关往来皆是气，而理行乎其间。行之始而进，进之极则为退之机，如三月之甲木是也；行之盛而退，退之极则为进之机，如九月之甲木是也。</p>
</blockquote>
<p><strong>【逐句解读】</strong></p>
<table>
<thead>
<tr>
<th>关键词</th>
<th>命理含义</th>
</tr>
</thead>
<tbody><tr>
<td>阖关往来</td>
<td>气的开合往来</td>
</tr>
<tr>
<td>皆是气</td>
<td>万物皆由气构成</td>
</tr>
<tr>
<td>行之始而进</td>
<td>气开始运行则进</td>
</tr>
<tr>
<td>进之极则为退之机</td>
<td>进到极点则退</td>
</tr>
<tr>
<td>如三月之甲木</td>
<td>三月木气渐退</td>
</tr>
<tr>
<td>行之盛而退</td>
<td>气盛极则退</td>
</tr>
<tr>
<td>退之极则为进之机</td>
<td>退到极点则进</td>
</tr>
<tr>
<td>如九月之甲木</td>
<td>九月木气将进</td>
</tr>
</tbody></table>
<p><strong>【任注解读】</strong></p>
<ul>
<li>三月甲木 → 进之极，退之机</li>
<li>九月甲木 → 退之极，进之机</li>
</ul>
<hr>
<h3>五、【任氏曰】详解（核心）</h3>
<h4>5.1 进退之机</h4>
<blockquote>
<p>进退之机，不可不知也。非长生为旺，死绝为衰，必当审明理气之进退，庶得衰旺之真机矣。</p>
</blockquote>
<p><strong>【任注核心观点】</strong></p>
<pre><code>旺衰判断 ≠ 长生死绝
  ↓
关键在于理气进退
  ↓
得真机
</code></pre>
<h4>5.2 旺相休囚定义</h4>
<table>
<thead>
<tr>
<th>状态</th>
<th>定义</th>
<th>含义</th>
</tr>
</thead>
<tbody><tr>
<td><strong>相</strong></td>
<td>将来者进，是谓相</td>
<td>气将旺，未来之星</td>
</tr>
<tr>
<td><strong>旺</strong></td>
<td>进而当令，是谓旺</td>
<td>气正当时令</td>
</tr>
<tr>
<td><strong>休</strong></td>
<td>功成者退，是谓休</td>
<td>气功成而退</td>
</tr>
<tr>
<td><strong>囚</strong></td>
<td>退而无气，是谓囚</td>
<td>气退而无用</td>
</tr>
</tbody></table>
<p><strong>【图解】</strong></p>
<pre><code>四季五行循环：
  相 → 旺 → 休 → 囚 → 相
  ↓   ↓    ↓    ↓   ↓
未来 当令 功退 退无 再进
</code></pre>
<h4>5.3 日主与喜忌的旺相休囚</h4>
<table>
<thead>
<tr>
<th>类型</th>
<th>宜旺相</th>
<th>不宜休囚</th>
</tr>
</thead>
<tbody><tr>
<td><strong>日主</strong></td>
<td>宜旺相</td>
<td>不宜休囚</td>
</tr>
<tr>
<td><strong>喜神</strong></td>
<td>宜旺相</td>
<td>不宜休囚</td>
</tr>
<tr>
<td><strong>凶煞</strong></td>
<td>宜休囚</td>
<td>不宜旺相</td>
</tr>
<tr>
<td><strong>忌神</strong></td>
<td>宜休囚</td>
<td>不宜旺相</td>
</tr>
</tbody></table>
<h4>5.4 相与旺的区别</h4>
<blockquote>
<p>然相妙于旺，旺则极盛之物，其退反速；相则方长之气，其进无涯也。</p>
</blockquote>
<p><strong>【关键区别】</strong></p>
<table>
<thead>
<tr>
<th>状态</th>
<th>特点</th>
<th>结果</th>
</tr>
</thead>
<tbody><tr>
<td><strong>旺</strong></td>
<td>极盛之物</td>
<td>退反速（退得快）</td>
</tr>
<tr>
<td><strong>相</strong></td>
<td>方长之气</td>
<td>进无涯（进无穷）</td>
</tr>
</tbody></table>
<p><strong>【图解】</strong></p>
<pre><code>旺：极盛 → 将退 → 退速
相：方长 → 将旺 → 进无涯
</code></pre>
<h4>5.5 休与囚的区别</h4>
<blockquote>
<p>休甚乎囚，休则方退之气，未能遽复也；囚则既极之势，必将渐生。</p>
</blockquote>
<p><strong>【关键区别】</strong></p>
<table>
<thead>
<tr>
<th>状态</th>
<th>特点</th>
<th>结果</th>
</tr>
</thead>
<tbody><tr>
<td><strong>休</strong></td>
<td>方退之气</td>
<td>未速复（恢复慢）</td>
</tr>
<tr>
<td><strong>囚</strong></td>
<td>既极之势</td>
<td>渐将生（渐能复）</td>
</tr>
</tbody></table>
<p><strong>【图解】</strong></p>
<pre><code>休：方退 → 未速复
囚：极退 → 渐将生
</code></pre>
<hr>
<h3>六、两个命造实例详解</h3>
<h4>6.1 命造一：丁亥 庚戌 甲辰 壬申</h4>
<pre><code>乾：丁亥 庚戌 甲辰 壬申
     官  杀   印   印

大运：己酉 戊申 丁未 丙午 乙巳 甲辰 癸卯 壬寅

甲木休困已极，庚金禄旺克之
</code></pre>
<p><strong>【命局分析】</strong></p>
<table>
<thead>
<tr>
<th>分析要点</th>
<th>内容</th>
</tr>
</thead>
<tbody><tr>
<td>日主</td>
<td>甲木，生于戌月</td>
</tr>
<tr>
<td>问题</td>
<td>甲木休困极，庚金禄旺克</td>
</tr>
<tr>
<td>用神</td>
<td>丁火（食神）敌杀</td>
</tr>
<tr>
<td>忌神</td>
<td>庚金（七杀）当令</td>
</tr>
</tbody></table>
<p><strong>【关键判断】</strong></p>
<pre><code>甲木休困 → 非死绝，只是休
庚金当令 → 旺
丁火虽弱 → 通根身库
戌为燥土 → 火之本根
辰为湿土 → 木之余气
  ↓
天干一生一制
地支又遇长生
四柱生化有情
五行不争不妒
  ↓
至丁运科甲连登
一路南方运
用火敌杀明矣
</code></pre>
<p><strong>【任注断语】</strong></p>
<blockquote>
<p>至丁运科甲连登，用火敌杀明矣。虽久任京官，而宦资丰存，皆一路南方运也。</p>
</blockquote>
<hr>
<h4>6.2 命造二：乙亥 庚辰 甲戌 壬申</h4>
<pre><code>乾：乙亥 庚辰 甲戌 壬申
     官  杀   印   印

大运：己卯 戊寅 丁丑 丙子 乙亥 甲戌 癸酉 壬申

庚金进气，甲木退
</code></pre>
<p>**【命局分析】</p>
<table>
<thead>
<tr>
<th>分析要点</th>
<th>内容</th>
</tr>
</thead>
<tbody><tr>
<td>日主</td>
<td>甲木，生于辰月</td>
</tr>
<tr>
<td>问题</td>
<td>甲木退，庚金进气</td>
</tr>
<tr>
<td>用神</td>
<td>无力</td>
</tr>
<tr>
<td>关键</td>
<td>乙庚合而化金，助暴</td>
</tr>
</tbody></table>
<p>**【两造对比】</p>
<table>
<thead>
<tr>
<th>对比项</th>
<th>第一造</th>
<th>第二造</th>
</tr>
</thead>
<tbody><tr>
<td>日主</td>
<td>甲辰</td>
<td>甲戌</td>
</tr>
<tr>
<td>甲木状态</td>
<td>进气</td>
<td>退气</td>
</tr>
<tr>
<td>庚金状态</td>
<td>退气</td>
<td>进气</td>
</tr>
<tr>
<td>辰 vs 戌</td>
<td>湿土生木</td>
<td>燥土不生</td>
</tr>
<tr>
<td>结果</td>
<td>科甲连登</td>
<td>寒衿</td>
</tr>
</tbody></table>
<p><strong>【任注断语】</strong></p>
<blockquote>
<p>推此两造，天渊之隔，进退之机，不可不知也。</p>
</blockquote>
<p><strong>【核心区别】</strong></p>
<pre><code>第一造：辰湿土生木，申辰拱化
  → 甲木进气
  → 丁火为用
  → 贵

第二造：戌燥土不生，申戌生杀
  → 甲木退气
  → 乙庚化金助暴
  → 贱
</code></pre>
<hr>
<h3>七、核心命理公式</h3>
<h4>公式一：进退之机</h4>
<pre><code>进之极 → 退之机
退之极 → 进之机
  ↓
进退循环，无有常
</code></pre>
<h4>公式二：旺相休囚</h4>
<pre><code>相 = 将来者进（未来之星）
旺 = 进而当令（正当时令）
休 = 功成者退（功成退位）
囚 = 退而无气（退而无用）
</code></pre>
<h4>公式三：日主喜忌</h4>
<pre><code>日主/喜神 → 宜旺相，不宜休囚
凶煞/忌神 → 宜休囚，不宜旺相
</code></pre>
<h4>公式四：进退断事</h4>
<pre><code>旺极之物 → 退反速
相方长之气 → 进无涯
</code></pre>
<hr>
<h2>🔥 第三部分：实战应用</h2>
<h3>八、理气实战四步法</h3>
<pre><code>第一步：审月令节气
  → 确定五行旺相休囚
  → 判断日主是否当令

第二步：明进退之机
  → 是否进气？退气？
  → 进极则退，退极则进

第三步：论日主宜忌
  → 日主宜旺相
  → 喜神宜旺相
  → 忌神宜休囚

第四步：察天干地支
  → 生克制化是否得宜
  → 进退之机是否把握
</code></pre>
<hr>
<h2>🏆 第四部分：核心背诵</h2>
<h3>九、必须背诵的名句</h3>
<blockquote>
<p><strong>1.</strong> 理承气行岂有常，进兮退兮宜抑扬
→ 进退有常，抑扬适度</p>
</blockquote>
<blockquote>
<p><strong>2.</strong> 将来者进，是谓相；进而当令，是谓旺；功成者退，是谓休；退而无气，是谓囚
→ 旺相休囚定义</p>
</blockquote>
<blockquote>
<p><strong>3.</strong> 相妙于旺，旺则极盛之物，其退反速；相则方长之气，其进无涯也
→ 相与旺的区别</p>
</blockquote>
<blockquote>
<p><strong>4.</strong> 进退之机，不可不知也
→ 进退是论命关键</p>
</blockquote>
<hr>
<h2>✅ 第五部分：学习检验</h2>
<h3>十、自测题</h3>
<table>
<thead>
<tr>
<th>题号</th>
<th>问题</th>
<th>参考答案</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>旺相休囚的定义是什么？</td>
<td>相=将来进，旺=当令，休=功退，囚=退无气</td>
</tr>
<tr>
<td>2</td>
<td>相与旺的本质区别是什么？</td>
<td>相=进无涯，旺=退反速</td>
</tr>
<tr>
<td>3</td>
<td>两造天渊之隔的原因是什么？</td>
<td>甲木进气vs退气，辰湿土vs戌燥土</td>
</tr>
<tr>
<td>4</td>
<td>&quot;进退之机&quot;在论命中的意义？</td>
<td>得衰旺真机</td>
</tr>
<tr>
<td>5</td>
<td>第一造为何贵？</td>
<td>甲木进气，丁火为用，南方运发</td>
</tr>
</tbody></table>
<hr>
<h2>📝 附：完整原文</h2>
<h3>原文一：开篇正文</h3>
<pre><code>理承气行岂有常，进兮退兮宜抑扬。
</code></pre>
<h3>原文二：【原注】</h3>
<pre><code>阖关往来皆是气，而理行乎其间。
行之始而进，进之极则为退之机，如三月之甲木是也；
行之盛而退，退之极则为进之机，如九月之甲木是也。
</code></pre>
<h3>原文三：【任氏曰】</h3>
<pre><code>进退之机，不可不知也。
非长生为旺，死绝为衰，必当审明理气之进退，庶得衰旺之真机矣。

凡五行旺相休囚，按四季而定之。
将来者进，是谓相；进而当令，是谓旺；
功成者退，是谓休；退而无气，是谓囚。

须辨其旺相休囚，以知其进退之机。
为日主，为喜神，宜旺相，不宜休囚；
为凶煞，为忌神，宜休囚，不宜旺相。
然相妙于旺，旺则极盛之物，其退反速；
相则方长之气，其进无涯也。
休甚乎囚，休则方退之气，未能遽复也；
囚则既极之势，必将渐生也。
</code></pre>
<h3>原文四：两造对比</h3>
<table>
<thead>
<tr>
<th>项目</th>
<th>第一造</th>
<th>第二造</th>
</tr>
</thead>
<tbody><tr>
<td>四柱</td>
<td>丁亥 庚戌 甲辰 壬申</td>
<td>乙亥 庚辰 甲戌 壬申</td>
</tr>
<tr>
<td>甲木</td>
<td>进气</td>
<td>退气</td>
</tr>
<tr>
<td>结果</td>
<td>科甲连登</td>
<td>寒衿</td>
</tr>
</tbody></table>
<hr>
<p><em>本解读由 Hermes Agent 自动生成于 2026-05-13</em></p>
`,配合:`<h1>《滴天髓》·配合篇·详细解读教程</h1>
<blockquote>
<p><strong>原著：</strong> 《滴天髓》上篇第六章·配合
<strong>注疏：</strong> 任铁樵（徐乐吾评注本）
<strong>正文：</strong> 配合干支仔细详，定人福祸与灾祥
<strong>本章字数：</strong> 1119字
<strong>完成日期：</strong> 2026-05-13
<strong>页面：</strong> <a href="https://www.iwzbz.com/artical/pcbook/v2/3_1_7_8.html">https://www.iwzbz.com/artical/pcbook/v2/3_1_7_8.html</a></p>
</blockquote>
<hr>
<h2>📖 第一部分：通读全貌（扫盲层）</h2>
<h3>一、本章地位</h3>
<pre><code>天道 → 天元三元之宗
坤道 → 地支刚柔
人道 → 顺悖吉凶
知命 → 顺逆之机
理气 → 旺相休囚进退
  ↓
配合篇 → 干支配合定祸福
</code></pre>
<p>配合篇是&quot;通神论&quot;前六章的总结，核心论述<strong>干支配合为论命之要</strong>。</p>
<h3>二、本章结构</h3>
<pre><code>┌─────────────────────────────────────────────────┐
│  ① 开篇正文（14字）                              │
│     配合干支仔细详，定人福祸与灾祥                │
│                                                 │
│  ② 【原注】                                     │
│     天干地支，相为配合，仔细推详其进退之机……    │
│                                                 │
│  ③ 【任氏曰】批判谬说                           │
│     辟谬之要领，专从奇格异局神杀者皆非           │
│                                                 │
│  ④ 两造对比                                    │
│     三奇拱贵（实庸碌）vs 一无可取（实甲第）      │
└─────────────────────────────────────────────────┘
</code></pre>
<hr>
<h2>📚 第二部分：逐层精解（专业层）</h2>
<h3>三、开篇正文解析</h3>
<blockquote>
<p><strong>原文：</strong> 配合干支仔细详，定人福祸与灾祥</p>
</blockquote>
<table>
<thead>
<tr>
<th>关键词</th>
<th>含义</th>
<th>命理指向</th>
</tr>
</thead>
<tbody><tr>
<td><strong>配合</strong></td>
<td>天干地支相互配合</td>
<td>干支非孤立</td>
</tr>
<tr>
<td><strong>仔细详</strong></td>
<td>仔细推详</td>
<td>非粗略论断</td>
</tr>
<tr>
<td><strong>福祸灾祥</strong></td>
<td>吉凶祸福</td>
<td>干支配合定吉凶</td>
</tr>
</tbody></table>
<hr>
<h3>四、【原注】详解</h3>
<blockquote>
<p>天干地支，相为配合，仔细推详其进退之机，则可以断人之祸福灾祥矣。</p>
</blockquote>
<p><strong>【核心思想】</strong></p>
<ul>
<li>干支相为配合</li>
<li>推详进退之机</li>
<li>断祸福灾祥</li>
</ul>
<hr>
<h3>五、【任氏曰】详解（核心）</h3>
<h4>5.1 本章性质</h4>
<blockquote>
<p>此章乃辟谬之要领也。</p>
</blockquote>
<p><strong>【任注点明】</strong></p>
<ul>
<li>配合篇 = 辟谬之要领</li>
<li>批判专从奇格异局神杀论命</li>
</ul>
<h4>5.2 正论：配合干支之法</h4>
<blockquote>
<p>配合干支，必须正理搜寻详推，与衰旺喜忌之理，不可将四柱干支弗论，专从奇格、异局、神杀等类妄谈，以致祸福无凭，吉凶不验。</p>
</blockquote>
<p><strong>【批判对象】</strong></p>
<table>
<thead>
<tr>
<th>谬说</th>
<th>任注观点</th>
</tr>
</thead>
<tbody><tr>
<td>奇格异局</td>
<td>祸福无凭</td>
</tr>
<tr>
<td>神杀纳音</td>
<td>吉凶不验</td>
</tr>
<tr>
<td>不论干支</td>
<td>非正理</td>
</tr>
</tbody></table>
<h4>5.3 正理：只存用神</h4>
<blockquote>
<p>命中至理，只存用神，不拘财、官、印绶、比劫、食伤、枭杀，皆可为用，勿以名之美者为佳，恶者为憎。</p>
</blockquote>
<p><strong>【核心观点】</strong></p>
<pre><code>只存用神，不拘名之美恶
  ↓
财官印绶 → 可为用
比劫食伤 → 可为用
枭杀七杀 → 可为用
  ↓
不以名为美恶
  ↓
以衰旺喜忌为断
</code></pre>
<h4>5.4 方法：当抑则抑，当扶则扶</h4>
<blockquote>
<p>果能审日主之衰旺，用神之喜忌，当抑则抑，当扶则扶，所谓去留舒配，取裁确当，则运途否泰，显然明白，祸福灾祥，无不验矣。</p>
</blockquote>
<p><strong>【配合之法】</strong></p>
<pre><code>审日主衰旺
  ↓
明用神喜忌
  ↓
当抑则抑（抑忌神）
当扶则扶（扶用神）
  ↓
去留舒配
取裁确当
  ↓
运途否泰显然明白
</code></pre>
<hr>
<h3>六、两造实例详解</h3>
<h4>6.1 命造一：三奇拱贵（实庸碌）</h4>
<pre><code>乾：甲子 戊辰 庚申 壬午
     印  食  比  官

大运：己巳 庚午 辛未 壬申 癸酉 甲戌 乙亥 丙子

干透三奇之美，支逢拱贵之荣
</code></pre>
<p><strong>【俗论】</strong></p>
<table>
<thead>
<tr>
<th>谬论</th>
<th>错误原因</th>
</tr>
</thead>
<tbody><tr>
<td>干透三奇</td>
<td>非真三奇</td>
</tr>
<tr>
<td>支逢拱贵</td>
<td>非真拱贵</td>
</tr>
<tr>
<td>会局不冲</td>
<td>冲破会局</td>
</tr>
<tr>
<td>官星得用</td>
<td>官星必伤</td>
</tr>
</tbody></table>
<p><strong>【命局分析】</strong></p>
<table>
<thead>
<tr>
<th>分析要点</th>
<th>内容</th>
</tr>
</thead>
<tbody><tr>
<td>日主</td>
<td>庚金，生于辰月</td>
</tr>
<tr>
<td>问题</td>
<td>支会水局，坎增势，离失威</td>
</tr>
<tr>
<td>用神</td>
<td>官星（午火）被伤</td>
</tr>
<tr>
<td>问题</td>
<td>戊土枭神夺食</td>
</tr>
</tbody></table>
<p><strong>【关键判断】</strong></p>
<pre><code>庚申生于季春 → 水本休囚
支会水局 → 坎增势，离失威
官星午火 → 必伤，不足为用
  ↓
欲用壬水（强众敌寡）
三奇透戊 → 枭神夺食
  ↓
欲用甲木（疏土卫水）
甲木退气，戊土当权 → 难以疏通
  ↓
甲木是假神
不过庸碌之人
</code></pre>
<p><strong>【任注断语】</strong></p>
<blockquote>
<p>以三奇拱贵等格论命，而不看用神者，皆虚谬耳。</p>
</blockquote>
<hr>
<h4>6.2 命造二：一无可取（实甲第）</h4>
<pre><code>乾：丙子 己亥 乙丑 壬午
     印  财  官  印

大运：庚子 辛丑 壬寅 癸卯 甲辰 乙巳 丙午 丁未

初看：一无可取
细推：甲第中人
</code></pre>
<p><strong>【命局分析】</strong></p>
<table>
<thead>
<tr>
<th>分析要点</th>
<th>内容</th>
</tr>
</thead>
<tbody><tr>
<td>日主</td>
<td>乙木，生于亥月</td>
</tr>
<tr>
<td>初看问题</td>
<td>壬丙一克，子午遥冲</td>
</tr>
<tr>
<td>实际问题</td>
<td>水势泛滥，火气克绝</td>
</tr>
</tbody></table>
<p><strong>【关键判断：五行分析】</strong></p>
<pre><code>水势虽旺 → 喜无金
火本休囚 → 喜有土卫（儿能救母）
壬水生乙木 → 相生有情
丙火生己土 → 各立门户，相生有情
  ↓
天干壬丙一克 → 但无争克之意
地支子午冲 → 己土原神透出，通根禄旺
  ↓
水势足以止水卫火
有病得药
</code></pre>
<p><strong>【用神判断】</strong></p>
<pre><code>天干壬水生乙木 → 有情
丙火生己土 → 各立门户，相生有情
地支虽北方 → 己土卫火，有病得药
一阳后万物怀胎 → 木火进气
  ↓
以伤官秀气为用
伤官 = 亥月木之余气
</code></pre>
<p><strong>【任注断语】</strong></p>
<blockquote>
<p>中年运走东南，用神生旺，必是甲第中人。交寅，火生木旺，运登甲榜，入翰苑，是以青云直上。</p>
</blockquote>
<p><strong>【两造对比】</strong></p>
<table>
<thead>
<tr>
<th>对比项</th>
<th>第一造</th>
<th>第二造</th>
</tr>
</thead>
<tbody><tr>
<td>俗论</td>
<td>三奇拱贵，名利双收</td>
<td>一无可取，名利无成</td>
</tr>
<tr>
<td>正论</td>
<td>官星被伤，假神庸碌</td>
<td>有病得药，青云直上</td>
</tr>
<tr>
<td>关键</td>
<td>干支配合失当</td>
<td>干支配合有情</td>
</tr>
</tbody></table>
<hr>
<h3>七、核心命理公式</h3>
<h4>公式一：配合总纲</h4>
<pre><code>配合干支仔细详
  ↓
审日主衰旺
明用神喜忌
  ↓
当抑则抑，当扶则扶
去留舒配，取裁确当
</code></pre>
<h4>公式二：用神不拘名</h4>
<pre><code>用神不拘财官印绶比劫食伤枭杀
  ↓
皆可为用
勿以名之美者为佳，恶者为憎
</code></pre>
<h4>公式三：祸福判定</h4>
<pre><code>配合有情 → 福
配合无情 → 祸
配合失当 → 灾祥
</code></pre>
<hr>
<h2>🔥 第三部分：实战应用</h2>
<h3>八、配合实战四步法</h3>
<pre><code>第一步：审日主衰旺
  → 日主得令否？得地否？得势否？

第二步：明用神喜忌
  → 何神为用？何神为忌？
  → 用神是否有力？

第三步：论干支配合
  → 天干是否相生有情？
  → 地支是否互相护卫？
  → 忌神是否受制？

第四步：断祸福灾祥
  → 用神得位则福
  → 忌神猖狂则祸
  → 配合失当则灾祥
</code></pre>
<hr>
<h2>🏆 第四部分：核心背诵</h2>
<h3>九、必须背诵的名句</h3>
<blockquote>
<p><strong>1.</strong> 配合干支仔细详，定人福祸与灾祥
→ 配合为论命之要</p>
</blockquote>
<blockquote>
<p><strong>2.</strong> 命中至理，只存用神，不拘财、官、印绶、比劫、食伤、枭杀，皆可为用
→ 用神不拘名</p>
</blockquote>
<blockquote>
<p><strong>3.</strong> 勿以名之美者为佳，恶者为憎
→ 不以名为美恶</p>
</blockquote>
<blockquote>
<p><strong>4.</strong> 当抑则抑，当扶则扶，所谓去留舒配，取裁确当
→ 配合之法</p>
</blockquote>
<hr>
<h2>✅ 第五部分：学习检验</h2>
<h3>十、自测题</h3>
<table>
<thead>
<tr>
<th>题号</th>
<th>问题</th>
<th>参考答案</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>配合篇的核心是什么？</td>
<td>干支配合为论命之要</td>
</tr>
<tr>
<td>2</td>
<td>&quot;只存用神&quot;为何不论名之美恶？</td>
<td>用神不拘财官印绶食伤枭杀</td>
</tr>
<tr>
<td>3</td>
<td>第一造为何庸碌？</td>
<td>官星被伤，甲木假神</td>
</tr>
<tr>
<td>4</td>
<td>第二造为何贵？</td>
<td>有病得药，伤官秀气</td>
</tr>
<tr>
<td>5</td>
<td>&quot;有病得药&quot;指什么？</td>
<td>己土止水卫火，有病有药</td>
</tr>
</tbody></table>
<hr>
<h2>📝 附：完整原文</h2>
<h3>原文一：开篇正文</h3>
<pre><code>配合干支仔细详，定人福祸与灾祥。
</code></pre>
<h3>原文二：【原注】</h3>
<pre><code>天干地支，相为配合，仔细推详其进退之机，则可以断人之祸福灾祥矣。
</code></pre>
<h3>原文三：【任氏曰】核心</h3>
<pre><code>命中至理，只存用神，不拘财、官、印绶、比劫、食伤、枭杀，皆可为用，
勿以名之美者为佳，恶者为憎。
果能审日主之衰旺，用神之喜忌，当抑则抑，当扶则扶，
所谓去留舒配，取裁确当，则运途否泰，显然明白，祸福灾祥，无不验矣。
</code></pre>
<h3>原文四：两造</h3>
<table>
<thead>
<tr>
<th>四柱</th>
<th>俗论</th>
<th>正论</th>
</tr>
</thead>
<tbody><tr>
<td>甲子 戊辰 庚申 壬午</td>
<td>三奇拱贵</td>
<td>假神庸碌</td>
</tr>
<tr>
<td>丙子 己亥 乙丑 壬午</td>
<td>一无可取</td>
<td>有病得药</td>
</tr>
</tbody></table>
<hr>
<p><em>本解读由 Hermes Agent 自动生成于 2026-05-13</em></p>
`,天干:`<h1>《滴天髓》·天干篇·详细解读教程</h1>
<blockquote>
<p><strong>原著：</strong> 《滴天髓》上篇第七章·天干
<strong>注疏：</strong> 任铁樵（徐乐吾评注本）
<strong>字数：</strong> 约 5,363 字（配合篇的 5 倍）
<strong>页面：</strong> <a href="https://www.iwzbz.com/artical/pcbook/v2/3_1_7_9.html">https://www.iwzbz.com/artical/pcbook/v2/3_1_7_9.html</a>
<strong>完成日期：</strong> 2026-05-13</p>
</blockquote>
<hr>
<h2>📖 第一部分：通读全貌</h2>
<h3>一、本章在全书中的地位</h3>
<pre><code>天道 → 天元三元之宗          → 天干之根
坤道 → 地支刚柔              → 地支之根
人道 → 顺悖吉凶              → 中和之道
知命 → 顺逆之机              → 用神之法
理气 → 旺相休囚              → 衰旺之理
配合 → 干支配合              → 祸福之源
  ↓
天干 → 十干性情专论          → 【本篇核心】
</code></pre>
<p>天干篇是《滴天髓》中<strong>体量最大</strong>的章节之一，十干各具性情，任铁樵逐干详注，是全书最重要的基础理论篇章。</p>
<h3>二、本章结构总览</h3>
<pre><code>┌──────────────────────────────────────────────┐
│  ① 序论（开篇二句）                           │
│     五阳皆阳丙为最，五阴皆阴癸为至            │
│                                              │
│  ② 总论一：十干性情批判                       │
│     丙癸化水化火、阳刚阴柔                   │
│     任注批判世俗拟象之谬                      │
│                                              │
│  ③ 总论二：五阳从气、五阴从势                │
│     五阳刚健不畏财杀                         │
│     五阴柔顺见势忘义                         │
│     任注辨阳中之阴、阴中之阳                 │
│                                              │
│  ④ 甲木论                                     │
│  ⑤ 乙木论                                     │
│  ⑥ 丙火论                                     │
│  ⑦ 丁火论                                     │
│  ⑧ 戊土论                                     │
│  ⑨ 己土论                                     │
│  ⑩ 庚金论                                     │
│  ⑪ 辛金论                                     │
│  ⑫ 壬水论                                     │
│  ⑬ 癸水论                                     │
│     （十干各具原注+任注）                    │
└──────────────────────────────────────────────┘
</code></pre>
<hr>
<h2>📚 第二部分：逐层精解</h2>
<hr>
<h3>三、序论精解：丙最癸至</h3>
<blockquote>
<p><strong>原注：</strong> 甲、丙、戊、庚、壬为阳，独丙火秉阳之精，而为阳中之阳；乙、丁、己、辛、癸为阴，独癸水秉阴之精，而为阴中之阴。</p>
</blockquote>
<h4>3.1 阴阳十干分类</h4>
<table>
<thead>
<tr>
<th>类别</th>
<th>天干</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>五阳干</td>
<td>甲、丙、戊、庚、壬</td>
<td>阳刚健动</td>
</tr>
<tr>
<td>五阴干</td>
<td>乙、丁、己、辛、癸</td>
<td>阴柔顺静</td>
</tr>
</tbody></table>
<h4>3.2 丙癸为最</h4>
<table>
<thead>
<tr>
<th>天干</th>
<th>任注定性</th>
<th>核心特性</th>
</tr>
</thead>
<tbody><tr>
<td><strong>丙火</strong></td>
<td>阳中之阳</td>
<td>纯阳之精，万物莫不由此而发</td>
</tr>
<tr>
<td><strong>癸水</strong></td>
<td>阴中之阴</td>
<td>纯阴之精，万物莫不由此而生</td>
</tr>
</tbody></table>
<h4>3.3 阴阳相济</h4>
<pre><code>丙辛化水 → 阳极阴生（丙火+辛金 → 水）
戊癸化火 → 阴极阳生（戊土+癸水 → 火）
↓         ↓
阴阳相济，万物生生之妙
</code></pre>
<hr>
<h3>四、总论一：十干性情批判</h3>
<h4>4.1 任注核心观点</h4>
<blockquote>
<p>甲乙一木也，丙丁一火也，戊己一土也，庚辛一金也，壬癸一水也，即分别所用，不过阳刚阴柔，阳健阴顺而已。</p>
</blockquote>
<p><strong>【任注批判的世俗谬说】</strong></p>
<table>
<thead>
<tr>
<th>谬说</th>
<th>任注批语</th>
</tr>
</thead>
<tbody><tr>
<td>甲木为梁栋，乙木为花果</td>
<td>比拟失伦</td>
</tr>
<tr>
<td>丙作太阳，丁作灯烛</td>
<td>失伦</td>
</tr>
<tr>
<td>戊作城墙，己作田园</td>
<td>失伦</td>
</tr>
<tr>
<td>庚为顽铁，辛作珠玉</td>
<td>失伦</td>
</tr>
<tr>
<td>壬为江河，癸为雨露</td>
<td>失伦</td>
</tr>
</tbody></table>
<h4>4.2 两大具体谬误批驳</h4>
<p><strong>谬误一：死木活木之分</strong></p>
<pre><code>世俗：甲木为无根死木，乙木为有根活木

任注批：
  同是木而分生死
  岂阳木独禀死气，阴木独禀生气乎？
  ↓
  阳木≠死木，阴木≠活木
  生死应从配合判断，非从天干阴阳属性
</code></pre>
<p><strong>谬误二：活木畏水，死木不畏水</strong></p>
<pre><code>世俗：活木畏水泛，死木不畏水泛

任注批：
  岂活木遇水且漂，而枯槎遇水反定乎？
  ↓
  活木遇水未必漂（得地得用则不畏）
  枯木遇水未必定（朽木逢水反溃）
  ↓
  关键看配合，不在死活之名
</code></pre>
<p><strong>任注结论：</strong></p>
<blockquote>
<p>论断诸干，如此之类，不一而足，当尽避之，以绝将来之谬。</p>
</blockquote>
<hr>
<h3>五、总论二：五阳从气、五阴从势</h3>
<h4>5.1 原注原文</h4>
<blockquote>
<p>五阳得阳之气，即能成乎阳刚之势，不畏财杀之势；五阴得阴之气，即能成乎阴顺之义，故木盛则从木，火盛则从火，土盛则从土，金盛则从金，水盛则从水。于情义之所在者，见其势衰，则忌之矣，盖妇人之情也。</p>
</blockquote>
<h4>5.2 原文关键解读</h4>
<pre><code>五阳从气：
  气 → 阳刚之气
  不畏财杀之势
  解释：五阳干得阳刚之气，有独立之性，不易随从

五阴从势：
  势 → 阴柔之势
  木盛从木，火盛从火，水盛从水
  见势衰则忌 → 如妇人见势利
  ↓
  五阴干从势无情义
</code></pre>
<h4>5.3 任注详论：阳刚阴顺之辨</h4>
<table>
<thead>
<tr>
<th>维度</th>
<th>五阳干</th>
<th>五阴干</th>
</tr>
</thead>
<tbody><tr>
<td><strong>本性</strong></td>
<td>刚健</td>
<td>柔顺</td>
</tr>
<tr>
<td><strong>处世</strong></td>
<td>不苟且</td>
<td>骄谄</td>
</tr>
<tr>
<td><strong>内心</strong></td>
<td>有恻隐之心</td>
<td>有鄙吝之心</td>
</tr>
<tr>
<td><strong>行为</strong></td>
<td>不畏财杀</td>
<td>见势忘义</td>
</tr>
<tr>
<td><strong>结果</strong></td>
<td>刚不能制克柔</td>
<td>柔能克制刚</td>
</tr>
</tbody></table>
<h4>5.4 任注：阳中之阴、阴中之阳</h4>
<table>
<thead>
<tr>
<th>类型</th>
<th>外表</th>
<th>内心</th>
<th>命理含义</th>
</tr>
</thead>
<tbody><tr>
<td><strong>阳中之阴</strong></td>
<td>外仁义</td>
<td>内奸诈</td>
<td>伪君子</td>
</tr>
<tr>
<td><strong>阴中之阳</strong></td>
<td>外凶险</td>
<td>内仁慈</td>
<td>真豪杰</td>
</tr>
<tr>
<td><strong>阳外阴内</strong></td>
<td>外阳</td>
<td>内阴</td>
<td>包藏祸心</td>
</tr>
<tr>
<td><strong>阴外阳内</strong></td>
<td>外阴</td>
<td>内阳</td>
<td>秉持直道</td>
</tr>
</tbody></table>
<h4>5.5 任注结论</h4>
<blockquote>
<p>要在气势顺正，四柱五行停匀，庶不偏倚，自无损人利己之心。</p>
</blockquote>
<hr>
<h3>六、十干专论·详解</h3>
<hr>
<h4>6.1 甲木</h4>
<blockquote>
<p><strong>原文：</strong> 甲木参天，脱胎要火。春不容金，秋不容土。火炽乘龙，水宕骑虎。地润天和，植立千古。</p>
</blockquote>
<p><strong>【原注要义】</strong></p>
<table>
<thead>
<tr>
<th>句</th>
<th>原注</th>
<th>任注展开</th>
</tr>
</thead>
<tbody><tr>
<td>甲木参天</td>
<td>纯阳之木，参天雄壮</td>
<td>体本坚固，极雄壮</td>
</tr>
<tr>
<td>脱胎要火</td>
<td>木嫩气寒，得火而发荣</td>
<td>强木得火，方化其顽</td>
</tr>
<tr>
<td>春不容金</td>
<td>旺木得火而愈敷荣，欺金不能容金</td>
<td>衰金克旺木，木坚金缺</td>
</tr>
<tr>
<td>秋不容土</td>
<td>枝叶凋落，根气收敛下达，受克者土</td>
<td>秋土虚薄，不能培木，反遭倾陷</td>
</tr>
<tr>
<td>火炽乘龙</td>
<td>寅午戌多见而坐辰</td>
<td>辰为水库，湿土生木泄火</td>
</tr>
<tr>
<td>水宕骑虎</td>
<td>申子辰多见而坐寅</td>
<td>寅为火土生地，能纳水气</td>
</tr>
<tr>
<td>地润天和</td>
<td>土不干，水不消</td>
<td>非植立千古而得长生</td>
</tr>
</tbody></table>
<p><strong>【任注核心解读】</strong></p>
<pre><code>甲木生于春：
  春初 → 木嫩气寒 → 得火发荣（要火）
  仲春 → 旺极之势 → 宜泄菁英（强木得火，方化其顽）

甲木与金：
  春金休囚 → 以衰金克旺木 → 木坚金缺
  势所必然 → 故&quot;春不容金&quot;

甲木与土：
  秋土虚薄 → 生金泄气
  虚气之土遇下攻之木 → 倾陷
  故&quot;秋不容土&quot;

甲木与火：
  丙丁多见（炽）→ 木被焚
  宜坐辰（水库）→ 乘龙
  湿土能生木泄火

甲木与水：
  壬癸多见（宕）→ 木浮
  宜坐寅（木禄旺）→ 骑虎
  能纳水气，不致浮泛
</code></pre>
<p><strong>【配合要点速记】</strong></p>
<pre><code>甲木四时配：
  春 → 要火（发荣），不容金（克旺）
  夏 → 强木得火方化顽
  秋 → 不容土（虚薄倾陷），根气收敛
  冬 → 水润则生（但非乘龙骑虎之时）
</code></pre>
<hr>
<h4>6.2 乙木</h4>
<blockquote>
<p><strong>原文：</strong> 乙木虽柔，刲羊解牛。怀丁抱丙，跨凤乘猴。虚湿之地，骑马亦忧。藤萝系甲，可春可秋。</p>
</blockquote>
<p><strong>【原注要义】</strong></p>
<table>
<thead>
<tr>
<th>句</th>
<th>原注</th>
<th>任注展开</th>
</tr>
</thead>
<tbody><tr>
<td>刲羊解牛</td>
<td>生于丑未月，坐丑未土，可制柔土</td>
<td>丑乃湿土可以受气，未乃木库得以蟠根</td>
</tr>
<tr>
<td>怀丁抱丙</td>
<td>生申酉月，有丙丁透出天干</td>
<td>有水不相争克，制化得宜</td>
</tr>
<tr>
<td>跨凤乘猴</td>
<td>申酉月，得丙丁，不畏金强</td>
<td>凤=酉，猴=申</td>
</tr>
<tr>
<td>虚湿之地，骑马亦忧</td>
<td>生亥子月，无丙丁，又无燥土</td>
<td>午难发生</td>
</tr>
<tr>
<td>藤萝系甲</td>
<td>甲寅多见，藤萝附乔木</td>
<td>藤萝系松柏，春秋皆可</td>
</tr>
</tbody></table>
<p><strong>【任注核心解读】</strong></p>
<pre><code>乙木为甲之质，承甲之生气

乙木四季配：
  春如桃李 → 金克则凋 → 宜火
  夏如禾稼 → 水滋得生 → 宜水润燥
  秋如桐桂 → 金旺火制 → 宜火克金
  冬如奇葩 → 火湿土培 → 宜火土

刲羊解牛：
  丑未月 → 土柔 → 乙木可制
  坐丑 → 湿土受气
  坐未 → 木库蟠根

虚湿之地：
  亥子月 → 水旺
  无丙丁 → 无火发荣
  无燥土 → 无力培根
  坐午 → 亦难发生

藤萝系甲：
  天干透甲，地支藏寅
  鸢萝系松柏 → 附甲而生
  春得助，秋得扶 → 可春可秋
</code></pre>
<p><strong>【甲乙之辨（任注精华）】</strong></p>
<pre><code>甲木 → 参天雄壮之木（阳）
乙木 → 甲之质，承甲之生气（阴）

本质区别：
  甲木是独立之木，参天之象
  乙木是依附之木，藤萝之性

但：
  乙木非弱者
  得丙丁 → 不畏金
  有甲寅 → 可春可秋
  丑未坐 → 可刲羊解牛
  ↓
  乙木之柔，非懦弱之柔
  乃能柔克刚、以弱胜强之柔
</code></pre>
<hr>
<h4>6.3 丙火</h4>
<blockquote>
<p><strong>原文：</strong> 丙火猛烈，欺霜侮雪。能煅庚金，逢辛反怯。土众成慈，水猖显节。虎马犬乡，甲木若来，必当焚灭。</p>
</blockquote>
<p><strong>【原注要义】</strong></p>
<table>
<thead>
<tr>
<th>句</th>
<th>原注</th>
<th>任注展开</th>
</tr>
</thead>
<tbody><tr>
<td>欺霜侮雪</td>
<td>不畏秋而欺霜，不畏冬而晦雪</td>
<td>有除寒解冻之功</td>
</tr>
<tr>
<td>能煅庚金</td>
<td>庚金虽顽，力能煅之</td>
<td>遇强暴而施克伐</td>
</tr>
<tr>
<td>逢辛反怯</td>
<td>辛金本柔，合而反弱</td>
<td>合柔顺而寓和平</td>
</tr>
<tr>
<td>土众成慈</td>
<td>土为丙火之子，见戊己多成慈爱之德</td>
<td>不凌下</td>
</tr>
<tr>
<td>水猖显节</td>
<td>水为丙火之君，遇壬癸旺显忠节之风</td>
<td>不援上</td>
</tr>
<tr>
<td>虎马犬乡</td>
<td>支坐寅午戌，露甲木则燥而焚灭</td>
<td>甲来成灭</td>
</tr>
</tbody></table>
<p><strong>【任注核心解读】</strong></p>
<pre><code>丙火为纯阳之火，其势猛烈

丙火之用：
  欺霜侮雪 → 除寒解冻
  能煅庚金 → 克伐强暴
  逢辛反怯 → 合柔顺

丙火与土：
  己土 → 卑湿之体，能收元阳之气 ✓
  戊土 → 高燥，见丙火而焦坼 ✗
  ↓
  土众成慈 → 己土（湿土）
  非戊土（燥土）

丙火与水：
  壬水 → 刚中之德，能制暴烈之火 ✓
  癸水 → 阴柔，逢丙火而涸干 ✗
  ↓
  水猖显节 → 壬水（刚水）

丙火与辛：
  丙辛相合 → 化水
  合柔顺而寓和平 → 丙不逞烈
  ↓
  逢辛反怯 → 非怯战，乃和平

丙火与甲木（虎马犬乡）：
  寅午戌 → 火势已过于猛烈
  再见甲木来生 → 焚灭
  ↓
  泄威须用己土
  遏焰须用壬水
  顺性须用辛金
</code></pre>
<hr>
<h4>6.4 丁火</h4>
<blockquote>
<p><strong>原文：</strong> 丁火柔中，内性昭融。抱乙而孝，合壬而忠。旺而不烈，衰而不穷，如有嫡母，可秋可冬。</p>
</blockquote>
<p><strong>【原注要义】</strong></p>
<table>
<thead>
<tr>
<th>句</th>
<th>原注</th>
<th>任注展开</th>
</tr>
</thead>
<tbody><tr>
<td>柔中</td>
<td>丁干属阴，火性虽阴，柔而得其中</td>
<td>非灯烛之谓，较丙火则柔中</td>
</tr>
<tr>
<td>昭融</td>
<td>外柔顺而内文明</td>
<td>内性昭融，文明之象</td>
</tr>
<tr>
<td>抱乙而孝</td>
<td>乙畏辛而辛抱之，不若乙抱丁而反能晦丁火</td>
<td>明使辛金不伤乙木</td>
</tr>
<tr>
<td>合壬而忠</td>
<td>壬畏戊而丁合之，外抚恤戊土，内暗化木神</td>
<td>暗使戊土不敢抗壬</td>
</tr>
<tr>
<td>可秋可冬</td>
<td>生于秋冬，得一甲木则倚之不灭</td>
<td>干透甲乙，秋生不畏金</td>
</tr>
</tbody></table>
<p><strong>【任注核心解读】</strong></p>
<pre><code>丁火：柔中，内性昭融

丁与丙之别：
  丙 → 纯阳猛烈
  丁 → 柔中文明
  ↓
  丁非灯烛之谓
  丁是文明之火

丁火抱乙（孝）：
  乙木为丁火之母（丁生戊，乙生丁？）
  乙畏辛金克
  丁能护乙 → 使辛金不伤乙木
  ↓
  丁为乙报仇 → 孝

丁火合壬（忠）：
  壬水为丁火之君
  壬畏戊土克
  丁合壬 → 暗化木神
  使戊土不敢抗壬
  ↓
  丁为壬制戊 → 忠

丁火特性：
  旺而不烈 → 赫炎亦有度
  衰而不穷 → 熄灭有节
  ↓
  嫡母（甲木）可倚
  可秋可冬
</code></pre>
<p><strong>【丁丙对比】</strong></p>
<table>
<thead>
<tr>
<th>特性</th>
<th>丙火</th>
<th>丁火</th>
</tr>
</thead>
<tbody><tr>
<td>阴阳</td>
<td>阳中之阳</td>
<td>阴中带阳</td>
</tr>
<tr>
<td>性</td>
<td>猛烈</td>
<td>柔中</td>
</tr>
<tr>
<td>文明</td>
<td>外烈</td>
<td>内文明</td>
</tr>
<tr>
<td>克金</td>
<td>煅庚（刚克）</td>
<td>护乙（护卫）</td>
</tr>
<tr>
<td>合壬</td>
<td>逢辛反怯</td>
<td>合壬而忠</td>
</tr>
<tr>
<td>遇甲</td>
<td>遇甲则焚（丙）</td>
<td>倚甲不灭（丁）</td>
</tr>
</tbody></table>
<hr>
<h4>6.5 戊土</h4>
<blockquote>
<p><strong>原文：</strong> 戊土固重，既中且正。静翕动辟，万物司命。水润物生，火燥物病。若在艮坤，怕冲宜静。</p>
</blockquote>
<p><strong>【原注要义】</strong></p>
<table>
<thead>
<tr>
<th>句</th>
<th>原注</th>
<th>任注展开</th>
</tr>
</thead>
<tbody><tr>
<td>固重</td>
<td>非城墙堤岸之谓，较己特高厚刚燥</td>
<td>阳土高厚，体固质重</td>
</tr>
<tr>
<td>既中且正</td>
<td>得乎中气而且正大</td>
<td>居中得正</td>
</tr>
<tr>
<td>静翕动辟</td>
<td>春夏气辟生万物，秋冬气翕成万物</td>
<td>动则发生，静则收藏</td>
</tr>
<tr>
<td>万物司命</td>
<td>为万物之司命</td>
<td>生长收藏皆赖土</td>
</tr>
<tr>
<td>水润物生</td>
<td>火旺宜水润之</td>
<td>燥则物枯</td>
</tr>
<tr>
<td>火燥物病</td>
<td>水多宜火暖之</td>
<td>湿则物病</td>
</tr>
<tr>
<td>艮坤</td>
<td>寅申之月，怕冲宜静</td>
<td>冲则根动</td>
</tr>
</tbody></table>
<p><strong>【任注核心解读】</strong></p>
<pre><code>戊土：阳土，体固质重

戊土之性：
  静翕 → 秋冬收藏
  动辟 → 春夏发生
  ↓
  静动随令，万物司命

戊土与水：
  春夏火旺 → 宜水润
  润则发生，燥则枯
  ↓
  水润物生

戊土与火：
  秋冬水多 → 宜火暖
  暖则化成，湿则病
  ↓
  火燥物病

戊土与寅申：
  艮 = 寅，坤 = 申
  坐寅怕申，冲则根动
  坐申怕寅，冲则根动
  ↓
  怕冲宜静
</code></pre>
<hr>
<h4>6.6 己土</h4>
<blockquote>
<p><strong>原文：</strong> 己土柔软，卑以自居。得印而成，财多身弱。为丙而不为Sep。务不妨嫌。丁生於酉，丙丁济合，隔位不遇。</p>
</blockquote>
<p><strong>【任注核心解读】</strong></p>
<pre><code>己土：阴土，体卑性湿

己土之性：
  卑以自居 → 不自高
  卑湿之体 → 能收元阳

己土与丙火：
  丙火煅庚 → 用戊土则焦坼
  丙火煅庚 → 用己土则收元阳
  ↓
  己土为丙火之配
  非为丙而不为Sep

己土与丁火：
  丁火抱乙而孝
  丁生于酉 → 酉为金
  丙丁济合 → 隔位不遇
  ↓
  丁不伤酉金

己土与戊土之辨：
  戊土 → 高厚刚燥，司命
  己土 → 卑湿柔软，滋生
  ↓
  戊土动辟，己土静翕
  戊土阳，己土阴
</code></pre>
<hr>
<h4>6.7 庚金</h4>
<blockquote>
<p><strong>原文：</strong> 庚金带煞，刚健为最。得水而清，得火而锐。土润则生，土干则脆。能赢甲兄，输于乙妹。</p>
</blockquote>
<p><strong>【原注要义】</strong></p>
<table>
<thead>
<tr>
<th>句</th>
<th>原注</th>
<th>任注展开</th>
</tr>
</thead>
<tbody><tr>
<td>刚健为最</td>
<td>庚金乃天上之太白，带杀而刚健</td>
<td>肃杀之气，刚健最</td>
</tr>
<tr>
<td>得水而清</td>
<td>壬水发生，引通刚杀之性</td>
<td>淬厉晶莹</td>
</tr>
<tr>
<td>得火而锐</td>
<td>丁火阴柔，良冶销熔</td>
<td>洪炉锻炼，时露锋砧</td>
</tr>
<tr>
<td>土润则生</td>
<td>丑辰湿土能生</td>
<td>生于春夏气弱，遇湿土则生</td>
</tr>
<tr>
<td>土干则脆</td>
<td>未戌燥土则脆</td>
<td>逢燥土则脆</td>
</tr>
<tr>
<td>能赢甲兄</td>
<td>甲木虽强，力足伐之</td>
<td>甲木正敌</td>
</tr>
<tr>
<td>输于乙妹</td>
<td>乙木虽柔，合而反弱</td>
<td>乙非尽合庚而助暴</td>
</tr>
</tbody></table>
<p><strong>【任注核心解读】</strong></p>
<pre><code>庚金：肃杀之气，刚健为最

庚金得水：
  壬水 → 发生，引通刚杀之性
  淬厉晶莹
  ↓
  得水而清

庚金得火：
  丁火 → 阴柔，不与庚为敌
  良冶销熔 → 洪炉锻炼
  时露锋砧
  ↓
  得火而锐

庚金与土：
  丑辰（湿土）→ 生
  未戌（燥土）→ 脆
  ↓
  土润则生，土干则脆

庚金与甲乙：
  甲木 → 正敌，力足伐之
  乙木 → 合而反弱（乙非尽合庚助暴）
  ↓
  能赢甲兄，输于乙妹
</code></pre>
<hr>
<h4>6.8 辛金</h4>
<blockquote>
<p><strong>原文：</strong> 辛金软弱，温润而清。畏土之叠，乐水之盈。能扶社稷，能救生灵。热则喜母，寒则喜丁。</p>
</blockquote>
<p><strong>【原注要义】</strong></p>
<table>
<thead>
<tr>
<th>句</th>
<th>原注</th>
<th>任注展开</th>
</tr>
</thead>
<tbody><tr>
<td>温润而清</td>
<td>凡温软清润者皆辛金</td>
<td>人间五金之质，清润可观</td>
</tr>
<tr>
<td>畏土之叠</td>
<td>戊己土多而能埋</td>
<td>戊土太重，涸水埋金</td>
</tr>
<tr>
<td>乐水之盈</td>
<td>壬癸水多而必秀</td>
<td>壬水有余，润土养金</td>
</tr>
<tr>
<td>能扶社稷</td>
<td>辛为丙之臣，合丙化水</td>
<td>安扶社稷</td>
</tr>
<tr>
<td>能救生灵</td>
<td>辛为甲之君，合丙化水</td>
<td>救援生灵</td>
</tr>
<tr>
<td>热则喜母</td>
<td>生于夏而得己土</td>
<td>晦火存金</td>
</tr>
<tr>
<td>寒则喜丁</td>
<td>生于冬而得丁火</td>
<td>敌寒养金</td>
</tr>
</tbody></table>
<p><strong>【任注核心解读】</strong></p>
<pre><code>辛金：人间五金之质，温润而清

辛金畏土：
  戊己土多 → 涸水埋金
  土太重 → 埋辛
  ↓
  畏土之叠

辛金乐水：
  壬癸水多 → 润土养金
  水有余 → 清润
  ↓
  乐水之盈

辛金与丙火（扶社稷）：
  辛为丙之臣
  合丙 → 化水
  使丙火不生戊土（反相助）
  ↓
  扶社稷

辛金与甲木（救生灵）：
  辛为甲之君
  合丙 → 化水
  使丙火不焚甲木（反有相生）
  ↓
  救生灵

辛金之喜：
  热（夏）→ 喜己土（晦火存金）
  寒（冬）→ 喜丁火（温水养金）
</code></pre>
<hr>
<h4>6.9 壬水</h4>
<blockquote>
<p><strong>原文：</strong> 壬水通河，能泄金气，刚中之德，周流不滞。通根透癸，冲天奔地。化则有情，从则相济。</p>
</blockquote>
<p><strong>【原注要义】</strong></p>
<table>
<thead>
<tr>
<th>句</th>
<th>原注</th>
<th>任注展开</th>
</tr>
</thead>
<tbody><tr>
<td>通河</td>
<td>壬水即癸水之发源，天河也</td>
<td>长生在申，申为天关</td>
</tr>
<tr>
<td>泄金气</td>
<td>壬水生此，能泄西方肃杀气</td>
<td>刚中之德</td>
</tr>
<tr>
<td>周流不滞</td>
<td>百川之源，易进而难退</td>
<td>冲进不滞</td>
</tr>
<tr>
<td>通根透癸</td>
<td>申子辰全又透癸</td>
<td>势冲奔，不可遏</td>
</tr>
<tr>
<td>化则有情</td>
<td>合丁化木，生丁火</td>
<td>有情</td>
</tr>
<tr>
<td>从则相济</td>
<td>生于火土旺地，从火土</td>
<td>相济</td>
</tr>
</tbody></table>
<p><strong>【任注核心解读】</strong></p>
<pre><code>壬水：阳水，天河之水

壬水之性：
  长生在申 → 天河之口
  泄西方金气 → 刚中之德
  周流不滞 → 易进难退

壬水泛滥：
  申子辰全 → 又透癸
  势冲奔 → 不可遏
  戊己土亦不能止
  必须用木泄之，顺其气势

壬水化火：
  合丁 → 化木
  生丁火 → 不息之妙
  化则有情

壬水从势：
  生四五六月 → 火土并旺
  火旺透干 → 从火
  土旺透干 → 从土
  调和润泽 → 相济
</code></pre>
<hr>
<h4>6.10 癸水</h4>
<blockquote>
<p><strong>原文：</strong> 癸水至弱，达于天津。得龙而运，功化斯神。不愁火土，不论庚辛。合戊见火，化象斯真。</p>
</blockquote>
<p><strong>【原注要义】</strong></p>
<table>
<thead>
<tr>
<th>句</th>
<th>原注</th>
<th>任注展开</th>
</tr>
</thead>
<tbody><tr>
<td>至弱</td>
<td>癸水乃阴之纯而至弱</td>
<td>扶桑有弱水</td>
</tr>
<tr>
<td>达于天津</td>
<td>得龙以成云雨</td>
<td>逢龙即化</td>
</tr>
<tr>
<td>功化斯神</td>
<td>运水气，生木制火</td>
<td>润土养金</td>
</tr>
<tr>
<td>不愁火土</td>
<td>至弱之性，见火土多即从化</td>
<td>不畏</td>
</tr>
<tr>
<td>不论庚辛</td>
<td>弱水不能泄金气</td>
<td>金多反浊癸水</td>
</tr>
<tr>
<td>合戊见火</td>
<td>阴极阳生，戊土燥厚</td>
<td>丙丁透，化火真</td>
</tr>
</tbody></table>
<p><strong>【任注核心解读】</strong></p>
<pre><code>癸水：纯阴之水，至弱

癸水之性：
  发源虽长 → 其性极弱
  其势最静 → 能润土养金
  得龙而运 → 变化不测

癸水逢龙化：
  龙 = 辰
  逢龙即化 → 化辰之原神发露
  十干逢辰位必透化神

癸水不畏：
  火土多 → 从化（不愁）
  庚辛多 → 不忌（金多反浊）
  ↓
  至弱之性，见强即从

癸水合戊化火：
  戊生寅，癸生卯
  皆属东方 → 生火
  阴极阳生
  ↓
  戊癸得丙丁透者
  不论衰旺，秋冬皆能化火
  最为真也

注意：若秋冬金水旺地
  纵使支遇辰龙，干透丙丁
  亦难从化
</code></pre>
<hr>
<h2>📊 第三部分：十干对比总表</h2>
<h3>十干核心特性对比</h3>
<table>
<thead>
<tr>
<th>天干</th>
<th>性质</th>
<th>核心用神</th>
<th>春</th>
<th>夏</th>
<th>秋</th>
<th>冬</th>
<th>最大特点</th>
</tr>
</thead>
<tbody><tr>
<td><strong>甲木</strong></td>
<td>阳</td>
<td>火（泄秀）</td>
<td>要火</td>
<td>化顽</td>
<td>不容土</td>
<td>乘龙骑虎</td>
<td>参天雄壮</td>
</tr>
<tr>
<td><strong>乙木</strong></td>
<td>阴</td>
<td>丙丁甲</td>
<td>宜火</td>
<td>宜水</td>
<td>宜火</td>
<td>宜火土</td>
<td>藤萝系甲</td>
</tr>
<tr>
<td><strong>丙火</strong></td>
<td>阳</td>
<td>壬己辛</td>
<td>壬水</td>
<td>己土</td>
<td>辛金</td>
<td>壬水</td>
<td>欺霜侮雪</td>
</tr>
<tr>
<td><strong>丁火</strong></td>
<td>阴</td>
<td>甲壬</td>
<td>嫡母甲</td>
<td>宜水</td>
<td>宜甲</td>
<td>宜甲</td>
<td>柔中昭融</td>
</tr>
<tr>
<td><strong>戊土</strong></td>
<td>阳</td>
<td>水丙</td>
<td>水润</td>
<td>水润</td>
<td>火暖</td>
<td>火暖</td>
<td>万物司命</td>
</tr>
<tr>
<td><strong>己土</strong></td>
<td>阴</td>
<td>丙火</td>
<td>丙火</td>
<td>水滋</td>
<td>丙火</td>
<td>丙火</td>
<td>滋生万物</td>
</tr>
<tr>
<td><strong>庚金</strong></td>
<td>阳</td>
<td>丁壬水</td>
<td>湿土生</td>
<td>湿土生</td>
<td>丁火锐</td>
<td>湿土生</td>
<td>刚健带煞</td>
</tr>
<tr>
<td><strong>辛金</strong></td>
<td>阴</td>
<td>壬水丁</td>
<td>水盈</td>
<td>己土晦</td>
<td>水盈</td>
<td>丁火温</td>
<td>温润而清</td>
</tr>
<tr>
<td><strong>壬水</strong></td>
<td>阳</td>
<td>木泄辛</td>
<td>木泄</td>
<td>木泄</td>
<td>木泄</td>
<td>木泄</td>
<td>通河周流</td>
</tr>
<tr>
<td><strong>癸水</strong></td>
<td>阴</td>
<td>丙火辛</td>
<td>丙火</td>
<td>丙火</td>
<td>丙丁化</td>
<td>丙丁化</td>
<td>至弱从化</td>
</tr>
</tbody></table>
<hr>
<h2>🔥 第四部分：实战应用</h2>
<h3>十干取用歌诀</h3>
<pre><code>甲木：强木得火方化顽，春不容金秋不土
      火炽乘龙水宕虎，地润天和植千古

乙木：乙柔刲羊解牛，怀丁抱丙跨凤猴
      虚湿骑马亦忧，藤萝系甲可春可秋

丙火：丙火猛烈欺霜雪，能煅庚金逢辛怯
      土众成慈水显节，虎马犬乡甲焚灭

丁火：丁火柔中昭融，抱乙合壬孝忠
      旺不烈衰不穷，嫡母可秋可冬

戊土：戊土固重中正，静翕动辟司命
      水润生火燥病，艮坤怕冲宜静

庚金：庚金带煞刚健最，得水清得火锐
      土润生干则脆，能赢甲兄输乙妹

辛金：辛金软弱温润清，畏土叠乐水盈
      能扶社稷救生灵，热喜母寒喜丁

壬水：壬水通河泄金气，刚中周流不滞
      通根透癸冲奔地，化则有情从相济

癸水：癸水至弱达天津，得龙运化斯神
      不愁火土不论庚辛，合戊见火化象真
</code></pre>
<hr>
<h2>🏆 第五部分：必须背诵名句</h2>
<table>
<thead>
<tr>
<th>#</th>
<th>名句</th>
<th>含义</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>五阳皆阳丙为最，五阴皆阴癸为至</td>
<td>丙为阳中之阳，癸为阴中之阴</td>
</tr>
<tr>
<td>2</td>
<td>阳刚阴柔，阳健阴顺而已</td>
<td>十干分别，不过刚柔健顺</td>
</tr>
<tr>
<td>3</td>
<td>当尽避之，以绝将来之谬</td>
<td>世俗拟象之论当避</td>
</tr>
<tr>
<td>4</td>
<td>五阳从气不从势，五阴从势无情义</td>
<td>五阳刚健不随势，五阴柔顺见利忘义</td>
</tr>
<tr>
<td>5</td>
<td>甲木参天，脱胎要火</td>
<td>甲木参天雄壮，生春要火发荣</td>
</tr>
<tr>
<td>6</td>
<td>春不容金，秋不容土</td>
<td>春木旺金衰，秋木衰土虚</td>
</tr>
<tr>
<td>7</td>
<td>乙木虽柔，刲羊解牛</td>
<td>乙木虽柔，可制丑未柔土</td>
</tr>
<tr>
<td>8</td>
<td>藤萝系甲，可春可秋</td>
<td>乙木附甲，四季皆可</td>
</tr>
<tr>
<td>9</td>
<td>丙火猛烈，欺霜侮雪</td>
<td>丙火纯阳，有除寒解冻之功</td>
</tr>
<tr>
<td>10</td>
<td>泄其威须用己土，遏其焰须用壬水</td>
<td>丙火配己土、壬水为最佳</td>
</tr>
<tr>
<td>11</td>
<td>丁火柔中，内性昭融</td>
<td>丁火柔中文明</td>
</tr>
<tr>
<td>12</td>
<td>抱乙而孝，合壬而忠</td>
<td>丁护乙木、丁合壬水</td>
</tr>
<tr>
<td>13</td>
<td>戊土固重，既中且正</td>
<td>戊土阳刚，体固中正</td>
</tr>
<tr>
<td>14</td>
<td>万物司命</td>
<td>戊土为万物之司命</td>
</tr>
<tr>
<td>15</td>
<td>庚金带煞，刚健为最</td>
<td>庚金肃杀，刚健第一</td>
</tr>
<tr>
<td>16</td>
<td>得水而清，得火而锐</td>
<td>庚金配壬则清、配丁则锐</td>
</tr>
<tr>
<td>17</td>
<td>辛金软弱，温润而清</td>
<td>辛金柔弱，清润可观</td>
</tr>
<tr>
<td>18</td>
<td>能扶社稷，能救生灵</td>
<td>辛合金水，有扶救之功</td>
</tr>
<tr>
<td>19</td>
<td>壬水通河，周流不滞</td>
<td>壬水天河，周流刚中</td>
</tr>
<tr>
<td>20</td>
<td>癸水至弱，达于天津</td>
<td>癸水纯阴至弱，变化不测</td>
</tr>
</tbody></table>
<hr>
<h2>✅ 第六部分：学习检验</h2>
<h3>自测题（20题）</h3>
<table>
<thead>
<tr>
<th>#</th>
<th>问题</th>
<th>参考答案</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>何为&quot;阳中之阳&quot;？</td>
<td>丙火秉阳之精</td>
</tr>
<tr>
<td>2</td>
<td>何为&quot;阴中之阴&quot;？</td>
<td>癸水秉阴之精</td>
</tr>
<tr>
<td>3</td>
<td>丙辛化何？戊癸化何？</td>
<td>丙辛化水，戊癸化火</td>
</tr>
<tr>
<td>4</td>
<td>世俗以甲木为什么？任注批为何谬？</td>
<td>梁栋；比拟失伦</td>
</tr>
<tr>
<td>5</td>
<td>甲木春不容金，为何？</td>
<td>衰金克旺木，木坚金缺</td>
</tr>
<tr>
<td>6</td>
<td>甲木秋不容土，为何？</td>
<td>秋土虚薄，不能培木</td>
</tr>
<tr>
<td>7</td>
<td>&quot;火炽乘龙&quot;何意？</td>
<td>火炽（寅午戌）宜坐辰水库</td>
</tr>
<tr>
<td>8</td>
<td>&quot;水宕骑虎&quot;何意？</td>
<td>水泛（申子辰）宜坐寅木禄</td>
</tr>
<tr>
<td>9</td>
<td>乙木&quot;刲羊解牛&quot;何意？</td>
<td>丑未月可制柔土，蟠根受气</td>
</tr>
<tr>
<td>10</td>
<td>&quot;藤萝系甲&quot;何意？</td>
<td>天干透甲，地支藏寅，附甲而生</td>
</tr>
<tr>
<td>11</td>
<td>泄丙火之威用什么？遏丙火之焰用什么？</td>
<td>己土收元阳，壬水制暴烈</td>
</tr>
<tr>
<td>12</td>
<td>丁火&quot;抱乙而孝&quot;何意？</td>
<td>丁护乙木，使辛金不伤乙</td>
</tr>
<tr>
<td>13</td>
<td>丁火&quot;合壬而忠&quot;何意？</td>
<td>丁合壬，暗化木神，制戊护壬</td>
</tr>
<tr>
<td>14</td>
<td>戊土&quot;万物司命&quot;何意？</td>
<td>春夏动辟生万物，秋冬静翕成万物</td>
</tr>
<tr>
<td>15</td>
<td>庚金得水为何清？得火为何锐？</td>
<td>壬水引通刚杀性，淬厉晶莹；丁火良冶销熔</td>
</tr>
<tr>
<td>16</td>
<td>辛金畏土叠、乐水盈，为何？</td>
<td>土重涸水埋金，水余润土养金</td>
</tr>
<tr>
<td>17</td>
<td>壬水逢何势冲奔？用什么治？</td>
<td>申子辰全透癸；用木泄之</td>
</tr>
<tr>
<td>18</td>
<td>癸水逢龙化，何为&quot;龙&quot;？</td>
<td>辰为龙，逢辰必透化神</td>
</tr>
<tr>
<td>19</td>
<td>戊癸何条件下化火最真？</td>
<td>丙丁透，秋冬皆能化</td>
</tr>
<tr>
<td>20</td>
<td>乙木与甲木的本质区别？</td>
<td>甲为参天雄壮之木，乙为承甲生气之藤萝</td>
</tr>
</tbody></table>
<hr>
<h2>📋 附：完整原文</h2>
<h3>原文一：序论</h3>
<pre><code>五阳皆阳丙为最，五阴皆阴癸为至。

【原注】甲、丙、戊、庚、壬为阳，独丙火秉阳之精，而为阳中之阳；
乙、丁、己、辛、癸为阴，独癸水秉阴之精，而为阴中之阴。

【任氏曰】丙乃纯阳之火，万物莫不由此而发，得此而敛；
癸乃纯阴之水，万物莫不由此而生，得此而茂。
阳极则阴生，故丙辛化水；阴极则阳生，故戊癸化火。
阴阳相济，万物有生生之妙。
</code></pre>
<h3>原文二：十干批判</h3>
<pre><code>夫十干之气，以先天言之，固一原同出，以后天言之，亦一气相包。
甲乙一木也，丙丁一火也，戊己一土也，庚辛一金也，壬癸一水也，
即分别所用，不过阳刚阴柔，阳健阴顺而已。

窃怪命家作歌为赋，比拟失伦，竟以甲木为梁栋，乙木为花果；
丙作太阳，丁作灯烛；戊作城墙，己作田园；
庚为顽铁，辛作珠玉；壬为江河，癸为雨露。
相沿已久，牢不可破，用之论命，诚大谬也。
</code></pre>
<h3>原文三：五阳从气，五阴从势</h3>
<pre><code>五阳从气不从势，五阴从势无情义。

【原注】五阳得阳之气，即能成乎阳刚之势，不畏财杀之势；
五阴得阴之气，即能成乎阴顺之义，故木盛则从木，火盛则从火，
土盛则从土，金盛则从金，水盛则从水。
于情义之所在者，见其势衰，则忌之矣，盖妇人之情也。

【任氏曰】五阳气避，光亨之象易观；五阴气翕，包含之蕴难测。
五阳之性刚健，故不畏财煞，而有测隐之心，其处世不苟且；
五阴之性柔顺，故见势忘义，而有鄙吝之心，其处世多骄谄。
是以柔能克制刚，刚不能制克柔也。
</code></pre>
<hr>
<p><em>本教程由 Hermes Agent 生成于 2026-05-13</em></p>
`,地支:`<h1>《滴天髓》·地支篇深度解读教程</h1>
<h2>由浅入深·专业级三阶学习体系</h2>
<hr>
<h2>教程概述与学习路径</h2>
<p>本教程基于《滴天髓》上篇第八章&quot;地支篇&quot;，以任铁樵注疏为骨架，融合沈孝瞻《子平真诠》与徐乐吾补注，采&quot;由浅入深&quot;三阶结构：<strong>第一阶（概念入门）</strong> 建立地支阴阳五行的基本框架，<strong>第二阶（理论深化）</strong> 打通冲合生旺的内在机理，<strong>第三阶（命造实战）</strong> 以任注六造为案例完成从理论到断命的闭环。</p>
<p><strong>前置知识：</strong> 阅读天道篇（理解天干为用）、人道篇（理解中和为贵），对阴阳、五行、十干有基础认知后再学本篇效果更佳。</p>
<hr>
<h2>第一阶段：概念入门——地支基础三要素</h2>
<h3>1.1 章节导读：为什么地支&quot;动且强&quot;与&quot;静且专&quot;是命理第一义？</h3>
<p>《滴天髓》开篇即分天人地道，天道论天干，地道论地支。人道论日元用神，天地合论干支配合——这是全书的三层结构。本篇专论地支，是子平命学的根基。</p>
<p><strong>原文第一句（任注&quot;提纲&quot;）：</strong></p>
<blockquote>
<p><strong>阳支动且强，速达显灾祥；阴支静且专，否泰每经年。</strong></p>
</blockquote>
<p>这句话是整篇的&quot;眼&quot;，任铁樵称之为&quot;提纲&quot;——提纲挈领，一言而决地支定性。阳支是子丑寅卯辰巳六支，阴支是午未申酉戌亥六支。分阴阳的理由不在于地支本身有意志，而在于<strong>气与质的差异</strong>：</p>
<table>
<thead>
<tr>
<th>类别</th>
<th>支数</th>
<th>根本特性</th>
<th>命理含义</th>
</tr>
</thead>
<tbody><tr>
<td>阳支</td>
<td>6支（子丑寅卯辰巳）</td>
<td><strong>动且强</strong></td>
<td>气化流行，变化快；吉凶速达</td>
</tr>
<tr>
<td>阴支</td>
<td>6支（午未申酉戌亥）</td>
<td><strong>静且专</strong></td>
<td>质凝形聚，变化慢；否泰经年乃见</td>
</tr>
</tbody></table>
<p><strong>为什么&quot;阳动阴静&quot;？</strong> 任注从气化学说出发：阳为气，阴为质。气主动，质主静。气过则动，质过则滞。这不是比喻，而是有严格对应的五行数理支撑——木火为阳气之伸，金水为阴质之凝（详见源流篇河图生成之数）。</p>
<blockquote>
<p>**实践要点：**拿到一个命局，先看四柱地支中有多少阳支、多少阴支。阳支多者，其人人生波动大、变故骤来；阴支多者，其人沉稳渐进、祸福迟发。这一定性断法，是地支分析的起点。</p>
</blockquote>
<h3>1.2 阴阳支分列详表与记忆法</h3>
<p><strong>阳支六支详解：</strong></p>
<table>
<thead>
<tr>
<th>地支</th>
<th>五行</th>
<th>藏干（本气/中气/余气）</th>
<th>阳性特征</th>
<th>速应表现</th>
</tr>
</thead>
<tbody><tr>
<td><strong>子</strong></td>
<td>水</td>
<td>癸（正官本气）</td>
<td>阳中含阴，动而速达</td>
<td>冲子运年即应事</td>
</tr>
<tr>
<td><strong>丑</strong></td>
<td>土</td>
<td>己癸癸（财官印）</td>
<td>阴寒湿土，含金水之闭</td>
<td>迟缓，须冲开方动</td>
</tr>
<tr>
<td><strong>寅</strong></td>
<td>木</td>
<td>甲丙戊（禄旺印）</td>
<td>阳木，生火之方</td>
<td>冲寅则生方动，速变</td>
</tr>
<tr>
<td><strong>卯</strong></td>
<td>木</td>
<td>乙（正财本气）</td>
<td>阴木，柔而速</td>
<td>冲卯则动，变故即来</td>
</tr>
<tr>
<td><strong>辰</strong></td>
<td>土</td>
<td>戊乙癸（湿土）</td>
<td>阳土水库，生方之一</td>
<td>冲辰则动，水土交激</td>
</tr>
<tr>
<td><strong>巳</strong></td>
<td>火</td>
<td>丙庚戊（禄财杀）</td>
<td>阴火，含金之凝</td>
<td>冲巳则动，变化明显</td>
</tr>
</tbody></table>
<p><strong>阴支六支详解：</strong></p>
<table>
<thead>
<tr>
<th>地支</th>
<th>五行</th>
<th>藏干（本气/中气/余气）</th>
<th>阴性特征</th>
<th>缓应表现</th>
</tr>
</thead>
<tbody><tr>
<td><strong>午</strong></td>
<td>火</td>
<td>丁己（伤官印）</td>
<td>阳火，帝旺之气</td>
<td>否泰经年方见</td>
</tr>
<tr>
<td><strong>未</strong></td>
<td>土</td>
<td>己丁乙（财伤印）</td>
<td>干土，含火之燥</td>
<td>燥土喜润，迟应</td>
</tr>
<tr>
<td><strong>申</strong></td>
<td>金</td>
<td>庚壬戊（禄食杀）</td>
<td>阳金，旺方之始</td>
<td>冲申则旺方动，迟</td>
</tr>
<tr>
<td><strong>酉</strong></td>
<td>金</td>
<td>辛（正财本气）</td>
<td>阴金，质凝</td>
<td>冲酉则动，须积渐</td>
</tr>
<tr>
<td><strong>戌</strong></td>
<td>土</td>
<td>戊辛丁（燥土）</td>
<td>阳土，燥土金库</td>
<td>冲戌则动，迟缓</td>
</tr>
<tr>
<td><strong>亥</strong></td>
<td>水</td>
<td>壬甲（禄食）</td>
<td>阴水，生木之方</td>
<td>冲亥则生方动，迟</td>
</tr>
</tbody></table>
<p><strong>记忆口诀（一分钟记住）：</strong></p>
<blockquote>
<p>阳支：子丑寅卯辰巳——&quot;子丑演变成辰巳（皆动）&quot;
阴支：午未申酉戌亥——&quot;午后申酉戌亥（皆静）&quot;
或者更简单：<strong>前半六支为阳，后半六支为阴</strong>（子丑寅卯辰巳→午未申酉戌亥）</p>
</blockquote>
<h3>1.3 藏干主次规则：为什么本气为重？</h3>
<p>地支藏干是子平命学最难掌握的基础之一，但任注给出了清晰的优先级原则：</p>
<blockquote>
<p><strong>本气为重。中气得时令可用，余气非当令不足为用。</strong></p>
</blockquote>
<p><strong>三层藏干速查表（以月令为标准）：</strong></p>
<table>
<thead>
<tr>
<th>地支</th>
<th>本气（最重要）</th>
<th>中气（次要）</th>
<th>余气（最次）</th>
</tr>
</thead>
<tbody><tr>
<td>子</td>
<td>癸（正官）</td>
<td>—</td>
<td>—</td>
</tr>
<tr>
<td>丑</td>
<td>己（正财）</td>
<td>癸（正印）</td>
<td>辛（偏印）</td>
</tr>
<tr>
<td>寅</td>
<td>甲（比肩）</td>
<td>丙（偏印）</td>
<td>戊（正财）</td>
</tr>
<tr>
<td>卯</td>
<td>乙（正财）</td>
<td>—</td>
<td>—</td>
</tr>
<tr>
<td>辰</td>
<td>戊（正官）</td>
<td>乙（偏财）</td>
<td>癸（正印）</td>
</tr>
<tr>
<td>巳</td>
<td>丙（偏印）</td>
<td>庚（偏官）</td>
<td>戊（正财）</td>
</tr>
<tr>
<td>午</td>
<td>丁（伤官）</td>
<td>己（正印）</td>
<td>—</td>
</tr>
<tr>
<td>未</td>
<td>己（正财）</td>
<td>丁（伤官）</td>
<td>乙（偏印）</td>
</tr>
<tr>
<td>申</td>
<td>庚（比肩）</td>
<td>壬（偏印）</td>
<td>戊（偏财）</td>
</tr>
<tr>
<td>酉</td>
<td>辛（正官）</td>
<td>—</td>
<td>—</td>
</tr>
<tr>
<td>戌</td>
<td>戊（正官）</td>
<td>辛（正印）</td>
<td>丁（伤官）</td>
</tr>
<tr>
<td>亥</td>
<td>壬（偏印）</td>
<td>甲（劫财）</td>
<td>—</td>
</tr>
</tbody></table>
<p><strong>藏干分析三步法：</strong></p>
<pre><code>第一步：找本气——本气是否透干？（透干则本气为用，最有力）
第二步：看中气——中气是否当令？（当令则中气可用）
第三步：看余气——余气非当令不足为用（除非全局无他气可取）
</code></pre>
<p><strong>任注特别警示：</strong>
任铁樵批评世俗命家&quot;不论本气&quot;，见到地支就数藏干，混为一谈。他说：&quot;本气为重（中气得时令可用），余气非当令不足为用&quot;——意思是：余气只有在全局确实没有本气、中气可用时，才勉强取用；这不是常态。</p>
<h3>1.4 地支与四季旺相：月令是地支分析的灵魂</h3>
<p><strong>四季地支旺相表：</strong></p>
<table>
<thead>
<tr>
<th>季节</th>
<th>月令</th>
<th>当令地支</th>
<th>本季地支旺相状态</th>
</tr>
</thead>
<tbody><tr>
<td>春</td>
<td>寅卯辰</td>
<td>寅卯（木旺）</td>
<td>寅为临官，卯为帝旺，辰为衰</td>
</tr>
<tr>
<td>夏</td>
<td>巳午未</td>
<td>巳午（火旺）</td>
<td>巳为临官，午为帝旺，未为衰</td>
</tr>
<tr>
<td>秋</td>
<td>申酉戌</td>
<td>申酉（金旺）</td>
<td>申为临官，酉为帝旺，戌为衰</td>
</tr>
<tr>
<td>冬</td>
<td>亥子丑</td>
<td>亥子（水旺）</td>
<td>亥为临官，子为帝旺，丑为衰</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>任注核心：</strong> &quot;地支专取生旺&quot;——长生、沐浴、冠带、临官、帝旺为大吉；衰、病、死为大凶。这十二宫状态是判断地支旺衰的终极标准。</p>
</blockquote>
<h3>1.5 第一阶段自测</h3>
<ol>
<li>阳支和阴支各有哪些？两者在命理含义上有何根本区别？</li>
<li>丑土藏有三个天干，本气、中气、余气分别是什么？</li>
<li>任注说&quot;本气为重&quot;，为什么？在什么情况下才看余气？</li>
<li>&quot;动且强&quot;与&quot;静且专&quot;分别对应哪六支？</li>
</ol>
<hr>
<h2>第二阶段：理论深化——冲合生旺的内在机理</h2>
<h3>2.1 任注批判：世俗关于冲合的四大谬说</h3>
<p><strong>任铁樵最厉害的贡献之一</strong>，是在本篇中对世俗命家关于地支冲合的谬说进行了系统清算。他归纳了四个常见错误：</p>
<p><strong>谬说一：&quot;金水能冲木火，木火不能冲金水&quot;</strong></p>
<p>任注批判：此说&quot;不论天干则可，论地支则不可&quot;。地支之冲，本气对冲，不以五行流通为转移。子午冲，是子中癸水冲午中丁己；午未冲，是午中丁己冲未中丁乙——谁冲谁，取决于本气旺衰，不取决于金水还是木火。</p>
<p><strong>谬说二：&quot;冲喜合，合怕冲&quot;</strong></p>
<p>任注批判：此说有合而冲者（合住忌神，冲开反吉），有冲而喜合者（冲动用神，合住反吉），不可执一。冲合本身无吉凶，吉凶在于所冲所合的是用神还是忌神。</p>
<p><strong>谬说三：&quot;以冲为凶，以合为吉&quot;</strong></p>
<p>任注批判：冲开财库为吉（打开财库）；冲坏财库为凶（冲散财气）。冲开官库为吉；冲坏官星为凶。一切以本气旺衰为转移。</p>
<p><strong>谬说四：&quot;支神以刑冲穿破为主论&quot;</strong></p>
<p>任注批判：<strong>&quot;支神只以冲为重，刑与穿总非紧要。&quot;</strong> 这是任注最著名的论断之一。刑（自刑）、穿（六害）在命理分析中属于细节参考，不是核心论法。真正要紧的，只有冲——而冲的吉凶，又须配合天干用神来定。</p>
<blockquote>
<p><strong>任注四句诀（须背诵）：</strong>
① 冲者，必是相克。
② 及乎四库兄弟之冲，必须冲开，非闭藏之谓。
③ 刑与穿总非紧要。
④ 冲有吉有凶，不可执一。</p>
</blockquote>
<h3>2.2 六冲深度解析：旺相冲衰是核心</h3>
<p><strong>六冲速查表：</strong></p>
<table>
<thead>
<tr>
<th>六冲</th>
<th>本气相克</th>
<th>冲起结果（旺相）</th>
<th>冲坏结果（衰败）</th>
<th>命理要点</th>
</tr>
</thead>
<tbody><tr>
<td>子午冲</td>
<td>癸水冲丁己</td>
<td>冲开官印，功名发越</td>
<td>冲坏官星，伤病是非</td>
<td>子为刃，午为财</td>
</tr>
<tr>
<td>丑未冲</td>
<td>己土冲己土</td>
<td>冲开金库，财发</td>
<td>冲坏印星，学业损</td>
<td>丑寒未燥，相激最烈</td>
</tr>
<tr>
<td>寅申冲</td>
<td>甲木冲庚金</td>
<td>冲开金之闭，财官动</td>
<td>冲坏木根，体弱多病</td>
<td>冲金为开，冲木为破</td>
</tr>
<tr>
<td>卯酉冲</td>
<td>乙木冲辛金</td>
<td>冲开金之质，财动</td>
<td>冲坏木气，损财伤身</td>
<td>卯为刃，酉为官</td>
</tr>
<tr>
<td>辰戌冲</td>
<td>戊土冲戊土</td>
<td>冲开水库，印发</td>
<td>冲坏火库，凶</td>
<td>土冲土，质同气异</td>
</tr>
<tr>
<td>巳亥冲</td>
<td>丙火冲壬水</td>
<td>冲开水之闭，才动</td>
<td>冲坏火根，心神耗损</td>
<td>冲水为开，冲火为激</td>
</tr>
</tbody></table>
<p><strong>冲的吉凶判断树（任注精华）：</strong></p>
<pre><code>第一步：所冲之地支是否为用神所在？
  ↓是
第二步：用神本气旺相还是休囚？
  ↓旺相
冲起用神 → 大吉（用神得势，发越）
  ↓休囚
冲坏用神 → 大凶（用神受伤，败落）

第一步：所冲之地支是否为忌神所在？
  ↓是
第二步：忌神本气旺相还是休囚？
  ↓旺相
冲坏忌神 → 大吉（去忌得清）
  ↓休囚
冲起忌神 → 凶（忌神借势）

第一步：冲的是四库（辰戌丑未）吗？
  ↓是
冲开 → 吉（开库，发越）
冲坏 → 凶（破库，破败）
</code></pre>
<h3>2.3 生方怕动，旺方忌冲——任注又一核心定理</h3>
<p><strong>原文：</strong></p>
<blockquote>
<p>生方怕动，旺方忌冲。</p>
</blockquote>
<p>这是地支分析的第二个核心定理，与&quot;阳动阴静&quot;互为表里。</p>
<p><strong>生方（亥子寅卯辰）：</strong> 木火之方，水土之根。冲则动，动则变故速来。</p>
<table>
<thead>
<tr>
<th>生方</th>
<th>生什么</th>
<th>冲则如何</th>
</tr>
</thead>
<tbody><tr>
<td>亥</td>
<td>生木（壬水生甲木）</td>
<td>冲亥则水动，木根浮动</td>
</tr>
<tr>
<td>子</td>
<td>生木（癸水润木）</td>
<td>冲子则水激，木性动摇</td>
</tr>
<tr>
<td>寅</td>
<td>生火（甲木生丙火）</td>
<td>冲寅则木动，火源动摇</td>
</tr>
<tr>
<td>卯</td>
<td>木本身</td>
<td>冲卯则木动，本气受伤</td>
</tr>
<tr>
<td>辰</td>
<td>生金之湿土</td>
<td>冲辰则水土交激</td>
</tr>
</tbody></table>
<p><strong>旺方（申酉戌）：</strong> 金之旺地，质坚体固。冲则破，须开——不是怕动，而是要冲开。</p>
<table>
<thead>
<tr>
<th>旺方</th>
<th>旺什么</th>
<th>冲则如何</th>
</tr>
</thead>
<tbody><tr>
<td>申</td>
<td>金之临官</td>
<td>冲申则开金局，动而发</td>
</tr>
<tr>
<td>酉</td>
<td>金之帝旺</td>
<td>冲酉则金动，质坚破格</td>
</tr>
<tr>
<td>戌</td>
<td>金之墓库</td>
<td>冲戌则开金库，大发</td>
</tr>
</tbody></table>
<p><strong>任注警示：</strong>
&quot;生方怕动&quot;不是说生方不能被冲——而是说生方被冲时，要考虑动得太快会引发变故。&quot;旺方忌冲&quot;不是说旺方怕冲——而是说旺方被冲时，要考虑本气是否当令，若不当令则冲开反吉，若当令则冲坏反凶。</p>
<h3>2.4 支神冲起与冲坏：六组对照案例</h3>
<p><strong>任注原文：&quot;冲者，必是相克。及乎四库兄弟之冲，必须冲开，非闭藏之谓。&quot;</strong></p>
<p><strong>四组冲开为吉的典型：</strong></p>
<table>
<thead>
<tr>
<th>命造</th>
<th>冲局</th>
<th>冲开之象</th>
<th>结果</th>
</tr>
</thead>
<tbody><tr>
<td>丙申年柱，壬子运</td>
<td>子午冲</td>
<td>午火冲起，印星发越</td>
<td>文贵</td>
</tr>
<tr>
<td>辛酉月令，卯运冲酉</td>
<td>卯酉冲</td>
<td>酉金冲开，财路广开</td>
<td>财运</td>
</tr>
<tr>
<td>壬辰日柱，戌运冲辰</td>
<td>辰戌冲</td>
<td>土冲开水库，印星有力</td>
<td>印绶格成</td>
</tr>
<tr>
<td>甲寅日柱，申运冲寅</td>
<td>寅申冲</td>
<td>申金冲开木闭，官星启动</td>
<td>官运</td>
</tr>
</tbody></table>
<p><strong>两组冲坏为凶的典型：</strong></p>
<table>
<thead>
<tr>
<th>命造</th>
<th>冲局</th>
<th>冲坏之象</th>
<th>结果</th>
</tr>
</thead>
<tbody><tr>
<td>癸卯年柱，酉运冲卯</td>
<td>卯酉冲</td>
<td>酉金冲坏卯木，财根断</td>
<td>破财</td>
</tr>
<tr>
<td>庚子月令，午运冲子</td>
<td>子午冲</td>
<td>午火冲坏子水，印星伤</td>
<td>伤病</td>
</tr>
</tbody></table>
<h3>2.5 三合局与三会方：冲合的进阶关系</h3>
<p><strong>三合局（任注列为&quot;暗冲暗会&quot;）：</strong></p>
<table>
<thead>
<tr>
<th>三合局</th>
<th>合成五行</th>
<th>力量等级</th>
<th>命理意义</th>
</tr>
</thead>
<tbody><tr>
<td>申子辰</td>
<td>合水局</td>
<td>★★★★★</td>
<td>润下格必备</td>
</tr>
<tr>
<td>亥卯未</td>
<td>合木局</td>
<td>★★★★★</td>
<td>曲直格必备</td>
</tr>
<tr>
<td>寅午戌</td>
<td>合火局</td>
<td>★★★★★</td>
<td>炎上格必备</td>
</tr>
<tr>
<td>巳酉丑</td>
<td>合金局</td>
<td>★★★★★</td>
<td>从革格必备</td>
</tr>
</tbody></table>
<p><strong>半三合（力量次之）：</strong></p>
<table>
<thead>
<tr>
<th>半三合</th>
<th>合成</th>
<th>力量</th>
</tr>
</thead>
<tbody><tr>
<td>申子、子辰</td>
<td>半水局</td>
<td>★★★</td>
</tr>
<tr>
<td>亥卯、卯未</td>
<td>半木局</td>
<td>★★★</td>
</tr>
<tr>
<td>寅午、午戌</td>
<td>半火局</td>
<td>★★★</td>
</tr>
<tr>
<td>巳酉、酉丑</td>
<td>半金局</td>
<td>★★★</td>
</tr>
</tbody></table>
<p><strong>三会方（力量最大，但难成）：</strong></p>
<pre><code>寅卯辰会木 → 力量 &gt; 三合
巳午未会火 → 力量 &gt; 三合
申酉戌会金 → 力量 &gt; 三合
亥子丑会水 → 力量 &gt; 三合
</code></pre>
<p><strong>任注关于&quot;暗冲暗会&quot;的批判：</strong></p>
<blockquote>
<p>原文：&quot;暗冲暗会尤为喜，彼冲我兮皆冲起。&quot;
任注批判：&quot;支神冲起，固为得势。然以冲为起，以会为起，又有冲坏冲凶者，不可执一也。&quot;</p>
</blockquote>
<p>这句话极其重要：<strong>三合三会本身无吉凶，吉凶取决于合会的是用神还是忌神，以及合会之后是否破坏了原有的用神体系。</strong></p>
<h3>2.6 第二阶段自测</h3>
<ol>
<li>任注批判了哪四个关于冲合的世俗谬说？正确原则是什么？</li>
<li>&quot;生方怕动，旺方忌冲&quot;中，&quot;生方&quot;和&quot;旺方&quot;各指哪些地支？为什么命理性质不同？</li>
<li>辰戌冲与寅申冲，在吉凶判断上有何本质区别？</li>
<li>支神冲起与冲坏的判断标准是什么？</li>
</ol>
<hr>
<h2>第三阶段：命造实战——任注六造深度拆解</h2>
<h3>3.1 学习命造前的理论准备</h3>
<p>在拆解任注六造之前，需要明确三个分析框架：</p>
<pre><code>命造分析框架（三步法）：
第一步：定日主——日干为何？生于何月？得令否？
第二步：观格局——月令为何？格局成败？用神是谁？
第三步：论地支——地支冲合如何？是冲起还是冲坏？是生方动还是旺方开？
</code></pre>
<h3>3.2 第一造：甲寅日主，秋水通源——任注示范&quot;假杀为权&quot;</h3>
<p><strong>命造：</strong></p>
<pre><code>乾  壬子  癸酉  壬申  壬子
年   刃   官    杀    刃
</code></pre>
<p><strong>第一步：定日主格局</strong></p>
<ul>
<li>日干壬水，生于酉月（八月，金旺水相）</li>
<li>月令酉金，壬水在酉月为相地（得令）</li>
<li>壬水自坐申金长生之地，时支子水为刃</li>
<li>四柱水势泛滥，金生水旺</li>
</ul>
<p><strong>第二步：观格局用神</strong></p>
<ul>
<li>月令酉金，壬水得金之生，不以官杀格论</li>
<li>格局核心：壬水身强杀浅——假杀为权</li>
<li>用神：丁火（食神制杀）为主，己土（财星卫火）为辅</li>
<li>忌神：金水（生助日主，使杀更浅）</li>
</ul>
<p><strong>第三步：论地支——本篇重点</strong></p>
<table>
<thead>
<tr>
<th>地支</th>
<th>藏干</th>
<th>旺衰</th>
<th>与用神关系</th>
<th>分析</th>
</tr>
</thead>
<tbody><tr>
<td>子（年支）</td>
<td>癸</td>
<td>刃旺</td>
<td>生壬水日主</td>
<td>日主得刃，水势更盛</td>
</tr>
<tr>
<td>酉（月支）</td>
<td>辛</td>
<td>官旺</td>
<td>壬水得酉官</td>
<td>官星有根，但为月令</td>
</tr>
<tr>
<td>申（日支）</td>
<td>庚壬戊</td>
<td>杀旺</td>
<td>壬水得申杀</td>
<td>杀星有根，身强杀浅</td>
</tr>
<tr>
<td>子（时支）</td>
<td>癸</td>
<td>刃旺</td>
<td>生壬水日主</td>
<td>双重刃，水势泛滥</td>
</tr>
</tbody></table>
<p><strong>任注原文分析：</strong></p>
<blockquote>
<p>&quot;甲寅日生，身强杀浅，假杀为权。&quot;
&quot;丁火为用，己土卫之。酉运冲破格局，午运文采发扬。&quot;</p>
</blockquote>
<p><strong>关键地支分析：</strong></p>
<ul>
<li><p><strong>酉运（辛酉大运）</strong>：壬水日主行酉运，酉为官星，冲破格局——这里的&quot;冲&quot;指酉冲动了什么？任注说是&quot;冲破格局&quot;。格局是什么？壬水身强，杀浅须用食神丁火制之。酉运，金生水旺，官星有力但日主更强，格局用神丁火被克——冲破的不是某个地支，而是整个用神体系。</p>
</li>
<li><p><strong>午运（丙午大运）</strong>：午冲子——子为刃，午为财。午冲子，刃动有制（财星午火冲刃子水），同时午中丁火透出，食神制杀有力——文采发扬，功名显达。</p>
</li>
<li><p><strong>为什么&quot;午运&quot;吉而&quot;酉运&quot;凶？</strong> 酉运，金水势盛，日主过强，用神丁火被合住不能制杀。午运，午火冲动子水刃星，刃被财制（财克刃），同时午中丁火透出——制杀成功，故吉。</p>
</li>
</ul>
<blockquote>
<p><strong>本造地支学习要点：</strong> 子午冲在本造中是核心——午冲子，财克刃，用神得势。酉运凶，是因为金水势盛冲破了用神体系。</p>
</blockquote>
<h3>3.3 第二造：癸卯日主——任注示范&quot;比劫争财&quot;</h3>
<p><strong>命造：</strong></p>
<pre><code>乾  癸卯  壬戌  壬子  辛亥
年   印   财    刃   劫
</code></pre>
<p><strong>第一步：定日主格局</strong></p>
<ul>
<li>日干壬水，生于戌月（九月，土旺水相）</li>
<li>壬水自坐子水阳刃，时支亥水劫财帮身</li>
<li>年支卯木印星泄水生火</li>
<li>格局：壬水身强，财星戌土当令</li>
</ul>
<p><strong>第二步：观格局用神</strong></p>
<ul>
<li>月令戌土，壬水在戌月为相地（得令但偏弱）</li>
<li>格局核心：壬水身强，财星当令——戊土官星制水为用</li>
<li>用神：戊土（官星制水）为主，丙火（调候生财）为辅</li>
<li>忌神：亥子水（比劫争财），卯木（印星泄财）</li>
</ul>
<p><strong>第三步：论地支——本篇重点</strong></p>
<table>
<thead>
<tr>
<th>地支</th>
<th>藏干</th>
<th>旺衰</th>
<th>与用神关系</th>
<th>分析</th>
</tr>
</thead>
<tbody><tr>
<td>卯（年支）</td>
<td>乙</td>
<td>印旺</td>
<td>印星泄财</td>
<td>卯戌合，印星合财，印财交加</td>
</tr>
<tr>
<td>戌（月支）</td>
<td>戊辛丁</td>
<td>财旺</td>
<td>本气戊土为官星用神</td>
<td>戌为财库，戊土官星当令</td>
</tr>
<tr>
<td>子（日支）</td>
<td>癸</td>
<td>刃旺</td>
<td>日主得刃帮身</td>
<td>子水阳刃，比劫之源</td>
</tr>
<tr>
<td>亥（时支）</td>
<td>壬甲</td>
<td>劫旺</td>
<td>亥子会水，比劫争财</td>
<td>亥子水势旺，劫财争财</td>
</tr>
</tbody></table>
<p><strong>任注关键论断：</strong></p>
<blockquote>
<p>&quot;比劫争财，不利父妻。&quot;</p>
</blockquote>
<p><strong>关键地支分析：</strong></p>
<ul>
<li><p><strong>亥子会水</strong>：亥子相邻，子为壬水日刃，亥为壬水劫财——亥子会北方水局，水势泛滥。壬水日主身强，比劫争财——戌土财星被众水所克，父辈不利，妻财有损。</p>
</li>
<li><p><strong>卯戌合</strong>：卯为印星，戌为财星，卯戌合——印来生身，财入库中。印财相合，本是中等格局，但因亥子水势过旺，戌土财星受伤，印星被财所累。</p>
</li>
<li><p><strong>辰运冲戌（未引述但推演）</strong>：任注未明确，但按地支理论推演：辰冲戌，冲开财库，若天干有火透出，则财星发越；若水势仍盛，则冲坏戌土用神，凶。</p>
</li>
</ul>
<blockquote>
<p><strong>本造地支学习要点：</strong> 亥子相邻而旺，比劫争财——这是&quot;阴支静且专&quot;的典型案例。亥子水静而专聚，不动则已，动则势大难制。</p>
</blockquote>
<h3>3.4 第三造：庚子日主——任注示范&quot;寒金喜火&quot;</h3>
<p><strong>命造：</strong></p>
<pre><code>乾  庚子  辛丑  壬寅  癸卯
年   比   印    食    伤
</code></pre>
<p><strong>第一步：定日主格局</strong></p>
<ul>
<li>日干庚金，生于丑月（十二月，土旺金相）</li>
<li>庚金自坐子水伤官泄秀</li>
<li>月令丑土，印星辛金透出</li>
<li>格局：庚金身弱，印星当令——印格</li>
</ul>
<p><strong>第二步：观格局用神</strong></p>
<ul>
<li>月令丑土，印星当令</li>
<li>庚金身弱，印星生身为用</li>
<li>用神：丙火（调候暖金）为主，丁火（制食生财）为辅</li>
<li>忌神：壬癸子水（伤官泄身），寅卯木（财星生助忌神）</li>
</ul>
<p><strong>第三步：论地支——本篇重点</strong></p>
<table>
<thead>
<tr>
<th>地支</th>
<th>藏干</th>
<th>旺衰</th>
<th>与用神关系</th>
<th>分析</th>
</tr>
</thead>
<tbody><tr>
<td>子（年支）</td>
<td>癸</td>
<td>伤旺</td>
<td>泄庚金日主</td>
<td>伤官泄秀，但水寒金冷</td>
</tr>
<tr>
<td>丑（月支）</td>
<td>己癸辛</td>
<td>印旺</td>
<td>丑土印星生庚金</td>
<td>印星当令，庚金有根</td>
</tr>
<tr>
<td>寅（日支）</td>
<td>甲丙戊</td>
<td>食旺</td>
<td>寅中丙火为调候</td>
<td>食神生财，暖局为用</td>
</tr>
<tr>
<td>卯（时支）</td>
<td>乙</td>
<td>财旺</td>
<td>卯生寅木，助火暖金</td>
<td>财星生助用神，吉</td>
</tr>
</tbody></table>
<p><strong>任注关键论断：</strong></p>
<blockquote>
<p>&quot;寒金喜火，调候为急。寅运食神生财，财气发越。&quot;</p>
</blockquote>
<p><strong>关键地支分析：</strong></p>
<ul>
<li><p><strong>子丑合</strong>：子为伤官，丑为印星——子丑合，印星合住伤官，印星有力，伤官被制。印格成，庚金日主得印星生身。</p>
</li>
<li><p><strong>寅卯会木局</strong>：寅卯相邻，寅中丙火为调候，卯木生寅火——寅卯会木局，助起火气。丙火调候有力，寒金得暖，格局成。</p>
</li>
<li><p><strong>寅运大吉</strong>：壬寅大运，寅为食神，丙火透出——食神生财，调候有力，财气发越。壬水为印星，寅中丙火得壬水财星相配（财生官？此处是食神生财），大运吉利。</p>
</li>
<li><p><strong>卯运有情</strong>：癸卯大运，卯为财星，癸水印星——卯木财星生癸水印星，印星有根，格局稳定。</p>
</li>
</ul>
<blockquote>
<p><strong>本造地支学习要点：</strong> 子丑合、寅卯会——两个地支组合同时作用。子丑合印，伤官被制；寅卯会火，调候有力。印格成，调候得宜，此为上等命造。</p>
</blockquote>
<h3>3.5 第四造：丁卯日主——任注示范&quot;火水未济&quot;</h3>
<p><strong>命造：</strong></p>
<pre><code>乾  丁卯  壬寅  辛亥  丙申
年   印   印    官    财
</code></pre>
<p><strong>第一步：定日主格局</strong></p>
<ul>
<li>日干丁火，生于寅月（正月，木旺火相）</li>
<li>丁火自坐亥水官星，年干丁火帮身</li>
<li>月令寅木，印星当令</li>
<li>格局：丁火身弱，印星生身——印格</li>
</ul>
<p><strong>第二步：观格局用神</strong></p>
<ul>
<li>月令寅木，印星当令</li>
<li>丁火身弱，印星甲木生身为用</li>
<li>用神：丙火（帮身）为首选，寅木（印星）为次选</li>
<li>忌神：亥子水（官杀克身），壬水（正官合日主）</li>
</ul>
<p><strong>第三步：论地支——本篇重点</strong></p>
<table>
<thead>
<tr>
<th>地支</th>
<th>藏干</th>
<th>旺衰</th>
<th>与用神关系</th>
<th>分析</th>
</tr>
</thead>
<tbody><tr>
<td>卯（年支）</td>
<td>乙</td>
<td>印旺</td>
<td>卯木印星生丁火</td>
<td>印星有力，帮身</td>
</tr>
<tr>
<td>寅（月支）</td>
<td>甲丙戊</td>
<td>印旺</td>
<td>寅木印星生丁火</td>
<td>印星当令，日主有根</td>
</tr>
<tr>
<td>亥（日支）</td>
<td>壬甲</td>
<td>官旺</td>
<td>壬水官星克丁火</td>
<td>亥壬为丁火官星，官星有情</td>
</tr>
<tr>
<td>申（时支）</td>
<td>庚壬戊</td>
<td>财旺</td>
<td>申金生亥水，助官</td>
<td>财星生官，官星有力</td>
</tr>
</tbody></table>
<p><strong>任注关键论断：</strong></p>
<blockquote>
<p>&quot;官星合日，印星为用。寅运印星有力，辛运有损。&quot;</p>
</blockquote>
<p><strong>关键地支分析：</strong></p>
<ul>
<li><p><strong>寅卯会木局</strong>：寅卯相邻，寅中甲木、卯中乙木——寅卯会木局，印星成势。丁火日主得印星成片相生，身弱转旺。</p>
</li>
<li><p><strong>亥水官星</strong>：亥中壬水为丁火正官，亥壬水与寅卯木印星形成&quot;官印相生&quot;——官星有印星相护，格局清正。</p>
</li>
<li><p><strong>申亥相生</strong>：申中庚金生亥中壬水——财生官，官生印，印生身，流通有情。</p>
</li>
<li><p><strong>辛运有损</strong>：辛金运，辛金克寅卯木印星——印星受伤，日主失根，官星无护，大凶。</p>
</li>
</ul>
<blockquote>
<p><strong>本造地支学习要点：</strong> 寅卯会木局成印星党——印格用丙火帮身，印星成势。辛运之所以凶，是因为辛金冲克印星（辛卯冲），破格之象。</p>
</blockquote>
<h3>3.6 第五造：壬子日主——任注示范&quot;润下格破则凶&quot;</h3>
<p><strong>命造：</strong></p>
<pre><code>乾  壬子  壬子  壬子  壬子
年   刃   刃    刃    刃
</code></pre>
<p><strong>第一步：定日主格局</strong></p>
<ul>
<li>日干壬水，生于子月（十一月，冬水当令）</li>
<li>四柱六壬逢子，皆为阳刃</li>
<li>月令子水，壬水帝旺</li>
<li>格局：壬水过旺，六壬趋子——润下格</li>
</ul>
<p><strong>第二步：观格局用神</strong></p>
<ul>
<li>润下格成时，戊土（官星）制水为用，丁火（调候）为辅</li>
<li>润下格破时，无制无化——大凶</li>
<li>用神：戊土（制刃）、丁火（调候）</li>
<li>忌神：无戊无丁，格局破则凶</li>
</ul>
<p><strong>第三步：论地支——本篇重点</strong></p>
<table>
<thead>
<tr>
<th>地支</th>
<th>藏干</th>
<th>旺衰</th>
<th>与用神关系</th>
<th>分析</th>
</tr>
</thead>
<tbody><tr>
<td>子（年支）</td>
<td>癸</td>
<td>刃旺</td>
<td>壬水日主之刃</td>
<td>刃星重重，水势泛滥</td>
</tr>
<tr>
<td>子（月支）</td>
<td>癸</td>
<td>刃旺</td>
<td>月令为刃</td>
<td>月令子水，壬水当令</td>
</tr>
<tr>
<td>子（日支）</td>
<td>癸</td>
<td>刃旺</td>
<td>日刃</td>
<td>壬水日主之根</td>
</tr>
<tr>
<td>子（时支）</td>
<td>癸</td>
<td>刃旺</td>
<td>时刃</td>
<td>晚年有根</td>
</tr>
</tbody></table>
<p><strong>任注关键论断：</strong></p>
<blockquote>
<p>&quot;六壬趋子，润下格。戊运发迹，午运凶。&quot;</p>
</blockquote>
<p><strong>关键地支分析——&quot;润下格的吉凶完全在地支：</strong></p>
<ul>
<li><strong>子水四重</strong>：四柱子水，亥子丑会北方水局——润下格已成，水势泛滥。</li>
<li><strong>戊运发迹</strong>：戊土运，戊土为官星，制子水刃星——官星制刃，格局成，功名发越。</li>
<li><strong>午运大凶</strong>：午冲子——午中丁己冲子中癸水，刃星被冲而动。润下格最忌冲破，子水刃星被冲，格局破则凶。但任注说&quot;午运凶&quot;，此&quot;凶&quot;是相对于戊运之&quot;吉&quot;而言——格局破后，凶事连连。</li>
</ul>
<blockquote>
<p><strong>本造地支学习要点：</strong> 子午冲——午冲子，冲动刃星。润下格成时，冲开子水官星得势（戊运）；润下格破时，冲动子水刃星无制（午运凶）。同样是子午冲，吉凶天壤之别——关键在于有无用神（戊土）。</p>
</blockquote>
<h3>3.7 第六造：庚申日主——任注示范&quot;比劫成群，官星为用&quot;</h3>
<p><strong>命造：</strong></p>
<pre><code>乾  庚申  辛酉  辛酉  庚寅
年   比   比    比    官
</code></pre>
<p><strong>第一步：定日主格局</strong></p>
<ul>
<li>日干庚金，生于酉月（八月，金旺金相比）</li>
<li>四柱庚辛金三重，月令酉金为帝旺</li>
<li>格局：庚金过旺，比劫争财——官星制比为用</li>
</ul>
<p><strong>第二步：观格局用神</strong></p>
<ul>
<li>庚金身旺，比劫重重</li>
<li>用神：丁火（调候）为主，壬水（泄秀）为辅</li>
<li>忌神：土金（比劫助旺）</li>
</ul>
<p><strong>第三步：论地支——本篇重点</strong></p>
<table>
<thead>
<tr>
<th>地支</th>
<th>藏干</th>
<th>旺衰</th>
<th>与用神关系</th>
<th>分析</th>
</tr>
</thead>
<tbody><tr>
<td>申（年支）</td>
<td>庚壬戊</td>
<td>比旺</td>
<td>庚金日主之比</td>
<td>申为庚金之禄</td>
</tr>
<tr>
<td>酉（月支）</td>
<td>辛</td>
<td>官旺</td>
<td>辛金为庚金之官</td>
<td>月令酉金，帝旺之金</td>
</tr>
<tr>
<td>酉（日支）</td>
<td>辛</td>
<td>官旺</td>
<td>同上</td>
<td>日坐官星</td>
</tr>
<tr>
<td>寅（时支）</td>
<td>甲丙戊</td>
<td>财食</td>
<td>寅中丙火为调候</td>
<td>寅为庚金财星</td>
</tr>
</tbody></table>
<p><strong>任注关键论断：</strong></p>
<blockquote>
<p>&quot;比劫成群，官星为用。寅运财星有情，亥运冲破。&quot;</p>
</blockquote>
<p><strong>关键地支分析：</strong></p>
<ul>
<li><p><strong>申酉会金局</strong>：申酉相邻，申中庚金、酉中辛金——申酉会金局，金势过旺。庚金日主身过旺，比劫争财。</p>
</li>
<li><p><strong>寅木财星</strong>：寅中甲木为庚金财星，寅中丙火为调候。寅运，财星有根，调候有力——财运亨通。</p>
</li>
<li><p><strong>亥运冲寅</strong>：亥冲寅——亥中壬甲冲寅中甲丙。亥为壬水，冲寅木财星，财星受伤，财运破败。亥为生方，冲则生方动，变故速来。</p>
</li>
</ul>
<blockquote>
<p><strong>本造地支学习要点：</strong> 亥寅冲——亥为生方（水生木），寅为木之长生。亥冲寅，是生方被冲。寅中丙火调候被冲，故亥运凶。申酉会金，比劫成群，官星辛金为用——这是&quot;比劫成群，官星为用&quot;的典型格局。</p>
</blockquote>
<h3>3.8 六造地支对照总表</h3>
<table>
<thead>
<tr>
<th>命造</th>
<th>日主</th>
<th>月令</th>
<th>地支组合</th>
<th>核心冲合</th>
<th>吉凶判断</th>
<th>关键用神</th>
</tr>
</thead>
<tbody><tr>
<td>第一造</td>
<td>壬水</td>
<td>酉官</td>
<td>子子刃、申杀</td>
<td>酉冲→格局破；午冲子→刃制</td>
<td>午运吉</td>
<td>丁火制杀</td>
</tr>
<tr>
<td>第二造</td>
<td>壬水</td>
<td>戌财</td>
<td>亥子刃、卯印</td>
<td>卯戌合；亥子会水</td>
<td>比劫争财凶</td>
<td>戊土制水</td>
</tr>
<tr>
<td>第三造</td>
<td>庚金</td>
<td>丑印</td>
<td>子伤、寅食</td>
<td>子丑合印；寅卯会火</td>
<td>调候成格吉</td>
<td>丙火调候</td>
</tr>
<tr>
<td>第四造</td>
<td>丁火</td>
<td>寅印</td>
<td>卯印、亥官</td>
<td>寅卯会木；申亥相生</td>
<td>官印相生吉</td>
<td>丙火帮身</td>
</tr>
<tr>
<td>第五造</td>
<td>壬水</td>
<td>子刃</td>
<td>四子刃</td>
<td>子午冲</td>
<td>午运破格凶</td>
<td>戊土制刃</td>
</tr>
<tr>
<td>第六造</td>
<td>庚金</td>
<td>酉比</td>
<td>申酉会金、寅财</td>
<td>亥冲寅；申酉会</td>
<td>亥运冲财凶</td>
<td>丁火调候</td>
</tr>
</tbody></table>
<hr>
<h2>核心名句精读（三篇对照）</h2>
<h3>名句一：阳支动且强，速达显灾祥；阴支静且专，否泰每经年</h3>
<p><strong>精读：</strong>
&quot;阳支动且强&quot;——子丑寅卯辰巳六支，气化流行，主动主变。&quot;速达&quot;二字是重点：阳支发生变化，其吉凶应期快而明显。&quot;显灾祥&quot;——灾害和吉祥都明显，不藏不隐。</p>
<p>&quot;阴支静且专&quot;——午未申酉戌亥六支，质凝形聚，主静主渐。&quot;否泰每经年&quot;——否运泰运往往经历多年才显现，不是一冲即应，而是渐变积累。</p>
<p><strong>应用口诀：</strong></p>
<blockquote>
<p>阳支多 → 人生波动大、变故骤来
阴支多 → 人生沉稳渐变、祸福缓发</p>
</blockquote>
<h3>名句二：生方怕动，旺方忌冲</h3>
<p><strong>精读：</strong>
&quot;生方&quot;——亥子（水，生木之方）、寅卯（木，生火之方）、辰丑（湿土，生物之根）。生方被冲，则所生之物动摇，事变速来。</p>
<p>&quot;旺方&quot;——申酉戌（金，旺地）。旺方被冲，须辨：当令冲开为吉，不当令冲坏为凶。</p>
<p><strong>任注补注（徐乐吾）：</strong> &quot;旺方忌冲，非旺方不可冲也。冲而开之为吉，冲而坏之为凶。&quot;</p>
<h3>名句三：支神只以冲为重，刑与穿总非紧要</h3>
<p><strong>精读：</strong>
这是任注最著名的论断之一。意思是：在所有地支关系中，只有&quot;冲&quot;是核心决定因素；&quot;刑&quot;（自刑：辰午酉亥相刑）、&quot;穿&quot;（六害：子未丑午寅巳申亥等）不是紧要。</p>
<p><strong>实践原则：</strong></p>
<blockquote>
<p>① 分析命局时，先看冲，后看合，再看刑穿。
② 冲有吉凶（冲起vs冲坏），刑穿无吉凶（仅作细节参考）。
③ 刑冲同现时，以冲为主。</p>
</blockquote>
<hr>
<h2>常见错误警示（任注精华）</h2>
<table>
<thead>
<tr>
<th>序号</th>
<th>错误类型</th>
<th>任注原文</th>
<th>正确做法</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>以冲为凶</td>
<td>&quot;冲有吉有凶，不可执一&quot;</td>
<td>冲起用神则吉，冲坏用神则凶</td>
</tr>
<tr>
<td>2</td>
<td>以合为吉</td>
<td>&quot;有冲而喜合者&quot;</td>
<td>合住忌神则吉，合住用神则凶</td>
</tr>
<tr>
<td>3</td>
<td>以刑冲为主论</td>
<td>&quot;刑与穿总非紧要&quot;</td>
<td>地支专取生旺，冲为重</td>
</tr>
<tr>
<td>4</td>
<td>不论本气</td>
<td>&quot;本气为重&quot;</td>
<td>先看本气，中气得令可用，余气非当令不足为用</td>
</tr>
<tr>
<td>5</td>
<td>忽视调候</td>
<td>&quot;调候为急&quot;</td>
<td>寒金喜火，暖水喜水，燥土喜润</td>
</tr>
<tr>
<td>6</td>
<td>生方旺方不分</td>
<td>&quot;生方怕动，旺方忌冲&quot;</td>
<td>生方被冲动则变，旺方被冲须开</td>
</tr>
</tbody></table>
<hr>
<h2>延伸学习路径</h2>
<table>
<thead>
<tr>
<th>阶段</th>
<th>推荐学习篇目</th>
<th>学习目标</th>
</tr>
</thead>
<tbody><tr>
<td>进阶</td>
<td>配合篇</td>
<td>理解天干地支如何统一论断</td>
</tr>
<tr>
<td>进阶</td>
<td>知命篇</td>
<td>掌握顺逆之机与用神不可伤</td>
</tr>
<tr>
<td>高级</td>
<td>八格篇</td>
<td>建立格局学的完整体系</td>
</tr>
<tr>
<td>高级</td>
<td>变格篇</td>
<td>理解杂格与变格的特殊论法</td>
</tr>
</tbody></table>
<hr>
<p><em>教程版本：v1.0 | 2026年5月13日</em>
<em>基于《滴天髓》任铁樵注疏（徐乐吾评注本）</em>
<em>整理：Hermes Agent — 正统子平八字学术技能库</em></p>
`,八格:`<h1>《滴天髓》·八格篇·详细解读教程</h1>
<blockquote>
<p><strong>原著：</strong> 《滴天髓》上篇第十二章·八格
<strong>注疏：</strong> 任铁樵（徐乐吾评注本）
<strong>正文：</strong> 财官印绶发偏正，兼论食伤八格定
<strong>本章字数：</strong> 约1500字
<strong>完成日期：</strong> 2026-05-13</p>
</blockquote>
<hr>
<h2>📖 第一部分：通读全貌（扫盲层）</h2>
<h3>一、本章地位</h3>
<pre><code>《滴天髓》第十二章
  ↓
八格是子平格局论的核心
  ↓
定格局、取用神之标准
</code></pre>
<p>八格篇是《滴天髓》格局论的核心篇章，任铁樵系统论述了：</p>
<ul>
<li>八格的定义与取用方法</li>
<li>正格与变格的判别标准</li>
<li>杂格的批判</li>
<li>六个命造实例分析</li>
</ul>
<h3>二、本章结构</h3>
<pre><code>┌─────────────────────────────────────────────────┐
│  第一板块：任注总论（八格取用的根本原理）          │
│  第二板块：六个命造实例（原文+任注+徐注夹注）       │
│  第三板块：杂格批判（批判杂格谬说）                │
└─────────────────────────────────────────────────┘
</code></pre>
<h3>三、生僻字词速查</h3>
<table>
<thead>
<tr>
<th>字词</th>
<th>读音</th>
<th>含义</th>
</tr>
</thead>
<tbody><tr>
<td>绶</td>
<td>shòu</td>
<td>印绶，月令之气，命局之根基</td>
</tr>
<tr>
<td>司令</td>
<td>sī lìng</td>
<td>月令本气透干者</td>
</tr>
<tr>
<td>杂气</td>
<td>zá qì</td>
<td>辰戌丑未月，地支藏干复杂</td>
</tr>
<tr>
<td>夲</td>
<td>gǎo</td>
<td>日主天干（通&quot;干&quot;）</td>
</tr>
</tbody></table>
<hr>
<h2>📚 第二部分：逐层精解（专业层）</h2>
<h3>四、任注原文逐段解析</h3>
<h4>4.1 【任注】八格取用总纲</h4>
<p><strong>【原文】</strong></p>
<blockquote>
<p>八格者，命中之真理也。先观月令所得何支，次看天干透出何神，再究司令以定真假……</p>
</blockquote>
<p><strong>【取用三步法】</strong></p>
<table>
<thead>
<tr>
<th>步骤</th>
<th>原文关键词</th>
<th>实务含义</th>
<th>比喻</th>
</tr>
</thead>
<tbody><tr>
<td>①</td>
<td>先观月令所得何支</td>
<td>看月令地支是什么五行</td>
<td>查户籍，看你出生在什么环境</td>
</tr>
<tr>
<td>②</td>
<td>次看天干透出何神</td>
<td>看天干有没有透出用神</td>
<td>看这个人出门穿什么衣服</td>
</tr>
<tr>
<td>③</td>
<td>再究司令以定真假</td>
<td>查月令本气透干没有</td>
<td>看这衣服是不是他自己花钱买的</td>
</tr>
</tbody></table>
<p><strong>【口诀】月令定气，天干定格，司令定真</strong></p>
<hr>
<h4>4.2 【任注】正格与变格</h4>
<blockquote>
<p><strong>原文：</strong> 然格局有正有变，正者兼五行之常礼也，变者必从五行之气也</p>
</blockquote>
<table>
<thead>
<tr>
<th>类型</th>
<th>判别标准</th>
<th>特征</th>
</tr>
</thead>
<tbody><tr>
<td><strong>正格</strong></td>
<td>兼五行之常礼</td>
<td>月令本气透干，依常理取用</td>
</tr>
<tr>
<td><strong>变格</strong></td>
<td>必从五行之气</td>
<td>气势引导，顺势而行</td>
</tr>
</tbody></table>
<hr>
<h4>4.3 【任注】禄刃月特殊规则</h4>
<blockquote>
<p><strong>原文：</strong> 若月逢禄刃，无格可取</p>
</blockquote>
<p>禄刃月（日主得令极强），不按八格论，另寻他支透出者为用。</p>
<hr>
<h4>4.4 【任注】格局成败比例</h4>
<blockquote>
<p><strong>原文：</strong> 格局真纯者，百无一二；破败而杂气者，十有八九</p>
</blockquote>
<p>实战中破格是常态，纯格罕见。</p>
<hr>
<h3>五、八格速查表</h3>
<table>
<thead>
<tr>
<th>八格</th>
<th>取格条件</th>
<th>用神</th>
<th>忌神</th>
<th>成格关键</th>
</tr>
</thead>
<tbody><tr>
<td>正官格</td>
<td>月令官星透干</td>
<td>财星生官</td>
<td>伤官混官</td>
<td>官星清纯不混</td>
</tr>
<tr>
<td>偏官格</td>
<td>月令七杀透干</td>
<td>印星化杀/食神制杀</td>
<td>财星党杀</td>
<td>制化得宜</td>
</tr>
<tr>
<td>正财格</td>
<td>月令财星透干</td>
<td>官星护财</td>
<td>印星克财</td>
<td>财星得位通根</td>
</tr>
<tr>
<td>正印格</td>
<td>月令印星透干</td>
<td>官星生印</td>
<td>食神坏印</td>
<td>印星清纯</td>
</tr>
<tr>
<td>食神格</td>
<td>月令食神透干</td>
<td>财星/官星</td>
<td>印星夺食</td>
<td>食神制杀</td>
</tr>
<tr>
<td>伤官格</td>
<td>月令伤官透干</td>
<td>财星泄伤/印星制伤</td>
<td>官星激伤</td>
<td>伤官配印</td>
</tr>
</tbody></table>
<hr>
<h3>六、六个命造实例（核心结论）</h3>
<table>
<thead>
<tr>
<th>命造</th>
<th>四柱</th>
<th>格局</th>
<th>成败关键</th>
<th>任注断语</th>
</tr>
</thead>
<tbody><tr>
<td>第一造</td>
<td>癸卯 己未 乙未 丙子</td>
<td>正官格</td>
<td>印星有力，格局成</td>
<td>科甲出身，仕至藩臬</td>
</tr>
<tr>
<td>第二造</td>
<td>己丑 丁丑 乙丑 丙子</td>
<td>正官格</td>
<td>印星无根，湿土晦火，格局破</td>
<td>功名未遂，耗散资财</td>
</tr>
<tr>
<td>第三造</td>
<td>戊寅 甲子 壬子 辛亥</td>
<td>印绶格</td>
<td>官星无根太弱</td>
<td>品行超群，才华卓越</td>
</tr>
<tr>
<td>第四造</td>
<td>辛酉 丁酉 丁酉 辛亥</td>
<td>印绶格</td>
<td>壬水药病相济</td>
<td>联登甲第，名利两全</td>
</tr>
<tr>
<td>第五造</td>
<td>辛酉 丁酉 丁酉 丙午</td>
<td>印绶格</td>
<td>无壬水药，格局破</td>
<td>机杼空抛，株守待兔</td>
</tr>
<tr>
<td>第六造</td>
<td>丁卯 壬寅 辛亥 丙申</td>
<td>印绶格</td>
<td>亥壬水相济</td>
<td>青蚨十万，化成蓝袍</td>
</tr>
</tbody></table>
<p><strong>对比记忆法</strong>：</p>
<ul>
<li>一、四造成 → 印星有力，用神得位</li>
<li>二、五造败 → 印星无力或被夺，格局破败</li>
</ul>
<hr>
<h3>七、杂格批判</h3>
<p>任铁樵明确批判以下谬说，论命时<strong>不可执为格局</strong>：</p>
<table>
<thead>
<tr>
<th>被批判的谬说</th>
<th>任注原话</th>
<th>核心观点</th>
</tr>
</thead>
<tbody><tr>
<td><strong>兰台妙选</strong></td>
<td>&quot;尤属不经&quot;</td>
<td>奇格异局、纳音诸法皆虚妄</td>
</tr>
<tr>
<td><strong>影响遥系</strong></td>
<td>&quot;固为影响遥系而非格也&quot;</td>
<td>暗冲暗合非实格</td>
</tr>
<tr>
<td><strong>飞天禄马</strong></td>
<td>&quot;不可执为格局&quot;</td>
<td>不可执此为奇格</td>
</tr>
<tr>
<td><strong>壬骑龙背</strong></td>
<td>&quot;何不取壬子、壬申为骑猴马狗之背&quot;</td>
<td>纯属穿凿附会</td>
</tr>
<tr>
<td><strong>六阴朝阳</strong></td>
<td>&quot;何独辛金可朝阳&quot;</td>
<td>以偏概全，逻辑荒谬</td>
</tr>
</tbody></table>
<hr>
<h3>八、格局分析三步法</h3>
<pre><code>第一步：定日主强弱
  得令否？得地否？得势否？

第二步：定月令格局
  月令本气透干否？
  ├─ 是 → 取该透干十神为格（正格）
  └─ 否 → 看他支透干，另寻用神

第三步：判断用神真假
  用神得位否？通根否？透干否？
  ↓
三者齐备 → 真格（极罕见）
缺一       → 破格（常态）
</code></pre>
<hr>
<h2>🏆 第三部分：核心背诵</h2>
<h3>必须背诵的名句</h3>
<blockquote>
<p><strong>1.</strong> 八格者，命中之真理也
<strong>2.</strong> 先观月令所得何支，次看天干透出何神，再究司令以定真假
<strong>3.</strong> 格局有正有变，正者兼五行之常礼，变者必从五行之气
<strong>4.</strong> 若月逢禄刃，无格可取
<strong>5.</strong> 格局真纯者，百无一二；破败而杂气者，十有八九</p>
</blockquote>
<hr>
<h2>✅ 学习检验</h2>
<table>
<thead>
<tr>
<th>题号</th>
<th>问题</th>
<th>参考答案</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>八格包括哪八个？</td>
<td>财、官、印、绶、食、伤、偏、正</td>
</tr>
<tr>
<td>2</td>
<td>正格与变格的核心区别是什么？</td>
<td>正格兼五行常礼，变格从五行之气</td>
</tr>
<tr>
<td>3</td>
<td>&quot;格局真纯者百无一二&quot;说明了什么？</td>
<td>现实命局以破格为多</td>
</tr>
<tr>
<td>4</td>
<td>第一造和第五造格局成败的关键差异？</td>
<td>印星有力 vs 印星无力</td>
</tr>
</tbody></table>
<hr>
<p><em>本解读由 Hermes Agent 自动生成于 2026-05-13</em></p>
`},W2={bage:`<h1>《滴天髓》·八格篇</h1>
<blockquote>
<p><strong>原著：</strong> 《滴天髓》上篇第十二章·八格
<strong>注疏：</strong> 任铁樵（徐乐吾评注本）
<strong>正文：</strong> 财官印绶发偏正，兼论食伤八格定</p>
</blockquote>
<hr>
<h2>一、核心定理（必须背诵）</h2>
<h3>定理一：八格定义</h3>
<pre><code>八格 = 财、官、印、绶、食、伤、偏（偏官/七杀）、正（正财/正官）
</code></pre>
<h3>定理二：八格取用步骤（核心三步）</h3>
<pre><code>第一步：先观月令所得何支      → 确定月令五行
第二步：次看天干透出何神      → 确定透干十神
第三步：再究司令以定真假      → 确认用神是否得位
</code></pre>
<blockquote>
<p>口诀：<strong>月令定气，天干定格，司令定真</strong></p>
</blockquote>
<h3>定理三：正格 vs 变格判别标准</h3>
<table>
<thead>
<tr>
<th>类型</th>
<th>判别标准</th>
<th>特征</th>
</tr>
</thead>
<tbody><tr>
<td><strong>正格</strong></td>
<td>兼五行之常礼</td>
<td>月令本气透干，依常理取用</td>
</tr>
<tr>
<td><strong>变格</strong></td>
<td>必从五行之气</td>
<td>气势引导，顺势而行</td>
</tr>
</tbody></table>
<h3>定理四：禄刃月特殊规则</h3>
<pre><code>若月逢禄刃，无格可取
  → 禄刃月（日主得令极强），不按八格论，另寻他支透出者为用
</code></pre>
<h3>定理五：格局成败比例</h3>
<pre><code>格局真纯者，百无一二
破败而杂气者，十有八九
  → 实战中破格是常态，纯格罕见
</code></pre>
<hr>
<h2>二、八格速查表</h2>
<table>
<thead>
<tr>
<th>八格</th>
<th>取格条件（月令透干）</th>
<th>用神</th>
<th>忌神</th>
<th>成格关键</th>
</tr>
</thead>
<tbody><tr>
<td><strong>正官格</strong></td>
<td>月令本气为官星透干</td>
<td>财星生官</td>
<td>伤官混官/七杀混官</td>
<td>官星清纯不混</td>
</tr>
<tr>
<td><strong>偏官格（七杀）</strong></td>
<td>月令本气为七杀透干</td>
<td>印星化杀/食神制杀</td>
<td>财星党杀</td>
<td>制化得宜</td>
</tr>
<tr>
<td><strong>正财格</strong></td>
<td>月令本气为财星透干</td>
<td>官星护财</td>
<td>印星克财/比劫夺财</td>
<td>财星得位通根</td>
</tr>
<tr>
<td><strong>偏财格</strong></td>
<td>月令本气为偏财透干</td>
<td>官星/食神</td>
<td>比劫夺财</td>
<td>财星通根有力</td>
</tr>
<tr>
<td><strong>正印格</strong></td>
<td>月令本气为印星透干</td>
<td>官星生印/财星破印</td>
<td>食神坏印</td>
<td>印星清纯</td>
</tr>
<tr>
<td><strong>偏印格（枭神）</strong></td>
<td>月令本气为偏印透干</td>
<td>财星制枭/食神泄秀</td>
<td>官星生枭</td>
<td>制化得宜</td>
</tr>
<tr>
<td><strong>食神格</strong></td>
<td>月令本气为食神透干</td>
<td>财星生食/官星泄秀</td>
<td>印星夺食</td>
<td>食神制杀（如有杀）</td>
</tr>
<tr>
<td><strong>伤官格</strong></td>
<td>月令本气为伤官透干</td>
<td>财星泄伤/印星制伤</td>
<td>官星激伤</td>
<td>伤官配印（最佳）</td>
</tr>
</tbody></table>
<hr>
<h2>三、格局分析三步法（实战框架）</h2>
<h3>第一步：定日主强弱</h3>
<pre><code>日主得令否？  → 月令是否为日主同类五行
日主得地否？  → 地支是否有根（禄、刃、余气）
日主得势否？  → 天干是否有印比生助
↓
综合判断：身旺 / 身弱 / 中和
</code></pre>
<h3>第二步：定月令格局</h3>
<pre><code>月令本气透干否？
  ├─ 是 → 取该透干十神为格（正格）
  └─ 否 → 看月令藏干中哪个力量强，取为格
          若禄刃月 → 无格可取，另寻别支透干
          若杂气月 → 取本气为格（不可执杂气财官为奇格）
</code></pre>
<h3>第三步：判断用神真假</h3>
<pre><code>用神得位否？   → 用神是否在月令或在坐支
用神通根否？   → 用神是否有根（旺衰关键）
用神透干否？   → 用神是否在天干显透
  ↓
三者齐备 → 真格（极罕见）
缺一       → 破格（常态）
缺二以上   → 贱格
</code></pre>
<hr>
<h2>四、杂格批判</h2>
<p>任铁樵明确批判以下谬说，论命时<strong>不可执为格局</strong>：</p>
<table>
<thead>
<tr>
<th>被批判的谬说</th>
<th>任注原话</th>
<th>核心观点</th>
</tr>
</thead>
<tbody><tr>
<td><strong>兰台妙选</strong></td>
<td>&quot;尤属不经，不待辩而知识荒唐&quot;</td>
<td>奇格异局、纳音诸法皆虚妄</td>
</tr>
<tr>
<td><strong>影响遥系</strong>（暗冲暗合）</td>
<td>&quot;固为影响遥系而非格也&quot;</td>
<td>暗冲暗合非实格</td>
</tr>
<tr>
<td><strong>杂气财官</strong></td>
<td>&quot;杂气财官不可执&quot;</td>
<td>杂气月仍取本气为格</td>
</tr>
<tr>
<td><strong>飞天禄马</strong></td>
<td>&quot;不可执为格局&quot;</td>
<td>不可执此为奇格</td>
</tr>
<tr>
<td><strong>倒冲刑冲</strong></td>
<td>&quot;不可执为格局&quot;</td>
<td>倒冲非正统论法</td>
</tr>
<tr>
<td><strong>合禄合贵</strong></td>
<td>&quot;不可执为格局&quot;</td>
<td>合禄非格局正途</td>
</tr>
<tr>
<td><strong>日时双头算法</strong>（子时算法）</td>
<td>&quot;何以壬子时独可朝子&quot;</td>
<td>子时算法混乱，不足为凭</td>
</tr>
<tr>
<td><strong>壬骑龙背</strong></td>
<td>&quot;何不取壬子、壬申、壬戌为骑猴马狗之背&quot;</td>
<td>纯属穿凿附会</td>
</tr>
<tr>
<td><strong>六阴朝阳</strong></td>
<td>&quot;夫阴阳皆阴也，何独辛金可朝阳&quot;</td>
<td>以偏概全，逻辑荒谬</td>
</tr>
</tbody></table>
<hr>
<h2>五、命造实例速记（六个命造核心结论）</h2>
<table>
<thead>
<tr>
<th>命造</th>
<th>四柱</th>
<th>格局</th>
<th>成败关键</th>
<th>任注断语</th>
</tr>
</thead>
<tbody><tr>
<td><strong>第一造</strong></td>
<td>癸卯 己未 乙未 丙子</td>
<td>正官格</td>
<td>印星有力贴身相生，格局成</td>
<td>科甲出身，仕至藩臬</td>
</tr>
<tr>
<td><strong>第二造</strong></td>
<td>己丑 丁丑 乙丑 丙子</td>
<td>正官格</td>
<td>印星无根，湿土晦火，格局破</td>
<td>功名未遂，耗散资财，刑妻克子</td>
</tr>
<tr>
<td><strong>第三造</strong></td>
<td>戊寅 甲子 壬子 辛亥</td>
<td>印绶格</td>
<td>官星无根太弱，才华露而不能纳牝</td>
<td>品行超群，才华卓越</td>
</tr>
<tr>
<td><strong>第四造</strong></td>
<td>辛酉 丁酉 丁酉 辛亥</td>
<td>印绶格</td>
<td>壬水药病相济，格局纯粹</td>
<td>联登甲第，名利两全</td>
</tr>
<tr>
<td><strong>第五造</strong></td>
<td>辛酉 丁酉 丁酉 丙午</td>
<td>印绶格</td>
<td>无壬水药，丙火助日夺财，格局破</td>
<td>机杼空抛，株守待兔</td>
</tr>
<tr>
<td><strong>第六造</strong></td>
<td>丁卯 壬寅 辛亥 丙申</td>
<td>印绶格</td>
<td>亥壬水相济，格局纯粹</td>
<td>青蚨十万，化成蓝袍</td>
</tr>
</tbody></table>
<p><strong>命造对比记忆法</strong>：</p>
<ul>
<li>一、四造成 → 印星有力，用神得位</li>
<li>二、五造败 → 印星无力或被夺，格局破败</li>
<li>三、六造中 → 格局有瑕疵，中上之命</li>
</ul>
<hr>
<h2>六、格局清浊判断速记</h2>
<pre><code>格局清 → 纯清（百无一二）→ 上等命
格局浊 → 驳杂（十有八九）→ 中下命

清浊判断四要素：
  ① 用神是否有力（得根/透干/得位）
  ② 忌神是否受制（有无制化）
  ③ 气势是否流通（无阻隔/逆乱）
  ④ 财官印是否纯粹（不混杂）
</code></pre>
<hr>
<h2>七、常见错误警示</h2>
<table>
<thead>
<tr>
<th>错误类型</th>
<th>正确做法</th>
</tr>
</thead>
<tbody><tr>
<td>执杂气财官为奇格</td>
<td>杂气月仍取本气为格</td>
</tr>
<tr>
<td>以神煞论命为主</td>
<td>神煞为辅助，八格为根本</td>
</tr>
<tr>
<td>忽略月令透干条件</td>
<td>必须先观月令透干</td>
</tr>
<tr>
<td>禄刃月仍套八格</td>
<td>禄刃月无格可取，另寻透干</td>
</tr>
<tr>
<td>以纳音定格局</td>
<td>纳音诸法不经，不可执</td>
</tr>
<tr>
<td>格局破败仍认贵</td>
<td>格局破则命不贵</td>
</tr>
</tbody></table>
<hr>
<h2>八、任注名句背诵</h2>
<blockquote>
<p><strong>1.</strong> 八格者，命中之真理也
<strong>2.</strong> 先观月令所得何支，次看天干透出何神，再究司令以定真假
<strong>3.</strong> 格局有正有变，正者兼五行之常礼，变者必从五行之气
<strong>4.</strong> 若月逢禄刃，无格可取
<strong>5.</strong> 格局真纯者，百无一二；破败而杂气者，十有八九
<strong>6.</strong> 由是数造观之，格局不可执一论也
<strong>7.</strong> 格正用真，行运不悖，名利自如其人；格破用损，行运又悖，此乃有命无运</p>
</blockquote>
<hr>
<h2>九、参考资料</h2>
<ul>
<li>《滴天髓》任铁樵注疏（徐乐吾评注本）</li>
<li>《子平真诠》沈孝瞻</li>
<li>《渊海子平》</li>
</ul>
`,dizhi:`<h1>《滴天髓》·地支篇</h1>
<blockquote>
<p><strong>原著：</strong> 《滴天髓》上篇第八章·地支
<strong>正文：</strong> 阳支动且强，速达显灾祥；阴支静且专，否泰每经年</p>
</blockquote>
<hr>
<h2>一、核心定理</h2>
<h3>定理一：阳动阴静</h3>
<pre><code>阳支（子丑寅卯辰巳）→ 动且强 → 气化流行，变化快；吉凶速达
阴支（午未申酉戌亥）→ 静且专 → 质凝形聚，变化慢；否泰经年乃见
</code></pre>
<h3>定理二：藏干主次规则</h3>
<pre><code>本气为重（最重要）
  ↓
中气得时令可用（次要）
  ↓
余气非当令不足为用（最次）
</code></pre>
<h3>定理三：冲合总纲（任注精华）</h3>
<pre><code>冲者，必是相克
支神以冲为重，刑与穿总非紧要
四库之冲，必须冲开，非闭藏之谓
冲有吉有凶，不可执一
</code></pre>
<h3>定理四：生方旺方</h3>
<pre><code>生方怕动（亥子寅卯辰）→ 气化速变
旺方忌冲（申酉戌）→ 本气当令，冲开反吉
</code></pre>
<hr>
<h2>二、藏干速查表</h2>
<table>
<thead>
<tr>
<th>地支</th>
<th>本气</th>
<th>中气</th>
<th>余气</th>
</tr>
</thead>
<tbody><tr>
<td>子</td>
<td>癸（官）</td>
<td>—</td>
<td>—</td>
</tr>
<tr>
<td>丑</td>
<td>己（财）</td>
<td>癸（印）</td>
<td>辛（偏印）</td>
</tr>
<tr>
<td>寅</td>
<td>甲（比）</td>
<td>丙（偏印）</td>
<td>戊（财）</td>
</tr>
<tr>
<td>卯</td>
<td>乙（财）</td>
<td>—</td>
<td>—</td>
</tr>
<tr>
<td>辰</td>
<td>戊（官）</td>
<td>乙（偏财）</td>
<td>癸（印）</td>
</tr>
<tr>
<td>巳</td>
<td>丙（偏印）</td>
<td>庚（杀）</td>
<td>戊（财）</td>
</tr>
<tr>
<td>午</td>
<td>丁（伤）</td>
<td>己（印）</td>
<td>—</td>
</tr>
<tr>
<td>未</td>
<td>己（财）</td>
<td>丁（伤）</td>
<td>乙（偏印）</td>
</tr>
<tr>
<td>申</td>
<td>庚（比）</td>
<td>壬（偏印）</td>
<td>戊（偏财）</td>
</tr>
<tr>
<td>酉</td>
<td>辛（官）</td>
<td>—</td>
<td>—</td>
</tr>
<tr>
<td>戌</td>
<td>戊（官）</td>
<td>辛（印）</td>
<td>丁（伤）</td>
</tr>
<tr>
<td>亥</td>
<td>壬（偏印）</td>
<td>甲（劫）</td>
<td>—</td>
</tr>
</tbody></table>
<hr>
<h2>三、六冲深度解析</h2>
<table>
<thead>
<tr>
<th>六冲</th>
<th>本气相克</th>
<th>冲开（旺相）→ 吉</th>
<th>冲坏（衰败）→ 凶</th>
</tr>
</thead>
<tbody><tr>
<td>子午</td>
<td>癸冲丁己</td>
<td>官印发越</td>
<td>伤病是非</td>
</tr>
<tr>
<td>丑未</td>
<td>己冲己</td>
<td>金库开，财发</td>
<td>印星学业损</td>
</tr>
<tr>
<td>寅申</td>
<td>甲冲庚</td>
<td>金闭开，财官动</td>
<td>木根破，体弱</td>
</tr>
<tr>
<td>卯酉</td>
<td>乙冲辛</td>
<td>金质开，财动</td>
<td>木气损，伤身</td>
</tr>
<tr>
<td>辰戌</td>
<td>戊冲戊</td>
<td>水库开，印发</td>
<td>火库破，凶</td>
</tr>
<tr>
<td>巳亥</td>
<td>丙冲壬</td>
<td>水闭开，才动</td>
<td>火根耗，心神损</td>
</tr>
</tbody></table>
<hr>
<h2>四、三合三会力量排序</h2>
<pre><code>三会方（力量最大，难成）&gt; 三合局 &gt; 半三合
</code></pre>
<table>
<thead>
<tr>
<th>三合局</th>
<th>合成</th>
<th>力量</th>
</tr>
</thead>
<tbody><tr>
<td>申子辰</td>
<td>水局</td>
<td>★★★★★</td>
</tr>
<tr>
<td>亥卯未</td>
<td>木局</td>
<td>★★★★★</td>
</tr>
<tr>
<td>寅午戌</td>
<td>火局</td>
<td>★★★★★</td>
</tr>
<tr>
<td>巳酉丑</td>
<td>金局</td>
<td>★★★★★</td>
</tr>
</tbody></table>
<hr>
<h2>五、冲吉凶判断树</h2>
<pre><code>所冲之地支是否为用神所在？
  ↓是
  用神旺相？→ 冲起作用 → 大吉
  用神休囚？→ 冲坏用神 → 大凶

所冲之地支是否为忌神所在？
  ↓是
  忌神旺相？→ 冲坏忌神 → 大吉（去忌得清）
  忌神休囚？→ 冲起忌神 → 凶（忌神借势）

冲的是四库（辰戌丑未）吗？
  ↓是
  冲开 → 吉
  冲坏 → 凶
</code></pre>
<hr>
<h2>六、必须背诵名句</h2>
<blockquote>
<p><strong>1.</strong> 阳支动且强，速达显灾祥；阴支静且专，否泰每经年</p>
</blockquote>
<blockquote>
<p><strong>2.</strong> 冲者，必是相克。及乎四库兄弟之冲，必须冲开，非闭藏之谓</p>
</blockquote>
<blockquote>
<p><strong>3.</strong> 支神以冲为重，刑与穿总非紧要</p>
</blockquote>
<blockquote>
<p><strong>4.</strong> 生方怕动，旺方忌冲</p>
</blockquote>
<hr>
<h2>七、自测题</h2>
<table>
<thead>
<tr>
<th>题号</th>
<th>问题</th>
<th>参考答案</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>阳支和阴支各有哪些？根本区别？</td>
<td>子丑寅卯辰巳 / 午未申酉戌亥；动强 vs 静专</td>
</tr>
<tr>
<td>2</td>
<td>任注批判了哪四个冲合谬说？</td>
<td>金水冲木火/冲喜合/冲为凶/刑穿为主</td>
</tr>
<tr>
<td>3</td>
<td>&quot;生方怕动，旺方忌冲&quot;各指哪些？</td>
<td>生方=亥子寅卯辰；旺方=申酉戌</td>
</tr>
<tr>
<td>4</td>
<td>子午冲的吉凶如何判断？</td>
<td>冲起官印则吉，冲坏则凶</td>
</tr>
<tr>
<td>5</td>
<td>&quot;本气为重&quot;为何重要？</td>
<td>余气非当令不足为用</td>
</tr>
</tbody></table>
`,kundao:`<h1>《滴天髓》·坤道篇（地道）</h1>
<blockquote>
<p><strong>原著：</strong> 《滴天髓》上篇第二章·坤道
<strong>正文：</strong> 坤元合德机缄通，五气偏全会凶吉</p>
</blockquote>
<hr>
<h2>一、核心定理</h2>
<h3>定理一：乾坤对应</h3>
<pre><code>乾元 = 天元 = 主健 = 万物资始
坤元 = 地元 = 主顺 = 万物资生
</code></pre>
<h3>定理二：坤道核心</h3>
<pre><code>坤元合德 → 地支与天干配合
机缄通   → 藏干流通无阻
五气偏全 → 吉凶判定标准
</code></pre>
<h3>定理三：偏全定吉凶</h3>
<pre><code>五气偏全 → 吉（命吉）
五气偏枯 → 凶（命凶）
</code></pre>
<h3>定理四：刚柔与地支</h3>
<pre><code>地有刚柔
  ├─ 刚：寅申巳亥（驿马冲动）
  ├─ 柔：子午卯酉（专位静守）
  └─ 中：辰戌丑未（杂气）
刚柔相济 → 中和之命
</code></pre>
<hr>
<h2>二、开篇正文解读</h2>
<blockquote>
<p>坤元合德机缄通，五气偏全会凶吉</p>
</blockquote>
<table>
<thead>
<tr>
<th>关键词</th>
<th>命理含义</th>
</tr>
</thead>
<tbody><tr>
<td>坤元</td>
<td>地之元始，地支之根本</td>
</tr>
<tr>
<td>合德</td>
<td>与天德相合，天地配合</td>
</tr>
<tr>
<td>机缄通</td>
<td>造化机关通畅，藏干流通</td>
</tr>
<tr>
<td>五气偏全</td>
<td>五行在地支分布有偏全</td>
</tr>
<tr>
<td>会凶吉</td>
<td>偏全则吉，偏枯则凶</td>
</tr>
</tbody></table>
<hr>
<h2>三、【原注】核心</h2>
<blockquote>
<p>地有刚柔，故五行生于东南西北中，与天合德，而感其机缄之妙。赋于人者，有偏全之不一，故吉凶定于此。</p>
</blockquote>
<ul>
<li>地支有刚柔两面</li>
<li>五行生于东南西北中（四维+中央土）</li>
<li>偏全决定吉凶</li>
</ul>
<hr>
<h2>四、【任氏曰】核心</h2>
<blockquote>
<p>乾主健，坤主顺，顺以承天，德与天合；昭融覆盖，耨育万物。五行之气有偏全，故万物之命有吉凶。</p>
</blockquote>
<ul>
<li>乾刚坤柔，天地相合</li>
<li>坤顺承天，德与天合</li>
<li>五气偏全定吉凶</li>
</ul>
<hr>
<h2>五、命局分析三步法</h2>
<h3>第一步：观地支刚柔</h3>
<pre><code>刚 → 寅、申、巳、亥
柔 → 子、午、卯、酉
中 → 辰戌丑未
</code></pre>
<h3>第二步：观五气偏全</h3>
<pre><code>五行齐全 → 有根基
缺一五行 → 有缺陷
缺二五行 → 偏枯
</code></pre>
<h3>第三步：观机缄通塞</h3>
<pre><code>机缄通 → 藏干相生，无冲刑破害
机缄塞 → 藏干相克，有冲刑破害
</code></pre>
<hr>
<h2>六、必须背诵的名句</h2>
<blockquote>
<p><strong>1.</strong> 坤元合德机缄通，五气偏全会凶吉
<strong>2.</strong> 乾主健，坤主顺，顺以承天，德与天合
<strong>3.</strong> 五行之气有偏全，故万物之命有吉凶</p>
</blockquote>
<hr>
<h2>七、自测题</h2>
<table>
<thead>
<tr>
<th>题号</th>
<th>问题</th>
<th>参考答案</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>坤元与乾元的关系是什么？</td>
<td>乾主健，坤主顺</td>
</tr>
<tr>
<td>2</td>
<td>&quot;机缄通&quot;指的是什么？</td>
<td>藏干流通无阻</td>
</tr>
<tr>
<td>3</td>
<td>五气偏全与吉凶的关系？</td>
<td>偏全则吉，偏枯则凶</td>
</tr>
</tbody></table>
`,liqi:`<h1>《滴天髓》·理气篇</h1>
<blockquote>
<p><strong>原著：</strong> 《滴天髓》上篇第五章·理气
<strong>正文：</strong> 理承气行岂有常，进兮退兮宜抑扬</p>
</blockquote>
<hr>
<h2>一、核心定理</h2>
<h3>定理一：进退有常</h3>
<pre><code>进之极 → 退之机
退之极 → 进之机
  ↓
进退循环，无有常
</code></pre>
<h3>定理二：旺相休囚</h3>
<pre><code>相 = 将来者进（未来之星）
旺 = 进而当令（正当时令）
休 = 功成者退（功成退位）
囚 = 退而无气（退而无用）
</code></pre>
<h3>定理三：日主喜忌</h3>
<pre><code>日主/喜神 → 宜旺相，不宜休囚
凶煞/忌神 → 宜休囚，不宜旺相
</code></pre>
<h3>定理四：相与旺</h3>
<pre><code>旺 = 极盛之物 → 退反速
相 = 方长之气 → 进无涯
</code></pre>
<hr>
<h2>二，开篇正文</h2>
<blockquote>
<p>理承气行岂有常，进兮退兮宜抑扬</p>
</blockquote>
<table>
<thead>
<tr>
<th>关键词</th>
<th>命理含义</th>
</tr>
</thead>
<tbody><tr>
<td>理承气行</td>
<td>理随气行，气为理用</td>
</tr>
<tr>
<td>岂有常</td>
<td>气行无常</td>
</tr>
<tr>
<td>进退</td>
<td>旺相休囚的转化</td>
</tr>
<tr>
<td>宜抑扬</td>
<td>进则抑，退则扬</td>
</tr>
</tbody></table>
<hr>
<h2>三、【任氏曰】核心</h2>
<h3>进退定义</h3>
<table>
<thead>
<tr>
<th>状态</th>
<th>定义</th>
<th>结果</th>
</tr>
</thead>
<tbody><tr>
<td>相</td>
<td>将来者进</td>
<td>进无涯</td>
</tr>
<tr>
<td>旺</td>
<td>进而当令</td>
<td>退速</td>
</tr>
<tr>
<td>休</td>
<td>功成者退</td>
<td>未速复</td>
</tr>
<tr>
<td>囚</td>
<td>退而无气</td>
<td>渐将生</td>
</tr>
</tbody></table>
<h3>日主喜忌</h3>
<table>
<thead>
<tr>
<th>类型</th>
<th>宜</th>
<th>不宜</th>
</tr>
</thead>
<tbody><tr>
<td>日主/喜神</td>
<td>旺相</td>
<td>休囚</td>
</tr>
<tr>
<td>凶煞/忌神</td>
<td>休囚</td>
<td>旺相</td>
</tr>
</tbody></table>
<hr>
<h2>四、两造对比</h2>
<table>
<thead>
<tr>
<th>对比项</th>
<th>第一造</th>
<th>第二造</th>
</tr>
</thead>
<tbody><tr>
<td>四柱</td>
<td>丁亥 庚戌 甲辰 壬申</td>
<td>乙亥 庚辰 甲戌 壬申</td>
</tr>
<tr>
<td>甲木</td>
<td>进气</td>
<td>退气</td>
</tr>
<tr>
<td>结果</td>
<td>科甲连登</td>
<td>寒衿</td>
</tr>
</tbody></table>
<p><strong>关键</strong>：辰湿土生木 vs 戌燥土不生</p>
<hr>
<h2>五、实战四步法</h2>
<pre><code>第一步：审月令节气
  → 定五行旺相休囚

第二步：明进退之机
  → 进气？退气？
  → 进极则退，退极则进

第三步：论日主宜忌
  → 日主宜旺相
  → 忌神宜休囚

第四步：察天干地支
  → 生克制化是否得宜
</code></pre>
<hr>
<h2>六、必须背诵的名句</h2>
<blockquote>
<p><strong>1.</strong> 理承气行岂有常，进兮退兮宜抑扬
<strong>2.</strong> 将来者进，是谓相；进而当令，是谓旺；功成者退，是谓休；退而无气，是谓囚
<strong>3.</strong> 相妙于旺，旺则极盛之物，其退反速；相则方长之气，其进无涯也
<strong>4.</strong> 进退之机，不可不知也</p>
</blockquote>
<hr>
<h2>七、自测题</h2>
<table>
<thead>
<tr>
<th>题号</th>
<th>问题</th>
<th>参考答案</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>旺相休囚定义？</td>
<td>相进/旺当令/休功退/囚退无气</td>
</tr>
<tr>
<td>2</td>
<td>相与旺的区别？</td>
<td>相进无涯，旺退速</td>
</tr>
<tr>
<td>3</td>
<td>两造差异原因？</td>
<td>甲木进气vs退气</td>
</tr>
<tr>
<td>4</td>
<td>日主喜忌宜什么？</td>
<td>日主宜旺相，忌神宜休囚</td>
</tr>
</tbody></table>
`,peihe:`<h1>《滴天髓》·配合篇</h1>
<blockquote>
<p><strong>原著：</strong> 《滴天髓》上篇第六章·配合
<strong>正文：</strong> 配合干支仔细详，定人福祸与灾祥</p>
</blockquote>
<hr>
<h2>一、核心定理</h2>
<h3>定理一：配合总纲</h3>
<pre><code>配合干支仔细详
  ↓
审日主衰旺
明用神喜忌
  ↓
当抑则抑，当扶则扶
去留舒配，取裁确当
</code></pre>
<h3>定理二：用神不拘名</h3>
<pre><code>用神不拘财、官、印绶、比劫、食伤、枭杀
  ↓
皆可为用
勿以名之美者为佳，恶者为憎
</code></pre>
<h3>定理三：祸福判定</h3>
<pre><code>配合有情 → 福
配合无情 → 祸
配合失当 → 灾祥
</code></pre>
<hr>
<h2>二、开篇正文</h2>
<blockquote>
<p>配合干支仔细详，定人福祸与灾祥。</p>
</blockquote>
<table>
<thead>
<tr>
<th>关键词</th>
<th>含义</th>
<th>命理指向</th>
</tr>
</thead>
<tbody><tr>
<td>配合</td>
<td>天干地支相互配合</td>
<td>干支非孤立</td>
</tr>
<tr>
<td>仔细详</td>
<td>仔细推详</td>
<td>非粗略论断</td>
</tr>
<tr>
<td>福祸灾祥</td>
<td>吉凶祸福</td>
<td>干支配合定吉凶</td>
</tr>
</tbody></table>
<hr>
<h2>三、任氏曰核心要点</h2>
<h3>辟谬之要领</h3>
<p>配合篇是任铁樵辟谬的核心章节——专批判专从奇格异局神杀论命。</p>
<h3>正论三步</h3>
<blockquote>
<p>配合干支，必须正理搜寻详推，与衰旺喜忌之理，不可将四柱干支弗论。</p>
</blockquote>
<h3>四步配合法</h3>
<pre><code>第一步：审日主衰旺
  → 日主得令否？得地否？得势否？

第二步：明用神喜忌
  → 何神为用？何神为忌？
  → 用神是否有力？

第三步：论干支配合
  → 天干是否相生有情？
  → 地支是否互相护卫？
  → 忌神是否受制？

第四步：断祸福灾祥
  → 用神得位则福
  → 忌神猖狂则祸
  → 配合失当则灾祥
</code></pre>
<hr>
<h2>四、两造对比速记</h2>
<table>
<thead>
<tr>
<th>四柱</th>
<th>俗论</th>
<th>正论</th>
</tr>
</thead>
<tbody><tr>
<td>甲子 戊辰 庚申 壬午</td>
<td>三奇拱贵</td>
<td>假神庸碌</td>
</tr>
<tr>
<td>丙子 己亥 乙丑 壬午</td>
<td>一无可取</td>
<td>有病得药</td>
</tr>
</tbody></table>
<p><strong>核心规律：</strong></p>
<ul>
<li>官星被伤 → 假神庸碌</li>
<li>有病得药 → 青云直上</li>
</ul>
<hr>
<h2>五、必须背诵名句</h2>
<blockquote>
<p><strong>1.</strong> 配合干支仔细详，定人福祸与灾祥</p>
</blockquote>
<blockquote>
<p><strong>2.</strong> 命中至理，只存用神，不拘财、官、印绶、比劫、食伤、枭杀，皆可为用</p>
</blockquote>
<blockquote>
<p><strong>3.</strong> 当抑则抑，当扶则扶，所谓去留舒配，取裁确当</p>
</blockquote>
<hr>
<h2>六、自测题</h2>
<table>
<thead>
<tr>
<th>题号</th>
<th>问题</th>
<th>参考答案</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>配合篇的核心是什么？</td>
<td>干支配合为论命之要</td>
</tr>
<tr>
<td>2</td>
<td>&quot;只存用神&quot;为何不论名之美恶？</td>
<td>用神不拘财官印绶食伤枭杀</td>
</tr>
<tr>
<td>3</td>
<td>第一造为何庸碌？</td>
<td>官星被伤，甲木假神</td>
</tr>
<tr>
<td>4</td>
<td>第二造为何贵？</td>
<td>有病得药，伤官秀气</td>
</tr>
<tr>
<td>5</td>
<td>&quot;有病得药&quot;指什么？</td>
<td>己土止水卫火，有病有药</td>
</tr>
</tbody></table>
`,rendao:`<h1>《滴天髓》·人道篇</h1>
<blockquote>
<p><strong>原著：</strong> 《滴天髓》上篇第三章·人道
<strong>正文：</strong> 戴天履地人为贵，顺则吉兮凶则悖</p>
</blockquote>
<hr>
<h2>一、核心定理</h2>
<h3>定理一：人贵于万物</h3>
<pre><code>人得五行之全（土居中央，木火金水中气）→ 为贵
万物各得五行之一偏 → 贱
</code></pre>
<h3>定理二：顺悖定吉凶</h3>
<pre><code>顺 = 接续相生 = 有情 = 吉
悖 = 反克为害 = 无情 = 凶
</code></pre>
<h3>定理三：中和为贵</h3>
<pre><code>命贵中和，偏枯终有损
理求平正，奇异不足为凭
</code></pre>
<h3>定理四：救应四法（日主被克时）</h3>
<pre><code>① 地支生助日主（生）
② 天干化忌（化）
③ 地支通根（根）
④ 天干制忌（制）
有一种则吉，全无则凶
</code></pre>
<hr>
<h2>二、开篇正文</h2>
<blockquote>
<p>戴天履地人为贵，顺则吉兮凶则悖</p>
</blockquote>
<table>
<thead>
<tr>
<th>关键词</th>
<th>命理含义</th>
</tr>
</thead>
<tbody><tr>
<td>戴天履地</td>
<td>人立于天地之间</td>
</tr>
<tr>
<td>人为贵</td>
<td>人禀五行之全</td>
</tr>
<tr>
<td>顺则吉</td>
<td>五行相生有情则吉</td>
</tr>
<tr>
<td>凶则悖</td>
<td>五行反克无情则凶</td>
</tr>
</tbody></table>
<hr>
<h2>三、【原注】核心</h2>
<blockquote>
<p>万物莫不得五行而戴天履地，惟人得五行之全，故为贵。其有吉凶之不一者，以其得于五行之顺与悖也。</p>
</blockquote>
<ul>
<li>人贵于万物：人得五行之全</li>
<li>吉凶各异：顺悖之别</li>
</ul>
<hr>
<h2>四、【任氏曰】核心</h2>
<h3>4.1 顺悖四种情况</h3>
<p><strong>顺（吉）：</strong></p>
<ul>
<li>天干气弱，地支生之</li>
<li>地支神衰，天干辅之</li>
</ul>
<p><strong>悖（凶）：</strong></p>
<ul>
<li>天干衰弱，地支抑之</li>
<li>地支气弱，天干克之</li>
</ul>
<h3>4.2 木被金克救应</h3>
<pre><code>木畏金克 → 四种救应：
① 地支亥子水生木
② 天干壬癸水化金
③ 地支寅卯木通根
④ 天干丙丁火制金
有一种则吉，全无则凶
</code></pre>
<h3>4.3 偏枯批判</h3>
<pre><code>四戊午、四癸亥等皆偏枯论
谬书妄称为圣帝之造，皆后人讹传
</code></pre>
<hr>
<h2>五、命造实例</h2>
<h3>史姓四壬寅</h3>
<table>
<thead>
<tr>
<th>项目</th>
<th>内容</th>
</tr>
</thead>
<tbody><tr>
<td>四柱</td>
<td>壬寅 壬寅 壬寅 壬寅</td>
</tr>
<tr>
<td>问题</td>
<td>寅中火土之气无从引出</td>
</tr>
<tr>
<td>早年</td>
<td>幼遭孤苦，中受饥寒</td>
</tr>
<tr>
<td>中年</td>
<td>运转南方，引出寅中火气，发财</td>
</tr>
<tr>
<td>晚年</td>
<td>无子，家业分夺</td>
</tr>
<tr>
<td>结论</td>
<td>偏枯终有损</td>
</tr>
</tbody></table>
<hr>
<h2>六、必须背诵的名句</h2>
<blockquote>
<p><strong>1.</strong> 戴天履地人为贵，顺则吉兮凶则悖
<strong>2.</strong> 万物莫不得五行而戴天履地，惟人得五行之全，故为贵
<strong>3.</strong> 顺者接续相生，悖者反克为害，故吉凶判然
<strong>4.</strong> 命贵中和，偏枯终有损；理求平正，奇异不足为凭</p>
</blockquote>
<hr>
<h2>七、自测题</h2>
<table>
<thead>
<tr>
<th>题号</th>
<th>问题</th>
<th>参考答案</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>人为何为贵？</td>
<td>得五行之全</td>
</tr>
<tr>
<td>2</td>
<td>顺与悖的本质？</td>
<td>相生有情 vs 反克无情</td>
</tr>
<tr>
<td>3</td>
<td>木被金克的四种救应？</td>
<td>生、化、根、制</td>
</tr>
<tr>
<td>4</td>
<td>四壬寅命局的问题？</td>
<td>寅中火土无从引出</td>
</tr>
<tr>
<td>5</td>
<td>&quot;奇异不足为凭&quot;指什么？</td>
<td>偏枯之命非贵</td>
</tr>
</tbody></table>
`,tiandao:`<h1>《滴天髓》·天道篇</h1>
<blockquote>
<p><strong>原著：</strong> 《滴天髓》上篇第一章·天道
<strong>注疏：</strong> 任铁樵（徐乐吾评注本）
<strong>正文：</strong> 欲识三元万法宗，先观帝载与神功
<strong>本章字数：</strong> 223字</p>
</blockquote>
<hr>
<h2>一、核心定理（必须背诵）</h2>
<h3>定理一：三元定义</h3>
<pre><code>天元 = 天干（十干）→ 显用于外
地元 = 地支（十二支）→ 根基于内
人元 = 地支中所藏之干 → 通变于中
</code></pre>
<h3>定理二：天道规律</h3>
<pre><code>天有阴阳
  ↓
春木、夏火、秋金、冬水、季土
  ↓
随乎时节，显其神功
  ↓
命中天地人三元之理，悉本于此
</code></pre>
<h3>定理三：万法归宗</h3>
<pre><code>万法宗 = 三元之理
  → 无论命局如何变化，总不越此三元之理
  → 所有命理方法皆源于三元
</code></pre>
<hr>
<h2>二、原文逐句解析</h2>
<h3>2.1 开篇正文</h3>
<blockquote>
<p><strong>原文：</strong> 欲识三元万法宗，先观帝载与神功。</p>
</blockquote>
<table>
<thead>
<tr>
<th>关键词</th>
<th>含义</th>
<th>命理指向</th>
</tr>
</thead>
<tbody><tr>
<td><strong>三元</strong></td>
<td>天元（天干）、地元（地支）、人元（藏干）</td>
<td>三元是论命的最小单位</td>
</tr>
<tr>
<td><strong>万法宗</strong></td>
<td>万千论命方法的根本宗源</td>
<td>所有命理理论皆源于此</td>
</tr>
<tr>
<td><strong>帝载</strong></td>
<td>帝，天帝；载，承载</td>
<td>引申为阴阳、天地之道</td>
</tr>
<tr>
<td><strong>神功</strong></td>
<td>神妙的功用</td>
<td>五行四时运行之功</td>
</tr>
</tbody></table>
<h3>2.2 【原注】详解</h3>
<blockquote>
<p><strong>原文：</strong> 天有阴阳，故春木、夏火、秋金、冬水、季土，随乎时节，显其神功，命中天地人三元之理，悉本于此。</p>
</blockquote>
<table>
<thead>
<tr>
<th>关键词</th>
<th>含义</th>
<th>命理指向</th>
</tr>
</thead>
<tbody><tr>
<td><strong>天有阴阳</strong></td>
<td>天道分阴阳两面</td>
<td>阴阳是天道之本</td>
</tr>
<tr>
<td><strong>春木</strong></td>
<td>春季木气当令</td>
<td>五行随季节显功用</td>
</tr>
<tr>
<td><strong>夏火</strong></td>
<td>夏季火气当令</td>
<td>五行随季节显功用</td>
</tr>
<tr>
<td><strong>秋金</strong></td>
<td>秋季金气当令</td>
<td>五行随季节显功用</td>
</tr>
<tr>
<td><strong>冬水</strong></td>
<td>冬季水气当令</td>
<td>五行随季节显功用</td>
</tr>
<tr>
<td><strong>季土</strong></td>
<td>四季末月土气当令</td>
<td>土寄四隅，平衡四方</td>
</tr>
<tr>
<td><strong>显其神功</strong></td>
<td>显现五行在不同季节的功用</td>
<td>四时五行各有旺衰</td>
</tr>
</tbody></table>
<h3>2.3 【任氏曰】详解</h3>
<blockquote>
<p><strong>原文：</strong> 天干为天元，地支为地元，支中所藏为人元。人之命命，万有不齐，总不越此三元之理，所谓万法宗也。</p>
</blockquote>
<table>
<thead>
<tr>
<th>关键词</th>
<th>含义</th>
<th>命理指向</th>
</tr>
</thead>
<tbody><tr>
<td><strong>天干为天元</strong></td>
<td>十个天干代表天元</td>
<td>天干是命局的显用层面</td>
</tr>
<tr>
<td><strong>地支为地元</strong></td>
<td>十二地支代表地元</td>
<td>地支是命局的根基层面</td>
</tr>
<tr>
<td><strong>支中所藏为人元</strong></td>
<td>地支中藏的干为人元</td>
<td>人元是地支的内在气机</td>
</tr>
<tr>
<td><strong>万有不齐</strong></td>
<td>世间万象各有不同</td>
<td>命局千变万化</td>
</tr>
<tr>
<td><strong>总不越此三元之理</strong></td>
<td>始终不离开三元原理</td>
<td>三元是命理的总纲</td>
</tr>
</tbody></table>
<hr>
<h2>三、三元关系图</h2>
<pre><code>┌─────────────────────────────────────────┐
│            三元关系图                    │
├─────────────────────────────────────────┤
│                                         │
│     天元（天干） ──────→ 显用于外        │
│          ↓                ↓            │
│     人元（藏干） ←────── 通变于中        │
│          ↓                ↓            │
│     地元（地支） ←────── 根基于内        │
│                                         │
│     三者合一 → 命局完整                  │
│     三者配合 → 吉凶判定                  │
│                                         │
└─────────────────────────────────────────┘
</code></pre>
<hr>
<h2>四、核心命理公式</h2>
<h3>公式一：三元本体论</h3>
<pre><code>天元（天干） + 地元（地支） + 人元（藏干） = 完整命局
    ↓              ↓              ↓
   显用           根基           通变
</code></pre>
<h3>公式二：天道运行论</h3>
<pre><code>天（阳） + 地（阴） + 人（中和） = 完整天道
  ↓         ↓          ↓
春夏木火  秋冬金水   季土调和
  ↓         ↓          ↓
生长收藏   收敛封藏   平衡转化
</code></pre>
<h3>公式三：万法归宗论</h3>
<pre><code>三元为宗 → 万法皆从此出
    ↓
观察阴阳 → 审察五行 → 判定三元配合 → 推断命局吉凶
</code></pre>
<hr>
<h2>五、三元在命局分析中的应用</h2>
<h3>5.1 天元分析（三步）</h3>
<pre><code>第一步：看天干透出何神
  → 确定命局显用的十神
  → 判断命局的主要矛盾

第二步：看天干之间的生克制化
  → 判断天元是否清纯
  → 判断天元是否有情

第三步：看天干与地支的关系
  → 判断天元是否得根
  → 判断天元是否有底气
</code></pre>
<h3>5.2 人元分析（三步）</h3>
<pre><code>第一步：看地支藏何干
  → 确定地支内在的气机
  → 判断人元的力量大小

第二步：看人元是否透出天干
  → 判断人元能否显用
  → 判断命局是否有潜力

第三步：看人元与他支的关系
  → 判断人元是否能流通
  → 判断命局是否有生气
</code></pre>
<h3>5.3 地元分析（三步）</h3>
<pre><code>第一步：看地支本身五行
  → 确定命局的根基
  → 判断日主是否得地

第二步：看地支之间的刑冲合害
  → 判断地支是否稳定
  → 判断命局是否有动荡

第三步：看地支对天干的影响
  → 判断根基对显用的支撑
  → 判断命局是否有力
</code></pre>
<hr>
<h2>六、必须背诵的名句</h2>
<blockquote>
<p><strong>1.</strong> 欲识三元万法宗，先观帝载与神功
→ 点明三元是万法之宗</p>
</blockquote>
<blockquote>
<p><strong>2.</strong> 天有阴阳，故春木、夏火、秋金、冬水、季土，随乎时节，显其神功
→ 天道运行的基本规律</p>
</blockquote>
<blockquote>
<p><strong>3.</strong> 天干为天元，地支为地元，支中所藏为人元
→ 三元的基本定义</p>
</blockquote>
<blockquote>
<p><strong>4.</strong> 人之命命，万有不齐，总不越此三元之理
→ 万变不离其宗</p>
</blockquote>
<hr>
<h2>七、本章与后续章节的关联</h2>
<table>
<thead>
<tr>
<th>后续篇章</th>
<th>关联内容</th>
</tr>
</thead>
<tbody><tr>
<td><strong>地道</strong></td>
<td>三元中的地元，地支的根基作用</td>
</tr>
<tr>
<td><strong>人道</strong></td>
<td>三元中的人元，命局中的通变之机</td>
</tr>
<tr>
<td><strong>天干</strong></td>
<td>天元的详细展开</td>
</tr>
<tr>
<td><strong>地支</strong></td>
<td>地元的详细展开</td>
</tr>
<tr>
<td><strong>配合</strong></td>
<td>三元如何配合成格</td>
</tr>
<tr>
<td><strong>八格</strong></td>
<td>配合之后的格局论断</td>
</tr>
</tbody></table>
<hr>
<h2>八、自测题</h2>
<table>
<thead>
<tr>
<th>题号</th>
<th>问题</th>
<th>参考答案</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>三元指哪三元？</td>
<td>天元（天干）、地元（地支）、人元（藏干）</td>
</tr>
<tr>
<td>2</td>
<td>天道的核心规律是什么？</td>
<td>天有阴阳，四时有五行，五行随季节显功用</td>
</tr>
<tr>
<td>3</td>
<td>&quot;万法宗&quot;指的是什么？</td>
<td>三元之理是所有命理方法的根本宗源</td>
</tr>
<tr>
<td>4</td>
<td>天元与地元的关系是什么？</td>
<td>天元为显，地元为基，人元为通</td>
</tr>
<tr>
<td>5</td>
<td>春木、夏火、秋金、冬水、季土分别代表什么？</td>
<td>木火金水土随季节显神功</td>
</tr>
</tbody></table>
<hr>
<h2>九、参考资料</h2>
<ul>
<li>《滴天髓》任铁樵注疏（徐乐吾评注本）</li>
<li>《子平真诠》沈孝瞻</li>
<li>《渊海子平》</li>
</ul>
`,tiangan:`<h1>《滴天髓》·天干篇</h1>
<blockquote>
<p><strong>原著：</strong> 《滴天髓》上篇第七章·天干
<strong>正文：</strong> 五阳皆阳丙为最，五阴皆阴癸为至</p>
</blockquote>
<hr>
<h2>一、核心定理</h2>
<h3>定理一：十干分类</h3>
<pre><code>五阳干：甲、丙、戊、庚、壬（阳刚健动）
五阴干：乙、丁、己、辛、癸（阴柔顺静）
</code></pre>
<h3>定理二：丙癸为最</h3>
<pre><code>丙火 → 阳中之阳 → 纯阳之精，万物莫不由此而发
癸水 → 阴中之阴 → 纯阴之精，万物莫不由此而生
</code></pre>
<h3>定理三：五阳从气，五阴从势</h3>
<pre><code>五阳从气 → 不畏财杀之势
五阴从势 → 木盛从木，火盛从火，见势衰则忌
</code></pre>
<hr>
<h2>二、破世俗谬说</h2>
<p>任注批判世俗以拟象论十干（甲为梁栋、乙为花果等），指出：</p>
<blockquote>
<p>阳木 ≠ 死木，阴木 ≠ 活木，生死应从配合判断，非从天干阴阳属性。</p>
</blockquote>
<hr>
<h2>三、十干专论速记</h2>
<h3>甲木</h3>
<pre><code>甲木参天，脱胎要火。春不容金，秋不容土。
火炽乘龙，水宕骑虎。地润天和，植立千古。
要点：春要火，不容金；秋不容土；火炽坐辰，水宕坐寅
</code></pre>
<h3>乙木</h3>
<pre><code>乙木虽柔，刲羊解牛。怀丁抱丙，跨凤乘猴。
虚湿之地，骑马亦忧。藤萝系甲，可春可秋。
要点：刲羊解牛（丑未），藤萝系甲，可春可秋
</code></pre>
<h3>丙火</h3>
<pre><code>丙火猛烈，欺霜侮雪。能煅庚金，逢辛反怯。
土众成慈，水猖显节。虎马犬乡，甲木若来，必当焚灭。
要点：欺霜侮雪，煅庚；逢辛反怯（化水）；虎马犬乡畏甲
</code></pre>
<h3>丁火</h3>
<pre><code>丁火柔中，内性昭融。抱乙而孝，合壬而忠。
旺而不烈，衰而不穷，如有嫡母，可秋可冬。
要点：柔中昭融，抱乙孝，合壬忠；可秋可冬
</code></pre>
<h3>戊土</h3>
<pre><code>戊土固重，既中且正。静翕动辟，万物司命。
水润物生，火燥物病。若在艮坤，怕冲宜静。
要点：万物司命；水润则生，火燥则病；艮坤怕冲
</code></pre>
<h3>己土</h3>
<pre><code>己土卑湿，中正蓄藏。能收元阳之气，滋生万物。
要点：卑湿滋生，收元阳
</code></pre>
<h3>庚金</h3>
<pre><code>庚金带煞，刚健得水而清，得火而锐。
土润则生，土燥则润。
要点：带煞刚健；得水清，得火锐
</code></pre>
<h3>辛金</h3>
<pre><code>辛金软弱，温润而清。能扶社稷救生灵。
刚柔相济，秀气流行。
要点：软弱温清；扶社稷救生灵
</code></pre>
<h3>壬水</h3>
<pre><code>壬水通河，周流不滞。顺则相济，逆则冲激。
要点：通河泄金，周流不滞；从则相济
</code></pre>
<h3>癸水</h3>
<pre><code>癸水至弱，逢龙而化。化火为神，变坎为明。
要点：至弱从化；逢龙化火，化象斯真
</code></pre>
<hr>
<h2>四、甲乙对比精华</h2>
<table>
<thead>
<tr>
<th>特性</th>
<th>甲木</th>
<th>乙木</th>
</tr>
</thead>
<tbody><tr>
<td>本性</td>
<td>参天雄壮（阳）</td>
<td>甲之质（阴）</td>
</tr>
<tr>
<td>依赖</td>
<td>独立之木</td>
<td>藤萝之性</td>
</tr>
<tr>
<td>核心</td>
<td>地润天和</td>
<td>藤萝系甲</td>
</tr>
</tbody></table>
<hr>
<h2>五、必须背诵名句</h2>
<blockquote>
<p><strong>1.</strong> 五阳皆阳丙为最，五阴皆阴癸为至</p>
</blockquote>
<blockquote>
<p><strong>2.</strong> 五阳从气不从势，五阴从势无情义</p>
</blockquote>
<blockquote>
<p><strong>3.</strong> 论断诸干，如此之类，不一而足，当尽避之，以绝将来之谬</p>
</blockquote>
<hr>
<h2>六、自测题</h2>
<table>
<thead>
<tr>
<th>题号</th>
<th>问题</th>
<th>参考答案</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>五阳干和五阴干各有哪五个？</td>
<td>甲丙戊庚壬 / 乙丁己辛癸</td>
</tr>
<tr>
<td>2</td>
<td>&quot;丙最癸至&quot;的核心含义是什么？</td>
<td>丙为阳中之阳，癸为阴中之阴</td>
</tr>
<tr>
<td>3</td>
<td>&quot;藤萝系甲，可春可秋&quot;指什么情况？</td>
<td>天干透甲，地支藏寅</td>
</tr>
<tr>
<td>4</td>
<td>丙火为何&quot;逢辛反怯&quot;？</td>
<td>丙辛相合化水，合柔顺而寓和平</td>
</tr>
<tr>
<td>5</td>
<td>甲木&quot;春不容金&quot;的原因？</td>
<td>旺木欺金，衰金克旺木则木坚金缺</td>
</tr>
</tbody></table>
`,zhiming:`<h1>《滴天髓》·知命篇</h1>
<blockquote>
<p><strong>原著：</strong> 《滴天髓》上篇第四章·知命
<strong>正文：</strong> 要与人间开聋聩，顺逆之机须理会</p>
</blockquote>
<hr>
<h2>一、核心定理</h2>
<h3>定理一：知命之要</h3>
<pre><code>知命 = 理会顺逆之机
  ↓
顺者吉，逆者凶
</code></pre>
<h3>定理二：四句核心</h3>
<pre><code>用之为财不可劫
用之为官不可伤
用之印绶不可坏
用之食神不可夺
  ↓
关键在一&quot;用&quot;字
</code></pre>
<h3>定理三：旺极之命</h3>
<pre><code>旺之极者，宜泄不宜克
  ↓
顺其气势则吉
悖其性则凶
</code></pre>
<h3>定理四：水流之命</h3>
<pre><code>昆仑之水，可顺而不可逆
  ↓
顺其流则吉
逆其流则凶
</code></pre>
<hr>
<h2>二、开篇正文</h2>
<blockquote>
<p>要与人间开聋聩，顺逆之机须理会</p>
</blockquote>
<table>
<thead>
<tr>
<th>关键词</th>
<th>命理含义</th>
</tr>
</thead>
<tbody><tr>
<td>开聋聩</td>
<td>使人明命理</td>
</tr>
<tr>
<td>顺逆之机</td>
<td>顺逆的关键</td>
</tr>
<tr>
<td>须理会</td>
<td>理解顺逆为论命之要</td>
</tr>
</tbody></table>
<hr>
<h2>三、【任氏曰】批判</h2>
<h3>批判五种谬说</h3>
<table>
<thead>
<tr>
<th>谬说</th>
<th>批判</th>
</tr>
</thead>
<tbody><tr>
<td>奇格异局</td>
<td>非关命理休咎</td>
</tr>
<tr>
<td>桃花咸池</td>
<td>受责鬼神</td>
</tr>
<tr>
<td>金锁铁蛇</td>
<td>忧人父母</td>
</tr>
<tr>
<td>总以财官为喜</td>
<td>不知财官为六亲之名</td>
</tr>
<tr>
<td>总以食印为福</td>
<td>不知日主衰旺</td>
</tr>
</tbody></table>
<h3>四句核心</h3>
<table>
<thead>
<tr>
<th>用神</th>
<th>不可</th>
<th>原因</th>
</tr>
</thead>
<tbody><tr>
<td>财</td>
<td>不可劫</td>
<td>劫则破格</td>
</tr>
<tr>
<td>官</td>
<td>不可伤</td>
<td>伤则损贵</td>
</tr>
<tr>
<td>印</td>
<td>不可坏</td>
<td>坏则无生</td>
</tr>
<tr>
<td>食</td>
<td>不可夺</td>
<td>夺则损福</td>
</tr>
</tbody></table>
<hr>
<h2>四、五个命造速记</h2>
<table>
<thead>
<tr>
<th>命造</th>
<th>四柱</th>
<th>核心</th>
<th>断语</th>
</tr>
</thead>
<tbody><tr>
<td>高宗纯皇帝</td>
<td>辛卯 丁酉 庚午 丙子</td>
<td>子午卯酉冲，制化得宜</td>
<td>天下熙宁</td>
</tr>
<tr>
<td>董中堂</td>
<td>庚申 庚辰 戊辰 戊午</td>
<td>午火为用印绶旺</td>
<td>宦海无波</td>
</tr>
<tr>
<td>己酉丙寅</td>
<td>辛酉 辛丑 己酉 丙寅</td>
<td>丙火为用印绶美</td>
<td>前程无限</td>
</tr>
<tr>
<td>王姓</td>
<td>壬辰 壬寅 甲寅 庚午</td>
<td>庚金为病，午火为用</td>
<td>庚金为病明矣</td>
</tr>
<tr>
<td>福建人</td>
<td>癸酉 甲子 癸亥 辛酉</td>
<td>水势冲奔，顺逆之机</td>
<td>昆仑之水可顺不可逆</td>
</tr>
</tbody></table>
<hr>
<h2>五、实战四步法</h2>
<pre><code>第一步：察日主衰旺
  → 得令否？得地否？得势否？

第二步：究顺悖之机
  → 用神能否得用？
  → 忌神能否受制？

第三步：审进退之节
  → 旺者宜泄宜克？
  → 弱者宜生宜扶？

第四步：论喜忌之真
  → 不以财官为喜
  → 专论日主衰旺
</code></pre>
<hr>
<h2>六、必须背诵的名句</h2>
<blockquote>
<p><strong>1.</strong> 要与人间开聋聩，顺逆之机须理会
<strong>2.</strong> 用之为财不可劫，用之为官不可伤，用之印绶不可坏，用之食神不可夺
<strong>3.</strong> 旺之极者，宜泄而不宜克，宜顺其气势
<strong>4.</strong> 昆仑之水，可顺而不可逆也</p>
</blockquote>
<hr>
<h2>七、自测题</h2>
<table>
<thead>
<tr>
<th>题号</th>
<th>问题</th>
<th>参考答案</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td>&quot;用&quot;字的关键是什么？</td>
<td>不用尽可劫/伤/坏/夺</td>
</tr>
<tr>
<td>2</td>
<td>王姓命局的误判原因？</td>
<td>误以庚金为用，实为忌神</td>
</tr>
<tr>
<td>3</td>
<td>&quot;昆仑之水&quot;命局的处理？</td>
<td>顺其流则吉，逆其流则凶</td>
</tr>
<tr>
<td>4</td>
<td>知命篇批判了哪些谬说？</td>
<td>奇格异局、神煞、财官为喜等</td>
</tr>
</tbody></table>
`},F2=({book:n,onChapterClick:t})=>D.jsxs("div",{children:[D.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:16},children:[D.jsx("span",{style:{fontSize:14,fontWeight:"bold",color:"#e8a040",letterSpacing:1},children:"篇目总览"}),D.jsxs("span",{style:{fontSize:12,padding:"2px 8px",borderRadius:10,background:"rgba(122,79,170,0.15)",color:"#a090d0",border:"1px solid rgba(122,79,170,0.3)"},children:["共",n.total,"篇 · 已解读",n.done,"篇"]})]}),D.jsx("div",{style:{display:"grid",gap:2},children:n.chapters.map((e,l)=>{const r=String(l+1).padStart(2,"0");return D.jsxs("div",{onClick:()=>e.isDone&&t(e.name),style:{display:"flex",alignItems:"center",padding:"7px 12px",background:e.isDone?"#101828":"#0d0d1a",border:"1px solid transparent",borderRadius:5,marginBottom:2,cursor:e.isDone?"pointer":"default",borderLeft:e.isDone?"3px solid #60a060":"3px solid transparent",transition:"all 0.2s"},onMouseEnter:a=>{e.isDone&&(a.currentTarget.style.borderColor="#2a2a4a",a.currentTarget.style.background="#141e30")},onMouseLeave:a=>{a.currentTarget.style.borderColor="transparent",a.currentTarget.style.background=e.isDone?"#101828":"#0d0d1a"},children:[D.jsx("div",{style:{minWidth:30,textAlign:"center",fontSize:12,color:"#6060a0"},children:r}),D.jsx("div",{style:{flex:1,fontSize:14,color:e.isDone?"#c8c0b0":"#505070"},children:e.name}),e.isDone&&D.jsx("div",{style:{fontSize:12,color:"#60a060",minWidth:50,textAlign:"right"},children:"✅"}),e.isDone&&D.jsx("button",{onClick:a=>{a.stopPropagation(),t(e.name)},style:{fontSize:12,padding:"3px 10px",borderRadius:4,marginLeft:8,color:"#7090c0",border:"1px solid #2a2a4a",background:"transparent",cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap"},onMouseEnter:a=>{a.currentTarget.style.borderColor="#f0c060",a.currentTarget.style.color="#f0c060"},onMouseLeave:a=>{a.currentTarget.style.borderColor="#2a2a4a",a.currentTarget.style.color="#7090c0"},children:"查看解读"})]},e.name)})})]}),P2={tiandao:{desc:"天元地元人元、阴阳为本、三元论核心定理",tag:"天道"},kundao:{desc:"地支刚柔、五气偏全、十二宫生旺死绝",tag:"坤道"},rendao:{desc:"顺悖吉凶、五行偏枯、中和为贵",tag:"人道"},zhiming:{desc:"顺逆之机、用神不可伤、旺极宜泄",tag:"知命"},liqi:{desc:"进退之机、旺相休囚、进气退气、衰旺辨法",tag:"理气"},peihe:{desc:"干支配合定祸福、用神不拘名、两造对比",tag:"配合"},tiangan:{desc:"十干性情、五阳从气五阴从势、十干专论",tag:"天干"},dizhi:{desc:"阳动阴静、六冲合局、藏干主次、生方旺方",tag:"地支"},bage:{desc:"八格取用、正格变格判别、杂格批判、格局分析",tag:"八格"}},I2=({book:n,onSkillClick:t})=>D.jsxs("div",{children:[D.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:16},children:[D.jsx("span",{style:{fontSize:14,fontWeight:"bold",color:"#e8a040",letterSpacing:1},children:"技能库"}),D.jsxs("span",{style:{fontSize:12,padding:"2px 8px",borderRadius:10,background:"rgba(122,79,170,0.15)",color:"#a090d0",border:"1px solid rgba(122,79,170,0.3)"},children:["共",n.skills.length,"个技能文件"]})]}),D.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:10},children:n.skills.map(e=>{const l=P2[e.name]||{desc:"",tag:e.name};return D.jsxs("div",{onClick:()=>t(e.name),style:{background:"#101828",border:"1px solid #1a1a30",borderRadius:6,padding:"14px 16px",cursor:"pointer",transition:"all 0.2s",display:"block"},onMouseEnter:r=>{r.currentTarget.style.borderColor="#7a4faa",r.currentTarget.style.background="#141e30",r.currentTarget.style.transform="translateX(4px)"},onMouseLeave:r=>{r.currentTarget.style.borderColor="#1a1a30",r.currentTarget.style.background="#101828",r.currentTarget.style.transform=""},children:[D.jsx("div",{style:{fontSize:12,padding:"2px 8px",borderRadius:3,marginBottom:8,display:"inline-block",background:"rgba(122,79,170,0.15)",color:"#a090d0",border:"1px solid rgba(122,79,170,0.3)"},children:l.tag}),D.jsxs("div",{style:{fontSize:15,fontWeight:"bold",color:"#f0c060",marginBottom:4},children:[l.tag,"篇 · 技能"]}),D.jsx("div",{style:{fontSize:12,color:"#8080a0",lineHeight:1.5,marginBottom:8},children:l.desc}),D.jsxs("div",{style:{fontSize:11,color:"#5070a0"},children:["skills/",e.name,"/SKILL.md →"]})]},e.name)})})]}),t3=()=>{const{slug:n}=k_(),[t,e]=T.useState("read"),[l,r]=T.useState(null),[a,d]=T.useState(""),i=na.find(h=>h.slug===n);if(!i)return D.jsx("div",{style:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"},children:D.jsxs("div",{style:{textAlign:"center"},children:[D.jsx("div",{style:{fontSize:36,color:"#f0c060",marginBottom:16},children:"404"}),D.jsx("p",{style:{color:"#8080a0",marginBottom:16},children:"未找到该典籍"}),D.jsx(Na,{to:"/",style:{display:"inline-block",padding:"8px 24px",background:"#1a0f38",border:"1px solid #f0c060",color:"#f0c060",borderRadius:8,fontSize:14,textDecoration:"none"},children:"返回首页"})]})});const u=(h,b)=>{r(h),d(b),setTimeout(()=>{_a.fromTo(".modal-card",{opacity:0,scale:.95},{opacity:1,scale:1,duration:.25,ease:"back.out(1.4)"}),_a.fromTo(".modal-backdrop",{opacity:0},{opacity:1,duration:.2})},10)},o=()=>{_a.to(".modal-card",{opacity:0,scale:.95,duration:.15,ease:"power2.in",onComplete:()=>{r(null),d("")}})},s=l==="interp"?`【${a}】原文解读`:`【${a}】技能文件`,c=l==="interp"?$2[a]||'<p style="color:#8080a0;text-align:center;padding:40px 0">未找到该篇解读内容</p>':W2[a]||'<p style="color:#8080a0;text-align:center;padding:40px 0">未找到该技能内容</p>',f=l==="interp"?"prose-interp":"prose-skill";return D.jsxs("div",{style:{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",paddingLeft:16,paddingRight:16,paddingBottom:64},children:[D.jsxs("div",{style:{width:"100%",maxWidth:1100,paddingTop:64,paddingBottom:32,textAlign:"center",borderBottom:"1px solid #1f1f38",marginBottom:24,position:"relative",overflow:"hidden"},children:[D.jsx("div",{style:{position:"absolute",top:-80,left:"50%",transform:"translateX(-50%)",width:500,height:300,pointerEvents:"none",background:"radial-gradient(ellipse, rgba(122,79,170,0.15) 0%, transparent 70%)"}}),D.jsx("div",{style:{display:"inline-block",background:"rgba(122,79,170,0.2)",border:"1px solid rgba(122,79,170,0.4)",color:"#b090e0",fontSize:11,letterSpacing:3,padding:"4px 16px",borderRadius:20,marginBottom:16},children:"正统子平 · 任铁樵增注本"}),D.jsxs("h1",{style:{fontSize:24,color:"#f0c060",fontWeight:"bold",letterSpacing:5,marginBottom:8,textShadow:"0 0 30px rgba(240,192,96,0.3)"},children:["《",i.title,"》"]}),D.jsx("p",{style:{fontSize:13,color:"#8080a0",marginBottom:24},children:"原著：刘伯温（托名）｜注疏：任铁樵｜评注：徐乐吾"}),D.jsxs("div",{style:{display:"flex",justifyContent:"center",gap:40},children:[D.jsxs("div",{style:{textAlign:"center"},children:[D.jsx("div",{style:{fontSize:24,color:"#f0c060",fontWeight:"bold"},children:i.total}),D.jsx("div",{style:{fontSize:12,color:"#8080a0",marginTop:4},children:"全篇章"})]}),D.jsxs("div",{style:{textAlign:"center"},children:[D.jsx("div",{style:{fontSize:24,color:"#60a060",fontWeight:"bold"},children:i.done}),D.jsx("div",{style:{fontSize:12,color:"#8080a0",marginTop:4},children:"已解读"})]}),D.jsxs("div",{style:{textAlign:"center"},children:[D.jsx("div",{style:{fontSize:24,color:"#7a4faa",fontWeight:"bold"},children:i.skills.length}),D.jsx("div",{style:{fontSize:12,color:"#8080a0",marginTop:4},children:"技能文件"})]})]})]}),D.jsx("div",{style:{width:"100%",maxWidth:1100,marginBottom:24},children:D.jsx(Na,{to:"/",style:{fontSize:12,color:"#7090c0",textDecoration:"none",transition:"color 0.2s"},onMouseEnter:h=>h.currentTarget.style.color="#f0c060",onMouseLeave:h=>h.currentTarget.style.color="#7090c0",children:"← 返回典籍首页"})}),D.jsxs("div",{style:{display:"flex",gap:8,width:"100%",maxWidth:1100,marginBottom:24,paddingBottom:16,borderBottom:"1px solid #1f1f38"},children:[D.jsx("button",{onClick:()=>e("read"),style:{background:t==="read"?"#1a0f38":"transparent",border:"1px solid",borderColor:t==="read"?"#f0c060":"#2a2a4a",color:t==="read"?"#f0c060":"#8080a0",padding:"9px 22px",borderRadius:6,cursor:"pointer",fontSize:14,letterSpacing:1,transition:"all 0.2s"},children:"原文解读"}),D.jsx("button",{onClick:()=>e("skill"),style:{background:t==="skill"?"#1a0f38":"transparent",border:"1px solid",borderColor:t==="skill"?"#f0c060":"#2a2a4a",color:t==="skill"?"#f0c060":"#8080a0",padding:"9px 22px",borderRadius:6,cursor:"pointer",fontSize:14,letterSpacing:1,transition:"all 0.2s"},children:"技能库"})]}),D.jsxs("div",{style:{width:"100%",maxWidth:1100,animation:"fadeUp 0.3s ease-out forwards"},children:[t==="read"&&D.jsx(F2,{book:i,onChapterClick:h=>u("interp",h)}),t==="skill"&&D.jsx(I2,{book:i,onSkillClick:h=>u("skill",h)})]}),l&&D.jsx("div",{className:"modal-backdrop",onClick:h=>{h.target.classList.contains("modal-backdrop")&&o()},children:D.jsxs("div",{className:"modal-card",children:[D.jsxs("div",{className:"modal-header",children:[D.jsx("span",{style:{fontWeight:"bold",color:"#f0c060",letterSpacing:1},children:s}),D.jsx("button",{onClick:o,style:{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:"#1a0f38",border:"1px solid #2a2a4a",color:"#8080a0",fontSize:18,cursor:"pointer",transition:"all 0.2s",opacity:.7},onMouseEnter:h=>h.currentTarget.style.opacity="1",onMouseLeave:h=>h.currentTarget.style.opacity="0.7",children:"×"})]}),D.jsx("div",{className:"modal-body",children:D.jsx("div",{className:f,dangerouslySetInnerHTML:{__html:c}})})]})})]})};$1.createRoot(document.getElementById("root")).render(D.jsx(Gh.StrictMode,{children:D.jsx(_v,{children:D.jsxs($_,{children:[D.jsx(Hd,{path:"/",element:D.jsx(J2,{})}),D.jsx(Hd,{path:"/:slug",element:D.jsx(t3,{})}),D.jsx(Hd,{path:"*",element:D.jsx(K_,{to:"/",replace:!0})})]})})}));
