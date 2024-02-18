update:
	git reset --hard
	git pull
	pm2 stop cq_fr
	pm2 stop cq_be
	pm2 delete cq_fr
	pm2 delete cq_be
	cd backend && pnpm install && pm2 start pnpm --name "cq_be" -- run "dev"
	cd frontend && pnpm install && pnpm build && pm2 start pnpm --name "cq_fr" -- run "start" -- --port 3055
	pm2 save
	
