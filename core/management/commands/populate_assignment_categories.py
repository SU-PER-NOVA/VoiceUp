"""Create 5 AssignmentCategories and link Issue Categories to them."""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import AssignmentCategory, Category

# 5 assignment buckets - map issue categories by slug
ASSIGNMENT_BUCKETS = [
    {'name': 'Infrastructure & Transport', 'slug': 'infrastructure-transport', 'order': 1, 'issue_slugs': ['infrastructure', 'transport']},
    {'name': 'Corruption & Governance', 'slug': 'corruption-governance', 'order': 2, 'issue_slugs': ['corruption', 'land-property']},
    {'name': 'Public Services', 'slug': 'public-services', 'order': 3, 'issue_slugs': ['public-services']},
    {'name': 'Environment & Health', 'slug': 'environment-health', 'order': 4, 'issue_slugs': ['environment', 'healthcare', 'education']},
    {'name': 'Safety & General', 'slug': 'safety-general', 'order': 5, 'issue_slugs': ['safety-security', 'other']},
]


class Command(BaseCommand):
    help = 'Create AssignmentCategories and link Issue Categories'

    def handle(self, *args, **options):
        staff = User.objects.filter(is_staff=True).first()
        for buck in ASSIGNMENT_BUCKETS:
            ac, created = AssignmentCategory.objects.update_or_create(
                slug=buck['slug'],
                defaults={
                    'name': buck['name'],
                    'display_order': buck['order'],
                    'initiator_admin': staff,
                }
            )
            self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Updated'}: {ac.name}"))

            for slug in buck['issue_slugs']:
                try:
                    cat = Category.objects.get(slug=slug)
                    cat.assignment_category = ac
                    cat.save()
                    self.stdout.write(f"  Linked: {cat.name} -> {ac.name}")
                except Category.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"  Category not found: {slug}"))

        self.stdout.write(self.style.SUCCESS("Assignment categories populated."))
