import { Box, Button, Card, Layout, TextField, BlockStack, InlineStack, Tag, Select, Text, } from "@shopify/polaris";
import { ClipboardIcon } from "@shopify/polaris-icons";
import { useState, useCallback } from "react";
import ResetPointsModal from "../ResetPointsModal";

const General = () => {
    const [accountEmail, setAccountEmail] = useState("example@email.com");
    const [contactNumber, setContactNumber] = useState("+91 123 456 7890");
    const [storeUrl] = useState("kg-store-demo.myshopify.com");
    const [subDomain] = useState("kg-store-demo.myshopify.com");
    const [installDate] = useState("22 Aug 2025 at 2:43 am");
    const [currency, setCurrency] = useState("USD");

    const [excludeTags, setExcludeTags] = useState([]);
    const [currTagInput, setCurrTagInput] = useState("");

    const [tagInputError, setTagInputError] = useState("");
    const [resetPointsModalActive, setResetPointsModalActive] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(subDomain);
    };

    const handleTagInputChange = useCallback((newValue) => {
        setCurrTagInput(newValue);
        if (tagInputError) {
            setTagInputError(""); // Clear error when user tries to fix it
        }
    }, [tagInputError]);

    const handleAddExcludeTag = useCallback(() => {
        const trimmedTag = currTagInput.trim();

        if (!trimmedTag) {
            setTagInputError("Tag cannot be empty");
            return;
        }

        if (excludeTags.includes(trimmedTag)) {
            setTagInputError("Tag already exists");
            return;
        }

        setExcludeTags((prev) => [...prev, trimmedTag]);
        setCurrTagInput("");
        setTagInputError("");
    }, [currTagInput, excludeTags]);

    const handleRemoveTag = useCallback((tagToRemove) => {
        setExcludeTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    }, []);

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
                            autoComplete="email"
                            requiredIndicator
                        />
                        <TextField
                            label="Contact number"
                            value={contactNumber}
                            onChange={setContactNumber}
                            autoComplete="tel"
                        />
                        <Select
                            label='Store Currency'
                            options={[
                                { label: 'USD - US Dollar', value: 'USD' },
                                { label: 'EUR - Euro', value: 'EUR' },
                                { label: 'GBP - British Pound', value: 'GBP' },
                                { label: 'INR - Indian Rupee', value: 'INR' },
                            ]}
                            value={currency}
                            onChange={setCurrency}
                        />
                        <TextField
                            label="Installation date"
                            value={installDate}
                            disabled
                            autoComplete="off"
                        />
                        <TextField
                            label="Store URL"
                            value={storeUrl}
                            disabled
                            autoComplete="off"
                        />
                        <TextField
                            label="Sub domain"
                            value={subDomain}
                            disabled
                            autoComplete="off"
                            connectedRight={
                                <Button icon={ClipboardIcon} onClick={handleCopy} variant="secondary">
                                    Copy
                                </Button>
                            }
                        />
                    </BlockStack>
                </Card>
            </Layout.AnnotatedSection>

            <Layout.AnnotatedSection
                title="Excluded Customers"
                description="Choose tags to prevent selected customers from participating in loyalty Program"
            >
                <Card>
                    <BlockStack gap="400">
                        <TextField
                            label='Define Tags to Exclude'
                            type="text"
                            autoComplete="off"
                            value={currTagInput}
                            onChange={handleTagInputChange}
                            error={tagInputError}
                            connectedRight={
                                <Button onClick={handleAddExcludeTag} variant="primary">
                                    Add
                                </Button>
                            }
                        />

                        {excludeTags.length > 0 && (
                            <InlineStack gap="200" wrap>
                                {excludeTags.map((tag) => (
                                    <Tag key={tag} onRemove={() => handleRemoveTag(tag)}>
                                        {tag}
                                    </Tag>
                                ))}
                            </InlineStack>
                        )}
                    </BlockStack>
                </Card>
            </Layout.AnnotatedSection>

            <Layout.AnnotatedSection
                title="Reset Customer Points"
                description="This will remove all customer points and activity history, allowing you to start fresh with your loyalty program."
            >
                <Card>
                    <BlockStack gap={200}>
                        <Text fontWeight="bold">Reset Customer Points</Text>
                        <Text>This action will reset all customer points and activity history. This is useful when you want to start fresh with your loyalty program.</Text>
                        <Text tone="caution">This action cannot be undone. All customer data will be permanently reset.</Text>
                        <Box>
                            <Button tone="critical" variant="primary" onClick={() => setResetPointsModalActive(true)}>Reset All Customer Points</Button>
                        </Box>
                    </BlockStack>
                </Card>
            </Layout.AnnotatedSection>

            <ResetPointsModal
                active={resetPointsModalActive}
                setActive={setResetPointsModalActive}
            />
        </Box >
    );
};

export default General;