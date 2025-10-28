import { BlockStack, Box, Button, Card, DropZone, Grid, Icon, Layout, LegacyStack, Page, RadioButton, ResourceItem, ResourceList, Text, TextField, Thumbnail } from '@shopify/polaris'
import { CashDollarIcon, CheckIcon, CurrencyConvertIcon, DeleteIcon, GiftCardIcon, HeartIcon, NoteIcon, RewardIcon, SaveIcon, StarIcon } from '@shopify/polaris-icons';
import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import RedeemModal from '../../components/RedeemModal';
import { fetchData } from '../../action';
import { useDispatch, useSelector } from 'react-redux';
import { ClearTierFormData, SetData, UpdateData, UpdateTierFormData } from '../../redux/action';
import { iconsMap } from '../../utils';
import SvgPreview from '../../components/SvgPreview';

const TierView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const tierFormData = useSelector((state) => state.merchantSettings.tierFormData);
    const { uid, tierName, goalValue, pointsMultiplier, selectedIcon, files, status } = tierFormData;
    const Data = useSelector((state) => state.merchantSettings.Data);
    const masterRewardsList = useSelector((state) => state.merchantSettings.masterRewardsList);
    const vipTierData = useSelector((state) => state.merchantSettings.vipTierData);
    const [validation, setValidation] = useState({
        tierName: '',
        goalValue: '',
        pointsMultiplier: '',
        files: '',
        iconType: '',
    });
    console.log('vipTierData tierview', vipTierData)

    console.log('Data', Data)
    const { rule, edit, navigateTo } = location.state || {};
    console.log('rule', rule)
    console.log('edit', edit)
    const [active, setActive] = useState(false);
    const tierId = useSelector((state) => state.merchantSettings.tierId);
    console.log('tierId', tierId)

    // 3. Initialize the form data on load
    useEffect(() => {
        const currentTier = tierId ? vipTierData?.find((item) => item.uid === tierId) : null;

        // Condition: Only initialize the form IF:
        // 1. We are in edit mode (currentTier exists)
        // 2. AND the form data in Redux is NOT for the current tier (uid mismatch)
        if (currentTier && currentTier.uid !== uid) {
            const iconData = currentTier.icon;
            const initialFiles = (iconData && typeof iconData === 'object' && iconData.url)
                ? [{ name: iconData.file_name, preview: iconData.url }]
                : [];
            console.log('initialFiles', initialFiles)

            // Dispatch the form data, INCLUDING the uid
            dispatch(UpdateTierFormData({
                uid: currentTier.uid, // <-- Store the ID in the form state
                tierName: currentTier.title || '',
                goalValue: currentTier.points_needed || '',
                pointsMultiplier: currentTier.points_multiply || '',
                selectedIcon: currentTier.icon_type || 'default',
                files: initialFiles,
            }));
            console.log('currentTier.benefits', currentTier.benefits)
            // Also, initialize the rewards list for this tier
            // NOTE: You'll need a 'setData' action that REPLACES the 'Data' array.
            dispatch(SetData(currentTier.benefits || []));
        }
    }, [tierId, vipTierData, dispatch, uid]); // <-- Add 'uid' to the dependency array

    const handleBackAction = () => {
        dispatch(ClearTierFormData());
        navigate('/loyaltyProgram', { state: { navigateTo: navigateTo } });
    };

    const handleValidation = () => {
        // Create a new object to hold this validation pass's errors
        const newErrors = {};
        let isError = false;

        if (!tierFormData?.tierName) {
            newErrors.tierName = 'Tier name is required';
            isError = true;
        }
        if (!tierFormData?.goalValue) {
            newErrors.goalValue = 'Goal value is required';
            isError = true;
        }
        if (!tierFormData?.pointsMultiplier) {
            newErrors.pointsMultiplier = 'Points multiplier is required';
            isError = true;
        }
        console.log('tierFormData?.selectedIcon', tierFormData?.selectedIcon)
        console.log('tierFormData?.files', tierFormData?.files)
        if (tierFormData?.selectedIcon === 'custom') {
            if (tierFormData?.files.length === 0) {
                newErrors.files = 'Please upload an icon before proceeding.';
                isError = true;
            }
        }

        // Call setValidation only ONCE with the complete error object
        setValidation(newErrors);
        return isError;
    };


    const AddVipTierAPI = async () => {
        if (handleValidation()) {
            return;
        }
        try {
            const formData = new FormData();
            formData.append("title", tierName);
            formData.append("points", goalValue);
            formData.append("multiplier", pointsMultiplier);
            formData.append("icon_type", selectedIcon);
            formData.append("benefits", JSON.stringify(Data));
            if (files && files.length > 0 && files[0] instanceof File) {
                formData.append("icon", files[0]);
            }
            if (tierId) {
                formData.append("edit", tierId);
            } else {
                formData.append("edit", '');
            }
            const response = await fetchData("/tier-add", formData);
            console.log('response', response);
            if (response.status) {
                handleBackAction();
                // shopify.toast.show(response?.message, { duration: 2000 });
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
                handleBackAction();
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

    const handleRewardStatusChange = useCallback((reward, newStatus) => {
        const updatedReward = { ...reward, status: newStatus };
        dispatch(UpdateData(updatedReward));
    }, [dispatch]);

    const handleDropZoneDrop = useCallback(
        (_droppedFiles, acceptedFiles, _rejectedFiles) => {
            console.log('acceptedFiles', acceptedFiles[0])
            if (_rejectedFiles.length > 0) {
                shopify.toast.show('Only .svg, .jpg, and .png files are accepted.', { duration: 2000, isError: true });
            }
            // Dispatch update to Redux, not local state
            dispatch(UpdateTierFormData({ ...tierFormData, files: acceptedFiles }));
        },
        [tierFormData, dispatch], // Add tierFormData and dispatch to dependencies
    );
    const validImageTypes = ['image/svg', 'image/jpeg', 'image/png'];

    const uploadedFiles = files && files.length > 0 && (
        <div style={{ padding: '1rem' }}>
            <LegacyStack vertical>
                {files.map((file, index) => {
                    const isRealFile = file instanceof File;

                    // --- START OF FIX ---
                    // For newly uploaded files, determine how to render the thumbnail
                    let thumbnail;
                    if (isRealFile) {
                        if (file.type === 'image/svg+xml') {
                            // Use our special component for SVG previews
                            thumbnail = <SvgPreview file={file} />;
                        } else if (validImageTypes.includes(file.type)) {
                            // For PNG/JPG, createObjectURL is fine
                            const imageUrl = window.URL.createObjectURL(file);
                            thumbnail = <Thumbnail size="small" alt={file.name} source={imageUrl} />;
                        } else {
                            // For other file types, use the note icon
                            thumbnail = <Thumbnail size="small" alt={file.name} source={NoteIcon} />;
                        }
                    } else {
                        // For files already saved (not a File object), use the provided URL
                        thumbnail = <Thumbnail size="small" alt={file.name} source={file.preview} />;
                    }

                    return (
                        <Box alignment="center" style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                            {thumbnail}
                            <Box style={{ width: '100%', marginLeft: 10, wordBreak: 'break-word' }}>
                                <Text variant="bodyMd" as="span">{file.name}{' '}</Text>
                                {isRealFile && (
                                    <Text variant="bodySm" as="p">{file.size} bytes</Text>
                                )}
                            </Box>
                            <Box style={{ gap: 10, marginLeft: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Button
                                    variant="plain"
                                    icon={DeleteIcon}
                                    accessibilityLabel="Remove file"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        dispatch(UpdateTierFormData({ ...tierFormData, files: [] }));
                                    }}
                                />
                            </Box>
                        </Box>
                    );
                })}
            </LegacyStack>
        </div>
    );
    const fileUpload = !files.length && (
        <DropZone.FileUpload actionHint="Accepts .svg, .jpg, and .png" />
    )

    return (
        <Page
            backAction={{ content: 'Back', onAction: () => { handleBackAction() } }}
            title="VIP Tier"
            secondaryActions={edit ? <Button tone='critical' icon={DeleteIcon} onClick={() => { DeleteVipTierAPI(rule?.uid) }}>Delete</Button> : ''}
            primaryAction={{ content: 'Save', onAction: () => { AddVipTierAPI() } }}
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
                                            onChange={(value) => dispatch(UpdateTierFormData({ ...tierFormData, tierName: value }), setValidation({ ...validation, tierName: '' }))}
                                            maxLength={255}
                                            error={validation.tierName}
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
                                                onChange={(value) => dispatch(UpdateTierFormData({ ...tierFormData, goalValue: value }), setValidation({ ...validation, goalValue: '' }))}
                                                error={validation.goalValue}
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
                                                onChange={(value) => dispatch(UpdateTierFormData({ ...tierFormData, pointsMultiplier: value }), setValidation({ ...validation, pointsMultiplier: '' }))}
                                                error={validation.pointsMultiplier}
                                            />
                                        </Box>
                                    </Box>
                                </Card>

                                <Card>
                                    <BlockStack gap={400}>
                                        <Text variant='headingMd'>Rewards to unlock tier</Text>
                                        <div className='icon-size'>
                                            <ResourceList
                                                resourceName={{ singular: "rule", plural: "rules" }}
                                                items={Data || []}
                                                renderItem={(item) => {
                                                    const { clientId, title, points, icon, status } = item;
                                                    const IconSource = iconsMap[icon];
                                                    return (
                                                        <ResourceItem key={clientId}>
                                                            <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                                    <Icon source={IconSource} />
                                                                    <Box>
                                                                        <Text variant="bodyMd">{title}</Text>
                                                                        <Text variant="bodyMd">{points} points</Text>
                                                                    </Box>
                                                                </Box>
                                                                <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                                    <Button variant="plain" onClick={() => navigate(`/loyaltyProgram/CouponPage`, { state: { rule: item, edit: true, localSave: true, isTierRewardEdit: true, navigateTo: 2 } })}>Edit</Button>
                                                                    <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <label className="switch">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={status === true}
                                                                                onChange={(e) =>
                                                                                    handleRewardStatusChange(item, e.target.checked)
                                                                                }
                                                                            />
                                                                            <span className="slider"></span>
                                                                        </label>
                                                                    </div>
                                                                </Box>
                                                            </Box>
                                                        </ResourceItem>
                                                    );
                                                }}
                                            />
                                        </div>
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
                                            onChange={() => dispatch(UpdateTierFormData({ ...tierFormData, selectedIcon: 'default' }))}
                                        />
                                        <div className='icon-size' style={{ display: "flex", maxWidth: "15%", alignItems: "flex-start", justifyContent: "center" }}>
                                            <Icon source={RewardIcon} />
                                        </div>
                                        <RadioButton
                                            label='Custom Icon'
                                            checked={selectedIcon === "custom"}
                                            onChange={() => dispatch(UpdateTierFormData({ ...tierFormData, selectedIcon: 'custom' }))}
                                        />
                                        <DropZone onDrop={handleDropZoneDrop} variableHeight allowMultiple={false} accept="image/png, image/jpeg, image/svg+xml">
                                            {uploadedFiles}
                                            {fileUpload}
                                        </DropZone>
                                        {validation.files && <Text variant="bodySm" as="p" tone="critical">{validation.files}</Text>}
                                    </Box>
                                </Card>
                            </BlockStack>
                        </Grid.Cell>
                    </Grid>
                </Layout.Section>
            </Layout>

            <RedeemModal localSave={true} navigateTo={2} active={active} setActive={setActive} data={masterRewardsList} />
        </Page>
    )
}

export default TierView
