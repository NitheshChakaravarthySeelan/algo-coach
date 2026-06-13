export const DEV_USER_ID = process.env.LOCAL_USER_ID || "dev-user-id"

export function isLocalDev(): boolean {
  return process.env.LOCAL_DEV === "true"
}
