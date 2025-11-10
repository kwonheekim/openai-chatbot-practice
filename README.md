# OpenAI 챗봇 (React + Express)

웹 브라우저에서 사용할 수 있는 AI 챗봇 애플리케이션입니다. React로 만든 프론트엔드와 Express로 만든 백엔드로 구성되어 있습니다.

## 📁 프로젝트 구조

```
openai-chatbot-react/
├── client/          # React 프론트엔드 (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/          # Express 백엔드
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## 🚀 시작하기

### 필요한 것

- Node.js (v18 이상)
- OpenAI API 키

### 1. 백엔드 설정

````bash
# server 폴더로 이동
cd server

# 패키지 설치
npm install

### 2. 프론트엔드 설정

```bash
# client 폴더로 이동
cd ../client

# 패키지 설치
npm install
````

### 3. 실행

**터미널 1 - 백엔드 서버 실행:**

```bash
cd server
npm start
# 또는 개발 모드: npm run dev
```

서버가 `http://localhost:3001`에서 실행됩니다.

**터미널 2 - 프론트엔드 실행:**

```bash
cd client
npm run dev
```

프론트엔드가 `http://localhost:3000`에서 실행됩니다.

브라우저에서 `http://localhost:3000`을 열면 챗봇을 사용할 수 있습니다!

## 💬 기능

- ✅ 실시간 AI 대화
- ✅ 대화 히스토리 유지 (맥락 이해)
- ✅ 깔끔한 채팅 UI
- ✅ 로딩 애니메이션
- ✅ 새로운 대화 시작 기능
- ✅ 반응형 디자인

## 🛠 기술 스택

**Frontend:**

- React 18
- Vite
- CSS3 (Gradient, Animation)

**Backend:**

- Express.js
- OpenAI API (GPT-3.5-turbo)
- CORS
- dotenv

## 📡 API 엔드포인트

### POST `/api/chat`

메시지를 전송하고 AI 응답을 받습니다.

**Request:**

```json
{
  "message": "안녕하세요",
  "sessionId": "optional-session-id"
}
```

**Response:**

```json
{
  "message": "안녕하세요! 무엇을 도와드릴까요?",
  "sessionId": "session-id"
}
```

### POST `/api/reset`

대화 히스토리를 초기화합니다.

**Request:**

```json
{
  "sessionId": "optional-session-id"
}
```

### GET `/api/health`

서버 상태를 확인합니다.

## ⚙️ 커스터마이징

### AI 모델 변경

`server/server.js` 파일에서 모델을 변경할 수 있습니다:

```javascript
model: 'gpt-3.5-turbo', // 또는 'gpt-4'
temperature: 0.7,
```

### 스타일 변경

`client/src/App.css`에서 색상, 레이아웃 등을 변경할 수 있습니다.

### 포트 변경

- 백엔드: `server/.env`에서 `PORT` 변경
- 프론트엔드: `client/vite.config.js`에서 `server.port` 변경

## 📝 라이센스

ISC

## 🙋‍♂️ 문제 해결

### 포트가 이미 사용 중이라는 오류

다른 포트를 사용하거나, 이미 실행 중인 프로세스를 종료하세요.

### CORS 오류

백엔드 서버가 실행 중인지 확인하세요.

### API 키 오류

`.env` 파일에 올바른 OpenAI API 키가 입력되었는지 확인하세요.
