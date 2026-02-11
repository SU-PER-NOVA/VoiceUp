from rest_framework import viewsets, status, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from .permissions import IsAdminUser
from rest_framework.views import APIView
from django.db.models import Q, Count, F, ExpressionWrapper, FloatField, DurationField
from django.db.models.functions import Extract, Now, Cast
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    UserProfile, State, District, City, Category, Tag, Issue,
    Media, Comment, Vote, IssueView, IssueAdminNote
)
from .serializers import (
    UserSerializer, UserProfileSerializer, RegisterSerializer,
    StateSerializer, DistrictSerializer, CitySerializer,
    CategorySerializer, TagSerializer,
    IssueListSerializer, IssueDetailSerializer, IssueCreateSerializer,
    MediaSerializer, CommentSerializer, VoteSerializer,
    IssueAdminNoteSerializer, AdminIssueDetailSerializer
)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom serializer to support login with username OR email"""
    
    def validate(self, attrs):
        # Check if username is actually an email
        username_or_email = attrs.get('username', '')
        password = attrs.get('password', '')
        
        # Try to find user by email if '@' is present
        if '@' in username_or_email:
            try:
                user = User.objects.get(email=username_or_email)
                attrs['username'] = user.username  # Replace email with username for JWT validation
            except User.DoesNotExist:
                pass  # Let the default validation handle the error
        
        return super().validate(attrs)
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        return token


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            # Ensure we're working with the right data format
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
            
            # Log incoming data for debugging (without sensitive info)
            logger.info(f"Registration attempt - fields: {list(data.keys())}")
            
            serializer = RegisterSerializer(data=data)
            if serializer.is_valid():
                try:
                    user = serializer.save()
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        'user': UserSerializer(user).data,
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }, status=status.HTTP_201_CREATED)
                except Exception as e:
                    logger.error(f"Error creating user: {e}", exc_info=True)
                    return Response({
                        'error': 'Failed to create user account',
                        'detail': str(e)
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Format errors for better frontend handling
            logger.warning(f"Validation failed: {serializer.errors}")
            errors = {}
            for field, field_errors in serializer.errors.items():
                if isinstance(field_errors, list):
                    errors[field] = field_errors[0] if field_errors else 'Invalid value'
                elif isinstance(field_errors, dict):
                    # Handle nested errors
                    errors[field] = str(field_errors)
                else:
                    errors[field] = str(field_errors)
            
            return Response({
                'error': 'Validation failed',
                'errors': errors,
                'detail': 'Please check the form fields and try again'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error in registration: {e}", exc_info=True)
            return Response({
                'error': 'An unexpected error occurred',
                'detail': str(e)
            },             status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CurrentUserView(APIView):
    """Current authenticated user - includes is_staff for admin UI"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        user = self.get_object()
        profile, created = UserProfile.objects.get_or_create(user=user)
        serializer = UserProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)


class StateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = State.objects.all()
    serializer_class = StateSerializer
    permission_classes = [AllowAny]


class DistrictViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    permission_classes = [AllowAny]
    filterset_fields = ['state']

    def get_queryset(self):
        queryset = super().get_queryset()
        state_id = self.request.query_params.get('state', None)
        if state_id:
            queryset = queryset.filter(state_id=state_id)
        return queryset


class CityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = [AllowAny]
    filterset_fields = ['district']

    def get_queryset(self):
        queryset = super().get_queryset()
        district_id = self.request.query_params.get('district', None)
        if district_id:
            queryset = queryset.filter(district_id=district_id)
        return queryset


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]
    search_fields = ['name']
    ordering_fields = ['usage_count', 'name']
    ordering = ['-usage_count']


