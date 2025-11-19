from django.core.management.base import BaseCommand
from core.models import State, District, City, Category

# Indian States and major cities data
INDIAN_STATES = {
    'Maharashtra': {
        'code': 'MH',
        'districts': {
            'Mumbai City': {
                'cities': ['Mumbai', 'Navi Mumbai']
            },
            'Pune': {
                'cities': ['Pune', 'Pimpri-Chinchwad']
            },
            'Thane': {
                'cities': ['Thane', 'Kalyan', 'Dombivli']
            },
            'Nagpur': {
                'cities': ['Nagpur']
            },
        }
    },
    'Karnataka': {
        'code': 'KA',
        'districts': {
            'Bangalore Urban': {
                'cities': ['Bangalore', 'Whitefield']
            },
            'Mysore': {
                'cities': ['Mysore']
            },
        }
    },
    'Delhi': {
        'code': 'DL',
        'districts': {
            'New Delhi': {
                'cities': ['New Delhi', 'Delhi']
            },
            'Central Delhi': {
                'cities': ['Delhi']
            },
        }
    },
    'Gujarat': {
        'code': 'GJ',
        'districts': {
            'Ahmedabad': {
                'cities': ['Ahmedabad', 'Gandhinagar']
            },
            'Surat': {
                'cities': ['Surat']
            },
        }
    },
    'Rajasthan': {
        'code': 'RJ',
        'districts': {
            'Jaipur': {
                'cities': ['Jaipur']
            },
            'Udaipur': {
                'cities': ['Udaipur']
            },
        }
    },
    'Tamil Nadu': {
        'code': 'TN',
        'districts': {
            'Chennai': {
                'cities': ['Chennai']
            },
            'Coimbatore': {
                'cities': ['Coimbatore']
            },
        }
    },
    'West Bengal': {
        'code': 'WB',
        'districts': {
            'Kolkata': {
                'cities': ['Kolkata', 'Howrah']
            },
        }
    },
    'Telangana': {
        'code': 'TG',
        'districts': {
            'Hyderabad': {
                'cities': ['Hyderabad', 'Secunderabad']
            },
        }
    },
}

CATEGORIES = [
    {'name': 'Infrastructure', 'slug': 'infrastructure', 'description': 'Roads, bridges, buildings, and public infrastructure', 'icon': 'road', 'color': '#3B82F6'},
    {'name': 'Public Services', 'slug': 'public-services', 'description': 'Water, electricity, sanitation, and other public services', 'icon': 'droplet', 'color': '#10B981'},
    {'name': 'Corruption', 'slug': 'corruption', 'description': 'Corruption, bribery, and misuse of public funds', 'icon': 'alert-triangle', 'color': '#EF4444'},
    {'name': 'Land & Property', 'slug': 'land-property', 'description': 'Land disputes, illegal construction, property issues', 'icon': 'home', 'color': '#F59E0B'},
    {'name': 'Environment', 'slug': 'environment', 'description': 'Pollution, waste management, and environmental concerns', 'icon': 'leaf', 'color': '#22C55E'},
    {'name': 'Education', 'slug': 'education', 'description': 'Schools, colleges, and educational infrastructure', 'icon': 'book', 'color': '#8B5CF6'},
    {'name': 'Healthcare', 'slug': 'healthcare', 'description': 'Hospitals, clinics, and healthcare services', 'icon': 'heart', 'color': '#EC4899'},
    {'name': 'Transport', 'slug': 'transport', 'description': 'Public transport, traffic, and transportation issues', 'icon': 'bus', 'color': '#06B6D4'},
    {'name': 'Safety & Security', 'slug': 'safety-security', 'description': 'Crime, safety concerns, and security issues', 'icon': 'shield', 'color': '#6366F1'},
    {'name': 'Other', 'slug': 'other', 'description': 'Other governance and public concerns', 'icon': 'more-horizontal', 'color': '#6B7280'},
]


class Command(BaseCommand):
    help = 'Populate initial data for States, Districts, Cities, and Categories'

    def handle(self, *args, **options):
        self.stdout.write('Starting to populate initial data...')
        
        # Create Categories
        self.stdout.write('Creating categories...')
        for cat_data in CATEGORIES:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category: {category.name}'))
            else:
                self.stdout.write(f'Category already exists: {category.name}')
        
        # Create States, Districts, and Cities
        self.stdout.write('Creating states, districts, and cities...')
        for state_name, state_data in INDIAN_STATES.items():
            state, created = State.objects.get_or_create(
                name=state_name,
                defaults={'code': state_data['code']}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created state: {state.name}'))
            
            for district_name, district_data in state_data['districts'].items():
                district, created = District.objects.get_or_create(
                    name=district_name,
                    state=state,
                    defaults={'code': None}
                )
                if created:
                    self.stdout.write(f'  Created district: {district.name}')
                
                for city_name in district_data['cities']:
                    city, created = City.objects.get_or_create(
                        name=city_name,
                        district=district
                    )
                    if created:
                        self.stdout.write(f'    Created city: {city.name}')
        
        self.stdout.write(self.style.SUCCESS('Successfully populated initial data!'))

