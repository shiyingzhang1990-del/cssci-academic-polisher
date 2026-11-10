// CSSCI论文表达修改指引 — 基于吕长江教授语言风格标准
// 不自动改写，而是逐句提供详细的修改建议和改写方向

// ============================================================
// 吕长江教授语言风格特征
// ============================================================
// 参考论文：
// - 吕长江、赵宇恒 (2008)，国有企业管理者激励效应研究，《管理世界》
// - 吕长江、郑慧莲等 (2009)，上市公司股权激励制度设计，《管理世界》
// - 吕长江、张海平 (2012)，股权激励计划对股利分配政策的影响，《管理世界》
//
// 核心风格特征：
// 1. 制度背景切入：从中国特定的制度环境、政策背景或企业实践提出问题
// 2. "不是…而是…" 句式：制造理论辨识度，澄清概念区别
// 3. "一方面…另一方面…" 句式：展开双重机制或现实张力
// 4. "进一步看"：推进分析层次，从表层进入深层
// 5. "由此可见"：阶段性归纳，自然收束一段论证
// 6. "基于此/鉴于此"：从理论推导自然引出研究设计
// 7. 理论推导：每段一个中心判断 → 解释逻辑 → 推导假设
// 8. 贡献表述："已有研究主要…→与已有研究不同，本文…" 的对比结构
// 9. 语言克制精确：不用"赋能""驱动""显著提升"等口号化表达
// 10. 结论必须从实证发现中自然推出，回扣研究问题

// ============================================================
// 句式切分
// ============================================================

function splitSentences(text) {
  // Split on Chinese/English sentence-ending punctuation
  return text
    .split(/(?<=[。！？；\.\!\?\;])\s*/)
    .filter(s => s.trim().length > 5);
}

function splitParagraphs(text) {
  return text.split(/\n{2,}/).filter(p => p.trim().length > 0);
}

// ============================================================
// 规则1: 制度背景切入检查
// ============================================================

function checkInstitutionalContext(text) {
  const guidance = [];
  const firstPara = splitParagraphs(text)[0] || '';
  const firstSentences = splitSentences(firstPara).slice(0, 3);
  const openingText = firstSentences.join('');

  // 检查是否以泛化开头
  const genericPatterns = [
    { pattern: /随着[\u4e00-\u9fa5]{2,10}的(?:发展|深入|推进|加快)/, label: '"随着……发展"' },
    { pattern: /^近年[来以]/, label: '"近年来"' },
    { pattern: /^改革开放以来/, label: '"改革开放以来"' },
    { pattern: /^进入[\u4e00-\u9fa5]+时期/, label: '"进入……时期"' },
  ];

  for (const gp of genericPatterns) {
    if (gp.pattern.test(openingText)) {
      guidance.push({
        category: '制度背景切入',
        dimension: '开头方式',
        severity: '重要',
        problem: `论文以${gp.label}开头，属于泛化的时间性开头，缺乏中国特定制度情境的刻画。`,
        suggestion: `改为从中国特定的制度背景切入。例如：
· "在中国经济转型的背景下，……已成为……的重要议题。"
· "如何理解……的经济后果，成为理论界和实务界共同关注的问题。"
· 从国有企业改革、资本市场制度变化、产业政策调整等具体情境中提出研究问题。`,
        rationale: '吕长江教授论文的标准开头方式：先刻画具体的中国制度环境或企业实践背景，再从这一背景中自然引出研究问题，而非泛泛的时间推进。',
        reference: '吕长江、赵宇恒 (2008)，国有企业管理者激励效应研究，《管理世界》',
      });
    }
  }

  // 检查是否有制度关键词
  if (openingText.length > 100) {
    const hasInstitution = /制度|情境|中国|改革|转型|国有企业|民营企业|上市公司|资本市场|治理|政策/.test(openingText);
    if (!hasInstitution) {
      guidance.push({
        category: '制度背景切入',
        dimension: '制度关联',
        severity: '重要',
        problem: '开头段落未出现任何中国制度情境相关的关键词（制度/改革/转型/国有企业/上市公司/资本市场等），论文的制度根基不明确。',
        suggestion: '在开头1-2句中加入中国制度背景的刻画，明确说明本研究问题在中国情境下的特殊性和重要性。',
        rationale: '吕长江教授论文的一个核心特征是：研究问题深深嵌入中国制度环境之中。制度背景不是装饰，而是研究问题的来源。',
        reference: '吕长江、郑慧莲等 (2009)，上市公司股权激励制度设计，《管理世界》',
      });
    }
  }

  return guidance;
}

