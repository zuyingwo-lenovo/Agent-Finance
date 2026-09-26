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

    def generate_markdown_report(self, company_name: str, currency: str, standard: str) -> str:
        results = [self.compute_period_metrics(p) for p in self.periods]
        latest = results[-1]
        prev = results[-2] if len(results) >= 2 else None

        lines = []
        lines.append(f"### 財務ハイライト（時系列推移）: {company_name}")
        lines.append(f"*対象通貨: {currency} | 会計基準: {standard} | 数値丸め: 四捨五入*")
        lines.append("")

        headers = ["指標", "定義 / 式"] + [r["period_name"] for r in results] + ["前年比 (YoY)", "CAGR / トレンド"]
        lines.append("| " + " | ".join(headers) + " |")
        lines.append("|" + "|".join(["---" if i < 2 else "---:" for i in range(len(headers))]) + "|")

        raw_metrics = [
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
        ]

        for label, formula, key, is_raw in raw_metrics:
            row = [label, formula]
            vals = []
            for i, p in enumerate(self.periods):
                val = getattr(p, key) if is_raw else results[i].get(key)
                vals.append(val)
                row.append(f"{val:,.1f}" if val is not None else "-")

            yoy_str = "-"
            if len(vals) >= 2 and vals[-1] is not None and vals[-2] is not None and vals[-2] != 0:
                yoy = (vals[-1] - vals[-2]) / abs(vals[-2])
                yoy_str = f"{yoy:+.1%}"
            row.append(yoy_str)

            cagr_str = "-"
            if len(vals) >= 3 and vals[0] is not None and vals[-1] is not None and vals[0] > 0 and vals[-1] > 0:
                c = calculate_cagr(vals[0], vals[-1], len(vals) - 1)
                if c is not None:
                    cagr_str = f"{c:.1%} (CAGR)"
            row.append(cagr_str)
            lines.append("| " + " | ".join(row) + " |")

        lines.append("")
        lines.append(f"### 主要財務指標一覧（収益性・効率性・安全性・還元）: {company_name}")
        lines.append("")

        ratio_headers = ["分類", "指標名", "最新FY値", "前年比差分", "3〜5年推移", "アナリスト評価", "算出式 / 注記"]
        lines.append("| " + " | ".join(ratio_headers) + " |")
        lines.append("|" + "|".join(["---" if i not in (2, 3) else "---:" for i in range(len(ratio_headers))]) + "|")

        ratio_definitions = [
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
        ]

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

            if curr_val is None:
                val_str = "N/A"
            elif unit == "%":
                val_str = f"{curr_val * 100:.1f}%"
            elif unit == "倍":
                val_str = f"{curr_val:.2f}倍"
            elif unit == "回":
                val_str = f"{curr_val:.2f}回"
            elif unit == "日":
                val_str = f"{curr_val:.1f}日"
            else:
                val_str = f"{curr_val:.2f}"

            diff_str = "-"
            if curr_val is not None and prev_val is not None:
                diff = curr_val - prev_val
                if unit == "%":
                    diff_str = f"{diff * 100:+.1f} pt"
                elif unit in ("倍", "回"):
                    diff_str = f"{diff:+.2f}"
                elif unit == "日":
                    diff_str = f"{diff:+.1f}日"

            trend_str = "横ばい →"
            if curr_val is not None and prev_val is not None:
                if curr_val > prev_val * 1.05:
                    trend_str = "改善/上昇 ↑"
                elif curr_val < prev_val * 0.95:
                    trend_str = "悪化/低下 ↓"

            row = [cat, name, val_str, diff_str, trend_str, eval_desc, formula_note]
            lines.append("| " + " | ".join(row) + " |")

        lines.append("")
        lines.append("### デュポン分解（ROEの要因分解）")
        d3 = latest["dupont_3stage"]
        lines.append(f"- **最新ROE**: {latest['roe']*100:.2f}% (純利益 / 自己資本)" if latest['roe'] else "- **最新ROE**: N/A")
        if d3['net_margin'] and d3['asset_turnover'] and d3['equity_multiplier']:
            lines.append(f"  - **① 売上高純利益率 (Net Margin)**: {d3['net_margin']*100:.2f}% (収益性ドライバー)")
            lines.append(f"  - **② 総資産回転率 (Asset Turnover)**: {d3['asset_turnover']:.2f}回 (資産効率ドライバー)")
            lines.append(f"  - **③ 財務レバレッジ (Equity Multiplier)**: {d3['equity_multiplier']:.2f}倍 (資本構成ドライバー)")
            lines.append(f"  - *検証算式: {d3['net_margin']*100:.2f}% × {d3['asset_turnover']:.2f} × {d3['equity_multiplier']:.2f} = {d3['roe_calculated']*100:.2f}%*")

        return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description="Corporate Finance Calculator CLI")
    parser.add_argument("--file", "-f", type=str, help="JSON input file with company financial statements")
    parser.add_argument("--demo", action="store_true", help="Run with demonstration dataset (Toyota)")
    args = parser.parse_args()

    if args.demo:
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
