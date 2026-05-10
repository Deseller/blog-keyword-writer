const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// ✅ 여기에 키 입력
const NAVER_CLIENT_ID = "DoBnbcXCzgORKubDuKDB";
const NAVER_CLIENT_SECRET = "GYVJGZA3ZY";
const GEMINI_API_KEY = "AIzaSyBD7bIoxoqKdbZiD62F61Mk9kXq8h57KEw";

// 후보 키워드 목록 (원하는 주제로 바꾸세요)
const CANDIDATE_KEYWORDS = [
  "뷰티", "스킨케어", "선크림", "에센스", "토너",
  "생활용품", "주방용품", "청소용품", "수납정리", "홈인테리어"
];

// ============================================
// 네이버 키워드 트렌드 분석
// ============================================
function naverApiCall(body) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "openapi.naver.com",
        path: "/v1/datalab/search",
        method: "POST",
        headers: {
          "X-Naver-Client-Id": NAVER_CLIENT_ID,
          "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
          "Content-Type": "application/json",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve(JSON.parse(data)));
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function getToday() { return new Date().toISOString().split("T")[0]; }
function getDateBefore(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ============================================
// Gemini AI 글 생성
// ============================================
function geminiApiCall(body) {
  const model = "gemini-3-flash-preview";
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "generativelanguage.googleapis.com",
        path: `/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve(JSON.parse(data)));
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ============================================
// API: 키워드 트렌드 분석
// ============================================
app.get("/api/keywords", async (req, res) => {
  try {
    const results = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < CANDIDATE_KEYWORDS.length; i += BATCH_SIZE) {
      const batch = CANDIDATE_KEYWORDS.slice(i, i + BATCH_SIZE);
      const keywordGroups = batch.map((kw) => ({ groupName: kw, keywords: [kw] }));

      const body = JSON.stringify({
        startDate: getDateBefore(7),
        endDate: getToday(),
        timeUnit: "date",
        keywordGroups,
      });

      const data = await naverApiCall(body);
      if (data.results) {
        data.results.forEach((result) => {
          const avg = result.data.reduce((s, d) => s + d.ratio, 0) / result.data.length;
          results.push({ keyword: result.title, score: Math.round(avg * 10) / 10 });
        });
      }
      if (i + BATCH_SIZE < CANDIDATE_KEYWORDS.length) await sleep(500);
    }

    results.sort((a, b) => b.score - a.score);
    res.json({ success: true, keywords: results });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ============================================
// API: AI 블로그 글 생성
// ============================================
app.post("/api/generate", async (req, res) => {
  const { keyword } = req.body;
  if (!keyword) return res.json({ success: false, error: "키워드를 입력하세요." });

  try {
    const prompt = `
당신은 네이버 블로그 상위 노출 전문가입니다.
키워드 "${keyword}"로 네이버 블로그 글을 작성해주세요.

[제목 규칙]
- 키워드 반드시 포함
- 검색 노출을 위한 키워드 자연스럽게 포함
- 반드시 명사형으로 마무리 (예: ~후기, ~정리, ~추천, ~방법, ~효과)
- 물음표, 말줄임표, 느낌표, 이모지 절대 금지
- 25~35자 내외

[본문 스타일]
- 전문적이고 신뢰감 있는 블로그 리뷰 스타일
- 경어체 사용 (예: ~합니다, ~입니다, ~해요)
- 실제 사용자 후기처럼 자연스럽게
- 소제목(##)으로 구분하여 가독성 높게
- 분량: 1500자 이상

[출력 형식 - JSON으로만, 코드블록 없이]
{"title":"제목","content":"본문전체","tags":["태그1","태그2","태그3","태그4","태그5"]}
`;

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 8192 },
    });

    const data = await geminiApiCall(body);
    const text = data.candidates[0].content.parts[0].text;
    const clean = text.replace(/```json|```/g, "").trim();
    const post = JSON.parse(clean);

    res.json({ success: true, post });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ============================================
// API: 파일 저장
// ============================================
app.post("/api/save", (req, res) => {
  const { title, content, tags, keyword } = req.body;
  const today = getToday();
  const safeKeyword = keyword.replace(/[^가-힣a-zA-Z0-9]/g, "_").slice(0, 20);
  const fileName = `post_${today}_${safeKeyword}.md`;
  const outputDir = path.join(__dirname, "output_posts");

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const mdContent = `---
제목: ${title}
키워드: ${keyword}
작성일: ${today}
태그: ${tags.join(", ")}
---

# ${title}

${content}
`;

  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, mdContent, "utf-8");
  res.json({ success: true, filePath });
});

app.listen(3001, () => {
  console.log("✅ 블로그 키워드 생성기 실행 중: http://localhost:3001");
});
