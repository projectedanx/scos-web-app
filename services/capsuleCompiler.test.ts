import { describe, it, expect } from 'vitest';
import { compileCapsuleHtml } from './capsuleCompiler.ts';
import type { ContextCapsule } from '../types.ts';

describe('compileCapsuleHtml', () => {
  it('handles empty capsule without throwing', () => {
    const emptyCapsule = {} as ContextCapsule;
    const result = compileCapsuleHtml(emptyCapsule);
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<title>Capsule</title>');
  });

  it('renders capsule with meta fields correctly', () => {
    const capsule = {
      meta: {
        id: 'capsule-1',
        title: 'My Custom Capsule',
        primary_pill: 'PILL',
        short_tagline: 'A tagline for testing',
        tags: ['tag1', 'tag2'],
        worldview_ref: 'TEST-WORLDVIEW',
        source_papers: [],
        status: 'draft',
        hero_cta_label: 'Custom CTA',
        hero_cta_target: '#custom'
      },
      sections: {}
    } as ContextCapsule;
    const result = compileCapsuleHtml(capsule);

    // Check title tag and header
    expect(result).toContain('<title>My Custom Capsule</title>');
    expect(result).toContain('<meta name="description" content="A tagline for testing" />');
    expect(result).toContain('>My Custom Capsule</h1>');

    // Check primary pill
    expect(result).toContain('>PILL</span>');

    // Check CTA
    expect(result).toContain('href="#custom"');
    expect(result).toContain('Custom CTA');

    // Check worldview footer
    expect(result).toContain('Worldview: TEST-WORLDVIEW');

    // Check tags
    expect(result).toContain('tag1');
    expect(result).toContain('tag2');
  });

  it('renders overview section correctly', () => {
    const capsule = {
      meta: { id: 'capsule-overview', title: 'Capsule Overview' } as any,
      sections: {
        overview: {
          title: 'Section Title',
          intro: 'This is the intro text.',
          hero_pills: ['pillA'],
          summary_card: {
            label: 'SummaryLabel',
            title: 'Card Title',
            body: 'Card body here.',
            tags: ['cardTag']
          }
        }
      }
    } as ContextCapsule;
    const result = compileCapsuleHtml(capsule);

    // Check header link
    expect(result).toContain('href="#overview"');
    expect(result).toContain('>Overview</a>');

    // Check section content
    expect(result).toContain('id="overview"');
    expect(result).toContain('Capsule Overview');
    expect(result).toContain('This is the intro text.');
    expect(result).toContain('>pillA</li>');

    // Check summary card
    expect(result).toContain('SummaryLabel');
    expect(result).toContain('>Card Title</h3>');
    expect(result).toContain('Card body here.');
    expect(result).toContain('cardTag');
  });

  it('renders key_concepts section correctly', () => {
    const capsule = {
      meta: { id: 'test' } as any,
      sections: {
        key_concepts: {
          title: 'Key Concepts Test Title',
          intro: 'Concepts intro text.',
          cards: [
            { title: 'Concept 1', body: 'Body 1' },
            { title: 'Concept 2', body: 'Body 2' }
          ]
        }
      }
    } as ContextCapsule;
    const result = compileCapsuleHtml(capsule);

    // Check header link
    expect(result).toContain('href="#key-concepts"');

    // Check section content
    expect(result).toContain('id="key-concepts"');
    expect(result).toContain('Key Concepts Test Title');
    expect(result).toContain('Concepts intro text.');
    expect(result).toContain('>Concept 1</h3>');
    expect(result).toContain('Body 1');
    expect(result).toContain('>Concept 2</h3>');
    expect(result).toContain('Body 2');
  });

  it('renders structure section correctly', () => {
    const capsule = {
      meta: { id: 'test' } as any,
      sections: {
        structure: {
          title: 'Structure Title',
          intro: 'Structure intro',
          table: {
            columns: ['Col 1', 'Col 2'],
            rows: [
              { cells: ['Val 1', 'Val 2'] }
            ]
          }
        }
      }
    } as ContextCapsule;
    const result = compileCapsuleHtml(capsule);

    // Check header link
    expect(result).toContain('href="#structure"');

    // Check section content
    expect(result).toContain('id="structure"');
    expect(result).toContain('Structure Title');
    expect(result).toContain('Structure intro');
    expect(result).toContain('>Col 1</th>');
    expect(result).toContain('>Col 2</th>');
    expect(result).toContain('Val 1');
    expect(result).toContain('Val 2');
  });

  it('renders personas section correctly', () => {
    const capsule = {
      meta: { id: 'test' } as any,
      sections: {
        personas: {
          title: 'Personas Title',
          intro: 'Personas intro',
          table: {
            columns: ['Name', 'Role'],
            rows: [
              { cells: ['Alice', 'Admin'] }
            ]
          }
        }
      }
    } as ContextCapsule;
    const result = compileCapsuleHtml(capsule);

    // Check header link
    expect(result).toContain('href="#personas"');

    // Check section content
    expect(result).toContain('id="personas"');
    expect(result).toContain('Personas Title');
    expect(result).toContain('Personas intro');
    expect(result).toContain('Alice');
    expect(result).toContain('Admin');
  });

  it('renders workflow section correctly', () => {
    const capsule = {
      meta: { id: 'test' } as any,
      sections: {
        workflow: {
          title: 'Workflow Title',
          intro: 'Workflow intro',
          steps: [
            { id: 'step-1', label: 'Step 1 Label', summary: 'Step 1 summary', bullets: ['Bullet A'] }
          ]
        }
      }
    } as ContextCapsule;
    const result = compileCapsuleHtml(capsule);

    // Check header link
    expect(result).toContain('href="#workflow"');

    // Check section content
    expect(result).toContain('id="workflow"');
    expect(result).toContain('Workflow Title');
    expect(result).toContain('Workflow intro');
    expect(result).toContain('Step 1 Label');
    expect(result).toContain('Step 1 summary');
    expect(result).toContain('Bullet A');
  });

  it('renders resilience section correctly', () => {
    const capsule = {
      meta: { id: 'test' } as any,
      sections: {
        resilience: {
          title: 'Resilience Title',
          intro: 'Resilience intro',
          failure_modes: [
            { name: 'Failure 1', description: 'Desc 1', mitigations: ['Mitigation A'] }
          ]
        }
      }
    } as ContextCapsule;
    const result = compileCapsuleHtml(capsule);

    // Check header link
    expect(result).toContain('href="#resilience"');

    // Check section content
    expect(result).toContain('id="resilience"');
    expect(result).toContain('Resilience Title');
    expect(result).toContain('Resilience intro');
    expect(result).toContain('Failure 1');
    expect(result).toContain('Desc 1');
    expect(result).toContain('Mitigation A');
  });

  it('renders metrics section correctly', () => {
    const capsule = {
      meta: { id: 'test' } as any,
      sections: {
        metrics: {
          title: 'Metrics Title',
          intro: 'Metrics intro',
          items: [
            { name: 'Metric 1', description: 'Desc 1', signals: ['Signal A'] }
          ]
        }
      }
    } as ContextCapsule;
    const result = compileCapsuleHtml(capsule);

    // Check header link
    expect(result).toContain('href="#metrics"');

    // Check section content
    expect(result).toContain('id="metrics"');
    expect(result).toContain('Metrics Title');
    expect(result).toContain('Metrics intro');
    expect(result).toContain('Metric 1');
    expect(result).toContain('Desc 1');
    expect(result).toContain('Signal A');
  });

  it('renders checklist section correctly', () => {
    const capsule = {
      meta: { id: 'test' } as any,
      sections: {
        checklist: {
          title: 'Checklist Title',
          intro: 'Checklist intro',
          items: [
            { label: 'Checklist Group 1', bullets: ['Check 1', 'Check 2'] }
          ]
        }
      }
    } as ContextCapsule;
    const result = compileCapsuleHtml(capsule);

    // Check header link
    expect(result).toContain('href="#checklist"');

    // Check section content
    expect(result).toContain('id="checklist"');
    expect(result).toContain('Checklist Title');
    expect(result).toContain('Checklist intro');
    expect(result).toContain('Checklist Group 1');
    expect(result).toContain('Check 1');
    expect(result).toContain('Check 2');
  });
});
