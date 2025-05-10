# Predict + move les imatges (Per al servidor)
import os
import sys
import shutil
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import tensorflow as tf

# === CONFIGURACIÓ ===
IMAGE_FOLDER = 'outgoingImages/'
PROCESSED_FOLDER = 'processedImages/'
MODEL_PATH = 'leaf_health_model.h5'
IMAGE_SIZE = (224, 224)  # ha de coincidir amb el del model

# === FUNCIONS ===
def get_latest_image(folder):
    files = [os.path.join(folder, f) for f in os.listdir(folder) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    if not files:
        return None
    latest_file = max(files, key=os.path.getmtime)
    return latest_file

def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=IMAGE_SIZE)
    img_array = image.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0)  # shape (1, 224, 224, 3)
    img_array = img_array / 255.0
    return img_array

def move_to_processed(img_path):
    if not os.path.exists(PROCESSED_FOLDER):
        os.makedirs(PROCESSED_FOLDER)
    shutil.move(img_path, os.path.join(PROCESSED_FOLDER, os.path.basename(img_path)))

def main():
    latest_img = get_latest_image(IMAGE_FOLDER)
    if latest_img is None:
        sys.exit(0)  # No s'han trobat imatges

    try:
        model = load_model(MODEL_PATH)
        img_array = preprocess_image(latest_img)
        pred = model.predict(img_array)[0][0]

        move_to_processed(latest_img)

        if pred < 0.4:
            sys.exit(2)  # Fulla insaludable
        elif pred >= 0.4:
            sys.exit(1)  # Fulla saludable
        else:
            sys.exit(3)  # Indeterminat (difícil que passi, però per seguretat)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(3)  # Indeterminat per error

if __name__ == '__main__':
    main()

