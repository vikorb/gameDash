<template>
  <section class="backoffice-page">
    <div class="page-shell">
      <header class="page-hero">
        <div class="page-hero__content">
          <div>
            <span class="page-badge">{{ t('backoffice.economy.badge') }}</span>
            <h1 class="page-title">{{ t('backoffice.economy.title') }}</h1>
            <p class="page-subtitle">{{ t('backoffice.economy.subtitle') }}</p>
          </div>

          <div class="page-hero__actions">
            <button type="button" class="btn btn--primary" @click="goBackToBackoffice">
              {{ t('backoffice.common.actions.backToBackoffice') }}
            </button>

            <button type="button" class="btn btn--ghost" @click="resetAll">
              {{ t('backoffice.economy.actions.resetAll') }}
            </button>
          </div>
        </div>

        <aside class="hero-side">
          <div>
            <div class="hero-side__label">{{ t('backoffice.economy.side.label') }}</div>
            <div class="hero-side__title">{{ t('backoffice.economy.side.title') }}</div>
            <p class="hero-side__text">{{ t('backoffice.economy.side.text') }}</p>
          </div>

          <div class="hero-side__chips">
            <span>{{ t('backoffice.economy.side.chips.prices') }}</span>
            <span>{{ t('backoffice.economy.side.chips.rewards') }}</span>
            <span>{{ t('backoffice.economy.side.chips.audit') }}</span>
          </div>
        </aside>
      </header>

      <div v-if="feedback" :class="['feedback-banner', `feedback-banner--${feedback.type}`]">
        {{ feedback.message }}
      </div>

      <section class="currency-grid">
        <article class="currency-card currency-card--soft">
          <div class="currency-card__icon">⬣</div>
          <div class="currency-card__body">
            <span class="currency-card__label">{{ t('backoffice.economy.currencies.soft') }}</span>
            <strong class="currency-card__value">
              {{ economySnapshot.softCurrencyEarned.toLocaleString(locale) }}
            </strong>
            <span class="currency-card__caption">
              {{ t('backoffice.economy.currencies.softCaption') }}
            </span>
          </div>
        </article>

        <article class="currency-card currency-card--hard">
          <div class="currency-card__icon">⬢</div>
          <div class="currency-card__body">
            <span class="currency-card__label">{{ t('backoffice.economy.currencies.hard') }}</span>
            <strong class="currency-card__value">
              {{ economySnapshot.hardCurrencySold.toLocaleString(locale) }}
            </strong>
            <span class="currency-card__caption">
              {{ t('backoffice.economy.currencies.hardCaption') }}
            </span>
          </div>
        </article>

        <article class="currency-card currency-card--revenue">
          <div class="currency-card__icon">€</div>
          <div class="currency-card__body">
            <span class="currency-card__label">{{
              t('backoffice.economy.currencies.revenue')
            }}</span>
            <strong class="currency-card__value">
              {{ economySnapshot.virtualRevenue.toLocaleString(locale) }} €
            </strong>
            <span class="currency-card__caption">
              {{ t('backoffice.economy.currencies.revenueCaption') }}
            </span>
          </div>
        </article>

        <article class="currency-card currency-card--transactions">
          <div class="currency-card__icon">📈</div>
          <div class="currency-card__body">
            <span class="currency-card__label">
              {{ t('backoffice.economy.currencies.transactions') }}
            </span>
            <strong class="currency-card__value">
              {{ economySnapshot.transactionsLast7d.toLocaleString(locale) }}
            </strong>
            <span class="currency-card__caption">
              {{ t('backoffice.economy.currencies.transactionsCaption') }}
            </span>
          </div>
        </article>
      </section>

      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('backoffice.economy.rewards.title') }}</h2>
            <p class="surface-subtitle">{{ t('backoffice.economy.rewards.subtitle') }}</p>
          </div>

          <span v-if="rewardsDirty" class="meta-item meta-item--warning">
            {{ t('backoffice.economy.unsavedChanges') }}
          </span>
        </div>

        <div class="rewards-grid">
          <label class="form-field">
            <span class="form-field__label">{{ t('backoffice.economy.rewards.xpWin') }}</span>
            <div class="form-field__control">
              <input
                v-model.number="pendingRewards.xpWin"
                type="number"
                min="0"
                max="2000"
                step="5"
                class="input"
              />
              <span class="form-field__unit">XP</span>
            </div>
            <span class="form-field__hint">{{ t('backoffice.economy.rewards.xpWinHint') }}</span>
          </label>

          <label class="form-field">
            <span class="form-field__label">{{ t('backoffice.economy.rewards.xpLoss') }}</span>
            <div class="form-field__control">
              <input
                v-model.number="pendingRewards.xpLoss"
                type="number"
                min="0"
                max="1000"
                step="5"
                class="input"
              />
              <span class="form-field__unit">XP</span>
            </div>
            <span class="form-field__hint">{{ t('backoffice.economy.rewards.xpLossHint') }}</span>
          </label>

          <label class="form-field">
            <span class="form-field__label">{{ t('backoffice.economy.rewards.softWin') }}</span>
            <div class="form-field__control">
              <input
                v-model.number="pendingRewards.softWin"
                type="number"
                min="0"
                max="1000"
                step="5"
                class="input"
              />
              <span class="form-field__unit">⬣</span>
            </div>
            <span class="form-field__hint">{{ t('backoffice.economy.rewards.softWinHint') }}</span>
          </label>

          <label class="form-field">
            <span class="form-field__label">{{ t('backoffice.economy.rewards.softLoss') }}</span>
            <div class="form-field__control">
              <input
                v-model.number="pendingRewards.softLoss"
                type="number"
                min="0"
                max="500"
                step="5"
                class="input"
              />
              <span class="form-field__unit">⬣</span>
            </div>
            <span class="form-field__hint">{{ t('backoffice.economy.rewards.softLossHint') }}</span>
          </label>

          <label class="form-field">
            <span class="form-field__label">{{ t('backoffice.economy.rewards.dailyQuest') }}</span>
            <div class="form-field__control">
              <input
                v-model.number="pendingRewards.dailyQuestSoft"
                type="number"
                min="0"
                max="2000"
                step="10"
                class="input"
              />
              <span class="form-field__unit">⬣</span>
            </div>
            <span class="form-field__hint">{{
              t('backoffice.economy.rewards.dailyQuestHint')
            }}</span>
          </label>

          <label class="form-field">
            <span class="form-field__label">{{ t('backoffice.economy.rewards.levelUp') }}</span>
            <div class="form-field__control">
              <input
                v-model.number="pendingRewards.levelUpHard"
                type="number"
                min="0"
                max="200"
                step="1"
                class="input"
              />
              <span class="form-field__unit">⬢</span>
            </div>
            <span class="form-field__hint">{{ t('backoffice.economy.rewards.levelUpHint') }}</span>
          </label>
        </div>

        <div class="form-actions">
          <span class="meta-item meta-item--audit">
            {{
              t('backoffice.economy.lastUpdated', {
                actor: rewardsLastUpdatedBy,
                date: formatDate(rewardsLastUpdatedAt),
              })
            }}
          </span>

          <div class="form-actions__buttons">
            <button
              type="button"
              class="btn-inline btn-inline--ghost"
              :disabled="!rewardsDirty || rewardsSaving"
              @click="resetRewards"
            >
              {{ t('backoffice.economy.actions.cancel') }}
            </button>

            <button
              type="button"
              class="btn-inline btn-inline--primary"
              :disabled="!rewardsDirty || rewardsSaving"
              @click="saveRewards"
            >
              {{
                rewardsSaving
                  ? t('backoffice.economy.actions.saving')
                  : t('backoffice.economy.actions.saveRewards')
              }}
            </button>
          </div>
        </div>
      </section>

      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('backoffice.economy.shop.title') }}</h2>
            <p class="surface-subtitle">{{ t('backoffice.economy.shop.subtitle') }}</p>
          </div>

          <div class="surface-header__meta">
            <span class="meta-item">
              {{ items.length }} {{ t('backoffice.economy.shop.itemsCount') }}
            </span>
            <span v-if="dirtyItems.size > 0" class="meta-item meta-item--warning">
              {{ t('backoffice.economy.shop.itemsDirty', { count: dirtyItems.size }) }}
            </span>
            <button
              type="button"
              class="btn-inline btn-inline--primary"
              @click="openItemModal(null)"
            >
              + {{ t('backoffice.economy.shop.addItem') }}
            </button>
          </div>
        </div>

        <div class="filter-bar">
          <div class="filter-bar__search">
            <svg viewBox="0 0 24 24" class="filter-bar__search-icon" aria-hidden="true">
              <path :d="mdiMagnify" />
            </svg>
            <input
              v-model="search"
              class="input input--compact"
              :placeholder="t('backoffice.economy.shop.searchPlaceholder')"
            />
          </div>

          <select v-model="selectedCategory" class="select select--compact">
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <select v-model="selectedCurrency" class="select select--compact">
            <option v-for="opt in currencyOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <Transition name="fade-btn">
            <button
              v-if="hasItemFilters"
              type="button"
              class="btn-inline btn-inline--ghost filter-bar__reset"
              @click="resetItemFilters"
            >
              <svg viewBox="0 0 24 24" class="btn-icon-sm" aria-hidden="true">
                <path :d="mdiFilterRemove" />
              </svg>
              {{ t('backoffice.economy.actions.resetFilters') }}
            </button>
          </Transition>
        </div>

        <div v-if="filteredItems.length" class="items-table-wrap">
          <table class="items-table">
            <thead>
              <tr>
                <th>{{ t('backoffice.economy.shop.columns.item') }}</th>
                <th>{{ t('backoffice.economy.shop.columns.rarity') }}</th>
                <th>{{ t('backoffice.economy.shop.columns.category') }}</th>
                <th>{{ t('backoffice.economy.shop.columns.price') }}</th>
                <th>{{ t('backoffice.economy.shop.columns.sales') }}</th>
                <th>{{ t('backoffice.economy.shop.columns.status') }}</th>
                <th>{{ t('backoffice.economy.shop.columns.actions') }}</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in paginatedItems"
                :key="item.id"
                :class="dirtyItems.has(item.id) ? 'is-dirty' : ''"
              >
                <td>
                  <div class="item-cell">
                    <img
                      :src="picsumUrl(item.imageSeed ?? item.name, 44, 44)"
                      :alt="item.name"
                      class="item-cell__img"
                    />
                    <div>
                      <strong class="item-cell__name">{{ item.name }}</strong>
                      <span class="item-cell__meta">
                        #{{ item.id }}
                        <span v-if="item.isNew" class="item-new-tag">NEW</span>
                        <span v-if="item.isFeatured" class="item-feat-tag">★</span>
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  <span :class="['rarity-chip', `rarity-chip--${item.rarity}`]">
                    {{ t(`backoffice.economy.shop.rarities.${item.rarity}`) }}
                  </span>
                </td>

                <td>
                  <span class="meta-item">{{ getCategoryLabel(item.category) }}</span>
                </td>

                <td>
                  <div class="price-edit">
                    <input
                      v-model.number="pendingPrices[item.id]"
                      type="number"
                      min="0"
                      step="10"
                      class="input input--narrow"
                    />
                    <span :class="['currency-badge', `currency-badge--${item.currency}`]">
                      {{ item.currency === 'soft' ? '◇' : '◈' }}
                    </span>
                  </div>
                </td>

                <td>
                  <strong>{{ item.sales7d.toLocaleString(locale) }}</strong>
                  <span class="sales-caption">{{ t('backoffice.economy.shop.last7d') }}</span>
                </td>

                <td>
                  <button
                    type="button"
                    :class="['toggle-mini', { 'toggle-mini--on': getPendingAvailability(item) }]"
                    :aria-pressed="getPendingAvailability(item)"
                    @click="toggleAvailable(item.id)"
                  >
                    <span class="toggle-mini__switch" aria-hidden="true">
                      <span class="toggle-mini__knob" />
                    </span>
                    <span class="toggle-mini__text">
                      {{
                        getPendingAvailability(item)
                          ? t('backoffice.economy.shop.statuses.available')
                          : t('backoffice.economy.shop.statuses.hidden')
                      }}
                    </span>
                  </button>
                </td>

                <td>
                  <div class="row-actions">
                    <button
                      type="button"
                      class="btn-inline btn-inline--ghost btn-inline--small"
                      :disabled="!dirtyItems.has(item.id) || savingItemId === item.id"
                      @click="resetItem(item.id)"
                    >
                      {{ t('backoffice.economy.actions.cancel') }}
                    </button>

                    <button
                      type="button"
                      class="btn-inline btn-inline--primary btn-inline--small"
                      :disabled="!dirtyItems.has(item.id) || savingItemId === item.id"
                      @click="saveItem(item.id)"
                    >
                      {{
                        savingItemId === item.id
                          ? t('backoffice.economy.actions.saving')
                          : t('backoffice.economy.actions.save')
                      }}
                    </button>

                    <button
                      type="button"
                      class="btn-inline btn-inline--ghost btn-inline--small"
                      @click="openItemModal(item)"
                    >
                      {{ t('backoffice.economy.shop.editItem') }}
                    </button>

                    <button
                      type="button"
                      class="btn-inline btn-inline--danger btn-inline--small"
                      @click="confirmDeleteItem(item.id)"
                    >
                      {{ t('backoffice.economy.shop.deleteItem') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination items -->
        <div v-if="filteredItems.length > itemsPerPage" class="table-pagination">
          <div class="pagination-info">
            {{
              t('backoffice.economy.shop.pagination.showing', {
                from: itemsPageStart + 1,
                to: Math.min(itemsPageStart + itemsPerPage, filteredItems.length),
                total: filteredItems.length,
              })
            }}
          </div>
          <div class="pagination-controls">
            <button
              type="button"
              class="page-btn"
              :disabled="itemsPage === 1"
              @click="itemsPage = 1"
            >
              «
            </button>
            <button type="button" class="page-btn" :disabled="itemsPage === 1" @click="itemsPage--">
              ‹
            </button>
            <button
              v-for="p in visibleItemPages"
              :key="p"
              type="button"
              :class="['page-btn', p === itemsPage && 'page-btn--active']"
              @click="itemsPage = p"
            >
              {{ p }}
            </button>
            <button
              type="button"
              class="page-btn"
              :disabled="itemsPage === itemsTotalPages"
              @click="itemsPage++"
            >
              ›
            </button>
            <button
              type="button"
              class="page-btn"
              :disabled="itemsPage === itemsTotalPages"
              @click="itemsPage = itemsTotalPages"
            >
              »
            </button>
          </div>
          <div class="pagination-size">
            <select
              v-model.number="itemsPerPage"
              class="select select--mini"
              @change="
                () => {
                  itemsPage = 1
                }
              "
            >
              <option :value="10">10 / page</option>
              <option :value="20">20 / page</option>
              <option :value="50">50 / page</option>
            </select>
          </div>
        </div>

        <div v-else-if="!filteredItems.length" class="empty-state">
          <h3 class="empty-state__title">{{ t('backoffice.economy.shop.emptyTitle') }}</h3>
          <p class="empty-state__text">{{ t('backoffice.economy.shop.emptyText') }}</p>
        </div>
      </section>

      <!-- ─── Item modal ──────────────────────────────────────────────── -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="itemModal.open" class="modal-backdrop" @click.self="closeItemModal">
            <div class="modal-box modal-box--item">
              <button type="button" class="modal-close" @click="closeItemModal">✕</button>

              <h3 class="modal-title">
                {{
                  itemModal.editId
                    ? t('backoffice.economy.shop.modal.editTitle')
                    : t('backoffice.economy.shop.modal.addTitle')
                }}
              </h3>

              <!-- Image preview -->
              <div class="item-modal-preview">
                <img
                  v-if="itemModal.imageSeed"
                  :src="picsumUrl(itemModal.imageSeed, 480, 160)"
                  alt="Aperçu"
                  class="item-modal-preview__img"
                />
                <div v-else class="item-modal-preview--empty">
                  {{ t('backoffice.economy.shop.modal.imagePlaceholder') }}
                </div>
              </div>

              <div class="item-form">
                <!-- Name + Image seed -->
                <div class="bundle-form__row bundle-form__row--2">
                  <label class="form-field">
                    <span class="form-field__label">{{
                      t('backoffice.economy.shop.modal.name')
                    }}</span>
                    <input v-model="itemModal.name" type="text" class="input" />
                  </label>
                  <label class="form-field">
                    <span class="form-field__label">{{
                      t('backoffice.economy.shop.modal.imageSeed')
                    }}</span>
                    <input
                      v-model="itemModal.imageSeed"
                      type="text"
                      class="input"
                      :placeholder="t('backoffice.economy.shop.modal.imageSeedHint')"
                    />
                    <span class="form-field__hint">{{
                      t('backoffice.economy.shop.modal.imageSeedDesc')
                    }}</span>
                  </label>
                </div>

                <!-- Category + Slot -->
                <div class="bundle-form__row bundle-form__row--2">
                  <label class="form-field">
                    <span class="form-field__label">{{
                      t('backoffice.economy.shop.modal.category')
                    }}</span>
                    <select v-model="itemModal.category" class="select">
                      <option v-for="c in ITEM_CATEGORIES" :key="c.value" :value="c.value">
                        {{ c.label }}
                      </option>
                    </select>
                  </label>
                  <label class="form-field">
                    <span class="form-field__label">{{
                      t('backoffice.economy.shop.modal.slot')
                    }}</span>
                    <select v-model="itemModal.slot" class="select">
                      <option v-for="s in ITEM_SLOTS" :key="String(s.value)" :value="s.value">
                        {{ s.label }}
                      </option>
                    </select>
                    <span class="form-field__hint">{{
                      t('backoffice.economy.shop.modal.slotHint')
                    }}</span>
                  </label>
                </div>

                <!-- Rarity + Currency -->
                <div class="bundle-form__row bundle-form__row--2">
                  <label class="form-field">
                    <span class="form-field__label">{{
                      t('backoffice.economy.shop.modal.rarity')
                    }}</span>
                    <select v-model="itemModal.rarity" class="select">
                      <option v-for="r in ITEM_RARITIES" :key="r.value" :value="r.value">
                        {{ r.label }}
                      </option>
                    </select>
                  </label>
                  <label class="form-field">
                    <span class="form-field__label">{{
                      t('backoffice.economy.shop.modal.currency')
                    }}</span>
                    <select v-model="itemModal.currency" class="select">
                      <option value="soft">{{ t('backoffice.economy.currencies.soft') }} ◇</option>
                      <option value="hard">{{ t('backoffice.economy.currencies.hard') }} ◈</option>
                    </select>
                  </label>
                </div>

                <!-- Price -->
                <label class="form-field">
                  <span class="form-field__label">{{
                    t('backoffice.economy.shop.modal.price')
                  }}</span>
                  <div class="form-field__control">
                    <input
                      v-model.number="itemModal.price"
                      type="number"
                      min="0"
                      step="5"
                      class="input"
                    />
                    <span class="form-field__unit">{{
                      itemModal.currency === 'soft' ? '◇' : '◈'
                    }}</span>
                  </div>
                </label>

                <!-- Flags: isNew, isFeatured, available -->
                <div class="item-flags-row">
                  <label class="flag-toggle">
                    <input type="checkbox" v-model="itemModal.isNew" class="sr-only" />
                    <span :class="['flag-toggle__box', itemModal.isNew && 'flag-toggle__box--on']">
                      <span class="flag-toggle__knob"></span>
                    </span>
                    <span class="flag-toggle__label">{{
                      t('backoffice.economy.shop.modal.flagNew')
                    }}</span>
                  </label>
                  <label class="flag-toggle">
                    <input type="checkbox" v-model="itemModal.isFeatured" class="sr-only" />
                    <span
                      :class="['flag-toggle__box', itemModal.isFeatured && 'flag-toggle__box--on']"
                    >
                      <span class="flag-toggle__knob"></span>
                    </span>
                    <span class="flag-toggle__label">{{
                      t('backoffice.economy.shop.modal.flagFeatured')
                    }}</span>
                  </label>
                  <label class="flag-toggle">
                    <input type="checkbox" v-model="itemModal.available" class="sr-only" />
                    <span
                      :class="['flag-toggle__box', itemModal.available && 'flag-toggle__box--on']"
                    >
                      <span class="flag-toggle__knob"></span>
                    </span>
                    <span class="flag-toggle__label">{{
                      t('backoffice.economy.shop.modal.flagAvailable')
                    }}</span>
                  </label>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-inline btn-inline--ghost" @click="closeItemModal">
                  {{ t('backoffice.economy.actions.cancel') }}
                </button>
                <button
                  type="button"
                  class="btn-inline btn-inline--primary"
                  :disabled="!itemModal.name.trim() || itemModal.price < 0"
                  @click="saveItemModal"
                >
                  {{
                    itemModal.editId
                      ? t('backoffice.economy.shop.modal.save')
                      : t('backoffice.economy.shop.modal.create')
                  }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- ─── Bundles management ──────────────────────────────────────── -->
      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('backoffice.economy.bundles.title') }}</h2>
            <p class="surface-subtitle">{{ t('backoffice.economy.bundles.subtitle') }}</p>
          </div>
          <div class="surface-header__meta">
            <span class="meta-item"
              >{{ shopStore.bundles.length }} {{ t('backoffice.economy.bundles.count') }}</span
            >
            <button
              type="button"
              class="btn-inline btn-inline--primary"
              @click="openBundleModal(null)"
            >
              + {{ t('backoffice.economy.bundles.addBundle') }}
            </button>
          </div>
        </div>

        <div class="filter-bar">
          <div class="filter-bar__search">
            <svg viewBox="0 0 24 24" class="filter-bar__search-icon" aria-hidden="true">
              <path :d="mdiMagnify" />
            </svg>
            <input
              v-model="bundleSearch"
              class="input input--compact"
              :placeholder="t('backoffice.economy.bundles.searchPlaceholder')"
            />
          </div>

          <select v-model="selectedBundleBadge" class="select select--compact">
            <option value="">{{ t('backoffice.economy.bundles.filters.allBadges') }}</option>
            <option v-for="b in BUNDLE_BADGES" :key="b" :value="b">{{ b }}</option>
            <option value="__none">{{ t('backoffice.economy.bundles.filters.noBadge') }}</option>
          </select>

          <select v-model="selectedBundleStatus" class="select select--compact">
            <option value="all">{{ t('backoffice.economy.bundles.filters.allStatuses') }}</option>
            <option value="available">{{ t('backoffice.economy.shop.statuses.available') }}</option>
            <option value="hidden">{{ t('backoffice.economy.shop.statuses.hidden') }}</option>
            <option value="expiring">{{ t('backoffice.economy.bundles.filters.expiring') }}</option>
          </select>

          <Transition name="fade-btn">
            <button
              v-if="hasBundleFilters"
              type="button"
              class="btn-inline btn-inline--ghost filter-bar__reset"
              @click="resetBundleFilters"
            >
              <svg viewBox="0 0 24 24" class="btn-icon-sm" aria-hidden="true">
                <path :d="mdiFilterRemove" />
              </svg>
              {{ t('backoffice.economy.actions.resetFilters') }}
            </button>
          </Transition>
        </div>

        <div v-if="filteredBundles.length" class="bundles-table-wrap bundles-table-wrap--scroll">
          <table class="items-table">
            <thead>
              <tr>
                <th>{{ t('backoffice.economy.bundles.columns.bundle') }}</th>
                <th>{{ t('backoffice.economy.bundles.columns.items') }}</th>
                <th>{{ t('backoffice.economy.bundles.columns.originalPrice') }}</th>
                <th>{{ t('backoffice.economy.bundles.columns.bundlePrice') }}</th>
                <th>{{ t('backoffice.economy.bundles.columns.saving') }}</th>
                <th>{{ t('backoffice.economy.bundles.columns.expiry') }}</th>
                <th>{{ t('backoffice.economy.bundles.columns.status') }}</th>
                <th>{{ t('backoffice.economy.bundles.columns.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bundle in paginatedBundles" :key="bundle.id">
                <td>
                  <div class="item-cell">
                    <img
                      :src="picsumUrl(bundle.imageSeed, 56, 40)"
                      :alt="bundle.name"
                      class="bundle-thumb"
                    />
                    <div>
                      <strong class="item-cell__name">{{ bundle.name }}</strong>
                      <span v-if="bundle.badge" class="bundle-badge-chip">{{ bundle.badge }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="bundle-items-cell">
                    <img
                      v-for="id in bundle.itemIds.slice(0, 4)"
                      :key="id"
                      :src="picsumUrl(items.find((i) => i.id === id)?.name ?? 'x', 24, 24)"
                      :alt="items.find((i) => i.id === id)?.name"
                      class="bundle-item-mini"
                      :title="items.find((i) => i.id === id)?.name"
                    />
                    <span v-if="bundle.itemIds.length > 4" class="item-cell__meta">
                      +{{ bundle.itemIds.length - 4 }}
                    </span>
                  </div>
                </td>
                <td>
                  <span
                    style="
                      text-decoration: line-through;
                      color: rgba(252, 239, 225, 0.38);
                      font-size: 0.86rem;
                    "
                  >
                    {{ bundle.originalPrice }} ◈
                  </span>
                </td>
                <td>
                  <strong class="item-cell__name">{{ bundle.bundlePrice }} ◈</strong>
                </td>
                <td>
                  <span class="meta-item meta-item--saving">
                    -{{ Math.round((1 - bundle.bundlePrice / bundle.originalPrice) * 100) }}%
                  </span>
                </td>
                <td>
                  <span v-if="bundle.expiresAt" class="meta-item">{{
                    formatDate(bundle.expiresAt)
                  }}</span>
                  <span v-else class="meta-item">{{
                    t('backoffice.economy.bundles.permanent')
                  }}</span>
                </td>
                <td>
                  <button
                    type="button"
                    :class="['toggle-mini', bundle.available ? 'toggle-mini--on' : '']"
                    :aria-pressed="bundle.available"
                    @click="shopStore.updateBundle(bundle.id, { available: !bundle.available })"
                  >
                    <span class="toggle-mini__switch" aria-hidden="true">
                      <span class="toggle-mini__knob" />
                    </span>
                    <span class="toggle-mini__text">
                      {{
                        bundle.available
                          ? t('backoffice.economy.shop.statuses.available')
                          : t('backoffice.economy.shop.statuses.hidden')
                      }}
                    </span>
                  </button>
                </td>
                <td>
                  <div class="row-actions">
                    <button
                      type="button"
                      class="btn-inline btn-inline--ghost btn-inline--small"
                      @click="openBundleModal(bundle)"
                    >
                      {{ t('backoffice.economy.bundles.edit') }}
                    </button>
                    <button
                      type="button"
                      class="btn-inline btn-inline--danger btn-inline--small"
                      @click="confirmDeleteBundle(bundle.id)"
                    >
                      {{ t('backoffice.economy.bundles.delete') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination bundles -->
        <div v-if="filteredBundles.length > bundlesPerPage" class="table-pagination">
          <div class="pagination-info">
            {{
              t('backoffice.economy.shop.pagination.showing', {
                from: bundlesPageStart + 1,
                to: Math.min(bundlesPageStart + bundlesPerPage, filteredBundles.length),
                total: filteredBundles.length,
              })
            }}
          </div>
          <div class="pagination-controls">
            <button
              type="button"
              class="page-btn"
              :disabled="bundlesPage === 1"
              @click="bundlesPage = 1"
            >
              «
            </button>
            <button
              type="button"
              class="page-btn"
              :disabled="bundlesPage === 1"
              @click="bundlesPage--"
            >
              ‹
            </button>
            <button
              v-for="p in visibleBundlePages"
              :key="p"
              type="button"
              :class="['page-btn', p === bundlesPage && 'page-btn--active']"
              @click="bundlesPage = p"
            >
              {{ p }}
            </button>
            <button
              type="button"
              class="page-btn"
              :disabled="bundlesPage === bundlesTotalPages"
              @click="bundlesPage++"
            >
              ›
            </button>
            <button
              type="button"
              class="page-btn"
              :disabled="bundlesPage === bundlesTotalPages"
              @click="bundlesPage = bundlesTotalPages"
            >
              »
            </button>
          </div>
          <div class="pagination-size">
            <select
              v-model.number="bundlesPerPage"
              class="select select--mini"
              @change="
                () => {
                  bundlesPage = 1
                }
              "
            >
              <option :value="5">5 / page</option>
              <option :value="10">10 / page</option>
              <option :value="20">20 / page</option>
            </select>
          </div>
        </div>

        <div v-if="!filteredBundles.length" class="empty-state">
          <h3 class="empty-state__title">
            {{
              hasBundleFilters
                ? t('backoffice.economy.bundles.emptyFiltered')
                : t('backoffice.economy.bundles.emptyTitle')
            }}
          </h3>
          <p class="empty-state__text">
            {{
              hasBundleFilters
                ? t('backoffice.economy.bundles.emptyFilteredText')
                : t('backoffice.economy.bundles.emptyText')
            }}
          </p>
        </div>
      </section>

      <!-- ─── Bundle modal ────────────────────────────────────────────── -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="bundleModal.open" class="modal-backdrop" @click.self="closeBundleModal">
            <div class="modal-box">
              <button type="button" class="modal-close" @click="closeBundleModal">✕</button>
              <h3 class="modal-title">
                {{
                  bundleModal.editId
                    ? t('backoffice.economy.bundles.editBundle')
                    : t('backoffice.economy.bundles.addBundle')
                }}
              </h3>

              <!-- Image preview -->
              <div class="bundle-modal-preview">
                <img
                  v-if="bundleModal.imageSeed"
                  :src="picsumUrl(bundleModal.imageSeed, 480, 160)"
                  alt="Aperçu"
                  class="bundle-modal-preview__img"
                />
              </div>

              <div class="bundle-form">
                <!-- Name + Badge -->
                <div class="bundle-form__row bundle-form__row--2">
                  <label class="form-field">
                    <span class="form-field__label">{{
                      t('backoffice.economy.bundles.form.name')
                    }}</span>
                    <input v-model="bundleModal.name" type="text" class="input" />
                  </label>
                  <label class="form-field">
                    <span class="form-field__label">{{
                      t('backoffice.economy.bundles.form.badge')
                    }}</span>
                    <select v-model="bundleModal.badge" class="select">
                      <option value="">{{ t('backoffice.economy.bundles.form.noBadge') }}</option>
                      <option v-for="b in BUNDLE_BADGES" :key="b" :value="b">{{ b }}</option>
                    </select>
                  </label>
                </div>

                <!-- Description -->
                <label class="form-field">
                  <span class="form-field__label">{{
                    t('backoffice.economy.bundles.form.description')
                  }}</span>
                  <input v-model="bundleModal.description" type="text" class="input" />
                </label>

                <!-- Image seed -->
                <label class="form-field">
                  <span class="form-field__label">{{
                    t('backoffice.economy.bundles.form.imageSeed')
                  }}</span>
                  <div class="form-field__control">
                    <input
                      v-model="bundleModal.imageSeed"
                      type="text"
                      class="input"
                      :placeholder="t('backoffice.economy.bundles.form.imageSeedHint')"
                    />
                  </div>
                  <span class="form-field__hint">{{
                    t('backoffice.economy.bundles.form.imageSeedDesc')
                  }}</span>
                </label>

                <!-- Gradient presets -->
                <div class="form-field">
                  <span class="form-field__label">{{
                    t('backoffice.economy.bundles.form.gradient')
                  }}</span>
                  <div class="gradient-presets">
                    <button
                      v-for="preset in GRADIENT_PRESETS"
                      :key="preset.label"
                      type="button"
                      :class="[
                        'gradient-swatch',
                        bundleModal.gradient === preset.value && 'gradient-swatch--active',
                      ]"
                      :style="{ background: preset.value }"
                      :title="preset.label"
                      @click="bundleModal.gradient = preset.value"
                    ></button>
                  </div>
                </div>

                <!-- Price + Expiry -->
                <div class="bundle-form__row bundle-form__row--2">
                  <label class="form-field">
                    <span class="form-field__label">{{
                      t('backoffice.economy.bundles.form.bundlePrice')
                    }}</span>
                    <div class="form-field__control">
                      <input
                        v-model.number="bundleModal.bundlePrice"
                        type="number"
                        min="0"
                        step="5"
                        class="input"
                      />
                      <span class="form-field__unit">◈</span>
                    </div>
                    <span class="form-field__hint">
                      {{
                        t('backoffice.economy.bundles.form.originalPriceHint', {
                          price: bundleModalOriginalPrice,
                        })
                      }}
                    </span>
                  </label>
                  <label class="form-field">
                    <span class="form-field__label">{{
                      t('backoffice.economy.bundles.form.expiry')
                    }}</span>
                    <input v-model="bundleModal.expiresAt" type="datetime-local" class="input" />
                    <span class="form-field__hint">{{
                      t('backoffice.economy.bundles.form.expiryHint')
                    }}</span>
                  </label>
                </div>

                <!-- Items multiselect -->
                <div class="form-field">
                  <span class="form-field__label">
                    {{ t('backoffice.economy.bundles.form.items') }}
                    <span class="meta-item" style="margin-left: 0.4rem"
                      >{{ bundleModal.itemIds.length }}
                      {{ t('backoffice.economy.bundles.form.selected') }}</span
                    >
                  </span>
                  <input
                    v-model="itemSearch"
                    type="text"
                    class="input"
                    style="margin-bottom: 0.5rem"
                    :placeholder="t('backoffice.economy.bundles.form.searchItems')"
                  />
                  <div class="item-multiselect">
                    <label
                      v-for="item in filteredBundleItems"
                      :key="item.id"
                      :class="[
                        'item-checkbox',
                        bundleModal.itemIds.includes(item.id) && 'item-checkbox--checked',
                      ]"
                    >
                      <input
                        type="checkbox"
                        :value="item.id"
                        v-model="bundleModal.itemIds"
                        class="sr-only"
                      />
                      <img
                        :src="picsumUrl(item.name, 28, 28)"
                        :alt="item.name"
                        class="item-checkbox__img"
                      />
                      <span class="item-checkbox__name">{{ item.name }}</span>
                      <span class="item-checkbox__meta">{{ item.price }} ◈</span>
                      <span
                        v-if="bundleModal.itemIds.includes(item.id)"
                        class="item-checkbox__check"
                        >✓</span
                      >
                    </label>
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button
                  type="button"
                  class="btn-inline btn-inline--ghost"
                  @click="closeBundleModal"
                >
                  {{ t('backoffice.economy.actions.cancel') }}
                </button>
                <button
                  type="button"
                  class="btn-inline btn-inline--primary"
                  :disabled="!bundleModal.name || bundleModal.itemIds.length < 2"
                  @click="saveBundle"
                >
                  {{
                    bundleModal.editId
                      ? t('backoffice.economy.bundles.form.save')
                      : t('backoffice.economy.bundles.form.create')
                  }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- ─── Journal ──────────────────────────────────────────────────── -->
      <section class="surface">
        <div class="surface-header">
          <div>
            <h2 class="surface-title">{{ t('backoffice.economy.journal.title') }}</h2>
            <p class="surface-subtitle">{{ t('backoffice.economy.journal.subtitle') }}</p>
          </div>
          <div class="journal-tabs">
            <button
              type="button"
              :class="['journal-tab', journalTab === 'transactions' && 'journal-tab--active']"
              @click="journalTab = 'transactions'"
            >
              {{ t('backoffice.economy.journal.tabs.transactions') }}
              <span class="journal-tab__count">{{ shopStore.transactions.length }}</span>
            </button>
            <button
              type="button"
              :class="['journal-tab', journalTab === 'audit' && 'journal-tab--active']"
              @click="journalTab = 'audit'"
            >
              {{ t('backoffice.economy.journal.tabs.audit') }}
              <span class="journal-tab__count">{{ auditTrail.length }}</span>
            </button>
          </div>
        </div>

        <!-- ─ Transactions ─────────────────────────────────────────────── -->
        <template v-if="journalTab === 'transactions'">
          <div class="filter-bar filter-bar--sm">
            <div class="filter-bar__search">
              <svg viewBox="0 0 24 24" class="filter-bar__search-icon" aria-hidden="true">
                <path :d="mdiMagnify" />
              </svg>
              <input
                v-model="txSearch"
                class="input input--compact"
                :placeholder="t('backoffice.economy.journal.searchPlaceholder')"
              />
            </div>

            <select v-model="txTypeFilter" class="select select--compact">
              <option value="all">{{ t('backoffice.economy.journal.filters.allTypes') }}</option>
              <option value="purchase">
                {{ t('backoffice.economy.journal.filters.purchase') }}
              </option>
              <option value="payment_sim">
                {{ t('backoffice.economy.journal.filters.payment') }}
              </option>
              <option value="reward">{{ t('backoffice.economy.journal.filters.reward') }}</option>
            </select>

            <select v-model="txStatusFilter" class="select select--compact">
              <option value="all">{{ t('backoffice.economy.journal.filters.allStatuses') }}</option>
              <option value="success">{{ t('backoffice.economy.journal.filters.success') }}</option>
              <option value="fail">{{ t('backoffice.economy.journal.filters.fail') }}</option>
            </select>

            <select v-model="txCurrencyFilter" class="select select--compact">
              <option value="all">
                {{ t('backoffice.economy.journal.filters.allCurrencies') }}
              </option>
              <option value="soft">{{ t('backoffice.economy.currencies.soft') }}</option>
              <option value="hard">{{ t('backoffice.economy.currencies.hard') }}</option>
              <option value="eur">EUR</option>
            </select>

            <Transition name="fade-btn">
              <button
                v-if="hasTxFilters"
                type="button"
                class="btn-inline btn-inline--ghost filter-bar__reset"
                @click="resetTxFilters"
              >
                <svg viewBox="0 0 24 24" class="btn-icon-sm" aria-hidden="true">
                  <path :d="mdiFilterRemove" />
                </svg>
                {{ t('backoffice.economy.actions.resetFilters') }}
              </button>
            </Transition>
          </div>

          <div v-if="filteredTx.length" class="items-table-wrap">
            <table class="items-table">
              <thead>
                <tr>
                  <th>{{ t('backoffice.economy.journal.columns.player') }}</th>
                  <th>{{ t('backoffice.economy.journal.columns.item') }}</th>
                  <th>{{ t('backoffice.economy.journal.columns.type') }}</th>
                  <th>{{ t('backoffice.economy.journal.columns.amount') }}</th>
                  <th>{{ t('backoffice.economy.journal.columns.currency') }}</th>
                  <th>{{ t('backoffice.economy.journal.columns.status') }}</th>
                  <th>{{ t('backoffice.economy.journal.columns.date') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in paginatedTx" :key="tx.id">
                  <td>
                    <div class="player-cell">
                      <div class="player-cell__avatar">
                        {{ tx.playerName?.charAt(0).toUpperCase() }}
                      </div>
                      <strong class="item-cell__name">{{ tx.playerName }}</strong>
                    </div>
                  </td>
                  <td>
                    <span class="item-cell__name">{{ tx.itemName ?? '—' }}</span>
                  </td>
                  <td>
                    <span :class="['type-badge', `type-badge--${tx.type}`]">
                      {{ t(`backoffice.economy.journal.types.${tx.type}`) }}
                    </span>
                  </td>
                  <td>
                    <strong class="item-cell__name">
                      {{
                        tx.currency === 'eur'
                          ? tx.amount.toFixed(2).replace('.', ',') + ' €'
                          : tx.amount.toLocaleString(locale)
                      }}
                    </strong>
                  </td>
                  <td>
                    <span :class="['currency-badge', `currency-badge--${tx.currency}`]">
                      {{ tx.currency === 'soft' ? '◇' : tx.currency === 'hard' ? '◈' : '€' }}
                      {{ tx.currency.toUpperCase() }}
                    </span>
                  </td>
                  <td>
                    <span :class="['status-dot', `status-dot--${tx.status}`]"></span>
                    <span class="item-cell__meta">{{
                      t(`backoffice.economy.journal.filters.${tx.status}`)
                    }}</span>
                  </td>
                  <td>
                    <span class="item-cell__meta">{{ formatDate(tx.createdAt) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="empty-state">
            <h3 class="empty-state__title">{{ t('backoffice.economy.journal.emptyTitle') }}</h3>
            <p class="empty-state__text">{{ t('backoffice.economy.journal.emptyText') }}</p>
          </div>

          <!-- Pagination transactions -->
          <div v-if="filteredTx.length > txPerPage" class="table-pagination">
            <div class="pagination-info">
              {{
                t('backoffice.economy.shop.pagination.showing', {
                  from: txPageStart + 1,
                  to: Math.min(txPageStart + txPerPage, filteredTx.length),
                  total: filteredTx.length,
                })
              }}
            </div>
            <div class="pagination-controls">
              <button type="button" class="page-btn" :disabled="txPage === 1" @click="txPage = 1">
                «
              </button>
              <button type="button" class="page-btn" :disabled="txPage === 1" @click="txPage--">
                ‹
              </button>
              <button
                v-for="p in visibleTxPages"
                :key="p"
                type="button"
                :class="['page-btn', p === txPage && 'page-btn--active']"
                @click="txPage = p"
              >
                {{ p }}
              </button>
              <button
                type="button"
                class="page-btn"
                :disabled="txPage === txTotalPages"
                @click="txPage++"
              >
                ›
              </button>
              <button
                type="button"
                class="page-btn"
                :disabled="txPage === txTotalPages"
                @click="txPage = txTotalPages"
              >
                »
              </button>
            </div>
            <div class="pagination-size">
              <select
                v-model.number="txPerPage"
                class="select select--mini"
                @change="
                  () => {
                    txPage = 1
                  }
                "
              >
                <option :value="10">10 / page</option>
                <option :value="20">20 / page</option>
                <option :value="50">50 / page</option>
              </select>
            </div>
          </div>
        </template>

        <!-- ─ Audit config ──────────────────────────────────────────────── -->
        <template v-if="journalTab === 'audit'">
          <div v-if="auditTrail.length" class="history-list">
            <article v-for="entry in auditTrail.slice(0, 20)" :key="entry.id" class="history-item">
              <div class="history-item__icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path :d="entry.kind === 'price' ? mdiCartOutline : mdiTrophyOutline" />
                </svg>
              </div>
              <div class="history-item__body">
                <strong class="history-item__title">{{ entry.summary }}</strong>
                <span class="history-item__meta">{{ entry.actor }}</span>
              </div>
              <span class="meta-item">{{ formatDate(entry.timestamp) }}</span>
            </article>
          </div>
          <div v-else class="empty-state">
            <h3 class="empty-state__title">{{ t('backoffice.economy.history.emptyTitle') }}</h3>
            <p class="empty-state__text">{{ t('backoffice.economy.history.emptyText') }}</p>
          </div>
        </template>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { mdiCartOutline, mdiFilterRemove, mdiMagnify, mdiTrophyOutline } from '@mdi/js'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import {
  type Bundle,
  GRADIENT_PRESETS,
  picsumUrl,
  type ShopItem,
  useShopStore,
} from '@/stores/shopStore'
import { useUserStore } from '@/stores/userStore'

type ItemCategory = 'cosmetic' | 'pack' | 'pass' | 'boost'
type ItemCurrency = 'soft' | 'hard'
type FeedbackType = 'success' | 'warning' | 'error'
type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary'
type ItemSlot = 'avatar' | 'banner' | 'frame' | 'emote' | 'trail' | 'spray' | null

type RewardsConfig = {
  xpWin: number
  xpLoss: number
  softWin: number
  softLoss: number
  dailyQuestSoft: number
  levelUpHard: number
}

type AuditEntry = {
  id: number
  kind: 'price' | 'rewards' | 'availability'
  summary: string
  actor: string
  timestamp: string
}

const router = useRouter()
const userStore = useUserStore()
const { profile } = storeToRefs(userStore)
const { t, locale } = useI18n({ useScope: 'global' })
const shopStore = useShopStore()

// ─── Items bridged from shopStore ────────────────────────────────────────────
// `items` is a computed alias so the table still works with its local refs
const items = computed(() => shopStore.shopItems)

// ─── Item modal constants ────────────────────────────────────────────────────
const ITEM_CATEGORIES = computed(() => [
  { value: 'cosmetic' as const, label: t('backoffice.economy.shop.categories.cosmetic') },
  { value: 'pack' as const, label: t('backoffice.economy.shop.categories.pack') },
  { value: 'pass' as const, label: t('backoffice.economy.shop.categories.pass') },
  { value: 'boost' as const, label: t('backoffice.economy.shop.categories.boost') },
])

const ITEM_SLOTS = computed(() => [
  { value: null as ItemSlot, label: t('backoffice.economy.shop.modal.noSlot') },
  { value: 'avatar' as ItemSlot, label: t('shop.slots.avatar') },
  { value: 'banner' as ItemSlot, label: t('shop.slots.banner') },
  { value: 'frame' as ItemSlot, label: t('shop.slots.frame') },
  { value: 'emote' as ItemSlot, label: t('shop.slots.emote') },
  { value: 'trail' as ItemSlot, label: t('shop.slots.trail') },
  { value: 'spray' as ItemSlot, label: t('shop.slots.spray') },
])

const ITEM_RARITIES = computed(() => [
  { value: 'common' as ItemRarity, label: t('backoffice.economy.shop.rarities.common') },
  { value: 'rare' as ItemRarity, label: t('backoffice.economy.shop.rarities.rare') },
  { value: 'epic' as ItemRarity, label: t('backoffice.economy.shop.rarities.epic') },
  { value: 'legendary' as ItemRarity, label: t('backoffice.economy.shop.rarities.legendary') },
])

// ─── Item modal state ────────────────────────────────────────────────────────
const itemModal = reactive({
  open: false,
  editId: null as number | null,
  name: '',
  imageSeed: '',
  category: 'cosmetic' as ItemCategory,
  slot: null as ItemSlot,
  rarity: 'common' as ItemRarity,
  currency: 'hard' as ItemCurrency,
  price: 0,
  isNew: false,
  isFeatured: false,
  available: true,
})

function openItemModal(item: ShopItem | null) {
  if (item) {
    itemModal.editId = item.id
    itemModal.name = item.name
    itemModal.imageSeed = item.imageSeed ?? ''
    itemModal.category = item.category
    itemModal.slot = item.slot
    itemModal.rarity = item.rarity
    itemModal.currency = item.currency
    itemModal.price = item.price
    itemModal.isNew = item.isNew
    itemModal.isFeatured = item.isFeatured
    itemModal.available = item.available
  } else {
    itemModal.editId = null
    itemModal.name = ''
    itemModal.imageSeed = `item-custom-${Date.now()}`
    itemModal.category = 'cosmetic'
    itemModal.slot = 'avatar'
    itemModal.rarity = 'common'
    itemModal.currency = 'hard'
    itemModal.price = 100
    itemModal.isNew = true
    itemModal.isFeatured = false
    itemModal.available = true
  }
  itemModal.open = true
}

function closeItemModal() {
  itemModal.open = false
}

function saveItemModal() {
  const data: Omit<ShopItem, 'id' | 'sales7d'> = {
    name: itemModal.name.trim(),
    imageSeed: itemModal.imageSeed || `item-custom-${Date.now()}`,
    category: itemModal.category,
    slot: itemModal.slot,
    rarity: itemModal.rarity,
    currency: itemModal.currency,
    price: itemModal.price,
    isNew: itemModal.isNew,
    isFeatured: itemModal.isFeatured,
    available: itemModal.available,
  }

  const actor = profile.value?.username || 'Admin'
  const now = new Date().toISOString()

  if (itemModal.editId) {
    shopStore.updateShopItem(itemModal.editId, data)
    auditTrail.value.unshift({
      id: Date.now(),
      kind: 'price',
      summary: `Article "${data.name}" mis à jour (${data.price} ${data.currency === 'soft' ? '◇' : '◈'})`,
      actor,
      timestamp: now,
    })
    feedback.value = {
      type: 'success',
      message: t('backoffice.economy.shop.modal.feedback.updated', { name: data.name }),
    }
  } else {
    shopStore.addShopItem(data)
    auditTrail.value.unshift({
      id: Date.now(),
      kind: 'price',
      summary: `Article "${data.name}" créé — ${data.rarity}, ${data.price} ${data.currency === 'soft' ? '◇' : '◈'}`,
      actor,
      timestamp: now,
    })
    feedback.value = {
      type: 'success',
      message: t('backoffice.economy.shop.modal.feedback.created', { name: data.name }),
    }
  }

  closeItemModal()
}

function confirmDeleteItem(id: number) {
  const item = shopStore.getItemById(id)
  if (!item) return
  shopStore.deleteShopItem(id)
  // Remove from pending maps
  delete pendingPrices[id]
  delete pendingAvailability[id]
  const actor = profile.value?.username || 'Admin'
  auditTrail.value.unshift({
    id: Date.now(),
    kind: 'availability',
    summary: `Article "${item.name}" supprimé`,
    actor,
    timestamp: new Date().toISOString(),
  })
  feedback.value = {
    type: 'warning',
    message: t('backoffice.economy.shop.modal.feedback.deleted', { name: item.name }),
  }
}

const BUNDLE_BADGES = ['Limité', 'Nouveau', 'Populaire', 'Exclusif'] as const

// ─── Item filters helpers ────────────────────────────────────────────────────
const hasItemFilters = computed(
  () => !!search.value || selectedCategory.value !== 'all' || selectedCurrency.value !== 'all',
)

function resetItemFilters() {
  search.value = ''
  selectedCategory.value = 'all'
  selectedCurrency.value = 'all'
}

// ─── Bundle modal state ──────────────────────────────────────────────────────
const bundleModal = reactive({
  open: false,
  editId: null as number | null,
  name: '',
  description: '',
  badge: '' as string,
  gradient: GRADIENT_PRESETS[0]!.value,
  imageSeed: '',
  bundlePrice: 0,
  expiresAt: '',
  itemIds: [] as number[],
})
const itemSearch = ref('')

const filteredBundleItems = computed(() => {
  const q = itemSearch.value.trim().toLowerCase()
  return items.value.filter(
    (item) => !q || item.name.toLowerCase().includes(q) || String(item.id).includes(q),
  )
})

const bundleModalOriginalPrice = computed(() =>
  bundleModal.itemIds
    .map((id) => items.value.find((i) => i.id === id)?.price ?? 0)
    .reduce((s, p) => s + p, 0),
)

function openBundleModal(bundle: Bundle | null) {
  if (bundle) {
    bundleModal.editId = bundle.id
    bundleModal.name = bundle.name
    bundleModal.description = bundle.description
    bundleModal.badge = bundle.badge ?? ''
    bundleModal.gradient = bundle.gradient ?? GRADIENT_PRESETS[0]!.value
    bundleModal.imageSeed = (bundle as Bundle & Record<string, unknown>).imageSeed ?? ''
    bundleModal.bundlePrice = bundle.bundlePrice
    bundleModal.expiresAt = bundle.expiresAt
      ? new Date(bundle.expiresAt).toISOString().slice(0, 16)
      : ''
    bundleModal.itemIds = [...bundle.itemIds]
  } else {
    bundleModal.editId = null
    bundleModal.name = ''
    bundleModal.description = ''
    bundleModal.badge = ''
    bundleModal.gradient = GRADIENT_PRESETS[0]!.value
    bundleModal.imageSeed = `bundle-custom-${Date.now()}`
    bundleModal.bundlePrice = 0
    bundleModal.expiresAt = ''
    bundleModal.itemIds = []
  }
  itemSearch.value = ''
  bundleModal.open = true
}

function closeBundleModal() {
  bundleModal.open = false
}

function saveBundle() {
  const data = {
    name: bundleModal.name,
    description: bundleModal.description,
    badge: bundleModal.badge || null,
    gradient: bundleModal.gradient,
    imageSeed: bundleModal.imageSeed || `bundle-custom-${Date.now()}`,
    bundlePrice: bundleModal.bundlePrice,
    itemIds: [...bundleModal.itemIds],
    currency: 'hard' as const,
    expiresAt: bundleModal.expiresAt ? new Date(bundleModal.expiresAt).toISOString() : null,
    available: true,
    originalPrice: 0,
  }
  if (bundleModal.editId) {
    shopStore.updateBundle(bundleModal.editId, data)
    auditTrail.value.unshift({
      id: Date.now(),
      kind: 'price',
      summary: `Bundle "${data.name}" mis à jour`,
      actor: profile.value?.username ?? 'Admin',
      timestamp: new Date().toISOString(),
    })
    showFeedback('success', t('backoffice.economy.bundles.feedback.updated', { name: data.name }))
  } else {
    shopStore.addBundle(data)
    auditTrail.value.unshift({
      id: Date.now(),
      kind: 'price',
      summary: `Bundle "${data.name}" créé (${data.itemIds.length} items, ${data.bundlePrice} ◈)`,
      actor: profile.value?.username ?? 'Admin',
      timestamp: new Date().toISOString(),
    })
    showFeedback('success', t('backoffice.economy.bundles.feedback.created', { name: data.name }))
  }
  closeBundleModal()
}

function confirmDeleteBundle(id: number) {
  const bundle = shopStore.bundles.find((b) => b.id === id)
  if (!bundle) return
  shopStore.deleteBundle(id)
  auditTrail.value.unshift({
    id: Date.now(),
    kind: 'price',
    summary: `Bundle "${bundle.name}" supprimé`,
    actor: profile.value?.username ?? 'Admin',
    timestamp: new Date().toISOString(),
  })
  showFeedback('warning', t('backoffice.economy.bundles.feedback.deleted', { name: bundle.name }))
}

function showFeedback(type: FeedbackType, message: string) {
  feedback.value = { type, message }
  setTimeout(() => {
    feedback.value = null
  }, 3500)
}

const feedback = ref<{ type: FeedbackType; message: string } | null>(null)
const savingItemId = ref<number | null>(null)
const rewardsSaving = ref(false)

const search = ref('')
const selectedCategory = ref<'all' | ItemCategory>('all')
const selectedCurrency = ref<'all' | ItemCurrency>('all')

// ─── Items pagination ────────────────────────────────────────────────────────
const itemsPage = ref(1)
const itemsPerPage = ref(10)

const itemsTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredItems.value.length / itemsPerPage.value)),
)
const itemsPageStart = computed(() => (itemsPage.value - 1) * itemsPerPage.value)
const paginatedItems = computed(() =>
  filteredItems.value.slice(itemsPageStart.value, itemsPageStart.value + itemsPerPage.value),
)
const visibleItemPages = computed(() => {
  const total = itemsTotalPages.value
  const cur = itemsPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: number[] = []
  const start = Math.max(1, cur - 2)
  const end = Math.min(total, cur + 2)
  if (start > 1) pages.push(1)
  if (start > 2) pages.push(-1) // ellipsis sentinel
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push(-2)
  if (end < total) pages.push(total)
  return pages
})

// ─── Bundles filters ─────────────────────────────────────────────────────────
const bundleSearch = ref('')
const selectedBundleBadge = ref('')
const selectedBundleStatus = ref<'all' | 'available' | 'hidden' | 'expiring'>('all')

const hasBundleFilters = computed(
  () => !!bundleSearch.value || !!selectedBundleBadge.value || selectedBundleStatus.value !== 'all',
)

function resetBundleFilters() {
  bundleSearch.value = ''
  selectedBundleBadge.value = ''
  selectedBundleStatus.value = 'all'
}

const filteredBundles = computed(() => {
  const q = bundleSearch.value.trim().toLowerCase()
  return shopStore.bundles.filter((b) => {
    const matchQ =
      !q || b.name.toLowerCase().includes(q) || (b.description ?? '').toLowerCase().includes(q)
    const matchBadge = !selectedBundleBadge.value
      ? true
      : selectedBundleBadge.value === '__none'
        ? !b.badge
        : b.badge === selectedBundleBadge.value
    const matchStatus =
      selectedBundleStatus.value === 'all'
        ? true
        : selectedBundleStatus.value === 'available'
          ? b.available
          : selectedBundleStatus.value === 'hidden'
            ? !b.available
            : /* expiring */ b.available &&
              !!b.expiresAt &&
              new Date(b.expiresAt).getTime() - Date.now() < 3 * 86_400_000
    return matchQ && matchBadge && matchStatus
  })
})

// ─── Bundles pagination ──────────────────────────────────────────────────────
const bundlesPage = ref(1)
const bundlesPerPage = ref(5)

const bundlesTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredBundles.value.length / bundlesPerPage.value)),
)
const bundlesPageStart = computed(() => (bundlesPage.value - 1) * bundlesPerPage.value)
const paginatedBundles = computed(() =>
  filteredBundles.value.slice(
    bundlesPageStart.value,
    bundlesPageStart.value + bundlesPerPage.value,
  ),
)
const visibleBundlePages = computed(() => {
  const total = bundlesTotalPages.value
  const cur = bundlesPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: number[] = []
  const start = Math.max(1, cur - 2)
  const end = Math.min(total, cur + 2)
  if (start > 1) pages.push(1)
  if (start > 2) pages.push(-1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push(-2)
  if (end < total) pages.push(total)
  return pages
})

watch([bundleSearch, selectedBundleBadge, selectedBundleStatus], () => {
  bundlesPage.value = 1
})

const economySnapshot = ref({
  softCurrencyEarned: 1280450,
  hardCurrencySold: 48230,
  virtualRevenue: 18430,
  transactionsLast7d: 2884,
})

const pendingPrices = reactive<Record<number, number>>({})
const pendingAvailability = reactive<Record<number, boolean>>({})

// Initialize pending maps from shopStore items (reactive to new items)
shopStore.shopItems.forEach((item) => {
  if (pendingPrices[item.id] === undefined) pendingPrices[item.id] = item.price
  if (pendingAvailability[item.id] === undefined) pendingAvailability[item.id] = item.available
})

const baseRewards: RewardsConfig = {
  xpWin: 150,
  xpLoss: 50,
  softWin: 100,
  softLoss: 25,
  dailyQuestSoft: 250,
  levelUpHard: 5,
}

const currentRewards = ref<RewardsConfig>({ ...baseRewards })
const pendingRewards = reactive<RewardsConfig>({ ...baseRewards })

const rewardsLastUpdatedAt = ref(hoursAgo(48))
const rewardsLastUpdatedBy = ref('enzo')

const auditTrail = ref<AuditEntry[]>([
  {
    id: 1,
    kind: 'price',
    summary: 'Season 4 Pass: 100 → 120 ⬢',
    actor: 'enzo',
    timestamp: hoursAgo(12),
  },
  {
    id: 2,
    kind: 'rewards',
    summary: 'XP Win: 120 → 150',
    actor: 'enzo',
    timestamp: hoursAgo(48),
  },
  {
    id: 3,
    kind: 'availability',
    summary: 'Legacy Frame: hidden',
    actor: 'alice',
    timestamp: hoursAgo(96),
  },
])

const categoryOptions = computed(() => [
  { value: 'all' as const, label: t('backoffice.economy.shop.filters.allCategories') },
  { value: 'cosmetic' as const, label: t('backoffice.economy.shop.categories.cosmetic') },
  { value: 'pack' as const, label: t('backoffice.economy.shop.categories.pack') },
  { value: 'pass' as const, label: t('backoffice.economy.shop.categories.pass') },
  { value: 'boost' as const, label: t('backoffice.economy.shop.categories.boost') },
])

const currencyOptions = computed(() => [
  { value: 'all' as const, label: t('backoffice.economy.shop.filters.allCurrencies') },
  { value: 'soft' as const, label: t('backoffice.economy.currencies.soft') },
  { value: 'hard' as const, label: t('backoffice.economy.currencies.hard') },
])

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()

  return items.value.filter((item) => {
    const matchesQuery =
      query === '' || item.name.toLowerCase().includes(query) || String(item.id).includes(query)

    const matchesCategory =
      selectedCategory.value === 'all' || item.category === selectedCategory.value
    const matchesCurrency =
      selectedCurrency.value === 'all' || item.currency === selectedCurrency.value

    return matchesQuery && matchesCategory && matchesCurrency
  })
})

// Reset page when filters change
watch([search, selectedCategory, selectedCurrency], () => {
  itemsPage.value = 1
})

const dirtyItems = computed(() => {
  const dirty = new Set<number>()

  items.value.forEach((item) => {
    if (pendingPrices[item.id] !== item.price || pendingAvailability[item.id] !== item.available) {
      dirty.add(item.id)
    }
  })

  return dirty
})

const rewardsDirty = computed(() => {
  return (
    pendingRewards.xpWin !== currentRewards.value.xpWin ||
    pendingRewards.xpLoss !== currentRewards.value.xpLoss ||
    pendingRewards.softWin !== currentRewards.value.softWin ||
    pendingRewards.softLoss !== currentRewards.value.softLoss ||
    pendingRewards.dailyQuestSoft !== currentRewards.value.dailyQuestSoft ||
    pendingRewards.levelUpHard !== currentRewards.value.levelUpHard
  )
})

// --- Actions ---------------------------------------------------------------

function goBackToBackoffice() {
  router.push('/backoffice')
}

function resetItem(itemId: number) {
  const item = items.value.find((i) => i.id === itemId)
  if (!item) return

  pendingPrices[itemId] = item.price
  pendingAvailability[itemId] = item.available
}

function resetRewards() {
  Object.assign(pendingRewards, currentRewards.value)
}

function resetAll() {
  items.value.forEach((item) => resetItem(item.id))
  resetRewards()
  feedback.value = null
}

function toggleAvailable(itemId: number) {
  const item = items.value.find((i) => i.id === itemId)
  if (!item) return

  pendingAvailability[itemId] = !getPendingAvailability(item)
}

// ─── Journal state ───────────────────────────────────────────────────────────
const journalTab = ref<'transactions' | 'audit'>('transactions')
const txSearch = ref('')
const txTypeFilter = ref<'all' | 'purchase' | 'payment_sim' | 'reward'>('all')
const txStatusFilter = ref<'all' | 'success' | 'fail'>('all')
const txCurrencyFilter = ref<'all' | 'soft' | 'hard' | 'eur'>('all')
const txPage = ref(1)
const txPerPage = ref(10)

const hasTxFilters = computed(
  () =>
    !!txSearch.value ||
    txTypeFilter.value !== 'all' ||
    txStatusFilter.value !== 'all' ||
    txCurrencyFilter.value !== 'all',
)

function resetTxFilters() {
  txSearch.value = ''
  txTypeFilter.value = 'all'
  txStatusFilter.value = 'all'
  txCurrencyFilter.value = 'all'
}

const filteredTx = computed(() => {
  const q = txSearch.value.trim().toLowerCase()
  return shopStore.transactions.filter((tx) => {
    const matchQ =
      !q ||
      (tx.playerName ?? '').toLowerCase().includes(q) ||
      (tx.itemName ?? '').toLowerCase().includes(q)
    const matchT = txTypeFilter.value === 'all' || tx.type === txTypeFilter.value
    const matchS = txStatusFilter.value === 'all' || tx.status === txStatusFilter.value
    const matchC = txCurrencyFilter.value === 'all' || tx.currency === txCurrencyFilter.value
    return matchQ && matchT && matchS && matchC
  })
})

const txTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredTx.value.length / txPerPage.value)),
)
const txPageStart = computed(() => (txPage.value - 1) * txPerPage.value)
const paginatedTx = computed(() =>
  filteredTx.value.slice(txPageStart.value, txPageStart.value + txPerPage.value),
)
const visibleTxPages = computed(() => {
  const total = txTotalPages.value,
    cur = txPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: number[] = []
  const start = Math.max(1, cur - 2),
    end = Math.min(total, cur + 2)
  if (start > 1) pages.push(1)
  if (start > 2) pages.push(-1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push(-2)
  if (end < total) pages.push(total)
  return pages
})

watch([txSearch, txTypeFilter, txStatusFilter, txCurrencyFilter], () => {
  txPage.value = 1
})

async function saveItem(itemId: number) {
  const item = items.value.find((i) => i.id === itemId)
  if (!item) return

  savingItemId.value = itemId

  const changes: string[] = []
  if (pendingPrices[itemId] !== item.price) {
    changes.push(
      `${item.name}: ${item.price} → ${pendingPrices[itemId]} ${item.currency === 'soft' ? '◇' : '◈'}`,
    )
  }
  if (pendingAvailability[itemId] !== item.available) {
    changes.push(
      `${item.name}: ${pendingAvailability[itemId] ? t('backoffice.economy.shop.statuses.available') : t('backoffice.economy.shop.statuses.hidden')}`,
    )
  }

  await wait(250)

  const actor = profile.value?.username || profile.value?.email || 'POC Admin'
  const now = new Date().toISOString()

  // Persist inline price/availability edits to shopStore
  shopStore.updateShopItem(itemId, {
    price: pendingPrices[itemId] ?? item.price,
    available: pendingAvailability[itemId] ?? item.available,
  })

  changes.forEach((change, idx) => {
    auditTrail.value.unshift({
      id: Date.now() + idx,
      kind: pendingPrices[itemId] !== item.price ? 'price' : 'availability',
      summary: change,
      actor,
      timestamp: now,
    })
  })

  feedback.value = {
    type: 'success',
    message: t('backoffice.economy.feedback.itemSaved', { name: item.name }),
  }

  savingItemId.value = null
}

async function saveRewards() {
  rewardsSaving.value = true

  const changes: string[] = []
  const rewardKeys: Array<keyof RewardsConfig> = [
    'xpWin',
    'xpLoss',
    'softWin',
    'softLoss',
    'dailyQuestSoft',
    'levelUpHard',
  ]

  const rewardLabels: Record<keyof RewardsConfig, string> = {
    xpWin: 'XP Win',
    xpLoss: 'XP Loss',
    softWin: 'Soft Win',
    softLoss: 'Soft Loss',
    dailyQuestSoft: 'Daily Quest',
    levelUpHard: 'Level Up',
  }

  rewardKeys.forEach((key) => {
    if (pendingRewards[key] !== currentRewards.value[key]) {
      changes.push(`${rewardLabels[key]}: ${currentRewards.value[key]} → ${pendingRewards[key]}`)
    }
  })

  await wait(280)

  const actor = profile.value?.username || profile.value?.email || 'POC Admin'
  const now = new Date().toISOString()

  currentRewards.value = { ...pendingRewards }
  rewardsLastUpdatedAt.value = now
  rewardsLastUpdatedBy.value = actor

  changes.forEach((change, idx) => {
    auditTrail.value.unshift({
      id: Date.now() + idx,
      kind: 'rewards',
      summary: change,
      actor,
      timestamp: now,
    })
  })

  feedback.value = {
    type: 'success',
    message: t('backoffice.economy.feedback.rewardsSaved'),
  }

  rewardsSaving.value = false
}

// --- Helpers ---------------------------------------------------------------

function getPendingAvailability(item: ShopItem) {
  return pendingAvailability[item.id] ?? item.available
}

function getCategoryLabel(category: ItemCategory) {
  return t(`backoffice.economy.shop.categories.${category}`)
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value.startsWith('fr') ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

onMounted(() => {
  const role = profile.value?.role ?? ''

  if (!['admin', 'moderator'].includes(role)) {
    router.replace('/home')
  }
})
</script>

<style scoped>
.backoffice-page {
  min-height: calc(100vh - var(--footer-height));
  padding: 2rem;
  color: var(--color-cream);
}

.page-shell {
  max-width: 1380px;
  margin: 0 auto;
}

.page-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr);
  gap: 1.5rem;
  padding: 1.75rem;
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(135deg, rgba(81, 96, 121, 0.74), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
  position: relative;
  overflow: hidden;
}

.page-hero::before {
  content: '';
  position: absolute;
  inset: -1px;
  background:
    radial-gradient(circle at 12% 0%, rgba(242, 139, 91, 0.22), transparent 34%),
    radial-gradient(circle at 88% 10%, rgba(247, 167, 132, 0.12), transparent 32%);
  pointer-events: none;
}

.page-hero > * {
  position: relative;
  z-index: 1;
}

.page-hero__content {
  display: grid;
  gap: 1rem;
}

.page-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.page-badge {
  display: inline-flex;
  width: fit-content;
  padding: 0.38rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(242, 139, 91, 0.36);
  background: rgba(242, 139, 91, 0.16);
  color: var(--color-primary-strong);
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-title {
  margin: 0.9rem 0 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.8rem, 2.6vw, 2.6rem);
  color: var(--color-cream);
  font-weight: 900;
  letter-spacing: -0.04em;
}

.page-subtitle {
  margin: 0.55rem 0 0;
  max-width: 720px;
  color: rgba(252, 239, 225, 0.68);
  line-height: 1.6;
}

.btn,
.btn-inline {
  border-radius: 14px;
  border: 1px solid transparent;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease,
    filter 0.18s ease;
}

.btn {
  min-height: 42px;
  padding: 0.85rem 1.1rem;
  font-size: 0.9rem;
}

.btn-inline {
  min-height: 38px;
  padding: 0.58rem 0.9rem;
  font-size: 0.84rem;
}

.btn:hover:not(:disabled),
.btn-inline:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled,
.btn-inline:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn--primary,
.btn-inline--primary {
  color: var(--color-navy);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-strong));
  border-color: rgba(242, 139, 91, 0.42);
  box-shadow: 0 16px 30px -20px rgba(242, 139, 91, 0.95);
}

