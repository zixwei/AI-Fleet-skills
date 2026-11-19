---
name: claude-bughunter
description: elementalsouls/Claude-BugHunter - 83 bug bounty and external red-team skills plus 15 slash commands: hunt-* vulnerability classes built from disclosed HackerOne reports, enterprise platform attack chains, recon and OSINT, validation, report writing and evidence hygiene. Authorized targets only.
license: MIT (code), CC-BY-4.0 (content)
---
来源:https://github.com/elementalsouls/Claude-BugHunter (2026-11-19 ET 核实,上游提交 0e70a02,代码 MIT,内容 CC BY 4.0).Trendshift 2026-11-16 每日榜发现,用户 2026-11-19 09:19 ET 点头入库.

# 漏洞赏金与外部红队技能集 (83 技能 + 15 命令)

怎么做漏洞赏金/外部红队:6 阶段流程 (recon,map & rank,hunt,validate,report),提交前 7 问门,各漏洞类别的检测模式与链式模板,报告与证据卫生.

## 使用范围 (先看,上游明文限定)

- 只用于自有资产,书面授权的评估,赏金计划范围内的目标.范围外的目标不碰.
- 只覆盖外部攻击面.上游明确不含:0-day 武器化,后渗透,C2,免杀,内网 AD.
- 舰队里没有用户对某个目标的明确点头,不对任何真实目标动手;读方法,写报告,审自己的代码可以.

## 前提

- 只读方法:无需安装.
- 实操要工具:Burp (含 MCP),subfinder,httpx,nuclei 等,见各技能前提.本库没收上游的引擎,CLI,脚本 (engine/,cbh/,scripts/,mcp/),要用装上游.

## 怎么用

1. 先读 `docs/skills.md` (技能目录) 与 `UPSTREAM-USAGE.md`.
2. 按阶段读 `skills/<名字>/SKILL.md`;斜杠命令说明在 `commands/`.
3. 交报告前过 report-writing 与 7 问门.

