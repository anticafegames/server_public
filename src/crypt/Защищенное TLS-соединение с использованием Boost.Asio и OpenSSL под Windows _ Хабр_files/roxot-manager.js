"use strict";!function(){function n(n){E.inited||(i(),S={adBlockMode:n.adBlockMode||"iframe",dynamicUrlTemplate:n.dynamicUrlTemplate||null,wrapperConfig:n.wrapperConfig||{},isLanguageSpecific:n.isLanguageSpecific||!1},S.isLanguageSpecific&&(S.language=t()),c("Rom Init",{setConfig:n,resultConfig:S}),S.dynamicUrlTemplate&&b(S.dynamicUrlTemplate),"main"===S.adBlockMode&&u(),E.cmd.push=function(n){if("function"==typeof n)try{n.call()}catch(n){s("Error processing command",n)}else s("Commands written into rom.cmd must be wrapped in a function")},E.cmd.forEach(function(n){return E.cmd.push(n)}),E.inited=!0,E.dispatch({event:A.RUN,config:S}))}function t(){return navigator.language||navigator.userLanguage?navigator.language.slice(0,2).toLowerCase():"no"}function e(n){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src=n;var e=document.getElementsByTagName("head")[0];e.insertBefore(t,e.firstChild)}function o(){T=!!localStorage.getItem("roxot.debug.errorLogger")}function r(n,t){T&&console.error(n,t)}function a(n,t){T&&console.warn(n,t)}function i(){M=!!localStorage.getItem("rom.debug.consoleDebug"),o()}function c(n,t){if(M){var e=l(n);t=t||{},console.log(e,t)}}function s(n,t){var e=l(n);t=t||{},r(e,t),M&&console.error(e,t)}function d(n,t){var e=l(n);t=t||{},a(n,t),M&&console.warn(e,t)}function l(n){var t=new Date,e=[t.getHours(),t.getMinutes(),t.getSeconds()].join(":");return(e+="."+t.getMilliseconds())+": RoxotManager ("+x+"): "+n}function u(){if(!I.isLoaded&&!I.inited){e(localStorage.getItem("rom.rowr_url")||"https://cdn-plus.roxot-panel.com/roxot-wrapper/js/roxot-wrapper.js"),I.cmd.push(function(){E.cmd.push(function(){I.onAll(function(n){E.dispatch(n)})}),I.setConfig(S.wrapperConfig)}),I.isLoaded=!0,c("Load Roxot Wrapper globally.")}}function f(n,t){var e=localStorage.getItem("rom.ad_tag_url_template")||"https://cdn-plus.roxot-panel.com/wrapper-builder/__TAG_ID__/tag",o=e.replace("__TAG_ID__",t),r=p(t+"_iframe_");m(n,r,'\n<!DOCTYPE html>\n<html style="display: table;">\n  <head></head>\n  <body style="margin: 0;">\n    <div id="'.concat(t,'"></div>\n    <script async src="').concat(o,"\"><\/script>\n    <script>\n        window.rowr = window.rowr || {cmd: []};\n        let rowr = window.rowr;\n        rowr.iframeId = '").concat(r,"';\n        \n        rowr.cmd.push(function() {\n          rowr.setConfig(").concat(JSON.stringify(S.wrapperConfig),");\n          top.rom = top.rom || {cmd: []};\n          top.rom.cmd.push(function () {\n            rowr.onAll(function (data) {\n              top.rom.dispatch(data);\n            });\n          });\n        });\n    <\/script>\n  </body>\n</html>\n  "))}function p(n){return n+Math.floor(1e5*Math.random())}function m(n,t,e){var o=document.createElement("iframe");o.setAttribute("id",t),o.setAttribute("class","rom-iframe"),o.style.border="0",o.style.margin="0",o.style.padding="0",o.style.overflow="hidden",o.style.width="0",o.style.height="0",o.style.display="table";var r=document.getElementById(n);if(!r)return void s("Can not found ad block "+n);r.innerText="",r.appendChild(o);var a=o.contentDocument||o.contentWindow.document;a.open(),a.write(e),a.close()}function g(n,t){var e=localStorage.getItem("rom.ad_tag_url_template")||"https://cdn-plus.roxot-panel.com/wrapper-builder/__TAG_ID__/tag-json",o=e.replace("__TAG_ID__",t);I.cmd.push(function(){I.loadAdConfig(n,o)})}function w(n,t){var e=new XMLHttpRequest;e.open("GET",n),e.responseType="json",e.onload=function(){200!==e.status?s("Error Ajax request to "+n+". Status: "+e.status+": "+e.statusText):t(e.response)},e.onerror=function(){s("Error Ajax request to "+n+". Status: "+e.status+": "+e.statusText)},e.send()}function h(n){return n.hasOwnProperty("tags")?n.tags:v(n.experiments.filter(function(n){return n.hasOwnProperty("chance")&&n.chance>0})).tags}function v(n){if(1===n.length)return n[0];var t=y(n),e=_(t);n=n.slice(0);var o=n.shift();return e<=o.chance?o:v(n)}function y(n){return n.map(function(n){return n.chance}).reduce(function(n,t){return n+t})}function _(n){return 1+Math.floor(Math.random()*n)}function C(n){var t=!1;n.offsetWidth||(t=n.style.width,n.style.width="100%");var e=n.offsetWidth;return!1!==t&&(n.style.width=t),e}function b(n){var t=window.location.hostname;e(n.replace("__HOST__",t))}var x="1.0.0",A={RUN:"manager_run"};window.rom=window.rom||{cmd:[]};var E=window.rom;window.rowr=window.rowr||{cmd:[]};var I=window.rowr,S={},T=null,M=null,L=[];E.on=function(n){L.push(n)},E.off=function(n){var t=L.indexOf(n);t>-1&&L.splice(t,1)},E.dispatch=function(n){L.slice(0).forEach(function(t){t(n)})},E.display=function(n,t){"iframe"===S.adBlockMode?f(n,t):g(n,t)},E.displayPlacement=function(n,t){var e=localStorage.getItem("rom.ad_tag_url_template")||"https://cdn-plus.roxot-panel.com/wrapper-builder/placement/__PLACEMENT_ID__",o=e.replace("__PLACEMENT_ID__",t);S.isLanguageSpecific&&(o+=-1===o.indexOf("?")?"?":"&",o+="lng="+decodeURIComponent(S.language)),c('Load placement config for "'+n+'"',{div:n,placement:t,url:o,managerConfig:S}),w(o,function(t){E.displayConfig(n,t)})},E.displayConfig=function(n,t){var e={div:n,config:t,managerConfig:S},o=document.querySelector("#"+n);if(!o)return void d('Roxot Manager: Can not found div with id "'+n+'"',e);var r=C(o);c('Source element "'+n+'" has size '+r+".",e);var a=t.cases.filter(function(n){return n.size<=r}).sort(function(n,t){return n.size-t.size});if(!a.length)return void d("Not found support sizeCase for "+r+" size of "+n+" block.",e);var i=a.pop();e.sizeCase=i,c("Use sizeCase with size "+i.size+" for "+n+" block.",e);var l=[];if(h(i).forEach(function(n){try{var t=document.createElement("div");t.setAttribute("class","roxotAdContainer"),t.style.textAlign="center",t.style.verticalAlign="top",t.style.width="100%";var r=o.insertAdjacentElement("beforeend",t);for(var a in n.style||{})r.style[a]=n.style[a];for(var i in n.attributes||{})r.setAttribute(i,n.attributes[i]);for(var c in n.data||{})r.dataset[c]=n.data[c];var d=p("roxotAd-"),u=n.classes||[];u.push("roxotAd");var f=document.createElement("div");f.setAttribute("class",u.join(" ")),f.setAttribute("id",d),f.style.display="inline-block",f.style.width="100%",r.appendChild(f),l.push({divId:d,adConfig:n.adConfig,wrapperConfig:n.wrapperConfig||{}})}catch(t){e.tag=n,s("Error in process tag: "+t,e)}}),l.length){if(e.ads=l,"iframe"===S.adBlockMode){c("Run rowr in iframe",e);var u=localStorage.getItem("rom.rowr_url")||"https://cdn-plus.roxot-panel.com/roxot-wrapper/js/roxot-wrapper.js";l.forEach(function(n){var t=p("placement_iframe_"),e='\n<!DOCTYPE html>\n<html style="display: table;">\n  <head></head>\n  <body style="margin: 0;">\n    <div id="'.concat(n.divId,'"></div>\n    <script async src="').concat(u,"\"><\/script>\n    <script>\n        window.rowr = window.rowr || {cmd: []};\n        let rowr = window.rowr;\n        rowr.iframeId = '").concat(t,"';\n        rowr.cmd.push(function() {\n          rowr.setAdConfig('").concat(n.divId,"', ").concat(JSON.stringify(n.adConfig),");\n          rowr.setConfig(").concat(JSON.stringify(S.wrapperConfig),");\n          \n          top.rom = top.rom || {cmd: []};\n          top.rom.cmd.push(function () {\n            rowr.onAll(function (data) {\n              top.rom.dispatch(data);\n            });\n          });\n        });\n    <\/script>\n  </body>\n</html>\n  ");m(n.divId,t,e)})}else c("Run rowr in main",e),I.cmd.push(function(){l.forEach(function(n){I.setAdConfig(n.divId,n.adConfig)})});c("Build "+l.length+" tags and run roxot wrapper for "+n+" block.",e)}},E.version=function(){return x},E.icmd=E.icmd||[],E.icmd.push=function(t){if(t=t||{},E.inited)return void s("Roxot Manager already init.",{romConfig:S,newConfig:t});n(t)},E.icmd.forEach(function(n){return E.icmd.push(n)})}();window.rom = window.rom || {icmd: []}; window.rom.icmd.push({"adBlockMode":"iframe","isLanguageSpecific":false,"dynamicUrlTemplate":"","wrapperConfig":{"prebid":{"adjustment":{"mytarget":0.1,"rtbhouse":0.85,"otm":0.85,"rubicon":0.8,"getintent":0.8}},"adfox":{"hb":{"biddersMap":{"myTarget":"1168310","betweenDigital":"1167588","criteo":"1171975"},"timeout":700}}}});