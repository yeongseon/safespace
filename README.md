# SafeSpace

**IoT 센서 시계열 분석 및 영상 이상행동 탐지 기반 조선소 밀폐공간 안전 모니터링 시스템**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)](https://sqlite.org)

🔗 **[Live Demo](https://yeongseon.github.io/safespace/)** · 📖 **[Documentation](https://yeongseon.github.io/safespace/docs/)**

---

## 🛡️ 프로젝트 소개

조선소 밀폐공간 작업 중 발생할 수 있는 산소 결핍, 유해가스 축적, 작업자 이상행동을 **실시간으로 감지**하고 관리자에게 **즉시 경고**하는 웹 기반 안전 관제 MVP.

### ✅ 주요 기능

- 📊 **실시간 대시보드** — 6종 센서(O₂, H₂S, CO, VOC, 온도, 습도) 2초 간격 갱신
- 🎯 **복합 위험 판정** — 가중 점수제 4단계 위험 등급 (SAFE → CAUTION → WARNING → CRITICAL)
- ⚡ **급변 감지** — 5분 이동평균 대비 센서값 급변 시 예방적 경고
- 🎥 **작업자 모니터링** — 쓰러짐/무동작 감지, 영상 패널 경고
- 🎮 **데모 시나리오** — 5가지 시나리오로 즉시 시연
- 🌐 **정적 배포** — GitHub Pages에서 백엔드 없이 완전 동작

---

## 🚀 빠른 시작

### 🎮 GitHub Pages 데모 (설치 불필요)

👉 [https://yeongseon.github.io/safespace/](https://yeongseon.github.io/safespace/)

### 💻 로컬 실행

```bash
# 백엔드
cd backend && pip install -e . && uvicorn app.main:app --reload

# 프론트엔드 (새 터미널)
cd frontend && npm install && npm run dev
```

http://localhost:5173 접속

---

## ⚙️ 기술 스택

| 📋 분류 | ⚙️ 기술 |
|------|------|
| **Frontend** | React 19, TypeScript 6, Vite 8, Tailwind CSS 4, Framer Motion, Recharts, Zustand |
| **Backend** | FastAPI, SQLModel, Pydantic 2, SQLite, uvicorn |
| **Deployment** | GitHub Pages (정적 데모), MkDocs Material (문서) |

---

## 🏗️ 프로젝트 구조

```
safespace/
├── frontend/          # React 앱 (20+ 컴포넌트, 4 페이지)
├── backend/           # FastAPI 서버 (REST API + WebSocket)
├── docs/              # MkDocs 마크다운 소스 (15 페이지)
└── mkdocs.yml         # MkDocs 설정
```

---

## 📝 문서

전체 문서는 [https://yeongseon.github.io/safespace/docs/](https://yeongseon.github.io/safespace/docs/) 에서 확인할 수 있다.

| 📝 문서 | 📋 내용 |
|------|------|
| [빠른 시작](https://yeongseon.github.io/safespace/docs/getting-started/) | 설치, 실행, 데모 |
| [PRD](https://yeongseon.github.io/safespace/docs/prd/) | 제품 요구사항 |
| [아키텍처](https://yeongseon.github.io/safespace/docs/architecture/) | 시스템 구조, 데이터 흐름 |
| [API 명세](https://yeongseon.github.io/safespace/docs/api/) | REST + WebSocket |
| [위험 판정 규칙](https://yeongseon.github.io/safespace/docs/risk-rules/) | 점수 산정, 임계치 |
| [데모 시나리오](https://yeongseon.github.io/safespace/docs/demo/) | 5가지 시나리오 상세 |

---

## 📌 License

MIT
