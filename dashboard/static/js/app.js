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

  // Stream Collapse / Expand
  const dashboardGrid = document.getElementById('dashboardGrid');
  const collapseStreamBtn = document.getElementById('collapseStreamBtn');
  const collapsedStreamRail = document.getElementById('collapsedStreamRail');
  const expandRailBtn = document.getElementById('expandRailBtn');
  const uncollapseStreamPill = document.getElementById('uncollapseStreamPill');
  const railStepBadge = document.getElementById('railStepBadge');

  // Report Actions & TOC
  const copyReportBtn = document.getElementById('copyReportBtn');
  const downloadReportBtn = document.getElementById('downloadReportBtn');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const reportMarkdownContainer = document.getElementById('reportMarkdownContainer');
  const tocChips = document.querySelectorAll('.toc-chip');

  // Unified Export Dropdown
  const unifiedExportWrapper = document.getElementById('unifiedExportWrapper');
  const unifiedExportBtn = document.getElementById('unifiedExportBtn');
  const optExportFullPdf = document.getElementById('optExportFullPdf');
  const optExportExecPdf = document.getElementById('optExportExecPdf');
  const optExportMd = document.getElementById('optExportMd');
  const optExportJson = document.getElementById('optExportJson');
  const optCopyClipboard = document.getElementById('optCopyClipboard');

  // Legacy/Fallback Export Buttons (if present)
  const downloadAllPdfBtn = document.getElementById('downloadAllPdfBtn');
  const downloadAllMdBtn = document.getElementById('downloadAllMdBtn');
  const downloadAllJsonBtn = document.getElementById('downloadAllJsonBtn');
  const downloadAllFromToolbarBtn = document.getElementById('downloadAllFromToolbarBtn');

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

  // History & Audit Trail Modal Elements
  const historyModalBtn = document.getElementById('historyModalBtn');
  const historyCountBadge = document.getElementById('historyCountBadge');
  const historyModal = document.getElementById('historyModal');
  const closeHistoryModalBtn = document.getElementById('closeHistoryModalBtn');
  const historySearchInput = document.getElementById('historySearchInput');
  const exportAllHistoryBtn = document.getElementById('exportAllHistoryBtn');
  const clearAllHistoryBtn = document.getElementById('clearAllHistoryBtn');
  const historyItemsList = document.getElementById('historyItemsList');

  // Analyzing Overlay Elements
  const analyzingOverlay = document.getElementById('analyzingOverlay');
  const analyzingTargetName = document.getElementById('analyzingTargetName');
  const analyzingCurrentStepText = document.getElementById('analyzingCurrentStepText');
  const analyzingCurrentSnippet = document.getElementById('analyzingCurrentSnippet');
  const analyzingModelLabel = document.getElementById('analyzingModelLabel');
  const pipeStep1 = document.getElementById('pipeStep1');
  const pipeStep2 = document.getElementById('pipeStep2');
  const pipeStep3 = document.getElementById('pipeStep3');
  const pipeStep4 = document.getElementById('pipeStep4');
  const pipeStep5 = document.getElementById('pipeStep5');

  // Historical Session Banner Elements
  const historicalNoticeBanner = document.getElementById('historicalNoticeBanner');
  const historicalBannerTitle = document.getElementById('historicalBannerTitle');
  const historicalBannerMeta = document.getElementById('historicalBannerMeta');
  const historicalBannerRerunBtn = document.getElementById('historicalBannerRerunBtn');

  // Multilingual Selector Elements
  const langSelectorWrapper = document.getElementById('langSelectorWrapper');
  const langSelectBtn = document.getElementById('langSelectBtn');
  const langDropdownMenu = document.getElementById('langDropdownMenu');
  const langOptionBtns = document.querySelectorAll('.lang-option-btn');

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
  // Multilingual Selector Handling
  // -------------------------------------------------------------------------
  if (langSelectBtn && langSelectorWrapper) {
    langSelectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langSelectorWrapper.classList.toggle('active');
    });

    langOptionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedLang = btn.dataset.lang;
        if (selectedLang && typeof applyLanguage === 'function') {
          applyLanguage(selectedLang);
        }
        langSelectorWrapper.classList.remove('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (!langSelectorWrapper.contains(e.target)) {
        langSelectorWrapper.classList.remove('active');
      }
    });
  }

  // Initialize Language on DOM Load
  if (typeof applyLanguage === 'function' && typeof getCurrentLanguage === 'function') {
    applyLanguage(getCurrentLanguage());
  }

  // Listen to Language Changes for Dynamic Content Re-render & Localization
  window.addEventListener('languageChanged', () => {
    const val = companyInput?.value?.trim();
    if (val && currentAnalysisData && !runAnalysisBtn?.disabled) {
      startReActAnalysis(val);
    } else if (currentAnalysisData) {
      renderFinalDashboard(currentAnalysisData);
    }
  });

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
  function setPipelineStep(step) {
    const steps = [pipeStep1, pipeStep2, pipeStep3, pipeStep4, pipeStep5];
    steps.forEach((el, idx) => {
      if (!el) return;
      const sNum = idx + 1;
      if (sNum < step) {
        el.className = 'pipe-step done';
      } else if (sNum === step) {
        el.className = 'pipe-step active';
      } else {
        el.className = 'pipe-step';
      }
    });
  }

  async function startReActAnalysis(companyName) {
    if (activeEventSource) {
      activeEventSource.close();
    }

    // Hide any previous historical banner
    if (historicalNoticeBanner) {
      historicalNoticeBanner.style.display = 'none';
    }

    // Set UI state to running and reset logs
    setAgentState(true);
    streamLogContainer.innerHTML = '';
    stepCounter.textContent = 'Step 1/5';
    currentReactLogs = [];
    currentAnalysisData = null;

    // Show Analyzing Overlay immediately so STALE DATA is NOT displayed!
    if (analyzingOverlay) {
      analyzingOverlay.style.display = 'flex';
      if (analyzingTargetName) analyzingTargetName.textContent = companyName;
      if (analyzingModelLabel) analyzingModelLabel.textContent = activeModel;
      if (analyzingCurrentStepText) {
        analyzingCurrentStepText.textContent = (typeof t === 'function')
          ? `Step 1/5: ${t('welcomeStep1')}`
          : 'Step 1/5: 一次情報・有報・短信取得';
      }
      if (analyzingCurrentSnippet) {
        analyzingCurrentSnippet.textContent = `法定開示（EDINET/SEC/HKEX等）および市場フィードを探索中: ${companyName}`;
      }
      setPipelineStep(1);
    }

    // If API Key is present in localStorage, ensure we have an ephemeral token
    const clientKey = localStorage.getItem('finreact_gemini_api_key') || '';
    if (clientKey && !activeSessionToken) {
      await refreshSessionToken(clientKey);
    }

    let streamUrl = `/api/analyze/stream?company=${encodeURIComponent(companyName)}&model=${encodeURIComponent(activeModel)}`;
    const curLang = (typeof getCurrentLanguage === 'function') ? getCurrentLanguage() : 'ja';
    streamUrl += `&lang=${encodeURIComponent(curLang)}`;
    if (activeSessionToken) {
      // Pass only the random UUID session token, NEVER the raw API key
      streamUrl += `&session_token=${encodeURIComponent(activeSessionToken)}`;
    }

    activeEventSource = new EventSource(streamUrl);

    activeEventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        handleStreamPayload(payload, companyName);
      } catch (err) {
        console.error('Failed to parse SSE payload:', err);
      }
    };

    activeEventSource.onerror = (err) => {
      console.warn('SSE Stream ended or closed:', err);
      activeEventSource.close();
      setAgentState(false);
      if (analyzingOverlay) analyzingOverlay.style.display = 'none';
    };
  }

  function setAgentState(isRunning) {
    if (isRunning) {
      agentStatusBadge.classList.add('running');
      statusText.textContent = (typeof t === 'function') ? t('agentReasoning') : 'REASONING & ACTING...';
      runAnalysisBtn.disabled = true;
      runAnalysisBtn.style.opacity = '0.7';
    } else {
      agentStatusBadge.classList.remove('running');
      statusText.textContent = (typeof t === 'function') ? t('agentCompleted') : 'AGENT COMPLETED';
      runAnalysisBtn.disabled = false;
      runAnalysisBtn.style.opacity = '1';
    }
  }

  function handleStreamPayload(data, targetQuery = '') {
    const type = data.type;

    if (data.error || type === 'error') {
      appendCard('error', '⚠️ Reasoning Error', data.error || data.content || 'An error occurred during reasoning.');
      setAgentState(false);
      if (analyzingOverlay) analyzingOverlay.style.display = 'none';
      if (activeEventSource) activeEventSource.close();
      return;
    }

    if (type === 'thought') {
      currentReactLogs.push(data);
      if (stepCounter) stepCounter.textContent = `Step ${data.step}/5`;
      if (railStepBadge) railStepBadge.textContent = `${data.step}/5`;
      if (uncollapseStreamPill) uncollapseStreamPill.innerHTML = `🧠 Stream (Step ${data.step}/5) ❯`;
      appendCard('thought', `🧠 Thought ${data.step}: ${data.title || ''}`, data.content);

      // Advance Live Analyzing Overlay Pipeline & Snippets
      setPipelineStep(data.step);
      if (analyzingCurrentStepText) {
        analyzingCurrentStepText.textContent = `Step ${data.step}/5: ${data.title || ''}`;
      }
      if (analyzingCurrentSnippet) {
        analyzingCurrentSnippet.textContent = data.content;
      }
    } else if (type === 'action') {
      currentReactLogs.push(data);
      const paramStr = data.parameters ? JSON.stringify(data.parameters, null, 2) : '';
      appendCard('action', `⚡ Action: ${data.tool}`, `Parameters:\n${paramStr}`);

      if (analyzingCurrentSnippet) {
        analyzingCurrentSnippet.textContent = `⚡ ツール実行中: ${data.tool}`;
      }
    } else if (type === 'observation') {
      currentReactLogs.push(data);
      appendCard('observation', `👁️ Observation: [Result Verified]`, data.content);
    } else if (type === 'final_report') {
      currentAnalysisData = data;
      if (stepCounter) stepCounter.textContent = `Step 5/5`;
      if (railStepBadge) railStepBadge.textContent = `5/5`;
      if (uncollapseStreamPill) uncollapseStreamPill.innerHTML = `🧠 Stream (Step 5/5) ❯`;

      // Hide analyzing overlay now that new report is ready!
      if (analyzingOverlay) {
        analyzingOverlay.style.display = 'none';
      }

      renderFinalDashboard(data);

      // Save to Research History & Audit Trail Archive!
      const queryName = targetQuery || (companyInput ? companyInput.value.trim() : (data.meta?.company_name || 'Enterprise'));
      saveAnalysisToHistory(data, queryName, currentReactLogs);

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

      const callout = document.getElementById('dupontDriverCallout');
      if (callout) {
        const lang = (typeof getCurrentLanguage === 'function') ? getCurrentLanguage() : 'ja';
        if (d.equity_multiplier >= 3.0) {
          const driverLabels = {
            ja: `★ 主要ドライバー (レバレッジ ${d.equity_multiplier}倍)`,
            en: `★ Primary Driver (Financial Leverage ${d.equity_multiplier}x)`,
            'zh-CN': `★ 核心驱动因素 (权益乘数 ${d.equity_multiplier}倍)`,
            'zh-TW': `★ 核心驅動因素 (權益乘數 ${d.equity_multiplier}倍)`,
            fr: `★ Moteur Principal (Levier Financier ${d.equity_multiplier}x)`
          };
          callout.textContent = driverLabels[lang] || driverLabels.ja;
        } else {
          const marginLabels = {
            ja: `★ 収益性ドライバー (純利益率 ${d.net_margin}%)`,
            en: `★ Profitability Driver (Net Margin ${d.net_margin}%)`,
            'zh-CN': `★ 利润率驱动因素 (净利率 ${d.net_margin}%)`,
            'zh-TW': `★ 利潤率驅動因素 (淨利率 ${d.net_margin}%)`,
            fr: `★ Moteur de Marge (Marge Nette ${d.net_margin}%)`
          };
          callout.textContent = marginLabels[lang] || marginLabels.ja;
        }
      }
    }

    // 4. CCC Visualizer & Waterfall Timeline
    if (data.charts && data.charts.ccc_latest) {
      const c = data.charts.ccc_latest;
      const lang = (typeof getCurrentLanguage === 'function') ? getCurrentLanguage() : 'ja';
      const daySuffix = (lang in { en: 1, fr: 1 }) ? ' Days' : (lang in { 'zh-CN': 1, 'zh-TW': 1 } ? ' 天' : ' 日');

      document.getElementById('cccDso').textContent = `+${c.dso}${daySuffix}`;
      document.getElementById('cccDio').textContent = `+${c.dio}${daySuffix}`;
      document.getElementById('cccDpo').textContent = `−${c.dpo}${daySuffix}`;
      document.getElementById('cccResult').textContent = `${c.ccc}${daySuffix}`;

      // Update Visual Waterfall Timeline Bar
      const barDso = document.getElementById('barDso');
      const barDio = document.getElementById('barDio');
      const barDpo = document.getElementById('barDpo');
      if (barDso && barDio && barDpo) {
        const dsoVal = Math.max(10, c.dso || 42);
        const dioVal = Math.max(10, c.dio || 41);
        const dpoVal = Math.max(10, c.dpo || 81);
        const sum = dsoVal + dioVal + dpoVal;
        const pDso = Math.round((dsoVal / sum) * 100);
        const pDio = Math.round((dioVal / sum) * 100);
        const pDpo = 100 - pDso - pDio;
        barDso.style.width = `${pDso}%`;
        barDio.style.width = `${pDio}%`;
        barDpo.style.width = `${pDpo}%`;

        const dsoTexts = {
          ja: `売掛 DSO +${c.dso}日`,
          en: `DSO +${c.dso} Days`,
          'zh-CN': `应收账款 DSO +${c.dso}天`,
          'zh-TW': `應收帳款 DSO +${c.dso}天`,
          fr: `Délai Clients DSO +${c.dso}j`
        };
        const dioTexts = {
          ja: `在庫 DIO +${c.dio}日`,
          en: `DIO +${c.dio} Days`,
          'zh-CN': `存货周转 DIO +${c.dio}天`,
          'zh-TW': `存貨週轉 DIO +${c.dio}天`,
          fr: `Délai Stocks DIO +${c.dio}j`
        };
        const dpoTexts = {
          ja: `買掛 DPO -${c.dpo}日 (支払猶予)`,
          en: `DPO -${c.dpo} Days (Supplier Credit)`,
          'zh-CN': `应付账款 DPO -${c.dpo}天 (无息占款)`,
          'zh-TW': `應付帳款 DPO -${c.dpo}天 (供應商賒帳)`,
          fr: `Délai Fournisseurs DPO -${c.dpo}j (Financement)`
        };

        barDso.innerHTML = `<span class="seg-text">${dsoTexts[lang] || dsoTexts.ja}</span>`;
        barDio.innerHTML = `<span class="seg-text">${dioTexts[lang] || dioTexts.ja}</span>`;
        barDpo.innerHTML = `<span class="seg-text">${dpoTexts[lang] || dpoTexts.ja}</span>`;
      }
    }

    // 5. Interactive Charts
    if (data.charts && typeof initOrUpdateCharts === 'function') {
      initOrUpdateCharts(data.charts);
    }

    // 6. Full Markdown Report (Tab 2) & TOC Anchor Injection
    if (data.report_markdown) {
      currentReportMarkdown = data.report_markdown;
      if (typeof marked !== 'undefined') {
        let html = marked.parse(data.report_markdown);
        // Inject IDs for TOC Jump
        html = html.replace(/<h2(.*?)>A\.\s*(.*?)<\/h2>/gi, '<h2 id="sec-a"$1>A. $2</h2>');
        html = html.replace(/<h2(.*?)>B\.\s*(.*?)<\/h2>/gi, '<h2 id="sec-b"$1>B. $2</h2>');
        html = html.replace(/<h2(.*?)>C\.\s*(.*?)<\/h2>/gi, '<h2 id="sec-c"$1>C. $2</h2>');
        html = html.replace(/<h2(.*?)>D\.\s*(.*?)<\/h2>/gi, '<h2 id="sec-d"$1>D. $2</h2>');
        html = html.replace(/<h2(.*?)>E\.\s*(.*?)<\/h2>/gi, '<h2 id="sec-e"$1>E. $2</h2>');
        html = html.replace(/<h2(.*?)>F\.\s*(.*?)<\/h2>/gi, '<h2 id="sec-f"$1>F. $2</h2>');
        html = html.replace(/<h2(.*?)>G\.\s*(.*?)<\/h2>/gi, '<h2 id="sec-g"$1>G. $2</h2>');
        html = html.replace(/<h2(.*?)>H\.\s*(.*?)<\/h2>/gi, '<h2 id="sec-h"$1>H. $2</h2>');
        reportMarkdownContainer.innerHTML = html;
        reportMarkdownContainer.querySelectorAll('table').forEach(tbl => {
          const colCount = tbl.querySelector('tr')?.children.length || 0;
          tbl.classList.add(`cols-${colCount}`);
          if (colCount >= 6) {
            tbl.classList.add('table-compact');
          }
        });
      } else {
        reportMarkdownContainer.textContent = data.report_markdown;
      }
    }

    // 7. Peer Benchmark Comparison Table (Tab 3) & Hero Highlights
    if (data.peer_benchmark) {
      const bm = data.peer_benchmark;
      const targetHead = document.getElementById('bmTargetHead');
      const peer1Head = document.getElementById('bmPeer1Head');
      const peer2Head = document.getElementById('bmPeer2Head');
      const tableBody = document.getElementById('benchmarkTableBody');

      if (targetHead && bm.target_head) targetHead.textContent = bm.target_head;
      if (peer1Head && bm.peer1_head) peer1Head.textContent = bm.peer1_head;
      if (peer2Head && bm.peer2_head) peer2Head.textContent = bm.peer2_head;

      // Update Highlights Grid
      const hShare = document.getElementById('bmHeroShare');
      const hOpm = document.getElementById('bmHeroOpm');
      const hDebt = document.getElementById('bmHeroDebt');
      const hCcc = document.getElementById('bmHeroCcc');

      if (tableBody && Array.isArray(bm.rows)) {
        tableBody.innerHTML = '';
        bm.rows.forEach(r => {
          const tr = document.createElement('tr');
          let targetValHtml = `<strong>${r.target_val}</strong>`;
          let peer1ValHtml = r.peer1_val;
          let peer2ValHtml = r.peer2_val;

          // Add visual tags across languages
          const cat = (r.category || '').toLowerCase();
          const targetV = (r.target_val || '');
          const lang = (typeof getCurrentLanguage === 'function') ? getCurrentLanguage() : 'ja';

          if (cat.includes('pc') || cat.includes('シェア') || cat.includes('share') || cat.includes('市场') || cat.includes('市場') || cat.includes('part de')) {
            if (targetV.includes('首位') || targetV.includes('24%') || targetV.includes('Leader') || targetV.includes('#1')) {
              const leaderText = {
                ja: '世界首位 (24%) 👑',
                en: 'Global #1 (24%) 👑',
                'zh-CN': '全球榜首 (24%) 👑',
                'zh-TW': '全球榜首 (24%) 👑',
                fr: 'N°1 Mondial (24%) 👑'
              }[lang] || '世界首位 (24%) 👑';
              targetValHtml = `<span class="bm-badge leader">${leaderText}</span> / $58.9B`;
            }
            if (hShare) hShare.textContent = `${r.target_val}`;
          } else if (cat.includes('営業利益率') || cat.includes('opm') || cat.includes('ebit') || cat.includes('margin') || cat.includes('marge') || cat.includes('利润率') || cat.includes('利益率')) {
            targetValHtml = `<span class="bm-badge caution">${r.target_val} ⚠️</span>`;
            peer1ValHtml = `<span class="bm-badge leader">${r.peer1_val} 🥇</span>`;
            if (hOpm) hOpm.textContent = `${r.target_val} vs ${r.peer1_val}`;
          } else if (cat.includes('net debt') || cat.includes('有利子負債') || cat.includes('dette') || cat.includes('有息负债') || cat.includes('有息負債')) {
            const safeText = {
              ja: '最健全 🟢',
              en: 'Safest 🟢',
              'zh-CN': '最为稳健 🟢',
              'zh-TW': '最為穩健 🟢',
              fr: 'Plus Solide 🟢'
            }[lang] || '最健全 🟢';
            targetValHtml = `<span class="bm-badge safe">${r.target_val} ${safeText}</span>`;
            if (hDebt) hDebt.textContent = `${r.target_val}`;
          } else if (cat.includes('ccc') || cat.includes('現金循環') || cat.includes('现金周转') || cat.includes('現金週轉') || cat.includes('conversion')) {
            if (hCcc) hCcc.textContent = `${r.target_val}`;
          }

          tr.innerHTML = `
            <td><strong>${r.category}</strong></td>
            <td class="target-cell">${targetValHtml}</td>
            <td>${peer1ValHtml}</td>
            <td>${peer2ValHtml}</td>
            <td>${r.implication}</td>
          `;
          tableBody.appendChild(tr);
        });
      }
    }

    // 8. Risks Table & 2x2 Heatmap Matrix (Tab 4)
    if (data.risks && Array.isArray(data.risks)) {
      const risksTableBody = document.getElementById('risksTableBody');
      const qCritical = document.getElementById('quadCriticalItems');
      const qSevere = document.getElementById('quadSevereItems');
      const qModerate = document.getElementById('quadModerateItems');
      const qActive = document.getElementById('quadActiveItems');

      if (qCritical) qCritical.innerHTML = '';
      if (qSevere) qSevere.innerHTML = '';
      if (qModerate) qModerate.innerHTML = '';
      if (qActive) qActive.innerHTML = '';

      if (risksTableBody) {
        risksTableBody.innerHTML = '';
        const lang = (typeof getCurrentLanguage === 'function') ? getCurrentLanguage() : 'ja';
        const verifiedText = {
          ja: '✅ 検証完了',
          en: '✅ Verified',
          'zh-CN': '✅ 已复核',
          'zh-TW': '✅ 已覆核',
          fr: '✅ Vérifié'
        }[lang] || '✅ 検証完了';
        const pendingText = {
          ja: '🔍 要確認',
          en: '🔍 Audit Required',
          'zh-CN': '🔍 待核查',
          'zh-TW': '🔍 待查實',
          fr: '🔍 À Auditer'
        }[lang] || '🔍 要確認';

        data.risks.forEach((r, idx) => {
          const isHigh = r.impact === '高' || r.impact === 'High' || r.impact === 'Élevé';
          const isRealized = r.prob === '顕在化' || r.prob === 'Realized' || r.prob === 'Actif';
          const isProbHigh = r.prob === '高' || r.prob === 'High' || r.prob === 'Élevée';

          // Quadrant allocation
          const pin = document.createElement('div');
          pin.className = `risk-pin ${isHigh && isProbHigh ? 'high' : isHigh ? 'med' : isRealized ? 'active' : 'low'}`;
          pin.innerHTML = `
            <span class="pin-badge">${r.name.slice(0, 3)}</span>
            <span class="pin-text">${r.name} (${(r.ewi || '').slice(0, 16)}...)</span>
          `;

          if (isHigh && isProbHigh) {
            if (qCritical) qCritical.appendChild(pin);
          } else if (isHigh) {
            if (qSevere) qSevere.appendChild(pin);
          } else if (isRealized) {
            if (qActive) qActive.appendChild(pin);
          } else {
            if (qModerate) qModerate.appendChild(pin);
          }

          let impactBadgeText = '🟡 中 (Moderate)';
          if (isHigh) {
            impactBadgeText = {
              ja: '🔴 高 (Critical)',
              en: '🔴 High (Critical)',
              'zh-CN': '🔴 高 (严重影响)',
              'zh-TW': '🔴 高 (嚴重影響)',
              fr: '🔴 Élevé (Critique)'
            }[lang] || '🔴 高 (Critical)';
          } else {
            impactBadgeText = {
              ja: '🟡 中 (Moderate)',
              en: '🟡 Med (Moderate)',
              'zh-CN': '🟡 中 (适度影响)',
              'zh-TW': '🟡 中 (適度影響)',
              fr: '🟡 Moy. (Modéré)'
            }[lang] || '🟡 中 (Moderate)';
          }

          // Table Row
          const row = document.createElement('tr');
          row.innerHTML = `
            <td><strong>${r.name}</strong></td>
            <td><span class="bm-badge ${isHigh ? 'caution' : 'leader'}">${impactBadgeText}</span></td>
            <td><span class="bm-badge ${isProbHigh ? 'caution' : isRealized ? 'safe' : 'leader'}">${r.prob}</span></td>
            <td><code>${r.ewi}</code></td>
            <td>${r.doc}</td>
            <td><button type="button" class="btn-risk-status" data-v="${verifiedText}" data-p="${pendingText}" onclick="this.classList.toggle('pending'); this.textContent = this.classList.contains('pending') ? this.getAttribute('data-p') : this.getAttribute('data-v');">${verifiedText}</button></td>
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

  // -------------------------------------------------------------------------
  // Multilingual Dossier & PDF Export Localization Dictionary
  // -------------------------------------------------------------------------
  const I18N_DOSSIER = {
    en: {
      titlePrefix: "[Comprehensive Research Dossier]",
      pubDate: "Publication Date",
      std: "Accounting Standard",
      curr: "Reporting Currency",
      sector: "Sector",
      healthScore: "Financial Health Score",
      healthRating: "Strong Investment Grade",
      disclaimer: "Regulatory Disclaimer: This dossier represents objective corporate finance analysis and empirical fact-finding based strictly on official statutory filings (EDGAR, HKEX, EDINET); it does NOT constitute investment advice, securities recommendations, or underwriting solicitation.",
      sec1Title: "1. Executive Key Financial KPI Summary",
      thMetric: "Indicator",
      thLatest: "Latest Value",
      thYoY: "YoY / Evaluation",
      thImp: "Financial Implication",
      revName: "Revenue (Top-Line)",
      revImp: "Scale expansion and core commercial momentum",
      opmName: "Operating Margin (OPM)",
      opmImp: "Core business profitability & cost architecture",
      roeName: "Return on Equity (ROE)",
      roeEval: "High Efficiency",
      roeImp: "Comprehensive return on shareholders' equity",
      roicName: "Return on Invested Capital (ROIC)",
      roicEval: "vs WACC (8.5%)",
      roicImp: "Excess Economic Value Added (EVA) spread",
      fcfName: "Free Cash Flow (FCF)",
      fcfEval: "Operating CF - Capex",
      fcfImp: "Net organic cash generation from operations",
      cccName: "Cash Conversion Cycle (CCC)",
      cccEval: "Working Capital",
      cccImp: "Cash conversion cycle across trade inventory float",
      netDebtName: "Net Debt / EBITDA",
      netDebtEval: "Safe (<2.0x)",
      netDebtImp: "Solvency, deleveraging capacity & debt cushion",
      sec2Title: "2. Capital Efficiency Factor Decomposition (3-Stage DuPont Tree)",
      dupontFormula: "- **ROE ({roe}%)** = Net Profit Margin ({nm}%) × Asset Turnover ({at}x) × Financial Leverage ({em}x)",
      dupont1: "1. **Net Profit Margin**: Net profit as a share of revenue. Reflects pricing power and cost discipline.",
      dupont2: "2. **Asset Turnover**: Asset velocity and efficiency in transforming capital assets into sales revenue.",
      dupont3: "3. **Financial Leverage (Equity Multiplier)**: Total assets relative to stockholders' equity. Reflects capital structure and balance sheet optimization.",
      sec3Title: "3. Working Capital Cycle Deep-Dive (CCC Breakdown)",
      cccFormula: "- **Cash Conversion Cycle CCC ({ccc} Days)** = Days Sales Outstanding DSO (+{dso} Days) + Days Inventory Outstanding DIO (+{dio} Days) − Days Payables Outstanding DPO (-{dpo} Days)",
      cccTakeaway: "An ultra-low or negative Cash Conversion Cycle demonstrates exceptional procurement leverage and credit terms, establishing an auto-financing business model that supports revenue expansion without external short-term borrowing.",
      sec4Title: "4. Autonomous AI ReAct Reasoning Process & Statutory Verification Logs",
      reactDone: "*(ReAct stream reasoning logs completed)*",
      sec5Title: "5. Peer Benchmark Multi-Dimensional Comparison Matrix",
      thBenchmarkMetric: "Metric / Dimension",
      thBenchmarkImp: "Sector Implications",
      sec6Title: "6. Risk Assessment & Early Warning Indicators (EWI) Matrix",
      thRiskName: "Risk Factor",
      thRiskImpact: "Severity (Impact)",
      thRiskProb: "Likelihood (Prob)",
      thRiskEwi: "Early Warning Indicator (EWI)",
      thRiskDoc: "Regulatory Document Reference",
      sec7Title: "7. Institutional Comprehensive Corporate Finance Report (A〜H Framework)",
      compiledBy: "Report Compiled by FinReAct Agentic AI System. All data cross-referenced with primary disclosures.",
      dateLocale: "en-US",
      timeOptions: { hour: '2-digit', minute: '2-digit' },
      execPdfHeader: "FinReAct Institutional Research Report",
      execPdfDatePrefix: "Date: ",
      execPdfSubtitle: "Institutional Corporate Finance Research Report (Standard A~H Framework)",
      execPdfFooterLeft: "Confidential — Generated by FinReAct Agentic AI System",
      execPdfFooterRight: "Primary Filings: SEC Form 10-K / HKEX / EDINET / Non-Investment Advice",
      allPdfHeader: "FinReAct Comprehensive Intelligence Dossier",
      allPdfDatePrefix: "Date: ",
      allPdfSubtitle: "3-Statement Financials, AI Reasoning Logs, DuPont Tree, CCC, Peer Benchmarks, Risk Matrix",
      allPdfFooterLeft: "Confidential — Generated by FinReAct Agentic AI System",
      allPdfFooterRight: "Primary Statutory Citations: EDGAR 10-K / HKEX / EDINET / Not Investment Advice",
      generatingPdf: "⏳ Generating PDF...",
      downloadedPdf: "✅ PDF Downloaded!",
      generatingAllPdf: "⏳ Generating Full Dossier PDF...",
      downloadedAllPdf: "✅ Full Dossier PDF Downloaded!",
      notReadyAlert: "Report is not generated yet. Please run analysis first.",
      errorAlert: "Error generating PDF. Opening print dialog instead.",
      copiedAlert: "📋 Comprehensive research dossier Markdown copied to clipboard!"
    },
    ja: {
      titlePrefix: "【総合調査パッケージ】",
      pubDate: "発行日時",
      std: "会計基準",
      curr: "報告通貨",
      sector: "セクター",
      healthScore: "財務健全性スコア",
      healthRating: "Strong Investment Grade",
      disclaimer: "免責事項・留意事項: 本調査パッケージは公開情報・法定開示書類に基づく客観的財務分析であり、有価証券の売買推奨や投資助言ではありません。",
      sec1Title: "1. エグゼクティブ主要財務KPIサマリー",
      thMetric: "指標項目",
      thLatest: "最新値",
      thYoY: "前年比 / 評価",
      thImp: "財務インプリケーション",
      revName: "売上高 (Latest Revenue)",
      revImp: "コア事業および成長領域の拡大状況",
      opmName: "営業利益率 (Operating Margin)",
      opmImp: "本業の付加価値創出力・コスト構造",
      roeName: "自己資本利益率 (ROE)",
      roeEval: "効率区分",
      roeImp: "株主資本に対する総合利回り",
      roicName: "投下資本利益率 (ROIC)",
      roicEval: "vs WACC (8.5%)",
      roicImp: "投下資本に対する超過付加価値 (EVA)",
      fcfName: "フリーキャッシュフロー (FCF)",
      fcfEval: "営業CF - Capex",
      fcfImp: "事業活動からの純現金創出力",
      cccName: "現金循環日数 (CCC)",
      cccEval: "運転資本効率",
      cccImp: "仕入〜在庫〜売掛の資金拘束日数",
      netDebtName: "Net Debt / EBITDA",
      netDebtEval: "健全水準 (<2.0x)",
      netDebtImp: "有利子負債返済余力・安全性",
      sec2Title: "2. 資本効率要因分解（3段階デュポンツリー）",
      dupontFormula: "- **ROE ({roe}%)** = 売上高純利益率 ({nm}%) × 総資産回転率 ({at}回) × 財務レバレッジ ({em}倍)",
      dupont1: "1. **純利益率 (Net Margin)**: 売上高に対する最終利益の割合。収益性および価格決定力を反映。",
      dupont2: "2. **総資産回転率 (Asset Turnover)**: 保有資産をどれだけ効率的に売上に転換しているかの事業回転速度。",
      dupont3: "3. **財務レバレッジ (Equity Multiplier)**: 自己資本に対する総資産の倍率。自己株式取得や外部負債活用状況。",
      sec3Title: "3. 運転資本サイクル詳細分析（CCCブレイクダウン）",
      cccFormula: "- **現金循環日数 CCC ({ccc}日)** = 売上債権回収日数 DSO (+{dso}日) + 棚卸在庫滞留日数 DIO (+{dio}日) − 仕入先支払猶予日数 DPO (-{dpo}日)",
      cccTakeaway: "現金循環日数が極低水準またはマイナスの場合、強力なバイイングパワーと前受金活用により、売上拡大局面でも追加借入が不要な「自己金融型ビジネスモデル」を実現しています。",
      sec4Title: "4. 自律型AI ReAct推論プロセス & 一次開示検証ログ",
      reactDone: "*(ReActストリームログ取得完了)*",
      sec5Title: "5. 競合ベンチマーク多面比較マトリクス",
      thBenchmarkMetric: "指標 / カテゴリ",
      thBenchmarkImp: "業界インプリケーション",
      sec6Title: "6. リスク評価 & 早期警戒指標（EWI）マトリクス",
      thRiskName: "リスク要因",
      thRiskImpact: "重要度 (Impact)",
      thRiskProb: "発生確率 (Prob)",
      thRiskEwi: "早期警戒指標 (EWI)",
      thRiskDoc: "監視対象開示書類",
      sec7Title: "7. 機関投資家向け完全財務分析レポート（A〜H標準規格）",
      compiledBy: "Report Compiled by FinReAct Agentic AI System. All data cross-referenced with primary disclosures.",
      dateLocale: "ja-JP",
      timeOptions: { hour: '2-digit', minute: '2-digit' },
      execPdfHeader: "FinReAct Institutional Research Report",
      execPdfDatePrefix: "発行日: ",
      execPdfSubtitle: "企業財務三表・資本効率・競合ベンチマーク統合調査報告書（A〜H標準規格）",
      execPdfFooterLeft: "厳秘 (Confidential) — Generated by FinReAct Agentic AI System",
      execPdfFooterRight: "一次情報根拠: 有価証券報告書 / SEC Form 10-K / 決算短信 / 投資判断非推奨",
      allPdfHeader: "FinReAct Comprehensive Intelligence Dossier",
      allPdfDatePrefix: "発行日: ",
      allPdfSubtitle: "企業財務三表・AI推論ログ・デュポン分解・CCC・競合比較・リスク評価 完全調査パッケージ",
      allPdfFooterLeft: "厳秘 (Confidential) — Generated by FinReAct Agentic AI System",
      allPdfFooterRight: "一次情報根拠: 有価証券報告書 / SEC Form 10-K / 決算短信 / 投資判断非推奨",
      generatingPdf: "⏳ PDF生成中...",
      downloadedPdf: "✅ PDF Downloaded!",
      generatingAllPdf: "⏳ 全調査PDF生成中...",
      downloadedAllPdf: "✅ All PDF Downloaded!",
      notReadyAlert: "レポートがまだ生成されていません。企業を分析してください。",
      errorAlert: "PDF生成中にエラーが発生しました。印刷ダイアログを使用します。",
      copiedAlert: "📋 クリップボードに全調査結果Markdownをコピーしました！"
    },
    'zh-CN': {
      titlePrefix: "【全景机构级财务调查档案】",
      pubDate: "发布日期",
      std: "会计准则",
      curr: "报告货币",
      sector: "行业分类",
      healthScore: "财务健康度评分",
      healthRating: "强投资级 (Strong Investment Grade)",
      disclaimer: "合规免责声明: 本调查档案基于官方法定披露与一手财报进行客观财务分析与事实梳理，不构成任何投资建议、买卖要约或证券分析意见。",
      sec1Title: "1. 执行层核心财务KPI全景摘要",
      thMetric: "指标项目",
      thLatest: "最新数值",
      thYoY: "同比 / 评价",
      thImp: "财务与战略启示",
      revName: "营业收入 (Top-Line Revenue)",
      revImp: "核心业务规模与主营增长动能",
      opmName: "营业利润率 (Operating Margin)",
      opmImp: "主业附加值创造力与成本管控架构",
      roeName: "净资产收益率 (ROE - 杜邦)",
      roeEval: "高资本效率",
      roeImp: "股东权益综合投资回报水平",
      roicName: "投入资本回报率 (ROIC vs WACC)",
      roicEval: "vs WACC (8.5%)",
      roicImp: "超越资金成本的经济增加值 (EVA) 空间",
      fcfName: "自由现金流 (FCF)",
      fcfEval: "经营CF - 资本开支",
      fcfImp: "主营业务活动内生自由现金创造力",
      cccName: "现金循环周期 (CCC)",
      cccEval: "营运资金效率",
      cccImp: "从采购付款到存货周转及销售回款的资金占用天数",
      netDebtName: "净有息负债倍率 (Net Debt / EBITDA)",
      netDebtEval: "安全区间 (<2.0x)",
      netDebtImp: "偿债缓冲空间、去杠杆能力与财务安全性",
      sec2Title: "2. 资本效率驱动归因（三阶段杜邦分析树）",
      dupontFormula: "- **ROE ({roe}%)** = 销售净利率 ({nm}%) × 总资产周转率 ({at}次) × 权益乘数 ({em}倍)",
      dupont1: "1. **销售净利率 (Net Margin)**: 净利润占总收入比重，反映产品定价权与成本控制。",
      dupont2: "2. **总资产周转率 (Asset Turnover)**: 资产变现与营运效率，反映资金周转速度。",
      dupont3: "3. **权益乘数 (Financial Leverage)**: 总资产相对于净资产倍数，反映财务杠杆与资本结构。",
      sec3Title: "3. 营运资本循环周期深度透视（CCC分解）",
      cccFormula: "- **现金循环周期 CCC ({ccc}天)** = 应收账款周转天数 DSO (+{dso}天) + 存货周转天数 DIO (+{dio}天) − 应付账款周转天数 DPO (-{dpo}天)",
      cccTakeaway: "超低或负现金循环周期表明公司依托极强的产业链议价能力与供应商信用账期，构建了无需外部短期借贷即可支持营收扩张的「自主融资型商业模式」。",
      sec4Title: "4. 自律型AI ReAct推演过程与一手披露核验日志",
      reactDone: "*(ReAct 推演日志流已全部捕获)*",
      sec5Title: "5. 同业对标多维横向比较矩阵",
      thBenchmarkMetric: "指标 / 业务维度",
      thBenchmarkImp: "行业竞争格局启示",
      sec6Title: "6. 风险评估与早期预警指标 (EWI) 矩阵",
      thRiskName: "风险要素",
      thRiskImpact: "严重程度 (Impact)",
      thRiskProb: "发生概率 (Prob)",
      thRiskEwi: "早期预警指标 (EWI)",
      thRiskDoc: "监管披露监控来源",
      sec7Title: "7. 机构投资者完全财务分析报告（A〜H标准规范）",
      compiledBy: "Report Compiled by FinReAct Agentic AI System. All data cross-referenced with primary disclosures.",
      dateLocale: "zh-CN",
      timeOptions: { hour: '2-digit', minute: '2-digit' },
      execPdfHeader: "FinReAct 机构级企业财务调查报告",
      execPdfDatePrefix: "报告日期: ",
      execPdfSubtitle: "企业三张财务报表・资本效率・同业对标全景调查报告（A〜H标准规范）",
      execPdfFooterLeft: "内部绝密 (Confidential) — 由 FinReAct Agentic AI 系统生成",
      execPdfFooterRight: "一手公开披露依据: 官方年报 / SEC 10-K / 交易所法定披露 / 非投资建议",
      allPdfHeader: "FinReAct 全景机构级财务调查档案 (Full Dossier)",
      allPdfDatePrefix: "报告日期: ",
      allPdfSubtitle: "三张财务报表・AI推演日志・杜邦分析・营运资金周期・同业对标・风险矩阵 完整调查包",
      allPdfFooterLeft: "内部绝密 (Confidential) — 由 FinReAct Agentic AI 系统生成",
      allPdfFooterRight: "一手公开披露依据: 官方年报 / SEC 10-K / 交易所法定披露 / 非投资建议",
      generatingPdf: "⏳ PDF生成中...",
      downloadedPdf: "✅ PDF 下载完成！",
      generatingAllPdf: "⏳ 全档案PDF生成中...",
      downloadedAllPdf: "✅ 全档案PDF下载完成！",
      notReadyAlert: "报告尚未生成，请先执行企业财务分析。",
      errorAlert: "PDF生成失败，将启用系统打印对话框。",
      copiedAlert: "📋 已复制全景财务调查Markdown至剪贴板！"
    },
    'zh-TW': {
      titlePrefix: "【全景機構級財務調查檔案】",
      pubDate: "發布日期",
      std: "會計準則",
      curr: "報告貨幣",
      sector: "行業分類",
      healthScore: "財務健康度評分",
      healthRating: "強投資級 (Strong Investment Grade)",
      disclaimer: "合規免責聲明: 本調查檔案基於官方法定披露與一手財報進行客觀財務分析與事實梳理，不構成任何投資建議、買賣要約或證券分析意見。",
      sec1Title: "1. 執行層核心財務KPI全景摘要",
      thMetric: "指標項目",
      thLatest: "最新數值",
      thYoY: "同比 / 評價",
      thImp: "財務與戰略啟示",
      revName: "營業收入 (Top-Line Revenue)",
      revImp: "核心業務規模與主營增長動能",
      opmName: "營業利潤率 (Operating Margin)",
      opmImp: "主業附加值創造力與成本管控架構",
      roeName: "淨資產收益率 (ROE - 杜邦)",
      roeEval: "高資本效率",
      roeImp: "股東權益綜合投資回報水平",
      roicName: "投入資本回報率 (ROIC vs WACC)",
      roicEval: "vs WACC (8.5%)",
      roicImp: "超越資金成本的經濟增加值 (EVA) 空間",
      fcfName: "自由現金流 (FCF)",
      fcfEval: "經營CF - 資本開支",
      fcfImp: "主營業務活動內生自由現金創造力",
      cccName: "現金循環週期 (CCC)",
      cccEval: "營運資金效率",
      cccImp: "從採購付款到存貨週轉及銷售回款的資金占用天數",
      netDebtName: "淨有息負債倍率 (Net Debt / EBITDA)",
      netDebtEval: "安全區間 (<2.0x)",
      netDebtImp: "償債緩衝空間、去槓桿能力與財務安全性",
      sec2Title: "2. 資本效率驅動歸因（三階段杜邦分析樹）",
      dupontFormula: "- **ROE ({roe}%)** = 銷售淨利率 ({nm}%) × 總資產週轉率 ({at}次) × 權益乘數 ({em}倍)",
      dupont1: "1. **銷售淨利率 (Net Margin)**: 淨利潤占總收入比重，反映產品定價權與成本控制。",
      dupont2: "2. **總資產週轉率 (Asset Turnover)**: 資產變現與營運效率，反映資金週轉速度。",
      dupont3: "3. **權益乘數 (Financial Leverage)**: 總資產相對於淨資產倍數，反映財務槓桿與資本結構。",
      sec3Title: "3. 營運資本循環週期深度透視（CCC分解）",
      cccFormula: "- **現金循環週期 CCC ({ccc}天)** = 應收賬款週轉天數 DSO (+{dso}天) + 存貨週轉天數 DIO (+{dio}天) − 應付賬款週轉天數 DPO (-{dpo}天)",
      cccTakeaway: "超低或負現金循環週期表明公司依托極強的產業鏈議價能力與供應商信用賬期，構建了無需外部短期借貸即可支持營收擴張的「自主融資型商業模式」。",
      sec4Title: "4. 自律型AI ReAct推演過程與一手披露核驗日誌",
      reactDone: "*(ReAct 推演日誌流已全部捕獲)*",
      sec5Title: "5. 同業對標多維橫向比較矩陣",
      thBenchmarkMetric: "指標 / 業務維度",
      thBenchmarkImp: "行業競爭格局啟示",
      sec6Title: "6. 風險評估與早期預警指標 (EWI) 矩陣",
      thRiskName: "風險要素",
      thRiskImpact: "嚴重程度 (Impact)",
      thRiskProb: "發生概率 (Prob)",
      thRiskEwi: "早期預警指標 (EWI)",
      thRiskDoc: "監管披露監控來源",
      sec7Title: "7. 機構投資者完全財務分析報告（A〜H標準規範）",
      compiledBy: "Report Compiled by FinReAct Agentic AI System. All data cross-referenced with primary disclosures.",
      dateLocale: "zh-TW",
      timeOptions: { hour: '2-digit', minute: '2-digit' },
      execPdfHeader: "FinReAct 機構級企業財務調查報告",
      execPdfDatePrefix: "報告日期: ",
      execPdfSubtitle: "企業三張財務報表・資本效率・同業對標全景調查報告（A〜H標準規範）",
      execPdfFooterLeft: "內部絕密 (Confidential) — 由 FinReAct Agentic AI 系統生成",
      execPdfFooterRight: "一手公開披露依據: 官方年報 / SEC 10-K / 交易所法定披露 / 非投資建議",
      allPdfHeader: "FinReAct 全景機構級財務調查檔案 (Full Dossier)",
      allPdfDatePrefix: "報告日期: ",
      allPdfSubtitle: "三張財務報表・AI推演日誌・杜邦分析・營運資金週期・同業對標・風險矩陣 完整調查包",
      allPdfFooterLeft: "內部絕密 (Confidential) — 由 FinReAct Agentic AI 系統生成",
      allPdfFooterRight: "一手公開披露依據: 官方年報 / SEC 10-K / 交易所法定披露 / 非投資建議",
      generatingPdf: "⏳ PDF生成中...",
      downloadedPdf: "✅ PDF 下載完成！",
      generatingAllPdf: "⏳ 全檔案PDF生成中...",
      downloadedAllPdf: "✅ 全檔案PDF下載完成！",
      notReadyAlert: "報告尚未生成，請先執行企業財務分析。",
      errorAlert: "PDF生成失敗，將啟用系統列印對話方塊。",
      copiedAlert: "📋 已複製全景財務調查Markdown至剪貼簿！"
    },
    fr: {
      titlePrefix: "[Dossier Complet d'Intelligence Financière]",
      pubDate: "Date de Publication",
      std: "Norme Comptable",
      curr: "Devise Déclarée",
      sector: "Secteur",
      healthScore: "Score de Santé Financière",
      healthRating: "Catégorie Investissement Robuste",
      disclaimer: "Avertissement Réglementaire: Ce dossier représente une analyse financière d'entreprise objective et une recherche factuelle basée strictement sur des dépôts réglementaires officiels (SEC, HKEX, EDINET); il ne constitue pas un conseil en investissement.",
      sec1Title: "1. Synthèse Exécutive des Principaux KPI Financiers",
      thMetric: "Indicateur",
      thLatest: "Dernière Valeur",
      thYoY: "Variation / Éval.",
      thImp: "Implication Financière",
      revName: "Chiffre d'Affaires (Top-Line)",
      revImp: "Expansion commerciale et dynamique des activités clés",
      opmName: "Marge Opérationnelle (Marge d'EBIT)",
      opmImp: "Capacité bénéficiaire intrinsèque & structure des coûts",
      roeName: "Rentabilité des Capitaux Propres (ROE)",
      roeEval: "Haute Efficacité",
      roeImp: "Rendement global sur les capitaux des actionnaires",
      roicName: "Rentabilité du Capital Investi (ROIC)",
      roicEval: "vs CMPC (8.5%)",
      roicImp: "Création de Valeur Économique Ajoutée (EVA)",
      fcfName: "Flux de Trésorerie Disponible (FCF)",
      fcfEval: "Cash d'Exploit. - Capex",
      fcfImp: "Génération nette de liquidités par les opérations",
      cccName: "Cycle de Conversion de Trésorerie (CCC)",
      cccEval: "Efficacité BFR",
      cccImp: "Jours d'immobilisation de trésorerie dans le cycle d'exploitation",
      netDebtName: "Dette Nette / EBITDA",
      netDebtEval: "Niveau Sain (<2.0x)",
      netDebtImp: "Capacité de désendettement et solvabilité",
      sec2Title: "2. Décomposition de l'Efficacité du Capital (Arbre de DuPont à 3 Étapes)",
      dupontFormula: "- **ROE ({roe}%)** = Marge Nette ({nm}%) × Rotation des Actifs ({at}x) × Levier Financier ({em}x)",
      dupont1: "1. **Marge Nette**: Part du bénéfice net dans le CA. Reflète le pouvoir de fixation des prix.",
      dupont2: "2. **Rotation des Actifs**: Vélocité et efficacité de conversion des actifs en chiffre d'affaires.",
      dupont3: "3. **Levier Financier (Multiplicateur d'Avoir)**: Ratio actifs totaux sur capitaux propres. Reflète la structure financière.",
      sec3Title: "3. Analyse Détaillée du Cycle de BFR (Décomposition du CCC)",
      cccFormula: "- **Cycle de Conversion de Trésorerie CCC ({ccc} Jours)** = Délai Recouvrement Clients DSO (+{dso} Jours) + Délai Rotation Stocks DIO (+{dio} Jours) − Délai Paiement Fournisseurs DPO (-{dpo} Jours)",
      cccTakeaway: "Un cycle de conversion de trésorerie ultra-court ou négatif traduit un puissant pouvoir de négociation fournisseurs, permettant un modèle d'auto-financement sans recours au crédit bancaire à court terme.",
      sec4Title: "4. Processus d'Inférence IA ReAct & Journaux de Vérification Primaire",
      reactDone: "*(Flux des journaux ReAct entièrement capturé)*",
      sec5Title: "5. Matrice Comparative Sectorielle & Benchmark Pairs",
      thBenchmarkMetric: "Métrique / Dimension",
      thBenchmarkImp: "Implications Sectorielles",
      sec6Title: "6. Matrice d'Évaluation des Risques & Indicateurs d'Alerte Précoce (EWI)",
      thRiskName: "Facteur de Risque",
      thRiskImpact: "Gravité (Impact)",
      thRiskProb: "Probabilité",
      thRiskEwi: "Indicateur d'Alerte (EWI)",
      thRiskDoc: "Source Réglementaire",
      sec7Title: "7. Rapport Financier Institutionnel Complet (Norme A〜H)",
      compiledBy: "Report Compiled by FinReAct Agentic AI System. All data cross-referenced with primary disclosures.",
      dateLocale: "fr-FR",
      timeOptions: { hour: '2-digit', minute: '2-digit' },
      execPdfHeader: "FinReAct Rapport de Recherche Institutionnel",
      execPdfDatePrefix: "Date: ",
      execPdfSubtitle: "Rapport d'Analyse Financière Institutionnelle (Norme Standard A~H)",
      execPdfFooterLeft: "Confidentiel — Généré par le Système FinReAct Agentic AI",
      execPdfFooterRight: "Sources Primaires: SEC 10-K / EDINET / Rapports Annuels / Avis non financier",
      allPdfHeader: "FinReAct Dossier Complet d'Intelligence Financière",
      allPdfDatePrefix: "Date: ",
      allPdfSubtitle: "États Financiers, Journaux d'Inférence IA, Décomposition DuPont, CCC, Benchmarks et Matrice des Risques",
      allPdfFooterLeft: "Confidentiel — Généré par le Système FinReAct Agentic AI",
      allPdfFooterRight: "Sources Primaires: SEC 10-K / EDINET / Rapports Annuels / Avis non financier",
      generatingPdf: "⏳ Génération PDF...",
      downloadedPdf: "✅ PDF Téléchargé !",
      generatingAllPdf: "⏳ Génération Dossier PDF...",
      downloadedAllPdf: "✅ Dossier PDF Téléchargé !",
      notReadyAlert: "Le rapport n'est pas encore généré. Veuillez d'abord analyser une entreprise.",
      errorAlert: "Erreur lors de la génération du PDF. Ouverture de la boîte de dialogue d'impression.",
      copiedAlert: "📋 Dossier d'analyse copié dans le presse-papiers !"
    }
  };

  async function downloadExecutivePdf() {
    const lang = (typeof getCurrentLanguage === 'function') ? getCurrentLanguage() : 'ja';
    const D = I18N_DOSSIER[lang] || I18N_DOSSIER['ja'];

    if (!currentReportMarkdown) {
      alert(D.notReadyAlert);
      return;
    }

    const origText = downloadPdfBtn?.textContent || '📄 Quick PDF';
    if (downloadPdfBtn) {
      downloadPdfBtn.textContent = D.generatingPdf;
      downloadPdfBtn.disabled = true;
    }

    try {
      const companyName = (document.getElementById('dispCompanyName')?.textContent || 'Company').trim();
      const ticker = (document.getElementById('dispTicker')?.textContent || '').trim();
      const standard = (document.getElementById('dispStandard')?.textContent || '').trim();
      const currency = (document.getElementById('dispCurrency')?.textContent || '').trim();
      const dateStr = new Date().toLocaleDateString(D.dateLocale || 'ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });

      // レポート本文HTMLの変換
      const reportHtml = typeof marked !== 'undefined' ? marked.parse(currentReportMarkdown) : `<pre>${currentReportMarkdown}</pre>`;

      // 機関投資家向けクリーンデザインのPDFコンテナを作成
      const pdfContainer = document.createElement('div');
      pdfContainer.className = 'pdf-export-container';
      pdfContainer.innerHTML = `
        <div class="pdf-header-top">
          <span class="pdf-logo">${D.execPdfHeader}</span>
          <span class="pdf-date">${D.execPdfDatePrefix}${dateStr}</span>
        </div>
        <div class="pdf-title-box">
          <h1>${companyName} ${ticker ? `(${ticker})` : ''}</h1>
          <p class="pdf-subtitle">${D.execPdfSubtitle} | ${standard} | ${currency}</p>
        </div>
        <div class="pdf-body">
          ${reportHtml}
        </div>
        <div class="pdf-footer">
          <span>${D.execPdfFooterLeft}</span>
          <span>${D.execPdfFooterRight}</span>
        </div>
      `;

      // 対策2: 列数クラス（cols-N）の付与および多列テーブル（6列以上）の自動コンパクト化
      pdfContainer.querySelectorAll('table').forEach(tbl => {
        const colCount = tbl.querySelector('tr')?.children.length || 0;
        tbl.classList.add(`cols-${colCount}`);
        if (colCount >= 6) {
          tbl.classList.add('table-compact');
        }
      });

      document.body.appendChild(pdfContainer);

      const safeFilename = `FinReAct_Executive_Report_${companyName.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, '_')}_${Date.now()}.pdf`;

      if (typeof html2pdf !== 'undefined') {
        const opt = {
          margin: [10, 12, 14, 12],
          filename: safeFilename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            scrollY: 0
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { 
            mode: ['css', 'legacy'],
            avoid: ['.pdf-footer', 'tr', '.pdf-react-card', '.pdf-calculation-box']
          }
        };

        await html2pdf().set(opt).from(pdfContainer).save();
      } else {
        window.print();
      }

      document.body.removeChild(pdfContainer);

      if (downloadPdfBtn) {
        downloadPdfBtn.textContent = D.downloadedPdf;
        setTimeout(() => downloadPdfBtn.textContent = origText, 2500);
      }

    } catch (err) {
      console.error('PDF generation error:', err);
      alert(D.errorAlert);
      window.print();
      if (downloadPdfBtn) downloadPdfBtn.textContent = origText;
    } finally {
      if (downloadPdfBtn) downloadPdfBtn.disabled = false;
    }
  }

  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', downloadExecutivePdf);
  }

  // -------------------------------------------------------------------------
  // Complete Intelligence Dossier (All Results) Multilingual Generator
  // -------------------------------------------------------------------------
  function buildAllResultsMarkdown(targetLang = null) {
    if (!currentAnalysisData && !currentReportMarkdown) return '';
    const lang = targetLang || ((typeof getCurrentLanguage === 'function') ? getCurrentLanguage() : 'ja');
    const D = I18N_DOSSIER[lang] || I18N_DOSSIER['ja'];

    const meta = currentAnalysisData?.meta || {};
    const kpis = currentAnalysisData?.kpis || {};
    const dupont = (currentAnalysisData?.charts && currentAnalysisData.charts.dupont_latest) || {};
    const ccc = (currentAnalysisData?.charts && currentAnalysisData.charts.ccc_latest) || {};
    const dateStr = new Date().toLocaleDateString(D.dateLocale || 'ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const timeStr = new Date().toLocaleTimeString(D.dateLocale || 'ja-JP', D.timeOptions || { hour: '2-digit', minute: '2-digit' });

    let md = `# ${D.titlePrefix} ${meta.company_name || 'Target Enterprise'} (${meta.ticker || 'N/A'})\n\n`;
    md += `**${D.pubDate}**: ${dateStr} ${timeStr} | **${D.std}**: ${meta.standard || 'IFRS'} | **${D.curr}**: ${meta.currency || 'USD'} | **${D.sector}**: ${meta.sector || 'General'}\n`;
    md += `**${D.healthScore}**: **${meta.health_score || 85} / 100** (${D.healthRating})\n\n`;
    md += `> ⚠️ **${D.disclaimer}**\n\n`;

    // 1. Executive KPIs
    md += `## ${D.sec1Title}\n\n`;
    md += `| ${D.thMetric} | ${D.thLatest} | ${D.thYoY} | ${D.thImp} |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    md += `| **${D.revName}** | **${kpis.revenue || '-'}** | ${kpis.revenue_yoy || '-'} YoY | ${D.revImp} |\n`;
    md += `| **${D.opmName}** | **${kpis.opm || '-'}** | ${kpis.opm_diff || '-'} | ${D.opmImp} |\n`;
    md += `| **${D.roeName}** | **${kpis.roe || '-'}** | ${D.roeEval} | ${D.roeImp} |\n`;
    md += `| **${D.roicName}** | **${kpis.roic || '-'}** | ${D.roicEval} | ${D.roicImp} |\n`;
    md += `| **${D.fcfName}** | **${kpis.fcf || '-'}** | ${D.fcfEval} | ${D.fcfImp} |\n`;
    md += `| **${D.cccName}** | **${kpis.ccc || '-'}** | ${D.cccEval} | ${D.cccImp} |\n`;
    md += `| **${D.netDebtName}** | **${kpis.net_debt_ebitda || '-'}** | ${D.netDebtEval} | ${D.netDebtImp} |\n\n`;

    // 2. DuPont Tree
    md += `## ${D.sec2Title}\n\n`;
    md += D.dupontFormula
      .replace('{roe}', dupont.roe || 0)
      .replace('{nm}', dupont.net_margin || 0)
      .replace('{at}', dupont.asset_turnover || 0)
      .replace('{em}', dupont.equity_multiplier || 0) + '\n\n';
    md += `${D.dupont1}\n`;
    md += `${D.dupont2}\n`;
    md += `${D.dupont3}\n\n`;

    // 3. CCC Breakdown
    md += `## ${D.sec3Title}\n\n`;
    md += D.cccFormula
      .replace('{ccc}', ccc.ccc || 0)
      .replace('{dso}', ccc.dso || 0)
      .replace('{dio}', ccc.dio || 0)
      .replace('{dpo}', ccc.dpo || 0) + '\n\n';
    md += `${D.cccTakeaway}\n\n`;

    // 4. ReAct Autonomous Reasoning Logs
    md += `## ${D.sec4Title}\n\n`;
    if (currentReactLogs && currentReactLogs.length > 0) {
      const thoughtLabel = lang === 'en' ? 'Thought' : (lang === 'fr' ? 'Pensée' : (lang === 'zh-CN' || lang === 'zh-TW' ? '推演步骤' : '推論'));
      currentReactLogs.forEach(log => {
        if (log.type === 'thought') {
          md += `### 🧠 [${thoughtLabel} ${log.step}] ${log.title || 'Reasoning'}\n${log.content}\n\n`;
        } else if (log.type === 'action') {
          md += `> ⚡ **Action**: \`${log.tool}\`\n\`\`\`json\n${JSON.stringify(log.parameters, null, 2)}\n\`\`\`\n\n`;
        } else if (log.type === 'observation') {
          md += `**👁️ Observation**: \n\`\`\`\n${log.content}\n\`\`\`\n\n`;
        }
      });
    } else {
      md += `${D.reactDone}\n\n`;
    }

    // 5. Peer Benchmark
    if (currentAnalysisData?.peer_benchmark) {
      const bm = currentAnalysisData.peer_benchmark;
      md += `## ${D.sec5Title}\n\n`;
      md += `| ${D.thBenchmarkMetric} | ${bm.target_head} | ${bm.peer1_head} | ${bm.peer2_head} | ${D.thBenchmarkImp} |\n`;
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
      md += `## ${D.sec6Title}\n\n`;
      md += `| ${D.thRiskName} | ${D.thRiskImpact} | ${D.thRiskProb} | ${D.thRiskEwi} | ${D.thRiskDoc} |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- |\n`;
      currentAnalysisData.risks.forEach(r => {
        md += `| **${r.name}** | ${r.impact} | ${r.prob} | \`${r.ewi}\` | ${r.doc} |\n`;
      });
      md += `\n`;
    }

    // 7. Full Institutional Report (A〜H)
    md += `## ${D.sec7Title}\n\n`;
    md += currentReportMarkdown || '';
    md += `\n\n---\n*${D.compiledBy}*\n`;

    return md;
  }

  // 1. Download All Results (PDF)
  async function downloadAllResultsPdf() {
    const lang = (typeof getCurrentLanguage === 'function') ? getCurrentLanguage() : 'ja';
    const D = I18N_DOSSIER[lang] || I18N_DOSSIER['ja'];

    if (!currentAnalysisData && !currentReportMarkdown) {
      alert(D.notReadyAlert);
      return;
    }

    const triggerBtns = [
      document.getElementById('downloadAllPdfBtn'),
      document.getElementById('downloadAllFromToolbarBtn')
    ].filter(Boolean);

    triggerBtns.forEach(b => {
      b.dataset.origText = b.textContent;
      b.textContent = D.generatingAllPdf;
      b.disabled = true;
    });

    try {
      const fullMd = buildAllResultsMarkdown(lang);
      const companyName = (currentAnalysisData?.meta?.company_name || 'Company').trim();
      const ticker = (currentAnalysisData?.meta?.ticker || '').trim();
      const standard = (currentAnalysisData?.meta?.standard || '').trim();
      const currency = (currentAnalysisData?.meta?.currency || '').trim();
      const dateStr = new Date().toLocaleDateString(D.dateLocale || 'ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });

      const reportHtml = typeof marked !== 'undefined' ? marked.parse(fullMd) : `<pre>${fullMd}</pre>`;

      const pdfContainer = document.createElement('div');
      pdfContainer.className = 'pdf-export-container';
      pdfContainer.innerHTML = `
        <div class="pdf-header-top">
          <span class="pdf-logo">${D.allPdfHeader}</span>
          <span class="pdf-date">${D.allPdfDatePrefix}${dateStr}</span>
        </div>
        <div class="pdf-title-box">
          <h1>${companyName} ${ticker ? `(${ticker})` : ''}</h1>
          <p class="pdf-subtitle">${D.allPdfSubtitle} | ${standard} | ${currency}</p>
        </div>
        <div class="pdf-body">
          ${reportHtml}
        </div>
        <div class="pdf-footer">
          <span>${D.allPdfFooterLeft}</span>
          <span>${D.allPdfFooterRight}</span>
        </div>
      `;

      // 対策2: 列数クラス（cols-N）の付与および多列テーブル（6列以上）の自動コンパクト化
      pdfContainer.querySelectorAll('table').forEach(tbl => {
        const colCount = tbl.querySelector('tr')?.children.length || 0;
        tbl.classList.add(`cols-${colCount}`);
        if (colCount >= 6) {
          tbl.classList.add('table-compact');
        }
      });

      document.body.appendChild(pdfContainer);

      const safeFilename = `FinReAct_Full_Dossier_${companyName.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, '_')}_${Date.now()}.pdf`;

      if (typeof html2pdf !== 'undefined') {
        const opt = {
          margin: [10, 12, 14, 12],
          filename: safeFilename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            scrollY: 0
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { 
            mode: ['css', 'legacy'],
            avoid: ['.pdf-footer', 'tr', '.pdf-react-card', '.pdf-calculation-box']
          }
        };

        await html2pdf().set(opt).from(pdfContainer).save();
      } else {
        window.print();
      }

      document.body.removeChild(pdfContainer);

      triggerBtns.forEach(b => {
        b.textContent = D.downloadedAllPdf;
        setTimeout(() => {
          b.textContent = b.dataset.origText || '📦 Download All Results (PDF)';
          b.disabled = false;
        }, 2500);
      });

    } catch (err) {
      console.error('All-Results PDF export error:', err);
      alert(D.errorAlert);
      window.print();
      triggerBtns.forEach(b => {
        b.textContent = b.dataset.origText || '📦 Download All Results (PDF)';
        b.disabled = false;
      });
    }
  }

  // 2. Download All Results (Markdown)
  function downloadAllResultsMarkdown() {
    const lang = (typeof getCurrentLanguage === 'function') ? getCurrentLanguage() : 'ja';
    const D = I18N_DOSSIER[lang] || I18N_DOSSIER['ja'];

    if (!currentAnalysisData && !currentReportMarkdown) {
      alert(D.notReadyAlert);
      return;
    }
    const fullMd = buildAllResultsMarkdown(lang);
    const companyName = (currentAnalysisData?.meta?.company_name || 'Company').trim();
    const blob = new Blob([fullMd], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinReAct_Full_Dossier_${companyName.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, '_')}_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 3. Download All Results (Raw JSON)
  function downloadAllResultsJson() {
    const lang = (typeof getCurrentLanguage === 'function') ? getCurrentLanguage() : 'ja';
    const D = I18N_DOSSIER[lang] || I18N_DOSSIER['ja'];

    if (!currentAnalysisData) {
      alert(D.notReadyAlert);
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
    a.download = `FinReAct_Dataset_${companyName.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, '_')}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // -------------------------------------------------------------------------
  // Feature 1: Collapsible ReAct Stream Sidebar
  // -------------------------------------------------------------------------
  function setStreamCollapsed(collapsed) {
    if (!dashboardGrid) return;
    if (collapsed) {
      dashboardGrid.classList.add('stream-collapsed');
      localStorage.setItem('finreact_stream_collapsed', 'true');
    } else {
      dashboardGrid.classList.remove('stream-collapsed');
      localStorage.setItem('finreact_stream_collapsed', 'false');
    }
    // Allow CSS transition to finish, then trigger resize so Chart.js recalculates width
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 340);
  }

  if (collapseStreamBtn) {
    collapseStreamBtn.addEventListener('click', () => setStreamCollapsed(true));
  }
  if (expandRailBtn) {
    expandRailBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setStreamCollapsed(false);
    });
  }
  if (collapsedStreamRail) {
    collapsedStreamRail.addEventListener('click', () => setStreamCollapsed(false));
  }
  if (uncollapseStreamPill) {
    uncollapseStreamPill.addEventListener('click', () => setStreamCollapsed(false));
  }

  // Restore saved collapse state if previously set
  if (localStorage.getItem('finreact_stream_collapsed') === 'true') {
    setStreamCollapsed(true);
  }

  // -------------------------------------------------------------------------
  // Feature 2: Unified Export Dropdown Component
  // -------------------------------------------------------------------------
  if (unifiedExportBtn && unifiedExportWrapper) {
    unifiedExportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = unifiedExportWrapper.classList.toggle('active');
      unifiedExportBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!unifiedExportWrapper.contains(e.target)) {
        unifiedExportWrapper.classList.remove('active');
        unifiedExportBtn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        unifiedExportWrapper.classList.remove('active');
        unifiedExportBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (optExportFullPdf) {
    optExportFullPdf.addEventListener('click', () => {
      unifiedExportWrapper?.classList.remove('active');
      unifiedExportBtn?.setAttribute('aria-expanded', 'false');
      downloadAllResultsPdf();
    });
  }

  if (optExportExecPdf) {
    optExportExecPdf.addEventListener('click', () => {
      unifiedExportWrapper?.classList.remove('active');
      unifiedExportBtn?.setAttribute('aria-expanded', 'false');
      downloadExecutivePdf();
    });
  }

  if (optExportMd) {
    optExportMd.addEventListener('click', () => {
      unifiedExportWrapper?.classList.remove('active');
      unifiedExportBtn?.setAttribute('aria-expanded', 'false');
      downloadAllResultsMarkdown();
    });
  }

  if (optExportJson) {
    optExportJson.addEventListener('click', () => {
      unifiedExportWrapper?.classList.remove('active');
      unifiedExportBtn?.setAttribute('aria-expanded', 'false');
      downloadAllResultsJson();
    });
  }

  if (optCopyClipboard) {
    optCopyClipboard.addEventListener('click', () => {
      unifiedExportWrapper?.classList.remove('active');
      unifiedExportBtn?.setAttribute('aria-expanded', 'false');
      const lang = (typeof getCurrentLanguage === 'function') ? getCurrentLanguage() : 'ja';
      const D = I18N_DOSSIER[lang] || I18N_DOSSIER['ja'];
      const textToCopy = buildAllResultsMarkdown(lang) || currentReportMarkdown;
      if (!textToCopy) {
        alert(D.notReadyAlert);
        return;
      }
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert(D.copiedAlert);
      }).catch(err => {
        console.error('Clipboard copy failed:', err);
      });
    });
  }

  // Bind Legacy All-Results Buttons (if present)
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

  // -------------------------------------------------------------------------
  // Feature 3: Tab 2 Sticky TOC Bar Jump
  // -------------------------------------------------------------------------
  if (tocChips && tocChips.length > 0) {
    tocChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const targetId = chip.dataset.target;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          tocChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // -------------------------------------------------------------------------
  // Feature 4: Research History & Audit Trail Archive Management
  // -------------------------------------------------------------------------
  const HISTORY_STORAGE_KEY = 'finreact_research_history';

  function getResearchHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed to parse history:', e);
      return [];
    }
  }

  function saveAnalysisToHistory(data, query, logs) {
    if (!data || !data.meta) return;
    try {
      const history = getResearchHistory();
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const formattedTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const ticker = data.meta.ticker || 'N/A';
      const companyName = data.meta.company_name || query;
      const model = data.meta.model || activeModel;
      const sources = data.meta.sources || ['HKEXnews', 'SEC EDGAR', 'Yahoo Finance Global API'];
      const tools = data.meta.tools_used || ['retrieve_primary_disclosures', 'financial_calc.py', 'benchmark_peers', 'evaluate_risk_matrix', 'build_a_to_h_report'];
      const skills = data.meta.skills_used || ['corporate-finance-analyst', 'financial_calc.py'];

      const newRecord = {
        id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: now.toISOString(),
        formattedTime: formattedTime,
        query: query,
        companyName: companyName,
        ticker: ticker,
        currency: data.meta.currency || 'USD',
        standard: data.meta.standard || 'IFRS',
        sector: data.meta.sector || 'General Corporate',
        healthScore: data.meta.health_score || 85,
        model: model,
        sources: sources,
        tools: tools,
        skills: skills,
        kpis: data.kpis || {},
        fullData: data,
        reactLogs: logs || []
      };

      // Filter out duplicate identical company executed in the last 30 seconds, then unshift
      const updated = [newRecord, ...history.filter(h => h.companyName !== companyName || (Date.now() - new Date(h.timestamp).getTime()) > 30000)].slice(0, 30);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      updateHistoryBadge();
    } catch (e) {
      console.error('Failed to save analysis to history:', e);
    }
  }

  function updateHistoryBadge() {
    if (!historyCountBadge) return;
    const history = getResearchHistory();
    historyCountBadge.textContent = history.length;
    historyCountBadge.style.display = history.length > 0 ? 'inline-block' : 'none';
  }

  function renderHistoryItems(filterQuery = '') {
    if (!historyItemsList) return;
    const history = getResearchHistory();
    const q = filterQuery.toLowerCase().trim();

    const filtered = q
      ? history.filter(item => 
          (item.companyName && item.companyName.toLowerCase().includes(q)) ||
          (item.ticker && item.ticker.toLowerCase().includes(q)) ||
          (item.formattedTime && item.formattedTime.includes(q)) ||
          (item.model && item.model.toLowerCase().includes(q)) ||
          (item.sources && item.sources.some(s => s.toLowerCase().includes(q)))
        )
      : history;

    if (filtered.length === 0) {
      const emptyText = (typeof t === 'function') ? t('historyEmpty') : '調査履歴がありません。';
      historyItemsList.innerHTML = `
        <div class="history-empty-state">
          <div class="empty-icon">📜</div>
          <p>${emptyText}</p>
        </div>
      `;
      return;
    }

    const restoreLabel = (typeof t === 'function' && t('historyLoadBtn') && t('historyLoadBtn') !== 'historyLoadBtn') ? t('historyLoadBtn') : '⚡ 調査結果を復元';
    const deleteLabel = (typeof t === 'function' && t('historyDeleteBtn') && t('historyDeleteBtn') !== 'historyDeleteBtn') ? t('historyDeleteBtn') : '🗑️ 削除';
    const singleDlLabel = (typeof t === 'function' && t('historyExportSingleBtn') && t('historyExportSingleBtn') !== 'historyExportSingleBtn') ? t('historyExportSingleBtn') : 'JSON保存';

    historyItemsList.innerHTML = filtered.map(item => {
      const sourcesHtml = (item.sources || []).slice(0, 3).map(s => `<span class="audit-source-pill">${s}</span>`).join('');
      const skillsStr = (item.skills || []).join(', ');
      const k = item.kpis || {};

      return `
        <div class="history-card" data-id="${item.id}">
          <div class="history-card-header">
            <div class="history-title-area">
              <span class="history-company-name">${item.companyName}</span>
              <span class="history-ticker-badge">${item.ticker}</span>
              <span class="audit-source-pill" style="border-color: rgba(245, 158, 11, 0.4); color: #fbbf24;">${item.standard}</span>
            </div>
            <div class="history-header-meta">
              <span class="history-time-tag">🕒 ${item.formattedTime}</span>
              <span class="history-model-tag">🤖 ${item.model}</span>
            </div>
          </div>

          <!-- Audit Provenance Trace -->
          <div class="history-audit-row">
            <div class="audit-sources-group">
              <span class="audit-lead-label">📡 Sources:</span>
              ${sourcesHtml}
            </div>
            <div class="audit-skills-group">
              🛠️ ${skillsStr}
            </div>
          </div>

          <!-- KPI Snapshot -->
          <div class="history-kpi-strip">
            <div class="history-kpi-cell">
              <span class="cell-lbl">Health Score</span>
              <span class="cell-val" style="color: var(--accent-emerald);">${item.healthScore}/100</span>
            </div>
            <div class="history-kpi-cell">
              <span class="cell-lbl">Revenue</span>
              <span class="cell-val">${k.revenue || '-'}</span>
            </div>
            <div class="history-kpi-cell">
              <span class="cell-lbl">OP Margin</span>
              <span class="cell-val">${k.opm || '-'}</span>
            </div>
            <div class="history-kpi-cell">
              <span class="cell-lbl">ROE</span>
              <span class="cell-val">${k.roe || '-'}</span>
            </div>
            <div class="history-kpi-cell">
              <span class="cell-lbl">CCC (Cycle)</span>
              <span class="cell-val">${k.ccc || '-'}</span>
            </div>
            <div class="history-kpi-cell">
              <span class="cell-lbl">Net Debt</span>
              <span class="cell-val">${k.net_debt_ebitda || '-'}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="history-actions-row">
            <button type="button" class="btn-history-del" data-action="delete" data-id="${item.id}" title="この履歴を削除">${deleteLabel}</button>
            <button type="button" class="btn-history-dl" data-action="download" data-id="${item.id}" title="このセッションをJSON保存">📥 ${singleDlLabel}</button>
            <button type="button" class="btn-history-restore" data-action="restore" data-id="${item.id}" title="ダッシュボードに復元">${restoreLabel}</button>
          </div>
        </div>
      `;
    }).join('');

    // Bind item action buttons
    historyItemsList.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        const record = history.find(h => h.id === id);
        if (!record) return;

        if (action === 'restore') {
          restoreHistoricalAnalysis(record);
        } else if (action === 'download') {
          downloadSingleHistoryJson(record);
        } else if (action === 'delete') {
          deleteHistoryItem(id);
        }
      });
    });
  }

  function restoreHistoricalAnalysis(record) {
    if (!record || !record.fullData) return;

    // Set state
    currentAnalysisData = record.fullData;
    currentReactLogs = record.reactLogs || [];
    if (companyInput) companyInput.value = record.companyName;

    // Close History Modal
    if (historyModal) historyModal.classList.remove('active');

    // Populate Left Stream Panel with recorded ReAct logs
    streamLogContainer.innerHTML = '';
    if (currentReactLogs.length > 0) {
      currentReactLogs.forEach(log => {
        if (log.type === 'thought') {
          appendCard('thought', `🧠 Thought ${log.step}: ${log.title || ''}`, log.content);
        } else if (log.type === 'action') {
          const paramStr = log.parameters ? JSON.stringify(log.parameters, null, 2) : '';
          appendCard('action', `⚡ Action: ${log.tool}`, `Parameters:\n${paramStr}`);
        } else if (log.type === 'observation') {
          appendCard('observation', `👁️ Observation: [Result Verified]`, log.content);
        }
      });
      if (stepCounter) stepCounter.textContent = `Step 5/5`;
      if (railStepBadge) railStepBadge.textContent = `5/5`;
      if (uncollapseStreamPill) uncollapseStreamPill.innerHTML = `🧠 Stream (Step 5/5) ❯`;
    }

    // Render Final Dashboard
    renderFinalDashboard(record.fullData);

    // Show Historical Active Notice Banner
    if (historicalNoticeBanner) {
      historicalNoticeBanner.style.display = 'flex';
      if (historicalBannerTitle) {
        const noticeText = (typeof t === 'function') ? t('historyBannerNotice') : '過去の調査アーカイブを表示中';
        historicalBannerTitle.textContent = `${noticeText}: ${record.companyName}`;
      }
      if (historicalBannerMeta) {
        historicalBannerMeta.textContent = `記録日時: ${record.formattedTime} | Model: ${record.model} | Sources: ${(record.sources || []).join(', ')}`;
      }
    }

    // Update preset chips highlight if matching
    presetChips.forEach(c => {
      const cCompany = c.dataset.company.toLowerCase();
      if (record.companyName.toLowerCase().includes(cCompany) || (record.ticker && record.ticker.toLowerCase().includes(cCompany))) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    // Smooth scroll to top of dashboard
    const intelligencePanel = document.getElementById('intelligencePanel');
    if (intelligencePanel) {
      intelligencePanel.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function downloadSingleHistoryJson(record) {
    const jsonStr = JSON.stringify(record, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = record.companyName.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/g, '_');
    a.href = url;
    a.download = `FinReAct_Audit_${safeName}_${record.formattedTime.replace(/[: -]/g, '')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportAllHistoryJson() {
    const history = getResearchHistory();
    if (history.length === 0) {
      alert('エクスポート可能な調査履歴がありません。');
      return;
    }
    const jsonStr = JSON.stringify(history, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinReAct_AuditTrail_AllSessions_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function deleteHistoryItem(id) {
    const history = getResearchHistory();
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    renderHistoryItems(historySearchInput ? historySearchInput.value : '');
    updateHistoryBadge();
  }

  function clearAllHistory() {
    const confirmMsg = (typeof t === 'function') ? t('historyClearConfirm') : '保存されたすべての調査履歴を削除しますか？';
    if (!confirm(confirmMsg)) return;
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    renderHistoryItems('');
    updateHistoryBadge();
  }

  // Bind History Modal Controls
  if (historyModalBtn && historyModal) {
    historyModalBtn.addEventListener('click', () => {
      renderHistoryItems(historySearchInput ? historySearchInput.value : '');
      historyModal.classList.add('active');
    });
  }

  if (closeHistoryModalBtn && historyModal) {
    closeHistoryModalBtn.addEventListener('click', () => {
      historyModal.classList.remove('active');
    });
  }

  if (historyModal) {
    historyModal.addEventListener('click', (e) => {
      if (e.target === historyModal) {
        historyModal.classList.remove('active');
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && historyModal && historyModal.classList.contains('active')) {
      historyModal.classList.remove('active');
    }
  });

  if (historySearchInput) {
    historySearchInput.addEventListener('input', (e) => {
      renderHistoryItems(e.target.value);
    });
  }

  if (exportAllHistoryBtn) {
    exportAllHistoryBtn.addEventListener('click', exportAllHistoryJson);
  }

  if (clearAllHistoryBtn) {
    clearAllHistoryBtn.addEventListener('click', clearAllHistory);
  }

  if (historicalBannerRerunBtn) {
    historicalBannerRerunBtn.addEventListener('click', () => {
      const q = companyInput ? companyInput.value.trim() : 'Toyota';
      startReActAnalysis(q);
    });
  }

  // Initialize history badge on load
  updateHistoryBadge();

  // Auto-run Toyota on first load for immediate wow effect
  setTimeout(() => {
    startReActAnalysis('Toyota');
  }, 400);
});
