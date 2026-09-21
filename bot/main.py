from __future__ import annotations
import argparse,asyncio,json,os,re,time
from pathlib import Path
from dotenv import load_dotenv
import yaml
from data_live import LiveData
from execution import TelegramExecutor
from onchain import OnchainAnalyzer
from scoring import dynamic_position_size,score_token
ROOT=Path(__file__).resolve().parent.parent;load_dotenv(ROOT/'.env');VR=re.compile(r'\$\{([A-Za-z_][A-Za-z0-9_]*)\}')
def ex(x):
    if isinstance(x,str): return VR.sub(lambda m:os.getenv(m.group(1),''),x)
    if isinstance(x,list): return [ex(v) for v in x]
    if isinstance(x,dict): return {k:ex(v) for k,v in x.items()}
    return x
def cfgload(path='config.yaml'): return ex(yaml.safe_load((Path(__file__).resolve().parent/path).read_text()) or {})
class State:
    def __init__(self,path):
        self.path=Path(path)
        try:self.data=json.loads(self.path.read_text())
        except Exception:self.data={'day':time.strftime('%Y-%m-%d'),'open':[],'spent_today':0.0,'traded':{}}
    def save(self):self.path.parent.mkdir(parents=True,exist_ok=True);self.path.write_text(json.dumps(self.data,indent=2))
    def roll(self):
        d=time.strftime('%Y-%m-%d')
        if self.data.get('day')!=d:self.data={'day':d,'open':[],'spent_today':0.0,'traded':{}};self.save()
    def exposure(self):return sum(float(x.get('size_usd',0)) for x in self.data.get('open',[]))
    def ok(self,a,cd):return time.time()-float(self.data.get('traded',{}).get(a,0))>=cd
    def mark(self,t,s):self.data.setdefault('open',[]).append({'address':t['address'],'chain':t['chain'],'symbol':t['symbol'],'size_usd':s,'ts':time.time()});self.data.setdefault('traded',{})[t['address']]=time.time();self.data['spent_today']=float(self.data.get('spent_today',0))+s;self.save()
async def run(c,once=False):
    live,onchain,exe=LiveData(c),OnchainAnalyzer(c),TelegramExecutor(c);flt=c.get('filters') or {};sc=c.get('scoring') or {};risk=c.get('risk') or {};st=State((c.get('runtime') or {}).get('state_file',str(ROOT/'data/bot_state.json')));st.roll()
    async def cycle():
        rows=await live.scan();tr=[]
        for t in rows:
            if t.get('market_cap',0)>=float(flt.get('max_market_cap_usd',300000)):continue
            t=await onchain.enrich(t)
            if t.get('top10_holder_pct',0)>float(flt.get('max_top10_holder_pct',45)) or t.get('onchain_security',0)<float(flt.get('min_onchain_security',50)):continue
            s=score_token(t,sc)
            if not s['passed_score'] or len(st.data.get('open',[]))>=int(risk.get('max_open_positions',3)) or float(st.data.get('spent_today',0))>=float(risk.get('max_daily_spend_usd',100)) or not st.ok(t['address'],int(risk.get('cooldown_seconds',300))):continue
            size=dynamic_position_size(s,s['score'],float(risk.get('portfolio_equity_usd',100)),st.exposure(),{**risk,'score_threshold':sc.get('score_threshold',72),'max_market_cap_usd':flt.get('max_market_cap_usd',300000)})
            if size<=0:continue
            r=await exe.buy(s,size);e={'event':'TRADE','result':r,'score':s['score'],'factors':s['factors'],'chain':t['chain'],'address':t['address']};print(json.dumps(e));tr.append(e)
            if r.get('status') in ('DRY_RUN','SENT'):st.mark(t,size)
        return {'candidates':len(rows),'trades':tr}
    try:
        if once:return await cycle()
        while True:
            try:await cycle()
            except Exception as e:print(json.dumps({'event':'LOOP_ERROR','error':str(e)}))
            await asyncio.sleep(float((c.get('scanner') or {}).get('poll_seconds',10)))
    finally:await exe.close();await live.close();await onchain.close()
async def main():
    p=argparse.ArgumentParser();p.add_argument('--auth',action='store_true');p.add_argument('--once',action='store_true');p.add_argument('--config',default='config.yaml');a=p.parse_args();c=cfgload(a.config)
    if a.auth:await TelegramExecutor(c).auth();return
    if a.once:print(json.dumps({'event':'SCAN_DONE',**(await run(c,True))}))
    else:await run(c,False)
if __name__=='__main__':asyncio.run(main())
