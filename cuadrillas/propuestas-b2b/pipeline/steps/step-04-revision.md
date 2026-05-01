---
execution: subagent
agent: revisor-propuestas
inputFile: cuadrillas/propuestas-b2b/output/propuesta-b2b.md
outputFile: cuadrillas/propuestas-b2b/output/revision-propuesta.md
model_tier: fast
on_reject: step-03-redaccion
id: step-04-revision
---

# Paso 4: Revisión de calidad

## Carga de contexto

- `cuadrillas/propuestas-b2b/output/propuesta-b2b.md` — documento principal a revisar (ruta transformada por el run).
- `cuadrillas/propuestas-b2b/pipeline/data/brief-cliente.md` — requisitos originales.
- `cuadrillas/propuestas-b2b/output/marco-propuesta.md` — coherencia estratégica.

## Instrucciones

### Proceso

1. Evalúa la propuesta contra el brief: **cobertura** de dolor, alcance, CTA y restricciones.
2. Marca problemas por severidad: **Bloqueante** / **Importante** / **Menor**.
3. Propón **edits concretos** (párrafo o sección) o lista de acciones para Raúl Redactor.
4. Emite veredicto: **Apto para enviar** / **Apta con ajustes** / **No apta** (si «No apta», el runner puede reabrir redacción vía `on_reject`).

## Formato de salida

```markdown
# Informe de revisión — propuesta B2B

## Veredicto
[Apto para enviar | Apta con ajustes | No apta]

## Alineación con el brief
| Requisito | ¿Cubierto? | Nota breve |
| --- | --- | --- |

## Problemas detectados
### Bloqueantes
### Importantes
### Menores

## Cambios recomendados (ordenados)
1. ...

## Riesgos residuales (mensaje, claims, tono)

## Checklist final
- [ ] ...
```

## Ejemplo de referencia (extracto)

```markdown
# Informe de revisión — propuesta B2B

## Veredicto
Apta con ajustes

## Alineación con el brief
| Requisito | ¿Cubierto? | Nota breve |
| No prometer ROI sin datos | Sí | Correcto: se usa «por validar» |
| Incluir plan por fases | Sí | Fase 2 podría acortarse en redacción |
```

## Condiciones de veto (re-ejecutar la revisión)

1. El informe no incluye **tabla de alineación** con el brief.
2. El veredicto es **Apto** pero queda al menos un hallazgo **Bloqueante** sin resolver.

## Criterios de calidad

- [ ] Feedback accionable; no solo adjetivos («mejorar tono»).
- [ ] Respeta líneas rojas del brief.
- [ ] Si existe `propuesta-b2b.html`, menciona en el informe si hay **discrepancias** de titulares respecto al MD.

## Si el veredicto es «Apta con ajustes»

- Prioriza en el informe los **tres primeros cambios** que más subirían la probabilidad de cierre; el resto puede quedar como lista secundaria.

## Cierre del informe

- Termina con una frase de **siguiente acción humana** (p. ej. «Tras corregir bloqueantes, re-ejecutar solo paso 03»), sin asumir automatización fuera del runner.
