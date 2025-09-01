import { BlockStack, Box, Button, Card, Grid, Icon, Layout, Page, RadioButton, Text, TextField } from '@shopify/polaris'
import { CashDollarIcon, CheckIcon, CurrencyConvertIcon, DeleteIcon, GiftCardIcon, HeartIcon, SaveIcon, StarIcon } from '@shopify/polaris-icons';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import RedeemModal from '../../components/RedeemModal';

const TierView = () => {
    const navigate = useNavigate();
    const [tierName, setTierName] = useState('');
    const [goalValue, setGoalValue] = useState('');
    const [selected, setSelected] = useState("star");
    const [active, setActive] = useState(false);

    const icons = [
        { id: "star", icon: StarIcon },
        { id: "gift", icon: GiftCardIcon },
        { id: "tick", icon: CheckIcon },
        { id: "heart", icon: HeartIcon },
        { id: "trophy", icon: DeleteIcon },
        { id: "cart", icon: CurrencyConvertIcon },
        { id: "cash", icon: CashDollarIcon },
    ];
    return (
        <Page
            backAction={{ content: 'Back', onAction: () => navigate('/loyaltyProgram') }}
            title="VIP Tier"
            secondaryActions={<Button tone='critical' icon={DeleteIcon} onAction={() => { }}>Delete</Button>}
            primaryAction={{ content: 'Save', onAction: () => { } }}
        >
            <Layout>
                <Layout.Section>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 8, xl: 8 }}>
                            <BlockStack gap={400}>
                                <Card>
                                    <BlockStack gap={400}>
                                        <Text variant='headingMd' as="span">Tier Name</Text>
                                        <TextField
                                            value={tierName}
                                            onChange={(value) => setTierName(value)}
                                            maxLength={255}
                                        />
                                    </BlockStack>
                                </Card>

                                <Card>
                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <Text variant='headingMd' as="span">Goal to achieve tier</Text>
                                        <Box style={{ maxWidth: 250 }}>
                                            <TextField
                                                value={goalValue}
                                                type='number'
                                                label='Amount spent since start date'
                                                requiredIndicator={true}
                                                onChange={(value) => setGoalValue(value)}
                                            />
                                        </Box>
                                    </Box>
                                </Card>

                                <Card>
                                    <BlockStack gap={400}>
                                        <Text variant='headingMd' >Rewards to unlock tier</Text>
                                        <Box>
                                            <Button onClick={() => setActive(true)}>Add Reward</Button>
                                        </Box>
                                    </BlockStack>
                                </Card>

                            </BlockStack>
                        </Grid.Cell>

                        <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                            <BlockStack gap={400}>
                                <Card>
                                    <Text variant='headingMd' as="span">Details</Text>
                                    <ul style={{ listStyle: 'inherit', paddingInline: 20 }}>
                                        <li><p>0 amount spent since start date</p></li>
                                        <li><p>0 rewards unlocked</p></li>
                                    </ul>
                                </Card>

                                <Card>
                                    <Text variant="headingMd" as="h2">
                                        Icon
                                    </Text>

                                    {/* Grid container */}
                                    <Box
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(3, 1fr)",
                                            gap: "8px",
                                            marginTop: "16px",
                                        }}
                                    >
                                        {icons.map(({ id, icon }) => (
                                            <Box
                                                key={id}
                                                padding="3"
                                                borderWidth="1"
                                                borderColor={selected === id ? "border-brand" : "border-subdued"}
                                                borderStyle="solid"
                                                borderRadius="200"
                                                background="bg-surface"
                                                onClick={() => setSelected(id)}
                                                style={{ cursor: "pointer", textAlign: "center" }}
                                            >
                                                <RadioButton
                                                    label={<Icon source={icon} />}
                                                    id={id}
                                                    name="icon-select"
                                                    checked={selected === id}
                                                    onChange={() => setSelected(id)}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                </Card>
                            </BlockStack>
                        </Grid.Cell>
                    </Grid>
                </Layout.Section>
            </Layout>

            <RedeemModal active={active} setActive={setActive} />
        </Page>
    )
}

export default TierView
