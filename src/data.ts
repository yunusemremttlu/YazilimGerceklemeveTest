export type Sentiment = "Olumlu" | "Nötr" | "Olumsuz";
export type Priority = "Yüksek" | "Orta" | "Düşük";
export type TaskStatus = "Yapılacak" | "Devam Ediyor" | "İncelemede" | "Tamamlandı";

export interface Conversation {
  id: string;
  date: string;
  channel: string;
  message: string;
  sentiment: Sentiment;
  category: string;
  region?: string;
  confidence: number;
  issue: string;
  friction: string;
  evidence: string;
  feature?: string;
  urgency: Priority;
}

export interface ActionTask {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  assignee: string;
  dueDate: string;
  sourceIssue?: string;
}

const today = new Date();
const daysAgo = (days: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const samples: Omit<Conversation, "date">[] = [
  { id: "DR-1048", channel: "WhatsApp", message: "3 kere yazdım hâlâ dönüş yok, sipariş de ortada yok.", sentiment: "Olumsuz", category: "Teslimat", region: "İstanbul", confidence: 0.96, issue: "Sipariş teslimatında gecikme", friction: "Tekrarlanan iletişim ve yanıtsız destek", evidence: "3 kere yazdım hâlâ dönüş yok", urgency: "Yüksek" },
  { id: "DR-1047", channel: "E-posta", message: "Kargom iki gündür dağıtımda görünüyor, ne zaman gelir?", sentiment: "Olumsuz", category: "Teslimat", region: "İzmir", confidence: 0.91, issue: "Sipariş teslimatında gecikme", friction: "Belirsiz teslimat süresi", evidence: "iki gündür dağıtımda görünüyor", urgency: "Orta" },
  { id: "DR-1046", channel: "Canlı destek", message: "Sipariş takibi güncellenmiyor, kargo nerede acaba?", sentiment: "Olumsuz", category: "Teslimat", region: "Ankara", confidence: 0.89, issue: "Sipariş teslimatında gecikme", friction: "Güncel olmayan sipariş takibi", evidence: "Sipariş takibi güncellenmiyor", urgency: "Orta" },
  { id: "DR-1045", channel: "WhatsApp", message: "Uygulamaya parmak iziyle giriş ekleyebilir misiniz?", sentiment: "Nötr", category: "Özellik talebi", region: "İstanbul", confidence: 0.94, issue: "Biyometrik giriş talebi", friction: "Hızlı giriş seçeneği eksik", evidence: "parmak iziyle giriş ekleyebilir misiniz", feature: "Biyometrik giriş", urgency: "Düşük" },
  { id: "DR-1044", channel: "Uygulama yorumu", message: "Her ödeme yaparken hata veriyo, kartımdan çekildi ama sipariş oluşmadı.", sentiment: "Olumsuz", category: "Ödeme", region: "Bursa", confidence: 0.97, issue: "Ödeme sırasında hata", friction: "Başarısız işlem ve belirsiz tahsilat", evidence: "kartımdan çekildi ama sipariş oluşmadı", urgency: "Yüksek" },
  { id: "DR-1043", channel: "E-posta", message: "Ödeme ekranında sürekli hata alıyorum. Yardımcı olur musunuz?", sentiment: "Olumsuz", category: "Ödeme", region: "İstanbul", confidence: 0.88, issue: "Ödeme sırasında hata", friction: "Ödeme işlemi tamamlanamıyor", evidence: "Ödeme ekranında sürekli hata", urgency: "Orta" },
  { id: "DR-1042", channel: "Canlı destek", message: "Aboneliğimi iptal ettim ama bu ay da ücret kesilmiş.", sentiment: "Olumsuz", category: "Faturalandırma", region: "Ankara", confidence: 0.93, issue: "Abonelik iptali sonrası ücret", friction: "İptal sonrası beklenmeyen tahsilat", evidence: "bu ay da ücret kesilmiş", urgency: "Yüksek" },
  { id: "DR-1041", channel: "E-posta", message: "Raporları Excel olarak indirebilsek çok işimize yarar.", sentiment: "Nötr", category: "Özellik talebi", region: "İzmir", confidence: 0.92, issue: "Rapor dışa aktarma talebi", friction: "Rapor indirme seçeneği eksik", evidence: "Excel olarak indirebilsek", feature: "Excel rapor dışa aktarma", urgency: "Düşük" },
  { id: "DR-1040", channel: "WhatsApp", message: "Randevumu değiştirmek istiyorum ama takvim açılmıyor.", sentiment: "Olumsuz", category: "Randevu", region: "Antalya", confidence: 0.9, issue: "Randevu takvimi açılmıyor", friction: "Randevu değişikliği yapılamıyor", evidence: "takvim açılmıyor", urgency: "Orta" },
  { id: "DR-1039", channel: "Canlı destek", message: "Ürününüzü kullanmak çok kolay, ekibiniz de hemen yardımcı oldu. Teşekkürler!", sentiment: "Olumlu", category: "Genel geri bildirim", region: "İstanbul", confidence: 0.98, issue: "Hızlı ve yardımcı destek", friction: "Belirgin sorun yok", evidence: "hemen yardımcı oldu", urgency: "Düşük" },
  { id: "DR-1038", channel: "Uygulama yorumu", message: "şifre sıfırlama maili gelmiyo, spamde de yok", sentiment: "Olumsuz", category: "Hesap", region: "Eskişehir", confidence: 0.85, issue: "Şifre sıfırlama e-postası ulaşmıyor", friction: "Hesaba yeniden erişilemiyor", evidence: "maili gelmiyo", urgency: "Orta" },
  { id: "DR-1037", channel: "WhatsApp", message: "Canlı destek hafta sonu da açık olsa harika olur.", sentiment: "Nötr", category: "Özellik talebi", region: "İstanbul", confidence: 0.87, issue: "Hafta sonu destek talebi", friction: "Hafta sonu destek kapsamı sınırlı", evidence: "hafta sonu da açık olsa", feature: "Hafta sonu canlı destek", urgency: "Düşük" },
  { id: "DR-1036", channel: "E-posta", message: "Siparişim teslim edildi yazıyor ama bana ulaşmadı, acil dönüş bekliyorum.", sentiment: "Olumsuz", category: "Teslimat", region: "İzmir", confidence: 0.95, issue: "Sipariş teslimatında gecikme", friction: "Teslimat kaydı ile gerçek durum uyuşmuyor", evidence: "bana ulaşmadı", urgency: "Yüksek" },
  { id: "DR-1035", channel: "Canlı destek", message: "Kullanımı basit, kurulumda hiç zorlanmadım.", sentiment: "Olumlu", category: "Genel geri bildirim", region: "Bursa", confidence: 0.91, issue: "Kolay ürün kurulumu", friction: "Belirgin sorun yok", evidence: "hiç zorlanmadım", urgency: "Düşük" },
  { id: "DR-1034", channel: "WhatsApp", message: "Faturamı şirket adına düzenleyebiliyor muyuz?", sentiment: "Nötr", category: "Faturalandırma", confidence: 0.89, issue: "Kurumsal fatura bilgisi", friction: "Fatura süreci hakkında bilgi ihtiyacı", evidence: "şirket adına düzenleyebiliyor muyuz", urgency: "Düşük" },
  { id: "DR-1033", channel: "Uygulama yorumu", message: "Randevu saatini değiştirme butonu çalışmıyor, yardımcı olur musunuz?", sentiment: "Olumsuz", category: "Randevu", region: "Antalya", confidence: 0.93, issue: "Randevu takvimi açılmıyor", friction: "Randevu değişikliği yapılamıyor", evidence: "butonu çalışmıyor", urgency: "Orta" },
  { id: "DR-1032", channel: "E-posta", message: "Analiz sayfasında tarih aralığı seçebilmek istiyoruz.", sentiment: "Nötr", category: "Özellik talebi", region: "Ankara", confidence: 0.9, issue: "Tarih aralığı filtresi talebi", friction: "Analiz dönemi seçilemiyor", evidence: "tarih aralığı seçebilmek istiyoruz", feature: "Tarih aralığı filtresi", urgency: "Düşük" },
  { id: "DR-1031", channel: "WhatsApp", message: "Paketimi düşürdüm ama eski plandan fatura kesildi, kontrol eder misiniz?", sentiment: "Olumsuz", category: "Faturalandırma", region: "İstanbul", confidence: 0.9, issue: "Abonelik iptali sonrası ücret", friction: "Plan değişikliğinin faturaya yansımaması", evidence: "eski plandan fatura kesildi", urgency: "Orta" },
];

export const createDemoConversations = (): Conversation[] =>
  samples.map((sample, index) => ({ ...sample, date: daysAgo((index * 2) % 28) }));

export const initialTasks: ActionTask[] = [
  { id: "task-demo-1", title: "Teslimat gecikmesi akışını incele", description: "Tekrarlanan teslimat ve takip şikâyetlerinin kaynağını belirle.", priority: "Yüksek", status: "Devam Ediyor", assignee: "Destek ekibi", dueDate: daysAgo(-3).slice(0, 10), sourceIssue: "Sipariş teslimatında gecikme" },
  { id: "task-demo-2", title: "Ödeme hata kayıtlarını kontrol et", description: "Ödeme sırasında hata alan müşterilerin kayıtlarını incele.", priority: "Yüksek", status: "Yapılacak", assignee: "Ürün ekibi", dueDate: daysAgo(-5).slice(0, 10), sourceIssue: "Ödeme sırasında hata" },
];
