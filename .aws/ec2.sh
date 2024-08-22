#!/bin/bash

# Parámetros para la configuración VPC
NETWORK_NAME="cenco-vpc"
SUBNET_NAME_PUBLIC="cenco-public-subnet"
SUBNET_NAME_PRIVATE="cenco-private-subnet"
INTERNET_GATEWAY="cenco-gtw"
ROUTING_TABLE="cenco-route-table"
CIDR="10.0.0.0/16"
AWS_REGION="us-east-1"
SUBNET_PUBLIC_CIDR="10.0.1.0/24"
SUBNET_PRIVATE_CIDR="10.0.2.0/24"
# Parámetros para la configuración EC2
INSTANCE_NAME="server-cenco"
AMI="ami-0e86e20dae9224db8"
INSTANCE_TYPE="t2.micro"
KEY_PAIR_NAME="server-cenco"
SECURITY_GROUP="server-cenco-sg"
REPO_URL="https://github.com/alkemyTech/CENCO-MIT-Back-T1.git"
PROJECT_DIRECTORY="CENCO-MIT-Back-T1"
NODEJS_VERSION="v20.14.0"

# Creación de la VPC y subredes
VPC_ID=$(aws ec2 create-vpc --cidr-block $CIDR --region $AWS_REGION --query 'Vpc.VpcId' --output text)
echo "Se creó la VPC con ID: $VPC_ID"
aws ec2 create-tags --resources $VPC_ID --tags Key=Name,Value=$NETWORK_NAME

PUBLIC_SUBNET_ID=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block $SUBNET_PUBLIC_CIDR --availability-zone "${AWS_REGION}a" --query 'Subnet.SubnetId' --output text)
echo "Subred pública creada con ID: $PUBLIC_SUBNET_ID"
aws ec2 create-tags --resources $PUBLIC_SUBNET_ID --tags Key=Name,Value=$SUBNET_NAME_PUBLIC
aws ec2 modify-subnet-attribute --subnet-id $PUBLIC_SUBNET_ID --map-public-ip-on-launch

PRIVATE_SUBNET_ID=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block $SUBNET_PRIVATE_CIDR --availability-zone "${AWS_REGION}a" --query 'Subnet.SubnetId' --output text)
echo "Subred privada creada con ID: $PRIVATE_SUBNET_ID"
aws ec2 create-tags --resources $PRIVATE_SUBNET_ID --tags Key=Name,Value=$SUBNET_NAME_PRIVATE

# Creación y asociación de Gateway de Internet
IGW_ID=$(aws ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID
echo "Internet Gateway creado y asociado con ID: $IGW_ID"
aws ec2 create-tags --resources $IGW_ID --tags Key=Name,Value=$INTERNET_GATEWAY

# Configuración de la tabla de rutas
ROUTE_TABLE_ID=$(aws ec2 create-route-table --vpc-id $VPC_ID --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $ROUTE_TABLE_ID --destination-cidr-block "0.0.0.0/0" --gateway-id $IGW_ID
echo "Tabla de rutas configurada con ID: $ROUTE_TABLE_ID"
aws ec2 associate-route-table --route-table-id $ROUTE_TABLE_ID --subnet-id $PUBLIC_SUBNET_ID
echo "Subred pública asociada a la tabla de rutas"

echo "Configuración de VPC y subredes completada."

# Creación de un par de llaves para acceso SSH
aws ec2 create-key-pair --key-name $KEY_PAIR_NAME --query 'KeyMaterial' --output text > ${KEY_PAIR_NAME}.pem
chmod 400 ${KEY_PAIR_NAME}.pem
echo "Par de llaves creado con el nombre: $KEY_PAIR_NAME"

# Creación del grupo de seguridad y configuración de reglas
SG_ID=$(aws ec2 create-security-group --group-name $SECURITY_GROUP --description "Security group for deployment" --vpc-id $VPC_ID --query 'GroupId' --output text)
echo "Grupo de seguridad creado con ID: $SG_ID"

CURRENT_IP=$(curl -s http://checkip.amazonaws.com)
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr ${CURRENT_IP}/32
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0
echo "Reglas de seguridad configuradas para el grupo $SECURITY_GROUP"

# Lanzamiento de la instancia EC2
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI \
  --instance-type $INSTANCE_TYPE \
  --key-name $KEY_PAIR_NAME \
  --security-group-ids $SG_ID \
  --subnet-id $PUBLIC_SUBNET_ID \
  --associate-public-ip-address \
  --region $AWS_REGION \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "Instancia EC2 lanzada con ID: $INSTANCE_ID"

# Esperar a que la instancia esté activa
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# Obtener la IP pública de la instancia
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

# Verificación de la IP pública
if [ -z "$PUBLIC_IP" ]; then
    echo "Error: No se pudo obtener la IP pública de la instancia."
    exit 1
fi

echo "Instancia EC2 con IP pública: $PUBLIC_IP"
echo "Preparando la instancia para el despliegue."

# Esperar a que la instancia esté lista para conexiones SSH
sleep 60

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
PORT=3306
DATABASE="name_database"
USERNAMEDB="root"
PASSWORD="123456"
HOST="localhost"
JWT_SECRET=ead643ce042680b8acf42e5f9e8463318cc63bcd8a51cd40ee9cf1444b718a029e8e342f7083042db0742d8f244af94f8aac2c909a6f73d00060d1b5f5fb40f8
DEFAULT_ADMIN_NAME=Admin
DEFAULT_ADMIN_RUT=11.111.111-1
DEFAULT_ADMIN_EMAIL=admin@admin.cl
DEFAULT_ADMIN_PASSWORD=Password

# Configuración de límite de tasa
RATE_LIMIT_LOGIN_WINDOW_MS=60000  # 1 minuto
RATE_LIMIT_LOGIN_MAX_REQUESTS=5  # 5 intentos
RATE_LIMIT_SIGNUP_WINDOW_MS=60000  # 1 minuto
RATE_LIMIT_SIGNUP_MAX_REQUESTS=10  # 10 solicitudes
RATE_LIMIT_GENERAL_WINDOW_MS=60000  # 1 minuto
RATE_LIMIT_GENERAL_MAX_REQUESTS=100  # 100 solicitudes

# Configuración de CORS
CORS_ORIGIN="http://localhost:5173"
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

echo "Script completado. La aplicación está lista y ejecutándose en $PUBLIC_IP."
