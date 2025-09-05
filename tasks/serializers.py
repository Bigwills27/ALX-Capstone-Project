from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime
from .models import Task, Category

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create default categories for new user
        default_categories = ['Work', 'Personal', 'Health', 'Learning', 'Shopping']
        for category_name in default_categories:
            Category.objects.create(name=category_name, user=user)
        
        return user

class CategorySerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'task_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_task_count(self, obj):
        return obj.tasks.count()

class TaskSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'is_completed', 'priority', 
                 'category', 'category_name', 'created_at', 'updated_at', 
                 'completed_at', 'due_date', 'user']
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_at', 'user']
    
    def validate_due_date(self, value):
        if value and value <= timezone.now():
            raise serializers.ValidationError("Due date must be in the future.")
        return value
    
    def validate(self, data):
        if self.instance and self.instance.is_completed:
            if 'is_completed' not in data or data['is_completed'] == True:
                allowed_fields = {'is_completed'}
                provided_fields = set(data.keys())
                invalid_fields = provided_fields - allowed_fields
                
                if invalid_fields:
                    raise serializers.ValidationError(
                        "Cannot edit completed task. Mark as incomplete first to edit other fields."
                    )
        return data
