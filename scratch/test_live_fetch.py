import yfinance as yf
import math
import sys
import os

sys.path.insert(0, os.path.abspath("."))
from scripts.financial_calc import FinancialAnalyzer, FinancialPeriod

def test_fetch(symbol):
    t = yf.Ticker(symbol)
    fin = t.financials
    bs = t.balance_sheet
    cf = t.cashflow
    info = t.info
    name = info.get("shortName") or info.get("longName") or symbol
    curr = info.get("currency", "USD")
    print(f"\n==========================================")
    print(f"Testing {symbol}: {name} ({curr})")
    print(f"==========================================")
    if fin is None or fin.empty:
        print("No financials found!")
        return

    cols = list(fin.columns)[:4]
    cols.reverse()
    periods = []
    for col in cols:
        def get_v(df, names, default=0.0):
            if df is None or df.empty or col not in df.columns:
                return default
            for n in names:
                if n in df.index and not math.isnan(df.loc[n, col]):
                    return float(df.loc[n, col])
            return default

        rev = get_v(fin, ['Total Revenue', 'Operating Revenue'])
        cogs = get_v(fin, ['Cost Of Revenue', 'Reconciled Cost Of Revenue'], default=rev * 0.7)
        op = get_v(fin, ['Operating Income', 'EBIT'])
        net = get_v(fin, ['Net Income Common Stockholders', 'Net Income'])
        assets = get_v(bs, ['Total Assets'], default=rev * 1.2)
        equity = get_v(bs, ['Stockholders Equity', 'Common Stock Equity', 'Total Equity Gross Minority Interest'], default=assets * 0.4)
        debt = get_v(bs, ['Total Debt', 'Long Term Debt', 'Current Debt'], default=0.0)
        cash = get_v(bs, ['Cash And Cash Equivalents', 'Cash Cash Equivalents And Short Term Investments'], default=rev * 0.1)
        rec = get_v(bs, ['Accounts Receivable', 'Receivables'], default=rev * 0.1)
        inv = get_v(bs, ['Inventory'], default=rev * 0.1)
        pay = get_v(bs, ['Accounts Payable', 'Payables'], default=rev * 0.1)
        cur_a = get_v(bs, ['Current Assets'], default=assets * 0.6)
        cur_l = get_v(bs, ['Current Liabilities'], default=assets * 0.3)
        ocf = get_v(cf, ['Operating Cash Flow'], default=op * 0.9)
        capex = abs(get_v(cf, ['Capital Expenditure'], default=rev * 0.05))
        deprec = get_v(cf, ['Depreciation And Amortization', 'Reconciled Depreciation'], default=op * 0.15)
        
        year = str(col.year) if hasattr(col, 'year') else str(col)[:4]
        period_name = f"FY{year}"

        fp = FinancialPeriod(
            period_name=period_name,
            revenue=rev / 1e6,
            cost_of_sales=cogs / 1e6,
            operating_profit=op / 1e6,
            net_profit=net / 1e6,
            total_assets=assets / 1e6,
            equity=equity / 1e6,
            interest_bearing_debt=debt / 1e6,
            cash_and_equivalents=cash / 1e6,
            operating_cf=ocf / 1e6,
            capex=capex / 1e6,
            current_assets=cur_a / 1e6,
            current_liabilities=cur_l / 1e6,
            inventories=inv / 1e6,
            receivables=rec / 1e6,
            payables=pay / 1e6,
            depreciation_amortization=deprec / 1e6
        )
        periods.append(fp)
        print(f"  {period_name}: Rev={rev/1e6:,.1f}M, OP={op/1e6:,.1f}M, Net={net/1e6:,.1f}M, Assets={assets/1e6:,.1f}M, OCF={ocf/1e6:,.1f}M")

    # Analyze with FinancialAnalyzer
    analyzer = FinancialAnalyzer(periods)
    computed_metrics = [analyzer.compute_period_metrics(p) for p in periods]
    latest = computed_metrics[-1]
    dupont = latest["dupont_3stage"]
    print(f"\n  [Deterministic Metrics for {latest['period_name']}]")
    print(f"  - ROE (DuPont): {latest['roe']*100:.2f}% (Margin={dupont['net_margin']*100:.2f}%, Turnover={dupont['asset_turnover']:.2f}x, Leverage={dupont['equity_multiplier']:.2f}x)")
    print(f"  - Operating Margin: {latest['operating_margin']*100:.2f}%")
    print(f"  - Free Cash Flow: {latest['fcf']:,.1f}M")
    print(f"  - CCC: {latest['ccc']:.1f} days (DSO={latest['dso']:.1f}, DIO={latest['dio']:.1f}, DPO={latest['dpo']:.1f})")
    print(f"  - Net Debt / EBITDA: {latest['net_debt_to_ebitda']:.2f}x" if latest['net_debt_to_ebitda'] else "  - Net Debt / EBITDA: N/A")

if __name__ == '__main__':
    for sym in ['7974.T', '002594.SZ', '2330.TW', 'ASML']:
        test_fetch(sym)
