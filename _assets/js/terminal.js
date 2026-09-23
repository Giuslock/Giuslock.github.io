(function () {
  'use strict';
  var main = document.querySelector('.main');
  var page = document.querySelector('.page');
  if (!main || !page) return;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var audioContext, master, audioReady, sound = false, wantedSound = false, frame = 0, restore = null, bootTimer;
  var buffers = {}, playing = {}, humStarted = false;
  var read = function (key) { try { return sessionStorage.getItem(key); } catch (_) { return null; } };
  var save = function (key, value) { try { sessionStorage.setItem(key, value); } catch (_) {} };
  var controls = document.createElement('div');
  controls.className = 'terminal-controls';
  var audioButton = document.createElement('button');
  audioButton.type = 'button';
  audioButton.textContent = 'Audio: off';
  audioButton.setAttribute('aria-pressed', 'false');
  var skip = document.createElement('button');
  skip.type = 'button'; skip.textContent = 'Skip printing'; skip.hidden = true;
  var status = document.createElement('span');
  status.className = 'terminal-status'; status.textContent = 'TERMLINK / READY';
  controls.append(audioButton, skip, status);
  document.querySelector('.sidebar-foot').prepend(controls);
  document.documentElement.classList.add('terminal-session');
  main.setAttribute('tabindex', '-1');
  var printCursor=document.createElement('span');printCursor.className='print-head';printCursor.textContent='█';printCursor.setAttribute('aria-hidden','true');printCursor.hidden=true;main.append(printCursor);

  function playClip(name, volume, loop) {
    if (!sound || !audioContext || audioContext.state !== 'running') return;
    if (!buffers[name]) return;
    if (playing[name]) { if(loop) return; playing[name].stop(); }
    var source = audioContext.createBufferSource();
    var gain = audioContext.createGain();
    source.buffer = buffers[name]; source.loop = !!loop;
    if(loop) source.loopEnd = Math.max(0.01,source.buffer.duration - 0.44);
    gain.gain.value = volume == null ? 1 : volume;
    source.connect(gain); gain.connect(master); playing[name] = source;
    source.onended = function () { source.disconnect(); gain.disconnect(); if(playing[name]===source) delete playing[name]; };
    source.start();
  }
  async function setAudio(on) {
    wantedSound = on;
    save('vault-audio', on ? 'on' : 'off');
    try {
      if (on && !audioContext) {
        var Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) throw new Error('Audio unavailable');
        audioContext = new Audio(); master = audioContext.createGain();
        master.gain.value = 0; master.connect(audioContext.destination);
        audioReady = Promise.all(['login','enter1','click','print','hum1','hum2','key1','key2','key3','key4','key5','key6','key7'].map(async function(name) {
          var response = await fetch('/_assets/sounds/terminal/'+name+'.wav');
          if(!response.ok) throw new Error('Missing terminal sound: '+name);
          buffers[name] = await audioContext.decodeAudioData(await response.arrayBuffer());
        }));
      }
      if (on) { await Promise.all([audioContext.resume(), audioReady]); }
      sound = wantedSound && audioContext && audioContext.state === 'running';
      if (master) master.gain.setTargetAtTime(sound && !document.hidden ? 1 : 0, audioContext.currentTime, 0.025);
      audioButton.textContent = sound ? 'Audio: on' : 'Audio: off';
      audioButton.setAttribute('aria-pressed', String(sound));
      if(sound && !humStarted) { playClip('hum1',0.2,true); playClip('hum2',0.4,true); humStarted=true; }
    } catch (_) { sound = false; wantedSound=false; if(master) master.gain.value=0; audioButton.textContent = 'Audio unavailable'; audioButton.setAttribute('aria-pressed','false'); }
  }
  audioButton.addEventListener('click', function () { setAudio(!sound); });
  var wakePrinting = null;
  function finishPrinting() {
    cancelAnimationFrame(frame);
    wakePrinting = null;
    main.dataset.printing='false';
    printCursor.hidden=true;
    if (restore) { restore(); restore = null; }
    page.removeAttribute('aria-busy');
    page.classList.remove('terminal-printing');
    skip.hidden = true; status.textContent = 'TERMLINK / READY';
  }
  function printPage() {
    finishPrinting();
    if(page.hasAttribute('data-terminal-static')) return;
    if (reduced.matches || document.documentElement.classList.contains('crt-off') || !window.Highlight || !CSS.highlights) return;
    var atomicSelector='img,svg,canvas,video,audio,iframe,hr,input,button,select,textarea';
    var walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode: function (node) {
        if(node.nodeType===Node.ELEMENT_NODE){
          if(!node.matches(atomicSelector) || node.parentElement.closest(atomicSelector) || node.closest('#search-results,[aria-hidden="true"]') || !node.getClientRects().length) return NodeFilter.FILTER_SKIP;
          return NodeFilter.FILTER_ACCEPT;
        }
        if (!node.nodeValue.trim() || node.parentElement.closest('script,style,'+atomicSelector+',#search-results,[aria-hidden="true"]') || !node.parentElement.getClientRects().length) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], node;
    while ((node = walker.nextNode())) {
      var atomic=node.nodeType===Node.ELEMENT_NODE;
      var range=document.createRange(); if(atomic)range.selectNode(node);else range.selectNodeContents(node);
      if(main.classList.contains('terminal-paged')) {
        var viewport=main.getBoundingClientRect();
        if(!Array.from(range.getClientRects()).some(function(r){return r.right>viewport.left && r.left<viewport.right && r.bottom>viewport.top && r.top<viewport.bottom;})) continue;
      }
      nodes.push({node:node,range:range,offset:0,length:atomic?1:node.length,atomic:atomic});
    }
    if (!nodes.length) return;
    // Visibility preserves layout, including list counters, table geometry and columns.
    // Reveal ancestors only when their first character/object is actually printed.
    var decorations=Array.from(page.querySelectorAll('*')).filter(function(el){return !el.closest('script,style,#search-results');});
    decorations.forEach(function(el){el.classList.add('terminal-unrevealed');});
    function reveal(el,subtree){
      if(subtree)el.querySelectorAll('.terminal-unrevealed').forEach(function(child){child.classList.remove('terminal-unrevealed');});
      while(el && el!==page){el.classList.remove('terminal-unrevealed');el=el.parentElement;}
    }
    var hiddenText=new Highlight(); nodes.forEach(function(item){if(!item.atomic)hiddenText.add(item.range);});
    CSS.highlights.set('vault-unprinted',hiddenText);
    main.dataset.printing='true';
    restore = function () { CSS.highlights.delete('vault-unprinted'); decorations.forEach(function(el){el.classList.remove('terminal-unrevealed');}); };
    skip.hidden = false; status.textContent = 'TERMLINK / RECEIVING';
    var lastSound = 0, previous=0, speedCredit=0;
    function step(now) {
      frame=0;
      var screen=main.getBoundingClientRect(), budget=Math.min(32,Math.max(1,Math.floor((now-previous)/5))), printed=false;
      // Keep the existing cadence and accumulate the 3% bonus across frames:
      // rounding each frame separately would erase such a small speed increase.
      speedCredit += budget * 0.03;
      var extra = Math.floor(speedCredit + 1e-9);
      budget += extra; speedCredit -= extra;
      previous=now;
      for(var i=0;i<nodes.length && budget>0;i++) {
        var item=nodes[i]; if(item.offset>=item.length) continue;
        var bounds=(item.atomic?item.node:item.node.parentElement).getBoundingClientRect();
        if(bounds.top>=screen.bottom || bounds.bottom<=screen.top) continue;
        if(item.atomic){
          if(bounds.right<=screen.left || bounds.left>=screen.right)continue;
          reveal(item.node,true);item.offset=1;budget--;printed=true;continue;
        }
        var probe=document.createRange();
        while(item.offset<item.length && budget>0) {
          probe.setStart(item.node,item.offset); probe.setEnd(item.node,item.offset+1);
          var rect=probe.getBoundingClientRect();
          if(main.classList.contains('terminal-paged')) {
            if(rect.left>=screen.right-2) break;
            if(rect.right<=screen.left) {item.offset++;continue;}
          }
          if(rect.top>=screen.bottom-2) break;
          reveal(item.node.parentElement,false);
          item.offset++; budget--; printed=true;
          if(rect.bottom>screen.top && rect.left<screen.right) {
            printCursor.hidden=false;
            printCursor.style.left=(main.scrollLeft+Math.min(main.clientWidth-24,Math.max(0,rect.right-screen.left)))+'px';
            printCursor.style.top=(main.scrollTop+Math.max(0,rect.top-screen.top))+'px';
          }
        }
        item.range.setStart(item.node,item.offset);
        if(item.offset===item.length) hiddenText.delete(item.range);
      }
      if(printed && now-lastSound>100) { playClip('print'); lastSound=now; }
      if(nodes.every(function(item){return item.offset===item.length;})) finishPrinting();
      else if(printed) frame=requestAnimationFrame(step);
      else if(main.classList.contains('terminal-paged')) finishPrinting();
      else status.textContent='TERMLINK / SCROLL TO CONTINUE';
    }
    wakePrinting=function(){if(!frame) { previous=performance.now(); frame=requestAnimationFrame(step); }};
    frame = requestAnimationFrame(step);
  }
  main.addEventListener('scroll',function(){if(wakePrinting) wakePrinting();},{passive:true});
  document.addEventListener('terminal-page-change',function(){if(!document.querySelector('.terminal-boot[open]'))printPage();});
  document.addEventListener('terminal-finish-printing',finishPrinting);
  window.addEventListener('resize',function(){if(wakePrinting) wakePrinting();});
  main.addEventListener('load',function(){if(wakePrinting) wakePrinting();},true);
  skip.addEventListener('click', finishPrinting);
  page.addEventListener('focusin',function(){if(wakePrinting) wakePrinting();});
  document.addEventListener('keydown',function(event){
    if(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.target.closest('input,textarea,select,[contenteditable="true"],pre')) return;
    if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) return;
    // A deliberate navigation action must not get trapped by unrevealed links.
    finishPrinting();
    var modal=document.querySelector('.terminal-boot[open]');
    var inNav=event.target.closest('.nav-list');
    var links;
    if(modal) links=Array.from(modal.querySelectorAll('button:not([hidden])'));
    else if(event.key==='ArrowLeft' || event.key==='ArrowRight') links=Array.from(document.querySelectorAll('.nav-list a'));
    else if(page.querySelector('.prose')) { if(main.classList.contains('terminal-paged'))return; event.preventDefault(); main.focus({preventScroll:true}); main.scrollBy({top:event.key==='ArrowDown'?90:-90,behavior:'instant'}); return; }
    else links=Array.from(page.querySelectorAll('a[href]')).filter(function(link){return link.getClientRects().length;});
    if(!links.length) return;
    event.preventDefault();
    var index=links.indexOf(document.activeElement), direction=(event.key==='ArrowUp'||event.key==='ArrowLeft')?-1:1;
    var next=links[index<0?(direction>0?0:links.length-1):(index+direction+links.length)%links.length];
    next.focus({preventScroll:true}); next.scrollIntoView({block:'nearest',inline:'nearest'}); playClip('click');
  });
  document.addEventListener('keydown', function (event) { if(event.key==='Escape') finishPrinting(); });
  document.getElementById('crt-toggle').addEventListener('click', finishPrinting);
  reduced.addEventListener('change', function () { if(reduced.matches) finishPrinting(); });
  var lastHover = 0;
  document.addEventListener('pointerover', function (event) {
    if(event.target.closest('a,button') && performance.now()-lastHover>110) { playClip('click'); lastHover=performance.now(); }
  });
  document.addEventListener('click', function (event) {
    var link=event.target.closest('a');
    if(!link) return;
    playClip('enter1');
    // Standard links retain native navigation, history, downloads and new-tab behavior.
  });
  document.addEventListener('visibilitychange', function () {
    if(master) master.gain.setTargetAtTime(!document.hidden && sound ? 1 : 0,audioContext.currentTime,0.025);
  });
  document.addEventListener('pointerdown',function(){ if(wantedSound && audioContext && audioContext.state==='suspended') setAudio(true); });
  document.addEventListener('keydown',function(event){
    if(wantedSound && audioContext && audioContext.state==='suspended') setAudio(true);
    if(event.target.matches('input,textarea') && event.key.length===1) playClip('key'+(1+Math.floor(Math.random()*7)));
    if(event.key==='Enter') playClip('enter1');
  });
  window.addEventListener('pagehide',function () { finishPrinting(); if(audioContext) audioContext.close(); });

  var replay=document.createElement('button'); replay.type='button'; replay.textContent='Replay boot'; controls.append(replay);
  replay.addEventListener('click',function(){finishPrinting();showBoot();});
  if (read('vault-booted') === 'yes') {
    if(read('vault-audio') === 'on') setAudio(true);
    printPage(); return;
  }
  showBoot();
  function showBoot() {
  var dialog = document.createElement('dialog');
  dialog.className = 'terminal-boot'; dialog.setAttribute('aria-labelledby','terminal-boot-title');
  var heading = document.createElement('h2'); heading.id='terminal-boot-title'; heading.textContent='ROBCO TERMLINK';
  var caption = document.createElement('p'); caption.textContent='Slop Overflow / Personal archive';
  var transcript = document.createElement('pre'); transcript.className='boot-transcript'; transcript.setAttribute('aria-hidden','true');
  transcript.textContent='STANDBY\n\n> Initialize terminal_';
  var actions = document.createElement('div'); actions.className='boot-actions';
  var loud=document.createElement('button'); loud.textContent='Start with audio'; loud.type='button';
  var quiet=document.createElement('button'); quiet.textContent='Start silently'; quiet.type='button';
  var immediate=document.createElement('button'); immediate.textContent='Skip startup'; immediate.type='button'; immediate.hidden=true;
  actions.append(loud,quiet,immediate); dialog.append(heading,caption,transcript,actions); document.body.append(dialog);
  var started=false, complete=false;
  function enter() {
    if(complete) return; complete=true; clearTimeout(bootTimer);
    save('vault-booted','yes'); dialog.close(); dialog.remove();
    main.focus({preventScroll:true}); printPage();
  }
  async function start(on) {
    if(started) return; started=true; dialog.classList.add('boot-started');
    loud.hidden=true; quiet.hidden=true; immediate.hidden=false; immediate.focus();
    await setAudio(on);
    if(complete) return;
    playClip('login');
    if(reduced.matches) { enter(); return; }
    var log='ROBCO INDUSTRIES UNIFIED OPERATING SYSTEM\nCOPYRIGHT 2075-2077 ROBCO INDUSTRIES\n\n64K RAM SYSTEM\n38911 BYTES FREE\n\n> SET TERMINAL/INQUIRE\nRIT-V300\n> SET FILE/PROTECTION=OWNER:RWED\n> SET HALT RESTART/MAINT\n\nINITIALIZING TERMLINK ...\nMEMORY CHECK ............... OK\nPHOSPHOR DISPLAY ........... OK\nMOUNTING PERSONAL ARCHIVE .. OK\n\n> RUN SLOP_OVERFLOW\nIDENTITY: GIUSLOCK\nACCESS GRANTED\n\nLoading personal archive...\n';
    var i=0; transcript.textContent='';
    function type() {
      if(complete) return;
      i+=3; transcript.textContent=log.slice(0,i); transcript.scrollTop=transcript.scrollHeight;
      if(i%15===0) playClip('print');
      if(i<log.length) bootTimer=setTimeout(type,log.slice(i-3,i).includes('\n')?160:22); else { playClip('enter1'); bootTimer=setTimeout(enter,500); }
    }
    type();
  }
  loud.addEventListener('click',function(){start(true);});
  quiet.addEventListener('click',function(){start(false);});
  immediate.addEventListener('click',enter);
  dialog.addEventListener('cancel',function(event){event.preventDefault();enter();});
  dialog.showModal();
  }
})();
