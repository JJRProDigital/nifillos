---
type: checkpoint
outputFile: cuadrillas/propuestas-b2b/pipeline/data/brief-cliente.md
---

# Paso 1: Brief comercial B2B

## Contexto

Antes de investigar o redactar, necesitamos alinear el **problema del cliente**, el **alcance** y las **expectativas de compra**. Esta cuadrilla genera propuestas B2B con tono ejecutivo.

Este checkpoint **no usa agente LLM**: quien facilita (runner o persona) recoge datos y el runner vuelca el markdown en `pipeline/data/brief-cliente.md`.

Tras guardar el brief, el paso 02 asume que **no hay nuevas preguntas** al usuario hasta el siguiente checkpoint de aprobación implícita en el flujo del IDE.

## Mensaje para el usuario

1. Lee `_nifillos/_memory/company.md` y resume en una línea quién eres tú (proveedor) para contextualizar la propuesta.
2. Pide al usuario los siguientes datos (si falta algo, insiste hasta tener un mínimo viable):

   - **Cliente objetivo:** nombre de empresa o sector + tamaño aproximado.
   - **Dolor o oportunidad:** qué problema quieren resolver o qué resultado buscan (métrica o plazo si la hay).
   - **Oferta:** qué vendes (producto/servicio, módulos, alcance aproximado).
   - **Formato de decisión:** comité, budget holder, urgencia (fecha límite).
   - **Restricciones:** compliance, idioma final, «no mencionar» o competidores a evitar.
   - **Prueba social deseada:** casos, logos, cifras que el usuario autoriza a citar (si las hay).

3. Ofrece **rangos de inversión** solo si el usuario lo trae; no inventes presupuestos.

4. Si el proyecto es **multi-país o multi-idioma**, pregunta en qué idioma debe entregarse la propuesta final al cliente externo (puede diferir del de esta sesión).

5. Pregunta si existe **documentación previa** (RFP, correo de invitación, notas internas) que deba citarse o respetarse; si sí, pide pegar extractos clave o rutas de archivo bajo `cuadrillas/propuestas-b2b/` en «Notas libres».

## Formato de salida (checkpoint)

El Pipeline Runner guardará la respuesta consolidada en `brief-cliente.md`. Usa exactamente esta estructura al volcar el contenido:

```markdown
# Brief cliente — captura

**Fecha:** YYYY-MM-DD
**Proveedor (resumen):** ...

## Cliente
- Organización / sector:
- Contexto:

## Necesidad
- Dolor u oportunidad:
- Éxito medible (si existe):

## Alcance ofertado
- Qué se propone entregar (alto nivel):

## Decisión y plazo
- Quién decide / etapas:
- Urgencia o fecha límite:

## Restricciones y líneas rojas

## Evidencia permitida (casos, métricas, logos)

## Notas libres
```

## Criterios de calidad

- Sin suposiciones críticas sin etiquetar («pendiente confirmar»).
- Lenguaje claro; evita jerga interna del proveedor sin definirla.
- El bloque «Cliente» debe identificar **quién** (organización o segmento) y **en qué contexto** actúan, aunque sea provisional.

## Condiciones de veto (rehacer la captura)

1. El brief no identifica **al menos un** resultado de negocio o una necesidad concreta.
2. No está claro **qué se vende** o el alcance es tan vago que no permite estructurar una propuesta.

## Guía ante respuestas incompletas

- Si el usuario da solo el sector pero no el dolor, **sigue con preguntas abierta/cerrada** hasta obtener un problema redactable en una frase.
- Si la urgencia es «ASAP», pide una **fecha concreta o evento** que la explique (audiencia, cierre de trimestre, auditoría).
- Registra en «Notas libres» cualquier matiz que no encaje en las secciones estándar pero pueda influir en redacción (p. ej. sensibilidad política interna del cliente).

## Recordatorio al facilitador (runner / humano)

- Si el usuario ya pegó un brief largo en chat, **estructúralo** en las secciones del formato de salida sin pedir de nuevo lo que ya está implícito; marca solo lo que falte con «pendiente».
- Si hay **varias ofertas** posibles, elige la principal según la conversación o pregunta cuál priorizar antes de cerrar el checkpoint.

## Anti-patrones a evitar en la captura

- No **resume en una sola frase** dejando vacías las secciones estándar: cada encabezado del template debe tener contenido o «N/A» justificado brevemente.
- No aceptes como brief válido solo un **nombre de empresa** sin necesidad articulada: deriva una pregunta de dolor antes de cerrar.
