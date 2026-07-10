import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

import { toast } from 'react-hot-toast'
import {
  Send, ArrowLeft, Loader2, Circle
} from 'lucide-react'

export default function ChatPage() {
  const { appointmentId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  useEffect(() => {
    if (!appointmentId || !user) return
    let pollInterval
    const loadChat = async () => {
      try {
        const apptRes = await api.get(`/appointments/${appointmentId}`)
        const appt = apptRes.data
        if (!appt) { toast.error('Appointment not found'); return }
        
        const other = user.role === 'patient' ? appt.doctor.user : appt.patient
        setOtherUser(other)
        
        const msgsRes = await api.get(`/messages/${appointmentId}`)
        setMessages(msgsRes.data || [])
        setLoading(false)
        scrollToBottom()
        
        await api.put(`/messages/${appointmentId}/read`)
      } catch (err) {
        toast.error('Failed to load chat')
        setLoading(false)
      }
    }
    
    loadChat()
    
    // Polling for new messages
    pollInterval = setInterval(async () => {
      try {
        const msgsRes = await api.get(`/messages/${appointmentId}`)
        setMessages(prev => {
          if (prev.length !== msgsRes.data.length) {
            setTimeout(scrollToBottom, 100)
          }
          return msgsRes.data || []
        })
        await api.put(`/messages/${appointmentId}/read`)
      } catch (e) {
        console.error('Polling error:', e)
      }
    }, 3000)
    
    return () => clearInterval(pollInterval)
  }, [appointmentId, user])



  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !appointmentId || !user || !otherUser) return
    setSending(true)
    
    try {
      const msgRes = await api.post('/messages', {
        receiver_id: otherUser._id,
        appointment_id: appointmentId,
        content: newMessage.trim(),
      })
      
      setMessages((prev) => [...prev, msgRes.data])
      setNewMessage('')
      scrollToBottom()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex flex-col flex-1">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
            <Circle className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{otherUser?.first_name} {otherUser?.last_name}</h2>
            <p className="text-xs text-slate-500">{otherUser?.role === 'doctor' ? 'Doctor' : 'Patient'}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
            const isMe = (msg.sender?._id || msg.sender) === user?._id
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMe ? 'bg-teal-600 text-white rounded-br-md' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md'
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-teal-200' : 'text-slate-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="bg-white border-t border-slate-200 p-4 flex items-center gap-3">
          <input
            type="text"
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-teal-600 text-white p-2.5 rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
