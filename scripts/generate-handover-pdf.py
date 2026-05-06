#!/usr/bin/env python3
"""
Generate the artist's handover PDF (European Portuguese).
Run from repo root: python3 scripts/generate-handover-pdf.py
Output: docs/manual-site-dalia-cordeiro.pdf
"""

from pathlib import Path
from datetime import date

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame,
    Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether,
    Flowable,
)
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ───────────────────────── Brand palette ─────────────────────────
PAPER     = colors.HexColor('#efe7d6')
PAPER2    = colors.HexColor('#e8decb')
INK       = colors.HexColor('#1f1b16')
INK_SOFT  = colors.HexColor('#4a4238')
MUTED     = colors.HexColor('#8a7f6e')
ACCENT    = colors.HexColor('#b84e3a')
LINE      = colors.HexColor('#d3c8b4')
SAGE      = colors.HexColor('#6d8a66')

SERIF       = 'Times-Roman'
SERIF_BOLD  = 'Times-Bold'
SERIF_IT    = 'Times-Italic'
SERIF_BI    = 'Times-BoldItalic'
SANS        = 'Helvetica'
SANS_BOLD   = 'Helvetica-Bold'
MONO        = 'Courier'

# ───────────────────────── Styles ────────────────────────────────
S = {
    'cover_eyebrow':  ParagraphStyle('cover_eyebrow', fontName=SANS_BOLD, fontSize=10, leading=12, textColor=ACCENT, alignment=TA_LEFT),
    'cover_title':    ParagraphStyle('cover_title',  fontName=SERIF, fontSize=46, leading=48, textColor=INK, alignment=TA_LEFT, spaceAfter=4),
    'cover_title_em': ParagraphStyle('cover_title_em', fontName=SERIF_IT, fontSize=46, leading=48, textColor=ACCENT, alignment=TA_LEFT),
    'cover_sub':      ParagraphStyle('cover_sub', fontName=SERIF_IT, fontSize=18, leading=24, textColor=INK_SOFT, alignment=TA_LEFT, spaceAfter=18),
    'cover_meta':     ParagraphStyle('cover_meta', fontName=SANS, fontSize=10, leading=14, textColor=MUTED),
    'h1':             ParagraphStyle('h1', fontName=SERIF, fontSize=28, leading=32, textColor=INK, spaceBefore=18, spaceAfter=18),
    'h1_em':          ParagraphStyle('h1_em', fontName=SERIF_IT, fontSize=28, leading=32, textColor=ACCENT),
    'h2':             ParagraphStyle('h2', fontName=SERIF_BOLD, fontSize=15, leading=20, textColor=INK, spaceBefore=14, spaceAfter=6),
    'h3':             ParagraphStyle('h3', fontName=SANS_BOLD, fontSize=10, leading=14, textColor=ACCENT, spaceBefore=10, spaceAfter=4),
    'body':           ParagraphStyle('body', fontName=SERIF, fontSize=10.5, leading=15.5, textColor=INK_SOFT, alignment=TA_JUSTIFY, spaceAfter=8),
    'body_l':         ParagraphStyle('body_l', fontName=SERIF, fontSize=10.5, leading=15.5, textColor=INK_SOFT, alignment=TA_LEFT, spaceAfter=8),
    'lead':           ParagraphStyle('lead', fontName=SERIF_IT, fontSize=12, leading=18, textColor=INK, alignment=TA_LEFT, spaceAfter=12),
    'callout':        ParagraphStyle('callout', fontName=SERIF, fontSize=10.5, leading=15, textColor=INK, alignment=TA_LEFT,
                                     backColor=PAPER2, borderColor=LINE, borderWidth=0, borderPadding=10,
                                     leftIndent=0, rightIndent=0, spaceAfter=10, spaceBefore=4),
    'small':          ParagraphStyle('small', fontName=SANS, fontSize=8, leading=11, textColor=MUTED),
    'mono':           ParagraphStyle('mono', fontName=MONO, fontSize=9, leading=12, textColor=INK),
    'footer':         ParagraphStyle('footer', fontName=SERIF_IT, fontSize=8.5, leading=11, textColor=MUTED, alignment=TA_LEFT),
    'page_no':        ParagraphStyle('page_no', fontName=SANS, fontSize=8.5, leading=11, textColor=MUTED, alignment=TA_LEFT),
    'tbl_header':     ParagraphStyle('tbl_header', fontName=SANS_BOLD, fontSize=8.5, leading=11, textColor=INK, alignment=TA_LEFT),
    'tbl_cell':       ParagraphStyle('tbl_cell', fontName=SERIF, fontSize=10, leading=14, textColor=INK_SOFT, alignment=TA_LEFT),
    'tbl_cell_b':     ParagraphStyle('tbl_cell_b', fontName=SERIF_BOLD, fontSize=10, leading=14, textColor=INK, alignment=TA_LEFT),
}

# ───────────────────────── Helpers ───────────────────────────────
def p(text, style='body'):
    return Paragraph(text, S[style])

def h1(text):
    return Paragraph(text, S['h1'])

def h2(text):
    return Paragraph(text, S['h2'])

def h3(text):
    return Paragraph(text, S['h3'])

def hr(width_mm=170):
    line = Drawing(width_mm * mm, 1)
    line.add(Line(0, 0, width_mm * mm, 0, strokeColor=LINE, strokeWidth=0.6))
    return line

def hr_accent(width_mm=40):
    line = Drawing(width_mm * mm, 2)
    line.add(Line(0, 0, width_mm * mm, 0, strokeColor=ACCENT, strokeWidth=2))
    return line

