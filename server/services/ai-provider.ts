import { GoogleGenerativeAI } from "@google/generative-ai"

export interface GenerateOptions {
  prompt: string
  temperature?: number
  jsonMode?: boolean
}

export interface AIProvider {
  generate(options: GenerateOptions): Promise<string>
  readonly model: string
}

export class GoogleAIProvider implements AIProvider {
  private client: GoogleGenerativeAI
  readonly model: string

  constructor(model?: string) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("GEMINI_API_KEY not set")
    this.client = new GoogleGenerativeAI(apiKey)
    this.model = model || process.env.AI_MODEL || "gemma-4-31b-it"
  }

  async generate(options: GenerateOptions): Promise<string> {
    const genModel = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        ...(options.jsonMode ? { responseMimeType: "application/json" } : {}),
      },
    })
    const result = await genModel.generateContent(options.prompt)
    return result.response.text()
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
    this.model = model || process.env.AI_MODEL || "gemma2-9b-it"
  }

  private async client() {
    if (!this.clientPromise) {
      this.clientPromise = getGroqClient(this.apiKey)
    }
    return this.clientPromise
  }

  async generate(options: GenerateOptions): Promise<string> {
    const client = await this.client()
    const completion = await client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: options.prompt }],
      temperature: options.temperature ?? 0.7,
      ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
    })
    return completion.choices[0]?.message?.content || ""
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
  const firstBrace = text.indexOf("{")
  const firstBracket = text.indexOf("[")
  const start = firstBrace === -1 ? firstBracket : firstBracket === -1 ? firstBrace : Math.min(firstBrace, firstBracket)
  if (start === -1) return text
  const trimmed = text.slice(start).trim()
  const lastBrace = trimmed.lastIndexOf("}")
  const lastBracket = trimmed.lastIndexOf("]")
  const end = lastBrace === -1 ? lastBracket : lastBracket === -1 ? lastBrace : Math.max(lastBrace, lastBracket)
  return end === -1 ? trimmed : trimmed.slice(0, end + 1)
}
