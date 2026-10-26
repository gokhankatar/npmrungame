export type GameExportRow = {
  name?: string;
  released?: string;
  metacritic?: number | null;
  playtime?: number | null;
  genres?: { name?: string }[];
  platforms?: { platform?: { name?: string } }[];
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

const escapeCsv = (value: unknown) => {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const rowsFromGames = (games: GameExportRow[]) =>
  games.map((g) => ({
    name: g.name || "—",
    released: g.released || "—",
    metacritic: g.metacritic ?? "—",
    playtime: g.playtime != null ? `${g.playtime} saat` : "—",
    genres: (g.genres ?? []).map((x) => x.name).filter(Boolean).join(", ") || "—",
    platforms:
      (g.platforms ?? [])
        .map((p) => p.platform?.name)
        .filter(Boolean)
        .join(", ") || "—",
  }));

/** Excel’in açtığı CSV (UTF-8 BOM) */
export function exportGamesExcel(games: GameExportRow[], fileName: string) {
  const rows = rowsFromGames(games);
  const header = ["Oyun", "Çıkış", "Metacritic", "Süre", "Türler", "Platformlar"];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [r.name, r.released, r.metacritic, r.playtime, r.genres, r.platforms]
        .map(escapeCsv)
        .join(",")
    ),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  downloadBlob(blob, `${fileName}.csv`);
}

/** Yazdırılabilir HTML → kullanıcı PDF olarak kaydedebilir */
export function exportGamesPdf(
  games: GameExportRow[],
  opts: { title: string; fileName: string }
) {
  const rows = rowsFromGames(games);
  const generated = new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  const tableRows = rows
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(String(r.released))}</td>
        <td>${escapeHtml(String(r.metacritic))}</td>
        <td>${escapeHtml(String(r.playtime))}</td>
        <td>${escapeHtml(r.genres)}</td>
        <td>${escapeHtml(r.platforms)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(opts.title)}</title>
  <style>
    body { font-family: Montserrat, system-ui, sans-serif; color: #0f172a; margin: 24px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .meta { color: #64748b; font-size: 12px; margin-bottom: 18px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: #ecfdf5; color: #065f46; }
    @media print { body { margin: 12px; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(opts.title)}</h1>
  <p class="meta">${escapeHtml(generated)} · ${rows.length} oyun · npmrungame</p>
  <table>
    <thead>
      <tr>
        <th>Oyun</th><th>Çıkış</th><th>Metacritic</th><th>Süre</th><th>Türler</th><th>Platformlar</th>
      </tr>
    </thead>
    <tbody>${tableRows || `<tr><td colspan="6">Liste boş</td></tr>`}</tbody>
  </table>
  <script>window.onload = () => { window.print(); };<\/script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    downloadBlob(blob, `${opts.fileName}.html`);
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
