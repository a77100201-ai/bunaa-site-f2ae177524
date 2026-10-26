(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const initialProducts = [
    {id:"oud",name:"عود ليلي",type:"رجالي",price:289,description:"عبير شرقي عميق يفتتح بالزعفران ويستقر على قاعدة دافئة من العود وخشب الصندل.",notes:"عود · زعفران · صندل",tone:"#e8decb",g1:"#70502c",g2:"#d0ad67"},
    {id:"rose",name:"ورد مخملي",type:"نسائي",price:245,description:"بتلات الورد الدمشقي تلتقي بلمسة فانيلا ناعمة في عطر أنثوي رقيق وأنيق.",notes:"ورد دمشقي · فانيلا · مسك",tone:"#ead9d3",g1:"#ac7374",g2:"#e1b0a2"},
    {id:"amber",name:"عنبر دافئ",type:"مشترك",price:319,description:"دفء العنبر والراتنجات ينسج حضوراً غنياً يتوازن مع نفحات حمضية مشرقة.",notes:"عنبر · برغموت · راتنج",tone:"#e8d7be",g1:"#8b572b",g2:"#e0a74f"},
    {id:"musk",name:"مسك أبيض",type:"نسائي",price:199,description:"نقاء المسك الأبيض مع زهر البرتقال، رائحة يومية هادئة وقريبة من القلب.",notes:"مسك أبيض · زهر البرتقال · قطن",tone:"#e5e5de",g1:"#a5a294",g2:"#e4dcb9"},
    {id:"sultan",name:"هيبة السلطان",type:"رجالي",price:359,description:"تركيبة جريئة من الجلد والتوابل والأخشاب الداكنة، مصممة للحضور اللافت.",notes:"جلد · فلفل أسود · أخشاب",tone:"#dbd2c4",g1:"#584638",g2:"#a88351"},
    {id:"jasmine",name:"ياسمين المساء",type:"مشترك",price:229,description:"نفحات ياسمين نضرة تتفتح مع زهر البرتقال وقاعدة مسكية متوازنة.",notes:"ياسمين · زهر البرتقال · مسك",tone:"#e9e2d0",g1:"#8c7948",g2:"#d8c584"}
  ];
  const safeStore = {
    memory: {},
    get(key, fallback) {
      try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); }
      catch { return Object.prototype.hasOwnProperty.call(this.memory,key) ? this.memory[key] : fallback; }
    },
    set(key, value) {
      this.memory[key] = value;
      try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    }
  };
  let products = safeStore.get("abq-products", null) || initialProducts.map(p => ({...p}));
  let cart = safeStore.get("abq-cart", []);
  let orders = safeStore.get("abq-orders", []);
  let activeFilter = "الكل";
  let toastTimer;
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const money = n => `${Number(n).toLocaleString("ar-SA")} ر.س`;
  const persist = () => { safeStore.set("abq-products",products); safeStore.set("abq-cart",cart); safeStore.set("abq-orders",orders); };
  const productById = id => products.find(p => p.id === id);
  const visual = p => `<div class="product-visual" style="--tone:${esc(p.tone)};--glass1:${esc(p.g1)};--glass2:${esc(p.g2)}"><span class="visual-no">EAU · ${esc(String(p.id).slice(0,3).toUpperCase())}</span><div class="mini-bottle"><div class="cap"></div><div class="neck"></div><div class="glass"><span class="label">${esc(p.name.split(" ")[0])}<small>عبق العطور</small></span></div></div><span class="visual-type">EAU DE PARFUM</span></div>`;
  function toast(message) { const t=$("#toast"); t.textContent=message;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2300); }
  function renderProducts() {
    const query=$("#searchInput").value.trim().toLowerCase();
    const list=products.filter(p=>(activeFilter==="الكل"||p.type===activeFilter)&&`${p.name} ${p.type} ${p.description}`.toLowerCase().includes(query));
    $("#productGrid").innerHTML=list.map(p=>`<article class="product-card">${visual(p)}<div class="card-info"><span class="card-type">${esc(p.type)} · 75 مل</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="card-bottom"><span class="price">${money(p.price)} <small>/ زجاجة</small></span><div class="card-actions"><button class="tiny-btn" data-detail="${esc(p.id)}">التفاصيل</button><button class="tiny-btn add" data-add="${esc(p.id)}">أضف للسلة +</button></div></div></div></article>`).join("");
    $("#emptyProducts").classList.toggle("hidden",list.length>0);
  }
  function updateCart() {
    cart=cart.filter(x=>productById(x.id)&&x.qty>0);
    $("#cartCount").textContent=cart.reduce((n,x)=>n+x.qty,0);
    $("#cartTotal").textContent=money(cart.reduce((n,x)=>n+productById(x.id).price*x.qty,0));
    $("#cartItems").innerHTML=cart.length?cart.map(x=>{const p=productById(x.id);return `<div class="cart-line"><div class="cart-thumb">✦</div><div class="cart-line-info"><b>${esc(p.name)}</b><small>${money(p.price)} · ${esc(p.type)}</small><div class="qty-controls"><button data-qty="${esc(p.id)}" data-delta="-1" aria-label="تقليل الكمية">−</button><span>${x.qty}</span><button data-qty="${esc(p.id)}" data-delta="1" aria-label="زيادة الكمية">+</button></div></div><button class="remove-item" data-remove="${esc(p.id)}" aria-label="حذف المنتج">×</button></div>`}).join(""):`<div class="empty-cart">سلتك بانتظار عطر يليق بك ✦</div>`;
    persist();
  }
  function addToCart(id){if(!productById(id))return;const line=cart.find(x=>x.id===id);line?line.qty++:cart.push({id,qty:1});updateCart();toast("أُضيف العطر إلى سلتك");}
  function openCart(){ $("#cartOverlay").classList.remove("hidden");$("#cartDrawer").classList.add("open");$("#cartDrawer").setAttribute("aria-hidden","false");document.body.style.overflow="hidden"; }
  function closeCart(){ $("#cartOverlay").classList.add("hidden");$("#cartDrawer").classList.remove("open");$("#cartDrawer").setAttribute("aria-hidden","true");document.body.style.overflow=""; }
  function openModal(html){$("#modalContent").innerHTML=html;$("#modalWrap").classList.remove("hidden");document.body.style.overflow="hidden";}
  function closeModal(){ $("#modalWrap").classList.add("hidden");document.body.style.overflow=""; }
  function showDetail(id){const p=productById(id);if(!p)return;openModal(`<div class="detail-view"><div class="detail-visual">${visual(p)}</div><div><span class="card-type">${esc(p.type)} · 75 مل</span><h2 id="modalTitle">${esc(p.name)}</h2><p>${esc(p.description)}</p><div class="notes">النفحات: ${esc(p.notes||"تركيبة عطرية فاخرة")}</div><p class="price">${money(p.price)}</p><button class="button button-gold" data-add="${esc(p.id)}">أضف إلى السلة <span>←</span></button></div></div>`);}
  function checkoutForm(){if(!cart.length){closeCart();toast("أضف عطراً إلى سلتك أولاً");return}closeCart();openModal(`<h2 id="modalTitle">إتمام الطلب</h2><p class="subtext">خطوة واحدة تفصلك عن عطر تختاره بعناية.</p><form id="checkoutForm"><div class="form-grid"><div class="field"><label for="customerName">الاسم الكامل *</label><input id="customerName" name="name" required minlength="2" autocomplete="name"></div><div class="field"><label for="customerPhone">رقم الجوال *</label><input id="customerPhone" name="phone" required type="tel" pattern="[0-9+() -]{8,16}" autocomplete="tel" placeholder="05xxxxxxxx"></div><div class="field wide"><label for="customerAddress">عنوان التوصيل *</label><textarea id="customerAddress" name="address" required minlength="5" autocomplete="street-address"></textarea></div><div class="field wide"><label>قيمة الطلب</label><input readonly value="${esc(money(cart.reduce((n,x)=>n+productById(x.id).price*x.qty,0)))} — الشحن مجاني"></div></div><button class="button button-gold" type="submit">تأكيد الطلب <span>←</span></button></form>`);}
  function adminPanel(tab="products") {
    const tabs=`<div class="admin-tabs"><button class="admin-tab ${tab==="products"?"active":""}" data-admin-tab="products">المنتجات (${products.length})</button><button class="admin-tab ${tab==="orders"?"active":""}" data-admin-tab="orders">الطلبات (${orders.length})</button></div>`;
    let content="";
    if(tab==="products") content=`<button class="button button-gold" data-add-product>إضافة منتج جديد <span>+</span></button><div class="admin-list">${products.length?products.map(p=>`<div class="admin-row"><div><b>${esc(p.name)}</b><small>${esc(p.type)} · ${money(p.price)}</small></div><div class="admin-row-actions"><button data-edit-product="${esc(p.id)}">تعديل</button><button class="delete" data-delete-product="${esc(p.id)}">حذف</button></div></div>`).join(""):`<p class="empty-cart">لا توجد منتجات.</p>`}</div>`;
    else content=`<div class="admin-list">${orders.length?orders.slice().reverse().map(o=>`<div class="admin-row"><div><b>${esc(o.name)} · ${money(o.total)}</b><small>${esc(o.phone)} · ${esc(o.address)}<br>${o.items.map(i=>`${esc(i.name)} × ${i.qty}`).join("، ")}</small><span class="order-status">الحالة: ${esc(o.status)}</span></div><div class="admin-row-actions"><button data-order-status="${esc(o.id)}">${o.status==="جديد"?"قيد التجهيز":o.status==="قيد التجهيز"?"تم الشحن":"إعادة فتح"}</button><button class="delete" data-delete-order="${esc(o.id)}">حذف</button></div></div>`).join(""):`<p class="empty-cart">لا توجد طلبات بعد.</p>`}</div>`;
    openModal(`<h2 id="modalTitle">لوحة التحكم</h2><p class="subtext">إدارة المتجر والطلبات المحفوظة على هذا الجهاز.</p>${tabs}${content}`);
  }
  function productForm(id) {
    const p=id?productById(id):null;
    openModal(`<h2 id="modalTitle">${p?"تعديل المنتج":"إضافة منتج"}</h2><p class="subtext">أدخل تفاصيل العطر. يتغير لون الزجاجة حسب اللون المختار.</p><form id="productForm"><div class="form-grid"><div class="field wide"><label>اسم العطر *</label><input name="name" required maxlength="40" value="${esc(p?.name||"")}"></div><div class="field"><label>التصنيف *</label><select name="type" required><option ${p?.type==="نسائي"?"selected":""}>نسائي</option><option ${p?.type==="رجالي"?"selected":""}>رجالي</option><option ${p?.type==="مشترك"?"selected":""}>مشترك</option></select></div><div class="field"><label>السعر (ر.س) *</label><input name="price" type="number" min="1" max="100000" required value="${p?.price||""}"></div><div class="field wide"><label>الوصف *</label><textarea name="description" required maxlength="220">${esc(p?.description||"")}</textarea></div><div class="field wide"><label>النفحات</label><input name="notes" maxlength="100" value="${esc(p?.notes||"")}"></div></div><button class="button button-gold" type="submit">${p?"حفظ التعديلات":"إضافة المنتج"} <span>←</span></button></form>`,);
    $("#productForm").dataset.editId=id||"";
  }
  function makeId(){return "p"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
  $("#productGrid").addEventListener("click",e=>{const d=e.target.closest("[data-detail]");const a=e.target.closest("[data-add]");if(d)showDetail(d.dataset.detail);else if(a)addToCart(a.dataset.add)});
  $("#filters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;activeFilter=b.dataset.filter;$$(".filter").forEach(x=>x.classList.toggle("active",x===b));renderProducts()});
  $("#searchInput").addEventListener("input",renderProducts);
  $("#cartOpen").addEventListener("click",openCart);$("#cartOverlay").addEventListener("click",closeCart);$$("[data-close-cart]").forEach(b=>b.addEventListener("click",closeCart));
  $("#cartItems").addEventListener("click",e=>{const q=e.target.closest("[data-qty]"),r=e.target.closest("[data-remove]");if(q){const item=cart.find(x=>x.id===q.dataset.qty);if(item)item.qty+=Number(q.dataset.delta);if(item?.qty<=0)cart=cart.filter(x=>x!==item);updateCart()}if(r){cart=cart.filter(x=>x.id!==r.dataset.remove);updateCart()}});
  $("#checkoutOpen").addEventListener("click",checkoutForm);
  $("#adminOpen").addEventListener("click",()=>adminPanel());
  $("#modalWrap").addEventListener("click",e=>{if(e.target.id==="modalWrap"||e.target.closest("[data-close-modal]"))closeModal()});
  $("#modalContent").addEventListener("click",e=>{
    const tab=e.target.closest("[data-admin-tab]");if(tab){adminPanel(tab.dataset.adminTab);return}
    const add=e.target.closest("[data-add-product]");if(add){productForm();return}
    const edit=e.target.closest("[data-edit-product]");if(edit){productForm(edit.dataset.editProduct);return}
    const del=e.target.closest("[data-delete-product]");if(del){if(confirm("هل تريد حذف هذا المنتج؟ سيُزال أيضاً من السلة.")){products=products.filter(p=>p.id!==del.dataset.deleteProduct);cart=cart.filter(x=>x.id!==del.dataset.deleteProduct);persist();renderProducts();updateCart();adminPanel("products");toast("تم حذف المنتج")}return}
    const status=e.target.closest("[data-order-status]");if(status){const o=orders.find(x=>x.id===status.dataset.orderStatus);if(o){o.status=o.status==="جديد"?"قيد التجهيز":o.status==="قيد التجهيز"?"تم الشحن":"جديد";persist();adminPanel("orders")}return}
    const delOrder=e.target.closest("[data-delete-order]");if(delOrder){if(confirm("حذف هذا الطلب؟")){orders=orders.filter(o=>o.id!==delOrder.dataset.deleteOrder);persist();adminPanel("orders")}return}
    const addCart=e.target.closest("[data-add]");if(addCart){addToCart(addCart.dataset.add);closeModal()}
  });
  $("#modalContent").addEventListener("submit",e=>{
    e.preventDefault();
    if(e.target.id==="checkoutForm"){
      if(!e.target.reportValidity())return;
      const fd=new FormData(e.target);const order={id:makeId(),name:fd.get("name").trim(),phone:fd.get("phone").trim(),address:fd.get("address").trim(),items:cart.map(x=>({name:productById(x.id).name,qty:x.qty})),total:cart.reduce((n,x)=>n+productById(x.id).price*x.qty,0),status:"جديد",date:new Date().toISOString()};
      orders.push(order);cart=[];persist();updateCart();closeModal();toast("تم تسجيل طلبك على هذا الجهاز بنجاح");return;
    }
    if(e.target.id==="productForm"){
      if(!e.target.reportValidity())return;const fd=new FormData(e.target),id=e.target.dataset.editId;
      const old=id?productById(id):null;const data={id:id||makeId(),name:fd.get("name").trim(),type:fd.get("type"),price:Number(fd.get("price")),description:fd.get("description").trim(),notes:fd.get("notes").trim(),tone:old?.tone||"#e8decb",g1:old?.g1||"#70502c",g2:old?.g2||"#d0ad67"};
      if(old)products=products.map(p=>p.id===id?data:p);else products.push(data);
      persist();renderProducts();adminPanel("products");toast(old?"تم تحديث المنتج":"تمت إضافة المنتج");
    }
  });
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();closeModal()}});
  $("#year").textContent=new Date().getFullYear();
  renderProducts();updateCart();
})();
