import assert from "node:assert/strict";
import test from "node:test";
import { buildGeometry, buildVectorSvg, defaultScene, LIMITS, validateScene, vectorLayersSvg } from "./stylescape-runtime.js";

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

test("validated SVG layers are editable, reorderable, and exported as vector shapes", () => {
  const base = defaultScene();
  const layers = [
    { id: "orbit-1", kind: "orbits", visible: true, opacity: 0.5, colorIndex: 1, detail: 12, blend: "normal" },
    { id: "contours-1", kind: "contours", visible: true, opacity: 0.32, colorIndex: 3, detail: 9, blend: "multiply" },
  ];
  const parsed = validateScene({ ...base, layers });
  assert.equal(parsed.ok, true);
  const svg = vectorLayersSvg(parsed.scene, 800, 450);
  assert.match(svg, /<svg[^>]+viewBox="0 0 800 450"/);
  assert.match(svg, /<circle/);
  assert.match(svg, /<path/);
  assert.match(svg, /stylescape-layer-orbit-1/);
  assert.match(svg, /stylescape-layer-contours-1/);
  assert.doesNotMatch(svg, /data:image\//);
  const reversed = vectorLayersSvg({ ...parsed.scene, layers: [...layers].reverse() }, 800, 450);
  assert.ok(reversed.indexOf("stylescape-layer-contours-1") < reversed.indexOf("stylescape-layer-orbit-1"));
});

test("invalid and excessive vector layers are rejected", () => {
  const base = defaultScene();
  const valid = { id: "layer-1", kind: "grid", visible: true, opacity: 0.6, colorIndex: 2, detail: 12, blend: "normal" };
  assert.equal(validateScene({ ...base, layers: [{ ...valid, id: "<script>" }] }).ok, false);
  assert.equal(validateScene({ ...base, layers: Array.from({ length: 13 }, (_, i) => ({ ...valid, id: `layer-${i}` })) }).ok, false);
});

test("full SVG export contains actual vector ribbon paths and safely escapes scene titles", () => {
  const scene = { ...defaultScene(), name: '<scene & "title">' };
  const svg = buildVectorSvg(scene, 960, 540);
  assert.match(svg, /^<\?xml version="1\.0"/);
  assert.match(svg, /viewBox="0 0 960 540"/);
  assert.match(svg, /&lt;scene &amp; &quot;title&quot;&gt;/);
  assert.match(svg, /<path d="M.+Z" fill="#[0-9a-f]{6}"/);
  assert.doesNotMatch(svg, /data:image\//);
});
