# GAP staff workflow

Stage 13 adds operational fields and a staff pipeline dashboard.

## Leads
Use `status`, `assignedTo`, `followUpAt`, and `staffNotes` to move enquiries from new to contacted, qualified, application-started, or not-proceeding.

## Applications
Use `assignedTo`, `priority`, `nextAction`, `nextActionAt`, `documents`, `status`, `statusHistory`, and `internalNotes`.

## Operations dashboard
`/staff` provides aggregate counts and recent records. Payload Admin remains the record-management interface at `/admin`.

## Security boundary
Do not expose `/staff` publicly in production yet. Stage 14 is responsible for explicit staff authentication/authorization and secure document storage. Until then, use Payload Admin as the protected production operations interface.
