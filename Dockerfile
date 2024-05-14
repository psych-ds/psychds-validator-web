FROM denoland/deno:1.38.3

ARG GIT_REVISION
ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}

COPY . .

CMD ["run","--allow-read","--allow-env","--allow-net","--allow-run","main.ts"]

