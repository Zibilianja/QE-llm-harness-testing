describe('template spec', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('UI tests', () => {
    it('should have title', () => {
      const title = cy.get('h1');
      title.should('exist');
      title.should('have.text', 'Chat QA Playground');
      title.should('be.visible');
      title.should('contain', 'Chat QA Playground');
    });

    it('should have chat container containing select, model info, chat window and input', () => {
      const chatContainer = cy.get('.chat-container');
      chatContainer.should('exist');
      chatContainer.get('.provider-label').should('exist');
      chatContainer.get('.model-info').should('exist');
      chatContainer.get('.chat-thread').should('exist');
      chatContainer.get('.chat-messages').should('exist');
    });

    it('should have provider info with correct label, input and description of model being used', () => {
      const providerLabel = cy.get('.provider-label');
      providerLabel.should('exist');
      const providerSelect = providerLabel
        .get('.provider-select')
        .should('exist');
      providerSelect.should('have.value', 'openai');
    });

    it('should have chat window with correct attributes', () => {
      const chatWindow = cy.get('.chat-thread');
      chatWindow.should('exist');
      chatWindow.should('be.visible');
    });
  });

  describe('UI interactions', () => {
    describe('provider selection changes', () => {
      afterEach(() => {
        cy.get('.provider-select').select('OpenAI');
      });
      it('should allow user to select a provider', () => {
        const providerSelect = cy.get('.provider-select');
        providerSelect.should('have.text', 'OpenAIClaude');
        providerSelect.should('have.value', 'openai');
        providerSelect.should('not.have.value', 'anthropic');
        providerSelect.select('Claude');
        providerSelect.should('have.value', 'anthropic');
        providerSelect.should('not.have.value', 'openai');
      });

      it('should show correct model when selection is changed', () => {
        const providerSelect = cy.get('.provider-select');
        cy.get('.model-info').should('have.text', 'Using model: gpt-4.1-mini');
        providerSelect.select('Claude');
        cy.get('.model-info').should(
          'have.text',
          'Using model: claude-sonnet-4-6',
        );
      });
    });
    describe('chat input', () => {
      it('should allow user to input a message', () => {
        const userInput = cy.get('.chat-input');
        userInput.type('Hello, world!');
        userInput.should('have.value', 'Hello, world!');
      });

      it('should submit message and show in chat window', () => {
        const userInput = cy.get('.chat-input');
        userInput.type('Hello, world!');
        userInput.get('.send-btn').click();
        userInput.should('have.value', '');
        const chatWindow = cy.get('.chat-thread');
        chatWindow.contains('Hello, world!');
      });

      it('should show response from AI assistant in chat window', () => {
        cy.get('.chat-input').type('What is the capital of France?');
        cy.get('.send-btn').click();
        const chatWindow = cy.get('.chat-thread');
        chatWindow.get('.chat-message-assistant').should('exist');
        chatWindow.get('.chat-message').should('contain', 'Paris');
      });
    });

    describe('should clear current chat thread', () => {
      it('should clear chat messages', () => {
        cy.get('.clear-messages').click();
        cy.get('.chat-thread').should('not.exist');
      });
    });
  });
});
