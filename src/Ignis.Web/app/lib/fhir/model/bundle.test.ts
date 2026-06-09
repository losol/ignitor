/*
 * Copyright (c) 2026, Incendi <info@incendi.no>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { describe, expect, it } from "vitest";

import { bundleResources, type Resource } from ".";

describe("bundleResources", () => {
  it("returns the resource object from each entry", () => {
    const bundle = {
      entry: [
        { resource: { resourceType: "Patient", id: "1" } },
        { resource: { resourceType: "Organization", id: "2", name: "Acme" } },
      ],
    };

    expect(bundleResources(bundle)).toEqual([
      { resourceType: "Patient", id: "1" },
      { resourceType: "Organization", id: "2", name: "Acme" },
    ]);
  });

  it("returns an empty array when there are no entries", () => {
    expect(bundleResources({})).toEqual([]);
    expect(bundleResources({ entry: [] })).toEqual([]);
  });

  it("skips entries without a resource object", () => {
    const bundle = {
      entry: [
        { resource: { resourceType: "Patient", id: "1" } },
        {},
        { resource: undefined },
      ],
    };

    expect(bundleResources(bundle)).toEqual([{ resourceType: "Patient", id: "1" }]);
  });

  it("excludes array-valued resources from a malformed payload", () => {
    const bundle = {
      entry: [
        { resource: { resourceType: "Patient", id: "1" } },
        { resource: [] as unknown as Resource },
      ],
    };

    expect(bundleResources(bundle)).toEqual([{ resourceType: "Patient", id: "1" }]);
  });

  it("excludes objects without a string resourceType", () => {
    const bundle = {
      entry: [
        { resource: { resourceType: "Patient", id: "1" } },
        { resource: { id: "2" } },
      ],
    };

    expect(bundleResources(bundle)).toEqual([{ resourceType: "Patient", id: "1" }]);
  });
});
