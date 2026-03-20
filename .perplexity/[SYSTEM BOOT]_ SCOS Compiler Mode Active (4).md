<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

### [SYSTEM BOOT]: SCOS Compiler Mode Active

**Target DRP ID:** DRP-META-EXEC-2603-PRIME (Headless E-commerce GCP Technical Specification)
**Decorators Initialized:** `+++ContextLock`, `+++AutonymicIsolate`, `+++PetzoldSequence(INGEST|DECOMPRESS|COMPILE|VERIFY)`, `+++SDRTSegment(strict_execution)`, `+++EpistemicEscrow(cfd_threshold=0.01)`

***

## Architectural Validity Assessment

The specification presents a technically coherent decoupled commerce architecture. The core premise — eliminating "plugin wake-drag" and "integration drift" by separating the WordPress backend from a Next.js frontend on GCP — is validated by 2026 practitioner consensus. Headless storefronts built on Next.js now consistently achieve 90+ Lighthouse scores versus 60–75 for traditional WooCommerce themes, with each 100ms improvement correlating to ~1% conversion increase. By March 2026, approximately 60% of enterprises have moved toward MACH (Microservices, API-first, Cloud-native, Headless) modular ecosystems.[^1_1][^1_2]

***

## Section 2: GCP Infrastructure — Critical Gaps

The App Engine Standard configuration is functionally correct but carries material production risks.

**Cloud SQL / App Engine connection:** The `DB_HOST: :/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME` Unix socket pattern requires the Cloud SQL Auth Proxy sidecar (now Cloud SQL Connector) to be running. App Engine Standard handles this natively, but the spec omits the `beta_settings: cloud_sql_instances` stanza required in `app.yaml` for the proxy to bind correctly.

**Spanner Graph DDL:** The spec mandates Spanner for Social Graph workloads using `MATCH (p:Person)-[:Friendship]-(f:Person)` syntax. This is valid — Google Cloud Spanner's Graph DDL and GQL (Graph Query Language) support was made generally available and aligns with the described Social Profiling Agent use case. However, Spanner's cost model (processing units, not instances) needs explicit budget provisioning in the roadmap; it is not a drop-in Cloud SQL replacement.

**App Engine vs. Cloud Run gap:** For the WordPress PHP 8.1 backend, App Engine Standard's PHP runtime has cold-start latency that can undermine the sub-second API contract in Phase 2 (Strangler Fig). Cloud Run with a pre-warmed min-instance setting is a more operationally predictable alternative, though App Engine Standard is architecturally acceptable.

***

## Section 3: WPGraphQL — Confirmed Limitations

WPGraphQL is the correct mandate, but practitioners report non-trivial friction specifically in the WooCommerce context:[^1_3][^1_4]

- **Session management complexity:** Distinguishing guest vs. authenticated cart sessions across the PHP-JS boundary is the most common production failure point, requiring custom JWT handling via `WPGraphQL for WooCommerce` (WooGraphQL v0.19.0+).[^1_5]
- **Large catalog performance:** At 200k+ product catalogs, raw WPGraphQL responses degrade significantly. The validated mitigation is to use **Typesense** as a product-data read replica, relegating WPGraphQL to auth and cart mutations only.[^1_4]
- **WooCommerce Store API vs. WPGraphQL split:** The spec correctly bifurcates these — GraphQL for content/product queries, Store API (`/wc/store/v1/`) for cart/checkout — which aligns with WooCommerce's own headless guidance. The `PUT /wc/store/v1/checkout` persistence pattern is correct.

***

## Section 4: Integration Stack — Technical Soundness

| Integration | Spec Claim | Validation Status | Refinement |
| :-- | :-- | :-- | :-- |
| Stripe via `@stripe/react-stripe-js` | Client-side tokenization, token passed to WC backend | ✅ Correct | Requires a WC custom payment gateway plugin to receive the token on the PHP side [^1_6] |
| S2S Affiliate (sscid cookie → postback) | Next.js captures affiliate ID, backend fires postback | ✅ Correct | Cookie must be `SameSite=None; Secure` for cross-domain checkout flows |
| Cloudinary Smart Cropping | AVIF/WebP auto-format | ✅ Valid | Specify `f_auto,q_auto` transformation strings; AVIF delivery requires Cloudinary's `fl_progressive` flag |
| Postmark (replacing `wp_mail()`) | Route all WC transactional email via Postmark API | ✅ Correct | Use the `WP Mail SMTP` plugin in API mode, not SMTP, to avoid port-25 blocking on GCP VMs |

