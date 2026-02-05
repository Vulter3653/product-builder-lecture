// ===== Demo data =====
    const PRODUCTS = [
      {id:"p1",  name:"에어리 티셔츠",  cat:"패션", tag:"new",  price:19900, was:null, rating:4.7, reviews:1321, shipFree:true,  stock:38,  created:"2026-01-20"},
      {id:"p2",  name:"데일리 후디",    cat:"패션", tag:"sale", price:39000, was:59000, rating:4.8, reviews:845,  shipFree:true,  stock:12,  created:"2025-12-18"},
      {id:"p3",  name:"미니 크로스백",  cat:"패션", tag:"best", price:44900, was:null, rating:4.6, reviews:532,  shipFree:false, stock:19,  created:"2025-11-28"},
      {id:"p4",  name:"무선 이어버드 Pro", cat:"테크", tag:"sale", price:79000, was:129000, rating:4.5, reviews:2210, shipFree:true, stock:25, created:"2026-01-06"},
      {id:"p5",  name:"휴대용 블렌더",  cat:"리빙", tag:"best", price:52000, was:null, rating:4.4, reviews:612,  shipFree:true, stock:0,  created:"2025-10-03"},
      {id:"p6",  name:"아로마 디퓨저",  cat:"리빙", tag:"new",  price:29800, was:null, rating:4.3, reviews:194,  shipFree:false, stock:44, created:"2026-01-25"},
      {id:"p7",  name:"비타민 세럼",    cat:"뷰티", tag:"sale", price:25900, was:35000, rating:4.6, reviews:980,  shipFree:true, stock:33, created:"2025-12-05"},
      {id:"p8",  name:"선크림 SPF50+",  cat:"뷰티", tag:"best", price:17500, was:null, rating:4.7, reviews:1430, shipFree:false, stock:58, created:"2025-09-14"},
      {id:"p9",  name:"드립백 커피 10입", cat:"푸드", tag:"new", price:14900, was:null, rating:4.8, reviews:377,  shipFree:true, stock:76, created:"2026-02-01"},
      {id:"p10", name:"프로틴 바 12입",  cat:"푸드", tag:"sale", price:16800, was:21000, rating:4.2, reviews:410, shipFree:true, stock:22, created:"2025-11-07"},
      {id:"p11", name:"USB-C 멀티허브",  cat:"테크", tag:"best", price:34900, was:null, rating:4.4, reviews:650,  shipFree:false, stock:17, created:"2025-08-19"},
      {id:"p12", name:"무드 테이블 램프", cat:"리빙", tag:"sale", price:26900, was:42000, rating:4.5, reviews:521, shipFree:true, stock:9,  created:"2026-01-12"},
    ];

    // ===== Utils =====
    const KRW = new Intl.NumberFormat("ko-KR", { style:"currency", currency:"KRW" });
    const $ = (sel, el=document) => el.querySelector(sel);
    const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));
    const daysBetween = (a,b) => Math.floor((new Date(a)-new Date(b))/(1000*60*60*24));

    // ===== State =====
    const state = {
      q: "",
      cat: "ALL",
      sort: "RECO",
      onlySale: false,
      onlyShipFree: false,
      onlyInStock: true,
      qty: Object.fromEntries(PRODUCTS.map(p => [p.id, 1])),
      wish: new Set(),
      cart: new Map(), // id -> {id, qty}
    };

    // ===== Render products =====
    function computeList(){
      let list = [...PRODUCTS];

      // search
      if(state.q.trim()){
        const k = state.q.trim().toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(k) || p.cat.toLowerCase().includes(k));
      }

      // filters
      if(state.cat !== "ALL") list = list.filter(p => p.cat === state.cat);
      if(state.onlySale) list = list.filter(p => p.tag === "sale" || p.was);
      if(state.onlyShipFree) list = list.filter(p => p.shipFree);
      if(state.onlyInStock) list = list.filter(p => p.stock > 0);

      // sort
      const by = state.sort;
      if(by === "PRICE_ASC") list.sort((a,b)=> a.price - b.price);
      if(by === "PRICE_DESC") list.sort((a,b)=> b.price - a.price);
      if(by === "RATING_DESC") list.sort((a,b)=> b.rating - a.rating);
      if(by === "NEW_DESC") list.sort((a,b)=> new Date(b.created) - new Date(a.created));

      // RECO: 간단 추천 점수(평점+리뷰+신상품 가중치-품절 패널티)
      if(by === "RECO"){
        const now = new Date();
        const score = (p)=>{
          const rec = Math.log10(p.reviews + 10) * 0.9;
          const newness = Math.max(0, 40 - Math.abs(daysBetween(now, new Date(p.created)))) / 40;
          const stock = p.stock > 0 ? 0.2 : -2.0;
          const sale = (p.tag==="sale" || p.was) ? 0.25 : 0;
          return p.rating + rec + newness + stock + sale;
        };
        list.sort((a,b)=> score(b)-score(a));
      }

      return list;
    }

    function tagLabel(tag){
      if(tag==="sale") return {t:"SALE", cls:"sale"};
      if(tag==="new") return {t:"NEW", cls:"new"};
      if(tag==="best") return {t:"BEST", cls:"best"};
      return {t:"", cls:""};
    }

    function cardHTML(p){
      const t = tagLabel(p.tag);
      const wished = state.wish.has(p.id) ? "active" : "";
      const out = p.stock<=0 ? "<span class='pill hot'>품절</span>" : (p.shipFree ? "<span class='pill'>무료배송</span>" : "<span class='pill'>배송비 별도</span>");
      const was = p.was ? `<div class="was">${KRW.format(p.was)}</div>` : `<div class="was" style="visibility:hidden">₩0</div>`;
      const stars = `<span class="stars" title="평점 ${p.rating}"><span class="star"></span> ${p.rating.toFixed(1)} <span class="subtle">(${p.reviews.toLocaleString()})</span></span>`;

      return `
        <article class="card" data-id="${p.id}">
          <div class="thumb">
            <span class="tag ${t.cls}">${t.t}</span>
            <button class="wish ${wished}" type="button" aria-label="찜" data-wish="${p.id}">♥</button>
          </div>
          <div class="content">
            <h3 class="title">${p.name}</h3>
            <div class="meta">
              <span>${p.cat}</span>
              <span>•</span>
              ${stars}
            </div>
            <div class="price-row">
              <div class="price">
                <div class="now">${KRW.format(p.price)}</div>
                ${was}
              </div>
              ${out}
            </div>

            <div class="actions-row">
              <div class="qty" aria-label="수량">
                <button type="button" data-qty-minus="${p.id}" aria-label="감소">−</button>
                <span id="qty-${p.id}">${state.qty[p.id] || 1}</span>
                <button type="button" data-qty-plus="${p.id}" aria-label="증가">+</button>
              </div>
              <button class="buy" type="button" data-add="${p.id}" ${p.stock<=0 ? "disabled style='opacity:.55; cursor:not-allowed'" : ""}>
                담기
              </button>
            </div>
          </div>
        </article>
      `;
    }

    function render(){
      const list = computeList();
      $("#countAll").textContent = PRODUCTS.length.toString();
      $("#countShown").textContent = list.length.toString();

      const grid = $("#grid");
      grid.innerHTML = list.map(cardHTML).join("");

      // bind events
      $$("[data-qty-minus]").forEach(b => b.addEventListener("click", ()=>{
        const id = b.getAttribute("data-qty-minus");
        state.qty[id] = Math.max(1, (state.qty[id]||1) - 1);
        const el = $("#qty-"+id);
        if(el) el.textContent = state.qty[id];
      }));
      $$("[data-qty-plus]").forEach(b => b.addEventListener("click", ()=>{
        const id = b.getAttribute("data-qty-plus");
        state.qty[id] = Math.min(99, (state.qty[id]||1) + 1);
        const el = $("#qty-"+id);
        if(el) el.textContent = state.qty[id];
      }));
      $$("[data-add]").forEach(b => b.addEventListener("click", ()=>{
        const id = b.getAttribute("data-add");
        const p = PRODUCTS.find(x=>x.id===id);
        if(!p || p.stock<=0) return;
        addToCart(id, state.qty[id]||1);
      }));
      $$("[data-wish]").forEach(b => b.addEventListener("click", ()=>{
        const id = b.getAttribute("data-wish");
        if(state.wish.has(id)) state.wish.delete(id);
        else state.wish.add(id);
        b.classList.toggle("active");
        toast(state.wish.has(id) ? "찜 목록에 추가했어요." : "찜을 해제했어요.");
      }));
    }

    // ===== Cart =====
    function addToCart(id, qty){
      const cur = state.cart.get(id)?.qty || 0;
      state.cart.set(id, {id, qty: cur + qty});
      updateCartUI();
      toast("장바구니에 담았습니다.");
    }

    function removeFromCart(id){
      state.cart.delete(id);
      updateCartUI();
    }

    function changeCartQty(id, delta){
      const item = state.cart.get(id);
      if(!item) return;
      item.qty = Math.max(1, item.qty + delta);
      state.cart.set(id, item);
      updateCartUI();
    }

    function cartTotal(){
      let sum = 0;
      for(const [id, item] of state.cart){
        const p = PRODUCTS.find(x=>x.id===id);
        if(p) sum += p.price * item.qty;
      }
      return sum;
    }

    function updateCartUI(){
      const count = Array.from(state.cart.values()).reduce((a,b)=>a+b.qty,0);
      $("#cartCount").textContent = count.toString();

      const list = $("#cartList");
      if(count === 0){
        list.innerHTML = `<div class="small" style="padding:12px; color: var(--muted)">장바구니가 비어 있습니다.</div>`;
      } else {
        list.innerHTML = Array.from(state.cart.values()).map(({id, qty})=>{
          const p = PRODUCTS.find(x=>x.id===id);
          if(!p) return "";
          return `
            <div class="cart-item">
              <div class="cart-thumb" aria-hidden="true"></div>
              <div class="cart-info">
                <p class="n">${p.name}</p>
                <p class="m">${p.cat} • ${p.shipFree ? "무료배송" : "배송비 별도"}</p>
                <div class="cart-ops">
                  <div class="mini-qty">
                    <button type="button" data-cart-minus="${id}">−</button>
                    <span class="amt">${qty}</span>
                    <button type="button" data-cart-plus="${id}">+</button>
                  </div>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <b>${KRW.format(p.price * qty)}</b>
                    <button type="button" class="remove" data-cart-remove="${id}">삭제</button>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join("");

        $$("[data-cart-minus]").forEach(b => b.addEventListener("click", ()=> changeCartQty(b.dataset.cartMinus, -1)));
        $$("[data-cart-plus]").forEach(b => b.addEventListener("click", ()=> changeCartQty(b.dataset.cartPlus, +1)));
        $$("[data-cart-remove]").forEach(b => b.addEventListener("click", ()=> removeFromCart(b.dataset.cartRemove)));
      }

      $("#cartTotal").textContent = KRW.format(cartTotal());
    }

    // ===== Drawer =====
    function openCart(){
      $("#backdrop").classList.add("show");
      $("#drawer").classList.add("open");
      document.body.style.overflow = "hidden";
      updateCartUI();
    }
    function closeCart(){
      $("#backdrop").classList.remove("show");
      $("#drawer").classList.remove("open");
      document.body.style.overflow = "";
    }

    // ===== Toast =====
    let toastTimer = null;
    function toast(msg){
      const t = $("#toast");
      $("#toastMsg").textContent = msg;
      t.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(()=> t.classList.remove("show"), 1600);
    }

    // ===== Events (non-login/theme) =====
    $("#btnCart").addEventListener("click", openCart);
    $("#btnCloseCart").addEventListener("click", closeCart);
    $("#backdrop").addEventListener("click", closeCart);

    $("#btnEmpty").addEventListener("click", ()=>{
      state.cart.clear();
      updateCartUI();
      toast("장바구니를 비웠습니다.");
    });

    $("#btnCheckout").addEventListener("click", ()=>{
      if(state.cart.size === 0) return toast("장바구니가 비어 있어요.");
      toast("데모: 결제 화면으로 이동(가정)");
    });

    $("#q").addEventListener("input", (e)=>{
      state.q = e.target.value;
      render();
    });

    $("#filterCat").addEventListener("change", (e)=>{
      state.cat = e.target.value;
      render();
    });

    $("#sortBy").addEventListener("change", (e)=>{
      state.sort = e.target.value;
      render();
    });

    $("#onlySale").addEventListener("change", (e)=>{
      state.onlySale = e.target.checked;
      render();
    });

    $("#onlyShipFree").addEventListener("change", (e)=>{
      state.onlyShipFree = e.target.checked;
      render();
    });

    $("#onlyInStock").addEventListener("change", (e)=>{
      state.onlyInStock = e.target.checked;
      render();
    });

    $$(".cat").forEach(btn => btn.addEventListener("click", ()=>{
      state.cat = btn.dataset.cat;
      $("#filterCat").value = state.cat;
      render();
      document.querySelector("#products").scrollIntoView({behavior:"smooth", block:"start"});
    }));

    $("#btnClear").addEventListener("click", ()=>{
      state.q = "";
      $("#q").value = "";
      state.cat = "ALL";
      $("#filterCat").value = "ALL";
      state.sort = "RECO";
      $("#sortBy").value = "RECO";
      state.onlySale = false; $("#onlySale").checked = false;
      state.onlyShipFree = false; $("#onlyShipFree").checked = false;
      state.onlyInStock = true; $("#onlyInStock").checked = true;
      render();
      toast("초기화 완료");
    });

    $("#btnRandomPick").addEventListener("click", ()=>{
      const list = computeList();
      if(list.length===0) return toast("조건에 맞는 상품이 없어요.");
      const pick = list[Math.floor(Math.random()*list.length)];
      toast(`추천: ${pick.name}`);
      const card = document.querySelector(`.card[data-id="${pick.id}"]`);
      if(card) card.scrollIntoView({behavior:"smooth", block:"center"});
    });

    // 단축키: Ctrl + /
    window.addEventListener("keydown", (e)=>{
      if(e.ctrlKey && e.key === "/"){
        e.preventDefault();
        $("#q").focus();
      }
      if(e.key === "Escape"){
        closeCart();
      }
    });

    // ===== Login (persist with localStorage) =====
    const LS_LOGIN_KEY = "vibeshop_login_id";

    function genLoginId(){
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      const digits = "0123456789";

      let a = "";
      for(let i=0;i<4;i++) a += letters[Math.floor(Math.random() * letters.length)];

      let b = "";
      for(let i=0;i<4;i++) b += digits[Math.floor(Math.random() * digits.length)];

      return a + b;
    }

    let loggedInId = localStorage.getItem(LS_LOGIN_KEY); // 새로고침 유지

    function setLoginUI(){
      const btn = $("#btnLogin");
      const acc = $("#accountArea");
      if(!btn || !acc) return;

      if(loggedInId){
        btn.innerHTML = `<span aria-hidden="true">✅</span> 로그아웃`;
        btn.classList.remove("primary");
        btn.classList.add("ghost");
        btn.setAttribute("aria-pressed", "true");

        acc.style.display = "block";
        acc.innerHTML = `환영합니다, <strong>${loggedInId}</strong>`;
      } else {
        btn.innerHTML = `<span aria-hidden="true">👤</span> 로그인`;
        btn.classList.add("primary");
        btn.classList.remove("ghost");
        btn.setAttribute("aria-pressed", "false");

        acc.style.display = "none";
        acc.textContent = "";
      }
    }

    $("#btnLogin").addEventListener("click", ()=>{
      if(loggedInId){
        const prev = loggedInId;
        loggedInId = null;
        localStorage.removeItem(LS_LOGIN_KEY);
        setLoginUI();
        toast(`로그아웃 완료: ${prev}`);
      } else {
        loggedInId = genLoginId();
        localStorage.setItem(LS_LOGIN_KEY, loggedInId);
        setLoginUI();
        toast(`로그인 완료: ${loggedInId}`);
      }
    });

    // ===== Theme (light/dark) persist =====
    const LS_THEME_KEY = "vibeshop_theme"; // "dark" | "light"

    function applyTheme(theme){
      const root = document.documentElement;
      const icon = $("#btnTheme")?.querySelector("span");
      const t = (theme === "light") ? "light" : "dark";
      root.setAttribute("data-theme", t);

      if(icon){
        icon.textContent = (t === "light") ? "☀️" : "🌙";
      }
      localStorage.setItem(LS_THEME_KEY, t);
    }

    function initTheme(){
      const saved = localStorage.getItem(LS_THEME_KEY);
      applyTheme(saved || "dark");
    }

    $("#btnTheme").addEventListener("click", ()=>{
      const cur = document.documentElement.getAttribute("data-theme") || "dark";
      applyTheme(cur === "dark" ? "light" : "dark");
      toast(`테마: ${document.documentElement.getAttribute("data-theme") === "light" ? "라이트" : "다크"}`);
    });

    // ===== Init =====
    $("#year").textContent = new Date().getFullYear();
    initTheme();
    setLoginUI();
    render();
    updateCartUI();