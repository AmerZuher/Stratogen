# generate_users.py
import random
import string
from app.auth.security import get_password_hash

# --- Step 1: define 5 usernames ---
usernames = ["kadir", "amer", "ferhat", "test"]

# --- Step 2: generate random passwords ---
def generate_password(length=12):
    chars = string.ascii_letters + string.digits + string.punctuation
    return ''.join(random.choice(chars) for _ in range(length))

users_data = []
for username in usernames:
    plain_password = generate_password()
    hashed_password = get_password_hash(plain_password)
    users_data.append({
        "username": username,
        "password": plain_password,
        "hashed_password": hashed_password
    })

# --- Step 3: print table of usernames and plain passwords ---
print("users | passwords")
print("-----------------")
for u in users_data:
    print(f"{u['username']} | {u['password']}")

# --- Step 4: generate INSERT script ---
print("\n-- INSERT SCRIPT --")
print("INSERT INTO users (email, username, hashed_password, is_active, is_superuser, department_id)")
print("VALUES")
for i, u in enumerate(users_data):
    comma = "," if i < len(users_data) - 1 else ";"
    print(f"('{u['username']}@example.com', '{u['username']}', '{u['hashed_password']}', true, false, NULL){comma}")


'''
users | passwords
-----------------
admin | TCBAIBeat123!c
kadir | 4tZ%?(2YAgUP
amer | 4<,$,K{bIL2t
ferhat | QO]=EoAd9]1D
test | \-&9hF+^7jl&

-- INSERT SCRIPT --
INSERT INTO users (email, username, hashed_password, is_active, is_superuser, department_id)
VALUES
('admin@gmail.com', 'admin', '$2b$12$GK2J3Vsnk6RnVVRxx1BFdekjmIPriHWHRB55IRURI52AFXsSIzIlG', true, true, NULL)
('kadir@example.com', 'kadir', '$2b$12$t0LWpRkRSkgBNatedQQvge61xRhl6kPh68aJlt/zfX0TaBYvY7KTC', false, false, NULL),
('amer@example.com', 'amer', '$2b$12$MrBEVpwtLG86Xizh51lF6eA9AcgsjW8EWibfn32UCMm5jwBEr3jaW', false, false, NULL),
('ferhat@example.com', 'ferhat', '$2b$12$Bggi2W3C8hkEwZpb7haMVO61UBSlMV9PB5zflA5xlj8GduRTCiTa6', false, false, NULL),
('test@example.com', 'test', '$2b$12$ksQBjfcNYX0KMExtu51yEelfQfBs80.pbIimmwDwfj/AmW46NC4qK', false, false, NULL);

'''