// ============================================================
// 规则2: 句式表达检查
// ============================================================

function checkSentencePatterns(text) {
  const guidance = [];
  const paragraphs = splitParagraphs(text);

  // 检查是否使用了吕长江式关键句式
  const lyvPatterns = [
    { pattern: /鉴于此|由此可见|进一步看|这意味着/, label: '递进/归纳句式', present: false },
    { pattern: /不是[\u4e00-\u9fa5]+而是/, label: '"不是…而是…"辨识句式', present: false },
    { pattern: /一方面[\u4e00-\u9fa5]+另一方面/, label: '"一方面…另一方面…"张力句式', present: false },
    { pattern: /基于此[，,]本文|鉴于此[，,]本文/, label: '自然引出研究设计', present: false },
    { pattern: /已有研究.*主要|与已有研究不同|本文.*不同于/, label: '贡献对比结构', present: false },
  ];

  for (const lp of lyvPatterns) {
    if (lp.pattern.test(text)) {
      lp.present = true;
    }
  }

  const missingPatterns = lyvPatterns.filter(p => !p.present);
  if (missingPatterns.length >= 3) {
    guidance.push({
      category: '句式表达',
      dimension: '吕长江式句式',
      severity: '建议',
      problem: `论文缺少吕长江教授标志性的学术句式。当前缺失：${missingPatterns.map(p => p.label).join('、')}。`,
      suggestion: `建议在以下位置使用吕长江式句式：
· 需要辨析概念时 → 使用"不是……而是……"句式，提升理论辨识度
· 需要展开双重逻辑时 → 使用"一方面……另一方面……"句式
· 需要推进分析层次时 → 使用"进一步看，……"
· 需要阶段性总结时 → 使用"由此可见，……"
· 引出研究设计时 → 使用"基于此，本文……"或"鉴于此，本文……"
· 阐述贡献时 → 使用"已有研究主要……。与已有研究不同，本文……"`,
      rationale: '这些句式是吕长江教授论文的"语言指纹"，它们不仅是修辞选择，更是论述逻辑的结构性支撑。',
      reference: '吕长江、张海平 (2012)，股权激励计划对股利分配政策的影响，《管理世界》',
    });
  }

  return guidance;
}

// ============================================================
// 规则3: 理论推导检查
// ============================================================

function checkTheoryDerivation(text) {
  const guidance = [];

  // Check for hypothesis sections
  const hasHypothesis = /假设\s*[一二三1-9H]|H\d|假说/.test(text);
  const hasDerivation = /因此.*假设|据此.*提出|综上.*提出|由此.*假设|基于以上|根据.*理论|意味着|表明.*假设/.test(text);
  const hasTheorySection = /理论分析|理论推导|理论框架|理论.*逻辑/.test(text);

  if (hasHypothesis && !hasDerivation) {
    guidance.push({
      category: '理论推导',
      dimension: '假设推导逻辑',
      severity: '重要',
      problem: '论文提出了研究假设，但缺少从理论到假设的推导过程。假设可能只是变量关系的简单陈述，而非从理论逻辑中自然产生的。',
      suggestion: `每条假设之前，应有一个完整的推导链：
1. 提出中心判断（"本文认为，……"）
2. 解释逻辑和原因（为什么这一判断成立？机制是什么？）
3. 说明影响或推论（这一判断意味着什么可检验的实证预期？）
4. 回到研究假设（"基于以上分析，本文提出假设H1：……"）

吕长江式推导示例：
"股权激励可能通过两个渠道影响股利政策。一方面，……另一方面，……因此，股权激励与股利支付之间的关系取决于这两种力量的相对大小。基于上述分析，本文提出假设H1：……"`,
      rationale: '吕长江教授论文中，每一条假设都是从理论推导中"生长"出来的，而非突兀地罗列。假设是推导的终点，不是起点。',
      reference: '吕长江、张海平 (2012)，股权激励计划对股利分配政策的影响，《管理世界》',
    });
  }

  if (!hasTheorySection && text.length > 2000) {
    guidance.push({
      category: '理论推导',
      dimension: '理论分析章节',
      severity: '建议',
      problem: '未检测到独立的理论分析或假设推导章节，论文可能缺少系统的理论框架。',
      suggestion: '建议增加"理论分析与研究假设"章节，每段围绕一个中心判断展开，形成"判断→推理→假设"的递进结构。',
      rationale: '吕长江教授论文的理论分析部分通常占据论文1/4到1/3的篇幅，是整篇论文的逻辑支柱。',
      reference: '吕长江、赵宇恒 (2008)，国有企业管理者激励效应研究，《管理世界》',
    });
  }

  return guidance;
}

