import { GoogleGenAI } from "@google/genai"

const AI_TIMEOUT = 180_000

export interface GenerateOptions {
  prompt: string
  temperature?: number
  jsonMode?: boolean
}

export interface AIProvider {
  generate(options: GenerateOptions): Promise<string>
  generateStream(options: GenerateOptions): AsyncGenerator<string>
  readonly model: string
}

export class GoogleAIProvider implements AIProvider {
  private client: GoogleGenAI
  readonly model: string

  constructor(model?: string) {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new Error("GEMINI_API_KEY not set")
    this.client = new GoogleGenAI({ apiKey: key, httpOptions: { timeout: AI_TIMEOUT } })
    this.model = model || process.env.AI_MODEL || "gemma-4-26b-a4b-it"
  }

  async generate(options: GenerateOptions): Promise<string> {
    let text = ""
    for await (const chunk of this.generateStream(options)) {
      text += chunk
    }
    return text
  }

  async *generateStream(options: GenerateOptions): AsyncGenerator<string> {
    const stream = await this.client.models.generateContentStream({
      model: this.model,
      contents: options.prompt,
      config: { temperature: options.temperature ?? 0.7 },
    })
    for await (const chunk of stream) {
      const t = chunk.text
      if (t) yield t
    }
  }
}

let GroqClient: any = null
async function getGroqClient(apiKey: string) {
  if (!GroqClient) {
    const mod = await import("groq-sdk")
    GroqClient = new mod.Groq({ apiKey })
  }
  return GroqClient
}

export class GroqAIProvider implements AIProvider {
  readonly model: string
  private apiKey: string
  private clientPromise: Promise<any> | null = null

  constructor(model?: string) {
    const key = process.env.GROQ_API_KEY
    if (!key) throw new Error("GROQ_API_KEY not set")
    this.apiKey = key
    this.model = model || process.env.AI_MODEL || "llama-3.3-70b-versatile"
  }

  private async client() {
    if (!this.clientPromise) {
      this.clientPromise = getGroqClient(this.apiKey)
    }
    return this.clientPromise
  }

  async generate(options: GenerateOptions): Promise<string> {
    let text = ""
    for await (const chunk of this.generateStream(options)) {
      text += chunk
    }
    return text
  }

  async *generateStream(options: GenerateOptions): AsyncGenerator<string> {
    const client = await this.client()
    const stream = await client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: options.prompt }],
      temperature: options.temperature ?? 0.7,
      stream: true,
      ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
    })
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content
      if (content) yield content
    }
  }
}

export function createProvider(model?: string): AIProvider {
  const providerName = process.env.AI_PROVIDER || "google"
  switch (providerName) {
    case "groq":
      return new GroqAIProvider(model)
    case "google":
      return new GoogleAIProvider(model)
    default:
      throw new Error(`Unknown AI provider: ${providerName}. Use "google" or "groq"`)
  }
}

export function extractJson(text: string): string {
  const lastBrace = text.lastIndexOf("}")
  const lastBracket = text.lastIndexOf("]")
  const end = Math.max(lastBrace, lastBracket)
  if (end === -1) return text

  for (let i = end - 1; i >= 0; i--) {
    if (text[i] === "{" || text[i] === "[") {
      const candidate = text.slice(i, end + 1)
      try {
        JSON.parse(candidate)
        return candidate
      } catch { }
    }
  }
  return text
}
