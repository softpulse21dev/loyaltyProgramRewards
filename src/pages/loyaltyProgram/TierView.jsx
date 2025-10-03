import { BlockStack, Box, Button, Card, DropZone, Grid, Icon, Layout, LegacyStack, Page, RadioButton, Text, TextField, Thumbnail } from '@shopify/polaris'
import { CashDollarIcon, CheckIcon, CurrencyConvertIcon, DeleteIcon, GiftCardIcon, HeartIcon, NoteIcon, RewardIcon, SaveIcon, StarIcon } from '@shopify/polaris-icons';
import React, { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import RedeemModal from '../../components/RedeemModal';
import { fetchData } from '../../action';
import { useDispatch, useSelector } from 'react-redux';
import { removeData } from '../../redux/action';

const TierView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const Data = useSelector((state) => state.merchantSettings.Data);
    console.log('Data', Data)
    const { rule, edit, masterRewardsList, navigateTo } = location.state || {};
    console.log('rule', rule)
    console.log('edit', edit)
    const [vipTierData, setVipTierData] = useState([]);
    const [tierName, setTierName] = useState('');
    const [goalValue, setGoalValue] = useState('');
    const [pointsMultiplier, setPointsMultiplier] = useState('');
    const [selectedIcon, setSelectedIcon] = useState("default");
    const [active, setActive] = useState(false);
    const [files, setFiles] = useState([]);


    const AddVipTierAPI = async () => {
        try {
            const formData = new FormData();
            formData.append("title", tierName);
            formData.append("points", goalValue);
            formData.append("multiplier", pointsMultiplier);
            formData.append("edit", '');
            formData.append("icon", files[0]);
            formData.append("icon_type", selectedIcon);
            formData.append("benefits", '');
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

    const DeleteVipTierAPI = async (tierId) => {
        try {
            const formData = new FormData();
            formData.append("delete", tierId);
            const response = await fetchData("/delete-tier", formData);
            console.log('response', response);
            if (response.status) {
                navigate('/loyaltyProgram', { state: { navigateTo: 3 } });
                shopify.toast.show(response?.message, { duration: 2000 });
            } else {
                shopify.toast.show(response?.message, { duration: 2000, isError: true });
            }
        } catch (error) {
            console.error('Error deleting VIP tier:', error);
            shopify.toast.show(error?.message, { duration: 2000, isError: true });
        } finally {
            // setLoading(false);
        }
    }

    const handleDropZoneDrop = useCallback(
        (_droppedFiles, acceptedFiles, rejectedFiles) => {
            // Log the accepted files to the console
            console.log('Accepted Files on Drop:', acceptedFiles);
            if (rejectedFiles.length > 0) {
                // Show an error toast if any files were rejected
                shopify.toast.show('Only .gif, .jpg, and .png files are accepted.', { duration: 3000, isError: true });
            }
            // Set the state with the valid, accepted files
            setFiles(acceptedFiles);
        },
        [],
    );
    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

    const uploadedFiles = files.length > 0 && (
        <div style={{ padding: '1rem' }}>
            <LegacyStack vertical>
                {files.map((file, index) => (
                    <>
                        {console.log(`File object from state at index ${index}:`, file)}
                        <LegacyStack alignment="center" key={index} distribution="equalSpacing">
                            <Box alignment="center" style={{ width: '90%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Thumbnail
                                    size="small"
                                    alt={file.name}
                                    source={
                                        validImageTypes.includes(file.type)
                                            ? window.URL.createObjectURL(file)
                                            : NoteIcon
                                    }
                                />
                                <Box style={{ gap: 10, marginLeft: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        {file.name}{' '}
                                        <Text variant="bodySm" as="p">
                                            {file.size} bytes
                                        </Text>
                                    </Box>
                                    <Button
                                        variant="plain"
                                        icon={DeleteIcon}
                                        accessibilityLabel="Remove file"
                                        onClick={(event) => {
                                            // Stop the click from bubbling up to the DropZone
                                            event.stopPropagation();
                                            setFiles([]);
                                        }}
                                    />
                                </Box>
                            </Box>
                        </LegacyStack >
                    </>
                ))}
            </LegacyStack>
        </div>
    );

    const fileUpload = !files.length && (
        <DropZone.FileUpload actionHint="Accepts .gif, .jpg, and .png" />
    )

    return (
        <Page
            backAction={{ content: 'Back', onAction: () => { dispatch(removeData()); navigate('/loyaltyProgram', { state: { navigateTo: navigateTo } }) } }}
            title="VIP Tier"
            secondaryActions={edit ? <Button tone='critical' icon={DeleteIcon} onClick={() => { DeleteVipTierAPI(rule?.uid) }}>Delete</Button> : ''}
            primaryAction={{ content: 'Save', onAction: () => { AddVipTierAPI(), navigate('/loyaltyProgram', { state: { navigateTo: navigateTo } }) } }}
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
                                            checked={selectedIcon === "default"}
                                            onChange={() => setSelectedIcon("default")}
                                        />
                                        <div className='icon-size' style={{ display: "flex", maxWidth: "15%", alignItems: "flex-start", justifyContent: "center" }}>
                                            <Icon source={RewardIcon} />
                                        </div>
                                        <RadioButton
                                            label='Custom Icon'
                                            checked={selectedIcon === "custom"}
                                            onChange={() => setSelectedIcon("custom")}
                                        />
                                        <DropZone onDrop={handleDropZoneDrop} variableHeight allowMultiple={false} accept="image/png, image/gif, image/jpeg">
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

            <RedeemModal localSave={true} navigateTo={3} active={active} setActive={setActive} data={masterRewardsList} />
        </Page>
    )
}

export default TierView
