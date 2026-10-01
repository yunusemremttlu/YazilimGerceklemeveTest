import React, { useEffect, useMemo, useState } from "react";

const games = [
  { id: 1, title: "Rota Hafızası", category: "Hafıza", skill: "Çalışma belleği", icon: "⌁", color: "violet", kind: "sequence", prompt: "Rotadaki sıradaki yön hangisi?", stimulus: ["↑", "→", "↓", "←", "↑", "?"], choices: ["↑", "→", "↓", "←"], answer: "→", feature: "Her turda bir yön daha eklenen canlı rota" },
  { id: 2, title: "Sayı Yankısı", category: "Hafıza", skill: "Sayı hafızası", icon: "◉", color: "blue", kind: "input", prompt: "Sayı dizisini aklında tut: 4 · 8 · 2 · 6. Şimdi tersten yaz.", answer: "6284", feature: "Diziyi tersten hatırlama modu" },
  { id: 3, title: "Renkli Yankı", category: "Hafıza", skill: "Görsel hafıza", icon: "✿", color: "pink", kind: "memory", prompt: "Gösterilen şeklin aynısını bul.", stimulus: ["✿"], choices: ["✿", "✦", "❋", "❀"], answer: "✿", feature: "Benzer şekiller arasında ince ayrıntı avı" },
  { id: 4, title: "Çift Dedektifi", category: "Hafıza", skill: "Eşleştirme", icon: "▦", color: "orange", kind: "grid", prompt: "Az önce gösterilen simgeyi seç.", stimulus: ["◆"], choices: ["●", "◆", "▲", "■", "★", "♥", "✚", "⬟", "☀"], answer: "◆", feature: "Kartlar her turda yeniden karıştırılır" },
  { id: 5, title: "Alışveriş Listesi", category: "Hafıza", skill: "İşitsel bellek", icon: "≋", color: "green", kind: "choice", prompt: "Listede olmayan ürünü bul: elma, süt, ekmek, armut.", choices: ["Peynir", "Armut", "Süt", "Elma"], answer: "Peynir", feature: "Günlük yaşamdan kısa liste senaryoları" },
  { id: 6, title: "Gölge Eşleştir", category: "Hafıza", skill: "Görsel eşleştirme", icon: "◐", color: "indigo", kind: "choice", prompt: "Hedef şeklin aynadaki yatay yansıması hangisi?", stimulus: ["ᗧ"], choices: ["ᗤ", "ᗧ", "ᗣ", "ᗢ"], answer: "ᗤ", feature: "Yansıma ve döndürmeyi birlikte çalıştırır" },
  { id: 7, title: "Kayıp Parça", category: "Hafıza", skill: "Detay belleği", icon: "⊞", color: "teal", kind: "grid", prompt: "Örnek desende olmayan şekli bul.", stimulus: "○  △  □  ◇  ⬡  ▽  ●  ◆", stimulusColor: "#579b91", choices: ["○", "△", "□", "◇", "☆", "⬡", "▽", "●", "◆"], answer: "☆", feature: "Görsel örüntüdeki boşluğu tamamlama" },
  { id: 8, title: "Sıra Sende", category: "Hafıza", skill: "Sıralı hatırlama", icon: "↗", color: "purple", kind: "choice", prompt: "Gösterilen sıranın son şekli hangisiydi?", stimulus: ["●", "→", "▲", "→", "■"], choices: ["●", "◆", "■", "▲"], answer: "■", feature: "Sıra bozulduğunda anında geri bildirim" },
  { id: 9, title: "Kelime Kasası", category: "Hafıza", skill: "Sözel bellek", icon: "Aa", color: "rose", kind: "choice", prompt: "Az önce gördüğün kelime hangisiydi? MARTI", choices: ["Martı", "Mart", "Mantar", "Mat"], answer: "Martı", feature: "Birbirine benzeyen kelimelerle dikkat sınavı" },
  { id: 10, title: "Desen Bekçisi", category: "Hafıza", skill: "Desen belleği", icon: "▧", color: "yellow", kind: "memory", prompt: "Desende en çok tekrar eden şekli seç.", stimulus: ["●", "▲", "●", "■", "●"], choices: ["●", "▲", "■", "◆"], answer: "●", feature: "Tekrarlama sıklığını kısa süreli bellekte tutar" },
  { id: 11, title: "Hızlı Seçim", category: "Dikkat", skill: "Seçici dikkat", icon: "✳", color: "orange", kind: "tap", prompt: "Yalnızca yıldızları yakala!", choices: ["★", "●", "★", "▲", "★", "■", "●", "★"], answer: "★", feature: "Hedef dışı şekiller arasında filtreleme" },
  { id: 12, title: "Harf Avcısı", category: "Dikkat", skill: "Görsel tarama", icon: "⌕", color: "blue", kind: "grid", prompt: "Kalabalığın içindeki farklı harfi bul.", stimulus: ["F"], choices: ["E", "E", "E", "E", "F", "E", "E", "E", "E"], answer: "F", feature: "Kalabalıkta tek farklı karakteri tarama" },
  { id: 13, title: "Renk mi Kelime mi?", category: "Dikkat", skill: "Bilişsel kontrol", icon: "◒", color: "pink", kind: "choice", prompt: "Kelimeyi değil, yazı rengini seç:", stimulus: "MAVİ", stimulusColor: "#e35d68", choices: ["Mavi", "Kırmızı", "Yeşil", "Sarı"], answer: "Kırmızı", feature: "Stroop etkisiyle otomatik yanıtı bastırma" },
  { id: 14, title: "Sessiz Sinyal", category: "Dikkat", skill: "Sürdürülebilir dikkat", icon: "⌁", color: "violet", kind: "tap", prompt: "Yalnızca hedef simgeleri seç.", stimulus: ["║"], choices: ["│", "║", "│", "║", "│", "│", "║", "│"], answer: "║", feature: "Dikkat dağıtıcılar arasında hedef takibi" },
  { id: 15, title: "Çevresel Görüş", category: "Dikkat", skill: "Çevresel algı", icon: "◎", color: "green", kind: "choice", prompt: "Ortadaki ● şeklin hemen solundaki hangisiydi?", stimulus: ["▲", "◆", "●", "■"], choices: ["▲", "◆", "■", "★"], answer: "◆", feature: "Odağı kaydırmadan çevreyi fark etme" },
  { id: 16, title: "Hedef Değişti", category: "Dikkat", skill: "Odak değiştirme", icon: "⇄", color: "teal", kind: "choice", prompt: "Kural değişti! Bu turda yalnızca küçük üçgenleri seç. Hangisi küçük?", choices: ["▲", "▴", "△", "◆"], answer: "▴", feature: "Tur ortasında değişen kuralı takip etme" },
  { id: 17, title: "Hızlı Karşılaştır", category: "Dikkat", skill: "İşlem hızı", icon: "↯", color: "yellow", kind: "compare", prompt: "Hangi satırda iki şekil tamamen aynı?", choices: ["●  ○", "▲  ▲", "■  ▪", "◆  ◇"], answer: "▲  ▲", feature: "Şekil çiftlerini tek bakışta kıyaslama" },
  { id: 18, title: "Dikkat Tüneli", category: "Dikkat", skill: "Dikkat kontrolü", icon: "◌", color: "indigo", kind: "choice", prompt: "Yalnızca mavi daireyi seç. Renk ve şekli birlikte kontrol et.", choices: ["Mavi ▲", "Turuncu ●", "Mavi ●", "Yeşil ■"], answer: "Mavi ●", feature: "İki özelliği aynı anda süzgeçten geçirme" },
  { id: 19, title: "Nokta Nöbeti", category: "Dikkat", skill: "Sürekli dikkat", icon: "·", color: "rose", kind: "choice", prompt: "Hedef sayıdan farklı olanı bul.", stimulus: ["7"], choices: ["7", "7", "1", "7"], answer: "1", feature: "Tekrarlayan uyaranlar içinde değişimi yakalama" },
  { id: 20, title: "Öncelik Sinyali", category: "Dikkat", skill: "Seçim dikkati", icon: "⚑", color: "purple", kind: "choice", prompt: "Öncelik sırası: önce kırmızı, sonra mavi. İlk hangisine dokunmalısın?", choices: ["Mavi", "Kırmızı", "Yeşil", "Sarı"], answer: "Kırmızı", feature: "Renk kodlu öncelik kuralı" },
  { id: 21, title: "İşlem Treni", category: "Esneklik", skill: "Aritmetik", icon: "＋", color: "blue", kind: "input", prompt: "Vagonları doğru bağla: 8 + 7 − 3 = ?", answer: "12", feature: "İşlemleri zihinden zincirleme çözme" },
  { id: 22, title: "Örüntü Ustası", category: "Esneklik", skill: "Mantıksal akıl yürütme", icon: "⠿", color: "violet", kind: "choice", prompt: "Diziyi tamamla: 2, 4, 8, 16, ?", choices: ["18", "24", "32", "30"], answer: "32", feature: "Her adımda değişen kuralı keşfetme" },
  { id: 23, title: "Kelime Köprüsü", category: "Esneklik", skill: "Sözel akıcılık", icon: "⌘", color: "green", kind: "choice", prompt: "Hangisi diğerlerinden farklı gruptadır?", choices: ["Keman", "Piyano", "Flüt", "Tuval"], answer: "Tuval", feature: "Kavramlar arasında kategori değiştirme" },
  { id: 24, title: "Ters Köşe", category: "Esneklik", skill: "Tepki ketleme", icon: "↶", color: "pink", kind: "choice", prompt: "Kural: doğru yanıtı değil, yanlış olanı seç. 5 + 3 = 8 mi?", choices: ["Evet", "Hayır"], answer: "Hayır", feature: "İlk akla gelen yanıtı bilerek tersine çevirme" },
  { id: 25, title: "Tahmin Terazisi", category: "Esneklik", skill: "Yaklaşık hesaplama", icon: "⚖", color: "orange", kind: "slider", prompt: "Sence 19 × 4 kaç eder? Kaydırıcıyla tahmin et.", answer: "76", min: 40, max: 100, feature: "Kesin yanıt yerine yakınlık puanı" },
  { id: 26, title: "Kural Değiştir", category: "Esneklik", skill: "Bilişsel esneklik", icon: "⤨", color: "teal", kind: "choice", prompt: "Önce büyük sayıyı seçiyorduk. Şimdi kural değişti: küçüğü seç.", choices: ["14", "6", "21", "9"], answer: "6", feature: "Beklenmedik kural değişimine uyum" },
  { id: 27, title: "Uzaylı Sözlüğü", category: "Esneklik", skill: "Kural öğrenme", icon: "☄", color: "indigo", kind: "choice", prompt: "Uzaylı sözlüğü: ZUM = 3, PAK = 5. ZUM + PAK kaç?", choices: ["7", "8", "9", "10"], answer: "8", feature: "Yeni sembolik dili anında öğrenme" },
  { id: 28, title: "Denge Noktası", category: "Esneklik", skill: "Uzamsal akıl yürütme", icon: "⌖", color: "yellow", kind: "choice", prompt: "Terazide ● + ● = ▲ ve ● = 3. ▲ kaçtır?", choices: ["3", "5", "6", "9"], answer: "6", feature: "Görsel dengeyi sayısal ilişkiye dönüştürme" },
  { id: 29, title: "Hikâye Mantığı", category: "Esneklik", skill: "Çıkarım yapma", icon: "❞", color: "rose", kind: "choice", prompt: "Ece, Deniz'den uzun. Deniz, Mert'ten uzun. En kısa kim?", choices: ["Ece", "Deniz", "Mert", "Bilinemez"], answer: "Mert", feature: "İpuçlarından görünmeyen sıralamayı çıkarma" },
  { id: 30, title: "Rota Planlayıcı", category: "Esneklik", skill: "Planlama", icon: "⌖", color: "purple", kind: "choice", prompt: "Başlangıçtan hedefe en kısa yol 3 adım. Hangi rota 3 adımda ulaşır?", choices: ["↑ → ↓ →", "← ↑ →", "↓ ↓ ↑ →", "→ → ↑ ↓"], answer: "← ↑ →", feature: "Hedefe ulaşırken adım sayısını en aza indirme" },
];
const QUESTIONS_PER_GAME = 5;
const POINTS_PER_CORRECT_ANSWER = 10;

