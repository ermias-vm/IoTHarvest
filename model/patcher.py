import os
import cv2

PATCH_SIZE = 224
INPUT_DIR = 'temp_dataset/'  # On tens les imatges originals
OUTPUT_DIR = 'dataset_patches/'  # On vols guardar els patches
classes = ['healthy', 'unhealthy']

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def extract_and_save_zoomed_center_patches(image_path, label_name, base_name, patch_size=224, zoom_factor=2):
    img = cv2.imread(image_path)
    if img is None:
        print(f"[ERROR] No s'ha pogut llegir la imatge: {image_path}")
        return

    h, w, _ = img.shape
    center_y = h // 2
    center_x = w // 2

    crop_h = h // zoom_factor
    crop_w = w // zoom_factor

    # Coordenades del zoom
    top = max(center_y - crop_h // 2, 0)
    bottom = min(center_y + crop_h // 2, h)
    left = max(center_x - crop_w // 2, 0)
    right = min(center_x + crop_w // 2, w)

    cropped = img[top:bottom, left:right]

    # Resize the cropped area to patch size
    cropped_resized = cv2.resize(cropped, (patch_size, patch_size))

    output_folder = os.path.join(OUTPUT_DIR, label_name)
    ensure_dir(output_folder)
    patch_filename = f"{base_name}_zoom_patch.jpg"
    cv2.imwrite(os.path.join(output_folder, patch_filename), cropped_resized)
    print(f"Patch guardat: {patch_filename}")


# ===== Recorre totes les imatges =====
for class_name in classes:
    input_folder = os.path.join(INPUT_DIR, class_name)
    for fname in os.listdir(input_folder):
        if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
            img_path = os.path.join(input_folder, fname)
            base_name = os.path.splitext(fname)[0]
            extract_and_save_zoomed_center_patches(img_path, class_name, base_name)
