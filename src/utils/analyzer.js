// Paper analyzer — detects gaps between current paper and 吕长江-style CSSCI papers

const DIMENSIONS = [
  { name: '制度背景切入', key: 'institutionalContext', weight: 10,
    desc: '论文是否从中国制度背景切入，而非泛泛的"随着经济发展"开头' },
  { name: '理论张力构建', key: 'theoryTension', weight: 10,
    desc: '是否构建了对立或互补的理论框架，而非单一理论套用' },
  { name: '研究问题聚焦', key: 'questionFocus', weight: 10,
    desc: '研究问题是否清晰、具体、可检验，而非"本文研究A对B的影响"' },
  { name: '文献批判对话', key: 'criticalDialogue', weight: 10,
    desc: '文献综述是批判式对话还是列举式罗列' },
  { name: '假设推导严密性', key: 'hypothesisLogic', weight: 10,
    desc: '假设是否从理论推导中自然产生，而非变量关系堆砌' },
  { name: '变量测度有据', key: 'variableMeasurement', weight: 8,
    desc: '每个变量测度是否有文献依据' },
  { name: '机制分析深度', key: 'mechanismDepth', weight: 10,
    desc: '是否真正解释了"为什么"，而非仅报告中介效应显著' },
  { name: '贡献表达具体化', key: 'contributionSpecificity', weight: 10,
    desc: '贡献是否使用"已有研究……→本文……"的对比结构' },
  { name: '语言克制精确', key: 'languagePrecision', weight: 8,
    desc: '语言是否克制、精确，有无口号化和AI痕迹' },
  { name: '结论回扣问题', key: 'conclusionCoherence', weight: 6,
    desc: '结论是否回扣研究问题，政策启示是否从发现中推出' },
  { name: '结构完整性', key: 'structureCompleteness', weight: 4,
    desc: '论文各部分是否完整' },
  { name: '实证设计匹配度', key: 'empiricalFit', weight: 4,
    desc: '实证设计是否能回应理论问题' },
];

// AI trace patterns
const AI_PATTERNS = [
  /值得注意的是/g, /需要指出的是/g, /不可否认/g, /毋庸置疑/g, /显而易见/g,
  /在这一背景下/g, /随着.*的.*发展/g, /首先.*其次.*再次.*最后/g,
  /综上所述.*我们.*可以.*得出/g, /极大地.*提升/g, /具有.*重要.*意义/g,
  /提供了.*理论.*依据/g, /丰富了.*相关.*研究/g,
];

// Generic/buzzword patterns (口号化)
const GENERIC_PATTERNS = [
  /显著提升/g, /具有重要意义/g, /赋能/g, /驱动/g, /助力/g, /推动/g,
  /深化/g, /优化/g, /强化/g, /完善/g, /健全/g, /大力/g,
  /积极/g, /有效/g, /明显/g, /大幅/g, /不断/g, /持续/g,
];

// Check for 吕长江-style expressions
const LYV_STYLE_PATTERNS = [
  /鉴于此/g, /由此可见/g, /进一步看/g, /这意味着/g,
  /与已有研究不同/g, /本文的特点在于/g, /本文试图/g,
  /已有研究.*主要/g, /本文发现/g, /本文的研究表明/g,
];

function detectStructure(text) {
  return {
    hasAbstract: /摘要|abstract/i.test(text),
    hasKeywords: /关键词|keywords/i.test(text),
    hasIntroduction: /引言|问题的提出|绪论|introduction/i.test(text),
    hasLiteratureReview: /文献综述|相关研究|文献回顾|理论基础|literature/i.test(text),
    hasTheoryAnalysis: /理论分析|研究假设|理论推导|理论框架/.test(text),
    hasResearchDesign: /研究设计|研究方法|数据.*来源|样本|变量.*定义/.test(text),
    hasEmpiricalResults: /实证.*结果|回归.*结果|结果.*分析|result/i.test(text),
    hasRobustness: /稳健性|robustness|内生性|工具变量|Heckman|PSM/.test(text),
    hasMechanismTest: /机制.*检验|中介.*效应|调节.*效应|路径.*分析/.test(text),
    hasContribution: /理论贡献|边际贡献|研究贡献|理论意义/.test(text),
    hasConclusion: /结论|启示|建议|conclusion/i.test(text),
    hasReferences: /参考文献|references/i.test(text),
  };
}

