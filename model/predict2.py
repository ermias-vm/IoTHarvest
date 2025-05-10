import sys
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import numpy as np

def predict_leaf(model, image_path):
    patches, _ = extract_center_patches(image_path, label=None)
    patches = np.array(patches).astype('float32') / 255.0
    preds = model.predict(patches)
    mean_pred = np.mean(preds)
    return mean_pred > 0.5  # o un llindar més sensible com 0.4

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python predict.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    model = load_model('leaf_health_model.h5')
    result = predict_image(model, image_path)
    print(f"Prediction: {result}")
