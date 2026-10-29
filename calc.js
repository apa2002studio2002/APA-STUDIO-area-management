/* Areas are in square metres. Residential room shares are area percentages. */
function calculate(s) {
  const limits={land:[0,1e9],coverage:[0,100],floors:[1,200],residential:[0,100],cost:[0,1e12],contingency:[0,100]};
  for(const [key,[min,max]] of Object.entries(limits)) if(!Number.isFinite(s[key])||s[key]<min||s[key]>max) throw Error('Please enter a valid '+key+' value ('+min+'–'+max+').');
  if(!Number.isInteger(s.floors)) throw Error('Number of floors must be a whole number.');
  const footprint=s.land*s.coverage/100;
  const gross=footprint*s.floors;
  const residential=gross*s.residential/100;
  const common=gross-residential;
  const selected=s.rooms.filter(r=>r.enabled);
  for(const r of selected){
    if(!r.name||!r.name.trim()) throw Error('Room names are required.');
    if(!Number.isFinite(r.area)||r.area<=0||!Number.isFinite(r.weight)||r.weight<0) throw Error('Selected unit sizes must be positive; room shares cannot be negative.');
  }
  const active=selected.filter(r=>r.weight>0);
  const shareTotal=active.reduce((sum,r)=>sum+r.weight,0);
  if(selected.length&&Math.abs(shareTotal-100)>0.001) throw Error('Residential room percentages must total 100%.');
  const rows=selected.map(r=>{
    const allocation=shareTotal?r.weight/shareTotal*residential:0;
    const count=Math.floor(allocation/r.area);
    const used=count*r.area;
    return {...r,share:shareTotal?r.weight/shareTotal*100:0,allocation,count,used,unused:allocation-used,solo:Math.floor(residential/r.area)};
  });
  const total=rows.reduce((sum,r)=>sum+r.count,0);
  const used=rows.reduce((sum,r)=>sum+r.used,0);
  const commonSpaces=(s.commonSpaces||[]).map(item=>{
    if(!item.name||!item.name.trim()) throw Error('Common-space names are required.');
    if(!Number.isInteger(item.quantity)||item.quantity<0) throw Error('Common-space quantities must be whole numbers and cannot be negative.');
    if(!Number.isFinite(item.area)||item.area<=0) throw Error('Common-space sizes must be greater than zero.');
    return {...item,total:item.quantity*item.area};
  });
  const commonUsed=commonSpaces.reduce((sum,item)=>sum+item.total,0);
  const base=gross*s.cost;
  return {
    footprint,gross,residential,net:residential,common,open:s.land-footprint,
    total,perFloor:s.floors?total/s.floors:0,used,unused:residential-used,rows,
    commonSpaces,commonUsed,commonRemaining:common-commonUsed,
    base,extra:base*s.contingency/100,budget:base*(1+s.contingency/100)
  };
}
function calculateMaterials(rows,gross,labour,contingency){
  if(!Number.isFinite(gross)||gross<0||!Number.isFinite(labour)||labour<0||!Number.isFinite(contingency)||contingency<0||contingency>100)throw Error('ກະລຸນາປ້ອນພື້ນທີ່, ຄ່າແຮງງານ ແລະ ງົບສຳຮອງໃຫ້ຖືກຕ້ອງ.');
  const items=rows.map(r=>{if(!Number.isFinite(r.quantity)||r.quantity<0||!Number.isFinite(r.rate)||r.rate<0||!Number.isFinite(r.waste)||r.waste<0||r.waste>100)throw Error('ປະລິມານ ແລະ ລາຄາວັດສະດຸຕ້ອງບໍ່ຕິດລົບ; ເຜື່ອເສຍຫາຍ 0–100%.');const net=r.quantity*(r.basis==='area'?gross:1),purchase=net*(1+r.waste/100);return {...r,net,purchase,total:purchase*r.rate};});
  const materials=items.reduce((sum,r)=>sum+r.total,0),base=materials+labour;
  return {items,materials,labour,base,extra:base*contingency/100,total:base*(1+contingency/100)};
}
if(typeof module!=='undefined')module.exports={calculate,calculateMaterials};