const categories = ["Tümü", "Hafıza", "Dikkat", "Esneklik"];
const symbols = ["◆", "●", "▲", "■", "★", "♥", "✚", "⬟", "☀", "✿", "✦", "❋", "❀", "◇", "⬢", "✧"];
const words = ["MARTI", "KİRAZ", "BULUT", "DENİZ", "ÇANTA", "KALEM", "KİTAP", "YILDIZ"];
const colors = [
  { name: "Kırmızı", value: "#e35d68" },
  { name: "Mavi", value: "#5595dc" },
  { name: "Yeşil", value: "#48a77d" },
  { name: "Turuncu", value: "#db9446" },
];
const randomItem = (items) => items[Math.floor(Math.random() * items.length)];
const shuffled = (items) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};
const sample = (items, count) => shuffled(items).slice(0, count);
const textStimulus = (items) => items.map((item) => String(item));

function makeRound(game) {
  const round = { ...game };
  let choices;
  switch (game.id) {
    case 1: {
      const cycle = shuffled(["↑", "→", "↓", "←"]);
      const route = [cycle[0], cycle[1], cycle[2], cycle[3], cycle[0]];
      return { ...round, prompt: "Düzenli döngüyü takip et. Sıradaki yön hangisi?", stimulus: [...route, "?"], choices: shuffled(["↑", "→", "↓", "←"]), answer: cycle[1] };
    }
    case 2: {
      const digits = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10));
      return { ...round, prompt: "Sayı dizisini tersten yaz.", stimulus: textStimulus(digits), answer: digits.reverse().join(""), choices: undefined };
    }
    case 3: {
      const target = randomItem(symbols.slice(9));
      choices = sample(symbols.filter((item) => item !== target), 3);
      return { ...round, stimulus: [target], choices: shuffled([target, ...choices]), answer: target };
    }
    case 4: {
      const target = randomItem(symbols);
      return { ...round, stimulus: [target], choices: shuffled([target, ...sample(symbols.filter((item) => item !== target), 8)]), answer: target };
    }
    case 5: {
      const lists = [
        { items: ["elma", "süt", "ekmek", "armut"], missing: "peynir" },
        { items: ["pirinç", "kahve", "muz", "yoğurt"], missing: "domates" },
        { items: ["kalem", "defter", "silgi", "cetvel"], missing: "makas" },
        { items: ["çorap", "gömlek", "mont", "şapka"], missing: "havlu" },
      ];
      const selected = randomItem(lists);
      choices = [selected.missing, ...sample(selected.items, 3)];
      return { ...round, prompt: "Listede olmayan ürünü bul.", stimulus: selected.items, choices: shuffled(choices), answer: selected.missing };
    }
    case 6: {
      const pairs = [["(", ")"], ["<", ">"], ["{", "}"], ["[", "]"]];
      const [target, mirror] = randomItem(pairs);
      choices = [mirror, target, ...sample(["(", ")", "<", ">", "{", "}", "[", "]"].filter((item) => item !== mirror && item !== target), 2)];
      return { ...round, stimulus: [target], choices: shuffled(choices), answer: mirror };
    }
    case 7: {
      const pattern = sample(symbols, 8);
      const missing = randomItem(symbols.filter((item) => !pattern.includes(item)));
      return { ...round, stimulus: pattern, choices: shuffled([...pattern.slice(0, 8), missing]), answer: missing };
    }
    case 8: {
      const sequence = sample(symbols, 4);
      return { ...round, stimulus: sequence.flatMap((item, index) => index < sequence.length - 1 ? [item, "·"] : [item]), choices: shuffled([...sample(symbols.filter((item) => !sequence.includes(item)), 3), sequence.at(-1)]), answer: sequence.at(-1) };
    }
    case 9: {
      const target = randomItem(words);
      const distractors = words.filter((word) => word !== target).sort((a, b) => {
        const aDiff = [...a].filter((char, index) => char !== target[index]).length;
        const bDiff = [...b].filter((char, index) => char !== target[index]).length;
        return aDiff - bDiff;
      }).slice(0, 3).map((word) => word[0] + word.slice(1).toLocaleLowerCase("tr"));
      const answer = target[0] + target.slice(1).toLocaleLowerCase("tr");
      return { ...round, prompt: "Az önce gösterilen kelime hangisiydi?", stimulus: [target], choices: shuffled([answer, ...distractors]), answer };
    }
    case 10: {
      const repeated = randomItem(symbols);
      const distractors = sample(symbols.filter((item) => item !== repeated), 2);
      const pattern = shuffled([repeated, repeated, repeated, ...distractors]);
      return { ...round, stimulus: pattern, choices: shuffled([repeated, ...distractors, randomItem(symbols.filter((item) => item !== repeated && !distractors.includes(item)))]), answer: repeated };
    }
    case 11: {
      const target = randomItem(["★", "●", "▲", "◆", "♥"]);
      const other = sample(symbols.filter((item) => item !== target), 4);
      return { ...round, prompt: `Yalnızca ${target} simgelerini yakala!`, choices: shuffled([target, other[0], target, other[1], target, other[2], other[3], target]), answer: target };
    }
    case 12: {
      const alphabet = "ABCDEFGHJKLMNPRSTUVYZ".split("");
      const target = randomItem(alphabet);
      const distractor = randomItem(alphabet.filter((item) => item !== target));
      const grid = Array.from({ length: 9 }, () => distractor);
      grid[Math.floor(Math.random() * grid.length)] = target;
      return { ...round, prompt: "Kalabalığın içindeki farklı harfi bul.", stimulus: [distractor], choices: shuffled(grid), answer: target };
    }
    case 13: {
      const ink = randomItem(colors);
      const word = randomItem(colors.filter((item) => item.name !== ink.name));
      return { ...round, stimulus: [word.name.toLocaleUpperCase("tr")], stimulusColor: ink.value, choices: shuffled(colors.map((item) => item.name)), answer: ink.name };
    }
    case 14: {
      const target = randomItem(["║", "═", "╳", "＋"]);
      const alternatives = { "║": "│", "═": "─", "╳": "╱", "＋": "┼" };
      const tiles = Array.from({ length: 8 }, (_, index) => index % 3 === 0 ? target : alternatives[target]);
      return { ...round, prompt: "Yalnızca hedef simgeleri seç.", stimulus: [target], choices: shuffled(tiles), answer: target };
    }
    case 15: {
      const left = randomItem(symbols.filter((item) => item !== "●"));
      const right = randomItem(symbols.filter((item) => item !== "●" && item !== left));
      const sequence = [randomItem(symbols), left, "●", right];
      return { ...round, prompt: "Ortadaki ● şeklin hemen solundaki hangisiydi?", stimulus: sequence, choices: shuffled([left, ...sample(symbols.filter((item) => !sequence.includes(item)), 3)]), answer: left };
    }
    case 16: {
      const shapes = ["üçgen", "daire", "kare", "yıldız"];
      const target = randomItem(shapes);
      const other = randomItem(shapes.filter((item) => item !== target));
      const choices = [`Büyük ${target}`, `Küçük ${target}`, `Küçük ${other}`, `Büyük ${other}`];
      return { ...round, prompt: "Yalnızca küçük şekli seç.", stimulus: [target === "daire" ? "●" : target === "kare" ? "■" : target === "yıldız" ? "★" : "▲"], choices: shuffled(choices), answer: `Küçük ${target}` };
    }
    case 17: {
      const first = randomItem(symbols);
      const second = randomItem(symbols.filter((item) => item !== first));
      const third = randomItem(symbols.filter((item) => item !== first && item !== second));
      const pairOptions = [`${first}  ${second}`, `${first}  ${first}`, `${second}  ${third}`, `${third}  ${first}`];
      return { ...round, choices: shuffled(pairOptions), answer: `${first}  ${first}` };
    }
    case 18: {
      const color = randomItem(colors);
      const shape = randomItem(["●", "▲", "■", "◆"]);
      const correct = `${color.name} ${shape}`;
      const distractors = [
        `${randomItem(colors.filter((item) => item.name !== color.name)).name} ${shape}`,
        `${color.name} ${randomItem(["●", "▲", "■", "◆"].filter((item) => item !== shape))}`,
        `${randomItem(colors.filter((item) => item.name !== color.name)).name} ${randomItem(["●", "▲", "■", "◆"].filter((item) => item !== shape))}`,
      ];
      return { ...round, prompt: `Yalnızca ${color.name.toLocaleLowerCase("tr")} ${shape} şeklini seç.`, stimulus: [shape], stimulusColor: color.value, choices: shuffled([correct, ...distractors]), answer: correct };
    }
    case 19: {
      const target = String(Math.floor(Math.random() * 8) + 2);
      let different = String(Math.floor(Math.random() * 9) + 1);
      while (different === target) different = String(Math.floor(Math.random() * 9) + 1);
      return { ...round, prompt: "Hedef sayıdan farklı olanı bul.", stimulus: [target], choices: shuffled([target, target, different, target]), answer: different };
    }
    case 20: {
      const priority = shuffled(colors).slice(0, 4);
      return { ...round, prompt: "Öncelik sırasına göre önce hangi renge dokunmalısın?", stimulus: priority.map((item) => item.name), choices: shuffled(priority.map((item) => item.name)), answer: priority[0].name };
    }
    case 21: {
      const left = Math.floor(Math.random() * 16) + 5;
      const right = Math.floor(Math.random() * 12) + 3;
      const subtract = Math.floor(Math.random() * Math.min(left + right - 1, 10)) + 1;
      const total = left + right - subtract;
      return { ...round, prompt: `${left} + ${right} − ${subtract} = ?`, answer: String(total), choices: undefined };
    }
    case 22: {
      const start = Math.floor(Math.random() * 5) + 2;
      const multiplier = Math.floor(Math.random() * 3) + 2;
      const answer = start * multiplier ** 3;
      return { ...round, prompt: `Diziyi tamamla: ${start}, ${start * multiplier}, ${start * multiplier ** 2}, ?`, choices: shuffled([String(answer), String(answer + multiplier), String(answer - start), String(answer * 2)]), answer: String(answer) };
    }
    case 23: {
      const groups = [
        { group: ["keman", "piyano", "flüt"], odd: "tuval" },
        { group: ["elma", "armut", "kiraz"], odd: "havuç" },
        { group: ["salı", "cuma", "pazar"], odd: "nisan" },
        { group: ["mars", "venüs", "jüpiter"], odd: "ankara" },
      ];
      const selected = randomItem(groups);
      return { ...round, choices: shuffled([...selected.group, selected.odd]), answer: selected.odd };
    }
    case 24: {
      const left = Math.floor(Math.random() * 8) + 2;
      const right = Math.floor(Math.random() * 8) + 2;
      const isTrue = Math.random() > 0.5;
      const shown = isTrue ? left + right : left + right + (Math.random() > 0.5 ? 1 : -1);
      return { ...round, prompt: `Kural: yanlış yanıtı seç. ${left} + ${right} = ${shown} mi?`, choices: shuffled(["Evet", "Hayır"]), answer: isTrue ? "Hayır" : "Evet" };
    }
    case 25: {
      const left = Math.floor(Math.random() * 15) + 5;
      const right = Math.floor(Math.random() * 8) + 3;
      const answer = left * right;
      return { ...round, prompt: `Sence ${left} × ${right} yaklaşık kaç eder?`, answer: String(answer), min: Math.max(0, answer - 40), max: answer + 40 };
    }
    case 26: {
      const values = sample(Array.from({ length: 30 }, (_, index) => index + 1), 4);
      return { ...round, prompt: "Küçük sayıyı seç.", choices: shuffled(values.map(String)), answer: String(Math.min(...values)) };
    }
    case 27: {
      const left = Math.floor(Math.random() * 8) + 2;
      const right = Math.floor(Math.random() * 8) + 2;
      const first = randomItem(["ZUM", "PAK", "VEX", "LOR"]);
      const second = randomItem(["TIK", "NAR", "BOK", "FEN"].filter((item) => item !== first));
      const answer = left + right;
      return { ...round, prompt: `Uzaylı sözlüğü: ${first} = ${left}, ${second} = ${right}. ${first} + ${second} kaç?`, choices: shuffled([answer, answer + 1, answer - 1, answer + 3].map(String)), answer: String(answer) };
    }
    case 28: {
      const dotValue = Math.floor(Math.random() * 8) + 2;
      const multiplier = Math.floor(Math.random() * 4) + 2;
      const answer = dotValue * multiplier;
      return { ...round, prompt: `Terazide ● × ${multiplier} = ▲ ve ● = ${dotValue}. ▲ kaçtır?`, choices: shuffled([answer, answer + dotValue, answer - 1, answer * 2].map(String)), answer: String(answer) };
    }
    case 29: {
      const names = shuffled(["Ece", "Deniz", "Mert", "Ada"]);
      return { ...round, prompt: `${names[0]}, ${names[1]}'den uzun. ${names[1]}, ${names[2]}'den uzun. En kısa kim?`, choices: shuffled(names.slice(0, 3)), answer: names[2] };
    }
    case 30: {
      const answer = randomItem(["↑ → ↓", "← ↑ →", "↓ ← ↑", "→ ↓ ←"]);
      const distractors = sample(["↑ ↑ → ↓", "← ↓ ↓ →", "→ → ↑ ↓", "↓ → ↑ ←", "← ← ↑ →", "↑ ↓ ← →"], 3);
      return { ...round, prompt: "Başlangıçtan hedefe en kısa yol 3 adım. Hangi rota 3 adımda ulaşır?", stimulus: ["●", "·", "◎"], choices: shuffled([answer, ...distractors]), answer };
    }
    default:
      return { ...round, choices: game.choices ? shuffled(game.choices) : undefined };
  }
}

