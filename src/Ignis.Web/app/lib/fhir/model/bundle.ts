/*
 * Copyright (c) 2026, Incendi <info@incendi.no>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { isResource, type Resource } from "./resource";

/** FHIR Bundle resource.
 * 
 * Note: This is a simplified version of the Bundle resource.
 * 
 * R4: https://hl7.org/fhir/R4/bundle.html
 * R4B: https://hl7.org/fhir/R4B/bundle.html
 * R5: https://hl7.org/fhir/R5/bundle.html
 */
export interface Bundle extends Resource<"Bundle"> {
  total?: number;
  entry?: { resource?: Resource }[];
}

/** Returns the resources carried by a FHIR Bundle's entries. */
export function bundleResources(bundle: Bundle): Resource[] {
  return (bundle.entry ?? [])
    .map((entry) => entry.resource)
    .filter((resource): resource is Resource => isResource(resource));
}
