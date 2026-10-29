const $=id=>document.getElementById(id),key='area-studio-v3';
const defaults={
 land:1000,coverage:100,floors:1,cost:0,contingency:10,currency:'LAK',project:'ໂຄງການອາພາດເມັນຂອງຂ້ອຍ',
 rooms:[
  {name:'ສະຕູດິໂອ',area:40,quantity:10,enabled:true},
  {name:'1 ຫ້ອງນອນ',area:80,quantity:5,enabled:true},
  {name:'2 ຫ້ອງນອນ',area:65,quantity:0,enabled:false},
  {name:'3 ຫ້ອງນອນ',area:90,quantity:0,enabled:false}
 ],
 commonSpaces:[
  {name:'Fitness',quantity:2,area:100},
  {name:'Lobby',quantity:0,area:80},
  {name:'ພື້ນທີ່ສ່ວນກາງອື່ນ',quantity:0,area:30}
 ]
};
function prepareLayout(){
 const oldCommon=$('common');
 if(oldCommon){
  const label=oldCommon.closest('label');
  label.innerHTML='ພື້ນທີ່ຢູ່ອາໄສ <span>%</span><input id="residential-share" type="number" value="80" readonly aria-label="ພື້ນທີ່ຢູ່ອາໄສ %">';
  const publicLabel=document.createElement('label');
  publicLabel.innerHTML='ພື້ນທີ່ສ່ວນກາງ <span>%</span><input id="public-share" type="number" value="20" readonly aria-label="ພື້ນທີ່ສ່ວນກາງ %">';
  label.after(publicLabel);
  const landArticle=$('land').closest('article');
  landArticle.querySelector('.hint').textContent='ເນື້ອທີ່ອາຄານລວມແມ່ນ 100%. ທຸກຫ້ອງຄິດຈາກ ຂະໜາດ × ຈຳນວນ; ສ່ວນທີ່ຍັງເຫຼືອຈະເປັນພື້ນທີ່ສຳຮອງອັດຕະໂນມັດ ເພື່ອໃຫ້ລວມ 100% ພໍດີ.';
 }
 const roomArticle=$('rooms').closest('article');
 roomArticle.querySelector('h2').textContent='ກຳນົດຫ້ອງຈາກພື້ນທີ່ 100%';
 roomArticle.querySelector('.hint.top').textContent='ຂະໜາດ, ຈຳນວນ ແລະ % ເຊື່ອມກັນ. ປ່ຽນຈຳນວນ ຫຼືຂະໜາດແລ້ວ % ຈະປ່ຽນຕາມ; ປ່ຽນ % ແລ້ວຈຳນວນຈະປັບເປັນຈຳນວນເຕັມທີ່ໃກ້ທີ່ສຸດ.';
 roomArticle.querySelector('.room-head').innerHTML='<span>ປະເພດຫ້ອງ</span><span>ຂະໜາດ · m²</span><span>ຈຳນວນຫ້ອງ</span><span>ສັດສ່ວນ · %</span>';
 roomArticle.querySelector('.room-controls span').textContent='ພື້ນທີ່ລວມ = 100%';
 const commonArticle=document.createElement('article');
 commonArticle.id='common-spaces-section';
 commonArticle.innerHTML='<div class="section-title"><span>03</span><h2>ຫ້ອງ ແລະ ພື້ນທີ່ສ່ວນກາງ</h2></div><p class="hint top">Lobby, Fitness ແລະສ່ວນກາງອື່ນໆ ໃຊ້ສູດດຽວກັນ: ຂະໜາດ × ຈຳນວນ = ພື້ນທີ່ ແລະ %. ຕົວຢ່າງ 2 × 100 m² ຈາກ 1,000 m² = 20%.</p><div class="common-head"><span>ລາຍການ</span><span>ຈຳນວນ</span><span>ຂະໜາດ · m²</span><span>ສັດສ່ວນ · %</span><span></span></div><div id="common-spaces"></div><button id="add-common-space" class="quiet" type="button">+ ເພີ່ມຫ້ອງສ່ວນກາງ</button><div id="allocation-status" class="allocation-status"></div>';
 roomArticle.after(commonArticle);
 const costArticle=$('currency').closest('article');
 costArticle.querySelector('.section-title>span').textContent='04';
 const materialArticle=$('material-rows').closest('article');
 materialArticle.querySelector('.section-title>span').textContent='05';
 const notes=document.querySelector('.notes');
 if(notes)notes.innerHTML='<h3>ຫຼັກການ 100%</h3><p>ເນື້ອທີ່ຖານອາຄານ × ຈຳນວນຊັ້ນ = ເນື້ອທີ່ລວມ 100%.<br>ຂະໜາດຫ້ອງ × ຈຳນວນ = ພື້ນທີ່ລວມຂອງ Type.<br>% ຂອງ Type = ພື້ນທີ່ Type ÷ ພື້ນທີ່ລວມ × 100.</p><p>ຈຳນວນຫ້ອງຕ້ອງເປັນຈຳນວນເຕັມ. ເມື່ອແກ້ % ລະບົບຈະປັບຈຳນວນຫ້ອງເປັນຄ່າໃກ້ທີ່ສຸດ ແລະຄິດ % ຈິງຄືນໃໝ່. ພື້ນທີ່ທີ່ບໍ່ພໍດີກັບຂະໜາດຫ້ອງຈະຖືກສະແດງເປັນພື້ນທີ່ສຳຮອງ ເຮັດໃຫ້ລວມ 100% ພໍດີສະເໝີ.</p>';
}
prepareLayout();

