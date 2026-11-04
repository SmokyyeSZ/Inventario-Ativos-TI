#!/bin/bash

set -e

echo "Aplicando migrações do banco de dados SQLite..."
python manage.py makemigrations
python manage.py migrate

echo "Configurando acesso do Professor Igor..."

python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='igor').exists():
    User.objects.create_superuser('igor', 'igor@faculdade.edu.br', 'senha123')
    print('Superusuário Igor criado com sucesso!')
else:
    print('Superusuário Igor já existe no banco de dados.')
"

echo "Iniciando o servidor backend..."

exec "$@"