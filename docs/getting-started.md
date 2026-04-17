# 빠른 시작

SafeSpace를 로컬에서 실행하거나 GitHub Pages 데모를 체험하는 가이드이다.

---

## GitHub Pages 데모 (설치 불필요)

별도 설치 없이 브라우저에서 바로 체험할 수 있다.

🔗 **[https://yeongseon.github.io/safespace/](https://yeongseon.github.io/safespace/)**

클라이언트 사이드 시뮬레이터가 내장되어 있어 백엔드 없이 모든 기능이 동작한다.

!!! tip "데모 체험 순서"
    1. 대시보드에서 정상 상태 확인 (녹색 게이지, 정상 센서값)
    2. Demo 페이지(`/#/demo`)로 이동
    3. "Oxygen Drop" 버튼 클릭 → 대시보드로 돌아가서 변화 관찰
    4. 다른 시나리오도 순서대로 체험

---

## 로컬 개발 환경

### 사전 요구사항

| 도구 | 버전 | 확인 명령 |
|------|------|-----------|
| Python | 3.10 이상 | `python3 --version` |
| Node.js | 18 이상 | `node --version` |
| npm | 9 이상 | `npm --version` |
| Git | 최신 | `git --version` |

### 1. 저장소 클론

```bash
git clone https://github.com/yeongseon/safespace.git
cd safespace
```

### 2. 백엔드 실행

```bash
cd backend
pip install -e .
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

실행 후 확인:

- API: [http://localhost:8000/api/dashboard/summary](http://localhost:8000/api/dashboard/summary)
- OpenAPI 문서: [http://localhost:8000/docs](http://localhost:8000/docs)
- WebSocket: `ws://localhost:8000/ws/live`

!!! info "자동 시작"
    서버 시작 시 자동으로 기본 구역 3개가 생성되고, 센서 루프가 2초 간격으로 동작을 시작한다. 별도 설정이 필요 없다.

### 3. 프론트엔드 실행

새 터미널을 열고:

```bash
cd frontend
npm install
npm run dev
```

실행 후 접속: [http://localhost:5173](http://localhost:5173)

!!! note "API 프록시"
    Vite dev server가 `/api/*`와 `/ws/*` 요청을 `localhost:8000`으로 자동 프록시한다. 별도 CORS 설정이 필요 없다.

### 4. 데모 시나리오 테스트

=== "UI에서"

    Demo 페이지(`/demo`)에서 시나리오 버튼 클릭

=== "curl로"

    ```bash
    # 산소 감소 시나리오 활성화
    curl -X POST http://localhost:8000/api/demo/scenario \
      -H "Content-Type: application/json" \
      -d '{"scenario": "oxygen_drop"}'

    # 정상 상태로 복귀
    curl -X POST http://localhost:8000/api/demo/scenario \
      -H "Content-Type: application/json" \
      -d '{"scenario": "safe"}'
    ```

=== "WebSocket으로"

    ```javascript
    const ws = new WebSocket('ws://localhost:8000/ws/live')
    ws.onmessage = (e) => console.log(JSON.parse(e.data))
    ```

---

## 프로젝트 구조

```
safespace/
├── frontend/          # React 앱 (Vite + TypeScript + Tailwind)
│   ├── src/           # 소스 코드
│   ├── package.json   # Node.js 의존성
│   └── vite.config.ts # Vite 설정 (base: '/safespace/')
│
├── backend/           # FastAPI 앱
│   ├── app/           # Python 소스
│   └── pyproject.toml # Python 의존성
│
├── docs/              # MkDocs 마크다운 소스
├── mkdocs.yml         # MkDocs 설정
└── .gitignore
```

---

## 설정 값

백엔드 설정은 `backend/app/core/config.py`의 `Settings` 클래스에서 관리한다. 현재는 기본값을 사용한다.

| 설정 | 기본값 | 설명 |
|------|--------|------|
| `db_path` | `./safespace.db` | SQLite DB 파일 경로 |
| `websocket_path` | `/ws/live` | WebSocket 엔드포인트 |
| `sensor_interval_seconds` | `2` | 센서 갱신 주기 (초) |
| `oxygen_safe_min` | `19.5` | 산소 안전 하한 (%) |
| `oxygen_warning_min` | `18.0` | 산소 경고 하한 (%) |
| `h2s_safe_max` | `5.0` | H₂S 안전 상한 (ppm) |
| `h2s_warning_max` | `10.0` | H₂S 경고 상한 (ppm) |
| `co_safe_max` | `25.0` | CO 안전 상한 (ppm) |
| `co_warning_max` | `50.0` | CO 경고 상한 (ppm) |
| `voc_safe_max` | `100.0` | VOC 안전 상한 (ppm) |
| `voc_warning_max` | `200.0` | VOC 경고 상한 (ppm) |

---

## 트러블슈팅

### 백엔드가 시작되지 않음

```
ModuleNotFoundError: No module named 'app'
```

→ `backend/` 디렉터리에서 `pip install -e .`을 실행했는지 확인.

### 프론트엔드 빌드 실패

```
Cannot find module '@/...'
```

→ `npm install`을 다시 실행. `tsconfig.app.json`의 path alias 설정 확인.

### WebSocket 연결 실패

```
WebSocket connection to 'ws://localhost:8000/ws/live' failed
```

→ 백엔드가 실행 중인지 확인. Vite dev server의 proxy 설정 확인.

### SQLite 잠금 에러

```
sqlite3.OperationalError: database is locked
```

→ 백엔드 프로세스가 여러 개 실행 중일 수 있음. 중복 프로세스 종료.
