from rest_framework import serializers
from .models import Task, Comment
from users.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'task', 'author', 'author_name', 'text', 'created_at')
        read_only_fields = ('author',)

class TaskSerializer(serializers.ModelSerializer):
    assignee_detail = UserSerializer(source='assignee', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = '__all__'