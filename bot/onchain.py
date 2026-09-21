from __future__ import annotations
import json,time
from pathlib import Path
import httpx
class OnchainAnalyzer:
    def __init__(self,cfg):
        self.cfg=cfg;self.client=httpx.AsyncClient(timeout=6);self.db=Path((cfg.get('onchain') or {}).get('history_file','data/onchain_history.json'));self.db.parent.mkdir(parents=True,exist_ok=True)
        try:self.history=json.loads(self.db.read_text())
        except Exception:self.history={}
    async def close(self):await self.client.aclose();self.db.write_text(json.dumps(self.history))
    async def enrich(self,t):
        if t.get('chain')=='solana':return await self.solana(t)
        if t.get('chain')=='robinhood':return await self.blockscout(t)
        return t
    async def rpc(self,url,method,params):
        r=await self.client.post(url,json={'jsonrpc':'2.0','id':1,'method':method,'params':params});r.raise_for_status();return r.json().get('result') or {}
    async def solana(self,t):
        rpc=((self.cfg.get('chains') or {}).get('solana') or {}).get('rpc_url') or 'https://api.mainnet.solana.com'
        try:
            bal=await self.rpc(rpc,'getTokenLargestAccounts',[t['address'],{'commitment':'finalized'}]);rows=bal.get('value') or [];tot=sum(float(x.get('uiAmount') or 0) for x in rows);t['top10_holder_pct']=sum(float(x.get('uiAmount') or 0) for x in rows[:10])/tot*100 if tot else 0;t['top_holders']=rows[:20];t['onchain_security']=max(0,100-t['top10_holder_pct']);t['big_player_history_score']=self.history_score(t['address'],rows[:10]);self.remember(t['address'],rows[:10])
        except Exception:t.setdefault('top10_holder_pct',0);t.setdefault('onchain_security',50);t.setdefault('big_player_history_score',50)
        return t
    async def blockscout(self,t):
        base=((self.cfg.get('chains') or {}).get('robinhood') or {}).get('blockscout_url','https://robinhoodchain.blockscout.com');key=((self.cfg.get('api_keys') or {}).get('blockscout') or '')
        try:
            p={'apikey':key} if key else {};r=await self.client.get(f'{base}/api/v2/tokens/{t["address"]}/holders',params=p);r.raise_for_status();rows=r.json().get('items') or [];t['top_holders']=rows[:20];t['top10_holder_pct']=sum(float((x.get('value') or 0))/max(1,float(x.get('total_supply') or 1))*100 for x in rows[:10]);t['onchain_security']=max(0,100-t['top10_holder_pct']);t['big_player_history_score']=self.history_score(t['address'],rows[:10]);self.remember(t['address'],rows[:10])
        except Exception:t.setdefault('top10_holder_pct',0);t.setdefault('onchain_security',50);t.setdefault('big_player_history_score',50)
        return t
    def history_score(self,address,rows):
        old=self.history.get(address,[]);cur={str(x.get('address') or x.get('owner') or x.get('hash')) for x in rows};seen=set().union(*(set(x.get('holders',[])) for x in old[-40:])) if old else set();return min(100,50+len(cur&seen)*5)
    def remember(self,address,rows):
        holders=[str(x.get('address') or x.get('owner') or x.get('hash')) for x in rows];h=self.history.setdefault(address,[]);h.append({'ts':int(time.time()),'holders':holders});del h[:-40]