// ============================================================
// 规则4: 语言表达检查（口号化、AI痕迹、泛化表达）
// ============================================================

function checkLanguageQuality(text) {
  const guidance = [];

  // 4a. 口号化表达
  const buzzwords = [
    { pattern: /赋能/g, label: '"赋能"', fix: '根据语境改为"增强""提升""改进"或"赋予……能力"', count: 0 },
    { pattern: /助力/g, label: '"助力"', fix: '改为"有助于""促进""推动"', count: 0 },
    { pattern: /驱动/g, label: '"驱动"', fix: '改为"推动""引致""促进"', count: 0 },
    { pattern: /显著提升/g, label: '"显著提升"', fix: '改为"在1%水平上显著为正"或"明显提高"', count: 0 },
    { pattern: /显著增强/g, label: '"显著增强"', fix: '改为"在统计上显著增强"', count: 0 },
    { pattern: /显著降低/g, label: '"显著降低"', fix: '改为"在统计水平上显著为负"', count: 0 },
    { pattern: /具有重要意义/g, label: '"具有重要意义"', fix: '改为具体说明具有什么意义，或改为"具有理论价值""为理解……提供了新的经验证据"', count: 0 },
    { pattern: /具有重要的理论意义和现实意义/g, label: '"具有重要的理论意义和现实意义"', fix: '这是AI高频空泛结尾。改为具体说明理论意义是什么、现实意义是什么，或直接删除', count: 0 },
    { pattern: /深化/g, label: '"深化"', fix: '改为更具体的动词，如"推进""拓展""丰富"', count: 0 },
    { pattern: /优化/g, label: '"优化"', fix: '改为"改进""完善"或更具体的描述', count: 0 },
    { pattern: /积极影响/g, label: '"积极影响"', fix: '改为"正向影响"或"促进作用"（学术表达应中性）', count: 0 },
    { pattern: /消极影响/g, label: '"消极影响"', fix: '改为"负向影响"或"抑制作用"', count: 0 },
    { pattern: /极大地|大幅度/g, label: '"极大地/大幅度"', fix: '学术表达应克制，删除或改为"明显"', count: 0 },
    { pattern: /有效促进|有效提升|有效降低/g, label: '"有效促进/提升/降低"', fix: '"有效"是冗余修饰，实证结果本身已说明效果，删除"有效"', count: 0 },
  ];

  const foundBuzzwords = [];
  for (const bw of buzzwords) {
    const matches = text.match(bw.pattern);
    if (matches) {
      bw.count = matches.length;
      foundBuzzwords.push(bw);
    }
  }

  if (foundBuzzwords.length > 0) {
    const totalCount = foundBuzzwords.reduce((s, b) => s + b.count, 0);
    const detail = foundBuzzwords
      .map(b => `· ${b.label}：出现${b.count}次 → ${b.fix}`)
      .join('\n');

    guidance.push({
      category: '语言表达',
      dimension: '口号化与泛化表达',
      severity: totalCount > 8 ? '重要' : '建议',
      problem: `检测到${totalCount}处口号化或泛化表达：\n${detail}`,
      suggestion: '逐句检查以上词汇，用更精确、克制的学术表达替换。详见上方每项的具体替换建议。',
      rationale: '吕长江教授论文的语言风格是"克制、稳重、准确"。他极少使用"赋能""驱动""显著提升"等口号化词汇，而是使用精确的动词（"发现""表明""显示""证明"），让数据自己说话。',
      reference: '吕长江、郑慧莲等 (2009)，上市公司股权激励制度设计，《管理世界》',
    });
  }

  // 4b. AI痕迹
  const aiTraces = [
    { pattern: /值得注意的是[，,]/g, label: '"值得注意的是"', count: 0 },
    { pattern: /需要指出的是[，,]/g, label: '"需要指出的是"', count: 0 },
    { pattern: /需要说明的是[，,]/g, label: '"需要说明的是"', count: 0 },
    { pattern: /不可否认[，,]/g, label: '"不可否认"', count: 0 },
    { pattern: /毋庸置疑[，,]/g, label: '"毋庸置疑"', count: 0 },
    { pattern: /显而易见[，,]/g, label: '"显而易见"', count: 0 },
    { pattern: /综上所述[，,]我们?可以得出/g, label: '"综上所述，可以得出"', count: 0 },
    { pattern: /提供了理论依据和实证支持/g, label: '"提供了理论依据和实证支持"', count: 0 },
    { pattern: /丰富了相关研究[，,]拓展了研究视角/g, label: '"丰富了相关研究，拓展了研究视角"', count: 0 },
    { pattern: /在这一背景下[，,]/g, label: '"在这一背景下"', count: 0 },
  ];

  const foundTraces = [];
  for (const at of aiTraces) {
    const matches = text.match(at.pattern);
    if (matches) {
      at.count = matches.length;
      foundTraces.push(at);
    }
  }

  if (foundTraces.length > 0) {
    const totalCount = foundTraces.reduce((s, t) => s + t.count, 0);
    const detail = foundTraces
      .map(t => `· ${t.label}：${t.count}处 → 建议删除或替换`)
      .join('\n');

    guidance.push({
      category: '语言表达',
      dimension: 'AI写作痕迹',
      severity: totalCount > 5 ? '重要' : '建议',
      problem: `检测到${totalCount}处AI写作痕迹：\n${detail}`,
      suggestion: '"值得注意的是""需要指出的是"等引导语是AI生成文本的典型特征，CSSCI论文中几乎不使用。直接删除这些引导语，保留后面的内容即可。"综上所述"可改为"由此可见"。',
      rationale: '吕长江教授论文中没有此类AI引导语。他使用"由此可见""进一步看""这意味着"等自然连接，而非机械的"值得注意的是"。',
      reference: '吕长江、张海平 (2012)，股权激励计划对股利分配政策的影响，《管理世界》',
    });
  }

  // 4c. "首先其次再次最后" 机械列举
  const mechList = text.match(/首先[，,][\u4e00-\u9fa5]+其次[，,][\u4e00-\u9fa5]+再次[，,][\u4e00-\u9fa5]+最后[，,]/);
  if (mechList) {
    guidance.push({
      category: '语言表达',
      dimension: '机械列举结构',
      severity: '建议',
      problem: `检测到"首先……其次……再次……最后……"的机械列举结构：\n"${mechList[0].substring(0, 80)}……"`,
      suggestion: '吕长江教授不使用"首先其次再次最后"的列举。建议改为：每段一个中心判断，段与段之间以逻辑递进（而非数字顺序）连接。如第一段讨论X机制，第二段以"进一步看"开头推进到更深层次。',
      rationale: '学术论文的逻辑力量在于论证的层层递进，而非清单式的罗列。"首先其次"暴露了论证深度的不足。',
      reference: '吕长江、赵宇恒 (2008)，国有企业管理者激励效应研究，《管理世界》',
    });
  }

  return guidance;
}

