# Variables para los nombres de los grupos
ADMIN_GROUP="admins"
DEVELOPER_GROUP="developers"

# Crear grupo de administradores
echo "Creando grupo de administradores: $ADMIN_GROUP"
aws iam create-group --group-name $ADMIN_GROUP

# Asignar política de administrador al grupo de administradores
echo "Asignando política de administrador al grupo $ADMIN_GROUP"
aws iam attach-group-policy --group-name $ADMIN_GROUP --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
echo "Asignando política de cambio de contraseña al grupo $ADMIN_GROUP"
aws iam attach-group-policy --group-name $ADMIN_GROUP --policy-arn arn:aws:iam::aws:policy/IAMUserChangePassword

# Crear grupo de desarrolladores
echo "Creando grupo de desarrolladores: $DEVELOPER_GROUP"
aws iam create-group --group-name $DEVELOPER_GROUP

# Asignar política de desarrollador al grupo de desarrolladores
echo "Asignando política de desarrollador al grupo $DEVELOPER_GROUP"
aws iam attach-group-policy --group-name $DEVELOPER_GROUP --policy-arn arn:aws:iam::aws:policy/PowerUserAccess
echo "Asignando política de cambio de contraseña al grupo $DEVELOPER_GROUP"
aws iam attach-group-policy --group-name $DEVELOPER_GROUP --policy-arn arn:aws:iam::aws:policy/IAMUserChangePassword

# Crear usuarios y agregarlos a los grupos
echo "Creando usuario admin-user y agregándolo a $ADMIN_GROUP"
aws iam create-user --user-name admin
aws iam add-user-to-group --user-name admin --group-name $ADMIN_GROUP
aws iam create-login-profile --user-name admin --password ContrasenaSegura123 --password-reset-required

# Lista de usuarios desarrolladores
DEVELOPER_USERS=("brisa" "kamila" "teresa" "genesis")

# Crear usuarios y agregarlos al grupo de desarrolladores
for USER in "${DEVELOPER_USERS[@]}"; do
  echo "Creando usuario $USER y agregándolo al grupo $DEVELOPER_GROUP"
  aws iam create-user --user-name $USER
  aws iam add-user-to-group --user-name $USER --group-name $DEVELOPER_GROUP
  aws iam create-login-profile --user-name $USER --password ContrasenaSegura123 --password-reset-required
done

echo "Script completado con éxito."