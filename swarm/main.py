# /// file: swarm/main.py ///
"""
Sovereign Swarm Uplink Core
"""
import os
import json
import base64
import hashlib
import firebase_admin
from firebase_admin import credentials, firestore
import google.generativeai as genai
from ecdsa import VerifyingKey, NIST256p
from ecdsa.util import sigdecode_der

if not firebase_admin._apps:
    try:
        firebase_admin.initialize_app()
    except Exception as e:
        print(f"Failed to initialize Firebase: {e}")

db = firestore.client() if firebase_admin._apps else None

api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("GEMINI_API_KEY missing.")

def verify_manifest(manifest_data: dict, public_key_pem: str) -> bool:
    """
    Cryptographic verification using ECDSA P-256.
    """
    try:
        if 'provenance' not in manifest_data or 'signature' not in manifest_data['provenance']:
            return False

        signature_data = manifest_data['provenance']['signature']
        signature_hex = signature_data.get('signature', '')

        manifest_copy = manifest_data.copy()
        manifest_copy.pop('provenance', None)
        manifest_copy.pop('architecturalNotes', None)

        canonical_json = json.dumps(manifest_copy, separators=(',', ':'), sort_keys=True).encode('utf-8')
        digest = hashlib.sha256(canonical_json).digest()

        vk = VerifyingKey.from_pem(public_key_pem)

        signature_bytes = bytes.fromhex(signature_hex)

        return vk.verify_digest(signature_bytes, digest, sigdecode=sigdecode_der)
    except Exception as e:
        print(f"Verification error: {e}")
        return False

class ManifestLoader:
    def __init__(self, db_client):
        self.db = db_client

    def load_and_verify(self, user_id: str, agent_id: str):
        if not self.db:
            return None

        doc_ref = self.db.collection('users').document(user_id).collection('manifests').document(agent_id)
        doc = doc_ref.get()

        if not doc.exists:
            print(f"Manifest {agent_id} not found.")
            return None

        data = doc.to_dict()

        user_ref = self.db.collection('users').document(user_id)
        user_doc = user_ref.get()
        public_key = user_doc.to_dict().get('sovereignPublicKey') if user_doc.exists else None

        if not public_key:
            print("No public key found for user. Skipping verification (unsafe).")
            return None

        if verify_manifest(data, public_key):
            print(f"Manifest {agent_id} verified successfully.")
            return data
        else:
            print(f"Signature verification failed for {agent_id}.")
            return None

class ToolExecutor:
    def __init__(self, tools_config):
        self.tools_config = tools_config

    def execute(self, tool_name: str, payload: dict) -> str:
        for tool in self.tools_config:
            if tool.get("name") == tool_name:
                return f"Executed {tool_name} with payload: {json.dumps(payload)}"
        return f"Tool {tool_name} not found in manifest."

def execute_swarm_task(db_client, task_id: str, data: dict):
    agent_id = data.get('agentId')
    user_id = data.get('userId', 'anonymous')
    command = data.get('command')
    payload = data.get('payload', {})

    loader = ManifestLoader(db_client)
    manifest = loader.load_and_verify(user_id, agent_id)

    if not manifest:
        return {"status": "FAILED", "error": "Manifest verification failed or agent not found."}

    executor = ToolExecutor(manifest.get("tools", []))

    try:
        model_id = "gemini-2.5-pro"
        model = genai.GenerativeModel(model_id)

        system_instruction = manifest.get("identity", {}).get("primeDirective", "")

        prompt = f"System: {system_instruction}\nCommand: {command}\nPayload: {json.dumps(payload)}"

        response = model.generate_content(prompt)
        ai_response = response.text

        tool_result = executor.execute(command, payload)

        return {
            "status": "COMPLETED",
            "result": f"AI: {ai_response} | Tool Output: {tool_result}"
        }
    except Exception as e:
        return {"status": "FAILED", "error": str(e)}

def listen_to_queue():
    if not db:
        print("No DB connection.")
        return

    print("Starting swarm queue listener...")
    queue_ref = db.collection('swarm_queue')

    query = queue_ref.where('status', '==', 'PENDING')

    def on_snapshot(col_snapshot, changes, read_time):
        for change in changes:
            if change.type.name == 'ADDED':
                doc = change.document
                data = doc.to_dict()
                print(f"New task received: {doc.id} for agent {data.get('agentId')}")

                doc.reference.update({'status': 'THINKING'})

                result = execute_swarm_task(db, doc.id, data)
                doc.reference.update(result)
                print(f"Task {doc.id} finished with status {result['status']}.")

    query.on_snapshot(on_snapshot)

    import time
    while True:
        time.sleep(1)

if __name__ == "__main__":
    try:
        listen_to_queue()
    except KeyboardInterrupt:
        print("Shutting down swarm node.")
