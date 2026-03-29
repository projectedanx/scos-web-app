
import { test } from 'node:test';
import assert from 'node:assert';
import { validateConductorSchema, safeParseSchema } from '../conductorService.ts';

const validManifest: any = {
  identity: {
    name: "TestAgent",
    primeDirective: "Do no harm.",
    designation: "Testing Specialist",
    corePhilosophy: "Be thorough."
  },
  tools: [
    {
      name: "valid_tool",
      description: "A valid tool",
      inputSchema: JSON.stringify({
        type: "object",
        properties: {
          param1: { type: "string" }
        }
      }),
      riskLevel: "LOW"
    }
  ],
  constraints: [],
  budget: {
    tokenBudget: 1000,
    driftAllowance: 0.1
  }
};

test('validateConductorSchema - valid manifest', () => {
  const result = validateConductorSchema(validManifest);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.errors.length, 0);
});

test('validateConductorSchema - missing agent name', () => {
  const manifest = { ...validManifest, identity: { ...validManifest.identity, name: "" } };
  const result = validateConductorSchema(manifest as any);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.includes("Agent name is required."));
});

test('validateConductorSchema - missing prime directive', () => {
  const manifest = { ...validManifest, identity: { ...validManifest.identity, primeDirective: "" } };
  const result = validateConductorSchema(manifest as any);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.includes("Prime directive is required."));
});

test('validateConductorSchema - invalid tool name', () => {
  const manifest = {
    ...validManifest,
    tools: [{ ...validManifest.tools[0], name: "invalid tool name!" }]
  };
  const result = validateConductorSchema(manifest as any);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("has an invalid name")));
});

test('validateConductorSchema - tool name with special chars', () => {
  const manifest = {
    ...validManifest,
    tools: [{ ...validManifest.tools[0], name: "tool-1_abc" }]
  };
  const result = validateConductorSchema(manifest as any);
  assert.strictEqual(result.valid, true);
});

test('validateConductorSchema - tool schema invalid JSON', () => {
  const manifest = {
    ...validManifest,
    tools: [{ ...validManifest.tools[0], name: "tool1", inputSchema: "{ invalid json" }]
  };
  const result = validateConductorSchema(manifest as any);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.includes("Tool 'tool1' has invalid JSON in inputSchema."));
});

test('validateConductorSchema - tool schema not an object', () => {
  const manifest = {
    ...validManifest,
    tools: [{ ...validManifest.tools[0], name: "tool1", inputSchema: "123" }]
  };
  const result = validateConductorSchema(manifest as any);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.includes("Tool 'tool1' inputSchema must be a JSON object."));
});

test('validateConductorSchema - tool schema is an array', () => {
    const manifest = {
      ...validManifest,
      tools: [{ ...validManifest.tools[0], name: "tool1", inputSchema: "[]" }]
    };
    const result = validateConductorSchema(manifest as any);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.includes("Tool 'tool1' inputSchema must be a JSON object."));
  });

test('validateConductorSchema - tool schema missing type: object', () => {
  const manifest = {
    ...validManifest,
    tools: [{ ...validManifest.tools[0], name: "tool1", inputSchema: JSON.stringify({ properties: {} }) }]
  };
  const result = validateConductorSchema(manifest as any);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.includes("Tool 'tool1' inputSchema must explicitly be of type \"object\"."));
});

test('validateConductorSchema - tool schema missing properties', () => {
  const manifest = {
    ...validManifest,
    tools: [{ ...validManifest.tools[0], name: "tool1", inputSchema: JSON.stringify({ type: "object" }) }]
  };
  const result = validateConductorSchema(manifest as any);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.includes("Tool 'tool1' inputSchema must define a valid 'properties' object."));
});

test('validateConductorSchema - tool schema properties not an object', () => {
    const manifest = {
      ...validManifest,
      tools: [{ ...validManifest.tools[0], name: "tool1", inputSchema: JSON.stringify({ type: "object", properties: "invalid" }) }]
    };
    const result = validateConductorSchema(manifest as any);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.includes("Tool 'tool1' inputSchema must define a valid 'properties' object."));
  });

test('safeParseSchema - valid json', () => {
  const result = safeParseSchema('{"type": "string"}');
  assert.deepStrictEqual(result, { type: "string" });
});

test('safeParseSchema - invalid json returns fallback schema', () => {
  const result = safeParseSchema('{"invalid": json');
  assert.deepStrictEqual(result, { type: "object", properties: {}, description: "Schema parsing failed." });
});

test('safeParseSchema - empty string returns fallback schema', () => {
  const result = safeParseSchema('');
  assert.deepStrictEqual(result, { type: "object", properties: {}, description: "Schema parsing failed." });
});
