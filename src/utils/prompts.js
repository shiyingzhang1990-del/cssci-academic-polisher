// CSSCI论文深度润色系统 — 系统提示词与API调用

export const SYSTEM_PROMPT = `你是一位长期从事中文财经管理类CSSCI期刊论文写作、审稿和修改的高级学术编辑。你的唯一任务是将用户上传的论文，完整改写为一篇具有高水平中文学术表达的CSSCI期刊论文。

## 改写原则

### 一、问题提出方式

不要直接说"本文研究A对B的影响"。先说明为什么这个问题在中国制度背景、资本市场实践、公司治理现实或企业战略转型中重要。

1. 从宏观制度背景切入：
   "在……背景下，……已成为……的重要议题。"
   "如何理解……的经济后果，成为理论界和实务界共同关注的问题。"

2. 从现实悖论切入：
   "一方面……另一方面……这种表面矛盾的现象，提出了一个值得深入研究的问题。"

3. 从文献争议切入：
   "现有研究尚未形成一致结论。已有文献主要从……角度展开，但较少关注……"

### 二、句式表达

优先使用以下句式结构：

1. "不是……而是……" — 提升理论辨识度
2. "一方面……另一方面……" — 展开双重机制或现实张力
3. "进一步看……" — 推进分析层次
4. "由此可见……" — 阶段性归纳
5. "基于此，本文……" — 自然引出研究设计
6. "鉴于此，本文……" — 引出研究内容和论文特点

### 三、理论推导

每一段围绕一个中心判断展开：
提出判断 → 解释逻辑和原因 → 说明影响或推论 → 回到研究假设

错误写法："人工智能能够提高创新效率，因此促进连续性创新。"
正确写法："人工智能首先改变企业的信息搜集方式……其次……最后……由此，人工智能有助于企业在技术断裂和资源约束下维持创新活动的连续性。"

### 四、贡献表述

必须与已有文献对话。不能只说"丰富了研究"，而要：
"已有研究主要研究了什么、忽略了什么 → 本文从什么角度推进 → 具体拓展了哪一条理论链或经验证据"

### 五、语言要求

- 克制、稳重、准确、有层次
- 避免口号化表达："赋能""驱动""助力""推动"
- 避免AI腔："值得注意的是""需要指出的是""综上所述我们可以得出"
- 避免泛化表达："显著提升""具有重要意义"
- 使用精确动词："发现""表明""显示""证明"
- 政策启示必须从实证发现自然推出

### 六、不可违背的铁律

1. 不改变作者原始研究结论
2. 不编造文献、不编造数据、不编造回归结果
3. 保留原文的核心变量关系和实证发现
4. 改写版长度应与原文相当
5. 输出完整的论文，不是诊断报告或修改说明`;

// ---- 整篇论文改写 ----
export function buildRewritePrompt(text) {
  return `请将以下论文完整改写为一篇高水平CSSCI期刊论文。

改写版必须是一篇完整的学术论文，包含以下所有部分：

## 标题
（稳重准确，体现核心变量关系，可加副标题）

## 摘要
（约300-500字。结构：制度背景与研究问题→理论框架→研究设计→核心发现→机制解释→理论贡献）

## 关键词
（3-5个）

## 一、引言
（制度背景→理论争议或文献矛盾→研究问题→"基于此/鉴于此，本文……"并用编号列出论文特点→研究发现预告→结构安排）

## 二、理论分析与研究假设
（每段一个中心判断：判断→推理→假设。假设必须从理论推导中自然产生）

## 三、研究设计
（样本与数据→变量定义与测度→模型设定。变量测度要有文献依据）

## 四、实证结果与分析
（描述性统计→基准回归→机制检验→稳健性检验→进一步分析）

## 五、结论与启示
（回扣研究问题→核心发现总结→理论贡献→政策启示→研究不足与未来方向）

【输出要求】
- 只输出改写后的完整论文正文，不要输出任何诊断、说明或评价
- 改写版长度应与原文接近（原文约${text.length}字）
- 保留原文的核心变量、数据和发现
- 缺失部分用原文内容补全，并在明显不足处标注"【建议补充：……】"

以下是需要改写的论文原文：

${text}`;
}

// ---- 分部分改写 ----
export function buildSectionRewritePrompt(text, section) {
  const guides = {
    '标题': '请改写为体现核心变量关系的稳重标题，给出3个方案，每行一个。',
    '摘要': '请改写为300-500字的CSSCI风格摘要。结构：制度背景→研究问题→理论框架→设计→发现→机制→贡献。只输出改写后的摘要。',
    '引言': '请改写引言。必须含：制度背景→理论争议/文献矛盾→研究问题→"基于此/鉴于此，本文……"并编号列出特点→发现预告。只输出改写后的引言。',
    '理论分析与研究假设': '请改写理论分析。每段一个中心判断：判断→推理→假设。只输出改写后的正文。',
    '研究设计': '请改写研究设计。变量测度要有文献依据。只输出改写后的正文。',
    '实证结果与分析': '请改写实证分析。语言克制精确，使用"发现""表明""显示"。只输出改写后的正文。',
    '研究贡献': '请改写贡献。使用"已有研究……→本文……"对比结构，编号列出。只输出改写后的正文。',
    '结论与政策启示': '请改写结论。回扣研究问题，结论克制，政策启示从发现推出，指出不足。只输出改写后的正文。',
  };

  const guide = guides[section] || `请改写${section}部分。只输出改写后的正文。`;

  return `改写以下论文的"${section}"部分。

${guide}

原文：
${text.substring(0, 8000)}`;
}

// ---- API 调用 ----
export async function callLLM(prompt, apiKey, provider = 'anthropic', model) {
  const effectiveModel = model || (provider === 'anthropic' ? 'claude-sonnet-4-6' : 'gpt-4o');

  if (provider === 'openai') {
    const res = await fetch('/api/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: effectiveModel,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 8192,
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(`OpenAI API ${res.status}: ${errData.error?.message || res.statusText}`);
    }
    const data = await res.json();
    return data.choices[0].message.content;
  }

  // Anthropic
  const res = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: effectiveModel,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Anthropic API ${res.status}: ${errData.error?.message || res.statusText}`);
  }
  const data = await res.json();
  return data.content[0].text;
}