let initial=structuredClone(defaults),last=null;
try{
 const stored=JSON.parse(localStorage.getItem(key));
 if(stored&&Array.isArray(stored.rooms)&&Array.isArray(stored.commonSpaces))initial={...initial,...stored};
}catch{}
let roomData=initial.rooms.map(r=>({...r,quantity:Number.isInteger(r.quantity)?r.quantity:0}));
let commonData=initial.commonSpaces.map(r=>({...r,quantity:Number.isInteger(r.quantity)?r.quantity:0}));
const roomName=r=>r.name.trim()||'ຫ້ອງໃໝ່';
const value=id=>Number($(id)?.value)||0;
const grossArea=()=>value('land')*value('coverage')/100*Math.max(1,Math.round(value('floors')));
const roomUsed=()=>roomData.reduce((sum,r)=>sum+(r.enabled?(Number(r.area)||0)*(Number(r.quantity)||0):0),0);
const commonUsed=()=>commonData.reduce((sum,r)=>sum+(Number(r.area)||0)*(Number(r.quantity)||0),0);
function otherUsed(kind,index){
 let total=0;
 roomData.forEach((r,i)=>{if(r.enabled&&!(kind==='room'&&i===index))total+=(Number(r.area)||0)*(Number(r.quantity)||0);});
 commonData.forEach((r,i)=>{if(!(kind==='common'&&i===index))total+=(Number(r.area)||0)*(Number(r.quantity)||0);});
 return total;
}
function setQuantity(kind,index,desired){
 const list=kind==='room'?roomData:commonData,item=list[index],area=Number(item.area)||0,gross=grossArea();
 const max=area>0?Math.max(0,Math.floor((gross-otherUsed(kind,index)+0.000001)/area)):0;
 item.quantity=Math.max(0,Math.min(max,Math.round(Number(desired)||0)));
}
function setShare(kind,index,share){
 const list=kind==='room'?roomData:commonData,item=list[index],area=Number(item.area)||0;
 if(area<=0)return;
 setQuantity(kind,index,grossArea()*Math.max(0,Math.min(100,Number(share)||0))/100/area);
}
function ensureWithinGross(){
 let over=roomUsed()+commonUsed()-grossArea();
 if(over<=0)return;
 for(let i=roomData.length-1;i>=0&&over>0;i--){
  const r=roomData[i];if(!r.enabled||!r.quantity||!r.area)continue;
  const remove=Math.min(r.quantity,Math.ceil(over/r.area));r.quantity-=remove;over-=remove*r.area;
 }
 for(let i=commonData.length-1;i>=0&&over>0;i--){
  const r=commonData[i];if(!r.quantity||!r.area)continue;
  const remove=Math.min(r.quantity,Math.ceil(over/r.area));r.quantity-=remove;over-=remove*r.area;
 }
}
function drawRooms(){
 $('rooms').replaceChildren();
 roomData.forEach((r,i)=>{
  const row=document.createElement('div');row.className='room-row';
  const label=document.createElement('label'),enabled=document.createElement('input');enabled.type='checkbox';enabled.id='enabled'+i;enabled.checked=r.enabled;label.append(enabled);
  const name=document.createElement('input');name.type='text';name.id='name'+i;name.maxLength=80;name.value=r.name;name.setAttribute('aria-label','ຊື່ປະເພດຫ້ອງ');label.append(name);
  const area=document.createElement('input');area.type='number';area.min='0.1';area.max='1000000';area.step='0.1';area.id='area'+i;area.value=r.area;area.setAttribute('aria-label',roomName(r)+' ຂະໜາດ m²');
  const quantity=document.createElement('input');quantity.type='number';quantity.min='0';quantity.max='100000';quantity.step='1';quantity.id='quantity'+i;quantity.value=r.quantity;quantity.disabled=!r.enabled;quantity.setAttribute('aria-label',roomName(r)+' ຈຳນວນ');
  const share=document.createElement('input');share.type='number';share.min='0';share.max='100';share.step='0.1';share.id='room-share-'+i;share.disabled=!r.enabled;share.setAttribute('aria-label',roomName(r)+' ສັດສ່ວນ %');
  const group=document.createElement('div');group.className='room-share';group.append(share);
  if(i>=defaults.rooms.length){const remove=document.createElement('button');remove.type='button';remove.className='room-remove quiet';remove.textContent='×';remove.title='ລຶບຫ້ອງ';remove.onclick=()=>{roomData.splice(i,1);drawRooms();render();};group.append(remove);}
  enabled.onchange=()=>{r.enabled=enabled.checked;if(!r.enabled)r.quantity=0;drawRooms();render();};
  name.oninput=()=>{r.name=name.value;render();};
  area.oninput=()=>{r.area=area.value===''?NaN:Number(area.value);setQuantity('room',i,r.quantity);quantity.value=r.quantity;render();};
  quantity.oninput=()=>{setQuantity('room',i,quantity.value);quantity.value=r.quantity;render();};
  share.onchange=()=>{setShare('room',i,share.value);quantity.value=r.quantity;render();};
  row.append(label,area,quantity,group);$('rooms').append(row);
 });
}
function drawCommonSpaces(){
 $('common-spaces').replaceChildren();
 commonData.forEach((item,i)=>{
  const row=document.createElement('div');row.className='common-row';
  const name=document.createElement('input');name.type='text';name.maxLength=80;name.value=item.name;name.setAttribute('aria-label','ຊື່ຫ້ອງສ່ວນກາງ');
  const quantity=document.createElement('input');quantity.type='number';quantity.min='0';quantity.max='10000';quantity.step='1';quantity.value=item.quantity;quantity.setAttribute('aria-label',item.name+' ຈຳນວນ');
  const area=document.createElement('input');area.type='number';area.min='0.1';area.max='1000000';area.step='0.1';area.value=item.area;area.setAttribute('aria-label',item.name+' ຂະໜາດ m²');
  const share=document.createElement('input');share.type='number';share.min='0';share.max='100';share.step='0.1';share.id='common-share-'+i;share.setAttribute('aria-label',item.name+' ສັດສ່ວນ %');
  const remove=document.createElement('button');remove.type='button';remove.className='common-remove quiet';remove.textContent='×';remove.setAttribute('aria-label','ລຶບ '+item.name);
  name.oninput=()=>{item.name=name.value;render();};
  quantity.oninput=()=>{setQuantity('common',i,quantity.value);quantity.value=item.quantity;render();};
  area.oninput=()=>{item.area=area.value===''?NaN:Number(area.value);setQuantity('common',i,item.quantity);quantity.value=item.quantity;render();};
  share.onchange=()=>{setShare('common',i,share.value);quantity.value=item.quantity;render();};
  remove.onclick=()=>{commonData.splice(i,1);drawCommonSpaces();render();};
  row.append(name,quantity,area,share,remove);$('common-spaces').append(row);
 });
}
function load(s){
 for(const id of ['land','coverage','floors','cost','contingency','currency','project'])$(id).value=s[id];
 roomData=s.rooms.map(r=>({...r}));commonData=(s.commonSpaces||defaults.commonSpaces).map(r=>({...r}));
 ensureWithinGross();drawRooms();drawCommonSpaces();render();
}
function state(){
 const s={};
 for(const id of ['land','coverage','floors','cost','contingency'])s[id]=$(id).value===''?NaN:Number($(id).value);
 s.currency=$('currency').value;s.project=$('project').value;
 s.rooms=roomData.map(r=>({...r}));s.commonSpaces=commonData.map(r=>({...r}));
 return s;
}
const escapeHtml=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=v=>new Intl.NumberFormat('lo-LA',{maximumFractionDigits:2}).format(v);
const money=(v,c)=>c+' '+new Intl.NumberFormat('lo-LA',{maximumFractionDigits:c==='LAK'?0:2}).format(v);
function render(){
 try{
  ensureWithinGross();
  const s=state(),r=calculate(s);last={s,r};
  $('residential-share').value=r.residentialShare.toFixed(2);$('public-share').value=r.commonShare.toFixed(2);
  r.rows.forEach((row,i)=>{const field=$('room-share-'+i);if(field&&document.activeElement!==field)field.value=row.share.toFixed(2);const q=$('quantity'+i);if(q&&document.activeElement!==q)q.value=row.quantity;});
  r.commonSpaces.forEach((row,i)=>{const field=$('common-share-'+i);if(field&&document.activeElement!==field)field.value=row.share.toFixed(2);});
  $('error').textContent='';$('export').disabled=false;
  const status=$('allocation-status');status.classList.toggle('complete',r.reserve<0.001);
  status.innerHTML='<span><small>ຈັດສັນແລ້ວ</small><strong>'+num(r.allocatedShare)+'%</strong></span><span><small>ພື້ນທີ່ສຳຮອງ</small><strong>'+num(r.reserveShare)+'%</strong></span><span><small>ຜົນລວມ</small><strong>100%</strong></span>';
  const metric=(label,value)=>'<div class="metric"><small>'+label+'</small><strong>'+num(value)+' <span>m²</span></strong></div>';
  const commonRows=r.commonSpaces.length?r.commonSpaces.map(item=>'<tr><td>'+escapeHtml(item.name)+'</td><td>'+item.quantity+'</td><td>'+num(item.area)+' m²</td><td>'+num(item.share)+'%</td></tr>').join(''):'<tr><td colspan="4">ຍັງບໍ່ມີລາຍການ</td></tr>';
  $('results').innerHTML=
   '<div class="hero-result"><div class="number">100<span>%</span></div><p>ພື້ນທີ່ລວມ '+num(r.gross)+' m² · ບໍ່ຂາດ ແລະບໍ່ເກີນ</p></div>'+
   '<div class="metrics">'+metric('ເນື້ອທີ່ຖານອາຄານ',r.footprint)+metric('ເນື້ອທີ່ລວມ 100%',r.gross)+metric('ພື້ນທີ່ຢູ່ອາໄສ',r.residential)+metric('ພື້ນທີ່ສ່ວນກາງ',r.common)+'</div>'+
   '<div class="allocation-bar"><span class="bar-room" style="width:'+Math.min(100,r.residentialUsed/r.gross*100)+'%"></span><span class="bar-common" style="width:'+r.commonShare+'%"></span><span class="bar-reserve" style="width:'+r.reserveShare+'%"></span></div><div class="legend"><span>ຫ້ອງ '+num(r.residentialUsed/r.gross*100)+'%</span><span>ສ່ວນກາງ '+num(r.commonShare)+'%</span><span>ສຳຮອງ '+num(r.reserveShare)+'%</span></div>'+
   '<h3>ການແບ່ງຫ້ອງຢູ່ອາໄສ</h3><table><thead><tr><th>Type / ຂະໜາດ</th><th>ຈຳນວນ</th><th>ພື້ນທີ່</th><th>ສັດສ່ວນ</th></tr></thead><tbody>'+
   r.rows.map(row=>'<tr><td>'+escapeHtml(row.name)+' · '+num(row.area)+' m²</td><td>'+row.quantity+'</td><td>'+num(row.used)+' m²</td><td>'+num(row.share)+'%</td></tr>').join('')+'</tbody></table>'+
   '<h3>ຫ້ອງ ແລະ ພື້ນທີ່ສ່ວນກາງ</h3><table><thead><tr><th>ລາຍການ</th><th>ຈຳນວນ</th><th>ຂະໜາດ</th><th>ສັດສ່ວນ</th></tr></thead><tbody>'+commonRows+'</tbody></table>'+
   '<p class="reserve-summary">ພື້ນທີ່ສຳຮອງອັດຕະໂນມັດ: <strong>'+num(r.reserve)+' m² · '+num(r.reserveShare)+'%</strong> — ຜົນລວມສຸດທ້າຍ 100%</p>'+
   '<div class="budget"><small>ງົບກໍ່ສ້າງປະເມີນຕາມເນື້ອທີ່</small><strong>'+(s.cost?money(r.budget,s.currency):'ປ້ອນຄ່າກໍ່ສ້າງ / m²')+'</strong><p>ຄ່າກໍ່ສ້າງພື້ນຖານ: '+money(r.base,s.currency)+'</p><p>ງົບສຳຮອງ ('+num(s.contingency)+'%): '+money(r.extra,s.currency)+'</p></div>';
  try{localStorage.setItem(key,JSON.stringify(s));$('saved').textContent='ບັນທຶກໃນອຸປະກອນນີ້ແລ້ວ';}catch{$('saved').textContent='ບໍ່ສາມາດບັນທຶກໃນອຸປະກອນນີ້';}
 }catch(e){
  last=null;$('error').textContent=e.message||'ກະລຸນາກວດຄ່າຂະໜາດ ແລະຈຳນວນຫ້ອງ.';$('results').replaceChildren();$('export').disabled=true;
 }
}
document.addEventListener('input',e=>{if(!e.target.closest('#rooms')&&!e.target.closest('#common-spaces'))render();});
document.addEventListener('change',e=>{if(!e.target.closest('#rooms')&&!e.target.closest('#common-spaces'))render();});
$('add-room').onclick=()=>{roomData.push({name:'ຫ້ອງໃໝ່',area:30,quantity:0,enabled:true});drawRooms();render();$('name'+(roomData.length-1)).focus();};
$('add-common-space').onclick=()=>{commonData.push({name:'ຫ້ອງສ່ວນກາງໃໝ່',quantity:0,area:30});drawCommonSpaces();render();};
$('print').onclick=()=>window.print();
$('reset').onclick=()=>load(structuredClone(defaults));
$('export').onclick=()=>{
 if(!last)return;const {s,r}=last;
 const rows=[
  ['APA STUDIO — ຜົນປະເມີນ 100%'],['ໂຄງການ',s.project],['ສະກຸນເງິນ',s.currency],
  ['ເນື້ອທີ່ດິນ m²',s.land],['ອັດຕາການໃຊ້ທີ່ດິນ %',s.coverage],['ຈຳນວນຊັ້ນ',s.floors],['ເນື້ອທີ່ລວມ m²',r.gross],
  ['ພື້ນທີ່ຢູ່ອາໄສ %',r.residentialShare],['ພື້ນທີ່ສ່ວນກາງ %',r.commonShare],['ພື້ນທີ່ສຳຮອງ %',r.reserveShare],['ຜົນລວມ %',100],
  ['ຄ່າກໍ່ສ້າງຕໍ່ m²',s.cost],['ງົບກໍ່ສ້າງລວມ',r.budget],[],
  ['ປະເພດຫ້ອງ','ຂະໜາດ m²','ຈຳນວນ','ພື້ນທີ່ m²','ສັດສ່ວນ %'],
  ...r.rows.map(x=>[x.name,x.area,x.quantity,x.used,x.share]),[],
  ['ຫ້ອງສ່ວນກາງ','ຂະໜາດ m²','ຈຳນວນ','ພື້ນທີ່ m²','ສັດສ່ວນ %'],
  ...r.commonSpaces.map(x=>[x.name,x.area,x.quantity,x.total,x.share]),[],
  ['ພື້ນທີ່ສຳຮອງ',r.reserve,'',r.reserve,r.reserveShare]
 ];
 if(window.materialExportRows)rows.push(...window.materialExportRows());
 const csv='\uFEFF'+rows.map(row=>row.map(v=>'"'+String(typeof v==='string'&&/^[=+@\-\t\r]/.test(v)?"'"+v:v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='apa-studio-100-percent.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};
load(initial);
