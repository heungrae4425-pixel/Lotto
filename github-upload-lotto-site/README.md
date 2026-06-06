# 로또 6/45 자동 콘텐츠 사이트

Next.js 15, TypeScript, Tailwind CSS, Supabase Postgres, Vercel Cron 기반의 로또 6/45 회차별 당첨번호 정보 사이트입니다.

## 데이터 수집 방식

최신 회차 기준은 동행복권 추첨결과 페이지에서 확인합니다.

```text
https://www.dhlottery.co.kr/lt645/result
```

이 페이지의 회차 선택 목록에서 가장 큰 회차 번호를 최신 회차로 판단합니다.

회차별 상세 데이터 저장은 동행복권의 회차 JSON 응답을 사용합니다.

```text
https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo={회차}
```

즉, 흐름은 다음과 같습니다.

1. `https://www.dhlottery.co.kr/lt645/result`에서 최신 회차 번호 확인
2. 1회차부터 최신 회차까지 순차 수집
3. 각 회차는 JSON 응답의 `returnValue`가 `success`일 때만 Supabase에 저장
4. 이미 저장된 회차는 `upsert`로 중복 없이 갱신
5. 요청 간 180ms 지연으로 과도한 요청 방지

## 주요 기능

- 메인 페이지 `/`
- 회차 목록 `/draws`
- 회차 상세 `/draw/[drawNo]`
- 통계 페이지 `/stats`
- 번호 생성기 `/generator`
- 정보성 콘텐츠 `/insights/*`
- Supabase Postgres 저장
- Vercel Cron 자동 업데이트
- `sitemap.xml`, `robots.txt` 자동 생성

## 로컬 실행

PowerShell에서 `npm` 실행이 막히면 `npm.cmd`를 사용하세요.

```powershell
npm.cmd install
npm.cmd run dev
```

브라우저에서 아래 주소를 엽니다.

```text
http://localhost:3000
```

## 환경변수

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 넣습니다.

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=replace-with-a-long-random-string
```

환경변수를 만든 뒤에는 개발 서버를 반드시 껐다가 다시 켜야 합니다.

```powershell
Ctrl + C
npm.cmd run dev
```

## Supabase 설정

Supabase SQL Editor에서 아래 파일 내용을 실행합니다.

```text
supabase/schema.sql
```

생성되는 주요 테이블:

- `lotto_draws`: 회차별 당첨번호, 당첨금, 판매금액
- `generated_numbers`: 생성 번호 기록용 테이블

## 초기 백필

메인 페이지 접속만으로는 크롤링이 실행되지 않습니다. 아래 API를 브라우저 주소창에서 직접 호출해야 합니다.

```text
http://localhost:3000/api/admin/backfill?secret=CRON_SECRET&start=1&max=100
```

`CRON_SECRET`은 `.env.local`에 넣은 실제 값으로 바꿔야 합니다.

응답 예시:

```json
{
  "ok": true,
  "saved": 100,
  "latestDrawNo": 1226,
  "stoppedAt": null,
  "nextStart": 101,
  "completed": false
}
```

`nextStart`가 있으면 이어서 호출합니다.

```text
http://localhost:3000/api/admin/backfill?secret=CRON_SECRET&start=101&max=100
```

`completed`가 `true`이고 `nextStart`가 `null`이면 최신 회차까지 저장된 상태입니다.

## 주간 자동 업데이트

`vercel.json`에 Vercel Cron이 설정되어 있습니다.

```json
{
  "crons": [
    {
      "path": "/api/cron/update-lotto",
      "schedule": "30 15 * * 6"
    }
  ]
}
```

Vercel Cron은 UTC 기준입니다. `30 15 * * 6`은 한국 시간 일요일 00:30입니다.

## 배포 순서

1. Supabase 프로젝트 생성
2. `supabase/schema.sql` 실행
3. Vercel 프로젝트 연결
4. Vercel 환경변수 등록
5. 배포 후 `/api/admin/backfill?secret=CRON_SECRET&start=1&max=100`으로 초기 백필
6. `/sitemap.xml`, `/robots.txt` 확인

## Google/Naver 검색 등록

배포 후 실제 검색 노출을 위해 아래 작업을 진행하세요.

1. `NEXT_PUBLIC_SITE_URL`을 실제 도메인으로 변경합니다.
2. Google Search Console에서 사이트를 등록하고 HTML meta 인증값을 `GOOGLE_SITE_VERIFICATION`에 넣습니다.
3. 네이버 서치어드바이저에서 사이트를 등록하고 meta 인증값을 `NAVER_SITE_VERIFICATION`에 넣습니다.
4. Vercel 환경변수 변경 후 재배포합니다.
5. Google Search Console과 네이버 서치어드바이저에 아래 사이트맵을 제출합니다.

```text
https://your-domain.com/sitemap.xml
```

RSS도 생성됩니다.

```text
https://your-domain.com/rss.xml
```

검색 노출은 즉시 반영되지 않을 수 있으며, 검색엔진 수집과 평가에 시간이 걸립니다.

## 주의

본 사이트는 오락 및 통계 참고용입니다. 복권 구매, 베팅, 유료 번호 판매 기능을 제공하지 않습니다.
