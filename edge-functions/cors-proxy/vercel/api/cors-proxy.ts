/**
 * Vercel Edge Function: CORS Proxy for MCP Servers
 *
 * This edge function adds CORS headers to MCP server responses,
 * enabling browser-based ART apps to connect to MCP servers
 * without requiring browser extensions.
 *
 * Deploy: vercel deploy
 * Usage: https://your-project.vercel.app/api/cors-proxy?url=https://mcp.linear.app/mcp
 */

import { NextRequest, NextResponse } from 'next/server';

// Configuration
const CONFIG = {
  // Domain allowlist (empty = allow all, recommended: specify your MCP servers)
  ALLOWED_DOMAINS: [
    // 'mcp.linear.app',
    // 'mcp.github.com',
    // Add your MCP server domains here
  ],

  // Maximum request size (10MB)
  MAX_REQUEST_SIZE: 10 * 1024 * 1024,

  // Request timeout (30 seconds)
  REQUEST_TIMEOUT: 30000,

  // Enable detailed logging (disable in production)
  DEBUG: process.env.NODE_ENV !== 'production'
};

/**
 * Handle all HTTP methods
 */
export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request);
}

export async function OPTIONS(request: NextRequest) {
  // Handle preflight requests
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request)
  });
}

/**
 * Main request handler
 */
async function handleRequest(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract target URL
    const targetUrl = request.nextUrl.searchParams.get('url');

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
          `Domain "${parsedUrl.hostname}" not allowed. Allowed domains: ${CONFIG.ALLOWED_DOMAINS.join(', ')}`,
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

    // Copy relevant headers from original request
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
    upstreamHeaders.set('user-agent', 'ART-Framework-CORS-Proxy/1.0');

    // Prepare request options
    const requestOptions: RequestInit = {
      method: request.method,
      headers: upstreamHeaders,
      // @ts-ignore - Vercel Edge Runtime supports signal
      signal: AbortSignal.timeout(CONFIG.REQUEST_TIMEOUT)
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

    // Make upstream request
    const upstreamResponse = await fetch(targetUrl, requestOptions);

    // Get response headers
    const responseHeaders = new Headers(upstreamResponse.headers);

    // Add CORS headers
    const corsHeaders = getCorsHeaders(request);
    for (const [key, value] of corsHeaders.entries()) {
      responseHeaders.set(key, value);
    }

    // Preserve important MCP headers
    const preserveHeaders = [
      'mcp-session-id',
      'mcp-protocol-version',
      'content-type',
      'cache-control'
    ];

    for (const header of preserveHeaders) {
      const value = upstreamResponse.headers.get(header);
      if (value) {
        responseHeaders.set(header, value);
      }
    }

    // Handle streaming responses (SSE)
    const contentType = upstreamResponse.headers.get('content-type') || '';
    if (contentType.includes('text/event-stream')) {
      // Stream response for SSE
      return new NextResponse(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders
      });
    }

    // Return response with CORS headers
    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders
    });

  } catch (error: any) {
    console.error('[CORS Proxy] Error:', error);

    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return errorResponse('Request timeout', 504, request);
    }

    return errorResponse(
      `Proxy error: ${error.message}`,
      500,
      request
    );
  }
}

/**
 * Get CORS headers
 */
function getCorsHeaders(request: NextRequest): Headers {
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
  request: NextRequest
): NextResponse {
  const headers = getCorsHeaders(request);
  headers.set('Content-Type', 'application/json');

  return new NextResponse(
    JSON.stringify({ error: message }),
    {
      status,
      headers
    }
  );
}

// Export config for Vercel Edge Runtime
export const config = {
  runtime: 'edge'
};
