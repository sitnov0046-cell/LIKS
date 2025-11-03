#!/bin/bash

# Обновляем систему
apt update && apt upgrade -y

# Устанавливаем Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Устанавливаем nginx
apt install -y nginx

# Настраиваем nginx
cat > /etc/nginx/sites-available/telegram-app << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # Замените на ваш домен

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Включаем сайт
ln -s /etc/nginx/sites-available/telegram-app /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Копируем systemd сервис
cp /root/webapp/telegram-app.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable telegram-app
systemctl start telegram-app

# Устанавливаем certbot для SSL
apt install -y certbot python3-certbot-nginx