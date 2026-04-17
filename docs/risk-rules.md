# 위험 판정 규칙

---

## Status Levels

| 레벨 | 점수 | 색상 |
|------|------|------|
| 🟢 SAFE | 0~24 | Green |
| 🟡 CAUTION | 25~49 | Yellow |
| 🟠 WARNING | 50~74 | Orange |
| 🔴 CRITICAL | 75~100 | Red |

---

## 센서 임계치

| 센서 | SAFE | WARNING | CRITICAL |
|------|------|---------|----------|
| O₂ | ≥ 19.5% | 18.0~19.5% | < 18.0% |
| H₂S | ≤ 5 ppm | 5~10 ppm | > 10 ppm |
| CO | ≤ 25 ppm | 25~50 ppm | > 50 ppm |
| VOC | ≤ 100 ppm | 100~200 ppm | > 200 ppm |

---

## Rapid Change Detection

| 센서 | 5분 평균 대비 임계치 |
|------|---------------------|
| O₂ | ≥ 1.0% 하락 |
| H₂S | ≥ 5 ppm 상승 |
| CO | ≥ 20 ppm 상승 |
| VOC | ≥ 80 ppm 상승 |

---

## Risk Score 가중치

| 요소 | 비중 |
|------|------|
| 산소 위험도 | **35%** |
| 유해가스 위험도 | **30%** |
| 온습도 이상 | **10%** |
| 작업자 이상 | **25%** |

```
total = oxygen×0.35 + max(gas, rapid)×0.30 + env×0.10 + worker×0.25 + rapid×0.15
```

!!! danger "즉시 CRITICAL"
    산소 저하 + 유해가스 상승, 또는 worker collapse 발생 시
