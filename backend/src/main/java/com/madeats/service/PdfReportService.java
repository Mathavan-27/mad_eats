package com.madeats.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.madeats.entity.Order;
import com.madeats.entity.OrderItem;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;

@Service
public class PdfReportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    public File generateOrderPdfFile(Order order) throws IOException {
        Path dirPath = Paths.get("reports", "orders");
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }

        String orderCode = order.getOrderCode();
        if (orderCode == null || orderCode.isBlank()) {
            orderCode = "ME-" + String.format("%06d", order.getId());
        }

        File pdfFile = dirPath.resolve("order_" + orderCode + ".pdf").toFile();
        byte[] pdfBytes = generateOrderPdfBytes(order);

        try (FileOutputStream fos = new FileOutputStream(pdfFile)) {
            fos.write(pdfBytes);
        }

        return pdfFile;
    }

    public byte[] generateOrderPdfBytes(Order order) {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(225, 29, 72));
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(100, 116, 139));
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(15, 23, 42));
            Font regularBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(15, 23, 42));
            Font regularText = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(51, 65, 85));
            Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(225, 29, 72));
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(100, 116, 139));

            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{55, 45});

            PdfPCell leftHeaderCell = new PdfPCell();
            leftHeaderCell.setBorder(Rectangle.NO_BORDER);
            leftHeaderCell.addElement(new Paragraph("MAD EATS", brandFont));
            leftHeaderCell.addElement(new Paragraph("Restaurant Order Receipt", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(51, 65, 85))));
            leftHeaderCell.addElement(new Paragraph("Premium Taste & Fast Delivery", subHeaderFont));
            headerTable.addCell(leftHeaderCell);

            String orderCode = order.getOrderCode();
            if (orderCode == null || orderCode.isBlank()) {
                orderCode = "ME-" + String.format("%06d", order.getId() != null ? order.getId() : 0);
            }

            String dateStr = order.getOrderDate() != null ? order.getOrderDate().format(DATE_FORMATTER) : "N/A";

            PdfPCell rightHeaderCell = new PdfPCell();
            rightHeaderCell.setBorder(Rectangle.NO_BORDER);
            rightHeaderCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            Paragraph orderNum = new Paragraph("Order ID: " + orderCode, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(225, 29, 72)));
            orderNum.setAlignment(Element.ALIGN_RIGHT);
            rightHeaderCell.addElement(orderNum);

            Paragraph orderDateP = new Paragraph("Order Date: " + dateStr, subHeaderFont);
            orderDateP.setAlignment(Element.ALIGN_RIGHT);
            rightHeaderCell.addElement(orderDateP);

            Paragraph orderStatusP = new Paragraph("Order Status: " + (order.getOrderStatus() != null ? order.getOrderStatus() : "PLACED"), regularBold);
            orderStatusP.setAlignment(Element.ALIGN_RIGHT);
            rightHeaderCell.addElement(orderStatusP);

            Paragraph payP = new Paragraph("Payment Method: CASH ON DELIVERY", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(21, 128, 61)));
            payP.setAlignment(Element.ALIGN_RIGHT);
            rightHeaderCell.addElement(payP);

            headerTable.addCell(rightHeaderCell);
            document.add(headerTable);

            document.add(new Paragraph(" "));

            PdfPTable divider = new PdfPTable(1);
            divider.setWidthPercentage(100);
            PdfPCell divCell = new PdfPCell();
            divCell.setFixedHeight(2);
            divCell.setBackgroundColor(new Color(225, 29, 72));
            divCell.setBorder(Rectangle.NO_BORDER);
            divider.addCell(divCell);
            document.add(divider);

            document.add(new Paragraph(" "));

            Paragraph custSectionHeader = new Paragraph("CUSTOMER & DELIVERY INFORMATION", sectionTitleFont);
            document.add(custSectionHeader);
            document.add(new Paragraph(" "));

            PdfPTable custTable = new PdfPTable(2);
            custTable.setWidthPercentage(100);
            custTable.setWidths(new float[]{50, 50});

            PdfPCell c1 = new PdfPCell();
            c1.setBackgroundColor(new Color(248, 250, 252));
            c1.setPadding(8);
            c1.setBorderColor(new Color(226, 232, 240));
            c1.addElement(new Paragraph("Customer Name: " + (order.getCustomerName() != null ? order.getCustomerName() : "N/A"), regularBold));
            c1.addElement(new Paragraph("Customer Mobile: " + (order.getPhone() != null ? order.getPhone() : "N/A"), regularText));
            String emailVal = order.getCustomerEmail() != null && !order.getCustomerEmail().isBlank()
                    ? order.getCustomerEmail()
                    : (order.getUser() != null ? order.getUser().getEmail() : "N/A");
            c1.addElement(new Paragraph("Email: " + emailVal, regularText));
            custTable.addCell(c1);

            PdfPCell c2 = new PdfPCell();
            c2.setBackgroundColor(new Color(248, 250, 252));
            c2.setPadding(8);
            c2.setBorderColor(new Color(226, 232, 240));
            c2.addElement(new Paragraph("Delivery Address:", regularBold));
            c2.addElement(new Paragraph(order.getDeliveryAddress() != null ? order.getDeliveryAddress() : "N/A", regularText));
            c2.addElement(new Paragraph("Payment: CASH ON DELIVERY", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(21, 128, 61))));
            custTable.addCell(c2);

            document.add(custTable);
            document.add(new Paragraph(" "));

            Paragraph itemsSectionHeader = new Paragraph("ORDERED FOOD ITEMS", sectionTitleFont);
            document.add(itemsSectionHeader);
            document.add(new Paragraph(" "));

            PdfPTable itemsTable = new PdfPTable(5);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{8, 48, 14, 15, 15});

            String[] headers = {"#", "Food Item Name", "Price", "Quantity", "Subtotal"};
            for (String h : headers) {
                PdfPCell th = new PdfPCell(new Phrase(h, tableHeaderFont));
                th.setBackgroundColor(new Color(15, 23, 42));
                th.setPadding(6);
                th.setHorizontalAlignment(Element.ALIGN_CENTER);
                itemsTable.addCell(th);
            }

            int index = 1;
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                for (OrderItem it : order.getItems()) {
                    PdfPCell cellIdx = new PdfPCell(new Phrase(String.valueOf(index++), regularText));
                    cellIdx.setHorizontalAlignment(Element.ALIGN_CENTER);
                    cellIdx.setPadding(6);
                    itemsTable.addCell(cellIdx);

                    PdfPCell cellName = new PdfPCell(new Phrase(it.getFoodName(), regularBold));
                    cellName.setPadding(6);
                    itemsTable.addCell(cellName);

                    PdfPCell cellPrice = new PdfPCell(new Phrase("Rs. " + it.getPrice(), regularText));
                    cellPrice.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    cellPrice.setPadding(6);
                    itemsTable.addCell(cellPrice);

                    PdfPCell cellQty = new PdfPCell(new Phrase(String.valueOf(it.getQuantity()), regularText));
                    cellQty.setHorizontalAlignment(Element.ALIGN_CENTER);
                    cellQty.setPadding(6);
                    itemsTable.addCell(cellQty);

                    PdfPCell cellSub = new PdfPCell(new Phrase("Rs. " + it.getSubtotal(), regularBold));
                    cellSub.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    cellSub.setPadding(6);
                    itemsTable.addCell(cellSub);
                }
            }

            document.add(itemsTable);
            document.add(new Paragraph(" "));

            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(100);
            totalTable.setWidths(new float[]{55, 45});

            PdfPCell notesCell = new PdfPCell();
            notesCell.setBorder(Rectangle.NO_BORDER);
            notesCell.addElement(new Paragraph("Payment Method:", regularBold));
            notesCell.addElement(new Paragraph("CASH ON DELIVERY (COD)", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(21, 128, 61))));
            notesCell.addElement(new Paragraph("Order Status: " + (order.getOrderStatus() != null ? order.getOrderStatus() : "PLACED"), regularText));
            totalTable.addCell(notesCell);

            PdfPTable amountsTable = new PdfPTable(2);
            amountsTable.setWidthPercentage(100);
            amountsTable.setWidths(new float[]{55, 45});

            addAmountRow(amountsTable, "Subtotal:", "Rs. " + (order.getSubtotal() != null ? order.getSubtotal() : "0.00"), regularText);
            addAmountRow(amountsTable, "GST (5%):", "Rs. " + (order.getGstAmount() != null ? order.getGstAmount() : "0.00"), regularText);
            String delFee = (order.getDeliveryFee() == null || order.getDeliveryFee().signum() == 0) ? "FREE" : "Rs. " + order.getDeliveryFee();
            addAmountRow(amountsTable, "Delivery Charges:", delFee, regularText);
            addAmountRow(amountsTable, "Discount:", "Rs. 0.00", regularText);

            PdfPCell grandTotalLabel = new PdfPCell(new Phrase("Grand Total:", totalFont));
            grandTotalLabel.setPadding(6);
            grandTotalLabel.setBorderColor(new Color(225, 29, 72));
            grandTotalLabel.setBackgroundColor(new Color(255, 241, 242));
            amountsTable.addCell(grandTotalLabel);

            PdfPCell grandTotalVal = new PdfPCell(new Phrase("Rs. " + order.getTotalAmount(), totalFont));
            grandTotalVal.setPadding(6);
            grandTotalVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            grandTotalVal.setBorderColor(new Color(225, 29, 72));
            grandTotalVal.setBackgroundColor(new Color(255, 241, 242));
            amountsTable.addCell(grandTotalVal);

            PdfPCell amountsContainer = new PdfPCell(amountsTable);
            amountsContainer.setBorder(Rectangle.NO_BORDER);
            totalTable.addCell(amountsContainer);

            document.add(totalTable);

            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            Paragraph thankYouP = new Paragraph("Thank you for ordering with MAD EATS!", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(225, 29, 72)));
            thankYouP.setAlignment(Element.ALIGN_CENTER);
            document.add(thankYouP);

            Paragraph footerP = new Paragraph("Freshly prepared, hygienically packed, and delivered hot.", footerFont);
            footerP.setAlignment(Element.ALIGN_CENTER);
            document.add(footerP);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF confirmation report: " + e.getMessage(), e);
        }

        return baos.toByteArray();
    }

    private void addAmountRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell lCell = new PdfPCell(new Phrase(label, font));
        lCell.setPadding(4);
        lCell.setBorderColor(new Color(226, 232, 240));
        table.addCell(lCell);

        PdfPCell vCell = new PdfPCell(new Phrase(value, font));
        vCell.setPadding(4);
        vCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        vCell.setBorderColor(new Color(226, 232, 240));
        table.addCell(vCell);
    }
}
