# predict.py
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np

model = load_model('leaf_health_model.h5')

def predict(image_path):
    img = Image.open(image_path).resize((224, 224))
    img_array = np.expand_dims(np.array(img) / 255.0, axis=0)
    prediction = model.predict(img_array)
    return "Healthy" if prediction > 0.5 else "Unhealthy"

# Example usage
print(predict("test_image.jpg"))
