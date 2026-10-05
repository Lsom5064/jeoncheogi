(function (root) {
  'use strict';
  const normalize = (value) => String(value).normalize('NFKC').toLowerCase().replace(/[\s,，、·;:：()（）\[\]{}<>`'"“”‘’_\-→\/]/g, '');
  const outputNormalize = (value) => String(value).normalize('NFKC').trim().replace(/`/g, '').replace(/\s+/g, ' ').replace(/\s*([,\[\]|])\s*/g, '$1');
  const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const combinations = (groups) => groups.reduce((previous, group) => previous.flatMap((prefix) => group.map((value) => prefix + normalize(value))), ['']);
  const permutations = (groups) => groups.length <= 1 ? [groups] : groups.flatMap((item, index) => permutations(groups.filter((_, i) => i !== index)).map((rest) => [item, ...rest]));
  const acceptedCache = new WeakMap();

  function grade(answer, rule) {
    const value = String(answer ?? '').trim();
    if (!value) return {status:'unanswered', feedback:'미응답'};
    if (!rule) return {status:'review', feedback:'해설과 대조하여 채점해 주세요.'};
    let correct = false;
    if (rule.kind === 'number') {
      const units = (rule.units ?? []).map(escapeRegex).join('|');
      const expression = new RegExp(`^([+-]?\\d+(?:\\.\\d+)?)\\s*(?:${units || '(?!)'})?$`, 'i');
      const match = value.normalize('NFKC').match(expression);
      correct = !!match && Number(match[1]) === rule.value;
    } else if (rule.kind === 'row') {
      let cells=value.normalize('NFKC').trim().split(/[\s,|]+/);
      if (cells.length===rule.cells.length+(rule.headers?.length??0)&&rule.headers?.every((header,index)=>normalize(header)===normalize(cells[index]))) cells=cells.slice(rule.headers.length);
      correct=cells.length===rule.cells.length&&rule.cells.every((expected,index)=>typeof expected==='number'?/^[+-]?\d+(?:\.\d+)?$/.test(cells[index])&&Number(cells[index])===expected:normalize(cells[index])===normalize(expected));
    } else if (rule.kind === 'output') {
      correct = rule.values.some((candidate) => outputNormalize(candidate) === outputNormalize(value));
    } else if (rule.kind === 'term') {
      correct = rule.values.some((candidate) => normalize(candidate) === normalize(value));
    } else if (rule.kind === 'set' || rule.kind === 'sequence') {
      let accepted = acceptedCache.get(rule);
      if (!accepted) {
        const orders = rule.kind === 'set' ? permutations(rule.groups) : [rule.groups];
        accepted = new Set(orders.flatMap(combinations));
        acceptedCache.set(rule, accepted);
      }
      correct = accepted.has(normalize(value));
    } else if (rule.kind === 'rubric') {
      const normalized = normalize(value);
      const hasKeywords = rule.groups.every((group) => group.some((keyword) => normalized.includes(normalize(keyword))));
      const hasNegation = /없|않|아니|not|no\b/i.test(value);
      if (hasKeywords && !hasNegation) return {status:'correct', feedback:'핵심어 충족 · 서술 내용은 해설과 함께 확인하세요.'};
      return {status:'review', feedback:'서술형 검토 필요 · 해설과 대조하여 정답 또는 오답으로 표시하세요.'};
    }
    return correct ? {status:'correct', feedback:'정답'} : {status:'incorrect', feedback:rule.kind === 'output' ? '오답 · 값과 출력 형식을 확인하세요.' : '오답 · 해설과 비교해 보세요.'};
  }

  function summarize(questions, answers, overrides = {}) {
    const grades = questions.map((question) => {
      const result = grade(answers[question.id], question.grading);
      const override = overrides[question.id];
      return {...result, id:question.id, domain:question.domain, status:result.status === 'review' && ['correct','incorrect'].includes(override) ? override : result.status};
    });
    const counts = {correct:0,incorrect:0,unanswered:0,review:0};
    for (const result of grades) counts[result.status]++;
    return {...counts, total:questions.length, score:questions.length ? Math.round(counts.correct / questions.length * 100) : 0, grades};
  }

  function pickExam(bank, mode, random = Math.random) {
    if (mode === 'pdf-variant-1') {
      const questions = bank.filter((question) => question.examSet === mode).sort((a,b)=>a.id-b.id);
      if (questions.length !== 20) throw new Error('PDF 유형 응용 문항 구성을 확인해 주세요.');
      return questions;
    }
    const shuffle = (values) => {
      const copy = [...values];
      for (let index = copy.length - 1; index > 0; index--) {
        const next = Math.floor(random() * (index + 1));
        [copy[index],copy[next]] = [copy[next],copy[index]];
      }
      return copy;
    };
    const counts = mode === 'theory' ? {'DB':2,'네트워크/OS':2,'SW개발':2,'SW설계':2,'보안/신기술':2} : mode === 'coding' ? {'C언어':2,'Java':2,'Python':3,'SQL':3} : {'DB':2,'네트워크/OS':2,'SW개발':2,'SW설계':2,'보안/신기술':2,'C언어':2,'Java':2,'Python':3,'SQL':3};
    const result = [];
    for (const [domain,count] of Object.entries(counts)) {
      const candidates = bank.filter((question) => question.domain === domain);
      if (candidates.length < count) throw new Error(`${domain} 문항이 부족합니다.`);
      result.push(...shuffle(candidates).slice(0,count));
    }
    return shuffle(result);
  }
  root.LessonGrading = {grade,summarize,pickExam};
})(globalThis);
