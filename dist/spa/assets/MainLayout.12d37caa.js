import{p as O,q as d,h as x,s as F,u as et,x as tt,y as at,z as nt,A as ot,B as p,C as ee,D as V,E as Y,G as T,H as te,I as lt,Q as Z,J as R,K as rt,L as X,M as Ce,N as Ve,O as xe,P as it,R as K,S as se,T as _e,U as ce,V as be,W as de,X as ut,Y as st,Z as ct,_ as Oe,$ as dt,a0 as Qe,a1 as ft,a2 as vt,a3 as ht,a4 as Se,a5 as G,a6 as Me,j as mt,a7 as ke,a8 as gt,a9 as Ee,aa as bt,ab as He,ac as De,ad as yt,ae as pt,af as wt,ag as qt,ah as fe,ai as J,aj as Ct,ak as xt,al as _t,f as St,o as ve,b as Te,i as P,c as B,am as he,a as $e,an as kt,ao as Tt,ap as $t,aq as Bt}from"./index.d69f777b.js";var Be=O({name:"QToolbarTitle",props:{shrink:Boolean},setup(t,{slots:u}){const o=d(()=>"q-toolbar__title ellipsis"+(t.shrink===!0?" col-shrink":""));return()=>x("div",{class:o.value},F(u.default))}}),zt=O({name:"QRouteTab",props:{...et,...tt},emits:at,setup(t,{slots:u,emit:o}){const r=nt({useDisableForRouterLinkProps:!1}),{renderTab:e,$tabs:a}=ot(t,u,o,{exact:d(()=>t.exact),...r});return p(()=>`${t.name} | ${t.exact} | ${(r.resolvedLink.value||{}).href}`,()=>{a.verifyRouteModel()}),()=>e(r.linkTag.value,r.linkAttrs.value)}}),ze=O({name:"QToolbar",props:{inset:Boolean},setup(t,{slots:u}){const o=d(()=>"q-toolbar row no-wrap items-center"+(t.inset===!0?" q-toolbar--inset":""));return()=>x("div",{class:o.value,role:"toolbar"},F(u.default))}}),Lt=O({name:"QHeader",props:{modelValue:{type:Boolean,default:!0},reveal:Boolean,revealOffset:{type:Number,default:250},bordered:Boolean,elevated:Boolean,heightHint:{type:[String,Number],default:50}},emits:["reveal","focusin"],setup(t,{slots:u,emit:o}){const{proxy:{$q:r}}=R(),e=ee(Y,V);if(e===V)return console.error("QHeader needs to be child of QLayout"),V;const a=T(parseInt(t.heightHint,10)),i=T(!0),v=d(()=>t.reveal===!0||e.view.value.indexOf("H")>-1||r.platform.is.ios&&e.isContainer.value===!0),m=d(()=>{if(t.modelValue!==!0)return 0;if(v.value===!0)return i.value===!0?a.value:0;const f=a.value-e.scroll.value.position;return f>0?f:0}),c=d(()=>t.modelValue!==!0||v.value===!0&&i.value!==!0),l=d(()=>t.modelValue===!0&&c.value===!0&&t.reveal===!0),_=d(()=>"q-header q-layout__section--marginal "+(v.value===!0?"fixed":"absolute")+"-top"+(t.bordered===!0?" q-header--bordered":"")+(c.value===!0?" q-header--hidden":"")+(t.modelValue!==!0?" q-layout--prevent-focus":"")),q=d(()=>{const f=e.rows.value.top,$={};return f[0]==="l"&&e.left.space===!0&&($[r.lang.rtl===!0?"right":"left"]=`${e.left.size}px`),f[2]==="r"&&e.right.space===!0&&($[r.lang.rtl===!0?"left":"right"]=`${e.right.size}px`),$});function h(f,$){e.update("header",f,$)}function g(f,$){f.value!==$&&(f.value=$)}function k({height:f}){g(a,f),h("size",f)}function S(f){l.value===!0&&g(i,!0),o("focusin",f)}p(()=>t.modelValue,f=>{h("space",f),g(i,!0),e.animate()}),p(m,f=>{h("offset",f)}),p(()=>t.reveal,f=>{f===!1&&g(i,t.modelValue)}),p(i,f=>{e.animate(),o("reveal",f)}),p(e.scroll,f=>{t.reveal===!0&&g(i,f.direction==="up"||f.position<=t.revealOffset||f.position-f.inflectionPoint<100)});const w={};return e.instances.header=w,t.modelValue===!0&&h("size",a.value),h("space",t.modelValue),h("offset",m.value),te(()=>{e.instances.header===w&&(e.instances.header=void 0,h("size",0),h("offset",0),h("space",!1))}),()=>{const f=lt(u.default,[]);return t.elevated===!0&&f.push(x("div",{class:"q-layout__shadow absolute-full overflow-hidden no-pointer-events"})),f.push(x(Z,{debounce:0,onResize:k})),x("header",{class:_.value,style:q.value,onFocusin:S},f)}}});function me(t,u,o){const r=be(t);let e,a=r.left-u.event.x,i=r.top-u.event.y,v=Math.abs(a),m=Math.abs(i);const c=u.direction;c.horizontal===!0&&c.vertical!==!0?e=a<0?"left":"right":c.horizontal!==!0&&c.vertical===!0?e=i<0?"up":"down":c.up===!0&&i<0?(e="up",v>m&&(c.left===!0&&a<0?e="left":c.right===!0&&a>0&&(e="right"))):c.down===!0&&i>0?(e="down",v>m&&(c.left===!0&&a<0?e="left":c.right===!0&&a>0&&(e="right"))):c.left===!0&&a<0?(e="left",v<m&&(c.up===!0&&i<0?e="up":c.down===!0&&i>0&&(e="down"))):c.right===!0&&a>0&&(e="right",v<m&&(c.up===!0&&i<0?e="up":c.down===!0&&i>0&&(e="down")));let l=!1;if(e===void 0&&o===!1){if(u.event.isFirst===!0||u.event.lastDir===void 0)return{};e=u.event.lastDir,l=!0,e==="left"||e==="right"?(r.left-=a,v=0,a=0):(r.top-=i,m=0,i=0)}return{synthetic:l,payload:{evt:t,touch:u.event.mouse!==!0,mouse:u.event.mouse===!0,position:r,direction:e,isFirst:u.event.isFirst,isFinal:o===!0,duration:Date.now()-u.event.time,distance:{x:v,y:m},offset:{x:a,y:i},delta:{x:r.left-u.event.lastX,y:r.top-u.event.lastY}}}}let Pt=0;var ge=rt({name:"touch-pan",beforeMount(t,{value:u,modifiers:o}){if(o.mouse!==!0&&X.has.touch!==!0)return;function r(a,i){o.mouse===!0&&i===!0?ut(a):(o.stop===!0&&ce(a),o.prevent===!0&&_e(a))}const e={uid:"qvtp_"+Pt++,handler:u,modifiers:o,direction:Ce(o),noop:Ve,mouseStart(a){xe(a,e)&&it(a)&&(K(e,"temp",[[document,"mousemove","move","notPassiveCapture"],[document,"mouseup","end","passiveCapture"]]),e.start(a,!0))},touchStart(a){if(xe(a,e)){const i=a.target;K(e,"temp",[[i,"touchmove","move","notPassiveCapture"],[i,"touchcancel","end","passiveCapture"],[i,"touchend","end","passiveCapture"]]),e.start(a)}},start(a,i){if(X.is.firefox===!0&&se(t,!0),e.lastEvt=a,i===!0||o.stop===!0){if(e.direction.all!==!0&&(i!==!0||e.modifiers.mouseAllDir!==!0&&e.modifiers.mousealldir!==!0)){const c=a.type.indexOf("mouse")>-1?new MouseEvent(a.type,a):new TouchEvent(a.type,a);a.defaultPrevented===!0&&_e(c),a.cancelBubble===!0&&ce(c),Object.assign(c,{qKeyEvent:a.qKeyEvent,qClickOutside:a.qClickOutside,qAnchorHandled:a.qAnchorHandled,qClonedBy:a.qClonedBy===void 0?[e.uid]:a.qClonedBy.concat(e.uid)}),e.initialEvent={target:a.target,event:c}}ce(a)}const{left:v,top:m}=be(a);e.event={x:v,y:m,time:Date.now(),mouse:i===!0,detected:!1,isFirst:!0,isFinal:!1,lastX:v,lastY:m}},move(a){if(e.event===void 0)return;const i=be(a),v=i.left-e.event.x,m=i.top-e.event.y;if(v===0&&m===0)return;e.lastEvt=a;const c=e.event.mouse===!0,l=()=>{r(a,c);let h;o.preserveCursor!==!0&&o.preservecursor!==!0&&(h=document.documentElement.style.cursor||"",document.documentElement.style.cursor="grabbing"),c===!0&&document.body.classList.add("no-pointer-events--children"),document.body.classList.add("non-selectable"),st(),e.styleCleanup=g=>{if(e.styleCleanup=void 0,h!==void 0&&(document.documentElement.style.cursor=h),document.body.classList.remove("non-selectable"),c===!0){const k=()=>{document.body.classList.remove("no-pointer-events--children")};g!==void 0?setTimeout(()=>{k(),g()},50):k()}else g!==void 0&&g()}};if(e.event.detected===!0){e.event.isFirst!==!0&&r(a,e.event.mouse);const{payload:h,synthetic:g}=me(a,e,!1);h!==void 0&&(e.handler(h)===!1?e.end(a):(e.styleCleanup===void 0&&e.event.isFirst===!0&&l(),e.event.lastX=h.position.left,e.event.lastY=h.position.top,e.event.lastDir=g===!0?void 0:h.direction,e.event.isFirst=!1));return}if(e.direction.all===!0||c===!0&&(e.modifiers.mouseAllDir===!0||e.modifiers.mousealldir===!0)){l(),e.event.detected=!0,e.move(a);return}const _=Math.abs(v),q=Math.abs(m);_!==q&&(e.direction.horizontal===!0&&_>q||e.direction.vertical===!0&&_<q||e.direction.up===!0&&_<q&&m<0||e.direction.down===!0&&_<q&&m>0||e.direction.left===!0&&_>q&&v<0||e.direction.right===!0&&_>q&&v>0?(e.event.detected=!0,e.move(a)):e.end(a,!0))},end(a,i){if(e.event!==void 0){if(de(e,"temp"),X.is.firefox===!0&&se(t,!1),i===!0)e.styleCleanup!==void 0&&e.styleCleanup(),e.event.detected!==!0&&e.initialEvent!==void 0&&e.initialEvent.target.dispatchEvent(e.initialEvent.event);else if(e.event.detected===!0){e.event.isFirst===!0&&e.handler(me(a===void 0?e.lastEvt:a,e).payload);const{payload:v}=me(a===void 0?e.lastEvt:a,e,!0),m=()=>{e.handler(v)};e.styleCleanup!==void 0?e.styleCleanup(m):m()}e.event=void 0,e.initialEvent=void 0,e.lastEvt=void 0}}};if(t.__qtouchpan=e,o.mouse===!0){const a=o.mouseCapture===!0||o.mousecapture===!0?"Capture":"";K(e,"main",[[t,"mousedown","mouseStart",`passive${a}`]])}X.has.touch===!0&&K(e,"main",[[t,"touchstart","touchStart",`passive${o.capture===!0?"Capture":""}`],[t,"touchmove","noop","notPassiveCapture"]])},updated(t,u){const o=t.__qtouchpan;o!==void 0&&(u.oldValue!==u.value&&(typeof value!="function"&&o.end(),o.handler=u.value),o.direction=Ce(u.modifiers))},beforeUnmount(t){const u=t.__qtouchpan;u!==void 0&&(u.event!==void 0&&u.end(),de(u,"main"),de(u,"temp"),X.is.firefox===!0&&se(t,!1),u.styleCleanup!==void 0&&u.styleCleanup(),delete t.__qtouchpan)}});const Le=150;var Vt=O({name:"QDrawer",inheritAttrs:!1,props:{...ct,...Oe,side:{type:String,default:"left",validator:t=>["left","right"].includes(t)},width:{type:Number,default:300},mini:Boolean,miniToOverlay:Boolean,miniWidth:{type:Number,default:57},breakpoint:{type:Number,default:1023},showIfAbove:Boolean,behavior:{type:String,validator:t=>["default","desktop","mobile"].includes(t),default:"default"},bordered:Boolean,elevated:Boolean,overlay:Boolean,persistent:Boolean,noSwipeOpen:Boolean,noSwipeClose:Boolean,noSwipeBackdrop:Boolean},emits:[...dt,"onLayout","miniState"],setup(t,{slots:u,emit:o,attrs:r}){const e=R(),{proxy:{$q:a}}=e,i=Qe(t,a),{preventBodyScroll:v}=gt(),{registerTimeout:m,removeTimeout:c}=ft(),l=ee(Y,V);if(l===V)return console.error("QDrawer needs to be child of QLayout"),V;let _,q=null,h;const g=T(t.behavior==="mobile"||t.behavior!=="desktop"&&l.totalWidth.value<=t.breakpoint),k=d(()=>t.mini===!0&&g.value!==!0),S=d(()=>k.value===!0?t.miniWidth:t.width),w=T(t.showIfAbove===!0&&g.value===!1?!0:t.modelValue===!0),f=d(()=>t.persistent!==!0&&(g.value===!0||Fe.value===!0));function $(n,y){if(Q(),n!==!1&&l.animate(),L(0),g.value===!0){const z=l.instances[j.value];z!==void 0&&z.belowBreakpoint===!0&&z.hide(!1),E(1),l.isContainer.value!==!0&&v(!0)}else E(0),n!==!1&&re(!1);m(()=>{n!==!1&&re(!0),y!==!0&&o("show",n)},Le)}function b(n,y){N(),n!==!1&&l.animate(),E(0),L(A.value*S.value),ie(),y!==!0?m(()=>{o("hide",n)},Le):c()}const{show:s,hide:C}=vt({showing:w,hideOnRouteChange:f,handleShow:$,handleHide:b}),{addToHistory:Q,removeFromHistory:N}=ht(w,C,f),D={belowBreakpoint:g,hide:C},M=d(()=>t.side==="right"),A=d(()=>(a.lang.rtl===!0?-1:1)*(M.value===!0?1:-1)),ye=T(0),W=T(!1),ae=T(!1),pe=T(S.value*A.value),j=d(()=>M.value===!0?"left":"right"),ne=d(()=>w.value===!0&&g.value===!1&&t.overlay===!1?t.miniToOverlay===!0?t.miniWidth:S.value:0),oe=d(()=>t.overlay===!0||t.miniToOverlay===!0||l.view.value.indexOf(M.value?"R":"L")>-1||a.platform.is.ios===!0&&l.isContainer.value===!0),I=d(()=>t.overlay===!1&&w.value===!0&&g.value===!1),Fe=d(()=>t.overlay===!0&&w.value===!0&&g.value===!1),Re=d(()=>"fullscreen q-drawer__backdrop"+(w.value===!1&&W.value===!1?" hidden":"")),Ae=d(()=>({backgroundColor:`rgba(0,0,0,${ye.value*.4})`})),we=d(()=>M.value===!0?l.rows.value.top[2]==="r":l.rows.value.top[0]==="l"),We=d(()=>M.value===!0?l.rows.value.bottom[2]==="r":l.rows.value.bottom[0]==="l"),Ne=d(()=>{const n={};return l.header.space===!0&&we.value===!1&&(oe.value===!0?n.top=`${l.header.offset}px`:l.header.space===!0&&(n.top=`${l.header.size}px`)),l.footer.space===!0&&We.value===!1&&(oe.value===!0?n.bottom=`${l.footer.offset}px`:l.footer.space===!0&&(n.bottom=`${l.footer.size}px`)),n}),Ie=d(()=>{const n={width:`${S.value}px`,transform:`translateX(${pe.value}px)`};return g.value===!0?n:Object.assign(n,Ne.value)}),Xe=d(()=>"q-drawer__content fit "+(l.isContainer.value!==!0?"scroll":"overflow-auto")),Ye=d(()=>`q-drawer q-drawer--${t.side}`+(ae.value===!0?" q-drawer--mini-animate":"")+(t.bordered===!0?" q-drawer--bordered":"")+(i.value===!0?" q-drawer--dark q-dark":"")+(W.value===!0?" no-transition":w.value===!0?"":" q-layout--prevent-focus")+(g.value===!0?" fixed q-drawer--on-top q-drawer--mobile q-drawer--top-padding":` q-drawer--${k.value===!0?"mini":"standard"}`+(oe.value===!0||I.value!==!0?" fixed":"")+(t.overlay===!0||t.miniToOverlay===!0?" q-drawer--on-top":"")+(we.value===!0?" q-drawer--top-padding":""))),je=d(()=>{const n=a.lang.rtl===!0?t.side:j.value;return[[ge,Je,void 0,{[n]:!0,mouse:!0}]]}),Ue=d(()=>{const n=a.lang.rtl===!0?j.value:t.side;return[[ge,qe,void 0,{[n]:!0,mouse:!0}]]}),Ke=d(()=>{const n=a.lang.rtl===!0?j.value:t.side;return[[ge,qe,void 0,{[n]:!0,mouse:!0,mouseAllDir:!0}]]});function le(){Ze(g,t.behavior==="mobile"||t.behavior!=="desktop"&&l.totalWidth.value<=t.breakpoint)}p(g,n=>{n===!0?(_=w.value,w.value===!0&&C(!1)):t.overlay===!1&&t.behavior!=="mobile"&&_!==!1&&(w.value===!0?(L(0),E(0),ie()):s(!1))}),p(()=>t.side,(n,y)=>{l.instances[y]===D&&(l.instances[y]=void 0,l[y].space=!1,l[y].offset=0),l.instances[n]=D,l[n].size=S.value,l[n].space=I.value,l[n].offset=ne.value}),p(l.totalWidth,()=>{(l.isContainer.value===!0||document.qScrollPrevented!==!0)&&le()}),p(()=>t.behavior+t.breakpoint,le),p(l.isContainer,n=>{w.value===!0&&v(n!==!0),n===!0&&le()}),p(l.scrollbarWidth,()=>{L(w.value===!0?0:void 0)}),p(ne,n=>{H("offset",n)}),p(I,n=>{o("onLayout",n),H("space",n)}),p(M,()=>{L()}),p(S,n=>{L(),ue(t.miniToOverlay,n)}),p(()=>t.miniToOverlay,n=>{ue(n,S.value)}),p(()=>a.lang.rtl,()=>{L()}),p(()=>t.mini,()=>{t.modelValue===!0&&(Ge(),l.animate())}),p(k,n=>{o("miniState",n)});function L(n){n===void 0?Se(()=>{n=w.value===!0?0:S.value,L(A.value*n)}):(l.isContainer.value===!0&&M.value===!0&&(g.value===!0||Math.abs(n)===S.value)&&(n+=A.value*l.scrollbarWidth.value),pe.value=n)}function E(n){ye.value=n}function re(n){const y=n===!0?"remove":l.isContainer.value!==!0?"add":"";y!==""&&document.body.classList[y]("q-body--drawer-toggle")}function Ge(){q!==null&&clearTimeout(q),e.proxy&&e.proxy.$el&&e.proxy.$el.classList.add("q-drawer--mini-animate"),ae.value=!0,q=setTimeout(()=>{q=null,ae.value=!1,e&&e.proxy&&e.proxy.$el&&e.proxy.$el.classList.remove("q-drawer--mini-animate")},150)}function Je(n){if(w.value!==!1)return;const y=S.value,z=G(n.distance.x,0,y);if(n.isFinal===!0){z>=Math.min(75,y)===!0?s():(l.animate(),E(0),L(A.value*y)),W.value=!1;return}L((a.lang.rtl===!0?M.value!==!0:M.value)?Math.max(y-z,0):Math.min(0,z-y)),E(G(z/y,0,1)),n.isFirst===!0&&(W.value=!0)}function qe(n){if(w.value!==!0)return;const y=S.value,z=n.direction===t.side,U=(a.lang.rtl===!0?z!==!0:z)?G(n.distance.x,0,y):0;if(n.isFinal===!0){Math.abs(U)<Math.min(75,y)===!0?(l.animate(),E(1),L(0)):C(),W.value=!1;return}L(A.value*U),E(G(1-U/y,0,1)),n.isFirst===!0&&(W.value=!0)}function ie(){v(!1),re(!0)}function H(n,y){l.update(t.side,n,y)}function Ze(n,y){n.value!==y&&(n.value=y)}function ue(n,y){H("size",n===!0?t.miniWidth:y)}return l.instances[t.side]=D,ue(t.miniToOverlay,S.value),H("space",I.value),H("offset",ne.value),t.showIfAbove===!0&&t.modelValue!==!0&&w.value===!0&&t["onUpdate:modelValue"]!==void 0&&o("update:modelValue",!0),Me(()=>{o("onLayout",I.value),o("miniState",k.value),_=t.showIfAbove===!0;const n=()=>{(w.value===!0?$:b)(!1,!0)};if(l.totalWidth.value!==0){Se(n);return}h=p(l.totalWidth,()=>{h(),h=void 0,w.value===!1&&t.showIfAbove===!0&&g.value===!1?s(!1):n()})}),te(()=>{h!==void 0&&h(),q!==null&&(clearTimeout(q),q=null),w.value===!0&&ie(),l.instances[t.side]===D&&(l.instances[t.side]=void 0,H("size",0),H("offset",0),H("space",!1))}),()=>{const n=[];g.value===!0&&(t.noSwipeOpen===!1&&n.push(mt(x("div",{key:"open",class:`q-drawer__opener fixed-${t.side}`,"aria-hidden":"true"}),je.value)),n.push(ke("div",{ref:"backdrop",class:Re.value,style:Ae.value,"aria-hidden":"true",onClick:C},void 0,"backdrop",t.noSwipeBackdrop!==!0&&w.value===!0,()=>Ke.value)));const y=k.value===!0&&u.mini!==void 0,z=[x("div",{...r,key:""+y,class:[Xe.value,r.class]},y===!0?u.mini():F(u.default))];return t.elevated===!0&&w.value===!0&&z.push(x("div",{class:"q-layout__shadow absolute-full overflow-hidden no-pointer-events"})),n.push(ke("aside",{ref:"content",class:Ye.value,style:Ie.value},z,"contentclose",t.noSwipeClose!==!0&&g.value===!0,()=>Ue.value)),x("div",{class:"q-drawer-container"},n)}}}),Ot=O({name:"QBanner",props:{...Oe,inlineActions:Boolean,dense:Boolean,rounded:Boolean},setup(t,{slots:u}){const{proxy:{$q:o}}=R(),r=Qe(t,o),e=d(()=>"q-banner row items-center"+(t.dense===!0?" q-banner--dense":"")+(r.value===!0?" q-banner--dark q-dark":"")+(t.rounded===!0?" rounded-borders":"")),a=d(()=>`q-banner__actions row items-center justify-end col-${t.inlineActions===!0?"auto":"all"}`);return()=>{const i=[x("div",{class:"q-banner__avatar col-auto row items-center self-start"},F(u.avatar)),x("div",{class:"q-banner__content col text-body2"},F(u.default))],v=F(u.action);return v!==void 0&&i.push(x("div",{class:a.value},v)),x("div",{class:e.value+(t.inlineActions===!1&&v!==void 0?" q-banner--top-padding":""),role:"alert"},i)}}}),Qt=O({name:"QPageContainer",setup(t,{slots:u}){const{proxy:{$q:o}}=R(),r=ee(Y,V);if(r===V)return console.error("QPageContainer needs to be child of QLayout"),V;Ee(bt,!0);const e=d(()=>{const a={};return r.header.space===!0&&(a.paddingTop=`${r.header.size}px`),r.right.space===!0&&(a[`padding${o.lang.rtl===!0?"Left":"Right"}`]=`${r.right.size}px`),r.footer.space===!0&&(a.paddingBottom=`${r.footer.size}px`),r.left.space===!0&&(a[`padding${o.lang.rtl===!0?"Right":"Left"}`]=`${r.left.size}px`),a});return()=>x("div",{class:"q-page-container",style:e.value},F(u.default))}}),Mt=O({name:"QFooter",props:{modelValue:{type:Boolean,default:!0},reveal:Boolean,bordered:Boolean,elevated:Boolean,heightHint:{type:[String,Number],default:50}},emits:["reveal","focusin"],setup(t,{slots:u,emit:o}){const{proxy:{$q:r}}=R(),e=ee(Y,V);if(e===V)return console.error("QFooter needs to be child of QLayout"),V;const a=T(parseInt(t.heightHint,10)),i=T(!0),v=T(He.value===!0||e.isContainer.value===!0?0:window.innerHeight),m=d(()=>t.reveal===!0||e.view.value.indexOf("F")>-1||r.platform.is.ios&&e.isContainer.value===!0),c=d(()=>e.isContainer.value===!0?e.containerHeight.value:v.value),l=d(()=>{if(t.modelValue!==!0)return 0;if(m.value===!0)return i.value===!0?a.value:0;const s=e.scroll.value.position+c.value+a.value-e.height.value;return s>0?s:0}),_=d(()=>t.modelValue!==!0||m.value===!0&&i.value!==!0),q=d(()=>t.modelValue===!0&&_.value===!0&&t.reveal===!0),h=d(()=>"q-footer q-layout__section--marginal "+(m.value===!0?"fixed":"absolute")+"-bottom"+(t.bordered===!0?" q-footer--bordered":"")+(_.value===!0?" q-footer--hidden":"")+(t.modelValue!==!0?" q-layout--prevent-focus"+(m.value!==!0?" hidden":""):"")),g=d(()=>{const s=e.rows.value.bottom,C={};return s[0]==="l"&&e.left.space===!0&&(C[r.lang.rtl===!0?"right":"left"]=`${e.left.size}px`),s[2]==="r"&&e.right.space===!0&&(C[r.lang.rtl===!0?"left":"right"]=`${e.right.size}px`),C});function k(s,C){e.update("footer",s,C)}function S(s,C){s.value!==C&&(s.value=C)}function w({height:s}){S(a,s),k("size",s)}function f(){if(t.reveal!==!0)return;const{direction:s,position:C,inflectionPoint:Q}=e.scroll.value;S(i,s==="up"||C-Q<100||e.height.value-c.value-C-a.value<300)}function $(s){q.value===!0&&S(i,!0),o("focusin",s)}p(()=>t.modelValue,s=>{k("space",s),S(i,!0),e.animate()}),p(l,s=>{k("offset",s)}),p(()=>t.reveal,s=>{s===!1&&S(i,t.modelValue)}),p(i,s=>{e.animate(),o("reveal",s)}),p([a,e.scroll,e.height],f),p(()=>r.screen.height,s=>{e.isContainer.value!==!0&&S(v,s)});const b={};return e.instances.footer=b,t.modelValue===!0&&k("size",a.value),k("space",t.modelValue),k("offset",l.value),te(()=>{e.instances.footer===b&&(e.instances.footer=void 0,k("size",0),k("offset",0),k("space",!1))}),()=>{const s=De(u.default,[x(Z,{debounce:0,onResize:w})]);return t.elevated===!0&&s.push(x("div",{class:"q-layout__shadow absolute-full overflow-hidden no-pointer-events"})),x("footer",{class:h.value,style:g.value,onFocusin:$},s)}}});const{passive:Pe}=pt,Et=["both","horizontal","vertical"];var Ht=O({name:"QScrollObserver",props:{axis:{type:String,validator:t=>Et.includes(t),default:"vertical"},debounce:[String,Number],scrollTarget:{default:void 0}},emits:["scroll"],setup(t,{emit:u}){const o={position:{top:0,left:0},direction:"down",directionChanged:!1,delta:{top:0,left:0},inflectionPoint:{top:0,left:0}};let r=null,e,a;p(()=>t.scrollTarget,()=>{m(),v()});function i(){r!==null&&r();const _=Math.max(0,wt(e)),q=qt(e),h={top:_-o.position.top,left:q-o.position.left};if(t.axis==="vertical"&&h.top===0||t.axis==="horizontal"&&h.left===0)return;const g=Math.abs(h.top)>=Math.abs(h.left)?h.top<0?"up":"down":h.left<0?"left":"right";o.position={top:_,left:q},o.directionChanged=o.direction!==g,o.delta=h,o.directionChanged===!0&&(o.direction=g,o.inflectionPoint=o.position),u("scroll",{...o})}function v(){e=yt(a,t.scrollTarget),e.addEventListener("scroll",c,Pe),c(!0)}function m(){e!==void 0&&(e.removeEventListener("scroll",c,Pe),e=void 0)}function c(_){if(_===!0||t.debounce===0||t.debounce==="0")i();else if(r===null){const[q,h]=t.debounce?[setTimeout(i,t.debounce),clearTimeout]:[requestAnimationFrame(i),cancelAnimationFrame];r=()=>{h(q),r=null}}}const{proxy:l}=R();return p(()=>l.$q.lang.rtl,i),Me(()=>{a=l.$el.parentNode,v()}),te(()=>{r!==null&&r(),m()}),Object.assign(l,{trigger:c,getPosition:()=>o}),Ve}}),Dt=O({name:"QLayout",props:{container:Boolean,view:{type:String,default:"hhh lpr fff",validator:t=>/^(h|l)h(h|r) lpr (f|l)f(f|r)$/.test(t.toLowerCase())},onScroll:Function,onScrollHeight:Function,onResize:Function},setup(t,{slots:u,emit:o}){const{proxy:{$q:r}}=R(),e=T(null),a=T(r.screen.height),i=T(t.container===!0?0:r.screen.width),v=T({position:0,direction:"down",inflectionPoint:0}),m=T(0),c=T(He.value===!0?0:fe()),l=d(()=>"q-layout q-layout--"+(t.container===!0?"containerized":"standard")),_=d(()=>t.container===!1?{minHeight:r.screen.height+"px"}:null),q=d(()=>c.value!==0?{[r.lang.rtl===!0?"left":"right"]:`${c.value}px`}:null),h=d(()=>c.value!==0?{[r.lang.rtl===!0?"right":"left"]:0,[r.lang.rtl===!0?"left":"right"]:`-${c.value}px`,width:`calc(100% + ${c.value}px)`}:null);function g(b){if(t.container===!0||document.qScrollPrevented!==!0){const s={position:b.position.top,direction:b.direction,directionChanged:b.directionChanged,inflectionPoint:b.inflectionPoint.top,delta:b.delta.top};v.value=s,t.onScroll!==void 0&&o("scroll",s)}}function k(b){const{height:s,width:C}=b;let Q=!1;a.value!==s&&(Q=!0,a.value=s,t.onScrollHeight!==void 0&&o("scrollHeight",s),w()),i.value!==C&&(Q=!0,i.value=C),Q===!0&&t.onResize!==void 0&&o("resize",b)}function S({height:b}){m.value!==b&&(m.value=b,w())}function w(){if(t.container===!0){const b=a.value>m.value?fe():0;c.value!==b&&(c.value=b)}}let f=null;const $={instances:{},view:d(()=>t.view),isContainer:d(()=>t.container),rootRef:e,height:a,containerHeight:m,scrollbarWidth:c,totalWidth:d(()=>i.value+c.value),rows:d(()=>{const b=t.view.toLowerCase().split(" ");return{top:b[0].split(""),middle:b[1].split(""),bottom:b[2].split("")}}),header:J({size:0,offset:0,space:!1}),right:J({size:300,offset:0,space:!1}),footer:J({size:0,offset:0,space:!1}),left:J({size:300,offset:0,space:!1}),scroll:v,animate(){f!==null?clearTimeout(f):document.body.classList.add("q-body--layout-animate"),f=setTimeout(()=>{f=null,document.body.classList.remove("q-body--layout-animate")},155)},update(b,s,C){$[b][s]=C}};if(Ee(Y,$),fe()>0){let C=function(){b=null,s.classList.remove("hide-scrollbar")},Q=function(){if(b===null){if(s.scrollHeight>r.screen.height)return;s.classList.add("hide-scrollbar")}else clearTimeout(b);b=setTimeout(C,300)},N=function(D){b!==null&&D==="remove"&&(clearTimeout(b),C()),window[`${D}EventListener`]("resize",Q)},b=null;const s=document.body;p(()=>t.container!==!0?"add":"remove",N),t.container!==!0&&N("add"),Ct(()=>{N("remove")})}return()=>{const b=De(u.default,[x(Ht,{onScroll:g}),x(Z,{onResize:k})]),s=x("div",{class:l.value,style:_.value,ref:t.container===!0?void 0:e,tabindex:-1},b);return t.container===!0?x("div",{class:"q-layout-container overflow-hidden",ref:e},[x(Z,{onResize:S}),x("div",{class:"absolute-full",style:q.value},[x("div",{class:"scroll",style:h.value},[s])])]):s}}}),Ft="/assets/meili-logo.20a032cb.svg";const Rt=Bt("img",{style:{"max-width":"35px"},src:Ft},null,-1),At={key:0},It={__name:"MainLayout",setup(t){const u=xt(),{confirmed:o}=_t(u),r=T(!1),e=()=>{r.value=!r.value};return(a,i)=>{const v=St("router-view");return ve(),Te(Dt,{view:"hHh lpR lFf"},{default:P(()=>[B(Lt,{elevated:"",class:"bg-primary text-white"},{default:P(()=>[B(ze,null,{default:P(()=>[B(he,{dense:"",flat:"",round:"",icon:"menu",onClick:e}),B(Be,null,{default:P(()=>[B(he,{round:"",flat:"",to:"/"},{default:P(()=>[Rt,$e(" \xA0Meilisearch Manager")]),_:1})]),_:1}),B(kt,null,{default:P(()=>[B(zt,{to:"/tasks",exact:"",name:"tasks",label:"Tasks"})]),_:1})]),_:1})]),_:1}),B(Vt,{modelValue:r.value,"onUpdate:modelValue":i[0]||(i[0]=m=>r.value=m),side:"left",behavior:"mobile",bordered:""},{default:P(()=>[B(v,{name:"side"})]),_:1},8,["modelValue"]),B(Qt,null,{default:P(()=>[Tt(o)?(ve(),Te(v,{key:1,name:"main"})):(ve(),$t("div",At,[B(Ot,{class:"text-white text-center bg-red"},{default:P(()=>[$e(" You need to enter and save working credentials in the menu. ")]),_:1})]))]),_:1}),B(Mt,{elevated:"",class:"bg-grey-8 text-white"},{default:P(()=>[B(ze,null,{default:P(()=>[B(Be,null,{default:P(()=>[B(he,{dense:"",flat:"",round:"",icon:"menu",onClick:e})]),_:1})]),_:1})]),_:1})]),_:1})}}};export{It as default};