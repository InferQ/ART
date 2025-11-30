# CORS Proxy Edge Functions for ART MCP

Simple CORS proxy for browser-based MCP connections. Eliminates the need for browser extensions.

## Why You Need This

Browser apps using ART cannot directly connect to MCP servers due to CORS restrictions. This edge function acts as a proxy that:

1. ✅ Adds necessary CORS headers
2. ✅ Forwards requests to MCP servers
3. ✅ Returns responses with CORS enabled
4. ✅ Supports both HTTP and Server-Sent Events (SSE)

## Deployment Options

### Option 1: Vercel Edge Functions (Recommended)

**Pros**: Fastest global edge network, free tier, simple deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd edge-functions/cors-proxy
vercel deploy
```

Your proxy will be available at: `https://your-project.vercel.app/api/cors-proxy`

### Option 2: Cloudflare Workers

**Pros**: Excellent global performance, generous free tier

```bash
# Install Wrangler CLI
npm i -g wrangler

# Deploy
cd edge-functions/cors-proxy/cloudflare
wrangler deploy
```

Your proxy will be available at: `https://cors-proxy.your-subdomain.workers.dev`

### Option 3: Netlify Edge Functions

**Pros**: Integrated with Netlify, easy for existing users

See `netlify/` directory for setup instructions.

## Usage in ART

Once deployed, configure your ART app to use the proxy:

```typescript
import { createArtInstance } from '@art-framework/core';

const art = await createArtInstance({
  mcp: {
    enabled: true,
    // Use your edge function as proxy
    proxyUrl: 'https://your-project.vercel.app/api/cors-proxy',

    servers: {
      linear: {
        url: 'https://mcp.linear.app/mcp',
        oauth: { /* ... */ }
      }
    }
  }
});
```

The MCP client will automatically route requests through the proxy.

## Security Considerations

### ⚠️ Important Security Notes

1. **Domain Allowlist**: The example code allows all domains (`*`). In production, restrict to your MCP servers:

   ```typescript
   const ALLOWED_DOMAINS = [
     'mcp.linear.app',
     'mcp.github.com',
     'mcp.your-company.com'
   ];
   ```

2. **Rate Limiting**: Add rate limiting to prevent abuse:

   ```typescript
   // Vercel example with @upstash/ratelimit
   import { Ratelimit } from "@upstash/ratelimit";

   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(100, "1 m"),
   });
   ```

3. **Authentication**: For private MCP servers, add authentication:

   ```typescript
   const authHeader = request.headers.get('X-Proxy-Auth');
   if (authHeader !== process.env.PROXY_SECRET) {
     return new Response('Unauthorized', { status: 401 });
   }
   ```

4. **Logging**: Monitor proxy usage for security auditing.

## Cost Estimate

All platforms have generous free tiers:

- **Vercel**: 100GB bandwidth/month free
- **Cloudflare**: 100,000 requests/day free
- **Netlify**: 100GB bandwidth/month free

For most apps, you'll stay within free tier limits.

## Troubleshooting

### CORS errors still occurring

- Check the `Access-Control-Allow-Origin` header in response
- Verify your proxy URL is correct
- Ensure MCP server URL doesn't already have CORS enabled (double proxy)

### SSE (Server-Sent Events) not working

- Ensure `Content-Type: text/event-stream` is preserved
- Check that `Transfer-Encoding` is not modified
- Verify streaming is enabled in edge function config

### High latency

- Deploy edge function to region closest to your MCP servers
- Use Cloudflare if MCP servers are on Cloudflare
- Consider caching for frequently accessed endpoints

## Alternative: Direct MCP Server CORS

If you control the MCP server, enable CORS directly instead:

```typescript
// Express.js example
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://your-app.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});
```

This is more efficient than a proxy, but requires server access.

## Support

- **Issues**: https://github.com/InferQ/ART/issues
- **Discussions**: https://github.com/InferQ/ART/discussions
- **Documentation**: https://art-framework.dev/docs/mcp/cors

## License

MIT - see LICENSE file
