#!/bin/bash

# Variables
DB_INSTANCE_IDENTIFIER="mydbinstance"
DB_INSTANCE_CLASS="db.t3.micro"
ENGINE="mysql"
MASTER_USERNAME="admin"
MASTER_USER_PASSWORD="TalentAlke!!"
ALLOCATED_STORAGE=20
BACKUP_RETENTION_PERIOD=7
PUBLICLY_ACCESSIBLE="true"
STORAGE_TYPE="gp2"
REGION="us-east-1"

# Comando para crear la instancia RDS
aws rds create-db-instance \
    --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
    --db-instance-class $DB_INSTANCE_CLASS \
    --engine $ENGINE \
    --master-username $MASTER_USERNAME \
    --master-user-password $MASTER_USER_PASSWORD \
    --allocated-storage $ALLOCATED_STORAGE \
    --backup-retention-period $BACKUP_RETENTION_PERIOD \
    --publicly-accessible $PUBLICLY_ACCESSIBLE \
    --storage-type $STORAGE_TYPE \
    --region $REGION \

# Verificar el estado de la instancia RDS
echo "Verificando el estado de la instancia RDS..."
aws rds describe-db-instances --db-instance-identifier $DB_INSTANCE_IDENTIFIER --region $REGION --profile $PROFILE
