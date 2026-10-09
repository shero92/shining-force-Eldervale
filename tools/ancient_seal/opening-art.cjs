'use strict';
// Original pixel artwork. Each colour is an index in the native scene palette.
// Large objects are cut into 24px map blocks, then native 8px tiles.
const EXTRA = [...Array.from({length:12},(_,i)=>'temple'+i),
  ...Array.from({length:4},(_,i)=>'oak'+i), 'rib0','rib1','rib2',
  'coast','bank','grass2','grass3','beachpillar','beachflowers'];
function art(type) {
  if(type==='beachpillar'||type==='beachflowers')return art(type==='beachpillar'?'pillar':'flowers').map(row=>row.map(c=>c===2||c===3?7:c));
  const p=Array.from({length:24},()=>Array(24).fill(2));
  const dot=(x,y,c)=>{if(x>=0&&y>=0&&x<24&&y<24)p[y][x]=c;};
  const rect=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)dot(i,j,c);};
  const line=(x,y,u,v,c)=>{const n=Math.max(Math.abs(u-x),Math.abs(v-y));for(let i=0;i<=n;i++)dot(Math.round(x+(u-x)*i/(n||1)),Math.round(y+(v-y)*i/(n||1)),c);};
  const ellipse=(x,y,rx,ry,c)=>{for(let j=Math.floor(y-ry);j<=y+ry;j++)for(let i=Math.floor(x-rx);i<=x+rx;i++)if((i-x)**2/(rx*rx)+(j-y)**2/(ry*ry)<=1)dot(i,j,c);};
  const noise=(x,y,s=0)=>{let n=Math.imul(x+19+s,374761393)^Math.imul(y+31,668265263);n=Math.imul(n^(n>>>13),1274126177);return(n^(n>>>16))>>>0;};
  function grass(seed=0) {
    for(let y=0;y<24;y++)for(let x=0;x<24;x++)p[y][x]=noise(x,y,seed)%53===0?1:2;
    for(let i=0;i<3;i++){const x=noise(i,2,seed)%22,y=noise(i,8,seed)%22;line(x,y,x-1,y-2,1);dot(x+1,y-1,3);dot(x,y-2,3);}
  }
  function sand(){for(let y=0;y<24;y++)for(let x=0;x<24;x++)p[y][x]=noise(x,y)%31===0?8:7;for(let i=0;i<5;i++){const x=noise(i,7)%21,y=noise(i,2)%24;line(x,y,x+2,y,6);}}
  function water(){for(let y=0;y<24;y++)for(let x=0;x<24;x++)p[y][x]=4;
    for(const [x,y,w] of [[1,3,7],[13,10,8],[2,18,6],[17,23,7]]){line(x,y,x+w,y,10);line(x+2,y-1,x+w-2,y-1,13);}}
  if(type.startsWith('temple')) {
    // A continuous 96x72 facade with copper-gold trims and turquoise domes.
    const b=+type.slice(6), ox=b%4*24,oy=Math.floor(b/4)*24;
    for(let y=0;y<24;y++)for(let x=0;x<24;x++){
      const X=x+ox,Y=y+oy; let c=2;
      if(Y>=25&&X>=6&&X<=89){c=X>81?8:7;if(Y%9===0)c=8;else if((X+(Math.floor(Y/9)%2)*8)%16===0)c=6;}
      // Twin cupolas, shaped rather than a repeated roof texture.
      for(const cx of [20,75]){
        if(Y>=4&&Y<=24&&(X-cx)**2/225+(Y-24)**2/400<=1)c=Y<9?13:(X<cx-4?10:(X<cx+5?4:9));
        if(Y===24&&Math.abs(X-cx)<=15)c=11;
        if(Y>=26&&Y<55&&Math.abs(X-cx)<=9)c=X>cx+5?8:6;
        if(Y>=31&&Y<46&&Math.abs(X-cx)<=4)c=Math.abs(X-cx)===4?11:(X<cx?9:4);
        if(Y===3&&Math.abs(X-cx)<=2)c=11;
      }
      if(Y>=17&&Y<=32&&X>=31&&X<=64)c=Y===17||Y===31?11:((X-31)%7===0?10:4);
      if(Y>=37&&Y<=63&&X>=40&&X<=55){c=1;if(X===40||X===55||Y===37)c=11;}
      if(Y>=36&&Y<62&&([32,34,61,63].includes(X)))c=X%2===0?6:8;
      if(Y>=62&&X>=5&&X<=90)c=Y%3===0?6:8;
      if(Y===60&&X>=5&&X<=90)c=11;
      if((X<14||X>81)&&Y>=44&&Y<60&&noise(X,Y)%7<3)c=Y<51?3:2;
      p[y][x]=c;
    }
    return p;
  }
  if(type.startsWith('oak')) {
    const b=+type.slice(3),ox=b%2*24,oy=Math.floor(b/2)*24;
    for(let y=0;y<24;y++)for(let x=0;x<24;x++){
      const X=x+ox,Y=y+oy;let c=noise(X,Y)%19===0?1:2;
      if((X-24)**2/330+(Y-41)**2/22<1)c=1;
      if(Y>19&&Y<46&&Math.abs(X-24-Math.floor((Y-20)/8))<4)c=X<25?8:9;
      if(Y>40&&Y<46&&Math.abs(X-24)<(Y-38))c=8;
      for(const [cx,cy,rx,ry] of [[15,15,13,11],[30,16,15,12],[23,7,12,7],[9,24,8,6],[36,25,9,7]])if((X-cx)**2/rx**2+(Y-cy)**2/ry**2<1){const t=noise(X,Y)%13;c=Y>cy+3?1:2;if(Y<cy-2&&X<cx+3)c=3;if(Y===cy+3&&t<4)c=2;if(Y<cy&&t===0)c=2;}
      p[y][x]=c;
    }return p;
  }
  if(type.startsWith('rib')) {
    sand();const i=+type.slice(3);
    ellipse(14,21,9,2,8);
    if(i===0){for(let t=0;t<20;t++){let y=22-t,x=7+Math.round(t*t/55);line(x,y,x+3,y,8);line(x,y-1,x+1,y-1,6);}rect(5,21,9,2,6);}
    if(i===1){line(3,19,19,6,8);line(3,17,18,4,6);rect(5,18,6,3,7);rect(15,3,5,3,6);}
    if(i===2){ellipse(12,15,9,6,8);ellipse(11,13,8,5,6);ellipse(9,12,2,2,9);ellipse(16,14,2,2,9);rect(7,17,11,3,7);for(let x=8;x<18;x+=3)rect(x,19,1,3,6);}
    return p;
  }
  switch(type){
    case 'grass':grass();break;
    case 'grass2':grass(11);break;
    case 'grass3':grass(22);break;
    case 'water':water();break;
    case 'coast':water();for(let x=0;x<24;x++){const y=5+Math.round(2*Math.sin(x/5));for(let j=0;j<y;j++)dot(x,j,7);dot(x,y,6);dot(x,y+1,13);dot(x,y+2,10);}break;
    case 'bank':water();for(let x=0;x<24;x++){const y=8+Math.round(2*Math.sin(x/6));for(let j=0;j<y;j++)dot(x,j,j<y-3?2:8);dot(x,y,9);dot(x,y+1,13);}break;
    case 'sand':sand();break;
    case 'path':
    case 'stone':for(let y=0;y<24;y++)for(let x=0;x<24;x++){const xx=(x+(Math.floor(y/8)%2)*6)%12;p[y][x]=y%8===7||xx===11?8:(y%8===0||xx===0?6:7);}break;
    case 'roof':for(let y=0;y<24;y++)for(let x=0;x<24;x++)p[y][x]=y%6===5?9:(y%6===0?13:((x+Math.floor(y/6)*4)%8===0?10:4));break;
    case 'cliff':for(let y=0;y<24;y++)for(let x=0;x<24;x++){const seam=(x+Math.floor(y/7))%8;p[y][x]=y<3?(noise(x,y)%4===0?3:2):(seam<2?9:(seam<4?8:(y%9===3?7:8)));}break;
    case 'flowers':grass();for(const [x,y] of [[4,8],[16,4],[11,19],[21,15]]){line(x,y,x,y+3,1);dot(x,y,11);dot(x-1,y,6);dot(x+1,y,6);dot(x,y-1,6);}break;
    case 'tree':grass();ellipse(12,21,8,2,1);rect(10,12,5,9,8);ellipse(12,9,10,8,1);ellipse(10,7,9,6,2);ellipse(7,5,5,3,3);for(let i=0;i<12;i++)dot(noise(i,2)%17+3,noise(i,3)%10+3,3);break;
    case 'shrub':grass();ellipse(12,19,10,3,1);ellipse(12,15,9,5,2);ellipse(9,12,7,3,3);for(const [x,y] of [[6,14],[13,12],[18,16]]){dot(x,y,11);dot(x+1,y,6);}break;
    case 'pillar':grass();ellipse(12,22,9,2,1);rect(5,19,14,3,8);rect(7,5,10,14,7);rect(7,5,2,14,6);rect(14,5,3,14,8);rect(5,2,14,3,6);line(5,5,18,5,8);line(11,7,11,16,6);line(13,12,10,15,9);break;
    case 'lantern':grass();ellipse(12,22,6,2,1);rect(11,9,2,13,8);line(12,8,18,8,8);rect(15,9,7,9,8);rect(16,10,5,6,11);rect(17,11,3,4,6);line(15,17,21,17,9);break;
    case 'arch':for(let y=0;y<24;y++)for(let x=0;x<24;x++){let c=1;if(x<5||x>18||y<5)c=x%5===0||y%7===0?8:7;else if(x===6||x===17)c=10;else if(y>19)c=8;else if(x===11||x===12)c=4;p[y][x]=c;}break;
    case 'sword':sand();line(6,20,18,4,8);line(5,18,17,3,6);line(8,16,17,4,13);line(3,14,12,19,11);line(3,21,6,17,9);dot(17,3,6);dot(16,2,13);break;
    default:throw Error('Unknown artwork '+type);
  }return p;
}
module.exports={art,EXTRA};
