# Generated migration for image_data and image_format fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='uicevent',
            name='image_data',
            field=models.BinaryField(
                blank=True,
                null=True,
                help_text='Binary image data stored in database'
            ),
        ),
        migrations.AddField(
            model_name='uicevent',
            name='image_format',
            field=models.CharField(
                choices=[
                    ('jpg', 'JPEG'),
                    ('jpeg', 'JPEG'),
                    ('png', 'PNG'),
                    ('gif', 'GIF'),
                    ('webp', 'WebP'),
                ],
                default='jpg',
                max_length=10,
                help_text='Image file format (jpg, png, gif, webp)'
            ),
        ),
        migrations.AlterField(
            model_name='uicevent',
            name='image',
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to='uic_events/'
            ),
        ),
    ]
