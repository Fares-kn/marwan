'use client';

import { useState } from 'react';
import { logout } from './actions';

type Message = {
  id: string;
  guest_name: string;
  message_content: string;
  created_at: string;
};

export default function AdminDashboard({ messages }: { messages: Message[] }) {
  const [exporting, setExporting] = useState(false);
  const count = messages.length;

  async function handleExport() {
    setExporting(true);

    // Loaded dynamically so neither library ends up in the server bundle.
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    // jsPDF's built-in fonts (helvetica, times, courier) are the old PDF
    // "base14" fonts - Latin only. Any Arabic text drawn with doc.text()
    // gets mapped to the wrong glyphs, which is why it came out garbled.
    // The fix: render each message with the browser's own text engine
    // (which shapes Arabic correctly) via html2canvas, then place that
    // as an image in the PDF. The header stays as fast vector text since
    // it's always plain English.
    await document.fonts.ready;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 48;
    const contentWidthPt = pageWidth - margin * 2;
    const ptToPx = 96 / 72;
    const captureWidthPx = Math.round(contentWidthPt * ptToPx);
    let y = margin;

    // Off-screen element used to render the header and each card the same
    // way the browser renders any other text on the page (correct Arabic
    // shaping and right-to-left ordering included), so html2canvas can
    // rasterize it.
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '-99999px';
    container.style.width = `${captureWidthPx}px`;
    container.style.background = '#ffffff';
    container.style.padding = '24px 0';
    container.style.boxSizing = 'border-box';
    document.body.appendChild(container);

    // Render the PDF title and summary via html2canvas so Arabic text
    // shapes correctly. The export time is intentionally omitted.
    container.innerHTML = '';
    const headerCard = document.createElement('div');
    headerCard.style.fontFamily = "'Fraunces', 'Noto Naskh Arabic', serif";
    headerCard.style.padding = '0 0 12px 0';

    const titleEl = document.createElement('div');
    titleEl.textContent = 'إلى مروان حافظ القراَن';
    titleEl.style.fontSize = '22px';
    titleEl.style.fontWeight = '700';
    titleEl.style.color = '#1B2A4A';
    titleEl.dir = 'auto';

    const subtitleEl = document.createElement('div');
    subtitleEl.textContent = `${count} message${count === 1 ? '' : 's'}`;
    subtitleEl.style.fontSize = '12px';
    subtitleEl.style.color = '#666666';

    headerCard.appendChild(titleEl);
    headerCard.appendChild(subtitleEl);
    container.appendChild(headerCard);

    const headerCanvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
    });

    const headerHeightPt = (headerCanvas.height / headerCanvas.width) * contentWidthPt;
    if (y + headerHeightPt > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    doc.addImage(headerCanvas.toDataURL('image/png'), 'PNG', margin, y, contentWidthPt, headerHeightPt);
    y += headerHeightPt + 12;

    doc.setDrawColor('#B8912F');
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 24;

    try {
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];

        container.innerHTML = '';
        const card = document.createElement('div');
        card.dir = 'auto';
        card.style.fontFamily = "'Inter', 'Noto Naskh Arabic', sans-serif";
        card.style.background = '#ffffff';
        card.style.border = '1px solid #E8E0CB';
        card.style.borderRadius = '18px';
        card.style.padding = '20px';
        card.style.boxSizing = 'border-box';
        card.style.marginBottom = '16px';
        card.style.width = '100%';
        card.style.maxWidth = '100%';

        const nameLabel = document.createElement('div');
        nameLabel.textContent = 'الاسم:';
        nameLabel.style.fontSize = '12px';
        nameLabel.style.color = '#666666';
        nameLabel.style.marginBottom = '6px';
        nameLabel.dir = 'auto';

        const nameEl = document.createElement('div');
        nameEl.textContent = msg.guest_name || 'Anonymous';
        nameEl.style.fontFamily = "'Fraunces', 'Noto Naskh Arabic', serif";
        nameEl.style.fontWeight = '600';
        nameEl.style.fontSize = '20px';
        nameEl.style.color = '#1B2A4A';
        nameEl.dir = 'auto';

        // Include the message body in the exported PDF cards, but do not
        // include any timestamps or times. Add an Arabic label above it.
        const messageLabel = document.createElement('div');
        messageLabel.textContent = 'الرسالة:';
        messageLabel.style.fontSize = '12px';
        messageLabel.style.color = '#666666';
        messageLabel.style.marginTop = '12px';
        messageLabel.style.marginBottom = '6px';
        messageLabel.dir = 'auto';

        const bodyEl = document.createElement('div');
        bodyEl.textContent = msg.message_content;
        bodyEl.style.fontSize = '16px';
        bodyEl.style.lineHeight = '1.6';
        bodyEl.style.color = '#1C1B1F';
        bodyEl.style.whiteSpace = 'pre-wrap';
        bodyEl.style.wordBreak = 'break-word';

        // Build card: label + name, then label + message
        const nameBlock = document.createElement('div');
        nameBlock.appendChild(nameLabel);
        nameBlock.appendChild(nameEl);

        nameRow.appendChild(nameBlock);
        card.appendChild(nameRow);
        card.appendChild(messageLabel);
        card.appendChild(bodyEl);
        container.appendChild(card);
        nameEl.style.fontSize = '20px';
        nameEl.style.color = '#1B2A4A';

        nameRow.appendChild(nameEl);

        // Do not include the message body in the exported PDF cards
        card.appendChild(nameRow);
        container.appendChild(card);

        const canvas = await html2canvas(container, {
          scale: 2,
          backgroundColor: '#ffffff',
        });

        const imgHeightPt = (canvas.height / canvas.width) * contentWidthPt;

        if (y + imgHeightPt > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        doc.addImage(canvas.toDataURL('image/png'), 'PNG', margin, y, contentWidthPt, imgHeightPt);
        y += imgHeightPt + 12;

        if (i < messages.length - 1) {
          if (y + 18 > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.setDrawColor('#DCD2B8');
          doc.setLineWidth(0.5);
          doc.line(margin, y, pageWidth - margin, y);
          y += 18;
        }
      }
    } finally {
      document.body.removeChild(container);
    }

    doc.save(`graduation-guestbook-${new Date().toISOString().slice(0, 10)}.pdf`);
    setExporting(false);
  }

  return (
    <main className="min-h-screen bg-parchment px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-navy">إلى مروان حافظ القراَن</h1>
            <p className="text-sm text-ink/60">
              {count} message{count === 1 ? '' : 's'} received
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={exporting || count === 0}
              className="rounded-lg bg-navy text-white text-sm font-medium px-5 py-2.5 hover:bg-navydark transition disabled:opacity-50"
            >
              {exporting ? 'Preparing PDF…' : 'Export to PDF'}
            </button>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-line text-sm font-medium px-5 py-2.5 hover:bg-white transition"
              >
                Log out
              </button>
            </form>
          </div>
        </div>

        {count === 0 ? (
          <div className="bg-white rounded-2xl border border-line px-8 py-16 text-center text-ink/50">
            No messages yet. Share the guestbook link with your guests.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {messages.map((msg) => (
              <article key={msg.id} className="bg-white rounded-2xl border border-line p-5 flex flex-col">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <h2 className="font-display text-lg text-navy truncate">{msg.guest_name || 'Anonymous'}</h2>
                  
                </div>
                <p dir="auto" className="text-sm text-ink/80 whitespace-pre-wrap leading-relaxed">
                  {msg.message_content}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
