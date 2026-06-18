<template>
  <main class="shop-page">
    <div class="page-shell">
      <!-- ─── Loading ────────────────────────────────────────────────────── -->
      <div v-if="store.loading" class="loading-state">
        <svg viewBox="0 0 24 24" class="loading-icon spinning" aria-hidden="true">
          <path :d="mdiLoading" />
        </svg>
        {{ t('shop.loading') }}
      </div>

      <template v-else>
        <!-- ─── Hero ──────────────────────────────────────────────────────── -->
        <header class="page-hero">
          <div>
            <span class="page-badge">{{ t('shop.badge') }}</span>
            <h1 class="page-title">{{ t('shop.title') }}</h1>
            <p class="page-subtitle">{{ t('shop.subtitle') }}</p>

            <div class="hero-actions">
              <button type="button" class="btn btn--primary" @click="showTopUp = true">
                <svg viewBox="0 0 24 24" class="btn-icon" aria-hidden="true">
                  <path :d="mdiPlusCircleOutline" />
                </svg>
                {{ t('shop.wallet.topup') }}
              </button>
              <router-link to="/inventory" class="btn btn--ghost">
                <svg viewBox="0 0 24 24" class="btn-icon" aria-hidden="true">
                  <path :d="mdiPackageVariantClosed" />
                </svg>
                {{ t('shop.goToInventory') }}
              </router-link>
            </div>
          </div>

          <aside class="hero-side">
            <div>
              <div class="hero-side__label">{{ t('shop.wallet.label') }}</div>
              <div class="hero-side__title">{{ t('shop.wallet.title') }}</div>
              <p class="hero-side__text">{{ t('shop.wallet.text') }}</p>
            </div>
            <div class="wallet-chips">
              <div class="wallet-chip wallet-chip--soft">
                <span class="wallet-chip__label">{{ t('shop.wallet.soft') }}</span>
                <strong class="wallet-chip__val">{{
                  store.wallet.soft.toLocaleString(locale)
                }}</strong>
              </div>
              <div class="wallet-chip wallet-chip--hard">
                <span class="wallet-chip__label">{{ t('shop.wallet.hard') }}</span>
                <strong class="wallet-chip__val">{{
                  store.wallet.hard.toLocaleString(locale)
                }}</strong>
              </div>
            </div>
          </aside>
        </header>

        <!-- ─── KPIs ──────────────────────────────────────────────────────── -->
        <section class="stat-grid shop-stat-grid">
          <article class="stat-card">
            <span class="stat-card__label">{{ t('shop.stats.items') }}</span>
            <span class="stat-card__value">{{ store.availableItems.length }}</span>
            <span class="stat-card__caption">{{ t('shop.stats.itemsCaption') }}</span>
          </article>
          <article class="stat-card">
            <span class="stat-card__label">{{ t('shop.stats.bundles') }}</span>
            <span class="stat-card__value">{{ store.availableBundles.length }}</span>
            <span class="stat-card__caption">{{ t('shop.stats.bundlesCaption') }}</span>
          </article>
          <article class="stat-card">
            <span class="stat-card__label">{{ t('shop.stats.soft') }}</span>
            <span class="stat-card__value">{{ store.wallet.soft.toLocaleString(locale) }}</span>
            <span class="stat-card__caption">{{ t('shop.stats.softCaption') }}</span>
          </article>
          <article class="stat-card">
            <span class="stat-card__label">{{ t('shop.stats.hard') }}</span>
            <span class="stat-card__value">{{ store.wallet.hard.toLocaleString(locale) }}</span>
            <span class="stat-card__caption">{{ t('shop.stats.hardCaption') }}</span>
          </article>
        </section>

        <!-- ─── Nav tabs ──────────────────────────────────────────────────── -->
        <nav class="section-nav">
          <button
            v-for="tab in TABS"
            :key="tab.id"
            type="button"
            :class="['section-tab', activeTab === tab.id && 'section-tab--active']"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </nav>

        <!-- ══ TAB BOUTIQUE ══════════════════════════════════════════════════ -->
        <template v-if="activeTab === 'boutique'">
          <!-- Featured bundle -->
          <section v-if="store.featuredBundle" class="surface featured-surface">
            <div class="featured-img-wrap">
              <img
                :src="picsumUrl(store.featuredBundle.imageSeed, 640, 320)"
                :alt="store.featuredBundle.name"
                class="featured-img"
              />
              <div class="featured-img__overlay"></div>
              <div class="featured-img__meta">
                <span v-if="store.featuredBundle.badge" class="item-badge">
                  {{ store.featuredBundle.badge }}
                </span>
                <span v-if="store.featuredBundle.expiresAt" class="timer-chip">
                  <svg viewBox="0 0 24 24" class="timer-chip__icon" aria-hidden="true">
                    <path :d="mdiTimerOutline" />
                  </svg>
                  {{ formatTimeLeft(store.featuredBundle.expiresAt) }}
                </span>
              </div>
            </div>

            <div class="featured-body">
              <div class="featured-body__left">
                <h2 class="surface-title">{{ store.featuredBundle.name }}</h2>
                <p class="surface-subtitle">{{ store.featuredBundle.description }}</p>
                <div class="bundle-items-row">
                  <div
                    v-for="id in store.featuredBundle.itemIds"
                    :key="id"
                    :class="[
                      'bundle-item-chip',
                      `rarity--${store.getItemById(id)?.rarity}`,
                      store.isOwned(id) && 'bundle-item-chip--owned',
                    ]"
                  >
                    <img
                      :src="picsumUrl(store.getItemById(id)?.imageSeed ?? 'x', 40, 40)"
                      :alt="store.getItemById(id)?.name"
                      class="bundle-item-chip__img"
                    />
                    <span class="bundle-item-chip__name">{{ store.getItemById(id)?.name }}</span>
                    <svg
                      v-if="store.isOwned(id)"
                      viewBox="0 0 24 24"
                      class="owned-check"
                      aria-hidden="true"
                    >
                      <path :d="mdiCheck" />
                    </svg>
                  </div>
                </div>
              </div>

              <div class="featured-body__right">
                <div class="pricing-block">
                  <span class="saving-badge"
                    >-{{ savingPct(store.featuredBundle) }}% {{ t('shop.bundle.saving') }}</span
                  >
                  <div class="pricing-block__prices">
                    <span class="price-original"
                      >{{ store.featuredBundle.originalPrice.toLocaleString(locale) }} ◈</span
                    >
                    <strong class="price-final"
                      >{{ store.featuredBundle.bundlePrice.toLocaleString(locale) }}
                      <span class="price-cur">◈</span></strong
                    >
                  </div>
                </div>
                <button
                  type="button"
                  class="btn btn--primary"
                  :disabled="!canAffordBundle(store.featuredBundle)"
                  @click="openBundlePurchase(store.featuredBundle)"
                >
                  {{
                    canAffordBundle(store.featuredBundle)
                      ? t('shop.bundle.buy')
                      : t('shop.item.insufficient')
                  }}
                </button>
              </div>
            </div>
          </section>

          <!-- Bundles grid -->
          <section class="surface">
            <div class="surface-header">
              <div>
                <h2 class="surface-title">{{ t('shop.section.bundles') }}</h2>
                <p class="surface-subtitle">
                  {{ t('shop.section.bundlesSubtitle', { count: store.availableBundles.length }) }}
                </p>
              </div>
              <button type="button" class="btn btn--ghost" @click="activeTab = 'bundles'">
                {{ t('shop.seeAll') }}
                <svg viewBox="0 0 24 24" class="btn-icon" aria-hidden="true">
                  <path :d="mdiChevronRight" />
                </svg>
              </button>
            </div>

            <div class="bundles-grid">
              <article
                v-for="bundle in store.availableBundles.slice(0, 4)"
                :key="bundle.id"
                class="bundle-card"
                @click="openBundlePurchase(bundle)"
              >
                <div class="bundle-card__img-wrap">
                  <img
                    :src="picsumUrl(bundle.imageSeed, 400, 200)"
                    :alt="bundle.name"
                    class="bundle-card__img"
                  />
                  <div class="bundle-card__img-overlay"></div>
                  <span v-if="bundle.badge" class="item-badge item-badge--abs">{{
                    bundle.badge
                  }}</span>
                  <span v-if="bundle.expiresAt" class="timer-chip timer-chip--abs">
                    <svg viewBox="0 0 24 24" class="timer-chip__icon" aria-hidden="true">
                      <path :d="mdiTimerOutline" />
                    </svg>
                    {{ formatTimeLeft(bundle.expiresAt) }}
                  </span>
                </div>
                <div class="bundle-card__body">
                  <h3 class="bundle-card__name">{{ bundle.name }}</h3>
                  <div class="bundle-card__items-row">
                    <img
                      v-for="id in bundle.itemIds.slice(0, 4)"
                      :key="id"
                      :src="picsumUrl(store.getItemById(id)?.imageSeed ?? 'x', 28, 28)"
                      :alt="store.getItemById(id)?.name"
                      class="bundle-card__item-thumb"
                      :title="store.getItemById(id)?.name"
                    />
                    <span v-if="bundle.itemIds.length > 4" class="bundle-card__more">
                      +{{ bundle.itemIds.length - 4 }}
                    </span>
                  </div>
                  <div class="bundle-card__footer">
                    <div>
                      <span class="price-original price-original--sm"
                        >{{ bundle.originalPrice.toLocaleString(locale) }} ◈</span
                      >
                      <strong class="bundle-card__price"
                        >{{ bundle.bundlePrice.toLocaleString(locale) }} ◈</strong
                      >
                    </div>
                    <span class="saving-badge saving-badge--sm">-{{ savingPct(bundle) }}%</span>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <!-- Featured items -->
          <section class="surface">
            <div class="surface-header">
              <div>
                <h2 class="surface-title">{{ t('shop.section.featured') }}</h2>
                <p class="surface-subtitle">{{ t('shop.section.featuredSubtitle') }}</p>
              </div>
              <button type="button" class="btn btn--ghost" @click="activeTab = 'catalogue'">
                {{ t('shop.seeAll') }}
                <svg viewBox="0 0 24 24" class="btn-icon" aria-hidden="true">
                  <path :d="mdiChevronRight" />
                </svg>
              </button>
            </div>
            <div class="items-grid">
              <article
                v-for="item in store.items.filter((i) => i.isFeatured || i.isNew).slice(0, 6)"
                :key="item.id"
                :class="[
                  'item-card',
                  `rarity--${item.rarity}`,
                  store.isOwned(item.id) && 'item-card--owned',
                ]"
                @click="!store.isOwned(item.id) && openItemPurchase(item)"
              >
                <div :class="['item-card__rarity-bar', `rarity-bar--${item.rarity}`]"></div>
                <span v-if="item.isNew" class="new-badge">{{ t('shop.new') }}</span>
                <div class="item-card__img-wrap">
                  <img
                    :src="picsumUrl(item.imageSeed, 200, 200)"
                    :alt="item.name"
                    class="item-card__img"
                  />
                  <div v-if="store.isOwned(item.id)" class="item-owned-overlay">
                    <svg viewBox="0 0 24 24" class="owned-check owned-check--lg" aria-hidden="true">
                      <path :d="mdiCheck" />
                    </svg>
                  </div>
                </div>
                <div class="item-card__body">
                  <div class="item-card__top">
                    <strong class="item-card__name">{{ item.name }}</strong>
                    <span :class="['rarity-dot', `rarity-dot--${item.rarity}`]"></span>
                  </div>
                  <div class="item-card__bottom">
                    <span v-if="!store.isOwned(item.id)" class="item-price">
                      {{ item.price.toLocaleString(locale) }}
                      <span :class="['cur-sym', `cur-sym--${item.currency}`]">
                        {{ item.currency === 'soft' ? '◇' : '◈' }}
                      </span>
                    </span>
                    <span v-else class="owned-chip">
                      <svg viewBox="0 0 24 24" class="owned-chip__icon" aria-hidden="true">
                        <path :d="mdiCheck" />
                      </svg>
                      {{ t('shop.item.owned') }}
                    </span>
                    <button
                      v-if="!store.isOwned(item.id)"
                      type="button"
                      :class="['btn-buy', canAfford(item) ? 'btn-buy--ok' : 'btn-buy--broke']"
                    >
                      {{ canAfford(item) ? t('shop.item.buy') : t('shop.item.insufficient') }}
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </template>

        <!-- ══ TAB BUNDLES ═══════════════════════════════════════════════════ -->
        <template v-if="activeTab === 'bundles'">
          <section class="surface">
            <div class="surface-header">
              <div>
                <h2 class="surface-title">{{ t('shop.tabs.bundles') }}</h2>
                <p class="surface-subtitle">
                  {{ t('shop.section.bundlesSubtitle', { count: store.availableBundles.length }) }}
                </p>
              </div>
            </div>
            <div class="bundles-full-grid">
              <article
                v-for="bundle in store.availableBundles"
                :key="bundle.id"
                class="bundle-full-card"
              >
                <div class="bundle-full-card__img-wrap">
                  <img
                    :src="picsumUrl(bundle.imageSeed, 680, 280)"
                    :alt="bundle.name"
                    class="bundle-full-card__img"
                  />
                  <div class="bundle-card__img-overlay"></div>
                  <span v-if="bundle.badge" class="item-badge item-badge--abs">{{
                    bundle.badge
                  }}</span>
                  <span v-if="bundle.expiresAt" class="timer-chip timer-chip--abs">
                    <svg viewBox="0 0 24 24" class="timer-chip__icon" aria-hidden="true">
                      <path :d="mdiTimerOutline" />
                    </svg>
                    {{ formatTimeLeft(bundle.expiresAt) }}
                  </span>
                  <span class="saving-badge saving-badge--img">-{{ savingPct(bundle) }}%</span>
                </div>
                <div class="bundle-full-card__body">
                  <div class="bundle-full-card__head">
                    <h3 class="surface-title" style="font-size: 1.1rem">{{ bundle.name }}</h3>
                    <p class="surface-subtitle" style="margin-top: 0.25rem">
                      {{ bundle.description }}
                    </p>
                  </div>
                  <div class="bundle-full-items">
                    <div
                      v-for="id in bundle.itemIds"
                      :key="id"
                      :class="[
                        'bundle-full-item',
                        `rarity--${store.getItemById(id)?.rarity}`,
                        store.isOwned(id) && 'bundle-full-item--owned',
                      ]"
                    >
                      <img
                        :src="picsumUrl(store.getItemById(id)?.imageSeed ?? 'x', 48, 48)"
                        :alt="store.getItemById(id)?.name"
                        class="bundle-full-item__img"
                      />
                      <span class="bundle-full-item__name">{{ store.getItemById(id)?.name }}</span>
                      <span
                        :class="['rarity-dot', `rarity-dot--${store.getItemById(id)?.rarity}`]"
                      ></span>
                      <svg
                        v-if="store.isOwned(id)"
                        viewBox="0 0 24 24"
                        class="owned-check owned-check--sm"
                        aria-hidden="true"
                      >
                        <path :d="mdiCheck" />
                      </svg>
                    </div>
                  </div>
                  <div class="bundle-full-card__footer">
                    <div class="pricing-block">
                      <div class="pricing-block__prices">
                        <span class="price-original"
                          >{{ bundle.originalPrice.toLocaleString(locale) }} ◈</span
                        >
                        <strong class="price-final"
                          >{{ bundle.bundlePrice.toLocaleString(locale) }}
                          <span class="price-cur">◈</span></strong
                        >
                      </div>
                    </div>
                    <button
                      type="button"
                      class="btn btn--primary"
                      :disabled="!canAffordBundle(bundle)"
                      @click="openBundlePurchase(bundle)"
                    >
                      {{
                        canAffordBundle(bundle) ? t('shop.bundle.buy') : t('shop.item.insufficient')
                      }}
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </template>

        <!-- ══ TAB CATALOGUE ═════════════════════════════════════════════════ -->
        <template v-if="activeTab === 'catalogue'">
          <section class="surface">
            <div class="surface-header">
              <div>
                <h2 class="surface-title">{{ t('shop.tabs.catalogue') }}</h2>
                <p class="surface-subtitle">
                  {{ filteredItems.length }} {{ t('shop.stats.itemsCaption') }}
                </p>
              </div>
              <Transition name="fade-btn">
                <button
                  v-if="hasActiveFilters"
                  type="button"
                  class="btn btn--ghost"
                  @click="resetFilters"
                >
                  <svg viewBox="0 0 24 24" class="btn-icon" aria-hidden="true">
                    <path :d="mdiFilterRemove" />
                  </svg>
                  {{ t('shop.filters.reset') }}
                </button>
              </Transition>
            </div>

            <div class="toolbar shop-toolbar">
              <div class="search-field">
                <svg viewBox="0 0 24 24" class="search-field__icon" aria-hidden="true">
                  <path :d="mdiMagnify" />
                </svg>
                <input
                  v-model="search"
                  type="search"
                  class="field"
                  :placeholder="t('shop.search.placeholder')"
                />
              </div>
              <select v-model="selectedCategory" class="select">
                <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">
                  {{ c.label }}
                </option>
              </select>
              <select v-model="selectedCurrency" class="select">
                <option v-for="c in CURRENCIES_FILTER" :key="c.value" :value="c.value">
                  {{ c.label }}
                </option>
              </select>
              <select v-model="selectedRarity" class="select">
                <option v-for="r in RARITIES" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </div>

            <div v-if="filteredItems.length" class="items-grid items-grid--catalogue">
              <article
                v-for="item in filteredItems"
                :key="item.id"
                :class="[
                  'item-card',
                  `rarity--${item.rarity}`,
                  store.isOwned(item.id) && 'item-card--owned',
                ]"
                @click="!store.isOwned(item.id) && openItemPurchase(item)"
              >
                <div :class="['item-card__rarity-bar', `rarity-bar--${item.rarity}`]"></div>
                <span v-if="item.isNew" class="new-badge">{{ t('shop.new') }}</span>
                <div class="item-card__img-wrap">
                  <img
                    :src="picsumUrl(item.imageSeed, 200, 200)"
                    :alt="item.name"
                    class="item-card__img"
                  />
                  <div v-if="store.isOwned(item.id)" class="item-owned-overlay">
                    <svg viewBox="0 0 24 24" class="owned-check owned-check--lg" aria-hidden="true">
                      <path :d="mdiCheck" />
                    </svg>
                  </div>
                </div>
                <div class="item-card__body">
                  <div class="item-card__top">
                    <strong class="item-card__name">{{ item.name }}</strong>
                    <span :class="['rarity-dot', `rarity-dot--${item.rarity}`]"></span>
                  </div>
                  <div class="item-card__bottom">
                    <span v-if="!store.isOwned(item.id)" class="item-price">
                      {{ item.price.toLocaleString(locale) }}
                      <span :class="['cur-sym', `cur-sym--${item.currency}`]">{{
                        item.currency === 'soft' ? '◇' : '◈'
                      }}</span>
                    </span>
                    <span v-else class="owned-chip">
                      <svg viewBox="0 0 24 24" class="owned-chip__icon" aria-hidden="true">
                        <path :d="mdiCheck" />
                      </svg>
                      {{ t('shop.item.owned') }}
                    </span>
                    <button
                      v-if="!store.isOwned(item.id)"
                      type="button"
                      :class="['btn-buy', canAfford(item) ? 'btn-buy--ok' : 'btn-buy--broke']"
                    >
                      {{ canAfford(item) ? t('shop.item.buy') : '—' }}
                    </button>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="empty-state">
              <h3 class="empty-state__title">{{ t('shop.empty.title') }}</h3>
              <p class="empty-state__text">{{ t('shop.empty.text') }}</p>
            </div>
          </section>
        </template>
      </template>
    </div>

    <!-- ─── Modal: item ───────────────────────────────────────────────── -->\
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="purchaseItem" class="modal-backdrop" @click.self="purchaseItem = null">
          <div class="modal-box">
            <button type="button" class="modal-close" @click="purchaseItem = null">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiClose" /></svg>
            </button>
            <div :class="['modal-rarity-bar', `rarity-bar--${purchaseItem.rarity}`]"></div>
            <div class="modal-img-wrap">
              <img
                :src="picsumUrl(purchaseItem.imageSeed, 280, 200)"
                :alt="purchaseItem.name"
                class="modal-img"
              />
            </div>
            <div class="modal-body">
              <span :class="['rarity-pill', `rarity-pill--${purchaseItem.rarity}`]">{{
                t(`shop.rarity.${purchaseItem.rarity}`)
              }}</span>
              <h3 class="modal-title">{{ purchaseItem.name }}</h3>
              <p class="modal-meta">
                {{
                  purchaseItem.slot
                    ? t(`shop.slots.${purchaseItem.slot}`)
                    : t(`shop.categories.${purchaseItem.category}`)
                }}
              </p>
              <div class="modal-price-row">
                <strong class="price-final" style="font-size: 1.6rem">{{
                  purchaseItem.price.toLocaleString(locale)
                }}</strong>
                <span
                  :class="['cur-sym', `cur-sym--${purchaseItem.currency}`]"
                  style="font-size: 1.2rem"
                  >{{ purchaseItem.currency === 'soft' ? '◇' : '◈' }}</span
                >
                <span class="modal-balance"
                  >/
                  {{
                    (purchaseItem.currency === 'soft'
                      ? store.wallet.soft
                      : store.wallet.hard
                    ).toLocaleString(locale)
                  }}
                  {{ t('shop.wallet.' + purchaseItem.currency) }}</span
                >
              </div>
              <div
                v-if="purchaseFeedback"
                :class="['feedback-banner', `feedback-banner--${purchaseFeedback.type}`]"
              >
                {{ purchaseFeedback.message }}
              </div>
              <div
                v-if="!purchaseFeedback || purchaseFeedback.type === 'error'"
                class="modal-actions"
              >
                <button type="button" class="btn btn--ghost" @click="purchaseItem = null">
                  {{ t('shop.purchase.cancel') }}
                </button>
                <button
                  type="button"
                  class="btn btn--primary"
                  :disabled="!canAfford(purchaseItem) || purchasing"
                  @click="confirmPurchase"
                >
                  {{ purchasing ? '…' : t('shop.purchase.confirm') }}
                </button>
              </div>
              <button
                v-else
                type="button"
                class="btn btn--primary"
                style="width: 100%; margin-top: 0.5rem"
                @click="purchaseItem = null"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── Modal: bundle ─────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="purchaseBundleRef" class="modal-backdrop" @click.self="purchaseBundleRef = null">
          <div class="modal-box modal-box--wide">
            <button type="button" class="modal-close" @click="purchaseBundleRef = null">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiClose" /></svg>
            </button>
            <div class="modal-img-wrap">
              <img
                :src="picsumUrl(purchaseBundleRef.imageSeed, 520, 200)"
                :alt="purchaseBundleRef.name"
                class="modal-img"
              />
              <span v-if="purchaseBundleRef.badge" class="item-badge item-badge--abs">{{
                purchaseBundleRef.badge
              }}</span>
            </div>
            <div class="modal-body">
              <h3 class="modal-title">{{ purchaseBundleRef.name }}</h3>
              <p class="modal-meta">{{ purchaseBundleRef.description }}</p>
              <div class="bundle-modal-items">
                <div
                  v-for="id in purchaseBundleRef.itemIds"
                  :key="id"
                  :class="[
                    'bmi',
                    store.isOwned(id) && 'bmi--owned',
                    `rarity--${store.getItemById(id)?.rarity}`,
                  ]"
                >
                  <img
                    :src="picsumUrl(store.getItemById(id)?.imageSeed ?? 'x', 48, 48)"
                    :alt="store.getItemById(id)?.name"
                    class="bmi__img"
                  />
                  <span class="bmi__name">{{ store.getItemById(id)?.name }}</span>
                  <svg
                    v-if="store.isOwned(id)"
                    viewBox="0 0 24 24"
                    class="owned-check owned-check--sm"
                    aria-hidden="true"
                  >
                    <path :d="mdiCheck" />
                  </svg>
                </div>
              </div>
              <div class="bundle-modal-pricing">
                <div>
                  <span class="price-original"
                    >{{ purchaseBundleRef.originalPrice.toLocaleString(locale) }} ◈</span
                  >
                  <strong class="price-final" style="display: block; font-size: 1.6rem"
                    >{{ purchaseBundleRef.bundlePrice.toLocaleString(locale) }} ◈</strong
                  >
                </div>
                <span class="saving-badge"
                  >-{{ savingPct(purchaseBundleRef) }}% {{ t('shop.bundle.saving') }}</span
                >
              </div>
              <div
                v-if="bundleFeedback"
                :class="['feedback-banner', `feedback-banner--${bundleFeedback.type}`]"
              >
                {{ bundleFeedback.message }}
              </div>
              <div v-if="!bundleFeedback || bundleFeedback.type === 'error'" class="modal-actions">
                <button type="button" class="btn btn--ghost" @click="purchaseBundleRef = null">
                  {{ t('shop.purchase.cancel') }}
                </button>
                <button
                  type="button"
                  class="btn btn--primary"
                  :disabled="!canAffordBundle(purchaseBundleRef) || purchasing"
                  @click="confirmBundlePurchase"
                >
                  {{ purchasing ? '…' : t('shop.bundle.buy') }}
                </button>
              </div>
              <button
                v-else
                type="button"
                class="btn btn--primary"
                style="width: 100%; margin-top: 0.5rem"
                @click="purchaseBundleRef = null"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── Modal: top-up ─────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showTopUp" class="modal-backdrop" @click.self="closeTopUp">
          <div class="modal-box modal-box--topup">
            <button type="button" class="modal-close" @click="closeTopUp">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiClose" /></svg>
            </button>
            <div class="modal-body">
              <span class="page-badge" style="margin-bottom: 0.75rem">{{
                t('shop.topup.badge')
              }}</span>
              <h3 class="modal-title">{{ t('shop.topup.title') }}</h3>
              <p class="modal-meta">{{ t('shop.topup.subtitle') }}</p>

              <div class="packs-grid">
                <button
                  v-for="pack in TOPUP_PACKS"
                  :key="pack.id"
                  type="button"
                  :class="[
                    'pack-card',
                    pack.id === 'popular' && 'pack-card--popular',
                    selectedPack?.id === pack.id && 'pack-card--selected',
                  ]"
                  :disabled="topupProcessing"
                  @click="selectedPack = pack"
                >
                  <span v-if="pack.id === 'popular'" class="pack-best">
                    {{ t('shop.topup.bestValue') }}
                  </span>

                  <strong class="pack-hard">
                    {{ (pack.hard + pack.bonus).toLocaleString(locale) }} ◈
                  </strong>

                  <span v-if="pack.bonus > 0" class="pack-bonus">
                    +{{ pack.bonus }} {{ t('shop.topup.bonus') }}
                  </span>

                  <span class="pack-price"> {{ pack.price.toFixed(2).replace('.', ',') }} € </span>

                  <span class="pack-label">
                    {{ t(pack.labelKey) }}
                  </span>
                </button>
              </div>

              <div
                v-if="topupFeedback"
                :class="['feedback-banner', `feedback-banner--${topupFeedback.type}`]"
              >
                {{ topupFeedback.message }}
              </div>

              <button
                type="button"
                class="btn btn--primary"
                style="width: 100%; margin-top: 0.5rem"
                :disabled="!selectedPack || topupProcessing"
                @click="doTopUp"
              >
                <svg
                  v-if="topupProcessing"
                  viewBox="0 0 24 24"
                  class="btn-icon spinning"
                  aria-hidden="true"
                >
                  <path :d="mdiLoading" />
                </svg>
                {{ topupProcessing ? t('shop.topup.processing') : t('shop.topup.simulate') }}
              </button>
              <p class="topup-disclaimer">{{ t('shop.topup.disclaimer') }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<script setup lang="ts">
import {
  mdiCheck,
  mdiChevronRight,
  mdiClose,
  mdiFilterRemove,
  mdiLoading,
  mdiMagnify,
  mdiPackageVariantClosed,
  mdiPlusCircleOutline,
  mdiTimerOutline,
} from '@mdi/js'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import {
  type Bundle,
  type ShopItem,
  TOPUP_PACKS,
  type TopUpPack,
  useShopStore,
} from '@/stores/shopStore'
import { picsumUrl, wait } from '@/stores/shopUtils'

const store = useShopStore()
const { t, locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()

function normalizeTab(value: unknown): 'boutique' | 'bundles' | 'catalogue' | null {
  if (value === 'boutique' || value === 'bundles' || value === 'catalogue') return value
  return null
}

function applyDeepLinkFromQuery(): void {
  const tab = normalizeTab(route.query.tab)
  if (tab) activeTab.value = tab

  const itemParam = route.query.item
  if (typeof itemParam !== 'string' || itemParam.trim() === '') return

  const itemId = Number(itemParam)
  if (!Number.isInteger(itemId) || itemId <= 0) return

  const targetItem = store.items.find((item) => item.id === itemId)
  if (!targetItem) return

  activeTab.value = 'catalogue'
  openItemPurchase(targetItem)

  // Clean up deep-link query after resolving it once.
  void router.replace({ path: '/shop', query: { tab: 'catalogue' } })
}

onMounted(async () => {
  if (!store.items.length) {
    await store.fetchShopState()
  }
  applyDeepLinkFromQuery()
})

// ── Clock (timer bundles) ──────────────────────────────────────────────────
const now = ref(Date.now())
let clockTimer: ReturnType<typeof setInterval>
onMounted(() => {
  clockTimer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})
onUnmounted(() => clearInterval(clockTimer))

function formatTimeLeft(expiresAt: string | null): string {
  if (!expiresAt) return ''
  const diff = new Date(expiresAt).getTime() - now.value
  if (diff <= 0) return t('shop.bundle.expired')
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return d > 0
    ? `${d}j ${h}h ${String(m).padStart(2, '0')}m`
    : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function savingPct(bundle: Bundle): number {
  if (!bundle.originalPrice) return 0
  return Math.round((1 - bundle.bundlePrice / bundle.originalPrice) * 100)
}

// ── Tabs ───────────────────────────────────────────────────────────────────
const activeTab = ref<'boutique' | 'bundles' | 'catalogue'>('boutique')
const TABS = computed(() => [
  { id: 'boutique' as const, label: t('shop.tabs.boutique') },
  { id: 'bundles' as const, label: t('shop.tabs.bundles') },
  { id: 'catalogue' as const, label: t('shop.tabs.catalogue') },
])

// ── Filtres catalogue ──────────────────────────────────────────────────────
const search = ref('')
const selectedCategory = ref('all')
const selectedCurrency = ref('all')
const selectedRarity = ref('all')

const CATEGORIES = computed(() => [
  { value: 'all', label: t('shop.categories.all') },
  { value: 'cosmetic', label: t('shop.categories.cosmetic') },
  { value: 'pack', label: t('shop.categories.pack') },
  { value: 'pass', label: t('shop.categories.pass') },
  { value: 'boost', label: t('shop.categories.boost') },
])
const CURRENCIES_FILTER = computed(() => [
  { value: 'all', label: t('shop.currencies.all') },
  { value: 'soft', label: t('shop.currencies.soft') },
  { value: 'hard', label: t('shop.currencies.hard') },
])
const RARITIES = computed(() => [
  { value: 'all', label: t('shop.rarities.all') },
  { value: 'common', label: t('shop.rarity.common') },
  { value: 'rare', label: t('shop.rarity.rare') },
  { value: 'epic', label: t('shop.rarity.epic') },
  { value: 'legendary', label: t('shop.rarity.legendary') },
])

const hasActiveFilters = computed(
  () =>
    !!search.value ||
    selectedCategory.value !== 'all' ||
    selectedCurrency.value !== 'all' ||
    selectedRarity.value !== 'all',
)
function resetFilters() {
  search.value = ''
  selectedCategory.value = 'all'
  selectedCurrency.value = 'all'
  selectedRarity.value = 'all'
}

const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase()
  return store.items.filter((item) => {
    const matchQ = !q || item.name.toLowerCase().includes(q)
    const matchCat = selectedCategory.value === 'all' || item.category === selectedCategory.value
    const matchCur = selectedCurrency.value === 'all' || item.currency === selectedCurrency.value
    const matchRar = selectedRarity.value === 'all' || item.rarity === selectedRarity.value
    return matchQ && matchCat && matchCur && matchRar
  })
})

// ── Afford helpers ─────────────────────────────────────────────────────────
function canAfford(item: ShopItem): boolean {
  return (item.currency === 'soft' ? store.wallet.soft : store.wallet.hard) >= item.price
}
function canAffordBundle(bundle: Bundle): boolean {
  return (bundle.currency === 'soft' ? store.wallet.soft : store.wallet.hard) >= bundle.bundlePrice
}

// ── Modal: item purchase ───────────────────────────────────────────────────
const purchaseItem = ref<ShopItem | null>(null)
const purchasing = ref(false)
const purchaseFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null)

