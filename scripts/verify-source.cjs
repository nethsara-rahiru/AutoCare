const fs = require("node:fs");
const path = require("node:path");
const parser = require("@babel/parser");
let count = 0;
function inspect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) inspect(file);
    else if (file.endsWith(".js")) {
      const text = fs.readFileSync(file, "utf8");
      const ast = parser.parse(text, {
        sourceType: "module",
        plugins: ["jsx"],
      });
      if (
        /\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\s*\(|https?:\/\//.test(
          text,
        )
      )
        throw new Error(`Runtime network dependency found: ${file}`);
      for (const node of ast.program.body) {
        if (
          node.type === "ImportDeclaration" &&
          node.source.value.startsWith(".")
        ) {
          const base = path.resolve(path.dirname(file), node.source.value);
          if (
            ![base, `${base}.js`, path.join(base, "index.js")].some(
              (candidate) => fs.existsSync(candidate),
            )
          )
            throw new Error(`Missing import in ${file}: ${node.source.value}`);
        }
      }
      count++;
    }
  }
}
inspect("app");
inspect("src");
console.log(
  `PASS: ${count} source files parse, relative imports resolve, and no runtime HTTP/WebSocket clients or remote URLs were found.`,
);
