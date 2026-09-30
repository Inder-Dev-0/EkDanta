import {Bell,Search} from "lucide-react";
import {Brand} from "./Brand";
import {ThemeToggle} from "./ThemeToggle";
export function Topbar({theme,onToggle,onNavigate}:{theme:"dark"|"light";onToggle:()=>void;onNavigate:(p:any)=>void}){
return <header className="topbar"><Brand/><div className="top-search"><Search size={15}/><input placeholder="Search entities, files, IPs, devices..."/></div><nav className="top-nav"><button onClick={()=>onNavigate("dashboard")}>Dashboard</button><button onClick={()=>onNavigate("report")}>Reports</button><button>Settings</button></nav><ThemeToggle theme={theme} onToggle={onToggle}/><Bell size={17} className="top-muted"/><div className="avatar">A</div></header>}