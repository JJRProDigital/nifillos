# Nifillos

Crea cuadrillas de agentes de IA que trabajan juntos, directamente desde tu IDE.

## Cómo usar

Abre esta carpeta en tu IDE y escribe:

```
/nifillos
```

Se abre el menú principal. Desde ahí puedes crear cuadrillas, ejecutarlas y más.

También puedes ir al grano: describe lo que necesitas en lenguaje natural:

```
/nifillos crea una cuadrilla para escribir posts en LinkedIn sobre IA
/nifillos ejecuta la cuadrilla mi-cuadrilla
```

## Crear una cuadrilla

Escribe `/nifillos` y elige «Crear cuadrilla» en el menú, o di directamente:

```
/nifillos crea una cuadrilla para [lo que necesites]
```

El Arquitecto hará algunas preguntas, diseñará la cuadrilla y configurará todo automáticamente.

## Ejecutar una cuadrilla

Escribe `/nifillos` y elige «Ejecutar cuadrilla» en el menú, o di directamente:

```
/nifillos ejecuta la cuadrilla <nombre-de-la-cuadrilla>
```

La cuadrilla se ejecuta automáticamente y solo se detiene en los puntos de decisión (checkpoints).

## Oficina virtual

La Oficina virtual es una interfaz visual 2D que muestra a tus agentes trabajando en tiempo real.

**Paso 1 — Genera el dashboard** (en tu IDE):

```
/nifillos dashboard
```

**Paso 2 — Sírvelo en local** (en la terminal):

```bash
npx serve cuadrillas/<nombre-de-la-cuadrilla>/dashboard
```

**Paso 3 —** Abre `http://localhost:3000` en tu navegador.

---

# Nifillos (English)

Create AI agent **cuadrillas** (teams) that work together — right from your IDE.

## How to Use

Open this folder in your IDE and type:

```
/nifillos
```

This opens the main menu. From there you can create cuadrillas, run them, and more.

You can also be direct — describe what you want in plain language:

```
/nifillos create a cuadrilla for writing LinkedIn posts about AI
/nifillos run my-cuadrilla
```

## Create a Cuadrilla

Type `/nifillos` and choose "Create cuadrilla" from the menu, or be direct:

```
/nifillos create a cuadrilla for [what you need]
```

The Architect will ask a few questions, design the cuadrilla, and set everything up automatically.

## Run a Cuadrilla

Type `/nifillos` and choose "Run cuadrilla" from the menu, or be direct:

```
/nifillos run the <cuadrilla-name> cuadrilla
```

The cuadrilla runs automatically, pausing only at decision checkpoints.

## Virtual Office

The Virtual Office is a 2D visual interface that shows your agents working in real time.

**Step 1 — Generate the dashboard** (in your IDE):

```
/nifillos dashboard
```

**Step 2 — Serve it locally** (in terminal):

```bash
npx serve cuadrillas/<cuadrilla-name>/dashboard
```

**Step 3 —** Open `http://localhost:3000` in your browser.
