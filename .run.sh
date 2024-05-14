#!/bin/bash
deno run -A dev.ts build
deno run --allow-read --allow-env --allow-net --allow-run main.ts
