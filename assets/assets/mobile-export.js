(function(){'use strict';
const M=window.MW,tool=({vpc:'vpc',bmc:'bmc',swot:'swot',audience:'audienceLab',market:'marketLab',goals:'goalLab',journey:'journeyLab',ops:'opsLab'})[location.pathname.split('/').pop().replace('.html','')];
let project=null,busy=false,urls=[],current=null;
const post=(type,x={})=>{if(parent!==window)parent.postMessage({channel:'mw-v1',type,...x},'*');};
const safeName=s=>(s||'行銷成果').replace(/[\\/:*?"<>|\x00-\x1f]/g,'_');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dialog=document.createElement('dialog');dialog.id='mobile-export-dialog';dialog.setAttribute('aria-labelledby','mobile-export-title');
dialog.innerHTML='<div class="dialog-heading"><h2 id="mobile-export-title">下載與成果預覽</h2><button type="button" id="mobile-export-close" aria-label="關閉下載與預覽">×</button></div><p id="mobile-export-status" role="status"></p><p>手機可能改以預覽開啟PDF，或不顯示下載提示；網頁無法確認檔案是否已儲存。可重試下載，或用下方開啟與分享。</p><div class="mobile-export-actions"><a id="mobile-pdf-download">下載PDF</a><a id="mobile-pdf-open" target="_blank" rel="noopener">開啟PDF</a><button id="mobile-file-share" type="button">分享PDF檔</button><a id="mobile-html-open" target="_blank" rel="noopener">開啟成果預覽</a><a id="mobile-html-download">下載預覽HTML</a><button id="mobile-html-share" type="button">分享預覽檔</button></div><p class="hint">預覽與分享檔包含本次匯出的內容；不會產生公開網址或上傳伺服器。開啟預覽後可使用瀏覽器分享選單；若LINE內建瀏覽器受限，請改用Safari或Chrome。</p><details><summary>展開文字成果（也可選取複製）</summary><pre id="mobile-export-text" style="white-space:pre-wrap;overflow-wrap:anywhere"></pre></details>';
document.body.append(dialog);
const $=id=>document.getElementById(id);
$('mobile-export-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>post('editing',{editing:false}));
function show(){if(!dialog.open){post('editing',{editing:true});dialog.showModal();}}
function release(){for(const u of urls)URL.revokeObjectURL(u);urls=[];}
function url(blob){const u=URL.createObjectURL(blob);urls.push(u);return u;}
function previewHTML(title,text){return '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'"><title>'+escape(title)+'</title><style>body{max-width:900px;margin:24px auto;padding:0 18px;font:17px/1.8 system-ui,sans-serif;color:#173c35}pre{white-space:pre-wrap;overflow-wrap:anywhere}h1{font-size:26px}@media print{body{margin:0}}</style></head><body><h1>'+escape(title)+'</h1><p>此為匯出當時的靜態成果，可使用瀏覽器分享或列印；不是即時專案連結。</p><pre>'+escape(text)+'</pre></body></html>';}
function stage({blob=null,title,text,error=''}){
 release();const name=safeName(title),htmlBlob=new Blob([previewHTML(title,text)],{type:'text/html;charset=utf-8'}),htmlURL=url(htmlBlob);
 current={blob,htmlBlob,name};$('mobile-export-text').textContent=text;
 $('mobile-export-status').textContent=error?'PDF未產生：'+error+'。仍可開啟或分享成果預覽。':'PDF已產生。請選擇下載、開啟或分享；這不代表已儲存到手機。';
 $('mobile-html-open').href=htmlURL;$('mobile-html-download').href=htmlURL;$('mobile-html-download').download=name+'_預覽.html';
 for(const id of ['mobile-pdf-download','mobile-pdf-open','mobile-file-share'])$(id).hidden=!blob;
 if(blob){const u=url(blob);$('mobile-pdf-download').href=u;$('mobile-pdf-download').download=name+'.pdf';$('mobile-pdf-open').href=u;}
 show();
}
async function share(html=false){if(!current)return;const file=new File([html?current.htmlBlob:current.blob],current.name+(html?'_預覽.html':'.pdf'),{type:html?'text/html':'application/pdf'});try{
 if(!navigator.share||!navigator.canShare||!navigator.canShare({files:[file]})){ $('mobile-export-status').textContent='此瀏覽器不支援分享此檔案格式，請使用下載或開啟預覽後的瀏覽器分享選單。';return; }
 await navigator.share({files:[file],title:current.name});$('mobile-export-status').textContent='已完成分享操作；檔案儲存位置依你選擇的應用程式而定。';
 }catch(e){$('mobile-export-status').textContent=e.name==='AbortError'?'已取消分享，檔案與預覽仍可使用。':'分享未完成，請使用下載或開啟成果預覽。';}}
$('mobile-file-share').onclick=()=>share();$('mobile-html-share').onclick=()=>share(true);
function blocks(text){return text.split(/\r?\n/).map(line=>({kind:/^# /.test(line)?'title':/^## /.test(line)?'h1':/^### /.test(line)?'h2':line?'body':'space',text:line.replace(/^#{1,3} /,'')}));}
async function exportTool(pdf=true){if(busy||!project)return;busy=true;let title='行銷成果',text='';try{
 const snap=structuredClone(project);text=tool==='vpc'?M.report(snap):M.toolReport(snap,tool);title=snap.name+'｜'+document.title;
 if(!pdf){stage({title,text});$('mobile-export-status').textContent='成果預覽已準備好，可開啟、下載或分享。';return;}
 stage({title,text});$('mobile-export-status').textContent='正在產生PDF，較長成果請稍候…';
 await document.fonts?.ready;
 const stub={reportLab:{meta:{title,author:'行銷工作台'}}};
 const blob=await window.MWReportExport.pdf(stub,n=>{$('mobile-export-status').textContent='PDF已排版 '+n+' 頁…';},blocks(text));
 stage({blob,title,text});$('mobile-pdf-download').click();
 }catch(e){stage({title,text:text||'尚無可匯出的專案內容。',error:e.message});}finally{busy=false;}}
// 讓既有報告匯出流程保留原有範圍、彙整與過期檢查，僅共用檔案交付介面。
window.MWMobileExport={fallback(title,text,error){stage({title,text,error});},deliver(blob,title,text){stage({blob,title,text});$('mobile-pdf-download').click();},previewHTML};
if(tool){const print=document.getElementById('print-button');if(print){const button=document.createElement('button');button.id='download-pdf-button';button.type='button';button.textContent='下載PDF';button.disabled=true;button.onclick=()=>exportTool();print.before(button);const preview=document.createElement('button');preview.id='preview-result-button';preview.type='button';preview.textContent='成果預覽／分享';preview.disabled=true;preview.onclick=()=>exportTool(false);print.before(preview);}}
window.addEventListener('message',e=>{if(e.source!==parent||e.data?.channel!=='mw-v1')return;
 if(e.data.type==='project'){try{project=M.validateProject(e.data.project);for(const id of ['download-pdf-button','preview-result-button'])if($(id))$(id).disabled=false;}catch{project=null;for(const id of ['download-pdf-button','preview-result-button'])if($(id))$(id).disabled=true;}}
 if(e.data.type==='viewport'&&dialog.open){dialog.style.top=Math.max(0,Number(e.data.top)||0)+'px';dialog.style.maxHeight=Math.max(160,Number(e.data.maxHeight)||400)+'px';dialog.style.margin='0 auto';}
});
window.addEventListener('pagehide',release);
})();
