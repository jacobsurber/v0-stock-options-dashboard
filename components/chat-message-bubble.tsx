"use client"
import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessageBubbleProps {
  role: "user" | "assistant"
  content: string
  timestamp?: Date
  className?: string
}

export function ChatMessageBubble({ role, content, timestamp, className }: ChatMessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div
      className={cn(
        "flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] mb-4",
        role === "user" ? "ml-auto flex-row-reverse" : "mr-auto",
        className,
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center",
          role === "user"
            ? "bg-slate-600 text-white"
            : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        )}
      >
        {role === "user" ? <User className="h-3 w-3 sm:h-4 sm:w-4" /> : <Bot className="h-3 w-3 sm:h-4 sm:w-4" />}
      </div>

      {/* Message Content */}
      <div className={cn("flex flex-col gap-1", role === "user" ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base leading-relaxed break-words",
            role === "user"
              ? "bg-slate-600 text-white rounded-br-md"
              : "bg-blue-50 dark:bg-blue-950/50 text-slate-900 dark:text-slate-100 border border-blue-100 dark:border-blue-900/50 rounded-bl-md",
          )}
        >
          <div className="whitespace-pre-wrap">{content}</div>
        </div>

        {/* Timestamp */}
        {timestamp && <span className="text-xs text-slate-500 dark:text-slate-400 px-1">{formatTime(timestamp)}</span>}
      </div>
    </div>
  )
}
