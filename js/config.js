/* =====================================================================
   CONFIG — the one file to edit when the crew server goes live.

   API_BASE = null      → local mode (no backend): profiles and data live
                          on each device, the Chat tab shows setup info.
   API_BASE = 'https://euroride-api.<you>.workers.dev'
                        → remote mode: real sign-in that works across
                          devices, data sync, and the chat assistant.

   Deploying the server takes ~15 minutes and is free:
   see docs/DEPLOY-SERVER.md
   ===================================================================== */

export const API_BASE = null;

export function remoteEnabled() {
  return typeof API_BASE === 'string' && API_BASE.length > 0;
}
