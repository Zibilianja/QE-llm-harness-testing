type LLMMode = 'record' | 'replay';
const CHAT_URL = '**/api/chat';
const getMode = (): LLMMode => {
  const raw = Cypress.env('LLM_MODE');
  return raw === 'record' ? 'record' : 'replay';
};

const interceptResponse = (mode: LLMMode, fixtureName: string) => {
  if (mode === 'record') {
    cy.intercept('POST', CHAT_URL).as('chat');
    return;
  }

  cy.fixture(fixtureName).then((mockData) => {
    cy.intercept('POST', CHAT_URL, {
      statusCode: 200,
      body: mockData,
    }).as('chat');
  });
};

const sendPrompt = (prompt: string) => {
  cy.get('[data-testid=chat-input]').clear().type(prompt);
  cy.get('[data-testid=send-btn]').click();
};

describe('LLM Evaluation Harness', () => {
  const fixtureName = 'llm_contract.json';

  beforeEach(() => {
    cy.visit('/');
  });
  describe('Record/Replay behavior', () => {
    it('records a real provider response to a fixture in record mode', () => {
      cy.env(['LLM_MODE']).then(() => {
        const mode = getMode();
        if (mode !== 'record') return;
        interceptResponse(mode, fixtureName);
        sendPrompt('Hello, how are you?');

        cy.wait('@chat').then((i) => {
          const body = i.response?.body as any;
          cy.writeFile(`cypress/fixtures/${fixtureName}`, body);

          // quick sanity check the file got written
          cy.readFile(`cypress/fixtures/${fixtureName}`).should('exist');
        });
      });
    });

    it('replays a saved fixture without calling the real backend in replay mode', () => {
      cy.env(['LLM_MODE']).then(() => {
        const mode = getMode();
        if (mode !== 'replay') return;

        interceptResponse(mode, fixtureName);
        sendPrompt('Hello, how are you?');

        cy.wait('@chat').then((i) => {
          const body = i.response?.body as any;
          cy.readFile(`cypress/fixtures/${fixtureName}`, { log: false }).then(
            (fixture) => {
              expect(body).to.deep.equal(fixture);
            },
          );
        });
      });
    });

    describe('Chat functionality', () => {
      let body: any;
      beforeEach(() => {
        const mode = getMode();
        interceptResponse(mode, fixtureName);
        sendPrompt('Hello, how are you?');
        cy.wait('@chat').then((i) => {
          body = i.response?.body;
        });
      });

      it('chat response satisfies basic contract', () => {
        expect(body, 'response body exists').to.exist;
        expect(body.provider, 'provider name')
          .to.be.a('string')
          .and.to.have.length.greaterThan(0);
        expect(body.model, 'model name')
          .to.be.a('string')
          .and.to.have.length.greaterThan(0);
        expect(body.text, 'response text')
          .to.be.a('string')
          .and.to.have.length.greaterThan(0);
      });

      it('response enforces basic output formatting rules', () => {
        expect(body.text, 'no markdown code fences').to.not.include('```');
        expect(body.text, 'response text')
          .to.be.a('string')
          .and.to.have.length.greaterThan(0);
      });

      it('latency is recorded in milliseconds', () => {
        expect(body.latencyMs, 'latency')
          .to.be.a('number')
          .and.to.be.greaterThan(0);
      });

      it('response includes a message from the user and assistant and contain the body text in the response', () => {
        cy.get('[data-testid=msg-user]').should('exist');
        cy.get('[data-testid=msg-user]').should(
          'contain.text',
          'Hello, how are you?',
        );
        cy.get('[data-testid=msg-assistant]').should('exist');
        cy.get('[data-testid=msg-assistant]').should('contain.text', body.text);
      });
    });
  });
});
