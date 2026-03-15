# Our Personal Diary

## Current State
The sitemap.xml exists as a static file in `public/` but the backend has no `http_request` handler. The SPA routing intercepts `/sitemap.xml` and returns HTML, causing Google Search Console to report "Sitemap is HTML" or "could not fetch".

## Requested Changes (Diff)

### Add
- `http_request` query function in backend that intercepts GET `/sitemap.xml` and returns valid XML with `Content-Type: application/xml`

### Modify
- `src/backend/main.mo` -- add HTTP types and `http_request` handler

### Remove
- Nothing

## Implementation Plan
1. Add HTTP types (HttpRequest, HttpResponse, Header) to backend
2. Implement `http_request` query that matches path `/sitemap.xml` and returns the XML content with correct headers
3. All other paths return 404 (the asset canister handles everything else)
