#!/usr/bin/env python3
"""
Financial Metrics & Ratio Calculator (Deterministic Calculation Utility)
Calculates key corporate finance metrics, DuPont decomposition, working capital cycles,
solvency, cash flow conversion, and valuation multiples.
Designed for financial analysts, corporate planning, and AI skill automation.
Zero external dependencies (uses standard library only).
"""

import sys
import math
import json
import argparse
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict

def safe_div(num: Optional[float], den: Optional[float], default: Optional[float] = None) -> Optional[float]:
    if num is None or den is None or den == 0:
        return default
    return num / den

def calculate_cagr(start_val: float, end_val: float, years: int) -> Optional[float]:
    if start_val <= 0 or end_val <= 0 or years <= 0:
        return None
    return (end_val / start_val) ** (1.0 / years) - 1.0

def calculate_yoy(current: Optional[float], previous: Optional[float]) -> Optional[float]:
    if current is None or previous is None or previous == 0:
        return None
    return (current - previous) / abs(previous)

@dataclass
class FinancialPeriod:
    period_name: str
    revenue: float
    cost_of_sales: float
    operating_profit: float
    net_profit: float
    total_assets: float
    equity: float
    interest_bearing_debt: float
    cash_and_equivalents: float
    operating_cf: float
    capex: float
    current_assets: Optional[float] = None
    current_liabilities: Optional[float] = None
    inventories: Optional[float] = None
    receivables: Optional[float] = None
    payables: Optional[float] = None
    interest_expense: Optional[float] = None
    depreciation_amortization: Optional[float] = None
    dividends_paid: Optional[float] = None
    share_repurchases: Optional[float] = None
    tax_expense: Optional[float] = None
    market_cap: Optional[float] = None

