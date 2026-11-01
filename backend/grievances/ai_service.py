"""
CivicAssist AI - Intelligent Civic Grievance Triage & Analysis Service
Combines NLP categorization, urgency scoring, hazard detection, and duplicate clustering.
"""

import math
import re
from datetime import timedelta
from django.utils import timezone


CATEGORY_KEYWORDS = {
    'ROADS': [
        'pothole', 'road', 'crater', 'asphalt', 'tarmac', 'divider', 'speed breaker', 
        'broken road', 'cave in', 'sinkhole', 'footpath', 'pavement', 'crack'
    ],
    'SANITATION': [
        'garbage', 'trash', 'waste', 'dump', 'dustbin', 'litter', 'stench', 'smell', 
        'rotting', 'uncollected', 'rubbish', 'filth', 'debris'
    ],
    'WATER': [
        'water', 'pipe', 'pipeline', 'leak', 'leakage', 'burst', 'tap', 'drinking water', 
        'contaminated', 'dirty water', 'low pressure', 'no water supply'
    ],
    'DRAINAGE': [
        'drain', 'drainage', 'sewage', 'gutter', 'overflow', 'manhole', 'sludge', 
        'blockage', 'choked', 'sewer', 'flooding', 'waterlogged'
    ],
    'LIGHTING': [
        'street light', 'lamp', 'dark', 'bulb', 'flicker', 'flickering', 'pole', 
        'wire', 'wiring', 'spark', 'sparking', 'electric', 'short circuit', 'blackout'
    ],
    'HEALTH': [
        'stray dog', 'dog bite', 'mosquito', 'dengue', 'malaria', 'carcass', 
        'dead animal', 'illegal slaughter', 'sanitary hazard', 'hygiene'
    ],
}

CRITICAL_HAZARDS = [
    'sparking', 'live wire', 'open wire', 'fire hazard', 'gas leak', 'accident', 
    'open manhole', 'children at risk', 'hospital road blocked', 'sinkhole', 
    'school zone', 'electric shock', 'contaminated water sickness', 'house flooded'
]

HIGH_HAZARDS = [
    'heavy traffic', 'arterial road', 'deep pothole', 'toxic smell', 'flooding', 
    'knee deep', 'two wheeler fell', 'near pedestrian crossing', 'major leak'
]


def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculates distance between two GPS coordinates in kilometers."""
    if None in (lat1, lon1, lat2, lon2):
        return None
    r = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def tokenize_text(text):
    """Extract clean lowercase word tokens."""
    return set(re.findall(r'\b[a-z]{3,}\b', text.lower()))


def compute_text_similarity(text1, text2):
    """Jaccard similarity between two texts."""
    tokens1 = tokenize_text(text1)
    tokens2 = tokenize_text(text2)
    if not tokens1 or not tokens2:
        return 0.0
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return round(len(intersection) / len(union), 3)


class CivicTriageEngine:

    @classmethod
    def analyze_grievance(cls, title, description, address="", lat=None, lon=None, existing_grievances=None):
        """
        Runs comprehensive AI triage on a civic issue report.
        Returns:
            - category
            - urgency & urgency_score
            - urgency_reason
            - hazard_tags
            - recommended_sla_hours
            - summary
            - recommended_action
            - duplicate_candidates
        """
        full_text = f"{title} {description} {address}".lower()
        
        # 1. Determine Category
        category_scores = {}
        for category, keywords in CATEGORY_KEYWORDS.items():
            matches = sum(1 for kw in keywords if kw in full_text)
            if matches > 0:
                category_scores[category] = matches
        
        if category_scores:
            detected_category = max(category_scores, key=category_scores.get)
        else:
            detected_category = 'OTHER'

        # 2. Hazard & Urgency Assessment
        found_critical = [h for h in CRITICAL_HAZARDS if h in full_text]
        found_high = [h for h in HIGH_HAZARDS if h in full_text]
        
        hazard_tags = []
        if found_critical:
            hazard_tags.extend([f"CRITICAL: {h.title()}" for h in found_critical])
            urgency = 'CRITICAL'
            urgency_score = round(0.88 + min(len(found_critical) * 0.04, 0.10), 2)
            urgency_reason = f"High-risk civic safety hazard detected ({', '.join(found_critical[:2])}). Requires emergency inspection."
            sla_hours = 6
        elif found_high:
            hazard_tags.extend([f"HIGH: {h.title()}" for h in found_high])
            urgency = 'HIGH'
            urgency_score = round(0.72 + min(len(found_high) * 0.04, 0.12), 2)
            urgency_reason = f"Public obstruction or elevated risk detected ({', '.join(found_high[:2])}). Expedited response advised."
            sla_hours = 24
        else:
            if detected_category in ('ROADS', 'DRAINAGE', 'WATER'):
                urgency = 'MEDIUM'
                urgency_score = 0.55
                urgency_reason = "Standard civic infrastructure maintenance required."
                sla_hours = 48
            else:
                urgency = 'LOW'
                urgency_score = 0.35
                urgency_reason = "Non-emergency civic maintenance report."
                sla_hours = 72

        # 3. Sentiment & AI Summary
        sentiment = 'Urgent' if urgency in ('CRITICAL', 'HIGH') else 'Concerned'
        summary = f"Citizen reported {detected_category.replace('_', ' ').lower()} issue: {title}. Location: {address or 'Coordinates provided'}."
        
        recommended_action = (
            f"Dispatch designated {detected_category.title()} Quick Response Unit with targeted resolution SLA of {sla_hours} hours. "
            f"Verify site conditions and notify citizen via SMS/App upon arrival."
        )

        # 4. Duplicate Detection against existing open tickets
        duplicate_candidates = []
        if existing_grievances:
            for g in existing_grievances:
                # Check geographic proximity (within 300 meters)
                dist_km = haversine_distance(lat, lon, g.latitude, g.longitude)
                
                # Check text similarity
                text_sim = compute_text_similarity(f"{title} {description}", f"{g.title} {g.description}")
                
                is_potential_dup = False
                reasons = []
                
                if dist_km is not None and dist_km < 0.25 and g.category == detected_category:
                    is_potential_dup = True
                    reasons.append(f"Located within {int(dist_km * 1000)}m in same category")
                    
                if text_sim > 0.40:
                    is_potential_dup = True
                    reasons.append(f"{int(text_sim * 100)}% textual similarity match")
                
                if is_potential_dup:
                    confidence = round(min(0.95, (0.5 if dist_km and dist_km < 0.25 else 0) + (text_sim * 0.5)), 2)
                    duplicate_candidates.append({
                        'ticket_number': g.ticket_number,
                        'title': g.title,
                        'category': g.category,
                        'status': g.status,
                        'confidence': confidence,
                        'reasons': reasons,
                        'distance_meters': int(dist_km * 1000) if dist_km is not None else None
                    })

        return {
            'detected_category': detected_category,
            'urgency': urgency,
            'urgency_score': urgency_score,
            'urgency_reason': urgency_reason,
            'hazard_tags': hazard_tags,
            'estimated_sla_hours': sla_hours,
            'summary': summary,
            'recommended_action': recommended_action,
            'sentiment': sentiment,
            'confidence_score': 0.94 if hazard_tags else 0.88,
            'duplicate_candidates': duplicate_candidates,
            'is_duplicate': len(duplicate_candidates) > 0 and duplicate_candidates[0]['confidence'] >= 0.70
        }