const initialStats = () => {
  try {
    return JSON.parse(localStorage.getItem("zihin-atlasi-stats")) || { points: 0, sessions: 0, streak: 1, completed: [] };
  } catch {
    return { points: 0, sessions: 0, streak: 1, completed: [] };
  }
};

function App() {
  const [category, setCategory] = useState("Tümü");
  const [query, setQuery] = useState("");
  const [activeGame, setActiveGame] = useState(null);
  const [round, setRound] = useState(null);
  const [stimulusVisible, setStimulusVisible] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [value, setValue] = useState(70);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackTopic, setFeedbackTopic] = useState("Genel deneyim");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState(null);

  useEffect(() => {
    if (!activeGame || !round?.stimulus) {
      setStimulusVisible(false);
      return undefined;
    }
    setStimulusVisible(true);
    const timer = window.setTimeout(() => setStimulusVisible(false), 2200);
    return () => window.clearTimeout(timer);
  }, [activeGame, round]);

  const visibleGames = useMemo(
    () => games.filter((game) => (category === "Tümü" || game.category === category)
      && `${game.title} ${game.skill}`.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr"))),
    [category, query],
  );

  function openGame(game) {
    setActiveGame(game);
    const nextRound = makeRound(game);
    setRound(nextRound);
    setStimulusVisible(Boolean(nextRound.stimulus));
    setAnswer("");
    setResult(null);
    setValue(nextRound.min ? Math.round((nextRound.min + nextRound.max) / 2) : 70);
    setQuestionNumber(1);
    setCorrectCount(0);
    setWrongCount(0);
    setEarnedPoints(0);
    setGameFinished(false);
  }

  function submitAnswer(selected = answer) {
    if (!activeGame || !round || result || (round.stimulus && stimulusVisible)) return;
    const isCorrect = round.kind === "slider"
      ? Math.abs(Number(selected) - Number(round.answer)) <= 5
      : String(selected).trim().toLocaleLowerCase("tr") === String(round.answer).trim().toLocaleLowerCase("tr");
    setResult(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setCorrectCount((previous) => previous + 1);
      setEarnedPoints((previous) => previous + POINTS_PER_CORRECT_ANSWER);
    } else {
      setWrongCount((previous) => previous + 1);
    }
    setStats((previous) => {
      const next = {
        ...previous,
        points: previous.points + (isCorrect ? POINTS_PER_CORRECT_ANSWER : 0),
        sessions: previous.sessions + 1,
      };
      localStorage.setItem("zihin-atlasi-stats", JSON.stringify(next));
      return next;
    });
  }

  function nextRound() {
    if (questionNumber >= QUESTIONS_PER_GAME) {
      setGameFinished(true);
      setStats((previous) => {
        const next = {
          ...previous,
          completed: previous.completed.includes(activeGame.id) ? previous.completed : [...previous.completed, activeGame.id],
        };
        localStorage.setItem("zihin-atlasi-stats", JSON.stringify(next));
        return next;
      });
      return;
    }
    setResult(null);
    setAnswer("");
    const next = makeRound(activeGame);
    setRound(next);
    setStimulusVisible(Boolean(next.stimulus));
    setValue(next.min ? Math.round((next.min + next.max) / 2) : 70);
    setQuestionNumber((previous) => previous + 1);
  }

  function submitFeedback(event) {
    event.preventDefault();
    if (!feedbackRating || !feedbackMessage.trim()) return;

    const feedback = {
      rating: feedbackRating,
      topic: feedbackTopic,
      message: feedbackMessage.trim(),
      createdAt: new Date().toISOString(),
    };
    const savedFeedback = JSON.parse(localStorage.getItem("zihin-atlasi-feedback") || "[]");
    localStorage.setItem("zihin-atlasi-feedback", JSON.stringify([...savedFeedback, feedback]));
    setFeedbackMessage("");
    setFeedbackRating(0);
    setFeedbackStatus("success");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setActiveGame(null); }}>
          <span className="brand-mark">✳</span><span>zihin<span className="brand-light">atlası</span></span>
        </a>
        <div className="side-label">MENÜ</div>
        <button className="nav-item active" onClick={() => setActiveGame(null)}><span>⌂</span> Keşfet</button>
        <button className="nav-item" onClick={() => { setCategory("Tümü"); document.getElementById("oyunlar")?.scrollIntoView({ behavior: "smooth" }); }}><span>▦</span> Oyun kütüphanesi <small>30</small></button>
        <button className="nav-item" onClick={() => document.getElementById("ilerleme")?.scrollIntoView({ behavior: "smooth" })}><span>↗</span> İlerlemem</button>
        <button className="nav-item" onClick={() => { setActiveGame(null); document.getElementById("feedback")?.scrollIntoView({ behavior: "smooth" }); }}><span>♡</span> Geri bildirim</button>
        <div className="sidebar-bottom">
          <div className="side-label">BUGÜNÜN HEDEFİ</div>
          <div className="goal-card">
            <div className="goal-icon">☀</div>
            <strong>Küçük adımlar, güçlü zihin.</strong>
            <span>Her gün 10 dakika ayır.</span>
            <div className="goal-track"><i style={{ width: `${Math.min(100, stats.completed.length * 10)}%` }} /></div>
            <small>{Math.min(stats.completed.length, 10)} / 10 egzersiz</small>
          </div>
          <div className="profile-row"><div className="avatar">Y</div><div><strong>Merhaba!</strong><span>Yolculuğun yeni başlıyor</span></div><button aria-label="Profil">···</button></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">Ana sayfa <span>/</span> <strong>{activeGame ? activeGame.title : "Keşfet"}</strong></div>
          <div className="top-actions"><span className="streak"><b>♨</b> {stats.streak} günlük seri</span><button className="help-button" aria-label="Yardım">?</button></div>
        </header>

        {!activeGame ? (
          <div className="page-content">
            <section className="welcome-row">
              <div><div className="eyebrow"><span className="spark">✦</span> ZİHNİN İÇİN GÜZEL BİR GÜN</div><h1>Merhaba, Yunus <span>✦</span></h1><p>Bugün zihnine biraz zaman ayırmaya ne dersin?</p></div>
              <div className="date-chip"><span>☼</span> Bugün kendin için</div>
            </section>

            <section className="hero-card">
              <div className="hero-copy"><div className="hero-overline">GÜNÜN EGZERSİZİ <span>• 4 DK</span></div><h2>Zihnine yeni bir<br />pencere aç.</h2><p>Hafıza, dikkat ve esneklik… Her gün birkaç dakikalık oyunlarla keşfet.</p><button className="primary-button" onClick={() => openGame(games[0])}>Hemen başla <span>→</span></button><div className="hero-dots"><i /><i /><i /><i /></div></div>
              <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="art-sun">✦</div><div className="art-card card-back">◌</div><div className="art-card card-front"><span>✷</span><b>odak</b><small>günün becerisi</small></div><div className="art-bubble bubble-one">+20</div><div className="art-bubble bubble-two">✧</div></div>
            </section>

            <section className="stats-grid" id="ilerleme">
              <div className="stat-card"><div className="stat-icon lilac">✧</div><div><span>Toplam puan</span><strong>{stats.points.toLocaleString("tr-TR")}</strong></div><small>puan</small></div>
              <div className="stat-card"><div className="stat-icon peach">◷</div><div><span>Tamamlanan egzersiz</span><strong>{stats.completed.length}</strong></div><small>/ 30</small></div>
              <div className="stat-card"><div className="stat-icon mint">↗</div><div><span>Oynanan tur</span><strong>{stats.sessions}</strong></div><small>tur</small></div>
            </section>

            <section className="games-section" id="oyunlar">
              <div className="section-heading"><div><div className="eyebrow">KEŞFET</div><h2>Zihin antrenmanların</h2><p>Her oyun farklı bir beceriyi çalıştırır. Sana uygun olanı seç.</p></div><div className="game-count"><strong>{visibleGames.length}</strong> oyun</div></div>
              <div className="toolbar"><div className="filters">{categories.map((item) => <button key={item} className={category === item ? "filter active" : "filter"} onClick={() => setCategory(item)}>{item}{item === "Tümü" && <span>30</span>}</button>)}</div><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Oyun ara..." aria-label="Oyun ara" /></label></div>
              <div className="game-grid">
                {visibleGames.map((game) => <button className="game-card" key={game.id} onClick={() => openGame(game)}>
                  <div className={`game-icon ${game.color}`}>{game.icon}</div><span className={`category-tag ${game.category.toLowerCase()}`}>{game.category}</span>
                  <h3>{game.title}</h3><p>{game.skill}</p><div className="card-bottom"><span className="play-link">Oyna <b>→</b></span><span className="duration">◷ 2 dk</span></div>
                </button>)}
              </div>
              {visibleGames.length === 0 && <div className="empty-state">Bu aramayla eşleşen oyun bulamadık. Başka bir kelime dene.</div>}
            </section>
            <section className="feedback-section" id="feedback">
              <div className="feedback-intro">
                <div className="eyebrow"><span className="spark">✦</span> SESİNİ DUYALIM</div>
                <h2>Zihin Atlası'nı birlikte geliştirelim.</h2>
                <p>Deneyimin nasıldı? Kısa bir not bırak; önerilerin sonraki egzersizlere ilham olsun.</p>
              </div>
              <form className="feedback-card" onSubmit={submitFeedback}>
                <div className="feedback-field">
                  <label>Deneyimini nasıl değerlendirirsin?</label>
                  <div className="rating-group" role="radiogroup" aria-label="Deneyim puanı">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        type="button"
                        key={rating}
                        className={feedbackRating >= rating ? "rating-button selected" : "rating-button"}
                        onClick={() => { setFeedbackRating(rating); setFeedbackStatus(null); }}
                        aria-label={`${rating} yıldız`}
                        aria-pressed={feedbackRating === rating}
                      >★</button>
                    ))}
                  </div>
                </div>
                <div className="feedback-field">
                  <label htmlFor="feedback-topic">Geri bildirim konusu</label>
                  <select id="feedback-topic" value={feedbackTopic} onChange={(event) => setFeedbackTopic(event.target.value)}>
                    <option>Genel deneyim</option>
                    <option>Oyunlar</option>
                    <option>Tasarım ve kullanım</option>
                    <option>Bir hata bildir</option>
                    <option>Öneri</option>
                  </select>
                </div>
                <div className="feedback-field feedback-message">
                  <label htmlFor="feedback-message">Mesajın</label>
                  <textarea id="feedback-message" value={feedbackMessage} onChange={(event) => { setFeedbackMessage(event.target.value); setFeedbackStatus(null); }} placeholder="Neyi sevdin, neyi daha iyi yapabiliriz?" rows="4" maxLength="500" required />
                  <small>{feedbackMessage.length}/500</small>
                </div>
                <div className="feedback-actions">
                  <button className="primary-button feedback-submit" type="submit" disabled={!feedbackRating || !feedbackMessage.trim()}>Geri bildirimi gönder <span>→</span></button>
                  {feedbackStatus === "success" && <span className="feedback-success" role="status">✓ Teşekkürler, geri bildirimin kaydedildi.</span>}
                </div>
              </form>
            </section>
            <footer>© 2026 Zihin Atlası <span>•</span> Zihnine iyi bak. Her gün biraz.</footer>
          </div>
        ) : (
          <div className="play-page">
            <button className="back-link" onClick={() => setActiveGame(null)}>← <span>Oyunlara dön</span></button>
            <div className="play-layout">
              <section className="play-card">
                <div className="play-topline"><span className={`game-icon ${activeGame.color}`}>{activeGame.icon}</span><div><span className={`category-tag ${activeGame.category.toLowerCase()}`}>{activeGame.category}</span><h1>{activeGame.title}</h1><p>{activeGame.skill}</p></div>                <span className="round-pill">SORU {questionNumber} / {QUESTIONS_PER_GAME}</span></div>
                <div className="challenge">
                  {!gameFinished ? (
                    <>
                      <div className="challenge-kicker"><span>✦</span> HAZIR MISIN?</div><h2>{round.prompt}</h2>
                      {round.stimulus && stimulusVisible && <StimulusDisplay game={round} />}
                      {round.stimulus && stimulusVisible && <div className="memory-timer">Şekilleri aklında tut <span>•</span> seçenekler birazdan açılacak</div>}
                      {round.stimulus && !stimulusVisible && <div className="stimulus-hidden" role="status"><span>◌</span> Şekiller gizlendi. Şimdi hatırladığını seç.</div>}
                      {(!round.stimulus || !stimulusVisible) && <GameBoard game={round} answer={answer} setAnswer={setAnswer} value={value} setValue={setValue} onSubmit={submitAnswer} result={result} />}
                      {result && <div className={`feedback ${result}`}><span>{result === "correct" ? "✓" : "↻"}</span><div><strong>{result === "correct" ? "Harika, doğru cevap!" : "Güzel deneme!"}</strong><small>{result === "correct" ? `+${POINTS_PER_CORRECT_ANSWER} puan kazandın.` : `Doğru yanıt: ${round.answer}`}</small></div></div>}
                      {result ? <button className="primary-button next-button" onClick={nextRound}>{questionNumber === QUESTIONS_PER_GAME ? "Sonucu gör" : "Sonraki soru"} <span>→</span></button> : <p className="gentle-note">Burada önemli olan hız değil, denemek. Kendine iyi davran.</p>}
                    </>
                  ) : (
                    <div className="game-summary">
                      <div className="summary-icon">✦</div>
                      <div className="challenge-kicker">OTURUM TAMAMLANDI</div>
                      <h2>Harika iş çıkardın!</h2>
                      <p>Bu oyundaki performansın</p>
                      <div className="summary-stats"><div><strong>{correctCount}</strong><span>Doğru</span></div><div><strong>{wrongCount}</strong><span>Yanlış</span></div><div><strong>{earnedPoints}</strong><span>Puan</span></div></div>
                      <div className="summary-actions"><button className="primary-button" onClick={() => openGame(activeGame)}>Tekrar oyna <span>↻</span></button><button className="back-link" onClick={() => setActiveGame(null)}>Oyunlara dön</button></div>
                    </div>
                  )}
                </div>
              </section>
              <aside className="play-aside"><div className="aside-illustration"><span>✦</span><div>◉</div><b>odaklan</b></div><h3>Bugünün küçük ipucu</h3><p>Bir işe başlamadan önce birkaç derin nefes almak, dikkatini toplamana yardımcı olabilir.</p><div className="feature-note"><span>✧</span><div><b>Bu oyunda farklı olan</b><p>{activeGame.feature}</p></div></div><button className="text-button" onClick={() => setActiveGame(null)}>Başka bir oyun keşfet <span>→</span></button></aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function GameBoard({ game, answer, setAnswer, value, setValue, onSubmit, result }) {
  if (game.kind === "input") return <form className="answer-form" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><input autoFocus value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Yanıtını yaz..." aria-label="Yanıtın" /><button className="submit-button" type="submit" disabled={!answer || Boolean(result)}>Yanıtla <span>→</span></button></form>;
  if (game.kind === "slider") return <div className="slider-board"><div className="slider-value">{value}</div><input type="range" min={game.min} max={game.max} value={value} onChange={(event) => setValue(Number(event.target.value))} aria-label="Tahminini ayarla" /><div className="range-labels"><span>{game.min}</span><span>{game.max}</span></div><button className="submit-button" onClick={() => onSubmit(value)} disabled={Boolean(result)}>Tahmin et <span>→</span></button></div>;
  if (game.kind === "grid" || game.kind === "tap") return <div className={`symbol-grid ${game.kind}`} role="group" aria-label="Yanıt seçenekleri">{game.choices.map((choice, index) => <button key={`${choice}-${index}`} onClick={() => onSubmit(choice)} disabled={Boolean(result)} className={`${answer === choice ? "selected" : ""} ${result && choice === game.answer ? "right-answer" : ""}`}>{choice}</button>)}</div>;
  if (game.kind === "sequence") return <div className="sequence-options" role="group" aria-label="Yön seçimi">{game.choices.map((choice) => <button key={choice} onClick={() => onSubmit(choice)} disabled={Boolean(result)} className={result && choice === game.answer ? "right-answer" : ""}>{choice}</button>)}</div>;
  if (game.kind === "compare") return <div className="compare-options">{game.choices.map((choice) => <button key={choice} onClick={() => onSubmit(choice)} disabled={Boolean(result)} className={result && choice === game.answer ? "right-answer" : ""}><span>{choice.split("  ")[0]}</span><i>{choice.split("  ")[1]}</i></button>)}</div>;
  return <div className="choice-options">{game.choices.map((choice, index) => <button key={`${choice}-${index}`} onClick={() => { setAnswer(choice); onSubmit(choice); }} disabled={Boolean(result)} className={result && choice === game.answer ? "right-answer" : ""}><span className="option-letter">{String.fromCharCode(65 + index)}</span>{choice}<span className="option-arrow">↗</span></button>)}</div>;
}

function StimulusDisplay({ game }) {
  const items = Array.isArray(game.stimulus)
    ? game.stimulus
    : String(game.stimulus).trim().split(/\s+/);

  return (
    <div className={`stimulus-panel ${game.kind === "sequence" ? "route-stimulus" : ""}`} aria-label="Soru şekilleri">
      {items.map((item, index) => (
        <span
          className={item === "·" ? "stimulus-item stimulus-separator" : "stimulus-item"}
          key={`${item}-${index}`}
          style={game.stimulusColor && item !== "→" ? { color: game.stimulusColor } : undefined}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default App;
