"""Generate a clean, printable PDF of the NSK Santaka membership form.

Mirrors the layout of the .docx version (same A4 page, margins and field-line
positions), retyped from the club's original scanned form.
"""
import sys

from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

FONT_DIR = "/usr/share/fonts/truetype/liberation"
pdfmetrics.registerFont(TTFont("Serif", f"{FONT_DIR}/LiberationSerif-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Serif-Bold", f"{FONT_DIR}/LiberationSerif-Bold.ttf"))

PAGE_W, PAGE_H = A4
LEFT = 72          # 1 inch
RIGHT = PAGE_W - 72
SIZE = 12
LINE_DROP = 3      # baseline offset of the fill-in rule


class Form:
    def __init__(self, c):
        self.c = c
        self.y = PAGE_H - 60

    def down(self, amount):
        self.y -= amount

    def centered(self, txt, size=SIZE, bold=False, gap=13):
        self.c.setFont("Serif-Bold" if bold else "Serif", size)
        self.c.drawCentredString(PAGE_W / 2, self.y, txt)
        self.down(gap)

    def rule(self, x_from, x_to):
        self.c.setLineWidth(0.6)
        self.c.line(x_from, self.y - LINE_DROP, x_to, self.y - LINE_DROP)

    def field(self, segments, gap=26):
        """segments: list of (label, x_end). An empty label = rule only."""
        self.c.setFont("Serif", SIZE)
        x = LEFT
        for label, x_end in segments:
            if label:
                self.c.drawString(x, self.y, label)
                x += self.c.stringWidth(label, "Serif", SIZE) + 6
            self.rule(x, x_end)
            x = x_end + 12
        self.down(gap)

    def paragraph(self, txt, gap=26, leading=15):
        self.c.setFont("Serif", SIZE)
        words, line = txt.split(), ""
        for w in words:
            trial = f"{line} {w}".strip()
            if self.c.stringWidth(trial, "Serif", SIZE) > RIGHT - LEFT:
                self.c.drawString(LEFT, self.y, line)
                self.down(leading)
                line = w
            else:
                line = trial
        if line:
            self.c.drawString(LEFT, self.y, line)
        self.down(gap)


def build(path):
    c = canvas.Canvas(path, pagesize=A4)
    c.setTitle("NSK Santaka – nario anketa")
    c.setAuthor("Kauno krašto neįgaliųjų integracijos ir sporto klubas „Santaka“")
    c.setSubject("Nario anketa")

    f = Form(c)
    f.centered("KAUNO KRAŠTO NEĮGALIŲJŲ INTEGRACIJOS IR SPORTO KLUBAS", bold=True, gap=17)
    f.centered("„SANTAKA“", bold=True, gap=42)
    f.centered("ANKETA", size=14, bold=True, gap=52)

    f.field([("", RIGHT)], gap=13)
    f.centered("(pavardė, vardas)", size=10, gap=30)

    f.field([("Neįgalumo pažymėjimo Nr.", RIGHT)])
    f.field([("Gimimo data", LEFT + 165), ("Adresas", RIGHT)])
    f.field([("Tel. namų", LEFT + 210), ("Darbo", RIGHT)])
    f.field([("Neįgalumo proc. arba spec. poreikiai", LEFT + 245), ("Priežastis", RIGHT)])

    c.setFont("Serif", SIZE)
    c.drawString(LEFT, f.y, "Judėjimo būdas:     su lazda,     ramentais,     vežimėliu     (pabraukti)")
    f.down(26)

    f.field([("Darbovietė ir pareigos", RIGHT)])

    f.paragraph("Sporto šaka, kurią kultivavote prieš įgyjant neįgalumą ir kurią kultivuojate dabar", gap=22)
    f.field([("", RIGHT)])

    f.field([("Išsilavinimas", LEFT + 245), ("Šeimos padėtis", RIGHT)])
    f.field([("Šeimos nariai norintys sportuoti", RIGHT)])

    f.paragraph(
        "Kokiose sporto šakose norite sportuoti:  disko ir ieties metimas, rutulio stūmimas, "
        "baudų metimas į krepšį, sėdimas tinklinis, šaškės, šachmatai, vežimėlių krepšinis, "
        "plaukimas, badmintonas, stalo tenisas, bočia, orientavimosi sportas, šaudymas, žvejyba. "
        "(norimas kultivuoti sporto šakas pabraukti)"
    )

    f.field([("Hobiai", RIGHT)])
    f.field([("Kokiose sekcijose norėtumėte dalyvauti (be sporto)", RIGHT)])
    f.field([("", RIGHT)], gap=34)
    f.field([("Vairuotojo pažymėjimas (taip/ne) ir kategorija", RIGHT)], gap=48)

    f.field([("Data", LEFT + 190), ("Parašas", RIGHT)])

    c.showPage()
    c.save()


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else "NSK-Santaka-nario-anketa.pdf")
