Learning: The mermaid diagrams in ARCHITECTURE.md currently contain syntax errors such as 'User[Architect (User)]' (parentheses are not valid inside [] without quotes like ["Architect (User)"]). Needs fixing to pass mmdc. Also the repository has a BACKEND.md file containing more diagrams that might need checks.
Action: Fix the Mermaid syntax in ARCHITECTURE.md and BACKEND.md.
Learning: Discovered the Semantic Word Mapper Flow acts as a primary external trust boundary, brokering parallel requests to Datamuse and ConceptNet before synthesizing with Gemini API, requiring strict schema validation.
Action: Append sequenceDiagram to ARCHITECTURE.md detailing the triangulateConcepts workflow to visualize this critical API integration layer.
