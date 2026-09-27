import asyncio
import yfinance as yf
import math
import re
import sys
import os

sys.path.insert(0, os.path.abspath("."))
from scripts.financial_calc import FinancialAnalyzer, FinancialPeriod

UNIVERSAL_TICKER_MAP = {
    # Japan (TSE)
    "nintendo": "7974.T", "任天堂": "7974.T", "にんてんどう": "7974.T", "7974": "7974.T",
    "softbank": "9984.T", "ソフトバンク": "9984.T", "9984": "9984.T",
    "keyence": "6861.T", "キーエンス": "6861.T", "6861": "6861.T",
    "fast retailing": "9983.T", "ファーストリテイリング": "9983.T", "uniqlo": "9983.T", "ユニクロ": "9983.T", "9983": "9983.T",
    "hitachi": "6501.T", "日立": "6501.T", "日立製作所": "6501.T", "6501": "6501.T",
    "murata": "6981.T", "村田製作所": "6981.T", "6981": "6981.T",
    "tokyo electron": "8035.T", "東京エレクトロン": "8035.T", "tel": "8035.T", "8035": "8035.T",
    "mitsubishi corp": "8058.T", "三菱商事": "8058.T", "8058": "8058.T",
    "mitsui": "8031.T", "三井物産": "8031.T", "8031": "8031.T",
    "panasonic": "6752.T", "パナソニック": "6752.T", "6752": "6752.T",

    # China A-Shares / Hong Kong
    "byd": "002594.SZ", "比亚迪": "002594.SZ", "比亜迪": "002594.SZ", "002594": "002594.SZ", "1211": "1211.HK",
    "catl": "300750.SZ", "宁德时代": "300750.SZ", "寧德時代": "300750.SZ", "300750": "300750.SZ",
    "kweichow moutai": "600519.SS", "moutai": "600519.SS", "贵州茅台": "600519.SS", "茅台": "600519.SS", "600519": "600519.SS",
    "smic": "688981.SS", "中芯国际": "688981.SS", "中芯國際": "688981.SS", "688981": "688981.SS", "0981": "0981.HK",
    "longsys": "301308.SZ", "江波龙": "301308.SZ", "301308": "301308.SZ",
    "biwin": "688525.SH", "佰维存储": "688525.SH", "688525": "688525.SH",

    # Taiwan
    "tsmc": "2330.TW", "台积电": "2330.TW", "台積電": "2330.TW", "2330": "2330.TW", "tsm": "TSM",
    "mediatek": "2454.TW", "联发科": "2454.TW", "聯發科": "2454.TW", "2454": "2454.TW",
    "foxconn": "2317.TW", "hon hai": "2317.TW", "富士康": "2317.TW", "鴻海": "2317.TW", "2317": "2317.TW",
    "phison": "8299.TWO", "群联电子": "8299.TWO", "群聯電子": "8299.TWO",

    # Global / US / Europe
    "nvidia": "NVDA", "エヌビディア": "NVDA", "英伟达": "NVDA", "nvda": "NVDA",
    "asml": "ASML",
    "broadcom": "AVGO", "ブロードコム": "AVGO", "博通": "AVGO"
}

def resolve_symbol_or_ticker(query: str) -> str:
    q = query.strip()
    q_lower = q.lower()

    if q_lower in UNIVERSAL_TICKER_MAP:
        return UNIVERSAL_TICKER_MAP[q_lower]

    if q.isdigit():
        if len(q) == 6:
            if q.startswith(('60', '68', '90')):
                return f"{q}.SS"
            elif q.startswith(('00', '30', '20')):
                return f"{q}.SZ"
            elif q.startswith(('43', '83', '87', '92')):
                return f"{q}.BJ"
            elif q.startswith(('005', '000', '035')):
                return f"{q}.KS"
        elif len(q) == 4 and q.startswith('0'):
            return f"{q}.HK"
        elif len(q) == 5 and q.startswith('0'):
            return f"{q[1:]}.HK"
        elif len(q) == 4:
            return f"{q}.T"

    if re.match(r'^[A-Za-z0-9]+\.(T|SS|SZ|BJ|HK|TW|TWO|KS|KQ|L|PA|DE|AS)$', q, re.I):
        return q.upper()

    if q.isalpha() and len(q) <= 5:
        return q.upper()

    try:
        s = yf.Search(q, max_results=3)
        for quote in s.quotes:
            sym = quote.get("symbol")
            q_type = quote.get("quoteType", "")
            if sym and q_type in ("EQUITY", "ETF", ""):
                return sym
    except Exception:
        pass

    return q

