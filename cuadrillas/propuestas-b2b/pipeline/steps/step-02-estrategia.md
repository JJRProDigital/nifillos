---
execution: subagent
agent: estratega-propuestas
inputFile: cuadrillas/propuestas-b2b/pipeline/data/brief-cliente.md
outputFile: cuadrillas/propuestas-b2b/output/marco-propuesta.md
model_tier: powerful
id: step-02-estrategia
---

# Paso 2: Marco de propuesta B2B

## Carga de contexto

Carga estos archivos antes de ejecutar:

- `cuadrillas/propuestas-b2b/pipeline/data/brief-cliente.md` — brief acordado con el usuario.
- `_nifillos/_memory/company.md` — propuesta de valor del proveedor, tono, mercados.
- `cuadrillas/propuestas-b2b/_memory/memories.md` — aprendizajes de ejecuciones previas (si hay).

## Instrucciones

### Proceso

1. **Sintetiza** el brief en 5 viñetas: contexto del cliente, dolor, impacto si no actúan, visión de éxito, restricciones.
2. **Enmarca la solución** en 3 capas: (a) diagnóstico breve, (b) enfoque recomendado, (c) entregables y fases de alto nivel (sin prometer fechas inventadas).
3. **Define el mensaje ganador**: una frase de valor + 3 pilares alineados con criterios de compra B2B (ROI, riesgo, tiempo, calidad, soporte).
4. **Mapa de riesgos y mitigaciones**: al menos 3 riesgos creíbles (adocición, datos, integración, gobernanza) con mitigación accionable.
5. **Próximo paso comercial**: CTA explícito (reunión, POC, propuesta económica aparte, etc.) sin inventar precios.

## Formato de salida

El archivo debe seguir **exactamente** esta jerarquía:

```markdown
# Marco de propuesta

## Resumen ejecutivo (10 líneas máx.)

## Entendimiento del cliente
### Contexto
### Problema / oportunidad
### Éxito deseado

## Propuesta de valor
### Mensaje principal
### Pilares (3)

## Enfoque y alcance
### Fases sugeridas
### Entregables por fase

## Riesgos y mitigaciones

## Diferenciación frente a alternativas (sin nombrar competidores a menos que el brief los cite)

## Próximos pasos sugeridos

## Supuestos y huecos (etiquetados)
```

## Ejemplo de referencia (fragmento)

```markdown
# Marco de propuesta

## Resumen ejecutivo (10 líneas máx.)
ACME Retail necesita unificar datos de inventario entre tienda y e-commerce para reducir roturas de stock. Proponemos un programa en dos fases: auditoría rápida de fuentes, luego integración gobernada con tableros ejecutivos. Valor: menos capital inmovilizado y mejor NPS logístico. Riesgo principal: calidad de datos legacy — mitigamos con reglas de validación y owner por dominio. Siguiente paso: workshop de 90 min con IT y Operaciones para cerrar alcance.

## Entendimiento del cliente
### Contexto
...
```

## Condiciones de veto

1. El marco **no incluye** secciones «Riesgos y mitigaciones» y «Supuestos y huecos».
2. Se afirman **cifras o plazos** sin venir del brief o sin etiqueta «pendiente validar».

## Criterios de calidad

- [ ] Cada pilar de valor enlaza con un dolor del brief.
- [ ] Lenguaje ejecutivo; oraciones cortas en resumen.
- [ ] No hay promesas legales ni garantías absolutas.
- [ ] «Próximos pasos sugeridos» incluye al menos una acción **del cliente** y una **del proveedor**.

## Ampliación si el brief es muy técnico

- Añade un sub-apartado **«Glosario mínimo (opcional)»** solo si el brief introduce términos críticos para la decisión (p. ej. normativa, arquitectura); máximo 5 entradas.