export function analyzePaper(text) {
  const clean = text.replace(/\s/g, '');
  const structure = detectStructure(text);

  // Count patterns
  let aiTraceCount = 0;
  AI_PATTERNS.forEach(p => { const m = text.match(p); if (m) aiTraceCount += m.length; });

  let genericCount = 0;
  GENERIC_PATTERNS.forEach(p => { const m = text.match(p); if (m) genericCount += m.length; });

  let lyvStyleCount = 0;
  LYV_STYLE_PATTERNS.forEach(p => { const m = text.match(p); if (m) lyvStyleCount += m.length; });

  const citationCount = (text.match(/\[\d+\]|\([A-Z][a-z]+.*?\d{4}\)/g) || []).length;

  // Score each dimension
  const scores = {};

  // 1. 制度背景切入
  const hasInstitutionalContext = /制度|情境|中国特色|国有企业|民营企业|上市公司|资本市场|中国.*经济|转型|改革/.test(text);
  const hasGenericOpening = /随着.*发展|近年来|改革开放以来|进入.*时期/.test(text) && !hasInstitutionalContext;
  let instScore = 5;
  if (hasInstitutionalContext) instScore = 8;
  if (hasGenericOpening) instScore = Math.max(3, instScore - 3);
  if (structure.hasIntroduction) instScore = Math.min(10, instScore + 1);
  scores['制度背景切入'] = instScore;

  // 2. 理论张力构建
  const hasMultipleTheories = (text.match(/理论/g) || []).length >= 3;
  const hasContrast = /一方面.*另一方面|然而.*也|既.*又|不仅.*而且.*但是/.test(text);
  const hasTheoryNames = /资源编排|交易成本|动态能力|资源基础|制度理论|资源依赖|高阶梯队|组织学习|注意力|创业生态|平台生态|委托代理|信号|合法性|利益相关者|嵌入性|社会网络|最优契约|管理权力/.test(text);
  let theoryScore = 4;
  if (hasTheoryNames && hasMultipleTheories) theoryScore = 8;
  else if (hasTheoryNames) theoryScore = 6;
  if (hasContrast) theoryScore = Math.min(10, theoryScore + 1);
  scores['理论张力构建'] = theoryScore;

  // 3. 研究问题聚焦
  const hasClearQuestion = /研究问题|本文试图|本文旨在|本文.*回答|本文.*考察|本文.*探讨|为什么|如何.*影响/.test(text);
  const hasOnlyVariableRelation = /本文.*研究.*对.*的影响/.test(text) && !hasClearQuestion;
  let questionScore = 4;
  if (hasClearQuestion) questionScore = 7;
  if (hasOnlyVariableRelation) questionScore = Math.max(2, questionScore - 3);
  if (structure.hasAbstract && structure.hasIntroduction) questionScore = Math.min(10, questionScore + 1);
  scores['研究问题聚焦'] = questionScore;

  // 4. 文献批判对话
  const hasCriticalLanguage = /不足|缺口|缺乏|尚未|忽略|忽视|未.*充分|有待|鲜有|较少|矛盾|不一致|争议/.test(text);
  const hasListingOnly = (text.match(/\[\d+\]/g) || []).length > 5 && !hasCriticalLanguage;
  let litScore = 5;
  if (hasCriticalLanguage) litScore = 7;
  if (hasListingOnly) litScore = Math.max(3, litScore - 3);
  if (citationCount > 20) litScore = Math.min(10, litScore + 2);
  else if (citationCount > 10) litScore = Math.min(10, litScore + 1);
  scores['文献批判对话'] = litScore;

  // 5. 假设推导严密性
  const hasHypothesis = /假设\s*\d|H\d|H1/.test(text);
  const hasDerivation = /因此.*假设|据此.*提出|综上.*提出|由此.*假设|基于以上|根据.*理论/.test(text);
  let hypScore = 5;
  if (hasHypothesis && hasDerivation) hypScore = 8;
  else if (hasHypothesis) hypScore = 6;
  if (!structure.hasTheoryAnalysis) hypScore = Math.max(3, hypScore - 2);
  scores['假设推导严密性'] = hypScore;

  // 6. 变量测度有据
  const hasVarDef = /变量.*定义|变量.*测度|变量.*衡量|变量.*度量|变量.*测量/.test(text);
  const hasDataSource = /CSMAR|WIND|国泰安|万得|中国.*统计年鉴|数据.*来源|数据.*来自|来源于/.test(text);
  let varScore = 5;
  if (hasVarDef && hasDataSource) varScore = 8;
  else if (hasVarDef) varScore = 7;
  else if (hasDataSource) varScore = 6;
  scores['变量测度有据'] = varScore;

  // 7. 机制分析深度
  const hasMechanism = /机制.*检验|中介.*效应|调节.*效应|路径.*分析|作用.*机制|影响.*机制/.test(text);
  const hasMechTheory = /机制.*理论|理论.*机制|为什么.*通过|机制.*在于/.test(text);
  let mechScore = 4;
  if (hasMechanism && hasMechTheory) mechScore = 8;
  else if (hasMechanism) mechScore = 6;
  scores['机制分析深度'] = mechScore;

  // 8. 贡献表达具体化
  const hasSpecificContribution = /已有.*研究.*主要|本文.*拓展|本文.*推进|本文.*修正|不同于.*已有|与.*已有.*不同/.test(text);
  const hasGenericContribution = /丰富了.*研究|拓展了.*视角|提供了.*启示|具有.*理论.*意义/.test(text);
  let contribScore = 4;
  if (hasSpecificContribution) contribScore = 8;
  if (hasGenericContribution && !hasSpecificContribution) contribScore = 5;
  scores['贡献表达具体化'] = contribScore;

  // 9. 语言克制精确
  let langScore = 7;
  if (aiTraceCount > 10) langScore -= 3;
  else if (aiTraceCount > 5) langScore -= 2;
  else if (aiTraceCount > 2) langScore -= 1;
  if (genericCount > 15) langScore -= 3;
  else if (genericCount > 8) langScore -= 2;
  else if (genericCount > 4) langScore -= 1;
  if (lyvStyleCount >= 3) langScore = Math.min(10, langScore + 1);
  scores['语言克制精确'] = Math.max(0, Math.min(10, langScore));

  // 10. 结论回扣问题
  let conclScore = 5;
  if (structure.hasConclusion) conclScore = 6;
  if (hasClearQuestion && structure.hasConclusion) conclScore = 8;
  scores['结论回扣问题'] = conclScore;

  // 11. 结构完整性
  let structScore = 5;
  const sectionCount = Object.values(structure).filter(Boolean).length;
  if (sectionCount >= 10) structScore = 9;
  else if (sectionCount >= 7) structScore = 7;
  else if (sectionCount >= 5) structScore = 6;
  else structScore = 4;
  scores['结构完整性'] = structScore;

  // 12. 实证设计匹配度
  let empScore = 5;
  if (structure.hasResearchDesign && structure.hasEmpiricalResults) empScore = 7;
  if (structure.hasRobustness) empScore = Math.min(10, empScore + 1);
  if (structure.hasMechanismTest) empScore = Math.min(10, empScore + 1);
  scores['实证设计匹配度'] = empScore;

  // Format to array
  const dimensions = DIMENSIONS.map(d => ({
    name: d.name,
    score: scores[d.name] || 5,
    desc: d.desc,
  }));

  const avgScore = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);

  let overallLevel;
  if (avgScore >= 8) overallLevel = '已达到CSSCI投稿水平，主要需要语言润色';
  else if (avgScore >= 7) overallLevel = '接近CSSCI投稿水平，需在理论张力和语言表达上加强';
  else if (avgScore >= 5) overallLevel = '需要在制度背景切入和理论推导方面做较大修改';
  else overallLevel = '建议从研究问题和理论框架开始系统性重写';

  // Generate specific issues
  const issues = [];
  for (const d of dimensions) {
    if (d.score < 7) {
      const fixMap = {
        '制度背景切入': {
          problem: '开头缺乏中国制度情境的刻画，可能使用泛泛的"随着经济发展"开头',
          suggestion: '从中国特定的制度背景切入（如国有企业改革、资本市场制度变化、产业政策调整等），说明为什么这个问题在中国情境下具有特殊重要性',
        },
        '理论张力构建': {
          problem: '理论框架单一，缺乏对立或互补的理论视角之间的对话',
          suggestion: '构建两个对立或互补的理论框架（如"最优契约论vs管理权力论"），让它们在同一问题上对话，制造理论张力',
        },
        '研究问题聚焦': {
          problem: '研究问题不够聚焦，可能停留在"本文研究A对B的影响"的层面',
          suggestion: '以"本文试图回答……""由此揭示……"的方式提出2-3个层层递进的研究问题',
        },
        '文献批判对话': {
          problem: '文献综述偏列举式，缺乏对已有研究的批判性评估',
          suggestion: '改为"已有研究做了什么→存在什么争议或不足→本文如何弥补"的批判性综述',
        },
        '假设推导严密性': {
          problem: '假设缺乏理论推导过程，可能是变量关系的简单陈述',
          suggestion: '每条假设前加入"提出判断→解释逻辑→推导假设"的完整推导链',
        },
        '变量测度有据': {
          problem: '变量测度缺乏文献依据或数据来源不清晰',
          suggestion: '每个变量测度应引用已有文献的做法，并说明数据来源',
        },
        '机制分析深度': {
          problem: '机制分析可能仅停留在中介效应显著，缺乏理论深度',
          suggestion: '每个机制变量都应有理论来源，解释"为什么通过这一路径"，而非仅报告统计显著',
        },
        '贡献表达具体化': {
          problem: '贡献表述空泛，可能使用"丰富了研究""拓展了视角"等套话',
          suggestion: '改为"已有研究主要……，但……。与已有研究不同，本文……"的对比结构，并编号列出',
        },
        '语言克制精确': {
          problem: aiTraceCount > 3 ? `检测到${aiTraceCount}处AI写作痕迹和${genericCount}处口号化表达` : `检测到${genericCount}处口号化表达`,
          suggestion: '使用"由此可见""进一步看""这意味着""鉴于此"等吕长江式连接语。删除"赋能""驱动""显著提升"等泛化表达。保持克制、准确的学术语气。',
        },
        '结论回扣问题': {
          problem: '结论未能有效回扣研究问题，或政策启示脱离实证发现',
          suggestion: '结论第一段回扣研究问题，政策启示从实证发现中自然推出',
        },
        '结构完整性': {
          problem: `论文结构不完整，当前缺少${Object.entries(structure).filter(([, v]) => !v).map(([k]) => k).join('、')}`,
          suggestion: '补充缺失的论文部分',
        },
        '实证设计匹配度': {
          problem: '实证设计与理论问题的对应关系不够清晰',
          suggestion: '确保每个理论假设都有对应的实证检验，模型设定有理论根据',
        },
      };
      const fix = fixMap[d.name] || { problem: '该维度需要改进', suggestion: '参考吕长江教授论文进行针对性修改' };
      issues.push({ dimension: d.name, score: d.score, ...fix });
    }
  }

  // Checklist
  const checklist = [
    { item: '题目是否准确反映核心变量关系和理论视角', pass: scores['研究问题聚焦'] >= 6 },
    { item: '摘要是否包含：制度背景+研究问题+理论框架+方法+核心发现+机制+贡献', pass: structure.hasAbstract && scores['贡献表达具体化'] >= 6 },
    { item: '引言是否形成：制度背景→理论争议→文献矛盾→研究问题→本文特点（编号列出）', pass: scores['制度背景切入'] >= 6 },
    { item: '理论假设是否从推导中自然产生（非变量堆砌）', pass: scores['假设推导严密性'] >= 6 },
    { item: '变量测度是否有文献依据', pass: scores['变量测度有据'] >= 6 },
    { item: '机制分析是否真正解释"为什么"', pass: scores['机制分析深度'] >= 5 },
    { item: '贡献表述是否使用"已有研究……→本文……"结构', pass: scores['贡献表达具体化'] >= 6 },
    { item: '结论是否回扣研究问题', pass: scores['结论回扣问题'] >= 6 },
    { item: '语言是否克制、精确，无AI痕迹和口号化', pass: scores['语言克制精确'] >= 6 },
    { item: '参考文献格式是否统一、完整', pass: structure.hasReferences },
  ];

  return {
    dimensions,
    avgScore,
    overallLevel,
    issues: issues.slice(0, 7),
    structure,
    aiTraceCount,
    genericCount,
    lyvStyleCount,
    citationCount,
    wordCount: clean.length,
    checklist,
  };
}

