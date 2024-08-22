#!/bin/bash

# Parámetros
REPO_URL="git@github.com:alkemyTech/CENCO-MIT-Front-T1.git"
REPO_BRANCH="fix/errors-front"
PROJECT_DIRECTORY="CENCO-MIT-Front-T1"
BUCKET_NAME="proyect-cenco"
PROFILE="admin"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""

# Configurar AWS credenciales
echo "Configurando credenciales de AWS..."
aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID --profile $PROFILE
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY --profile $PROFILE
aws configure set region $AWS_REGION --profile $PROFILE

# Clonación del repositorio
echo "Clonando el repositorio..."
git clone $REPO_URL -b $REPO_BRANCH
cd $PROJECT_DIRECTORY

# Instalar dependencias
npm install

# Construcción del proyecto
echo "Construyendo el proyecto..."
npm run build

# Creación del bucket S3
echo "Creando el bucket S3..."
aws s3 mb s3://$BUCKET_NAME --profile $PROFILE --region $AWS_REGION

# Configuración del acceso público al bucket
echo "Configurando el acceso público al bucket..."
aws s3api put-public-access-block --bucket $BUCKET_NAME --public-access-block-configuration '{
    "BlockPublicAcls": false,
    "IgnorePublicAcls": false,
    "BlockPublicPolicy": false,
    "RestrictPublicBuckets": false
}' --profile $PROFILE

# Configuración de la política del bucket
echo "Configurando la política del bucket..."
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"
    }
  ]
}' --profile $PROFILE

# Sincronización de archivos con el bucket S3
echo "Subiendo archivos al bucket S3..."
aws s3 sync ./dist s3://$BUCKET_NAME --profile $PROFILE

# Crear archivo .env en el backend (si aplica)
echo "Creando archivo .env..."
cat <<EOT > .env
PORT=3306
DATABASE="talent_alke"
USERNAMEDB="root"
PASSWORD="100319"
HOST="localhost"
JWT_SECRET=""
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=5

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"
DEFAULT_ADMIN_NAME=Admin
DEFAULT_ADMIN_RUT=11.111.111-1
DEFAULT_ADMIN_EMAIL=admin@admin.cl
DEFAULT_ADMIN_PASSWORD=Password
RATE_LIMIT_LOGIN_WINDOW_MS=60000
RATE_LIMIT_LOGIN_MAX_REQUESTS=5
RATE_LIMIT_SIGNUP_WINDOW_MS=60000
RATE_LIMIT_SIGNUP_MAX_REQUESTS=10
RATE_LIMIT_GENERAL_WINDOW_MS=60000
RATE_LIMIT_GENERAL_MAX_REQUESTS=100
CORS_ORIGIN="http://localhost:5173"
EOT

# Crear distribución CloudFront
echo "Creando distribución CloudFront..."
aws cloudfront create-distribution --origin-domain-name $BUCKET_NAME.s3.amazonaws.com --default-root-object index.html --profile $PROFILE

echo "Script completado."
