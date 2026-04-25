from rest_framework.permissions import BasePermission, SAFE_METHODS




class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        print(
            "DEBUG permission:",
            "method=", request.method,
            "user=", request.user,
            "authenticated=", request.user.is_authenticated,
            "is_staff=", getattr(request.user, "is_staff", None),
        )

        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)