function openItemPurchase(item: ShopItem) {
  if (store.isOwned(item.id)) return
  purchaseItem.value = item
  purchaseFeedback.value = null
}

async function confirmPurchase() {
  if (!purchaseItem.value) return
  purchasing.value = true
  await wait(280)
  const res = await store.purchase(purchaseItem.value.id)
  purchaseFeedback.value = res.success
    ? { type: 'success', message: t('shop.purchase.success') }
    : {
        type: 'error',
        message:
          res.reason === 'insufficient_funds'
            ? t('shop.purchase.insufficientFunds')
            : t('shop.purchase.error'),
      }
  purchasing.value = false
}

// ── Modal: bundle purchase ─────────────────────────────────────────────────
const purchaseBundleRef = ref<Bundle | null>(null)
const bundleFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null)

function openBundlePurchase(bundle: Bundle) {
  purchaseBundleRef.value = bundle
  bundleFeedback.value = null
}

async function confirmBundlePurchase() {
  if (!purchaseBundleRef.value) return
  purchasing.value = true
  await wait(350)
  const res = await store.purchaseBundle(purchaseBundleRef.value.id)
  bundleFeedback.value = res.success
    ? { type: 'success', message: t('shop.bundle.purchaseSuccess') }
    : {
        type: 'error',
        message:
          res.reason === 'insufficient_funds'
            ? t('shop.purchase.insufficientFunds')
            : t('shop.purchase.error'),
      }
  purchasing.value = false
}

