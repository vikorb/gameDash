describe('Match history', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/matches*', {
      statusCode: 200,
      body: {
        total: 2,
        limit: 20,
        offset: 0,
        matches: [
          {
            match_id: 1,
            played_at: '2026-04-01T10:00:00Z',
            status: 'finished',
            game_mode: { id: 1, name: 'Classé' },
            my_team: { id: 1, name: 'Team A' },
            result: 'win',
            xp_gained: 120,
            mmr_gained: 25,
            mmr_before: 1500,
            mmr_after: 1525,
            mmr_delta: 25,
            teams: [
              { id: 1, name: 'Team A', result: 'win', players: [{ id: 1, username: 'alice' }] },
              { id: 2, name: 'Team B', result: 'loss', players: [{ id: 2, username: 'bob' }] },
            ],
          },
          {
            match_id: 2,
            played_at: '2026-04-02T15:30:00Z',
            status: 'finished',
            game_mode: { id: 2, name: 'Normal' },
            my_team: { id: 3, name: 'Team C' },
            result: 'loss',
            xp_gained: 50,
            mmr_gained: -15,
            mmr_before: 1525,
            mmr_after: 1510,
            mmr_delta: -15,
            teams: [
              { id: 3, name: 'Team C', result: 'loss', players: [{ id: 1, username: 'alice' }] },
              { id: 4, name: 'Team D', result: 'win', players: [{ id: 3, username: 'charlie' }] },
            ],
          },
        ],
      },
    }).as('getMatches')

    cy.visit('/tasks')
    cy.wait('@getMatches')
  })

  it('displays the page title "Historique des matchs"', () => {
    cy.contains('h1', 'Historique des matchs').should('be.visible')
  })

  it('displays matches in the table', () => {
    cy.contains('Victoire').should('be.visible')
    cy.contains('Défaite').should('be.visible')
    cy.contains('alice').should('be.visible')
  })

  it('displays mode, result and date filters', () => {
    cy.contains('label', 'Mode de jeu').should('be.visible')
    cy.contains('label', 'Résultat').should('be.visible')
    cy.contains('label', 'Du').should('be.visible')
    cy.contains('label', 'Au').should('be.visible')
  })

  it('filters by game mode', () => {
    cy.intercept('GET', '**/matches*modeId=1*', { body: { matches: [], total: 0, limit: 20, offset: 0 } }).as('filterMode')
    cy.get('.filter-select').first().select('Classé')
    cy.wait('@filterMode')
  })

  it('filters by result "win"', () => {
    cy.intercept('GET', '**/matches*result=win*', { body: { matches: [], total: 0, limit: 20, offset: 0 } }).as('filterResult')
    cy.get('.filter-select').eq(1).select('Victoire')
    cy.wait('@filterResult')
  })

  it('filters by start date', () => {
    cy.intercept('GET', '**/matches*', { body: { matches: [], total: 0, limit: 20, offset: 0 } }).as('filterDate')
    cy.get('input[type="date"]').first().type('2026-04-01')
    cy.wait('@filterDate')
  })

  it('resets all filters', () => {
    cy.intercept('GET', '**/matches*', { body: { matches: [], total: 0, limit: 20, offset: 0 } }).as('reset')
    cy.contains('button', 'Réinitialiser').click()
    cy.wait('@reset')
  })

  it('shows empty state when no matches are found', () => {
    cy.intercept('GET', '**/matches*', { body: { matches: [], total: 0, limit: 20, offset: 0 } }).as('empty')
    cy.contains('button', 'Réinitialiser').click()
    cy.wait('@empty')
    cy.contains('Aucun match trouvé.').should('be.visible')
  })

  it('shows pagination when total exceeds limit', () => {
    cy.intercept('GET', '**/matches*', {
      body: {
        matches: Array.from({ length: 20 }, (_, i) => ({
          match_id: i + 1,
          played_at: '2026-04-01T10:00:00Z',
          status: 'finished',
          game_mode: { id: 1, name: 'Classé' },
          my_team: { id: 1, name: 'Team A' },
          result: 'win',
          xp_gained: 100,
          mmr_gained: 20,
          mmr_before: 1500,
          mmr_after: 1520,
          mmr_delta: 20,
          teams: [],
        })),
        total: 40,
        limit: 20,
        offset: 0,
      },
    }).as('paginated')
    cy.visit('/tasks')
    cy.wait('@paginated')
    cy.contains('Page 1 / 2').should('be.visible')
    cy.contains('button', 'Suivant →').should('not.be.disabled')
    cy.contains('button', '← Précédent').should('be.disabled')
  })
})
