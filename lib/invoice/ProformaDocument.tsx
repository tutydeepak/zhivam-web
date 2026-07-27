import { Document, Page } from "@react-pdf/renderer";
import { epStyles, EstimateProformaBody, EstimateProformaData } from "./EstimateProformaShared";

export function ProformaDocument({ data }: { data: EstimateProformaData }) {
    return (
        <Document>
            <Page size="A4" style={epStyles.page}>
                <EstimateProformaBody data={{ ...data, docType: "proforma" }} />
            </Page>
        </Document>
    );
}