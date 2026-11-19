var Ft=Object.defineProperty;var Vt=Object.getOwnPropertyDescriptor;var p=(r,t,e,s)=>{for(var i=s>1?void 0:s?Vt(t,e):t,o=r.length-1,n;o>=0;o--)(n=r[o])&&(i=(s?n(t,e,i):n(i))||i);return s&&i&&Ft(t,e,i),i};var Z=globalThis,tt=Z.ShadowRoot&&(Z.ShadyCSS===void 0||Z.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,nt=Symbol(),$t=new WeakMap,L=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==nt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(tt&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=$t.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&$t.set(e,t))}return t}toString(){return this.cssText}},_t=r=>new L(typeof r=="string"?r:r+"",void 0,nt),C=(r,...t)=>{let e=r.length===1?r[0]:t.reduce((s,i,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[o+1],r[0]);return new L(e,r,nt)},bt=(r,t)=>{if(tt)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),i=Z.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,r.appendChild(s)}},at=tt?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return _t(e)})(r):r;var{is:Kt,defineProperty:Yt,getOwnPropertyDescriptor:Jt,getOwnPropertyNames:Xt,getOwnPropertySymbols:Gt,getPrototypeOf:Qt}=Object,et=globalThis,wt=et.trustedTypes,Zt=wt?wt.emptyScript:"",te=et.reactiveElementPolyfillSupport,H=(r,t)=>r,W={toAttribute(r,t){switch(t){case Boolean:r=r?Zt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},st=(r,t)=>!Kt(r,t),xt={attribute:!0,type:String,converter:W,reflect:!1,useDefault:!1,hasChanged:st};Symbol.metadata??=Symbol("metadata"),et.litPropertyMetadata??=new WeakMap;var A=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=xt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&Yt(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){let{get:i,set:o}=Jt(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:i,set(n){let l=i?.call(this);o?.call(this,n),this.requestUpdate(t,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??xt}static _$Ei(){if(this.hasOwnProperty(H("elementProperties")))return;let t=Qt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(H("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(H("properties"))){let e=this.properties,s=[...Xt(e),...Gt(e)];for(let i of s)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let i of s)e.unshift(at(i))}else t!==void 0&&e.push(at(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return bt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){let o=(s.converter?.toAttribute!==void 0?s.converter:W).toAttribute(e,s.type);this._$Em=t,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,e){let s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let o=s.getPropertyOptions(i),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:W;this._$Em=i;let l=n.fromAttribute(e,o.type);this[i]=l??this._$Ej?.get(i)??l,this._$Em=null}}requestUpdate(t,e,s,i=!1,o){if(t!==void 0){let n=this.constructor;if(i===!1&&(o=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??st)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:o},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),o!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,o]of s){let{wrapped:n}=o,l=this[i];n!==!0||this._$AL.has(i)||l===void 0||this.C(i,void 0,o,l)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};A.elementStyles=[],A.shadowRootOptions={mode:"open"},A[H("elementProperties")]=new Map,A[H("finalized")]=new Map,te?.({ReactiveElement:A}),(et.reactiveElementVersions??=[]).push("2.1.2");var mt=globalThis,At=r=>r,it=mt.trustedTypes,St=it?it.createPolicy("lit-html",{createHTML:r=>r}):void 0,Pt="$lit$",z=`lit$${Math.random().toFixed(9).slice(2)}$`,Tt="?"+z,ee=`<${Tt}>`,R=document,q=()=>R.createComment(""),F=r=>r===null||typeof r!="object"&&typeof r!="function",ft=Array.isArray,se=r=>ft(r)||typeof r?.[Symbol.iterator]=="function",lt=`[ 	
\f\r]`,I=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Et=/-->/g,kt=/>/g,P=RegExp(`>|${lt}(?:([^\\s"'>=/]+)(${lt}*=${lt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ct=/'/g,zt=/"/g,Rt=/^(?:script|style|textarea|title)$/i,gt=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),h=gt(1),ge=gt(2),ye=gt(3),M=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),Dt=new WeakMap,T=R.createTreeWalker(R,129);function Mt(r,t){if(!ft(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return St!==void 0?St.createHTML(t):t}var ie=(r,t)=>{let e=r.length-1,s=[],i,o=t===2?"<svg>":t===3?"<math>":"",n=I;for(let l=0;l<e;l++){let a=r[l],u,f,m=-1,x=0;for(;x<a.length&&(n.lastIndex=x,f=n.exec(a),f!==null);)x=n.lastIndex,n===I?f[1]==="!--"?n=Et:f[1]!==void 0?n=kt:f[2]!==void 0?(Rt.test(f[2])&&(i=RegExp("</"+f[2],"g")),n=P):f[3]!==void 0&&(n=P):n===P?f[0]===">"?(n=i??I,m=-1):f[1]===void 0?m=-2:(m=n.lastIndex-f[2].length,u=f[1],n=f[3]===void 0?P:f[3]==='"'?zt:Ct):n===zt||n===Ct?n=P:n===Et||n===kt?n=I:(n=P,i=void 0);let k=n===P&&r[l+1].startsWith("/>")?" ":"";o+=n===I?a+ee:m>=0?(s.push(u),a.slice(0,m)+Pt+a.slice(m)+z+k):a+z+(m===-2?l:k)}return[Mt(r,o+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},V=class r{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let o=0,n=0,l=t.length-1,a=this.parts,[u,f]=ie(t,e);if(this.el=r.createElement(u,s),T.currentNode=this.el.content,e===2||e===3){let m=this.el.content.firstChild;m.replaceWith(...m.childNodes)}for(;(i=T.nextNode())!==null&&a.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(let m of i.getAttributeNames())if(m.endsWith(Pt)){let x=f[n++],k=i.getAttribute(m).split(z),Q=/([.?@])?(.*)/.exec(x);a.push({type:1,index:o,name:Q[2],strings:k,ctor:Q[1]==="."?ht:Q[1]==="?"?dt:Q[1]==="@"?ut:O}),i.removeAttribute(m)}else m.startsWith(z)&&(a.push({type:6,index:o}),i.removeAttribute(m));if(Rt.test(i.tagName)){let m=i.textContent.split(z),x=m.length-1;if(x>0){i.textContent=it?it.emptyScript:"";for(let k=0;k<x;k++)i.append(m[k],q()),T.nextNode(),a.push({type:2,index:++o});i.append(m[x],q())}}}else if(i.nodeType===8)if(i.data===Tt)a.push({type:2,index:o});else{let m=-1;for(;(m=i.data.indexOf(z,m+1))!==-1;)a.push({type:7,index:o}),m+=z.length-1}o++}}static createElement(t,e){let s=R.createElement("template");return s.innerHTML=t,s}};function U(r,t,e=r,s){if(t===M)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl,o=F(t)?void 0:t._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(r),i._$AT(r,e,s)),s!==void 0?(e._$Co??=[])[s]=i:e._$Cl=i),i!==void 0&&(t=U(r,i._$AS(r,t.values),i,s)),t}var ct=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??R).importNode(e,!0);T.currentNode=i;let o=T.nextNode(),n=0,l=0,a=s[0];for(;a!==void 0;){if(n===a.index){let u;a.type===2?u=new K(o,o.nextSibling,this,t):a.type===1?u=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(u=new pt(o,this,t)),this._$AV.push(u),a=s[++l]}n!==a?.index&&(o=T.nextNode(),n++)}return T.currentNode=R,i}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},K=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=U(this,t,e),F(t)?t===d||t==null||t===""?(this._$AH!==d&&this._$AR(),this._$AH=d):t!==this._$AH&&t!==M&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):se(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==d&&F(this._$AH)?this._$AA.nextSibling.data=t:this.T(R.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=V.createElement(Mt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{let o=new ct(i,this),n=o.u(this.options);o.p(e),this.T(n),this._$AH=o}}_$AC(t){let e=Dt.get(t.strings);return e===void 0&&Dt.set(t.strings,e=new V(t)),e}k(t){ft(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,i=0;for(let o of t)i===e.length?e.push(s=new r(this.O(q()),this.O(q()),this,this.options)):s=e[i],s._$AI(o),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=At(t).nextSibling;At(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},O=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,o){this.type=1,this._$AH=d,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=d}_$AI(t,e=this,s,i){let o=this.strings,n=!1;if(o===void 0)t=U(this,t,e,0),n=!F(t)||t!==this._$AH&&t!==M,n&&(this._$AH=t);else{let l=t,a,u;for(t=o[0],a=0;a<o.length-1;a++)u=U(this,l[s+a],e,a),u===M&&(u=this._$AH[a]),n||=!F(u)||u!==this._$AH[a],u===d?t=d:t!==d&&(t+=(u??"")+o[a+1]),this._$AH[a]=u}n&&!i&&this.j(t)}j(t){t===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},ht=class extends O{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===d?void 0:t}},dt=class extends O{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==d)}},ut=class extends O{constructor(t,e,s,i,o){super(t,e,s,i,o),this.type=5}_$AI(t,e=this){if((t=U(this,t,e,0)??d)===M)return;let s=this._$AH,i=t===d&&s!==d||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==d&&(s===d||i);i&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},pt=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){U(this,t)}};var re=mt.litHtmlPolyfillSupport;re?.(V,K),(mt.litHtmlVersions??=[]).push("3.3.3");var Nt=(r,t,e)=>{let s=e?.renderBefore??t,i=s._$litPart$;if(i===void 0){let o=e?.renderBefore??null;s._$litPart$=i=new K(t.insertBefore(q(),o),o,void 0,e??{})}return i._$AI(r),i};var yt=globalThis,$=class extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Nt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return M}};$._$litElement$=!0,$.finalized=!0,yt.litElementHydrateSupport?.({LitElement:$});var oe=yt.litElementPolyfillSupport;oe?.({LitElement:$});(yt.litElementVersions??=[]).push("4.2.2");var ne={attribute:!0,type:String,converter:W,reflect:!1,hasChanged:st},ae=(r=ne,t,e)=>{let{kind:s,metadata:i}=e,o=globalThis.litPropertyMetadata.get(i);if(o===void 0&&globalThis.litPropertyMetadata.set(i,o=new Map),s==="setter"&&((r=Object.create(r)).wrapped=!0),o.set(e.name,r),s==="accessor"){let{name:n}=e;return{set(l){let a=t.get.call(this);t.set.call(this,l),this.requestUpdate(n,a,r,!0,l)},init(l){return l!==void 0&&this.C(n,void 0,r,l),l}}}if(s==="setter"){let{name:n}=e;return function(l){let a=this[n];t.call(this,l),this.requestUpdate(n,a,r,!0,l)}}throw Error("Unsupported decorator location: "+s)};function b(r){return(t,e)=>typeof e=="object"?ae(r,t,e):((s,i,o)=>{let n=i.hasOwnProperty(o);return i.constructor.createProperty(o,s),n?Object.getOwnPropertyDescriptor(i,o):void 0})(r,t,e)}function g(r){return b({...r,state:!0,attribute:!1})}function B(r){return t=>{customElements.get(r)||customElements.define(r,t)}}var Y={en:{schedule:"Schedule",schedule_off:"Schedule off \u2014 the zone keeps manual settings.",no_blocks:"No schedule yet. Choose a day and add blocks.",edit_day:"Edit",add_block:"Add block",copy_to:"Copy to",save:"Save",cancel:"Cancel",saved:"Saved",error:"Not saved",temperature:"Temperature",remove:"Remove",overrides:"Overrides",no_overrides:"No overrides.",add_override:"Add override",from:"From",to:"Until",reason:"Reason",next:"Next",resume:"Resume schedule",hold_until:"Hold until",hold_permanent:"Hold permanently",hold:"Hold",on:"On",off:"Off",unavailable:"Unavailable","preset.none":"Manual","preset.comfort":"Comfort","preset.eco":"Eco","preset.sleep":"Sleep","preset.away":"Away","day.mon":"Mon","day.tue":"Tue","day.wed":"Wed","day.thu":"Thu","day.fri":"Fri","day.sat":"Sat","day.sun":"Sun",pick_entity:"Choose a Heat Zones thermostat",show_controls:"Show controls",show_schedule:"Show schedule",show_overrides:"Show overrides"},pl:{schedule:"Harmonogram",schedule_off:"Harmonogram wy\u0142\u0105czony \u2014 strefa trzyma r\u0119czne ustawienia.",no_blocks:"Brak harmonogramu. Wybierz dzie\u0144 i dodaj bloki.",edit_day:"Edytuj",add_block:"Dodaj blok",copy_to:"Kopiuj do",save:"Zapisz",cancel:"Anuluj",saved:"Zapisano",error:"Nie zapisano",temperature:"Temperatura",remove:"Usu\u0144",overrides:"Nadpisania",no_overrides:"Brak nadpisa\u0144.",add_override:"Dodaj nadpisanie",from:"Od",to:"Do",reason:"Pow\xF3d",next:"Nast\u0119pnie",resume:"Wr\xF3\u0107 do harmonogramu",hold_until:"Trzymaj do",hold_permanent:"Trzymaj na sta\u0142e",hold:"Trzymaj",on:"W\u0142.",off:"Wy\u0142.",unavailable:"Niedost\u0119pne","preset.none":"R\u0119cznie","preset.comfort":"Komfort","preset.eco":"Eko","preset.sleep":"Sen","preset.away":"Poza domem","day.mon":"Pn","day.tue":"Wt","day.wed":"\u015Ar","day.thu":"Cz","day.fri":"Pt","day.sat":"So","day.sun":"Nd",pick_entity:"Wybierz termostat Stref ciep\u0142a",show_controls:"Poka\u017C sterowanie",show_schedule:"Poka\u017C harmonogram",show_overrides:"Poka\u017C nadpisania"}};function v(r){let t=(r?.locale?.language??r?.language??"en").split("-")[0];return t in Y?t:"en"}function c(r,t){return Y[r]?.[t]??Y.en[t]??t}function D(r,t){let e=`preset.${t}`;return Y[r]?.[e]??Y.en[e]??t}function S(r,t){return t==null||Number.isNaN(t)?"\u2014":`${t.toLocaleString(r,{maximumFractionDigits:1})} \xB0C`}function J(r,t){let e=new Date(t),s=new Date,i=e.toLocaleTimeString(r,{hour:"2-digit",minute:"2-digit"});return e.toDateString()===s.toDateString()?i:`${e.toLocaleDateString(r,{weekday:"short",day:"numeric",month:"numeric"})} ${i}`}var w=["mon","tue","wed","thu","fri","sat","sun"];function le(r){return r.preset_mode!==void 0?r.preset_mode:`t:${r.temperature}`}function ot(r){return r.startsWith("t:")?{temperature:Number(r.slice(2))}:{preset_mode:r}}function vt(r){let t=Object.fromEntries(w.map(e=>[e,[]]));for(let e of r)for(let s of e.days)t[s].push({time:e.time,value:le(e)});for(let e of w)t[e].sort((s,i)=>s.time.localeCompare(i.time));return t}function Ut(r){let t=new Map;for(let s of w)for(let i of r[s]){let o=`${i.time}|${i.value}`,n=t.get(o)??[];n.includes(s)||n.push(s),t.set(o,n)}let e=[];for(let[s,i]of t){let[o,n]=[s.slice(0,5),s.slice(6)];e.push({days:i,time:o,...ot(n)})}return e.sort((s,i)=>w.indexOf(s.days[0])-w.indexOf(i.days[0])||s.time.localeCompare(i.time)),e}function ce(r){let[t,e]=r.split(":").map(Number);return t*60+e}function Ot(r,t){let e=w.indexOf(t),s=null;for(let a=1;a<=7&&s===null;a++){let u=r[w[(e-a+7)%7]];u.length&&(s=u[u.length-1].value)}let i=r[t];if(s===null&&!i.length)return[];let o=[],n=0,l=s??i[0].value;for(let a of i){let u=ce(a.time);u>n&&o.push({from:n,to:u,value:l}),n=u,l=a.value}return o.push({from:n,to:1440,value:l}),o}function Bt(r,t){return r.startsWith("t:")?Number(r.slice(2)):t[r]??null}var N=[[16,[43,108,176]],[18,[79,155,217]],[19.5,[163,200,234]],[20,[244,194,138]],[21,[239,152,72]],[23,[217,83,30]]];function jt(r){if(r<=N[0][0])return N[0][1];for(let t=1;t<N.length;t++){let[e,s]=N[t],[i,o]=N[t-1];if(r<=e){let n=(r-i)/(e-i);return o.map((l,a)=>Math.round(l+(s[a]-l)*n))}}return N[N.length-1][1]}function Lt(r){return r===null?"var(--disabled-color, #bdbdbd)":`rgb(${jt(r).join(",")})`}function Ht(r){if(r===null)return"#fff";let[t,e,s]=jt(r);return .299*t+.587*e+.114*s>170?"#1f2937":"#fff"}function X(r){let t=e=>String(e).padStart(2,"0");return`${r.getFullYear()}-${t(r.getMonth()+1)}-${t(r.getDate())}T${t(r.getHours())}:${t(r.getMinutes())}`}var G=C`
  :host {
    display: block;
    --hz-gap: 12px;
    --hz-radius: 10px;
    --hz-muted: var(--secondary-text-color, #727272);
    --hz-line: var(--divider-color, rgba(127, 127, 127, 0.25));
    --hz-accent: var(--primary-color, #03a9f4);
    color: var(--primary-text-color);
  }
  .muted {
    color: var(--hz-muted);
    font-size: 0.9em;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .grow {
    flex: 1;
    min-width: 0;
  }
  button {
    font: inherit;
    border: 1px solid var(--hz-line);
    background: var(--card-background-color, transparent);
    color: inherit;
    border-radius: 999px;
    padding: 6px 12px;
    cursor: pointer;
    min-height: 32px;
  }
  button:hover {
    border-color: var(--hz-accent);
  }
  button.primary {
    background: var(--hz-accent);
    border-color: var(--hz-accent);
    color: var(--text-primary-color, #fff);
  }
  button.active {
    border-color: var(--hz-accent);
    color: var(--hz-accent);
    font-weight: 600;
  }
  button.icon {
    padding: 4px 10px;
    border-radius: 8px;
  }
  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  input,
  select {
    font: inherit;
    color: inherit;
    background: var(--secondary-background-color, transparent);
    border: 1px solid var(--hz-line);
    border-radius: 8px;
    padding: 6px 8px;
    min-height: 32px;
    box-sizing: border-box;
  }
  input[type="number"] {
    width: 5.5em;
  }
  h3 {
    margin: 0;
    font-size: 1em;
    font-weight: 600;
  }
  section + section {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--hz-line);
  }
`;async function qt(r,t){return(await r.callWS({type:"call_service",domain:"heat_zones",service:"get_schedule",target:{entity_id:t},return_response:!0})).response?.[t]??null}function Wt(r,t){return r.states[t]?.attributes.preset_temperatures??{}}function It(r,t){return t.startsWith("t:")?S(r,Number(t.slice(2))):D(r,t)}var _=class extends ${constructor(){super(...arguments);this.entity="";this.schedule=null;this.draft=null;this.day=null;this.copyTo=[];this.message="";this.loadedFor="";this.stamp=""}updated(){let e=this.hass?.states[this.entity];if(!e)return;let s=e.last_updated;!this.draft&&(this.loadedFor!==this.entity||s!==this.stamp)&&(this.loadedFor=this.entity,this.stamp=s,qt(this.hass,this.entity).then(i=>this.schedule=i,()=>this.schedule=null))}get days(){return this.draft??vt(this.schedule?.weekly??[])}edit(e){this.draft||(this.draft=vt(this.schedule?.weekly??[])),this.day=e,this.copyTo=[],this.message=""}change(e,s){if(!this.draft||!this.day)return;let i=this.draft[this.day].map((o,n)=>n===e?{...o,...s}:o);this.draft={...this.draft,[this.day]:i}}add(){if(!this.draft||!this.day)return;let e=this.draft[this.day],s=e[e.length-1],i=s?`${String(Math.min(23,Number(s.time.slice(0,2))+2)).padStart(2,"0")}:00`:"06:00";this.draft={...this.draft,[this.day]:[...e,{time:i,value:"comfort"}]}}removeBlock(e){!this.draft||!this.day||(this.draft={...this.draft,[this.day]:this.draft[this.day].filter((s,i)=>i!==e)})}toggleCopy(e){this.copyTo=this.copyTo.includes(e)?this.copyTo.filter(s=>s!==e):[...this.copyTo,e]}cancel(){this.draft=null,this.day=null,this.copyTo=[]}async save(){if(!this.draft)return;let e={...this.draft};if(this.day){let s=[...e[this.day]].sort((i,o)=>i.time.localeCompare(o.time));e[this.day]=s;for(let i of this.copyTo)e[i]=s.map(o=>({...o}))}try{await this.hass.callService("heat_zones","set_schedule",{weekly:Ut(e)},{entity_id:this.entity}),this.message=c(v(this.hass),"saved"),this.draft=null,this.day=null,this.copyTo=[],this.stamp="",this.requestUpdate()}catch(s){this.message=`${c(v(this.hass),"error")}: ${s.message??s}`}}renderBar(e){let s=v(this.hass),i=Wt(this.hass,this.entity),o=Ot(this.days,e);return h`<div class="bar ${this.day===e?"selected":""}" @click=${()=>this.edit(e)}>
      ${o.map(n=>{let l=Bt(n.value,i),a=n.from/1440*100,u=(n.to-n.from)/1440*100,f=u>9?It(s,n.value):"";return h`<div
          class="segment"
          style="left:${a}%;width:${u}%;background:${Lt(l)};color:${Ht(l)}"
          title="${It(s,n.value)} ${l!==null?S(s,l):""}"
        >${f}</div>`})}
    </div>`}renderDay(){if(!this.draft||!this.day)return d;let e=v(this.hass),s=Wt(this.hass,this.entity),i=this.hass.states[this.entity]?.attributes.preset_modes?.filter(n=>n!=="none")??[],o=this.day;return h`<div class="blocks">
      ${this.draft[o].map((n,l)=>h`<div class="row">
          <input type="time" .value=${n.time} @change=${a=>this.change(l,{time:a.target.value})} />
          <select
            @change=${a=>{let u=a.target.value;this.change(l,{value:u==="t"?`t:${s.comfort??21}`:u})}}
          >
            ${i.map(a=>h`<option value=${a} ?selected=${n.value===a}>${D(e,a)}</option>`)}
            <option value="t" ?selected=${n.value.startsWith("t:")}>${c(e,"temperature")}</option>
          </select>
          ${n.value.startsWith("t:")?h`<input
                type="number"
                min="5"
                max="30"
                step="0.5"
                .value=${String(ot(n.value).temperature)}
                @change=${a=>this.change(l,{value:`t:${a.target.value}`})}
              />`:h`<span class="muted">${S(e,s[n.value])}</span>`}
          <span class="grow"></span>
          <button class="icon" @click=${()=>this.removeBlock(l)} title=${c(e,"remove")}>✕</button>
        </div>`)}
      <div class="row"><button @click=${this.add}>＋ ${c(e,"add_block")}</button></div>
      <div class="row copy">
        <span class="muted">${c(e,"copy_to")}:</span>
        ${w.filter(n=>n!==o).map(n=>h`<button class=${this.copyTo.includes(n)?"active":""} @click=${()=>this.toggleCopy(n)}>
            ${c(e,`day.${n}`)}
          </button>`)}
      </div>
      <div class="row">
        <button class="primary" @click=${this.save}>${c(e,"save")}</button>
        <button @click=${this.cancel}>${c(e,"cancel")}</button>
      </div>
    </div>`}render(){if(!this.hass||!this.hass.states[this.entity])return d;let e=v(this.hass),s=!(this.schedule?.weekly.length??0)&&!this.draft;return h`
      <div class="week">
        ${w.map(i=>h`<div class="day ${this.day===i?"selected":""}" @click=${()=>this.edit(i)}>
              ${c(e,`day.${i}`)}
            </div>
            ${this.renderBar(i)}`)}
        <div class="hours"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
      </div>
      ${s?h`<div class="muted" style="margin-top:8px">${c(e,"no_blocks")}</div>`:d}
      ${this.renderDay()}
      ${this.message?h`<div class="muted" style="margin-top:8px">${this.message}</div>`:d}
    `}};_.styles=[G,C`
      .week {
        display: grid;
        grid-template-columns: 2.6em 1fr;
        gap: 6px 8px;
        align-items: center;
      }
      .day {
        font-size: 0.9em;
        color: var(--hz-muted);
        cursor: pointer;
      }
      .day.selected {
        color: var(--hz-accent);
        font-weight: 600;
      }
      .bar {
        position: relative;
        height: 22px;
        border-radius: 6px;
        overflow: hidden;
        background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
        cursor: pointer;
      }
      .bar.selected {
        outline: 2px solid var(--hz-accent);
      }
      .segment {
        position: absolute;
        top: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7em;
        white-space: nowrap;
        overflow: hidden;
        border-right: 1px solid rgba(255, 255, 255, 0.4);
        box-sizing: border-box;
      }
      .hours {
        display: flex;
        justify-content: space-between;
        font-size: 0.7em;
        color: var(--hz-muted);
        grid-column: 2;
      }
      .blocks {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
      }
      .copy button {
        padding: 4px 8px;
        min-height: 28px;
      }
    `],p([b({attribute:!1})],_.prototype,"hass",2),p([b()],_.prototype,"entity",2),p([g()],_.prototype,"schedule",2),p([g()],_.prototype,"draft",2),p([g()],_.prototype,"day",2),p([g()],_.prototype,"copyTo",2),p([g()],_.prototype,"message",2),_=p([B("heat-zones-schedule-editor")],_);var y=class extends ${constructor(){super(...arguments);this.entity="";this.schedule=null;this.adding=!1;this.from="";this.to="";this.value="away";this.reason="";this.message="";this.loadedFor="";this.stamp=""}updated(){let e=this.hass?.states[this.entity];e&&(this.loadedFor!==this.entity||e.last_updated!==this.stamp)&&(this.loadedFor=this.entity,this.stamp=e.last_updated,qt(this.hass,this.entity).then(s=>this.schedule=s,()=>this.schedule=null))}open(){let e=new Date;this.from=X(e),this.to=X(new Date(e.getTime()+3*3600*1e3)),this.adding=!0,this.message=""}async add(){let e={start:new Date(this.from).toISOString(),end:new Date(this.to).toISOString(),reason:this.reason,source:"card",...ot(this.value)};try{await this.hass.callService("heat_zones","add_override",e,{entity_id:this.entity}),this.adding=!1,this.reason="",this.stamp=""}catch(s){this.message=`${c(v(this.hass),"error")}: ${s.message??s}`}}removeOverride(e){this.hass.callService("heat_zones","remove_override",{override_id:e},{entity_id:this.entity})}render(){if(!this.hass||!this.hass.states[this.entity])return d;let e=v(this.hass),s=this.schedule?.overrides??[],i=this.hass.states[this.entity].attributes.preset_modes?.filter(o=>o!=="none")??[];return h`
      ${s.length?h`<ul>
            ${s.map(o=>h`<li class="row">
                <span class="grow">
                  <strong>${o.preset_mode?D(e,o.preset_mode):S(e,o.temperature)}</strong>
                  ${o.reason?h` · ${o.reason}`:d}
                  <div class="muted">${J(e,o.start)} – ${J(e,o.end)}${o.source?` \xB7 ${o.source}`:""}</div>
                </span>
                <button class="icon" @click=${()=>this.removeOverride(o.override_id)} title=${c(e,"remove")}>✕</button>
              </li>`)}
          </ul>`:h`<div class="muted">${c(e,"no_overrides")}</div>`}
      ${this.adding?h`<div class="form">
            <span>${c(e,"from")}</span>
            <input type="datetime-local" .value=${this.from} @change=${o=>this.from=o.target.value} />
            <span>${c(e,"to")}</span>
            <input type="datetime-local" .value=${this.to} @change=${o=>this.to=o.target.value} />
            <span></span>
            <div class="row">
              <select @change=${o=>this.value=o.target.value}>
                ${i.map(o=>h`<option value=${o} ?selected=${this.value===o}>${D(e,o)}</option>`)}
                <option value="t:21" ?selected=${this.value.startsWith("t:")}>${c(e,"temperature")}</option>
              </select>
              ${this.value.startsWith("t:")?h`<input
                    type="number"
                    min="5"
                    max="30"
                    step="0.5"
                    .value=${this.value.slice(2)}
                    @change=${o=>this.value=`t:${o.target.value}`}
                  />`:d}
            </div>
            <span>${c(e,"reason")}</span>
            <input .value=${this.reason} maxlength="200" @input=${o=>this.reason=o.target.value} />
            <span></span>
            <div class="row">
              <button class="primary" @click=${this.add}>${c(e,"save")}</button>
              <button @click=${()=>this.adding=!1}>${c(e,"cancel")}</button>
            </div>
          </div>`:h`<div class="row" style="margin-top:8px"><button @click=${this.open}>＋ ${c(e,"add_override")}</button></div>`}
      ${this.message?h`<div class="muted">${this.message}</div>`:d}
    `}};y.styles=[G,C`
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .form {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 8px;
        align-items: center;
        margin-top: 8px;
      }
    `],p([b({attribute:!1})],y.prototype,"hass",2),p([b()],y.prototype,"entity",2),p([g()],y.prototype,"schedule",2),p([g()],y.prototype,"adding",2),p([g()],y.prototype,"from",2),p([g()],y.prototype,"to",2),p([g()],y.prototype,"value",2),p([g()],y.prototype,"reason",2),p([g()],y.prototype,"message",2),y=p([B("heat-zones-overrides")],y);function he(r){return r?.attributes?.homeai_schedule?.domain==="heat_zones"}var E=class extends ${constructor(){super(...arguments);this.holdOpen=!1;this.holdUntil=""}setConfig(e){if(!e.entity)throw new Error("entity is required");this.config={show_controls:!0,show_schedule:!0,show_overrides:!0,...e}}getCardSize(){return 8}static getStubConfig(e){return{type:"custom:heat-zones-card",entity:Object.values(e.states).find(i=>i.entity_id.startsWith("climate.")&&he(i))?.entity_id??""}}static getConfigElement(){return document.createElement("heat-zones-card-editor")}get st(){return this.hass?.states[this.config.entity]}scheduleSwitch(){let e=this.hass.entities?.[this.config.entity];if(e?.device_id){let i=Object.values(this.hass.entities??{}).find(o=>o.device_id===e.device_id&&o.platform==="heat_zones"&&o.translation_key==="schedule");if(i)return i.entity_id}let s=`switch.${this.config.entity.split(".")[1]}_schedule`;return this.hass.states[s]?s:void 0}climate(e,s={}){this.hass.callService("climate",e,s,{entity_id:this.config.entity})}step(e){let s=this.st.attributes,i=Math.round(((s.temperature??20)+e)*2)/2;this.climate("set_temperature",{temperature:Math.max(s.min_temp??5,Math.min(s.max_temp??30,i))})}hold(e){this.hass.callService("heat_zones","hold",e,{entity_id:this.config.entity}),this.holdOpen=!1}renderHead(e){let s=v(this.hass),i=e.attributes,o=i.next_change,n=i.hvac_action==="heating";return h`<div class="head">
        <div class="grow">
          <h3>${this.config.title??i.friendly_name}</h3>
          <div class="now ${n?"heating":""}">${S(s,i.current_temperature)}</div>
          <div class="why muted">${i.reason??""}</div>
          ${o?h`<div class="muted">
                ${c(s,"next")}: ${J(s,o.at)} →
                ${o.preset_mode?D(s,o.preset_mode):""} ${S(s,o.temperature)}
              </div>`:d}
        </div>
        ${this.config.show_controls?h`<div class="target">
              <button class="icon" @click=${()=>this.step(-.5)} ?disabled=${e.state==="off"}>−</button>
              <strong>${e.state==="off"?c(s,"off"):S(s,i.temperature)}</strong>
              <button class="icon" @click=${()=>this.step(.5)} ?disabled=${e.state==="off"}>＋</button>
            </div>`:d}
      </div>
      ${this.config.show_controls?this.renderControls(e):d}`}renderControls(e){let s=v(this.hass),i=e.attributes,o=(i.preset_modes??[]).filter(a=>a!=="none"),n=i.source==="hold",l=i.schedule_enabled;return h`<div class="row chips">
        <button class=${e.state==="off"?"":"active"} @click=${()=>this.climate(e.state==="off"?"turn_on":"turn_off")}>
          ${e.state==="off"?c(s,"off"):c(s,"on")}
        </button>
        ${o.map(a=>h`<button class=${i.preset_mode===a?"active":""} @click=${()=>this.climate("set_preset_mode",{preset_mode:a})}>
            ${D(s,a)}
          </button>`)}
      </div>
      ${l?h`<div class="row chips">
            ${n?h`<button @click=${()=>this.hass.callService("heat_zones","resume",{},{entity_id:this.config.entity})}>
              ${c(s,"resume")}</button>`:d}
            <button @click=${()=>this.hold({permanent:!0})}>${c(s,"hold_permanent")}</button>
            ${this.holdOpen?h`<input type="datetime-local" .value=${this.holdUntil} @change=${a=>this.holdUntil=a.target.value} />
                  <button class="primary" @click=${()=>this.hold({until:new Date(this.holdUntil).toISOString()})}>${c(s,"hold")}</button>`:h`<button @click=${()=>{this.holdUntil=X(new Date(Date.now()+2*3600*1e3)),this.holdOpen=!0}}>${c(s,"hold_until")}…</button>`}
          </div>`:d}`}render(){if(!this.hass||!this.config)return d;let e=this.st,s=v(this.hass);if(!e)return h`<ha-card><div class="muted">${this.config.entity}: ${c(s,"unavailable")}</div></ha-card>`;let i=this.scheduleSwitch(),o=i?this.hass.states[i]?.state==="on":e.attributes.schedule_enabled;return h`<ha-card>
      <section>${this.renderHead(e)}</section>
      ${this.config.show_schedule?h`<section>
            <div class="row" style="margin-bottom:8px">
              <h3 class="grow">${c(s,"schedule")}</h3>
              ${i?h`<button class=${o?"active":""} @click=${()=>this.hass.callService("switch",o?"turn_off":"turn_on",{},{entity_id:i})}>
                    ${o?c(s,"on"):c(s,"off")}
                  </button>`:d}
            </div>
            ${o?d:h`<div class="muted" style="margin-bottom:8px">${c(s,"schedule_off")}</div>`}
            <heat-zones-schedule-editor .hass=${this.hass} .entity=${this.config.entity}></heat-zones-schedule-editor>
          </section>`:d}
      ${this.config.show_overrides?h`<section>
            <h3 style="margin-bottom:8px">${c(s,"overrides")}</h3>
            <heat-zones-overrides .hass=${this.hass} .entity=${this.config.entity}></heat-zones-overrides>
          </section>`:d}
    </ha-card>`}};E.styles=[G,C`
      ha-card {
        padding: 16px;
      }
      .head {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      .now {
        font-size: 2.4em;
        font-weight: 300;
        line-height: 1;
      }
      .target {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .target strong {
        font-size: 1.3em;
        min-width: 4.2em;
        text-align: center;
      }
      .chips {
        margin-top: 12px;
      }
      .why {
        margin-top: 4px;
      }
      .heating {
        color: var(--state-climate-heat-color, #ff8100);
      }
    `],p([b({attribute:!1})],E.prototype,"hass",2),p([g()],E.prototype,"config",2),p([g()],E.prototype,"holdOpen",2),p([g()],E.prototype,"holdUntil",2),E=p([B("heat-zones-card")],E);var j=class extends ${setConfig(t){this.config=t}changed(t){this.config=t.detail.value,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this.config)return d;let t=v(this.hass),e=[{name:"entity",required:!0,selector:{entity:{domain:"climate",integration:"heat_zones"}}},{name:"title",selector:{text:{}}},{name:"show_controls",selector:{boolean:{}}},{name:"show_schedule",selector:{boolean:{}}},{name:"show_overrides",selector:{boolean:{}}}],s={entity:c(t,"pick_entity"),show_controls:c(t,"show_controls"),show_schedule:c(t,"show_schedule"),show_overrides:c(t,"show_overrides")};return h`<ha-form
      .hass=${this.hass}
      .data=${{show_controls:!0,show_schedule:!0,show_overrides:!0,...this.config}}
      .schema=${e}
      .computeLabel=${i=>s[i.name]??i.name}
      @value-changed=${this.changed}
    ></ha-form>`}};p([b({attribute:!1})],j.prototype,"hass",2),p([g()],j.prototype,"config",2),j=p([B("heat-zones-card-editor")],j);window.customCards=window.customCards??[];window.customCards.some(r=>r.type==="heat-zones-card")||window.customCards.push({type:"heat-zones-card",name:"Heat Zones",description:"A heat zone with its weekly schedule, holds and overrides.",preview:!1});