// ── Modal: top-up ──────────────────────────────────────────────────────────
const showTopUp = ref(false)
const selectedPack = ref<TopUpPack | null>(null)
const topupProcessing = ref(false)
const topupFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null)

function closeTopUp() {
  showTopUp.value = false
  selectedPack.value = null
  topupFeedback.value = null
}

async function doTopUp() {
  if (!selectedPack.value) return
  topupProcessing.value = true
  topupFeedback.value = null
  const res = await store.simulatePayment(selectedPack.value.id)
  topupFeedback.value = res.success
    ? {
        type: 'success',
        message: t('shop.topup.success', {
          amount: (selectedPack.value.hard + selectedPack.value.bonus).toLocaleString(locale.value),
        }),
      }
    : { type: 'error', message: t('shop.topup.fail') }
  topupProcessing.value = false
  selectedPack.value = null
}
</script>

<style scoped>
/* ─── Loading ────────────────────────────────────────────────────────────────── */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: rgba(252, 239, 225, 0.55);
  font-weight: 700;
  font-size: 0.95rem;
}
.loading-icon {
  width: 22px;
  height: 22px;
  fill: currentColor;
}

/* ─── Layout ─────────────────────────────────────────────────────────────── */
.shop-page {
  min-height: 100vh;
  padding-bottom: 3rem;
  color: var(--color-cream);
}

