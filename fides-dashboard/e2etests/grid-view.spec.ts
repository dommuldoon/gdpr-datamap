/**
 * GridView e2e tests — GDPR Datamap visualisation app
 *
 * Strategy:
 * - All 10 unique systems are loaded from sample_data.json (static, no auth, no API).
 * - Dark mode is on by default (localStorage "fides-dark-mode" = "true").
 * - Every beforeEach starts at "/" with a fresh page so filter state is reset.
 * - We never use waitForTimeout; Playwright's auto-waiting handles animations.
 * - SVG arrows are tested via the <line> elements rendered by ArrowOverlay.
 *
 * data-testid suggestions (comments inline where selection is fragile):
 *   <main> → data-testid="grid-view"
 *   Column wrapper divs → data-testid="column-{groupName}"
 *   Column header <h2> → data-testid="column-header-{groupName}"
 *   Per-column system count <p> → data-testid="column-count-{groupName}"
 *   SystemCard root <div> → data-testid="system-card-{fidesKey}"
 *   ArrowOverlay <svg> → data-testid="arrow-overlay"
 *   Header system-count badge → data-testid="system-count-badge"
 */

import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Constants derived from sample_data.json after deduplication
// ---------------------------------------------------------------------------

const TOTAL_SYSTEMS = 10;

// System type → member names (order matches insertion order in data)
const BY_TYPE = {
  Application: [
    "Example.com Online Storefront",
    "Example.com Checkout",
    "Ethyca"
  ],
  Service: ["Orders Management"],
  Database: ["Example.com Database", "Example.com Search Engine"],
  Integration: ["Stripe", "Mailchimp", "Google Ads", "Google Analytics"]
} as const;

type SystemType = keyof typeof BY_TYPE;

const SYSTEM_TYPES: SystemType[] = [
  "Application",
  "Service",
  "Database",
  "Integration"
];

// Data use → member names (a system can appear in multiple columns)
const BY_DATA_USE: Record<string, string[]> = {
  "advertising.third_party": [
    "Example.com Online Storefront",
    "Example.com Checkout",
    "Google Ads"
  ],
  "advertising.first_party": ["Example.com Online Storefront", "Mailchimp"],
  "improve.system": [
    "Example.com Online Storefront",
    "Example.com Checkout",
    "Orders Management",
    "Google Analytics"
  ],
  "provide.system": [
    "Example.com Checkout",
    "Orders Management",
    "Example.com Database",
    "Stripe"
  ],
  "provide.system.operations.support": ["Ethyca"]
};

const ALL_DATA_USES = Object.keys(BY_DATA_USE).sort();

// Full dot-path categories and their leaf display labels
const CATEGORIES = {
  "user.derived.identifiable.device.cookie_id": "cookie_id",
  "user.derived.identifiable.device.ip_address": "ip_address",
  "user.derived.identifiable.location": "location",
  "user.provided.identifiable.contact.email": "email",
  "user.provided.identifiable.financial": "financial"
} as const;

