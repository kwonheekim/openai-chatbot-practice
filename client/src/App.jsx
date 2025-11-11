import { useState, useRef, useEffect } from 'react'
import './App.css'
import AgentConfig from './AgentConfig'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [agentConfig, setAgentConfig] = useState({
    role: '친절한 AI 어시스턴트',
    goal: '사용자의 질문에 정확하고 도움이 되는 답변을 제공합니다',
    outputFormat: 'Text'
  })
  const messagesEndRef = useRef(null)

  // 메시지 추가 시 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Agent 적용
  const handleApplyAgent = () => {
    setMessages([])
  }

  // 메시지 전송
  const sendMessage = async (e) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')

    // 사용자 메시지 추가
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      // API 호출 (Agent 설정 포함)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          agentConfig: agentConfig
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // AI 응답 추가
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      } else {
        throw new Error(data.error || '응답을 받는데 실패했습니다')
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '오류가 발생했습니다: ' + error.message
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // 대화 초기화
  const resetChat = async () => {
    try {
      await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })
      setMessages([])
    } catch (error) {
      console.error('Reset error:', error)
    }
  }

  return (
    <div className="app">
      <div className="chat-container">
        {/* 헤더 */}
        <div className="chat-header">
          <h1>🤖 OpenAI 챗봇</h1>
          <div className="header-buttons">
            <AgentConfig
              agentConfig={agentConfig}
              setAgentConfig={setAgentConfig}
              onApply={handleApplyAgent}
            />
            <button onClick={resetChat} className="reset-button">
              새로운 대화
            </button>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <h2>안녕하세요! 👋</h2>
              <p>무엇을 도와드릴까요?</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content loading">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <form onSubmit={sendMessage} className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            disabled={isLoading}
            className="message-input"
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="send-button">
            전송
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
