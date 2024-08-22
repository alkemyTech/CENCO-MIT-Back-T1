#!/bin/bash

# Leer la IP pública desde el archivo
PUBLIC_IP=$(cat public_ip.txt)

# Leer el nombre del Key Pair desde el archivo
KEY_PAIR_NAME=$(cat key_pair_name.txt)

# Leer la configuración de la base de datos desde el archivo
source db_config.txt

# Parámetros adicionales para la configuración de la instancia
REPO_URL="https://github.com/alkemyTech/CENCO-MIT-Back-T1.git"
PROJECT_DIRECTORY="CENCO-MIT-Back-T1"
NODEJS_VERSION="v20.14.0"

# Verificar si la IP pública está disponible
if [ -z "$PUBLIC_IP" ]; then
    echo "Error: No se pudo obtener la IP pública desde el archivo."
    exit 1
fi

echo "Conectándose a la instancia EC2 con IP pública: $PUBLIC_IP"

# Asegurar los permisos del archivo de clave privada
chmod 400 ${KEY_PAIR_NAME}.pem

# Conexión a la instancia y configuración del entorno
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i ${KEY_PAIR_NAME}.pem ubuntu@$PUBLIC_IP <<EOF
  # Actualización del sistema e instalación de dependencias
  sudo apt-get update
  sudo apt-get install -y build-essential curl

  # Instalación de NVM y Node.js
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
  export NVM_DIR="\$HOME/.nvm"
  [ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
  nvm install $NODEJS_VERSION
  nvm use $NODEJS_VERSION

  # Clonación del repositorio y acceso al directorio del proyecto
  git clone $REPO_URL
  cd $PROJECT_DIRECTORY

  # Creación del archivo .env con variables de entorno
  cat <<EOT > .env
PORT=$DB_PORT
DATABASE="$DB_NAME"
USERNAMEDB="$DB_USERNAME"
PASSWORD="$DB_PASSWORD"
HOST="$DB_HOST"
JWT_SECRET=ead643ce042680b8acf42e5f9e8463318cc63bcd8a51cd40ee9cf1444b718a029e8e342f7083042db0742d8f244af94f8aac2c909a6f73d00060d1b5f5fb40f8
DEFAULT_ADMIN_NAME=Admin
DEFAULT_ADMIN_RUT=11.111.111-1
DEFAULT_ADMIN_EMAIL=admin@admin.cl
DEFAULT_ADMIN_PASSWORD=AdminPassword@123

# Configuración de límite de tasa
RATE_LIMIT_LOGIN_WINDOW_MS=60000  # 1 minuto
RATE_LIMIT_LOGIN_MAX_REQUESTS=5  # 5 intentos
RATE_LIMIT_SIGNUP_WINDOW_MS=60000  # 1 minuto
RATE_LIMIT_SIGNUP_MAX_REQUESTS=10  # 10 solicitudes
RATE_LIMIT_GENERAL_WINDOW_MS=60000  # 1 minuto
RATE_LIMIT_GENERAL_MAX_REQUESTS=100  # 100 solicitudes

# Configuración de CORS
CORS_ORIGIN="http://proyect-cenco.s3-website-us-east-1.amazonaws.com/"
EOT

  # Verificación del contenido del directorio
  ls -la

  # Instalación de dependencias del proyecto
  npm install

  # Compilación del proyecto
  npm run build

  # Iniciar la aplicación
  npm run start:prod &

  echo "Aplicación desplegada y ejecutándose en $PUBLIC_IP"
EOF

echo "Script de configuración completado. La aplicación está lista y ejecutándose en $PUBLIC_IP."
