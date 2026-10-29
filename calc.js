/* Areas in square metres. Mix shares are relative unit-count weights. */
function calculate(s) {
  const limits={land:[0,1e9],coverage:[0,100],floors:[1,200],common:[0,100],cost:[0,1e12],contingency:[0,100]};
  for(const [key,[min,max]] of Object.entries(limits)) if(!Number.isFinite(s[key])||s[key]<min||s[key]>max) throw Error('Please enter a valid '+key+' value ('+min+'–'+max+').');
  if(!Number.isInteger(s.floors)) throw Error('Number of floors must be a whole number.');
  const footprint=s.land*s.coverage/100,gross=footprint*s.floors,netFloor=footprint*(1-s.common/100);
  const selected=s.rooms.filter(r=>r.enabled);
  for(const r of selected) if(!Number.isFinite(r.area)||r.area<=0||!Number.isFinite(r.weight)||r.weight<0) throw Error('Selected unit sizes must be positive; mix weights cannot be negative.');
  const active=selected.filter(r=>r.weight>0),sum=active.reduce((v,r)=>v+r.weight,0);
  if(selected.length&&Math.abs(sum-100)>0.001) throw Error('Room percentages must total 100%.');
  if(selected.some(r=>!r.name||!r.name.trim())) throw Error('Room names are required.');
  const avg=sum?active.reduce((v,r)=>v+r.area*r.weight,0)/sum:0;
  // Round down within every floor; unused fragments cannot be pooled across floors.
  let n=avg?Math.floor(netFloor/avg):0,counts=[];
  function allocate(total){let c=active.map(r=>Math.floor(total*r.weight/sum));let left=total-c.reduce((a,b)=>a+b,0);const order=active.map((r,i)=>({i,f:total*r.weight/sum-c[i]})).sort((a,b)=>b.f-a.f||a.i-b.i);for(let j=0;j<left;j++)c[order[j].i]++;return c;}
  while(n>0){counts=allocate(n);if(counts.reduce((a,c,i)=>a+c*active[i].area,0)<=netFloor+1e-8)break;n--;}
  if(!n)counts=active.map(()=>0);
  const usedFloor=counts.reduce((v,c,i)=>v+c*active[i].area,0),base=gross*s.cost;
  return {footprint,gross,netFloor,net:netFloor*s.floors,common:gross*s.common/100,open:s.land-footprint,total:n*s.floors,perFloor:n,used:usedFloor*s.floors,unused:(netFloor-usedFloor)*s.floors,base,extra:base*s.contingency/100,budget:base*(1+s.contingency/100),rows:selected.map(r=>({...r,count:(counts[active.indexOf(r)]||0)*s.floors,share:sum?r.weight/sum*100:0,solo:Math.floor(netFloor/r.area)*s.floors}))};
}
function calculateMaterials(rows,gross,labour,contingency){
  if(!Number.isFinite(gross)||gross<0||!Number.isFinite(labour)||labour<0||!Number.isFinite(contingency)||contingency<0||contingency>100)throw Error('ກະລຸນາປ້ອນພື້ນທີ່, ຄ່າແຮງງານ ແລະ ງົບສຳຮອງໃຫ້ຖືກຕ້ອງ.');
  const items=rows.map(r=>{if(!Number.isFinite(r.quantity)||r.quantity<0||!Number.isFinite(r.rate)||r.rate<0||!Number.isFinite(r.waste)||r.waste<0||r.waste>100)throw Error('ປະລິມານ ແລະ ລາຄາວັດສະດຸຕ້ອງບໍ່ຕິດລົບ; ເຜື່ອເສຍຫາຍ 0–100%.');const net=r.quantity*(r.basis==='area'?gross:1),purchase=net*(1+r.waste/100);return {...r,net,purchase,total:purchase*r.rate};});
  const materials=items.reduce((s,r)=>s+r.total,0),base=materials+labour;return {items,materials,labour,base,extra:base*contingency/100,total:base*(1+contingency/100)};
}
if(typeof module!=='undefined')module.exports={calculate,calculateMaterials};

