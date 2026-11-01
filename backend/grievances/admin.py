from django.contrib import admin
from .models import Department, Grievance, GrievanceTimeline, AIAnalysis


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'sla_hours', 'contact_email')
    search_fields = ('name', 'code')


class GrievanceTimelineInline(admin.TabularInline):
    model = GrievanceTimeline
    extra = 0
    readonly_fields = ('created_at',)


class AIAnalysisInline(admin.StackedInline):
    model = AIAnalysis
    extra = 0
    can_delete = False


@admin.register(Grievance)
class GrievanceAdmin(admin.ModelAdmin):
    list_display = ('ticket_number', 'title', 'category', 'urgency', 'status', 'ward', 'citizen_name', 'created_at')
    list_filter = ('status', 'urgency', 'category', 'ward')
    search_fields = ('ticket_number', 'title', 'description', 'citizen_name', 'address')
    readonly_fields = ('ticket_number', 'created_at', 'updated_at', 'resolved_at')
    inlines = [AIAnalysisInline, GrievanceTimelineInline]


@admin.register(GrievanceTimeline)
class GrievanceTimelineAdmin(admin.ModelAdmin):
    list_display = ('grievance', 'status', 'title', 'author', 'created_at')
    list_filter = ('status', 'author')


@admin.register(AIAnalysis)
class AIAnalysisAdmin(admin.ModelAdmin):
    list_display = ('grievance', 'detected_category', 'detected_urgency', 'confidence_score', 'sentiment')
