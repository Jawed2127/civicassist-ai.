from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GrievanceViewSet, DepartmentViewSet, ai_preview_triage, analytics_summary

router = DefaultRouter()
router.register(r'grievances', GrievanceViewSet, basename='grievance')
router.register(r'departments', DepartmentViewSet, basename='department')

urlpatterns = [
    path('', include(router.urls)),
    path('triage/preview/', ai_preview_triage, name='ai-preview-triage'),
    path('analytics/summary/', analytics_summary, name='analytics-summary'),
]