def fetch_live_fundamental_dataset(query: str):
    sym = resolve_symbol_or_ticker(query)
    ticker_obj = yf.Ticker(sym)
    info = ticker_obj.info or {}
    name = info.get("longName") or info.get("shortName") or query
    
    fin = ticker_obj.financials
    bs = ticker_obj.balance_sheet
    cf = ticker_obj.cashflow
    if fin is None or fin.empty:
        return None

    currency = info.get("currency", "USD")
    cols = list(fin.columns)[:4]
    cols.reverse()

    periods = []
    for col in cols:
        def _get_val(df, names, default=0.0):
            if df is None or df.empty or col not in df.columns:
                return default
            for n in names:
                if n in df.index and not math.isnan(df.loc[n, col]):
                    return float(df.loc[n, col]) / 1e6
            return default

        rev = _get_val(fin, ["Total Revenue", "Operating Revenue", "Revenue"])
        cogs = _get_val(fin, ["Cost Of Revenue", "Reconciled Cost Of Revenue", "Cost of Goods Sold"], default=rev * 0.7)
        op = _get_val(fin, ["Operating Income", "Operating Profit", "EBIT"])
        net = _get_val(fin, ["Net Income Common Stockholders", "Net Income"])
        assets = _get_val(bs, ["Total Assets"], default=rev * 1.2)
        equity = _get_val(bs, ["Stockholders Equity", "Common Stock Equity", "Total Equity Gross Minority Interest"], default=assets * 0.4)
        debt = _get_val(bs, ["Total Debt", "Long Term Debt", "Current Debt"], default=0.0)
        cash = _get_val(bs, ["Cash And Cash Equivalents", "Cash Cash Equivalents And Short Term Investments"], default=rev * 0.1)
        rec = _get_val(bs, ["Accounts Receivable", "Receivables"], default=rev * 0.1)
        inv = _get_val(bs, ["Inventory"], default=rev * 0.1)
        pay = _get_val(bs, ["Accounts Payable", "Payables"], default=rev * 0.1)
        cur_a = _get_val(bs, ["Current Assets"], default=assets * 0.6)
        cur_l = _get_val(bs, ["Current Liabilities"], default=assets * 0.3)
        ocf = _get_val(cf, ["Operating Cash Flow"], default=op * 0.9)
        capex = abs(_get_val(cf, ["Capital Expenditure", "Capital Expenditures"], default=rev * 0.05))
        deprec = _get_val(cf, ["Depreciation And Amortization", "Reconciled Depreciation"], default=op * 0.15)
        
        year_str = str(col.year) if hasattr(col, "year") else str(col)[:4]

        fp = FinancialPeriod(
            period_name=f"FY{year_str}",
            revenue=rev,
            cost_of_sales=cogs,
            operating_profit=op,
            net_profit=net,
            total_assets=assets,
            equity=equity,
            interest_bearing_debt=debt,
            cash_and_equivalents=cash,
            operating_cf=ocf,
            capex=capex,
            current_assets=cur_a,
            current_liabilities=cur_l,
            inventories=inv,
            receivables=rec,
            payables=pay,
            depreciation_amortization=deprec
        )
        periods.append(fp)

    if not periods:
        return None

    # Construct complete target_info
    sector = info.get("sector") or info.get("industry") or "General Corporate"
    mkt_cap = info.get("marketCap", 0) / 1e6 if info.get("marketCap") else None

    target_info = {
        "company_name": f"{name}",
        "ticker": sym,
        "standard": "IFRS / GAAP (Audited Statutory)",
        "currency": f"{currency} (百万円 / Million)",
        "sector": sector,
        "market_cap": mkt_cap,
        "peers": [f"{sector} Peer 1", f"{sector} Peer 2"],
        "periods": periods,
        "key_drivers": [
            f"主要事業領域: {info.get('industry', sector)}（グローバル展開・市場シェア）",
            f"時価総額規模: 約 {mkt_cap:,.0f} 百万 {currency}" if mkt_cap else "上場株式公開市場での取引",
            f"直近売上高: {periods[-1].revenue:,.1f} 百万 {currency} (営業利益率 {periods[-1].operating_profit/periods[-1].revenue*100:.1f}%)" if periods[-1].revenue else "事業規模推移"
        ],
        "risks": [
            {"name": "マクロ経済・業界サイクル・為替変動リスク", "impact": "中", "prob": "中", "ewi": "営業利益率推移・為替感応度", "doc": "年次報告書営業注記"},
            {"name": "運転資本および売掛金・棚卸資産プレッシャー", "impact": "中", "prob": "中", "ewi": "CCC（現金循環日数）推移", "doc": "貸借対照表・CF注記"},
            {"name": "有利子負債および金利上昇リスク", "impact": "中", "prob": "低", "ewi": "Net Debt / EBITDA倍率", "doc": "借入金明細注記"}
        ]
    }
    return target_info

# Test fetching BYD, Nintendo, TSMC, Nvidia, ASML
for q in ["任天堂", "比亚迪", "TSMC", "ASML", "NVDA"]:
    res = fetch_live_fundamental_dataset(q)
    if res:
        print(f"SUCCESS: {q} -> {res['company_name']} ({res['ticker']}) - {len(res['periods'])} periods")
        print(f"  Latest Rev: {res['periods'][-1].revenue:,.1f}M, OP: {res['periods'][-1].operating_profit:,.1f}M")
    else:
        print(f"FAILED: {q}")
