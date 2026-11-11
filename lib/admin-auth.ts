import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "tib_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function credentials() {
  return {
    username: process.env.ADMIN_USERNAME ?? "",
    password: process.env.ADMIN_PASSWORD ?? "",
  };
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function adminAuthIsConfigured() {
  const { username, password } = credentials();
  return Boolean(username && password);
}

export function adminCredentialsAreValid(username: string, password: string) {
  const expected = credentials();
  if (!expected.username || !expected.password) return false;
  return safeEqual(username, expected.username) && safeEqual(password, expected.password);
}

export function createAdminSessionToken() {
  const { username, password } = credentials();
  if (!username || !password) return "";
  return createHmac("sha256", password).update(`the-item-box:${username}`).digest("hex");
}

export async function isAdminAuthenticated() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value ?? "";
  const expected = createAdminSessionToken();
  return Boolean(token && expected && safeEqual(token, expected));
}
