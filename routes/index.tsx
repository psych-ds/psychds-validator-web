import { useSignal } from "@preact/signals";
import { Handlers } from "$fresh/server.ts";
import Validator from "../islands/Validator.tsx";

export const handler: Handlers = {
  async GET(req, ctx) {
    const origin = req.headers.get("Origin") || "*";
    const resp = await ctx.render();
    resp.headers.set("Access-Control-Allow-Origin", origin);
    return resp;
  },
};

export default function Home() {
  return (
    <div id="root">
      <nav class="navbar navbar-dark bg-black fixed top-0 w-full">
          <div class=" pl-16">
              <a
                class="navbar-brand text-white mr-auto p-1 pt-2 pb-2"
                href="https://www.npmjs.com/package/bids-validator"
                target="_blank">
                Psych-DS Validator
              </a>
          </div>
        </nav>
      <div class="pt-12 mr-auto ml-auto">
        <Validator />
      </div>
    </div>
  );
}
