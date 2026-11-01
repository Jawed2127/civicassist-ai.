"""
Seed script to populate initial departments, realistic grievances, timelines, and AI analyses.
Run with: python manage.py shell < seed_data.py
Or: python seed_data.py
"""

import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'civicassist.settings')
django.setup()

from grievances.models import Department, Grievance, GrievanceTimeline, AIAnalysis

def seed():
    print("Seeding CivicAssist AI Database...")

    # 1. Departments
    departments_data = [
        {
            'name': 'Roads & Highway Infrastructure',
            'code': 'ROADS',
            'description': 'Maintenance of city roads, potholes, pedestrian walkways, and flyovers.',
            'contact_email': 'roads.support@civicassist.gov',
            'sla_hours': 36
        },
        {
            'name': 'Solid Waste & Sanitation',
            'code': 'SANITATION',
            'description': 'Garbage collection, litter management, community bin clearance, and recycling.',
            'contact_email': 'sanitation@civicassist.gov',
            'sla_hours': 24
        },
        {
            'name': 'Water Supply & Sewerage Board',
            'code': 'WATER',
            'description': 'Municipal potable water lines, burst pipes, water quality, and sewerage.',
            'contact_email': 'waterboard@civicassist.gov',
            'sla_hours': 24
        },
        {
            'name': 'Drainage & Stormwater Network',
            'code': 'DRAINAGE',
            'description': 'Monsoon stormwater drains, manhole covers, flood prevention.',
            'contact_email': 'drainage.ops@civicassist.gov',
            'sla_hours': 48
        },
        {
            'name': 'Electrical & Public Lighting',
            'code': 'LIGHTING',
            'description': 'Street lights, electrical poles, loose high-voltage cables, and transformers.',
            'contact_email': 'lighting.power@civicassist.gov',
            'sla_hours': 18
        },
        {
            'name': 'Public Health & Animal Welfare',
            'code': 'HEALTH',
            'description': 'Mosquito fogging, stray animal vaccination, public hygiene inspections.',
            'contact_email': 'health.civic@civicassist.gov',
            'sla_hours': 72
        },
    ]

    dept_objs = {}
    for d in departments_data:
        obj, created = Department.objects.get_or_create(code=d['code'], defaults=d)
        dept_objs[d['code']] = obj
        print(f" - Department: {obj.name} ({'Created' if created else 'Exists'})")

    # 2. Sample Grievances with rich real-world context
    sample_grievances = [
        {
            'title': 'Dangerous sparking live wire hanging near school crossing',
            'description': 'A high tension cable broke after yesterday storm and is hanging 5 feet above the ground near St. Mary school entrance. Sparking observed during light rain. Extreme hazard for children.',
            'category': 'LIGHTING',
            'department': dept_objs['LIGHTING'],
            'urgency': 'CRITICAL',
            'urgency_score': 0.96,
            'urgency_reason': 'High-risk civic safety hazard: live wire sparking near children school zone.',
            'status': 'IN_PROGRESS',
            'citizen_name': 'Anita Deshmukh',
            'citizen_phone': '+91 98201 54321',
            'citizen_email': 'anita.d@example.com',
            'latitude': 19.0760,
            'longitude': 72.8777,
            'address': 'Opposite St. Mary School, 5th Avenue, Bandra West',
            'ward': 'Ward 7 - West Coast',
            'assigned_officer': 'Er. Rajesh Kulkarni (Line Specialist)',
            'sla_hours': 6,
            'hazard_tags': ['CRITICAL: Live Wire', 'CRITICAL: School Zone', 'CRITICAL: Sparking'],
            'timeline': [
                ('SUBMITTED', 'Grievance Registered', 'Report submitted by citizen via mobile portal with photo.', 'Citizen Portal', -4),
                ('TRIAGED', 'AI Triage Completed', 'Urgency escalated to CRITICAL (96%). Routed directly to Emergency Electrical Unit.', 'CivicAssist AI', -3.8),
                ('ASSIGNED', 'Assigned to Quick Response Team', 'Dispatched to Line Specialist Er. Rajesh Kulkarni.', 'Control Room Admin', -3.5),
                ('IN_PROGRESS', 'Power Isolated & Crew Onsite', 'Upstream transformer isolated. Field crew replacing faulty insulator.', 'Er. Rajesh Kulkarni', -1.2),
            ]
        },
        {
            'title': 'Deep pothole causing accidents on arterial road',
            'description': 'A massive crater approximately 1.5 feet deep has opened up near the metro pillar 42. Multiple two-wheelers have skidded and fallen during the evening rush hour.',
            'category': 'ROADS',
            'department': dept_objs['ROADS'],
            'urgency': 'HIGH',
            'urgency_score': 0.78,
            'urgency_reason': 'Public road hazard on arterial corridor causing two-wheeler accidents.',
            'status': 'ASSIGNED',
            'citizen_name': 'Vikram Rathore',
            'citizen_phone': '+91 98450 11223',
            'citizen_email': 'vikram.rathore@example.com',
            'latitude': 19.0825,
            'longitude': 72.8845,
            'address': 'Near Metro Pillar 42, Link Road, Andheri East',
            'ward': 'Ward 12 - Metro North',
            'assigned_officer': 'Supervisor D. Patil',
            'sla_hours': 24,
            'hazard_tags': ['HIGH: Deep Pothole', 'HIGH: Heavy Traffic', 'Two-Wheeler Risk'],
            'timeline': [
                ('SUBMITTED', 'Grievance Registered', 'Reported with GPS location and photo.', 'Citizen Portal', -8),
                ('TRIAGED', 'AI Triage Completed', 'Categorized as Roads & Infrastructure. Priority: HIGH (78%).', 'CivicAssist AI', -7.9),
                ('ASSIGNED', 'Work Order Created', 'Assigned to Road Maintenance Contractor Team 4.', 'Roads Dept Dispatcher', -5.0),
            ]
        },
        {
            'title': 'Overflowing municipal garbage dumpster causing severe stench',
            'description': 'The community garbage vat has not been cleared for the past 4 days. Waste is spilling across the road, blocking pedestrian walkway, and dogs are tearing bags open.',
            'category': 'SANITATION',
            'department': dept_objs['SANITATION'],
            'urgency': 'MEDIUM',
            'urgency_score': 0.62,
            'urgency_reason': 'Uncollected solid waste obstruction and public hygiene concern.',
            'status': 'RESOLVED',
            'citizen_name': 'Meera Sundaram',
            'citizen_phone': '+91 97110 99887',
            'citizen_email': 'meera.s@example.com',
            'latitude': 19.0650,
            'longitude': 72.8620,
            'address': 'Corner of 14th Cross & Market Street, Dadar',
            'ward': 'Ward 4 - Metro South',
            'assigned_officer': 'Sanitary Inspector V. Rao',
            'sla_hours': 24,
            'hazard_tags': ['Hygiene Risk', 'Pedestrian Obstruction'],
            'resolution_notes': 'Dumpster thoroughly emptied using compactor truck. Surrounding area sanitized and lime powder sprayed.',
            'timeline': [
                ('SUBMITTED', 'Grievance Registered', 'Complaint submitted with photo of overflowing dumpster.', 'Citizen Portal', -26),
                ('TRIAGED', 'AI Triage Completed', 'Classified as Solid Waste & Sanitation. Target SLA: 24 hrs.', 'CivicAssist AI', -25.8),
                ('ASSIGNED', 'Assigned to Ward Compactor Team', 'Route 14 compactor vehicle assigned.', 'Sanitation Officer', -20),
                ('IN_PROGRESS', 'Compactor Vehicle Onsite', 'Clearance in progress.', 'Inspector V. Rao', -6),
                ('RESOLVED', 'Garbage Cleared & Sanitized', 'Dumpster cleared and verified with after-photo.', 'Inspector V. Rao', -1.5),
            ]
        },
        {
            'title': 'Drinking water pipeline ruptured, flooding market basement',
            'description': 'Main municipal supply pipe burst under high pressure. Clean drinking water is gushing onto the road and flooding basements of commercial shops.',
            'category': 'WATER',
            'department': dept_objs['WATER'],
            'urgency': 'HIGH',
            'urgency_score': 0.82,
            'urgency_reason': 'Major potable water wastage and commercial property flooding.',
            'status': 'IN_PROGRESS',
            'citizen_name': 'Karan Johar Merchant',
            'citizen_phone': '+91 99300 44556',
            'citizen_email': 'karan.m@example.com',
            'latitude': 19.0910,
            'longitude': 72.8550,
            'address': 'Main Market Plaza, SV Road, Santacruz',
            'ward': 'Ward 8 - Central Commercial',
            'assigned_officer': 'Er. S. Nair (Hydraulic Dept)',
            'sla_hours': 18,
            'hazard_tags': ['HIGH: Major Water Leak', 'Property Flooding'],
            'timeline': [
                ('SUBMITTED', 'Grievance Registered', 'Citizen reported flooding from main water line.', 'Citizen Portal', -5),
                ('TRIAGED', 'AI Triage Completed', 'Classified as Water Supply Pipeline. Urgency: HIGH (82%).', 'CivicAssist AI', -4.9),
                ('ASSIGNED', 'Dispatched to Hydraulic Wing', 'Valve control unit dispatched.', 'Water Dept Admin', -4.0),
                ('IN_PROGRESS', 'Main Valve Throttled & Excavation Underway', 'Water shut off to sector; excavation team repairing ruptured flange.', 'Er. S. Nair', -2.0),
            ]
        },
        {
            'title': 'Broken street light creating pitch dark alley behind residential society',
            'description': 'Three consecutive street lights have been dead for a week. The entire stretch of 200m is pitch dark at night, making it unsafe for women returning from work.',
            'category': 'LIGHTING',
            'department': dept_objs['LIGHTING'],
            'urgency': 'MEDIUM',
            'urgency_score': 0.58,
            'urgency_reason': 'Dark corridor safety concern for pedestrians and commuters.',
            'status': 'TRIAGED',
            'citizen_name': 'Pooja Iyer',
            'citizen_phone': '+91 98210 33445',
            'citizen_email': 'pooja.iyer@example.com',
            'latitude': 19.0430,
            'longitude': 72.8900,
            'address': 'Lane 3, Behind Green Meadows Society, Chembur',
            'ward': 'Ward 5 - East Suburb',
            'sla_hours': 36,
            'hazard_tags': ['Dark Corridor', 'Public Safety'],
            'timeline': [
                ('SUBMITTED', 'Grievance Registered', 'Report submitted by resident.', 'Citizen Portal', -10),
                ('TRIAGED', 'AI Triage Completed', 'Classified as Street Lighting. SLA target: 36 hrs.', 'CivicAssist AI', -9.9),
            ]
        },
        {
            'title': 'Choked stormwater drain overflowing with black sewage',
            'description': 'Plastic bottles and silt have completely blocked the open drain. Black foul-smelling sewage is backing up onto the footpath.',
            'category': 'DRAINAGE',
            'department': dept_objs['DRAINAGE'],
            'urgency': 'MEDIUM',
            'urgency_score': 0.64,
            'urgency_reason': 'Drain blockage causing sewage overflow and contamination.',
            'status': 'SUBMITTED',
            'citizen_name': 'Ramesh Pandey',
            'citizen_phone': '+91 98670 77889',
            'citizen_email': 'ramesh.p@example.com',
            'latitude': 19.0550,
            'longitude': 72.8400,
            'address': 'Near City Park Gate 2, Mahim West',
            'ward': 'Ward 3 - South Central',
            'sla_hours': 48,
            'hazard_tags': ['Sewage Overflow', 'Footpath Blocked'],
            'timeline': [
                ('SUBMITTED', 'Grievance Registered', 'Report received with photo evidence.', 'Citizen Portal', -1),
            ]
        }
    ]

    for item in sample_grievances:
        timeline_events = item.pop('timeline', [])
        hazard_tags = item.pop('hazard_tags', [])
        
        grievance = Grievance.objects.create(**item)
        print(f" + Created Grievance [{grievance.ticket_number}] - {grievance.title[:45]}...")

        # Create AI Analysis record
        AIAnalysis.objects.create(
            grievance=grievance,
            detected_category=grievance.category,
            detected_urgency=grievance.urgency,
            confidence_score=0.94 if grievance.urgency in ('CRITICAL', 'HIGH') else 0.88,
            summary=f"Automated AI triage for {grievance.title}. Detected priority {grievance.urgency}.",
            recommended_action=f"Assign to {grievance.department.name} with target resolution time {grievance.sla_hours} hours.",
            sentiment='Urgent' if grievance.urgency in ('CRITICAL', 'HIGH') else 'Concerned',
            hazard_tags=hazard_tags,
            duplicate_candidates=[],
            estimated_sla_hours=grievance.sla_hours
        )

        # Timeline
        now = timezone.now()
        for ev in timeline_events:
            status_code, ev_title, ev_note, author, hours_offset = ev
            event_time = now + timedelta(hours=hours_offset)
            t_obj = GrievanceTimeline.objects.create(
                grievance=grievance,
                status=status_code,
                title=ev_title,
                note=ev_note,
                author=author
            )
            # update timestamp
            GrievanceTimeline.objects.filter(id=t_obj.id).update(created_at=event_time)

    print(f"\nDone! Successfully seeded {Department.objects.count()} departments and {Grievance.objects.count()} grievances.")

if __name__ == '__main__':
    seed()
