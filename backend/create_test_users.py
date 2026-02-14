import os
import django

def create_users():
    # Set settings explicitly to local to match manage.py default
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrotour_backend.settings.local')
    django.setup()

    from aplicacion.models import Usuario

    users_to_create = [
        {'username': 'cliente1', 'password': 'password123', 'rol': 'cliente', 'email': 'cliente1@example.com'},
        {'username': 'cliente2', 'password': 'password123', 'rol': 'cliente', 'email': 'cliente2@example.com'},
        {'username': 'productor1', 'password': 'password123', 'rol': 'productor', 'email': 'productor1@example.com'},
        {'username': 'productor2', 'password': 'password123', 'rol': 'productor', 'email': 'productor2@example.com'},
        {'username': 'admin1', 'password': 'password123', 'rol': 'admin', 'email': 'admin1@example.com', 'is_staff': True, 'is_superuser': True},
        {'username': 'Norvus', 'password': 'password123', 'rol': 'admin', 'email': 'norvus@gmail.com', 'is_staff': True, 'is_superuser': True},
        {'username': 'Cristian', 'password': 'password123', 'rol': 'admin', 'email': 'cristian@gmail.com', 'is_staff': True, 'is_superuser': True},
    ]

    print("--- Agrotour Test User Creator ---")
    created_count = 0
    
    for user_data in users_to_create:
        username = user_data['username']
        if not Usuario.objects.filter(username=username).exists():
            print(f"Creating {username} ({user_data['rol']})...")
            try:
                # Extract extra fields that create_user handles via **extra_fields
                rol = user_data['rol']
                is_staff = user_data.get('is_staff', False)
                is_superuser = user_data.get('is_superuser', False)
                
                user = Usuario.objects.create_user(
                    username=username,
                    email=user_data['email'],
                    password=user_data['password'],
                    rol=rol,
                    is_staff=is_staff,
                    is_superuser=is_superuser
                )
                print(f"✅ Created user: {username}")
                created_count += 1
            except Exception as e:
                print(f"❌ Error creating {username}: {e}")
        else:
            print(f"ℹ️ User already exists: {username}")

    print(f"\nSummary: {created_count} users created.")
    print("Credentials for all test users:")
    print("   Password: password123")
    print("---------------------------------")

if __name__ == '__main__':
    create_users()
