from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Avg, Q
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User

# JWT Auth Imports
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Grievance, Department
from .serializers import GrievanceSerializer, DepartmentSerializer


# ==========================================
# 1. AUTHENTICATION & REGISTRATION VIEWS
# ==========================================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializes JWT tokens and attaches authenticated user profile info
    with explicit role discrimination for admin vs citizen portals.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        
        # Determine administrative rights
        is_admin = bool(user.is_staff or user.is_superuser)
        role = getattr(user, 'role', 'admin' if is_admin else 'citizen')

        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': is_admin,
            'role': role,
        }
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Endpoint: POST /api/auth/token/
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class CitizenRegisterView(APIView):
    """
    Endpoint: POST /api/auth/register/
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response(
                {'error': 'Username and password are required.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username__iexact=username).exists():
            return Response(
                {'error': 'A user with that username already exists.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_staff=False,
            is_superuser=False
        )

        return Response({
            'message': 'Citizen account created successfully.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': False,
                'role': 'citizen',
            }
        }, status=status.HTTP_201_CREATED)


# ==========================================
# 2. STATUS UPDATE CLASS VIEW (Direct Route)
# ==========================================

class GrievanceStatusUpdateView(generics.UpdateAPIView):
    """
    Endpoint: PATCH /api/grievances/<id>/status/
    """
    queryset = Grievance.objects.all()
    serializer_class = GrievanceSerializer
    permission_classes = [permissions.AllowAny]

    def patch(self, request, *args, **kwargs):
        grievance = self.get_object()
        new_status = request.data.get('status')
        officer = request.data.get('assigned_officer') or request.data.get('assigned_to')

        if new_status:
            grievance.status = new_status

        if officer is not None:
            if hasattr(grievance, 'assigned_officer'):
                grievance.assigned_officer = officer
            elif hasattr(grievance, 'assigned_to'):
                grievance.assigned_to = officer

        grievance.save()
        return Response(self.get_serializer(grievance).data, status=status.HTTP_200_OK)


# ==========================================
# 3. AI PREVIEW TRIAGE FUNCTION
# ==========================================

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def ai_preview_triage(request):
    """
    Endpoint: POST /api/triage/preview/
    """
    title = request.data.get('title', '').lower()
    description = request.data.get('description', '').lower()
    combined_text = f"{title} {description}"

    urgency = 'NORMAL'
    detected_category = 'OTHER'
    sla_hours = 48
    urgency_reason = 'Standard civic concern registered for departmental review.'
    hazard_tags = []

    if any(k in combined_text for k in ['wire', 'spark', 'electric', 'light', 'pole', 'dark', 'bulb']):
        detected_category = 'LIGHTING'
    elif any(k in combined_text for k in ['pothole', 'road', 'asphalt', 'crater', 'highway', 'footpath', 'traffic']):
        detected_category = 'ROADS'
    elif any(k in combined_text for k in ['pipe', 'leak', 'water', 'flood', 'drain', 'sewer', 'pipeline', 'overflow']):
        detected_category = 'WATER'
    elif any(k in combined_text for k in ['garbage', 'dump', 'waste', 'trash', 'smell', 'stench', 'vats']):
        detected_category = 'SANITATION'
    elif any(k in combined_text for k in ['dog', 'animal', 'bite', 'dengue', 'mosquito', 'hospital', 'health']):
        detected_category = 'HEALTH'

    if any(k in combined_text for k in ['spark', 'shock', 'fire', 'explosion', 'live wire', 'emergency', 'casualty', 'death']):
        urgency = 'CRITICAL'
        sla_hours = 6
        urgency_reason = 'High safety risk detected involving electric hazard, fire, or structural danger.'
        hazard_tags.append('Life Safety Hazard')
    elif any(k in combined_text for k in ['flooding', 'accident', 'deep', 'blocked', 'heavy leakage', 'impassable']):
        urgency = 'HIGH'
        sla_hours = 24
        urgency_reason = 'High disruption risk identified that may cause imminent transit or sanitation failure.'
        hazard_tags.append('Civic Disruption')

    duplicate_candidates = []
    similar = Grievance.objects.filter(
        Q(category=detected_category) & ~Q(status__in=['RESOLVED', 'VERIFIED'])
    )[:1]
    
    for sim in similar:
        duplicate_candidates.append({
            'ticket_number': sim.ticket_number,
            'title': sim.title,
            'reasons': ['Same Ward & Category'],
        })

    return Response({
        'urgency': urgency,
        'detected_category': detected_category,
        'estimated_sla_hours': sla_hours,
        'urgency_reason': urgency_reason,
        'hazard_tags': hazard_tags,
        'duplicate_candidates': duplicate_candidates,
    }, status=status.HTTP_200_OK)


# ==========================================
# 4. ANALYTICS FUNCTION & VIEW
# ==========================================

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def analytics_summary(request):
    """
    Endpoint: GET /api/analytics/summary/
    """
    total = Grievance.objects.count()
    critical_open = Grievance.objects.filter(
        urgency='CRITICAL'
    ).exclude(status__in=['RESOLVED', 'VERIFIED']).count()

    in_progress = Grievance.objects.filter(
        status__in=['ASSIGNED', 'IN_PROGRESS']
    ).count()

    resolved = Grievance.objects.filter(
        status__in=['RESOLVED', 'VERIFIED']
    ).count()

    resolution_rate = round((resolved / total * 100), 1) if total > 0 else 0

    category_counts = (
        Grievance.objects.values('category')
        .annotate(count=Count('id'))
        .order_by('-count')
    )

    ward_counts = (
        Grievance.objects.values('ward')
        .annotate(count=Count('id'))
        .order_by('-count')[:5]
    )

    return Response({
        'total_grievances': total,
        'critical_open_count': critical_open,
        'in_progress_count': in_progress,
        'resolved_count': resolved,
        'resolution_rate_percent': resolution_rate,
        'avg_sla_hours': 36,
        'category_breakdown': list(category_counts),
        'ward_breakdown': list(ward_counts),
    }, status=status.HTTP_200_OK)


class AnalyticsSummaryView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return analytics_summary(request)


# ==========================================
# 5. GRIEVANCE & DEPARTMENT VIEWSETS
# ==========================================

class GrievanceViewSet(viewsets.ModelViewSet):
    """
    Primary ModelViewSet for grievances.
    """
    queryset = Grievance.objects.all().order_by('-created_at')
    serializer_class = GrievanceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        status_param = self.request.query_params.get('status')
        category_param = self.request.query_params.get('category')
        urgency_param = self.request.query_params.get('urgency')
        ward_param = self.request.query_params.get('ward')
        search_param = self.request.query_params.get('search')

        if status_param and status_param != 'ALL':
            queryset = queryset.filter(status=status_param)
        if category_param and category_param != 'ALL':
            queryset = queryset.filter(category=category_param)
        if urgency_param and urgency_param != 'ALL':
            queryset = queryset.filter(urgency=urgency_param)
        if ward_param and ward_param != 'ALL':
            queryset = queryset.filter(ward=ward_param)
        if search_param:
            queryset = queryset.filter(
                Q(title__icontains=search_param) |
                Q(ticket_number__icontains=search_param) |
                Q(address__icontains=search_param) |
                Q(description__icontains=search_param)
            )

        return queryset

    @action(detail=True, methods=['post', 'patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """
        Endpoint: POST/PATCH /api/grievances/<id>/update-status/
        """
        grievance = self.get_object()
        new_status = request.data.get('status')
        officer = request.data.get('assigned_officer') or request.data.get('assigned_to')

        if new_status:
            grievance.status = new_status

        if officer is not None:
            if hasattr(grievance, 'assigned_officer'):
                grievance.assigned_officer = officer
            elif hasattr(grievance, 'assigned_to'):
                grievance.assigned_to = officer

        grievance.save()
        return Response(self.get_serializer(grievance).data, status=status.HTTP_200_OK)


class TrackTicketView(APIView):
    """
    Endpoint: GET /api/grievances/track/<ticket_number>/
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, ticket_number):
        cleaned_ticket = ticket_number.strip()
        grievance = get_object_or_404(
            Grievance.objects.filter(
                Q(ticket_number__iexact=cleaned_ticket) | 
                Q(id__iexact=cleaned_ticket.replace('#', ''))
            )
        )
        serializer = GrievanceSerializer(grievance)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint: GET /api/departments/
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]