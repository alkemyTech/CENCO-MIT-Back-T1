#!/bin/bash

# Parámetros para la configuración VPC
NETWORK_NAME="my-cenco-vpc"
SUBNET_NAME_PUBLIC="my-cenco-public"
SUBNET_NAME_PRIVATE="my-cenco-private"
INTERNET_GATEWAY="my-cenco-gtw"
ROUTING_TABLE="my-cenco-route-table"
CIDR="10.1.0.0/16"
AWS_REGION="us-east-1"
SUBNET_PUBLIC_CIDR_A="10.1.1.0/24"
SUBNET_PUBLIC_CIDR_B="10.1.2.0/24"
SUBNET_PRIVATE_CIDR_A="10.1.3.0/24"
SUBNET_PRIVATE_CIDR_B="10.1.4.0/24"

# Parámetros para la configuración EC2
INSTANCE_NAME="my-server-cenco"
AMI="ami-0e86e20dae9224db8"
INSTANCE_TYPE="t2.micro"
KEY_PAIR_NAME="my-server-cenco"
SECURITY_GROUP="my-server-cenco-sg"

# Creación de la VPC y subredes
export VPC_ID=$(aws ec2 create-vpc --cidr-block $CIDR --region $AWS_REGION --query 'Vpc.VpcId' --output text)
echo "Se creó la VPC con ID: $VPC_ID"
aws ec2 create-tags --resources $VPC_ID --tags Key=Name,Value=$NETWORK_NAME

sleep 10

# Habilitar DNS resolution y DNS hostnames en la VPC
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-support
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames
echo "DNS resolution y DNS hostnames habilitados para la VPC $VPC_ID"

# Subred pública en la zona de disponibilidad us-east-1a
export PUBLIC_SUBNET_ID_A=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block $SUBNET_PUBLIC_CIDR_A --availability-zone "${AWS_REGION}a" --query 'Subnet.SubnetId' --output text)
echo "Subred pública (us-east-1a) creada con ID: $PUBLIC_SUBNET_ID_A"
aws ec2 create-tags --resources $PUBLIC_SUBNET_ID_A --tags Key=Name,Value="${SUBNET_NAME_PUBLIC}-a"
aws ec2 modify-subnet-attribute --subnet-id $PUBLIC_SUBNET_ID_A --map-public-ip-on-launch

# Subred pública en la zona de disponibilidad us-east-1b
export PUBLIC_SUBNET_ID_B=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block $SUBNET_PUBLIC_CIDR_B --availability-zone "${AWS_REGION}b" --query 'Subnet.SubnetId' --output text)
echo "Subred pública (us-east-1b) creada con ID: $PUBLIC_SUBNET_ID_B"
aws ec2 create-tags --resources $PUBLIC_SUBNET_ID_B --tags Key=Name,Value="${SUBNET_NAME_PUBLIC}-b"
aws ec2 modify-subnet-attribute --subnet-id $PUBLIC_SUBNET_ID_B --map-public-ip-on-launch

# Subred privada en la zona de disponibilidad us-east-1a
export PRIVATE_SUBNET_ID_A=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block $SUBNET_PRIVATE_CIDR_A --availability-zone "${AWS_REGION}a" --query 'Subnet.SubnetId' --output text)
echo "Subred privada (us-east-1a) creada con ID: $PRIVATE_SUBNET_ID_A"
aws ec2 create-tags --resources $PRIVATE_SUBNET_ID_A --tags Key=Name,Value="${SUBNET_NAME_PRIVATE}-a"

# Subred privada en la zona de disponibilidad us-east-1b
export PRIVATE_SUBNET_ID_B=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block $SUBNET_PRIVATE_CIDR_B --availability-zone "${AWS_REGION}b" --query 'Subnet.SubnetId' --output text)
echo "Subred privada (us-east-1b) creada con ID: $PRIVATE_SUBNET_ID_B"
aws ec2 create-tags --resources $PRIVATE_SUBNET_ID_B --tags Key=Name,Value="${SUBNET_NAME_PRIVATE}-b"

# Creación y asociación de Gateway de Internet
IGW_ID=$(aws ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID
echo "Internet Gateway creado y asociado con ID: $IGW_ID"
aws ec2 create-tags --resources $IGW_ID --tags Key=Name,Value=$INTERNET_GATEWAY

# Configuración de la tabla de rutas
ROUTE_TABLE_ID=$(aws ec2 create-route-table --vpc-id $VPC_ID --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $ROUTE_TABLE_ID --destination-cidr-block "0.0.0.0/0" --gateway-id $IGW_ID
echo "Tabla de rutas configurada con ID: $ROUTE_TABLE_ID"

# Asociar ambas subredes públicas a la tabla de rutas
aws ec2 associate-route-table --route-table-id $ROUTE_TABLE_ID --subnet-id $PUBLIC_SUBNET_ID_A
aws ec2 associate-route-table --route-table-id $ROUTE_TABLE_ID --subnet-id $PUBLIC_SUBNET_ID_B
echo "Subredes públicas asociadas a la tabla de rutas"

echo "Configuración de VPC y subredes completada."

# Creación de un par de llaves para acceso SSH
aws ec2 create-key-pair --key-name $KEY_PAIR_NAME --query 'KeyMaterial' --output text > ${KEY_PAIR_NAME}.pem
chmod 400 ${KEY_PAIR_NAME}.pem
echo "Par de llaves creado con el nombre: $KEY_PAIR_NAME"

# Guardar el nombre del Key Pair en un archivo
echo $KEY_PAIR_NAME > key_pair_name.txt

# Creación del grupo de seguridad y configuración de reglas
export SG_ID=$(aws ec2 create-security-group --group-name $SECURITY_GROUP --description "Security group for deployment" --vpc-id $VPC_ID --query 'GroupId' --output text)
echo "Grupo de seguridad creado con ID: $SG_ID"

CURRENT_IP=$(curl -s http://checkip.amazonaws.com)
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr ${CURRENT_IP}/32
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 3306 --cidr 0.0.0.0/0
echo "Reglas de seguridad configuradas para el grupo $SECURITY_GROUP"

# Lanzamiento de la instancia EC2
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI \
  --instance-type $INSTANCE_TYPE \
  --key-name $KEY_PAIR_NAME \
  --security-group-ids $SG_ID \
  --subnet-id $PUBLIC_SUBNET_ID_A \
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
echo "Guardando la IP pública en un archivo para el siguiente script."

# Guardar la IP pública en un archivo para usar en el script de conexión
echo $PUBLIC_IP > public_ip.txt


echo "VPC_ID=$VPC_ID" > infrastructure_output.txt
echo "SG_ID=$SG_ID" >> infrastructure_output.txt
echo "PUBLIC_SUBNET_ID_A=$PUBLIC_SUBNET_ID_A" >> infrastructure_output.txt
echo "PUBLIC_SUBNET_ID_B=$PUBLIC_SUBNET_ID_B" >> infrastructure_output.txt
echo "PRIVATE_SUBNET_ID_A=$PRIVATE_SUBNET_ID_A" >> infrastructure_output.txt
echo "PRIVATE_SUBNET_ID_B=$PRIVATE_SUBNET_ID_B" >> infrastructure_output.txt
echo "INSTANCE_ID=$INSTANCE_ID" >> infrastructure_output.txt
