<template>
  <Teleport to="body">
    <Transition name="report-fade">
      <div v-if="open" class="report-backdrop" @click.self="close">
        <section class="report-modal" role="dialog" aria-modal="true">
          <header class="report-modal__header">
            <div>
              <span class="report-modal__badge">Signalement</span>
              <h2 class="report-modal__title">Signaler {{ targetTypeLabel }}</h2>
              <p class="report-modal__subtitle">
                Le signalement sera envoyé à la modération avec le contexte de la page.
              </p>
            </div>
            <button type="button" class="report-modal__close" aria-label="Fermer" @click="close">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiClose" /></svg>
            </button>
          </header>

          <div class="report-target">
            <div class="report-target__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiAlert" /></svg>
            </div>
            <div class="report-target__body">
              <span class="report-target__label">Contenu ciblé</span>
              <strong>{{ targetName }}</strong>
              <small v-if="mapTitle && mapTitle !== targetName">Map : {{ mapTitle }}</small>
              <small v-if="authorName">Auteur : {{ authorName }}</small>
            </div>
          </div>

          <form class="report-form" @submit.prevent="submit">
            <label class="report-field">
              <span>Motif</span>
              <select v-model="reason" class="report-input">
                <option v-for="option in reasons" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>

            <label class="report-field">
              <span>Priorité</span>
              <select v-model="severity" class="report-input">
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="critical">Critique</option>
              </select>
            </label>

            <label class="report-field report-field--full">
              <span>Votre pseudo</span>
              <input
                v-model="reporterName"
                type="text"
                class="report-input"
                maxlength="80"
                placeholder="Utilisateur GameDash"
              />
            </label>

            <label class="report-field report-field--full">
              <span>Détails du signalement *</span>
              <textarea
                v-model="summary"
                class="report-input report-textarea"
                rows="5"
                maxlength="800"
                placeholder="Explique rapidement ce qui pose problème : contenu offensant, bug exploitable, spam, triche, etc."
              />
              <small class="report-hint">{{ summary.length }}/800 · minimum 8 caractères</small>
            </label>

            <p v-if="errorMessage" class="report-error">{{ errorMessage }}</p>

            <footer class="report-modal__footer">
              <button type="button" class="report-btn report-btn--ghost" @click="close">
                Annuler
              </button>
              <button
                type="submit"
                class="report-btn report-btn--primary"
                :disabled="!canSubmit || reportsStore.isSubmitting"
              >
                <span v-if="reportsStore.isSubmitting" class="report-spinner" />
                <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path :d="mdiSend" /></svg>
                {{ reportsStore.isSubmitting ? 'Envoi...' : 'Envoyer le signalement' }}
              </button>
            </footer>
          </form>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { mdiAlert, mdiClose, mdiSend } from '@mdi/js'
import { computed, ref, watch } from 'vue'

import {
  type CreateMapReportPayload,
  type MapReportTargetType,
  useMapReportsStore,
} from '@/stores/mapReportsStore'

const props = withDefaults(
  defineProps<{
    open: boolean
    targetType: MapReportTargetType
    targetId?: string | number | null
    targetName: string
    mapId?: string | number | null
    mapTitle?: string | null
    authorName?: string | null
    sourceUrl?: string | null
  }>(),
  {
    targetId: null,
    mapId: null,
    mapTitle: null,
    authorName: null,
    sourceUrl: null,
  },
)

const emit = defineEmits<{
  close: []
  submitted: [report: unknown]
}>()

const reportsStore = useMapReportsStore()

const reasons = [
  { value: 'Contenu offensant', label: 'Contenu offensant' },
  { value: 'Harcèlement / insultes', label: 'Harcèlement / insultes' },
  { value: 'Spam / publicité', label: 'Spam / publicité' },
  { value: 'Triche / exploit', label: 'Triche / exploit' },
  { value: 'Contenu inapproprié', label: 'Contenu inapproprié' },
  { value: 'Bug dangereux', label: 'Bug dangereux' },
  { value: 'Autre', label: 'Autre' },
] as const

const reason = ref<(typeof reasons)[number]['value']>('Contenu inapproprié')
const severity = ref<CreateMapReportPayload['severity']>('medium')
const reporterName = ref('Utilisateur GameDash')
const summary = ref('')
const errorMessage = ref('')

const targetTypeLabel = computed(() => {
  switch (props.targetType) {
    case 'comment':
      return 'ce commentaire'
    case 'user':
      return 'cet utilisateur'
    case 'hunt':
      return 'cette chasse'
    case 'asset':
      return 'ce contenu'
    default:
      return 'cette map'
  }
})

const canSubmit = computed(() => reason.value.trim().length > 0 && summary.value.trim().length >= 8)

function resetForm() {
  reason.value = 'Contenu inapproprié'
  severity.value = 'medium'
  reporterName.value = 'Utilisateur GameDash'
  summary.value = ''
  errorMessage.value = ''
}

function close() {
  emit('close')
}

async function submit() {
  if (!canSubmit.value) {
    errorMessage.value = 'Ajoute au moins 8 caractères pour expliquer le problème.'
    return
  }

  errorMessage.value = ''

  try {
    const payload: CreateMapReportPayload = {
      targetType: props.targetType,
      targetId: props.targetId ?? undefined,
      targetName: props.targetName,
      reporterName: reporterName.value.trim() || 'Utilisateur GameDash',
      reason: reason.value,
      summary: summary.value.trim(),
      severity: severity.value,
      mapId: props.mapId ?? undefined,
      mapTitle: props.mapTitle ?? undefined,
      authorName: props.authorName ?? undefined,
      sourceUrl: props.sourceUrl || window.location.href,
    }

    const report = await reportsStore.createMapReport(payload)
    emit('submitted', report)
    resetForm()
    close()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Impossible d'envoyer le signalement."
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      errorMessage.value = ''
    }
  },
)
</script>

