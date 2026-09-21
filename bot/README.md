# MemeOS live bot
1. cd bot and activate .venv.
2. pip install -r requirements.txt.
3. Copy bot/.env.example to repository-root .env and fill values.
4. Create Telegram api_id/api_hash at https://my.telegram.org.
5. python main.py --auth creates TELEGRAM_SESSION.
6. Keep execution.dry_run: true for the first test.
7. python main.py --once runs one live scan without continuous polling.
8. python main.py runs continuously.
9. Discovery is FOMO.FAMILY WebSocket; no DEXScreener dependency.
10. Birdeye enriches Solana market/holder data; X adds social velocity.
11. Blockscout enriches Robinhood Chain holder data.
12. Token names must contain Inu/INU; market cap must be below $300k.
13. Entry also requires score and on-chain risk gates.
14. Set dry_run false only after validating the Telegram bot UI/command.
15. Never commit .env, TELEGRAM_API_HASH or TELEGRAM_SESSION.