.btn--primary:hover:not(:disabled),
.btn-inline--primary:hover:not(:disabled) {
  filter: brightness(1.04);
}

.btn--ghost,
.btn-inline--ghost {
  color: rgba(252, 239, 225, 0.84);
  background: rgba(18, 24, 38, 0.34);
  border-color: rgba(252, 239, 225, 0.12);
}

.btn--ghost:hover:not(:disabled),
.btn-inline--ghost:hover:not(:disabled) {
  color: var(--color-cream);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.38);
}

.btn-inline--small {
  min-height: 32px;
  padding: 0.42rem 0.68rem;
  font-size: 0.76rem;
}

.hero-side {
  padding: 1.25rem;
  border-radius: 22px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    radial-gradient(circle at top right, rgba(242, 139, 91, 0.2), transparent 38%),
    rgba(18, 24, 38, 0.38);
  color: var(--color-cream);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-side__label {
  color: var(--color-primary-strong);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-side__title {
  margin-top: 0.35rem;
  font-size: 1.15rem;
  font-weight: 900;
}

.hero-side__text {
  margin-top: 0.4rem;
  color: rgba(252, 239, 225, 0.68);
  font-size: 0.92rem;
  line-height: 1.55;
}

.hero-side__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.hero-side__chips span {
  display: inline-flex;
  padding: 0.32rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  font-size: 0.74rem;
  font-weight: 800;
  background: rgba(18, 24, 38, 0.36);
  color: rgba(252, 239, 225, 0.78);
}

.feedback-banner {
  margin-top: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  font-weight: 900;
  line-height: 1.45;
}

.feedback-banner--success {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border: 1px solid rgba(61, 191, 125, 0.32);
}

.feedback-banner--error {
  color: #ffb3b3;
  background: rgba(225, 91, 91, 0.14);
  border: 1px solid rgba(225, 91, 91, 0.35);
}

.currency-grid {
  margin-top: 1.5rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.currency-card {
  padding: 1.15rem;
  border-radius: 22px;
  border: 1px solid rgba(252, 239, 225, 0.11);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.72), rgba(46, 50, 68, 0.9)), var(--color-navy);
  box-shadow: 0 18px 42px -30px rgba(0, 0, 0, 0.8);
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.currency-card:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 139, 91, 0.34);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.82), rgba(46, 50, 68, 0.98)), var(--color-navy);
}

