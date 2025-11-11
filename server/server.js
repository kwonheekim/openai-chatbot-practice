// 필요한 라이브러리들을 가져옵니다
import express from 'express';      // 웹 서버를 만들기 위한 프레임워크
import cors from 'cors';            // 클라이언트와의 통신을 허용하기 위한 미들웨어
import dotenv from 'dotenv';        // 환경 변수를 .env 파일에서 불러오기 위한 라이브러리
import OpenAI from 'openai';        // OpenAI API를 사용하기 위한 라이브러리

// .env 파일에서 환경 변수를 로드합니다 (API 키 등)
dotenv.config();

// Express 애플리케이션을 생성합니다
const app = express();
// 서버가 실행될 포트 번호를 설정합니다 (기본값: 3001)
const PORT = process.env.PORT || 3001;

// OpenAI API를 사용하기 위한 클라이언트를 초기화합니다
// .env 파일에 있는 OPENAI_API_KEY를 사용합니다
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 미들웨어 설정
app.use(cors());              // 모든 도메인에서의 요청을 허용합니다 (CORS 활성화)
app.use(express.json());      // JSON 형식의 요청 본문을 파싱할 수 있게 합니다

// 사용자별 대화 내역을 메모리에 저장하는 객체
// 키: sessionId, 값: 대화 메시지 배열
// 주의: 실제 서비스에서는 데이터베이스를 사용해야 합니다
const conversationHistories = {};

// 사용자별 Agent 설정을 저장하는 객체
// 키: sessionId, 값: agentConfig (role, goal, outputFormat)
const agentConfigs = {};

// 서버 상태를 확인하는 헬스 체크 API
// GET /api/health 요청 시 서버가 정상 작동 중인지 확인할 수 있습니다
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '서버가 정상 작동 중입니다' });
});

/**
 * Agent의 시스템 프롬프트를 생성하는 함수
 * Agent 설정(role, goal, outputFormat)을 바탕으로 AI에게 전달할 시스템 메시지를 만듭니다
 *
 * @param {Object} agentConfig - Agent 설정 객체
 * @param {string} agentConfig.role - AI의 역할 (예: "친절한 상담사", "전문 코더")
 * @param {string} agentConfig.goal - AI의 목표 (예: "사용자의 문제 해결")
 * @param {string} agentConfig.outputFormat - 출력 형식 (JSON, Markdown, List 등)
 * @returns {string|null} 생성된 시스템 프롬프트 또는 null
 */
function buildSystemPrompt(agentConfig) {
  // Agent 설정이 없으면 null을 반환합니다
  if (!agentConfig) return null;

  // Agent 설정에서 필요한 값들을 추출합니다
  const { role, goal, outputFormat } = agentConfig;

  // 프롬프트를 구성할 문자열 변수
  let prompt = '';

  // 역할이 있으면 프롬프트에 추가
  if (role) {
    prompt += `역할: ${role}\n\n`;
  }

  // 목표가 있으면 프롬프트에 추가
  if (goal) {
    prompt += `목표: ${goal}\n\n`;
  }

  // 출력 형식이 있으면 프롬프트에 추가
  if (outputFormat) {
    prompt += `출력 형식: ${outputFormat}\n\n`;

    // 각 출력 형식에 맞는 추가 지침을 제공합니다
    if (outputFormat === 'JSON') {
      prompt += '항상 유효한 JSON 형식으로 응답하세요.';
    } else if (outputFormat === 'Markdown') {
      prompt += '마크다운 형식으로 잘 구조화된 응답을 작성하세요.';
    } else if (outputFormat === 'List') {
      prompt += '항목별 리스트 형식으로 간결하게 응답하세요.';
    }
  }

  // 앞뒤 공백을 제거하고 반환합니다
  return prompt.trim();
}

/**
 * 채팅 메시지를 처리하는 메인 API 엔드포인트
 * POST /api/chat
 *
 * 사용자의 메시지를 받아서 OpenAI API로 전달하고,
 * AI의 응답을 클라이언트에 반환합니다.
 */
