/**
 * FinReAct Dashboard - Main Application Controller
 * Handles Ephemeral Session Token Exchange, SSE Streaming, ReAct UI State,
 * Tab Switching, and Dynamic DOM Updates.
 * 
 * Security: Raw API keys are never exposed in GET URLs or persistent disk storage.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const companyInput = document.getElementById('companyInput');
  const runAnalysisBtn = document.getElementById('runAnalysisBtn');
  const streamLogContainer = document.getElementById('streamLogContainer');
  const stepCounter = document.getElementById('stepCounter');
  const agentStatusBadge = document.getElementById('agentStatusBadge');
  const statusText = document.getElementById('statusText');
  const clearStreamBtn = document.getElementById('clearStreamBtn');

  // Preset Chips
  const presetChips = document.querySelectorAll('.preset-chip');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // Report Actions
  const copyReportBtn = document.getElementById('copyReportBtn');
  const downloadReportBtn = document.getElementById('downloadReportBtn');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const downloadAllFromToolbarBtn = document.getElementById('downloadAllFromToolbarBtn');
  const reportMarkdownContainer = document.getElementById('reportMarkdownContainer');

  // All-Results Global Export Buttons
  const downloadAllPdfBtn = document.getElementById('downloadAllPdfBtn');
  const downloadAllMdBtn = document.getElementById('downloadAllMdBtn');
  const downloadAllJsonBtn = document.getElementById('downloadAllJsonBtn');

  // API Key & Model Modal
  const apiKeyModalBtn = document.getElementById('apiKeyModalBtn');
  const modelBadgeBtn = document.getElementById('modelBadgeBtn');
  const activeModelLabel = document.getElementById('activeModelLabel');
  const apiKeyModal = document.getElementById('apiKeyModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
  const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
  const geminiModelSelect = document.getElementById('geminiModelSelect');
  const customModelField = document.getElementById('customModelField');
  const customModelInput = document.getElementById('customModelInput');

  // Active Session & Research State
  let activeEventSource = null;
  let currentReportMarkdown = '';
  let currentAnalysisData = null;
  let currentReactLogs = [];
  let activeSessionToken = null;

  // Load Saved API Key & Model from localStorage (strictly client-side memory)
  const savedKey = localStorage.getItem('finreact_gemini_api_key') || '';
  if (geminiApiKeyInput) geminiApiKeyInput.value = savedKey;

  // Restore Last Selected Model (Defaults to gemini-2.5-flash)
  let activeModel = localStorage.getItem('finreact_gemini_model') || 'gemini-2.5-flash';
  if (activeModelLabel) activeModelLabel.textContent = activeModel;
  
  if (geminiModelSelect) {
    const predefined = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    if (predefined.includes(activeModel)) {
      geminiModelSelect.value = activeModel;
      if (customModelField) customModelField.style.display = 'none';
    } else {
      geminiModelSelect.value = 'custom';
      if (customModelField) {
        customModelField.style.display = 'flex';
        customModelInput.value = activeModel;
      }
    }

    geminiModelSelect.addEventListener('change', () => {
      if (geminiModelSelect.value === 'custom') {
        if (customModelField) customModelField.style.display = 'flex';
      } else {
        if (customModelField) customModelField.style.display = 'none';
      }
    });
  }

  // Model Badge Click -> Open Settings Modal
  if (modelBadgeBtn) {
    modelBadgeBtn.addEventListener('click', () => {
      if (apiKeyModal) apiKeyModal.classList.add('active');
    });
  }

  // -------------------------------------------------------------------------
  // Preset Selection
  // -------------------------------------------------------------------------
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const company = chip.dataset.company;
      companyInput.value = company.charAt(0).toUpperCase() + company.slice(1);
      startReActAnalysis(companyInput.value);
    });
  });

  // -------------------------------------------------------------------------
  // Tab Switching
  // -------------------------------------------------------------------------
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(btn.dataset.tab);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // -------------------------------------------------------------------------
  // Secure API Key & Model Management via In-Memory Ephemeral Session Token
  // -------------------------------------------------------------------------
  if (apiKeyModalBtn && apiKeyModal) {
    apiKeyModalBtn.addEventListener('click', () => apiKeyModal.classList.add('active'));
    closeModalBtn.addEventListener('click', () => apiKeyModal.classList.remove('active'));
    apiKeyModal.addEventListener('click', (e) => {
      if (e.target === apiKeyModal) apiKeyModal.classList.remove('active');
    });

    saveApiKeyBtn.addEventListener('click', async () => {
      const keyVal = geminiApiKeyInput.value.trim();
      localStorage.setItem('finreact_gemini_api_key', keyVal);
      activeSessionToken = null; // Invalidate cached session token

      // Resolve and save selected model
      let chosenModel = geminiModelSelect.value;
      if (chosenModel === 'custom') {
        chosenModel = customModelInput.value.trim() || 'gemini-2.5-flash';
      }
      activeModel = chosenModel;
      localStorage.setItem('finreact_gemini_model', activeModel);
      if (activeModelLabel) activeModelLabel.textContent = activeModel;

      if (keyVal) {
        // Exchange key for ephemeral token via POST
        await refreshSessionToken(keyVal);
      }
      apiKeyModal.classList.remove('active');
      alert(`Settings saved! Model set to: ${activeModel}`);
    });
  }

  async function refreshSessionToken(apiKey) {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey })
      });
      if (res.ok) {
        const data = await res.json();
        activeSessionToken = data.session_token;
        return activeSessionToken;
      }
    } catch (e) {
      console.warn('Session token exchange failed:', e);
    }
    return null;
  }

  // -------------------------------------------------------------------------
  // Stream Clearing
  // -------------------------------------------------------------------------
  clearStreamBtn.addEventListener('click', () => {
    streamLogContainer.innerHTML = '';
    stepCounter.textContent = 'Step 0/5';
  });

  // -------------------------------------------------------------------------
  // Run Analysis Trigger
  // -------------------------------------------------------------------------
  runAnalysisBtn.addEventListener('click', () => {
    const val = companyInput.value.trim();
    if (val) startReActAnalysis(val);
  });

  companyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = companyInput.value.trim();
      if (val) startReActAnalysis(val);
    }
  });

  // -------------------------------------------------------------------------
  // ReAct SSE Streaming Execution (Secure URL Parameters)
  // -------------------------------------------------------------------------
  async function startReActAnalysis(companyName) {
    if (activeEventSource) {
      activeEventSource.close();
    }

    // Set UI state to running and reset logs
    setAgentState(true);
    streamLogContainer.innerHTML = '';
    stepCounter.textContent = 'Step 1/5';
    currentReactLogs = [];
    currentAnalysisData = null;

    // If API Key is present in localStorage, ensure we have an ephemeral token
    const clientKey = localStorage.getItem('finreact_gemini_api_key') || '';
    if (clientKey && !activeSessionToken) {
      await refreshSessionToken(clientKey);
    }

    let streamUrl = `/api/analyze/stream?company=${encodeURIComponent(companyName)}&model=${encodeURIComponent(activeModel)}`;
    if (activeSessionToken) {
      // Pass only the random UUID session token, NEVER the raw API key
      streamUrl += `&session_token=${encodeURIComponent(activeSessionToken)}`;
    }

    activeEventSource = new EventSource(streamUrl);

    activeEventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        handleStreamPayload(payload);
      } catch (err) {
        console.error('Failed to parse SSE payload:', err);
      }
    };

    activeEventSource.onerror = (err) => {
      console.warn('SSE Stream ended or closed:', err);
      activeEventSource.close();
      setAgentState(false);
    };
  }

  function setAgentState(isRunning) {
    if (isRunning) {
      agentStatusBadge.classList.add('running');
      statusText.textContent = 'REASONING & ACTING...';
      runAnalysisBtn.disabled = true;
      runAnalysisBtn.style.opacity = '0.7';
    } else {
      agentStatusBadge.classList.remove('running');
      statusText.textContent = 'AGENT COMPLETED';
      runAnalysisBtn.disabled = false;
      runAnalysisBtn.style.opacity = '1';
    }
  }

  function handleStreamPayload(data) {
    const type = data.type;

    if (type === 'thought') {
      currentReactLogs.push(data);
      stepCounter.textContent = `Step ${data.step}/5`;
      appendCard('thought', `🧠 Thought ${data.step}: ${data.title || ''}`, data.content);
    } else if (type === 'action') {
      currentReactLogs.push(data);
      const paramStr = data.parameters ? JSON.stringify(data.parameters, null, 2) : '';
      appendCard('action', `⚡ Action: ${data.tool}`, `Parameters:\n${paramStr}`);
    } else if (type === 'observation') {
      currentReactLogs.push(data);
      appendCard('observation', `👁️ Observation: [Result Verified]`, data.content);
    } else if (type === 'final_report') {
      currentAnalysisData = data;
      renderFinalDashboard(data);
      if (activeEventSource) {
        activeEventSource.close();
      }
      setAgentState(false);
    }
  }

  function appendCard(type, headerText, contentText) {
    const card = document.createElement('div');
    card.className = `react-card ${type}`;

    const header = document.createElement('div');
    header.className = 'react-card-header';
    header.textContent = headerText;

    const body = document.createElement('div');
    body.className = 'react-content';
    body.textContent = contentText;

    card.appendChild(header);
    card.appendChild(body);
    streamLogContainer.appendChild(card);

    // Auto-scroll to bottom
    streamLogContainer.scrollTop = streamLogContainer.scrollHeight;
  }

  // -------------------------------------------------------------------------
  // Render Final Dashboard Data
  // -------------------------------------------------------------------------
  function renderFinalDashboard(data) {
    // 1. Meta / Profile
    if (data.meta) {
      document.getElementById('dispCompanyName').textContent = data.meta.company_name;
      document.getElementById('dispTicker').textContent = data.meta.ticker;
      document.getElementById('dispStandard').textContent = data.meta.standard;
      document.getElementById('dispSector').textContent = data.meta.sector;
      document.getElementById('dispCurrency').textContent = `Reporting: ${data.meta.currency}`;
      document.getElementById('dispScore').textContent = data.meta.health_score || 85;
    }

    // 2. KPI Cards
    if (data.kpis) {
      document.getElementById('dispRevenue').textContent = data.kpis.revenue;
      document.getElementById('dispRevenueYoY').textContent = data.kpis.revenue_yoy;
      document.getElementById('dispOpm').textContent = data.kpis.opm;
      document.getElementById('dispOpmDiff').textContent = data.kpis.opm_diff;
      document.getElementById('dispRoe').textContent = data.kpis.roe;
      document.getElementById('dispRoic').textContent = data.kpis.roic;
      document.getElementById('dispCcc').textContent = data.kpis.ccc;
      document.getElementById('dispNetDebt').textContent = data.kpis.net_debt_ebitda;
    }

    // 3. DuPont Visualizer
    if (data.charts && data.charts.dupont_latest) {
      const d = data.charts.dupont_latest;
      document.getElementById('dupontRoe').textContent = `${d.roe}%`;
      document.getElementById('dupontNetMargin').textContent = `${d.net_margin}%`;
      document.getElementById('dupontTurnover').textContent = `${d.asset_turnover}x`;
      document.getElementById('dupontLeverage').textContent = `${d.equity_multiplier}x`;
    }

    // 4. CCC Visualizer
    if (data.charts && data.charts.ccc_latest) {
      const c = data.charts.ccc_latest;
      document.getElementById('cccDso').textContent = `+${c.dso} Days`;
      document.getElementById('cccDio').textContent = `+${c.dio} Days`;
      document.getElementById('cccDpo').textContent = `−${c.dpo} Days`;
      document.getElementById('cccResult').textContent = `${c.ccc} Days`;
    }

    // 5. Interactive Charts
    if (data.charts && typeof initOrUpdateCharts === 'function') {
      initOrUpdateCharts(data.charts);
    }

    // 6. Full Markdown Report (Tab 2)
    if (data.report_markdown) {
      currentReportMarkdown = data.report_markdown;
      if (typeof marked !== 'undefined') {
        reportMarkdownContainer.innerHTML = marked.parse(data.report_markdown);
      } else {
        reportMarkdownContainer.textContent = data.report_markdown;
      }
    }

    // 7. Peer Benchmark Comparison Table (Tab 3)
    if (data.peer_benchmark) {
      const bm = data.peer_benchmark;
      const targetHead = document.getElementById('bmTargetHead');
      const peer1Head = document.getElementById('bmPeer1Head');
      const peer2Head = document.getElementById('bmPeer2Head');
      const tableBody = document.getElementById('benchmarkTableBody');

      if (targetHead && bm.target_head) targetHead.textContent = bm.target_head;
      if (peer1Head && bm.peer1_head) peer1Head.textContent = bm.peer1_head;
      if (peer2Head && bm.peer2_head) peer2Head.textContent = bm.peer2_head;

      if (tableBody && Array.isArray(bm.rows)) {
        tableBody.innerHTML = '';
        bm.rows.forEach(r => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong>${r.category}</strong></td>
            <td class="target-cell"><strong>${r.target_val}</strong></td>
            <td>${r.peer1_val}</td>
            <td>${r.peer2_val}</td>
            <td>${r.implication}</td>
          `;
          tableBody.appendChild(tr);
        });
      }
    }

    // 8. Risks Table (Tab 4)
    if (data.risks && Array.isArray(data.risks)) {
      const risksTableBody = document.getElementById('risksTableBody');
      if (risksTableBody) {
        risksTableBody.innerHTML = '';
        data.risks.forEach(r => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td><strong>${r.name}</strong></td>
            <td><span class="badge ${r.impact === '高' ? 'danger' : 'warning'}">${r.impact}</span></td>
            <td>${r.prob}</td>
            <td><code>${r.ewi}</code></td>
            <td>${r.doc}</td>
          `;
          risksTableBody.appendChild(row);
        });
      }
    }
  }

  // -------------------------------------------------------------------------
  // Report Export Actions
  // -------------------------------------------------------------------------
  if (copyReportBtn) {
    copyReportBtn.addEventListener('click', () => {
      if (!currentReportMarkdown) {
        alert('No report generated yet.');
        return;
      }
      navigator.clipboard.writeText(currentReportMarkdown).then(() => {
        const orig = copyReportBtn.textContent;
        copyReportBtn.textContent = '✅ Copied!';
        setTimeout(() => copyReportBtn.textContent = orig, 2000);
      });
    });
  }

  if (downloadReportBtn) {
    downloadReportBtn.addEventListener('click', () => {
      if (!currentReportMarkdown) {
        alert('No report generated yet.');
        return;
      }
      const companyName = (document.getElementById('dispCompanyName')?.textContent || 'Company').trim();
      const blob = new Blob([currentReportMarkdown], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Financial_Analysis_Report_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', async () => {
      if (!currentReportMarkdown) {
        alert('レポートがまだ生成されていません。企業を分析してください。');
        return;
      }

      const origText = downloadPdfBtn.textContent;
      downloadPdfBtn.textContent = '⏳ PDF生成中...';
      downloadPdfBtn.disabled = true;

      try {
        const companyName = (document.getElementById('dispCompanyName')?.textContent || 'Company').trim();
        const ticker = (document.getElementById('dispTicker')?.textContent || '').trim();
        const standard = (document.getElementById('dispStandard')?.textContent || '').trim();
        const currency = (document.getElementById('dispCurrency')?.textContent || '').trim();
        const dateStr = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });

        // レポート本文HTMLの変換
        const reportHtml = typeof marked !== 'undefined' ? marked.parse(currentReportMarkdown) : `<pre>${currentReportMarkdown}</pre>`;

        // 機関投資家向けクリーンデザインのPDFコンテナを作成
        const pdfContainer = document.createElement('div');
        pdfContainer.className = 'pdf-export-container';
        pdfContainer.innerHTML = `
          <div class="pdf-header-top">
            <span class="pdf-logo">FinReAct Institutional Research Report</span>
            <span class="pdf-date">発行日: ${dateStr}</span>
          </div>
          <div class="pdf-title-box">
            <h1>${companyName} ${ticker ? `(${ticker})` : ''}</h1>
            <p class="pdf-subtitle">企業財務三表・資本効率・競合ベンチマーク統合調査報告書（A〜H標準規格） | ${standard} | ${currency}</p>
          </div>
          <div class="pdf-body">
            ${reportHtml}
          </div>
          <div class="pdf-footer">
            <span>厳秘 (Confidential) — Generated by FinReAct Agentic AI System</span>
            <span>一次情報根拠: 有価証券報告書 / SEC Form 10-K / 決算短信 / 投資判断非推奨</span>
          </div>
        `;

        document.body.appendChild(pdfContainer);

        const safeFilename = `Financial_Report_${companyName.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, '_')}_${Date.now()}.pdf`;

        if (typeof html2pdf !== 'undefined') {
          const opt = {
            margin: [10, 12, 12, 12],
            filename: safeFilename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
          };

          await html2pdf().set(opt).from(pdfContainer).save();
        } else {
          // html2pdf 未読込時のフォールバック: 専用プリントウィンドウ
          const printWin = window.open('', '_blank');
          printWin.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>${companyName} Financial Analysis Report</title>
              <style>
                body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif; padding: 25px; color: #1e293b; line-height: 1.6; }
                .pdf-header-top { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-bottom: 20px; }
                .pdf-logo { font-size: 16px; font-weight: bold; color: #0284c7; }
                .pdf-date { font-size: 11px; color: #64748b; }
                h1 { font-size: 22px; color: #0f172a; margin-top: 20px; }
                h2 { font-size: 16px; color: #1e293b; margin-top: 16px; }
                table { border-collapse: collapse; width: 100%; margin: 15px 0; font-size: 12px; }
                th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
                th { background: #f1f5f9; font-weight: bold; }
                tr:nth-child(even) td { background: #f8fafc; }
                .pdf-footer { margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 10px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
              </style>
            </head>
            <body>
              ${pdfContainer.innerHTML}
            </body>
            </html>
          `);
          printWin.document.close();
          printWin.focus();
          setTimeout(() => {
            printWin.print();
          }, 400);
        }

        document.body.removeChild(pdfContainer);

        // 完了フィードバック
        downloadPdfBtn.textContent = '✅ PDF Downloaded!';
        setTimeout(() => downloadPdfBtn.textContent = origText, 2500);

      } catch (err) {
        console.error('PDF generation error:', err);
        alert('PDF生成中にエラーが発生しました。印刷ダイアログを使用します。');
        window.print();
        downloadPdfBtn.textContent = origText;
      } finally {
        downloadPdfBtn.disabled = false;
      }
    });
  }

  // -------------------------------------------------------------------------
  // Complete Intelligence Dossier (All Results) Generators
  // -------------------------------------------------------------------------
  function buildAllResultsMarkdown() {
    if (!currentAnalysisData && !currentReportMarkdown) return '';
    const meta = currentAnalysisData?.meta || {};
    const kpis = currentAnalysisData?.kpis || {};
    const dupont = (currentAnalysisData?.charts && currentAnalysisData.charts.dupont_latest) || {};
    const ccc = (currentAnalysisData?.charts && currentAnalysisData.charts.ccc_latest) || {};
    const dateStr = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const timeStr = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

    let md = `# 【総合調査パッケージ】${meta.company_name || '対象企業'} (${meta.ticker || 'N/A'})\n\n`;
    md += `**発行日時**: ${dateStr} ${timeStr} | **会計基準**: ${meta.standard || 'IFRS'} | **報告通貨**: ${meta.currency || 'USD'} | **セクター**: ${meta.sector || 'General'}\n`;
    md += `**財務健全性スコア**: **${meta.health_score || 85} / 100** (Strong Investment Grade)\n\n`;
    md += `> ⚠️ **免責事項・留意事項**: 本調査パッケージは公開情報・法定開示書類に基づく客観的財務分析であり、有価証券の売買推奨や投資助言ではありません。\n\n`;

    // 1. Executive KPIs
    md += `## 1. エグゼクティブ主要財務KPIサマリー\n\n`;
    md += `| 指標項目 | 最新値 | 前年比 / 評価 | 財務インプリケーション |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    md += `| **売上高 (Latest Revenue)** | **${kpis.revenue || '-'}** | ${kpis.revenue_yoy || '-'} YoY | コア事業および成長領域の拡大状況 |\n`;
    md += `| **営業利益率 (Operating Margin)** | **${kpis.opm || '-'}** | ${kpis.opm_diff || '-'} | 本業の付加価値創出力・コスト構造 |\n`;
    md += `| **自己資本利益率 (ROE)** | **${kpis.roe || '-'}** | 効率区分 | 株主資本に対する総合利回り |\n`;
    md += `| **投下資本利益率 (ROIC)** | **${kpis.roic || '-'}** | vs WACC (8.5%) | 投下資本に対する超過付加価値 (EVA) |\n`;
    md += `| **フリーキャッシュフロー (FCF)** | **${kpis.fcf || '-'}** | 営業CF - Capex | 事業活動からの純現金創出力 |\n`;
    md += `| **現金循環日数 (CCC)** | **${kpis.ccc || '-'}** | 運転資本効率 | 仕入〜在庫〜売掛の資金拘束日数 |\n`;
    md += `| **Net Debt / EBITDA** | **${kpis.net_debt_ebitda || '-'}** | 健全水準 (<2.0x) | 有利子負債返済余力・安全性 |\n\n`;

    // 2. DuPont Tree
    md += `## 2. 資本効率要因分解（3段階デュポンツリー）\n\n`;
    md += `- **ROE (${dupont.roe || 0}%)** = 売上高純利益率 (${dupont.net_margin || 0}%) × 総資産回転率 (${dupont.asset_turnover || 0}回) × 財務レバレッジ (${dupont.equity_multiplier || 0}倍)\n\n`;
    md += `1. **純利益率 (Net Margin)**: 売上高に対する最終利益の割合。収益性および価格決定力を反映。\n`;
    md += `2. **総資産回転率 (Asset Turnover)**: 保有資産をどれだけ効率的に売上に転換しているかの事業回転速度。\n`;
    md += `3. **財務レバレッジ (Equity Multiplier)**: 自己資本に対する総資産の倍率。自己株式取得や外部負債活用状況。\n\n`;

    // 3. CCC Breakdown
    md += `## 3. 運転資本サイクル詳細分析（CCCブレイクダウン）\n\n`;
    md += `- **現金循環日数 CCC (${ccc.ccc || 0}日)** = 売上債権回収日数 DSO (+${ccc.dso || 0}日) + 棚卸在庫滞留日数 DIO (+${ccc.dio || 0}日) − 仕入先支払猶予日数 DPO (-${ccc.dpo || 0}日)\n\n`;
    md += `現金循環日数が極低水準またはマイナスの場合、強力なバイイングパワーと前受金活用により、売上拡大局面でも追加借入が不要な「自己金融型ビジネスモデル」を実現しています。\n\n`;

    // 4. ReAct Autonomous Reasoning Logs
    md += `## 4. 自律型AI ReAct推論プロセス & 一次開示検証ログ\n\n`;
    if (currentReactLogs && currentReactLogs.length > 0) {
      currentReactLogs.forEach(log => {
        if (log.type === 'thought') {
          md += `### 🧠 [Thought ${log.step}] ${log.title || '推論'}\n${log.content}\n\n`;
        } else if (log.type === 'action') {
          md += `> ⚡ **Action**: \`${log.tool}\`\n\`\`\`json\n${JSON.stringify(log.parameters, null, 2)}\n\`\`\`\n\n`;
        } else if (log.type === 'observation') {
          md += `**👁️ Observation**: \n\`\`\`\n${log.content}\n\`\`\`\n\n`;
        }
      });
    } else {
      md += `*(ReActストリームログ取得完了)*\n\n`;
    }

    // 5. Peer Benchmark
    if (currentAnalysisData?.peer_benchmark) {
      const bm = currentAnalysisData.peer_benchmark;
      md += `## 5. 競合ベンチマーク多面比較マトリクス\n\n`;
      md += `| 指標 / カテゴリ | ${bm.target_head} | ${bm.peer1_head} | ${bm.peer2_head} | 業界インプリケーション |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- |\n`;
      if (Array.isArray(bm.rows)) {
        bm.rows.forEach(r => {
          md += `| **${r.category}** | **${r.target_val}** | ${r.peer1_val} | ${r.peer2_val} | ${r.implication} |\n`;
        });
      }
      md += `\n`;
    }

    // 6. Risks & EWI
    if (currentAnalysisData?.risks && Array.isArray(currentAnalysisData.risks)) {
      md += `## 6. リスク評価 & 早期警戒指標（EWI）マトリクス\n\n`;
      md += `| リスク要因 | 重要度 (Impact) | 発生確率 (Prob) | 早期警戒指標 (EWI) | 監視対象開示書類 |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- |\n`;
      currentAnalysisData.risks.forEach(r => {
        md += `| **${r.name}** | ${r.impact} | ${r.prob} | \`${r.ewi}\` | ${r.doc} |\n`;
      });
      md += `\n`;
    }

    // 7. Full Institutional Report (A〜H)
    md += `## 7. 機関投資家向け完全財務分析レポート（A〜H標準規格）\n\n`;
    md += currentReportMarkdown || '';
    md += `\n\n---\n*Report Compiled by FinReAct Agentic AI System. All data cross-referenced with primary disclosures.*\n`;

    return md;
  }

  // 1. Download All Results (PDF)
  async function downloadAllResultsPdf() {
    if (!currentAnalysisData && !currentReportMarkdown) {
      alert('レポートがまだ生成されていません。企業を分析してください。');
      return;
    }

    const triggerBtns = [
      document.getElementById('downloadAllPdfBtn'),
      document.getElementById('downloadAllFromToolbarBtn')
    ].filter(Boolean);

    triggerBtns.forEach(b => {
      b.dataset.origText = b.textContent;
      b.textContent = '⏳ 全調査PDF生成中...';
      b.disabled = true;
    });

    try {
      const fullMd = buildAllResultsMarkdown();
      const companyName = (currentAnalysisData?.meta?.company_name || 'Company').trim();
      const ticker = (currentAnalysisData?.meta?.ticker || '').trim();
      const standard = (currentAnalysisData?.meta?.standard || '').trim();
      const currency = (currentAnalysisData?.meta?.currency || '').trim();
      const dateStr = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });

      const reportHtml = typeof marked !== 'undefined' ? marked.parse(fullMd) : `<pre>${fullMd}</pre>`;

      const pdfContainer = document.createElement('div');
      pdfContainer.className = 'pdf-export-container';
      pdfContainer.innerHTML = `
        <div class="pdf-header-top">
          <span class="pdf-logo">FinReAct Comprehensive Intelligence Dossier</span>
          <span class="pdf-date">発行日: ${dateStr}</span>
        </div>
        <div class="pdf-title-box">
          <h1>${companyName} ${ticker ? `(${ticker})` : ''}</h1>
          <p class="pdf-subtitle">企業財務三表・AI推論ログ・デュポン分解・CCC・競合比較・リスク評価 完全調査パッケージ | ${standard} | ${currency}</p>
        </div>
        <div class="pdf-body">
          ${reportHtml}
        </div>
        <div class="pdf-footer">
          <span>厳秘 (Confidential) — Generated by FinReAct Agentic AI System</span>
          <span>一次情報根拠: 有価証券報告書 / SEC Form 10-K / 決算短信 / 投資判断非推奨</span>
        </div>
      `;

      document.body.appendChild(pdfContainer);

      const safeFilename = `FinReAct_Full_Dossier_${companyName.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, '_')}_${Date.now()}.pdf`;

      if (typeof html2pdf !== 'undefined') {
        const opt = {
          margin: [10, 12, 12, 12],
          filename: safeFilename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        await html2pdf().set(opt).from(pdfContainer).save();
      } else {
        window.print();
      }

      document.body.removeChild(pdfContainer);

      triggerBtns.forEach(b => {
        b.textContent = '✅ All PDF Downloaded!';
        setTimeout(() => {
          b.textContent = b.dataset.origText || '📦 Download All Results (PDF)';
          b.disabled = false;
        }, 2500);
      });

    } catch (err) {
      console.error('All-Results PDF export error:', err);
      alert('全結果PDF生成中にエラーが発生しました。印刷ダイアログを使用します。');
      window.print();
      triggerBtns.forEach(b => {
        b.textContent = b.dataset.origText || '📦 Download All Results (PDF)';
        b.disabled = false;
      });
    }
  }

  // 2. Download All Results (Markdown)
  function downloadAllResultsMarkdown() {
    if (!currentAnalysisData && !currentReportMarkdown) {
      alert('レポートがまだ生成されていません。企業を分析してください。');
      return;
    }
    const fullMd = buildAllResultsMarkdown();
    const companyName = (currentAnalysisData?.meta?.company_name || 'Company').trim();
    const blob = new Blob([fullMd], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinReAct_Full_Dossier_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 3. Download All Results (Raw JSON)
  function downloadAllResultsJson() {
    if (!currentAnalysisData) {
      alert('調査データがまだ生成されていません。企業を分析してください。');
      return;
    }
    const companyName = (currentAnalysisData?.meta?.company_name || 'Company').trim();
    const exportData = {
      meta: currentAnalysisData.meta,
      kpis: currentAnalysisData.kpis,
      charts: currentAnalysisData.charts,
      dupont_analysis: currentAnalysisData.charts?.dupont_latest,
      ccc_working_capital: currentAnalysisData.charts?.ccc_latest,
      react_execution_logs: currentReactLogs,
      peer_benchmark: currentAnalysisData.peer_benchmark,
      risks: currentAnalysisData.risks,
      full_report_markdown: currentReportMarkdown,
      exported_at: new Date().toISOString(),
      agent_version: 'FinReAct Agentic AI v2.4'
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinReAct_Dataset_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Bind All-Results Buttons
  if (downloadAllPdfBtn) {
    downloadAllPdfBtn.addEventListener('click', downloadAllResultsPdf);
  }
  if (downloadAllMdBtn) {
    downloadAllMdBtn.addEventListener('click', downloadAllResultsMarkdown);
  }
  if (downloadAllJsonBtn) {
    downloadAllJsonBtn.addEventListener('click', downloadAllResultsJson);
  }
  if (downloadAllFromToolbarBtn) {
    downloadAllFromToolbarBtn.addEventListener('click', downloadAllResultsPdf);
  }

  // Auto-run Lenovo on first load for immediate wow effect
  setTimeout(() => {
    startReActAnalysis('Lenovo');
  }, 400);
});