export function generateDiagnosisReport(analysis, text) {
  const lines = [];
  lines.push('# 论文诊断报告\n');
  lines.push(`> **综合评分：${analysis.avgScore}/10** · ${analysis.overallLevel}\n`);
  lines.push(`> 字数：约${analysis.wordCount}字 · 参考文献：${analysis.citationCount}处 · AI痕迹：${analysis.aiTraceCount}处 · 口号化表达：${analysis.genericCount}处`);
  lines.push(`> 吕长江式表达：${analysis.lyvStyleCount}处（越多越接近目标风格）\n`);

  lines.push('## 一、12维度诊断\n');
  lines.push('| 维度 | 评分 | 说明 |');
  lines.push('|------|------|------|');
  for (const d of analysis.dimensions) {
    const level = d.score >= 8 ? '优秀' : d.score >= 6 ? '良好' : d.score >= 4 ? '一般' : '待改进';
    lines.push(`| ${d.name} | ${d.score}/10 ${level} | ${d.desc} |`);
  }

  lines.push('\n## 二、需要修改的关键问题\n');
  analysis.issues.forEach((issue, i) => {
    lines.push(`### ${i + 1}. ${issue.dimension}（${issue.score}/10）\n`);
    lines.push(`**问题表现：**${issue.problem}\n`);
    lines.push(`**修改方向：**${issue.suggestion}\n`);
  });

  lines.push('\n## 三、投稿前检查清单\n');
  analysis.checklist.forEach(c => {
    lines.push(`- [${c.pass ? 'x' : ' '}] ${c.item}`);
  });

  lines.push('\n---\n');
  lines.push('> 诊断报告由系统自动生成。AI改写版将按照吕长江教授风格全面重写论文。');

  return lines.join('\n');
}
