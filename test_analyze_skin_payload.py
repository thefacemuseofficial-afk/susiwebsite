#!/usr/bin/env python3
"""
Focused test for POST /api/analyze-skin endpoint
Root cause investigation for Cloudflare "origin returned empty/malformed response" error
Tests different payload sizes to identify request body size limits
"""

import requests
import json
import base64
import time
from io import BytesIO
from PIL import Image, ImageDraw

# Base URL from frontend/.env
BASE_URL = "https://facial-web-port.preview.emergentagent.com/api"

def create_realistic_skin_photo(width, height):
    """Create a realistic-looking photo with human skin tones and facial features"""
    # Create base image with realistic skin tone
    img = Image.new('RGB', (width, height), color=(220, 180, 140))
    draw = ImageDraw.Draw(img)
    
    # Add realistic skin tone variations (simulate face contours)
    pixels = img.load()
    center_x, center_y = width // 2, height // 2
    
    for y in range(height):
        for x in range(width):
            # Calculate distance from center for shading
            dx = (x - center_x) / width
            dy = (y - center_y) / height
            dist = (dx**2 + dy**2) ** 0.5
            
            # Add realistic skin tone variation
            base_r = 220
            base_g = 180
            base_b = 140
            
            # Add contour shading
            shade_factor = 1.0 - (dist * 0.3)
            
            # Add texture variation
            texture = ((x * 7 + y * 11) % 20) - 10
            
            r = int(max(0, min(255, base_r * shade_factor + texture)))
            g = int(max(0, min(255, base_g * shade_factor + texture)))
            b = int(max(0, min(255, base_b * shade_factor + texture)))
            
            pixels[x, y] = (r, g, b)
    
    # Add facial features (eyes, nose, mouth) to make it more realistic
    # Eyes
    eye_y = int(height * 0.4)
    left_eye_x = int(width * 0.35)
    right_eye_x = int(width * 0.65)
    eye_radius = int(min(width, height) * 0.05)
    
    draw.ellipse([left_eye_x - eye_radius, eye_y - eye_radius, 
                  left_eye_x + eye_radius, eye_y + eye_radius], 
                 fill=(80, 60, 40))
    draw.ellipse([right_eye_x - eye_radius, eye_y - eye_radius, 
                  right_eye_x + eye_radius, eye_y + eye_radius], 
                 fill=(80, 60, 40))
    
    # Nose
    nose_y = int(height * 0.55)
    nose_x = center_x
    nose_width = int(width * 0.08)
    nose_height = int(height * 0.12)
    draw.ellipse([nose_x - nose_width//2, nose_y - nose_height//2,
                  nose_x + nose_width//2, nose_y + nose_height//2],
                 fill=(200, 160, 120))
    
    # Mouth
    mouth_y = int(height * 0.7)
    mouth_width = int(width * 0.15)
    mouth_height = int(height * 0.04)
    draw.ellipse([center_x - mouth_width//2, mouth_y - mouth_height//2,
                  center_x + mouth_width//2, mouth_y + mouth_height//2],
                 fill=(180, 100, 100))
    
    return img

def image_to_base64(img, quality=85):
    """Convert PIL Image to base64 data URL"""
    buffered = BytesIO()
    img.save(buffered, format="JPEG", quality=quality)
    img_bytes = buffered.getvalue()
    img_base64 = base64.b64encode(img_bytes).decode()
    data_url = f"data:image/jpeg;base64,{img_base64}"
    
    # Calculate sizes
    base64_size_kb = len(img_base64) / 1024
    payload_size_kb = len(data_url) / 1024
    
    return data_url, base64_size_kb, payload_size_kb

def test_normal_size_payload():
    """Test 1: Normal size payload (~1024px, 150-400KB base64)"""
    print("\n" + "="*80)
    print("TEST 1: NORMAL SIZE PAYLOAD (~1024px, 150-400KB base64)")
    print("="*80)
    
    # Create realistic skin photo at ~1024px
    img = create_realistic_skin_photo(1024, 768)
    data_url, base64_kb, payload_kb = image_to_base64(img, quality=85)
    
    print(f"Image dimensions: 1024x768")
    print(f"Base64 size: {base64_kb:.1f} KB")
    print(f"Full payload size: {payload_kb:.1f} KB")
    print(f"Sending to {BASE_URL}/analyze-skin...")
    
    start_time = time.time()
    
    try:
        response = requests.post(
            f"{BASE_URL}/analyze-skin",
            json={"imageBase64": data_url},
            timeout=60
        )
        
        elapsed_time = time.time() - start_time
        
        print(f"\n✓ Response received in {elapsed_time:.2f} seconds")
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ SUCCESS - HTTP 200")
            print(f"Response JSON:")
            print(json.dumps(data, indent=2))
            
            # Validate required keys
            required_keys = ["fitzpatrick", "undertone", "skinHex", "label", 
                           "eyeColour", "faceShape", "lighting", "confidence"]
            missing_keys = [k for k in required_keys if k not in data]
            
            if missing_keys:
                print(f"\n⚠️  WARNING: Missing keys: {missing_keys}")
            else:
                print(f"\n✓ All required keys present")
                print(f"  - fitzpatrick: {data['fitzpatrick']} (expected: 1-6)")
                print(f"  - undertone: {data['undertone']} (expected: warm/cool/neutral)")
                print(f"  - skinHex: {data['skinHex']}")
                print(f"  - label: {data['label']}")
                print(f"  - eyeColour: {data['eyeColour']}")
                print(f"  - faceShape: {data['faceShape']}")
                print(f"  - lighting: {data['lighting']}")
                print(f"  - confidence: {data['confidence']}")
            
            return True
        
        elif response.status_code == 422:
            print(f"\n⚠️  HTTP 422 - Unprocessable Entity")
            print(f"Response: {response.text}")
            print(f"This means GPT-4o couldn't detect skin in the image")
            return False
        
        elif response.status_code == 502:
            print(f"\n❌ HTTP 502 - Bad Gateway")
            print(f"Response: {response.text}")
            print(f"This indicates the origin returned an empty/malformed response")
            return False
        
        else:
            print(f"\n❌ UNEXPECTED STATUS: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    
    except requests.exceptions.Timeout:
        elapsed_time = time.time() - start_time
        print(f"\n❌ REQUEST TIMEOUT after {elapsed_time:.2f} seconds")
        return False
    
    except requests.exceptions.ConnectionError as e:
        elapsed_time = time.time() - start_time
        print(f"\n❌ CONNECTION ERROR after {elapsed_time:.2f} seconds")
        print(f"Error: {str(e)}")
        return False
    
    except Exception as e:
        elapsed_time = time.time() - start_time
        print(f"\n❌ EXCEPTION after {elapsed_time:.2f} seconds")
        print(f"Error: {str(e)}")
        return False

def test_large_payload():
    """Test 2: Large payload (~3-5 MB base64) to test size limits"""
    print("\n" + "="*80)
    print("TEST 2: LARGE PAYLOAD (~3-5 MB base64)")
    print("="*80)
    
    # Create large realistic skin photo
    # To get ~3-5 MB base64, we need a high-res image
    # Base64 is ~1.33x the size of raw bytes
    # For 3 MB base64, we need ~2.25 MB JPEG
    # A 4000x3000 JPEG at high quality should give us this
    
    img = create_realistic_skin_photo(4000, 3000)
    data_url, base64_kb, payload_kb = image_to_base64(img, quality=95)
    
    print(f"Image dimensions: 4000x3000")
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
            print(f"Large payload accepted by origin/ingress!")
            print(f"Response JSON:")
            print(json.dumps(data, indent=2))
            return True
        
        elif response.status_code == 413:
            print(f"\n❌ HTTP 413 - Request Entity Too Large")
            print(f"Response: {response.text}")
            print(f"This confirms there is a request body size limit!")
            print(f"The limit is somewhere between {payload_kb:.1f} KB and the normal payload size")
            return False
        
        elif response.status_code == 502:
            print(f"\n❌ HTTP 502 - Bad Gateway")
            print(f"Response: {response.text}")
            print(f"This indicates the origin returned an empty/malformed response")
            print(f"This could be due to payload size limits or processing timeout")
            return False
        
        elif response.status_code == 504:
            print(f"\n❌ HTTP 504 - Gateway Timeout")
            print(f"Response: {response.text}")
            print(f"The request timed out at the gateway/proxy level")
            return False
        
        elif response.status_code == 422:
            print(f"\n⚠️  HTTP 422 - Unprocessable Entity")
            print(f"Response: {response.text}")
            print(f"Large payload was accepted, but GPT-4o couldn't process the image")
            return False
        
        else:
            print(f"\n❌ UNEXPECTED STATUS: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    
    except requests.exceptions.Timeout:
        elapsed_time = time.time() - start_time
        print(f"\n❌ REQUEST TIMEOUT after {elapsed_time:.2f} seconds")
        print(f"The request timed out - this could indicate:")
        print(f"  1. Processing timeout due to large payload")
        print(f"  2. Network timeout")
        print(f"  3. Backend timeout")
        return False
    
    except requests.exceptions.ConnectionError as e:
        elapsed_time = time.time() - start_time
        print(f"\n❌ CONNECTION ERROR after {elapsed_time:.2f} seconds")
        print(f"Error: {str(e)}")
        print(f"Connection was reset - this could indicate:")
        print(f"  1. Request body size limit exceeded")
        print(f"  2. Proxy/ingress rejected the request")
        return False
    
    except Exception as e:
        elapsed_time = time.time() - start_time
        print(f"\n❌ EXCEPTION after {elapsed_time:.2f} seconds")
        print(f"Error: {str(e)}")
        return False

def test_invalid_image():
    """Test 3: Invalid image should return JSON error (not empty body)"""
    print("\n" + "="*80)
    print("TEST 3: INVALID IMAGE (should return JSON error, not empty body)")
    print("="*80)
    
    invalid_payload = "data:image/jpeg;base64,AAAA"
    
    print(f"Sending invalid base64 payload: {invalid_payload}")
    print(f"Sending to {BASE_URL}/analyze-skin...")
    
    start_time = time.time()
    
    try:
        response = requests.post(
            f"{BASE_URL}/analyze-skin",
            json={"imageBase64": invalid_payload},
            timeout=30
        )
        
        elapsed_time = time.time() - start_time
        
        print(f"\n✓ Response received in {elapsed_time:.2f} seconds")
        print(f"Status Code: {response.status_code}")
        print(f"Response Body Length: {len(response.text)} bytes")
        print(f"Response: {response.text}")
        
        if response.status_code in [400, 422, 502]:
            if len(response.text) == 0:
                print(f"\n❌ CRITICAL: Empty response body!")
                print(f"This is the bug - server returned empty/malformed response")
                return False
            
            try:
                data = response.json()
                print(f"\n✅ SUCCESS - Returned JSON error (not empty body)")
                print(f"Error response:")
                print(json.dumps(data, indent=2))
                return True
            except json.JSONDecodeError:
                print(f"\n❌ CRITICAL: Response is not valid JSON!")
                print(f"This is the bug - server returned malformed response")
                return False
        
        elif response.status_code == 200:
            print(f"\n⚠️  WARNING: Invalid image returned HTTP 200")
            print(f"Expected 4xx/5xx error")
            return False
        
        else:
            print(f"\n❌ UNEXPECTED STATUS: {response.status_code}")
            return False
    
    except Exception as e:
        elapsed_time = time.time() - start_time
        print(f"\n❌ EXCEPTION after {elapsed_time:.2f} seconds")
        print(f"Error: {str(e)}")
        return False

def test_medium_payload():
    """Test 4: Medium payload (~1-2 MB) to narrow down size limit"""
    print("\n" + "="*80)
    print("TEST 4: MEDIUM PAYLOAD (~1-2 MB base64)")
    print("="*80)
    
    # Create medium-sized realistic skin photo
    img = create_realistic_skin_photo(2400, 1800)
    data_url, base64_kb, payload_kb = image_to_base64(img, quality=90)
    
    print(f"Image dimensions: 2400x1800")
    print(f"Base64 size: {base64_kb:.1f} KB ({base64_kb/1024:.2f} MB)")
    print(f"Full payload size: {payload_kb:.1f} KB ({payload_kb/1024:.2f} MB)")
    print(f"Sending to {BASE_URL}/analyze-skin...")
    
    start_time = time.time()
    
    try:
        response = requests.post(
            f"{BASE_URL}/analyze-skin",
            json={"imageBase64": data_url},
            timeout=60
        )
        
        elapsed_time = time.time() - start_time
        
        print(f"\n✓ Response received in {elapsed_time:.2f} seconds")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ SUCCESS - HTTP 200")
            print(f"Medium payload accepted!")
            print(f"Response JSON:")
            print(json.dumps(data, indent=2))
            return True
        
        elif response.status_code in [413, 502, 504]:
            print(f"\n❌ HTTP {response.status_code}")
            print(f"Response: {response.text}")
            print(f"Medium payload rejected - size limit is below {payload_kb:.1f} KB")
            return False
        
        elif response.status_code == 422:
            print(f"\n⚠️  HTTP 422 - Unprocessable Entity")
            print(f"Response: {response.text}")
            print(f"Medium payload was accepted, but GPT-4o couldn't process the image")
            return False
        
        else:
            print(f"\n❌ UNEXPECTED STATUS: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    
    except requests.exceptions.Timeout:
        elapsed_time = time.time() - start_time
        print(f"\n❌ REQUEST TIMEOUT after {elapsed_time:.2f} seconds")
        return False
    
    except requests.exceptions.ConnectionError as e:
        elapsed_time = time.time() - start_time
        print(f"\n❌ CONNECTION ERROR after {elapsed_time:.2f} seconds")
        print(f"Error: {str(e)}")
        return False
    
    except Exception as e:
        elapsed_time = time.time() - start_time
        print(f"\n❌ EXCEPTION after {elapsed_time:.2f} seconds")
        print(f"Error: {str(e)}")
        return False

def main():
    """Run all payload size tests"""
    print("\n" + "="*80)
    print("POST /api/analyze-skin - PAYLOAD SIZE INVESTIGATION")
    print("Root Cause Analysis for Cloudflare 'origin returned empty/malformed response'")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print("="*80)
    
    results = {}
    
    # Test 1: Normal size (should work)
    results['normal'] = test_normal_size_payload()
    
    # Test 2: Large payload (may fail due to size limits)
    results['large'] = test_large_payload()
    
    # Test 3: Invalid image (should return JSON error)
    results['invalid'] = test_invalid_image()
    
    # Test 4: Medium payload (to narrow down limit)
    results['medium'] = test_medium_payload()
    
    # Summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    
    print(f"\nTest Results:")
    print(f"  Normal size (~400KB):  {'✅ PASS' if results['normal'] else '❌ FAIL'}")
    print(f"  Medium size (~1-2MB):  {'✅ PASS' if results['medium'] else '❌ FAIL'}")
    print(f"  Large size (~3-5MB):   {'✅ PASS' if results['large'] else '❌ FAIL'}")
    print(f"  Invalid image:         {'✅ PASS' if results['invalid'] else '❌ FAIL'}")
    
    print(f"\n" + "="*80)
    print("DIAGNOSIS")
    print("="*80)
    
    if results['normal'] and not results['large']:
        print("\n🔍 ROOT CAUSE IDENTIFIED:")
        print("  The endpoint works with normal-sized payloads (~400KB)")
        print("  but FAILS with large payloads (~3-5MB).")
        print("\n  This confirms there is a REQUEST BODY SIZE LIMIT")
        print("  that is causing the Cloudflare error on live domain")
        print("  when users upload full-resolution phone selfies.")
        
        if results['medium']:
            print("\n  Medium payloads (~1-2MB) are accepted.")
            print("  The limit is somewhere between 1-2 MB and 3-5 MB.")
        else:
            print("\n  Medium payloads (~1-2MB) are also rejected.")
            print("  The limit is somewhere between 400KB and 1-2 MB.")
        
        print("\n💡 RECOMMENDED FIX:")
        print("  1. Add client-side image resizing before upload")
        print("  2. Resize images to max 1024px width/height")
        print("  3. Compress to JPEG quality 85 or lower")
        print("  4. This will keep payloads under 500KB")
        
    elif not results['normal']:
        print("\n❌ CRITICAL: Even normal-sized payloads are failing!")
        print("  This indicates a more serious issue than just size limits.")
        print("  Check backend logs for errors.")
        
    elif results['large']:
        print("\n✅ All payload sizes work correctly!")
        print("  The issue may be specific to certain image types")
        print("  or only occurs on the live domain (not in testing).")
    
    if not results['invalid']:
        print("\n⚠️  WARNING: Invalid images return empty/malformed responses")
        print("  This could be contributing to the Cloudflare error.")
    
    print("\n" + "="*80)

if __name__ == "__main__":
    main()
