# Stage 12 — Student application journey

Adds an Applications collection, public application form/API, destination/university relationships, application statuses, reference numbers, and document-requirement tracking.

## Deliberate boundary
Stage 12 does **not** accept raw student document uploads yet. Identity and academic files need authenticated/private storage, file validation, authorization rules, retention controls, and download protections. Those are handled in Stage 14 rather than exposing sensitive documents through a public upload endpoint.
