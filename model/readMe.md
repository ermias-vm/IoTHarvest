
# Model de Keras

Model de predicció de la salut de la fulla.

Utilitza el model de keras: DenseNet121.

El dataset el podeu trobar en el Drive del projecte.

### Instruccions de entrenament:

Cal tenir una carpeta:

```
dataset/
    healthy/
    unhealthy/
```

1. Executa patcher.py:
```bash
python3 patcher.py
```
Retalla totes les imatges del dataset i les centra, això per a que es fixi més en la textura que en la forma.

2. Executa model_training2.py
```bash
python3 model_training2.py
```
Es podem modificar les rondes amb la variable EPOCHS. Deixa'l correr uns minuts. Ara mateix prodeix una matriu de confusió que indica més o menys la presició que té.

### Instruccions per a predir:

1. Assegura't que les imatges estan en un directori:
```
outgoingImages/
```
En el directori on estas treballant.

2. Executa predict_and_move.py
```bash
python3 predict_and_move.py
```
Agafa l'imatge més recent del directori i la processa. Mou la imatge processada a un directori:
```
processedImages/
```
El resultats del sys.exit son:
0 -> Error: No troba cap imatge
1 -> Fulla saludable
2 -> Fulla insaludable
3 -> Error indeterminat