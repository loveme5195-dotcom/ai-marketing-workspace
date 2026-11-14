(function(global){'use strict';
 const GROUPS={jobs:{title:'顧客任務',en:'CUSTOMER JOBS',help:'顧客想完成什麼？包含功能、情感與社會任務。'},pains:{title:'痛點',en:'PAINS',help:'有哪些阻力、風險或不希望發生的結果？'},gains:{title:'期待利益',en:'GAINS',help:'什麼結果會讓顧客覺得值得、安心或更方便？'},products:{title:'產品／服務',en:'PRODUCTS & SERVICES',help:'你實際打算提供什麼？不只是一句形容詞。'},relievers:{title:'痛點解方',en:'PAIN RELIEVERS',help:'方案如何具體降低某一個痛點？'},creators:{title:'利益創造',en:'GAIN CREATORS',help:'方案如何帶來顧客重視的利益？'}};
 const STATES={hypothesis:'待驗證假設',evidence:'有支持證據',unknown:'資料不足'};
 const PRIORITIES={high:'高優先',medium:'中優先',low:'低優先'};
 const FIT_STATES={pending:'待驗證',supported:'有支持證據',revise:'需修正'};
 const TARGET={jobs:'products',pains:'relievers',gains:'creators'};
 const uid=()=>global.crypto&&global.crypto.randomUUID?global.crypto.randomUUID():'p-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function blank(name='未命名專案'){return {id:uid(),name,brand:'',audience:'',background:'',isDemo:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),rev:0,vpc:{cards:Object.fromEntries(Object.keys(GROUPS).map(k=>[k,[]])),fits:[],reflection:''}};}
 function sample(){const p=blank('日常好食・預訂午餐');Object.assign(p,{brand:'日常好食',audience:'附近辦公室中，願意提前預訂、可指定時段自取的上班族。',isDemo:true,background:'完全虛構的教學專案，不代表實際市調或營運成果。\n候選方案：提前預訂、指定時段自取、清楚提供餐點資訊。\n尚待確認：需求強度、願付價格、實際產能、營養資訊及成本。\n未確認的交付時效與健康效果不能作品牌承諾。'});
 const add=(g,text,priority,source='')=>{const c={id:uid(),text,priority,state:'hypothesis',source};p.vpc.cards[g].push(c);return c.id;};
 const j1=add('jobs','在有限午休內，取得一份合適的午餐。','high','虛擬訪談 D01；須另做真實研究。');
 add('jobs','減少每天決定吃什麼的負擔。','medium','虛擬訪談 D02。');
 const p1=add('pains','現場排隊時間不確定，擔心耽誤午休。','high','虛擬訪談 D01、D03。');
 const p2=add('pains','看不清食材與份量，難以判斷是否適合。','high','虛擬訪談 D02。');
 const g1=add('gains','取餐安排清楚，能事先掌握下一步。','high','虛擬訪談 D03。');
 add('gains','餐點資訊透明，選擇時更安心。','medium','虛擬訪談 D02。');
 const s1=add('products','提供候選餐盒與提前預訂自取服務。','high','教學方案；未驗證交付與價格。');
 const r1=add('relievers','事前確認訂單與取餐時段，減少現場決策。','high','作業流程需試行。');
 add('relievers','清楚列出食材與實際份量資訊。','high','資料需由品牌核對，不宣稱療效。');
 const c1=add('creators','在確認訊息中列出取餐流程與注意事項。','high','需測試顧客理解程度。');
 add('creators','提供容易理解的餐點資訊，協助選擇。','medium','不保證適合所有飲食限制。');
 p.vpc.fits=[{id:uid(),customerId:j1,solutionId:s1,state:'pending',evidence:'',test:'訪談附近上班族，確認是否願意提前預訂及自取。'},{id:uid(),customerId:p1,solutionId:r1,state:'pending',evidence:'',test:'小規模桌上演練取餐流程，記錄等待與疑慮。'},{id:uid(),customerId:g1,solutionId:c1,state:'pending',evidence:'',test:'請受測者讀確認訊息後，復述取餐步驟。'}];
 p.vpc.reflection='先確認「時間可預期」是否比「最低價格」更重要。若顧客不願提前預訂，應調整方案，而不是把畫布填得更漂亮。';return p;}
 function assert(ok,message){if(!ok)throw Error(message);}
 function str(v,max,label,required=false){assert(typeof v==='string'&&v.length<=max,label+'格式錯誤或超出長度');assert(!required||v.trim(),label+'不可空白');return v;}
 function validateVpc(v){assert(v&&typeof v==='object'&&!Array.isArray(v),'VPC格式錯誤');assert(v.cards&&typeof v.cards==='object','缺少VPC卡片');const cards={},all=new Map();
  Object.keys(GROUPS).forEach(k=>{assert(Array.isArray(v.cards[k])&&v.cards[k].length<=60,'每區最多60張卡片');cards[k]=v.cards[k].map(c=>{assert(c&&typeof c==='object','卡片格式錯誤');const id=str(c.id,100,'卡片編號',true);assert(!all.has(id),'卡片編號重複');assert(Object.hasOwn(STATES,c.state),'卡片狀態無效');assert(Object.hasOwn(PRIORITIES,c.priority),'優先順序無效');const row={id,text:str(c.text,2000,'卡片文字',true),state:c.state,priority:c.priority,source:str(c.source,1500,'來源')};assert(c.state!=='evidence'||row.source.trim(),'有支持證據的卡片必須填來源');all.set(id,k);return row;});});
  assert(Array.isArray(v.fits)&&v.fits.length<=500,'配對清單格式錯誤或超過500條');const ids=new Set(),pairs=new Set();const fits=v.fits.map(f=>{assert(f&&typeof f==='object','配對格式錯誤');const id=str(f.id,100,'配對編號',true);assert(!ids.has(id),'配對編號重複');ids.add(id);assert(TARGET[all.get(f.customerId)]===all.get(f.solutionId)&&all.has(f.solutionId),'配對項目不存在或類型不符');assert(Object.hasOwn(FIT_STATES,f.state),'配對狀態無效');const pair=f.customerId+'\0'+f.solutionId;assert(!pairs.has(pair),'顧客與方案配對重複');pairs.add(pair);const evidence=str(f.evidence,2000,'配對證據');assert(f.state!=='supported'||evidence.trim(),'有支持證據的配對必須填依據');return {id,customerId:f.customerId,solutionId:f.solutionId,state:f.state,evidence,test:str(f.test,2000,'驗證方式')};});
  return {cards,fits,reflection:str(v.reflection,5000,'反思紀錄')};
 }
 function validateProject(p){assert(p&&typeof p==='object'&&!Array.isArray(p),'專案格式錯誤');return {id:str(p.id,100,'專案編號',true),name:str(p.name,100,'專案名稱',true),brand:str(p.brand,100,'品牌'),audience:str(p.audience,1000,'客群'),background:str(p.background,5000,'背景'),isDemo:p.isDemo===true,createdAt:typeof p.createdAt==='string'&&Number.isFinite(Date.parse(p.createdAt))?p.createdAt:new Date().toISOString(),updatedAt:typeof p.updatedAt==='string'&&Number.isFinite(Date.parse(p.updatedAt))?p.updatedAt:new Date().toISOString(),rev:Number.isSafeInteger(p.rev)&&p.rev>=0?p.rev:0,vpc:validateVpc(p.vpc)};}
 function parseImport(text){const data=JSON.parse(text);assert(data&&data.format==='marketing-workspace'&&data.version===1,'不是支援的行銷構想室專案檔（版本1）');assert(Array.isArray(data.projects)&&data.projects.length>0&&data.projects.length<=50,'單次匯入需為1–50個專案');return data.projects.map(validateProject);}
 function envelope(projects){return {format:'marketing-workspace',version:1,exportedAt:new Date().toISOString(),projects:projects.map(validateProject)};}
 function report(p,prompt=false){const lines=[prompt?'請擔任行銷研究教練，只根據以下資料檢查VPC 價值主張畫布。不要補造事實或假裝已完成研究。':'# '+p.name+'｜VPC 價值主張畫布','',p.isDemo?'【虛擬教學資料，不代表真實市場或已驗證結果】':'【使用者自填資料；證據狀態仍須人工核對】','品牌：'+p.brand,'客群與情境：'+p.audience,'背景：'+p.background,''];const lookup=new Map();Object.entries(GROUPS).forEach(([k,g])=>{lines.push('## '+g.title);p.vpc.cards[k].forEach(c=>{lookup.set(c.id,c);lines.push('- '+c.text+' ['+PRIORITIES[c.priority]+'／'+STATES[c.state]+']','  來源：'+(c.source||'未提供'));});if(!p.vpc.cards[k].length)lines.push('尚未填寫');lines.push('');});lines.push('## 需求與方案配對');p.vpc.fits.forEach(f=>lines.push('- '+lookup.get(f.customerId)?.text+' → '+lookup.get(f.solutionId)?.text+' ['+FIT_STATES[f.state]+']','  支持依據：'+(f.evidence||'未提供'),'  驗證方式：'+(f.test||'待設計')));lines.push('','## 反思與下一步',p.vpc.reflection||'待整理');if(prompt)lines.push('','請分開列出事實、假設與未知，找出最值得驗證的三個缺口及反例，提出具體訪談／小規模測試問題。','不要把填滿畫布當作需求、營收或利潤已驗證，不以單一來源推論所有顧客。保留虛擬資料標示；沒有來源就明說。');return lines.join('\n');}
 global.MW={GROUPS,STATES,PRIORITIES,FIT_STATES,TARGET,uid,esc,blank,sample,validateProject,validateVpc,parseImport,envelope,report};
})(window);
