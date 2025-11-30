/**
 * Cloudflare Worker: CORS Proxy for MCP Servers
 *
 * This worker adds CORS headers to MCP server responses,
 * enabling browser-based ART apps to connect to MCP servers
 * without requiring browser extensions.
 *
 * Deploy: wrangler deploy
 * Usage: https://cors-proxy.your-subdomain.workers.dev/?url=https://mcp.linear.app/mcp
 */

// Configuration
const CONFIG = {
  // Domain allowlist (empty = allow all, recommended: specify your MCP servers)
  ALLOWED_DOMAINS: [
    // 'mcp.linear.app',
    // 'mcp.github.com',
    // Add your MCP server domains here
  ] as string[],

  // Maximum request size (10MB)
  MAX_REQUEST_SIZE: 10 * 1024 * 1024,

  // Request timeout (30 seconds)
  REQUEST_TIMEOUT: 30000,

  // Enable detailed logging
  DEBUG: false
};

/**
 * Main request handler
 */
export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request)
      });
    }

    try {
      // Extract target URL
      const url = new URL(request.url);
      const targetUrl = url.searchParams.get('url');

      if (!targetUrl) {
        return errorResponse('Missing "url" query parameter', 400, request);
      }

      // Validate and parse URL
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(targetUrl);
      } catch {
        return errorResponse('Invalid URL format', 400, request);
      }

      // Check domain allowlist
      if (CONFIG.ALLOWED_DOMAINS.length > 0) {
        if (!CONFIG.ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
          return errorResponse(
            `Domain "${parsedUrl.hostname}" not allowed`,
            403,
            request
          );
        }
      }

      // Log request (if debugging)
      if (CONFIG.DEBUG) {
        console.log(`[CORS Proxy] ${request.method} ${targetUrl}`);
      }

      // Prepare headers for upstream request
      const upstreamHeaders = new Headers();

      // Copy relevant headers
      const headersToForward = [
        'authorization',
        'content-type',
        'accept',
        'mcp-session-id',
        'mcp-protocol-version'
      ];

      for (const header of headersToForward) {
        const value = request.headers.get(header);
        if (value) {
          upstreamHeaders.set(header, value);
        }
      }

      // Add user agent
      upstreamHeaders.set('user-agent', 'ART-Framework-CORS-Proxy/1.0 (Cloudflare)');

      // Prepare request options
      const requestOptions: RequestInit = {
        method: request.method,
        headers: upstreamHeaders
      };

      // Add body for POST/PUT/DELETE
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        // Check request size
        const contentLength = request.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > CONFIG.MAX_REQUEST_SIZE) {
          return errorResponse('Request body too large', 413, request);
        }

        requestOptions.body = request.body;
      }

      // Make upstream request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

      try {
        const upstreamResponse = await fetch(targetUrl, {
          ...requestOptions,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Get response headers
        const responseHeaders = new Headers(upstreamResponse.headers);

        // Add CORS headers
        const corsHeaders = getCorsHeaders(request);
        for (const [key, value] of corsHeaders.entries()) {
          responseHeaders.set(key, value);
        }

        // Return response with CORS headers
        return new Response(upstreamResponse.body, {
          status: upstreamResponse.status,
          statusText: upstreamResponse.statusText,
          headers: responseHeaders
        });

      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          return errorResponse('Request timeout', 504, request);
        }
        throw fetchError;
      }

    } catch (error: any) {
      console.error('[CORS Proxy] Error:', error);

      return errorResponse(
        `Proxy error: ${error.message}`,
        500,
        request
      );
    }
  }
};

/**
 * Get CORS headers
 */
function getCorsHeaders(request: Request): Headers {
  const headers = new Headers();

  // Allow all origins (or specify your app domains)
  const origin = request.headers.get('origin') || '*';
  headers.set('Access-Control-Allow-Origin', origin);

  // Allow credentials
  if (origin !== '*') {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Allow methods
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  // Allow headers
  headers.set('Access-Control-Allow-Headers', '*');

  // Expose headers
  headers.set('Access-Control-Expose-Headers', 'Mcp-Session-Id, Mcp-Protocol-Version');

  // Max age for preflight cache
  headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return headers;
}

/**
 * Create error response with CORS headers
 */
function errorResponse(
  message: string,
  status: number,
  request: Request
): Response {
  const headers = getCorsHeaders(request);
  headers.set('Content-Type', 'application/json');

  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers
    }
  );
}
