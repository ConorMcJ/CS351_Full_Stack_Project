from django.db import migrations
import os
from pathlib import Path


def convert_images_to_binary(apps, schema_editor):
    """
    Data migration: Convert ImageField references to binary data in database
    Reads image files from disk and stores them as BinaryField
    """
    UICEvent = apps.get_model('games', 'UICEvent')
    BASE_DIR = Path(__file__).resolve().parent.parent.parent
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
    
    for event in UICEvent.objects.all():
        # Try to read the image file from the old location
        if hasattr(event, 'image') and event.image:
            try:
                image_path = os.path.join(MEDIA_ROOT, str(event.image))
                
                if os.path.exists(image_path):
                    # Read image bytes
                    with open(image_path, 'rb') as f:
                        image_bytes = f.read()
                    
                    # Determine format from file extension
                    _, ext = os.path.splitext(image_path)
                    image_format = ext.lstrip('.').lower()
                    
                    # Normalize format names
                    if image_format in ['jpg', 'jpeg']:
                        image_format = 'jpg'
                    elif image_format not in ['png', 'gif', 'webp']:
                        image_format = 'jpg'  # Default fallback
                    
                    # Store in database
                    event.image_data = image_bytes
                    event.image_format = image_format
                    event.save(update_fields=['image_data', 'image_format'])
                    print(f"✓ Converted {event.name} ({image_format})")
                else:
                    print(f"✗ File not found for {event.name}: {image_path}")
            except Exception as e:
                print(f"✗ Error converting {event.name}: {str(e)}")


def reverse_conversion(apps, schema_editor):
    """
    Reverse: Clear binary data (data migrations are not typically reversed)
    """
    UICEvent = apps.get_model('games', 'UICEvent')
    UICEvent.objects.all().update(image_data=None, image_format='jpg')


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0003_add_image_binary_fields'),
    ]

    operations = [
        migrations.RunPython(convert_images_to_binary, reverse_conversion),
    ]
