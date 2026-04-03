import test from 'node:test';
import assert from 'node:assert';
import { compileCapsuleHtml } from '../capsuleCompiler.ts';
import type { ContextCapsule } from '../../types.ts';

test('compileCapsuleHtml - The Boundary Interrogation', async (t) => {
  await t.test('handles completely empty payload securely', () => {
    // Asserting the fallback boundary when the payload is entirely null/empty.
    const result = compileCapsuleHtml({} as ContextCapsule);
    assert.ok(result.includes('<!DOCTYPE html>'));
    assert.ok(result.includes('<title>Capsule</title>'));
  });

  await t.test('fails securely when bombarded with XSS payloads', () => {
    // Intentionally inject malicious XSS vectors into text fields
    const maliciousPayload = {
      meta: {
        id: '<script>alert("xss")</script>',
        title: 'Safe & Sound',
        short_tagline: '" onmouseover="alert(1)',
        research_date: '2025-01-01',
      },
      sections: {
        overview: {
          title: 'Dangerous <img src=x onerror=alert(1)> Title',
          intro: '<iframe src="javascript:alert(1)"></iframe>',
          hero_pills: ['<svg/onload=alert()>', 'Benign']
        }
      }
    } as unknown as ContextCapsule;

    const result = compileCapsuleHtml(maliciousPayload);

    // Verify raw malicious tags are neutralized
    assert.ok(!result.includes('<script>alert("xss")</script>'), 'Failed to neutralize script tag');
    assert.ok(result.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'), 'Failed to escape script body');

    assert.ok(!result.includes('<iframe src="javascript:alert(1)"></iframe>'), 'Failed to neutralize iframe tag');
    assert.ok(result.includes('&lt;iframe src=&quot;javascript:alert(1)&quot;&gt;&lt;/iframe&gt;'), 'Failed to escape iframe');

    assert.ok(result.includes('&quot; onmouseover=&quot;alert(1)'), 'Failed to escape quotes in tagline');

    assert.ok(result.includes('Safe &amp; Sound'), 'Failed to escape ampersand');

    assert.ok(result.includes('&lt;svg/onload=alert()&gt;'), 'Failed to escape pill tags');
  });

  await t.test('gracefully processes deep missing nested arrays', () => {
    const payload = {
      sections: {
        structure: { title: 'Test', table: {} }, // missing rows and cols
        workflow: { steps: [{}] }, // step missing label/bullets
        resilience: { failure_modes: [{}] } // missing mitigations
      }
    } as unknown as ContextCapsule;

    const result = compileCapsuleHtml(payload);
    assert.ok(result.includes('<!DOCTYPE html>'));
    // Should not crash due to optional chaining and empty array fallbacks
  });

  await t.test('compiles full standard payload accurately', () => {
    const validPayload: ContextCapsule = {
      meta: {
        id: '123',
        title: 'Full Test',
        short_tagline: 'A comprehensive standard test',
        tags: ['A', 'B'],
        hero_cta_label: 'Go',
        hero_cta_target: '#go'
      },
      sections: {
        overview: { title: 'Overview', intro: 'Hello World', hero_pills: ['A'] },
        key_concepts: { cards: [{ title: 'C1', body: 'B1' }] },
        structure: { table: { columns: ['A'], rows: [{ cells: ['1'] }] } },
        personas: { table: { columns: ['P'], rows: [{ cells: ['2'] }] } },
        workflow: { steps: [{ label: 'S1', summary: 'S1', bullets: ['B1'] }] },
        resilience: { failure_modes: [{ name: 'F1', description: 'D1', mitigations: ['M1'] }] },
        metrics: { items: [{ name: 'M1', description: 'MD', signals: ['S'] }] },
        checklist: { items: [{ label: 'C1', bullets: ['B'] }] }
      }
    };

    const result = compileCapsuleHtml(validPayload);
    assert.ok(result.includes('Full Test'));
    assert.ok(result.includes('Hello World'));
    assert.ok(result.includes('C1'));
    assert.ok(result.includes('M1'));
  });
});
