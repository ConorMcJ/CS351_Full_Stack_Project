import os
import base64
from pathlib import Path
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from games.models import UICEvent


class Command(BaseCommand):
    help = 'Convert existing image files on disk to binary data in database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--media-root',
            type=str,
            help='Path to media directory (defaults to backend/media)',
        )

    def handle(self, *args, **options):
        media_root = options.get('media_root')
        
        if not media_root:
            # Default: find media folder relative to manage.py
            base_dir = Path(__file__).resolve().parent.parent.parent.parent
            media_root = os.path.join(base_dir, 'media')
        
        self.stdout.write(f"Using media root: {media_root}")
        
        if not os.path.exists(media_root):
            self.stdout.write(
                self.style.ERROR(f"Media directory not found: {media_root}")
            )
            return
        
        uic_events_dir = os.path.join(media_root, 'uic_events')
        
        if not os.path.exists(uic_events_dir):
            self.stdout.write(
                self.style.WARNING(f"No uic_events directory found at {uic_events_dir}")
            )
            return
        
        converted = 0
        skipped = 0
        
        # Find all image files in uic_events directory
        for filename in os.listdir(uic_events_dir):
            filepath = os.path.join(uic_events_dir, filename)
            
            if not os.path.isfile(filepath):
                continue
            
            _, ext = os.path.splitext(filename)
            ext = ext.lstrip('.').lower()
            
            # Check if it's an image file
            if ext not in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                continue
            
            try:
                # Read image bytes
                with open(filepath, 'rb') as f:
                    image_bytes = f.read()
                
                # Normalize format
                if ext in ['jpg', 'jpeg']:
                    image_format = 'jpg'
                else:
                    image_format = ext
                
                # Try to find or create matching UICEvent
                # Match by image filename (without extension)
                event_name = os.path.splitext(filename)[0]
                
                # Look for event with similar name (case-insensitive)
                event = None
                try:
                    # Try exact match first
                    event = UICEvent.objects.get(name__iexact=event_name)
                except UICEvent.DoesNotExist:
                    # If no exact match, skip (admin will need to add images manually)
                    self.stdout.write(
                        self.style.WARNING(f"No event found for {filename}, skipping")
                    )
                    skipped += 1
                    continue
                
                if event.image_data:
                    self.stdout.write(
                        self.style.WARNING(f"Event {event.name} already has image data, skipping")
                    )
                    skipped += 1
                    continue
                
                # Store in database
                event.image_data = image_bytes
                event.image_format = image_format
                event.save(update_fields=['image_data', 'image_format'])
                
                self.stdout.write(
                    self.style.SUCCESS(f"✓ Converted {event.name} ({image_format}, {len(image_bytes)} bytes)")
                )
                converted += 1
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"✗ Error processing {filename}: {str(e)}")
                )
        
        self.stdout.write(
            self.style.SUCCESS(f"\n✓ Migration complete: {converted} images converted, {skipped} skipped")
        )
