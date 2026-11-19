// Bundles the card and the schedule editor into one module served by the integration.
import { build, context } from "esbuild";

const options = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2022",
  outfile: "../custom_components/heat_zones/frontend/heat-zones-card.js",
  legalComments: "none",
  logLevel: "info",
};

if (process.argv.includes("--watch")) {
  const ctx = await context(options);
  await ctx.watch();
} else {
  await build(options);
}