.page-shell {
  width: min(1440px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2rem 0 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
.page-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 1.25rem;
  align-items: stretch;
  padding: 1.4rem;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(135deg, rgba(81, 96, 121, 0.74), rgba(46, 50, 68, 0.94)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
  position: relative;
}

.page-hero::before {
  content: '';
  position: absolute;
  inset: -1px;
  background:
    radial-gradient(circle at 12% 0%, rgba(242, 139, 91, 0.24), transparent 34%),
    radial-gradient(circle at 88% 10%, rgba(247, 167, 132, 0.12), transparent 32%);
  pointer-events: none;
  border-radius: inherit;
}

.page-hero > * {
  position: relative;
  z-index: 1;
}

.page-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  margin-bottom: 0.75rem;
  padding: 0.38rem 0.72rem;
  border-radius: 999px;
  border: 1px solid rgba(242, 139, 91, 0.36);
  background: rgba(242, 139, 91, 0.16);
  color: var(--color-primary-strong);
  font-size: 0.74rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.page-title {
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 4vw, 3.3rem);
  font-weight: 900;
  letter-spacing: -0.05em;
  line-height: 0.95;
}

.page-subtitle {
  max-width: 760px;
  margin: 0.85rem 0 0;
  color: rgba(252, 239, 225, 0.72);
  font-size: 1rem;
  line-height: 1.65;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 1.25rem;
}

.hero-side {
  min-height: 100%;
  padding: 1.15rem;
  border-radius: 20px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    radial-gradient(circle at top right, rgba(242, 139, 91, 0.22), transparent 38%),
    rgba(18, 24, 38, 0.38);
  box-shadow: inset 0 1px 0 rgba(252, 239, 225, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.1rem;
}

.hero-side__label {
  color: var(--color-primary-strong);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-side__title {
  margin-top: 0.4rem;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  font-weight: 900;
}

.hero-side__text {
  margin: 0.45rem 0 0;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.88rem;
  line-height: 1.5;
}

.wallet-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.wallet-chip {
  flex: 1;
  min-width: 100px;
  padding: 0.7rem 0.9rem;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.4);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.wallet-chip--soft {
  border-color: rgba(242, 139, 91, 0.2);
}
.wallet-chip--hard {
  border-color: rgba(100, 140, 240, 0.2);
}

.wallet-chip__label {
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(252, 239, 225, 0.55);
}

.wallet-chip__val {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  font-weight: 900;
  color: var(--color-cream);
}

/* ─── Buttons ────────────────────────────────────────────────────────────── */
.btn {
  min-height: 42px;
  border-radius: 14px;
  border: 1px solid transparent;
  padding: 0.7rem 1.1rem;
  font-weight: 900;
  font-size: 0.88rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  text-decoration: none;
  transition:
    transform 0.16s ease,
    filter 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease;
}
.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn--primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  border-color: rgba(242, 139, 91, 0.42);
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
}
.btn--primary:hover:not(:disabled) {
  filter: brightness(1.04);
}

.btn--ghost {
  background: rgba(18, 24, 38, 0.34);
  color: rgba(252, 239, 225, 0.84);
  border-color: rgba(252, 239, 225, 0.12);
}
.btn--ghost:hover:not(:disabled) {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
}

.btn-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
  flex-shrink: 0;
}

/* ─── Stat grid ──────────────────────────────────────────────────────────── */
.stat-grid {
  display: grid;
  gap: 1rem;
}
.shop-stat-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.stat-card {
  padding: 1rem;
  border-radius: 22px;
  border: 1px solid rgba(252, 239, 225, 0.11);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.72), rgba(46, 50, 68, 0.88)), var(--color-navy);
  box-shadow: 0 18px 42px -30px rgba(0, 0, 0, 0.8);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.34);
}
.stat-card__label {
  display: block;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.stat-card__value {
  display: block;
  margin-top: 0.45rem;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.65rem;
  font-weight: 900;
  line-height: 1;
}
.stat-card__caption {
  display: block;
  margin-top: 0.45rem;
  color: rgba(252, 239, 225, 0.56);
  font-size: 0.8rem;
}

/* ─── Section nav ────────────────────────────────────────────────────────── */
.section-nav {
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(252, 239, 225, 0.1);
}
.section-tab {
  padding: 0.85rem 1.35rem;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: rgba(252, 239, 225, 0.5);
  font-weight: 900;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    color 0.15s,
    border-color 0.15s;
  margin-bottom: -1px;
}
.section-tab:hover {
  color: rgba(252, 239, 225, 0.82);
}
.section-tab--active {
  color: var(--color-cream);
  border-bottom-color: var(--color-primary);
}

/* ─── Surface ────────────────────────────────────────────────────────────── */
.surface {
  padding: 1.25rem;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.76), rgba(46, 50, 68, 0.94)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
}
.surface-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.1rem;
}
.surface-title {
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.03em;
}
.surface-subtitle {
  margin: 0.35rem 0 0;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.9rem;
  line-height: 1.55;
}

