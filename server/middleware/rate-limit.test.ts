import { describe, test, expect } from "bun:test"

describe("rateLimit middleware", () => {
  test("allows requests within limit", async () => {
    const { rateLimit } = await import("./rate-limit")
    const middleware = rateLimit(5, 60000)

    let status = 0
    const c = {
      req: { header: () => "127.0.0.1", path: "/test" },
      json: (body: any, s?: number) => { status = s || 200; return body },
    } as any

    for (let i = 0; i < 5; i++) {
      status = 0
      let calledNext = false
      await middleware(c, () => { calledNext = true; return Promise.resolve() })
      expect(calledNext).toBe(true)
      expect(status).not.toBe(429)
    }
  })

  test("blocks requests exceeding limit", async () => {
    // Clear module cache to get fresh rate limit store
    const { rateLimit } = await import("./rate-limit")
    const middleware = rateLimit(3, 60000)

    let status = 0
    let body: any = null
    const c = {
      req: { header: () => "127.0.0.1", path: "/test-block" },
      json: (b: any, s?: number) => { status = s || 200; body = b; return body },
    } as any

    for (let i = 0; i < 3; i++) {
      status = 0
      await middleware(c, () => Promise.resolve())
    }
    expect(status).not.toBe(429)

    // 4th request should be blocked
    status = 0
    await middleware(c, () => Promise.resolve())
    expect(status).toBe(429)
    expect(body.error).toContain("Too many requests")
  })

  test("resets window after expiry", async () => {
    const { rateLimit } = await import("./rate-limit")
    const middleware = rateLimit(2, 50) // 50ms window

    let status = 0
    const c = {
      req: { header: () => "127.0.0.2", path: "/test-reset" },
      json: (b: any, s?: number) => { status = s || 200; return b },
    } as any

    // Use up the limit
    await middleware(c, () => Promise.resolve())
    await middleware(c, () => Promise.resolve())

    // 3rd should block
    status = 0
    await middleware(c, () => Promise.resolve())
    expect(status).toBe(429)

    // Wait for window to expire
    await new Promise(r => setTimeout(r, 60))

    // Should be allowed again
    status = 0
    let calledNext = false
    await middleware(c, () => { calledNext = true; return Promise.resolve() })
    expect(calledNext).toBe(true)
    expect(status).not.toBe(429)
  })
})
