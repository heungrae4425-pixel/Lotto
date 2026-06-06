import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const drawNo = Number(new URL(request.url).searchParams.get("drawNo") || 1);
  const source = new URL(request.url).searchParams.get("source") || "result";
  if (source === "api") {
    const response = await fetch(`https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do?srchLtEpsd=${drawNo}`, {
      cache: "no-store",
      headers: {
        "user-agent": "Mozilla/5.0 lotto-645-content-site/1.0",
        accept: "application/json,text/plain,*/*",
        referer: `https://www.dhlottery.co.kr/lt645/result?drwNo=${drawNo}`
      }
    });
    const text = await response.text();
    return NextResponse.json({
      status: response.status,
      contentType: response.headers.get("content-type"),
      length: text.length,
      sample: text.slice(0, 2000)
    });
  }
  const url =
    source === "common"
      ? `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drawNo}`
      : `https://www.dhlottery.co.kr/lt645/result?drwNo=${drawNo}`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "user-agent": "Mozilla/5.0 lotto-645-content-site/1.0",
      accept: "application/json,text/plain,*/*"
    }
  });
  const text = await response.text();
  const sample = text.slice(0, 1000);
  const snippets = ["win_result", "ball_645", "당첨번호", "1등", "총판매금액", "ajax", "url:", "select", "lt645", "selectPstLt645InfoNew"].map((keyword) => {
    const index = text.indexOf(keyword);
    return {
      keyword,
      index,
      sample: index >= 0 ? text.slice(Math.max(0, index - 300), index + 900) : ""
    };
  });

  return NextResponse.json({
    status: response.status,
    contentType: response.headers.get("content-type"),
    length: text.length,
    firstCharCodes: text.slice(0, 20).split("").map((char) => char.charCodeAt(0)),
    sample,
    hasReturnValue: text.includes("returnValue"),
    hasSuccess: /success/i.test(text),
    hasDrwNo: /drwNo/i.test(text),
    hasDrwtNo1: /drwtNo1/i.test(text),
    drwNoMatch: text.match(/["']?drwNo["']?\s*:\s*([0-9]+)/)?.[1] || null,
    drwtNo1Match: text.match(/["']?drwtNo1["']?\s*:\s*([0-9]+)/)?.[1] || null,
    returnValueMatch: text.match(/["']?returnValue["']?\s*:\s*["']?([^"',\n\r}]+)/)?.[1] || null,
    snippets,
    doPaths: Array.from(new Set(Array.from(text.matchAll(/["'](\/[^"']+\.do)["']/g)).map((match) => match[1]))).slice(0, 80),
    jsonPaths: Array.from(new Set(Array.from(text.matchAll(/["'](\/[^"']+json[^"']*)["']/gi)).map((match) => match[1]))).slice(0, 80)
  });
}
