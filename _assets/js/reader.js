(function(){
  'use strict';
  var date=document.getElementById('terminal-today');
  function updateDate(){var now=new Date();var value=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');date.textContent=value;date.dateTime=value;}
  if(date){updateDate();setInterval(updateDate,30000);document.addEventListener('visibilitychange',updateDate);}
  var main=document.querySelector('.main'), page=document.querySelector('.page');
  if(!main || !page || !page.querySelector('.post-nav,.home-intro')) return;
  var article=!!page.querySelector('.post-nav'), index=0,total=1,continuous=false,signature='';
  var bar=document.createElement('nav');bar.className='reader-controls';bar.setAttribute('aria-label','Terminal pages');
  function button(label,fn){var b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);bar.append(b);return b;}
  var prev=button('Previous',function(){move(-1);});
  var label=document.createElement('span');label.setAttribute('role','status');bar.append(label);
  var next=button('Next',function(){move(1);});
  var back=document.createElement('a');back.href='/';back.textContent='Back to archive';if(article)bar.append(back);
  var toggle=button('Continuous reading',function(){continuous=!continuous;signature='';main.classList.toggle('terminal-paged',!continuous);toggle.textContent=continuous?'Screen reading':'Continuous reading';index=0;main.scrollLeft=0;main.scrollTop=0;refresh();});
  main.after(bar);main.classList.add('terminal-paged');
  function columnStride(){return page.getBoundingClientRect().width+48;}
  function refresh(){
    if(continuous){prev.hidden=next.hidden=label.hidden=true;document.dispatchEvent(new Event('terminal-page-change'));return;}
    prev.hidden=next.hidden=label.hidden=false;
    main.style.setProperty('--reader-height',main.clientHeight+'px');
    var stride=columnStride();
    total=Math.max(1,Math.round((main.scrollWidth+48)/stride));index=Math.min(index,total-1);
    var current=[main.clientWidth,main.clientHeight,index,total].join(':');
    if(current===signature)return;signature=current;
    main.scrollLeft=index*stride;main.scrollTop=0;
    prev.disabled=index===0;next.disabled=index===total-1;
    label.textContent=(index+1)+' / '+total;
    main.dataset.screen=String(index+1);main.dataset.screens=String(total);
    document.dispatchEvent(new Event('terminal-page-change'));
  }
  function move(delta){if(continuous)return;if(index+delta<0 || index+delta>=total)return;index+=delta;refresh();}
  function advance(){if(document.querySelector('.terminal-boot[open]'))return;if(main.dataset.printing==='true'){document.dispatchEvent(new Event('terminal-finish-printing'));return;}if(index===total-1){if(article)location.assign('/');return;}move(1);}
  main.addEventListener('click',function(e){if(!article || continuous || e.target.closest('a,button,input,textarea,video,audio,pre') || getSelection().toString())return;advance();});
  document.addEventListener('keydown',function(e){
    if(!article || continuous || document.querySelector('.terminal-boot[open]') || e.altKey || e.ctrlKey || e.metaKey || e.target.closest('a,button,input,textarea,select,[contenteditable],pre'))return;
    if(e.key==='Enter' || e.key===' '){e.preventDefault();advance();}
    if(e.key==='PageDown' || e.key==='ArrowDown'){e.preventDefault();move(1);}
    if(e.key==='PageUp' || e.key==='ArrowUp'){e.preventDefault();move(-1);}
  });
  var timer;
  new ResizeObserver(function(){clearTimeout(timer);timer=setTimeout(refresh,100);}).observe(main);
  main.addEventListener('load',refresh,true);
  // Native fragment links and focus can move the columns without using move().
  // Read the resulting position after the browser has performed that scroll.
  var syncFrame=0;
  function syncPosition(){
    if(continuous || syncFrame)return;
    syncFrame=requestAnimationFrame(function(){
      syncFrame=0;if(continuous)return;
      index=Math.max(0,Math.min(total-1,Math.round(main.scrollLeft/columnStride())));
      refresh();
    });
  }
  main.addEventListener('scroll',syncPosition,{passive:true});
  main.addEventListener('focusin',syncPosition);
  window.addEventListener('hashchange',syncPosition);
  refresh();
})();