/* ─── Featured surface ───────────────────────────────────────────────────── */
.featured-surface {
  padding: 0;
  overflow: hidden;
}
.featured-img-wrap {
  position: relative;
  height: 260px;
  overflow: hidden;
}
.featured-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.featured-img__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(14, 17, 28, 0.1) 0%, rgba(14, 17, 28, 0.75) 100%);
}
.featured-img__meta {
  position: absolute;
  top: 1rem;
  left: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.featured-body {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.35rem;
  flex-wrap: wrap;
}
.featured-body__left {
  flex: 1;
  min-width: 0;
}
.featured-body__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
  flex-shrink: 0;
}
.bundle-items-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.85rem;
}
.bundle-item-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.65rem 0.3rem 0.3rem;
  border-radius: 10px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.4);
}
.bundle-item-chip--owned {
  opacity: 0.45;
}
.bundle-item-chip__img {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: cover;
}
.bundle-item-chip__name {
  font-size: 0.78rem;
  font-weight: 900;
  color: var(--color-cream);
  white-space: nowrap;
}

/* ─── Pricing ────────────────────────────────────────────────────────────── */
.pricing-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
}
.pricing-block__prices {
  display: flex;
  align-items: baseline;
  gap: 0.65rem;
}
.price-original {
  color: rgba(252, 239, 225, 0.38);
  text-decoration: line-through;
  font-size: 0.88rem;
  font-weight: 700;
}
.price-original--sm {
  font-size: 0.8rem;
}
.price-final {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  font-weight: 900;
  color: var(--color-cream);
  letter-spacing: -0.03em;
}
.price-cur {
  font-size: 1.3rem;
  color: var(--color-primary-strong);
}
.saving-badge {
  display: inline-flex;
  padding: 0.32rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(242, 139, 91, 0.36);
  background: rgba(242, 139, 91, 0.16);
  color: var(--color-primary-strong);
  font-size: 0.78rem;
  font-weight: 900;
  white-space: nowrap;
}
.saving-badge--sm {
  font-size: 0.72rem;
  padding: 0.22rem 0.5rem;
}
.saving-badge--img {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}

