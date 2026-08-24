/**
 * Central place for the target base URLs.
 * Each can be overridden with an environment variable so the same suite can run
 * against a different deployment without code changes.
 */
export const URLS = {
  conduit: process.env.CONDUIT_URL ?? 'https://demo.realworld.show',
  saleor: process.env.SALEOR_URL ?? 'https://demo.saleor.io',
  restfulBooker: process.env.BOOKER_URL ?? 'https://restful-booker.herokuapp.com',
};
