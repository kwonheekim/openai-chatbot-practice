import { useState } from 'react'
import './AgentConfig.css'

// 사전 정의된 Agent 프리셋
const AGENT_PRESETS = [
  {
    id: 'default',
    name: '기본 챗봇',
    role: '친절한 AI 어시스턴트',
    goal: '사용자의 질문에 정확하고 도움이 되는 답변을 제공합니다',
    outputFormat: 'Text'
  },
  {
    id: 'marketer',
    name: '마케팅 전문가',
    role: '전문 마케터',
    goal: '제품 홍보 문구, 광고 카피, 마케팅 전략을 제안합니다',
    outputFormat: 'Markdown'
  },
  {
    id: 'coder',
    name: '코딩 도우미',
    role: '숙련된 프로그래머',
    goal: '코드 작성, 버그 수정, 프로그래밍 개념 설명을 도와줍니다',
    outputFormat: 'Markdown'
  },
  {
    id: 'writer',
    name: '작가',
    role: '창의적인 작가',
    goal: '스토리, 시나리오, 콘텐츠 작성을 도와줍니다',
    outputFormat: 'Text'
  },
  {
    id: 'analyzer',
    name: '데이터 분석가',
    role: '데이터 분석 전문가',
    goal: '데이터를 분석하고 인사이트를 제공합니다',
    outputFormat: 'JSON'
  },
  {
    id: 'teacher',
    name: '선생님',
    role: '친절한 교사',
    goal: '개념을 쉽고 명확하게 설명합니다',
    outputFormat: 'List'
  }
]

const OUTPUT_FORMATS = [
  { value: 'Text', label: '일반 텍스트' },
  { value: 'Markdown', label: '마크다운' },
  { value: 'JSON', label: 'JSON' },
  { value: 'List', label: '리스트' }
]

function AgentConfig({ agentConfig, setAgentConfig, onApply }) {
  const [isOpen, setIsOpen] = useState(false)

  const handlePresetSelect = (preset) => {
    setAgentConfig({
      role: preset.role,
      goal: preset.goal,
      outputFormat: preset.outputFormat
    })
  }

  const handleApply = () => {
    onApply()
    setIsOpen(false)
  }

  return (
    <div className="agent-config-container">
      <button onClick={() => setIsOpen(!isOpen)} className="config-toggle-button">
        ⚙️ Agent 설정
      </button>

      {isOpen && (
        <div className="config-panel">
          <div className="config-header">
            <h3>AI Agent 구성</h3>
            <button onClick={() => setIsOpen(false)} className="close-button">✕</button>
          </div>

          {/* 프리셋 선택 */}
          <div className="config-section">
            <label>프리셋 선택</label>
            <div className="preset-grid">
              {AGENT_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className="preset-button"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* 역할 입력 */}
          <div className="config-section">
            <label>역할 (Role)</label>
            <input
              type="text"
              value={agentConfig.role}
              onChange={(e) => setAgentConfig({ ...agentConfig, role: e.target.value })}
              placeholder="예: 전문 마케터"
              className="config-input"
            />
            <p className="config-hint">AI가 어떤 역할을 수행할지 정의하세요</p>
          </div>

          {/* 목표 입력 */}
          <div className="config-section">
            <label>목표 (Goal)</label>
            <textarea
              value={agentConfig.goal}
              onChange={(e) => setAgentConfig({ ...agentConfig, goal: e.target.value })}
              placeholder="예: 제품 홍보 문구를 작성해주세요"
              className="config-textarea"
              rows="3"
            />
            <p className="config-hint">AI가 달성해야 할 목표를 설명하세요</p>
          </div>

          {/* 출력 형식 선택 */}
          <div className="config-section">
            <label>출력 형식 (Output Format)</label>
            <select
              value={agentConfig.outputFormat}
              onChange={(e) => setAgentConfig({ ...agentConfig, outputFormat: e.target.value })}
              className="config-select"
            >
              {OUTPUT_FORMATS.map(format => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
            <p className="config-hint">응답을 어떤 형식으로 받을지 선택하세요</p>
          </div>

          {/* 적용 버튼 */}
          <button onClick={handleApply} className="apply-button">
            적용하기
          </button>
        </div>
      )}
    </div>
  )
}

export default AgentConfig