/* ─── Badges / timer ─────────────────────────────────────────────────────── */
.item-badge {
  padding: 0.28rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.18);
  background: rgba(18, 24, 38, 0.7);
  color: var(--color-primary-strong);
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  backdrop-filter: blur(6px);
}
.item-badge--abs {
  position: absolute;
  top: 1rem;
  left: 1.25rem;
}
.timer-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.28rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.7);
  color: rgba(252, 239, 225, 0.8);
  font-size: 0.72rem;
  font-weight: 900;
  backdrop-filter: blur(6px);
  font-variant-numeric: tabular-nums;
}
.timer-chip__icon {
  width: 13px;
  height: 13px;
  fill: currentColor;
}
.timer-chip--abs {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
}

/* ─── Bundles ────────────────────────────────────────────────────────────── */
.bundles-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}
.bundle-card {
  border-radius: 20px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  overflow: hidden;
  cursor: pointer;
  background: linear-gradient(180deg, rgba(61, 72, 95, 0.7), rgba(36, 40, 58, 0.9));
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}
.bundle-card:hover {
  transform: translateY(-3px);
  border-color: rgba(242, 139, 91, 0.34);
  box-shadow: 0 16px 40px -20px rgba(0, 0, 0, 0.6);
}
.bundle-card__img-wrap {
  position: relative;
  height: 140px;
  overflow: hidden;
}
.bundle-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.bundle-card:hover .bundle-card__img {
  transform: scale(1.04);
}
.bundle-card__img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(14, 17, 28, 0.05) 0%, rgba(14, 17, 28, 0.65) 100%);
}
.bundle-card__body {
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.bundle-card__name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.98rem;
  font-weight: 900;
  color: var(--color-cream);
  margin: 0;
  letter-spacing: -0.02em;
}
.bundle-card__items-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.bundle-card__item-thumb {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid rgba(252, 239, 225, 0.1);
}
.bundle-card__more {
  font-size: 0.72rem;
  font-weight: 900;
  color: rgba(252, 239, 225, 0.5);
}
.bundle-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  padding-top: 0.65rem;
  border-top: 1px solid rgba(252, 239, 225, 0.07);
}
.bundle-card__price {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--color-cream);
}
.bundles-full-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.1rem;
}
.bundle-full-card {
  border-radius: 20px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  overflow: hidden;
  background: linear-gradient(180deg, rgba(61, 72, 95, 0.7), rgba(36, 40, 58, 0.9));
  transition:
    transform 0.18s ease,
    border-color 0.18s ease;
}
.bundle-full-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.3);
}
.bundle-full-card__img-wrap {
  position: relative;
  height: 200px;
  overflow: hidden;
}
.bundle-full-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.bundle-full-card__body {
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.bundle-full-card__head {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.bundle-full-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}
.bundle-full-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.65rem 0.4rem;
  border-radius: 12px;
  border: 1px solid rgba(252, 239, 225, 0.09);
  background: rgba(18, 24, 38, 0.3);
  transition: border-color 0.14s;
}
.bundle-full-item:hover {
  border-color: rgba(252, 239, 225, 0.18);
}
.bundle-full-item--owned {
  opacity: 0.4;
}
.bundle-full-item__img {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid rgba(252, 239, 225, 0.1);
}
.bundle-full-item__name {
  font-size: 0.68rem;
  font-weight: 900;
  color: rgba(252, 239, 225, 0.72);
  text-align: center;
  max-width: 88px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bundle-full-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.9rem;
  border-top: 1px solid rgba(252, 239, 225, 0.08);
  flex-wrap: wrap;
}

