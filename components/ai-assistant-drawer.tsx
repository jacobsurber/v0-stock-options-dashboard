"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { X, Send, Bot, AlertCircle, RefreshCw } from "lucide-react"
import { ChatMessageBubble } from "./chat-message-bubble"
import { useAIChat } from "@/hooks/use-ai-chat"

interface AIAssistantDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function AIAssistantDrawer({ isOpen, onClose }: AIAssistantDrawerProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload } = useAIChat()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [testingConnection, setTestingConnection] = useState(false)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(e)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const testConnection = async () => {
    setTestingConnection(true)
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Test connection" }],
        }),
      })

      if (response.ok) {
        console.log("API connection successful")
      } else {
        const errorData = await response.text()
        console.error("API connection failed:", errorData)
      }
    } catch (error) {
      console.error("Connection test failed:", error)
    } finally {
      setTestingConnection(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[90vw] sm:w-[400px] md:w-[500px] p-0 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <SheetTitle className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                  AI Assistant
                </SheetTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={testConnection}
                  disabled={testingConnection}
                  className="h-8 px-2 text-xs"
                >
                  {testingConnection ? <RefreshCw className="h-3 w-3 animate-spin" /> : "Test"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <div className="flex-1">
                <span className="text-sm text-red-700 dark:text-red-300">AI connection failed.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reload}
                  className="ml-2 h-6 px-2 text-xs text-red-600 hover:text-red-700"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-3 sm:px-4 py-4">
            <div className="space-y-1">
              {messages.map((message) => (
                <ChatMessageBubble
                  key={message.id}
                  role={message.role as "user" | "assistant"}
                  content={message.content}
                  timestamp={new Date()}
                />
              ))}
              {isLoading && (
                <div className="flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] mr-auto mb-4">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 rounded-2xl rounded-bl-md px-3 py-2 sm:px-4 sm:py-2.5">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce" />
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex-shrink-0 p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask about market analysis, options strategies..."
                className="flex-1 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 text-sm sm:text-base"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="sm"
                className="px-3 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </form>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 hidden sm:block">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
