(function(){
  var cv=document.getElementById('t'), ctx=cv.getContext('2d');
  var W=800,H=420,R=11,PR=22;
  ctx.scale(2,2);
  var COL=['#f1efe6','#f2c230','#1f4fa8','#d0312d','#5b2a86','#ee7d1c','#1d7a3e','#7a1f2b','#111111'];
  var pockets=[[0,0],[W/2,0],[W,0],[0,H],[W/2,H],[W,H]];
  var balls=[], potted=0, aim=null, cue, statusEl=document.getElementById('status'), countEl=document.getElementById('count');

  function rack(){
    balls=[]; potted=0; countEl.textContent='Potted: 0';
    cue={x:200,y:H/2,vx:0,vy:0,n:0,on:true}; balls.push(cue);
    var nums=[1,2,3,4,5,6,7,9,10,11,12,13,14,15];
    for(var i=nums.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=nums[i];nums[i]=nums[j];nums[j]=t;}
    var k=0, dx=R*1.74+.5, dy=R*2+.6;
    for(var c=0;c<5;c++)for(var r=0;r<=c;r++){
      var mid=(c===2&&r===1), n=mid?8:nums[k++];
      balls.push({x:540+c*dx,y:H/2+(r-c/2)*dy,vx:0,vy:0,n:n,on:true});
    }
    statusEl.textContent='Drag back from anywhere, then release to break.';
  }

  function moving(){return balls.some(function(b){return b.on&&(Math.abs(b.vx)>.04||Math.abs(b.vy)>.04);});}

  function step(){
    for(var s=0;s<4;s++){
      balls.forEach(function(b){
        if(!b.on)return;
        b.x+=b.vx/4; b.y+=b.vy/4;
        for(var p=0;p<6;p++){
          var ddx=b.x-pockets[p][0], ddy=b.y-pockets[p][1];
          if(ddx*ddx+ddy*ddy<PR*PR){sink(b);return;}
        }
        if(b.x<R){b.x=R;b.vx=Math.abs(b.vx)*.9;}
        if(b.x>W-R){b.x=W-R;b.vx=-Math.abs(b.vx)*.9;}
        if(b.y<R){b.y=R;b.vy=Math.abs(b.vy)*.9;}
        if(b.y>H-R){b.y=H-R;b.vy=-Math.abs(b.vy)*.9;}
      });
      for(var i=0;i<balls.length;i++)for(var j=i+1;j<balls.length;j++){
        var a=balls[i],b=balls[j]; if(!a.on||!b.on)continue;
        var dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<R*2&&d>0){
          var nx=dx/d,ny=dy/d,ov=(R*2-d)/2;
          a.x-=nx*ov;a.y-=ny*ov;b.x+=nx*ov;b.y+=ny*ov;
          var dv=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
          if(dv>0){a.vx-=dv*nx;a.vy-=dv*ny;b.vx+=dv*nx;b.vy+=dv*ny;}
        }
      }
    }
    balls.forEach(function(b){
      if(!b.on)return;
      b.vx*=.987;b.vy*=.987;
      if(Math.abs(b.vx)<.03&&Math.abs(b.vy)<.03){b.vx=0;b.vy=0;}
    });
  }

  function sink(b){
    b.on=false;b.vx=b.vy=0;
    if(b===cue){statusEl.textContent='Scratch! The white ball is back on the table.';return;}
    potted++;countEl.textContent='Potted: '+potted;
    statusEl.textContent=b.n===8?'The eight ball is down. Re-rack to play again.':'Ball '+b.n+' potted.';
  }

  function drawBall(b){
    var c=COL[b.n>8?b.n-8:b.n];
    ctx.save();ctx.translate(b.x,b.y);
    ctx.beginPath();ctx.arc(1.5,2.5,R,0,7);ctx.fillStyle='rgba(0,0,0,.28)';ctx.fill();
    ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.fillStyle=b.n>8?'#f1efe6':c;ctx.fill();
    if(b.n>8){ctx.save();ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.clip();ctx.fillStyle=c;ctx.fillRect(-R,-R*.55,R*2,R*1.1);ctx.restore();}
    if(b.n>0){ctx.beginPath();ctx.arc(0,0,R*.48,0,7);ctx.fillStyle='#f6f3ea';ctx.fill();ctx.fillStyle='#111';ctx.font='bold 7.5px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b.n,0,.5);}
    ctx.beginPath();ctx.arc(-3.5,-4,2.6,0,7);ctx.fillStyle='rgba(255,255,255,.45)';ctx.fill();
    ctx.restore();
  }

  function draw(){
    var g=ctx.createRadialGradient(W/2,H/2,60,W/2,H/2,W*.65);
    g.addColorStop(0,'#12805f');g.addColorStop(1,'#0a5640');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(250,0);ctx.lineTo(250,H);ctx.stroke();
    ctx.beginPath();ctx.arc(540,H/2,3,0,7);ctx.fillStyle='rgba(255,255,255,.3)';ctx.fill();
    pockets.forEach(function(p){ctx.beginPath();ctx.arc(p[0],p[1],PR,0,7);ctx.fillStyle='#050a08';ctx.fill();});
    if(aim&&!moving()&&cue.on){
      var dx=aim.sx-aim.x,dy=aim.sy-aim.y,len=Math.min(Math.sqrt(dx*dx+dy*dy),160);
      if(len>4){
        var ang=Math.atan2(dy,dx),ux=Math.cos(ang),uy=Math.sin(ang);
        ctx.setLineDash([6,6]);ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(cue.x,cue.y);ctx.lineTo(cue.x+ux*260,cue.y+uy*260);ctx.stroke();ctx.setLineDash([]);
        ctx.strokeStyle='#c98f3a';ctx.lineWidth=5;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(cue.x-ux*(R+6+len*.4),cue.y-uy*(R+6+len*.4));ctx.lineTo(cue.x-ux*(R+6+len*.4+170),cue.y-uy*(R+6+len*.4+170));ctx.stroke();
        ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(14,H-26,120,10);
        ctx.fillStyle=len>110?'#d0312d':'#e7b84c';ctx.fillRect(14,H-26,120*len/160,10);
      }
    }
    balls.forEach(function(b){if(b.on)drawBall(b);});
  }

  function pos(e){var r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
  cv.addEventListener('pointerdown',function(e){
    if(moving())return;
    if(!cue.on){cue.on=true;cue.x=200;cue.y=H/2;cue.vx=cue.vy=0;}
    var p=pos(e);aim={sx:p.x,sy:p.y,x:p.x,y:p.y};cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove',function(e){if(aim){var p=pos(e);aim.x=p.x;aim.y=p.y;}});
  function release(){
    if(!aim)return;
    var dx=aim.sx-aim.x,dy=aim.sy-aim.y,len=Math.min(Math.sqrt(dx*dx+dy*dy),160);
    if(len>4&&cue.on){var a=Math.atan2(dy,dx),sp=len/160*26;cue.vx=Math.cos(a)*sp;cue.vy=Math.sin(a)*sp;statusEl.textContent='Shot away.';}
    aim=null;
  }
  cv.addEventListener('pointerup',release);
  cv.addEventListener('pointercancel',function(){aim=null;});
  document.getElementById('reset').addEventListener('click',rack);

  function loop(){step();draw();requestAnimationFrame(loop);}
  rack();loop();

  document.getElementById('f').addEventListener('submit',function(e){
    e.preventDefault();
    document.getElementById('msg').textContent="You're on the list. We'll write to "+document.getElementById('email').value+" when tables open.";
    this.reset();
  });
})();
