import type { Config } from "tailwindcss";
const config: Config = {
  content:["./app/**/*.{js,ts,jsx,tsx,mdx}","./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme:{extend:{colors:{brand:"#7057F5",ink:"#191827",muted:"#858397",canvas:"#F7F7FB"},boxShadow:{soft:"0 8px 30px rgba(26,22,54,.06)"}}},
  plugins:[]
};
export default config;