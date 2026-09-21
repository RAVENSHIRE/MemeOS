from __future__ import annotations
import asyncio,os,re
from pathlib import Path
from typing import Any,Dict,Optional
from dotenv import load_dotenv
from telethon import TelegramClient
from telethon.sessions import StringSession
load_dotenv(Path(__file__).resolve().parent.parent/'.env')
class TelegramExecutor:
    def __init__(self,cfg:Dict[str,Any]):
        tg=cfg.get('telegram') or {};self.cfg=cfg;self.api_id_raw=str(tg.get('api_id') or os.getenv('TELEGRAM_API_ID') or '').strip();self.api_hash=str(tg.get('api_hash') or os.getenv('TELEGRAM_API_HASH') or '').strip();self.session=str(tg.get('session') or os.getenv('TELEGRAM_SESSION') or '').strip();self.client:Optional[TelegramClient]=None
    def _client(self):
        if not self.api_id_raw or not self.api_hash:raise RuntimeError('Missing TELEGRAM_API_ID / TELEGRAM_API_HASH in repository-root .env')
        try:api_id=int(self.api_id_raw)
        except ValueError as e:raise RuntimeError('TELEGRAM_API_ID must be numeric') from e
        if self.client is None:self.client=TelegramClient(StringSession(self.session),api_id,self.api_hash)
        return self.client
    async def auth(self):
        phone=os.getenv('TELEGRAM_PHONE') or input('Telegram phone (+...): ').strip()
        if not phone.startswith('+'):raise RuntimeError('TELEGRAM_PHONE must use international format')
        c=self._client();await c.start(phone=phone);s=c.session.save();print('TELEGRAM_SESSION='+s);await c.disconnect();return s
    async def close(self):
        if self.client and self.client.is_connected():await self.client.disconnect()
    async def _sol_usd(self):
        import httpx
        key=str((self.cfg.get('api_keys') or {}).get('birdeye') or os.getenv('BIRDEYE_API_KEY') or '').strip()
        if not key:raise RuntimeError('BIRDEYE_API_KEY required for SOL/USD sizing')
        async with httpx.AsyncClient(timeout=5) as c:
            r=await c.get('https://public-api.birdeye.so/defi/price',params={'address':'So11111111111111111111111111111111111111112'},headers={'X-API-KEY':key,'x-chain':'solana'});r.raise_for_status();d=r.json().get('data') or {};p=float(d.get('value') or d.get('price') or 0)
            if p<=0:raise RuntimeError('Invalid SOL price from Birdeye')
            return p
    async def buy(self,t,size):
        ex=self.cfg.get('execution') or {}
        if ex.get('dry_run',True):return {'status':'DRY_RUN','chain':t['chain'],'address':t['address'],'size_usd':size}
        c=self._client()
        if not c.is_connected():await c.connect()
        if not await c.is_user_authorized():raise RuntimeError('Telegram session not authorized; run python main.py --auth')
        cc=ex.get(t['chain']) or {};bot=str(cc.get('bot_username') or '').lstrip('@')
        if not bot:raise RuntimeError(f'Missing execution bot for {t["chain"]}')
        return await (self._trojan(bot,t,size,cc) if t['chain']=='solana' else self._template(bot,t,size,cc))
    async def _trojan(self,bot,t,size,cfg):
        sol=round(size/await self._sol_usd(),int(cfg.get('native_round_decimals',3)));c=self._client();await c.send_message(bot,t['address']);end=asyncio.get_running_loop().time()+float(cfg.get('button_timeout_s',20));are=re.compile(str(cfg.get('amount_button_regex',r'(?i).*{native_amount}.*')).format(native_amount=re.escape(str(sol))));bre=re.compile(str(cfg.get('buy_button_regex',r'(?i)^buy.*$')))
        while asyncio.get_running_loop().time()<end:
            async for m in c.iter_messages(bot,limit=15):
                if not m.buttons:continue
                for ri,row in enumerate(m.buttons):
                    for ci,b in enumerate(row):
                        txt=getattr(b,'text','') or ''
                        if are.search(txt):await m.click(ri,ci);return {'status':'SENT','provider':'trojan','bot':bot,'size_usd':size,'native_amount':sol,'address':t['address']}
                        if bre.search(txt):await m.click(ri,ci);await asyncio.sleep(.5)
            await asyncio.sleep(.5)
        raise RuntimeError('Trojan amount button not found; adjust amount_button_regex')
    async def _template(self,bot,t,size,cfg):
        tpl=str(cfg.get('command_template') or '').strip()
        if not tpl:raise RuntimeError('Missing Robinhood command_template')
        msg=tpl.format(address=t['address'],symbol=t['symbol'],size_usd=size);await self._client().send_message(bot,msg);return {'status':'SENT','provider':cfg.get('provider','telegram'),'bot':bot,'message':msg}
