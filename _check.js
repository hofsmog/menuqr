// Fyll i din egen Supabase-projektinformation hÃ¤r innan du kÃ¶r skarpt.
    const SUPABASE_URL = "https://fijtzqwjyykbrgckvhbz.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpanR6cXdqeXlrYnJnY2t2aGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDMzMDUsImV4cCI6MjA5Mjc3OTMwNX0.qlexoai3aIp_ystglKZFXpwkeNp2fqXCxi8Xy-yFF8s";

    const hasSupabaseConfig =
      SUPABASE_URL && SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
      SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";

    const supabase = hasSupabaseConfig
      ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      : null;

    const state = {
      currentView: "landing",
      authMode: "login",
      user: null,
      restaurant: null,
      categories: [],
      menuItems: [],
      editingItemId: null,
      authSubscriptionInitialized: false
    };

    const elements = {
      app: document.getElementById("app"),
      brandLogo: document.getElementById("brandLogo"),
      brandFallback: document.getElementById("brandFallback"),
      navHomeButton: document.getElementById("navHomeButton"),
      navDashboardButton: document.getElementById("navDashboardButton"),
      navAuthButton: document.getElementById("navAuthButton"),
      navSignupButton: document.getElementById("navSignupButton"),
      navLogoutButton: document.getElementById("navLogoutButton"),
      landingView: document.getElementById("app"),
      authView: document.getElementById("authView"),
      dashboardView: document.getElementById("dashboardView"),
      publicMenuView: document.getElementById("publicMenuView"),
      loginTab: document.getElementById("loginTab"),
      signupTab: document.getElementById("signupTab"),
      authHeading: document.getElementById("authHeading"),
      authForm: document.getElementById("authForm"),
      authEmail: document.getElementById("authEmail"),
      authPassword: document.getElementById("authPassword"),
      authSubmitButton: document.getElementById("authSubmitButton"),
      authStatus: document.getElementById("authStatus"),
      dashboardStatus: document.getElementById("dashboardStatus"),
      userEmailLabel: document.getElementById("userEmailLabel"),
      restaurantForm: document.getElementById("restaurantForm"),
      restaurantName: document.getElementById("restaurantName"),
      restaurantSlug: document.getElementById("restaurantSlug"),
      publicMenuLink: document.getElementById("publicMenuLink"),
      copyLinkButton: document.getElementById("copyLinkButton"),
      categoryForm: document.getElementById("categoryForm"),
      categoryName: document.getElementById("categoryName"),
      categorySortOrder: document.getElementById("categorySortOrder"),
      categoryList: document.getElementById("categoryList"),
      menuItemForm: document.getElementById("menuItemForm"),
      menuItemId: document.getElementById("menuItemId"),
      menuItemName: document.getElementById("menuItemName"),
      menuItemDescription: document.getElementById("menuItemDescription"),
      menuItemPrice: document.getElementById("menuItemPrice"),
      menuItemCategory: document.getElementById("menuItemCategory"),
      menuItemActive: document.getElementById("menuItemActive"),
      menuItemSubmitButton: document.getElementById("menuItemSubmitButton"),
      cancelEditButton: document.getElementById("cancelEditButton"),
      menuItemList: document.getElementById("menuItemList"),
      publicRestaurantName: document.getElementById("publicRestaurantName"),
      publicMenuDescription: document.getElementById("publicMenuDescription"),
      publicMenuStatus: document.getElementById("publicMenuStatus"),
      publicMenuContent: document.getElementById("publicMenuContent")
    };

    function slugify(value) {
      return value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
    }

    function formatPrice(value) {
      const number = Number(value || 0);
      return new Intl.NumberFormat("sv-SE", {
        style: "currency",
        currency: "SEK",
        maximumFractionDigits: number % 1 === 0 ? 0 : 2
      }).format(number);
    }

    function setStatus(element, message, tone = "info") {
      if (!message) {
        element.textContent = "";
        element.classList.remove("is-visible");
        return;
      }

      element.textContent = message;
      element.dataset.tone = tone;
      element.classList.add("is-visible");
    }

    function renderLanding() {
      elements.app.innerHTML = `
        <div class="lp">
          <section class="lp-hero">
            <div class="lp-card lp-hero-copy">
              <div class="lp-kicker">NY LANDING AKTIV</div>
              <h1>Slipp pappersmenyer - kor QR istallet</h1>
              <p>Skapa en snygg digital meny pÃ¥ 2 minuter. Uppdatera nÃ¤r du vill.</p>
              <div class="lp-actions">
                <button class="btn btn-primary" type="button" data-go-auth="signup">Skapa gratis meny</button>
                <button class="btn btn-outline" type="button" data-scroll-demo="true">Se demo</button>
              </div>
            </div>

            <aside class="lp-card lp-hero-preview">
              <p class="lp-preview-label">Mobilpreview</p>
              <div class="lp-phone">
                <div class="lp-phone-screen">
                  <div class="lp-phone-top">
                    <span class="lp-phone-badge">Oppet nu</span>
                    <span class="lp-phone-note">2 min setup</span>
                  </div>
                  <h3>MenuQR Bistro</h3>
                  <p class="lp-phone-copy">En ren meny som kÃ¤nns enkel att lÃ¤sa direkt vid bordet.</p>

                  <div class="lp-menu-group">
                    <h4>Pizza</h4>
                    <div class="lp-menu-row">
                      <div class="lp-menu-row-head">
                        <span>Margherita</span>
                        <span class="lp-price">99 kr</span>
                      </div>
                      <p>TomatsÃ¥s, mozzarella och fÃ¤rsk basilika.</p>
                    </div>
                    <div class="lp-menu-row">
                      <div class="lp-menu-row-head">
                        <span>Vesuvio</span>
                        <span class="lp-price">109 kr</span>
                      </div>
                      <p>TomatsÃ¥s, ost och skinka i klassisk stil.</p>
                    </div>
                  </div>

                  <div class="lp-menu-group">
                    <h4>Pasta</h4>
                    <div class="lp-menu-row">
                      <div class="lp-menu-row-head">
                        <span>Carbonara</span>
                        <span class="lp-price">129 kr</span>
                      </div>
                      <p>Pecorino, svartpeppar och krÃ¤mig Ã¤ggula.</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </section>

          <section class="lp-card lp-trust">
            <div class="lp-trust-item">
              <span class="lp-trust-dot"></span>
              <span>Ingen app behÃ¶vs</span>
            </div>
            <div class="lp-trust-item">
              <span class="lp-trust-dot"></span>
              <span>Fungerar pÃ¥ alla mobiler</span>
            </div>
            <div class="lp-trust-item">
              <span class="lp-trust-dot"></span>
              <span>Redo pÃ¥ 2 minuter</span>
            </div>
          </section>

          <section class="lp-features">
            <article class="lp-card lp-feature">
              <div class="lp-feature-icon">01</div>
              <h3>Snabbt att komma igÃ¥ng</h3>
              <p>Skapa restaurang, lÃ¤gg in rÃ¤tter och publicera menyn utan tekniskt krÃ¥ngel.</p>
            </article>
            <article class="lp-card lp-feature">
              <div class="lp-feature-icon">02</div>
              <h3>QR-kod direkt</h3>
              <p>Din publika meny-lÃ¤nk Ã¤r redo att anvÃ¤ndas bakom QR-koder pÃ¥ bord och skyltar.</p>
            </article>
            <article class="lp-card lp-feature">
              <div class="lp-feature-icon">03</div>
              <h3>Uppdatera nÃ¤r som helst</h3>
              <p>Ã„ndra priser och matrÃ¤tter direkt sÃ¥ att gÃ¤sten alltid ser rÃ¤tt meny.</p>
            </article>
          </section>

          <section id="demoSection" class="lp-card lp-demo">
            <div class="lp-demo-copy">
              <h2>SÃ¥ ser din meny ut</h2>
              <p>En stÃ¶rre mobilpreview som visar hur rent och tydligt menyn presenteras fÃ¶r gÃ¤sten.</p>
            </div>

            <div class="lp-demo-phone">
              <div class="lp-demo-screen">
                <div class="lp-demo-head">
                  <h3>Atelje Kitchen</h3>
                  <p>KvÃ¤llsmeny â€¢ Skanna, lÃ¤s och bestÃ¤m i lugn och ro</p>
                </div>
                <div class="lp-demo-body">
                  <div class="lp-menu-group">
                    <h4>Pizza</h4>
                    <div class="lp-menu-row">
                      <div class="lp-menu-row-head">
                        <span>Bianca Tartufo</span>
                        <span class="lp-price">169 kr</span>
                      </div>
                      <p>Creme fraiche, tryffel, mozzarella och rostad svamp.</p>
                    </div>
                    <div class="lp-menu-row">
                      <div class="lp-menu-row-head">
                        <span>Piccante</span>
                        <span class="lp-price">159 kr</span>
                      </div>
                      <p>Salami, chiliolja, parmesan och honung.</p>
                    </div>
                  </div>

                  <div class="lp-menu-group">
                    <h4>Pasta</h4>
                    <div class="lp-menu-row">
                      <div class="lp-menu-row-head">
                        <span>Rigatoni al Forno</span>
                        <span class="lp-price">149 kr</span>
                      </div>
                      <p>Tomat, basilika, mozzarella och lÃ¥ngkokt ragu.</p>
                    </div>
                    <div class="lp-menu-row">
                      <div class="lp-menu-row-head">
                        <span>Frutti di Mare</span>
                        <span class="lp-price">189 kr</span>
                      </div>
                      <p>VitlÃ¶k, chili, rÃ¤kor, musslor och vitvinssÃ¥s.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="lp-card lp-cta">
            <h2>Redo att komma igÃ¥ng?</h2>
            <p>Skapa din fÃ¶rsta digitala meny och bÃ¶rja dela den med QR redan idag.</p>
            <button class="btn btn-primary" type="button" data-go-auth="signup">Skapa gratis meny</button>
          </section>
        </div>
      `;
    }

    function showView(viewName) {
      state.currentView = viewName;
      if (viewName === "landing") {
        renderLanding();
      }
      const map = {
        landing: elements.landingView,
        auth: elements.authView,
        dashboard: elements.dashboardView,
        publicMenu: elements.publicMenuView
      };

      Object.values(map).forEach((view) => view.classList.remove("is-active"));
      map[viewName].classList.add("is-active");

      const isPublic = viewName === "publicMenu";
      const isDashboard = viewName === "dashboard";
      const isAuth = viewName === "auth";
      const showGuestActions = !state.user && !isPublic;

      elements.navHomeButton.classList.toggle("hidden", isPublic);
      elements.navDashboardButton.classList.toggle("hidden", !state.user || isDashboard || isPublic);
      elements.navAuthButton.classList.toggle("hidden", !showGuestActions);
      elements.navSignupButton.classList.toggle("hidden", !showGuestActions);
      elements.navLogoutButton.classList.toggle("hidden", !state.user || isPublic);
    }

    function setAuthMode(mode) {
      state.authMode = mode;
      const isLogin = mode === "login";
      elements.loginTab.classList.toggle("is-active", isLogin);
      elements.signupTab.classList.toggle("is-active", !isLogin);
      elements.authHeading.textContent = isLogin ? "Logga in" : "Skapa konto";
      elements.authSubmitButton.textContent = isLogin ? "Logga in" : "Skapa konto";
      elements.authPassword.autocomplete = isLogin ? "current-password" : "new-password";
      setStatus(elements.authStatus, "", "info");
    }

    function updateRestaurantForm() {
      elements.restaurantName.value = state.restaurant?.name || "";
      elements.restaurantSlug.value = state.restaurant?.slug || "";
      elements.publicMenuLink.textContent = state.restaurant
        ? `${window.location.origin}${window.location.pathname}?menu=${state.restaurant.id}`
        : "Spara en restaurang fÃ¶r att fÃ¥ din lÃ¤nk.";
    }

    function renderCategoryOptions() {
      const currentValue = elements.menuItemCategory.value;
      const options = ['<option value="">VÃ¤lj kategori</option>']
        .concat(
          state.categories.map((category) =>
            `<option value="${category.id}">${escapeHtml(category.name)}</option>`
          )
        )
        .join("");

      elements.menuItemCategory.innerHTML = options;

      if (state.categories.some((category) => String(category.id) === String(currentValue))) {
        elements.menuItemCategory.value = currentValue;
      }
    }

    function renderCategories() {
      renderCategoryOptions();

      if (!state.categories.length) {
        elements.categoryList.innerHTML = `
          <div class="empty-state">
            Inga kategorier Ã¤nnu. LÃ¤gg till din fÃ¶rsta kategori fÃ¶r att bÃ¶rja strukturera menyn.
          </div>
        `;
        return;
      }

      elements.categoryList.innerHTML = state.categories.map((category) => `
        <div class="category-item">
          <div>
            <div class="category-name">${escapeHtml(category.name)}</div>
            <div class="muted">Sortering: ${category.sort_order ?? 0}</div>
          </div>
          <button class="btn btn-link" type="button" data-delete-category="${category.id}">
            Ta bort
          </button>
        </div>
      `).join("");
    }

    function renderMenuItems() {
      if (!state.menuItems.length) {
        elements.menuItemList.innerHTML = `
          <div class="empty-state">
            Inga matrÃ¤tter Ã¤nnu. LÃ¤gg till din fÃ¶rsta rÃ¤tt i formulÃ¤ret ovan.
          </div>
        `;
        return;
      }

      elements.menuItemList.innerHTML = state.menuItems.map((item) => `
        <article class="menu-item-card">
          <div class="menu-item-top">
            <div>
              <h3 class="menu-item-title">${escapeHtml(item.name)}</h3>
              <div class="menu-item-meta">
                <span class="badge">${escapeHtml(item.category_name || "Utan kategori")}</span>
                <span class="pill ${item.is_active ? "pill-active" : "pill-inactive"}">
                  ${item.is_active ? "Aktiv" : "Inaktiv"}
                </span>
              </div>
            </div>
            <strong>${formatPrice(item.price)}</strong>
          </div>
          <p>${escapeHtml(item.description || "Ingen beskrivning Ã¤nnu.")}</p>
          <div class="menu-item-actions">
            <button class="btn btn-secondary" type="button" data-edit-item="${item.id}">Redigera</button>
            <button class="btn btn-danger" type="button" data-delete-item="${item.id}">Ta bort</button>
          </div>
        </article>
      `).join("");
    }

    function renderPublicMenu(restaurant, categories, menuItems) {
      elements.publicRestaurantName.textContent = restaurant?.name || "Restaurang";
      elements.publicMenuDescription.textContent = restaurant
        ? "VÃ¤lkommen. HÃ¤r ser du restaurangens aktuella meny."
        : "Den hÃ¤r menyn kunde inte laddas.";

      if (!restaurant) {
        setStatus(elements.publicMenuStatus, "Ingen meny hittades fÃ¶r den hÃ¤r lÃ¤nken.", "error");
        elements.publicMenuContent.innerHTML = "";
        return;
      }

      const groupedItems = categories.map((category) => ({
        category,
        items: menuItems.filter((item) => String(item.category_id) === String(category.id) && item.is_active)
      })).filter((group) => group.items.length > 0);

      if (!groupedItems.length) {
        setStatus(elements.publicMenuStatus, "Menyn Ã¤r publicerad men innehÃ¥ller inga aktiva matrÃ¤tter Ã¤nnu.", "info");
        elements.publicMenuContent.innerHTML = '<div class="empty-state">Inga aktiva matrÃ¤tter att visa just nu.</div>';
        return;
      }

      setStatus(elements.publicMenuStatus, "", "info");
      elements.publicMenuContent.innerHTML = groupedItems.map(({ category, items }) => `
        <section class="public-category">
          <h2>${escapeHtml(category.name)}</h2>
          ${items.map((item) => `
            <article class="public-item">
              <div class="public-item-head">
                <h3>${escapeHtml(item.name)}</h3>
                <div class="public-price">${formatPrice(item.price)}</div>
              </div>
              <p>${escapeHtml(item.description || "")}</p>
            </article>
          `).join("")}
        </section>
      `).join("");
    }

    function resetMenuItemForm() {
      state.editingItemId = null;
      elements.menuItemForm.reset();
      elements.menuItemId.value = "";
      elements.menuItemActive.value = "true";
      elements.menuItemSubmitButton.textContent = "Spara matrÃ¤tt";
      elements.cancelEditButton.classList.add("hidden");
    }

    function fillMenuItemForm(itemId) {
      const item = state.menuItems.find((entry) => String(entry.id) === String(itemId));
      if (!item) return;

      state.editingItemId = item.id;
      elements.menuItemId.value = item.id;
      elements.menuItemName.value = item.name;
      elements.menuItemDescription.value = item.description || "";
      elements.menuItemPrice.value = item.price;
      elements.menuItemCategory.value = item.category_id || "";
      elements.menuItemActive.value = item.is_active ? "true" : "false";
      elements.menuItemSubmitButton.textContent = "Uppdatera matrÃ¤tt";
      elements.cancelEditButton.classList.remove("hidden");
      elements.menuItemName.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function escapeHtml(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function ensureSupabase() {
      if (supabase) return true;
      const message = "Fyll i SUPABASE_URL och SUPABASE_ANON_KEY i index.html fÃ¶r att aktivera inloggning och datalagring.";
      setStatus(elements.authStatus, message, "info");
      setStatus(elements.dashboardStatus, message, "info");
      return false;
    }

    async function fetchRestaurantData() {
      if (!ensureSupabase() || !state.user) return;

      setStatus(elements.dashboardStatus, "Laddar din restaurangdata...", "info");

      const { data: restaurant, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", state.user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (restaurantError) {
        setStatus(elements.dashboardStatus, restaurantError.message, "error");
        return;
      }

      state.restaurant = restaurant;
      updateRestaurantForm();

      if (!state.restaurant) {
        state.categories = [];
        state.menuItems = [];
        renderCategories();
        renderMenuItems();
        setStatus(elements.dashboardStatus, "Ingen restaurang hittades Ã¤nnu. Skapa en fÃ¶r att bÃ¶rja.", "info");
        return;
      }

      const [{ data: categories, error: categoriesError }, { data: menuItems, error: menuItemsError }] = await Promise.all([
        supabase
          .from("categories")
          .select("*")
          .eq("restaurant_id", state.restaurant.id)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase
          .from("menu_items")
          .select("*, categories(name)")
          .eq("restaurant_id", state.restaurant.id)
          .order("created_at", { ascending: false })
      ]);

      if (categoriesError) {
        setStatus(elements.dashboardStatus, categoriesError.message, "error");
        return;
      }

      if (menuItemsError) {
        setStatus(elements.dashboardStatus, menuItemsError.message, "error");
        return;
      }

      state.categories = categories || [];
      state.menuItems = (menuItems || []).map((item) => ({
        ...item,
        category_name: item.categories?.name || ""
      }));

      renderCategories();
      renderMenuItems();
      resetMenuItemForm();
      setStatus(elements.dashboardStatus, "Dashboard uppdaterad.", "success");
    }

    async function handleAuthSubmit(event) {
      event.preventDefault();
      if (!ensureSupabase()) return;

      const email = elements.authEmail.value.trim();
      const password = elements.authPassword.value;

      setStatus(elements.authStatus, "Bearbetar...", "info");

      const action = state.authMode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

      const { data, error } = await action;

      if (error) {
        setStatus(elements.authStatus, error.message, "error");
        return;
      }

      if (state.authMode === "signup" && !data.session) {
        setStatus(elements.authStatus, "Kontot skapades. Kontrollera din e-post fÃ¶r att bekrÃ¤fta kontot innan du loggar in.", "success");
        return;
      }

      setStatus(elements.authStatus, "Inloggning lyckades.", "success");
      await initializeApp();
    }

    async function handleRestaurantSubmit(event) {
      event.preventDefault();
      if (!ensureSupabase() || !state.user) return;

      const name = elements.restaurantName.value.trim();
      const slugInput = elements.restaurantSlug.value.trim();
      const slug = slugify(slugInput || name);

      if (!name) {
        setStatus(elements.dashboardStatus, "Ange ett restaurangnamn.", "error");
        return;
      }

      setStatus(elements.dashboardStatus, "Sparar restaurang...", "info");

      const payload = {
        owner_id: state.user.id,
        name,
        slug
      };

      const query = state.restaurant
        ? supabase.from("restaurants").update(payload).eq("id", state.restaurant.id).select().single()
        : supabase.from("restaurants").insert(payload).select().single();

      const { error } = await query;

      if (error) {
        setStatus(elements.dashboardStatus, error.message, "error");
        return;
      }

      await fetchRestaurantData();
    }

    async function handleCategorySubmit(event) {
      event.preventDefault();
      if (!ensureSupabase() || !state.restaurant) {
        setStatus(elements.dashboardStatus, "Skapa och spara en restaurang fÃ¶rst.", "error");
        return;
      }

      const name = elements.categoryName.value.trim();
      const sortOrder = Number(elements.categorySortOrder.value || 0);

      if (!name) {
        setStatus(elements.dashboardStatus, "Ange ett kategorinamn.", "error");
        return;
      }

      setStatus(elements.dashboardStatus, "LÃ¤gger till kategori...", "info");

      const { error } = await supabase.from("categories").insert({
        restaurant_id: state.restaurant.id,
        name,
        sort_order: sortOrder
      });

      if (error) {
        setStatus(elements.dashboardStatus, error.message, "error");
        return;
      }

      elements.categoryForm.reset();
      elements.categorySortOrder.value = "0";
      await fetchRestaurantData();
    }

    async function handleMenuItemSubmit(event) {
      event.preventDefault();
      if (!ensureSupabase() || !state.restaurant) {
        setStatus(elements.dashboardStatus, "Skapa och spara en restaurang fÃ¶rst.", "error");
        return;
      }

      const payload = {
        restaurant_id: state.restaurant.id,
        category_id: elements.menuItemCategory.value,
        name: elements.menuItemName.value.trim(),
        description: elements.menuItemDescription.value.trim(),
        price: Number(elements.menuItemPrice.value || 0),
        is_active: elements.menuItemActive.value === "true"
      };

      if (!payload.name || !payload.category_id) {
        setStatus(elements.dashboardStatus, "Fyll i namn och kategori fÃ¶r matrÃ¤tten.", "error");
        return;
      }

      setStatus(elements.dashboardStatus, state.editingItemId ? "Uppdaterar matrÃ¤tt..." : "Sparar matrÃ¤tt...", "info");

      const query = state.editingItemId
        ? supabase.from("menu_items").update(payload).eq("id", state.editingItemId)
        : supabase.from("menu_items").insert(payload);

      const { error } = await query;

      if (error) {
        setStatus(elements.dashboardStatus, error.message, "error");
        return;
      }

      await fetchRestaurantData();
    }

    async function deleteCategory(categoryId) {
      if (!ensureSupabase()) return;

      const hasItems = state.menuItems.some((item) => String(item.category_id) === String(categoryId));
      if (hasItems) {
        setStatus(elements.dashboardStatus, "Ta bort eller flytta matrÃ¤tterna i kategorin fÃ¶rst.", "error");
        return;
      }

      setStatus(elements.dashboardStatus, "Tar bort kategori...", "info");
      const { error } = await supabase.from("categories").delete().eq("id", categoryId);

      if (error) {
        setStatus(elements.dashboardStatus, error.message, "error");
        return;
      }

      await fetchRestaurantData();
    }

    async function deleteMenuItem(itemId) {
      if (!ensureSupabase()) return;

      setStatus(elements.dashboardStatus, "Tar bort matrÃ¤tt...", "info");
      const { error } = await supabase.from("menu_items").delete().eq("id", itemId);

      if (error) {
        setStatus(elements.dashboardStatus, error.message, "error");
        return;
      }

      await fetchRestaurantData();
    }

    async function loadPublicMenu(restaurantId) {
      showView("publicMenu");

      if (!ensureSupabase()) {
        setStatus(elements.publicMenuStatus, "Fyll i Supabase-konfigurationen i index.html fÃ¶r att visa publika menyer.", "info");
        elements.publicRestaurantName.textContent = "Konfiguration saknas";
        elements.publicMenuContent.innerHTML = "";
        return;
      }

      setStatus(elements.publicMenuStatus, "HÃ¤mtar menyn...", "info");
      elements.publicMenuContent.innerHTML = "";

      const { data: restaurant, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId)
        .maybeSingle();

      if (restaurantError || !restaurant) {
        renderPublicMenu(null, [], []);
        return;
      }

      const [{ data: categories, error: categoriesError }, { data: menuItems, error: menuItemsError }] = await Promise.all([
        supabase
          .from("categories")
          .select("*")
          .eq("restaurant_id", restaurant.id)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase
          .from("menu_items")
          .select("*")
          .eq("restaurant_id", restaurant.id)
          .order("created_at", { ascending: true })
      ]);

      if (categoriesError || menuItemsError) {
        setStatus(elements.publicMenuStatus, categoriesError?.message || menuItemsError?.message, "error");
        return;
      }

      renderPublicMenu(restaurant, categories || [], menuItems || []);
    }

    async function handleLogout() {
      if (!supabase) return;
      await supabase.auth.signOut();
      state.user = null;
      state.restaurant = null;
      state.categories = [];
      state.menuItems = [];
      showView("landing");
    }

    async function initializeApp() {
      const params = new URLSearchParams(window.location.search);
      const publicMenuId = params.get("menu");

      if (publicMenuId) {
        await loadPublicMenu(publicMenuId);
        return;
      }

      if (!supabase) {
        showView("landing");
        return;
      }

      const [{ data: sessionData }] = await Promise.all([
        supabase.auth.getSession()
      ]);

      state.user = sessionData.session?.user || null;

      if (!state.authSubscriptionInitialized) {
        supabase.auth.onAuthStateChange(async (_event, session) => {
          state.user = session?.user || null;
          if (state.user) {
            elements.userEmailLabel.textContent = state.user.email || "-";
            showView("dashboard");
            await fetchRestaurantData();
          } else {
            elements.userEmailLabel.textContent = "-";
            showView("landing");
          }
        });
        state.authSubscriptionInitialized = true;
      }

      if (state.user) {
        elements.userEmailLabel.textContent = state.user.email || "-";
        showView("dashboard");
        await fetchRestaurantData();
      } else {
        showView("landing");
      }
    }

    function wireEvents() {
      elements.brandLogo.addEventListener("error", () => {
        elements.brandLogo.classList.add("hidden");
        elements.brandFallback.classList.remove("hidden");
      });

      elements.navHomeButton.addEventListener("click", () => {
        history.replaceState({}, "", window.location.pathname);
        showView("landing");
      });

      elements.navDashboardButton.addEventListener("click", async () => {
        history.replaceState({}, "", window.location.pathname);
        showView("dashboard");
        await fetchRestaurantData();
      });

      elements.navAuthButton.addEventListener("click", () => {
        setAuthMode("login");
        showView("auth");
      });
      elements.navSignupButton.addEventListener("click", () => {
        setAuthMode("signup");
        showView("auth");
      });
      elements.navLogoutButton.addEventListener("click", handleLogout);

      document.addEventListener("click", (event) => {
        const authButton = event.target.closest("[data-go-auth]");
        if (authButton) {
          setAuthMode(authButton.dataset.goAuth);
          showView("auth");
          return;
        }

        const demoButton = event.target.closest("[data-scroll-demo]");
        if (demoButton) {
          document.getElementById("demoSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });

      elements.loginTab.addEventListener("click", () => setAuthMode("login"));
      elements.signupTab.addEventListener("click", () => setAuthMode("signup"));
      elements.authForm.addEventListener("submit", handleAuthSubmit);
      elements.restaurantForm.addEventListener("submit", handleRestaurantSubmit);
      elements.categoryForm.addEventListener("submit", handleCategorySubmit);
      elements.menuItemForm.addEventListener("submit", handleMenuItemSubmit);
      elements.cancelEditButton.addEventListener("click", resetMenuItemForm);

      elements.restaurantName.addEventListener("input", (event) => {
        if (!elements.restaurantSlug.value || elements.restaurantSlug.value === slugify(state.restaurant?.name || "")) {
          elements.restaurantSlug.value = slugify(event.target.value);
        }
      });

      elements.copyLinkButton.addEventListener("click", async () => {
        if (!state.restaurant) {
          setStatus(elements.dashboardStatus, "Spara restaurangen fÃ¶rst fÃ¶r att fÃ¥ en lÃ¤nk.", "error");
          return;
        }

        const link = `${window.location.origin}${window.location.pathname}?menu=${state.restaurant.id}`;
        try {
          await navigator.clipboard.writeText(link);
          setStatus(elements.dashboardStatus, "LÃ¤nken kopierades till urklipp.", "success");
        } catch (_error) {
          setStatus(elements.dashboardStatus, "Kunde inte kopiera lÃ¤nken automatiskt. Kopiera den manuellt.", "error");
        }
      });

      elements.categoryList.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-delete-category]");
        if (!button) return;
        await deleteCategory(button.dataset.deleteCategory);
      });

      elements.menuItemList.addEventListener("click", async (event) => {
        const editButton = event.target.closest("[data-edit-item]");
        const deleteButton = event.target.closest("[data-delete-item]");

        if (editButton) {
          fillMenuItemForm(editButton.dataset.editItem);
        }

        if (deleteButton) {
          await deleteMenuItem(deleteButton.dataset.deleteItem);
        }
      });
    }

    wireEvents();
    setAuthMode("login");
    initializeApp();
