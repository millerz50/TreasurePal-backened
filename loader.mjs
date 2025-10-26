// loader.mjs
import { createRequire } from "module";
const require = createRequire(import.meta.url);

require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    module: "ESNext",
  },
});

await import("./src/index.ts");
