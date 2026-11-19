var Wt=Object.defineProperty;var qt=Object.getOwnPropertyDescriptor;var p=(i,t,e,s)=>{for(var r=s>1?void 0:s?qt(t,e):t,o=i.length-1,n;o>=0;o--)(n=i[o])&&(r=(s?n(t,e,r):n(r))||r);return s&&r&&Wt(t,e,r),r};var Z=globalThis,tt=Z.ShadowRoot&&(Z.ShadyCSS===void 0||Z.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,nt=Symbol(),$t=new WeakMap,L=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==nt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(tt&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=$t.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&$t.set(e,t))}return t}toString(){return this.cssText}},bt=i=>new L(typeof i=="string"?i:i+"",void 0,nt),C=(i,...t)=>{let e=i.length===1?i[0]:t.reduce((s,r,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+i[o+1],i[0]);return new L(e,i,nt)},_t=(i,t)=>{if(tt)i.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),r=Z.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=e.cssText,i.appendChild(s)}},at=tt?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return bt(e)})(i):i;var{is:Ft,defineProperty:Vt,getOwnPropertyDescriptor:Kt,getOwnPropertyNames:Yt,getOwnPropertySymbols:Jt,getPrototypeOf:Xt}=Object,et=globalThis,zt=et.trustedTypes,Gt=zt?zt.emptyScript:"",Qt=et.reactiveElementPolyfillSupport,H=(i,t)=>i,I={toAttribute(i,t){switch(t){case Boolean:i=i?Gt:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let e=i;switch(t){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},st=(i,t)=>!Ft(i,t),wt={attribute:!0,type:String,converter:I,reflect:!1,useDefault:!1,hasChanged:st};Symbol.metadata??=Symbol("metadata"),et.litPropertyMetadata??=new WeakMap;var S=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=wt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),r=this.getPropertyDescriptor(t,s,e);r!==void 0&&Vt(this.prototype,t,r)}}static getPropertyDescriptor(t,e,s){let{get:r,set:o}=Kt(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:r,set(n){let h=r?.call(this);o?.call(this,n),this.requestUpdate(t,h,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??wt}static _$Ei(){if(this.hasOwnProperty(H("elementProperties")))return;let t=Xt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(H("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(H("properties"))){let e=this.properties,s=[...Yt(e),...Jt(e)];for(let r of s)this.createProperty(r,e[r])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,r]of e)this.elementProperties.set(s,r)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let r=this._$Eu(e,s);r!==void 0&&this._$Eh.set(r,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let r of s)e.unshift(at(r))}else t!==void 0&&e.push(at(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return _t(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,s);if(r!==void 0&&s.reflect===!0){let o=(s.converter?.toAttribute!==void 0?s.converter:I).toAttribute(e,s.type);this._$Em=t,o==null?this.removeAttribute(r):this.setAttribute(r,o),this._$Em=null}}_$AK(t,e){let s=this.constructor,r=s._$Eh.get(t);if(r!==void 0&&this._$Em!==r){let o=s.getPropertyOptions(r),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:I;this._$Em=r;let h=n.fromAttribute(e,o.type);this[r]=h??this._$Ej?.get(r)??h,this._$Em=null}}requestUpdate(t,e,s,r=!1,o){if(t!==void 0){let n=this.constructor;if(r===!1&&(o=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??st)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:r,wrapped:o},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),o!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),r===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[r,o]of this._$Ep)this[r]=o;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[r,o]of s){let{wrapped:n}=o,h=this[r];n!==!0||this._$AL.has(r)||h===void 0||this.C(r,void 0,o,h)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};S.elementStyles=[],S.shadowRootOptions={mode:"open"},S[H("elementProperties")]=new Map,S[H("finalized")]=new Map,Qt?.({ReactiveElement:S}),(et.reactiveElementVersions??=[]).push("2.1.2");var mt=globalThis,xt=i=>i,rt=mt.trustedTypes,At=rt?rt.createPolicy("lit-html",{createHTML:i=>i}):void 0,Tt="$lit$",D=`lit$${Math.random().toFixed(9).slice(2)}$`,Pt="?"+D,Zt=`<${Pt}>`,M=document,q=()=>M.createComment(""),F=i=>i===null||typeof i!="object"&&typeof i!="function",vt=Array.isArray,te=i=>vt(i)||typeof i?.[Symbol.iterator]=="function",ht=`[ 	
\f\r]`,W=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,St=/-->/g,kt=/>/g,P=RegExp(`>|${ht}(?:([^\\s"'>=/]+)(${ht}*=${ht}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Et=/'/g,Ct=/"/g,Rt=/^(?:script|style|textarea|title)$/i,ft=i=>(t,...e)=>({_$litType$:i,strings:t,values:e}),c=ft(1),ye=ft(2),$e=ft(3),N=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),Dt=new WeakMap,R=M.createTreeWalker(M,129);function Mt(i,t){if(!vt(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return At!==void 0?At.createHTML(t):t}var ee=(i,t)=>{let e=i.length-1,s=[],r,o=t===2?"<svg>":t===3?"<math>":"",n=W;for(let h=0;h<e;h++){let a=i[h],l,v,m=-1,$=0;for(;$<a.length&&(n.lastIndex=$,v=n.exec(a),v!==null);)$=n.lastIndex,n===W?v[1]==="!--"?n=St:v[1]!==void 0?n=kt:v[2]!==void 0?(Rt.test(v[2])&&(r=RegExp("</"+v[2],"g")),n=P):v[3]!==void 0&&(n=P):n===P?v[0]===">"?(n=r??W,m=-1):v[1]===void 0?m=-2:(m=n.lastIndex-v[2].length,l=v[1],n=v[3]===void 0?P:v[3]==='"'?Ct:Et):n===Ct||n===Et?n=P:n===St||n===kt?n=W:(n=P,r=void 0);let w=n===P&&i[h+1].startsWith("/>")?" ":"";o+=n===W?a+Zt:m>=0?(s.push(l),a.slice(0,m)+Tt+a.slice(m)+D+w):a+D+(m===-2?h:w)}return[Mt(i,o+(i[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},V=class i{constructor({strings:t,_$litType$:e},s){let r;this.parts=[];let o=0,n=0,h=t.length-1,a=this.parts,[l,v]=ee(t,e);if(this.el=i.createElement(l,s),R.currentNode=this.el.content,e===2||e===3){let m=this.el.content.firstChild;m.replaceWith(...m.childNodes)}for(;(r=R.nextNode())!==null&&a.length<h;){if(r.nodeType===1){if(r.hasAttributes())for(let m of r.getAttributeNames())if(m.endsWith(Tt)){let $=v[n++],w=r.getAttribute(m).split(D),Q=/([.?@])?(.*)/.exec($);a.push({type:1,index:o,name:Q[2],strings:w,ctor:Q[1]==="."?ct:Q[1]==="?"?dt:Q[1]==="@"?ut:O}),r.removeAttribute(m)}else m.startsWith(D)&&(a.push({type:6,index:o}),r.removeAttribute(m));if(Rt.test(r.tagName)){let m=r.textContent.split(D),$=m.length-1;if($>0){r.textContent=rt?rt.emptyScript:"";for(let w=0;w<$;w++)r.append(m[w],q()),R.nextNode(),a.push({type:2,index:++o});r.append(m[$],q())}}}else if(r.nodeType===8)if(r.data===Pt)a.push({type:2,index:o});else{let m=-1;for(;(m=r.data.indexOf(D,m+1))!==-1;)a.push({type:7,index:o}),m+=D.length-1}o++}}static createElement(t,e){let s=M.createElement("template");return s.innerHTML=t,s}};function U(i,t,e=i,s){if(t===N)return t;let r=s!==void 0?e._$Co?.[s]:e._$Cl,o=F(t)?void 0:t._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),o===void 0?r=void 0:(r=new o(i),r._$AT(i,e,s)),s!==void 0?(e._$Co??=[])[s]=r:e._$Cl=r),r!==void 0&&(t=U(i,r._$AS(i,t.values),r,s)),t}var lt=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,r=(t?.creationScope??M).importNode(e,!0);R.currentNode=r;let o=R.nextNode(),n=0,h=0,a=s[0];for(;a!==void 0;){if(n===a.index){let l;a.type===2?l=new K(o,o.nextSibling,this,t):a.type===1?l=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(l=new pt(o,this,t)),this._$AV.push(l),a=s[++h]}n!==a?.index&&(o=R.nextNode(),n++)}return R.currentNode=M,r}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},K=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,r){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=U(this,t,e),F(t)?t===u||t==null||t===""?(this._$AH!==u&&this._$AR(),this._$AH=u):t!==this._$AH&&t!==N&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):te(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==u&&F(this._$AH)?this._$AA.nextSibling.data=t:this.T(M.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,r=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=V.createElement(Mt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(e);else{let o=new lt(r,this),n=o.u(this.options);o.p(e),this.T(n),this._$AH=o}}_$AC(t){let e=Dt.get(t.strings);return e===void 0&&Dt.set(t.strings,e=new V(t)),e}k(t){vt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,r=0;for(let o of t)r===e.length?e.push(s=new i(this.O(q()),this.O(q()),this,this.options)):s=e[r],s._$AI(o),r++;r<e.length&&(this._$AR(s&&s._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=xt(t).nextSibling;xt(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},O=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,r,o){this.type=1,this._$AH=u,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=u}_$AI(t,e=this,s,r){let o=this.strings,n=!1;if(o===void 0)t=U(this,t,e,0),n=!F(t)||t!==this._$AH&&t!==N,n&&(this._$AH=t);else{let h=t,a,l;for(t=o[0],a=0;a<o.length-1;a++)l=U(this,h[s+a],e,a),l===N&&(l=this._$AH[a]),n||=!F(l)||l!==this._$AH[a],l===u?t=u:t!==u&&(t+=(l??"")+o[a+1]),this._$AH[a]=l}n&&!r&&this.j(t)}j(t){t===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},ct=class extends O{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===u?void 0:t}},dt=class extends O{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==u)}},ut=class extends O{constructor(t,e,s,r,o){super(t,e,s,r,o),this.type=5}_$AI(t,e=this){if((t=U(this,t,e,0)??u)===N)return;let s=this._$AH,r=t===u&&s!==u||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==u&&(s===u||r);r&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},pt=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){U(this,t)}};var se=mt.litHtmlPolyfillSupport;se?.(V,K),(mt.litHtmlVersions??=[]).push("3.3.3");var Nt=(i,t,e)=>{let s=e?.renderBefore??t,r=s._$litPart$;if(r===void 0){let o=e?.renderBefore??null;s._$litPart$=r=new K(t.insertBefore(q(),o),o,void 0,e??{})}return r._$AI(i),r};var gt=globalThis,b=class extends S{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Nt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return N}};b._$litElement$=!0,b.finalized=!0,gt.litElementHydrateSupport?.({LitElement:b});var re=gt.litElementPolyfillSupport;re?.({LitElement:b});(gt.litElementVersions??=[]).push("4.2.2");var ie={attribute:!0,type:String,converter:I,reflect:!1,hasChanged:st},oe=(i=ie,t,e)=>{let{kind:s,metadata:r}=e,o=globalThis.litPropertyMetadata.get(r);if(o===void 0&&globalThis.litPropertyMetadata.set(r,o=new Map),s==="setter"&&((i=Object.create(i)).wrapped=!0),o.set(e.name,i),s==="accessor"){let{name:n}=e;return{set(h){let a=t.get.call(this);t.set.call(this,h),this.requestUpdate(n,a,i,!0,h)},init(h){return h!==void 0&&this.C(n,void 0,i,h),h}}}if(s==="setter"){let{name:n}=e;return function(h){let a=this[n];t.call(this,h),this.requestUpdate(n,a,i,!0,h)}}throw Error("Unsupported decorator location: "+s)};function x(i){return(t,e)=>typeof e=="object"?oe(i,t,e):((s,r,o)=>{let n=r.hasOwnProperty(o);return r.constructor.createProperty(o,s),n?Object.getOwnPropertyDescriptor(r,o):void 0})(i,t,e)}function f(i){return x({...i,state:!0,attribute:!1})}function B(i){return t=>{customElements.get(i)||customElements.define(i,t)}}var Y={en:{schedule:"Schedule",schedule_off:"Schedule off \u2014 the zone keeps manual settings.",no_blocks:"No schedule yet. Choose a day and add blocks.",edit_day:"Edit",add_block:"Add block",copy_to:"Copy to",save:"Save",cancel:"Cancel",saved:"Saved",error:"Not saved",temperature:"Temperature",remove:"Remove",overrides:"Overrides",no_overrides:"No overrides.",add_override:"Add override",from:"From",to:"Until",reason:"Reason",next:"Next",resume:"Resume schedule",hold_until:"Hold until",hold_permanent:"Hold permanently",hold:"Hold",on:"On",off:"Off",unavailable:"Unavailable","preset.none":"Manual","preset.comfort":"Comfort","preset.eco":"Eco","preset.sleep":"Sleep","preset.away":"Away","day.mon":"Mon","day.tue":"Tue","day.wed":"Wed","day.thu":"Thu","day.fri":"Fri","day.sat":"Sat","day.sun":"Sun",pick_entity:"Choose a Heat Zones thermostat",show_controls:"Show controls",show_schedule:"Show schedule",show_overrides:"Show overrides"},pl:{schedule:"Harmonogram",schedule_off:"Harmonogram wy\u0142\u0105czony \u2014 strefa trzyma r\u0119czne ustawienia.",no_blocks:"Brak harmonogramu. Wybierz dzie\u0144 i dodaj bloki.",edit_day:"Edytuj",add_block:"Dodaj blok",copy_to:"Kopiuj do",save:"Zapisz",cancel:"Anuluj",saved:"Zapisano",error:"Nie zapisano",temperature:"Temperatura",remove:"Usu\u0144",overrides:"Nadpisania",no_overrides:"Brak nadpisa\u0144.",add_override:"Dodaj nadpisanie",from:"Od",to:"Do",reason:"Pow\xF3d",next:"Nast\u0119pnie",resume:"Wr\xF3\u0107 do harmonogramu",hold_until:"Trzymaj do",hold_permanent:"Trzymaj na sta\u0142e",hold:"Trzymaj",on:"W\u0142.",off:"Wy\u0142.",unavailable:"Niedost\u0119pne","preset.none":"R\u0119cznie","preset.comfort":"Komfort","preset.eco":"Eko","preset.sleep":"Sen","preset.away":"Poza domem","day.mon":"Pn","day.tue":"Wt","day.wed":"\u015Ar","day.thu":"Cz","day.fri":"Pt","day.sat":"So","day.sun":"Nd",pick_entity:"Wybierz termostat Stref ciep\u0142a",show_controls:"Poka\u017C sterowanie",show_schedule:"Poka\u017C harmonogram",show_overrides:"Poka\u017C nadpisania"}};function y(i){let t=(i?.locale?.language??i?.language??"en").split("-")[0];return t in Y?t:"en"}function d(i,t){return Y[i]?.[t]??Y.en[t]??t}function T(i,t){let e=`preset.${t}`;return Y[i]?.[e]??Y.en[e]??t}function k(i,t){return t==null||Number.isNaN(t)?"\u2014":`${t.toLocaleString(i,{maximumFractionDigits:1})} \xB0C`}function J(i,t){let e=new Date(t),s=new Date,r=e.toLocaleTimeString(i,{hour:"2-digit",minute:"2-digit"});return e.toDateString()===s.toDateString()?r:`${e.toLocaleDateString(i,{weekday:"short",day:"numeric",month:"numeric"})} ${r}`}var A=["mon","tue","wed","thu","fri","sat","sun"];function ne(i){return i.preset_mode!==void 0?i.preset_mode:`t:${i.temperature}`}function ot(i){return i.startsWith("t:")?{temperature:Number(i.slice(2))}:{preset_mode:i}}function yt(i){let t=Object.fromEntries(A.map(e=>[e,[]]));for(let e of i)for(let s of e.days)t[s].push({time:e.time,value:ne(e)});for(let e of A)t[e].sort((s,r)=>s.time.localeCompare(r.time));return t}function Ut(i){let t=new Map;for(let s of A)for(let r of i[s]){let o=`${r.time}|${r.value}`,n=t.get(o)??[];n.includes(s)||n.push(s),t.set(o,n)}let e=[];for(let[s,r]of t){let[o,n]=[s.slice(0,5),s.slice(6)];e.push({days:r,time:o,...ot(n)})}return e.sort((s,r)=>A.indexOf(s.days[0])-A.indexOf(r.days[0])||s.time.localeCompare(r.time)),e}function ae(i){let[t,e]=i.split(":").map(Number);return t*60+e}function Ot(i,t){let e=A.indexOf(t),s=null;for(let a=1;a<=7&&s===null;a++){let l=i[A[(e-a+7)%7]];l.length&&(s=l[l.length-1].value)}let r=i[t];if(s===null&&!r.length)return[];let o=[],n=0,h=s??r[0].value;for(let a of r){let l=ae(a.time);l>n&&o.push({from:n,to:l,value:h}),n=l,h=a.value}return o.push({from:n,to:1440,value:h}),o}function Bt(i,t){return i.startsWith("t:")?Number(i.slice(2)):t[i]??null}var he=19.75,le=3.25;function jt(i){if(i===null||Number.isNaN(i))return{side:"unknown",share:1};let t=Math.max(-1,Math.min(1,(i-he)/le));return{side:t<0?"cold":"warm",share:Math.round((.35+.65*Math.abs(t))*100)/100}}function X(i){let t=e=>String(e).padStart(2,"0");return`${i.getFullYear()}-${t(i.getMonth()+1)}-${t(i.getDate())}T${t(i.getHours())}:${t(i.getMinutes())}`}var G=C`
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
    --hz-control-height: var(--heat-zones-control-height, var(--ha-space-8));
    --hz-control-padding: var(--heat-zones-control-padding, var(--ha-space-1) var(--ha-space-3));
    --hz-input-padding: var(--heat-zones-input-padding, var(--ha-space-1) var(--ha-space-2));
    --hz-bar-height: var(--heat-zones-bar-height, var(--ha-space-6));

    --hz-border-width: var(--heat-zones-border-width, var(--ha-border-width-sm));
    --hz-focus-width: var(--heat-zones-focus-width, var(--ha-border-width-md));
    --hz-button-radius: var(--heat-zones-button-border-radius, var(--ha-border-radius-pill));
    --hz-icon-button-radius: var(--heat-zones-icon-button-border-radius, var(--ha-border-radius-md));
    --hz-input-radius: var(--heat-zones-input-border-radius, var(--ha-border-radius-md));
    --hz-bar-radius: var(--heat-zones-bar-border-radius, var(--ha-border-radius-md));
    --hz-button-shadow: var(--heat-zones-button-box-shadow, none);

    --hz-text: var(--heat-zones-text-color, var(--primary-text-color));
    --hz-muted: var(--heat-zones-secondary-text-color, var(--secondary-text-color));
    --hz-disabled: var(--heat-zones-disabled-text-color, var(--disabled-text-color));
    --hz-accent: var(--heat-zones-accent-color, var(--primary-color));
    --hz-on-accent: var(--heat-zones-on-accent-color, var(--text-primary-color));
    --hz-line: var(--heat-zones-divider-color, var(--divider-color));
    --hz-button-background: var(--heat-zones-button-background-color, var(--card-background-color));
    --hz-input-background: var(--heat-zones-input-background-color, var(--input-fill-color));
    --hz-track: var(--heat-zones-track-color, var(--secondary-background-color));

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

    display: block;
    color: var(--hz-text);
    font-family: var(--hz-font-family);
    font-size: var(--hz-font-size);
    line-height: var(--hz-line-height);
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
  button {
    font: inherit;
    border: var(--hz-border-width) solid var(--hz-line);
    background: var(--hz-button-background);
    color: inherit;
    border-radius: var(--hz-button-radius);
    box-shadow: var(--hz-button-shadow);
    padding: var(--hz-control-padding);
    cursor: pointer;
    min-height: var(--hz-control-height);
  }
  button:hover {
    border-color: var(--hz-accent);
  }
  button.primary {
    background: var(--hz-accent);
    border-color: var(--hz-accent);
    color: var(--hz-on-accent);
  }
  button.active {
    border-color: var(--hz-accent);
    color: var(--hz-accent);
    font-weight: var(--hz-title-font-weight);
  }
  button.icon {
    border-radius: var(--hz-icon-button-radius);
  }
  button:disabled {
    color: var(--hz-disabled);
    border-color: var(--hz-line);
    cursor: default;
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
`;function z(...i){return i.filter(Boolean).join(" ")}async function It(i,t){return(await i.callWS({type:"call_service",domain:"heat_zones",service:"get_schedule",target:{entity_id:t},return_response:!0})).response?.[t]??null}function Lt(i,t){return i.states[t]?.attributes.preset_temperatures??{}}function Ht(i,t){return t.startsWith("t:")?k(i,Number(t.slice(2))):T(i,t)}var _=class extends b{constructor(){super(...arguments);this.entity="";this.schedule=null;this.draft=null;this.day=null;this.copyTo=[];this.message="";this.loadedFor="";this.stamp=""}updated(){let e=this.hass?.states[this.entity];if(!e)return;let s=e.last_updated;!this.draft&&(this.loadedFor!==this.entity||s!==this.stamp)&&(this.loadedFor=this.entity,this.stamp=s,It(this.hass,this.entity).then(r=>this.schedule=r,()=>this.schedule=null))}get days(){return this.draft??yt(this.schedule?.weekly??[])}edit(e){this.draft||(this.draft=yt(this.schedule?.weekly??[])),this.day=e,this.copyTo=[],this.message=""}change(e,s){if(!this.draft||!this.day)return;let r=this.draft[this.day].map((o,n)=>n===e?{...o,...s}:o);this.draft={...this.draft,[this.day]:r}}add(){if(!this.draft||!this.day)return;let e=this.draft[this.day],s=e[e.length-1],r=s?`${String(Math.min(23,Number(s.time.slice(0,2))+2)).padStart(2,"0")}:00`:"06:00";this.draft={...this.draft,[this.day]:[...e,{time:r,value:"comfort"}]}}removeBlock(e){!this.draft||!this.day||(this.draft={...this.draft,[this.day]:this.draft[this.day].filter((s,r)=>r!==e)})}toggleCopy(e){this.copyTo=this.copyTo.includes(e)?this.copyTo.filter(s=>s!==e):[...this.copyTo,e]}cancel(){this.draft=null,this.day=null,this.copyTo=[]}async save(){if(!this.draft)return;let e={...this.draft};if(this.day){let s=[...e[this.day]].sort((r,o)=>r.time.localeCompare(o.time));e[this.day]=s;for(let r of this.copyTo)e[r]=s.map(o=>({...o}))}try{await this.hass.callService("heat_zones","set_schedule",{weekly:Ut(e)},{entity_id:this.entity}),this.message=d(y(this.hass),"saved"),this.draft=null,this.day=null,this.copyTo=[],this.stamp="",this.requestUpdate()}catch(s){this.message=`${d(y(this.hass),"error")}: ${s.message??s}`}}renderBar(e){let s=y(this.hass),r=Lt(this.hass,this.entity),o=Ot(this.days,e),n=this.day===e;return c`<div
      class="bar ${n?"selected":""}"
      part=${z("day-bar",n&&"selected")}
      @click=${()=>this.edit(e)}
    >
      ${o.map(h=>{let a=Bt(h.value,r),{side:l,share:v}=jt(a),m=h.from/1440*100,$=(h.to-h.from)/1440*100,w=$>9?Ht(s,h.value):"";return c`<div
          class="segment ${l}"
          part=${z("segment",l)}
          style="left:${m}%;width:${$}%;--hz-share:${Math.round(v*100)}%"
          title="${Ht(s,h.value)} ${a!==null?k(s,a):""}"
        >${w}</div>`})}
    </div>`}renderDay(){if(!this.draft||!this.day)return u;let e=y(this.hass),s=Lt(this.hass,this.entity),r=this.hass.states[this.entity]?.attributes.preset_modes?.filter(n=>n!=="none")??[],o=this.day;return c`<div class="blocks" part="blocks">
      ${this.draft[o].map((n,h)=>c`<div class="row" part="block">
          <input type="time" part="input" .value=${n.time} @change=${a=>this.change(h,{time:a.target.value})} />
          <select
            part="input"
            @change=${a=>{let l=a.target.value;this.change(h,{value:l==="t"?`t:${s.comfort??21}`:l})}}
          >
            ${r.map(a=>c`<option value=${a} ?selected=${n.value===a}>${T(e,a)}</option>`)}
            <option value="t" ?selected=${n.value.startsWith("t:")}>${d(e,"temperature")}</option>
          </select>
          ${n.value.startsWith("t:")?c`<input
                type="number"
                part="input"
                min="5"
                max="30"
                step="0.5"
                .value=${String(ot(n.value).temperature)}
                @change=${a=>this.change(h,{value:`t:${a.target.value}`})}
              />`:c`<span class="muted">${k(e,s[n.value])}</span>`}
          <span class="grow"></span>
          <button class="icon" part="button icon" @click=${()=>this.removeBlock(h)} title=${d(e,"remove")}>✕</button>
        </div>`)}
      <div class="row"><button part="button" @click=${this.add}>＋ ${d(e,"add_block")}</button></div>
      <div class="row copy">
        <span class="muted">${d(e,"copy_to")}:</span>
        ${A.filter(n=>n!==o).map(n=>{let h=this.copyTo.includes(n);return c`<button class=${h?"active":""} part=${z("button",h&&"active")} @click=${()=>this.toggleCopy(n)}>
            ${d(e,`day.${n}`)}
          </button>`})}
      </div>
      <div class="row">
        <button class="primary" part="button primary" @click=${this.save}>${d(e,"save")}</button>
        <button part="button" @click=${this.cancel}>${d(e,"cancel")}</button>
      </div>
    </div>`}render(){if(!this.hass||!this.hass.states[this.entity])return u;let e=y(this.hass),s=!(this.schedule?.weekly.length??0)&&!this.draft;return c`
      <div class="week" part="week">
        ${A.map(r=>c`<div
              class="day ${this.day===r?"selected":""}"
              part=${z("day-label",this.day===r&&"selected")}
              @click=${()=>this.edit(r)}
            >
              ${d(e,`day.${r}`)}
            </div>
            ${this.renderBar(r)}`)}
        <div class="hours" part="hours"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
      </div>
      ${s?c`<div class="muted spaced" part="message">${d(e,"no_blocks")}</div>`:u}
      ${this.renderDay()}
      ${this.message?c`<div class="muted spaced" part="message">${this.message}</div>`:u}
    `}};_.styles=[G,C`
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
      .copy button {
        padding: var(--hz-input-padding);
      }
    `],p([x({attribute:!1})],_.prototype,"hass",2),p([x()],_.prototype,"entity",2),p([f()],_.prototype,"schedule",2),p([f()],_.prototype,"draft",2),p([f()],_.prototype,"day",2),p([f()],_.prototype,"copyTo",2),p([f()],_.prototype,"message",2),_=p([B("heat-zones-schedule-editor")],_);var g=class extends b{constructor(){super(...arguments);this.entity="";this.schedule=null;this.adding=!1;this.from="";this.to="";this.value="away";this.reason="";this.message="";this.loadedFor="";this.stamp=""}updated(){let e=this.hass?.states[this.entity];e&&(this.loadedFor!==this.entity||e.last_updated!==this.stamp)&&(this.loadedFor=this.entity,this.stamp=e.last_updated,It(this.hass,this.entity).then(s=>this.schedule=s,()=>this.schedule=null))}open(){let e=new Date;this.from=X(e),this.to=X(new Date(e.getTime()+3*3600*1e3)),this.adding=!0,this.message=""}async add(){let e={start:new Date(this.from).toISOString(),end:new Date(this.to).toISOString(),reason:this.reason,source:"card",...ot(this.value)};try{await this.hass.callService("heat_zones","add_override",e,{entity_id:this.entity}),this.adding=!1,this.reason="",this.stamp=""}catch(s){this.message=`${d(y(this.hass),"error")}: ${s.message??s}`}}removeOverride(e){this.hass.callService("heat_zones","remove_override",{override_id:e},{entity_id:this.entity})}render(){if(!this.hass||!this.hass.states[this.entity])return u;let e=y(this.hass),s=this.schedule?.overrides??[],r=this.hass.states[this.entity].attributes.preset_modes?.filter(o=>o!=="none")??[];return c`
      ${s.length?c`<ul part="list">
            ${s.map(o=>c`<li class="row" part="override">
                <span class="grow">
                  <strong>${o.preset_mode?T(e,o.preset_mode):k(e,o.temperature)}</strong>
                  ${o.reason?c` · ${o.reason}`:u}
                  <div class="muted">${J(e,o.start)} – ${J(e,o.end)}${o.source?` \xB7 ${o.source}`:""}</div>
                </span>
                <button class="icon" part="button icon" @click=${()=>this.removeOverride(o.override_id)} title=${d(e,"remove")}>
                  ✕
                </button>
              </li>`)}
          </ul>`:c`<div class="muted" part="message">${d(e,"no_overrides")}</div>`}
      ${this.adding?c`<div class="form" part="form">
            <span>${d(e,"from")}</span>
            <input type="datetime-local" part="input" .value=${this.from} @change=${o=>this.from=o.target.value} />
            <span>${d(e,"to")}</span>
            <input type="datetime-local" part="input" .value=${this.to} @change=${o=>this.to=o.target.value} />
            <span></span>
            <div class="row">
              <select part="input" @change=${o=>this.value=o.target.value}>
                ${r.map(o=>c`<option value=${o} ?selected=${this.value===o}>${T(e,o)}</option>`)}
                <option value="t:21" ?selected=${this.value.startsWith("t:")}>${d(e,"temperature")}</option>
              </select>
              ${this.value.startsWith("t:")?c`<input
                    type="number"
                    part="input"
                    min="5"
                    max="30"
                    step="0.5"
                    .value=${this.value.slice(2)}
                    @change=${o=>this.value=`t:${o.target.value}`}
                  />`:u}
            </div>
            <span>${d(e,"reason")}</span>
            <input part="input" .value=${this.reason} maxlength="200" @input=${o=>this.reason=o.target.value} />
            <span></span>
            <div class="row">
              <button class="primary" part="button primary" @click=${this.add}>${d(e,"save")}</button>
              <button part="button" @click=${()=>this.adding=!1}>${d(e,"cancel")}</button>
            </div>
          </div>`:c`<div class="row spaced"><button part="button" @click=${this.open}>＋ ${d(e,"add_override")}</button></div>`}
      ${this.message?c`<div class="muted spaced" part="message">${this.message}</div>`:u}
    `}};g.styles=[G,C`
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
        margin-top: var(--hz-gap);
      }
    `],p([x({attribute:!1})],g.prototype,"hass",2),p([x()],g.prototype,"entity",2),p([f()],g.prototype,"schedule",2),p([f()],g.prototype,"adding",2),p([f()],g.prototype,"from",2),p([f()],g.prototype,"to",2),p([f()],g.prototype,"value",2),p([f()],g.prototype,"reason",2),p([f()],g.prototype,"message",2),g=p([B("heat-zones-overrides")],g);function ce(i){return i?.attributes?.homeai_schedule?.domain==="heat_zones"}var de="week, day-label, day-bar, segment, hours, blocks, block, input, button, message, selected, cold, warm, unknown, active, primary, icon",ue="list, override, form, input, button, message, primary, icon",E=class extends b{constructor(){super(...arguments);this.holdOpen=!1;this.holdUntil=""}setConfig(e){if(!e.entity)throw new Error("entity is required");this.config={show_controls:!0,show_schedule:!0,show_overrides:!0,...e}}getCardSize(){return 8}static getStubConfig(e){return{type:"custom:heat-zones-card",entity:Object.values(e.states).find(r=>r.entity_id.startsWith("climate.")&&ce(r))?.entity_id??""}}static getConfigElement(){return document.createElement("heat-zones-card-editor")}get st(){return this.hass?.states[this.config.entity]}scheduleSwitch(){let e=this.hass.entities?.[this.config.entity];if(e?.device_id){let r=Object.values(this.hass.entities??{}).find(o=>o.device_id===e.device_id&&o.platform==="heat_zones"&&o.translation_key==="schedule");if(r)return r.entity_id}let s=`switch.${this.config.entity.split(".")[1]}_schedule`;return this.hass.states[s]?s:void 0}climate(e,s={}){this.hass.callService("climate",e,s,{entity_id:this.config.entity})}step(e){let s=this.st.attributes,r=Math.round(((s.temperature??20)+e)*2)/2;this.climate("set_temperature",{temperature:Math.max(s.min_temp??5,Math.min(s.max_temp??30,r))})}hold(e){this.hass.callService("heat_zones","hold",e,{entity_id:this.config.entity}),this.holdOpen=!1}renderHead(e){let s=y(this.hass),r=e.attributes,o=r.next_change,n=r.hvac_action==="heating",h=!!r.window_pause,a=this.hass.user?.is_admin??!0,l=(r.homeai_signals??[]).filter(v=>a||v.need!=="admin");return c`<div class="head" part="header">
        <div class="grow">
          <h3 part="title">${this.config.title??r.friendly_name}</h3>
          <div class="now ${n?"heating":""}" part=${z("temperature",n&&"heating")}>
            ${k(s,r.current_temperature)}
          </div>
          <div class="why muted ${h?"window":""}" part=${z("reason",h&&"window")}>${r.reason??""}</div>
          ${l.map(v=>c`<div class="problem" part="problem">${v.title}</div>`)}
          ${o?c`<div class="muted" part="next">
                ${d(s,"next")}: ${J(s,o.at)} →
                ${o.preset_mode?T(s,o.preset_mode):""} ${k(s,o.temperature)}
              </div>`:u}
        </div>
        ${this.config.show_controls?c`<div class="target" part="target">
              <button class="icon" part="button icon" @click=${()=>this.step(-.5)} ?disabled=${e.state==="off"}>−</button>
              <strong part="target-value">${e.state==="off"?d(s,"off"):k(s,r.temperature)}</strong>
              <button class="icon" part="button icon" @click=${()=>this.step(.5)} ?disabled=${e.state==="off"}>＋</button>
            </div>`:u}
      </div>
      ${this.config.show_controls?this.renderControls(e):u}`}renderControls(e){let s=y(this.hass),r=e.attributes,o=(r.preset_modes??[]).filter(l=>l!=="none"),n=r.source==="hold",h=r.schedule_enabled,a=e.state!=="off";return c`<div class="row chips" part="controls">
        <button class=${a?"active":""} part=${z("button",a&&"active")} @click=${()=>this.climate(a?"turn_off":"turn_on")}>
          ${a?d(s,"on"):d(s,"off")}
        </button>
        ${o.map(l=>{let v=r.preset_mode===l;return c`<button
            class=${v?"active":""}
            part=${z("button",v&&"active")}
            @click=${()=>this.climate("set_preset_mode",{preset_mode:l})}
          >
            ${T(s,l)}
          </button>`})}
      </div>
      ${h?c`<div class="row chips" part="controls">
            ${n?c`<button part="button" @click=${()=>this.hass.callService("heat_zones","resume",{},{entity_id:this.config.entity})}>
                  ${d(s,"resume")}
                </button>`:u}
            <button part="button" @click=${()=>this.hold({permanent:!0})}>${d(s,"hold_permanent")}</button>
            ${this.holdOpen?c`<input
                    type="datetime-local"
                    part="input"
                    .value=${this.holdUntil}
                    @change=${l=>this.holdUntil=l.target.value}
                  />
                  <button class="primary" part="button primary" @click=${()=>this.hold({until:new Date(this.holdUntil).toISOString()})}>
                    ${d(s,"hold")}
                  </button>`:c`<button
                  part="button"
                  @click=${()=>{this.holdUntil=X(new Date(Date.now()+2*3600*1e3)),this.holdOpen=!0}}
                >
                  ${d(s,"hold_until")}…
                </button>`}
          </div>`:u}`}render(){if(!this.hass||!this.config)return u;let e=this.st,s=y(this.hass);if(!e)return c`<ha-card part="card"><div class="muted" part="message">${this.config.entity}: ${d(s,"unavailable")}</div></ha-card>`;let r=this.scheduleSwitch(),o=r?this.hass.states[r]?.state==="on":e.attributes.schedule_enabled;return c`<ha-card part="card">
      <section part="section">${this.renderHead(e)}</section>
      ${this.config.show_schedule?c`<section part="section">
            <div class="row section-head">
              <h3 class="grow" part="section-title">${d(s,"schedule")}</h3>
              ${r?c`<button
                    class=${o?"active":""}
                    part=${z("button",o&&"active")}
                    @click=${()=>this.hass.callService("switch",o?"turn_off":"turn_on",{},{entity_id:r})}
                  >
                    ${o?d(s,"on"):d(s,"off")}
                  </button>`:u}
            </div>
            ${o?u:c`<div class="muted note" part="message">${d(s,"schedule_off")}</div>`}
            <heat-zones-schedule-editor
              exportparts=${de}
              .hass=${this.hass}
              .entity=${this.config.entity}
            ></heat-zones-schedule-editor>
          </section>`:u}
      ${this.config.show_overrides?c`<section part="section">
            <h3 class="section-head" part="section-title">${d(s,"overrides")}</h3>
            <heat-zones-overrides exportparts=${ue} .hass=${this.hass} .entity=${this.config.entity}></heat-zones-overrides>
          </section>`:u}
    </ha-card>`}};E.styles=[G,C`
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
        flex: 1 1 16ch;
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
      .target {
        display: flex;
        align-items: center;
        gap: var(--hz-small-gap);
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
    `],p([x({attribute:!1})],E.prototype,"hass",2),p([f()],E.prototype,"config",2),p([f()],E.prototype,"holdOpen",2),p([f()],E.prototype,"holdUntil",2),E=p([B("heat-zones-card")],E);var j=class extends b{setConfig(t){this.config=t}changed(t){this.config=t.detail.value,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this.config)return u;let t=y(this.hass),e=[{name:"entity",required:!0,selector:{entity:{domain:"climate",integration:"heat_zones"}}},{name:"title",selector:{text:{}}},{name:"show_controls",selector:{boolean:{}}},{name:"show_schedule",selector:{boolean:{}}},{name:"show_overrides",selector:{boolean:{}}}],s={entity:d(t,"pick_entity"),show_controls:d(t,"show_controls"),show_schedule:d(t,"show_schedule"),show_overrides:d(t,"show_overrides")};return c`<ha-form
      .hass=${this.hass}
      .data=${{show_controls:!0,show_schedule:!0,show_overrides:!0,...this.config}}
      .schema=${e}
      .computeLabel=${r=>s[r.name]??r.name}
      @value-changed=${this.changed}
    ></ha-form>`}};p([x({attribute:!1})],j.prototype,"hass",2),p([f()],j.prototype,"config",2),j=p([B("heat-zones-card-editor")],j);window.customCards=window.customCards??[];window.customCards.some(i=>i.type==="heat-zones-card")||window.customCards.push({type:"heat-zones-card",name:"Heat Zones",description:"A heat zone with its weekly schedule, holds and overrides.",preview:!1});
