import { useState, useRef } from 'react';
import { analyzePaper } from './utils/analyzer';
import { rewritePaper } from './utils/rewriter';

const SECTIONS = [
  '整篇论文', '标题', '摘要', '引言',
  '理论分析与研究假设', '研究设计', '实证结果与分析',
  '研究贡献', '结论与政策启示',
];

export default function App() {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [section, setSection] = useState('整篇论文');
  const [running, setRunning] = useState(false);

  const [guidance, setGuidance] = useState([]);
  const [sentenceIssues, setSentenceIssues] = useState([]);
  const [guidanceStats, setGuidanceStats] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [activeView, setActiveView] = useState('guidance');

  const fileInputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      let content;
      if (ext === 'docx') {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        content = result.value;
      } else if (ext === 'txt' || ext === 'md') {
        content = await file.text();
      } else {
        alert('不支持的文件格式：' + ext);
        return;
      }
      setText(content);
      setFileName(file.name);
    } catch (err) {
      alert('文件解析失败: ' + err.message);
    }
  }

  function clearFile() {
    setText('');
    setFileName('');
    setGuidance([]);
    setSentenceIssues([]);
    setGuidanceStats(null);
    setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function runAnalysis() {
    if (!text.trim() || text.trim().length < 200) {
      alert('请先上传论文或粘贴论文全文（至少200字）');
      return;
    }

    setRunning(true);
    setStatusMsg('正在分析论文表达...');
    setGuidance([]);
    setSentenceIssues([]);
    setGuidanceStats(null);
    setAnalysis(null);

    setTimeout(() => {
      try {
        const result = rewritePaper(text, section);
        setGuidance(result.guidance);
        setSentenceIssues(result.sentenceIssues);
        setGuidanceStats(result.stats);
        setActiveView('guidance');

        const diag = analyzePaper(text);
        setAnalysis(diag);

        setStatusMsg(`分析完成：${result.stats.totalIssues}条修改指引（${result.stats.importantCount}条重要，${result.stats.suggestionCount}条建议）`);
      } catch (err) {
        setStatusMsg(`分析失败：${err.message}`);
        try {
          const diag = analyzePaper(text);
          setAnalysis(diag);
          setActiveView('diagnosis');
        } catch {}
      }
      setRunning(false);
    }, 50);
  }

  function exportGuidanceReport() {
    let md = '# 论文表达修改指引报告\n\n';
    md += `> 共${guidanceStats?.totalIssues || 0}条修改指引（${guidanceStats?.importantCount || 0}条重要，${guidanceStats?.suggestionCount || 0}条建议）\n\n`;
    md += '---\n\n';

    for (let i = 0; i < guidance.length; i++) {
      const g = guidance[i];
      md += `## ${i + 1}. [${g.severity === '重要' ? '重要' : '建议'}] ${g.category} — ${g.dimension}\n\n`;
      md += `**问题：**${g.problem}\n\n`;
      md += `**修改建议：**\n${g.suggestion}\n\n`;
      md += `**吕长江风格依据：**${g.rationale}\n\n`;
      if (g.reference) {
        md += `**参考：**${g.reference}\n\n`;
      }
      md += '---\n\n';
    }

    if (sentenceIssues.length > 0) {
      md += '## 逐句表达问题\n\n';
      for (const si of sentenceIssues) {
        md += `**原文：**${si.sentence}\n`;
        for (const issue of si.issues) {
          md += `- [${issue.label}] ${issue.suggestion}\n`;
        }
        md += '\n';
      }
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'revision-guide.md'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1e3a5f, #0d2137)',
        color: '#fff', margin: '0 -20px', padding: '24px 20px 20px', textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
          CSSCI财经管理论文深度润色系统
        </h1>
        <p style={{ fontSize: '0.85rem', opacity: 0.75, marginTop: 6 }}>
          基于吕长江教授语言风格标准，逐句诊断论文表达问题并提供详细修改指引
        </p>
      </header>

      {/* Style reference bar */}
      <div style={{
        background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8,
        padding: '12px 16px', marginTop: 16, fontSize: '0.8rem', lineHeight: 1.8,
      }}>
        <strong style={{ color: '#92400e' }}>吕长江教授风格标准：</strong>
        制度背景切入 → 理论张力构建 → "基于此/鉴于此"引出研究设计 →
        每段一个中心判断层层递进 → 语言克制精确 → 贡献"已有研究…→本文…"对比结构
        <span style={{ display: 'block', marginTop: 4, color: '#65a30d', fontWeight: 600 }}>
          参考论文：吕长江、赵宇恒(2008)；吕长江、郑慧莲等(2009)；吕长江、张海平(2012)《管理世界》
        </span>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, marginTop: 20,
      }}>
        {/* LEFT */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 20 }}>
            <h3>论文输入</h3>

            <div className="form-row">
              <label>上传文件</label>
              <input type="file" accept=".txt,.md,.docx" onChange={handleFile} ref={fileInputRef} />
              <span className="hint">.txt / .md / .docx</span>
              {fileName && (
                <div className="file-badge">
                  {fileName}（{text.length}字）
                  <button onClick={clearFile} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                </div>
              )}
            </div>

            <div className="form-row">
              <label>或直接粘贴</label>
              <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder="粘贴论文全文..." rows={8} />
              <span className="hint">{text.length} 字</span>
            </div>

            <div className="form-row">
              <label>分析范围</label>
              <select value={section} onChange={e => setSection(e.target.value)}>
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button className="btn btn-accent" onClick={runAnalysis} disabled={running}
              style={{ width: '100%', padding: '14px 0', fontSize: '1.05rem' }}>
              {running ? <><span className="spinner" /> 正在分析...</> : '开始分析'}
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          {statusMsg && (
            <div className={`hl ${statusMsg.includes('失败') ? 'hl-err' : statusMsg.includes('完成') ? 'hl-ok' : 'hl-info'}`}
              style={{ marginBottom: 16 }}>
              {statusMsg}
            </div>
          )}

          {running && (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
              <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>正在逐句分析论文表达...</p>
            </div>
          )}

          {!running && guidance.length > 0 && (
            <>
              <div className="tab-row">
                {[
                  ['guidance', `修改指引（${guidanceStats?.totalIssues || 0}）`],
                  ['sentences', `逐句检查（${sentenceIssues.length}）`],
                  ['diagnosis', '12维度诊断'],
                ].map(([k, l]) => (
                  <button key={k} className={`tab-btn ${activeView === k ? 'active' : ''}`}
                    onClick={() => setActiveView(k)}>{l}</button>
                ))}
                <button className="btn btn-outline btn-sm" onClick={exportGuidanceReport}
                  style={{ marginLeft: 'auto' }}>导出报告</button>
              </div>

              {activeView === 'guidance' && (
                <div>
                  <div style={{ marginBottom: 16, display: 'flex', gap: 16, fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                      重要：{guidanceStats?.importantCount || 0}条
                    </span>
                    <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
                      建议：{guidanceStats?.suggestionCount || 0}条
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      逐句表达问题：{sentenceIssues.length}句
                    </span>
                  </div>

                  {guidance.map((g, i) => (
                    <div key={i} style={{
                      marginBottom: 14, border: '1px solid var(--border)', borderRadius: 8,
                      overflow: 'hidden',
                    }}>
                      {/* Card header */}
                      <div style={{
                        padding: '10px 16px',
                        background: g.severity === '重要' ? '#fef2f2' : '#fffbeb',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                            background: g.severity === '重要' ? 'var(--danger)' : 'var(--warning)',
                            padding: '3px 10px', borderRadius: 4,
                            minWidth: 36, textAlign: 'center',
                          }}>{g.severity}</span>
                          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{g.category}</span>
                          <span style={{
                            fontSize: '0.72rem', color: 'var(--text-muted)',
                            background: '#f1f5f9', padding: '2px 8px', borderRadius: 4,
                          }}>{g.dimension}</span>
                        </div>
                        {g.reference && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', maxWidth: 200, textAlign: 'right' }}>
                            参考：{g.reference}
                          </span>
                        )}
                      </div>

                      {/* Card body */}
                      <div style={{ padding: '14px 16px' }}>
                        {/* Problem */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{
                            fontSize: '0.72rem', fontWeight: 700, color: 'var(--danger)',
                            marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1,
                          }}>问题诊断</div>
                          <div style={{
                            fontSize: '0.84rem', lineHeight: 1.8,
                            whiteSpace: 'pre-wrap',
                            padding: '10px 14px', background: '#fef2f2',
                            borderRadius: 6, borderLeft: '3px solid var(--danger)',
                          }}>{g.problem}</div>
                        </div>

                        {/* Suggestion */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{
                            fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)',
                            marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1,
                          }}>修改建议</div>
                          <div style={{
                            fontSize: '0.84rem', lineHeight: 1.8,
                            whiteSpace: 'pre-wrap',
                            padding: '10px 14px', background: '#f0fdf4',
                            borderRadius: 6, borderLeft: '3px solid var(--success)',
                          }}>{g.suggestion}</div>
                        </div>

                        {/* Rationale */}
                        <div>
                          <div style={{
                            fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)',
                            marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1,
                          }}>风格依据</div>
                          <div style={{
                            fontSize: '0.82rem', lineHeight: 1.7, color: '#475569',
                            padding: '10px 14px', background: '#eff6ff',
                            borderRadius: 6, borderLeft: '3px solid var(--primary)',
                          }}>{g.rationale}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeView === 'sentences' && (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem' }}>
                      逐句表达问题（共{sentenceIssues.length}句存在改进空间）
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      以下句子包含口号化表达、AI痕迹、冗余修饰等问题，逐句列出修改方向
                    </p>
                  </div>

                  {sentenceIssues.length === 0 ? (
                    <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <p>未在句子层面检测到表达问题</p>
                    </div>
                  ) : (
                    sentenceIssues.map((si, i) => (
                      <div key={i} style={{
                        marginBottom: 10, border: '1px solid var(--border)', borderRadius: 8,
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          padding: '10px 14px',
                          background: '#f8fafc',
                          borderBottom: '1px solid var(--border)',
                          fontSize: '0.84rem', lineHeight: 1.7,
                          fontFamily: "'Noto Serif SC', 'Songti SC', serif",
                        }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600, marginRight: 8 }}>#{i + 1}</span>
                          {si.sentence}
                          {si.sentence.length >= 200 ? '…' : ''}
                        </div>
                        <div style={{ padding: '8px 14px' }}>
                          {si.issues.map((issue, j) => (
                            <div key={j} style={{
                              display: 'inline-block',
                              margin: '3px 6px 3px 0',
                              padding: '4px 10px',
                              borderRadius: 4,
                              fontSize: '0.76rem',
                              background: issue.label === 'AI痕迹' || issue.label === 'AI贡献' || issue.label === 'AI空泛' ? '#fee2e2' :
                                           issue.label === '口号化' || issue.label === '泛化表达' || issue.label === '空泛评价' ? '#fef3c7' :
                                           '#f1f5f9',
                              color: issue.label === 'AI痕迹' || issue.label === 'AI贡献' || issue.label === 'AI空泛' ? '#991b1b' :
                                      issue.label === '口号化' || issue.label === '泛化表达' || issue.label === '空泛评价' ? '#92400e' :
                                      '#475569',
                            }}>
                              <span style={{ fontWeight: 700 }}>[{issue.label}]</span>
                              <span style={{ marginLeft: 4 }}>{issue.suggestion}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeView === 'diagnosis' && analysis && (
                <div>
                  <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: analysis.avgScore >= 7 ? '#dcfce7' : analysis.avgScore >= 5 ? '#fef3c7' : '#fde8e8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `3px solid ${analysis.avgScore >= 7 ? '#86efac' : analysis.avgScore >= 5 ? '#fcd34d' : '#fca5a5'}`,
                      }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700,
                          color: analysis.avgScore >= 7 ? '#166534' : analysis.avgScore >= 5 ? '#92400e' : '#991b1b',
                        }}>{analysis.avgScore}</span>
                      </div>
                      <div>
                        <h3 style={{ margin: 0 }}>综合评分：{analysis.avgScore}/10</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{analysis.overallLevel}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          AI痕迹{analysis.aiTraceCount}处 · 口号化{analysis.genericCount}处
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h3>12维度评分</h3>
                    {analysis.dimensions.map(d => (
                      <div key={d.name} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: 2 }}>
                          <span style={{ fontWeight: 600 }}>{d.name}</span>
                          <span style={{ fontWeight: 700,
                            color: d.score >= 8 ? 'var(--success)' : d.score >= 6 ? 'var(--warning)' : 'var(--danger)',
                          }}>{d.score}/10</span>
                        </div>
                        <div style={{ height: 5, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 3, width: (d.score * 10) + '%',
                            background: d.score >= 8 ? 'var(--success)' : d.score >= 6 ? 'var(--accent)' : 'var(--danger)',
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {analysis.issues.length > 0 && (
                    <div className="card">
                      <h3 style={{ color: 'var(--danger)' }}>主要问题</h3>
                      {analysis.issues.slice(0, 5).map((issue, i) => (
                        <div key={i} style={{
                          padding: '10px 14px', marginBottom: 8,
                          borderLeft: '3px solid var(--danger)', background: '#fef2f2',
                          borderRadius: '0 6px 6px 0',
                        }}>
                          <strong>#{i + 1} {issue.dimension}（{issue.score}/10）</strong>
                          <p style={{ fontSize: '0.84rem', marginTop: 4 }}>{issue.problem}</p>
                          <p style={{ fontSize: '0.84rem', color: 'var(--success)' }}>{issue.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {!running && guidance.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>上传论文后，点击"开始分析"</p>
              <p style={{ fontSize: '0.84rem' }}>
                系统将基于吕长江教授的语言风格标准，逐句诊断论文表达问题，提供详细修改指引
              </p>
              <div style={{ marginTop: 24, fontSize: '0.82rem', textAlign: 'left', maxWidth: 500, margin: '24px auto 0', lineHeight: 2.2 }}>
                <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--success)' }}>完全离线运行，无需API Key</p>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>分析维度（吕长江风格标准）：</p>
                <p>1. 制度背景切入 — 是否从中国制度情境提出研究问题</p>
                <p>2. 句式表达 — 是否使用"不是…而是…""基于此"等吕式句式</p>
                <p>3. 研究问题 — 是否以问题式而非变量式提出</p>
                <p>4. 理论推导 — 是否形成"判断→推理→假设"递进链</p>
                <p>5. 语言表达 — 口号化/AI痕迹/泛化表达检测</p>
                <p>6. 贡献表述 — 是否使用"已有研究→本文"对比结构</p>
                <p>7. 结论回扣 — 是否从实证发现推出启示并回扣问题</p>
                <p style={{ fontWeight: 600, marginBottom: 8, marginTop: 16 }}>参考论文：</p>
                <p>· 吕长江、赵宇恒(2008)，《管理世界》</p>
                <p>· 吕长江、郑慧莲等(2009)，《管理世界》</p>
                <p>· 吕长江、张海平(2012)，《管理世界》</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer style={{
        textAlign: 'center', padding: '30px 20px', marginTop: 40,
        borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem',
      }}>
        本系统基于吕长江教授已发表论文的语言风格标准进行规则化诊断，完全离线运行，不改变研究结论，不编造文献和数据。
      </footer>
    </div>
  );
}
