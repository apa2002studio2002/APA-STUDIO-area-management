const $=id=>document.getElementById(id),key='area-studio-v2',legacyKey='area-studio-v1';
const defaults={
 land:1000,coverage:60,floors:4,residential:80,cost:0,contingency:10,currency:'LAK',project:'ໂຄງການອາພາດເມັນຂອງຂ້ອຍ',
 rooms:[
  {name:'ສະຕູດິໂອ',area:28,weight:50,enabled:true},
  {name:'1 ຫ້ອງນອນ',area:45,weight:30,enabled:true},
  {name:'2 ຫ້ອງນອນ',area:65,weight:20,enabled:true},
  {name:'3 ຫ້ອງນອນ',area:90,weight:10,enabled:false},
  {name:'ຫ້ອງນ້ຳ / ພື້ນທີ່ບໍລິການ',area:8,weight:10,enabled:false}
 ],
 commonSpaces:[
  {name:'Lobby',quantity:1,area:80},
  {name:'Fitness',quantity:1,area:120},
  {name:'ພື້ນທີ່ສ່ວນກາງອື່ນ',quantity:0,area:30}
 ]
};
function prepareLayout(){
 const oldCommon=$('common');
 if(oldCommon){
  const label=oldCommon.closest('label');
  label.innerHTML='ພື້ນທີ່ຢູ່ອາໄສ <span>%</span><input id="residential" step="any" type="number" min="0" max="100" value="80">';
  const publicLabel=document.createElement('label');
  publicLabel.innerHTML='ພື້ນທີ່ສ່ວນກາງ <span>%</span><input id="public-share" type="number" value="20" readonly aria-label="ພື້ນທີ່ສ່ວນກາງ %">';
  label.after(publicLabel);
  const landArticle=$('land').closest('article');
  const hint=landArticle.querySelector('.hint');
  hint.textContent='ພື້ນທີ່ຢູ່ອາໄສ ແລະ ພື້ນທີ່ສ່ວນກາງຈະລວມກັນເປັນ 100% ອັດຕະໂນມັດ.';
 }
 const roomArticle=$('rooms').closest('article');
 roomArticle.querySelector('h2').textContent='ແບ່ງສັດສ່ວນພື້ນທີ່ຢູ່ອາໄສ';
 roomArticle.querySelector('.hint.top').textContent='ກຳນົດ % ຂອງແຕ່ລະ Type ຈາກພື້ນທີ່ຢູ່ອາໄສ. ສັດສ່ວນ Type ທັງໝົດຈະຮັກສາໄວ້ທີ່ 100%.';
 const heads=roomArticle.querySelectorAll('.room-head span');
 if(heads[0])heads[0].textContent='ປະເພດຫ້ອງ';
 if(heads[1])heads[1].textContent='ຂະໜາດ · m²';
 if(heads[2])heads[2].textContent='ສັດສ່ວນຈາກພື້ນທີ່ຢູ່ອາໄສ';
 roomArticle.querySelector('.room-controls span').textContent='ສັດສ່ວນລວມ 100%';
 const commonArticle=document.createElement('article');
 commonArticle.id='common-spaces-section';
 commonArticle.innerHTML='<div class="section-title"><span>03</span><h2>ຫ້ອງ ແລະ ພື້ນທີ່ສ່ວນກາງ</h2></div><p class="hint top">ກຳນົດຈຳນວນ ແລະ ຂະໜາດຂອງ Lobby, Fitness ຫຼື ຫ້ອງສ່ວນກາງອື່ນໆ. ລະບົບຈະທຽບກັບພື້ນທີ່ສ່ວນກາງທີ່ມີ.</p><div class="common-head"><span>ລາຍການ</span><span>ຈຳນວນ</span><span>ຂະໜາດ / ຫ້ອງ · m²</span><span></span></div><div id="common-spaces"></div><button id="add-common-space" class="quiet" type="button">+ ເພີ່ມຫ້ອງສ່ວນກາງ</button><div id="common-space-usage" class="common-usage"></div>';
 roomArticle.after(commonArticle);
 const costArticle=$('currency').closest('article');
 costArticle.querySelector('.section-title>span').textContent='04';
 const materialArticle=$('material-rows').closest('article');
 materialArticle.querySelector('.section-title>span').textContent='05';
 const notes=document.querySelector('.notes');
 if(notes)notes.innerHTML='<h3>ວິທີຄິດໄລ່</h3><p>ທີ່ດິນ × ອັດຕາການໃຊ້ທີ່ດິນ × ຈຳນວນຊັ້ນ = ເນື້ອທີ່ອາຄານລວມ.<br>ເນື້ອທີ່ລວມ × % ຢູ່ອາໄສ = ພື້ນທີ່ຢູ່ອາໄສ.<br>ພື້ນທີ່ຂອງແຕ່ລະ Type ÷ ຂະໜາດຫ້ອງ = ຈຳນວນຫ້ອງທີ່ fit in.</p><p>ຫ້ອງສ່ວນກາງຄິດຈາກ ຈຳນວນ × ຂະໜາດ. ລະບົບຈະສະແດງພື້ນທີ່ທີ່ເຫຼືອ ຫຼື ພື້ນທີ່ທີ່ເກີນ.</p><p>ຜົນນີ້ແມ່ນການປະເມີນເບື້ອງຕົ້ນຕາມເນື້ອທີ່. ຮູບຮ່າງດິນ, ທາງຍ່າງ, ຂັ້ນໄດ, ລິຟ, ຝາ, ລະບົບອາຄານ ແລະ ຂໍ້ກຳນົດທ້ອງຖິ່ນອາດປ່ຽນຈຳນວນຫ້ອງໄດ້.</p>';
}
prepareLayout();

