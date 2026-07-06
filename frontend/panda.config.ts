import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import slate from "@park-ui/panda-preset/colors/slate";
import blue from "@park-ui/panda-preset/colors/blue";

export default defineConfig({
  preflight: true,

  presets: [
    createPreset({
      accentColor: blue,
      grayColor: slate,
      radius: "md",
    }),
  ],

  include: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./store/**/*.{js,jsx,ts,tsx}",
  ],

  exclude: [],

  outdir: "styled-system",
});
