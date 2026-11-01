import uuid
from django.db import models
from django.utils import timezone


class Department(models.Model):
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=30, unique=True)
    description = models.TextField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    sla_hours = models.IntegerField(default=48, help_text="Default SLA resolution target in hours")

    def __str__(self):
        return f"{self.name} ({self.code})"


class Grievance(models.Model):
    CATEGORY_CHOICES = [
        ('ROADS', 'Roads & Potholes'),
        ('SANITATION', 'Garbage & Solid Waste'),
        ('WATER', 'Water Supply & Pipelines'),
        ('DRAINAGE', 'Drainage & Sewage Overflow'),
        ('LIGHTING', 'Street Lighting & Electrical'),
        ('HEALTH', 'Public Health & Stray Animals'),
        ('OTHER', 'General Civic Issue'),
    ]

    URGENCY_CHOICES = [
        ('LOW', 'Low Priority'),
        ('MEDIUM', 'Medium Priority'),
        ('HIGH', 'High Priority'),
        ('CRITICAL', 'Critical Emergency'),
    ]

    STATUS_CHOICES = [
        ('SUBMITTED', 'Submitted'),
        ('TRIAGED', 'AI Triaged'),
        ('ASSIGNED', 'Assigned to Field Team'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('VERIFIED', 'Citizen Verified & Closed'),
        ('REOPENED', 'Reopened'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_number = models.CharField(max_length=32, unique=True, db_index=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='OTHER')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='grievances')
    
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='MEDIUM')
    urgency_score = models.FloatField(default=0.5, help_text="AI estimated severity score between 0.0 and 1.0")
    urgency_reason = models.TextField(blank=True, null=True)
    
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='SUBMITTED')
    
    # Citizen details
    citizen_name = models.CharField(max_length=120)
    citizen_phone = models.CharField(max_length=25)
    citizen_email = models.EmailField(blank=True, null=True)
    
    # Geolocation & Ward
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    address = models.CharField(max_length=255, default='Downtown Central')
    ward = models.CharField(max_length=100, default='Ward 4 - Metro Zone')
    
    # Images (stores base64 data URLs or hosted URLs)
    image_url = models.TextField(blank=True, null=True)
    resolution_image_url = models.TextField(blank=True, null=True)
    resolution_notes = models.TextField(blank=True, null=True)
    
    # Assignment & SLA
    assigned_officer = models.CharField(max_length=120, blank=True, null=True)
    sla_hours = models.IntegerField(default=48)
    
    # Duplicate clustering
    is_duplicate = models.BooleanField(default=False)
    duplicate_of = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='duplicates')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.ticket_number}] {self.title} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            short_id = uuid.uuid4().hex[:6].upper()
            self.ticket_number = f"CIVIC-{timezone.now().year}-{short_id}"
        super().save(*args, **kwargs)


class GrievanceTimeline(models.Model):
    grievance = models.ForeignKey(Grievance, on_delete=models.CASCADE, related_name='timeline')
    status = models.CharField(max_length=30)
    title = models.CharField(max_length=150)
    note = models.TextField()
    author = models.CharField(max_length=100, default='System')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.grievance.ticket_number} - {self.title} at {self.created_at}"


class AIAnalysis(models.Model):
    grievance = models.OneToOneField(Grievance, on_delete=models.CASCADE, related_name='ai_analysis')
    detected_category = models.CharField(max_length=50)
    detected_urgency = models.CharField(max_length=20)
    confidence_score = models.FloatField(default=0.92)
    summary = models.TextField()
    recommended_action = models.TextField()
    sentiment = models.CharField(max_length=30, default='Concerned')
    hazard_tags = models.JSONField(default=list)
    duplicate_candidates = models.JSONField(default=list)
    estimated_sla_hours = models.IntegerField(default=48)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AI Analysis for {self.grievance.ticket_number}"
