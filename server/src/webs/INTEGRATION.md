# did:webs Integration for archon.social

## Quick Start

Add these lines to `server/src/index.ts`:

### 1. Import the routes (near top of file)

```typescript
import websRoutes from './webs/index.js';
```

### 2. Mount the routes (after other middleware, before the catch-all)

```typescript
// did:webs support
app.use(websRoutes);
```

Add this BEFORE the static file serving and catch-all routes.

## Full Example

```typescript
// ... existing imports ...
import websRoutes from './webs/index.js';

// ... existing middleware ...

// did:webs support - serve did.json and archon.cesr files
app.use(websRoutes);

// ... static files and catch-all ...
```

## Endpoints Added

| Endpoint | Description |
|----------|-------------|
| `GET /:aid/did.json` | DID document in did:webs format |
| `GET /:aid/archon.cesr` | Archon event stream (CESR format) |
| `GET /:aid/keri.cesr` | Alias → archon.cesr (compatibility) |
| `GET /api/webs/:name` | Lookup instructions by @name |
| `GET /api/webs/resolve/:did` | Resolve a did:webs identifier |

## Testing

After integration, test with flaxscrip's DID:

```bash
# Get did.json
curl https://archon.social/bagaaiera7vsjlu6oiluzd4enop5j7sfzjbwp2ujudt6uunkz6hhd4lgfe4sa/did.json

# Get archon.cesr
curl https://archon.social/bagaaiera7vsjlu6oiluzd4enop5j7sfzjbwp2ujudt6uunkz6hhd4lgfe4sa/archon.cesr

# Resolve did:webs
curl https://archon.social/api/webs/resolve/did:webs:archon.social:bagaaiera7vsjlu6oiluzd4enop5j7sfzjbwp2ujudt6uunkz6hhd4lgfe4sa
```

## did:webs Identifier Format

```
did:webs:archon.social:<aid>
did:webs:archon.social:flaxscrip:<aid>  (with @name path)
```

Example for flaxscrip:
```
did:webs:archon.social:bagaaiera7vsjlu6oiluzd4enop5j7sfzjbwp2ujudt6uunkz6hhd4lgfe4sa
```
