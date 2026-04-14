Instability: Unimported root throwaway script `setup.sh` cluttering the repository hallway | Fortification: Swept `setup.sh` to enforce strict root hygiene
Instability: Vulnerable vite <=6.4.1 (GHSA-p9ff-h696-f583) allowing arbitrary file read | Fortification: Patched vite constraint in package.json to ~6.4.2 to enforce secure resolution
Instability: Leaky dependency constraint ^ in package.json for vite | Fortification: Hardened package.json to use strict ~ constraints
Instability: Leaky pipes detected in `swarm/requirements.txt` with unpinned dependencies (`firebase-admin`, `google-generativeai`, `pydantic`, `ecdsa`). | Fortification: Pinned dependencies using strict minor/patch (`~=`) constraints.
