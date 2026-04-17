# UX/UI 설계

프론트엔드는 단순 관리툴이 아니라 **실시간 산업 안전 관제 화면**처럼 보여야 한다.

---

## Color System

| 상태 | 색상 | HEX | 용도 |
|------|------|-----|------|
| 🟢 SAFE | Green | `#22c55e` | 정상 상태 |
| 🟡 CAUTION | Yellow | `#eab308` | 주의 상태 |
| 🟠 WARNING | Orange | `#f97316` | 경고 상태 |
| 🔴 CRITICAL | Red | `#ef4444` | 치명적 상태 |
| Background | Dark Slate | `#0f172a` | 전체 배경 |
| Surface | Deep Gray | `#1e293b` | 카드/패널 배경 |

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│ TopBar: Logo │ Title │ Time │ Connection │ Zone     │
├─────────────────────────────────────────────────────┤
│ AlertBanner (WARNING/CRITICAL 시에만 표시)            │
├──────────┬──────────────────┬───────────────────────┤
│ Overall  │   Live Charts    │ Video Monitor          │
│ Risk     │                  ├───────────────────────┤
│ Card     │                  │ Action Guide           │
├──────────┤  Zone Overview   ├───────────────────────┤
│ Sensor   │                  │ Event Log              │
│ Cards    │                  │                        │
├──────────┤                  │                        │
│ Worker   │                  │                        │
└──────────┴──────────────────┴───────────────────────┘
```

---

## Key Components

- **OverallRiskCard** — SVG 원형 게이지 (0~100), 상태별 Glow
- **SensorMetricCard** — 큰 숫자 + 안전 범위 바 + 추세 화살표
- **LiveTrendChart** — 최근 60개 데이터 포인트 라인 차트
- **AlertBanner** — WARNING/CRITICAL 시 슬라이드 다운
- **VideoMonitorPanel** — fall_suspected 시 빨간 오버레이
- **EventLogPanel** — 새 이벤트 애니메이션 진입
- **ActionGuidePanel** — 상태별 즉시 조치 권고

---

## Interaction Principles

!!! tip "Principle 1: State first, value second"
    숫자보다 상태가 먼저 보여야 한다.

!!! tip "Principle 2: Animate important transitions"
    위험도 변경 시 카드/배너/로그가 함께 반응해야 한다.

!!! tip "Principle 3: Everything should feel live"
    실시간 수치, 차트, 로그, 연결상태가 유기적으로 업데이트되어야 한다.

!!! tip "Principle 4: Demo must be easy"
    발표자가 버튼 몇 개만 눌러도 완성도 높은 시연이 가능해야 한다.
