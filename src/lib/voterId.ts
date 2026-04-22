const KEY = "pulse:voterId";

export function getVoterId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id =
      (crypto.randomUUID && crypto.randomUUID()) ||
      Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(KEY, id);
  }
  return id;
}

const VOTED_KEY = "pulse:votedFor";

export function getLocalVote(): string | null {
  return localStorage.getItem(VOTED_KEY);
}

export function setLocalVote(optionId: string | null) {
  if (optionId) localStorage.setItem(VOTED_KEY, optionId);
  else localStorage.removeItem(VOTED_KEY);
}
