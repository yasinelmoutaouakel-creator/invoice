
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const downloadPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Find all elements to hide during PDF capture
  const hideElements = element.querySelectorAll('.no-print-capture');
  hideElements.forEach((el) => {
    (el as HTMLElement).style.visibility = 'hidden';
  });

  try {
    const canvas = await html2canvas(element, {
      scale: 3, // Ultra-high resolution
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.boxShadow = 'none';
          clonedElement.style.margin = '0';
          clonedElement.style.border = 'none';
          clonedElement.style.borderRadius = '0';
          // Force visibility of everything except marked ones
          clonedElement.querySelectorAll('*').forEach((el) => {
             const htmlEl = el as HTMLElement;
             if (htmlEl.classList.contains('no-print-capture')) {
               htmlEl.style.display = 'none';
             }
          });
        }
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4', true);
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Fit canvas to width of A4
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Use higher quality compression for image addition
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'SLOW');
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Une erreur est survenue lors de la génération du PDF professionnel.');
  } finally {
    // Restore elements
    hideElements.forEach((el) => {
      (el as HTMLElement).style.visibility = '';
    });
  }
};
