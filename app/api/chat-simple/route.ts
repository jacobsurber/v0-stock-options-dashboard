export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]?.content || ""

    console.log("Simple chat API called with:", lastMessage)

    // Simple mock response for testing
    const mockResponse = `I understand you're asking about "${lastMessage}". 

As your AI trading assistant, I can help with:
- Options strategies and analysis
- Risk management techniques  
- Market analysis and insights
- Technical indicators
- Portfolio optimization

This is currently a test response. The AI integration is being configured. What specific trading topic would you like to explore?`

    // Simulate streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const words = mockResponse.split(" ")
        let i = 0

        const interval = setInterval(() => {
          if (i < words.length) {
            controller.enqueue(encoder.encode(words[i] + " "))
            i++
          } else {
            clearInterval(interval)
            controller.close()
          }
        }, 50)
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error) {
    console.error("Simple chat API error:", error)
    return new Response("Error: " + (error instanceof Error ? error.message : "Unknown error"), {
      status: 500,
    })
  }
}
