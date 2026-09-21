from __future__ import annotations
import asyncio,json,os,re,time,math
from datetime import datetime,timezone,timedelta
from urllib.parse import quote
import httpx,websockets
FOMO_WS='wss://prod-api.fomo.family/ws';BE='https://public-api.birdeye.so';GT='https://api.geckoterminal.com/api/v2';X_API='https://api.x.com/2';NET={'solana':'1399811149','robinhood':'4663'}
def f(x,d=0.0):
    try:return float(x)
    except(TypeError,ValueError):return d
def inu(x):return bool(re.search(r'inu',x or '',re.I))
def nested(d,*keys,default=None):
    for k in keys:
        if not isinstance(d,dict):return default
        d=d.get(k)
    return default if d is None else d
class LiveData:
    def __init__(self,cfg):
        self.cfg=cfg;self.http=httpx.AsyncClient(timeout=float((cfg.get('http') or {}).get('timeout_s',6)));self.jwt=str((cfg.get('fomo') or {}).get('jwt') or os.getenv('FOMO_JWT') or '').strip();self.ws_url=str((cfg.get('fomo') or {}).get('websocket_url') or os.getenv('FOMO_WS_URL') or FOMO_WS).strip()
    async def close(self):await self.http.aclose()
    async def be(self,path,params,chain='solana'):
        key=str((self.cfg.get('api_keys') or {}).get('birdeye') or os.getenv('BIRDEYE_API_KEY') or '').strip()
        if not key:raise RuntimeError('BIRDEYE_API_KEY missing')
        r=await self.http.get(BE+path,params=params,headers={'X-API-KEY':key,'x-chain':chain});r.raise_for_status();return r.json()
    async def fomo_scan(self):
        if not self.jwt:raise RuntimeError('FOMO_JWT missing')
        out={}
        async with websockets.connect(self.ws_url,ping_interval=20,ping_timeout=20,open_timeout=10) as ws:
            await ws.send(json.dumps({'type':'challenge'}));end=time.time()+10;ok=False
            while time.time()<end:
                m=json.loads(await asyncio.wait_for(ws.recv(),10))
                if m.get('type')=='challenge':await ws.send(json.dumps({'type':'challengeResponse','jwt':self.jwt}))
                if m.get('type')=='challengeAccepted':ok=True;break
            if not ok:raise RuntimeError('FOMO WebSocket authentication failed')
            topic=NET['solana']+','+NET['robinhood'];await ws.send(json.dumps({'type':'subscribe','topicType':'trending_tokens','topicId':topic}))
            end=time.time()+float((self.cfg.get('fomo') or {}).get('listen_seconds',8))
            while time.time()<end:
                try:m=json.loads(await asyncio.wait_for(ws.recv(),max(.5,end-time.time())))
                except asyncio.TimeoutError:break
                if m.get('type')!='data' or m.get('topicType')!='trending_tokens':continue
                p=m.get('payload') or {};rows=p.get('tokens') if isinstance(p,dict) else p
                if isinstance(rows,dict):rows=list(rows.values())
                for t in rows or []:
                    addr=str(t.get('address') or t.get('tokenAddress') or '').strip();name=str(t.get('name') or t.get('tokenName') or '').strip();sym=str(t.get('symbol') or t.get('ticker') or '').strip();nid=str(t.get('networkId') or t.get('network_id') or p.get('networkId') or '')
                    chain='solana' if nid==NET['solana'] or str(t.get('chain') or '').lower()=='solana' else ('robinhood' if nid==NET['robinhood'] else '')
                    if not addr or not inu(name) or not chain:continue
                    out[chain+':'+addr]={'chain':chain,'address':addr,'symbol':sym,'name':name,'market_cap':f(t.get('marketCap') or t.get('market_cap') or t.get('mcap')),'price_usd':f(t.get('priceUsd') or t.get('price')),'liquidity':f(t.get('liquidity')),'volume24h':f(t.get('volume24h') or t.get('volume')),'change24h':f(t.get('change24h') or t.get('priceChange24h')),'launchpad':str(t.get('launchpad') or 'unknown'),'source':'fomo_ws'}
        return list(out.values())
    async def enrich_birdeye(self,t):
        if t['chain']!='solana':return t
        d=(await self.be('/defi/token_overview',{'address':t['address']},'solana')).get('data') or {};ex=d.get('extensions') or {}
        t.update({'price_usd':f(d.get('price'),t.get('price_usd',0)),'market_cap':f(d.get('mc'),t.get('market_cap',0)),'liquidity':f(d.get('liquidity'),t.get('liquidity',0)),'volume24h':f(d.get('v24hUSD'),t.get('volume24h',0)),'holders':f(d.get('holder')),'buys24h':f(d.get('buy24h')),'sells24h':f(d.get('sell24h')),'website':ex.get('website'),'x_url':ex.get('twitter')});return t
    async def ath(self,t):
        pair=t.get('pair_address')
        if not pair:return t
        try:
            net='solana' if t['chain']=='solana' else 'robinhood';url=GT+'/networks/'+net+'/pools/'+quote(pair,safe='')+'/ohlcv/day';r=await self.http.get(url,params={'aggregate':1,'limit':365});r.raise_for_status();rows=nested(r.json(),'data','attributes','ohlcv_list',default=[]);hs=[f(x[2]) for x in rows if isinstance(x,list) and len(x)>2 and f(x[2])>0]
            if hs:ath=max(hs);t['ath']=ath;t['ath_drawdown']=max(0,1-f(t.get('price_usd'))/ath)
        except Exception:pass
        return t
    async def x(self,t):
        key=str((self.cfg.get('api_keys') or {}).get('x_bearer') or os.getenv('X_BEARER_TOKEN') or '').strip()
        if not key:t['x_mentions24h']=0;t['x_velocity']=25 if t.get('x_url') else 0;return t
        q='("{}" OR ${}) -is:retweet lang:en'.format(t['name'],t['symbol']);start=(datetime.now(timezone.utc)-timedelta(hours=24)).isoformat().replace('+00:00','Z')
        try:
            r=await self.http.get(X_API+'/tweets/counts/recent',params={'query':q,'start_time':start},headers={'Authorization':'Bearer '+key});r.raise_for_status();n=f(nested(r.json(),'meta','total_tweet_count'));t['x_mentions24h']=n;t['x_velocity']=min(100,10*math.log10(n+1)+(20 if t.get('x_url') else 0))
        except Exception:t['x_mentions24h']=0;t['x_velocity']=25 if t.get('x_url') else 0
        return t
    async def scan(self):
        rows=await self.fomo_scan();flt=self.cfg.get('filters') or {};mx=float(flt.get('max_market_cap_usd',300000));liq=float(flt.get('min_liquidity_usd',5000));rows=[x for x in rows if 0<x.get('market_cap',0)<mx and x.get('liquidity',0)>=liq];out=[]
        for t in rows[:int((self.cfg.get('scanner') or {}).get('max_enriched_per_cycle',6))]:t=await self.enrich_birdeye(t);t=await self.ath(t);t=await self.x(t);out.append(t)
        return out
