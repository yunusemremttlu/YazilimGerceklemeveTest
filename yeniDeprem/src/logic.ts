import { z } from "zod";
import type { ActionTask, Conversation, Priority } from "./data";

export const analysisSchema = z.object({
  sentiment: z.enum(["Olumlu", "Nötr", "Olumsuz"]),
  category: z.string().min(1),
  issue: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export function analyzeMessage(message: string): Pick<Conversation, "sentiment" | "category" | "issue" | "confidence" | "evidence" | "friction" | "urgency" | "feature"> {
  const text = message.toLocaleLowerCase("tr-TR");
  const rules: Array<{ pattern: RegExp; category: string; issue: string }> = [
    { pattern: /kargo|sipariş|teslim|dağıtım/, category: "Teslimat", issue: "Sipariş teslimatında gecikme" },
    { pattern: /ödeme|kart|ücret|çekildi/, category: "Ödeme", issue: "Ödeme sırasında hata" },
    { pattern: /fatura|abonelik|paket|iptal/, category: "Faturalandırma", issue: "Faturalandırma veya abonelik sorusu" },
    { pattern: /randevu|takvim/, category: "Randevu", issue: "Randevu işlemi sorunu" },
    { pattern: /ekle|ols[au]|istiyorum|edebilsek|özellik/, category: "Özellik talebi", issue: "Ürün özelliği talebi" },
    { pattern: /şifre|giriş|hesap/, category: "Hesap", issue: "Hesap erişimi sorunu" },
  ];
  const selected = rules.find((rule) => rule.pattern.test(text));
  const negative = /yok|değil|hata|çalışm|gelm|gecik|dönüş|sorun|iptal|ulaşmad|çekildi|3 kere|üç kere/.test(text);
  const positive = /teşekkür|harika|kolay|memnun|başarılı|güzel/.test(text);
  const feature = selected?.category === "Özellik talebi" ? message.trim().replace(/[.!?]+$/, "") : undefined;
  const sentiment = negative ? "Olumsuz" : positive ? "Olumlu" : "Nötr";
  return {
    sentiment,
    category: selected?.category ?? "Genel geri bildirim",
    issue: selected?.issue ?? "Genel müşteri geri bildirimi",
    confidence: selected ? 0.78 : 0.55,
    evidence: message.trim(),
    friction: negative ? "Müşteri mesajında çözüm bekleyen bir durum belirtiliyor" : "Belirgin sürtünme sinyali yok",
    urgency: /acil|3 kere|üç kere|çekildi|ulaşmad/.test(text) ? "Yüksek" : negative ? "Orta" : "Düşük",
    ...(feature ? { feature } : {}),
  };
}

export interface IssueInsight {
  title: string;
  category: string;
  count: number;
  priority: Priority;
  score: number;
  conversations: Conversation[];
  summary: string;
}

export function clusterIssues(conversations: Conversation[]): IssueInsight[] {
  const groups = new Map<string, Conversation[]>();
  for (const conversation of conversations) {
    const group = groups.get(conversation.issue) ?? [];
    group.push(conversation);
    groups.set(conversation.issue, group);
  }
  return [...groups.entries()].map(([title, items]) => {
    const urgent = items.filter((item) => item.urgency === "Yüksek").length;
    const recency = items.filter((item) => Date.now() - new Date(item.date).getTime() < 7 * 86400000).length;
    const score = Math.round(Math.min(100, items.length * 12 + urgent * 15 + recency * 3));
    const priority: Priority = score >= 55 ? "Yüksek" : score >= 25 ? "Orta" : "Düşük";
    return {
      title,
      category: items[0].category,
      count: items.length,
      priority,
      score,
      conversations: items,
      summary: items.length < 3 ? "Sınırlı sayıda konuşma var; eğilim için daha fazla veri gerekli." : `${items.length} konuşmada tekrar eden müşteri sinyali.`,
    };
  }).sort((a, b) => b.score - a.score);
}

export function parseCsv(content: string): { rows: string[][]; errors: string[] } {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < content.length; index++) {
    const char = content[index];
    if (char === '"' && quoted && content[index + 1] === '"') { field += '"'; index++; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(field); field = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && content[index + 1] === "\n") index++;
      row.push(field); field = "";
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
    } else field += char;
  }
  if (quoted) return { rows: [], errors: ["CSV dosyasında kapatılmamış çift tırnak bulundu."] };
  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return { rows, errors: [] };
}

export function escapeCsv(value: string | number): string {
  let safe = String(value);
  if (/^[\s]*[=+\-@]/.test(safe)) safe = `'${safe}`;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function exportConversations(conversations: Conversation[]): string {
  const header = ["Konuşma ID", "Tarih", "Kanal", "Mesaj", "Duygu", "Kategori", "Bölge", "Güven"];
  return [header, ...conversations.map((item) => [item.id, item.date, item.channel, item.message, item.sentiment, item.category, item.region ?? "", item.confidence])]
    .map((row) => row.map(escapeCsv).join(",")).join("\r\n");
}

export function persistTasks(tasks: ActionTask[]): void {
  localStorage.setItem("diyalogradar.tasks", JSON.stringify(tasks));
}
