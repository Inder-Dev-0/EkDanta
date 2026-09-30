import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {AnimatePresence,motion} from "framer-motion";
import {forceCenter,forceCollide,forceLink,forceManyBody,forceSimulation,forceX,forceY} from "d3-force";
import {Maximize2,Minus,Plus,RotateCcw,Search,X} from "lucide-react";
import "./Graph.css";

type NodeType="Function"|"Class"|"Method"|"Module"|"Variable"|"External";
type Relationship="calls"|"imports"|"extends"|"defines";
type GraphNode={
 id:string;label:string;type:NodeType;role:string;permissions:string;cluster:number;
 x?:number;y?:number;vx?:number;vy?:number;radius:number;degree:number;threat:string;
};
type GraphEdge={source:string|GraphNode;target:string|GraphNode;type:Relationship;phase:number};
type Camera={x:number;y:number;scale:number;rotation:number};
type Network={nodes:GraphNode[];edges:GraphEdge[];adjacent:Map<string,Set<string>>};

const palette:Record<NodeType,string>={Function:"#F5B800",Class:"#22C55E",Method:"#A855F7",Module:"#06B6D4",Variable:"#EF4444",External:"#64748B"};
const edgePalette:Record<Relationship,string>={calls:"#47D7FF",imports:"#06B6D4",extends:"#A855F7",defines:"#F5B800"};
const moduleNames=["auth","investigation","evidence","timeline","network","storage","analysis","reporting","accounts","shared","search","export","parser","policy","transport","audit","identity","ui","config","worker"];
const typeCounts:Record<NodeType,number>={Module:20,Class:64,Method:120,Function:96,Variable:54,External:46};
const virtualWidth=1200;
const virtualHeight=760;
const initialCamera:Camera={x:0,y:0,scale:1,rotation:0};

