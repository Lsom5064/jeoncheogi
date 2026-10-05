(function () {
  'use strict';
  const bank=window.LESSON_BANK;
  const byId=new Map(bank.map((question)=>[question.id,question]));
  const grading=window.LessonGrading;
  const icons=window.LESSON_ICONS;
  const $=(selector)=>document.querySelector(selector);
  const $$=(selector)=>[...document.querySelectorAll(selector)];
  const storageKeys={practice:'jcg-practice-v2',exam:'jcg-exam-v2'};
  const statusLabels={correct:'정답',incorrect:'오답',unanswered:'미응답',review:'검토 필요'};
  const escapeHtml=(value)=>String(value).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

  function readStorage(key) {
    try {return JSON.parse(localStorage.getItem(key)??'null');} catch {return null;}
  }
  function saveStorage(key,value) {
    try {localStorage.setItem(key,JSON.stringify(value));}
    catch {$('#storage-status').hidden=false;$('#storage-status').textContent='저장할 수 없는 환경입니다. 새로고침하면 현재 답안이 사라질 수 있습니다.';}
  }
  function safeAnswers(values) {
    const result={};
    for (const question of bank) if (typeof values?.[question.id]==='string') result[question.id]=values[question.id].slice(0,6000);
    return result;
  }
  function safeOverrides(values) {
    const result={};
    for (const question of bank) if (['correct','incorrect'].includes(values?.[question.id])) result[question.id]=values[question.id];
    return result;
  }
  if ($('#practice')) {
  const practiceBank=bank.filter((question)=>$(`#question-${question.id}`));
  const savedPractice=readStorage(storageKeys.practice);
  let practice={answers:safeAnswers(savedPractice?.answers),graded:Array.isArray(savedPractice?.graded)?savedPractice.graded.filter((id)=>byId.has(id)):[],overrides:safeOverrides(savedPractice?.overrides)};
  let exam=null;
  const savedExam=readStorage(storageKeys.exam);
  if (savedExam&&Array.isArray(savedExam.ids)&&savedExam.ids.length>0&&savedExam.ids.length<=60&&new Set(savedExam.ids).size===savedExam.ids.length&&savedExam.ids.every((id)=>byId.has(id))&&Number.isFinite(savedExam.startedAt)&&Number.isFinite(savedExam.deadline)&&savedExam.deadline>savedExam.startedAt&&savedExam.deadline-savedExam.startedAt<=24*60*60*1000) {
    exam={...savedExam,answers:safeAnswers(savedExam.answers),overrides:safeOverrides(savedExam.overrides),submitted:savedExam.submitted===true};
  }

  function resultFor(question,state) {
    const result=grading.grade(state.answers[question.id],question.grading);
    if (result.status==='review'&&['correct','incorrect'].includes(state.overrides[question.id])) return {...result,status:state.overrides[question.id],feedback:`${statusLabels[state.overrides[question.id]]} · 직접 확인`};
    return result;
  }
  function renderPracticeFeedback(question) {
    const form=$(`.question-form[data-id="${question.id}"]`);
    const feedback=$(`#feedback-${question.id}`);
    const result=practice.graded.includes(question.id)?resultFor(question,practice):null;
    feedback.textContent=result?.feedback??(practice.answers[question.id]?.trim()?'미채점':'');
    feedback.className=`grade-feedback ${result?.status??''}`;
    form.querySelector('.self-grade').hidden=result?.status!=='review';
    form.closest('.question').dataset.status=result?.status??'ungraded';
  }
  function applyPracticeFilter() {
    const domainFilter=$('#practice-domain');
    const wrongFilter=$('#practice-wrong');
    if (!domainFilter||!wrongFilter) {
      for (const question of practiceBank) $(`#question-${question.id}`).hidden=false;
      return;
    }
    const domain=domainFilter.value;
    const wrongOnly=wrongFilter.checked;
    let visible=0;
    for (const question of practiceBank) {
      const article=$(`#question-${question.id}`);
      const matches=(domain==='all'||domain===question.domain)&&(!wrongOnly||!practice.graded.includes(question.id)||resultFor(question,practice).status!=='correct');
      article.hidden=!matches;
      if (matches) visible++;
    }
    $('#practice-visible-count').textContent=`${visible}문항`;
    $('#practice-empty').hidden=visible!==0;
  }
  function renderPracticeSummary() {
    const subset=practiceBank.filter((question)=>practice.graded.includes(question.id));
    const summary=grading.summarize(subset,practice.answers,practice.overrides);
    const answered=practiceBank.filter((question)=>practice.answers[question.id]?.trim()).length;
    $('#practice-summary').innerHTML=`<span>입력 <b>${answered}/${practiceBank.length}</b></span><span>채점 <b>${subset.length}</b></span><span class="correct">정답 <b>${summary.correct}</b></span><span class="incorrect">오답 <b>${summary.incorrect}</b></span><span>미응답 <b>${summary.unanswered}</b></span><span class="review">검토 <b>${summary.review}</b></span>`;
    applyPracticeFilter();
  }
  function gradePractice(id) {
    if (!practice.graded.includes(id)) practice.graded.push(id);
    renderPracticeFeedback(byId.get(id));
    renderPracticeSummary();
    saveStorage(storageKeys.practice,practice);
    return resultFor(byId.get(id),practice);
  }
  for (const form of $$('.question-form')) {
    const id=Number(form.dataset.id);
    const input=form.elements.answer;
    input.value=practice.answers[id]??'';
    input.maxLength=6000;
    input.addEventListener('input',()=>{
      practice.answers[id]=input.value;
      practice.graded=practice.graded.filter((previous)=>previous!==id);
      delete practice.overrides[id];
      renderPracticeFeedback(byId.get(id));
      renderPracticeSummary();
      saveStorage(storageKeys.practice,practice);
    });
    form.addEventListener('submit',(event)=>{event.preventDefault();gradePractice(id);});
    for (const button of form.querySelectorAll('[data-self-grade]')) button.addEventListener('click',()=>{
      if (grading.grade(practice.answers[id],byId.get(id).grading).status!=='review') return;
      practice.overrides[id]=button.dataset.selfGrade;
      gradePractice(id);
    });
    renderPracticeFeedback(byId.get(id));
  }
  $('#grade-all')?.addEventListener('click',()=>{
    practice.graded=practiceBank.map((question)=>question.id);
    for (const question of practiceBank) renderPracticeFeedback(question);
    renderPracticeSummary();
    saveStorage(storageKeys.practice,practice);
  });
  $('#practice-domain')?.addEventListener('change',applyPracticeFilter);
  $('#practice-wrong')?.addEventListener('change',applyPracticeFilter);
  $('#practice-reset')?.addEventListener('click',()=>{
    if (!window.confirm('연습문제의 답안과 채점 기록을 초기화할까요?')) return;
    practice={answers:{},graded:[],overrides:{}};
    for (const question of practiceBank) {$(`#answer-${question.id}`).value='';renderPracticeFeedback(question);}
    renderPracticeSummary();
    saveStorage(storageKeys.practice,practice);
  });
  function revealLinkedQuestion() {
    const match=location.hash.match(/^#question-(\d+)$/);
    if (!match||!byId.has(Number(match[1]))) return;
    const article=$(location.hash);
    if (article.hidden) {
      $('#practice-domain').value='all';
      $('#practice-wrong').checked=false;
      applyPracticeFilter();
      requestAnimationFrame(()=>article.scrollIntoView());
    }
  }
  window.addEventListener('hashchange',revealLinkedQuestion);
  renderPracticeSummary();
  revealLinkedQuestion();
  }

  if ($('#mock')) {
  let timer=null;
  function renderExamSource() {
    const selected=window.LESSON_EXAMS.find((item)=>item.id===(exam?.mode??$('#exam-mode').value));
    $('#exam-source-note').hidden=!selected;
    $('#exam-source-note').innerHTML=selected?`<a href="${escapeHtml(selected.source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(selected.source.title)}</a> · ${escapeHtml(selected.source.note)}`:'';
  }
  function examQuestions() {return exam?exam.ids.map((id)=>byId.get(id)):[];}
  function updateExamProgress() {
    if (!exam) return;
    const answered=exam.ids.filter((id)=>exam.answers[id]?.trim()).length;
    $('#exam-progress').textContent=`${answered}/${exam.ids.length}문항 입력`;
    for (const link of $$('#exam-navigation a')) link.classList.toggle('filled',!!exam.answers[Number(link.dataset.id)]?.trim());
  }
  function updateClock() {
    if (!exam||exam.submitted) return;
    const remaining=Math.max(0,Math.ceil((exam.deadline-Date.now())/1000));
    $('#exam-time').textContent=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
    $('#exam-time').classList.toggle('running-low',remaining<=60);
    if (remaining===0) finishExam('시간 종료');
  }
  function renderExamResult() {
    const summary=grading.summarize(examQuestions(),exam.answers,exam.overrides);
    const rows=window.LESSON_DOMAINS.map((domain)=>{
      const subset=examQuestions().filter((question)=>question.domain===domain);
      if (!subset.length) return '';
      const part=grading.summarize(subset,exam.answers,exam.overrides);
      return `<tr><th scope="row">${escapeHtml(domain)}</th><td>${part.correct}/${part.total}</td><td>${part.incorrect}</td><td>${part.unanswered}</td><td>${part.review}</td></tr>`;
    }).join('');
    $('#exam-result').innerHTML=`<div class="exam-result-heading"><strong>${summary.score}<span> / 100</span></strong><div><b>${summary.review?'검토 중인 임시 점수':'채점 완료'}</b><p>정답 ${summary.correct} · 오답 ${summary.incorrect} · 미응답 ${summary.unanswered} · 검토 ${summary.review}</p><small>${escapeHtml(exam.reason??'제출 완료')} · 각 문항 동일 배점</small></div></div><div class="table-scroll"><table><thead><tr><th>분야</th><th>정답</th><th>오답</th><th>미응답</th><th>검토</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    $('#exam-result').hidden=false;
    $('#exam-retry').disabled=summary.correct===summary.total;
    return summary;
  }
  function renderExam() {
    if (timer) {clearInterval(timer);timer=null;}
    renderExamSource();
    $('#exam-setup').hidden=!!exam;
    $('#exam-status').hidden=!exam;
    $('#exam-status').classList.toggle('complete',exam?.submitted===true);
    $('#exam-complete-actions').hidden=!exam?.submitted;
    $('#exam-result').hidden=!exam?.submitted;
    $('#exam-questions').innerHTML='';
    $('#exam-navigation').innerHTML='';
    if (!exam) return;
    const setTitle=window.LESSON_EXAMS.find((item)=>item.id===exam.mode)?.title;
    $('#exam-title').textContent=`${setTitle??(exam.mode==='retry'?'오답 재시험':exam.mode==='theory'?'이론 모의고사':exam.mode==='coding'?'코딩·SQL 모의고사':'종합 모의고사')} · ${exam.ids.length}문항`;
    $('#exam-submit').hidden=exam.submitted;
    $('#exam-time').textContent=exam.submitted?'제출 완료':'';
    $('#exam-time').classList.remove('running-low');
    $('#exam-navigation').innerHTML=exam.ids.map((id,index)=>`<a href="#exam-question-${id}" data-id="${id}" aria-label="${index+1}번 문항">${index+1}</a>`).join('');
    $('#exam-questions').innerHTML=examQuestions().map((question,index)=>{
      const result=exam.submitted?resultFor(question,exam):null;
      return `<article class="exam-question" id="exam-question-${question.id}"><div class="question-heading"><span class="question-number">${String(index+1).padStart(2,'0')}</span><div><span class="subject-label">${escapeHtml(question.domain)}</span><h3>${escapeHtml(question.title)}</h3></div></div><div class="prose">${question.bodyHtml}</div><label class="exam-answer-label" for="exam-answer-${question.id}">내 답안</label><textarea id="exam-answer-${question.id}" data-id="${question.id}" rows="2" maxlength="6000" autocomplete="off" spellcheck="false" ${exam.submitted?'readonly':''}></textarea>${result?`<p class="grade-feedback ${result.status}">${escapeHtml(result.feedback)}</p>${result.status==='review'?`<div class="self-grade"><button type="button" class="text-button" data-exam-grade="correct" data-id="${question.id}">${icons.yes}정답으로 표시</button><button type="button" class="text-button" data-exam-grade="incorrect" data-id="${question.id}">${icons.no}오답으로 표시</button></div>`:''}<details class="answer" ${result.status==='correct'?'':'open'}><summary>${icons.check}<span>정답과 해설</span>${icons.chevron}</summary><div class="answer-content prose">${question.answerHtml}</div></details>`:''}</article>`;
    }).join('');
    for (const input of $$('#exam-questions textarea')) {
      const id=Number(input.dataset.id);
      input.value=exam.answers[id]??'';
      input.addEventListener('input',()=>{
        if (!exam||exam.submitted) return;
        if (Date.now()>=exam.deadline) {finishExam('시간 종료');return;}
        exam.answers[id]=input.value;
        updateExamProgress();
        saveStorage(storageKeys.exam,exam);
      });
    }
    for (const button of $$('[data-exam-grade]')) button.addEventListener('click',()=>{
      const id=Number(button.dataset.id);
      if (!exam?.submitted||grading.grade(exam.answers[id],byId.get(id).grading).status!=='review') return;
      exam.overrides[id]=button.dataset.examGrade;
      saveStorage(storageKeys.exam,exam);
      renderExam();
    });
    updateExamProgress();
    if (exam.submitted) renderExamResult();
    else {updateClock();if (!exam.submitted) timer=setInterval(updateClock,1000);}
  }
  function startExam(ids,mode,minutes) {
    if (exam&&!exam.submitted) return;
    const now=Date.now();
    exam={ids,mode,answers:{},overrides:{},startedAt:now,deadline:now+minutes*60*1000,submitted:false};
    saveStorage(storageKeys.exam,exam);
    renderExam();
    $('#exam-status').scrollIntoView({block:'start'});
    $('#exam-questions textarea')?.focus({preventScroll:true});
  }
  function finishExam(reason='제출 완료') {
    if (!exam||exam.submitted) return;
    exam.submitted=true;
    exam.submittedAt=Date.now();
    exam.reason=reason;
    saveStorage(storageKeys.exam,exam);
    renderExam();
    $('#exam-result').scrollIntoView({block:'start'});
  }
  $('#exam-start').addEventListener('click',()=>{
    const mode=$('#exam-mode').value;
    startExam(grading.pickExam(bank,mode).map((question)=>question.id),mode,Number($('#exam-minutes').value));
  });
  $('#exam-mode').addEventListener('change',renderExamSource);
  $('#exam-submit').addEventListener('click',()=>finishExam());
  $('#exam-new').addEventListener('click',()=>{exam=null;saveStorage(storageKeys.exam,null);renderExam();$('#exam-mode').focus();});
  $('#exam-retry').addEventListener('click',()=>{
    if (!exam?.submitted) return;
    const ids=examQuestions().filter((question)=>resultFor(question,exam).status!=='correct').map((question)=>question.id);
    if (ids.length) startExam(ids,'retry',15);
  });
  document.addEventListener('visibilitychange',()=>{if (!document.hidden) updateClock();});
  renderExam();

  function selectExamTab(source) {
    $('#tab-course').setAttribute('aria-selected',String(!source));
    $('#tab-source').setAttribute('aria-selected',String(source));
    $('#tab-course').tabIndex=source?-1:0;
    $('#tab-source').tabIndex=source?0:-1;
    $('#course-exam').hidden=source;
    $('#source-exam').hidden=!source;
  }
  $('#tab-course').addEventListener('click',()=>selectExamTab(false));
  $('#tab-source').addEventListener('click',()=>selectExamTab(true));
  for (const button of $$('.mode-tabs [role="tab"]')) button.addEventListener('keydown',(event)=>{
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const source=event.key==='Home'?false:event.key==='End'?true:button.id==='tab-course';
    selectExamTab(source);
    $(source?'#tab-source':'#tab-course').focus();
  });
  function selectedSource() {return window.LESSON_SOURCES.find((source)=>source.id===$('#source-exam-select').value);}
  function updateSource() {
    const source=selectedSource();
    $('#source-exam-link').href=source.url;
    $('#source-exam-note').textContent=source.note;
    $('#source-frame').hidden=true;
    $('#source-frame').removeAttribute('src');
    $('#source-frame-status').textContent='';
  }
  $('#source-exam-select').addEventListener('change',updateSource);
  $('#source-exam-load').addEventListener('click',()=>{
    const source=selectedSource();
    $('#source-frame').title=`정처기 감자 · ${source.title}`;
    $('#source-frame').hidden=false;
    $('#source-frame-status').textContent='원본 페이지 연결 중…';
    $('#source-frame').src=source.url;
  });
  $('#source-frame').addEventListener('load',()=>{
    if ($('#source-frame').hasAttribute('src')) $('#source-frame-status').textContent='정처기 감자 원본 화면 · 표시되지 않으면 새 탭에서 열어 주세요.';
  });
  }
})();