.currency-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.24);
}

.currency-card__icon svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
}

.currency-card--soft .currency-card__icon {
  color: var(--color-primary-strong);
}

.currency-card--hard .currency-card__icon {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.24);
}

.currency-card--revenue .currency-card__icon {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.14);
  border-color: rgba(61, 191, 125, 0.24);
}

.currency-card--transactions .currency-card__icon {
  color: #f1c25a;
  background: rgba(241, 194, 90, 0.14);
  border-color: rgba(241, 194, 90, 0.24);
}

.currency-card__body {
  min-width: 0;
}

.currency-card__label {
  display: block;
  color: rgba(252, 239, 225, 0.58);
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.currency-card__value {
  display: block;
  margin-top: 0.4rem;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.45rem;
  font-weight: 900;
  line-height: 1;
}

.currency-card__caption {
  display: block;
  margin-top: 0.35rem;
  color: rgba(252, 239, 225, 0.52);
  font-size: 0.8rem;
  line-height: 1.4;
}

.surface {
  margin-top: 1.5rem;
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.76), rgba(46, 50, 68, 0.96)), var(--color-navy);
  box-shadow: 0 22px 54px -34px rgba(0, 0, 0, 0.85);
}

.surface-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.surface-header__meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.surface-title {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  color: var(--color-cream);
  font-weight: 900;
}

