/**
 * FinReAct Intelligence Platform - Internationalization (i18n) Engine
 * Supported Languages:
 * - ja: 日本語 (Japanese Corporate Finance Standards)
 * - en: English (US Institutional Finance Standards)
 * - zh-CN: 简体中文 (中国企业财务及投行分析规范)
 * - zh-TW: 繁體中文 (港台機構投資者財務分析標準)
 * - fr: Français (Normes financières d'entreprise et IFRS)
 */

const I18N_DICTIONARY = {
  ja: {
    langName: "日本語",
    flag: "🇯🇵",
    appName: "FinReAct",
    appSubtitle: "Gemini連携 企業財務自律調査ダッシュボード",
    presetsLabel: "プリセット:",
    searchPlaceholder: "企業名またはティッカーを入力 (例: Lenovo, Apple, トヨタ)...",
    runReActBtn: "Run ReAct",
    agentReady: "AGENT READY",
    agentReasoning: "REASONING & ACTING...",
    agentCompleted: "AGENT COMPLETED",
    settingsTitle: "Gemini API設定",
    streamTitle: "ReAct 実行推論ストリーム",
    stepLabel: "Step",
    clearStreamTitle: "ストリームを消去",
    collapseStreamTitle: "ストリームを折りたたむ (画面を広く使う)",
    collapseStreamBtn: "◀ 畳む",
    expandStreamTitle: "ストリームを展開",
    uncollapsePillText: "🧠 Stream (Step 5/5) ❯",
    welcomeTitle: "自律型 ReAct アナリスト起動準備完了",
    welcomeDesc: "「Run ReAct」をクリックすると、Gemini LLMが思考（Thought）→ ツール実行（Action）→ 観測（Observation）をリアルタイムに繰り返し、財務三表・デュポン分解・競合比較・リスク評価を自律的に遂行します。",
    welcomeStep1: "1. 一次情報・有報・短信取得",
    welcomeStep2: "2. 決定論的指標・デュポン計算",
    welcomeStep3: "3. 競合ベンチマーク比較",
    welcomeStep4: "4. 早期警戒リスクマトリクス",
    welcomeStep5: "5. A〜H 機関レポート統合",

    // KPI Cards
    healthScoreTitle: "FINANCIAL HEALTH",
    healthScoreDesc: "Strong Investment Grade (強固な投資適格)",
    kpiRevenueLabel: "直近売上高 (LATEST REVENUE)",
    kpiRevenueFooter: "AIサーバー & AI PC 拡大",
    kpiOpmLabel: "営業利益率 (OPERATING MARGIN)",
    kpiOpmFooter: "ISG損益改善 & SSG高付加価値化",
    kpiRoeLabel: "自己資本利益率 (ROE - DUPONT)",
    kpiRoeBadge: "高資本効率",
    kpiRoeFooter: "総資産回転率 & 財務レバレッジ主導",
    kpiRoicLabel: "投下資本利益率 (ROIC vs WACC)",
    kpiRoicFooter: "超過付加価値 (EVA) 創出中",
    kpiCccLabel: "現金循環日数 (CASH CONVERSION CCC)",
    kpiCccBadge: "極小〜マイナス",
    kpiCccFooter: "マイナス運転資本 (自己金融型モデル)",
    kpiNetDebtLabel: "純有利子負債倍率 (NET DEBT / EBITDA)",
    kpiNetDebtBadge: "安全圏 (<2.0x)",
    kpiNetDebtFooter: "強固な返済余力 & 現金バッファ",

    // Tabs
    tabOverview: "📊 概要 & チャート",
    tabReport: "📑 完全機関レポート (A〜H)",
    tabBenchmark: "⚔️ 競合ピアベンチマーク",
    tabRisks: "🛡️ 早期警戒・リスク評価",

    // Unified Export
    exportBtnLabel: "Export Dossier",
    exportMenuHeader: "INVESTMENT DOSSIER EXPORTS",
    optFullPdfName: "Full Dossier (PDF)",
    optFullPdfBadge: "推奨",
    optFullPdfDesc: "思考ログ・財務三表・デュポン・競合・リスク・完全報告書",
    optExecPdfName: "Institutional Report (PDF)",
    optExecPdfDesc: "A〜H標準規格のエグゼクティブレポート（印刷・回覧用）",
    optMdName: "Integrated Markdown (.md)",
    optMdDesc: "全調査データと分析テキストを統合したMarkdownファイル",
    optJsonName: "Raw Financial Dataset (.json)",
    optJsonDesc: "API連携・モデリング用の構造化JSON生データ",
    optCopyName: "Markdownをクリップボードにコピー",
    optCopyDesc: "クリップボードにMarkdownテキストを即時コピー",

    // Tab 1 DuPont & CCC
    chartTrajectoryTitle: "Multi-Year Financial Trajectory (売上 & 利益推移)",
    chartTrajectorySub: "Reported Currency in Millions",
    chartDatasetRevenue: "売上高 (Revenue)",
    chartDatasetOperatingProfit: "営業利益 (Operating Profit)",
    chartDatasetNetProfit: "当期純利益 (Net Profit)",
    chartDatasetOperatingCF: "営業CF (OCF)",
    chartDatasetFCF: "フリーCF (FCF)",
    chartCashFlowTitle: "Cash Generation & FCF Quality (現金創出力 & FCF質的推移)",
    chartCashFlowSub: "Operating CF vs Capex vs FCF",
    dupontTitle: "3段階デュポン分解 (3-Stage DuPont Decomposition)",
    dupontBadge: "ROE = 売上高純利益率 × 総資産回転率 × 財務レバレッジ",
    dupontRoeTitle: "ROE (自己資本利益率)",
    dupontMarginTitle: "① Net Margin (収益性)",
    dupontMarginDesc: "当期純利益 / 売上高 (薄利多売)",
    dupontTurnoverTitle: "② Asset Turnover (資産効率)",
    dupontTurnoverDesc: "売上高 / 総資産 (高回転事業)",
    dupontLeverageTitle: "③ Leverage (資本構成)",
    dupontLeverageDesc: "総資産 / 自己資本 (財務活用)",
    dupontDriverCallout: "★ 主要ドライバー (レバレッジ 6.4x)",
    cccCycleTitle: "運転資本サイクル (CCC Working Capital Cycle)",
    cccBadge: "CCC = DSO + DIO − DPO (売掛回収 + 在庫滞留 − 買掛猶予)",
    cccDsoLabel: "売上債権回収 (DSO)",
    cccDioLabel: "棚卸在庫滞留 (DIO)",
    cccDpoLabel: "仕入先支払猶予 (DPO)",
    cccResultLabel: "現金循環日数 (CCC)",
    cccBarDso: "売掛 DSO",
    cccBarDio: "在庫 DIO",
    cccBarDpo: "買掛 DPO (長期支払猶予)",
    cccCaption: "仕入先への長期支払猶予（DPO）が売掛金＋在庫の資金拘束を相殺。事業拡大に伴う追加運転資金借入が不要な自己金融型（マイナス運転資本）モデルを実現しています。",

    // Tab 2 TOC Chips
    tocTitle: "📑 Quick Jump:",
    tocA: "A. 要約",
    tocB: "B. 事業構造",
    tocC: "C. 財務推移",
    tocD: "D. 20財務指標",
    tocE: "E. 資本効率",
    tocF: "F. 競合比較",
    tocG: "G. リスク",
    tocH: "H. 提言・出典",
    copyReportBtn: "📋 Copy Markdown",
    quickPdfBtn: "📄 Quick PDF",
    downloadMdBtn: "📥 Download .md",

    // Tab 3 Benchmark
    bmHeroShareTitle: "PC事業 世界シェア",
    bmHeroShareSub: "Lenovoが首位堅持 / HP(20%) Dell(17%)",
    bmHeroOpmTitle: "営業利益率 (OPM)",
    bmHeroOpmSub: "Dell(8.8%)・HP(8.0%) 米系が高マージン",
    bmHeroDebtTitle: "純有利子負債倍率",
    bmHeroDebtSub: "Dell(1.2x)・HP(1.8x) に対し強固な財務余力",
    bmHeroCccTitle: "現金循環日数 (CCC)",
    bmHeroCccSub: "3社ともに極めて効率的なマイナス運転資本",
    bmThMetric: "指標 / カテゴリ",
    bmThImplication: "業界インプリケーション",

    // Tab 4 Risks
    riskMatrixTitle: "早期警戒リスク・ヒートマップマトリクス (2×2 Impact × Likelihood Grid)",
    riskMatrixSubtitle: "財務影響度（縦軸） × 発生確率（横軸）によるリスク評価マップ",
    axisImpact: "財務影響度 (Impact) ▲",
    axisLikelihood: "発生確率 (Likelihood) ► [中確率 ──────► 高確率 / 顕在化]",
    quadCritical: "高影響 × 高確率 [Critical 最警戒]",
    quadSevere: "高影響 × 中確率 [Severe 重大]",
    quadModerate: "中影響 × 中/低確率 [Moderate 監視]",
    quadActive: "中影響 × 顕在化 [Active 顕在化]",
    thRiskCategory: "リスク分類",
    thImpact: "重要度 (Impact)",
    thProbability: "発生確率 (Likelihood)",
    thEwi: "早期警戒指標 (EWI)",
    thDocument: "確認すべき開示資料",
    thAuditStatus: "監査ステータス",
    auditCompleted: "✅ 検証完了",
    auditPending: "🔍 要確認",

    // Modal
    modalTitle: "Gemini API & Model Settings",
    modalDesc: "Google Gemini APIキーと推論モデルを設定します。APIキーはブラウザ内（localStorage）に安全に保持され、外部ファイルやサーバーのログ・Gitには一切保存されません。",
    lblModelSelect: "Gemini 推論モデル:",
    lblCustomModel: "カスタムモデル識別子:",
    lblApiKey: "Gemini API キー (AI Studio):",
    btnSaveSettings: "Save Settings",

    // History & Audit Trail Archive
    historyBtnLabel: "履歴",
    historyModalTitle: "📜 投資調査履歴 & 監査アーカイブ",
    historyModalSubtitle: "いつ・何のデータソース・どのモデル/スキルで分析したかを完全記録",
    historySearchPlaceholder: "企業名・ティッカー・日付で絞り込み...",
    historyEmpty: "調査履歴がありません。「Run ReAct」を実行すると、調査日時・データソース・モデル・全分析結果が自動的にここに保存されます。",
    historyLoadBtn: "⚡ 調査結果を復元",
    historyDeleteBtn: "🗑️ 削除",
    historyExportAll: "📥 全履歴エクスポート (JSON)",
    historyClearAll: "🗑️ 全件クリア",
    historyClearConfirm: "保存されたすべての調査履歴を削除しますか？この操作は取り消せません。",
    historyBannerNotice: "📂 過去の調査アーカイブを表示中",
    historyBannerRerun: "⚡ 最新情報で再調査",
    historyExportSingleBtn: "JSON保存",

    // Live Analyzing Overlay
    analyzingBadge: "AUTONOMOUS ReAct AGENT RUNNING",
    analyzingTargetPrefix: "調査対象企業:",
    analyzingStepPrefix: "現在ステップ:",
    analyzingFeedLabel: "Live Execution Status",
    analyzingSourcesTitle: "📡 照会データソース & 実行スキル:"
  },

  en: {
    langName: "English (US)",
    flag: "🇺🇸",
    appName: "FinReAct",
    appSubtitle: "Autonomous Corporate Finance Intelligence Dashboard Powered by Gemini",
    presetsLabel: "Presets:",
    searchPlaceholder: "Enter company name or ticker (e.g. Lenovo, Apple, Toyota)...",
    runReActBtn: "Run ReAct",
    agentReady: "AGENT READY",
    agentReasoning: "REASONING & ACTING...",
    agentCompleted: "AGENT COMPLETED",
    settingsTitle: "Gemini API Settings",
    streamTitle: "ReAct Execution Stream",
    stepLabel: "Step",
    clearStreamTitle: "Clear Stream",
    collapseStreamTitle: "Collapse Stream (Expand Viewport)",
    collapseStreamBtn: "◀ Collapse",
    expandStreamTitle: "Expand Stream",
    uncollapsePillText: "🧠 Stream (Step 5/5) ❯",
    welcomeTitle: "Autonomous ReAct Analyst Ready",
    welcomeDesc: "Click 'Run ReAct' to launch Gemini's autonomous Reasoning + Acting + Observation cycle to analyze 3-statement financials, DuPont decomposition, peer benchmarking, and early warning risks in real time.",
    welcomeStep1: "1. Retrieve Primary Statutory Filings",
    welcomeStep2: "2. Deterministic Ratios & DuPont Calc",
    welcomeStep3: "3. Multi-Metric Peer Benchmarking",
    welcomeStep4: "4. Early Warning Risk Heatmap Matrix",
    welcomeStep5: "5. Synthesize Standard A〜H Dossier",

    // KPI Cards
    healthScoreTitle: "FINANCIAL HEALTH",
    healthScoreDesc: "Strong Investment Grade Solvency",
    kpiRevenueLabel: "LATEST REVENUE (TOP-LINE)",
    kpiRevenueFooter: "AI Infrastructure & AI PC Momentum",
    kpiOpmLabel: "OPERATING MARGIN (EBIT)",
    kpiOpmFooter: "ISG Turnaround & SSG Expansion",
    kpiRoeLabel: "ROE (RETURN ON EQUITY)",
    kpiRoeBadge: "High Efficiency",
    kpiRoeFooter: "Asset Turnover & Leverage Driven",
    kpiRoicLabel: "ROIC (vs WACC SPREAD)",
    kpiRoicFooter: "Economic Value Added (EVA) Positive",
    kpiCccLabel: "CASH CONVERSION CYCLE (CCC)",
    kpiCccBadge: "Near-Zero / Negative",
    kpiCccFooter: "Negative Working Capital Business Model",
    kpiNetDebtLabel: "NET DEBT / EBITDA (LEVERAGE)",
    kpiNetDebtBadge: "Safe (<2.0x)",
    kpiNetDebtFooter: "Robust Balance Sheet & Cash Cushion",

    // Tabs
    tabOverview: "📊 Overview & Charts",
    tabReport: "📑 Institutional Report (A〜H)",
    tabBenchmark: "⚔️ Peer Benchmark Matrix",
    tabRisks: "🛡️ Risks & Early Warning (EWI)",

    // Unified Export
    exportBtnLabel: "Export Dossier",
    exportMenuHeader: "INVESTMENT DOSSIER EXPORTS",
    optFullPdfName: "Full Dossier (PDF)",
    optFullPdfBadge: "Recommended",
    optFullPdfDesc: "Reasoning logs, 3-statements, DuPont, peers, risks, and complete report",
    optExecPdfName: "Institutional Report (PDF)",
    optExecPdfDesc: "Standard A〜H executive publication ready for print & distribution",
    optMdName: "Integrated Markdown (.md)",
    optMdDesc: "Consolidated research report with all tables & quantitative datasets",
    optJsonName: "Raw Financial Dataset (.json)",
    optJsonDesc: "Structured machine-readable JSON schema for API modeling",
    optCopyName: "Copy Markdown to Clipboard",
    optCopyDesc: "Instantly copy full markdown text to clipboard",

    // Tab 1 DuPont & CCC
    chartTrajectoryTitle: "Multi-Year Financial Trajectory (Revenue & Profitability)",
    chartTrajectorySub: "Reported Currency in Millions",
    chartDatasetRevenue: "Revenue (Gross Turnover)",
    chartDatasetOperatingProfit: "Operating Profit (EBIT)",
    chartDatasetNetProfit: "Net Income (Bottom Line)",
    chartDatasetOperatingCF: "Operating Cash Flow (OCF)",
    chartDatasetFCF: "Free Cash Flow (FCF)",
    chartCashFlowTitle: "Cash Generation & FCF Quality",
    chartCashFlowSub: "Operating CF vs Capex vs Free Cash Flow",
    dupontTitle: "3-Stage DuPont Decomposition",
    dupontBadge: "ROE = Net Margin × Asset Turnover × Equity Multiplier",
    dupontRoeTitle: "ROE (Return on Equity)",
    dupontMarginTitle: "① Net Margin (Profitability)",
    dupontMarginDesc: "Net Income / Revenue (High-Volume)",
    dupontTurnoverTitle: "② Asset Turnover (Efficiency)",
    dupontTurnoverDesc: "Revenue / Total Assets (Speed)",
    dupontLeverageTitle: "③ Equity Multiplier (Capital)",
    dupontLeverageDesc: "Total Assets / Equity (Gearing)",
    dupontDriverCallout: "★ Primary Driver (Leverage 6.4x)",
    cccCycleTitle: "Working Capital Cycle (CCC Breakdown)",
    cccBadge: "CCC = DSO + DIO − DPO (Receivables + Inventory − Payables)",
    cccDsoLabel: "Days Sales Outstanding (DSO)",
    cccDioLabel: "Days Inventory Outstanding (DIO)",
    cccDpoLabel: "Days Payable Outstanding (DPO)",
    cccResultLabel: "Cash Conversion Cycle (CCC)",
    cccBarDso: "Receivables DSO",
    cccBarDio: "Inventory DIO",
    cccBarDpo: "Payables DPO (Supplier Terms)",
    cccCaption: "Working Capital Dynamics: Long supplier payment terms (DPO) absorb receivables and inventory lockup, creating a self-financing negative working capital model without operating debt.",

    // Tab 2 TOC Chips
    tocTitle: "📑 Quick Jump:",
    tocA: "A. Exec Summary",
    tocB: "B. Business Profile",
    tocC: "C. Trajectory",
    tocD: "D. 20 Ratios",
    tocE: "E. Capital Efficiency",
    tocF: "F. Peer Benchmark",
    tocG: "G. Risks & EWI",
    tocH: "H. Strategic Notes",
    copyReportBtn: "📋 Copy Markdown",
    quickPdfBtn: "📄 Quick PDF",
    downloadMdBtn: "📥 Download .md",

    // Tab 3 Benchmark
    bmHeroShareTitle: "PC Global Market Share",
    bmHeroShareSub: "Lenovo holds #1 position / HP(20%) Dell(17%)",
    bmHeroOpmTitle: "Operating Margin (OPM)",
    bmHeroOpmSub: "Dell(8.8%) & HP(8.0%) US peers exhibit higher margins",
    bmHeroDebtTitle: "Net Debt / EBITDA",
    bmHeroDebtSub: "Robust solvency compared to Dell(1.2x) & HP(1.8x)",
    bmHeroCccTitle: "Cash Conversion Cycle (CCC)",
    bmHeroCccSub: "All three peers maintain highly lean working capital",
    bmThMetric: "Metric / Category",
    bmThImplication: "Industry Implications",

    // Tab 4 Risks
    riskMatrixTitle: "Early Warning Risk Heatmap Matrix (2×2 Impact × Likelihood Grid)",
    riskMatrixSubtitle: "Financial Impact (Y-Axis) × Probability of Occurrence (X-Axis)",
    axisImpact: "Financial Impact ▲",
    axisLikelihood: "Likelihood ► [Moderate ──────► Critical / Realized]",
    quadCritical: "High Impact × High Likelihood [Critical]",
    quadSevere: "High Impact × Med Likelihood [Severe]",
    quadModerate: "Med Impact × Low/Med Likelihood [Moderate]",
    quadActive: "Med Impact × Realized [Active]",
    thRiskCategory: "Risk Category",
    thImpact: "Severity (Impact)",
    thProbability: "Likelihood",
    thEwi: "Early Warning Indicator (EWI)",
    thDocument: "Statutory Filing Reference",
    thAuditStatus: "Audit Status",
    auditCompleted: "✅ Verified",
    auditPending: "🔍 Needs Review",

    // Modal
    modalTitle: "Gemini API & Model Settings",
    modalDesc: "Configure your Google Gemini API key and active model. The key is securely held inside client-side localStorage and is never transmitted to logs, files, or Git repositories.",
    lblModelSelect: "Gemini Model:",
    lblCustomModel: "Custom Model Identifier:",
    lblApiKey: "Gemini API Key (Google AI Studio):",
    btnSaveSettings: "Save Settings",

    // History & Audit Trail Archive
    historyBtnLabel: "History",
    historyModalTitle: "📜 Research History & Audit Trail",
    historyModalSubtitle: "Complete audit trail tracking when, with what data sources, and which models were executed.",
    historySearchPlaceholder: "Filter by company, ticker, date...",
    historyEmpty: "No research history found. Run an analysis to automatically record sessions with timestamps and data sources.",
    historyLoadBtn: "⚡ Restore / View",
    historyDeleteBtn: "🗑️ Delete",
    historyExportAll: "📥 Export All (JSON)",
    historyClearAll: "🗑️ Clear All",
    historyClearConfirm: "Are you sure you want to delete all stored research history records?",
    historyBannerNotice: "📂 Viewing Historical Research Archive",
    historyBannerRerun: "⚡ Re-run Live Analysis",
    historyExportSingleBtn: "Save JSON",

    // Live Analyzing Overlay
    analyzingBadge: "AUTONOMOUS ReAct AGENT RUNNING",
    analyzingTargetPrefix: "Target Entity:",
    analyzingStepPrefix: "Current Step:",
    analyzingFeedLabel: "Live Execution Status",
    analyzingSourcesTitle: "📡 Scanned Data Sources & Skills:"
  },

  "zh-CN": {
    langName: "简体中文",
    flag: "🇨🇳",
    appName: "FinReAct",
    appSubtitle: "基于 Gemini 的企业财务自律智能分析平台",
    presetsLabel: "预置标的:",
    searchPlaceholder: "输入公司名称或股票代码 (如: Lenovo, 联想, 苹果, 丰田)...",
    runReActBtn: "启动分析",
    agentReady: "智能体就绪",
    agentReasoning: "自主推理与数据调取中...",
    agentCompleted: "分析已完成",
    settingsTitle: "Gemini API 设置",
    streamTitle: "ReAct 实时推理解析流",
    stepLabel: "步骤",
    clearStreamTitle: "清除推论文档",
    collapseStreamTitle: "折叠侧边栏 (最大化分析画布)",
    collapseStreamBtn: "◀ 折叠",
    expandStreamTitle: "展开推论文档",
    uncollapsePillText: "🧠 推理流 (步骤 5/5) ❯",
    welcomeTitle: "自律型财务分析智能体已就绪",
    welcomeDesc: "点击“启动分析”，Gemini 将通过思考 (Thought) → 行动 (Action) → 观测 (Observation) 自主循环，深度解析企业财务三表、杜邦分析、同业对标及风险矩阵。",
    welcomeStep1: "1. 调取官方财报与披露文件",
    welcomeStep2: "2. 确定性财务指标与杜邦分解",
    welcomeStep3: "3. 行业同业多维基准对标",
    welcomeStep4: "4. 早期预警指标与风险矩阵",
    welcomeStep5: "5. 整合输出 A〜H 机构级研报",

    // KPI Cards
    healthScoreTitle: "财务健康评级",
    healthScoreDesc: "强投资级偿债能力 (Strong Investment Grade)",
    kpiRevenueLabel: "最新营业收入 (LATEST REVENUE)",
    kpiRevenueFooter: "AI 服务器与 AI PC 强劲增势",
    kpiOpmLabel: "营业利润率 (OPERATING MARGIN)",
    kpiOpmFooter: "ISG 扭亏为盈与 SSG 高利润服务拓展",
    kpiRoeLabel: "净资产收益率 (ROE - 杜邦分解)",
    kpiRoeBadge: "高资本效率",
    kpiRoeFooter: "总资产周转率与权益乘数主导",
    kpiRoicLabel: "投入资本回报率 (ROIC vs WACC)",
    kpiRoicFooter: "超额经济价值 (EVA) 持续创造",
    kpiCccLabel: "现金循环周期 (CASH CONVERSION CCC)",
    kpiCccBadge: "极低/负营运资本",
    kpiCccFooter: "自主融资型 (负营运资本) 商业模式",
    kpiNetDebtLabel: "净有息负债倍率 (NET DEBT / EBITDA)",
    kpiNetDebtBadge: "安全稳健 (<2.0x)",
    kpiNetDebtFooter: "充沛偿债能力与现金缓冲",

    // Tabs
    tabOverview: "📊 财务全景与图表",
    tabReport: "📑 机构级研究报告 (A〜H)",
    tabBenchmark: "⚔️ 行业同业对标",
    tabRisks: "🛡️ 风险矩阵与早期预警",

    // Unified Export
    exportBtnLabel: "导出研报包",
    exportMenuHeader: "INVESTMENT DOSSIER EXPORTS",
    optFullPdfName: "完整研究档案 (PDF)",
    optFullPdfBadge: "推荐",
    optFullPdfDesc: "推理日志、财务报表、杜邦分析、竞品对标、风险评估与完整研报",
    optExecPdfName: "机构高管报告 (PDF)",
    optExecPdfDesc: "遵循 A〜H 标准格式的高管研究报告（打印回览专用）",
    optMdName: "整合 Markdown (.md)",
    optMdDesc: "包含全量定性分析与定量表格的 Markdown 文件",
    optJsonName: "结构化财务数据集 (.json)",
    optJsonDesc: "适用于 API 对接及财务量化建模的标准结构化数据",
    optCopyName: "复制 Markdown 文本",
    optCopyDesc: "一键复制完整研报内容至剪贴板",

    // Tab 1 DuPont & CCC
    chartTrajectoryTitle: "多财年财务轨迹 (营收规模与盈利质量)",
    chartTrajectorySub: "以百万报告货币计量",
    chartDatasetRevenue: "营业收入 (Revenue)",
    chartDatasetOperatingProfit: "营业利润 (EBIT)",
    chartDatasetNetProfit: "净利润 (Net Income)",
    chartDatasetOperatingCF: "经营活动现金流 (OCF)",
    chartDatasetFCF: "自由现金流 (FCF)",
    chartCashFlowTitle: "现金生成力与自由现金流 (FCF) 质量",
    chartCashFlowSub: "经营活动现金流 vs 资本开支 vs 自由现金流",
    dupontTitle: "杜邦三阶段归因分解 (3-Stage DuPont Decomposition)",
    dupontBadge: "ROE = 销售净利率 × 总资产周转率 × 权益乘数",
    dupontRoeTitle: "ROE (净资产收益率)",
    dupontMarginTitle: "① 销售净利率 (盈利能力)",
    dupontMarginDesc: "净利润 / 营业收入 (薄利多销)",
    dupontTurnoverTitle: "② 总资产周转率 (营运效率)",
    dupontTurnoverDesc: "营业收入 / 总资产 (资产周转速度)",
    dupontLeverageTitle: "③ 权益乘数 (资本结构与杠杆)",
    dupontLeverageDesc: "总资产 / 所有者权益 (杠杆利用)",
    dupontDriverCallout: "★ 核心驱动力 (权益乘数 6.4x)",
    cccCycleTitle: "营运资本周期 (CCC 循环分解)",
    cccBadge: "CCC = DSO + DIO − DPO (应收账期 + 存货天数 − 应付账期)",
    cccDsoLabel: "应收账款周转天数 (DSO)",
    cccDioLabel: "存货周转天数 (DIO)",
    cccDpoLabel: "应付账款周转天数 (DPO)",
    cccResultLabel: "现金循环周期 (CCC)",
    cccBarDso: "应收账款 DSO",
    cccBarDio: "存货周转 DIO",
    cccBarDpo: "应付供应商 DPO (长期信用账期)",
    cccCaption: "营运资本动力学: 上游供应商给予的长期信用账期 (DPO) 充分抵消了应收款与存货的资金沉淀，构成了无需追加外部营运借款的自主融资型 (负营运资本) 商业模式。",

    // Tab 2 TOC Chips
    tocTitle: "📑 章节跳转:",
    tocA: "A. 执行摘要",
    tocB: "B. 业务概览",
    tocC: "C. 财务轨迹",
    tocD: "D. 20项指标",
    tocE: "E. 资本效率",
    tocF: "F. 同业对标",
    tocG: "G. 风险矩阵",
    tocH: "H. 战略建议",
    copyReportBtn: "📋 复制研报文本",
    quickPdfBtn: "📄 快速 PDF",
    downloadMdBtn: "📥 下载 .md",

    // Tab 3 Benchmark
    bmHeroShareTitle: "PC 业务全球市场份额",
    bmHeroShareSub: "联想蝉联全球第一 (24%) / 惠普 (20%) / 戴尔 (17%)",
    bmHeroOpmTitle: "营业利润率 (OPM)",
    bmHeroOpmSub: "戴尔 (8.8%) 与惠普 (8.0%) 美系厂商利润率更高",
    bmHeroDebtTitle: "净有息负债倍率",
    bmHeroDebtSub: "相较戴尔 (1.2x) 与惠普 (1.8x)，资产负债表更显稳健",
    bmHeroCccTitle: "现金循环周期 (CCC)",
    bmHeroCccSub: "三家龙头均保持极高周转的负营运资本运作",
    bmThMetric: "对标指标 / 业务维度",
    bmThImplication: "行业研判与财务洞见",

    // Tab 4 Risks
    riskMatrixTitle: "早期风险预警热力矩阵 (2×2 财务影响度 × 发生概率)",
    riskMatrixSubtitle: "纵轴: 财务潜在影响度 (Impact) × 横轴: 发生概率 (Likelihood)",
    axisImpact: "财务影响度 (Impact) ▲",
    axisLikelihood: "发生概率 (Likelihood) ► [中概率 ──────► 极高概率 / 已发生]",
    quadCritical: "高影响 × 高概率 [最警戒·Critical]",
    quadSevere: "高影响 × 中概率 [重大风险·Severe]",
    quadModerate: "中影响 × 中低概率 [日常监控·Moderate]",
    quadActive: "中影响 × 已显在化 [已发生·Active]",
    thRiskCategory: "风险分类",
    thImpact: "影响程度 (Impact)",
    thProbability: "发生概率",
    thEwi: "早期预警指标 (EWI)",
    thDocument: "重点核查官方披露",
    thAuditStatus: "核验状态",
    auditCompleted: "✅ 核验完成",
    auditPending: "🔍 需关注",

    // Modal
    modalTitle: "Gemini API 与模型设置",
    modalDesc: "配置您的 Google Gemini API Key 与默认调用模型。密钥仅保存在当前浏览器的 localStorage 中，绝不会被记录在外部服务器或提交到 Git 仓库。",
    lblModelSelect: "Gemini 推理模型:",
    lblCustomModel: "自定义模型标识符:",
    lblApiKey: "Gemini API 密钥 (Google AI Studio):",
    btnSaveSettings: "保存设置",

    // History & Audit Trail Archive
    historyBtnLabel: "历史记录",
    historyModalTitle: "📜 投资调研历史与审计回溯",
    historyModalSubtitle: "完整记录调研时间戳、法定数据来源、模型与执行技能，支持一键复原复盘",
    historySearchPlaceholder: "按企业名、代码或日期筛选...",
    historyEmpty: "暂无调研历史记录。执行“启动分析”后，所有时间戳、数据源及分析结果将自动归档。",
    historyLoadBtn: "⚡ 恢复查看",
    historyDeleteBtn: "🗑️ 删除",
    historyExportAll: "📥 导出全部 (JSON)",
    historyClearAll: "🗑️ 清空历史",
    historyClearConfirm: "确定要清空所有已保存的投研历史记录吗？此操作无法撤销。",
    historyBannerNotice: "📂 正在查看历史调研存档",
    historyBannerRerun: "⚡ 重新发起实时调研",
    historyExportSingleBtn: "保存JSON",

    // Live Analyzing Overlay
    analyzingBadge: "自律型 ReAct 推理执行中...",
    analyzingTargetPrefix: "调查目标企业:",
    analyzingStepPrefix: "当前分析阶段:",
    analyzingFeedLabel: "实时执行状态",
    analyzingSourcesTitle: "📡 调取数据源与技能:"
  },

  "zh-TW": {
    langName: "繁體中文",
    flag: "🇭🇰",
    appName: "FinReAct",
    appSubtitle: "基於 Gemini 的企業財務自律智能分析平台",
    presetsLabel: "預設標的:",
    searchPlaceholder: "輸入公司名稱或股票代碼 (如: Lenovo, 聯想, 蘋果, 豐田)...",
    runReActBtn: "啟動分析",
    agentReady: "智能體就緒",
    agentReasoning: "自主推理與數據調取中...",
    agentCompleted: "分析已完成",
    settingsTitle: "Gemini API 設置",
    streamTitle: "ReAct 實時推理解析流",
    stepLabel: "步驟",
    clearStreamTitle: "清除推論文檔",
    collapseStreamTitle: "折疊側邊欄 (最大化分析畫布)",
    collapseStreamBtn: "◀ 折疊",
    expandStreamTitle: "展開推論文檔",
    uncollapsePillText: "🧠 推理流 (步驟 5/5) ❯",
    welcomeTitle: "自律型財務分析智能體已就緒",
    welcomeDesc: "點擊“啟動分析”，Gemini 將通過思考 (Thought) → 行動 (Action) → 觀測 (Observation) 自主循環，深度解析企業財務三表、杜邦分析、同業對標及風險矩陣。",
    welcomeStep1: "1. 調取官方財報與披露文件",
    welcomeStep2: "2. 確定性財務指標與杜邦分解",
    welcomeStep3: "3. 行業同業多維基準對標",
    welcomeStep4: "4. 早期預警指標與風險矩陣",
    welcomeStep5: "5. 整合輸出 A〜H 機構級研報",

    // KPI Cards
    healthScoreTitle: "財務健康評級",
    healthScoreDesc: "強投資級償債能力 (Strong Investment Grade)",
    kpiRevenueLabel: "最新營業收入 (LATEST REVENUE)",
    kpiRevenueFooter: "AI 伺服器與 AI PC 強勁增勢",
    kpiOpmLabel: "營業利益率 (OPERATING MARGIN)",
    kpiOpmFooter: "ISG 轉虧為盈與 SSG 高利潤服務拓展",
    kpiRoeLabel: "股東權益報酬率 (ROE - 杜邦分解)",
    kpiRoeBadge: "高資本效率",
    kpiRoeFooter: "總資產週轉率與權益乘數主導",
    kpiRoicLabel: "投入資本回報率 (ROIC vs WACC)",
    kpiRoicFooter: "超額經濟價值 (EVA) 持續創造",
    kpiCccLabel: "現金循環週期 (CASH CONVERSION CCC)",
    kpiCccBadge: "極低/負營運資金",
    kpiCccFooter: "自我融資型 (負營運資金) 商業模式",
    kpiNetDebtLabel: "淨有息負債倍率 (NET DEBT / EBITDA)",
    kpiNetDebtBadge: "安全穩健 (<2.0x)",
    kpiNetDebtFooter: "充沛償債能力與現金緩衝",

    // Tabs
    tabOverview: "📊 財務全景與圖表",
    tabReport: "📑 機構級研究報告 (A〜H)",
    tabBenchmark: "⚔️ 行業同業對標",
    tabRisks: "🛡️ 風險矩陣與早期預警",

    // Unified Export
    exportBtnLabel: "導出研報包",
    exportMenuHeader: "INVESTMENT DOSSIER EXPORTS",
    optFullPdfName: "完整研究檔案 (PDF)",
    optFullPdfBadge: "推薦",
    optFullPdfDesc: "推理日誌、財務報表、杜邦分析、競品對標、風險評估與完整研報",
    optExecPdfName: "機構高管報告 (PDF)",
    optExecPdfDesc: "遵循 A〜H 標準格式的高管研究報告（列印回覽專用）",
    optMdName: "整合 Markdown (.md)",
    optMdDesc: "包含全量定性分析與定量表格的 Markdown 文件",
    optJsonName: "結構化財務數據集 (.json)",
    optJsonDesc: "適用於 API 對接及財務量化建模的標準結構化數據",
    optCopyName: "複製 Markdown 文本",
    optCopyDesc: "一鍵複製完整研報內容至剪貼板",

    // Tab 1 DuPont & CCC
    chartTrajectoryTitle: "多財年財務軌跡 (營收規模與獲利品質)",
    chartTrajectorySub: "以百萬報告貨幣計量",
    chartDatasetRevenue: "營業收入 (Revenue)",
    chartDatasetOperatingProfit: "營業利益 (EBIT)",
    chartDatasetNetProfit: "淨利潤 (Net Income)",
    chartDatasetOperatingCF: "營運活動現金流 (OCF)",
    chartDatasetFCF: "自由現金流 (FCF)",
    chartCashFlowTitle: "現金生成力與自由現金流 (FCF) 品質",
    chartCashFlowSub: "營運活動現金流 vs 資本支出 vs 自由現金流",
    dupontTitle: "杜邦三階段歸因分解 (3-Stage DuPont Decomposition)",
    dupontBadge: "ROE = 銷售淨利率 × 總資產週轉率 × 權益乘數",
    dupontRoeTitle: "ROE (股東權益報酬率)",
    dupontMarginTitle: "① 銷售淨利率 (獲利能力)",
    dupontMarginDesc: "淨利潤 / 營業收入 (薄利多銷)",
    dupontTurnoverTitle: "② 總資產週轉率 (營運效率)",
    dupontTurnoverDesc: "營業收入 / 總資產 (資產週轉速度)",
    dupontLeverageTitle: "③ 權益乘數 (資本結構與槓桿)",
    dupontLeverageDesc: "總資產 / 股東權益 (槓桿利用)",
    dupontDriverCallout: "★ 核心驅動力 (權益乘數 6.4x)",
    cccCycleTitle: "營運資金週期 (CCC 循環分解)",
    cccBadge: "CCC = DSO + DIO − DPO (應收賬期 + 存貨天數 − 應付賬期)",
    cccDsoLabel: "應收賬款週轉天數 (DSO)",
    cccDioLabel: "存貨週轉天數 (DIO)",
    cccDpoLabel: "應付賬款週轉天數 (DPO)",
    cccResultLabel: "現金循環週期 (CCC)",
    cccBarDso: "應收賬款 DSO",
    cccBarDio: "存貨週轉 DIO",
    cccBarDpo: "應付供應商 DPO (長期信用賬期)",
    cccCaption: "營運資金動力學: 上游供應商給予的長期信用賬期 (DPO) 充分抵消了應收款與存貨的資金沉澱，構成了無需追加外部營運借款的自我融資型 (負營運資金) 商業模式。",

    // Tab 2 TOC Chips
    tocTitle: "📑 章節跳轉:",
    tocA: "A. 執行摘要",
    tocB: "B. 業務概覽",
    tocC: "C. 財務軌跡",
    tocD: "D. 20項指標",
    tocE: "E. 資本效率",
    tocF: "F. 同業對標",
    tocG: "G. 風險矩陣",
    tocH: "H. 戰略建議",
    copyReportBtn: "📋 複製研報文本",
    quickPdfBtn: "📄 快速 PDF",
    downloadMdBtn: "📥 下載 .md",

    // Tab 3 Benchmark
    bmHeroShareTitle: "PC 業務全球市場份額",
    bmHeroShareSub: "聯想蟬聯全球第一 (24%) / 惠普 (20%) / 戴爾 (17%)",
    bmHeroOpmTitle: "營業利益率 (OPM)",
    bmHeroOpmSub: "戴爾 (8.8%) 與惠普 (8.0%) 美系廠商利潤率更高",
    bmHeroDebtTitle: "淨有息負債倍率",
    bmHeroDebtSub: "相較戴爾 (1.2x) 與惠普 (1.8x)，資產負債表更顯穩健",
    bmHeroCccTitle: "現金循環週期 (CCC)",
    bmHeroCccSub: "三家龍頭均保持極高週轉的負營運資金運作",
    bmThMetric: "對標指標 / 業務維度",
    bmThImplication: "行業研判與財務洞見",

    // Tab 4 Risks
    riskMatrixTitle: "早期風險預警熱力矩陣 (2×2 財務影響度 × 發生機率)",
    riskMatrixSubtitle: "縱軸: 財務潛在影響度 (Impact) × 橫軸: 發生機率 (Likelihood)",
    axisImpact: "財務影響度 (Impact) ▲",
    axisLikelihood: "發生機率 (Likelihood) ► [中機率 ──────► 極高機率 / 已發生]",
    quadCritical: "高影響 × 高機率 [最警戒·Critical]",
    quadSevere: "高影響 × 中機率 [重大風險·Severe]",
    quadModerate: "中影響 × 中低機率 [日常監控·Moderate]",
    quadActive: "中影響 × 已顯在化 [已發生·Active]",
    thRiskCategory: "風險分類",
    thImpact: "影響程度 (Impact)",
    thProbability: "發生機率",
    thEwi: "早期預警指標 (EWI)",
    thDocument: "重點核查官方披露",
    thAuditStatus: "核驗狀態",
    auditCompleted: "✅ 核驗完成",
    auditPending: "🔍 需關注",

    // Modal
    modalTitle: "Gemini API 與模型設置",
    modalDesc: "配置您的 Google Gemini API Key 與默認調用模型。密鑰僅保存在當前瀏覽器的 localStorage 中，絕不會被記錄在外部伺服器或提交到 Git 倉庫。",
    lblModelSelect: "Gemini 推理模型:",
    lblCustomModel: "自定義模型標識符:",
    lblApiKey: "Gemini API 密鑰 (Google AI Studio):",
    btnSaveSettings: "保存設置",

    // History & Audit Trail Archive
    historyBtnLabel: "歷史記錄",
    historyModalTitle: "📜 投資調研歷史與審計回溯",
    historyModalSubtitle: "完整記錄調研時間戳、法定數據來源、模型與執行技能，支持一鍵復原複盤",
    historySearchPlaceholder: "按企業名、代碼或日期篩選...",
    historyEmpty: "暫無調研歷史記錄。執行“啟動分析”後，所有時間戳、數據源及分析結果將自動歸檔。",
    historyLoadBtn: "⚡ 恢復查看",
    historyDeleteBtn: "🗑️ 刪除",
    historyExportAll: "📥 匯出全部 (JSON)",
    historyClearAll: "🗑️ 清空歷史",
    historyClearConfirm: "確定要清空所有已保存的投研歷史記錄嗎？此操作無法撤銷。",
    historyBannerNotice: "📂 正在查看歷史調研存檔",
    historyBannerRerun: "⚡ 重新發起即時調研",
    historyExportSingleBtn: "保存JSON",

    // Live Analyzing Overlay
    analyzingBadge: "自律型 ReAct 推理執行中...",
    analyzingTargetPrefix: "調查目標企業:",
    analyzingStepPrefix: "當前分析階段:",
    analyzingFeedLabel: "即時執行狀態",
    analyzingSourcesTitle: "📡 調取數據源與技能:"
  },

  fr: {
    langName: "Français",
    flag: "🇫🇷",
    appName: "FinReAct",
    appSubtitle: "Tableau de Bord Financier Autonome Propulsé par Gemini",
    presetsLabel: "Entreprises:",
    searchPlaceholder: "Nom d'entreprise ou ticker (ex: Lenovo, Apple, Toyota)...",
    runReActBtn: "Lancer ReAct",
    agentReady: "AGENT PRÊT",
    agentReasoning: "RAISONNEMENT & ACTION EN COURS...",
    agentCompleted: "ANALYSE TERMINÉE",
    settingsTitle: "Paramètres API Gemini",
    streamTitle: "Flux d'Exécution ReAct",
    stepLabel: "Étape",
    clearStreamTitle: "Effacer le flux",
    collapseStreamTitle: "Réduire le volet (Maximiser l'affichage)",
    collapseStreamBtn: "◀ Réduire",
    expandStreamTitle: "Développer le volet",
    uncollapsePillText: "🧠 Flux ReAct (Étape 5/5) ❯",
    welcomeTitle: "Analyste Financier ReAct Prêt",
    welcomeDesc: "Cliquez sur 'Lancer ReAct' pour démarrer le cycle autonome Raisonnement + Action + Observation de Gemini afin d'analyser les états financiers, la décomposition DuPont, le benchmark et les risques.",
    welcomeStep1: "1. Extraction des déclarations réglementaires",
    welcomeStep2: "2. Calcul déterministe des ratios & DuPont",
    welcomeStep3: "3. Benchmark concurrentiel sectoriel",
    welcomeStep4: "4. Matrice d'alerte précoce des risques",
    welcomeStep5: "5. Synthèse du rapport institutionnel A〜H",

    // KPI Cards
    healthScoreTitle: "SANTÉ FINANCIÈRE",
    healthScoreDesc: "Qualité de Crédit Investment Grade",
    kpiRevenueLabel: "CHIFFRE D'AFFAIRES RÉCENT (REVENU)",
    kpiRevenueFooter: "Forte dynamique Serveurs IA & PC IA",
    kpiOpmLabel: "MARGE OPÉRATIONNELLE (EBIT)",
    kpiOpmFooter: "Redressement ISG & Expansion des Services SSG",
    kpiRoeLabel: "RENTABILITÉ DES CAPITAUX (ROE)",
    kpiRoeBadge: "Haute Efficience",
    kpiRoeFooter: "Portée par la rotation de l'actif & le levier",
    kpiRoicLabel: "RENTABILITÉ DU CAPITAL (ROIC vs CMPC)",
    kpiRoicFooter: "Création de Valeur Économique (EVA) Positive",
    kpiCccLabel: "CYCLE CONVERSION TRÉSORERIE (CCC)",
    kpiCccBadge: "Quasi-nul / Négatif",
    kpiCccFooter: "Modèle BFR Négatif (Auto-financement)",
    kpiNetDebtLabel: "DETTE NETTE / EBITDA (LEVIER)",
    kpiNetDebtBadge: "Zone Sûre (<2.0x)",
    kpiNetDebtFooter: "Solidité Financière & Coussin de Trésorerie",

    // Tabs
    tabOverview: "📊 Synthèse & Trajectoire",
    tabReport: "📑 Rapport Institutionnel (A〜H)",
    tabBenchmark: "⚔️ Benchmark Concurrentiel",
    tabRisks: "🛡️ Risques & Alertes Précoces (EWI)",

    // Unified Export
    exportBtnLabel: "Exporter le Dossier",
    exportMenuHeader: "INVESTMENT DOSSIER EXPORTS",
    optFullPdfName: "Dossier Complet (PDF)",
    optFullPdfBadge: "Recommandé",
    optFullPdfDesc: "Journal de raisonnement, états financiers, DuPont, pairs, matrice de risques",
    optExecPdfName: "Rapport Institutionnel (PDF)",
    optExecPdfDesc: "Rapport de direction A〜H standardisé prêt pour diffusion",
    optMdName: "Markdown Intégré (.md)",
    optMdDesc: "Fichier Markdown consolidé avec ensemble des données quantitatives",
    optJsonName: "Données Financières Brutes (.json)",
    optJsonDesc: "Schéma JSON structuré pour intégration API et modélisation",
    optCopyName: "Copier le Markdown",
    optCopyDesc: "Copier instantanément le texte Markdown dans le presse-papier",

    // Tab 1 DuPont & CCC
    chartTrajectoryTitle: "Trajectoire Financière Pluriannuelle (Chiffre d'Affaires & Marge)",
    chartTrajectorySub: "Devise publiée en millions",
    chartDatasetRevenue: "Chiffre d'Affaires (Revenue)",
    chartDatasetOperatingProfit: "Résultat d'Exploitation (EBIT)",
    chartDatasetNetProfit: "Résultat Net (Net Income)",
    chartDatasetOperatingCF: "Flux de Trésorerie d'Exploitation (OCF)",
    chartDatasetFCF: "Flux de Trésorerie Disponible (FCF)",
    chartCashFlowTitle: "Génération de Trésorerie & Qualité du FCF",
    chartCashFlowSub: "Cash Flow Opérationnel vs Capex vs Flux de Trésorerie Disponible",
    dupontTitle: "Décomposition de DuPont en 3 Étapes",
    dupontBadge: "ROE = Marge Nette × Rotation des Actifs × Levier Financier",
    dupontRoeTitle: "ROE (Capitaux Propres)",
    dupontMarginTitle: "① Marge Nette (Rentabilité)",
    dupontMarginDesc: "Résultat Net / Chiffre d'Affaires",
    dupontTurnoverTitle: "② Rotation de l'Actif (Efficience)",
    dupontTurnoverDesc: "Chiffre d'Affaires / Total Actif",
    dupontLeverageTitle: "③ Levier Financier (Structure)",
    dupontLeverageDesc: "Total Actif / Capitaux Propres",
    dupontDriverCallout: "★ Facteur Principal (Levier 6.4x)",
    cccCycleTitle: "Cycle du Besoin en Fonds de Roulement (BFR - CCC)",
    cccBadge: "CCC = DSO + DIO − DPO (Créances + Stocks − Fournisseurs)",
    cccDsoLabel: "Délai Recouvrement Clients (DSO)",
    cccDioLabel: "Délai Rotation des Stocks (DIO)",
    cccDpoLabel: "Délai Paiement Fournisseurs (DPO)",
    cccResultLabel: "Cycle de Conversion de Trésorerie (CCC)",
    cccBarDso: "Créances DSO",
    cccBarDio: "Stocks DIO",
    cccBarDpo: "Fournisseurs DPO (Crédit d'exploitation)",
    cccCaption: "Dynamique du BFR: Le délai de paiement prolongé consenti par les fournisseurs (DPO) compense l'immobilisation des stocks et créances clients, assurant un modèle de BFR négatif auto-financé sans dette d'exploitation.",

    // Tab 2 TOC Chips
    tocTitle: "📑 Accès Rapide:",
    tocA: "A. Synthèse",
    tocB: "B. Profil",
    tocC: "C. Historique",
    tocD: "D. 20 Ratios",
    tocE: "E. Efficience",
    tocF: "F. Pairs",
    tocG: "G. Risques",
    tocH: "H. Recommandations",
    copyReportBtn: "📋 Copier Markdown",
    quickPdfBtn: "📄 PDF Rapide",
    downloadMdBtn: "📥 Télécharger .md",

    // Tab 3 Benchmark
    bmHeroShareTitle: "Part de Marché Mondiale PC",
    bmHeroShareSub: "Lenovo maintient la 1re place mondiale / HP (20%) Dell (17%)",
    bmHeroOpmTitle: "Marge d'Exploitation (OPM)",
    bmHeroOpmSub: "Dell (8.8%) et HP (8.0%) affichent des marges plus élevées",
    bmHeroDebtTitle: "Dette Nette / EBITDA",
    bmHeroDebtSub: "Bilan plus solide et sain que Dell (1.2x) et HP (1.8x)",
    bmHeroCccTitle: "Cycle de Trésorerie (CCC)",
    bmHeroCccSub: "Les trois concurrents maintiennent un BFR hautement efficient",
    bmThMetric: "Indicateur / Dimension",
    bmThImplication: "Implications Sectorielles",

    // Tab 4 Risks
    riskMatrixTitle: "Matrice Thermique des Risques & Alertes (Grille 2×2 Impact × Probabilité)",
    riskMatrixSubtitle: "Axe Y: Impact Financier × Axe X: Probabilité d'Occurrence",
    axisImpact: "Impact Financier ▲",
    axisLikelihood: "Probabilité ► [Modérée ──────► Critique / Matérialisée]",
    quadCritical: "Fort Impact × Forte Proba [Critique]",
    quadSevere: "Fort Impact × Proba Moyenne [Sévère]",
    quadModerate: "Impact Modéré × Faible/Moy. Proba [Modéré]",
    quadActive: "Impact Modéré × Déjà Matérialisé [Actif]",
    thRiskCategory: "Catégorie de Risque",
    thImpact: "Sévérité (Impact)",
    thProbability: "Probabilité",
    thEwi: "Indicateur d'Alerte (EWI)",
    thDocument: "Document Réglementaire",
    thAuditStatus: "Statut d'Audit",
    auditCompleted: "✅ Vérifié",
    auditPending: "🔍 À Examiner",

    // Modal
    modalTitle: "Paramètres API Gemini & Modèle",
    modalDesc: "Configurez votre clé API Google Gemini et le modèle actif. La clé est conservée localement dans votre navigateur (localStorage) et n'est jamais enregistrée sur un serveur externe ou dans Git.",
    lblModelSelect: "Modèle Gemini:",
    lblCustomModel: "Identifiant de modèle personnalisé:",
    lblApiKey: "Clé API Gemini (Google AI Studio):",
    btnSaveSettings: "Enregistrer",

    // History & Audit Trail Archive
    historyBtnLabel: "Historique",
    historyModalTitle: "📜 Historique & Traçabilité d'Audit",
    historyModalSubtitle: "Traçabilité complète des dates d'analyse, sources de données et modèles mobilisés.",
    historySearchPlaceholder: "Filtrer par entreprise, symbole, date...",
    historyEmpty: "Aucun historique disponible. Lancez une analyse pour enregistrer automatiquement la session.",
    historyLoadBtn: "⚡ Restaurer / Voir",
    historyDeleteBtn: "🗑️ Supprimer",
    historyExportAll: "📥 Exporter Tout (JSON)",
    historyClearAll: "🗑️ Tout Effacer",
    historyClearConfirm: "Voulez-vous vraiment effacer tout l'historique des analyses enregistrées ?",
    historyBannerNotice: "📂 Affichage d'une archive d'analyse historique",
    historyBannerRerun: "⚡ Relancer l'analyse en direct",
    historyExportSingleBtn: "Export JSON",

    // Live Analyzing Overlay
    analyzingBadge: "MOTEUR ReAct AUTONOME ACTIF...",
    analyzingTargetPrefix: "Entreprise cible:",
    analyzingStepPrefix: "Étape en cours:",
    analyzingFeedLabel: "Statut d'Exécution en Direct",
    analyzingSourcesTitle: "📡 Sources de Données & Compétences:"
  }
};