## 收录清单
- [apk-redteam-pipeline](skills/apk-redteam-pipeline/SKILL.md):End-to-end Android APK red-team pipeline — automated APK acquisition (Play Store + apkpure + apkmirror fallback), jadx decompilation, secret/URL/JWT/Firebase grep, pinned-cert extraction, exported-com
- [bb-local-toolkit](skills/bb-local-toolkit/SKILL.md):Use the full bug bounty workflow when you also need the local path of a tool, wordlist, or clone (SecLists, jhaddix, ffuf, dalfox, ghauri, trufflehog).
- [bb-methodology](skills/bb-methodology/SKILL.md):Use at the START of any bug bounty hunting session, when switching targets, or when feeling lost about what to do next.
- [bug-bounty](skills/bug-bounty/SKILL.md):Guide a bug bounty task from recon and HackerOne scope through research, vulnerability testing, finding validation, and reporting.
- [bugcrowd-reporting](skills/bugcrowd-reporting/SKILL.md):Bugcrowd-specific reporting tactics complementing report-writing: VRT category search-and-fallback strategy when no exact match exists, manual severity override when VRT defaults underrate impact, sev
- [cloud-iam-deep](skills/cloud-iam-deep/SKILL.md):Cloud IAM red-team attack chain across AWS, Azure, GCP — focused on EXTERNAL exploitation paths and post-credential-discovery privilege analysis.
- [enterprise-vpn-attack](skills/enterprise-vpn-attack/SKILL.md):External SSL VPN / remote-access appliance attack matrix — Cisco ASA/AnyConnect, Fortinet FortiGate/FortiOS, Citrix NetScaler/ADC, Palo Alto GlobalProtect, Pulse Secure / Ivanti Connect Secure, SonicW
- [evidence-hygiene](skills/evidence-hygiene/SKILL.md):Evidence-capture and PoC-redaction discipline for bug-bounty submissions: cookie redaction protocol (which fields to mask, Preview annotation / Burp panel hiding / DevTools workflow), PII black-bar di
- [hunt-api-misconfig](skills/hunt-api-misconfig/SKILL.md):Hunt API security misconfiguration — mass assignment, prototype pollution, HTTP verb tampering.
- [hunt-aspnet](skills/hunt-aspnet/SKILL.md):Hunt ASP.NET-specific surface — ViewState deserialization (signed-only vs encrypted), machineKey recovery, dual-parser MAC-bypass anti-pattern, request-validator bypass, trace.axd/elmah.axd disclosure
- [hunt-ato](skills/hunt-ato/SKILL.md):Hunt account takeover taxonomy — 9 distinct paths to ATO, plus chains.
- [hunt-auth-bypass](skills/hunt-auth-bypass/SKILL.md):Hunting skill for auth bypass vulnerabilities.
- [hunt-brute-force](skills/hunt-brute-force/SKILL.md):Hunt Missing/Weak Rate Limiting — login brute force, OTP/2FA brute force (10^6 keyspace), password-reset-token brute, credential stuffing, username/email enumeration via error-string / status-code / t
- [hunt-business-logic](skills/hunt-business-logic/SKILL.md):Hunting skill for business logic vulnerabilities.
- [hunt-cache-poison](skills/hunt-cache-poison/SKILL.md):Hunting skill for cache poison vulnerabilities.
- [hunt-captcha-bypass](skills/hunt-captcha-bypass/SKILL.md):Hunt CAPTCHA Bypass — 6 distinct patterns: (1) CAPTCHA field simply omitted from the request (server-side validation absent), (2) CAPTCHA token replayed from a solved challenge (no single-use enforcem
- [hunt-cicd](skills/hunt-cicd/SKILL.md):Hunt CI/CD pipeline vulnerabilities — GitHub Actions workflow injection (pull_request_target Pwnrequest + ${{ }}-into-shell), self-hosted runner poisoning, OIDC trust-policy abuse, Jenkins script-cons
- [hunt-clickjacking](skills/hunt-clickjacking/SKILL.md):Hunt Clickjacking — missing X-Frame-Options / CSP frame-ancestors lets an attacker embed the target page in an invisible iframe and trick victims into clicking buttons they cannot see (UI redressing).
- [hunt-cloud-misconfig](skills/hunt-cloud-misconfig/SKILL.md):Hunt cloud / infrastructure misconfigurations.
- [hunt-cors](skills/hunt-cors/SKILL.md):Hunt CORS Misconfiguration — origin-reflection with credentials, null-origin trust, subdomain-regex bypass (unanchored vs unescaped-dot vs prefix-only), pre-flight (OPTIONS) gating bypass, postMessage
- [hunt-csrf](skills/hunt-csrf/SKILL.md):Hunting skill for csrf vulnerabilities.
- [hunt-deserialization](skills/hunt-deserialization/SKILL.md):Hunt Insecure Deserialization — Java gadget chains (ysoserial), PHP object injection (phpggc), Python pickle RCE, .NET BinaryFormatter, Ruby Marshal.load, JNDI/Log4Shell.
- [hunt-dispatch](skills/hunt-dispatch/SKILL.md):Skill-set loader for /hunt orchestrator.
- [hunt-dom](skills/hunt-dom/SKILL.md):Hunt client-side DOM vulnerabilities — DOM Clobbering (overwrite JS globals via HTML injection), PostMessage hijacking (missing origin check), Service Worker abuse (intercept requests from same-origin
- [hunt-exceptional-conditions](skills/hunt-exceptional-conditions/SKILL.md):Hunt mishandling of exceptional conditions — feed an endpoint malformed/unexpected input (wrong type, broken JSON, oversized field, null byte) and make it fail OPEN or leak internals: a verbose stack-
- [hunt-file-upload](skills/hunt-file-upload/SKILL.md):Hunt file upload bugs — RCE via webshell, XSS via SVG/HTML, SSRF via XXE in DOCX, path traversal via filename.
- [hunt-fintech-graphql](skills/hunt-fintech-graphql/SKILL.md):Hunt fintech-specific GraphQL vulnerabilities: money-movement mutations (transfers, redemptions, withdrawals, card top-ups), ledger/balance/portfolio query IDOR, decimal-precision and rounding abuse, 
- [hunt-forgot-password](skills/hunt-forgot-password/SKILL.md):Hunt Forgot Password / Account Recovery Authentication Flaws — 5 distinct patterns: (1) username enumeration via different responses for valid vs invalid email, (2) reset token exposed directly in the
- [hunt-graphql](skills/hunt-graphql/SKILL.md):Hunting skill for graphql vulnerabilities.
- [hunt-grpc](skills/hunt-grpc/SKILL.md):Hunt gRPC vulnerabilities — server reflection enabled (enumerate all services/methods), missing authentication / metadata-stripping on internal endpoints, plaintext gRPC over HTTP/2, internal endpoint
- [hunt-host-header](skills/hunt-host-header/SKILL.md):Hunt Host Header Injection — password reset poisoning → ATO, web cache poisoning via unkeyed Host/X-Forwarded-Host, routing-based SSRF (Host picks upstream → cloud metadata/internal services), path-ov
- [hunt-html-injection](skills/hunt-html-injection/SKILL.md):Hunt HTML Injection — user-supplied input is rendered as raw HTML in the response without sanitisation, allowing an attacker to inject arbitrary HTML tags (but not necessarily JavaScript).
- [hunt-http-smuggling](skills/hunt-http-smuggling/SKILL.md):Hunt HTTP request smuggling (CL.TE, TE.CL, H2.CL, H2.TE).
- [hunt-idor](skills/hunt-idor/SKILL.md):Hunting skill for idor vulnerabilities.
- [hunt-jwt-crypto](skills/hunt-jwt-crypto/SKILL.md):Hunt JWT cryptographic failures — alg:none signature-stripping and RS256→HS256 key-confusion that let an attacker forge a token for any identity (e.g.
- [hunt-k8s](skills/hunt-k8s/SKILL.md):Hunt Kubernetes & Docker — API anonymous access, kubelet 10250 exec (SPDY/WebSocket, NOT plain POST) and the simpler /run primitive, etcd 2379 unauth, dashboard skip-login, RBAC misconfig, secret/SA-t
- [hunt-laravel](skills/hunt-laravel/SKILL.md):Hunt Laravel specific vulnerabilities — Debug mode leakage (APP_DEBUG=true exposes full stack trace + env vars), Laravel Telescope/Horizon dashboard unauthorized access, Ignition RCE (CVE-2021-3129), 
- [hunt-ldap](skills/hunt-ldap/SKILL.md):Hunt LDAP Injection and XPath Injection — authentication bypass, blind char-by-char attribute exfiltration, AD user/group enumeration, XML-store XPath bypass.
- [hunt-lfi](skills/hunt-lfi/SKILL.md):Hunt Local File Inclusion (LFI), Remote File Inclusion (RFI), and Path Traversal — /etc/passwd read, log poisoning → RCE, PHP filter-chain RCE (no upload needed), php:// / data:// / zip:// / phar:// w
- [hunt-llm-ai](skills/hunt-llm-ai/SKILL.md):Hunt LLM/AI feature bugs — prompt injection, indirect injection, exfiltration via tool-use/markdown, ASCII smuggling, agentic AI security (OWASP Agentic Apps 2026, ASI01-ASI10).
- [hunt-mfa-bypass](skills/hunt-mfa-bypass/SKILL.md):Hunt MFA / 2FA bypass — 7 distinct patterns.
- [hunt-misc](skills/hunt-misc/SKILL.md):Hunting skill for misc vulnerabilities.
- [hunt-nextjs](skills/hunt-nextjs/SKILL.md):Hunt Next.js specific vulnerabilities — Server Actions arbitrary function execution, Middleware auth bypass via static asset paths, ISR cache poisoning, Image Optimization SSRF (/_next/image), RSC pay
- [hunt-nodejs](skills/hunt-nodejs/SKILL.md):Hunt Node.js specific vulnerabilities — Prototype Pollution → RCE chains (lodash/merge/assign), Express trust proxy misconfiguration, child_process/eval injection, template engine SSTI (EJS/Pug/Handle
- [hunt-nosqli](skills/hunt-nosqli/SKILL.md):Hunt NoSQL Injection — MongoDB operator injection ($where, $regex, $gt, $ne), CouchDB, Redis command injection, auth bypass via NoSQLi, data dump.
- [hunt-ntlm-info](skills/hunt-ntlm-info/SKILL.md):Hunt NTLM/Negotiate information disclosure on internet-reachable IIS/SharePoint/Exchange.
- [hunt-oauth](skills/hunt-oauth/SKILL.md):Hunting skill for oauth vulnerabilities.
- [hunt-open-redirect](skills/hunt-open-redirect/SKILL.md):Hunt Open Redirect — all types including low-impact, chained to OAuth token theft → ATO, phishing chains.
- [hunt-race-condition](skills/hunt-race-condition/SKILL.md):Hunting skill for race condition vulnerabilities.
- [hunt-rag-vector](skills/hunt-rag-vector/SKILL.md):Hunt vector-store / embedding-layer weaknesses in RAG pipelines (OWASP LLM08 Vector and Embedding Weaknesses) — persistent corpus poisoning that survives across sessions and users (distinct from one-s
- [hunt-rce](skills/hunt-rce/SKILL.md):Hunting skill for rce vulnerabilities.
- [hunt-saml](skills/hunt-saml/SKILL.md):Hunt SAML / SSO attacks.
- [hunt-session](skills/hunt-session/SKILL.md):Hunt Session Management vulnerabilities — session fixation (no regeneration on login), insufficient invalidation on logout / password-change / email-change, predictable or low-entropy session IDs, JWT
- [hunt-shadow-api](skills/hunt-shadow-api/SKILL.md):Hunt shadow / zombie / undocumented API surface (OWASP API9 Improper Inventory Management) — enumerate the full API version history (v1/v2/beta/legacy paths, header- and subdomain-based versioning), p
- [hunt-sharepoint](skills/hunt-sharepoint/SKILL.md):Hunt Microsoft SharePoint Server (2013/2016/2019/Subscription Edition) on-prem farms — anonymous endpoint enumeration, version disclosure, legacy SOAP login bypass (Authentication.asmx), ToolShell pre
- [hunt-source-leak](skills/hunt-source-leak/SKILL.md):Hunt source code and build artifact leakage — JavaScript source maps (.js.map) reconstructing TypeScript/ES6 source, Swagger/OpenAPI JSON endpoint discovery, .env/.git exposure, webpack chunks with ha
- [hunt-spa-api](skills/hunt-spa-api/SKILL.md):Discover a single-page-app's hidden backend API from its public JS bundle, then test that API for broken access control / missing authentication.
- [hunt-springboot](skills/hunt-springboot/SKILL.md):Hunt Spring Boot specific vulnerabilities — Actuator endpoints (heapdump, env, loggers, mappings, shutdown), Spring Expression Language (SpEL) injection → RCE, H2 console RCE, Jolokia JMX exposure, Sp
- [hunt-sqli](skills/hunt-sqli/SKILL.md):Hunting skill for sqli vulnerabilities.
- [hunt-ssrf](skills/hunt-ssrf/SKILL.md):Hunting skill for ssrf vulnerabilities.
- [hunt-ssti](skills/hunt-ssti/SKILL.md):Hunt server-side template injection (SSTI) across Jinja2 (Flask/Django), Twig (Symfony), Freemarker (Java), ERB (Rails), Spring, Velocity, Mako, Thymeleaf, Smarty.
- [hunt-subdomain](skills/hunt-subdomain/SKILL.md):Hunting skill for subdomain takeover vulnerabilities.
- [hunt-tls-network](skills/hunt-tls-network/SKILL.md):Hunt TLS/SSL and DNS misconfigurations — missing HSTS (downgrade attack), weak cipher suites, expired/invalid certificates, mTLS bypass, missing SPF/DKIM/DMARC (email spoofing), DNS Zone Transfer (AXF
- [hunt-websocket](skills/hunt-websocket/SKILL.md):Hunt WebSocket vulnerabilities — Cross-Site WebSocket Hijacking (CSWSH), missing/weak Origin validation on the WS handshake, no per-message authentication, message tampering, socket.io namespace/room 
- [hunt-xss](skills/hunt-xss/SKILL.md):Hunting skill for xss vulnerabilities.
- [hunt-xxe](skills/hunt-xxe/SKILL.md):Hunting skill for xxe vulnerabilities.
- [ios-redteam-pipeline](skills/ios-redteam-pipeline/SKILL.md):End-to-end iOS red-team pipeline — IPA acquisition (App Store extraction, TestFlight, enterprise/ad-hoc sideload), class-dump/Hopper/Ghidra static analysis, Info.plist + entitlements + Keychain secret
- [m365-entra-attack](skills/m365-entra-attack/SKILL.md):Microsoft 365 / Entra ID red-team attack chain — current 2026 reality.
- [meme-coin-audit](skills/meme-coin-audit/SKILL.md):Meme coin and token security audit — rug pull detection (honeypot, hidden mint, fee manipulation, LP lock bypass), Solana SPL token analysis (freeze authority, mint authority, metadata mutability), To
- [mid-engagement-ir-detection](skills/mid-engagement-ir-detection/SKILL.md):Methodology for detecting client SOC patches, attacker activity, and security-state changes that occur DURING a red-team engagement — and converting those observations into deliverable findings.
- [offensive-osint](skills/offensive-osint/SKILL.md):Operational arsenal for authorized external red-team and bug-bounty recon.
- [okta-attack](skills/okta-attack/SKILL.md):Okta-as-IdP red-team attack chain — tenant discovery, user enumeration (multiple vectors), authentication flow analysis (factors enumeration, push-notification fatigue, SMS bypass), password spray wit
- [osint-methodology](skills/osint-methodology/SKILL.md):Plan and run OSINT for authorized red-team reconnaissance and external attack-surface assessments.
- [recon-scope-triage](skills/recon-scope-triage/SKILL.md):Triage ASM/recon output for ownership before testing — separate the target's real assets from namespace-collision noise.
- [redteam-mindset](skills/redteam-mindset/SKILL.md):Red-team operator discipline — the mindset corrections that separate offensive testing from defensive WAPT.
- [redteam-report-template](skills/redteam-report-template/SKILL.md):Client-facing red-team deliverable format — codifies the Subject / Observations / Description / Impact / Recommendation / PoC structure used for external red-team engagements (not bug-bounty platform 
- [report-writing](skills/report-writing/SKILL.md):Bug bounty report writing for H1/Bugcrowd/Intigriti/Immunefi — report templates, human tone guidelines, impact-first writing, CVSS 3.1 scoring, title formula, impact statement formula, severity decisi
- [security-arsenal](skills/security-arsenal/SKILL.md):Security payloads, bypass tables, wordlists, gf pattern names, always-rejected bug list, and conditionally-valid-with-chain table.
- [supply-chain-attack-recon](skills/supply-chain-attack-recon/SKILL.md):External recon for software supply-chain attack surface — package-namespace squatting candidates, dependency-confusion vulnerabilities, GitHub Actions injection openings, container image registry expo
- [triage-validation](skills/triage-validation/SKILL.md):Finding validation before writing any report — 7-Question Gate (all 7 questions), 4 pre-submission gates, always-rejected list, conditionally valid with chain table, CVSS 3.1 quick reference, severity
- [vmware-vcenter-attack](skills/vmware-vcenter-attack/SKILL.md):VMware vSphere / vCenter Server external attack matrix — version fingerprinting, the high-impact CVE chain (CVE-2021-21972 vRealize unauth file upload, CVE-2021-21985 vSAN plugin RCE, CVE-2022-22954 W
- [web2-recon](skills/web2-recon/SKILL.md):Web2 recon pipeline — subdomain enumeration (subfinder, Chaos API, assetfinder), live host discovery (dnsx, httpx), URL crawling (katana, waybackurls, gau), directory fuzzing (ffuf), JS analysis (Link
- [web3-audit](skills/web3-audit/SKILL.md):Smart contract security audit — 10 DeFi bug classes (accounting desync, access control, incomplete path, off-by-one, oracle, ERC4626, reentrancy, flash loan, signature replay, proxy), pre-dive kill si
