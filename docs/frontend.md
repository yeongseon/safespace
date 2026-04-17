# 프론트엔드 구조

---

## Folder Structure

```
frontend/src/
  app/          router, providers, store
  pages/        dashboard, demo, events, zones
  components/
    layout/     AppShell, TopBar, Sidebar
    dashboard/  OverallRiskCard, SensorMetricCard, LiveTrendChart,
                AlertBanner, VideoMonitorPanel, WorkerStatusCard,
                EventLogPanel, ActionGuidePanel, ZoneOverviewPanel
    common/     StatusBadge, AnimatedValue, ConnectionIndicator
  features/     types.ts
  lib/          simulator, api, websocket, utils, constants
  styles/       globals.css
```

---

## Key States

| 상태 그룹 | 값 |
|-----------|-----|
| 연결 | `connected` / `reconnecting` / `offline` |
| 위험 | `SAFE` / `CAUTION` / `WARNING` / `CRITICAL` |
| 시뮬레이션 | `on` / `off` |

---

## Design Notes

- 카드 간 간격은 충분히
- 숫자는 **크게**, 설명은 **짧게**
- 위험 전환 시 **색 + 모션** 동시 사용
- Tailwind CSS v4 `@theme` 커스텀 색상