.surface-subtitle {
  margin: 0.3rem 0 0;
  color: rgba(252, 239, 225, 0.58);
  font-size: 0.88rem;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  font-size: 0.78rem;
  font-weight: 800;
  color: rgba(252, 239, 225, 0.72);
  background: rgba(18, 24, 38, 0.3);
}

.meta-item--warning {
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border-color: rgba(242, 139, 91, 0.28);
}

.meta-item--audit {
  background: rgba(80, 120, 238, 0.14);
  color: #9ab8ff;
  border-color: rgba(80, 120, 238, 0.28);
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: auto;
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
}

.form-field__label {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  background: rgba(242, 139, 91, 0.1);
  border: 1px solid rgba(242, 139, 91, 0.22);
  color: var(--color-primary-strong);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.form-field__control {
  position: relative;
  display: flex;
  align-items: center;
}

.input,
.select {
  width: 100%;
  min-height: 46px;
  box-sizing: border-box;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: linear-gradient(180deg, rgba(24, 30, 45, 0.96), rgba(35, 43, 62, 0.96));
  color: var(--color-cream);
  padding: 0.85rem 0.95rem;
  font: inherit;
  font-weight: 800;
  outline: none;
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.03),
    0 10px 24px -18px rgba(0, 0, 0, 0.85);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.input::placeholder {
  color: rgba(252, 239, 225, 0.34);
}

.input:hover,
.select:hover {
  border-color: rgba(252, 239, 225, 0.16);
  background: linear-gradient(180deg, rgba(28, 35, 51, 0.98), rgba(39, 47, 67, 0.98));
}

.input:focus,
.select:focus {
  border-color: rgba(242, 139, 91, 0.62);
  background: linear-gradient(180deg, rgba(30, 37, 54, 1), rgba(42, 50, 71, 1));
  box-shadow:
    inset 0 1px 0 rgba(252, 239, 225, 0.04),
    0 0 0 4px rgba(242, 139, 91, 0.12),
    0 16px 30px -20px rgba(242, 139, 91, 0.35);
  transform: translateY(-1px);
}

.select option {
  background: var(--color-navy);
  color: var(--color-cream);
}

.input--toolbar {
  max-width: 300px;
}

.input--narrow {
  min-width: 90px;
  max-width: 110px;
  min-height: 38px;
  padding: 0.55rem 0.65rem;
  border-radius: 12px;
}

.form-field__unit {
  position: absolute;
  right: 0.8rem;
  color: rgba(252, 239, 225, 0.46);
  font-size: 0.78rem;
  font-weight: 900;
  pointer-events: none;
}

.form-field__control .input {
  padding-right: 3rem;
}

.form-field__hint {
  color: rgba(252, 239, 225, 0.5);
  font-size: 0.78rem;
  line-height: 1.4;
}

.form-actions {
  margin-top: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.form-actions__buttons {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.toolbar {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

/* ─── Compact filter bar ─────────────────────────────────────────────────── */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.filter-bar__search {
  position: relative;
  display: flex;
  align-items: center;
  flex: 0 1 220px;
  min-width: 140px;
}

.filter-bar__search-icon {
  position: absolute;
  left: 0.7rem;
  width: 15px;
  height: 15px;
  fill: rgba(252, 239, 225, 0.42);
  pointer-events: none;
  flex-shrink: 0;
}

.filter-bar__reset {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
}

.input--compact {
  width: 100%;
  height: 36px;
  padding: 0 0.75rem 0 2.15rem;
  border-radius: 10px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.34);
  color: var(--color-cream);
  font-size: 0.84rem;
  font-weight: 700;
  outline: none;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
}
.input--compact::placeholder {
  color: rgba(252, 239, 225, 0.38);
}
.input--compact:focus {
  border-color: rgba(242, 139, 91, 0.52);
  background: rgba(18, 24, 38, 0.48);
  box-shadow: 0 0 0 3px rgba(242, 139, 91, 0.1);
}

.select--compact {
  height: 36px;
  padding: 0 0.65rem;
  border-radius: 10px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.34);
  color: var(--color-cream);
  font-size: 0.84rem;
  font-weight: 700;
  outline: none;
  cursor: pointer;
  width: auto;
  min-width: 120px;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
}
.select--compact:focus {
  border-color: rgba(242, 139, 91, 0.52);
  background: rgba(18, 24, 38, 0.48);
  box-shadow: 0 0 0 3px rgba(242, 139, 91, 0.1);
}
.select--compact option {
  background: var(--color-navy);
  color: var(--color-cream);
}

.btn-icon-sm {
  width: 14px;
  height: 14px;
  fill: currentColor;
  flex-shrink: 0;
}

.items-table-wrap {
  overflow-x: auto;
  border-radius: 18px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.22);
}

.items-table {
  width: 100%;
  min-width: 820px;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  padding: 0.85rem;
  border-bottom: 1px solid rgba(252, 239, 225, 0.08);
  text-align: left;
}

.items-table th {
  color: rgba(252, 239, 225, 0.56);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: rgba(18, 24, 38, 0.28);
}

.items-table tr {
  transition:
    background-color 0.16s ease,
    box-shadow 0.16s ease;
}

.items-table tbody tr:hover {
  background: rgba(242, 139, 91, 0.06);
}

.items-table tbody tr.is-dirty {
  background: rgba(242, 139, 91, 0.1);
}

.item-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-cell__icon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.24);
  flex-shrink: 0;
}

