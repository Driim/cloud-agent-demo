# API Gateway

## Role

The API gateway is the single entry point for all client traffic. It sits between the React SPA and the backend microservices and is responsible for:

- **TLS termination** — decrypts HTTPS at the edge so backend services communicate over plain HTTP internally
- **JWT validation** — verifies the token signature and expiry before the request reaches any service; rejects unauthenticated requests early
- **Rate limiting** — enforces per-org, per-tier quotas to prevent abuse and protect downstream services from overload
- **Request routing** — forwards traffic to the correct backend service based on the URL path (`/api/v1/auth/*` → Auth Service, `/api/v1/analytics/*` → Analytics Service, etc.)
- **WAF** — filters OWASP Top 10 attack patterns (SQL injection, XSS, path traversal) before requests reach application code
- **API versioning** — routes `/api/v1/` and `/api/v2/` independently, enabling non-breaking rollouts

Centralising these concerns at the gateway means no backend service needs to implement them individually.

---

## Chosen Solution: Nginx + slowapi

The default setup uses **Nginx** as the reverse proxy / load balancer and **[slowapi](https://github.com/laurentS/slowapi)** as the FastAPI rate-limiting middleware. This keeps the infrastructure footprint small — no additional service to deploy or database to manage.

### Nginx configuration (outline)

```nginx
server {
    listen 443 ssl;
    ssl_certificate     /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    ssl_protocols       TLSv1.3;

    # WAF — ModSecurity with OWASP Core Rule Set
    modsecurity on;
    modsecurity_rules_file /etc/nginx/modsec/main.conf;

    location /api/v1/ {
        proxy_pass http://backend:8000;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Rate limiting with slowapi

Rate limits are enforced inside FastAPI using `slowapi`, keyed on `org_id` extracted from the JWT. This gives per-tenant quotas.

```python
from slowapi import Limiter

limiter = Limiter(
    key_func=lambda request: request.state.org_id,
    storage_uri="redis://redis:6379",  # required for multi-instance deployments
)

@app.get("/api/v1/analytics/overview")
@limiter.limit("60/minute")   # enterprise tier
async def overview(request: Request, user: User = Depends(get_current_user)):
    ...
```

Tier-based limits:

| Plan | Requests / minute | Burst |
| --- | --- | --- |
| Free | 10 | 20 |
| Pro | 60 | 120 |
| Enterprise | 300 | 600 |

**Important — state storage:**

slowapi stores counters **in-memory by default**. With multiple backend instances each process holds its own counter, so the effective limit becomes `limit × N` (where N = instance count).

- **Single instance**: in-memory is fine (default, no extra infra).
- **Multiple instances**: `storage_uri` must point to a shared **Redis** instance. slowapi uses the `limits` library under the hood, which supports Redis natively.

```python
# single instance (default, development)
limiter = Limiter(key_func=lambda r: r.state.org_id)

# multi-instance (production)
limiter = Limiter(
    key_func=lambda r: r.state.org_id,
    storage_uri="redis://redis:6379",
)
```

**Scaling rate limiting further:**

For higher scalability, rate limiting can be moved **above** the application layer entirely:

| Layer | How | Tradeoff |
| --- | --- | --- |
| Nginx (`limit_req_zone`) | Per-instance, same problem without Redis | Still needs sticky routing or shared store |
| Kong / APISIX | Built-in Redis-backed rate limiting plugin | Operational overhead of running a gateway |
| Cloudflare / AWS WAF | Centralized at edge, no own infra | Vendor lock-in, less flexibility |

The rule: **the problem is not where the limiter runs, but where it stores state**. Any horizontally scaled setup needs a shared external store — Redis is the de-facto standard.

### JWT validation at the gateway

Nginx validates the JWT signature using `nginx-jwt` (or a Lua script with `lua-resty-jwt`) before proxying. This rejects invalid tokens at the edge, before any FastAPI code runs.

```nginx
access_by_lua_block {
    local jwt = require("resty.jwt")
    local token = ngx.var.http_authorization:match("Bearer (.+)")
    local verified = jwt:verify(os.getenv("JWT_PUBLIC_KEY"), token)
    if not verified["verified"] then
        ngx.exit(ngx.HTTP_UNAUTHORIZED)
    end
}
```

The FastAPI services still validate the JWT via `fastapi-users` as a defence-in-depth layer — the gateway check is a fast early reject, not a replacement.

---

## Alternatives

Replacing Nginx and `slowapi` isn't a single decision — it depends on how much infrastructure you want to run yourself.

### Open-source

Kong Gateway and Apache APISIX have mature plugin ecosystems: JWT validation, mTLS, load balancing, Kubernetes support. KrakenD is leaner — stateless, Go-based, configured through JSON, no database. The main reason to go this route is that rate limiting becomes a config file entry instead of code you maintain. The tradeoff is operational burden: someone on your team needs to own the deployment.

### SaaS

Apigee is really API lifecycle management, not just a gateway. Developer portals, analytics, monetization, centralized policy enforcement — it handles all of it. At enterprise scale that's genuinely useful. For a team that needs routing and rate limits, it's probably too much and too expensive.

### Cloud-native

AWS API Gateway integrates cleanly with Lambda and IAM — no nodes to manage. Cloudflare runs at the edge with low latency and no egress fees. Both get you up and running fast. Both make it harder to leave later.

### Comparison

| | Nginx + slowapi (default) | Open-source (Kong / KrakenD) | Apigee | AWS API Gateway |
| --- | --- | --- | --- | --- |
| Deployment | Self-hosted | Self-hosted / Kubernetes | Fully managed | Managed cloud |
| Setup complexity | Low | High — needs DevOps | Medium — UI-driven | Low |
| Extensibility | Lua / custom middleware | Lua / Go plugins | Built-in policies | AWS service integrations |
| State | Stateless | DB (Kong) or stateless (KrakenD) | Provider-managed | Provider-managed |
| Vendor lock-in | None | None | Google ecosystem | AWS only |
| Operational overhead | Low | High | Low | Low |
