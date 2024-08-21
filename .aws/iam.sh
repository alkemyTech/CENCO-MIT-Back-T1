# Variables para los nombres de los grupos
ADMIN_GROUP="admins-group"
DEVELOPER_GROUP="developers-group"

# Crear grupo de administradores
echo "Creando grupo de administradores: $ADMIN_GROUP"
aws iam create-group --group-name $ADMIN_GROUP

# Asignar política de administrador al grupo de administradores
echo "Asignando política de administrador al grupo $ADMIN_GROUP"
aws iam attach-group-policy --group-name $ADMIN_GROUP --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# Crear grupo de desarrolladores
echo "Creando grupo de desarrolladores: $DEVELOPER_GROUP"
aws iam create-group --group-name $DEVELOPER_GROUP

# Asignar política de desarrollador al grupo de desarrolladores
echo "Asignando política de desarrollador al grupo $DEVELOPER_GROUP"
aws iam attach-group-policy --group-name $DEVELOPER_GROUP --policy-arn arn:aws:iam::aws:policy/PowerUserAccess

# Crear usuarios y agregarlos a los grupos
echo "Creando usuario admin-user y agregándolo a $ADMIN_GROUP"
aws iam create-user --user-name admin-user
aws iam add-user-to-group --user-name admin-user --group-name $ADMIN_GROUP

# Lista de usuarios desarrolladores
DEVELOPER_USERS=("brisa" "kamila" "teresa" "genesis")

# Crear usuarios y agregarlos al grupo de desarrolladores
for USER in "${DEVELOPER_USERS[@]}"; do
  echo "Creando usuario $USER y agregándolo al grupo $DEVELOPER_GROUP"
  aws iam create-user --user-name $USER
  aws iam add-user-to-group --user-name $USER --group-name $DEVELOPER_GROUP
done

echo "Script completado con éxito."