app.post('/api/chat', async (req, res) => {
  try {
    // 요청 본문에서 메시지, 세션ID, Agent 설정을 추출합니다
    // sessionId가 없으면 'default'를 사용합니다
    const { message, sessionId = 'default', agentConfig } = req.body;

    // 메시지가 비어있으면 에러를 반환합니다
    if (!message) {
      return res.status(400).json({ error: '메시지가 필요합니다' });
    }

    // 해당 세션의 대화 내역이 없으면 새로 생성합니다
    // 처음 대화를 시작하는 경우에 실행됩니다
    if (!conversationHistories[sessionId]) {
      conversationHistories[sessionId] = [];
    }

    // Agent 설정이 변경되었는지 확인합니다
    // JSON.stringify를 사용해 객체를 비교합니다
    if (agentConfig && JSON.stringify(agentConfigs[sessionId]) !== JSON.stringify(agentConfig)) {
      // 새로운 Agent 설정을 저장합니다
      agentConfigs[sessionId] = agentConfig;

      // 새로운 Agent로 대화를 시작하므로 이전 대화 내역을 초기화합니다
      conversationHistories[sessionId] = [];

      // Agent 설정으로 시스템 프롬프트를 생성합니다
      const systemPrompt = buildSystemPrompt(agentConfig);
      if (systemPrompt) {
        // 시스템 프롬프트를 대화 내역의 첫 메시지로 추가합니다
        // 이것이 AI의 행동 방식을 결정합니다
        conversationHistories[sessionId].push({
          role: 'system',
          content: systemPrompt
        });
      }
    }

    // 사용자가 보낸 메시지를 대화 내역에 추가합니다
    conversationHistories[sessionId].push({
      role: 'user',      // 역할: 사용자
      content: message   // 메시지 내용
    });

    // OpenAI API를 호출하여 AI 응답을 생성합니다
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',                          // 사용할 AI 모델
      messages: conversationHistories[sessionId],      // 지금까지의 대화 내역 전체를 전달
      temperature: 0.7,                                // 응답의 창의성 (0.0 ~ 2.0, 높을수록 창의적)
    });

    // API 응답에서 AI가 생성한 메시지를 추출합니다
    const assistantMessage = completion.choices[0].message.content;

    // AI의 응답을 대화 내역에 추가합니다
    // 다음 대화에서 AI가 이전 맥락을 기억할 수 있습니다
    conversationHistories[sessionId].push({
      role: 'assistant',        // 역할: AI 어시스턴트
      content: assistantMessage // AI의 응답 메시지
    });

    // 클라이언트에게 AI의 응답을 전송합니다
    res.json({
      message: assistantMessage,  // AI의 응답 메시지
      sessionId                   // 세션 ID (클라이언트가 다음 요청에 사용)
    });

  } catch (error) {
    // 에러가 발생한 경우 (API 키 오류, 네트워크 오류 등)
    console.error('OpenAI API 오류:', error);
    res.status(500).json({
      error: 'AI 응답을 가져오는 중 오류가 발생했습니다',
      details: error.message  // 구체적인 오류 메시지
    });
  }
});

/**
 * 대화 내역을 초기화하는 API 엔드포인트
 * POST /api/reset
 *
 * 특정 세션의 대화 내역을 모두 삭제합니다.
 * 새로운 대화를 시작하고 싶을 때 사용합니다.
 */
app.post('/api/reset', (req, res) => {
  // 요청에서 세션ID를 가져옵니다 (없으면 'default' 사용)
  const { sessionId = 'default' } = req.body;

  // 해당 세션의 대화 내역을 빈 배열로 초기화합니다
  conversationHistories[sessionId] = [];

  // 성공 메시지를 클라이언트에 반환합니다
  res.json({ message: '대화 히스토리가 초기화되었습니다' });
});

/**
 * 서버를 시작합니다
 * 지정된 포트에서 HTTP 요청을 받을 준비를 합니다
 */
app.listen(PORT, () => {
  console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});
