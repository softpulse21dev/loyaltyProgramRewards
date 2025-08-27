import {
    Card,
    Layout,
    Button,
    Text,
    Box,
} from "@shopify/polaris";

export default function StoreCredit() {

    return (
        <div>
            <Layout.AnnotatedSection
                title={'Loyalty program status'}
                description={'Activate/Deactivate your points program'}
            >
                <Card>
                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Text variant="headingMd">This feature is Deactivated</Text>
                        <Button primary>Activate</Button>
                    </Box>
                </Card>
            </Layout.AnnotatedSection>
        </div>
    );
}
