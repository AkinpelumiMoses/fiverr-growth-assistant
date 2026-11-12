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
  title:"MILE — Every step has a purpose.",
  description:"MILE connects freelancers to opportunities, collaborators and practical tools that move their work forward."
};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en" suppressHydrationWarning><body className={montserrat.variable}>{children}</body></html>;
}