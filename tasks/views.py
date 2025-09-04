from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.db.models import Q
from django.utils import timezone
from .models import Task, Category
from .serializers import TaskSerializer, UserSerializer, CategorySerializer

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                          context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username
        })

@api_view(['POST'])
@permission_classes([])  # Allow any user to register
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Task.objects.filter(user=self.request.user)
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) |
                Q(category__name__icontains=search)
            )
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        
        # Filter by priority
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by completion status
        completed = self.request.query_params.get('completed', None)
        if completed is not None:
            queryset = queryset.filter(is_completed=completed.lower() == 'true')
        
        # Sorting functionality
        sort_by = self.request.query_params.get('sort_by', None)
        if sort_by == 'due_date':
            queryset = queryset.order_by('due_date')
        elif sort_by == 'priority':
            # Custom ordering for priority: high -> medium -> low
            queryset = queryset.extra(
                select={'priority_order': "CASE WHEN priority='high' THEN 1 WHEN priority='medium' THEN 2 ELSE 3 END"}
            ).order_by('priority_order')
        elif sort_by == 'created_at':
            queryset = queryset.order_by('-created_at')
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toggle_task_completion(request, pk):
    try:
        task = Task.objects.get(pk=pk, user=request.user)
        task.is_completed = not task.is_completed
        
        # Set completion timestamp
        if task.is_completed:
            task.completed_at = timezone.now()
        else:
            task.completed_at = None
            
        task.save()
        serializer = TaskSerializer(task)
        return Response(serializer.data)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)
