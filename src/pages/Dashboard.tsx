import {StatCards} from "../components/StatCards";
import {Graph} from "../components/Graph";
import {TimelinePanel} from "../components/TimelinePanel";
import {AISummary} from "../components/AISummary";
import {EvidencePanel} from "../components/EvidencePanel";
export function Dashboard(){return <main className="page dashboard-page"><div className="case-heading"><div><span className="eyebrow">ACTIVE CASE · CASE-001</span><h1>The Midnight Leak <em>Investigating</em></h1><p>Confidential document accessed and transferred to an external server.</p></div><button className="ghost-btn">Export Case</button></div><StatCards/><Graph/><div className="dashboard-bottom"><TimelinePanel/><AISummary/></div><EvidencePanel/></main>}