import { useEffect, useState } from 'react'
import { Search, Send } from 'lucide-react'
import Layout from '@/components/Layout'
import apiClient from '@/services/api'
import { Message } from '@/types'

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await apiClient.get('/messages')
        setMessages(response.data)
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [])

  const filteredMessages = messages.filter((m) =>
    m.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Messages</h1>
          <p className="text-neutral-600 mt-1">Manage customer messages</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700/30 focus:border-red-700"
          />
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-neutral-500">Loading...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">No messages found</div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow ${
                  !message.read ? 'border-red-700/30 bg-red-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">From: {message.senderId}</p>
                    <p className="text-neutral-600 mt-2">{message.content}</p>
                    <p className="text-sm text-neutral-500 mt-2">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-neutral-100 rounded transition-colors">
                    <Send size={18} style={{ color: '#C41E3A' }} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
