# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ca982fe3-88f0-49c1-a93e-b096c50d818d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ca982fe3-88f0-49c1-a93e-b096c50d818d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Authentication & Database)
- Cypress (E2E Testing)

## 🧪 Testing

This project includes comprehensive E2E tests using Cypress.

### Running Tests

```bash
# Open Cypress in interactive mode
npm run cypress:open
npm run test:e2e:ui

# Run all tests in headless mode
npm run cypress:run
npm run test:e2e

# Run specific test suites
npx cypress run --spec "cypress/e2e/client-login.cy.ts"
npx cypress run --spec "cypress/e2e/client-register.cy.ts"
npx cypress run --spec "cypress/e2e/auth-flow.cy.ts"

# Using PowerShell script (Windows)
.\run-tests.ps1           # Interactive mode
.\run-tests.ps1 run       # Headless mode
.\run-tests.ps1 login     # Only login tests
.\run-tests.ps1 register  # Only register tests
.\run-tests.ps1 flow      # Only flow tests
```

### Test Coverage

- ✅ **Client Login** - 90+ test cases
- ✅ **Client Register** - 100+ test cases  
- ✅ **Auth Flows** - 30+ integration test cases

For detailed testing documentation, see [cypress/README.md](cypress/README.md) and [CYPRESS_IMPLEMENTATION.md](CYPRESS_IMPLEMENTATION.md).

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ca982fe3-88f0-49c1-a93e-b096c50d818d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