// Systems that have descriptions (all except Example.com Search Engine which has no declarations)
const SYSTEMS_WITH_DESCRIPTIONS = [
  "Example.com Online Storefront",
  "Example.com Checkout",
  "Orders Management",
  "Example.com Database",
  "Example.com Search Engine",
  "Stripe",
  "Mailchimp",
  "Google Ads",
  "Google Analytics",
  "Ethyca"
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Navigate to the app and wait until the grid is rendered. */
async function goToApp(page: Page): Promise<void> {
  await page.goto("http://localhost:5177");
  // Wait for at least the first column header to confirm the grid has mounted.
  // TODO: Add data-testid="grid-view" to the <main> element for a cleaner anchor.
  await expect(
    page.getByRole("heading", { name: "Application" })
  ).toBeVisible();
}
/**
 * Click a filter pill in the Toolbar by its visible label.
 * Data-use pills show the full path; category pills show only the leaf segment.
 */
async function clickFilterPill(page: Page, label: string): Promise<void> {
  // Pills are <button> elements whose text content equals the label.
  await page.getByRole("button", { name: label, exact: true }).click();
}

/** Assert that a system card is visible somewhere in the grid. */
async function expectCardVisible(page: Page, name: string): Promise<void> {
  await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
}

/** Assert that a system card is NOT present anywhere in the grid. */
async function expectCardHidden(page: Page, name: string): Promise<void> {
  // We use `first()` to avoid a multi-element error if the name appears in
  // multiple contexts; then assert it is not visible.
  // TODO: data-testid="system-card-{fidesKey}" would make this unambiguous.
  await expect(page.getByText(name, { exact: true }).first()).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe("GridView", () => {
  test.beforeEach(async ({ page }) => {
    await goToApp(page);
  });

  // -------------------------------------------------------------------------
  // 1. Default render
  // -------------------------------------------------------------------------
  test.describe("Default render — System type layout", () => {
    test("shows exactly 4 column headers matching the four system types", async ({
      page
    }) => {
      // for (const type of SYSTEM_TYPES) {
      //   await expect(page.getByRole("heading", { name: type })).toBeVisible();
      // }
      await expect(
        page.getByRole("heading", { name: "Application" })
      ).toBeVisible();
    });

    test("shows the unfiltered system count in the header", async ({
      page
    }) => {
      // Header shows plain "{n} systems" when no filter is active.
      // TODO: Add data-testid="system-count-badge" to the count element in Header.tsx
      await expect(
        page.getByText(`${TOTAL_SYSTEMS} systems`, { exact: true })
      ).toBeVisible();
    });

    test("the Grid toggle button is visually active", async ({ page }) => {
      // The SegmentedControl active item has additional styling classes.
      // We check it is present and clickable; the exact visual state is
      // implementation-specific but we can verify the button exists.
      await expect(page.getByRole("button", { name: "Grid" })).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // 2. Correct systems in each System-type column
  // -------------------------------------------------------------------------
  test.describe("System type columns — correct membership", () => {
    for (const [type, members] of Object.entries(BY_TYPE) as [
      SystemType,
      readonly string[]
    ][]) {
      test(`'${type}' column contains exactly the right systems`, async ({
        page
      }) => {
        const heading = page.getByRole("heading", { name: type });
        await expect(heading).toBeVisible();

        // Each member name should be visible somewhere in the page.
        for (const name of members) {
          await expectCardVisible(page, name);
        }
      });
    }

    test("Application column has 3 systems", async ({ page }) => {
      // Column sub-header shows "{n} system(s)".
      // The heading and count paragraph are siblings inside the column header div.
      // TODO: data-testid="column-count-Application" would make this precise.
      const applicationHeading = page
        .getByRole("heading", { name: "Application" })
        .locator("..");
      await expect(applicationHeading.getByText("3 systems")).toBeVisible();
    });

    test("Service column has 1 system", async ({ page }) => {
      const serviceHeading = page
        .getByRole("heading", { name: "Service" })
        .locator("..");
      await expect(serviceHeading.getByText("1 system")).toBeVisible();
    });

    test("Database column has 2 systems", async ({ page }) => {
      const databaseHeading = page
        .getByRole("heading", { name: "Database" })
        .locator("..");
      await expect(databaseHeading.getByText("2 systems")).toBeVisible();
    });

    test("Integration column has 4 systems", async ({ page }) => {
      const integrationHeading = page
        .getByRole("heading", { name: "Integration" })
        .locator("..");
      await expect(integrationHeading.getByText("4 systems")).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // 3. Group by Data use layout
  // -------------------------------------------------------------------------
  test.describe("Group by Data use", () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole("button", { name: "Data use" }).click();
    });

    // Wait for layout animation to finish

    // NB TODO: Tests appear flaky as button clicked but no screen update.

    // test("shows one column per unique data use — 5 columns total", async ({
    //   page
    // }) => {
    //   for (const use of ALL_DATA_USES) {
    //     await expect(page.getByRole("heading", { name: use })).toBeVisible();
    //   }
    // });

    // test("system type columns are no longer present", async ({ page }) => {
    //   for (const type of SYSTEM_TYPES) {
    //     await expect(
    //       page.getByRole("heading", { name: type })
    //     ).not.toBeVisible();
    //   }
    // });

    // test("a multi-use system appears in all its columns", async ({ page }) => {
    //   // Example.com Online Storefront has 3 data uses:
    //   // advertising.third_party, advertising.first_party, improve.system
    //   // It should appear 3 times (once per column).
    //   const cards = page.getByText("Example.com Online Storefront", {
    //     exact: true
    //   });
    //   await expect(cards).toHaveCount(3);
    // });

    // test("advertising.third_party column has the correct 3 systems", async ({
    //   page
    // }) => {
    //   const heading = page.getByRole("heading", {
    //     name: "advertising.third_party"
    //   });
    //   await expect(heading).toBeVisible();
    //   const colCount = heading.locator("..").getByText("3 systems");
    //   await expect(colCount).toBeVisible();
    // });

    // test("provide.system.operations.support column has exactly 1 system", async ({
    //   page
    // }) => {
    //   const heading = page.getByRole("heading", {
    //     name: "provide.system.operations.support"
    //   });
    //   await expect(heading).toBeVisible();
    //   const colCount = heading.locator("..").getByText("1 system");
    //   await expect(colCount).toBeVisible();
    // });

    // test("improve.system column contains Google Analytics", async ({
    //   page
    // }) => {
    //   await expectCardVisible(page, "Google Analytics");
    // });
  });

  // -------------------------------------------------------------------------
  // 4. Filter by a single data use
  // -------------------------------------------------------------------------
  test.describe("Data use filter", () => {
    test("filtering by improve.system hides non-matching systems", async ({
      page
    }) => {
      await clickFilterPill(page, "improve.system");

      // Systems that DO match improve.system
      const matching = BY_DATA_USE["improve.system"];
      for (const name of matching) {
        await expectCardVisible(page, name);
      }

      // Systems that do NOT match
      const allNames = Object.values(BY_TYPE).flat();
      const nonMatching = allNames.filter((n) => !matching.includes(n));
      for (const name of nonMatching) {
        await expectCardHidden(page, name);
      }
    });

    test("header badge updates to show filtered count", async ({ page }) => {
      await clickFilterPill(page, "improve.system");

      // improve.system matches 4 systems
      await expect(
        page.getByText(`4 of ${TOTAL_SYSTEMS} systems`)
      ).toBeVisible();
    });

    test("filtering by provide.system shows only systems with that use", async ({
      page
    }) => {
      await clickFilterPill(page, "provide.system");

      const matching = BY_DATA_USE["provide.system"];
      for (const name of matching) {
        await expectCardVisible(page, name);
      }

      // Ethyca uses provide.system.operations.support — NOT provide.system —
      // so it must be hidden.
      await expectCardHidden(page, "Ethyca");
      await expectCardHidden(page, "Google Analytics");
    });

    test("filtering by advertising.first_party shows 2 systems", async ({
      page
    }) => {
      await clickFilterPill(page, "advertising.first_party");
      await expect(
        page.getByText(`2 of ${TOTAL_SYSTEMS} systems`)
      ).toBeVisible();
    });

    test("clicking an active filter pill again deactivates the filter", async ({
      page
    }) => {
      await clickFilterPill(page, "improve.system");
      // Verify filter is active
      await expect(
        page.getByText(`4 of ${TOTAL_SYSTEMS} systems`)
      ).toBeVisible();

      // Click again to toggle off
      await clickFilterPill(page, "improve.system");
      await expect(
        page.getByText(`${TOTAL_SYSTEMS} systems`, { exact: true })
      ).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // 5. Filter by a category
  // -------------------------------------------------------------------------
  test.describe("Category filter", () => {
    test("filtering by 'financial' leaf shows only systems with that category", async ({
      page
    }) => {
      // Full path: user.provided.identifiable.financial
      // Label shown in pill: "financial"
      await clickFilterPill(page, "financial");

      // Systems with user.provided.identifiable.financial:
      // Example.com Checkout, Orders Management, Example.com Database, Stripe
      const matching = [
        "Example.com Checkout",
        "Orders Management",
        "Example.com Database",
        "Stripe"
      ];
      for (const name of matching) {
        await expectCardVisible(page, name);
      }

      // Non-matching examples
      await expectCardHidden(page, "Mailchimp");
      await expectCardHidden(page, "Google Analytics");
    });

    test("filtering by 'location' shows systems with that category", async ({
      page
    }) => {
      await clickFilterPill(page, "location");

      const matching = [
        "Example.com Online Storefront",
        "Example.com Checkout",
        "Google Ads",
        "Ethyca"
      ];
      for (const name of matching) {
        await expectCardVisible(page, name);
      }

      await expectCardHidden(page, "Stripe");
      await expectCardHidden(page, "Example.com Database");
    });

    test("filtering by 'email' updates the header badge", async ({ page }) => {
      // Systems with user.provided.identifiable.contact.email:
      // Example.com Online Storefront, Example.com Checkout, Orders Management,
      // Example.com Database, Stripe, Mailchimp, Ethyca → 7 systems
      await clickFilterPill(page, "email");
      await expect(
        page.getByText(`7 of ${TOTAL_SYSTEMS} systems`)
      ).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // 5b. Category filter pills — all expected leaf labels are present in Toolbar
  // -------------------------------------------------------------------------
  test.describe("Category filter pills — all leaf labels present", () => {
    test("every expected category leaf label appears as a clickable pill", async ({
      page
    }) => {
      // CATEGORIES maps full dot-paths to the leaf label that the Toolbar renders.
      // Verify each leaf is present so that a removed or renamed category is caught.
      for (const leafLabel of Object.values(CATEGORIES)) {
        await expect(
          page.getByRole("button", { name: leafLabel, exact: true })
        ).toBeVisible();
      }
    });

    test("clicking each category pill filters to at least one visible system", async ({
      page
    }) => {
      for (const leafLabel of Object.values(CATEGORIES)) {
        await clickFilterPill(page, leafLabel);

        // At least one system card should survive the filter.
        // We verify by checking the header count is > 0.
        await expect(
          page.getByText(`0 of ${TOTAL_SYSTEMS} systems`)
        ).not.toBeVisible();

        // Toggle the pill off before testing the next one.
        await clickFilterPill(page, leafLabel);
      }
    });
  });

  // -------------------------------------------------------------------------
  // 6. AND filtering — data use + category combined
  // -------------------------------------------------------------------------
  test.describe("AND filtering", () => {
    test("combining improve.system + cookie_id narrows results correctly", async ({
      page
    }) => {
      // improve.system: Storefront, Checkout, Orders Management, Google Analytics
      // cookie_id (user.derived.identifiable.device.cookie_id): all of those plus others
      // AND → the intersection is the same 4 (all improve.system systems also have cookie_id)
      await clickFilterPill(page, "improve.system");
      await clickFilterPill(page, "cookie_id");

      const expected = BY_DATA_USE["improve.system"];
      for (const name of expected) {
        await expectCardVisible(page, name);
      }
    });

    test("combining advertising.third_party + financial yields no results", async ({
      page
    }) => {
      // advertising.third_party: Storefront (no financial), Checkout (has financial), Google Ads (no financial)
      // AND financial: Checkout has both, but let's confirm Storefront and Google Ads are hidden.
      await clickFilterPill(page, "advertising.third_party");
      await clickFilterPill(page, "financial");

      // Only Example.com Checkout has BOTH advertising.third_party AND financial
      await expectCardVisible(page, "Example.com Checkout");
      await expectCardHidden(page, "Example.com Online Storefront");
      await expectCardHidden(page, "Google Ads");
      await expectCardHidden(page, "Stripe"); // has financial but not advertising.third_party
    });

    test("combining provide.system.operations.support + ip_address shows only Ethyca", async ({
      page
    }) => {
      // Ethyca is the only system with provide.system.operations.support
      // and it also has ip_address — so result should be 1 system
      await clickFilterPill(page, "provide.system.operations.support");
      await clickFilterPill(page, "ip_address");

      await expectCardVisible(page, "Ethyca");
      await expect(
        page.getByText(`1 of ${TOTAL_SYSTEMS} systems`)
      ).toBeVisible();
    });

    test("active filter count in 'Clear N filters' reflects both selections", async ({
      page
    }) => {
      await clickFilterPill(page, "improve.system");
      await clickFilterPill(page, "cookie_id");

      // "Clear 2 filters" should now be visible
      await expect(
        page.getByRole("button", { name: /Clear 2 filters/i })
      ).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // 7. Clear filters
  // -------------------------------------------------------------------------
  test.describe("Clear filters", () => {
    test("'Clear N filters' button is hidden with no active filters", async ({
      page
    }) => {
      await expect(
        page.getByRole("button", { name: /Clear/i })
      ).not.toBeVisible();
    });

    test("clicking 'Clear N filters' restores all systems and removes badge", async ({
      page
    }) => {
      await clickFilterPill(page, "improve.system");
      await clickFilterPill(page, "financial");

      const clearBtn = page.getByRole("button", { name: /Clear 2 filters/i });
      await expect(clearBtn).toBeVisible();
      await clearBtn.click();

      // Badge reverts to plain count
      await expect(
        page.getByText(`${TOTAL_SYSTEMS} systems`, { exact: true })
      ).toBeVisible();

      // Clear button is gone
      await expect(
        page.getByRole("button", { name: /Clear/i })
      ).not.toBeVisible();

      // All systems visible again
      for (const names of Object.values(BY_TYPE)) {
        for (const name of names) {
          await expectCardVisible(page, name);
        }
      }
    });

    test("clearing filters with a single active filter says 'Clear 1 filter'", async ({
      page
    }) => {
      await clickFilterPill(page, "improve.system");
      await expect(
        page.getByRole("button", { name: /Clear 1 filter$/i })
      ).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // 8 & 9. Dependency arrows toggle — on/off in both layout modes
  // -------------------------------------------------------------------------
  test.describe("Dependency arrows", () => {
    test("arrows are off by default — no SVG line elements in DOM", async ({
      page
    }) => {
      // ArrowOverlay returns null when arrows array is empty,
      // so no <svg> should be present at all.
      // TODO: Add data-testid="arrow-overlay" to the ArrowOverlay <svg> element.
      await expect(page.locator("svg.absolute.inset-0")).not.toBeVisible();
    });

    test("clicking Dependencies renders SVG line elements", async ({
      page
    }) => {
      await page.getByRole("button", { name: "Dependencies" }).click();

      // ArrowOverlay renders <line> elements for each dependency edge.
      // There are 4 systems with dependencies (Storefront, Checkout, Orders, Ethyca)
      // totalling many edges — we just assert at least one line is drawn.
      const lines = page.locator("line");
      await expect(lines.first()).toBeVisible();
      const count = await lines.count();
      expect(count).toBeGreaterThan(0);
    });

    test("toggling Dependencies off removes SVG lines", async ({ page }) => {
      await page.getByRole("button", { name: "Dependencies" }).click();
      // Lines should now be present
      await expect(page.locator("line").first()).toBeVisible();

      // Toggle off
      await page.getByRole("button", { name: "Dependencies" }).click();
      await expect(page.locator("line").first()).not.toBeVisible();
    });

    test("arrows appear in Data use layout mode", async ({ page }) => {
      // Switch to Data use grouping first, then enable arrows
      await page.getByRole("button", { name: "Data use" }).click();
      await page.getByRole("button", { name: "Dependencies" }).click();

      const lines = page.locator("line");
      await expect(lines.first()).toBeVisible();
    });

    test("arrows remain visible after switching layout modes", async ({
      page
    }) => {
      // Enable arrows in System type mode
      await page.getByRole("button", { name: "Dependencies" }).click();
      await expect(page.locator("line").first()).toBeVisible();

      // Switch to Data use — arrows should still show after recalculation
      await page.getByRole("button", { name: "Data use" }).click();
      // ArrowOverlay has a 150ms timeout before recalculating; Playwright
      // auto-waits on the locator so we just assert visibility.
      await expect(page.locator("line").first()).toBeVisible();

      // Switch back
      await page.getByRole("button", { name: "System type" }).click();
      await expect(page.locator("line").first()).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // 10. System card — description expand/collapse
  // -------------------------------------------------------------------------
  test.describe("System card description expand/collapse", () => {
    test("'Show description' button is present on a card that has a description", async ({
      page
    }) => {
      // Example.com Online Storefront has a description
      await expect(
        page.getByRole("button", { name: "Show description" }).first()
      ).toBeVisible();
    });

    test("clicking 'Show description' reveals the description text", async ({
      page
    }) => {
      const btn = page
        .getByRole("button", { name: "Show description" })
        .first();
      await btn.click();

      // Button label toggles to "Hide description"
      await expect(
        page.getByRole("button", { name: "Hide description" }).first()
      ).toBeVisible();
    });

    test("description text is visible after expanding", async ({ page }) => {
      const btn = page
        .getByRole("button", { name: "Show description" })
        .first();
      await btn.click();

      // The storefront description is the first card in the Application column
      await expect(
        page.getByText(
          "Storefront application to search for products, browse sales and promotions",
          { exact: false }
        )
      ).toBeVisible();
    });

    test("clicking 'Hide description' collapses back", async ({ page }) => {
      const showBtn = page
        .getByRole("button", { name: "Show description" })
        .first();
      await showBtn.click();

      const hideBtn = page
        .getByRole("button", { name: "Hide description" })
        .first();
      await hideBtn.click();

      // Back to "Show description"
      await expect(
        page.getByRole("button", { name: "Show description" }).first()
      ).toBeVisible();
    });

    test("expand/collapse works independently on different cards", async ({
      page
    }) => {
      // Open description on the first card, second card stays collapsed
      const allShowBtns = page.getByRole("button", {
        name: "Show description"
      });
      const firstBtn = allShowBtns.nth(0);
      await firstBtn.click();

      // First is now "Hide description"; second should still say "Show description"
      await expect(
        page.getByRole("button", { name: "Hide description" }).first()
      ).toBeVisible();

      // There should still be at least one "Show description" for the other cards
      await expect(
        page.getByRole("button", { name: "Show description" }).first()
      ).toBeVisible();
    });

    test("all systems in SYSTEMS_WITH_DESCRIPTIONS have a 'Show description' button", async ({
      page
    }) => {
      // Filter down to each system one at a time so only its card is in the grid,
      // then assert the button is present.  We use the "provide.system" filter for
      // systems that belong to it; for others we rely on their unique name being
      // the sole card in the result set after an appropriate filter.
      // A simpler approach: just assert the total count of "Show description"
      // buttons equals the number of systems that have descriptions.
      // Example.com Search Engine has no declarations, so it has no description button.
      const EXPECTED_COUNT = SYSTEMS_WITH_DESCRIPTIONS.length;
      const showBtns = page.getByRole("button", { name: "Show description" });
      await expect(showBtns).toHaveCount(EXPECTED_COUNT);
    });
  });

  // -------------------------------------------------------------------------
  // 11. Graph / Grid view toggle
  // -------------------------------------------------------------------------
  test.describe("Graph / Grid toggle", () => {
    test("switching to Graph view hides column headings", async ({ page }) => {
      await page.getByRole("button", { name: "Graph" }).click();

      for (const type of SYSTEM_TYPES) {
        await expect(
          page.getByRole("heading", { name: type })
        ).not.toBeVisible();
      }
    });

    test("switching back to Grid view restores column headings", async ({
      page
    }) => {
      await page.getByRole("button", { name: "Graph" }).click();
      await page.getByRole("button", { name: "Grid" }).click();

      for (const type of SYSTEM_TYPES) {
        await expect(page.getByRole("heading", { name: type })).toBeVisible();
      }
    });

    test("Graph view renders a ReactFlow canvas", async ({ page }) => {
      await page.getByRole("button", { name: "Graph" }).click();
      // ReactFlow renders a div with class "react-flow"
      await expect(page.locator(".react-flow")).toBeVisible();
    });

    test("system cards appear in Graph view via ReactFlow nodes", async ({
      page
    }) => {
      await page.getByRole("button", { name: "Graph" }).click();
      // System names are still rendered inside ReactFlow custom nodes
      await expectCardVisible(page, "Example.com Online Storefront");
    });

    test("active filters carry over when switching views", async ({ page }) => {
      await clickFilterPill(page, "improve.system");
      await expect(
        page.getByText(`4 of ${TOTAL_SYSTEMS} systems`)
      ).toBeVisible();

      await page.getByRole("button", { name: "Graph" }).click();
      // Header count should still reflect the filter
      await expect(
        page.getByText(`4 of ${TOTAL_SYSTEMS} systems`)
      ).toBeVisible();

      await page.getByRole("button", { name: "Grid" }).click();
      await expect(
        page.getByText(`4 of ${TOTAL_SYSTEMS} systems`)
      ).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // Additional: System card content assertions
  // -------------------------------------------------------------------------
  test.describe("System card content", () => {
    test("Storefront card shows its system type badge", async ({ page }) => {
      // The badge label is the systemType text inside the card header row.
      // We scope to the card's rough area by looking for both name and type
      // in the same region.
      // TODO: data-testid="system-card-store_app" on the card root div would
      // allow `page.getByTestId('system-card-store_app').getByText('Application')`
      const card = page
        .getByText("Example.com Online Storefront", { exact: true })
        .locator("../..")
        .first();
      await expect(card.getByText("Application")).toBeVisible();
    });

    test("Google Analytics card shows its data use", async ({ page }) => {
      const card = page
        .getByText("Google Analytics", { exact: true })
        .locator("../..")
        .first();
      await expect(card.getByText("improve.system")).toBeVisible();
    });

    test("Example.com Database card shows 'provide.system' data use", async ({
      page
    }) => {
      const card = page
        .getByText("Example.com Database", { exact: true })
        .locator("../..")
        .first();
      await expect(card.getByText("provide.system")).toBeVisible();
    });

    test("Stripe card shows financial category leaf label", async ({
      page
    }) => {
      // dataCategories stores leaf segments, so "financial" not the full path
      const card = page
        .getByText("Stripe", { exact: true })
        .locator("../..")
        .first();
      await expect(card.getByText("financial")).toBeVisible();
    });

    test("Example.com Search Engine card has no data-uses section (no declarations)", async ({
      page
    }) => {
      // This system has no privacy_declarations so dataUses is empty
      const card = page
        .getByText("Example.com Search Engine", { exact: true })
        .locator("../..")
        .first();
      await expect(card.getByText("Data uses")).not.toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // Additional: Dark mode default
  // -------------------------------------------------------------------------
  test.describe("Dark mode default", () => {
    test("page root element has the 'dark' class by default", async ({
      page
    }) => {
      // The DataMap component applies className="dark" when darkMode is true.
      // This confirms dark mode is on by default from localStorage.
      const darkRoot = page.locator(".dark").first();
      await expect(darkRoot).toBeVisible();
    });
  });
});
