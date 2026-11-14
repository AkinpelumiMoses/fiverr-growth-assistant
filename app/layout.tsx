import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import BrandLoader from "./components/brand-loader";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});
export const metadata: Metadata = {
  title:"MILE — Every step has a purpose.",
  description:"MILE connects freelancers to opportunities, collaborators and practical tools that move their work forward.",
  icons:{icon:"https://i.pinimg.com/736x/fd/1f/37/fd1f37539891a4a17d8ea3f0e10f420b.jpg",shortcut:"https://i.pinimg.com/736x/fd/1f/37/fd1f37539891a4a17d8ea3f0e10f420b.jpg",apple:"https://i.pinimg.com/736x/fd/1f/37/fd1f37539891a4a17d8ea3f0e10f420b.jpg"}
};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en" suppressHydrationWarning><body className={montserrat.variable}><BrandLoader />{children}</body></html>;
}