import { describe, expect, it } from "vitest";
import { analyzeMessage, clusterIssues, escapeCsv, parseCsv } from "./logic";
import type { Conversation } from "./data";

describe("demo analysis", () => {
  it("recognizes informal Turkish delivery complaints", () => {
    expect(analyzeMessage("3 kere yazdım kargom hâlâ gelmiyo").category).toBe("Teslimat");
    expect(analyzeMessage("3 kere yazdım kargom hâlâ gelmiyo").sentiment).toBe("Olumsuz");
  });
  it("parses quoted CSV values with commas and Turkish characters", () => {
    expect(parseCsv('mesaj,kanal\n"İade, lütfen","E-posta"').rows[1]).toEqual(["İade, lütfen", "E-posta"]);
    expect(parseCsv('"açık').errors).toHaveLength(1);
  });
  it("protects exported cells from spreadsheet formulas", () => {
    expect(escapeCsv("=1+1")).toBe("\"'=1+1\"");
  });
  it("groups issues and cautions on small samples", () => {
    const result = clusterIssues([
      { issue: "Teslimat", category: "Teslimat", urgency: "Orta", date: new Date().toISOString() },
    ] as Conversation[]);
    expect(result[0].summary).toContain("Sınırlı");
  });
});
