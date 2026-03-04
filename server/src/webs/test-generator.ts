#!/usr/bin/env npx ts-node
/**
 * Test script for did:webs generator
 * Run with: npx ts-node test-generator.ts
 */

import { generateWebsFiles, extractAid, constructWebsDid } from './generator.js';

async function main() {
  const testDids = [
    'did:cid:bagaaiera7vsjlu6oiluzd4enop5j7sfzjbwp2ujudt6uunkz6hhd4lgfe4sa', // flaxscrip
    'did:cid:bagaaieraxdxq4fm2kjh6yqjxjor3t2idczkmxd4v7in4u353fa6m6sms2pnq', // genitrix
  ];

  for (const didCid of testDids) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Testing: ${didCid}`);
    console.log('='.repeat(80));

    try {
      const files = await generateWebsFiles(didCid, 'archon.social', null, {
        witnesses: ['https://archon.technology', 'https://archon.social']
      });

      console.log(`\ndid:webs: ${files.did}`);
      console.log('\n--- did.json ---');
      console.log(JSON.stringify(files.didJson, null, 2));
      console.log('\n--- archon.cesr (first 2000 chars) ---');
      console.log(files.archonCesr.slice(0, 2000));

    } catch (error) {
      console.error('Error:', error);
    }
  }
}

main();
