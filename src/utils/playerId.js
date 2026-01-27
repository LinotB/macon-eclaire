// src/utils/playerId.js
function uuid() {
  return crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// ⚠️ sessionStorage = unique par onglet
const KEY = "me_player_id_session_v1";

export function getPlayerId() {
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = uuid();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}
