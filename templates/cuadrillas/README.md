# Carpeta `cuadrillas/`

Aquí van las **cuadrillas** de tu proyecto: cada una es un directorio `cuadrillas/<código>/` con definición (`cuadrilla.yaml`), manifiesto de agentes (`cuadrilla-party.csv`), pipeline (`pipeline/`) y agentes (`agents/`).

## Primera cuadrilla

No hace falta copiar nada a mano: crea la primera cuadrilla desde el IDE con **`/nifillos`** (menú «crear cuadrilla» o instrucción en lenguaje natural). El **Arquitecto** genera la estructura y los archivos.

Tras crearla, ejecútala con **`/nifillos ejecuta la cuadrilla <código>`** (o el equivalente en inglés de tu plantilla). Los entregables suelen ir a `cuadrillas/<código>/output/<run>/`.

## Migración desde el layout antiguo

Si venías de **`squads/`** y **`squad.yaml`**, usa `npx nifillos migrate` o `npx nifillos update`. Detalle: [GUIA.md](../GUIA.md) §8 o [GUIDE.md](../GUIDE.md) §8.

## Referencia de estructura (orientativa)

Cada cuadrilla real suele incluir, entre otros:

- `cuadrilla.yaml` — metadatos, lista de pasos del pipeline, skills de referencia  
- `cuadrilla-party.csv` — agentes y rutas a sus `.agent.md`  
- `pipeline/pipeline.yaml` — definición del pipeline  
- `pipeline/steps/step-*.md` — pasos y checkpoints  
- `agents/*.agent.md` — definición completa de agentes  

No mantenemos aquí un ejemplo ejecutable mínimo en el paquete: el **Arquitecto** es la fuente de verdad para no duplicar criterios de calidad y tamaño de agentes.

---

**English:** Same folder; create your first cuadrilla via **`/nifillos`**, then **`/nifillos run the <code> cuadrilla`**. Legacy **`squads/`** → see **GUIDE.md** §8.