/* ─── Items grid ─────────────────────────────────────────────────────────── */
.items-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.9rem;
}
.items-grid--catalogue {
  grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
}
.item-card {
  border-radius: 18px;
  border: 1px solid rgba(252, 239, 225, 0.09);
  overflow: hidden;
  background: linear-gradient(180deg, rgba(61, 72, 95, 0.65), rgba(36, 40, 58, 0.9));
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
  position: relative;
}
.item-card:hover:not(.item-card--owned) {
  transform: translateY(-3px);
}
.item-card.rarity--rare:hover:not(.item-card--owned) {
  border-color: rgba(100, 150, 255, 0.4);
  box-shadow: 0 8px 24px rgba(80, 120, 240, 0.18);
}
.item-card.rarity--epic:hover:not(.item-card--owned) {
  border-color: rgba(180, 120, 255, 0.4);
  box-shadow: 0 8px 24px rgba(150, 80, 240, 0.18);
}
.item-card.rarity--legendary:hover:not(.item-card--owned) {
  border-color: rgba(242, 139, 91, 0.5);
  box-shadow: 0 8px 24px rgba(242, 139, 91, 0.2);
}
.item-card--owned {
  cursor: default;
}
.item-card__rarity-bar {
  height: 2px;
  flex-shrink: 0;
}
.rarity-bar--common {
  background: rgba(255, 255, 255, 0.18);
}
.rarity-bar--rare {
  background: linear-gradient(90deg, #3d5aaa, #7aadff);
}
.rarity-bar--epic {
  background: linear-gradient(90deg, #5d2ca8, #c8a0ff);
}
.rarity-bar--legendary {
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-strong));
}
.new-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 2;
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  padding: 0.15rem 0.4rem;
  border-radius: 5px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
  color: var(--color-navy);
  text-transform: uppercase;
}
.item-card__img-wrap {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}
.item-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.28s ease;
}
.item-card:hover .item-card__img {
  transform: scale(1.06);
}
.item-owned-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}
.item-card--owned:hover .item-owned-overlay {
  opacity: 1;
}
.item-card__body {
  padding: 0.65rem 0.75rem;
  border-top: 1px solid rgba(252, 239, 225, 0.06);
  background: rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.item-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
}
.item-card__name {
  font-size: 0.8rem;
  font-weight: 900;
  color: var(--color-cream);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.item-card__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
}
.item-price {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.88rem;
  font-weight: 900;
  color: var(--color-cream);
  display: flex;
  align-items: center;
  gap: 0.2rem;
}
.cur-sym {
  font-size: 0.8rem;
  font-weight: 900;
}
.cur-sym--soft {
  color: var(--color-primary-strong);
}
.cur-sym--hard {
  color: #9ab8ff;
}
.btn-buy {
  padding: 0.28rem 0.6rem;
  border: none;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: filter 0.12s;
}
.btn-buy--ok {
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
  color: var(--color-navy);
}
.btn-buy--ok:hover {
  filter: brightness(1.06);
}
.btn-buy--broke {
  background: rgba(200, 80, 80, 0.15);
  color: rgba(255, 160, 160, 0.8);
  border: 1px solid rgba(200, 80, 80, 0.22);
  cursor: not-allowed;
}
.owned-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  font-weight: 900;
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.12);
  border: 1px solid rgba(61, 191, 125, 0.22);
  padding: 0.22rem 0.5rem;
  border-radius: 7px;
}
.owned-chip__icon {
  width: 11px;
  height: 11px;
  fill: currentColor;
}
.owned-check {
  fill: #7ee0ad;
}
.owned-check--sm {
  width: 13px;
  height: 13px;
}
.owned-check--lg {
  width: 2rem;
  height: 2rem;
}