// ============================================================
// 规则5: 研究问题表达检查
// ============================================================

function checkResearchQuestion(text) {
  const guidance = [];

  const hasVariableRelation = /本文.*研究.*对.*的影响/.test(text);
  const hasClearQuestion = /研究问题|本文试图|本文旨在|本文.*回答|本文.*考察|本文.*探讨|为什么|如何.*影响|何以/.test(text);

  if (hasVariableRelation && !hasClearQuestion) {
    guidance.push({
      category: '问题意识',
      dimension: '研究问题表达',
      severity: '重要',
      problem: '论文以"本文研究A对B的影响"的方式陈述研究内容，这是变量关系陈述而非研究问题。',
      suggestion: `改为问题式表达。例如：
· "本文试图回答：A如何影响B？这一关系在中国的制度情境中呈现怎样的特征？"
· "本文旨在考察：在……条件下，A对B的影响是否通过C机制传导？"

或者，以"本文试图回答以下问题："引出2-3个层层递进的研究问题。`,
      rationale: '吕长江教授论文的研究问题总是以"问题"而非"变量关系"的形式出现。好的研究问题应当揭示"为什么""如何""在什么条件下"，而非仅仅声明"研究X对Y的影响"。',
      reference: '吕长江、郑慧莲等 (2009)，上市公司股权激励制度设计，《管理世界》',
    });
  }

  return guidance;
}

