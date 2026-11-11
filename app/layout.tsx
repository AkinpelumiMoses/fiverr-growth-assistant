import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});
export const metadata: Metadata = {
  title:"Fiverr Growth Assistant",
  description:"Understand your Fiverr performance. Improve your gigs. Make smarter growth decisions."
};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en" suppressHydrationWarning><body className={montserrat.variable}>{children}</body></html>;
}