class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ['title', 'description', 'tags__name']
    ordering_fields = ['created_at', 'upvotes_count', 'comments_count', 'trending_score']
    ordering = ['-created_at']
    filterset_fields = ['category', 'state', 'district', 'city', 'scope', 'status']

    def get_serializer_class(self):
        if self.action == 'list':
            return IssueListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return IssueCreateSerializer
        elif self.action == 'retrieve':
            return IssueDetailSerializer
        return IssueDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by location
        state_id = self.request.query_params.get('state', None)
        district_id = self.request.query_params.get('district', None)
        city_id = self.request.query_params.get('city', None)
        scope = self.request.query_params.get('scope', None)
        
        if state_id:
            queryset = queryset.filter(state_id=state_id)
        if district_id:
            queryset = queryset.filter(district_id=district_id)
        if city_id:
            queryset = queryset.filter(city_id=city_id)
        if scope:
            queryset = queryset.filter(scope=scope)
        
        # Filter by category
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Sort options
        sort_by = self.request.query_params.get('sort_by', None)
        if sort_by == 'trending':
            # Use SQLite's julianday function to calculate hours since creation
            # This works for SQLite (development) and can be adapted for PostgreSQL in production
            queryset = queryset.extra(
                select={
                    'trending_score_calc': """
                        CAST((upvotes_count - downvotes_count + comments_count * 2) AS REAL) / 
                        POWER(1.0 + CAST((julianday('now') - julianday(created_at)) * 24.0 AS REAL), 0.5)
                    """
                }
            ).order_by('-trending_score_calc', '-created_at')
        elif sort_by == 'votes':
            queryset = queryset.annotate(
                score=F('upvotes_count') - F('downvotes_count')
            ).order_by('-score', '-created_at')
        elif sort_by == 'comments':
            queryset = queryset.order_by('-comments_count', '-created_at')
        elif sort_by == 'recent':
            queryset = queryset.order_by('-created_at')
        
        return queryset.select_related('author', 'category', 'state', 'district', 'city').prefetch_related('tags', 'media_files')

    def perform_create(self, serializer):
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            issue = serializer.save(author=self.request.user)
            logger.info(f"Issue created successfully: {issue.id}")
            
            # Handle media files
            media_files = []
            for key, file in self.request.FILES.items():
                if key.startswith('media_') or key == 'file':
                    try:
                        # Determine media type from file extension
                        file_ext = file.name.split('.')[-1].lower()
                        if file_ext in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                            media_type = 'image'
                        elif file_ext in ['mp4', 'mov', 'avi', 'webm']:
                            media_type = 'video'
                        elif file_ext in ['mp3', 'wav', 'm4a', 'ogg']:
                            media_type = 'audio'
                        else:
                            media_type = 'image'  # Default
                        
                        media = Media.objects.create(
                            issue=issue,
                            file=file,
                            media_type=media_type,
                            order=len(media_files)
                        )
                        media_files.append(media)
                        logger.info(f"Media file added: {file.name}")
                    except Exception as e:
                        # Log error but don't fail the entire request
                        logger.error(f"Error processing media file {file.name}: {e}", exc_info=True)
                        continue
        except Exception as e:
            logger.error(f"Error creating issue: {e}", exc_info=True)
            raise
    
    def create(self, request, *args, **kwargs):
        """Override create to return detailed serializer response"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return the created issue using the detail serializer
        issue = serializer.instance
        detail_serializer = IssueDetailSerializer(issue, context={'request': request})
        headers = self.get_success_headers(detail_serializer.data)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'])
    def vote(self, request, pk=None):
        issue = self.get_object()
        vote_type = request.data.get('vote_type', 'upvote')
        
        if vote_type not in ['upvote', 'downvote']:
            return Response(
                {'error': 'Invalid vote type. Must be "upvote" or "downvote".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already voted
        existing_vote = Vote.objects.filter(user=request.user, issue=issue).first()
        
        if existing_vote:
            if existing_vote.vote_type == vote_type:
                # Remove vote if clicking same button
                if vote_type == 'upvote':
                    issue.upvotes_count = max(0, issue.upvotes_count - 1)
                else:
                    issue.downvotes_count = max(0, issue.downvotes_count - 1)
                existing_vote.delete()
                issue.save()
                return Response({'message': 'Vote removed', 'vote_type': None})
            else:
                # Change vote type
                if existing_vote.vote_type == 'upvote':
                    issue.upvotes_count = max(0, issue.upvotes_count - 1)
                    issue.downvotes_count += 1
                else:
                    issue.downvotes_count = max(0, issue.downvotes_count - 1)
                    issue.upvotes_count += 1
                existing_vote.vote_type = vote_type
                existing_vote.save()
                issue.save()
                return Response({'message': 'Vote updated', 'vote_type': vote_type})
        else:
            # Create new vote
            Vote.objects.create(user=request.user, issue=issue, vote_type=vote_type)
            if vote_type == 'upvote':
                issue.upvotes_count += 1
            else:
                issue.downvotes_count += 1
            issue.save()
            return Response({'message': 'Vote added', 'vote_type': vote_type})

    @action(detail=True, methods=['post'])
    def view(self, request, pk=None):
        issue = self.get_object()
        ip_address = self.get_client_ip(request)
        
        # Track view
        IssueView.objects.get_or_create(
            issue=issue,
            user=request.user if request.user.is_authenticated else None,
            ip_address=ip_address if not request.user.is_authenticated else None,
            defaults={'viewed_at': timezone.now()}
        )
        
        # Update view count
        issue.views_count = IssueView.objects.filter(issue=issue).count()
        issue.save()
        
        return Response({'views_count': issue.views_count})

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        try:
            issue = self.get_object()
            comments = issue.comments.filter(parent=None, is_deleted=False).order_by('-created_at')
            serializer = CommentSerializer(comments, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error loading comments: {e}")
            return Response(
                {'error': 'Failed to load comments', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MediaViewSet(viewsets.ModelViewSet):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        issue_id = self.request.data.get('issue')
        issue = Issue.objects.get(id=issue_id)
        serializer.save(issue=issue)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.filter(is_deleted=False)
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering_fields = ['created_at', 'upvotes_count']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        issue_id = self.request.query_params.get('issue', None)
        if issue_id:
            queryset = queryset.filter(issue_id=issue_id)
        return queryset.select_related('author', 'issue', 'parent')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def vote(self, request, pk=None):
        comment = self.get_object()
        vote_type = request.data.get('vote_type', 'upvote')
        
        if vote_type not in ['upvote', 'downvote']:
            return Response(
                {'error': 'Invalid vote type. Must be "upvote" or "downvote".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already voted
        existing_vote = Vote.objects.filter(user=request.user, comment=comment).first()
        
        if existing_vote:
            if existing_vote.vote_type == vote_type:
                # Remove vote
                if vote_type == 'upvote':
                    comment.upvotes_count = max(0, comment.upvotes_count - 1)
                else:
                    comment.downvotes_count = max(0, comment.downvotes_count - 1)
                existing_vote.delete()
                comment.save()
                return Response({'message': 'Vote removed', 'vote_type': None})
            else:
                # Change vote type
                if existing_vote.vote_type == 'upvote':
                    comment.upvotes_count = max(0, comment.upvotes_count - 1)
                    comment.downvotes_count += 1
                else:
                    comment.downvotes_count = max(0, comment.downvotes_count - 1)
                    comment.upvotes_count += 1
                existing_vote.vote_type = vote_type
                existing_vote.save()
                comment.save()
                return Response({'message': 'Vote updated', 'vote_type': vote_type})
        else:
            # Create new vote
            Vote.objects.create(user=request.user, comment=comment, vote_type=vote_type)
            if vote_type == 'upvote':
                comment.upvotes_count += 1
            else:
                comment.downvotes_count += 1
            comment.save()
            return Response({'message': 'Vote added', 'vote_type': vote_type})


class SearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({'results': []})
        
        # Search issues
        issues = Issue.objects.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(tags__name__icontains=query)
        ).distinct()[:20]
        
        issue_serializer = IssueListSerializer(issues, many=True, context={'request': request})
        
        # Search tags
        tags = Tag.objects.filter(name__icontains=query)[:10]
        tag_serializer = TagSerializer(tags, many=True)
        
        return Response({
            'issues': issue_serializer.data,
            'tags': tag_serializer.data,
        })


# ---------- Admin views (staff only) ----------

class AdminDashboardStatsView(APIView):
    """Dashboard stats for admin"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        from django.db.models import Count
        total = Issue.objects.count()
        by_status = dict(
            Issue.objects.values('status').annotate(count=Count('id')).values_list('status', 'count')
        )
        # Ensure all statuses present
        for s in ['pending', 'under_review', 'in_progress', 'resolved', 'rejected']:
            by_status.setdefault(s, 0)
        recent_7d = Issue.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=7)
        ).count()
        pending_count = Issue.objects.filter(status='pending').count()
        return Response({
            'total_issues': total,
            'by_status': by_status,
            'recent_7_days': recent_7d,
            'pending_count': pending_count,
        })


