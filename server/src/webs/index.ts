/**
 * did:webs Module for archon.social
 * 
 * Enables archon.social to serve as a did:webs host with Archon as the
 * witness infrastructure (replacing KERI).
 * 
 * Endpoints:
 *   GET /:aid/did.json     - DID document in did:webs format
 *   GET /:aid/archon.cesr  - Archon event stream
 *   GET /:aid/keri.cesr    - Alias for archon.cesr (compatibility)
 *   GET /api/webs/:name    - Lookup did:webs by @name
 *   GET /api/webs/resolve/:did - Resolve a did:webs
 * 
 * Usage:
 *   import websRoutes from './webs/index.js';
 *   app.use(websRoutes);
 */

export { default } from './routes.js';
export * from './generator.js';
