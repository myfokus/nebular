# BuildSmoke

This project is used to verify the packages this fork publishes (`@myfokus/nebular-theme`,
`@myfokus/nebular-date-fns`, `@myfokus/nebular-eva-icons`) were built properly.
We just install the newly built packages in this app and build it in production mode, including the SSR prerender.
The PR check does the same on every pull request.

# To run locally

1. Run `npm run build:myfokus` in the project root.
2. Copy `dist/theme`, `dist/date-fns` and `dist/eva-icons` to `packages-smoke/.lib/`
3. Go to `packages-smoke` directory and run `npm ci`
4. Verifying application build:
   - `npm run build -- --configuration=production`
   - `npm run e2e`
5. Run with ssr:
   - `npm run build -- --configuration=production`
   - `npm run serve:ssr:packages-smoke`
