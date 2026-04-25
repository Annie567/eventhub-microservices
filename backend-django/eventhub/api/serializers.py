from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Event, Participant, Registration


class EventSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "location",
            "start_time",
            "end_time",
            "created_at",
            "status",
        ]

    def get_status(self, obj):
        now = timezone.now()
        if now < obj.start_time:
            return "coming"
        elif obj.start_time <= now <= obj.end_time:
            return "ongoing"
        return "finished"

    def validate(self, data):
        start_time = data.get("start_time")
        end_time = data.get("end_time")

        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError(
                {"end_time": "End time must be after start time."}
            )

        return data


class ParticipantSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Participant
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone",
            "role",
        ]


class ParticipantSelfUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
        ]

    def validate_email(self, value):
        participant = self.instance
        if (
            Participant.objects.exclude(id=participant.id)
            .filter(email=value)
            .exists()
        ):
            raise serializers.ValidationError("This email is already in use.")
        return value


class AdminParticipantCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(
        choices=[
            ("admin", "Admin"),
            ("viewer", "Viewer"),
            ("participant", "Participant"),
        ],
        default="participant",
    )

    class Meta:
        model = Participant
        fields = [
            "username",
            "password",
            "first_name",
            "last_name",
            "email",
            "phone",
            "role",
        ]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        if Participant.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def create(self, validated_data):
        username = validated_data.pop("username")
        password = validated_data.pop("password")
        first_name = validated_data.get("first_name", "")
        last_name = validated_data.get("last_name", "")
        email = validated_data.get("email", "")
        phone = validated_data.get("phone", "")
        role = validated_data.get("role", "participant")

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )

        participant = Participant.objects.create(
            user=user,
            first_name=first_name or username,
            last_name=last_name,
            email=email,
            phone=phone,
            role=role,
        )

        return participant


class RegistrationSerializer(serializers.ModelSerializer):
    participant_name = serializers.SerializerMethodField(read_only=True)
    event_title = serializers.CharField(source="event.title", read_only=True)

    class Meta:
        model = Registration
        fields = [
            "id",
            "event",
            "event_title",
            "participant",
            "participant_name",
            "registered_at",
        ]
        read_only_fields = ["participant", "registered_at"]

    def get_participant_name(self, obj):
        return str(obj.participant)

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user

        try:
            participant = user.participant
        except Participant.DoesNotExist:
            raise serializers.ValidationError(
                {"participant": "No participant profile is linked to this user."}
            )

        event = validated_data["event"]

        if event.status != "ongoing":
            raise serializers.ValidationError(
                {"detail": "Registration is only allowed when the event is ongoing."}
            )

        registration, created = Registration.objects.get_or_create(
            event=event,
            participant=participant,
        )

        if not created:
            raise serializers.ValidationError(
                {"detail": "You are already registered for this event."}
            )

        return registration


class UserRegisterSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "password",
            "confirm_password",
        ]
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True},
        }

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )

        if User.objects.filter(username=data["username"]).exists():
            raise serializers.ValidationError(
                {"username": "This username is already taken."}
            )

        email = data.get("email")
        if email and Participant.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                {"email": "This email is already in use."}
            )

        return data

    def create(self, validated_data):
        first_name = validated_data.pop("first_name", "")
        last_name = validated_data.pop("last_name", "")
        phone = validated_data.pop("phone", "")
        validated_data.pop("confirm_password")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            first_name=first_name,
            last_name=last_name,
        )

        Participant.objects.create(
            user=user,
            first_name=first_name or user.username,
            last_name=last_name,
            email=validated_data.get("email", ""),
            phone=phone,
            role="participant",
        )

        return user