import './commands';
import '../../src/index.css';
import '../../src/App.css';
import './component-base.css';

import { mount } from 'cypress/react';

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      mountWithLayout: (
        component: React.ReactNode,
        options?: Parameters<typeof mount>[1],
      ) => Cypress.Chainable;
    }
  }
}

Cypress.Commands.add('mount', mount);

Cypress.Commands.add(
  'mountWithLayout',
  (component: React.ReactNode, options?: Parameters<typeof mount>[1]) => {
    return mount(<div id='root'>{component}</div>, options);
  },
);
