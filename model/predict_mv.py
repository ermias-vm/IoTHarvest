import os
import sys
import shutil
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import tensorflow as tf

# === CONFIGURACIÓ ===
IMAGE_FOLDER = '../tests/testImages/'
PROCESSED_FOLDER = '../tests/processedImages/'
MODEL_PATH = 'leaf_patch_model.h5'  # Usa el nou format
IMAGE_SIZE = (224, 224)  # Ha de coincidir amb el del model
OUTPUT_PATH = '../frontend/prediction.txt'  # Fitxer de sortida per la predicció

# === FUNCIONS ===
def get_latest_image(folder):
    files = [os.path.join(folder, f) for f in os.listdir(folder) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    if not files:
        return None
    latest_file = max(files, key=os.path.getmtime)
    return latest_file

def write_prediction(label):
    with open(OUTPUT_PATH, "w") as f:
        f.write(label)

def center_crop_and_resize(img_path):
    img = Image.open(img_path).convert('RGB')
    width, height = img.size
    # Retalla el quadrat central
    min_dim = min(width, height)
    left = (width - min_dim) // 4
    top = (height - min_dim) // 4
    img_cropped = img.crop((left, top, left + min_dim, top + min_dim))
    img_resized = img_cropped.resize(IMAGE_SIZE)
    img_array = tf.keras.utils.img_to_array(img_resized)
    img_array = tf.expand_dims(img_array, 0)
    img_array = img_array / 255.0
    return img_array

def move_to_processed(img_path):
    if not os.path.exists(PROCESSED_FOLDER):
        os.makedirs(PROCESSED_FOLDER)
    shutil.move(img_path, os.path.join(PROCESSED_FOLDER, os.path.basename(img_path)))

# === MAIN ===
def main():
    latest_img = get_latest_image(IMAGE_FOLDER)
    if latest_img is None:
        print("No hi ha imatges noves per processar.") ##ELIMINAR EN CODI SERVER
        sys.exit(0)

    try:
        print("Loading model...")
        model = load_model(MODEL_PATH, compile=False)
        print("Model loaded.")

        print(f"Preprocessing image: {latest_img}")
        img_array = center_crop_and_resize(latest_img)
        print("Image preprocessed.")

        pred = model.predict(img_array)
        pred_value = float(pred[0]) if isinstance(pred, (np.ndarray, list)) else float(pred)


        move_to_processed(latest_img)

        if pred < 0.5:
            write_prediction("unhealthy")
            sys.exit(2)
        else:
            write_prediction("healthy")
            sys.exit(1)
    except Exception as e:
        write_prediction(f"error: {str(e)}")
        sys.exit(3)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(3)

if __name__ == '__main__':
    main()
