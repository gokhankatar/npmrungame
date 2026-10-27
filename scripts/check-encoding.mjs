import fs from "node:fs";

const files = [
  "C:/Repositories/npmrungame/app/components/user/User_Current_Games.vue",
  "C:/Repositories/npmrungame/app/components/panel/PanelPageTitle.vue",
];

for (const p of files) {
  const buf = fs.readFileSync(p);
  const t = buf.toString("utf8");
  const idx = t.indexOf("PanelPageTitle") >= 0 ? t.indexOf('text="') : -1;
  console.log("\n==", p.split("/").pop());
  console.log("has replacement char", t.includes("\uFFFD"));
  const m = t.match(/text="([^"]+)"/);
  if (m) {
    console.log("text attr:", m[1]);
    console.log(
      "codepoints:",
      [...m[1]].map((c) => c + " U+" + c.codePointAt(0).toString(16)).join(" | ")
    );
  }
  // Şu an line specifically
  const line = t.split(/\r?\n/).find((l) => l.includes("oynad"));
  if (line) {
    console.log("line:", line.trim());
    console.log(
      "bytes around title:",
      Buffer.from(line, "utf8").subarray(0, 80).toString("hex")
    );
  }
}
