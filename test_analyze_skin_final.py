#!/usr/bin/env python3
"""
Final focused test for POST /api/analyze-skin endpoint
Tests with high-quality realistic images at different sizes
"""

import requests
import json
import base64
import os
import time
from io import BytesIO
from PIL import Image, ImageDraw, ImageFilter
import random

BASE_URL = os.environ.get("BACKEND_URL", "http://localhost:8000/api")

def create_high_quality_face(width, height):
    """Create a high-quality realistic face with proper skin tones and features"""
    # Create base with realistic skin tone gradient
    img = Image.new('RGB', (width, height))
    pixels = img.load()
    
    center_x, center_y = width // 2, height // 2
    
    # Base skin tones (medium warm)
    base_colors = [
        (220, 180, 140),  # Light areas
        (200, 160, 120),  # Mid tones
        (180, 140, 100),  # Shadow areas
    ]
    
    # Create realistic skin with proper shading
    for y in range(height):
        for x in range(width):
            # Distance from center for radial shading
            dx = (x - center_x) / (width / 2)
            dy = (y - center_y) / (height / 2)
            dist = min(1.0, (dx**2 + dy**2) ** 0.5)
            
            # Vertical gradient (lighter at top, darker at bottom)
            vert_factor = y / height
            
            # Horizontal gradient (slight shading on sides)
            horiz_factor = abs(dx) * 0.3
            
            # Combine factors
            shade = 1.0 - (dist * 0.2 + vert_factor * 0.15 + horiz_factor)
            
            # Add skin texture noise
            noise = random.randint(-8, 8)
            
            # Select base color based on position
            if vert_factor < 0.3:
                base = base_colors[0]  # Forehead - lighter
            elif vert_factor < 0.6:
                base = base_colors[1]  # Mid face
            else:
                base = base_colors[2]  # Lower face - slightly darker
            
            r = int(max(0, min(255, base[0] * shade + noise)))
            g = int(max(0, min(255, base[1] * shade + noise)))
            b = int(max(0, min(255, base[2] * shade + noise)))
            
            pixels[x, y] = (r, g, b)
    
    draw = ImageDraw.Draw(img)
    
    # Draw realistic facial features
    face_width = int(width * 0.6)
    face_height = int(height * 0.8)
    face_left = (width - face_width) // 2
    face_top = int(height * 0.1)
    
    # Eyes (detailed)
    eye_y = face_top + int(face_height * 0.35)
    left_eye_x = face_left + int(face_width * 0.3)
    right_eye_x = face_left + int(face_width * 0.7)
    eye_width = int(width * 0.08)
    eye_height = int(height * 0.04)
    
    # Eye whites
    draw.ellipse([left_eye_x - eye_width, eye_y - eye_height,
                  left_eye_x + eye_width, eye_y + eye_height],
                 fill=(245, 245, 240))
    draw.ellipse([right_eye_x - eye_width, eye_y - eye_height,
                  right_eye_x + eye_width, eye_y + eye_height],
                 fill=(245, 245, 240))
    
    # Irises
    iris_radius = int(eye_height * 0.8)
    draw.ellipse([left_eye_x - iris_radius, eye_y - iris_radius,
                  left_eye_x + iris_radius, eye_y + iris_radius],
                 fill=(80, 60, 40))
    draw.ellipse([right_eye_x - iris_radius, eye_y - iris_radius,
                  right_eye_x + iris_radius, eye_y + iris_radius],
                 fill=(80, 60, 40))
    
    # Pupils
    pupil_radius = int(iris_radius * 0.5)
    draw.ellipse([left_eye_x - pupil_radius, eye_y - pupil_radius,
                  left_eye_x + pupil_radius, eye_y + pupil_radius],
                 fill=(20, 20, 20))
    draw.ellipse([right_eye_x - pupil_radius, eye_y - pupil_radius,
                  right_eye_x + pupil_radius, eye_y + pupil_radius],
                 fill=(20, 20, 20))
    
    # Eyebrows
    brow_y = eye_y - int(height * 0.06)
    brow_width = int(width * 0.1)
    brow_height = int(height * 0.015)
    draw.ellipse([left_eye_x - brow_width, brow_y - brow_height,
                  left_eye_x + brow_width, brow_y + brow_height],
                 fill=(60, 40, 30))
    draw.ellipse([right_eye_x - brow_width, brow_y - brow_height,
                  right_eye_x + brow_width, brow_y + brow_height],
                 fill=(60, 40, 30))
    
    # Nose (detailed)
    nose_y = face_top + int(face_height * 0.5)
    nose_x = center_x
    nose_width = int(width * 0.06)
    nose_height = int(height * 0.15)
    
    # Nose bridge
    draw.ellipse([nose_x - nose_width//3, nose_y - nose_height,
                  nose_x + nose_width//3, nose_y],
                 fill=(190, 150, 110))
    
    # Nose tip
    draw.ellipse([nose_x - nose_width//2, nose_y - nose_height//3,
                  nose_x + nose_width//2, nose_y + nose_height//3],
                 fill=(200, 160, 120))
    
    # Nostrils
    nostril_radius = int(width * 0.015)
    draw.ellipse([nose_x - nose_width//2 - nostril_radius, nose_y - nostril_radius,
                  nose_x - nose_width//2 + nostril_radius, nose_y + nostril_radius],
                 fill=(100, 70, 50))
    draw.ellipse([nose_x + nose_width//2 - nostril_radius, nose_y - nostril_radius,
                  nose_x + nose_width//2 + nostril_radius, nose_y + nostril_radius],
                 fill=(100, 70, 50))
    
    # Mouth (detailed)
    mouth_y = face_top + int(face_height * 0.7)
    mouth_width = int(width * 0.12)
    mouth_height = int(height * 0.03)
    
    # Upper lip
    draw.ellipse([center_x - mouth_width, mouth_y - mouth_height,
                  center_x + mouth_width, mouth_y],
                 fill=(160, 90, 90))
    
    # Lower lip
    draw.ellipse([center_x - mouth_width, mouth_y,
                  center_x + mouth_width, mouth_y + mouth_height],
                 fill=(180, 100, 100))
    
    # Cheeks (rosy)
    cheek_y = face_top + int(face_height * 0.55)
    cheek_radius = int(width * 0.08)
    left_cheek_x = face_left + int(face_width * 0.25)
    right_cheek_x = face_left + int(face_width * 0.75)
    
    # Add subtle blush
    for i in range(3):
        alpha_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        alpha_draw = ImageDraw.Draw(alpha_img)
        alpha_draw.ellipse([left_cheek_x - cheek_radius, cheek_y - cheek_radius//2,
                           left_cheek_x + cheek_radius, cheek_y + cheek_radius//2],
                          fill=(220, 120, 120, 30))
        alpha_draw.ellipse([right_cheek_x - cheek_radius, cheek_y - cheek_radius//2,
                           right_cheek_x + cheek_radius, cheek_y + cheek_radius//2],
                          fill=(220, 120, 120, 30))
        img = Image.alpha_composite(img.convert('RGBA'), alpha_img).convert('RGB')
    
    # Apply slight blur for more realistic skin texture
    img = img.filter(ImageFilter.GaussianBlur(radius=1))
    
    return img

def image_to_base64(img, quality=85):
    """Convert PIL Image to base64 data URL"""
    buffered = BytesIO()
    img.save(buffered, format="JPEG", quality=quality)
    img_bytes = buffered.getvalue()
    img_base64 = base64.b64encode(img_bytes).decode()
    data_url = f"data:image/jpeg;base64,{img_base64}"
    
    base64_size_kb = len(img_base64) / 1024
    payload_size_kb = len(data_url) / 1024
    
    return data_url, base64_size_kb, payload_size_kb

def test_payload(name, width, height, quality=85):
    """Test a specific payload size"""
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print(f"{'='*80}")
    
    img = create_high_quality_face(width, height)
    data_url, base64_kb, payload_kb = image_to_base64(img, quality)
    
    print(f"Image dimensions: {width}x{height}")
    print(f"JPEG quality: {quality}")
    print(f"Base64 size: {base64_kb:.1f} KB ({base64_kb/1024:.2f} MB)")
    print(f"Full payload size: {payload_kb:.1f} KB ({payload_kb/1024:.2f} MB)")
    print(f"Sending to {BASE_URL}/analyze-skin...")
    
    start_time = time.time()
    
    try:
        response = requests.post(
            f"{BASE_URL}/analyze-skin",
            json={"imageBase64": data_url},
            timeout=90
        )
        
        elapsed_time = time.time() - start_time
        
        print(f"\n✓ Response received in {elapsed_time:.2f} seconds")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ SUCCESS - HTTP 200")
            print(f"Response JSON:")
            print(json.dumps(data, indent=2))
            
            # Validate
            required_keys = ["fitzpatrick", "undertone", "skinHex", "label"]
            if all(k in data for k in required_keys):
                print(f"\n✓ Valid response:")
                print(f"  - fitzpatrick: {data['fitzpatrick']}")
                print(f"  - undertone: {data['undertone']}")
                print(f"  - skinHex: {data['skinHex']}")
                print(f"  - confidence: {data.get('confidence', 'N/A')}")
            
            return True, elapsed_time
        
        elif response.status_code == 422:
            print(f"\n⚠️  HTTP 422 - Unprocessable Entity")
            print(f"Response: {response.text}")
            return False, elapsed_time
        
        elif response.status_code in [413, 502, 504]:
            print(f"\n❌ HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False, elapsed_time
        
        else:
            print(f"\n❌ HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False, elapsed_time
    
    except requests.exceptions.Timeout:
        elapsed_time = time.time() - start_time
        print(f"\n❌ REQUEST TIMEOUT after {elapsed_time:.2f} seconds")
        return False, elapsed_time
    
    except requests.exceptions.ConnectionError as e:
        elapsed_time = time.time() - start_time
        print(f"\n❌ CONNECTION ERROR after {elapsed_time:.2f} seconds")
        print(f"Error: {str(e)}")
        return False, elapsed_time
    
    except Exception as e:
        elapsed_time = time.time() - start_time
        print(f"\n❌ EXCEPTION after {elapsed_time:.2f} seconds")
        print(f"Error: {str(e)}")
        return False, elapsed_time

def main():
    """Run focused payload size tests"""
    print("\n" + "="*80)
    print("POST /api/analyze-skin - FINAL PAYLOAD SIZE TEST")
    print("Testing with high-quality realistic face images")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print("="*80)
    
    results = {}
    
    # Test 1: Normal size (~1024px, target 150-400KB)
    success, time1 = test_payload("Normal Size (~1024px, 150-400KB)", 1024, 768, quality=85)
    results['normal'] = success
    
    # Test 2: Large payload (~3-5 MB)
    success, time2 = test_payload("Large Payload (~3-5 MB)", 4000, 3000, quality=95)
    results['large'] = success
    
    # Test 3: Medium payload (~1-2 MB)
    success, time3 = test_payload("Medium Payload (~1-2 MB)", 2400, 1800, quality=90)
    results['medium'] = success
    
    # Test 4: Very large payload (~8-10 MB) - stress test
    success, time4 = test_payload("Very Large Payload (~8-10 MB)", 5000, 4000, quality=98)
    results['very_large'] = success
    
    # Summary
    print(f"\n{'='*80}")
    print("FINAL SUMMARY")
    print(f"{'='*80}")
    
    print(f"\nTest Results:")
    print(f"  Normal size (~400KB):      {'✅ PASS' if results['normal'] else '❌ FAIL'} ({time1:.2f}s)")
    print(f"  Medium size (~1-2MB):      {'✅ PASS' if results['medium'] else '❌ FAIL'} ({time2:.2f}s)")
    print(f"  Large size (~3-5MB):       {'✅ PASS' if results['large'] else '❌ FAIL'} ({time3:.2f}s)")
    print(f"  Very large size (~8-10MB): {'✅ PASS' if results['very_large'] else '❌ FAIL'} ({time4:.2f}s)")
    
    print(f"\n{'='*80}")
    print("CONCLUSION")
    print(f"{'='*80}")
    
    if all(results.values()):
        print("\n✅ ALL TESTS PASSED!")
        print("\nThe /api/analyze-skin endpoint works correctly with:")
        print("  - Normal-sized payloads (~400KB)")
        print("  - Medium-sized payloads (~1-2MB)")
        print("  - Large payloads (~3-5MB)")
        print("  - Very large payloads (~8-10MB)")
        print("\n💡 CONCLUSION:")
        print("  There is NO request body size limit issue.")
        print("  The endpoint can handle full-resolution phone selfies.")
        print("  The Cloudflare error on live domain is NOT caused by payload size.")
        print("\n  Possible other causes to investigate:")
        print("  1. Specific image formats or encodings")
        print("  2. Network/CDN issues specific to live domain")
        print("  3. Client-side issues with image capture/encoding")
        print("  4. Intermittent backend/LLM API issues")
    
    elif results['normal'] and not results['large']:
        print("\n⚠️  PAYLOAD SIZE LIMIT DETECTED")
        print("\nNormal payloads work, but large payloads fail.")
        print("This indicates a request body size limit.")
        
        if results['medium']:
            print("The limit is between 1-2 MB and 3-5 MB.")
        else:
            print("The limit is between 400KB and 1-2 MB.")
        
        print("\n💡 RECOMMENDED FIX:")
        print("  Add client-side image resizing before upload:")
        print("  - Resize to max 1024px width/height")
        print("  - Compress to JPEG quality 85")
        print("  - This keeps payloads under 500KB")
    
    else:
        print("\n❌ UNEXPECTED RESULTS")
        print("\nThe test results don't match expected patterns.")
        print("This may indicate:")
        print("  1. Image quality/realism issues")
        print("  2. Intermittent backend issues")
        print("  3. Gemini API issues")
        print("\nCheck backend logs for more details.")
    
    print(f"\n{'='*80}\n")

if __name__ == "__main__":
    main()
