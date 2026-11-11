import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title:"Fiverr Growth Assistant",
  description:"Understand your Fiverr performance. Improve your gigs. Make smarter growth decisions."
};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>{children}</body></html>;
}