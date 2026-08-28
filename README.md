# Samaysetu

Samaysetu is a delivery-time booking and route-operations platform for Delhi. It helps recipients choose a suitable two-hour delivery window and gives delivery staff a clear map, booking list, next-stop route, status updates, and recipient notification workflow.

## Highlights

- Customer booking with delivery-window prediction.
- Detailed and simplified booking journeys.
- Postman route desk with all booked deliveries visible on the map.
- Direct next-stop routing from the last delivered location.
- Route clearing by tapping the selected booking again.
- Delivery status events, proof-of-delivery storage, and notification intents.
- Weather and traffic signals considered by the slot prediction flow without adding unnecessary complexity to the customer view.

## Technology

Samaysetu is built with React, TypeScript, Tailwind CSS, Vite, Express, tRPC, Drizzle ORM, and MySQL-compatible persistence.

## Local development

Install dependencies with `pnpm install`, then start the development server with `pnpm dev`.

Useful checks:

```bash
pnpm check
pnpm test
pnpm build
```

## Project structure

- `client/` — customer and postman interfaces.
- `server/` — API procedures, persistence helpers, and delivery workflows.
- `drizzle/` — database schema and migrations.
- `shared/` — shared types and constants.

## Status

Samaysetu is an actively refined product prototype focused on making delivery scheduling and field operations easier to understand and use.
