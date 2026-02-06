import io
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile
import sys

def compress_image(image_file, max_size_kb=200):
    """
    Compress image to be under max_size_kb.
    """
    im = Image.open(image_file)
    
    # Convert to RGB if RGBA
    if im.mode in ('RGBA', 'P'):
        im = im.convert('RGB')
        
    output = io.BytesIO()
    quality = 85
    
    # First save to check size
    im.save(output, format='JPEG', quality=quality, optimize=True)
    size_kb = sys.getsizeof(output) / 1024
    
    # Iterate to reduce quality if needed
    while size_kb > max_size_kb and quality > 10:
        output = io.BytesIO()
        quality -= 10
        im.save(output, format='JPEG', quality=quality, optimize=True)
        size_kb = sys.getsizeof(output) / 1024
        
    # Create new Django file
    output.seek(0)
    return InMemoryUploadedFile(
        output,
        'ImageField',
        f"{image_file.name.split('.')[0]}.jpg",
        'image/jpeg',
        sys.getsizeof(output),
        None
    )
