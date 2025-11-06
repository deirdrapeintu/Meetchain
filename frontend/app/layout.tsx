import "./globals.css";
import React from "react";
import { AppProviders } from "@/src/app-providers";

export const metadata = {
  title: "MeetChain - Web3 聚会签到",
  description: "On-chain attendance with FHE privacy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}