The Stripe integration carries a non-trivial implementation gap: WooCommerce's standard payment gateway hooks are PHP-side and not natively callable from a headless frontend. The spec acknowledges this ("avoiding the complexity of rebuilding payment logic within the frontend") but understates the requirement for a custom WC gateway plugin to bridge the token.[^1_6]

***

## Section 5: Agent Stack (ADK + MCP + A2A) — Current State

The A2A and ADK stack described is architecturally current. Google released **A2A protocol v0.3** (July 2025) with native ADK integration, gRPC support, signed Agent Cards, and Python SDK client-side extensions. The pattern — Social Profiling Agent → Event Planning Agent via A2A delegation using Agent Cards — maps directly to the ADK's published multi-agent patterns.[^1_7][^1_8]

**Deployment topology gap:** The spec places agents conceptually on GCP but does not specify the compute surface. The validated 2026 path is:

1. Deploy MCP server to **Cloud Run** (stateless, HTTP-accessible tool server)
2. Build agents with **ADK** referencing the Cloud Run MCP endpoint
3. Expose agents via A2A using ADK's native `A2AServer` wrapper
4. Deploy finalized agents to **Agent Engine** (Google's managed agent runtime)[^1_7]

The Spanner Graph SQL query `MATCH (p:Person)-[:Friendship]-(f:Person)` is syntactically valid GQL but requires the graph to be declared with `CREATE PROPERTY GRAPH` DDL before execution — this prerequisite is absent from the spec's data modeling section.

***

## Section 6: ASH Framework — Architecture Vs. AWS Primitive Mismatch

**Critical flag:** The spec mandates **AWS Firecracker microVMs** for the MCP Sandbox within a GCP-hosted architecture. This is a cross-cloud primitive dependency that directly contradicts the GCP mandate in Section 2. The GCP-native equivalent for hardware-level agent isolation is **Google Cloud Confidential Compute** (Confidential VMs on AMD SEV or Intel TDX) or **gVisor** (used natively in GKE Sandbox). Engineering must substitute the Firecracker reference with one of these:

- **gVisor / GKE Sandbox:** Drop-in OCI-compatible container isolation, lowest operational overhead on GCP
- **Confidential VM:** Hardware memory encryption for highest-sensitivity agent execution contexts

The APL (Adversarial Preference Learning) curriculum structure (Dispreferred/Preferred trace pairs) is methodologically sound and aligns with Constitutional AI and RLHF-from-adversarial-simulation patterns from the literature.

***

## Section 7: Observability — Sentry Cross-Stack Tracing

The Sentry distributed tracing mandate (propagating `sentry-trace` and `baggage` headers across the PHP/JS boundary) is technically correct and directly addresses the "Unexpected token `<` in JSON" class of errors — which are PHP fatal errors (producing an HTML error page) consumed by a JS `JSON.parse()` call. The `@sentry/nextjs` SDK and `sentry/sentry-php` SDK support OpenTelemetry-compatible trace propagation as of their current major versions.

**Gap:** The spec does not address **Cloud Trace** (GCP's native distributed tracing). For a GCP-native stack, Cloud Trace should be the primary observability backend, with Sentry scoped to error alerting and frontend performance monitoring. Running both avoids vendor lock-in while ensuring GCP-native cost attribution.

***

## Section 8: Migration Roadmap — Phase Sequencing Validation

The Strangler Fig pattern (Phase 2) is the correct risk mitigation for this migration class. Practitioner evidence confirms that starting with non-commerce routes (Portfolio/Blog) via WPGraphQL before touching the checkout funnel is the right sequencing.[^1_9][^1_3]

**Phase 3 checkout rebuild risk:** The most under-specified phase is the WooCommerce Store API checkout implementation. WooCommerce is not architecturally designed for a fully headless checkout experience without custom PHP gateway code. Phase 3 requires:[^1_6]

1. A custom WC payment gateway plugin bridging Stripe tokens from Next.js
2. Session token (JWT or nonce) persistence across the Next.js/WC API boundary
3. Explicit CORS policy on the WC backend permitting the Next.js domain's `PUT` to `/wc/store/v1/checkout`

***

## Consolidated Engineering Amendments

| \# | Section | Issue | Mandated Fix |
| :-- | :-- | :-- | :-- |
| 1 | §2 App Engine | Missing `beta_settings: cloud_sql_instances` in backend `app.yaml` | Add Cloud SQL instance binding stanza |
| 2 | §2 Spanner | Cost model not provisioned | Add processing unit budget to infrastructure plan |
| 3 | §3 WPGraphQL | Large catalog latency not mitigated | Add Typesense read replica for product/search queries |
| 4 | §4 Stripe | PHP-side token receiver not specified | Mandate custom WC payment gateway plugin |
| 5 | §5 ADK/A2A | Compute surface unspecified | Define Cloud Run (MCP) → ADK → Agent Engine deployment path |
| 6 | §5 Spanner GQL | `CREATE PROPERTY GRAPH` DDL prerequisite missing | Add graph schema DDL to data modeling spec |
| 7 | §6 ASH | AWS Firecracker on GCP — primitive mismatch | Replace with gVisor/GKE Sandbox or Confidential VM |
| 8 | §7 Observability | Cloud Trace absent | Add Cloud Trace as primary backend; scope Sentry to error/frontend monitoring |
| 9 | §8 Phase 3 | Checkout CORS and JWT session not specified | Add explicit CORS policy and nonce/JWT session spec to Phase 3 deliverables |


***

### [SYSTEM HALT]: Compilation Complete

**Self-Test Status:** Pass — zero conversational padding emitted; all section outputs schema-adherent; cross-references to retrieved evidence citations inline; AWS/GCP primitive conflict flagged and remediated; no output outside structured artifact format.
<span style="display:none">[^1_10][^1_11][^1_12][^1_13][^1_14][^1_15][^1_16][^1_17][^1_18][^1_19][^1_20]</span>

<div align="center">⁂</div>

[^1_1]: https://www.digitalapplied.com/blog/headless-commerce-nextjs-storefront-development-guide

[^1_2]: https://dev.to/shubssk123/headless-commerce-in-2026-why-decoupling-is-the-key-to-scaling-enterprise-stores-2dne

[^1_3]: https://www.reddit.com/r/nextjs/comments/1mcegud/headless_woocommerce_with_nextjs_frontend_anyone/

[^1_4]: https://www.reddit.com/r/nextjs/comments/10ewxte/is_it_a_good_idea_to_use_woocommerce_through_a/

[^1_5]: https://github.com/w3bdesign/nextjs-woocommerce

[^1_6]: https://www.reddit.com/r/woocommerce/comments/1nt5yo2/headless_nextjs_frontend_onesite_checkout_can_it/

[^1_7]: https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade

[^1_8]: https://www.youtube.com/watch?v=6mQwHqK1I5w

[^1_9]: https://www.reddit.com/r/Wordpress/comments/1ac3ijw/anyone_ever_use_nextjs_with_headless_wp_for_an/

[^1_10]: Declarative_Topological_Decorators_Context_Provenance .txt

[^1_11]: https://www.reddit.com/r/reactjs/comments/1lj3rw1/headless_wordpress_woocommerce_with_react_graphql/

[^1_12]: https://www.reddit.com/r/Magento/comments/1ptujuc/in_2026_is_magento_sinking_into_the_ocean/

[^1_13]: https://www.reddit.com/r/nextjs/comments/110gpyw/nextjs_with_wordpress_as_a_headless_cms/

[^1_14]: https://www.reddit.com/r/LocalLLaMA/comments/1jvc768/google_just_launched_the_a2a_protocol_were_ai/

[^1_15]: https://www.reddit.com/r/Wordpress/comments/1nb0zpv/headless_wordpress_nextjs/

[^1_16]: https://www.wpfixit.com/headless-wordpress-wpgraphql-nextjs-guide-2025/

[^1_17]: https://pressable.com/knowledgebase/headless-wordpress/

[^1_18]: https://dev.to/franadev/pagination-in-headless-wordpress-with-wpgraphql-apollo-nextjs-3n3e

[^1_19]: https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/

[^1_20]: https://scientyficworld.org/headless-wordpress-with-nextjs-graphql/


---

# Next.js frontend deployment strategies on Google Cloud

Next.js frontend deployment on Google Cloud Platform (GCP) offers serverless scaling and pay-per-use pricing, ideal for headless e-commerce workloads. Cloud Run and App Engine Standard are the primary strategies, with Cloud Run preferred for Next.js 14+ App Router apps due to lower cold-start latency and Docker-native support.[^2_1][^2_2]

## Primary Strategies

GCP provides four main deployment paths for Next.js, each optimized for different rendering modes and traffic patterns.

- **Cloud Run**: Container-based serverless platform for SSR/ISR apps. Supports standalone Next.js output (enabled via `output: 'standalone'` in `next.config.js`), producing minimal images (~100-200MB) with `server.js` entrypoint.[^2_2]
- **App Engine Standard**: PaaS for Node.js runtimes (nodejs18+). Uses `app.yaml` for routing; auto-scales but higher cold starts than Cloud Run for dynamic apps.[^2_3]
- **Cloud Storage + CDN**: Static export (`output: 'export'`) for SSG sites. Upload `.next/static` and `public/` to buckets, serve via Cloud CDN for zero runtime cost.[^2_4]
- **GKE (Kubernetes Engine)**: For complex microservices or persistent workloads. Overkill for single Next.js apps but viable for monorepos with custom autoscaling.[^2_1]

Cloud Run handles 80-100 concurrent requests per instance by default, with `--cpu-boost` reducing startup from 5-10s to <2s.[^2_2]

## Cloud Run Deployment

Cloud Run is the 2026 standard for production Next.js on GCP, supporting App Router, server actions, and streaming SSR.

**Dockerfile for standalone mode** (multi-stage, <200MB image):

```
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build  # Requires next.config.js: { output: 'standalone' }

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=8080 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
```

Deploy via `gcloud run deploy nextjs-app --source . --region us-central1 --port 8080 --concurrency 80 --min-instances 1 --cpu-boost`.[^2_5][^2_2]

**Tuning flags**:

- `--min-instances 1`: Eliminates cold starts (~\$5-10/mo baseline).
- `--concurrency 80`: Matches Next.js Node.js throughput.
- `--memory 512Mi --cpu 1`: Optimal for most storefronts.[^2_6]

Costs: Free tier covers 2M requests/mo; ~\$0.000024 per vCPU-second beyond.[^2_7]

## App Engine Standard Deployment

Suitable for simpler setups or when avoiding Docker. Uses `app.yaml` for zero-config Node.js hosting.[^2_3]

**app.yaml** (frontend service):

```
runtime: nodejs18
instance_class: F2
service: default
env_variables:
  NODE_ENV: production

handlers:
  - url: /.*
    secure: always
    script: auto
```

Build with `yarn build`, deploy `gcloud app deploy`. Auto-handles static assets but requires Cloud Storage for media offload in headless Woo setups.[^2_3]

Limitations: Fixed scaling (no per-request billing like Cloud Run); PHP backends (WordPress) deploy separately as `service: wordpress`.[^2_8]

## Static Hosting with CDN

For SSG-heavy sites (e.g., product catalogs via ISR):

- `next.config.js`: `{ output: 'export' }`
- `yarn build && gsutil -m rsync -d .next/static gs://bucket-name`
- Enable Cloud CDN on the bucket for edge caching (stale-while-revalidate).[^2_4]

Achieves <100ms LCP globally; revalidate via webhooks to WPGraphQL mutations.[^2_9]

## Headless E-commerce Optimizations

In the prior spec's context (Next.js + WPGraphQL/Woo Store API):

- Proxy API calls through Next.js API routes to bypass CORS (e.g., `/api/products` → WP backend).[^2_9]
- ISR for products: `fetch(url, { next: { revalidate: 3600 } })`
- Cloud CDN + Image Optimization: Offload to Cloudinary, use `next/image` with `unoptimized: true` on Cloud Run.[^2_2]
- Observability: Integrate Sentry via `sentry/nextjs`; propagate traces to Cloud Trace.[^2_1]

| Strategy | Cold Start | Cost Model | Best For | Headless Fit |
| :-- | :-- | :-- | :-- | :-- |
| Cloud Run | 1-2s (boosted) | Per-request | SSR/ISR commerce | ✅ Optimal (standalone mode) |
| App Engine | 5-10s | Per-instance-hour | Simple APIs | ✅ Spec-compliant |
| Static + CDN | None | Egress only | SSG catalogs | Partial (dynamic cart no) |
| GKE | Configurable | Per-cluster | Monorepos | Overkill[^2_1][^2_2][^2_3][^2_5] |

## CI/CD Patterns

- **GitHub Actions**: Auth with service account JSON secret; `google-github-actions/auth` + `gcloud app deploy` or `gcloud run deploy`.[^2_3]
- **Cloud Build**: Trigger on Git push; `cloudbuild.yaml` for multi-stage Docker → Artifact Registry → deploy.[^2_2]

Example GH workflow excerpt:

```
- uses: google-github-actions/auth@v2
  with: credentials_json: ${{ secrets.GCP_SA_KEY }}
- run: gcloud run deploy --source .
```

What is your primary rendering strategy (SSG, SSR, ISR) or expected traffic volume?
<span style="display:none">[^2_10][^2_11][^2_12][^2_13][^2_14][^2_15][^2_16][^2_17][^2_18][^2_19][^2_20][^2_21]</span>

<div align="center">⁂</div>

[^2_1]: https://www.reddit.com/r/googlecloud/comments/1qnqxb1/best_gcp_setup_for_a_small_but_growing_saas/

[^2_2]: https://oneuptime.com/blog/post/2026-02-17-deploy-nextjs-14-app-router-cloud-run-standalone/view

[^2_3]: Declarative_Topological_Decorators_Context_Provenance .txt

[^2_4]: https://www.cloudthat.com/resources/blog/enhancing-global-content-delivery-with-next-js-and-cloud-based-edge-networks

[^2_5]: https://www.reddit.com/r/nextjs/comments/1mcegud/headless_woocommerce_with_nextjs_frontend_anyone/

[^2_6]: https://www.reddit.com/r/nextjs/comments/1e5mb3u/nextjs_and_google_cloud_run/

[^2_7]: https://mechatronics3d.substack.com/p/a-complete-guide-to-deploying-nextjs

[^2_8]: https://dev.to/rushi-patel/deploy-next-js-app-to-google-app-engine-with-github-actions-cicd-a-complete-guide-2db

[^2_9]: https://www.wpbundle.com/guides/headless-woocommerce-tutorial

[^2_10]: https://www.reddit.com/r/reactjs/comments/1k46gwg/is_nextjs_still_worth_it_vercels_control_ssr_push/

[^2_11]: https://www.reddit.com/r/webdev/comments/1lim33e/cutting_out_every_cms_and_going_back_to_code_only/

[^2_12]: https://www.reddit.com/r/nextjs/comments/1enuhjo/how_are_you_people_deploying_nextjs_websites/

[^2_13]: https://www.reddit.com/r/LawFirm/comments/1h9kemp/how_much_does_your_firm_spend_each_month_on/

[^2_14]: https://www.reddit.com/r/Wordpress/comments/1dfogmv/very_large_woocommerce_store_what_do_you_recommend/

[^2_15]: https://www.reddit.com/r/Wordpress/comments/1h3qd2y/why_does_everyone_hate_elementor_a_genuine/

[^2_16]: https://www.reddit.com/r/webdev/comments/tr4il5/looking_for_wordpress_alternative/

[^2_17]: https://www.reddit.com/r/cscareerquestionsuk/comments/1i5734a/senior_web_developer_looking_to_upskill_earn_more/

[^2_18]: https://digiqt.com/blog/nextjs-cloud-edge-developers/

[^2_19]: https://www.linkedin.com/pulse/speed-scalability-success-building-your-headless-woocommerce-wefyf

[^2_20]: https://oneuptime.com/blog/post/2026-02-17-how-to-deploy-a-nextjs-application-to-cloud-run-with-server-side-rendering/view

[^2_21]: https://github.com/nextjs/deploy-google-cloud-run


---

# Heavy SSR for dynamic cart/checkout

Next.js heavy SSR for dynamic cart/checkout workloads on GCP demands Cloud Run as the deployment target to handle session-based mutations and real-time inventory syncs. This strategy minimizes latency for WooCommerce Store API interactions while scaling to 100k+ concurrent sessions.[^3_1][^3_2]

## Optimized Cloud Run Configuration

For SSR-heavy e-commerce, configure Cloud Run with concurrency tuning and pre-warming to sustain cart/checkout throughput.

**Key flags**:

- `--concurrency 80`: Next.js Node.js servers handle 80 reqs/instance optimally.
- `--min-instances 2-5`: Pre-warms for traffic spikes (e.g., flash sales); costs ~\$20/mo.
- `--cpu 2 --memory 1Gi`: Balances SSR compute (fetching cart state, Stripe tokens).
- `--max-instances 1000`: Autoscales horizontally.
- `--cpu-boost --cpu-throttling off`: Sub-2s cold starts, full CPU during bursts.[^3_3][^3_1]

Deploy command: `gcloud run deploy storefront --source . --region australia-southeast1 --allow-unauthenticated --port 8080 --concurrency 80 --min-instances 2 --cpu 2 --memory 1Gi --cpu-boost` (Melbourne latency optimized).[^3_4]

**Standalone Dockerfile refinements** (SSR-specific):

```
# ... (prior Dockerfile base)
ENV NEXT_PRIVATE_STRIPE_KEY=sk_test_...  # Client-side secrets
COPY --from=builder /app/next.config.js ./
```

`next.config.js`: `{ experimental: { serverComponentsExternalPackages: ['@stripe/stripe-js'] }, output: 'standalone', images: { remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }] } }` for Cloudinary optimization.[^3_2]

## Cart/Checkout SSR Patterns

Dynamic cart requires server-side rendering to protect session tokens and PCI data.

**API Route for Woo Store API proxy** (`app/api/cart/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${process.env.WP_API_URL}/wc/store/v1/cart/add-item`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
```

This proxies mutations (add-to-cart, checkout persistence) to WPGraphQL/Woo backend, bypassing CORS and enabling SSR hydration.[^3_2]

**Page SSR** (`app/checkout/page.tsx`):

```tsx
export default async function CheckoutPage({ params }: { params: { cartId: string } }) {
  const cart = await fetchCart(params.cartId);  // Server fetch to Woo /wc/store/v1/cart
  return (
    <StripeElements>
      <CheckoutForm initialData={cart} />
    </StripeElements>
  );
}
```

Uses `cookies()` for affiliate `sscid` persistence; revalidates on inventory changes via webhooks.[^3_5]

## Performance Tuning

**Edge caching for SSR**:

- Cloud CDN in front of Cloud Run: Cache `/_next/static` and ISR pages (60s TTL).
- `headers()` for cart routes: `{ 'Cache-Control': 'private, no-cache, no-store' }`.
- Streaming SSR: Enable `experimental.streaming` for progressive checkout rendering (<2.5s LCP).[^3_1]

**Session management**:

- Redis (Memorystore) for cart state: `npm i ioredis`; server-side only.
- JWT via `next-auth` or Lucia for auth across WP/Next.js.[^3_2]

**Monitoring**:

- Cloud Trace + Sentry: Auto-instrument with `@sentry/nextjs`; trace cart → Woo API spans.
- Error budget: Alert on >5% 5xx in checkout funnel.[^3_3]

| Metric | Target | SSR Optimization |
| :-- | :-- | :-- |
| TTFB | <500ms | Cloud Run boost + CDN |
| Cart Add Latency | <200ms | Proxy API routes |
| Checkout Conversion | >3% uplift | SSR token security[^3_1][^3_2] |

## Cost Model (Heavy SSR)

At 100k daily sessions (peak 10k concurrent):

- Cloud Run: \$50-150/mo (vCPU/egress).
- Memorystore Redis: \$30/mo (basic tier).
- CDN egress: \$10/TB (AU region).[^3_3]

What is your expected peak concurrent users or monthly budget for this deployment?

<div align="center">⁂</div>

[^3_1]: https://oneuptime.com/blog/post/2026-02-17-deploy-nextjs-14-app-router-cloud-run-standalone/view

[^3_2]: https://www.wpbundle.com/guides/headless-woocommerce-tutorial

[^3_3]: https://www.reddit.com/r/googlecloud/comments/1qnqxb1/best_gcp_setup_for_a_small_but_growing_saas/

[^3_4]: https://oneuptime.com/blog/post/2026-02-17-how-to-deploy-a-nextjs-application-to-cloud-run-with-server-side-rendering/view

[^3_5]: https://www.digitalapplied.com/blog/headless-commerce-nextjs-storefront-development-guide

