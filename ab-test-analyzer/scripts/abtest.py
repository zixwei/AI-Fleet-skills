#!/usr/bin/env python3
"""Box-added stdlib A/B calculator (not from upstream; upstream SKILL.md names this file but never shipped it).
Commands: size, prop, ttest, chisq, srm. Normal approximations; fine for large samples, flag small ones."""
import argparse, math

def ncdf(x): return 0.5 * (1 + math.erf(x / math.sqrt(2)))
def nppf(p):
    lo, hi = -10.0, 10.0
    for _ in range(200):
        mid = (lo + hi) / 2
        if ncdf(mid) < p: lo = mid
        else: hi = mid
    return (lo + hi) / 2
def chi2_sf(x, k):
    # upper tail of chi-square via regularized incomplete gamma (series / continued fraction)
    a, x2 = k / 2.0, x / 2.0
    if x2 <= 0: return 1.0
    if x2 < a + 1:
        s, t, n = 1.0 / a, 1.0 / a, 0
        while abs(t) > 1e-15 * abs(s) and n < 1000:
            n += 1; t *= x2 / (a + n); s += t
        return max(0.0, 1 - s * math.exp(-x2 + a * math.log(x2) - math.lgamma(a)))
    b, c, d = x2 + 1 - a, 1e300, 1 / (x2 + 1 - a); h = d
    for i in range(1, 1000):
        an = -i * (i - a); b += 2
        d = an * d + b; d = 1e-300 if abs(d) < 1e-300 else d
        c = b + an / c; c = 1e-300 if abs(c) < 1e-300 else c
        d = 1 / d; delta = d * c; h *= delta
        if abs(delta - 1) < 1e-15: break
    return math.exp(-x2 + a * math.log(x2) - math.lgamma(a)) * h

def size(a):
    p1 = a.baseline; p2 = p1 * (1 + a.mde_rel) if a.mde_rel is not None else p1 + a.mde_abs
    za, zb = nppf(1 - a.alpha / 2), nppf(a.power)
    n = ((za * math.sqrt(2 * ((p1 + p2) / 2) * (1 - (p1 + p2) / 2)) + zb * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2) / (p2 - p1) ** 2
    print(f"baseline {p1:.4f} -> target {p2:.4f}; n per arm = {math.ceil(n)}")
    if a.daily: print(f"days at {a.daily}/arm/day = {math.ceil(n / a.daily)} (round up to whole weeks)")

def prop(a):
    p1, p2 = a.c_conv / a.c_n, a.t_conv / a.t_n
    pp = (a.c_conv + a.t_conv) / (a.c_n + a.t_n)
    z = (p2 - p1) / math.sqrt(pp * (1 - pp) * (1 / a.c_n + 1 / a.t_n))
    se = math.sqrt(p1 * (1 - p1) / a.c_n + p2 * (1 - p2) / a.t_n); zc = nppf(1 - a.alpha / 2)
    print(f"control {p1:.4%}  treatment {p2:.4%}  abs lift {p2 - p1:+.4%}  rel lift {(p2 - p1) / p1 if p1 else float('nan'):+.2%}")
    print(f"z = {z:.3f}  two-sided p = {2 * (1 - ncdf(abs(z))):.4g}  {1 - a.alpha:.0%} CI abs diff [{p2 - p1 - zc * se:+.4%}, {p2 - p1 + zc * se:+.4%}]")
    if min(a.c_conv, a.t_conv, a.c_n - a.c_conv, a.t_n - a.t_conv) < 10: print("WARNING: fewer than 10 events in a cell; normal approximation unreliable")

def ttest(a):
    se = math.sqrt(a.c_sd ** 2 / a.c_n + a.t_sd ** 2 / a.t_n); d = a.t_mean - a.c_mean; t = d / se
    df = se ** 4 / ((a.c_sd ** 2 / a.c_n) ** 2 / (a.c_n - 1) + (a.t_sd ** 2 / a.t_n) ** 2 / (a.t_n - 1))
    print(f"diff {d:+.4f}  Welch t = {t:.3f}  df ~ {df:.1f}  p ~ {2 * (1 - ncdf(abs(t))):.4g} (normal approx; if df < 30 treat p as optimistic)")
    zc = nppf(1 - a.alpha / 2); print(f"{1 - a.alpha:.0%} CI [{d - zc * se:+.4f}, {d + zc * se:+.4f}]")

def chisq(a):
    conv = [int(x) for x in a.conv.split(',')]; n = [int(x) for x in a.n.split(',')]
    tot_c, tot_n = sum(conv), sum(n); x2 = 0.0
    for c, m in zip(conv, n):
        for obs, exp in ((c, m * tot_c / tot_n), (m - c, m * (tot_n - tot_c) / tot_n)): x2 += (obs - exp) ** 2 / exp
    k = len(conv) - 1; print(f"chi2 = {x2:.3f}  df = {k}  p = {chi2_sf(x2, k):.4g}")

def srm(a):
    obs = [int(x) for x in a.counts.split(',')]
    w = [float(x) for x in a.weights.split(',')] if a.weights else [1.0] * len(obs)
    tot = sum(obs); x2 = sum((o - tot * wi / sum(w)) ** 2 / (tot * wi / sum(w)) for o, wi in zip(obs, w)); p = chi2_sf(x2, len(obs) - 1)
    print(f"SRM chi2 = {x2:.3f}  p = {p:.4g}  {'BROKEN SPLIT (p<0.001): do not trust results' if p < 0.001 else 'split looks fine'}")

ap = argparse.ArgumentParser(); sp = ap.add_subparsers(dest='cmd', required=True)
s = sp.add_parser('size'); s.add_argument('--baseline', type=float, required=True); g = s.add_mutually_exclusive_group(required=True)
g.add_argument('--mde-rel', type=float); g.add_argument('--mde-abs', type=float)
s.add_argument('--alpha', type=float, default=0.05); s.add_argument('--power', type=float, default=0.8); s.add_argument('--daily', type=float)
s = sp.add_parser('prop'); [s.add_argument(f'--{k}', type=int, required=True) for k in ('c-conv', 'c-n', 't-conv', 't-n')]; s.add_argument('--alpha', type=float, default=0.05)
s = sp.add_parser('ttest'); [s.add_argument(f'--{k}', type=float, required=True) for k in ('c-mean', 'c-sd', 't-mean', 't-sd')]
[s.add_argument(f'--{k}', type=int, required=True) for k in ('c-n', 't-n')]; s.add_argument('--alpha', type=float, default=0.05)
s = sp.add_parser('chisq'); s.add_argument('--conv', required=True, help='comma list'); s.add_argument('--n', required=True, help='comma list')
s = sp.add_parser('srm'); s.add_argument('--counts', required=True); s.add_argument('--weights')
a = ap.parse_args(); {'size': size, 'prop': prop, 'ttest': ttest, 'chisq': chisq, 'srm': srm}[a.cmd](a)