.item-cell__icon svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.item-cell__name {
  color: var(--color-cream);
  font-weight: 900;
}

.item-cell__meta {
  margin-top: 0.15rem;
  color: rgba(252, 239, 225, 0.5);
  font-size: 0.78rem;
}

.price-edit {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.currency-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.24rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 900;
  border: 1px solid rgba(252, 239, 225, 0.1);
}

.currency-badge--soft {
  color: var(--color-primary-strong);
  background: rgba(242, 139, 91, 0.14);
  border-color: rgba(242, 139, 91, 0.26);
}

.currency-badge--hard {
  color: #9ab8ff;
  background: rgba(80, 120, 238, 0.14);
  border-color: rgba(80, 120, 238, 0.26);
}

.sales-caption {
  color: rgba(252, 239, 225, 0.54);
  font-size: 0.78rem;
}

.toggle-mini {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 132px;
  min-height: 38px;
  padding: 0.34rem 0.72rem 0.34rem 0.42rem;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.42);
  color: rgba(252, 239, 225, 0.68);
  font-size: 0.78rem;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease;
}

.toggle-mini:hover {
  transform: translateY(-1px);
  border-color: rgba(242, 139, 91, 0.34);
  background: rgba(242, 139, 91, 0.1);
  color: var(--color-cream);
}

