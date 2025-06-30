# Psych-DS Web Validator

A web-based validation tool for checking dataset compliance with the Psych-DS standard. Try it at [psych-ds.github.io/validator](https://psych-ds.github.io/validator/).

## Features

- Upload and validate datasets against the Psych-DS schema
- Interactive feedback showing validation results
- Detailed error messages and suggestions for fixes
- Direct GitHub issue submission for bug reports and feature requests

## Tech Stack

- [Deno](https://deno.land/) - Runtime environment
- [Fresh](https://fresh.deno.dev/) - Web framework
- [Preact](https://preactjs.com/) - UI library
- [Twind](https://twind.dev/) - CSS-in-JS
- [psychds-validator](https://github.com/psych-ds/psychds-validator) - Core validation engine, which is bundled with esbuild

## Getting Started

### Prerequisites

- [Deno](https://deno.land/)
- Git

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/psych-ds/psychds-validator-web.git
cd psychds-validator-web
```

3. Build and start the development server:
```bash
deno task build
deno task start
```

The application will be available at `http://localhost:8000`.

## Project Structure

```
psychds-validator-web/
├── components/       # Reusable UI components
├── islands/         # Interactive components
├── routes/          # Page routes and API endpoints
├── static/          # Static assets, including the bundled validator
└── fresh.gen.ts     # Auto-generated routes
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new-feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## Organization Repo

[Our github organization](https://github.com/psych-ds) contains other repositories related to the project.

## Getting Help

- Check our [documentation](https://psychds-docs.readthedocs.io/)
- Open an [issue](https://github.com/psych-ds/psychds-validator-web/issues)
