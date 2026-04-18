# 🛡️ SafeSpace

**IoT 센서 시계열 분석 및 영상 이상행동 탐지 기반 조선소 밀폐공간 안전 모니터링 시스템**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)](https://sqlite.org)
[![License](https://img.shields.io/badge/License-MIT-green)](https://github.com/yeongseon/safespace)

🔗 **[Live Demo](https://yeongseon.github.io/safespace/)** · 📖 **[API 문서](api.md)** · 🚀 **[빠른 시작](getting-started.md)**

---

## 📝 한 줄 소개

조선소 밀폐공간 작업 중 발생할 수 있는 산소 결핍, 유해가스 축적, 작업자 이상행동을 **실시간으로 감지**하고 관리자에게 **즉시 경고**하는 웹 기반 안전 관제 MVP.

---

## ⚠️ 문제 정의

조선소의 선박 내부 탱크, 도장구역, 밀폐 작업공간에서는 환기가 충분하지 않을 경우 다음과 같은 중대 위험이 발생할 수 있다.

| ⚠️ 위험 유형 | 📝 설명 |
|-----------|------|
| 🫁 산소 농도 저하 | 밀폐공간 내 산소 소비로 인한 질식 위험 |
| ☠️ 유해가스 증가 | H₂S, CO, VOC 등 독성 가스 축적 |
| 🚶 작업자 이상행동 | 어지럼증, 비틀거림, 쓰러짐 |
| 🚨 2차 사고 | 구조 과정 중 추가 인명피해 |

!!! danger "핵심 과제"
    밀폐공간 사고는 짧은 시간 안에 치명적 상태로 악화될 수 있어, 단순 체크리스트만으로는 한계가 있다. **"사고 이후 대응"이 아니라 "사고 직전 징후 감지"**가 목표다.

---

## ✅ 주요 기능

| ✅ 기능 | 📝 설명 |
|------|------|
| 📊 **실시간 대시보드** | 6종 센서(O₂, H₂S, CO, VOC, 온도, 습도) 데이터를 2초 간격으로 갱신하는 산업 관제 UI |
| 🎯 **복합 위험 판정** | 가중 점수제 기반 4단계 위험 등급 자동 산정 (SAFE → CAUTION → WARNING → CRITICAL) |
| ⚡ **급변 감지** | 5분 이동평균 대비 센서값 급변 시 추가 위험 점수 부여 |
| 🎥 **작업자 모니터링** | 쓰러짐(fall_suspected), 무동작(inactive) 상태 감지 및 영상 패널 경고 |
| 🔔 **즉시 경고** | WARNING/CRITICAL 발생 시 상단 배너 + 이벤트 로그 + 조치 가이드 동시 표시 |
| 🎮 **데모 시나리오** | 5가지 사전 정의된 시나리오로 즉시 시연 가능 |
| 🌐 **정적 배포** | 백엔드 없이 GitHub Pages에서 클라이언트 사이드 시뮬레이터로 완전 동작 |

---

## 🎯 프로젝트 목표

1. 밀폐공간의 환경 데이터를 **실시간으로 수집**한다.
2. 위험 상태를 직관적으로 판단할 수 있는 **대시보드를 제공**한다.
3. 임계치 초과 또는 시계열 이상 패턴을 감지하면 **즉시 경고**한다.
4. 작업자 쓰러짐 또는 장시간 무동작 상태를 **영상으로 보조 감지**한다.
5. 발표 및 시연이 가능한 수준의 **완성도 높은 프론트엔드**를 구현한다.

---

## ⚙️ 기술 스택 요약

=== "프론트엔드"

    | ⚙️ 기술 | 📋 버전 | 🎯 용도 |
    |------|------|------|
    | React | 19.2 | UI 컴포넌트 |
    | TypeScript | 6.0 | 타입 안전성 |
    | Vite | 8.0 | 빌드 도구 |
    | Tailwind CSS | 4.2 | 유틸리티 기반 스타일링 |
    | Framer Motion | 12.38 | 상태 전환 애니메이션 |
    | Recharts | 3.8 | 실시간 시계열 차트 |
    | Zustand | 5.0 | 글로벌 상태 관리 |
    | React Query | 5.99 | 서버 상태 관리 |

=== "백엔드"

    | ⚙️ 기술 | 📋 버전 | 🎯 용도 |
    |------|------|------|
    | FastAPI | 0.115+ | REST API + WebSocket |
    | SQLModel | 0.0.22+ | ORM + 데이터 검증 |
    | SQLite | 3 | 경량 관계형 DB |
    | Pydantic | 2.0+ | 스키마 검증 |
    | uvicorn | 0.30+ | ASGI 서버 |

---

## 📌 핵심 가치

| 📌 가치 | 📝 설명 |
|------|------|
| 🔒 예방 중심 안전관리 | 사후 대응이 아닌 사전 예방 |
| ⚡ 실시간성 | 2초 간격 상태 갱신, WebSocket 기반 브로드캐스트 |
| 📊 직관적 관제 UI | 다크 테마 산업 관제실 수준 대시보드 |
| 💰 저비용 MVP 구현 | 기존 인프라 위에 소프트웨어로 해결 |
| 🎯 공모전 발표 적합성 | 5가지 데모 시나리오를 통한 즉각적 시연 |

---

## 🗺️ 문서 구조

| 🗺️ 섹션 | 📝 내용 |
|------|------|
| [빠른 시작](getting-started.md) | 설치, 실행, 첫 번째 데모까지 |
| [제품 요구사항](prd.md) | MVP 범위, 사용자, 기능 요구사항 |
| [UX/UI 설계](ux-ui.md) | 색상 시스템, 레이아웃, 인터랙션 원칙 |
| [아키텍처](architecture.md) | 시스템 구조, 데이터 흐름, 상태 관리 |
| [기술 설계](tech.md) | 기술 스택 선정 근거, 성능 고려사항 |
| [프론트엔드](frontend.md) | 컴포넌트 구조, 스토어, 라우팅 |
| [백엔드](backend.md) | 모듈 구조, 센서 루프, WebSocket |
| [API 명세](api.md) | REST/WebSocket 엔드포인트 상세 |
| [데이터 모델](data.md) | SQLModel 테이블, ER 다이어그램 |
| [위험 판정 규칙](risk-rules.md) | 점수 산정, 임계치, 급변 감지 |
| [데모 시나리오](demo.md) | 5가지 시나리오, 진행 타임라인 |
| [배포 가이드](deployment.md) | GitHub Pages, 로컬 개발, 프로덕션 |
| [로드맵](roadmap.md) | MVP 완료 현황, 향후 계획 |
| [발표 가이드](presentation.md) | 발표 스크립트, Q&A 대비 |
