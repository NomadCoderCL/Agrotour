from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from .utils import compress_image
from django.core.files.storage import default_storage
from django.conf import settings
import os

class ImageUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        file_obj = request.data.get('file')
        
        if not file_obj:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Compress image
        try:
            compressed_file = compress_image(file_obj)
        except Exception as e:
            return Response({"error": f"Error processing image: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Save file
        file_name = default_storage.save(f"uploads/{compressed_file.name}", compressed_file)
        file_url = os.path.join(settings.MEDIA_URL, file_name)
        
        # In production this would return the S3 URL
        # For now, return absolute URL if possible or relative
        full_url = request.build_absolute_uri(file_url)
        
        return Response({
            "url": full_url,
            "file_name": file_name
        }, status=status.HTTP_201_CREATED)
