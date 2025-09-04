from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        unique_together = ['name', 'user']
    
    def __str__(self):
        return self.name

class Task(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    DEFAULT_CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Shopping']
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)  # Track completion timestamp
    due_date = models.DateTimeField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
