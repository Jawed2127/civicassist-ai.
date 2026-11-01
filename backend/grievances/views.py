from django.db.models import Count, Q, Avg
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import Department, Grievance, GrievanceTimeline, AIAnalysis
from .serializers import (
    DepartmentSerializer,
    GrievanceSerializer,
    GrievanceCreateSerializer,
    GrievanceStatusUpdateSerializer,
    GrievanceTimelineSerializer
)
from .ai_service import CivicTriageEngine


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class GrievanceViewSet(viewsets.ModelViewSet):
    queryset = Grievance.objects.all().select_related('department', 'ai_analysis').prefetch_related('timeline')
    serializer_class = GrievanceSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        
        # Filters
        status_param = self.request.query_params.get('status')
        urgency_param = self.request.query_params.get('urgency')
        category_param = self.request.query_params.get('category')
        ward_param = self.request.query_params.get('ward')
        search_param = self.request.query_params.get('search')
        ticket_param = self.request.query_params.get('ticket')

        if status_param and status_param != 'ALL':
            qs = qs.filter(status=status_param)
        if urgency_param and urgency_param != 'ALL':
            qs = qs.filter(urgency=urgency_param)
        if category_param and category_param != 'ALL':
            qs = qs.filter(category=category_param)
        if ward_param and ward_param != 'ALL':
            qs = qs.filter(ward=ward_param)
        if ticket_param:
            qs = qs.filter(ticket_number__iexact=ticket_param)
        if search_param:
            qs = qs.filter(
                Q(title__icontains=search_param) |
                Q(description__icontains=search_param) |
                Q(ticket_number__icontains=search_param) |
                Q(address__icontains=search_param) |
                Q(citizen_name__icontains=search_param)
            )

        return qs

    def create(self, request, *args, **kwargs):
        create_serializer = GrievanceCreateSerializer(data=request.data)
        create_serializer.is_valid(raise_exception=True)
        data = create_serializer.validated_data

        # Run AI Triage Engine
        existing_tickets = Grievance.objects.filter(status__in=['SUBMITTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS'])
        ai_result = CivicTriageEngine.analyze_grievance(
            title=data.get('title', ''),
            description=data.get('description', ''),
            address=data.get('address', ''),
            lat=data.get('latitude'),
            lon=data.get('longitude'),
            existing_grievances=existing_tickets
        )

        category = data.get('category')
        if not category or category == 'OTHER':
            category = ai_result['detected_category']

        # Auto-route to department
        department = Department.objects.filter(code=category).first()
        if not department:
            # fallback mapping
            dept_map = {
                'ROADS': 'ROADS',
                'SANITATION': 'SANITATION',
                'WATER': 'WATER',
                'DRAINAGE': 'WATER',
                'LIGHTING': 'ELECTRIC',
                'HEALTH': 'HEALTH',
            }
            target_code = dept_map.get(category, 'GENERAL')
            department = Department.objects.filter(code=target_code).first()

        # Create Grievance instance
        grievance = Grievance.objects.create(
            title=data.get('title'),
            description=data.get('description'),
            category=category,
            department=department,
            urgency=ai_result['urgency'],
            urgency_score=ai_result['urgency_score'],
            urgency_reason=ai_result['urgency_reason'],
            status='TRIAGED',
            citizen_name=data.get('citizen_name'),
            citizen_phone=data.get('citizen_phone'),
            citizen_email=data.get('citizen_email'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            address=data.get('address', 'Downtown Central'),
            ward=data.get('ward', 'Ward 4 - Metro Zone'),
            image_url=data.get('image_url'),
            sla_hours=ai_result['estimated_sla_hours'],
            is_duplicate=ai_result['is_duplicate']
        )

        # Store AI Analysis Record
        AIAnalysis.objects.create(
            grievance=grievance,
            detected_category=ai_result['detected_category'],
            detected_urgency=ai_result['urgency'],
            confidence_score=ai_result['confidence_score'],
            summary=ai_result['summary'],
            recommended_action=ai_result['recommended_action'],
            sentiment=ai_result['sentiment'],
            hazard_tags=ai_result['hazard_tags'],
            duplicate_candidates=ai_result['duplicate_candidates'],
            estimated_sla_hours=ai_result['estimated_sla_hours']
        )

        # Initial Timeline Entries
        GrievanceTimeline.objects.create(
            grievance=grievance,
            status='SUBMITTED',
            title='Grievance Registered',
            note=f"Issue submitted by citizen {grievance.citizen_name}.",
            author='Citizen Portal'
        )
        GrievanceTimeline.objects.create(
            grievance=grievance,
            status='TRIAGED',
            title='AI Triage Completed',
            note=(
                f"Auto-classified as {category}. Priority set to {ai_result['urgency']} "
                f"(Score: {int(ai_result['urgency_score'] * 100)}%). SLA: {ai_result['estimated_sla_hours']} hrs."
            ),
            author='CivicAssist AI'
        )

        response_serializer = GrievanceSerializer(grievance)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        grievance = self.get_object()
        serializer = GrievanceStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vdata = serializer.validated_data

        new_status = vdata['status']
        note = vdata.get('note', '')
        author = vdata.get('author_name', 'Municipal Admin')
        
        grievance.status = new_status

        if vdata.get('assigned_officer'):
            grievance.assigned_officer = vdata['assigned_officer']
        if vdata.get('resolution_notes'):
            grievance.resolution_notes = vdata['resolution_notes']
        if vdata.get('resolution_image_url'):
            grievance.resolution_image_url = vdata['resolution_image_url']

        if new_status in ('RESOLVED', 'VERIFIED'):
            if not grievance.resolved_at:
                grievance.resolved_at = timezone.now()

        grievance.save()

        # Add to timeline
        title_map = {
            'ASSIGNED': f"Assigned to {grievance.assigned_officer or 'Field Engineer'}",
            'IN_PROGRESS': 'Field Work In Progress',
            'RESOLVED': 'Issue Resolved by Department',
            'VERIFIED': 'Citizen Confirmed & Ticket Closed',
            'REOPENED': 'Ticket Reopened by Citizen',
            'TRIAGED': 'Re-triaged by Dispatcher'
        }

        GrievanceTimeline.objects.create(
            grievance=grievance,
            status=new_status,
            title=title_map.get(new_status, f"Status updated to {new_status}"),
            note=note or f"Grievance marked as {new_status}.",
            author=author
        )

        return Response(GrievanceSerializer(grievance).data)

    @action(detail=False, methods=['get'], url_path='track/(?P<ticket_number>[^/.]+)')
    def track_by_ticket(self, request, ticket_number=None):
        try:
            grievance = Grievance.objects.select_related('department', 'ai_analysis').prefetch_related('timeline').get(ticket_number__iexact=ticket_number)
            return Response(GrievanceSerializer(grievance).data)
        except Grievance.DoesNotExist:
            return Response({'error': f"Ticket '{ticket_number}' not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def ai_preview_triage(request):
    """
    Live AI Triage preview endpoint:
    Analyzes title and description before grievance submission.
    """
    title = request.data.get('title', '')
    description = request.data.get('description', '')
    address = request.data.get('address', '')
    lat = request.data.get('latitude')
    lon = request.data.get('longitude')

    existing_tickets = Grievance.objects.filter(status__in=['SUBMITTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS'])
    result = CivicTriageEngine.analyze_grievance(
        title=title,
        description=description,
        address=address,
        lat=lat,
        lon=lon,
        existing_grievances=existing_tickets
    )
    return Response(result)


@api_view(['GET'])
def analytics_summary(request):
    """
    KPIs and operational metrics for the Municipal Admin Dashboard.
    """
    total = Grievance.objects.count()
    resolved_count = Grievance.objects.filter(status__in=['RESOLVED', 'VERIFIED']).count()
    in_progress = Grievance.objects.filter(status='IN_PROGRESS').count()
    assigned = Grievance.objects.filter(status='ASSIGNED').count()
    triaged = Grievance.objects.filter(status__in=['SUBMITTED', 'TRIAGED']).count()
    critical_count = Grievance.objects.filter(urgency='CRITICAL', status__in=['SUBMITTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS']).count()

    # Category breakdown
    categories = list(Grievance.objects.values('category').annotate(count=Count('id')).order_by('-count'))
    
    # Urgency breakdown
    urgencies = list(Grievance.objects.values('urgency').annotate(count=Count('id')).order_by('-count'))

    # Ward breakdown
    wards = list(Grievance.objects.values('ward').annotate(count=Count('id')).order_by('-count')[:6])

    # Resolution rate
    resolution_rate = round((resolved_count / total * 100), 1) if total > 0 else 0

    return Response({
        'total_grievances': total,
        'resolved_count': resolved_count,
        'in_progress_count': in_progress,
        'assigned_count': assigned,
        'triaged_count': triaged,
        'critical_open_count': critical_count,
        'resolution_rate_percent': resolution_rate,
        'category_breakdown': categories,
        'urgency_breakdown': urgencies,
        'ward_breakdown': wards,
        'avg_sla_hours': 36
    })
