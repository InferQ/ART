import { describe, it, expect } from 'vitest';
import { GroqAdapter } from '../src/integrations/reasoning/groq';
import type { ArtStandardPrompt, CallOptions, RuntimeProviderConfig, StreamEvent } from '../src/types';

// Simple streaming test for Groq adapter.
// Requires environment variable GROQ_API_KEY to be set.

const GROQ_API_KEY = process.env.GROQ_API_KEY;
// Use Groq's default fast model
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Skip test if no API key is available
const maybeDescribe = GROQ_API_KEY ? describe : describe.skip;

maybeDescribe('GroqAdapter (integration)', () => {
    it('streams tokens and yields proper events', async () => {
        const adapter = new GroqAdapter({ apiKey: GROQ_API_KEY!, model: GROQ_MODEL });

        const prompt: ArtStandardPrompt = [
            { role: 'user', content: 'Say hello in one sentence.' }
        ];

        const providerConfig: RuntimeProviderConfig = {
            providerName: 'groq',
            modelId: GROQ_MODEL,
            adapterOptions: { apiKey: 'hidden' },
        };

        const options: CallOptions = {
            threadId: `test-thread-${Date.now()}`,
            traceId: `test-trace-${Date.now()}`,
            sessionId: 'test-session',
            stream: true,
            callContext: 'FINAL_SYNTHESIS',
            providerConfig,
        };

        const stream = await adapter.call(prompt, options);

        const events: StreamEvent[] = [];
        let tokens = 0;
        let hadError: Error | null = null;

        try {
            for await (const evt of stream) {
                events.push(evt);
                if (evt.type === 'TOKEN') {
                    tokens += 1;
                    // eslint-disable-next-line no-console
                    console.log(`[TOKEN ${tokens}] type=${evt.tokenType ?? 'UNKNOWN'} len=${(evt.data ?? '').length}`);
                    // eslint-disable-next-line no-console
                    console.log(evt.data);
                } else if (evt.type === 'ERROR') {
                    hadError = evt.data instanceof Error ? evt.data : new Error(String(evt.data));
                }
            }
        } catch (err: any) {
            hadError = err instanceof Error ? err : new Error(String(err));
        }

        // Console diagnostics
        // eslint-disable-next-line no-console
        console.log('[GroqAdapter Test] token count:', tokens);
        const metadataEvt = events.find(e => e.type === 'METADATA');
        // eslint-disable-next-line no-console
        console.log('[GroqAdapter Test] metadata:', metadataEvt?.data);
        const endEvt = events.find(e => e.type === 'END');
        // eslint-disable-next-line no-console
        console.log('[GroqAdapter Test] end event received:', !!endEvt);

        expect(hadError).toBeNull();
        expect(tokens).toBeGreaterThan(0);
        expect(endEvt).toBeDefined();
    }, 30000);

    it('handles non-streaming requests', async () => {
        const adapter = new GroqAdapter({ apiKey: GROQ_API_KEY!, model: GROQ_MODEL });

        const prompt: ArtStandardPrompt = [
            { role: 'user', content: 'What is 2+2? Answer with just the number.' }
        ];

        const providerConfig: RuntimeProviderConfig = {
            providerName: 'groq',
            modelId: GROQ_MODEL,
            adapterOptions: { apiKey: 'hidden' },
        };

        const options: CallOptions = {
            threadId: `test-thread-${Date.now()}`,
            traceId: `test-trace-${Date.now()}`,
            sessionId: 'test-session',
            stream: false,
            callContext: 'AGENT_THOUGHT',
            providerConfig,
        };

        const stream = await adapter.call(prompt, options);

        const events: StreamEvent[] = [];
        let hadError: Error | null = null;

        try {
            for await (const evt of stream) {
                events.push(evt);
                if (evt.type === 'ERROR') {
                    hadError = evt.data instanceof Error ? evt.data : new Error(String(evt.data));
                }
            }
        } catch (err: any) {
            hadError = err instanceof Error ? err : new Error(String(err));
        }

        // eslint-disable-next-line no-console
        console.log('[GroqAdapter Non-Streaming Test] events:', events.map(e => e.type));
        const tokenEvt = events.find(e => e.type === 'TOKEN');
        // eslint-disable-next-line no-console
        console.log('[GroqAdapter Non-Streaming Test] token data:', tokenEvt?.data);
        const metadataEvt = events.find(e => e.type === 'METADATA');
        // eslint-disable-next-line no-console
        console.log('[GroqAdapter Non-Streaming Test] metadata:', metadataEvt?.data);

        expect(hadError).toBeNull();
        expect(tokenEvt).toBeDefined();
        expect(metadataEvt).toBeDefined();
        const endEvt = events.find(e => e.type === 'END');
        expect(endEvt).toBeDefined();
    }, 30000);
});
