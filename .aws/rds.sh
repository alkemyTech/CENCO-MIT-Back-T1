#!/bin/bash

# Leer variables del archivo
source infrastructure_output.txt

# Variables adicionales
DB_INSTANCE_IDENTIFIER="talent-alke5"
DB_INSTANCE_CLASS="db.t3.micro"
ENGINE="mysql"
MASTER_USERNAME="admin"
MASTER_USER_PASSWORD='TalentAlke!!'
DB_NAME="talent_alke"
ALLOCATED_STORAGE=20
BACKUP_RETENTION_PERIOD=7
PUBLICLY_ACCESSIBLE="--publicly-accessible"
STORAGE_TYPE="gp2"
REGION="us-east-1"
RDS_SECURITY_GROUP_NAME="rds-sg-my-cenco"
DB_SUBNET_GROUP_NAME="mydbsubnetgroup-my-cenco"

# Crear un grupo de seguridad para RDS
RDS_SG_ID=$(aws ec2 create-security-group --group-name $RDS_SECURITY_GROUP_NAME --description "Security group for RDS" --vpc-id $VPC_ID --query 'GroupId' --output text)
echo "Grupo de seguridad RDS creado con ID: $RDS_SG_ID"

# Permitir el acceso desde el grupo de seguridad de la instancia EC2 al grupo de seguridad de la RDS
aws ec2 authorize-security-group-ingress --group-id $RDS_SG_ID --protocol tcp --port 3306 --source-group $SG_ID
echo "Permiso para acceso a la base de datos desde la instancia EC2 configurado."

# Crear un grupo de subredes (DB Subnet Group) para RDS
aws rds create-db-subnet-group \
    --db-subnet-group-name $DB_SUBNET_GROUP_NAME \
    --db-subnet-group-description "My DB Subnet Group" \
    --subnet-ids $PUBLIC_SUBNET_ID_A $PUBLIC_SUBNET_ID_B $PRIVATE_SUBNET_ID_A $PRIVATE_SUBNET_ID_B \
    --region $REGION

# Crear la instancia RDS
echo "Creando la instancia RDS..."
aws rds create-db-instance \
    --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
    --db-instance-class $DB_INSTANCE_CLASS \
    --engine $ENGINE \
    --master-username $MASTER_USERNAME \
    --master-user-password $MASTER_USER_PASSWORD \
    --db-name $DB_NAME \
    --allocated-storage $ALLOCATED_STORAGE \
    --backup-retention-period $BACKUP_RETENTION_PERIOD \
    $PUBLICLY_ACCESSIBLE \
    --storage-type $STORAGE_TYPE \
    --vpc-security-group-ids $RDS_SG_ID \
    --db-subnet-group-name $DB_SUBNET_GROUP_NAME \
    --region $REGION

# Verificar el estado de la instancia RDS
echo "Esperando a que la instancia RDS se cree..."
aws rds wait db-instance-available --db-instance-identifier $DB_INSTANCE_IDENTIFIER

# Obtener el endpoint de la base de datos
DB_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
    --query "DBInstances[0].Endpoint.Address" \
    --output text)

# Guardar la configuración de la base de datos en un archivo
echo "DB_HOST=$DB_ENDPOINT" > db_config.txt
echo "DB_PORT=3306" >> db_config.txt
echo "DB_NAME=$DB_NAME" >> db_config.txt
echo "DB_USERNAME=$MASTER_USERNAME" >> db_config.txt
echo "DB_PASSWORD=$MASTER_USER_PASSWORD" >> db_config.txt

# Mostrar información de la base de datos
echo "Instancia de base de datos creada exitosamente."
echo "Endpoint: $DB_ENDPOINT"
echo "Puerto: 3306"

# Asociar la instancia EC2 al grupo de seguridad de RDS
aws ec2 modify-instance-attribute --instance-id $INSTANCE_ID --groups $SG_ID $RDS_SG_ID

echo "La instancia EC2 ha sido configurada para conectarse a la base de datos RDS."