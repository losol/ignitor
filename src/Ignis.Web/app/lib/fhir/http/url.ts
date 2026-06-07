/*
 * Copyright (c) 2026, Incendi <info@incendi.no>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { isValidFhirId, isValidFhirResourceTypeName } from "../validation";

/**
 * Builds a FHIR resource path (`Type` or `Type/id`) from segments, returning
 * `null` when a segment isn't a syntactically valid FHIR resource type name or
 * id. Because the inputs are validated to URL-safe charsets, the result needs
 * no further encoding before it is placed into a URL path.
 */
export function fhirResourcePath(resourceType: string, id?: string): string | null {
  if (!isValidFhirResourceTypeName(resourceType)) return null;
  if (id === undefined) return resourceType;
  if (!isValidFhirId(id)) return null;
  return `${resourceType}/${id}`;
}

/**
 * Joins an endpoint onto a FHIR server base URL.
 */
export function joinFhirUrl(base: string | URL, endpoint: string): URL {
  const baseUrl = new URL(base);
  const normalizedPath = baseUrl.pathname === "/"
    ? "/fhir/"
    : baseUrl.pathname.endsWith("/")
      ? baseUrl.pathname
      : `${baseUrl.pathname}/`;
  return new URL(endpoint, `${baseUrl.origin}${normalizedPath}`);
}
