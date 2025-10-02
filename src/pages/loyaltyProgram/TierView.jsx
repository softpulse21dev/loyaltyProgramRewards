import { BlockStack, Box, Button, Card, DropZone, Grid, Icon, Layout, LegacyStack, Page, RadioButton, Text, TextField, Thumbnail } from '@shopify/polaris'
import { CashDollarIcon, CheckIcon, CurrencyConvertIcon, DeleteIcon, GiftCardIcon, HeartIcon, NoteIcon, RewardIcon, SaveIcon, StarIcon } from '@shopify/polaris-icons';
import React, { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import RedeemModal from '../../components/RedeemModal';

const TierView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { rule, edit } = location.state || {};
    console.log('rule', rule)
    console.log('edit', edit)
    const [tierName, setTierName] = useState('');
    const [goalValue, setGoalValue] = useState('');
    const [pointsMultiplier, setPointsMultiplier] = useState('');
    const [selected, setSelected] = useState("default");
    const [active, setActive] = useState(false);
    const [files, setFiles] = useState([]);

    const AddVipTierAPI = async () => {
        try {
            const formData = new FormData();
            formData.append("title", tierName);
            formData.append("points", goalValue);
            formData.append("multiplier", pointsMultiplier);
            formData.append("edit", selectedTierProgressExpiry);
            formData.append("icon", selectedTierProgressExpiry);
            formData.append("benefits", selectedTierProgressExpiry);
            const response = await fetchData("/add-vip-tier", formData);
            console.log('response', response);
            if (response.status && response.data) {
                setVipTierData(response.data);
                shopify.toast.show(response?.message, { duration: 2000 });
            }
            else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Error adding VIP tier:', error);
        } finally {
            // setLoading(false);
        }
    }

    const handleDropZoneDrop = useCallback(
        (_dropFiles, acceptedFiles) => {
            setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
        },
        [],
    );
    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

    const uploadedFiles = files.length > 0 && (
        <div style={{ padding: '1rem' }}>
            <LegacyStack vertical>
                {files.map((file, index) => (
                    <LegacyStack alignment="center" key={index}>
                        <Thumbnail
                            size="small"
                            alt={file.name}
                            source={
                                validImageTypes.includes(file.type)
                                    ? window.URL.createObjectURL(file)
                                    : NoteIcon
                            }
                        />
                        <div>
                            {file.name}{' '}
                            <Text variant="bodySm" as="p">
                                {file.size} bytes
                            </Text>
                        </div>
                    </LegacyStack>
                ))}
            </LegacyStack>
        </div>
    );

    const fileUpload = !files.length && (
        <DropZone.FileUpload actionHint="Accepts .gif, .jpg, and .png" />
    )

    return (
        <Page
            backAction={{ content: 'Back', onAction: () => navigate('/loyaltyProgram') }}
            title="VIP Tier"
            secondaryActions={edit ? <Button tone='critical' icon={DeleteIcon} onAction={() => { }}>Delete</Button> : ''}
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
                                        <Box style={{ maxWidth: 300 }}>
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
                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <Text variant='headingMd' as="span">Points Multiplier</Text>
                                        <Box style={{ maxWidth: 300 }}>
                                            <TextField
                                                value={pointsMultiplier}
                                                type='number'
                                                label='Points earned will be multiplied by this value'
                                                requiredIndicator={true}
                                                onChange={(value) => setPointsMultiplier(value)}
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

                                    <Box
                                        style={{
                                            display: "grid",
                                            gap: "8px",
                                            marginTop: "8px",
                                        }}
                                    >
                                        <RadioButton
                                            label={'Default Icon'}
                                            checked={selected === "default"}
                                            onChange={() => setSelected("default")}
                                        />
                                        <div className='icon-size' style={{ display: "flex", maxWidth: "15%", alignItems: "flex-start", justifyContent: "center" }}>
                                            <Icon source={RewardIcon} />
                                        </div>
                                        <RadioButton
                                            label='Custom Icon'
                                            checked={selected === "custom"}
                                            onChange={() => setSelected("custom")}
                                        />
                                        <DropZone onDrop={handleDropZoneDrop} variableHeight>
                                            {uploadedFiles}
                                            {fileUpload}
                                        </DropZone>
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
