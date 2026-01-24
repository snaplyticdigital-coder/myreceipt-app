import { jsPDF } from 'jspdf';
import type { Receipt, LhdnTag } from '../types';
import { format } from 'date-fns';

interface TaxReliefItem {
    merchant: string;
    date: string;
    itemName: string;
    amount: number;
    receiptId: string;
}

interface CategoryData {
    category: LhdnTag;
    items: TaxReliefItem[];
    total: number;
    limit: number | null;
}

/**
 * Generate an LHDN-compliant Tax Relief Evidence Summary PDF
 * for a specific assessment year.
 */
export function generateTaxReliefPDF(
    year: number,
    receipts: Receipt[],
    userName?: string,
    icNumber?: string
): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = 20;

    // Filter receipts by year and claimable status
    const yearReceipts = receipts.filter(receipt => {
        const receiptYear = new Date(receipt.date).getFullYear();
        return receiptYear === year && receipt.claimable;
    });

    // Group items by LHDN category
    const categoryLimits: Record<LhdnTag, number | null> = {
        Medical: 10000,
        Lifestyle: 2500,
        Education: null,
        Books: 2500,
        Sports: 1000,
        Childcare: 3000,
        Others: null,
    };

    const categoryMap = new Map<LhdnTag, TaxReliefItem[]>();
    const categories: LhdnTag[] = ['Medical', 'Lifestyle', 'Education', 'Books', 'Sports', 'Childcare'];

    categories.forEach(cat => categoryMap.set(cat, []));

    yearReceipts.forEach(receipt => {
        receipt.items.forEach(item => {
            if (item.claimable && item.tag) {
                const existing = categoryMap.get(item.tag) || [];
                existing.push({
                    merchant: receipt.merchant,
                    date: format(new Date(receipt.date), 'dd MMM yyyy'),
                    itemName: item.name,
                    amount: item.qty * item.unit,
                    receiptId: receipt.id,
                });
                categoryMap.set(item.tag, existing);
            }
        });
    });

    // Build category data array
    const categoryData: CategoryData[] = categories.map(cat => ({
        category: cat,
        items: categoryMap.get(cat) || [],
        total: (categoryMap.get(cat) || []).reduce((sum, item) => sum + item.amount, 0),
        limit: categoryLimits[cat],
    })).filter(cat => cat.items.length > 0);

    // ========== HEADER ==========
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 51, 153); // Purple
    doc.text('LHDN Tax Relief Evidence Summary', margin, yPos);

    yPos += 8;
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text(`Assessment Year ${year}`, margin, yPos);

    yPos += 10;
    doc.setDrawColor(102, 51, 153);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 10;

    // ========== TAXPAYER INFO ==========
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);

    if (userName) {
        doc.text(`Taxpayer Name: ${userName}`, margin, yPos);
        yPos += 6;
    }
    if (icNumber) {
        doc.text(`IC Number: ${icNumber}`, margin, yPos);
        yPos += 6;
    }

    yPos += 5;

    // ========== SUMMARY BOX ==========
    const totalClaimable = categoryData.reduce((sum, cat) => sum + cat.total, 0);

    doc.setFillColor(245, 240, 255); // Light purple
    doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F');

    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(102, 51, 153);
    doc.text('Total Tax-Claimable Amount', margin + 5, yPos);

    yPos += 8;
    doc.setFontSize(14);
    doc.text(`RM ${totalClaimable.toFixed(2)}`, margin + 5, yPos);

    yPos += 15;

    // ========== CATEGORY SECTIONS ==========
    categoryData.forEach((catData) => {
        // Check if we need a new page
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        // Category Header
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F');

        yPos += 7;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(51, 51, 51);

        const limitText = catData.limit ? ` (Limit: RM ${catData.limit.toFixed(2)})` : '';
        doc.text(`${catData.category} Relief${limitText}`, margin + 3, yPos);

        const subtotalText = `RM ${catData.total.toFixed(2)}`;
        const subtotalWidth = doc.getTextWidth(subtotalText);
        doc.text(subtotalText, pageWidth - margin - subtotalWidth - 3, yPos);

        yPos += 8;

        // Table Header
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 100, 100);
        doc.text('Merchant', margin, yPos);
        doc.text('Date', margin + 50, yPos);
        doc.text('Item', margin + 85, yPos);
        doc.text('Amount', pageWidth - margin - 25, yPos);

        yPos += 2;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, yPos, pageWidth - margin, yPos);

        yPos += 5;

        // Table Rows
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 51, 51);

        catData.items.forEach(item => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            // Truncate long text
            const merchantTxt = item.merchant.length > 20 ? item.merchant.substring(0, 18) + '...' : item.merchant;
            const itemTxt = item.itemName.length > 25 ? item.itemName.substring(0, 23) + '...' : item.itemName;

            doc.text(merchantTxt, margin, yPos);
            doc.text(item.date, margin + 50, yPos);
            doc.text(itemTxt, margin + 85, yPos);
            doc.text(`RM ${item.amount.toFixed(2)}`, pageWidth - margin - 25, yPos);

            yPos += 5;
        });

        yPos += 8;
    });

    // ========== FOOTER ==========
    if (yPos > 260) {
        doc.addPage();
        yPos = 20;
    }

    yPos = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text(
        `Generated by Duitrack on ${format(new Date(), 'dd MMM yyyy, HH:mm')}`,
        margin,
        yPos
    );

    doc.text(
        'This document is for record-keeping purposes. Please retain for 7 years as per LHDN requirements.',
        margin,
        yPos + 4
    );

    // ========== SAVE ==========
    doc.save(`LHDN_Tax_Relief_${year}.pdf`);
}

/**
 * Check if a year has any claimable receipt data
 */
export function hasYearData(year: number, receipts: Receipt[]): boolean {
    return receipts.some(receipt => {
        const receiptYear = new Date(receipt.date).getFullYear();
        return receiptYear === year && receipt.claimable && receipt.items.some(i => i.claimable);
    });
}

/**
 * Get summary stats for a year
 */
export function getYearSummary(year: number, receipts: Receipt[]): {
    receiptCount: number;
    totalClaimable: number;
} {
    const yearReceipts = receipts.filter(receipt => {
        const receiptYear = new Date(receipt.date).getFullYear();
        return receiptYear === year && receipt.claimable;
    });

    const totalClaimable = yearReceipts.reduce((sum, receipt) => {
        const claimableItems = receipt.items.filter(i => i.claimable);
        return sum + claimableItems.reduce((s, i) => s + (i.qty * i.unit), 0);
    }, 0);

    return {
        receiptCount: yearReceipts.length,
        totalClaimable,
    };
}
