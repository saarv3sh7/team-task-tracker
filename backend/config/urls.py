from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from teams.views import TeamViewSet
from tasks.views import TaskViewSet, CommentViewSet
from activities.views import ActivityListView

router = DefaultRouter()
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/', include(router.urls)),
    path('api/activities/', ActivityListView.as_view(), name='activities'),
]