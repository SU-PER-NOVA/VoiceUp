from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import (
    UserProfile, State, District, City, Category, Tag, Issue,
    Media, Comment, Vote, IssueView
)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone_number', 'is_verified', 'created_at']
    list_filter = ['is_verified', 'created_at']
    search_fields = ['user__username', 'user__email', 'phone_number']


@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ['name', 'code']
    search_fields = ['name', 'code']


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ['name', 'state', 'code']
    list_filter = ['state']
    search_fields = ['name', 'state__name']


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ['name', 'district', 'state_name']
    list_filter = ['district__state']
    search_fields = ['name', 'district__name']
    
    def state_name(self, obj):
        return obj.district.state.name if obj.district else None
    state_name.short_description = 'State'


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'color']
    search_fields = ['name', 'slug']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'usage_count', 'created_at']
    search_fields = ['name', 'slug']
    ordering = ['-usage_count']


class MediaInline(admin.TabularInline):
    model = Media
    extra = 1


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'state', 'status', 'upvotes_count', 'created_at']
    list_filter = ['status', 'category', 'state', 'scope', 'is_featured', 'is_verified', 'created_at']
    search_fields = ['title', 'description', 'author__username']
    readonly_fields = ['upvotes_count', 'downvotes_count', 'comments_count', 'views_count', 'created_at', 'updated_at']
    inlines = [MediaInline]
    filter_horizontal = ['tags']


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ['issue', 'media_type', 'order', 'created_at']
    list_filter = ['media_type', 'created_at']
    search_fields = ['issue__title']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['issue', 'author', 'is_anonymous', 'upvotes_count', 'created_at']
    list_filter = ['is_anonymous', 'is_edited', 'is_deleted', 'created_at']
    search_fields = ['content', 'author__username', 'issue__title']
    readonly_fields = ['upvotes_count', 'downvotes_count', 'created_at', 'updated_at']


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ['user', 'vote_type', 'issue', 'comment', 'created_at']
    list_filter = ['vote_type', 'created_at']
    search_fields = ['user__username', 'issue__title']


@admin.register(IssueView)
class IssueViewAdmin(admin.ModelAdmin):
    list_display = ['issue', 'user', 'ip_address', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['issue__title', 'user__username']
