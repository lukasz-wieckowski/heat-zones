var Gt=Object.defineProperty;var Yt=Object.getOwnPropertyDescriptor;var p=(a,t,e,s)=>{for(var r=s>1?void 0:s?Yt(t,e):t,i=a.length-1,o;i>=0;i--)(o=a[i])&&(r=(s?o(t,e,r):o(r))||r);return s&&r&&Gt(t,e,r),r};var tt=globalThis,et=tt.ShadowRoot&&(tt.ShadyCSS===void 0||tt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ct=Symbol(),_t=new WeakMap,I=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==ct)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(et&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=_t.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&_t.set(e,t))}return t}toString(){return this.cssText}},xt=a=>new I(typeof a=="string"?a:a+"",void 0,ct),T=(a,...t)=>{let e=a.length===1?a[0]:t.reduce((s,r,i)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+a[i+1],a[0]);return new I(e,a,ct)},kt=(a,t)=>{if(et)a.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),r=tt.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=e.cssText,a.appendChild(s)}},dt=et?a=>a:a=>a instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return xt(e)})(a):a;var{is:Jt,defineProperty:Xt,getOwnPropertyDescriptor:Qt,getOwnPropertyNames:Zt,getOwnPropertySymbols:te,getPrototypeOf:ee}=Object,st=globalThis,At=st.trustedTypes,se=At?At.emptyScript:"",re=st.reactiveElementPolyfillSupport,W=(a,t)=>a,q={toAttribute(a,t){switch(t){case Boolean:a=a?se:null;break;case Object:case Array:a=a==null?a:JSON.stringify(a)}return a},fromAttribute(a,t){let e=a;switch(t){case Boolean:e=a!==null;break;case Number:e=a===null?null:Number(a);break;case Object:case Array:try{e=JSON.parse(a)}catch{e=null}}return e}},rt=(a,t)=>!Jt(a,t),St={attribute:!0,type:String,converter:q,reflect:!1,useDefault:!1,hasChanged:rt};Symbol.metadata??=Symbol("metadata"),st.litPropertyMetadata??=new WeakMap;var E=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=St){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),r=this.getPropertyDescriptor(t,s,e);r!==void 0&&Xt(this.prototype,t,r)}}static getPropertyDescriptor(t,e,s){let{get:r,set:i}=Qt(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get:r,set(o){let h=r?.call(this);i?.call(this,o),this.requestUpdate(t,h,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??St}static _$Ei(){if(this.hasOwnProperty(W("elementProperties")))return;let t=ee(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(W("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(W("properties"))){let e=this.properties,s=[...Zt(e),...te(e)];for(let r of s)this.createProperty(r,e[r])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,r]of e)this.elementProperties.set(s,r)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let r=this._$Eu(e,s);r!==void 0&&this._$Eh.set(r,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let r of s)e.unshift(dt(r))}else t!==void 0&&e.push(dt(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return kt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,s);if(r!==void 0&&s.reflect===!0){let i=(s.converter?.toAttribute!==void 0?s.converter:q).toAttribute(e,s.type);this._$Em=t,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(t,e){let s=this.constructor,r=s._$Eh.get(t);if(r!==void 0&&this._$Em!==r){let i=s.getPropertyOptions(r),o=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:q;this._$Em=r;let h=o.fromAttribute(e,i.type);this[r]=h??this._$Ej?.get(r)??h,this._$Em=null}}requestUpdate(t,e,s,r=!1,i){if(t!==void 0){let o=this.constructor;if(r===!1&&(i=this[t]),s??=o.getPropertyOptions(t),!((s.hasChanged??rt)(i,e)||s.useDefault&&s.reflect&&i===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:r,wrapped:i},o){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),i!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),r===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[r,i]of this._$Ep)this[r]=i;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[r,i]of s){let{wrapped:o}=i,h=this[r];o!==!0||this._$AL.has(r)||h===void 0||this.C(r,void 0,i,h)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};E.elementStyles=[],E.shadowRootOptions={mode:"open"},E[W("elementProperties")]=new Map,E[W("finalized")]=new Map,re?.({ReactiveElement:E}),(st.reactiveElementVersions??=[]).push("2.1.2");var bt=globalThis,Et=a=>a,at=bt.trustedTypes,Ct=at?at.createPolicy("lit-html",{createHTML:a=>a}):void 0,Nt="$lit$",D=`lit$${Math.random().toFixed(9).slice(2)}$`,Ot="?"+D,ae=`<${Ot}>`,N=document,V=()=>N.createComment(""),K=a=>a===null||typeof a!="object"&&typeof a!="function",yt=Array.isArray,ie=a=>yt(a)||typeof a?.[Symbol.iterator]=="function",ut=`[ 	
\f\r]`,F=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Tt=/-->/g,Dt=/>/g,M=RegExp(`>|${ut}(?:([^\\s"'>=/]+)(${ut}*=${ut}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Pt=/'/g,Mt=/"/g,Ut=/^(?:script|style|textarea|title)$/i,$t=a=>(t,...e)=>({_$litType$:a,strings:t,values:e}),d=$t(1),_e=$t(2),xe=$t(3),O=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),Rt=new WeakMap,R=N.createTreeWalker(N,129);function Bt(a,t){if(!yt(a)||!a.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ct!==void 0?Ct.createHTML(t):t}var oe=(a,t)=>{let e=a.length-1,s=[],r,i=t===2?"<svg>":t===3?"<math>":"",o=F;for(let h=0;h<e;h++){let n=a[h],c,g,m=-1,v=0;for(;v<n.length&&(o.lastIndex=v,g=o.exec(n),g!==null);)v=o.lastIndex,o===F?g[1]==="!--"?o=Tt:g[1]!==void 0?o=Dt:g[2]!==void 0?(Ut.test(g[2])&&(r=RegExp("</"+g[2],"g")),o=M):g[3]!==void 0&&(o=M):o===M?g[0]===">"?(o=r??F,m=-1):g[1]===void 0?m=-2:(m=o.lastIndex-g[2].length,c=g[1],o=g[3]===void 0?M:g[3]==='"'?Mt:Pt):o===Mt||o===Pt?o=M:o===Tt||o===Dt?o=F:(o=M,r=void 0);let z=o===M&&a[h+1].startsWith("/>")?" ":"";i+=o===F?n+ae:m>=0?(s.push(c),n.slice(0,m)+Nt+n.slice(m)+D+z):n+D+(m===-2?h:z)}return[Bt(a,i+(a[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},G=class a{constructor({strings:t,_$litType$:e},s){let r;this.parts=[];let i=0,o=0,h=t.length-1,n=this.parts,[c,g]=oe(t,e);if(this.el=a.createElement(c,s),R.currentNode=this.el.content,e===2||e===3){let m=this.el.content.firstChild;m.replaceWith(...m.childNodes)}for(;(r=R.nextNode())!==null&&n.length<h;){if(r.nodeType===1){if(r.hasAttributes())for(let m of r.getAttributeNames())if(m.endsWith(Nt)){let v=g[o++],z=r.getAttribute(m).split(D),P=/([.?@])?(.*)/.exec(v);n.push({type:1,index:i,name:P[2],strings:z,ctor:P[1]==="."?gt:P[1]==="?"?mt:P[1]==="@"?vt:j}),r.removeAttribute(m)}else m.startsWith(D)&&(n.push({type:6,index:i}),r.removeAttribute(m));if(Ut.test(r.tagName)){let m=r.textContent.split(D),v=m.length-1;if(v>0){r.textContent=at?at.emptyScript:"";for(let z=0;z<v;z++)r.append(m[z],V()),R.nextNode(),n.push({type:2,index:++i});r.append(m[v],V())}}}else if(r.nodeType===8)if(r.data===Ot)n.push({type:2,index:i});else{let m=-1;for(;(m=r.data.indexOf(D,m+1))!==-1;)n.push({type:7,index:i}),m+=D.length-1}i++}}static createElement(t,e){let s=N.createElement("template");return s.innerHTML=t,s}};function B(a,t,e=a,s){if(t===O)return t;let r=s!==void 0?e._$Co?.[s]:e._$Cl,i=K(t)?void 0:t._$litDirective$;return r?.constructor!==i&&(r?._$AO?.(!1),i===void 0?r=void 0:(r=new i(a),r._$AT(a,e,s)),s!==void 0?(e._$Co??=[])[s]=r:e._$Cl=r),r!==void 0&&(t=B(a,r._$AS(a,t.values),r,s)),t}var pt=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,r=(t?.creationScope??N).importNode(e,!0);R.currentNode=r;let i=R.nextNode(),o=0,h=0,n=s[0];for(;n!==void 0;){if(o===n.index){let c;n.type===2?c=new Y(i,i.nextSibling,this,t):n.type===1?c=new n.ctor(i,n.name,n.strings,this,t):n.type===6&&(c=new ft(i,this,t)),this._$AV.push(c),n=s[++h]}o!==n?.index&&(i=R.nextNode(),o++)}return R.currentNode=N,r}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},Y=class a{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,r){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=B(this,t,e),K(t)?t===u||t==null||t===""?(this._$AH!==u&&this._$AR(),this._$AH=u):t!==this._$AH&&t!==O&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):ie(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==u&&K(this._$AH)?this._$AA.nextSibling.data=t:this.T(N.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,r=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=G.createElement(Bt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(e);else{let i=new pt(r,this),o=i.u(this.options);i.p(e),this.T(o),this._$AH=i}}_$AC(t){let e=Rt.get(t.strings);return e===void 0&&Rt.set(t.strings,e=new G(t)),e}k(t){yt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,r=0;for(let i of t)r===e.length?e.push(s=new a(this.O(V()),this.O(V()),this,this.options)):s=e[r],s._$AI(i),r++;r<e.length&&(this._$AR(s&&s._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=Et(t).nextSibling;Et(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},j=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,r,i){this.type=1,this._$AH=u,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=i,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=u}_$AI(t,e=this,s,r){let i=this.strings,o=!1;if(i===void 0)t=B(this,t,e,0),o=!K(t)||t!==this._$AH&&t!==O,o&&(this._$AH=t);else{let h=t,n,c;for(t=i[0],n=0;n<i.length-1;n++)c=B(this,h[s+n],e,n),c===O&&(c=this._$AH[n]),o||=!K(c)||c!==this._$AH[n],c===u?t=u:t!==u&&(t+=(c??"")+i[n+1]),this._$AH[n]=c}o&&!r&&this.j(t)}j(t){t===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},gt=class extends j{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===u?void 0:t}},mt=class extends j{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==u)}},vt=class extends j{constructor(t,e,s,r,i){super(t,e,s,r,i),this.type=5}_$AI(t,e=this){if((t=B(this,t,e,0)??u)===O)return;let s=this._$AH,r=t===u&&s!==u||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,i=t!==u&&(s===u||r);r&&this.element.removeEventListener(this.name,this,s),i&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},ft=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){B(this,t)}};var ne=bt.litHtmlPolyfillSupport;ne?.(G,Y),(bt.litHtmlVersions??=[]).push("3.3.3");var jt=(a,t,e)=>{let s=e?.renderBefore??t,r=s._$litPart$;if(r===void 0){let i=e?.renderBefore??null;s._$litPart$=r=new Y(t.insertBefore(V(),i),i,void 0,e??{})}return r._$AI(a),r};var zt=globalThis,_=class extends E{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=jt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return O}};_._$litElement$=!0,_.finalized=!0,zt.litElementHydrateSupport?.({LitElement:_});var he=zt.litElementPolyfillSupport;he?.({LitElement:_});(zt.litElementVersions??=[]).push("4.2.2");var le={attribute:!0,type:String,converter:q,reflect:!1,hasChanged:rt},ce=(a=le,t,e)=>{let{kind:s,metadata:r}=e,i=globalThis.litPropertyMetadata.get(r);if(i===void 0&&globalThis.litPropertyMetadata.set(r,i=new Map),s==="setter"&&((a=Object.create(a)).wrapped=!0),i.set(e.name,a),s==="accessor"){let{name:o}=e;return{set(h){let n=t.get.call(this);t.set.call(this,h),this.requestUpdate(o,n,a,!0,h)},init(h){return h!==void 0&&this.C(o,void 0,a,h),h}}}if(s==="setter"){let{name:o}=e;return function(h){let n=this[o];t.call(this,h),this.requestUpdate(o,n,a,!0,h)}}throw Error("Unsupported decorator location: "+s)};function x(a){return(t,e)=>typeof e=="object"?ce(a,t,e):((s,r,i)=>{let o=r.hasOwnProperty(i);return r.constructor.createProperty(i,s),o?Object.getOwnPropertyDescriptor(r,i):void 0})(a,t,e)}function f(a){return x({...a,state:!0,attribute:!1})}var U=(a,t,e)=>(e.configurable=!0,e.enumerable=!0,Reflect.decorate&&typeof t!="object"&&Object.defineProperty(a,t,e),e);function Lt(a,t){return(e,s,r)=>{let i=o=>o.renderRoot?.querySelector(a)??null;if(t){let{get:o,set:h}=typeof s=="object"?e:r??(()=>{let n=Symbol();return{get(){return this[n]},set(c){this[n]=c}}})();return U(e,s,{get(){let n=o.call(this);return n===void 0&&(n=i(this),(n!==null||this.hasUpdated)&&h.call(this,n)),n}})}return U(e,s,{get(){return i(this)}})}}function L(a){return t=>{customElements.get(a)||customElements.define(a,t)}}var J={en:{schedule:"Schedule",schedule_off:"Schedule off \u2014 the zone keeps manual settings.",no_blocks:"No schedule yet. Choose a day and add blocks.",edit_day:"Edit",add_block:"Add block",copy_to:"Copy to",save:"Save",cancel:"Cancel",saved:"Saved",error:"Not saved",temperature:"Temperature",remove:"Remove",overrides:"Overrides",no_overrides:"No overrides.",add_override:"Add override",from:"From",to:"Until",reason:"Reason",next:"Next",resume:"Resume schedule",hold_until:"Hold until",hold_permanent:"Hold permanently",hold:"Hold",on:"On",off:"Off",unavailable:"Unavailable","preset.none":"Manual","preset.comfort":"Comfort","preset.eco":"Eco","preset.sleep":"Sleep","preset.away":"Away","day.mon":"Mon","day.tue":"Tue","day.wed":"Wed","day.thu":"Thu","day.fri":"Fri","day.sat":"Sat","day.sun":"Sun",pick_entity:"Choose a Heat Zones thermostat",show_controls:"Show controls",show_schedule:"Show schedule",show_overrides:"Show overrides",today:"Today",settings:"Settings",done:"Done",heating:"Heating",measure_at:"Measure at","measure.average":"Average of the rooms","measure.coldest":"Coldest room",current:"Manual changes",hold_help:"A manual change lasts until the next change in the schedule. Here you can keep it longer.",turn_on:"Turn heating on",from_time:"From {time}: {what}",schedule_paused:"Schedule off",schedule_empty:"No schedule yet"},pl:{schedule:"Harmonogram",schedule_off:"Harmonogram wy\u0142\u0105czony \u2014 strefa trzyma r\u0119czne ustawienia.",no_blocks:"Brak harmonogramu. Wybierz dzie\u0144 i dodaj bloki.",edit_day:"Edytuj",add_block:"Dodaj blok",copy_to:"Kopiuj do",save:"Zapisz",cancel:"Anuluj",saved:"Zapisano",error:"Nie zapisano",temperature:"Temperatura",remove:"Usu\u0144",overrides:"Nadpisania",no_overrides:"Brak nadpisa\u0144.",add_override:"Dodaj nadpisanie",from:"Od",to:"Do",reason:"Pow\xF3d",next:"Nast\u0119pnie",resume:"Wr\xF3\u0107 do harmonogramu",hold_until:"Trzymaj do",hold_permanent:"Trzymaj na sta\u0142e",hold:"Trzymaj",on:"W\u0142.",off:"Wy\u0142.",unavailable:"Niedost\u0119pne","preset.none":"R\u0119cznie","preset.comfort":"Komfort","preset.eco":"Eko","preset.sleep":"Sen","preset.away":"Poza domem","day.mon":"Pn","day.tue":"Wt","day.wed":"\u015Ar","day.thu":"Cz","day.fri":"Pt","day.sat":"So","day.sun":"Nd",pick_entity:"Wybierz termostat Stref ciep\u0142a",show_controls:"Poka\u017C sterowanie",show_schedule:"Poka\u017C harmonogram",show_overrides:"Poka\u017C nadpisania",today:"Dzi\u015B",settings:"Ustawienia",done:"Gotowe",heating:"Ogrzewanie",measure_at:"Gdzie mierzy\u0107","measure.average":"\u015Arednio z pokoi","measure.coldest":"Najzimniejszy pok\xF3j",current:"R\u0119czne zmiany",hold_help:"R\u0119czna zmiana trwa do najbli\u017Cszej zmiany w harmonogramie. Tu mo\u017Cesz j\u0105 przed\u0142u\u017Cy\u0107.",turn_on:"W\u0142\u0105cz ogrzewanie",from_time:"Od {time}: {what}",schedule_paused:"Harmonogram wy\u0142\u0105czony",schedule_empty:"Brak harmonogramu"}};function b(a){let t=(a?.locale?.language??a?.language??"en").split("-")[0];return t in J?t:"en"}function l(a,t,e={}){return(J[a]?.[t]??J.en[t]??t).replace(/\{(\w+)\}/g,(r,i)=>e[i]??"")}function C(a,t){let e=`preset.${t}`;return J[a]?.[e]??J.en[e]??t}function S(a,t){return t==null||Number.isNaN(t)?"\u2014":`${t.toLocaleString(a,{maximumFractionDigits:1})} \xB0C`}function X(a,t){let e=new Date(t),s=new Date,r=e.toLocaleTimeString(a,{hour:"2-digit",minute:"2-digit"});return e.toDateString()===s.toDateString()?r:`${e.toLocaleDateString(a,{weekday:"short",day:"numeric",month:"numeric"})} ${r}`}var A=["mon","tue","wed","thu","fri","sat","sun"];function Ht(a){return a.preset_mode!==void 0?a.preset_mode:`t:${a.temperature}`}function it(a){return a.startsWith("t:")?{temperature:Number(a.slice(2))}:{preset_mode:a}}function ot(a){let t=Object.fromEntries(A.map(e=>[e,[]]));for(let e of a)for(let s of e.days)t[s].push({time:e.time,value:Ht(e)});for(let e of A)t[e].sort((s,r)=>s.time.localeCompare(r.time));return t}function It(a){let t=new Map;for(let s of A)for(let r of a[s]){let i=`${r.time}|${r.value}`,o=t.get(i)??[];o.includes(s)||o.push(s),t.set(i,o)}let e=[];for(let[s,r]of t){let[i,o]=[s.slice(0,5),s.slice(6)];e.push({days:r,time:i,...it(o)})}return e.sort((s,r)=>A.indexOf(s.days[0])-A.indexOf(r.days[0])||s.time.localeCompare(r.time)),e}function de(a){let[t,e]=a.split(":").map(Number);return t*60+e}function wt(a,t){let e=A.indexOf(t),s=null;for(let n=1;n<=7&&s===null;n++){let c=a[A[(e-n+7)%7]];c.length&&(s=c[c.length-1].value)}let r=a[t];if(s===null&&!r.length)return[];let i=[],o=0,h=s??r[0].value;for(let n of r){let c=de(n.time);c>o&&i.push({from:o,to:c,value:h}),o=c,h=n.value}return i.push({from:o,to:1440,value:h}),i}function Wt(a,t){let e=A[(t.getDay()+6)%7],s=a.enabled&&a.weekly.length?wt(ot(a.weekly),e):[],r=new Date(t);r.setHours(0,0,0,0);for(let i of a.overrides){let o=Math.max(0,(new Date(i.start).getTime()-r.getTime())/6e4),h=Math.min(1440,(new Date(i.end).getTime()-r.getTime())/6e4);h>o&&(s=ue(s,o,h,Ht(i)))}return s}function ue(a,t,e,s){let r=[];for(let i of a){if(i.to<=t||i.from>=e){r.push(i);continue}i.from<t&&r.push({...i,to:t}),i.to>e&&r.push({...i,from:e})}return r.push({from:t,to:e,value:s}),r.sort((i,o)=>i.from-o.from)}function nt(a,t){return a.startsWith("t:")?Number(a.slice(2)):t[a]??null}var pe=19.75,ge=3.25;function ht(a){if(a===null||Number.isNaN(a))return{side:"unknown",share:1};let t=Math.max(-1,Math.min(1,(a-pe)/ge));return{side:t<0?"cold":"warm",share:Math.round((.35+.65*Math.abs(t))*100)/100}}function Q(a){let t=e=>String(e).padStart(2,"0");return`${a.getFullYear()}-${t(a.getMonth()+1)}-${t(a.getDate())}T${t(a.getHours())}:${t(a.getMinutes())}`}var Z=T`
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
    --hz-ribbon-height: var(--heat-zones-ribbon-height, var(--ha-space-3));

    --hz-border-width: var(--heat-zones-border-width, var(--ha-border-width-sm));
    --hz-focus-width: var(--heat-zones-focus-width, var(--ha-border-width-md));
    --hz-button-radius: var(--heat-zones-button-border-radius, var(--ha-border-radius-pill));
    --hz-icon-button-radius: var(--heat-zones-icon-button-border-radius, var(--ha-border-radius-pill));
    --hz-input-radius: var(--heat-zones-input-border-radius, var(--ha-border-radius-pill));
    --hz-group-radius: var(--heat-zones-group-border-radius, calc(var(--hz-control-height) / 2 + var(--hz-group-padding)));
    --hz-sheet-radius: var(--heat-zones-sheet-border-radius, calc(var(--hz-control-height) / 2 + var(--hz-sheet-padding)));
    --hz-bar-radius: var(--heat-zones-bar-border-radius, var(--ha-border-radius-md));
    --hz-ribbon-radius: var(--heat-zones-ribbon-border-radius, var(--ha-border-radius-pill));

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
    --hz-inset: var(--heat-zones-inset-color, var(--secondary-background-color));
    --hz-past: var(--heat-zones-past-color, color-mix(in srgb, var(--card-background-color) 55%, transparent));
    --hz-switch-off: var(--heat-zones-switch-off-color, var(--disabled-color));
    --hz-switch-knob: var(--heat-zones-switch-knob-color, var(--text-primary-color));

    --hz-glass-color: var(--heat-zones-glass-color, var(--card-background-color));
    --hz-glass-opacity: var(--heat-zones-glass-opacity, 70%);
    --hz-glass-blur: var(--heat-zones-glass-blur, var(--ha-space-4));
    --hz-glass-edge: var(--heat-zones-glass-border-color, var(--divider-color));
    --hz-glass-highlight: var(--heat-zones-glass-highlight-color, color-mix(in srgb, var(--heat-zones-glass-border-color, var(--divider-color)), var(--ha-color-white) 40%));
    --hz-glass-shadow: var(--heat-zones-glass-shadow, var(--ha-box-shadow-s));
    --hz-sheet-shadow: var(--heat-zones-sheet-shadow, var(--ha-box-shadow-m));
    --hz-sheet-opacity: var(--heat-zones-sheet-opacity, 92%);
    --hz-scrim-filter: var(--heat-zones-scrim-filter, var(--ha-dialog-scrim-backdrop-filter));
    --hz-sheet-duration: var(--heat-zones-sheet-duration, var(--ha-animation-duration-normal));
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
    --hz-sheet-fill: color-mix(in srgb, var(--hz-glass-color) var(--hz-sheet-opacity), transparent);
    --hz-press: scale(var(--hz-press-scale));
    --hz-switch-travel: calc(var(--ha-space-12) - var(--ha-space-6) - var(--ha-border-width-md) - var(--ha-border-width-md));

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
      --hz-sheet-fill: var(--hz-glass-color);
      --hz-glass-filter: none;
    }
  }
  @media (prefers-contrast: more) {
    :host {
      --hz-glass-fill: var(--hz-glass-color);
      --hz-sheet-fill: var(--hz-glass-color);
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
  /* A text button: opens a sheet, closes it, or undoes something small. */
  button.link {
    color: var(--hz-accent);
    font-weight: var(--hz-title-font-weight);
    padding: var(--hz-input-padding);
  }
  /* Inside a sheet: an inset panel instead of glass on glass. */
  .inset {
    background: var(--hz-inset);
    border-radius: var(--hz-group-radius);
    padding: var(--hz-sheet-padding);
  }
  button.switch,
  button.switch:hover {
    position: relative;
    flex: none;
    width: var(--ha-space-12);
    height: var(--ha-space-7);
    min-height: 0;
    padding: 0;
    border: 0;
    border-radius: var(--ha-border-radius-pill);
    background: var(--hz-switch-off);
  }
  button.switch::after {
    content: "";
    position: absolute;
    top: var(--ha-border-width-md);
    left: var(--ha-border-width-md);
    width: var(--ha-space-6);
    height: var(--ha-space-6);
    border-radius: var(--ha-border-radius-pill);
    background: var(--hz-switch-knob);
    box-shadow: var(--hz-glass-shadow);
    transition: transform var(--hz-duration);
  }
  button.switch[aria-checked="true"],
  button.switch[aria-checked="true"]:hover {
    background: var(--hz-accent);
  }
  button.switch[aria-checked="true"]::after {
    transform: translateX(var(--hz-switch-travel));
  }
  button:focus-visible {
    outline: var(--hz-focus-width) solid var(--hz-accent);
    outline-offset: var(--hz-border-width);
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
`;function y(...a){return a.filter(Boolean).join(" ")}async function lt(a,t){return(await a.callWS({type:"call_service",domain:"heat_zones",service:"get_schedule",target:{entity_id:t},return_response:!0})).response?.[t]??null}function qt(a,t){return a.states[t]?.attributes.preset_temperatures??{}}function Ft(a,t){return t.startsWith("t:")?S(a,Number(t.slice(2))):C(a,t)}var w=class extends _{constructor(){super(...arguments);this.entity="";this.inset=!1;this.schedule=null;this.draft=null;this.day=null;this.copyTo=[];this.message="";this.loadedFor="";this.stamp=""}updated(){let e=this.hass?.states[this.entity];if(!e)return;let s=e.last_updated;!this.draft&&(this.loadedFor!==this.entity||s!==this.stamp)&&(this.loadedFor=this.entity,this.stamp=s,lt(this.hass,this.entity).then(r=>this.schedule=r,()=>this.schedule=null))}get days(){return this.draft??ot(this.schedule?.weekly??[])}edit(e){this.draft||(this.draft=ot(this.schedule?.weekly??[])),this.day=e,this.copyTo=[],this.message=""}change(e,s){if(!this.draft||!this.day)return;let r=this.draft[this.day].map((i,o)=>o===e?{...i,...s}:i);this.draft={...this.draft,[this.day]:r}}add(){if(!this.draft||!this.day)return;let e=this.draft[this.day],s=e[e.length-1],r=s?`${String(Math.min(23,Number(s.time.slice(0,2))+2)).padStart(2,"0")}:00`:"06:00";this.draft={...this.draft,[this.day]:[...e,{time:r,value:"comfort"}]}}removeBlock(e){!this.draft||!this.day||(this.draft={...this.draft,[this.day]:this.draft[this.day].filter((s,r)=>r!==e)})}toggleCopy(e){this.copyTo=this.copyTo.includes(e)?this.copyTo.filter(s=>s!==e):[...this.copyTo,e]}cancel(){this.draft=null,this.day=null,this.copyTo=[]}async save(){if(!this.draft)return;let e={...this.draft};if(this.day){let s=[...e[this.day]].sort((r,i)=>r.time.localeCompare(i.time));e[this.day]=s;for(let r of this.copyTo)e[r]=s.map(i=>({...i}))}try{await this.hass.callService("heat_zones","set_schedule",{weekly:It(e)},{entity_id:this.entity}),this.message=l(b(this.hass),"saved"),this.draft=null,this.day=null,this.copyTo=[],this.stamp="",this.requestUpdate()}catch(s){this.message=`${l(b(this.hass),"error")}: ${s.message??s}`}}renderBar(e){let s=b(this.hass),r=qt(this.hass,this.entity),i=wt(this.days,e),o=this.day===e;return d`<div
      class="bar ${o?"selected":""}"
      part=${y("day-bar",o&&"selected")}
      @click=${()=>this.edit(e)}
    >
      ${i.map(h=>{let n=nt(h.value,r),{side:c,share:g}=ht(n),m=h.from/1440*100,v=(h.to-h.from)/1440*100,z=v>9?Ft(s,h.value):"";return d`<div
          class="segment ${c}"
          part=${y("segment",c)}
          style="left:${m}%;width:${v}%;--hz-share:${Math.round(g*100)}%"
          title="${Ft(s,h.value)} ${n!==null?S(s,n):""}"
        >${z}</div>`})}
    </div>`}renderDay(){if(!this.draft||!this.day)return u;let e=b(this.hass),s=qt(this.hass,this.entity),r=this.hass.states[this.entity]?.attributes.preset_modes?.filter(o=>o!=="none")??[],i=this.day;return d`<div
      class="blocks ${this.inset?"inset":"glass sheet"}"
      part=${y("blocks",this.inset?"inset":"sheet",!this.inset&&"glass")}
    >
      <h3 part="sheet-title">${l(e,"edit_day")}: ${l(e,`day.${i}`)}</h3>
      ${this.draft[i].map((o,h)=>d`<div class="block" part="block">
          <input type="time" part="input" .value=${o.time} @change=${n=>this.change(h,{time:n.target.value})} />
          <select
            part="input"
            @change=${n=>{let c=n.target.value;this.change(h,{value:c==="t"?`t:${s.comfort??21}`:c})}}
          >
            ${r.map(n=>d`<option value=${n} ?selected=${o.value===n}>${C(e,n)}</option>`)}
            <option value="t" ?selected=${o.value.startsWith("t:")}>${l(e,"temperature")}</option>
          </select>
          ${o.value.startsWith("t:")?d`<input
                type="number"
                part="input"
                min="5"
                max="30"
                step="0.5"
                .value=${String(it(o.value).temperature)}
                @change=${n=>this.change(h,{value:`t:${n.target.value}`})}
              />`:d`<span class="muted">${S(e,s[o.value])}</span>`}
          <button class="icon" part="button icon" @click=${()=>this.removeBlock(h)} title=${l(e,"remove")}>✕</button>
        </div>`)}
      <div class="row"><button part="button" @click=${this.add}>＋ ${l(e,"add_block")}</button></div>
      <div class="row copy">
        <span class="muted">${l(e,"copy_to")}:</span>
        ${A.filter(o=>o!==i).map(o=>{let h=this.copyTo.includes(o);return d`<button class="icon ${h?"active":""}" part=${y("button","icon",h&&"active")} @click=${()=>this.toggleCopy(o)}>
            ${l(e,`day.${o}`)}
          </button>`})}
      </div>
      <div class="row actions">
        <button part="button" @click=${this.cancel}>${l(e,"cancel")}</button>
        <button class="primary" part="button primary" @click=${this.save}>${l(e,"save")}</button>
      </div>
    </div>`}render(){if(!this.hass||!this.hass.states[this.entity])return u;let e=b(this.hass),s=!(this.schedule?.weekly.length??0)&&!this.draft;return d`
      <div class="week" part="week">
        ${A.map(r=>d`<div
              class="day ${this.day===r?"selected":""}"
              part=${y("day-label",this.day===r&&"selected")}
              @click=${()=>this.edit(r)}
            >
              ${l(e,`day.${r}`)}
            </div>
            ${this.renderBar(r)}`)}
        <div class="hours" part="hours"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
      </div>
      ${s?d`<div class="muted spaced" part="message">${l(e,"no_blocks")}</div>`:u}
      ${this.renderDay()}
      ${this.message?d`<div class="muted spaced" part="message">${this.message}</div>`:u}
    `}};w.styles=[Z,T`
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
    `],p([x({attribute:!1})],w.prototype,"hass",2),p([x()],w.prototype,"entity",2),p([x({type:Boolean,reflect:!0})],w.prototype,"inset",2),p([f()],w.prototype,"schedule",2),p([f()],w.prototype,"draft",2),p([f()],w.prototype,"day",2),p([f()],w.prototype,"copyTo",2),p([f()],w.prototype,"message",2),w=p([L("heat-zones-schedule-editor")],w);var $=class extends _{constructor(){super(...arguments);this.entity="";this.inset=!1;this.schedule=null;this.adding=!1;this.from="";this.to="";this.value="away";this.reason="";this.message="";this.loadedFor="";this.stamp=""}updated(){let e=this.hass?.states[this.entity];e&&(this.loadedFor!==this.entity||e.last_updated!==this.stamp)&&(this.loadedFor=this.entity,this.stamp=e.last_updated,lt(this.hass,this.entity).then(s=>this.schedule=s,()=>this.schedule=null))}open(){let e=new Date;this.from=Q(e),this.to=Q(new Date(e.getTime()+3*3600*1e3)),this.adding=!0,this.message=""}async add(){let e={start:new Date(this.from).toISOString(),end:new Date(this.to).toISOString(),reason:this.reason,source:"card",...it(this.value)};try{await this.hass.callService("heat_zones","add_override",e,{entity_id:this.entity}),this.adding=!1,this.reason="",this.stamp=""}catch(s){this.message=`${l(b(this.hass),"error")}: ${s.message??s}`}}removeOverride(e){this.hass.callService("heat_zones","remove_override",{override_id:e},{entity_id:this.entity})}render(){if(!this.hass||!this.hass.states[this.entity])return u;let e=b(this.hass),s=this.schedule?.overrides??[],r=this.hass.states[this.entity].attributes.preset_modes?.filter(i=>i!=="none")??[];return d`
      ${s.length?d`<ul part="list">
            ${s.map(i=>d`<li class="row" part="override">
                <span class="grow">
                  <strong>${i.preset_mode?C(e,i.preset_mode):S(e,i.temperature)}</strong>
                  ${i.reason?d`<div>${i.reason}</div>`:u}
                  <div class="muted">${X(e,i.start)} – ${X(e,i.end)}${i.source?` (${i.source})`:""}</div>
                </span>
                <button
                  class="icon ${this.inset?"":"glass"}"
                  part=${y("button","icon",!this.inset&&"glass")}
                  @click=${()=>this.removeOverride(i.override_id)}
                  title=${l(e,"remove")}
                >
                  ✕
                </button>
              </li>`)}
          </ul>`:d`<div class="muted" part="message">${l(e,"no_overrides")}</div>`}
      ${this.adding?d`<div
            class="form ${this.inset?"inset":"glass sheet"}"
            part=${y("form",this.inset?"inset":"sheet",!this.inset&&"glass")}
          >
            <span>${l(e,"from")}</span>
            <input type="datetime-local" part="input" .value=${this.from} @change=${i=>this.from=i.target.value} />
            <span>${l(e,"to")}</span>
            <input type="datetime-local" part="input" .value=${this.to} @change=${i=>this.to=i.target.value} />
            <span></span>
            <div class="row">
              <select part="input" @change=${i=>this.value=i.target.value}>
                ${r.map(i=>d`<option value=${i} ?selected=${this.value===i}>${C(e,i)}</option>`)}
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
                  />`:u}
            </div>
            <span>${l(e,"reason")}</span>
            <input part="input" .value=${this.reason} maxlength="200" @input=${i=>this.reason=i.target.value} />
            <span></span>
            <div class="row actions">
              <button part="button" @click=${()=>this.adding=!1}>${l(e,"cancel")}</button>
              <button class="primary" part="button primary" @click=${this.add}>${l(e,"save")}</button>
            </div>
          </div>`:d`<div class="row spaced">
            <button class=${this.inset?"":"glass"} part=${y("button",!this.inset&&"glass")} @click=${this.open}>
              ＋ ${l(e,"add_override")}
            </button>
          </div>`}
      ${this.message?d`<div class="muted spaced" part="message">${this.message}</div>`:u}
    `}};$.styles=[Z,T`
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
    `],p([x({attribute:!1})],$.prototype,"hass",2),p([x()],$.prototype,"entity",2),p([x({type:Boolean,reflect:!0})],$.prototype,"inset",2),p([f()],$.prototype,"schedule",2),p([f()],$.prototype,"adding",2),p([f()],$.prototype,"from",2),p([f()],$.prototype,"to",2),p([f()],$.prototype,"value",2),p([f()],$.prototype,"reason",2),p([f()],$.prototype,"message",2),$=p([L("heat-zones-overrides")],$);function me(a){return a?.attributes?.homeai_schedule?.domain==="heat_zones"}var ve="week, day-label, day-bar, segment, hours, blocks, sheet, sheet-title, block, input, button, message, selected, cold, warm, unknown, active, primary, icon, glass, inset",fe="list, override, form, sheet, input, button, message, primary, icon, glass, inset",k=class extends _{constructor(){super(...arguments);this.sheet=null;this.holdOpen=!1;this.holdUntil="";this.schedule=null;this.loadedFor="";this.stamp=""}setConfig(e){if(!e.entity)throw new Error("entity is required");this.config={show_controls:!0,show_schedule:!0,show_overrides:!0,...e}}getCardSize(){return 5}static getStubConfig(e){return{type:"custom:heat-zones-card",entity:Object.values(e.states).find(r=>r.entity_id.startsWith("climate.")&&me(r))?.entity_id??""}}static getConfigElement(){return document.createElement("heat-zones-card-editor")}get st(){return this.hass?.states[this.config.entity]}updated(){let e=this.st;!e||!this.config.show_schedule||(this.loadedFor!==this.config.entity||e.last_updated!==this.stamp)&&(this.loadedFor=this.config.entity,this.stamp=e.last_updated,lt(this.hass,this.config.entity).then(s=>this.schedule=s,()=>this.schedule=null))}sibling(e,s){let r=this.hass.entities?.[this.config.entity];if(r?.device_id){let o=Object.values(this.hass.entities??{}).find(h=>h.device_id===r.device_id&&h.platform==="heat_zones"&&h.translation_key===s&&h.entity_id.startsWith(`${e}.`));if(o)return o.entity_id}let i=`${e}.${this.config.entity.split(".")[1]}_${s}`;return this.hass.states[i]?i:void 0}climate(e,s={}){this.hass.callService("climate",e,s,{entity_id:this.config.entity})}step(e){let s=this.st.attributes,r=Math.round(((s.temperature??20)+e)*2)/2;this.climate("set_temperature",{temperature:Math.max(s.min_temp??5,Math.min(s.max_temp??30,r))})}hold(e){this.hass.callService("heat_zones","hold",e,{entity_id:this.config.entity}),this.holdOpen=!1}resume(){this.hass.callService("heat_zones","resume",{},{entity_id:this.config.entity})}async open(e){this.sheet=e,await this.updateComplete,this.dialog&&!this.dialog.open&&this.dialog.showModal()}close(){this.dialog?.close()}closed(){this.sheet=null,this.holdOpen=!1}switchButton(e,s,r){return d`<button
      class="switch"
      part=${y("switch",e&&"on")}
      role="switch"
      aria-checked=${e?"true":"false"}
      aria-label=${s}
      @click=${r}
    ></button>`}renderNow(e){let s=b(this.hass),r=e.attributes,i=r.hvac_action==="heating",o=!!r.window_pause,h=e.state==="off",n=this.hass.user?.is_admin??!0,c=(r.homeai_signals??[]).filter(g=>n||g.need!=="admin");return d`<div class="top" part="header">
        <h3 class="grow" part="title">${this.config.title??r.friendly_name}</h3>
        <button
          class="icon glass"
          part="button icon glass"
          aria-label=${l(s,"settings")}
          title=${l(s,"settings")}
          @click=${()=>this.open("settings")}
        >
          ⋯
        </button>
      </div>
      <div class="now-row">
        <div class="now ${i?"heating":""}" part=${y("temperature",i&&"heating")}>
          ${S(s,r.current_temperature)}
        </div>
        ${this.config.show_controls?d`<div class="target glass group" part="target group glass">
              <button class="icon" part="button icon" @click=${()=>this.step(-.5)} ?disabled=${h}>−</button>
              <strong part="target-value">${h?l(s,"off"):S(s,r.temperature)}</strong>
              <button class="icon" part="button icon" @click=${()=>this.step(.5)} ?disabled=${h}>＋</button>
            </div>`:u}
      </div>
      <div>
        <div class="row">
          <span class="why muted ${o?"window":""}" part=${y("reason",o&&"window")}>${r.reason??""}</span>
          ${r.source==="hold"?d`<button class="link" part="button link" @click=${this.resume}>${l(s,"resume")}</button>`:u}
        </div>
        ${c.map(g=>d`<div class="problem" part="problem">${g.title}</div>`)}
      </div>`}renderToday(e){let s=b(this.hass),r=e.attributes,i=this.schedule,o=new Date,h=i?Wt(i,o):[],n=(o.getHours()*60+o.getMinutes())/1440*100,c=r.preset_temperatures??{},g=r.next_change,m=r.schedule_enabled?h.length?l(s,"today"):l(s,"schedule_empty"):l(s,"schedule_paused");return d`<div class="stack">
      <div class="today-head">
        <span class="muted">${m}</span>
        <button class="link" part="button link" @click=${()=>this.open("schedule")}>${l(s,"schedule")}</button>
      </div>
      ${h.length?d`<div
            class="ribbon"
            part="today"
            role="button"
            tabindex="0"
            aria-label=${l(s,"schedule")}
            @click=${()=>this.open("schedule")}
            @keydown=${v=>(v.key==="Enter"||v.key===" ")&&this.open("schedule")}
          >
            <div class="clip">
              ${h.map(v=>{let z=nt(v.value,c),{side:P,share:Vt}=ht(z),Kt=`${v.value.startsWith("t:")?"":C(s,v.value)} ${S(s,z)}`;return d`<div
                  class="segment ${P}"
                  part=${y("segment",P)}
                  style="left:${v.from/1440*100}%;width:${(v.to-v.from)/1440*100}%;--hz-share:${Math.round(Vt*100)}%"
                  title=${Kt.trim()}
                ></div>`})}
              <div class="past" part="past" style="width:${n}%"></div>
            </div>
            <div class="marker" part="now" style="left:${n}%"></div>
          </div>`:u}
      ${g&&r.schedule_enabled?d`<div class="muted" part="next">
            ${l(s,"from_time",{time:X(s,g.at),what:`${g.preset_mode?`${C(s,g.preset_mode)} `:""}${S(s,g.temperature)}`})}
          </div>`:u}
    </div>`}renderPresets(e){let s=b(this.hass),r=e.attributes;if(e.state==="off")return d`<div class="row">
        <button class="primary" part="button primary" @click=${()=>this.climate("turn_on")}>${l(s,"turn_on")}</button>
      </div>`;let i=(r.preset_modes??[]).filter(o=>o!=="none");return i.length?d`<div class="row">
      <div class="glass group" part="controls group glass">
        ${i.map(o=>{let h=r.preset_mode===o;return d`<button
            class=${h?"active":""}
            part=${y("button",h&&"active")}
            aria-pressed=${h?"true":"false"}
            @click=${()=>this.climate("set_preset_mode",{preset_mode:o})}
          >
            ${C(s,o)}
          </button>`})}
      </div>
    </div>`:u}renderScheduleSheet(){let e=b(this.hass),s=this.sibling("switch","schedule"),r=s?this.hass.states[s]?.state==="on":!!this.st?.attributes.schedule_enabled;return d`<div class="sheet-head">
        <h3 class="grow" part="sheet-title">${l(e,"schedule")}</h3>
        ${s?this.switchButton(r,l(e,"schedule"),()=>this.hass.callService("switch",r?"turn_off":"turn_on",{},{entity_id:s})):u}
        <button class="link" part="button link" @click=${this.close}>${l(e,"done")}</button>
      </div>
      <div class="body">
      ${r?u:d`<div class="muted" part="message">${l(e,"schedule_off")}</div>`}
      <heat-zones-schedule-editor inset exportparts=${ve} .hass=${this.hass} .entity=${this.config.entity}></heat-zones-schedule-editor>
      ${this.config.show_overrides?d`<div class="stack">
            <h3 part="section-title">${l(e,"overrides")}</h3>
            <heat-zones-overrides inset exportparts=${fe} .hass=${this.hass} .entity=${this.config.entity}></heat-zones-overrides>
          </div>`:u}
      </div>`}renderSettingsSheet(e){let s=b(this.hass),r=e.state!=="off",i=this.sibling("select","measure_at"),o=i?this.hass.states[i]:void 0,h=o?.attributes.options??[],n=c=>c==="average"||c==="coldest"?l(s,`measure.${c}`):c;return d`<div class="sheet-head">
        <h3 class="grow" part="sheet-title">${l(s,"settings")}</h3>
        <button class="link" part="button link" @click=${this.close}>${l(s,"done")}</button>
      </div>
      <div class="body">
      <div class="inset" part="settings inset">
        <div class="setting" part="setting">
          <span class="grow">${l(s,"heating")}</span>
          ${this.switchButton(r,l(s,"heating"),()=>this.climate(r?"turn_off":"turn_on"))}
        </div>
        ${o&&h.length>1?d`<div class="setting" part="setting">
              <span class="grow">${l(s,"measure_at")}</span>
              <select
                part="input"
                aria-label=${l(s,"measure_at")}
                @change=${c=>this.hass.callService("select","select_option",{option:c.target.value},{entity_id:i})}
              >
                ${h.map(c=>d`<option value=${c} ?selected=${o.state===c}>${n(c)}</option>`)}
              </select>
            </div>`:u}
      </div>
      ${e.attributes.schedule_enabled&&r?d`<div class="stack">
            <h3 part="section-title">${l(s,"current")}</h3>
            <div class="muted">${l(s,"hold_help")}</div>
            <div class="row">
              ${e.attributes.source==="hold"?d`<button class="glass" part="button glass" @click=${this.resume}>${l(s,"resume")}</button>`:u}
              <button class="glass" part="button glass" @click=${()=>this.hold({permanent:!0})}>${l(s,"hold_permanent")}</button>
              ${this.holdOpen?d`<input
                      type="datetime-local"
                      part="input"
                      aria-label=${l(s,"hold_until")}
                      .value=${this.holdUntil}
                      @change=${c=>this.holdUntil=c.target.value}
                    />
                    <button class="primary" part="button primary" @click=${()=>this.hold({until:new Date(this.holdUntil).toISOString()})}>
                      ${l(s,"hold")}
                    </button>`:d`<button
                    class="glass"
                    part="button glass"
                    @click=${()=>{this.holdUntil=Q(new Date(Date.now()+2*3600*1e3)),this.holdOpen=!0}}
                  >
                    ${l(s,"hold_until")}…
                  </button>`}
            </div>
          </div>`:u}
      </div>`}render(){if(!this.hass||!this.config)return u;let e=this.st,s=b(this.hass);return e?d`<ha-card part="card">
      ${this.renderNow(e)}
      ${this.config.show_schedule||this.config.show_overrides?this.renderToday(e):u}
      ${this.config.show_controls?this.renderPresets(e):u}
      <dialog
        part="dialog"
        aria-label=${this.sheet?l(s,this.sheet):""}
        @close=${this.closed}
        @click=${r=>r.target===r.currentTarget&&this.close()}
      >
        ${this.sheet?d`<div class="panel glass" part="sheet glass">
              ${this.sheet==="schedule"?this.renderScheduleSheet():this.renderSettingsSheet(e)}
            </div>`:u}
      </dialog>
    </ha-card>`:d`<ha-card part="card"><div class="muted" part="message">${this.config.entity}: ${l(s,"unavailable")}</div></ha-card>`}};k.styles=[Z,T`
      ha-card {
        padding: var(--hz-padding);
        display: flex;
        flex-direction: column;
        gap: var(--hz-gap);
      }
      .top {
        display: flex;
        align-items: center;
        gap: var(--hz-gap);
      }
      .now-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--hz-gap);
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
      .why.window {
        color: var(--hz-window);
      }
      .problem {
        color: var(--hz-problem);
        font-size: var(--hz-small-font-size);
      }
      .today-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--hz-gap);
      }
      .ribbon {
        position: relative;
        height: var(--hz-ribbon-height);
        border-radius: var(--hz-ribbon-radius);
        background: var(--hz-track);
        cursor: pointer;
      }
      .ribbon .clip {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        overflow: hidden;
      }
      .ribbon .segment {
        position: absolute;
        top: 0;
        bottom: 0;
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
      .ribbon .past {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        background: var(--hz-past);
      }
      .ribbon .marker {
        position: absolute;
        top: calc(var(--hz-small-gap) * -1);
        bottom: calc(var(--hz-small-gap) * -1);
        width: var(--hz-focus-width);
        border-radius: var(--hz-ribbon-radius);
        background: var(--hz-text);
        translate: calc(var(--hz-focus-width) / -2);
      }
      .ribbon:focus-visible {
        outline: var(--hz-focus-width) solid var(--hz-accent);
        outline-offset: var(--hz-focus-width);
      }

      dialog {
        margin: 0;
        padding: 0;
        border: 0;
        width: 100%;
        height: 100%;
        max-width: none;
        max-height: none;
        background: transparent;
        color: var(--hz-text);
      }
      dialog[open] {
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }
      /* The page behind is dimmed the way Home Assistant dims it for its own dialogs; the sheet's glass blurs it. */
      dialog::backdrop {
        background: transparent;
        -webkit-backdrop-filter: var(--hz-scrim-filter);
        backdrop-filter: var(--hz-scrim-filter);
      }
      .panel {
        width: 100%;
        max-height: 92dvh;
        overflow: hidden;
        box-sizing: border-box;
        border-radius: var(--hz-sheet-radius) var(--hz-sheet-radius) 0 0;
        background: var(--hz-sheet-fill);
        animation: hz-rise var(--hz-sheet-duration) ease-out;
        display: flex;
        flex-direction: column;
      }
      .body {
        overflow: auto;
        overscroll-behavior: contain;
        padding: 0 var(--hz-padding) calc(var(--hz-padding) + env(safe-area-inset-bottom));
        display: flex;
        flex-direction: column;
        gap: var(--hz-section-gap);
      }
      @media (min-width: 600px) {
        dialog[open] {
          align-items: center;
        }
        .panel {
          width: min(100%, 72ch);
          border-radius: var(--hz-sheet-radius);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .panel {
          animation: none;
        }
      }
      @keyframes hz-rise {
        from {
          transform: translateY(var(--ha-space-6));
          opacity: 0;
        }
      }
      .sheet-head {
        display: flex;
        align-items: center;
        gap: var(--hz-gap);
        padding: var(--hz-sheet-padding) var(--hz-padding);
      }
      .setting {
        display: flex;
        align-items: center;
        gap: var(--hz-gap);
        min-height: var(--hz-control-height);
      }
      .setting + .setting {
        border-top: var(--hz-border-width) solid var(--hz-line);
        padding-top: var(--hz-small-gap);
      }
      .setting select {
        max-width: 60%;
      }
      .stack {
        display: flex;
        flex-direction: column;
        gap: var(--hz-gap);
      }
    `],p([x({attribute:!1})],k.prototype,"hass",2),p([f()],k.prototype,"config",2),p([f()],k.prototype,"sheet",2),p([f()],k.prototype,"holdOpen",2),p([f()],k.prototype,"holdUntil",2),p([f()],k.prototype,"schedule",2),p([Lt("dialog")],k.prototype,"dialog",2),k=p([L("heat-zones-card")],k);var H=class extends _{setConfig(t){this.config=t}changed(t){this.config=t.detail.value,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this.config)return u;let t=b(this.hass),e=[{name:"entity",required:!0,selector:{entity:{domain:"climate",integration:"heat_zones"}}},{name:"title",selector:{text:{}}},{name:"show_controls",selector:{boolean:{}}},{name:"show_schedule",selector:{boolean:{}}},{name:"show_overrides",selector:{boolean:{}}}],s={entity:l(t,"pick_entity"),show_controls:l(t,"show_controls"),show_schedule:l(t,"show_schedule"),show_overrides:l(t,"show_overrides")};return d`<ha-form
      .hass=${this.hass}
      .data=${{show_controls:!0,show_schedule:!0,show_overrides:!0,...this.config}}
      .schema=${e}
      .computeLabel=${r=>s[r.name]??r.name}
      @value-changed=${this.changed}
    ></ha-form>`}};p([x({attribute:!1})],H.prototype,"hass",2),p([f()],H.prototype,"config",2),H=p([L("heat-zones-card-editor")],H);window.customCards=window.customCards??[];window.customCards.some(a=>a.type==="heat-zones-card")||window.customCards.push({type:"heat-zones-card",name:"Heat Zones",description:"A heat zone with its weekly schedule, holds and overrides.",preview:!1});