function createNetwork():Network{
 let randomState=48371;
 const random=()=>{randomState=(randomState*16807)%2147483647;return (randomState-1)/2147483646;};
 const nodes:GraphNode[]=[];
 const addNodes=(type:NodeType,count:number)=>{
  for(let i=0;i<count;i++){
   const cluster=type==="Module"?i:i%moduleNames.length;
   const suffix=String(i+1).padStart(3,"0");
   const label=type==="Module"?`src/${moduleNames[i]}/index.ts`
    :type==="Class"?`${moduleNames[cluster]}${["Controller","Service","Store","Manager","Adapter"][i%5]}`
    :type==="Method"?`${["load","save","resolve","validate","connect","dispatch"][i%6]}${["Record","Session","Policy","Evidence"][Math.floor(i/6)%4]}()`
    :type==="Function"?`${["parse","build","verify","fetch","format","merge"][i%6]}${["Input","Graph","Token","Record"][Math.floor(i/6)%4]}()`
    :type==="Variable"?`${["active","pending","current","cached","default","source"][i%6]}${["Session","Policy","Record","Node"][Math.floor(i/6)%4]}`
    :`@ekdanta/${["crypto","http","schema","logger","queue","graph"][i%6]}`;
   const role=type==="External"?"Third-party dependency":type==="Module"?"Package module":type==="Class"?"Class declaration":type==="Method"?"Class method":type==="Function"?"Function declaration":"Module variable";
   const permissions=type==="External"?"Imported · runtime":type==="Variable"?"Read / write":type==="Module"?"Import / export":"Read / execute";
   nodes.push({id:`${type.toLowerCase()}-${suffix}`,label,type,role,permissions,cluster,x:random()*virtualWidth,y:random()*virtualHeight,radius:4,degree:0,threat:"Low"});
  }
 };
 (Object.keys(typeCounts) as NodeType[]).forEach(type=>addNodes(type,typeCounts[type]));

 const nodesByType=new Map<NodeType,GraphNode[]>();
 for(const node of nodes){const values=nodesByType.get(node.type)??[];values.push(node);nodesByType.set(node.type,values);}
 const links:GraphEdge[]=[];
 const edgeKeys=new Set<string>();
 const addEdge=(source:GraphNode,target:GraphNode,type:Relationship)=>{
  if(source===target)return false;
  const key=`${source.id}>${target.id}`;
  if(edgeKeys.has(key))return false;
  edgeKeys.add(key);
  links.push({source:source.id,target:target.id,type,phase:random()});
  source.degree++;
  target.degree++;
  return true;
 };
 const byCluster=(type:NodeType,cluster:number)=>nodesByType.get(type)!.filter(node=>node.cluster===cluster);

 for(const module of nodesByType.get("Module")!){
  for(const node of byCluster("Class",module.cluster))addEdge(module,node,"defines");
  for(const node of byCluster("Function",module.cluster))addEdge(module,node,"defines");
  const external=nodesByType.get("External")![module.cluster%nodesByType.get("External")!.length];
  addEdge(module,external,"imports");
 }
 for(const node of nodesByType.get("Class")!){
  for(const method of byCluster("Method",node.cluster).filter((_,index)=>index%4===node.degree%4).slice(0,2))addEdge(node,method,"defines");
 }
 for(const node of nodesByType.get("Variable")!){
  const owners=[...byCluster("Class",node.cluster),...byCluster("Module",node.cluster)];
  if(owners.length)addEdge(owners[Math.floor(random()*owners.length)],node,"defines");
 }

 const classNodes=nodesByType.get("Class")!;
 for(let i=0;i<32;i++)addEdge(classNodes[i],classNodes[(i+1+Math.floor(random()*10))%classNodes.length],"extends");
 const sourcePools:Record<Relationship,NodeType[]>={calls:["Method","Function"],imports:["Module","Class","Function"],extends:["Class"],defines:["Module","Class"]};
 const targetPools:Record<Relationship,NodeType[]>={calls:["Method","Function"],imports:["Module","External"],extends:["Class"],defines:["Method","Function","Variable","Class"]};
 const relationships:Relationship[]=["calls","calls","calls","imports","imports","extends","defines"];
 while(links.length<1000){
  const type=relationships[Math.floor(random()*relationships.length)];
  const sourceType=sourcePools[type][Math.floor(random()*sourcePools[type].length)];
  const targetType=targetPools[type][Math.floor(random()*targetPools[type].length)];
  const sources=nodesByType.get(sourceType)!;
  const targets=nodesByType.get(targetType)!;
  const source=sources[Math.floor(random()*sources.length)];
  let target=targets[Math.floor(random()*targets.length)];
  if(type==="extends"&&source.cluster!==target.cluster)continue;
  if(type==="defines"&&source.cluster!==target.cluster)continue;
  if(!addEdge(source,target,type)&&links.length<1000){
   target=targets[(targets.indexOf(target)+1)%targets.length];
   addEdge(source,target,type);
  }
 }

 const adjacent=new Map(nodes.map(node=>[node.id,new Set<string>()]));
 for(const edge of links){
  const source=nodes.find(node=>node.id===edge.source)!;
  const target=nodes.find(node=>node.id===edge.target)!;
  adjacent.get(source.id)!.add(target.id);
  adjacent.get(target.id)!.add(source.id);
 }
 for(const node of nodes){
  node.radius=Math.max(4,Math.min(16,4+Math.sqrt(node.degree)*2.25+(node.type==="Module"?2:0)));
  node.threat=node.type==="External"?"Elevated":node.degree>=10?"High":node.degree>=6?"Guarded":"Low";
 }
 return {nodes,edges:links,adjacent};
}

function getEndpoint(endpoint:string|GraphNode,nodesById:Map<string,GraphNode>):GraphNode{
 return typeof endpoint==="string"?nodesById.get(endpoint)!:endpoint;
}

function bezierEase(value:number):number{
 let low=0;
 let high=1;
 let parameter=value;
 for(let i=0;i<12;i++){
  const inverse=1-parameter;
  const x=3*inverse*inverse*parameter*.25+3*inverse*parameter*parameter*.5+parameter*parameter*parameter;
  if(x<value)low=parameter;else high=parameter;
  parameter=(low+high)/2;
 }
 const inverse=1-parameter;
 return 3*inverse*inverse*parameter+3*inverse*parameter*parameter+parameter*parameter*parameter;
}

