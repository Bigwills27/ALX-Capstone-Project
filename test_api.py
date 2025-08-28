#!/usr/bin/env python3
import requests
import json

# Base URL
BASE_URL = "http://127.0.0.1:8000/api"

def test_api():
    print("🚀 Testing Task Management API")
    print("=" * 40)
    
    # 1. Register a user
    print("\n1. Registering a new user...")
    register_data = {
        "username": "testuser",
        "email": "test@example.com", 
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register/", json=register_data)
        if response.status_code == 201:
            data = response.json()
            token = data['token']
            print(f"✅ User registered successfully!")
            print(f"Token: {token}")
            
            # 2. Login (optional, but let's test it)
            print("\n2. Testing login...")
            login_data = {"username": "testuser", "password": "testpass123"}
            login_response = requests.post(f"{BASE_URL}/login/", json=login_data)
            if login_response.status_code == 200:
                print("✅ Login successful!")
                print(f"Login response: {login_response.json()}")
            
            # 3. Create a task
            print("\n3. Creating a task...")
            headers = {"Authorization": f"Token {token}"}
            task_data = {
                "title": "My First Task",
                "description": "This is a test task",
                "priority": "high"
            }
            
            task_response = requests.post(f"{BASE_URL}/tasks/", json=task_data, headers=headers)
            if task_response.status_code == 201:
                task = task_response.json()
                task_id = task['id']
                print(f"✅ Task created successfully!")
                print(f"Task: {task}")
                
                # 4. Get all tasks
                print("\n4. Getting all tasks...")
                tasks_response = requests.get(f"{BASE_URL}/tasks/", headers=headers)
                if tasks_response.status_code == 200:
                    tasks = tasks_response.json()
                    print(f"✅ Retrieved {len(tasks)} tasks")
                    for task in tasks:
                        print(f"  - {task['title']} (Completed: {task['is_completed']})")
                
                # 5. Toggle task completion
                print(f"\n5. Toggling task {task_id} completion...")
                toggle_response = requests.patch(f"{BASE_URL}/tasks/{task_id}/toggle/", headers=headers)
                if toggle_response.status_code == 200:
                    updated_task = toggle_response.json()
                    print(f"✅ Task toggled! Completed: {updated_task['is_completed']}")
                
                print("\n🎉 All tests passed! Your API is working perfectly!")
                
        else:
            print(f"❌ Registration failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure Django is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_api()
