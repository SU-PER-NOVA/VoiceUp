# Generated manually for workflow and assignment

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0002_issueadminnote'),
    ]

    operations = [
        migrations.CreateModel(
            name='AssignmentCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('slug', models.SlugField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True)),
                ('display_order', models.PositiveIntegerField(default=0)),
                ('initiator_admin', models.ForeignKey(blank=True, limit_choices_to={'is_staff': True}, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='initiator_for_assignment_categories', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'Assignment Categories',
                'ordering': ['display_order', 'name'],
            },
        ),
        migrations.AddField(
            model_name='category',
            name='assignment_category',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='issue_categories', to='core.assignmentcategory'),
        ),
        migrations.AddField(
            model_name='issue',
            name='assigned_to',
            field=models.ForeignKey(blank=True, limit_choices_to={'is_staff': True}, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_issues', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='issue',
            name='workflow_stage',
            field=models.CharField(default='pending', max_length=30),
        ),
        migrations.CreateModel(
            name='WorkflowTransition',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('from_stage', models.CharField(blank=True, max_length=30)),
                ('to_stage', models.CharField(max_length=30)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('assigned_to', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='workflow_assignments', to=settings.AUTH_USER_MODEL)),
                ('issue', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workflow_transitions', to='core.issue')),
                ('performed_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workflow_actions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['created_at'],
            },
        ),
    ]
