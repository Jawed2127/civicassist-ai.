from rest_framework import serializers
from .models import Department, Grievance, GrievanceTimeline, AIAnalysis
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class GrievanceTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrievanceTimeline
        fields = ['id', 'status', 'title', 'note', 'author', 'created_at']


class AIAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAnalysis
        fields = [
            'detected_category',
            'detected_urgency',
            'confidence_score',
            'summary',
            'recommended_action',
            'sentiment',
            'hazard_tags',
            'duplicate_candidates',
            'estimated_sla_hours',
            'created_at'
        ]


class GrievanceSerializer(serializers.ModelSerializer):
    department_details = DepartmentSerializer(source='department', read_only=True)
    timeline = GrievanceTimelineSerializer(many=True, read_only=True)
    ai_analysis = AIAnalysisSerializer(read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)

    class Meta:
        model = Grievance
        fields = [
            'id',
            'ticket_number',
            'title',
            'description',
            'category',
            'category_display',
            'department',
            'department_details',
            'urgency',
            'urgency_display',
            'urgency_score',
            'urgency_reason',
            'status',
            'status_display',
            'citizen_name',
            'citizen_phone',
            'citizen_email',
            'latitude',
            'longitude',
            'address',
            'ward',
            'image_url',
            'resolution_image_url',
            'resolution_notes',
            'assigned_officer',
            'sla_hours',
            'is_duplicate',
            'duplicate_of',
            'created_at',
            'updated_at',
            'resolved_at',
            'timeline',
            'ai_analysis'
        ]
        read_only_fields = ['id', 'ticket_number', 'created_at', 'updated_at']


class GrievanceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grievance
        fields = [
            'title',
            'description',
            'category',
            'citizen_name',
            'citizen_phone',
            'citizen_email',
            'latitude',
            'longitude',
            'address',
            'ward',
            'image_url',
        ]


class GrievanceStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Grievance.STATUS_CHOICES)
    note = serializers.CharField(required=False, allow_blank=True, default='')
    assigned_officer = serializers.CharField(required=False, allow_blank=True)
    resolution_notes = serializers.CharField(required=False, allow_blank=True)
    resolution_image_url = serializers.CharField(required=False, allow_blank=True)
    author_name = serializers.CharField(required=False, default='Municipal Admin')

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        role = "ADMIN" if self.user.is_superuser or self.user.is_staff else "CITIZEN"
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': role
        }
        return data 

User = get_user_model()

class CitizenRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            is_staff=False,
            is_superuser=False
        )
        return user