import { FinnhubMCP } from "./mcp";

interface Env {
  FINNHUB_API_KEY: string;
  FINNHUB_MCP: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response(JSON.stringify({ name: "finnhub-mcp", version: "1.0.0", status: "ok", mcp_endpoint: "/mcp" }), { headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/mcp" || url.pathname.startsWith("/mcp/")) {
      return FinnhubMCP.serveSSE("/mcp").fetch(request, env, ctx);
    }
    return new Response("Not Found", { status: 404 });
  },
};

export { FinnhubMCP };