class FinancialAnalyzer:
    def __init__(self, periods: List[FinancialPeriod]):
        self.periods = periods

    def compute_period_metrics(self, p: FinancialPeriod) -> Dict[str, Any]:
        gross_profit = p.revenue - p.cost_of_sales
        gross_margin = safe_div(gross_profit, p.revenue)
        op_margin = safe_div(p.operating_profit, p.revenue)
        net_margin = safe_div(p.net_profit, p.revenue)

        ebitda = None
        ebitda_margin = None
        if p.depreciation_amortization is not None:
            ebitda = p.operating_profit + p.depreciation_amortization
            ebitda_margin = safe_div(ebitda, p.revenue)

        roa = safe_div(p.net_profit, p.total_assets)
        roe = safe_div(p.net_profit, p.equity)
        asset_turnover = safe_div(p.revenue, p.total_assets)
        equity_multiplier = safe_div(p.total_assets, p.equity)

        # 3-Stage DuPont
        dupont_3stage = {
            "net_margin": net_margin,
            "asset_turnover": asset_turnover,
            "equity_multiplier": equity_multiplier,
            "roe_calculated": (net_margin * asset_turnover * equity_multiplier) if (net_margin and asset_turnover and equity_multiplier) else None
        }

        # ROIC
        # NOPAT = Operating Profit * (1 - effective_tax_rate)
        effective_tax_rate = safe_div(p.tax_expense, (p.operating_profit + (p.interest_expense or 0))) if p.tax_expense is not None else 0.30
        if effective_tax_rate is None or effective_tax_rate < 0 or effective_tax_rate > 0.6:
            effective_tax_rate = 0.30
        nopat = p.operating_profit * (1.0 - effective_tax_rate)
        excess_cash = max(0.0, p.cash_and_equivalents - 0.05 * p.revenue)
        invested_capital = max(1.0, (p.equity + p.interest_bearing_debt - excess_cash))
        roic = safe_div(nopat, invested_capital)

        # Working Capital & CCC
        dso = safe_div(p.receivables, p.revenue) * 365.0 if p.receivables is not None else None
        dio = safe_div(p.inventories, p.cost_of_sales) * 365.0 if (p.inventories is not None and p.cost_of_sales > 0) else None
        dpo = safe_div(p.payables, p.cost_of_sales) * 365.0 if (p.payables is not None and p.cost_of_sales > 0) else None
        ccc = (dso + dio - dpo) if (dso is not None and dio is not None and dpo is not None) else None

        nwc = (p.current_assets - p.current_liabilities) if (p.current_assets is not None and p.current_liabilities is not None) else None
        current_ratio = safe_div(p.current_assets, p.current_liabilities)
        quick_assets = (p.cash_and_equivalents + (p.receivables or 0)) if p.receivables is not None else None
        quick_ratio = safe_div(quick_assets, p.current_liabilities) if quick_assets is not None else None

        # Solvency
        equity_ratio = safe_div(p.equity, p.total_assets)
        debt_to_equity = safe_div(p.interest_bearing_debt, p.equity)
        net_debt = p.interest_bearing_debt - p.cash_and_equivalents
        net_debt_to_ebitda = safe_div(net_debt, ebitda) if ebitda else None
        interest_coverage = safe_div(p.operating_profit, p.interest_expense) if (p.interest_expense and p.interest_expense > 0) else None

        # Cash Flow
        fcf = p.operating_cf - p.capex
        fcf_margin = safe_div(fcf, p.revenue)
        fcf_conversion = safe_div(fcf, p.net_profit) if p.net_profit > 0 else None
        ocf_margin = safe_div(p.operating_cf, p.revenue)

        # Shareholder returns
        total_payout = (p.dividends_paid or 0) + (p.share_repurchases or 0)
        payout_ratio = safe_div(p.dividends_paid, p.net_profit) if (p.dividends_paid is not None and p.net_profit > 0) else None
        total_return_ratio = safe_div(total_payout, p.net_profit) if (total_payout > 0 and p.net_profit > 0) else None

        # Valuation multiples
        per = safe_div(p.market_cap, p.net_profit) if (p.market_cap and p.net_profit > 0) else None
        pbr = safe_div(p.market_cap, p.equity) if (p.market_cap and p.equity > 0) else None
        psr = safe_div(p.market_cap, p.revenue) if (p.market_cap and p.revenue > 0) else None
        ev = (p.market_cap + net_debt) if p.market_cap is not None else None
        ev_ebitda = safe_div(ev, ebitda) if (ev and ebitda and ebitda > 0) else None
        dividend_yield = safe_div(p.dividends_paid, p.market_cap) if (p.dividends_paid and p.market_cap) else None

        return {
            "period_name": p.period_name,
            "gross_profit": gross_profit,
            "gross_margin": gross_margin,
            "operating_profit": p.operating_profit,
            "operating_margin": op_margin,
            "net_profit": p.net_profit,
            "net_margin": net_margin,
            "ebitda": ebitda,
            "ebitda_margin": ebitda_margin,
            "roa": roa,
            "roe": roe,
            "roic": roic,
            "asset_turnover": asset_turnover,
            "equity_multiplier": equity_multiplier,
            "dupont_3stage": dupont_3stage,
            "dso": dso,
            "dio": dio,
            "dpo": dpo,
            "ccc": ccc,
            "nwc": nwc,
            "current_ratio": current_ratio,
            "quick_ratio": quick_ratio,
            "equity_ratio": equity_ratio,
            "debt_to_equity": debt_to_equity,
            "net_debt": net_debt,
            "net_debt_to_ebitda": net_debt_to_ebitda,
            "interest_coverage": interest_coverage,
            "fcf": fcf,
            "fcf_margin": fcf_margin,
            "fcf_conversion": fcf_conversion,
            "ocf_margin": ocf_margin,
            "payout_ratio": payout_ratio,
            "total_return_ratio": total_return_ratio,
            "per": per,
            "pbr": pbr,
            "psr": psr,
            "ev_ebitda": ev_ebitda,
            "dividend_yield": dividend_yield,
        }

    def generate_markdown_report(self, company_name: str, currency: str, standard: str, lang: str = "ja") -> str:
        lang = lang if lang in ["ja", "en", "zh-CN", "zh-TW", "fr"] else "ja"
        results = [self.compute_period_metrics(p) for p in self.periods]
        latest = results[-1]
        prev = results[-2] if len(results) >= 2 else None

        titles = {
            "ja": {
                "highlights": f"### 財務ハイライト（時系列推移）: {company_name}",
                "highlights_sub": f"*対象通貨: {currency} | 会計基準: {standard} | 数値丸め: 四捨五入*",
                "h_metric": "指標", "h_def": "定義 / 式", "h_yoy": "前年比 (YoY)", "h_cagr": "CAGR / トレンド",
                "ratios": f"### 主要財務指標一覧（収益性・効率性・安全性・還元）: {company_name}",
                "r_cat": "分類", "r_name": "指標名", "r_val": "最新FY値", "r_diff": "前年比差分", "r_trend": "3〜5年推移", "r_eval": "アナリスト評価", "r_formula": "算出式 / 注記",
                "dupont_title": "### デュポン分解（ROEの要因分解）",
                "dupont_roe": "- **最新ROE**: {roe}% (純利益 / 自己資本)",
                "dupont_d1": "  - **① 売上高純利益率 (Net Margin)**: {nm}% (収益性ドライバー)",
                "dupont_d2": "  - **② 総資産回転率 (Asset Turnover)**: {at}回 (資産効率ドライバー)",
                "dupont_d3": "  - **③ 財務レバレッジ (Equity Multiplier)**: {em}倍 (資本構成ドライバー)",
                "dupont_rec": "  - *検証算式: {nm}% × {at} × {em} = {calc_roe}%*",
                "t_up": "改善/上昇 ↑", "t_down": "悪化/低下 ↓", "t_stable": "横ばい →",
                "u_pct": "%", "u_mult": "倍", "u_turn": "回", "u_days": "日"
            },
            "en": {
                "highlights": f"### Financial Highlights (Multi-Year Trajectory): {company_name}",
                "highlights_sub": f"*Reporting Currency: {currency} | Accounting Standard: {standard} | Rounding: Rounded*",
                "h_metric": "Metric", "h_def": "Definition / Formula", "h_yoy": "YoY Change", "h_cagr": "CAGR / Trend",
                "ratios": f"### Key Financial Indicators (Profitability, Efficiency, Solvency, Returns): {company_name}",
                "r_cat": "Category", "r_name": "Metric", "r_val": "Latest Value", "r_diff": "YoY Diff", "r_trend": "3-5Y Trend", "r_eval": "Analyst Assessment", "r_formula": "Formula / Note",
                "dupont_title": "### DuPont Analysis (3-Stage Decomposition of ROE)",
                "dupont_roe": "- **Latest ROE**: {roe}% (Net Profit / Total Equity)",
                "dupont_d1": "  - **① Net Profit Margin**: {nm}% (Earnings Quality & Pricing Power)",
                "dupont_d2": "  - **② Asset Turnover**: {at}x (Asset Efficiency & Velocity)",
                "dupont_d3": "  - **③ Equity Multiplier (Leverage)**: {em}x (Capital Structure Optimization)",
                "dupont_rec": "  - *Reconciliation Formula: {nm}% × {at}x × {em}x = {calc_roe}%*",
                "t_up": "Improvement ↑", "t_down": "Deterioration ↓", "t_stable": "Stable →",
                "u_pct": "%", "u_mult": "x", "u_turn": "x", "u_days": " Days"
            },
            "zh-CN": {
                "highlights": f"### 财务亮点与历年轨迹: {company_name}",
                "highlights_sub": f"*报告货币: {currency} | 会计准则: {standard} | 舍入方式: 四舍五入*",
                "h_metric": "指标项目", "h_def": "定义 / 计算公式", "h_yoy": "同比变动 (YoY)", "h_cagr": "年复合增长 / 趋势",
                "ratios": f"### 核心财务指标列表（盈利・效率・偿债・回报）: {company_name}",
                "r_cat": "分类", "r_name": "指标名称", "r_val": "最新财年值", "r_diff": "同比差分", "r_trend": "3〜5年趋势", "r_eval": "分析师评估", "r_formula": "计算公式 / 附注",
                "dupont_title": "### 杜邦分析（ROE 三阶段归因拆解）",
                "dupont_roe": "- **最新 ROE**: {roe}% (净利润 / 净资产)",
                "dupont_d1": "  - **① 销售净利率 (Net Margin)**: {nm}% (盈利质量与定价权)",
                "dupont_d2": "  - **② 总资产周转率 (Asset Turnover)**: {at}次 (营运周转与资产效率)",
                "dupont_d3": "  - **③ 权益乘数 (Equity Multiplier)**: {em}倍 (财务杠杆与资本结构)",
                "dupont_rec": "  - *验证算式: {nm}% × {at}次 × {em}倍 = {calc_roe}%*",
                "t_up": "改善/上升 ↑", "t_down": "转差/下降 ↓", "t_stable": "平稳 →",
                "u_pct": "%", "u_mult": "倍", "u_turn": "次", "u_days": "天"
            },
            "zh-TW": {
                "highlights": f"### 財務亮點與歷年軌跡: {company_name}",
                "highlights_sub": f"*報告貨幣: {currency} | 會計準則: {standard} | 捨入方式: 四捨五入*",
                "h_metric": "指標項目", "h_def": "定義 / 計算公式", "h_yoy": "同比變動 (YoY)", "h_cagr": "年複合增長 / 趨勢",
                "ratios": f"### 核心財務指標列表（獲利・效率・償債・回報）: {company_name}",
                "r_cat": "分類", "r_name": "指標名稱", "r_val": "最新財年值", "r_diff": "同比差分", "r_trend": "3〜5年趨勢", "r_eval": "分析師評估", "r_formula": "計算公式 / 附註",
                "dupont_title": "### 杜邦分析（ROE 三階段歸因拆解）",
                "dupont_roe": "- **最新 ROE**: {roe}% (淨利 / 淨資產)",
                "dupont_d1": "  - **① 銷售淨利率 (Net Margin)**: {nm}% (獲利品質與定價權)",
                "dupont_d2": "  - **② 總資產週轉率 (Asset Turnover)**: {at}次 (營運週轉與資產效率)",
                "dupont_d3": "  - **③ 權益乘數 (Equity Multiplier)**: {em}倍 (財務槓桿與資本結構)",
                "dupont_rec": "  - *驗證算式: {nm}% × {at}次 × {em}倍 = {calc_roe}%*",
                "t_up": "改善/上升 ↑", "t_down": "轉差/下降 ↓", "t_stable": "平穩 →",
                "u_pct": "%", "u_mult": "倍", "u_turn": "次", "u_days": "天"
            },
            "fr": {
                "highlights": f"### Faits Marquants Financiers (Trajectoire Pluriannuelle): {company_name}",
                "highlights_sub": f"*Devise: {currency} | Norme Comptable: {standard} | Arrondi: Standard*",
                "h_metric": "Indicateur", "h_def": "Définition / Formule", "h_yoy": "Var. Annuelle (YoY)", "h_cagr": "TCAC / Tendance",
                "ratios": f"### Principaux Ratios Financiers (Rentabilité, Efficience, Solvabilité): {company_name}",
                "r_cat": "Catégorie", "r_name": "Indicateur", "r_val": "Dernière Valeur", "r_diff": "Var. Annuelle", "r_trend": "Tendance 3-5 ans", "r_eval": "Évaluation Analyste", "r_formula": "Formule / Note",
                "dupont_title": "### Analyse DuPont (Décomposition en 3 Étapes du ROE)",
                "dupont_roe": "- **Dernier ROE**: {roe}% (Résultat Net / Capitaux Propres)",
                "dupont_d1": "  - **① Marge Nette**: {nm}% (Qualité des Bénéfices & Pouvoir de Prix)",
                "dupont_d2": "  - **② Rotation de l'Actif**: {at}x (Efficience & Vélocité des Actifs)",
                "dupont_d3": "  - **③ Levier Financier**: {em}x (Optimisation du Bilan)",
                "dupont_rec": "  - *Formule de Réconciliation: {nm}% × {at}x × {em}x = {calc_roe}%*",
                "t_up": "Amélioration ↑", "t_down": "Détérioration ↓", "t_stable": "Stable →",
                "u_pct": "%", "u_mult": "x", "u_turn": "x", "u_days": " Jours"
            }
        }
        T = titles[lang]

        # 対策5: PDF表示年数を最大5期（直近5年分）に制限
        max_periods = 5
        display_periods = self.periods[-max_periods:]
        display_results = results[-max_periods:]

        lines = []
        lines.append(T["highlights"])
        if len(self.periods) > max_periods:
            sub_notes = {
                "ja": f"*対象通貨: {currency} | 会計基準: {standard} | 表示: 直近{max_periods}期推移 | 数値丸め: 四捨五入*",
                "en": f"*Reporting Currency: {currency} | Accounting Standard: {standard} | Display: Latest {max_periods} Fiscal Years | Rounding: Rounded*",
                "zh-CN": f"*报告货币: {currency} | 会计准则: {standard} | 显示: 最近{max_periods}个财年 | 舍入方式: 四舍五入*",
                "zh-TW": f"*報告貨幣: {currency} | 會計準則: {standard} | 顯示: 最近{max_periods}個財年 | 捨入方式: 四捨五入*",
                "fr": f"*Devise: {currency} | Norme Comptable: {standard} | Affichage: {max_periods} derniers exercices | Arrondi: Standard*"
            }
            lines.append(sub_notes.get(lang, T["highlights_sub"]))
        else:
            lines.append(T["highlights_sub"])
        lines.append("")

        # Financial Highlights Table
        # 対策1: 「定義 / 式」列を独立列から削除し、指標名セルのサブテキストに集約
        headers = [T["h_metric"]] + [r["period_name"] for r in display_results] + [T["h_yoy"], T["h_cagr"]]
        lines.append("| " + " | ".join(headers) + " |")
        lines.append("|" + "|".join(["---" if i == 0 else "---:" for i in range(len(headers))]) + "|")

        raw_metrics_dict = {
            "ja": [
                ("売上高 (Revenue)", "売上高", "revenue", True),
                ("売上総利益 (Gross Profit)", "売上高 - 売上原価", "gross_profit", False),
                ("営業利益 (Operating Profit)", "営業収益 - 営業費用", "operating_profit", True),
                ("EBITDA", "営業利益 + 減価償却費", "ebitda", False),
                ("当期純利益 (Net Profit)", "税引後当期純利益", "net_profit", True),
                ("営業キャッシュフロー (OCF)", "CF計算書 営業活動CF", "operating_cf", True),
                ("設備投資 (Capex)", "固定資産取得による支出", "capex", True),
                ("フリーキャッシュフロー (FCF)", "OCF - Capex", "fcf", False),
                ("総資産 (Total Assets)", "B/S 資産合計", "total_assets", True),
                ("純資産 (Total Equity)", "B/S 純資産合計", "equity", True),
                ("純有利子負債 (Net Debt)", "有利子負債 - 現預金", "net_debt", False),
            ],
            "en": [
                ("Revenue (Top-line)", "Net Revenue", "revenue", True),
                ("Gross Profit", "Revenue - Cost of Goods Sold", "gross_profit", False),
                ("Operating Profit (EBIT)", "Operating Revenue - OpEx", "operating_profit", True),
                ("EBITDA", "Operating Profit + D&A", "ebitda", False),
                ("Net Profit (Bottom-line)", "Net Profit after Tax", "net_profit", True),
                ("Operating Cash Flow (OCF)", "Cash Flow from Operations", "operating_cf", True),
                ("Capital Expenditure (Capex)", "Purchase of Fixed Assets", "capex", True),
                ("Free Cash Flow (FCF)", "OCF - Capex", "fcf", False),
                ("Total Assets", "Balance Sheet Total Assets", "total_assets", True),
                ("Total Equity", "Balance Sheet Total Equity", "equity", True),
                ("Net Debt", "Interest-Bearing Debt - Cash", "net_debt", False),
            ],
            "zh-CN": [
                ("营业收入 (Revenue)", "营业收入总额", "revenue", True),
                ("毛利润 (Gross Profit)", "营业收入 - 营业成本", "gross_profit", False),
                ("营业利润 (Operating Profit)", "营业收入 - 营业支出", "operating_profit", True),
                ("EBITDA (息税折旧摊销前利润)", "营业利润 + 折旧与摊销", "ebitda", False),
                ("净利润 (Net Profit)", "税后净利润 (归母)", "net_profit", True),
                ("经营活动现金流 (OCF)", "现金流量表 经营现金流", "operating_cf", True),
                ("资本开支 (Capex)", "购置固定资产及无形资产支出", "capex", True),
                ("自由现金流 (FCF)", "OCF - Capex", "fcf", False),
                ("总资产 (Total Assets)", "资产负债表 资产总计", "total_assets", True),
                ("净资产 (Total Equity)", "所有者权益总计", "equity", True),
                ("净有息负债 (Net Debt)", "有息负债 - 现金及等价物", "net_debt", False),
            ],
            "zh-TW": [
                ("營業收入 (Revenue)", "營業收入總額", "revenue", True),
                ("毛利潤 (Gross Profit)", "營業收入 - 營業成本", "gross_profit", False),
                ("營業利益 (Operating Profit)", "營業收入 - 營業費用", "operating_profit", True),
                ("EBITDA (息稅折舊攤銷前利潤)", "營業利益 + 折舊與攤銷", "ebitda", False),
                ("本期淨利 (Net Profit)", "稅後本期淨利", "net_profit", True),
                ("營業活動現金流 (OCF)", "現金流量表 營業現金流", "operating_cf", True),
                ("資本支出 (Capex)", "購置固定資產支出", "capex", True),
                ("自由現金流 (FCF)", "OCF - Capex", "fcf", False),
                ("總資產 (Total Assets)", "資產負債表 資產合計", "total_assets", True),
                ("淨資產 (Total Equity)", "股東權益合計", "equity", True),
                ("淨有息負債 (Net Debt)", "有息負債 - 現金及約當現金", "net_debt", False),
            ],
            "fr": [
                ("Chiffre d'Affaires (Revenue)", "Chiffre d'Affaires Net", "revenue", True),
                ("Marge Brute (Gross Profit)", "CA - Coût des Ventes", "gross_profit", False),
                ("Résultat d'Exploitation (EBIT)", "Produits d'Exploitation - Charges", "operating_profit", True),
                ("EBITDA", "EBIT + Amortissements", "ebitda", False),
                ("Résultat Net (Net Profit)", "Résultat Net après Impôt", "net_profit", True),
                ("Flux de Trésorerie d'Exploitation (OCF)", "Tableau de Flux de Trésorerie", "operating_cf", True),
                ("Dépenses d'Investissement (Capex)", "Acquisitions d'Immobilisations", "capex", True),
                ("Flux de Trésorerie Disponible (FCF)", "OCF - Capex", "fcf", False),
                ("Total Actif (Total Assets)", "Bilan Total de l'Actif", "total_assets", True),
                ("Capitaux Propres (Total Equity)", "Bilan Total Capitaux Propres", "equity", True),
                ("Dette Nette (Net Debt)", "Dette Financière - Trésorerie", "net_debt", False),
            ]
        }
        raw_metrics = raw_metrics_dict[lang]

        for label, formula, key, is_raw in raw_metrics:
            # 対策1: 指標セル内に定義・算出式をサブテキストとして埋め込み
            metric_cell = f"{label}<br><span style='font-size:0.82em;color:#64748b;font-weight:normal;'>{formula}</span>"
            row = [metric_cell]
            vals = []
            for i, p in enumerate(display_periods):
                val = getattr(p, key) if is_raw else display_results[i].get(key)
                vals.append(val)
                row.append(f"{val:,.1f}" if val is not None else "-")

            # YoY
            yoy_str = "-"
            if len(vals) >= 2 and vals[-1] is not None and vals[-2] is not None and vals[-2] != 0:
                yoy = (vals[-1] - vals[-2]) / abs(vals[-2])
                yoy_str = f"{yoy:+.1%}"
            row.append(yoy_str)

            # CAGR
            cagr_str = "-"
            if len(vals) >= 3 and vals[0] is not None and vals[-1] is not None and vals[0] > 0 and vals[-1] > 0:
                c = calculate_cagr(vals[0], vals[-1], len(vals) - 1)
                if c is not None:
                    cagr_str = f"{c:.1%} (CAGR)"
            row.append(cagr_str)
            lines.append("| " + " | ".join(row) + " |")

        lines.append("")
        lines.append(T["ratios"])
        lines.append("")

        # 対策1: 指標セル内に算出式・注記をサブテキストとして集約し、独立した定義列を廃止（7列→6列へスリム化）
        ratio_headers = [T["r_cat"], T["r_name"], T["r_val"], T["r_diff"], T["r_trend"], T["r_eval"]]
        lines.append("| " + " | ".join(ratio_headers) + " |")
        lines.append("|" + "|".join(["---" if i not in (2, 3) else "---:" for i in range(len(ratio_headers))]) + "|")

        ratio_definitions_dict = {
            "ja": [
                ("成長性", "売上高成長率", "yoy_revenue", "%", "持続的拡大か一時的か", "当期売上 / 前期売上 - 1"),
                ("成長性", "営業利益成長率", "yoy_op", "%", "本業の増益モメンタム", "当期営利 / 前期営利 - 1"),
                ("収益性", "売上総利益率 (GPM)", "gross_margin", "%", "価格支配力・原価構造", "売上総利益 / 売上高"),
                ("収益性", "営業利益率 (OPM)", "operating_margin", "%", "本業収益力・販管費統制", "営業利益 / 売上高"),
                ("収益性", "EBITDAマージン", "ebitda_margin", "%", "現金創出力ベース収益性", "EBITDA / 売上高"),
                ("収益性", "純利益率 (NPM)", "net_margin", "%", "最終利益率", "当期純利益 / 売上高"),
                ("資本効率", "ROE (自己資本利益率)", "roe", "%", "株主資本に対する利回り", "当期純利益 / 純資産"),
                ("資本効率", "ROA (総資産利益率)", "roa", "%", "保有資産全体の稼働効率", "当期純利益 / 総資産"),
                ("資本効率", "ROIC (投下資本利益率)", "roic", "%", "事業投資の本質的利回り", "NOPAT / (有利子負債 + 純資産 - 余剰現金)"),
                ("資本効率", "総資産回転率", "asset_turnover", "回", "資産利用効率", "売上高 / 総資産"),
                ("安全性", "自己資本比率", "equity_ratio", "%", "財務基盤の安定度", "純資産 / 総資産"),
                ("安全性", "流動比率", "current_ratio", "%", "短期支払余力 (>120%目安)", "流動資産 / 流動負債"),
                ("安全性", "当座比率 (Acid-test)", "quick_ratio", "%", "即時換金支払余力 (>90%目安)", "(現預金 + 売掛金) / 流動負債"),
                ("安全性", "Net Debt / EBITDA", "net_debt_to_ebitda", "倍", "債務返済年数 (<2.0倍目安)", "純有利子負債 / EBITDA"),
                ("安全性", "インタレスト・カバレッジ", "interest_coverage", "倍", "利払い余裕度 (>3.0倍目安)", "営業利益 / 支払利息"),
                ("CF創出力", "営業CFマージン", "ocf_margin", "%", "売上高の現金化比率", "営業CF / 売上高"),
                ("CF創出力", "FCFマージン", "fcf_margin", "%", "裁量投資後の現金創出率", "FCF / 売上高"),
                ("CF創出力", "FCF転換率", "fcf_conversion", "%", "純利益の現金化率 (>80%健全)", "FCF / 当期純利益"),
                ("効率性", "売上債権回転日数 (DSO)", "dso", "日", "回収スピードの適正度", "(売掛金 / 売上高) * 365"),
                ("効率性", "棚卸資産回転日数 (DIO)", "dio", "日", "在庫滞留リスクの有無", "(棚卸資産 / 売上原価) * 365"),
                ("効率性", "買入債務回転日数 (DPO)", "dpo", "日", "仕入先支払猶予期間", "(買掛金 / 売上原価) * 365"),
                ("効率性", "現金循環化日数 (CCC)", "ccc", "日", "運転資本サイクル (短いほど良)", "DSO + DIO - DPO"),
                ("株主還元", "配当性向", "payout_ratio", "%", "利益還元度", "配当金総額 / 当期純利益"),
                ("株主還元", "総還元性向", "total_return_ratio", "%", "自社株買い含む総合還元", "(配当 + 自社株買い) / 当期純利益"),
                ("株価指標", "PER (株価収益率)", "per", "倍", "市場の成長期待水準", "時価総額 / 当期純利益"),
                ("株価指標", "PBR (株価純資産倍率)", "pbr", "倍", "解散価値・資本評価", "時価総額 / 純資産"),
                ("株価指標", "EV / EBITDA", "ev_ebitda", "倍", "企業買収視点の倍率", "EV / EBITDA"),
            ],
            "en": [
                ("Growth", "Revenue Growth Rate", "yoy_revenue", "%", "Top-line organic expansion momentum", "Current Rev / Prior Rev - 1"),
                ("Growth", "Operating Profit Growth", "yoy_op", "%", "Core operating earnings momentum", "Current EBIT / Prior EBIT - 1"),
                ("Profitability", "Gross Profit Margin (GPM)", "gross_margin", "%", "Pricing power & direct cost structure", "Gross Profit / Revenue"),
                ("Profitability", "Operating Margin (OPM)", "operating_margin", "%", "Core profitability & OpEx discipline", "Operating Profit / Revenue"),
                ("Profitability", "EBITDA Margin", "ebitda_margin", "%", "Cash earnings generation capacity", "EBITDA / Revenue"),
                ("Profitability", "Net Profit Margin (NPM)", "net_margin", "%", "Bottom-line earnings conversion", "Net Profit / Revenue"),
                ("Capital Efficiency", "ROE (Return on Equity)", "roe", "%", "Return on shareholder net equity", "Net Profit / Total Equity"),
                ("Capital Efficiency", "ROA (Return on Assets)", "roa", "%", "Total balance sheet deployment efficiency", "Net Profit / Total Assets"),
                ("Capital Efficiency", "ROIC (Invested Capital Return)", "roic", "%", "Intrinsic return on invested capital", "NOPAT / Invested Capital"),
                ("Capital Efficiency", "Asset Turnover", "asset_turnover", "x", "Asset velocity and capital intensity", "Revenue / Total Assets"),
                ("Solvency", "Equity Ratio", "equity_ratio", "%", "Long-term balance sheet stability", "Total Equity / Total Assets"),
                ("Solvency", "Current Ratio", "current_ratio", "%", "Short-term liquidity (>120% benchmark)", "Current Assets / Current Liabilities"),
                ("Solvency", "Quick Ratio (Acid-Test)", "quick_ratio", "%", "Immediate cash liquidity (>90% benchmark)", "(Cash + Receivables) / Current Liab"),
                ("Solvency", "Net Debt / EBITDA", "net_debt_to_ebitda", "x", "Debt payback period (<2.0x safe)", "Net Debt / EBITDA"),
                ("Solvency", "Interest Coverage", "interest_coverage", "x", "Interest debt service buffer (>3.0x safe)", "Operating Profit / Interest Exp"),
                ("Cash Generation", "Operating Cash Flow Margin", "ocf_margin", "%", "Cash conversion of top-line revenue", "OCF / Revenue"),
                ("Cash Generation", "FCF Margin", "fcf_margin", "%", "Discretionary cash yield post-Capex", "FCF / Revenue"),
                ("Cash Generation", "FCF Conversion Rate", "fcf_conversion", "%", "Quality of net earnings (>80% healthy)", "FCF / Net Profit"),
                ("Working Capital", "Days Sales Outstanding (DSO)", "dso", "Days", "Receivables collection turnaround", "(Receivables / Revenue) * 365"),
                ("Working Capital", "Days Inventory Outstanding (DIO)", "dio", "Days", "Inventory float and obsolescence risk", "(Inventory / COGS) * 365"),
                ("Working Capital", "Days Payables Outstanding (DPO)", "dpo", "Days", "Supplier credit terms duration", "(Payables / COGS) * 365"),
                ("Working Capital", "Cash Conversion Cycle (CCC)", "ccc", "Days", "Working capital cycle length", "DSO + DIO - DPO"),
                ("Shareholder Returns", "Dividend Payout Ratio", "payout_ratio", "%", "Proportion of earnings paid to dividends", "Dividends Paid / Net Profit"),
                ("Shareholder Returns", "Total Shareholder Return Ratio", "total_return_ratio", "%", "Total cash returned including buybacks", "(Dividends + Buybacks) / Net Profit"),
                ("Valuation", "P/E Ratio (PER)", "per", "x", "Market multiple on net earnings", "Market Cap / Net Profit"),
                ("Valuation", "P/B Ratio (PBR)", "pbr", "x", "Price-to-book valuation multiple", "Market Cap / Total Equity"),
                ("Valuation", "EV / EBITDA", "ev_ebitda", "x", "Enterprise value multiple on cash flow", "Enterprise Value / EBITDA"),
            ],
            "zh-CN": [
                ("成长性", "营业收入增长率", "yoy_revenue", "%", "营收规模内生扩张动能", "当期营收 / 上期营收 - 1"),
                ("成长性", "营业利润增长率", "yoy_op", "%", "主营业务核心盈利增速", "当期营利 / 上期营利 - 1"),
                ("盈利能力", "毛利率 (GPM)", "gross_margin", "%", "定价权与核心生产成本结构", "毛利润 / 营业收入"),
                ("盈利能力", "营业利润率 (OPM)", "operating_margin", "%", "主业盈利力与期间费用管控", "营业利润 / 营业收入"),
                ("盈利能力", "EBITDA 利润率", "ebitda_margin", "%", "基于现金造血维度的盈利能力", "EBITDA / 营业收入"),
                ("盈利能力", "净利率 (NPM)", "net_margin", "%", "最终归母净利润转化率", "净利润 / 营业收入"),
                ("资本效率", "净资产收益率 (ROE)", "roe", "%", "股东权益投资回报率", "净利润 / 净资产"),
                ("资本效率", "总资产报酬率 (ROA)", "roa", "%", "全部资产综合运用转化率", "净利润 / 总资产"),
                ("资本效率", "投入资本回报率 (ROIC)", "roic", "%", "业务实质投资真实回报率", "NOPAT / 投入资本"),
                ("资本效率", "总资产周转率", "asset_turnover", "次", "资产周转速度与资本密集度", "营业收入 / 总资产"),
                ("偿债安全性", "资产负债率 (权益比)", "equity_ratio", "%", "长期财务底盘稳健度", "净资产 / 总资产"),
                ("偿债安全性", "流动比率", "current_ratio", "%", "短期偿债缓冲 (>120%为佳)", "流动资产 / 流动负债"),
                ("偿债安全性", "速动比率 (Acid-test)", "quick_ratio", "%", "即时变现偿付能力 (>90%为佳)", "(现金 + 应收款) / 流动负债"),
                ("偿债安全性", "净有息负债倍率", "net_debt_to_ebitda", "倍", "债务偿还年限 (<2.0倍为优)", "净有息负债 / EBITDA"),
                ("偿债安全性", "利息保障倍数", "interest_coverage", "倍", "利息偿付充裕度 (>3.0倍为优)", "营业利润 / 利息支出"),
                ("现金造血", "经营现金流利润率", "ocf_margin", "%", "营收规模真实变现效率", "经营现金流 / 营业收入"),
                ("现金造血", "自由现金流利润率", "fcf_margin", "%", "扣除资本开支后自由现金率", "自由现金流 / 营业收入"),
                ("现金造血", "FCF 利润转化率", "fcf_conversion", "%", "净利润真实现金质量 (>80%健康)", "FCF / 净利润"),
                ("营运效率", "应收账款周转天数 (DSO)", "dso", "天", "货款回收速度与客户账期", "(应收账款 / 营业收入) * 365"),
                ("营运效率", "存货周转天数 (DIO)", "dio", "天", "存货滞留周转与跌价风险", "(存货 / 营业成本) * 365"),
                ("营运效率", "应付账款周转天数 (DPO)", "dpo", "天", "上游供应商无息占款账期", "(应付账款 / 营业成本) * 365"),
                ("营运效率", "现金循环周期 (CCC)", "ccc", "天", "营运资金净占用天数 (越短越优)", "DSO + DIO - DPO"),
                ("股东回报", "股息支付率", "payout_ratio", "%", "利润向普通股派息力度", "派息总额 / 净利润"),
                ("股东回报", "总股东回报率", "total_return_ratio", "%", "含回购口径综合股东回报", "(派息 + 回购) / 净利润"),
                ("估值倍数", "市盈率 (P/E)", "per", "倍", "二级市场远期业绩预期倍数", "市值 / 净利润"),
                ("估值倍数", "市净率 (P/B)", "pbr", "倍", "清算价值与净资产溢价倍数", "市值 / 净资产"),
                ("估值倍数", "企业价值倍数 (EV/EBITDA)", "ev_ebitda", "倍", "兼并收购视角企业对价倍数", "EV / EBITDA"),
            ],
            "zh-TW": [
                ("成長性", "營業收入成長率", "yoy_revenue", "%", "營收規模內生擴張動能", "當期營收 / 上期營收 - 1"),
                ("成長性", "營業利益成長率", "yoy_op", "%", "主營業務核心獲利增速", "當期營利 / 上期營利 - 1"),
                ("獲利能力", "毛利率 (GPM)", "gross_margin", "%", "定價權與核心生產成本結構", "毛利潤 / 營業收入"),
                ("獲利能力", "營業利益率 (OPM)", "operating_margin", "%", "主業獲利力與營業費用管控", "營業利益 / 營業收入"),
                ("獲利能力", "EBITDA 利益率", "ebitda_margin", "%", "基於現金造血維度的獲利能力", "EBITDA / 營業收入"),
                ("獲利能力", "淨利率 (NPM)", "net_margin", "%", "最終稅後淨利轉化率", "淨利 / 營業收入"),
                ("資本效率", "股東權益報酬率 (ROE)", "roe", "%", "股東權益投資報酬率", "淨利 / 淨資產"),
                ("資本效率", "資產報酬率 (ROA)", "roa", "%", "全部資產綜合運用轉化率", "淨利 / 總資產"),
                ("資本效率", "投入資本回報率 (ROIC)", "roic", "%", "業務實質投資真實回報率", "NOPAT / 投入資本"),
                ("資本效率", "總資產週轉率", "asset_turnover", "次", "資產週轉速度與資本密集度", "營業收入 / 總資產"),
                ("償債安全性", "權益比率 (資產負債率)", "equity_ratio", "%", "長期財務底盤穩健度", "淨資產 / 總資產"),
                ("償債安全性", "流動比率", "current_ratio", "%", "短期償債緩衝 (>120%為佳)", "流動資產 / 流動負債"),
                ("償債安全性", "速動比率 (Acid-test)", "quick_ratio", "%", "即時變現償付能力 (>90%為佳)", "(現金 + 應收款) / 流動負債"),
                ("償債安全性", "淨有息負債倍率", "net_debt_to_ebitda", "倍", "債務償還年限 (<2.0倍為優)", "淨有息負債 / EBITDA"),
                ("償債安全性", "利息保障倍數", "interest_coverage", "倍", "利息償付充裕度 (>3.0倍為優)", "營業利益 / 利息支出"),
                ("現金造血", "營業現金流利益率", "ocf_margin", "%", "營收規模真實變現效率", "營業現金流 / 營業收入"),
                ("現金造血", "自由現金流利益率", "fcf_margin", "%", "扣除資本支出後自由現金率", "自由現金流 / 營業收入"),
                ("現金造血", "FCF 淨利轉化率", "fcf_conversion", "%", "淨利真實現金品質 (>80%健康)", "FCF / 淨利"),
                ("營運效率", "應收帳款週轉天數 (DSO)", "dso", "天", "貨款回收速度與客戶帳期", "(應收帳款 / 營業收入) * 365"),
                ("營運效率", "存貨週轉天數 (DIO)", "dio", "天", "存貨滯留週轉與跌價風險", "(存貨 / 營業成本) * 365"),
                ("營運效率", "應付帳款週轉天數 (DPO)", "dpo", "天", "上游供應商賒帳帳期", "(應付帳款 / 營業成本) * 365"),
                ("營運效率", "現金循環週期 (CCC)", "ccc", "天", "營運資金淨占用天數 (越短越優)", "DSO + DIO - DPO"),
                ("股東回報", "現金股利發放率", "payout_ratio", "%", "利潤向普通股派息力度", "派息總額 / 淨利"),
                ("股東回報", "總股東回報率", "total_return_ratio", "%", "含回購口徑綜合股東回報", "(派息 + 回購) / 淨利"),
                ("估值倍數", "本益比 (P/E)", "per", "倍", "二級市場遠期業績預期倍數", "市值 / 淨利"),
                ("估值倍数", "股價淨值比 (P/B)", "pbr", "倍", "清算價值與淨資產溢價倍數", "市值 / 淨資產"),
                ("估值倍數", "企業價值倍數 (EV/EBITDA)", "ev_ebitda", "倍", "兼併收購視角企業對價倍數", "EV / EBITDA"),
            ],
            "fr": [
                ("Croissance", "Taux de Croissance du CA", "yoy_revenue", "%", "Dynamique organique de croissance", "CA Actuel / CA Préc. - 1"),
                ("Croissance", "Croissance du Résultat Exploitation", "yoy_op", "%", "Dynamique du résultat d'exploitation", "EBIT Actuel / EBIT Préc. - 1"),
                ("Rentabilité", "Taux de Marge Brute (GPM)", "gross_margin", "%", "Pouvoir de prix & structure des coûts", "Marge Brute / CA"),
                ("Rentabilité", "Marge Opérationnelle (OPM)", "operating_margin", "%", "Rentabilité d'exploitation & discipline", "EBIT / CA"),
                ("Rentabilité", "Marge d'EBITDA", "ebitda_margin", "%", "Capacité brute de génération de cash", "EBITDA / CA"),
                ("Rentabilité", "Taux de Marge Nette (NPM)", "net_margin", "%", "Conversion finale en résultat net", "Résultat Net / CA"),
                ("Efficience Capital", "Rentabilité Capitaux Propres (ROE)", "roe", "%", "Rendement des capitaux actionnaires", "Résultat Net / Capitaux Propres"),
                ("Efficience Capital", "Rentabilité de l'Actif (ROA)", "roa", "%", "Efficience globale des actifs au bilan", "Résultat Net / Total Actif"),
                ("Efficience Capital", "Rendement Capital Investi (ROIC)", "roic", "%", "Rendement économique intrinsèque", "NOPAT / Capital Investi"),
                ("Efficience Capital", "Rotation de l'Actif", "asset_turnover", "x", "Vélocité d'utilisation des actifs", "CA / Total Actif"),
                ("Solvabilité", "Ratio de Solvabilité (Capitaux)", "equity_ratio", "%", "Solidité financière à long terme", "Capitaux Propres / Total Actif"),
                ("Solvabilité", "Ratio de Liquidité Générale", "current_ratio", "%", "Liquidité court terme (>120% sain)", "Actif Circulant / Dette Court Terme"),
                ("Solvabilité", "Ratio de Liquidité Réduite (Quick)", "quick_ratio", "%", "Capacité immédiate de paiement (>90%)", "(Disponibilités + Clients) / Dettes CT"),
                ("Solvabilité", "Dette Nette / EBITDA", "net_debt_to_ebitda", "x", "Durée de remboursement dette (<2.0x)", "Dette Nette / EBITDA"),
                ("Solvabilité", "Couverture des Intérêts", "interest_coverage", "x", "Couverture charges financières (>3.0x)", "EBIT / Charges Financières"),
                ("Génération Cash", "Marge de Cash Flow Exploitation", "ocf_margin", "%", "Conversion du CA en flux de trésorerie", "Flux Exploitation / CA"),
                ("Génération Cash", "Marge de Free Cash Flow", "fcf_margin", "%", "Flux disponible après investissements", "FCF / CA"),
                ("Génération Cash", "Taux de Conversion FCF", "fcf_conversion", "%", "Qualité cash du résultat net (>80%)", "FCF / Résultat Net"),
                ("Besoin en Fonds de Roulement", "Délai Clients (DSO)", "dso", " Jours", "Délai de recouvrement créances", "(Créances Clients / CA) * 365"),
                ("Besoin en Fonds de Roulement", "Délai des Stocks (DIO)", "dio", " Jours", "Rotation des stocks et risque dépréciation", "(Stocks / Coût Ventes) * 365"),
                ("Besoin en Fonds de Roulement", "Délai Fournisseurs (DPO)", "dpo", " Jours", "Délai de paiement accordé fournisseurs", "(Dettes Fournisseurs / Coût Ventes) * 365"),
                ("Besoin en Fonds de Roulement", "Cycle Conversion Trésorerie (CCC)", "ccc", " Jours", "Durée totale cycle BFR opérationnel", "DSO + DIO - DPO"),
                ("Rendement Actionnaire", "Taux de Distribution Dividende", "payout_ratio", "%", "Quote-part bénéfices distribuée", "Dividendes / Résultat Net"),
                ("Rendement Actionnaire", "Rendement Global Actionnaires", "total_return_ratio", "%", "Rendement incluant rachats d'actions", "(Dividendes + Rachats) / Résultat Net"),
                ("Multiples Valorisation", "Multiple Cours / Bénéfice (PER)", "per", "x", "Multiple boursier du résultat net", "Capitalisation / Résultat Net"),
                ("Multiples Valorisation", "Multiple Cours / Actif Net (PBR)", "pbr", "x", "Multiple de la valeur comptable nette", "Capitalisation / Capitaux Propres"),
                ("Multiples Valorisation", "Valeur Entreprise / EBITDA", "ev_ebitda", "x", "Multiple transactionnel d'exploitation", "Valeur Entreprise / EBITDA"),
            ]
        }
        ratio_definitions = ratio_definitions_dict[lang]

        for cat, name, metric_key, unit, eval_desc, formula_note in ratio_definitions:
            curr_val = None
            prev_val = None

            if metric_key == "yoy_revenue":
                if len(self.periods) >= 2 and self.periods[-2].revenue > 0:
                    curr_val = (self.periods[-1].revenue - self.periods[-2].revenue) / self.periods[-2].revenue
                if len(self.periods) >= 3 and self.periods[-3].revenue > 0:
                    prev_val = (self.periods[-2].revenue - self.periods[-3].revenue) / self.periods[-3].revenue
            elif metric_key == "yoy_op":
                if len(self.periods) >= 2 and self.periods[-2].operating_profit != 0:
                    curr_val = (self.periods[-1].operating_profit - self.periods[-2].operating_profit) / abs(self.periods[-2].operating_profit)
                if len(self.periods) >= 3 and self.periods[-3].operating_profit != 0:
                    prev_val = (self.periods[-2].operating_profit - self.periods[-3].operating_profit) / abs(self.periods[-3].operating_profit)
            else:
                curr_val = latest.get(metric_key)
                prev_val = prev.get(metric_key) if prev else None

            # Format current
            if curr_val is None:
                val_str = "N/A"
            elif unit == "%":
                val_str = f"{curr_val * 100:.1f}%"
            elif unit in ("倍", "x"):
                val_str = f"{curr_val:.2f}{T['u_mult']}"
            elif unit in ("回", "次"):
                val_str = f"{curr_val:.2f}{T['u_turn']}"
            elif "日" in unit or "Days" in unit or "天" in unit or "Jours" in unit:
                val_str = f"{curr_val:.1f}{T['u_days']}"
            else:
                val_str = f"{curr_val:.2f}"

            # Format diff
            diff_str = "-"
            if curr_val is not None and prev_val is not None:
                diff = curr_val - prev_val
                if unit == "%":
                    diff_str = f"{diff * 100:+.1f} pt"
                elif unit in ("倍", "x", "回", "次"):
                    diff_str = f"{diff:+.2f}"
                elif "日" in unit or "Days" in unit or "天" in unit or "Jours" in unit:
                    diff_str = f"{diff:+.1f}{T['u_days']}"

            # Trend representation
            trend_str = T["t_stable"]
            if curr_val is not None and prev_val is not None:
                if curr_val > prev_val * 1.05:
                    trend_str = T["t_up"]
                elif curr_val < prev_val * 0.95:
                    trend_str = T["t_down"]
                else:
                    trend_str = T["t_stable"]

            # 対策1: 指標セル内に算出式・注記をサブテキストとして埋め込み
            name_cell = f"{name}<br><span style='font-size:0.82em;color:#64748b;font-weight:normal;'>{formula_note}</span>"
            row = [cat, name_cell, val_str, diff_str, trend_str, eval_desc]
            lines.append("| " + " | ".join(row) + " |")

        # DuPont Breakdown Section
        lines.append("")
        lines.append(T["dupont_title"])
        d3 = latest["dupont_3stage"]
        lines.append(T["dupont_roe"].format(roe=f"{latest['roe']*100:.2f}") if latest['roe'] else "- **ROE**: N/A")
        if d3['net_margin'] and d3['asset_turnover'] and d3['equity_multiplier']:
            lines.append(T["dupont_d1"].format(nm=f"{d3['net_margin']*100:.2f}"))
            lines.append(T["dupont_d2"].format(at=f"{d3['asset_turnover']:.2f}"))
            lines.append(T["dupont_d3"].format(em=f"{d3['equity_multiplier']:.2f}"))
            lines.append(T["dupont_rec"].format(
                nm=f"{d3['net_margin']*100:.2f}",
                at=f"{d3['asset_turnover']:.2f}",
                em=f"{d3['equity_multiplier']:.2f}",
                calc_roe=f"{d3['roe_calculated']*100:.2f}"
            ))

        return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description="Corporate Finance Calculator CLI")
    parser.add_argument("--file", "-f", type=str, help="JSON input file with company financial statements")
    parser.add_argument("--demo", action="store_true", help="Run with demonstration dataset (Toyota vs Tesla)")
    args = parser.parse_args()

    if args.demo:
        # Toyota FY2022, FY2023, FY2024 (Approx in Trillion JPY for demonstration)
        toyota_periods = [
            FinancialPeriod(
                period_name="FY2022",
                revenue=31379.5,
                cost_of_sales=25824.2,
                operating_profit=2995.6,
                net_profit=2850.1,
                total_assets=67688.7,
                equity=27221.7,
                interest_bearing_debt=25100.0,
                cash_and_equivalents=6100.0,
                operating_cf=3722.0,
                capex=1340.0,
                current_assets=24500.0,
                current_liabilities=21200.0,
                inventories=3400.0,
                receivables=11500.0,
                payables=5200.0,
                interest_expense=45.0,
                depreciation_amortization=1700.0,
                dividends_paid=680.0,
                share_repurchases=200.0,
                market_cap=35000.0
            ),
            FinancialPeriod(
                period_name="FY2023",
                revenue=37154.2,
                cost_of_sales=30880.0,
                operating_profit=2725.0,
                net_profit=2451.3,
                total_assets=74303.1,
                equity=29468.2,
                interest_bearing_debt=27800.0,
                cash_and_equivalents=7200.0,
                operating_cf=2900.0,
                capex=1600.0,
                current_assets=28200.0,
                current_liabilities=24100.0,
                inventories=4100.0,
                receivables=13200.0,
                payables=5800.0,
                interest_expense=60.0,
                depreciation_amortization=1850.0,
                dividends_paid=780.0,
                share_repurchases=150.0,
                market_cap=38000.0
            ),
            FinancialPeriod(
                period_name="FY2024",
                revenue=45095.3,
                cost_of_sales=36340.0,
                operating_profit=5352.9,
                net_profit=4944.9,
                total_assets=87820.5,
                equity=35245.0,
                interest_bearing_debt=31200.0,
                cash_and_equivalents=8900.0,
                operating_cf=5750.0,
                capex=1950.0,
                current_assets=33500.0,
                current_liabilities=28400.0,
                inventories=4600.0,
                receivables=15600.0,
                payables=6400.0,
                interest_expense=95.0,
                depreciation_amortization=2100.0,
                dividends_paid=980.0,
                share_repurchases=400.0,
                market_cap=44000.0
            )
        ]
        analyzer = FinancialAnalyzer(toyota_periods)
        md = analyzer.generate_markdown_report("トヨタ自動車 (Toyota Motor Corp)", "JPY (十億円)", "IFRS")
        print(md)
    elif args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            data = json.load(f)
        periods = [FinancialPeriod(**p) for p in data["periods"]]
        analyzer = FinancialAnalyzer(periods)
        md = analyzer.generate_markdown_report(data.get("company_name", "Target Company"), data.get("currency", "USD"), data.get("accounting_standard", "IFRS/GAAP"))
        print(md)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
