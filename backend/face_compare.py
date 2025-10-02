import sys
import json
from deepface import DeepFace
import cv2
import numpy as np

def compare_faces(img1_path, img2_path):
    try:
        # Sử dụng DeepFace để so sánh khuôn mặt
        result = DeepFace.verify(
            img1_path=img1_path, 
            img2_path=img2_path,
            model_name='VGG-Face', 
            distance_metric='cosine' 
        )
        
        # Kết quả trả về
        return {
            'match': result['verified'],
            'confidence': 1 - result['distance'], 
            'distance': result['distance'],
            'threshold': result['threshold']
        }
    
    except Exception as e:
        
        return {
            'match': False,
            'confidence': 0.0,
            'distance': 1.0,
            'error': str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({
            'match': False,
            'confidence': 0.0,
            'distance': 1.0,
            'error': 'Invalid arguments'
        }))
        sys.exit(1)
    
    img1_path = sys.argv[1]
    img2_path = sys.argv[2]
    
    result = compare_faces(img1_path, img2_path)
    print(json.dumps(result))