describe('template spec', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('App component', () => {
    it('should mount the App component', () => {
      cy.get('.app-container').should('exist');
    });
  });
});
