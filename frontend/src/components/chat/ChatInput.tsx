"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  return (
    <div className="border-t border-white/[0.08] bg-black px-6 py-4 shrink-0 z-20 font-sans">
      <div className="max-w-4xl mx-auto flex items-end gap-3">
        <div className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-3xl focus-within:border-white/30 focus-within:bg-white/[0.05] transition-all">
          <textarea
            ref={textareaRef} 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Select documents to start chatting..." : "Ask a question about your documents..."}
            disabled={isLoading || disabled} 
            rows={1}
            className="w-full bg-transparent text-white placeholder-slate-500 px-5 py-3.5 resize-none outline-none text-sm max-h-[200px]"
          />
        </div>
        <button
          onClick={handleSubmit} 
          disabled={!message.trim() || isLoading || disabled}
          className="shrink-0 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all active:scale-95 shadow-sm"
          aria-label="Send message"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
      <p className="text-center text-[10px] text-slate-500 mt-2">Press Enter to send • Shift+Enter for new line</p>
    </div>
  );
}
