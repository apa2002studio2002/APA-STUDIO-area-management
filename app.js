const $=id=>document.getElementById(id),key='area-studio-v1';
const defaults={land:1000,coverage:60,floors:4,common:25,cost:0,contingency:10,currency:'LAK',project:'ໂຄງການອາພາດເມັນຂອງຂ້ອຍ',rooms:[{name:'ສະຕູດິໂອ',area:28,weight:50,enabled:true},{name:'1 ຫ້ອງນອນ',area:45,weight:30,enabled:true},{name:'2 ຫ້ອງນອນ',area:65,weight:20,enabled:true},{name:'3 ຫ້ອງນອນ',area:90,weight:10,enabled:false},{name:'ອາພາດເມັນ / ກຳນົດເອງ',area:35,weight:10,enabled:false}]};
let initial=structuredClone(defaults),last=null;
try{const stored=JSON.parse(localStorage.getItem(key));if(stored&&Array.isArray(stored.rooms)&&stored.rooms.length>=1)initial={...initial,...stored};}catch{}
let roomData=initial.rooms.map(r=>({...r}));
const roomName=r=>r.name.trim()||'ຫ້ອງໃໝ່';
function balance(changed=-1){
 const active=roomData.map((r,i)=>i).filter(i=>roomData[i].enabled);
 if(!active.length)return;
 if(active.length===1){roomData[active[0]].weight=100;}
 else {
  if(changed>=0&&active.includes(changed))roomData[changed].weight=Math.round(Math.min(100,Math.max(0,Number(roomData[changed].weight)||0))*10)/10;
  const targets=changed>=0&&active.includes(changed)?active.filter(i=>i!==changed):active;
  const available=changed>=0&&active.includes(changed)?1000-Math.round(roomData[changed].weight*10):1000;
  const total=targets.reduce((v,i)=>v+Math.max(0,Number(roomData[i].weight)||0),0);
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
  if(i>=defaults.rooms.length){const remove=document.createElement('button');remove.type='button';remove.className='room-remove quiet';remove.textContent='×';remove.title='ລຶບຫ້ອງ';remove.setAttribute('aria-label','ລຶບ '+roomName(r));remove.onclick=()=>{roomData.splice(i,1);drawRooms();balance();render();};group.append(remove);}
  enabled.onchange=()=>{if(!enabled.checked&&roomData.filter(x=>x.enabled).length===1){enabled.checked=true;return;}r.enabled=enabled.checked;r.weight=r.enabled?10:0;drawRooms();balance(r.enabled?i:-1);render();};
  name.oninput=()=>{r.name=name.value;render();};area.oninput=()=>{r.area=area.value===''?NaN:Number(area.value);render();};
  weight.onchange=()=>{weight.value=r.weight;};weight.oninput=()=>{r.weight=weight.value===''?0:Number(weight.value);balance(i);render();};
  row.append(label,area,group);$('rooms').append(row);
 });
}
function load(s){for(const id of ['land','coverage','floors','common','cost','contingency','currency','project'])$(id).value=s[id];roomData=s.rooms.map(r=>({...r}));drawRooms();balance();render();}
function state(){const s={};for(const id of ['land','coverage','floors','common','cost','contingency'])s[id]=$(id).value===''?NaN:Number($(id).value);s.currency=$('currency').value;s.project=$('project').value;s.rooms=roomData.map(r=>({...r}));return s;}
const escapeHtml=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=v=>new Intl.NumberFormat('lo-LA',{maximumFractionDigits:1}).format(v);
const money=(v,c)=>c+' '+new Intl.NumberFormat('lo-LA',{maximumFractionDigits:c==='LAK'?0:2}).format(v);
function render(){try{const s=state(),r=calculate(s);last={s,r};$('error').textContent='';$('export').disabled=false;const metric=(label,value)=>'<div class="metric"><small>'+label+'</small><strong>'+num(value)+' <span>m²</span></strong></div>';$('results').innerHTML='<div class="hero-result"><div class="number">'+num(r.total)+'<span>ຫ້ອງ</span></div><p>'+num(r.perFloor)+' ຫ້ອງຕໍ່ຊັ້ນ · '+s.floors+' ຊັ້ນ · ຕາມສັດສ່ວນທີ່ເລືອກ</p></div><div class="metrics">'+metric('ເນື້ອທີ່ຖານອາຄານ',r.footprint)+metric('ເນື້ອທີ່ອາຄານລວມ',r.gross)+metric('ພື້ນທີ່ສຳລັບຫ້ອງ',r.net)+metric('ເນື້ອທີ່ດິນທີ່ບໍ່ປຸກສ້າງ',r.open)+'</div><div class="bar"><span style="width:'+((100-s.common))+'%"></span></div><div class="legend"><span>ພື້ນທີ່ຫ້ອງ '+num(100-s.common)+'%</span><span>ສ່ວນລວມ '+num(s.common)+'%</span></div><h3>ຈຳນວນຫ້ອງທີ່ປະເມີນ</h3><table><thead><tr><th>ປະເພດ / ຂະໜາດ</th><th>ສັດສ່ວນ</th><th>ຫ້ອງ</th><th>ຖ້າໃຊ້ປະເພດນີ້ຢ່າງດຽວ</th></tr></thead><tbody>'+r.rows.map(row=>'<tr><td>'+escapeHtml(row.name)+' · '+num(row.area)+' m²</td><td>'+num(row.share)+'%</td><td>'+row.count+'</td><td>'+row.solo+'</td></tr>').join('')+'</tbody></table><p class="hint" style="color:#bdcdbf">'+(r.rows.length?'ພື້ນທີ່ຫ້ອງທີ່ໃຊ້: '+num(r.used)+' m² · ຍັງບໍ່ໄດ້ຈັດສັນ: '+num(r.unused)+' m²':'ເລືອກປະເພດຫ້ອງເພື່ອຄິດໄລ່ຈຳນວນ.')+'</p><div class="budget"><small>ງົບກໍ່ສ້າງປະເມີນຕາມເນື້ອທີ່</small><strong>'+(s.cost?money(r.budget,s.currency):'ປ້ອນຄ່າກໍ່ສ້າງ / m²')+'</strong><p>ຄ່າກໍ່ສ້າງພື້ນຖານ: '+money(r.base,s.currency)+'</p><p>ງົບສຳຮອງ ('+num(s.contingency)+'%): '+money(r.extra,s.currency)+'</p><p>ລາຄາ × '+num(r.gross)+' m² ເນື້ອທີ່ລວມ + ງົບສຳຮອງ</p>'+(r.total&&s.cost?'<p>ງົບສະເລ່ຍຕໍ່ຫ້ອງ: '+money(r.budget/r.total,s.currency)+'</p>':'')+'</div>';try{localStorage.setItem(key,JSON.stringify(s));$('saved').textContent='ບັນທຶກໃນອຸປະກອນນີ້ແລ້ວ';}catch{$('saved').textContent='ບໍ່ສາມາດບັນທຶກໃນອຸປະກອນນີ້';}}catch(e){last=null;$('error').textContent='ກະລຸນາກວດຂໍ້ມູນ: ພື້ນທີ່ ແລະ ລາຄາຕ້ອງບໍ່ຕິດລົບ; ຈຳນວນຊັ້ນເປັນຈຳນວນເຕັມ 1–200; ສັດສ່ວນ 0–100%; ຂະໜາດຫ້ອງຕ້ອງຫຼາຍກວ່າ 0.';$('results').replaceChildren();$('export').disabled=true;}}
document.addEventListener('input',e=>{if(!e.target.closest('#rooms'))render();});document.addEventListener('change',e=>{if(!e.target.closest('#rooms'))render();});$('add-room').onclick=()=>{roomData.push({name:'ຫ້ອງໃໝ່',area:30,weight:10,enabled:true});drawRooms();balance(roomData.length-1);render();$('name'+(roomData.length-1)).focus();};$('print').onclick=()=>window.print();$('reset').onclick=()=>load(structuredClone(defaults));
$('export').onclick=()=>{if(!last)return;const {s,r}=last;const rows=[['APA STUDIO — ຜົນປະເມີນເບື້ອງຕົ້ນ'],['ໂຄງການ',s.project],['ສະກຸນເງິນ',s.currency],['ເນື້ອທີ່ດິນ m²',s.land],['ອັດຕາການໃຊ້ທີ່ດິນ %',s.coverage],['ຈຳນວນຊັ້ນ',s.floors],['ພື້ນທີ່ສ່ວນລວມ %',s.common],['ເນື້ອທີ່ຖານອາຄານ m²',r.footprint],['ເນື້ອທີ່ອາຄານລວມ m²',r.gross],['ພື້ນທີ່ສຳລັບຫ້ອງ m²',r.net],['ພື້ນທີ່ສ່ວນລວມ m²',r.common],['ເນື້ອທີ່ດິນບໍ່ປຸກສ້າງ m²',r.open],['ຈຳນວນຫ້ອງຕໍ່ຊັ້ນ',r.perFloor],['ຈຳນວນຫ້ອງລວມ',r.total],['ພື້ນທີ່ຫ້ອງທີ່ໃຊ້ m²',r.used],['ພື້ນທີ່ຫ້ອງຍັງບໍ່ຈັດສັນ m²',r.unused],['ຄ່າກໍ່ສ້າງຕໍ່ m² ລວມ',s.cost],['ຄ່າກໍ່ສ້າງພື້ນຖານ',r.base],['ງົບສຳຮອງ %',s.contingency],['ງົບສຳຮອງ ຈຳນວນເງິນ',r.extra],['ງົບກໍ່ສ້າງລວມ',r.budget],[],['ປະເພດຫ້ອງ','ຂະໜາດ m²','ນ້ຳໜັກສັດສ່ວນ','ສັດສ່ວນຫ້ອງ %','ຈຳນວນຫ້ອງລວມ','ຈຳນວນຖ້າໃຊ້ປະເພດນີ້ຢ່າງດຽວ'],...r.rows.map(x=>[x.name,x.area,x.weight,x.share,x.count,x.solo]),[],['ວິທີຄິດໄລ່','ທຸກຊັ້ນໃຊ້ເນື້ອທີ່ຖານ ແລະ ສັດສ່ວນຫ້ອງດຽວກັນ. ຈຳນວນຫ້ອງປັດລົງຕໍ່ຊັ້ນ. ປະເມີນຕາມສັດສ່ວນໂດຍວິທີເສດເຫຼືອສູງສຸດ, ບໍ່ແມ່ນຜັງຈັດຫ້ອງສູງສຸດ.'],['ຂໍ້ຈຳກັດ','ເປັນການປະເມີນຕາມເນື້ອທີ່ເບື້ອງຕົ້ນ ບໍ່ລວມການກວດຜັງ ແລະ ຂໍ້ກຳນົດທ້ອງຖິ່ນ. ຄ່າໃຊ້ຈ່າຍບໍ່ລວມຄ່າດິນ, ດອກເບ້ຍ, ພາສີ, ຄ່າວິຊາຊີບ ແລະ ວຽກພາຍນອກ ນອກຈາກທ່ານລວມໄວ້ໃນລາຄາ.']];if(window.materialExportRows)rows.push(...window.materialExportRows());const csv='\uFEFF'+rows.map(row=>row.map(v=>'"'+String(typeof v==='string'&&/^[=+@\-\t\r]/.test(v)?"'"+v:v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='apa-studio-estimate.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};load(initial);



