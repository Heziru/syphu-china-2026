import { chromium } from "playwright";

/** Use an existing browser. Browser binaries are never installed by a review. */
function candidates() {
  const channel = process.env.BROWSER_CHANNEL;
  if (channel) return [channel === "chromium" ? {} : { channel }];
  return process.platform === "win32"
    ? [{ channel: "msedge" }, {}]
    : [{}, { channel: "msedge" }];
}

async function launch(start, options) {
  const errors = [];
  for (const browser of candidates()) {
    try {
      return await start({ headless: true, ...browser, ...options });
    } catch (error) {
      errors.push(error);
    }
  }
  throw new AggregateError(
    errors,
    "No review browser could start. Install Chromium with `npx playwright install chromium`, or set BROWSER_CHANNEL=msedge (or chrome) to use an installed browser.",
  );
}

export const launchReviewBrowser = (options = {}) =>
  launch((config) => chromium.launch(config), options);

export const launchReviewContext = (profile, options = {}) =>
  launch(
    (config) => chromium.launchPersistentContext(profile, config),
    options,
  );
