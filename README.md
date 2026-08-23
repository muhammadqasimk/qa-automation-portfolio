# QA Automation Portfolio - API, UI and E2E

End-to-end quality engineering portfolio covering **API automation (Rest Assured + Java)**, **UI and E2E automation (Playwright + TypeScript)**, and a **GitHub Actions CI/CD** pipeline, all running against real, publicly hosted applications.

## Targets under test

| Application | What it is | Layer tested | Tooling |
|-------------|-----------|--------------|---------|
| [Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html) | Hotel booking REST API with auth + CRUD | API | Rest Assured (Java) + Playwright request |
| [Conduit / RealWorld](https://demo.realworld.show) | Medium-style blogging app (Angular demo) | UI + E2E | Playwright (TypeScript) |
| [Saleor](https://demo.saleor.io) | Production-grade open-source e-commerce storefront | UI + E2E | Playwright (TypeScript) |
| Medusa.js | Headless commerce (self-hosted) | UI (opt-in) | Playwright (TypeScript) |

## Repository structure

```
.
├── rest-assured-tests/                 # API tests - Java + Maven
│   ├── pom.xml
│   └── src/test/java/
│       ├── base/BaseApiTest.java
│       ├── clients/RestfulBookerClient.java
│       ├── models/                     # Booking, BookingDates, AuthCredentials
│       └── tests/                      # Auth, CRUD, Search, Known-Issues
│
├── playwright-tests/                   # UI + E2E + API - TypeScript
│   ├── config/urls.ts                  # env-overridable base URLs
│   ├── pages/
│   │   ├── conduit/                    # Page Objects (RealWorld)
│   │   └── saleor/                     # Page Objects (Saleor)
│   ├── utils/testData.ts               # unique test-data factories
│   └── tests/
│       ├── api/restful-booker.spec.ts  # API via Playwright
│       ├── conduit/ui + conduit/e2e
│       ├── saleor/ui + saleor/e2e
│       └── medusa/                     # opt-in (needs MEDUSA_URL)
│
├── .github/workflows/test.yml          # CI/CD pipeline
├── .gitignore
└── README.md
```

## Prerequisites

- **Java 17+** and **Maven** (for the Rest Assured suite)
- **Node.js 18+** (for the Playwright suite)

## Running the API tests (Rest Assured)

```bash
cd rest-assured-tests
mvn clean test
```

Point the suite at a different environment with:

```bash
mvn clean test -DbaseUrl=https://your-booker-instance
```

Reports are generated at `rest-assured-tests/target/surefire-reports/`.

### Coverage
- **Auth** - token creation, bad credentials, health check
- **CRUD** - create, read, full update (PUT), partial update (PATCH), delete, auth enforcement
- **Search** - list ids, filter by name, empty results
- **Documented defects** - captures known non-standard behaviour (`201` on delete, `403` vs `401`, missing validation)

## Running the UI / E2E / API tests (Playwright)

```bash
cd playwright-tests
npm install
npx playwright install chromium

npm test              # everything
npm run test:conduit  # Conduit UI + E2E
npm run test:saleor   # Saleor UI + E2E
npm run test:api      # Restful-Booker API via Playwright
npm run report        # open the HTML report
```

Override any target URL without touching code:

```bash
CONDUIT_URL=https://my-conduit SALEOR_URL=https://my-saleor npm test
MEDUSA_URL=http://localhost:8000 npm run test:medusa   # enables the opt-in Medusa suite
```

### Coverage
- **Conduit UI** - home feed, article previews, tags, sign-in form, invalid-login errors, registration
- **Conduit E2E** - register -> publish article -> comment -> delete
- **Saleor UI** - featured products, categories, product detail, search
- **Saleor E2E** - browse -> add to cart -> verify cart
- **API (Playwright)** - Restful-Booker auth + full CRUD in TypeScript

## Design notes

- **Page Object Model** - every UI page is a class with `readonly` locators and action methods; assertions live in specs.
- **Resilient locators** - role- and text-based (`getByRole`, `getByPlaceholder`) over brittle CSS/class selectors.
- **Configurable targets** - base URLs come from environment variables so suites are portable across environments.
- **Deterministic data** - unique users/articles per run avoid cross-test collisions on shared demo backends.

## CI/CD

`.github/workflows/test.yml` runs on every push/PR (and weekly):
1. **Rest Assured** job - JDK 17 + Maven, runs the Java API suite, uploads surefire reports.
2. **Playwright** job - Node 18 + Chromium, runs the full suite, uploads the HTML report and results as artifacts.

## Notes on public demos

These are shared, publicly hosted demo apps; their data and availability can change. Base URLs are configurable so the suites can be pointed at self-hosted instances for fully deterministic runs.
