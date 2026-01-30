"use client"

import React, { useState, useRef, useEffect, FormEvent, useCallback, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  IconMicrophone, IconMicrophoneOff, IconSend, IconPaperclip, 
  IconTrash, IconMessagePlus, IconRobot, IconUser,
  IconX, IconLoader2, IconCircleFilled, IconArrowLeft
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"

// --- TYPES ---
interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date }
interface Chat { id: string; title: string; messages: Message[] }
interface InputFormHandle { focus: () => void }

// --- NEW UI COMPONENT: THE WAVEFORM ---


// --- UI HELPER: CHAT BUBBLE ---
const ChatBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === 'user'
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={cn("flex w-full mb-8", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex max-w-[85%] gap-4", isUser ? "flex-row-reverse" : "flex-row")}>
        <div className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xl",
          isUser ? "bg-white/10 border-white/20" : "bg-blue-600 border-blue-400"
        )}>
          {isUser ? <IconUser size={20} /> : <IconRobot size={20} className="text-white" />}
        </div>
        <div className={cn(
          "relative p-5 rounded-2xl border backdrop-blur-xl shadow-2xl",
          isUser ? "bg-white/5 border-white/10 text-gray-100" : "bg-blue-600/10 border-blue-500/20 text-blue-50"
        )}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.content}</div>
          <div className="text-[10px] mt-3 opacity-30 font-mono tracking-tighter uppercase">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// --- UI HELPER: INPUT FORM ---