let initial=structuredClone(defaults),last=null;
try{
 const stored=JSON.parse(localStorage.getItem(key));
 if(stored&&Array.isArray(stored.rooms)&&Array.isArray(stored.commonSpaces))initial={...initial,...stored};
 else{
  const legacy=JSON.parse(localStorage.getItem(legacyKey));
  if(legacy&&Array.isArray(legacy.rooms))initial={...initial,...legacy,residential:100-(Number(legacy.common)||0),commonSpaces:structuredClone(defaults.commonSpaces)};
 }
}catch{}
let roomData=initial.rooms.map(r=>({...r}));
let commonData=initial.commonSpaces.map(r=>({...r}));
const roomName=r=>r.name.trim()||'ຫ້ອງໃໝ່';

function balance(changed=-1){
 const active=roomData.map((r,i)=>i).filter(i=>roomData[i].enabled);
 if(!active.length)return;
 if(active.length===1)roomData[active[0]].weight=100;
 else{
  if(changed>=0&&active.includes(changed))roomData[changed].weight=Math.round(Math.min(100,Math.max(0,Number(roomData[changed].weight)||0))*10)/10;
  const targets=changed>=0&&active.includes(changed)?active.filter(i=>i!==changed):active;
  const available=changed>=0&&active.includes(changed)?1000-Math.round(roomData[changed].weight*10):1000;
  const total=targets.reduce((sum,i)=>sum+Math.max(0,Number(roomData[i].weight)||0),0);
  let remaining=available;
  targets.forEach((i,n)=>{const units=n===targets.length-1?remaining:Math.round((total?Math.max(0,Number(roomData[i].weight)||0)/total:1/targets.length)*available);roomData[i].weight=units/10;remaining-=units;});
 }
 roomData.forEach((r,i)=>{if(!r.enabled)r.weight=0;const field=$('weight'+i);if(field&&document.activeElement!==field)field.value=r.weight;});
}
function drawRooms(){
 $('rooms').replaceChildren();
 roomData.forEach((r,i)=>{
  const row=document.createElement('div');row.className='room-row';
  const label=document.createElement('label'),enabled=document.createElement('input');enabled.type='checkbox';enabled.id='enabled'+i;enabled.checked=r.enabled;label.append(enabled);
  const name=document.createElement('input');name.type='text';name.id='name'+i;name.maxLength=80;name.value=r.name;name.setAttribute('aria-label','ຊື່ປະເພດຫ້ອງ');label.append(name);
  const area=document.createElement('input');area.type='number';area.min='0.1';area.max='1000000';area.step='0.1';area.id='area'+i;area.value=r.area;area.setAttribute('aria-label',roomName(r)+' ຂະໜາດເປັນ m²');
  const weight=document.createElement('input');weight.type='number';weight.min='0';weight.max='100';weight.step='0.1';weight.id='weight'+i;weight.value=r.weight;weight.disabled=!r.enabled;weight.setAttribute('aria-label',roomName(r)+' ສັດສ່ວນ %');
  const group=document.createElement('div');group.className='room-share';group.append(weight);
  if(i>=defaults.rooms.length){const remove=document.createElement('button');remove.type='button';remove.className='room-remove quiet';remove.textContent='×';remove.title='ລຶບຫ້ອງ';remove.onclick=()=>{roomData.splice(i,1);drawRooms();balance();render();};group.append(remove);}
  enabled.onchange=()=>{if(!enabled.checked&&roomData.filter(x=>x.enabled).length===1){enabled.checked=true;return;}r.enabled=enabled.checked;r.weight=r.enabled?10:0;drawRooms();balance(r.enabled?i:-1);render();};
  name.oninput=()=>{r.name=name.value;render();};
  area.oninput=()=>{r.area=area.value===''?NaN:Number(area.value);render();};
  weight.onchange=()=>{weight.value=r.weight;};
  weight.oninput=()=>{r.weight=weight.value===''?0:Number(weight.value);balance(i);render();};
  row.append(label,area,group);$('rooms').append(row);
 });
}
function drawCommonSpaces(){
 $('common-spaces').replaceChildren();
 commonData.forEach((item,i)=>{
  const row=document.createElement('div');row.className='common-row';
  const name=document.createElement('input');name.type='text';name.maxLength=80;name.value=item.name;name.setAttribute('aria-label','ຊື່ຫ້ອງສ່ວນກາງ');
  const quantity=document.createElement('input');quantity.type='number';quantity.min='0';quantity.max='10000';quantity.step='1';quantity.value=item.quantity;quantity.setAttribute('aria-label',item.name+' ຈຳນວນ');
  const area=document.createElement('input');area.type='number';area.min='0.1';area.max='1000000';area.step='0.1';area.value=item.area;area.setAttribute('aria-label',item.name+' ຂະໜາດ m²');
  const remove=document.createElement('button');remove.type='button';remove.className='common-remove quiet';remove.textContent='×';remove.setAttribute('aria-label','ລຶບ '+item.name);
  name.oninput=()=>{item.name=name.value;render();};
  quantity.oninput=()=>{item.quantity=quantity.value===''?NaN:Number(quantity.value);render();};
  area.oninput=()=>{item.area=area.value===''?NaN:Number(area.value);render();};
  remove.onclick=()=>{commonData.splice(i,1);drawCommonSpaces();render();};
  row.append(name,quantity,area,remove);$('common-spaces').append(row);
 });
}
function load(s){
 for(const id of ['land','coverage','floors','residential','cost','contingency','currency','project'])$(id).value=s[id];
 roomData=s.rooms.map(r=>({...r}));
 commonData=(s.commonSpaces||defaults.commonSpaces).map(r=>({...r}));
 drawRooms();drawCommonSpaces();balance();render();
}
function state(){
 const s={};
 for(const id of ['land','coverage','floors','residential','cost','contingency'])s[id]=$(id).value===''?NaN:Number($(id).value);
 s.currency=$('currency').value;s.project=$('project').value;
 s.rooms=roomData.map(r=>({...r}));s.commonSpaces=commonData.map(r=>({...r}));
 return s;
}
const escapeHtml=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=v=>new Intl.NumberFormat('lo-LA',{maximumFractionDigits:1}).format(v);
const money=(v,c)=>c+' '+new Intl.NumberFormat('lo-LA',{maximumFractionDigits:c==='LAK'?0:2}).format(v);

