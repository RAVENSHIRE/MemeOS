from __future__ import annotations
import math
def clamp(x,lo=0,hi=100):return max(lo,min(hi,x))
def bell(v,c,s):return 0 if s<=0 else 100*math.exp(-0.5*((v-c)/s)**2)
def score_volatility(t):return round(clamp(.7*bell(abs(float(t.get('change1h') or 0)),8,7)+.3*bell(abs(float(t.get('change24h') or 0)),25,30)),2)
def score_community(t):
    h=max(0,float(t.get('holders') or 0));v=max(0,float(t.get('volume24h') or 0));b=max(0,float(t.get('buys24h') or 0));s=max(0,float(t.get('sells24h') or 0));flow=0 if b+s==0 else clamp(100*b/(b+s));return round(clamp(.45*clamp(18*math.log10(max(10,h)))+.3*clamp(16*math.log10(max(100,v/1000)))+.15*flow+.1*18*len(t.get('socials') or [])),2)
def score_x(t):
    n=max(0,float(t.get('x_mentions24h') or 0));vel=clamp(float(t.get('x_velocity') or 0));return round(clamp(.55*vel+.25*clamp(20*math.log10(n+1))+.2*(25 if t.get('x_url') else 0)),2)
def score_website(t):
    if not t.get('website'):return 0
    s=50 if t.get('website_live') else 15
    if str(t.get('website')).startswith('https://'):s+=20
    s+=clamp(math.log10(max(1,float(t.get('website_content_len') or 0)))*8)
    return round(clamp(s),2)
def score_big_players(t):return round(clamp(float(t.get('big_player_history_score') or 0)),2)
def score_ath(t):
    dd=float(t.get('ath_drawdown')) if t.get('ath_drawdown') is not None else 1
    return round(clamp(100*math.exp(-.5*((dd-.35)/.28)**2)),2)
def score_launchpad(t,cfg):
    m=cfg.get('launchpads') or {};k=str(t.get('launchpad') or 'unknown').lower();return round(clamp(float(m.get(k,m.get('unknown',35)))),2)
def score_token(t,cfg):
    w=cfg.get('weights') or {};f={'volatility':score_volatility(t),'community':score_community(t),'x':score_x(t),'website':score_website(t),'big_players':score_big_players(t),'ath_drawdown':score_ath(t),'launchpad':score_launchpad(t,cfg)};s=sum(f[k]*float(w.get(k,0)) for k in f);return {**t,'factors':f,'score':round(clamp(s),2),'passed_score':s>=float(cfg.get('score_threshold',72))}
def dynamic_position_size(t,score,equity,exposure,risk):
    mc=float(t.get('market_cap') or 0);liq=float(t.get('liquidity') or 0);mx=float(risk.get('max_market_cap_usd',300000));thr=float(risk.get('score_threshold',72))
    if mc<=0 or mc>=mx or liq<=0 or score<thr:return 0
    budget=max(0,equity*float(risk.get('max_portfolio_risk_pct',.02)));sf=clamp(score/max(1,thr),.5,1.2);mcf=clamp((mx-mc)/mx+.25,.25,1.25);liqcap=liq*float(risk.get('max_liquidity_fraction',.02));hard=float(risk.get('max_position_usd',25));room=max(0,float(risk.get('max_open_exposure_usd',75))-exposure);size=min(hard,budget*sf*mcf,liqcap,room);mn=float(risk.get('min_position_usd',.5));return round(size if size>=mn else 0,2)
