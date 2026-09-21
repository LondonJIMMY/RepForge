(() => {
  'use strict';
  const KEY = 'repforge-state-v1';
  const seed = window.REPFORGE_DATA;
  const $ = s => document.querySelector(s);
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const nowISO = () => new Date().toISOString();
  const defaults = {version:1,settings:{unit:'lb',theme:'dark',safetyAccepted:false,lastBackup:null},profile:{completed:false,name:'',goal:'general',startWeight:'',currentWeight:'',goalWeight:'',age:'',sex:'prefer_not',heightFeet:'',heightInches:'',experience:'beginner',trainingDays:3,equipment:'crunch',gymPreset:'crunch',weightHistory:[]},customExercises:[],customRoutines:[],history:[],activeWorkout:null};
  let state = load();
  let view = 'today';
  let search = '';
  let muscle = 'All';
  let restInterval = null;
  let clockInterval = null;

  function load(){
    try { const stored=JSON.parse(localStorage.getItem(KEY)||'{}'); return {...structuredClone(defaults),...stored,settings:{...defaults.settings,...(stored.settings||{})},profile:{...defaults.profile,...(stored.profile||{})}}; }
    catch { return structuredClone(defaults); }
  }
  function save(){
    try { localStorage.setItem(KEY,JSON.stringify(state)); $('#save-status').textContent='Saved on this device'; }
    catch { $('#save-status').textContent='Storage full — export now'; toast('Could not save. Export a backup now.'); }
  }
  const allExercises = () => [...seed.exercises,...state.customExercises];
  const allRoutines = () => [...seed.routines,...state.customRoutines];
  const getExercise = id => allExercises().find(e=>e.id===id) || {id,name:'Deleted exercise',muscle:'Other',equipment:'Other',tracking:'weight_reps',instructions:'No details available.',rest:90};
  const durationText = seconds => `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
  const workoutDuration = w => Math.max(0,Math.floor(((w.finishedAt?new Date(w.finishedAt):new Date())-new Date(w.startedAt))/1000));
  const completedSets = w => w?.items.reduce((n,item)=>n+item.sets.filter(s=>s.done).length,0)||0;
  const volume = w => Math.round(w?.items.reduce((sum,item)=>sum+item.sets.filter(s=>s.done).reduce((n,set)=>n+(Number(set.weight)||0)*(Number(set.reps)||0),0),0)||0);
  const haptic = () => navigator.vibrate?.(25);
  function toast(message){ const t=$('#toast'); t.textContent=message; t.classList.add('show'); clearTimeout(t._timer); t._timer=setTimeout(()=>t.classList.remove('show'),2200); }
  function go(next){ view=next; document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view)); render(); $('#view').focus(); }

  function header(title,kicker,action=''){
    return `<div class="page-head"><div><p class="eyebrow">${esc(kicker)}</p><h1>${esc(title)}</h1></div>${action}</div>`;
  }
  function render(){
    document.documentElement.classList.toggle('light',state.settings.theme==='light');
    const views={today:renderToday,workouts:renderWorkouts,exercises:renderExercises,progress:renderProgress,settings:renderSettings};
    $('#view').innerHTML=views[view]();
  }
  function recentStreak(){
    const days=new Set(state.history.map(h=>h.finishedAt.slice(0,10))); let streak=0,d=new Date();
    while(days.has(d.toISOString().slice(0,10))){streak++;d.setDate(d.getDate()-1)} return streak;
  }
  const goalLabels={lose_weight:'Lose weight',maintain:'Maintain weight',build_muscle:'Build muscle',strength:'Get stronger',general:'General fitness',endurance:'Improve endurance'};
  function goalProgress(){
    const p=state.profile,start=Number(p.startWeight),current=Number(p.currentWeight),goal=Number(p.goalWeight);
    if(!start||!current||!goal||start===goal)return null;
    const pct=Math.max(0,Math.min(100,Math.round(((current-start)/(goal-start))*100)));
    return {pct,remaining:Math.abs(goal-current).toFixed(1)};
  }
  function renderToday(){
    const total=state.history.length, thisWeek=state.history.filter(h=>Date.now()-new Date(h.finishedAt)<604800000).length;
    const resume=state.activeWorkout;
    const gp=goalProgress(),p=state.profile;
    return `${header(greeting(),'Today')}
      <section class="hero-card">
        <p class="eyebrow" style="color:#344500">${resume?'Workout in progress':'Ready when you are'}</p>
        <h2>${resume?esc(resume.name):'Build strength. Keep the receipts.'}</h2>
        <p>${resume?`${completedSets(resume)} sets finished · ${durationText(workoutDuration(resume))} elapsed`:'Choose a plan or start a blank session. Every set autosaves on this device.'}</p>
        <button class="button" data-action="${resume?'resume':'quick'}">${resume?'Resume workout':'Start quick workout'}</button>
      </section>
      <div class="stats-row"><div class="stat"><strong>${thisWeek}</strong><span>This week</span></div><div class="stat"><strong>${total}</strong><span>Total sessions</span></div><div class="stat"><strong>${recentStreak()}</strong><span>Day streak</span></div></div>
      <article class="profile-card"><div><p class="eyebrow">${esc(goalLabels[p.goal]||'Your goal')}</p><h2>${esc(p.name?`${p.name}’s progress`:'Your progress')}</h2><p>${gp?`${gp.remaining} ${state.settings.unit} from your goal`:`Current: ${esc(p.currentWeight||'—')} ${state.settings.unit} · Goal: ${esc(p.goalWeight||'—')} ${state.settings.unit}`}</p></div><div class="profile-ring" style="--progress:${gp?.pct||0}"><strong>${gp?gp.pct+'%':'—'}</strong></div><div class="goal-track"><span style="width:${gp?.pct||0}%"></span></div><div class="button-row"><button class="button" data-action="check-in">Update weight</button><button class="button ghost" data-action="edit-profile">Edit profile</button></div></article>
      <div class="section-title"><h2>Pick a workout</h2><button data-go="workouts">See all</button></div>
      <div class="card-grid">${personalizedRoutines().slice(0,4).map(r=>routineCard(r)).join('')}</div>
      <div class="section-title"><h2>Recent training</h2></div>${state.history.length?state.history.slice(0,3).map(historyCard).join(''):'<div class="empty">Your finished workouts will appear here.</div>'}`;
  }
  function greeting(){ const h=new Date().getHours(); return h<12?'Good morning':h<18?'Good afternoon':'Good evening'; }
  function routineCard(r){
    return `<article class="card"><div class="card-top"><div><h3>${esc(r.name)}</h3><p class="meta">${esc(r.tag||'Custom routine')}</p></div><span class="pill">${r.items.length} moves</span></div><button class="button primary" data-start="${esc(r.id)}">Start workout</button></article>`;
  }
  function personalizedRoutines(){
    const standard={strength:['routine-strength','routine-full-a'],build_muscle:['routine-push','routine-pull','routine-legs'],lose_weight:['routine-conditioning','routine-home'],endurance:['routine-conditioning','routine-home'],maintain:['routine-full-a','routine-full-b'],general:['routine-full-a','routine-full-b']}[state.profile.goal]||[];
    const crunch={strength:['routine-crunch-upper','routine-crunch-lower','routine-crunch-full'],build_muscle:['routine-crunch-upper','routine-crunch-lower','routine-crunch-full'],lose_weight:['routine-crunch-hiit','routine-crunch-cardio','routine-crunch-full'],endurance:['routine-crunch-cardio','routine-crunch-hiit'],maintain:['routine-crunch-full','routine-crunch-upper'],general:['routine-crunch-full','routine-crunch-hiit']}[state.profile.goal]||[];
    const order=state.profile.gymPreset==='crunch'?[...crunch,...standard]:standard;
    return [...allRoutines()].sort((a,b)=>{const ai=order.indexOf(a.id),bi=order.indexOf(b.id);return (ai<0?99:ai)-(bi<0?99:bi)});
  }
  function renderWorkouts(){
    return `${header('Workouts','Plan & train','<button class="button primary" data-action="create-routine">+ New routine</button>')}
      <div class="notice">Start with a built-in plan, then adjust every set during the workout. Recommendations are estimates—choose loads appropriate for you.</div>
      <div class="card-grid">${allRoutines().map(r=>routineCard(r)).join('')}</div>`;
  }
  function renderExercises(){
    const muscles=['All',...new Set(allExercises().map(e=>e.muscle))];
    const result=allExercises().filter(e=>(muscle==='All'||e.muscle===muscle)&&`${e.name} ${e.muscle} ${e.equipment} ${e.pattern}`.toLowerCase().includes(search.toLowerCase()));
    return `${header('Exercise library',`${allExercises().length} movements`,'<button class="button primary" data-action="custom-exercise">+ Custom</button>')}
      <div class="searchbar"><input id="exercise-search" class="input" type="search" placeholder="Search name, muscle or equipment" value="${esc(search)}" aria-label="Search exercises"><button class="button" data-action="clear-search">Clear</button></div>
      <div class="filters">${muscles.map(m=>`<button class="filter ${m===muscle?'active':''}" data-muscle="${esc(m)}">${esc(m)}</button>`).join('')}</div>
      <p class="tiny">${result.length} results</p><div class="list">${result.slice(0,120).map(exerciseCard).join('')||'<div class="empty">No exercises match those filters.</div>'}</div>`;
  }
  function exerciseCard(e){
    return `<article class="exercise-card"><div class="exercise-icon">${esc(e.muscle.slice(0,1))}</div><div class="exercise-info"><h3>${esc(e.name)}${e.custom?' · Custom':''}</h3><p class="meta">${esc(e.muscle)} · ${esc(e.equipment)} · ${esc(e.pattern)}</p></div><button class="round-add" data-detail="${esc(e.id)}" aria-label="View ${esc(e.name)}">›</button></article>`;
  }
  function renderProgress(){
    const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const key=d.toISOString().slice(0,10);return {label:d.toLocaleDateString(undefined,{weekday:'short'}).slice(0,1),vol:state.history.filter(h=>h.finishedAt.startsWith(key)).reduce((n,h)=>n+volume(h),0)}});
    const max=Math.max(...last7.map(x=>x.vol),1); const best=Math.max(...state.history.map(volume),0);
    return `${header('Progress','Your training')}
      <div class="stats-row"><div class="stat"><strong>${state.history.length}</strong><span>Workouts</span></div><div class="stat"><strong>${state.history.reduce((n,h)=>n+completedSets(h),0)}</strong><span>Logged sets</span></div><div class="stat"><strong>${best.toLocaleString()}</strong><span>Best volume ${state.settings.unit}</span></div></div>
      <article class="card"><div class="card-top"><div><h3>7-day volume</h3><p class="meta">Weight × completed reps</p></div></div><div class="progress-bars">${last7.map(x=>`<div class="bar-wrap"><div class="bar" style="height:${Math.max(4,x.vol/max*120)}px" title="${x.vol}"></div>${x.label}</div>`).join('')}</div></article>
      <div class="section-title"><h2>Workout history</h2></div>${state.history.length?state.history.map(historyCard).join(''):'<div class="empty">Finish your first workout to begin tracking progress.</div>'}`;
  }
  function historyCard(w){
    return `<article class="history-card"><div><h3>${esc(w.name)}</h3><p class="meta">${new Date(w.finishedAt).toLocaleString()} · ${durationText(workoutDuration(w))}</p></div><div style="text-align:right"><strong>${completedSets(w)} sets</strong><p class="meta">${volume(w).toLocaleString()} ${state.settings.unit} vol.</p></div></article>`;
  }
  function renderSettings(){
    return `${header('Settings','Own your data')}
      <div class="settings-group"><h2>Personal profile</h2><div class="setting-row"><div><strong>${esc(state.profile.name||'My profile')}</strong><p class="meta">${esc(goalLabels[state.profile.goal]||'General fitness')} · ${esc(state.profile.currentWeight||'—')} ${state.settings.unit} current · ${esc(state.profile.goalWeight||'—')} ${state.settings.unit} goal</p></div><button class="button" data-action="edit-profile">Edit</button></div></div>
      <div class="settings-group"><h2>Crunch Fitness setup</h2><article class="card"><div class="card-top"><div><h3>Crunch equipment profile</h3><p class="meta">Used to prioritize workouts built around your gym</p></div><span class="pill">Active</span></div><div class="equipment-cloud">${seed.crunchEquipment.map(x=>`<span>${esc(x)}</span>`).join('')}</div><p class="tiny">Equipment varies by club. You can still add any location-specific machine as a custom exercise.</p></article></div>
      <div class="settings-group"><h2>Training</h2><div class="setting-row"><div><strong>Weight unit</strong><p class="meta">Used for new entries and labels</p></div><select class="select" id="unit" style="width:90px"><option value="lb" ${state.settings.unit==='lb'?'selected':''}>lb</option><option value="kg" ${state.settings.unit==='kg'?'selected':''}>kg</option></select></div></div>
      <div class="settings-group"><h2>Backup & transfer</h2><div class="setting-row"><div><strong>Export backup</strong><p class="meta">All routines, workouts and settings</p></div><button class="button" data-action="export">Export</button></div><div class="setting-row"><div><strong>Import backup</strong><p class="meta">Replaces data after validation</p></div><button class="button" data-action="import">Import</button></div><div class="setting-row"><div><strong>Workout CSV</strong><p class="meta">Open training sets in a spreadsheet</p></div><button class="button" data-action="csv">Download</button></div><p class="tiny">Last backup: ${state.settings.lastBackup?new Date(state.settings.lastBackup).toLocaleString():'Never'}. Data is stored only in this browser, so export regularly.</p></div>
      <div class="settings-group"><h2>Install on your phone</h2><div class="notice"><strong>iPhone:</strong> open the GitHub Pages link in Safari, tap Share, then Add to Home Screen.<br><br><strong>Android:</strong> open it in Chrome, open the menu, then choose Install app or Add to Home screen.</div></div>
      <div class="settings-group"><h2>Safety</h2><div class="notice">General fitness information only. This app does not diagnose conditions or replace a qualified professional. Start gradually. Stop for sharp pain, chest pressure, faintness, severe dizziness, or unusual shortness of breath; contact emergency services for severe or sudden symptoms.</div></div>
      <div class="settings-group"><h2>Danger zone</h2><button class="button danger full" data-action="reset">Erase all RepForge data</button></div>`;
  }

  function startRoutine(id){
    if(state.activeWorkout&&!confirm('Replace your workout in progress?')) return;
    const r=allRoutines().find(x=>x.id===id); if(!r)return;
    state.activeWorkout={id:uid('workout'),name:r.name,startedAt:nowISO(),finishedAt:null,notes:'',restUntil:null,items:r.items.filter(i=>i.exerciseId).map(i=>({exerciseId:i.exerciseId,sets:Array.from({length:i.sets},()=>({id:uid('set'),weight:'',reps:i.reps,time:i.reps,done:false,rpe:''})),rest:i.rest||90}))};
    save(); openWorkout();
  }
  function openWorkout(){ $('#workout-screen').classList.remove('hidden'); renderWorkout(); startClock(); }
  function closeWorkout(){ $('#workout-screen').classList.add('hidden'); clearInterval(clockInterval); go('today'); }
  function renderWorkout(){
    const w=state.activeWorkout;if(!w){closeWorkout();return}
    $('#workout-screen').innerHTML=`<header class="workout-head"><div class="workout-head-line"><button class="button ghost" data-workout="close">← Close</button><h1>${esc(w.name)}</h1><button class="button primary" data-workout="finish">Finish</button></div><div class="workout-metrics"><span><strong id="elapsed">${durationText(workoutDuration(w))}</strong> elapsed</span><span><strong>${completedSets(w)}</strong> sets</span><span><strong>${volume(w).toLocaleString()}</strong> volume</span></div></header><div class="workout-body"><div class="notice">Stop for sharp pain, chest pressure, faintness, severe dizziness, or unusual shortness of breath.</div>${w.items.map((item,ii)=>workoutExercise(item,ii)).join('')}<button class="button full" data-workout="add-exercise">+ Add exercise</button><button class="button danger full" style="margin-top:10px" data-workout="discard">Discard workout</button></div><div id="rest-container"></div>`;
    renderRest();
  }
  function workoutExercise(item,ii){
    const e=getExercise(item.exerciseId); const timed=['duration','distance_time'].includes(e.tracking);
    return `<details class="workout-exercise" open><summary><div><h2>${ii+1}. ${esc(e.name)}</h2><p class="meta">${esc(e.muscle)} · Rest ${item.rest}s</p></div><span class="pill">${item.sets.filter(s=>s.done).length}/${item.sets.length}</span></summary><div class="sets"><div class="set-head"><span>SET</span><span>${timed?'TIME (SEC)':'WEIGHT ('+state.settings.unit+')'}</span><span>${timed?'DISTANCE':'REPS'}</span><span>DONE</span></div>${item.sets.map((s,si)=>`<div class="set-row"><span class="set-num">${si+1}</span><input inputmode="decimal" aria-label="${timed?'Time':'Weight'} for set ${si+1}" data-field="${timed?'time':'weight'}" data-item="${ii}" data-set="${si}" value="${esc(timed?s.time:s.weight)}"><input inputmode="decimal" aria-label="${timed?'Distance':'Reps'} for set ${si+1}" data-field="${timed?'distance':'reps'}" data-item="${ii}" data-set="${si}" value="${esc(timed?(s.distance||''):s.reps)}"><button class="complete ${s.done?'done':''}" data-complete="${ii}:${si}" aria-label="Mark set ${si+1} ${s.done?'incomplete':'complete'}">${s.done?'✓':'○'}</button></div>`).join('')}<div class="button-row"><button class="button" data-add-set="${ii}">+ Set</button><button class="button ghost" data-remove-ex="${ii}">Remove</button></div></div></details>`;
  }
  function startClock(){clearInterval(clockInterval);clockInterval=setInterval(()=>{const e=$('#elapsed');if(e&&state.activeWorkout)e.textContent=durationText(workoutDuration(state.activeWorkout));renderRest()},1000)}
  function toggleSet(ii,si){const w=state.activeWorkout,s=w.items[ii].sets[si];s.done=!s.done;if(s.done){w.restUntil=Date.now()+w.items[ii].rest*1000;haptic()}else if(w.restUntil)w.restUntil=null;save();renderWorkout()}
  function renderRest(){const c=$('#rest-container');if(!c||!state.activeWorkout)return;const left=Math.max(0,Math.ceil(((state.activeWorkout.restUntil||0)-Date.now())/1000));if(!state.activeWorkout.restUntil){c.innerHTML='';return}if(left===0){state.activeWorkout.restUntil=null;save();haptic();toast('Rest complete');c.innerHTML='';return}c.innerHTML=`<div class="rest-pill"><div><span class="tiny">REST TIMER</span><strong id="rest-time">${durationText(left)}</strong></div><div class="button-row"><button class="button" data-rest="add">+15</button><button class="button" data-rest="skip">Skip</button></div></div>`}
  function finishWorkout(){const w=state.activeWorkout;if(!completedSets(w)){toast('Complete at least one set first');return}if(!confirm(`Finish ${w.name} with ${completedSets(w)} completed sets?`))return;w.finishedAt=nowISO();w.restUntil=null;state.history.unshift(structuredClone(w));state.activeWorkout=null;save();closeWorkout();toast('Workout saved')}

  function openSheet(html){const s=$('#sheet');s.innerHTML=`<div class="sheet-panel"><div class="sheet-handle"></div>${html}</div>`;s.classList.remove('hidden')}
  function closeSheet(){$('#sheet').classList.add('hidden');$('#sheet').innerHTML=''}
  function profileSheet(firstRun=false){
    const p=state.profile;
    const goals=[['lose_weight','Lose weight','Reduce body weight while tracking training'],['maintain','Maintain','Stay near your current weight'],['build_muscle','Build muscle','Prioritize hypertrophy-focused routines'],['strength','Get stronger','Prioritize compound strength plans'],['endurance','Endurance','Prioritize conditioning and work capacity'],['general','General fitness','A balanced mix of strength and conditioning']];
    openSheet(`<div class="sheet-head"><div><p class="eyebrow">${firstRun?'Let’s personalize it':'Personal profile'}</p><h2 id="sheet-title">${firstRun?'What are you training for?':'Edit your details'}</h2></div>${firstRun?'':'<button class="icon-button" data-sheet-close aria-label="Close">×</button>'}</div><form id="profile-form" class="profile-form"><input type="hidden" name="firstRun" value="${firstRun?'yes':'no'}"><section class="onboard-section"><h3>1. Choose your main goal</h3><div class="goal-grid">${goals.map(([id,title,copy])=>`<label class="goal-choice"><input type="radio" name="goal" value="${id}" ${p.goal===id?'checked':''} required><span><strong>${title}</strong><small>${copy}</small></span></label>`).join('')}</div></section><section class="onboard-section"><h3>2. Your starting point</h3><div class="form-grid"><label class="full">Name or nickname <span class="tiny">(optional)</span><input class="input" name="name" maxlength="40" value="${esc(p.name)}" placeholder="What should RepForge call you?"></label><label>Age<input class="input" name="age" type="number" inputmode="numeric" min="13" max="120" value="${esc(p.age)}" required></label><label>Sex<select class="select" name="sex"><option value="male" ${p.sex==='male'?'selected':''}>Male</option><option value="female" ${p.sex==='female'?'selected':''}>Female</option><option value="nonbinary" ${p.sex==='nonbinary'?'selected':''}>Nonbinary</option><option value="prefer_not" ${p.sex==='prefer_not'?'selected':''}>Prefer not to say</option></select></label><label>Height — feet<input class="input" name="heightFeet" type="number" inputmode="numeric" min="2" max="8" value="${esc(p.heightFeet)}" required></label><label>Height — inches<input class="input" name="heightInches" type="number" inputmode="numeric" min="0" max="11" value="${esc(p.heightInches)}" required></label><label>Weight unit<select class="select" name="unit"><option value="lb" ${state.settings.unit==='lb'?'selected':''}>Pounds (lb)</option><option value="kg" ${state.settings.unit==='kg'?'selected':''}>Kilograms (kg)</option></select></label><label>Starting weight<input class="input" name="startWeight" type="number" inputmode="decimal" min="1" max="1500" step="0.1" value="${esc(p.startWeight)}" required></label><label>Current weight<input class="input" name="currentWeight" type="number" inputmode="decimal" min="1" max="1500" step="0.1" value="${esc(p.currentWeight||p.startWeight)}" required></label><label>Goal weight<input class="input" name="goalWeight" type="number" inputmode="decimal" min="1" max="1500" step="0.1" value="${esc(p.goalWeight)}" required></label></div></section><section class="onboard-section"><h3>3. Build around your life</h3><div class="form-grid"><label>Training experience<select class="select" name="experience"><option value="beginner" ${p.experience==='beginner'?'selected':''}>Beginner</option><option value="intermediate" ${p.experience==='intermediate'?'selected':''}>Intermediate</option><option value="advanced" ${p.experience==='advanced'?'selected':''}>Advanced</option></select></label><label>Days per week<select class="select" name="trainingDays">${[1,2,3,4,5,6,7].map(n=>`<option value="${n}" ${Number(p.trainingDays)===n?'selected':''}>${n} day${n===1?'':'s'}</option>`).join('')}</select></label><label class="full">Gym / equipment available<select class="select" name="equipment"><option value="crunch" ${p.equipment==='crunch'?'selected':''}>Crunch Fitness</option><option value="full_gym" ${p.equipment==='full_gym'?'selected':''}>Another full gym</option><option value="home" ${p.equipment==='home'?'selected':''}>Home gym / dumbbells</option><option value="bodyweight" ${p.equipment==='bodyweight'?'selected':''}>Bodyweight only</option></select></label></div></section><div class="notice">Your profile stays on this device. RepForge provides general fitness information—not medical advice or a diagnosis.</div><button class="button primary full" type="submit">${firstRun?'Create my profile':'Save profile'}</button></form>`);
  }
  function checkInSheet(){
    openSheet(`<div class="sheet-head"><div><p class="eyebrow">Progress check-in</p><h2 id="sheet-title">Update current weight</h2></div><button class="icon-button" data-sheet-close aria-label="Close">×</button></div><form id="check-in-form" class="form-grid"><label class="full">Current weight (${state.settings.unit})<input class="input" name="weight" type="number" inputmode="decimal" min="1" max="1500" step="0.1" value="${esc(state.profile.currentWeight)}" required autofocus></label><button class="button primary full" type="submit">Save check-in</button></form>`);
  }
  function showExercise(id){const e=getExercise(id);openSheet(`<div class="sheet-head"><div><p class="eyebrow">${esc(e.muscle)}</p><h2 id="sheet-title">${esc(e.name)}</h2></div><button class="icon-button" data-sheet-close aria-label="Close">×</button></div><div class="button-row" style="margin:15px 0"><span class="pill">${esc(e.equipment)}</span><span class="pill">${esc(e.pattern)}</span><span class="pill">${esc(e.tracking.replaceAll('_',' + '))}</span></div><h3>How to perform it</h3><p class="muted">${esc(e.instructions)}</p><h3>Safety cue</h3><p class="muted">${esc(e.caution)}</p>${e.custom?'<div class="notice">This custom exercise is user-created and has not been reviewed for safety or accuracy.</div>':''}<button class="button primary full" data-quick-add="${esc(e.id)}">Start with this exercise</button>`)}
  function customExerciseSheet(){openSheet(`<div class="sheet-head"><h2 id="sheet-title">Add custom exercise</h2><button class="icon-button" data-sheet-close>×</button></div><form id="custom-exercise-form" class="form-grid"><label class="full">Exercise name<input class="input" name="name" required maxlength="80" placeholder="e.g. Landmine belt squat"></label><label>Primary muscle<select class="select" name="muscle">${['Chest','Back','Shoulders','Biceps','Triceps','Quadriceps','Hamstrings','Glutes','Calves','Core','Full Body','Cardio','Mobility','Other'].map(x=>`<option>${x}</option>`).join('')}</select></label><label>Equipment<input class="input" name="equipment" maxlength="60" placeholder="e.g. Landmine"></label><label>Tracking<select class="select" name="tracking"><option value="weight_reps">Weight + reps</option><option value="reps">Reps only</option><option value="duration">Time</option><option value="distance_time">Distance + time</option></select></label><label>Default rest (seconds)<input class="input" name="rest" type="number" min="0" max="900" value="90"></label><label class="full">Instructions and notes<textarea class="textarea" name="instructions" maxlength="800" placeholder="Setup, motion, breathing and form cues"></textarea></label><div class="notice full">Custom exercises are your own content and have not been reviewed for safety or accuracy.</div><button class="button primary full" type="submit">Save custom exercise</button></form>`)}
  function createRoutineSheet(){
    const common=allExercises();
    openSheet(`<div class="sheet-head"><h2 id="sheet-title">Create routine</h2><button class="icon-button" data-sheet-close>×</button></div><form id="routine-form"><label class="tiny">Routine name<input class="input" name="name" required maxlength="70" placeholder="My workout"></label><div class="form-grid"><label>Default sets<input class="input" name="sets" type="number" min="1" max="20" value="3"></label><label>Default reps / seconds<input class="input" name="reps" type="number" min="1" max="9999" value="10"></label><label>Default rest (seconds)<input class="input" name="rest" type="number" min="0" max="900" value="90"></label></div><p class="tiny" style="margin-top:16px">Choose exercises. You can change every set while training.</p><div class="list" style="max-height:48vh;overflow:auto">${common.map(e=>`<label class="exercise-card"><div class="exercise-info"><h3>${esc(e.name)}</h3><p class="meta">${esc(e.muscle)} · ${esc(e.equipment)}</p></div><input type="checkbox" name="exercise" value="${esc(e.id)}" style="width:24px;height:24px"></label>`).join('')}</div><button class="button primary full" style="margin-top:14px">Save routine</button></form>`)}
  function quickPicker(){openSheet(`<div class="sheet-head"><h2 id="sheet-title">Quick workout</h2><button class="icon-button" data-sheet-close>×</button></div><p class="muted">Pick an exercise to begin. Add more during the workout.</p><div class="list">${allExercises().slice(0,40).map(e=>`<button class="exercise-card" data-quick-add="${esc(e.id)}" style="text-align:left;color:inherit"><div class="exercise-info"><h3>${esc(e.name)}</h3><p class="meta">${esc(e.muscle)} · ${esc(e.equipment)}</p></div><span>+</span></button>`).join('')}</div>`)}
  function startQuick(id){const e=getExercise(id);state.activeWorkout={id:uid('workout'),name:'Quick Workout',startedAt:nowISO(),finishedAt:null,notes:'',restUntil:null,items:[{exerciseId:id,rest:e.rest||90,sets:Array.from({length:3},()=>({id:uid('set'),weight:'',reps:10,time:30,distance:'',done:false,rpe:''}))}]};save();closeSheet();openWorkout()}
  function addExerciseSheet(){openSheet(`<div class="sheet-head"><h2 id="sheet-title">Add to workout</h2><button class="icon-button" data-sheet-close>×</button></div><div class="list">${allExercises().map(e=>`<button class="exercise-card" data-add-active="${esc(e.id)}" style="text-align:left;color:inherit"><div class="exercise-info"><h3>${esc(e.name)}</h3><p class="meta">${esc(e.muscle)} · ${esc(e.equipment)}</p></div><span>+</span></button>`).join('')}</div>`)}

  function download(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
  function exportBackup(){state.settings.lastBackup=nowISO();save();download(`repforge-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(state,null,2),'application/json');render();toast('Backup exported')}
  function exportCSV(){const rows=[['Workout','Date','Exercise','Set','Weight','Unit','Reps','Time','Distance','Completed']];state.history.forEach(w=>w.items.forEach(i=>i.sets.forEach((s,n)=>rows.push([w.name,w.finishedAt,getExercise(i.exerciseId).name,n+1,s.weight||'',state.settings.unit,s.reps||'',s.time||'',s.distance||'',s.done?'Yes':'No']))));download('repforge-workouts.csv',rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n'),'text/csv')}

  document.addEventListener('click',e=>{
    const b=e.target.closest('button,[data-go]');if(!b)return;
    if(b.dataset.go)go(b.dataset.go);
    if(b.dataset.view)go(b.dataset.view);
    if(b.dataset.start)startRoutine(b.dataset.start);
    if(b.dataset.detail)showExercise(b.dataset.detail);
    if(b.dataset.muscle){muscle=b.dataset.muscle;render()}
    if(b.hasAttribute('data-sheet-close'))closeSheet();
    if(b.dataset.quickAdd)startQuick(b.dataset.quickAdd);
    if(b.dataset.addActive){const ex=getExercise(b.dataset.addActive);state.activeWorkout.items.push({exerciseId:ex.id,rest:ex.rest||90,sets:Array.from({length:3},()=>({id:uid('set'),weight:'',reps:10,time:30,distance:'',done:false,rpe:''}))});save();closeSheet();renderWorkout()}
    if(b.dataset.complete){const [ii,si]=b.dataset.complete.split(':').map(Number);toggleSet(ii,si)}
    if(b.dataset.addSet!==undefined){const item=state.activeWorkout.items[Number(b.dataset.addSet)],last=item.sets.at(-1)||{};item.sets.push({id:uid('set'),weight:last.weight||'',reps:last.reps||10,time:last.time||30,distance:'',done:false,rpe:''});save();renderWorkout()}
    if(b.dataset.removeEx!==undefined&&confirm('Remove this exercise from the active workout?')){state.activeWorkout.items.splice(Number(b.dataset.removeEx),1);save();renderWorkout()}
    if(b.dataset.rest==='add'){state.activeWorkout.restUntil+=15000;save();renderRest()}
    if(b.dataset.rest==='skip'){state.activeWorkout.restUntil=null;save();renderRest()}
    if(b.dataset.workout==='close')closeWorkout();
    if(b.dataset.workout==='finish')finishWorkout();
    if(b.dataset.workout==='add-exercise')addExerciseSheet();
    if(b.dataset.workout==='discard'&&confirm('Discard this workout? This cannot be undone.')){state.activeWorkout=null;save();closeWorkout()}
    const a=b.dataset.action;
    if(a==='resume')openWorkout(); if(a==='quick')quickPicker(); if(a==='custom-exercise')customExerciseSheet(); if(a==='create-routine')createRoutineSheet();
    if(a==='edit-profile')profileSheet(false); if(a==='check-in')checkInSheet();
    if(a==='clear-search'){search='';render()} if(a==='export')exportBackup(); if(a==='import')$('#import-file').click(); if(a==='csv')exportCSV();
    if(a==='safety-accept'){state.settings.safetyAccepted=true;save();closeSheet();toast('Welcome to RepForge')}
    if(a==='reset'&&confirm('Erase every workout, routine and custom exercise from this device?')){localStorage.removeItem(KEY);state=structuredClone(defaults);render();profileSheet(true);toast('All data erased')}
  });
  document.addEventListener('input',e=>{
    if(e.target.id==='exercise-search'){search=e.target.value;const pos=search.length;render();const input=$('#exercise-search');input?.focus();input?.setSelectionRange(pos,pos)}
    if(e.target.dataset.field!==undefined&&state.activeWorkout){const s=state.activeWorkout.items[Number(e.target.dataset.item)].sets[Number(e.target.dataset.set)];const value=e.target.value.replace(/[^0-9.]/g,'').slice(0,8);e.target.value=value;s[e.target.dataset.field]=value;save()}
  });
  document.addEventListener('change',e=>{
    if(e.target.id==='unit'){state.settings.unit=e.target.value;save();render()}
  });
  document.addEventListener('submit',e=>{
    e.preventDefault();
    if(e.target.id==='profile-form'){const f=new FormData(e.target),start=Number(f.get('startWeight')),current=Number(f.get('currentWeight')),previousCurrent=Number(state.profile.currentWeight),equipment=f.get('equipment');state.settings.unit=f.get('unit');state.settings.safetyAccepted=true;state.profile={...state.profile,completed:true,name:f.get('name').trim(),goal:f.get('goal'),startWeight:start.toFixed(1),currentWeight:current.toFixed(1),goalWeight:Number(f.get('goalWeight')).toFixed(1),age:Number(f.get('age')),sex:f.get('sex'),heightFeet:Number(f.get('heightFeet')),heightInches:Number(f.get('heightInches')),experience:f.get('experience'),trainingDays:Number(f.get('trainingDays')),equipment,gymPreset:equipment==='crunch'?'crunch':'standard'};if(!Array.isArray(state.profile.weightHistory))state.profile.weightHistory=[];if(!previousCurrent||previousCurrent!==current)state.profile.weightHistory.push({date:nowISO(),weight:current});save();closeSheet();render();toast(f.get('firstRun')==='yes'?'Profile created':'Profile updated')}
    if(e.target.id==='check-in-form'){const f=new FormData(e.target),weight=Number(f.get('weight'));state.profile.currentWeight=weight.toFixed(1);if(!Array.isArray(state.profile.weightHistory))state.profile.weightHistory=[];state.profile.weightHistory.push({date:nowISO(),weight});save();closeSheet();render();toast('Weight check-in saved')}
    if(e.target.id==='custom-exercise-form'){const f=new FormData(e.target),name=f.get('name').trim();if(!name)return;state.customExercises.push({id:uid('custom'),name,muscle:f.get('muscle'),equipment:f.get('equipment').trim()||'Custom',tracking:f.get('tracking'),pattern:'Custom',difficulty:'User defined',custom:true,rest:Math.min(900,Math.max(0,Number(f.get('rest'))||90)),instructions:f.get('instructions').trim()||'Follow your planned setup and use a controlled, pain-free range.',caution:'User-created movement. Choose an appropriate load and stop for pain or concerning symptoms.'});save();closeSheet();render();toast('Custom exercise added')}
    if(e.target.id==='routine-form'){const f=new FormData(e.target),ids=f.getAll('exercise');if(!ids.length){toast('Choose at least one exercise');return}const sets=Math.min(20,Math.max(1,Number(f.get('sets'))||3)),reps=Math.min(9999,Math.max(1,Number(f.get('reps'))||10)),rest=Math.min(900,Math.max(0,Number(f.get('rest'))||90));state.customRoutines.push({id:uid('routine'),name:f.get('name').trim(),tag:'Custom routine',items:ids.map(id=>({exerciseId:id,sets,reps,rest}))});save();closeSheet();render();toast('Routine saved')}
  });
  $('#theme-toggle').addEventListener('click',()=>{state.settings.theme=state.settings.theme==='dark'?'light':'dark';save();render()});
  $('#import-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!data||data.version!==1||!Array.isArray(data.history)||!Array.isArray(data.customExercises))throw new Error();if(confirm('Replace the data on this device with this backup?')){state={...structuredClone(defaults),...data,settings:{...defaults.settings,...(data.settings||{})},profile:{...defaults.profile,...(data.profile||{})}};save();render();toast('Backup restored')}}catch{toast('That is not a valid RepForge backup')}e.target.value=''});
  window.addEventListener('storage',()=>{state=load();render();if(state.activeWorkout&&!$('#workout-screen').classList.contains('hidden'))renderWorkout()});
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window._installPrompt=e});
  if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  render();
  if(!state.profile.completed)profileSheet(true);
  else if(!state.settings.safetyAccepted){openSheet(`<div class="sheet-head"><div><p class="eyebrow">Before you train</p><h2 id="sheet-title">Welcome to RepForge</h2></div></div><p class="muted">This app provides general fitness information and workout tracking. It does not diagnose conditions or replace a qualified healthcare or fitness professional.</p><div class="notice">Exercise involves risk. Choose movements and loads appropriate for your ability. Stop for sharp or sudden pain, chest pressure, faintness, severe dizziness, or unusual shortness of breath.</div><button class="button primary full" data-action="safety-accept">I understand</button>`)}
  else if(state.activeWorkout)toast('Workout in progress — tap Resume');
})();
