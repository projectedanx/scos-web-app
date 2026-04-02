
import { test } from 'node:test';
import assert from 'node:assert';
import { validateConductorSchema, safeParseSchema, transformToConductor, generatePythonStubs, generateSkillReadme } from '../conductorService.ts';
import type { SovereignAgentManifest } from '../types.ts';

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

// THE BOUNDARY INTERROGATION: transformToConductor
test('transformToConductor - accurately maps standard manifest structural fields', () => {
  const manifest = {
    identity: {
      name: "Super Agent",
      designation: "Chief Strategist",
      primeDirective: "Do no harm.",
      corePhilosophy: "Always check types."
    },
    tools: [
      {
        name: "test_tool",
        description: "A cool tool",
        inputSchema: '{"type": "object"}'
      }
    ],
    constraints: [
      { type: "HARD", description: "Must use JSON" }
    ],
    budget: {
      tokenBudget: 5000,
      driftAllowance: 0.05
    }
  };

  const conductorManifest = transformToConductor(manifest as any);

  assert.strictEqual(conductorManifest.schema_version, "v1");
  assert.strictEqual(conductorManifest.name, "super_agent");
  assert.strictEqual(conductorManifest.description, "Chief Strategist");
  assert.strictEqual(conductorManifest.settings.budget_token_limit, 5000);
  assert.strictEqual(conductorManifest.settings.drift_allowance, 0.05);

  // Assert instructions formatted correctly
  assert.ok(conductorManifest.instructions.includes("PRIME DIRECTIVE: Do no harm."));
  assert.ok(conductorManifest.instructions.includes("PHILOSOPHY:\nAlways check types."));
  assert.ok(conductorManifest.instructions.includes("CONSTRAINTS:\n- Must use JSON (HARD)"));

  // Assert tools formatted correctly
  assert.strictEqual(conductorManifest.tools.length, 1);
  assert.strictEqual(conductorManifest.tools[0].name, "test_tool");
  assert.deepStrictEqual(conductorManifest.tools[0].parameters, { type: "object" });
});

test('transformToConductor - safely maps tools with invalid json schemas to fallbacks', () => {
  const manifest = {
    identity: { name: "Agent", designation: "Desig", primeDirective: "PD", corePhilosophy: "CP" },
    tools: [
      { name: "bad_schema_tool", description: "Fail tool", inputSchema: "INVALID" }
    ],
    constraints: [],
    budget: { tokenBudget: 100, driftAllowance: 0.1 }
  };

  const conductorManifest = transformToConductor(manifest as any);
  assert.strictEqual(conductorManifest.tools.length, 1);
  assert.deepStrictEqual(conductorManifest.tools[0].parameters, { type: "object", properties: {}, description: "Schema parsing failed." });
});

test('transformToConductor - handles empty arrays', () => {
  const manifest = {
    identity: { name: "Agent", designation: "Desig", primeDirective: "PD", corePhilosophy: "CP" },
    tools: [],
    constraints: [],
    budget: { tokenBudget: 100, driftAllowance: 0.1 }
  };

  const conductorManifest = transformToConductor(manifest as any);
  assert.strictEqual(conductorManifest.tools.length, 0);
  assert.ok(conductorManifest.instructions.includes("CONSTRAINTS:"));
});

// THE BOUNDARY INTERROGATION: generatePythonStubs
test('generatePythonStubs - generates functional scos-core boilerplate with mapped tools', () => {
  const manifest = {
    identity: {
      name: "Python Agent",
      designation: "Scos Worker",
      primeDirective: "Print Hello"
    },
    protocol: { standard: "DRP-2025", role: "CODER" },
    tools: [
      { name: "read_file", description: "Reads a file", inputSchema: '{"type":"object"}', riskLevel: "MEDIUM" }
    ],
    internalTools: [
      { name: "check_disk", usageCondition: "Before writing" }
    ],
    budget: { tokenBudget: 1024, driftAllowance: 0.02 }
  };

  const pythonScript = generatePythonStubs(manifest as any);

  // Verify structural decorators and class definition
  assert.ok(pythonScript.includes('@agent('));
  assert.ok(pythonScript.includes('name="Python Agent"'));
  assert.ok(pythonScript.includes('role="CODER"'));
  assert.ok(pythonScript.includes('class PythonAgentAgent:'));

  // Verify tool generation
  assert.ok(pythonScript.includes('@tool(name="read_file", risk="MEDIUM")'));
  assert.ok(pythonScript.includes('def read_file(ctx: AgentContext, params: Dict[str, Any]) -> str:'));
  assert.ok(pythonScript.includes('raise NotImplementedError(f"Tool read_file is not yet implemented.")'));

  // Verify internal diagnostic mappings
  assert.ok(pythonScript.includes('# Check: check_disk (Trigger: Before writing)'));
});

test('generatePythonStubs - robust fallback when protocol fields are missing', () => {
  const manifest = {
    identity: { name: "Fallback Agent", designation: "Desig", primeDirective: "PD" },
    tools: [],
    internalTools: [],
    budget: { tokenBudget: 100, driftAllowance: 0.1 }
  };

  const pythonScript = generatePythonStubs(manifest as any);
  assert.ok(pythonScript.includes('Protocol: DRP-2025')); // default fallback
  assert.ok(pythonScript.includes('role="SPECIALIST"')); // default fallback
});

// THE BOUNDARY INTERROGATION: generateSkillReadme
test('generateSkillReadme - accurately creates markdown documentation', () => {
  const manifest = {
    identity: { name: "Docs Agent", designation: "Writer", corePhilosophy: "Read the manual" },
    tools: [
      { name: "tool1", description: "Does something", riskLevel: "LOW" },
      { name: "tool2", description: "Danger tool", riskLevel: "CRITICAL" }
    ]
  };

  const readme = generateSkillReadme(manifest as any);
  assert.ok(readme.includes('# Skill: Docs Agent'));
  assert.ok(readme.includes('> **Designation:** Writer'));
  assert.ok(readme.includes('> **Risk Profile:** CRITICAL (Human Oversight Required)'));
  assert.ok(readme.includes('## Overview\nRead the manual'));
  assert.ok(readme.includes('- `tool1`: Does something'));
  assert.ok(readme.includes('- `tool2`: Danger tool'));
});

test('generateSkillReadme - outputs standard risk profile when no critical tools exist', () => {
  const manifest = {
    identity: { name: "Docs Agent", designation: "Writer", corePhilosophy: "CP" },
    tools: [
      { name: "tool1", description: "Does something", riskLevel: "LOW" }
    ]
  };

  const readme = generateSkillReadme(manifest as any);
  assert.ok(readme.includes('> **Risk Profile:** Standard'));
});