// ============================================================
// 规则6: 贡献表述检查
// ============================================================

function checkContributionExpression(text) {
  const guidance = [];

  const hasGenericContrib = /丰富了.*研究|拓展了.*视角|提供了.*启示|具有.*理论.*意义/.test(text);
  const hasSpecificContrib = /已有.*研究.*主要|本文.*拓展|本文.*推进|本文.*修正|不同于.*已有|与.*已有.*不同|本文.*特点.*在于/.test(text);

  if (hasGenericContrib && !hasSpecificContrib) {
    guidance.push({
      category: '贡献表述',
      dimension: '贡献的具体化与对比',
      severity: '重要',
      problem: '贡献表述使用了"丰富了研究""拓展了视角"等空泛措辞，缺少与已有文献的具体对话。',
      suggestion: `改为吕长江式的对比结构：
· "已有研究主要从X角度考察了……，但忽略了Y。与已有研究不同，本文从Y角度推进，发现……"
· "本文的特点在于：第一，……；第二，……；第三，……"

每条贡献都应包含三个要素：
1. 已有研究做了什么（点到具体文献或具体观点）
2. 已有研究忽略了什么（具体gap）
3. 本文如何弥补（具体推进了什么理论链或经验证据）`,
      rationale: '吕长江教授论文的贡献部分从不笼统地说"丰富了研究"。每一条贡献都点名已有研究的不足，并具体说明本文的推进。这是CSSCI高水平论文与普通论文在贡献表述上的核心区别。',
      reference: '吕长江、张海平 (2012)，股权激励计划对股利分配政策的影响，《管理世界》',
    });
  }

  return guidance;
}

// ============================================================
// 规则7: 结论回扣检查
// ============================================================

function checkConclusionCoherence(text) {
  const guidance = [];

  const hasConclusion = /结论|启示|政策.*建议/.test(text);
  const hasQuestionHook = /回.*研究|研究.*问题|本文.*试图|本文.*回答|研究.*发现.*回应|回应.*研究/.test(text);

  if (hasConclusion && !hasQuestionHook) {
    guidance.push({
      category: '结论回扣',
      dimension: '结论与研究问题的呼应',
      severity: '建议',
      problem: '结论部分缺少对研究问题的回扣，未能形成"问题→发现→启示"的闭环。',
      suggestion: '结论第一段应明确回扣研究问题："本文的研究发现回应了最初提出的研究问题。首先，……其次，……"。政策启示应从实证发现中自然推出，而非脱离发现的空泛建议。',
      rationale: '吕长江教授论文的结论总是从实证发现中推导出来，不写"应完善法律法规"之类的万能政策建议。每一条启示都有对应的实证发现作为支撑。',
      reference: '吕长江、赵宇恒 (2008)，国有企业管理者激励效应研究，《管理世界》',
    });
  }

  // Check for empty policy recommendations
  if (/应进一步完善相关法律法规|应加强政策引导/.test(text)) {
    guidance.push({
      category: '结论回扣',
      dimension: '政策建议的空泛化',
      severity: '建议',
      problem: '政策建议中包含"完善法律法规""加强政策引导"等万能建议，这些建议与具体研究发现脱节。',
      suggestion: '每条政策建议必须有对应的实证发现作为依据。例如：如果发现"股权激励降低了股利支付率"，则政策启示应为"监管部门在审批股权激励方案时，应关注其可能对股利政策产生的影响"，而非泛泛的"完善制度"。',
      rationale: '吕长江教授论文的政策启示总是具体、可操作、且直接来自实证发现，避免了空洞的政策喊话。',
      reference: '吕长江、张海平 (2012)，股权激励计划对股利分配政策的影响，《管理世界》',
    });
  }

  return guidance;
}

