
import type { SovereignAgentManifest } from '../types.ts';

/**
 * Conductor / MCP Compatibility Layer
 * Transforms SCOS Manifests into standard OpenAPI/JSON Schemas for execution.
 */

export interface ConductorToolDefinition {
  name: string;
  description: string;
  parameters: any; // OpenAPI JSON Schema
}

export interface ConductorSkillManifest {
  schema_version: string;
  name: string;
  description: string;
  instructions: string;
  tools: ConductorToolDefinition[];
  settings: {
      budget_token_limit: number;
      drift_allowance: number;
  };
}


/**
 * Safely parse JSON while preventing Prototype Pollution.
 */
const secureJSONParse = (jsonStr: string): any => {
  return JSON.parse(jsonStr, (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined;
    }
    return value;
  });
};

/**
 * Parses the stringified JSON schema from the manifest into an object.
 * Returns a default 'any' schema if parsing fails.
 */
export const safeParseSchema = (schemaStr: string): any => {
  try {
    return secureJSONParse(schemaStr);
  } catch (error: unknown) {
    return { type: "object", properties: {}, description: "Schema parsing failed." };
  }
};

/**
 * Validates that a Sovereign Agent Manifest maps correctly to Conductor's tool definitions.
 */
export const validateConductorSchema = (agent: SovereignAgentManifest): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!agent.identity.name) {
    errors.push("Agent name is required.");
  }

  if (!agent.identity.primeDirective) {
    errors.push("Prime directive is required.");
  }

  agent.tools.forEach((tool, index) => {
    if (!tool.name || !tool.name.match(/^[a-zA-Z0-9_-]+$/)) {
      errors.push(`Tool '${tool.name || `at index ${index}`}' has an invalid name. Must be alphanumeric, dashes, or underscores.`);
    }
    try {
      const schema = secureJSONParse(tool.inputSchema);
      if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
         errors.push(`Tool '${tool.name}' inputSchema must be a JSON object.`);
      } else if (schema.type !== "object") {
         errors.push(`Tool '${tool.name}' inputSchema must explicitly be of type "object".`);
      } else if (!schema.properties || typeof schema.properties !== "object" || Array.isArray(schema.properties)) {
         errors.push(`Tool '${tool.name}' inputSchema must define a valid 'properties' object.`);
      }
    } catch (error: unknown) {
      errors.push(`Tool '${tool.name}' has invalid JSON in inputSchema.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Transforms a Sovereign Agent Manifest into a Conductor-ready Skill Manifest.
 */
export const transformToConductor = (agent: SovereignAgentManifest): ConductorSkillManifest => {
  return {
    schema_version: "v1",
    name: agent.identity.name.toLowerCase().replace(/\s+/g, '_'),
    description: agent.identity.designation,
    instructions: `
PRIME DIRECTIVE: ${agent.identity.primeDirective}

PHILOSOPHY:
${agent.identity.corePhilosophy}

CONSTRAINTS:
${agent.constraints.map(c => `- ${c.description} (${c.type})`).join('\n')}
    `.trim(),
    tools: agent.tools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: safeParseSchema(t.inputSchema)
    })),
    settings: {
        budget_token_limit: agent.budget.tokenBudget,
        drift_allowance: agent.budget.driftAllowance
    }
  };
};

/**
 * Generates a Python boilerplate script compatible with the `scos-core` Swarm logic.
 * This script stubs out the tools defined in the manifest using the `scos` decorator pattern.
 */
export const generatePythonStubs = (agent: SovereignAgentManifest): string => {
  const toolsCode = agent.tools.map(tool => {
    return `
@tool(name="${tool.name}", risk="${tool.riskLevel}")
def ${tool.name}(ctx: AgentContext, params: Dict[str, Any]) -> str:
    """
    ${tool.description}
    Input Schema: ${tool.inputSchema.replace(/\n/g, '')}
    """
    # TODO: Implement logic for ${tool.name}
    # Security Check: Ensure params match schema
    raise NotImplementedError(f"Tool ${tool.name} is not yet implemented.")
`;
  }).join('\n');

  return `
# Sovereign Swarm Node: ${agent.identity.name}
# Protocol: ${agent.protocol?.standard || 'DRP-2025'}
# Designation: ${agent.identity.designation}

import json
from typing import Dict, Any
from scos_core.decorators import tool, agent
from scos_core.types import AgentContext

@agent(
    name="${agent.identity.name}",
    role="${agent.protocol?.role || 'SPECIALIST'}",
    budget={
        "tokens": ${agent.budget.tokenBudget},
        "drift": ${agent.budget.driftAllowance}
    }
)
class ${agent.identity.name.replace(/\s+/g, '')}Agent:
    
    def __init__(self):
        self.prime_directive = "${agent.identity.primeDirective}"
        
    def on_wake(self, ctx: AgentContext):
        """Called when the agent is instantiated from the Vault."""
        print(f"[{self.name}] Online. Listening for Intent...")

${toolsCode}

    def internal_diagnostics(self):
        """
        Metacognitive Self-Checks
        """
        ${agent.internalTools.map(t => `# Check: ${t.name} (Trigger: ${t.usageCondition})`).join('\n        ')}
        return True

if __name__ == "__main__":
    from scos_core.runtime import run_node
    run_node(${agent.identity.name.replace(/\s+/g, '')}Agent)
`;
};

/**
 * Generates a README.md for the Conductor Skill Package.
 */
export const generateSkillReadme = (agent: SovereignAgentManifest): string => {
  return `
# Skill: ${agent.identity.name}

> **Designation:** ${agent.identity.designation}
> **Risk Profile:** ${agent.tools.some(t => t.riskLevel === 'CRITICAL') ? 'CRITICAL (Human Oversight Required)' : 'Standard'}

## Overview
${agent.identity.corePhilosophy}

## Tools
${agent.tools.map(t => `- \`${t.name}\`: ${t.description}`).join('\n')}

## Usage
1. Install \`scos-core\`.
2. Load this skill directory into your Conductor config.
3. Ensure valid \`commander_keys\` are present in environment.

*Generated by Sovereign Agent Forge v1.8.0*
`;
};
