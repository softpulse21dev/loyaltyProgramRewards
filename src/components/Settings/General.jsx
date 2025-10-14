import {
    Box,
    Button,
    Card,
    Layout,
    TextField,
    BlockStack,
} from "@shopify/polaris";
import { ClipboardIcon } from "@shopify/polaris-icons";
import { useState } from "react";

const General = () => {
    const [accountEmail, setAccountEmail] = useState("example@email.com");
    const [contactNumber, setContactNumber] = useState("+91 123 456 7890");
    const [storeUrl] = useState("kg-store-demo.myshopify.com");
    const [subDomain] = useState("kg-store-demo.myshopify.com");
    const [installDate] = useState("22 Aug 2025 at 2:43 am");

    const handleCopy = () => {
        navigator.clipboard.writeText(subDomain);
    };

    return (
        <Box>
            <Layout.AnnotatedSection
                title="Store details"
                description="Activate/Deactivate your points program"
            >
                <Card>
                    <BlockStack gap="200">
                        <TextField
                            label="Account email"
                            value={accountEmail}
                            onChange={setAccountEmail}
                            placeholder="example@email.com"
                            autoComplete="email"
                            requiredIndicator
                        />

                        <TextField
                            label="Contact number"
                            value={contactNumber}
                            onChange={setContactNumber}
                            placeholder="+91 123 456 7890"
                            autoComplete="tel"
                        />

                        <TextField
                            label="Installation date"
                            value={installDate}
                            disabled
                            helpText=""
                        />

                        <TextField
                            label="Store URL"
                            value={storeUrl}
                            disabled
                        />

                        <TextField
                            label="Sub domain"
                            value={subDomain}
                            disabled
                            connectedRight={
                                <Button
                                    icon={ClipboardIcon}
                                    onClick={handleCopy}
                                    variant="secondary"
                                >
                                    Copy
                                </Button>
                            }
                        />
                    </BlockStack>
                </Card>
            </Layout.AnnotatedSection>
        </Box>
    );
};

export default General;
