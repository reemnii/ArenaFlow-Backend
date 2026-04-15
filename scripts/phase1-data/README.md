# Phase 1 Mock Data

These JSON files mirror the frontend Phase 1 mock files from:

- `src/data/teams.js`
- `src/data/tournaments.js`

The `phase1Id` fields are only used by `scripts/seedPhase1Data.js` to connect
mock tournament `teamIds` to the real MongoDB `_id` values created for teams.
They are not stored on the current Mongoose models.

Run the seed with:

```bash
npm run seed:phase1
```
