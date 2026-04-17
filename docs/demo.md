# 데모 시나리오

발표 중 짧은 시간 안에 서비스 가치를 명확히 보여주기 위한 시나리오 설계이다.

---

## Scenarios

### 🟢 Scenario 1: Safe Baseline
모든 센서 정상, worker normal, Green UI.

### 🟠 Scenario 2: Oxygen Drop
30초에 걸쳐 O₂가 20.8% → 16.5%로 점진적 감소. CAUTION → WARNING → CRITICAL 전환.

### 🔴 Scenario 3: Gas Leak
18초에 걸쳐 H₂S 2→25ppm, VOC 80→350ppm 급상승.

### 🔴 Scenario 4: Worker Collapse
작업자 `fall_suspected`, confidence 0.96. 비디오 모니터 빨간 오버레이.

### 🔴 Scenario 5: Multi-Risk
산소 감소 + 가스 누출 + 작업자 쓰러짐 동시 발생. 모든 UI 요소 CRITICAL 반응.

---

## 권장 발표 순서

| 순서 | 내용 | 시간 |
|------|------|------|
| 1 | 정상 상태 소개 | 1분 |
| 2 | 산소 감소 시나리오 | 1분 |
| 3 | 가스 누출 시나리오 | 1분 |
| 4 | 작업자 쓰러짐 시나리오 | 1분 |
| 5 | Multi-risk 종합 대응 | 1분 |
| 6 | 기대효과 및 확장 방향 | 1분 |