def callout(text):
    return Paragraph(text, S['callout'])

# ───────────────────────── Architecture diagrams ─────────────────
def box(d, x, y, w, h, label, sub=None, bg=PAPER2, border=ACCENT, font_size=9):
    d.add(Rect(x, y, w, h, rx=4, ry=4, fillColor=bg, strokeColor=border, strokeWidth=1.2))
    d.add(String(x + w/2, y + h/2 + (3 if sub else -2), label, fontName=SANS_BOLD, fontSize=font_size, fillColor=INK, textAnchor='middle'))
    if sub:
        d.add(String(x + w/2, y + h/2 - 8, sub, fontName=SERIF_IT, fontSize=8, fillColor=MUTED, textAnchor='middle'))

def arrow(d, x1, y1, x2, y2, label=None, label_offset=(0, 6)):
    d.add(Line(x1, y1, x2, y2, strokeColor=INK_SOFT, strokeWidth=1.0))
    # arrowhead
    import math
    angle = math.atan2(y2 - y1, x2 - x1)
    head_len = 7
    head_w = 4
    p1 = (x2, y2)
    p2 = (x2 - head_len * math.cos(angle) + head_w * math.sin(angle),
          y2 - head_len * math.sin(angle) - head_w * math.cos(angle))
    p3 = (x2 - head_len * math.cos(angle) - head_w * math.sin(angle),
          y2 - head_len * math.sin(angle) + head_w * math.cos(angle))
    d.add(Polygon([p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]], fillColor=INK_SOFT, strokeColor=INK_SOFT))
    if label:
        mx = (x1 + x2) / 2 + label_offset[0]
        my = (y1 + y2) / 2 + label_offset[1]
        d.add(String(mx, my, label, fontName=SERIF_IT, fontSize=8, fillColor=ACCENT, textAnchor='middle'))


def diagram_main_flow():
    """Artist edits → Site updates flow."""
    W, H = 480, 320
    d = Drawing(W, H)

    # Top: artist
    box(d, 175, 270, 130, 36, 'A ARTISTA', 'Dália Cordeiro', bg=PAPER, border=ACCENT, font_size=10)
    arrow(d, 240, 270, 240, 232, label='abre / faz login')

    # Sanity Studio
    box(d, 130, 190, 220, 40, 'SANITY STUDIO', 'daliacordeiro.sanity.studio  —  edita aqui')
    arrow(d, 240, 190, 240, 152, label='clica  Publish')

    # Sanity datacenter (storage)
    box(d, 50, 110, 180, 38, 'SANITY (data)', 'guarda o conteúdo')
    # Cloudflare Pages
    box(d, 270, 110, 180, 38, 'CLOUDFLARE PAGES', 'constrói e serve o site')

    # Sanity → CF Pages webhook
    arrow(d, 230, 129, 270, 129, label='webhook')

    # GitHub
    box(d, 270, 50, 180, 36, 'GITHUB', 'código-fonte (template visual)')
    arrow(d, 360, 86, 360, 110, label='lê código', label_offset=(20, 0))

    # Site publicado
    box(d, 130, 0, 220, 36, 'SITE PUBLICADO', 'daliacordeiroart.com   ·   visitantes', bg=PAPER, border=ACCENT, font_size=10)
    arrow(d, 320, 110, 270, 36, label='HTML pronto', label_offset=(0, 8))

    return d


def diagram_inquiry_flow():
    """Visitor → inquiry → artist mailbox flow."""
    W, H = 480, 220
    d = Drawing(W, H)

    box(d, 30, 170, 160, 36, 'VISITANTE', 'no site, vê uma obra')
    arrow(d, 110, 170, 110, 132, label='clica "Pedir info"')

    box(d, 30, 90, 160, 38, 'FORMULÁRIO DO SITE', 'daliacordeiroart.com / contacto')
    arrow(d, 190, 109, 290, 109, label='envia (HTTPS)')

    box(d, 290, 90, 160, 38, 'WEB3FORMS', 'serviço que reencaminha')
    arrow(d, 370, 90, 370, 50, label='email')

    box(d, 290, 12, 160, 38, 'OUTLOOK DA ARTISTA', 'recebe pedido, responde', bg=PAPER, border=ACCENT)

    return d


# ───────────────────────── Page chrome ───────────────────────────
class Background:
    def __init__(self, cover=False):
        self.cover = cover

    def __call__(self, canvas, doc):
        canvas.saveState()
        # Page background
        canvas.setFillColor(PAPER)
        canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)

        if self.cover:
            # left coral bar
            canvas.setFillColor(ACCENT)
            canvas.rect(0, 0, 18 * mm, A4[1], fill=1, stroke=0)
        else:
            # Header rule
            canvas.setStrokeColor(LINE)
            canvas.setLineWidth(0.4)
            canvas.line(20 * mm, A4[1] - 16 * mm, A4[0] - 20 * mm, A4[1] - 16 * mm)
            # Header text
            canvas.setFont(SERIF_IT, 9)
            canvas.setFillColor(MUTED)
            canvas.drawString(20 * mm, A4[1] - 12 * mm, 'Manual do Site  ·  Dália Cordeiro')
            canvas.drawRightString(A4[0] - 20 * mm, A4[1] - 12 * mm, 'daliacordeiroart.com')

            # Footer
            canvas.line(20 * mm, 16 * mm, A4[0] - 20 * mm, 16 * mm)
            canvas.setFont(SANS, 8)
            canvas.setFillColor(MUTED)
            canvas.drawString(20 * mm, 11 * mm, 'maio  ·  2026')
            canvas.drawRightString(A4[0] - 20 * mm, 11 * mm, str(canvas.getPageNumber()))
        canvas.restoreState()


