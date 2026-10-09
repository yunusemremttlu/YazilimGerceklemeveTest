import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownToLine, ArrowRight, BarChart3, Check, CheckCircle2,
  ChevronDown, CircleHelp, Clock3, CloudUpload, Database, FileText, Filter, Inbox,
  LayoutDashboard, Lightbulb, ListTodo, LoaderCircle, Menu, MessageCircle, Pencil, Plus, Search,
  Settings, ShieldCheck, Sparkles, Trash2, TrendingUp, Upload, X,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { createDemoConversations, initialTasks, type ActionTask, type Conversation, type Priority, type TaskStatus } from "./data";
import { analyzeMessage, clusterIssues, exportConversations, parseCsv } from "./logic";

const conversationKey = "diyalogradar.conversations";
const taskKey = "diyalogradar.tasks";
const readStored = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch (error) {
    console.error(`DiyalogRadar kayıtlı veriyi okuyamadı (${key}).`, error);
    return fallback;
  }
};
const save = <T,>(key: string, value: T) => localStorage.setItem(key, JSON.stringify(value));
const dateLabel = (date: string) => new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(new Date(date));
const priorityClass = (priority: string) => `priority priority-${priority.toLocaleLowerCase("tr-TR")}`;
const sentimentClass = (sentiment: string) => `sentiment sentiment-${sentiment.toLocaleLowerCase("tr-TR")}`;
const routes = [
  { to: "/app", label: "Genel Bakış", icon: LayoutDashboard, end: true },
  { to: "/app/conversations", label: "Konuşmalar", icon: MessageCircle },
  { to: "/app/insights", label: "İçgörüler", icon: Lightbulb },
  { to: "/app/actions", label: "Aksiyonlar", icon: ListTodo },
  { to: "/app/import", label: "Veri içe aktar", icon: CloudUpload },
];

