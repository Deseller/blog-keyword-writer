# 📊 블로그 키워드 생성기

네이버 트렌드 기반으로 인기 키워드를 자동 수집하고, AI가 블로그 글을 자동으로 작성해주는 도구입니다.

---

## ✨ 주요 기능

- 🔍 네이버 데이터랩 기반 인기 키워드 자동 수집
- 🤖 Gemini AI로 SEO 최적화 블로그 글 자동 생성
- ✏️ 웹 화면에서 제목/본문/태그 수정
- 💾 파일 저장 및 클립보드 복사

---

## 🛠️ 사전 준비

### 1. Node.js 설치
👉 [https://nodejs.org](https://nodejs.org) 접속  
→ 왼쪽 **LTS 버전** 다운로드 → 설치 (계속 "다음" 클릭)

### 2. Git 설치
👉 [https://git-scm.com](https://git-scm.com) 접속  
→ **Download for Windows** 클릭 → 설치 (계속 "다음" 클릭)

### 3. API 키 발급

**네이버 API 키** (무료)
1. [https://developers.naver.com](https://developers.naver.com) 접속 → 로그인
2. **Application 등록** 클릭
3. 사용 API에서 **데이터랩(검색어트렌드)** 선택
4. 환경 추가 → **WEB 설정** → URL: `http://localhost`
5. `CLIENT_ID`와 `CLIENT_SECRET` 복사

**Gemini API 키** (무료)
1. [https://aistudio.google.com](https://aistudio.google.com) 접속 → 구글 계정 로그인
2. 왼쪽 **Get API key** 클릭
3. **Create API key** 클릭 → 키 복사

---

## 🚀 설치 방법

CMD(명령 프롬프트)를 열고 아래 명령어를 순서대로 실행하세요:

```bash
git clone https://github.com/Deseller/blog-keyword-writer.git
cd blog-keyword-writer
npm install
```

---

## ⚙️ 설정 방법

`server.js` 파일을 메모장으로 열어서 상단 3줄을 수정하세요:

```js
const NAVER_CLIENT_ID = "여기에 네이버 CLIENT_ID 입력";
const NAVER_CLIENT_SECRET = "여기에 네이버 CLIENT_SECRET 입력";
const GEMINI_API_KEY = "여기에 Gemini API 키 입력";
```

저장 후 닫으세요.

---

## ▶️ 실행 방법

```bash
node server.js
```

브라우저에서 👉 [http://localhost:3001](http://localhost:3001) 접속

---

## 📖 사용 방법

1. **트렌드 분석 시작** 버튼 클릭 → 인기 키워드 목록 로드
2. 원하는 키워드 클릭 → AI가 블로그 글 자동 생성
3. 제목/본문/태그 원하는 대로 수정
4. **복사** 버튼으로 클립보드에 복사하거나 **파일 저장** 클릭
5. 네이버 블로그에 붙여넣기 후 발행

---

## ⚠️ 주의사항

- API 키는 절대 다른 사람과 공유하지 마세요
- 네이버 블로그 어뷰징 방지를 위해 하루 2~3개 발행을 권장합니다
- Gemini API는 무료 티어 기준 하루 최대 수십 회 호출 가능합니다

---

## 📝 라이선스

MIT License
