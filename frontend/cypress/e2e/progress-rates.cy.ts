describe('Progress rates', () => {
  beforeEach(() => {
    const pbAuth = encodeURIComponent(
      JSON.stringify({
        token: 'fake-token',
        model: { id: 'u1', email: 'alice@test.dev', username: 'alice' },
      }),
    )

    cy.intercept('GET', '**/users/by-pocketbase/u1', {
      statusCode: 200,
      body: {
        user: {
          id: 1,
          pocketbase_user_id: 'u1',
          username: 'alice',
          email: 'alice@test.dev',
          role: 'player',
          status: 'active',
          is_banned: false,
          region: null,
          bio: null,
          language: null,
          matchmaking_pref: null,
        },
      },
    }).as('getUser')

    cy.intercept('GET', '**/game-modes*', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Classé', is_active: true, created_at: '', updated_at: '' },
        { id: 2, name: 'Normal', is_active: true, created_at: '', updated_at: '' },
      ],
    }).as('getModes')

    cy.intercept('GET', '**/mmr*', {
      statusCode: 200,
      body: {
        postgresUserId: 1,
        mmr: 1500,
        rank: 'Gold',
        history: [],
      },
    }).as('getMMR')

    cy.intercept('GET', '**/matches*limit=1*result=win*', {
      statusCode: 200,
      body: { matches: [], total: 3, limit: 1, offset: 0 },
    }).as('getWins')

    cy.intercept('GET', '**/matches*limit=1*', {
      statusCode: 200,
      body: { matches: [], total: 4, limit: 1, offset: 0 },
    }).as('getTotal')

    cy.intercept('GET', '**/matches*limit=100*', {
      statusCode: 200,
      body: {
        matches: [
          { nb_kills: 2 },
          { nb_kills: 4 },
          { nb_kills: 5 },
          { nb_kills: 3 },
        ],
        total: 4,
        limit: 100,
        offset: 0,
      },
    }).as('getKills')

    cy.visit('/progress', {
      onBeforeLoad(win) {
        win.document.cookie = `pb_auth=${pbAuth}; path=/`
      },
    })

    cy.wait('@getUser')
    cy.wait('@getModes')
    cy.wait('@getMMR')
    cy.wait('@getTotal')
    cy.wait('@getWins')
    cy.wait('@getKills')
  })

  it('displays winrate and kill rate values', () => {
    cy.contains('.rate-label', 'Winrate').should('be.visible')
    cy.contains('.rate-value', '75%').should('be.visible')

    cy.contains('.rate-label', 'Kill rate').should('be.visible')
    cy.contains('.rate-value', '3.5').should('be.visible')
  })
})
