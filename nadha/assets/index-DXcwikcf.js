import{Wllama as gm}from"https://cdn.jsdelivr.net/npm/@wllama/wllama@2.2.1/esm/index.js";import ym from"https://cdn.jsdelivr.net/npm/@wllama/wllama@2.2.1/esm/wasm-from-cdn.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const s of a)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function r(a){const s={};return a.integrity&&(s.integrity=a.integrity),a.referrerPolicy&&(s.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?s.credentials="include":a.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(a){if(a.ep)return;a.ep=!0;const s=r(a);fetch(a.href,s)}})();/*!
 * ONNX Runtime Web v1.23.2
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */var Wa=Object.defineProperty,_m=Object.getOwnPropertyDescriptor,wm=Object.getOwnPropertyNames,bm=Object.prototype.hasOwnProperty,$m=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,r)=>(typeof require<"u"?require:t)[r]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')}),U=(e,t)=>()=>(e&&(t=e(e=0)),t),Ht=(e,t)=>{for(var r in t)Wa(e,r,{get:t[r],enumerable:!0})},vm=(e,t,r,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of wm(t))!bm.call(e,a)&&a!==r&&Wa(e,a,{get:()=>t[a],enumerable:!(i=_m(t,a))||i.enumerable});return e},yi=e=>vm(Wa({},"__esModule",{value:!0}),e),ti,gt,Ft,Is,ld,dd=U(()=>{ti=new Map,gt=[],Ft=(e,t,r)=>{if(t&&typeof t.init=="function"&&typeof t.createInferenceSessionHandler=="function"){let i=ti.get(e);if(i===void 0)ti.set(e,{backend:t,priority:r});else{if(i.priority>r)return;if(i.priority===r&&i.backend!==t)throw new Error(`cannot register backend "${e}" using priority ${r}`)}if(r>=0){let a=gt.indexOf(e);a!==-1&&gt.splice(a,1);for(let s=0;s<gt.length;s++)if(ti.get(gt[s]).priority<=r){gt.splice(s,0,e);return}gt.push(e)}return}throw new TypeError("not a valid backend")},Is=async e=>{let t=ti.get(e);if(!t)return"backend not found.";if(t.initialized)return t.backend;if(t.aborted)return t.error;{let r=!!t.initPromise;try{return r||(t.initPromise=t.backend.init(e)),await t.initPromise,t.initialized=!0,t.backend}catch(i){return r||(t.error=`${i}`,t.aborted=!0),t.error}finally{delete t.initPromise}}},ld=async e=>{let t=e.executionProviders||[],r=t.map(d=>typeof d=="string"?d:d.name),i=r.length===0?gt:r,a,s=[],o=new Set;for(let d of i){let p=await Is(d);typeof p=="string"?s.push({name:d,err:p}):(a||(a=p),a===p&&o.add(d))}if(!a)throw new Error(`no available backend found. ERR: ${s.map(d=>`[${d.name}] ${d.err}`).join(", ")}`);for(let{name:d,err:p}of s)r.includes(d)&&console.warn(`removing requested execution provider "${d}" from session options because it is not available: ${p}`);let u=t.filter(d=>o.has(typeof d=="string"?d:d.name));return[a,new Proxy(e,{get:(d,p)=>p==="executionProviders"?u:Reflect.get(d,p)})]}}),xm=U(()=>{dd()}),pd,Tm=U(()=>{pd="1.23.2"}),Cr,ze,cd=U(()=>{Tm(),Cr="warning",ze={wasm:{},webgl:{},webgpu:{},versions:{common:pd},set logLevel(e){if(e!==void 0){if(typeof e!="string"||["verbose","info","warning","error","fatal"].indexOf(e)===-1)throw new Error(`Unsupported logging level: ${e}`);Cr=e}},get logLevel(){return Cr}},Object.defineProperty(ze,"logLevel",{enumerable:!0})}),$e,km=U(()=>{cd(),$e=ze}),fd,hd,Cm=U(()=>{fd=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas"):new OffscreenCanvas(1,1);r.width=e.dims[3],r.height=e.dims[2];let i=r.getContext("2d");if(i!=null){let a,s;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],s=e.dims[3]):(a=e.dims[3],s=e.dims[2]);let o=t?.format!==void 0?t.format:"RGB",u=t?.norm,d,p;u===void 0||u.mean===void 0?d=[255,255,255,255]:typeof u.mean=="number"?d=[u.mean,u.mean,u.mean,u.mean]:(d=[u.mean[0],u.mean[1],u.mean[2],0],u.mean[3]!==void 0&&(d[3]=u.mean[3])),u===void 0||u.bias===void 0?p=[0,0,0,0]:typeof u.bias=="number"?p=[u.bias,u.bias,u.bias,u.bias]:(p=[u.bias[0],u.bias[1],u.bias[2],0],u.bias[3]!==void 0&&(p[3]=u.bias[3]));let f=s*a,h=0,g=f,y=f*2,_=-1;o==="RGBA"?(h=0,g=f,y=f*2,_=f*3):o==="RGB"?(h=0,g=f,y=f*2):o==="RBG"&&(h=0,y=f,g=f*2);for(let $=0;$<s;$++)for(let x=0;x<a;x++){let v=(e.data[h++]-p[0])*d[0],b=(e.data[g++]-p[1])*d[1],C=(e.data[y++]-p[2])*d[2],T=_===-1?255:(e.data[_++]-p[3])*d[3];i.fillStyle="rgba("+v+","+b+","+C+","+T+")",i.fillRect(x,$,1,1)}if("toDataURL"in r)return r.toDataURL();throw new Error("toDataURL is not supported")}else throw new Error("Can not access image data")},hd=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas").getContext("2d"):new OffscreenCanvas(1,1).getContext("2d"),i;if(r!=null){let a,s,o;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],s=e.dims[1],o=e.dims[3]):(a=e.dims[3],s=e.dims[2],o=e.dims[1]);let u=t!==void 0&&t.format!==void 0?t.format:"RGB",d=t?.norm,p,f;d===void 0||d.mean===void 0?p=[255,255,255,255]:typeof d.mean=="number"?p=[d.mean,d.mean,d.mean,d.mean]:(p=[d.mean[0],d.mean[1],d.mean[2],255],d.mean[3]!==void 0&&(p[3]=d.mean[3])),d===void 0||d.bias===void 0?f=[0,0,0,0]:typeof d.bias=="number"?f=[d.bias,d.bias,d.bias,d.bias]:(f=[d.bias[0],d.bias[1],d.bias[2],0],d.bias[3]!==void 0&&(f[3]=d.bias[3]));let h=s*a;if(t!==void 0&&(t.format!==void 0&&o===4&&t.format!=="RGBA"||o===3&&t.format!=="RGB"&&t.format!=="BGR"))throw new Error("Tensor format doesn't match input tensor dims");let g=4,y=0,_=1,$=2,x=3,v=0,b=h,C=h*2,T=-1;u==="RGBA"?(v=0,b=h,C=h*2,T=h*3):u==="RGB"?(v=0,b=h,C=h*2):u==="RBG"&&(v=0,C=h,b=h*2),i=r.createImageData(a,s);for(let S=0;S<s*a;y+=g,_+=g,$+=g,x+=g,S++)i.data[y]=(e.data[v++]-f[0])*p[0],i.data[_]=(e.data[b++]-f[1])*p[1],i.data[$]=(e.data[C++]-f[2])*p[2],i.data[x]=T===-1?255:(e.data[T++]-f[3])*p[3]}else throw new Error("Can not access image data");return i}}),zi,md,gd,yd,_d,wd,Sm=U(()=>{qa(),zi=(e,t)=>{if(e===void 0)throw new Error("Image buffer must be defined");if(t.height===void 0||t.width===void 0)throw new Error("Image height and width must be defined");if(t.tensorLayout==="NHWC")throw new Error("NHWC Tensor layout is not supported yet");let{height:r,width:i}=t,a=t.norm??{mean:255,bias:0},s,o;typeof a.mean=="number"?s=[a.mean,a.mean,a.mean,a.mean]:s=[a.mean[0],a.mean[1],a.mean[2],a.mean[3]??255],typeof a.bias=="number"?o=[a.bias,a.bias,a.bias,a.bias]:o=[a.bias[0],a.bias[1],a.bias[2],a.bias[3]??0];let u=t.format!==void 0?t.format:"RGBA",d=t.tensorFormat!==void 0&&t.tensorFormat!==void 0?t.tensorFormat:"RGB",p=r*i,f=d==="RGBA"?new Float32Array(p*4):new Float32Array(p*3),h=4,g=0,y=1,_=2,$=3,x=0,v=p,b=p*2,C=-1;u==="RGB"&&(h=3,g=0,y=1,_=2,$=-1),d==="RGBA"?C=p*3:d==="RBG"?(x=0,b=p,v=p*2):d==="BGR"&&(b=0,v=p,x=p*2);for(let T=0;T<p;T++,g+=h,_+=h,y+=h,$+=h)f[x++]=(e[g]+o[0])/s[0],f[v++]=(e[y]+o[1])/s[1],f[b++]=(e[_]+o[2])/s[2],C!==-1&&$!==-1&&(f[C++]=(e[$]+o[3])/s[3]);return d==="RGBA"?new Ue("float32",f,[1,4,r,i]):new Ue("float32",f,[1,3,r,i])},md=async(e,t)=>{let r=typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement,i=typeof ImageData<"u"&&e instanceof ImageData,a=typeof ImageBitmap<"u"&&e instanceof ImageBitmap,s=typeof e=="string",o,u=t??{},d=()=>{if(typeof document<"u")return document.createElement("canvas");if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(1,1);throw new Error("Canvas is not supported")},p=f=>typeof HTMLCanvasElement<"u"&&f instanceof HTMLCanvasElement||f instanceof OffscreenCanvas?f.getContext("2d"):null;if(r){let f=d();f.width=e.width,f.height=e.height;let h=p(f);if(h!=null){let g=e.height,y=e.width;if(t!==void 0&&t.resizedHeight!==void 0&&t.resizedWidth!==void 0&&(g=t.resizedHeight,y=t.resizedWidth),t!==void 0){if(u=t,t.tensorFormat!==void 0)throw new Error("Image input config format must be RGBA for HTMLImageElement");u.tensorFormat="RGBA",u.height=g,u.width=y}else u.tensorFormat="RGBA",u.height=g,u.width=y;h.drawImage(e,0,0),o=h.getImageData(0,0,y,g).data}else throw new Error("Can not access image data")}else if(i){let f,h;if(t!==void 0&&t.resizedWidth!==void 0&&t.resizedHeight!==void 0?(f=t.resizedHeight,h=t.resizedWidth):(f=e.height,h=e.width),t!==void 0&&(u=t),u.format="RGBA",u.height=f,u.width=h,t!==void 0){let g=d();g.width=h,g.height=f;let y=p(g);if(y!=null)y.putImageData(e,0,0),o=y.getImageData(0,0,h,f).data;else throw new Error("Can not access image data")}else o=e.data}else if(a){if(t===void 0)throw new Error("Please provide image config with format for Imagebitmap");let f=d();f.width=e.width,f.height=e.height;let h=p(f);if(h!=null){let g=e.height,y=e.width;return h.drawImage(e,0,0,y,g),o=h.getImageData(0,0,y,g).data,u.height=g,u.width=y,zi(o,u)}else throw new Error("Can not access image data")}else{if(s)return new Promise((f,h)=>{let g=d(),y=p(g);if(!e||!y)return h();let _=new Image;_.crossOrigin="Anonymous",_.src=e,_.onload=()=>{g.width=_.width,g.height=_.height,y.drawImage(_,0,0,g.width,g.height);let $=y.getImageData(0,0,g.width,g.height);u.height=g.height,u.width=g.width,f(zi($.data,u))}});throw new Error("Input data provided is not supported - aborted tensor creation")}if(o!==void 0)return zi(o,u);throw new Error("Input data provided is not supported - aborted tensor creation")},gd=(e,t)=>{let{width:r,height:i,download:a,dispose:s}=t,o=[1,i,r,4];return new Ue({location:"texture",type:"float32",texture:e,dims:o,download:a,dispose:s})},yd=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:s}=t;return new Ue({location:"gpu-buffer",type:r??"float32",gpuBuffer:e,dims:i,download:a,dispose:s})},_d=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:s}=t;return new Ue({location:"ml-tensor",type:r??"float32",mlTensor:e,dims:i,download:a,dispose:s})},wd=(e,t,r)=>new Ue({location:"cpu-pinned",type:e,data:t,dims:r??[t.length]})}),zt,ci,Sr,bd,Im=U(()=>{zt=new Map([["float32",Float32Array],["uint8",Uint8Array],["int8",Int8Array],["uint16",Uint16Array],["int16",Int16Array],["int32",Int32Array],["bool",Uint8Array],["float64",Float64Array],["uint32",Uint32Array],["int4",Uint8Array],["uint4",Uint8Array]]),ci=new Map([[Float32Array,"float32"],[Uint8Array,"uint8"],[Int8Array,"int8"],[Uint16Array,"uint16"],[Int16Array,"int16"],[Int32Array,"int32"],[Float64Array,"float64"],[Uint32Array,"uint32"]]),Sr=!1,bd=()=>{if(!Sr){Sr=!0;let e=typeof BigInt64Array<"u"&&BigInt64Array.from,t=typeof BigUint64Array<"u"&&BigUint64Array.from,r=globalThis.Float16Array,i=typeof r<"u"&&r.from;e&&(zt.set("int64",BigInt64Array),ci.set(BigInt64Array,"int64")),t&&(zt.set("uint64",BigUint64Array),ci.set(BigUint64Array,"uint64")),i?(zt.set("float16",r),ci.set(r,"float16")):zt.set("float16",Uint16Array)}}}),$d,vd,Em=U(()=>{qa(),$d=e=>{let t=1;for(let r=0;r<e.length;r++){let i=e[r];if(typeof i!="number"||!Number.isSafeInteger(i))throw new TypeError(`dims[${r}] must be an integer, got: ${i}`);if(i<0)throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${i}`);t*=i}return t},vd=(e,t)=>{switch(e.location){case"cpu":return new Ue(e.type,e.data,t);case"cpu-pinned":return new Ue({location:"cpu-pinned",data:e.data,type:e.type,dims:t});case"texture":return new Ue({location:"texture",texture:e.texture,type:e.type,dims:t});case"gpu-buffer":return new Ue({location:"gpu-buffer",gpuBuffer:e.gpuBuffer,type:e.type,dims:t});case"ml-tensor":return new Ue({location:"ml-tensor",mlTensor:e.mlTensor,type:e.type,dims:t});default:throw new Error(`tensorReshape: tensor location ${e.location} is not supported`)}}}),Ue,qa=U(()=>{Cm(),Sm(),Im(),Em(),Ue=class{constructor(e,t,r){bd();let i,a;if(typeof e=="object"&&"location"in e)switch(this.dataLocation=e.location,i=e.type,a=e.dims,e.location){case"cpu-pinned":{let o=zt.get(i);if(!o)throw new TypeError(`unsupported type "${i}" to create tensor from pinned buffer`);if(!(e.data instanceof o))throw new TypeError(`buffer should be of type ${o.name}`);this.cpuData=e.data;break}case"texture":{if(i!=="float32")throw new TypeError(`unsupported type "${i}" to create tensor from texture`);this.gpuTextureData=e.texture,this.downloader=e.download,this.disposer=e.dispose;break}case"gpu-buffer":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from gpu buffer`);this.gpuBufferData=e.gpuBuffer,this.downloader=e.download,this.disposer=e.dispose;break}case"ml-tensor":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint64"&&i!=="int8"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from MLTensor`);this.mlTensorData=e.mlTensor,this.downloader=e.download,this.disposer=e.dispose;break}default:throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`)}else{let o,u;if(typeof e=="string")if(i=e,u=r,e==="string"){if(!Array.isArray(t))throw new TypeError("A string tensor's data must be a string array.");o=t}else{let d=zt.get(e);if(d===void 0)throw new TypeError(`Unsupported tensor type: ${e}.`);if(Array.isArray(t)){if(e==="float16"&&d===Uint16Array||e==="uint4"||e==="int4")throw new TypeError(`Creating a ${e} tensor from number array is not supported. Please use ${d.name} as data.`);e==="uint64"||e==="int64"?o=d.from(t,BigInt):o=d.from(t)}else if(t instanceof d)o=t;else if(t instanceof Uint8ClampedArray)if(e==="uint8")o=Uint8Array.from(t);else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");else if(e==="float16"&&t instanceof Uint16Array&&d!==Uint16Array)o=new globalThis.Float16Array(t.buffer,t.byteOffset,t.length);else throw new TypeError(`A ${i} tensor's data must be type of ${d}`)}else if(u=t,Array.isArray(e)){if(e.length===0)throw new TypeError("Tensor type cannot be inferred from an empty array.");let d=typeof e[0];if(d==="string")i="string",o=e;else if(d==="boolean")i="bool",o=Uint8Array.from(e);else throw new TypeError(`Invalid element type of data array: ${d}.`)}else if(e instanceof Uint8ClampedArray)i="uint8",o=Uint8Array.from(e);else{let d=ci.get(e.constructor);if(d===void 0)throw new TypeError(`Unsupported type for tensor data: ${e.constructor}.`);i=d,o=e}if(u===void 0)u=[o.length];else if(!Array.isArray(u))throw new TypeError("A tensor's dims must be a number array");a=u,this.cpuData=o,this.dataLocation="cpu"}let s=$d(a);if(this.cpuData&&s!==this.cpuData.length&&!((i==="uint4"||i==="int4")&&Math.ceil(s/2)===this.cpuData.length))throw new Error(`Tensor's size(${s}) does not match data length(${this.cpuData.length}).`);this.type=i,this.dims=a,this.size=s}static async fromImage(e,t){return md(e,t)}static fromTexture(e,t){return gd(e,t)}static fromGpuBuffer(e,t){return yd(e,t)}static fromMLTensor(e,t){return _d(e,t)}static fromPinnedBuffer(e,t,r){return wd(e,t,r)}toDataURL(e){return fd(this,e)}toImageData(e){return hd(this,e)}get data(){if(this.ensureValid(),!this.cpuData)throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");return this.cpuData}get location(){return this.dataLocation}get texture(){if(this.ensureValid(),!this.gpuTextureData)throw new Error("The data is not stored as a WebGL texture.");return this.gpuTextureData}get gpuBuffer(){if(this.ensureValid(),!this.gpuBufferData)throw new Error("The data is not stored as a WebGPU buffer.");return this.gpuBufferData}get mlTensor(){if(this.ensureValid(),!this.mlTensorData)throw new Error("The data is not stored as a WebNN MLTensor.");return this.mlTensorData}async getData(e){switch(this.ensureValid(),this.dataLocation){case"cpu":case"cpu-pinned":return this.data;case"texture":case"gpu-buffer":case"ml-tensor":{if(!this.downloader)throw new Error("The current tensor is not created with a specified data downloader.");if(this.isDownloading)throw new Error("The current tensor is being downloaded.");try{this.isDownloading=!0;let t=await this.downloader();return this.downloader=void 0,this.dataLocation="cpu",this.cpuData=t,e&&this.disposer&&(this.disposer(),this.disposer=void 0),t}finally{this.isDownloading=!1}}default:throw new Error(`cannot get data from location: ${this.dataLocation}`)}}dispose(){if(this.isDownloading)throw new Error("The current tensor is being downloaded.");this.disposer&&(this.disposer(),this.disposer=void 0),this.cpuData=void 0,this.gpuTextureData=void 0,this.gpuBufferData=void 0,this.mlTensorData=void 0,this.downloader=void 0,this.isDownloading=void 0,this.dataLocation="none"}ensureValid(){if(this.dataLocation==="none")throw new Error("The tensor is disposed.")}reshape(e){if(this.ensureValid(),this.downloader||this.disposer)throw new Error("Cannot reshape a tensor that owns GPU resource.");return vd(this,e)}}}),Ie,xd=U(()=>{qa(),Ie=Ue}),Gi,Ir,rt,Xe,Bt,Mt,Td=U(()=>{cd(),Gi=(e,t)=>{(typeof ze.trace>"u"?!ze.wasm.trace:!ze.trace)||console.timeStamp(`${e}::ORT::${t}`)},Ir=(e,t)=>{let r=new Error().stack?.split(/\r\n|\r|\n/g)||[],i=!1;for(let a=0;a<r.length;a++){if(i&&!r[a].includes("TRACE_FUNC")){let s=`FUNC_${e}::${r[a].trim().split(" ")[1]}`;t&&(s+=`::${t}`),Gi("CPU",s);return}r[a].includes("TRACE_FUNC")&&(i=!0)}},rt=e=>{(typeof ze.trace>"u"?!ze.wasm.trace:!ze.trace)||Ir("BEGIN",e)},Xe=e=>{(typeof ze.trace>"u"?!ze.wasm.trace:!ze.trace)||Ir("END",e)},Bt=e=>{(typeof ze.trace>"u"?!ze.wasm.trace:!ze.trace)||console.time(`ORT::${e}`)},Mt=e=>{(typeof ze.trace>"u"?!ze.wasm.trace:!ze.trace)||console.timeEnd(`ORT::${e}`)}}),kd,zm=U(()=>{dd(),xd(),Td(),kd=class Cd{constructor(t){this.handler=t}async run(t,r,i){rt(),Bt("InferenceSession.run");let a={},s={};if(typeof t!="object"||t===null||t instanceof Ie||Array.isArray(t))throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");let o=!0;if(typeof r=="object"){if(r===null)throw new TypeError("Unexpected argument[1]: cannot be null.");if(r instanceof Ie)throw new TypeError("'fetches' cannot be a Tensor");if(Array.isArray(r)){if(r.length===0)throw new TypeError("'fetches' cannot be an empty array.");o=!1;for(let p of r){if(typeof p!="string")throw new TypeError("'fetches' must be a string array or an object.");if(this.outputNames.indexOf(p)===-1)throw new RangeError(`'fetches' contains invalid output name: ${p}.`);a[p]=null}if(typeof i=="object"&&i!==null)s=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else{let p=!1,f=Object.getOwnPropertyNames(r);for(let h of this.outputNames)if(f.indexOf(h)!==-1){let g=r[h];(g===null||g instanceof Ie)&&(p=!0,o=!1,a[h]=g)}if(p){if(typeof i=="object"&&i!==null)s=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else s=r}}else if(typeof r<"u")throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");for(let p of this.inputNames)if(typeof t[p]>"u")throw new Error(`input '${p}' is missing in 'feeds'.`);if(o)for(let p of this.outputNames)a[p]=null;let u=await this.handler.run(t,a,s),d={};for(let p in u)if(Object.hasOwnProperty.call(u,p)){let f=u[p];f instanceof Ie?d[p]=f:d[p]=new Ie(f.type,f.data,f.dims)}return Mt("InferenceSession.run"),Xe(),d}async release(){return this.handler.dispose()}static async create(t,r,i,a){rt(),Bt("InferenceSession.create");let s,o={};if(typeof t=="string"){if(s=t,typeof r=="object"&&r!==null)o=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof Uint8Array){if(s=t,typeof r=="object"&&r!==null)o=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&t instanceof SharedArrayBuffer){let f=t,h=0,g=t.byteLength;if(typeof r=="object"&&r!==null)o=r;else if(typeof r=="number"){if(h=r,!Number.isSafeInteger(h))throw new RangeError("'byteOffset' must be an integer.");if(h<0||h>=f.byteLength)throw new RangeError(`'byteOffset' is out of range [0, ${f.byteLength}).`);if(g=t.byteLength-h,typeof i=="number"){if(g=i,!Number.isSafeInteger(g))throw new RangeError("'byteLength' must be an integer.");if(g<=0||h+g>f.byteLength)throw new RangeError(`'byteLength' is out of range (0, ${f.byteLength-h}].`);if(typeof a=="object"&&a!==null)o=a;else if(typeof a<"u")throw new TypeError("'options' must be an object.")}else if(typeof i<"u")throw new TypeError("'byteLength' must be a number.")}else if(typeof r<"u")throw new TypeError("'options' must be an object.");s=new Uint8Array(f,h,g)}else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let[u,d]=await ld(o),p=await u.createInferenceSessionHandler(s,d);return Mt("InferenceSession.create"),Xe(),new Cd(p)}startProfiling(){this.handler.startProfiling()}endProfiling(){this.handler.endProfiling()}get inputNames(){return this.handler.inputNames}get outputNames(){return this.handler.outputNames}get inputMetadata(){return this.handler.inputMetadata}get outputMetadata(){return this.handler.outputMetadata}}}),_i,Am=U(()=>{zm(),_i=kd}),Om=U(()=>{}),Rm=U(()=>{}),Bm=U(()=>{}),Mm=U(()=>{}),Nm={};Ht(Nm,{InferenceSession:()=>_i,TRACE:()=>Gi,TRACE_EVENT_BEGIN:()=>Bt,TRACE_EVENT_END:()=>Mt,TRACE_FUNC_BEGIN:()=>rt,TRACE_FUNC_END:()=>Xe,Tensor:()=>Ie,env:()=>$e,registerBackend:()=>Ft});var je=U(()=>{xm(),km(),Am(),xd(),Om(),Rm(),Td(),Bm(),Mm()}),Fa=U(()=>{}),Sd={};Ht(Sd,{default:()=>Id});var Er,zr,Id,Dm=U(()=>{Bf(),Lt(),ja(),Er="ort-wasm-proxy-worker",zr=globalThis.self?.name===Er,zr&&(self.onmessage=e=>{let{type:t,in:r}=e.data;try{switch(t){case"init-wasm":Va(r.wasm).then(()=>{ln(r).then(()=>{postMessage({type:t})},i=>{postMessage({type:t,err:i})})},i=>{postMessage({type:t,err:i})});break;case"init-ep":{let{epName:i,env:a}=r;dn(a,i).then(()=>{postMessage({type:t})},s=>{postMessage({type:t,err:s})});break}case"copy-from":{let{buffer:i}=r,a=Ji(i);postMessage({type:t,out:a});break}case"create":{let{model:i,options:a}=r;pn(i,a).then(s=>{postMessage({type:t,out:s})},s=>{postMessage({type:t,err:s})});break}case"release":cn(r),postMessage({type:t});break;case"run":{let{sessionId:i,inputIndices:a,inputs:s,outputIndices:o,options:u}=r;fn(i,a,s,o,new Array(o.length).fill(null),u).then(d=>{d.some(p=>p[3]!=="cpu")?postMessage({type:t,err:"Proxy does not support non-cpu tensor location."}):postMessage({type:t,out:d},mn([...s,...d]))},d=>{postMessage({type:t,err:d})});break}case"end-profiling":hn(r),postMessage({type:t});break;default:}}catch(i){postMessage({type:t,err:i})}}),Id=zr?null:e=>new Worker(e??Le,{type:"module",name:Er})}),Ed={};Ht(Ed,{default:()=>zd});var Ar,zd,Es,Pm=U(()=>{Ar=async function(e={}){var t,r,i=e,a=new Promise((n,l)=>{t=n,r=l}),s=typeof window=="object",o=typeof WorkerGlobalScope<"u",u=o&&self.name?.startsWith("em-pthread");i.mountExternalData=(n,l)=>{n.startsWith("./")&&(n=n.substring(2)),(i.Fb||(i.Fb=new Map)).set(n,l)},i.unmountExternalData=()=>{delete i.Fb};var d=globalThis.SharedArrayBuffer??new WebAssembly.Memory({initial:0,maximum:0,qc:!0}).buffer.constructor;let p=n=>async(...l)=>{try{if(i.Gb)throw Error("Session already started");let c=i.Gb={ec:l[0],errors:[]},m=await n(...l);if(i.Gb!==c)throw Error("Session mismatch");i.Kb?.flush();let w=c.errors;if(0<w.length){let k=await Promise.all(w);if(k=k.filter(I=>I),0<k.length)throw Error(k.join(`
`))}return m}finally{i.Gb=null}};i.jsepInit=(n,l)=>{if(n==="webgpu"){[i.Kb,i.Vb,i.Zb,i.Lb,i.Yb,i.Ab,i.$b,i.bc,i.Wb,i.Xb,i.ac]=l;let c=i.Kb;i.jsepRegisterBuffer=(m,w,k,I)=>c.registerBuffer(m,w,k,I),i.jsepGetBuffer=m=>c.getBuffer(m),i.jsepCreateDownloader=(m,w,k)=>c.createDownloader(m,w,k),i.jsepOnCreateSession=m=>{c.onCreateSession(m)},i.jsepOnReleaseSession=m=>{c.onReleaseSession(m)},i.jsepOnRunStart=m=>c.onRunStart(m),i.cc=(m,w)=>{c.upload(m,w)}}else if(n==="webnn"){let c=l[0];[i.oc,i.Ob,i.webnnEnsureTensor,i.Pb,i.webnnDownloadTensor,i.nc,i.webnnEnableTraceEvent]=l.slice(1),i.webnnReleaseTensorId=i.Ob,i.webnnUploadTensor=i.Pb,i.webnnRegisterMLContext=i.nc,i.webnnOnRunStart=m=>c.onRunStart(m),i.webnnOnRunEnd=c.onRunEnd.bind(c),i.webnnOnReleaseSession=m=>{c.onReleaseSession(m)},i.webnnCreateMLTensorDownloader=(m,w)=>c.createMLTensorDownloader(m,w),i.webnnRegisterMLTensor=(m,w,k,I)=>c.registerMLTensor(m,w,k,I),i.webnnCreateMLContext=m=>c.createMLContext(m),i.webnnRegisterMLConstant=(m,w,k,I,O,D)=>c.registerMLConstant(m,w,k,I,O,i.Fb,D),i.webnnRegisterGraphInput=c.registerGraphInput.bind(c),i.webnnIsGraphInput=c.isGraphInput.bind(c),i.webnnRegisterGraphOutput=c.registerGraphOutput.bind(c),i.webnnIsGraphOutput=c.isGraphOutput.bind(c),i.webnnCreateTemporaryTensor=c.createTemporaryTensor.bind(c),i.webnnIsGraphInputOutputTypeSupported=c.isGraphInputOutputTypeSupported.bind(c)}};let f=()=>{let n=(l,c,m)=>(...w)=>{let k=Je,I=c?.();w=l(...w);let O=c?.();return I!==O&&(l=O,m(I),c=m=null),Je!=k?new Promise((D,W)=>{mr={resolve:D,reject:W}}):w};(()=>{for(let l of["_OrtAppendExecutionProvider","_OrtCreateSession","_OrtRun","_OrtRunWithBinding","_OrtBindInput"])i[l]=n(i[l],()=>i[l],c=>i[l]=c)})(),p!==void 0&&(i._OrtRun=p(i._OrtRun),i._OrtRunWithBinding=p(i._OrtRunWithBinding)),f=void 0};i.asyncInit=()=>{f?.()};var h,g,y=(n,l)=>{throw l},_=import.meta.url,$="";if(s||o){try{$=new URL(".",_).href}catch{}o&&(g=n=>{var l=new XMLHttpRequest;return l.open("GET",n,!1),l.responseType="arraybuffer",l.send(null),new Uint8Array(l.response)}),h=async n=>{if(ge(n))return new Promise((c,m)=>{var w=new XMLHttpRequest;w.open("GET",n,!0),w.responseType="arraybuffer",w.onload=()=>{w.status==200||w.status==0&&w.response?c(w.response):m(w.status)},w.onerror=m,w.send(null)});var l=await fetch(n,{credentials:"same-origin"});if(l.ok)return l.arrayBuffer();throw Error(l.status+" : "+l.url)}}var x,v,b,C,T,S,z,E,R,L,F,K,X,re,j,se=console.log.bind(console),H=console.error.bind(console),G=se,ne=H,V=!1,ge=n=>n.startsWith("file://");function P(){return v.buffer!=T.buffer&&ve(),T}function q(){return v.buffer!=T.buffer&&ve(),S}function ee(){return v.buffer!=T.buffer&&ve(),z}function pe(){return v.buffer!=T.buffer&&ve(),E}function N(){return v.buffer!=T.buffer&&ve(),R}function de(){return v.buffer!=T.buffer&&ve(),L}function De(){return v.buffer!=T.buffer&&ve(),F}function _e(){return v.buffer!=T.buffer&&ve(),re}if(u){let n=function(l){try{var c=l.data,m=c.Db;if(m==="load"){let w=[];self.onmessage=k=>w.push(k),self.startWorker=()=>{postMessage({Db:"loaded"});for(let k of w)n(k);self.onmessage=n};for(let k of c.Sb)i[k]&&!i[k].proxy||(i[k]=(...I)=>{postMessage({Db:"callHandler",Rb:k,args:I})},k=="print"&&(G=i[k]),k=="printErr"&&(ne=i[k]));v=c.kc,ve(),j(c.lc)}else if(m==="run"){Yf(c.Bb),$r(c.Bb,0,0,1,0,0),Tn(),fr(c.Bb),we||(gs(),we=!0);try{Xf(c.hc,c.Jb)}catch(w){if(w!="unwind")throw w}}else c.target!=="setimmediate"&&(m==="checkMailbox"?we&&bi():m&&(ne(`worker: received unknown command ${m}`),ne(c)))}catch(w){throw ys(),w}};var we=!1;self.onunhandledrejection=l=>{throw l.reason||l},self.onmessage=n}function ve(){var n=v.buffer;i.HEAP8=T=new Int8Array(n),z=new Int16Array(n),i.HEAPU8=S=new Uint8Array(n),E=new Uint16Array(n),i.HEAP32=R=new Int32Array(n),i.HEAPU32=L=new Uint32Array(n),F=new Float32Array(n),re=new Float64Array(n),K=new BigInt64Array(n),X=new BigUint64Array(n)}function vt(){u?startWorker(i):B.Da()}var Kt,Zt=0,Yt=null;function yn(){if(--Zt==0&&Yt){var n=Yt;Yt=null,n()}}function pt(n){throw ne(n="Aborted("+n+")"),V=!0,n=new WebAssembly.RuntimeError(n+". Build with -sASSERTIONS for more info."),r(n),n}function _n(){return{a:{L:hm,Aa:fm,b:Jf,$:In,A:An,pa:On,X:Rn,Z:Bn,qa:Mn,na:Nn,ga:Dn,ma:Pn,J:Ln,Y:Un,V:Wn,oa:qn,W:Fn,va:eh,E:th,Q:ih,O:ah,D:sh,v:oh,s:uh,P:lh,z:gh,R:yh,ja:_h,T:wh,aa:bh,M:$h,F:vh,ia:fr,sa:xh,r:Th,Ca:kh,w:Ih,o:Eh,m:Ah,c:lr,Ba:Oh,n:Rh,j:Nh,u:Dh,p:Ph,f:Lh,t:Uh,l:Wh,e:qh,k:Fh,h:jh,g:Vh,d:Gh,da:Hh,ea:Kh,fa:Zh,ba:is,ca:rs,N:as,xa:Xh,ua:Jh,i:em,C:tm,G:im,ta:Qh,x:rm,ra:am,U:nm,q:Yh,y:sm,K:om,S:um,za:lm,ya:dm,ka:us,la:ls,_:nr,B:ds,I:ps,ha:cs,H:fs,a:v,wa:ar}}}class ir{name="ExitStatus";constructor(l){this.message=`Program terminated with exit(${l})`,this.status=l}}var wn=n=>{n.terminate(),n.onmessage=()=>{}},rr=[],bn=n=>{ft.length==0&&(Cn(),kn(ft[0]));var l=ft.pop();if(!l)return 6;Xt.push(l),xt[n.Bb]=l,l.Bb=n.Bb;var c={Db:"run",hc:n.fc,Jb:n.Jb,Bb:n.Bb};return l.postMessage(c,n.Nb),0},ct=0,xe=(n,l,...c)=>{for(var m=2*c.length,w=Tr(),k=xr(8*m),I=k>>>3,O=0;O<c.length;O++){var D=c[O];typeof D=="bigint"?(K[I+2*O]=1n,K[I+2*O+1]=D):(K[I+2*O]=0n,_e()[I+2*O+1>>>0]=D)}return n=_s(n,0,m,k,l),Ei(w),n};function ar(n){if(u)return xe(0,1,n);if(C=n,!(0<ct)){for(var l of Xt)wn(l);for(l of ft)wn(l);ft=[],Xt=[],xt={},V=!0}y(0,new ir(n))}function $n(n){if(u)return xe(1,0,n);nr(n)}var nr=n=>{if(C=n,u)throw $n(n),"unwind";ar(n)},ft=[],Xt=[],vn=[],xt={},xn=n=>{var l=n.Bb;delete xt[l],ft.push(n),Xt.splice(Xt.indexOf(n),1),n.Bb=0,ws(l)};function Tn(){vn.forEach(n=>n())}var kn=n=>new Promise(l=>{n.onmessage=w=>{var k=(w=w.data).Db;if(w.Hb&&w.Hb!=br()){var I=xt[w.Hb];I?I.postMessage(w,w.Nb):ne(`Internal error! Worker sent a message "${k}" to target pthread ${w.Hb}, but that thread no longer exists!`)}else k==="checkMailbox"?bi():k==="spawnThread"?bn(w):k==="cleanupThread"?xn(xt[w.ic]):k==="loaded"?(n.loaded=!0,l(n)):w.target==="setimmediate"?n.postMessage(w):k==="callHandler"?i[w.Rb](...w.args):k&&ne(`worker sent an unknown command ${k}`)},n.onerror=w=>{throw ne(`worker sent an error! ${w.filename}:${w.lineno}: ${w.message}`),w};var c,m=[];for(c of[])i.propertyIsEnumerable(c)&&m.push(c);n.postMessage({Db:"load",Sb:m,kc:v,lc:b})});function Cn(){var n=new Worker((()=>{let l=URL;return import.meta.url>"file:"&&import.meta.url<"file;"?new l("ort.bundle.min.mjs",import.meta.url):new URL(import.meta.url)})(),{type:"module",workerData:"em-pthread",name:"em-pthread"});ft.push(n)}var Yf=n=>{ve();var l=de()[n+52>>>2>>>0];n=de()[n+56>>>2>>>0],vs(l,l-n),Ei(l)},Xf=(n,l)=>{ct=0,n=xs(n,l),0<ct?C=n:vr(n)};class Qf{constructor(l){this.Ib=l-24}}function Jf(n,l,c){var m=new Qf(n>>>=0);throw l>>>=0,c>>>=0,de()[m.Ib+16>>>2>>>0]=0,de()[m.Ib+4>>>2>>>0]=l,de()[m.Ib+8>>>2>>>0]=c,n}function Sn(n,l,c,m){return u?xe(2,1,n,l,c,m):In(n,l,c,m)}function In(n,l,c,m){if(n>>>=0,c>>>=0,m>>>=0,d===void 0)return 6;var w=[];return u&&w.length===0?Sn(n,l>>>=0,c,m):(n={fc:c,Bb:n,Jb:m,Nb:w},u?(n.Db="spawnThread",postMessage(n,w),0):bn(n))}var En=typeof TextDecoder<"u"?new TextDecoder:void 0,zn=(n,l=0,c=NaN)=>{var m=(l>>>=0)+c;for(c=l;n[c]&&!(c>=m);)++c;if(16<c-l&&n.buffer&&En)return En.decode(n.buffer instanceof ArrayBuffer?n.subarray(l,c):n.slice(l,c));for(m="";l<c;){var w=n[l++];if(128&w){var k=63&n[l++];if((224&w)==192)m+=String.fromCharCode((31&w)<<6|k);else{var I=63&n[l++];65536>(w=(240&w)==224?(15&w)<<12|k<<6|I:(7&w)<<18|k<<12|I<<6|63&n[l++])?m+=String.fromCharCode(w):(w-=65536,m+=String.fromCharCode(55296|w>>10,56320|1023&w))}}else m+=String.fromCharCode(w)}return m},Ce=(n,l)=>(n>>>=0)?zn(q(),n,l):"";function An(n,l,c){return u?xe(3,1,n,l,c):0}function On(n,l){if(u)return xe(4,1,n,l)}function Rn(n,l){if(u)return xe(5,1,n,l)}function Bn(n,l,c){if(u)return xe(6,1,n,l,c)}function Mn(n,l,c){return u?xe(7,1,n,l,c):0}function Nn(n,l){if(u)return xe(8,1,n,l)}function Dn(n,l,c){if(u)return xe(9,1,n,l,c)}function Pn(n,l,c,m){if(u)return xe(10,1,n,l,c,m)}function Ln(n,l,c,m){if(u)return xe(11,1,n,l,c,m)}function Un(n,l,c,m){if(u)return xe(12,1,n,l,c,m)}function Wn(n){if(u)return xe(13,1,n)}function qn(n,l){if(u)return xe(14,1,n,l)}function Fn(n,l,c){if(u)return xe(15,1,n,l,c)}var jn,eh=()=>pt(""),Qe=n=>{for(var l="";q()[n>>>0];)l+=jn[q()[n++>>>0]];return l},sr={},or={},Wt=i.BindingError=class extends Error{constructor(n){super(n),this.name="BindingError"}};function at(n,l,c={}){return function(m,w,k={}){var I=w.name;if(!m)throw new Wt(`type "${I}" must have a positive integer typeid pointer`);if(or.hasOwnProperty(m)){if(k.Tb)return;throw new Wt(`Cannot register type '${I}' twice`)}or[m]=w,sr.hasOwnProperty(m)&&(w=sr[m],delete sr[m],w.forEach(O=>O()))}(n,l,c)}var Vn=(n,l,c)=>{switch(l){case 1:return c?m=>P()[m>>>0]:m=>q()[m>>>0];case 2:return c?m=>ee()[m>>>1>>>0]:m=>pe()[m>>>1>>>0];case 4:return c?m=>N()[m>>>2>>>0]:m=>de()[m>>>2>>>0];case 8:return c?m=>K[m>>>3]:m=>X[m>>>3];default:throw new TypeError(`invalid integer width (${l}): ${n}`)}};function th(n,l,c){c>>>=0,at(n>>>=0,{name:l=Qe(l>>>0),fromWireType:m=>m,toWireType:function(m,w){if(typeof w!="bigint"&&typeof w!="number")throw w=w===null?"null":(m=typeof w)=="object"||m==="array"||m==="function"?w.toString():""+w,new TypeError(`Cannot convert "${w}" to ${this.name}`);return typeof w=="number"&&(w=BigInt(w)),w},Cb:ht,readValueFromPointer:Vn(l,c,l.indexOf("u")==-1),Eb:null})}var ht=8;function ih(n,l,c,m){at(n>>>=0,{name:l=Qe(l>>>0),fromWireType:function(w){return!!w},toWireType:function(w,k){return k?c:m},Cb:ht,readValueFromPointer:function(w){return this.fromWireType(q()[w>>>0])},Eb:null})}var ur=[],nt=[];function lr(n){9<(n>>>=0)&&--nt[n+1]==0&&(nt[n]=void 0,ur.push(n))}var Be=n=>{if(!n)throw new Wt(`Cannot use deleted val. handle = ${n}`);return nt[n]},qe=n=>{switch(n){case void 0:return 2;case null:return 4;case!0:return 6;case!1:return 8;default:let l=ur.pop()||nt.length;return nt[l]=n,nt[l+1]=1,l}};function dr(n){return this.fromWireType(de()[n>>>2>>>0])}var rh={name:"emscripten::val",fromWireType:n=>{var l=Be(n);return lr(n),l},toWireType:(n,l)=>qe(l),Cb:ht,readValueFromPointer:dr,Eb:null};function ah(n){return at(n>>>0,rh)}var nh=(n,l)=>{switch(l){case 4:return function(c){return this.fromWireType(De()[c>>>2>>>0])};case 8:return function(c){return this.fromWireType(_e()[c>>>3>>>0])};default:throw new TypeError(`invalid float width (${l}): ${n}`)}};function sh(n,l,c){c>>>=0,at(n>>>=0,{name:l=Qe(l>>>0),fromWireType:m=>m,toWireType:(m,w)=>w,Cb:ht,readValueFromPointer:nh(l,c),Eb:null})}function oh(n,l,c,m,w){if(n>>>=0,c>>>=0,l=Qe(l>>>0),w===-1&&(w=4294967295),w=O=>O,m===0){var k=32-8*c;w=O=>O<<k>>>k}var I=l.includes("unsigned")?function(O,D){return D>>>0}:function(O,D){return D};at(n,{name:l,fromWireType:w,toWireType:I,Cb:ht,readValueFromPointer:Vn(l,c,m!==0),Eb:null})}function uh(n,l,c){function m(k){var I=de()[k>>>2>>>0];return k=de()[k+4>>>2>>>0],new w(P().buffer,k,I)}var w=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array][l];at(n>>>=0,{name:c=Qe(c>>>0),fromWireType:m,Cb:ht,readValueFromPointer:m},{Tb:!0})}var Tt=(n,l,c)=>{var m=q();if(l>>>=0,0<c){var w=l;c=l+c-1;for(var k=0;k<n.length;++k){var I=n.charCodeAt(k);if(55296<=I&&57343>=I&&(I=65536+((1023&I)<<10)|1023&n.charCodeAt(++k)),127>=I){if(l>=c)break;m[l++>>>0]=I}else{if(2047>=I){if(l+1>=c)break;m[l++>>>0]=192|I>>6}else{if(65535>=I){if(l+2>=c)break;m[l++>>>0]=224|I>>12}else{if(l+3>=c)break;m[l++>>>0]=240|I>>18,m[l++>>>0]=128|I>>12&63}m[l++>>>0]=128|I>>6&63}m[l++>>>0]=128|63&I}}m[l>>>0]=0,n=l-w}else n=0;return n},pr=n=>{for(var l=0,c=0;c<n.length;++c){var m=n.charCodeAt(c);127>=m?l++:2047>=m?l+=2:55296<=m&&57343>=m?(l+=4,++c):l+=3}return l};function lh(n,l){at(n>>>=0,{name:l=Qe(l>>>0),fromWireType:function(c){for(var m,w=de()[c>>>2>>>0],k=c+4,I=k,O=0;O<=w;++O){var D=k+O;O!=w&&q()[D>>>0]!=0||(I=Ce(I,D-I),m===void 0?m=I:(m+="\0",m+=I),I=D+1)}return st(c),m},toWireType:function(c,m){m instanceof ArrayBuffer&&(m=new Uint8Array(m));var w=typeof m=="string";if(!(w||ArrayBuffer.isView(m)&&m.BYTES_PER_ELEMENT==1))throw new Wt("Cannot pass non-string to std::string");var k=w?pr(m):m.length,I=Ii(4+k+1),O=I+4;return de()[I>>>2>>>0]=k,w?Tt(m,O,k+1):q().set(m,O>>>0),c!==null&&c.push(st,I),I},Cb:ht,readValueFromPointer:dr,Eb(c){st(c)}})}var Gn=typeof TextDecoder<"u"?new TextDecoder("utf-16le"):void 0,dh=(n,l)=>{for(var c=n>>1,m=c+l/2;!(c>=m)&&pe()[c>>>0];)++c;if(32<(c<<=1)-n&&Gn)return Gn.decode(q().slice(n,c));for(c="",m=0;!(m>=l/2);++m){var w=ee()[n+2*m>>>1>>>0];if(w==0)break;c+=String.fromCharCode(w)}return c},ph=(n,l,c)=>{if(c??=2147483647,2>c)return 0;var m=l;c=(c-=2)<2*n.length?c/2:n.length;for(var w=0;w<c;++w){var k=n.charCodeAt(w);ee()[l>>>1>>>0]=k,l+=2}return ee()[l>>>1>>>0]=0,l-m},ch=n=>2*n.length,fh=(n,l)=>{for(var c=0,m="";!(c>=l/4);){var w=N()[n+4*c>>>2>>>0];if(w==0)break;++c,65536<=w?(w-=65536,m+=String.fromCharCode(55296|w>>10,56320|1023&w)):m+=String.fromCharCode(w)}return m},hh=(n,l,c)=>{if(l>>>=0,c??=2147483647,4>c)return 0;var m=l;c=m+c-4;for(var w=0;w<n.length;++w){var k=n.charCodeAt(w);if(55296<=k&&57343>=k&&(k=65536+((1023&k)<<10)|1023&n.charCodeAt(++w)),N()[l>>>2>>>0]=k,(l+=4)+4>c)break}return N()[l>>>2>>>0]=0,l-m},mh=n=>{for(var l=0,c=0;c<n.length;++c){var m=n.charCodeAt(c);55296<=m&&57343>=m&&++c,l+=4}return l};function gh(n,l,c){if(n>>>=0,l>>>=0,c=Qe(c>>>=0),l===2)var m=dh,w=ph,k=ch,I=O=>pe()[O>>>1>>>0];else l===4&&(m=fh,w=hh,k=mh,I=O=>de()[O>>>2>>>0]);at(n,{name:c,fromWireType:O=>{for(var D,W=de()[O>>>2>>>0],Z=O+4,te=0;te<=W;++te){var le=O+4+te*l;te!=W&&I(le)!=0||(Z=m(Z,le-Z),D===void 0?D=Z:(D+="\0",D+=Z),Z=le+l)}return st(O),D},toWireType:(O,D)=>{if(typeof D!="string")throw new Wt(`Cannot pass non-string to C++ string type ${c}`);var W=k(D),Z=Ii(4+W+l);return de()[Z>>>2>>>0]=W/l,w(D,Z+4,W+l),O!==null&&O.push(st,Z),Z},Cb:ht,readValueFromPointer:dr,Eb(O){st(O)}})}function yh(n,l){at(n>>>=0,{Ub:!0,name:l=Qe(l>>>0),Cb:0,fromWireType:()=>{},toWireType:()=>{}})}function _h(n){$r(n>>>0,!o,1,!s,131072,!1),Tn()}var cr=n=>{if(!V)try{if(n(),!(0<ct))try{u?vr(C):nr(C)}catch(l){l instanceof ir||l=="unwind"||y(0,l)}}catch(l){l instanceof ir||l=="unwind"||y(0,l)}};function fr(n){n>>>=0,typeof Atomics.jc=="function"&&(Atomics.jc(N(),n>>>2,n).value.then(bi),n+=128,Atomics.store(N(),n>>>2,1))}var bi=()=>{var n=br();n&&(fr(n),cr($s))};function wh(n,l){(n>>>=0)==l>>>0?setTimeout(bi):u?postMessage({Hb:n,Db:"checkMailbox"}):(n=xt[n])&&n.postMessage({Db:"checkMailbox"})}var hr=[];function bh(n,l,c,m,w){for(l>>>=0,m/=2,hr.length=m,c=w>>>0>>>3,w=0;w<m;w++)hr[w]=K[c+2*w]?K[c+2*w+1]:_e()[c+2*w+1>>>0];return(l?wr[l]:cm[n])(...hr)}var $h=()=>{ct=0};function vh(n){n>>>=0,u?postMessage({Db:"cleanupThread",ic:n}):xn(xt[n])}function xh(n){}var $i=(n,l)=>{var c=or[n];if(c===void 0)throw n=ms(n),c=Qe(n),st(n),new Wt(`${l} has unknown type ${c}`);return c},Hn=(n,l,c)=>{var m=[];return n=n.toWireType(m,c),m.length&&(de()[l>>>2>>>0]=qe(m)),n};function Th(n,l,c){return l>>>=0,c>>>=0,n=Be(n>>>0),l=$i(l,"emval::as"),Hn(l,c,n)}function kh(n,l){return l>>>=0,n=Be(n>>>0),(l=$i(l,"emval::as")).toWireType(null,n)}var vi=n=>{try{n()}catch(l){pt(l)}},mt=0,Je=null,Kn=0,xi=[],Zn={},Yn={},Ch=0,mr=null,Sh=[];function Xn(n){return function(l){if(!V){if(mt===0){var c=!1,m=!1;l((w=0)=>{if(!V&&(Kn=w,c=!0,m)){mt=2,vi(()=>Cs(Je)),typeof MainLoop<"u"&&MainLoop.Qb&&MainLoop.resume(),w=!1;try{var k=function(){var D=N()[Je+8>>>2>>>0];return D=B[Yn[D]],--ct,D()}()}catch(D){k=D,w=!0}var I=!1;if(!Je){var O=mr;O&&(mr=null,(w?O.reject:O.resolve)(k),I=!0)}if(w&&!I)throw k}}),m=!0,c||(mt=1,Je=function(){var w=Ii(65548),k=w+12;de()[w>>>2>>>0]=k,de()[w+4>>>2>>>0]=k+65536,k=xi[0];var I=Zn[k];return I===void 0&&(I=Ch++,Zn[k]=I,Yn[I]=k),k=I,N()[w+8>>>2>>>0]=k,w}(),typeof MainLoop<"u"&&MainLoop.Qb&&MainLoop.pause(),vi(()=>Ts(Je)))}else mt===2?(mt=0,vi(Ss),st(Je),Je=null,Sh.forEach(cr)):pt(`invalid state: ${mt}`);return Kn}}(l=>{n().then(l)})}function Ih(n){return n>>>=0,Xn(async()=>{var l=await Be(n);return qe(l)})}var Ti=[];function Eh(n,l,c,m){return c>>>=0,m>>>=0,(n=Ti[n>>>0])(null,l=Be(l>>>0),c,m)}var zh={},ki=n=>{var l=zh[n];return l===void 0?Qe(n):l};function Ah(n,l,c,m,w){return c>>>=0,m>>>=0,w>>>=0,(n=Ti[n>>>0])(l=Be(l>>>0),l[c=ki(c)],m,w)}function Oh(n,l){return l>>>=0,(n=Be(n>>>0))==Be(l)}var Qn=()=>typeof globalThis=="object"?globalThis:Function("return this")();function Rh(n){return(n>>>=0)==0?qe(Qn()):(n=ki(n),qe(Qn()[n]))}var Bh=n=>{var l=Ti.length;return Ti.push(n),l},Mh=(n,l)=>{for(var c=Array(n),m=0;m<n;++m)c[m]=$i(de()[l+4*m>>>2>>>0],`parameter ${m}`);return c};function Nh(n,l,c){var m=(l=Mh(n,l>>>0)).shift();n--;var w=`return function (obj, func, destructorsRef, args) {
`,k=0,I=[];c===0&&I.push("obj");for(var O=["retType"],D=[m],W=0;W<n;++W)I.push(`arg${W}`),O.push(`argType${W}`),D.push(l[W]),w+=`  var arg${W} = argType${W}.readValueFromPointer(args${k?"+"+k:""});
`,k+=l[W].Cb;return w+=`  var rv = ${c===1?"new func":"func.call"}(${I.join(", ")});
`,m.Ub||(O.push("emval_returnValue"),D.push(Hn),w+=`  return emval_returnValue(retType, destructorsRef, rv);
`),n=new Function(...O,w+`};
`)(...D),c=`methodCaller<(${l.map(Z=>Z.name).join(", ")}) => ${m.name}>`,Bh(Object.defineProperty(n,"name",{value:c}))}function Dh(n){return n=ki(n>>>0),qe(i[n])}function Ph(n,l){return l>>>=0,n=Be(n>>>0),l=Be(l),qe(n[l])}function Lh(n){9<(n>>>=0)&&(nt[n+1]+=1)}function Uh(){return qe([])}function Wh(n){n=Be(n>>>0);for(var l=Array(n.length),c=0;c<n.length;c++)l[c]=n[c];return qe(l)}function qh(n){return qe(ki(n>>>0))}function Fh(){return qe({})}function jh(n){for(var l=Be(n>>>=0);l.length;){var c=l.pop();l.pop()(c)}lr(n)}function Vh(n,l,c){l>>>=0,c>>>=0,n=Be(n>>>0),l=Be(l),c=Be(c),n[l]=c}function Gh(n,l){return l>>>=0,n=(n=$i(n>>>0,"_emval_take_value")).readValueFromPointer(l),qe(n)}function Hh(n,l){n=-9007199254740992>n||9007199254740992<n?NaN:Number(n),l>>>=0,n=new Date(1e3*n),N()[l>>>2>>>0]=n.getUTCSeconds(),N()[l+4>>>2>>>0]=n.getUTCMinutes(),N()[l+8>>>2>>>0]=n.getUTCHours(),N()[l+12>>>2>>>0]=n.getUTCDate(),N()[l+16>>>2>>>0]=n.getUTCMonth(),N()[l+20>>>2>>>0]=n.getUTCFullYear()-1900,N()[l+24>>>2>>>0]=n.getUTCDay(),n=(n.getTime()-Date.UTC(n.getUTCFullYear(),0,1,0,0,0,0))/864e5|0,N()[l+28>>>2>>>0]=n}var Jn=n=>n%4==0&&(n%100!=0||n%400==0),es=[0,31,60,91,121,152,182,213,244,274,305,335],ts=[0,31,59,90,120,151,181,212,243,273,304,334];function Kh(n,l){n=-9007199254740992>n||9007199254740992<n?NaN:Number(n),l>>>=0,n=new Date(1e3*n),N()[l>>>2>>>0]=n.getSeconds(),N()[l+4>>>2>>>0]=n.getMinutes(),N()[l+8>>>2>>>0]=n.getHours(),N()[l+12>>>2>>>0]=n.getDate(),N()[l+16>>>2>>>0]=n.getMonth(),N()[l+20>>>2>>>0]=n.getFullYear()-1900,N()[l+24>>>2>>>0]=n.getDay();var c=(Jn(n.getFullYear())?es:ts)[n.getMonth()]+n.getDate()-1|0;N()[l+28>>>2>>>0]=c,N()[l+36>>>2>>>0]=-60*n.getTimezoneOffset(),c=new Date(n.getFullYear(),6,1).getTimezoneOffset();var m=new Date(n.getFullYear(),0,1).getTimezoneOffset();n=0|(c!=m&&n.getTimezoneOffset()==Math.min(m,c)),N()[l+32>>>2>>>0]=n}function Zh(n){n>>>=0;var l=new Date(N()[n+20>>>2>>>0]+1900,N()[n+16>>>2>>>0],N()[n+12>>>2>>>0],N()[n+8>>>2>>>0],N()[n+4>>>2>>>0],N()[n>>>2>>>0],0),c=N()[n+32>>>2>>>0],m=l.getTimezoneOffset(),w=new Date(l.getFullYear(),6,1).getTimezoneOffset(),k=new Date(l.getFullYear(),0,1).getTimezoneOffset(),I=Math.min(k,w);return 0>c?N()[n+32>>>2>>>0]=+(w!=k&&I==m):0<c!=(I==m)&&(w=Math.max(k,w),l.setTime(l.getTime()+6e4*((0<c?I:w)-m))),N()[n+24>>>2>>>0]=l.getDay(),c=(Jn(l.getFullYear())?es:ts)[l.getMonth()]+l.getDate()-1|0,N()[n+28>>>2>>>0]=c,N()[n>>>2>>>0]=l.getSeconds(),N()[n+4>>>2>>>0]=l.getMinutes(),N()[n+8>>>2>>>0]=l.getHours(),N()[n+12>>>2>>>0]=l.getDate(),N()[n+16>>>2>>>0]=l.getMonth(),N()[n+20>>>2>>>0]=l.getYear(),n=l.getTime(),BigInt(isNaN(n)?-1:n/1e3)}function is(n,l,c,m,w,k,I){return u?xe(16,1,n,l,c,m,w,k,I):-52}function rs(n,l,c,m,w,k){if(u)return xe(17,1,n,l,c,m,w,k)}var Qt={},Yh=()=>performance.timeOrigin+performance.now();function as(n,l){if(u)return xe(18,1,n,l);if(Qt[n]&&(clearTimeout(Qt[n].id),delete Qt[n]),!l)return 0;var c=setTimeout(()=>{delete Qt[n],cr(()=>bs(n,performance.timeOrigin+performance.now()))},l);return Qt[n]={id:c,rc:l},0}function Xh(n,l,c,m){n>>>=0,l>>>=0,c>>>=0,m>>>=0;var w=new Date().getFullYear(),k=new Date(w,0,1).getTimezoneOffset();w=new Date(w,6,1).getTimezoneOffset();var I=Math.max(k,w);de()[n>>>2>>>0]=60*I,N()[l>>>2>>>0]=+(k!=w),n=(l=O=>{var D=Math.abs(O);return`UTC${0<=O?"-":"+"}${String(Math.floor(D/60)).padStart(2,"0")}${String(D%60).padStart(2,"0")}`})(k),l=l(w),w<k?(Tt(n,c,17),Tt(l,m,17)):(Tt(n,m,17),Tt(l,c,17))}var Qh=()=>Date.now();function Jh(n,l,c){return 0<=n&&3>=n?(n===0?n=Date.now():n=performance.timeOrigin+performance.now(),K[c>>>0>>>3]=BigInt(Math.round(1e6*n)),0):28}var gr=[],ns=(n,l)=>{gr.length=0;for(var c;c=q()[n++>>>0];){var m=c!=105;l+=(m&=c!=112)&&l%8?4:0,gr.push(c==112?de()[l>>>2>>>0]:c==106?K[l>>>3]:c==105?N()[l>>>2>>>0]:_e()[l>>>3>>>0]),l+=m?8:4}return gr};function em(n,l,c){return n>>>=0,l=ns(l>>>0,c>>>0),wr[n](...l)}function tm(n,l,c){return n>>>=0,l=ns(l>>>0,c>>>0),wr[n](...l)}var im=()=>{};function rm(n,l){return ne(Ce(n>>>0,l>>>0))}var am=()=>{throw ct+=1,"unwind"};function nm(){return 4294901760}var sm=()=>navigator.hardwareConcurrency;function om(){return pt("Cannot use emscripten_pc_get_function without -sUSE_OFFSET_CONVERTER"),0}function um(n){n>>>=0;var l=q().length;if(n<=l||4294901760<n)return!1;for(var c=1;4>=c;c*=2){var m=l*(1+.2/c);m=Math.min(m,n+100663296);e:{m=(Math.min(4294901760,65536*Math.ceil(Math.max(n,m)/65536))-v.buffer.byteLength+65535)/65536|0;try{v.grow(m),ve();var w=1;break e}catch{}w=void 0}if(w)return!0}return!1}var Ci=()=>(pt("Cannot use convertFrameToPC (needed by __builtin_return_address) without -sUSE_OFFSET_CONVERTER"),0),Jt={},ss=n=>{n.forEach(l=>{Ci()})};function lm(){var n=Error().stack.toString().split(`
`);return n[0]=="Error"&&n.shift(),ss(n),Jt.Mb=Ci(),Jt.dc=n,Jt.Mb}function dm(n,l,c){if(n>>>=0,l>>>=0,Jt.Mb==n)var m=Jt.dc;else(m=Error().stack.toString().split(`
`))[0]=="Error"&&m.shift(),ss(m);for(var w=3;m[w]&&Ci()!=n;)++w;for(n=0;n<c&&m[n+w];++n)N()[l+4*n>>>2>>>0]=Ci();return n}var yr,_r={},os=()=>{if(!yr){var n,l={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:(typeof navigator=="object"&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:"./this.program"};for(n in _r)_r[n]===void 0?delete l[n]:l[n]=_r[n];var c=[];for(n in l)c.push(`${n}=${l[n]}`);yr=c}return yr};function us(n,l){if(u)return xe(19,1,n,l);n>>>=0,l>>>=0;var c,m=0,w=0;for(c of os()){var k=l+m;de()[n+w>>>2>>>0]=k,m+=Tt(c,k,1/0)+1,w+=4}return 0}function ls(n,l){if(u)return xe(20,1,n,l);n>>>=0,l>>>=0;var c=os();for(var m of(de()[n>>>2>>>0]=c.length,n=0,c))n+=pr(m)+1;return de()[l>>>2>>>0]=n,0}function ds(n){return u?xe(21,1,n):52}function ps(n,l,c,m){return u?xe(22,1,n,l,c,m):52}function cs(n,l,c,m){return u?xe(23,1,n,l,c,m):70}var pm=[null,[],[]];function fs(n,l,c,m){if(u)return xe(24,1,n,l,c,m);l>>>=0,c>>>=0,m>>>=0;for(var w=0,k=0;k<c;k++){var I=de()[l>>>2>>>0],O=de()[l+4>>>2>>>0];l+=8;for(var D=0;D<O;D++){var W=n,Z=q()[I+D>>>0],te=pm[W];Z===0||Z===10?((W===1?G:ne)(zn(te)),te.length=0):te.push(Z)}w+=O}return de()[m>>>2>>>0]=w,0}u||function(){for(var n=i.numThreads-1;n--;)Cn();rr.push(()=>{Zt++,function(l){u?l():Promise.all(ft.map(kn)).then(l)}(()=>yn())})}();for(var hs=Array(256),Si=0;256>Si;++Si)hs[Si]=String.fromCharCode(Si);jn=hs,nt.push(0,1,void 0,1,null,1,!0,1,!1,1),i.count_emval_handles=()=>nt.length/2-5-ur.length,u||(v=new WebAssembly.Memory({initial:256,maximum:65536,shared:!0}),ve()),i.wasmBinary&&(x=i.wasmBinary),i.stackSave=()=>Tr(),i.stackRestore=n=>Ei(n),i.stackAlloc=n=>xr(n),i.setValue=function(n,l,c="i8"){switch(c.endsWith("*")&&(c="*"),c){case"i1":case"i8":P()[n>>>0]=l;break;case"i16":ee()[n>>>1>>>0]=l;break;case"i32":N()[n>>>2>>>0]=l;break;case"i64":K[n>>>3]=BigInt(l);break;case"float":De()[n>>>2>>>0]=l;break;case"double":_e()[n>>>3>>>0]=l;break;case"*":de()[n>>>2>>>0]=l;break;default:pt(`invalid type for setValue: ${c}`)}},i.getValue=function(n,l="i8"){switch(l.endsWith("*")&&(l="*"),l){case"i1":case"i8":return P()[n>>>0];case"i16":return ee()[n>>>1>>>0];case"i32":return N()[n>>>2>>>0];case"i64":return K[n>>>3];case"float":return De()[n>>>2>>>0];case"double":return _e()[n>>>3>>>0];case"*":return de()[n>>>2>>>0];default:pt(`invalid type for getValue: ${l}`)}},i.UTF8ToString=Ce,i.stringToUTF8=Tt,i.lengthBytesUTF8=pr;var cm=[ar,$n,Sn,An,On,Rn,Bn,Mn,Nn,Dn,Pn,Ln,Un,Wn,qn,Fn,is,rs,as,us,ls,ds,ps,cs,fs],wr={893836:(n,l,c,m,w)=>{if(i===void 0||!i.Fb)return 1;if((n=Ce(Number(n>>>0))).startsWith("./")&&(n=n.substring(2)),!(n=i.Fb.get(n)))return 2;if(l=Number(l>>>0),c=Number(c>>>0),m=Number(m>>>0),l+c>n.byteLength)return 3;try{let k=n.subarray(l,l+c);switch(w){case 0:q().set(k,m>>>0);break;case 1:i.mc?i.mc(m,k):i.cc(m,k);break;default:return 4}return 0}catch{return 4}},894660:(n,l,c)=>{i.Pb(n,q().subarray(l>>>0,l+c>>>0))},894724:()=>i.oc(),894766:n=>{i.Ob(n)},894803:()=>{i.Wb()},894834:()=>{i.Xb()},894863:()=>{i.ac()},894888:n=>i.Vb(n),894921:n=>i.Zb(n),894953:(n,l,c)=>{i.Lb(Number(n),Number(l),Number(c),!0)},895016:(n,l,c)=>{i.Lb(Number(n),Number(l),Number(c))},895073:()=>typeof wasmOffsetConverter<"u",895130:n=>{i.Ab("Abs",n,void 0)},895181:n=>{i.Ab("Neg",n,void 0)},895232:n=>{i.Ab("Floor",n,void 0)},895285:n=>{i.Ab("Ceil",n,void 0)},895337:n=>{i.Ab("Reciprocal",n,void 0)},895395:n=>{i.Ab("Sqrt",n,void 0)},895447:n=>{i.Ab("Exp",n,void 0)},895498:n=>{i.Ab("Erf",n,void 0)},895549:n=>{i.Ab("Sigmoid",n,void 0)},895604:(n,l,c)=>{i.Ab("HardSigmoid",n,{alpha:l,beta:c})},895683:n=>{i.Ab("Log",n,void 0)},895734:n=>{i.Ab("Sin",n,void 0)},895785:n=>{i.Ab("Cos",n,void 0)},895836:n=>{i.Ab("Tan",n,void 0)},895887:n=>{i.Ab("Asin",n,void 0)},895939:n=>{i.Ab("Acos",n,void 0)},895991:n=>{i.Ab("Atan",n,void 0)},896043:n=>{i.Ab("Sinh",n,void 0)},896095:n=>{i.Ab("Cosh",n,void 0)},896147:n=>{i.Ab("Asinh",n,void 0)},896200:n=>{i.Ab("Acosh",n,void 0)},896253:n=>{i.Ab("Atanh",n,void 0)},896306:n=>{i.Ab("Tanh",n,void 0)},896358:n=>{i.Ab("Not",n,void 0)},896409:(n,l,c)=>{i.Ab("Clip",n,{min:l,max:c})},896478:n=>{i.Ab("Clip",n,void 0)},896530:(n,l)=>{i.Ab("Elu",n,{alpha:l})},896588:n=>{i.Ab("Gelu",n,void 0)},896640:n=>{i.Ab("Relu",n,void 0)},896692:(n,l)=>{i.Ab("LeakyRelu",n,{alpha:l})},896756:(n,l)=>{i.Ab("ThresholdedRelu",n,{alpha:l})},896826:(n,l)=>{i.Ab("Cast",n,{to:l})},896884:n=>{i.Ab("Add",n,void 0)},896935:n=>{i.Ab("Sub",n,void 0)},896986:n=>{i.Ab("Mul",n,void 0)},897037:n=>{i.Ab("Div",n,void 0)},897088:n=>{i.Ab("Pow",n,void 0)},897139:n=>{i.Ab("Equal",n,void 0)},897192:n=>{i.Ab("Greater",n,void 0)},897247:n=>{i.Ab("GreaterOrEqual",n,void 0)},897309:n=>{i.Ab("Less",n,void 0)},897361:n=>{i.Ab("LessOrEqual",n,void 0)},897420:(n,l,c,m,w)=>{i.Ab("ReduceMean",n,{keepDims:!!l,noopWithEmptyAxes:!!c,axes:m?Array.from(N().subarray(Number(m)>>>0,Number(w)>>>0)):[]})},897595:(n,l,c,m,w)=>{i.Ab("ReduceMax",n,{keepDims:!!l,noopWithEmptyAxes:!!c,axes:m?Array.from(N().subarray(Number(m)>>>0,Number(w)>>>0)):[]})},897769:(n,l,c,m,w)=>{i.Ab("ReduceMin",n,{keepDims:!!l,noopWithEmptyAxes:!!c,axes:m?Array.from(N().subarray(Number(m)>>>0,Number(w)>>>0)):[]})},897943:(n,l,c,m,w)=>{i.Ab("ReduceProd",n,{keepDims:!!l,noopWithEmptyAxes:!!c,axes:m?Array.from(N().subarray(Number(m)>>>0,Number(w)>>>0)):[]})},898118:(n,l,c,m,w)=>{i.Ab("ReduceSum",n,{keepDims:!!l,noopWithEmptyAxes:!!c,axes:m?Array.from(N().subarray(Number(m)>>>0,Number(w)>>>0)):[]})},898292:(n,l,c,m,w)=>{i.Ab("ReduceL1",n,{keepDims:!!l,noopWithEmptyAxes:!!c,axes:m?Array.from(N().subarray(Number(m)>>>0,Number(w)>>>0)):[]})},898465:(n,l,c,m,w)=>{i.Ab("ReduceL2",n,{keepDims:!!l,noopWithEmptyAxes:!!c,axes:m?Array.from(N().subarray(Number(m)>>>0,Number(w)>>>0)):[]})},898638:(n,l,c,m,w)=>{i.Ab("ReduceLogSum",n,{keepDims:!!l,noopWithEmptyAxes:!!c,axes:m?Array.from(N().subarray(Number(m)>>>0,Number(w)>>>0)):[]})},898815:(n,l,c,m,w)=>{i.Ab("ReduceSumSquare",n,{keepDims:!!l,noopWithEmptyAxes:!!c,axes:m?Array.from(N().subarray(Number(m)>>>0,Number(w)>>>0)):[]})},898995:(n,l,c,m,w)=>{i.Ab("ReduceLogSumExp",n,{keepDims:!!l,noopWithEmptyAxes:!!c,axes:m?Array.from(N().subarray(Number(m)>>>0,Number(w)>>>0)):[]})},899175:n=>{i.Ab("Where",n,void 0)},899228:(n,l,c)=>{i.Ab("Transpose",n,{perm:l?Array.from(N().subarray(Number(l)>>>0,Number(c)>>>0)):[]})},899352:(n,l,c,m)=>{i.Ab("DepthToSpace",n,{blocksize:l,mode:Ce(c),format:m?"NHWC":"NCHW"})},899485:(n,l,c,m)=>{i.Ab("DepthToSpace",n,{blocksize:l,mode:Ce(c),format:m?"NHWC":"NCHW"})},899618:(n,l,c,m,w,k,I,O,D,W,Z,te,le,he,Se)=>{i.Ab("ConvTranspose",n,{format:D?"NHWC":"NCHW",autoPad:l,dilations:[c],group:m,kernelShape:[w],pads:[k,I],strides:[O],wIsConst:()=>!!P()[W>>>0],outputPadding:Z?Array.from(N().subarray(Number(Z)>>>0,Number(te)>>>0)):[],outputShape:le?Array.from(N().subarray(Number(le)>>>0,Number(he)>>>0)):[],activation:Ce(Se)})},900051:(n,l,c,m,w,k,I,O,D,W,Z,te,le,he)=>{i.Ab("ConvTranspose",n,{format:O?"NHWC":"NCHW",autoPad:l,dilations:Array.from(N().subarray(Number(c)>>>0,2+(Number(c)>>>0)>>>0)),group:m,kernelShape:Array.from(N().subarray(Number(w)>>>0,2+(Number(w)>>>0)>>>0)),pads:Array.from(N().subarray(Number(k)>>>0,4+(Number(k)>>>0)>>>0)),strides:Array.from(N().subarray(Number(I)>>>0,2+(Number(I)>>>0)>>>0)),wIsConst:()=>!!P()[D>>>0],outputPadding:W?Array.from(N().subarray(Number(W)>>>0,Number(Z)>>>0)):[],outputShape:te?Array.from(N().subarray(Number(te)>>>0,Number(le)>>>0)):[],activation:Ce(he)})},900712:(n,l,c,m,w,k,I,O,D,W,Z,te,le,he,Se)=>{i.Ab("ConvTranspose",n,{format:D?"NHWC":"NCHW",autoPad:l,dilations:[c],group:m,kernelShape:[w],pads:[k,I],strides:[O],wIsConst:()=>!!P()[W>>>0],outputPadding:Z?Array.from(N().subarray(Number(Z)>>>0,Number(te)>>>0)):[],outputShape:le?Array.from(N().subarray(Number(le)>>>0,Number(he)>>>0)):[],activation:Ce(Se)})},901145:(n,l,c,m,w,k,I,O,D,W,Z,te,le,he)=>{i.Ab("ConvTranspose",n,{format:O?"NHWC":"NCHW",autoPad:l,dilations:Array.from(N().subarray(Number(c)>>>0,2+(Number(c)>>>0)>>>0)),group:m,kernelShape:Array.from(N().subarray(Number(w)>>>0,2+(Number(w)>>>0)>>>0)),pads:Array.from(N().subarray(Number(k)>>>0,4+(Number(k)>>>0)>>>0)),strides:Array.from(N().subarray(Number(I)>>>0,2+(Number(I)>>>0)>>>0)),wIsConst:()=>!!P()[D>>>0],outputPadding:W?Array.from(N().subarray(Number(W)>>>0,Number(Z)>>>0)):[],outputShape:te?Array.from(N().subarray(Number(te)>>>0,Number(le)>>>0)):[],activation:Ce(he)})},901806:(n,l)=>{i.Ab("GlobalAveragePool",n,{format:l?"NHWC":"NCHW"})},901897:(n,l,c,m,w,k,I,O,D,W,Z,te,le,he)=>{i.Ab("AveragePool",n,{format:he?"NHWC":"NCHW",auto_pad:l,ceil_mode:c,count_include_pad:m,storage_order:w,dilations:k?Array.from(N().subarray(Number(k)>>>0,Number(I)>>>0)):[],kernel_shape:O?Array.from(N().subarray(Number(O)>>>0,Number(D)>>>0)):[],pads:W?Array.from(N().subarray(Number(W)>>>0,Number(Z)>>>0)):[],strides:te?Array.from(N().subarray(Number(te)>>>0,Number(le)>>>0)):[]})},902376:(n,l)=>{i.Ab("GlobalAveragePool",n,{format:l?"NHWC":"NCHW"})},902467:(n,l,c,m,w,k,I,O,D,W,Z,te,le,he)=>{i.Ab("AveragePool",n,{format:he?"NHWC":"NCHW",auto_pad:l,ceil_mode:c,count_include_pad:m,storage_order:w,dilations:k?Array.from(N().subarray(Number(k)>>>0,Number(I)>>>0)):[],kernel_shape:O?Array.from(N().subarray(Number(O)>>>0,Number(D)>>>0)):[],pads:W?Array.from(N().subarray(Number(W)>>>0,Number(Z)>>>0)):[],strides:te?Array.from(N().subarray(Number(te)>>>0,Number(le)>>>0)):[]})},902946:(n,l)=>{i.Ab("GlobalMaxPool",n,{format:l?"NHWC":"NCHW"})},903033:(n,l,c,m,w,k,I,O,D,W,Z,te,le,he)=>{i.Ab("MaxPool",n,{format:he?"NHWC":"NCHW",auto_pad:l,ceil_mode:c,count_include_pad:m,storage_order:w,dilations:k?Array.from(N().subarray(Number(k)>>>0,Number(I)>>>0)):[],kernel_shape:O?Array.from(N().subarray(Number(O)>>>0,Number(D)>>>0)):[],pads:W?Array.from(N().subarray(Number(W)>>>0,Number(Z)>>>0)):[],strides:te?Array.from(N().subarray(Number(te)>>>0,Number(le)>>>0)):[]})},903508:(n,l)=>{i.Ab("GlobalMaxPool",n,{format:l?"NHWC":"NCHW"})},903595:(n,l,c,m,w,k,I,O,D,W,Z,te,le,he)=>{i.Ab("MaxPool",n,{format:he?"NHWC":"NCHW",auto_pad:l,ceil_mode:c,count_include_pad:m,storage_order:w,dilations:k?Array.from(N().subarray(Number(k)>>>0,Number(I)>>>0)):[],kernel_shape:O?Array.from(N().subarray(Number(O)>>>0,Number(D)>>>0)):[],pads:W?Array.from(N().subarray(Number(W)>>>0,Number(Z)>>>0)):[],strides:te?Array.from(N().subarray(Number(te)>>>0,Number(le)>>>0)):[]})},904070:(n,l,c,m,w)=>{i.Ab("Gemm",n,{alpha:l,beta:c,transA:m,transB:w})},904174:n=>{i.Ab("MatMul",n,void 0)},904228:(n,l,c,m)=>{i.Ab("ArgMax",n,{keepDims:!!l,selectLastIndex:!!c,axis:m})},904336:(n,l,c,m)=>{i.Ab("ArgMin",n,{keepDims:!!l,selectLastIndex:!!c,axis:m})},904444:(n,l)=>{i.Ab("Softmax",n,{axis:l})},904507:(n,l)=>{i.Ab("Concat",n,{axis:l})},904567:(n,l,c,m,w)=>{i.Ab("Split",n,{axis:l,numOutputs:c,splitSizes:m?Array.from(N().subarray(Number(m)>>>0,Number(w)>>>0)):[]})},904723:n=>{i.Ab("Expand",n,void 0)},904777:(n,l)=>{i.Ab("Gather",n,{axis:Number(l)})},904848:(n,l)=>{i.Ab("GatherElements",n,{axis:Number(l)})},904927:(n,l)=>{i.Ab("GatherND",n,{batch_dims:Number(l)})},905006:(n,l,c,m,w,k,I,O,D,W,Z)=>{i.Ab("Resize",n,{antialias:l,axes:c?Array.from(N().subarray(Number(c)>>>0,Number(m)>>>0)):[],coordinateTransformMode:Ce(w),cubicCoeffA:k,excludeOutside:I,extrapolationValue:O,keepAspectRatioPolicy:Ce(D),mode:Ce(W),nearestMode:Ce(Z)})},905368:(n,l,c,m,w,k,I)=>{i.Ab("Slice",n,{starts:l?Array.from(N().subarray(Number(l)>>>0,Number(c)>>>0)):[],ends:m?Array.from(N().subarray(Number(m)>>>0,Number(w)>>>0)):[],axes:k?Array.from(N().subarray(Number(k)>>>0,Number(I)>>>0)):[]})},905632:n=>{i.Ab("Tile",n,void 0)},905684:(n,l,c)=>{i.Ab("InstanceNormalization",n,{epsilon:l,format:c?"NHWC":"NCHW"})},905798:(n,l,c)=>{i.Ab("InstanceNormalization",n,{epsilon:l,format:c?"NHWC":"NCHW"})},905912:n=>{i.Ab("Range",n,void 0)},905965:(n,l)=>{i.Ab("Einsum",n,{equation:Ce(l)})},906046:(n,l,c,m,w)=>{i.Ab("Pad",n,{mode:l,value:c,pads:m?Array.from(N().subarray(Number(m)>>>0,Number(w)>>>0)):[]})},906189:(n,l,c,m,w,k)=>{i.Ab("BatchNormalization",n,{epsilon:l,momentum:c,spatial:!!w,trainingMode:!!m,format:k?"NHWC":"NCHW"})},906358:(n,l,c,m,w,k)=>{i.Ab("BatchNormalization",n,{epsilon:l,momentum:c,spatial:!!w,trainingMode:!!m,format:k?"NHWC":"NCHW"})},906527:(n,l,c)=>{i.Ab("CumSum",n,{exclusive:Number(l),reverse:Number(c)})},906624:(n,l,c)=>{i.Ab("DequantizeLinear",n,{axis:l,blockSize:c})},906714:(n,l,c,m,w)=>{i.Ab("GridSample",n,{align_corners:l,mode:Ce(c),padding_mode:Ce(m),format:w?"NHWC":"NCHW"})},906884:(n,l,c,m,w)=>{i.Ab("GridSample",n,{align_corners:l,mode:Ce(c),padding_mode:Ce(m),format:w?"NHWC":"NCHW"})},907054:(n,l)=>{i.Ab("ScatterND",n,{reduction:Ce(l)})},907139:(n,l,c,m,w,k,I,O,D)=>{i.Ab("Attention",n,{numHeads:l,isUnidirectional:c,maskFilterValue:m,scale:w,doRotary:k,qkvHiddenSizes:I?Array.from(N().subarray(Number(O)>>>0,Number(O)+I>>>0)):[],pastPresentShareBuffer:!!D})},907411:n=>{i.Ab("BiasAdd",n,void 0)},907466:n=>{i.Ab("BiasSplitGelu",n,void 0)},907527:n=>{i.Ab("FastGelu",n,void 0)},907583:(n,l,c,m,w,k,I,O,D,W,Z,te,le,he,Se,Pe)=>{i.Ab("Conv",n,{format:te?"NHWC":"NCHW",auto_pad:l,dilations:c?Array.from(N().subarray(Number(c)>>>0,Number(m)>>>0)):[],group:w,kernel_shape:k?Array.from(N().subarray(Number(k)>>>0,Number(I)>>>0)):[],pads:O?Array.from(N().subarray(Number(O)>>>0,Number(D)>>>0)):[],strides:W?Array.from(N().subarray(Number(W)>>>0,Number(Z)>>>0)):[],w_is_const:()=>!!P()[Number(le)>>>0],activation:Ce(he),activation_params:Se?Array.from(De().subarray(Number(Se)>>>0,Number(Pe)>>>0)):[]})},908167:n=>{i.Ab("Gelu",n,void 0)},908219:(n,l,c,m,w,k,I,O,D)=>{i.Ab("GroupQueryAttention",n,{numHeads:l,kvNumHeads:c,scale:m,softcap:w,doRotary:k,rotaryInterleaved:I,smoothSoftmax:O,localWindowSize:D})},908436:(n,l,c,m)=>{i.Ab("LayerNormalization",n,{axis:l,epsilon:c,simplified:!!m})},908547:(n,l,c,m)=>{i.Ab("LayerNormalization",n,{axis:l,epsilon:c,simplified:!!m})},908658:(n,l,c,m,w,k)=>{i.Ab("MatMulNBits",n,{k:l,n:c,accuracyLevel:m,bits:w,blockSize:k})},908785:(n,l,c,m,w,k)=>{i.Ab("MultiHeadAttention",n,{numHeads:l,isUnidirectional:c,maskFilterValue:m,scale:w,doRotary:k})},908944:(n,l)=>{i.Ab("QuickGelu",n,{alpha:l})},909008:(n,l,c,m,w)=>{i.Ab("RotaryEmbedding",n,{interleaved:!!l,numHeads:c,rotaryEmbeddingDim:m,scale:w})},909147:(n,l,c)=>{i.Ab("SkipLayerNormalization",n,{epsilon:l,simplified:!!c})},909249:(n,l,c)=>{i.Ab("SkipLayerNormalization",n,{epsilon:l,simplified:!!c})},909351:(n,l,c,m)=>{i.Ab("GatherBlockQuantized",n,{gatherAxis:l,quantizeAxis:c,blockSize:m})},909472:n=>{i.$b(n)},909506:(n,l)=>i.bc(Number(n),Number(l),i.Gb.ec,i.Gb.errors)};function fm(n,l,c){return Xn(async()=>{await i.Yb(Number(n),Number(l),Number(c))})}function hm(){return typeof wasmOffsetConverter<"u"}var B=await async function(){function n(m,w){return B=m.exports,B=function(){var k=B,I={};for(let[O,D]of Object.entries(k))I[O]=typeof D=="function"?(...W)=>{xi.push(O);try{return D(...W)}finally{V||(xi.pop(),Je&&mt===1&&xi.length===0&&(mt=0,ct+=1,vi(ks),typeof Fibers<"u"&&Fibers.sc()))}}:D;return I}(),B=function(){var k=B,I=D=>W=>D(W)>>>0,O=D=>()=>D()>>>0;return(k=Object.assign({},k)).Ea=I(k.Ea),k.gb=O(k.gb),k.ib=I(k.ib),k.tb=I(k.tb),k.ub=O(k.ub),k.__cxa_get_exception_ptr=I(k.__cxa_get_exception_ptr),k}(),vn.push(B.jb),b=w,yn(),B}Zt++;var l=_n();if(i.instantiateWasm)return new Promise(m=>{i.instantiateWasm(l,(w,k)=>{m(n(w,k))})});if(u)return new Promise(m=>{j=w=>{var k=new WebAssembly.Instance(w,_n());m(n(k,w))}});Kt??=i.locateFile?i.locateFile?i.locateFile("ort-wasm-simd-threaded.jsep.wasm",$):$+"ort-wasm-simd-threaded.jsep.wasm":new URL("/ai/nadha/assets/ort-wasm-simd-threaded.jsep-BGTZ4Y7F.wasm",import.meta.url).href;try{var c=await async function(m){var w=Kt;if(!x&&typeof WebAssembly.instantiateStreaming=="function"&&!ge(w))try{var k=fetch(w,{credentials:"same-origin"});return await WebAssembly.instantiateStreaming(k,m)}catch(I){ne(`wasm streaming compile failed: ${I}`),ne("falling back to ArrayBuffer instantiation")}return async function(I,O){try{var D=await async function(W){if(!x)try{var Z=await h(W);return new Uint8Array(Z)}catch{}if(W==Kt&&x)W=new Uint8Array(x);else{if(!g)throw"both async and sync fetching of the wasm failed";W=g(W)}return W}(I);return await WebAssembly.instantiate(D,O)}catch(W){ne(`failed to asynchronously prepare wasm: ${W}`),pt(W)}}(w,m)}(l);return n(c.instance,c.module)}catch(m){return r(m),Promise.reject(m)}}(),ms=n=>(ms=B.Ea)(n),gs=()=>(gs=B.Fa)();i._OrtInit=(n,l)=>(i._OrtInit=B.Ga)(n,l),i._OrtGetLastError=(n,l)=>(i._OrtGetLastError=B.Ha)(n,l),i._OrtCreateSessionOptions=(n,l,c,m,w,k,I,O,D,W)=>(i._OrtCreateSessionOptions=B.Ia)(n,l,c,m,w,k,I,O,D,W),i._OrtAppendExecutionProvider=(n,l,c,m,w)=>(i._OrtAppendExecutionProvider=B.Ja)(n,l,c,m,w),i._OrtAddFreeDimensionOverride=(n,l,c)=>(i._OrtAddFreeDimensionOverride=B.Ka)(n,l,c),i._OrtAddSessionConfigEntry=(n,l,c)=>(i._OrtAddSessionConfigEntry=B.La)(n,l,c),i._OrtReleaseSessionOptions=n=>(i._OrtReleaseSessionOptions=B.Ma)(n),i._OrtCreateSession=(n,l,c)=>(i._OrtCreateSession=B.Na)(n,l,c),i._OrtReleaseSession=n=>(i._OrtReleaseSession=B.Oa)(n),i._OrtGetInputOutputCount=(n,l,c)=>(i._OrtGetInputOutputCount=B.Pa)(n,l,c),i._OrtGetInputOutputMetadata=(n,l,c,m)=>(i._OrtGetInputOutputMetadata=B.Qa)(n,l,c,m),i._OrtFree=n=>(i._OrtFree=B.Ra)(n),i._OrtCreateTensor=(n,l,c,m,w,k)=>(i._OrtCreateTensor=B.Sa)(n,l,c,m,w,k),i._OrtGetTensorData=(n,l,c,m,w)=>(i._OrtGetTensorData=B.Ta)(n,l,c,m,w),i._OrtReleaseTensor=n=>(i._OrtReleaseTensor=B.Ua)(n),i._OrtCreateRunOptions=(n,l,c,m)=>(i._OrtCreateRunOptions=B.Va)(n,l,c,m),i._OrtAddRunConfigEntry=(n,l,c)=>(i._OrtAddRunConfigEntry=B.Wa)(n,l,c),i._OrtReleaseRunOptions=n=>(i._OrtReleaseRunOptions=B.Xa)(n),i._OrtCreateBinding=n=>(i._OrtCreateBinding=B.Ya)(n),i._OrtBindInput=(n,l,c)=>(i._OrtBindInput=B.Za)(n,l,c),i._OrtBindOutput=(n,l,c,m)=>(i._OrtBindOutput=B._a)(n,l,c,m),i._OrtClearBoundOutputs=n=>(i._OrtClearBoundOutputs=B.$a)(n),i._OrtReleaseBinding=n=>(i._OrtReleaseBinding=B.ab)(n),i._OrtRunWithBinding=(n,l,c,m,w)=>(i._OrtRunWithBinding=B.bb)(n,l,c,m,w),i._OrtRun=(n,l,c,m,w,k,I,O)=>(i._OrtRun=B.cb)(n,l,c,m,w,k,I,O),i._OrtEndProfiling=n=>(i._OrtEndProfiling=B.db)(n),i._JsepOutput=(n,l,c)=>(i._JsepOutput=B.eb)(n,l,c),i._JsepGetNodeName=n=>(i._JsepGetNodeName=B.fb)(n);var br=()=>(br=B.gb)(),st=i._free=n=>(st=i._free=B.hb)(n),Ii=i._malloc=n=>(Ii=i._malloc=B.ib)(n),$r=(n,l,c,m,w,k)=>($r=B.kb)(n,l,c,m,w,k),ys=()=>(ys=B.lb)(),_s=(n,l,c,m,w)=>(_s=B.mb)(n,l,c,m,w),ws=n=>(ws=B.nb)(n),vr=n=>(vr=B.ob)(n),bs=(n,l)=>(bs=B.pb)(n,l),$s=()=>($s=B.qb)(),vs=(n,l)=>(vs=B.rb)(n,l),Ei=n=>(Ei=B.sb)(n),xr=n=>(xr=B.tb)(n),Tr=()=>(Tr=B.ub)(),xs=i.dynCall_ii=(n,l)=>(xs=i.dynCall_ii=B.vb)(n,l);i.dynCall_vii=(n,l,c)=>(i.dynCall_vii=B.dynCall_vii)(n,l,c),i.dynCall_iiiii=(n,l,c,m,w)=>(i.dynCall_iiiii=B.dynCall_iiiii)(n,l,c,m,w),i.dynCall_iii=(n,l,c)=>(i.dynCall_iii=B.dynCall_iii)(n,l,c),i.dynCall_iiiiii=(n,l,c,m,w,k)=>(i.dynCall_iiiiii=B.dynCall_iiiiii)(n,l,c,m,w,k),i.dynCall_iiiiiiii=(n,l,c,m,w,k,I,O)=>(i.dynCall_iiiiiiii=B.dynCall_iiiiiiii)(n,l,c,m,w,k,I,O),i.dynCall_iiiiiii=(n,l,c,m,w,k,I)=>(i.dynCall_iiiiiii=B.dynCall_iiiiiii)(n,l,c,m,w,k,I),i.dynCall_vi=(n,l)=>(i.dynCall_vi=B.dynCall_vi)(n,l),i.dynCall_iiii=(n,l,c,m)=>(i.dynCall_iiii=B.dynCall_iiii)(n,l,c,m),i.dynCall_i=n=>(i.dynCall_i=B.dynCall_i)(n),i.dynCall_viiiiiiii=(n,l,c,m,w,k,I,O,D)=>(i.dynCall_viiiiiiii=B.dynCall_viiiiiiii)(n,l,c,m,w,k,I,O,D),i.dynCall_viii=(n,l,c,m)=>(i.dynCall_viii=B.dynCall_viii)(n,l,c,m),i.dynCall_viijj=(n,l,c,m,w)=>(i.dynCall_viijj=B.dynCall_viijj)(n,l,c,m,w),i.dynCall_viiiiii=(n,l,c,m,w,k,I)=>(i.dynCall_viiiiii=B.dynCall_viiiiii)(n,l,c,m,w,k,I),i.dynCall_viiii=(n,l,c,m,w)=>(i.dynCall_viiii=B.dynCall_viiii)(n,l,c,m,w),i.dynCall_viiiii=(n,l,c,m,w,k)=>(i.dynCall_viiiii=B.dynCall_viiiii)(n,l,c,m,w,k),i.dynCall_vfiii=(n,l,c,m,w)=>(i.dynCall_vfiii=B.dynCall_vfiii)(n,l,c,m,w),i.dynCall_viiiiff=(n,l,c,m,w,k,I)=>(i.dynCall_viiiiff=B.dynCall_viiiiff)(n,l,c,m,w,k,I),i.dynCall_viiiiiff=(n,l,c,m,w,k,I,O)=>(i.dynCall_viiiiiff=B.dynCall_viiiiiff)(n,l,c,m,w,k,I,O),i.dynCall_ffff=(n,l,c,m)=>(i.dynCall_ffff=B.dynCall_ffff)(n,l,c,m),i.dynCall_viiff=(n,l,c,m,w)=>(i.dynCall_viiff=B.dynCall_viiff)(n,l,c,m,w),i.dynCall_fffffff=(n,l,c,m,w,k,I)=>(i.dynCall_fffffff=B.dynCall_fffffff)(n,l,c,m,w,k,I),i.dynCall_jjjjjjj=(n,l,c,m,w,k,I)=>(i.dynCall_jjjjjjj=B.dynCall_jjjjjjj)(n,l,c,m,w,k,I),i.dynCall_jjjjjj=(n,l,c,m,w,k)=>(i.dynCall_jjjjjj=B.dynCall_jjjjjj)(n,l,c,m,w,k),i.dynCall_iijjii=(n,l,c,m,w,k)=>(i.dynCall_iijjii=B.dynCall_iijjii)(n,l,c,m,w,k),i.dynCall_viiiiiiiiiiiii=(n,l,c,m,w,k,I,O,D,W,Z,te,le,he)=>(i.dynCall_viiiiiiiiiiiii=B.dynCall_viiiiiiiiiiiii)(n,l,c,m,w,k,I,O,D,W,Z,te,le,he),i.dynCall_viiiiiiiiii=(n,l,c,m,w,k,I,O,D,W,Z)=>(i.dynCall_viiiiiiiiii=B.dynCall_viiiiiiiiii)(n,l,c,m,w,k,I,O,D,W,Z),i.dynCall_viiiiiiiiiii=(n,l,c,m,w,k,I,O,D,W,Z,te)=>(i.dynCall_viiiiiiiiiii=B.dynCall_viiiiiiiiiii)(n,l,c,m,w,k,I,O,D,W,Z,te),i.dynCall_viiiiiiiiiiii=(n,l,c,m,w,k,I,O,D,W,Z,te,le)=>(i.dynCall_viiiiiiiiiiii=B.dynCall_viiiiiiiiiiii)(n,l,c,m,w,k,I,O,D,W,Z,te,le),i.dynCall_viiiiiiiiiiiiiiiiii=(n,l,c,m,w,k,I,O,D,W,Z,te,le,he,Se,Pe,ot,kt,ei)=>(i.dynCall_viiiiiiiiiiiiiiiiii=B.dynCall_viiiiiiiiiiiiiiiiii)(n,l,c,m,w,k,I,O,D,W,Z,te,le,he,Se,Pe,ot,kt,ei),i.dynCall_viiiiiiiii=(n,l,c,m,w,k,I,O,D,W)=>(i.dynCall_viiiiiiiii=B.dynCall_viiiiiiiii)(n,l,c,m,w,k,I,O,D,W),i.dynCall_viiiiiiiiiiiiiiiiiii=(n,l,c,m,w,k,I,O,D,W,Z,te,le,he,Se,Pe,ot,kt,ei,kr)=>(i.dynCall_viiiiiiiiiiiiiiiiiii=B.dynCall_viiiiiiiiiiiiiiiiiii)(n,l,c,m,w,k,I,O,D,W,Z,te,le,he,Se,Pe,ot,kt,ei,kr),i.dynCall_viiiiiii=(n,l,c,m,w,k,I,O)=>(i.dynCall_viiiiiii=B.dynCall_viiiiiii)(n,l,c,m,w,k,I,O),i.dynCall_viiiiiiiiiiiiiii=(n,l,c,m,w,k,I,O,D,W,Z,te,le,he,Se,Pe)=>(i.dynCall_viiiiiiiiiiiiiii=B.dynCall_viiiiiiiiiiiiiii)(n,l,c,m,w,k,I,O,D,W,Z,te,le,he,Se,Pe),i.dynCall_jiji=(n,l,c,m)=>(i.dynCall_jiji=B.dynCall_jiji)(n,l,c,m),i.dynCall_v=n=>(i.dynCall_v=B.dynCall_v)(n),i.dynCall_iidiiii=(n,l,c,m,w,k,I)=>(i.dynCall_iidiiii=B.dynCall_iidiiii)(n,l,c,m,w,k,I),i.dynCall_iiiiiiiii=(n,l,c,m,w,k,I,O,D)=>(i.dynCall_iiiiiiiii=B.dynCall_iiiiiiiii)(n,l,c,m,w,k,I,O,D),i.dynCall_iiij=(n,l,c,m)=>(i.dynCall_iiij=B.dynCall_iiij)(n,l,c,m),i.dynCall_iiiiiiiiii=(n,l,c,m,w,k,I,O,D,W)=>(i.dynCall_iiiiiiiiii=B.dynCall_iiiiiiiiii)(n,l,c,m,w,k,I,O,D,W),i.dynCall_iiiiiiiiiiiii=(n,l,c,m,w,k,I,O,D,W,Z,te,le)=>(i.dynCall_iiiiiiiiiiiii=B.dynCall_iiiiiiiiiiiii)(n,l,c,m,w,k,I,O,D,W,Z,te,le),i.dynCall_iiiiiiiiiii=(n,l,c,m,w,k,I,O,D,W,Z)=>(i.dynCall_iiiiiiiiiii=B.dynCall_iiiiiiiiiii)(n,l,c,m,w,k,I,O,D,W,Z),i.dynCall_ji=(n,l)=>(i.dynCall_ji=B.dynCall_ji)(n,l),i.dynCall_iijii=(n,l,c,m,w)=>(i.dynCall_iijii=B.dynCall_iijii)(n,l,c,m,w),i.dynCall_vij=(n,l,c)=>(i.dynCall_vij=B.dynCall_vij)(n,l,c),i.dynCall_viiijii=(n,l,c,m,w,k,I)=>(i.dynCall_viiijii=B.dynCall_viiijii)(n,l,c,m,w,k,I),i.dynCall_viijiiiiiiiiiiiiii=(n,l,c,m,w,k,I,O,D,W,Z,te,le,he,Se,Pe,ot,kt)=>(i.dynCall_viijiiiiiiiiiiiiii=B.dynCall_viijiiiiiiiiiiiiii)(n,l,c,m,w,k,I,O,D,W,Z,te,le,he,Se,Pe,ot,kt),i.dynCall_viiiji=(n,l,c,m,w,k)=>(i.dynCall_viiiji=B.dynCall_viiiji)(n,l,c,m,w,k),i.dynCall_fiii=(n,l,c,m)=>(i.dynCall_fiii=B.dynCall_fiii)(n,l,c,m),i.dynCall_viijii=(n,l,c,m,w,k)=>(i.dynCall_viijii=B.dynCall_viijii)(n,l,c,m,w,k),i.dynCall_viij=(n,l,c,m)=>(i.dynCall_viij=B.dynCall_viij)(n,l,c,m),i.dynCall_jiij=(n,l,c,m)=>(i.dynCall_jiij=B.dynCall_jiij)(n,l,c,m),i.dynCall_fi=(n,l)=>(i.dynCall_fi=B.dynCall_fi)(n,l),i.dynCall_fii=(n,l,c)=>(i.dynCall_fii=B.dynCall_fii)(n,l,c),i.dynCall_jii=(n,l,c)=>(i.dynCall_jii=B.dynCall_jii)(n,l,c),i.dynCall_dii=(n,l,c)=>(i.dynCall_dii=B.dynCall_dii)(n,l,c),i.dynCall_fiiii=(n,l,c,m,w)=>(i.dynCall_fiiii=B.dynCall_fiiii)(n,l,c,m,w),i.dynCall_fif=(n,l,c)=>(i.dynCall_fif=B.dynCall_fif)(n,l,c),i.dynCall_jfi=(n,l,c)=>(i.dynCall_jfi=B.dynCall_jfi)(n,l,c),i.dynCall_viiiiiiiiiiiiii=(n,l,c,m,w,k,I,O,D,W,Z,te,le,he,Se)=>(i.dynCall_viiiiiiiiiiiiii=B.dynCall_viiiiiiiiiiiiii)(n,l,c,m,w,k,I,O,D,W,Z,te,le,he,Se),i.dynCall_viiiiiiiiiiiiiiiiiiii=(n,l,c,m,w,k,I,O,D,W,Z,te,le,he,Se,Pe,ot,kt,ei,kr,mm)=>(i.dynCall_viiiiiiiiiiiiiiiiiiii=B.dynCall_viiiiiiiiiiiiiiiiiiii)(n,l,c,m,w,k,I,O,D,W,Z,te,le,he,Se,Pe,ot,kt,ei,kr,mm),i.dynCall_viiiiiiiiiiiiiiii=(n,l,c,m,w,k,I,O,D,W,Z,te,le,he,Se,Pe,ot)=>(i.dynCall_viiiiiiiiiiiiiiii=B.dynCall_viiiiiiiiiiiiiiii)(n,l,c,m,w,k,I,O,D,W,Z,te,le,he,Se,Pe,ot),i.dynCall_iif=(n,l,c)=>(i.dynCall_iif=B.dynCall_iif)(n,l,c),i.dynCall_jiiii=(n,l,c,m,w)=>(i.dynCall_jiiii=B.dynCall_jiiii)(n,l,c,m,w),i.dynCall_jiii=(n,l,c,m)=>(i.dynCall_jiii=B.dynCall_jiii)(n,l,c,m),i.dynCall_viif=(n,l,c,m)=>(i.dynCall_viif=B.dynCall_viif)(n,l,c,m),i.dynCall_viiij=(n,l,c,m,w)=>(i.dynCall_viiij=B.dynCall_viiij)(n,l,c,m,w),i.dynCall_viiiijii=(n,l,c,m,w,k,I,O)=>(i.dynCall_viiiijii=B.dynCall_viiiijii)(n,l,c,m,w,k,I,O),i.dynCall_iiiiij=(n,l,c,m,w,k)=>(i.dynCall_iiiiij=B.dynCall_iiiiij)(n,l,c,m,w,k),i.dynCall_iiiiid=(n,l,c,m,w,k)=>(i.dynCall_iiiiid=B.dynCall_iiiiid)(n,l,c,m,w,k),i.dynCall_iiiiijj=(n,l,c,m,w,k,I)=>(i.dynCall_iiiiijj=B.dynCall_iiiiijj)(n,l,c,m,w,k,I),i.dynCall_iiiiiijj=(n,l,c,m,w,k,I,O)=>(i.dynCall_iiiiiijj=B.dynCall_iiiiiijj)(n,l,c,m,w,k,I,O);var Ts=n=>(Ts=B.wb)(n),ks=()=>(ks=B.xb)(),Cs=n=>(Cs=B.yb)(n),Ss=()=>(Ss=B.zb)();return function n(){if(0<Zt)Yt=n;else if(u)t(i),vt();else{for(;0<rr.length;)rr.shift()(i);0<Zt?Yt=n:(i.calledRun=!0,V||(vt(),t(i)))}}(),i.PTR_SIZE=4,a},zd=Ar,Es=globalThis.self?.name?.startsWith("em-pthread"),Es&&Ar()}),Or,Ta,zs,Le,Ad,Ai,As,Os,Rr,Rs,Br,Od,Mr,Rd,ja=U(()=>{Fa(),Or=typeof location>"u"?void 0:location.origin,Ta=import.meta.url>"file:"&&import.meta.url<"file;",zs=()=>{{if(Ta){let e=URL;return new URL(new e("ort.bundle.min.mjs",import.meta.url).href,Or).href}return import.meta.url}},Le=zs(),Ad=()=>{if(Le&&!Le.startsWith("blob:"))return Le.substring(0,Le.lastIndexOf("/")+1)},Ai=(e,t)=>{try{let r=t??Le;return(r?new URL(e,r):new URL(e)).origin===Or}catch{return!1}},As=(e,t)=>{let r=t??Le;try{return(r?new URL(e,r):new URL(e)).href}catch{return}},Os=(e,t)=>`${t??"./"}${e}`,Rr=async e=>{let t=await(await fetch(e,{credentials:"same-origin"})).blob();return URL.createObjectURL(t)},Rs=async e=>(await import(e)).default,Br=(Dm(),yi(Sd)).default,Od=async()=>{if(!Le)throw new Error("Failed to load proxy worker: cannot determine the script source URL.");if(Ai(Le))return[void 0,Br()];let e=await Rr(Le);return[e,Br(e)]},Mr=(Pm(),yi(Ed)).default,Rd=async(e,t,r,i)=>{let a=Mr&&!(e||t);if(a)if(Le)a=Ai(Le);else if(i&&!r)a=!0;else throw new Error("cannot determine the script source URL.");if(a)return[void 0,Mr];{let s="ort-wasm-simd-threaded.jsep.mjs",o=e??As(s,t),u=r&&o&&!Ai(o,t),d=u?await Rr(o):o??Os(s,t);return[u?d:void 0,await Rs(d)]}}}),Nr,Oi,ii,Dr,Bs,Ms,Ns,Va,be,Lt=U(()=>{ja(),Oi=!1,ii=!1,Dr=!1,Bs=()=>{if(typeof SharedArrayBuffer>"u")return!1;try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},Ms=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},Ns=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,19,1,17,0,65,1,253,15,65,2,253,15,65,3,253,15,253,147,2,11]))}catch{return!1}},Va=async e=>{if(Oi)return Promise.resolve();if(ii)throw new Error("multiple calls to 'initializeWebAssembly()' detected.");if(Dr)throw new Error("previous call to 'initializeWebAssembly()' failed.");ii=!0;let t=e.initTimeout,r=e.numThreads;if(e.simd!==!1){if(e.simd==="relaxed"){if(!Ns())throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.")}else if(!Ms())throw new Error("WebAssembly SIMD is not supported in the current environment.")}let i=Bs();r>1&&!i&&(typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+r+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."),e.numThreads=r=1);let a=e.wasmPaths,s=typeof a=="string"?a:void 0,o=a?.mjs,u=o?.href??o,d=a?.wasm,p=d?.href??d,f=e.wasmBinary,[h,g]=await Rd(u,s,r>1,!!f||!!p),y=!1,_=[];if(t>0&&_.push(new Promise($=>{setTimeout(()=>{y=!0,$()},t)})),_.push(new Promise(($,x)=>{let v={numThreads:r};if(f)v.wasmBinary=f;else if(p||s)v.locateFile=b=>p??s+b;else if(u&&u.indexOf("blob:")!==0)v.locateFile=b=>new URL(b,u).href;else if(h){let b=Ad();b&&(v.locateFile=C=>b+C)}g(v).then(b=>{ii=!1,Oi=!0,Nr=b,$(),h&&URL.revokeObjectURL(h)},b=>{ii=!1,Dr=!0,x(b)})})),await Promise.race(_),y)throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`)},be=()=>{if(Oi&&Nr)return Nr;throw new Error("WebAssembly is not initialized yet.")}}),Ye,Hi,ye,Ga=U(()=>{Lt(),Ye=(e,t)=>{let r=be(),i=r.lengthBytesUTF8(e)+1,a=r._malloc(i);return r.stringToUTF8(e,a,i),t.push(a),a},Hi=(e,t,r,i)=>{if(typeof e=="object"&&e!==null){if(r.has(e))throw new Error("Circular reference in options");r.add(e)}Object.entries(e).forEach(([a,s])=>{let o=t?t+a:a;if(typeof s=="object")Hi(s,o+".",r,i);else if(typeof s=="string"||typeof s=="number")i(o,s.toString());else if(typeof s=="boolean")i(o,s?"1":"0");else throw new Error(`Can't handle extra config type: ${typeof s}`)})},ye=e=>{let t=be(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetLastError(a,a+i);let s=Number(t.getValue(a,i===4?"i32":"i64")),o=t.getValue(a+i,"*"),u=o?t.UTF8ToString(o):"";throw new Error(`${e} ERROR_CODE: ${s}, ERROR_MESSAGE: ${u}`)}finally{t.stackRestore(r)}}}),Bd,Lm=U(()=>{Lt(),Ga(),Bd=e=>{let t=be(),r=0,i=[],a=e||{};try{if(e?.logSeverityLevel===void 0)a.logSeverityLevel=2;else if(typeof e.logSeverityLevel!="number"||!Number.isInteger(e.logSeverityLevel)||e.logSeverityLevel<0||e.logSeverityLevel>4)throw new Error(`log severity level is not valid: ${e.logSeverityLevel}`);if(e?.logVerbosityLevel===void 0)a.logVerbosityLevel=0;else if(typeof e.logVerbosityLevel!="number"||!Number.isInteger(e.logVerbosityLevel))throw new Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);e?.terminate===void 0&&(a.terminate=!1);let s=0;return e?.tag!==void 0&&(s=Ye(e.tag,i)),r=t._OrtCreateRunOptions(a.logSeverityLevel,a.logVerbosityLevel,!!a.terminate,s),r===0&&ye("Can't create run options."),e?.extra!==void 0&&Hi(e.extra,"",new WeakSet,(o,u)=>{let d=Ye(o,i),p=Ye(u,i);t._OrtAddRunConfigEntry(r,d,p)!==0&&ye(`Can't set a run config entry: ${o} - ${u}.`)}),[r,i]}catch(s){throw r!==0&&t._OrtReleaseRunOptions(r),i.forEach(o=>t._free(o)),s}}}),Ds,Ps,Ls,ri,Us,Md,Um=U(()=>{Lt(),Ga(),Ds=e=>{switch(e){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"layout":return 3;case"all":return 99;default:throw new Error(`unsupported graph optimization level: ${e}`)}},Ps=e=>{switch(e){case"sequential":return 0;case"parallel":return 1;default:throw new Error(`unsupported execution mode: ${e}`)}},Ls=e=>{e.extra||(e.extra={}),e.extra.session||(e.extra.session={});let t=e.extra.session;t.use_ort_model_bytes_directly||(t.use_ort_model_bytes_directly="1"),e.executionProviders&&e.executionProviders.some(r=>(typeof r=="string"?r:r.name)==="webgpu")&&(e.enableMemPattern=!1)},ri=(e,t,r,i)=>{let a=Ye(t,i),s=Ye(r,i);be()._OrtAddSessionConfigEntry(e,a,s)!==0&&ye(`Can't set a session config entry: ${t} - ${r}.`)},Us=async(e,t,r)=>{for(let i of t){let a=typeof i=="string"?i:i.name,s=[];switch(a){case"webnn":if(a="WEBNN",typeof i!="string"){let f=i?.deviceType;f&&ri(e,"deviceType",f,r)}break;case"webgpu":if(a="JS",typeof i!="string"){let f=i;if(f?.preferredLayout){if(f.preferredLayout!=="NCHW"&&f.preferredLayout!=="NHWC")throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${f.preferredLayout}`);ri(e,"preferredLayout",f.preferredLayout,r)}}break;case"wasm":case"cpu":continue;default:throw new Error(`not supported execution provider: ${a}`)}let o=Ye(a,r),u=s.length,d=0,p=0;if(u>0){d=be()._malloc(u*be().PTR_SIZE),r.push(d),p=be()._malloc(u*be().PTR_SIZE),r.push(p);for(let f=0;f<u;f++)be().setValue(d+f*be().PTR_SIZE,s[f][0],"*"),be().setValue(p+f*be().PTR_SIZE,s[f][1],"*")}await be()._OrtAppendExecutionProvider(e,o,d,p,u)!==0&&ye(`Can't append execution provider: ${a}.`)}},Md=async e=>{let t=be(),r=0,i=[],a=e||{};Ls(a);try{let s=Ds(a.graphOptimizationLevel??"all"),o=Ps(a.executionMode??"sequential"),u=typeof a.logId=="string"?Ye(a.logId,i):0,d=a.logSeverityLevel??2;if(!Number.isInteger(d)||d<0||d>4)throw new Error(`log severity level is not valid: ${d}`);let p=a.logVerbosityLevel??0;if(!Number.isInteger(p)||p<0||p>4)throw new Error(`log verbosity level is not valid: ${p}`);let f=typeof a.optimizedModelFilePath=="string"?Ye(a.optimizedModelFilePath,i):0;if(r=t._OrtCreateSessionOptions(s,!!a.enableCpuMemArena,!!a.enableMemPattern,o,!!a.enableProfiling,0,u,d,p,f),r===0&&ye("Can't create session options."),a.executionProviders&&await Us(r,a.executionProviders,i),a.enableGraphCapture!==void 0){if(typeof a.enableGraphCapture!="boolean")throw new Error(`enableGraphCapture must be a boolean value: ${a.enableGraphCapture}`);ri(r,"enableGraphCapture",a.enableGraphCapture.toString(),i)}if(a.freeDimensionOverrides)for(let[h,g]of Object.entries(a.freeDimensionOverrides)){if(typeof h!="string")throw new Error(`free dimension override name must be a string: ${h}`);if(typeof g!="number"||!Number.isInteger(g)||g<0)throw new Error(`free dimension override value must be a non-negative integer: ${g}`);let y=Ye(h,i);t._OrtAddFreeDimensionOverride(r,y,g)!==0&&ye(`Can't set a free dimension override: ${h} - ${g}.`)}return a.extra!==void 0&&Hi(a.extra,"",new WeakSet,(h,g)=>{ri(r,h,g,i)}),[r,i]}catch(s){throw r!==0&&t._OrtReleaseSessionOptions(r)!==0&&ye("Can't release session options."),i.forEach(o=>t._free(o)),s}}}),At,lt,Ot,er,Ki,Ha,Ka,ka,ie=U(()=>{At=e=>{switch(e){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;case"int4":return 22;case"uint4":return 21;default:throw new Error(`unsupported data type: ${e}`)}},lt=e=>{switch(e){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";case 22:return"int4";case 21:return"uint4";default:throw new Error(`unsupported data type: ${e}`)}},Ot=(e,t)=>{let r=[-1,4,1,1,2,2,4,8,-1,1,2,8,4,8,-1,-1,-1,-1,-1,-1,-1,.5,.5][e],i=typeof t=="number"?t:t.reduce((a,s)=>a*s,1);return r>0?Math.ceil(i*r):void 0},er=e=>{switch(e){case"float16":return typeof Float16Array<"u"&&Float16Array.from?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw new Error(`unsupported type: ${e}`)}},Ki=e=>{switch(e){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw new Error(`unsupported logging level: ${e}`)}},Ha=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",Ka=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint64"||e==="int8"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",ka=e=>{switch(e){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;case"ml-tensor":return 5;default:throw new Error(`unsupported data location: ${e}`)}}}),Za,Nd=U(()=>{Fa(),Za=async e=>{if(typeof e=="string"){let t=await fetch(e);if(!t.ok)throw new Error(`failed to load external data file: ${e}`);let r=t.headers.get("Content-Length"),i=r?parseInt(r,10):0;if(i<1073741824)return new Uint8Array(await t.arrayBuffer());{if(!t.body)throw new Error(`failed to load external data file: ${e}, no response body.`);let a=t.body.getReader(),s;try{s=new ArrayBuffer(i)}catch(u){if(u instanceof RangeError){let d=Math.ceil(i/65536);s=new WebAssembly.Memory({initial:d,maximum:d}).buffer}else throw u}let o=0;for(;;){let{done:u,value:d}=await a.read();if(u)break;let p=d.byteLength;new Uint8Array(s,o,p).set(d),o+=p}return new Uint8Array(s,0,i)}}else return e instanceof Blob?new Uint8Array(await e.arrayBuffer()):e instanceof Uint8Array?e:new Uint8Array(e)}}),Ws,qs,Fs,js,Ya,Vs,ce,dt=U(()=>{ie(),Ws=["V","I","W","E","F"],qs=(e,t)=>{console.log(`[${Ws[e]},${new Date().toISOString()}]${t}`)},Ya=(e,t)=>{Fs=e,js=t},Vs=(e,t)=>{let r=Ki(e),i=Ki(Fs);r>=i&&qs(r,typeof t=="function"?t():t)},ce=(...e)=>{js&&Vs(...e)}}),Gs,Vt,A,Zi,Dd,Pd,Ld,oe=U(()=>{Gs=class{static calcMatMulShape(e,t){return e[1]!==t[0]?void 0:[e[0],t[1]]}},Vt=class{static calcShape(e,t,r=!1){let i=e.length,a=t.length;if(i===0)return t;if(a===0)return e;let s=Math.max(e.length,t.length),o=new Array(s);if(r){if(i<2||a<2)return;let u=Gs.calcMatMulShape([e[i-2],e[i-1]],[t[a-2],t[a-1]]);if(u===void 0)return;[o[s-2],o[s-1]]=u}for(let u=r?3:1;u<=s;u++){let d=i-u<0?1:e[i-u],p=a-u<0?1:t[a-u];if(d!==p&&d>1&&p>1)return;let f=Math.max(d,p);if(d&&p)o[s-u]=Math.max(d,p);else{if(f>1)return;o[s-u]=0}}return o}static isValidBroadcast(e,t){let r=e.length,i=t.length;if(r>i)return!1;for(let a=1;a<=r;a++)if(e[r-a]!==1&&e[r-a]!==t[i-a])return!1;return!0}},A=class Fi{static size(t){return Fi.getSizeFromDimensionRange(t,0,t.length)}static convertShape(t,r=4){let i=t.length;if(i===0)return[];let a=new Array(i),s=i-1;for(;s>=0;){if(t[s]%r===0){a[s]=t[s]/r;break}if(r%t[s]!==0)throw new Error("cannot convert shape");a[s]=1,r/=t[s],s--}for(s--;s>=0;s--)a[s]=t[s];return a}static sizeFromDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeFromDimension as Tensor has ${t.length} dimensions.`);return Fi.getSizeFromDimensionRange(t,r,t.length)}static sizeToDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeToDimension as Tensor has ${t.length} dimensions.`);return Fi.getSizeFromDimensionRange(t,0,r)}static getSizeFromDimensionRange(t,r,i){let a=1;for(let s=r;s<i;s++){if(t[s]<0)throw new Error("cannot get valid size from specified dimension range. Most likely the range contains negative values in them.");a*=Number(t[s])}return a}static computeStrides(t){let r=t.length;if(r===0)return[];if(r===1)return[1];let i=new Array(r);i[r-1]=1,i[r-2]=t[r-1];for(let a=r-3;a>=0;--a)i[a]=i[a+1]*t[a+1];return i}static normalizeAxis(t,r){if(t<-r&&t>=r)throw new Error("unsupported axis for this operation.");return t<0?t+r:t}static normalizeAxes(t,r){return t.map(i=>this.normalizeAxis(i,r??t.length))}static sortBasedOnPerm(t,r){return r?r.map(i=>t[i]):t.slice().reverse()}static padShape(t,r){let i=t.length;return t.map((a,s)=>a+r[s]+r[s+i])}static areEqual(t,r){return t.length!==r.length?!1:t.every((i,a)=>i===r[a])}},Zi=class fi{static adjustPoolAttributes(t,r,i,a,s,o){if(!t&&i.length!==r.length-2)throw new Error("length of specified kernel shapes should be 2 less than length of input dimensions");if(t)for(let u=0;u<r.length-2;u++)u>=i.length?i.push(r[u+2]):i[u]=r[u+2];for(let u=0;u<i.length;u++)if(u<a.length){if(a[u]<0)throw new Error("strides should be greater than or equal to 1")}else a.push(1);for(let u=0;u<i.length;u++)if(u<s.length){if(s[u]<0)throw new Error("dilations should be greater than or equal to 1")}else s.push(1);for(let u=0;u<i.length*2;u++)if(u<o.length){if(o[u]<0)throw new Error("pad should be greater than or equal to 1")}else o.push(0);for(let u=0;u<i.length;u++){if(i[u]<=0)throw new Error("kernel shapes need to be greater than 0");if(o[u]>=i[u]||o[u+i.length]>=i[u])throw new Error("pads should be smaller than kernel")}}static adjustPadsBasedOnAutoPad(t,r,i,a,s,o,u){if(u){if(s.length!==2*(t.length-2))throw new Error("length of pads should be twice the length of data dimensions");if(r.length!==t.length-2)throw new Error("length of strides should be the length of data dimensions");if(a.length!==t.length-2)throw new Error("length of kernel shapes should be the length of data dimensions");for(let d=0;d<t.length-2;d++)fi.adjustPadAndReturnShape(t[d+(o?1:2)],r[d],i[d],a[d],s,d,d+t.length-2,u)}}static computePoolOutputShape(t,r,i,a,s,o,u){if(r.length<=0)throw new Error("input shape must be of size greater than 0");let d=[r[0],r[1]];return fi.computeShapeHelper(t,r,d,i,a,s,o,u),d}static computeConvOutputShape(t,r,i,a,s,o,u){if(t.length<=0||r.length<=0)throw new Error("invalid input tensor dims or invalid filter tensor dims");let d=[t[0],r[0]];return fi.computeShapeHelper(!1,t,d,i,a,s,o,u),d}static computeShapeHelper(t,r,i,a,s,o,u,d){if(t)for(let p=0;p<r.length-2;p++)i.push(1);else for(let p=0;p<r.length-2;p++)i.push(fi.adjustPadAndReturnShape(r[p+2],a[p],s[p],o[p],u,p,p+r.length-2,d))}static adjustPadAndReturnShape(t,r,i,a,s,o,u,d){let p=i*(a-1)+1;if(d&&d!=="NOTSET")switch(d){case"VALID":return s[o]=0,s[u]=0,Math.floor((t-p)/r+1);case"SAME_LOWER":case"SAME_UPPER":if(i!==1)throw new Error("Dilation not supported for SAME_UPPER or SAME_LOWER");{let f=((t+r-1)/r-1)*r+a-t;return s[o]=Math.floor(d==="SAME_LOWER"?(f+1)/2:f/2),s[u]=f-s[o],Math.floor((t+f-a)/r+1)}default:throw new Error("Unsupported AutoPad type")}else return Math.floor((t+s[o]+s[u]-p)/r+1)}},Dd=class{static getShapeOfGemmResult(e,t,r,i,a){if(e.length!==2||r.length!==2)throw new Error("shape need to be of size 2");let s,o,u;t?(s=e[1],o=e[0]):(s=e[0],o=e[1]);let d=-1;if(i?(u=r[0],d=1):(u=r[1],d=0),r[d]!==o)throw new Error("dimension mismatch");if(s<=0||u<=0||o<=0)throw new Error("invalid shape specified");if(a&&!Vt.isValidBroadcast(a,[s,u]))throw new Error("gemm: invalid bias shape for broadcast");return[s,u,o]}},Pd=-34028234663852886e22,Ld=34028234663852886e22}),Xa,Ud=U(()=>{ie(),Xa=(e,t)=>new(er(t))(e)}),Pr,Ca,Lr,Hs,Ur,Ks,Wr,qr,Fr,Zs,Wd,Wm=U(()=>{ie(),dt(),Pr=new Map([["float32",32],["float16",16],["int32",32],["uint32",32],["int64",64],["uint64",64],["int8",8],["uint8",8],["int4",4],["uint4",4]]),Ca=(e,t)=>{if(t==="int32")return e;let r=Pr.get(t);if(!r)throw new Error(`WebNN backend does not support data type: ${t}`);let i=r/8;if(e.byteLength%i!==0)throw new Error(`Invalid Uint8Array length - must be a multiple of ${i}.`);let a=e.byteLength/i,s=new(er(t))(e.buffer,e.byteOffset,a);switch(t){case"int64":case"uint64":{let o=new Int32Array(a);for(let u=0;u<a;u++){let d=s[u];if(d>2147483647n||d<-2147483648n)throw new Error("Can not convert int64 data to int32 - value out of range.");o[u]=Number(d)}return new Uint8Array(o.buffer)}case"int8":case"uint8":case"uint32":{if(t==="uint32"&&s.some(u=>u>2147483647))throw new Error("Can not convert uint32 data to int32 - value out of range.");let o=Int32Array.from(s,Number);return new Uint8Array(o.buffer)}default:throw new Error(`Unsupported data conversion from ${t} to 'int32'`)}},Lr=(e,t)=>{if(t==="int32")return e;if(e.byteLength%4!==0)throw new Error("Invalid Uint8Array length - must be a multiple of 4 (int32).");let r=e.byteLength/4,i=new Int32Array(e.buffer,e.byteOffset,r);switch(t){case"int64":{let a=BigInt64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"uint64":{if(i.some(s=>s<0))throw new Error("Can not convert int32 data to uin64 - negative value found.");let a=BigUint64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"int8":{if(i.some(s=>s<-128||s>127))throw new Error("Can not convert int32 data to int8 - value out of range.");let a=Int8Array.from(i,Number);return new Uint8Array(a.buffer)}case"uint8":{if(i.some(a=>a<0||a>255))throw new Error("Can not convert int32 data to uint8 - value out of range.");return Uint8Array.from(i,Number)}case"uint32":{if(i.some(s=>s<0))throw new Error("Can not convert int32 data to uint32 - negative value found.");let a=Uint32Array.from(i,Number);return new Uint8Array(a.buffer)}default:throw new Error(`Unsupported data conversion from 'int32' to ${t}`)}},Hs=1,Ur=()=>Hs++,Ks=new Map([["int8","int32"],["uint8","int32"],["uint32","int32"],["int64","int32"]]),Wr=(e,t)=>{let r=Pr.get(e);if(!r)throw new Error(`WebNN backend does not support data type: ${e}`);return t.length>0?Math.ceil(t.reduce((i,a)=>i*a)*r/8):0},qr=class{constructor(e){this.isDataConverted=!1;let{sessionId:t,context:r,tensor:i,dataType:a,shape:s,fallbackDataType:o}=e;this.sessionId=t,this.mlContext=r,this.mlTensor=i,this.dataType=a,this.tensorShape=s,this.fallbackDataType=o}get tensor(){return this.mlTensor}get type(){return this.dataType}get fallbackType(){return this.fallbackDataType}get shape(){return this.tensorShape}get byteLength(){return Wr(this.dataType,this.tensorShape)}destroy(){ce("verbose",()=>"[WebNN] TensorWrapper.destroy"),this.mlTensor.destroy()}write(e){this.mlContext.writeTensor(this.mlTensor,e)}async read(e){if(this.fallbackDataType){let t=await this.mlContext.readTensor(this.mlTensor),r=Lr(new Uint8Array(t),this.dataType);if(e){(e instanceof ArrayBuffer?new Uint8Array(e):new Uint8Array(e.buffer,e.byteOffset,e.byteLength)).set(r);return}else return r.buffer}else return e?this.mlContext.readTensor(this.mlTensor,e):this.mlContext.readTensor(this.mlTensor)}canReuseTensor(e,t,r){return this.mlContext===e&&this.dataType===t&&this.tensorShape.length===r.length&&this.tensorShape.every((i,a)=>i===r[a])}setIsDataConverted(e){this.isDataConverted=e}},Fr=class{constructor(e,t){this.tensorManager=e,this.wrapper=t}get tensorWrapper(){return this.wrapper}releaseTensor(){this.tensorWrapper&&(this.tensorManager.releaseTensor(this.tensorWrapper),this.wrapper=void 0)}async ensureTensor(e,t,r,i){let a=this.tensorManager.getMLContext(e),s;if(!a.opSupportLimits().input.dataTypes.includes(t)){if(s=Ks.get(t),!s||!a.opSupportLimits().input.dataTypes.includes(s))throw new Error(`WebNN backend does not support data type: ${t}`);ce("verbose",()=>`[WebNN] TensorIdTracker.ensureTensor: fallback dataType from ${t} to ${s}`)}if(this.wrapper){if(this.wrapper.canReuseTensor(a,t,r))return this.wrapper.tensor;if(i){if(this.wrapper.byteLength!==Wr(t,r))throw new Error("Unable to copy data to tensor with different size.");this.activeUpload=new Uint8Array(await this.wrapper.read())}this.tensorManager.releaseTensor(this.wrapper)}let o=typeof MLTensorUsage>"u"?void 0:MLTensorUsage.READ|MLTensorUsage.WRITE;return this.wrapper=await this.tensorManager.getCachedTensor(e,t,r,o,!0,!0,s),i&&this.activeUpload&&(this.wrapper.write(this.activeUpload),this.activeUpload=void 0),this.wrapper.tensor}upload(e){let t=e;if(this.wrapper){if(this.wrapper.fallbackType)if(this.wrapper.fallbackType==="int32")t=Ca(e,this.wrapper.type),this.wrapper.setIsDataConverted(!0);else throw new Error(`Unsupported fallback data type: ${this.wrapper.fallbackType}`);if(e.byteLength===this.wrapper.byteLength){this.wrapper.write(t);return}else ce("verbose",()=>"Data size does not match tensor size. Releasing tensor."),this.releaseTensor()}this.activeUpload?this.activeUpload.set(t):this.activeUpload=new Uint8Array(t)}async download(e){if(this.activeUpload){let t=this.wrapper?.isDataConverted?Lr(this.activeUpload,this.wrapper?.type):this.activeUpload;if(e){e instanceof ArrayBuffer?new Uint8Array(e).set(t):new Uint8Array(e.buffer,e.byteOffset,e.byteLength).set(t);return}else return t.buffer}if(!this.wrapper)throw new Error("Tensor has not been created.");return e?this.wrapper.read(e):this.wrapper.read()}},Zs=class{constructor(e){this.backend=e,this.tensorTrackersById=new Map,this.freeTensors=[],this.externalTensors=new Set}getMLContext(e){let t=this.backend.getMLContext(e);if(!t)throw new Error("MLContext not found for session.");return t}reserveTensorId(){let e=Ur();return this.tensorTrackersById.set(e,new Fr(this)),e}releaseTensorId(e){let t=this.tensorTrackersById.get(e);t&&(this.tensorTrackersById.delete(e),t.tensorWrapper&&this.releaseTensor(t.tensorWrapper))}async ensureTensor(e,t,r,i,a){ce("verbose",()=>`[WebNN] TensorManager.ensureTensor {tensorId: ${t}, dataType: ${r}, shape: ${i}, copyOld: ${a}}`);let s=this.tensorTrackersById.get(t);if(!s)throw new Error("Tensor not found.");return s.ensureTensor(e,r,i,a)}upload(e,t){let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");r.upload(t)}async download(e,t){ce("verbose",()=>`[WebNN] TensorManager.download {tensorId: ${e}, dstBuffer: ${t?.byteLength}}`);let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");return r.download(t)}releaseTensorsForSession(e){for(let t of this.freeTensors)t.sessionId===e&&t.destroy();this.freeTensors=this.freeTensors.filter(t=>t.sessionId!==e)}registerTensor(e,t,r,i){let a=this.getMLContext(e),s=Ur(),o=new qr({sessionId:e,context:a,tensor:t,dataType:r,shape:i});return this.tensorTrackersById.set(s,new Fr(this,o)),this.externalTensors.add(o),s}async getCachedTensor(e,t,r,i,a,s,o){let u=this.getMLContext(e);for(let[p,f]of this.freeTensors.entries())if(f.canReuseTensor(u,t,r)){ce("verbose",()=>`[WebNN] Reusing tensor {dataType: ${t}, ${o?`fallbackDataType: ${o},`:""} shape: ${r}`);let h=this.freeTensors.splice(p,1)[0];return h.sessionId=e,h}ce("verbose",()=>`[WebNN] MLContext.createTensor {dataType: ${t}, ${o?`fallbackDataType: ${o},`:""} shape: ${r}}`);let d=await u.createTensor({dataType:o??t,shape:r,dimensions:r,usage:i,writable:a,readable:s});return new qr({sessionId:e,context:u,tensor:d,dataType:t,shape:r,fallbackDataType:o})}releaseTensor(e){this.externalTensors.has(e)&&this.externalTensors.delete(e),this.freeTensors.push(e)}},Wd=(...e)=>new Zs(...e)}),ai,Ys,qd,qm=U(()=>{ie(),Lt(),Ud(),Wm(),dt(),ai=new Map([[1,"float32"],[10,"float16"],[6,"int32"],[12,"uint32"],[7,"int64"],[13,"uint64"],[22,"int4"],[21,"uint4"],[3,"int8"],[2,"uint8"],[9,"uint8"]]),Ys=(e,t)=>{if(e===t)return!0;if(e===void 0||t===void 0)return!1;let r=Object.keys(e).sort(),i=Object.keys(t).sort();return r.length===i.length&&r.every((a,s)=>a===i[s]&&e[a]===t[a])},qd=class{constructor(e){this.tensorManager=Wd(this),this.mlContextBySessionId=new Map,this.sessionIdsByMLContext=new Map,this.mlContextCache=[],this.sessionGraphInputs=new Map,this.sessionGraphOutputs=new Map,this.temporaryGraphInputs=[],this.temporaryGraphOutputs=[],this.temporarySessionTensorIds=new Map,Ya(e.logLevel,!!e.debug)}get currentSessionId(){if(this.activeSessionId===void 0)throw new Error("No active session");return this.activeSessionId}onRunStart(e){ce("verbose",()=>`[WebNN] onRunStart {sessionId: ${e}}`),this.activeSessionId=e}onRunEnd(e){ce("verbose",()=>`[WebNN] onRunEnd {sessionId: ${e}}`);let t=this.temporarySessionTensorIds.get(e);if(t){for(let r of t)ce("verbose",()=>`[WebNN] releasing temporary tensor {tensorId: ${r}}`),this.tensorManager.releaseTensorId(r);this.temporarySessionTensorIds.delete(e),this.activeSessionId=void 0}}async createMLContext(e){if(e instanceof GPUDevice){let r=this.mlContextCache.findIndex(i=>i.gpuDevice===e);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext(e);return this.mlContextCache.push({gpuDevice:e,mlContext:i}),i}}else if(e===void 0){let r=this.mlContextCache.findIndex(i=>i.options===void 0&&i.gpuDevice===void 0);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext();return this.mlContextCache.push({mlContext:i}),i}}let t=this.mlContextCache.findIndex(r=>Ys(r.options,e));if(t!==-1)return this.mlContextCache[t].mlContext;{let r=await navigator.ml.createContext(e);return this.mlContextCache.push({options:e,mlContext:r}),r}}registerMLContext(e,t){this.mlContextBySessionId.set(e,t);let r=this.sessionIdsByMLContext.get(t);r||(r=new Set,this.sessionIdsByMLContext.set(t,r)),r.add(e),this.temporaryGraphInputs.length>0&&(this.sessionGraphInputs.set(e,this.temporaryGraphInputs),this.temporaryGraphInputs=[]),this.temporaryGraphOutputs.length>0&&(this.sessionGraphOutputs.set(e,this.temporaryGraphOutputs),this.temporaryGraphOutputs=[])}onReleaseSession(e){this.sessionGraphInputs.delete(e),this.sessionGraphOutputs.delete(e);let t=this.mlContextBySessionId.get(e);if(!t)return;this.tensorManager.releaseTensorsForSession(e),this.mlContextBySessionId.delete(e);let r=this.sessionIdsByMLContext.get(t);if(r.delete(e),r.size===0){this.sessionIdsByMLContext.delete(t);let i=this.mlContextCache.findIndex(a=>a.mlContext===t);i!==-1&&this.mlContextCache.splice(i,1)}}getMLContext(e){return this.mlContextBySessionId.get(e)}reserveTensorId(){return this.tensorManager.reserveTensorId()}releaseTensorId(e){ce("verbose",()=>`[WebNN] releaseTensorId {tensorId: ${e}}`),this.tensorManager.releaseTensorId(e)}async ensureTensor(e,t,r,i,a){let s=ai.get(r);if(!s)throw new Error(`Unsupported ONNX data type: ${r}`);return this.tensorManager.ensureTensor(e??this.currentSessionId,t,s,i,a)}async createTemporaryTensor(e,t,r){ce("verbose",()=>`[WebNN] createTemporaryTensor {onnxDataType: ${t}, shape: ${r}}`);let i=ai.get(t);if(!i)throw new Error(`Unsupported ONNX data type: ${t}`);let a=this.tensorManager.reserveTensorId();await this.tensorManager.ensureTensor(e,a,i,r,!1);let s=this.temporarySessionTensorIds.get(e);return s?s.push(a):this.temporarySessionTensorIds.set(e,[a]),a}uploadTensor(e,t){if(!be().shouldTransferToMLTensor)throw new Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");ce("verbose",()=>`[WebNN] uploadTensor {tensorId: ${e}, data: ${t.byteLength}}`),this.tensorManager.upload(e,t)}async downloadTensor(e,t){return this.tensorManager.download(e,t)}createMLTensorDownloader(e,t){return async()=>{let r=await this.tensorManager.download(e);return Xa(r,t)}}registerMLTensor(e,t,r,i){let a=ai.get(r);if(!a)throw new Error(`Unsupported ONNX data type: ${r}`);let s=this.tensorManager.registerTensor(e,t,a,i);return ce("verbose",()=>`[WebNN] registerMLTensor {tensor: ${t}, dataType: ${a}, dimensions: ${i}} -> {tensorId: ${s}}`),s}registerMLConstant(e,t,r,i,a,s,o=!1){if(!s)throw new Error("External mounted files are not available.");let u=e;e.startsWith("./")&&(u=e.substring(2));let d=s.get(u);if(!d)throw new Error(`File with name ${u} not found in preloaded files.`);if(t+r>d.byteLength)throw new Error("Out of bounds: data offset and length exceed the external file data size.");let p=d.slice(t,t+r).buffer,f;switch(a.dataType){case"float32":f=new Float32Array(p);break;case"float16":f=typeof Float16Array<"u"&&Float16Array.from?new Float16Array(p):new Uint16Array(p);break;case"int32":f=new Int32Array(p);break;case"uint32":f=new Uint32Array(p);break;case"int64":if(o){let h=Ca(new Uint8Array(p),"int64");f=new Int32Array(h.buffer),a.dataType="int32"}else f=new BigInt64Array(p);break;case"uint64":f=new BigUint64Array(p);break;case"int8":f=new Int8Array(p);break;case"int4":case"uint4":case"uint8":f=new Uint8Array(p);break;default:throw new Error(`Unsupported data type: ${a.dataType} in creating WebNN Constant from external data.`)}return ce("verbose",()=>`[WebNN] registerMLConstant {dataType: ${a.dataType}, shape: ${a.shape}}} ${o?"(Note: it was int64 data type and registered to int32 as workaround)":""}`),i.constant(a,f)}registerGraphInput(e){this.temporaryGraphInputs.push(e)}registerGraphOutput(e){this.temporaryGraphOutputs.push(e)}isGraphInput(e,t){let r=this.sessionGraphInputs.get(e);return r?r.includes(t):!1}isGraphOutput(e,t){let r=this.sessionGraphOutputs.get(e);return r?r.includes(t):!1}isGraphInputOutputTypeSupported(e,t,r=!0){let i=this.mlContextBySessionId.get(e),a=ai.get(At(t));return typeof a>"u"?!1:r?!!i?.opSupportLimits().input.dataTypes.includes(a):!!i?.opSupportLimits().output.dataTypes.includes(a)}flush(){}}}),Qa=U(()=>{}),jr,Ri,Bi,Xs,Qs,Vr,Sa,Js,Fd,Fm=U(()=>{dt(),Qa(),jr=new Map([[64,250],[128,200],[256,200],[512,200],[2048,230],[4096,200],[8192,50],[16384,50],[32768,50],[65536,50],[131072,50],[262144,50],[524288,50],[1048576,50],[2097152,30],[4194304,20],[8388608,10],[12582912,10],[16777216,10],[26214400,15],[33554432,22],[44236800,2],[58982400,6],[67108864,6],[134217728,6],[167772160,6]]),Ri=[],Bi=e=>Math.ceil(Number(e)/16)*16,Xs=e=>{for(let t=0;t<Ri.length;t++){let r=Ri[t];if(e<=r)return r}return Math.ceil(e/16)*16},Qs=1,Vr=()=>Qs++,Sa=async(e,t,r,i)=>{let a=Bi(r),s=e.device.createBuffer({size:a,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{let o=e.getCommandEncoder();e.endComputePass(),o.copyBufferToBuffer(t,0,s,0,a),e.flush(),await s.mapAsync(GPUMapMode.READ);let u=s.getMappedRange();if(i){let d=i();return d.set(new Uint8Array(u,0,r)),d}else return new Uint8Array(u.slice(0,r))}finally{s.destroy()}},Js=class{constructor(e){this.backend=e,this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.buffersPending=[],this.capturedPendingBuffers=new Map;for(let[t]of jr)Ri.push(t),this.freeBuffers.set(t,[]),this.freeUniformBuffers.set(t,[]);this.sessionCount=0}upload(e,t){let r=t.buffer,i=t.byteOffset,a=t.byteLength,s=Bi(a),o=this.storageCache.get(e);if(!o)throw new Error("gpu data for uploading does not exist");if(Number(o.originalSize)!==a)throw new Error(`inconsistent data size. gpu data size=${o.originalSize}, data size=${a}`);let u=this.backend.device.createBuffer({mappedAtCreation:!0,size:s,usage:GPUBufferUsage.MAP_WRITE|GPUBufferUsage.COPY_SRC}),d=u.getMappedRange();new Uint8Array(d).set(new Uint8Array(r,i,a)),u.unmap();let p=this.backend.device.createCommandEncoder();p.copyBufferToBuffer(u,0,o.gpuData.buffer,0,s),this.backend.device.queue.submit([p.finish()]),u.destroy(),ce("verbose",()=>`[WebGPU] GpuDataManager.upload(id=${e})`)}memcpy(e,t){let r=this.storageCache.get(e);if(!r)throw new Error("source gpu data for memcpy does not exist");let i=this.storageCache.get(t);if(!i)throw new Error("destination gpu data for memcpy does not exist");if(r.originalSize!==i.originalSize)throw new Error("inconsistent source and destination gpu data size");let a=Bi(r.originalSize),s=this.backend.getCommandEncoder();this.backend.endComputePass(),s.copyBufferToBuffer(r.gpuData.buffer,0,i.gpuData.buffer,0,a)}registerExternalBuffer(e,t,r){let i;if(r){if(i=r[0],e===r[1])return ce("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, buffer is the same, skip.`),i;if(this.backend.capturedCommandList.has(this.backend.currentSessionId))throw new Error(`Registering a different external buffer under graph capture mode is not supported yet.
             Please use the previous external buffer!`)}else i=Vr();return this.storageCache.set(i,{gpuData:{id:i,type:0,buffer:e},originalSize:t}),ce("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, registered.`),i}unregisterExternalBuffer(e){e!==void 0&&(this.storageCache.delete(e),ce("verbose",()=>`[WebGPU] GpuDataManager.unregisterExternalBuffer() => id=${e}`))}create(e,t=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST){let r=Xs(e),i,a=(t&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE,s=(t&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM;if(a||s){let u=(a?this.freeBuffers:this.freeUniformBuffers).get(r);u?u.length>0?i=u.pop():i=this.backend.device.createBuffer({size:r,usage:t}):i=this.backend.device.createBuffer({size:r,usage:t})}else i=this.backend.device.createBuffer({size:r,usage:t});let o={id:Vr(),type:0,buffer:i};return this.storageCache.set(o.id,{gpuData:o,originalSize:Number(e)}),ce("verbose",()=>`[WebGPU] GpuDataManager.create(size=${e}) => id=${o.id}`),o}get(e){return this.storageCache.get(e)?.gpuData}release(e){let t=typeof e=="bigint"?Number(e):e,r=this.storageCache.get(t);if(!r){if(this.storageCache.size===0)return 0;throw new Error("releasing data does not exist")}return ce("verbose",()=>`[WebGPU] GpuDataManager.release(id=${t}), gpuDataId=${r.gpuData.id}`),this.storageCache.delete(t),this.buffersPending.push(r.gpuData.buffer),r.originalSize}async download(e,t){let r=this.storageCache.get(Number(e));if(!r)throw new Error("data does not exist");await Sa(this.backend,r.gpuData.buffer,r.originalSize,t)}refreshPendingBuffers(){if(this.buffersPending.length!==0)if(this.backend.sessionStatus==="default"){for(let e of this.buffersPending){let t=jr.get(e.size);if((e.usage&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE){let r=this.freeBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else if((e.usage&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM){let r=this.freeUniformBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else e.destroy()}this.buffersPending=[]}else{let e=this.capturedPendingBuffers.get(this.backend.currentSessionId);e||(e=[],this.capturedPendingBuffers.set(this.backend.currentSessionId,e));for(let t of this.buffersPending)e.push(t);this.buffersPending=[]}}dispose(){this.freeBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.freeUniformBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache.forEach(e=>{e.gpuData.buffer.destroy()}),this.capturedPendingBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.capturedPendingBuffers=new Map}onCreateSession(){this.sessionCount+=1}onReleaseSession(e){let t=this.capturedPendingBuffers.get(e);t&&(t.forEach(r=>{r.destroy()}),this.capturedPendingBuffers.delete(e)),this.sessionCount-=1,this.sessionCount===0&&(ce("warning",()=>"[WebGPU] Clearing webgpu buffer cache"),this.storageCache.forEach(r=>{r.gpuData.buffer.destroy()}),this.storageCache=new Map)}},Fd=(...e)=>new Js(...e)}),eo,me,ke=U(()=>{eo=class{constructor(e){Object.assign(this,e)}get cacheKey(){return this.key||(this.key=Object.getOwnPropertyNames(this).sort().map(e=>`${this[e]}`).join(";")),this.key}},me=e=>new eo(e)}),Gt,Mi,Ee,Re,J,Te,Ia,jt,bt,Q,ni,M,Y,jd,Ja,to,Vd,ue=U(()=>{ie(),oe(),Gt=64,Mi=(e,t)=>{if(t===3)throw new Error("vec3 has same alignment as vec4, use vec4 instead");switch(Number(e)){case 10:return t>1?`vec${t}<f16>`:"f16";case 1:return t>1?`vec${t}<f32>`:"f32";case 6:return t>1?`vec${t}<i32>`:"i32";case 12:return t>1?`vec${t}<u32>`:"u32";case 7:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","i32"];case 13:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","u32"];case 9:if(t!==4)throw new Error("bool must be vec4");return["u32","vec4<bool>"];case 22:return"i32";case 21:return"u32";default:throw new Error(`Unknown data type: ${e}`)}},Ee=(e,t=1)=>{let r=Mi(e,t);return typeof r=="string"?r:r[0]},Re=(e,t=1)=>{let r=Mi(e,t);return typeof r=="string"?r:r[1]},J=(...e)=>{let t=[];return e.forEach(r=>{r.length!==0&&t.push({type:12,data:r},{type:12,data:A.computeStrides(r)})}),t},Te=e=>e%4===0?4:e%2===0?2:1,Ia=(e="f32",t,r="0")=>!t||t===1?`${e}(${r})`:`vec${t}<${e}>(${r})`,jt=(e,t,r)=>e==="f32"?r:t===1?`f32(${r})`:`vec${t}<f32>(${r})`,bt=(e,t)=>t===4?`(${e}.x + ${e}.y + ${e}.z + ${e}.w)`:t===2?`(${e}.x + ${e}.y)`:t===3?`(${e}.x + ${e}.y + ${e}.z)`:e,Q=(e,t,r,i)=>e.startsWith("uniforms.")&&r>4?typeof t=="string"?i==="f16"?`${e}[(${t}) / 8][(${t}) % 8 / 4][(${t}) % 8 % 4]`:`${e}[(${t}) / 4][(${t}) % 4]`:i==="f16"?`${e}[${Math.floor(t/8)}][${Math.floor(t%8/4)}][${t%8%4}]`:`${e}[${Math.floor(t/4)}][${t%4}]`:r>1?`${e}[${t}]`:e,ni=(e,t,r,i,a)=>{let s=typeof r=="number",o=s?r:r.length,u=[...new Array(o).keys()],d=o<2?"u32":o<=4?`vec${o}<u32>`:`array<u32, ${o}>`,p=Mi(t,a),f=typeof p=="string"?p:p[1],h=typeof p=="string"?p:p[0],g={indices:d,value:f,storage:h,tensor:t},y=P=>typeof P=="string"?P:`${P}u`,_={offsetToIndices:!1,indicesToOffset:!1,broadcastedIndicesToOffset:!1,set:!1,setByIndices:!1,get:!1,getByIndices:!1},$=s?"uniforms.":"",x=`${$}${e}_shape`,v=`${$}${e}_strides`,b="";for(let P=0;P<o-1;P++)b+=`
    let dim${P} = current / ${Q(v,P,o)};
    let rest${P} = current % ${Q(v,P,o)};
    indices[${P}] = dim${P};
    current = rest${P};
    `;b+=`indices[${o-1}] = current;`;let C=o<2?"":`
  fn o2i_${e}(offset: u32) -> ${g.indices} {
    var indices: ${g.indices};
    var current = offset;
    ${b}
    return indices;
  }`,T=P=>(_.offsetToIndices=!0,o<2?P:`o2i_${e}(${P})`),S=[];if(o>=2)for(let P=o-1;P>=0;P--)S.push(`${Q(v,P,o)} * (indices[${P}])`);let z=o<2?"":`
  fn i2o_${e}(indices: ${g.indices}) -> u32 {
    return ${S.join("+")};
  }`,E=P=>(_.indicesToOffset=!0,o<2?P:`i2o_${e}(${P})`),R=(...P)=>o===0?"0u":`${g.indices}(${P.map(y).join(",")})`,L=(P,q)=>o<2?`${P}`:`${Q(P,q,o)}`,F=(P,q,ee)=>o<2?`${P}=${ee};`:`${Q(P,q,o)}=${ee};`,K={},X=(P,q)=>{_.broadcastedIndicesToOffset=!0;let ee=`${q.name}broadcastedIndicesTo${e}Offset`;if(ee in K)return`${ee}(${P})`;let pe=[];for(let N=o-1;N>=0;N--){let de=q.indicesGet("outputIndices",N+q.rank-o);pe.push(`${L(v,N)} * (${de} % ${L(x,N)})`)}return K[ee]=`fn ${ee}(outputIndices: ${q.type.indices}) -> u32 {
             return ${pe.length>0?pe.join("+"):"0u"};
           }`,`${ee}(${P})`},re=(P,q)=>(()=>{if(g.storage===g.value)return`${e}[${P}]=${q};`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`${e}[${P}]=vec2<u32>(u32(${q}), select(0u, 0xFFFFFFFFu, ${q} < 0));`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`${e}[${P}]=vec2<u32>(u32(${q}), 0u);`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`${e}[${P}]=dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(${q}));`;throw new Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),j=P=>(()=>{if(g.storage===g.value)return`${e}[${P}]`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`i32(${e}[${P}].x)`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`u32(${e}[${P}].x)`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`vec4<bool>(bool(${e}[${P}] & 0xFFu), bool(${e}[${P}] & 0xFF00u), bool(${e}[${P}] & 0xFF0000u), bool(${e}[${P}] & 0xFF000000u))`;throw new Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),se=o<2?"":`
  fn get_${e}ByIndices(indices: ${g.indices}) -> ${f} {
    return ${j(`i2o_${e}(indices)`)};
  }`,H=o<2?"":(()=>{let P=u.map(ee=>`d${ee}: u32`).join(", "),q=u.map(ee=>`d${ee}`).join(", ");return`
  fn get_${e}(${P}) -> ${f} {
    return get_${e}ByIndices(${R(q)});
  }`})(),G=(...P)=>{if(P.length!==o)throw new Error(`indices length must be ${o}`);let q=P.map(y).join(",");return o===0?j("0u"):o===1?j(q[0]):(_.get=!0,_.getByIndices=!0,_.indicesToOffset=!0,`get_${e}(${q})`)},ne=P=>o<2?j(P):(_.getByIndices=!0,_.indicesToOffset=!0,`get_${e}ByIndices(${P})`),V=o<2?"":`
  fn set_${e}ByIndices(indices: ${g.indices}, value: ${f}) {
    ${re(`i2o_${e}(indices)`,"value")}
  }`,ge=o<2?"":(()=>{let P=u.map(ee=>`d${ee}: u32`).join(", "),q=u.map(ee=>`d${ee}`).join(", ");return`
  fn set_${e}(${P}, value: ${f}) {
    set_${e}ByIndices(${R(q)}, value);
  }`})();return{impl:()=>{let P=[],q=!1;return _.offsetToIndices&&(P.push(C),q=!0),_.indicesToOffset&&(P.push(z),q=!0),_.broadcastedIndicesToOffset&&(Object.values(K).forEach(ee=>P.push(ee)),q=!0),_.set&&(P.push(ge),q=!0),_.setByIndices&&(P.push(V),q=!0),_.get&&(P.push(H),q=!0),_.getByIndices&&(P.push(se),q=!0),!s&&q&&P.unshift(`const ${x} = ${g.indices}(${r.join(",")});`,`const ${v} = ${g.indices}(${A.computeStrides(r).join(",")});`),P.join(`
`)},type:g,offsetToIndices:T,indicesToOffset:E,broadcastedIndicesToOffset:X,indices:R,indicesGet:L,indicesSet:F,set:(...P)=>{if(P.length!==o+1)throw new Error(`indices length must be ${o}`);let q=P[o];if(typeof q!="string")throw new Error("value must be string");let ee=P.slice(0,o).map(y).join(",");return o===0?re("0u",q):o===1?re(ee[0],q):(_.set=!0,_.setByIndices=!0,_.indicesToOffset=!0,`set_${e}(${ee}, ${q})`)},setByOffset:re,setByIndices:(P,q)=>o<2?re(P,q):(_.setByIndices=!0,_.indicesToOffset=!0,`set_${e}ByIndices(${P}, ${q});`),get:G,getByOffset:j,getByIndices:ne,usage:i,name:e,strides:v,shape:x,rank:o}},M=(e,t,r,i=1)=>ni(e,t,r,"input",i),Y=(e,t,r,i=1)=>ni(e,t,r,"output",i),jd=(e,t,r)=>ni(e,t,r,"atomicOutput",1),Ja=(e,t,r,i=1)=>ni(e,t,r,"internal",i),to=class{constructor(e,t){this.normalizedDispatchGroup=e,this.limits=t,this.internalVariables=[],this.variables=[],this.uniforms=[],this.variableIndex=0}guardAgainstOutOfBoundsWorkgroupSizes(e){return`if (global_idx >= ${typeof e=="number"?`${e}u`:e}) { return; }`}mainStart(e=Gt){let t=typeof e=="number"?e:e[0],r=typeof e=="number"?1:e[1],i=typeof e=="number"?1:e[2];if(t>this.limits.maxComputeWorkgroupSizeX||r>this.limits.maxComputeWorkgroupSizeY||i>this.limits.maxComputeWorkgroupSizeZ)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup size [${this.limits.maxComputeWorkgroupSizeX}, ${this.limits.maxComputeWorkgroupSizeY}, ${this.limits.maxComputeWorkgroupSizeZ}].`);if(t*r*i>this.limits.maxComputeInvocationsPerWorkgroup)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup invocations ${this.limits.maxComputeInvocationsPerWorkgroup}.`);let a=this.normalizedDispatchGroup[1]===1&&this.normalizedDispatchGroup[2]===1,s=a?`@builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(local_invocation_id) local_id : vec3<u32>`:`@builtin(global_invocation_id) global_id : vec3<u32>,
                                             @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(num_workgroups) num_workgroups : vec3<u32>`,o=a?`let global_idx = global_id.x;
         let workgroup_index = workgroup_id.x;`:`let workgroup_index = workgroup_id.z * num_workgroups[0] * num_workgroups[1] +
             workgroup_id.y * num_workgroups[0] + workgroup_id.x;
         let global_idx = workgroup_index * ${t*r*i}u + local_idx;`;return`@compute @workgroup_size(${t}, ${r}, ${i})
  fn main(${s}) {
    ${o}
  `}appendVariableUniforms(e){e.rank!==0&&(e.shape.startsWith("uniforms.")&&this.uniforms.push({name:e.shape.replace("uniforms.",""),type:"u32",length:e.rank}),e.strides.startsWith("uniforms.")&&this.uniforms.push({name:e.strides.replace("uniforms.",""),type:"u32",length:e.rank}))}declareVariable(e,t){if(e.usage==="internal")throw new Error("cannot use internal variable with declareVariable(). use registerInternalVariables() instead.");this.variables.push(e),this.appendVariableUniforms(e);let r=e.usage==="input"?"read":"read_write",i=e.usage==="atomicOutput"?"atomic<i32>":e.type.storage;return`@group(0) @binding(${t}) var<storage, ${r}> ${e.name}: array<${i}>;`}declareVariables(...e){return e.map(t=>this.declareVariable(t,this.variableIndex++)).join(`
`)}registerInternalVariable(e){if(e.usage!=="internal")throw new Error("cannot use input or output variable with registerInternalVariable(). use declareVariables() instead.");this.internalVariables.push(e),this.appendVariableUniforms(e)}registerInternalVariables(...e){return e.forEach(t=>this.registerInternalVariable(t)),this}registerUniform(e,t,r=1){return this.uniforms.push({name:e,type:t,length:r}),this}registerUniforms(e){return this.uniforms=this.uniforms.concat(e),this}uniformDeclaration(){if(this.uniforms.length===0)return"";let e=[];for(let{name:t,type:r,length:i}of this.uniforms)if(i&&i>4)r==="f16"?e.push(`@align(16) ${t}:array<mat2x4<${r}>, ${Math.ceil(i/8)}>`):e.push(`${t}:array<vec4<${r}>, ${Math.ceil(i/4)}>`);else{let a=i==null||i===1?r:`vec${i}<${r}>`;e.push(`${t}:${a}`)}return`
      struct Uniforms { ${e.join(", ")} };
      @group(0) @binding(${this.variableIndex}) var<uniform> uniforms: Uniforms;`}get additionalImplementations(){return this.uniformDeclaration()+this.variables.map(e=>e.impl()).join(`
`)+this.internalVariables.map(e=>e.impl()).join(`
`)}get variablesInfo(){if(this.uniforms.length===0)return;let e=t=>[12,10,1,6][["u32","f16","f32","i32"].indexOf(t)];return this.uniforms.map(t=>[e(t.type),t.length??1])}},Vd=(e,t)=>new to(e,t)}),io,Gr,ro,ao,no,so,We,Gd,Hd,$t=U(()=>{ie(),oe(),ke(),ue(),io=(e,t)=>{if(!e||e.length!==1)throw new Error("Transpose requires 1 input.");if(t.length!==0&&t.length!==e[0].dims.length)throw new Error(`perm size ${t.length} does not match input rank ${e[0].dims.length}`)},Gr=(e,t)=>t.length!==0?t:[...new Array(e).keys()].reverse(),ro=(e,t)=>A.sortBasedOnPerm(e,Gr(e.length,t)),ao=(e,t,r,i)=>{let a=`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`;for(let s=0;s<t;++s)a+=`a[${e[s]}]=i[${s}];`;return a+="return a;}"},no=(e,t)=>{let r=[],i=[];for(let a=0;a<e.length;++a)e[a]!==1&&r.push(e[a]),e[t[a]]!==1&&i.push(t[a]);return{newShape:r,newPerm:i}},so=(e,t)=>{let r=0;for(let i=0;i<e.length;++i)if(t[e[i]]!==1){if(e[i]<r)return!1;r=e[i]}return!0},We=(e,t)=>{let r=e.dataType,i=e.dims.length,a=Gr(i,t),s=ro(e.dims,a),o=e.dims,u=s,d=i<2||so(a,e.dims),p;if(d)return p=_=>{let $=M("input",r,o,4),x=Y("output",r,u,4);return`
  ${_.registerUniform("output_size","u32").declareVariables($,x)}
  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    output[global_idx] = input[global_idx];
  }`},{name:"TransposeCopy",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let _=A.size(s);return{outputs:[{dims:s,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(_/64/4)},programUniforms:[{type:12,data:Math.ceil(_/4)}]}},getShaderSource:p};let{newShape:f,newPerm:h}=no(e.dims,a),g=A.areEqual(h,[2,3,1]),y=A.areEqual(h,[3,1,2]);if(f.length===2||g||y){o=g?[f[0],f[1]*f[2]]:y?[f[0]*f[1],f[2]]:f,u=[o[1],o[0]];let _=16;return p=$=>{let x=M("a",r,o.length),v=Y("output",r,u.length);return`
  ${$.registerUniform("output_size","u32").declareVariables(x,v)}
  var<workgroup> tile : array<array<${v.type.value}, ${_+1}>, ${_}>;
  ${$.mainStart([_,_,1])}
    let stride = (uniforms.output_shape[1] - 1) / ${_} + 1;
    let workgroup_id_x = workgroup_index % stride;
    let workgroup_id_y = workgroup_index / stride;
    let input_col = workgroup_id_y * ${_}u + local_id.x;
    let input_row = workgroup_id_x * ${_}u + local_id.y;
    if (input_row < uniforms.a_shape[0] && input_col < uniforms.a_shape[1]) {
      tile[local_id.y][local_id.x] = ${x.getByIndices(`${x.type.indices}(input_row, input_col)`)};
    }
    workgroupBarrier();

    let output_col = workgroup_id_x * ${_}u + local_id.x;
    let output_row = workgroup_id_y * ${_}u + local_id.y;
    if (output_row < uniforms.output_shape[0] && output_col < uniforms.output_shape[1]) {
      ${v.setByIndices(`${v.type.indices}(output_row, output_col)`,"tile[local_id.x][local_id.y]")}
    }
  }`},{name:"TransposeShared",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let $=A.size(s);return{outputs:[{dims:s,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(u[1]/_),y:Math.ceil(u[0]/_)},programUniforms:[{type:12,data:$},...J(o,u)]}},getShaderSource:p}}return p=_=>{let $=M("a",r,o.length),x=Y("output",r,u.length);return`
  ${_.registerUniform("output_size","u32").declareVariables($,x)}

  ${ao(a,i,$,x)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${x.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${x.setByOffset("global_idx",$.getByIndices("aIndices"))}
  }`},{name:"Transpose",shaderCache:{hint:`${t}`,inputDependencies:["rank"]},getRunData:()=>{let _=A.size(s);return{outputs:[{dims:s,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:[{type:12,data:_},...J(o,u)]}},getShaderSource:p}},Gd=(e,t)=>{io(e.inputs,t.perm),e.compute(We(e.inputs[0],t.perm))},Hd=e=>me({perm:e.perm})}),oo,uo,lo,po,co,fo,ho,mo,go,yo,Ve,Kd,Zd,Yd,Xd,Qd,Jd,ep,tp,ip,rp,jm=U(()=>{ie(),oe(),ue(),en(),$t(),oo={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate * candidate",logSumExp:"bestValue + exp(candidate)",l1:"bestValue + abs(candidate)",l2:"bestValue + candidate * candidate",logSum:"bestValue + candidate"},uo={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate",logSumExp:"bestValue + candidate",l1:"bestValue + candidate",l2:"bestValue + candidate",logSum:"bestValue + candidate"},lo={max:"_A[offset]",min:"_A[offset]",mean:"0",sum:"0",prod:"1",sumSquare:"0",logSumExp:"0",l1:"0",l2:"0",logSum:"0"},po={max:"bestValue",min:"bestValue",sum:"bestValue",prod:"bestValue",sumSquare:"bestValue",logSumExp:"log(bestValue)",l1:"bestValue",l2:"sqrt(bestValue)",logSum:"log(bestValue)"},co=(e,t)=>{let r=[];for(let i=t-e;i<t;++i)r.push(i);return r},fo=(e,t)=>{let r=[],i=e.length;for(let s=0;s<i;s++)t.indexOf(s)===-1&&r.push(e[s]);let a=t.map(s=>e[s]);return[r,a]},ho=(e,t)=>{let r=e.length+t.length,i=[],a=0;for(let s=0;s<r;s++)t.indexOf(s)===-1?i.push(e[a++]):i.push(1);return i},mo=(e,t)=>{for(let r=0;r<e.length;++r)if(e[e.length-r-1]!==t-1-r)return!1;return!0},go=(e,t)=>{let r=[];if(!mo(e,t)){for(let i=0;i<t;++i)e.indexOf(i)===-1&&r.push(i);e.forEach(i=>r.push(i))}return r},yo=(e,t,r,i,a,s,o)=>{let u=r[0].dims,d=A.size(s),p=A.size(o),f=M("_A",r[0].dataType,u),h=Y("output",a,s),g=64;d===1&&(g=256);let y=`
          var<workgroup> aBestValues : array<f32, ${g}>;
       `,_=$=>`
        ${$.registerUniform("reduceSize","u32").declareVariables(f,h)}
        ${y}
        fn DIV_CEIL(a : u32, b : u32) -> u32 {
          return ((a - 1u) / b + 1u);
         }
         ${$.mainStart(g)}

          let outputIndex = global_idx / ${g};
          let offset = outputIndex * uniforms.reduceSize;

          var bestValue = f32(${lo[i]});
          let Length = uniforms.reduceSize;
          for (var k = local_idx; k < Length; k = k + ${g}) {
           let candidate = f32(${f.getByOffset("offset + k")});
           bestValue = ${oo[i]};
          }
          aBestValues[local_idx] = bestValue;
          workgroupBarrier();

         var reduceSize = min(Length, ${g}u);
         for (var currentSize = reduceSize / 2u; reduceSize > 1u;
             currentSize = reduceSize / 2u) {
           let interval = DIV_CEIL(reduceSize, 2u);
           if (local_idx < currentSize) {
            let candidate = aBestValues[local_idx + interval];
            bestValue = ${uo[i]};
            aBestValues[local_idx] = bestValue;
           }
           reduceSize = interval;
           workgroupBarrier();
         }

         if (local_idx == 0u) {
          ${h.setByOffset("outputIndex",`${i==="mean"?`${h.type.storage}(bestValue / f32(uniforms.reduceSize))`:`${h.type.storage}(${po[i]})`}`)};
         }
        }`;return{name:e,shaderCache:{hint:`${t};${g}`,inputDependencies:["type"]},getShaderSource:_,getRunData:()=>({outputs:[{dims:s,dataType:a}],dispatchGroup:{x:d},programUniforms:[{type:12,data:p}]})}},Ve=(e,t,r,i)=>{let a=e.inputs.length===1?r:Ea(e.inputs,r),s=a.axes;s.length===0&&!a.noopWithEmptyAxes&&(s=e.inputs[0].dims.map((y,_)=>_));let o=A.normalizeAxes(s,e.inputs[0].dims.length),u=o,d=e.inputs[0],p=go(u,e.inputs[0].dims.length);p.length>0&&(d=e.compute(We(e.inputs[0],p),{inputs:[0],outputs:[-1]})[0],u=co(u.length,d.dims.length));let[f,h]=fo(d.dims,u),g=f;a.keepDims&&(g=ho(f,o)),e.compute(yo(t,a.cacheKey,[d],i,e.inputs[0].dataType,g,h),{inputs:[d]})},Kd=(e,t)=>{Ve(e,"ReduceMeanShared",t,"mean")},Zd=(e,t)=>{Ve(e,"ReduceL1Shared",t,"l1")},Yd=(e,t)=>{Ve(e,"ReduceL2Shared",t,"l2")},Xd=(e,t)=>{Ve(e,"ReduceLogSumExpShared",t,"logSumExp")},Qd=(e,t)=>{Ve(e,"ReduceMaxShared",t,"max")},Jd=(e,t)=>{Ve(e,"ReduceMinShared",t,"min")},ep=(e,t)=>{Ve(e,"ReduceProdShared",t,"prod")},tp=(e,t)=>{Ve(e,"ReduceSumShared",t,"sum")},ip=(e,t)=>{Ve(e,"ReduceSumSquareShared",t,"sumSquare")},rp=(e,t)=>{Ve(e,"ReduceLogSumShared",t,"logSum")}}),Ge,_o,Yi,Ea,He,wo,bo,$o,vo,xo,To,ko,Co,So,Io,Ke,ap,np,sp,op,up,lp,dp,pp,cp,fp,en=U(()=>{ie(),oe(),ke(),ue(),jm(),Ge=e=>{if(!e||e.length===0||e.length>2)throw new Error("Reduce op requires 1 or 2 inputs.");if(e.length===2&&e[1].dims.length!==1)throw new Error("Invalid axes input dims.")},_o=e=>["","",`var value = ${e.getByIndices("input_indices")};`,""],Yi=(e,t,r,i,a,s,o=!1,u=!1)=>{let d=[],p=r[0].dims,f=p.length,h=A.normalizeAxes(a,f),g=!u&&h.length===0;p.forEach(($,x)=>{g||h.indexOf(x)>=0?o&&d.push(1):d.push($)});let y=d.length,_=A.size(d);return{name:e,shaderCache:t,getShaderSource:$=>{let x=[],v=M("_A",r[0].dataType,f),b=Y("output",s,y),C=i(v,b,h),T=C[2];for(let S=0,z=0;S<f;S++)g||h.indexOf(S)>=0?(o&&z++,T=`for(var j${S}: u32 = 0; j${S} < ${p[S]}; j${S}++) {
                  ${C[2].includes("last_index")?`let last_index = j${S};`:""}
                  ${v.indicesSet("input_indices",S,`j${S}`)}
                  ${T}
                }`):(x.push(`${v.indicesSet("input_indices",S,b.indicesGet("output_indices",z))};`),z++);return`

        ${$.registerUniform("output_size","u32").declareVariables(v,b)}

        ${$.mainStart()}
          ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          var input_indices: ${v.type.indices};
          let output_indices = ${b.offsetToIndices("global_idx")};

          ${x.join(`
`)}
          ${C[0]}       // init ops for reduce max/min
          ${C[1]}
          ${T}
          ${C[3]}
          ${C.length===4?b.setByOffset("global_idx","value"):C.slice(4).join(`
`)}
        }`},getRunData:()=>({outputs:[{dims:d,dataType:s}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:[{type:12,data:_},...J(p,d)]})}},Ea=(e,t)=>{let r=[];return e[1].dims[0]>0&&e[1].getBigInt64Array().forEach(i=>r.push(Number(i))),me({axes:r,keepDims:t.keepDims,noopWithEmptyAxes:t.noopWithEmptyAxes})},He=(e,t,r,i)=>{let a=e.inputs,s=a.length===1?r:Ea(a,r);e.compute(Yi(t,{hint:s.cacheKey,inputDependencies:["rank"]},[a[0]],s.noopWithEmptyAxes&&s.axes.length===0?_o:i,s.axes,a[0].dataType,s.keepDims,s.noopWithEmptyAxes),{inputs:[0]})},wo=(e,t)=>{Ge(e.inputs),He(e,"ReduceLogSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,"value = log(value);"])},bo=(e,t)=>{Ge(e.inputs),He(e,"ReduceL1",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += abs(${r.getByIndices("input_indices")});`,""])},$o=(e,t)=>{Ge(e.inputs),He(e,"ReduceL2",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += (t * t);`,"value = sqrt(value);"])},vo=(e,t)=>{Ge(e.inputs),He(e,"ReduceLogSumExp",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += exp(${r.getByIndices("input_indices")});`,"value = log(value);"])},xo=(e,t)=>{Ge(e.inputs),He(e,"ReduceMax",t,(r,i,a)=>{let s=[];for(let o=0;o<r.rank;o++)(a.indexOf(o)>=0||a.length===0)&&s.push(r.indicesSet("input_indices",o,0));return[`${s.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = max(value, ${r.getByIndices("input_indices")});`,""]})},To=(e,t)=>{Ge(e.inputs),He(e,"ReduceMean",t,(r,i,a)=>{let s=1;for(let o=0;o<r.rank;o++)(a.indexOf(o)>=0||a.length===0)&&(s*=e.inputs[0].dims[o]);return["var sum = f32(0);","",`sum += f32(${r.getByIndices("input_indices")});`,`let value = ${i.type.value}(sum / ${s});`]})},ko=(e,t)=>{Ge(e.inputs),He(e,"ReduceMin",t,(r,i,a)=>{let s=[];for(let o=0;o<r.rank;o++)(a.indexOf(o)>=0||a.length===0)&&s.push(`input_indices[${o}] = 0;`);return[`${s.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = min(value, ${r.getByIndices("input_indices")});`,""]})},Co=(e,t)=>{Ge(e.inputs),He(e,"ReduceProd",t,(r,i)=>[`var value = ${i.type.storage}(1);`,"",`value *= ${r.getByIndices("input_indices")};`,""])},So=(e,t)=>{Ge(e.inputs),He(e,"ReduceSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,""])},Io=(e,t)=>{Ge(e.inputs),He(e,"ReduceSumSquare",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += t * t;`,""])},Ke=(e,t,r)=>{if(t.length===0)return r;let i=1,a=1;for(let s=0;s<t.length;s++)t.indexOf(s)===-1?i*=e[s]:a*=e[s];return a<32&&i>1024},ap=(e,t)=>{Ke(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?To(e,t):Kd(e,t)},np=(e,t)=>{Ke(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?bo(e,t):Zd(e,t)},sp=(e,t)=>{Ke(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?$o(e,t):Yd(e,t)},op=(e,t)=>{Ke(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?vo(e,t):Xd(e,t)},up=(e,t)=>{Ke(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?xo(e,t):Qd(e,t)},lp=(e,t)=>{Ke(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?ko(e,t):Jd(e,t)},dp=(e,t)=>{Ke(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Co(e,t):ep(e,t)},pp=(e,t)=>{Ke(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?So(e,t):tp(e,t)},cp=(e,t)=>{Ke(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Io(e,t):ip(e,t)},fp=(e,t)=>{Ke(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?wo(e,t):rp(e,t)}}),Hr,hp,mp,za,Vm=U(()=>{ie(),ke(),en(),Hr=e=>{if(!e||e.length===0||e.length>2)throw new Error("ArgMinMaxOp op requires 1 or 2 inputs.");if(e[0].dataType!==1)throw new Error("Invalid input type.")},hp=(e,t)=>{Hr(e.inputs);let r=(i,a,s)=>{let o=[];for(let u=0;u<i.rank;u++)(s.indexOf(u)>=0||s.length===0)&&o.push(`input_indices[${u}] = 0;`);return[`${o.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?"<=":"<"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(Yi("ArgMin",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},mp=(e,t)=>{Hr(e.inputs);let r=(i,a,s)=>{let o=[];for(let u=0;u<i.rank;u++)(s.indexOf(u)>=0||s.length===0)&&o.push(`input_indices[${u}] = 0;`);return[`${o.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?">=":">"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(Yi("argMax",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},za=e=>me(e)}),Eo,Ni,zo,Ao,Oo,wi,Ro,gp,tn=U(()=>{ie(),oe(),Qa(),ue(),Eo=(e,t)=>{let r=e[0],i=e[1],a=e[2],s=e[3],o=e[4],u=e[5];if(o&&u)throw new Error("Attention cannot have both past and attention_bias");if(r.dims.length!==3)throw new Error('Input "input" must have 3 dimensions');let d=r.dims[0],p=r.dims[1],f=r.dims[2];if(a.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimensions');if(i.dims.length!==2)throw new Error('Input "weights" is expected to have 2 dimensions');if(i.dims[0]!==f)throw new Error("Input 1 dimension 0 should have same length as dimension 2 of input 0");if(a.dims[0]!==i.dims[1])throw new Error('Input "bias" dimension 0 should have same length as dimension 1 of input "weights"');let h=a.dims[0]/3,g=h,y=g;if(t.qkvHiddenSizes.length>0){if(t.qkvHiddenSizes.length!==3)throw new Error("qkv_hidden_sizes attribute should have 3 elements");for(let C of t.qkvHiddenSizes)if(C%t.numHeads!==0)throw new Error("qkv_hidden_sizes should be divisible by num_heads");h=t.qkvHiddenSizes[0],g=t.qkvHiddenSizes[1],y=t.qkvHiddenSizes[2]}let _=p;if(h!==g)throw new Error("qkv_hidden_sizes first element should be same as the second");if(a.dims[0]!==h+g+y)throw new Error('Input "bias" dimension 0 should have same length as sum of Q/K/V hidden sizes');let $=0;if(o){if(g!==y)throw new Error('Input "past" expect k_hidden_size == v_hidden_size');if(o.dims.length!==5)throw new Error('Input "past" must have 5 dimensions');if(o.dims[0]!==2)throw new Error('Input "past" first dimension must be 2');if(o.dims[1]!==d)throw new Error('Input "past" second dimension must be batch_size');if(o.dims[2]!==t.numHeads)throw new Error('Input "past" third dimension must be num_heads');if(o.dims[4]!==g/t.numHeads)throw new Error('Input "past" fifth dimension must be k_hidden_size / num_heads');t.pastPresentShareBuffer||($=o.dims[3])}let x=_+$,v=-1,b=0;if(s)throw new Error("Mask not supported");if(o)throw new Error("past is not supported");if(u){if(u.dims.length!==4)throw new Error('Input "attention_bias" must have 4 dimensions');if(u.dims[0]!==d||u.dims[1]!==t.numHeads||u.dims[2]!==p||u.dims[3]!==x)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:d,sequenceLength:p,pastSequenceLength:$,kvSequenceLength:_,totalSequenceLength:x,maxSequenceLength:v,inputHiddenSize:f,hiddenSize:h,vHiddenSize:y,headSize:Math.floor(h/t.numHeads),vHeadSize:Math.floor(y/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:b,scale:t.scale,broadcastResPosBias:!1,passPastInKv:!1,qkvFormat:1}},Ni=(e,t,r)=>t&&e?`
      let total_sequence_length_input = u32(${t.getByOffset("0")});
      let present_sequence_length = max(total_sequence_length_input, uniforms.past_sequence_length);
      let is_subsequent_prompt: bool = sequence_length > 1 && sequence_length != total_sequence_length_input;
      let is_first_prompt: bool = is_subsequent_prompt == false && sequence_length == total_sequence_length_input;
      total_sequence_length = u32(${e?.getByOffset("batchIdx")}) + 1;
      var past_sequence_length: u32 = 0;
      if (is_first_prompt == false) {
        past_sequence_length = total_sequence_length - sequence_length;
      }
       `:`
    ${r?"let past_sequence_length = uniforms.past_sequence_length":""};
    let present_sequence_length = total_sequence_length;
    `,zo=(e,t,r,i,a,s,o,u)=>{let d=Te(o?1:s),p=64,f=s/d;f<p&&(p=32);let h=Math.ceil(s/d/p),g=[{type:12,data:t},{type:12,data:r},{type:12,data:i},{type:12,data:a},{type:12,data:f},{type:12,data:h}],y=Ee(e.dataType,d),_=Re(1,d),$=["type"];o&&$.push("type"),u&&$.push("type");let x=v=>{let b=Y("x",e.dataType,e.dims,d),C=[b],T=o?M("seq_lens",o.dataType,o.dims):void 0;T&&C.push(T);let S=u?M("total_sequence_length_input",u.dataType,u.dims):void 0;S&&C.push(S);let z=Re(e.dataType),E=[{name:"batch_size",type:"u32"},{name:"num_heads",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"sequence_length",type:"u32"},{name:"total_sequence_length",type:"u32"},{name:"elements_per_thread",type:"u32"}];return`
  var<workgroup> thread_max: array<f32, ${p}>;
  var<workgroup> thread_sum: array<f32, ${p}>;
  ${v.registerUniforms(E).declareVariables(...C)}
  ${v.mainStart([p,1,1])}
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let sequence_length = uniforms.sequence_length;
    var total_sequence_length = uniforms.total_sequence_length;
    ${Ni(T,S,!1)}
    let local_offset = local_idx * uniforms.elements_per_thread;
    let offset = (global_idx / ${p}) * uniforms.total_sequence_length + local_offset;
    let seq_causal_length = ${o?"u32(past_sequence_length + workgroup_id.y + 1)":"total_sequence_length"};
    var thread_max_vector = ${_}(-3.402823e+38f);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      thread_max_vector = max(${_}(x[offset + i]), thread_max_vector);
    }
    thread_max[local_idx] = ${(()=>{switch(d){case 1:return"thread_max_vector";case 2:return"max(thread_max_vector.x, thread_max_vector.y)";case 4:return"max(max(thread_max_vector.x, thread_max_vector.y), max(thread_max_vector.z, thread_max_vector.w))";default:throw new Error(`Unsupported components: ${d}`)}})()};
    workgroupBarrier();

    var max_value =  f32(-3.402823e+38f);
    for (var i = 0u; i < ${p}; i++) {
      max_value = max(thread_max[i], max_value);
    }

    var sum_vector = ${_}(0);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      sum_vector += exp(${_}(x[offset + i]) - max_value);
    }
    thread_sum[local_idx] = ${(()=>{switch(d){case 1:return"sum_vector";case 2:return"sum_vector.x + sum_vector.y";case 4:return"sum_vector.x + sum_vector.y + sum_vector.z + sum_vector.w";default:throw new Error(`Unsupported components: ${d}`)}})()};
    workgroupBarrier();

    var sum: f32 = 0;
    for (var i = 0u; i < ${p}; i++) {
      sum += thread_sum[i];
    }

    if (sum == 0) {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        x[offset + i] = ${b.type.value}(${z}(1.0) / ${z}(seq_causal_length));
      }
    } else {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        var f32input = ${_}(x[offset + i]);
        x[offset + i] = ${b.type.value}(exp(f32input - max_value) / sum);
      }
    }
      ${o?`
        for (var total_seq_id: u32 = seq_causal_length; total_seq_id + local_offset < uniforms.total_sequence_length; total_seq_id++) {
          x[offset + total_seq_id] = ${b.type.value}(${z}(0));
        }`:""};
  }`};return{name:"AttentionProbsSoftmax",shaderCache:{hint:`${p};${y};${d}`,inputDependencies:$},getShaderSource:x,getRunData:()=>({outputs:[],dispatchGroup:{x:1,y:a,z:t*r},programUniforms:g})}},Ao=(e,t,r,i,a,s,o,u,d)=>{let p=o+s.kvSequenceLength,f=[s.batchSize,s.numHeads,s.sequenceLength,p],h=e>1&&i,g=s.kvNumHeads?s.kvNumHeads:s.numHeads,y=h?[s.batchSize,g,p,s.headSize]:void 0,_=s.nReps?s.nReps:1,$=s.scale===0?1/Math.sqrt(s.headSize):s.scale,x=Te(s.headSize),v=s.headSize/x,b=12,C={x:Math.ceil(p/b),y:Math.ceil(s.sequenceLength/b),z:s.batchSize*s.numHeads},T=[{type:12,data:s.sequenceLength},{type:12,data:v},{type:12,data:p},{type:12,data:s.numHeads},{type:12,data:s.headSize},{type:1,data:$},{type:12,data:o},{type:12,data:s.kvSequenceLength},{type:12,data:_}],S=h&&i&&A.size(i.dims)>0,z=["type","type"];S&&z.push("type"),a&&z.push("type"),u&&z.push("type"),d&&z.push("type");let E=[{dims:f,dataType:t.dataType,gpuDataType:0}];h&&E.push({dims:y,dataType:t.dataType,gpuDataType:0});let R=L=>{let F=M("q",t.dataType,t.dims,x),K=M("key",r.dataType,r.dims,x),X=[F,K];if(S){let V=M("past_key",i.dataType,i.dims,x);X.push(V)}a&&X.push(M("attention_bias",a.dataType,a.dims));let re=u?M("seq_lens",u.dataType,u.dims):void 0;re&&X.push(re);let j=d?M("total_sequence_length_input",d.dataType,d.dims):void 0;j&&X.push(j);let se=Y("output",t.dataType,f),H=[se];h&&H.push(Y("present_key",t.dataType,y,x));let G=Re(1,x),ne=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"alpha",type:"f32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${b}u;

  var<workgroup> tileQ: array<${F.type.storage}, ${b*b}>;
  var<workgroup> tileK: array<${F.type.storage}, ${b*b}>;
  ${L.registerUniforms(ne).declareVariables(...X,...H)}
  ${L.mainStart([b,b,1])}
    // x holds the N and y holds the M
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let kvHeadIdx = ${_===1?"headIdx":"headIdx / uniforms.n_reps"};
    let kv_num_heads = ${_===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let m = workgroup_id.y * TILE_SIZE;
    let n = workgroup_id.x * TILE_SIZE;
    let sequence_length = uniforms.M;
    var total_sequence_length = uniforms.N;
    ${Ni(re,j,!0)}
    let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx;
    let qOffset = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
    ${S&&h?"let pastKeyOffset = absKvHeadIdx * uniforms.past_sequence_length * uniforms.K;":""};
    let kOffset = absKvHeadIdx * uniforms.kv_sequence_length * uniforms.K;
    ${h?"let presentKeyOffset = absKvHeadIdx * uniforms.N * uniforms.K;":""}
    var value = ${G}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (global_id.y < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = q[qOffset + local_id.y * uniforms.K + w + local_id.x];
      }
      if (n + local_id.y < uniforms.N && w + local_id.x < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
      ${S&&h?`
              if (n + local_id.y < past_sequence_length) {
                tileK[idx] = past_key[pastKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
              } else if (n + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
                tileK[idx] = key[kOffset + (n + local_id.y - past_sequence_length) * uniforms.K + w + local_id.x];
              }`:`
          if (n + local_id.y < uniforms.kv_sequence_length) {
            tileK[idx] = key[kOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
          }`}
      ${h?`if (n + local_id.y < present_sequence_length) {
        present_key[presentKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x] = tileK[idx];
      }`:""}
      }
      workgroupBarrier();

      for (var k: u32 = 0u; k < TILE_SIZE && w+k < uniforms.K; k++) {
          value += ${G}(tileQ[TILE_SIZE * local_id.y + k] * tileK[TILE_SIZE * local_id.x + k]);
      }

      workgroupBarrier();
    }

    if (global_id.y < uniforms.M && global_id.x < total_sequence_length) {
      let headOffset = workgroup_id.z * uniforms.M * uniforms.N;
      let outputIdx = headOffset + global_id.y * uniforms.N + global_id.x;
      var sum: f32 = ${(()=>{switch(x){case 1:return"value";case 2:return"value.x + value.y";case 4:return"value.x + value.y + value.z + value.w";default:throw new Error(`Unsupported components: ${x}`)}})()};
        output[outputIdx] = ${se.type.value} (sum * uniforms.alpha) + ${a?"attention_bias[outputIdx]":"0.0"};
    }
  }`};return{name:"AttentionProbs",shaderCache:{hint:`${x};${a!==void 0};${i!==void 0};${e}`,inputDependencies:z},getRunData:()=>({outputs:E,dispatchGroup:C,programUniforms:T}),getShaderSource:R}},Oo=(e,t,r,i,a,s,o=void 0,u=void 0)=>{let d=s+a.kvSequenceLength,p=a.nReps?a.nReps:1,f=a.vHiddenSize*p,h=e>1&&i,g=a.kvNumHeads?a.kvNumHeads:a.numHeads,y=h?[a.batchSize,g,d,a.headSize]:void 0,_=[a.batchSize,a.sequenceLength,f],$=12,x={x:Math.ceil(a.vHeadSize/$),y:Math.ceil(a.sequenceLength/$),z:a.batchSize*a.numHeads},v=[{type:12,data:a.sequenceLength},{type:12,data:d},{type:12,data:a.vHeadSize},{type:12,data:a.numHeads},{type:12,data:a.headSize},{type:12,data:f},{type:12,data:s},{type:12,data:a.kvSequenceLength},{type:12,data:p}],b=h&&i&&A.size(i.dims)>0,C=["type","type"];b&&C.push("type"),o&&C.push("type"),u&&C.push("type");let T=[{dims:_,dataType:t.dataType,gpuDataType:0}];h&&T.push({dims:y,dataType:t.dataType,gpuDataType:0});let S=z=>{let E=M("probs",t.dataType,t.dims),R=M("v",r.dataType,r.dims),L=[E,R];b&&L.push(M("past_value",i.dataType,i.dims));let F=o?M("seq_lens",o.dataType,o.dims):void 0;o&&L.push(F);let K=u?M("total_sequence_length_input",u.dataType,u.dims):void 0;u&&L.push(K);let X=[Y("output",t.dataType,_)];h&&X.push(Y("present_value",t.dataType,y));let re=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"v_hidden_size",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${$}u;
  var<workgroup> tileQ: array<${E.type.value}, ${$*$}>;
  var<workgroup> tileV: array<${E.type.value}, ${$*$}>;
  ${z.registerUniforms(re).declareVariables(...L,...X)}
  ${z.mainStart([$,$,1])}
   let headIdx = workgroup_id.z % uniforms.num_heads;
   let batchIdx = workgroup_id.z / uniforms.num_heads;
   let kvHeadIdx = ${p===1?"headIdx":"headIdx / uniforms.n_reps"};
   let kv_num_heads = ${p===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
   let m = global_id.y;
   let n = global_id.x;
   let sequence_length = uniforms.M;
   var total_sequence_length = uniforms.K;
   ${Ni(F,K,!0)}
   let offsetA = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
   let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx; // kvHeadIdx is relative to the batch
   ${b&&h?"let pastValueOffset = absKvHeadIdx * uniforms.N * uniforms.past_sequence_length + n;":""};
   let vOffset = absKvHeadIdx * uniforms.N * uniforms.kv_sequence_length + n;
   ${h?"let presentValueOffset = absKvHeadIdx * uniforms.N * uniforms.K + n;":""}
   var value = ${E.type.storage}(0);
   for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = probs[offsetA + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
        ${b&&h?`
        if (w + local_id.y < past_sequence_length) {
          tileV[idx] = past_value[pastValueOffset + (w + local_id.y) * uniforms.N];
        } else if (w + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
          tileV[idx] = v[vOffset + (w + local_id.y - past_sequence_length) * uniforms.N];
        }
      `:`
            if (w + local_id.y < uniforms.kv_sequence_length) {
              tileV[idx] = v[vOffset + (w + local_id.y) * uniforms.N];
            }`}
        ${h?`
            if (w + local_id.y < present_sequence_length) {
          present_value[presentValueOffset + (w + local_id.y) * uniforms.N] = tileV[idx];
        }`:""}
      }
     workgroupBarrier();
     for (var k: u32 = 0u; k < TILE_SIZE && w+k < total_sequence_length; k++) {
       value += tileQ[TILE_SIZE * local_id.y + k] * tileV[TILE_SIZE * k + local_id.x];
     }
     workgroupBarrier();
   }

   // we need to transpose output from BNSH_v to BSND_v
   if (m < uniforms.M && n < uniforms.N) {
     let outputIdx = batchIdx * uniforms.M * uniforms.v_hidden_size + m * uniforms.v_hidden_size
       + headIdx * uniforms.N + n;
     output[outputIdx] = value;
   }
  }`};return{name:"AttentionScore",shaderCache:{hint:`${i!==void 0};${e}`,inputDependencies:C},getRunData:()=>({outputs:T,dispatchGroup:x,programUniforms:v}),getShaderSource:S}},wi=(e,t,r,i,a,s,o,u,d,p,f=void 0,h=void 0)=>{let g=Math.min(e.outputCount,1+(o?1:0)+(u?1:0)),y=g>1?p.pastSequenceLength:0,_=y+p.kvSequenceLength,$=d&&A.size(d.dims)>0?d:void 0,x=[t,r];g>1&&o&&A.size(o.dims)>0&&x.push(o),$&&x.push($),f&&x.push(f),h&&x.push(h);let v=e.compute(Ao(g,t,r,o,$,p,y,f,h),{inputs:x,outputs:g>1?[-1,1]:[-1]})[0];e.compute(zo(v,p.batchSize,p.numHeads,y,p.sequenceLength,_,f,h),{inputs:f&&h?[v,f,h]:[v],outputs:[]});let b=[v,i];g>1&&u&&A.size(u.dims)>0&&b.push(u),f&&b.push(f),h&&b.push(h),e.compute(Oo(g,v,i,u,p,y,f,h),{inputs:b,outputs:g>1?[0,2]:[0]})},Ro=(e,t)=>{let r=[t.batchSize,t.numHeads,t.sequenceLength,t.headSize],i=t.sequenceLength,a=t.inputHiddenSize,s=t.headSize,o=12,u={x:Math.ceil(t.headSize/o),y:Math.ceil(t.sequenceLength/o),z:t.batchSize*t.numHeads},d=[e.inputs[0],e.inputs[1],e.inputs[2]],p=[{type:12,data:i},{type:12,data:a},{type:12,data:s},{type:12,data:t.numHeads},{type:12,data:t.headSize},{type:12,data:t.hiddenSize},{type:12,data:t.hiddenSize+t.hiddenSize+t.vHiddenSize}],f=h=>{let g=Y("output_q",d[0].dataType,r),y=Y("output_k",d[0].dataType,r),_=Y("output_v",d[0].dataType,r),$=M("input",d[0].dataType,d[0].dims),x=M("weight",d[1].dataType,d[1].dims),v=M("bias",d[2].dataType,d[2].dims),b=$.type.storage,C=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"hidden_size",type:"u32"},{name:"ldb",type:"u32"}];return`
  const TILE_SIZE = ${o}u;
  var<workgroup> tileInput: array<${b}, ${o*o}>;
  var<workgroup> tileWeightQ: array<${b}, ${o*o}>;
  var<workgroup> tileWeightK: array<${b}, ${o*o}>;
  var<workgroup> tileWeightV: array<${b}, ${o*o}>;
  ${h.registerUniforms(C).declareVariables($,x,v,g,y,_)}
  ${h.mainStart([o,o,1])}
    let batchIndex = workgroup_id.z / uniforms.num_heads;
    let headNumber = workgroup_id.z % uniforms.num_heads;
    let m = global_id.y;
    let n = global_id.x;

    let inputOffset = batchIndex * (uniforms.M * uniforms.K) + m * uniforms.K;
    let biasOffsetQ = headNumber * uniforms.head_size;
    let biasOffsetK = uniforms.hidden_size + biasOffsetQ;
    let biasOffsetV = uniforms.hidden_size + biasOffsetK;

    var valueQ = ${b}(0);
    var valueK = ${b}(0);
    var valueV = ${b}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileInput[TILE_SIZE * local_id.y + local_id.x] = input[inputOffset + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        let offset = n + (w + local_id.y) * uniforms.ldb;
        tileWeightQ[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetQ + offset];
        tileWeightK[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetK + offset];
        tileWeightV[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetV + offset];
      }
      workgroupBarrier();
      for (var k: u32 = 0u; k<TILE_SIZE && w+k < uniforms.K; k++) {
        let inputTileOffset = TILE_SIZE * local_id.y + k;
        let weightTileOffset = TILE_SIZE * k + local_id.x;
        valueQ += tileInput[inputTileOffset] * tileWeightQ[weightTileOffset];
        valueK += tileInput[inputTileOffset] * tileWeightK[weightTileOffset];
        valueV += tileInput[inputTileOffset] * tileWeightV[weightTileOffset];
      }

      workgroupBarrier();
    }

    let headOffset = (m * uniforms.N + n) % uniforms.head_size;
    valueQ += bias[headOffset + biasOffsetQ];
    valueK += bias[headOffset + biasOffsetK];
    valueV += bias[headOffset + biasOffsetV];

    let offset = workgroup_id.z * uniforms.M * uniforms.N;
    if (m < uniforms.M && n < uniforms.N) {
      let outputIdx = offset + m * uniforms.N + n;
      output_q[outputIdx] = valueQ;
      output_k[outputIdx] = valueK;
      output_v[outputIdx] = valueV;
    }
  }`};return e.compute({name:"AttentionPrepare",shaderCache:{inputDependencies:["type","type","type"]},getRunData:()=>({outputs:[{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0}],dispatchGroup:u,programUniforms:p}),getShaderSource:f},{inputs:d,outputs:[-1,-1,-1]})},gp=(e,t)=>{let r=Eo(e.inputs,t),[i,a,s]=Ro(e,r);return wi(e,i,a,s,e.inputs[4],void 0,void 0,void 0,e.inputs[5],r)}}),Bo,Mo,No,yp,Gm=U(()=>{je(),ie(),oe(),ke(),ue(),Bo=(e,t)=>{if(!e||e.length!==5)throw new Error("BatchNormalization requires 5 inputs");let r=(i,a,s)=>{let o=a.length;if(o!==i.length)throw new Error(`${s}: num dimensions != ${o}`);a.forEach((u,d)=>{if(u!==i[d])throw new Error(`${s}: dim[${d}] do not match`)})};if(e[0].dims.length>1){let i=t.format==="NHWC"?t.spatial?e[0].dims.slice(-1):e[0].dims.slice(-1).concat(e[0].dims.slice(1,e[0].dims.length-1)):e[0].dims.slice(1,t.spatial?2:void 0);r(e[1].dims,i,"Invalid input scale"),r(e[2].dims,i,"Invalid input B"),r(e[3].dims,i,"Invalid input mean"),r(e[4].dims,i,"Invalid input var")}else r(e[1].dims,[1],"Invalid input scale"),r(e[2].dims,[1],"Invalid input B"),r(e[3].dims,[1],"Invalid input mean"),r(e[4].dims,[1],"Invalid input var")},Mo=(e,t)=>{let{epsilon:r,spatial:i,format:a}=t,s=e[0].dims,o=i?Te(s[s.length-1]):1,u=a==="NHWC"&&s.length>1?o:1,d=A.size(s)/o,p=i,f=p?s.length:s,h=M("x",e[0].dataType,e[0].dims,o),g=M("scale",e[1].dataType,e[1].dims,u),y=M("bias",e[2].dataType,e[2].dims,u),_=M("inputMean",e[3].dataType,e[3].dims,u),$=M("inputVar",e[4].dataType,e[4].dims,u),x=Y("y",e[0].dataType,f,o),v=()=>{let C="";if(i)C=`let cOffset = ${s.length===1?"0u":a==="NHWC"?`outputIndices[${s.length-1}] / ${o}`:"outputIndices[1]"};`;else if(a==="NCHW")C=`
            ${x.indicesSet("outputIndices","0","0")}
            let cOffset = ${x.indicesToOffset("outputIndices")};`;else{C=`var cIndices = ${g.type.indices}(0);
                       cIndices[0] = outputIndices[${s.length-1}];`;for(let T=1;T<g.rank;T++)C+=`cIndices[${T}] = outputIndices[${T}];`;C+=`let cOffset = ${g.indicesToOffset("cIndices")};`}return C},b=C=>`
  const epsilon = ${r};
  ${C.registerUniform("outputSize","u32").declareVariables(h,g,y,_,$,x)}
  ${C.mainStart()}
  ${C.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
    var outputIndices = ${x.offsetToIndices(`global_idx * ${o}`)};
    ${v()}
    let scale = ${g.getByOffset("cOffset")};
    let bias = ${y.getByOffset("cOffset")};
    let inputMean = ${_.getByOffset("cOffset")};
    let inputVar = ${$.getByOffset("cOffset")};
    let x = ${h.getByOffset("global_idx")};
    let value = (x - inputMean) * inverseSqrt(inputVar + epsilon) * scale + bias;
    ${x.setByOffset("global_idx","value")}
  }`;return{name:"BatchNormalization",shaderCache:{hint:`${t.epsilon}_${t.format}_${i}_${o}`,inputDependencies:p?["rank","type","type","type","type"]:void 0},getShaderSource:b,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:p?[{type:12,data:d},...J(s)]:[{type:12,data:d}]})}},No=e=>me(e),yp=(e,t)=>{let{inputs:r,outputCount:i}=e,a=No({...t,outputCount:i});if($e.webgpu.validateInputContent&&Bo(r,a),t.trainingMode)throw new Error("BatchNormalization trainingMode is not supported yet.");e.compute(Mo(r,a))}}),Do,Po,_p,Hm=U(()=>{oe(),ue(),Do=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![320,640,1280].includes(e[0].dims[2]))throw new Error("number of channels should be 320, 640 or 1280");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},Po=e=>{let t=e[0].dims,r=e[0].dims[2],i=A.size(t)/4,a=e[0].dataType,s=M("input",a,t,4),o=M("bias",a,[r],4),u=M("residual",a,t,4),d=Y("output",a,t,4);return{name:"BiasAdd",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(i/64)}}),getShaderSource:p=>`
  const channels = ${r}u / 4;
  ${p.declareVariables(s,o,u,d)}

  ${p.mainStart()}
    ${p.guardAgainstOutOfBoundsWorkgroupSizes(i)}
    let value = ${s.getByOffset("global_idx")}
      + ${o.getByOffset("global_idx % channels")} + ${u.getByOffset("global_idx")};
    ${d.setByOffset("global_idx","value")}
  }`}},_p=e=>{Do(e.inputs),e.compute(Po(e.inputs))}}),Lo,fe,wp,bp,$p,vp,xp,Tp,kp,Cp,Sp,Uo,Ip,Ep,zp,Ap,hi,Op,ji,Rp,Bp,Mp,Np,Dp,Pp,Lp,Up,Wp,qp,Fp,jp,Vp,Gp,Hp,Kp,Kr,Zp,Aa,Oa,Yp,Xp,Qp,Wo,qo,Jp,rn=U(()=>{ie(),oe(),ke(),ue(),Lo=(e,t,r,i,a,s,o)=>{let u=Math.ceil(t/4),d="";typeof a=="string"?d=`${a}(a)`:d=a("a");let p=M("inputData",r,[u],4),f=Y("outputData",i,[u],4),h=[{name:"vec_size",type:"u32"}];return o&&h.push(...o),`
      ${e.registerUniforms(h).declareVariables(p,f)}

  ${s??""}

  ${e.mainStart()}
    ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}

    let a = ${p.getByOffset("global_idx")};
    ${f.setByOffset("global_idx",d)}
  }`},fe=(e,t,r,i,a,s=e.dataType,o,u)=>{let d=[{type:12,data:Math.ceil(A.size(e.dims)/4)}];return o&&d.push(...o),{name:t,shaderCache:{hint:a,inputDependencies:["type"]},getShaderSource:p=>Lo(p,A.size(e.dims),e.dataType,s,r,i,u),getRunData:p=>({outputs:[{dims:e.dims,dataType:s}],dispatchGroup:{x:Math.ceil(A.size(p[0].dims)/64/4)},programUniforms:d})}},wp=e=>{e.compute(fe(e.inputs[0],"Abs","abs"))},bp=e=>{e.compute(fe(e.inputs[0],"Acos","acos"))},$p=e=>{e.compute(fe(e.inputs[0],"Acosh","acosh"))},vp=e=>{e.compute(fe(e.inputs[0],"Asin","asin"))},xp=e=>{e.compute(fe(e.inputs[0],"Asinh","asinh"))},Tp=e=>{e.compute(fe(e.inputs[0],"Atan","atan"))},kp=e=>{e.compute(fe(e.inputs[0],"Atanh","atanh"))},Cp=e=>me(e),Sp=(e,t)=>{let r;switch(t.to){case 10:r="vec4<f16>";break;case 1:r="vec4<f32>";break;case 12:r="vec4<u32>";break;case 6:r="vec4<i32>";break;case 9:r="vec4<bool>";break;default:throw new RangeError(`not supported type (specified in attribute 'to' from 'Cast' operator): ${t.to}`)}e.compute(fe(e.inputs[0],"Cast",r,void 0,t.cacheKey,t.to))},Uo=e=>{let t,r,i=e.length>=2&&e[1].data!==0,a=e.length>=3&&e[2].data!==0;switch(e[0].dataType){case 1:t=i?e[1].getFloat32Array()[0]:-34028234663852886e22,r=a?e[2].getFloat32Array()[0]:34028234663852886e22;break;case 10:t=i?e[1].getUint16Array()[0]:64511,r=a?e[2].getUint16Array()[0]:31743;break;default:throw new Error("Unsupport data type")}return me({min:t,max:r})},Ip=(e,t)=>{let r=t||Uo(e.inputs),i=Re(e.inputs[0].dataType);e.compute(fe(e.inputs[0],"Clip",a=>`clamp(${a}, vec4<${i}>(uniforms.min), vec4<${i}>(uniforms.max))`,void 0,r.cacheKey,void 0,[{type:e.inputs[0].dataType,data:r.min},{type:e.inputs[0].dataType,data:r.max}],[{name:"min",type:i},{name:"max",type:i}]),{inputs:[0]})},Ep=e=>{e.compute(fe(e.inputs[0],"Ceil","ceil"))},zp=e=>{e.compute(fe(e.inputs[0],"Cos","cos"))},Ap=e=>{e.compute(fe(e.inputs[0],"Cosh","cosh"))},hi=e=>me(e),Op=(e,t)=>{let r=Re(e.inputs[0].dataType);e.compute(fe(e.inputs[0],"Elu",i=>`elu_vf32(${i})`,`
  const elu_alpha_ = ${r}(${t.alpha});

  fn elu_f32(a: ${r}) -> ${r} {
  return select((exp(a) - 1.0) * elu_alpha_, a, a >= 0.0);
  }

  fn elu_vf32(v: vec4<${r}>) -> vec4<${r}> {
  return vec4(elu_f32(v.x), elu_f32(v.y), elu_f32(v.z), elu_f32(v.w));
  }`,t.cacheKey))},ji=(e="f32")=>`
const r0: ${e} = 0.3275911;
const r1: ${e} = 0.254829592;
const r2: ${e} = -0.284496736;
const r3: ${e} = 1.421413741;
const r4: ${e} = -1.453152027;
const r5: ${e} = 1.061405429;

fn erf_vf32(v: vec4<${e}>) -> vec4<${e}> {
  let absv = abs(v);
  let x = 1.0 / (1.0 + r0 * absv);
  return sign(v) * (1.0 - ((((r5 * x + r4) * x + r3) * x + r2) * x + r1) * x * exp(-absv * absv));
}`,Rp=e=>{let t=Re(e.inputs[0].dataType);e.compute(fe(e.inputs[0],"Erf",r=>`erf_vf32(${r})`,ji(t)))},Bp=e=>{e.compute(fe(e.inputs[0],"Exp","exp"))},Mp=e=>{e.compute(fe(e.inputs[0],"Floor","floor"))},Np=e=>{let t=Re(e.inputs[0].dataType);e.compute(fe(e.inputs[0],"Gelu",r=>`0.5 * ${r} * (1.0 + erf_vf32(${r} * 0.7071067811865475))`,ji(t)))},Dp=(e,t)=>{let r=Re(e.inputs[0].dataType);e.compute(fe(e.inputs[0],"LeakyRelu",i=>`select(leaky_relu_alpha_ * ${i}, ${i}, ${i} >= vec4<${r}>(0.0))`,`const leaky_relu_alpha_ = ${r}(${t.alpha});`,t.cacheKey))},Pp=e=>{e.compute(fe(e.inputs[0],"Not",t=>`!${t}`))},Lp=e=>{e.compute(fe(e.inputs[0],"Neg",t=>`-${t}`))},Up=e=>{e.compute(fe(e.inputs[0],"Reciprocal",t=>`1.0/${t}`))},Wp=e=>{let t=Re(e.inputs[0].dataType);e.compute(fe(e.inputs[0],"Relu",r=>`select(vec4<${t}>(0.0), ${r}, ${r} > vec4<${t}>(0.0))`))},qp=e=>{e.compute(fe(e.inputs[0],"Sigmoid",t=>`(1.0 / (1.0 + exp(-${t})))`))},Fp=e=>me(e),jp=(e,t)=>{let r=Re(e.inputs[0].dataType);e.compute(fe(e.inputs[0],"HardSigmoid",i=>`max(vec4<${r}>(0.0), min(vec4<${r}>(1.0), ${t.alpha} * ${i} + vec4<${r}>(${t.beta})))`,void 0,t.cacheKey))},Vp=e=>{e.compute(fe(e.inputs[0],"Sin","sin"))},Gp=e=>{e.compute(fe(e.inputs[0],"Sinh","sinh"))},Hp=e=>{e.compute(fe(e.inputs[0],"Sqrt","sqrt"))},Kp=e=>{e.compute(fe(e.inputs[0],"Tan","tan"))},Kr=e=>`sign(${e}) * (1 - exp(-2 * abs(${e}))) / (1 + exp(-2 * abs(${e})))`,Zp=e=>{e.compute(fe(e.inputs[0],"Tanh",Kr))},Aa=(e="f32")=>`
const fast_gelu_a: ${e} = 0.5;
const fast_gelu_b: ${e} = 0.7978845608028654;
const fast_gelu_c: ${e} = 0.035677408136300125;

fn tanh_v(v: vec4<${e}>) -> vec4<${e}> {
  return ${Kr("v")};
}
`,Oa=e=>`(fast_gelu_a + fast_gelu_a * tanh_v(${e} * (fast_gelu_c * ${e} * ${e} + fast_gelu_b))) * ${e}`,Yp=e=>{let t=Re(e.inputs[0].dataType);e.compute(fe(e.inputs[0],"FastGelu",Oa,Aa(t),void 0,e.inputs[0].dataType))},Xp=(e,t)=>{let r=Re(e.inputs[0].dataType);return e.compute(fe(e.inputs[0],"ThresholdedRelu",i=>`select(vec4<${r}>(0.0), ${i}, ${i} > thresholded_relu_alpha_)`,`const thresholded_relu_alpha_ = vec4<${r}>(${t.alpha});`,t.cacheKey)),0},Qp=e=>{e.compute(fe(e.inputs[0],"Log","log"))},Wo=(e,t)=>`
const alpha = vec4<${e}>(${t});
const one = ${e}(1.0);
const zero = ${e}(0.0);

fn quick_gelu_impl(x: vec4<${e}>) -> vec4<${e}> {
  let v = x *alpha;
  var x1 : vec4<${e}>;
  for (var i = 0; i < 4; i = i + 1) {
    if (v[i] >= zero) {
      x1[i] = one / (one + exp(-v[i]));
    } else {
      x1[i] = one - one / (one + exp(v[i]));
    }
  }
  return x * x1;
}
`,qo=e=>`quick_gelu_impl(${e})`,Jp=(e,t)=>{let r=Re(e.inputs[0].dataType);e.compute(fe(e.inputs[0],"QuickGelu",qo,Wo(r,t.alpha),t.cacheKey,e.inputs[0].dataType))}}),Fo,jo,ec,Km=U(()=>{oe(),ue(),rn(),Fo=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![2560,5120,10240].includes(e[0].dims[2]))throw new Error("hidden state should be 2560, 5120 or 10240");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},jo=e=>{let t=e[0].dims.slice();t[2]=t[2]/2;let r=M("input",e[0].dataType,e[0].dims,4),i=M("bias",e[0].dataType,[e[0].dims[2]],4),a=Y("output",e[0].dataType,t,4),s=A.size(t)/4,o=Ee(e[0].dataType);return{name:"BiasSplitGelu",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)}}),getShaderSource:u=>`
  const M_SQRT2 = sqrt(2.0);
  const halfChannels = ${e[0].dims[2]/4/2}u;

  ${u.declareVariables(r,i,a)}

  ${ji(o)}

  ${u.mainStart()}
    ${u.guardAgainstOutOfBoundsWorkgroupSizes(s)}
    let biasIdx = global_idx % halfChannels;
    let batchIndex = global_idx / halfChannels;
    let inputOffset = biasIdx + batchIndex * halfChannels * 2;
    let valueLeft = input[inputOffset] + bias[biasIdx];
    let valueRight = input[inputOffset + halfChannels] + bias[biasIdx + halfChannels];
    let geluRight = valueRight * 0.5 * (erf_vf32(valueRight / M_SQRT2) + 1);

    ${a.setByOffset("global_idx","valueLeft * geluRight")}
  }`}},ec=e=>{Fo(e.inputs),e.compute(jo(e.inputs))}}),Vo,Go,Ze,tc,ic,rc,ac,nc,sc,oc,uc,lc,dc,Zm=U(()=>{ie(),oe(),ue(),Vo=(e,t,r,i,a,s,o,u,d,p,f,h)=>{let g,y;typeof u=="string"?g=y=(b,C)=>`${u}((${b}),(${C}))`:typeof u=="function"?g=y=u:(g=u.scalar,y=u.vector);let _=Y("outputData",f,i.length,4),$=M("aData",d,t.length,4),x=M("bData",p,r.length,4),v;if(a)if(s){let b=A.size(t)===1,C=A.size(r)===1,T=t.length>0&&t[t.length-1]%4===0,S=r.length>0&&r[r.length-1]%4===0;b||C?v=_.setByOffset("global_idx",y(b?`${$.type.value}(${$.getByOffset("0")}.x)`:$.getByOffset("global_idx"),C?`${x.type.value}(${x.getByOffset("0")}.x)`:x.getByOffset("global_idx"))):v=`
            let outputIndices = ${_.offsetToIndices("global_idx * 4u")};
            let offsetA = ${$.broadcastedIndicesToOffset("outputIndices",_)};
            let offsetB = ${x.broadcastedIndicesToOffset("outputIndices",_)};
            ${_.setByOffset("global_idx",y(o||T?$.getByOffset("offsetA / 4u"):`${$.type.value}(${$.getByOffset("offsetA / 4u")}[offsetA % 4u])`,o||S?x.getByOffset("offsetB / 4u"):`${x.type.value}(${x.getByOffset("offsetB / 4u")}[offsetB % 4u])`))}
          `}else v=_.setByOffset("global_idx",y($.getByOffset("global_idx"),x.getByOffset("global_idx")));else{if(!s)throw new Error("no necessary to use scalar implementation for element-wise binary op implementation.");let b=(C,T,S="")=>{let z=`aData[indexA${T}][componentA${T}]`,E=`bData[indexB${T}][componentB${T}]`;return`
            let outputIndices${T} = ${_.offsetToIndices(`global_idx * 4u + ${T}u`)};
            let offsetA${T} = ${$.broadcastedIndicesToOffset(`outputIndices${T}`,_)};
            let offsetB${T} = ${x.broadcastedIndicesToOffset(`outputIndices${T}`,_)};
            let indexA${T} = offsetA${T} / 4u;
            let indexB${T} = offsetB${T} / 4u;
            let componentA${T} = offsetA${T} % 4u;
            let componentB${T} = offsetB${T} % 4u;
            ${C}[${T}] = ${S}(${g(z,E)});
          `};f===9?v=`
            var data = vec4<u32>(0);
            ${b("data",0,"u32")}
            ${b("data",1,"u32")}
            ${b("data",2,"u32")}
            ${b("data",3,"u32")}
            outputData[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:v=`
            ${b("outputData[global_idx]",0)}
            ${b("outputData[global_idx]",1)}
            ${b("outputData[global_idx]",2)}
            ${b("outputData[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables($,x,_)}

        ${h??""}

        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${v}
      }`},Go=(e,t,r,i,a,s,o=r.dataType)=>{let u=r.dims.map($=>Number($)??1),d=i.dims.map($=>Number($)??1),p=!A.areEqual(u,d),f=u,h=A.size(u),g=!1,y=!1,_=[p];if(p){let $=Vt.calcShape(u,d,!1);if(!$)throw new Error("Can't perform binary op on the given tensors");f=$.slice(),h=A.size(f);let x=A.size(u)===1,v=A.size(d)===1,b=u.length>0&&u[u.length-1]%4===0,C=d.length>0&&d[d.length-1]%4===0;_.push(x),_.push(v),_.push(b),_.push(C);let T=1;for(let S=1;S<f.length;S++){let z=u[u.length-S],E=d[d.length-S];if(z===E)T*=z;else break}T%4===0?(y=!0,g=!0):(x||v||b||C)&&(g=!0)}else g=!0;return _.push(g),{name:e,shaderCache:{hint:t+_.map($=>$.toString()).join("_"),inputDependencies:["rank","rank"]},getShaderSource:$=>Vo($,u,d,f,g,p,y,a,r.dataType,i.dataType,o,s),getRunData:()=>({outputs:[{dims:f,dataType:o}],dispatchGroup:{x:Math.ceil(h/64/4)},programUniforms:[{type:12,data:Math.ceil(A.size(f)/4)},...J(u,d,f)]})}},Ze=(e,t,r,i,a,s)=>{e.compute(Go(t,a??"",e.inputs[0],e.inputs[1],r,i,s))},tc=e=>{Ze(e,"Add",(t,r)=>`${t}+${r}`)},ic=e=>{Ze(e,"Div",(t,r)=>`${t}/${r}`)},rc=e=>{Ze(e,"Equal",{scalar:(t,r)=>`u32(${t}==${r})`,vector:(t,r)=>`vec4<u32>(${t}==${r})`},void 0,void 0,9)},ac=e=>{Ze(e,"Mul",(t,r)=>`${t}*${r}`)},nc=e=>{let t=M("input",e.inputs[0].dataType,e.inputs[0].dims).type.value;Ze(e,"Pow",{scalar:(r,i)=>`pow_custom(${r},${i})`,vector:(r,i)=>`pow_vector_custom(${r},${i})`},`
    fn pow_custom(a : ${t}, b : ${t}) -> ${t} {
      if (b == ${t}(0.0)) {
        return ${t}(1.0);
      } else if (a < ${t}(0.0) && f32(b) != floor(f32(b))) {
        return ${t}(pow(f32(a), f32(b))); // NaN
      }
      return select(sign(a), ${t}(1.0), round(f32(abs(b) % ${t}(2.0))) != 1.0) * ${t}(${t==="i32"?"round":""}(pow(f32(abs(a)), f32(b))));
    }
    fn pow_vector_custom(a : vec4<${t}>, b : vec4<${t}>) -> vec4<${t}> {
      // TODO: implement vectorized pow
      return vec4<${t}>(pow_custom(a.x, b.x), pow_custom(a.y, b.y), pow_custom(a.z, b.z), pow_custom(a.w, b.w));
    }
      `)},sc=e=>{Ze(e,"Sub",(t,r)=>`${t}-${r}`)},oc=e=>{Ze(e,"Greater",{scalar:(t,r)=>`u32(${t}>${r})`,vector:(t,r)=>`vec4<u32>(${t}>${r})`},void 0,void 0,9)},uc=e=>{Ze(e,"Less",{scalar:(t,r)=>`u32(${t}<${r})`,vector:(t,r)=>`vec4<u32>(${t}<${r})`},void 0,void 0,9)},lc=e=>{Ze(e,"GreaterOrEqual",{scalar:(t,r)=>`u32(${t}>=${r})`,vector:(t,r)=>`vec4<u32>(${t}>=${r})`},void 0,void 0,9)},dc=e=>{Ze(e,"LessOrEqual",{scalar:(t,r)=>`u32(${t}<=${r})`,vector:(t,r)=>`vec4<u32>(${t}<=${r})`},void 0,void 0,9)}}),Ho,Ko,Zo,Yo,pc,cc,Ym=U(()=>{ie(),oe(),ke(),ue(),Ho=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");let r=0,i=e[r],a=i.dataType,s=i.dims.length;e.forEach((o,u)=>{if(u!==r){if(o.dataType!==a)throw new Error("input tensors should be one type");if(o.dims.length!==s)throw new Error("input tensors should have the same shape");o.dims.forEach((d,p)=>{if(p!==t&&d!==i.dims[p])throw new Error("non concat dimensions must match")})}})},Ko=(e,t)=>`
  fn calculateInputIndex(index: u32) -> u32 {
    let sizeInConcatAxis = array<u32, ${e}u>(${t});
    for (var i: u32 = 0u; i < ${e}; i += 1u ) {
      if (index < sizeInConcatAxis[i]) {
        return i;
      }
    }
    return ${e}u;
  }`,Zo=(e,t)=>{let r=e.length,i=[];for(let a=0;a<r;++a){let s=t.setByOffset("global_idx",e[a].getByIndices("indices"));r===1?i.push(s):a===0?i.push(`if (inputIndex == ${a}u) { ${s} }`):a===r-1?i.push(`else { ${s} }`):i.push(`else if (inputIndex == ${a}) { ${s} }`)}return i.join(`
`)},Yo=(e,t,r,i)=>{let a=A.size(r),s=new Array(e.length),o=new Array(e.length),u=0,d=[],p=[],f=[{type:12,data:a}];for(let $=0;$<e.length;++$)u+=e[$].dims[t],s[$]=u,p.push(e[$].dims.length),o[$]=M(`input${$}`,i,p[$]),d.push("rank"),f.push({type:12,data:s[$]});for(let $=0;$<e.length;++$)f.push(...J(e[$].dims));f.push(...J(r));let h=Y("output",i,r.length),g=h.indicesGet("indices",t),y=Array.from(Array(s.length).keys()).map($=>`uniforms.sizeInConcatAxis${$}`).join(","),_=$=>`

  ${(()=>{$.registerUniform("outputSize","u32");for(let x=0;x<e.length;x++)$.registerUniform(`sizeInConcatAxis${x}`,"u32");return $.declareVariables(...o,h)})()}

  ${Ko(s.length,y)}

  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

    var indices = ${h.offsetToIndices("global_idx")};

    let inputIndex = calculateInputIndex(${g});
    if (inputIndex != 0u) {
      let sizeInConcatAxis = array<u32, ${s.length}u>(${y});
      ${g} -= sizeInConcatAxis[inputIndex - 1u];
    }

    ${Zo(o,h)}
  }`;return{name:"Concat",shaderCache:{hint:`${t}`,inputDependencies:d},getRunData:()=>({outputs:[{dims:r,dataType:i}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:f}),getShaderSource:_}},pc=(e,t)=>{let r=e.inputs,i=r[0].dims,a=A.normalizeAxis(t.axis,i.length);Ho(r,a);let s=i.slice();s[a]=r.reduce((u,d)=>u+(d.dims.length>a?d.dims[a]:0),0);let o=r.filter(u=>A.size(u.dims)>0);e.compute(Yo(o,a,s,r[0].dataType),{inputs:o})},cc=e=>me({axis:e.axis})}),Nt,Dt,Pt,an,Ut=U(()=>{ie(),oe(),Nt=(e,t,r="f32")=>{switch(e.activation){case"Relu":return`value = max(value, ${t}(0.0));`;case"Sigmoid":return`value = (${t}(1.0) / (${t}(1.0) + exp(-value)));`;case"Clip":return`value = clamp(value, ${t}(${r}(uniforms.clip_min)), ${t}(${r}(uniforms.clip_max)));`;case"HardSigmoid":return`value = max(${t}(0.0), min(${t}(1.0), ${r}(uniforms.alpha) * value + ${r}(uniforms.beta)));`;case"LeakyRelu":return`value = select(${r}(uniforms.alpha) * value, value, value >= ${t}(0.0));`;case"Tanh":return`let e2x = exp(-2.0 * abs(value));
              value = sign(value) * (1.0 - e2x) / (1.0 + e2x);
        `;case"":return"";default:throw new Error(`Unsupported activation ${e.activation}`)}},Dt=(e,t)=>{e.activation==="Clip"?t.push({type:1,data:e.clipMax},{type:1,data:e.clipMin}):e.activation==="HardSigmoid"?t.push({type:1,data:e.alpha},{type:1,data:e.beta}):e.activation==="LeakyRelu"&&t.push({type:1,data:e.alpha})},Pt=(e,t)=>{e.activation==="Clip"?t.push({name:"clip_max",type:"f32"},{name:"clip_min",type:"f32"}):e.activation==="HardSigmoid"?t.push({name:"alpha",type:"f32"},{name:"beta",type:"f32"}):e.activation==="LeakyRelu"&&t.push({name:"alpha",type:"f32"})},an=e=>{let t=e?.activation||"";if(t==="HardSigmoid"){let[r,i]=e?.activation_params||[.2,.5];return{activation:t,alpha:r,beta:i}}else if(t==="Clip"){let[r,i]=e?.activation_params||[Pd,Ld];return{activation:t,clipMax:i,clipMin:r}}else if(t==="LeakyRelu"){let[r]=e?.activation_params||[.01];return{activation:t,alpha:r}}return{activation:t}}}),Ae,fc,nn=U(()=>{Ae=(e,t)=>{switch(e){case 1:return t;case 2:return`vec2<${t}>`;case 3:return`vec3<${t}>`;case 4:return`vec4<${t}>`;default:throw new Error(`${e}-component is not supported.`)}},fc=e=>`
      ${e?"value = value + getBiasByOutputCoords(coords);":""}
      `}),hc,Xm=U(()=>{hc=e=>`
fn getIndexFromCoords4D(coords : vec4<i32>, shape : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
      shape.y * shape.z * shape.w, shape.z * shape.w, shape.w, 1));
}
fn getOutputIndexFromCoords(coords : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
    i32(${e}.x), i32(${e}.y), i32(${e}.z), 1));
}
`}),gi,sn,on=U(()=>{ie(),oe(),ue(),Ut(),gi=(e,t,r,i,a)=>{let s=i-r;return`
      ${Array.from({length:r}).map((o,u)=>`
      if (${Q(t.shape,u,t.rank)} != 1) {
        ${t.indicesSet(e,u,Q(a,u+s,i))}
      } else {
        ${t.indicesSet(e,u,0)}
      }`).join("")}
`},sn=(e,t,r,i,a=!1,s)=>{let o=e[0].dims,u=e[1].dims,d=o[o.length-2],p=u[u.length-1],f=o[o.length-1],h=Te(p),g=Te(f),y=Te(d),_=A.size(r)/h/y,$=e.length>2,x=i?i.slice(0,-2):r.slice(0,-2),v=[A.size(x),d,p],b=[{type:12,data:_},{type:12,data:d},{type:12,data:p},{type:12,data:f}];Dt(t,b),b.push(...J(x,o,u)),$&&b.push(...J(e[2].dims)),b.push(...J(v));let C=T=>{let S=Ja("batch_dims",e[0].dataType,x.length),z=M("a",e[0].dataType,o.length,g),E=M("b",e[1].dataType,u.length,h),R=Y("output",e[0].dataType,v.length,h),L=Ee(R.type.tensor),F=Nt(t,R.type.value,L),K=[z,E],X="";if($){let se=a?h:1;K.push(M("bias",e[2].dataType,e[2].dims.length,se)),X=`${a?`value += bias[col / ${se}];`:`value += ${R.type.value}(bias[row + i]);`}`}let re=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"}];Pt(t,re);let j=()=>{let se=`var a_data: ${z.type.value};`;for(let H=0;H<g;H++)se+=`
              let b_data${H} = b[(b_offset + (k + ${H}) * uniforms.N + col) / ${h}];`;for(let H=0;H<y;H++){se+=`a_data = a[(a_offset + (row + ${H}) * uniforms.K + k) / ${g}];`;for(let G=0;G<g;G++)se+=`
            values[${H}] = fma(${E.type.value}(a_data${g===1?"":`[${G}]`}), b_data${G}, values[${H}]);
`}return se};return`
  ${T.registerUniforms(re).registerInternalVariables(S).declareVariables(...K,R)}
  ${T.mainStart()}
    ${T.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let col = (global_idx % (uniforms.N / ${h})) * ${h};
    var index1 = global_idx / (uniforms.N / ${h});
    let stride1 = uniforms.M / ${y};
    let row = (index1 % stride1) * ${y};
    let batch = index1 / stride1;

    ${r.length===2?"":`let batch_indices = ${S.offsetToIndices("batch")};`}

    var a_indices: ${z.type.indices};
    ${gi("a_indices",z,z.rank-2,S.rank,"batch_indices")}
    ${z.indicesSet("a_indices",z.rank-2,0)}
    ${z.indicesSet("a_indices",z.rank-1,0)}
    let a_offset = ${z.indicesToOffset("a_indices")};

    var b_indices: ${E.type.indices};
    ${gi("b_indices",E,E.rank-2,S.rank,"batch_indices")}
    ${E.indicesSet("b_indices",E.rank-2,0)}
    ${E.indicesSet("b_indices",E.rank-1,0)}
    let b_offset = ${E.indicesToOffset("b_indices")};
    var values: array<${R.type.value}, ${y}>;
    for (var k: u32 = 0u; k < uniforms.K; k = k + ${g}) {
      ${j()}
    }
    for (var i = 0u; i < ${y}u; i++) {
      var value = values[i];
      ${X}
      ${F}
      let cur_indices = ${R.type.indices}(batch, row + i, col);
      let offset = ${R.indicesToOffset("cur_indices")};
      ${R.setByOffset(`offset / ${h}`,"value")};
    }
  }
  `};return{name:"MatMulNaive",shaderCache:{hint:`${t.activation};${h};${g};${y};${a}`,inputDependencies:$?["rank","rank","rank"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:s?s(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:b}),getShaderSource:C}}}),Xo,Qo,Ra,Zr,Jo,Ba,eu,Xi,un=U(()=>{ie(),oe(),ue(),Ut(),on(),nn(),Xo=(e,t)=>e?`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          kStart + inputRow,
          globalRowStart / innerElementSize + inputCol${t?", batchIndices":""});
        `:`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          globalRow + innerRow,
          kStart / innerElementSize + inputCol${t?", batchIndices":""});
        `,Qo=(e,t)=>e?`
        let ACached0 = mm_Asub[k * innerElementSize][localRow];
        let ACached1 = mm_Asub[k * innerElementSize + 1][localRow];
        let ACached2 = mm_Asub[k * innerElementSize + 2][localRow];
        ${t===3?"":"let ACached3 = mm_Asub[k * innerElementSize + 3][localRow];"}
        for (var i = 0; i < rowPerThread; i = i + 1) {
          acc[i] = BCached0 * ACached0[i] + acc[i];
          acc[i] = BCached1 * ACached1[i] + acc[i];
          acc[i] = BCached2 * ACached2[i] + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached3[i] + acc[i];"}
        }`:`
        for (var i = 0; i < rowPerThread; i = i + 1) {
          let ACached = mm_Asub[tileRow + i][k];
          acc[i] = BCached0 * ACached.x + acc[i];
          acc[i] = BCached1 * ACached.y + acc[i];
          acc[i] = BCached2 * ACached.z + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached.w + acc[i];"}
        }`,Ra=(e,t,r="f32",i,a=!1,s=32,o=!1,u=32)=>{let d=t[1]*e[1],p=t[0]*e[0],f=a?d:s,h=a?s:d,g=f/t[0],y=s/t[1];if(!((a&&g===4&&e[1]===4||!a&&(g===3||g===4))&&f%t[0]===0&&s%t[1]===0&&e[0]===4))throw new Error(`If transposeA ${a} is true, innerElementSize ${g} and workPerThread[1] ${e[1]} must be 4.
      Otherwise, innerElementSize ${g} must be 3 or 4.
  tileAWidth ${f} must be divisible by workgroupSize[0]${t[0]}. tileInner ${s} must be divisible by workgroupSize[1] ${t[1]}. colPerThread ${e[0]} must be 4.`);return`
var<workgroup> mm_Asub: array<array<vec${g}<${r}>, ${f/g}>, ${h}>;
var<workgroup> mm_Bsub: array<array<vec4<${r}>, ${p/e[0]}>, ${s}>;

const rowPerThread = ${e[1]};
const colPerThread = ${e[0]};
const innerElementSize = ${g};
const tileInner = ${s};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
  let localRow = i32(localId.y);
  let tileRow = localRow * rowPerThread;
  let tileCol = i32(localId.x);

  let globalRow =i32(globalId.y) * rowPerThread;
  let globalCol = i32(globalId.x);
  let batch = ${o?"0":"i32(globalId.z)"};
  ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
  let globalRowStart = i32(workgroupId.y) * ${d};

  let num_tiles = ${o?`${Math.ceil(u/s)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
  var kStart = ${o?`i32(globalId.z) * ${u}`:"0"};

  var acc: array<vec4<${r}>, rowPerThread>;

  // Loop over shared dimension.
  let tileRowB = localRow * ${y};
  for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let inputRow = tileRow + innerRow;
          let inputCol = tileCol;
          ${Xo(a,i)}
      }

      // Load one tile of B into local memory.
      for (var innerRow = 0; innerRow < ${y}; innerRow = innerRow + 1) {
          let inputRow = tileRowB + innerRow;
          let inputCol = tileCol;
          mm_Bsub[inputRow][inputCol] = mm_readB(batch, kStart + inputRow, globalCol${i?", batchIndices":""});
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      for (var k = 0; k < tileInner / innerElementSize; k = k + 1) {
          let BCached0 = mm_Bsub[k * innerElementSize][tileCol];
          let BCached1 = mm_Bsub[k * innerElementSize + 1][tileCol];
          let BCached2 = mm_Bsub[k * innerElementSize + 2][tileCol];
          ${g===3?"":"let BCached3 = mm_Bsub[k * innerElementSize + 3][tileCol];"}

          ${Qo(a,g)}
      }

      workgroupBarrier();
  }

  for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      mm_write(batch, globalRow + innerRow, globalCol, acc[innerRow]);
  }
}`},Zr=(e,t)=>e?`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              kStart + inputRow,
              globalRowStart + inputCol${t?", batchIndices":""});
            `:`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              globalRowStart + inputRow,
              kStart + inputCol${t?", batchIndices":""});
            `,Jo=e=>e?"let ACached = mm_Asub[k][tileRow + innerRow];":"let ACached = mm_Asub[tileRow + innerRow][k];",Ba=(e,t,r="f32",i,a=!1,s=32,o=!1,u=32,d=!1)=>{let p=e[1]*t[1],f=e[0]*t[0],h=a?p:s,g=a?s:p;if(!(g%t[1]===0&&h%t[0]===0&&s%t[1]===0))throw new Error(`tileAHight ${g} must be divisible by workgroupSize[1]${t[1]}, tileAWidth ${h} must be divisible by workgroupSize[0]${t[0]}, tileInner ${s} must be divisible by workgroupSize[1]${t[1]}`);let y=g/t[1],_=h/t[0],$=s/t[1],x=d?`
    let localRow = i32(localId.y);
    let localCol = i32(localId.x);
    let globalRowStart = i32(workgroupId.y) * ${p};
    let globalColStart = i32(workgroupId.x) * ${f};

    // Loop over shared dimension.
    for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var inputRow = localRow; inputRow < ${g}; inputRow = inputRow + ${t[1]}) {
        for (var inputCol = localCol; inputCol < ${h}; inputCol = inputCol + ${t[0]}) {
          ${Zr(a,i)}
        }
      }
      // Load one tile of B into local memory.
      for (var inputRow = localRow; inputRow < ${s}; inputRow = inputRow + ${t[1]}) {
            for (var inputCol = localCol; inputCol < ${f}; inputCol = inputCol + ${t[0]}) {
          mm_Bsub[inputRow][inputCol] = mm_readB(batch,
            kStart + inputRow,
            globalColStart + inputCol${i?", batchIndices":""});
        }
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      var BCached : array<${r}, colPerThread>;
      for (var k = 0; k < tileInner; k = k + 1) {
        for (var inner = 0; inner < colPerThread; inner = inner + 1) {
          BCached[inner] = mm_Bsub[k][localCol + inner * ${t[0]}];
        }
        for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let ACached = ${a?`mm_Asub[k][localRow + innerRow * ${t[1]}];`:`mm_Asub[localRow + innerRow * ${t[1]}][k];`}
          for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
            acc[innerRow][innerCol] = acc[innerRow][innerCol] +
                ACached * BCached[innerCol];
          }
        }
      }
      workgroupBarrier();
    }
    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      let gRow = globalRowStart + localRow + innerRow * ${t[1]};
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        let gCol = globalColStart + localCol + innerCol * ${t[0]};
        mm_write(batch, gRow, gCol, acc[innerRow][innerCol]);
      }
    }
    `:`
let tileRow = i32(localId.y) * rowPerThread;
let tileCol = i32(localId.x) * colPerThread;

let globalRow = i32(globalId.y) * rowPerThread;
let globalCol = i32(globalId.x) * colPerThread;
let globalRowStart = i32(workgroupId.y) * ${p};

let tileRowA = i32(localId.y) * ${y};
let tileColA = i32(localId.x) * ${_};
let tileRowB = i32(localId.y) * ${$};
// Loop over shared dimension.
for (var t = 0; t < num_tiles; t = t + 1) {
  // Load one tile of A into local memory.
  for (var innerRow = 0; innerRow < ${y}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < ${_}; innerCol = innerCol + 1) {
      let inputRow = tileRowA + innerRow;
      let inputCol = tileColA + innerCol;
      ${Zr(a,i)}
    }
  }

  // Load one tile of B into local memory.
  for (var innerRow = 0; innerRow < ${$}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
      let inputRow = tileRowB + innerRow;
      let inputCol = tileCol + innerCol;
      mm_Bsub[inputRow][inputCol] = mm_readB(batch,
        kStart + inputRow,
        globalCol + innerCol${i?", batchIndices":""});
    }
  }
  kStart = kStart + tileInner;
  workgroupBarrier();

  // Compute acc values for a single thread.
  var BCached : array<${r}, colPerThread>;
  for (var k = 0; k < tileInner; k = k + 1) {
    for (var inner = 0; inner < colPerThread; inner = inner + 1) {
      BCached[inner] = mm_Bsub[k][tileCol + inner];
    }

    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      ${Jo(a)}
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        acc[innerRow][innerCol] = acc[innerRow][innerCol] + ACached * BCached[innerCol];
      }
    }
  }

  workgroupBarrier();
}

for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
  for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
    mm_write(batch, globalRow + innerRow, globalCol + innerCol,
        acc[innerRow][innerCol]);
  }
}
`;return`
  var<workgroup> mm_Asub : array<array<${r}, ${h}>, ${g}>;
  var<workgroup> mm_Bsub : array<array<${r}, ${f}>, ${s}>;
  const rowPerThread = ${e[1]};
  const colPerThread = ${e[0]};
  const tileInner = ${s};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
    let batch = ${o?"0":"i32(globalId.z)"};
    ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
    let num_tiles = ${o?`${Math.ceil(u/s)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
    var kStart = ${o?`i32(globalId.z) * ${u}`:"0"};

    var acc : array<array<${r}, colPerThread>, rowPerThread>;
    ${x}
  }
`},eu=(e,t,r,i,a=!1)=>{let[s,o,u,d]=i,p=Ee(i[0].type.tensor);return`
    fn mm_readA(batch: i32, row: i32, colIn: i32, batchIndices: ${s.type.indices}) -> ${Ae(e,p)} {
      var value = ${Ae(e,p)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_a_outer && col < uniforms.dim_inner)
      {
        var aIndices: ${o.type.indices};
        ${gi("aIndices",o,o.rank-2,s.rank,"batchIndices")}
        ${o.indicesSet("aIndices",o.rank-2,"u32(row)")}
        ${o.indicesSet("aIndices",o.rank-1,"u32(colIn)")}
        value = ${o.getByIndices("aIndices")};
      }
      return value;
    }

    fn mm_readB(batch: i32, row: i32, colIn: i32, batchIndices: ${s.type.indices}) -> ${Ae(e,p)} {
      var value = ${Ae(e,p)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_inner && col < uniforms.dim_b_outer)
      {
        var bIndices: ${u.type.indices};
        ${gi("bIndices",u,u.rank-2,s.rank,"batchIndices")}
        ${u.indicesSet("bIndices",u.rank-2,"u32(row)")}
        ${u.indicesSet("bIndices",u.rank-1,"u32(colIn)")}
        value = ${u.getByIndices("bIndices")};
      }
      return value;
    }

    fn mm_write(batch: i32, row: i32, colIn: i32, valueIn: ${Ae(e,p)}) {
      let col = colIn * ${e};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer) {
        var value = valueIn;
        let coords = vec3<i32>(batch, row, colIn);
        ${t?`value = value + ${a?"bias[colIn]":`${Ae(e,p)}(bias[row])`};`:""}
        ${r}
        ${d.setByIndices("vec3<u32>(coords)","value")}
      }
    }
    `},Xi=(e,t,r,i,a=!1,s)=>{let o=e[0].dims,u=e[1].dims,d=o.slice(0,-2),p=u.slice(0,-2),f=i?i.slice(0,-2):r.slice(0,-2),h=A.size(f),g=o[o.length-2],y=o[o.length-1],_=u[u.length-1],$=y%4===0&&_%4===0,x=g<=8?[4,1,1]:[4,4,1],v=[8,8,1],b=[Math.ceil(_/v[0]/x[0]),Math.ceil(g/v[1]/x[1]),Math.ceil(h/v[2]/x[2])],C=$?4:1,T=[...d,g,y/C],S=T.length,z=[...p,y,_/C],E=z.length,R=[h,g,_/C],L=[{type:6,data:g},{type:6,data:_},{type:6,data:y}];Dt(t,L),L.push(...J(f,T,z));let F=["rank","rank"],K=e.length>2;K&&(L.push(...J(e[2].dims)),F.push("rank")),L.push(...J(R));let X=re=>{let j=f.length,se=Ja("batchDims",e[0].dataType,j,1),H=Ee(e[0].dataType),G=M("a",e[0].dataType,S,C),ne=M("b",e[1].dataType,E,C),V=Y("result",e[0].dataType,R.length,C),ge=[G,ne];if(K){let N=a?C:1;ge.push(M("bias",e[2].dataType,e[2].dims.length,N))}let P=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"}];Pt(t,P);let q=Ee(V.type.tensor),ee=Nt(t,V.type.value,q),pe=eu(C,K,ee,[se,G,ne,V],a);return`
  ${re.registerUniforms(P).registerInternalVariables(se).declareVariables(...ge,V)}
  ${pe}
  ${$?Ra(x,v,H,se):Ba(x,v,H,se)}
                   `};return{name:"MatMul",shaderCache:{hint:`${x};${t.activation};${$};${a}`,inputDependencies:F},getRunData:()=>({outputs:[{dims:s?s(r):r,dataType:e[0].dataType}],dispatchGroup:{x:b[0],y:b[1],z:b[2]},programUniforms:L}),getShaderSource:X}}}),tu,mc,Qm=U(()=>{ie(),dt(),ue(),Ut(),nn(),Xm(),un(),tu=(e,t,r,i,a=!1,s,o=4,u=4,d=4,p="f32")=>{let f=L=>{switch(L){case 1:return"resData = x[xIndex];";case 3:return`resData = vec3<${p}>(x[xIndex], x[xIndex + 1], x[xIndex + 2]);`;case 4:return"resData = x[xIndex / 4];";default:throw new Error(`innerElementSize ${L} is not supported.`)}},h=L=>{switch(L){case 1:return"return w[row * i32(uniforms.w_shape[3]) + colIn];";case 4:return"return w[row * i32(uniforms.w_shape[3]) / 4 + colIn];";default:throw new Error(`innerElementSize ${L} is not supported.`)}},g=e?`
    let coord = vec4<i32>(batch, xRow, xCol, xCh);
    `:`
    let coord = vec4<i32>(batch, xCh, xRow, xCol);
    `,y=e?`
    let coords = vec4<i32>(
      batch,
      row / outWidth,
      row % outWidth,
      col);
    `:`
    let coords = vec4<i32>(
      batch,
      row,
      col / outWidth,
      col % outWidth);
    `,_=e?"i32(uniforms.x_shape[1])":"i32(uniforms.x_shape[2])",$=e?"i32(uniforms.x_shape[2])":"i32(uniforms.x_shape[3])",x=e?"row":"col",v=e?"col":"row",b=`
    let inChannels = i32(uniforms.w_shape[2]);
    let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
    let outRow = ${x} / outWidth;
    let outCol = ${x} % outWidth;

    let WRow = ${v} / (i32(uniforms.w_shape[1]) * inChannels);
    let WCol = ${v} / inChannels % i32(uniforms.w_shape[1]);
    let xRow = outRow * uniforms.stride[0] + uniforms.dilation[0] * WRow - uniforms.pad[0];
    let xCol = outCol * uniforms.stride[1] + uniforms.dilation[1] * WCol - uniforms.pad[1];
    let xCh = ${v} % inChannels;
    var resData = ${Ae(o,p)}(0.0);
    // The bounds checking is always needed since we use it to pad zero for
    // the 'same' padding type.
    if (xRow >= 0 && xRow < ${_} && xCol >= 0 && xCol < ${$}) {
      ${g}
      let xIndex = getIndexFromCoords4D(coord, vec4<i32>(uniforms.x_shape));
      ${f(o)}
    }
    return resData;`,C=e?t&&i?`
    let col = colIn * ${o};
    ${b}`:`
    let col = colIn * ${o};
    if (row < uniforms.dim_a_outer && col < uniforms.dim_inner) {
      ${b}
    }
    return ${Ae(o,p)}(0.0);`:i&&r?`
    let col = colIn * ${o};
    ${b}`:`
    let col = colIn * ${o};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${b}
    }
    return ${Ae(o,p)}(0.0);`,T=e?i&&r?h(u):`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${h(u)}
    }
    return ${Ae(u,p)}(0.0);`:`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_a_outer) {
      ${h(u)}
    }
    return ${Ae(u,p)}(0.0);`,S=Ae(d,p),z=Ae(e?o:u,p),E=Ae(e?u:o,p),R=Nt(s,S,p);return`
    fn mm_readA(batch: i32, row : i32, colIn : i32) -> ${z} {
      ${e?C:T}
    }

    fn mm_readB(batch: i32, row : i32, colIn : i32) -> ${E} {
      ${e?T:C}
    }

    fn mm_write(batch: i32, row : i32, colIn : i32, valueIn : ${S}) {
      let col = colIn * ${d};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer)
      {
      var value = valueIn;
      let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
      ${y}
      ${fc(a)}
      ${R}
      setOutputAtCoords(coords[0], coords[1], coords[2], coords[3], value);
      }
    }`},mc=(e,t,r,i,a,s,o,u,d)=>{let p=t.format==="NHWC",f=p?e[0].dims[3]:e[0].dims[1],h=r[0],g=p?r[2]:r[3],y=p?r[1]:r[2],_=p?r[3]:r[1],$=p&&(f%4===0||f%3===0)&&_%4===0,x=p?_:g*y,v=p?g*y:_,b=[8,8,1],C=i<=8?[4,1,1]:[4,4,1],T=[Math.ceil(x/b[0]/C[0]),Math.ceil(v/b[1]/C[1]),Math.ceil(h/b[2]/C[2])];ce("verbose",()=>`[conv2d_mm_webgpu] dispatch = ${T}`);let S=$?p&&f%4!==0?3:4:1,z=b[1]*C[1],E=b[0]*C[0],R=Math.max(b[0]*S,b[1]),L=i%z===0,F=a%E===0,K=s%R===0,X=$?[S,4,4]:[1,1,1],re=[{type:6,data:i},{type:6,data:a},{type:6,data:s},{type:6,data:[t.pads[0],t.pads[1]]},{type:6,data:t.strides},{type:6,data:t.dilations}];Dt(t,re),re.push(...J(e[0].dims,e[1].dims));let j=["rank","rank"];o&&(re.push(...J(e[2].dims)),j.push("rank")),re.push(...J(r));let se=H=>{let G=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"},{name:"pad",type:"i32",length:2},{name:"stride",type:"i32",length:2},{name:"dilation",type:"i32",length:2}];Pt(t,G);let ne=$?4:1,V=Ee(e[0].dataType),ge=`
      fn setOutputAtIndex(flatIndex : i32, value : ${$?`vec4<${V}>`:V}) {
        result[flatIndex] = ${$?`vec4<${V}>`:V}(value);
      }
      fn setOutputAtCoords(d0 : i32, d1 : i32, d2 : i32, d3 : i32, value : ${$?`vec4<${V}>`:V}) {
        let flatIndex = getOutputIndexFromCoords(vec4<i32>(d0, d1, d2, d3));
        setOutputAtIndex(flatIndex ${$?"/ 4":""}, value);
      }`,P=M("x",e[0].dataType,e[0].dims.length,S===3?1:S),q=M("w",e[1].dataType,e[1].dims.length,ne),ee=[P,q],pe=Y("result",e[0].dataType,r.length,ne);if(o){let N=M("bias",e[2].dataType,e[2].dims.length,ne);ee.push(N),ge+=`
        fn getBiasByOutputCoords(coords : vec4<i32>) -> ${$?`vec4<${V}>`:V} {
          return bias[coords.${p?"w":"y"}${$?"/ 4":""}];
        }`}return`
        ${hc("uniforms.result_strides")}
        //struct Uniforms { xShape : vec4<i32>, wShape : vec4<i32>, outShape : vec4<i32>,
        //  outShapeStrides: vec3<i32>, filterDims : vec2<i32>, pad : vec2<i32>, stride : vec2<i32>,
        //  dilation : vec2<i32>, dimAOuter : i32, dimBOuter : i32, dimInner : i32 };
        ${H.registerUniforms(G).declareVariables(...ee,pe)}
        ${ge}
        ${tu(p,L,F,K,o,t,X[0],X[1],X[2],V)}
        ${$?Ra(C,b,V,void 0,!p,R):Ba(C,b,V,void 0,!p,R,!1,void 0,u)}`};return{name:"Conv2DMatMul",shaderCache:{hint:`${t.cacheKey};${S};${$};${L};${F};${K};${z};${E};${R}`,inputDependencies:j},getRunData:()=>({outputs:[{dims:d?d(r):r,dataType:e[0].dataType}],dispatchGroup:{x:T[0],y:T[1],z:T[2]},programUniforms:re}),getShaderSource:se}}}),iu,Yr,si,ru,Xr,au,gc,yc,Jm=U(()=>{ie(),dt(),oe(),ue(),Ut(),nn(),iu=e=>{let t=1;for(let r=0;r<e.length;r++)t*=e[r];return t},Yr=e=>typeof e=="number"?[e,e,e]:e,si=(e,t)=>t<=1?e:e+(e-1)*(t-1),ru=(e,t,r,i=1)=>{let a=si(t,i);return Math.floor((e[0]*(r-1)-r+a)/2)},Xr=(e,t,r,i,a)=>{a==null&&(a=ru(e,t[0],i[0]));let s=[0,0,0,r];for(let o=0;o<3;o++)e[o]+2*a>=t[o]&&(s[o]=Math.trunc((e[o]-t[o]+2*a)/i[o]+1));return s},au=(e,t,r,i,a,s,o,u,d,p)=>{let f,h,g,y;if(e==="VALID"&&(e=0),typeof e=="number"){f={top:e,bottom:e,left:e,right:e,front:e,back:e};let _=Xr([t,r,i,1],[u,d,p],1,[a,s,o],e);h=_[0],g=_[1],y=_[2]}else if(Array.isArray(e)){if(!e.every(($,x,v)=>$===v[0]))throw Error(`Unsupported padding parameter: ${e}`);f={top:e[0],bottom:e[1],left:e[2],right:e[3],front:e[4],back:e[5]};let _=Xr([t,r,i,1],[u,d,p],1,[a,s,o],e[0]);h=_[0],g=_[1],y=_[2]}else if(e==="SAME_UPPER"){h=Math.ceil(t/a),g=Math.ceil(r/s),y=Math.ceil(i/o);let _=(h-1)*a+u-t,$=(g-1)*s+d-r,x=(y-1)*o+p-i,v=Math.floor(_/2),b=_-v,C=Math.floor($/2),T=$-C,S=Math.floor(x/2),z=x-S;f={top:C,bottom:T,left:S,right:z,front:v,back:b}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:f,outDepth:h,outHeight:g,outWidth:y}},gc=(e,t,r,i,a,s=!1,o="channelsLast")=>{let u,d,p,f,h;if(o==="channelsLast")[u,d,p,f,h]=e;else if(o==="channelsFirst")[u,h,d,p,f]=e;else throw new Error(`Unknown dataFormat ${o}`);let[g,,y,_,$]=t,[x,v,b]=Yr(r),[C,T,S]=Yr(i),z=si(y,C),E=si(_,T),R=si($,S),{padInfo:L,outDepth:F,outHeight:K,outWidth:X}=au(a,d,p,f,x,v,b,z,E,R),re=s?g*h:g,j=[0,0,0,0,0];return o==="channelsFirst"?j=[u,re,F,K,X]:o==="channelsLast"&&(j=[u,F,K,X,re]),{batchSize:u,dataFormat:o,inDepth:d,inHeight:p,inWidth:f,inChannels:h,outDepth:F,outHeight:K,outWidth:X,outChannels:re,padInfo:L,strideDepth:x,strideHeight:v,strideWidth:b,filterDepth:y,filterHeight:_,filterWidth:$,effectiveFilterDepth:z,effectiveFilterHeight:E,effectiveFilterWidth:R,dilationDepth:C,dilationHeight:T,dilationWidth:S,inShape:e,outShape:j,filterShape:t}},yc=(e,t,r,i,a,s)=>{let o=s==="channelsLast";o?e[0].dims[3]:e[0].dims[1];let u=[64,1,1],d={x:r.map((x,v)=>v)},p=[Math.ceil(iu(d.x.map(x=>r[x]))/u[0]),1,1];ce("verbose",()=>`[conv3d_naive_webgpu] dispatch = ${p}`);let f=1,h=A.size(r),g=[{type:12,data:h},{type:12,data:i},{type:12,data:a},{type:12,data:t.strides},{type:12,data:t.dilations}];Dt(t,g),g.push(...J(e[0].dims,e[1].dims));let y=["rank","rank"],_=e.length===3;_&&(g.push(...J(e[2].dims)),y.push("rank")),g.push(...J(r));let $=x=>{let v=[{name:"output_size",type:"u32"},{name:"filter_dims",type:"u32",length:i.length},{name:"pads",type:"u32",length:a.length},{name:"strides",type:"u32",length:t.strides.length},{name:"dilations",type:"u32",length:t.dilations.length}];Pt(t,v);let b=1,C=Ee(e[0].dataType),T=M("x",e[0].dataType,e[0].dims.length,f),S=M("W",e[1].dataType,e[1].dims.length,b),z=[T,S],E=Y("result",e[0].dataType,r.length,b),R="";if(_){let K=M("bias",e[2].dataType,e[2].dims.length,b);z.push(K),R+=`
        fn getBiasByOutputCoords(coords : array<u32, 5>) -> ${C} {
          return bias[${o?Q("coords",4,5):Q("coords",1,5)}];
        }`}let L=Ae(f,C),F=Nt(t,L,C);return`
            ${R}
            fn getX(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${T.getByIndices("aIndices")};
            }
            fn getW(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${S.getByIndices("aIndices")};
            }
          ${x.registerUniforms(v).declareVariables(...z,E)}
          ${x.mainStart()}
          ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
              let coords = ${E.offsetToIndices("global_idx")};
              let batch = ${Q("coords",0,T.rank)};
              let d2 = ${o?Q("coords",T.rank-1,T.rank):Q("coords",1,T.rank)};
              let xFRCCorner = vec3<u32>(${o?Q("coords",1,T.rank):Q("coords",2,T.rank)},
              ${o?Q("coords",2,T.rank):Q("coords",3,T.rank)},
              ${o?Q("coords",3,T.rank):Q("coords",4,T.rank)}) * uniforms.strides - uniforms.pads;
              let xFCorner = xFRCCorner.x;
              let xRCorner = xFRCCorner.y;
              let xCCorner = xFRCCorner.z;
              let xShapeY = ${o?Q("uniforms.x_shape",1,T.rank):Q("uniforms.x_shape",2,T.rank)};
              let xShapeZ = ${o?Q("uniforms.x_shape",2,T.rank):Q("uniforms.x_shape",3,T.rank)};
              let xShapeW = ${o?Q("uniforms.x_shape",3,T.rank):Q("uniforms.x_shape",4,T.rank)};
              let xShapeU = ${o?Q("uniforms.x_shape",4,T.rank):Q("uniforms.x_shape",1,T.rank)};
              let inputDepthNearestVec4 = (xShapeU / 4) * 4;
              let inputDepthVec4Remainder = xShapeU % 4;

              var value = 0.0;
              for (var wF = 0u; wF < uniforms.filter_dims[0]; wF++) {
                let xF = xFCorner + wF * uniforms.dilations[0];
                if (xF < 0 || xF >= xShapeY) {
                  continue;
                }

                for (var wR = 0u; wR < uniforms.filter_dims[1]; wR++) {
                  let xR = xRCorner + wR * uniforms.dilations[1];
                  if (xR < 0 || xR >= xShapeZ) {
                    continue;
                  }

                  for (var wC = 0u; wC < uniforms.filter_dims[2]; wC++) {
                    let xC = xCCorner + wC * uniforms.dilations[2];
                    if (xC < 0 || xC >= xShapeW) {
                      continue;
                    }

                    for (var d1 = 0u; d1 < inputDepthNearestVec4; d1 += 4) {
                      ${o?`let xValues = vec4<f32>(
                               getX(batch, xF, xR, xC, d1),
                               getX(batch, xF, xR, xC, d1 + 1),
                               getX(batch, xF, xR, xC, d1 + 2),
                               getX(batch, xF, xR, xC, d1 + 3));
                            `:`let xValues = vec4<f32>(
                               getX(batch, d1, xF, xR, xC),
                               getX(batch, d1 + 1, xF, xR, xC),
                               getX(batch, d1 + 2, xF, xR, xC),
                               getX(batch, d1 + 3, xF, xR, xC));
                            `}
                            let wValues = vec4<f32>(
                              getW(d2, d1, wF, wR, wC),
                              getW(d2, d1 + 1, wF, wR, wC),
                              getW(d2, d1 + 2, wF, wR, wC),
                              getW(d2, d1 + 3, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                    if (inputDepthVec4Remainder == 1) {
                        ${o?`value += getX(batch, xF, xR, xC, inputDepthNearestVec4)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`:`value += getX(batch, inputDepthNearestVec4, xF, xR, xC)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`}
                    } else if (inputDepthVec4Remainder == 2) {
                      ${o?`let xValues = vec2<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1));
                      `:`let xValues = vec2<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC));
                    `}
                    let wValues = vec2<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC));
                      value += dot(xValues, wValues);
                    } else if (inputDepthVec4Remainder == 3) {
                      ${o?`let xValues = vec3<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 2));
                      `:`let xValues = vec3<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 2, xF, xR, xC));
                    `}
                    let wValues = vec3<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 2, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                  }
                }
              }
              ${_?"value = value + getBiasByOutputCoords(coords)":""};
              ${F}
              result[global_idx] = f32(value);
          }`};return{name:"Conv3DNaive",shaderCache:{hint:`${t.cacheKey};${o};${f};${_}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:p[0],y:p[1],z:p[2]},programUniforms:g}),getShaderSource:$}}}),_c,wc,eg=U(()=>{ie(),oe(),ue(),Ut(),_c=(e,t,r,i)=>{let a=e.length>2,s=a?"value += b[output_channel];":"",o=e[0].dims,u=e[1].dims,d=t.format==="NHWC",p=d?r[3]:r[1],f=p/t.group,h=d&&f>=4?Te(p):1,g=A.size(r)/h,y=[{type:12,data:g},{type:12,data:t.dilations},{type:12,data:[t.strides[0],t.strides[1]]},{type:12,data:[t.pads[0],t.pads[1]]},{type:12,data:f}];Dt(t,y),y.push(...J(o,[u[0],u[1],u[2],u[3]/h]));let _=a?["rank","rank","rank"]:["rank","rank"];y.push(...J([r[0],r[1],r[2],r[3]/h]));let $=x=>{let v=Y("output",e[0].dataType,r.length,h),b=Ee(v.type.tensor),C=Nt(t,v.type.value,b),T=M("x",e[0].dataType,o.length),S=M("w",e[1].dataType,u.length,h),z=[T,S];a&&z.push(M("b",e[2].dataType,e[2].dims,h));let E=[{name:"output_size",type:"u32"},{name:"dilations",type:"u32",length:t.dilations.length},{name:"strides",type:"u32",length:2},{name:"pads",type:"u32",length:2},{name:"output_channels_per_group",type:"u32"}];Pt(t,E);let R=d?`
      for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[0]; wHeight++) {
        let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

        if (xHeight < 0u || xHeight >= uniforms.x_shape[1]) {
          continue;
        }

        for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[1]; wWidth++) {
          let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
          if (xWidth < 0u || xWidth >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[2]; wInChannel++) {
            let input_channel = in_channel_offset + wInChannel;
            let xVal = ${T.get("batch","xHeight","xWidth","input_channel")};
            let wVal = ${S.get("wHeight","wWidth","wInChannel","output_channel")};
            value += xVal * wVal;
          }
        }
      }
      `:`
      for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[1]; wInChannel++) {
        let input_channel = in_channel_offset + wInChannel;
        for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[2]; wHeight++) {
          let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

          if (xHeight < 0u || xHeight >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[3]; wWidth++) {
            let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
            if (xWidth < 0u || xWidth >= uniforms.x_shape[3]) {
              continue;
            }

            let xVal = ${T.get("batch","input_channel","xHeight","xWidth")};
            let wVal = ${S.get("output_channel","wInChannel","wHeight","wWidth")};
            value += xVal * wVal;
          }
        }
      }
      `;return`
  ${x.registerUniforms(E).declareVariables(...z,v)}

  ${x.mainStart()}
    ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let outputIndices = ${v.offsetToIndices("global_idx")};
    let batch: u32 = outputIndices[0];
    let output_channel: u32 = outputIndices[${d?3:1}];
    let xRCCorner: vec2<u32> = vec2<u32>(outputIndices[${d?1:2}], outputIndices[${d?2:3}]) * uniforms.strides - uniforms.pads;
    let group_id: u32 = output_channel * ${h} / uniforms.output_channels_per_group;
    var in_channel_offset = group_id * uniforms.w_shape[${d?2:1}];

    var value: ${v.type.value} = ${v.type.value}(0);
    ${R}
    ${s}
    ${C}
    ${v.setByOffset("global_idx","value")}
  }`};return{name:"GroupedConv",shaderCache:{hint:`${t.cacheKey}_${h}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:y}),getShaderSource:$}},wc=(e,t,r,i)=>{let a=e.length>2,s=Te(r[3]),o=Te(r[2]),u=A.size(r)/s/o,d=[e[0].dims[0],e[0].dims[1],e[0].dims[2],e[0].dims[3]/s],p=[e[1].dims[0],e[1].dims[1],e[1].dims[2],e[1].dims[3]/s],f=[r[0],r[1],r[2],r[3]/s],h=[{type:12,data:u},{type:6,data:[t.strides[0],t.strides[1]]},{type:6,data:[t.pads[0],t.pads[1]]}];Dt(t,h),h.push(...J(d,p,f));let g=(o-1)*t.strides[1]+p[1],y=_=>{let $=Y("output",e[0].dataType,f.length,s),x=Ee($.type.tensor),v=Nt(t,$.type.value,x),b=M("x",e[0].dataType,d.length,s),C=M("w",e[1].dataType,p.length,s),T=[b,C];a&&T.push(M("b",e[2].dataType,e[2].dims,s));let S=a?"value += b[output_channel];":"",z=[{name:"output_size",type:"u32"},{name:"strides",type:"i32",length:2},{name:"pads",type:"i32",length:2}];return Pt(t,z),`
  ${_.registerUniforms(z).declareVariables(...T,$)}
  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let width0 = uniforms.output_shape[3];
    let output_channel = global_idx % width0;
    var index1 = global_idx / width0;
    let width1 = uniforms.output_shape[2] / ${o}u;
    let col = (index1 % width1) * ${o}u;
    index1 = index1 / width1;
    let row = index1 % uniforms.output_shape[1];
    let batch = index1 / uniforms.output_shape[1];

    let x_corner = vec2<i32>(i32(row), i32(col)) * uniforms.strides - uniforms.pads;

    var x_vals: array<${b.type.value}, ${g}>;
    var values: array<${$.type.value}, ${o}>;
    let input_channel = output_channel;
    // Use constant instead of uniform can give better performance for w's height/width.
    for (var w_height: u32 = 0u; w_height < ${p[0]}; w_height++) {
      let x_height = x_corner.x + i32(w_height);
      if (x_height >= 0 && u32(x_height) < uniforms.x_shape[1]) {
        for (var i = 0; i < ${g}; i++) {
          let x_width = x_corner.y + i;
          if (x_width >= 0 && u32(x_width) < uniforms.x_shape[2]) {
            x_vals[i] = ${b.get("batch","u32(x_height)","u32(x_width)","input_channel")};
          } else {
            x_vals[i] = ${b.type.value}(0);
          }
        }
        for (var w_width: u32 = 0u; w_width < ${p[1]}; w_width++) {
          let w_val = ${C.get("w_height","w_width","0","output_channel")};
          for (var i = 0u; i < ${o}u; i++) {
            values[i] = fma(x_vals[i * u32(uniforms.strides[1]) + w_width], w_val, values[i]);
          }
        }
      }
    }

    for (var i = 0u; i < ${o}u; i++) {
      var value = values[i];
      ${S}
      ${v}
      ${$.set("batch","row","col + i","output_channel","value")};
    }
  }`};return{name:"GroupedConv-Vectorize",shaderCache:{hint:`${t.cacheKey};${s};${o};${g};${p[0]};${p[1]}`,inputDependencies:a?["rank","rank","type"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:h}),getShaderSource:y}}}),nu,Di,su,Pi,Ma,Qr,ou,uu,Na,tg=U(()=>{oe(),Qm(),Jm(),un(),eg(),Ut(),on(),$t(),nu=(e,t,r,i,a,s)=>{let o=e[0],u=e.slice(s?1:2,s?3:4),d=u.length,p=t[0],f=t.slice(2).map((g,y)=>g+(g-1)*(r[y]-1)),h=u.map((g,y)=>g+i[y]+i[y+d]).map((g,y)=>Math.floor((g-f[y]+a[y])/a[y]));return h.splice(0,0,o),h.splice(s?3:1,0,p),h},Di=[2,3,1,0],su=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length>5)throw new Error("greater than 5D is not supported");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[1]*t.group;if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");if(e.length===3&&(e[2].dims.length!==1||e[1].dims[0]!==e[2].dims[0]))throw new Error("invalid bias");let a=e[0].dims.length-2;if(t.dilations.length!==a)throw new Error(`dilations should be ${a}D`);if(t.strides.length!==a)throw new Error(`strides should be ${a}D`);if(t.pads.length!==a*2)throw new Error(`pads should be ${a*2}D`);if(t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape")},Pi=(e,t)=>{let r=e.kernelShape.slice();r.length<t[1].dims.length-2&&r.push(...Array(t[1].dims.length-2-r.length).fill(0));for(let s=2;s<t[1].dims.length;++s)r[s-2]===0&&(r[s-2]=t[1].dims[s]);let i=e.pads.slice();Zi.adjustPadsBasedOnAutoPad(t[0].dims,e.strides,e.dilations,r,i,e.format==="NHWC",e.autoPad);let a=Object.assign({},e);return Object.assign(a,{kernelShape:r,pads:i}),a},Ma=e=>{let t=an(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],a=e.dilations,s=e.group,o=e.kernel_shape,u=e.pads,d=e.strides,p=e.w_is_const();return{autoPad:i,format:r,dilations:a,group:s,kernelShape:o,pads:u,strides:d,wIsConst:p,...t,cacheKey:`${e.format};${t.activation};`}},Qr=(e,t,r,i)=>{let a=r.format==="NHWC",s=nu(t[0].dims,t[1].dims,r.dilations,r.pads,r.strides,a);if(r.group!==1){let z=[t[0]];if(a){let E=e.kernelCustomData.wT??e.compute(We(t[1],Di),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=E),z.push(E)}else z.push(t[1]);t.length===3&&z.push(t[2]),!e.adapterInfo.isArchitecture("ampere")&&a&&t[1].dims[0]===r.group&&t[1].dims[1]===1&&r.dilations[0]===1&&r.dilations[1]===1?e.compute(wc(z,r,s,i),{inputs:z}):e.compute(_c(z,r,s,i),{inputs:z});return}let o=t.length===3,u=t[0].dims[a?1:2],d=t[0].dims[a?2:3],p=t[0].dims[a?3:1],f=t[1].dims[2],h=t[1].dims[3],g=s[a?1:2],y=s[a?2:3],_=s[a?3:1],$=a&&f===u&&h===d&&r.pads[0]===0&&r.pads[1]===0;if($||f===1&&h===1&&r.dilations[0]===1&&r.dilations[1]===1&&r.strides[0]===1&&r.strides[1]===1&&r.pads[0]===0&&r.pads[1]===0){let z=s[0],E,R,L,F=[];if(a){let re=e.kernelCustomData.wT??e.compute(We(t[1],Di),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];if(r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=re),$){let j=u*d*p;E=t[0].reshape([1,z,j]),R=re.reshape([1,j,_]),L=[1,z,_]}else E=t[0].reshape([z,u*d,p]),R=re.reshape([1,p,_]),L=[z,g*y,_];F.push(E),F.push(R)}else E=t[0].reshape([z,p,u*d]),R=t[1].reshape([1,_,p]),L=[z,_,g*y],F.push(R),F.push(E);o&&F.push(t[2]);let K=L[2],X=F[0].dims[F[0].dims.length-1];K<8&&X<8?e.compute(sn(F,r,s,L,a,i),{inputs:F}):e.compute(Xi(F,r,s,L,a,i),{inputs:F});return}let x=!0,v=e.kernelCustomData.wT??e.compute(We(t[1],Di),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=v);let b=[t[0],v];o&&b.push(t[2]);let C=a?g*y:_,T=a?_:g*y,S=f*h*p;e.compute(mc(b,r,s,C,T,S,o,x,i),{inputs:b})},ou=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=[0,t.pads[0],0,t.pads[1]],s=[1].concat(t.strides),o=[1].concat(t.dilations),u=[1].concat(t.kernelShape),d=Pi({...t,pads:a,strides:s,dilations:o,kernelShape:u},i);Qr(e,i,d,p=>r?[p[0],p[2],p[3]]:[p[0],p[1],p[3]])},uu=(e,t,r)=>{let i=r.format==="NHWC"?"channelsLast":"channelsFirst",a=Pi(r,t),s=r.autoPad==="NOTSET"?r.pads:r.autoPad,o=gc(t[0].dims,t[1].dims,r.strides,r.dilations,s,!1,i);e.compute(yc(t,a,o.outShape,[o.filterDepth,o.filterHeight,o.filterWidth],[o.padInfo.front,o.padInfo.top,o.padInfo.left],i))},Na=(e,t)=>{if(su(e.inputs,t),e.inputs[0].dims.length===3)ou(e,t);else if(e.inputs[0].dims.length===5)uu(e,e.inputs,t);else{let r=Pi(t,e.inputs);Qr(e,e.inputs,r)}}}),bc,ig=U(()=>{ie(),dt(),oe(),ue(),bc=(e,t,r)=>{let i=e.length>2,a=t.outputShape,s=t.format==="NHWC",o=t.group,u=e[1].dims,d=u[2]/o,p=u[3],f=s?Te(d):1,h=s&&p===1&&d>=4,g=h?Math.floor(d/4)*4:Math.floor(d/f)*f,y=d-g,_=s?Te(p):1,$=s?p===1?f:_:1,x=A.size(a)/_,v=[Math.ceil(x/64),1,1];ce("verbose",()=>`[conv2d_backprop_webgpu] dispatch = ${v}`);let b=["rank","rank"],C=[t.strides[0],t.strides[1]],T=[t.kernelShape[s?1:2],t.kernelShape[s?2:3]],S=[t.dilations[0],t.dilations[1]],z=[T[0]+(t.dilations[0]<=1?0:(t.kernelShape[s?1:2]-1)*(t.dilations[0]-1)),T[1]+(t.dilations[1]<=1?0:(t.kernelShape[s?2:3]-1)*(t.dilations[1]-1))],E=[z[0]-1-Math.floor((t.pads[0]+t.pads[2])/2),z[1]-1-Math.floor((t.pads[1]+t.pads[3])/2)],R=[{type:12,data:x},{type:12,data:C},{type:12,data:T},{type:12,data:S},{type:12,data:z},{type:6,data:E},{type:12,data:g},{type:12,data:d},{type:12,data:p},...J(e[0].dims,e[1].dims)];i&&(R.push(...J(e[2].dims)),b.push("rank")),R.push(...J(a));let L=F=>{let K=[{name:"output_size",type:"u32"},{name:"strides",type:"u32",length:C.length},{name:"filter_dims",type:"u32",length:T.length},{name:"dilations",type:"u32",length:T.length},{name:"effective_filter_dims",type:"u32",length:z.length},{name:"pads",type:"i32",length:E.length},{name:"input_channels_per_group_int",type:"u32"},{name:"input_channels_per_group",type:"u32"},{name:"output_channels_per_group",type:"u32"}],X=Ee(e[0].dataType),re=s?1:2,j=s?2:3,se=s?3:1,H=M("W",e[1].dataType,e[1].dims.length,$),G=M("Dy",e[0].dataType,e[0].dims.length,f),ne=[G,H];i&&ne.push(M("bias",e[2].dataType,[a[se]].length,_));let V=Y("result",e[0].dataType,a.length,_),ge=()=>{let ee="";if(h)f===4?ee+=`
        let xValue = ${G.getByOffset("x_offset")};
        let wValue = ${H.getByOffset("w_offset")};
        dotProd = dotProd + dot(xValue, wValue);
        x_offset += 1u;
        w_offset += 1u;`:f===2?ee+=`
          dotProd = dotProd + dot(vec4<${X}>(${G.getByOffset("x_offset")}, ${G.getByOffset("x_offset + 1u")}), vec4<${X}>(${H.getByOffset("w_offset")}, ${H.getByOffset("w_offset + 1u")}));
          x_offset += 2u;
          w_offset += 2u;`:f===1&&(ee+=`
          dotProd = dotProd + dot(vec4<${X}>(${G.getByOffset("x_offset")}, ${G.getByOffset("x_offset + 1u")}, ${G.getByOffset("x_offset + 2u")}, ${G.getByOffset("x_offset + 3u")}), vec4<${X}>(${H.getByOffset("w_offset")}, ${H.getByOffset("w_offset + 1u")}, ${H.getByOffset("w_offset + 2u")}, ${H.getByOffset("w_offset + 3u")}));
          x_offset += 4u;
          w_offset += 4u;`);else if(ee+=`
                  let xValue = ${s?G.getByOffset(`${G.indicesToOffset(`${G.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${f}`):G.get("batch","inputChannel","idyR","idyC")};
        `,f===1)ee+=`
          let w_offset = ${H.indicesToOffset(`${H.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)};
          let wValue = ${H.getByOffset(`w_offset / ${$}`)};
          dotProd = dotProd + xValue * wValue;`;else for(let pe=0;pe<f;pe++)ee+=`
            let wValue${pe} = ${H.getByOffset(`${H.indicesToOffset(`${H.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel + ${pe}, wOutChannel)`)} / ${$}`)};
            dotProd = dotProd + xValue[${pe}] * wValue${pe};`;return ee},P=()=>{if(y===0)return"";if(!h)throw new Error(`packInputAs4 ${h} is not true.`);let ee="";if(f===1){ee+="dotProd = dotProd";for(let pe=0;pe<y;pe++)ee+=`
            + ${G.getByOffset(`x_offset + ${pe}`)} * ${H.getByOffset(`w_offset + ${pe}`)}`;ee+=";"}else if(f===2){if(y!==2)throw new Error(`Invalid inputChannelsRemainder ${y}.`);ee+=`
          let xValue = ${G.getByOffset("x_offset")};
          let wValue = ${H.getByOffset("w_offset")};
          dotProd = dotProd + dot(xValue, wValue);`}return ee},q=`
            let outputIndices = ${V.offsetToIndices(`global_idx * ${_}`)};
            let batch = ${V.indicesGet("outputIndices",0)};
            let d1 = ${V.indicesGet("outputIndices",se)};
            let r = ${V.indicesGet("outputIndices",re)};
            let c = ${V.indicesGet("outputIndices",j)};
            let dyCorner = vec2<i32>(i32(r), i32(c)) - uniforms.pads;
            let dyRCorner = dyCorner.x;
            let dyCCorner = dyCorner.y;
            let groupId = d1 / uniforms.output_channels_per_group;
            let wOutChannel = d1 - groupId * uniforms.output_channels_per_group;
            // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
            // ? = to be determined. : = across all values in that axis.
            var dotProd = ${V.type.value}(0.0);
            var wR: u32 = 0;
            if (uniforms.dilations.x == 1) {
              // Minimum wR >= 0 that satisfies (dyRCorner + wR) % (uniforms.strides.x) == 0
              wR = u32(((dyRCorner + i32(uniforms.strides.x) - 1) / i32(uniforms.strides.x)) * i32(uniforms.strides.x) - dyRCorner);
            }
            for (; wR < uniforms.effective_filter_dims.x; wR = wR + 1) {
              if (wR % uniforms.dilations.x != 0) {
                continue;
              }
              let dyR = (${X}(dyRCorner) + ${X}(wR)) / ${X}(uniforms.strides[0]);
              let wRPerm = uniforms.filter_dims.x - 1 - wR / uniforms.dilations.x;
              if (dyR < 0.0 || dyR >= ${X}(uniforms.Dy_shape[${re}]) || fract(dyR) > 0.0 ||
                  wRPerm < 0) {
                continue;
              }
              let idyR: u32 = u32(dyR);
              var wC: u32 = 0;
              if (uniforms.dilations.y == 1) {
                // Minimum wC >= 0 that satisfies (dyCCorner + wC) % (uniforms.strides.y) == 0
                wC = u32(((dyCCorner + i32(uniforms.strides.y) - 1) / i32(uniforms.strides.y)) * i32(uniforms.strides.y) - dyCCorner);
              }
              for (; wC < uniforms.effective_filter_dims.y; wC = wC + 1) {
                if (wC % uniforms.dilations.y != 0) {
                  continue;
                }
                let dyC = (${X}(dyCCorner) + ${X}(wC)) / ${X}(uniforms.strides.y);
                let wCPerm = uniforms.filter_dims.y - 1 - wC / uniforms.dilations.y;
                if (dyC < 0.0 || dyC >= ${X}(uniforms.Dy_shape[${j}]) ||
                    fract(dyC) > 0.0 || wCPerm < 0) {
                  continue;
                }
                let idyC: u32 = u32(dyC);
                var inputChannel = groupId * uniforms.input_channels_per_group;
                ${h?`
                var x_offset = ${G.indicesToOffset(`${G.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${f};
                var w_offset = ${H.indicesToOffset(`${H.type.indices}(wRPerm, wCPerm, inputChannel, wOutChannel)`)} / ${$};
                  `:""}
                for (var d2: u32 = 0; d2 < uniforms.input_channels_per_group_int; d2 = d2 + ${h?4:f}) {
                  ${ge()}
                  inputChannel = inputChannel + ${h?4:f};
                }
                ${P()}
                wC = wC + uniforms.strides.y - 1;
              }
              wR = wR + uniforms.strides[0] - 1;
            }
            let value = dotProd${i?` + bias[d1 / ${_}]`:""};
            ${V.setByOffset("global_idx","value")};
          `;return`
    ${F.registerUniforms(K).declareVariables(...ne,V)}
      ${F.mainStart()}
      ${F.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")};
    ${q}}`};return{name:"ConvTranspose2D",shaderCache:{hint:`${t.cacheKey};${f}${$}${_}${h}${y}`,inputDependencies:b},getRunData:()=>({dispatchGroup:{x:v[0],y:v[1],z:v[2]},outputs:[{dims:r?r(a):a,dataType:e[0].dataType}],programUniforms:R}),getShaderSource:L}}}),lu,du,pu,Jr,$c,cu,ea,fu,vc,rg=U(()=>{ig(),Ut(),$t(),lu=(e,t,r,i,a,s)=>(e-1)*t+r+(i-1)*a+1-s,du=(e,t,r,i,a)=>{let s=Math.floor(e/2);t==="SAME_UPPER"?(r[i]=s,r[a]=e-s):t==="SAME_LOWER"&&(r[i]=e-s,r[a]=s)},pu=(e,t,r,i,a,s,o,u,d,p)=>{let f=e.length-2,h=p.length===0;d.length<f&&d.push(...Array(f-d.length).fill(0));let g=e[0],y=t[u?3:1]*a;for(let _=0,$=e.length-f-(u?1:0);_<f;++_,++$){let x=e[$],v=h?x*o[_]:p[_],b=lu(x,o[_],s[_],t[$],r[_],v);du(b,i,s,_,_+f),h&&p.push(o[_]*(x-1)+d[_]+(t[$]-1)*r[_]+1-s[_]-s[_+f])}p.splice(0,0,g),p.splice(u?3:1,0,y)},Jr=(e,t)=>{let r=e.kernelShape.slice();if(e.kernelShape.length===0||e.kernelShape.reduce((h,g)=>h*g,1)===0){r.length=0;for(let h=2;h<t[1].dims.length;++h)r.push(t[1].dims[h])}let i=e.format==="NHWC";r.splice(0,0,t[1].dims[0]),r.splice(i?3:1,0,t[1].dims[1]);let a=e.pads.slice(),s=e.outputShape.slice(),o=e.outputPadding.slice(),u=t[0].dims,d=e.dilations.slice();if(d.reduce((h,g)=>h+g,0)===0){let h=t[0].dims.length-2;d=new Array(h).fill(1)}let p=e.strides.slice();if(p.reduce((h,g)=>h+g,0)===0){let h=t[0].dims.length-2;p=new Array(h).fill(1)}pu(u,r,d,e.autoPad,e.group,a,p,i,o,s);let f=Object.assign({},e);return Object.assign(f,{kernelShape:r,pads:a,outputPadding:o,outputShape:s,dilations:d,strides:p}),f},$c=e=>{let t=an(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][typeof e.autoPad>"u"?0:e.autoPad],a=e.dilations,s=e.group,o=e.kernelShape,u=e.pads,d=e.strides,p=e.wIsConst(),f=e.outputPadding,h=e.outputShape;return{autoPad:i,format:r,dilations:a,group:s,kernelShape:o,outputPadding:f,outputShape:h,pads:u,strides:d,wIsConst:p,...t,cacheKey:`${e.format};${t.activation};`}},cu=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length!==4&&e[0].dims.length!==3)throw new Error("currently only support 2-dimensional conv");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[0];if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");let a=e[1].dims[1]*t.group;if(e.length===3&&(e[2].dims.length!==1||e[2].dims[0]!==a))throw new Error("invalid bias");let s=e[0].dims.length-2;if(t.dilations.reduce((o,u)=>o+u,0)>0&&t.dilations.length!==s)throw new Error(`dilations should be ${s}D`);if(t.strides.reduce((o,u)=>o+u,0)>0&&t.strides.length!==s)throw new Error(`strides should be ${s}D`);if(t.pads.reduce((o,u)=>o+u,0)>0&&t.pads.length!==s*2)throw new Error(`pads should be ${s*2}D`);if(t.outputPadding.length!==s&&t.outputPadding.length!==0)throw new Error(`output_padding should be ${s}D`);if(t.kernelShape.reduce((o,u)=>o+u,0)>0&&t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape");if(t.outputShape.length!==0&&t.outputShape.length!==e[0].dims.length-2)throw new Error("invalid output shape")},ea=(e,t,r,i)=>{let a=e.kernelCustomData.wT??e.compute(We(t[1],[2,3,0,1]),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=a);let s=[t[0],a];t.length===3&&s.push(t[2]),e.compute(bc(s,r,i),{inputs:s})},fu=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=t.kernelShape;(a.length===0||a[0]===0)&&(a=[e.inputs[1].dims[2]]);let s=t.dilations;(s.length===0||s[0]===0)&&(s=[1]);let o=t.strides;(o.length===0||o[0]===0)&&(o=[1]);let u=t.pads;u.length===0&&(u=[0,0]),u=[0,u[0],0,u[1]],o=[1].concat(o),s=[1].concat(s),a=[1].concat(a);let d=t.outputPadding;d=[0].concat(d);let p=Jr({...t,pads:u,strides:o,dilations:s,kernelShape:a,outputPadding:d},i);ea(e,i,p,f=>r?[f[0],f[2],f[3]]:[f[0],f[1],f[3]])},vc=(e,t)=>{if(cu(e.inputs,t),e.inputs[0].dims.length===3)fu(e,t);else{let r=Jr(t,e.inputs);ea(e,e.inputs,r)}}}),hu,xc,Tc,ag=U(()=>{ie(),oe(),ke(),ue(),hu=(e,t,r,i)=>{let a=A.size(t),s=t.length,o=M("input",e,s),u=Y("output",e,s),d=r.dataType===6?r.getInt32Array()[0]:Number(r.getBigInt64Array()[0]),p=A.normalizeAxis(d,s),f=h=>{let g=` i32(${o.indicesGet("inputIndices","uniforms.axis")}) `,y=Q("uniforms.input_shape","uniforms.axis",s),_=i.reverse?g+(i.exclusive?" + 1":""):"0",$=i.reverse?y:g+(i.exclusive?"":" + 1");return`
                ${h.registerUniform("outputSize","u32").registerUniform("axis","u32").declareVariables(o,u)}
                ${h.mainStart()}
                  ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
                  var inputIndices = ${u.offsetToIndices("global_idx")};
                  var sum = ${u.type.value}(0);
                  let first : i32 = ${_};
                  let last : i32 = ${$};
                  for (var i : i32 = first; i < last; i++) {
                    ${o.indicesSet("inputIndices","uniforms.axis","u32(i)")};
                    sum = sum + ${o.getByIndices("inputIndices")};
                  }
                  ${u.setByOffset("global_idx","sum")};
                }`};return{name:"CumSum",shaderCache:{hint:i.cacheKey,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:t,dataType:e}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:[{type:12,data:a},{type:12,data:p},...J(t,t)]}),getShaderSource:f}},xc=(e,t)=>{let r=e.inputs[0].dims,i=e.inputs[0].dataType,a=e.inputs[1];e.compute(hu(i,r,a,t),{inputs:[0]})},Tc=e=>{let t=e.exclusive===1,r=e.reverse===1;return me({exclusive:t,reverse:r})}}),mu,gu,yu,kc,Cc,ng=U(()=>{ie(),oe(),ke(),ue(),mu=e=>{if(!e||e.length!==1)throw new Error("DepthToSpace requires 1 input.");if(e[0].dims.length!==4)throw new Error("DepthToSpace requires 4D input.")},gu=(e,t,r,i)=>{let a=[];a.push(`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`);for(let s=0;s<t;++s)a.push(r.indicesSet("a",e[s],`i[${s}]`));return a.push("return a;}"),a.join(`
`)},yu=(e,t)=>{let r,i,a,s,o,u,d=t.format==="NHWC",p=t.blocksize,f=t.mode==="DCR";d?([r,i,a,s]=e.dims,o=f?[r,i,a,p,p,s/p**2]:[r,i,a,s/p**2,p,p],u=f?[0,1,3,2,4,5]:[0,1,4,2,5,3]):([r,i,a,s]=[e.dims[0],e.dims[2],e.dims[3],e.dims[1]],o=f?[r,p,p,s/p**2,i,a]:[r,s/p**2,p,p,i,a],u=f?[0,3,4,1,5,2]:[0,1,4,2,5,3]);let h=e.reshape(o),g=h.dims.length,y=e.dataType,_=M("a",y,g),$=Y("output",y,g),x=v=>`
  ${v.registerUniform("output_size","u32").declareVariables(_,$)}

  ${gu(u,g,_,$)}

  ${v.mainStart()}
    ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${$.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${$.setByOffset("global_idx",_.getByIndices("aIndices"))}
  }`;return{name:"DepthToSpace",shaderCache:{hint:`${e.dims};${t.blocksize};${t.mode}`,inputDependencies:["rank"]},getRunData:v=>{let b=d?[r,i*p,a*p,s/p**2]:[r,s/p**2,i*p,a*p],C=A.size(b),T=h.dims,S=A.sortBasedOnPerm(T,u);return{outputs:[{dims:b,dataType:v[0].dataType}],dispatchGroup:{x:Math.ceil(C/64)},programUniforms:[{type:12,data:C},...J(T,S)]}},getShaderSource:x}},kc=(e,t)=>{mu(e.inputs),e.compute(yu(e.inputs[0],t))},Cc=e=>me({blocksize:e.blocksize,mode:e.mode,format:e.format})}),Li,oi,ta,_u,wu,bu,$u,ia,vu,Sc,Ic,sg=U(()=>{ie(),oe(),ke(),ue(),Li="[a-zA-Z]|\\.\\.\\.",oi="("+Li+")+",ta="^"+oi+"$",_u="("+oi+",)*"+oi,wu="^"+_u+"$",bu=class{constructor(e=-1){this.symbolToIndices=new Map,this.inputIndex=e}addSymbol(e,t){let r=this.symbolToIndices.get(e);r===void 0?r=[t]:r.push(t),this.symbolToIndices.set(e,r)}},$u=class{constructor(e,t){this.equation=t,this.hasEllipsis=!1,this.symbolToInfo=new Map,this.lhs=new Array,this.outputDims=[];let[r,i]=t.includes("->")?t.split("->",2):[t,""];if(!r.match(RegExp(wu)))throw new Error("Invalid LHS term");if(r.split(",").forEach((a,s)=>{let o=e[s].dims.slice();if(!a.match(RegExp(ta)))throw new Error("Invalid LHS term");let u=this.processTerm(a,!0,o,s);this.lhs.push(u)}),i==="")i+=[...this.symbolToInfo.entries()].filter(([a,s])=>s.count===1||a==="...").map(([a])=>a).join("");else if(!i.match(RegExp(oi)))throw new Error("Invalid RHS");i.match(RegExp(Li,"g"))?.forEach(a=>{if(a==="...")this.outputDims=this.outputDims.concat(this.ellipsisDims);else{let s=this.symbolToInfo.get(a);if(s===void 0)throw new Error("Invalid RHS symbol");this.outputDims.push(s.dimValue)}}),this.rhs=this.processTerm(i,!1,this.outputDims)}addSymbol(e,t,r){let i=this.symbolToInfo.get(e);if(i!==void 0){if(i.dimValue!==t&&i.count!==1)throw new Error("Dimension mismatch");i.count++,i.inputIndices.push(r)}else i={count:1,dimValue:t,inputIndices:[r]};this.symbolToInfo.set(e,i)}processTerm(e,t,r,i=-1){let a=r.length,s=!1,o=[],u=0;if(!e.match(RegExp(ta))&&!t&&e!=="")throw new Error("Invalid LHS term");let d=e.match(RegExp(Li,"g")),p=new bu(i);return d?.forEach((f,h)=>{if(f==="..."){if(s)throw new Error("Only one ellipsis is allowed per input term");s=!0;let g=a-d.length+1;if(g<0)throw new Error("Ellipsis out of bounds");if(o=r.slice(u,u+g),this.hasEllipsis){if(this.ellipsisDims.length!==o.length||this.ellipsisDims.toString()!==o.toString())throw new Error("Ellipsis dimensions mismatch")}else if(t)this.hasEllipsis=!0,this.ellipsisDims=o;else throw new Error("Ellipsis must be specified in the LHS");for(let y=0;y<o.length;y++){let _=String.fromCharCode(48+y);p.addSymbol(_,h+y),this.addSymbol(_,r[u++],i)}}else p.addSymbol(f,h+(this.hasEllipsis?this.ellipsisDims.length-1:0)),this.addSymbol(f,r[u++],i)}),p}},ia=e=>e+"_max",vu=(e,t,r,i)=>{let a=e.map(p=>p.length).map((p,f)=>M(`input${f}`,t,p)),s=A.size(i),o=Y("output",t,i.length),u=[...r.symbolToInfo.keys()].filter(p=>!r.rhs.symbolToIndices.has(p)),d=p=>{let f=[],h="var prod = 1.0;",g="var sum = 0.0;",y="sum += prod;",_=[],$=[],x=[],v=[],b=r.symbolToInfo.size===r.rhs.symbolToIndices.size;r.symbolToInfo.forEach((T,S)=>{if(r.rhs.symbolToIndices.has(S)){let z=r.rhs.symbolToIndices.get(S)?.[0];z!==void 0&&r.lhs.forEach((E,R)=>{if(T.inputIndices.includes(R)){let L=E.symbolToIndices.get(S);if(L===void 0)throw new Error("Invalid symbol error");L.forEach(F=>{f.push(`${a[R].indicesSet(`input${R}Indices`,F,o.indicesGet("outputIndices",z))}`)})}})}else r.lhs.forEach((z,E)=>{if(T.inputIndices.includes(E)){let R=z.symbolToIndices.get(S);if(R===void 0)throw new Error("Invalid symbol error");R.forEach(L=>{_.push(`${a[E].indicesSet(`input${E}Indices`,L,`${S}`)}`)}),v.push(`prod *= ${a[E].getByIndices(`input${E}Indices`)};`)}}),$.push(`for(var ${S}: u32 = 0; ${S} < uniforms.${ia(S)}; ${S}++) {`),x.push("}")});let C=b?[...f,`let sum = ${a.map((T,S)=>T.getByIndices(`input${S}Indices`)).join(" * ")};`]:[...f,g,...$,..._,h,...v,y,...x];return`
            ${p.registerUniforms(u.map(T=>({name:`${ia(T)}`,type:"u32"}))).registerUniform("outputSize","u32").declareVariables(...a,o)}

            ${p.mainStart()}
            ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
            var outputIndices = ${o.offsetToIndices("global_idx")};
            ${a.map((T,S)=>`var input${S}Indices: ${a[S].type.indices};`).join(`
`)}
            ${C.join(`
`)};
            ${o.setByOffset("global_idx","sum")};
          }`};return{name:"Einsum",shaderCache:{hint:r.equation,inputDependencies:e.map(()=>"rank")},getRunData:()=>{let p=u.filter(h=>r.symbolToInfo.has(h)).map(h=>({type:12,data:r.symbolToInfo.get(h)?.dimValue||0}));p.push({type:12,data:s});let f=e.map((h,g)=>[...J(h)]).reduce((h,g)=>h.concat(g),p);return f.push(...J(i)),{outputs:[{dims:i,dataType:t}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:f}},getShaderSource:d}},Sc=(e,t)=>{let r=new $u(e.inputs,t.equation),i=r.outputDims,a=e.inputs.map((s,o)=>s.dims);e.compute(vu(a,e.inputs[0].dataType,r,i))},Ic=e=>{let t=e.equation.replace(/\s+/g,"");return me({equation:t})}}),xu,ra,Tu,ku,Ec,og=U(()=>{ie(),oe(),ue(),xu=e=>{if(!e||e.length!==2)throw new Error("Expand requires 2 input.");let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=r.length<t.length?0:r.length-t.length,a=t.length<r.length?0:t.length-r.length;for(;i<r.length&&a<t.length;++i,++a)if(r[i]!==t[a]&&r[i]!==1&&t[a]!==1)throw new Error("Expand requires shape to be broadcastable to input")},ra=(e,t)=>{let r=e.length-t.length,i=[];for(let a=0;a<r;++a)i.push(e[a]);for(let a=0;a<t.length;++a)i.push(t[a]===1?e[a+r]:t[a]);return i},Tu=(e,t)=>e.length>t.length?ra(e,t):ra(t,e),ku=e=>{let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=Tu(t,r),a=e[0].dataType,s=a===9||A.size(t)===1,o=a===9||t.length>0&&t[t.length-1]%4===0?4:1,u=s||i.length>0&&i[i.length-1]%4===0?4:1,d=Math.ceil(A.size(i)/u),p=h=>{let g=M("input",a,t.length,o),y=Y("output",a,i.length,u),_;if(a===9){let $=(x,v,b="")=>`
          let outputIndices${v} = ${y.offsetToIndices(`outputOffset + ${v}u`)};
          let offset${v} = ${g.broadcastedIndicesToOffset(`outputIndices${v}`,y)};
          let index${v} = offset${v} / 4u;
          let component${v} = offset${v} % 4u;
          ${x}[${v}] = ${b}(${g.getByOffset(`index${v}`)}[component${v}]);
        `;_=`
        let outputOffset = global_idx * ${u};
        var data = vec4<u32>(0);
        ${$("data",0,"u32")}
        ${$("data",1,"u32")}
        ${$("data",2,"u32")}
        ${$("data",3,"u32")}
        ${y.setByOffset("global_idx","data")}
      }`}else _=`
        let outputIndices = ${y.offsetToIndices(`global_idx * ${u}`)};
        let inputOffset = ${g.broadcastedIndicesToOffset("outputIndices",y)};
        let data = ${y.type.value}(${g.getByOffset(`inputOffset / ${o}`)});
        ${y.setByOffset("global_idx","data")}
      }`;return`
    ${h.registerUniform("vec_size","u32").declareVariables(g,y)}
    ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
    ${_}`},f=[{type:12,data:d},...J(t,i)];return{name:"Expand",shaderCache:{hint:`${i.length};${o}${u}`,inputDependencies:["rank"]},getShaderSource:p,getRunData:()=>({outputs:[{dims:i,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:f})}},Ec=e=>{xu(e.inputs),e.compute(ku(e.inputs),{inputs:[0]})}}),Cu,zc,ug=U(()=>{ie(),oe(),ue(),rn(),Cu=e=>{let t=e[0].dataType,r=A.size(e[0].dims),i=A.size(e[1].dims),a=i%4===0,s=o=>{let u=M("x",t,[1],4),d=M("bias",t,[1],4),p=Y("y",t,[1],4),f=[{name:"output_vec_size",type:"u32"},{name:"bias_size",type:"u32"}],h=y=>`
      let bias${y}_offset: u32 = (global_idx * 4 + ${y}) % uniforms.bias_size;
      let bias${y} = ${d.getByOffset(`bias${y}_offset / 4`)}[bias${y}_offset % 4];`,g=a?`
      let bias = ${d.getByOffset("global_idx % (uniforms.bias_size / 4)")};`:`${h(0)}${h(1)}${h(2)}${h(3)}
      let bias = ${u.type.value}(bias0, bias1, bias2, bias3);`;return`${o.registerUniforms(f).declareVariables(u,d,p)}

    ${Aa(Re(t))}

    ${o.mainStart(Gt)}
      ${o.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_vec_size")}

      let x = ${u.getByOffset("global_idx")};
      ${g}
      let x_in = x + bias;
      ${p.setByOffset("global_idx",Oa("x_in"))}
    }`};return{name:"FastGeluWithBias",shaderCache:{hint:`${a}`,inputDependencies:["type","type"]},getShaderSource:s,getRunData:o=>({outputs:[{dims:o[0].dims,dataType:o[0].dataType}],programUniforms:[{type:12,data:Math.ceil(r/4)},{type:12,data:i}],dispatchGroup:{x:Math.ceil(r/Gt/4)}})}},zc=e=>{e.inputs.length<2||A.size(e.inputs[1].dims)===0?Yp(e):e.compute(Cu(e.inputs))}}),Su,Iu,Ac,Oc,lg=U(()=>{ie(),oe(),ke(),ue(),Su=e=>{if(!e||e.length!==2)throw new Error("Gather requires 2 inputs.")},Iu=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,s=A.normalizeAxis(t.axis,a),o=r.slice(0);o.splice(s,1,...i);let u=r[s],d=e[0].dataType===9?4:1,p=Math.ceil(A.size(o)/d),f=[{type:12,data:p},{type:6,data:u},{type:12,data:s},...J(e[0].dims,e[1].dims,o)],h=g=>{let y=M("data",e[0].dataType,e[0].dims.length,d),_=M("inputIndices",e[1].dataType,e[1].dims.length),$=Y("output",e[0].dataType,o.length,d),x=b=>{let C=i.length,T=`var indicesIndices${b}  = ${_.type.indices}(0);`;for(let S=0;S<C;S++)T+=`${C>1?`indicesIndices${b}[${S}]`:`indicesIndices${b}`} = ${o.length>1?`outputIndices${b}[uniforms.axis + ${S}]`:`outputIndices${b}`};`;T+=`
          var idx${b} = ${_.getByIndices(`indicesIndices${b}`)};
          if (idx${b} < 0) {
            idx${b} = idx${b} + uniforms.axisDimLimit;
          }
          var dataIndices${b} : ${y.type.indices};
        `;for(let S=0,z=0;S<a;S++)S===s?(T+=`${a>1?`dataIndices${b}[${S}]`:`dataIndices${b}`} = u32(idx${b});`,z+=C):(T+=`${a>1?`dataIndices${b}[${S}]`:`dataIndices${b}`} = ${o.length>1?`outputIndices${b}[${z}]`:`outputIndices${b}`};`,z++);return T},v;if(e[0].dataType===9){let b=(C,T,S="")=>`
          let outputIndices${T} = ${$.offsetToIndices(`outputOffset + ${T}u`)};
          ${x(T)};
          let offset${T} = ${y.indicesToOffset(`dataIndices${T}`)};
          let index${T} = offset${T} / 4u;
          let component${T} = offset${T} % 4u;
          ${C}[${T}] = ${S}(${y.getByOffset(`index${T}`)}[component${T}]);
        `;v=`
        let outputOffset = global_idx * ${d};
        var value = vec4<u32>(0);
        ${b("value",0,"u32")}
        ${b("value",1,"u32")}
        ${b("value",2,"u32")}
        ${b("value",3,"u32")}
        ${$.setByOffset("global_idx","value")}
      `}else v=`
      let outputIndices = ${$.offsetToIndices("global_idx")};
      ${x("")};
      let value = ${y.getByIndices("dataIndices")};
      ${$.setByOffset("global_idx","value")};
      `;return`
      ${g.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(y,_,$)}
      ${g.mainStart()}
        ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        ${v}
      }`};return{name:"Gather",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:o,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:f}),getShaderSource:h}},Ac=e=>me({axis:e.axis}),Oc=(e,t)=>{let r=e.inputs;Su(r),e.compute(Iu(e.inputs,t))}}),Eu,Rc,Bc,dg=U(()=>{ie(),oe(),ue(),Eu=(e,t,r,i,a,s,o,u,d)=>{let p=[{type:12,data:s},{type:12,data:i},{type:12,data:a},{type:12,data:r},{type:12,data:o},{type:12,data:u},{type:12,data:d}],f=[s];p.push(...J(t.dims,f));let h=g=>{let y=M("indices_data",t.dataType,t.dims.length),_=Y("input_slice_offsets_data",12,1,1),$=[y,_],x=[{name:"output_size",type:"u32"},{name:"batch_dims",type:"u32"},{name:"input_dims",type:"u32",length:a.length},{name:"sizes_from_slice_dims_data",type:"u32",length:r.length},{name:"num_slices_per_batch",type:"u32"},{name:"input_batch_stride",type:"u32"},{name:"num_slice_dims",type:"u32"}];return`
  ${g.registerUniforms(x).declareVariables(...$)}
  ${g.mainStart()}
    ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let batch_idx = global_idx / uniforms.num_slices_per_batch;
    let base_offset = batch_idx * uniforms.input_batch_stride;

    let slice_indices_base_offset = global_idx * uniforms.num_slice_dims;
    var relative_slice_offset = 0;
    for (var dim_idx = 0u; dim_idx < uniforms.num_slice_dims; dim_idx ++) {
      var index = i32(indices_data[dim_idx + slice_indices_base_offset].x);
      let input_dim_idx = uniforms.batch_dims + dim_idx;
      if (index < 0) {
        ${a.length===1?"index += i32(uniforms.input_dims);":"index += i32(uniforms.input_dims[input_dim_idx]);"}
      }
      ${r.length===1?"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data);":"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data[dim_idx]);"}
    }

    input_slice_offsets_data[global_idx] =  base_offset + u32(relative_slice_offset);
  }`};return e.compute({name:"computeSliceOffsets",shaderCache:{hint:`${a.length}_${r.length}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:f,dataType:e.inputs[1].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:p}),getShaderSource:h},{inputs:[t],outputs:[-1]})[0]},Rc=(e,t)=>{let r=e.inputs,i=r[0].dims,a=r[0].dataType,s=r[1].dims,o=s[s.length-1],u=A.sizeToDimension(s,s.length-1),d=A.sizeFromDimension(i,t.batchDims+o),p=A.sizeToDimension(i,t.batchDims),f=A.sizeFromDimension(i,t.batchDims),h=u/p,g=new Array(o),y=d;for(let T=0;T<o;++T)g[o-1-T]=y,y*=i[t.batchDims+o-1-T];let _=Eu(e,r[1],g,t.batchDims,i,u,h,f,o),$=t.batchDims+o;if($>i.length)throw new Error("last dimension of indices must not be larger than rank of input tensor");let x=s.slice(0,-1).concat(i.slice($)),v=A.size(x),b=[{type:12,data:v},{type:12,data:d},...J(r[0].dims,_.dims,x)],C=T=>{let S=M("data",r[0].dataType,r[0].dims.length),z=M("slice_offsets",12,_.dims.length),E=Y("output",r[0].dataType,x.length);return`
          ${T.registerUniform("output_size","u32").registerUniform("slice_size","u32").declareVariables(S,z,E)}
            ${T.mainStart()}
            ${T.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let slice_offset = slice_offsets[global_idx / uniforms.slice_size];
          output[global_idx] = data[u32(slice_offset) + global_idx % uniforms.slice_size];
        }`};e.compute({name:"GatherND",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:x,dataType:a}],dispatchGroup:{x:Math.ceil(v/64)},programUniforms:b}),getShaderSource:C},{inputs:[r[0],_]})},Bc=e=>({batchDims:e.batch_dims,cacheKey:""})}),zu,Au,Mc,Nc,pg=U(()=>{ie(),oe(),ke(),ue(),zu=(e,t)=>{if(e.length<3||e.length>4)throw new Error("GatherBlockQuantized requires 3 or 4 inputs.");let r=A.normalizeAxis(t.quantizeAxis,e[0].dims.length),i=t.blockSize,a=e[0],s=e[2],o=e.length===4?e[3]:void 0;if(s.dims.length!==a.dims.length||!a.dims.map((u,d)=>d===r?Math.ceil(u/i)===s.dims[d]:u===s.dims[d]).reduce((u,d)=>u&&d,!0))throw new Error("Scales must have the same rank as the input tensor and the dims should match except on gatherAxis.");if(o){if(o.dataType!==a.dataType)throw new Error("Zero point must have the same data type as the input tensor.");if(o.dims.length!==s.dims.length||!o.dims.map((u,d)=>u===s.dims[d]).reduce((u,d)=>u&&d,!0))throw new Error("Zero point must have the same rank as the input tensor and the dims should match except on quantizeAxis.")}},Au=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,s=A.normalizeAxis(t.gatherAxis,a),o=A.normalizeAxis(t.quantizeAxis,a),u=r.slice(0);u.splice(s,1,...i);let d=A.size(u),p=e[2].dataType,f=e[0].dataType===22,h=[{type:12,data:d},{type:12,data:o},{type:12,data:s},{type:12,data:t.blockSize},...J(...e.map((y,_)=>y.dims),u)],g=y=>{let _=M("data",e[0].dataType,e[0].dims.length),$=M("inputIndices",e[1].dataType,e[1].dims.length),x=M("scales",e[2].dataType,e[2].dims.length),v=e.length>3?M("zeroPoint",e[3].dataType,e[3].dims.length):void 0,b=Y("output",p,u.length),C=[_,$,x];v&&C.push(v);let T=[{name:"output_size",type:"u32"},{name:"quantize_axis",type:"u32"},{name:"gather_axis",type:"u32"},{name:"block_size",type:"u32"}];return`
        ${y.registerUniforms(T).declareVariables(...C,b)}
        ${y.mainStart()}
        let output_indices = ${b.offsetToIndices("global_idx")};
        var indices_indices = ${$.type.indices}(0);
        ${i.length>1?`
          for (var i: u32 = 0; i < ${i.length}; i++) {
            let index = ${b.indicesGet("output_indices","uniforms.gather_axis + i")};
            ${$.indicesSet("indices_indices","i","index")};
          }`:`indices_indices = ${b.indicesGet("output_indices","uniforms.gather_axis")};`};
        var data_indices = ${_.type.indices}(0);
        for (var i: u32 = 0; i < uniforms.gather_axis; i++) {
          let index = ${b.indicesGet("output_indices","i")};
          ${_.indicesSet("data_indices","i","index")};
        }
        var index_from_indices = ${$.getByIndices("indices_indices")};
        if (index_from_indices < 0) {
          index_from_indices += ${r[s]};
        }
        ${_.indicesSet("data_indices","uniforms.gather_axis","u32(index_from_indices)")};
        for (var i = uniforms.gather_axis + 1; i < ${u.length}; i++) {
          let index = ${b.indicesGet("output_indices",`i + ${i.length} - 1`)};
          ${_.indicesSet("data_indices","i","index")};
        }
        let data_offset = ${_.indicesToOffset("data_indices")};
        let data_index = data_offset % 8;
        // Convert 4-bit packed data to 8-bit packed data.
        let packed_4bit_quantized_data = ${_.getByOffset("data_offset / 8")};
        let packed_8bit_quantized_data = (packed_4bit_quantized_data >> (4 * (data_index % 2))) & 0x0f0f0f0f;
        let quantized_data_vec = ${f?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_quantized_data));
        let quantized_data = quantized_data_vec[data_index / 2];
        var scale_indices = data_indices;
        let quantize_axis_index = ${x.indicesGet("data_indices","uniforms.quantize_axis")} / uniforms.block_size;
        ${x.indicesSet("scale_indices","uniforms.quantize_axis","quantize_axis_index")};
        var scale = ${x.getByIndices("scale_indices")};
        ${v?`
              let zero_point_indices = scale_indices;
              let zero_point_offset = ${v.indicesToOffset("zero_point_indices")};
              let zero_point_index = zero_point_offset % 8;
              let packed_4bit_zero_points = ${v.getByOffset("zero_point_offset / 8")};
              let packed_8bit_zero_points = (packed_4bit_zero_points >> (4 * (zero_point_index % 2))) & 0x0f0f0f0f;
              let zero_point_vec = ${f?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_zero_points));
              let zero_point = zero_point_vec[zero_point_index / 2];`:"var zero_point = 0"};
        let dequantized_data = ${Re(p)}(quantized_data - zero_point) * scale;
        ${b.setByOffset("global_idx","dequantized_data")};
    }`};return{name:"GatherBlockQuantized",shaderCache:{hint:`${t.cacheKey};${e.filter((y,_)=>_!==1).map(y=>y.dims.join("_")).join(";")}`,inputDependencies:Array.from({length:e.length},(y,_)=>"rank")},getRunData:()=>({outputs:[{dims:u,dataType:p}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:h}),getShaderSource:g}},Mc=(e,t)=>{let r=e.inputs;zu(r,t),e.compute(Au(e.inputs,t))},Nc=e=>me({blockSize:e.blockSize,gatherAxis:e.gatherAxis,quantizeAxis:e.quantizeAxis})}),Ou,Ru,Dc,Pc,cg=U(()=>{ie(),oe(),ke(),ue(),Ou=e=>{if(!e||e.length!==2)throw new Error("GatherElements requires 2 inputs.");if(e[0].dims.length<1)throw new Error("GatherElements requires that the data input be rank >= 1.");if(e[0].dims.length!==e[1].dims.length)throw new Error(`GatherElements requires that the data input and
                     indices input tensors be of same rank.`)},Ru=(e,t)=>{let r=e[0].dims,i=e[0].dataType,a=r.length,s=e[1].dims,o=e[1].dataType,u=A.normalizeAxis(t.axis,a),d=r[u],p=s.slice(0),f=A.size(p),h=M("input",i,a),g=M("indicesInput",o,s.length),y=Y("output",i,p.length),_=[{type:12,data:f},{type:6,data:d},{type:12,data:u}];return _.push(...J(r,s,p)),{name:"GatherElements",shaderCache:{inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:p,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(f/64)},programUniforms:_}),getShaderSource:$=>`
      ${$.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(h,g,y)}
      ${$.mainStart()}
      ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

      let outputIndices = ${y.offsetToIndices("global_idx")};

      var idx = ${g.getByOffset("global_idx")};
      if (idx < 0) {
        idx = idx + uniforms.axisDimLimit;
      }
      var inputIndices = ${h.type.indices}(outputIndices);
      ${h.indicesSet("inputIndices","uniforms.axis","u32(idx)")};
      let value = ${h.getByIndices("inputIndices")};

      ${y.setByOffset("global_idx","value")};
  }`}},Dc=e=>me({axis:e.axis}),Pc=(e,t)=>{let r=e.inputs;Ou(r),e.compute(Ru(e.inputs,t))}}),Bu,Mu,Lc,Uc,fg=U(()=>{ie(),oe(),ue(),Bu=e=>{if(!e)throw new Error("Input is missing");if(e.length<2||e.length>3)throw new Error("Invaid input number.");if(e.length===3&&e[2].dims.length>2)throw new Error("Invalid input shape of C");if(e[0].dataType!==e[1].dataType||e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("Input types are mismatched")},Mu=(e,t)=>{let r=e[0].dims.slice(),i=e[1].dims.slice(),[a,s,o]=Dd.getShapeOfGemmResult(r,t.transA,i,t.transB,e.length===3?e[2].dims:void 0),u=[a,s];if(!u)throw new Error("Can't use gemm on the given tensors");let d=16,p=Math.ceil(s/d),f=Math.ceil(a/d),h=!0,g=A.size(u),y=[{type:12,data:h?p:g},{type:12,data:a},{type:12,data:s},{type:12,data:o},{type:1,data:t.alpha},{type:1,data:t.beta}],_=["type","type"];e.length===3&&(y.push(...J(e[2].dims)),_.push("rank")),y.push(...J(u));let $=v=>{let b="";t.transA&&t.transB?b="value += a[k * uniforms.M + m] * b[n * uniforms.K + k];":t.transA&&!t.transB?b="value += a[k * uniforms.M + m] * b[k * uniforms.N + n];":!t.transA&&t.transB?b="value += a[m * uniforms.K + k] * b[n * uniforms.K + k];":!t.transA&&!t.transB&&(b="value += a[m * uniforms.K + k] * b[k * uniforms.N + n];");let C=t.alpha===1?"":"value *= uniforms.alpha;",T=M("a",e[0].dataType,e[0].dims),S=M("b",e[1].dataType,e[1].dims),z=T.type.value,E=null,R=[T,S];e.length===3&&(E=M("c",e[2].dataType,e[2].dims.length),R.push(E));let L=Y("output",e[0].dataType,u.length);R.push(L);let F=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}];return`
  ${v.registerUniforms(F).declareVariables(...R)}

  ${v.mainStart()}
    ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let m = global_idx / uniforms.N;
    let n = global_idx % uniforms.N;

    var value = ${z}(0);
    for (var k: u32 = 0u; k < uniforms.K; k++) {
      ${b}
    }

    ${C}
    ${E!=null?`let cOffset = ${E.broadcastedIndicesToOffset("vec2(m, n)",L)}; value += ${z}(uniforms.beta) * ${E.getByOffset("cOffset")};`:""}
    output[global_idx] = value;
  }`},x=v=>{let b=M("a",e[0].dataType,e[0].dims),C=M("b",e[1].dataType,e[1].dims),T=null,S=[b,C];e.length===3&&(T=M("c",e[2].dataType,e[2].dims.length),S.push(T));let z=Y("output",e[0].dataType,u.length);S.push(z);let E=[{name:"num_tile_n",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}],R="",L="";t.transA&&t.transB?(L=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${b.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${C.type.value}(0);
      }
      `,R="value += tile_a[k][local_id.y] * tile_b[local_id.x][k];"):t.transA&&!t.transB?(L=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${b.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${C.type.value}(0);
      }
      `,R="value += tile_a[k][local_id.y] * tile_b[k][local_id.x];"):!t.transA&&t.transB?(L=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${b.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${C.type.value}(0);
      }
      `,R="value += tile_a[local_id.y][k] * tile_b[local_id.x][k];"):!t.transA&&!t.transB&&(L=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${b.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${C.type.value}(0);
      }
      `,R="value += tile_a[local_id.y][k] * tile_b[k][local_id.x];");let F=t.alpha===1?"":"value *= uniforms.alpha;";return`
  ${v.registerUniforms(E).declareVariables(...S)}
  var<workgroup> tile_a: array<array<${b.type.storage}, ${d}>, ${d}>;
  var<workgroup> tile_b: array<array<${C.type.storage}, ${d}>, ${d}>;
  ${v.mainStart([d,d,1])}
    let tile_col_start = (workgroup_index % uniforms.num_tile_n) * ${d};
    let tile_row_start = (workgroup_index / uniforms.num_tile_n) * ${d};
    let num_tiles = (uniforms.K - 1) / ${d} + 1;
    var k_start = 0u;
    var value = ${z.type.value}(0);
    for (var t: u32 = 0u; t < num_tiles; t++) {
      ${L}
      k_start = k_start + ${d};
      workgroupBarrier();

      for (var k: u32 = 0u; k < ${d}; k++) {
        ${R}
      }
      workgroupBarrier();
    }

    ${F}
    let m = tile_row_start + local_id.y;
    let n = tile_col_start + local_id.x;
    ${T!=null?`let cOffset = ${T.broadcastedIndicesToOffset("vec2(m, n)",z)}; value += ${z.type.value}(uniforms.beta) * ${T.getByOffset("cOffset")};`:""}
    if (m < uniforms.M && n < uniforms.N) {
      output[m * uniforms.N + n] = value;
    }
  }`};return h?{name:"GemmShared",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:p*f},programUniforms:y}),getShaderSource:x}:{name:"Gemm",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:y}),getShaderSource:$}},Lc=e=>{let t=e.transA,r=e.transB,i=e.alpha,a=e.beta;return{transA:t,transB:r,alpha:i,beta:a,cacheKey:`${e.transA};${e.transB};${e.alpha===1}`}},Uc=(e,t)=>{Bu(e.inputs),e.compute(Mu(e.inputs,t))}}),et,ut,Ct,St,Nu,Du,Pu,Lu,Uu,Wu,qu,Fu,Wc,qc,hg=U(()=>{ie(),oe(),ke(),ue(),[et,ut,Ct,St]=[0,1,2,3],Nu=e=>{if(e[0].dims.length!==4)throw new Error("only 4-D tensor is supported.");if(e[0].dims.length!==e[1].dims.length)throw new Error("input dimensions must be equal to grid dimensions");if(e[0].dims.length-2!==e[1].dims[e[1].dims.length-1])throw new Error(`last dimension of grid must be equal to ${e[0].dims.length-2}`);if(e[0].dims[0]!==e[1].dims[0])throw new Error("grid batch size must match input batch size")},Du=`
  fn gs_get_cubic_coeffs(x: f32) -> vec4<f32> {
    let cubic_alpha = -0.75f;
    let x_abs = abs(x);
    var coeffs: vec4<f32>;
    coeffs[0] = (((cubic_alpha * (x_abs + 1) - 5 * cubic_alpha) * (x_abs + 1) + 8 * cubic_alpha) * (x_abs + 1) - 4 * cubic_alpha);
    coeffs[1] = (((cubic_alpha + 2) * x_abs - (cubic_alpha + 3)) * x_abs * x_abs + 1);
    coeffs[2] = (((cubic_alpha + 2) * (1 - x_abs) - (cubic_alpha + 3)) * (1 - x_abs) * (1 - x_abs) + 1);
    coeffs[3] = (((cubic_alpha * (2 - x_abs) - 5 * cubic_alpha) * (2 - x_abs) + 8 * cubic_alpha) * (2 - x_abs) - 4 * cubic_alpha);
    return coeffs;
  }
`,Pu=e=>`
  fn gs_bicubic_interpolate(p: mat4x4<${e}>, x: f32, y: f32) -> ${e} {
    var v: vec4<f32>;
    var coeffs = gs_get_cubic_coeffs(x);
    for (var i = 0; i < 4; i++) {
      v[i] = coeffs[0] * p[i][0] + coeffs[1] * p[i][1] + coeffs[2] * p[i][2] + coeffs[3] * p[i][3];
    }
    coeffs = gs_get_cubic_coeffs(y);
    let pixel = ${e}(coeffs[0] * v[0] + coeffs[1] * v[1] + coeffs[2] * v[2] + coeffs[3] * v[3]);
    return pixel;
  }
`,Lu=e=>`
  fn gs_denormalize(n: f32, length: i32) -> f32 {
    ${e.alignCorners===0?`
    // alignCorners: false => [-1, 1] to [-0.5, length - 0.5]
    return ((n + 1.0) * f32(length) - 1.0) / 2.0;
    `:`
    // alignCorners: true => [-1, 1] to [0, length - 1]
    return (n + 1.0) / 2.0 * (f32(length - 1));
    `}
  }
`,Uu=e=>`
  ${e.paddingMode==="reflection"?`
      fn gs_reflect(x: i32, x_min: f32, x_max: f32) -> u32 {
        var dx = 0.0;
        var fx = f32(x);
        let range = x_max - x_min;
        if (fx < x_min) {
          dx = x_min - fx;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_min + r;
          } else {
            fx = x_max - r;
          }
        } else if (fx > x_max) {
          dx = fx - x_max;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_max - r;
          } else {
            fx = x_min + r;
          }
        }
        return u32(fx);
      }`:""}
`,Wu=(e,t,r)=>`
  fn pixel_at_grid(r: i32, c: i32, H: i32, W: i32, batch: u32, channel: u32, border: vec4<f32>) -> ${t} {
     var pixel = ${t}(0);
     var indices = vec4<u32>(0);
     indices[${et}] = batch;
     indices[${ut}] = channel;`+(()=>{switch(r.paddingMode){case"zeros":return`
          if (r >= 0 && r < H && c >=0 && c < W) {
            indices[${Ct}] = u32(r);
            indices[${St}] = u32(c);
          } else {
            return ${t}(0);
          }
        `;case"border":return`
          indices[${Ct}] = u32(clamp(r, 0, H - 1));
          indices[${St}] = u32(clamp(c, 0, W - 1));
        `;case"reflection":return`
          indices[${Ct}] = gs_reflect(r, border[1], border[3]);
          indices[${St}] = gs_reflect(c, border[0], border[2]);
        `;default:throw new Error(`padding mode ${r.paddingMode} is not supported`)}})()+`
    return ${e.getByIndices("indices")};
  }
`,qu=(e,t,r)=>(()=>{switch(r.mode){case"nearest":return`
          let result = pixel_at_grid(i32(round(y)), i32(round(x)), H_in, W_in, indices[${et}], indices[${ut}], border);
        `;case"bilinear":return`
          let x1 = i32(floor(x));
          let y1 = i32(floor(y));
          let x2 = x1 + 1;
          let y2 = y1 + 1;

          let p11 = pixel_at_grid(y1, x1, H_in, W_in, indices[${et}], indices[${ut}], border);
          let p12 = pixel_at_grid(y1, x2, H_in, W_in, indices[${et}], indices[${ut}], border);
          let p21 = pixel_at_grid(y2, x1, H_in, W_in, indices[${et}], indices[${ut}], border);
          let p22 = pixel_at_grid(y2, x2, H_in, W_in, indices[${et}], indices[${ut}], border);

          let dx2 = ${t}(f32(x2) - x);
          let dx1 = ${t}(x - f32(x1));
          let dy2 = ${t}(f32(y2) - y);
          let dy1 = ${t}(y - f32(y1));
          let result = dy2 * (dx2 * p11 + dx1 * p12) + dy1 * (dx2 * p21 + dx1 * p22);
        `;case"bicubic":return`
          let x0 = i32(floor(x)) - 1;
          let y0 = i32(floor(y)) - 1;
          var p: mat4x4<${t}>;
          for (var h = 0; h < 4; h++) {
            for (var w = 0; w < 4; w++) {
              p[h][w] = pixel_at_grid(h + y0, w + x0, H_in, W_in, indices[${et}], indices[${ut}], border);
            }
          }

          let dx = x - f32(x0 + 1);
          let dy = y - f32(y0 + 1);
          let result = gs_bicubic_interpolate(p, dx, dy);
        `;default:throw new Error(`mode ${r.mode} is not supported`)}})()+`${e.setByOffset("global_idx","result")}`,Fu=(e,t)=>{let r=M("x",e[0].dataType,e[0].dims.length),i=[e[1].dims[0],e[1].dims[1],e[1].dims[2]],a=M("grid",e[1].dataType,i.length,2),s=[e[0].dims[0],e[0].dims[1],e[1].dims[1],e[1].dims[2]];t.format==="NHWC"&&(s=[e[0].dims[0],e[1].dims[1],e[1].dims[2],e[0].dims[3]],[et,ut,Ct,St]=[0,3,1,2]);let o=Y("output",e[0].dataType,s.length),u=r.type.value,d=A.size(s),p=[{type:12,data:d},...J(e[0].dims,i,s)],f=h=>`
  ${h.registerUniform("output_size","u32").declareVariables(r,a,o)}
  ${Du}
  ${Pu(u)}
  ${Lu(t)}
  ${Uu(t)}
  ${Wu(r,u,t)}

  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let H_in = i32(uniforms.x_shape[${Ct}]);
      let W_in = i32(uniforms.x_shape[${St}]);

      ${t.alignCorners===0?`
      let x_min = -0.5;
      let x_max = f32(W_in) - 0.5;
      let y_min = -0.5;
      let y_max = f32(H_in) - 0.5;
      `:`
      let x_min = 0.0;
      let x_max = f32(W_in) - 1.0;
      let y_min = 0.0;
      let y_max = f32(H_in) - 1.0;
      `};
      let border = vec4<f32>(x_min, y_min, x_max, y_max);

      let indices = ${o.offsetToIndices("global_idx")};
      var grid_indices = vec3<u32>(indices[${et}], indices[${Ct}], indices[${St}]);
      let nxy = ${a.getByIndices("grid_indices")};
      var x = gs_denormalize(f32(nxy[0]), W_in);
      var y = gs_denormalize(f32(nxy[1]), H_in);

      ${qu(o,u,t)}
  }`;return{name:"GridSample",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:["type","type"]},getRunData:h=>{let g=A.size(s);return{outputs:[{dims:s,dataType:h[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:p}},getShaderSource:f}},Wc=(e,t)=>{Nu(e.inputs),e.compute(Fu(e.inputs,t))},qc=e=>me({alignCorners:e.align_corners,mode:e.mode,paddingMode:e.padding_mode,format:e.format})}),Me,ju,Fc,aa,Vu,mi,jc,Vc=U(()=>{ie(),oe(),ke(),Qa(),tn(),ue(),$t(),Me=(e,t)=>e.length>t&&e[t].dims.length>0?e[t]:void 0,ju=(e,t)=>{let r=e[0],i=Me(e,1),a=Me(e,2),s=Me(e,3),o=Me(e,4),u=Me(e,5),d=Me(e,6),p=Me(e,7);if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let f=r.dims[0],h=r.dims[1],g=r.dims.length===3?r.dims[2]:t.numHeads*r.dims[4],y=h,_=0,$=0,x=Math.floor(g/t.numHeads);if(d&&p&&A.size(d.dims)&&A.size(p.dims)){if(d.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(d.dims[0]!==f||d.dims[1]!==t.numHeads||d.dims[3]!==x)throw new Error('Input "past_key" shape (batch_size, num_heads, past_sequence_length, head_size)');if(p.dims[0]!==f||p.dims[1]!==t.numHeads||p.dims[3]!==x)throw new Error('Input "past_value" shape (batch_size, num_heads, past_sequence_length, head_size)');if(d.dims[2]!==p.dims[2])throw new Error('Input "past_key" and "past_value" shall have same dim 2 (past_sequence_length)');if(p.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');_=d.dims[2],$=d.dims[2]}else if(d&&A.size(d.dims)||p&&A.size(p.dims))throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let v;if(i&&A.size(i.dims)>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(i.dims[2]!==r.dims[2])throw new Error('Input "query" and "key" shall have same dim 2 (hidden_size)');v=2,y=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==x)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');v=5,y=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==x)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');v=0,y=i.dims[2]}}else{if(r.dims.length!==5)throw new Error('Input "query" is expected to have 5 dimensions when key is empty');if(r.dims[2]!==t.numHeads||r.dims[3]!==3)throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');v=3}if(s&&A.size(s.dims)>0){if(s.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimension');if(i&&i.dims.length===5&&i.dims[3]===2)throw new Error("bias is not allowed for packed kv.")}let b=_+y,C=0;if(o&&A.size(o.dims)>0){C=8;let E=o.dims;throw E.length===1?E[0]===f?C=1:E[0]===3*f+2&&(C=3):E.length===2&&E[0]===f&&E[1]===b&&(C=5),C===8?new Error('Input "key_padding_mask" shape shall be (batch_size) or (batch_size, total_sequence_length)'):new Error("Mask not supported")}let T=!1,S=g;if(a&&A.size(a.dims)>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(y!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');S=a.dims[2]}else{if(y!==a.dims[2])throw new Error('Input "key" and "value" shall have the same dim 2 (kv_sequence_length)');S=a.dims[1]*a.dims[3],T=!0}}let z=!1;if(o&&A.size(o.dims)>0)throw new Error("Key padding mask is not supported");if(u&&A.size(u.dims)>0){if(u.dims.length!==4)throw new Error('Input "attention_bias" is expected to have 4 dimensions');if(u.dims[0]!==f||u.dims[1]!==t.numHeads||u.dims[2]!==h||u.dims[3]!==b)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:f,sequenceLength:h,pastSequenceLength:_,kvSequenceLength:y,totalSequenceLength:b,maxSequenceLength:$,inputHiddenSize:0,hiddenSize:g,vHiddenSize:S,headSize:x,vHeadSize:Math.floor(S/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:C,scale:t.scale,broadcastResPosBias:z,passPastInKv:T,qkvFormat:v}},Fc=e=>me({...e}),aa=me({perm:[0,2,1,3]}),Vu=(e,t,r,i,a,s,o)=>{let u=[i,a,s],d=A.size(u),p=[{type:12,data:d},{type:12,data:o},{type:12,data:s}],f=h=>{let g=Y("qkv_with_bias",t.dataType,u),y=M("qkv",t.dataType,u),_=M("bias",r.dataType,u),$=[{name:"output_size",type:"u32"},{name:"bias_offset",type:"u32"},{name:"hidden_size",type:"u32"}];return`
  ${h.registerUniforms($).declareVariables(y,_,g)}
  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let bias_offset_idx = (global_idx % uniforms.hidden_size) + uniforms.bias_offset;

    qkv_with_bias[global_idx] = qkv[global_idx] + bias[bias_offset_idx];
  }`};return e.compute({name:"MultiHeadAttentionAddBias",shaderCache:{inputDependencies:["type","type"]},getRunData:()=>({outputs:[{dims:u,dataType:t.dataType,gpuDataType:0}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:p}),getShaderSource:f},{inputs:[t,r],outputs:[-1]})[0]},mi=(e,t,r,i,a,s,o,u)=>{let d=s;if(o&&A.size(o.dims)>0){if(i===1)throw new Error("AddBiasReshape is not implemented. Please export your model with packed QKV or KV");return d=Vu(e,s,o,t,i,r*a,u),d=d.reshape([t,i,r,a]),r===1||i===1?d:e.compute(We(d,aa.perm),{inputs:[d],outputs:[-1]})[0]}else return s.dims.length===3&&(d=s.reshape([t,i,r,a])),r===1||i===1?d:e.compute(We(d,aa.perm),{inputs:[d],outputs:[-1]})[0]},jc=(e,t)=>{let r=ju(e.inputs,t),i=e.inputs[0],a=Me(e.inputs,1),s=Me(e.inputs,2),o=Me(e.inputs,3),u=Me(e.inputs,4),d=Me(e.inputs,5),p=Me(e.inputs,6),f=Me(e.inputs,7);if(i.dims.length===5)throw new Error("Packed QKV is not implemented");if(a?.dims.length===5)throw new Error("Packed KV is not implemented");let h=a&&s&&a.dims.length===4&&s.dims.length===4,g=mi(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,i,o,0);if(h)return wi(e,g,a,s,u,void 0,p,f,d,r);if(!a||!s)throw new Error("key and value must be provided");let y=mi(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.headSize,a,o,r.hiddenSize),_=mi(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.vHeadSize,s,o,2*r.hiddenSize);wi(e,g,y,_,u,void 0,p,f,d,r)}}),Gu,Hu,Ku,Zu,Da,Gc,Hc,Kc=U(()=>{ie(),oe(),ke(),ue(),Gu=e=>{if(!e||e.length<1)throw new Error("too few inputs")},Hu=(e,t)=>{let r=[],i=t.numOutputs;return e[1].dims[0]>0&&(e[1].getBigInt64Array().forEach(a=>r.push(Number(a))),i=r.length),me({numOutputs:i,axis:t.axis,splitSizes:r})},Ku=e=>`
fn calculateOutputIndex(index: u32) -> u32 {
    for (var i: u32 = 0u; i < ${e}u; i += 1u ) {
    if (index < ${Q("uniforms.size_in_split_axis","i",e)}) {
        return i;
    }
    }
    return ${e}u;
}`,Zu=e=>{let t=e.length,r=[];for(let i=0;i<t;++i){let a=e[i].setByIndices("indices","input[global_idx]");t===1?r.push(a):i===0?r.push(`if (output_number == ${i}u) { ${a} }`):i===t-1?r.push(`else { ${a} }`):r.push(`else if (output_number == ${i}) { ${a} }`)}return`
      fn writeBufferData(output_number: u32, indices: ${e[0].type.indices}, global_idx: u32) {
        ${r.join(`
`)}
      }`},Da=(e,t)=>{let r=e[0].dims,i=A.size(r),a=e[0].dataType,s=A.normalizeAxis(t.axis,r.length),o=new Array(t.numOutputs),u=M("input",a,r.length),d=new Array(t.numOutputs),p=[],f=[],h=0,g=[{type:12,data:i}];for(let _=0;_<t.numOutputs;_++){h+=t.splitSizes[_],d[_]=h;let $=r.slice();$[s]=t.splitSizes[_],f.push($),o[_]=Y(`output${_}`,a,$.length),p.push({dims:f[_],dataType:e[0].dataType})}g.push({type:12,data:d},...J(r,...f));let y=_=>`
  ${_.registerUniform("input_size","u32").registerUniform("size_in_split_axis","u32",d.length).declareVariables(u,...o)}
  ${Ku(d.length)}
  ${Zu(o)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.input_size")}

    var indices = ${u.offsetToIndices("global_idx")};
    var index = ${u.indicesGet("indices",s)};
    let output_number = calculateOutputIndex(index);
    if (output_number != 0) {
      index -= ${Q("uniforms.size_in_split_axis","output_number - 1u",d.length)};
      ${u.indicesSet("indices",s,"index")};
    }
    writeBufferData(output_number, indices, global_idx);
  }`;return{name:"Split",shaderCache:{hint:t.cacheKey,inputDependencies:["rank"]},getShaderSource:y,getRunData:()=>({outputs:p,dispatchGroup:{x:Math.ceil(i/64)},programUniforms:g})}},Gc=(e,t)=>{Gu(e.inputs);let r=e.inputs.length===1?t:Hu(e.inputs,t);e.compute(Da(e.inputs,r),{inputs:[0]})},Hc=e=>{let t=e.axis,r=e.splitSizes,i=e.numOutputs<0?r.length:e.numOutputs;if(i!==r.length)throw new Error("numOutputs and splitSizes length must be equal");return me({axis:t,numOutputs:i,splitSizes:r})}}),Yu,Qi,Zc,Yc=U(()=>{ie(),oe(),ke(),ue(),Yu=(e,t)=>{let[r,i,a,s]=e,{numHeads:o,rotaryEmbeddingDim:u}=t;if(r.dims.length!==3&&r.dims.length!==4)throw new Error(`Input 'x' is expected to have 3 or 4 dimensions, got ${r.dims.length}`);if(!A.areEqual(i.dims,[])&&!A.areEqual(i.dims,[1])&&i.dims.length!==2)throw new Error(`Input 'position_ids' is expected to have 0, 1, or 2 dimensions, got ${i.dims.length}`);if(a.dims.length!==2)throw new Error(`Input 'cos_cache' is expected to have 2 dimensions, got ${a.dims.length}`);if(s.dims.length!==2)throw new Error(`Input 'sin_cache' is expected to have 2 dimensions, got ${s.dims.length}`);if(!A.areEqual(a.dims,s.dims))throw new Error("Inputs 'cos_cache' and 'sin_cache' are expected to have the same shape");if(u>0&&o===0)throw new Error("num_heads must be provided if rotary_embedding_dim is specified");let d=r.dims[0],p=r.dims[r.dims.length-2],f=a.dims[0],h=A.sizeFromDimension(r.dims,1)/p,g=u===0?a.dims[1]*2:h/o;if(u>g)throw new Error("rotary_embedding_dim must be less than or equal to head_size");if(i.dims.length===2){if(d!==i.dims[0])throw new Error(`Input 'position_ids' dimension 0 should be of size batch_size, got ${i.dims[0]}`);if(p!==i.dims[1])throw new Error(`Input 'position_ids' dimension 1 should be of size sequence_length, got ${i.dims[1]}`)}if(g/2!==a.dims[1]&&u/2!==a.dims[1])throw new Error(`Input 'cos_cache' dimension 1 should be same as head_size / 2 or rotary_embedding_dim / 2, got ${a.dims[1]}`);if(p>f)throw new Error("Updating cos_cache and sin_cache in RotaryEmbedding is not currently supported")},Qi=(e,t)=>{let{interleaved:r,numHeads:i,rotaryEmbeddingDim:a,scale:s}=t,o=e[0].dims[0],u=A.sizeFromDimension(e[0].dims,1),d=e[0].dims[e[0].dims.length-2],p=u/d,f=e[2].dims[1],h=a===0?f*2:p/i,g=new Array(o,d,p/h,h-f),y=A.computeStrides(g),_=[{type:1,data:s},{type:12,data:g},{type:12,data:y},...e[0].dims.length===3?new Array({type:12,data:[u,p,h,1]}):[],...e[0].dims.length===4?new Array({type:12,data:[u,h,d*h,1]}):[],...J(e[0].dims,e[1].dims,e[2].dims,e[3].dims,e[0].dims)],$=x=>{let v=M("input",e[0].dataType,e[0].dims.length),b=M("position_ids",e[1].dataType,e[1].dims.length),C=M("cos_cache",e[2].dataType,e[2].dims.length),T=M("sin_cache",e[3].dataType,e[3].dims.length),S=Y("output",e[0].dataType,e[0].dims.length);return x.registerUniforms([{name:"scale",type:"f32"},{name:"global_shape",type:"u32",length:g.length},{name:"global_strides",type:"u32",length:y.length},{name:"input_output_strides",type:"u32",length:y.length}]),`
        ${x.declareVariables(v,b,C,T,S)}

        ${x.mainStart(Gt)}
          let half_rotary_emb_dim = uniforms.${C.name}_shape[1];
          let bsnh = global_idx / uniforms.global_strides % uniforms.global_shape;
          let size = uniforms.global_shape[0] * uniforms.global_strides[0];
          ${x.guardAgainstOutOfBoundsWorkgroupSizes("size")}

          if (bsnh[3] < half_rotary_emb_dim) {
            let position_ids_idx =
                ${b.broadcastedIndicesToOffset("bsnh.xy",Y("",b.type.tensor,2))};
            let position_id =
                u32(${b.getByOffset("position_ids_idx")}) + select(0, bsnh[1], position_ids_idx == 0);
            let i = dot(bsnh, uniforms.input_output_strides) + select(0, bsnh[3], ${r});
            let j = i + select(half_rotary_emb_dim, 1, ${r});
            let re = ${v.getByOffset("i")} * ${C.get("position_id","bsnh[3]")} -
                ${v.getByOffset("j")} * ${T.get("position_id","bsnh[3]")};
            ${S.setByOffset("i","re")}
            let im = ${v.getByOffset("i")} * ${T.get("position_id","bsnh[3]")} +
                ${v.getByOffset("j")} * ${C.get("position_id","bsnh[3]")};
            ${S.setByOffset("j","im")}
          } else {
            let k = dot(bsnh, uniforms.input_output_strides) + half_rotary_emb_dim;
            ${S.setByOffset("k",v.getByOffset("k"))}
          }
        }`};return{name:"RotaryEmbedding",shaderCache:{hint:me({interleaved:r}).cacheKey,inputDependencies:["rank","rank","rank","rank"]},getShaderSource:$,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(A.size(g)/Gt)},programUniforms:_})}},Zc=(e,t)=>{Yu(e.inputs,t),e.compute(Qi(e.inputs,t))}}),Xu,Qu,na,Ju,Xc,mg=U(()=>{ke(),ie(),tn(),Vc(),Kc(),$t(),Yc(),ue(),Xu=(e,t)=>{if(t.doRotary&&e.length<=7)throw new Error("cos_cache and sin_cache inputs are required if do_rotary is specified");let r=e[0],i=e[1],a=e[2],s=e[3],o=e[4];if(t.doRotary!==0&&e.length<=7)throw new Error("cos_cast and sin_cache are expected if do_rotary attribute is non-zero");if(t.localWindowSize!==-1)throw new Error("Local attention is not supported");if(t.softcap!==0)throw new Error("Softcap is not supported");if(t.rotaryInterleaved!==0)throw new Error("Rotary interleaved is not supported");if(t.smoothSoftmax)throw new Error("Smooth softmax is not supported");if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let u=!1,d=r.dims[0],p=r.dims[1],f=r.dims.length===3?u?r.dims[2]/3:r.dims[2]:t.numHeads*r.dims[4],h=p,g=0,y=!i||i.dims.length===0,_=Math.floor(y?f/(t.numHeads+2*t.kvNumHeads):f/t.numHeads);y&&(f=_*t.numHeads);let $=s&&s.dims.length!==0,x=o&&o.dims.length!==0;if($&&s.dims.length===4&&s.dims[0]===d&&s.dims[1]!==t.kvNumHeads&&s.dims[2]===t.kvNumHeads&&s.dims[3]===_)throw new Error("BSNH pastKey/pastValue is not supported");if($&&x){if(s.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(o.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');g=s.dims[2]}else if($||x)throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let v=1;if(i&&i.dims.length>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(r.dims[2]%i.dims[2]!==0)throw new Error('Dimension 2 of "query" should be a multiple of "key"');h=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==_)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');h=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==_)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');h=i.dims[2]}}else{if(r.dims.length!==3&&r.dims.length!==5)throw new Error('Input "query" is expected to have 3 or 5 dimensions when key is empty');if(r.dims.length===5&&(r.dims[2]!==t.numHeads||r.dims[3]!==3))throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');v=3}let b=0,C=!1,T=t.kvNumHeads?_*t.kvNumHeads:f;if(a&&a.dims.length>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(h!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');T=a.dims[2]}else{if(h!==a.dims[2])throw new Error('Input "past_key" and "past_value" shall have the same dim 2 (kv_sequence_length)');T=a.dims[1]*a.dims[3],C=!0}}let S=e.length>4?e[5]:void 0;if(S&&S.dims.length!==1&&S.dims[0]!==d)throw new Error('Input "seqlens" is expected to have 1 dimension and the same dim 0 as batch_size');return{batchSize:d,sequenceLength:p,pastSequenceLength:g,kvSequenceLength:h,totalSequenceLength:-1,maxSequenceLength:-1,inputHiddenSize:0,hiddenSize:f,vHiddenSize:T,headSize:_,vHeadSize:Math.floor(T/t.kvNumHeads),numHeads:t.numHeads,kvNumHeads:t.kvNumHeads,nReps:t.numHeads/t.kvNumHeads,pastPresentShareBuffer:!1,maskType:b,scale:t.scale,broadcastResPosBias:!1,passPastInKv:C,qkvFormat:v}},Qu=me({perm:[0,2,1,3]}),na=(e,t,r)=>{let i=t,a=r.kvNumHeads;return t.dims.length===3&&r.kvSequenceLength!==0&&(i=t.reshape([r.batchSize,r.kvSequenceLength,a,r.headSize]),i=e.compute(We(i,Qu.perm),{inputs:[i],outputs:[-1]})[0]),i},Ju=(e,t,r,i)=>{let a=7,s=["type","type"],o=[e*t],u=e*t,d=[{type:12,data:u},{type:12,data:t},{type:12,data:e}],p=f=>{let h=M("seq_lens",r.dataType,r.dims),g=M("total_seq_lens",i.dataType,i.dims),y=Y("pos_ids",a,o),_=[{name:"output_size",type:"u32"},{name:"sequence_length",type:"u32"},{name:"batch_size",type:"u32"}];return`
  ${f.registerUniforms(_).declareVariables(h,g,y)}
  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let total_sequence_length = u32(${g.getByOffset("0")});
    let is_subsequent_prompt = uniforms.sequence_length > 1 && uniforms.sequence_length != total_sequence_length;
    let is_first_prompt = !is_subsequent_prompt && uniforms.sequence_length == total_sequence_length;
    let batch_idx = global_idx / uniforms.sequence_length;
    let sequence_idx = i32(global_idx % uniforms.sequence_length);
    var pos_id: i32 = 0;
    let seqlen = ${h.getByOffset("batch_idx")};
    let total_seqlen = seqlen + 1;
    if (is_first_prompt) {
      if (sequence_idx < total_seqlen) {
        pos_id = sequence_idx;
      } else {
        pos_id = 1;
      }
      ${y.setByOffset("global_idx","pos_id")}
    } else if (is_subsequent_prompt) {
      let past_seqlen = total_seqlen - i32(uniforms.sequence_length);
      if (past_seqlen + sequence_idx < total_seqlen) {
        pos_id = past_seqlen + sequence_idx;
      } else {
        pos_id = 1;
      }
      ${y.setByOffset("global_idx","pos_id")}
    } else if (global_idx < uniforms.batch_size) {
      ${y.setByOffset("global_idx","seqlen")}
    };
  }
  `};return{name:"GeneratePositionIds",shaderCache:{hint:`${e};${t}`,inputDependencies:s},getRunData:()=>({outputs:[{dims:o,dataType:a}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:d}),getShaderSource:p}},Xc=(e,t)=>{let r=Xu(e.inputs,t);if(e.inputs[0].dims.length===5)throw new Error("Packed QKV is not implemented");if(e.inputs[1]?.dims.length===5)throw new Error("Packed KV is not implemented");let i=e.inputs[0],a=e.inputs[1]&&e.inputs[1].dims.length>0?e.inputs[1]:void 0,s=e.inputs[2]&&e.inputs[2].dims.length>0?e.inputs[2]:void 0,o=e.inputs[3]&&e.inputs[3].dims.length!==0?e.inputs[3]:void 0,u=e.inputs[4]&&e.inputs[4].dims.length!==0?e.inputs[4]:void 0,d=e.inputs.length>4?e.inputs[5]:void 0,p=e.inputs.length>5?e.inputs[6]:void 0,f=r.kvNumHeads?r.kvNumHeads:r.numHeads,h=me({axis:2,numOutputs:3,splitSizes:[r.numHeads*r.headSize,f*r.headSize,f*r.headSize]}),[g,y,_]=!a&&!s?e.compute(Da([i],h),{inputs:[i],outputs:[-1,-1,-1]}):[i,a,s],$,x;if(t.doRotary){let T=e.compute(Ju(r.batchSize,r.sequenceLength,d,p),{inputs:[d,p],outputs:[-1]})[0],S=e.inputs[7],z=e.inputs[8],E=me({interleaved:t.rotaryInterleaved!==0,numHeads:r.numHeads,rotaryEmbeddingDim:0,scale:t.scale}),R=[g,T,S,z],L=[-1];$=e.compute(Qi(R,E),{inputs:R,outputs:L})[0],R.splice(0,1,y);let F=me({interleaved:t.rotaryInterleaved!==0,numHeads:r.kvNumHeads,rotaryEmbeddingDim:0,scale:t.scale});x=e.compute(Qi(R,F),{inputs:R,outputs:L})[0]}let v=mi(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,t.doRotary?$:g,void 0,0),b=na(e,t.doRotary?x:y,r),C=na(e,_,r);wi(e,v,b,C,void 0,void 0,o,u,void 0,r,d,p)}}),sa,el,tl,Qc,gg=U(()=>{ie(),oe(),$t(),ue(),sa=(e,t,r,i,a,s,o,u)=>{let d=Te(s),p=d===1?"f32":`vec${d}f`,f=d===1?"vec2f":`mat2x${d}f`,h=a*o,g=64;h===1&&(g=256);let y=[a,o,s/d],_=[a,o,2],$=["rank","type","type"],x=[];x.push(...J(y,_));let v=b=>{let C=M("x",t.dataType,3,d),T=M("scale",r.dataType,r.dims),S=M("bias",i.dataType,i.dims),z=Y("output",1,3,2),E=[C,T,S,z];return`
  var<workgroup> workgroup_shared : array<${f}, ${g}>;
  const workgroup_size = ${g}u;
  ${b.declareVariables(...E)}
  ${b.mainStart(g)}
    let batch = workgroup_index / uniforms.x_shape[1];
    let channel = workgroup_index % uniforms.x_shape[1];
    let hight = uniforms.x_shape[2];
    // initialize workgroup memory
    var sum = ${p}(0);
    var squared_sum = ${p}(0);
    for (var h = local_idx; h < hight; h += workgroup_size) {
      let value = ${p}(${C.get("batch","channel","h")});
      sum += value;
      squared_sum += value * value;
    }
    workgroup_shared[local_idx] = ${f}(sum, squared_sum);
    workgroupBarrier();

    for (var currSize = workgroup_size >> 1;  currSize > 0; currSize = currSize >> 1) {
      if (local_idx < currSize) {
        workgroup_shared[local_idx] = workgroup_shared[local_idx] + workgroup_shared[local_idx + currSize];
      }
      workgroupBarrier();
    }
    if (local_idx == 0) {
      let sum_final = ${bt("workgroup_shared[0][0]",d)} / f32(hight * ${d});
      let squared_sum_final = ${bt("workgroup_shared[0][1]",d)} / f32(hight * ${d});

      let inv_std_dev = inverseSqrt(squared_sum_final - sum_final * sum_final + f32(${u}));
      let channel_scale = inv_std_dev * f32(scale[channel]);
      let channel_shift = f32(bias[channel]) - sum_final * channel_scale;
      output[workgroup_index] = vec2f(channel_scale, channel_shift);
    }
  }`};return e.compute({name:"InstanceNormComputeChannelScaleShift",shaderCache:{hint:`${d};${u};${g}`,inputDependencies:$},getRunData:()=>({outputs:[{dims:_,dataType:1}],dispatchGroup:{x:h},programUniforms:x}),getShaderSource:v},{inputs:[t,r,i],outputs:[-1]})[0]},el=(e,t,r)=>{let i=t[0].dims,a=i,s=2,o=i[0],u=i[1],d=A.sizeFromDimension(i,s),p=Te(d),f=A.size(a)/p,h=sa(e,t[0],t[1],t[2],o,d,u,r.epsilon),g=[o,u,d/p],y=[o,u],_=["type","none"],$=x=>{let v=M("x",t[0].dataType,g.length,p),b=M("scale_shift",1,y.length,2),C=Y("output",t[0].dataType,g.length,p),T=[v,b,C];return`
  ${x.registerUniform("output_size","u32").declareVariables(...T)}
  ${x.mainStart()}
  ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let outputIndices = ${C.offsetToIndices("global_idx")};
      let batch = outputIndices[0];
      let channel = outputIndices[1];
      let scale_shift = ${b.getByIndices("vec2<u32>(batch, channel)")};
      let value = ${v.getByOffset("global_idx")} * ${C.type.value}(scale_shift.x) + ${C.type.value}(scale_shift.y);
      ${C.setByOffset("global_idx","value")};
  }`};e.compute({name:"InstanceNormalization",shaderCache:{hint:`${p}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(f/64)},programUniforms:[{type:12,data:f},...J(g,y,g)]}),getShaderSource:$},{inputs:[t[0],h]})},tl=(e,t,r)=>{let i=t[0].dims,a=i,s=i[0],o=i[i.length-1],u=A.sizeFromDimension(i,1)/o,d=Te(o),p=A.size(a)/d,f=[{type:12,data:u},{type:12,data:Math.floor(o/d)}],h=["type","type"],g=!1,y=[0,i.length-1];for(let v=0;v<i.length-2;v++)g=g||i[v+1]!==1,y.push(v+1);g=g&&i[i.length-1]!==1;let _=g?e.compute(We(e.inputs[0],y),{inputs:[e.inputs[0]],outputs:[-1]})[0]:e.inputs[0].reshape(Array.from({length:i.length},(v,b)=>i[y[b]])),$=sa(e,_,t[1],t[2],s,u,o,r.epsilon),x=v=>{let b=Ee(t[0].dataType),C=d===1?"vec2f":`mat${d}x2f`,T=E=>{let R=E===0?"x":"y",L=d===1?"f32":`vec${d}f`;switch(d){case 1:return`${b}(${L}(scale.${R}))`;case 2:return`vec2<${b}>(${L}(scale[0].${R}, scale[1].${R}))`;case 4:return`vec4<${b}>(${L}(scale[0].${R}, scale[1].${R}, scale[2].${R}, scale[3].${R}))`;default:throw new Error(`Not supported compoents ${d}`)}},S=M("input",t[0].dataType,t[0].dims,d),z=Y("output",t[0].dataType,a,d);return`
  @group(0) @binding(0) var<storage, read> input : array<${S.type.storage}>;
  @group(0) @binding(1) var<storage, read> scale_input : array<${C}>;
  @group(0) @binding(2) var<storage, read_write> output : array<${z.type.storage}>;
  struct Uniforms {H: u32, C : u32};
  @group(0) @binding(3) var<uniform> uniforms: Uniforms;

  ${v.mainStart()}
    let current_image_number = global_idx / (uniforms.C * uniforms.H);
    let current_channel_number = global_idx % uniforms.C;

    let scale_offset = current_image_number * uniforms.C + current_channel_number;
    let scale = scale_input[scale_offset];
    output[global_idx] = fma(input[global_idx], ${T(0)}, ${T(1)});
  }`};e.compute({name:"InstanceNormalizationNHWC",shaderCache:{hint:`${d}`,inputDependencies:h},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:f}),getShaderSource:x},{inputs:[t[0],$]})},Qc=(e,t)=>{t.format==="NHWC"?tl(e,e.inputs,t):el(e,e.inputs,t)}}),il,rl,Jc,yg=U(()=>{ie(),oe(),ue(),il=e=>{if(!e||e.length<2)throw new Error("layerNorm requires at least 2 inputs.")},rl=(e,t,r)=>{let i=t.simplified,a=e[0].dims,s=e[1],o=!i&&e[2],u=a,d=A.normalizeAxis(t.axis,a.length),p=A.sizeToDimension(a,d),f=A.sizeFromDimension(a,d),h=A.size(s.dims),g=o?A.size(o.dims):0;if(h!==f||o&&g!==f)throw new Error(`Size of X.shape()[axis:] == ${f}.
       Size of scale and bias (if provided) must match this.
       Got scale size of ${h} and bias size of ${g}`);let y=[];for(let S=0;S<a.length;++S)S<d?y.push(a[S]):y.push(1);let _=Te(f),$=["type","type"],x=[{type:12,data:p},{type:1,data:f},{type:12,data:Math.floor(f/_)},{type:1,data:t.epsilon}];o&&$.push("type");let v=r>1,b=r>2,C=S=>{let z=Ee(e[0].dataType),E=[M("x",e[0].dataType,e[0].dims,_),M("scale",s.dataType,s.dims,_)];o&&E.push(M("bias",o.dataType,o.dims,_)),E.push(Y("output",e[0].dataType,u,_)),v&&E.push(Y("mean_data_output",1,y)),b&&E.push(Y("inv_std_output",1,y));let R=[{name:"norm_count",type:"u32"},{name:"norm_size",type:"f32"},{name:"norm_size_vectorized",type:"u32"},{name:"epsilon",type:"f32"}];return`
  ${S.registerUniforms(R).declareVariables(...E)}
  ${S.mainStart()}
    ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.norm_count")}
    let offset = global_idx * uniforms.norm_size_vectorized;
    var mean_vector = ${Ia("f32",_)};
    var mean_square_vector = ${Ia("f32",_)};

    for (var h: u32 = 0u; h < uniforms.norm_size_vectorized; h++) {
      let value = ${jt(z,_,"x[h + offset]")};
      mean_vector += value;
      mean_square_vector += value * value;
    }
    let mean = ${bt("mean_vector",_)} / uniforms.norm_size;
    let inv_std_dev = inverseSqrt(${bt("mean_square_vector",_)} / uniforms.norm_size ${i?"":"- mean * mean"} + uniforms.epsilon);

    for (var j: u32 = 0; j < uniforms.norm_size_vectorized; j++) {
      let f32input = ${jt(z,_,"x[j + offset]")};
      let f32scale = ${jt(z,_,"scale[j]")};
      output[j + offset] = ${E[0].type.value}((f32input ${i?"":"- mean"}) * inv_std_dev * f32scale
        ${o?`+ ${jt(z,_,"bias[j]")}`:""}
      );
    }

    ${v?"mean_data_output[global_idx] = mean":""};
    ${b?"inv_std_output[global_idx] = inv_std_dev":""};
  }`},T=[{dims:u,dataType:e[0].dataType}];return v&&T.push({dims:y,dataType:1}),b&&T.push({dims:y,dataType:1}),{name:"LayerNormalization",shaderCache:{hint:`${_};${r};${i}`,inputDependencies:$},getRunData:()=>({outputs:T,dispatchGroup:{x:Math.ceil(p/64)},programUniforms:x}),getShaderSource:C}},Jc=(e,t)=>{il(e.inputs),e.compute(rl(e.inputs,t,e.outputCount))}}),al,ef,_g=U(()=>{oe(),on(),un(),al=e=>{if(!e||e.length!==2)throw new Error("MatMul requires 2 inputs.");if(e[0].dims[e[0].dims.length-1]!==e[1].dims[e[1].dims.length-2])throw new Error("shared dimension does not match.")},ef=e=>{al(e.inputs);let t=Vt.calcShape(e.inputs[0].dims,e.inputs[1].dims,!0);if(!t)throw new Error("Can't use matmul on the given tensors");let r=t[t.length-1],i=e.inputs[0].dims[e.inputs[0].dims.length-1];if(r<8&&i<8)e.compute(sn(e.inputs,{activation:""},t));else{let a=t[t.length-2],s=A.size(e.inputs[0].dims.slice(0,-2)),o=A.size(e.inputs[1].dims.slice(0,-2));if(s!==1&&a===1&&o===1){let u=e.inputs[0].reshape([1,s,i]),d=e.inputs[1].reshape([1,i,r]),p=[1,s,r],f=[u,d];e.compute(Xi(f,{activation:""},t,p),{inputs:f})}else e.compute(Xi(e.inputs,{activation:""},t))}}}),nl,sl,ol,tf,rf,wg=U(()=>{ie(),oe(),ke(),ue(),nl=(e,t)=>{if(e.length<3||e.length>4)throw new Error("MatMulNBits requires 3 or 4 inputs");let r=e[0],i=r.dims.length;if(r.dims[i-1]!==t.k)throw new Error("The last dim of input shape does not match the k value");let a=Math.floor((t.k+t.blockSize-1)/t.blockSize),s=t.blockSize/8*t.bits,o=e[1];if(!A.areEqual(o.dims,[t.n,a,s]))throw new Error("The second inputs must be 3D tensor with shape N X nBlocksPerCol X blobSize");let u=e[2].dims;if(A.size(u)!==t.n*a)throw new Error("scales input size error.");if(e.length===4){let d=e[3].dims,p=t.n*(t.bits===8?a:Math.floor((a*t.bits+7)/8));if(A.size(d)!==p)throw new Error("zeroPoints input size error.")}},sl=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],s=t.k,o=t.n,u=r.slice(0,i-2),d=A.size(u),p=e[1].dims[2]/4,f=e[0].dataType,h=Te(t.k),g=Te(p),y=Te(o),_=u.concat([a,o]),$=a>1&&o/y%2===0?2:1,x=A.size(_)/y/$,v=64,b=[],C=[d,a,s/h],T=A.convertShape(e[1].dims).slice();T.splice(-1,1,p/g),b.push(...J(C)),b.push(...J(T)),b.push(...J(e[2].dims)),e.length===4&&b.push(...J(A.convertShape(e[3].dims)));let S=[d,a,o/y];b.push(...J(S));let z=E=>{let R=C.length,L=M("a",e[0].dataType,R,h),F=M("b",12,T.length,g),K=M("scales",e[2].dataType,e[2].dims.length),X=[L,F,K],re=e.length===4?M("zero_points",12,e[3].dims.length):void 0;re&&X.push(re);let j=S.length,se=Y("output",e[0].dataType,j,y),H=Ee(e[0].dataType),G=(()=>{switch(h){case 1:return`array<${H}, 8>`;case 2:return`mat4x2<${H}>`;case 4:return`mat2x4<${H}>`;default:throw new Error(`${h}-component is not supported.`)}})(),ne=()=>{let P=`
          // reuse a data
            var input_offset = ${L.indicesToOffset(`${L.type.indices}(batch, row, word_offset)`)};
            var a_data: ${G};
            for (var j: u32 = 0; j < ${8/h}; j++) {
              a_data[j] = ${L.getByOffset("input_offset")};
              input_offset++;
            }
          `;for(let q=0;q<y*$;q++)P+=`
            b_value = ${g===1?`b${q}_data`:`b${q}_data[i]`};
            b_value_lower = unpack4xU8(b_value & b_mask);
            b_value_upper = unpack4xU8((b_value >> 4) & b_mask);
            b_quantized_values = ${G}(${Array.from({length:4},(ee,pe)=>`${H}(b_value_lower[${pe}]), ${H}(b_value_upper[${pe}])`).join(", ")});
            b_dequantized_values = ${h===1?`${G}(${Array.from({length:8},(ee,pe)=>`(b_quantized_values[${pe}] - ${re?`zero_point${q}`:"zero_point"}) * scale${q}`).join(", ")});`:`(b_quantized_values - ${G}(${Array(8).fill(`${re?`zero_point${q}`:"zero_point"}`).join(",")})) * scale${q};`};
            workgroup_shared[local_id.x * ${$} + ${Math.floor(q/y)}]${y>1?`[${q%y}]`:""} += ${Array.from({length:8/h},(ee,pe)=>`${h===1?`a_data[${pe}] * b_dequantized_values[${pe}]`:`dot(a_data[${pe}], b_dequantized_values[${pe}])`}`).join(" + ")};
          `;return P},V=()=>{let P=`
            var col_index = col * ${y};
            ${re?`
            let zero_point_bytes_per_col = (nBlocksPerCol + 1) / 2;
            var zero_point_byte_count: u32;
            var zero_point_word_index: u32;
            var zero_point_byte_offset: u32;
            let zero_point_nibble_offset: u32 = block & 0x1u;
            var zero_point_bits_offset: u32;
            var zero_point_word: u32;`:`
            // The default zero point is 8 for unsigned 4-bit quantization.
            let zero_point = ${H}(8);`}
            `;for(let q=0;q<y*$;q++)P+=`
            let scale${q} = ${K.getByOffset("col_index * nBlocksPerCol + block")};
            ${re?`
            zero_point_byte_count = col_index * zero_point_bytes_per_col + (block >> 0x1u);
            zero_point_word_index = zero_point_byte_count >> 0x2u;
            zero_point_byte_offset = zero_point_byte_count & 0x3u;
            zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_nibble_offset << 2);
            zero_point_word = ${re.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point${q} = ${H}((zero_point_word) & 0xFu);`:""}
            col_index += 1;`;return P},ge=()=>{let P=`col_index = col * ${y};`;for(let q=0;q<y*$;q++)P+=`
            let b${q}_data = ${F.getByIndices(`${F.type.indices}(col_index, block, word)`)};
            col_index += 1;`;return P+=`
            var b_value: u32;
            let b_mask: u32 = 0x0F0F0F0Fu;
            var b_value_lower: vec4<u32>;
            var b_value_upper: vec4<u32>;
            var b_quantized_values: ${G};
            var b_dequantized_values: ${G};`,P};return`
        var<workgroup> workgroup_shared: array<${se.type.value}, ${$*v}>;
        ${E.declareVariables(...X,se)}
        ${E.mainStart([v,1,1])}
          let output_indices = ${se.offsetToIndices(`(global_idx / ${v}) * ${$}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let nBlocksPerCol = uniforms.b_shape[1];

          for (var block = local_id.x; block < nBlocksPerCol; block += ${v}) {
            //process one block
            var word_offset: u32 = block * ${t.blockSize/h};
            ${V()}
            for (var word: u32 = 0; word < ${p}; word += ${g}) {
              ${ge()}
              for (var i: u32 = 0; i < ${g}; i++) {
                ${ne()}
                word_offset += ${8/h};
              }
            }
          }
          workgroupBarrier();

          if (local_id.x < ${$}) {
            var output_value: ${se.type.value} = ${se.type.value}(0);
            var workgroup_shared_offset: u32 = local_id.x;
            for (var b: u32 = 0u; b < ${v}u; b++) {
              output_value += workgroup_shared[workgroup_shared_offset];
              workgroup_shared_offset += ${$};
            }
            ${se.setByIndices(`${se.type.indices}(batch, row, col + local_id.x)`,"output_value")};
          }
        }`};return{name:"MatMulNBits",shaderCache:{hint:`${t.blockSize};${t.bits};${h};${g};${y};${$};${v}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:_,dataType:f}],dispatchGroup:{x},programUniforms:b}),getShaderSource:z}},ol=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],s=t.k,o=t.n,u=r.slice(0,i-2),d=A.size(u),p=e[1].dims[2]/4,f=e[0].dataType,h=Te(t.k),g=Te(p),y=u.concat([a,o]),_=128,$=o%8===0?8:o%4===0?4:1,x=_/$,v=x*g*8,b=v/h,C=v/t.blockSize,T=A.size(y)/$,S=[],z=[d,a,s/h],E=A.convertShape(e[1].dims).slice();E.splice(-1,1,p/g),S.push(...J(z)),S.push(...J(E)),S.push(...J(e[2].dims)),e.length===4&&S.push(...J(A.convertShape(e[3].dims)));let R=[d,a,o];S.push(...J(R));let L=F=>{let K=z.length,X=M("a",e[0].dataType,K,h),re=M("b",12,E.length,g),j=M("scales",e[2].dataType,e[2].dims.length),se=[X,re,j],H=e.length===4?M("zero_points",12,e[3].dims.length):void 0;H&&se.push(H);let G=R.length,ne=Y("output",e[0].dataType,G),V=Ee(e[0].dataType),ge=()=>{switch(h){case 1:return`
          let a_data0 = vec4<${V}>(sub_a[word_offset], sub_a[word_offset + 1], sub_a[word_offset + 2], sub_a[word_offset + 3]);
          let a_data1 = vec4<${V}>(sub_a[word_offset + 4], sub_a[word_offset + 5], sub_a[word_offset + 6], sub_a[word_offset + 7]);`;case 2:return`
          let a_data0 = vec4<${V}>(sub_a[word_offset], sub_a[word_offset + 1]);
          let a_data1 = vec4<${V}>(sub_a[word_offset + 2], sub_a[word_offset + 3]);`;case 4:return`
          let a_data0 = sub_a[word_offset];
          let a_data1 = sub_a[word_offset + 1];`;default:throw new Error(`${h}-component is not supported.`)}};return`
        var<workgroup> sub_a: array<${X.type.value}, ${b}>;
        var<workgroup> inter_results: array<array<${ne.type.value}, ${x}>, ${$}>;
        ${F.declareVariables(...se,ne)}
        ${F.mainStart([x,$,1])}
          let output_indices = ${ne.offsetToIndices(`workgroup_index * ${$}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let n_blocks_per_col = uniforms.b_shape[1];
          let num_tiles =  (n_blocks_per_col - 1) / ${C} + 1;

          // Loop over shared dimension.
          for (var tile: u32 = 0; tile < num_tiles; tile += 1) {
            let a_col_start = tile * ${b};
            // load one tile A data into shared memory.
            for (var a_offset = local_idx; a_offset < ${b}; a_offset += ${_})
            {
              let a_col = a_col_start + a_offset;
              if (a_col < uniforms.a_shape[2])
              {
                sub_a[a_offset] = ${X.getByIndices(`${X.type.indices}(batch, row, a_col)`)};
              } else {
                sub_a[a_offset] = ${X.type.value}(0);
              }
            }
            workgroupBarrier();

            // each thread process one block
            let b_row = col + local_id.y;
            let block = tile * ${C} + local_id.x;
            ${H?`
            let zero_point_bytes_per_col = (n_blocks_per_col + 1) / 2;
            let zero_point_byte_count = b_row * zero_point_bytes_per_col + (block >> 0x1u);
            let zero_point_word_index = zero_point_byte_count >> 0x2u;
            let zero_point_byte_offset = zero_point_byte_count & 0x3u;
            let zero_point_nibble_offset: u32 = block & 0x1u;
            let zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_nibble_offset << 2);
            let zero_point_word = ${H.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point = ${V}((zero_point_word) & 0xFu);`:`
            // The default zero point is 8 for unsigned 4-bit quantization.
            let zero_point = ${V}(8);`}
            let scale = ${j.getByOffset("b_row * n_blocks_per_col + block")};
            let b_data = ${re.getByIndices(`${re.type.indices}(b_row, block, 0)`)};
            var word_offset = local_id.x * ${t.blockSize/h};
            for (var i: u32 = 0; i < ${g}; i++) {
              ${ge()}
              let b_value = ${g===1?"b_data":"b_data[i]"};
              let b_value_lower = unpack4xU8(b_value & 0x0F0F0F0Fu);
              let b_value_upper = unpack4xU8((b_value >> 4) & 0x0F0F0F0Fu);
              let b_quantized_values = mat2x4<${V}>(${Array.from({length:4},(P,q)=>`${V}(b_value_lower[${q}]), ${V}(b_value_upper[${q}])`).join(", ")});
              let b_dequantized_values = (b_quantized_values - mat2x4<${V}>(${Array(8).fill("zero_point").join(",")})) * scale;
              inter_results[local_id.y][local_id.x] += ${Array.from({length:2},(P,q)=>`${`dot(a_data${q}, b_dequantized_values[${q}])`}`).join(" + ")};
              word_offset += ${8/h};
            }
            workgroupBarrier();
          }

          if (local_idx < ${$}) {
            var output_value: ${ne.type.value} = ${ne.type.value}(0);
            for (var b = 0u; b < ${x}; b++) {
              output_value += inter_results[local_idx][b];
            }
            if (col + local_idx < uniforms.output_shape[2])
            {
              ${ne.setByIndices(`${ne.type.indices}(batch, row, col + local_idx)`,"output_value")}
            }
          }
        }`};return{name:"BlockwiseMatMulNBits32",shaderCache:{hint:`${t.blockSize};${h};${g};${x};${$}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:y,dataType:f}],dispatchGroup:{x:T},programUniforms:S}),getShaderSource:L}},tf=(e,t)=>{nl(e.inputs,t),t.blockSize===32&&e.adapterInfo.isVendor("intel")&&e.adapterInfo.isArchitecture("gen-12lp")?e.compute(ol(e.inputs,t)):e.compute(sl(e.inputs,t))},rf=e=>me(e)}),ul,ll,dl,pl,cl,fl,hl,ml,af,bg=U(()=>{ie(),oe(),ue(),ul=e=>{if(!e||e.length<1)throw new Error("Too few inputs");if(e[0].dataType!==1&&e[0].dataType!==10)throw new Error("Input type must be float or float16.");if(e.length>=2){let t=e[0].dims.length*2===e[1].dims[0];if(e.length===4&&(t=e[3].dims[0]*2===e[1].dims[0]),!t)throw new Error("The pads should be a 1D tensor of shape [2 * input_rank] or [2 * num_axes].")}},ll=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
            k = i32(${e.indicesGet("indices",a)}) - ${Q("uniforms.pads",a,r)};
            if (k < 0) {
              break;
            }
            if (k >= i32(${Q("uniforms.x_shape",a,t)})) {
              break;
            }
            offset += k * i32(${Q("uniforms.x_strides",a,t)});
        `;return`
          value = ${e.type.value}(uniforms.constant_value);
          for (var i = 0; i < 1; i++) {
            var offset = 0;
            var k = 0;
            ${i}
            value = x[offset];
          }
      `},dl=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Q("uniforms.pads",a,r)};
                if (k < 0) {
                  k = -k;
                }
                {
                  let _2n_1 = 2 * (i32(${Q("uniforms.x_shape",a,t)}) - 1);
                  k = k % _2n_1;
                  if(k >= i32(${Q("uniforms.x_shape",a,t)})) {
                    k = _2n_1 - k;
                  }
                }
                offset += k * i32(${Q("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},pl=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Q("uniforms.pads",a,r)};
                if (k < 0) {
                  k = 0;
                }
                if (k >= i32(${Q("uniforms.x_shape",a,t)})) {
                  k = i32(${Q("uniforms.x_shape",a,t)}) - 1;
                }
                offset += k * i32(${Q("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},cl=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Q("uniforms.pads",a,r)};
                if (k < 0)  {
                  k += i32(${Q("uniforms.x_shape",a,t)}]);
                }
                if (k >= i32(${Q("uniforms.x_shape",a,t)})) {
                  k -= i32(${Q("uniforms.x_shape",a,t)});
                }
                offset += k * i32(${Q("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},fl=(e,t,r)=>{switch(r.mode){case 0:return ll(e,t,r.pads.length);case 1:return dl(e,t,r.pads.length);case 2:return pl(e,t,r.pads.length);case 3:return cl(e,t,r.pads.length);default:throw new Error("Invalid mode")}},hl=(e,t)=>{let r=A.padShape(e[0].dims.slice(),t.pads),i=e[0].dims,a=A.size(r),s=[{type:12,data:a},{type:6,data:t.pads}],o=e.length>=3&&e[2].data;t.mode===0&&s.push({type:o?e[2].dataType:1,data:t.value}),s.push(...J(e[0].dims,r));let u=["rank"],d=p=>{let f=Y("output",e[0].dataType,r.length),h=M("x",e[0].dataType,i.length),g=h.type.value,y=fl(f,i.length,t),_=[{name:"output_size",type:"u32"},{name:"pads",type:"i32",length:t.pads.length}];return t.mode===0&&_.push({name:"constant_value",type:o?g:"f32"}),`
            ${p.registerUniforms(_).declareVariables(h,f)}
            ${p.mainStart()}
            ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

            let indices = ${f.offsetToIndices("global_idx")};

            var value = ${g}(0);
            ${y}
            output[global_idx] = value;
        }`};return{name:"Pad",shaderCache:{hint:`${t.mode}${o}`,inputDependencies:u},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(A.size(r)/64)},programUniforms:s}),getShaderSource:d}},ml=(e,t)=>{if(e.length>1){let r=e[1].getBigInt64Array(),i=e.length>=3&&e[2].data?e[2].dataType===10?e[2].getUint16Array()[0]:e[2].getFloat32Array()[0]:0,a=e[0].dims.length,s=new Int32Array(2*a).fill(0);if(e.length>=4){let u=e[3].getBigInt64Array();for(let d=0;d<u.length;d++)s[Number(u[d])]=Number(r[d]),s[Number(u[d])+a]=Number(r[d+u.length])}else r.forEach((u,d)=>s[Number(d)]=Number(u));let o=[];return s.forEach(u=>o.push(u)),{mode:t.mode,value:i,pads:o}}else return t},af=(e,t)=>{ul(e.inputs);let r=ml(e.inputs,t);e.compute(hl(e.inputs,r),{inputs:[0]})}}),ui,oa,ua,la,da,gl,yl,pa,ca,nf,sf,fa,of,uf,ha,lf,df,pf,cf,$g=U(()=>{je(),ie(),oe(),ue(),ui=e=>{if($e.webgpu.validateInputContent&&(!e||e.length!==1))throw new Error("Pool ops requires 1 input.")},oa=(e,t,r)=>{let i=t.format==="NHWC",a=e.dims.slice();i&&a.splice(1,0,a.pop());let s=Object.hasOwnProperty.call(t,"dilations"),o=t.kernelShape.slice(),u=t.strides.slice(),d=s?t.dilations.slice():[],p=t.pads.slice();Zi.adjustPoolAttributes(r,a,o,u,d,p);let f=Zi.computePoolOutputShape(r,a,u,d,o,p,t.autoPad),h=Object.assign({},t);s?Object.assign(h,{kernelShape:o,strides:u,pads:p,dilations:d,cacheKey:t.cacheKey}):Object.assign(h,{kernelShape:o,strides:u,pads:p,cacheKey:t.cacheKey});let g=f.slice();return g.push(g.splice(1,1)[0]),[h,i?g:f]},ua=(e,t)=>{let r=t.format==="NHWC",i=A.size(e),a=A.size(t.kernelShape),s=[{type:12,data:i},{type:12,data:a}],o=[{name:"outputSize",type:"u32"},{name:"kernelSize",type:"u32"}];if(t.kernelShape.length<=2){let u=t.kernelShape[t.kernelShape.length-1],d=t.strides[t.strides.length-1],p=t.pads[t.pads.length/2-1],f=t.pads[t.pads.length-1],h=!!(p+f);s.push({type:12,data:u},{type:12,data:d},{type:12,data:p},{type:12,data:f}),o.push({name:"kw",type:"u32"},{name:"sw",type:"u32"},{name:"pwStart",type:"u32"},{name:"pwEnd",type:"u32"});let g=!1;if(t.kernelShape.length===2){let y=t.kernelShape[t.kernelShape.length-2],_=t.strides[t.strides.length-2],$=t.pads[t.pads.length/2-2],x=t.pads[t.pads.length-2];g=!!($+x),s.push({type:12,data:y},{type:12,data:_},{type:12,data:$},{type:12,data:x}),o.push({name:"kh",type:"u32"},{name:"sh",type:"u32"},{name:"phStart",type:"u32"},{name:"phEnd",type:"u32"})}return[s,o,!0,h,g]}else{if(r)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let u=A.computeStrides(t.kernelShape);s.push({type:12,data:u},{type:12,data:t.pads},{type:12,data:t.strides}),o.push({name:"kernelStrides",type:"u32",length:u.length},{name:"pads",type:"u32",length:t.pads.length},{name:"strides",type:"u32",length:t.strides.length});let d=t.pads.reduce((p,f)=>p+f);return[s,o,!!d,!1,!1]}},la=(e,t,r,i,a,s,o,u,d,p,f,h)=>{let g=a.format==="NHWC",y=t.type.value,_=Y("output",t.type.tensor,i);if(a.kernelShape.length<=2){let $="",x="",v="",b=r-(g?2:1);if(f?$=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${b}] = indices[${b}] * uniforms.sw - uniforms.pwStart + i;
                  if (xIndices[${b}] < 0 || xIndices[${b}]
                      >= uniforms.x_shape[${b}]) {
                    pad++;
                    continue;
                  }
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${s}
                }`:$=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${b}] = indices[${b}] * uniforms.sw - uniforms.pwStart + i;
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${s}
                }`,a.kernelShape.length===2){let C=r-(g?3:2);h?x=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${C}] = indices[${C}] * uniforms.sh - uniforms.phStart + j;
                  if (xIndices[${C}] < 0 || xIndices[${C}] >= uniforms.x_shape[${C}]) {
                    pad += i32(uniforms.kw);
                    continue;
                  }
              `:x=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${C}] = indices[${C}] * uniforms.sh - uniforms.phStart + j;
                `,v=`
              }
            `}return`
            ${e.registerUniforms(d).declareVariables(t,_)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

              let indices = ${_.offsetToIndices("global_idx")};
              var xIndices = ${_.offsetToIndices("global_idx")};

              var value = ${y}(${u});
              var pad = 0;
              ${x}
              ${$}
              ${v}
              ${o}

              output[global_idx] = value;
            }`}else{if(g)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let $=a.kernelShape.length,x=a.pads.length,v="";return p?v=`
                if (xIndices[j] >= uniforms.x_shape[j]) {
                  pad++;
                  isPad = true;
                  break;
                }
              }
              if (!isPad) {
                let x_val = x[${t.indicesToOffset("xIndices")}];
                ${s}
              }`:v=`
              }
              let x_val = x[${t.indicesToOffset("xIndices")}];
              ${s}
            `,`
            ${e.registerUniforms(d).declareVariables(t,_)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
              let indices = ${_.offsetToIndices("global_idx")};
              var xIndices = ${_.offsetToIndices("global_idx")};

              var offsets: array<u32, ${$}>;

              var value = ${y}(${u});
              var pad = 0;
              var isPad = false;

              for (var i: u32 = 0u; i < uniforms.kernelSize; i++) {
                var offset = i;
                for (var j = 0u; j < ${$-1}u; j++) {
                  offsets[j] = offset / ${Q("uniforms.kernelStrides","j",$)};
                  offset -= offsets[j] * ${Q("uniforms.kernelStrides","j",$)};
                }
                offsets[${$-1}] = offset;

                isPad = false;
                for (var j = ${r-$}u; j < ${r}u; j++) {
                  xIndices[j] = indices[j] * ${Q("uniforms.strides",`j - ${r-$}u`,$)}
                    + offsets[j - ${r-$}u] - ${Q("uniforms.pads","j - 2u",x)};
                  ${v}
              }
              ${o}

              output[global_idx] = value;
            }`}},da=e=>`${e.format};${e.ceilMode};${e.autoPad};${e.kernelShape.length}`,gl=e=>`${da(e)};${e.countIncludePad}`,yl=e=>`${da(e)};${e.storageOrder};${e.dilations}`,pa=e=>({format:e.format,autoPad:["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],ceilMode:e.ceil_mode,kernelShape:e.kernel_shape,strides:e.strides,pads:e.pads}),ca=(e,t,r,i)=>{let[a,s]=oa(t,i,r),o=M("x",t.dataType,t.dims.length),u=o.type.value,d="value += x_val;",p="";a.countIncludePad?p+=`value /= ${u}(uniforms.kernelSize);`:p+=`value /= ${u}(i32(uniforms.kernelSize) - pad);`;let[f,h,g,y,_]=ua(s,a);f.push(...J(t.dims,s));let $=["rank"];return{name:e,shaderCache:{hint:`${i.cacheKey};${g};${y};${_}`,inputDependencies:$},getRunData:()=>({outputs:[{dims:s,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(A.size(s)/64)},programUniforms:f}),getShaderSource:x=>la(x,o,t.dims.length,s.length,a,d,p,0,h,g,y,_)}},nf=e=>{let t=e.count_include_pad!==0,r=pa(e);if(r.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for AveragePool");let i={countIncludePad:t,...r,cacheKey:""};return{...i,cacheKey:gl(i)}},sf=(e,t)=>{ui(e.inputs),e.compute(ca("AveragePool",e.inputs[0],!1,t))},fa={autoPad:"",ceilMode:0,countIncludePad:!1,kernelShape:[],strides:[],pads:[],storageOrder:0,dilations:[]},of=e=>{let t=e.format;return{format:t,...fa,cacheKey:t}},uf=(e,t)=>{ui(e.inputs),e.compute(ca("GlobalAveragePool",e.inputs[0],!0,t))},ha=(e,t,r,i)=>{let[a,s]=oa(t,i,r),o=`
      value = max(x_val, value);
    `,u="",d=M("x",t.dataType,t.dims.length),p=["rank"],[f,h,g,y,_]=ua(s,a);return f.push(...J(t.dims,s)),{name:e,shaderCache:{hint:`${i.cacheKey};${g};${y};${_}`,inputDependencies:p},getRunData:()=>({outputs:[{dims:s,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(A.size(s)/64)},programUniforms:f}),getShaderSource:$=>la($,d,t.dims.length,s.length,a,o,u,t.dataType===10?-65504:-1e5,h,g,y,_)}},lf=(e,t)=>{ui(e.inputs),e.compute(ha("MaxPool",e.inputs[0],!1,t))},df=e=>{let t=e.storage_order,r=e.dilations,i=pa(e);if(t!==0)throw new Error("column major storage order is not yet supported for MaxPool");if(i.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for MaxPool");let a={storageOrder:t,dilations:r,...i,cacheKey:""};return{...a,cacheKey:yl(a)}},pf=e=>{let t=e.format;return{format:t,...fa,cacheKey:t}},cf=(e,t)=>{ui(e.inputs),e.compute(ha("GlobalMaxPool",e.inputs[0],!0,t))}}),_l,wl,ff,hf,vg=U(()=>{ie(),oe(),ke(),ue(),_l=(e,t)=>{if(e.length<2||e.length>3)throw new Error("DequantizeLinear requires 2 or 3 inputs.");if(e.length===3&&e[1].dims===e[2].dims)throw new Error("x-scale and x-zero-point must have the same shape.");if(e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[0].dataType===6&&e.length>2)throw new Error("In the case of dequantizing int32 there is no zero point.");if(e[1].dims.length!==0&&e[1].dims.length!==1&&e[1].dims.length!==e[0].dims.length)throw new Error("scale input must be a scalar, a 1D tensor, or have the same rank as the input tensor.");if(e.length>2){if(e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==e[2].dims.length)throw new Error("scale and zero-point inputs must have the same rank.");if(!e[1].dims.map((r,i)=>r===e[2].dims[i]).reduce((r,i)=>r&&i,!0))throw new Error("scale and zero-point inputs must have the same shape.")}if(t.blockSize>0){if(e[1].dims.length===0||e[1].dims.length===1&&e[1].dims[0]===1)throw new Error("blockSize must be set only for block quantization.");if(!e[1].dims.map((a,s)=>s===t.axis||a===e[0].dims[s]).reduce((a,s)=>a&&s,!0))throw new Error("For block qunatization, scale input shape to match the input shape except for the axis");if(e[1].dims.length!==e[0].dims.length)throw new Error("For block qunatization the scale input rank must be the same as the x rank.");let r=e[0].dims[t.axis],i=e[1].dims[t.axis];if(t.blockSize<Math.ceil(r/i)||t.blockSize>Math.ceil(r/(i-1)-1))throw new Error("blockSize must be with in the range [ceil(dI / Si), ceil(dI / (Si - 1) - 1)].")}},wl=(e,t)=>{let r=A.normalizeAxis(t.axis,e[0].dims.length),i=e[0].dataType,a=i===3,s=e[0].dims,o=e[1].dataType,u=A.size(s),d=i===3||i===2,p=d?[Math.ceil(A.size(e[0].dims)/4)]:e[0].dims,f=e[1].dims,h=e.length>2?e[2]:void 0,g=h?d?[Math.ceil(A.size(h.dims)/4)]:h.dims:void 0,y=f.length===0||f.length===1&&f[0]===1,_=y===!1&&f.length===1,$=Te(u),x=y&&(!d||$===4),v=x?$:1,b=x&&!d?$:1,C=M("input",d?12:i,p.length,b),T=M("scale",o,f.length),S=h?M("zero_point",d?12:i,g.length):void 0,z=Y("output",o,s.length,v),E=[C,T];S&&E.push(S);let R=[p,f];h&&R.push(g);let L=[{type:12,data:u/v},{type:12,data:r},{type:12,data:t.blockSize},...J(...R,s)],F=K=>{let X=[{name:"output_size",type:"u32"},{name:"axis",type:"u32"},{name:"block_size",type:"u32"}];return`
      ${K.registerUniforms(X).declareVariables(...E,z)}
      ${K.mainStart()}
          ${K.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let output_indices = ${z.offsetToIndices("global_idx")};

          // Set input x
          ${d?`
            let input = ${C.getByOffset("global_idx / 4")};
            let x_vec = ${a?"unpack4xI8(input)":"unpack4xU8(input)"};
            let x_value = ${v===1?"x_vec[global_idx % 4]":"x_vec"};`:`let x_value = ${C.getByOffset("global_idx")};`};

          // Set scale input
          ${y?`let scale_value= ${T.getByOffset("0")}`:_?`
            let scale_index = ${z.indicesGet("output_indices","uniforms.axis")};
            let scale_value= ${T.getByOffset("scale_index")};`:`
            var scale_indices: ${T.type.indices} = output_indices;
            let index = ${T.indicesGet("scale_indices","uniforms.axis")} / uniforms.block_size;
            ${T.indicesSet("scale_indices","uniforms.axis","index")};
            let scale_value= ${T.getByIndices("scale_indices")};`};

          // Set zero-point input
          ${S?y?d?`
                let zero_point_input = ${S.getByOffset("0")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value= zero_point_vec[0]`:`let zero_point_value = ${S.getByOffset("0")}`:_?d?`
                let zero_point_index = ${z.indicesGet("output_indices","uniforms.axis")};
                let zero_point_input = ${S.getByOffset("zero_point_index / 4")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_index % 4]`:`
                let zero_point_index = ${z.indicesGet("output_indices","uniforms.axis")};
                let zero_point_value = ${S.getByOffset("zero_point_index")};`:d?`
                let zero_point_offset = ${T.indicesToOffset("scale_indices")};
                let zero_point_input = ${S.getByOffset("zero_point_offset / 4")};
                let zero_point_vec = ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_offset % 4];`:`let zero_point_value = ${S.getByIndices("scale_indices")};`:`let zero_point_value = ${d?a?"i32":"u32":C.type.value}(0);`};
      // Compute and write output
      ${z.setByOffset("global_idx",`${z.type.value}(x_value - zero_point_value) * scale_value`)};
      }`};return{name:"DequantizeLinear",shaderCache:{hint:t.cacheKey,inputDependencies:S?["rank","rank","rank"]:["rank","rank"]},getShaderSource:F,getRunData:()=>({outputs:[{dims:s,dataType:o}],dispatchGroup:{x:Math.ceil(u/v/64),y:1,z:1},programUniforms:L})}},ff=(e,t)=>{_l(e.inputs,t),e.compute(wl(e.inputs,t))},hf=e=>me({axis:e.axis,blockSize:e.blockSize})}),bl,$l,mf,xg=U(()=>{je(),ie(),ue(),bl=(e,t,r)=>{let i=e===t,a=e<t&&r<0,s=e>t&&r>0;if(i||a||s)throw new Error("Range these inputs' contents are invalid.")},$l=(e,t,r,i)=>{let a=Math.abs(Math.ceil((t-e)/r)),s=[a],o=a,u=[{type:12,data:o},{type:i,data:e},{type:i,data:r},...J(s)],d=p=>{let f=Y("output",i,s.length),h=f.type.value,g=[{name:"outputSize",type:"u32"},{name:"start",type:h},{name:"delta",type:h}];return`
        ${p.registerUniforms(g).declareVariables(f)}
        ${p.mainStart()}
        ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        output[global_idx] = uniforms.start + ${h}(global_idx) * uniforms.delta;
      }`};return{name:"Range",shaderCache:{hint:`${i}`},getShaderSource:d,getRunData:()=>({outputs:[{dims:s,dataType:i}],dispatchGroup:{x:Math.ceil(o/64)},programUniforms:u})}},mf=e=>{let t=0,r=0,i=0;e.inputs[0].dataType===6?(t=e.inputs[0].getInt32Array()[0],r=e.inputs[1].getInt32Array()[0],i=e.inputs[2].getInt32Array()[0]):e.inputs[0].dataType===1&&(t=e.inputs[0].getFloat32Array()[0],r=e.inputs[1].getFloat32Array()[0],i=e.inputs[2].getFloat32Array()[0]),$e.webgpu.validateInputContent&&bl(t,r,i),e.compute($l(t,r,i,e.inputs[0].dataType),{inputs:[]})}}),vl,xl,gf,yf,Tg=U(()=>{ie(),oe(),ke(),ue(),vl=(e,t,r,i)=>{if(e!=="none"&&i!=="i32"&&i!=="u32"&&i!=="f32")throw new Error(`Input ${i} is not supported with reduction ${e}.`);let a=`{
                var oldValue = 0;
                loop {
                  let newValueF32 =`,s=`;
                  let newValue = bitcast<i32>(newValueF32);
                  let res = atomicCompareExchangeWeak(&${t}, oldValue, newValue);
                  if res.exchanged {
                    break;
                  }
                  oldValue = res.old_value;
                }
              }`;switch(e){case"none":return`${t}=${r};`;case"add":return i==="i32"||i==="u32"?`atomicAdd(&${t}, bitcast<${i}>(${r}));`:`
              ${a}bitcast<${i}>(oldValue) + (${r})${s}`;case"max":return i==="i32"||i==="u32"?`atomicMax(&${t}, bitcast<${i}>(${r}));`:`
                ${a}max(bitcast<f32>(oldValue), (${r}))${s}`;case"min":return i==="i32"||i==="u32"?`atomicMin(&${t}, bitcast<${i}>(${r}));`:`${a}min(bitcast<${i}>(oldValue), (${r}))${s}`;case"mul":return`${a}(bitcast<${i}>(oldValue) * (${r}))${s}`;default:throw new Error(`Reduction ${e} is not supported.`)}},xl=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r,s=1,o=Math.ceil(A.sizeToDimension(i,i.length-1)/s),u=i[i.length-1],d=A.sizeFromDimension(r,u),p=[{type:12,data:o},{type:12,data:u},{type:12,data:d},...J(e[1].dims,e[2].dims,a)],f=h=>{let g=M("indices",e[1].dataType,e[1].dims.length),y=M("updates",e[2].dataType,e[2].dims.length,s),_=t.reduction!=="none"&&t.reduction!==""?jd("output",e[0].dataType,a.length):Y("output",e[0].dataType,a.length,s);return`
      ${h.registerUniform("output_size","u32").registerUniform("last_index_dimension","u32").registerUniform("num_updates_elements","u32").declareVariables(g,y,_)}
      ${h.mainStart()}
        ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
  var data_offset = 0u;
  let indices_start = uniforms.last_index_dimension * global_idx;
  let indices_end = indices_start + uniforms.last_index_dimension;
  for (var i = indices_start; i < indices_end; i++) {
    var index = i32(indices[i].x);
    ${e[0].dims.length===1?`
    let element_count_dim = uniforms.output_strides;
    let dim_value = uniforms.output_shape;`:`
    let element_count_dim = uniforms.output_strides[i - indices_start];
    let dim_value = uniforms.output_shape[i - indices_start];`}
    if (index >= 0) {
      if (index >= i32(dim_value)) {
        index = i32(dim_value - 1);
      }
    } else {
      if (index < -i32(dim_value)) {
        index = 0;
      } else {
        index += i32(dim_value);
      }
    }
    data_offset += u32((u32(index) * element_count_dim));
  }

  for (var i = 0u; i < uniforms.num_updates_elements; i++) {
    let value = updates[uniforms.num_updates_elements * global_idx + i];
    ${vl(t.reduction,"output[data_offset + i]","value",_.type.value)}
  }

      }`};return{name:"ScatterND",shaderCache:{hint:`${t.cacheKey}_${t.reduction}`,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(o/64)},programUniforms:p}),getShaderSource:f}},gf=e=>me({reduction:e.reduction}),yf=(e,t)=>{e.compute(xl(e.inputs,t),{inputs:[e.inputs[1],e.inputs[2]],outputs:[]})}}),Tl,kl,Cl,ma,Sl,Il,El,zl,Al,Ol,Rl,Bl,ga,Ml,Nl,Dl,Pl,Ll,_f,wf,kg=U(()=>{ie(),oe(),ke(),ue(),Tl=(e,t)=>{if(e.every(r=>r>0||(()=>{throw new Error("Resize requires scales input values to be positive")})),e.length>0){if(t.mode==="linear"){if(!(e.length===2||e.length===3||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1||e.length===5&&e[0]===1&&e[1]===1))throw new Error(`For linear mode, Resize requires scales to be 2D, 3D, 4D with either two outermost or one innermost and
            one outermost scale values equal to 1, or 5D with two outermost scale values equal to 1`)}else if(t.mode==="cubic"&&!(e.length===2||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1))throw new Error("Resize requires scales input size to be 2 or 4 for cubic mode")}},kl=(e,t,r)=>{t.every(a=>a>=0&&a<r||(()=>{throw new Error("Resize requires axes input values to be positive and less than rank")}));let i=new Array(r).fill(1);return t.forEach((a,s)=>i[a]=e[s]),i},Cl=(e,t,r,i,a,s)=>{let[o,u,d]=r>10?[1,2,3]:[-1,e.length>1?1:-1,-1],p=e[0].dims.length;if(o>0&&e.length>o&&e[o].dims.length>0)e[o].getFloat32Array().forEach(f=>s.push(f));else if(t.coordinateTransformMode==="tf_crop_and_resize")throw new Error("Resize requires RoI input to be specified when coordinateTransformMode is tfCropAndResize");if(u>0&&e.length>u&&e[u].dims.length===1&&e[u].dims[0]>0){if(e[u].getFloat32Array().forEach(f=>i.push(f)),i.length!==0&&i.length!==p&&r>=18&&i.length!==t.axes.length)throw new Error("Resize requires scales input size to be same as input rank or axes size for opset 18 and up");Tl(i,t),t.axes.length>0&&kl(i,t.axes,p).forEach((f,h)=>i[h]=f)}if(d>0&&e.length>d&&e[d].dims.length===1&&e[d].dims[0]>0&&(e[d].getBigInt64Array().forEach(f=>a.push(Number(f))),a.length!==0&&a.length!==p&&r>=18&&a.length!==t.axes.length))throw new Error("Resize requires sizes input size to be same as input rank or axes size for opset 18 and up");if(t.axes.length>0){if(i.length!==0&&i.length!==t.axes.length)throw new Error('Resize requires "scales" input size to be of axes rank when axes attributes is specified');if(a.length!==0&&a.length!==t.axes.length)throw new Error('Resize requires "sizes" input size to be of rank axes rank when axes attributes is specified')}if(typeof i<"u"&&typeof a<"u"&&i.length>0&&a.length>p)throw new Error("Resize requires only of scales or sizes to be specified")},ma=(e,t,r,i)=>`
  // The whole part and the fractional part are calculated separately due to inaccuracy of floating
  // point division. As an example, f32(21) / f32(7) may evaluate to 2.99... instead of 3, causing an
  // offset-by-one error later in floor().
  let big = (${e}) * (${t});
  let whole = ${i}(big / (${r}));
  let fract = ${i}(big % (${r})) / ${i}(${r});
  return whole + fract;
`,Sl=(e,t)=>`fn getOriginalCoordinateFromResizedCoordinate(xResized: u32, xScale: f32, lengthResized: u32,
     lengthOriginal: u32, roiStart: f32, roiEnd: f32) -> ${t} { `+(()=>{switch(e){case"asymmetric":return`
          if (xScale < 1.0 || floor(xScale) != xScale) {
            return ${t}(xResized) / ${t}(xScale);
          } else {
            ${ma("xResized","lengthOriginal","lengthResized",t)}
          }
        `;case"pytorch_half_pixel":return`if (lengthResized > 1) {
                    return (${t}(xResized) + 0.5) / ${t}(xScale) - 0.5;
                  } else {
                    return 0.0;
                  }`;case"tf_half_pixel_for_nn":return`return (${t}(xResized) + 0.5) / ${t}(xScale);`;case"align_corners":return`if (lengthResized == 1) {
                    return 0.0;
                  } else {
                    ${ma("xResized","lengthOriginal - 1","lengthResized - 1",t)}
                  }`;case"tf_crop_and_resize":return`if (lengthResized > 1) {
                    return ${t}(roiStart) * ${t}(lengthOriginal - 1) +
                        (${t}(xResized) * ${t}(roiEnd - roiStart) * ${t}(lengthOriginal - 1)) /
                        ${t}(lengthResized - 1);
                  } else {
                    return 0.5 * ${t}(roiStart + roiEnd) * ${t}(lengthOriginal - 1);
                  }`;case"half_pixel_symmetric":return`const outputWidth = ${t}xScale * ${t}(lengthResized);
                  const adjustment = ${t}(lengthResized) / outputWidth;
                  const center = ${t}(lengthOriginal) / 2;
                  const offset = center * (1 - adjustment);
                  return offset + ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;case"half_pixel":return`return ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;default:throw new Error(`Coordinate transform mode ${e} is not supported`)}})()+"}",Il=(e,t,r)=>`fn getNearestPixelFromOriginal(xOriginal: ${r}, isDownSample: bool) -> ${r} {`+(()=>{switch(e){case"round_prefer_ceil":return"if (fract(xOriginal) == 0.5) {             return ceil(xOriginal);           } else {             return round(xOriginal);           }";case"floor":return"return floor(xOriginal);";case"ceil":return"return ceil(xOriginal);";case"round_prefer_floor":return"if (fract(xOriginal) == 0.5) {                     return floor(xOriginal);                   } else {                     return round(xOriginal);                   }";case"simple":default:if(t<11)return"if (isDownSample)                     {                       return ceil(xOriginal);                     } else {                       return xOriginal;                     }";throw new Error(`Nearest mode ${e} is not supported`)}})()+"}",El=(e,t,r)=>{let i=new Array(r).fill(0).concat(new Array(r).fill(1)),a=e.length===0?i:e.slice();return t.length>0?(t.forEach((s,o)=>{i[s]=a[o],i[o+r]=a[t.length+o]}),i):a},zl=(e,t,r,i)=>{let a=[];if(r.length>0)if(i.length>0){if(e.forEach(s=>a.push(s)),Math.max(...i)>e.length)throw new Error("axes is out of bound");i.forEach((s,o)=>a[s]=r[o])}else r.forEach(s=>a.push(s));else{if(t.length===0)throw new Error("Resize requires either scales or sizes.");a=e.map((s,o)=>Math.round(s*t[o]))}return a},Al=(e,t,r)=>{let i=(()=>{switch(r.keepAspectRatioPolicy){case"not_larger":return r.axes.length>0?Math.min(...r.axes.map(s=>t[s]),Number.MAX_VALUE):Math.min(...t,Number.MAX_VALUE);case"not_smaller":return r.axes.length>0?Math.max(...r.axes.map(s=>t[s]),Number.MIN_VALUE):Math.max(...t,Number.MIN_VALUE);default:throw new Error(`Keep aspect ratio policy ${r.keepAspectRatioPolicy} is not supported`)}})();t.fill(1,0,t.length);let a=e.slice();return r.axes.length>0?(r.axes.forEach(s=>t[s]=i),r.axes.forEach(s=>a[s]=Math.round(e[s]*t[s]))):(t.fill(i,0,t.length),a.forEach((s,o)=>a[o]=Math.round(s*t[o]))),a},Ol=(e,t,r,i,a)=>`
    fn calculateOriginalIndicesFromOutputIndices(output_indices: ${e.type.indices}) -> array<${e.type.value}, ${r.length}> {
      var original_indices: array<${e.type.value}, ${r.length}>;
      for (var i:u32 = 0; i < ${r.length}; i++) {
        var output_index = ${e.indicesGet("output_indices","i")};
        var scale = ${Q("uniforms.scales","i",i)};
        var roi_low = ${Q("uniforms.roi","i",a)};
        var roi_hi = ${Q("uniforms.roi",`i + ${t.length}`,a)};
        if (scale == 1.0) {
          original_indices[i] = ${e.type.value}(output_index);
        } else {
          var input_shape_i = ${Q("uniforms.input_shape","i",t.length)};
          var output_shape_i = ${Q("uniforms.output_shape","i",r.length)};
          original_indices[i] = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                           input_shape_i, roi_low, roi_hi);
        }
      }
      return original_indices;
    }`,Rl=(e,t,r,i,a,s,o)=>`
    fn calculateInputIndicesFromOutputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
      var input_indices: ${e.type.indices};
      for (var i:u32 = 0; i < ${i.length}; i++) {
        var output_index = ${t.indicesGet("output_indices","i")};
        var input_index: u32;
        var scale = ${Q("uniforms.scales","i",a)};
        if (scale == 1.0) {
          input_index = output_index;
        } else {
          var roi_low = ${Q("uniforms.roi","i",s)};
          var roi_hi = ${Q("uniforms.roi",`i + ${r.length}`,s)};
          var input_shape_i = ${Q("uniforms.input_shape","i",r.length)};
          var output_shape_i = ${Q("uniforms.output_shape","i",i.length)};
          var original_idx = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                        input_shape_i, roi_low, roi_hi);
          if (!${o} || (original_idx >= 0 && original_idx < ${t.type.value}(input_shape_i))) {
            if (original_idx < 0) {
              input_index = 0;
            } else if (original_idx > ${t.type.value}(input_shape_i - 1)) {
              input_index = input_shape_i - 1;
            } else {
              input_index = u32(getNearestPixelFromOriginal(original_idx, scale < 1));
            }
          } else {
            input_index = u32(original_idx);
          }
        }
        ${e.indicesSet("input_indices","i","input_index")}
      }
      return input_indices;
    }`,Bl=(e,t)=>`
    fn checkInputIndices(input_indices: ${e.type.indices}) -> bool {
      for (var i:u32 = 0; i < ${t.length}; i++) {
        var input_index = ${e.indicesGet("input_indices","i")};
        if (input_index < 0 || input_index >= ${Q("uniforms.input_shape","i",t.length)}) {
          return false;
        }
      }
      return true;
    }`,ga=(e,t,r,i)=>e.rank>i?`
    ${e.indicesSet("input_indices",t,"channel")};
    ${e.indicesSet("input_indices",r,"batch")};
`:"",Ml=(e,t,r,i,a)=>{let[s,o,u,d]=r.length===2?[-1,0,1,-1]:[0,2,3,1],p=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, row: u32, col: u32) -> ${p} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",o,`max(0, min(row, ${r[o]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(col, ${r[u]} - 1))`)};
      ${ga(e,d,s,2)}
      return ${e.getByIndices("input_indices")};
    }

    fn bilinearInterpolation(output_indices: ${t.type.indices}) -> ${p} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var row:${p} = originalIndices[${o}];
      var col:${p} = originalIndices[${u}];
      ${i?`if (row < 0 || row > (${r[o]} - 1) || col < 0 || col > (${r[u]} - 1)) {
        return ${a};
      }`:""};
      row = max(0, min(row, ${r[o]} - 1));
      col = max(0, min(col, ${r[u]} - 1));
      var row1: u32 = u32(row);
      var col1: u32 = u32(col);
      var row2: u32 = u32(row + 1);
      var col2: u32 = u32(col + 1);
      var channel: u32 = ${r.length>2?`u32(originalIndices[${d}])`:"0"};
      var batch: u32 =  ${r.length>2?`u32(originalIndices[${s}])`:"0"};
      var x11: ${p} = getInputValue(batch, channel, row1, col1);
      var x12: ${p} = getInputValue(batch, channel, row1, col2);
      var x21: ${p} = getInputValue(batch, channel, row2, col1);
      var x22: ${p} = getInputValue(batch, channel, row2, col2);
      var dx1: ${p} = abs(row - ${p}(row1));
      var dx2: ${p} = abs(${p}(row2) - row);
      var dy1: ${p} = abs(col - ${p}(col1));
      var dy2: ${p} = abs(${p}(col2) - col);
      if (row1 == row2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (col1 == col2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      return (x11 * dx2 * dy2 + x12 * dx2 * dy1 + x21 * dx1 * dy2 + x22 * dx1 * dy1);
    }`},Nl=(e,t,r,i,a,s,o,u,d,p)=>{let f=r.length===2,[h,g]=f?[0,1]:[2,3],y=e.type.value,_=$=>{let x=$===h?"row":"col";return`
      fn ${x}CubicInterpolation(input_indices: ${e.type.indices}, output_indices: ${t.type.indices}) -> ${y} {
        var output_index = ${t.indicesGet("output_indices",$)};
        var originalIdx: ${y} = getOriginalCoordinateFromResizedCoordinate(output_index, ${a[$]},
        ${i[$]}, ${r[$]}, ${s[$]}, ${s[$]} + ${r.length});
        var fractOriginalIdx: ${y} = originalIdx - floor(originalIdx);
        var coefs = getCubicInterpolationCoefs(fractOriginalIdx);

        if (${u} && (originalIdx < 0 || originalIdx > (${r[$]} - 1))) {
          return ${d};
        }
        var data: array<${y}, 4> = array<${y}, 4>(0.0, 0.0, 0.0, 0.0);
        for (var i: i32 = -1; i < 3; i++) {
          var ${x}: ${y} = originalIdx + ${y}(i);
          if (${x} < 0 || ${x} >= ${r[$]}) {
            ${p?`coefs[i + 1] = 0.0;
                        continue;`:u?`return ${d};`:`${x} = max(0, min(${x}, ${r[$]} - 1));`};
          }
        var input_indices_copy: ${e.type.indices} = input_indices;
          ${e.indicesSet("input_indices_copy",$,`u32(${x})`)};
          data[i + 1] = ${$===h?e.getByIndices("input_indices_copy"):"rowCubicInterpolation(input_indices_copy, output_indices)"};
        }
        return cubicInterpolation1D(data, coefs);
      }`};return`
    ${_(h)};
    ${_(g)};
  fn getCubicInterpolationCoefs(s: ${y}) -> array<${y}, 4> {
    var absS = abs(s);
    var coeffs: array<${y}, 4> = array<${y}, 4>(0.0, 0.0, 0.0, 0.0);
    var oneMinusAbsS: ${y} = 1.0 - absS;
    var twoMinusAbsS: ${y} = 2.0 - absS;
    var onePlusAbsS: ${y} = 1.0 + absS;
    coeffs[0] = ((${o} * onePlusAbsS - 5 * ${o}) * onePlusAbsS + 8 * ${o}) * onePlusAbsS - 4 * ${o};
    coeffs[1] = ((${o} + 2) * absS - (${o} + 3)) * absS * absS + 1;
    coeffs[2] = ((${o} + 2) * oneMinusAbsS - (${o} + 3)) * oneMinusAbsS * oneMinusAbsS + 1;
    coeffs[3] = ((${o} * twoMinusAbsS - 5 * ${o}) * twoMinusAbsS + 8 * ${o}) * twoMinusAbsS - 4 * ${o};
    return coeffs;
  }

  fn cubicInterpolation1D(x: array<${y}, 4>, coefs: array<${y}, 4>) -> ${y} {
    var coefsSum: ${y} = coefs[0] + coefs[1] + coefs[2] + coefs[3];
    return (x[0] * coefs[0] + x[1] * coefs[1]+ x[2] * coefs[2]+ x[3] * coefs[3]) / coefsSum;
  }

  fn bicubicInterpolation(output_indices: ${t.type.indices}) -> ${y} {
    var input_indices: ${e.type.indices} = output_indices;
    return colCubicInterpolation(input_indices, output_indices);
  }
    `},Dl=(e,t,r,i,a)=>{let[s,o,u,d,p]=r.length===3?[-1,0,1,2,-1]:[0,2,3,4,1],f=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, depth:u32, height: u32, width: u32) -> ${f} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",o,`max(0, min(depth, ${r[o]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(height, ${r[u]} - 1))`)};
      ${e.indicesSet("input_indices",d,`max(0, min(width, ${r[d]} - 1))`)};
      ${ga(e,p,s,3)}
      return ${e.getByIndices("input_indices")};
    }

    fn trilinearInterpolation(output_indices: ${t.type.indices}) -> ${f} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var depth:${f} = originalIndices[${o}];
      var height:${f} = originalIndices[${u}];
      var width:${f} = originalIndices[${d}];
      ${i?`if (depth < 0 || depth > (${r[o]} - 1) || height < 0 || height > (${r[u]} - 1) || width < 0 || (width > ${r[d]} - 1)) {
      return ${a};
        }`:""};

    depth = max(0, min(depth, ${r[o]} - 1));
      height = max(0, min(height, ${r[u]} - 1));
      width = max(0, min(width, ${r[d]} - 1));
      var depth1: u32 = u32(depth);
      var height1: u32 = u32(height);
      var width1: u32 = u32(width);
      var depth2: u32 = u32(depth + 1);
      var height2: u32 = u32(height + 1);
      var width2: u32 = u32(width + 1);
      var channel: u32 = ${r.length>3?`u32(originalIndices[${p}])`:"0"};
      var batch: u32 =  ${r.length>3?`u32(originalIndices[${s}])`:"0"};

      var x111: ${f} = getInputValue(batch, channel, depth1, height1, width1);
      var x112: ${f} = getInputValue(batch, channel, depth1, height1, width2);
      var x121: ${f} = getInputValue(batch, channel, depth1, height2, width1);
      var x122: ${f} = getInputValue(batch, channel, depth1, height2, width2);
      var x211: ${f} = getInputValue(batch, channel, depth2, height1, width1);
      var x212: ${f} = getInputValue(batch, channel, depth2, height1, width2);
      var x221: ${f} = getInputValue(batch, channel, depth2, height2, width1);
      var x222: ${f} = getInputValue(batch, channel, depth2, height2, width2);
      var dx1: ${f} = abs(depth - ${f}(depth1));
      var dx2: ${f} = abs(${f}(depth2) - depth);
      var dy1: ${f} = abs(height - ${f}(height1));
      var dy2: ${f} = abs(${f}(height2) - height);
      var dz1: ${f} = abs(width - ${f}(width1));
      var dz2: ${f} = abs(${f}(width2) - width);
      if (depth1 == depth2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (height1 == height2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      if (width1 == width2) {
        dz1 = 0.5;
        dz2 = 0.5;
      }
      return (x111 * dx2 * dy2 * dz2 + x112 * dx2 * dy2 * dz1 + x121 * dx2 * dy1 *dz2 + x122 * dx2 * dy1 * dz1 +
              x211 * dx1 * dy2 * dz2 + x212 * dx1 * dy2 * dz1 + x221 * dx1 * dy1 *dz2 + x222 * dx1 * dy1 * dz1);
    }`},Pl=(e,t,r,i,a,s)=>{let o=e.dims,u=El(s,t.axes,o.length),d=zl(o,i,a,t.axes),p=i.slice();i.length===0&&(p=o.map((b,C)=>b===0?1:d[C]/b),t.keepAspectRatioPolicy!=="stretch"&&(d=Al(o,p,t)));let f=Y("output",e.dataType,d.length),h=M("input",e.dataType,o.length),g=A.size(d),y=o.length===d.length&&o.every((b,C)=>b===d[C]),_=t.coordinateTransformMode==="tf_crop_and_resize",$=t.extrapolationValue,x=h.type.value,v=b=>`
      ${y?"":`
      ${Sl(t.coordinateTransformMode,x)};
      ${(()=>{switch(t.mode){case"nearest":return`
              ${Bl(h,o)};
              ${Il(t.nearestMode,r,x)};
              ${Rl(h,f,o,d,p.length,u.length,_)};
              `;case"linear":return`
              ${Ol(f,o,d,p.length,u.length)};
              ${(()=>{if(o.length===2||o.length===4)return`${Ml(h,f,o,_,$)}`;if(o.length===3||o.length===5)return`${Dl(h,f,o,_,$)}`;throw Error("Linear mode only supports input dims 2, 3, 4 and 5 are supported in linear mode.")})()};
            `;case"cubic":return`
            ${(()=>{if(o.length===2||o.length===4)return`${Nl(h,f,o,d,p,u,t.cubicCoeffA,_,t.extrapolationValue,t.excludeOutside)}`;throw Error("Cubic mode only supports input dims 2 and 4 are supported in linear mode.")})()};
            `;default:throw Error("Invalid resize mode")}})()};
      `}
      ${b.registerUniform("output_size","u32").registerUniform("scales","f32",p.length).registerUniform("roi","f32",u.length).declareVariables(h,f)}
      ${b.mainStart()}
        ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
        ${y?"output[global_idx] = input[global_idx];":`
        let output_indices = ${f.offsetToIndices("global_idx")};
        var input_indices: ${h.type.indices};
        ${(()=>{switch(t.mode){case"nearest":return`input_indices = calculateInputIndicesFromOutputIndices(output_indices);
                if (checkInputIndices(input_indices)) {
                  output[global_idx] = ${h.getByIndices("input_indices")};
                } else {
                  output[global_idx] = ${t.extrapolationValue};
                }`;case"linear":return`output[global_idx] = ${o.length===2||o.length===4?"bilinearInterpolation":"trilinearInterpolation"}(output_indices);`;case"cubic":return"output[global_idx] = bicubicInterpolation(output_indices);";default:throw Error(`Unsupported resize mode: ${t.mode}`)}})()};
`}
      }`;return{name:"Resize",shaderCache:{hint:`${t.cacheKey}|${r}|${p.length>0?t.mode==="cubic"?p:p.length:""}|${a.length>0?a:""}|${u.length>0?u:""}|${y}|${t.mode==="nearest"?o.length:o}`,inputDependencies:["rank"]},getShaderSource:v,getRunData:()=>({outputs:[{dims:d,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:[{type:12,data:g},{type:1,data:p},{type:1,data:u},...J(o,d)]})}},Ll=e=>{let t=e.customDataBuffer;return new Uint32Array(t,t.byteOffset,1)[0]},_f=(e,t)=>{let r=[],i=[],a=[],s=Ll(e);if(t.antialias!==0)throw Error("Only default value (0) for Antialias attribute is supported");Cl(e.inputs,t,s,r,i,a),e.compute(Pl(e.inputs[0],t,s,r,i,a),{inputs:[0]})},wf=e=>{let t=e.antialias,r=e.axes,i=e.coordinateTransformMode,a=e.cubicCoeffA,s=e.excludeOutside!==0,o=e.extrapolationValue,u=e.keepAspectRatioPolicy,d=e.mode,p=e.nearestMode===""?"simple":e.nearestMode;return me({antialias:t,axes:r,coordinateTransformMode:i,cubicCoeffA:a,excludeOutside:s,extrapolationValue:o,keepAspectRatioPolicy:u,mode:d,nearestMode:p})}}),Ul,Wl,bf,Cg=U(()=>{ie(),oe(),ue(),Ul=e=>{if(!e||e.length<3)throw new Error("layerNorm requires at least 3 inputs.");let t=e[0],r=e[1],i=e[2];if(t.dataType!==r.dataType||t.dataType!==i.dataType)throw new Error("All inputs must have the same data type");if(t.dims.length!==3&&t.dims.length!==2)throw new Error("Input must be 2D or 3D");if(r.dims.length!==3&&r.dims.length!==2)throw new Error("Skip must be 2D or 3D");let a=t.dims[t.dims.length-1],s=t.dims[t.dims.length-2];if(r.dims[r.dims.length-1]!==a)throw new Error("Skip must have the same hidden size as input");if(r.dims[r.dims.length-2]!==s)throw new Error("Skip must have the same sequence length as input");if(i.dims.length!==1)throw new Error("Gamma must be 1D");if(i.dims[i.dims.length-1]!==a)throw new Error("Gamma must have the same hidden size as input");if(e.length>3){let o=e[3];if(o.dims.length!==1)throw new Error("Beta must be 1D");if(o.dims[o.dims.length-1]!==a)throw new Error("Beta must have the same hidden size as input")}if(e.length>4){let o=e[4];if(o.dims.length!==1)throw new Error("Bias must be 1D");if(o.dims[o.dims.length-1]!==a)throw new Error("Bias must have the same hidden size as input")}},Wl=(e,t,r,i)=>{let a=t.simplified,s=e[0].dims,o=A.size(s),u=s,d=o,p=s.slice(-1)[0],f=i?s.slice(0,-1).concat(1):[],h=!a&&e.length>3,g=e.length>4,y=i&&r>1,_=i&&r>2,$=r>3,x=64,v=Te(p),b=[{type:12,data:d},{type:12,data:v},{type:12,data:p},{type:1,data:t.epsilon}],C=S=>{let z=[{name:"output_size",type:"u32"},{name:"components",type:"u32"},{name:"hidden_size",type:"u32"},{name:"epsilon",type:"f32"}],E=[M("x",e[0].dataType,e[0].dims,v),M("skip",e[1].dataType,e[1].dims,v),M("gamma",e[2].dataType,e[2].dims,v)];h&&E.push(M("beta",e[3].dataType,e[3].dims,v)),g&&E.push(M("bias",e[4].dataType,e[4].dims,v)),E.push(Y("output",e[0].dataType,u,v)),y&&E.push(Y("mean_output",1,f)),_&&E.push(Y("inv_std_output",1,f)),$&&E.push(Y("input_skip_bias_sum",e[0].dataType,u,v));let R=Ee(e[0].dataType),L=Ee(1,v);return`

      ${S.registerUniforms(z).declareVariables(...E)}
      var<workgroup> sum_shared : array<${L}, ${x}>;
      var<workgroup> sum_squared_shared : array<${L}, ${x}>;

      ${S.mainStart([x,1,1])}
        let ix = local_id.x;
        let iy = global_id.x / ${x};

        let hidden_size_vectorized: u32 = uniforms.hidden_size / uniforms.components;
        var stride = hidden_size_vectorized / ${x};
        let offset = ix * stride + iy * hidden_size_vectorized;
        let offset1d = stride * ix;
        if (ix == ${x-1}) {
          stride = hidden_size_vectorized - stride * ix;
        }
        for (var i: u32 = 0; i < stride; i++) {
          let skip_value = skip[offset + i];
          let bias_value = ${g?"bias[offset1d + i]":R+"(0.0)"};
          let input_value = x[offset + i];
          let value = input_value + skip_value + bias_value;
          ${$?"input_skip_bias_sum[offset + i] = value;":""}
          output[offset + i] = value;
          let f32_value = ${jt(R,v,"value")};
          sum_shared[ix] += f32_value;
          sum_squared_shared[ix] += f32_value * f32_value;
        }
        workgroupBarrier();

        var reduce_size : u32 = ${x};
        for (var curr_size = reduce_size >> 1;  curr_size > 0; curr_size = reduce_size >> 1) {
          reduce_size = curr_size + (reduce_size & 1);
          if (ix < curr_size) {
            sum_shared[ix] += sum_shared[ix + reduce_size];
            sum_squared_shared[ix] += sum_squared_shared[ix + reduce_size];
          }
          workgroupBarrier();
        }

        let sum = sum_shared[0];
        let square_sum = sum_squared_shared[0];
        let mean = ${bt("sum",v)} / f32(uniforms.hidden_size);
        let inv_std_dev = inverseSqrt(${bt("square_sum",v)} / f32(uniforms.hidden_size) ${a?"":"- mean * mean"} + uniforms.epsilon);
        ${y?"mean_output[global_idx] = mean;":""}
        ${_?"inv_std_output[global_idx] = inv_std_dev;":""}

        for (var i: u32 = 0; i < stride; i++) {
          output[offset + i] = (output[offset + i] ${a?"":`- ${R}(mean)`}) *
            ${R}(inv_std_dev) * gamma[offset1d + i]
            ${h?"+ beta[offset1d + i]":""};
        }
      }`},T=[{dims:u,dataType:e[0].dataType}];return r>1&&T.push({dims:f,dataType:1}),r>2&&T.push({dims:f,dataType:1}),r>3&&T.push({dims:s,dataType:e[0].dataType}),{name:"SkipLayerNormalization",shaderCache:{hint:`${v};${y};${_};${$}`,inputDependencies:e.map((S,z)=>"type")},getShaderSource:C,getRunData:()=>({outputs:T,dispatchGroup:{x:Math.ceil(d/p)},programUniforms:b})}},bf=(e,t)=>{Ul(e.inputs);let r=[0];e.outputCount>1&&r.push(-3),e.outputCount>2&&r.push(-3),e.outputCount>3&&r.push(3),e.compute(Wl(e.inputs,t,e.outputCount,!1),{outputs:r})}}),ql,li,Fl,ya,jl,Vl,$f,vf,Sg=U(()=>{ie(),oe(),ke(),ue(),ql=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");if(t.axes.length!==0){if(t.axes.length!==t.starts.length||t.axes.length!==t.ends.length)throw new Error("axes, starts and ends must have the same length")}else if(t.starts.length!==t.ends.length)throw new Error("starts and ends must have the same length");e.slice(1).forEach((r,i)=>{if(e[i+1].dataType!==6&&e[i+1].dataType!==7)throw new Error(`Input ${i} must be an array of int32 or int64`)})},li=(e,t)=>{let r=[];if(e.length>t)if(e[t].dataType===7)e[t].getBigInt64Array().forEach(i=>r.push(Number(i)));else if(e[t].dataType===6)e[t].getInt32Array().forEach(i=>r.push(Number(i)));else throw new Error(`Input ${t} must be an array of int32 or int64`);return r},Fl=(e,t)=>{if(e.length>1){let r=li(e,1),i=li(e,2),a=li(e,3);return a.length===0&&(a=[...Array(e[0].dims.length).keys()]),me({starts:r,ends:i,axes:a})}else return t},ya=(e,t,r,i,a)=>{let s=e;return e<0&&(s+=r[i[t]]),a[t]<0?Math.max(0,Math.min(s,r[i[t]]-1)):Math.max(0,Math.min(s,r[i[t]]))},jl=(e,t,r)=>`fn calculateInputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
          var input_indices: ${e.type.indices};
          var carry = 0u;
          for (var i = ${r.length-1}; i >= 0; i--) {
            let input_shape_i = ${Q("uniforms.input_shape","i",r.length)};
            let steps_i = ${Q("uniforms.steps","i",r.length)};
            let signs_i = ${Q("uniforms.signs","i",r.length)};
            let starts_i = ${Q("uniforms.starts","i",r.length)};
            var output_index = ${t.indicesGet("output_indices","i")};
            var input_index = output_index * steps_i + starts_i + carry;
            carry = input_index / input_shape_i;
            input_index = input_index % input_shape_i;
            if (signs_i < 0) {
              input_index = input_shape_i - input_index - 1u + starts_i;
            }
            ${e.indicesSet("input_indices","i","input_index")};
          }
          return input_indices;
      }`,Vl=(e,t)=>{let r=e[0].dims,i=A.size(r),a=t.axes.length>0?A.normalizeAxes(t.axes,r.length):[...Array(r.length).keys()],s=li(e,4);s.forEach(v=>v!==0||(()=>{throw new Error("step cannot be 0")})),s.length===0&&(s=Array(a.length).fill(1));let o=t.starts.map((v,b)=>ya(v,b,r,a,s)),u=t.ends.map((v,b)=>ya(v,b,r,a,s));if(a.length!==o.length||a.length!==u.length)throw new Error("start, ends and axes should have the same number of elements");if(a.length!==r.length)for(let v=0;v<r.length;++v)a.includes(v)||(o.splice(v,0,0),u.splice(v,0,r[v]),s.splice(v,0,1));let d=s.map(v=>Math.sign(v));s.forEach((v,b,C)=>{if(v<0){let T=(u[b]-o[b])/v,S=o[b],z=S+T*s[b];o[b]=z,u[b]=S,C[b]=-v}});let p=r.slice(0);a.forEach((v,b)=>{p[v]=Math.ceil((u[v]-o[v])/s[v])});let f={dims:p,dataType:e[0].dataType},h=Y("output",e[0].dataType,p.length),g=M("input",e[0].dataType,e[0].dims.length),y=A.size(p),_=[{name:"outputSize",type:"u32"},{name:"starts",type:"u32",length:o.length},{name:"signs",type:"i32",length:d.length},{name:"steps",type:"u32",length:s.length}],$=[{type:12,data:y},{type:12,data:o},{type:6,data:d},{type:12,data:s},...J(e[0].dims,p)],x=v=>`
      ${v.registerUniforms(_).declareVariables(g,h)}
        ${jl(g,h,r)}
        ${v.mainStart()}
          ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
          let output_indices = ${h.offsetToIndices("global_idx")};
          let input_indices = calculateInputIndices(output_indices);
          ${h.setByOffset("global_idx",g.getByIndices("input_indices"))}
      }`;return{name:"Slice",shaderCache:{hint:`${d.length}_${o.length}_${s.length}`,inputDependencies:["rank"]},getShaderSource:x,getRunData:()=>({outputs:[f],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:$})}},$f=(e,t)=>{ql(e.inputs,t);let r=Fl(e.inputs,t);e.compute(Vl(e.inputs,r),{inputs:[0]})},vf=e=>{let t=e.starts,r=e.ends,i=e.axes;return me({starts:t,ends:r,axes:i})}}),Gl,Hl,xf,Tf,Ig=U(()=>{ie(),oe(),ke(),$t(),ue(),Gl=e=>{if(!e||e.length!==1)throw new Error("Softmax op requires 1 input.")},Hl=(e,t)=>{let r=e.inputs[0],i=r.dims,a=A.size(i),s=i.length,o=A.normalizeAxis(t.axis,s),u=o<i.length-1,d,p=[];u?(p=Array.from({length:s},(E,R)=>R),p[o]=s-1,p[s-1]=o,d=e.compute(We(r,p),{inputs:[r],outputs:[-1]})[0]):d=r;let f=d.dims,h=f[s-1],g=a/h,y=Te(h),_=h/y,$=64;g===1&&($=256);let x=(E,R)=>R===4?`max(max(${E}.x, ${E}.y), max(${E}.z, ${E}.w))`:R===2?`max(${E}.x, ${E}.y)`:R===3?`max(max(${E}.x, ${E}.y), ${E}.z)`:E,v=M("x",d.dataType,d.dims,y),b=Y("result",d.dataType,d.dims,y),C=v.type.value,T=Ee(d.dataType)==="f32"?`var threadMax = ${C}(-3.402823e+38f);`:`var threadMax = ${C}(-65504.0h);`,S=E=>`
      var<workgroup> rowMaxShared : ${C};
      var<workgroup> rowSumShared : ${C};
      var<workgroup> threadShared : array<${C}, ${$}>;

      fn getValue(row: i32, col: i32, row_stride: i32) -> ${C} {
        let index = row * row_stride + col;
        return x[index];
      }

      fn setValue(row: i32, col: i32, row_stride: i32, value: ${C}) {
        let index = row * row_stride + col;
        result[index] = value;
      }
      ${E.registerUniform("packedCols","i32").declareVariables(v,b)}
      ${E.mainStart($)}
        let gindex = i32(global_idx);
        let lindex = i32(local_idx);
        const wg = ${$};
        let row = gindex / wg;
        let cols = uniforms.packedCols;
        let row_stride : i32 = uniforms.packedCols;

        // find the rows max
        ${T}
        for (var col = lindex; col < cols; col += wg) {
          let value = getValue(row, col, row_stride);
          threadMax = max(threadMax, value);
        }
        if (lindex < cols) {
          threadShared[lindex] = threadMax;
        }
        workgroupBarrier();

        var reduceSize = min(cols, wg);
        for (var currSize = reduceSize >> 1;  currSize > 0; currSize = reduceSize >> 1) {
          reduceSize = currSize + (reduceSize & 1);
          if (lindex < currSize) {
            threadShared[lindex] = max(threadShared[lindex], threadShared[lindex + reduceSize]);
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowMaxShared = ${C}(${x("threadShared[0]",y)});
        }
        workgroupBarrier();

        // find the rows sum
        var threadSum = ${C}(0.0);
        for (var col = lindex; col < cols; col += wg) {
          let subExp = exp(getValue(row, col, row_stride) - rowMaxShared);
          threadSum += subExp;
        }
        threadShared[lindex] = threadSum;
        workgroupBarrier();

        for (var currSize = wg >> 1;  currSize > 0; currSize = currSize >> 1) {
          if (lindex < currSize) {
            threadShared[lindex] = threadShared[lindex] + threadShared[lindex + currSize];
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowSumShared = ${C}(${bt("threadShared[0]",y)});
        }
        workgroupBarrier();

        // calculate final value for each element in the row
        for (var col = lindex; col < cols; col += wg) {
          var value = exp(getValue(row, col, row_stride) - rowMaxShared) / rowSumShared;
          // max operation protects against NaN since all values should be >=0
          value = max(value, ${C}(0.0));
          setValue(row, col, row_stride, value);
        }
      }`,z=e.compute({name:"Softmax",shaderCache:{hint:`${y};${$}`,inputDependencies:["type"]},getRunData:()=>({outputs:[{dims:f,dataType:d.dataType}],dispatchGroup:{x:g},programUniforms:[{type:6,data:_}]}),getShaderSource:S},{inputs:[d],outputs:[u?-1:0]})[0];u&&e.compute(We(z,p),{inputs:[z]})},xf=(e,t)=>{Gl(e.inputs),Hl(e,t)},Tf=e=>me({axis:e.axis})}),_a,Kl,Zl,Yl,kf,Eg=U(()=>{ie(),oe(),ue(),_a=e=>Array.from(e.getBigInt64Array(),Number),Kl=e=>{if(!e||e.length!==2)throw new Error("Tile requires 2 inputs.");if(e[0].dataType!==1&&e[0].dataType!==10&&e[0].dataType!==6&&e[0].dataType!==12)throw new Error("Tile only support float, float16, int32, and uint32 data types");if(e[1].dataType!==7)throw new Error("Tile `repeats` input should be of int64 data type");if(e[1].dims.length!==1)throw new Error("Tile `repeats` input should be 1-D");if(_a(e[1]).length!==e[0].dims.length)throw new Error("Tile `repeats` input should have same number of elements as rank of input data tensor")},Zl=(e,t)=>{let r=[];for(let i=0;i<e.length;++i)r.push(e[i]*t[i]);return r},Yl=(e,t)=>{let r=e[0].dims,i=t??_a(e[1]),a=Zl(r,i),s=A.size(a),o=e[0].dataType,u=M("input",o,r.length),d=Y("output",o,a.length),p=f=>`
      const inputShape = ${u.indices(...r)};
      ${f.registerUniform("output_size","u32").declareVariables(u,d)}
      ${f.mainStart()}
      ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let output_indices = ${d.offsetToIndices("global_idx")};
      var input_indices: ${u.type.indices};
      for (var i = 0; i < ${r.length}; i++) {
        let input_dim_i = ${u.indicesGet("uniforms.input_shape","i")};
        let input_dim_value = ${d.indicesGet("output_indices","i")}  % input_dim_i;

        ${u.indicesSet("input_indices","i","input_dim_value")}
      }
      ${d.setByOffset("global_idx",u.getByIndices("input_indices"))}
    }`;return{name:"Tile",shaderCache:{hint:`${i}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:[{type:12,data:s},...J(e[0].dims,a)]}),getShaderSource:p}},kf=e=>{Kl(e.inputs),e.compute(Yl(e.inputs),{inputs:[0]})}}),Xl,Ql,Cf,zg=U(()=>{ie(),oe(),ue(),Xl=(e,t,r,i,a)=>{let s=Y("output_data",a,r.length,4),o=M("a_data",t[1].dataType,t[1].dims.length,4),u=M("b_data",t[2].dataType,t[2].dims.length,4),d=M("c_data",t[0].dataType,t[0].dims.length,4),p,f=(h,g,y)=>`select(${g}, ${h}, ${y})`;if(!i)p=s.setByOffset("global_idx",f(o.getByOffset("global_idx"),u.getByOffset("global_idx"),d.getByOffset("global_idx")));else{let h=(g,y,_="")=>{let $=`a_data[index_a${y}][component_a${y}]`,x=`b_data[index_b${y}][component_b${y}]`,v=`bool(c_data[index_c${y}] & (0xffu << (component_c${y} * 8)))`;return`
            let output_indices${y} = ${s.offsetToIndices(`global_idx * 4u + ${y}u`)};
            let offset_a${y} = ${o.broadcastedIndicesToOffset(`output_indices${y}`,s)};
            let offset_b${y} = ${u.broadcastedIndicesToOffset(`output_indices${y}`,s)};
            let offset_c${y} = ${d.broadcastedIndicesToOffset(`output_indices${y}`,s)};
            let index_a${y} = offset_a${y} / 4u;
            let index_b${y} = offset_b${y} / 4u;
            let index_c${y} = offset_c${y} / 4u;
            let component_a${y} = offset_a${y} % 4u;
            let component_b${y} = offset_b${y} % 4u;
            let component_c${y} = offset_c${y} % 4u;
            ${g}[${y}] = ${_}(${f($,x,v)});
          `};a===9?p=`
            var data = vec4<u32>(0);
            ${h("data",0,"u32")}
            ${h("data",1,"u32")}
            ${h("data",2,"u32")}
            ${h("data",3,"u32")}
            output_data[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:p=`
            ${h("output_data[global_idx]",0)}
            ${h("output_data[global_idx]",1)}
            ${h("output_data[global_idx]",2)}
            ${h("output_data[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(d,o,u,s)}
        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${p}
      }`},Ql=e=>{let t=e[1].dims,r=e[2].dims,i=e[0].dims,a=e[1].dataType,s=!(A.areEqual(t,r)&&A.areEqual(r,i)),o=t,u=A.size(t);if(s){let p=Vt.calcShape(Vt.calcShape(t,r,!1),i,!1);if(!p)throw new Error("Can't perform where op on the given tensors");o=p,u=A.size(o)}let d=Math.ceil(u/4);return{name:"Where",shaderCache:{inputDependencies:["rank","rank","rank"]},getShaderSource:p=>Xl(p,e,o,s,a),getRunData:()=>({outputs:[{dims:o,dataType:a}],dispatchGroup:{x:Math.ceil(u/64/4)},programUniforms:[{type:12,data:d},...J(i,t,r,o)]})}},Cf=e=>{e.compute(Ql(e.inputs))}}),Sf,Ag=U(()=>{Vm(),tn(),Gm(),Hm(),Km(),Zm(),Ym(),tg(),rg(),ag(),ng(),sg(),og(),ug(),lg(),dg(),pg(),cg(),fg(),hg(),mg(),gg(),yg(),_g(),wg(),Vc(),bg(),$g(),vg(),xg(),Tg(),en(),kg(),Yc(),Cg(),Sg(),Ig(),Kc(),Eg(),$t(),rn(),zg(),Sf=new Map([["Abs",[wp]],["Acos",[bp]],["Acosh",[$p]],["Add",[tc]],["ArgMax",[mp,za]],["ArgMin",[hp,za]],["Asin",[vp]],["Asinh",[xp]],["Atan",[Tp]],["Atanh",[kp]],["Attention",[gp]],["AveragePool",[sf,nf]],["BatchNormalization",[yp]],["BiasAdd",[_p]],["BiasSplitGelu",[ec]],["Cast",[Sp,Cp]],["Ceil",[Ep]],["Clip",[Ip]],["Concat",[pc,cc]],["Conv",[Na,Ma]],["ConvTranspose",[vc,$c]],["Cos",[zp]],["Cosh",[Ap]],["CumSum",[xc,Tc]],["DepthToSpace",[kc,Cc]],["DequantizeLinear",[ff,hf]],["Div",[ic]],["Einsum",[Sc,Ic]],["Elu",[Op,hi]],["Equal",[rc]],["Erf",[Rp]],["Exp",[Bp]],["Expand",[Ec]],["FastGelu",[zc]],["Floor",[Mp]],["FusedConv",[Na,Ma]],["Gather",[Oc,Ac]],["GatherElements",[Pc,Dc]],["GatherBlockQuantized",[Mc,Nc]],["GatherND",[Rc,Bc]],["Gelu",[Np]],["Gemm",[Uc,Lc]],["GlobalAveragePool",[uf,of]],["GlobalMaxPool",[cf,pf]],["Greater",[oc]],["GreaterOrEqual",[lc]],["GridSample",[Wc,qc]],["GroupQueryAttention",[Xc]],["HardSigmoid",[jp,Fp]],["InstanceNormalization",[Qc]],["LayerNormalization",[Jc]],["LeakyRelu",[Dp,hi]],["Less",[uc]],["LessOrEqual",[dc]],["Log",[Qp]],["MatMul",[ef]],["MatMulNBits",[tf,rf]],["MaxPool",[lf,df]],["Mul",[ac]],["MultiHeadAttention",[jc,Fc]],["Neg",[Lp]],["Not",[Pp]],["Pad",[af]],["Pow",[nc]],["QuickGelu",[Jp,hi]],["Range",[mf]],["Reciprocal",[Up]],["ReduceMin",[lp]],["ReduceMean",[ap]],["ReduceMax",[up]],["ReduceSum",[pp]],["ReduceProd",[dp]],["ReduceL1",[np]],["ReduceL2",[sp]],["ReduceLogSum",[fp]],["ReduceLogSumExp",[op]],["ReduceSumSquare",[cp]],["Relu",[Wp]],["Resize",[_f,wf]],["RotaryEmbedding",[Zc]],["ScatterND",[yf,gf]],["Sigmoid",[qp]],["Sin",[Vp]],["Sinh",[Gp]],["Slice",[$f,vf]],["SkipLayerNormalization",[bf]],["Split",[Gc,Hc]],["Sqrt",[Hp]],["Softmax",[xf,Tf]],["Sub",[sc]],["Tan",[Kp]],["Tanh",[Zp]],["ThresholdedRelu",[Xp,hi]],["Tile",[kf]],["Transpose",[Gd,Hd]],["Where",[Cf]]])}),If,Og=U(()=>{je(),dt(),ue(),If=class{constructor(e){this.backend=e,this.repo=new Map,this.attributesBound=!1}getArtifact(e){return this.repo.get(e)}setArtifact(e,t){this.repo.set(e,t)}run(e,t,r,i,a){rt(e.programInfo.name);let s=this.backend.device,o=this.backend.getComputePassEncoder();this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2);let u=[];for(let p of t)u.push({binding:u.length,resource:{buffer:p.buffer}});for(let p of r)u.push({binding:u.length,resource:{buffer:p.buffer}});a&&u.push({binding:u.length,resource:a});let d=s.createBindGroup({layout:e.computePipeline.getBindGroupLayout(0),entries:u,label:e.programInfo.name});if(this.backend.sessionStatus==="capturing"){let p={kernelId:this.backend.currentKernelId,computePipeline:e.computePipeline,bindGroup:d,dispatchGroup:i};this.backend.capturedCommandList.get(this.backend.currentSessionId).push(p)}o.setPipeline(e.computePipeline),o.setBindGroup(0,d),o.dispatchWorkgroups(...i),this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2+1),this.backend.pendingDispatchNumber++,(this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber||this.backend.queryType==="at-passes")&&this.backend.endComputePass(),this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber&&this.backend.flush(),Xe(e.programInfo.name)}dispose(){}build(e,t){rt(e.name);let r=this.backend.device,i=[];[{feature:"shader-f16",extension:"f16"},{feature:"subgroups",extension:"subgroups"}].forEach(p=>{r.features.has(p.feature)&&i.push(`enable ${p.extension};`)});let a=Vd(t,this.backend.device.limits),s=e.getShaderSource(a),o=`${i.join(`
`)}
${a.additionalImplementations}
${s}`,u=r.createShaderModule({code:o,label:e.name});ce("verbose",()=>`[WebGPU] ${e.name} shader code: ${o}`);let d=r.createComputePipeline({compute:{module:u,entryPoint:"main"},layout:"auto",label:e.name});return Xe(e.name),{programInfo:e,computePipeline:d,uniformVariablesInfo:a.variablesInfo}}normalizeDispatchGroupSize(e){let t=typeof e=="number"?e:e.x,r=typeof e=="number"?1:e.y||1,i=typeof e=="number"?1:e.z||1,a=this.backend.device.limits.maxComputeWorkgroupsPerDimension;if(t<=a&&r<=a&&i<=a)return[t,r,i];let s=t*r*i,o=Math.ceil(Math.sqrt(s));if(o>a){if(o=Math.ceil(Math.cbrt(s)),o>a)throw new Error("Total dispatch size exceeds WebGPU maximum.");return[o,o,o]}else return[o,o,1]}}}),Ef={};Ht(Ef,{WebGpuBackend:()=>zf});var Jl,ed,td,zf,Rg=U(()=>{je(),ie(),dt(),Ud(),Fm(),Ag(),Og(),Jl=(e,t)=>{if(t.length!==e.length)throw new Error(`inputDependencies length ${t.length} is not equal to inputTensors length ${e.length}.`);let r=[];for(let i=0;i<e.length;++i){let a=e[i].dataType;switch(t[i]){case"none":{r.push("");break}case"type":{r.push(`${a}`);break}case"rank":{let s=e[i].dims.length;r.push(`${a};${s}`);break}case"dims":{let s=e[i].dims.join(",");r.push(`${a};${s}`);break}default:throw new Error(`unsupported input dependency: ${t[i]}`)}}return r.join("|")},ed=(e,t,r)=>{let i=e.name;return e.shaderCache?.hint&&(i+="["+e.shaderCache.hint+"]"),i+=":"+r+`:${Jl(t,e.shaderCache?.inputDependencies??new Array(t.length).fill("dims"))}`,i},td=class{constructor(e){e&&(this.architecture=e.architecture,this.vendor=e.vendor)}isArchitecture(e){return this.architecture===e}isVendor(e){return this.vendor===e}},zf=class{constructor(){this.currentSessionId=null,this.currentKernelId=null,this.commandEncoder=null,this.computePassEncoder=null,this.maxDispatchNumber=16,this.pendingDispatchNumber=0,this.pendingKernels=[],this.pendingQueries=new Map,this.sessionStatus="default",this.capturedCommandList=new Map,this.capturedPendingKernels=new Map,this.sessionExternalDataMapping=new Map}get currentKernelCustomData(){if(this.currentKernelId===null)throw new Error("currentKernelCustomData(): currentKernelId is null. (should not happen)");let e=this.kernelCustomData.get(this.currentKernelId);return e||(e={},this.kernelCustomData.set(this.currentKernelId,e)),e}async initialize(e,t){this.env=e;let r=[],i={requiredLimits:{maxComputeWorkgroupStorageSize:t.limits.maxComputeWorkgroupStorageSize,maxComputeWorkgroupsPerDimension:t.limits.maxComputeWorkgroupsPerDimension,maxStorageBufferBindingSize:t.limits.maxStorageBufferBindingSize,maxBufferSize:t.limits.maxBufferSize,maxComputeInvocationsPerWorkgroup:t.limits.maxComputeInvocationsPerWorkgroup,maxComputeWorkgroupSizeX:t.limits.maxComputeWorkgroupSizeX,maxComputeWorkgroupSizeY:t.limits.maxComputeWorkgroupSizeY,maxComputeWorkgroupSizeZ:t.limits.maxComputeWorkgroupSizeZ},requiredFeatures:r},a=s=>t.features.has(s)&&r.push(s)&&!0;a("chromium-experimental-timestamp-query-inside-passes")||a("timestamp-query"),a("shader-f16"),a("subgroups"),this.device=await t.requestDevice(i),this.adapterInfo=new td(t.info||await t.requestAdapterInfo()),this.gpuDataManager=Fd(this),this.programManager=new If(this),this.kernels=new Map,this.kernelPersistentData=new Map,this.kernelCustomData=new Map,Ya(e.logLevel,!!e.debug),this.device.onuncapturederror=s=>{s.error instanceof GPUValidationError&&console.error(`An uncaught WebGPU validation error was raised: ${s.error.message}`)},Object.defineProperty(this.env.webgpu,"device",{value:this.device,writable:!1,enumerable:!0,configurable:!1}),Object.defineProperty(this.env.webgpu,"adapter",{value:t,writable:!1,enumerable:!0,configurable:!1}),this.setQueryType()}dispose(){typeof this.querySet<"u"&&this.querySet.destroy(),this.gpuDataManager.dispose()}getCommandEncoder(){return this.commandEncoder||(this.commandEncoder=this.device.createCommandEncoder()),this.commandEncoder}getComputePassEncoder(){if(!this.computePassEncoder){let e=this.getCommandEncoder(),t={};this.queryType==="at-passes"&&(t.timestampWrites={querySet:this.querySet,beginningOfPassWriteIndex:this.pendingDispatchNumber*2,endOfPassWriteIndex:this.pendingDispatchNumber*2+1}),this.computePassEncoder=e.beginComputePass(t)}return this.computePassEncoder}endComputePass(){this.computePassEncoder&&(this.computePassEncoder.end(),this.computePassEncoder=null)}flush(){if(!this.commandEncoder)return;rt(),this.endComputePass();let e;this.queryType!=="none"&&(this.commandEncoder.resolveQuerySet(this.querySet,0,this.pendingDispatchNumber*2,this.queryResolveBuffer,0),e=this.device.createBuffer({size:this.pendingDispatchNumber*2*8,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.pendingQueries.set(e,this.pendingKernels),this.pendingKernels=[],this.commandEncoder.copyBufferToBuffer(this.queryResolveBuffer,0,e,0,this.pendingDispatchNumber*2*8)),this.device.queue.submit([this.commandEncoder.finish()]),this.gpuDataManager.refreshPendingBuffers(),this.commandEncoder=null,this.pendingDispatchNumber=0,this.queryType!=="none"&&e.mapAsync(GPUMapMode.READ).then(()=>{let t=new BigUint64Array(e.getMappedRange()),r=this.pendingQueries.get(e);for(let i=0;i<t.length/2;i++){let a=r[i],s=a.kernelId,o=this.kernels.get(s),u=o.kernelType,d=o.kernelName,p=a.programName,f=a.inputTensorViews,h=a.outputTensorViews,g=t[i*2],y=t[i*2+1];typeof this.queryTimeBase>"u"&&(this.queryTimeBase=g);let _=Number(g-this.queryTimeBase),$=Number(y-this.queryTimeBase);if(!Number.isSafeInteger(_)||!Number.isSafeInteger($))throw new RangeError("incorrect timestamp range");if(this.env.webgpu.profiling?.ondata)this.env.webgpu.profiling.ondata({version:1,inputsMetadata:f.map(x=>({dims:x.dims,dataType:lt(x.dataType)})),outputsMetadata:h.map(x=>({dims:x.dims,dataType:lt(x.dataType)})),kernelId:s,kernelType:u,kernelName:d,programName:p,startTime:_,endTime:$});else{let x="";f.forEach((b,C)=>{x+=`input[${C}]: [${b.dims}] | ${lt(b.dataType)}, `});let v="";h.forEach((b,C)=>{v+=`output[${C}]: [${b.dims}] | ${lt(b.dataType)}, `}),console.log(`[profiling] kernel "${s}|${u}|${d}|${p}" ${x}${v}start time: ${_} ns, execution time: ${$-_} ns`)}Gi("GPU",`${p}::${g}::${y}`)}e.unmap(),this.pendingQueries.delete(e)}),Xe()}run(e,t,r,i,a,s){rt(e.name);let o=[];for(let b=0;b<t.length;++b){let C=t[b].data;if(C===0)continue;let T=this.gpuDataManager.get(C);if(!T)throw new Error(`no GPU data for input: ${C}`);o.push(T)}let{outputs:u,dispatchGroup:d,programUniforms:p}=e.getRunData(t),f=r.length===0?u.map((b,C)=>C):r;if(f.length!==u.length)throw new Error(`Output size ${f.length} must be equal to ${u.length}.`);let h=[],g=[];for(let b=0;b<u.length;++b){if(!Number.isInteger(f[b])||f[b]<-3||f[b]>=s)throw new Error(`Invalid output index: ${f[b]}`);if(f[b]===-3)continue;let C=f[b]===-1,T=f[b]===-2,S=C||T?a(u[b].dataType,u[b].dims):i(f[b],u[b].dataType,u[b].dims);if(h.push(S),S.data===0)continue;let z=this.gpuDataManager.get(S.data);if(!z)throw new Error(`no GPU data for output: ${S.data}`);if(C&&this.temporaryData.push(z),T){let E=this.kernelPersistentData.get(this.currentKernelId);E||(E=[],this.kernelPersistentData.set(this.currentKernelId,E)),E.push(z)}g.push(z)}if(o.length!==t.length||g.length!==h.length){if(g.length===0)return Xe(e.name),h;throw new Error(`Program ${e.name} has zero-sized tensor(s) in inputs or outputs. This is not supported now.`)}let y;if(p){let b=0,C=[];p.forEach(E=>{let R=typeof E.data=="number"?[E.data]:E.data;if(R.length===0)return;let L=E.type===10?2:4,F,K;E.type===10?(K=R.length>4?16:R.length>2?8:R.length*L,F=R.length>4?16:L*R.length):(K=R.length<=2?R.length*L:16,F=16),b=Math.ceil(b/K)*K,C.push(b);let X=E.type===10?8:4;b+=R.length>4?Math.ceil(R.length/X)*F:R.length*L});let T=16;b=Math.ceil(b/T)*T;let S=new ArrayBuffer(b);p.forEach((E,R)=>{let L=C[R],F=typeof E.data=="number"?[E.data]:E.data;if(E.type===6)new Int32Array(S,L,F.length).set(F);else if(E.type===12)new Uint32Array(S,L,F.length).set(F);else if(E.type===10)new Uint16Array(S,L,F.length).set(F);else if(E.type===1)new Float32Array(S,L,F.length).set(F);else throw new Error(`Unsupported uniform type: ${lt(E.type)}`)});let z=this.gpuDataManager.create(b,GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM);this.device.queue.writeBuffer(z.buffer,0,S,0,b),this.gpuDataManager.release(z.id),y={offset:0,size:b,buffer:z.buffer}}let _=this.programManager.normalizeDispatchGroupSize(d),$=_[1]===1&&_[2]===1,x=ed(e,t,$),v=this.programManager.getArtifact(x);if(v||(v=this.programManager.build(e,_),this.programManager.setArtifact(x,v),ce("info",()=>`[artifact] key: ${x}, programName: ${e.name}`)),p&&v.uniformVariablesInfo){if(p.length!==v.uniformVariablesInfo.length)throw new Error(`Uniform variables count mismatch: expect ${v.uniformVariablesInfo.length}, got ${p.length} in program "${v.programInfo.name}".`);for(let b=0;b<p.length;b++){let C=p[b],T=C.type,S=typeof C.data=="number"?1:C.data.length,[z,E]=v.uniformVariablesInfo[b];if(T!==z||S!==E)throw new Error(`Uniform variable ${b} mismatch: expect type ${z} with size ${E}, got type ${T} with size ${S} in program "${v.programInfo.name}".`)}}if(ce("info",()=>`[ProgramManager] run "${e.name}" (key=${x}) with ${_[0]}x${_[1]}x${_[2]}`),this.queryType!=="none"||this.sessionStatus==="capturing"){let b={kernelId:this.currentKernelId,programName:v.programInfo.name,inputTensorViews:t,outputTensorViews:h};this.pendingKernels.push(b),this.sessionStatus==="capturing"&&this.capturedPendingKernels.get(this.currentSessionId).push(b)}return this.programManager.run(v,o,g,_,y),Xe(e.name),h}upload(e,t){this.gpuDataManager.upload(e,t)}memcpy(e,t){this.gpuDataManager.memcpy(e,t)}async download(e,t){await this.gpuDataManager.download(e,t)}alloc(e){return this.gpuDataManager.create(e).id}free(e){return this.gpuDataManager.release(e)}createKernel(e,t,r,i){let a=Sf.get(e);if(!a)throw new Error(`kernel not implemented: ${e}`);let s={kernelType:e,kernelName:i,kernelEntry:a[0],attributes:[a[1],r]};this.kernels.set(t,s)}releaseKernel(e){let t=this.kernelPersistentData.get(e);if(t){for(let r of t)this.gpuDataManager.release(r.id);this.kernelPersistentData.delete(e)}this.kernelCustomData.delete(e),this.kernels.delete(e)}computeKernel(e,t,r){let i=this.kernels.get(e);if(!i)throw new Error(`kernel not created: ${e}`);let a=i.kernelType,s=i.kernelName,o=i.kernelEntry,u=i.attributes;if(this.currentKernelId!==null)throw new Error(`kernel "[${a}] ${s}" is not allowed to be called recursively`);this.currentKernelId=e,u[0]&&(u[1]=u[0](u[1]),u[0]=void 0),ce("info",()=>`[WebGPU] Start to run kernel "[${a}] ${s}"...`);let d=this.env.debug;this.temporaryData=[];try{return d&&this.device.pushErrorScope("validation"),o(t,u[1]),0}catch(p){return r.push(Promise.resolve(`[WebGPU] Kernel "[${a}] ${s}" failed. ${p}`)),1}finally{d&&r.push(this.device.popErrorScope().then(p=>p?`GPU validation error for kernel "[${a}] ${s}": ${p.message}`:null));for(let p of this.temporaryData)this.gpuDataManager.release(p.id);this.temporaryData=[],this.currentKernelId=null}}registerBuffer(e,t,r,i){let a=this.sessionExternalDataMapping.get(e);a||(a=new Map,this.sessionExternalDataMapping.set(e,a));let s=a.get(t),o=this.gpuDataManager.registerExternalBuffer(r,i,s);return a.set(t,[o,r]),o}unregisterBuffers(e){let t=this.sessionExternalDataMapping.get(e);t&&(t.forEach(r=>this.gpuDataManager.unregisterExternalBuffer(r[0])),this.sessionExternalDataMapping.delete(e))}getBuffer(e){let t=this.gpuDataManager.get(e);if(!t)throw new Error(`no GPU data for buffer: ${e}`);return t.buffer}createDownloader(e,t,r){return async()=>{let i=await Sa(this,e,t);return Xa(i.buffer,r)}}writeTimestamp(e){this.queryType==="inside-passes"&&this.computePassEncoder.writeTimestamp(this.querySet,e)}setQueryType(){this.queryType="none",(this.env.webgpu.profiling?.mode==="default"||(typeof this.env.trace>"u"?this.env.wasm.trace:this.env.trace))&&(this.device.features.has("chromium-experimental-timestamp-query-inside-passes")?this.queryType="inside-passes":this.device.features.has("timestamp-query")&&(this.queryType="at-passes"),this.queryType!=="none"&&typeof this.querySet>"u"&&(this.querySet=this.device.createQuerySet({type:"timestamp",count:this.maxDispatchNumber*2}),this.queryResolveBuffer=this.device.createBuffer({size:this.maxDispatchNumber*2*8,usage:GPUBufferUsage.COPY_SRC|GPUBufferUsage.QUERY_RESOLVE})))}captureBegin(){ce("info","captureBegin"),this.capturedCommandList.get(this.currentSessionId)||this.capturedCommandList.set(this.currentSessionId,[]),this.capturedPendingKernels.get(this.currentSessionId)||this.capturedPendingKernels.set(this.currentSessionId,[]),this.flush(),this.sessionStatus="capturing"}captureEnd(){ce("info","captureEnd"),this.flush(),this.sessionStatus="default"}replay(){ce("info","replay"),this.sessionStatus="replaying";let e=this.capturedCommandList.get(this.currentSessionId),t=this.capturedPendingKernels.get(this.currentSessionId),r=e.length;this.pendingKernels=[];for(let i=0;i<r;i++){let a=this.getComputePassEncoder(),s=e[i];this.writeTimestamp(this.pendingDispatchNumber*2),a.setPipeline(s.computePipeline),a.setBindGroup(0,s.bindGroup),a.dispatchWorkgroups(...s.dispatchGroup),this.writeTimestamp(this.pendingDispatchNumber*2+1),this.pendingDispatchNumber++,this.queryType!=="none"&&this.pendingKernels.push(t[i]),(this.pendingDispatchNumber>=this.maxDispatchNumber||this.queryType==="at-passes")&&this.endComputePass(),this.pendingDispatchNumber>=this.maxDispatchNumber&&this.flush()}this.flush(),this.sessionStatus="default"}onCreateSession(){this.gpuDataManager.onCreateSession()}onReleaseSession(e){this.unregisterBuffers(e),this.capturedCommandList.has(e)&&this.capturedCommandList.delete(e),this.capturedPendingKernels.has(e)&&this.capturedPendingKernels.delete(e),this.gpuDataManager.onReleaseSession(e)}onRunStart(e){this.currentSessionId=e,this.setQueryType()}}}),Af={};Ht(Af,{init:()=>Of});var Ui,id,Of,Bg=U(()=>{ie(),dt(),oe(),qm(),Ui=class Rf{constructor(t,r,i,a){this.module=t,this.dataType=r,this.data=i,this.dims=a}getFloat32Array(){if(this.dataType!==1)throw new Error("Invalid data type");let t=A.size(this.dims);return t===0?new Float32Array:new Float32Array(this.module.HEAP8.buffer,this.data,t)}getBigInt64Array(){if(this.dataType!==7)throw new Error("Invalid data type");let t=A.size(this.dims);return t===0?new BigInt64Array:new BigInt64Array(this.module.HEAP8.buffer,this.data,t)}getInt32Array(){if(this.dataType!==6)throw new Error("Invalid data type");let t=A.size(this.dims);return t===0?new Int32Array:new Int32Array(this.module.HEAP8.buffer,this.data,t)}getUint16Array(){if(this.dataType!==10&&this.dataType!==4)throw new Error("Invalid data type");let t=A.size(this.dims);return t===0?new Uint16Array:new Uint16Array(this.module.HEAP8.buffer,this.data,t)}reshape(t){if(A.size(t)!==A.size(this.dims))throw new Error("Invalid new shape");return new Rf(this.module,this.dataType,this.data,t)}},id=class{constructor(e,t,r){this.module=e,this.backend=t,this.customDataOffset=0,this.customDataSize=0,this.adapterInfo=t.adapterInfo;let i=e.PTR_SIZE,a=r/e.PTR_SIZE,s=i===4?"i32":"i64";this.opKernelContext=Number(e.getValue(i*a++,s));let o=Number(e.getValue(i*a++,s));this.outputCount=Number(e.getValue(i*a++,s)),this.customDataOffset=Number(e.getValue(i*a++,"*")),this.customDataSize=Number(e.getValue(i*a++,s));let u=[];for(let d=0;d<o;d++){let p=Number(e.getValue(i*a++,s)),f=Number(e.getValue(i*a++,"*")),h=Number(e.getValue(i*a++,s)),g=[];for(let y=0;y<h;y++)g.push(Number(e.getValue(i*a++,s)));u.push(new Ui(e,p,f,g))}this.inputs=u}get kernelCustomData(){return this.backend.currentKernelCustomData}get customDataBuffer(){return this.module.HEAPU8.subarray(this.customDataOffset,this.customDataOffset+this.customDataSize)}compute(e,t){let r=t?.inputs?.map(o=>typeof o=="number"?this.inputs[o]:o)??this.inputs,i=t?.outputs??[],a=(o,u,d)=>new Ui(this.module,u,this.output(o,d),d),s=(o,u)=>{let d=Ot(o,u);if(!d)throw new Error(`Unsupported data type: ${o}`);let p=d>0?this.backend.gpuDataManager.create(d).id:0;return new Ui(this.module,o,p,u)};return this.backend.run(e,r,i,a,s,this.outputCount)}output(e,t){let r=this.module.stackSave();try{let i=this.module.PTR_SIZE,a=i===4?"i32":"i64",s=this.module.stackAlloc((1+t.length)*i);this.module.setValue(s,t.length,a);for(let o=0;o<t.length;o++)this.module.setValue(s+i*(o+1),t[o],a);return this.module._JsepOutput(this.opKernelContext,e,s)}catch(i){throw new Error(`Failed to generate kernel's output[${e}] with dims [${t}]. If you are running with pre-allocated output, please make sure the output type/dims are correct. Error: ${i}`)}finally{this.module.stackRestore(r)}}},Of=async(e,t,r,i)=>{let a=t.jsepInit;if(!a)throw new Error("Failed to initialize JSEP. The WebAssembly module is not built with JSEP support.");if(e==="webgpu"){let s=(Rg(),yi(Ef)).WebGpuBackend,o=new s;await o.initialize(r,i),a("webgpu",[o,u=>o.alloc(Number(u)),u=>o.free(u),(u,d,p,f=!1)=>{if(f)ce("verbose",()=>`[WebGPU] jsepCopyGpuToGpu: src=${Number(u)}, dst=${Number(d)}, size=${Number(p)}`),o.memcpy(Number(u),Number(d));else{ce("verbose",()=>`[WebGPU] jsepCopyCpuToGpu: dataOffset=${Number(u)}, gpuDataId=${Number(d)}, size=${Number(p)}`);let h=t.HEAPU8.subarray(Number(u>>>0),Number(u>>>0)+Number(p));o.upload(Number(d),h)}},async(u,d,p)=>{ce("verbose",()=>`[WebGPU] jsepCopyGpuToCpu: gpuDataId=${u}, dataOffset=${d}, size=${p}`),await o.download(Number(u),()=>t.HEAPU8.subarray(Number(d)>>>0,Number(d+p)>>>0))},(u,d,p)=>o.createKernel(u,Number(d),p,t.UTF8ToString(t._JsepGetNodeName(Number(d)))),u=>o.releaseKernel(u),(u,d,p,f)=>{ce("verbose",()=>`[WebGPU] jsepRun: sessionHandle=${p}, kernel=${u}, contextDataOffset=${d}`);let h=new id(t,o,Number(d));return o.computeKernel(Number(u),h,f)},()=>o.captureBegin(),()=>o.captureEnd(),()=>o.replay()])}else{let s=new qd(r);a("webnn",[s,()=>s.reserveTensorId(),o=>s.releaseTensorId(o),async(o,u,d,p,f)=>s.ensureTensor(o,u,d,p,f),(o,u)=>{s.uploadTensor(o,u)},async(o,u)=>s.downloadTensor(o,u),(o,u)=>s.registerMLContext(o,u),!!r.trace])}}}),rd,ln,dn,yt,ad,wa,Ji,pn,cn,ba,fn,hn,mn,Bf=U(()=>{je(),Lm(),Um(),ie(),Lt(),Ga(),Nd(),rd=(e,t)=>{be()._OrtInit(e,t)!==0&&ye("Can't initialize onnxruntime.")},ln=async e=>{rd(e.wasm.numThreads,Ki(e.logLevel))},dn=async(e,t)=>{be().asyncInit?.();let r=e.webgpu.adapter;if(t==="webgpu"){if(typeof navigator>"u"||!navigator.gpu)throw new Error("WebGPU is not supported in current environment");if(r){if(typeof r.limits!="object"||typeof r.features!="object"||typeof r.requestDevice!="function")throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.")}else{let i=e.webgpu.powerPreference;if(i!==void 0&&i!=="low-power"&&i!=="high-performance")throw new Error(`Invalid powerPreference setting: "${i}"`);let a=e.webgpu.forceFallbackAdapter;if(a!==void 0&&typeof a!="boolean")throw new Error(`Invalid forceFallbackAdapter setting: "${a}"`);if(r=await navigator.gpu.requestAdapter({powerPreference:i,forceFallbackAdapter:a}),!r)throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.')}}if(t==="webnn"&&(typeof navigator>"u"||!navigator.ml))throw new Error("WebNN is not supported in current environment");{let i=(Bg(),yi(Af)).init;t==="webgpu"&&await i("webgpu",be(),e,r),t==="webnn"&&await i("webnn",be(),e)}},yt=new Map,ad=e=>{let t=be(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetInputOutputCount(e,a,a+i)!==0&&ye("Can't get session input/output count.");let s=i===4?"i32":"i64";return[Number(t.getValue(a,s)),Number(t.getValue(a+i,s))]}finally{t.stackRestore(r)}},wa=(e,t)=>{let r=be(),i=r.stackSave(),a=0;try{let s=r.PTR_SIZE,o=r.stackAlloc(2*s);r._OrtGetInputOutputMetadata(e,t,o,o+s)!==0&&ye("Can't get session input/output metadata.");let u=Number(r.getValue(o,"*"));a=Number(r.getValue(o+s,"*"));let d=r.HEAP32[a/4];if(d===0)return[u,0];let p=r.HEAPU32[a/4+1],f=[];for(let h=0;h<p;h++){let g=Number(r.getValue(a+8+h*s,"*"));f.push(g!==0?r.UTF8ToString(g):Number(r.getValue(a+8+(h+p)*s,"*")))}return[u,d,f]}finally{r.stackRestore(i),a!==0&&r._OrtFree(a)}},Ji=e=>{let t=be(),r=t._malloc(e.byteLength);if(r===0)throw new Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);return t.HEAPU8.set(e,r),[r,e.byteLength]},pn=async(e,t)=>{let r,i,a=be();Array.isArray(e)?[r,i]=e:e.buffer===a.HEAPU8.buffer?[r,i]=[e.byteOffset,e.byteLength]:[r,i]=Ji(e);let s=0,o=0,u=0,d=[],p=[],f=[];try{if([o,d]=await Md(t),t?.externalData&&a.mountExternalData){let T=[];for(let S of t.externalData){let z=typeof S=="string"?S:S.path;T.push(Za(typeof S=="string"?S:S.data).then(E=>{a.mountExternalData(z,E)}))}await Promise.all(T)}for(let T of t?.executionProviders??[])if((typeof T=="string"?T:T.name)==="webnn"){if(a.shouldTransferToMLTensor=!1,typeof T!="string"){let S=T,z=S?.context,E=S?.gpuDevice,R=S?.deviceType,L=S?.powerPreference;z?a.currentContext=z:E?a.currentContext=await a.webnnCreateMLContext(E):a.currentContext=await a.webnnCreateMLContext({deviceType:R,powerPreference:L})}else a.currentContext=await a.webnnCreateMLContext();break}s=await a._OrtCreateSession(r,i,o),a.webgpuOnCreateSession?.(s),s===0&&ye("Can't create a session."),a.jsepOnCreateSession?.(),a.currentContext&&(a.webnnRegisterMLContext(s,a.currentContext),a.currentContext=void 0,a.shouldTransferToMLTensor=!0);let[h,g]=ad(s),y=!!t?.enableGraphCapture,_=[],$=[],x=[],v=[],b=[];for(let T=0;T<h;T++){let[S,z,E]=wa(s,T);S===0&&ye("Can't get an input name."),p.push(S);let R=a.UTF8ToString(S);_.push(R),x.push(z===0?{name:R,isTensor:!1}:{name:R,isTensor:!0,type:lt(z),shape:E})}for(let T=0;T<g;T++){let[S,z,E]=wa(s,T+h);S===0&&ye("Can't get an output name."),f.push(S);let R=a.UTF8ToString(S);$.push(R),v.push(z===0?{name:R,isTensor:!1}:{name:R,isTensor:!0,type:lt(z),shape:E});{if(y&&t?.preferredOutputLocation===void 0){b.push("gpu-buffer");continue}let L=typeof t?.preferredOutputLocation=="string"?t.preferredOutputLocation:t?.preferredOutputLocation?.[R]??"cpu",F=a.webnnIsGraphOutput;if(L==="cpu"&&F&&F(s,R)){b.push("ml-tensor-cpu-output");continue}if(L!=="cpu"&&L!=="cpu-pinned"&&L!=="gpu-buffer"&&L!=="ml-tensor")throw new Error(`Not supported preferred output location: ${L}.`);if(y&&L!=="gpu-buffer")throw new Error(`Not supported preferred output location: ${L}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);b.push(L)}}let C=null;return b.some(T=>T==="gpu-buffer"||T==="ml-tensor"||T==="ml-tensor-cpu-output")&&(u=a._OrtCreateBinding(s),u===0&&ye("Can't create IO binding."),C={handle:u,outputPreferredLocations:b,outputPreferredLocationsEncoded:b.map(T=>T==="ml-tensor-cpu-output"?"ml-tensor":T).map(T=>ka(T))}),yt.set(s,[s,p,f,C,y,!1]),[s,_,$,x,v]}catch(h){throw p.forEach(g=>a._OrtFree(g)),f.forEach(g=>a._OrtFree(g)),u!==0&&a._OrtReleaseBinding(u)!==0&&ye("Can't release IO binding."),s!==0&&a._OrtReleaseSession(s)!==0&&ye("Can't release session."),h}finally{a._free(r),o!==0&&a._OrtReleaseSessionOptions(o)!==0&&ye("Can't release session options."),d.forEach(h=>a._free(h)),a.unmountExternalData?.()}},cn=e=>{let t=be(),r=yt.get(e);if(!r)throw new Error(`cannot release session. invalid session id: ${e}`);let[i,a,s,o,u]=r;o&&(u&&t._OrtClearBoundOutputs(o.handle)!==0&&ye("Can't clear bound outputs."),t._OrtReleaseBinding(o.handle)!==0&&ye("Can't release IO binding.")),t.jsepOnReleaseSession?.(e),t.webnnOnReleaseSession?.(e),t.webgpuOnReleaseSession?.(e),a.forEach(d=>t._OrtFree(d)),s.forEach(d=>t._OrtFree(d)),t._OrtReleaseSession(i)!==0&&ye("Can't release session."),yt.delete(e)},ba=async(e,t,r,i,a,s,o=!1)=>{if(!e){t.push(0);return}let u=be(),d=u.PTR_SIZE,p=e[0],f=e[1],h=e[3],g=h,y,_;if(p==="string"&&(h==="gpu-buffer"||h==="ml-tensor"))throw new Error("String tensor is not supported on GPU.");if(o&&h!=="gpu-buffer")throw new Error(`External buffer must be provided for input/output index ${s} when enableGraphCapture is true.`);if(h==="gpu-buffer"){let v=e[2].gpuBuffer;_=Ot(At(p),f);{let b=u.jsepRegisterBuffer;if(!b)throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');y=b(i,s,v,_)}}else if(h==="ml-tensor"){let v=e[2].mlTensor;_=Ot(At(p),f);let b=u.webnnRegisterMLTensor;if(!b)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');y=b(i,v,At(p),f)}else{let v=e[2];if(Array.isArray(v)){_=d*v.length,y=u._malloc(_),r.push(y);for(let b=0;b<v.length;b++){if(typeof v[b]!="string")throw new TypeError(`tensor data at index ${b} is not a string`);u.setValue(y+b*d,Ye(v[b],r),"*")}}else{let b=u.webnnIsGraphInput,C=u.webnnIsGraphOutput;if(p!=="string"&&b&&C){let T=u.UTF8ToString(a);if(b(i,T)||C(i,T)){let S=At(p);_=Ot(S,f),g="ml-tensor";let z=u.webnnCreateTemporaryTensor,E=u.webnnUploadTensor;if(!z||!E)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');let R=await z(i,S,f);E(R,new Uint8Array(v.buffer,v.byteOffset,v.byteLength)),y=R}else _=v.byteLength,y=u._malloc(_),r.push(y),u.HEAPU8.set(new Uint8Array(v.buffer,v.byteOffset,_),y)}else _=v.byteLength,y=u._malloc(_),r.push(y),u.HEAPU8.set(new Uint8Array(v.buffer,v.byteOffset,_),y)}}let $=u.stackSave(),x=u.stackAlloc(4*f.length);try{f.forEach((b,C)=>u.setValue(x+C*d,b,d===4?"i32":"i64"));let v=u._OrtCreateTensor(At(p),y,_,x,f.length,ka(g));v===0&&ye(`Can't create tensor for input/output. session=${i}, index=${s}.`),t.push(v)}finally{u.stackRestore($)}},fn=async(e,t,r,i,a,s)=>{let o=be(),u=o.PTR_SIZE,d=yt.get(e);if(!d)throw new Error(`cannot run inference. invalid session id: ${e}`);let p=d[0],f=d[1],h=d[2],g=d[3],y=d[4],_=d[5],$=t.length,x=i.length,v=0,b=[],C=[],T=[],S=[],z=o.stackSave(),E=o.stackAlloc($*u),R=o.stackAlloc($*u),L=o.stackAlloc(x*u),F=o.stackAlloc(x*u);try{[v,b]=Bd(s),Bt("wasm prepareInputOutputTensor");for(let j=0;j<$;j++)await ba(r[j],C,S,e,f[t[j]],t[j],y);for(let j=0;j<x;j++)await ba(a[j],T,S,e,h[i[j]],$+i[j],y);Mt("wasm prepareInputOutputTensor");for(let j=0;j<$;j++)o.setValue(E+j*u,C[j],"*"),o.setValue(R+j*u,f[t[j]],"*");for(let j=0;j<x;j++)o.setValue(L+j*u,T[j],"*"),o.setValue(F+j*u,h[i[j]],"*");if(g&&!_){let{handle:j,outputPreferredLocations:se,outputPreferredLocationsEncoded:H}=g;if(f.length!==$)throw new Error(`input count from feeds (${$}) is expected to be always equal to model's input count (${f.length}).`);Bt("wasm bindInputsOutputs");for(let G=0;G<$;G++){let ne=t[G];await o._OrtBindInput(j,f[ne],C[G])!==0&&ye(`Can't bind input[${G}] for session=${e}.`)}for(let G=0;G<x;G++){let ne=i[G];a[G]?.[3]?o._OrtBindOutput(j,h[ne],T[G],0)!==0&&ye(`Can't bind pre-allocated output[${G}] for session=${e}.`):o._OrtBindOutput(j,h[ne],0,H[ne])!==0&&ye(`Can't bind output[${G}] to ${se[G]} for session=${e}.`)}Mt("wasm bindInputsOutputs"),yt.set(e,[p,f,h,g,y,!0])}o.jsepOnRunStart?.(p),o.webnnOnRunStart?.(p);let K;g?K=await o._OrtRunWithBinding(p,g.handle,x,L,v):K=await o._OrtRun(p,R,E,$,F,x,L,v),K!==0&&ye("failed to call OrtRun().");let X=[],re=[];Bt("wasm ProcessOutputTensor");for(let j=0;j<x;j++){let se=Number(o.getValue(L+j*u,"*"));if(se===T[j]){X.push(a[j]);continue}let H=o.stackSave(),G=o.stackAlloc(4*u),ne=!1,V,ge=0;try{o._OrtGetTensorData(se,G,G+u,G+2*u,G+3*u)!==0&&ye(`Can't access output tensor data on index ${j}.`);let P=u===4?"i32":"i64",q=Number(o.getValue(G,P));ge=o.getValue(G+u,"*");let ee=o.getValue(G+u*2,"*"),pe=Number(o.getValue(G+u*3,P)),N=[];for(let _e=0;_e<pe;_e++)N.push(Number(o.getValue(ee+_e*u,P)));o._OrtFree(ee)!==0&&ye("Can't free memory for tensor dims.");let de=N.reduce((_e,we)=>_e*we,1);V=lt(q);let De=g?.outputPreferredLocations[i[j]];if(V==="string"){if(De==="gpu-buffer"||De==="ml-tensor")throw new Error("String tensor is not supported on GPU.");let _e=[];for(let we=0;we<de;we++){let ve=o.getValue(ge+we*u,"*"),vt=o.getValue(ge+(we+1)*u,"*"),Kt=we===de-1?void 0:vt-ve;_e.push(o.UTF8ToString(ve,Kt))}X.push([V,N,_e,"cpu"])}else if(De==="gpu-buffer"&&de>0){let _e=o.jsepGetBuffer;if(!_e)throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');let we=_e(ge),ve=Ot(q,de);if(ve===void 0||!Ha(V))throw new Error(`Unsupported data type: ${V}`);ne=!0,X.push([V,N,{gpuBuffer:we,download:o.jsepCreateDownloader(we,ve,V),dispose:()=>{o._OrtReleaseTensor(se)!==0&&ye("Can't release tensor.")}},"gpu-buffer"])}else if(De==="ml-tensor"&&de>0){let _e=o.webnnEnsureTensor,we=o.webnnIsGraphInputOutputTypeSupported;if(!_e||!we)throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');if(Ot(q,de)===void 0||!Ka(V))throw new Error(`Unsupported data type: ${V}`);if(!we(e,V,!1))throw new Error(`preferredLocation "ml-tensor" for ${V} output is not supported by current WebNN Context.`);let ve=await _e(e,ge,q,N,!1);ne=!0,X.push([V,N,{mlTensor:ve,download:o.webnnCreateMLTensorDownloader(ge,V),dispose:()=>{o.webnnReleaseTensorId(ge),o._OrtReleaseTensor(se)}},"ml-tensor"])}else if(De==="ml-tensor-cpu-output"&&de>0){let _e=o.webnnCreateMLTensorDownloader(ge,V)(),we=X.length;ne=!0,re.push((async()=>{let ve=[we,await _e];return o.webnnReleaseTensorId(ge),o._OrtReleaseTensor(se),ve})()),X.push([V,N,[],"cpu"])}else{let _e=er(V),we=new _e(de);new Uint8Array(we.buffer,we.byteOffset,we.byteLength).set(o.HEAPU8.subarray(ge,ge+we.byteLength)),X.push([V,N,we,"cpu"])}}finally{o.stackRestore(H),V==="string"&&ge&&o._free(ge),ne||o._OrtReleaseTensor(se)}}g&&!y&&(o._OrtClearBoundOutputs(g.handle)!==0&&ye("Can't clear bound outputs."),yt.set(e,[p,f,h,g,y,!1]));for(let[j,se]of await Promise.all(re))X[j][2]=se;return Mt("wasm ProcessOutputTensor"),X}finally{o.webnnOnRunEnd?.(p),o.stackRestore(z),C.forEach(K=>o._OrtReleaseTensor(K)),T.forEach(K=>o._OrtReleaseTensor(K)),S.forEach(K=>o._free(K)),v!==0&&o._OrtReleaseRunOptions(v),b.forEach(K=>o._free(K))}},hn=e=>{let t=be(),r=yt.get(e);if(!r)throw new Error("invalid session id");let i=r[0],a=t._OrtEndProfiling(i);a===0&&ye("Can't get an profile file name."),t._OrtFree(a)},mn=e=>{let t=[];for(let r of e){let i=r[2];!Array.isArray(i)&&"buffer"in i&&t.push(i.buffer)}return t}}),_t,Fe,qt,di,pi,Wi,$a,qi,It,Et,nd,Mf,Nf,Df,Pf,Lf,Uf,Wf,qf=U(()=>{je(),Bf(),Lt(),ja(),_t=()=>!!$e.wasm.proxy&&typeof document<"u",qt=!1,di=!1,pi=!1,qi=new Map,It=(e,t)=>{let r=qi.get(e);r?r.push(t):qi.set(e,[t])},Et=()=>{if(qt||!di||pi||!Fe)throw new Error("worker not ready")},nd=e=>{switch(e.data.type){case"init-wasm":qt=!1,e.data.err?(pi=!0,$a[1](e.data.err)):(di=!0,$a[0]()),Wi&&(URL.revokeObjectURL(Wi),Wi=void 0);break;case"init-ep":case"copy-from":case"create":case"release":case"run":case"end-profiling":{let t=qi.get(e.data.type);e.data.err?t.shift()[1](e.data.err):t.shift()[0](e.data.out);break}}},Mf=async()=>{if(!di){if(qt)throw new Error("multiple calls to 'initWasm()' detected.");if(pi)throw new Error("previous call to 'initWasm()' failed.");if(qt=!0,_t())return new Promise((e,t)=>{Fe?.terminate(),Od().then(([r,i])=>{try{Fe=i,Fe.onerror=s=>t(s),Fe.onmessage=nd,$a=[e,t];let a={type:"init-wasm",in:$e};!a.in.wasm.wasmPaths&&(r||Ta)&&(a.in.wasm.wasmPaths={wasm:new URL("/ai/nadha/assets/ort-wasm-simd-threaded.jsep-BGTZ4Y7F.wasm",import.meta.url).href}),Fe.postMessage(a),Wi=r}catch(a){t(a)}},t)});try{await Va($e.wasm),await ln($e),di=!0}catch(e){throw pi=!0,e}finally{qt=!1}}},Nf=async e=>{if(_t())return Et(),new Promise((t,r)=>{It("init-ep",[t,r]);let i={type:"init-ep",in:{epName:e,env:$e}};Fe.postMessage(i)});await dn($e,e)},Df=async e=>_t()?(Et(),new Promise((t,r)=>{It("copy-from",[t,r]);let i={type:"copy-from",in:{buffer:e}};Fe.postMessage(i,[e.buffer])})):Ji(e),Pf=async(e,t)=>{if(_t()){if(t?.preferredOutputLocation)throw new Error('session option "preferredOutputLocation" is not supported for proxy.');return Et(),new Promise((r,i)=>{It("create",[r,i]);let a={type:"create",in:{model:e,options:{...t}}},s=[];e instanceof Uint8Array&&s.push(e.buffer),Fe.postMessage(a,s)})}else return pn(e,t)},Lf=async e=>{if(_t())return Et(),new Promise((t,r)=>{It("release",[t,r]);let i={type:"release",in:e};Fe.postMessage(i)});cn(e)},Uf=async(e,t,r,i,a,s)=>{if(_t()){if(r.some(o=>o[3]!=="cpu"))throw new Error("input tensor on GPU is not supported for proxy.");if(a.some(o=>o))throw new Error("pre-allocated output tensor is not supported for proxy.");return Et(),new Promise((o,u)=>{It("run",[o,u]);let d=r,p={type:"run",in:{sessionId:e,inputIndices:t,inputs:d,outputIndices:i,options:s}};Fe.postMessage(p,mn(d))})}else return fn(e,t,r,i,a,s)},Wf=async e=>{if(_t())return Et(),new Promise((t,r)=>{It("end-profiling",[t,r]);let i={type:"end-profiling",in:e};Fe.postMessage(i)});hn(e)}}),va,sd,Ff,Mg=U(()=>{je(),qf(),ie(),Fa(),Nd(),va=(e,t)=>{switch(e.location){case"cpu":return[e.type,e.dims,e.data,"cpu"];case"gpu-buffer":return[e.type,e.dims,{gpuBuffer:e.gpuBuffer},"gpu-buffer"];case"ml-tensor":return[e.type,e.dims,{mlTensor:e.mlTensor},"ml-tensor"];default:throw new Error(`invalid data location: ${e.location} for ${t()}`)}},sd=e=>{switch(e[3]){case"cpu":return new Ie(e[0],e[2],e[1]);case"gpu-buffer":{let t=e[0];if(!Ha(t))throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);let{gpuBuffer:r,download:i,dispose:a}=e[2];return Ie.fromGpuBuffer(r,{dataType:t,dims:e[1],download:i,dispose:a})}case"ml-tensor":{let t=e[0];if(!Ka(t))throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);let{mlTensor:r,download:i,dispose:a}=e[2];return Ie.fromMLTensor(r,{dataType:t,dims:e[1],download:i,dispose:a})}default:throw new Error(`invalid data location: ${e[3]}`)}},Ff=class{async fetchModelAndCopyToWasmMemory(e){return Df(await Za(e))}async loadModel(e,t){rt();let r;typeof e=="string"?r=await this.fetchModelAndCopyToWasmMemory(e):r=e,[this.sessionId,this.inputNames,this.outputNames,this.inputMetadata,this.outputMetadata]=await Pf(r,t),Xe()}async dispose(){return Lf(this.sessionId)}async run(e,t,r){rt();let i=[],a=[];Object.entries(e).forEach(h=>{let g=h[0],y=h[1],_=this.inputNames.indexOf(g);if(_===-1)throw new Error(`invalid input '${g}'`);i.push(y),a.push(_)});let s=[],o=[];Object.entries(t).forEach(h=>{let g=h[0],y=h[1],_=this.outputNames.indexOf(g);if(_===-1)throw new Error(`invalid output '${g}'`);s.push(y),o.push(_)});let u=i.map((h,g)=>va(h,()=>`input "${this.inputNames[a[g]]}"`)),d=s.map((h,g)=>h?va(h,()=>`output "${this.outputNames[o[g]]}"`):null),p=await Uf(this.sessionId,a,u,o,d,r),f={};for(let h=0;h<p.length;h++)f[this.outputNames[o[h]]]=s[h]??sd(p[h]);return Xe(),f}startProfiling(){}endProfiling(){Wf(this.sessionId)}}}),jf={};Ht(jf,{OnnxruntimeWebAssemblyBackend:()=>La,initializeFlags:()=>Pa,wasmBackend:()=>Vf});var Pa,La,Vf,Ng=U(()=>{je(),qf(),Mg(),Pa=()=>{(typeof $e.wasm.initTimeout!="number"||$e.wasm.initTimeout<0)&&($e.wasm.initTimeout=0);let e=$e.wasm.simd;if(typeof e!="boolean"&&e!==void 0&&e!=="fixed"&&e!=="relaxed"&&(console.warn(`Property "env.wasm.simd" is set to unknown value "${e}". Reset it to \`false\` and ignore SIMD feature checking.`),$e.wasm.simd=!1),typeof $e.wasm.proxy!="boolean"&&($e.wasm.proxy=!1),typeof $e.wasm.trace!="boolean"&&($e.wasm.trace=!1),typeof $e.wasm.numThreads!="number"||!Number.isInteger($e.wasm.numThreads)||$e.wasm.numThreads<=0)if(typeof self<"u"&&!self.crossOriginIsolated)$e.wasm.numThreads=1;else{let t=typeof navigator>"u"?$m("node:os").cpus().length:navigator.hardwareConcurrency;$e.wasm.numThreads=Math.min(4,Math.ceil((t||1)/2))}},La=class{async init(e){Pa(),await Mf(),await Nf(e)}async createInferenceSessionHandler(e,t){let r=new Ff;return await r.loadModel(e,t),r}},Vf=new La});je();je();je();var Dg="1.23.2";{let e=(Ng(),yi(jf)).wasmBackend;Ft("webgpu",e,5),Ft("webnn",e,5),Ft("cpu",e,10),Ft("wasm",e,10)}Object.defineProperty($e.versions,"web",{value:Dg,enumerable:!0});/**
* @license
* Copyright 2021 Google LLC. All Rights Reserved.
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* =============================================================================
*//**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 *//**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const Gf=["en","ko","es","pt","fr"];function Pg(e){return Gf.includes(e)}class Lg{constructor(t){this.indexer=t}call(t,r){const i=t.map((d,p)=>this.preprocessText(d,r[p])),a=i.map(d=>d.length),s=Math.max(...a),o=i.map(d=>{const p=new Array(s).fill(0);for(let f=0;f<d.length;f++){const h=d.codePointAt(f);p[f]=h<this.indexer.length?this.indexer[h]:-1}return p}),u=this.getTextMask(a);return{textIds:o,textMask:u}}preprocessText(t,r){t=t.normalize("NFKD");const i=/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]+/gu;t=t.replace(i,"");const a={"–":"-","‑":"-","—":"-",_:" ","“":'"',"”":'"',"‘":"'","’":"'","´":"'","`":"'","[":" ","]":" ","|":" ","/":" ","#":" ","→":" ","←":" "};for(const[o,u]of Object.entries(a))t=t.replaceAll(o,u);t=t.replace(/[♥☆♡©\\]/g,"");const s={"@":" at ","e.g.,":"for example, ","i.e.,":"that is, "};for(const[o,u]of Object.entries(s))t=t.replaceAll(o,u);for(t=t.replace(/ ,/g,","),t=t.replace(/ \./g,"."),t=t.replace(/ !/g,"!"),t=t.replace(/ \?/g,"?"),t=t.replace(/ ;/g,";"),t=t.replace(/ :/g,":"),t=t.replace(/ '/g,"'");t.includes('""');)t=t.replace('""','"');for(;t.includes("''");)t=t.replace("''","'");for(;t.includes("``");)t=t.replace("``","`");if(t=t.replace(/\s+/g," ").trim(),/[.!?;:,'\"')\]}…。」』】〉》›»]$/.test(t)||(t+="."),!Pg(r))throw new Error(`Invalid language: ${r}. Available: ${Gf.join(", ")}`);return t=`<${r}>${t}</${r}>`,t}getTextMask(t){const r=Math.max(...t);return this.lengthToMask(t,r)}lengthToMask(t,r=null){const i=r||Math.max(...t);return t.map(a=>{const s=new Array(i).fill(0);for(let o=0;o<Math.min(a,i);o++)s[o]=1;return[s]})}}class Ug{constructor(t,r){this.ttl=t,this.dp=r}}class Wg{constructor(t,r,i,a,s,o){this.cfgs=t,this.textProcessor=r,this.dpOrt=i,this.textEncOrt=a,this.vectorEstOrt=s,this.vocoderOrt=o,this.sampleRate=t.ae.sample_rate}async _infer(t,r,i,a,s=1.05,o=null){const u=t.length,{textIds:d,textMask:p}=this.textProcessor.call(t,r),f=new BigInt64Array(d.flat().map(H=>BigInt(H))),h=[u,d[0].length],g=new Ie("int64",f,h),y=new Float32Array(p.flat(2)),_=[u,1,p[0][0].length],$=new Ie("float32",y,_),x=await this.dpOrt.run({text_ids:g,style_dp:i.dp,text_mask:$}),v=Array.from(x.duration.data);for(let H=0;H<v.length;H++)v[H]/=s;const C=(await this.textEncOrt.run({text_ids:g,style_ttl:i.ttl,text_mask:$})).text_emb;let{xt:T,latentMask:S}=this.sampleNoisyLatent(v,this.sampleRate,this.cfgs.ae.base_chunk_size,this.cfgs.ttl.chunk_compress_factor,this.cfgs.ttl.latent_dim);const z=new Float32Array(S.flat(2)),E=[u,1,S[0][0].length],R=new Ie("float32",z,E),L=new Float32Array(u).fill(a),F=new Ie("float32",L,[u]);for(let H=0;H<a;H++){o&&o(H+1,a);const G=new Float32Array(u).fill(H),ne=new Ie("float32",G,[u]),V=new Float32Array(T.flat(2)),ge=[u,T[0].length,T[0][0].length],P=new Ie("float32",V,ge),q=await this.vectorEstOrt.run({noisy_latent:P,text_emb:C,style_ttl:i.ttl,latent_mask:R,text_mask:$,current_step:ne,total_step:F}),ee=Array.from(q.denoised_latent.data),pe=T[0].length,N=T[0][0].length;T=[];let de=0;for(let De=0;De<u;De++){const _e=[];for(let we=0;we<pe;we++){const ve=[];for(let vt=0;vt<N;vt++)ve.push(ee[de++]);_e.push(ve)}T.push(_e)}}const K=new Float32Array(T.flat(2)),X=[u,T[0].length,T[0][0].length],re=new Ie("float32",K,X),j=await this.vocoderOrt.run({latent:re});return{wav:Array.from(j.wav_tts.data),duration:v}}async call(t,r,i,a,s=1.05,o=.3,u=null){if(i.ttl.dims[0]!==1)throw new Error("Single speaker text to speech only supports single style");const p=Hg(t,r==="ko"?120:300),f=new Array(p.length).fill(r);let h=[],g=0;for(let y=0;y<p.length;y++){const{wav:_,duration:$}=await this._infer([p[y]],[f[y]],i,a,s,u);if(h.length===0)h=_,g=$[0];else{const x=Math.floor(o*this.sampleRate),v=new Array(x).fill(0);h=[...h,...v,..._],g+=$[0]+o}}return{wav:h,duration:[g]}}async batch(t,r,i,a,s=1.05,o=null){return await this._infer(t,r,i,a,s,o)}sampleNoisyLatent(t,r,i,a,s){const o=t.length,u=Math.max(...t),d=Math.floor(u*r),p=t.map(x=>Math.floor(x*r)),f=i*a,h=Math.floor((d+f-1)/f),g=s*a,y=[];for(let x=0;x<o;x++){const v=[];for(let b=0;b<g;b++){const C=[];for(let T=0;T<h;T++){const S=Math.max(1e-4,Math.random()),z=Math.random(),E=Math.sqrt(-2*Math.log(S))*Math.cos(2*Math.PI*z);C.push(E)}v.push(C)}y.push(v)}const _=p.map(x=>Math.floor((x+f-1)/f)),$=this.lengthToMask(_,h);for(let x=0;x<o;x++)for(let v=0;v<g;v++)for(let b=0;b<h;b++)y[x][v][b]*=$[x][0][b];return{xt:y,latentMask:$}}lengthToMask(t,r=null){const i=r||Math.max(...t);return t.map(a=>{const s=new Array(i).fill(0);for(let o=0;o<Math.min(a,i);o++)s[o]=1;return[s]})}}async function qg(e,t=!1){const r=e.length,a=await(await fetch(e[0])).json(),s=a.style_ttl.dims,o=a.style_dp.dims,u=s[1],d=s[2],p=o[1],f=o[2],h=r*u*d,g=r*p*f,y=new Float32Array(h),_=new Float32Array(g);for(let C=0;C<r;C++){const S=await(await fetch(e[C])).json(),z=S.style_ttl.data.flat(1/0),E=C*u*d;y.set(z,E);const R=S.style_dp.data.flat(1/0),L=C*p*f;_.set(R,L)}const $=[r,u,d],x=[r,p,f],v=new Ie("float32",y,$),b=new Ie("float32",_,x);return t&&console.log(`Loaded ${r} voice styles`),new Ug(v,b)}async function Fg(e){return await(await fetch(`${e}/tts.json`)).json()}async function jg(e){const r=await(await fetch(`${e}/unicode_indexer.json`)).json();return new Lg(r)}async function Vg(e,t){return await _i.create(e,t)}async function Gg(e,t={},r=null){console.log("Using WebAssembly/WebGPU for inference");const i=await Fg(e),a=`${e}/duration_predictor.onnx`,s=`${e}/text_encoder.onnx`,o=`${e}/vector_estimator.onnx`,u=`${e}/vocoder.onnx`,d=[{name:"Duration Predictor",path:a},{name:"Text Encoder",path:s},{name:"Vector Estimator",path:o},{name:"Vocoder",path:u}],p=[];for(let x=0;x<d.length;x++){r&&r(d[x].name,x+1,d.length);const v=await Vg(d[x].path,t);p.push(v)}const[f,h,g,y]=p,_=await jg(e);return{textToSpeech:new Wg(i,_,f,h,g,y),cfgs:i}}function Hg(e,t=300){if(typeof e!="string")throw new Error(`chunkText expects a string, got ${typeof e}`);const r=e.trim().split(/\n\s*\n+/).filter(a=>a.trim()),i=[];for(let a of r){if(a=a.trim(),!a)continue;const s=a.split(/(?<!Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.|Sr\.|Jr\.|Ph\.D\.|etc\.|e\.g\.|i\.e\.|vs\.|Inc\.|Ltd\.|Co\.|Corp\.|St\.|Ave\.|Blvd\.)(?<!\b[A-Z]\.)(?<=[.!?])\s+/);let o="";for(let u of s)o.length+u.length+1<=t?o+=(o?" ":"")+u:(o&&i.push(o.trim()),o=u);o&&i.push(o.trim())}return i}function Hf(e,t){const a=t*1*16/8,s=1*16/8,o=e.length*2,u=new ArrayBuffer(44+o),d=new DataView(u),p=(g,y)=>{for(let _=0;_<y.length;_++)d.setUint8(g+_,y.charCodeAt(_))};p(0,"RIFF"),d.setUint32(4,36+o,!0),p(8,"WAVE"),p(12,"fmt "),d.setUint32(16,16,!0),d.setUint16(20,1,!0),d.setUint16(22,1,!0),d.setUint32(24,t,!0),d.setUint32(28,a,!0),d.setUint16(32,s,!0),d.setUint16(34,16,!0),p(36,"data"),d.setUint32(40,o,!0);const f=new Int16Array(e.length);for(let g=0;g<e.length;g++){const y=Math.max(-1,Math.min(1,e[g]));f[g]=Math.floor(y*32767)}return new Uint8Array(u,44).set(new Uint8Array(f.buffer)),u}let Kg=null,Zg=null,Yg=null,Xg=null,xa=!1,od=!1;async function Qg(e){if(od)return!0;if(xa)return!1;xa=!0,console.log("[Whisper] Loading ONNX models from local files...");try{return e&&e(10,"config.json"),Xg=await(await fetch("/models/whisper/config.json")).json(),console.log("[Whisper] Loaded config"),e&&e(20,"tokenizer.json"),Yg=await(await fetch("/models/whisper/tokenizer.json")).json(),console.log("[Whisper] Loaded tokenizer"),e&&e(40,"encoder_model.onnx"),console.log("[Whisper] Loading encoder..."),Kg=await _i.create("/models/whisper/encoder_model.onnx",{executionProviders:["wasm"],graphOptimizationLevel:"all"}),console.log("[Whisper] Encoder loaded"),e&&e(80,"decoder_model_merged.onnx"),console.log("[Whisper] Loading decoder..."),Zg=await _i.create("/models/whisper/decoder_model_merged.onnx",{executionProviders:["wasm"],graphOptimizationLevel:"all"}),console.log("[Whisper] Decoder loaded"),e&&e(100,"done"),od=!0,console.log("[Whisper] All models loaded successfully"),!0}catch(t){throw console.error("[Whisper] Failed to load models:",t),t}finally{xa=!1}}let Ne=null,Rt=!1;function Jg({onInterim:e,onFinal:t,onError:r}){if(!("webkitSpeechRecognition"in window)&&!("SpeechRecognition"in window)){r&&r(new Error("Speech recognition not supported"));return}if(Rt)return;const i=window.SpeechRecognition||window.webkitSpeechRecognition;Ne=new i,Ne.continuous=!0,Ne.interimResults=!0,Ne.lang="en-US";let a="";Ne.onresult=s=>{let o="",u="";for(let d=s.resultIndex;d<s.results.length;d++){const p=s.results[d][0].transcript;s.results[d].isFinal?u+=p:o+=p}o&&o!==a&&(a=o,e&&e(o)),u.trim()&&(a="",t&&t(u.trim()))},Ne.onerror=s=>{console.error("[Whisper] Continuous error:",s.error),s.error==="no-speech"||s.error==="aborted"?Rt&&setTimeout(()=>{if(Rt&&Ne)try{Ne.start()}catch{}},100):r&&r(new Error(s.error))},Ne.onend=()=>{Rt&&Ne&&setTimeout(()=>{try{Ne.start()}catch{}},100)},Rt=!0,Ne.start(),console.log("[Whisper] Continuous listening started")}function gn(){Rt=!1,Ne&&(Ne.stop(),Ne=null),console.log("[Whisper] Continuous listening stopped")}function Kf(){return Rt}const ae={wllama:null,modelLoaded:!1,tts:null,ttsStyle:null,ttsReady:!1,prebakedAudio:[],whisperReady:!1,isListening:!1,isProcessing:!1,isSpeaking:!1},Oe={status:document.getElementById("status"),statusText:document.getElementById("status-text"),userText:document.getElementById("user-text"),aiText:document.getElementById("ai-text"),voiceBtn:document.getElementById("voice-btn"),waveform:document.getElementById("waveform"),loading:document.getElementById("loading"),loadingLabel:document.getElementById("loading-label"),progress:document.getElementById("progress"),progressText:document.getElementById("progress-text"),loadingFact:document.getElementById("loading-fact")},ud=["� Llama-3.2-1B is Meta's latest efficient language model","💻 The Whisper model can transcribe 99 different languages","🎵 Supertonic TTS uses neural vocoder technology for natural speech","⚡ All models run 100% in your browser - no data leaves your device","🎤 Whisper was trained on 680,000 hours of audio data","🏠 Everything runs locally using WebAssembly (WASM)","🔒 Your conversations are completely private - no server involved","📊 Llama-3.2-1B has 1 billion parameters in just ~600MB","🎯 The TTS model generates speech at 24kHz sample rate","🚀 Llama-3.2 is optimized for mobile and edge devices","🌐 No internet required after models are cached"];let Vi=null;function ey(){let e=0;const t=()=>{Oe.loadingFact&&(Oe.loadingFact.textContent=ud[e],e=(e+1)%ud.length)};t(),Vi=setInterval(t,3e3)}function ty(){Vi&&(clearInterval(Vi),Vi=null)}function tt(e,t){Oe.status.className=`status ${e}`,Oe.statusText.textContent=t,Oe.voiceBtn.className=`voice-btn ${e}`,Oe.waveform&&Oe.waveform.classList.toggle("active",e==="listening"||e==="speaking")}function wt(e,t,r){Oe.progress.style.width=`${e}%`,Oe.progressText.textContent=t||`${e}%`,r&&Oe.loadingLabel&&(Oe.loadingLabel.textContent=r)}async function iy(){console.log("[Nadha] Loading Supertonic TTS..."),wt(0,"Initializing...","Loading TTS...");try{const e="/models/supertonic",t="/models/supertonic/M1.json",r=await Gg(e,{executionProviders:["webgpu","wasm"],graphOptimizationLevel:"all"},(i,a,s)=>{const o=Math.round(a/s*25);wt(o,`${a}/${s}: ${i}`,"Loading TTS...")});return ae.tts=r.textToSpeech,ae.ttsStyle=await qg([t]),ae.ttsReady=!0,console.log("[Nadha] TTS loaded successfully"),!0}catch(e){return console.error("[Nadha] TTS load failed:",e),!1}}const ry=["Hmm, let me think about that for a moment...","Okay, let me work on that for you...","Sure thing, give me just a second here...","Let me see what I can come up with...","Alright, processing that now...","One moment please, thinking..."];async function ay(){if(!(!ae.ttsReady||!ae.tts)){console.log("[Nadha] Pre-generating acknowledgment sounds...");for(const e of ry)try{const{wav:t,duration:r}=await ae.tts.call(e,"en",ae.ttsStyle,2,1.2,.05),i=Math.floor(ae.tts.sampleRate*r[0]),a=t.slice(0,i),s=Hf(a,ae.tts.sampleRate),o=new Blob([s],{type:"audio/wav"}),u=URL.createObjectURL(o);ae.prebakedAudio.push({phrase:e,url:u})}catch(t){console.error("[Nadha] Failed to prebake:",e,t)}console.log("[Nadha] Pre-baked",ae.prebakedAudio.length,"acknowledgments")}}function ny(){if(ae.prebakedAudio.length===0)return null;const e=Math.floor(Math.random()*ae.prebakedAudio.length),{url:t,phrase:r}=ae.prebakedAudio[e];console.log("[Nadha] Playing acknowledgment:",r);const i=new Audio(t);return i.play().catch(a=>{console.log("[Nadha] Autoplay blocked, will play after interaction")}),i}async function sy(){console.log("[Nadha] Loading LLM..."),wt(60,"Initializing...","Loading SmolLM2...");try{return ae.wllama=new gm(ym,{parallelDownloads:3}),await ae.wllama.loadModelFromHF("HuggingFaceTB/SmolLM2-360M-Instruct-GGUF","smollm2-360m-instruct-q8_0.gguf",{progressCallback:({loaded:e,total:t})=>{const r=60+Math.round(e/t*35);wt(r,`${Math.round(e/t*100)}%`,"Loading SmolLM2...")}}),ae.modelLoaded=!0,console.log("[Nadha] LLM loaded successfully"),!0}catch(e){return console.error("[Nadha] LLM load failed:",e),!1}}async function oy(){if(ae.modelLoaded){console.log("[Nadha] Pre-warming LLM...");try{await ae.wllama.createCompletion(`<|im_start|>user
Hi<|im_end|>
<|im_start|>assistant
`,{nPredict:5,sampling:{temp:.1}}),console.log("[Nadha] LLM pre-warmed")}catch{}}}async function uy(e){if(!ae.modelLoaded||ae.isProcessing)return;ae.isProcessing=!0,tt("thinking","Thinking..."),Oe.aiText.textContent="";const t=ny();try{const i=`<|im_start|>system
You are Nadha, an intelligent and charming voice assistant. You speak naturally like a helpful friend.

PERSONALITY:
- Warm, witty, and genuinely helpful
- Confident but humble - admit when you don't know something
- Curious and engaging - ask follow-up questions when appropriate
- Use natural conversational speech patterns

RESPONSE GUIDELINES:
- Keep responses concise (1-3 sentences) since you're a voice assistant
- Speak in complete, natural sentences - avoid bullet points or lists
- When telling jokes, include the full setup and punchline
- For factual questions, give accurate, direct answers
- For complex topics, summarize the key point clearly
- If asked about yourself, you're Nadha, running entirely in the browser on-device

KNOWLEDGE:
- You have broad knowledge about science, technology, history, culture, and everyday topics
- For current events, acknowledge your knowledge may be limited
- When uncertain, say so honestly rather than making things up

VOICE OPTIMIZATION:
- Avoid using asterisks, markdown, emojis, or special formatting
- Don't say "Here's" or "Sure!" at the start - just answer naturally
- End responses with a complete thought, not trailing off<|im_end|>
<|im_start|>user
${e}<|im_end|>
<|im_start|>assistant
`;let a=[],s="",o=0;await ae.wllama.createCompletion(i,{nPredict:100,sampling:{temp:.8,top_k:40,top_p:.9,repeatPenalty:1.2},onNewToken:async(d,p)=>{if(a.push(d),o++,o%5!==0)return;const f=await ae.wllama.detokenize(a);s=new TextDecoder().decode(f).replace(/<\|im_end\|>.*$/s,"").trim(),Oe.aiText.textContent=s}});const u=await ae.wllama.detokenize(a);if(s=new TextDecoder().decode(u).replace(/<\|im_end\|>.*$/s,"").trim(),Oe.aiText.textContent=s,s&&s.length>2){tt("speaking","Preparing response...");const d=ly(s);t&&!t.ended&&await new Promise(f=>{t.onended=f,setTimeout(f,5e3)});const p=await d;p&&(tt("speaking","Speaking..."),await dy(p))}console.log("[Nadha] LLM response:",s),ae.isProcessing=!1,py()}catch(r){console.error("[Nadha] LLM error:",r),ae.isProcessing=!1,tt("idle","Click to speak")}}let it=null;async function ly(e){if(!e.trim()||!ae.ttsReady||!ae.tts)return null;console.log("[TTS] Generating audio for:",e.substring(0,40)+"...");try{const{wav:t,duration:r}=await ae.tts.call(e,"en",ae.ttsStyle,2,1,.1),i=Math.floor(ae.tts.sampleRate*r[0]),a=t.slice(0,i),s=Hf(a,ae.tts.sampleRate),o=new Blob([s],{type:"audio/wav"}),u=URL.createObjectURL(o);return console.log("[TTS] Audio generated successfully"),{url:u,duration:r[0]}}catch(t){return console.error("[TTS] Generation error:",t),null}}async function dy(e){if(e)return Kf()&&(gn(),ae.isListening=!1),ae.isSpeaking=!0,new Promise(t=>{it=new Audio(e.url),it.onended=()=>{URL.revokeObjectURL(e.url),ae.isSpeaking=!1,console.log("[TTS] Playback finished"),t()},it.onerror=()=>{URL.revokeObjectURL(e.url),ae.isSpeaking=!1,t()},it.play().catch(()=>{ae.isSpeaking=!1,t()})})}const Zf=[];let Ua=!1;function py(){const e=()=>{const t=it&&!it.ended&&!it.paused;Zf.length>0||Ua||t?setTimeout(e,100):(ae.isSpeaking=!1,tt("listening","Listening..."),setTimeout(()=>tr(),500))};e()}function tr(){if(!ae.whisperReady){console.error("[Nadha] Whisper not ready");return}ae.isListening=!0,tt("listening","Listening..."),Oe.userText.textContent="",Jg({onInterim:e=>{Oe.userText.textContent=`"${e}..."`,tt("listening","Listening...")},onFinal:async e=>{console.log("[Nadha] Final transcript:",e),Oe.userText.textContent=`"${e}"`,e.trim()&&!ae.isProcessing&&(gn(),ae.isListening=!1,await uy(e),ae.modelLoaded&&!ae.isSpeaking&&setTimeout(()=>tr(),500))},onError:e=>{console.error("[Nadha] STT error:",e)}})}window.toggleVoice=async function(){if(!ae.modelLoaded)return;const e=document.getElementById("hint");if(e&&e.classList.add("hidden"),ae.isSpeaking||Ua){console.log("[Nadha] Stopping TTS..."),it&&(it.pause(),it=null),Zf.length=0,Ua=!1,window.speechSynthesis.cancel(),ae.isSpeaking=!1,tt("idle","Click to speak");return}Kf()?(gn(),ae.isListening=!1,tt("idle","Click to speak"),console.log("[Nadha] Stopped listening")):ae.isProcessing||(tr(),console.log("[Nadha] Started always-on listening"))};async function cy(){console.log("[Nadha] Starting..."),ey(),await iy()?ay():console.warn("[Nadha] TTS failed, will use fallback");try{wt(30,"Initializing...","Loading Whisper STT..."),await Qg((r,i)=>{wt(30+Math.round(r*.25),`${r}%`,"Loading Whisper STT...")}),ae.whisperReady=!0,console.log("[Nadha] Whisper STT ready")}catch(r){console.error("[Nadha] Whisper failed:",r)}const t=await sy();t&&await oy(),ty(),t?(wt(100,"Ready!"),Oe.loading.classList.add("hidden"),tt("idle","Click to start"),console.log("[Nadha] All systems ready"),ae.whisperReady&&setTimeout(()=>{tr(),console.log("[Nadha] Auto-started always-on listening")},1e3)):wt(0,"Error loading models")}cy();
