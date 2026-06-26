// Global test setup for Vitest.
//
// Registers @testing-library/jest-dom matchers and ensures DOM cleanup
// between tests.

import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
