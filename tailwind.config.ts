import type { Config } from "tailwindcss";
const config: Config = {
  content:["./app/**/*.{js,ts,jsx,tsx,mdx}","./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme:{extend:{colors:{brand:"#25215C",brandYellow:"#B8E94E",indigo:"#25215C",lime:"#B8E94E",ink:"#111318",muted:"#626274",canvas:"#FFFFFF"},boxShadow:{soft:"0 8px 30px rgba(17,19,17,.06)"}}},
  plugins:[]
};
export default config;