.toggle-mini__switch {
  width: 36px;
  height: 22px;
  padding: 2px;
  border-radius: 999px;
  background: rgba(18, 24, 38, 0.72);
  border: 1px solid rgba(252, 239, 225, 0.14);
  flex-shrink: 0;
  transition:
    background 0.16s ease,
    border-color 0.16s ease;
}

.toggle-mini__knob {
  display: block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(252, 239, 225, 0.72);
  box-shadow: 0 4px 10px -6px rgba(0, 0, 0, 0.8);
  transition:
    transform 0.18s ease,
    background 0.18s ease;
}

.toggle-mini__text {
  display: inline-flex;
  align-items: center;
  line-height: 1;
  letter-spacing: 0.02em;
}

.toggle-mini--on {
  color: #7ee0ad;
  border-color: rgba(61, 191, 125, 0.28);
  background: rgba(61, 191, 125, 0.12);
}

.toggle-mini--on:hover {
  color: #9af0c3;
  border-color: rgba(61, 191, 125, 0.42);
  background: rgba(61, 191, 125, 0.16);
}

.toggle-mini--on .toggle-mini__switch {
  background: linear-gradient(135deg, #3dbf7d, #2d6a4f);
  border-color: rgba(61, 191, 125, 0.42);
}

.toggle-mini--on .toggle-mini__knob {
  transform: translateX(14px);
  background: var(--color-cream);
}

.toggle-mini:not(.toggle-mini--on) {
  color: #ffb3b3;
  border-color: rgba(225, 91, 91, 0.24);
  background: rgba(225, 91, 91, 0.1);
}

.toggle-mini:not(.toggle-mini--on):hover {
  color: #ffd0d0;
  border-color: rgba(225, 91, 91, 0.38);
  background: rgba(225, 91, 91, 0.14);
}

.toggle-mini:not(.toggle-mini--on) .toggle-mini__switch {
  background: rgba(225, 91, 91, 0.18);
  border-color: rgba(225, 91, 91, 0.3);
}

.toggle-mini:not(.toggle-mini--on) .toggle-mini__knob {
  background: #ffb3b3;
}

.row-actions {
  display: flex;
  gap: 0.45rem;
  justify-content: flex-end;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem;
  border-radius: 16px;
  border: 1px solid rgba(252, 239, 225, 0.08);
  background: rgba(18, 24, 38, 0.26);
}

.history-item__icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.24);
  flex-shrink: 0;
}

