const SYSTEM_PROMPT = `You are a meeting summary assistant. Transform raw, unstructured meeting notes into a clean structured summary. Output a JSON object followed by a TAGS line. Use this exact format with no extra text:
{"context":"Brief description of meeting purpose and background","mainIdeas":["idea 1","idea 2","idea 3"],"actionPoints":["action 1","action 2","action 3"]}
TAGS: #tag1 #tag2 #tag3
Choose 2-3 tags from exactly this list: #decision #action-needed #design #engineering #planning #review #sync #blocked #follow-up #hiring
Be concise and professional. Extract only what matters.`

export async function generateSummary(rawNotes) {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here are my raw meeting notes: ${rawNotes}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API error: ${response.status}`)
  }

  const data = await response.json()
  const rawText = data.content[0].text.trim()

  // Extract TAGS line before JSON parsing
  const tagsMatch = rawText.match(/^TAGS:\s*(.+)$/m)
  const tags = tagsMatch
    ? tagsMatch[1].trim().split(/\s+/).filter((t) => t.startsWith('#'))
    : []
  const text = rawText.replace(/^TAGS:.*$/m, '').trim()

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    try {
      parsed = JSON.parse(stripped)
    } catch {
      const match = stripped.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          parsed = JSON.parse(match[0])
        } catch {
          throw new Error('Could not parse the AI response. Please try again.')
        }
      } else {
        throw new Error('Could not parse the AI response. Please try again.')
      }
    }
  }

  return { ...parsed, tags }
}
