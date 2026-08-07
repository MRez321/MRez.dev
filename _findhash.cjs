const fs = require("fs");
const s = fs.readFileSync("node_modules/drizzle-kit/bin.cjs", "utf8");
console.log(s.slice(707500, 711500));
