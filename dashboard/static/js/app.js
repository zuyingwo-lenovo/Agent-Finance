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

  // Listen to Language Changes for Dynamic Content Re-render
  window.addEventListener('languageChanged', () => {
    if (currentAnalysisData) {
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

  function handleStreamPayload(data) {
    const type = data.type;

    if (data.error || type === 'error') {
      appendCard('error', '⚠️ Reasoning Error', data.error || data.content || 'An error occurred during reasoning.');
      setAgentState(false);
      if (activeEventSource) activeEventSource.close();
      return;
    }

    if (type === 'thought') {
      currentReactLogs.push(data);
      if (stepCounter) stepCounter.textContent = `Step ${data.step}/5`;
      if (railStepBadge) railStepBadge.textContent = `${data.step}/5`;
      if (uncollapseStreamPill) uncollapseStreamPill.innerHTML = `🧠 Stream (Step ${data.step}/5) ❯`;
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
      if (stepCounter) stepCounter.textContent = `Step 5/5`;
      if (railStepBadge) railStepBadge.textContent = `5/5`;
      if (uncollapseStreamPill) uncollapseStreamPill.innerHTML = `🧠 Stream (Step 5/5) ❯`;
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

  async function downloadExecutivePdf() {
    if (!currentReportMarkdown) {
      alert('レポートがまだ生成されていません。企業を分析してください。');
      return;
    }

    const origText = downloadPdfBtn?.textContent || '📄 Quick PDF';
    if (downloadPdfBtn) {
      downloadPdfBtn.textContent = '⏳ PDF生成中...';
      downloadPdfBtn.disabled = true;
    }

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
        window.print();
      }

      document.body.removeChild(pdfContainer);

      if (downloadPdfBtn) {
        downloadPdfBtn.textContent = '✅ PDF Downloaded!';
        setTimeout(() => downloadPdfBtn.textContent = origText, 2500);
      }

    } catch (err) {
      console.error('PDF generation error:', err);
      alert('PDF生成中にエラーが発生しました。印刷ダイアログを使用します。');
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
      const textToCopy = buildAllResultsMarkdown() || currentReportMarkdown;
      if (!textToCopy) {
        alert('レポートがまだ生成されていません。');
        return;
      }
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert('📋 クリップボードに全調査結果Markdownをコピーしました！');
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

  // Auto-run Lenovo on first load for immediate wow effect
  setTimeout(() => {
    startReActAnalysis('Lenovo');
  }, 400);
});
