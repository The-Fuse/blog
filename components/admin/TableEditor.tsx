"use client";

import { parseTable } from "@/lib/blocks";

type Grid = { header: string[]; rows: string[][] };

/** Table blocks are stored as `| a | b |` lines. This turns the grid back into that text. */
function serialize(grid: Grid) {
  const cols = grid.header.length;
  const line = (cells: string[]) => {
    const padded = Array.from({ length: cols }, (_, i) => (cells[i] ?? "").replace(/\|/g, "/").trim());
    return `| ${padded.join(" | ")} |`;
  };
  return [line(grid.header), ...grid.rows.map(line)].join("\n");
}

function toGrid(text: string): Grid {
  const parsed = parseTable(text);
  if (!parsed.header.length) {
    return { header: ["Column 1", "Column 2"], rows: [["", ""], ["", ""]] };
  }
  const cols = parsed.header.length;
  const rows = parsed.rows.map((r) => Array.from({ length: cols }, (_, i) => r[i] ?? ""));
  return { header: parsed.header, rows: rows.length ? rows : [Array(cols).fill("")] };
}

export function TableEditor({ value, onChange }: { value: string; onChange: (text: string) => void }) {
  const grid = toGrid(value);
  const cols = grid.header.length;
  const commit = (next: Grid) => onChange(serialize(next));

  const setHeader = (c: number, text: string) => {
    const header = [...grid.header];
    header[c] = text;
    commit({ ...grid, header });
  };
  const setCell = (r: number, c: number, text: string) => {
    const rows = grid.rows.map((row) => [...row]);
    rows[r][c] = text;
    commit({ ...grid, rows });
  };
  const addRow = () => commit({ ...grid, rows: [...grid.rows, Array(cols).fill("")] });
  const removeRow = (r: number) => {
    if (grid.rows.length <= 1) return;
    commit({ ...grid, rows: grid.rows.filter((_, i) => i !== r) });
  };
  const addColumn = () =>
    commit({ header: [...grid.header, `Column ${cols + 1}`], rows: grid.rows.map((row) => [...row, ""]) });
  const removeColumn = (c: number) => {
    if (cols <= 1) return;
    commit({ header: grid.header.filter((_, i) => i !== c), rows: grid.rows.map((row) => row.filter((_, i) => i !== c)) });
  };

  return (
    <div className="tbl-edit">
      <div className="tbl-edit-scroll">
        <table>
          <thead>
            <tr>
              {grid.header.map((h, c) => (
                <th key={c}>
                  <div className="tbl-edit-cell">
                    <input
                      value={h}
                      onChange={(e) => setHeader(c, e.target.value)}
                      placeholder={`Column ${c + 1}`}
                      aria-label={`Column ${c + 1} heading`}
                    />
                    <button
                      type="button"
                      className="ghost tbl-edit-x"
                      title="Remove this column"
                      disabled={cols <= 1}
                      onClick={() => removeColumn(c)}
                    >
                      ✕
                    </button>
                  </div>
                </th>
              ))}
              <th className="tbl-edit-rowtool" />
            </tr>
          </thead>
          <tbody>
            {grid.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c}>
                    <input
                      value={cell}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      placeholder={c === 0 ? "Row heading" : "…"}
                      aria-label={`Row ${r + 1}, column ${c + 1}`}
                    />
                  </td>
                ))}
                <td className="tbl-edit-rowtool">
                  <button
                    type="button"
                    className="ghost tbl-edit-x"
                    title="Remove this row"
                    disabled={grid.rows.length <= 1}
                    onClick={() => removeRow(r)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="tbl-edit-actions mono-sm">
        <button type="button" className="ghost" onClick={addRow}>+ Add row</button>
        <button type="button" className="ghost" onClick={addColumn}>+ Add column</button>
        <span style={{ color: "var(--ink-3)", marginLeft: "auto" }}>
          {cols} {cols === 1 ? "column" : "columns"} · {grid.rows.length} {grid.rows.length === 1 ? "row" : "rows"}
          {cols > 3 ? " · scroll sideways to see all columns" : ""}
        </span>
      </div>
    </div>
  );
}
