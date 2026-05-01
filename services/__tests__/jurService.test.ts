import test from 'node:test';
import assert from 'node:assert';
import { generateJur } from '../jurService.js';
import { SovereignVault } from '../../types.js';

test('jurService', async (t) => {
  await t.test('generateJur handles empty vault safely', async () => {
    const emptyVault: SovereignVault = {
      metadata: { commanderName: 'Test', designation: 'Test', lastSync: 0, version: '1.0' },
      agents: [],
      capsules: [],
      contracts: [],
      provenanceIndex: []
    };

    const jur = await generateJur(emptyVault);
    assert.ok(jur, 'JUR should be generated even for empty vault');
    assert.match(jur, /\[OMISSION:/, 'Empty vault should trigger an omission marker');
  });

  await t.test('generateJur synthesizes opposing capsules into Golden Scar [Φ]', async () => {
    const conflictedVault = {
      metadata: { commanderName: 'Test', designation: 'Test', lastSync: 0, version: '1.0' },
      agents: [],
      capsules: [
        { meta: { id: '1', title: 'Absolute Determinism', tags: ['determinism'], short_tagline: 'Code must be rigid.', primary_pill: '', worldview_ref: null, source_papers: [], status: 'published', hero_cta_label: '', hero_cta_target: '' }, sections: {} },
        { meta: { id: '2', title: 'Stochastic Freedom', tags: ['stochastic'], short_tagline: 'Code must be fluid.', primary_pill: '', worldview_ref: null, source_papers: [], status: 'published', hero_cta_label: '', hero_cta_target: '' }, sections: {} }
      ],
      contracts: [],
      provenanceIndex: []
    } as any;

    const jur = await generateJur(conflictedVault);
    assert.ok(jur);
    assert.match(jur, /\[Φ\]/, 'Opposing capsules should trigger a Golden Scar [Φ] marker');
  });
});
