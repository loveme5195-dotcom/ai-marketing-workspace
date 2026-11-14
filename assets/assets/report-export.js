(function(){'use strict';const M=window.MW;
async function word(p){
 if(!window.docx)throw Error('Word匯出元件未載入，請保留完整資料夾。');
 const D=window.docx,children=[];
 for(const b of M.reportBlocks(p)){
  const heading=b.kind==='title'?D.HeadingLevel.TITLE:b.kind==='h1'?D.HeadingLevel.HEADING_1:b.kind==='h2'?D.HeadingLevel.HEADING_2:undefined;
  children.push(new D.Paragraph({heading,keepNext:!!heading||b.kind==='meta'||/^(?:- |\d+\. )/.test(b.text),widowControl:true,spacing:{before:b.kind==='h1'?260:b.kind==='h2'?150:0,after:b.kind==='space'?0:b.kind==='title'?240:90,line:b.kind==='space'?100:330},children:[new D.TextRun({text:b.text||' ',font:{name:'Microsoft JhengHei',eastAsia:'Microsoft JhengHei'},size:b.kind==='space'?2:b.kind==='title'?40:b.kind==='h1'?30:b.kind==='h2'?25:b.kind==='meta'?18:22,color:b.kind==='title'?'000000':heading?'254D3B':b.kind==='meta'?'657269':'263B32',bold:!!heading})]}));
 }
 const footer=new D.Footer({children:[new D.Paragraph({alignment:D.AlignmentType.RIGHT,children:[new D.TextRun({children:[D.PageNumber.CURRENT],size:18,color:'657269'})]})]});
 const doc=new D.Document({creator:p.reportLab.meta.author||'行銷企劃團隊',title:p.reportLab.meta.title,description:'整合行銷企劃報告',styles:{default:{document:{run:{font:'Microsoft JhengHei',size:22},paragraph:{spacing:{line:330}}}}},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134}}},children,footers:{default:footer}}]});
 return D.Packer.toBlob(doc);
}
async function pdf(p,onProgress=()=>{}){if(!window.PDFLib)throw Error('PDF匯出元件未載入，請保留完整資料夾。');const {PDFDocument}=window.PDFLib,doc=await PDFDocument.create();doc.setTitle(p.reportLab.meta.title);doc.setAuthor(p.reportLab.meta.author||'行銷企劃團隊');const W=595.28,H=841.89,scale=2.25,margin=48,width=W-margin*2,bottom=H-50;let canvas,ctx,y,pageNo=0,hasContent=false;
function begin(){canvas=document.createElement('canvas');canvas.width=Math.ceil(W*scale);canvas.height=Math.ceil(H*scale);ctx=canvas.getContext('2d');if(!ctx)throw Error('此瀏覽器無法建立PDF版面');ctx.scale(scale,scale);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);ctx.textBaseline='top';y=48;hasContent=false;}
function font(size,bold=false){ctx.font=(bold?'600 ':'400 ')+size+'px "Microsoft JhengHei","PingFang TC",system-ui,sans-serif';}
function wrap(text,maxWidth){const out=[];let line='';for(const char of Array.from(text.replace(/\t/g,'    '))){if(line&&ctx.measureText(line+char).width>maxWidth){out.push(line);line=char;}else line+=char;}if(line)out.push(line);return out.length?out:[''];}
async function flush(){if(!hasContent)return;pageNo++;font(8);ctx.fillStyle='#657269';ctx.fillText(p.reportLab.meta.title.slice(0,48),margin,H-32);ctx.fillText(String(pageNo),W-margin-16,H-32);const jpeg=await doc.embedJpg(canvas.toDataURL('image/jpeg',0.96)),page=doc.addPage([W,H]);page.drawImage(jpeg,{x:0,y:0,width:W,height:H});onProgress(pageNo);canvas.width=canvas.height=1;await new Promise(r=>setTimeout(r,0));}
begin();for(const b of M.reportBlocks(p)){if(b.kind==='space'){y+=5;continue;}const heading=['title','h1','h2'].includes(b.kind),size=b.kind==='title'?22:b.kind==='h1'?16:b.kind==='h2'?13:b.kind==='meta'?9:11,lineHeight=size*1.65,before=b.kind==='h1'?18:b.kind==='h2'?10:0; font(size,heading);let lines=wrap(b.text,width);if((heading||/^- /.test(b.text))&&y+Math.max(before+lines.length*lineHeight+34,b.kind==='h1'?140:0)>bottom&&hasContent){await flush();begin();}y+=before;for(const line of lines){if(y+lineHeight>bottom){await flush();begin();}font(size,heading);ctx.fillStyle=b.kind==='title'?'#000000':heading?'#254d3b':b.kind==='meta'?'#657269':'#263b32';ctx.fillText(line,margin,y);y+=lineHeight;hasContent=true;}y+=b.kind==='title'?15:b.kind==='meta'?8:5;}await flush();if(!doc.getPageCount())throw Error('報告沒有可匯出內容');return new Blob([await doc.save()],{type:'application/pdf'});}
window.MWReportExport={word,pdf};
})();
