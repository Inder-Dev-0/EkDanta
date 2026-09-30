import {useEffect,useState} from "react";
import type {Page} from "./data";
import {navItems} from "./data";
import {Topbar} from "./components/Topbar";
import {Sidebar} from "./components/Sidebar";
import {Home} from "./pages/Home";
import {NewInvestigation} from "./pages/NewInvestigation";
import {Dashboard} from "./pages/Dashboard";
import {TimelinePage} from "./pages/TimelinePage";
import {EvidencePage} from "./pages/EvidencePage";
import {EntitiesPage} from "./pages/EntitiesPage";
import {POIPage} from "./pages/POIPage";
import {AIPage} from "./pages/AIPage";
import {Report} from "./pages/Report";
import {Graph} from "./components/Graph";

export default function App(){
 const [page,setPage]=useState<Page>(()=>(sessionStorage.getItem("ekdanta-page") as Page)||"home");
 const [theme,setTheme]=useState<"dark"|"light">(()=>(localStorage.getItem("ekdanta-theme") as any)||"dark");
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem("ekdanta-theme",theme)},[theme]);
 useEffect(()=>{sessionStorage.setItem("ekdanta-page",page);window.scrollTo({top:0,behavior:"smooth"})},[page]);
 const nav=(p:Page)=>setPage(p);
 const content:any={
  home:<Home navigate={nav}/>,new:<NewInvestigation navigate={nav}/>,dashboard:<Dashboard/>,
  timeline:<TimelinePage/>,evidence:<EvidencePage/>,entities:<EntitiesPage/>,graph:<main className="page graph-page"><Graph/></main>,
  poi:<POIPage/>,ai:<AIPage/>,report:<Report/>
 };
 return <div className="app"><Topbar theme={theme} onToggle={()=>setTheme(x=>x==="dark"?"light":"dark")} onNavigate={nav}/>{page!=="home"&&<Sidebar active={page} onNavigate={nav}/>}<div className={page==="home"?"content full":"content"}>{content[page]}</div></div>
}