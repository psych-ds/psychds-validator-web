import { useSignal } from "@preact/signals";
import { Handlers } from "$fresh/server.ts";
import Validator from "../islands/Validator.tsx";
import IssueButton from "../islands/IssueButton.tsx";

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
      <nav class="navbar navbar-dark bg-black fixed top-0 h-8 w-full">
        <div class="container pl-16 pr-auto text-left flex justify-between items-center">
          <a
            class="text-lg navbar-brand text-white p-1"
            href="https://github.com/psych-ds/psychds-validator"
            target="_blank"
          >
            Psych-DS Validator
          </a>
          <IssueButton />
        </div>
        
      </nav>
      <div class="pt-12 mr-auto ml-auto">
        <Validator />
      </div>
    </div>
  );
}