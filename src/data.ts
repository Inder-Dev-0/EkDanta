export type Page =
  | "home" | "new" | "dashboard" | "timeline" | "evidence"
  | "entities" | "graph" | "poi" | "ai" | "report";

export const people = [
  {id:"aman",name:"Aman",role:"Software Developer",workstation:"DEV-04",risk:"Low",riskValue:18},
  {id:"rohit",name:"Rohit",role:"Security Engineer",workstation:"SEC-02",risk:"High",riskValue:85},
  {id:"neha",name:"Neha",role:"Project Manager",workstation:"PM-01",risk:"Medium",riskValue:42}
];

export const timeline = [
  {time:"11:42 PM",title:"User Login",desc:"Rohit's credentials were used to log in to the company network.",tag:"Normal",type:"login"},
  {time:"11:45 PM",title:"Physical Access",desc:"An unidentified person entered the server room.",tag:"Suspicious",type:"physical"},
  {time:"11:47 PM",title:"File Access",desc:"PROJECT_ORION_INTERNAL_SPEC.pdf was accessed.",tag:"File Access",type:"file"},
  {time:"11:49 PM",title:"Data Transfer",desc:"Approximately 800 MB was transferred to an external IP.",tag:"Potential Attack",type:"network"},
  {time:"11:52 PM",title:"Session End",desc:"The server session was terminated.",tag:"Normal",type:"session"}
];

export const evidence = [
  {id:"E-034",time:"11:49 PM",type:"Network",desc:"800 MB transferred to 203.xxx.xxx.xxx",entities:"Server-04, External IP",classification:"Potential Attack"},
  {id:"E-033",time:"11:47 PM",type:"File",desc:"PROJECT_ORION_INTERNAL_SPEC.pdf was accessed",entities:"Server-04, Rohit",classification:"Suspicious"},
  {id:"E-028",time:"11:47 PM",type:"Credential",desc:"Rohit's credentials were used from an unknown device",entities:"Rohit, Unknown Device",classification:"Anomalous"},
  {id:"E-021",time:"11:45 PM",type:"Physical",desc:"Unidentified person entered server room",entities:"Server Room",classification:"Suspicious"},
  {id:"E-015",time:"11:42 PM",type:"Login",desc:"Successful login to company network",entities:"Rohit",classification:"Normal"}
];

export const graphNodes = [
  {id:"rohit",label:"Rohit",sub:"Security Engineer",type:"suspect",x:53,y:36,size:44},
  {id:"aman",label:"Aman",sub:"Software Developer",type:"user",x:20,y:50,size:29},
  {id:"neha",label:"Neha",sub:"Project Manager",type:"user",x:78,y:29,size:29},
  {id:"unknown",label:"Unknown Device",sub:"Device · Not SEC-02",type:"device",x:55,y:60,size:31},
  {id:"server",label:"Server-04",sub:"Internal Server",type:"server",x:79,y:61,size:34},
  {id:"file",label:"PROJECT_ORION_INTERNAL_SPEC.pdf",sub:"Confidential File",type:"file",x:38,y:76,size:32},
  {id:"ip",label:"203.xxx.xxx.xxx",sub:"External IP",type:"ip",x:89,y:79,size:34},
  {id:"dev04",label:"DEV-04",sub:"Workstation",type:"device",x:12,y:74,size:18},
  {id:"sec02",label:"SEC-02",sub:"Expected Workstation",type:"device",x:68,y:12,size:18},
  {id:"archive",label:"Archive Server",sub:"Unrelated Asset",type:"server",x:91,y:19,size:16},
  {id:"user1",label:"Employee",sub:"Normal user",type:"user",x:31,y:24,size:13},
  {id:"user2",label:"Analyst",sub:"Normal user",type:"user",x:31,y:88,size:13},
  {id:"user3",label:"Contractor",sub:"Normal user",type:"user",x:60,y:89,size:12},
  {id:"user4",label:"Service Account",sub:"Automated",type:"user",x:76,y:87,size:11},
  {id:"user5",label:"Admin Session",sub:"Routine",type:"user",x:45,y:15,size:12}
];

export const graphEdges = [
  ["rohit","unknown"],["rohit","server"],["rohit","file"],["rohit","ip"],["rohit","sec02"],
  ["unknown","server"],["unknown","file"],["server","file"],["server","ip"],["file","ip"],
  ["aman","dev04"],["aman","user1"],["neha","file"],["sec02","server"],["archive","server"],
  ["user2","file"],["user3","server"],["user4","server"],["user5","rohit"]
];

export const navItems = [
  ["home","Home"],["new","New Investigation"],["dashboard","Dashboard"],["timeline","Timeline"],
  ["evidence","Evidence"],["entities","Entities"],["graph","Connection Graph"],
  ["poi","Persons of Interest"],["ai","AI Analysis"],["report","Report"]
] as const;