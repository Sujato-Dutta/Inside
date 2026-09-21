"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  ChevronDown,
  Info,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "assistant",
      content: "Hello Instructor! I am your Inside Assistant. Ask me quick questions about school metrics, attendance formulas, or how to use any part of the app.",
      timestamp: "Just now",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Speech recognition error:", err);
      }
    }
  };

  const speakText = async (text: string) => {
    if (isSpeaking) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    try {
      // First attempt Groq TTS API (canopylabs/orpheus-v1-english)
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.ok && res.headers.get("Content-Type")?.includes("audio")) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          fallbackSpeech(text);
        };
        await audio.play();
        return;
      }
    } catch (e) {
      console.warn("Server TTS fallback to browser synthesis:", e);
    }

    fallbackSpeech(text);
  };

  const fallbackSpeech = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      content: textToSend.trim(),
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.content,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botReply: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: "assistant",
          content: data.reply || "I am analyzing your query with Inside.",
          timestamp: "Just now",
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        throw new Error("Chat response failed");
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: "assistant",
          content: "You can ask questions about student attendance, attainment gaps, or test scores directly in the Ask Inside tab.",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E3DED4] text-[13px] font-semibold text-[#1C1A17] shadow-sm cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>AI Assistant</span>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white flex items-center justify-center shadow-md border border-[#E3DED4] overflow-hidden"
          aria-label="Open Inside Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative w-8 h-8 rounded-lg overflow-hidden">
              <Image
                src="/logo.png"
                alt="Inside Assistant"
                fill
                className="object-cover"
              />
            </div>
          )}
        </motion.button>
      </div>

      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[92vw] sm:w-[410px] h-[540px] max-h-[82vh] rounded-3xl bg-white border border-[#E3DED4] shadow-xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-orange-50/60 border-b border-[#E3DED4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-7 h-7 rounded-lg overflow-hidden shadow-xs">
                  <Image src="/logo.png" alt="Inside" fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#1C1A17]">
                    Inside Assistant
                  </h4>
                  <p className="text-[12px] text-[#5C5852]">
                    Quick references & school data guidance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[#5C5852] hover:text-[#1C1A17]"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-[13px] font-bold ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                        : "bg-orange-50 text-orange-600 border border-orange-200"
                    }`}
                  >
                    {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xs rounded-tr-none"
                        : "bg-[#F5F2EB] border border-[#E3DED4] text-[#1C1A17] rounded-tl-none"
                    }`}
                  >
                    <p>{msg.content}</p>
                    {msg.sender === "assistant" && (
                      <div className="mt-1.5 flex items-center justify-end">
                        <button
                          onClick={() => speakText(msg.content)}
                          className="text-[11px] text-[#5C5852] hover:text-orange-600 flex items-center gap-1 transition-colors"
                          title="Listen to audio response"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-[13px] text-[#5C5852] pl-9">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[12px]">Assistant thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reference Prompts */}
            <div className="px-4 py-2 border-t border-[#E3DED4] bg-orange-50/40">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[12px] text-[#5C5852] no-scrollbar">
                <button
                  onClick={() => handleSendMessage("What is persistent absence?")}
                  className="px-2.5 py-1 rounded-full bg-white border border-[#E3DED4] hover:border-orange-500/60 hover:text-orange-600 shrink-0 transition"
                >
                  Persistent Absence?
                </button>
                <button
                  onClick={() => handleSendMessage("How do I export to PDF?")}
                  className="px-2.5 py-1 rounded-full bg-white border border-[#E3DED4] hover:border-orange-500/60 hover:text-orange-600 shrink-0 transition"
                >
                  Exporting Reports?
                </button>
                <button
                  onClick={() => handleSendMessage("Explain SEND attainment gap")}
                  className="px-2.5 py-1 rounded-full bg-white border border-[#E3DED4] hover:border-orange-500/60 hover:text-orange-600 shrink-0 transition"
                >
                  SEND Gap?
                </button>
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-[#E3DED4] bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                {/* Voice Mic Button (STT) */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isListening
                      ? "bg-red-500 text-white border-red-600 animate-pulse"
                      : "bg-orange-50 border border-orange-200 text-[#5C5852] hover:text-orange-600"
                  }`}
                  title={isListening ? "Listening... click to stop" : "Click to speak (Voice STT)"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isListening ? "Listening to your voice..." : "Ask assistant a question..."}
                  className="flex-1 px-3.5 py-2 text-[13px] rounded-xl border border-[#E3DED4] bg-[#F5F2EB] text-[#1C1A17] placeholder-[#8C877E] focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                />

                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white transition disabled:opacity-40 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
