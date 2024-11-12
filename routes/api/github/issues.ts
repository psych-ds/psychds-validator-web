import { Handlers } from "$fresh/server.ts";
import { createAppAuth } from "https://esm.sh/@octokit/auth-app";


export const handler: Handlers = {
  async POST(req) {
    const APP_ID = Deno.env.get("GH_APP_ID");
    const PRIVATE_KEY = Deno.env.get("GH_PRIVATE_KEY");
    const INSTALLATION_ID = Deno.env.get("GH_INSTALLATION_ID");

    if (!APP_ID || !PRIVATE_KEY || !INSTALLATION_ID) {
      return new Response("Missing required environment variables", { 
        status: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          appId: !!APP_ID,
          privateKey: !!PRIVATE_KEY,
          installationId: !!INSTALLATION_ID
        })
      });
    }

    try {
        const auth = createAppAuth({
            appId: APP_ID,
            privateKey: PRIVATE_KEY,
            installationId: INSTALLATION_ID
          });

        const { token } = await auth({ type: "installation" });

        const response = await fetch('https://api.github.com/repos/psych-ds/psychds-validator-web/issues', {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            },
            body: req.body
        });

        if (!response.ok) {
            const error = await response.text();
            return new Response(error, { status: response.status });
        }

        return new Response(JSON.stringify(await response.json()), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(error.message, { status: 500 });
    }
  },
};