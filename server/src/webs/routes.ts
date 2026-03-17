/**
 * did:webs Routes for archon.social
 * Serves did.json and archon.cesr files for registered members
 */

import { Router, Request, Response } from 'express';
import { generateWebsFiles } from './generator.js';

const router = Router();

// Cache for generated files (simple in-memory cache)
const cache = new Map<string, { didJson: any; archonCesr: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper to get string param
function getStringParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] || '';
  return param || '';
}

/**
 * GET /:aid/did.json
 * Serves the DID document in did:webs format
 */
router.get('/:aid/did.json', async (req: Request, res: Response) => {
  try {
    const aid = getStringParam(req.params.aid);
    const didCid = `did:cid:${aid}`;
    
    // Check cache
    const cached = cache.get(aid);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.setHeader('Content-Type', 'application/did+json');
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached.didJson);
    }

    // Generate files
    const host = req.get('host') || 'archon.social';
    const files = await generateWebsFiles(didCid, host, null, {
      witnesses: [`https://${host}`]
    });

    // Cache result
    cache.set(aid, {
      didJson: files.didJson,
      archonCesr: files.archonCesr,
      timestamp: Date.now()
    });

    res.setHeader('Content-Type', 'application/did+json');
    res.setHeader('X-Cache', 'MISS');
    res.json(files.didJson);

  } catch (error) {
    console.error('Error generating did.json:', error);
    res.status(404).json({ 
      error: 'DID not found',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /:aid/archon.cesr
 * Serves the Archon event stream in CESR format
 */
router.get('/:aid/archon.cesr', async (req: Request, res: Response) => {
  try {
    const aid = getStringParam(req.params.aid);
    const didCid = `did:cid:${aid}`;
    
    // Check cache
    const cached = cache.get(aid);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.setHeader('Content-Type', 'application/cesr');
      res.setHeader('X-Cache', 'HIT');
      return res.send(cached.archonCesr);
    }

    // Generate files
    const host = req.get('host') || 'archon.social';
    const files = await generateWebsFiles(didCid, host, null, {
      witnesses: [`https://${host}`]
    });

    // Cache result
    cache.set(aid, {
      didJson: files.didJson,
      archonCesr: files.archonCesr,
      timestamp: Date.now()
    });

    res.setHeader('Content-Type', 'application/cesr');
    res.setHeader('X-Cache', 'MISS');
    res.send(files.archonCesr);

  } catch (error) {
    console.error('Error generating archon.cesr:', error);
    res.status(404).json({ 
      error: 'DID not found',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /:aid/keri.cesr
 * Alias for archon.cesr (for compatibility with did:webs tooling)
 */
router.get('/:aid/keri.cesr', async (req: Request, res: Response) => {
  // Redirect to archon.cesr
  const aid = getStringParam(req.params.aid);
  res.redirect(301, `/${aid}/archon.cesr`);
});

/**
 * GET /api/webs/:name
 * Generate did:webs for a registered @name
 */
router.get('/api/webs/:name', async (req: Request, res: Response) => {
  try {
    const name = getStringParam(req.params.name);
    const host = req.get('host') || 'archon.social';

    // This would need to look up the name in the registry
    // For now, return instructions
    res.json({
      message: 'Use the member API to get DID, then access webs files',
      example: {
        lookupName: `/api/member/${name}`,
        didJson: `/<aid>/did.json`,
        archonCesr: `/<aid>/archon.cesr`
      },
      didWebsFormat: `did:webs:${host}:${name}:<aid>`
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * GET /api/webs/resolve/:did
 * Resolve a did:webs identifier
 */
router.get('/api/webs/resolve/:did(*)', async (req: Request, res: Response) => {
  try {
    const did = getStringParam(req.params.did);
    
    // Parse did:webs
    if (!did || !did.startsWith('did:webs:')) {
      return res.status(400).json({ error: 'Invalid did:webs format' });
    }

    const parts = did.slice(9).split(':');
    if (parts.length < 2) {
      return res.status(400).json({ error: 'Invalid did:webs format' });
    }

    // Last part is the AID
    const aid = parts[parts.length - 1];
    const didCid = `did:cid:${aid}`;
    const host = parts[0].replace(/%3a/gi, ':');

    // Generate resolution result
    const files = await generateWebsFiles(didCid, host, null, {
      witnesses: [`https://${host}`]
    });

    res.json({
      didDocument: files.didJson,
      didResolutionMetadata: {
        contentType: 'application/did+json',
        retrieved: new Date().toISOString()
      },
      didDocumentMetadata: {
        equivalentId: [didCid],
        canonicalId: didCid
      }
    });

  } catch (error) {
    console.error('Error resolving did:webs:', error);
    res.status(404).json({
      didDocument: null,
      didResolutionMetadata: {
        error: 'notFound',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

export default router;
