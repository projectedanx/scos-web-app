import { test } from 'node:test';
import assert from 'node:assert';
import { compileCapsuleHtml } from './capsuleCompiler.ts';
import type { ContextCapsule, CapsuleMeta } from '../types.ts';

test('capsuleCompiler', async (t) => {

  await t.test('compileCapsuleHtml - empty state fallback', () => {
    // Should safely fallback if provided missing sections/meta
    const html = compileCapsuleHtml({} as ContextCapsule);
    assert.ok(html.includes('<title>Capsule</title>'), 'Falls back to default title');
    assert.ok(!html.includes('id="overview"'), 'Does not render overview container if empty');
  });

  await t.test('compileCapsuleHtml - XSS payload in meta and sections', () => {
    const maliciousCapsule: ContextCapsule = {
      meta: {
        id: '1',
        title: '<script>alert("xss title")</script>',
        primary_pill: '"><img src=x onerror=alert(1)>',
        short_tagline: 'foo',
        tags: ['<style>body {display:none}</style>'],
        worldview_ref: 'test',
        source_papers: [],
        status: 'draft',
        hero_cta_label: 'test',
        hero_cta_target: 'javascript:alert(1)' // NOTE: we might not escape attributes perfectly but let's test tag escaping
      } as CapsuleMeta,
      sections: {
        overview: {
          id: '1',
          title: 'overview',
          intro: '<b>bold</b>',
          hero_pills: ['<img src="1">'],
          summary_card: {
            label: 'test',
            title: 'test',
            body: 'test',
            tags: []
          }
        }
      }
    };

    const html = compileCapsuleHtml(maliciousCapsule);
    assert.ok(!html.includes('<script>alert("xss title")</script>'), 'Title script is escaped');
    assert.ok(html.includes('&lt;script&gt;alert(&quot;xss title&quot;)&lt;/script&gt;'), 'Title script is correctly encoded');

    assert.ok(!html.includes('"><img src=x onerror=alert(1)>'), 'Primary pill injection escaped');
    assert.ok(html.includes('&quot;&gt;&lt;img src=x onerror=alert(1)&gt;'), 'Primary pill is correctly encoded');

    assert.ok(!html.includes('<style>'), 'Tags injection escaped');
    assert.ok(html.includes('&lt;style&gt;'), 'Tags are correctly encoded');

    assert.ok(!html.includes('<b>bold</b>'), 'Intro HTML escaped');
    assert.ok(html.includes('&lt;b&gt;bold&lt;/b&gt;'), 'Intro HTML correctly encoded');
  });

  await t.test('compileCapsuleHtml - semantic tables rendering', () => {
    const tableCapsule: ContextCapsule = {
      meta: {} as CapsuleMeta,
      sections: {
        structure: {
          id: '1',
          title: 'Struct',
          variant: 'a',
          intro: 'b',
          table: {
            columns: ['Col1', '<script>'],
            rows: [
              { cells: ['Data1', 'Data2'] }
            ]
          }
        }
      }
    };

    const html = compileCapsuleHtml(tableCapsule);
    assert.ok(html.includes('<th scope="col"'), 'Table header rendered');
    assert.ok(html.includes('Col1'), 'Column 1 rendered');
    // In tableHtml, <script> is correctly escaped to &lt;script&gt; in the columns loop.
    assert.ok(!html.includes('<th><script></th>'), 'Column script escaped');
    assert.ok(html.includes('&lt;script&gt;'), 'Column script encoded');
    assert.ok(html.includes('Data1'), 'Row cell rendered');
  });

  await t.test('compileCapsuleHtml - sections conditional rendering', () => {
    const html = compileCapsuleHtml({
      meta: {
        research_date: '2025-01-01'
      } as CapsuleMeta,
      sections: {
        workflow: {
          id: '1',
          title: 'WFlow',
          intro: 'Int',
          steps: [
            { id: '1', label: 'Step 1', summary: 'Sum', bullets: ['A', 'B'] }
          ]
        },
        resilience: {
          id: '1',
          title: 'Res',
          intro: 'Int',
          failure_modes: [
             { name: 'Fail', description: 'Desc', mitigations: ['Mit'] }
          ]
        },
        metrics: {
          id: '1',
          title: 'Met',
          intro: 'Int',
          items: [
            { name: 'Met1', description: 'Desc', signals: ['Sig'] }
          ]
        },
        checklist: {
          id: '1',
          title: 'Check',
          intro: 'Int',
          items: [
             { label: 'Check1', bullets: ['CheckA'] }
          ]
        }
      }
    });

    assert.ok(html.includes('TEMPORAL LOCK: 2025-01-01'), 'Research date conditional rendered');
    assert.ok(html.includes('Step 1'), 'Workflow rendered');
    assert.ok(html.includes('Mit'), 'Resilience mitigations rendered');
    assert.ok(html.includes('Met1'), 'Metrics rendered');
    assert.ok(html.includes('CheckA'), 'Checklist rendered');
  });

});
