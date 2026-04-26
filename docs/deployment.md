# 배포 가이드

SafeSpace의 배포 방법을 설명한다. GitHub Pages 정적 배포와 Full-Stack 배포 두 가지 모드를 지원한다.

---

## 배포 모드 비교

| 항목 | GitHub Pages (정적) | Full-Stack (로컬/서버) |
|------|-------------------|----------------------|
| 백엔드 | 불필요 | FastAPI + SQLite |
| 데이터 소스 | 클라이언트 시뮬레이터 | 서버 시뮬레이터 (향후 실제 센서) |
| DB 저장 | 없음 (메모리) | SQLite 파일 |
| WebSocket | 없음 | 실시간 브로드캐스트 |
| URL | `https://username.github.io/safespace/` | `http://localhost:5173` |
| 용도 | 데모, 발표, 포트폴리오 | 개발, 테스트, 프로덕션 |

---

## GitHub Pages 배포

### 사전 준비

```bash
# 프론트엔드 빌드
cd frontend
npm install
npm run build    # → dist/ 디렉터리 생성

# MkDocs 빌드
cd ..
pip install mkdocs-material
mkdocs build     # → site/ 디렉터리 생성
```

### 배포 절차

```bash
# 임시 디렉터리에 배포 파일 준비
mkdir -p /tmp/safespace-deploy/docs
cp -r frontend/dist/* /tmp/safespace-deploy/
cp -r site/* /tmp/safespace-deploy/docs/
touch /tmp/safespace-deploy/.nojekyll

# gh-pages 브랜치에 배포
git checkout --orphan gh-pages-deploy
git rm -rf .
cp -r /tmp/safespace-deploy/* .
cp /tmp/safespace-deploy/.nojekyll .
git add -A
git commit -m "deploy: frontend demo + mkdocs documentation"
git push -f origin gh-pages-deploy:gh-pages

# main 브랜치로 복귀
git checkout main
git branch -D gh-pages-deploy
```

### GitHub Pages 설정

1. GitHub 저장소 → Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** / **(root)**
4. Save

배포 후 1~2분 내에 접근 가능:

- 데모: `https://username.github.io/safespace/`
- 문서: `https://username.github.io/safespace/docs/`

### Vite base 설정

`vite.config.ts`에서 `base`를 저장소 이름으로 설정해야 한다:

```typescript
export default defineConfig({
  base: '/safespace/',  // GitHub Pages 서브 경로
  // ...
})
```

!!! warning "base 경로 주의"
    `base`를 변경하면 로컬 개발 시 `npm run preview`에서 경로가 맞지 않을 수 있다. `npm run dev`는 proxy 설정이 있어 영향 없다.

---

## 로컬 개발 모드

### 프론트엔드 +  백엔드 동시 실행

=== "터미널 1: 백엔드"

    ```bash
    cd backend
    pip install -e .
    uvicorn app.main:app --reload --port 8000
    ```

=== "터미널 2: 프론트엔드"

    ```bash
    cd frontend
    npm install
    npm run dev
    ```

Vite dev server가 API/WebSocket 요청을 백엔드로 프록시한다:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:8000',
    '/ws': { target: 'ws://localhost:8000', ws: true }
  }
}
```

### 프론트엔드 단독 실행 (정적 모드)

백엔드 없이 프론트엔드만 실행해도 클라이언트 시뮬레이터가 동작한다.

```bash
cd frontend
npm run dev
# → http://localhost:5173 에서 시뮬레이터 모드로 동작
```

---

## 프로덕션 배포 (참고)

!!! info "MVP 범위 외"
    프로덕션 배포는 현재 MVP 범위에 포함되지 않지만, 향후 확장을 위한 참고 사항이다.

### 권장 구성

```
[Client Browser]
       │
       ▼
[Nginx / CDN]
  ├── /         → React SPA (정적 파일)
  ├── /api/*    → FastAPI (reverse proxy)
  └── /ws/*     → FastAPI WebSocket (reverse proxy)
       │
       ▼
[FastAPI + Gunicorn]
       │
       ▼
[PostgreSQL]  (SQLite → PostgreSQL 마이그레이션)
```

### 환경 변수 (향후)

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/safespace
CORS_ORIGINS=https://safespace.example.com
SENSOR_INTERVAL=2
SECRET_KEY=your-secret-key
```

### CI/CD 파이프라인 (GitHub Actions)

`.github/workflows/deploy-pages.yml`로 자동 배포가 구성되어 있다. `main` 브랜치에 푸시하면 자동으로 빌드 및 배포된다.

```mermaid
graph LR
    A[Push to main] --> B[GitHub Actions]
    B --> C[npm ci --legacy-peer-deps]
    C --> D[npm run build]
    D --> E{Pass?}
    E -->|Yes| F[Upload artifact]
    F --> G[Deploy to GitHub Pages]
    E -->|No| H[Fail + Notify]
```
