# REFina UI V2 — Layout Redesign

## Scope
- Desktop: persistent 256px sidebar.
- Mobile: slide-in navigation drawer; legacy bottom dock removed from the application shell.
- Header: retain existing period and data controls; hide duplicate horizontal module navigation.
- Workspace: responsive content width capped at 1600px.
- Visual foundation: shared navy, amber, border, text, and focus tokens.

## Business-logic safety
Changes are limited to the application shell, navigation, and global presentation. FinancialContext, transaction processors, types, initial data, report calculations, and persistence keys are unchanged.

## Measurable acceptance criteria
| Area | Acceptance criterion |
|---|---|
| Desktop navigation | Fixed 256px sidebar visible at the lg breakpoint. |
| Mobile navigation | Drawer available below lg; selecting a module changes activeView and closes drawer. |
| Active state | Current module is highlighted and exposed via aria-current=page. |
| Workspace | Main content uses available width with a 1600px maximum. |
| Existing controls | Navbar period filter, demo reset, and clear-data modal remain mounted. |
| Business logic | No context, transaction, model, or seed-data files changed. |

## Validation status
- Static source inspection: completed.
- Browser visual regression at 360px, 768px, 1024px, and 1440px: pending.
- TypeScript/lint and production build: pending; this GitHub-only workflow cannot execute package scripts.
- Keyboard and screen-reader interaction test: pending.

## Follow-up QA
1. Run bun install and bun run lint.
2. Run bun run build.
3. Verify drawer open/close, backdrop dismissal, and navigation at 360px and 768px.
4. Verify sidebar and content alignment at 1024px and 1440px.
5. Verify period filter, demo reset, clear data, print dialogs, and all eight modules.
