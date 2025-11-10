import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 미들웨어
app.use(cors());
app.use(express.json());

// 대화 히스토리를 저장할 객체 (실제 프로덕션에서는 DB 사용 권장)
const conversationHistories = {};

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '서버가 정상 작동 중입니다' });
});

// 채팅 엔드포인트
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;

    if (!message) {
      return res.status(400).json({ error: '메시지가 필요합니다' });
    }

    // 세션별 대화 히스토리 초기화
    if (!conversationHistories[sessionId]) {
      conversationHistories[sessionId] = [];
    }

    // 사용자 메시지 추가
    conversationHistories[sessionId].push({
      role: 'user',
      content: message
    });

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversationHistories[sessionId],
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0].message.content;

    // AI 응답 추가
    conversationHistories[sessionId].push({
      role: 'assistant',
      content: assistantMessage
    });

    // 응답 전송
    res.json({
      message: assistantMessage,
      sessionId
    });

  } catch (error) {
    console.error('OpenAI API 오류:', error);
    res.status(500).json({
      error: 'AI 응답을 가져오는 중 오류가 발생했습니다',
      details: error.message
    });
  }
});

// 대화 히스토리 초기화 엔드포인트
app.post('/api/reset', (req, res) => {
  const { sessionId = 'default' } = req.body;
  conversationHistories[sessionId] = [];
  res.json({ message: '대화 히스토리가 초기화되었습니다' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ 서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});