/**
 * Helper to get active language code ('ja', 'en', 'zh-CN', 'zh-TW', 'fr')
 */
function getCurrentLanguage() {
  const saved = localStorage.getItem('finreact_language');
  if (saved && I18N_DICTIONARY[saved]) {
    return saved;
  }
  const browserLang = (navigator.language || '').toLowerCase();
  if (browserLang.startsWith('zh-tw') || browserLang.startsWith('zh-hk')) return 'zh-TW';
  if (browserLang.startsWith('zh')) return 'zh-CN';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('en')) return 'en';
  return 'ja';
}

/**
 * Get translation string by key
 */
function t(key, lang = null) {
  const activeLang = lang || getCurrentLanguage();
  const dict = I18N_DICTIONARY[activeLang] || I18N_DICTIONARY['ja'];
  return dict[key] !== undefined ? dict[key] : (I18N_DICTIONARY['ja'][key] || key);
}

/**
 * Apply language to DOM elements with data-i18n attributes
 */
function applyLanguage(lang) {
  if (!I18N_DICTIONARY[lang]) lang = 'ja';
  localStorage.setItem('finreact_language', lang);
  document.documentElement.lang = lang;

  const dict = I18N_DICTIONARY[lang];

  // Update text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      el.textContent = dict[key];
    }
  });

  // Update HTML content (for elements containing strong tags or icons)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (dict[key] !== undefined) {
      el.innerHTML = dict[key];
    }
  });

  // Update placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) {
      el.placeholder = dict[key];
    }
  });

  // Update title attributes
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (dict[key] !== undefined) {
      el.title = dict[key];
    }
  });

  // Update Active Language Label in Header
  const activeLangLabel = document.getElementById('activeLangLabel');
  if (activeLangLabel) {
    activeLangLabel.textContent = `${dict.flag} ${dict.langName}`;
  }

  // Update Active state in language dropdown
  document.querySelectorAll('.lang-option-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Trigger custom event so charts or dynamic elements re-render with new language
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang, dict } }));
}
