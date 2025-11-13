from rest_framework.serializers import ModelSerializer, ValidationError, CharField
from rest_framework import serializers

from .models import Guia, Estatus
from django.contrib.auth.models import User


class GuideSerializer(ModelSerializer):
    class Meta:
        model = Guia
        fields = [
            "id",
            "trackingNumber",
            "origin",
            "destination",
            "currentStatus"
        ]
        extra_kwargs = {
            'trackingNumber': {'label': 'Número de Seguimiento'},
            'origin': {'label': 'Origen'},
            'destination': {'label': 'Destino'},
            'currentStatus': {'label': 'Estado Actual'},
        }
        read_only_fields = ['id', "currentStatus"]

    def validate(self, data):
        """Validación de múltiples campos"""
        if self.instance:
            # En UPDATE (PUT/PATCH)
            origin = data.get('origin', self.instance.origin)
            destination = data.get('destination', self.instance.destination)
        origin = data.get('origin')
        destination = data.get('destination')

        # Validar solo si ambos tienen valor
        if origin and destination and origin == destination:
            raise ValidationError("Origen y destino no pueden ser iguales")
        return data
    
        
class UserSerializer(ModelSerializer):
    password2 = CharField(
        style = { 'input_type': 'password' }, 
        label = "Contraseña (Repita)",
        write_only = True, 
        required = False
    )
    
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "password2"
        ]
        extra_kwargs = {
            "username": {"label": "Nombre"},
            "email": {"label": "Correo"},
            "password": { "write_only": True, "label": "Contraseña", "required": False,  "style": {'input_type': 'password'}, },
        }
        read_only_fields = ['id']

    def validate_username(self, value):
        #Django no permite usuarios con el mismo username
        """Validar que el username sea único"""
        user = self.instance  # None en creación, User instance en update
        
        # Si es update y el username no cambió, permitirlo
        if user and user.username == value:
            return value
        # Verificar si ya existe
        query = User.objects.filter(username=value)
        
        # Si es update, excluir el usuario actual de la búsqueda
        if user:
            query = query.exclude(pk=user.pk)
        
        if query.exists():
            raise serializers.ValidationError(
                "Este nombre de usuario ya está en uso."
            )
        return value

    def validate(self, data):
        password = data.get('password')
        password2 = data.get('password2')
        is_create = not self.instance
        changing_password = password or password2
        
        if is_create or changing_password:
            # Validar que ambas contraseñas estén presentes
            if not password or not password2:
                raise ValidationError({
                    'password': 'Se requieren ambas contraseñas'
                })
            
            # Validar que coincidan
            if password != password2:
                raise ValidationError({
                    'password2': 'Las contraseñas no coinciden'
                })
        
        return data     
         

    def validate_email(self, value):
        """Validar que email sea único (en creación y actualización)"""
        value = value.lower().strip()  # Normalizar
        qs = User.objects.filter(email=value)
        
        # Excluir instancia actual en updates
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        
        if qs.exists():
            raise ValidationError('Este email ya está registrado')  # Formato correcto
        
        return value
    
    def create(self, validated_data):
        """Crear nuevo usuario"""
        validated_data.pop('password2')
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
       
    
    def update(self, instance, validated_data):
        """Actualizar usuario existente"""
        validated_data.pop('password2', None)  # Limpiar password2
        password = validated_data.pop('password', None)
        
        # loop en lugar de asignaciones manuales
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance
   
class EstatusSerializer(ModelSerializer):
    guide_detail = GuideSerializer(source='guide', read_only=True)
    updated_by_detail = UserSerializer(source='updatedBy', read_only=True)
    
    guide = serializers.PrimaryKeyRelatedField(
        queryset=Guia.objects.all(),
        write_only=True,
        label = "Número de rastreo",
        error_messages={
            'does_not_exist': 'La guía con ID {pk_value} no existe en el sistema',
            'incorrect_type': 'El ID de la guía debe ser un número entero',
            'required': 'El campo guía es obligatorio'
        }
    )
    
    class Meta:
        model = Estatus
        fields = [
            'id',
            'guide',
            'guide_detail',
            'status',
            'timestamp',
            'updated_by_detail'
        ]
        read_only_fields = ['timestamp', 'id']
        extra_kwargs = {
            'status': {'label': 'Estado'},
        }
    
    def validate_status(self, value):
        """Validar que el status sea válido"""
        VALID_STATUSES = [
            'Pendiente',
            'En tránsito',
            'Entregado',
            'Cancelado'
        ]
        
        if value not in VALID_STATUSES:
            raise ValidationError(
                f"Status inválido. Valores permitidos: {', '.join(VALID_STATUSES)}"
            )
        
        return value
    
    def validate_guide(self, value):
        """Validación del campo guide"""
        # Solo validar en CREATE (no en UPDATE)
        if not self.instance:
            if value.currentStatus == 'Cancelado':
                raise ValidationError(
                    "No se puede crear estatus para una guía cancelada"
                )
            
            if value.currentStatus == 'Entregado':
                raise ValidationError(
                    "No se puede crear estatus para una guía ya entregada"
                )
        
        return value
    
    def validate(self, attrs):
        """Validar que no exista un Estatus duplicado para la misma guía"""
        guide = attrs.get('guide')
        new_status = attrs.get('status')
        
        # En CREATE: validar que no exista ya un estatus con el mismo status para esta guía
        if not self.instance and guide and new_status:
            existe_duplicado = Estatus.objects.filter(
                guide=guide,
                status=new_status
            ).exists()
            
            if existe_duplicado:
                raise ValidationError({
                    'status': f'Ya existe un registro de estatus "{new_status}" para la guía {guide.trackingNumber}'
                })
        
        # En UPDATE: validar que no se duplique con otro registro (excepto el mismo)
        if self.instance and guide and new_status:
            existe_duplicado = Estatus.objects.filter(
                guide=guide,
                status=new_status
            ).exclude(id=self.instance.id).exists()
            
            if existe_duplicado:
                raise ValidationError({
                    'status': f'Ya existe otro registro de estatus "{new_status}" para la guía {guide.trackingNumber}'
                })
        
        return attrs
    
    def create(self, validated_data):
        """Crear estatus y actualizar currentStatus de la guía automáticamente"""
        # Crear el estatus
        estatus = Estatus.objects.create(**validated_data)
        
        # Actualizar el currentStatus de la guía
        guia = estatus.guide
        guia.currentStatus = estatus.status
        guia.save()
        
        return estatus
    
    def update(self, instance, validated_data):
        """Actualizar estatus y currentStatus de la guía"""
        # Actualizar los campos del estatus
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Si cambió el status, actualizar la guía
        if 'status' in validated_data:
            guia = instance.guide
            guia.currentStatus = instance.status
            guia.save()
        
        return instance