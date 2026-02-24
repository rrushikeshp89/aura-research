// This file provides Deno type declarations for IDE support.
// Supabase Edge Functions run on Deno, but our VS Code is configured
// for Node/Vite, so we declare the minimal Deno API surface used.

declare namespace Deno {
    function serve(handler: (req: Request) => Response | Promise<Response>): void;
    const env: {
        get(key: string): string | undefined;
    };
}
