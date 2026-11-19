var Wt=Object.defineProperty;var qt=Object.getOwnPropertyDescriptor;var u=(o,t,e,s)=>{for(var r=s>1?void 0:s?qt(t,e):t,i=o.length-1,a;i>=0;i--)(a=o[i])&&(r=(s?a(t,e,r):a(r))||r);return s&&r&&Wt(t,e,r),r};var Z=globalThis,tt=Z.ShadowRoot&&(Z.ShadyCSS===void 0||Z.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,at=Symbol(),$t=new WeakMap,L=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==at)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(tt&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=$t.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&$t.set(e,t))}return t}toString(){return this.cssText}},bt=o=>new L(typeof o=="string"?o:o+"",void 0,at),C=(o,...t)=>{let e=o.length===1?o[0]:t.reduce((s,r,i)=>s+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+o[i+1],o[0]);return new L(e,o,at)},zt=(o,t)=>{if(tt)o.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),r=Z.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=e.cssText,o.appendChild(s)}},nt=tt?o=>o:o=>o instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return bt(e)})(o):o;var{is:Ft,defineProperty:Vt,getOwnPropertyDescriptor:Kt,getOwnPropertyNames:Yt,getOwnPropertySymbols:Gt,getPrototypeOf:Jt}=Object,et=globalThis,_t=et.trustedTypes,Xt=_t?_t.emptyScript:"",Qt=et.reactiveElementPolyfillSupport,H=(o,t)=>o,I={toAttribute(o,t){switch(t){case Boolean:o=o?Xt:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,t){let e=o;switch(t){case Boolean:e=o!==null;break;case Number:e=o===null?null:Number(o);break;case Object:case Array:try{e=JSON.parse(o)}catch{e=null}}return e}},st=(o,t)=>!Ft(o,t),wt={attribute:!0,type:String,converter:I,reflect:!1,useDefault:!1,hasChanged:st};Symbol.metadata??=Symbol("metadata"),et.litPropertyMetadata??=new WeakMap;var S=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=wt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),r=this.getPropertyDescriptor(t,s,e);r!==void 0&&Vt(this.prototype,t,r)}}static getPropertyDescriptor(t,e,s){let{get:r,set:i}=Kt(this.prototype,t)??{get(){return this[e]},set(a){this[e]=a}};return{get:r,set(a){let h=r?.call(this);i?.call(this,a),this.requestUpdate(t,h,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??wt}static _$Ei(){if(this.hasOwnProperty(H("elementProperties")))return;let t=Jt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(H("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(H("properties"))){let e=this.properties,s=[...Yt(e),...Gt(e)];for(let r of s)this.createProperty(r,e[r])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,r]of e)this.elementProperties.set(s,r)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let r=this._$Eu(e,s);r!==void 0&&this._$Eh.set(r,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let r of s)e.unshift(nt(r))}else t!==void 0&&e.push(nt(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return zt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,s);if(r!==void 0&&s.reflect===!0){let i=(s.converter?.toAttribute!==void 0?s.converter:I).toAttribute(e,s.type);this._$Em=t,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(t,e){let s=this.constructor,r=s._$Eh.get(t);if(r!==void 0&&this._$Em!==r){let i=s.getPropertyOptions(r),a=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:I;this._$Em=r;let h=a.fromAttribute(e,i.type);this[r]=h??this._$Ej?.get(r)??h,this._$Em=null}}requestUpdate(t,e,s,r=!1,i){if(t!==void 0){let a=this.constructor;if(r===!1&&(i=this[t]),s??=a.getPropertyOptions(t),!((s.hasChanged??st)(i,e)||s.useDefault&&s.reflect&&i===this._$Ej?.get(t)&&!this.hasAttribute(a._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:r,wrapped:i},a){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,a??e??this[t]),i!==!0||a!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),r===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[r,i]of this._$Ep)this[r]=i;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[r,i]of s){let{wrapped:a}=i,h=this[r];a!==!0||this._$AL.has(r)||h===void 0||this.C(r,void 0,i,h)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};S.elementStyles=[],S.shadowRootOptions={mode:"open"},S[H("elementProperties")]=new Map,S[H("finalized")]=new Map,Qt?.({ReactiveElement:S}),(et.reactiveElementVersions??=[]).push("2.1.2");var mt=globalThis,xt=o=>o,rt=mt.trustedTypes,At=rt?rt.createPolicy("lit-html",{createHTML:o=>o}):void 0,Tt="$lit$",D=`lit$${Math.random().toFixed(9).slice(2)}$`,Pt="?"+D,Zt=`<${Pt}>`,M=document,q=()=>M.createComment(""),F=o=>o===null||typeof o!="object"&&typeof o!="function",gt=Array.isArray,te=o=>gt(o)||typeof o?.[Symbol.iterator]=="function",ht=`[ 	
\f\r]`,W=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,St=/-->/g,kt=/>/g,P=RegExp(`>|${ht}(?:([^\\s"'>=/]+)(${ht}*=${ht}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Et=/'/g,Ct=/"/g,Rt=/^(?:script|style|textarea|title)$/i,vt=o=>(t,...e)=>({_$litType$:o,strings:t,values:e}),d=vt(1),ye=vt(2),$e=vt(3),N=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),Dt=new WeakMap,R=M.createTreeWalker(M,129);function Mt(o,t){if(!gt(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return At!==void 0?At.createHTML(t):t}var ee=(o,t)=>{let e=o.length-1,s=[],r,i=t===2?"<svg>":t===3?"<math>":"",a=W;for(let h=0;h<e;h++){let n=o[h],c,g,m=-1,$=0;for(;$<n.length&&(a.lastIndex=$,g=a.exec(n),g!==null);)$=a.lastIndex,a===W?g[1]==="!--"?a=St:g[1]!==void 0?a=kt:g[2]!==void 0?(Rt.test(g[2])&&(r=RegExp("</"+g[2],"g")),a=P):g[3]!==void 0&&(a=P):a===P?g[0]===">"?(a=r??W,m=-1):g[1]===void 0?m=-2:(m=a.lastIndex-g[2].length,c=g[1],a=g[3]===void 0?P:g[3]==='"'?Ct:Et):a===Ct||a===Et?a=P:a===St||a===kt?a=W:(a=P,r=void 0);let w=a===P&&o[h+1].startsWith("/>")?" ":"";i+=a===W?n+Zt:m>=0?(s.push(c),n.slice(0,m)+Tt+n.slice(m)+D+w):n+D+(m===-2?h:w)}return[Mt(o,i+(o[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},V=class o{constructor({strings:t,_$litType$:e},s){let r;this.parts=[];let i=0,a=0,h=t.length-1,n=this.parts,[c,g]=ee(t,e);if(this.el=o.createElement(c,s),R.currentNode=this.el.content,e===2||e===3){let m=this.el.content.firstChild;m.replaceWith(...m.childNodes)}for(;(r=R.nextNode())!==null&&n.length<h;){if(r.nodeType===1){if(r.hasAttributes())for(let m of r.getAttributeNames())if(m.endsWith(Tt)){let $=g[a++],w=r.getAttribute(m).split(D),Q=/([.?@])?(.*)/.exec($);n.push({type:1,index:i,name:Q[2],strings:w,ctor:Q[1]==="."?ct:Q[1]==="?"?dt:Q[1]==="@"?pt:U}),r.removeAttribute(m)}else m.startsWith(D)&&(n.push({type:6,index:i}),r.removeAttribute(m));if(Rt.test(r.tagName)){let m=r.textContent.split(D),$=m.length-1;if($>0){r.textContent=rt?rt.emptyScript:"";for(let w=0;w<$;w++)r.append(m[w],q()),R.nextNode(),n.push({type:2,index:++i});r.append(m[$],q())}}}else if(r.nodeType===8)if(r.data===Pt)n.push({type:2,index:i});else{let m=-1;for(;(m=r.data.indexOf(D,m+1))!==-1;)n.push({type:7,index:i}),m+=D.length-1}i++}}static createElement(t,e){let s=M.createElement("template");return s.innerHTML=t,s}};function O(o,t,e=o,s){if(t===N)return t;let r=s!==void 0?e._$Co?.[s]:e._$Cl,i=F(t)?void 0:t._$litDirective$;return r?.constructor!==i&&(r?._$AO?.(!1),i===void 0?r=void 0:(r=new i(o),r._$AT(o,e,s)),s!==void 0?(e._$Co??=[])[s]=r:e._$Cl=r),r!==void 0&&(t=O(o,r._$AS(o,t.values),r,s)),t}var lt=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,r=(t?.creationScope??M).importNode(e,!0);R.currentNode=r;let i=R.nextNode(),a=0,h=0,n=s[0];for(;n!==void 0;){if(a===n.index){let c;n.type===2?c=new K(i,i.nextSibling,this,t):n.type===1?c=new n.ctor(i,n.name,n.strings,this,t):n.type===6&&(c=new ut(i,this,t)),this._$AV.push(c),n=s[++h]}a!==n?.index&&(i=R.nextNode(),a++)}return R.currentNode=M,r}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},K=class o{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,r){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=O(this,t,e),F(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==N&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):te(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==p&&F(this._$AH)?this._$AA.nextSibling.data=t:this.T(M.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,r=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=V.createElement(Mt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(e);else{let i=new lt(r,this),a=i.u(this.options);i.p(e),this.T(a),this._$AH=i}}_$AC(t){let e=Dt.get(t.strings);return e===void 0&&Dt.set(t.strings,e=new V(t)),e}k(t){gt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,r=0;for(let i of t)r===e.length?e.push(s=new o(this.O(q()),this.O(q()),this,this.options)):s=e[r],s._$AI(i),r++;r<e.length&&(this._$AR(s&&s._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=xt(t).nextSibling;xt(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},U=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,r,i){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=i,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=p}_$AI(t,e=this,s,r){let i=this.strings,a=!1;if(i===void 0)t=O(this,t,e,0),a=!F(t)||t!==this._$AH&&t!==N,a&&(this._$AH=t);else{let h=t,n,c;for(t=i[0],n=0;n<i.length-1;n++)c=O(this,h[s+n],e,n),c===N&&(c=this._$AH[n]),a||=!F(c)||c!==this._$AH[n],c===p?t=p:t!==p&&(t+=(c??"")+i[n+1]),this._$AH[n]=c}a&&!r&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},ct=class extends U{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}},dt=class extends U{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}},pt=class extends U{constructor(t,e,s,r,i){super(t,e,s,r,i),this.type=5}_$AI(t,e=this){if((t=O(this,t,e,0)??p)===N)return;let s=this._$AH,r=t===p&&s!==p||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,i=t!==p&&(s===p||r);r&&this.element.removeEventListener(this.name,this,s),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},ut=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){O(this,t)}};var se=mt.litHtmlPolyfillSupport;se?.(V,K),(mt.litHtmlVersions??=[]).push("3.3.3");var Nt=(o,t,e)=>{let s=e?.renderBefore??t,r=s._$litPart$;if(r===void 0){let i=e?.renderBefore??null;s._$litPart$=r=new K(t.insertBefore(q(),i),i,void 0,e??{})}return r._$AI(o),r};var ft=globalThis,b=class extends S{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Nt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return N}};b._$litElement$=!0,b.finalized=!0,ft.litElementHydrateSupport?.({LitElement:b});var re=ft.litElementPolyfillSupport;re?.({LitElement:b});(ft.litElementVersions??=[]).push("4.2.2");var oe={attribute:!0,type:String,converter:I,reflect:!1,hasChanged:st},ie=(o=oe,t,e)=>{let{kind:s,metadata:r}=e,i=globalThis.litPropertyMetadata.get(r);if(i===void 0&&globalThis.litPropertyMetadata.set(r,i=new Map),s==="setter"&&((o=Object.create(o)).wrapped=!0),i.set(e.name,o),s==="accessor"){let{name:a}=e;return{set(h){let n=t.get.call(this);t.set.call(this,h),this.requestUpdate(a,n,o,!0,h)},init(h){return h!==void 0&&this.C(a,void 0,o,h),h}}}if(s==="setter"){let{name:a}=e;return function(h){let n=this[a];t.call(this,h),this.requestUpdate(a,n,o,!0,h)}}throw Error("Unsupported decorator location: "+s)};function x(o){return(t,e)=>typeof e=="object"?ie(o,t,e):((s,r,i)=>{let a=r.hasOwnProperty(i);return r.constructor.createProperty(i,s),a?Object.getOwnPropertyDescriptor(r,i):void 0})(o,t,e)}function v(o){return x({...o,state:!0,attribute:!1})}function B(o){return t=>{customElements.get(o)||customElements.define(o,t)}}var Y={en:{schedule:"Schedule",schedule_off:"Schedule off \u2014 the zone keeps manual settings.",no_blocks:"No schedule yet. Choose a day and add blocks.",edit_day:"Edit",add_block:"Add block",copy_to:"Copy to",save:"Save",cancel:"Cancel",saved:"Saved",error:"Not saved",temperature:"Temperature",remove:"Remove",overrides:"Overrides",no_overrides:"No overrides.",add_override:"Add override",from:"From",to:"Until",reason:"Reason",next:"Next",resume:"Resume schedule",hold_until:"Hold until",hold_permanent:"Hold permanently",hold:"Hold",on:"On",off:"Off",unavailable:"Unavailable","preset.none":"Manual","preset.comfort":"Comfort","preset.eco":"Eco","preset.sleep":"Sleep","preset.away":"Away","day.mon":"Mon","day.tue":"Tue","day.wed":"Wed","day.thu":"Thu","day.fri":"Fri","day.sat":"Sat","day.sun":"Sun",pick_entity:"Choose a Heat Zones thermostat",show_controls:"Show controls",show_schedule:"Show schedule",show_overrides:"Show overrides"},pl:{schedule:"Harmonogram",schedule_off:"Harmonogram wy\u0142\u0105czony \u2014 strefa trzyma r\u0119czne ustawienia.",no_blocks:"Brak harmonogramu. Wybierz dzie\u0144 i dodaj bloki.",edit_day:"Edytuj",add_block:"Dodaj blok",copy_to:"Kopiuj do",save:"Zapisz",cancel:"Anuluj",saved:"Zapisano",error:"Nie zapisano",temperature:"Temperatura",remove:"Usu\u0144",overrides:"Nadpisania",no_overrides:"Brak nadpisa\u0144.",add_override:"Dodaj nadpisanie",from:"Od",to:"Do",reason:"Pow\xF3d",next:"Nast\u0119pnie",resume:"Wr\xF3\u0107 do harmonogramu",hold_until:"Trzymaj do",hold_permanent:"Trzymaj na sta\u0142e",hold:"Trzymaj",on:"W\u0142.",off:"Wy\u0142.",unavailable:"Niedost\u0119pne","preset.none":"R\u0119cznie","preset.comfort":"Komfort","preset.eco":"Eko","preset.sleep":"Sen","preset.away":"Poza domem","day.mon":"Pn","day.tue":"Wt","day.wed":"\u015Ar","day.thu":"Cz","day.fri":"Pt","day.sat":"So","day.sun":"Nd",pick_entity:"Wybierz termostat Stref ciep\u0142a",show_controls:"Poka\u017C sterowanie",show_schedule:"Poka\u017C harmonogram",show_overrides:"Poka\u017C nadpisania"}};function y(o){let t=(o?.locale?.language??o?.language??"en").split("-")[0];return t in Y?t:"en"}function l(o,t){return Y[o]?.[t]??Y.en[t]??t}function T(o,t){let e=`preset.${t}`;return Y[o]?.[e]??Y.en[e]??t}function k(o,t){return t==null||Number.isNaN(t)?"\u2014":`${t.toLocaleString(o,{maximumFractionDigits:1})} \xB0C`}function G(o,t){let e=new Date(t),s=new Date,r=e.toLocaleTimeString(o,{hour:"2-digit",minute:"2-digit"});return e.toDateString()===s.toDateString()?r:`${e.toLocaleDateString(o,{weekday:"short",day:"numeric",month:"numeric"})} ${r}`}var A=["mon","tue","wed","thu","fri","sat","sun"];function ae(o){return o.preset_mode!==void 0?o.preset_mode:`t:${o.temperature}`}function it(o){return o.startsWith("t:")?{temperature:Number(o.slice(2))}:{preset_mode:o}}function yt(o){let t=Object.fromEntries(A.map(e=>[e,[]]));for(let e of o)for(let s of e.days)t[s].push({time:e.time,value:ae(e)});for(let e of A)t[e].sort((s,r)=>s.time.localeCompare(r.time));return t}function Ot(o){let t=new Map;for(let s of A)for(let r of o[s]){let i=`${r.time}|${r.value}`,a=t.get(i)??[];a.includes(s)||a.push(s),t.set(i,a)}let e=[];for(let[s,r]of t){let[i,a]=[s.slice(0,5),s.slice(6)];e.push({days:r,time:i,...it(a)})}return e.sort((s,r)=>A.indexOf(s.days[0])-A.indexOf(r.days[0])||s.time.localeCompare(r.time)),e}function ne(o){let[t,e]=o.split(":").map(Number);return t*60+e}function Ut(o,t){let e=A.indexOf(t),s=null;for(let n=1;n<=7&&s===null;n++){let c=o[A[(e-n+7)%7]];c.length&&(s=c[c.length-1].value)}let r=o[t];if(s===null&&!r.length)return[];let i=[],a=0,h=s??r[0].value;for(let n of r){let c=ne(n.time);c>a&&i.push({from:a,to:c,value:h}),a=c,h=n.value}return i.push({from:a,to:1440,value:h}),i}function Bt(o,t){return o.startsWith("t:")?Number(o.slice(2)):t[o]??null}var he=19.75,le=3.25;function jt(o){if(o===null||Number.isNaN(o))return{side:"unknown",share:1};let t=Math.max(-1,Math.min(1,(o-he)/le));return{side:t<0?"cold":"warm",share:Math.round((.35+.65*Math.abs(t))*100)/100}}function J(o){let t=e=>String(e).padStart(2,"0");return`${o.getFullYear()}-${t(o.getMonth()+1)}-${t(o.getDate())}T${t(o.getHours())}:${t(o.getMinutes())}`}var X=C`
  :host {
    /* tokens:start */
    --hz-font-family: var(--heat-zones-font-family, var(--ha-font-family-body));
    --hz-font-size: var(--heat-zones-font-size, var(--ha-font-size-m));
    --hz-small-font-size: var(--heat-zones-small-font-size, var(--ha-font-size-s));
    --hz-tiny-font-size: var(--heat-zones-tiny-font-size, var(--ha-font-size-xs));
    --hz-title-font-size: var(--heat-zones-title-font-size, var(--ha-font-size-l));
    --hz-title-font-weight: var(--heat-zones-title-font-weight, var(--ha-font-weight-medium));
    --hz-temperature-font-size: var(--heat-zones-temperature-font-size, var(--ha-font-size-4xl));
    --hz-temperature-font-weight: var(--heat-zones-temperature-font-weight, var(--ha-font-weight-light));
    --hz-target-font-size: var(--heat-zones-target-font-size, var(--ha-font-size-xl));
    --hz-line-height: var(--heat-zones-line-height, var(--ha-line-height-normal));
    --hz-condensed-line-height: var(--heat-zones-condensed-line-height, var(--ha-line-height-condensed));

    --hz-padding: var(--heat-zones-card-padding, var(--ha-space-4));
    --hz-gap: var(--heat-zones-gap, var(--ha-space-2));
    --hz-small-gap: var(--heat-zones-small-gap, var(--ha-space-1));
    --hz-section-gap: var(--heat-zones-section-gap, var(--ha-space-4));
    --hz-control-height: var(--heat-zones-control-height, var(--ha-space-10));
    --hz-control-padding: var(--heat-zones-control-padding, var(--ha-space-2) var(--ha-space-4));
    --hz-input-padding: var(--heat-zones-input-padding, var(--ha-space-1) var(--ha-space-2));
    --hz-group-padding: var(--heat-zones-group-padding, var(--ha-space-1));
    --hz-sheet-padding: var(--heat-zones-sheet-padding, var(--ha-space-3));
    --hz-bar-height: var(--heat-zones-bar-height, var(--ha-space-6));

    --hz-border-width: var(--heat-zones-border-width, var(--ha-border-width-sm));
    --hz-focus-width: var(--heat-zones-focus-width, var(--ha-border-width-md));
    --hz-button-radius: var(--heat-zones-button-border-radius, var(--ha-border-radius-pill));
    --hz-icon-button-radius: var(--heat-zones-icon-button-border-radius, var(--ha-border-radius-pill));
    --hz-input-radius: var(--heat-zones-input-border-radius, var(--ha-border-radius-pill));
    --hz-group-radius: var(--heat-zones-group-border-radius, calc(var(--hz-control-height) / 2 + var(--hz-group-padding)));
    --hz-sheet-radius: var(--heat-zones-sheet-border-radius, calc(var(--hz-control-height) / 2 + var(--hz-sheet-padding)));
    --hz-bar-radius: var(--heat-zones-bar-border-radius, var(--ha-border-radius-md));

    --hz-text: var(--heat-zones-text-color, var(--primary-text-color));
    --hz-muted: var(--heat-zones-secondary-text-color, var(--secondary-text-color));
    --hz-disabled: var(--heat-zones-disabled-text-color, var(--disabled-text-color));
    --hz-accent: var(--heat-zones-accent-color, var(--primary-color));
    --hz-on-accent: var(--heat-zones-on-accent-color, var(--text-primary-color));
    --hz-selected: var(--heat-zones-selected-color, color-mix(in srgb, var(--heat-zones-accent-color, var(--primary-color)) 18%, transparent));
    --hz-hover: var(--heat-zones-hover-color, var(--secondary-background-color));
    --hz-line: var(--heat-zones-divider-color, var(--divider-color));
    --hz-input-background: var(--heat-zones-input-background-color, var(--input-fill-color));
    --hz-track: var(--heat-zones-track-color, var(--secondary-background-color));

    --hz-glass-color: var(--heat-zones-glass-color, var(--card-background-color));
    --hz-glass-opacity: var(--heat-zones-glass-opacity, 70%);
    --hz-glass-blur: var(--heat-zones-glass-blur, var(--ha-space-4));
    --hz-glass-edge: var(--heat-zones-glass-border-color, var(--divider-color));
    --hz-glass-highlight: var(--heat-zones-glass-highlight-color, color-mix(in srgb, var(--heat-zones-glass-border-color, var(--divider-color)), var(--ha-color-white) 40%));
    --hz-glass-shadow: var(--heat-zones-glass-shadow, var(--ha-box-shadow-s));
    --hz-sheet-shadow: var(--heat-zones-sheet-shadow, var(--ha-box-shadow-m));
    --hz-duration: var(--heat-zones-transition-duration, var(--ha-animation-duration-fast));
    --hz-press-scale: var(--heat-zones-press-scale, 0.97);

    --hz-heating: var(--heat-zones-heating-color, var(--state-climate-heat-color));
    --hz-window: var(--heat-zones-window-color, var(--state-binary_sensor-window-on-color, var(--info-color)));
    --hz-problem: var(--heat-zones-problem-color, var(--state-binary_sensor-problem-on-color, var(--error-color)));

    --hz-cold: var(--heat-zones-cold-color, var(--state-climate-cool-color));
    --hz-warm: var(--heat-zones-warm-color, var(--state-climate-heat-color));
    --hz-unknown: var(--heat-zones-unknown-color, var(--disabled-color));
    --hz-schedule-base: var(--heat-zones-schedule-base-color, var(--card-background-color));
    --hz-schedule-text: var(--heat-zones-schedule-text-color, var(--primary-text-color));
    --hz-schedule-strength: var(--heat-zones-schedule-strength, 70%);
    /* tokens:end */

    /* the glass material of the controls, made of the tokens above */
    --hz-glass-fill: color-mix(in srgb, var(--hz-glass-color) var(--hz-glass-opacity), transparent);
    --hz-glass-filter: blur(var(--hz-glass-blur));
    --hz-press: scale(var(--hz-press-scale));

    display: block;
    color: var(--hz-text);
    font-family: var(--hz-font-family);
    font-size: var(--hz-font-size);
    line-height: var(--hz-line-height);
  }
  /* Accessibility, as Liquid Glass does it: solid material without translucency, clear edges with more contrast,
     no press animation with reduced motion (HA shortens its animation durations itself). */
  @media (prefers-reduced-transparency: reduce) {
    :host {
      --hz-glass-fill: var(--hz-glass-color);
      --hz-glass-filter: none;
    }
  }
  @media (prefers-contrast: more) {
    :host {
      --hz-glass-fill: var(--hz-glass-color);
      --hz-glass-filter: none;
      --hz-glass-edge: var(--hz-text);
      --hz-glass-highlight: var(--hz-text);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :host {
      --hz-press: none;
    }
  }
  .muted {
    color: var(--hz-muted);
    font-size: var(--hz-small-font-size);
  }
  .row {
    display: flex;
    align-items: center;
    gap: var(--hz-gap);
    flex-wrap: wrap;
  }
  .grow {
    flex: 1;
    min-width: 0;
  }
  .spaced {
    margin-top: var(--hz-gap);
  }
  .actions {
    justify-content: flex-end;
  }
  /* Glass is only for controls floating over the content: groups of buttons, single buttons, sheets. */
  .glass {
    background: var(--hz-glass-fill);
    -webkit-backdrop-filter: var(--hz-glass-filter);
    backdrop-filter: var(--hz-glass-filter);
    border: var(--hz-border-width) solid var(--hz-glass-edge);
    border-top-color: var(--hz-glass-highlight);
    box-shadow: var(--hz-glass-shadow);
  }
  /* One glass container for controls that belong together; the buttons inside are not glass themselves. */
  .group {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--hz-small-gap);
    padding: var(--hz-group-padding);
    border-radius: var(--hz-group-radius);
    box-sizing: border-box;
  }
  .sheet {
    border-radius: var(--hz-sheet-radius);
    padding: var(--hz-sheet-padding);
    box-shadow: var(--hz-sheet-shadow);
  }
  button {
    font: inherit;
    color: inherit;
    background: transparent;
    border: var(--hz-border-width) solid transparent;
    border-radius: var(--hz-button-radius);
    padding: var(--hz-control-padding);
    min-height: var(--hz-control-height);
    cursor: pointer;
    transition:
      transform var(--hz-duration),
      background-color var(--hz-duration);
  }
  button:hover {
    background: var(--hz-hover);
  }
  button:active {
    transform: var(--hz-press);
  }
  button.active {
    background: var(--hz-selected);
    color: var(--hz-accent);
    font-weight: var(--hz-title-font-weight);
  }
  button.primary {
    background: var(--hz-accent);
    border-color: var(--hz-accent);
    color: var(--hz-on-accent);
    box-shadow: var(--hz-glass-shadow);
  }
  button.icon {
    border-radius: var(--hz-icon-button-radius);
    min-width: var(--hz-control-height);
    padding: 0;
  }
  button:disabled {
    color: var(--hz-disabled);
    background: transparent;
    cursor: default;
    transform: none;
  }
  input,
  select {
    font: inherit;
    color: inherit;
    background: var(--hz-input-background);
    border: var(--hz-border-width) solid var(--hz-line);
    border-radius: var(--hz-input-radius);
    padding: var(--hz-input-padding);
    min-height: var(--hz-control-height);
    box-sizing: border-box;
  }
  input[type="number"] {
    width: 8ch;
  }
  h3 {
    margin: 0;
    font-size: var(--hz-title-font-size);
    font-weight: var(--hz-title-font-weight);
  }
  section + section {
    margin-top: var(--hz-section-gap);
    padding-top: var(--hz-section-gap);
    border-top: var(--hz-border-width) solid var(--hz-line);
  }
`;function _(...o){return o.filter(Boolean).join(" ")}async function It(o,t){return(await o.callWS({type:"call_service",domain:"heat_zones",service:"get_schedule",target:{entity_id:t},return_response:!0})).response?.[t]??null}function Lt(o,t){return o.states[t]?.attributes.preset_temperatures??{}}function Ht(o,t){return t.startsWith("t:")?k(o,Number(t.slice(2))):T(o,t)}var z=class extends b{constructor(){super(...arguments);this.entity="";this.schedule=null;this.draft=null;this.day=null;this.copyTo=[];this.message="";this.loadedFor="";this.stamp=""}updated(){let e=this.hass?.states[this.entity];if(!e)return;let s=e.last_updated;!this.draft&&(this.loadedFor!==this.entity||s!==this.stamp)&&(this.loadedFor=this.entity,this.stamp=s,It(this.hass,this.entity).then(r=>this.schedule=r,()=>this.schedule=null))}get days(){return this.draft??yt(this.schedule?.weekly??[])}edit(e){this.draft||(this.draft=yt(this.schedule?.weekly??[])),this.day=e,this.copyTo=[],this.message=""}change(e,s){if(!this.draft||!this.day)return;let r=this.draft[this.day].map((i,a)=>a===e?{...i,...s}:i);this.draft={...this.draft,[this.day]:r}}add(){if(!this.draft||!this.day)return;let e=this.draft[this.day],s=e[e.length-1],r=s?`${String(Math.min(23,Number(s.time.slice(0,2))+2)).padStart(2,"0")}:00`:"06:00";this.draft={...this.draft,[this.day]:[...e,{time:r,value:"comfort"}]}}removeBlock(e){!this.draft||!this.day||(this.draft={...this.draft,[this.day]:this.draft[this.day].filter((s,r)=>r!==e)})}toggleCopy(e){this.copyTo=this.copyTo.includes(e)?this.copyTo.filter(s=>s!==e):[...this.copyTo,e]}cancel(){this.draft=null,this.day=null,this.copyTo=[]}async save(){if(!this.draft)return;let e={...this.draft};if(this.day){let s=[...e[this.day]].sort((r,i)=>r.time.localeCompare(i.time));e[this.day]=s;for(let r of this.copyTo)e[r]=s.map(i=>({...i}))}try{await this.hass.callService("heat_zones","set_schedule",{weekly:Ot(e)},{entity_id:this.entity}),this.message=l(y(this.hass),"saved"),this.draft=null,this.day=null,this.copyTo=[],this.stamp="",this.requestUpdate()}catch(s){this.message=`${l(y(this.hass),"error")}: ${s.message??s}`}}renderBar(e){let s=y(this.hass),r=Lt(this.hass,this.entity),i=Ut(this.days,e),a=this.day===e;return d`<div
      class="bar ${a?"selected":""}"
      part=${_("day-bar",a&&"selected")}
      @click=${()=>this.edit(e)}
    >
      ${i.map(h=>{let n=Bt(h.value,r),{side:c,share:g}=jt(n),m=h.from/1440*100,$=(h.to-h.from)/1440*100,w=$>9?Ht(s,h.value):"";return d`<div
          class="segment ${c}"
          part=${_("segment",c)}
          style="left:${m}%;width:${$}%;--hz-share:${Math.round(g*100)}%"
          title="${Ht(s,h.value)} ${n!==null?k(s,n):""}"
        >${w}</div>`})}
    </div>`}renderDay(){if(!this.draft||!this.day)return p;let e=y(this.hass),s=Lt(this.hass,this.entity),r=this.hass.states[this.entity]?.attributes.preset_modes?.filter(a=>a!=="none")??[],i=this.day;return d`<div class="blocks glass sheet" part="blocks sheet glass">
      <h3 part="sheet-title">${l(e,"edit_day")}: ${l(e,`day.${i}`)}</h3>
      ${this.draft[i].map((a,h)=>d`<div class="block" part="block">
          <input type="time" part="input" .value=${a.time} @change=${n=>this.change(h,{time:n.target.value})} />
          <select
            part="input"
            @change=${n=>{let c=n.target.value;this.change(h,{value:c==="t"?`t:${s.comfort??21}`:c})}}
          >
            ${r.map(n=>d`<option value=${n} ?selected=${a.value===n}>${T(e,n)}</option>`)}
            <option value="t" ?selected=${a.value.startsWith("t:")}>${l(e,"temperature")}</option>
          </select>
          ${a.value.startsWith("t:")?d`<input
                type="number"
                part="input"
                min="5"
                max="30"
                step="0.5"
                .value=${String(it(a.value).temperature)}
                @change=${n=>this.change(h,{value:`t:${n.target.value}`})}
              />`:d`<span class="muted">${k(e,s[a.value])}</span>`}
          <button class="icon" part="button icon" @click=${()=>this.removeBlock(h)} title=${l(e,"remove")}>✕</button>
        </div>`)}
      <div class="row"><button part="button" @click=${this.add}>＋ ${l(e,"add_block")}</button></div>
      <div class="row copy">
        <span class="muted">${l(e,"copy_to")}:</span>
        ${A.filter(a=>a!==i).map(a=>{let h=this.copyTo.includes(a);return d`<button class="icon ${h?"active":""}" part=${_("button","icon",h&&"active")} @click=${()=>this.toggleCopy(a)}>
            ${l(e,`day.${a}`)}
          </button>`})}
      </div>
      <div class="row actions">
        <button part="button" @click=${this.cancel}>${l(e,"cancel")}</button>
        <button class="primary" part="button primary" @click=${this.save}>${l(e,"save")}</button>
      </div>
    </div>`}render(){if(!this.hass||!this.hass.states[this.entity])return p;let e=y(this.hass),s=!(this.schedule?.weekly.length??0)&&!this.draft;return d`
      <div class="week" part="week">
        ${A.map(r=>d`<div
              class="day ${this.day===r?"selected":""}"
              part=${_("day-label",this.day===r&&"selected")}
              @click=${()=>this.edit(r)}
            >
              ${l(e,`day.${r}`)}
            </div>
            ${this.renderBar(r)}`)}
        <div class="hours" part="hours"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
      </div>
      ${s?d`<div class="muted spaced" part="message">${l(e,"no_blocks")}</div>`:p}
      ${this.renderDay()}
      ${this.message?d`<div class="muted spaced" part="message">${this.message}</div>`:p}
    `}};z.styles=[X,C`
      .week {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: var(--hz-small-gap) var(--hz-gap);
        align-items: center;
      }
      .day {
        font-size: var(--hz-small-font-size);
        color: var(--hz-muted);
        cursor: pointer;
      }
      .day.selected {
        color: var(--hz-accent);
        font-weight: var(--hz-title-font-weight);
      }
      .bar {
        position: relative;
        height: var(--hz-bar-height);
        border-radius: var(--hz-bar-radius);
        overflow: hidden;
        background: var(--hz-track);
        cursor: pointer;
      }
      .bar.selected {
        outline: var(--hz-focus-width) solid var(--hz-accent);
      }
      .segment {
        position: absolute;
        top: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--hz-tiny-font-size);
        white-space: nowrap;
        overflow: hidden;
        color: var(--hz-schedule-text);
        background: color-mix(
          in srgb,
          color-mix(in srgb, var(--hz-tone) var(--hz-schedule-strength), var(--hz-schedule-base)) var(--hz-share),
          var(--hz-schedule-base)
        );
        border-right: var(--hz-border-width) solid var(--hz-schedule-base);
        box-sizing: border-box;
      }
      .segment.cold {
        --hz-tone: var(--hz-cold);
      }
      .segment.warm {
        --hz-tone: var(--hz-warm);
      }
      .segment.unknown {
        --hz-tone: var(--hz-unknown);
      }
      .hours {
        display: flex;
        justify-content: space-between;
        font-size: var(--hz-tiny-font-size);
        color: var(--hz-muted);
        grid-column: 2;
      }
      .blocks {
        display: flex;
        flex-direction: column;
        gap: var(--hz-gap);
        margin-top: var(--hz-section-gap);
      }
      .block {
        display: flex;
        align-items: center;
        gap: var(--hz-small-gap);
      }
      .block select {
        flex: 1 1 auto;
        min-width: 0;
      }
      .block .muted {
        white-space: nowrap;
      }
    `],u([x({attribute:!1})],z.prototype,"hass",2),u([x()],z.prototype,"entity",2),u([v()],z.prototype,"schedule",2),u([v()],z.prototype,"draft",2),u([v()],z.prototype,"day",2),u([v()],z.prototype,"copyTo",2),u([v()],z.prototype,"message",2),z=u([B("heat-zones-schedule-editor")],z);var f=class extends b{constructor(){super(...arguments);this.entity="";this.schedule=null;this.adding=!1;this.from="";this.to="";this.value="away";this.reason="";this.message="";this.loadedFor="";this.stamp=""}updated(){let e=this.hass?.states[this.entity];e&&(this.loadedFor!==this.entity||e.last_updated!==this.stamp)&&(this.loadedFor=this.entity,this.stamp=e.last_updated,It(this.hass,this.entity).then(s=>this.schedule=s,()=>this.schedule=null))}open(){let e=new Date;this.from=J(e),this.to=J(new Date(e.getTime()+3*3600*1e3)),this.adding=!0,this.message=""}async add(){let e={start:new Date(this.from).toISOString(),end:new Date(this.to).toISOString(),reason:this.reason,source:"card",...it(this.value)};try{await this.hass.callService("heat_zones","add_override",e,{entity_id:this.entity}),this.adding=!1,this.reason="",this.stamp=""}catch(s){this.message=`${l(y(this.hass),"error")}: ${s.message??s}`}}removeOverride(e){this.hass.callService("heat_zones","remove_override",{override_id:e},{entity_id:this.entity})}render(){if(!this.hass||!this.hass.states[this.entity])return p;let e=y(this.hass),s=this.schedule?.overrides??[],r=this.hass.states[this.entity].attributes.preset_modes?.filter(i=>i!=="none")??[];return d`
      ${s.length?d`<ul part="list">
            ${s.map(i=>d`<li class="row" part="override">
                <span class="grow">
                  <strong>${i.preset_mode?T(e,i.preset_mode):k(e,i.temperature)}</strong>
                  ${i.reason?d` · ${i.reason}`:p}
                  <div class="muted">${G(e,i.start)} – ${G(e,i.end)}${i.source?` \xB7 ${i.source}`:""}</div>
                </span>
                <button
                  class="icon glass"
                  part="button icon glass"
                  @click=${()=>this.removeOverride(i.override_id)}
                  title=${l(e,"remove")}
                >
                  ✕
                </button>
              </li>`)}
          </ul>`:d`<div class="muted" part="message">${l(e,"no_overrides")}</div>`}
      ${this.adding?d`<div class="form glass sheet" part="form sheet glass">
            <span>${l(e,"from")}</span>
            <input type="datetime-local" part="input" .value=${this.from} @change=${i=>this.from=i.target.value} />
            <span>${l(e,"to")}</span>
            <input type="datetime-local" part="input" .value=${this.to} @change=${i=>this.to=i.target.value} />
            <span></span>
            <div class="row">
              <select part="input" @change=${i=>this.value=i.target.value}>
                ${r.map(i=>d`<option value=${i} ?selected=${this.value===i}>${T(e,i)}</option>`)}
                <option value="t:21" ?selected=${this.value.startsWith("t:")}>${l(e,"temperature")}</option>
              </select>
              ${this.value.startsWith("t:")?d`<input
                    type="number"
                    part="input"
                    min="5"
                    max="30"
                    step="0.5"
                    .value=${this.value.slice(2)}
                    @change=${i=>this.value=`t:${i.target.value}`}
                  />`:p}
            </div>
            <span>${l(e,"reason")}</span>
            <input part="input" .value=${this.reason} maxlength="200" @input=${i=>this.reason=i.target.value} />
            <span></span>
            <div class="row actions">
              <button part="button" @click=${()=>this.adding=!1}>${l(e,"cancel")}</button>
              <button class="primary" part="button primary" @click=${this.add}>${l(e,"save")}</button>
            </div>
          </div>`:d`<div class="row spaced">
            <button class="glass" part="button glass" @click=${this.open}>＋ ${l(e,"add_override")}</button>
          </div>`}
      ${this.message?d`<div class="muted spaced" part="message">${this.message}</div>`:p}
    `}};f.styles=[X,C`
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: var(--hz-gap);
      }
      .form {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: var(--hz-gap);
        align-items: center;
        margin-top: var(--hz-section-gap);
      }
    `],u([x({attribute:!1})],f.prototype,"hass",2),u([x()],f.prototype,"entity",2),u([v()],f.prototype,"schedule",2),u([v()],f.prototype,"adding",2),u([v()],f.prototype,"from",2),u([v()],f.prototype,"to",2),u([v()],f.prototype,"value",2),u([v()],f.prototype,"reason",2),u([v()],f.prototype,"message",2),f=u([B("heat-zones-overrides")],f);function ce(o){return o?.attributes?.homeai_schedule?.domain==="heat_zones"}var de="week, day-label, day-bar, segment, hours, blocks, sheet, sheet-title, block, input, button, message, selected, cold, warm, unknown, active, primary, icon, glass",pe="list, override, form, sheet, input, button, message, primary, icon, glass",E=class extends b{constructor(){super(...arguments);this.holdOpen=!1;this.holdUntil=""}setConfig(e){if(!e.entity)throw new Error("entity is required");this.config={show_controls:!0,show_schedule:!0,show_overrides:!0,...e}}getCardSize(){return 8}static getStubConfig(e){return{type:"custom:heat-zones-card",entity:Object.values(e.states).find(r=>r.entity_id.startsWith("climate.")&&ce(r))?.entity_id??""}}static getConfigElement(){return document.createElement("heat-zones-card-editor")}get st(){return this.hass?.states[this.config.entity]}scheduleSwitch(){let e=this.hass.entities?.[this.config.entity];if(e?.device_id){let r=Object.values(this.hass.entities??{}).find(i=>i.device_id===e.device_id&&i.platform==="heat_zones"&&i.translation_key==="schedule");if(r)return r.entity_id}let s=`switch.${this.config.entity.split(".")[1]}_schedule`;return this.hass.states[s]?s:void 0}climate(e,s={}){this.hass.callService("climate",e,s,{entity_id:this.config.entity})}step(e){let s=this.st.attributes,r=Math.round(((s.temperature??20)+e)*2)/2;this.climate("set_temperature",{temperature:Math.max(s.min_temp??5,Math.min(s.max_temp??30,r))})}hold(e){this.hass.callService("heat_zones","hold",e,{entity_id:this.config.entity}),this.holdOpen=!1}renderHead(e){let s=y(this.hass),r=e.attributes,i=r.next_change,a=r.hvac_action==="heating",h=!!r.window_pause,n=this.hass.user?.is_admin??!0,c=(r.homeai_signals??[]).filter(g=>n||g.need!=="admin");return d`<div class="head" part="header">
        <div class="grow">
          <h3 part="title">${this.config.title??r.friendly_name}</h3>
          <div class="now ${a?"heating":""}" part=${_("temperature",a&&"heating")}>
            ${k(s,r.current_temperature)}
          </div>
          <div class="why muted ${h?"window":""}" part=${_("reason",h&&"window")}>${r.reason??""}</div>
          ${c.map(g=>d`<div class="problem" part="problem">${g.title}</div>`)}
          ${i?d`<div class="muted" part="next">
                ${l(s,"next")}: ${G(s,i.at)} →
                ${i.preset_mode?T(s,i.preset_mode):""} ${k(s,i.temperature)}
              </div>`:p}
        </div>
        ${this.config.show_controls?d`<div class="target glass group" part="target group glass">
              <button class="icon" part="button icon" @click=${()=>this.step(-.5)} ?disabled=${e.state==="off"}>−</button>
              <strong part="target-value">${e.state==="off"?l(s,"off"):k(s,r.temperature)}</strong>
              <button class="icon" part="button icon" @click=${()=>this.step(.5)} ?disabled=${e.state==="off"}>＋</button>
            </div>`:p}
      </div>
      ${this.config.show_controls?this.renderControls(e):p}`}renderControls(e){let s=y(this.hass),r=e.attributes,i=(r.preset_modes??[]).filter(c=>c!=="none"),a=r.source==="hold",h=r.schedule_enabled,n=e.state!=="off";return d`<div class="row chips">
      <div class="glass group" part="controls group glass">
        <button class=${n?"active":""} part=${_("button",n&&"active")} @click=${()=>this.climate(n?"turn_off":"turn_on")}>
          ${n?l(s,"on"):l(s,"off")}
        </button>
        ${i.map(c=>{let g=r.preset_mode===c;return d`<button
            class=${g?"active":""}
            part=${_("button",g&&"active")}
            @click=${()=>this.climate("set_preset_mode",{preset_mode:c})}
          >
            ${T(s,c)}
          </button>`})}
      </div>
      ${h?d`<div class="glass group" part="controls group glass">
            ${a?d`<button part="button" @click=${()=>this.hass.callService("heat_zones","resume",{},{entity_id:this.config.entity})}>
                  ${l(s,"resume")}
                </button>`:p}
            <button part="button" @click=${()=>this.hold({permanent:!0})}>${l(s,"hold_permanent")}</button>
            ${this.holdOpen?d`<input
                    type="datetime-local"
                    part="input"
                    .value=${this.holdUntil}
                    @change=${c=>this.holdUntil=c.target.value}
                  />
                  <button class="primary" part="button primary" @click=${()=>this.hold({until:new Date(this.holdUntil).toISOString()})}>
                    ${l(s,"hold")}
                  </button>`:d`<button
                  part="button"
                  @click=${()=>{this.holdUntil=J(new Date(Date.now()+2*3600*1e3)),this.holdOpen=!0}}
                >
                  ${l(s,"hold_until")}…
                </button>`}
          </div>`:p}
    </div>`}render(){if(!this.hass||!this.config)return p;let e=this.st,s=y(this.hass);if(!e)return d`<ha-card part="card"><div class="muted" part="message">${this.config.entity}: ${l(s,"unavailable")}</div></ha-card>`;let r=this.scheduleSwitch(),i=r?this.hass.states[r]?.state==="on":e.attributes.schedule_enabled;return d`<ha-card part="card">
      <section part="section">${this.renderHead(e)}</section>
      ${this.config.show_schedule?d`<section part="section">
            <div class="row section-head">
              <h3 class="grow" part="section-title">${l(s,"schedule")}</h3>
              ${r?d`<button
                    class="glass ${i?"active":""}"
                    part=${_("button","glass",i&&"active")}
                    @click=${()=>this.hass.callService("switch",i?"turn_off":"turn_on",{},{entity_id:r})}
                  >
                    ${i?l(s,"on"):l(s,"off")}
                  </button>`:p}
            </div>
            ${i?p:d`<div class="muted note" part="message">${l(s,"schedule_off")}</div>`}
            <heat-zones-schedule-editor
              exportparts=${de}
              .hass=${this.hass}
              .entity=${this.config.entity}
            ></heat-zones-schedule-editor>
          </section>`:p}
      ${this.config.show_overrides?d`<section part="section">
            <h3 class="section-head" part="section-title">${l(s,"overrides")}</h3>
            <heat-zones-overrides exportparts=${pe} .hass=${this.hass} .entity=${this.config.entity}></heat-zones-overrides>
          </section>`:p}
    </ha-card>`}};E.styles=[X,C`
      ha-card {
        padding: var(--hz-padding);
      }
      .head {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: var(--hz-gap);
      }
      .head > .grow {
        flex: 1 1 20ch;
        min-width: auto;
      }
      .now {
        font-size: var(--hz-temperature-font-size);
        font-weight: var(--hz-temperature-font-weight);
        line-height: var(--hz-condensed-line-height);
        white-space: nowrap;
      }
      .now.heating {
        color: var(--hz-heating);
      }
      .target strong {
        font-size: var(--hz-target-font-size);
        font-weight: var(--hz-title-font-weight);
        min-width: 6ch;
        text-align: center;
        white-space: nowrap;
      }
      .chips {
        margin-top: var(--hz-gap);
      }
      .why {
        margin-top: var(--hz-small-gap);
      }
      .why.window {
        color: var(--hz-window);
      }
      .problem {
        color: var(--hz-problem);
        font-size: var(--hz-small-font-size);
      }
      .section-head,
      .note {
        margin-bottom: var(--hz-gap);
      }
    `],u([x({attribute:!1})],E.prototype,"hass",2),u([v()],E.prototype,"config",2),u([v()],E.prototype,"holdOpen",2),u([v()],E.prototype,"holdUntil",2),E=u([B("heat-zones-card")],E);var j=class extends b{setConfig(t){this.config=t}changed(t){this.config=t.detail.value,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this.config)return p;let t=y(this.hass),e=[{name:"entity",required:!0,selector:{entity:{domain:"climate",integration:"heat_zones"}}},{name:"title",selector:{text:{}}},{name:"show_controls",selector:{boolean:{}}},{name:"show_schedule",selector:{boolean:{}}},{name:"show_overrides",selector:{boolean:{}}}],s={entity:l(t,"pick_entity"),show_controls:l(t,"show_controls"),show_schedule:l(t,"show_schedule"),show_overrides:l(t,"show_overrides")};return d`<ha-form
      .hass=${this.hass}
      .data=${{show_controls:!0,show_schedule:!0,show_overrides:!0,...this.config}}
      .schema=${e}
      .computeLabel=${r=>s[r.name]??r.name}
      @value-changed=${this.changed}
    ></ha-form>`}};u([x({attribute:!1})],j.prototype,"hass",2),u([v()],j.prototype,"config",2),j=u([B("heat-zones-card-editor")],j);window.customCards=window.customCards??[];window.customCards.some(o=>o.type==="heat-zones-card")||window.customCards.push({type:"heat-zones-card",name:"Heat Zones",description:"A heat zone with its weekly schedule, holds and overrides.",preview:!1});