function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => readStored(conversationKey, createDemoConversations()));
  const [tasks, setTasks] = useState<ActionTask[]>(() => readStored(taskKey, initialTasks));
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3000); };
  const updateConversations = (next: Conversation[]) => {
    try { save(conversationKey, next); setConversations(next); }
    catch (error) { notify(`Konuşmalar kaydedilemedi: ${error instanceof Error ? error.message : "Tarayıcı depolama hatası."}`); }
  };
  const updateTasks = (next: ActionTask[]) => {
    try { save(taskKey, next); setTasks(next); }
    catch (error) { notify(`Aksiyonlar kaydedilemedi: ${error instanceof Error ? error.message : "Tarayıcı depolama hatası."}`); }
  };
  const loadDemo = () => {
    const demo = createDemoConversations();
    updateConversations(demo);
    notify("Demo verileri yüklendi.");
  };
  const addTask = (issue: string) => {
    const task: ActionTask = {
      id: `task-${Date.now()}`, title: `${issue} konusunu incele`,
      description: `İçgörü kaynağı: ${issue}. İlgili konuşmaları inceleyip çözüm önerisi belirleyin.`,
      priority: "Orta", status: "Yapılacak", assignee: "Ürün ekibi",
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), sourceIssue: issue,
    };
    updateTasks([task, ...tasks]);
    notify("Aksiyon başarıyla oluşturuldu.");
  };
  const deleteAll = () => {
    if (!window.confirm("Tüm konuşmalar ve aksiyonlar kalıcı olarak silinsin mi? Bu işlem geri alınamaz.")) return;
    updateConversations([]);
    updateTasks([]);
    notify("Çalışma alanı verileri silindi.");
  };
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app/*" element={
          <Shell mobileNav={mobileNav} setMobileNav={setMobileNav} conversations={conversations} tasks={tasks}>
            <Routes>
              <Route index element={<Dashboard conversations={conversations} tasks={tasks} onLoadDemo={loadDemo} />} />
              <Route path="conversations" element={<Conversations conversations={conversations} />} />
              <Route path="conversations/:id" element={<ConversationDetail conversations={conversations} />} />
              <Route path="insights" element={<Insights conversations={conversations} onCreateTask={addTask} />} />
              <Route path="actions" element={<Actions tasks={tasks} onChange={updateTasks} />} />
              <Route path="import" element={<ImportPage conversations={conversations} onImport={updateConversations} notify={notify} onLoadDemo={loadDemo} />} />
              <Route path="reports" element={<Reports conversations={conversations} tasks={tasks} />} />
              <Route path="settings" element={<SettingsPage conversations={conversations} onDelete={deleteAll} notify={notify} onLoadDemo={loadDemo} />} />
              <Route path="*" element={<Dashboard conversations={conversations} tasks={tasks} onLoadDemo={loadDemo} />} />
            </Routes>
          </Shell>
        } />
      </Routes>
      {toast && <div className="toast" role="status"><CheckCircle2 size={18} />{toast}</div>}
    </>
  );
}

function Shell({ children, mobileNav, setMobileNav, conversations, tasks }: {
  children: React.ReactNode; mobileNav: boolean; setMobileNav: (open: boolean) => void;
  conversations: Conversation[]; tasks: ActionTask[];
}) {
  const location = useLocation();
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <Link to="/" className="brand"><span className="brand-mark"><Activity size={20} /></span><span>Diyalog<span className="brand-accent">Radar</span><small>AI INSIGHTS PLATFORM</small></span></Link>
      <div className="workspace"><div className="workspace-avatar">M</div><div><b>Moda & Co.</b><span>Ücretsiz çalışma alanı</span></div><ChevronDown size={16} /></div>
      <span className="nav-label">ÇALIŞMA ALANI</span>
      <nav className="side-nav">{routes.map(({ to, label, icon: Icon, end }) =>
        <NavLink key={to} to={to} end={end} onClick={() => setMobileNav(false)}><Icon size={18} /><span>{label}</span>
          {label === "Konuşmalar" && <span className="nav-count">{conversations.length}</span>}
          {label === "Aksiyonlar" && tasks.filter((task) => task.status !== "Tamamlandı").length > 0 && <span className="nav-count">{tasks.filter((task) => task.status !== "Tamamlandı").length}</span>}
        </NavLink>)}
      </nav>
      <span className="nav-label nav-label-bottom">YÖNETİM</span>
      <nav className="side-nav"><NavLink to="/app/reports"><BarChart3 size={18} />Raporlar</NavLink><NavLink to="/app/settings"><Settings size={18} />Ayarlar</NavLink></nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-tip"><div className="tip-icon"><Sparkles size={16} /></div><b>Yerel Dil Radarı</b><p>Türkçe konuşmalardaki müşteri sinyallerini keşfedin.</p><Link to="/app/insights">İçgörüleri keşfet <ArrowRight size={14} /></Link></div>
      <div className="profile"><div className="profile-avatar">YK</div><div><b>Yönetici</b><span>Moda & Co.</span></div><ChevronDown size={15} /></div>
    </aside>
    {mobileNav && <button className="mobile-scrim" aria-label="Menüyü kapat" onClick={() => setMobileNav(false)} />}
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu icon-button" aria-label="Menüyü aç" onClick={() => setMobileNav(!mobileNav)}><Menu size={20} /></button>
        <div className="breadcrumbs">Çalışma Alanı <span>/</span> <b>{routeTitle(location.pathname)}</b></div>
        <div className="top-actions"><span className="demo-indicator"><i /> Demo analiz modu</span><button className="help-button" title="Yardım"><CircleHelp size={17} /></button><div className="profile-avatar small">YK</div></div>
      </header>
      <div className="page-content">{children}</div>
    </main>
  </div>;
}
function routeTitle(path: string) {
  return path.includes("conversations") ? "Konuşmalar" : path.includes("insights") ? "İçgörüler" : path.includes("actions") ? "Aksiyonlar" : path.includes("import") ? "Veri içe aktar" : path.includes("reports") ? "Raporlar" : path.includes("settings") ? "Ayarlar" : "Genel Bakış";
}

function Landing() {
  const demoConversations = useMemo(() => createDemoConversations(), []);
  const demoIssues = clusterIssues(demoConversations);
  const negativePercent = Math.round(demoConversations.filter((item) => item.sentiment === "Olumsuz").length / demoConversations.length * 100);
  const leadingIssue = demoIssues[0];
  const demoTrend = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    const records = demoConversations.filter((item) => new Date(item.date).toDateString() === day.toDateString());
    return {
      day: new Intl.DateTimeFormat("tr-TR", { weekday: "short" }).format(day),
      positive: records.filter((item) => item.sentiment === "Olumlu").length,
      negative: records.filter((item) => item.sentiment === "Olumsuz").length,
    };
  });
  return <div className="landing">
    <nav className="landing-nav"><Link to="/" className="brand"><span className="brand-mark"><Activity size={20} /></span><span>Diyalog<span className="brand-accent">Radar</span></span></Link><div><a href="#features">Özellikler</a><a href="#how">Nasıl çalışır?</a><Link className="button button-primary button-small" to="/app">Demo'yu keşfet <ArrowRight size={15} /></Link></div></nav>
    <section className="hero"><div className="hero-copy"><span className="eyebrow"><Sparkles size={14} /> TÜRKÇE MÜŞTERİ İÇGÖRÜLERİ</span><h1>Müşterilerinizin söylediklerinin <span>ötesini görün.</span></h1><p>Türkçe destek konuşmalarındaki tekrar eden sorunları, ürün taleplerini ve müşteri sürtünmelerini tek bir yerde keşfedin.</p><div className="hero-buttons"><Link className="button button-primary" to="/app">Ücretsiz keşfet <ArrowRight size={16} /></Link><a className="button button-quiet" href="#features">Ürünü tanıyın <ArrowRight size={16} /></a></div><div className="hero-note"><ShieldCheck size={16} /> Örnek verilerle deneyin. API anahtarı gerekmez.</div></div>
      <div className="hero-preview"><div className="preview-top"><div><span className="preview-dot" /><span className="preview-dot" /><span className="preview-dot" /></div><span>Moda & Co. / Genel Bakış</span><span className="preview-badge">DEMO</span></div><div className="preview-body">      <div className="preview-title">Günaydın, Moda & Co. 👋<small>Örnek veri kümesi · son 30 gün</small></div><div className="preview-cards"><div><small>Toplam konuşma</small><b>{demoConversations.length}</b><span>Kurmaca demo verisi</span></div><div><small>Olumsuz sinyal</small><b>{negativePercent}%</b><span className="preview-red">{demoConversations.filter((item) => item.sentiment === "Olumsuz").length} konuşma</span></div><div><small>Öne çıkan sorun</small><b>{leadingIssue?.category ?? "—"}</b><span>{leadingIssue?.count ?? 0} konuşma</span></div></div><div className="preview-chart"><div className="preview-chart-label">Müşteri duygu eğilimi <span>Son 7 gün · örnek veri</span></div><ResponsiveContainer width="100%" height={84}><AreaChart data={demoTrend} margin={{ top: 3, right: 3, left: -25, bottom: 0 }}><defs><linearGradient id="landingPositive" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22b8a5" stopOpacity={0.2} /><stop offset="100%" stopColor="#22b8a5" stopOpacity={0} /></linearGradient><linearGradient id="landingNegative" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ed7184" stopOpacity={0.18} /><stop offset="100%" stopColor="#ed7184" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#eef0f3" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: "#9199a8" }} /><YAxis hide allowDecimals={false} /><Area type="monotone" dataKey="positive" name="Olumlu" stroke="#22b8a5" fill="url(#landingPositive)" strokeWidth={2} /><Area type="monotone" dataKey="negative" name="Olumsuz" stroke="#ed7184" fill="url(#landingNegative)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div><div className="preview-issue"><span className="issue-icon"><AlertTriangle size={16} /></span><div><b>{leadingIssue?.title ?? "Henüz sorun yok"}</b><small>{leadingIssue?.count ?? 0} konuşma · Öncelik {leadingIssue?.score ?? 0}/100</small></div><span className="mini-priority">{leadingIssue?.priority ?? "—"}</span></div></div></div>
    </section>
    <section className="feature-strip" id="features"><div><span>01</span><b>Türkçe'yi anlayan</b><small>Yerel ifadeler ve günlük dil</small></div><div><span>02</span><b>Kanıtla desteklenen</b><small>Her içgörü kaynağına bağlı</small></div><div><span>03</span><b>Aksiyona dönüşen</b><small>İçgörüden takip edilebilir göreve</small></div></section>
    <section className="landing-bottom" id="how"><div><span className="eyebrow">DAHA İYİ MÜŞTERİ DENEYİMİ</span><h2>Konuşmaları anlayın.<br />Daha iyi kararlar alın.</h2><p>Demo verileriyle panoyu keşfedin, konuşmalardaki kanıtları inceleyin ve bir içgörüyü gerçek bir aksiyona dönüştürün.</p></div><Link className="button button-primary" to="/app">Çalışan demoyu aç <ArrowRight size={16} /></Link></section>
    <footer className="landing-footer"><Link to="/" className="brand"><span className="brand-mark"><Activity size={18} /></span><span>Diyalog<span className="brand-accent">Radar</span></span></Link><span>© 2026 DiyalogRadar AI · Kurmaca örnek verilerle demo</span></footer>
  </div>;
}

function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="page-title"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="title-action">{action}</div>}</div>;
}
function Dashboard({ conversations, tasks, onLoadDemo }: { conversations: Conversation[]; tasks: ActionTask[]; onLoadDemo: () => void }) {
  const [period, setPeriod] = useState("30");
  const [channel, setChannel] = useState("Tüm kanallar");
  const filtered = conversations.filter((item) => {
    const recent = Date.now() - new Date(item.date).getTime() <= Number(period) * 86400000;
    return recent && (channel === "Tüm kanallar" || item.channel === channel);
  });
  const negative = filtered.filter((item) => item.sentiment === "Olumsuz").length;
  const insights = clusterIssues(filtered);
  const featureCount = filtered.filter((item) => item.feature).length;
  const chartData = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - index));
    const day = filtered.filter((item) => new Date(item.date).toDateString() === date.toDateString());
    return { gün: new Intl.DateTimeFormat("tr-TR", { weekday: "short" }).format(date), olumlu: day.filter((item) => item.sentiment === "Olumlu").length, olumsuz: day.filter((item) => item.sentiment === "Olumsuz").length };
  }), [filtered]);
  const empty = conversations.length === 0;
  return <>
    <PageTitle eyebrow={new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" }).format(new Date()).toLocaleUpperCase("tr-TR")} title="Genel Bakış" description="Müşterilerinizin sesini anlamlı içgörülere dönüştürün." action={<><select className="select-control period-select" value={period} onChange={(event) => setPeriod(event.target.value)}><option value="7">Son 7 gün</option><option value="30">Son 30 gün</option><option value="90">Son 90 gün</option></select><button className="button button-primary" onClick={onLoadDemo}><Plus size={16} />Demo verilerini yükle</button></>} />
    {empty ? <EmptyState icon={<Inbox size={23} />} title="Henüz konuşma verisi yok" text="Örnek veri yükleyin veya kendi konuşmalarınızı içe aktarın." action={<Link to="/app/import" className="button button-primary"><Upload size={16} /> Konuşma içe aktar</Link>} secondary={<button className="button button-quiet" onClick={onLoadDemo}>Demo verilerini yükle</button>} /> : <>
      <div className="filter-row"><span className="filter-caption"><Filter size={15} /> Gösterilen dönem: <b>Son {period} gün</b></span><select className="select-control compact-select" value={channel} onChange={(event) => setChannel(event.target.value)}><option>Tüm kanallar</option>{[...new Set(conversations.map((item) => item.channel))].map((item) => <option key={item}>{item}</option>)}</select><span className="comparison-note">Önceki dönemle karşılaştırma için yeterli geçmiş veri bulunmuyor.</span></div>
      <div className="metric-grid">
        <Metric icon={<MessageCircle size={17} />} label="Toplam konuşma" value={filtered.length.toLocaleString("tr-TR")} note="Seçili dönemde" color="teal" />
        <Metric icon={<TrendingUp size={17} />} label="Olumsuz sinyal" value={`${filtered.length ? Math.round(negative / filtered.length * 100) : 0}%`} note={`${negative} olumsuz konuşma`} color="rose" />
        <Metric icon={<Lightbulb size={17} />} label="Tespit edilen sorun" value={insights.length} note="Benzersiz sorun kümesi" color="purple" />
        <Metric icon={<Sparkles size={17} />} label="Özellik talebi" value={featureCount} note="Konuşmalarda bulundu" color="blue" />
      </div>
      <div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-heading"><div><h2>Müşteri duygu eğilimi</h2><p>Günlük konuşma hacmi · seçili dönemden</p></div><span className="demo-tag">DEMO ANALİZ</span></div>
        <div className="chart-legend"><span><i className="legend-teal" />Olumlu</span><span><i className="legend-rose" />Olumsuz</span></div>
        <div className="chart-wrap">{filtered.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 5, left: -22, bottom: 0 }}><defs><linearGradient id="positiveFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#12a895" stopOpacity={0.18} /><stop offset="95%" stopColor="#12a895" stopOpacity={0} /></linearGradient><linearGradient id="negativeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ee7184" stopOpacity={0.16} /><stop offset="95%" stopColor="#ee7184" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#eef0f3" vertical={false} /><XAxis dataKey="gün" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9199a8" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9199a8" }} allowDecimals={false} /><Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #edf0f4", fontSize: 12 }} /><Area type="monotone" dataKey="olumlu" name="Olumlu" stroke="#11a996" fill="url(#positiveFill)" strokeWidth={2.5} /><Area type="monotone" dataKey="olumsuz" name="Olumsuz" stroke="#ed7184" fill="url(#negativeFill)" strokeWidth={2.5} /></AreaChart></ResponsiveContainer> : <p className="muted">Bu filtreler için veri bulunamadı.</p>}</div>
        </section><section className="panel issues-panel"><div className="panel-heading"><div><h2>Öne çıkan sorunlar</h2><p>Tekrarlanan müşteri sinyalleri</p></div><Link className="text-link" to="/app/insights">Tümünü gör <ArrowRight size={14} /></Link></div>{insights.slice(0, 4).map((issue) => <Link className="issue-row" to="/app/insights" key={issue.title}><span className="issue-icon"><AlertTriangle size={16} /></span><span className="issue-main"><b>{issue.title}</b><small>{issue.count} konuşma · {issue.category}</small></span><span className={priorityClass(issue.priority)}>{issue.priority}</span></Link>)}</section></div>
      <div className="lower-grid"><section className="panel"><div className="panel-heading"><div><h2>Son konuşmalar</h2><p>Müşterilerinizden gelen son sinyaller</p></div><Link className="text-link" to="/app/conversations">Tüm konuşmalar <ArrowRight size={14} /></Link></div><ConversationTable conversations={filtered.slice(0, 5)} compact /></section><section className="panel recommendations"><div className="panel-heading"><div><h2>Önerilen aksiyonlar</h2><p>Öncelikli takip gerektiren işler</p></div><ListTodo size={17} className="muted-icon" /></div>{tasks.filter((task) => task.status !== "Tamamlandı").slice(0, 3).map((task) => <div className="recommendation" key={task.id}><span className="recommend-dot" /><div><b>{task.title}</b><small>{task.assignee} · Son tarih {dateLabel(task.dueDate)}</small></div><span className={priorityClass(task.priority)}>{task.priority}</span></div>)}{!tasks.some((task) => task.status !== "Tamamlandı") && <p className="muted">Bekleyen aksiyon yok.</p>}<Link to="/app/actions" className="text-link all-actions">Aksiyon merkezine git <ArrowRight size={14} /></Link></section></div>
    </>}
    <div className="demo-disclaimer"><ShieldCheck size={15} /><span>Demo modu: Gösterilen veriler kurmaca örneklerden oluşur. Gerçek müşteri araştırması veya AI modeli sonucu değildir.</span><Link to="/app/settings">Analiz ayarları</Link></div>
  </>;
}
function Metric({ icon, label, value, note, color }: { icon: React.ReactNode; label: string; value: string | number; note: string; color: string }) {
  return <div className="metric-card"><div className={`metric-icon metric-${color}`}>{icon}</div><span className="metric-label">{label}</span><strong>{value}</strong><small>{note}</small></div>;
}
function EmptyState({ icon, title, text, action, secondary }: { icon: React.ReactNode; title: string; text: string; action?: React.ReactNode; secondary?: React.ReactNode }) {
  return <div className="empty-state"><span className="empty-icon">{icon}</span><h2>{title}</h2><p>{text}</p><div className="empty-actions">{action}{secondary}</div></div>;
}

function ConversationTable({ conversations, compact = false }: { conversations: Conversation[]; compact?: boolean }) {
  return <div className="table-scroll"><table><thead><tr><th>KONUŞMA</th><th>KANAL</th><th>DUYGU</th><th>KATEGORİ</th><th>TARİH</th>{!compact && <th>GÜVEN</th>}</tr></thead><tbody>{conversations.map((conversation) => <tr key={conversation.id}><td><Link className="conversation-cell" to={`/app/conversations/${conversation.id}`}><b>{conversation.id}</b><span>{conversation.message}</span></Link></td><td><span className="channel-cell">{conversation.channel}</span></td><td><span className={sentimentClass(conversation.sentiment)}><i />{conversation.sentiment}</span></td><td><span className="category-label">{conversation.category}</span></td><td className="date-cell">{dateLabel(conversation.date)}</td>{!compact && <td><span className={conversation.confidence < 0.7 ? "confidence low-confidence" : "confidence"}>{Math.round(conversation.confidence * 100)}%</span></td>}</tr>)}{!conversations.length && <tr><td colSpan={compact ? 5 : 6} className="no-results">Filtrelerle eşleşen konuşma bulunamadı.</td></tr>}</tbody></table></div>;
}
function Conversations({ conversations }: { conversations: Conversation[] }) {
  const [query, setQuery] = useState("");
  const [sentiment, setSentiment] = useState("Tüm duygular");
  const [category, setCategory] = useState("Tüm kategoriler");
  const [channel, setChannel] = useState("Tüm kanallar");
  const [region, setRegion] = useState("Tüm bölgeler");
  const filtered = conversations.filter((item) =>
    `${item.id} ${item.message} ${item.issue}`.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")) &&
    (sentiment === "Tüm duygular" || sentiment === item.sentiment) &&
    (category === "Tüm kategoriler" || category === item.category) &&
    (channel === "Tüm kanallar" || channel === item.channel) &&
    (region === "Tüm bölgeler" || region === item.region));
  const download = () => downloadCsv(exportConversations(filtered), "diyalogradar-konusmalar.csv");
  return <><PageTitle eyebrow="MÜŞTERİ SESİ" title="Konuşmalar" description="Müşteri mesajlarını arayın, filtreleyin ve dayandıkları kanıtları inceleyin." action={<button className="button button-secondary" onClick={download}><ArrowDownToLine size={16} />Dışa aktar ({filtered.length})</button>} />
    <div className="panel conversation-panel">    <div className="toolbar"><label className="search-box"><Search size={17} /><input placeholder="Konuşmalarda ara..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><select className="select-control" value={sentiment} onChange={(event) => setSentiment(event.target.value)}><option>Tüm duygular</option><option>Olumsuz</option><option>Nötr</option><option>Olumlu</option></select><select className="select-control" value={category} onChange={(event) => setCategory(event.target.value)}><option>Tüm kategoriler</option>{[...new Set(conversations.map((item) => item.category))].map((item) => <option key={item}>{item}</option>)}</select><select className="select-control" value={channel} onChange={(event) => setChannel(event.target.value)}><option>Tüm kanallar</option>{[...new Set(conversations.map((item) => item.channel))].map((item) => <option key={item}>{item}</option>)}</select><select className="select-control" value={region} onChange={(event) => setRegion(event.target.value)}><option>Tüm bölgeler</option>{[...new Set(conversations.map((item) => item.region).filter(Boolean))].map((item) => <option key={item}>{item}</option>)}</select></div>
      <div className="table-summary"><span><b>{filtered.length}</b> konuşma listeleniyor</span><button className="text-link reset-button" onClick={() => { setQuery(""); setSentiment("Tüm duygular"); setCategory("Tüm kategoriler"); setChannel("Tüm kanallar"); setRegion("Tüm bölgeler"); }}>Filtreleri temizle</button></div><ConversationTable conversations={filtered} /><div className="table-footer">Kayıtların tamamı gösteriliyor <span>Sayfa 1 / 1</span></div></div>
    {!conversations.length && <div className="inline-empty">Henüz veri yok. <Link to="/app/import">Konuşma içe aktarın</Link>.</div>}
  </>;
}
function ConversationDetail({ conversations }: { conversations: Conversation[] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const conversation = conversations.find((item) => item.id === id);
  if (!conversation) return <EmptyState icon={<Search size={22} />} title="Konuşma bulunamadı" text="Bu konuşma silinmiş veya mevcut çalışma alanında bulunmuyor." action={<button className="button button-secondary" onClick={() => navigate("/app/conversations")}>Konuşmalara dön</button>} />;
  return <><button className="back-link" onClick={() => navigate("/app/conversations")}>← Tüm konuşmalara dön</button><PageTitle eyebrow={`KONUŞMA · ${conversation.id}`} title="Konuşma detayı" description={`${dateLabel(conversation.date)} · ${conversation.channel}${conversation.region ? ` · ${conversation.region}` : ""}`} action={<span className={sentimentClass(conversation.sentiment)}><i />{conversation.sentiment}</span>} />
    <div className="detail-grid"><section className="panel detail-message"><div className="panel-heading"><div><h2>Orijinal mesaj</h2><p>Anonim müşteri · {conversation.channel}</p></div><MessageCircle size={18} className="muted-icon" /></div><blockquote>{conversation.message}</blockquote><div className="message-meta"><span>{dateLabel(conversation.date)}</span><span>Kimlik anonimleştirildi</span></div></section><section className="panel analysis-card"><div className="panel-heading"><div><span className="eyebrow">YEREL DİL RADARI</span><h2>Demo analiz sonucu</h2></div><span className="demo-tag">DEMO</span></div><div className="analysis-item"><small>Ana sorun</small><b>{conversation.issue}</b></div><div className="analysis-item"><small>Kategori</small><span className="category-label">{conversation.category}</span></div><div className="analysis-item"><small>Müşteri sürtünmesi</small><b>{conversation.friction}</b></div>{conversation.feature && <div className="analysis-item"><small>Özellik talebi</small><b>{conversation.feature}</b></div>}<div className="analysis-item"><small>Öncelik sinyali</small><span className={priorityClass(conversation.urgency)}>{conversation.urgency}</span></div><div className="analysis-item"><small>Analiz güveni</small><ConfidenceBar confidence={conversation.confidence} /></div><div className="evidence-box"><b><Check size={14} /> Kaynak kanıt</b><p>“{conversation.evidence}”</p><small>Kanıt, özgün müşteri mesajından alınmıştır.</small></div>{conversation.confidence < 0.7 && <div className="warning-box"><AlertTriangle size={15} /> Düşük güven: insan incelemesi önerilir.</div>}</section></div></>;
}
function ConfidenceBar({ confidence }: { confidence: number }) { return <div className="confidence-bar"><span><i style={{ width: `${confidence * 100}%` }} /></span><b>{Math.round(confidence * 100)}%</b></div>; }

function Insights({ conversations, onCreateTask }: { conversations: Conversation[]; onCreateTask: (issue: string) => void }) {
  const issues = clusterIssues(conversations);
  const [selected, setSelected] = useState("");
  const selectedIssue = issues.find((issue) => issue.title === selected);
  const featureRequests = conversations.filter((item) => item.feature);
  return <><PageTitle eyebrow="YEREL DİL RADARI" title="İçgörü laboratuvarı" description="Tekrar eden müşteri sorunlarını ve ürün fırsatlarını, kaynak konuşmalarla birlikte keşfedin." action={<span className="demo-tag"><Sparkles size={13} /> Demo analiz</span>} />
    <div className="insight-intro"><span className="insight-intro-icon"><Sparkles size={20} /></span><div><b>Öncelik puanı nasıl hesaplanır?</b><p>Şeffaf demo puanı; konuşma sıklığı, yüksek aciliyet sinyalleri ve son 7 gündeki kayıtları birlikte değerlendirir. Finansal etki tahmini değildir.</p></div><span className="formula">Sıklık + aciliyet + güncellik</span></div>
    <div className="section-heading"><div><h2>Tekrarlanan sorunlar</h2><p>Kaynak konuşmalarla izlenebilir kümeler</p></div><span className="result-count">{issues.length} sorun kümesi</span></div>
    {issues.length ? <div className="insight-layout"><div className="insight-list">{issues.map((issue) => <button className={`insight-card ${selected === issue.title ? "insight-selected" : ""}`} key={issue.title} onClick={() => setSelected(selected === issue.title ? "" : issue.title)}><div className="insight-card-top"><span className="issue-icon"><AlertTriangle size={16} /></span><span className={priorityClass(issue.priority)}>{issue.priority}</span></div><h3>{issue.title}</h3><p>{issue.summary}</p><div className="insight-card-footer"><span><MessageCircle size={14} />{issue.count} konuşma</span><span>Puan <b>{issue.score}/100</b></span></div><div className="score-track"><i style={{ width: `${issue.score}%` }} /></div></button>)}</div>
      <div className="panel insight-detail">{selectedIssue ? <><div className="panel-heading"><div><span className="eyebrow">SORUN KÜMESİ</span><h2>{selectedIssue.title}</h2></div><button className="button button-primary button-small" onClick={() => onCreateTask(selectedIssue.title)}><Plus size={15} />Aksiyon oluştur</button></div><p className="detail-summary">{selectedIssue.summary} Öncelik puanı {selectedIssue.score}/100; gösterilen örneklem büyüklüğü {selectedIssue.count} konuşma.</p><div className="detail-stat-grid"><div><small>Konuşma sayısı</small><b>{selectedIssue.count}</b></div><div><small>Öncelik puanı</small><b>{selectedIssue.score}<small>/100</small></b></div><div><small>Kategori</small><b>{selectedIssue.category}</b></div></div><h3 className="subheading">Kaynak konuşmalar</h3>{selectedIssue.conversations.map((item) => <Link to={`/app/conversations/${item.id}`} className="evidence-conversation" key={item.id}><span className="evidence-id">{item.id}</span><span>“{item.evidence}”</span><ArrowRight size={15} /></Link>)}<div className="recommend-box"><Lightbulb size={16} /><span><b>Önerilen sonraki adım</b><small>Konuşma kanıtlarını inceleyin ve kök neden için sorumlu bir ekip atayın.</small></span></div></> : <div className="detail-placeholder"><span className="empty-icon"><Lightbulb size={22} /></span><h3>Bir sorun kümesi seçin</h3><p>Öncelik puanını, kanıtları ve önerilen aksiyonu görüntüleyin.</p></div>}</div></div> : <EmptyState icon={<Lightbulb size={22} />} title="Henüz içgörü oluşturulamadı" text="Konuşmaları yüklediğinizde tekrar eden sorun kümeleri burada görünür." action={<Link to="/app/import" className="button button-primary">Konuşma ekle</Link>} />}
    <div className="section-heading feature-heading"><div><h2>Öne çıkan özellik talepleri</h2><p>Müşterilerin ürününüzde görmek istediği geliştirmeler</p></div><span className="result-count">{featureRequests.length} talep</span></div><div className="panel feature-request-list">{featureRequests.length ? [...new Set(featureRequests.map((item) => item.feature))].map((feature) => { const items = featureRequests.filter((item) => item.feature === feature); return <div className="feature-request-row" key={feature}><span className="feature-bulb"><Sparkles size={16} /></span><div><b>{feature}</b><small>{items.length} konuşma · {items[0].category}</small></div><span className="request-count">{items.length}</span><button className="text-link" onClick={() => onCreateTask(feature!)}>Aksiyon oluştur <ArrowRight size={14} /></button></div>; }) : <p className="muted pad-20">Henüz özellik talebi tespit edilmedi.</p>}</div>
    <div className="region-note"><Activity size={16} /><span><b>Bölgesel karşılaştırma</b> Yalnızca konuşmada açıkça belirtilmiş bölge bilgisi kullanılır; dil veya kimlikten bölge tahmin edilmez.</span><Link to="/app/conversations">Bölgeleri keşfet <ArrowRight size={14} /></Link></div>
  </>;
}

function Actions({ tasks, onChange }: { tasks: ActionTask[]; onChange: (tasks: ActionTask[]) => void }) {
  const [filter, setFilter] = useState("Tüm durumlar");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [editing, setEditing] = useState<ActionTask | null>(null);
  const filtered = tasks.filter((task) => (filter === "Tüm durumlar" || task.status === filter) && `${task.title} ${task.description} ${task.assignee}`.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")));
  const create = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onChange([{ id: `task-${Date.now()}`, title: title.trim(), description: "Elle oluşturulan aksiyon.", priority: "Orta", status: "Yapılacak", assignee: "Atanmadı", dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) }, ...tasks]);
    setTitle(""); setCreating(false);
  };
  const patchTask = (id: string, patch: Partial<ActionTask>) => onChange(tasks.map((task) => task.id === id ? { ...task, ...patch } : task));
  const removeTask = (id: string) => { if (window.confirm("Bu aksiyon silinsin mi?")) onChange(tasks.filter((task) => task.id !== id)); };
  return <><PageTitle eyebrow="İÇGÖRÜDEN AKSİYONA" title="Aksiyon merkezi" description="Müşteri içgörülerini sahipli, öncelikli ve takip edilebilir işlere dönüştürün." action={<button className="button button-primary" onClick={() => setCreating(!creating)}><Plus size={16} />Yeni aksiyon</button>} />
    <div className="task-summary"><div><span className="task-summary-icon task-purple"><ListTodo size={18} /></span><small>Toplam aksiyon</small><b>{tasks.length}</b></div><div><span className="task-summary-icon task-amber"><Clock3 size={18} /></span><small>Devam eden</small><b>{tasks.filter((task) => task.status === "Devam Ediyor").length}</b></div><div><span className="task-summary-icon task-green"><CheckCircle2 size={18} /></span><small>Tamamlanan</small><b>{tasks.filter((task) => task.status === "Tamamlandı").length}</b></div></div>
    {creating && <form className="panel create-task-form" onSubmit={create}><div><label htmlFor="task-title">Aksiyon başlığı</label><input autoFocus id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Örn. Teslimat sürecini incele" required /></div><button className="button button-primary" type="submit"><Plus size={15} />Oluştur</button><button className="icon-button" type="button" onClick={() => setCreating(false)} aria-label="İptal"><X size={17} /></button></form>}
    <div className="panel tasks-panel"><div className="toolbar"><label className="search-box"><Search size={17} /><input placeholder="Aksiyonlarda ara..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><select className="select-control" value={filter} onChange={(event) => setFilter(event.target.value)}><option>Tüm durumlar</option><option>Yapılacak</option><option>Devam Ediyor</option><option>İncelemede</option><option>Tamamlandı</option></select></div>
      <div className="task-list">{filtered.map((task) => <div className="task-row" key={task.id}><span className={`task-check ${task.status === "Tamamlandı" ? "task-check-done" : ""}`}>{task.status === "Tamamlandı" && <Check size={13} />}</span><div className="task-content"><b className={task.status === "Tamamlandı" ? "task-done-title" : ""}>{task.title}</b><p>{task.description}</p><div className="task-meta"><span><i className="assignee-dot" />{task.assignee || "Atanmadı"}</span><span><Clock3 size={13} />{dateLabel(task.dueDate)}</span>{task.sourceIssue && <span><Lightbulb size={13} />{task.sourceIssue}</span>}</div></div><span className={priorityClass(task.priority)}>{task.priority}</span><select aria-label={`${task.title} durumu`} className="select-control status-select" value={task.status} onChange={(event) => patchTask(task.id, { status: event.target.value as TaskStatus })}><option>Yapılacak</option><option>Devam Ediyor</option><option>İncelemede</option><option>Tamamlandı</option></select><select aria-label={`${task.title} önceliği`} className="select-control status-select priority-select" value={task.priority} onChange={(event) => patchTask(task.id, { priority: event.target.value as Priority })}><option>Yüksek</option><option>Orta</option><option>Düşük</option></select><button className="icon-button" aria-label="Aksiyonu düzenle" onClick={() => setEditing(task)}><Pencil size={14} /></button><button className="icon-button delete-task" aria-label="Aksiyonu sil" onClick={() => removeTask(task.id)}><Trash2 size={15} /></button></div>)}{!filtered.length && <div className="task-empty"><ListTodo size={25} /><b>{tasks.length ? "Bu filtrede aksiyon yok" : "Henüz aksiyon oluşturulmadı"}</b><p>İçgörüleri aksiyona dönüştürerek müşteri sorunlarını takip edin.</p><Link to="/app/insights" className="text-link">İçgörüleri incele <ArrowRight size={14} /></Link></div>}</div>
    </div>
    {editing && <TaskEditModal task={editing} onClose={() => setEditing(null)} onSave={(updated) => { patchTask(editing.id, updated); setEditing(null); }} />}
  </>;
}
function TaskEditModal({ task, onClose, onSave }: { task: ActionTask; onClose: () => void; onSave: (patch: Partial<ActionTask>) => void }) {
  const [draft, setDraft] = useState(task);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) return;
    onSave({ title: draft.title.trim(), description: draft.description.trim(), assignee: draft.assignee.trim(), dueDate: draft.dueDate, priority: draft.priority });
  };
  return <div className="modal-scrim"><form className="edit-task-modal" onSubmit={submit}><div className="panel-heading"><div><span className="eyebrow">AKSİYONU DÜZENLE</span><h2>Görev ayrıntıları</h2></div><button type="button" className="icon-button" aria-label="Kapat" onClick={onClose}><X size={17} /></button></div>
    <label>Başlık<input required maxLength={120} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
    <label>Açıklama<textarea maxLength={1000} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
    <div className="edit-task-row"><label>Öncelik<select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as Priority })}><option>Yüksek</option><option>Orta</option><option>Düşük</option></select></label><label>Sorumlu<input maxLength={80} value={draft.assignee} onChange={(event) => setDraft({ ...draft, assignee: event.target.value })} placeholder="Atanmadı" /></label></div>
    <label>Son tarih<input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} /></label>
    <div className="edit-task-actions"><button type="button" className="button button-secondary" onClick={onClose}>Vazgeç</button><button type="submit" className="button button-primary"><Check size={14} />Değişiklikleri kaydet</button></div>
  </form></div>;
}

function ImportPage({ conversations, onImport, notify, onLoadDemo }: { conversations: Conversation[]; onImport: (rows: Conversation[]) => void; notify: (message: string) => void; onLoadDemo: () => void }) {
  const [preview, setPreview] = useState<Conversation[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [rawText, setRawText] = useState("");
  const [busy, setBusy] = useState(false);
  const parseFile = async (file?: File) => {
    if (!file) return;
    setErrors([]); setPreview(null);
    if (!file.name.toLocaleLowerCase("tr-TR").endsWith(".csv")) { setErrors(["Yalnızca .csv dosyaları kabul edilir."]); return; }
    if (file.size > 5 * 1024 * 1024) { setErrors(["Dosya boyutu 5 MB sınırını aşıyor."]); return; }
    setBusy(true);
    try {
      const content = (await file.text()).replace(/^\uFEFF/, "");
      const parsed = parseCsv(content);
      if (parsed.errors.length) { setErrors(parsed.errors); return; }
      if (parsed.rows.length < 2) { setErrors(["CSV en az bir veri satırı ve başlık satırı içermelidir."]); return; }
      if (parsed.rows.length > 501) { setErrors(["Tek seferde en fazla 500 konuşma yüklenebilir."]); return; }
      const headers = parsed.rows[0].map((header) => header.trim().toLocaleLowerCase("tr-TR"));
      if (headers.some((header) => !header) || new Set(headers).size !== headers.length) { setErrors(["CSV sütun başlıkları boş olamaz ve tekrar etmemelidir."]); return; }
      const messageIndex = headers.findIndex((header) => ["mesaj", "message", "konuşma", "text", "metin"].includes(header));
      if (messageIndex < 0) { setErrors(["Mesaj sütunu bulunamadı. Sütun başlığını 'mesaj' veya 'message' olarak adlandırın."]); return; }
      const idIndex = headers.findIndex((header) => ["id", "konuşma id", "conversation_id"].includes(header));
      const dateIndex = headers.findIndex((header) => ["tarih", "date", "timestamp"].includes(header));
      const channelIndex = headers.findIndex((header) => ["kanal", "channel"].includes(header));
      const regionIndex = headers.findIndex((header) => ["bölge", "bolge", "region", "şehir", "sehir"].includes(header));
      const categoryIndex = headers.findIndex((header) => ["kategori", "category"].includes(header));
      const next: Conversation[] = [];
      const rowErrors: string[] = [];
      const existing = new Set(conversations.map((conversation) => conversation.message.trim().toLocaleLowerCase("tr-TR")));
      parsed.rows.slice(1).forEach((row, index) => {
        if (row.length !== headers.length) { rowErrors.push(`${index + 2}. satır: ${headers.length} sütun bekleniyordu, ${row.length} bulundu.`); return; }
        const message = (row[messageIndex] ?? "").trim();
        if (!message) { rowErrors.push(`${index + 2}. satır: mesaj alanı boş.`); return; }
        if (message.length > 5000) { rowErrors.push(`${index + 2}. satır: mesaj 5.000 karakter sınırını aşıyor.`); return; }
        if (existing.has(message.toLocaleLowerCase("tr-TR"))) { rowErrors.push(`${index + 2}. satır: aynı mesaj daha önce içe aktarılmış.`); return; }
        if (dateIndex >= 0 && row[dateIndex]?.trim() && Number.isNaN(Date.parse(row[dateIndex]))) { rowErrors.push(`${index + 2}. satır: tarih alanı geçerli bir tarih değil.`); return; }
        existing.add(message.toLocaleLowerCase("tr-TR"));
        const categoryFromCsv = row[categoryIndex];
        const analysis = analyzeImported(message);
        next.push({
          id: idIndex >= 0 && row[idIndex]?.trim() ? row[idIndex].trim() : `DR-${Date.now().toString().slice(-6)}-${index + 1}`,
          date: dateIndex >= 0 && row[dateIndex] && !Number.isNaN(Date.parse(row[dateIndex])) ? new Date(row[dateIndex]).toISOString() : new Date().toISOString(),
          channel: channelIndex >= 0 && row[channelIndex]?.trim() ? row[channelIndex].trim() : "İçe aktarıldı",
          region: regionIndex >= 0 && row[regionIndex]?.trim() ? row[regionIndex].trim() : undefined,
          ...analysis,
          category: categoryFromCsv?.trim() || analysis.category,
        });
      });
      setErrors(rowErrors);
      if (next.length) setPreview(next);
      else if (!rowErrors.length) setErrors(["İçe aktarılacak geçerli satır bulunamadı."]);
    } catch (error) {
      setErrors([`Dosya okunamadı: ${error instanceof Error ? error.message : "Beklenmeyen okuma hatası."}`]);
    } finally { setBusy(false); }
  };
  const commitImport = () => {
    if (!preview) return;
    onImport([...preview, ...conversations]);
    notify(`${preview.length} konuşma başarıyla içe aktarıldı.`);
    setPreview(null);
  };
  const importText = () => {
    const message = rawText.trim();
    if (!message) { setErrors(["İçe aktarmak için bir konuşma metni girin."]); return; }
    const analysis = analyzeImported(message);
    onImport([{ id: `DR-${Date.now().toString().slice(-6)}`, date: new Date().toISOString(), channel: "Metin girişi", ...analysis }, ...conversations]);
    setRawText(""); setErrors([]); notify("Konuşma başarıyla eklendi.");
  };
  return <><PageTitle eyebrow="VERİ YÖNETİMİ" title="Konuşma içe aktar" description="CSV dosyanızı yükleyin veya bir konuşma metnini doğrudan ekleyin." />
    <div className="import-layout"><div className="import-main"><section className="panel import-step"><div className="step-heading"><span>1</span><div><h2>CSV dosyası yükleyin</h2><p>UTF-8 CSV · En fazla 5 MB ve 500 satır</p></div></div><label className="dropzone"><input type="file" accept=".csv,text/csv" onChange={(event) => parseFile(event.target.files?.[0])} /><span className="upload-circle">{busy ? <LoaderCircle className="spin" size={22} /> : <Upload size={22} />}</span><b>{busy ? "Dosya okunuyor..." : "Dosyanızı buraya bırakın veya göz atın"}</b><small>.csv dosyaları desteklenir</small></label>
      <a className="template-link" href={`data:text/csv;charset=utf-8,%EF%BB%BFmesaj,kanal,tarih,b%C3%B6lge%0A%22Kargom h%C3%A2l%C3%A2 gelmedi%22,WhatsApp,2026-10-01,%C4%B0stanbul`} download="diyalogradar-ornek-sablon.csv"><ArrowDownToLine size={15} />Örnek CSV şablonunu indir</a>
      {preview && <div className="import-preview"><div className="preview-success"><CheckCircle2 size={17} /><b>{preview.length} geçerli satır önizlemeye hazır</b></div><div className="preview-table">{preview.slice(0, 4).map((row) => <div key={row.id}><span>{row.id}</span><span>{row.message}</span><span>{row.category}</span></div>)}</div><button className="button button-primary" onClick={commitImport}><Check size={15} />{preview.length} konuşmayı içe aktar</button></div>}
      {errors.length > 0 && <div className="validation-errors"><b><AlertTriangle size={15} /> Bazı satırlar içe aktarılamadı</b><ul>{errors.slice(0, 10).map((error, index) => <li key={`${error}-${index}`}>{error}</li>)}</ul>{errors.length > 10 && <small>İlk 10 hata gösteriliyor; toplam {errors.length} hata.</small>}</div>}
    </section><section className="panel import-step"><div className="step-heading"><span>2</span><div><h2>Metinden içe aktarın</h2><p>Tek bir müşteri konuşmasını hızlıca ekleyin.</p></div></div><textarea className="text-entry" value={rawText} onChange={(event) => setRawText(event.target.value)} placeholder="Örn. 3 kere yazdım hâlâ dönüş yok, sipariş de ortada yok." maxLength={5000} /><div className="text-entry-bottom"><span>{rawText.length}/5.000 karakter</span><button className="button button-secondary" onClick={importText}><Plus size={15} />Konuşmayı ekle</button></div></section></div>
      <aside className="import-aside"><section className="panel import-help"><span className="aside-icon"><FileText size={18} /></span><h3>CSV sütunları</h3><p>Zorunlu alan</p><code>mesaj</code><p>İsteğe bağlı alanlar</p><code>id · tarih · kanal · kategori · bölge</code><hr /><p>Başlıklar Türkçe veya İngilizce olabilir. Eksik/bozuk satırlar sessizce atlanmaz; satır numarasıyla raporlanır.</p></section><section className="panel privacy-card"><ShieldCheck size={18} /><b>Verileriniz tarayıcınızda kalır</b><p>Bu demo gerçek bir AI sağlayıcısına konuşma göndermez. Veriler bu cihazdaki tarayıcı depolamasında tutulur.</p></section><button className="button button-quiet full-button" onClick={onLoadDemo}><Database size={16} />Örnek verileri yükle</button></aside></div>
  </>;
}
function analyzeImported(message: string) {
  return { message, ...analyzeMessage(message) };
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}
function Reports({ conversations, tasks }: { conversations: Conversation[]; tasks: ActionTask[] }) {
  const [period, setPeriod] = useState("30");
  const filtered = conversations.filter((item) => Date.now() - new Date(item.date).getTime() < Number(period) * 86400000);
  const insights = clusterIssues(filtered);
  const negative = filtered.filter((item) => item.sentiment === "Olumsuz").length;
  return <><PageTitle eyebrow="ANALİTİK" title="Raporlar" description="Konuşma verilerinize dayalı raporları inceleyin ve dışa aktarın." action={<button className="button button-primary" onClick={() => window.print()}><FileText size={16} />Raporu yazdır</button>} />
    <div className="report-filters"><span>Rapor dönemi</span><select className="select-control" value={period} onChange={(event) => setPeriod(event.target.value)}><option value="7">Son 7 gün</option><option value="30">Son 30 gün</option><option value="90">Son 90 gün</option></select><span className="comparison-note">Veriler konuşma kayıtlarından hesaplanır.</span></div>
    <div className="metric-grid report-metrics"><Metric icon={<MessageCircle size={17} />} label="Konuşma hacmi" value={filtered.length} note={`Son ${period} gün`} color="teal" /><Metric icon={<TrendingUp size={17} />} label="Olumsuz sinyaller" value={`${filtered.length ? Math.round(negative / filtered.length * 100) : 0}%`} note={`${negative} konuşma`} color="rose" /><Metric icon={<Lightbulb size={17} />} label="Sorun kümesi" value={insights.length} note="Tekrarlanan konu" color="purple" /><Metric icon={<ListTodo size={17} />} label="Açık aksiyon" value={tasks.filter((task) => task.status !== "Tamamlandı").length} note="Tamamlanmamış" color="blue" /></div>
    <section className="panel report-panel"><div className="panel-heading"><div><h2>Öne çıkan sorunlar</h2><p>Konuşma sayısına göre sıralanmıştır · Son {period} gün</p></div><button className="button button-secondary button-small" onClick={() => downloadCsv(exportConversations(filtered), "diyalogradar-rapor.csv")}><ArrowDownToLine size={15} />CSV indir</button></div><div className="report-issue-list">{insights.slice(0, 8).map((issue) => <div className="report-issue" key={issue.title}><span>{issue.title}</span><span className="report-bar"><i style={{ width: `${Math.max(5, issue.count / Math.max(1, ...insights.map((item) => item.count)) * 100)}%` }} /></span><b>{issue.count}</b><span className={priorityClass(issue.priority)}>{issue.priority}</span></div>)}{!insights.length && <p className="muted">Dönem için konuşma verisi bulunamadı.</p>}</div></section>
    <section className="panel report-panel"><div className="panel-heading"><div><h2>Aksiyon durumu özeti</h2><p>Çalışma alanındaki tüm aksiyonlar</p></div><button className="button button-secondary button-small" onClick={() => downloadCsv(["Başlık,Açıklama,Durum,Öncelik,Sorumlu,Son tarih", ...tasks.map((task) => [task.title, task.description, task.status, task.priority, task.assignee, task.dueDate].map(csvCell).join(","))].join("\r\n"), "diyalogradar-aksiyonlar.csv")}><ArrowDownToLine size={15} />Aksiyonları indir</button></div><div className="task-summary report-task-summary">{(["Yapılacak", "Devam Ediyor", "İncelemede", "Tamamlandı"] as TaskStatus[]).map((status) => <div key={status}><small>{status}</small><b>{tasks.filter((task) => task.status === status).length}</b></div>)}</div></section>
    <div className="demo-disclaimer"><ShieldCheck size={15} /> Raporlar yalnızca bu tarayıcıda saklanan konuşma verilerinden üretilir.</div>
  </>;
}
function csvCell(value: string) { return `"${(/^[\s]*[=+\-@]/.test(value) ? `'${value}` : value).replace(/"/g, '""')}"`; }
function SettingsPage({ conversations, onDelete, notify, onLoadDemo }: { conversations: Conversation[]; onDelete: () => void; notify: (message: string) => void; onLoadDemo: () => void }) {
  const [confirmReset, setConfirmReset] = useState(false);
  return <><PageTitle eyebrow="ÇALIŞMA ALANI" title="Ayarlar" description="Analiz modu, demo verileri ve gizlilik tercihlerinizi yönetin." />
    <div className="settings-layout"><div className="settings-main"><section className="panel settings-section"><div className="settings-heading"><span className="settings-icon settings-teal"><Sparkles size={18} /></span><div><h2>Analiz sağlayıcısı</h2><p>Konuşmaların nasıl analiz edildiğini görüntüleyin.</p></div></div><div className="provider-status"><span className="status-green-dot" /><div><b>Demo analiz modu etkin</b><small>Deterministik örnek kurallar · Harici AI sağlayıcısı kullanılmıyor</small></div><span className="demo-tag">DEMO</span></div><div className="setup-note"><AlertTriangle size={17} /><p>Demo analizi yalnızca şeffaf, örnek kural eşleştirmesi yapar; gerçek bir dil modeli çağırmaz. Gerçek sağlayıcı entegrasyonu bu MVP'de etkin değildir.</p></div><button className="button button-secondary button-small" onClick={() => notify("Demo modunda gerçek sağlayıcı bağlantısı kullanılamaz.")}>Bağlantıyı test et</button></section>
      <section className="panel settings-section"><div className="settings-heading"><span className="settings-icon settings-purple"><Database size={18} /></span><div><h2>Demo verileri</h2><p>Kurmaca örnek konuşmalarla uygulamayı deneyin.</p></div></div><div className="provider-status"><div><b>{conversations.length} konuşma kayıtlı</b><small>Bu tarayıcıdaki yerel depolamada saklanır.</small></div><button className="button button-secondary button-small" onClick={onLoadDemo}>Demo verilerini yükle</button></div></section>
      <section className="panel settings-section"><div className="settings-heading"><span className="settings-icon settings-blue"><ShieldCheck size={18} /></span><div><h2>Gizlilik ve veri saklama</h2><p>Bu cihazdaki verileri ve saklama davranışını yönetin.</p></div></div><div className="privacy-setting"><div><b>Tarayıcı içi saklama</b><small>Konuşmalar ve aksiyonlar bu cihazdaki localStorage'da tutulur.</small></div><span className="enabled-pill"><CheckCircle2 size={13} />Etkin</span></div><div className="privacy-setting"><div><b>Harici sağlayıcıya veri aktarımı</b><small>Demo modunda müşteri mesajları dış servislere gönderilmez.</small></div><span className="disabled-pill">Kapalı</span></div><div className="danger-zone"><div><b>Çalışma alanı verilerini sil</b><small>{conversations.length} konuşma ve bu tarayıcıda tutulan aksiyonlar silinir.</small></div><button className="button button-danger button-small" onClick={() => setConfirmReset(true)}><Trash2 size={14} />Tüm verileri sil</button></div></section></div>
      <aside className="panel settings-aside"><span className="aside-icon"><CircleHelp size={18} /></span><h3>Kurulum bilgisi</h3><p><b>Veritabanı:</b> Yerel tarayıcı depolaması</p><p><b>AI sağlayıcısı:</b> Demo analiz kuralları</p><p><b>Gerekli kimlik bilgisi:</b> Yok</p><p>Üretim kullanımı için sunucu taraflı depolama, kullanıcı doğrulama ve sunucu tarafında AI sağlayıcısı gerekir.</p><div className="settings-footnote"><ShieldCheck size={15} /> API anahtarlarını istemci tarafında asla saklamayın.</div></aside></div>
    {confirmReset && <div className="modal-scrim"><div className="confirm-modal"><span className="danger-modal-icon"><Trash2 size={20} /></span><h2>Tüm veriler silinsin mi?</h2><p>Konuşmalar ve aksiyonlar bu tarayıcıdan kalıcı olarak kaldırılacak. Bu işlem geri alınamaz.</p><div><button className="button button-secondary" onClick={() => setConfirmReset(false)}>Vazgeç</button><button className="button button-danger" onClick={() => { onDelete(); setConfirmReset(false); }}>Evet, tümünü sil</button></div></div></div>}
  </>;
}

export default App;