.history-item__icon svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.history-item__body {
  flex: 1;
  min-width: 0;
}

.history-item__title {
  display: block;
  color: var(--color-cream);
  font-size: 0.92rem;
  font-weight: 900;
}

.history-item__meta {
  display: block;
  margin-top: 0.15rem;
  color: rgba(252, 239, 225, 0.52);
  font-size: 0.78rem;
}

.empty-state {
  padding: 2.5rem 1.5rem;
  text-align: center;
}

.empty-state__title {
  margin: 0;
  color: var(--color-cream);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 900;
}

.empty-state__text {
  margin: 0.5rem 0 0;
  color: rgba(252, 239, 225, 0.58);
}

@media (max-width: 1200px) {
  .currency-grid,
  .rewards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .page-hero {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .form-actions__buttons {
    justify-content: stretch;
  }

  .form-actions__buttons .btn-inline {
    flex: 1;
  }
}

@media (max-width: 640px) {
  .backoffice-page {
    padding: 1rem;
  }

  .page-hero,
  .surface {
    border-radius: 22px;
    padding: 1rem;
  }

  .currency-grid,
  .rewards-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
  }

  .input--toolbar,
  .select {
    max-width: none;
  }

  .page-hero__actions,
  .row-actions {
    flex-direction: column;
  }

  .btn,
  .btn-inline {
    width: 100%;
  }

  .history-item {
    align-items: flex-start;
  }
}

