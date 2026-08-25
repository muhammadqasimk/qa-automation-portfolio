# Handoff notes

Working context for anyone (human or agent) picking this repo up mid-stream.
This is a **hiring portfolio**, so the bar is "would a senior QA reviewer be
impressed or embarrassed" — not "does it work".

**Do not delete this file's reasoning without reading it.** Several things below
look like code smells and are deliberate. They have been fixed once already and
should not be "cleaned up" back into being wrong.

---

## Current state

Last verified local run: **54 of 55 passing**, one Saleor cart failure that
moved between engines as it was fixed (Firefox → WebKit) and has since been
addressed. Java suite: **14 tests, 0 failures**.

Suite shape: 23 Playwright test cases → 55 executions per run (UI/E2E specs run
on Chromium + Firefox + WebKit; the browserless `api` project runs once).

---

## Deliberate decisions — do not "fix" these

### 1. `ProductDetailPage.addToCart()` has a retry loop on purpose

Saleor's variant (size) buttons are **server-rendered and already enabled**, so
`toBeEnabled()` passes instantly and a click can land *before* React hydrates,
where it is silently discarded on re-render. Firefox loses this race most often;
Chromium was winning it by luck.

The current implementation waits for `networkidle`, then re-clicks **only while
the CTA is still disabled** — a click that did register is never repeated,
because each one pushes a `?variant=` param and repeated soft navigations detach
the locator.

A previous attempt replaced this with a single click plus `waitForURL`. That
failed on Firefox. Do not go back to it.

### 2. Assertions target the CTA's *state*, not its label

The PDP renders one CTA that relabels itself: disabled `"Select options"` →
enabled `"Add to bag"`. `purchaseCta` matches either label so tests assert on
whether it is actionable, not on which copy is showing.

### 3. The cart count is matched by role + accessible name, never `getByText`

The header control's accessible name is `"0 items in cart, view bag"`. The count
**does not exist as a visible text node**, so `getByText(/[1-9]\d* item/)` finds
nothing. Use `cartButton` / `cartButtonWithItems` from `SaleorBasePage`.

`cart.spec.ts` also asserts the cart starts at zero *before* adding, so the test
can only pass because the add worked.

### 4. `pom.xml` has no Surefire `<includes>` block

Setting `<include>**/*ApiTest.java</include>` **replaces** Surefire's defaults
(`**/*Test.java`, `**/Test*.java`, `**/*Tests.java`, `**/*TestCase.java`). Any
future class named `LoginTest.java` would silently never run while the build
stayed green. The omission is intentional and commented in the pom.

### 5. `retries: CI ? 2 : 0` and `workers: CI ? 2 : 4`

Zero local retries so flakiness surfaces during development instead of being
masked. Workers capped because the targets are live shared public demos —
unbounded workers × 3 engines produces 429s that present as unrelated-looking
locator failures.

### 6. `timeout: 90s`

Budget arithmetic, not padding: `navigationTimeout` (30s) + the variant
hydration retry (25s) can legitimately consume ~55s on the slowest engine.

### 7. README design notes were corrected to match the code

They previously claimed "assertions never live in page objects", "role/text
locators in preference to CSS", and "unique data generated per run". All three
were false: ~10 page-object methods contain `expect`, about half the locators are
documented CSS hooks (RealWorld renders largely unlabelled `div`s), and the
Saleor suite reads existing catalogue data.

**Keep the README honest.** An inaccurate README is worse than none — a reviewer
reads the design notes and spot-checks one.

---

## Outstanding work, highest value first

### 1. No test-data cleanup in the Java suite
No `@AfterAll` or `@AfterEach` anywhere. Each run orphans ~10 bookings on a
backend other people share: `BookingCrudApiTest` creates 5 and deletes 1,
`BookingSearchApiTest` seeds 1 and never deletes it, `BookingKnownIssuesApiTest`
creates 3 and deletes 1.

Fix: in `BaseApiTest`, add `protected static final List<Integer> createdIds`, a
helper that registers each created id, and an `@AfterAll` that deletes them with
the admin token (tolerating 404/405).

"Test data lifecycle" is a standard senior interview question — currently the
answer is "I don't."

### 2. `initClient()` is copy-pasted verbatim into all four Java test classes
Removing exactly that duplication is what the base class exists for. Move client
construction into `BaseApiTest` and delete the four copies.

### 3. The TypeScript API spec has no 418 rate-limit retry
`RestfulBookerClient.execute()` (Java) implements retry-with-backoff for
Restful-Booker's 418. `tests/api/restful-booker.spec.ts` has none, while 5 of its
7 tests each fire a `POST /booking`. The mitigation was never carried across.

Fix: extract a `postWithRetry` helper mirroring the Java backoff, and consider
`test.describe.configure({ mode: 'serial' })` for that spec.

### 4. Dead code that should become coverage
- `pages/conduit/SettingsPage.ts` — entire class unused; **there is no logout test**.
- `RestfulBookerClient.deleteBookingWithoutAuth()` — unused, while the Playwright
  suite *does* test unauthenticated delete and the Java suite doesn't.

Better than deleting: write those two tests.

### 5. Java DTOs are 78 lines of JavaBeans on Java 21
`AuthCredentials` and `BookingDates` are pure value types → convert to records.
`Booking` **cannot** be converted trivially: `BookingCrudApiTest` mutates it via
setters, and **Gson does not support records** without a custom `TypeAdapter`
(Jackson 2.12+ does). Full fix: records for the two value types → swap Gson for
`jackson-databind` → then `Booking` as a record with a `with`-style copy method.

### 6. Smaller items
- `BookingCrudApiTest` PATCH test's `@DisplayName` says "changes only sent fields"
  but never asserts the untouched fields were preserved.
- `BookingCrudApiTest:49` asserts a magic `150` coupled to `BaseApiTest`'s sample.
- `restful-booker.spec.ts` uses `Awaited<ReturnType<typeof request.newContext>>`
  where `APIRequestContext` is exported.
- `restful-booker.spec.ts` uses `checkin: '2024-01-01'` (past date) while the Java
  side uses `2026-01-01`.
- Hardcoded public demo credentials in `BaseApiTest` and `restful-booker.spec.ts`
  — not a leak, but move to `System.getProperty` / `process.env` with a comment.
- `gson` in `pom.xml` has zero source references (Rest Assured picks it off the
  classpath). Add a comment or switch to Jackson.
- No `junit-bom`; api/engine versions are hand-pinned and can skew.
- No HTML report for the Java half, while the Playwright half gets GitHub Pages.
- No Maven Wrapper.

---

## Verification commands

```bash
# Playwright — all three engines
cd playwright-tests
npm install
npx playwright install chromium firefox webkit
npm test

# single engine while debugging
npx playwright test tests/saleor/e2e --project=webkit

# Java
cd ../rest-assured-tests
mvn clean test
```

Get **three consecutive green local runs** before pushing to `main` — the README
carries a CI status badge, and a red badge is the first thing a hiring manager
sees.

---

## Before publishing

- [ ] Repo Settings → Pages → Source: **GitHub Actions** (the `publish-report`
      job fails until this is set)
- [ ] Confirm the repo is **public** — check the URL in an incognito window
- [ ] Verify the two badge URLs in `README.md` resolve (username capitalisation
      must match exactly)
- [ ] Three consecutive green runs locally
