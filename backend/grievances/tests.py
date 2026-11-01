from django.test import TestCase
from rest_framework.test import APIClient
from grievances.models import Department, Grievance, AIAnalysis, GrievanceTimeline


class GrievanceAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.dept = Department.objects.create(
            name='Roads Department',
            code='ROADS',
            sla_hours=48
        )

    def test_create_grievance_with_ai_triage(self):
        payload = {
            'title': 'Huge dangerous pothole near school gate',
            'description': 'A two wheeler crashed into this deep pothole yesterday. Live wire sparking also seen nearby.',
            'category': 'ROADS',
            'citizen_name': 'Aarav Mehta',
            'citizen_phone': '+91 9988776655',
            'address': 'MG Road near St. Anne High School',
            'ward': 'Ward 9 - West'
        }
        res = self.client.post('/api/grievances/', payload, format='json')
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertIn('ticket_number', data)
        self.assertEqual(data['status'], 'TRIAGED')
        self.assertEqual(data['urgency'], 'CRITICAL')  # sparked by 'sparking' & 'school'

        # Check AI analysis created
        g = Grievance.objects.get(id=data['id'])
        self.assertTrue(hasattr(g, 'ai_analysis'))
        self.assertGreater(len(g.timeline.all()), 0)

    def test_analytics_summary(self):
        res = self.client.get('/api/analytics/summary/')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn('total_grievances', data)
        self.assertIn('category_breakdown', data)

    def test_ai_preview_triage(self):
        res = self.client.post('/api/triage/preview/', {
            'title': 'Pipe burst flooding street with drinking water',
            'description': 'Clean water gushing out for 3 hours now.'
        }, format='json')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data['detected_category'], 'WATER')