/* ─── Bundles table ──────────────────────────────────────────────────────── */
.bundles-table-wrap {
  overflow-x: auto;
}

.bundle-thumb {
  width: 56px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid rgba(252, 239, 225, 0.1);
  flex-shrink: 0;
}

.bundle-badge-chip {
  display: inline-flex;
  margin-left: 0.4rem;
  padding: 0.15rem 0.42rem;
  border-radius: 999px;
  font-size: 0.64rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: rgba(242, 139, 91, 0.16);
  border: 1px solid rgba(242, 139, 91, 0.28);
  color: var(--color-primary-strong);
}

.bundle-items-cell {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.bundle-item-mini {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  object-fit: cover;
  border: 1px solid rgba(252, 239, 225, 0.1);
}

.meta-item--saving {
  color: #7ee0ad;
  background: rgba(61, 191, 125, 0.12);
  border: 1px solid rgba(61, 191, 125, 0.22);
  font-weight: 900;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  font-size: 0.76rem;
}

.btn-inline--danger {
  color: rgba(255, 150, 150, 0.85);
  background: rgba(200, 80, 80, 0.12);
  border: 1px solid rgba(200, 80, 80, 0.24);
  border-radius: 9px;
  padding: 0.38rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.14s;
}
.btn-inline--danger:hover {
  background: rgba(200, 80, 80, 0.2);
  border-color: rgba(200, 80, 80, 0.4);
}

/* ─── Bundle modal ───────────────────────────────────────────────────────── */
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
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 28px;
  padding: 1.75rem;
  position: relative;
  background: linear-gradient(160deg, rgba(60, 70, 95, 0.92), rgba(36, 40, 60, 0.98));
  border: 1px solid rgba(252, 239, 225, 0.12);
  box-shadow: 0 40px 90px -20px rgba(0, 0, 0, 0.85);
}

.modal-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  font-weight: 900;
  color: var(--color-cream);
  letter-spacing: -0.02em;
  margin: 0 0 1.25rem;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.5);
  color: rgba(252, 239, 225, 0.65);
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.14s;
}
.modal-close:hover {
  background: rgba(242, 139, 91, 0.2);
  color: var(--color-cream);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.25rem;
}

/* Bundle modal preview */
.bundle-modal-preview {
  margin-bottom: 1.1rem;
  border-radius: 14px;
  overflow: hidden;
  height: 140px;
  background: rgba(18, 24, 38, 0.35);
  border: 1px solid rgba(252, 239, 225, 0.1);
}
.bundle-modal-preview__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Bundle form */
.bundle-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.bundle-form__row {
  display: grid;
  gap: 0.75rem;
}
.bundle-form__row--2 {
  grid-template-columns: 1fr 1fr;
}

/* Gradient presets */
.gradient-presets {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.4rem;
}

.gradient-swatch {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 2px solid transparent;
  cursor: pointer;
  transition:
    transform 0.14s,
    border-color 0.14s;
}
.gradient-swatch:hover {
  transform: scale(1.08);
}
.gradient-swatch--active {
  border-color: var(--color-primary) !important;
  transform: scale(1.1);
}

/* Item multiselect */
.item-multiselect {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 0.38rem;
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid rgba(252, 239, 225, 0.1);
  border-radius: 12px;
  padding: 0.5rem;
  background: rgba(18, 24, 38, 0.3);
}

.item-checkbox {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.55rem;
  border-radius: 9px;
  border: 1px solid rgba(252, 239, 225, 0.07);
  background: rgba(18, 24, 38, 0.4);
  cursor: pointer;
  transition: all 0.12s;
  position: relative;
}
.item-checkbox:hover {
  border-color: rgba(242, 139, 91, 0.3);
  background: rgba(242, 139, 91, 0.07);
}
.item-checkbox--checked {
  border-color: rgba(242, 139, 91, 0.4);
  background: rgba(242, 139, 91, 0.11);
}

.item-checkbox__img {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid rgba(252, 239, 225, 0.1);
  flex-shrink: 0;
}
.item-checkbox__name {
  font-size: 0.78rem;
  font-weight: 900;
  color: var(--color-cream);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-checkbox__meta {
  font-size: 0.68rem;
  color: rgba(252, 239, 225, 0.4);
  white-space: nowrap;
}
.item-checkbox__check {
  color: var(--color-primary-strong);
  font-size: 0.75rem;
  font-weight: 900;
  flex-shrink: 0;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

/* Modal transition */
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

/* ─── Item table enrichments ────────────────────────────────────────────────── */
.item-cell__img {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid rgba(252, 239, 225, 0.1);
  flex-shrink: 0;
}

.item-new-tag {
  display: inline-flex;
  margin-left: 0.3rem;
  padding: 0.1rem 0.32rem;
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
  color: var(--color-navy);
}

.item-feat-tag {
  display: inline-flex;
  margin-left: 0.25rem;
  color: var(--color-primary-strong);
  font-size: 0.72rem;
}

/* Rarity chips */
.rarity-chip {
  display: inline-flex;
  padding: 0.22rem 0.52rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.rarity-chip--common {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(252, 239, 225, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.rarity-chip--rare {
  background: rgba(49, 89, 140, 0.22);
  color: #9ab8ff;
  border: 1px solid rgba(49, 89, 140, 0.28);
}
.rarity-chip--epic {
  background: rgba(93, 44, 168, 0.22);
  color: #c8a0ff;
  border: 1px solid rgba(93, 44, 168, 0.28);
}
.rarity-chip--legendary {
  background: rgba(242, 139, 91, 0.14);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.26);
}

/* ─── Item modal ─────────────────────────────────────────────────────────── */
.modal-box--item {
  max-width: 620px;
}

.item-modal-preview {
  margin-bottom: 1.1rem;
  border-radius: 14px;
  overflow: hidden;
  height: 140px;
  background: rgba(18, 24, 38, 0.35);
  border: 1px solid rgba(252, 239, 225, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.item-modal-preview__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.item-modal-preview--empty {
  color: rgba(252, 239, 225, 0.25);
  font-size: 0.85rem;
  font-weight: 700;
}

.item-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

/* Flag toggles row */
.item-flags-row {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.09);
  background: rgba(18, 24, 38, 0.3);
}

.flag-toggle {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  cursor: pointer;
}

.flag-toggle__box {
  position: relative;
  width: 34px;
  height: 19px;
  border-radius: 999px;
  border: 1px solid rgba(252, 239, 225, 0.18);
  background: rgba(200, 80, 80, 0.15);
  transition:
    background 0.18s ease,
    border-color 0.18s ease;
  flex-shrink: 0;
}
.flag-toggle__box--on {
  background: rgba(61, 191, 125, 0.25);
  border-color: rgba(61, 191, 125, 0.45);
}

.flag-toggle__knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: rgba(252, 239, 225, 0.5);
  transition:
    transform 0.18s ease,
    background 0.18s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}
.flag-toggle__box--on .flag-toggle__knob {
  transform: translateX(15px);
  background: #7ee0ad;
}

.flag-toggle__label {
  font-size: 0.82rem;
  font-weight: 900;
  color: rgba(252, 239, 225, 0.75);
  user-select: none;
}

/* ─── Bundles scroll ─────────────────────────────────────────────────────── */
.bundles-table-wrap--scroll {
  max-height: 420px;
  overflow-y: auto;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.08);
  scrollbar-width: thin;
  scrollbar-color: rgba(242, 139, 91, 0.3) transparent;
}
.bundles-table-wrap--scroll::-webkit-scrollbar {
  width: 6px;
}
.bundles-table-wrap--scroll::-webkit-scrollbar-track {
  background: transparent;
}
.bundles-table-wrap--scroll::-webkit-scrollbar-thumb {
  background: rgba(242, 139, 91, 0.3);
  border-radius: 3px;
}
.bundles-table-wrap--scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(242, 139, 91, 0.5);
}

/* Sticky thead inside scroll */
.bundles-table-wrap--scroll .items-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgba(36, 43, 62, 0.98);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(252, 239, 225, 0.1);
}

/* ─── Table pagination ───────────────────────────────────────────────────── */
.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.85rem 0.25rem 0;
  border-top: 1px solid rgba(252, 239, 225, 0.07);
  margin-top: 0.5rem;
}

.pagination-info {
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(252, 239, 225, 0.5);
  white-space: nowrap;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.28rem;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 0.5rem;
  border-radius: 8px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.35);
  color: rgba(252, 239, 225, 0.65);
  font-size: 0.82rem;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.13s ease;
  font-family: inherit;
}
.page-btn:hover:not(:disabled) {
  background: rgba(242, 139, 91, 0.12);
  border-color: rgba(242, 139, 91, 0.35);
  color: var(--color-cream);
}
.page-btn:disabled {
  opacity: 0.28;
  cursor: not-allowed;
}
.page-btn--active {
  background: rgba(242, 139, 91, 0.18) !important;
  border-color: rgba(242, 139, 91, 0.55) !important;
  color: var(--color-primary-strong) !important;
}

.pagination-size .select--mini {
  min-height: 32px;
  height: 32px;
  padding: 0 0.65rem;
  border-radius: 9px;
  font-size: 0.78rem;
  width: auto;
}

@media (max-width: 600px) {
  .table-pagination {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* ─── Journal ────────────────────────────────────────────────────────────── */
.journal-tabs {
  display: flex;
  gap: 0.25rem;
  border: 1px solid rgba(252, 239, 225, 0.1);
  border-radius: 12px;
  padding: 0.25rem;
  background: rgba(18, 24, 38, 0.3);
}

.journal-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 1rem;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: rgba(252, 239, 225, 0.52);
  font-size: 0.84rem;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.15s ease;
}
.journal-tab:hover {
  color: rgba(252, 239, 225, 0.85);
}
.journal-tab--active {
  background: rgba(242, 139, 91, 0.16);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.28);
}

.journal-tab__count {
  font-size: 0.68rem;
  font-weight: 900;
  padding: 0.1rem 0.38rem;
  border-radius: 999px;
  background: rgba(252, 239, 225, 0.1);
  color: rgba(252, 239, 225, 0.55);
}
.journal-tab--active .journal-tab__count {
  background: rgba(242, 139, 91, 0.18);
  color: var(--color-primary-strong);
}

/* player avatar cell */
.player-cell {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}
.player-cell__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-apricot-dark));
  color: var(--color-navy);
  font-size: 0.75rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* transaction type badge */
.type-badge {
  display: inline-flex;
  padding: 0.22rem 0.52rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.type-badge--purchase {
  background: rgba(80, 120, 240, 0.18);
  color: #9ab8ff;
  border: 1px solid rgba(80, 120, 240, 0.28);
}
.type-badge--payment_sim {
  background: rgba(242, 139, 91, 0.16);
  color: var(--color-primary-strong);
  border: 1px solid rgba(242, 139, 91, 0.28);
}
.type-badge--reward {
  background: rgba(61, 191, 125, 0.14);
  color: #7ee0ad;
  border: 1px solid rgba(61, 191, 125, 0.26);
}

/* status dot */
.status-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 0.35rem;
  vertical-align: middle;
}
.status-dot--success {
  background: #7ee0ad;
  box-shadow: 0 0 5px rgba(61, 191, 125, 0.55);
}
.status-dot--fail {
  background: #ffb3b3;
  box-shadow: 0 0 5px rgba(220, 80, 80, 0.45);
}

/* smaller filter bar variant */
.filter-bar--sm {
  margin-bottom: 0.85rem;
}
</style>
