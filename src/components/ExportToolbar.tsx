import { useState } from "react";
import { Download, Image, Copy, Check, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { ResearchReport } from "@/types/research";

interface ExportToolbarProps {
  reportRef: React.RefObject<HTMLDivElement | null>;
  report: ResearchReport;
}

/* ── Export-mode overrides injected into the html2canvas clone ── */
const EXPORT_CSS = `
  /* Freeze every animation so capture shows final state */
  *, *::before, *::after {
    animation: none !important;
    animation-delay: 0s !important;
    transition: none !important;
  }

  /* Replace glass / blur with solid dark backgrounds */
  .glass-card {
    background: #1a1b23 !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border-color: rgba(255,255,255,0.10) !important;
  }
  .glass, .glass-strong {
    background: rgba(255,255,255,0.07) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  /* Ensure all text is fully visible */
  p, span, h1, h2, h3, h4, h5, h6, a, li, label, strong, em {
    opacity: 1 !important;
  }
`;

/**
 * Walk the cloned element tree and replace any element that uses
 * backdrop-filter (via Tailwind classes) with a solid opaque background.
 */
function fixBlurElements(el: HTMLElement) {
  el.querySelectorAll("*").forEach((child) => {
    const htmlChild = child as HTMLElement;
    const cls = htmlChild.className;
    if (typeof cls === "string" && cls.includes("backdrop-blur")) {
      htmlChild.style.backdropFilter = "none";
      htmlChild.style.setProperty("-webkit-backdrop-filter", "none");
      htmlChild.style.backgroundColor = "#1a1b23";
      htmlChild.style.opacity = "1";
    }
  });
}

/** Prepare the html2canvas clone for a clean, readable screenshot */
function prepareCloneForExport(_doc: Document, element: HTMLElement) {
  // Inject export-mode CSS
  const style = _doc.createElement("style");
  style.textContent = EXPORT_CSS;
  _doc.head.appendChild(style);

  // Fix Tailwind backdrop-blur elements
  fixBlurElements(element);
}

export function ExportToolbar({ reportRef, report }: ExportToolbarProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  /** Shared html2canvas capture with export-mode overrides */
  const captureCanvas = async () => {
    await document.fonts.ready; // ensure JetBrains Mono etc. are loaded
    const html2canvas = (await import("html2canvas")).default;
    return html2canvas(reportRef.current!, {
      backgroundColor: "#0f1117",
      scale: 2,
      useCORS: true,
      logging: false,
      onclone: prepareCloneForExport,
    });
  };

  const exportAsPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      const { jsPDF } = await import("jspdf");
      const canvas = await captureCanvas();

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentW = pageW - margin * 2;

      // Scale image to fill the page width
      const scale = contentW / canvas.width;

      // ── Branding header (first page only) ──
      const headerH = 14;
      const addHeader = (doc: InstanceType<typeof jsPDF>) => {
        doc.setFillColor(15, 17, 23);
        doc.rect(0, 0, pageW, 12, "F");
        doc.setTextColor(100, 149, 237);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("StrategyRoom.ai", margin, 8);
        doc.setTextColor(140, 140, 160);
        doc.setFontSize(7);
        doc.text(
          `Investment Research Report  •  ${new Date().toLocaleDateString()}`,
          pageW - margin,
          8,
          { align: "right" },
        );
      };
      addHeader(pdf);

      // ── Paginate: slice the canvas into page-sized strips ──
      let srcY = 0;
      let destY = headerH;
      let page = 1;

      while (srcY < canvas.height) {
        const availH = page === 1 ? pageH - headerH - margin : pageH - margin * 2;
        const sliceSrcH = Math.min(availH / scale, canvas.height - srcY);
        const sliceDestH = sliceSrcH * scale;

        // Draw a strip of the source canvas
        const strip = document.createElement("canvas");
        strip.width = canvas.width;
        strip.height = Math.ceil(sliceSrcH);
        const ctx = strip.getContext("2d")!;
        ctx.drawImage(canvas, 0, srcY, canvas.width, sliceSrcH, 0, 0, canvas.width, sliceSrcH);

        pdf.addImage(strip.toDataURL("image/png"), "PNG", margin, destY, contentW, sliceDestH);
        srcY += sliceSrcH;

        if (srcY < canvas.height) {
          pdf.addPage();
          page++;
          destY = margin;
        }
      }

      pdf.save(`${report.ticker}-research-report.pdf`);

      toast({
        title: "PDF exported!",
        description: `${report.ticker} report saved successfully.`,
      });
    } catch (_err) {
      toast({
        title: "Export failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPNG = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await captureCanvas();

      const link = document.createElement("a");
      link.download = `${report.ticker}-research-report.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({
        title: "PNG exported!",
        description: `${report.ticker} report image saved.`,
      });
    } catch (_err) {
      toast({
        title: "Export failed",
        description: "Could not generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const copySummary = async () => {
    const text = [
      `📊 ${report.company} (${report.ticker})`,
      `Verdict: ${report.verdict} • Confidence: ${report.confidenceScore}%`,
      `Sentiment: ${report.sentimentAnalysis.overallSentiment}`,
      "",
      report.executiveSummary,
      "",
      `— Generated by StrategyRoom.ai`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Summary copied to clipboard.",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not access clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          className="gap-2 text-xs h-8 border-border/60 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300"
        >
          {isExporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Share2 className="h-3.5 w-3.5" />
          )}
          {isExporting ? "Exporting…" : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportAsPDF} className="gap-2 cursor-pointer">
          <Download className="h-4 w-4" />
          <span>Export as PDF</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsPNG} className="gap-2 cursor-pointer">
          <Image className="h-4 w-4" />
          <span>Export as PNG</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copySummary} className="gap-2 cursor-pointer">
          {copied ? <Check className="h-4 w-4 text-positive" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? "Copied!" : "Copy Summary"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
