import { Document, Page } from "@react-pdf/renderer";
import { epStyles, EstimateProformaBody, EstimateProformaData } from "./EstimateProformaShared";

export function EstimateDocument({ data }: { data: EstimateProformaData }) {
    return (
        <Document>
            <Page size="A4" style={epStyles.page}>
                <EstimateProformaBody data={{ ...data, docType: "estimate" }} />
            </Page>
        </Document>
    );
}