export function Graph({embedded=false}:{embedded?:boolean}){
 const canvasRef=useRef<HTMLCanvasElement>(null);
 const stageRef=useRef<HTMLDivElement>(null);
 const cameraRef=useRef<Camera>({...initialCamera});
 const targetCameraRef=useRef<Camera>({...initialCamera});
 const transitionRef=useRef<{from:Camera;to:Camera;start:number|null}|null>(null);
 const selectedRef=useRef<GraphNode|null>(null);
 const [selected,setSelected]=useState<GraphNode|null>(null);
 const [query,setQuery]=useState("");
 const network=useMemo(createNetwork,[]);
 const nodesById=useMemo(()=>new Map(network.nodes.map(node=>[node.id,node])),[network]);

 const moveCamera=useCallback((target:Camera)=>{
  transitionRef.current={from:{...cameraRef.current},to:target,start:null};
  targetCameraRef.current=target;
 },[]);

 const focusNode=useCallback((node:GraphNode,canvas:HTMLCanvasElement)=>{
  selectedRef.current=node;
  setSelected(node);
  const bounds=canvas.getBoundingClientRect();
  const fit=Math.min(bounds.width/virtualWidth,bounds.height/virtualHeight);
  const scale=1.9;
  const rotation=8*Math.PI/180;
  const targetX=bounds.width*.56-bounds.width/2;
  const targetY=bounds.height*.26-bounds.height/2;
  const offsetX=node.x!-virtualWidth/2;
  const offsetY=node.y!-virtualHeight/2;
  const rotatedX=Math.cos(rotation)*offsetX-Math.sin(rotation)*offsetY;
  const rotatedY=Math.sin(rotation)*offsetX+Math.cos(rotation)*offsetY;
  moveCamera({x:targetX-scale*fit*rotatedX,y:targetY-scale*fit*rotatedY,scale,rotation});
 },[moveCamera]);

 const resetGraph=useCallback(()=>{
  selectedRef.current=null;
  setSelected(null);
  moveCamera({...initialCamera});
 },[moveCamera]);

 useEffect(()=>{
  const canvas=canvasRef.current;
  const stage=stageRef.current;
  if(!canvas||!stage)return;
  const context=canvas.getContext("2d",{alpha:true});
  if(!context)return;
  const dpr=Math.min(window.devicePixelRatio||1,2);
    const initialFit=Math.min(stage.clientWidth/virtualWidth,stage.clientHeight/virtualHeight)||1;
  const sim=forceSimulation<GraphNode>(network.nodes)
   .force("link",forceLink<GraphNode,GraphEdge>(network.edges).id(node=>node.id).distance(edge=>edge.type==="extends"?70:48).strength(.17))
   .force("charge",forceManyBody<GraphNode>().strength(-23).distanceMax(150))
    .force("collide",forceCollide<GraphNode>().radius(node=>(node.radius+3)/initialFit).iterations(2))
   .force("center",forceCenter<GraphNode>(virtualWidth/2,virtualHeight/2))
   .force("cluster-x",forceX<GraphNode>(node=>virtualWidth/2+Math.cos(node.cluster/20*Math.PI*2)*270).strength(.07))
   .force("cluster-y",forceY<GraphNode>(node=>virtualHeight/2+Math.sin(node.cluster/20*Math.PI*2)*220).strength(.07))
   .stop();
  for(let i=0;i<220;i++)sim.tick();

  const resize=()=>{
   const rect=stage.getBoundingClientRect();
   canvas.width=Math.max(1,Math.round(rect.width*dpr));
   canvas.height=Math.max(1,Math.round(rect.height*dpr));
   canvas.style.width=`${rect.width}px`;
   canvas.style.height=`${rect.height}px`;
  };
  const observer=new ResizeObserver(resize);
  observer.observe(stage);
  resize();

  const draw=(time:number)=>{
   const width=canvas.clientWidth;
   const height=canvas.clientHeight;
   context.setTransform(dpr,0,0,dpr,0,0);
   context.clearRect(0,0,width,height);
   const transition=transitionRef.current;
   if(transition){
    if(transition.start===null)transition.start=time;
    const progress=Math.min(1,(time-transition.start)/760);
    const eased=bezierEase(progress);
    cameraRef.current={
     x:transition.from.x+(transition.to.x-transition.from.x)*eased,
     y:transition.from.y+(transition.to.y-transition.from.y)*eased,
     scale:transition.from.scale+(transition.to.scale-transition.from.scale)*eased,
     rotation:transition.from.rotation+(transition.to.rotation-transition.from.rotation)*eased
    };
    if(progress===1)transitionRef.current=null;
   }

   const camera=cameraRef.current;
   const fit=Math.min(width/virtualWidth,height/virtualHeight);
   const centerX=width/2;
   const centerY=height/2;
   const selectedNode=selectedRef.current;
   const adjacent=selectedNode?network.adjacent.get(selectedNode.id)!:null;
    const screenScale=fit*camera.scale;
   context.save();
   context.translate(centerX+camera.x,centerY+camera.y);
   context.rotate(camera.rotation);
   context.scale(fit*camera.scale,fit*camera.scale);
   context.translate(-virtualWidth/2,-virtualHeight/2);

   for(let i=0;i<network.edges.length;i++){
    const edge=network.edges[i];
    const source=getEndpoint(edge.source,nodesById);
    const target=getEndpoint(edge.target,nodesById);
    const dx=target.x!-source.x!;
    const dy=target.y!-source.y!;
    const distance=Math.hypot(dx,dy)||1;
    const ux=dx/distance;
    const uy=dy/distance;
    const sourceRadius=source.radius/fit*(source===selectedNode?1.5:1);
    const targetRadius=target.radius/fit*(target===selectedNode?1.5:1);
    const startX=source.x!+ux*sourceRadius;
    const startY=source.y!+uy*sourceRadius;
    const endX=target.x!-ux*targetRadius;
    const endY=target.y!-uy*targetRadius;
    const emphasized=source===selectedNode||target===selectedNode;
    const isRelated=!selectedNode||emphasized;
    context.globalAlpha=selectedNode&&!isRelated?.15:.46;
    context.strokeStyle=edgePalette[edge.type];
    context.lineWidth=(emphasized?1.4:.65)/screenScale;
    context.beginPath();
    context.moveTo(startX,startY);
    context.lineTo(endX,endY);
    context.stroke();

    if(i%2===0){
     const position=(time*.00065+edge.phase)%1;
     context.globalAlpha=selectedNode&&!isRelated?.15:emphasized?.98:.7;
     context.lineCap="round";
     context.strokeStyle="#8BEAFF";
     context.lineWidth=1.2/screenScale;
     context.beginPath();
     context.moveTo(startX+(endX-startX)*Math.max(0,position-.045),startY+(endY-startY)*Math.max(0,position-.045));
     context.lineTo(startX+(endX-startX)*position,startY+(endY-startY)*position);
     context.stroke();
     context.fillStyle="#E7FCFF";
     context.shadowColor="#54DFFF";
     context.shadowBlur=9/screenScale;
     context.beginPath();
     context.arc(startX+(endX-startX)*position,startY+(endY-startY)*position,1.65/screenScale,0,Math.PI*2);
     context.fill();
     context.shadowBlur=0;
    }
   }

   context.textBaseline="middle";
   for(const node of network.nodes){
    const active=!selectedNode||node===selectedNode||adjacent!.has(node.id);
    const radius=node.radius/fit*(node===selectedNode?1.5:1);
    context.globalAlpha=selectedNode&&!active?.15:.94;
    if(node===selectedNode){
     const glow=context.createRadialGradient(node.x!,node.y!,radius,node.x!,node.y!,radius*3.6);
     glow.addColorStop(0,`${palette[node.type]}AA`);
     glow.addColorStop(1,`${palette[node.type]}00`);
     context.fillStyle=glow;
     context.beginPath();
     context.arc(node.x!,node.y!,radius*3.6,0,Math.PI*2);
     context.fill();
    }
    context.fillStyle=palette[node.type];
    context.shadowColor=palette[node.type];
    context.shadowBlur=node===selectedNode?19/screenScale:node.radius>10?7/screenScale:3/screenScale;
    context.beginPath();
    context.arc(node.x!,node.y!,radius,0,Math.PI*2);
    context.fill();
    context.shadowBlur=0;
    if(node===selectedNode){
     context.globalAlpha=1;
     context.strokeStyle="#EAFBFF";
     context.lineWidth=1.25/screenScale;
     context.beginPath();
     context.arc(node.x!,node.y!,radius+3/screenScale,0,Math.PI*2);
     context.stroke();
    }
    if(node===selectedNode||(!selectedNode&&node.degree>=10)){
     context.globalAlpha=selectedNode&&!active?.15:1;
     context.fillStyle="#EAF4FF";
     context.font=`${(node===selectedNode?12:9)/screenScale}px Inter, sans-serif`;
    if(node===selectedNode){
     context.textAlign="right";
     context.fillText(node.label,node.x!-radius-7/screenScale,node.y!);
     context.textAlign="left";
    }else{
     context.textAlign="left";
     context.fillText(node.label,node.x!+radius+7/screenScale,node.y!);
    }
    }
   }
   context.restore();
   context.globalAlpha=1;
   animationFrame=requestAnimationFrame(draw);
  };
  let animationFrame=requestAnimationFrame(draw);

  const handleClick=(event:MouseEvent)=>{
   const rect=canvas.getBoundingClientRect();
   const fit=Math.min(rect.width/virtualWidth,rect.height/virtualHeight);
   const camera=cameraRef.current;
   const screenX=event.clientX-rect.left-rect.width/2-camera.x;
   const screenY=event.clientY-rect.top-rect.height/2-camera.y;
   const cosine=Math.cos(camera.rotation);
   const sine=Math.sin(camera.rotation);
   const graphX=virtualWidth/2+(cosine*screenX+sine*screenY)/(fit*camera.scale);
   const graphY=virtualHeight/2+(-sine*screenX+cosine*screenY)/(fit*camera.scale);
   let hit:GraphNode|null=null;
   let nearest=Infinity;
   for(const node of network.nodes){
    const radius=node.radius*(node===selectedRef.current?1.5:1)+5/(fit*camera.scale);
    const distance=Math.hypot(node.x!-graphX,node.y!-graphY);
    if(distance<=radius&&distance<nearest){nearest=distance;hit=node;}
   }
   if(hit)focusNode(hit,canvas);
  };
  const handlePointerMove=(event:MouseEvent)=>{
   const rect=canvas.getBoundingClientRect();
   const fit=Math.min(rect.width/virtualWidth,rect.height/virtualHeight);
   const camera=cameraRef.current;
   const screenX=event.clientX-rect.left-rect.width/2-camera.x;
   const screenY=event.clientY-rect.top-rect.height/2-camera.y;
   const cosine=Math.cos(camera.rotation);
   const sine=Math.sin(camera.rotation);
   const graphX=virtualWidth/2+(cosine*screenX+sine*screenY)/(fit*camera.scale);
   const graphY=virtualHeight/2+(-sine*screenX+cosine*screenY)/(fit*camera.scale);
   canvas.style.cursor=network.nodes.some(node=>Math.hypot(node.x!-graphX,node.y!-graphY)<node.radius+4/(fit*camera.scale))?"pointer":"default";
  };
  canvas.addEventListener("click",handleClick);
  canvas.addEventListener("mousemove",handlePointerMove);
  const handleKeyDown=(event:KeyboardEvent)=>{if(event.key==="Escape")resetGraph();};
  canvas.addEventListener("keydown",handleKeyDown);
  return ()=>{
   cancelAnimationFrame(animationFrame);
   observer.disconnect();
   sim.stop();
   canvas.removeEventListener("click",handleClick);
   canvas.removeEventListener("mousemove",handlePointerMove);
   canvas.removeEventListener("keydown",handleKeyDown);
  };
 },[focusNode,network,nodesById,resetGraph]);

 const searchGraph=()=>{
  const term=query.trim().toLowerCase();
  if(!term)return;
  const node=network.nodes.find(item=>item.label.toLowerCase().includes(term)||item.id.toLowerCase().includes(term));
  const canvas=canvasRef.current;
  if(node&&canvas)focusNode(node,canvas);
 };

 const zoomBy=(amount:number)=>{
  const current=targetCameraRef.current;
  const stage=stageRef.current;
  if(!stage)return;
  const rect=stage.getBoundingClientRect();
  const fit=Math.min(rect.width/virtualWidth,rect.height/virtualHeight);
  const scale=Math.max(.75,Math.min(2.3,current.scale+amount));
  const ratio=scale/current.scale;
  moveCamera({x:current.x*ratio,y:current.y*ratio,scale,rotation:current.rotation});
 };

 const relatedNames=selected?Array.from(network.adjacent.get(selected.id)??[]).map(id=>nodesById.get(id)!).filter(node=>node.type==="Class"||node.type==="Method").slice(0,3).map(node=>node.label):[];

 return <section className={"graph-section "+(embedded?"embedded":"")}>
  {!embedded&&<div className="graph-head">
   <div><h2>Connection Graph</h2><p>Software dependencies and live signal paths</p></div>
   <div className="graph-head-right">
    <div className="graph-legend">{(Object.keys(palette) as NodeType[]).map(type=><span key={type}><i style={{background:palette[type]}}/>{type}</span>)}</div>
    <div className="mini-search"><Search size={13}/><input value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{if(event.key==="Enter")searchGraph();}} placeholder="Search graph..." aria-label="Search graph entities"/></div>
   </div>
  </div>}
  <div className="graph-stage" ref={stageRef}>
   <canvas ref={canvasRef} className="network-canvas" role="application" aria-label="Interactive software dependency graph with 400 nodes and 1000 edges" tabIndex={0}/>
   <div className="graph-controls">
    <button onClick={()=>zoomBy(.15)} aria-label="Zoom in"><Plus size={15}/></button>
    <button onClick={()=>zoomBy(-.15)} aria-label="Zoom out"><Minus size={15}/></button>
    <button onClick={resetGraph} aria-label="Reset graph"><RotateCcw size={14}/></button>
    <button onClick={()=>moveCamera({x:0,y:0,scale:1.15,rotation:0})} aria-label="Fit graph"><Maximize2 size={14}/></button>
   </div>
   <AnimatePresence>
    {selected&&<motion.aside className="graph-analysis-card" initial={{x:30,opacity:0}} animate={{x:0,opacity:1}} exit={{x:30,opacity:0}} transition={{duration:.35,ease:[.25,1,.5,1]}}>
     <button className="graph-card-close" onClick={resetGraph} aria-label="Close entity analysis"><X size={16}/></button>
     <p className="graph-card-kicker">SUSPECT / ENTITY ANALYSIS</p>
     <h3>{selected.label}</h3>
     <dl>
      <div><dt>Type</dt><dd><i style={{background:palette[selected.type]}}/>{selected.type}</dd></div>
      <div><dt>Role</dt><dd>{selected.role}</dd></div>
      <div><dt>Access Permissions</dt><dd>{selected.permissions}</dd></div>
      <div><dt>Linked Classes/Methods</dt><dd>{relatedNames.length?relatedNames.join(", "):"No direct class or method links"}</dd></div>
      <div><dt>Threat Assessment Level</dt><dd><span className={`graph-threat ${selected.threat.toLowerCase()}`}>{selected.threat}</span></dd></div>
     </dl>
    </motion.aside>}
   </AnimatePresence>
   <span className="graph-node-count">400 NODES <i/> 1,000 RELATIONSHIPS</span>
  </div>
 </section>;
}