import type { Id } from "../../convex/_generated/dataModel";

export type UserId = Id<"users">;

const CURRENT_USER_KEY = "mavr_current_user_id";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getStoredUserId() {
  if (!canUseStorage()) return null;
  const userId = window.localStorage.getItem(CURRENT_USER_KEY);
  return (userId as UserId | null) ?? null;
}

export function setStoredUserId(userId: UserId) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(CURRENT_USER_KEY, userId);
}

export function clearStoredUserId() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(CURRENT_USER_KEY);
}
