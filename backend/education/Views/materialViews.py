from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from education.models import Material
from education.serializers import MaterialSerializer


def _is_admin(user):
    return user.is_authenticated and user.role == "admin" and not user.is_admin_pending


class MaterialListView(APIView):
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        queryset = Material.objects.all().order_by("-created_at")
        category = request.query_params.get("category")
        search = request.query_params.get("search")

        if category:
            queryset = queryset.filter(category=category)
        if search:
            queryset = queryset.filter(title__icontains=search)

        serializer = MaterialSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not _is_admin(request.user):
            return Response({"error": "Không có quyền thêm tài liệu"}, status=status.HTTP_403_FORBIDDEN)

        serializer = MaterialSerializer(data=request.data)
        if serializer.is_valid():
            material = serializer.save()
            return Response(MaterialSerializer(material).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MaterialDetailView(APIView):
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            material = Material.objects.get(id=pk)
        except Material.DoesNotExist:
            return Response({"error": "Tài liệu không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        return Response(MaterialSerializer(material).data)

    def patch(self, request, pk):
        if not _is_admin(request.user):
            return Response({"error": "Không có quyền cập nhật tài liệu"}, status=status.HTTP_403_FORBIDDEN)

        try:
            material = Material.objects.get(id=pk)
        except Material.DoesNotExist:
            return Response({"error": "Tài liệu không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        serializer = MaterialSerializer(material, data=request.data, partial=True)
        if serializer.is_valid():
            material = serializer.save()
            return Response(MaterialSerializer(material).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not _is_admin(request.user):
            return Response({"error": "Không có quyền xóa tài liệu"}, status=status.HTTP_403_FORBIDDEN)

        try:
            material = Material.objects.get(id=pk)
        except Material.DoesNotExist:
            return Response({"error": "Tài liệu không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        material.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