<style scoped>
.report-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(8, 12, 22, 0.72);
  backdrop-filter: blur(12px);
}

.report-modal {
  width: min(620px, 100%);
  border-radius: 28px;
  border: 1px solid rgba(252, 239, 225, 0.14);
  background:
    linear-gradient(180deg, rgba(81, 96, 121, 0.96), rgba(35, 40, 56, 0.98)),
    var(--color-navy, #202638);
  color: var(--color-cream, #fcefe1);
  box-shadow: 0 32px 90px -34px rgba(0, 0, 0, 0.9);
  overflow: hidden;
}

.report-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.25rem 0.85rem;
}

.report-modal__badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  margin-bottom: 0.55rem;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: rgba(225, 91, 91, 0.14);
  border: 1px solid rgba(225, 91, 91, 0.28);
  color: #ffb0a8;
  font-size: 0.72rem;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.report-modal__title {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.45rem;
  font-weight: 950;
  letter-spacing: -0.035em;
}

.report-modal__subtitle {
  margin: 0.35rem 0 0;
  color: rgba(252, 239, 225, 0.62);
  font-size: 0.88rem;
  line-height: 1.55;
}

.report-modal__close {
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.34);
  color: rgba(252, 239, 225, 0.76);
  cursor: pointer;
  transition:
    transform 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease;
}

.report-modal__close:hover {
  transform: translateY(-1px);
  color: var(--color-cream, #fcefe1);
  border-color: rgba(242, 139, 91, 0.38);
  background: rgba(242, 139, 91, 0.13);
}

.report-modal__close svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.report-target {
  display: flex;
  gap: 0.85rem;
  margin: 0 1.25rem 1rem;
  padding: 0.85rem;
  border-radius: 20px;
  border: 1px solid rgba(252, 239, 225, 0.1);
  background: rgba(18, 24, 38, 0.28);
}

.report-target__icon {
  display: inline-grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 16px;
  background: rgba(225, 91, 91, 0.14);
  color: #ffaaa2;
  flex-shrink: 0;
}

.report-target__icon svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
}

.report-target__body {
  display: grid;
  gap: 0.16rem;
  min-width: 0;
}

.report-target__label {
  color: rgba(252, 239, 225, 0.52);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.report-target__body strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-target__body small {
  color: rgba(252, 239, 225, 0.58);
  font-size: 0.78rem;
}

.report-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  padding: 0 1.25rem 1.25rem;
}

.report-field {
  display: grid;
  gap: 0.42rem;
}

.report-field--full {
  grid-column: 1 / -1;
}

.report-field span {
  color: rgba(252, 239, 225, 0.82);
  font-size: 0.78rem;
  font-weight: 900;
}

.report-input {
  width: 100%;
  min-height: 42px;
  border-radius: 14px;
  border: 1px solid rgba(252, 239, 225, 0.12);
  background: rgba(18, 24, 38, 0.38);
  color: var(--color-cream, #fcefe1);
  padding: 0.7rem 0.85rem;
  outline: none;
  font: inherit;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;
}

.report-input:focus {
  border-color: rgba(242, 139, 91, 0.52);
  box-shadow: 0 0 0 4px rgba(242, 139, 91, 0.12);
  background: rgba(18, 24, 38, 0.5);
}

.report-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
}

.report-hint {
  justify-self: end;
  color: rgba(252, 239, 225, 0.48);
  font-size: 0.74rem;
}

.report-error {
  grid-column: 1 / -1;
  margin: 0;
  padding: 0.68rem 0.8rem;
  border-radius: 14px;
  border: 1px solid rgba(225, 91, 91, 0.28);
  background: rgba(225, 91, 91, 0.12);
  color: #ffb0a8;
  font-size: 0.84rem;
  font-weight: 800;
}

.report-modal__footer {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
  flex-wrap: wrap;
  padding-top: 0.2rem;
}

.report-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 42px;
  border-radius: 14px;
  border: 1px solid transparent;
  padding: 0.68rem 1rem;
  font-weight: 950;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    opacity 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease;
}

.report-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.report-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.report-btn svg {
  width: 17px;
  height: 17px;
  fill: currentColor;
}

.report-btn--ghost {
  background: rgba(18, 24, 38, 0.28);
  color: rgba(252, 239, 225, 0.78);
  border-color: rgba(252, 239, 225, 0.12);
}

.report-btn--primary {
  background: linear-gradient(135deg, #e15b5b, var(--color-primary, #f28b5b));
  color: #201624;
  box-shadow: 0 16px 32px -22px rgba(242, 139, 91, 0.9);
}

.report-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(32, 22, 36, 0.3);
  border-top-color: rgba(32, 22, 36, 0.95);
  border-radius: 999px;
  animation: report-spin 0.8s linear infinite;
}

.report-fade-enter-active,
.report-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.report-fade-enter-from,
.report-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

@keyframes report-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 620px) {
  .report-modal__header,
  .report-target,
  .report-form {
    margin-left: 0;
    margin-right: 0;
  }

  .report-form {
    grid-template-columns: 1fr;
  }

  .report-modal__footer {
    flex-direction: column-reverse;
  }

  .report-btn {
    width: 100%;
  }
}
</style>
