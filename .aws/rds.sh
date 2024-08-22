#!/bin/bash

# Variables
DB_INSTANCE_IDENTIFIER="talent-alke"
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
    --region $REGION \

# Verificar el estado de la instancia RDS
echo "Esperando a que la instancia RDS se cree..."
sleep 30  # Espera 60 segundos; ajusta según sea necesario

echo "Verificando el estado de la instancia RDS..."
aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
    --region $REGION \
