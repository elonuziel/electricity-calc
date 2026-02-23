# Electricity Calculator - Modular Version

This folder contains a conceptually separated version of the single-file `electricity_calc_jsonhosting.html` application. The monolithic file was split into appropriate logical components to demonstrate how a typical web application project is structured without frameworks:

- **`index.html`**: The main structural layout which pulls in the styling and scripts without inline logic.
- **`css/style.css`**: Contains custom CSS logic separate from the Tailwind CDN.
- **`js/state.js`**: Holds global state variables, initialization checks, and generic `localStorage` caching functionality.
- **`js/services/cloud.js`**: Handles JSONHosting cloud backup API calls uniquely.
- **`js/services/csv.js`**: Encapsulates all interactions for generating and parsing CSV files natively.
- **`js/ui.js`**: Handles DOM manipulation, forms, modals, input validation, and rendering UI bill card elements.
- **`js/app.js`**: The main orchestrator file which initializes the data on `DOMContentLoaded`.

### Why this structure?
By parting HTML logic away from CSS and separating Javascript into feature-specific scopes (State, APIs, UI rendering), the code becomes much easier to maintain, test, and collaborate on.