// ============================================================
// 规则8: 逐句检查
// ============================================================

function checkSentenceBySentence(text) {
  const paragraphs = splitParagraphs(text);
  const sentenceIssues = [];

  const buzzwordPatterns = [
    { pattern: /赋能/, label: '口号化', suggestion: '改为"增强""提升""改进"或赋予更具体的含义' },
    { pattern: /助力/, label: '口语化', suggestion: '改为"有助于""促进"' },
    { pattern: /驱动/, label: '口号化', suggestion: '改为"推动""引致""促进"' },
    { pattern: /显著提升/, label: '泛化表达', suggestion: '改为"在1%水平上显著为正"或更精确的统计描述' },
    { pattern: /具有重要意义/, label: '空泛评价', suggestion: '改为具体说明有什么意义' },
    { pattern: /值得注意的是/, label: 'AI痕迹', suggestion: '删除此引导语，直接保留后文' },
    { pattern: /需要指出的是/, label: 'AI痕迹', suggestion: '删除此引导语' },
    { pattern: /需要说明的是/, label: 'AI痕迹', suggestion: '删除此引导语' },
    { pattern: /综上所述.*可以得出/, label: 'AI痕迹', suggestion: '改为"由此可见"' },
    { pattern: /极大地|大幅度/, label: '夸张修饰', suggestion: '删除或改为"明显"' },
    { pattern: /有效促进|有效提升/, label: '冗余修饰', suggestion: '删除"有效"，仅保留动词' },
    { pattern: /积极影响/, label: '价值判断', suggestion: '改为"正向影响"' },
    { pattern: /消极影响/, label: '价值判断', suggestion: '改为"负向影响"' },
    { pattern: /推动了.*发展/, label: '泛化表达', suggestion: '具体说明推动了什么、以什么方式推动' },
    { pattern: /提供了理论依据/, label: 'AI空泛', suggestion: '改为具体说明提供了什么理论依据' },
    { pattern: /丰富了相关研究/, label: 'AI贡献', suggestion: '改为"已有研究主要……本文从……推进"' },
  ];

  for (const para of paragraphs) {
    const sentences = splitSentences(para);
    for (const sentence of sentences) {
      const issues = [];
      for (const bp of buzzwordPatterns) {
        if (bp.pattern.test(sentence)) {
          issues.push({
            label: bp.label,
            suggestion: bp.suggestion,
          });
        }
      }
      if (issues.length > 0) {
        sentenceIssues.push({
          sentence: sentence.trim().substring(0, 200),
          issues,
        });
      }
    }
  }

  return sentenceIssues;
}

// ============================================================
// 主入口
// ============================================================

export function rewritePaper(text, section = '整篇论文') {
  const allGuidance = [];

  // 逐句检查
  const sentenceIssues = checkSentenceBySentence(text);

  // 制度背景
  allGuidance.push(...checkInstitutionalContext(text));

  // 句式表达
  allGuidance.push(...checkSentencePatterns(text));

  // 研究问题
  allGuidance.push(...checkResearchQuestion(text));

  // 理论推导
  allGuidance.push(...checkTheoryDerivation(text));

  // 语言表达（口号化、AI痕迹）
  allGuidance.push(...checkLanguageQuality(text));

  // 贡献表述
  allGuidance.push(...checkContributionExpression(text));

  // 结论回扣
  allGuidance.push(...checkConclusionCoherence(text));

  // 统计
  const importantCount = allGuidance.filter(g => g.severity === '重要').length;
  const suggestionCount = allGuidance.filter(g => g.severity === '建议').length;

  return {
    guidance: allGuidance,
    sentenceIssues,
    stats: {
      totalIssues: allGuidance.length,
      importantCount,
      suggestionCount,
      sentenceIssueCount: sentenceIssues.length,
    },
  };
}

export default rewritePaper;