/* ─── Rarity dots & pills ────────────────────────────────────────────────── */
.rarity-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.rarity-dot--common {
  background: rgba(255, 255, 255, 0.28);
}
.rarity-dot--rare {
  background: #7aadff;
  box-shadow: 0 0 5px rgba(122, 173, 255, 0.55);
}
.rarity-dot--epic {
  background: #c8a0ff;
  box-shadow: 0 0 5px rgba(200, 160, 255, 0.55);
}
.rarity-dot--legendary {
  background: var(--color-primary);
  box-shadow: 0 0 5px rgba(242, 139, 91, 0.65);
}
.rarity-pill {
  display: inline-flex;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.rarity-pill--common {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(252, 239, 225, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.rarity-pill--rare {
  background: rgba(49, 89, 140, 0.25);
  color: #9ab8ff;
  border: 1px solid rgba(49, 89, 140, 0.3);
}
.rarity-pill--epic {
  background: rgba(93, 44, 168, 0.25);
  color: #c8a0ff;
  border: 1px solid rgba(93, 44, 168, 0.3);
}
.rarity-pill--legendary {
  background: rgba(242, 139, 91, 0.15);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.28);
}

/* ─── Toolbar ────────────────────────────────────────────────────────────── */
.toolbar {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.1rem;
}
.shop-toolbar {
  grid-template-columns: minmax(0, 2fr) repeat(3, minmax(120px, 0.65fr));
}
.search-field {
  position: relative;
  display: flex;
  align-items: center;
}
.search-field__icon {
  position: absolute;
  left: 0.9rem;
  width: 18px;
  height: 18px;
  fill: rgba(252, 239, 225, 0.45);
  pointer-events: none;
}
.search-field .field {
  padding-left: 2.6rem;
}
.field,
.select {
  width: 100%;
  min-height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.34);
  color: var(--color-cream);
  font-size: 0.9rem;
  font-weight: 700;
  outline: none;
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    box-shadow 0.16s ease;
}
.field {
  padding: 0 0.9rem;
}
.select {
  padding: 0 0.85rem;
  cursor: pointer;
}
.field::placeholder {
  color: rgba(252, 239, 225, 0.42);
}
.field:focus,
.select:focus {
  border-color: rgba(242, 139, 91, 0.56);
  background: rgba(18, 24, 38, 0.48);
  box-shadow: 0 0 0 4px rgba(242, 139, 91, 0.12);
}
.select option {
  background: var(--color-navy);
  color: var(--color-cream);
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
.empty-state {
  padding: 3rem 1rem;
  border-radius: 22px;
  border: 1px dashed rgba(252, 239, 225, 0.16);
  background: rgba(18, 24, 38, 0.26);
  text-align: center;
}
.empty-state__title {
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  font-weight: 900;
}
.empty-state__text {
  margin: 0.6rem auto 0;
  max-width: 480px;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.92rem;
  line-height: 1.6;
}

/* ─── Modals ─────────────────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(8, 10, 18, 0.88);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.modal-box {
  width: 100%;
  max-width: 420px;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: linear-gradient(160deg, rgba(70, 80, 105, 0.9), rgba(36, 40, 60, 0.98));
  box-shadow: 0 40px 90px -20px rgba(0, 0, 0, 0.8);
  position: relative;
}
.modal-box--wide {
  max-width: 560px;
}
.modal-box--topup {
  max-width: 620px;
}
.modal-close {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  z-index: 10;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(14, 17, 28, 0.65);
  color: rgba(252, 239, 225, 0.65);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.14s;
  backdrop-filter: blur(6px);
}
.modal-close:hover {
  background: rgba(242, 139, 91, 0.2);
  color: var(--color-cream);
}
.modal-close svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}
.modal-rarity-bar {
  height: 3px;
}
.modal-img-wrap {
  position: relative;
  height: 200px;
  overflow: hidden;
}
.modal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.modal-body {
  padding: 1.25rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 60vh;
  overflow-y: auto;
}
.modal-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.3rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--color-cream);
  margin: 0;
}
.modal-meta {
  margin: 0;
  color: rgba(252, 239, 225, 0.55);
  font-size: 0.88rem;
}
.modal-price-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border-radius: 14px;
  background: rgba(18, 24, 38, 0.45);
  border: 1px solid rgba(252, 239, 225, 0.09);
  margin: 0.35rem 0;
}
.modal-balance {
  font-size: 0.78rem;
  color: rgba(252, 239, 225, 0.4);
}
.modal-actions {
  display: flex;
  gap: 0.7rem;
  margin-top: 0.35rem;
}
.modal-actions .btn {
  flex: 1;
  justify-content: center;
}
.bundle-modal-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 0.5rem;
  margin: 0.35rem 0;
}
.bmi {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.55rem 0.4rem;
  border-radius: 10px;
  border: 1px solid rgba(252, 239, 225, 0.09);
  background: rgba(18, 24, 38, 0.3);
}
.bmi--owned {
  opacity: 0.38;
}
.bmi__img {
  width: 40px;
  height: 40px;
  border-radius: 7px;
  object-fit: cover;
}
.bmi__name {
  font-size: 0.62rem;
  font-weight: 900;
  color: rgba(252, 239, 225, 0.65);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 80px;
}
.bundle-modal-pricing {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 14px;
  background: rgba(18, 24, 38, 0.45);
  border: 1px solid rgba(252, 239, 225, 0.09);
  margin: 0.35rem 0;
}
.feedback-banner {
  padding: 0.8rem 1rem;
  border-radius: 14px;
  font-weight: 900;
  font-size: 0.86rem;
  margin-top: 0.25rem;
}
.feedback-banner--success {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.12);
  border: 1px solid rgba(61, 191, 125, 0.26);
}
.feedback-banner--error {
  color: #ffb3b3;
  background: rgba(220, 80, 80, 0.12);
  border: 1px solid rgba(220, 80, 80, 0.26);
}

/* ─── Top-up packs ───────────────────────────────────────────────────────── */
.packs-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.65rem;
  margin: 0.75rem 0;
}
.pack-card {
  position: relative;
  padding: 0.9rem 0.4rem;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.4);
  cursor: pointer;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  transition: all 0.15s;
}
.pack-card:hover:not(:disabled) {
  border-color: rgba(242, 139, 91, 0.35);
  background: rgba(242, 139, 91, 0.09);
  transform: translateY(-2px);
}
.pack-card--popular {
  border-color: rgba(242, 139, 91, 0.28);
  background: rgba(242, 139, 91, 0.07);
}
.pack-card--selected {
  border-color: rgba(242, 139, 91, 0.6);
  background: rgba(242, 139, 91, 0.14);
  box-shadow: 0 0 0 3px rgba(242, 139, 91, 0.18);
}
.pack-best {
  position: absolute;
  top: -9px;
  font-size: 0.58rem;
  font-weight: 900;
  text-transform: uppercase;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  color: var(--color-navy);
  padding: 0.1rem 0.4rem;
  border-radius: 5px;
  white-space: nowrap;
}
.pack-hard {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.88rem;
  font-weight: 900;
  color: var(--color-primary-strong);
  margin-top: 0.4rem;
}
.pack-bonus {
  font-size: 0.62rem;
  font-weight: 900;
  color: #7ee0ad;
}
.pack-price {
  font-size: 0.82rem;
  font-weight: 900;
  color: var(--color-cream);
}
.pack-label {
  font-size: 0.64rem;
  color: rgba(252, 239, 225, 0.42);
  font-weight: 700;
}
.topup-disclaimer {
  font-size: 0.72rem;
  color: rgba(252, 239, 225, 0.3);
  text-align: center;
  margin: 0.5rem 0 0;
}

/* ─── Animations ─────────────────────────────────────────────────────────── */
.spinning {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.94) translateY(16px);
  opacity: 0;
}
.fade-btn-enter-active,
.fade-btn-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.fade-btn-enter-from,
.fade-btn-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* ─── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 1300px) {
  .page-hero {
    grid-template-columns: 1fr;
  }
  .shop-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .bundles-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .items-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 900px) {
  .shop-toolbar {
    grid-template-columns: 1fr;
  }
  .bundles-full-grid {
    grid-template-columns: 1fr;
  }
  .items-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .packs-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .items-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .bundles-grid {
    grid-template-columns: 1fr;
  }
  .packs-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
