# QA Automation Portfolio — API, UI and E2E

[![Automation Suite](https://github.com/muhammadqasimk/qa-automation-portfolio/actions/workflows/test.yml/badge.svg)](https://github.com/muhammadqasimk/qa-automation-portfolio/actions/workflows/test.yml)
[![Live test report](https://img.shields.io/badge/test%20report-live-blue)](https://muhammadqasimk.github.io/qa-automation-portfolio/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

End-to-end quality engineering portfolio covering **API automation (Rest Assured + Java)**, **UI and E2E automation (Playwright + TypeScript)** across **Chromium, Firefox and WebKit**, and a **GitHub Actions CI/CD** pipeline — all running against real, publicly hosted applications.

**Suite size:** 14 Rest Assured API tests · 23 Playwright test cases (UI, E2E and API) — 55 executions per run, since UI and E2E specs run on all three engines while the browserless API project runs once.
**Live report:** [muhammadqasimk.github.io/qa-automation-portfolio](https://muhammadqasimk.github.io/qa-automation-portfolio/) — published from `main` on every run.

## Targets under test

| Application | What it is | Layer tested | Tooling |
|-------------|-----------|--------------|---------|
| [Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html) | Hotel booking REST API with auth + CRUD | API | Rest Assured (Java) + Playwright request |
| [Conduit / RealWorld](https://demo.realworld.show) | Medium-style blogging app (Angular demo) | UI + E2E | Playwright (TypeScript) |
| [Saleor](https://demo.saleor.io) | Production-grade open-source e-commerce storefront | UI + E2E | Playwright (TypeScript) |

## Documented API defects

The Restful-Booker suite does more than assert happy paths — it pins down where the API
deviates from REST conventions and from its own documentation. Each is covered by a test in
`BookingKnownIssuesApiTest`, so the documented behaviour is locked in and any upstream change
surfaces as a failure.

| # | Endpoint | Expected | Actual | Impact | Severity |
|---|----------|----------|--------|--------|----------|
| 1 | `DELETE /booking/{id}` | `204 No Content` | `201 Created` | Clients checking for 204 treat a successful delete as failed | Medium |
| 2 | `PUT /booking/{id}` without token | `401 Unauthorized` | `403 Forbidden` | Cannot distinguish "not authenticated" from "not permitted"; breaks token-refresh flows | Low |
| 3 | `POST /booking` with only `firstname` | `400 Bad Request` | Accepted | No server-side field validation — incomplete records enter the store | High |

## Repository structure

```
.
├── rest-assured-tests/                 # API tests - Java 21 + Maven
│   ├── pom.xml
│   └── src/test/java/
│       ├── base/BaseApiTest.java       # shared RequestSpecification
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
│       ├── api/restful-booker.spec.ts  # API via Playwright request
│       ├── conduit/ui + conduit/e2e
│       └── saleor/ui + saleor/e2e
│
├── .github/workflows/test.yml          # CI + Pages publishing
├── LICENSE
└── README.md
```

## Prerequisites

- **Java 21** and **Maven** (for the Rest Assured suite)
- **Node.js 24+** (for the Playwright suite)

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
- **Auth** — token creation, bad credentials, health check
- **CRUD** — create, read, full update (PUT), partial update (PATCH), delete, auth enforcement
- **Search** — list ids, filter by name, empty results
- **Documented defects** — the three non-standard behaviours tabled above

## Running the UI / E2E / API tests (Playwright)

```bash
cd playwright-tests
npm install
npx playwright install chromium firefox webkit

npm test                # full suite, all three browsers
npm run test:chromium   # single engine
npm run test:firefox
npm run test:webkit
npm run test:api        # Restful-Booker API via Playwright (browserless)
npm run test:conduit    # Conduit UI + E2E
npm run test:saleor     # Saleor UI + E2E
npm run report          # open the HTML report
```

Override any target URL without touching code:

```bash
CONDUIT_URL=https://my-conduit SALEOR_URL=https://my-saleor npm test
```

### Coverage
- **Conduit UI** — home feed, article previews, tags, sign-in form, invalid-login errors, registration
- **Conduit E2E** — register → publish article → comment → delete
- **Saleor UI** — featured products, categories, product detail, search
- **Saleor E2E** — browse → add to cart → verify cart
- **API (Playwright)** — Restful-Booker auth + full CRUD in TypeScript

## Design notes

- **Page Object Model** — every UI page is a class with `readonly` locators assigned in the constructor and action methods that do one thing. Page objects additionally expose `expect*` page-readiness helpers (`expectLoaded`, `expectHasProducts`); *behavioural* assertions stay in the specs.
- **Locator strategy** — role, placeholder and text locators (`getByRole`, `getByPlaceholder`) wherever the demo app exposes accessible markup. Where it doesn't — the RealWorld reference app renders largely unlabelled `div`s — documented CSS hooks such as `.article-preview` and `.error-messages` are used deliberately rather than generated selectors.
- **Cross-browser by default** — UI and E2E suites run on Chromium, Firefox and WebKit. API tests are transport-only, so they run once in a browserless `api` project rather than three times.
- **Configurable targets** — base URLs come from environment variables, so every suite is portable across environments without code changes.
- **Capped concurrency** — targets are live, shared public demos, so workers are limited (4 locally, 2 in CI) to avoid self-inflicted rate limiting that would surface as unrelated-looking locator failures.
- **Test data** — the Conduit E2E suite and the Rest Assured suite generate unique users and records per run so parallel workers can't collide. The Saleor suite reads existing catalogue data, so it asserts on structure rather than on specific products where possible.
- **Rate-limit handling** — Restful-Booker returns `418` under load. `RestfulBookerClient.execute()` centralises retry-with-backoff in one place rather than scattering it across tests, and re-sets the interrupt flag rather than swallowing `InterruptedException`.
- **Hydration races are handled explicitly, not with sleeps** — Saleor's variant buttons ship server-rendered and already enabled, so a click can land before React hydrates and be silently discarded. `ProductDetailPage.addToCart()` waits for the network to settle, then re-clicks only while the CTA remains disabled, and asserts on the CTA's *state* rather than its label. Found by running the suite on Firefox, which loses that race most often.
- **No local retries** — retries are enabled in CI only (`retries: 2`), so flakiness surfaces immediately during development instead of being masked.

## CI/CD

`.github/workflows/test.yml` runs on every push and pull request to `main`/`develop`, weekly on a schedule, and on demand:

1. **Rest Assured job** — JDK 21 + Maven, runs the Java API suite, uploads surefire reports.
2. **Playwright job** — Node 24, installs Chromium/Firefox/WebKit, runs the full suite, uploads the HTML report and raw results as artifacts.
3. **Publish job** — deploys the Playwright HTML report to GitHub Pages so results are viewable without downloading artifacts.

## Notes on public demos

These are shared, publicly hosted demo applications; their data and availability can change without notice. Base URLs are configurable so every suite can be pointed at a self-hosted instance for fully deterministic runs.

## License

[MIT](LICENSE)
