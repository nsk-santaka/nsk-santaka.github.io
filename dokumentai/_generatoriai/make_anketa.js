const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Tab, AlignmentType, TabStopType, LeaderType,
} = require("docx");

const FONT = "Times New Roman";
const SIZE = 24; // 12pt (half-points)
const RIGHT = 9026; // content width in DXA with 1440 margins on A4

// A line: array of {text, tab} segments. `tab` = DXA position of the underscore
// leader stop that follows the label text.
function fieldLine(segments, opts = {}) {
  const children = [];
  const tabStops = [];
  segments.forEach((seg, i) => {
    if (seg.text) {
      children.push(new TextRun({ text: (i > 0 ? " " : "") + seg.text, font: FONT, size: SIZE }));
    }
    if (seg.tab) {
      tabStops.push({ type: TabStopType.LEFT, position: seg.tab, leader: LeaderType.UNDERSCORE });
      children.push(new TextRun({ children: [new Tab()], font: FONT, size: SIZE }));
    }
  });
  return new Paragraph({
    children,
    tabStops,
    spacing: { before: 0, after: opts.after === undefined ? 260 : opts.after },
  });
}

function text(str, opts = {}) {
  return new Paragraph({
    alignment: opts.align,
    spacing: { before: opts.before || 0, after: opts.after === undefined ? 260 : opts.after },
    children: [new TextRun({
      text: str,
      font: FONT,
      size: opts.size || SIZE,
      bold: opts.bold,
      allCaps: opts.caps,
    })],
  });
}

const doc = new Document({
  creator: "Kauno krašto neįgaliųjų integracijos ir sporto klubas „Santaka“",
  title: "NSK Santaka – nario anketa",
  description: "Kauno krašto neįgaliųjų integracijos ir sporto klubo „Santaka“ nario anketa",
  sections: [{
    properties: {
      page: { margin: { top: 1134, right: 1440, bottom: 1134, left: 1440 } },
    },
    children: [
      text("KAUNO KRAŠTO NEĮGALIŲJŲ INTEGRACIJOS IR SPORTO KLUBAS", {
        align: AlignmentType.CENTER, bold: true, after: 0,
      }),
      text("„SANTAKA“", { align: AlignmentType.CENTER, bold: true, after: 400 }),
      text("ANKETA", { align: AlignmentType.CENTER, bold: true, size: 28, after: 600 }),

      fieldLine([{ tab: RIGHT }], { after: 0 }),
      text("(pavardė, vardas)", { align: AlignmentType.CENTER, size: 20, after: 320 }),

      fieldLine([{ text: "Neįgalumo pažymėjimo Nr.", tab: RIGHT }]),
      fieldLine([
        { text: "Gimimo data", tab: 3300 },
        { text: "Adresas", tab: RIGHT },
      ]),
      fieldLine([
        { text: "Tel. namų", tab: 4200 },
        { text: "Darbo", tab: RIGHT },
      ]),
      fieldLine([
        { text: "Neįgalumo proc. arba spec. poreikiai", tab: 4900 },
        { text: "Priežastis", tab: RIGHT },
      ]),
      text("Judėjimo būdas:     su lazda,     ramentais,     vežimėliu     (pabraukti)"),
      fieldLine([{ text: "Darbovietė ir pareigos", tab: RIGHT }]),

      text("Sporto šaka, kurią kultivavote prieš įgyjant neįgalumą ir kurią kultivuojate dabar", { after: 160 }),
      fieldLine([{ tab: RIGHT }]),

      fieldLine([
        { text: "Išsilavinimas", tab: 4900 },
        { text: "Šeimos padėtis", tab: RIGHT },
      ]),
      fieldLine([{ text: "Šeimos nariai norintys sportuoti", tab: RIGHT }]),

      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 260 },
        children: [new TextRun({
          text: "Kokiose sporto šakose norite sportuoti:  disko ir ieties metimas, rutulio stūmimas, "
            + "baudų metimas į krepšį, sėdimas tinklinis, šaškės, šachmatai, vežimėlių krepšinis, "
            + "plaukimas, badmintonas, stalo tenisas, bočia, orientavimosi sportas, šaudymas, žvejyba. "
            + "(norimas kultivuoti sporto šakas pabraukti)",
          font: FONT, size: SIZE,
        })],
      }),

      fieldLine([{ text: "Hobiai", tab: RIGHT }]),
      fieldLine([{ text: "Kokiose sekcijose norėtumėte dalyvauti (be sporto)", tab: RIGHT }]),
      fieldLine([{ tab: RIGHT }]),
      fieldLine([{ text: "Vairuotojo pažymėjimas (taip/ne) ir kategorija", tab: RIGHT }], { after: 500 }),

      fieldLine([
        { text: "Data", tab: 3800 },
        { text: "Parašas", tab: RIGHT },
      ]),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(process.argv[2] || "NSK-Santaka-nario-anketa.docx", buf);
  console.log("written");
});
