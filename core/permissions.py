from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """Only allow staff/superuser access."""
    message = "Admin access required."

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff
