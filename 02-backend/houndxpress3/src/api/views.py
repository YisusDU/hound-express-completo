from django.shortcuts import render
from rest_framework import status 
from rest_framework.response import Response 
from rest_framework.viewsets import ViewSet #<-- import ViewSet
from django.shortcuts import get_object_or_404 #<-- import get_object_or_404
from rest_framework.decorators import action

from houndexpress.models import Guia, Estatus
from django.contrib.auth.models import User

from houndexpress.serializers import GuideSerializer, UserSerializer, EstatusSerializer

# ViewSet for Guia model
class GuideViewSet(ViewSet):
    """ViewSet para listar guias"""
    serializer_class = GuideSerializer

    def list(self, request):
        """"Lista todas las guías"""
        guides = Guia.objects.all()
        serializer = self.serializer_class(guides, many=True)
        message = "Lista de guias"
        data = serializer.data
        return Response({"message": message, "data": data}, status=status.HTTP_200_OK)
  

    def create(self, request):
        """Crea una guia"""
        serializer = self.serializer_class(data = request.data)

        if not serializer.is_valid():
            data = serializer.errors
            return Response({"data": data}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save(currentStatus="Creado")
        message = "Creando una guia"
        data = serializer.data
        return Response({"message": message, "data": data}, status=status.HTTP_201_CREATED)
      
    def retrieve(self, request, pk=None):
        """Maneja obtener una guia por su ID"""
        guide = get_object_or_404(Guia, pk=pk)  
        message = f"Obteniendo la guia por su ID {pk}"
        data = GuideSerializer(guide).data
        
        return Response({"message": message, "data": data}, status=status.HTTP_200_OK)
  
    def update(self, request, pk=None):
        """Maneja la actualización de una guia por su ID"""
        guide = get_object_or_404(Guia, pk=pk)  
        serializer = self.serializer_class(guide, data=request.data, partial=False)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        message = f"Actualizando la guia con ID {pk}"
        serializer.save()
        data = serializer.data
        return Response({"message": message, "data": data}, status=status.HTTP_200_OK)
  
    def partial_update(self, request, pk=None):
        """Maneja la actualización parcial de una guia por su ID"""
        guide = get_object_or_404(Guia, pk=pk)  
        serializer = self.serializer_class(guide, data=request.data, partial=True)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        message = f"Actualizando la guia con ID {pk}"
        serializer.save()
        data = serializer.data
        return Response({"message": message, "data": data}, status=status.HTTP_200_OK)
  
    def destroy(self, request, pk=None):
        """Maneja la eliminación de una guia por su ID"""
        guide = get_object_or_404(Guia, pk=pk)
        guide.delete()
        message = f"La guia con ID {pk} se eliminó correctamente"
        return Response({"message": message}, status=status.HTTP_200_OK)


# ViewSet for User model
class UserViewSet(ViewSet):
    """ViewSet para listar usuarios"""
    serializer_class = UserSerializer #<-- we can use the ProductSerializer for simplicity
    def list(self, request):
        """Lista todos los usuarios"""
        users = User.objects.all()
        serializer = self.serializer_class(users, many=True)
        message = [
            "Lista de usuarios",
             serializer.data  
            ]
        return Response({"message": message}, status=status.HTTP_200_OK)

    def create(self, request):
        """Crea un mensaje de saludo"""
        serializer = self.serializer_class(data = request.data)
        if serializer.is_valid():
            serializer.save()
            data = serializer.data
            message = [
                "Creando un usuario con los siguientes datos:",
                data
            ]
            return Response({"message": message}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def retrieve(self, request, pk=None):
        """Maneja obtener un objeto por su ID"""
        user = get_object_or_404(User, pk=pk)
        message = {
            "message": "Obteniendo un usuario por su ID",
            "data": {
                "id": pk,
                "serializer": UserSerializer(user).data
            }
        }
        return Response({"message": message}, status=status.HTTP_200_OK)
    

    def update(self, request, pk=None):
        """Maneja la actualización completa de un objeto por su ID"""
        user = get_object_or_404(User, pk=pk)
        serializer = self.serializer_class(user, data=request.data, partial=False)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = serializer.save()
        
        return Response({
            "message": f"Usuario con ID {pk} actualizado correctamente",
            "data": UserSerializer(user).data
        }, status=status.HTTP_200_OK)


    def partial_update(self, request, pk=None):
        """Maneja la actualización parcial de un objeto por su ID"""
        user = get_object_or_404(User, pk=pk)
        serializer = self.serializer_class(user, data=request.data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        data = serializer.validated_data
        message = [
            f"Actualizando parcialmente el usuario con ID {pk}",
            data
        ]
        return Response({"message": message}, status=status.HTTP_200_OK)
    
    def destroy(self, request, pk=None):
        """Maneja la eliminación de un objeto por su ID"""
        user = get_object_or_404(User, pk=pk)
        user.delete()
        message = f"Eliminando el usuario con ID {pk}"
        return Response({"message": message}, status=status.HTTP_200_OK)
    

class EstatusViewSet(ViewSet):
    """ViewSet para listar los Estatus"""
    serializer_class = EstatusSerializer  
    
    def list(self, request):
        """Listar todos los estatus"""
        estatus = Estatus.objects.all()
        serializer = self.serializer_class(estatus, many = True)
        message = "Lista de Estatus"
        return Response({"message": message, "data": serializer.data}, status=status.HTTP_200_OK)

    
    def create(self, request):
        """Crear un nuevo estatus"""
        serializer = self.serializer_class(data=request.data)  
        if serializer.is_valid():
            message = "Estatus creado con éxito"
            serializer.save(updatedBy=request.user)
            return Response({"message": message, "data": serializer.data}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, pk=None):
        """Obtener un estatus específico"""
        queryset = Estatus.objects.select_related('guide', 'updatedBy').all()
        estatus = get_object_or_404(queryset, pk=pk)
        serializer = self.serializer_class(estatus)  
        message = "Estatus obtenido con éxito"
        return Response({"message": message, "data": serializer.data}, status=status.HTTP_200_OK)
    
    def update(self, request, pk=None):
        """Actualizar completamente un estatus"""
        queryset = Estatus.objects.select_related('guide', 'updatedBy').all()
        estatus = get_object_or_404(queryset, pk=pk)
        
        serializer = self.serializer_class(estatus, data=request.data, partial=False)  
        
        if serializer.is_valid():
            serializer.save(updatedBy=request.user)
            message = f"Estatus con id {pk} actualizado con éxito"
            return Response({"message": message, "data": serializer.data}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
   # Dado que solo manejamos un campo en realidad, no tiene sentido usar partial_update
    
    def destroy(self, request, pk=None):
        """Eliminar un estatus"""
        queryset = Estatus.objects.all()
        estatus = get_object_or_404(queryset, pk=pk)
        
        estatus.delete()
        
        return Response(
            {'message': f'Estatus con id {pk} eliminado correctamente'},
            status=status.HTTP_204_NO_CONTENT
        )
    # Una url especial para hacer retrive por el trackingNumber
    @action(detail=False, methods=['get'], url_path='by-tracking/(?P<tracking>[^/.]+)')
    def by_tracking(self, request, tracking=None):
        """Endpoint dedicado para buscar por tracking"""
        queryset = Estatus.objects.select_related('guide', 'updatedBy').filter(
            guide__trackingNumber__iexact=tracking
        ).order_by('-timestamp')
        
        if not queryset.exists():
            return Response(
                {'error': f'No se encontraron estatus para el tracking: {tracking}'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.serializer_class(queryset, many=True)  
        
        return Response({
            'tracking': tracking,
            'count': queryset.count(),
            'results': serializer.data
        })