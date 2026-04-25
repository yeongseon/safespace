# SafeSpace

**IoT 센서 시계열 분석 및 3D 디지털 트윈 기반 조선소 밀폐공간 안전 모니터링 시스템**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.184-000000?logo=threedotjs)](https://threejs.org)
[![Spark](https://img.shields.io/badge/Spark_2.0-Gaussian_Splatting-FF6B35)](https://spark.js.dev)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)](https://sqlite.org)

**[Live Demo](https://yeongseon.github.io/safespace/)** · **[Documentation](https://yeongseon.github.io/safespace/docs/)**

---

## 프로젝트 소개

조선소 밀폐공간 작업 중 발생할 수 있는 산소 결핍, 유해가스 축적, 작업자 이상행동을 **실시간으로 감지**하고 관리자에게 **즉시 경고**하는 웹 기반 안전 관제 시스템.

Spark 2.0 Gaussian Splatting 기반 **3D 디지털 트윈**으로 밀폐공간을 시각화하고, 센서 데이터와 작업자 위치를 3D 공간 위에 오버레이한다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **실시간 대시보드** | 6종 센서(O2, H2S, CO, VOC, 온도, 습도) 2초 간격 갱신 |
| **3D 디지털 트윈** | Spark 2.0 Gaussian Splatting 기반 3D 공간 시각화, 센서 앵커 오버레이, 작업자 마커 |
| **구역별 모니터링** | 다중 구역 동시 감시 (Paint Tank A, Cargo Hold B, Engine Room C) |
| **복합 위험 판정** | 가중 점수제 4단계 위험 등급 (SAFE, CAUTION, WARNING, CRITICAL) |
| **급변 감지** | 5분 이동평균 대비 센서값 급변 시 예방적 경고 |
| **작업자 모니터링** | 쓰러짐/무동작 감지, 영상 패널 경고 |
| **데모 시나리오** | 5가지 시나리오로 즉시 시연 |
| **이중 모드** | GitHub Pages 정적 배포 (시뮬레이터) + FastAPI 풀스택 모드 |

---

## 빠른 시작

### GitHub Pages 데모 (설치 불필요)

[https://yeongseon.github.io/safespace/](https://yeongseon.github.io/safespace/)

정적 모드로 동작하며, 시뮬레이터가 센서 데이터를 자동 생성한다. Twin 페이지에서 Gaussian Splatting 3D 씬을 확인할 수 있다.

### 로컬 실행 (풀스택)

```bash
# 백엔드
cd backend && pip install -e . && uvicorn app.main:app --reload

# 프론트엔드 (새 터미널)
cd frontend && npm install && npm run dev
```

http://localhost:5173/safespace/ 접속

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| **Frontend** | React 19, TypeScript 6, Vite 8, Tailwind CSS 4, Framer Motion, Recharts, Zustand |
| **3D / Twin** | Three.js 0.184, Spark 2.0 (Gaussian Splatting), OrbitControls |
| **Backend** | FastAPI, SQLModel, Pydantic 2, SQLite, uvicorn |
| **Deployment** | GitHub Pages (정적 데모), GitHub Actions CI/CD, MkDocs Material (문서) |

---

## 프로젝트 구조

```
safespace/
├── frontend/                  # React 앱 (22 컴포넌트, 5 페이지)
│   └── src/
│       ├── app/               # store (Zustand, 구역별 상태), router
│       ├── components/
│       │   ├── common/        # StatusBadge, AnimatedValue, ConnectionIndicator
│       │   ├── dashboard/     # AlertBanner, OverallRiskCard, SensorMetricCard,
│       │   │                  # LiveTrendChart, ZoneOverviewPanel, VideoMonitorPanel,
│       │   │                  # WorkerStatusCard, EventLogPanel, ActionGuidePanel
│       │   ├── layout/        # AppShell, Sidebar, TopBar
│       │   └── twin/          # TwinCanvas, TwinHud, TwinSensorAnchors,
│       │                      # TwinWorkerMarker, TwinEventOverlay, TwinLegend,
│       │                      # TwinLoadingState
│       ├── lib/               # api, data-source, simulator, websocket,
│       │                      # twin-loader, runtime, constants, utils
│       ├── pages/             # DashboardPage, TwinPage, EventsPage,
│       │                      # ZonesPage, DemoPage
│       └── features/          # types
│   └── public/twin/           # 구역별 manifest.json (3D 씬 메타데이터)
├── backend/                   # FastAPI 서버 (REST API + WebSocket)
│   └── app/
│       ├── sensor/            # 센서 API
│       ├── worker/            # 작업자 API
│       ├── event/             # 이벤트 API
│       └── zone/              # 구역 API + slug 해석
├── docs/                      # MkDocs 마크다운 소스 (17 페이지)
├── .github/workflows/         # GitHub Actions CI/CD
└── mkdocs.yml
```

---

## 아키텍처

```
┌─────────────────────────────────────────────────┐
│  Browser (React 19 + Zustand)                   │
│                                                 │
│  ┌────────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ Dashboard  │  │   Twin   │  │   Events    │ │
│  │   Page     │  │   Page   │  │   Page      │ │
│  └─────┬──────┘  └────┬─────┘  └──────┬──────┘ │
│        └───────────────┼───────────────┘        │
│               ┌────────┴────────┐               │
│               │ Zone-Aware Store│               │
│               │ (구역별 상태 맵) │               │
│               └────────┬────────┘               │
│               ┌────────┴────────┐               │
│               │   DataSource    │               │
│               └────────┬────────┘               │
└────────────────────────┼────────────────────────┘
                         │
           ┌─────────────┴─────────────┐
           │                           │
    Static Mode                 Backend Mode
    (GitHub Pages)              (FastAPI + SQLite)
    시뮬레이터가                 REST API + WebSocket
    센서 데이터 생성              실시간 데이터 수신
```

**구역별 상태 관리**: `sensorByZone`, `riskByZone`, `workerByZone`, `eventsByZone` 맵으로 다중 구역 데이터를 분리 관리한다. `currentZoneId`를 변경하면 Dashboard와 Twin 페이지가 동시에 전환된다.

**3D 디지털 트윈**: 각 구역의 `manifest.json`이 씬 메타데이터(카메라 위치, 센서 앵커 좌표, 작업자 위치, 출구, 위험 구역)를 정의한다. Spark 2.0 `SplatMesh`가 Gaussian Splatting `.spz` 파일을 렌더링하고, 실시간 센서 데이터가 3D 공간 위에 오버레이된다.

---

## 문서

전체 문서는 [https://yeongseon.github.io/safespace/docs/](https://yeongseon.github.io/safespace/docs/) 에서 확인할 수 있다.

| 문서 | 내용 |
|------|------|
| [빠른 시작](https://yeongseon.github.io/safespace/docs/getting-started/) | 설치, 실행, 데모 |
| [PRD](https://yeongseon.github.io/safespace/docs/prd/) | 제품 요구사항 |
| [아키텍처](https://yeongseon.github.io/safespace/docs/architecture/) | 시스템 구조, 데이터 흐름 |
| [프론트엔드](https://yeongseon.github.io/safespace/docs/frontend/) | 컴포넌트 구조, 상태 관리 |
| [디지털 트윈](https://yeongseon.github.io/safespace/docs/digital-twin/) | Spark 2.0 통합, manifest 스키마 |
| [API 명세](https://yeongseon.github.io/safespace/docs/api/) | REST + WebSocket |
| [위험 판정 규칙](https://yeongseon.github.io/safespace/docs/risk-rules/) | 점수 산정, 임계치 |
| [데모 시나리오](https://yeongseon.github.io/safespace/docs/demo/) | 5가지 시나리오 상세 |

---

## License

MIT
