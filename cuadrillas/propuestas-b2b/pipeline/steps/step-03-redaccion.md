---
execution: inline
agent: redactor-propuestas
inputFile: cuadrillas/propuestas-b2b/output/marco-propuesta.md
outputFile: cuadrillas/propuestas-b2b/output/propuesta-b2b.md
id: step-03-redaccion
---

# Paso 3: Redacción de la propuesta

## Carga de contexto

- `cuadrillas/propuestas-b2b/output/marco-propuesta.md` — marco aprobado (transformado con run_id/version por el runner).
- `cuadrillas/propuestas-b2b/pipeline/data/brief-cliente.md` — verificación de matices del cliente.
- `_nifillos/_memory/company.md` — datos del proveedor.

## Instrucciones

### Proceso

1. Lee el marco y el brief; **no contradigas** supuestos ya etiquetados.
2. Redacta una **propuesta en Markdown** lista para que dirección la lea en 8–12 minutos: titular claro, sumario, cuerpo por secciones, CTA final.
3. Genera además un **HTML semántico** (`article`, `h1`, `h2`, `section`) con la misma narrativa, estilos mínimos inline o bloque `<style>` sobrio (tipografía sistema, buen contraste). Guarda el HTML en el **mismo directorio de versión** que el Markdown, con nombre `propuesta-b2b.html` (misma carpeta que `propuesta-b2b.md` tras la transformación de rutas del runner).
4. Mantén **un solo archivo principal** declarado en `outputFile`: `propuesta-b2b.md`. El HTML es compañero explícito en la misma carpeta `vN/`.
5. Incluye tabla o lista de **próximos pasos** con responsables sugeridos (cliente / proveedor) sin inventar nombres: usa roles.

## Formato de salida — Markdown (`propuesta-b2b.md`)

```markdown
# Propuesta: [Cliente o iniciativa]

**Para:** [rol] — [organización]
**De:** [proveedor según company.md]
**Fecha:** YYYY-MM-DD
**Confidencialidad:** [según brief o “Uso interno”]

## Sumario ejecutivo
## Situación y objetivos
## Propuesta
## Metodología y fases
## Resultados esperados (sin cifras inventadas)
## Riesgos y cómo los gestionamos
## Inversión y condiciones *(solo si el brief trae datos; si no: “Por definir” + próximo paso)*
## Por qué nosotros
## Próximos pasos
## Anexos sugeridos *(opcional)*
```

## Ejemplo de calidad (extracto ficticio)

```markdown
# Propuesta: Programa de gobierno de datos para ACME Retail

**Para:** Directora de Operaciones — ACME Retail Iberia
**De:** Nifillos Analytics Studio
**Fecha:** 2026-04-05
**Confidencialidad:** Uso interno — no distribuir

## Sumario ejecutivo
ACME necesita visibilidad unificada del inventario. Proponemos dos fases de 6 semanas cada una...
```

## Condiciones de veto

1. Aparecen **precios o SLAs** que no estaban en el brief sin marcarlos como orientativos o «por validar».
2. El MD supera ~**1800 palabras** sin estar estructurado en anexos claros (demasiado denso para decisión ejecutiva).

## Criterios de calidad

- [ ] Primera página responde: qué, para quién, por qué ahora, qué pide el usuario al cliente.
- [ ] Coherencia total entre MD y HTML.
- [ ] Tono B2B: respetuoso, seguro, sin hiperbólicos vacíos.
- [ ] La sección «Por qué nosotros» conecta con **capacidades** declaradas en `company.md`, no con autopromoción genérica.

## Si el marco sugiere varias opciones comerciales

- Elige **una** como recomendada y documenta las otras en subsección breve «Alternativas descartadas en esta versión», sin mezclar narrativas.

## Si el HTML debe ser impreso

- Usa saltos de página razonables (`page-break-after` en CSS solo si necesario) y evita fondos oscuros que consuman tinta.

