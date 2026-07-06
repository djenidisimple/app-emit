import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const config = {
  plugins: {
    "@pandacss/dev/postcss": {},
  },
};

export default config;