function render(){
 try{
  const s=state(),r=calculate(s);last={s,r};
  $('public-share').value=num(100-s.residential);
  $('error').textContent='';$('export').disabled=false;
  const usage=$('common-space-usage');
  usage.classList.toggle('over',r.commonRemaining<0);
  usage.innerHTML='<span>ພື້ນທີ່ສ່ວນກາງທີ່ມີ <strong>'+num(r.common)+' m²</strong></span><span>ໃຊ້ແລ້ວ <strong>'+num(r.commonUsed)+' m²</strong></span><span>'+(r.commonRemaining>=0?'ຍັງເຫຼືອ ':'ເກີນກຳນົດ ')+'<strong>'+num(Math.abs(r.commonRemaining))+' m²</strong></span>';
  const metric=(label,value)=>'<div class="metric"><small>'+label+'</small><strong>'+num(value)+' <span>m²</span></strong></div>';
  const commonRows=r.commonSpaces.length?r.commonSpaces.map(item=>'<tr><td>'+escapeHtml(item.name)+'</td><td>'+item.quantity+'</td><td>'+num(item.area)+' m²</td><td>'+num(item.total)+' m²</td></tr>').join(''):'<tr><td colspan="4">ຍັງບໍ່ມີລາຍການ</td></tr>';
  $('results').innerHTML=
   '<div class="hero-result"><div class="number">'+num(r.total)+'<span>ຫ້ອງ</span></div><p>ສະເລ່ຍ '+num(r.perFloor)+' ຫ້ອງຕໍ່ຊັ້ນ · '+s.floors+' ຊັ້ນ · ແບ່ງຕາມສັດສ່ວນພື້ນທີ່</p></div>'+
   '<div class="metrics">'+metric('ເນື້ອທີ່ຖານອາຄານ',r.footprint)+metric('ເນື້ອທີ່ອາຄານລວມ',r.gross)+metric('ພື້ນທີ່ຢູ່ອາໄສ',r.residential)+metric('ພື້ນທີ່ສ່ວນກາງ',r.common)+'</div>'+
   '<p class="hint" style="color:#bdcdbf">ທີ່ດິນບໍ່ປຸກສ້າງ: '+num(r.open)+' m²</p>'+
   '<div class="bar"><span style="width:'+s.residential+'%"></span></div><div class="legend"><span>ຢູ່ອາໄສ '+num(s.residential)+'%</span><span>ສ່ວນກາງ '+num(100-s.residential)+'%</span></div>'+
   '<h3>ການແບ່ງພື້ນທີ່ຢູ່ອາໄສ</h3><table><thead><tr><th>Type / ຂະໜາດ</th><th>ສັດສ່ວນ</th><th>ພື້ນທີ່</th><th>ຫ້ອງ</th></tr></thead><tbody>'+
   r.rows.map(row=>'<tr><td>'+escapeHtml(row.name)+' · '+num(row.area)+' m²</td><td>'+num(row.share)+'%</td><td>'+num(row.allocation)+' m²</td><td>'+row.count+'</td></tr>').join('')+'</tbody></table>'+
   '<p class="hint" style="color:#bdcdbf">ພື້ນທີ່ຫ້ອງທີ່ fit in: '+num(r.used)+' m² · ເສດເຫຼືອຈາກການປັດລົງ: '+num(r.unused)+' m²</p>'+
   '<h3>ຫ້ອງ ແລະ ພື້ນທີ່ສ່ວນກາງ</h3><table><thead><tr><th>ລາຍການ</th><th>ຈຳນວນ</th><th>ຂະໜາດ</th><th>ລວມ</th></tr></thead><tbody>'+commonRows+'</tbody></table>'+
   '<p class="hint '+(r.commonRemaining<0?'summary-warning':'')+'" style="color:'+(r.commonRemaining<0?'#ffdf9b':'#bdcdbf')+'">'+(r.commonRemaining>=0?'ພື້ນທີ່ສ່ວນກາງຍັງເຫຼືອ: ':'ພື້ນທີ່ສ່ວນກາງເກີນກຳນົດ: ')+num(Math.abs(r.commonRemaining))+' m²</p>'+
   '<div class="budget"><small>ງົບກໍ່ສ້າງປະເມີນຕາມເນື້ອທີ່</small><strong>'+(s.cost?money(r.budget,s.currency):'ປ້ອນຄ່າກໍ່ສ້າງ / m²')+'</strong><p>ຄ່າກໍ່ສ້າງພື້ນຖານ: '+money(r.base,s.currency)+'</p><p>ງົບສຳຮອງ ('+num(s.contingency)+'%): '+money(r.extra,s.currency)+'</p><p>ລາຄາ × '+num(r.gross)+' m² ເນື້ອທີ່ລວມ + ງົບສຳຮອງ</p>'+(r.total&&s.cost?'<p>ງົບສະເລ່ຍຕໍ່ຫ້ອງຢູ່ອາໄສ: '+money(r.budget/r.total,s.currency)+'</p>':'')+'</div>';
  try{localStorage.setItem(key,JSON.stringify(s));$('saved').textContent='ບັນທຶກໃນອຸປະກອນນີ້ແລ້ວ';}catch{$('saved').textContent='ບໍ່ສາມາດບັນທຶກໃນອຸປະກອນນີ້';}
 }catch(e){
  last=null;$('error').textContent='ກະລຸນາກວດຄ່າພື້ນທີ່, ຈຳນວນ, ຂະໜາດ ແລະສັດສ່ວນໃຫ້ຖືກຕ້ອງ. ສັດສ່ວນ Type ຫ້ອງຕ້ອງລວມ 100%.';
  $('results').replaceChildren();$('export').disabled=true;
 }
}
document.addEventListener('input',e=>{if(!e.target.closest('#rooms')&&!e.target.closest('#common-spaces'))render();});
document.addEventListener('change',e=>{if(!e.target.closest('#rooms')&&!e.target.closest('#common-spaces'))render();});
$('add-room').onclick=()=>{roomData.push({name:'ຫ້ອງໃໝ່',area:30,weight:10,enabled:true});drawRooms();balance(roomData.length-1);render();$('name'+(roomData.length-1)).focus();};
$('add-common-space').onclick=()=>{commonData.push({name:'ຫ້ອງສ່ວນກາງໃໝ່',quantity:1,area:30});drawCommonSpaces();render();};
$('print').onclick=()=>window.print();
$('reset').onclick=()=>load(structuredClone(defaults));
$('export').onclick=()=>{
 if(!last)return;
 const {s,r}=last;
 const rows=[
  ['APA STUDIO — ຜົນປະເມີນເບື້ອງຕົ້ນ'],['ໂຄງການ',s.project],['ສະກຸນເງິນ',s.currency],
  ['ເນື້ອທີ່ດິນ m²',s.land],['ອັດຕາການໃຊ້ທີ່ດິນ %',s.coverage],['ຈຳນວນຊັ້ນ',s.floors],
  ['ພື້ນທີ່ຢູ່ອາໄສ %',s.residential],['ພື້ນທີ່ສ່ວນກາງ %',100-s.residential],
  ['ເນື້ອທີ່ອາຄານລວມ m²',r.gross],['ພື້ນທີ່ຢູ່ອາໄສ m²',r.residential],['ພື້ນທີ່ສ່ວນກາງ m²',r.common],
  ['ຈຳນວນຫ້ອງຢູ່ອາໄສ',r.total],['ພື້ນທີ່ຫ້ອງທີ່ fit in m²',r.used],['ເສດເຫຼືອຈາກການປັດລົງ m²',r.unused],
  ['ພື້ນທີ່ສ່ວນກາງທີ່ໃຊ້ m²',r.commonUsed],['ພື້ນທີ່ສ່ວນກາງຄົງເຫຼືອ m²',r.commonRemaining],
  ['ຄ່າກໍ່ສ້າງຕໍ່ m²',s.cost],['ຄ່າກໍ່ສ້າງພື້ນຖານ',r.base],['ງົບສຳຮອງ %',s.contingency],['ງົບກໍ່ສ້າງລວມ',r.budget],[],
  ['ປະເພດຫ້ອງ','ຂະໜາດ m²','ສັດສ່ວນ %','ພື້ນທີ່ຈັດສັນ m²','ຈຳນວນຫ້ອງ','ພື້ນທີ່ທີ່ໃຊ້ m²'],
  ...r.rows.map(x=>[x.name,x.area,x.share,x.allocation,x.count,x.used]),[],
  ['ຫ້ອງສ່ວນກາງ','ຈຳນວນ','ຂະໜາດ / ຫ້ອງ m²','ພື້ນທີ່ລວມ m²'],
  ...r.commonSpaces.map(x=>[x.name,x.quantity,x.area,x.total])
 ];
 if(window.materialExportRows)rows.push(...window.materialExportRows());
 const csv='\uFEFF'+rows.map(row=>row.map(v=>'"'+String(typeof v==='string'&&/^[=+@\-\t\r]/.test(v)?"'"+v:v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='apa-studio-estimate.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};
load(initial);
