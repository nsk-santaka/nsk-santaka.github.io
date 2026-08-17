# Nario anketos generatoriai

Šie skriptai sugeneruoja `dokumentai/` aplanke esančią nario anketą. Tekstas
perrašytas iš klubo originalios skenuotos anketos, todėl PDF yra aiškus,
spausdinamas ir daug lengvesnis už skeną, o DOCX – redaguojamas.

Aplankas prasideda `_`, todėl Jekyll jo nepublikuoja – skriptai lieka git'e,
bet nepatenka į svetainę.

## Kaip perkurti dokumentus

DOCX (reikia Node.js):

```bash
cd dokumentai/_generatoriai
npm install docx
node make_anketa.js ../NSK-Santaka-nario-anketa.docx
```

PDF (reikia Python 3 ir Liberation Serif šriftų):

```bash
pip install reportlab
python3 make_anketa_pdf.py ../NSK-Santaka-nario-anketa.pdf
```

Abu skriptai naudoja tą patį išdėstymą: A4, 1 colio paraštės, laukų linijos
ties tomis pačiomis pozicijomis.
