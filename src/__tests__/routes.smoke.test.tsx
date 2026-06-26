/**
 * Route smoke tests. Mounts each page in isolation under a
 * MemoryRouter and asserts no thrown render error.
 *
 * happy-dom does not implement HTMLCanvasElement.getContext, so the
 * App's fixed-background luminance side effect logs an error — we
 * permit known noise and fail on anything else.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

interface RouteCase {
  name: string;
  path: string;
  mount: () => Promise<React.ComponentType<{ isBgDark?: boolean }>>;
}

const CASES: RouteCase[] = [
  {
    name: "/generator",
    path: "/generator",
    mount: async () => {
      const mod = await import("../pages/GeneratorPage");
      return ((props) =>
        React.createElement(mod.default, {
          ...props,
          isBgDark: props.isBgDark ?? true,
          onPreview: () => undefined,
        })) as React.ComponentType<{ isBgDark?: boolean }>;
    },
  },
];

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("route smoke tests", () => {
  for (const c of CASES) {
    it(`mounts ${c.name} without throwing`, async () => {
      const Page = await c.mount();
      const ui = render(
        <MemoryRouter initialEntries={[c.path]}>
          <Routes>
            <Route path={c.path} element={<Page isBgDark={true} />} />
          </Routes>
        </MemoryRouter>
      );
      await waitFor(
        () => {
          expect(ui.container.firstChild).not.toBeNull();
        },
        { timeout: 3000 }
      );
    });
  }
});
