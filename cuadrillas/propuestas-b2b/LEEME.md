# Cuadrilla propuestas-b2b

Pipeline para **propuestas comerciales B2B**: brief (checkpoint) → marco estratégico → redacción MD + HTML → revisión con posible vuelta a redacción.

## Ejecutar

En el IDE, con el skill Nifillos cargado, sigue `_nifillos/core/runner.pipeline.md` y ejecuta:

```text
/nifillos ejecuta la cuadrilla propuestas-b2b
```

(o el equivalente en inglés de tu plantilla).

## Estructura

| Ruta | Uso |
| --- | --- |
| `cuadrilla.yaml` | Metadatos, `pipeline.steps`, skills nativos |
| `cuadrilla-party.csv` | Agentes: Esteban (estrategia), Raúl (redacción), Rita (revisión) |
| `pipeline/pipeline.yaml` | Orden de pasos para el runner |
| `pipeline/steps/` | Definición de cada paso (frontmatter + instrucciones) |
| `pipeline/data/` | Brief capturado (`brief-cliente.md` tras el checkpoint) |
| `agents/*.agent.md` | Personas completas |
| `_memory/memories.md` | Aprendizajes entre runs |
| `output/` | Entregables por run (ignorado en git salvo política del repo) |

## Notas

- Rellena `_nifillos/_memory/company.md` antes del primer run para que salgan datos del proveedor.
- Los precios y plazos **no se inventan**: solo si están en el brief o marcados como orientativos.
