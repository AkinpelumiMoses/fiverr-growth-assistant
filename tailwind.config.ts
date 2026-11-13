import type { Config } from "tailwindcss";
const config: Config = {
  content:["./app/**/*.{js,ts,jsx,tsx,mdx}","./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme:{extend:{colors:{brand:"#00A525",brandYellow:"#C6C304",ink:"#111311",muted:"#68716A",canvas:"#FAFBF9"},boxShadow:{soft:"0 8px 30px rgba(17,19,17,.06)"}}},
  plugins:[]
};
export default config;