const InputForm = React.memo(React.forwardRef<InputFormHandle, any>(({ 
  input, setInput, isLoading, handleSubmit, handleKeyDown, 
  isVoiceModeActive, onVoiceToggle, onFileAttachClick, fileName, onRemoveFile 
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  useImperativeHandle(ref, () => ({ focus: () => textareaRef.current?.focus() }))

  return (
    <div className="relative z-20 w-full max-w-4xl mx-auto px-6 pb-10">
      <form onSubmit={handleSubmit} className="bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-3 shadow-2xl">
        {fileName && (
          <div className="flex items-center justify-between px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-3 mx-2">
            <span className="text-xs font-mono text-blue-400 truncate tracking-tight">{fileName}</span>
            <button type="button" onClick={onRemoveFile} className="text-blue-400 hover:text-white transition-colors"><IconX size={14} /></button>
          </div>
        )}
        <div className="flex items-end gap-3 px-2">
          <button type="button" onClick={onFileAttachClick} className="p-4 text-white/30 hover:text-white transition-all hover:scale-110">
            <IconPaperclip size={22} />
          </button>
          <textarea
            ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={isVoiceModeActive ? "Voice link active..." : "Describe the dilemma..."}
            rows={1} disabled={isLoading}
            className="flex-1 bg-transparent border-none focus:ring-0 focus:bg-transparent focus:outline-none text-white placeholder-white/10 py-4 resize-none max-h-40 font-medium text-base overflow-hidden"
          />
          <button
            type="button" onClick={onVoiceToggle}
            className={cn(
              "p-4 rounded-[1.2rem] transition-all duration-500 shadow-lg",
              isVoiceModeActive ? "bg-red-500 text-white animate-pulse scale-110" : "bg-white/5 text-white/30 hover:bg-white/10"
            )}
          >
            {isVoiceModeActive ? <IconMicrophone size={22} /> : <IconMicrophoneOff size={22} />}
          </button>
          <button
            type="submit" disabled={isLoading || (!input.trim() && !fileName)}
            className="p-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-10 text-white rounded-[1.2rem] transition-all"
          >
            {isLoading ? <IconLoader2 size={22} className="animate-spin" /> : <IconSend size={22} />}
          </button>
        </div>
      </form>
    </div>
  )
}))
InputForm.displayName = 'InputForm'

// --- MAIN PAGE COMPONENT ---
export default function PageFour() {
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false)
  const [connection, setConnection] = useState<WebSocket | null>(null)
  
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // LOGIC REFS
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isConnectingRef = useRef(false)
  const isVoiceModeActiveRef = useRef(false)
  const activeChatRef = useRef<Chat | null>(null)
  const isLoadingRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const prevIsLoadingRef = useRef(false)
  const [lastTTSMessageId, setLastTTSMessageId] = useState<string | null>(null)
  const inputFormRef = useRef<InputFormHandle>(null)

  useEffect(() => { isVoiceModeActiveRef.current = isVoiceModeActive }, [isVoiceModeActive])
  useEffect(() => { activeChatRef.current = activeChat }, [activeChat])
  useEffect(() => { isLoadingRef.current = isLoading }, [isLoading])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [activeChat?.messages])

  const stopTTS = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current.src = "" }
  }, [])

  const playTTS = useCallback(async (text: string) => {
    try {
      stopTTS()
      const res = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) })
      if (!res.ok) return
      const blob = await res.blob(); const url = URL.createObjectURL(blob)
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.onloadeddata = () => { audioRef.current?.play().catch(() => {}) }
      }
    } catch (err) { console.warn("TTS Error:", err) }
  }, [stopTTS])

  useEffect(() => {
    if (prevIsLoadingRef.current && !isLoading && activeChat && isVoiceModeActive) {
      const lastMsg = activeChat.messages[activeChat.messages.length - 1]
      if (lastMsg?.role === 'assistant' && lastMsg.content && lastMsg.id !== lastTTSMessageId) {
        playTTS(lastMsg.content); setLastTTSMessageId(lastMsg.id)
      }
    }
  }, [isLoading, activeChat, lastTTSMessageId, playTTS, isVoiceModeActive])

  useEffect(() => { prevIsLoadingRef.current = isLoading }, [isLoading])
  useEffect(() => { stopTTS() }, [activeChat?.id, stopTTS])

  useEffect(() => {
    const saved = localStorage.getItem('chats')
    const activeId = localStorage.getItem('activeChatId')
    if (saved) {
      const parsed = JSON.parse(saved); setChats(parsed)
      if (activeId) setActiveChat(parsed.find((c: Chat) => c.id === activeId) || parsed[0])
    } else { handleNewChat() }
  }, [])

  useEffect(() => { if (chats.length > 0) localStorage.setItem('chats', JSON.stringify(chats)) }, [chats])
  useEffect(() => { if (activeChat) localStorage.setItem('activeChatId', activeChat.id) }, [activeChat])

  const autoSubmitMessage = useCallback(async (text: string) => {
    const currentChat = activeChatRef.current
    const currentIsLoading = isLoadingRef.current
    if ((!text.trim() && !fileContent) || currentIsLoading || !currentChat) return
    stopTTS(); setInput('')

    let fullContent = text.trim()
    if (fileContent && fileName) {
      fullContent = `[Attached File: ${fileName}]\n\n${fileContent}\n\n---\n\n${text.trim()}`
      setFileContent(null); setFileName(null)
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: fullContent, timestamp: new Date() }
    const updatedChat = { ...currentChat, messages: [...currentChat.messages, userMsg] }
    setActiveChat(updatedChat); setChats(prev => prev.map(c => c.id === currentChat.id ? updatedChat : c))
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedChat.messages.map(m => ({ role: m.role, content: m.content })) }),
      })
      const reader = response.body?.getReader(); if (!reader) return
      const decoder = new TextDecoder(); let assistantContent = ''
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', timestamp: new Date() }
      setActiveChat(prev => prev ? { ...prev, messages: [...prev.messages, assistantMsg] } : null)
      while (true) {
        const { done, value } = await reader.read(); if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]' || !data.trim()) continue
            try {
              const delta = JSON.parse(data).choices[0]?.delta?.content
              if (delta) {
                assistantContent += delta
                setActiveChat(prev => {
                  if (!prev) return prev
                  const msgs = [...prev.messages]; msgs[msgs.length - 1].content = assistantContent; return { ...prev, messages: msgs }
                })
              }
            } catch {}
          }
        }
      }
    } catch {} finally { setIsLoading(false) }
  }, [fileContent, fileName, stopTTS])

  const stopVoiceMode = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop(); mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())
    }
    if (connection && connection.readyState === WebSocket.OPEN) connection.close()
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    setConnection(null); mediaRecorderRef.current = null; isConnectingRef.current = false
  }, [connection])

  const startVoiceMode = useCallback(async () => {
    if (isConnectingRef.current || connection) return
    isConnectingRef.current = true
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      const dgApiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY
      if (!dgApiKey) { isConnectingRef.current = false; return }
      const socket = new WebSocket(`wss://api.deepgram.com/v1/listen?model=nova-2&language=en-IN&punctuate=true&utterance_end_ms=1500&interim_results=true`, ["token", dgApiKey])
      let accumulatedTranscript = ''
      socket.onopen = () => {
        isConnectingRef.current = false
        mediaRecorder.addEventListener('dataavailable', (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) socket.send(event.data)
        })
        mediaRecorder.start(250)
      }
      socket.onmessage = (msg) => {
        if (!isVoiceModeActiveRef.current) return
        try {
          const received = JSON.parse(msg.data)
          const transcript = received.channel?.alternatives[0]?.transcript
          if (transcript?.trim()) {
            stopTTS()
            if (received.is_final) {
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
              accumulatedTranscript += (accumulatedTranscript ? ' ' : '') + transcript
              setInput(accumulatedTranscript.trim())
              silenceTimerRef.current = setTimeout(() => {
                if (accumulatedTranscript.trim() || fileContent) {
                  autoSubmitMessage(accumulatedTranscript.trim()); accumulatedTranscript = ''; setInput('')
                }
              }, 2000)
            } else {
              setInput((accumulatedTranscript + (accumulatedTranscript ? ' ' : '') + transcript).trim())
            }
          }
        } catch {}
      }
      setConnection(socket)
    } catch { setIsVoiceModeActive(false); isConnectingRef.current = false }
  }, [connection, stopTTS, autoSubmitMessage, fileContent])

  const handleVoiceToggle = useCallback(() => {
    if (isVoiceModeActive) { stopVoiceMode(); setIsVoiceModeActive(false) }
    else { setIsVoiceModeActive(true); startVoiceMode() }
  }, [isVoiceModeActive, startVoiceMode, stopVoiceMode])

  useEffect(() => { if (!isVoiceModeActive) stopVoiceMode() }, [isVoiceModeActive, stopVoiceMode])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || file.size > 100 * 1024) return
    const reader = new FileReader(); reader.onload = (ev) => { setFileContent(ev.target?.result as string); setFileName(file.name) }; reader.readAsText(file)
  }

  const handleNewChat = () => {
    const newChat: Chat = { id: Date.now().toString(), title: 'NEW SESSION', messages: [] }
    setChats(prev => [newChat, ...prev]); setActiveChat(newChat); setInput(''); handleRemoveFile(); stopTTS()
  }

  const handleDeleteChat = (id: string) => {
    stopTTS(); const filtered = chats.filter(c => c.id !== id); setChats(filtered)
    if (activeChat?.id === id) { setActiveChat(filtered[0] || null); handleRemoveFile() }
  }

  const handleRemoveFile = () => { setFileContent(null); setFileName(null) }

  return (
    <>
      {/* GLOBAL DARK SCROLLBAR STYLES */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #050505; 
        }
        ::-webkit-scrollbar-thumb {
          background: #262626; 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #404040; 
        }
      `}</style>

      <main className="h-screen w-full bg-[#050505] text-white flex flex-col relative overflow-hidden selection:bg-blue-500/30">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        <audio ref={audioRef} hidden />
        <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept=".txt,.md,.js,.ts,.json" />

        {/* HEADER */}
        <header className="relative z-20 flex items-center justify-between p-8 border-b border-white/5 bg-black/40 backdrop-blur-2xl shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="group flex items-center gap-2 text-white/30 hover:text-white transition-colors">
              <IconArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            {/* ... inside header ... */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div>
                  {/* CHANGED: Gradient is now blue-600 -> blue-400 -> blue-600 (No white) */}
                  {/* UPDATED: Sleek, high-contrast typography */}
<h1 className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
  <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] uppercase">
    Trader's Dilemma
  </span>
  <span className="text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded-md border border-blue-500/20 text-base not-italic font-mono animate-pulse">
    VOICE_IF
  </span>
</h1>
                  <p className="text-[10px] font-mono text-white/20 tracking-[0.3em] uppercase mt-0.5">Neural Psychology Interface</p>
                </div>
                {/* DELETED: {isVoiceModeActive && <VoiceWaveform />} */}
              </div>
            </div>
          </div>
          <button onClick={handleNewChat} className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl text-xs font-black tracking-widest hover:bg-gray-200 transition-all shadow-2xl">
            <IconMessagePlus size={16} /> NEW SESSION
          </button>
        </header>

        {/* CHAT AREA - CENTERED */}
        <div className="flex-1 overflow-y-auto relative z-10 px-6 py-10 w-full">
          <div className="max-w-4xl mx-auto w-full">
            {activeChat?.messages.length === 0 ? (
              <div className="h-[55vh] flex flex-col items-center justify-center text-center opacity-20">
                <IconRobot size={64} className="mb-6" />
                <p className="font-mono text-xs uppercase tracking-[0.4em]">System Idle // Awaiting Analysis</p>
              </div>
            ) : (
              activeChat?.messages.map(m => <ChatBubble key={m.id} message={m} />)
            )}
            {isLoading && (
              <div className="flex gap-3 items-center text-blue-400 font-mono text-[10px] ml-14 tracking-widest uppercase animate-pulse">
                <IconCircleFilled size={8} /> Synthesis in progress...
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* INPUT FORM - CENTERED */}
        <InputForm 
          ref={inputFormRef}
          input={input} setInput={setInput} isLoading={isLoading}
          isVoiceModeActive={isVoiceModeActive} onVoiceToggle={handleVoiceToggle}
          handleSubmit={(e: FormEvent) => { e.preventDefault(); autoSubmitMessage(input) }}
          handleKeyDown={(e: any) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); autoSubmitMessage(input) } }}
          onFileAttachClick={() => fileInputRef.current?.click()}
          fileName={fileName} onRemoveFile={handleRemoveFile}
        />

        {/* HISTORY OVERLAY */}
        <AnimatePresence>
          {historyOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHistoryOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md z-30" />
              <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: "spring", damping: 25 }} className="absolute left-0 top-0 h-full w-[350px] bg-[#080808] border-r border-white/5 z-40 p-10 shadow-[50px_0_100px_rgba(0,0,0,0.9)]">
                <div className="flex justify-between items-center mb-12">
                  <h3 className="font-black italic text-xl tracking-tighter text-blue-500 uppercase">Archives</h3>
                  <button onClick={() => setHistoryOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><IconX size={24} /></button>
                </div>
                <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-4">
                  {chats.map(chat => (
                    <div key={chat.id} onClick={() => { setActiveChat(chat); setHistoryOpen(false) }} className={cn("p-5 rounded-[1.5rem] border transition-all cursor-pointer group flex justify-between items-center", activeChat?.id === chat.id ? "bg-white/10 border-white/20" : "bg-white/5 border-white/5 hover:border-white/20")}>
                      <div className="flex flex-col gap-1 truncate">
                        <span className="text-[11px] font-black truncate uppercase tracking-widest">{chat.title}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id) }} className="opacity-0 group-hover:opacity-100 p-2 text-red-500/50 hover:text-red-500 transition-all"><IconTrash size={18} /></button>
                    </div>
                  ))}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </main>
    </>
  )
}