class AdminGrievanceUpdateSerializer(serializers.ModelSerializer):
    """Only status, is_featured, is_verified for admin update"""
    class Meta:
        model = Issue
        fields = ['status', 'is_featured', 'is_verified']


class AdminGrievanceViewSet(viewsets.ModelViewSet):
    """Admin: list, retrieve, and update grievances (issues)"""
    queryset = Issue.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    filterset_fields = ['status', 'category', 'state', 'district', 'city']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'upvotes_count', 'comments_count']
    ordering = ['-created_at']
    http_method_names = ['get', 'head', 'patch', 'options']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AdminIssueDetailSerializer
        if self.action in ('partial_update', 'update'):
            return AdminGrievanceUpdateSerializer
        return IssueListSerializer

    def get_queryset(self):
        return super().get_queryset().select_related(
            'author', 'category', 'state', 'district', 'city'
        ).prefetch_related('tags', 'media_files', 'admin_notes')

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        if 'status' in data:
            instance.status = data['status']
        if 'is_featured' in data:
            instance.is_featured = bool(data['is_featured'])
        if 'is_verified' in data:
            instance.is_verified = bool(data['is_verified'])
        if instance.status == 'resolved' and not instance.resolved_at:
            instance.resolved_at = timezone.now()
        if instance.status != 'resolved':
            instance.resolved_at = None
        instance.save()
        serializer = AdminIssueDetailSerializer(instance, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'])
    def notes(self, request, pk=None):
        """List or create admin notes for this grievance"""
        issue = self.get_object()
        if request.method == 'GET':
            notes = issue.admin_notes.all().select_related('author').order_by('-created_at')
            return Response(IssueAdminNoteSerializer(notes, many=True).data)
        # POST
        serializer = IssueAdminNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(issue=issue, author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
