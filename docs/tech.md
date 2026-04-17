# 기술 설계

MVP는 **프론트엔드 중심**으로 설계한다. 백엔드는 단순한 데이터 공급자이자 위험 판단 로직 서버로 구성한다.

---

## Tech Stack

| 분류 | 기술 | 용도 |
|------|------|------|
| Frontend | React 18 + TypeScript | UI |
| Frontend | Tailwind CSS 4, Framer Motion | 스타일 + 애니메이션 |
| Frontend | Recharts, Zustand, React Query | 차트, 상태, 서버상태 |
| Backend | FastAPI + SQLModel | REST API + WebSocket |
| Backend | SQLite | 경량 DB |
| Analysis | NumPy, Pandas | 데이터 분석 |

---

## Architecture

```
[Sensor Simulator]
        │
        ▼
  [FastAPI Backend]
  ├─ risk evaluation
  ├─ event generation
  └─ websocket broadcast
        │
        ├──────────────┐
        ▼              ▼
  [SQLite]     [React Dashboard]
```

!!! info "GitHub Pages 데모"
    정적 배포를 위해 클라이언트 사이드 시뮬레이터가 내장되어 백엔드 없이도 모든 시나리오를 시연할 수 있다.

---

## Risk Evaluation Strategy

**Phase 1 (MVP):** Rule-based — 임계치 + 변화량 감지 + 복합 조건

**Phase 2 (향후):** 이동평균 이탈, Z-score, 롤링 윈도우

---

## Worker Monitoring

**MVP:** 시뮬레이션 기반 상태 전환 (normal → inactive → fall_suspected)

**향후:** OpenCV / MediaPipe 영상 분석
