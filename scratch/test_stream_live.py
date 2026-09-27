import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath("."))
from dashboard.agent_engine import ReActFinancialAgent

async def run_test():
    agent = ReActFinancialAgent()
    for query in ["任天堂", "002594", "TSMC", "ASML"]:
        print(f"\n==============================================")
        print(f"RUNNING STREAM TEST FOR: {query}")
        print(f"==============================================")
        final_rep = None
        async for event in agent.execute_react_stream(query, lang="ja"):
            ev_type = event.get("type")
            step = event.get("step")
            if ev_type == "thought":
                print(f"  🧠 Step {step} Thought: {event.get('title')}")
            elif ev_type == "action":
                print(f"  ⚡ Step {step} Action: {event.get('tool')}")
            elif ev_type == "observation":
                first_line = event.get('content', '').split('\n')[0]
                print(f"  👁️ Step {step} Obs: {first_line}")
            elif ev_type == "final_report":
                final_rep = event
                meta = event.get("meta", {})
                kpis = event.get("kpis", {})
                charts = event.get("charts", {})
                print(f"  ✅ FINAL REPORT GENERATED:")
                print(f"     Company: {meta.get('company_name')} ({meta.get('ticker')})")
                print(f"     Currency: {meta.get('currency')} | Standard: {meta.get('standard')}")
                print(f"     Sources: {meta.get('sources')}")
                print(f"     Revenue: {kpis.get('revenue')} | OPM: {kpis.get('operating_margin')} | ROE: {kpis.get('roe')}")
                print(f"     DuPont: Margin={charts.get('dupont_latest', {}).get('net_margin')}%, Turnover={charts.get('dupont_latest', {}).get('asset_turnover')}x, Lev={charts.get('dupont_latest', {}).get('equity_multiplier')}x")
                print(f"     CCC: {kpis.get('ccc')} (DSO={charts.get('ccc_latest', {}).get('dso')}, DIO={charts.get('ccc_latest', {}).get('dio')}, DPO={charts.get('ccc_latest', {}).get('dpo')})")
                print(f"     Health Score: {meta.get('health_score')}/100")
                break
        if not final_rep:
            print("  ❌ FAILED TO GENERATE FINAL REPORT")

if __name__ == '__main__':
    asyncio.run(run_test())
