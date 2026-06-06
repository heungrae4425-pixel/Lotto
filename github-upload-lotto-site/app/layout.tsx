import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import Disclaimer from "@/components/Disclaimer";
import { absoluteUrl, organizationJsonLd, siteDescription, siteName, webSiteJsonLd } from "@/lib/seo";

const naverVerification = process.env.NAVER_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  keywords: [
    "로또",
    "로또 6/45",
    "로또 당첨번호",
    "로또 회차",
    "로또 통계",
    "로또 번호 생성기",
    "로또 당첨금",
    "로또 보너스 번호"
  ],
  alternates: {
    canonical: absoluteUrl("/")
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: absoluteUrl("/"),
    siteName,
    title: siteName,
    description: siteDescription
  },
  twitter: {
    card: "summary",
    title: siteName,
    description: siteDescription
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: naverVerification ? { "naver-site-verification": naverVerification } : undefined
  },
  other: {
    "format-detection": "telephone=no"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6167691424907514"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-WC5XDJ5ZN2"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WC5XDJ5ZN2');
          `}
        </Script>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([webSiteJsonLd(), organizationJsonLd()]) }}
        />

        <header className="border-b border-slate-200 bg-white">
          <nav className="container-page flex flex-wrap items-center justify-between gap-3 py-4">
            <Link href="/" className="text-lg font-bold text-ink">
              로또 6/45 통계
            </Link>

            <div className="flex flex-wrap gap-3 text-sm text-muted">
              <Link href="/draws" className="font-medium">
                회차 목록
              </Link>
              <Link href="/stats" className="font-medium">
                통계
              </Link>
              <Link href="/generator" className="font-extrabold text-ink">
                번호 생성기
              </Link>
              <Link href="/insights/frequent-numbers" className="font-medium">
                많이 나온 번호
              </Link>
            </div>
          </nav>
        </header>

        <main>{children}</main>

        <footer className="mt-12 border-t border-slate-200 bg-white">
          <div className="container-page grid gap-5 py-8">
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <Link href="/draws">로또 회차별 당첨번호</Link>
              <Link href="/stats">로또 번호 통계</Link>
              <Link href="/generator" className="font-bold text-ink">
                로또번호 생성기
              </Link>
              <Link href="/insights/missing-numbers">미출현 번호</Link>
              <Link href="/insights/odd-even-ratio">홀짝 비율</Link>
              <Link href="/insights/lotto-probability">로또 확률</Link>
            </div>

            <Disclaimer />

            <p className="text-xs text-slate-500">
              복권 구매, 베팅, 유료 번호 판매 기능을 제공하지 않습니다.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
