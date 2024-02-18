function requirements () {
	if ! command -v node &> /dev/null
	then
		echo "node could not be found"
		exit
	fi

	if ! command -v pnpm &> /dev/null
	then
		echo "pnpm could not be found"
		exit
	fi
}

function backend () {
	echo -e "\e[1;46mSetting up backend\e[0m";
	cd backend;
	rm -rf .env
	cp .env.example .env
	echo "Installing dependencies...";
	rm -rf node_modules > /dev/null 2>&1
	pnpm install > /dev/null;
	echo "Dependencies installed";
	echo "Generate application keys (API and JWT secrets)"
	pnpm key:generate > /dev/null;
	read -p "Database name: " db_name
	read -p "Database username: " db_username
	read -p "Database password: " db_password
	sed -i "s/DB_NAME=.*/DB_NAME=$db_name/g" .env
	sed -i "s/MONGODB_USER=.*/MONGODB_USER=$db_username/g" .env
	sed -i "s/MONGODB_PASSWORD=.*/MONGODB_PASSWORD=$db_password/g" .env
	# pnpm test;
}

function frontend () {
	echo -e "\n\e[1;46mSetting up frontend\e[0m";
	cd ../frontend;
	rm -rf .env && cp .env.example .env
	echo "Installing dependencies...";
	rm -rf node_modules > /dev/null 2>&1
	pnpm install > /dev/null;
	echo "Dependencies installed";
	echo "Retrieve API key from the backend";
	api_key=$(cat ../backend/.env | grep API_KEY | cut -d'=' -f2)
	sed -i "s/NEXT_PUBLIC_API_KEY=.*/NEXT_PUBLIC_API_KEY=${api_key}/g" .env
	# pnpm test;
	echo -e "\nThe API key is ${api_key}";
}

requirements;
backend;
frontend;