# ───────────────────────── Document body ─────────────────────────
def build():
    out_path = Path(__file__).resolve().parent.parent / 'docs' / 'manual-site-dalia-cordeiro.pdf'
    out_path.parent.mkdir(parents=True, exist_ok=True)

    doc = BaseDocTemplate(
        str(out_path),
        pagesize=A4,
        leftMargin=22 * mm, rightMargin=22 * mm,
        topMargin=22 * mm, bottomMargin=22 * mm,
        title='Manual do Site — Dália Cordeiro',
        author='Andre Ribeiro',
        subject='Documento de entrega do site daliacordeiroart.com',
    )

    cover_frame = Frame(22 * mm, 22 * mm, A4[0] - 44 * mm, A4[1] - 44 * mm,
                        leftPadding=20 * mm, rightPadding=0, topPadding=80 * mm, bottomPadding=0,
                        showBoundary=0)
    body_frame = Frame(22 * mm, 22 * mm, A4[0] - 44 * mm, A4[1] - 44 * mm,
                       leftPadding=0, rightPadding=0, topPadding=10 * mm, bottomPadding=10 * mm,
                       showBoundary=0)

    doc.addPageTemplates([
        PageTemplate(id='cover', frames=[cover_frame], onPage=Background(cover=True)),
        PageTemplate(id='body',  frames=[body_frame],  onPage=Background(cover=False)),
    ])

    story = []

    # ───── COVER ─────
    story.append(Paragraph('MANUAL DO SITE', S['cover_eyebrow']))
    story.append(Spacer(1, 14))
    story.append(Paragraph('<i>daliacordeiro.</i><font color="#b84e3a"><i>art</i></font>', S['cover_title']))
    story.append(Spacer(1, 6))
    story.append(Paragraph('Guia para a artista — o que existe, como editar, quanto custa.', S['cover_sub']))
    story.append(hr_accent(40))
    story.append(Spacer(1, 14))
    story.append(Paragraph(
        'Preparado para Dália Cordeiro<br/>'
        'Maio de 2026<br/><br/>'
        'Domínio público:&nbsp;&nbsp;<font color="#1f1b16"><b>daliacordeiroart.com</b></font><br/>'
        'Painel de edição:&nbsp;&nbsp;<font color="#1f1b16"><b>daliacordeiro.sanity.studio</b></font>',
        S['cover_meta']))
    story.append(Spacer(1, 30))
    story.append(Paragraph(
        '<i>&ldquo;Cada figura é um país com o seu próprio tempo, as suas fronteiras, '
        'as suas pequenas revoluções.&rdquo;</i>',
        S['cover_meta']))
    story.append(Paragraph('— frase de abertura do site', S['cover_meta']))

    story.append(PageBreak())

    # Switch to body template for the rest
    from reportlab.platypus import NextPageTemplate
    # The first page already used 'cover'; subsequent pages use 'body' by default (next in list)
    # but we need to ensure this — push a NextPageTemplate before content begins
    # (NextPageTemplate inserted at top of remaining story)

    # ───── ÍNDICE ─────
    story.append(h1('<font face="Times-Italic" color="#b84e3a">Índice</font>'))
    toc_items = [
        ('1.  Visão geral',                                'pág. 3'),
        ('2.  Arquitetura — como o site funciona',         'pág. 4'),
        ('3.  Como editar o site (autonomia total)',       'pág. 6'),
        ('4.  Boas práticas de SEO já aplicadas',          'pág. 10'),
        ('5.  Custos do projeto',                          'pág. 11'),
        ('6.  Direitos de autor e proteção contra IA',     'pág. 12'),
        ('7.  Manutenção, backups e contactos',            'pág. 14'),
    ]
    toc_data = [[Paragraph(t, S['body_l']), Paragraph(p_, S['small'])] for (t, p_) in toc_items]
    toc = Table(toc_data, colWidths=[140 * mm, 25 * mm])
    toc.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LINEBELOW', (0, 0), (-1, -2), 0.4, LINE),
        ('TEXTCOLOR', (1, 0), (1, -1), MUTED),
    ]))
    story.append(toc)
    story.append(PageBreak())

    # ───── 1. VISÃO GERAL ─────
    story.append(h1('1.  <font face="Times-Italic" color="#b84e3a">Visão geral</font>'))
    story.append(Paragraph(
        'Este documento descreve o site <b>daliacordeiroart.com</b> — o portfólio digital da '
        'artista Dália Cordeiro. O site foi desenhado para que a artista possa editar todo '
        'o conteúdo de forma autónoma, sem precisar de saber programar ou usar terminal.',
        S['body']))
    story.append(Paragraph(
        'O site existe em duas línguas (português e inglês) e tem cinco zonas principais: '
        'a página inicial com a obra em destaque, a galeria de obras filtrável por série, '
        'a página &ldquo;Sobre&rdquo; com biografia e bibliografia, a página de contacto com formulário, '
        'e os termos legais. A versão inglesa é a primeira a ser apresentada por defeito; '
        'visitantes com browsers em português caem automaticamente na versão portuguesa.',
        S['body']))

    story.append(h2('Endereços importantes'))
    addrs = [
        ['Site público',       'https://daliacordeiroart.com'],
        ['Painel de edição',   'https://daliacordeiro.sanity.studio'],
        ['Email da artista',   'studio@daliacordeiroart.com'],
        ['Instagram',          'https://www.instagram.com/dalia_cordeiro_art/'],
        ['Repositório',        'github.com/andregribeiro/dalia-cordeiro-site'],
        ['Termos / direitos',  'https://daliacordeiroart.com/pt/termos'],
    ]
    addr_table = Table(
        [[Paragraph(k, S['tbl_cell_b']), Paragraph(v, S['mono'])] for k, v in addrs],
        colWidths=[40 * mm, 125 * mm])
    addr_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PAPER2),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 9),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('LINEBELOW', (0, 0), (-1, -2), 0.4, PAPER),
    ]))
    story.append(addr_table)

    story.append(Spacer(1, 12))
    story.append(callout(
        '<b>Em uma frase:</b> a artista edita no painel <i>Sanity Studio</i>, clica «Publish», '
        'e em 1–2 minutos o site público é reconstruído automaticamente. Não há ficheiros, '
        'não há terminais, não há servidores para gerir.'))

    story.append(PageBreak())

    # ───── 2. ARQUITETURA ─────
    story.append(h1('2.  Arquitetura — <font face="Times-Italic" color="#b84e3a">como funciona</font>'))
    story.append(Paragraph(
        'O site é composto por cinco peças que comunicam entre si. A artista interage '
        'apenas com duas: a sua conta de email (<b>Outlook</b>) e o painel <b>Sanity Studio</b>. '
        'O resto acontece automaticamente.',
        S['body']))

    story.append(h2('Fluxo principal — quando a artista edita conteúdo'))
    story.append(diagram_main_flow())
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        '<b>1.</b> A artista faz login em <i>daliacordeiro.sanity.studio</i> com a sua conta Outlook. '
        '<b>2.</b> Edita o conteúdo num painel visual e clica «Publish». '
        '<b>3.</b> O Sanity guarda o conteúdo e dispara um aviso (<i>webhook</i>) para a Cloudflare. '
        '<b>4.</b> A Cloudflare Pages lê o conteúdo do Sanity e o código do GitHub, e gera as páginas '
        'HTML estáticas. <b>5.</b> Em 1–2 minutos, o site público é atualizado para todos os visitantes.',
        S['body_l']))

    story.append(Spacer(1, 14))
    story.append(h2('Fluxo de pedido de informação — quando um visitante quer comprar uma obra'))
    story.append(diagram_inquiry_flow())
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Quando um visitante clica «Pedir informação» numa obra e preenche o formulário, '
        'o serviço <b>Web3Forms</b> recebe a mensagem e reencaminha-a por email para a conta '
        'Outlook da artista. A artista responde diretamente do seu Outlook — o site é apenas '
        'a porta de entrada.',
        S['body']))

    story.append(PageBreak())

    story.append(h2('O que cada peça faz'))

    pieces = [
        ('Outlook (email)',
         'A conta <b>studio@daliacordeiroart.com</b> é a chave. Serve para o login no Sanity, '
         'na Cloudflare e no GitHub, e é onde aterram os pedidos dos visitantes do site.'),
        ('Sanity Studio',
         'Painel web de edição (<i>CMS</i>). É aqui que se cria, edita e publica obras, séries, '
         'biografia, eventos e tudo o mais. Funciona em qualquer browser, sem instalar nada.'),
        ('Sanity (datacenter)',
         'Onde o conteúdo fica guardado. Há backups automáticos e histórico de versões — '
         'qualquer alteração pode ser revertida se for preciso.'),
        ('GitHub',
         'Onde vive o código que dá forma ao site (cores, tipos de letra, layout). A artista '
         'nunca toca aqui — só o programador, em raras alterações de design.'),
        ('Cloudflare Pages',
         'Constrói o site a partir do código (GitHub) e do conteúdo (Sanity), e depois '
         'distribui-o por servidores espalhados pelo mundo. É também o que torna o site rápido.'),
        ('Web3Forms',
         'Pequeno serviço que recebe o formulário de contacto do site e envia-o por email. '
         'Plano gratuito até 250 mensagens por mês.'),
    ]
    piece_data = [[Paragraph(name, S['tbl_cell_b']), Paragraph(desc, S['tbl_cell'])] for name, desc in pieces]
    piece_table = Table(piece_data, colWidths=[40 * mm, 125 * mm])
    piece_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 9),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('LINEBELOW', (0, 0), (-1, -2), 0.3, LINE),
    ]))
    story.append(piece_table)

    story.append(PageBreak())

    # ───── 3. COMO EDITAR ─────
    story.append(h1('3.  Como editar o site — <font face="Times-Italic" color="#b84e3a">autonomia total</font>'))
    story.append(Paragraph(
        'Tudo o que se segue acontece em <b>daliacordeiro.sanity.studio</b>. '
        'Abrir o link no browser, fazer login com a conta Outlook (mesma de sempre), '
        'e fica-se no painel de edição. À esquerda há uma lista com todas as zonas editáveis.',
        S['body']))

    story.append(h2('3.1  Adicionar uma obra'))
    story.append(Paragraph(
        '<b>Obras</b> → botão <b>+ Create</b> no canto superior direito. '
        'Para cada obra preenche-se: ',
        S['body_l']))
    story.append(Paragraph(
        '<b>Código (referência):</b> identificador curto e único que serve para os clientes '
        'citarem a obra em emails (ex: <font face="Courier">M-001</font>, <font face="Courier">B-003</font>). '
        'A convenção atual é a primeira letra da série mais um número de três dígitos.<br/><br/>'
        '<b>Série:</b> escolher a série a que a obra pertence (Metamorphoses, Bestiary, etc.). '
        'A técnica e descrição vêm automaticamente da série, a não ser que se queira que esta '
        'obra seja diferente.<br/><br/>'
        '<b>Imagem principal:</b> arrastar o ficheiro para a caixa, ou clicar para escolher. '
        'É possível arrastar o ponto verde para escolher o ponto focal (importante quando '
        'a imagem é cortada para versões pequenas).<br/><br/>'
        '<b>Imagens adicionais:</b> opcional, para mostrar detalhes ou várias vistas.<br/><br/>'
        '<b>Ano:</b> ano em que a obra foi feita.<br/><br/>'
        '<b>Dimensões:</b> em centímetros e em polegadas (ex: <font face="Courier">150 × 120 cm</font>).<br/><br/>'
        '<b>Técnica (substitui a série):</b> deixar vazio na maioria dos casos. Só preencher '
        'se esta obra usa uma técnica diferente do resto da série.<br/><br/>'
        '<b>Descrição (substitui a série):</b> idem — só se a obra precisar de uma descrição própria.<br/><br/>'
        '<b>Estado:</b> Disponível, Vendida, Reservada, Não à venda. O ponto colorido '
        'no site muda conforme.<br/><br/>'
        '<b>Ordem de exibição:</b> número que controla a ordem em que as obras aparecem na '
        'galeria. Pode-se reordenar arrastando ou trocando este número (mais baixo = aparece primeiro).',
        S['body_l']))

    story.append(callout(
        '<b>Importante:</b> nada é publicado até clicar <b>Publish</b> (canto inferior direito). '
        'Antes de Publish, fica em rascunho — pode-se sair, voltar mais tarde e continuar.'))

    story.append(PageBreak())

    story.append(h2('3.2  Criar / editar uma série'))
    story.append(Paragraph(
        '<b>Série</b> → escolher uma das existentes ou clicar <b>+ Create</b>. Cada série tem:',
        S['body_l']))
    story.append(Paragraph(
        '<b>Chave:</b> identificador curto, sem espaços nem acentos (ex: <font face="Courier">metamorphoses</font>). '
        'Não muda depois de criada.<br/><br/>'
        '<b>Nome da série:</b> nome bonito (PT e EN). É o que aparece no site.<br/><br/>'
        '<b>Técnica padrão:</b> usada por defeito por todas as obras desta série. Preenche-se '
        'aqui uma vez e poupa repetir em cada obra.<br/><br/>'
        '<b>Descrição da série:</b> texto que descreve a série como um todo. Pode-se sempre '
        'escrever uma descrição diferente numa obra específica se for preciso.<br/><br/>'
        '<b>Ordem de exibição:</b> controla a ordem dos filtros de série na galeria.',
        S['body_l']))

    story.append(h2('3.3  Editar a página &ldquo;Sobre&rdquo;'))
    story.append(Paragraph(
        '<b>Sobre</b> (na lista lateral) → tem um único documento que controla toda a página.',
        S['body_l']))
    story.append(Paragraph(
        '<b>Retrato:</b> a fotografia da artista que aparece à esquerda na página &ldquo;Sobre&rdquo;.<br/><br/>'
        '<b>Biografia curta:</b> usado em metadados (ex: descrição que aparece quando o link '
        'é partilhado em redes sociais). Curto, 1–2 frases.<br/><br/>'
        '<b>Biografia completa:</b> o texto longo que aparece na página. Suporta parágrafos '
        'múltiplos. Há separadores PT / EN para escrever as duas versões.<br/><br/>'
        '<b>Estatísticas:</b> os três blocos pequenos com factos rápidos (ex: «Nascida em ·  Barreiro, 1955»).<br/><br/>'
        '<b>Bibliografia:</b> lista de projetos, publicações ou contextos em que a artista esteve '
        'envolvida. Para cada entrada: ano, título, descrição opcional e link opcional.',
        S['body_l']))

    story.append(h2('3.4  Definições do Site'))
    story.append(Paragraph(
        '<b>Definições do Site</b> (na lista lateral) → controla o cabeçalho, rodapé, hero e contactos.',
        S['body_l']))
    story.append(Paragraph(
        '<b>Frase principal (hero):</b> a frase grande na homepage. Pode usar <i>itálico em coral</i> '
        'envolvendo palavras com <font face="Courier">&lt;em&gt;palavra&lt;/em&gt;</font>.<br/><br/>'
        '<b>Parágrafo de introdução (hero):</b> texto curto sob a frase principal.<br/><br/>'
        '<b>Obra destacada (hero):</b> a obra que aparece em grande na homepage.<br/><br/>'
        '<b>Email de contacto:</b> aparece na página de contacto.<br/><br/>'
        '<b>Instagram URL:</b> usado nos ícones do header e rodapé.<br/><br/>'
        '<b>Imagem SEO padrão:</b> imagem que aparece quando alguém partilha o site no '
        'WhatsApp, Slack, redes sociais. Se vazia, usa a obra em destaque automaticamente.<br/><br/>'
        '<b>Texto do rodapé:</b> a frase final do rodapé. Por defeito é o copyright.',
        S['body_l']))

    story.append(PageBreak())

    story.append(h2('3.5  Anunciar exposições e eventos'))
    story.append(Paragraph(
        'Em <b>Definições do Site</b> há dois blocos colapsáveis: <b>Próximo evento</b> e '
        '<b>Evento passado recente</b>. Quando preenchidos, aparece uma faixa fina e discreta '
        'no topo do site avisando os visitantes.',
        S['body_l']))
    story.append(Paragraph(
        'Cada bloco tem: <b>Título</b> (PT/EN), <b>Data</b>, <b>Local</b> (PT/EN) e <b>Link</b> opcional. '
        'Para esconder a faixa, basta apagar os campos. Para esconder só um dos dois '
        '(ex: já não há nada por vir, mas houve uma recente), apaga só esse.',
        S['body_l']))

    story.append(callout(
        '<b>Dica:</b> ao chegar a data de uma exposição que estava marcada como «Próximo», '
        'pode-se mover essa informação para o bloco «Evento passado recente». O site '
        'continua a mostrar a referência durante semanas, dando peso à participação.'))

    story.append(h2('3.6  Bibliografia (página &ldquo;Sobre&rdquo;)'))
    story.append(Paragraph(
        'Em <b>Sobre</b> → secção <b>Bibliografia</b> → <b>+ Add item</b>. Para cada entrada:<br/>'
        '<b>Ano</b> (pode ser um período, ex: <font face="Courier">2020–2023</font>), '
        '<b>Título</b> (PT/EN), <b>Descrição</b> (PT/EN, opcional) e <b>Link</b> (opcional).',
        S['body_l']))
    story.append(Paragraph(
        'A ordem das entradas no Studio é a ordem em que aparecem no site — pode-se arrastar '
        'para reorganizar. Sugestão: ordenar por ano descendente (mais recente em cima).',
        S['body']))

    story.append(h2('3.7  Publicar — o que acontece quando se clica «Publish»'))
    story.append(Paragraph(
        '<b>1.</b> O conteúdo passa de rascunho para publicado. '
        '<b>2.</b> O Sanity dispara um sinal para a Cloudflare. '
        '<b>3.</b> A Cloudflare reconstrói o site (1–2 minutos). '
        '<b>4.</b> Os visitantes veem a nova versão.',
        S['body_l']))
    story.append(Paragraph(
        'Pode-se continuar a editar mais coisas durante este processo. Cada Publish '
        'desencadeia uma nova reconstrução automática.',
        S['body']))

    story.append(PageBreak())

    # ───── 4. SEO ─────
    story.append(h1('4.  Boas práticas de <font face="Times-Italic" color="#b84e3a">SEO</font> aplicadas'))
    story.append(Paragraph(
        'O SEO trata de tornar o site fácil de encontrar — em motores de pesquisa (Google, Bing) '
        'e quando alguém pergunta a um chatbot («quem são pintoras portuguesas contemporâneas?»). '
        'O que está implementado:',
        S['body']))

    seo_items = [
        ('Títulos e descrições por página',
         'Cada página tem um título e uma descrição únicos. O Google lê estes para apresentar nos resultados.'),
        ('Sitemap automático',
         'Um índice de todas as páginas do site é gerado e enviado ao Google sempre que o site '
         'reconstrói (sitemap-index.xml).'),
        ('Open Graph + Twitter Cards',
         'Quando o link é partilhado no WhatsApp, Slack, Instagram, redes sociais — aparece um '
         'preview com imagem, título e descrição em vez do link cru.'),
        ('Hreflang PT / EN',
         'Diz ao Google que existem duas versões linguísticas, e qual mostrar consoante o '
         'utilizador. Evita penalizações por &ldquo;conteúdo duplicado&rdquo;.'),
        ('JSON-LD estruturado',
         'Dados invisíveis ao olho que dizem ao Google que isto é o site oficial de uma artista '
         'visual chamada Dália Cordeiro. Aumenta a hipótese de aparecer em painéis de '
         'conhecimento ao lado dos resultados.'),
        ('Domínio canónico',
         'Cada página declara qual é o seu URL oficial, evitando confusões se o conteúdo '
         'aparecer em mais que um endereço.'),
        ('Imagens otimizadas',
         'Servidas pelo CDN do Sanity, em formatos modernos (WebP / AVIF) escolhidos automaticamente '
         'consoante o browser. O site carrega rápido em qualquer ligação.'),
        ('Mobile-first',
         'O site foi pensado para telemóveis e tablets desde o início — Google penaliza sites '
         'que não funcionam bem em mobile.'),
    ]
    seo_data = [[Paragraph('• ' + name, S['tbl_cell_b']), Paragraph(desc, S['tbl_cell'])] for name, desc in seo_items]
    seo_table = Table(seo_data, colWidths=[55 * mm, 110 * mm])
    seo_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('LINEBELOW', (0, 0), (-1, -2), 0.3, LINE),
    ]))
    story.append(seo_table)

    story.append(Spacer(1, 14))
    story.append(callout(
        '<b>Para a artista (manutenção contínua):</b> sempre que adicionar uma obra nova, '
        'preencher o campo <b>Texto alternativo</b> da imagem (PT e EN) com uma descrição '
        'breve do que se vê. Isto ajuda o Google e é também acessibilidade para quem use '
        'leitores de ecrã.'))

    story.append(PageBreak())

    # ───── 5. CUSTOS ─────
    story.append(h1('5.  Custos do <font face="Times-Italic" color="#b84e3a">projeto</font>'))
    story.append(Paragraph(
        'O site foi montado para correr quase inteiramente em planos gratuitos das plataformas '
        'envolvidas. O único custo fixo recorrente é o domínio.',
        S['body']))

    story.append(h2('Custos recorrentes'))
    cost_header = ['Item', 'Plano', 'Custo / ano', 'Notas']
    cost_rows = [
        ['Domínio  daliacordeiroart.com', 'Cloudflare Registrar', '~ € 10',
         'Renovação anual obrigatória — se não renovar, o domínio fica indisponível.'],
        ['Sanity (CMS)', 'Free', '€ 0',
         'Inclui 3 utilizadores, 100k pedidos / mês, 100 GB de banda / mês. Ultrapassa folgadamente '
         'o uso de uma artista solo.'],
        ['Cloudflare Pages', 'Free', '€ 0',
         '500 deploys / mês, banda ilimitada, 100k pedidos / dia.'],
        ['GitHub', 'Free', '€ 0',
         'Repositório do código.'],
        ['Web3Forms', 'Free', '€ 0',
         '250 mensagens de formulário / mês. Se passar (improvável), plano pago a partir de '
         '$8 / mês para 1000 mensagens.'],
        ['Email (Outlook)', '—', '€ 0',
         'Conta já existente da artista. Pode opcionalmente associar o domínio (ex: '
         'studio@daliacordeiroart.com a reencaminhar para o Outlook) — gratuito via '
         'Cloudflare Email Routing.'],
    ]
    cost_data = [[Paragraph(c, S['tbl_header']) for c in cost_header]] + \
                [[Paragraph(r[0], S['tbl_cell_b']),
                  Paragraph(r[1], S['tbl_cell']),
                  Paragraph(r[2], S['tbl_cell_b']),
                  Paragraph(r[3], S['tbl_cell'])] for r in cost_rows]

    cost_table = Table(cost_data, colWidths=[42 * mm, 32 * mm, 22 * mm, 69 * mm])
    cost_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 0), (-1, 0), PAPER2),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('LINEBELOW', (0, 0), (-1, -2), 0.3, LINE),
    ]))
    story.append(cost_table)

    story.append(Spacer(1, 14))
    story.append(callout(
        '<b>Total estimado:</b> aproximadamente <b>€ 10 por ano</b>, todo ele referente à '
        'renovação anual do domínio. O domínio renova-se automaticamente todos os anos — '
        'a artista só precisa de garantir que o cartão associado à conta Cloudflare '
        'continua válido.'))

    story.append(h2('Custos pontuais (já pagos)'))
    story.append(Paragraph(
        'O desenvolvimento inicial do site, a configuração de toda a infraestrutura, '
        'o desenho gráfico, a tipografia, o sistema de gestão de conteúdo e a documentação '
        'já estão incluídos. Não há fees de instalação recorrentes.',
        S['body']))

    story.append(h2('Quando os custos podem aumentar'))
    story.append(Paragraph(
        'Os planos gratuitos têm folga muito grande para um portfólio individual. '
        'Cenários em que se atingiria os limites: <b>(a)</b> mais de 250 pedidos de '
        'informação por mês via formulário (= upgrade Web3Forms a ~€ 7 / mês), <b>(b)</b> '
        'milhões de visitas mensais (=  upgrade Cloudflare ou Sanity, mas tipicamente bom '
        'sinal). Nada disto é provável a curto prazo.',
        S['body']))

    story.append(PageBreak())

    # ───── 6. DIREITOS DE AUTOR / IA ─────
    story.append(h1('6.  Direitos de autor e <font face="Times-Italic" color="#b84e3a">proteção contra IA</font>'))
    story.append(Paragraph(
        'O site implementa quatro camadas de proteção que <b>não bloqueiam motores de pesquisa</b> '
        '(Google, Bing) <b>nem assistentes de IA quando alguém pergunta sobre a artista</b> — '
        'só bloqueiam o uso das obras para <b>treinar</b> modelos de geração de imagem '
        'sem consentimento.',
        S['body']))

    defense_items = [
        ('robots.txt cirúrgico',
         'Permite por defeito todos os crawlers (incluindo Googlebot, Bingbot, ChatGPT-User, '
         'claude-user, PerplexityBot — os que servem descoberta), e bloqueia explicitamente '
         '20+ identificadores conhecidos de bots de treino (GPTBot, ClaudeBot, Google-Extended, '
         'CCBot, Bytespider, etc.).'),
        ('Meta tags  noai  /  noimageai  /  tdm-reservation',
         'Em todas as páginas, sinais legíveis por máquina dizendo «não usar para treino». '
         'O <font face="Courier">tdm-reservation</font> invoca o Artigo 4(3) da Diretiva (UE) 2019/790 '
         '— peso legal real na União Europeia.'),
        ('Cabeçalho HTTP X-Robots-Tag',
         'Em todas as respostas servidas pela Cloudflare. Apanha bots que ignoram a '
         '<i>meta tag</i> mas leem cabeçalhos.'),
        ('Página de termos legais (/termos)',
         'Reserva expressa de direitos sobre todas as obras, com fundamento legal explícito '
         'na diretiva europeia. Linkada no rodapé. Útil em caso de necessidade de demonstrar '
         'que a posição da artista é pública e clara.'),
    ]
    def_data = [[Paragraph(name, S['tbl_cell_b']), Paragraph(desc, S['tbl_cell'])] for name, desc in defense_items]
    def_table = Table(def_data, colWidths=[55 * mm, 110 * mm])
    def_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('LINEBELOW', (0, 0), (-1, -2), 0.3, LINE),
    ]))
    story.append(def_table)

    story.append(Spacer(1, 14))
    story.append(h2('O que isto faz e o que não faz'))
    story.append(Paragraph(
        '<b>Faz:</b> um crawler de boa-fé (a maioria — OpenAI, Anthropic, Google, Apple respeitam '
        'os sinais publicamente) não usará as obras para treino. Em caso de incumprimento, '
        'a artista tem evidência clara da sua reserva de direitos, com peso legal na UE.',
        S['body']))
    story.append(Paragraph(
        '<b>Não faz:</b> não impede tecnicamente um scraper malicioso que ignore tudo. '
        'Para isso, há duas defesas adicionais que dependem da artista:',
        S['body']))

    story.append(h2('Recomendações para a artista'))
    recs = [
        ('Glaze (opcional, recomendado)',
         'Ferramenta gratuita da Universidade de Chicago (<font face="Courier">glaze.cs.uchicago.edu</font>). '
         'Adiciona uma perturbação invisível ao olho humano à imagem antes de a carregar para o site. '
         'Modelos que tentem treinar nela aprendem uma representação distorcida. ~10 min por imagem '
         'em CPU. Não compromete a visualização.'),
        ('Cloudflare Bot Blocker (assim que o domínio estiver ativo)',
         'No painel da Cloudflare, na secção «Security → Bots», ativar a opção de bloquear bots '
         'de treino de IA. Funciona à entrada do tráfego — bots bloqueados nem chegam ao site. '
         'Esta secção só fica disponível depois do domínio  daliacordeiroart.com  estar ligado '
         'à conta Cloudflare como Zone (passo a fazer no momento do registo do domínio).'),
        ('Marca de água (opcional, decisão estética)',
         'Adicionar uma marca discreta nas imagens (ex: «©  Dália Cordeiro» pequena num canto). '
         'Reduz o valor da imagem para treino e dificulta uso comercial não autorizado, mas '
         'tem custo estético. A artista decide se quer.'),
    ]
    rec_data = [[Paragraph(name, S['tbl_cell_b']), Paragraph(desc, S['tbl_cell'])] for name, desc in recs]
    rec_table = Table(rec_data, colWidths=[55 * mm, 110 * mm])
    rec_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('LINEBELOW', (0, 0), (-1, -2), 0.3, LINE),
    ]))
    story.append(rec_table)

    story.append(PageBreak())

    # ───── 7. MANUTENÇÃO ─────
    story.append(h1('7.  Manutenção, backups e <font face="Times-Italic" color="#b84e3a">contactos</font>'))

    story.append(h2('Backups'))
    story.append(Paragraph(
        'O Sanity guarda automaticamente o histórico de cada documento. É possível recuperar '
        'versões anteriores em qualquer altura através do botão de histórico no painel de edição.',
        S['body']))
    story.append(Paragraph(
        'O código do site está no GitHub, com histórico de todas as alterações. As imagens '
        'das obras estão no CDN do Sanity, replicadas em vários servidores.',
        S['body']))

    story.append(h2('Manutenção anual obrigatória'))
    story.append(Paragraph(
        'Apenas uma: <b>renovação do domínio</b> daliacordeiroart.com. Configurar o cartão de '
        'crédito na Cloudflare para renovação automática evita esquecimentos. '
        'Se o domínio expirar, o site fica inacessível até voltar a ser renovado.',
        S['body']))

    story.append(h2('Manutenção opcional (recomendada)'))
    story.append(Paragraph(
        '<b>Mensal:</b> verificar uma vez por mês se o formulário de contacto está a funcionar '
        '(enviar uma mensagem de teste a si própria). <b>Trimestral:</b> rever os textos do '
        'site, atualizar a obra em destaque, mudar a frase principal se quiser.',
        S['body']))

    story.append(h2('Se algo correr mal'))
    troubles = [
        ('Esqueci-me da palavra-passe do Sanity',
         'Recuperar via «Forgot password» na página de login.'),
        ('Editei algo e quero voltar atrás',
         'No Sanity, clicar no ícone de relógio (histórico) do documento editado, '
         'escolher a versão anterior e clicar «Restore».'),
        ('O site está fora do ar',
         'Verificar se a conta Cloudflare está bem (sem renovação falhada). '
         'Se persistir, contactar o programador.'),
        ('O formulário de contacto não me chega ao email',
         'Verificar a pasta de spam. Verificar no painel do Web3Forms se a mensagem foi '
         'recebida. Se sim mas não chegou ao Outlook, é problema de filtros do email.'),
        ('Quero adicionar uma nova série / mudar o design',
         'Contactar o programador.'),
    ]
    trouble_data = [[Paragraph('· ' + name, S['tbl_cell_b']), Paragraph(desc, S['tbl_cell'])] for name, desc in troubles]
    trouble_table = Table(trouble_data, colWidths=[60 * mm, 105 * mm])
    trouble_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('LINEBELOW', (0, 0), (-1, -2), 0.3, LINE),
    ]))
    story.append(trouble_table)

    story.append(Spacer(1, 24))
    story.append(hr_accent(40))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        '<b>Bom uso.</b><br/>'
        'O site foi pensado para ser autónomo e duradouro — todas as decisões '
        'foram tomadas para a artista poder editar, publicar e crescer sem depender de '
        'ninguém para cada pequena alteração. Boa pintura.',
        S['lead']))

    doc.build(story)
    print(f'✓ PDF gerado em: {out_path}')
    print(f'  ({out_path.stat().st_size // 1024} KB, {out_path.stat().st_size} bytes)')


if __name__ == '__main__':
    build()
