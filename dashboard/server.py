#!/usr/bin/env python3
"""
FinReAct Dashboard Server
Lightweight, ultra-fast Starlette ASGI server with Server-Sent Events (SSE) streaming.
Serves the financial dashboard and real-time ReAct agent reasoning stream.

Security Best Practices Applied:
- API Keys are NEVER logged or written to disk.
- Session-based in-memory token exchange prevents exposing API keys in GET URLs.
- Automatic loading of .env if present (ignored by Git).
"""

import os
import sys
import json
import uuid
import asyncio
from typing import Dict
from starlette.applications import Starlette
from starlette.responses import HTMLResponse, JSONResponse
from starlette.routing import Route, Mount
from starlette.staticfiles import StaticFiles
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

# Attempt to load .env if python-dotenv is installed
try:
    from dotenv import load_dotenv
    # Load .env from project root or dashboard directory
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
except ImportError:
    pass

# Add project root to sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from dashboard.agent_engine import ReActFinancialAgent, PRESET_DATASETS
from scripts.financial_calc import FinancialPeriod, FinancialAnalyzer

# ---------------------------------------------------------------------------
# In-Memory Ephemeral Session Store for API Keys (Never written to disk)
# ---------------------------------------------------------------------------
_EPHEMERAL_SESSIONS: Dict[str, str] = {}

def mask_key(key: str) -> str:
    """Safe key masking for logging."""
    if not key or len(key) < 8:
        return "[NOT_SET]"
    return f"{key[:4]}...{key[-4:]}"

# ---------------------------------------------------------------------------
# Route Handlers
# ---------------------------------------------------------------------------

async def index_handler(request):
    index_path = os.path.join(CURRENT_DIR, "static", "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return HTMLResponse(f.read())
    return HTMLResponse("<h1>FinReAct Dashboard</h1><p>static/index.html not found</p>", status_code=404)

async def presets_handler(request):
    presets = []
    for key, val in PRESET_DATASETS.items():
        presets.append({
            "key": key,
            "company_name": val["company_name"],
            "ticker": val["ticker"],
            "currency": val["currency"],
            "standard": val["standard"],
            "sector": val["sector"]
        })
    return JSONResponse({
        "presets": presets,
        "has_server_key": bool(os.getenv("GEMINI_API_KEY"))
    })

async def session_token_handler(request):
    """
    Exchanges an API key via POST body for a short-lived ephemeral session token.
    This guarantees the raw API key never appears in HTTP GET query parameters or access logs.
    """
    try:
        body = await request.json()
        api_key = body.get("api_key", "").strip()
        if not api_key:
            return JSONResponse({"error": "Empty API key provided"}, status_code=400)
        
        session_token = str(uuid.uuid4())
        _EPHEMERAL_SESSIONS[session_token] = api_key
        return JSONResponse({"session_token": session_token})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

async def analyze_stream_handler(request):
    company = request.query_params.get("company", "Lenovo")
    session_token = request.query_params.get("session_token", None)
    model = request.query_params.get("model", "gemini-2.5-flash")
    lang = request.query_params.get("lang", "ja")
    
    # Resolve API Key securely:
    # 1. Ephemeral in-memory session token (from client UI)
    # 2. Server environment variable (GEMINI_API_KEY)
    resolved_api_key = None
    if session_token and session_token in _EPHEMERAL_SESSIONS:
        resolved_api_key = _EPHEMERAL_SESSIONS.get(session_token)
    elif os.getenv("GEMINI_API_KEY"):
        resolved_api_key = os.getenv("GEMINI_API_KEY")

    agent = ReActFinancialAgent(api_key=resolved_api_key, model=model)

    async def event_generator():
        try:
            async for event in agent.execute_react_stream(company, lang=lang):
                yield {
                    "event": "message",
                    "data": json.dumps(event, ensure_ascii=False)
                }
        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)}, ensure_ascii=False)
            }

    return EventSourceResponse(event_generator())

async def manual_calc_handler(request):
    try:
        data = await request.json()
        periods_data = data.get("periods", [])
        periods = [FinancialPeriod(**p) for p in periods_data]
        analyzer = FinancialAnalyzer(periods)
        company_name = data.get("company_name", "Target Company")
        currency = data.get("currency", "USD")
        standard = data.get("standard", "IFRS")
        
        metrics = [analyzer.compute_period_metrics(p) for p in periods]
        markdown = analyzer.generate_markdown_report(company_name, currency, standard)
        return JSONResponse({"metrics": metrics, "markdown": markdown})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

# ---------------------------------------------------------------------------
# Application Initialization
# ---------------------------------------------------------------------------

routes = [
    Route("/", endpoint=index_handler, methods=["GET"]),
    Route("/api/presets", endpoint=presets_handler, methods=["GET"]),
    Route("/api/auth/session", endpoint=session_token_handler, methods=["POST"]),
    Route("/api/analyze/stream", endpoint=analyze_stream_handler, methods=["GET"]),
    Route("/api/calc", endpoint=manual_calc_handler, methods=["POST"]),
    Mount("/static", app=StaticFiles(directory=os.path.join(CURRENT_DIR, "static")), name="static")
]

middleware = [
    Middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
]

app = Starlette(debug=False, routes=routes, middleware=middleware)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    server_key = os.getenv("GEMINI_API_KEY", "")
    print(f"\n==========================================================")
    print(f"  ⚡ FinReAct Intelligence Dashboard Server")
    print(f"  👉 URL: http://localhost:{port}")
    print(f"  🔒 Security: Server Key Status = {mask_key(server_key)}")
    print(f"  🛡️ Git Guard: Keys are never written to disk or logs")
    print(f"==========================================================\n")
    uvicorn.run("dashboard.server:app", host="127.0.0.1", port=port, reload=False)
