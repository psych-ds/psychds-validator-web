import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="/jsonld.min.js"></script>
        <script src="/psychds-validator.js" type="module"></script>
        <script data-goatcounter="https://psychdsvalidator.goatcounter.com/count" data-goatcounter-settings='{"allow_frame": true}'
        async src="//gc.zgo.at/count.js"></script>
        <script type="module">
          import * as psychDSValidator from '/psychds-validator.js';
          console.log('psychDSValidator:', psychDSValidator);
          window.psychDSValidator = psychDSValidator;
        </script>

        <title>Psych-DS Validator</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
