import asyncio
import yfinance as yf
import math
import re
import sys
import os

sys.path.insert(0, os.path.abspath("."))
from scripts.financial_calc import FinancialAnalyzer, FinancialPeriod

# Expanded multi-lingual alias map
UNIVERSAL_ALIASES = {
    # Japan (TSE)
    "nintendo": "7974.T", "任天堂": "7974.T", "にんてんどう": "7974.T", "7974": "7974.T",
    "softbank": "9984.T", "ソフトバンク": "9984.T", "softbank group": "9984.T", "9984": "9984.T",
    "keyence": "6861.T", "キーエンス": "6861.T", "6861": "6861.T",
    "fast retailing": "9983.T", "ファーストリテイリング": "9983.T", "uniqlo": "9983.T", "ユニクロ": "9983.T", "9983": "9983.T",
    "hitachi": "6501.T", "日立": "6501.T", "日立製作所": "6501.T", "6501": "6501.T",
    "murata": "6981.T", "村田製作所": "6981.T", "6981": "6981.T",
    "tokyo electron": "8035.T", "東京エレクトロン": "8035.T", "tel": "8035.T", "8035": "8035.T",
    "mitsubishi corp": "8058.T", "三菱商事": "8058.T", "8058": "8058.T",

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
    "microsoft": "MSFT", "マイクロソフト": "MSFT", "微软": "MSFT", "msft": "MSFT",
    "google": "GOOGL", "alphabet": "GOOGL", "グーグル": "GOOGL", "谷歌": "GOOGL",
    "amazon": "AMZN", "アマゾン": "AMZN", "亚马逊": "AMZN",
    "meta": "META", "facebook": "META",
    "broadcom": "AVGO", "ブロードコム": "AVGO", "博通": "AVGO"
}

def resolve_symbol_or_ticker(query: str) -> str:
    q = query.strip()
    q_lower = q.lower()

    # 1. Check direct alias
    if q_lower in UNIVERSAL_ALIASES:
        return UNIVERSAL_ALIASES[q_lower]

    # 2. Pattern matching for numeric codes
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
        elif len(q) == 5 and q.startswith('0'):
            return f"{q[1:]}.HK"
        elif len(q) == 4:
            # 4 digits could be Japan or HK or Taiwan
            # Check yfinance for .T first
            return f"{q}.T"

    # 3. Handle suffix patterns (e.g. 7974.T, 002594.SZ, 0700.HK, 2330.TW)
    if re.match(r'^[A-Za-z0-9]+\.(T|SS|SZ|BJ|HK|TW|TWO|KS|KQ|L|PA|DE|AS)$', q, re.I):
        return q.upper()

    # 4. Standard US Ticker (1-5 alphabetical chars, e.g. NVDA, AAPL, TSLA)
    if q.isalpha() and len(q) <= 5:
        return q.upper()

    # 5. Try yf.Search for English/Romanized queries
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

print("Testing symbol resolution:")
test_queries = [
    "任天堂", "7974", "BYD", "002594", "比亚迪", "TSMC", "2330", "CATL", "300750",
    "NVDA", "英伟达", "ASML", "ソフトバンク", "村田製作所", "600519", "茅台", "0700"
]
for tq in test_queries:
    res = resolve_symbol_or_ticker(tq)
    print(f"  '{tq}' -> {res}")
