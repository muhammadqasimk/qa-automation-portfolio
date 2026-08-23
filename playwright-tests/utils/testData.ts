/** Helpers for generating unique, collision-free test data. */

export function uniqueSuffix(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function newUser() {
  const suffix = uniqueSuffix();
  return {
    username: `qa_${suffix}`,
    email: `qa_${suffix}@example.com`,
    password: 'Password123!',
  };
}

export function newArticle() {
  const suffix = uniqueSuffix();
  return {
    title: `Automated Article ${suffix}`,
    about: 'Written by an automated Playwright test',
    body: 'This article was created end-to-end to verify the publish flow.',
    tag: 'automation',
  };
}
