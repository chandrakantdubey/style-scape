import assert from "node:assert/strict";
import test from "node:test";
import { buildGeometry, defaultScene, LIMITS, validateScene } from "./stylescape-runtime.js";

test("scene defaults validate and preserve a reproducible seed", () => {
  const scene = defaultScene();
  const result = validateScene(scene);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.scene.seed, scene.seed);
    assert.equal(result.scene.fieldMode, "curl");
  }
});

test("each deterministic field produces finite, repeatable, bounded geometry", () => {
  for (const fieldMode of ["curl", "orbit", "contour"]) {
    const scene = { ...defaultScene(), fieldMode };
    const first = buildGeometry(scene, 16 / 9);
    const repeat = buildGeometry(scene, 16 / 9);
    assert.ok(first.vertexCount > 0);
    assert.ok(first.vertexCount <= LIMITS.maxVertices);
    assert.equal(first.data.length, first.vertexCount * 6);
    assert.ok(first.data.every(Number.isFinite));
    assert.deepEqual(first.data, repeat.data);
  }
});

test("field modes produce distinct flows for the same seed", () => {
  const base = defaultScene();
  const curl = buildGeometry({ ...base, fieldMode: "curl" }, 16 / 9);
  const orbit = buildGeometry({ ...base, fieldMode: "orbit" }, 16 / 9);
  const contour = buildGeometry({ ...base, fieldMode: "contour" }, 16 / 9);
  assert.notDeepEqual(curl.data, orbit.data);
  assert.notDeepEqual(curl.data, contour.data);
});

test("invalid field modes and versions are rejected instead of silently accepted", () => {
  const scene = defaultScene();
  assert.equal(validateScene({ ...scene, fieldMode: "remote-code" }).ok, false);
  assert.equal(validateScene({ ...scene, version: 999 }).ok, false);
});
